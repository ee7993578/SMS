/**
 * GetClassSubjects.jsx
 * Folder: src/pages/Reports/GetClassSubjects.jsx
 *
 * Converts legacy ASPX "Classwise Subjects" page to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Class Name, Subject Code, Subjects, Sub Subjects
 * Features:
 *  - Session dropdown filter
 *  - Show & Export buttons
 *  - School name / session header in report
 *  - Mobile: responsive cards with expandable detail
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, SlidersHorizontal, Search, BookOpen, FileSpreadsheet,
  School2, Building2, MapPin, ChevronRight, Info, BookMarked,
  GraduationCap, Layers, Tag, Hash, BarChart3, TrendingUp
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const SUBJECTS_DATA = {
  '2022-23': [
    { class: 'Nursery',    subject_code: 'NUR-01', subject: 'English',          subsubject: 'Reading & Writing'      },
    { class: 'Nursery',    subject_code: 'NUR-02', subject: 'Mathematics',      subsubject: 'Numbers & Counting'     },
    { class: 'Nursery',    subject_code: 'NUR-03', subject: 'Drawing',          subsubject: 'Art & Craft'            },
    { class: 'LKG',        subject_code: 'LKG-01', subject: 'English',          subsubject: 'Phonics'                },
    { class: 'LKG',        subject_code: 'LKG-02', subject: 'Hindi',            subsubject: 'Varnamala'              },
    { class: 'LKG',        subject_code: 'LKG-03', subject: 'Mathematics',      subsubject: 'Basic Operations'       },
    { class: 'UKG',        subject_code: 'UKG-01', subject: 'English',          subsubject: 'Grammar Basics'         },
    { class: 'UKG',        subject_code: 'UKG-02', subject: 'Hindi',            subsubject: 'Matra & Vyanjan'        },
    { class: 'UKG',        subject_code: 'UKG-03', subject: 'Mathematics',      subsubject: 'Addition & Subtraction' },
    { class: 'UKG',        subject_code: 'UKG-04', subject: 'EVS',              subsubject: 'My Environment'         },
    { class: 'Class I',    subject_code: 'C1-01',  subject: 'English',          subsubject: 'Grammar & Comprehension'},
    { class: 'Class I',    subject_code: 'C1-02',  subject: 'Hindi',            subsubject: 'Kahani & Kavita'        },
    { class: 'Class I',    subject_code: 'C1-03',  subject: 'Mathematics',      subsubject: 'Arithmetic'             },
    { class: 'Class I',    subject_code: 'C1-04',  subject: 'EVS',              subsubject: 'Nature & Science'       },
    { class: 'Class II',   subject_code: 'C2-01',  subject: 'English',          subsubject: 'Reading & Writing'      },
    { class: 'Class II',   subject_code: 'C2-02',  subject: 'Hindi',            subsubject: 'Vyakaran'               },
    { class: 'Class II',   subject_code: 'C2-03',  subject: 'Mathematics',      subsubject: 'Multiplication'         },
    { class: 'Class II',   subject_code: 'C2-04',  subject: 'EVS',              subsubject: 'Plants & Animals'       },
    { class: 'Class III',  subject_code: 'C3-01',  subject: 'English',          subsubject: 'Essay Writing'          },
    { class: 'Class III',  subject_code: 'C3-02',  subject: 'Hindi',            subsubject: 'Patra Lekhan'           },
    { class: 'Class III',  subject_code: 'C3-03',  subject: 'Mathematics',      subsubject: 'Division & Fractions'   },
    { class: 'Class III',  subject_code: 'C3-04',  subject: 'Science',          subsubject: 'Living & Non-living'    },
    { class: 'Class III',  subject_code: 'C3-05',  subject: 'Social Studies',   subsubject: 'Our Country'            },
    { class: 'Class IV',   subject_code: 'C4-01',  subject: 'English',          subsubject: 'Creative Writing'       },
    { class: 'Class IV',   subject_code: 'C4-02',  subject: 'Hindi',            subsubject: 'Nibandh'                },
    { class: 'Class IV',   subject_code: 'C4-03',  subject: 'Mathematics',      subsubject: 'Geometry Basics'        },
    { class: 'Class IV',   subject_code: 'C4-04',  subject: 'Science',          subsubject: 'Food & Nutrition'       },
    { class: 'Class IV',   subject_code: 'C4-05',  subject: 'Social Studies',   subsubject: 'Maps & Globe'           },
    { class: 'Class V',    subject_code: 'C5-01',  subject: 'English',          subsubject: 'Literature'             },
    { class: 'Class V',    subject_code: 'C5-02',  subject: 'Hindi',            subsubject: 'Sahitya'                },
    { class: 'Class V',    subject_code: 'C5-03',  subject: 'Mathematics',      subsubject: 'Decimals & Percentages' },
    { class: 'Class V',    subject_code: 'C5-04',  subject: 'Science',          subsubject: 'Matter & Energy'        },
    { class: 'Class V',    subject_code: 'C5-05',  subject: 'Social Studies',   subsubject: 'Indian History'         },
    { class: 'Class VI',   subject_code: 'C6-01',  subject: 'English',          subsubject: 'Prose & Poetry'         },
    { class: 'Class VI',   subject_code: 'C6-02',  subject: 'Hindi',            subsubject: 'Vasant'                 },
    { class: 'Class VI',   subject_code: 'C6-03',  subject: 'Mathematics',      subsubject: 'Integers & Algebra'     },
    { class: 'Class VI',   subject_code: 'C6-04',  subject: 'Science',          subsubject: 'Motion & Forces'        },
    { class: 'Class VI',   subject_code: 'C6-05',  subject: 'Social Studies',   subsubject: 'Geography & History'    },
    { class: 'Class VI',   subject_code: 'C6-06',  subject: 'Sanskrit',         subsubject: 'Ruchira'                },
    { class: 'Class VII',  subject_code: 'C7-01',  subject: 'English',          subsubject: 'Honeycomb'              },
    { class: 'Class VII',  subject_code: 'C7-02',  subject: 'Hindi',            subsubject: 'Vasant II'              },
    { class: 'Class VII',  subject_code: 'C7-03',  subject: 'Mathematics',      subsubject: 'Rational Numbers'       },
    { class: 'Class VII',  subject_code: 'C7-04',  subject: 'Science',          subsubject: 'Nutrition & Health'     },
    { class: 'Class VII',  subject_code: 'C7-05',  subject: 'Social Studies',   subsubject: 'Medieval History'       },
    { class: 'Class VII',  subject_code: 'C7-06',  subject: 'Sanskrit',         subsubject: 'Ruchira II'             },
    { class: 'Class VIII', subject_code: 'C8-01',  subject: 'English',          subsubject: 'It so Happened'         },
    { class: 'Class VIII', subject_code: 'C8-02',  subject: 'Hindi',            subsubject: 'Vasant III'             },
    { class: 'Class VIII', subject_code: 'C8-03',  subject: 'Mathematics',      subsubject: 'Mensuration & Graphs'   },
    { class: 'Class VIII', subject_code: 'C8-04',  subject: 'Science',          subsubject: 'Cells & Microorganisms' },
    { class: 'Class VIII', subject_code: 'C8-05',  subject: 'Social Studies',   subsubject: 'Modern India'           },
    { class: 'Class IX',   subject_code: 'C9-01',  subject: 'English',          subsubject: 'Beehive'                },
    { class: 'Class IX',   subject_code: 'C9-02',  subject: 'Hindi',            subsubject: 'Kshitij'                },
    { class: 'Class IX',   subject_code: 'C9-03',  subject: 'Mathematics',      subsubject: 'Polynomials & Triangles'},
    { class: 'Class IX',   subject_code: 'C9-04',  subject: 'Science',          subsubject: 'Matter & Atoms'         },
    { class: 'Class IX',   subject_code: 'C9-05',  subject: 'Social Science',   subsubject: 'India & World'          },
    { class: 'Class IX',   subject_code: 'C9-06',  subject: 'Sanskrit',         subsubject: 'Shemushi'               },
    { class: 'Class X',    subject_code: 'C10-01', subject: 'English',          subsubject: 'First Flight'           },
    { class: 'Class X',    subject_code: 'C10-02', subject: 'Hindi',            subsubject: 'Kshitij II'             },
    { class: 'Class X',    subject_code: 'C10-03', subject: 'Mathematics',      subsubject: 'Quadratics & Circles'   },
    { class: 'Class X',    subject_code: 'C10-04', subject: 'Science',          subsubject: 'Chemical Reactions'     },
    { class: 'Class X',    subject_code: 'C10-05', subject: 'Social Science',   subsubject: 'Contemporary India'     },
    { class: 'Class XI',   subject_code: 'C11-01', subject: 'Physics',          subsubject: 'Mechanics'              },
    { class: 'Class XI',   subject_code: 'C11-02', subject: 'Chemistry',        subsubject: 'Organic Chemistry'      },
    { class: 'Class XI',   subject_code: 'C11-03', subject: 'Mathematics',      subsubject: 'Sets & Functions'       },
    { class: 'Class XI',   subject_code: 'C11-04', subject: 'Biology',          subsubject: 'Cell Biology'           },
    { class: 'Class XI',   subject_code: 'C11-05', subject: 'English',          subsubject: 'Hornbill'               },
    { class: 'Class XII',  subject_code: 'C12-01', subject: 'Physics',          subsubject: 'Electrostatics'         },
    { class: 'Class XII',  subject_code: 'C12-02', subject: 'Chemistry',        subsubject: 'Electrochemistry'       },
    { class: 'Class XII',  subject_code: 'C12-03', subject: 'Mathematics',      subsubject: 'Integration & Vectors'  },
    { class: 'Class XII',  subject_code: 'C12-04', subject: 'Biology',          subsubject: 'Genetics & Evolution'   },
    { class: 'Class XII',  subject_code: 'C12-05', subject: 'English',          subsubject: 'Flamingo'               },
  ],
}
// Copy same data for all sessions with minor variations
SUBJECTS_DATA['2023-24'] = SUBJECTS_DATA['2022-23']
SUBJECTS_DATA['2024-25'] = SUBJECTS_DATA['2022-23']
SUBJECTS_DATA['2025-26'] = SUBJECTS_DATA['2022-23']

// ─── CLASS COLOR PALETTE ──────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
  { fg: '#9333ea', bg: '#f3e8ff' },
]
const classColor = (name = '') => CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── SUBJECT BADGE COLOR ──────────────────────────────────────────────────────
const SUBJECT_COLORS = {
  'English':        { fg: '#1d4ed8', bg: '#dbeafe' },
  'Hindi':          { fg: '#9333ea', bg: '#f3e8ff' },
  'Mathematics':    { fg: '#059669', bg: '#d1fae5' },
  'Science':        { fg: '#0891b2', bg: '#cffafe' },
  'Social Studies': { fg: '#d97706', bg: '#fef3c7' },
  'Social Science': { fg: '#d97706', bg: '#fef3c7' },
  'EVS':            { fg: '#16a34a', bg: '#dcfce7' },
  'Sanskrit':       { fg: '#b45309', bg: '#fef3c7' },
  'Physics':        { fg: '#0369a1', bg: '#e0f2fe' },
  'Chemistry':      { fg: '#7c3aed', bg: '#ede9fe' },
  'Biology':        { fg: '#15803d', bg: '#dcfce7' },
  'Drawing':        { fg: '#db2777', bg: '#fce7f3' },
}
const subjectColor = (name = '') =>
  SUBJECT_COLORS[name] || { fg: '#64748b', bg: '#f1f5f9' }

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
function SchoolHeader({ session }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Classwise Subjects Report
      </p>
    </div>
  )
}

// ─── SUMMARY CARDS ───────────────────────────────────────────────────────────
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
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value.toLocaleString()}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SUBJECT BADGE ────────────────────────────────────────────────────────────
function SubjectBadge({ name }) {
  const { fg, bg } = subjectColor(name)
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold whitespace-nowrap"
      style={{ color: fg, background: bg }}
    >
      {name}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = classColor(row.class)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.class)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class}</span>
        </div>
      </td>

      {/* Subject Code */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-mono tracking-wide">
          <Hash className="w-3 h-3 opacity-60" />
          {row.subject_code}
        </span>
      </td>

      {/* Subject */}
      <td className="px-4 py-3">
        <SubjectBadge name={row.subject} />
      </td>

      {/* Sub Subject */}
      <td className="px-4 py-3">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-slate-400 dark:text-slate-600 flex-shrink-0" />
          {row.subsubject || <span className="italic text-slate-300 dark:text-slate-600">—</span>}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  const { fg: sfg, bg: sbg } = subjectColor(row.subject)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Class badge */}
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {formatAbbr(row.class)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.class}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
            <Hash className="w-2.5 h-2.5" />
            <span className="font-mono font-semibold">{row.subject_code}</span>
          </p>
        </div>

        {/* Subject pill on right */}
        <span
          className="flex-shrink-0 text-[11px] font-bold px-2 py-1 rounded-md"
          style={{ color: sfg, background: sbg }}
        >
          {row.subject}
        </span>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {/* Subject Code */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/40 p-3 text-center">
              <Hash className="w-4 h-4 text-slate-400 mx-auto mb-1" />
              <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 font-mono">{row.subject_code}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">Subject Code</p>
            </div>
            {/* Sub Subject */}
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 p-3 text-center">
              <Layers className="w-4 h-4 text-indigo-500 mx-auto mb-1" />
              <p className="text-[12px] font-bold text-indigo-700 dark:text-indigo-300 leading-tight">{row.subsubject || '—'}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 mt-0.5">Sub Subject</p>
            </div>
          </div>

          {/* Full subject row */}
          <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40">
            <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-[12px] text-slate-500 dark:text-slate-400">Subject:</span>
            <SubjectBadge name={row.subject} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
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
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
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
              onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
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

// ─── CLASS GROUP SECTION (desktop, groups rows by class) ──────────────────────
function ClassGroupRows({ className, rows, startIdx }) {
  const { fg, bg } = classColor(className)
  return (
    <>
      {rows.map((row, i) => (
        <DesktopRow key={`${row.class}-${row.subject_code}`} row={row} idx={startIdx + i} />
      ))}
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function GetClassSubjects() {
  const [session,      setSession]      = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')
  const [activeClass,  setActiveClass]  = useState('All')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Show Report ──────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setActiveClass('All')

    // Simulate API call
    setTimeout(() => {
      const data = SUBJECTS_DATA[session] || []
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} records for session ${session}.`)
    }, 650)
  }, [session])

  const handleReset = () => {
    setSession(''); setRows([]); setSearch('')
    setErrors({}); setShown(false); setShownSession('')
    setActiveClass('All')
  }

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Unique classes for filter tabs ────────────────────────────────────────
  const uniqueClasses = useMemo(() => {
    const seen = new Set()
    return rows.filter(r => {
      if (seen.has(r.class)) return false
      seen.add(r.class); return true
    }).map(r => r.class)
  }, [rows])

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = rows
    if (activeClass !== 'All') data = data.filter(r => r.class === activeClass)
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r =>
        r.class.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.subject_code.toLowerCase().includes(q) ||
        (r.subsubject || '').toLowerCase().includes(q)
      )
    }
    return data
  }, [rows, activeClass, search])

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const classes = new Set(filtered.map(r => r.class))
    const subjects = new Set(filtered.map(r => r.subject))
    return {
      totalRecords: filtered.length,
      totalClasses: classes.size,
      totalSubjects: subjects.size,
      withSubSubject: filtered.filter(r => r.subsubject).length,
    }
  }, [filtered])

  const hasResults = shown && rows.length > 0

  // Group filtered rows by class for desktop display
  const groupedByClass = useMemo(() => {
    const map = {}
    filtered.forEach(r => {
      if (!map[r.class]) map[r.class] = []
      map[r.class].push(r)
    })
    return map
  }, [filtered])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Classwise Subjects
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Subject codes &amp; sub-subjects assigned per class for selected session.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExport}
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

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
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
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacers */}
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

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Session'}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
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
        session={session}
        setSession={setSession}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={BookMarked}  label="Total Records"    value={stats.totalRecords}    color="blue"    />
            <SummaryCard icon={GraduationCap} label="Classes"        value={stats.totalClasses}    color="violet"  />
            <SummaryCard icon={BookOpen}    label="Unique Subjects"  value={stats.totalSubjects}   color="emerald" />
            <SummaryCard icon={Layers}      label="With Sub-Subject" value={stats.withSubSubject}  color="amber"   />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Classwise Subjects</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search class, subject, code…"
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

            {/* Class Filter Tabs — horizontal scroll on mobile */}
            <div className="px-4 pt-3 pb-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <button
                  type="button"
                  onClick={() => setActiveClass('All')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all
                    ${activeClass === 'All'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                >
                  All Classes
                </button>
                {uniqueClasses.map(cls => {
                  const { fg, bg } = classColor(cls)
                  const isActive = activeClass === cls
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setActiveClass(cls)}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all border
                        ${isActive ? 'shadow-sm' : 'bg-white dark:bg-[#1a1f35] hover:opacity-80'}`}
                      style={isActive
                        ? { background: bg, color: fg, borderColor: fg + '40' }
                        : { background: 'transparent', color: '#64748b', borderColor: '#e2e8f0' }
                      }
                    >
                      {cls}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Info Hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Showing class-wise subject assignments. Use class tabs above to filter by class, or search by subject name/code.
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
                      {['S.No.', 'Class Name', 'Subject Code', 'Subjects', 'Sub Subjects'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.class}-${row.subject_code}`} row={row} idx={i + 1} />
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
                    Tap a card to see subject code &amp; sub-subject.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.class}-${row.subject_code}-${i}`} row={row} idx={i + 1} />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {(search || activeClass !== 'All') && (
                <button
                  onClick={() => { setSearch(''); setActiveClass('All') }}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to view classwise subjects.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
