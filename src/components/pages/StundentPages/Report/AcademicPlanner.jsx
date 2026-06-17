/**
 * AcademicPlanner.jsx
 * Folder: src/pages/Student/Reports/AcademicPlanner.jsx
 *
 * Converts legacy ASPX "Academic Planner" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class / Section / Subject filter bar (desktop inline, mobile bottom drawer)
 *  - Show / Reset buttons with loading state
 *  - GridView → desktop table with S.No, Title, File columns
 *  - "Show" link opens an inline PDF / doc viewer panel (accordion style)
 *  - Mobile: collapsible cards with viewer inside
 *  - Grand count footer
 *  - Toast notifications
 *  - Empty & loading states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, BookOpen,
  FileText, School2, GraduationCap,
  CalendarDays, ChevronRight, Download,
  ExternalLink, BookMarked, Layers,
  Info, BarChart3, FileSpreadsheet,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SECTIONS = ['A', 'B', 'C', 'D']

const SUBJECTS = [
  'All Subjects',
  'English', 'Hindi', 'Mathematics', 'Science',
  'Social Science', 'Sanskrit', 'Computer Science',
  'Physics', 'Chemistry', 'Biology', 'History',
  'Geography', 'Economics', 'Accountancy',
]

// file_path doubles as a Tailwind CSS class in the original ASPX (legacy pattern);
// here we store a real relative path / URL for the preview.
const PLANNER_DATA = {
  'Nursery-A': [
    { id: 1, title: 'Monthly Academic Planner – April',    subject: 'All Subjects',  file_path: '/planners/nursery_a_april.pdf'   },
    { id: 2, title: 'Monthly Academic Planner – May',      subject: 'All Subjects',  file_path: '/planners/nursery_a_may.pdf'     },
    { id: 3, title: 'Activity Schedule – Q1',              subject: 'All Subjects',  file_path: '/planners/nursery_a_q1.pdf'      },
  ],
  'LKG-A': [
    { id: 1, title: 'Term-1 Syllabus Planner',             subject: 'English',       file_path: '/planners/lkg_a_term1_eng.pdf'   },
    { id: 2, title: 'Term-1 Maths Worksheet Schedule',     subject: 'Mathematics',   file_path: '/planners/lkg_a_term1_math.pdf'  },
  ],
  'LKG-B': [
    { id: 1, title: 'Term-1 Syllabus Planner',             subject: 'English',       file_path: '/planners/lkg_b_term1_eng.pdf'   },
  ],
  'Class VI-A': [
    { id: 1, title: 'Annual Academic Planner 2025-26',     subject: 'All Subjects',  file_path: '/planners/vi_a_annual.pdf'       },
    { id: 2, title: 'Science Lab Schedule',                subject: 'Science',       file_path: '/planners/vi_a_sci_lab.pdf'      },
    { id: 3, title: 'English Literature Planner – Q1',     subject: 'English',       file_path: '/planners/vi_a_eng_q1.pdf'       },
    { id: 4, title: 'Mathematics Chapter Plan',            subject: 'Mathematics',   file_path: '/planners/vi_a_math.pdf'         },
  ],
  'Class IX-A': [
    { id: 1, title: 'Annual Planner 2025-26',              subject: 'All Subjects',  file_path: '/planners/ix_a_annual.pdf'       },
    { id: 2, title: 'Physics Chapter-wise Plan',           subject: 'Physics',       file_path: '/planners/ix_a_physics.pdf'      },
    { id: 3, title: 'Chemistry Lab Schedule',              subject: 'Chemistry',     file_path: '/planners/ix_a_chem.pdf'         },
    { id: 4, title: 'Mathematics Practice Schedule',       subject: 'Mathematics',   file_path: '/planners/ix_a_math.pdf'         },
    { id: 5, title: 'English Writing Skills Planner',      subject: 'English',       file_path: '/planners/ix_a_eng.pdf'          },
  ],
  'Class X-A': [
    { id: 1, title: 'Board Exam Preparation Planner',      subject: 'All Subjects',  file_path: '/planners/x_a_board.pdf'         },
    { id: 2, title: 'Revision Schedule – Term 2',          subject: 'Mathematics',   file_path: '/planners/x_a_rev_math.pdf'      },
    { id: 3, title: 'Science Term-wise Planner',           subject: 'Science',       file_path: '/planners/x_a_sci.pdf'           },
  ],
  'Class XI-A': [
    { id: 1, title: 'Annual Academic Planner',             subject: 'All Subjects',  file_path: '/planners/xi_a_annual.pdf'       },
    { id: 2, title: 'Physics Practical Schedule',          subject: 'Physics',       file_path: '/planners/xi_a_phy_prac.pdf'     },
    { id: 3, title: 'Chemistry Theory Planner',            subject: 'Chemistry',     file_path: '/planners/xi_a_chem.pdf'         },
  ],
  'Class XII-A': [
    { id: 1, title: 'Board Revision Planner',              subject: 'All Subjects',  file_path: '/planners/xii_a_board.pdf'       },
    { id: 2, title: 'Pre-Board Schedule',                  subject: 'All Subjects',  file_path: '/planners/xii_a_preboard.pdf'    },
    { id: 3, title: 'Mathematics Last-60-Days Plan',       subject: 'Mathematics',   file_path: '/planners/xii_a_math60.pdf'      },
    { id: 4, title: 'Physics Formula Revision Plan',       subject: 'Physics',       file_path: '/planners/xii_a_phy.pdf'         },
  ],
}

// Fallback for combos not in the dummy data
const DEFAULT_ROWS = [
  { id: 1, title: 'Annual Academic Planner',      subject: 'All Subjects', file_path: '/planners/default_annual.pdf' },
  { id: 2, title: 'Term-1 Syllabus Overview',     subject: 'All Subjects', file_path: '/planners/default_term1.pdf'  },
  { id: 3, title: 'Holiday & Exam Schedule',      subject: 'All Subjects', file_path: '/planners/default_holiday.pdf'},
]

// Subject badge colours
const SUBJECT_COLORS = {
  'All Subjects':    { fg: '#1d4ed8', bg: '#dbeafe' },
  'English':         { fg: '#0891b2', bg: '#cffafe' },
  'Hindi':           { fg: '#7c3aed', bg: '#ede9fe' },
  'Mathematics':     { fg: '#059669', bg: '#d1fae5' },
  'Science':         { fg: '#d97706', bg: '#fef3c7' },
  'Physics':         { fg: '#dc2626', bg: '#fee2e2' },
  'Chemistry':       { fg: '#0369a1', bg: '#e0f2fe' },
  'Biology':         { fg: '#065f46', bg: '#d1fae5' },
  'Social Science':  { fg: '#92400e', bg: '#fef3c7' },
  'Computer Science':{ fg: '#5b21b6', bg: '#ede9fe' },
}
const subjectColor = (s) =>
  SUBJECT_COLORS[s] ?? { fg: '#475569', bg: '#f1f5f9' }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getRows = (cls, sec) => {
  const key = `${cls}-${sec}`
  return PLANNER_DATA[key] ?? DEFAULT_ROWS
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

// ─── INLINE FILE VIEWER (simulated) ──────────────────────────────────────────
function FileViewer({ row, onClose }) {
  return (
    <div className="mt-2 rounded-xl border border-blue-100 dark:border-indigo-500/25 bg-blue-50/60 dark:bg-indigo-500/[0.06] overflow-hidden">
      {/* Viewer toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-blue-100 dark:border-indigo-500/20">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 truncate max-w-[200px] sm:max-w-none">
            {row.title}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            title="Download"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold
              bg-emerald-100 text-emerald-700 hover:bg-emerald-200
              dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>
          <button
            type="button"
            title="Open in new tab"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold
              bg-blue-100 text-blue-700 hover:bg-blue-200
              dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 dark:hover:bg-slate-700/40 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Simulated PDF preview area */}
      <div className="flex flex-col items-center justify-center gap-3 py-10 px-4">
        <div className="w-16 h-20 rounded-lg bg-white dark:bg-[#1a1f35] border border-blue-200 dark:border-indigo-500/25 shadow-md flex flex-col overflow-hidden">
          <div className="h-3 bg-red-500 flex items-center px-1.5">
            <span className="text-[7px] font-bold text-white tracking-wider">PDF</span>
          </div>
          <div className="flex-1 p-1 space-y-1">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-1 rounded-full bg-slate-200 dark:bg-slate-700" style={{ width: `${70 + (i % 3) * 10}%` }} />
            ))}
          </div>
        </div>
        <div className="text-center">
          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.title}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{row.file_path}</p>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 mt-2 font-medium">
            PDF preview loads here after API integration.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm shadow-emerald-500/20"
          >
            <Download className="w-3.5 h-3.5" /> Download File
          </button>
          <button
            type="button"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Open in Tab
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onShow }) {
  const [open, setOpen] = useState(false)
  const { fg, bg } = subjectColor(row.subject)

  const handleShow = () => {
    onShow(row)
    setOpen(p => !p)
  }

  return (
    <>
      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        {/* S.No */}
        <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
          {idx}
        </td>

        {/* Title */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
            </span>
            <div>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">
                {row.title}
              </p>
              <span
                className="inline-flex items-center mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: bg, color: fg }}
              >
                {row.subject}
              </span>
            </div>
          </div>
        </td>

        {/* File / Show */}
        <td className="px-4 py-3 text-center w-32">
          <button
            type="button"
            onClick={handleShow}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all
              ${open
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20'
              }`}
          >
            <Eye className="w-3.5 h-3.5" />
            {open ? 'Close' : 'Show'}
          </button>
        </td>
      </tr>

      {/* Inline viewer row */}
      {open && (
        <tr className="border-b border-blue-100 dark:border-indigo-500/15">
          <td colSpan={3} className="px-4 pb-4">
            <FileViewer row={row} onClose={() => setOpen(false)} />
          </td>
        </tr>
      )}
    </>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = subjectColor(row.subject)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Icon */}
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 mt-0.5">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug pr-2">{row.title}</p>
          <span
            className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {row.subject}
          </span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 mt-2 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pb-4 pt-3">
          <FileViewer row={row} onClose={() => setExpanded(false)} />
        </div>
      )}

      {/* Quick action strip */}
      {!expanded && (
        <div className="flex gap-2 px-4 pb-3">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Show File
          </button>
          <button
            type="button"
            className="px-3.5 py-2 rounded-xl text-[12px] font-semibold
              bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, cls, setCls, sec, setSec, subject, setSubject, onShow, loading, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => setCls(e.target.value)} placeholder="-- Select Class --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Section" error={errors.sec} required>
            <NativeSelect value={sec} onChange={e => setSec(e.target.value)} placeholder="-- Select Section --" error={errors.sec}>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subject">
            <NativeSelect value={subject} onChange={e => setSubject(e.target.value)}>
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
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
            Show Planner
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AcademicPlanner() {
  const [cls,       setCls]       = useState('')
  const [sec,       setSec]       = useState('')
  const [subject,   setSubject]   = useState('All Subjects')
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(false)
  const [filterOpen,setFilterOpen]= useState(false)
  const [search,    setSearch]    = useState('')
  const [errors,    setErrors]    = useState({})
  const [toast,     setToast]     = useState(null)
  const [shown,     setShown]     = useState(false)
  const [shownMeta, setShownMeta] = useState({ cls: '', sec: '', subject: '' })
  const [activeViewer, setActiveViewer] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & Fetch (simulated) ──────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!cls) err.cls = 'Please select a class'
    if (!sec) err.sec = 'Please select a section'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setActiveViewer(null)

    setTimeout(() => {
      let data = getRows(cls, sec)
      setRows(data)
      setShownMeta({ cls, sec, subject })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} planner(s) for ${cls} – Sec ${sec}.`)
    }, 700)
  }, [cls, sec, subject])

  const handleReset = () => {
    setCls(''); setSec(''); setSubject('All Subjects')
    setRows([]); setSearch(''); setErrors({})
    setShown(false); setShownMeta({ cls: '', sec: '', subject: '' })
    setActiveViewer(null)
  }

  // ── Subject + Search filter ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = rows
    if (subject !== 'All Subjects') {
      list = list.filter(r => r.subject === subject)
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(r => r.title.toLowerCase().includes(q) || r.subject.toLowerCase().includes(q))
    }
    return list
  }, [rows, subject, search])

  const hasResults = shown && rows.length > 0
  const activeFilters = [cls, sec].filter(Boolean).length

  // Unique subjects in current rows (for filter)
  const availableSubjects = useMemo(() => {
    const set = new Set(rows.map(r => r.subject))
    return ['All Subjects', ...Array.from(set).filter(s => s !== 'All Subjects')]
  }, [rows])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Academic Planner
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and download class-wise academic planners and syllabi.
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

            <Field label="Section" error={errors.sec} required>
              <NativeSelect
                value={sec}
                onChange={e => { setSec(e.target.value); setErrors(p => ({ ...p, sec: undefined })) }}
                placeholder="-- Select Section --"
                error={errors.sec}
              >
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
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
          {cls && sec ? `${cls} · Sec ${sec}` : 'Select Class & Section'}
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
        cls={cls} setCls={setCls}
        sec={sec} setSec={setSec}
        subject={subject} setSubject={setSubject}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Info banner */}
          <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <BookMarked className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </span>
              <div>
                <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100">
                  {shownMeta.cls} &mdash; Section {shownMeta.sec}
                </p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">Academic Planner Documents</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 ml-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                <Layers className="w-3 h-3" /> {rows.length} Planner{rows.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SummaryCard icon={BookOpen}       label="Total Planners"    value={rows.length}     color="blue"    />
            <SummaryCard icon={GraduationCap}  label="Filtered Results"  value={filtered.length} color="emerald" />
            <SummaryCard icon={School2}        label="Subjects Covered"  value={availableSubjects.length - 1 || 1} color="violet" />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Planner Documents</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.cls} – {shownMeta.sec}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} file{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search planners…"
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

            {/* Subject filter pills (desktop) */}
            {availableSubjects.length > 1 && (
              <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] flex-wrap">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mr-1">Filter:</span>
                {availableSubjects.map(s => {
                  const { fg, bg } = subjectColor(s)
                  const active = subject === s
                  return (
                    <button
                      key={s}
                      onClick={() => setSubject(s)}
                      className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all border
                        ${active
                          ? 'border-transparent shadow-sm'
                          : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-transparent text-slate-500 dark:text-slate-400 hover:border-blue-200'
                        }`}
                      style={active ? { background: bg, color: fg } : {}}
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Subject filter (mobile select) */}
            {availableSubjects.length > 1 && (
              <div className="sm:hidden px-4 pt-3 pb-1">
                <NativeSelect value={subject} onChange={e => setSubject(e.target.value)}>
                  {availableSubjects.map(s => <option key={s} value={s}>{s}</option>)}
                </NativeSelect>
              </div>
            )}

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Click <strong>Show</strong> to preview any planner inline. Use the Download button to save the file.
              </p>
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
                      {['S.No.', 'Title', 'File'].map((h, i) => (
                        <th
                          key={i}
                          className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                            ${i === 0 ? 'text-center w-12' : i === 2 ? 'text-center w-32' : 'text-left'}`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow
                        key={row.id}
                        row={row}
                        idx={i + 1}
                        onShow={r => setActiveViewer(r.id === activeViewer ? null : r.id)}
                      />
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
                    Tap a card to preview or download the planner file.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={row.id} row={row} idx={i + 1} />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> planners
              </p>
              {(search || subject !== 'All Subjects') && (
                <button
                  onClick={() => { setSearch(''); setSubject('All Subjects') }}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <CalendarDays className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No planner loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>Class</strong> and <strong>Section</strong>, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
