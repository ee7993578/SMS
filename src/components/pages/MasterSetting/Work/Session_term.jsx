/**
 * Session_term.jsx
 * Folder: src/pages/Admin/Session_term.jsx
 *
 * Converts legacy ASPX "Define Term Session" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Select Class + Term dropdowns
 *  - Session Start Date + Session End Period (date pickers)
 *  - Add / Update actions
 *  - GridView → Desktop table + Mobile cards
 *  - Edit inline prefill form
 *  - Client-side validation (same as ASPX validate())
 *  - Toast notifications
 *  - Fully responsive — no horizontal scroll on mobile
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  CalendarDays, ChevronDown, AlertCircle, X, Check,
  Loader2, Pencil, PlusCircle, RefreshCw,
  BookOpen, Layers, Clock, GraduationCap,
  Info, Search, ChevronRight, SlidersHorizontal,
  CalendarRange, BookMarked
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const CLASSES = [
  { value: '0', label: '-- Select Class --' },
  { value: 'nursery',   label: 'Nursery' },
  { value: 'lkg',       label: 'LKG' },
  { value: 'ukg',       label: 'UKG' },
  { value: 'class1',    label: 'Class I' },
  { value: 'class2',    label: 'Class II' },
  { value: 'class3',    label: 'Class III' },
  { value: 'class4',    label: 'Class IV' },
  { value: 'class5',    label: 'Class V' },
  { value: 'class6',    label: 'Class VI' },
  { value: 'class7',    label: 'Class VII' },
  { value: 'class8',    label: 'Class VIII' },
  { value: 'class9',    label: 'Class IX' },
  { value: 'class10',   label: 'Class X' },
  { value: 'class11',   label: 'Class XI' },
  { value: 'class12',   label: 'Class XII' },
]

// Terms populated based on selected class (simulated API)
const TERMS_BY_CLASS = {
  nursery: ['Term 1', 'Term 2'],
  lkg:     ['Term 1', 'Term 2'],
  ukg:     ['Term 1', 'Term 2'],
  class1:  ['Term 1', 'Term 2', 'Term 3'],
  class2:  ['Term 1', 'Term 2', 'Term 3'],
  class3:  ['Term 1', 'Term 2', 'Term 3'],
  class4:  ['Term 1', 'Term 2', 'Term 3'],
  class5:  ['Term 1', 'Term 2', 'Term 3'],
  class6:  ['Term 1', 'Term 2', 'Term 3'],
  class7:  ['Term 1', 'Term 2', 'Term 3'],
  class8:  ['Term 1', 'Term 2', 'Term 3'],
  class9:  ['Term 1', 'Term 2', 'Term 3'],
  class10: ['Term 1', 'Term 2', 'Term 3'],
  class11: ['Term 1', 'Term 2'],
  class12: ['Term 1', 'Term 2'],
}

// Initial grid data (mirrors ASPX GridView seeded records)
const INITIAL_RECORDS = [
  { s_no: 1, class: 'class6',  classLabel: 'Class VI',   term: 'Term 1', term_name: 'Term 1', startdate: '01 Apr 2025', enddate: '30 Jun 2025', session: '2025-26' },
  { s_no: 2, class: 'class6',  classLabel: 'Class VI',   term: 'Term 2', term_name: 'Term 2', startdate: '01 Jul 2025', enddate: '30 Sep 2025', session: '2025-26' },
  { s_no: 3, class: 'class6',  classLabel: 'Class VI',   term: 'Term 3', term_name: 'Term 3', startdate: '01 Oct 2025', enddate: '31 Mar 2026', session: '2025-26' },
  { s_no: 4, class: 'class9',  classLabel: 'Class IX',   term: 'Term 1', term_name: 'Term 1', startdate: '01 Apr 2025', enddate: '30 Jun 2025', session: '2025-26' },
  { s_no: 5, class: 'class9',  classLabel: 'Class IX',   term: 'Term 2', term_name: 'Term 2', startdate: '01 Jul 2025', enddate: '30 Sep 2025', session: '2025-26' },
  { s_no: 6, class: 'class10', classLabel: 'Class X',    term: 'Term 1', term_name: 'Term 1', startdate: '01 Apr 2025', enddate: '30 Jun 2025', session: '2025-26' },
  { s_no: 7, class: 'class11', classLabel: 'Class XI',   term: 'Term 1', term_name: 'Term 1', startdate: '01 Apr 2025', enddate: '31 Aug 2025', session: '2025-26' },
  { s_no: 8, class: 'class12', classLabel: 'Class XII',  term: 'Term 1', term_name: 'Term 1', startdate: '01 Apr 2025', enddate: '31 Aug 2025', session: '2025-26' },
]

// Color palette for class badges
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── HELPER: today's date as dd MMM yyyy ─────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const todayStr = () => {
  const d = new Date()
  return `${String(d.getDate()).padStart(2,'0')} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Native dropdown with chevron */
