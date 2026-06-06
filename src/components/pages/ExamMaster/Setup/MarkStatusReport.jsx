/**
 * MarkStatusReport.jsx
 * Folder: src/pages/Reports/MarkStatusReport.jsx
 *
 * Converts legacy ASPX "MarkStatus Report" to fully-responsive React + Tailwind.
 *
 * Filters: Session, Class, Section, Exam Type
 * Columns: S.No, Class Name, Subject Code, Subjects, Sub Subjects
 * Features:
 *  - 4 dropdown filters (Session, Class, Section, Exam)
 *  - Show + Export buttons
 *  - Desktop: ERP-style dense table
 *  - Mobile: accordion cards, filter drawer
 *  - Search within results
 *  - Grand total / record count
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, Search, SlidersHorizontal,
  FileSpreadsheet, BookOpen, BarChart3, Info,
  BookMarked, Hash, Layers, GraduationCap, School2,
  ClipboardList, Tag
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SECTIONS = ['A', 'B', 'C', 'D']

const EXAM_TYPES = [
  'Unit Test 1', 'Unit Test 2', 'Half Yearly', 'Annual Exam',
  'Pre-Board', 'Quarterly', 'Monthly Test',
]

// Subject data mapped by class
const SUBJECTS_DATA = {
  'Nursery': [
    { class: 'Nursery', subject_code: 'NUR01', subject: 'English', subsubject: 'Reading' },
    { class: 'Nursery', subject_code: 'NUR02', subject: 'Hindi',   subsubject: 'Writing' },
    { class: 'Nursery', subject_code: 'NUR03', subject: 'Maths',   subsubject: 'Counting' },
    { class: 'Nursery', subject_code: 'NUR04', subject: 'EVS',     subsubject: 'Drawing' },
  ],
  'LKG': [
    { class: 'LKG', subject_code: 'LKG01', subject: 'English',  subsubject: 'Phonics' },
    { class: 'LKG', subject_code: 'LKG02', subject: 'Hindi',    subsubject: 'Varnamala' },
    { class: 'LKG', subject_code: 'LKG03', subject: 'Maths',    subsubject: 'Numbers' },
    { class: 'LKG', subject_code: 'LKG04', subject: 'GK',       subsubject: 'General Awareness' },
  ],
  'UKG': [
    { class: 'UKG', subject_code: 'UKG01', subject: 'English',  subsubject: 'Reading & Writing' },
    { class: 'UKG', subject_code: 'UKG02', subject: 'Hindi',    subsubject: 'Lekhan' },
    { class: 'UKG', subject_code: 'UKG03', subject: 'Maths',    subsubject: 'Addition' },
    { class: 'UKG', subject_code: 'UKG04', subject: 'Drawing',  subsubject: 'Colour & Art' },
  ],
  'Class I': [
    { class: 'Class I', subject_code: 'C101', subject: 'English',  subsubject: 'Grammar' },
    { class: 'Class I', subject_code: 'C102', subject: 'Hindi',    subsubject: 'Vyakaran' },
    { class: 'Class I', subject_code: 'C103', subject: 'Maths',    subsubject: 'Arithmetic' },
    { class: 'Class I', subject_code: 'C104', subject: 'EVS',      subsubject: 'Environment' },
    { class: 'Class I', subject_code: 'C105', subject: 'GK',       subsubject: 'Awareness' },
  ],
  'Class II': [
    { class: 'Class II', subject_code: 'C201', subject: 'English',  subsubject: 'Grammar' },
    { class: 'Class II', subject_code: 'C202', subject: 'Hindi',    subsubject: 'Vyakaran' },
    { class: 'Class II', subject_code: 'C203', subject: 'Maths',    subsubject: 'Arithmetic' },
    { class: 'Class II', subject_code: 'C204', subject: 'EVS',      subsubject: 'Environment' },
    { class: 'Class II', subject_code: 'C205', subject: 'Drawing',  subsubject: 'Art' },
  ],
  'Class III': [
    { class: 'Class III', subject_code: 'C301', subject: 'English',  subsubject: 'Grammar & Composition' },
    { class: 'Class III', subject_code: 'C302', subject: 'Hindi',    subsubject: 'Vyakaran' },
    { class: 'Class III', subject_code: 'C303', subject: 'Maths',    subsubject: 'Arithmetic' },
    { class: 'Class III', subject_code: 'C304', subject: 'Science',  subsubject: 'General Science' },
    { class: 'Class III', subject_code: 'C305', subject: 'Social Studies', subsubject: 'History & Civics' },
  ],
  'Class IV': [
    { class: 'Class IV', subject_code: 'C401', subject: 'English',  subsubject: 'Grammar & Composition' },
    { class: 'Class IV', subject_code: 'C402', subject: 'Hindi',    subsubject: 'Vyakaran' },
    { class: 'Class IV', subject_code: 'C403', subject: 'Maths',    subsubject: 'Arithmetic' },
    { class: 'Class IV', subject_code: 'C404', subject: 'Science',  subsubject: 'General Science' },
    { class: 'Class IV', subject_code: 'C405', subject: 'Social Studies', subsubject: 'Geography' },
  ],
  'Class V': [
    { class: 'Class V', subject_code: 'C501', subject: 'English',  subsubject: 'Grammar & Composition' },
    { class: 'Class V', subject_code: 'C502', subject: 'Hindi',    subsubject: 'Vyakaran' },
    { class: 'Class V', subject_code: 'C503', subject: 'Maths',    subsubject: 'Arithmetic' },
    { class: 'Class V', subject_code: 'C504', subject: 'Science',  subsubject: 'General Science' },
    { class: 'Class V', subject_code: 'C505', subject: 'Social Studies', subsubject: 'History & Geo' },
  ],
  'Class VI': [
    { class: 'Class VI', subject_code: 'C601', subject: 'English',  subsubject: 'Literature & Grammar' },
    { class: 'Class VI', subject_code: 'C602', subject: 'Hindi',    subsubject: 'Sahitya & Vyakaran' },
    { class: 'Class VI', subject_code: 'C603', subject: 'Maths',    subsubject: 'Algebra & Geometry' },
    { class: 'Class VI', subject_code: 'C604', subject: 'Science',  subsubject: 'Physics & Chemistry' },
    { class: 'Class VI', subject_code: 'C605', subject: 'Social Science', subsubject: 'History' },
    { class: 'Class VI', subject_code: 'C606', subject: 'Sanskrit', subsubject: 'Prathamik' },
  ],
  'Class VII': [
    { class: 'Class VII', subject_code: 'C701', subject: 'English',  subsubject: 'Literature & Grammar' },
    { class: 'Class VII', subject_code: 'C702', subject: 'Hindi',    subsubject: 'Sahitya & Vyakaran' },
    { class: 'Class VII', subject_code: 'C703', subject: 'Maths',    subsubject: 'Algebra & Geometry' },
    { class: 'Class VII', subject_code: 'C704', subject: 'Science',  subsubject: 'Biology & Chemistry' },
    { class: 'Class VII', subject_code: 'C705', subject: 'Social Science', subsubject: 'Geography' },
    { class: 'Class VII', subject_code: 'C706', subject: 'Sanskrit', subsubject: 'Madhyamik' },
  ],
  'Class VIII': [
    { class: 'Class VIII', subject_code: 'C801', subject: 'English',  subsubject: 'Literature & Grammar' },
    { class: 'Class VIII', subject_code: 'C802', subject: 'Hindi',    subsubject: 'Sahitya' },
    { class: 'Class VIII', subject_code: 'C803', subject: 'Maths',    subsubject: 'Algebra & Geometry' },
    { class: 'Class VIII', subject_code: 'C804', subject: 'Science',  subsubject: 'Physics, Chemistry & Bio' },
    { class: 'Class VIII', subject_code: 'C805', subject: 'Social Science', subsubject: 'Civics & History' },
    { class: 'Class VIII', subject_code: 'C806', subject: 'Sanskrit', subsubject: 'Uchch Madhyamik' },
  ],
  'Class IX': [
    { class: 'Class IX', subject_code: 'C901', subject: 'English',  subsubject: 'Language & Literature' },
    { class: 'Class IX', subject_code: 'C902', subject: 'Hindi A',  subsubject: 'Kshitij & Sparsh' },
    { class: 'Class IX', subject_code: 'C903', subject: 'Maths',    subsubject: 'NCERT Standard' },
    { class: 'Class IX', subject_code: 'C904', subject: 'Science',  subsubject: 'Physics, Chemistry & Bio' },
    { class: 'Class IX', subject_code: 'C905', subject: 'Social Science', subsubject: 'History & Geo & Eco' },
    { class: 'Class IX', subject_code: 'C906', subject: 'Sanskrit', subsubject: 'Shemushi' },
  ],
  'Class X': [
    { class: 'Class X', subject_code: 'C1001', subject: 'English',  subsubject: 'Language & Literature' },
    { class: 'Class X', subject_code: 'C1002', subject: 'Hindi A',  subsubject: 'Kshitij & Kritika' },
    { class: 'Class X', subject_code: 'C1003', subject: 'Maths Standard', subsubject: 'NCERT Standard' },
    { class: 'Class X', subject_code: 'C1004', subject: 'Science',  subsubject: 'Physics, Chemistry & Bio' },
    { class: 'Class X', subject_code: 'C1005', subject: 'Social Science', subsubject: 'History & Geo & Eco' },
    { class: 'Class X', subject_code: 'C1006', subject: 'Sanskrit', subsubject: 'Shemushi Dwitiya' },
  ],
  'Class XI': [
    { class: 'Class XI', subject_code: 'C1101', subject: 'English Core', subsubject: 'Literature' },
    { class: 'Class XI', subject_code: 'C1102', subject: 'Physics',      subsubject: 'Mechanics & Optics' },
    { class: 'Class XI', subject_code: 'C1103', subject: 'Chemistry',    subsubject: 'Organic & Inorganic' },
    { class: 'Class XI', subject_code: 'C1104', subject: 'Maths',        subsubject: 'Calculus & Algebra' },
    { class: 'Class XI', subject_code: 'C1105', subject: 'Biology',      subsubject: 'Botany & Zoology' },
    { class: 'Class XI', subject_code: 'C1106', subject: 'Hindi Core',   subsubject: 'Aroh' },
  ],
  'Class XII': [
    { class: 'Class XII', subject_code: 'C1201', subject: 'English Core', subsubject: 'Flamingo & Vistas' },
    { class: 'Class XII', subject_code: 'C1202', subject: 'Physics',      subsubject: 'Electrostatics & Modern' },
    { class: 'Class XII', subject_code: 'C1203', subject: 'Chemistry',    subsubject: 'Organic & Inorganic' },
    { class: 'Class XII', subject_code: 'C1204', subject: 'Maths',        subsubject: 'Calculus & Vectors' },
    { class: 'Class XII', subject_code: 'C1205', subject: 'Biology',      subsubject: 'Genetics & Ecology' },
    { class: 'Class XII', subject_code: 'C1206', subject: 'Hindi Core',   subsubject: 'Aroh Bhag 2' },
  ],
}

// Get sections based on class
const getSections = (cls) => {
  const multiSection = ['Nursery','LKG','UKG','Class I','Class II','Class VI','Class IX','Class XI','Class XII']
  return multiSection.includes(cls) ? ['A', 'B'] : ['A']
}

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const SUBJECT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe', light: '#eff6ff' },
  { fg: '#7c3aed', bg: '#ede9fe', light: '#f5f3ff' },
  { fg: '#0891b2', bg: '#cffafe', light: '#ecfeff' },
  { fg: '#059669', bg: '#d1fae5', light: '#ecfdf5' },
  { fg: '#d97706', bg: '#fef3c7', light: '#fffbeb' },
  { fg: '#dc2626', bg: '#fee2e2', light: '#fff1f1' },
  { fg: '#0369a1', bg: '#e0f2fe', light: '#f0f9ff' },
]
const subjectColor = (name = '') => SUBJECT_COLORS[(name.charCodeAt(0) ?? 0) % SUBJECT_COLORS.length]

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

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
function Breadcrumb() {
  return (
    <nav className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400 mb-1">
      <span className="text-blue-600 dark:text-indigo-400 font-semibold hover:underline cursor-pointer">Fee</span>
      <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
      <span className="text-slate-700 dark:text-slate-200 font-semibold">MarkStatus Report</span>
    </nav>
  )
}

// ─── SUMMARY CARDS ────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-4.5 h-4.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = subjectColor(row.subject)
  const abbr = (row.subject || '').slice(0, 3).toUpperCase()

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Class Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: '#dbeafe', color: '#1d4ed8' }}>
            {(row.class || '').replace('Class ', '').slice(0, 3).toUpperCase()}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {row.class}
          </span>
        </div>
      </td>

      {/* Subject Code */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold
          bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-mono tracking-wide">
          <Hash className="w-3 h-3 opacity-60" />
          {row.subject_code}
        </span>
      </td>

      {/* Subjects */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}>
            {abbr}
          </span>
          <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{row.subject}</span>
        </div>
      </td>

      {/* Sub Subjects */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-medium
          bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 max-w-[180px] truncate">
          <Layers className="w-3 h-3 flex-shrink-0 opacity-70" />
          <span className="truncate">{row.subsubject}</span>
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE SUBJECT CARD ──────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = subjectColor(row.subject)
  const abbr = (row.subject || '').slice(0, 3).toUpperCase()

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Subject Badge */}
        <span className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {abbr}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.subject}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1 truncate">
            <Hash className="w-3 h-3 flex-shrink-0" />
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{row.subject_code}</span>
            <span className="mx-1">·</span>
            <span>{row.class}</span>
          </p>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3"
          style={{ animation: 'fadeIn .18s ease' }}>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>

          <div className="grid grid-cols-2 gap-2">
            {/* Class */}
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Class</span>
              </div>
              <p className="text-[14px] font-bold text-blue-700 dark:text-blue-300">{row.class}</p>
            </div>

            {/* Subject Code */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Tag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Code</span>
              </div>
              <p className="text-[14px] font-bold font-mono text-slate-700 dark:text-slate-300">{row.subject_code}</p>
            </div>
          </div>

          {/* Sub Subject */}
          <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <Layers className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
              <span className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">Sub Subject</span>
            </div>
            <p className="text-[14px] font-semibold text-violet-700 dark:text-violet-300">{row.subsubject}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilter, availableSections, onShow, loading, errors }) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 grid grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto">
          <div className="col-span-2">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)} placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
          </div>
          <div className="col-span-2">
            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={filters.cls} onChange={e => { setFilter('cls', e.target.value); setFilter('section', '') }} placeholder="-- Select Class --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
          </div>
          <Field label="Section">
            <NativeSelect value={filters.section} onChange={e => setFilter('section', e.target.value)} placeholder="-- All --">
              {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Exam Type">
            <NativeSelect value={filters.exam} onChange={e => setFilter('exam', e.target.value)} placeholder="-- All --">
              {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>
        </div>

        {/* Footer Buttons */}
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
export default function MarkStatusReport() {
  const [filters, setFilters] = useState({ session: '', cls: '', section: '', exam: '' })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [shown, setShown] = useState(false)
  const [shownInfo, setShownInfo] = useState({})

  const setFilter = (key, val) => {
    setFilters(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: undefined }))
  }

  const availableSections = useMemo(() => filters.cls ? getSections(filters.cls) : SECTIONS, [filters.cls])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Show / Fetch ────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Please select a session'
    if (!filters.cls) err.cls = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = SUBJECTS_DATA[filters.cls] || []
      setRows(data)
      setShownInfo({ ...filters })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} subjects for ${filters.cls} — Session ${filters.session}`)
    }, 600)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', cls: '', section: '', exam: '' })
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownInfo({})
  }

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search Filter ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.subject?.toLowerCase().includes(q) ||
      r.subject_code?.toLowerCase().includes(q) ||
      r.subsubject?.toLowerCase().includes(q) ||
      r.class?.toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults = shown && rows.length > 0

  // Active filter count for mobile badge
  const activeCount = Object.values(filters).filter(Boolean).length

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-10">

      {/* Breadcrumb + Title */}
      <div>
        <Breadcrumb />
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mt-1">
          <div>
            <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
              MarkStatus Report
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Class-wise subject &amp; sub-subject mapping for examination mark entry.
            </p>
          </div>

          {/* Desktop Export Button */}
          {hasResults && (
            <button type="button" onClick={handleExport} disabled={exporting}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Export
            </button>
          )}
        </div>
      </div>

      {/* ── DESKTOP FILTER CARD ──────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Select Class" error={errors.cls} required>
              <NativeSelect value={filters.cls}
                onChange={e => { setFilter('cls', e.target.value); setFilter('section', '') }}
                placeholder="-- Select Class --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Section */}
            <Field label="Select Section">
              <NativeSelect value={filters.section} onChange={e => setFilter('section', e.target.value)}
                placeholder="-- All Sections --">
                {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Exam Type */}
            <Field label="Select Exam">
              <NativeSelect value={filters.exam} onChange={e => setFilter('exam', e.target.value)}
                placeholder="-- All Exams --">
                {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button type="button" onClick={handleShow} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show
            </button>
            <button type="button" onClick={handleExport} disabled={exporting || !hasResults}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Export
            </button>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER BAR ────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {filters.cls ? `${filters.cls} · ${filters.session || 'No Session'}` : 'Select Filters'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
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

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        availableSections={availableSections}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── LOADING SKELETON ──────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── RESULTS ───────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Context Header Banner */}
          <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <School2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{shownInfo.cls}</span>
              </div>
              {shownInfo.section && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  Section {shownInfo.section}
                </span>
              )}
              {shownInfo.exam && (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                  {shownInfo.exam}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                Session: {shownInfo.session}
              </span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={BookOpen}    label="Total Subjects"  value={rows.length}             color="blue"    />
            <SummaryCard icon={BookMarked}  label="Filtered"        value={filtered.length}          color="emerald" />
            <SummaryCard icon={Layers}      label="Sub Subjects"    value={filtered.length}          color="violet"  />
            <SummaryCard icon={Hash}        label="Subject Codes"   value={filtered.length}          color="amber"   />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Subject List</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownInfo.cls}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} subject{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search Box */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search subjects…"
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

            {/* Hint Row */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Showing subjects and sub-subjects mapped for <strong>{shownInfo.cls}</strong> · Exam: <strong>{shownInfo.exam || 'All'}</strong>
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No subjects match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Class Name', 'Subject Code', 'Subject', 'Sub Subject'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.subject_code}-${i}`} row={row} idx={i + 1} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No subjects match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full subject details.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.subject_code}-${i}`} row={row} idx={i + 1} />
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> subjects
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

      {/* ── EMPTY STATE ───────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Select a <strong>Session</strong> and <strong>Class</strong>, then click <strong>Show</strong> to generate the MarkStatus report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
