/**
 * Daily_homework.jsx
 * Folder: src/pages/Student/Daily_homework.jsx
 *
 * Converts legacy ASPX "Daily Homework" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Date picker with calendar extender (native date input, styled)
 *  - Show button to fetch homework for selected date
 *  - Subject-wise homework list
 *  - Desktop: table layout (ERP-style)
 *  - Mobile: card-based layout with accordion expand
 *  - Empty states, loading skeletons, toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BookOpen,
  Calendar,
  Eye,
  RefreshCw,
  Loader2,
  AlertCircle,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Info,
  ClipboardList,
  BookMarked,
  FileText,
  Search,
  Layers,
} from 'lucide-react'

// ─── STATIC DUMMY DATA ─────────────────────────────────────────────────────────
// Keyed by date string "YYYY-MM-DD"
const HOMEWORK_DATA = {
  '2025-06-10': [
    { Subject: 'Mathematics', 'Home Work': 'Complete Exercise 5.3 (Q1–Q10) from NCERT textbook. Practice multiplication of fractions.' },
    { Subject: 'Science', 'Home Work': 'Draw a labeled diagram of the human digestive system. Write short notes on each organ.' },
    { Subject: 'English', 'Home Work': 'Read Chapter 7 "The Last Leaf" and answer questions given at the end of the chapter.' },
    { Subject: 'Hindi', 'Home Work': 'Write an essay on "Mera Priya Tyohar – Diwali" in 200 words.' },
    { Subject: 'Social Science', 'Home Work': 'Mark all the states and their capitals on the political map of India.' },
  ],
  '2025-06-11': [
    { Subject: 'Mathematics', 'Home Work': 'Solve problems from Exercise 6.1 on Linear Equations. Attempt all starred questions.' },
    { Subject: 'English', 'Home Work': 'Write a letter to your school principal requesting a week off for a family function.' },
    { Subject: 'Computer Science', 'Home Work': 'Write a Python program to check if a given number is prime. Submit printed copy.' },
    { Subject: 'Sanskrit', 'Home Work': 'Learn Shlok 1–5 from Chapter 3 by heart. Recitation test tomorrow.' },
  ],
  '2025-06-12': [
    { Subject: 'Physics', 'Home Work': 'Solve numerical problems 1 to 8 from Chapter "Laws of Motion". Show all working.' },
    { Subject: 'Chemistry', 'Home Work': 'Prepare a chart showing the periodic table with first 20 elements and their properties.' },
    { Subject: 'Biology', 'Home Work': 'Write detailed notes on Mitosis and Meiosis. Include diagrams for each stage.' },
    { Subject: 'Mathematics', 'Home Work': 'Revision of Trigonometry – Practice all standard identities and solve Exercise 8.4.' },
    { Subject: 'English', 'Home Work': 'Prepare a summary of the chapter "The Rattrap" for class discussion tomorrow.' },
    { Subject: 'Physical Education', 'Home Work': 'Write rules of Kabaddi (any 10) and the dimensions of a standard Kabaddi court.' },
  ],
  '2025-06-13': [
    { Subject: 'History', 'Home Work': 'Read Chapter 4 "The Age of Industrialisation" and make a timeline of major events.' },
    { Subject: 'Geography', 'Home Work': 'Draw a sketch map of India showing major river systems with labels.' },
    { Subject: 'Civics', 'Home Work': 'Write a note on the functions of the Election Commission of India (min 150 words).' },
    { Subject: 'Mathematics', 'Home Work': 'Practice Coordinate Geometry – plot all given points and find distances between them.' },
  ],
  '2025-06-14': [
    { Subject: 'English', 'Home Work': 'Write a debate speech (for or against): "Online education is better than classroom learning."' },
    { Subject: 'Science', 'Home Work': 'Conduct a simple experiment on surface tension at home. Write observations in lab notebook.' },
    { Subject: 'Mathematics', 'Home Work': 'Complete Worksheet 12 on Statistics – Mean, Median, Mode of grouped data.' },
  ],
}

// Subject-to-color mapping for consistent theming
const SUBJECT_COLORS = {
  Mathematics:       { fg: '#1d4ed8', bg: '#dbeafe', icon: '📐' },
  Science:           { fg: '#059669', bg: '#d1fae5', icon: '🔬' },
  English:           { fg: '#7c3aed', bg: '#ede9fe', icon: '📖' },
  Hindi:             { fg: '#dc2626', bg: '#fee2e2', icon: '🇮🇳' },
  'Social Science':  { fg: '#d97706', bg: '#fef3c7', icon: '🗺️' },
  'Computer Science':{ fg: '#0891b2', bg: '#cffafe', icon: '💻' },
  Sanskrit:          { fg: '#be185d', bg: '#fce7f3', icon: '📜' },
  Physics:           { fg: '#1d4ed8', bg: '#dbeafe', icon: '⚛️' },
  Chemistry:         { fg: '#059669', bg: '#d1fae5', icon: '🧪' },
  Biology:           { fg: '#16a34a', bg: '#dcfce7', icon: '🌿' },
  History:           { fg: '#92400e', bg: '#fef3c7', icon: '🏛️' },
  Geography:         { fg: '#065f46', bg: '#d1fae5', icon: '🌍' },
  Civics:            { fg: '#1e40af', bg: '#dbeafe', icon: '⚖️' },
  'Physical Education': { fg: '#b45309', bg: '#fef9c3', icon: '🏃' },
}

const getSubjectStyle = (name) =>
  SUBJECT_COLORS[name] ?? { fg: '#374151', bg: '#f3f4f6', icon: '📚' }

// Format date for display
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Today in YYYY-MM-DD
const todayISO = () => new Date().toISOString().split('T')[0]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

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
      <button onClick={onClose} className="ml-1 opacity-75 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SUBJECT BADGE ────────────────────────────────────────────────────────────
function SubjectBadge({ name, size = 'md' }) {
  const { fg, bg, icon } = getSubjectStyle(name)
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg font-semibold
        ${size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-[12px]'}`}
      style={{ background: bg, color: fg }}
    >
      <span className="text-[13px] leading-none">{icon}</span>
      {name}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12 align-top pt-4">
        {idx}
      </td>

      {/* Subject */}
      <td className="px-4 py-3.5 w-48 align-top pt-4">
        <SubjectBadge name={row.Subject} />
      </td>

      {/* Homework Description */}
      <td className="px-4 py-3.5 align-top">
        <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
          {row['Home Work']}
        </p>
      </td>
    </tr>
  )
}

