/**
 * ReportCardExamwise.jsx
 * Folder: src/pages/Student/Reports/ReportCardExamwise.jsx
 *
 * Converts legacy ASPX "Report Card (Exam-wise)" to fully-responsive React + Tailwind.
 *
 * Filters: Session → Class → Term → Exam → Student (optional) + Date
 * Features:
 *  - Cascading dropdowns (Session → Class → Term → Exam → Student)
 *  - Submit (Show Report) + Export button
 *  - Rich report card viewer (marks table per subject, grade, result)
 *  - Mobile: card-based collapsible per subject
 *  - Desktop: dense ERP table
 *  - Print / PDF export placeholder
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search,
  FileSpreadsheet, BookOpen,
  Building2, MapPin, ChevronRight,
  Award, TrendingUp, User, Calendar,
  ClipboardList, GraduationCap, Printer,
  Star, BarChart3, Info, CheckCircle2, XCircle,
  ChevronUp
} from 'lucide-react'

// ─── SCHOOL INFO ─────────────────────────────────────────────────────────────
const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  phone: '0135-2714321',
  affiliation: 'CBSE Affiliation No. 05000012',
}

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES_BY_SESSION = {
  '2022-23': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
    'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
    'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
    'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
    'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

const TERMS = ['Term 1', 'Term 2', 'Annual']

const EXAMS_BY_TERM = {
  'Term 1': ['Unit Test 1', 'Mid Term', 'Unit Test 2'],
  'Term 2': ['Unit Test 3', 'Half Yearly', 'Unit Test 4'],
  'Annual': ['Pre Board', 'Annual Exam', 'Final Exam'],
}

const STUDENTS_BY_CLASS = {
  'Class I':    [{ id: '1', name: 'Aarav Sharma', roll: '101' }, { id: '2', name: 'Priya Singh', roll: '102' }, { id: '3', name: 'Rohan Gupta', roll: '103' }],
  'Class II':   [{ id: '4', name: 'Ananya Verma', roll: '201' }, { id: '5', name: 'Rahul Kumar', roll: '202' }],
  'Class III':  [{ id: '6', name: 'Siya Patel', roll: '301' }, { id: '7', name: 'Arjun Yadav', roll: '302' }],
  'Class IV':   [{ id: '8', name: 'Meera Joshi', roll: '401' }, { id: '9', name: 'Vivek Nair', roll: '402' }],
  'Class V':    [{ id: '10', name: 'Kavya Pillai', roll: '501' }, { id: '11', name: 'Aditya Mishra', roll: '502' }],
  'Class VI':   [{ id: '12', name: 'Ishaan Chopra', roll: '601' }, { id: '13', name: 'Sneha Dubey', roll: '602' }],
  'Class VII':  [{ id: '14', name: 'Harsh Agarwal', roll: '701' }, { id: '15', name: 'Pooja Mehta', roll: '702' }],
  'Class VIII': [{ id: '16', name: 'Dev Saxena', roll: '801' }, { id: '17', name: 'Riya Tiwari', roll: '802' }],
  'Class IX':   [{ id: '18', name: 'Akash Pandey', roll: '901' }, { id: '19', name: 'Neha Rao', roll: '902' }],
  'Class X':    [{ id: '20', name: 'Shivam Tripathi', roll: '1001' }, { id: '21', name: 'Divya Srivastava', roll: '1002' }],
  'Class XI':   [{ id: '22', name: 'Kunal Bhatia', roll: '1101' }, { id: '23', name: 'Tanvi Kapoor', roll: '1102' }],
  'Class XII':  [{ id: '24', name: 'Aman Sharma', roll: '1201' }, { id: '25', name: 'Prachi Singh', roll: '1202' }],
}

// Subjects per class
const SUBJECTS_BY_CLASS = {
  'Class I':    ['English', 'Hindi', 'Mathematics', 'EVS', 'Drawing'],
  'Class II':   ['English', 'Hindi', 'Mathematics', 'EVS', 'Drawing'],
  'Class III':  ['English', 'Hindi', 'Mathematics', 'EVS', 'Computer'],
  'Class IV':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  'Class V':    ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Computer'],
  'Class VI':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  'Class VII':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  'Class VIII': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  'Class IX':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Information Technology'],
  'Class X':    ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Information Technology'],
  'Class XI':   ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Physical Education'],
  'Class XII':  ['English', 'Physics', 'Chemistry', 'Mathematics', 'Computer Science', 'Physical Education'],
}

// Grade calculator
const getGrade = (pct) => {
  if (pct >= 91) return { grade: 'A1', point: 10, color: 'emerald' }
  if (pct >= 81) return { grade: 'A2', point: 9,  color: 'emerald' }
  if (pct >= 71) return { grade: 'B1', point: 8,  color: 'blue'    }
  if (pct >= 61) return { grade: 'B2', point: 7,  color: 'blue'    }
  if (pct >= 51) return { grade: 'C1', point: 6,  color: 'amber'   }
  if (pct >= 41) return { grade: 'C2', point: 5,  color: 'amber'   }
  if (pct >= 33) return { grade: 'D',  point: 4,  color: 'orange'  }
  return { grade: 'E',  point: 0,  color: 'red' }
}

// Generate deterministic dummy marks for a student+exam combo
const generateMarks = (studentId, examName, className) => {
  const subjects = SUBJECTS_BY_CLASS[className] || ['English', 'Hindi', 'Mathematics']
  const seed = (studentId + examName).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const maxMark = examName.includes('Unit') ? 25 : examName.includes('Mid') || examName.includes('Half') ? 50 : 100

  return subjects.map((subject, i) => {
    const raw = ((seed * (i + 7) * 13) % (maxMark - 8)) + 8
    const obtained = Math.min(raw, maxMark)
    const pct = Math.round((obtained / maxMark) * 100)
    const { grade, point, color } = getGrade(pct)
    return { subject, maxMark, obtained, pct, grade, point, color, pass: pct >= 33 }
  })
}

// ─── HELPERS / COLOURS ───────────────────────────────────────────────────────
const GRADE_BG = {
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/25',
  blue:    'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border-blue-200 dark:border-blue-500/25',
  amber:   'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border-amber-200 dark:border-amber-500/25',
  orange:  'bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400 border-orange-200 dark:border-orange-500/25',
  red:     'bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-400 border-red-200 dark:border-red-500/25',
}

const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
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
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
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
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
function SummaryCard({ icon: Icon, label, value, sub, color }) {
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
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ info, meta }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {info.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{info.address}</span>
      </div>
      {/* Meta pills */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { label: 'Session', value: meta.session },
          { label: 'Class',   value: meta.class   },
          { label: 'Term',    value: meta.term     },
          { label: 'Exam',    value: meta.exam     },
        ].map(m => (
          <span key={m.label}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[11px] font-bold text-amber-700 dark:text-amber-400">
            <span className="font-normal opacity-70">{m.label}:</span> {m.value}
          </span>
        ))}
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Report Card
      </p>
    </div>
  )
}

