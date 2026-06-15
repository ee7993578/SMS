/**
 * CBSEReportCardXI.jsx
 * Folder: src/pages/Student/Reports/CBSEReportCardXI.jsx
 *
 * Converts legacy ASPX "CBSE Class XI Report Card (for Student)" to fully-responsive
 * React + Tailwind, matching the StrengthReport.jsx theme & components.
 *
 * Original ASPX only had:
 *   - A ReportViewer (CBSC_XI_for_stu.aspx.cs) that renders an RDLC report card
 *
 * Reconstructed as:
 *   - Session / Class / Section / Student / Term filters (the commented-out
 *     dropdowns from the ASPX, re-enabled in modern UI form)
 *   - "Show Report" action -> renders report card preview (in place of ReportViewer)
 *   - Print / Download PDF placeholders (in place of ShowExportControls/PrintButton)
 *   - Mobile: filter drawer + stacked card based report card
 *   - Desktop: dense filter bar + A4-style report card preview
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Printer, Download, FileText,
  SlidersHorizontal, Info, Search,
  School2, MapPin, Building2,
  GraduationCap, User, BookOpenCheck,
  Award, TrendingUp, ClipboardList
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']
const TERMS = ['Term 1', 'Term 2', 'Half Yearly', 'Annual']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  affiliation: 'Affiliated to CBSE, New Delhi | Affiliation No. 1234567',
}

// Class -> Sections
const CLASS_SECTIONS = {
  'Class XI': ['A', 'B'],
}

// Students per class+section
const STUDENTS = {
  'Class XI-A': [
    { id: 'S101', name: 'Aarav Sharma', roll: '01', father: 'Rakesh Sharma', dob: '12-Mar-2009' },
    { id: 'S102', name: 'Diya Patel', roll: '02', father: 'Suresh Patel', dob: '24-Jul-2009' },
    { id: 'S103', name: 'Kabir Singh', roll: '03', father: 'Manjeet Singh', dob: '05-Jan-2009' },
    { id: 'S104', name: 'Ishita Verma', roll: '04', father: 'Anil Verma', dob: '18-Sep-2009' },
  ],
  'Class XI-B': [
    { id: 'S151', name: 'Rohan Gupta', roll: '01', father: 'Mahesh Gupta', dob: '02-Feb-2009' },
    { id: 'S152', name: 'Sneha Reddy', roll: '02', father: 'Krishna Reddy', dob: '30-Nov-2009' },
    { id: 'S153', name: 'Aditya Mehta', roll: '03', father: 'Vijay Mehta', dob: '14-Apr-2009' },
  ],
}

// Subject-wise marks per student id + term (dummy)
const SUBJECT_MARKS = {
  S101: {
    'Term 1': [
      { subject: 'English Core',     max: 100, theory: 72, practical: null, total: 72,  grade: 'A2' },
      { subject: 'Physics',          max: 100, theory: 64, practical: 18,   total: 82,  grade: 'A1' },
      { subject: 'Chemistry',        max: 100, theory: 60, practical: 17,   total: 77,  grade: 'A2' },
      { subject: 'Mathematics',      max: 100, theory: 78, practical: null, total: 78,  grade: 'A2' },
      { subject: 'Physical Education', max: 100, theory: 45, practical: 48, total: 93, grade: 'A1' },
    ],
    'Half Yearly': [
      { subject: 'English Core',     max: 100, theory: 75, practical: null, total: 75,  grade: 'A1' },
      { subject: 'Physics',          max: 100, theory: 68, practical: 19,   total: 87,  grade: 'A1' },
      { subject: 'Chemistry',        max: 100, theory: 63, practical: 18,   total: 81,  grade: 'A1' },
      { subject: 'Mathematics',      max: 100, theory: 81, practical: null, total: 81,  grade: 'A1' },
      { subject: 'Physical Education', max: 100, theory: 47, practical: 49, total: 96, grade: 'A1' },
    ],
  },
  S102: {
    'Term 1': [
      { subject: 'English Core',     max: 100, theory: 80, practical: null, total: 80,  grade: 'A1' },
      { subject: 'Physics',          max: 100, theory: 58, practical: 16,   total: 74,  grade: 'A2' },
      { subject: 'Chemistry',        max: 100, theory: 55, practical: 15,   total: 70,  grade: 'B1' },
      { subject: 'Biology',          max: 100, theory: 70, practical: 19,   total: 89,  grade: 'A1' },
      { subject: 'Physical Education', max: 100, theory: 44, practical: 47, total: 91, grade: 'A1' },
    ],
    'Half Yearly': [
      { subject: 'English Core',     max: 100, theory: 83, practical: null, total: 83,  grade: 'A1' },
      { subject: 'Physics',          max: 100, theory: 61, practical: 17,   total: 78,  grade: 'A2' },
      { subject: 'Chemistry',        max: 100, theory: 58, practical: 16,   total: 74,  grade: 'A2' },
      { subject: 'Biology',          max: 100, theory: 73, practical: 19,   total: 92,  grade: 'A1' },
      { subject: 'Physical Education', max: 100, theory: 46, practical: 48, total: 94, grade: 'A1' },
    ],
  },
}

// Co-scholastic & attendance (dummy, term-independent for simplicity)
const COSCHOLASTIC = {
  S101: { discipline: 'A', attitude: 'A', participation: 'B+' },
  S102: { discipline: 'A+', attitude: 'A', participation: 'A' },
}

const ATTENDANCE = {
  S101: { working: 110, present: 104 },
  S102: { working: 110, present: 108 },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const gradeColor = (grade = '') => {
  if (grade.startsWith('A1')) return { fg: '#059669', bg: '#d1fae5' }
  if (grade.startsWith('A')) return { fg: '#0891b2', bg: '#cffafe' }
  if (grade.startsWith('B')) return { fg: '#d97706', bg: '#fef3c7' }
  return { fg: '#dc2626', bg: '#fee2e2' }
}

const getStudentList = (cls, section) => {
  if (!cls || !section) return []
  return STUDENTS[`${cls}-${section}`] || []
}

// ─── PRIMITIVE COMPONENTS (shared with StrengthReport theme) ───────────────────

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

// ─── SCHOOL HEADER BANNER (report card top) ───────────────────────────────────
function SchoolHeader({ session }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-1">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">{SCHOOL_INFO.affiliation}</p>
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Report Card — Class XI
      </p>
    </div>
  )
}

// ─── STUDENT INFO STRIP ─────────────────────────────────────────────────────
function StudentInfoStrip({ student, cls, section, term }) {
  const items = [
    { icon: User, label: 'Student Name', value: student.name },
    { icon: ClipboardList, label: 'Roll No.', value: student.roll },
    { icon: GraduationCap, label: 'Class & Section', value: `${cls} - ${section}` },
    { icon: User, label: "Father's Name", value: student.father },
    { icon: BookOpenCheck, label: 'Date of Birth', value: student.dob },
    { icon: FileText, label: 'Term', value: term },
  ]
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm p-4 sm:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.08)] px-3 py-2.5">
            <span className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Icon className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── DESKTOP MARKS TABLE ───────────────────────────────────────────────────────
function MarksTable({ marks, totals }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
            {['Subject', 'Max Marks', 'Theory', 'Practical', 'Total', 'Grade'].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {marks.map((row) => {
            const { fg, bg } = gradeColor(row.grade)
            return (
              <tr key={row.subject} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.subject}</td>
                <td className="px-4 py-3 text-center text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">{row.max}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
                    {row.theory}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  {row.practical !== null ? (
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 tabular-nums">
                      {row.practical}
                    </span>
                  ) : (
                    <span className="text-[12px] text-slate-300 dark:text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-[14px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
                    {row.total}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[12px] font-bold tabular-nums" style={{ background: bg, color: fg }}>
                    {row.grade}
                  </span>
                </td>
              </tr>
            )
          })}
          {/* Grand total row */}
          <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
            <td className="px-4 py-3" colSpan={4}>
              <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Grand Total ({totals.obtained} / {totals.max})
              </span>
            </td>
            <td className="px-4 py-3 text-center">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
                {totals.percentage}%
              </span>
            </td>
            <td className="px-4 py-3 text-center">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">
                {totals.overallGrade}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE MARKS CARDS ────────────────────────────────────────────────────────
