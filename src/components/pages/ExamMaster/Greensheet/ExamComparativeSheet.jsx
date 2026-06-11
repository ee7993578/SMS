/**
 * ExamComparativeSheet.jsx
 * Folder: src/pages/Reports/Exam/ExamComparativeSheet.jsx
 *
 * Converts legacy ASPX "Exam Comparative Sheet" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session, Class, Exam (multi-select), Final Exam, Calculation % filters
 *  - Show report button
 *  - Desktop: dense ERP-style comparative table
 *  - Mobile: card-based layout with expandable subject details
 *  - Grand totals, rank column, pass/fail indicators
 *  - Toast notifications, loading states, empty states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Search,
  FileSpreadsheet, BookOpen, TrendingUp, User,
  BarChart3, Trophy, ClipboardList, GraduationCap,
  Percent, Star, Info, Building2, MapPin, Hash
} from 'lucide-react'

// ─── STATIC DATA ─────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const CLASSES = [
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const EXAMS_BY_SESSION = {
  '2022-23': ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'],
  '2023-24': ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'],
  '2024-25': ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'],
  '2025-26': ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'],
}

const SUBJECTS = ['Hindi', 'English', 'Mathematics', 'Science', 'Social Science', 'Computer']

// Dummy student data generator
function generateStudents(cls, session) {
  const seed = cls.charCodeAt(cls.length - 1) + session.charCodeAt(0)
  const count = 25 + (seed % 15)
  return Array.from({ length: count }, (_, i) => {
    const roll = i + 1
    const base = 55 + ((seed + i * 7) % 35)
    const examScores = {}
    EXAMS_BY_SESSION['2022-23'].forEach(exam => {
      examScores[exam] = SUBJECTS.reduce((acc, sub) => {
        const raw = Math.min(100, Math.max(20, base + ((sub.charCodeAt(0) + i * 3 + exam.charCodeAt(0)) % 30) - 10))
        acc[sub] = raw
        return acc
      }, {})
    })
    const names = ['Aarav', 'Priya', 'Rahul', 'Sneha', 'Amit', 'Pooja', 'Vikram', 'Anita',
      'Rohan', 'Kavya', 'Arjun', 'Simran', 'Karan', 'Riya', 'Dev', 'Nisha',
      'Ayush', 'Shreya', 'Nikhil', 'Divya', 'Siddharth', 'Meera', 'Harsh', 'Tanvi', 'Aditya']
    const surnames = ['Sharma', 'Gupta', 'Singh', 'Verma', 'Patel', 'Joshi', 'Mehta', 'Shah',
      'Yadav', 'Mishra', 'Tiwari', 'Pandey', 'Kumar', 'Nair', 'Reddy', 'Agarwal']
    return {
      roll,
      name: `${names[(i * 3 + seed) % names.length]} ${surnames[(i + seed) % surnames.length]}`,
      examScores,
      section: i < count / 2 ? 'A' : 'B',
    }
  })
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const getGrade = (pct) => {
  if (pct >= 90) return { grade: 'A+', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' }
  if (pct >= 80) return { grade: 'A',  color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10' }
  if (pct >= 70) return { grade: 'B+', color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50 dark:bg-indigo-500/10' }
  if (pct >= 60) return { grade: 'B',  color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' }
  if (pct >= 50) return { grade: 'C',  color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-500/10' }
  if (pct >= 33) return { grade: 'D',  color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10' }
  return { grade: 'F', color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10' }
}

const calcTotal = (scores, subjects) =>
  subjects.reduce((s, sub) => s + (scores[sub] ?? 0), 0)

const MAX_PER_SUBJECT = 100

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

function SummaryCard({ icon: Icon, label, value, sub, color }) {
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
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER ───────────────────────────────────────────────────────────

function SchoolHeader({ session, cls, exams }) {
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
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
          {cls}
        </span>
        {exams.map(e => (
          <span key={e} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 text-[11px] font-semibold text-violet-700 dark:text-violet-400">
            {e}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Exam Comparative Report
      </p>
    </div>
  )
}

// ─── MULTI-SELECT EXAM LISTBOX ────────────────────────────────────────────────

function ExamMultiSelect({ options, selected, onChange, error, disabled }) {
  const toggle = (exam) => {
    onChange(
      selected.includes(exam)
        ? selected.filter(e => e !== exam)
        : [...selected, exam]
    )
  }
  const toggleAll = () => {
    onChange(selected.length === options.length ? [] : [...options])
  }

  return (
    <div className={`rounded-lg border overflow-hidden ${error ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}>
      {/* All toggle */}
      <button
        type="button"
        onClick={toggleAll}
        disabled={disabled}
        className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300
          bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors disabled:opacity-50"
      >
        <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
          ${selected.length === options.length
            ? 'bg-blue-600 border-blue-600 dark:bg-indigo-600 dark:border-indigo-600'
            : 'border-slate-300 dark:border-slate-600'}`}>
          {selected.length === options.length && <Check className="w-2.5 h-2.5 text-white" />}
        </span>
        Select All
        {selected.length > 0 && (
          <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-400">
            {selected.length}/{options.length}
          </span>
        )}
      </button>
      {/* Options */}
      <div className="max-h-[130px] overflow-y-auto">
        {options.map(exam => (
          <button
            key={exam}
            type="button"
            onClick={() => toggle(exam)}
            disabled={disabled}
            className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-slate-700 dark:text-slate-300
              hover:bg-blue-50 dark:hover:bg-blue-500/[0.07] transition-colors disabled:opacity-50 text-left"
          >
            <span className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
              ${selected.includes(exam)
                ? 'bg-blue-600 border-blue-600 dark:bg-indigo-600 dark:border-indigo-600'
                : 'border-slate-300 dark:border-slate-600'}`}>
              {selected.includes(exam) && <Check className="w-2.5 h-2.5 text-white" />}
            </span>
            {exam}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ────────────────────────────────────────────────────────────

