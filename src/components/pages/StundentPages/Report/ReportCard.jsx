/**
 * ReportCard.jsx
 * Folder: src/pages/Student/Reports/ReportCard.jsx
 *
 * Converts legacy ASPX "CBSC I-VIII Report Card" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session, Class, Section, Student, Term dropdowns
 *  - Date picker input
 *  - Show Report button
 *  - Printable report card preview (A4 style)
 *  - Subject-wise marks table with grades
 *  - Co-scholastic / Activity ratings
 *  - Attendance summary
 *  - Mobile: stacked cards layout
 *  - Desktop: ERP-style print preview panel
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check,
  Loader2, ChevronDown, SlidersHorizontal, Info,
  BookOpen, School2, MapPin, Building2, User,
  Calendar, Printer, FileText, ChevronRight,
  Award, Star, ClipboardList, BarChart2,
  GraduationCap, Users, Hash, TrendingUp,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  { id: '1', label: 'Class I' },
  { id: '2', label: 'Class II' },
  { id: '3', label: 'Class III' },
  { id: '4', label: 'Class IV' },
  { id: '5', label: 'Class V' },
  { id: '6', label: 'Class VI' },
  { id: '7', label: 'Class VII' },
  { id: '8', label: 'Class VIII' },
]

const SECTIONS_BY_CLASS = {
  '1': ['A', 'B'], '2': ['A', 'B'], '3': ['A'],
  '4': ['A'], '5': ['A'], '6': ['A', 'B'],
  '7': ['A'], '8': ['A'],
}

const STUDENTS_BY_CLASS_SECTION = {
  '1-A': [
    { id: 'S001', name: 'Aarav Sharma', rollNo: '01' },
    { id: 'S002', name: 'Priya Singh', rollNo: '02' },
    { id: 'S003', name: 'Rohan Gupta', rollNo: '03' },
    { id: 'S004', name: 'Sneha Verma', rollNo: '04' },
  ],
  '1-B': [
    { id: 'S005', name: 'Arjun Patel', rollNo: '01' },
    { id: 'S006', name: 'Kavya Mehta', rollNo: '02' },
  ],
  '6-A': [
    { id: 'S101', name: 'Vivaan Joshi', rollNo: '01' },
    { id: 'S102', name: 'Ananya Rao', rollNo: '02' },
    { id: 'S103', name: 'Ishaan Tiwari', rollNo: '03' },
  ],
  '8-A': [
    { id: 'S201', name: 'Saanvi Kumar', rollNo: '01' },
    { id: 'S202', name: 'Dhruv Mishra', rollNo: '02' },
  ],
}

const TERMS = [
  { id: '1', label: 'Term I (April – September)' },
  { id: '2', label: 'Term II (October – March)' },
  { id: 'annual', label: 'Annual' },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  phone: '+91-135-2712345',
  affiliation: 'CBSE Affiliation No. 050123',
}

// Grade helper
const getGrade = (marks, max = 100) => {
  const pct = (marks / max) * 100
  if (pct >= 91) return { grade: 'A1', gp: '10', color: 'emerald' }
  if (pct >= 81) return { grade: 'A2', gp: '9',  color: 'green' }
  if (pct >= 71) return { grade: 'B1', gp: '8',  color: 'lime' }
  if (pct >= 61) return { grade: 'B2', gp: '7',  color: 'yellow' }
  if (pct >= 51) return { grade: 'C1', gp: '6',  color: 'amber' }
  if (pct >= 41) return { grade: 'C2', gp: '5',  color: 'orange' }
  if (pct >= 33) return { grade: 'D',  gp: '4',  color: 'red' }
  return { grade: 'E',  gp: '—',  color: 'rose' }
}

// Dummy report card data generator
const generateReportCard = (studentId, classId, term) => {
  // Subjects per class group
  const subjectSets = {
    lower: [ // I-V
      { code: 'ENG', name: 'English', maxMarks: 100 },
      { code: 'HIN', name: 'Hindi', maxMarks: 100 },
      { code: 'MTH', name: 'Mathematics', maxMarks: 100 },
      { code: 'EVS', name: 'Env. Studies', maxMarks: 100 },
      { code: 'GK',  name: 'General Knowledge', maxMarks: 50 },
      { code: 'CMP', name: 'Computer Science', maxMarks: 50 },
    ],
    upper: [ // VI-VIII
      { code: 'ENG', name: 'English', maxMarks: 100 },
      { code: 'HIN', name: 'Hindi', maxMarks: 100 },
      { code: 'MTH', name: 'Mathematics', maxMarks: 100 },
      { code: 'SCI', name: 'Science', maxMarks: 100 },
      { code: 'SST', name: 'Social Science', maxMarks: 100 },
      { code: 'SAN', name: 'Sanskrit', maxMarks: 100 },
      { code: 'CMP', name: 'Computer Science', maxMarks: 50 },
    ],
  }

  const isUpper = parseInt(classId, 10) >= 6
  const subjects = isUpper ? subjectSets.upper : subjectSets.lower

  // Deterministic-ish marks based on studentId
  const seed = studentId.charCodeAt(studentId.length - 1) + parseInt(classId, 10)
  const marks = subjects.map((sub, i) => {
    const base = ((seed * (i + 3) * 7) % 40) + (sub.maxMarks === 50 ? 22 : 52)
    return Math.min(base, sub.maxMarks)
  })

  const subjectRows = subjects.map((sub, i) => ({
    ...sub,
    obtained: marks[i],
    ...getGrade(marks[i], sub.maxMarks),
  }))

  const totalMax = subjects.reduce((s, sub) => s + sub.maxMarks, 0)
  const totalObtained = marks.reduce((s, m) => s + m, 0)
  const percentage = ((totalObtained / totalMax) * 100).toFixed(1)
  const overall = getGrade(totalObtained, totalMax)

  const coScholastic = [
    { activity: 'Work Education', rating: seed % 3 === 0 ? 'A' : seed % 3 === 1 ? 'B' : 'C' },
    { activity: 'Art Education', rating: seed % 2 === 0 ? 'A' : 'B' },
    { activity: 'Health & Physical Education', rating: seed % 4 === 0 ? 'A' : 'B' },
  ]

  const attendance = {
    workingDays: 120,
    present: 108 + (seed % 10),
  }
  attendance.percentage = ((attendance.present / attendance.workingDays) * 100).toFixed(0)

  return {
    subjectRows,
    totalMax,
    totalObtained,
    percentage,
    overall,
    coScholastic,
    attendance,
    result: parseFloat(percentage) >= 33 ? 'PASS' : 'FAIL',
    rank: (seed % 15) + 1,
    totalStudents: 40,
  }
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

// ─── GRADE BADGE ──────────────────────────────────────────────────────────────
const GRADE_STYLES = {
  emerald: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  green:   'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
  lime:    'bg-lime-100 text-lime-800 dark:bg-lime-500/20 dark:text-lime-300',
  yellow:  'bg-yellow-100 text-yellow-800 dark:bg-yellow-500/20 dark:text-yellow-300',
  amber:   'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  orange:  'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300',
  red:     'bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300',
  rose:    'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',
}

function GradeBadge({ grade, color, size = 'sm' }) {
  const cls = GRADE_STYLES[color] || GRADE_STYLES.amber
  const padding = size === 'lg' ? 'px-3 py-1.5 text-[14px]' : 'px-2 py-0.5 text-[11px]'
  return (
    <span className={`inline-flex items-center justify-center rounded-lg font-bold tabular-nums ${padding} ${cls}`}>
      {grade}
    </span>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, term }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-1">
        <MapPin className="w-3 h-3 flex-shrink-0" />{SCHOOL_INFO.address}
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-3">{SCHOOL_INFO.affiliation}</p>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </div>
        {term && (
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/25">
            <span className="text-[12px] font-bold text-indigo-700 dark:text-indigo-400">{term}</span>
          </div>
        )}
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Progress Report Card
      </p>
    </div>
  )
}

// ─── STUDENT INFO BANNER ──────────────────────────────────────────────────────
function StudentInfoBanner({ student, classLabel, section, date }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header stripe */}
      <div className="h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500" />
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-200 dark:shadow-blue-900/30">
          <User className="w-7 h-7 text-white" />
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Student Name</p>
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{student.name}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Roll No.</p>
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{student.rollNo}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Class & Section</p>
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{classLabel} – {section}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Date</p>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{date || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── SUBJECT TABLE (DESKTOP) ──────────────────────────────────────────────────
function SubjectTable({ rows, totalMax, totalObtained, percentage, overall }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Subject-wise Performance</span>
      </div>
      {/* Table — desktop */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['S.No.', 'Subject', 'Code', 'Max Marks', 'Marks Obtained', 'Grade', 'Grade Points'].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.code} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums">{i + 1}</td>
                <td className="px-4 py-3">
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.name}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-md px-2 py-0.5">{row.code}</span>
                </td>
                <td className="px-4 py-3 text-center text-[13px] font-medium text-slate-600 dark:text-slate-300 tabular-nums">{row.maxMarks}</td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{row.obtained}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <GradeBadge grade={row.grade} color={row.color} />
                </td>
                <td className="px-4 py-3 text-center text-[13px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">{row.gp}</td>
              </tr>
            ))}
            {/* Grand Total row */}
            <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
              <td className="px-4 py-3 text-center text-[12px] text-blue-400">—</td>
              <td className="px-4 py-3" colSpan={2}>
                <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Total / Overall
                </span>
              </td>
              <td className="px-4 py-3 text-center text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totalMax}</td>
              <td className="px-4 py-3 text-center">
                <span className="text-[14px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totalObtained}</span>
                <span className="ml-1 text-[11px] text-blue-500 dark:text-blue-400">({percentage}%)</span>
              </td>
              <td className="px-4 py-3 text-center">
                <GradeBadge grade={overall.grade} color={overall.color} size="lg" />
              </td>
              <td className="px-4 py-3 text-center text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{overall.gp}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile — stacked cards */}
      <div className="sm:hidden p-4 space-y-3">
        {rows.map((row, i) => (
          <MobileSubjectCard key={row.code} row={row} idx={i + 1} />
        ))}
        {/* Mobile total */}
        <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5" /> Overall Result
          </p>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p className="text-[12px] text-blue-600 dark:text-blue-400">Total Marks</p>
              <p className="text-[22px] font-bold text-blue-800 dark:text-blue-200 tabular-nums">{totalObtained} <span className="text-[13px] font-normal">/ {totalMax}</span></p>
            </div>
            <div className="text-center">
              <p className="text-[12px] text-blue-600 dark:text-blue-400">Percentage</p>
              <p className="text-[22px] font-bold text-blue-800 dark:text-blue-200 tabular-nums">{percentage}%</p>
            </div>
            <div className="text-center">
              <p className="text-[12px] text-blue-600 dark:text-blue-400 mb-1">Overall Grade</p>
              <GradeBadge grade={overall.grade} color={overall.color} size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MobileSubjectCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const pct = Math.round((row.obtained / row.maxMarks) * 100)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="text-[11px] font-bold text-slate-400 w-5 flex-shrink-0 tabular-nums">{idx}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[10px] text-slate-400 tabular-nums">{pct}%</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[16px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{row.obtained}</span>
          <span className="text-[11px] text-slate-400">/{row.maxMarks}</span>
          <GradeBadge grade={row.grade} color={row.color} />
        </div>
        <span className={`text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Code</p>
            <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">{row.code}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Grade</p>
            <div className="mt-1 flex justify-center"><GradeBadge grade={row.grade} color={row.color} /></div>
          </div>
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">Grade Pts</p>
            <p className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mt-0.5">{row.gp}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CO-SCHOLASTIC SECTION ────────────────────────────────────────────────────
function CoScholasticSection({ activities }) {
  const ratingColor = (r) => r === 'A' ? 'emerald' : r === 'B' ? 'amber' : 'orange'
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
        <Star className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Co-Scholastic Activities</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {activities.map((act) => (
            <div key={act.activity}
              className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3.5 bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-7 h-7 rounded-lg bg-violet-100 dark:bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                  <Award className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                </span>
                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{act.activity}</p>
              </div>
              <GradeBadge grade={act.rating} color={ratingColor(act.rating)} />
            </div>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3 flex-shrink-0" />
          A = Outstanding &nbsp;·&nbsp; B = Very Good &nbsp;·&nbsp; C = Good &nbsp;·&nbsp; D = Satisfactory
        </p>
      </div>
    </div>
  )
}

// ─── ATTENDANCE SECTION ───────────────────────────────────────────────────────
function AttendanceSection({ attendance }) {
  const pct = parseInt(attendance.percentage, 10)
  const barColor = pct >= 85 ? 'bg-emerald-500' : pct >= 75 ? 'bg-amber-500' : 'bg-rose-500'
  const textColor = pct >= 85 ? 'text-emerald-700 dark:text-emerald-400' : pct >= 75 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-cyan-500 flex-shrink-0" />
        <ClipboardList className="w-4 h-4 text-cyan-600 dark:text-cyan-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Attendance Summary</span>
      </div>
      <div className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500 dark:text-slate-400">Working Days</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">{attendance.workingDays}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500 dark:text-slate-400">Days Present</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">{attendance.present}</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-slate-500 dark:text-slate-400">Days Absent</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">{attendance.workingDays - attendance.present}</span>
            </div>
          </div>
          {/* Percentage Ring */}
          <div className="flex flex-col items-center gap-1 flex-shrink-0">
            <div className="relative w-20 h-20">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor" strokeWidth="2.5"
                  className="text-slate-100 dark:text-slate-800" />
                <circle cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.5"
                  strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round"
                  className={pct >= 85 ? 'stroke-emerald-500' : pct >= 75 ? 'stroke-amber-500' : 'stroke-rose-500'} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-[15px] font-extrabold tabular-nums ${textColor}`}>{pct}%</span>
              </div>
            </div>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Attendance</p>
          </div>
        </div>
        <div className="mt-4">
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          {pct < 75 && (
            <p className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 flex items-center gap-1">
              <AlertCircle className="w-3 h-3 flex-shrink-0" />
              Attendance below 75%. Minimum 75% required.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── RESULT RIBBON ────────────────────────────────────────────────────────────
function ResultRibbon({ result, rank, totalStudents }) {
  const pass = result === 'PASS'
  return (
    <div className={`rounded-2xl border-2 p-5 flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm
      ${pass
        ? 'border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/[0.07]'
        : 'border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/[0.07]'
      }`}
    >
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md
        ${pass ? 'bg-emerald-500 shadow-emerald-200 dark:shadow-emerald-900/30' : 'bg-rose-500 shadow-rose-200 dark:shadow-rose-900/30'}`}>
        {pass
          ? <GraduationCap className="w-7 h-7 text-white" />
          : <X className="w-7 h-7 text-white" />}
      </div>
      <div className="flex-1">
        <p className={`text-[22px] font-extrabold tracking-wide
          ${pass ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}>
          {result}
        </p>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          {pass ? 'Promoted to next class' : 'Not eligible for promotion'}
        </p>
      </div>
      <div className="flex sm:flex-col sm:items-end gap-3 sm:gap-1">
        <div className="text-center sm:text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Class Rank</p>
          <p className="text-[20px] font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">
            {rank}<span className="text-[11px] text-slate-400 ml-1 font-normal">/ {totalStudents}</span>
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── FILTER DRAWER (MOBILE) ───────────────────────────────────────────────────
function FilterDrawer({ open, onClose, fields, errors, onShow, loading }) {
  if (!open) return null
  const { session, setSession, classId, setClassId, section, setSection,
    studentId, setStudentId, termId, setTermId, date, setDate,
    sections, students } = fields

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35]">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Report Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <FilterFields
            session={session} setSession={setSession}
            classId={classId} setClassId={setClassId}
            section={section} setSection={setSection}
            sections={sections}
            studentId={studentId} setStudentId={setStudentId}
            students={students}
            termId={termId} setTermId={setTermId}
            date={date} setDate={setDate}
            errors={errors}
          />
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SHARED FILTER FIELDS ────────────────────────────────────────────────────
function FilterFields({ session, setSession, classId, setClassId, section, setSection,
  sections, studentId, setStudentId, students, termId, setTermId, date, setDate, errors }) {
  return (
    <>
      <Field label="Session" error={errors.session} required>
        <NativeSelect value={session} onChange={e => setSession(e.target.value)}
          placeholder="-- Select Session --" error={errors.session}>
          {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </NativeSelect>
      </Field>
      <Field label="Class" error={errors.classId} required>
        <NativeSelect value={classId} onChange={e => setClassId(e.target.value)}
          placeholder="-- Select Class --" error={errors.classId}>
          {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
        </NativeSelect>
      </Field>
      <Field label="Section" error={errors.section} required>
        <NativeSelect value={section} onChange={e => setSection(e.target.value)}
          placeholder="-- Select Section --" error={errors.section} disabled={!sections.length}>
          {sections.map(s => <option key={s} value={s}>{s}</option>)}
        </NativeSelect>
      </Field>
      <Field label="Student" error={errors.studentId} required>
        <NativeSelect value={studentId} onChange={e => setStudentId(e.target.value)}
          placeholder="-- Select Student --" error={errors.studentId} disabled={!students.length}>
          {students.map(s => <option key={s.id} value={s.id}>{s.rollNo}. {s.name}</option>)}
        </NativeSelect>
      </Field>
      <Field label="Term" error={errors.termId} required>
        <NativeSelect value={termId} onChange={e => setTermId(e.target.value)}
          placeholder="-- Select Term --" error={errors.termId}>
          {TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </NativeSelect>
      </Field>
      <Field label="Report Date">
        <div className="relative">
          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full appearance-none pl-8 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none transition-all
              bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400"
          />
        </div>
      </Field>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ReportCard() {
  // Filter state
  const [session,   setSession]   = useState('')
  const [classId,   setClassId]   = useState('')
  const [section,   setSection]   = useState('')
  const [studentId, setStudentId] = useState('')
  const [termId,    setTermId]    = useState('')
  const [date,      setDate]      = useState('')

  // UI state
  const [loading,    setLoading]    = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [report,     setReport]     = useState(null)
  const [reportMeta, setReportMeta] = useState(null)

  const printRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Derived section & student lists
  const sections = useMemo(() => {
    if (!classId) return []
    return SECTIONS_BY_CLASS[classId] || []
  }, [classId])

  const students = useMemo(() => {
    if (!classId || !section) return []
    return STUDENTS_BY_CLASS_SECTION[`${classId}-${section}`] || [
      // Fallback dummy students
      { id: 'D001', name: 'Student One', rollNo: '01' },
      { id: 'D002', name: 'Student Two', rollNo: '02' },
    ]
  }, [classId, section])

  // When class changes, reset section/student
  const handleClassChange = useCallback((val) => {
    setClassId(val)
    setSection('')
    setStudentId('')
  }, [])

  const handleSectionChange = useCallback((val) => {
    setSection(val)
    setStudentId('')
  }, [])

  // Validate & show
  const handleShow = useCallback(() => {
    const err = {}
    if (!session)   err.session   = 'Select a session'
    if (!classId)   err.classId   = 'Select a class'
    if (!section)   err.section   = 'Select a section'
    if (!studentId) err.studentId = 'Select a student'
    if (!termId)    err.termId    = 'Select a term'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setReport(null)

    // Simulate API call
    setTimeout(() => {
      const data = generateReportCard(studentId, classId, termId)
      const student = students.find(s => s.id === studentId)
      const classInfo = CLASSES.find(c => c.id === classId)
      const termInfo  = TERMS.find(t => t.id === termId)
      setReport(data)
      setReportMeta({ student, classLabel: classInfo?.label, section, session, termLabel: termInfo?.label, date })
      setLoading(false)
      showToast(`Report card loaded for ${student?.name}.`)
    }, 700)
  }, [session, classId, section, studentId, termId, date, students])

  const handleReset = () => {
    setSession(''); setClassId(''); setSection(''); setStudentId('')
    setTermId(''); setDate(''); setErrors({}); setReport(null); setReportMeta(null)
  }

  const handlePrint = () => {
    window.print()
    showToast('Print dialog opened.')
  }

  const hasReport  = !!report && !!reportMeta
  const activeFilters = [session, classId, section, studentId, termId].filter(Boolean).length

  const filterFields = {
    session, setSession,
    classId, setClassId: handleClassChange,
    section, setSection: handleSectionChange,
    sections,
    studentId, setStudentId,
    students,
    termId, setTermId,
    date, setDate,
  }

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Report Card
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            CBSE — Class I to VIII · Student Progress Report
          </p>
        </div>
        {hasReport && (
          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 flex-shrink-0"
          >
            <Printer className="w-4 h-4" /> Print Report
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
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.classId} required>
              <NativeSelect value={classId}
                onChange={e => { handleClassChange(e.target.value); setErrors(p => ({ ...p, classId: undefined })) }}
                placeholder="-- Class --" error={errors.classId}>
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Section" error={errors.section} required>
              <NativeSelect value={section}
                onChange={e => { handleSectionChange(e.target.value); setErrors(p => ({ ...p, section: undefined })) }}
                placeholder="-- Section --" error={errors.section} disabled={!sections.length}>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Student" error={errors.studentId} required>
              <NativeSelect value={studentId}
                onChange={e => { setStudentId(e.target.value); setErrors(p => ({ ...p, studentId: undefined })) }}
                placeholder="-- Student --" error={errors.studentId} disabled={!students.length}>
                {students.map(s => <option key={s.id} value={s.id}>{s.rollNo}. {s.name}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.termId} required>
              <NativeSelect value={termId}
                onChange={e => { setTermId(e.target.value); setErrors(p => ({ ...p, termId: undefined })) }}
                placeholder="-- Term --" error={errors.termId}>
                {TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </NativeSelect>
            </Field>

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

          {/* Date row */}
          <div className="mt-3 max-w-xs">
            <Field label="Report Date (optional)">
              <div className="relative">
                <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input type="date" value={date} onChange={e => setDate(e.target.value)}
                  className="w-full appearance-none pl-8 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none transition-all
                    bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400" />
              </div>
            </Field>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 ? `${activeFilters} filter${activeFilters > 1 ? 's' : ''} applied` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasReport && (
          <button type="button" onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-sm">
            <Printer className="w-4 h-4" />
          </button>
        )}
        {hasReport && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        fields={filterFields}
        errors={errors}
        onShow={handleShow}
        loading={loading}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── Report Card ──────────────────────────────────────────────────── */}
      {hasReport && !loading && (
        <div ref={printRef} className="space-y-4 print:space-y-3">

          {/* School header */}
          <SchoolHeader session={reportMeta.session} term={reportMeta.termLabel} />

          {/* Student info */}
          <StudentInfoBanner
            student={reportMeta.student}
            classLabel={reportMeta.classLabel}
            section={reportMeta.section}
            date={reportMeta.date}
          />

          {/* Summary stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={BarChart2}      label="Total Marks"    value={`${report.totalObtained}/${report.totalMax}`} color="blue"    />
            <StatCard icon={TrendingUp}     label="Percentage"     value={`${report.percentage}%`}                       color="emerald" />
            <StatCard icon={Award}          label="Overall Grade"  value={report.overall.grade}                          color="violet"  />
            <StatCard icon={Users}          label="Class Rank"     value={`${report.rank}`} sub={`of ${report.totalStudents}`} color="amber" />
          </div>

          {/* Result Ribbon */}
          <ResultRibbon result={report.result} rank={report.rank} totalStudents={report.totalStudents} />

          {/* Subject-wise marks */}
          <SubjectTable
            rows={report.subjectRows}
            totalMax={report.totalMax}
            totalObtained={report.totalObtained}
            percentage={report.percentage}
            overall={report.overall}
          />

          {/* Co-Scholastic */}
          <CoScholasticSection activities={report.coScholastic} />

          {/* Attendance */}
          <AttendanceSection attendance={report.attendance} />

          {/* Grade scale reference */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-amber-500 flex-shrink-0" />
              <Hash className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Grading Scale</span>
            </div>
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
                {[
                  { range: '91–100', grade: 'A1', gp: '10', color: 'emerald' },
                  { range: '81–90',  grade: 'A2', gp: '9',  color: 'green'   },
                  { range: '71–80',  grade: 'B1', gp: '8',  color: 'lime'    },
                  { range: '61–70',  grade: 'B2', gp: '7',  color: 'yellow'  },
                  { range: '51–60',  grade: 'C1', gp: '6',  color: 'amber'   },
                  { range: '41–50',  grade: 'C2', gp: '5',  color: 'orange'  },
                  { range: '33–40',  grade: 'D',  gp: '4',  color: 'red'     },
                  { range: '0–32',   grade: 'E',  gp: '—',  color: 'rose'    },
                ].map(item => (
                  <div key={item.grade} className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.08)] p-2.5">
                    <GradeBadge grade={item.grade} color={item.color} />
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 text-center tabular-nums">{item.range}%</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500">GP: {item.gp}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer note */}
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/[0.06] border border-blue-100 dark:border-blue-500/20">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              This is a computer-generated report card. For queries, contact the school administration.
              Marks are subject to revision pending official declaration.
            </p>
          </div>

          {/* Print button (bottom, mobile) */}
          <div className="sm:hidden">
            <button type="button" onClick={handlePrint}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all">
              <Printer className="w-5 h-5" /> Print / Download Report
            </button>
          </div>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasReport && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select the session, class, section, student and term above, then click <strong>Show</strong> to view the report card.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Print styles */}
      <style>{`
        @media print {
          body > *:not(#root) { display: none; }
          .print\\:hidden { display: none !important; }
          @page { size: A4; margin: 15mm; }
        }
      `}</style>
    </div>
  )
}
