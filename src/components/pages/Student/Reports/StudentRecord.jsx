/**
 * StudentRecord.jsx
 * Folder: src/pages/Student/Reports/StudentRecord.jsx
 *
 * Converts legacy ASPX "Report Card / Student Record" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session dropdown → Class dropdown (cascaded) → Student dropdown (cascaded)
 *  - Submit button to "generate" the report card
 *  - Printable report card view (marks, attendance, remarks)
 *  - Mobile: fully stacked, card-based, touch-friendly
 *  - Desktop: professional ERP-style layout
 */

import { useState, useMemo, useCallback } from 'react'
import {
  ChevronDown, AlertCircle, X, Check, Loader2,
  RefreshCw, Eye, Printer, Download,
  User, BookOpen, BarChart3, ClipboardList,
  GraduationCap, Calendar, Award, TrendingUp,
  Home, ChevronRight, Star, Medal, FileText,
  School2, MapPin, Building2, Info, Shield,
  CheckCircle2, XCircle, MinusCircle
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  phone: '+91-135-2654321',
  email: 'info@svmdehradun.edu.in',
  affiliation: 'CBSE Affiliation No. 050123',
}

// Classes per session (same across all sessions for demo)
const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

// Dummy students per class
const STUDENTS_BY_CLASS = {
  'Nursery':    [{ id: 1, name: 'Aarav Sharma', roll: 'NUR/A/001' }, { id: 2, name: 'Priya Verma', roll: 'NUR/A/002' }, { id: 3, name: 'Rohit Kumar', roll: 'NUR/A/003' }],
  'LKG':        [{ id: 4, name: 'Ananya Singh', roll: 'LKG/A/001' }, { id: 5, name: 'Dev Patel', roll: 'LKG/A/002' }],
  'UKG':        [{ id: 6, name: 'Ishaan Gupta', roll: 'UKG/A/001' }, { id: 7, name: 'Neha Joshi', roll: 'UKG/A/002' }],
  'Class I':    [{ id: 8, name: 'Arjun Tiwari', roll: 'I/A/001' }, { id: 9, name: 'Kavya Mishra', roll: 'I/A/002' }, { id: 10, name: 'Siddharth Rao', roll: 'I/A/003' }],
  'Class II':   [{ id: 11, name: 'Aditya Chauhan', roll: 'II/A/001' }, { id: 12, name: 'Pooja Yadav', roll: 'II/A/002' }],
  'Class III':  [{ id: 13, name: 'Vivek Pandey', roll: 'III/A/001' }, { id: 14, name: 'Sneha Nair', roll: 'III/A/002' }],
  'Class IV':   [{ id: 15, name: 'Rahul Dubey', roll: 'IV/A/001' }, { id: 16, name: 'Anjali Saxena', roll: 'IV/A/002' }],
  'Class V':    [{ id: 17, name: 'Nikhil Srivastava', roll: 'V/A/001' }, { id: 18, name: 'Divya Aggarwal', roll: 'V/A/002' }],
  'Class VI':   [{ id: 19, name: 'Kartik Bansal', roll: 'VI/A/001' }, { id: 20, name: 'Riya Kapoor', roll: 'VI/A/002' }, { id: 21, name: 'Mohit Goel', roll: 'VI/A/003' }],
  'Class VII':  [{ id: 22, name: 'Akash Thakur', roll: 'VII/A/001' }, { id: 23, name: 'Simran Kaur', roll: 'VII/A/002' }],
  'Class VIII': [{ id: 24, name: 'Yash Mehta', roll: 'VIII/A/001' }, { id: 25, name: 'Pallavi Jain', roll: 'VIII/A/002' }],
  'Class IX':   [{ id: 26, name: 'Shreyas Reddy', roll: 'IX/A/001' }, { id: 27, name: 'Tanvi Bhatt', roll: 'IX/A/002' }, { id: 28, name: 'Kunal Malhotra', roll: 'IX/A/003' }],
  'Class X':    [{ id: 29, name: 'Ankit Sharma', roll: 'X/A/001' }, { id: 30, name: 'Megha Agrawal', roll: 'X/A/002' }],
  'Class XI':   [{ id: 31, name: 'Varun Khanna', roll: 'XI/A/001' }, { id: 32, name: 'Nidhi Soni', roll: 'XI/A/002' }],
  'Class XII':  [{ id: 33, name: 'Sanjay Tripathi', roll: 'XII/A/001' }, { id: 34, name: 'Deepika Singh', roll: 'XII/A/002' }],
}

