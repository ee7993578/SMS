/**
 * DailyHomeworkReport.jsx
 * Folder: src/pages/Reports/DailyHomeworkReport.jsx
 *
 * Converts legacy ASPX "Show Daily Home Work" report to fully-responsive React + Tailwind.
 *
 * Workflow (matches original ASPX):
 *  - Select Class (dropdown)
 *  - Select Date (calendar picker)
 *  - Submit -> validates both fields -> shows homework grid grouped by Class/Section
 *
 * Each class group shows a header (Class - Section) followed by a subject-wise
 * table of homework descriptions (S.No, Subject, Homework).
 *
 * Features:
 *  - Class dropdown filter + Date picker
 *  - Show report button with validation
 *  - Grouped homework cards/tables by class-section
 *  - Mobile: stacked accordion cards per class group, subject-wise list
 *  - Desktop: dense ERP-style grouped tables
 */

import { useState, useCallback, useMemo } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown, ChevronRight,
  CalendarDays, BookOpen, ClipboardList,
  SlidersHorizontal, Info, Search,
  School2, FileWarning, Layers
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

// Homework data keyed by "Class|Date" -> array of class-section groups
const HOMEWORK_DATA = {
  'Class V|2026-06-13': [
    {
      sec_id: 'A',
      class_name: 'Class V - A',
      subjects: [
        { id: 1, subject: 'Mathematics', homework_desc: 'Complete exercise 4.2 (Q1 to Q10) from the textbook. Show all working steps.' },
        { id: 2, subject: 'English',      homework_desc: 'Write a paragraph (100-120 words) on "My Favourite Festival" in the notebook.' },
        { id: 3, subject: 'Science',      homework_desc: 'Draw and label the diagram of the digestive system on a chart sheet.' },
        { id: 4, subject: 'Hindi',        homework_desc: 'Learn poem "Bharat Mahan" for recitation tomorrow.' },
        { id: 5, subject: 'Social Studies', homework_desc: 'Prepare a short note on the Indian freedom movement leaders (any 3).' },
      ],
    },
    {
      sec_id: 'B',
      class_name: 'Class V - B',
      subjects: [
        { id: 1, subject: 'Mathematics', homework_desc: 'Practice multiplication tables 12 to 15, five times each.' },
        { id: 2, subject: 'English',      homework_desc: 'Complete the grammar worksheet on tenses (Worksheet 7).' },
        { id: 3, subject: 'Science',      homework_desc: 'Revise chapter 6 for the upcoming class test on Monday.' },
      ],
    },
  ],
  'Class VI|2026-06-13': [
    {
      sec_id: 'A',
      class_name: 'Class VI - A',
      subjects: [
        { id: 1, subject: 'Mathematics', homework_desc: 'Solve all questions from exercise 5.1 - Integers.' },
        { id: 2, subject: 'English',      homework_desc: 'Read chapter 3 "A Pact with the Sun" and answer questions 1-5.' },
        { id: 3, subject: 'Science',      homework_desc: 'Complete the lab activity record for the previous experiment.' },
        { id: 4, subject: 'Computer',     homework_desc: 'Practice typing exercise - lesson 4 (30 minutes daily).' },
      ],
    },
    {
      sec_id: 'B',
      class_name: 'Class VI - B',
      subjects: [
        { id: 1, subject: 'Hindi',        homework_desc: 'व्याकरण अभ्यास पुस्तिका के पृष्ठ 12-13 हल करें।' },
        { id: 2, subject: 'Social Studies', homework_desc: 'Make a labelled map of India showing major rivers.' },
      ],
    },
  ],
  'Class X|2026-06-13': [
    {
      sec_id: 'A',
      class_name: 'Class X - A',
      subjects: [
        { id: 1, subject: 'Mathematics', homework_desc: 'Complete previous year board question paper (2023) - Sections A and B.' },
        { id: 2, subject: 'Physics',      homework_desc: 'Numericals from chapter "Electricity" - Q1 to Q15.' },
        { id: 3, subject: 'Chemistry',    homework_desc: 'Balance the chemical equations given in worksheet 9.' },
        { id: 4, subject: 'Biology',      homework_desc: 'Make notes on "Life Processes" - Nutrition and Respiration.' },
        { id: 5, subject: 'English',      homework_desc: 'Write a formal letter to the editor on water conservation.' },
        { id: 6, subject: 'Social Science', homework_desc: 'Prepare answers for chapter 4 - "Age of Industrialization".' },
      ],
    },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const SECTION_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
]
const sectionColor = (sec) => SECTION_COLORS[(sec?.charCodeAt(0) ?? 0) % SECTION_COLORS.length]

// Format date for storage key: yyyy-mm-dd
const toKey = (dateStr) => dateStr

// Format date for display: dd MMM yyyy
const formatDisplayDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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

function DateInput({ value, onChange, error }) {
  return (
    <div className="relative">
      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input
        type="date"
        value={value}
        onChange={onChange}
        className={`w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      />
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

// ─── DESKTOP: SUBJECT TABLE FOR ONE SECTION GROUP ─────────────────────────────
function DesktopGroupTable({ group }) {
  const { fg, bg } = sectionColor(group.sec_id)

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Group Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {group.sec_id}
        </span>
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{group.class_name}</span>
        <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
          {group.subjects.length} subject{group.subjects.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
            <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-14">S.No</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-44">Subject</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Homework</th>
          </tr>
        </thead>
        <tbody>
          {group.subjects.map((s, i) => (
            <tr key={s.id} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] last:border-0 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums align-top">{i + 1}</td>
              <td className="px-4 py-3 align-top">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-indigo-400 flex-shrink-0" />
                  {s.subject}
                </span>
              </td>
              <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed align-top">{s.homework_desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE: ACCORDION CARD FOR ONE SECTION GROUP ─────────────────────────────
function MobileGroupCard({ group, defaultOpen }) {
  const [expanded, setExpanded] = useState(!!defaultOpen)
  const { fg, bg } = sectionColor(group.sec_id)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible, tap to expand */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {group.sec_id}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{group.class_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {group.subjects.length} subject{group.subjects.length !== 1 ? 's' : ''} with homework
          </p>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded subject list */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
          {group.subjects.map((s, i) => (
            <div key={s.id} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-shrink-0 tabular-nums">
                  {i + 1}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-700 dark:text-slate-200">
                  <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-indigo-400 flex-shrink-0" />
                  {s.subject}
                </span>
              </div>
              <p className="text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed pl-7">{s.homework_desc}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, selectedClass, setSelectedClass, date, setDate, onShow, loading, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Class &amp; Date</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Class" error={errors.selectedClass} required>
            <NativeSelect
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              placeholder="-- Select Class --"
              error={errors.selectedClass}
            >
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Date" error={errors.date} required>
            <DateInput value={date} onChange={e => setDate(e.target.value)} error={errors.date} />
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
export default function DailyHomeworkReport() {
  const [selectedClass, setSelectedClass] = useState('')
  const [date,          setDate]          = useState('')
  const [groups,        setGroups]        = useState([])
  const [loading,       setLoading]       = useState(false)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [search,        setSearch]        = useState('')
  const [errors,        setErrors]        = useState({})
  const [toast,         setToast]         = useState(null)
  const [shown,         setShown]         = useState(false)
  const [shownClass,    setShownClass]    = useState('')
  const [shownDate,     setShownDate]     = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate + Fetch (simulate API / postback) ────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!selectedClass) err.selectedClass = 'Please select a class'
    if (!date) err.date = 'Please select a date'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const key = `${selectedClass}|${toKey(date)}`
      const data = HOMEWORK_DATA[key] || []
      setGroups(data)
      setShownClass(selectedClass)
      setShownDate(date)
      setShown(true)
      setLoading(false)

      if (data.length === 0) {
        showToast('No homework records found for the selected class & date.', 'error')
      } else {
        showToast(`Loaded homework for ${selectedClass} on ${formatDisplayDate(date)}.`)
      }
    }, 650)
  }, [selectedClass, date])

  const handleReset = () => {
    setSelectedClass(''); setDate(''); setGroups([])
    setSearch(''); setErrors({}); setShown(false)
    setShownClass(''); setShownDate('')
  }

  // ── Search filter (matches by section, subject or homework text) ──────────
  const filteredGroups = useMemo(() => {
    if (!search) return groups
    const q = search.toLowerCase()
    return groups
      .map(g => ({
        ...g,
        subjects: g.subjects.filter(s =>
          s.subject.toLowerCase().includes(q) ||
          s.homework_desc.toLowerCase().includes(q) ||
          g.class_name.toLowerCase().includes(q) ||
          g.sec_id.toLowerCase().includes(q)
        ),
      }))
      .filter(g => g.subjects.length > 0)
  }, [groups, search])

  const hasResults    = shown && groups.length > 0
  const noRecordFound = shown && groups.length === 0 && !loading
  const totalSubjects = useMemo(
    () => filteredGroups.reduce((s, g) => s + g.subjects.length, 0),
    [filteredGroups]
  )
  const activeFilters = (selectedClass ? 1 : 0) + (date ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Daily Homework Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View homework assigned to each section, subject-wise, for a selected class and date.
          </p>
        </div>
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
            <Field label="Class" error={errors.selectedClass} required>
              <NativeSelect
                value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setErrors(p => ({ ...p, selectedClass: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.selectedClass}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Date" error={errors.date} required>
              <DateInput
                value={date}
                onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: undefined })) }}
                error={errors.date}
              />
            </Field>

            {/* Spacer */}
            <div className="hidden lg:block" />

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
          {selectedClass && date
            ? `${selectedClass} · ${formatDisplayDate(date)}`
            : 'Select Class & Date'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {shown && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        date={date}
        setDate={setDate}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-5 space-y-3">
              <div className="h-9 w-40 rounded-lg bg-slate-100 dark:bg-slate-800 animate-pulse" />
              {[...Array(3)].map((__, j) => (
                <div key={j} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - j * 0.15 }} />
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary banner */}
          <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <span className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <School2 className="w-5 h-5" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{shownClass}</p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" /> {formatDisplayDate(shownDate)}
                </p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  <Layers className="w-3.5 h-3.5" /> {filteredGroups.length} section{filteredGroups.length !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
                  <BookOpen className="w-3.5 h-3.5" /> {totalSubjects} subject{totalSubjects !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by section, subject or homework text…"
              className="w-full pl-10 pr-9 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300 shadow-sm
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1a1f35] dark:text-slate-200 dark:border-[rgba(99,102,241,0.2)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Info hint */}
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50/50 dark:bg-blue-500/[0.04] border border-blue-100 dark:border-blue-500/10">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              Homework is grouped section-wise. Each table lists the subject and the homework assigned for that section.
            </p>
          </div>

          {/* No search results */}
          {filteredGroups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No homework matches your search.</span>
            </div>
          ) : (
            <>
              {/* ── DESKTOP: grouped tables ── */}
              <div className="hidden md:block space-y-4">
                {filteredGroups.map((g, idx) => (
                  <DesktopGroupTable key={`${g.sec_id}-${idx}`} group={g} />
                ))}
              </div>

              {/* ── MOBILE: accordion cards ── */}
              <div className="md:hidden space-y-3">
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap a section to view subject-wise homework.
                </p>
                {filteredGroups.map((g, idx) => (
                  <MobileGroupCard key={`${g.sec_id}-${idx}`} group={g} defaultOpen={idx === 0} />
                ))}
              </div>
            </>
          )}
        </>
      )}

      {/* ── No Record Found State (matches ASPX "No Record Found....") ────── */}
      {noRecordFound && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <FileWarning className="w-7 h-7 text-amber-500 dark:text-amber-400" />
          </div>
          <div className="text-center px-6">
            <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-300">No Record Found</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              No homework has been assigned for <strong>{shownClass}</strong> on <strong>{formatDisplayDate(shownDate)}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── Empty State (initial, nothing submitted yet) ──────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a class and date, then click <strong>Show</strong> to view the daily homework report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
