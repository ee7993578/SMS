/**
 * ReportCard.jsx
 * Folder: src/pages/Student/Reports/ReportCard.jsx
 *
 * Converts legacy ASPX "Report Card" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session, Class, Term, Student dropdowns with cascading logic
 *  - Date picker input
 *  - Submit to view report card preview
 *  - Export button
 *  - Desktop: ERP-style professional layout
 *  - Mobile: card-based stacked layout with drawer filters
 *  - Print-ready report card view
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, SlidersHorizontal, FileDown, Printer,
  GraduationCap, BookOpen, User, Calendar, School2,
  MapPin, Building2, Award, BarChart2, Star, TrendingUp,
  ClipboardList, ChevronRight, Info, CheckCircle2, XCircle,
  Minus, Hash, Trophy, Medal
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  phone: '+91-135-2710XXX',
  email: 'info@svmschool.edu.in',
  affiliation: 'CBSE Affiliation No. 2530XXX',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = {
  '2022-23': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
              'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
              'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
              'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
              'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

const TERMS = ['Term 1', 'Term 2', 'Annual']

const STUDENTS_BY_CLASS = {
  'Nursery': [{ id: 'N001', name: 'Aarav Sharma' }, { id: 'N002', name: 'Diya Patel' }],
  'LKG':     [{ id: 'L001', name: 'Rahul Gupta' }, { id: 'L002', name: 'Priya Singh' }],
  'UKG':     [{ id: 'U001', name: 'Amit Kumar' }, { id: 'U002', name: 'Sneha Rani' }],
  'Class I': [{ id: 'C1001', name: 'Rohit Verma' }, { id: 'C1002', name: 'Pooja Yadav' }, { id: 'C1003', name: 'Karan Mehta' }],
  'Class II':[{ id: 'C2001', name: 'Ananya Joshi' }, { id: 'C2002', name: 'Vikas Tiwari' }],
  'Class III':[{ id: 'C3001', name: 'Riya Kapoor' }, { id: 'C3002', name: 'Siddharth Nair' }],
  'Class IV': [{ id: 'C4001', name: 'Kavya Reddy' }, { id: 'C4002', name: 'Arjun Das' }],
  'Class V':  [{ id: 'C5001', name: 'Nisha Pandey' }, { id: 'C5002', name: 'Yash Bhatt' }],
  'Class VI': [{ id: 'C6001', name: 'Shreya Iyer' }, { id: 'C6002', name: 'Aditya Mishra' }],
  'Class VII':[{ id: 'C7001', name: 'Pallavi Jain' }, { id: 'C7002', name: 'Nikhil Srivastava' }],
  'Class VIII':[{ id: 'C8001', name: 'Tanvi Chopra' }, { id: 'C8002', name: 'Raj Dubey' }],
  'Class IX': [{ id: 'C9001', name: 'Meera Tripathi' }, { id: 'C9002', name: 'Sumit Aggarwal' }],
  'Class X':  [{ id: 'C10001', name: 'Deepika Saha' }, { id: 'C10002', name: 'Harsh Saxena' }, { id: 'C10003', name: 'Priya Malhotra' }],
  'Class XI': [{ id: 'C11001', name: 'Ravi Shukla' }, { id: 'C11002', name: 'Simran Bose' }],
  'Class XII':[{ id: 'C12001', name: 'Ankita Pillai' }, { id: 'C12002', name: 'Dev Chakraborty' }],
}

// Subject marks data generator
const generateMarks = (studentId, term) => {
  const seed = studentId.charCodeAt(studentId.length - 1)
  const subjects = [
    { name: 'English',       maxMarks: 100, passingMarks: 33 },
    { name: 'Hindi',         maxMarks: 100, passingMarks: 33 },
    { name: 'Mathematics',   maxMarks: 100, passingMarks: 33 },
    { name: 'Science',       maxMarks: 100, passingMarks: 33 },
    { name: 'Social Studies',maxMarks: 100, passingMarks: 33 },
    { name: 'Sanskrit',      maxMarks: 50,  passingMarks: 17 },
    { name: 'Computer',      maxMarks: 50,  passingMarks: 17 },
  ]
  const base = term === 'Term 1' ? 55 : term === 'Term 2' ? 62 : 70
  return subjects.map((sub, i) => {
    const obtained = Math.min(sub.maxMarks, Math.max(25, base + ((seed + i * 7) % 30) - 5))
    const grade = getGrade(obtained, sub.maxMarks)
    return { ...sub, marksObtained: obtained, grade, pass: obtained >= sub.passingMarks }
  })
}

const getGrade = (obtained, max) => {
  const pct = (obtained / max) * 100
  if (pct >= 91) return { grade: 'A1', gpa: 10, color: 'emerald' }
  if (pct >= 81) return { grade: 'A2', gpa: 9,  color: 'green'   }
  if (pct >= 71) return { grade: 'B1', gpa: 8,  color: 'blue'    }
  if (pct >= 61) return { grade: 'B2', gpa: 7,  color: 'indigo'  }
  if (pct >= 51) return { grade: 'C1', gpa: 6,  color: 'amber'   }
  if (pct >= 41) return { grade: 'C2', gpa: 5,  color: 'orange'  }
  if (pct >= 33) return { grade: 'D',  gpa: 4,  color: 'yellow'  }
  return               { grade: 'E',  gpa: 0,  color: 'red'     }
}

const getCoBehavior = () => [
  { attribute: 'Discipline',        value: 'A', remark: 'Excellent' },
  { attribute: 'Punctuality',       value: 'A', remark: 'Very Good' },
  { attribute: 'Cleanliness',       value: 'B', remark: 'Good'      },
  { attribute: 'Participation',     value: 'A', remark: 'Excellent' },
  { attribute: 'Homework',          value: 'B', remark: 'Good'      },
]

// ─── HELPERS ────────────────────────────────────────────────────────────────

const gradeColorMap = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  green:   'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  blue:    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  indigo:  'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20',
  amber:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  orange:  'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-500/10 dark:text-orange-400 dark:border-orange-500/20',
  yellow:  'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
  red:     'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20',
}

const formatDate = (d) => {
  if (!d) return ''
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  } catch { return d }
}

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 font-medium
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
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
    <div className="flex flex-col gap-1.5">
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SUMMARY STAT ────────────────────────────────────────────────────────────

function StatPill({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3.5 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── REPORT CARD COMPONENT ──────────────────────────────────────────────────

function ReportCardView({ data }) {
  const { student, className, session, term, marks, date } = data

  const totalMax = marks.reduce((s, m) => s + m.maxMarks, 0)
  const totalObt = marks.reduce((s, m) => s + m.marksObtained, 0)
  const percentage = ((totalObt / totalMax) * 100).toFixed(1)
  const overallGrade = getGrade(totalObt, totalMax)
  const allPass = marks.every(m => m.pass)
  const behavior = getCoBehavior()

  return (
    <div className="space-y-4">

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatPill icon={Hash}      label="Total Marks"   value={`${totalObt}/${totalMax}`} color="blue"    />
        <StatPill icon={BarChart2} label="Percentage"    value={`${percentage}%`}          color="violet"  />
        <StatPill icon={Award}     label="Overall Grade" value={overallGrade.grade}         color="emerald" />
        <StatPill icon={Trophy}    label="Result"        value={allPass ? 'PASS' : 'FAIL'}  color={allPass ? 'emerald' : 'rose'} />
      </div>

      {/* Report card panel */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* School header */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 dark:from-indigo-800 dark:via-indigo-900 dark:to-blue-900 px-6 py-5 text-white text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <School2 className="w-5 h-5 opacity-80" />
            <h2 className="text-[15px] sm:text-[17px] font-extrabold tracking-tight leading-snug">
              {SCHOOL_INFO.name}
            </h2>
          </div>
          <p className="text-[11px] opacity-75 mb-3 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />{SCHOOL_INFO.address}
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/25">
            <span className="text-[13px] font-bold tracking-wide">PROGRESS REPORT CARD</span>
          </div>
          <div className="mt-2 text-[11px] opacity-70">{SCHOOL_INFO.affiliation}</div>
        </div>

        {/* Student info strip */}
        <div className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-100 dark:divide-[rgba(99,102,241,0.1)]">
            {[
              { label: 'Student Name', value: student.name, icon: User },
              { label: 'Class',        value: className,    icon: GraduationCap },
              { label: 'Term',         value: term,         icon: BookOpen },
              { label: 'Session',      value: session,      icon: Calendar },
            ].map((item, i) => (
              <div key={i} className="px-4 py-3 flex items-center gap-2.5">
                <item.icon className="w-4 h-4 text-blue-500 dark:text-indigo-400 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{item.label}</p>
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-200 truncate">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
          {date && (
            <div className="px-4 py-2 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] text-[11px] text-slate-500 dark:text-slate-400 text-right">
              Date of Issue: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(date)}</span>
            </div>
          )}
        </div>

        {/* DESKTOP: Full table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-white/[0.03] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                {['S.No.', 'Subject', 'Max Marks', 'Marks Obtained', 'Grade', 'Status'].map((h, i) => (
                  <th key={i} className="px-5 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-left">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {marks.map((m, i) => (
                <tr key={i} className="border-b border-slate-50 dark:border-[rgba(99,102,241,0.06)] hover:bg-slate-50/60 dark:hover:bg-white/[0.015] transition-colors">
                  <td className="px-5 py-3.5 text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{i + 1}</td>
                  <td className="px-5 py-3.5">
                    <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{m.name}</span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-slate-600 dark:text-slate-400 tabular-nums">{m.maxMarks}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{m.marksObtained}</span>
                      {/* progress bar */}
                      <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden max-w-[80px]">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${m.pass ? 'bg-emerald-500' : 'bg-rose-500'}`}
                          style={{ width: `${(m.marksObtained / m.maxMarks) * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold border ${gradeColorMap[m.grade.color]}`}>
                      {m.grade.grade}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    {m.pass
                      ? <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400"><CheckCircle2 className="w-4 h-4" /> Pass</span>
                      : <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-rose-600 dark:text-rose-400"><XCircle className="w-4 h-4" /> Fail</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Total row */}
            <tfoot>
              <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                <td className="px-5 py-4" colSpan={2}>
                  <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" /> Grand Total
                  </span>
                </td>
                <td className="px-5 py-4 text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totalMax}</td>
                <td className="px-5 py-4 text-[15px] font-extrabold text-blue-800 dark:text-blue-200 tabular-nums">{totalObt}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[12px] font-bold border ${gradeColorMap[overallGrade.color]}`}>
                    {overallGrade.grade}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 text-[13px] font-bold ${allPass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {allPass ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    {allPass ? 'PASS' : 'FAIL'}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* MOBILE: Subject Cards */}
        <div className="md:hidden p-4 space-y-3">
          {marks.map((m, i) => (
            <MobileSubjectCard key={i} subject={m} idx={i + 1} />
          ))}
          {/* Mobile grand total */}
          <div className="rounded-2xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
            <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Grand Total
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/70 dark:bg-white/5 p-3 text-center">
                <p className="text-[22px] font-extrabold text-blue-700 dark:text-blue-300 tabular-nums">{totalObt}</p>
                <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Marks Obtained</p>
              </div>
              <div className="rounded-xl bg-white/70 dark:bg-white/5 p-3 text-center">
                <p className="text-[22px] font-extrabold text-slate-600 dark:text-slate-300 tabular-nums">{percentage}%</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Percentage</p>
              </div>
              <div className="rounded-xl bg-white/70 dark:bg-white/5 p-3 text-center">
                <p className={`text-[22px] font-extrabold tabular-nums ${gradeColorMap[overallGrade.color].split(' ')[1]}`}>{overallGrade.grade}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Overall Grade</p>
              </div>
            </div>
            {/* Percentage bar */}
            <div className="mt-3">
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ${allPass ? 'bg-emerald-500' : 'bg-rose-500'}`}
                  style={{ width: `${percentage}%` }} />
              </div>
              <p className={`text-[11px] font-semibold mt-1 text-right ${allPass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                Result: {allPass ? 'PASS' : 'FAIL'}
              </p>
            </div>
          </div>
        </div>

        {/* Co-Scholastic Behavior */}
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-5 py-4">
          <p className="text-[12px] font-bold uppercase tracking-wide text-slate-600 dark:text-slate-300 mb-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-amber-500" /> Co-Scholastic Activities
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {behavior.map((b, i) => (
              <div key={i} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02] p-3 text-center">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 mb-1">{b.attribute}</p>
                <p className="text-[18px] font-extrabold text-blue-600 dark:text-blue-400">{b.value}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">{b.remark}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Grade legend */}
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.01] px-5 py-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Grade Scale</p>
          <div className="flex flex-wrap gap-2">
            {[
              { g: 'A1', r: '91-100', c: 'emerald' }, { g: 'A2', r: '81-90', c: 'green' },
              { g: 'B1', r: '71-80', c: 'blue' },     { g: 'B2', r: '61-70', c: 'indigo' },
              { g: 'C1', r: '51-60', c: 'amber' },    { g: 'C2', r: '41-50', c: 'orange' },
              { g: 'D',  r: '33-40', c: 'yellow' },   { g: 'E',  r: 'Below 33', c: 'red' },
            ].map((item) => (
              <span key={item.g} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-bold ${gradeColorMap[item.c]}`}>
                {item.g}: {item.r}
              </span>
            ))}
          </div>
        </div>

        {/* Signatures footer */}
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-5 py-4 grid grid-cols-3 gap-4 text-center">
          {['Class Teacher', 'Principal', "Parent's Signature"].map((sig) => (
            <div key={sig}>
              <div className="h-8 border-b border-slate-300 dark:border-slate-600 mb-1" />
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">{sig}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE SUBJECT CARD ────────────────────────────────────────────────────

function MobileSubjectCard({ subject: m, idx }) {
  const [expanded, setExpanded] = useState(false)
  const pct = Math.round((m.marksObtained / m.maxMarks) * 100)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[11px] font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
          {idx}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{m.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {m.marksObtained} / {m.maxMarks} · {pct}%
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2.5 py-1 rounded-lg text-[12px] font-bold border ${gradeColorMap[m.grade.color]}`}>{m.grade.grade}</span>
          {m.pass
            ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            : <XCircle className="w-4 h-4 text-rose-500" />}
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>
      {/* Mini progress bar always visible */}
      <div className="px-4 pb-3 pt-0">
        <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className={`h-full rounded-full transition-all duration-700 ${m.pass ? 'bg-emerald-500' : 'bg-rose-500'}`}
            style={{ width: `${pct}%` }} />
        </div>
      </div>
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <p className="text-[20px] font-extrabold text-blue-700 dark:text-blue-300 tabular-nums">{m.maxMarks}</p>
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide mt-0.5">Max</p>
            </div>
            <div className={`rounded-xl border p-3 text-center ${m.pass ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20' : 'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20'}`}>
              <p className={`text-[20px] font-extrabold tabular-nums ${m.pass ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>{m.marksObtained}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${m.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>Obtained</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-3 text-center">
              <p className="text-[20px] font-extrabold text-slate-700 dark:text-slate-300 tabular-nums">{pct}%</p>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mt-0.5">Score</p>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={`inline-flex items-center gap-1.5 text-[12px] font-semibold ${m.pass ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {m.pass ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {m.pass ? 'Pass' : `Fail (Min: ${m.passingMarks})`}
            </span>
            <span className={`px-3 py-1 rounded-xl text-[12px] font-bold border ${gradeColorMap[m.grade.color]}`}>
              Grade: {m.grade.grade} (GPA {m.grade.gpa})
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, form, setForm, onSubmit, loading, errors, sessions, classes, students }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .28s ease', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Report Card Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={form.session} onChange={e => setForm(p => ({ ...p, session: e.target.value, cls: '', term: '', student: '' }))} placeholder="-- Select Session --" error={errors.session}>
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={form.cls} onChange={e => setForm(p => ({ ...p, cls: e.target.value, student: '' }))} placeholder="-- Select Class --" error={errors.cls} disabled={!form.session}>
              {(classes[form.session] || []).map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={form.term} onChange={e => setForm(p => ({ ...p, term: e.target.value }))} placeholder="-- Select Term --" error={errors.term} disabled={!form.cls}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Student">
            <NativeSelect value={form.student} onChange={e => setForm(p => ({ ...p, student: e.target.value }))} placeholder="-- All Students --" disabled={!form.cls}>
              {(students[form.cls] || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Issue Date">
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={form.date}
                onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none transition-all
                  bg-white text-slate-800 font-medium dark:bg-[#1e2238] dark:text-slate-200
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
              />
            </div>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-2xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all active:scale-95">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ReportCard() {
  const [form, setForm] = useState({ session: '', cls: '', term: '', student: '', date: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [reportData, setReportData] = useState(null)
  const [toast, setToast] = useState(null)
  const reportRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Validate form
  const validate = () => {
    const err = {}
    if (!form.session) err.session = 'Please select a session'
    if (!form.cls)     err.cls     = 'Please select a class'
    if (!form.term)    err.term    = 'Please select a term'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // Submit — simulate API
  const handleSubmit = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setReportData(null)

    setTimeout(() => {
      const students = STUDENTS_BY_CLASS[form.cls] || []
      let student = students[0]
      if (form.student) student = students.find(s => s.id === form.student) || students[0]
      const marks = generateMarks(student?.id || 'S001', form.term)
      setReportData({ student, className: form.cls, session: form.session, term: form.term, marks, date: form.date })
      setLoading(false)
      showToast(`Report card loaded for ${student?.name || 'student'}.`)
    }, 750)
  }, [form])

  const handleReset = () => {
    setForm({ session: '', cls: '', term: '', student: '', date: '' })
    setErrors({})
    setReportData(null)
  }

  const handleExport = () => {
    if (!reportData) { showToast('Show report first before exporting.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Export ready! (API integration pending)')
    }, 1200)
  }

  const handlePrint = () => {
    window.print()
  }

  const activeFiltersCount = [form.session, form.cls, form.term].filter(Boolean).length

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[21px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-indigo-500/15 flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            </span>
            Report Card
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 ml-11">
            Session &amp; exam-wise student progress report generation.
          </p>
        </div>

        {/* Desktop action buttons */}
        {reportData && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button type="button" onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-all active:scale-95">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button type="button" onClick={handleExport} disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Export
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3" /> All fields marked * are required
          </span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={form.session}
                onChange={e => { setForm(p => ({ ...p, session: e.target.value, cls: '', term: '', student: '' })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={form.cls}
                onChange={e => { setForm(p => ({ ...p, cls: e.target.value, student: '' })); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.cls}
                disabled={!form.session}
              >
                {(CLASSES[form.session] || []).map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Term */}
            <Field label="Term" error={errors.term} required>
              <NativeSelect
                value={form.term}
                onChange={e => { setForm(p => ({ ...p, term: e.target.value })); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select Term --"
                error={errors.term}
                disabled={!form.cls}
              >
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            {/* Student */}
            <Field label="Student (Optional)">
              <NativeSelect
                value={form.student}
                onChange={e => setForm(p => ({ ...p, student: e.target.value }))}
                placeholder="-- All Students --"
                disabled={!form.cls}
              >
                {(STUDENTS_BY_CLASS[form.cls] || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Date */}
            <Field label="Issue Date">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={form.date}
                  onChange={e => setForm(p => ({ ...p, date: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none transition-all
                    bg-white text-slate-800 font-medium dark:bg-[#1e2238] dark:text-slate-200
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
                />
              </div>
            </Field>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report Card
            </button>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="sm:hidden space-y-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20 active:scale-95 transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFiltersCount > 0
            ? `Filters Applied (${activeFiltersCount}/3 required)`
            : 'Set Filters & Select Session'}
          {activeFiltersCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFiltersCount}</span>
          )}
        </button>

        {/* Selected filter chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 px-1">
            {form.session && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                <Calendar className="w-3 h-3" /> {form.session}
              </span>
            )}
            {form.cls && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-[11px] font-semibold text-violet-700 dark:text-violet-400">
                <GraduationCap className="w-3 h-3" /> {form.cls}
              </span>
            )}
            {form.term && (
              <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                <BookOpen className="w-3 h-3" /> {form.term}
              </span>
            )}
            <button onClick={handleReset} className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:bg-slate-200 transition-colors">
              <X className="w-3 h-3" /> Clear
            </button>
          </div>
        )}

        {/* Mobile action buttons */}
        {reportData && (
          <div className="flex gap-2">
            <button type="button" onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 transition-all">
              <Printer className="w-4 h-4" /> Print
            </button>
            <button type="button" onClick={handleExport} disabled={exporting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-all">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Export
            </button>
          </div>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors}
        sessions={SESSIONS}
        classes={CLASSES}
        students={STUDENTS_BY_CLASS}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
          <div className="h-28 bg-gradient-to-r from-blue-200/60 via-blue-100/40 to-indigo-200/60 dark:from-indigo-900/60 dark:to-blue-900/40 animate-pulse" />
          <div className="p-5 space-y-3">
            <div className="grid grid-cols-4 gap-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
              ))}
            </div>
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Report Card Results ──────────────────────────────────────────── */}
      {reportData && !loading && (
        <div ref={reportRef}>
          <ReportCardView data={reportData} />
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!reportData && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-slate-400 dark:text-slate-600">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 flex items-center justify-center shadow-sm">
            <ClipboardList className="w-9 h-9 text-blue-400 dark:text-indigo-400 opacity-70" />
          </div>
          <div className="text-center space-y-1.5 max-w-xs">
            <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400">No Report Generated Yet</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 leading-relaxed">
              Select session, class, and term, then tap <strong>Show Report Card</strong> to view student progress.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-center text-[12px]">
            {['Select Session', 'Select Class', 'Select Term', 'Show Report'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                  <span className="w-4 h-4 rounded-full bg-blue-500 dark:bg-indigo-500 text-white text-[9px] flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </span>
                {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          [data-print], [data-print] * { visibility: visible; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  )
}
