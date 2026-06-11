/**
 * ExpectedSchoolAverageReport.jsx
 * Folder: src/pages/Reports/Exam/ExpectedSchoolAverageReport.jsx
 *
 * Converts legacy ASPX "Expected School Average Report (Green Sheet)" to
 * fully-responsive React + Tailwind.
 *
 * Columns: S.R, Class/Section, Section Average
 * Features:
 *  - Session, Class, Term, Exam dropdowns
 *  - Show report + Excel export
 *  - School header banner
 *  - Grand school average footer
 *  - Mobile: stacked cards with progress bars
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check,
  Loader2, ChevronDown, SlidersHorizontal, Search,
  FileSpreadsheet, BookOpen, Building2, MapPin,
  TrendingUp, BarChart3, Award, GraduationCap,
  ChevronRight, Info, Percent
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name:    'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

// Classes populated after session selection (static for demo)
const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const TERMS = ['Term 1', 'Term 2', 'Term 3']

// Exams vary by term for demo
const EXAMS_BY_TERM = {
  'Term 1': ['Unit Test 1', 'Half Yearly Exam'],
  'Term 2': ['Unit Test 2', 'Annual Exam'],
  'Term 3': ['Unit Test 3', 'Pre-Board', 'Final Exam'],
}

/**
 * Generate deterministic-looking dummy data for any combination.
 * avg_per = section average percentage (two decimal places as string)
 */
function generateData(session, classFilter, term, exam) {
  const sections = ['A', 'B', 'C']
  const seed = (session + classFilter + term + exam).length % 10

  // Some classes have only one section
  const singleSectionClasses = ['Class III', 'Class IV', 'Class V', 'Class VII', 'Class VIII', 'Class X']

  const allClasses = CLASSES.filter(c => !classFilter || c === classFilter)

  const rows = []
  allClasses.forEach((cls, ci) => {
    const numSections = singleSectionClasses.includes(cls) ? 1 : 2
    for (let s = 0; s < numSections; s++) {
      const base = 55 + ((ci * 7 + s * 3 + seed) % 30)
      const avg = (base + Math.random() * 4).toFixed(2)
      rows.push({
        class_name: numSections === 1 ? cls : `${cls} - ${sections[s]}`,
        avg_per:    avg,
        _numeric:   parseFloat(avg),
      })
    }
  })
  return rows
}

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────

