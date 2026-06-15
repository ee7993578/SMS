/**
 * ReportCard.jsx
 * Folder: src/pages/Student/Reports/ReportCard.jsx
 *
 * Converts legacy ASPX "CBSE Class IX Report Card (For Student)" report viewer
 * to fully-responsive React + Tailwind.
 *
 * Filters: Session, Class, Student, Term
 * Report:
 *  - School header (name / address / session / term)
 *  - Student info (name, roll, admission no, DOB, parents)
 *  - Scholastic areas (subject-wise marks + grade)
 *  - Co-Scholastic areas + Discipline (grades)
 *  - Attendance summary
 *  - Result summary (overall %, grade, promotion status, remarks)
 *
 * Desktop : dense ERP-style tables, filters always visible
 * Mobile  : collapsible cards, drawer filters, no horizontal scroll
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown, ChevronRight,
  Search, SlidersHorizontal, Info,
  School2, MapPin, Building2,
  User, Calendar, IdCard, Users,
  BookOpen, Award, ClipboardList, Activity,
  TrendingUp, Printer, FileText, CheckCircle2,
  Star, GraduationCap, BarChart3
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']
const CLASSES = ['IX - A', 'IX - B']
const TERMS = ['Term 1', 'Term 2', 'Annual']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  affiliation: 'Affiliated to CBSE, Affiliation No. 1234567',
}

// Students per class (for cascading dropdown)
const STUDENTS = {
  'IX - A': [
    { id: 'STU1001', name: 'Aarav Sharma', rollNo: 12, admissionNo: 'ADM2021045', dob: '14 Mar 2011', father: 'Rajesh Sharma', mother: 'Sunita Sharma' },
    { id: 'STU1002', name: 'Diya Verma', rollNo: 15, admissionNo: 'ADM2021061', dob: '02 Jul 2011', father: 'Anil Verma', mother: 'Kavita Verma' },
    { id: 'STU1003', name: 'Karan Mehta', rollNo: 18, admissionNo: 'ADM2021078', dob: '21 Nov 2010', father: 'Suresh Mehta', mother: 'Pooja Mehta' },
  ],
  'IX - B': [
    { id: 'STU2001', name: 'Ishita Rawat', rollNo: 7, admissionNo: 'ADM2021102', dob: '09 Jan 2011', father: 'Mohan Rawat', mother: 'Geeta Rawat' },
    { id: 'STU2002', name: 'Yash Negi', rollNo: 21, admissionNo: 'ADM2021119', dob: '30 Aug 2011', father: 'Vikram Negi', mother: 'Reena Negi' },
  ],
}

// Subject max marks (sum = 100): Periodic Test, Notebook/Subject Enrichment, Portfolio, Term Exam
const SUBJECT_MAX = { pt: 10, nb: 10, se: 10, exam: 70 }

// Scholastic marks per session -> class -> student -> term
const SCHOLASTIC_DATA = {
  '2025-26': {
    'IX - A': {
      STU1001: {
        'Term 1': [
          { subject: 'English', pt: 9, nb: 9, se: 8, exam: 60 },
          { subject: 'Hindi', pt: 8, nb: 8, se: 9, exam: 58 },
          { subject: 'Mathematics', pt: 9, nb: 8, se: 8, exam: 63 },
          { subject: 'Science', pt: 8, nb: 9, se: 8, exam: 61 },
          { subject: 'Social Science', pt: 8, nb: 8, se: 8, exam: 57 },
          { subject: 'Computer Applications', pt: 10, nb: 9, se: 9, exam: 64 },
        ],
        'Term 2': [
          { subject: 'English', pt: 9, nb: 9, se: 9, exam: 63 },
          { subject: 'Hindi', pt: 9, nb: 8, se: 9, exam: 60 },
          { subject: 'Mathematics', pt: 9, nb: 9, se: 8, exam: 66 },
          { subject: 'Science', pt: 9, nb: 9, se: 9, exam: 64 },
          { subject: 'Social Science', pt: 8, nb: 8, se: 9, exam: 60 },
          { subject: 'Computer Applications', pt: 10, nb: 10, se: 9, exam: 67 },
        ],
        Annual: [
          { subject: 'English', pt: 9, nb: 9, se: 9, exam: 64 },
          { subject: 'Hindi', pt: 9, nb: 8, se: 9, exam: 61 },
          { subject: 'Mathematics', pt: 9, nb: 9, se: 9, exam: 67 },
          { subject: 'Science', pt: 9, nb: 9, se: 9, exam: 65 },
          { subject: 'Social Science', pt: 9, nb: 8, se: 9, exam: 61 },
          { subject: 'Computer Applications', pt: 10, nb: 10, se: 10, exam: 68 },
        ],
      },
      STU1002: {
        'Term 1': [
          { subject: 'English', pt: 8, nb: 8, se: 7, exam: 52 },
          { subject: 'Hindi', pt: 9, nb: 9, se: 8, exam: 61 },
          { subject: 'Mathematics', pt: 6, nb: 7, se: 6, exam: 41 },
          { subject: 'Science', pt: 7, nb: 7, se: 7, exam: 48 },
          { subject: 'Social Science', pt: 8, nb: 8, se: 8, exam: 55 },
          { subject: 'Computer Applications', pt: 8, nb: 8, se: 8, exam: 56 },
        ],
        'Term 2': [
          { subject: 'English', pt: 8, nb: 8, se: 8, exam: 55 },
          { subject: 'Hindi', pt: 9, nb: 9, se: 9, exam: 63 },
          { subject: 'Mathematics', pt: 7, nb: 7, se: 6, exam: 45 },
          { subject: 'Science', pt: 7, nb: 8, se: 7, exam: 51 },
          { subject: 'Social Science', pt: 8, nb: 8, se: 8, exam: 58 },
          { subject: 'Computer Applications', pt: 9, nb: 8, se: 8, exam: 59 },
        ],
        Annual: [
          { subject: 'English', pt: 8, nb: 9, se: 8, exam: 57 },
          { subject: 'Hindi', pt: 9, nb: 9, se: 9, exam: 64 },
          { subject: 'Mathematics', pt: 7, nb: 7, se: 7, exam: 47 },
          { subject: 'Science', pt: 8, nb: 8, se: 7, exam: 53 },
          { subject: 'Social Science', pt: 8, nb: 9, se: 8, exam: 59 },
          { subject: 'Computer Applications', pt: 9, nb: 9, se: 8, exam: 61 },
        ],
      },
      STU1003: {
        'Term 1': [
          { subject: 'English', pt: 7, nb: 7, se: 6, exam: 44 },
          { subject: 'Hindi', pt: 7, nb: 6, se: 6, exam: 42 },
          { subject: 'Mathematics', pt: 5, nb: 6, se: 5, exam: 32 },
          { subject: 'Science', pt: 6, nb: 6, se: 5, exam: 38 },
          { subject: 'Social Science', pt: 6, nb: 7, se: 6, exam: 40 },
          { subject: 'Computer Applications', pt: 7, nb: 7, se: 6, exam: 45 },
        ],
        'Term 2': [
          { subject: 'English', pt: 7, nb: 7, se: 7, exam: 47 },
          { subject: 'Hindi', pt: 7, nb: 7, se: 6, exam: 45 },
          { subject: 'Mathematics', pt: 6, nb: 6, se: 5, exam: 35 },
          { subject: 'Science', pt: 6, nb: 7, se: 6, exam: 41 },
          { subject: 'Social Science', pt: 7, nb: 7, se: 6, exam: 43 },
          { subject: 'Computer Applications', pt: 7, nb: 8, se: 7, exam: 48 },
        ],
        Annual: [
          { subject: 'English', pt: 7, nb: 7, se: 7, exam: 48 },
          { subject: 'Hindi', pt: 7, nb: 7, se: 7, exam: 46 },
          { subject: 'Mathematics', pt: 6, nb: 7, se: 6, exam: 37 },
          { subject: 'Science', pt: 7, nb: 7, se: 6, exam: 43 },
          { subject: 'Social Science', pt: 7, nb: 7, se: 7, exam: 45 },
          { subject: 'Computer Applications', pt: 8, nb: 8, se: 7, exam: 50 },
        ],
      },
    },
    'IX - B': {
      STU2001: {
        'Term 1': [
          { subject: 'English', pt: 9, nb: 9, se: 9, exam: 65 },
          { subject: 'Hindi', pt: 9, nb: 8, se: 9, exam: 62 },
          { subject: 'Mathematics', pt: 10, nb: 9, se: 9, exam: 68 },
          { subject: 'Science', pt: 9, nb: 9, se: 9, exam: 66 },
          { subject: 'Social Science', pt: 9, nb: 9, se: 8, exam: 63 },
          { subject: 'Computer Applications', pt: 10, nb: 10, se: 9, exam: 68 },
        ],
        'Term 2': [
          { subject: 'English', pt: 9, nb: 9, se: 9, exam: 66 },
          { subject: 'Hindi', pt: 9, nb: 9, se: 9, exam: 64 },
          { subject: 'Mathematics', pt: 10, nb: 10, se: 9, exam: 69 },
          { subject: 'Science', pt: 10, nb: 9, se: 9, exam: 67 },
          { subject: 'Social Science', pt: 9, nb: 9, se: 9, exam: 65 },
          { subject: 'Computer Applications', pt: 10, nb: 10, se: 10, exam: 69 },
        ],
        Annual: [
          { subject: 'English', pt: 9, nb: 9, se: 9, exam: 67 },
          { subject: 'Hindi', pt: 9, nb: 9, se: 9, exam: 65 },
          { subject: 'Mathematics', pt: 10, nb: 10, se: 10, exam: 70 },
          { subject: 'Science', pt: 10, nb: 9, se: 9, exam: 68 },
          { subject: 'Social Science', pt: 9, nb: 9, se: 9, exam: 66 },
          { subject: 'Computer Applications', pt: 10, nb: 10, se: 10, exam: 70 },
        ],
      },
      STU2002: {
        'Term 1': [
          { subject: 'English', pt: 6, nb: 6, se: 5, exam: 35 },
          { subject: 'Hindi', pt: 7, nb: 6, se: 6, exam: 38 },
          { subject: 'Mathematics', pt: 5, nb: 5, se: 5, exam: 30 },
          { subject: 'Science', pt: 6, nb: 6, se: 5, exam: 34 },
          { subject: 'Social Science', pt: 6, nb: 6, se: 6, exam: 36 },
          { subject: 'Computer Applications', pt: 7, nb: 6, se: 6, exam: 40 },
        ],
        'Term 2': [
          { subject: 'English', pt: 6, nb: 7, se: 6, exam: 38 },
          { subject: 'Hindi', pt: 7, nb: 7, se: 6, exam: 41 },
          { subject: 'Mathematics', pt: 5, nb: 6, se: 5, exam: 33 },
          { subject: 'Science', pt: 6, nb: 6, se: 6, exam: 37 },
          { subject: 'Social Science', pt: 6, nb: 7, se: 6, exam: 39 },
          { subject: 'Computer Applications', pt: 7, nb: 7, se: 6, exam: 42 },
        ],
        Annual: [
          { subject: 'English', pt: 6, nb: 7, se: 6, exam: 40 },
          { subject: 'Hindi', pt: 7, nb: 7, se: 7, exam: 43 },
          { subject: 'Mathematics', pt: 6, nb: 6, se: 5, exam: 35 },
          { subject: 'Science', pt: 6, nb: 7, se: 6, exam: 39 },
          { subject: 'Social Science', pt: 7, nb: 7, se: 6, exam: 41 },
          { subject: 'Computer Applications', pt: 7, nb: 7, se: 7, exam: 44 },
        ],
      },
    },
  },
}

// Co-scholastic / discipline grades (3-point: A / B / C)
const CO_SCHOLASTIC_DATA = {
  STU1001: { workEducation: 'A', artEducation: 'A', healthPE: 'A', discipline: 'A' },
  STU1002: { workEducation: 'B', artEducation: 'A', healthPE: 'B', discipline: 'A' },
  STU1003: { workEducation: 'B', artEducation: 'B', healthPE: 'B', discipline: 'B' },
  STU2001: { workEducation: 'A', artEducation: 'A', healthPE: 'A', discipline: 'A' },
  STU2002: { workEducation: 'B', artEducation: 'B', healthPE: 'A', discipline: 'B' },
}

// Attendance per student per term
const ATTENDANCE_DATA = {
  STU1001: { 'Term 1': { workingDays: 110, present: 106 }, 'Term 2': { workingDays: 112, present: 109 }, Annual: { workingDays: 222, present: 215 } },
  STU1002: { 'Term 1': { workingDays: 110, present: 98 }, 'Term 2': { workingDays: 112, present: 101 }, Annual: { workingDays: 222, present: 199 } },
  STU1003: { 'Term 1': { workingDays: 110, present: 92 }, 'Term 2': { workingDays: 112, present: 95 }, Annual: { workingDays: 222, present: 187 } },
  STU2001: { 'Term 1': { workingDays: 110, present: 108 }, 'Term 2': { workingDays: 112, present: 110 }, Annual: { workingDays: 222, present: 218 } },
  STU2002: { 'Term 1': { workingDays: 110, present: 90 }, 'Term 2': { workingDays: 112, present: 94 }, Annual: { workingDays: 222, present: 184 } },
}

// ─── GRADE HELPERS ─────────────────────────────────────────────────────────────
function getGrade(marks, max = 100) {
  const pct = (marks / max) * 100
  if (pct >= 91) return 'A1'
  if (pct >= 81) return 'A2'
  if (pct >= 71) return 'B1'
  if (pct >= 61) return 'B2'
  if (pct >= 51) return 'C1'
  if (pct >= 41) return 'C2'
  if (pct >= 33) return 'D'
  if (pct >= 21) return 'E1'
  return 'E2'
}

const GRADE_STYLES = {
  A1: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  A2: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  B1: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  B2: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  C1: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  C2: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  D:  'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400',
  E1: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  E2: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  A:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  B:  'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  C:  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
}

function GradeBadge({ grade, size = 'md' }) {
  const sizes = {
    sm: 'w-8 h-8 text-[11px]',
    md: 'w-10 h-10 text-[13px]',
    lg: 'w-12 h-12 text-[15px]',
  }
  return (
    <span className={`inline-flex items-center justify-center rounded-xl font-bold tabular-nums ${sizes[size]} ${GRADE_STYLES[grade] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
      {grade}
    </span>
  )
}

// ─── PRIMITIVE COMPONENTS (shared style with Strength Report) ─────────────────
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

// ─── SCHOOL HEADER ─────────────────────────────────────────────────────────────
function SchoolHeader({ session, term }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{SCHOOL_INFO.affiliation}</p>
      <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25">
          <span className="text-[12px] font-bold text-violet-700 dark:text-violet-400">{term}</span>
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Report Card — Class IX
      </p>
    </div>
  )
}

// ─── STUDENT INFO CARD ─────────────────────────────────────────────────────────
function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02] px-3 py-2.5 min-w-0">
      <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{value}</p>
      </div>
    </div>
  )
}

function StudentInfoCard({ student, klass }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <User className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Student Details</span>
      </div>
      <div className="p-4 sm:p-5">
        <div className="flex items-center gap-3 mb-4">
          <span className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center text-[16px] font-extrabold flex-shrink-0">
            {student.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
          </span>
          <div className="min-w-0">
            <p className="text-[16px] font-extrabold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">Class {klass} &middot; Roll No. {student.rollNo}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          <InfoTile icon={IdCard} label="Admission No." value={student.admissionNo} />
          <InfoTile icon={Calendar} label="Date of Birth" value={student.dob} />
          <InfoTile icon={Users} label="Father's Name" value={student.father} />
          <InfoTile icon={Users} label="Mother's Name" value={student.mother} />
          <InfoTile icon={School2} label="Class &amp; Section" value={klass} />
          <InfoTile icon={IdCard} label="Roll No." value={`#${student.rollNo}`} />
        </div>
      </div>
    </div>
  )
}

// Replace the literal "&middot;" / "&amp;" (JSX entities not parsed in template) below at usage sites.
