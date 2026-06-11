/**
 * MarksListBlank.jsx
 * Folder: src/pages/Reports/Exam/MarksListBlank.jsx
 *
 * Converts legacy ASPX "Marks List (Blank/Print)" to fully-responsive React + Tailwind.
 *
 * Filters: Session → Class → Term → Exam → Subject
 * Features:
 *  - Cascading dropdowns (each unlocks next)
 *  - Show report button + Excel export
 *  - Two-column print-ready marks sheet (like original ASPX)
 *  - S.No | Student Name | Marks | Grade table
 *  - Total / Pass / Fail / Absent footer
 *  - Mobile: single-column card layout
 *  - Desktop: side-by-side print layout
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check,
  Loader2, ChevronDown, SlidersHorizontal, Search,
  FileSpreadsheet, BookOpen, School2, Users,
  CheckCircle2, XCircle, Clock, UserX, Printer,
  GraduationCap, ClipboardList, ChevronRight, Info,
  Award, BarChart3, TrendingUp, Building2, MapPin
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ────────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'DPS BULANDSHAHR',
  address: 'Delhi Public School, Bulandshahr, Uttar Pradesh',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES_BY_SESSION = {
  '2022-23': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X'],
  '2023-24': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X'],
  '2024-25': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

const TERMS = ['Term 1', 'Term 2', 'Term 3']

const EXAMS_BY_TERM = {
  'Term 1': ['Unit Test 1', 'Half Yearly', 'Periodic Test 1'],
  'Term 2': ['Unit Test 2', 'Pre-Board', 'Periodic Test 2'],
  'Term 3': ['Annual Exam', 'Final Exam', 'Board Exam'],
}

const SUBJECTS_BY_CLASS = {
  'Class I':    ['English', 'Hindi', 'Mathematics', 'EVS', 'Drawing'],
  'Class II':   ['English', 'Hindi', 'Mathematics', 'EVS', 'Drawing'],
  'Class III':  ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer'],
  'Class IV':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  'Class V':    ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  'Class VI':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  'Class VII':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  'Class VIII': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  'Class IX':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'IT'],
  'Class X':    ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'IT'],
  'Class XI':   ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Physical Education'],
  'Class XII':  ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science', 'Physical Education'],
}

// Grade logic
const getGrade = (marks, maxMarks = 100) => {
  if (marks === 'AB') return { grade: 'AB', sts: 'absent' }
  const pct = (marks / maxMarks) * 100
  if (pct >= 91) return { grade: 'A1', sts: 'pass' }
  if (pct >= 81) return { grade: 'A2', sts: 'pass' }
  if (pct >= 71) return { grade: 'B1', sts: 'pass' }
  if (pct >= 61) return { grade: 'B2', sts: 'pass' }
  if (pct >= 51) return { grade: 'C1', sts: 'pass' }
  if (pct >= 41) return { grade: 'C2', sts: 'pass' }
  if (pct >= 33) return { grade: 'D',  sts: 'pass' }
  return { grade: 'E', sts: 'fail' }
}

// Generate dummy student marks for a class+subject combo
const generateMarks = (cls, subject, exam) => {
  const NAMES = [
    'Aarav Sharma','Aditya Singh','Akash Gupta','Alok Verma','Amit Kumar',
    'Ananya Rao','Anjali Mishra','Ankit Tiwari','Anuj Pandey','Arjun Joshi',
    'Aryan Mehta','Ashish Srivastava','Bhavna Yadav','Deepak Chauhan','Divya Shukla',
    'Gaurav Tripathi','Harsh Agarwal','Hemant Dubey','Ishaan Malhotra','Jyoti Patel',
    'Kabir Nair','Kavya Pillai','Komal Jain','Manish Bose','Meera Iyer',
    'Mohit Chandra','Neha Kapoor','Nikhil Reddy','Pallavi Saxena','Pankaj Bajpai',
    'Pooja Kumari','Priya Tomar','Rahul Garg','Ravi Bansal','Ritika Sethi',
    'Rohit Dixit','Sakshi Bhatt','Sanjay Rawat','Shivam Rastogi','Shreya Khanna',
    'Siddharth Pal','Sneha Ghosh','Sumit Khatri','Sunita Bisht','Suresh Pathak',
  ]
  const seed = (cls + subject + exam).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const count = 20 + (seed % 16) // 20-35 students
  const maxMarks = 100

  return Array.from({ length: count }, (_, i) => {
    const nameIdx = (seed + i * 7) % NAMES.length
    const rawRand = ((seed * (i + 1) * 13) % 100)
    // Make ~10% absent, ~15% fail, rest pass
    const isAbsent = rawRand < 10
    const isFail = !isAbsent && rawRand < 25
    let marks
    if (isAbsent) marks = 'AB'
    else if (isFail) marks = Math.floor(10 + (rawRand % 23))
    else marks = Math.floor(45 + (rawRand % 56))

    const { grade, sts } = isAbsent ? { grade: 'AB', sts: 'absent' } : getGrade(marks, maxMarks)
    return { stu_name: NAMES[nameIdx], marks, grade, sts }
  })
}

// Exam date lookup (dummy)
const getExamDate = (exam, term) => {
  const dates = {
    'Unit Test 1': '10 Jul 2025', 'Half Yearly': '25 Sep 2025', 'Periodic Test 1': '05 Aug 2025',
    'Unit Test 2': '10 Nov 2025', 'Pre-Board': '15 Jan 2026', 'Periodic Test 2': '05 Dec 2025',
    'Annual Exam': '15 Mar 2026', 'Final Exam': '20 Mar 2026', 'Board Exam': '28 Feb 2026',
  }
  return dates[exam] || '01 Jan 2026'
}

// Faculty lookup (dummy)
const getFaculty = (subject) => {
  const map = {
    'English': 'Mrs. Priya Sharma', 'Hindi': 'Mr. Ramesh Yadav',
    'Mathematics': 'Mr. Suresh Kumar', 'Science': 'Mrs. Anita Singh',
    'Social Science': 'Mr. Vikas Gupta', 'Computer': 'Mrs. Neha Tiwari',
    'Computer Science': 'Mr. Rahul Mehta', 'Physics': 'Mr. Anil Verma',
    'Chemistry': 'Mrs. Sunita Patel', 'Biology': 'Mrs. Rekha Mishra',
    'Sanskrit': 'Mr. Deepak Shastri', 'EVS': 'Mrs. Kavita Singh',
    'Drawing': 'Mr. Rohit Das', 'IT': 'Mrs. Priya Kapoor',
    'Physical Education': 'Mr. Sanjay Rawat',
  }
  return map[subject] || 'Subject Teacher'
}

// CLASS_COLORS helper
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_COLORS[name.charCodeAt(0) % CLASS_COLORS.length]

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────

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
          disabled:opacity-40 disabled:cursor-not-allowed
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
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── MARKS BADGE ──────────────────────────────────────────────────────────────
function MarksBadge({ marks, sts }) {
  if (sts === 'absent')
    return <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">AB</span>
  if (sts === 'fail')
    return <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 tabular-nums">{marks}</span>
  return <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">{marks}</span>
}

function GradeBadge({ grade, sts }) {
  if (sts === 'absent')
    return <span className="text-[11px] font-bold text-slate-400">—</span>
  if (sts === 'fail')
    return <span className="inline-flex items-center justify-center w-7 h-5 rounded text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">{grade}</span>
  return <span className="inline-flex items-center justify-center w-7 h-5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{grade}</span>
}

// ─── MARKS TABLE (shared for both columns) ───────────────────────────────────
function MarksTable({ students }) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-slate-50 dark:bg-white/[0.03]">
          <th className="border border-slate-200 dark:border-[rgba(99,102,241,0.2)] px-2 py-1.5 text-center text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide w-10">S.No</th>
          <th className="border border-slate-200 dark:border-[rgba(99,102,241,0.2)] px-3 py-1.5 text-left text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide">Student Name</th>
          <th className="border border-slate-200 dark:border-[rgba(99,102,241,0.2)] px-2 py-1.5 text-center text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide w-16">Marks</th>
          <th className="border border-slate-200 dark:border-[rgba(99,102,241,0.2)] px-2 py-1.5 text-center text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wide w-14">Grade</th>
        </tr>
      </thead>
      <tbody>
        {students.map((s, i) => (
          <tr key={i} className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] ${i % 2 === 0 ? '' : 'bg-slate-50/40 dark:bg-white/[0.01]'}`}>
            <td className="border border-slate-200 dark:border-[rgba(99,102,241,0.12)] px-2 py-1.5 text-center text-[11px] text-slate-400 tabular-nums">{i + 1}</td>
            <td className="border border-slate-200 dark:border-[rgba(99,102,241,0.12)] px-3 py-1.5 text-[12px] font-medium text-slate-700 dark:text-slate-200">{s.stu_name}</td>
            <td className="border border-slate-200 dark:border-[rgba(99,102,241,0.12)] px-2 py-1.5 text-center"><MarksBadge marks={s.marks} sts={s.sts} /></td>
            <td className="border border-slate-200 dark:border-[rgba(99,102,241,0.12)] px-2 py-1.5 text-center"><GradeBadge grade={s.grade} sts={s.sts} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ─── MARKS SHEET HEADER (school info + meta) ─────────────────────────────────
function SheetHeader({ exam, examDate, cls, subject }) {
  return (
    <div className="border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-t-lg overflow-hidden">
      <div className="bg-blue-700 dark:bg-indigo-900/60 px-4 py-2 text-center">
        <p className="text-[13px] font-extrabold text-white tracking-wide">{SCHOOL_INFO.name}</p>
      </div>
      <div className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)] px-4 py-1.5 text-center">
        <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-widest">MARKS LIST</p>
      </div>
      <div className="grid grid-cols-2 border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
        <div className="px-3 py-1.5 border-r border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Exam</p>
          <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{exam}</p>
        </div>
        <div className="px-3 py-1.5">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Date</p>
          <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{examDate}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
        <div className="px-3 py-1.5 border-r border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Class & Sec.</p>
          <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{cls}</p>
        </div>
        <div className="px-3 py-1.5">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Subject</p>
          <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{subject}</p>
        </div>
      </div>
    </div>
  )
}

// ─── MARKS SHEET FOOTER ───────────────────────────────────────────────────────
function SheetFooter({ total, pass, fail, absent, faculty }) {
  return (
    <div className="border border-t-0 border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-b-lg overflow-hidden">
      <div className="px-3 py-2 bg-slate-50/70 dark:bg-white/[0.02] flex flex-wrap gap-x-4 gap-y-1">
        <span className="text-[11px]"><span className="font-bold text-slate-600 dark:text-slate-300">Total:</span> <span className="text-blue-700 dark:text-blue-400 font-bold">{total}</span></span>
        <span className="text-[11px]"><span className="font-bold text-slate-600 dark:text-slate-300">Pass:</span> <span className="text-emerald-700 dark:text-emerald-400 font-bold">{pass}</span></span>
        <span className="text-[11px]"><span className="font-bold text-slate-600 dark:text-slate-300">Fail:</span> <span className="text-rose-700 dark:text-rose-400 font-bold">{fail}</span></span>
        <span className="text-[11px]"><span className="font-bold text-slate-600 dark:text-slate-300">Absent:</span> <span className="text-amber-700 dark:text-amber-400 font-bold">{absent}</span></span>
      </div>
      <div className="px-3 py-2.5 flex justify-between items-end border-t border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
        <div>
          <div className="w-24 h-px bg-slate-400 dark:bg-slate-600 mb-0.5" />
          <p className="text-[10px] text-slate-500 dark:text-slate-400">{faculty}</p>
        </div>
        <div className="text-right">
          <div className="w-20 h-px bg-slate-400 dark:bg-slate-600 mb-0.5 ml-auto" />
          <p className="text-[10px] text-slate-500 dark:text-slate-400">PRINCIPAL</p>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileStudentCard({ student, idx }) {
  const isFail = student.sts === 'fail'
  const isAbsent = student.sts === 'absent'
  const statusColor = isAbsent
    ? 'border-slate-200 dark:border-slate-700'
    : isFail
    ? 'border-rose-200 dark:border-rose-500/20'
    : 'border-emerald-200 dark:border-emerald-500/20'

  const statusBg = isAbsent
    ? 'bg-slate-50 dark:bg-slate-800/50'
    : isFail
    ? 'bg-rose-50/50 dark:bg-rose-500/5'
    : 'bg-emerald-50/30 dark:bg-emerald-500/5'

  return (
    <div className={`rounded-xl border ${statusColor} ${statusBg} px-4 py-3 flex items-center gap-3`}>
      <span className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0 tabular-nums">
        {idx}
      </span>
      <span className="flex-1 text-[13px] font-semibold text-slate-700 dark:text-slate-200 min-w-0 truncate">{student.stu_name}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <MarksBadge marks={student.marks} sts={student.sts} />
        <GradeBadge grade={student.grade} sts={student.sts} />
        {isAbsent
          ? <UserX className="w-3.5 h-3.5 text-slate-400" />
          : isFail
          ? <XCircle className="w-3.5 h-3.5 text-rose-500" />
          : <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilter, dropdownOptions, onShow, loading, errors }) {
  if (!open) return null
  const { session, cls, term, exam, subject } = filters

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
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
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => setFilter('cls', e.target.value)} placeholder="-- Select Class --" error={errors.cls} disabled={!session}>
              {(dropdownOptions.classes || []).map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setFilter('term', e.target.value)} placeholder="-- Select Term --" error={errors.term} disabled={!cls}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={exam} onChange={e => setFilter('exam', e.target.value)} placeholder="-- Select Exam --" error={errors.exam} disabled={!term}>
              {(dropdownOptions.exams || []).map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subject" error={errors.subject} required>
            <NativeSelect value={subject} onChange={e => setFilter('subject', e.target.value)} placeholder="-- Select Subject --" error={errors.subject} disabled={!exam}>
              {(dropdownOptions.subjects || []).map(s => <option key={s} value={s}>{s}</option>)}
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function MarksListBlank() {
  const [filters, setFiltersState] = useState({ session: '', cls: '', term: '', exam: '', subject: '' })
  const [students, setStudents] = useState([])
  const [reportMeta, setReportMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [shown, setShown] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Cascading filter setter — reset downstream when upstream changes
  const setFilter = useCallback((key, value) => {
    setFiltersState(prev => {
      const next = { ...prev, [key]: value }
      if (key === 'session') { next.cls = ''; next.term = ''; next.exam = ''; next.subject = '' }
      if (key === 'cls')     { next.term = ''; next.exam = ''; next.subject = '' }
      if (key === 'term')    { next.exam = ''; next.subject = '' }
      if (key === 'exam')    { next.subject = '' }
      return next
    })
    setErrors(p => ({ ...p, [key]: undefined }))
  }, [])

  // Dropdown options derived from selections
  const dropdownOptions = useMemo(() => ({
    classes:  CLASSES_BY_SESSION[filters.session] || [],
    exams:    EXAMS_BY_TERM[filters.term] || [],
    subjects: SUBJECTS_BY_CLASS[filters.cls] || [],
  }), [filters.session, filters.cls, filters.term])

  // Validation
  const validate = () => {
    const err = {}
    if (!filters.session) err.session = 'Select a session'
    if (!filters.cls)     err.cls     = 'Select a class'
    if (!filters.term)    err.term    = 'Select a term'
    if (!filters.exam)    err.exam    = 'Select an exam'
    if (!filters.subject) err.subject = 'Select a subject'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // Show report
  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)

    setTimeout(() => {
      const data = generateMarks(filters.cls, filters.subject, filters.exam)
      setStudents(data)
      setReportMeta({
        session: filters.session,
        cls: filters.cls,
        term: filters.term,
        exam: filters.exam,
        subject: filters.subject,
        examDate: getExamDate(filters.exam, filters.term),
        faculty: getFaculty(filters.subject),
      })
      setShown(true)
      setLoading(false)
      showToast(`Marks list loaded — ${data.length} students.`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFiltersState({ session: '', cls: '', term: '', exam: '', subject: '' })
    setStudents([]); setReportMeta(null); setErrors({}); setShown(false)
  }

  const handleExcel = () => {
    if (!shown) { showToast('Show report first before exporting.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // Stats
  const stats = useMemo(() => {
    const total   = students.length
    const absent  = students.filter(s => s.sts === 'absent').length
    const fail    = students.filter(s => s.sts === 'fail').length
    const pass    = students.filter(s => s.sts === 'pass').length
    return { total, pass, fail, absent }
  }, [students])

  // Split into two halves for desktop two-column layout
  const half = Math.ceil(students.length / 2)
  const col1 = students.slice(0, half)
  const col2 = students.slice(half)

  const hasResults = shown && students.length > 0
  const activeFilters = Object.values(filters).filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Marks List
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise exam marks sheet — class, term, exam &amp; subject filter.
          </p>
        </div>
        {hasResults && (
          <div className="hidden sm:flex gap-2">
            <button
              type="button"
              onClick={handleExcel}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Excel
            </button>
            <button
              type="button"
              onClick={() => window.print?.()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20
                transition-all active:scale-95 flex-shrink-0"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          {activeFilters > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">{activeFilters} selected</span>
          )}
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)} placeholder="-- Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={filters.cls} onChange={e => setFilter('cls', e.target.value)} placeholder="-- Class --" error={errors.cls} disabled={!filters.session}>
                {dropdownOptions.classes.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Term" error={errors.term} required>
              <NativeSelect value={filters.term} onChange={e => setFilter('term', e.target.value)} placeholder="-- Term --" error={errors.term} disabled={!filters.cls}>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Exam" error={errors.exam} required>
              <NativeSelect value={filters.exam} onChange={e => setFilter('exam', e.target.value)} placeholder="-- Exam --" error={errors.exam} disabled={!filters.term}>
                {dropdownOptions.exams.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Subject" error={errors.subject} required>
              <NativeSelect value={filters.subject} onChange={e => setFilter('subject', e.target.value)} placeholder="-- Subject --" error={errors.subject} disabled={!filters.exam}>
                {dropdownOptions.subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Actions */}
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
          {activeFilters > 0 ? `${activeFilters} Filter${activeFilters > 1 ? 's' : ''} Applied` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <>
            <button type="button" onClick={handleExcel} disabled={exporting}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
            <button type="button" onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        dropdownOptions={dropdownOptions}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && reportMeta && (
        <>
          {/* School Info Banner */}
          <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <h2 className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100">{SCHOOL_INFO.name}</h2>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>{SCHOOL_INFO.address}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
                  <GraduationCap className="w-3 h-3 text-blue-700 dark:text-blue-400" />
                  <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">{reportMeta.cls}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
                  <BookOpen className="w-3 h-3 text-amber-700 dark:text-amber-400" />
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">{reportMeta.subject}</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25">
                  <Award className="w-3 h-3 text-violet-700 dark:text-violet-400" />
                  <span className="text-[11px] font-bold text-violet-700 dark:text-violet-400">{reportMeta.exam}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}       label="Total Students" value={stats.total}   color="blue"    />
            <SummaryCard icon={CheckCircle2} label="Passed"        value={stats.pass}    color="emerald" />
            <SummaryCard icon={XCircle}     label="Failed"         value={stats.fail}    color="rose"    />
            <SummaryCard icon={UserX}       label="Absent"         value={stats.absent}  color="amber"   />
          </div>

          {/* ── DESKTOP: Two-column print layout ── */}
          <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Marks Sheet — {reportMeta.exam} · {reportMeta.subject} · {reportMeta.cls}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">{students.length} students</span>
            </div>

            <div className="p-5">
              <div className="flex items-center gap-2 mb-4 px-1">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <p className="text-[12px] text-blue-700 dark:text-blue-400">
                  Two-column layout mirrors the print-ready marks sheet. Left copy: Office. Right copy: Teacher.
                </p>
              </div>

              {/* Two columns side by side */}
              <div className="grid grid-cols-2 gap-5">
                {/* Column 1 */}
                <div>
                  <SheetHeader exam={reportMeta.exam} examDate={reportMeta.examDate} cls={reportMeta.cls} subject={reportMeta.subject} />
                  <div className="border-x border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden">
                    <MarksTable students={col1} />
                  </div>
                  <SheetFooter
                    total={stats.total} pass={stats.pass} fail={stats.fail} absent={stats.absent}
                    faculty={reportMeta.faculty}
                  />
                </div>
                {/* Column 2 */}
                <div>
                  <SheetHeader exam={reportMeta.exam} examDate={reportMeta.examDate} cls={reportMeta.cls} subject={reportMeta.subject} />
                  <div className="border-x border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden">
                    <MarksTable students={col2} />
                  </div>
                  <SheetFooter
                    total={stats.total} pass={stats.pass} fail={stats.fail} absent={stats.absent}
                    faculty={reportMeta.faculty}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── MOBILE: Single-column card list ── */}
          <div className="md:hidden rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1 truncate">{reportMeta.exam} · {reportMeta.subject}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">{students.length}</span>
            </div>

            {/* Meta pills on mobile */}
            <div className="px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/40 dark:bg-white/[0.01]">
              <div className="flex flex-wrap gap-2">
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{reportMeta.cls}</span>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{reportMeta.term}</span>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{reportMeta.session}</span>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">{reportMeta.examDate}</span>
              </div>
            </div>

            {/* Legend */}
            <div className="px-4 pt-3 pb-2 flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" /> Pass
              </span>
              <span className="flex items-center gap-1 text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                <XCircle className="w-3 h-3" /> Fail
              </span>
              <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
                <UserX className="w-3 h-3" /> Absent
              </span>
            </div>

            {/* Student cards */}
            <div className="px-4 pb-4 space-y-2">
              {students.map((s, i) => (
                <MobileStudentCard key={i} student={s} idx={i + 1} />
              ))}
            </div>

            {/* Footer summary */}
            <div className="border-t border-slate-200 dark:border-[rgba(99,102,241,0.15)] px-4 py-3 bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex flex-wrap gap-3 mb-3">
                <span className="text-[12px]"><span className="font-bold text-slate-600 dark:text-slate-300">Total:</span> <span className="text-blue-700 dark:text-blue-400 font-bold">{stats.total}</span></span>
                <span className="text-[12px]"><span className="font-bold text-slate-600 dark:text-slate-300">Pass:</span> <span className="text-emerald-700 dark:text-emerald-400 font-bold">{stats.pass}</span></span>
                <span className="text-[12px]"><span className="font-bold text-slate-600 dark:text-slate-300">Fail:</span> <span className="text-rose-700 dark:text-rose-400 font-bold">{stats.fail}</span></span>
                <span className="text-[12px]"><span className="font-bold text-slate-600 dark:text-slate-300">Absent:</span> <span className="text-amber-700 dark:text-amber-400 font-bold">{stats.absent}</span></span>
              </div>
              <div className="flex justify-between items-end">
                <div>
                  <div className="w-28 h-px bg-slate-400 dark:bg-slate-600 mb-1" />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{reportMeta.faculty}</p>
                </div>
                <div className="text-right">
                  <div className="w-24 h-px bg-slate-400 dark:bg-slate-600 mb-1 ml-auto" />
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">PRINCIPAL</p>
                </div>
              </div>
            </div>
          </div>

          {/* Pass/Fail chart bar */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] px-5 py-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Result Overview</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Pass', value: stats.pass, total: stats.total, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Fail', value: stats.fail, total: stats.total, color: 'bg-rose-500', textColor: 'text-rose-600 dark:text-rose-400' },
                { label: 'Absent', value: stats.absent, total: stats.total, color: 'bg-amber-500', textColor: 'text-amber-600 dark:text-amber-400' },
              ].map(({ label, value, total, color, textColor }) => (
                <div key={label}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
                    <span className={`text-[12px] font-bold ${textColor}`}>{value} ({total ? Math.round((value / total) * 100) : 0}%)</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${color} transition-all duration-700`}
                      style={{ width: `${total ? (value / total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No marks list generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Select Session → Class → Term → Exam → Subject and click <strong>Show</strong> to load the marks list.
            </p>
          </div>
          {/* Step indicator */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center mt-2">
            {['Session', 'Class', 'Term', 'Exam', 'Subject'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-1.5">
                <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{step}</span>
                {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-slate-300 dark:text-slate-700" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
