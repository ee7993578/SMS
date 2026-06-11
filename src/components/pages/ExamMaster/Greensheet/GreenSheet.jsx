/**
 * GreenSheet.jsx
 * Folder: src/pages/Reports/Exam/GreenSheet.jsx
 *
 * Converts legacy ASPX "Green Sheet" exam report to fully-responsive React + Tailwind.
 *
 * Filters: Session → Class → Term → Exam → Other Exam (cascading dropdowns)
 * Features:
 *  - Cascading dropdown filters (Class loads on Session change, Term on Class, Exam on Term)
 *  - Show report button with validation
 *  - Desktop: ERP-style dense table
 *  - Mobile: Card-based layout with expandable details
 *  - Loading states, empty states, toast notifications
 *  - Excel export placeholder
 *  - Search within results
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, FileSpreadsheet,
  BookOpen, TrendingUp, ChevronRight,
  Building2, MapPin, ClipboardList,
  BarChart3, Award, Users, Percent,
  CheckCircle2, XCircle, MinusCircle, Info,
  ChevronUp, Star, Medal
} from 'lucide-react'

// ─── SCHOOL INFO ──────────────────────────────────────────────────────────────
const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// ─── STATIC CASCADE DATA ─────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES_BY_SESSION = {
  '2022-23': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

const TERMS_BY_CLASS = {
  'Nursery': ['Term 1', 'Term 2'],
  'LKG': ['Term 1', 'Term 2'],
  'UKG': ['Term 1', 'Term 2'],
  'Class I': ['Term 1', 'Term 2', 'Term 3'],
  'Class II': ['Term 1', 'Term 2', 'Term 3'],
  'Class III': ['Term 1', 'Term 2', 'Term 3'],
  'Class IV': ['Term 1', 'Term 2', 'Term 3'],
  'Class V': ['Term 1', 'Term 2', 'Term 3'],
  'Class VI': ['Half Yearly', 'Annual'],
  'Class VII': ['Half Yearly', 'Annual'],
  'Class VIII': ['Half Yearly', 'Annual'],
  'Class IX': ['Half Yearly', 'Pre-Board', 'Annual'],
  'Class X': ['Half Yearly', 'Pre-Board', 'Annual'],
  'Class XI': ['Half Yearly', 'Annual'],
  'Class XII': ['Half Yearly', 'Pre-Board', 'Annual'],
}

const EXAMS_BY_TERM = {
  'Term 1': ['Unit Test 1', 'Unit Test 2'],
  'Term 2': ['Unit Test 3', 'Mid Term'],
  'Term 3': ['Unit Test 4', 'Final Exam'],
  'Half Yearly': ['Half Yearly Exam'],
  'Annual': ['Annual Exam'],
  'Pre-Board': ['Pre-Board Exam 1', 'Pre-Board Exam 2'],
}

const OTHER_EXAMS = ['None', 'Olympiad', 'NTSE', 'Science Quiz', 'Math Olympiad']

// ─── DUMMY GREEN SHEET DATA ───────────────────────────────────────────────────
// Simulates subject-wise marks table for a class in an exam
const generateGreenSheetData = (cls, term, exam) => {
  const subjects = {
    'Nursery': ['English', 'Hindi', 'Math', 'EVS'],
    'LKG': ['English', 'Hindi', 'Math', 'EVS', 'Drawing'],
    'UKG': ['English', 'Hindi', 'Math', 'EVS', 'Drawing'],
    'Class I': ['English', 'Hindi', 'Math', 'EVS', 'G.K.'],
    'Class II': ['English', 'Hindi', 'Math', 'EVS', 'G.K.'],
    'Class III': ['English', 'Hindi', 'Math', 'Science', 'S.St.', 'G.K.'],
    'Class IV': ['English', 'Hindi', 'Math', 'Science', 'S.St.', 'G.K.'],
    'Class V': ['English', 'Hindi', 'Math', 'Science', 'S.St.', 'G.K.'],
    'Class VI': ['English', 'Hindi', 'Math', 'Science', 'S.St.', 'Sanskrit'],
    'Class VII': ['English', 'Hindi', 'Math', 'Science', 'S.St.', 'Sanskrit'],
    'Class VIII': ['English', 'Hindi', 'Math', 'Science', 'S.St.', 'Sanskrit'],
    'Class IX': ['English', 'Hindi', 'Math', 'Science', 'S.St.'],
    'Class X': ['English', 'Hindi', 'Math', 'Science', 'S.St.'],
    'Class XI': ['English', 'Physics', 'Chemistry', 'Math', 'Biology'],
    'Class XII': ['English', 'Physics', 'Chemistry', 'Math', 'Biology'],
  }
  const subs = subjects[cls] || ['English', 'Hindi', 'Math', 'Science']
  const maxMarks = exam?.includes('Unit') ? 25 : exam?.includes('Pre-Board') ? 80 : 100

  const names = [
    'Aarav Sharma', 'Priya Singh', 'Rohit Kumar', 'Anjali Gupta', 'Vikram Patel',
    'Sneha Joshi', 'Arjun Verma', 'Pooja Yadav', 'Karan Mehta', 'Divya Tiwari',
    'Rahul Saxena', 'Ananya Mishra', 'Aditya Rao', 'Kavya Nair', 'Siddharth Jain',
    'Mansi Agarwal', 'Nikhil Pandey', 'Riya Shukla', 'Yash Chauhan', 'Tanya Bhatia',
    'Harsh Goel', 'Nidhi Malhotra', 'Vivek Thakur', 'Shreya Dubey', 'Amit Srivastava',
  ]

  return names.slice(0, 18).map((name, i) => {
    const rollNo = String(i + 1).padStart(3, '0')
    const marks = {}
    let total = 0
    let absent = false

    subs.forEach(sub => {
      if (Math.random() < 0.04) {
        marks[sub] = 'AB'
        absent = true
      } else {
        const m = Math.floor(Math.random() * (maxMarks * 0.35)) + Math.floor(maxMarks * 0.55)
        marks[sub] = Math.min(m, maxMarks)
        total += marks[sub]
      }
    })

    const validMarks = subs.filter(s => marks[s] !== 'AB').length
    const percentage = validMarks > 0 ? Math.round((total / (validMarks * maxMarks)) * 100) : 0

    return {
      sNo: i + 1,
      rollNo,
      name,
      marks,
      total: absent ? 'AB' : total,
      percentage: absent ? '-' : percentage,
      grade: absent ? '-' : percentage >= 90 ? 'A+' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B+' : percentage >= 60 ? 'B' : percentage >= 50 ? 'C' : 'F',
      status: absent ? 'Absent' : percentage >= 33 ? 'Pass' : 'Fail',
      absent,
    }
  })
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const gradeColor = (grade) => {
  const map = {
    'A+': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
    'A':  'bg-green-100 text-green-800 dark:bg-green-500/20 dark:text-green-300',
    'B+': 'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
    'B':  'bg-sky-100 text-sky-800 dark:bg-sky-500/20 dark:text-sky-300',
    'C':  'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
    'F':  'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',
    '-':  'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  }
  return map[grade] || map['-']
}

const statusColor = (status) => {
  if (status === 'Pass') return 'text-emerald-600 dark:text-emerald-400'
  if (status === 'Fail') return 'text-rose-600 dark:text-rose-400'
  return 'text-slate-400'
}

const statusIcon = (status) => {
  if (status === 'Pass') return <CheckCircle2 className="w-3.5 h-3.5" />
  if (status === 'Fail') return <XCircle className="w-3.5 h-3.5" />
  return <MinusCircle className="w-3.5 h-3.5" />
}

const markColor = (mark, max) => {
  if (mark === 'AB') return 'text-slate-400 dark:text-slate-500'
  const pct = (mark / max) * 100
  if (pct >= 85) return 'text-emerald-700 dark:text-emerald-400 font-semibold'
  if (pct >= 65) return 'text-blue-700 dark:text-blue-400'
  if (pct >= 40) return 'text-amber-700 dark:text-amber-400'
  return 'text-rose-700 dark:text-rose-400'
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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
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
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────
function SchoolHeader({ session, cls, term, exam }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400">{cls}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25">
          <span className="text-[11px] font-bold text-violet-700 dark:text-violet-400">{term}</span>
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25">
          <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">{exam}</span>
        </span>
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Green Sheet — Exam Marks Report
      </p>
    </div>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileStudentCard({ student, subjects, maxMarks, rank }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm transition-all
      ${student.absent
        ? 'border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1a1f35]'
        : student.status === 'Pass'
          ? 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'
          : 'border-rose-200 dark:border-rose-500/20 bg-white dark:bg-[#1a1f35]'
      }`}>

      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Rank badge */}
        <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">{student.sNo}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{student.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Roll: {student.rollNo}</p>
        </div>

        {/* Right side: total + grade + status */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {student.absent ? (
            <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg">ABSENT</span>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg ${gradeColor(student.grade)}`}>{student.grade}</span>
                <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{student.percentage}%</span>
              </div>
              <div className={`flex items-center gap-1 text-[11px] font-semibold ${statusColor(student.status)}`}>
                {statusIcon(student.status)} {student.status}
              </div>
            </>
          )}
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Progress bar */}
      {!student.absent && (
        <div className="px-4 pb-3">
          <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                student.percentage >= 75 ? 'bg-emerald-500' :
                student.percentage >= 50 ? 'bg-blue-500' :
                student.percentage >= 33 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${student.percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Expanded subject marks */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-3">Subject-wise Marks (Max: {maxMarks})</p>
          <div className="grid grid-cols-2 gap-2">
            {subjects.map(sub => (
              <div key={sub} className="rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.08)] p-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 truncate">{sub}</p>
                <p className={`text-[18px] font-bold tabular-nums mt-0.5 ${markColor(student.marks[sub], maxMarks)}`}>
                  {student.marks[sub]}
                </p>
                {student.marks[sub] !== 'AB' && (
                  <div className="h-1 rounded-full bg-slate-200 dark:bg-slate-700 mt-1.5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-400"
                      style={{ width: `${(student.marks[sub] / maxMarks) * 100}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
          {!student.absent && (
            <div className="mt-3 flex items-center justify-between bg-blue-50 dark:bg-blue-500/[0.07] rounded-xl px-3 py-2.5">
              <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">Total</span>
              <span className="text-[16px] font-extrabold text-blue-800 dark:text-blue-300 tabular-nums">{student.total} / {subjects.length * maxMarks}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, cascade, onShow, loading, errors }) {
  if (!open) return null
  const { session, cls, term, exam, otherExam } = filters
  const classes = cascade.classes
  const terms   = cascade.terms
  const exams   = cascade.exams

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
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setFilters(p => ({ ...p, session: e.target.value, cls: '', term: '', exam: '' }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => setFilters(p => ({ ...p, cls: e.target.value, term: '', exam: '' }))} placeholder="-- Select Class --" error={errors.cls} disabled={!session}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setFilters(p => ({ ...p, term: e.target.value, exam: '' }))} placeholder="-- Select Term --" error={errors.term} disabled={!cls}>
              {terms.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={exam} onChange={e => setFilters(p => ({ ...p, exam: e.target.value }))} placeholder="-- Select Exam --" error={errors.exam} disabled={!term}>
              {exams.map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Other Exam">
            <NativeSelect value={otherExam} onChange={e => setFilters(p => ({ ...p, otherExam: e.target.value }))} placeholder="-- Select Other Exam --">
              {OTHER_EXAMS.map(o => <option key={o} value={o}>{o}</option>)}
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
export default function GreenSheet() {
  const [filters, setFilters] = useState({ session: '', cls: '', term: '', exam: '', otherExam: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch]   = useState('')
  const [toast, setToast]     = useState(null)
  const [shown, setShown]     = useState(false)
  const [reportData, setReportData] = useState({ rows: [], subjects: [], maxMarks: 100, snapshot: {} })
  const [activeTab, setActiveTab] = useState('all') // 'all' | 'pass' | 'fail' | 'absent'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Cascade computations ──────────────────────────────────────────────────
  const cascade = useMemo(() => ({
    classes: CLASSES_BY_SESSION[filters.session] || [],
    terms:   TERMS_BY_CLASS[filters.cls] || [],
    exams:   EXAMS_BY_TERM[filters.term] || [],
  }), [filters.session, filters.cls, filters.term])

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!filters.session) err.session = 'Select a session'
    if (!filters.cls)     err.cls     = 'Select a class'
    if (!filters.term)    err.term    = 'Select a term'
    if (!filters.exam)    err.exam    = 'Select an exam'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Show report ───────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setSearch('')
    setActiveTab('all')

    setTimeout(() => {
      const rows = generateGreenSheetData(filters.cls, filters.term, filters.exam)
      const subjects = Object.keys(rows[0]?.marks || {})
      const maxMarks = filters.exam?.includes('Unit') ? 25 : filters.exam?.includes('Pre-Board') ? 80 : 100
      setReportData({ rows, subjects, maxMarks, snapshot: { ...filters } })
      setShown(true)
      setLoading(false)
      showToast(`Green Sheet loaded — ${rows.length} students.`)
    }, 750)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', cls: '', term: '', exam: '', otherExam: '' })
    setErrors({})
    setShown(false)
    setSearch('')
    setReportData({ rows: [], subjects: [], maxMarks: 100, snapshot: {} })
  }

  const handleExcel = () => {
    if (!shown) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    let rows = reportData.rows
    if (activeTab === 'pass')   rows = rows.filter(r => r.status === 'Pass')
    if (activeTab === 'fail')   rows = rows.filter(r => r.status === 'Fail')
    if (activeTab === 'absent') rows = rows.filter(r => r.absent)
    if (search) {
      const q = search.toLowerCase()
      rows = rows.filter(r => r.name.toLowerCase().includes(q) || r.rollNo.toLowerCase().includes(q))
    }
    return rows
  }, [reportData.rows, activeTab, search])

  // ── Totals & stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const all = reportData.rows
    const pass   = all.filter(r => r.status === 'Pass').length
    const fail   = all.filter(r => r.status === 'Fail').length
    const absent = all.filter(r => r.absent).length
    const appeared = all.length - absent
    const passRate  = appeared > 0 ? Math.round((pass / appeared) * 100) : 0
    const avgPct    = appeared > 0
      ? Math.round(all.filter(r => !r.absent).reduce((s, r) => s + r.percentage, 0) / appeared)
      : 0
    return { total: all.length, pass, fail, absent, appeared, passRate, avgPct }
  }, [reportData.rows])

  const hasResults = shown && reportData.rows.length > 0

  // Active filter count
  const activeFilterCount = [filters.session, filters.cls, filters.term, filters.exam].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Green Sheet
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Exam-wise marks report — session, class, term and exam wise.
          </p>
        </div>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">

            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value, cls: '', term: '', exam: '' })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={filters.cls}
                onChange={e => { setFilters(p => ({ ...p, cls: e.target.value, term: '', exam: '' })); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.cls}
                disabled={!filters.session}
              >
                {cascade.classes.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.term} required>
              <NativeSelect
                value={filters.term}
                onChange={e => { setFilters(p => ({ ...p, term: e.target.value, exam: '' })); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select Term --"
                error={errors.term}
                disabled={!filters.cls}
              >
                {cascade.terms.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Exam" error={errors.exam} required>
              <NativeSelect
                value={filters.exam}
                onChange={e => { setFilters(p => ({ ...p, exam: e.target.value })); setErrors(p => ({ ...p, exam: undefined })) }}
                placeholder="-- Select Exam --"
                error={errors.exam}
                disabled={!filters.term}
              >
                {cascade.exams.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Other Exam">
              <NativeSelect
                value={filters.otherExam}
                onChange={e => setFilters(p => ({ ...p, otherExam: e.target.value }))}
                placeholder="-- Select Other --"
              >
                {OTHER_EXAMS.map(o => <option key={o} value={o}>{o}</option>)}
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
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 ? `Filters (${activeFilterCount}/4)` : 'Select Filters'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
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
        filters={filters}
        setFilters={setFilters}
        cascade={cascade}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={reportData.snapshot.session}
            cls={reportData.snapshot.cls}
            term={reportData.snapshot.term}
            exam={reportData.snapshot.exam}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}   label="Total Students"  value={stats.total}    color="blue"    />
            <SummaryCard icon={CheckCircle2} label="Passed"     value={stats.pass}     color="emerald" />
            <SummaryCard icon={XCircle} label="Failed"          value={stats.fail}     color="rose"    />
            <SummaryCard icon={Percent} label="Pass Rate"       value={`${stats.passRate}%`} color="violet" sub={`Avg: ${stats.avgPct}%`} />
          </div>

          {/* ── Results Card ────────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Marks</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  {filteredRows.length} record{filteredRows.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name or roll no…"
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

            {/* Tab filter */}
            <div className="flex items-center gap-1 px-5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] overflow-x-auto no-scrollbar">
              {[
                { key: 'all',    label: `All (${stats.total})`,        color: 'text-slate-600 dark:text-slate-300' },
                { key: 'pass',   label: `Pass (${stats.pass})`,        color: 'text-emerald-600 dark:text-emerald-400' },
                { key: 'fail',   label: `Fail (${stats.fail})`,        color: 'text-rose-600 dark:text-rose-400' },
                { key: 'absent', label: `Absent (${stats.absent})`,    color: 'text-slate-400 dark:text-slate-500' },
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all flex-shrink-0
                    ${activeTab === tab.key
                      ? 'bg-blue-600 text-white dark:bg-indigo-600 shadow-sm'
                      : `bg-transparent ${tab.color} hover:bg-slate-100 dark:hover:bg-white/[0.05]`
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filteredRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your filter.</span>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-10">S.No.</th>
                      <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Roll No.</th>
                      <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Student Name</th>
                      {reportData.subjects.map(sub => (
                        <th key={sub} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">{sub}</th>
                      ))}
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Total</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">%</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Grade</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((student, i) => (
                      <tr
                        key={student.rollNo}
                        className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
                          ${student.absent
                            ? 'bg-slate-50/40 dark:bg-white/[0.01] opacity-60'
                            : student.status === 'Fail'
                              ? 'hover:bg-rose-50/30 dark:hover:bg-rose-500/[0.03]'
                              : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
                          }`}
                      >
                        <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2.5 text-[12px] font-mono text-slate-500 dark:text-slate-400">{student.rollNo}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{student.name}</span>
                        </td>
                        {reportData.subjects.map(sub => (
                          <td key={sub} className={`px-3 py-2.5 text-center text-[13px] tabular-nums ${markColor(student.marks[sub], reportData.maxMarks)}`}>
                            {student.marks[sub]}
                          </td>
                        ))}
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[13px] font-bold tabular-nums text-slate-700 dark:text-slate-200">{student.total}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="text-[13px] font-semibold tabular-nums text-slate-600 dark:text-slate-300">{student.percentage === '-' ? '-' : `${student.percentage}%`}</span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[11px] font-bold ${gradeColor(student.grade)}`}>
                            {student.grade}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${statusColor(student.status)}`}>
                            {statusIcon(student.status)} {student.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* Desktop Grand Summary Row */}
                  <tfoot>
                    <tr className="border-t-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07]">
                      <td colSpan={3} className="px-3 py-3">
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Summary · {filteredRows.length} Students
                        </span>
                      </td>
                      {reportData.subjects.map(sub => {
                        const validMarks = filteredRows.filter(r => r.marks[sub] !== 'AB').map(r => r.marks[sub])
                        const avg = validMarks.length > 0 ? Math.round(validMarks.reduce((s, m) => s + m, 0) / validMarks.length) : 0
                        return (
                          <td key={sub} className="px-3 py-3 text-center">
                            <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">Avg: {avg}</span>
                          </td>
                        )
                      })}
                      <td className="px-3 py-3 text-center">
                        <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300">—</span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300">{stats.avgPct}%</span>
                      </td>
                      <td className="px-3 py-3 text-center">—</td>
                      <td className="px-3 py-3 text-center">
                        <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-300">{stats.passRate}% Pass</span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filteredRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your filter.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see subject-wise marks.
                  </p>

                  {filteredRows.map((student, i) => (
                    <MobileStudentCard
                      key={student.rollNo}
                      student={student}
                      subjects={reportData.subjects}
                      maxMarks={reportData.maxMarks}
                      rank={i + 1}
                    />
                  ))}

                  {/* Mobile Grand Summary */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Class Summary
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.total}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{stats.avgPct}%</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Class Average</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{stats.pass}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Passed</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{stats.fail}</p>
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Failed</p>
                      </div>
                    </div>
                    {/* Pass rate bar */}
                    <div>
                      <div className="flex text-[10px] font-semibold justify-between mb-1">
                        <span className="text-emerald-600 dark:text-emerald-400">Pass {stats.passRate}%</span>
                        <span className="text-rose-500 dark:text-rose-400">Fail {100 - stats.passRate}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
                        <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${stats.passRate}%` }} />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredRows.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{reportData.rows.length}</span> students
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
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
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select Session → Class → Term → Exam and click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
