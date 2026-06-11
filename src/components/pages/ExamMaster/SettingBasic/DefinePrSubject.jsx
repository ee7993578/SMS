/**
 * DefinePrSubject.jsx
 * Folder: src/pages/Registration/DefinePrSubject.jsx
 *
 * Converts legacy ASPX "Define Practical Subject (XI-XII)" to
 * fully-responsive React + Tailwind.
 *
 * Features:
 *  - Select Class → loads subjects for that class
 *  - Select Subject → maps a Practical Subject to it
 *  - Add button saves mapping to local list
 *  - Table shows already-defined mappings with delete
 *  - Mobile: stacked card layout, drawer-style filter form
 *  - Desktop: classic ERP two-panel layout
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BookOpen, ChevronDown, AlertCircle, X, Check, Loader2,
  Trash2, Plus, RefreshCw, FlaskConical, GraduationCap,
  Info, Search, BookMarked, Building2, SlidersHorizontal,
  LayoutList, CheckCircle2, ClipboardList
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const CLASSES = ['Class XI', 'Class XII']

/** Subject → Practical Subject mapping pool */
const SUBJECTS_MAP = {
  'Class XI': [
    { id: 'S101', name: 'Physics' },
    { id: 'S102', name: 'Chemistry' },
    { id: 'S103', name: 'Biology' },
    { id: 'S104', name: 'Computer Science' },
    { id: 'S105', name: 'Informatics Practices' },
    { id: 'S106', name: 'Geography' },
  ],
  'Class XII': [
    { id: 'S201', name: 'Physics' },
    { id: 'S202', name: 'Chemistry' },
    { id: 'S203', name: 'Biology' },
    { id: 'S204', name: 'Computer Science' },
    { id: 'S205', name: 'Informatics Practices' },
    { id: 'S206', name: 'Geography' },
  ],
}

const PRACTICAL_SUBJECTS_MAP = {
  'Class XI': [
    { id: 'P101', name: 'Physics Practical' },
    { id: 'P102', name: 'Chemistry Practical' },
    { id: 'P103', name: 'Biology Practical' },
    { id: 'P104', name: 'Computer Science Lab' },
    { id: 'P105', name: 'Informatics Lab' },
    { id: 'P106', name: 'Geography Practical' },
  ],
  'Class XII': [
    { id: 'P201', name: 'Physics Practical' },
    { id: 'P202', name: 'Chemistry Practical' },
    { id: 'P203', name: 'Biology Practical' },
    { id: 'P204', name: 'Computer Science Lab' },
    { id: 'P205', name: 'Informatics Lab' },
    { id: 'P206', name: 'Geography Practical' },
  ],
}

/** Initial already-defined mappings (simulates DB records) */
const INITIAL_RECORDS = [
  { id: 1, className: 'Class XI',  subjectId: 'S101', subject: 'Physics',              practicalId: 'P101', practical: 'Physics Practical'      },
  { id: 2, className: 'Class XI',  subjectId: 'S102', subject: 'Chemistry',             practicalId: 'P102', practical: 'Chemistry Practical'     },
  { id: 3, className: 'Class XII', subjectId: 'S201', subject: 'Physics',              practicalId: 'P201', practical: 'Physics Practical'      },
  { id: 4, className: 'Class XII', subjectId: 'S204', subject: 'Computer Science',     practicalId: 'P204', practical: 'Computer Science Lab'    },
]

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────

