/**
 * ExamSchedule.jsx
 * Folder: src/pages/Student/ExamSchedule.jsx
 *
 * Converts legacy ASPX "Exam Schedule" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Term-wise exam schedule display
 *  - Subject-wise exam dates grouped by exam type
 *  - Excel export button
 *  - Mobile: expandable card layout per term
 *  - Desktop: structured table with nested datalists
 *  - Loading states & empty states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Calendar, FileSpreadsheet, ChevronDown, ChevronRight,
  BookOpen, Clock, AlertCircle, Loader2, X, Check,
  School2, Search, RefreshCw, SlidersHorizontal,
  CalendarDays, BookMarked, Info, Filter,
  GraduationCap, ClipboardList, Building2, MapPin,
  ChevronUp, Eye
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']
const CLASSES  = ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
                   'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
                   'Class XI', 'Class XII']

// Exam schedule static data
const EXAM_DATA = {
  '2024-25': {
    'Class IX': [
      {
        term_id: 'T1',
        term_name: 'Term I (April – September)',
        exams: [
          {
            exam_type_id: 'UT1',
            exam_type: 'Unit Test – 1',
            subjects: [
              { subject: 'Mathematics',   e_date: '12 Apr 2024' },
              { subject: 'Science',        e_date: '13 Apr 2024' },
              { subject: 'English',        e_date: '14 Apr 2024' },
              { subject: 'Hindi',          e_date: '15 Apr 2024' },
              { subject: 'Social Science', e_date: '16 Apr 2024' },
              { subject: 'Computer',       e_date: '17 Apr 2024' },
            ],
          },
          {
            exam_type_id: 'HY',
            exam_type: 'Half Yearly',
            subjects: [
              { subject: 'Mathematics',   e_date: '10 Sep 2024' },
              { subject: 'Science',        e_date: '11 Sep 2024' },
              { subject: 'English',        e_date: '12 Sep 2024' },
              { subject: 'Hindi',          e_date: '13 Sep 2024' },
              { subject: 'Social Science', e_date: '14 Sep 2024' },
              { subject: 'Computer',       e_date: '16 Sep 2024' },
            ],
          },
        ],
      },
      {
        term_id: 'T2',
        term_name: 'Term II (October – March)',
        exams: [
          {
            exam_type_id: 'UT2',
            exam_type: 'Unit Test – 2',
            subjects: [
              { subject: 'Mathematics',   e_date: '15 Nov 2024' },
              { subject: 'Science',        e_date: '16 Nov 2024' },
              { subject: 'English',        e_date: '17 Nov 2024' },
              { subject: 'Hindi',          e_date: '18 Nov 2024' },
              { subject: 'Social Science', e_date: '19 Nov 2024' },
              { subject: 'Computer',       e_date: '20 Nov 2024' },
            ],
          },
          {
            exam_type_id: 'ANN',
            exam_type: 'Annual Exam',
            subjects: [
              { subject: 'Mathematics',   e_date: '03 Mar 2025' },
              { subject: 'Science',        e_date: '05 Mar 2025' },
              { subject: 'English',        e_date: '07 Mar 2025' },
              { subject: 'Hindi',          e_date: '10 Mar 2025' },
              { subject: 'Social Science', e_date: '12 Mar 2025' },
              { subject: 'Computer',       e_date: '14 Mar 2025' },
            ],
          },
        ],
      },
    ],
    'Class X': [
      {
        term_id: 'T1',
        term_name: 'Term I (April – September)',
        exams: [
          {
            exam_type_id: 'PT1',
            exam_type: 'Pre-Test 1',
            subjects: [
              { subject: 'Mathematics',   e_date: '10 Apr 2024' },
              { subject: 'Science',        e_date: '11 Apr 2024' },
              { subject: 'English',        e_date: '12 Apr 2024' },
              { subject: 'Hindi',          e_date: '13 Apr 2024' },
              { subject: 'Social Science', e_date: '14 Apr 2024' },
            ],
          },
          {
            exam_type_id: 'HY',
            exam_type: 'Half Yearly',
            subjects: [
              { subject: 'Mathematics',   e_date: '08 Sep 2024' },
              { subject: 'Science',        e_date: '09 Sep 2024' },
              { subject: 'English',        e_date: '10 Sep 2024' },
              { subject: 'Hindi',          e_date: '11 Sep 2024' },
              { subject: 'Social Science', e_date: '12 Sep 2024' },
            ],
          },
        ],
      },
      {
        term_id: 'T2',
        term_name: 'Term II (October – March)',
        exams: [
          {
            exam_type_id: 'PT2',
            exam_type: 'Pre-Test 2',
            subjects: [
              { subject: 'Mathematics',   e_date: '12 Nov 2024' },
              { subject: 'Science',        e_date: '13 Nov 2024' },
              { subject: 'English',        e_date: '14 Nov 2024' },
              { subject: 'Hindi',          e_date: '15 Nov 2024' },
              { subject: 'Social Science', e_date: '16 Nov 2024' },
            ],
          },
          {
            exam_type_id: 'BD',
            exam_type: 'Board Exam (CBSE)',
            subjects: [
              { subject: 'Mathematics',   e_date: '02 Mar 2025' },
              { subject: 'Science',        e_date: '06 Mar 2025' },
              { subject: 'English',        e_date: '10 Mar 2025' },
              { subject: 'Hindi',          e_date: '14 Mar 2025' },
              { subject: 'Social Science', e_date: '18 Mar 2025' },
            ],
          },
        ],
      },
    ],
  },
  '2025-26': {
    'Class IX': [
      {
        term_id: 'T1',
        term_name: 'Term I (April – September)',
        exams: [
          {
            exam_type_id: 'UT1',
            exam_type: 'Unit Test – 1',
            subjects: [
              { subject: 'Mathematics',   e_date: '11 Apr 2025' },
              { subject: 'Science',        e_date: '12 Apr 2025' },
              { subject: 'English',        e_date: '13 Apr 2025' },
              { subject: 'Hindi',          e_date: '14 Apr 2025' },
              { subject: 'Social Science', e_date: '15 Apr 2025' },
              { subject: 'Computer',       e_date: '16 Apr 2025' },
            ],
          },
          {
            exam_type_id: 'HY',
            exam_type: 'Half Yearly',
            subjects: [
              { subject: 'Mathematics',   e_date: '09 Sep 2025' },
              { subject: 'Science',        e_date: '10 Sep 2025' },
              { subject: 'English',        e_date: '11 Sep 2025' },
              { subject: 'Hindi',          e_date: '12 Sep 2025' },
              { subject: 'Social Science', e_date: '13 Sep 2025' },
              { subject: 'Computer',       e_date: '15 Sep 2025' },
            ],
          },
        ],
      },
    ],
    'Class X': [
      {
        term_id: 'T1',
        term_name: 'Term I (April – September)',
        exams: [
          {
            exam_type_id: 'PT1',
            exam_type: 'Pre-Test 1',
            subjects: [
              { subject: 'Mathematics',   e_date: '09 Apr 2025' },
              { subject: 'Science',        e_date: '10 Apr 2025' },
              { subject: 'English',        e_date: '11 Apr 2025' },
              { subject: 'Hindi',          e_date: '12 Apr 2025' },
              { subject: 'Social Science', e_date: '13 Apr 2025' },
            ],
          },
        ],
      },
    ],
  },
}

// ─── EXAM TYPE COLOR MAP ──────────────────────────────────────────────────────
const EXAM_COLORS = {
  UT1: { fg: '#0891b2', bg: '#cffafe', border: '#a5f3fc' },
  UT2: { fg: '#0369a1', bg: '#e0f2fe', border: '#bae6fd' },
  HY:  { fg: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe' },
  PT1: { fg: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  PT2: { fg: '#b45309', bg: '#fef9c3', border: '#fef08a' },
  ANN: { fg: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
  BD:  { fg: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
}
const getExamColor = (id) =>
  EXAM_COLORS[id] || { fg: '#475569', bg: '#f1f5f9', border: '#e2e8f0' }

// ─── SUBJECT DATE BADGE ──────────────────────────────────────────────────────
function SubjectBadge({ subject, date }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-lg border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50 dark:bg-[#1e2238] px-3 py-2 min-w-[130px]">
      <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 leading-snug truncate">{subject}</span>
      <span className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-medium">
        <CalendarDays className="w-3 h-3 flex-shrink-0" />
        {date}
      </span>
    </div>
  )
}

// ─── EXAM TYPE BLOCK (desktop) ────────────────────────────────────────────────
function ExamTypeBlock({ exam }) {
  const { fg, bg, border } = getExamColor(exam.exam_type_id)
  return (
    <div className="mb-3 last:mb-0">
      {/* Exam type label */}
      <div
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide mb-2"
        style={{ background: bg, color: fg, border: `1px solid ${border}` }}
      >
        <ClipboardList className="w-3.5 h-3.5" />
        {exam.exam_type}
      </div>
      {/* Subject grid */}
      <div className="flex flex-wrap gap-2">
        {exam.subjects.map((s, i) => (
          <SubjectBadge key={i} subject={s.subject} date={s.e_date} />
        ))}
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] align-top hover:bg-slate-50/60 dark:hover:bg-white/[0.015] transition-colors">
      {/* S.No */}
      <td className="px-4 py-4 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12 align-middle">
        {idx}
      </td>

      {/* Term */}
      <td className="px-4 py-4 align-middle">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          <span
            className="text-[12px] font-bold text-blue-700 dark:text-blue-300 px-2 py-1 rounded-lg"
            style={{ background: 'rgba(59,130,246,0.08)' }}
          >
            {row.term_name}
          </span>
        </div>
      </td>

      {/* Exams */}
      <td className="px-4 py-4">
        {row.exams.map((exam, i) => (
          <ExamTypeBlock key={i} exam={exam} />
        ))}
      </td>
    </tr>
  )
}