// ─── MOBILE HOMEWORK CARD ──────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg, icon } = getSubjectStyle(row.Subject)
  // Show first ~80 chars as preview
  const preview = row['Home Work'].length > 80
    ? row['Home Work'].slice(0, 80) + '…'
    : row['Home Work']

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Subject icon badge */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[18px]"
          style={{ background: bg }}
        >
          {icon}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">#{idx}</span>
            <p className="text-[14px] font-bold leading-tight truncate" style={{ color: fg }}>
              {row.Subject}
            </p>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
            {preview}
          </p>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 bg-slate-50/40 dark:bg-white/[0.015]">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-3.5 h-3.5 flex-shrink-0" style={{ color: fg }} />
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: fg }}>
              Homework Details
            </span>
          </div>
          <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
            {row['Home Work']}
          </p>
        </div>
      )}
    </div>
  )
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
function Skeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-5 space-y-3">
      <div className="h-5 w-48 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-3 items-start" style={{ opacity: 1 - i * 0.18 }}>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-28 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="h-3 w-3/4 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── SUMMARY BAR ─────────────────────────────────────────────────────────────
function SummaryBar({ date, count }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 shadow-sm">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
          <ClipboardList className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
            Daily Homework
          </p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            {formatDisplayDate(date)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 text-[12px] font-bold">
          <BookMarked className="w-3.5 h-3.5" />
          {count} Subject{count !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DailyHomework() {
  const [selectedDate, setSelectedDate] = useState(todayISO())
  const [dateError,    setDateError]    = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownDate,    setShownDate]    = useState('')
  const [search,       setSearch]       = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & fetch ──────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!selectedDate) {
      setDateError('Please select a date')
      return
    }
    setDateError('')
    setLoading(true)
    setSearch('')

    // Simulate API call
    setTimeout(() => {
      const data = HOMEWORK_DATA[selectedDate] || []
      setRows(data)
      setShownDate(selectedDate)
      setShown(true)
      setLoading(false)
      if (data.length === 0) {
        showToast(`No homework found for ${formatDisplayDate(selectedDate)}.`, 'error')
      } else {
        showToast(`${data.length} subject(s) loaded for ${formatDisplayDate(selectedDate)}.`)
      }
    }, 600)
  }, [selectedDate])

  const handleReset = () => {
    setSelectedDate(todayISO())
    setRows([])
    setSearch('')
    setDateError('')
    setShown(false)
    setShownDate('')
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.Subject.toLowerCase().includes(q) ||
      r['Home Work'].toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults = shown && rows.length > 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400 flex-shrink-0" />
            Daily Homework
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View subject-wise homework assigned for any date.
          </p>
        </div>
      </div>

      {/* ── Filter / Date Selector Card ────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Select Date</span>
        </div>

        {/* Filter body */}
        <div className="p-5">
          {/* On mobile: stacked. On desktop: inline row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-end">

            {/* Date input */}
            <div className="flex flex-col gap-1 flex-1 sm:max-w-xs">
              <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value)
                    if (e.target.value) setDateError('')
                  }}
                  max={todayISO()}
                  className={`w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 cursor-pointer
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                    ${dateError
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                    }`}
                />
              </div>
              {dateError && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />{dateError}
                </p>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 sm:pb-0">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                  transition-colors"
                title="Reset"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hint */}
          <p className="mt-3 flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            Select any date and click <strong className="text-slate-500 dark:text-slate-400">Show</strong> to view homework.
          </p>
        </div>
      </div>

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && <Skeleton />}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary bar */}
          <SummaryBar date={shownDate} count={rows.length} />

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header with search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                  Homework List
                </span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">
                  · {formatDisplayDate(shownDate)}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search box */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search subject or task…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                All subjects assigned homework for this date are listed below. Complete each task before the next class.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Subject', 'Description / Homework'].map((h, i) => (
                        <th
                          key={i}
                          className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                            ${i === 0 ? 'text-center w-12' : 'text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.Subject}-${i}`} row={row} idx={i + 1} />
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
                    Tap a card to read full homework details.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.Subject}-${i}`} row={row} idx={i + 1} />
                  ))}
                </>
              )}
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span>
                {' '}subject{rows.length !== 1 ? 's' : ''}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── No Data State (shown but empty) ──────────────────────────────── */}
      {shown && !loading && rows.length === 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <BookOpen className="w-7 h-7 text-amber-400 dark:text-amber-500 opacity-70" />
            </div>
            <div className="text-center px-6">
              <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
                No homework for this date
              </p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
                No homework was assigned on{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  {formatDisplayDate(shownDate)}
                </span>.
                Try selecting a different date.
              </p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-blue-50 text-blue-700 hover:bg-blue-100
                dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Try Another Date
            </button>
          </div>
        </div>
      )}

      {/* ── Initial Empty State ───────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
              No report generated yet
            </p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a date and click <strong>Show</strong> to view homework.
            </p>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
