/**
 * FailureStudentReport.jsx
 * Folder: src/pages/Student/Reports/FailureStudentReport.jsx
 *
 * Converts legacy ASPX "Failure Student Report" to fully-responsive React + Tailwind.
 *
 * Filters: Session → Class → Section → Term → Exam → Subject
 * Columns: S.No, Class, Subject, Student Name, Marks
 * Features:
 *  - Cascading dropdowns (each unlocks the next)
 *  - Show report button
 *  - School name / session / class / subject / term / exam header
 *  - Mobile: expandable cards
 *  - Desktop: dense ERP-style table
 *  - Search / filter within results
 *  - Loading skeleton
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, Info,
  BookOpen, FileSpreadsheet, BarChart3,
  School2, MapPin, Building2, ChevronRight,
  UserX, TrendingDown, ClipboardList,
  GraduationCap, BookMarked, Layers
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII']

const SECTIONS_MAP = {
  'Class I': ['A', 'B'], 'Class II': ['A', 'B'], 'Class III': ['A'],
  'Class IV': ['A'], 'Class V': ['A'], 'Class VI': ['A', 'B'],
  'Class VII': ['A'], 'Class VIII': ['A'], 'Class IX': ['A', 'B'],
  'Class X': ['A'], 'Class XI': ['A', 'B', 'Science', 'Commerce'],
  'Class XII': ['A', 'B', 'Science', 'Commerce'],
}

const TERMS = ['Term 1', 'Term 2', 'Annual']

const EXAMS_MAP = {
  'Term 1': ['Unit Test 1', 'Half Yearly'],
  'Term 2': ['Unit Test 2', 'Pre Board'],
  'Annual': ['Annual Exam', 'Compartment'],
}

const SUBJECTS_MAP = {
  'Class I': ['English', 'Hindi', 'Mathematics', 'EVS'],
  'Class II': ['English', 'Hindi', 'Mathematics', 'EVS'],
  'Class III': ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer'],
  'Class IV': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  'Class V': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  'Class VI': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class VII': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class VIII': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class IX': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  'Class X': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  'Class XI': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Business Studies', 'Economics'],
  'Class XII': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Accountancy', 'Business Studies', 'Economics'],
}

// Dummy failure students — keyed by `class|subject`
const BASE_FAILURES = [
  { name: 'Aarav Sharma',     marks: 18 },
  { name: 'Priya Singh',      marks: 22 },
  { name: 'Rohit Verma',      marks: 14 },
  { name: 'Simran Kaur',      marks: 19 },
  { name: 'Deepak Yadav',     marks: 11 },
  { name: 'Anjali Gupta',     marks: 23 },
  { name: 'Karan Mehta',      marks: 17 },
  { name: 'Nisha Patel',      marks: 9  },
  { name: 'Vivek Tiwari',     marks: 21 },
  { name: 'Pooja Chauhan',    marks: 16 },
  { name: 'Suresh Kumar',     marks: 13 },
  { name: 'Meena Rawat',      marks: 20 },
  { name: 'Aditya Bisht',     marks: 8  },
  { name: 'Kavita Negi',      marks: 24 },
  { name: 'Ravi Joshi',       marks: 15 },
]

/**
 * Deterministic mock: pick a slice of BASE_FAILURES based on filter combo.
 * Replace this function body with a real API call.
 */
