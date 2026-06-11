/**
 * SubjectMaster.jsx
 * Folder: src/pages/Configuration/SubjectMaster.jsx
 *
 * Converts legacy ASPX "Define Subject" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Add subject (name + code + practical flag)
 *  - Edit subject inline via modal/drawer
 *  - GridView → desktop table + mobile cards
 *  - Validation with inline error messages
 *  - Toast notifications
 *  - Loading states, empty states
 *  - Mobile bottom-sheet form
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BookOpen, Plus, RefreshCw, Search, Edit2, Trash2,
  X, Check, AlertCircle, Loader2, ChevronDown,
  FlaskConical, BookMarked, Code2, Info,
  SlidersHorizontal, ChevronRight, Eye, EyeOff,
  Settings, LayoutGrid, List
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const INITIAL_SUBJECTS = [
  { id: 1,  Subject: 'Mathematics',        Subject_code: 'MATH01',  practical: 'N' },
  { id: 2,  Subject: 'Physics',            Subject_code: 'PHY01',   practical: 'Y' },
  { id: 3,  Subject: 'Chemistry',          Subject_code: 'CHEM01',  practical: 'Y' },
  { id: 4,  Subject: 'Biology',            Subject_code: 'BIO01',   practical: 'Y' },
  { id: 5,  Subject: 'English',            Subject_code: 'ENG01',   practical: 'N' },
  { id: 6,  Subject: 'Hindi',              Subject_code: 'HIN01',   practical: 'N' },
  { id: 7,  Subject: 'Computer Science',   Subject_code: 'CS01',    practical: 'Y' },
  { id: 8,  Subject: 'History',            Subject_code: 'HIST01',  practical: 'N' },
  { id: 9,  Subject: 'Geography',          Subject_code: 'GEO01',   practical: 'N' },
  { id: 10, Subject: 'Economics',          Subject_code: 'ECO01',   practical: 'N' },
  { id: 11, Subject: 'Physical Education', Subject_code: 'PE01',    practical: 'Y' },
  { id: 12, Subject: 'Sanskrit',           Subject_code: 'SAN01',   practical: 'N' },
  { id: 13, Subject: 'Accountancy',        Subject_code: 'ACC01',   practical: 'N' },
  { id: 14, Subject: 'Business Studies',   Subject_code: 'BS01',    practical: 'N' },
  { id: 15, Subject: 'Fine Arts',          Subject_code: 'FA01',    practical: 'Y' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const SUBJECT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
  { fg: '#9333ea', bg: '#f3e8ff' },
]
const subjectColor = (name = '') =>
  SUBJECT_COLORS[(name.charCodeAt(0) ?? 0) % SUBJECT_COLORS.length]

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

let nextId = INITIAL_SUBJECTS.length + 1

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────

/** Inline text input */
function TextInput({ value, onChange, placeholder, error, disabled, className = '' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
        ${className}`}
    />
  )
}

/** Form field wrapper with label + error */
function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
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

/** Yes/No radio group */
function PracticalRadio({ value, onChange }) {
  return (
    <div className="flex gap-3">
      {[{ val: 'Y', label: 'Yes', color: 'emerald' }, { val: 'N', label: 'No', color: 'slate' }].map(opt => (
        <label
          key={opt.val}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-all select-none text-[13px] font-semibold
            ${value === opt.val
              ? opt.color === 'emerald'
                ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/70 dark:text-emerald-400'
                : 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/70 dark:text-blue-400'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-400'
            }`}
        >
          <input
            type="radio"
            className="sr-only"
            value={opt.val}
            checked={value === opt.val}
            onChange={() => onChange(opt.val)}
          />
          {opt.val === 'Y'
            ? <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" />
            : <BookMarked className="w-3.5 h-3.5 flex-shrink-0" />
          }
          {opt.label}
        </label>
      ))}
    </div>
  )
}

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100"><X className="w-4 h-4" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

/** Practical badge */
function PracticalBadge({ value }) {
  return value === 'Y' ? (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
      <FlaskConical className="w-3 h-3" /> Yes
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
      <BookMarked className="w-3 h-3" /> No
    </span>
  )
}

