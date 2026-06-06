/**
 * MarksListJunior.jsx
 * Folder: src/pages/Reports/Exam/MarksListJunior.jsx
 *
 * Converts legacy ASPX "marks_list_junior.aspx" to fully-responsive React + Tailwind.
 *
 * Dropdowns: Session → Class → Term → Exam → Subject
 * Features:
 *  - Cascading dropdowns with validation
 *  - Two-column print layout (left copy + right copy)
 *  - Pass/Fail/Absent color highlighting
 *  - Grade column
 *  - Summary footer: Total / Pass / Fail / Absent
 *  - Subject Teacher + Principal signature footer
 *  - Mobile: single-column stacked cards
 *  - Desktop: two-column side-by-side layout
 *  - Export to Excel (placeholder)
 *  - Loading states, toasts, empty states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, Users, FileSpreadsheet, BookOpen,
  Building2, MapPin, SlidersHorizontal, Search, Info,
  ClipboardList, TrendingUp, UserCheck, UserX, MinusCircle,
  GraduationCap, Printer, Award, BarChart3
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SCHOOL_INFO = {
  name: 'DPS BULANDSHAHR',
  address: 'Delhi Public School, Bulandshahr, Uttar Pradesh',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = {
  '2022-23': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V'],
  '2023-24': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V'],
  '2024-25': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V'],
  '2025-26': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V'],
}

const TERMS = ['Term 1', 'Term 2', 'Term 3']

const EXAMS = {
  'Term 1': ['Unit Test 1', 'Half Yearly'],
  'Term 2': ['Unit Test 2', 'Pre-Board'],
  'Term 3': ['Annual Exam', 'Unit Test 3'],
}

const SUBJECTS = {
  'Class I':   ['English', 'Hindi', 'Mathematics', 'EVS', 'Drawing'],
  'Class II':  ['English', 'Hindi', 'Mathematics', 'EVS', 'Drawing'],
  'Class III': ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer'],
  'Class IV':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer'],
  'Class V':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer'],
}

const EXAM_DATES = {
  'Unit Test 1':  '15-Jul-2025',
  'Half Yearly':  '20-Sep-2025',
  'Unit Test 2':  '10-Nov-2025',
  'Pre-Board':    '05-Jan-2026',
  'Annual Exam':  '15-Mar-2026',
  'Unit Test 3':  '28-Feb-2026',
}

const FACULTY = {
  English:        'Mrs. Sunita Sharma',
  Hindi:          'Mr. Ramesh Tiwari',
  Mathematics:    'Mrs. Priya Gupta',
  EVS:            'Mrs. Kavita Singh',
  Drawing:        'Mr. Anil Verma',
  Computer:       'Mrs. Neha Joshi',
  Science:        'Mr. Vikas Kumar',
  'Social Studies': 'Mrs. Rekha Mishra',
}

// Grade logic
const getGrade = (marks, maxMarks = 100) => {
  if (marks === null || marks === undefined || marks === 'AB') return '-'
  const pct = (marks / maxMarks) * 100
  if (pct >= 91) return 'A1'
  if (pct >= 81) return 'A2'
  if (pct >= 71) return 'B1'
  if (pct >= 61) return 'B2'
  if (pct >= 51) return 'C1'
  if (pct >= 41) return 'C2'
  if (pct >= 33) return 'D'
  return 'E'
}

const getStatus = (marks, passMark = 33) => {
  if (marks === 'AB') return 'absent'
  if (marks === null || marks === undefined) return 'absent'
  return marks >= passMark ? 'pass' : 'fail'
}

// Generate dummy students
const generateStudents = (className, subject, examName) => {
  const baseNames = [
    'Aarav Sharma','Ananya Singh','Arjun Gupta','Diya Patel','Ishaan Verma',
    'Kavya Tiwari','Krish Mishra','Manya Joshi','Neha Yadav','Priya Agarwal',
    'Rahul Kumar','Riya Dubey','Rohan Soni','Sakshi Chauhan','Siddharth Rai',
    'Sneha Pandey','Tanvi Sharma','Vikram Singh','Aditi Gupta','Aditya Verma',
    'Bhavya Jain','Chirag Mehta','Deepika Nair','Gaurav Rawat','Harshita Roy',
    'Ishan Malhotra','Jiya Kapoor','Kartik Bansal','Lavanya Reddy','Manav Bose',
  ]
  const seed = (className + subject + examName).length
  const count = 20 + (seed % 10)
  return baseNames.slice(0, count).map((name, i) => {
    const rnd = ((i * 17 + seed * 7) % 100)
    const isAbsent = rnd > 95
    const marks = isAbsent ? 'AB' : Math.max(10, (rnd + seed * 3) % 101)
    const status = getStatus(marks)
    const grade = getGrade(marks)
    return { stu_name: name, marks, grade, sts: status }
  })
}

// ─── CLASS COLORS ─────────────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
]
const classColor = (name = '') => CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

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

// ─── SUMMARY CARDS ─────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
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

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status, marks }) {
  if (status === 'absent') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
      <MinusCircle className="w-3 h-3" /> AB
    </span>
  )
  if (status === 'fail') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300">
      <UserX className="w-3 h-3" /> {marks}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
      <UserCheck className="w-3 h-3" /> {marks}
    </span>
  )
}

// ─── GRADE BADGE ──────────────────────────────────────────────────────────────
function GradeBadge({ grade }) {
  const styles = {
    A1: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
    A2: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    B1: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
    B2: 'bg-teal-100 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300',
    C1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
    C2: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    D:  'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
    E:  'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300',
    '-':'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
  }
  return (
    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-bold tabular-nums ${styles[grade] || styles['-']}`}>
      {grade}
    </span>
  )
}

// ─── SCHOOL HEADER (print-style) ──────────────────────────────────────────────
function SchoolHeader({ examName, examDate, className, subject }) {
  return (
    <div className="rounded-xl border border-blue-200 dark:border-[rgba(99,102,241,0.25)] bg-gradient-to-b from-blue-50 to-white dark:from-[#1a1f35] dark:to-[#1e2238] text-center px-4 py-4 mb-3">
      <div className="flex items-center justify-center gap-2 mb-0.5">
        <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h3 className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{SCHOOL_INFO.name}</h3>
      </div>
      <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400 mb-2">MARKS LIST</p>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-left max-w-sm mx-auto">
        <div className="text-slate-500 dark:text-slate-400">
          <span className="font-semibold">EXAM:</span>{' '}
          <span className="text-slate-700 dark:text-slate-200">{examName}</span>
        </div>
        <div className="text-slate-500 dark:text-slate-400">
          <span className="font-semibold">DATE:</span>{' '}
          <span className="text-slate-700 dark:text-slate-200">{examDate}</span>
        </div>
        <div className="text-slate-500 dark:text-slate-400">
          <span className="font-semibold">CLASS:</span>{' '}
          <span className="text-slate-700 dark:text-slate-200">{className}</span>
        </div>
        <div className="text-slate-500 dark:text-slate-400">
          <span className="font-semibold">SUBJECT:</span>{' '}
          <span className="text-slate-700 dark:text-slate-200">{subject}</span>
        </div>
      </div>
    </div>
  )
}

// ─── MARKS TABLE ──────────────────────────────────────────────────────────────
function MarksTable({ students, stats, facultyName }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] overflow-hidden">
      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-[rgba(99,102,241,0.12)]">
            <th className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 text-center w-10">#</th>
            <th className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 text-left">Student Name</th>
            <th className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 text-center">Marks</th>
            <th className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-500 text-center">Grade</th>
          </tr>
        </thead>
        <tbody>
          {students.map((s, i) => (
            <tr
              key={i}
              className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] transition-colors
                ${s.sts === 'fail' ? 'bg-rose-50/40 dark:bg-rose-500/[0.04]' : ''}
                ${s.sts === 'absent' ? 'bg-amber-50/40 dark:bg-amber-500/[0.04]' : ''}
                hover:bg-slate-50/60 dark:hover:bg-white/[0.02]`}
            >
              <td className="px-3 py-2.5 text-center text-[11px] text-slate-400 tabular-nums">{i + 1}</td>
              <td className="px-3 py-2.5">
                <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{s.stu_name}</span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <StatusBadge status={s.sts} marks={s.marks} />
              </td>
              <td className="px-3 py-2.5 text-center">
                <GradeBadge grade={s.grade} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer: Stats */}
      <div className="border-t border-slate-200 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/70 dark:bg-white/[0.02] px-3 py-2">
        <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px]">
          <span><b className="text-slate-700 dark:text-slate-300">Total:</b> <span className="text-blue-600 dark:text-blue-400 font-bold">{stats.total}</span></span>
          <span><b className="text-slate-700 dark:text-slate-300">Pass:</b> <span className="text-emerald-600 dark:text-emerald-400 font-bold">{stats.pass}</span></span>
          <span><b className="text-slate-700 dark:text-slate-300">Fail:</b> <span className="text-rose-600 dark:text-rose-400 font-bold">{stats.fail}</span></span>
          <span><b className="text-slate-700 dark:text-slate-300">Absent:</b> <span className="text-amber-600 dark:text-amber-400 font-bold">{stats.absent}</span></span>
        </div>
      </div>

      {/* Footer: Signatures */}
      <div className="border-t border-slate-200 dark:border-[rgba(99,102,241,0.1)] px-3 py-3 flex justify-between items-end">
        <div className="text-[11px] text-slate-600 dark:text-slate-400">
          <p className="font-semibold text-slate-800 dark:text-slate-200">{facultyName}</p>
          <p className="text-[10px]">Subject Teacher</p>
        </div>
        <div className="text-[11px] text-slate-600 dark:text-slate-400 text-right">
          <p className="font-semibold text-slate-800 dark:text-slate-200">_____________</p>
          <p className="text-[10px]">Principal</p>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileStudentCard({ student, idx }) {
  const statusColors = {
    pass:   'border-l-emerald-400 bg-emerald-50/30 dark:bg-emerald-500/[0.04]',
    fail:   'border-l-rose-400 bg-rose-50/30 dark:bg-rose-500/[0.04]',
    absent: 'border-l-amber-400 bg-amber-50/30 dark:bg-amber-500/[0.04]',
  }
  return (
    <div className={`rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.12)] border-l-4 ${statusColors[student.sts]} px-4 py-3 flex items-center gap-3`}>
      <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-500 flex-shrink-0">{idx}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate">{student.stu_name}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={student.sts} marks={student.marks} />
        <GradeBadge grade={student.grade} />
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setters, availableData, onShow, loading, errors }) {
  if (!open) return null
  const { session, cls, term, exam, subject } = filters
  const { setSession, setCls, setTerm, setExam, setSubject } = setters

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35]">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => { setSession(e.target.value); setCls(''); setTerm(''); setExam(''); setSubject('') }} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setSubject('') }} placeholder="-- Select Class --" disabled={!session} error={errors.cls}>
              {(availableData.classes || []).map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => { setTerm(e.target.value); setExam('') }} placeholder="-- Select Term --" disabled={!session} error={errors.term}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={exam} onChange={e => setExam(e.target.value)} placeholder="-- Select Exam --" disabled={!term} error={errors.exam}>
              {(availableData.exams || []).map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subject" error={errors.subject} required>
            <NativeSelect value={subject} onChange={e => setSubject(e.target.value)} placeholder="-- Select Subject --" disabled={!cls} error={errors.subject}>
              {(availableData.subjects || []).map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
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
export default function MarksListJunior() {
  // Filter state
  const [session,  setSession]  = useState('')
  const [cls,      setCls]      = useState('')
  const [term,     setTerm]     = useState('')
  const [exam,     setExam]     = useState('')
  const [subject,  setSubject]  = useState('')

  // UI state
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)

  // Result state
  const [reportData, setReportData] = useState(null)
  const [mobileTab,  setMobileTab]  = useState('copy1') // 'copy1' | 'copy2'

  // Derived available options
  const availableData = useMemo(() => ({
    classes:  session ? (CLASSES[session] || []) : [],
    exams:    term    ? (EXAMS[term] || [])       : [],
    subjects: cls     ? (SUBJECTS[cls] || [])     : [],
  }), [session, cls, term])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!cls)     err.cls     = 'Please select a class'
    if (!term)    err.term    = 'Please select a term'
    if (!exam)    err.exam    = 'Please select an exam'
    if (!subject) err.subject = 'Please select a subject'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Show Report ───────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)

    setTimeout(() => {
      const students = generateStudents(cls, subject, exam)
      const pass   = students.filter(s => s.sts === 'pass').length
      const fail   = students.filter(s => s.sts === 'fail').length
      const absent = students.filter(s => s.sts === 'absent').length

      // Split into two halves for two-column print layout
      const half = Math.ceil(students.length / 2)
      const copy1 = students.slice(0, half)
      const copy2 = students.slice(half)

      const stats = { total: students.length, pass, fail, absent }

      setReportData({
        session, cls, term, exam, subject,
        examDate: EXAM_DATES[exam] || 'N/A',
        facultyName: FACULTY[subject] || 'Subject Teacher',
        students, copy1, copy2, stats,
      })
      setShown(true)
      setLoading(false)
      showToast(`Marks list loaded for ${cls} — ${subject}`)
    }, 700)
  }, [session, cls, term, exam, subject])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession(''); setCls(''); setTerm(''); setExam(''); setSubject('')
    setErrors({}); setShown(false); setReportData(null)
  }

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExcel = () => {
    if (!reportData) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  const hasResults = shown && !!reportData
  const activeFilters = [session, cls, term, exam, subject].filter(Boolean).length

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Mark List
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise marks report — Junior Classes (I to V)
          </p>
        </div>
        {hasResults && (
          <div className="hidden sm:flex items-center gap-2">
            <button type="button" onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
                transition-all active:scale-95">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button type="button" onClick={handleExcel} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Export Excel
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP Filter Card ───────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setCls(''); setTerm(''); setExam(''); setSubject(''); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select --" error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={cls}
                onChange={e => { setCls(e.target.value); setSubject(''); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select --" disabled={!session} error={errors.cls}
              >
                {availableData.classes.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Term */}
            <Field label="Term" error={errors.term} required>
              <NativeSelect
                value={term}
                onChange={e => { setTerm(e.target.value); setExam(''); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select --" disabled={!session} error={errors.term}
              >
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            {/* Exam */}
            <Field label="Exam" error={errors.exam} required>
              <NativeSelect
                value={exam}
                onChange={e => { setExam(e.target.value); setErrors(p => ({ ...p, exam: undefined })) }}
                placeholder="-- Select --" disabled={!term} error={errors.exam}
              >
                {availableData.exams.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>

            {/* Subject */}
            <Field label="Subject" error={errors.subject} required>
              <NativeSelect
                value={subject}
                onChange={e => { setSubject(e.target.value); setErrors(p => ({ ...p, subject: undefined })) }}
                placeholder="-- Select --" disabled={!cls} error={errors.subject}
              >
                {availableData.subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Buttons row */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button type="button" onClick={handleShow} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show
            </button>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {subject ? subject : session ? `${session} — ${cls || 'Select Class'}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <>
            <button type="button" onClick={() => window.print()}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <Printer className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleExcel} disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
            <button type="button" onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={{ session, cls, term, exam, subject }}
        setters={{ setSession, setCls, setTerm, setExam, setSubject }}
        availableData={availableData}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── RESULTS ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}      label="Total Students" value={reportData.stats.total}  color="blue"    />
            <SummaryCard icon={UserCheck}  label="Passed"         value={reportData.stats.pass}   color="emerald" />
            <SummaryCard icon={UserX}      label="Failed"         value={reportData.stats.fail}   color="rose"    />
            <SummaryCard icon={MinusCircle}label="Absent"         value={reportData.stats.absent} color="amber"   />
          </div>

          {/* Pass % bar */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] px-5 py-4">
            <div className="flex items-center justify-between mb-2 text-[12px] font-semibold">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                Pass Percentage
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 text-[14px] font-bold">
                {reportData.stats.total > 0 ? Math.round(((reportData.stats.pass) / (reportData.stats.total - reportData.stats.absent)) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
                style={{ width: `${reportData.stats.total > 0 ? Math.round(((reportData.stats.pass) / (reportData.stats.total - reportData.stats.absent)) * 100) : 0}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[11px] text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Pass</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-400 inline-block" />Fail</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />Absent</span>
            </div>
          </div>

          {/* ── DESKTOP: Two-column print layout ─────────────────────────── */}
          <div className="hidden md:block">
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              {/* Card Header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Marks Report</span>
                <span className="text-[12px] text-slate-400">
                  {reportData.cls} · {reportData.subject} · {reportData.exam}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {reportData.stats.total} Students
                </span>
              </div>

              {/* Info hint */}
              <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <p className="text-[12px] text-blue-700 dark:text-blue-400">
                  Two-column layout mirrors physical mark sheet. Left & Right copy shown side by side.
                </p>
              </div>

              {/* Two columns */}
              <div className="p-5 grid grid-cols-2 gap-5">
                {/* LEFT COPY */}
                <div>
                  <SchoolHeader
                    examName={reportData.exam}
                    examDate={reportData.examDate}
                    className={reportData.cls}
                    subject={reportData.subject}
                  />
                  <MarksTable
                    students={reportData.copy1}
                    stats={{
                      total: reportData.copy1.length,
                      pass:   reportData.copy1.filter(s => s.sts === 'pass').length,
                      fail:   reportData.copy1.filter(s => s.sts === 'fail').length,
                      absent: reportData.copy1.filter(s => s.sts === 'absent').length,
                    }}
                    facultyName={reportData.facultyName}
                  />
                </div>

                {/* RIGHT COPY */}
                <div>
                  <SchoolHeader
                    examName={reportData.exam}
                    examDate={reportData.examDate}
                    className={reportData.cls}
                    subject={reportData.subject}
                  />
                  <MarksTable
                    students={reportData.copy2}
                    stats={{
                      total: reportData.copy2.length,
                      pass:   reportData.copy2.filter(s => s.sts === 'pass').length,
                      fail:   reportData.copy2.filter(s => s.sts === 'fail').length,
                      absent: reportData.copy2.filter(s => s.sts === 'absent').length,
                    }}
                    facultyName={reportData.facultyName}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── MOBILE: Tab-based single-column layout ────────────────────── */}
          <div className="md:hidden">
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              {/* Mobile Header */}
              <div className="px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                  {reportData.cls} &mdash; {reportData.subject}
                </p>
                <p className="text-[11px] text-slate-400">{reportData.exam} · {reportData.examDate}</p>
              </div>

              {/* Tabs: Copy 1 / Copy 2 */}
              <div className="flex border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                {[
                  { id: 'copy1', label: `Copy 1 (1–${reportData.copy1.length})` },
                  { id: 'copy2', label: `Copy 2 (${reportData.copy1.length + 1}–${reportData.stats.total})` },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setMobileTab(tab.id)}
                    className={`flex-1 py-2.5 text-[12px] font-semibold transition-colors
                      ${mobileTab === tab.id
                        ? 'text-blue-600 dark:text-indigo-400 border-b-2 border-blue-600 dark:border-indigo-400 bg-blue-50/30 dark:bg-indigo-500/[0.05]'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Active tab content */}
              <div className="p-4">
                {/* School header */}
                <SchoolHeader
                  examName={reportData.exam}
                  examDate={reportData.examDate}
                  className={reportData.cls}
                  subject={reportData.subject}
                />

                {/* Legend */}
                <div className="flex items-center gap-3 mb-3 text-[10px] font-semibold">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" />Pass</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-rose-100 border border-rose-300 inline-block" />Fail</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-300 inline-block" />Absent</span>
                </div>

                {/* Student cards */}
                <div className="space-y-2">
                  {(mobileTab === 'copy1' ? reportData.copy1 : reportData.copy2).map((s, i) => (
                    <MobileStudentCard
                      key={i}
                      student={s}
                      idx={mobileTab === 'copy1' ? i + 1 : reportData.copy1.length + i + 1}
                    />
                  ))}
                </div>

                {/* Stats footer */}
                <div className="mt-4 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-slate-50 dark:bg-white/[0.02] px-4 py-3">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Summary (This Copy)</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[
                      { label: 'Total', value: (mobileTab === 'copy1' ? reportData.copy1 : reportData.copy2).length, color: 'text-blue-600 dark:text-blue-400' },
                      { label: 'Pass',  value: (mobileTab === 'copy1' ? reportData.copy1 : reportData.copy2).filter(s => s.sts === 'pass').length,   color: 'text-emerald-600 dark:text-emerald-400' },
                      { label: 'Fail',  value: (mobileTab === 'copy1' ? reportData.copy1 : reportData.copy2).filter(s => s.sts === 'fail').length,   color: 'text-rose-600 dark:text-rose-400' },
                      { label: 'Abs',   value: (mobileTab === 'copy1' ? reportData.copy1 : reportData.copy2).filter(s => s.sts === 'absent').length, color: 'text-amber-600 dark:text-amber-400' },
                    ].map(stat => (
                      <div key={stat.label}>
                        <p className={`text-[18px] font-bold tabular-nums ${stat.color}`}>{stat.value}</p>
                        <p className="text-[10px] text-slate-400">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Signatures */}
                <div className="mt-3 flex justify-between items-end px-1">
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">{reportData.facultyName}</p>
                    <p className="text-[10px]">Subject Teacher</p>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400 text-right">
                    <p className="font-semibold text-slate-800 dark:text-slate-200">_____________</p>
                    <p className="text-[10px]">Principal</p>
                  </div>
                </div>
              </div>
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
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No mark list generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session, class, term, exam &amp; subject, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