function MobileMarksCard({ row }) {
  const { fg, bg } = gradeColor(row.grade)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{row.subject}</p>
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[12px] font-bold tabular-nums flex-shrink-0" style={{ background: bg, color: fg }}>
          {row.grade}
        </span>
      </div>
      <div className="grid grid-cols-4 gap-2 text-center">
        <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] py-2">
          <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{row.max}</p>
          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Max</p>
        </div>
        <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 py-2">
          <p className="text-[15px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{row.theory}</p>
          <p className="text-[10px] font-semibold text-blue-500 mt-0.5">Theory</p>
        </div>
        <div className="rounded-lg bg-violet-50 dark:bg-violet-500/10 py-2">
          <p className="text-[15px] font-bold text-violet-700 dark:text-violet-400 tabular-nums">{row.practical ?? '—'}</p>
          <p className="text-[10px] font-semibold text-violet-500 mt-0.5">Practical</p>
        </div>
        <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 py-2">
          <p className="text-[15px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{row.total}</p>
          <p className="text-[10px] font-semibold text-emerald-500 mt-0.5">Total</p>
        </div>
      </div>
    </div>
  )
}

// ─── CO-SCHOLASTIC + ATTENDANCE PANEL ─────────────────────────────────────────
function CoScholasticPanel({ coScholastic, attendance }) {
  const attPct = attendance ? Math.round((attendance.present / attendance.working) * 100) : 0
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Co-scholastic */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm p-4 sm:p-5">
        <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-violet-500" /> Co-Scholastic Areas
        </p>
        <div className="space-y-2">
          {Object.entries(coScholastic || {}).map(([key, grade]) => {
            const { fg, bg } = gradeColor(grade)
            const label = key.charAt(0).toUpperCase() + key.slice(1)
            return (
              <div key={key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-50 dark:bg-white/[0.03]">
                <span className="text-[13px] text-slate-600 dark:text-slate-300">{label}</span>
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[12px] font-bold tabular-nums" style={{ background: bg, color: fg }}>
                  {grade}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Attendance */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm p-4 sm:p-5">
        <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-cyan-500" /> Attendance
        </p>
        {attendance ? (
          <>
            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] py-2">
                <p className="text-[18px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{attendance.working}</p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Working Days</p>
              </div>
              <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 py-2">
                <p className="text-[18px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{attendance.present}</p>
                <p className="text-[10px] font-semibold text-emerald-500 mt-0.5">Present</p>
              </div>
              <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 py-2">
                <p className="text-[18px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{attPct}%</p>
                <p className="text-[10px] font-semibold text-blue-500 mt-0.5">Percentage</p>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${attPct}%` }} />
            </div>
          </>
        ) : (
          <p className="text-[12px] text-slate-400">No attendance data available.</p>
        )}
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({
  open, onClose,
  session, setSession,
  cls, setCls,
  section, setSection,
  studentId, setStudentId,
  term, setTerm,
  onShow, loading, errors, studentOptions,
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-0 bg-white dark:bg-[#1a1f35]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Report Filters</span>
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
            <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setSection(''); setStudentId('') }} placeholder="-- Select Class --" error={errors.cls}>
              {Object.keys(CLASS_SECTIONS).map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Section" error={errors.section} required>
            <NativeSelect value={section} onChange={e => { setSection(e.target.value); setStudentId('') }} placeholder="-- Select Section --" error={errors.section} disabled={!cls}>
              {(CLASS_SECTIONS[cls] || []).map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Student" error={errors.studentId} required>
            <NativeSelect value={studentId} onChange={e => setStudentId(e.target.value)} placeholder="-- Select Student --" error={errors.studentId} disabled={!section}>
              {studentOptions.map(s => <option key={s.id} value={s.id}>{s.roll} - {s.name}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setTerm(e.target.value)} placeholder="-- Select Term --" error={errors.term}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
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
export default function CBSEReportCardXI() {
  const [session,   setSession]   = useState('')
  const [cls,       setCls]       = useState('Class XI')
  const [section,   setSection]   = useState('')
  const [studentId, setStudentId] = useState('')
  const [term,      setTerm]      = useState('')

  const [loading,    setLoading]    = useState(false)
  const [printing,   setPrinting]   = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)

  // The "shown" snapshot — what's actually displayed in the report
  const [reportData, setReportData] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const studentOptions = useMemo(() => getStudentList(cls, section), [cls, section])

  // ── Fetch / generate report (simulate API / ReportViewer load) ────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!cls) err.cls = 'Please select a class'
    if (!section) err.section = 'Please select a section'
    if (!studentId) err.studentId = 'Please select a student'
    if (!term) err.term = 'Please select a term'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const student = studentOptions.find(s => s.id === studentId)
      const marks = (SUBJECT_MARKS[studentId] && SUBJECT_MARKS[studentId][term]) || []

      const obtained = marks.reduce((s, r) => s + r.total, 0)
      const max = marks.reduce((s, r) => s + r.max, 0)
      const percentage = max ? Math.round((obtained / max) * 1000) / 10 : 0
      const overallGrade =
        percentage >= 90 ? 'A1' :
        percentage >= 80 ? 'A2' :
        percentage >= 70 ? 'B1' :
        percentage >= 60 ? 'B2' : 'C1'

      setReportData({
        session,
        cls,
        section,
        term,
        student,
        marks,
        totals: { obtained, max, percentage, overallGrade },
        coScholastic: COSCHOLASTIC[studentId] || null,
        attendance: ATTENDANCE[studentId] || null,
      })
      setShown(true)
      setLoading(false)

      if (marks.length === 0) {
        showToast('No marks data found for this selection.', 'error')
      } else {
        showToast(`Report card loaded for ${student?.name}.`)
      }
    }, 650)
  }, [session, cls, section, studentId, term, studentOptions])

  const handleReset = () => {
    setSession(''); setCls('Class XI'); setSection(''); setStudentId(''); setTerm('')
    setErrors({}); setShown(false); setReportData(null)
  }

  // ── Print / PDF placeholders ───────────────────────────────────────────────
  const handlePrint = () => {
    if (!reportData) { showToast('Generate a report first.', 'error'); return }
    showToast('Opening print dialog… (integration pending)')
  }

  const handleDownloadPdf = () => {
    if (!reportData) { showToast('Generate a report first.', 'error'); return }
    setPrinting(true)
    setTimeout(() => {
      setPrinting(false)
      showToast('PDF download ready! (API integration pending)')
    }, 1200)
  }

  const hasResults = shown && reportData && reportData.marks.length > 0
  const activeFilters = [session, cls, section, studentId, term].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Report Card — Class XI
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Generate and print CBSE Class XI student report card.
          </p>
        </div>
        {hasResults && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 flex-shrink-0"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={printing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
            >
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
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
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={cls}
                onChange={e => { setCls(e.target.value); setSection(''); setStudentId(''); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select --"
                error={errors.cls}
              >
                {Object.keys(CLASS_SECTIONS).map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Section" error={errors.section} required>
              <NativeSelect
                value={section}
                onChange={e => { setSection(e.target.value); setStudentId(''); setErrors(p => ({ ...p, section: undefined })) }}
                placeholder="-- Select --"
                error={errors.section}
                disabled={!cls}
              >
                {(CLASS_SECTIONS[cls] || []).map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Student" error={errors.studentId} required>
              <NativeSelect
                value={studentId}
                onChange={e => { setStudentId(e.target.value); setErrors(p => ({ ...p, studentId: undefined })) }}
                placeholder="-- Select --"
                error={errors.studentId}
                disabled={!section}
              >
                {studentOptions.map(s => <option key={s.id} value={s.id}>{s.roll} - {s.name}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.term} required>
              <NativeSelect
                value={term}
                onChange={e => { setTerm(e.target.value); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select --"
                error={errors.term}
              >
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
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
          {studentId ? studentOptions.find(s => s.id === studentId)?.name : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
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
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        section={section} setSection={setSection}
        studentId={studentId} setStudentId={setStudentId}
        term={term} setTerm={setTerm}
        onShow={handleShow}
        loading={loading}
        errors={errors}
        studentOptions={studentOptions}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={reportData.session} />

          {/* Student Info */}
          <StudentInfoStrip
            student={reportData.student}
            cls={reportData.cls}
            section={reportData.section}
            term={reportData.term}
          />

          {/* Marks card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <BookOpenCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Scholastic Areas — Subject Marks</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                {reportData.marks.length} subjects
              </span>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Theory + Practical = Total. Grades follow CBSE 9-point grading scale.
              </p>
            </div>

            {/* Desktop table */}
            <MarksTable marks={reportData.marks} totals={reportData.totals} />

            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              {reportData.marks.map(row => (
                <MobileMarksCard key={row.subject} row={row} />
              ))}

              {/* Mobile grand total */}
              <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Overall Result
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                    <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                      {reportData.totals.obtained}/{reportData.totals.max}
                    </p>
                    <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">Marks Obtained</p>
                  </div>
                  <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                    <p className="text-[20px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{reportData.totals.percentage}%</p>
                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">Percentage</p>
                  </div>
                  <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                    <p className="text-[20px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{reportData.totals.overallGrade}</p>
                    <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400 mt-0.5">Overall Grade</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Co-Scholastic + Attendance */}
          <CoScholasticPanel coScholastic={reportData.coScholastic} attendance={reportData.attendance} />

          {/* Mobile action buttons */}
          <div className="flex sm:hidden gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={printing}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 disabled:opacity-70"
            >
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
            </button>
          </div>
        </>
      )}

      {/* ── No marks found state ─────────────────────────────────────────── */}
      {shown && reportData && reportData.marks.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Search className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report card data found</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Marks for <strong>{reportData.student?.name}</strong> in <strong>{reportData.term}</strong> are not available yet.
            </p>
          </div>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session, class, section, student &amp; term, then click <strong>Show</strong> to generate the report card.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