// Report data generator (deterministic per student id)
const generateReportData = (studentId, cls, session) => {
  const seed = studentId * 7 + cls.length * 3
  const rand = (min, max, offset = 0) => min + ((seed * 13 + offset * 17) % (max - min + 1))

  // Subjects differ by class level
  const isPrePrimary = ['Nursery', 'LKG', 'UKG'].includes(cls)
  const isSecondary  = ['Class IX', 'Class X', 'Class XI', 'Class XII'].includes(cls)

  const subjects = isPrePrimary
    ? ['English', 'Hindi', 'Maths', 'EVS', 'Drawing']
    : isSecondary
    ? ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Computer']
    : ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies', 'Sanskrit']

  const maxMarks = isPrePrimary ? 50 : 100
  const marksData = subjects.map((sub, i) => {
    const theory  = rand(Math.floor(maxMarks * 0.5), maxMarks, i)
    const practical = isSecondary && ['Science', 'Computer'].includes(sub) ? rand(15, 25, i + 5) : 0
    const total   = theory + practical
    const max     = maxMarks + (practical > 0 ? 25 : 0)
    const pct     = Math.round((total / max) * 100)
    return { subject: sub, theory, practical, total, max, pct, grade: gradeFromPct(pct) }
  })

  const totalMarks    = marksData.reduce((s, r) => s + r.total, 0)
  const totalMaxMarks = marksData.reduce((s, r) => s + r.max, 0)
  const overallPct    = Math.round((totalMarks / totalMaxMarks) * 100)

  const totalDays    = 220
  const present      = rand(180, 215, 1)
  const absent       = totalDays - present
  const attPct       = Math.round((present / totalDays) * 100)

  return {
    session,
    class: cls,
    section: 'A',
    rollNo: `${cls.replace('Class ', '').slice(0, 3).toUpperCase()}/A/00${studentId % 9 + 1}`,
    overallPct,
    overallGrade: gradeFromPct(overallPct),
    rank: rand(1, 15, 99),
    totalStudents: rand(40, 62, 88),
    result: overallPct >= 33 ? 'PASS' : 'FAIL',
    attendance: { totalDays, present, absent, attPct },
    subjects: marksData,
    remarks: remarkFromPct(overallPct),
    conduct: ['Excellent', 'Very Good', 'Good'][(seed % 3)],
    coScholastic: [
      { area: 'Work Education',      grade: ['A', 'B', 'C'][seed % 3] },
      { area: 'Art Education',       grade: ['A', 'B', 'C'][(seed + 1) % 3] },
      { area: 'Health & P.E.',       grade: ['A', 'B', 'C'][(seed + 2) % 3] },
      { area: 'Discipline',          grade: ['A', 'B', 'C'][(seed + 3) % 3] },
    ],
  }
}

function gradeFromPct(pct) {
  if (pct >= 91) return 'A1'
  if (pct >= 81) return 'A2'
  if (pct >= 71) return 'B1'
  if (pct >= 61) return 'B2'
  if (pct >= 51) return 'C1'
  if (pct >= 41) return 'C2'
  if (pct >= 33) return 'D'
  return 'E'
}