function NativeSelect({ value, onChange, children, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

/** Form field wrapper with label + error */
function Field({ label, error, required, children, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
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

/** Date input styled consistently */
function DateInput({ value, onChange, placeholder, error, min }) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={onChange}
        min={min}
        className={`w-full pl-3 pr-9 py-2.5 text-[13px] rounded-xl border outline-none transition-all
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
        placeholder={placeholder}
      />
      <CalendarDays className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ transform: 'translateX(-50%)', animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── STAT SUMMARY BAR ─────────────────────────────────────────────────────────
function StatBar({ records }) {
  const classes = new Set(records.map(r => r.class)).size
  const terms   = new Set(records.map(r => r.term)).size
  const sessions= new Set(records.map(r => r.session)).size

  const stats = [
    { icon: Layers,       label: 'Total Records',   value: records.length, color: 'blue'   },
    { icon: GraduationCap,label: 'Classes Covered', value: classes,        color: 'violet' },
    { icon: BookMarked,   label: 'Terms Defined',   value: terms,          color: 'emerald'},
    { icon: CalendarRange,label: 'Sessions',         value: sessions,       color: 'amber'  },
  ]
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm">
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
            <Icon className="w-4 h-4" />
          </span>
          <div>
            <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, onEdit }) {
  const { fg, bg } = classColor(row.classLabel)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{row.s_no}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: bg, color: fg }}>
            {formatAbbr(row.classLabel)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.classLabel}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 whitespace-nowrap">
          <BookMarked className="w-3 h-3" />{row.term_name}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 whitespace-nowrap">
          <CalendarDays className="w-3 h-3" />{row.startdate}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 whitespace-nowrap">
          <CalendarDays className="w-3 h-3" />{row.enddate}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          {row.session}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
            transition-all active:scale-95 shadow-sm shadow-blue-500/20"
        >
          <Pencil className="w-3 h-3" />Edit
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE RECORD CARD ───────────────────────────────────────────────────────
function MobileCard({ row, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.classLabel)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {formatAbbr(row.classLabel)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.classLabel}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            <span className="text-violet-600 dark:text-violet-400 font-semibold">{row.term_name}</span>
            &nbsp;·&nbsp;
            <span className="text-blue-600 dark:text-blue-400">{row.session}</span>
          </p>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Dates preview bar (always visible) */}
      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <CalendarDays className="w-3 h-3" />{row.startdate}
        </span>
        <span className="text-slate-300 dark:text-slate-600 text-[10px]">→</span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
          <CalendarDays className="w-3 h-3" />{row.enddate}
        </span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-0.5">Start Date</p>
              <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300">{row.startdate}</p>
            </div>
            <div className="rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-0.5">End Period</p>
              <p className="text-[13px] font-bold text-amber-700 dark:text-amber-300">{row.enddate}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-95"
          >
            <Pencil className="w-4 h-4" />Edit Record
          </button>
        </div>
      )}
    </div>
  )
}

// ─── FORMAT date for <input type="date"> value (yyyy-mm-dd) ──────────────────
const parseToInput = (str) => {
  if (!str) return ''
  // str like "01 Apr 2025"
  const parts = str.split(' ')
  if (parts.length !== 3) return ''
  const dd = parts[0]
  const mm = String(MONTHS.indexOf(parts[1]) + 1).padStart(2, '0')
  const yyyy = parts[2]
  return `${yyyy}-${mm}-${dd}`
}

const formatFromInput = (str) => {
  if (!str) return ''
  const [yyyy, mm, dd] = str.split('-')
  return `${dd} ${MONTHS[parseInt(mm, 10) - 1]} ${yyyy}`
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SessionTerm() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [selClass,   setSelClass]   = useState('0')
  const [terms,      setTerms]      = useState([])
  const [selTerm,    setSelTerm]    = useState('0')
  const [startDate,  setStartDate]  = useState('')
  const [endDate,    setEndDate]    = useState('')
  const [errors,     setErrors]     = useState({})
  const [isEdit,     setIsEdit]     = useState(false)
  const [editId,     setEditId]     = useState(null)
  const [loading,    setLoading]    = useState(false)

  // ── Records (grid) ──────────────────────────────────────────────────────────
  const [records, setRecords] = useState(INITIAL_RECORDS)
  const [search,  setSearch]  = useState('')

  // ── Toast ───────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const formRef = useRef(null)

  // ── Class change → load terms (simulates ddlclass_SelectedIndexChanged) ────
  const handleClassChange = (e) => {
    const val = e.target.value
    setSelClass(val)
    setSelTerm('0')
    setErrors(p => ({ ...p, class: undefined, term: undefined }))
    if (val !== '0') {
      setTerms(TERMS_BY_CLASS[val] || [])
    } else {
      setTerms([])
    }
  }

  // ── Validate (mirrors ASPX validate()) ──────────────────────────────────────
  const validate = () => {
    const err = {}
    if (selClass === '0')    err.class = 'Please select a class'
    if (selTerm === '0')     err.term  = 'Please select a term'
    if (!startDate.trim())   err.start = 'Session start date is required'
    if (!endDate.trim())     err.end   = 'Session end period is required'
    if (startDate && endDate && startDate >= endDate)
      err.end = 'End date must be after start date'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Reset form ───────────────────────────────────────────────────────────────
  const resetForm = () => {
    setSelClass('0'); setTerms([]); setSelTerm('0')
    setStartDate(''); setEndDate('')
    setErrors({}); setIsEdit(false); setEditId(null)
  }

  // ── Add (Button2_Click) ───────────────────────────────────────────────────
  const handleAdd = () => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const classLabel = CLASSES.find(c => c.value === selClass)?.label || ''
      const newRecord = {
        s_no: records.length + 1,
        class: selClass,
        classLabel,
        term: selTerm,
        term_name: selTerm,
        startdate: formatFromInput(startDate),
        enddate: formatFromInput(endDate),
        session: `${new Date(startDate).getFullYear()}-${String(new Date(endDate).getFullYear()).slice(2)}`,
      }
      setRecords(prev => [...prev, newRecord])
      setLoading(false)
      resetForm()
      showToast('Term session added successfully!')
      // scroll to table
      setTimeout(() => document.getElementById('records-section')?.scrollIntoView({ behavior: 'smooth' }), 200)
    }, 500)
  }

  // ── Edit prefill (btnedit_Click) ──────────────────────────────────────────
  const handleEdit = useCallback((row) => {
    setIsEdit(true)
    setEditId(row.s_no)
    setSelClass(row.class)
    const loadedTerms = TERMS_BY_CLASS[row.class] || []
    setTerms(loadedTerms)
    setSelTerm(row.term)
    setStartDate(parseToInput(row.startdate))
    setEndDate(parseToInput(row.enddate))
    setErrors({})
    // scroll to form
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }, [])

  // ── Update (buttonedit_Click) ─────────────────────────────────────────────
  const handleUpdate = () => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const classLabel = CLASSES.find(c => c.value === selClass)?.label || ''
      setRecords(prev => prev.map(r =>
        r.s_no === editId
          ? { ...r, class: selClass, classLabel, term: selTerm, term_name: selTerm,
              startdate: formatFromInput(startDate), enddate: formatFromInput(endDate),
              session: `${new Date(startDate).getFullYear()}-${String(new Date(endDate).getFullYear()).slice(2)}` }
          : r
      ))
      setLoading(false)
      resetForm()
      showToast('Term session updated successfully!')
    }, 500)
  }

  // ── Filtered records ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return records
    const q = search.toLowerCase()
    return records.filter(r =>
      r.classLabel.toLowerCase().includes(q) ||
      r.term_name.toLowerCase().includes(q) ||
      r.session.toLowerCase().includes(q)
    )
  }, [records, search])

  // ── ────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#10132a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5 pb-16">

        {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
          <a href="#" className="hover:text-blue-600 transition-colors">Home</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-800 dark:text-slate-200 font-semibold">Define Term Session</span>
        </nav>

        {/* ── Page Title ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
              Define Term Session
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Configure academic term start and end periods for each class.
            </p>
          </div>
        </div>

        {/* ── Stat Bar ──────────────────────────────────────────────────────── */}
        <StatBar records={records} />

        {/* ── FORM CARD ─────────────────────────────────────────────────────── */}
        <div
          ref={formRef}
          className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden"
        >
          {/* Card header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            {isEdit
              ? <Pencil className="w-4 h-4 text-blue-600 dark:text-indigo-400 flex-shrink-0" />
              : <PlusCircle className="w-4 h-4 text-blue-600 dark:text-indigo-400 flex-shrink-0" />}
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
              {isEdit ? 'Edit Term Session' : 'Add Term Session'}
            </span>
            {isEdit && (
              <span className="ml-auto text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/25">
                Editing Record #{editId}
              </span>
            )}
          </div>

          {/* Form body */}
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              {/* Select Class */}
              <Field label="Select Class" icon={GraduationCap} error={errors.class} required>
                <NativeSelect value={selClass} onChange={handleClassChange} error={errors.class}>
                  {CLASSES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </NativeSelect>
              </Field>

              {/* Select Term */}
              <Field label="Select Term" icon={BookMarked} error={errors.term} required>
                <NativeSelect
                  value={selTerm}
                  onChange={e => { setSelTerm(e.target.value); setErrors(p => ({ ...p, term: undefined })) }}
                  error={errors.term}
                  disabled={selClass === '0'}
                >
                  <option value="0">-- Select Term --</option>
                  {terms.map(t => <option key={t} value={t}>{t}</option>)}
                </NativeSelect>
              </Field>

              {/* Session Start Date */}
              <Field label="Session Start Date" icon={CalendarDays} error={errors.start} required>
                <DateInput
                  value={startDate}
                  onChange={e => { setStartDate(e.target.value); setErrors(p => ({ ...p, start: undefined })) }}
                  error={errors.start}
                />
              </Field>

              {/* Session End Period */}
              <Field label="Session End Period" icon={CalendarDays} error={errors.end} required>
                <DateInput
                  value={endDate}
                  onChange={e => { setEndDate(e.target.value); setErrors(p => ({ ...p, end: undefined })) }}
                  error={errors.end}
                  min={startDate}
                />
              </Field>
            </div>
          </div>

          {/* Form footer / actions */}
          <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/40 dark:bg-white/[0.01] flex-wrap">
            {!isEdit ? (
              <button
                type="button"
                onClick={handleAdd}
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                Add Session
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                    bg-emerald-600 hover:bg-emerald-700
                    shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Update Session
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                    bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
                    transition-colors"
                >
                  <X className="w-4 h-4" />Cancel
                </button>
              </>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold
                text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />Reset
            </button>

            {/* Hint */}
            <div className="flex items-center gap-1.5 ml-auto text-[11px] text-blue-600 dark:text-blue-400">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">All fields marked * are required.</span>
            </div>
          </div>
        </div>

        {/* ── RECORDS SECTION ──────────────────────────────────────────────── */}
        <div
          id="records-section"
          className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
              <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Defined Term Sessions</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-56 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search class, term, session…"
                className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-xl border outline-none transition-all
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
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <Search className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No records found{search ? ' matching your search' : ''}.</span>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Class', 'Term', 'Session Start From', 'Session End Upto', 'Session', 'Action'].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => (
                    <DesktopRow key={row.s_no} row={row} onEdit={handleEdit} />
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
                <span className="text-[13px]">No records found{search ? ' matching your search' : ''}.</span>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap a card to expand details and edit.
                </p>
                {filtered.map(row => (
                  <MobileCard key={row.s_no} row={row} onEdit={handleEdit} />
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span> records
            </p>
            {search && (
              <button onClick={() => setSearch('')}
                className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" />Clear search
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