function DesktopTable({ students, selectedExams, finalExam, calcPct }) {
  const subjectCount = SUBJECTS.length

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse" style={{ minWidth: '900px' }}>
        <thead>
          {/* Exam group headers */}
          <tr className="bg-slate-800 dark:bg-[#0f1220]">
            <th rowSpan={2} className="px-3 py-2.5 text-center text-[11px] font-bold text-slate-300 uppercase tracking-wide border border-slate-700 w-10 sticky left-0 bg-slate-800 dark:bg-[#0f1220] z-10">
              #
            </th>
            <th rowSpan={2} className="px-3 py-2.5 text-left text-[11px] font-bold text-slate-300 uppercase tracking-wide border border-slate-700 min-w-[140px] sticky left-10 bg-slate-800 dark:bg-[#0f1220] z-10">
              Student Name
            </th>
            {selectedExams.map(exam => (
              <th
                key={exam}
                colSpan={subjectCount + 2}
                className="px-3 py-2 text-center text-[11px] font-bold text-white uppercase tracking-wider border border-slate-600"
                style={{ background: exam === finalExam ? 'rgba(99,102,241,0.7)' : 'rgba(15,23,42,0.8)' }}
              >
                {exam} {exam === finalExam && <span className="text-[9px] text-yellow-300 ml-1">★ FINAL</span>}
              </th>
            ))}
            <th colSpan={3} className="px-3 py-2 text-center text-[11px] font-bold text-yellow-300 uppercase tracking-wider border border-slate-600 bg-amber-900/40">
              Final Calc ({calcPct}%)
            </th>
          </tr>
          {/* Subject sub-headers */}
          <tr className="bg-slate-700 dark:bg-[#141929]">
            {selectedExams.map(exam =>
              [...SUBJECTS, 'Total', '%'].map(col => (
                <th
                  key={`${exam}-${col}`}
                  className="px-2 py-1.5 text-center text-[10px] font-semibold text-slate-300 border border-slate-600 whitespace-nowrap"
                >
                  {col === '%' ? <Percent className="w-3 h-3 mx-auto" /> : col.slice(0, 4)}
                </th>
              ))
            )}
            {['Marks', '%', 'Grade'].map(col => (
              <th key={`final-${col}`} className="px-2 py-1.5 text-center text-[10px] font-semibold text-amber-300 border border-slate-600 whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => {
            // Calculate final exam weighted marks
            const finalScores = student.examScores[finalExam] || {}
            const finalTotal = calcTotal(finalScores, SUBJECTS)
            const finalMax = SUBJECTS.length * MAX_PER_SUBJECT
            const finalPct = Math.round((finalTotal / finalMax) * 100)
            const calcMarks = Math.round((finalTotal * calcPct) / 100)
            const { grade, color: gradeColor, bg: gradeBg } = getGrade(finalPct)

            return (
              <tr
                key={student.roll}
                className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]
                  ${idx % 2 === 0 ? 'bg-white dark:bg-[#1a1f35]' : 'bg-slate-50/50 dark:bg-[#1c2140]'}
                  hover:bg-blue-50/40 dark:hover:bg-blue-500/[0.04] transition-colors`}
              >
                {/* Roll */}
                <td className="px-3 py-2 text-center text-[12px] text-slate-400 border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)] tabular-nums sticky left-0 bg-inherit z-10">
                  {student.roll}
                </td>
                {/* Name */}
                <td className="px-3 py-2 border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)] sticky left-10 bg-inherit z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {student.name.charAt(0)}
                    </span>
                    <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                      {student.name}
                    </span>
                  </div>
                </td>

                {/* Exam scores */}
                {selectedExams.map(exam => {
                  const scores = student.examScores[exam] || {}
                  const total = calcTotal(scores, SUBJECTS)
                  const max = SUBJECTS.length * MAX_PER_SUBJECT
                  const pct = Math.round((total / max) * 100)
                  const isFinal = exam === finalExam

                  return SUBJECTS.map(sub => (
                    <td
                      key={`${exam}-${sub}`}
                      className={`px-2 py-2 text-center text-[12px] tabular-nums border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)]
                        ${(scores[sub] ?? 0) < 33 ? 'text-rose-500 dark:text-rose-400 font-semibold' : 'text-slate-600 dark:text-slate-300'}`}
                    >
                      {scores[sub] ?? '-'}
                    </td>
                  )).concat([
                    <td key={`${exam}-total`} className={`px-2 py-2 text-center text-[12px] font-bold tabular-nums border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)] ${isFinal ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                      {total}
                    </td>,
                    <td key={`${exam}-pct`} className={`px-2 py-2 text-center border-r border-slate-200 dark:border-[rgba(99,102,241,0.15)]`}>
                      <span className={`inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-bold tabular-nums ${isFinal ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                        {pct}%
                      </span>
                    </td>,
                  ])
                })}

                {/* Final Calc */}
                <td className="px-2 py-2 text-center text-[12px] font-bold text-amber-700 dark:text-amber-300 tabular-nums border-r border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
                  {calcMarks}
                </td>
                <td className="px-2 py-2 text-center border-r border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
                    {finalPct}%
                  </span>
                </td>
                <td className="px-2 py-2 text-center">
                  <span className={`inline-flex items-center justify-center w-8 h-7 rounded-lg text-[12px] font-bold ${gradeColor} ${gradeBg}`}>
                    {grade}
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

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────

function MobileStudentCard({ student, selectedExams, finalExam, calcPct, rank }) {
  const [expanded, setExpanded] = useState(false)

  const finalScores = student.examScores[finalExam] || {}
  const finalTotal = calcTotal(finalScores, SUBJECTS)
  const finalMax = SUBJECTS.length * MAX_PER_SUBJECT
  const finalPct = Math.round((finalTotal / finalMax) * 100)
  const calcMarks = Math.round((finalTotal * calcPct) / 100)
  const { grade, color: gradeColor, bg: gradeBg } = getGrade(finalPct)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
          <span className="text-[14px] font-bold text-white">{student.name.charAt(0)}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{student.name}</p>
            {rank <= 3 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0
                ${rank === 1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
                  rank === 2 ? 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300' :
                  'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
                #{rank}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Roll: <span className="font-semibold text-slate-600 dark:text-slate-400">{student.roll}</span>
            &nbsp;·&nbsp;Sec {student.section}
          </p>
        </div>

        {/* Grade + percentage */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className={`inline-flex items-center justify-center w-9 h-8 rounded-lg text-[13px] font-bold ${gradeColor} ${gradeBg}`}>
            {grade}
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">{finalPct}%</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Quick stats bar */}
      <div className="px-4 pb-3 flex gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">Final Marks:</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{finalTotal}/{finalMax}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px]">
          <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
          <span className="text-slate-500 dark:text-slate-400">Calc ({calcPct}%):</span>
          <span className="font-bold text-amber-600 dark:text-amber-400 tabular-nums">{calcMarks}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              finalPct >= 75 ? 'bg-emerald-500' :
              finalPct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${finalPct}%` }}
          />
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-4 space-y-4">
          {selectedExams.map(exam => {
            const scores = student.examScores[exam] || {}
            const total = calcTotal(scores, SUBJECTS)
            const max = SUBJECTS.length * MAX_PER_SUBJECT
            const pct = Math.round((total / max) * 100)
            const isFinal = exam === finalExam
            const { grade: eg, color: ec } = getGrade(pct)

            return (
              <div key={exam} className={`rounded-xl p-3 border ${isFinal ? 'border-indigo-200 dark:border-indigo-500/30 bg-indigo-50/50 dark:bg-indigo-500/[0.05]' : 'border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.01]'}`}>
                <div className="flex items-center justify-between mb-2.5">
                  <p className={`text-[12px] font-bold uppercase tracking-wide ${isFinal ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'}`}>
                    {exam} {isFinal && <span className="text-yellow-500 ml-1">★</span>}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{total}/{max}</span>
                    <span className={`text-[11px] font-bold ${ec}`}>{eg} · {pct}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {SUBJECTS.map(sub => (
                    <div key={sub} className="rounded-lg bg-white dark:bg-[#1e2238] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-2 text-center">
                      <p className="text-[18px] font-bold tabular-nums text-slate-800 dark:text-slate-100 leading-tight">{scores[sub] ?? '-'}</p>
                      <p className="text-[9px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mt-0.5">{sub.slice(0, 4)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, state, setState, onShow, loading, errors, availableExams }) {
  if (!open) return null
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={state.session} onChange={e => setState(p => ({ ...p, session: e.target.value, selectedExams: [] }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={state.cls} onChange={e => setState(p => ({ ...p, cls: e.target.value }))} placeholder="-- Select Class --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Select Exam(s)" error={errors.selectedExams} required>
            <ExamMultiSelect
              options={availableExams}
              selected={state.selectedExams}
              onChange={v => setState(p => ({ ...p, selectedExams: v }))}
              disabled={!state.session}
              error={errors.selectedExams}
            />
          </Field>
          <Field label="Exam for Final Total" error={errors.finalExam} required>
            <NativeSelect value={state.finalExam} onChange={e => setState(p => ({ ...p, finalExam: e.target.value }))} placeholder="-- Select Exam --" error={errors.finalExam} disabled={state.selectedExams.length === 0}>
              {state.selectedExams.map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Calculation Percentage">
            <div className="relative">
              <input
                type="number"
                min="1" max="100"
                value={state.calcPct}
                onChange={e => setState(p => ({ ...p, calcPct: e.target.value }))}
                placeholder="e.g. 80"
                className="w-full pl-3 pr-8 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none
                  bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400 font-bold">%</span>
            </div>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors">
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

export default function ExamComparativeSheet() {
  const [state, setState] = useState({
    session: '',
    cls: '',
    selectedExams: [],
    finalExam: '',
    calcPct: '80',
  })
  const [students,    setStudents]    = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownState,  setShownState]  = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const availableExams = state.session ? (EXAMS_BY_SESSION[state.session] || []) : []

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!state.session)              err.session      = 'Select a session'
    if (!state.cls)                  err.cls          = 'Select a class'
    if (state.selectedExams.length === 0) err.selectedExams = 'Select at least one exam'
    if (!state.finalExam)            err.finalExam    = 'Select final exam'
    return err
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = generateStudents(state.cls, state.session)
      setStudents(data)
      setShownState({ ...state, calcPct: parseInt(state.calcPct) || 80 })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} students for ${state.cls} — ${state.session}`)
    }, 700)
  }, [state])

  const handleReset = () => {
    setState({ session: '', cls: '', selectedExams: [], finalExam: '', calcPct: '80' })
    setStudents([]); setSearch(''); setErrors({}); setShown(false); setShownState(null)
  }

  const handleExcel = () => {
    if (!shown) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      String(s.roll).includes(q) ||
      s.section.toLowerCase().includes(q)
    )
  }, [students, search])

  // ── Ranked (by final exam % desc) ─────────────────────────────────────────
  const ranked = useMemo(() => {
    if (!shownState) return filtered
    return [...filtered].sort((a, b) => {
      const aT = calcTotal(a.examScores[shownState.finalExam] || {}, SUBJECTS)
      const bT = calcTotal(b.examScores[shownState.finalExam] || {}, SUBJECTS)
      return bT - aT
    })
  }, [filtered, shownState])

  // ── Summary stats ─────────────────────────────────────────────────────────
  const summaryStats = useMemo(() => {
    if (!shownState || ranked.length === 0) return null
    const max = SUBJECTS.length * MAX_PER_SUBJECT
    const pcts = ranked.map(s => {
      const t = calcTotal(s.examScores[shownState.finalExam] || {}, SUBJECTS)
      return Math.round((t / max) * 100)
    })
    const avg = Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length)
    const passed = pcts.filter(p => p >= 33).length
    return {
      total: ranked.length,
      avg,
      passed,
      failed: ranked.length - passed,
      topScore: Math.max(...pcts),
    }
  }, [ranked, shownState])

  const hasResults = shown && students.length > 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-wrap">
        {['Home', 'Report', 'Exam Report', 'Comparative Sheet'].map((item, i, arr) => (
          <span key={item} className="flex items-center gap-1.5">
            <span className={i === arr.length - 1 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'hover:text-slate-600 cursor-pointer transition-colors'}>
              {item}
            </span>
            {i < arr.length - 1 && <ChevronRight className="w-3 h-3" />}
          </span>
        ))}
      </div>

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Exam Comparative Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Compare student performance across multiple exams with weighted final calculation.
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={state.session}
                onChange={e => { setState(p => ({ ...p, session: e.target.value, selectedExams: [], finalExam: '' })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={state.cls}
                onChange={e => { setState(p => ({ ...p, cls: e.target.value })); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.cls}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Multi-select Exam */}
            <Field label="Select Exam(s)" error={errors.selectedExams} required>
              <ExamMultiSelect
                options={availableExams}
                selected={state.selectedExams}
                onChange={v => { setState(p => ({ ...p, selectedExams: v })); setErrors(p => ({ ...p, selectedExams: undefined })) }}
                disabled={!state.session}
                error={errors.selectedExams}
              />
            </Field>

            {/* Final Exam */}
            <div className="space-y-1">
              <Field label="Exam for Final Total" error={errors.finalExam} required>
                <NativeSelect
                  value={state.finalExam}
                  onChange={e => { setState(p => ({ ...p, finalExam: e.target.value })); setErrors(p => ({ ...p, finalExam: undefined })) }}
                  placeholder="-- Select --"
                  error={errors.finalExam}
                  disabled={state.selectedExams.length === 0}
                >
                  {state.selectedExams.map(e => <option key={e} value={e}>{e}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Calc %">
                <div className="relative">
                  <input
                    type="number"
                    min="1" max="100"
                    value={state.calcPct}
                    onChange={e => setState(p => ({ ...p, calcPct: e.target.value }))}
                    placeholder="e.g. 80"
                    className="w-full pl-3 pr-7 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none
                      bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                      focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[12px] text-slate-400 font-bold">%</span>
                </div>
              </Field>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 items-end pb-0.5">
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
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {state.session && state.cls ? `${state.cls} · ${state.session}` : 'Select Filters'}
          {(state.session || state.cls) && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {[state.session, state.cls, state.finalExam].filter(Boolean).length}
            </span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        state={state}
        setState={setState}
        onShow={handleShow}
        loading={loading}
        errors={errors}
        availableExams={availableExams}
      />

      {/* ── Loading Skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && shownState && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={shownState.session}
            cls={shownState.cls}
            exams={shownState.selectedExams}
          />

          {/* Summary Cards */}
          {summaryStats && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <SummaryCard icon={User}        label="Total Students"  value={summaryStats.total}    color="blue" />
              <SummaryCard icon={TrendingUp}  label="Class Average"   value={`${summaryStats.avg}%`} color="violet" />
              <SummaryCard icon={Trophy}      label="Passed"          value={summaryStats.passed}   color="emerald" />
              <SummaryCard icon={AlertCircle} label="Failed"          value={summaryStats.failed}   color="rose" />
              <SummaryCard icon={Star}        label="Top Score"       value={`${summaryStats.topScore}%`} color="amber" />
            </div>
          )}

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 flex-wrap min-w-0">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Comparative Sheet</span>
                <span className="text-[13px] text-slate-400">· {shownState.cls}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name or roll…"
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
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Final Calc = {shownState.finalExam} marks × {shownState.calcPct}% · Sorted by final exam performance · Subjects: {SUBJECTS.join(', ')}
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block">
              {ranked.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <DesktopTable
                  students={ranked}
                  selectedExams={shownState.selectedExams}
                  finalExam={shownState.finalExam}
                  calcPct={shownState.calcPct}
                />
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {ranked.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a student card to see subject-wise breakdown per exam.
                  </p>
                  {ranked.map((student, i) => (
                    <MobileStudentCard
                      key={student.roll}
                      student={student}
                      selectedExams={shownState.selectedExams}
                      finalExam={shownState.finalExam}
                      calcPct={shownState.calcPct}
                      rank={i + 1}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{ranked.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span> students
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
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
            <GraduationCap className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session, class, exams and click <strong>Show</strong> to generate the comparative report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
