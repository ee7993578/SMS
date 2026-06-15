/**
 * CBSCPrimaryReportCard.jsx
 * Folder: src/pages/Reports/ReportCard/CBSCPrimaryReportCard.jsx
 *
 * Converts legacy ASPX "CBSC Primary Report Card (Student View)" to fully-responsive React + Tailwind.
 *
 * Original page: rsweb:ReportViewer bound to a Crystal/SSRS report,
 * filtered by Session / Class / Student / Term / Date.
 *
 * Features:
 *  - Session, Class, Student, Term dropdown filters (cascading: Class -> Student)
 *  - Date picker (report-as-of date)
 *  - "Show Report" action renders the report preview
 *  - Print / Download (PDF) placeholders for API integration
 *  - Desktop: filter bar + large report preview pane (A4 aspect)
 *  - Mobile: filters in a bottom drawer, report preview stacked full width,
 *    zoom controls for readability
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, Eye, Printer, Download,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Info, FileText,
  Calendar, GraduationCap, User, BookOpenCheck,
  ZoomIn, ZoomOut, Maximize2, ChevronRight,
  ClipboardList, Award, School2, MapPin, Building2
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  affiliation: 'CBSE Affiliation No. 2730XXX | School Code: 12345',
}

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V']

// Class -> students (id, name, roll no, father's name)
const STUDENTS_BY_CLASS = {
  Nursery: [
    { id: 'STU101', name: 'Aarav Sharma', roll: '01', father: 'Mr. Vikas Sharma' },
    { id: 'STU102', name: 'Diya Mehta', roll: '02', father: 'Mr. Rohit Mehta' },
    { id: 'STU103', name: 'Kabir Verma', roll: '03', father: 'Mr. Sanjay Verma' },
  ],
  LKG: [
    { id: 'STU201', name: 'Ishaan Gupta', roll: '01', father: 'Mr. Anil Gupta' },
    { id: 'STU202', name: 'Myra Singh', roll: '02', father: 'Mr. Rajeev Singh' },
  ],
  UKG: [
    { id: 'STU301', name: 'Riya Kapoor', roll: '01', father: 'Mr. Ashok Kapoor' },
    { id: 'STU302', name: 'Vivaan Joshi', roll: '02', father: 'Mr. Mahesh Joshi' },
  ],
  'Class I': [
    { id: 'STU401', name: 'Ananya Rawat', roll: '01', father: 'Mr. Deepak Rawat' },
    { id: 'STU402', name: 'Arjun Negi', roll: '02', father: 'Mr. Suresh Negi' },
    { id: 'STU403', name: 'Sara Khan', roll: '03', father: 'Mr. Imran Khan' },
  ],
  'Class II': [
    { id: 'STU501', name: 'Pranav Bisht', roll: '01', father: 'Mr. Kamal Bisht' },
    { id: 'STU502', name: 'Tanya Saxena', roll: '02', father: 'Mr. Naveen Saxena' },
  ],
  'Class III': [
    { id: 'STU601', name: 'Devansh Rana', roll: '01', father: 'Mr. Pradeep Rana' },
    { id: 'STU602', name: 'Kiara Thapa', roll: '02', father: 'Mr. Bikram Thapa' },
  ],
  'Class IV': [
    { id: 'STU701', name: 'Yuvraj Chauhan', roll: '01', father: 'Mr. Dinesh Chauhan' },
    { id: 'STU702', name: 'Naina Pant', roll: '02', father: 'Mr. Gopal Pant' },
  ],
  'Class V': [
    { id: 'STU801', name: 'Reyansh Negi', roll: '01', father: 'Mr. Mohan Negi' },
    { id: 'STU802', name: 'Avni Rathore', roll: '02', father: 'Mr. Vijay Rathore' },
  ],
}

const TERMS = ['Term I', 'Term II', 'Half Yearly', 'Annual / Final']

// Subject-wise marks for the report preview (dummy)
const SUBJECTS = [
  { code: 'ENG', name: 'English', max: 100, theory: 38, practical: 18, grade: 'A1' },
  { code: 'HIN', name: 'Hindi', max: 100, theory: 35, practical: 17, grade: 'A2' },
  { code: 'MAT', name: 'Mathematics', max: 100, theory: 40, practical: 19, grade: 'A1' },
  { code: 'EVS', name: 'Environmental Studies', max: 100, theory: 36, practical: 18, grade: 'A2' },
  { code: 'GK', name: 'General Knowledge', max: 100, theory: 37, practical: 19, grade: 'A1' },
  { code: 'ART', name: 'Art & Craft', max: 50, theory: 22, practical: 9, grade: 'A1' },
]

// Co-scholastic / skill grades (dummy)
const CO_SCHOLASTIC = [
  { area: 'Discipline', grade: 'A' },
  { area: 'Punctuality', grade: 'A' },
  { area: 'Participation', grade: 'B+' },
  { area: 'Sports & Games', grade: 'A' },
  { area: 'Art & Aesthetics', grade: 'A' },
]

const ATTENDANCE = { present: 198, total: 210 }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const GRADE_COLORS = {
  A1: { fg: '#047857', bg: '#d1fae5' },
  A2: { fg: '#0369a1', bg: '#e0f2fe' },
  'A':  { fg: '#047857', bg: '#d1fae5' },
  'B+': { fg: '#b45309', bg: '#fef3c7' },
  'B':  { fg: '#b45309', bg: '#fef3c7' },
}
const gradeColor = (g) => GRADE_COLORS[g] || { fg: '#334155', bg: '#f1f5f9' }

const todayISO = () => new Date().toISOString().slice(0, 10)

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

// ─── REPORT HEADER (school letterhead) ────────────────────────────────────────
function ReportLetterhead({ session, term }) {
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
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session} · {term}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Report Card
      </p>
    </div>
  )
}

// ─── STUDENT INFO STRIP ────────────────────────────────────────────────────────
function StudentInfoStrip({ student, klass }) {
  const items = [
    { icon: User, label: 'Student Name', value: student.name },
    { icon: ClipboardList, label: 'Roll No.', value: student.roll },
    { icon: GraduationCap, label: 'Class', value: klass },
    { icon: User, label: "Father's Name", value: student.father },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {items.map((it, i) => (
        <div key={i} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-3 py-2.5 shadow-sm min-w-0">
          <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">
            <it.icon className="w-3 h-3 flex-shrink-0" /> {it.label}
          </p>
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{it.value}</p>
        </div>
      ))}
    </div>
  )
}

// ─── DESKTOP SUBJECT TABLE ─────────────────────────────────────────────────────
function SubjectTable({ subjects, totals }) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/60 dark:bg-white/[0.02]">
            {['Subject', 'Max Marks', 'Theory', 'Practical / Internal', 'Marks Obtained', 'Grade'].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-left">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {subjects.map((s) => {
            const { fg, bg } = gradeColor(s.grade)
            const obtained = s.theory + s.practical
            return (
              <tr key={s.code} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{s.name}</span>
                </td>
                <td className="px-4 py-3 text-center text-[13px] tabular-nums text-slate-600 dark:text-slate-300">{s.max}</td>
                <td className="px-4 py-3 text-center text-[13px] tabular-nums text-slate-600 dark:text-slate-300">{s.theory}</td>
                <td className="px-4 py-3 text-center text-[13px] tabular-nums text-slate-600 dark:text-slate-300">{s.practical}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-10 h-8 rounded-lg text-[13px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
                    {obtained}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-10 h-7 rounded-lg text-[12px] font-bold" style={{ background: bg, color: fg }}>
                    {s.grade}
                  </span>
                </td>
              </tr>
            )
          })}
          <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
            <td className="px-4 py-3 text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
              <Award className="w-4 h-4" /> Grand Total
            </td>
            <td className="px-4 py-3 text-center text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.max}</td>
            <td className="px-4 py-3 text-center text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.theory}</td>
            <td className="px-4 py-3 text-center text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.practical}</td>
            <td className="px-4 py-3 text-center">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
                {totals.obtained}
              </span>
            </td>
            <td className="px-4 py-3 text-center">
              <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">
                {totals.percentage}%
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE SUBJECT CARDS ───────────────────────────────────────────────────────
function SubjectCard({ subject }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = gradeColor(subject.grade)
  const obtained = subject.theory + subject.practical
  const pct = subject.max ? Math.round((obtained / subject.max) * 100) : 0

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: bg, color: fg }}>
          {subject.code}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{subject.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Theory: <span className="font-semibold text-slate-600 dark:text-slate-300">{subject.theory}</span>
            &nbsp;·&nbsp;
            Practical: <span className="font-semibold text-slate-600 dark:text-slate-300">{subject.practical}</span>
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[20px] font-bold text-blue-700 dark:text-blue-400 tabular-nums leading-tight">{obtained}</span>
          <span className="text-[10px] text-slate-400">/ {subject.max}</span>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      <div className="px-4 pb-3">
        <div className="flex text-[10px] font-semibold justify-between mb-1">
          <span className="text-blue-600 dark:text-blue-400">Score {pct}%</span>
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: bg, color: fg }}>
            Grade {subject.grade}
          </span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3 text-center">
              <p className="text-[18px] font-bold text-slate-700 dark:text-slate-200 tabular-nums leading-tight">{subject.max}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">Max Marks</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <p className="text-[18px] font-bold text-blue-700 dark:text-blue-300 tabular-nums leading-tight">{subject.theory}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-0.5">Theory</p>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3 text-center">
              <p className="text-[18px] font-bold text-violet-700 dark:text-violet-300 tabular-nums leading-tight">{subject.practical}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mt-0.5">Practical</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CO-SCHOLASTIC + ATTENDANCE SECTION ────────────────────────────────────────
function CoScholasticSection() {
  const attPct = Math.round((ATTENDANCE.present / ATTENDANCE.total) * 100)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Co-Scholastic grades */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
          <BookOpenCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Co-Scholastic Areas</span>
        </div>
        <div className="p-4 space-y-2">
          {CO_SCHOLASTIC.map((c, i) => {
            const { fg, bg } = gradeColor(c.grade)
            return (
              <div key={i} className="flex items-center justify-between gap-3 px-1">
                <span className="text-[13px] text-slate-600 dark:text-slate-300">{c.area}</span>
                <span className="inline-flex items-center justify-center w-9 h-7 rounded-lg text-[12px] font-bold flex-shrink-0" style={{ background: bg, color: fg }}>
                  {c.grade}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Attendance */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
          <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Attendance</span>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <p className="text-[20px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums leading-tight">{ATTENDANCE.present}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Present</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3 text-center">
              <p className="text-[20px] font-bold text-slate-700 dark:text-slate-200 tabular-nums leading-tight">{ATTENDANCE.total}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">Total Days</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums leading-tight">{attPct}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-0.5">Attendance</p>
            </div>
          </div>
          <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${attPct}%` }} />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({
  open, onClose,
  session, setSession,
  klass, setKlass,
  student, setStudent,
  term, setTerm,
  date, setDate,
  students,
  onShow, loading, errors
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[88vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35]">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-3 bg-white dark:bg-[#1a1f35] z-10">
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

          <Field label="Class" error={errors.klass} required>
            <NativeSelect value={klass} onChange={e => setKlass(e.target.value)} placeholder="-- Select Class --" error={errors.klass}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Student" error={errors.student} required>
            <NativeSelect value={student} onChange={e => setStudent(e.target.value)} placeholder={klass ? '-- Select Student --' : 'Select a class first'} error={errors.student} disabled={!klass}>
              {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll {s.roll})</option>)}
            </NativeSelect>
          </Field>

          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setTerm(e.target.value)} placeholder="-- Select Term --" error={errors.term}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Report Date">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                bg-white text-slate-800 border-slate-200
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:focus:border-indigo-400"
            />
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
export default function CBSCPrimaryReportCard() {
  const [session,    setSession]    = useState('')
  const [klass,      setKlass]      = useState('')
  const [studentId,  setStudentId]  = useState('')
  const [term,       setTerm]       = useState('')
  const [date,       setDate]       = useState(todayISO())

  const [loading,    setLoading]    = useState(false)
  const [printing,   setPrinting]   = useState(false)
  const [downloading,setDownloading]= useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [zoom,       setZoom]       = useState(100)

  const reportRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Cascading: Class -> Students list ─────────────────────────────────────
  const students = useMemo(() => STUDENTS_BY_CLASS[klass] || [], [klass])

  const handleClassChange = useCallback((value) => {
    setKlass(value)
    setStudentId('')
    setErrors(p => ({ ...p, klass: undefined, student: undefined }))
  }, [])

  // ── Show Report (simulate report viewer rendering) ────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!klass) err.klass = 'Please select a class'
    if (!studentId) err.student = 'Please select a student'
    if (!term) err.term = 'Please select a term'
    if (Object.keys(err).length) { setErrors(err); setShown(false); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      setShown(true)
      setLoading(false)
      showToast('Report card generated successfully.')
    }, 700)
  }, [session, klass, studentId, term])

  const handleReset = () => {
    setSession(''); setKlass(''); setStudentId(''); setTerm('')
    setDate(todayISO()); setErrors({}); setShown(false); setZoom(100)
  }

  // ── Print placeholder ──────────────────────────────────────────────────────
  const handlePrint = () => {
    if (!shown) { showToast('Generate the report before printing.', 'error'); return }
    setPrinting(true)
    setTimeout(() => {
      setPrinting(false)
      // Placeholder for real print integration, e.g. window.print() on report node
      showToast('Print dialog ready! (Print integration pending)')
    }, 800)
  }

  // ── Download PDF placeholder ───────────────────────────────────────────────
  const handleDownload = () => {
    if (!shown) { showToast('Generate the report before downloading.', 'error'); return }
    setDownloading(true)
    setTimeout(() => {
      setDownloading(false)
      showToast('PDF export ready! (API integration pending)')
    }, 1200)
  }

  const selectedStudent = useMemo(
    () => students.find(s => s.id === studentId),
    [students, studentId]
  )

  // ── Subject totals ──────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    const max = SUBJECTS.reduce((s, r) => s + r.max, 0)
    const theory = SUBJECTS.reduce((s, r) => s + r.theory, 0)
    const practical = SUBJECTS.reduce((s, r) => s + r.practical, 0)
    const obtained = theory + practical
    return { max, theory, practical, obtained, percentage: ((obtained / max) * 100).toFixed(1) }
  }, [])

  const hasResults = shown && selectedStudent
  const activeFilters = [session, klass, studentId, term].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Report Card
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and print the CBSC primary report card for a selected student.
          </p>
        </div>
        {hasResults && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={printing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
            >
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              Print
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
            >
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.klass} required>
              <NativeSelect
                value={klass}
                onChange={e => handleClassChange(e.target.value)}
                placeholder="-- Select Class --"
                error={errors.klass}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Student" error={errors.student} required>
              <NativeSelect
                value={studentId}
                onChange={e => { setStudentId(e.target.value); setErrors(p => ({ ...p, student: undefined })) }}
                placeholder={klass ? '-- Select Student --' : 'Select class first'}
                error={errors.student}
                disabled={!klass}
              >
                {students.map(s => <option key={s.id} value={s.id}>{s.name} (Roll {s.roll})</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.term} required>
              <NativeSelect
                value={term}
                onChange={e => { setTerm(e.target.value); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select Term --"
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

          {/* Date field as secondary row */}
          <div className="mt-4 grid grid-cols-2 lg:grid-cols-5 gap-4">
            <Field label="Report Date">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 border-slate-200
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:focus:border-indigo-400"
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {studentId && selectedStudent ? selectedStudent.name : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <>
            <button type="button" onClick={handlePrint} disabled={printing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 disabled:opacity-70">
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            </button>
            <button type="button" onClick={handleDownload} disabled={downloading}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
              {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            </button>
          </>
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
        session={session} setSession={setSession}
        klass={klass} setKlass={handleClassChange}
        student={studentId} setStudent={setStudentId}
        term={term} setTerm={setTerm}
        date={date} setDate={setDate}
        students={students}
        onShow={handleShow}
        loading={loading}
        errors={errors}
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
        <div ref={reportRef} className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <School2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Report Preview</span>
              <span className="text-[13px] text-slate-400 dark:text-slate-500">· {term}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                As of {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>

            {/* Zoom controls — useful for reading a dense A4 report on smaller screens */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setZoom(z => Math.max(60, z - 10))}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 w-12 text-center tabular-nums">{zoom}%</span>
              <button onClick={() => setZoom(z => Math.min(140, z + 10))}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setZoom(100)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Info hint */}
          <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              Grades: A1 (91-100), A2 (81-90), B+ (71-80), B (61-70). Use Print or Download to share the report.
            </p>
          </div>

          {/* Report body — zoomable */}
          <div className="p-4 sm:p-6 overflow-x-auto">
            <div
              className="space-y-4 transition-transform origin-top mx-auto"
              style={{ transform: `scale(${zoom / 100})`, width: zoom < 100 ? `${10000 / zoom}%` : '100%', maxWidth: zoom < 100 ? 'none' : '900px' }}
            >
              {/* Letterhead */}
              <ReportLetterhead session={session} term={term} />

              {/* Student info */}
              <StudentInfoStrip student={selectedStudent} klass={klass} />

              {/* Subjects — desktop table */}
              <SubjectTable subjects={SUBJECTS} totals={totals} />

              {/* Subjects — mobile cards */}
              <div className="md:hidden space-y-3">
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap a subject to see the detailed marks breakdown.
                </p>
                {SUBJECTS.map(s => <SubjectCard key={s.code} subject={s} />)}

                {/* Mobile grand total */}
                <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                  <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Grand Total
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                      <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.obtained}</p>
                      <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Marks Obtained</p>
                    </div>
                    <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                      <p className="text-[20px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{totals.max}</p>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Max Marks</p>
                    </div>
                    <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                      <p className="text-[20px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{totals.percentage}%</p>
                      <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Percentage</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Co-Scholastic + Attendance */}
              <CoScholasticSection />

              {/* Footer note */}
              <div className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/60 dark:bg-white/[0.02] px-4 py-3 text-center">
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  This is a system-generated report card and does not require a signature.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center px-6">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session, class, student &amp; term, then tap <strong>Show</strong> to preview the report card.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