// ─── STUDENT INFO BANNER ──────────────────────────────────────────────────────
function StudentBanner({ student, date }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-4">
        {/* Avatar */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <User className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[17px] font-extrabold text-slate-800 dark:text-slate-100">{student.name}</p>
          <div className="flex flex-wrap gap-3 mt-1">
            <span className="flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-400">
              <ClipboardList className="w-3.5 h-3.5" />Roll No: <strong className="text-slate-700 dark:text-slate-200">{student.roll}</strong>
            </span>
            {date && (
              <span className="flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-400">
                <Calendar className="w-3.5 h-3.5" />Date: <strong className="text-slate-700 dark:text-slate-200">{formatDate(date)}</strong>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP MARKS TABLE ──────────────────────────────────────────────────────
function DesktopMarksTable({ marks, examName }) {
  const totObtained = marks.reduce((s, r) => s + r.obtained, 0)
  const totMax      = marks.reduce((s, r) => s + r.maxMark, 0)
  const totPct      = totMax ? Math.round((totObtained / totMax) * 100) : 0
  const { grade: totGrade, color: totColor } = getGrade(totPct)
  const allPass = marks.every(r => r.pass)

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/60 dark:bg-white/[0.02]">
            {['S.No.', 'Subject', 'Max Marks', 'Marks Obtained', 'Percentage', 'Grade', 'Status'].map((h, i) => (
              <th key={i}
                className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {marks.map((row, i) => (
            <tr key={row.subject}
              className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
              {/* S.No */}
              <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums">{i + 1}</td>
              {/* Subject */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">
                    {row.subject.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.subject}</span>
                </div>
              </td>
              {/* Max */}
              <td className="px-4 py-3 text-center text-[13px] font-medium text-slate-600 dark:text-slate-300 tabular-nums">{row.maxMark}</td>
              {/* Obtained */}
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
                  {row.obtained}
                </span>
              </td>
              {/* Percentage */}
              <td className="px-4 py-3 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{row.pct}%</span>
                  <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${row.pct >= 60 ? 'bg-emerald-500' : row.pct >= 33 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${row.pct}%` }}
                    />
                  </div>
                </div>
              </td>
              {/* Grade */}
              <td className="px-4 py-3 text-center">
                <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-[12px] font-bold border ${GRADE_BG[row.color]}`}>
                  {row.grade}
                </span>
              </td>
              {/* Status */}
              <td className="px-4 py-3 text-center">
                {row.pass
                  ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25">
                      <CheckCircle2 className="w-3.5 h-3.5" />Pass
                    </span>
                  : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 border border-red-200 dark:border-red-500/25">
                      <XCircle className="w-3.5 h-3.5" />Fail
                    </span>}
              </td>
            </tr>
          ))}

          {/* Grand Total Row */}
          <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
            <td className="px-4 py-3 text-center text-[12px] text-blue-400">—</td>
            <td className="px-4 py-3" colSpan={1}>
              <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />Total / Overall
              </span>
            </td>
            <td className="px-4 py-3 text-center">
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{totMax}</span>
            </td>
            <td className="px-4 py-3 text-center">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">{totObtained}</span>
            </td>
            <td className="px-4 py-3 text-center">
              <span className="text-[14px] font-extrabold text-slate-800 dark:text-slate-100 tabular-nums">{totPct}%</span>
            </td>
            <td className="px-4 py-3 text-center">
              <span className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-[13px] font-bold border-2 ${GRADE_BG[totColor]}`}>
                {totGrade}
              </span>
            </td>
            <td className="px-4 py-3 text-center">
              {allPass
                ? <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-500/30">
                    <Award className="w-4 h-4" />Promoted
                  </span>
                : <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold bg-red-100 text-red-800 dark:bg-red-500/20 dark:text-red-300 border border-red-300 dark:border-red-500/30">
                    <XCircle className="w-4 h-4" />Not Promoted
                  </span>}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE SUBJECT CARD ──────────────────────────────────────────────────────
function MobileSubjectCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Subject badge */}
        <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">
          {row.subject.slice(0, 2).toUpperCase()}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.subject}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${row.pct >= 60 ? 'bg-emerald-500' : row.pct >= 33 ? 'bg-amber-500' : 'bg-red-500'}`}
                style={{ width: `${row.pct}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0">{row.pct}%</span>
          </div>
        </div>

        {/* Grade + Pass pill */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-[11px] font-bold border ${GRADE_BG[row.color]}`}>
            {row.grade}
          </span>
          {row.pass
            ? <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">PASS</span>
            : <span className="text-[9px] font-bold text-red-600 dark:text-red-400">FAIL</span>}
        </div>

        <span className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? '-rotate-90' : 'rotate-0'}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-[rgba(99,102,241,0.1)] p-3 text-center">
              <p className="text-[20px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{row.maxMark}</p>
              <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide mt-0.5">Max Marks</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{row.obtained}</p>
              <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mt-0.5">Obtained</p>
            </div>
            <div className={`rounded-xl border p-3 text-center ${GRADE_BG[row.color]}`}>
              <p className="text-[20px] font-bold tabular-nums">{row.grade}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5">Grade</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE TOTAL CARD ────────────────────────────────────────────────────────
function MobileTotalCard({ marks }) {
  const totObtained = marks.reduce((s, r) => s + r.obtained, 0)
  const totMax      = marks.reduce((s, r) => s + r.maxMark, 0)
  const totPct      = totMax ? Math.round((totObtained / totMax) * 100) : 0
  const { grade, color } = getGrade(totPct)
  const allPass = marks.every(r => r.pass)
  const passCount = marks.filter(r => r.pass).length

  return (
    <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
      <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />Overall Result
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
          <p className="text-[22px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{totObtained}/{totMax}</p>
          <p className="text-[10px] font-semibold text-slate-600 dark:text-slate-400">Total Marks</p>
        </div>
        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
          <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totPct}%</p>
          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Percentage</p>
        </div>
        <div className={`rounded-lg p-2.5 text-center border ${GRADE_BG[color]}`}>
          <p className="text-[22px] font-bold tabular-nums">{grade}</p>
          <p className="text-[10px] font-semibold uppercase tracking-wide mt-0.5">Overall Grade</p>
        </div>
        <div className={`rounded-lg p-2.5 text-center ${allPass ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20' : 'bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20'}`}>
          <p className={`text-[16px] font-bold ${allPass ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300'}`}>
            {allPass ? '🎉 Promoted' : '⚠️ Not Promoted'}
          </p>
          <p className={`text-[10px] font-semibold mt-0.5 ${allPass ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {passCount}/{marks.length} subjects passed
          </p>
        </div>
      </div>
      {/* Progress bar */}
      <div>
        <div className="flex text-[10px] font-semibold justify-between mb-1">
          <span className="text-blue-600 dark:text-blue-400">Score {totPct}%</span>
          <span className="text-slate-400">Pass: 33%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${totPct >= 60 ? 'bg-emerald-500' : totPct >= 33 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${totPct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilter, onSubmit, loading, errors, availableClasses, availableTerms, availableExams, availableStudents }) {
  if (!open) return null
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
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35] z-10">
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
            <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.class} required>
            <NativeSelect value={filters.class} onChange={e => setFilter('class', e.target.value)} placeholder="-- Select Class --" error={errors.class} disabled={!filters.session}>
              {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={filters.term} onChange={e => setFilter('term', e.target.value)} placeholder="-- Select Term --" error={errors.term} disabled={!filters.class}>
              {availableTerms.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={filters.exam} onChange={e => setFilter('exam', e.target.value)} placeholder="-- Select Exam --" error={errors.exam} disabled={!filters.term}>
              {availableExams.map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Student (Optional)">
            <NativeSelect value={filters.student} onChange={e => setFilter('student', e.target.value)} placeholder="-- All Students --" disabled={!filters.class}>
              {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll})</option>)}
            </NativeSelect>
          </Field>
          <Field label="Date (Optional)">
            <input
              type="date"
              value={filters.date}
              onChange={e => setFilter('date', e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
            />
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── GRADE LEGEND ─────────────────────────────────────────────────────────────
function GradeLegend() {
  const grades = [
    { grade: 'A1', range: '91–100', color: 'emerald' },
    { grade: 'A2', range: '81–90',  color: 'emerald' },
    { grade: 'B1', range: '71–80',  color: 'blue'    },
    { grade: 'B2', range: '61–70',  color: 'blue'    },
    { grade: 'C1', range: '51–60',  color: 'amber'   },
    { grade: 'C2', range: '41–50',  color: 'amber'   },
    { grade: 'D',  range: '33–40',  color: 'orange'  },
    { grade: 'E',  range: 'Below 33',color: 'red'    },
  ]
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 shadow-sm">
      <p className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-2">
        <Star className="w-3.5 h-3.5" />Grade Legend
      </p>
      <div className="flex flex-wrap gap-2">
        {grades.map(g => (
          <span key={g.grade} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${GRADE_BG[g.color]}`}>
            <strong>{g.grade}</strong>
            <span className="opacity-70">({g.range}%)</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ReportCardExamwise() {
  const [filters, setFiltersState] = useState({
    session: '', class: '', term: '', exam: '', student: '', date: ''
  })
  const [errors,      setErrors]      = useState({})
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [reportData,  setReportData]  = useState(null) // { student, marks, meta }
  const [shownMeta,   setShownMeta]   = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Setter helper
  const setFilter = useCallback((key, val) => {
    setFiltersState(prev => {
      const next = { ...prev, [key]: val }
      // Cascade reset downstream
      if (key === 'session') { next.class = ''; next.term = ''; next.exam = ''; next.student = '' }
      if (key === 'class')   { next.term = '';  next.exam = '';  next.student = '' }
      if (key === 'term')    { next.exam = '';   next.student = '' }
      return next
    })
    setErrors(p => ({ ...p, [key]: undefined }))
  }, [])

  // Cascading options
  const availableClasses   = filters.session ? (CLASSES_BY_SESSION[filters.session] || []) : []
  const availableTerms     = filters.class   ? TERMS : []
  const availableExams     = filters.term    ? (EXAMS_BY_TERM[filters.term] || []) : []
  const availableStudents  = filters.class   ? (STUDENTS_BY_CLASS[filters.class] || []) : []

  // Validate
  const validate = () => {
    const err = {}
    if (!filters.session) err.session = 'Required'
    if (!filters.class)   err.class   = 'Required'
    if (!filters.term)    err.term    = 'Required'
    if (!filters.exam)    err.exam    = 'Required'
    return err
  }

  // Submit
  const handleSubmit = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setShown(false)
    setReportData(null)

    setTimeout(() => {
      // Pick student — if "All Students", use first; otherwise find selected
      let student
      const students = STUDENTS_BY_CLASS[filters.class] || []
      if (filters.student) {
        student = students.find(s => s.id === filters.student) || students[0]
      } else {
        student = students[0]
      }

      const marks = student
        ? generateMarks(student.id, filters.exam, filters.class)
        : []

      setReportData({ student, marks })
      setShownMeta({ ...filters })
      setShown(true)
      setLoading(false)
      showToast(`Report card loaded for ${student?.name || 'student'}.`)
    }, 800)
  }, [filters])

  const handleReset = () => {
    setFiltersState({ session: '', class: '', term: '', exam: '', student: '', date: '' })
    setErrors({}); setShown(false); setReportData(null); setShownMeta({})
  }

  const handleExport = () => {
    if (!shown) { showToast('Generate report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Export ready! (API integration pending)') }, 1200)
  }

  const handlePrint = () => {
    showToast('Print functionality ready! (API integration pending)')
  }

  // Summary stats
  const summary = useMemo(() => {
    if (!reportData?.marks?.length) return null
    const marks = reportData.marks
    const totObtained = marks.reduce((s, r) => s + r.obtained, 0)
    const totMax      = marks.reduce((s, r) => s + r.maxMark, 0)
    const totPct      = totMax ? Math.round((totObtained / totMax) * 100) : 0
    const { grade }   = getGrade(totPct)
    const passCount   = marks.filter(r => r.pass).length
    return { totObtained, totMax, totPct, grade, passCount, total: marks.length }
  }, [reportData])

  const activeFilterCount = [filters.session, filters.class, filters.term, filters.exam].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Report Card
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Exam-wise student report card with marks, grades &amp; result.
          </p>
        </div>
        {shown && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1a1f35] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
            >
              <Printer className="w-4 h-4" />Print
            </button>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Export
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
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">

            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)} placeholder="-- Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.class} required>
              <NativeSelect value={filters.class} onChange={e => setFilter('class', e.target.value)} placeholder="-- Class --" error={errors.class} disabled={!filters.session}>
                {availableClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.term} required>
              <NativeSelect value={filters.term} onChange={e => setFilter('term', e.target.value)} placeholder="-- Term --" error={errors.term} disabled={!filters.class}>
                {availableTerms.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Exam" error={errors.exam} required>
              <NativeSelect value={filters.exam} onChange={e => setFilter('exam', e.target.value)} placeholder="-- Exam --" error={errors.exam} disabled={!filters.term}>
                {availableExams.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Student">
              <NativeSelect value={filters.student} onChange={e => setFilter('student', e.target.value)} placeholder="-- All Students --" disabled={!filters.class}>
                {availableStudents.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll})</option>)}
              </NativeSelect>
            </Field>

            <Field label="Date">
              <input
                type="date"
                value={filters.date}
                onChange={e => setFilter('date', e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
              />
            </Field>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report
            </button>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />Reset
            </button>
            {shown && (
              <>
                <div className="flex-1" />
                <button type="button" onClick={handlePrint}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1a1f35] hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                  <Printer className="w-4 h-4" />Print
                </button>
                <button type="button" onClick={handleExport} disabled={exporting}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70">
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                  Export
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 ? `${activeFilterCount} Filter${activeFilterCount > 1 ? 's' : ''} Set` : 'Set Filters'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}/4</span>
          )}
        </button>
        {shown && (
          <>
            <button type="button" onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1a1f35]">
              <Printer className="w-4 h-4" />
            </button>
            <button type="button" onClick={handleExport} disabled={exporting}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
          </>
        )}
        {shown && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile: show submit inside drawer via onSubmit, but also a quick "Show" if all filters set */}
      {activeFilterCount === 4 && !shown && !loading && (
        <button type="button" onClick={handleSubmit}
          className="flex sm:hidden w-full items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <Eye className="w-4 h-4" />Show Report
        </button>
      )}

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors}
        availableClasses={availableClasses}
        availableTerms={availableTerms}
        availableExams={availableExams}
        availableStudents={availableStudents}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {shown && reportData && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            info={SCHOOL_INFO}
            meta={{ session: shownMeta.session, class: shownMeta.class, term: shownMeta.term, exam: shownMeta.exam }}
          />

          {/* Student Banner */}
          {reportData.student && (
            <StudentBanner student={reportData.student} date={shownMeta.date} />
          )}

          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard icon={ClipboardList} label="Total Subjects"  value={summary.total}            color="blue"    />
              <SummaryCard icon={TrendingUp}    label="Percentage"       value={`${summary.totPct}%`}    color="violet"  />
              <SummaryCard icon={Award}         label="Overall Grade"    value={summary.grade}            color="amber"   />
              <SummaryCard icon={CheckCircle2}  label="Subjects Passed"  value={`${summary.passCount}/${summary.total}`} color="emerald" />
            </div>
          )}

          {/* Grade Legend */}
          <GradeLegend />

          {/* Report Card Table */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Subject-wise Marks</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.exam}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {reportData.marks.length} subject{reportData.marks.length !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            {/* Info bar */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Pass criteria: 33% in each subject. Grade calculated as per CBSE grading system.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block">
              <DesktopMarksTable marks={reportData.marks} examName={shownMeta.exam} />
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a subject card to see detailed breakdown.
              </p>
              {reportData.marks.map((row, i) => (
                <MobileSubjectCard key={row.subject} row={row} idx={i + 1} />
              ))}
              {/* Mobile Grand Total */}
              <MobileTotalCard marks={reportData.marks} />
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{reportData.marks.length}</span> subjects ·{' '}
                {shownMeta.exam} · {shownMeta.session}
              </p>
              <button type="button" onClick={handlePrint}
                className="flex items-center gap-1.5 text-[12px] text-blue-600 dark:text-blue-400 hover:underline">
                <Printer className="w-3.5 h-3.5" />Print Card
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 opacity-50" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">No report card generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select Session → Class → Term → Exam and click <strong>Show Report</strong> to view the report card.
            </p>
          </div>
          {/* Step guide */}
          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {['Session', 'Class', 'Term', 'Exam'].map((step, i) => (
              <div key={step} className="flex items-center gap-1.5">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold
                  ${filters[step.toLowerCase()] || (step === 'Class' && filters.class)
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {i + 1}
                </span>
                <span className="text-[12px] text-slate-500 dark:text-slate-400">{step}</span>
                {i < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />}
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