const CLASS_ACCENT = {
  'Class XI':  { fg: '#7c3aed', bg: '#ede9fe', label: 'XI'  },
  'Class XII': { fg: '#0891b2', bg: '#cffafe', label: 'XII' },
}
const accent = (cls) =>
  CLASS_ACCENT[cls] ?? { fg: '#1d4ed8', bg: '#dbeafe', label: cls?.slice(0, 3) ?? '—' }

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
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <Info className="w-3 h-3 flex-shrink-0" />{hint}
        </p>
      )}
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
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── STATS CARD ───────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }) {
  const map = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${map[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ record, onDelete }) {
  const { fg, bg, label } = accent(record.className)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{record.id}</td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {label}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{record.className}</span>
        </div>
      </td>

      {/* Subject */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[13px] text-slate-700 dark:text-slate-200">{record.subject}</span>
        </div>
      </td>

      {/* Practical Subject */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <FlaskConical className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0" />
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300">
            {record.practical}
          </span>
        </div>
      </td>

      {/* Delete */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onDelete(record.id)}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            text-rose-600 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            transition-all active:scale-95"
          title="Remove mapping"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Remove</span>
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE RECORD CARD ───────────────────────────────────────────────────────

function MobileRecordCard({ record, onDelete }) {
  const { fg, bg, label } = accent(record.className)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Badge */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {label}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{record.className}</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            <BookOpen className="inline w-3 h-3 mr-1 text-blue-500" />
            {record.subject}
          </p>
        </div>

        <button
          onClick={() => onDelete(record.id)}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center
            text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20
            transition-all active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Practical pill */}
      <div className="px-4 pb-3.5 flex items-center gap-2">
        <FlaskConical className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0" />
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[12px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border border-violet-100 dark:border-violet-500/20">
          {record.practical}
        </span>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function DefinePrSubject() {
  // Form state
  const [selectedClass,     setSelectedClass]     = useState('')
  const [selectedSubject,   setSelectedSubject]   = useState('')
  const [selectedPractical, setSelectedPractical] = useState('')
  const [errors,            setErrors]            = useState({})
  const [adding,            setAdding]            = useState(false)

  // Records state
  const [records, setRecords] = useState(INITIAL_RECORDS)
  const [nextId,  setNextId]  = useState(INITIAL_RECORDS.length + 1)

  // UI state
  const [search,      setSearch]      = useState('')
  const [filterClass, setFilterClass] = useState('')
  const [toast,       setToast]       = useState(null)

  // ── Derived options ──────────────────────────────────────────────────────
  const subjects          = selectedClass ? (SUBJECTS_MAP[selectedClass]          ?? []) : []
  const practicalSubjects = selectedClass ? (PRACTICAL_SUBJECTS_MAP[selectedClass] ?? []) : []

  // ── Filtered records ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = records
    if (filterClass) list = list.filter(r => r.className === filterClass)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r =>
        r.subject.toLowerCase().includes(q) ||
        r.practical.toLowerCase().includes(q) ||
        r.className.toLowerCase().includes(q)
      )
    }
    return list
  }, [records, filterClass, search])

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   records.length,
    classXI: records.filter(r => r.className === 'Class XI').length,
    classXII:records.filter(r => r.className === 'Class XII').length,
  }), [records])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleClassChange = (cls) => {
    setSelectedClass(cls)
    setSelectedSubject('')
    setSelectedPractical('')
    setErrors(p => ({ ...p, class: undefined }))
  }

  // ── Add mapping ──────────────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    const err = {}
    if (!selectedClass)     err.class     = 'Please select a class'
    if (!selectedSubject)   err.subject   = 'Please select a subject'
    if (!selectedPractical) err.practical = 'Please select a practical subject'

    // Duplicate check
    if (!Object.keys(err).length) {
      const dup = records.find(
        r => r.className === selectedClass && r.subjectId === selectedSubject
      )
      if (dup) err.subject = 'This subject is already mapped for the selected class'
    }

    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setAdding(true)

    // Simulate API call
    setTimeout(() => {
      const subjectObj   = subjects.find(s => s.id === selectedSubject)
      const practicalObj = practicalSubjects.find(p => p.id === selectedPractical)

      const newRecord = {
        id:          nextId,
        className:   selectedClass,
        subjectId:   selectedSubject,
        subject:     subjectObj?.name   ?? '',
        practicalId: selectedPractical,
        practical:   practicalObj?.name ?? '',
      }

      setRecords(prev => [...prev, newRecord])
      setNextId(p => p + 1)

      // Reset form selects (keep class selected for convenience)
      setSelectedSubject('')
      setSelectedPractical('')
      setAdding(false)
      showToast(`Mapped "${subjectObj?.name}" → "${practicalObj?.name}" for ${selectedClass}.`)
    }, 600)
  }, [selectedClass, selectedSubject, selectedPractical, subjects, practicalSubjects, records, nextId])

  // ── Delete mapping ───────────────────────────────────────────────────────
  const handleDelete = useCallback((id) => {
    const rec = records.find(r => r.id === id)
    setRecords(prev => prev.filter(r => r.id !== id))
    showToast(`Removed "${rec?.subject}" mapping.`, 'error')
  }, [records])

  // ── Reset form ───────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedClass('')
    setSelectedSubject('')
    setSelectedPractical('')
    setErrors({})
  }

  return (
    <div className="space-y-5 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          Define Practical Subject
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Map theory subjects to their practical counterparts for Class XI &amp; XII.
        </p>
      </div>

      {/* ── Stats Row ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={ClipboardList}  label="Total Mappings" value={stats.total}    color="blue"    />
        <StatCard icon={GraduationCap}  label="Class XI"       value={stats.classXI}  color="violet"  />
        <StatCard icon={BookMarked}     label="Class XII"      value={stats.classXII} color="cyan"    />
      </div>

      {/* ── FORM CARD ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
          <Plus className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Add Mapping</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Class XI – XII only</span>
        </div>

        <div className="p-5">
          {/* Info banner */}
          <div className="flex items-start gap-2.5 mb-5 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/[0.07] border border-blue-100 dark:border-blue-500/20">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-blue-700 dark:text-blue-300">
              Select the <strong>Class</strong>, then pick the <strong>Theory Subject</strong> and its corresponding <strong>Practical Subject</strong>. Click <strong>Add Mapping</strong> to save.
            </p>
          </div>

          {/* ── FORM FIELDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">

            {/* Select Class */}
            <Field label="Select Class" error={errors.class} required>
              <NativeSelect
                value={selectedClass}
                onChange={e => handleClassChange(e.target.value)}
                placeholder="-- Select Class --"
                error={errors.class}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Select Subject */}
            <Field
              label="Subject"
              error={errors.subject}
              required
              hint={!selectedClass ? 'Select a class first' : undefined}
            >
              <NativeSelect
                value={selectedSubject}
                onChange={e => { setSelectedSubject(e.target.value); setErrors(p => ({ ...p, subject: undefined })) }}
                placeholder="-- Select Subject --"
                error={errors.subject}
                disabled={!selectedClass}
              >
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Select Practical Subject */}
            <Field
              label="Practical Subject"
              error={errors.practical}
              required
              hint={!selectedClass ? 'Select a class first' : undefined}
            >
              <NativeSelect
                value={selectedPractical}
                onChange={e => { setSelectedPractical(e.target.value); setErrors(p => ({ ...p, practical: undefined })) }}
                placeholder="-- Select Practical Subject --"
                error={errors.practical}
                disabled={!selectedClass}
              >
                {practicalSubjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Preview pill when all selected */}
          {selectedClass && selectedSubject && selectedPractical && (
            <div className="mt-4 flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.07] border border-emerald-100 dark:border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">Ready to map:</span>
              <span className="px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-white dark:bg-emerald-500/10 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-emerald-500/20">
                {selectedClass}
              </span>
              <span className="text-slate-400">→</span>
              <span className="px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 border border-blue-100 dark:border-blue-500/20">
                {subjects.find(s => s.id === selectedSubject)?.name}
              </span>
              <span className="text-slate-400">→</span>
              <span className="px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border border-violet-100 dark:border-violet-500/20">
                {practicalSubjects.find(p => p.id === selectedPractical)?.name}
              </span>
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-500/20
              transition-all active:scale-95 disabled:opacity-70"
          >
            {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Mapping
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* ── RECORDS CARD ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <LayoutList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Defined Mappings</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Filters: class + search */}
          <div className="flex gap-2 flex-wrap sm:flex-nowrap">
            {/* Class filter */}
            <div className="w-full sm:w-36 flex-shrink-0">
              <div className="relative">
                <select
                  value={filterClass}
                  onChange={e => setFilterClass(e.target.value)}
                  className="w-full appearance-none pl-2.5 pr-7 py-1.5 text-[12px] rounded-lg border outline-none
                    bg-white text-slate-700 border-slate-200 dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 cursor-pointer transition-all"
                >
                  <option value="">All Classes</option>
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <SlidersHorizontal className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Search */}
            <div className="relative flex-1 min-w-[160px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subject…"
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
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-600">
              <FlaskConical className="w-8 h-8 opacity-30" />
              <p className="text-[13px] font-medium">
                {records.length === 0 ? 'No mappings defined yet.' : 'No records match your search.'}
              </p>
              {records.length === 0 && (
                <p className="text-[12px]">Use the form above to add your first mapping.</p>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Class', 'Subject Name', 'Practical Subject', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12 last:w-24">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec) => (
                  <DesktopRow key={rec.id} record={rec} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
              <FlaskConical className="w-8 h-8 opacity-30" />
              <p className="text-[13px] font-medium">
                {records.length === 0 ? 'No mappings defined yet.' : 'No records match your search.'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap the delete icon to remove a mapping.
              </p>
              {filtered.map(rec => (
                <MobileRecordCard key={rec.id} record={rec} onDelete={handleDelete} />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span> mappings
          </p>
          {(search || filterClass) && (
            <button
              onClick={() => { setSearch(''); setFilterClass('') }}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