// ─── SUMMARY STATS ────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const cls = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cls[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── ADD/EDIT FORM ────────────────────────────────────────────────────────────
function SubjectForm({ initial, onSubmit, onReset, loading, title }) {
  const [name,      setName]      = useState(initial?.Subject      ?? '')
  const [code,      setCode]      = useState(initial?.Subject_code ?? '')
  const [practical, setPractical] = useState(initial?.practical    ?? 'N')
  const [errors,    setErrors]    = useState({})

  const validate = () => {
    const e = {}
    if (!name.trim())  e.name = 'Subject name is required'
    if (!code.trim())  e.code = 'Subject code is required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    onSubmit({ Subject: name.trim(), Subject_code: code.trim(), practical })
  }

  const handleReset = () => {
    setName(''); setCode(''); setPractical('N'); setErrors({})
    onReset?.()
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          {/* Subject Name */}
          <Field label="Subject Name" error={errors.name} required>
            <TextInput
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }}
              placeholder="e.g. Mathematics"
              error={errors.name}
            />
          </Field>

          {/* Subject Code */}
          <Field label="Subject Code" error={errors.code} required>
            <TextInput
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setErrors(p => ({ ...p, code: undefined })) }}
              placeholder="e.g. MATH01"
              error={errors.code}
            />
          </Field>

          {/* Practical */}
          <Field label="Practical Subject">
            <PracticalRadio value={practical} onChange={setPractical} />
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              Select "Yes" if this subject has practical exams
            </p>
          </Field>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Plus className="w-4 h-4" />
              }
              Submit
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center px-3 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ subject, onSave, onClose, loading }) {
  const [name,      setName]      = useState(subject.Subject)
  const [code,      setCode]      = useState(subject.Subject_code)
  const [practical, setPractical] = useState(subject.practical)
  const [errors,    setErrors]    = useState({})

  const validate = () => {
    const e = {}
    if (!name.trim()) e.name = 'Required'
    if (!code.trim()) e.code = 'Required'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSave({ ...subject, Subject: name.trim(), Subject_code: code.trim(), practical })
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal — desktop centered, mobile bottom-sheet */}
      <div
        className="fixed z-50
          inset-x-0 bottom-0 rounded-t-2xl
          sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:-translate-x-1/2 sm:top-1/2 sm:-translate-y-1/2
          sm:w-[520px] sm:rounded-2xl
          bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.25)] shadow-2xl"
        style={{ animation: 'modalIn .25s ease' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Edit Subject</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">ID: {subject.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          <Field label="Subject Name" error={errors.name} required>
            <TextInput
              value={name}
              onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }}
              placeholder="e.g. Mathematics"
              error={errors.name}
            />
          </Field>
          <Field label="Subject Code" error={errors.code} required>
            <TextInput
              value={code}
              onChange={e => { setCode(e.target.value.toUpperCase()); setErrors(p => ({ ...p, code: undefined })) }}
              placeholder="e.g. MATH01"
              error={errors.code}
            />
          </Field>
          <Field label="Practical Subject">
            <PracticalRadio value={practical} onChange={setPractical} />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-md shadow-blue-500/20
              transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Update
          </button>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ subject, idx, onEdit }) {
  const { fg, bg } = subjectColor(subject.Subject)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Subject Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {getInitials(subject.Subject)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{subject.Subject}</span>
        </div>
      </td>

      {/* Subject Code */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-mono font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Code2 className="w-3 h-3" />
          {subject.Subject_code}
        </span>
      </td>

      {/* Practical */}
      <td className="px-4 py-3 text-center">
        <PracticalBadge value={subject.practical} />
      </td>

      {/* Edit */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onEdit(subject)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            border border-blue-100 dark:border-blue-500/20 transition-all active:scale-95"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ subject, idx, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = subjectColor(subject.Subject)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {getInitials(subject.Subject)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {subject.Subject}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Code2 className="w-3 h-3 flex-shrink-0" />
            <span className="font-mono font-semibold">{subject.Subject_code}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <PracticalBadge value={subject.practical} />
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Subject Code</p>
              <p className="text-[15px] font-bold font-mono text-slate-700 dark:text-slate-200">{subject.Subject_code}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Practical</p>
              <div className="mt-0.5"><PracticalBadge value={subject.practical} /></div>
            </div>
          </div>
          <button
            onClick={() => onEdit(subject)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-sm transition-all active:scale-[0.98]"
          >
            <Edit2 className="w-4 h-4" /> Edit Subject
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SubjectMaster() {
  const [subjects,    setSubjects]    = useState(INITIAL_SUBJECTS)
  const [addLoading,  setAddLoading]  = useState(false)
  const [editTarget,  setEditTarget]  = useState(null)   // subject being edited
  const [editLoading, setEditLoading] = useState(false)
  const [search,      setSearch]      = useState('')
  const [filterPrac,  setFilterPrac]  = useState('ALL') // ALL | Y | N
  const [viewMode,    setViewMode]    = useState('table') // table | cards — desktop toggle
  const [toast,       setToast]       = useState(null)
  const [addKey,      setAddKey]      = useState(0) // force-reset form

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Add subject ─────────────────────────────────────────────────────────────
  const handleAdd = useCallback((data) => {
    // Check duplicate code
    if (subjects.some(s => s.Subject_code.toLowerCase() === data.Subject_code.toLowerCase())) {
      showToast(`Code "${data.Subject_code}" already exists.`, 'error')
      return
    }
    setAddLoading(true)
    setTimeout(() => {
      const newSubject = { id: nextId++, ...data }
      setSubjects(p => [...p, newSubject])
      setAddLoading(false)
      setAddKey(k => k + 1)
      showToast(`"${data.Subject}" added successfully.`)
    }, 500)
  }, [subjects])

  // ── Edit subject ─────────────────────────────────────────────────────────────
  const handleSaveEdit = useCallback((updated) => {
    setEditLoading(true)
    setTimeout(() => {
      setSubjects(p => p.map(s => s.id === updated.id ? updated : s))
      setEditLoading(false)
      setEditTarget(null)
      showToast(`"${updated.Subject}" updated.`)
    }, 500)
  }, [])

  // ── Filter + Search ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = subjects
    if (filterPrac !== 'ALL') list = list.filter(s => s.practical === filterPrac)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.Subject.toLowerCase().includes(q) ||
        s.Subject_code.toLowerCase().includes(q)
      )
    }
    return list
  }, [subjects, search, filterPrac])

  // Summary stats
  const totalPractical = subjects.filter(s => s.practical === 'Y').length
  const totalTheory    = subjects.filter(s => s.practical === 'N').length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Subject
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage subjects — add, configure, and edit subject details.
          </p>
        </div>
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1 text-[12px] text-slate-400 dark:text-slate-500 flex-shrink-0">
          <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600 dark:text-slate-300 font-semibold">Define Subject</span>
        </nav>
      </div>

      {/* ── Summary Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={BookOpen}     label="Total Subjects"    value={subjects.length} color="blue"    />
        <StatCard icon={FlaskConical} label="Practical"         value={totalPractical}  color="emerald" />
        <StatCard icon={BookMarked}   label="Theory"            value={totalTheory}     color="violet"  />
      </div>

      {/* ── Add Form ──────────────────────────────────────────────────────── */}
      <SubjectForm
        key={addKey}
        title="Add New Subject"
        onSubmit={handleAdd}
        loading={addLoading}
      />

      {/* ── Subjects List Card ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Subject List</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Practical filter tabs */}
            <div className="flex rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden">
              {[
                { val: 'ALL', label: 'All' },
                { val: 'Y',   label: 'Practical' },
                { val: 'N',   label: 'Theory' },
              ].map(opt => (
                <button
                  key={opt.val}
                  onClick={() => setFilterPrac(opt.val)}
                  className={`px-3 py-1.5 text-[11px] font-bold transition-all
                    ${filterPrac === opt.val
                      ? 'bg-blue-600 text-white dark:bg-indigo-600'
                      : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/[0.04]'
                    }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative w-44 sm:w-52 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
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

            {/* Desktop view toggle */}
            <div className="hidden sm:flex rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1.5 transition-all ${viewMode === 'table' ? 'bg-blue-600 text-white dark:bg-indigo-600' : 'bg-white text-slate-400 hover:bg-slate-50 dark:bg-transparent dark:hover:bg-white/[0.04]'}`}
                title="Table view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`px-2.5 py-1.5 transition-all ${viewMode === 'cards' ? 'bg-blue-600 text-white dark:bg-indigo-600' : 'bg-white text-slate-400 hover:bg-slate-50 dark:bg-transparent dark:hover:bg-white/[0.04]'}`}
                title="Card view"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ── DESKTOP TABLE ─────────────────────────────────────────────── */}
        <div className={`hidden md:block ${viewMode === 'cards' ? '!hidden' : ''}`}>
          {filtered.length === 0 ? (
            <EmptyState search={search} filterPrac={filterPrac} onClear={() => { setSearch(''); setFilterPrac('ALL') }} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Subject Name', 'Subject Code', 'Practical', 'Action'].map((h, i) => (
                      <th
                        key={i}
                        className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap text-left first:text-center last:text-center"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((subj, i) => (
                    <DesktopRow
                      key={subj.id}
                      subject={subj}
                      idx={i + 1}
                      onEdit={setEditTarget}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── DESKTOP CARD GRID ─────────────────────────────────────────── */}
        {viewMode === 'cards' && (
          <div className="hidden md:block p-4">
            {filtered.length === 0 ? (
              <EmptyState search={search} filterPrac={filterPrac} onClear={() => { setSearch(''); setFilterPrac('ALL') }} />
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map((subj, i) => (
                  <DesktopCardView key={subj.id} subject={subj} onEdit={setEditTarget} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── MOBILE CARDS ─────────────────────────────────────────────── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState search={search} filterPrac={filterPrac} onClear={() => { setSearch(''); setFilterPrac('ALL') }} />
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to see details and edit.
              </p>
              {filtered.map((subj, i) => (
                <MobileCard
                  key={subj.id}
                  subject={subj}
                  idx={i + 1}
                  onEdit={setEditTarget}
                />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{subjects.length}</span> subjects
          </p>
          {(search || filterPrac !== 'ALL') && (
            <button
              onClick={() => { setSearch(''); setFilterPrac('ALL') }}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {editTarget && (
        <EditModal
          subject={editTarget}
          onSave={handleSaveEdit}
          onClose={() => setEditTarget(null)}
          loading={editLoading}
        />
      )}

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── DESKTOP CARD VIEW ────────────────────────────────────────────────────────
function DesktopCardView({ subject, onEdit }) {
  const { fg, bg } = subjectColor(subject.Subject)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1e2238] p-4 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between gap-2 mb-3">
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0"
          style={{ background: bg, color: fg }}
        >
          {getInitials(subject.Subject)}
        </span>
        <PracticalBadge value={subject.practical} />
      </div>
      <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight mb-1 truncate">
        {subject.Subject}
      </p>
      <p className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 mb-3">
        <Code2 className="w-3 h-3" />{subject.Subject_code}
      </p>
      <button
        onClick={() => onEdit(subject)}
        className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold
          bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
          border border-blue-100 dark:border-blue-500/20 transition-all active:scale-95"
      >
        <Edit2 className="w-3.5 h-3.5" /> Edit
      </button>
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search, filterPrac, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-4 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <BookOpen className="w-7 h-7 opacity-50" />
      </div>
      <div className="text-center">
        {search || filterPrac !== 'ALL' ? (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No subjects match your filters</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Try a different search or clear the active filters.
            </p>
            <button
              onClick={onClear}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold
                bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20 transition-all"
            >
              <X className="w-3.5 h-3.5" /> Clear filters
            </button>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No subjects added yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Use the form above to add your first subject.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