/** Returns a Tailwind-friendly colour descriptor based on percentage */
function avgColor(pct) {
  if (pct >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-700 dark:text-emerald-400', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', ring: 'border-emerald-200 dark:border-emerald-500/30' }
  if (pct >= 65) return { bar: 'bg-blue-500',    text: 'text-blue-700 dark:text-blue-400',       badge: 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',       ring: 'border-blue-200 dark:border-blue-500/30'     }
  if (pct >= 50) return { bar: 'bg-amber-500',   text: 'text-amber-700 dark:text-amber-400',     badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',   ring: 'border-amber-200 dark:border-amber-500/30'   }
  return             { bar: 'bg-rose-500',    text: 'text-rose-700 dark:text-rose-400',       badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',       ring: 'border-rose-200 dark:border-rose-500/30'     }
}

function gradeLabel(pct) {
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B+'
  if (pct >= 60) return 'B'
  if (pct >= 50) return 'C'
  return 'D'
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

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────

function SchoolHeader({ session, term, exam }) {
  return (
    <div className="rounded-2xl border border-green-100 dark:border-[rgba(34,197,94,0.2)] bg-gradient-to-r from-green-50 via-white to-emerald-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
          {term}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 text-[12px] font-bold text-violet-700 dark:text-violet-400">
          {exam}
        </span>
      </div>
      <p className="mt-2.5 text-[13px] font-bold uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
        Expected School Average Report (Green Sheet)
      </p>
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const palette = {
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${palette[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-emerald-50 dark:bg-emerald-500/[0.07] border-t-2 border-emerald-200 dark:border-emerald-500/30">
        <td className="px-4 py-3 text-center text-[12px] text-emerald-500 dark:text-emerald-400">—</td>
        <td className="px-4 py-3">
          <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> School Average
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[15px] font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums shadow-sm">
            <Percent className="w-3.5 h-3.5" />
            {row.avg_per}%
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-extrabold bg-emerald-200 text-emerald-800 dark:bg-emerald-500/25 dark:text-emerald-300">
            {gradeLabel(parseFloat(row.avg_per))}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-700"
              style={{ width: `${Math.min(parseFloat(row.avg_per), 100)}%` }}
            />
          </div>
        </td>
      </tr>
    )
  }

  const pct = parseFloat(row.avg_per)
  const col = avgColor(pct)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.R */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Class/Section */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-slate-100 dark:bg-slate-800">
            <GraduationCap className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {row.class_name}
          </span>
        </div>
      </td>

      {/* Section Average % */}
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[13px] font-bold tabular-nums ${col.badge}`}>
          <Percent className="w-3 h-3" />
          {row.avg_per}
        </span>
      </td>

      {/* Grade */}
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[12px] font-extrabold border ${col.badge} ${col.ring}`}>
          {gradeLabel(pct)}
        </span>
      </td>

      {/* Bar */}
      <td className="px-4 py-3 min-w-[100px]">
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className={`h-full rounded-full ${col.bar} transition-all duration-700`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 dark:text-slate-600 mt-0.5 text-right tabular-nums">{pct}%</p>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────

function MobileCard({ row, idx }) {
  const pct   = parseFloat(row.avg_per)
  const col   = avgColor(pct)
  const grade = gradeLabel(pct)

  return (
    <div className={`rounded-xl border ${col.ring} bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Index */}
        <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0 tabular-nums">
          {idx}
        </span>

        {/* Class name */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.class_name}
          </p>
          <p className={`text-[11px] font-semibold mt-0.5 ${col.text}`}>
            Grade {grade} · Section Average
          </p>
        </div>

        {/* Big percentage */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className={`text-[22px] font-extrabold tabular-nums leading-tight ${col.text}`}>
            {row.avg_per}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">percent</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3.5">
        <div className="flex justify-between text-[10px] font-semibold mb-1">
          <span className={col.text}>Section average</span>
          <span className="text-slate-400">{pct}% / 100%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full ${col.bar} transition-all duration-700`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilter, exams, onShow, loading, errors }) {
  if (!open) return null
  const { session, classFilter, term, exam } = filters

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setFilter('session', e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.classFilter} required>
            <NativeSelect value={classFilter} onChange={e => setFilter('classFilter', e.target.value)} placeholder="-- Select Class --" error={errors.classFilter} disabled={!session}>
              <option value="ALL">All Classes</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => { setFilter('term', e.target.value); setFilter('exam', '') }} placeholder="-- Select Term --" error={errors.term} disabled={!session}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={exam} onChange={e => setFilter('exam', e.target.value)} placeholder="-- Select Exam --" error={errors.exam} disabled={!term}>
              {exams.map(e => <option key={e} value={e}>{e}</option>)}
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
              bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ExpectedSchoolAverageReport() {
  // ── Filter state ─────────────────────────────────────────────────────────
  const [filters, setFiltersState] = useState({ session: '', classFilter: '', term: '', exam: '' })
  const setFilter = (key, val) => setFiltersState(prev => ({ ...prev, [key]: val }))

  // ── Result state ─────────────────────────────────────────────────────────
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownFilters, setShownFilters] = useState({})

  // ── Derived ───────────────────────────────────────────────────────────────
  const { session, classFilter, term, exam } = filters
  const exams = term ? (EXAMS_BY_TERM[term] ?? []) : []

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & Show ───────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session)     err.session     = 'Please select a session'
    if (!classFilter) err.classFilter = 'Please select a class'
    if (!term)        err.term        = 'Please select a term'
    if (!exam)        err.exam        = 'Please select an exam'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = generateData(session, classFilter === 'ALL' ? '' : classFilter, term, exam)
      setRows(data)
      setShownFilters({ ...filters })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} section record${data.length !== 1 ? 's' : ''}.`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFiltersState({ session: '', classFilter: '', term: '', exam: '' })
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownFilters({})
  }

  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Filtered rows + totals ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r => r.class_name.toLowerCase().includes(q))
  }, [rows, search])

  const schoolAvg = useMemo(() => {
    if (!filtered.length) return '0.00'
    const sum = filtered.reduce((s, r) => s + r._numeric, 0)
    return (sum / filtered.length).toFixed(2)
  }, [filtered])

  const highest = useMemo(() => filtered.reduce((m, r) => r._numeric > m ? r._numeric : m, 0), [filtered])
  const lowest  = useMemo(() => filtered.reduce((m, r) => r._numeric < m ? r._numeric : m, Infinity), [filtered])

  const hasResults  = shown && rows.length > 0
  const activeCount = [session, classFilter, term, exam].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Expected School Average
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Section-wise average percentages — Green Sheet exam report.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setFilter('session', e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.classFilter} required>
              <NativeSelect
                value={classFilter}
                onChange={e => { setFilter('classFilter', e.target.value); setErrors(p => ({ ...p, classFilter: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.classFilter}
                disabled={!session}
              >
                <option value="ALL">All Classes</option>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Term */}
            <Field label="Term" error={errors.term} required>
              <NativeSelect
                value={term}
                onChange={e => {
                  setFilter('term', e.target.value)
                  setFilter('exam', '')
                  setErrors(p => ({ ...p, term: undefined }))
                }}
                placeholder="-- Select Term --"
                error={errors.term}
                disabled={!session}
              >
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            {/* Exam */}
            <Field label="Exam" error={errors.exam} required>
              <NativeSelect
                value={exam}
                onChange={e => { setFilter('exam', e.target.value); setErrors(p => ({ ...p, exam: undefined })) }}
                placeholder="-- Select Exam --"
                error={errors.exam}
                disabled={!term}
              >
                {exams.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Action buttons row */}
          <div className="flex items-center gap-2 mt-4 justify-end">
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button type="button" onClick={handleShow} disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} set` : 'Set Filters'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        exams={exams}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {hasResults && !loading && (() => {
        const sf = shownFilters
        const cls = sf.classFilter === 'ALL' ? 'All Classes' : sf.classFilter
        return (
          <>
            {/* School Header */}
            <SchoolHeader session={sf.session} term={sf.term} exam={sf.exam} />

            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard icon={Percent}      label="School Average"   value={`${schoolAvg}%`}          color="emerald" />
              <SummaryCard icon={Award}        label="Highest Section"  value={`${highest.toFixed(2)}%`} color="blue"    />
              <SummaryCard icon={BarChart3}    label="Lowest Section"   value={`${lowest === Infinity ? '—' : lowest.toFixed(2)}%`} color="amber" />
              <SummaryCard icon={GraduationCap}label="Sections Shown"   value={filtered.length}          color="violet"  />
            </div>

            {/* Results card */}
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

              {/* Card header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                  <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Section Averages</span>
                  <span className="text-[13px] text-slate-400 dark:text-slate-500">· {cls} · {sf.exam}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0">
                    {filtered.length} section{filtered.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Search */}
                <div className="relative w-full sm:w-52 flex-shrink-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search class…"
                    className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                      bg-white text-slate-700 border-slate-200 placeholder-slate-300
                      focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100
                      dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                      dark:placeholder-slate-600 dark:focus:border-emerald-400"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Colour legend hint */}
              <div className="hidden sm:flex flex-wrap items-center gap-4 px-5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-slate-50/30 dark:bg-white/[0.015]">
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" /> ≥ 80% — Excellent (A/A+)
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0" /> 65–79% — Good (B+/B)
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 flex-shrink-0" /> 50–64% — Average (C)
                </span>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 flex-shrink-0" /> &lt; 50% — Needs Attention (D)
                </span>
              </div>

              {/* ── DESKTOP TABLE ── */}
              <div className="hidden md:block overflow-x-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                    <Search className="w-6 h-6 opacity-40" />
                    <span className="text-[13px]">No records match your search.</span>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                        {['S.R.', 'Class / Section', 'Section Average', 'Grade', 'Distribution'].map((h, i) => (
                          <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                            ${i === 0 ? 'text-center w-12' : i <= 2 ? 'text-center' : 'text-center'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row, i) => (
                        <DesktopRow key={row.class_name} row={row} idx={i + 1} />
                      ))}
                      {/* School Average row */}
                      <DesktopRow row={{ avg_per: schoolAvg }} idx={0} isTotal />
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
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1.5 pb-1">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      Colour indicates performance band per section.
                    </p>

                    {filtered.map((row, i) => (
                      <MobileCard key={row.class_name} row={row} idx={i + 1} />
                    ))}

                    {/* Mobile school average banner */}
                    <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/[0.07] p-4">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> School Average — {filtered.length} Section{filtered.length !== 1 ? 's' : ''}
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-[32px] font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums leading-none">
                            {schoolAvg}<span className="text-[18px] font-bold ml-0.5">%</span>
                          </p>
                          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
                            Overall School Average · Grade {gradeLabel(parseFloat(schoolAvg))}
                          </p>
                        </div>
                        <span className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center text-[22px] font-extrabold text-emerald-700 dark:text-emerald-300">
                          {gradeLabel(parseFloat(schoolAvg))}
                        </span>
                      </div>
                      <div className="mt-3">
                        <div className="h-2 rounded-full bg-emerald-200 dark:bg-emerald-900/40 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                            style={{ width: `${Math.min(parseFloat(schoolAvg), 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-[10px] text-emerald-600 dark:text-emerald-500 font-semibold">
                          <span>0%</span>
                          <span>50%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Table footer */}
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
                <p className="text-[12px] text-slate-400 dark:text-slate-500">
                  Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> sections
                </p>
                {search && (
                  <button onClick={() => setSearch('')}
                    className="text-[12px] text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear search
                  </button>
                )}
              </div>
            </div>
          </>
        )
      })()}

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Award className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select Session, Class, Term &amp; Exam, then click{' '}
              <strong className="text-slate-600 dark:text-slate-300">Show Report</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