// ─── MOBILE SUBJECT PILL ──────────────────────────────────────────────────────
function MobileSubjectPill({ subject, date }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-white dark:bg-[#1a1f35] px-3 py-2.5 shadow-sm">
      <div className="flex items-center gap-2 min-w-0">
        <BookMarked className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{subject}</span>
      </div>
      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-lg">
        <CalendarDays className="w-3 h-3" />
        {date}
      </span>
    </div>
  )
}

// ─── MOBILE EXAM TYPE SECTION ─────────────────────────────────────────────────
function MobileExamSection({ exam }) {
  const [open, setOpen] = useState(true)
  const { fg, bg, border } = getExamColor(exam.exam_type_id)

  return (
    <div className="rounded-xl overflow-hidden border" style={{ borderColor: border }}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ background: bg }}
      >
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 flex-shrink-0" style={{ color: fg }} />
          <span className="text-[13px] font-bold" style={{ color: fg }}>{exam.exam_type}</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ color: fg, background: `${fg}22` }}
          >
            {exam.subjects.length} subjects
          </span>
        </div>
        <span style={{ color: fg }}>
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Subject list */}
      {open && (
        <div className="p-3 space-y-2 bg-white dark:bg-[#1a1f35]">
          {exam.subjects.map((s, i) => (
            <MobileSubjectPill key={i} subject={s.subject} date={s.e_date} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE TERM CARD ─────────────────────────────────────────────────────────
function MobileTermCard({ row, idx }) {
  const [expanded, setExpanded] = useState(idx === 0)
  const totalSubjects = row.exams.reduce((s, e) => s + e.subjects.length, 0)

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Term Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]"
      >
        <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
          <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.term_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {row.exams.length} exam{row.exams.length !== 1 ? 's' : ''} · {totalSubjects} subjects
          </p>
        </div>
        <span className={`transition-transform duration-200 text-slate-400 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5" />
        </span>
      </button>

      {/* Exam sections */}
      {expanded && (
        <div className="p-4 space-y-3">
          {row.exams.map((exam, i) => (
            <MobileExamSection key={i} exam={exam} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────
function SchoolHeader({ session, className }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
          <GraduationCap className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">{className}</span>
        </span>
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Exam Schedule
      </p>
    </div>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
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

// ─── NATIVE SELECT ────────────────────────────────────────────────────────────
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

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────
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

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, classVal, setClassVal, onShow, loading, errors }) {
  if (!open) return null
  const availableClasses = session && EXAM_DATA[session]
    ? Object.keys(EXAM_DATA[session])
    : CLASSES

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
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => { setSession(e.target.value); setClassVal('') }}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.classVal} required>
            <NativeSelect
              value={classVal}
              onChange={e => setClassVal(e.target.value)}
              placeholder="-- Select Class --"
              error={errors.classVal}
              disabled={!session}
            >
              {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
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
            Show Schedule
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ExamSchedule() {
  const [session,      setSession]      = useState('')
  const [classVal,     setClassVal]     = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')
  const [shownClass,   setShownClass]   = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Available classes based on session
  const availableClasses = useMemo(() =>
    session && EXAM_DATA[session] ? Object.keys(EXAM_DATA[session]) : CLASSES,
    [session]
  )

  // ── Fetch schedule ────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session)  err.session  = 'Please select a session'
    if (!classVal) err.classVal = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const data = EXAM_DATA[session]?.[classVal] || []
      setRows(data)
      setShownSession(session)
      setShownClass(classVal)
      setShown(true)
      setLoading(false)
      if (data.length === 0) {
        showToast(`No schedule found for ${classVal} in ${session}.`, 'error')
      } else {
        showToast(`Schedule loaded for ${classVal} — Session ${session}.`)
      }
    }, 700)
  }, [session, classVal])

  const handleReset = () => {
    setSession(''); setClassVal(''); setRows([])
    setErrors({}); setShown(false); setShownSession(''); setShownClass('')
  }

  // ── Excel Export ──────────────────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Summary counts ────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const totalExams    = rows.reduce((s, r) => s + r.exams.length, 0)
    const totalSubjects = rows.reduce((s, r) => s + r.exams.reduce((ss, e) => ss + e.subjects.length, 0), 0)
    return { terms: rows.length, exams: totalExams, subjects: totalSubjects }
  }, [rows])

  const hasResults    = shown && rows.length > 0
  const activeFilters = [session, classVal].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Exam Schedule
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Term-wise exam dates organized by exam type and subject.
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
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setClassVal(''); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.classVal} required>
              <NativeSelect
                value={classVal}
                onChange={e => { setClassVal(e.target.value); setErrors(p => ({ ...p, classVal: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.classVal}
                disabled={!session}
              >
                {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
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
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset">
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
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 ? `${session}${classVal ? ` · ${classVal}` : ''}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
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
        session={session}
        setSession={setSession}
        classVal={classVal}
        setClassVal={setClassVal}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} className={shownClass} />

          {/* Summary Chips */}
          <div className="flex flex-wrap gap-2">
            {[
              { icon: CalendarDays, label: `${summary.terms} Term${summary.terms !== 1 ? 's' : ''}`,  color: 'blue'    },
              { icon: ClipboardList, label: `${summary.exams} Exam Type${summary.exams !== 1 ? 's' : ''}`, color: 'violet' },
              { icon: BookOpen,     label: `${summary.subjects} Subjects total`, color: 'emerald' },
            ].map(({ icon: Icon, label, color }) => {
              const cls = {
                blue:    'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
                violet:  'bg-violet-50 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
                emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
              }[color]
              return (
                <span key={label} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[12px] font-semibold ${cls}`}>
                  <Icon className="w-3.5 h-3.5" />{label}
                </span>
              )
            })}
          </div>

          {/* ── Results Card ── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Exam Schedule</span>
              <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownClass} · {shownSession}</span>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Subjects are listed with their exam dates per term and exam type. Dates subject to change — verify with school notice board.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Term', 'Exam Details'].map((h, i) => (
                      <th key={i}
                        className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                          ${i === 0 ? 'text-center w-12' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <DesktopRow key={row.term_id} row={row} idx={i + 1} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a term to expand or collapse. Tap exam type to toggle subjects.
              </p>
              {rows.map((row, i) => (
                <MobileTermCard key={row.term_id} row={row} idx={i} />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> term{rows.length !== 1 ? 's' : ''} ·{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{summary.exams}</span> exam type{summary.exams !== 1 ? 's' : ''} ·{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{summary.subjects}</span> total subjects
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── No data for valid selection ───────────────────────────────────── */}
      {shown && rows.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <AlertCircle className="w-7 h-7 text-rose-400" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No schedule found</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              No exam schedule is available for <strong>{shownClass}</strong> in session <strong>{shownSession}</strong>.
            </p>
          </div>
          <button onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Try another selection
          </button>
        </div>
      )}

      {/* ── Initial Empty State ──────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Calendar className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No schedule generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>Session</strong> and <strong>Class</strong>, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
