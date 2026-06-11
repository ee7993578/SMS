/**
 * DefineWeightage.jsx
 * Folder: src/pages/ExamMaster/DefineWeightage.jsx
 *
 * Converts legacy ASPX "Define Weightage" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Exam Name (with sub-types), Weightage (editable input)
 * Features:
 *  - Class & Term dropdown filters
 *  - Show report button
 *  - Editable weightage inputs with live total calculation
 *  - Save weightage button
 *  - Report viewer section (placeholder)
 *  - Mobile: stacked card layout with inline editing
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Info, Save,
  FileSpreadsheet, BookOpen,
  GraduationCap, TrendingUp, ClipboardList,
  BarChart3, ChevronRight, Percent,
  LayoutGrid, Settings2, PenLine,
  CheckCircle2, AlertTriangle
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const TERMS = ['Term 1', 'Term 2', 'Annual']

// Exam data per class (exam_id, exam_name, exam_types, weightage)
const EXAM_DATA = {
  'Class IX': {
    'Term 1': [
      { exam_id: 1, exam_name: 'Unit Test 1',      exam_types: ['Written', 'Oral'],             weightage: 10 },
      { exam_id: 2, exam_name: 'Half Yearly',       exam_types: ['Written', 'Practical', 'Project'], weightage: 30 },
      { exam_id: 3, exam_name: 'Activity',          exam_types: ['Activity'],                   weightage: 10 },
    ],
    'Term 2': [
      { exam_id: 4, exam_name: 'Unit Test 2',      exam_types: ['Written', 'Oral'],             weightage: 10 },
      { exam_id: 5, exam_name: 'Annual Exam',       exam_types: ['Written', 'Practical'],       weightage: 40 },
      { exam_id: 6, exam_name: 'Project Work',      exam_types: ['Project'],                    weightage: 10 },
    ],
    'Annual': [
      { exam_id: 1, exam_name: 'Unit Test 1',      exam_types: ['Written', 'Oral'],             weightage: 10 },
      { exam_id: 2, exam_name: 'Half Yearly',       exam_types: ['Written', 'Practical', 'Project'], weightage: 30 },
      { exam_id: 4, exam_name: 'Unit Test 2',      exam_types: ['Written', 'Oral'],             weightage: 10 },
      { exam_id: 5, exam_name: 'Annual Exam',       exam_types: ['Written', 'Practical'],       weightage: 40 },
      { exam_id: 6, exam_name: 'Project Work',      exam_types: ['Project'],                    weightage: 10 },
    ],
  },
  'Class X': {
    'Term 1': [
      { exam_id: 7, exam_name: 'FA 1',             exam_types: ['Written'],                     weightage: 10 },
      { exam_id: 8, exam_name: 'SA 1',             exam_types: ['Written', 'Practical'],       weightage: 40 },
    ],
    'Term 2': [
      { exam_id: 9,  exam_name: 'FA 2',            exam_types: ['Written'],                     weightage: 10 },
      { exam_id: 10, exam_name: 'SA 2',            exam_types: ['Written', 'Practical'],       weightage: 40 },
    ],
    'Annual': [
      { exam_id: 7,  exam_name: 'FA 1',            exam_types: ['Written'],                     weightage: 10 },
      { exam_id: 8,  exam_name: 'SA 1',            exam_types: ['Written', 'Practical'],       weightage: 40 },
      { exam_id: 9,  exam_name: 'FA 2',            exam_types: ['Written'],                     weightage: 10 },
      { exam_id: 10, exam_name: 'SA 2',            exam_types: ['Written', 'Practical'],       weightage: 40 },
    ],
  },
  'Class XI': {
    'Term 1': [
      { exam_id: 11, exam_name: 'Mid Term',        exam_types: ['Written', 'Viva'],             weightage: 30 },
      { exam_id: 12, exam_name: 'Practical 1',     exam_types: ['Practical'],                  weightage: 20 },
    ],
    'Term 2': [
      { exam_id: 13, exam_name: 'Annual Exam',     exam_types: ['Written', 'Practical'],       weightage: 50 },
    ],
    'Annual': [
      { exam_id: 11, exam_name: 'Mid Term',        exam_types: ['Written', 'Viva'],             weightage: 30 },
      { exam_id: 12, exam_name: 'Practical 1',     exam_types: ['Practical'],                  weightage: 20 },
      { exam_id: 13, exam_name: 'Annual Exam',     exam_types: ['Written', 'Practical'],       weightage: 50 },
    ],
  },
  'Class XII': {
    'Term 1': [
      { exam_id: 14, exam_name: 'Pre-Board 1',    exam_types: ['Written'],                      weightage: 20 },
      { exam_id: 15, exam_name: 'Practical',      exam_types: ['Practical', 'Project'],         weightage: 30 },
    ],
    'Term 2': [
      { exam_id: 16, exam_name: 'Pre-Board 2',    exam_types: ['Written'],                      weightage: 20 },
      { exam_id: 17, exam_name: 'Board Exam',     exam_types: ['Written', 'Practical'],        weightage: 30 },
    ],
    'Annual': [
      { exam_id: 14, exam_name: 'Pre-Board 1',    exam_types: ['Written'],                      weightage: 20 },
      { exam_id: 15, exam_name: 'Practical',      exam_types: ['Practical', 'Project'],         weightage: 30 },
      { exam_id: 16, exam_name: 'Pre-Board 2',    exam_types: ['Written'],                      weightage: 20 },
      { exam_id: 17, exam_name: 'Board Exam',     exam_types: ['Written', 'Practical'],        weightage: 30 },
    ],
  },
}

// Default fallback for classes without specific data
const DEFAULT_EXAMS = (term) => [
  { exam_id: 101, exam_name: 'Unit Test',    exam_types: ['Written', 'Oral'],       weightage: 20 },
  { exam_id: 102, exam_name: 'Half Yearly',  exam_types: ['Written', 'Practical'],  weightage: 30 },
  { exam_id: 103, exam_name: 'Annual Exam',  exam_types: ['Written'],               weightage: 50 },
]

// Exam type badge colors
const EXAM_TYPE_COLORS = {
  Written:    { fg: '#1d4ed8', bg: '#dbeafe' },
  Oral:       { fg: '#0891b2', bg: '#cffafe' },
  Practical:  { fg: '#059669', bg: '#d1fae5' },
  Project:    { fg: '#7c3aed', bg: '#ede9fe' },
  Viva:       { fg: '#d97706', bg: '#fef3c7' },
  Activity:   { fg: '#dc2626', bg: '#fee2e2' },
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
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
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
  const colors = type === 'success'
    ? 'bg-emerald-600 text-white'
    : type === 'warning'
    ? 'bg-amber-500 text-white'
    : 'bg-rose-600 text-white'
  const Icon = type === 'success' ? Check : type === 'warning' ? AlertTriangle : AlertCircle
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw] ${colors}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── WEIGHTAGE INPUT ──────────────────────────────────────────────────────────
function WeightageInput({ value, onChange, isOver }) {
  return (
    <div className="relative inline-flex items-center">
      <input
        type="number"
        min="0"
        max="100"
        value={value}
        onChange={e => {
          const v = Math.max(0, Math.min(100, parseInt(e.target.value) || 0))
          onChange(v)
        }}
        className={`w-20 text-center py-1.5 px-2 text-[13px] font-bold rounded-lg border outline-none transition-all
          tabular-nums
          focus:ring-2
          dark:bg-[#1e2238] dark:text-slate-200
          ${isOver
            ? 'border-rose-400 text-rose-600 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 focus:border-rose-400 focus:ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-slate-700 bg-white focus:border-blue-400 focus:ring-blue-100'
          }`}
      />
      <span className="ml-1.5 text-[12px] text-slate-400 font-medium">%</span>
    </div>
  )
}

// ─── EXAM TYPE BADGES ─────────────────────────────────────────────────────────
function ExamTypeBadge({ type }) {
  const { fg, bg } = EXAM_TYPE_COLORS[type] || { fg: '#6b7280', bg: '#f3f4f6' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold mr-1 mb-1"
      style={{ color: fg, background: bg }}
    >
      {type}
    </span>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, suffix = '' }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
          {value}{suffix}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── WEIGHTAGE PROGRESS BAR ───────────────────────────────────────────────────
function WeightageBar({ total }) {
  const isOver    = total > 100
  const isExact   = total === 100
  const remaining = Math.max(0, 100 - total)

  return (
    <div className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-5 py-4 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Weightage Distribution
        </span>
        <span className={`text-[13px] font-bold tabular-nums ${
          isOver ? 'text-rose-600 dark:text-rose-400' : isExact ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'
        }`}>
          {total}% / 100%
        </span>
      </div>

      <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isOver ? 'bg-rose-500' : isExact ? 'bg-emerald-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(total, 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        {isOver ? (
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            Exceeds 100% by {total - 100}% — please adjust weightages
          </p>
        ) : isExact ? (
          <p className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Total weightage is exactly 100% — ready to save
          </p>
        ) : (
          <p className="text-[12px] text-slate-400">
            {remaining}% remaining to allocate
          </p>
        )}
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onWeightageChange, isOver }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Exam Name + Types */}
      <td className="px-4 py-4">
        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 mb-1.5">{row.exam_name}</p>
        <div className="flex flex-wrap gap-0">
          {row.exam_types.map(t => <ExamTypeBadge key={t} type={t} />)}
        </div>
      </td>

      {/* Weightage */}
      <td className="px-4 py-3 text-center">
        <WeightageInput
          value={row.weightage}
          onChange={v => onWeightageChange(row.exam_id, v)}
          isOver={isOver}
        />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onWeightageChange, totalIsOver }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Index badge */}
        <span className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.exam_name}</p>
          <div className="flex flex-wrap mt-1">
            {row.exam_types.map(t => <ExamTypeBadge key={t} type={t} />)}
          </div>
        </div>

        {/* Weightage badge */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className={`text-[20px] font-bold tabular-nums leading-tight ${
            totalIsOver ? 'text-rose-600 dark:text-rose-400' : 'text-blue-700 dark:text-blue-400'
          }`}>
            {row.weightage}%
          </span>
          <span className="text-[10px] text-slate-400">weightage</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded — inline edit */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Edit Weightage
          </p>
          <div className="flex items-center gap-3">
            <WeightageInput
              value={row.weightage}
              onChange={v => onWeightageChange(row.exam_id, v)}
              isOver={totalIsOver}
            />
            <p className="text-[12px] text-slate-400">
              Adjust the percentage for <span className="font-semibold text-slate-600 dark:text-slate-300">{row.exam_name}</span>
            </p>
          </div>
          {/* Mini bar for this exam's share */}
          <div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-400 transition-all duration-500"
                style={{ width: `${Math.min(row.weightage, 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">{row.weightage}% of 100% allocated here</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, cls, setCls, term, setTerm, onShow, loading, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Class" error={errors.cls} required>
            <NativeSelect
              value={cls}
              onChange={e => setCls(e.target.value)}
              placeholder="-- Select Class --"
              error={errors.cls}
            >
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect
              value={term}
              onChange={e => setTerm(e.target.value)}
              placeholder="-- Select Term --"
              error={errors.term}
            >
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineWeightage() {
  const [cls,        setCls]        = useState('')
  const [term,       setTerm]       = useState('')
  const [exams,      setExams]      = useState([])
  const [loading,    setLoading]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [shownCls,   setShownCls]   = useState('')
  const [shownTerm,  setShownTerm]  = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Total weightage (live calculation) ────────────────────────────────────
  const totalWeightage = useMemo(() =>
    exams.reduce((s, e) => s + (parseInt(e.weightage) || 0), 0),
  [exams])

  const isOver  = totalWeightage > 100
  const isExact = totalWeightage === 100

  // ── Fetch / simulate API ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!cls)  err.cls  = 'Please select a class'
    if (!term) err.term = 'Please select a term'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const data = (EXAM_DATA[cls]?.[term]) || DEFAULT_EXAMS(term)
      // Deep clone so edits don't mutate source
      setExams(JSON.parse(JSON.stringify(data)))
      setShownCls(cls)
      setShownTerm(term)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} exams for ${cls} — ${term}.`)
    }, 650)
  }, [cls, term])

  // ── Weightage change ──────────────────────────────────────────────────────
  const handleWeightageChange = useCallback((examId, value) => {
    setExams(prev => prev.map(e =>
      e.exam_id === examId ? { ...e, weightage: value } : e
    ))
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (isOver) {
      showToast('Total weightage exceeds 100%. Please adjust before saving.', 'error')
      return
    }
    if (!isExact) {
      showToast(`Total is ${totalWeightage}%. Weightages should add up to 100%.`, 'warning')
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast('Weightages saved successfully!')
    }, 900)
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setCls(''); setTerm(''); setExams([])
    setErrors({}); setShown(false)
    setShownCls(''); setShownTerm('')
  }

  const hasResults   = shown && exams.length > 0
  const activeFilters = [cls, term].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Weightage
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Set percentage weightage for each exam component — class and term wise.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Weightage
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={cls}
                onChange={e => { setCls(e.target.value); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.cls}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.term} required>
              <NativeSelect
                value={term}
                onChange={e => { setTerm(e.target.value); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select Term --"
                error={errors.term}
              >
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacer */}
            <div />

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

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {cls && term ? `${cls} · ${term}` : cls ? cls : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilters}
            </span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        cls={cls} setCls={setCls}
        term={term} setTerm={setTerm}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.18 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={ClipboardList} label="Total Exams"       value={exams.length}    color="blue"    />
            <SummaryCard icon={Percent}       label="Allocated"          value={totalWeightage}  color={isOver ? 'rose' : isExact ? 'emerald' : 'amber'} suffix="%" />
            <SummaryCard icon={TrendingUp}    label="Remaining"          value={Math.max(0, 100 - totalWeightage)} color="violet" suffix="%" />
            <SummaryCard icon={LayoutGrid}    label="Exam Types"         value={[...new Set(exams.flatMap(e => e.exam_types))].length} color="amber" />
          </div>

          {/* Weightage Progress Bar */}
          <WeightageBar total={totalWeightage} />

          {/* Main Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Exam Weightage</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">
                  · {shownCls} &nbsp;—&nbsp; {shownTerm}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {exams.length} exam{exams.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Desktop Save button (secondary position) */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="hidden sm:flex items-center gap-2 px-4 py-1.5 rounded-xl text-[12px] font-semibold
                  bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Edit the weightage % for each exam. Total must equal 100% before saving.
                Changes are reflected live in the distribution bar above.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Exam Name / Components', 'Weightage (%)'].map((h, i) => (
                      <th
                        key={i}
                        className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                          ${i === 0 ? 'text-center w-14' : i === 2 ? 'text-center w-48' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {exams.map((row, i) => (
                    <DesktopRow
                      key={row.exam_id}
                      row={row}
                      idx={i + 1}
                      onWeightageChange={handleWeightageChange}
                      isOver={isOver}
                    />
                  ))}

                  {/* Grand Total Row */}
                  <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                    <td className="px-4 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                    <td className="px-4 py-3">
                      <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Total Weightage
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-flex items-center justify-center px-4 py-1.5 rounded-lg text-[14px] font-bold tabular-nums
                        ${isOver
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                          : isExact
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                        }`}>
                        {totalWeightage}%
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to edit its weightage.
              </p>

              {exams.map((row, i) => (
                <MobileCard
                  key={row.exam_id}
                  row={row}
                  idx={i + 1}
                  onWeightageChange={handleWeightageChange}
                  totalIsOver={isOver}
                />
              ))}

              {/* Mobile Grand Total */}
              <div className={`rounded-xl border-2 p-4 ${
                isOver
                  ? 'border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/[0.07]'
                  : isExact
                  ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/[0.07]'
                  : 'border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07]'
              }`}>
                <p className={`text-[12px] font-bold uppercase tracking-wide mb-3 flex items-center gap-2 ${
                  isOver ? 'text-rose-700 dark:text-rose-400'
                  : isExact ? 'text-emerald-700 dark:text-emerald-400'
                  : 'text-blue-700 dark:text-blue-400'
                }`}>
                  <TrendingUp className="w-4 h-4" />
                  Total Weightage
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[36px] font-bold tabular-nums leading-tight ${
                      isOver ? 'text-rose-700 dark:text-rose-300'
                      : isExact ? 'text-emerald-700 dark:text-emerald-300'
                      : 'text-blue-700 dark:text-blue-300'
                    }`}>
                      {totalWeightage}<span className="text-[20px]">%</span>
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {isOver
                        ? `${totalWeightage - 100}% over limit`
                        : isExact
                        ? 'Exactly 100% — good to save'
                        : `${100 - totalWeightage}% remaining`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">{exams.length} exams</p>
                    <p className="text-[11px] text-slate-400">configured</p>
                  </div>
                </div>

                {/* Mobile Save button */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold
                    bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70 shadow-md shadow-emerald-500/20"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Weightage
                </button>
              </div>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{exams.length}</span> exam{exams.length !== 1 ? 's' : ''} for{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{shownCls}</span> —{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{shownTerm}</span>
              </p>
              <span className={`text-[12px] font-semibold px-2.5 py-0.5 rounded-full ${
                isOver ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
                : isExact ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
              }`}>
                {isOver ? `⚠ ${totalWeightage}%` : isExact ? `✓ ${totalWeightage}%` : `${totalWeightage}% / 100%`}
              </span>
            </div>
          </div>

          {/* ── Report Viewer Placeholder ─────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
              <FileSpreadsheet className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Report Viewer</span>
              <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                API Integration Pending
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-14 gap-4 text-slate-400 dark:text-slate-600">
              <div className="w-14 h-14 rounded-2xl bg-violet-50 dark:bg-violet-500/10 flex items-center justify-center">
                <BarChart3 className="w-7 h-7 text-violet-400 dark:text-violet-500" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">Report viewer area</p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
                  The SSRS / ReportViewer component will render here after API integration is complete.
                </p>
              </div>
              <button
                type="button"
                disabled
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                  bg-violet-100 text-violet-500 dark:bg-violet-500/10 dark:text-violet-400 cursor-not-allowed"
              >
                <FileSpreadsheet className="w-4 h-4" />
                View Report (Coming Soon)
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No weightage data loaded</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>Class</strong> and <strong>Term</strong>, then click <strong>Show</strong> to load exam weightages.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