function remarkFromPct(pct) {
  if (pct >= 91) return 'Outstanding performance. Keep it up!'
  if (pct >= 81) return 'Excellent work. Continue the great effort.'
  if (pct >= 71) return 'Very good. Aim higher next time.'
  if (pct >= 61) return 'Good performance. Consistent improvement needed.'
  if (pct >= 51) return 'Average. More focus and hard work required.'
  if (pct >= 33) return 'Below average. Must work harder in all subjects.'
  return 'Needs significant improvement. Extra coaching recommended.'
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const gradeColor = (g) => {
  const map = {
    A1: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/25' },
    A2: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/25' },
    B1: { bg: 'bg-blue-50 dark:bg-blue-500/10',       text: 'text-blue-700 dark:text-blue-400',       border: 'border-blue-200 dark:border-blue-500/25' },
    B2: { bg: 'bg-blue-50 dark:bg-blue-500/10',       text: 'text-blue-700 dark:text-blue-400',       border: 'border-blue-200 dark:border-blue-500/25' },
    C1: { bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-400',     border: 'border-amber-200 dark:border-amber-500/25' },
    C2: { bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-400',     border: 'border-amber-200 dark:border-amber-500/25' },
    D:  { bg: 'bg-orange-50 dark:bg-orange-500/10',   text: 'text-orange-700 dark:text-orange-400',   border: 'border-orange-200 dark:border-orange-500/25' },
    E:  { bg: 'bg-rose-50 dark:bg-rose-500/10',       text: 'text-rose-700 dark:text-rose-400',       border: 'border-rose-200 dark:border-rose-500/25' },
  }
  return map[g] || map.C1
}

const pctBarColor = (pct) => {
  if (pct >= 75) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-blue-500'
  if (pct >= 33) return 'bg-amber-500'
  return 'bg-rose-500'
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

// ─── BREADCRUMB ──────────────────────────────────────────────────────────────
function Breadcrumb({ items }) {
  return (
    <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 mb-1 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          <span className={i === items.length - 1 ? 'text-slate-600 dark:text-slate-300 font-semibold' : 'hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer'}>
            {item}
          </span>
        </span>
      ))}
    </nav>
  )
}

// ─── SCHOOL HEADER FOR REPORT ────────────────────────────────────────────────
function SchoolHeader({ studentName, cls, section, rollNo, session }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* School Logo Placeholder */}
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/15 border-2 border-blue-200 dark:border-blue-500/30 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
          <School2 className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>

        {/* School Info */}
        <div className="flex-1 text-center sm:text-left">
          <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
            {SCHOOL_INFO.name}
          </h2>
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{SCHOOL_INFO.address}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-3 mt-1 text-[11px] text-slate-400 dark:text-slate-500 flex-wrap">
            <span>{SCHOOL_INFO.phone}</span>
            <span>·</span>
            <span>{SCHOOL_INFO.email}</span>
            <span>·</span>
            <span>{SCHOOL_INFO.affiliation}</span>
          </div>
        </div>

        {/* Session badge */}
        <div className="flex flex-col items-center sm:items-end gap-1.5 flex-shrink-0">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
            <Calendar className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
            Report Card
          </p>
        </div>
      </div>

      {/* Student Info Strip */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Student Name', value: studentName, icon: User },
          { label: 'Class & Section', value: `${cls} – Sec ${section}`, icon: GraduationCap },
          { label: 'Roll Number', value: rollNo, icon: ClipboardList },
          { label: 'Academic Session', value: session, icon: Calendar },
        ].map(({ label, value, icon: Icon }, i) => (
          <div key={i} className="rounded-xl bg-white/70 dark:bg-white/5 border border-slate-200 dark:border-[rgba(99,102,241,0.15)] px-3 py-2.5">
            <div className="flex items-center gap-1.5 mb-1">
              <Icon className="w-3 h-3 text-blue-500 dark:text-blue-400" />
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
            </div>
            <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-tight">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── RESULT BANNER ────────────────────────────────────────────────────────────
function ResultBanner({ report }) {
  const pass = report.result === 'PASS'
  return (
    <div className={`rounded-2xl border-2 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-4
      ${pass
        ? 'bg-emerald-50 dark:bg-emerald-500/[0.07] border-emerald-200 dark:border-emerald-500/30'
        : 'bg-rose-50 dark:bg-rose-500/[0.07] border-rose-200 dark:border-rose-500/30'
      }`}>
      {/* Result Badge */}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0
        ${pass ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-rose-100 dark:bg-rose-500/20'}`}>
        {pass
          ? <Medal className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          : <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />}
      </div>

      {/* Stats */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        {[
          { label: 'Result',        value: report.result,           color: pass ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400' },
          { label: 'Percentage',    value: `${report.overallPct}%`, color: 'text-slate-800 dark:text-slate-100' },
          { label: 'Overall Grade', value: report.overallGrade,     color: 'text-blue-700 dark:text-blue-400' },
          { label: 'Class Rank',    value: `${report.rank} / ${report.totalStudents}`, color: 'text-violet-700 dark:text-violet-400' },
        ].map(({ label, value, color }, i) => (
          <div key={i}>
            <p className={`text-[22px] sm:text-[24px] font-black tabular-nums leading-tight ${color}`}>{value}</p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Remarks */}
      <div className="sm:max-w-[200px] text-center sm:text-right">
        <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Teacher's Remarks</p>
        <p className={`text-[12px] font-semibold italic leading-snug
          ${pass ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}`}>
          "{report.remarks}"
        </p>
      </div>
    </div>
  )
}

// ─── MARKS TABLE (Desktop) ───────────────────────────────────────────────────
function MarksTable({ subjects }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
            {['Subject', 'Theory', 'Practical', 'Total', 'Max', 'Percentage', 'Grade', 'Performance'].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subjects.map((row, i) => {
            const gc = gradeColor(row.grade)
            return (
              <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </span>
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.subject}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{row.theory}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
                    {row.practical > 0 ? row.practical : '—'}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{row.total}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{row.max}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[13px] font-bold tabular-nums text-slate-700 dark:text-slate-200">{row.pct}%</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl text-[12px] font-black border ${gc.bg} ${gc.text} ${gc.border}`}>
                    {row.grade}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 min-w-[100px]">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${pctBarColor(row.pct)}`}
                        style={{ width: `${row.pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-semibold text-slate-400 w-8 text-right tabular-nums">{row.pct}%</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── MARKS CARD (Mobile) ─────────────────────────────────────────────────────
function MarksCard({ row }) {
  const gc = gradeColor(row.grade)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{row.subject}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div
                className={`h-full rounded-full ${pctBarColor(row.pct)}`}
                style={{ width: `${row.pct}%` }}
              />
            </div>
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">{row.pct}%</span>
          </div>
        </div>
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-black border flex-shrink-0 ${gc.bg} ${gc.text} ${gc.border}`}>
          {row.grade}
        </span>
      </div>
      <div className="grid grid-cols-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
        {[
          { label: 'Theory', value: row.theory },
          { label: 'Practical', value: row.practical > 0 ? row.practical : '—' },
          { label: `${row.total}/${row.max}`, value: null, isTotal: true },
        ].map((item, i) => (
          <div key={i} className={`px-3 py-2 text-center ${i < 2 ? 'border-r border-slate-100 dark:border-[rgba(99,102,241,0.08)]' : ''}`}>
            <p className={`tabular-nums font-bold leading-tight ${item.isTotal ? 'text-[15px] text-blue-700 dark:text-blue-400' : 'text-[14px] text-slate-700 dark:text-slate-200'}`}>
              {item.isTotal ? item.label : item.value}
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mt-0.5">
              {item.isTotal ? 'Total / Max' : item.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── ATTENDANCE CARD ──────────────────────────────────────────────────────────
function AttendanceCard({ att }) {
  const pct = att.attPct
  const color = pct >= 75 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 65 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'
  const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 65 ? 'bg-amber-500' : 'bg-rose-500'
  const status = pct >= 75 ? 'Satisfactory' : pct >= 65 ? 'Needs Improvement' : 'Poor Attendance'
  const statusIcon = pct >= 75 ? CheckCircle2 : pct >= 65 ? MinusCircle : XCircle
  const StatusIcon = statusIcon

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Attendance Summary</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          {[
            { label: 'Total Days',   value: att.totalDays, color: 'text-slate-700 dark:text-slate-200' },
            { label: 'Days Present', value: att.present,   color: 'text-emerald-700 dark:text-emerald-400' },
            { label: 'Days Absent',  value: att.absent,    color: 'text-rose-700 dark:text-rose-400' },
            { label: 'Attendance %', value: `${pct}%`,     color },
          ].map(({ label, value, color: c }, i) => (
            <div key={i} className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 text-center">
              <p className={`text-[24px] font-black tabular-nums leading-tight ${c}`}>{value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
        {/* Bar */}
        <div>
          <div className="flex items-center justify-between text-[11px] font-semibold mb-1.5">
            <span className="text-slate-500 dark:text-slate-400">Attendance Rate</span>
            <div className={`flex items-center gap-1 ${color}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{status}</span>
            </div>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div className={`h-full rounded-full transition-all duration-700 ${barColor}`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5">
            Minimum 75% attendance required for eligibility in examinations.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── CO-SCHOLASTIC CARD ───────────────────────────────────────────────────────
function CoScholasticCard({ items, conduct }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
        <Star className="w-4 h-4 text-violet-600 dark:text-violet-400" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Co-Scholastic Activities</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {items.map(({ area, grade }, i) => {
            const gc = gradeColor(grade)
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-3 py-2.5 bg-slate-50/50 dark:bg-white/[0.02]">
                <span className={`w-9 h-9 rounded-lg flex items-center justify-center text-[13px] font-black border flex-shrink-0 ${gc.bg} ${gc.text} ${gc.border}`}>
                  {grade}
                </span>
                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{area}</p>
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-4 py-3">
          <Shield className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">Conduct & Behaviour</p>
            <p className="text-[14px] font-black text-amber-700 dark:text-amber-300">{conduct}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── GRADE LEGEND ─────────────────────────────────────────────────────────────
function GradeLegend() {
  const grades = [
    { g: 'A1', range: '91–100', label: 'Outstanding' },
    { g: 'A2', range: '81–90',  label: 'Excellent'   },
    { g: 'B1', range: '71–80',  label: 'Very Good'   },
    { g: 'B2', range: '61–70',  label: 'Good'        },
    { g: 'C1', range: '51–60',  label: 'Average'     },
    { g: 'C2', range: '41–50',  label: 'Satisfactory'},
    { g: 'D',  range: '33–40',  label: 'Needs Effort'},
    { g: 'E',  range: '< 33',   label: 'Fail'        },
  ]
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-amber-500 flex-shrink-0" />
        <Info className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Grade Scale</span>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {grades.map(({ g, range, label }) => {
            const gc = gradeColor(g)
            return (
              <div key={g} className={`rounded-xl border px-3 py-2 flex items-center gap-2 ${gc.bg} ${gc.border}`}>
                <span className={`text-[16px] font-black flex-shrink-0 ${gc.text}`}>{g}</span>
                <div>
                  <p className={`text-[10px] font-bold ${gc.text}`}>{range}%</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{label}</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StudentRecord() {
  const [session,    setSession]    = useState('')
  const [cls,        setCls]        = useState('')
  const [studentId,  setStudentId]  = useState('')
  const [report,     setReport]     = useState(null)
  const [student,    setStudent]    = useState(null)
  const [loading,    setLoading]    = useState(false)
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [activeTab,  setActiveTab]  = useState('marks') // marks | attendance | coscholastic

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Cascaded students list
  const students = useMemo(() => {
    if (!cls) return []
    return STUDENTS_BY_CLASS[cls] || []
  }, [cls])

  // Handle session change → reset below
  const handleSessionChange = (val) => {
    setSession(val)
    setCls('')
    setStudentId('')
    setReport(null)
    setErrors(p => ({ ...p, session: undefined }))
  }

  // Handle class change → reset student
  const handleClassChange = (val) => {
    setCls(val)
    setStudentId('')
    setReport(null)
    setErrors(p => ({ ...p, cls: undefined }))
  }

  // Handle student change
  const handleStudentChange = (val) => {
    setStudentId(val)
    setReport(null)
    setErrors(p => ({ ...p, student: undefined }))
  }

  // Submit
  const handleSubmit = useCallback(() => {
    const err = {}
    if (!session)   err.session = 'Please select a session'
    if (!cls)       err.cls     = 'Please select a class'
    if (!studentId) err.student = 'Please select a student'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const stu = students.find(s => String(s.id) === String(studentId))
      const rpt = generateReportData(Number(studentId), cls, session)
      setStudent(stu)
      setReport(rpt)
      setLoading(false)
      setActiveTab('marks')
      showToast(`Report Card loaded for ${stu?.name}.`)
    }, 750)
  }, [session, cls, studentId, students])

  const handleReset = () => {
    setSession(''); setCls(''); setStudentId('')
    setReport(null); setStudent(null); setErrors({})
  }

  const handlePrint = () => {
    showToast('Print dialog opened. (API integration pending)')
    window.print?.()
  }

  const hasReport = !!report && !!student && !loading

  // Mobile tabs config
  const mobileTabs = [
    { id: 'marks',       label: 'Marks',       icon: BarChart3    },
    { id: 'attendance',  label: 'Attendance',  icon: Calendar     },
    { id: 'coscholastic',label: 'Activities',  icon: Star         },
  ]

  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumb + Title ────────────────────────────────────────── */}
      <div>
        <Breadcrumb items={['Home', 'Student Record', 'Report Card']} />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mt-1">
          <div>
            <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
              Report Card
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Generate and view student report cards by session, class &amp; student.
            </p>
          </div>
          {hasReport && (
            <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
              >
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button
                type="button"
                onClick={() => showToast('Download ready! (API integration pending)')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                  bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Filter Card ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Select Report Criteria</span>
        </div>
        <div className="p-5">
          {/* Grid: 1 col mobile, 2 col tablet, 4 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => handleSessionChange(e.target.value)}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={cls}
                onChange={e => handleClassChange(e.target.value)}
                placeholder="-- Select Class --"
                error={errors.cls}
                disabled={!session}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Student */}
            <Field label="Student" error={errors.student} required>
              <NativeSelect
                value={studentId}
                onChange={e => handleStudentChange(e.target.value)}
                placeholder="-- Select Student --"
                error={errors.student}
                disabled={!cls}
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.roll})</option>
                ))}
              </NativeSelect>
            </Field>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Submit
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Cascade hint */}
          {!session && (
            <div className="mt-3 flex items-center gap-2 text-[12px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 rounded-xl px-4 py-2.5 border border-blue-100 dark:border-blue-500/20">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              Select Session first, then Class, then Student to generate report card.
            </div>
          )}
        </div>
      </div>

      {/* ── Loading Skeleton ────────────────────────────────────────────── */}
      {loading && (
        <div className="space-y-4">
          <div className="h-36 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Report Card Output ───────────────────────────────────────── */}
      {hasReport && (
        <div className="space-y-4">

          {/* School + Student Header */}
          <SchoolHeader
            studentName={student.name}
            cls={report.class}
            section={report.section}
            rollNo={report.rollNo}
            session={report.session}
          />

          {/* Result Banner */}
          <ResultBanner report={report} />

          {/* ─── DESKTOP: Show all sections together ─── */}
          <div className="hidden md:block space-y-4">

            {/* Marks Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Subject-wise Marks</span>
                <span className="text-[12px] font-semibold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                  {report.subjects.length} Subjects
                </span>
              </div>
              <MarksTable subjects={report.subjects} />
              {/* Totals Footer */}
              <div className="flex items-center justify-end gap-6 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
                <span className="text-[12px] text-slate-500 dark:text-slate-400">
                  Total: <strong className="text-slate-800 dark:text-slate-100 tabular-nums">
                    {report.subjects.reduce((s, r) => s + r.total, 0)} / {report.subjects.reduce((s, r) => s + r.max, 0)}
                  </strong>
                </span>
                <span className="text-[12px] text-slate-500 dark:text-slate-400">
                  Overall: <strong className="text-blue-700 dark:text-blue-400 tabular-nums">{report.overallPct}%</strong>
                </span>
                <span className={`text-[12px] font-bold px-3 py-1 rounded-full border
                  ${gradeColor(report.overallGrade).bg} ${gradeColor(report.overallGrade).text} ${gradeColor(report.overallGrade).border}`}>
                  Grade: {report.overallGrade}
                </span>
              </div>
            </div>

            {/* Attendance + Co-Scholastic side by side */}
            <div className="grid grid-cols-2 gap-4">
              <AttendanceCard att={report.attendance} />
              <CoScholasticCard items={report.coScholastic} conduct={report.conduct} />
            </div>

            {/* Grade Legend */}
            <GradeLegend />
          </div>

          {/* ─── MOBILE: Tab-based layout ─── */}
          <div className="md:hidden space-y-4">

            {/* Mobile Action buttons */}
            <div className="flex gap-2">
              <button onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <Printer className="w-4 h-4" />
                Print
              </button>
              <button onClick={() => showToast('Download ready! (API integration pending)')}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>

            {/* Tab Bar */}
            <div className="flex rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-50 dark:bg-[#1e2238] p-1 gap-1">
              {mobileTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[12px] font-semibold transition-all
                    ${activeTab === id
                      ? 'bg-white dark:bg-[#1a1f35] text-blue-700 dark:text-blue-400 shadow-sm border border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  {label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'marks' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-[12px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                    Subject-wise Marks
                  </p>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">
                    {report.subjects.length} subjects
                  </span>
                </div>
                {report.subjects.map((row, i) => (
                  <MarksCard key={i} row={row} />
                ))}
                {/* Total Summary */}
                <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <p className="text-[22px] font-black text-blue-700 dark:text-blue-300 tabular-nums">
                        {report.subjects.reduce((s, r) => s + r.total, 0)}
                      </p>
                      <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Total Marks</p>
                    </div>
                    <div>
                      <p className="text-[22px] font-black text-slate-700 dark:text-slate-200 tabular-nums">{report.overallPct}%</p>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Percentage</p>
                    </div>
                    <div>
                      <p className={`text-[22px] font-black tabular-nums ${gradeColor(report.overallGrade).text}`}>{report.overallGrade}</p>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Grade</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="space-y-4">
                <AttendanceCard att={report.attendance} />
              </div>
            )}

            {activeTab === 'coscholastic' && (
              <div className="space-y-4">
                <CoScholasticCard items={report.coScholastic} conduct={report.conduct} />
                <GradeLegend />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Empty State ────────────────────────────────────────────────── */}
      {!hasReport && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText className="w-8 h-8 opacity-50" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400">No Report Card Generated</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 leading-snug">
              Select a Session, Class and Student above, then click <strong>Submit</strong> to view the report card.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-2 w-full max-w-xs">
            {[
              { icon: Calendar, label: 'Pick Session',  color: 'text-blue-500' },
              { icon: GraduationCap, label: 'Pick Class', color: 'text-emerald-500' },
              { icon: User, label: 'Pick Student',  color: 'text-violet-500' },
            ].map(({ icon: Icon, label, color }, i) => (
              <div key={i} className="flex flex-col items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3 text-center">
                <Icon className={`w-5 h-5 ${color}`} />
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
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
