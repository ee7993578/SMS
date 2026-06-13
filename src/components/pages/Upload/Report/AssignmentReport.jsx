/**
 * AssignmentReport.jsx
 * Folder: src/pages/Reports/Uploads/AssignmentReport.jsx
 *
 * Converts legacy ASPX "Show Assignments" report to fully-responsive React + Tailwind.
 *
 * Structure (from ASPX nested GridView):
 *  - Session dropdown filter
 *  - Show button
 *  - Outer grid: one block per Class (header row, no header shown — ShowHeader=False)
 *  - Inner grid per class: S.No, Subject, Total Assignment (commented-out Teacher/Subjects
 *    fields preserved as notes for future use)
 *
 * Desktop: class-grouped sections with compact subject tables.
 * Mobile: class accordions, each subject as a tappable row/card — no horizontal scroll.
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, Loader2, ChevronDown, ChevronRight,
  AlertCircle, X, Check, Search, Info,
  ClipboardList, BookOpen, Layers, FileText, Hash,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

// Mirrors the GridView1 (outer, per class) -> GridView2 (inner, per subject) structure.
// sec_id was bound as a CssClass in the legacy markup — kept here as an identifier.
const ASSIGNMENT_DATA = {
  '2025-26': [
    {
      sec_id: 'cls-9-a',
      class_name: 'Class IX - A',
      subjects: [
        { subject: 'Mathematics', assigncount: 12 },
        { subject: 'Science', assigncount: 9 },
        { subject: 'English', assigncount: 7 },
        { subject: 'Social Science', assigncount: 5 },
        { subject: 'Hindi', assigncount: 4 },
        { subject: 'Computer Science', assigncount: 6 },
      ],
    },
    {
      sec_id: 'cls-9-b',
      class_name: 'Class IX - B',
      subjects: [
        { subject: 'Mathematics', assigncount: 10 },
        { subject: 'Science', assigncount: 8 },
        { subject: 'English', assigncount: 6 },
        { subject: 'Social Science', assigncount: 4 },
        { subject: 'Hindi', assigncount: 3 },
      ],
    },
    {
      sec_id: 'cls-10-a',
      class_name: 'Class X - A',
      subjects: [
        { subject: 'Mathematics', assigncount: 15 },
        { subject: 'Science', assigncount: 13 },
        { subject: 'English', assigncount: 8 },
        { subject: 'Social Science', assigncount: 7 },
        { subject: 'Hindi', assigncount: 5 },
        { subject: 'Computer Science', assigncount: 9 },
        { subject: 'Sanskrit', assigncount: 2 },
      ],
    },
    {
      sec_id: 'cls-11-a',
      class_name: 'Class XI - A (Science)',
      subjects: [
        { subject: 'Physics', assigncount: 11 },
        { subject: 'Chemistry', assigncount: 10 },
        { subject: 'Biology', assigncount: 8 },
        { subject: 'Mathematics', assigncount: 14 },
        { subject: 'English', assigncount: 4 },
      ],
    },
    {
      sec_id: 'cls-11-b',
      class_name: 'Class XI - B (Commerce)',
      subjects: [
        { subject: 'Accountancy', assigncount: 9 },
        { subject: 'Business Studies', assigncount: 7 },
        { subject: 'Economics', assigncount: 6 },
        { subject: 'English', assigncount: 4 },
        { subject: 'Mathematics', assigncount: 8 },
      ],
    },
    {
      sec_id: 'cls-12-a',
      class_name: 'Class XII - A (Science)',
      subjects: [
        { subject: 'Physics', assigncount: 13 },
        { subject: 'Chemistry', assigncount: 12 },
        { subject: 'Biology', assigncount: 10 },
        { subject: 'Mathematics', assigncount: 16 },
        { subject: 'English', assigncount: 3 },
      ],
    },
  ],
  '2024-25': [
    {
      sec_id: 'cls-9-a',
      class_name: 'Class IX - A',
      subjects: [
        { subject: 'Mathematics', assigncount: 9 },
        { subject: 'Science', assigncount: 7 },
        { subject: 'English', assigncount: 5 },
        { subject: 'Hindi', assigncount: 3 },
      ],
    },
    {
      sec_id: 'cls-10-a',
      class_name: 'Class X - A',
      subjects: [
        { subject: 'Mathematics', assigncount: 11 },
        { subject: 'Science', assigncount: 10 },
        { subject: 'English', assigncount: 6 },
        { subject: 'Social Science', assigncount: 5 },
      ],
    },
  ],
  '2023-24': [],
  '2022-23': [],
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
const SUBJECT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const subjectColor = (name) => SUBJECT_COLORS[(name?.charCodeAt(0) ?? 0) % SUBJECT_COLORS.length]

const subjectAbbr = (name = '') =>
  name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

// ─── PRIMITIVE COMPONENTS ───────────────────────────────────────────────────

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

// ─── DESKTOP: CLASS BLOCK (table of subjects) ──────────────────────────────
function DesktopClassBlock({ classItem, search }) {
  const filteredSubjects = useMemo(() => {
    if (!search) return classItem.subjects
    const q = search.toLowerCase()
    return classItem.subjects.filter((s) => s.subject.toLowerCase().includes(q))
  }, [classItem.subjects, search])

  const classTotal = classItem.subjects.reduce((s, r) => s + r.assigncount, 0)

  if (filteredSubjects.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Class header */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{classItem.class_name}</span>
        </div>
        <span className="flex-shrink-0 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 tabular-nums">
          {classTotal} total
        </span>
      </div>

      {/* Subject table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
            <th className="px-4 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 w-14">S.No</th>
            <th className="px-4 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Subject</th>
            <th className="px-4 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 w-44">Total Assignment</th>
          </tr>
        </thead>
        <tbody>
          {filteredSubjects.map((s, i) => {
            const { fg, bg } = subjectColor(s.subject)
            return (
              <tr
                key={s.subject}
                className="border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] last:border-b-0 hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
              >
                <td className="px-4 py-2.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{i + 1}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                      style={{ background: bg, color: fg }}
                    >
                      {subjectAbbr(s.subject)}
                    </span>
                    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{s.subject}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-center">
                  <span className="inline-flex items-center justify-center min-w-[2.25rem] px-2.5 py-1 rounded-lg text-[12px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
                    {s.assigncount}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE: CLASS ACCORDION ────────────────────────────────────────────────
function MobileClassAccordion({ classItem, search, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  const filteredSubjects = useMemo(() => {
    if (!search) return classItem.subjects
    const q = search.toLowerCase()
    return classItem.subjects.filter((s) => s.subject.toLowerCase().includes(q))
  }, [classItem.subjects, search])

  const classTotal = classItem.subjects.reduce((s, r) => s + r.assigncount, 0)

  if (filteredSubjects.length === 0) return null

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Class header — tap to expand */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <Layers className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{classItem.class_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{filteredSubjects.length} subject{filteredSubjects.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[18px] font-bold text-blue-700 dark:text-blue-400 tabular-nums leading-tight">{classTotal}</span>
          <span className="text-[10px] text-slate-400">assignments</span>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Subject rows */}
      {open && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] divide-y divide-slate-50 dark:divide-[rgba(99,102,241,0.05)]">
          {filteredSubjects.map((s, i) => {
            const { fg, bg } = subjectColor(s.subject)
            return (
              <div key={s.subject} className="flex items-center gap-3 px-4 py-3">
                <span className="w-6 text-[11px] text-slate-400 dark:text-slate-500 tabular-nums text-center flex-shrink-0">{i + 1}</span>
                <span
                  className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                  style={{ background: bg, color: fg }}
                >
                  {subjectAbbr(s.subject)}
                </span>
                <span className="flex-1 text-[13px] font-medium text-slate-700 dark:text-slate-200 truncate">{s.subject}</span>
                <span className="inline-flex items-center justify-center min-w-[2.25rem] px-2.5 py-1 rounded-lg text-[12px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums flex-shrink-0">
                  {s.assigncount}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, onShow, loading, errors }) {
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
            <Filter className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Session</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={(e) => setSession(e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AssignmentReport() {
  const [session, setSession] = useState('')
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [shown, setShown] = useState(false)
  const [shownSession, setShownSession] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (placeholder for ddlsession_SelectedIndexChanged / Button3_Click) ─
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    // TODO: replace with real API call, e.g.
    // const res = await fetch(`/api/reports/assignments?session=${session}`)
    setTimeout(() => {
      const data = ASSIGNMENT_DATA[session] || []
      setClasses(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      if (data.length === 0) {
        showToast('No records found for this session.', 'error')
      } else {
        showToast(`Loaded assignment data for ${data.length} class${data.length !== 1 ? 'es' : ''}.`)
      }
    }, 650)
  }, [session])

  const handleReset = () => {
    setSession('')
    setClasses([])
    setSearch('')
    setErrors({})
    setShown(false)
    setShownSession('')
  }

  // ── Search filter (matches class name or subject) ──────────────────────────
  const filteredClasses = useMemo(() => {
    if (!search) return classes
    const q = search.toLowerCase()
    return classes
      .map((c) => {
        const classMatches = c.class_name.toLowerCase().includes(q)
        if (classMatches) return c
        const subjects = c.subjects.filter((s) => s.subject.toLowerCase().includes(q))
        return subjects.length ? { ...c, subjects } : null
      })
      .filter(Boolean)
  }, [classes, search])

  // ── Grand summary ───────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const totalAssignments = classes.reduce(
      (sum, c) => sum + c.subjects.reduce((s, r) => s + r.assigncount, 0),
      0
    )
    const totalSubjects = classes.reduce((sum, c) => sum + c.subjects.length, 0)
    return { totalAssignments, totalSubjects, totalClasses: classes.length }
  }, [classes])

  const hasResults = shown && classes.length > 0
  const noResultsAfterSearch = hasResults && filteredClasses.length === 0
  const activeFilters = session ? 1 : 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Show Assignments
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Class &amp; section-wise count of assignments uploaded per subject.
        </p>
      </div>

      {/* ── DESKTOP Filter Card ────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={(e) => { setSession(e.target.value); setErrors((p) => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacers to align action buttons to the right on wide screens */}
            <div />
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

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <Filter className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Session'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
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
        session={session}
        setSession={setSession}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                <Layers className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{summary.totalClasses}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Classes</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <BookOpen className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{summary.totalSubjects}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Subjects</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm">
              <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
                <FileText className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{summary.totalAssignments}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">Total Assignments</p>
              </div>
            </div>
          </div>

          {/* Session + search bar */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Assignment Summary</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search class or subject…"
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

            {/* Info hint */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Each card shows total assignments uploaded per subject for that class &amp; section.
              </p>
            </div>

            {/* Content area */}
            <div className="p-4 sm:p-5">
              {noResultsAfterSearch ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No classes or subjects match your search.</span>
                </div>
              ) : (
                <>
                  {/* DESKTOP: grid of class blocks */}
                  <div className="hidden md:grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredClasses.map((c) => (
                      <DesktopClassBlock key={c.sec_id} classItem={c} search={search} />
                    ))}
                  </div>

                  {/* MOBILE: accordions */}
                  <div className="md:hidden space-y-3">
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      Tap a class to view its subjects.
                    </p>
                    {filteredClasses.map((c, idx) => (
                      <MobileClassAccordion
                        key={c.sec_id}
                        classItem={c}
                        search={search}
                        defaultOpen={idx === 0 && !search}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State (no records for selected session) ──────────────────── */}
      {shown && classes.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No Record Found</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              No assignments found for session <strong>{shownSession}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── Initial Empty State (nothing shown yet) ─────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to view the assignment report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