function fetchFailures({ session, cls, section, term, exam, subject }) {
  const seed = (session + cls + section + term + exam + subject).length % 5
  const count = 3 + seed * 2
  return BASE_FAILURES.slice(0, count).map(s => ({
    class: cls,
    subject,
    name: s.name,
    marks: s.marks,
  }))
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

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

const marksBadge = (marks) => {
  if (marks <= 10)  return 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
  if (marks <= 15)  return 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
  return                   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
}

const marksLabel = (marks) => {
  if (marks <= 10)  return 'Critical'
  if (marks <= 15)  return 'Poor'
  return                   'Below avg'
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

// ─── SUMMARY STAT CARDS ───────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    orange:  'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-400',
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

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────

function SchoolHeader({ filters }) {
  return (
    <div className="rounded-2xl border border-rose-100 dark:border-[rgba(239,68,68,0.2)] bg-gradient-to-r from-rose-50 via-white to-orange-50 dark:from-[#1f1a1a] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>

      {/* Meta pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Pill color="amber"  label="Session" value={filters.session} />
        <Pill color="blue"   label="Class"   value={`${filters.cls} – Sec ${filters.section}`} />
        <Pill color="violet" label="Term"    value={filters.term} />
        <Pill color="rose"   label="Exam"    value={filters.exam} />
        <Pill color="emerald"label="Subject" value={filters.subject} />
      </div>

      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-400 flex items-center justify-center gap-1.5">
        <TrendingDown className="w-4 h-4" /> Failure Student Report
      </p>
    </div>
  )
}

function Pill({ label, value, color }) {
  const map = {
    amber:   'bg-amber-100 border-amber-200 text-amber-700 dark:bg-amber-500/15 dark:border-amber-500/25 dark:text-amber-400',
    blue:    'bg-blue-100 border-blue-200 text-blue-700 dark:bg-blue-500/15 dark:border-blue-500/25 dark:text-blue-400',
    violet:  'bg-violet-100 border-violet-200 text-violet-700 dark:bg-violet-500/15 dark:border-violet-500/25 dark:text-violet-400',
    rose:    'bg-rose-100 border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/25 dark:text-rose-400',
    emerald: 'bg-emerald-100 border-emerald-200 text-emerald-700 dark:bg-emerald-500/15 dark:border-emerald-500/25 dark:text-emerald-400',
  }
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full border text-[11px] font-semibold ${map[color]}`}>
      <span className="opacity-60">{label}:</span> {value}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx }) {
  const { fg, bg } = classColor(row.class)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-rose-50/30 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}>
            {row.class.replace('Class ', '')}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class}</span>
        </div>
      </td>

      {/* Subject */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <BookMarked className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0" />
          <span className="text-[13px] text-slate-700 dark:text-slate-200">{row.subject}</span>
        </div>
      </td>

      {/* Student Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center text-[10px] font-bold text-rose-700 dark:text-rose-400 flex-shrink-0">
            {row.name.charAt(0)}
          </div>
          <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{row.name}</span>
        </div>
      </td>

      {/* Marks */}
      <td className="px-4 py-3 text-center">
        <div className="inline-flex flex-col items-center gap-0.5">
          <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold tabular-nums ${marksBadge(row.marks)}`}>
            {row.marks}
          </span>
          <span className={`text-[9px] font-semibold uppercase tracking-wide ${marksBadge(row.marks)}`}>
            {marksLabel(row.marks)}
          </span>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────

function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-rose-50/40 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-[13px] font-bold text-rose-700 dark:text-rose-400 flex-shrink-0">
          {row.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {row.class} &nbsp;·&nbsp; {row.subject}
          </p>
        </div>

        {/* Marks badge */}
        <div className="flex flex-col items-end flex-shrink-0 mr-1">
          <span className={`text-[18px] font-bold tabular-nums leading-tight ${
            row.marks <= 10 ? 'text-rose-600 dark:text-rose-400' :
            row.marks <= 15 ? 'text-orange-600 dark:text-orange-400' :
            'text-amber-600 dark:text-amber-400'
          }`}>{row.marks}</span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase">marks</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Marks progress bar */}
      <div className="px-4 pb-3">
        <div className="flex text-[10px] font-semibold justify-between mb-1">
          <span className="text-rose-500 dark:text-rose-400">Obtained: {row.marks}</span>
          <span className="text-slate-400">Pass mark: 33</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              row.marks <= 10 ? 'bg-rose-500' :
              row.marks <= 15 ? 'bg-orange-500' : 'bg-amber-500'
            }`}
            style={{ width: `${Math.min((row.marks / 33) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/40 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Class</p>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0"
                  style={{ background: bg, color: fg }}>{row.class.replace('Class ', '')}</span>
                <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{row.class}</span>
              </div>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-500 mb-1">Subject</p>
              <p className="text-[12px] font-bold text-violet-700 dark:text-violet-300 truncate">{row.subject}</p>
            </div>
            <div className={`col-span-2 rounded-xl border p-3 ${marksBadge(row.marks)} bg-opacity-10`}>
              <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 mb-1">Marks Obtained</p>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-bold tabular-nums">{row.marks}</span>
                <span className="text-[11px] font-semibold opacity-70">/ 100 &nbsp;·&nbsp; {marksLabel(row.marks)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
      <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, state, handlers, errors, onShow, loading }) {
  if (!open) return null
  const { session, cls, section, term, exam, subject } = state
  const { setSession, setCls, setSection, setTerm, setExam, setSubject } = handlers

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
            <SlidersHorizontal className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => setCls(e.target.value)} placeholder="-- Select Class --" disabled={!session} error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Section" error={errors.section} required>
            <NativeSelect value={section} onChange={e => setSection(e.target.value)} placeholder="-- Select Section --" disabled={!cls} error={errors.section}>
              {(SECTIONS_MAP[cls] || []).map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setTerm(e.target.value)} placeholder="-- Select Term --" disabled={!cls} error={errors.term}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={exam} onChange={e => setExam(e.target.value)} placeholder="-- Select Exam --" disabled={!term} error={errors.exam}>
              {(EXAMS_MAP[term] || []).map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subject" error={errors.subject} required>
            <NativeSelect value={subject} onChange={e => setSubject(e.target.value)} placeholder="-- Select Subject --" disabled={!cls} error={errors.subject}>
              {(SUBJECTS_MAP[cls] || []).map(s => <option key={s} value={s}>{s}</option>)}
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
              bg-rose-600 hover:bg-rose-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function FailureStudentReport() {
  // Filter state
  const [session,  setSession]  = useState('')
  const [cls,      setCls]      = useState('')
  const [section,  setSection]  = useState('')
  const [term,     setTerm]     = useState('')
  const [exam,     setExam]     = useState('')
  const [subject,  setSubject]  = useState('')

  // UI state
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [shownFilters, setShownFilters] = useState({})

  // ── Cascade resets ──────────────────────────────────────────────────────────
  const handleSetSession = (v) => { setSession(v); setCls(''); setSection(''); setTerm(''); setExam(''); setSubject('') }
  const handleSetCls     = (v) => { setCls(v); setSection(''); setSubject('') }
  const handleSetTerm    = (v) => { setTerm(v); setExam('') }

  // ── Toast helper ────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & Show ─────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Select a session'
    if (!cls)     err.cls     = 'Select a class'
    if (!section) err.section = 'Select a section'
    if (!term)    err.term    = 'Select a term'
    if (!exam)    err.exam    = 'Select an exam'
    if (!subject) err.subject = 'Select a subject'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    // Simulate API delay — replace setTimeout with actual fetch
    setTimeout(() => {
      const data = fetchFailures({ session, cls, section, term, exam, subject })
      setRows(data)
      setShownFilters({ session, cls, section, term, exam, subject })
      setShown(true)
      setLoading(false)
      if (data.length === 0) {
        showToast('No failures found for selected criteria.', 'error')
      } else {
        showToast(`${data.length} failing student${data.length !== 1 ? 's' : ''} found.`)
      }
    }, 700)
  }, [session, cls, section, term, exam, subject])

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession(''); setCls(''); setSection(''); setTerm(''); setExam(''); setSubject('')
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownFilters({})
  }

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    filtered.length,
    critical: filtered.filter(r => r.marks <= 10).length,
    poor:     filtered.filter(r => r.marks > 10 && r.marks <= 15).length,
    belowAvg: filtered.filter(r => r.marks > 15).length,
  }), [filtered])

  const hasResults   = shown && rows.length > 0
  const activeCount  = [session, cls, section, term, exam, subject].filter(Boolean).length

  const filterState    = { session, cls, section, term, exam, subject }
  const filterHandlers = {
    setSession: handleSetSession, setCls: handleSetCls,
    setSection, setTerm: handleSetTerm, setExam, setSubject,
  }

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserX className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Failure Student Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Students who scored below passing marks — filter by session, class, term, exam &amp; subject.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">* All fields required</span>
        </div>

        <div className="p-5">
          {/* Row 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session} onChange={e => handleSetSession(e.target.value)}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={cls} onChange={e => handleSetCls(e.target.value)}
                placeholder="-- Select Class --" disabled={!session} error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Section" error={errors.section} required>
              <NativeSelect value={section} onChange={e => setSection(e.target.value)}
                placeholder="-- Select Section --" disabled={!cls} error={errors.section}>
                {(SECTIONS_MAP[cls] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 items-end">
            <Field label="Term" error={errors.term} required>
              <NativeSelect value={term} onChange={e => handleSetTerm(e.target.value)}
                placeholder="-- Select Term --" disabled={!cls} error={errors.term}>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Exam" error={errors.exam} required>
              <NativeSelect value={exam} onChange={e => setExam(e.target.value)}
                placeholder="-- Select Exam --" disabled={!term} error={errors.exam}>
                {(EXAMS_MAP[term] || []).map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Subject" error={errors.subject} required>
              <NativeSelect value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="-- Select Subject --" disabled={!cls} error={errors.subject}>
                {(SUBJECTS_MAP[cls] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Action row */}
          <div className="flex gap-3 mt-5 justify-end">
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button type="button" onClick={handleShow} disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ───────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white shadow-md shadow-rose-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} set` : 'Set Filters'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
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
        state={filterState}
        handlers={filterHandlers}
        errors={errors}
        onShow={handleShow}
        loading={loading}
      />

      {/* ── Cascading progress hint (mobile) ───────────────────────────────── */}
      {!hasResults && !loading && activeCount > 0 && activeCount < 6 && (
        <div className="sm:hidden flex items-center gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-[12px] text-amber-700 dark:text-amber-400">
          <Info className="w-4 h-4 flex-shrink-0" />
          {6 - activeCount} more filter{6 - activeCount > 1 ? 's' : ''} needed — tap filters to complete selection.
        </div>
      )}

      {/* ── Loading ──────────────────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School banner */}
          <SchoolHeader filters={shownFilters} />

          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={UserX}       label="Total Failures"  value={stats.total}    color="rose"   />
            <SummaryCard icon={TrendingDown} label="Critical (≤10)"  value={stats.critical} color="rose"   />
            <SummaryCard icon={ClipboardList}label="Poor (11–15)"    value={stats.poor}     color="orange" />
            <SummaryCard icon={GraduationCap}label="Below avg (16–)" value={stats.belowAvg} color="amber"  />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Failing Students</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownFilters.exam}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, class, subject…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-rose-400 focus:ring-2 focus:ring-rose-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-rose-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Legend */}
            <div className="hidden sm:flex items-center gap-4 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-rose-50/20 dark:bg-rose-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <div className="flex items-center gap-3 text-[11px]">
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-rose-200"></span><span className="text-rose-700 dark:text-rose-400 font-semibold">Critical ≤10</span></span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-orange-200"></span><span className="text-orange-700 dark:text-orange-400 font-semibold">Poor 11–15</span></span>
                <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-3 rounded bg-amber-200"></span><span className="text-amber-700 dark:text-amber-400 font-semibold">Below avg 16–32</span></span>
              </div>
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
                      {['S.No.', 'Class', 'Subject', 'Student Name', 'Marks'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.name}-${i}`} row={row} idx={i + 1} />
                    ))}
                  </tbody>

                  {/* Summary footer */}
                  <tfoot>
                    <tr className="bg-rose-50 dark:bg-rose-500/[0.06] border-t-2 border-rose-200 dark:border-rose-500/30">
                      <td className="px-4 py-3 text-center text-[12px] text-rose-400">—</td>
                      <td className="px-4 py-3" colSpan={3}>
                        <span className="text-[13px] font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                          <UserX className="w-4 h-4" /> Total Failing Students
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 tabular-nums">
                          {filtered.length}
                        </span>
                      </td>
                    </tr>
                  </tfoot>
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
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to view detailed breakdown.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.name}-${i}`} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile summary footer */}
                  <div className="rounded-xl border-2 border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/[0.07] px-4 py-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                      <UserX className="w-4 h-4" /> Summary
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{stats.total}</p>
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Total Failures</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{stats.critical}</p>
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Critical (≤10)</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-orange-700 dark:text-orange-300 tabular-nums">{stats.poor}</p>
                        <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">Poor (11–15)</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{stats.belowAvg}</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Below avg (16+)</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Card footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 text-rose-300 dark:text-rose-500" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              {/* Desktop hint */}
              <span className="hidden sm:inline">Fill all filters above and click <strong>Show Report</strong> to view failing students.</span>
              {/* Mobile hint */}
              <span className="sm:hidden">Tap <strong>Set Filters</strong> to select session, class, term, exam &amp; subject.</span>
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
