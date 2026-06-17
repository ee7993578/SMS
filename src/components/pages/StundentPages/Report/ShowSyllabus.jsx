/**
 * ShowSyllabus.jsx
 * Folder: src/pages/Student/Syllabus/ShowSyllabus.jsx
 *
 * Converts legacy ASPX "show_syllabus.aspx" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class & Subject filter dropdowns
 *  - Search bar with instant filtering
 *  - Desktop: clean ERP-style table with download actions
 *  - Mobile: card-based layout with expandable file preview
 *  - PDF inline viewer modal (replaces ASPX LinkButton "Show")
 *  - Download button (replaces ASPX ImageButton)
 *  - Loading skeleton & empty states
 *  - Toast notifications
 *  - Mobile bottom-sheet filter drawer
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BookOpen, Download, Eye, Search, Filter,
  RefreshCw, X, Check, AlertCircle, Loader2,
  ChevronDown, SlidersHorizontal, FileText,
  GraduationCap, BookMarked, FolderOpen,
  Info, ChevronRight, ExternalLink, File,
  Layers, Tag, Clock, School2
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
  'Physical Education', 'Drawing & Craft',
]

const SYLLABUS_DATA = [
  { id: 1,  class: 'Class VI',  subject: 'Mathematics',     title: 'Mathematics Syllabus Term 1 & 2', uploaded: '12 Apr 2025', size: '1.2 MB', file_path: '/syllabus/class6_math.pdf',   type: 'pdf' },
  { id: 2,  class: 'Class VI',  subject: 'Science',         title: 'Science Syllabus – Full Year',    uploaded: '10 Apr 2025', size: '980 KB', file_path: '/syllabus/class6_sci.pdf',    type: 'pdf' },
  { id: 3,  class: 'Class VI',  subject: 'English',         title: 'English Literature & Grammar',    uploaded: '10 Apr 2025', size: '760 KB', file_path: '/syllabus/class6_eng.pdf',    type: 'pdf' },
  { id: 4,  class: 'Class VI',  subject: 'Hindi',           title: 'Hindi Vyakaran aur Sahitya',      uploaded: '11 Apr 2025', size: '840 KB', file_path: '/syllabus/class6_hindi.pdf',  type: 'pdf' },
  { id: 5,  class: 'Class VII', subject: 'Mathematics',     title: 'Mathematics Syllabus 2025-26',    uploaded: '15 Apr 2025', size: '1.4 MB', file_path: '/syllabus/class7_math.pdf',   type: 'pdf' },
  { id: 6,  class: 'Class VII', subject: 'Science',         title: 'Science – Chapter-wise Plan',     uploaded: '14 Apr 2025', size: '1.1 MB', file_path: '/syllabus/class7_sci.pdf',    type: 'pdf' },
  { id: 7,  class: 'Class VII', subject: 'Social Science',  title: 'SST Geography, History & Civics', uploaded: '14 Apr 2025', size: '900 KB', file_path: '/syllabus/class7_sst.pdf',    type: 'pdf' },
  { id: 8,  class: 'Class VIII',subject: 'Mathematics',     title: 'Class VIII Maths Detailed Plan',  uploaded: '16 Apr 2025', size: '1.5 MB', file_path: '/syllabus/class8_math.pdf',   type: 'pdf' },
  { id: 9,  class: 'Class VIII',subject: 'Science',         title: 'Science Full Syllabus Doc',       uploaded: '16 Apr 2025', size: '1.3 MB', file_path: '/syllabus/class8_sci.pdf',    type: 'pdf' },
  { id: 10, class: 'Class IX',  subject: 'Mathematics',     title: 'Class IX Maths – CBSE 2025-26',   uploaded: '18 Apr 2025', size: '1.8 MB', file_path: '/syllabus/class9_math.pdf',   type: 'pdf' },
  { id: 11, class: 'Class IX',  subject: 'Science',         title: 'Physics, Chemistry & Biology',    uploaded: '18 Apr 2025', size: '2.1 MB', file_path: '/syllabus/class9_sci.pdf',    type: 'pdf' },
  { id: 12, class: 'Class IX',  subject: 'English',         title: 'Beehive & Moments Syllabus',      uploaded: '17 Apr 2025', size: '870 KB', file_path: '/syllabus/class9_eng.pdf',    type: 'pdf' },
  { id: 13, class: 'Class X',   subject: 'Mathematics',     title: 'Class X Maths Board Prep',        uploaded: '20 Apr 2025', size: '2.2 MB', file_path: '/syllabus/class10_math.pdf',  type: 'pdf' },
  { id: 14, class: 'Class X',   subject: 'Science',         title: 'Class X Science – Full Year',     uploaded: '20 Apr 2025', size: '1.9 MB', file_path: '/syllabus/class10_sci.pdf',   type: 'pdf' },
  { id: 15, class: 'Class X',   subject: 'Social Science',  title: 'SST Board Exam Syllabus 2025',    uploaded: '19 Apr 2025', size: '1.6 MB', file_path: '/syllabus/class10_sst.pdf',   type: 'pdf' },
  { id: 16, class: 'Class XI',  subject: 'Physics',         title: 'Physics Syllabus XI – 2025-26',   uploaded: '22 Apr 2025', size: '2.5 MB', file_path: '/syllabus/class11_phy.pdf',   type: 'pdf' },
  { id: 17, class: 'Class XI',  subject: 'Chemistry',       title: 'Chemistry Detailed Chapter Map',  uploaded: '22 Apr 2025', size: '2.3 MB', file_path: '/syllabus/class11_chem.pdf',  type: 'pdf' },
  { id: 18, class: 'Class XI',  subject: 'Mathematics',     title: 'Class XI Maths Full Syllabus',    uploaded: '21 Apr 2025', size: '2.0 MB', file_path: '/syllabus/class11_math.pdf',  type: 'pdf' },
  { id: 19, class: 'Class XII', subject: 'Physics',         title: 'Physics Board Exam Syllabus',     uploaded: '25 Apr 2025', size: '2.8 MB', file_path: '/syllabus/class12_phy.pdf',   type: 'pdf' },
  { id: 20, class: 'Class XII', subject: 'Chemistry',       title: 'Chemistry XII Full Syllabus',     uploaded: '25 Apr 2025', size: '2.6 MB', file_path: '/syllabus/class12_chem.pdf',  type: 'pdf' },
  { id: 21, class: 'Class XII', subject: 'Mathematics',     title: 'Class XII Maths Board Prep Plan', uploaded: '24 Apr 2025', size: '2.4 MB', file_path: '/syllabus/class12_math.pdf',  type: 'pdf' },
  { id: 22, class: 'Class XII', subject: 'Biology',         title: 'Biology Syllabus 2025-26',        uploaded: '24 Apr 2025', size: '2.1 MB', file_path: '/syllabus/class12_bio.pdf',   type: 'pdf' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const SUBJECT_COLORS = {
  'Mathematics':      { fg: '#1d4ed8', bg: '#dbeafe' },
  'Science':          { fg: '#059669', bg: '#d1fae5' },
  'English':          { fg: '#7c3aed', bg: '#ede9fe' },
  'Hindi':            { fg: '#dc2626', bg: '#fee2e2' },
  'Social Science':   { fg: '#0891b2', bg: '#cffafe' },
  'Computer Science': { fg: '#0369a1', bg: '#e0f2fe' },
  'Physics':          { fg: '#d97706', bg: '#fef3c7' },
  'Chemistry':        { fg: '#7c3aed', bg: '#ede9fe' },
  'Biology':          { fg: '#059669', bg: '#d1fae5' },
  'Accountancy':      { fg: '#be185d', bg: '#fce7f3' },
  'Business Studies': { fg: '#b45309', bg: '#fef3c7' },
  'Economics':        { fg: '#065f46', bg: '#d1fae5' },
  'Sanskrit':         { fg: '#c2410c', bg: '#ffedd5' },
  'Physical Education':{ fg: '#0369a1', bg: '#e0f2fe' },
  'Drawing & Craft':  { fg: '#9333ea', bg: '#f3e8ff' },
}

const subjectColor = (s) =>
  SUBJECT_COLORS[s] || { fg: '#475569', bg: '#f1f5f9' }

const subjectAbbr = (s = '') => s.slice(0, 3).toUpperCase()

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

// ─── PDF PREVIEW MODAL ────────────────────────────────────────────────────────
function PreviewModal({ item, onClose }) {
  if (!item) return null
  const { fg, bg } = subjectColor(item.subject)
  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed inset-4 sm:inset-8 md:inset-16 z-50 flex flex-col rounded-2xl bg-white dark:bg-[#1a1f35] shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden"
        style={{ animation: 'modalIn .2s ease' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}`}</style>

        {/* Modal Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] flex-shrink-0">
          <span
            className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {subjectAbbr(item.subject)}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{item.title}</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">{item.class} · {item.subject}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF Viewer area (placeholder — real impl: embed iframe with pdf url) */}
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-100 dark:bg-[#111525] gap-4 p-6 overflow-auto">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
            <FileText className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="text-center max-w-sm">
            <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200 mb-1">{item.title}</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mb-4">
              {item.file_path} · {item.size}
            </p>
            {/* In production: replace with <iframe src={item.file_path} className="w-full h-full" /> */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href={item.file_path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20"
              >
                <ExternalLink className="w-4 h-4" /> Open PDF
              </a>
              <button
                onClick={() => {
                  const link = document.createElement('a')
                  link.href = item.file_path
                  link.download = item.title + '.pdf'
                  link.click()
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-emerald-600 text-white hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20"
              >
                <Download className="w-4 h-4" /> Download
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-shrink-0">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Uploaded: {item.uploaded} · Size: {item.size}
          </p>
          <button
            onClick={onClose}
            className="text-[12px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            Close
          </button>
        </div>
      </div>
    </>
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

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onShow, onDownload }) {
  const { fg, bg } = subjectColor(row.subject)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class}</span>
        </div>
      </td>

      {/* Subject */}
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          <span className="text-[9px] font-bold opacity-70">{subjectAbbr(row.subject)}</span>
          {row.subject}
        </span>
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[13px] text-slate-700 dark:text-slate-200 font-medium truncate max-w-[220px]">{row.title}</span>
        </div>
      </td>

      {/* Uploaded */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 text-[12px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
          <Clock className="w-3 h-3" />
          {row.uploaded}
        </div>
      </td>

      {/* Size */}
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] text-slate-400 dark:text-slate-500">{row.size}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-center">
          <button
            onClick={() => onShow(row)}
            title="Preview Syllabus"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100
              dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" /> Show
          </button>
          <button
            onClick={() => onDownload(row)}
            title="Download Syllabus"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-emerald-50 text-emerald-700 hover:bg-emerald-100
              dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onShow, onDownload }) {
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
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-1">
            {row.title}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
            <GraduationCap className="w-3 h-3 flex-shrink-0" />
            {row.class}
            <span className="mx-1 opacity-40">·</span>
            <span style={{ color: fg, fontWeight: 600 }}>{row.subject}</span>
          </p>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Quick meta row */}
      <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3" /> {row.uploaded}
        </span>
        <span className="text-[10px] text-slate-400 flex items-center gap-1">
          <File className="w-3 h-3" /> {row.size}
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: bg, color: fg }}
        >
          {row.type.toUpperCase()}
        </span>
      </div>

      {/* Expanded actions */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Full title */}
          <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">Syllabus Title</p>
            <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{row.title}</p>
          </div>

          {/* File path */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/[0.02] rounded-lg px-3 py-2 border border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
            <FolderOpen className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate font-mono">{row.file_path}</span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => onShow(row)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95 shadow-md shadow-blue-500/20"
            >
              <Eye className="w-4 h-4" /> Preview
            </button>
            <button
              onClick={() => onDownload(row)}
              className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
            >
              <Download className="w-4 h-4" /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filterClass, setFilterClass, filterSubject, setFilterSubject, onApply, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filter Syllabus</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Class" error={errors.filterClass} required>
            <NativeSelect
              value={filterClass}
              onChange={e => setFilterClass(e.target.value)}
              placeholder="-- Select Class --"
              error={errors.filterClass}
            >
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subject">
            <NativeSelect
              value={filterSubject}
              onChange={e => setFilterSubject(e.target.value)}
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
          <button type="button" onClick={() => { onApply(); onClose() }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all">
            <Eye className="w-4 h-4" /> Show Syllabus
          </button>
        </div>
      </div>
    </>
  )
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
      <div className="h-8 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse w-48 mb-4" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ShowSyllabus() {
  const [filterClass,   setFilterClass]   = useState('')
  const [filterSubject, setFilterSubject] = useState('All Subjects')
  const [search,        setSearch]        = useState('')
  const [rows,          setRows]          = useState([])
  const [loading,       setLoading]       = useState(false)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [errors,        setErrors]        = useState({})
  const [toast,         setToast]         = useState(null)
  const [shown,         setShown]         = useState(false)
  const [preview,       setPreview]       = useState(null)
  const [shownClass,    setShownClass]    = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Fetch (simulate API) ─────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filterClass) err.filterClass = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = SYLLABUS_DATA.filter(d => d.class === filterClass)
      if (filterSubject && filterSubject !== 'All Subjects') {
        data = data.filter(d => d.subject === filterSubject)
      }
      setRows(data)
      setShownClass(filterClass)
      setShown(true)
      setLoading(false)
      if (data.length === 0) {
        showToast(`No syllabus found for ${filterClass}.`, 'error')
      } else {
        showToast(`Found ${data.length} syllabus document${data.length !== 1 ? 's' : ''} for ${filterClass}.`)
      }
    }, 600)
  }, [filterClass, filterSubject])

  const handleReset = () => {
    setFilterClass(''); setFilterSubject('All Subjects')
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownClass('')
  }

  // ── Download handler ─────────────────────────────────────────────────────
  const handleDownload = (row) => {
    // In production: trigger actual file download
    showToast(`Downloading: ${row.title}`)
  }

  // ── Preview handler ──────────────────────────────────────────────────────
  const handleShow_row = (row) => setPreview(row)

  // ── Search filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults   = shown && rows.length > 0
  const activeFilters = [filterClass, filterSubject !== 'All Subjects' ? filterSubject : ''].filter(Boolean).length

  // Unique subjects in current result for quick filter chips
  const resultSubjects = useMemo(() =>
    [...new Set(rows.map(r => r.subject))], [rows])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Syllabus
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and download class syllabus documents.
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
            <Field label="Class" error={errors.filterClass} required>
              <NativeSelect
                value={filterClass}
                onChange={e => { setFilterClass(e.target.value); setErrors(p => ({ ...p, filterClass: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.filterClass}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Subject">
              <NativeSelect
                value={filterSubject}
                onChange={e => setFilterSubject(e.target.value)}
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
          {filterClass ? filterClass : 'Select Class'}
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
        filterClass={filterClass}
        setFilterClass={setFilterClass}
        filterSubject={filterSubject}
        setFilterSubject={setFilterSubject}
        onApply={handleShow}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SummaryCard icon={BookMarked}  label="Total Documents"   value={filtered.length}        color="blue"    />
            <SummaryCard icon={Layers}      label="Subjects Covered"  value={resultSubjects.length}  color="violet"  />
            <SummaryCard icon={School2}     label="Class"             value={shownClass}             color="emerald" />
          </div>

          {/* Results Card */}
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

            {/* Subject quick-filter chips (desktop) */}
            {resultSubjects.length > 1 && (
              <div className="hidden sm:flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] overflow-x-auto">
                <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-[11px] text-slate-400 mr-1 flex-shrink-0">Filter:</span>
                <button
                  onClick={() => setSearch('')}
                  className={`flex-shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full border transition-all
                    ${!search ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-300 dark:bg-transparent dark:border-[rgba(99,102,241,0.2)] dark:text-slate-400'}`}
                >
                  All
                </button>
                {resultSubjects.map(s => {
                  const { fg, bg } = subjectColor(s)
                  const active = search === s
                  return (
                    <button
                      key={s}
                      onClick={() => setSearch(active ? '' : s)}
                      className="flex-shrink-0 text-[11px] font-semibold px-3 py-1 rounded-full border transition-all"
                      style={active
                        ? { background: fg, color: '#fff', borderColor: fg }
                        : { background: bg, color: fg, borderColor: 'transparent' }
                      }
                    >
                      {s}
                    </button>
                  )
                })}
              </div>
            )}

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Click <strong>Show</strong> to preview syllabus inline, or <strong>Download</strong> to save the file.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No syllabus documents match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Class', 'Subject', 'Syllabus Title', 'Uploaded', 'Size', 'Actions'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow
                        key={row.id}
                        row={row}
                        idx={i + 1}
                        onShow={handleShow_row}
                        onDownload={handleDownload}
                      />
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
                  <span className="text-[13px]">No syllabus documents match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to preview or download.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard
                      key={row.id}
                      row={row}
                      idx={i + 1}
                      onShow={handleShow_row}
                      onDownload={handleDownload}
                    />
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
            <BookOpen className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No syllabus loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a class and click <strong>Show</strong> to view syllabus documents.
            </p>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      <PreviewModal item={preview} onClose={() => setPreview(null)} />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
