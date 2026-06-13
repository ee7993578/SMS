/**
 * ShowSyllabus.jsx
 * Folder: src/pages/Student/Syllabus/ShowSyllabus.jsx
 *
 * Converts legacy ASPX "show_syllabus" page to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Syllabus Title, File (Download)
 * Features:
 *  - Class + Subject dropdown filters
 *  - Show button + reset
 *  - Inline PDF preview modal
 *  - Mobile: stacked cards with download CTA
 *  - Desktop: dense ERP-style table
 *  - Loading skeleton, empty state, toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  FileText, Download, BookOpen,
  SlidersHorizontal, Search,
  BarChart3, School2,
  Building2, MapPin, FileDown,
  BookMarked, GraduationCap, Tag,
  ExternalLink, ChevronRight, Info,
  Layers, ClipboardList
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SUBJECTS = [
  'All Subjects',
  'Mathematics', 'Science', 'English', 'Hindi',
  'Social Science', 'Computer Science', 'Sanskrit',
  'Physics', 'Chemistry', 'Biology',
  'Accountancy', 'Business Studies', 'Economics',
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Dummy syllabus data per class
const SYLLABUS_DATA = {
  'Nursery': [
    { id: 1, title: 'Nursery – Annual Syllabus 2025-26', subject: 'All Subjects', file_path: '/syllabi/nursery_annual_2025.pdf', file_type: 'pdf', uploaded: '01 Apr 2025', size: '1.2 MB' },
    { id: 2, title: 'Nursery – Drawing & Art Syllabus', subject: 'Art', file_path: '/syllabi/nursery_art_2025.pdf', file_type: 'pdf', uploaded: '02 Apr 2025', size: '0.8 MB' },
  ],
  'LKG': [
    { id: 1, title: 'LKG – Annual Syllabus 2025-26', subject: 'All Subjects', file_path: '/syllabi/lkg_annual_2025.pdf', file_type: 'pdf', uploaded: '01 Apr 2025', size: '1.4 MB' },
    { id: 2, title: 'LKG – English Syllabus', subject: 'English', file_path: '/syllabi/lkg_eng_2025.pdf', file_type: 'pdf', uploaded: '03 Apr 2025', size: '0.6 MB' },
    { id: 3, title: 'LKG – Mathematics Syllabus', subject: 'Mathematics', file_path: '/syllabi/lkg_math_2025.pdf', file_type: 'pdf', uploaded: '03 Apr 2025', size: '0.5 MB' },
  ],
  'UKG': [
    { id: 1, title: 'UKG – Annual Syllabus 2025-26', subject: 'All Subjects', file_path: '/syllabi/ukg_annual_2025.pdf', file_type: 'pdf', uploaded: '01 Apr 2025', size: '1.5 MB' },
    { id: 2, title: 'UKG – Hindi Syllabus', subject: 'Hindi', file_path: '/syllabi/ukg_hindi_2025.pdf', file_type: 'pdf', uploaded: '04 Apr 2025', size: '0.7 MB' },
  ],
  'Class I': [
    { id: 1, title: 'Class I – English Syllabus Term 1', subject: 'English', file_path: '/syllabi/c1_eng_t1.pdf', file_type: 'pdf', uploaded: '05 Apr 2025', size: '1.1 MB' },
    { id: 2, title: 'Class I – Mathematics Syllabus Term 1', subject: 'Mathematics', file_path: '/syllabi/c1_math_t1.pdf', file_type: 'pdf', uploaded: '05 Apr 2025', size: '1.0 MB' },
    { id: 3, title: 'Class I – Hindi Syllabus Term 1', subject: 'Hindi', file_path: '/syllabi/c1_hindi_t1.pdf', file_type: 'pdf', uploaded: '06 Apr 2025', size: '0.9 MB' },
    { id: 4, title: 'Class I – Annual Syllabus 2025-26', subject: 'All Subjects', file_path: '/syllabi/c1_annual.pdf', file_type: 'pdf', uploaded: '01 Apr 2025', size: '2.3 MB' },
  ],
  'Class V': [
    { id: 1, title: 'Class V – Science Syllabus 2025-26', subject: 'Science', file_path: '/syllabi/c5_sci.pdf', file_type: 'pdf', uploaded: '08 Apr 2025', size: '1.8 MB' },
    { id: 2, title: 'Class V – Mathematics Syllabus 2025-26', subject: 'Mathematics', file_path: '/syllabi/c5_math.pdf', file_type: 'pdf', uploaded: '08 Apr 2025', size: '1.5 MB' },
    { id: 3, title: 'Class V – English Syllabus 2025-26', subject: 'English', file_path: '/syllabi/c5_eng.pdf', file_type: 'pdf', uploaded: '09 Apr 2025', size: '1.2 MB' },
    { id: 4, title: 'Class V – Hindi Syllabus 2025-26', subject: 'Hindi', file_path: '/syllabi/c5_hindi.pdf', file_type: 'pdf', uploaded: '09 Apr 2025', size: '1.1 MB' },
    { id: 5, title: 'Class V – Social Science Syllabus 2025-26', subject: 'Social Science', file_path: '/syllabi/c5_sst.pdf', file_type: 'pdf', uploaded: '10 Apr 2025', size: '1.3 MB' },
  ],
  'Class IX': [
    { id: 1, title: 'Class IX – Mathematics (CBSE) 2025-26', subject: 'Mathematics', file_path: '/syllabi/c9_math.pdf', file_type: 'pdf', uploaded: '10 Apr 2025', size: '2.1 MB' },
    { id: 2, title: 'Class IX – Science (CBSE) 2025-26', subject: 'Science', file_path: '/syllabi/c9_sci.pdf', file_type: 'pdf', uploaded: '10 Apr 2025', size: '2.4 MB' },
    { id: 3, title: 'Class IX – English Language & Literature', subject: 'English', file_path: '/syllabi/c9_eng.pdf', file_type: 'pdf', uploaded: '11 Apr 2025', size: '1.6 MB' },
    { id: 4, title: 'Class IX – Hindi A Syllabus', subject: 'Hindi', file_path: '/syllabi/c9_hindi.pdf', file_type: 'pdf', uploaded: '11 Apr 2025', size: '1.4 MB' },
    { id: 5, title: 'Class IX – Social Science Syllabus', subject: 'Social Science', file_path: '/syllabi/c9_sst.pdf', file_type: 'pdf', uploaded: '12 Apr 2025', size: '2.0 MB' },
    { id: 6, title: 'Class IX – Sanskrit Syllabus', subject: 'Sanskrit', file_path: '/syllabi/c9_sans.pdf', file_type: 'pdf', uploaded: '12 Apr 2025', size: '1.1 MB' },
  ],
  'Class X': [
    { id: 1, title: 'Class X – Mathematics Standard (CBSE)', subject: 'Mathematics', file_path: '/syllabi/c10_math.pdf', file_type: 'pdf', uploaded: '10 Apr 2025', size: '2.3 MB' },
    { id: 2, title: 'Class X – Science (CBSE)', subject: 'Science', file_path: '/syllabi/c10_sci.pdf', file_type: 'pdf', uploaded: '10 Apr 2025', size: '2.6 MB' },
    { id: 3, title: 'Class X – English Language & Literature', subject: 'English', file_path: '/syllabi/c10_eng.pdf', file_type: 'pdf', uploaded: '11 Apr 2025', size: '1.7 MB' },
    { id: 4, title: 'Class X – Hindi A Syllabus', subject: 'Hindi', file_path: '/syllabi/c10_hindi.pdf', file_type: 'pdf', uploaded: '11 Apr 2025', size: '1.5 MB' },
    { id: 5, title: 'Class X – Social Science Syllabus', subject: 'Social Science', file_path: '/syllabi/c10_sst.pdf', file_type: 'pdf', uploaded: '12 Apr 2025', size: '2.1 MB' },
  ],
  'Class XI': [
    { id: 1, title: 'Class XI – Physics (Theory + Practical)', subject: 'Physics', file_path: '/syllabi/c11_phy.pdf', file_type: 'pdf', uploaded: '08 Apr 2025', size: '2.8 MB' },
    { id: 2, title: 'Class XI – Chemistry (Theory + Practical)', subject: 'Chemistry', file_path: '/syllabi/c11_chem.pdf', file_type: 'pdf', uploaded: '08 Apr 2025', size: '2.7 MB' },
    { id: 3, title: 'Class XI – Mathematics Syllabus', subject: 'Mathematics', file_path: '/syllabi/c11_math.pdf', file_type: 'pdf', uploaded: '09 Apr 2025', size: '2.2 MB' },
    { id: 4, title: 'Class XI – Biology (Theory + Practical)', subject: 'Biology', file_path: '/syllabi/c11_bio.pdf', file_type: 'pdf', uploaded: '09 Apr 2025', size: '2.5 MB' },
    { id: 5, title: 'Class XI – English Core Syllabus', subject: 'English', file_path: '/syllabi/c11_eng.pdf', file_type: 'pdf', uploaded: '10 Apr 2025', size: '1.6 MB' },
    { id: 6, title: 'Class XI – Accountancy Syllabus', subject: 'Accountancy', file_path: '/syllabi/c11_acc.pdf', file_type: 'pdf', uploaded: '10 Apr 2025', size: '1.9 MB' },
    { id: 7, title: 'Class XI – Computer Science Syllabus', subject: 'Computer Science', file_path: '/syllabi/c11_cs.pdf', file_type: 'pdf', uploaded: '11 Apr 2025', size: '1.8 MB' },
  ],
  'Class XII': [
    { id: 1, title: 'Class XII – Physics (Theory + Practical)', subject: 'Physics', file_path: '/syllabi/c12_phy.pdf', file_type: 'pdf', uploaded: '08 Apr 2025', size: '3.0 MB' },
    { id: 2, title: 'Class XII – Chemistry (Theory + Practical)', subject: 'Chemistry', file_path: '/syllabi/c12_chem.pdf', file_type: 'pdf', uploaded: '08 Apr 2025', size: '2.9 MB' },
    { id: 3, title: 'Class XII – Mathematics Syllabus', subject: 'Mathematics', file_path: '/syllabi/c12_math.pdf', file_type: 'pdf', uploaded: '09 Apr 2025', size: '2.4 MB' },
    { id: 4, title: 'Class XII – Biology (Theory + Practical)', subject: 'Biology', file_path: '/syllabi/c12_bio.pdf', file_type: 'pdf', uploaded: '09 Apr 2025', size: '2.6 MB' },
    { id: 5, title: 'Class XII – English Core Syllabus', subject: 'English', file_path: '/syllabi/c12_eng.pdf', file_type: 'pdf', uploaded: '10 Apr 2025', size: '1.7 MB' },
    { id: 6, title: 'Class XII – Accountancy Syllabus', subject: 'Accountancy', file_path: '/syllabi/c12_acc.pdf', file_type: 'pdf', uploaded: '10 Apr 2025', size: '2.0 MB' },
    { id: 7, title: 'Class XII – Business Studies', subject: 'Business Studies', file_path: '/syllabi/c12_bs.pdf', file_type: 'pdf', uploaded: '11 Apr 2025', size: '1.9 MB' },
    { id: 8, title: 'Class XII – Economics Syllabus', subject: 'Economics', file_path: '/syllabi/c12_eco.pdf', file_type: 'pdf', uploaded: '11 Apr 2025', size: '2.1 MB' },
  ],
}

// Fill remaining classes with generic data
const fillClass = (cls) => {
  if (SYLLABUS_DATA[cls]) return
  SYLLABUS_DATA[cls] = [
    { id: 1, title: `${cls} – Annual Syllabus 2025-26`, subject: 'All Subjects', file_path: `/syllabi/${cls.toLowerCase().replace(' ', '_')}_annual.pdf`, file_type: 'pdf', uploaded: '05 Apr 2025', size: '1.8 MB' },
    { id: 2, title: `${cls} – Mathematics Syllabus`, subject: 'Mathematics', file_path: `/syllabi/${cls.toLowerCase().replace(' ', '_')}_math.pdf`, file_type: 'pdf', uploaded: '06 Apr 2025', size: '1.2 MB' },
    { id: 3, title: `${cls} – Science Syllabus`, subject: 'Science', file_path: `/syllabi/${cls.toLowerCase().replace(' ', '_')}_sci.pdf`, file_type: 'pdf', uploaded: '07 Apr 2025', size: '1.4 MB' },
    { id: 4, title: `${cls} – English Syllabus`, subject: 'English', file_path: `/syllabi/${cls.toLowerCase().replace(' ', '_')}_eng.pdf`, file_type: 'pdf', uploaded: '07 Apr 2025', size: '1.0 MB' },
  ]
}
CLASSES.forEach(fillClass)

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const SUBJECT_COLORS = {
  'Mathematics':      { fg: '#1d4ed8', bg: '#dbeafe' },
  'Science':          { fg: '#059669', bg: '#d1fae5' },
  'English':          { fg: '#0891b2', bg: '#cffafe' },
  'Hindi':            { fg: '#d97706', bg: '#fef3c7' },
  'Social Science':   { fg: '#7c3aed', bg: '#ede9fe' },
  'Computer Science': { fg: '#0369a1', bg: '#e0f2fe' },
  'Sanskrit':         { fg: '#b45309', bg: '#fef9c3' },
  'Physics':          { fg: '#4f46e5', bg: '#e0e7ff' },
  'Chemistry':        { fg: '#dc2626', bg: '#fee2e2' },
  'Biology':          { fg: '#16a34a', bg: '#dcfce7' },
  'Accountancy':      { fg: '#0f766e', bg: '#ccfbf1' },
  'Business Studies': { fg: '#c2410c', bg: '#ffedd5' },
  'Economics':        { fg: '#6d28d9', bg: '#f3e8ff' },
  'All Subjects':     { fg: '#1e40af', bg: '#eff6ff' },
  'Art':              { fg: '#be185d', bg: '#fce7f3' },
}
const subjectColor = (subj) =>
  SUBJECT_COLORS[subj] ?? { fg: '#475569', bg: '#f1f5f9' }

const subjectAbbr = (subj = '') =>
  subj === 'All Subjects' ? 'ALL' : subj.slice(0, 3).toUpperCase()

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

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ className }) {
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
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <GraduationCap className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">{className}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Syllabus Documents
      </p>
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
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
      </div>
    </div>
  )
}

// ─── DOWNLOAD BUTTON ──────────────────────────────────────────────────────────
function DownloadBtn({ row, onDownload, size = 'normal' }) {
  const [busy, setBusy] = useState(false)

  const handle = () => {
    setBusy(true)
    setTimeout(() => {
      setBusy(false)
      onDownload(row)
    }, 900)
  }

  if (size === 'small') {
    return (
      <button
        onClick={handle}
        disabled={busy}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
          bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
          transition-all active:scale-95 disabled:opacity-70 shadow-sm shadow-blue-500/20"
      >
        {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
        {busy ? 'Downloading…' : 'Download'}
      </button>
    )
  }

  return (
    <button
      onClick={handle}
      disabled={busy}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
        bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
        transition-all active:scale-95 disabled:opacity-70 shadow-md shadow-blue-500/20 w-full justify-center"
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
      {busy ? 'Downloading…' : 'Download File'}
    </button>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onDownload }) {
  const { fg, bg } = subjectColor(row.subject)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Syllabus Title */}
      <td className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5"
            style={{ background: bg, color: fg }}
          >
            {subjectAbbr(row.subject)}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug">{row.title}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: bg, color: fg }}
              >
                <Tag className="w-2.5 h-2.5" />
                {row.subject}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Uploaded: {row.uploaded}</span>
            </div>
          </div>
        </div>
      </td>

      {/* File Size */}
      <td className="px-4 py-3.5 text-center">
        <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400 tabular-nums">{row.size}</span>
      </td>

      {/* Download */}
      <td className="px-4 py-3.5 text-center">
        <DownloadBtn row={row} onDownload={onDownload} size="small" />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onDownload }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = subjectColor(row.subject)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Subject badge */}
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {subjectAbbr(row.subject)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">{row.title}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{row.subject} · {row.size}</p>
        </div>

        {/* PDF icon */}
        <div className="flex flex-col items-center flex-shrink-0 ml-1">
          <FileText className="w-5 h-5 text-rose-500 dark:text-rose-400" />
          <span className="text-[9px] font-bold text-rose-500 dark:text-rose-400 mt-0.5">PDF</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Info rows */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Subject</p>
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{row.subject}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">File Size</p>
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{row.size}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5 col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Uploaded On</p>
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{row.uploaded}</p>
            </div>
          </div>

          {/* Download CTA */}
          <DownloadBtn row={row} onDownload={onDownload} />
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, selectedClass, setSelectedClass, selectedSubject, setSelectedSubject, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
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
        <div className="px-5 py-5 space-y-4">
          <Field label="Class" error={errors.class} required>
            <NativeSelect
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              placeholder="-- Select Class --"
              error={errors.class}
            >
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subject (Optional)">
            <NativeSelect
              value={selectedSubject}
              onChange={e => setSelectedSubject(e.target.value)}
            >
              {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
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
            Show Syllabus
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ShowSyllabus() {
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedSubject, setSelectedSubject] = useState('All Subjects')
  const [rows,            setRows]            = useState([])
  const [loading,         setLoading]         = useState(false)
  const [filterOpen,      setFilterOpen]      = useState(false)
  const [search,          setSearch]          = useState('')
  const [errors,          setErrors]          = useState({})
  const [toast,           setToast]           = useState(null)
  const [shown,           setShown]           = useState(false)
  const [shownClass,      setShownClass]      = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!selectedClass) err.class = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = SYLLABUS_DATA[selectedClass] || []
      setRows(data)
      setShownClass(selectedClass)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} syllabus record(s) for ${selectedClass}.`)
    }, 650)
  }, [selectedClass])

  const handleReset = () => {
    setSelectedClass(''); setSelectedSubject('All Subjects')
    setRows([]); setSearch('')
    setErrors({}); setShown(false); setShownClass('')
  }

  // ── Download placeholder ──────────────────────────────────────────────────
  const handleDownload = (row) => {
    showToast(`Downloading "${row.title}"… (API integration pending)`)
  }

  // ── Search + Subject filter ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = rows
    if (selectedSubject && selectedSubject !== 'All Subjects') {
      result = result.filter(r => r.subject === selectedSubject)
    }
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q)
      )
    }
    return result
  }, [rows, selectedSubject, search])

  // ── Unique subjects for the shown class ──────────────────────────────────
  const availableSubjects = useMemo(() => {
    const unique = [...new Set(rows.map(r => r.subject))]
    return ['All Subjects', ...unique]
  }, [rows])

  const hasResults   = shown && rows.length > 0
  const activeFilters = [selectedClass, selectedSubject !== 'All Subjects' ? selectedSubject : ''].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Syllabus
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and download class-wise syllabus documents.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Class" error={errors.class} required>
              <NativeSelect
                value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setErrors(p => ({ ...p, class: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.class}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Subject">
              <NativeSelect
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              >
                {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacer */}
            <div />

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
          {selectedClass ? selectedClass : 'Select Class'}
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
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSubject={selectedSubject}
        setSelectedSubject={setSelectedSubject}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader className={shownClass} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={ClipboardList} label="Total Documents"  value={filtered.length}                              color="blue"    />
            <SummaryCard icon={BookOpen}      label="Total for Class"  value={rows.length}                                  color="emerald" />
            <SummaryCard icon={Layers}        label="Subjects Covered" value={availableSubjects.length - 1}                 color="amber"   />
            <SummaryCard icon={GraduationCap} label="Current Class"    value={shownClass.replace('Class ', 'Cls ')}          color="violet"  />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Syllabus Documents</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownClass}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} file{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Subject quick-filter chips — desktop */}
              <div className="hidden sm:flex items-center gap-1.5 flex-wrap flex-shrink-0 max-w-xs">
                {availableSubjects.slice(0, 5).map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSubject(s)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all
                      ${selectedSubject === s
                        ? 'bg-blue-600 text-white dark:bg-indigo-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
                  >
                    {s === 'All Subjects' ? 'All' : s.slice(0, 8)}
                  </button>
                ))}
                {availableSubjects.length > 6 && (
                  <span className="text-[11px] text-slate-400">+{availableSubjects.length - 6} more</span>
                )}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search title or subject…"
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

            {/* Subject filter chips — MOBILE */}
            <div className="sm:hidden px-4 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] overflow-x-auto">
              <div className="flex gap-1.5 w-max">
                {availableSubjects.map(s => (
                  <button
                    key={s}
                    onClick={() => setSelectedSubject(s)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all
                      ${selectedSubject === s
                        ? 'bg-blue-600 text-white dark:bg-indigo-600'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}
                  >
                    {s === 'All Subjects' ? 'All' : s}
                  </button>
                ))}
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Click <strong>Download</strong> to save the syllabus PDF. Tap a row for more options.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No syllabus records match your filter.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Syllabus Title', 'Size', 'Download'].map((h, i) => (
                        <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                          ${i === 0 ? 'text-center w-12' : i >= 2 ? 'text-center' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.id} row={row} idx={i + 1} onDownload={handleDownload} />
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
                  <span className="text-[13px]">No records match your filter.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to expand and download.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={row.id} row={row} idx={i + 1} onDownload={handleDownload} />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> documents
              </p>
              {(search || selectedSubject !== 'All Subjects') && (
                <button
                  onClick={() => { setSearch(''); setSelectedSubject('All Subjects') }}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear filters
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
            <BookMarked className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No syllabus loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a class and click <strong>Show</strong> to view available syllabus documents.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
