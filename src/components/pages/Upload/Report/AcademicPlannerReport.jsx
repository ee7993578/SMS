/**
 * AcademicPlannerReport.jsx
 * Folder: src/pages/Student/Reports/AcademicPlannerReport.jsx
 *
 * Converts legacy ASPX "Academic Planner Report" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session dropdown filter with validation
 *  - Show report button
 *  - School name / session header in report
 *  - GridView: S.No, Title, Download Action
 *  - Mobile: card-based layout with tap-to-download
 *  - Desktop: clean ERP-style table
 *  - Toast notifications
 *  - Empty state & loading skeleton
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2,
  ChevronDown, SlidersHorizontal,
  BookOpen, FileDown, Calendar,
  Building2, MapPin, Search,
  FolderOpen, Info, FileText,
  GraduationCap, BarChart3, ExternalLink,
  Download, ChevronRight, BookMarked
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Academic planner documents per session
const PLANNER_DATA = {
  '2022-23': [
    { id: 1, title: 'Annual Academic Planner 2022-23 (All Classes)', file_path: '/uploads/planners/2022-23/annual_planner_all.pdf' },
    { id: 2, title: 'Monthly Planner – April 2022',                   file_path: '/uploads/planners/2022-23/monthly_apr_2022.pdf' },
    { id: 3, title: 'Monthly Planner – May 2022',                     file_path: '/uploads/planners/2022-23/monthly_may_2022.pdf' },
    { id: 4, title: 'Monthly Planner – June 2022',                    file_path: '/uploads/planners/2022-23/monthly_jun_2022.pdf' },
    { id: 5, title: 'Syllabus Distribution – Term I (Classes I–V)',   file_path: '/uploads/planners/2022-23/syllabus_t1_1to5.pdf' },
    { id: 6, title: 'Syllabus Distribution – Term I (Classes VI–X)',  file_path: '/uploads/planners/2022-23/syllabus_t1_6to10.pdf' },
    { id: 7, title: 'Examination Schedule – Mid Term 2022',           file_path: '/uploads/planners/2022-23/exam_midterm_2022.pdf' },
    { id: 8, title: 'Holiday List 2022-23',                           file_path: '/uploads/planners/2022-23/holiday_list.pdf' },
    { id: 9, title: 'Co-Curricular Activities Planner 2022-23',       file_path: '/uploads/planners/2022-23/cca_planner.pdf' },
  ],
  '2023-24': [
    { id: 1,  title: 'Annual Academic Planner 2023-24 (All Classes)', file_path: '/uploads/planners/2023-24/annual_planner_all.pdf' },
    { id: 2,  title: 'Monthly Planner – April 2023',                   file_path: '/uploads/planners/2023-24/monthly_apr_2023.pdf' },
    { id: 3,  title: 'Monthly Planner – May 2023',                     file_path: '/uploads/planners/2023-24/monthly_may_2023.pdf' },
    { id: 4,  title: 'Monthly Planner – June 2023',                    file_path: '/uploads/planners/2023-24/monthly_jun_2023.pdf' },
    { id: 5,  title: 'Monthly Planner – July 2023',                    file_path: '/uploads/planners/2023-24/monthly_jul_2023.pdf' },
    { id: 6,  title: 'Syllabus Distribution – Term I (Classes I–V)',   file_path: '/uploads/planners/2023-24/syllabus_t1_1to5.pdf' },
    { id: 7,  title: 'Syllabus Distribution – Term I (Classes VI–X)',  file_path: '/uploads/planners/2023-24/syllabus_t1_6to10.pdf' },
    { id: 8,  title: 'Syllabus Distribution – Term II (Classes XI–XII)',file_path: '/uploads/planners/2023-24/syllabus_t2_11to12.pdf' },
    { id: 9,  title: 'Examination Schedule – Annual 2024',             file_path: '/uploads/planners/2023-24/exam_annual_2024.pdf' },
    { id: 10, title: 'Holiday List 2023-24',                           file_path: '/uploads/planners/2023-24/holiday_list.pdf' },
    { id: 11, title: 'Sports & Events Calendar 2023-24',               file_path: '/uploads/planners/2023-24/sports_calendar.pdf' },
  ],
  '2024-25': [
    { id: 1,  title: 'Annual Academic Planner 2024-25 (All Classes)', file_path: '/uploads/planners/2024-25/annual_planner_all.pdf' },
    { id: 2,  title: 'Monthly Planner – April 2024',                   file_path: '/uploads/planners/2024-25/monthly_apr_2024.pdf' },
    { id: 3,  title: 'Monthly Planner – May 2024',                     file_path: '/uploads/planners/2024-25/monthly_may_2024.pdf' },
    { id: 4,  title: 'Monthly Planner – June 2024',                    file_path: '/uploads/planners/2024-25/monthly_jun_2024.pdf' },
    { id: 5,  title: 'Monthly Planner – July 2024',                    file_path: '/uploads/planners/2024-25/monthly_jul_2024.pdf' },
    { id: 6,  title: 'Monthly Planner – August 2024',                  file_path: '/uploads/planners/2024-25/monthly_aug_2024.pdf' },
    { id: 7,  title: 'Syllabus Distribution – Term I (Classes I–V)',   file_path: '/uploads/planners/2024-25/syllabus_t1_1to5.pdf' },
    { id: 8,  title: 'Syllabus Distribution – Term I (Classes VI–X)',  file_path: '/uploads/planners/2024-25/syllabus_t1_6to10.pdf' },
    { id: 9,  title: 'Syllabus Distribution – Term II (Classes XI–XII)',file_path: '/uploads/planners/2024-25/syllabus_t2_11to12.pdf' },
    { id: 10, title: 'Examination Schedule – Mid Term 2024',           file_path: '/uploads/planners/2024-25/exam_midterm_2024.pdf' },
    { id: 11, title: 'Examination Schedule – Annual 2025',             file_path: '/uploads/planners/2024-25/exam_annual_2025.pdf' },
    { id: 12, title: 'Holiday List 2024-25',                           file_path: '/uploads/planners/2024-25/holiday_list.pdf' },
    { id: 13, title: 'Co-Curricular Activities Planner 2024-25',       file_path: '/uploads/planners/2024-25/cca_planner.pdf' },
    { id: 14, title: 'Sports & Events Calendar 2024-25',               file_path: '/uploads/planners/2024-25/sports_calendar.pdf' },
  ],
  '2025-26': [
    { id: 1,  title: 'Annual Academic Planner 2025-26 (All Classes)', file_path: '/uploads/planners/2025-26/annual_planner_all.pdf' },
    { id: 2,  title: 'Monthly Planner – April 2025',                   file_path: '/uploads/planners/2025-26/monthly_apr_2025.pdf' },
    { id: 3,  title: 'Monthly Planner – May 2025',                     file_path: '/uploads/planners/2025-26/monthly_may_2025.pdf' },
    { id: 4,  title: 'Monthly Planner – June 2025',                    file_path: '/uploads/planners/2025-26/monthly_jun_2025.pdf' },
    { id: 5,  title: 'Monthly Planner – July 2025',                    file_path: '/uploads/planners/2025-26/monthly_jul_2025.pdf' },
    { id: 6,  title: 'Monthly Planner – August 2025',                  file_path: '/uploads/planners/2025-26/monthly_aug_2025.pdf' },
    { id: 7,  title: 'Monthly Planner – September 2025',               file_path: '/uploads/planners/2025-26/monthly_sep_2025.pdf' },
    { id: 8,  title: 'Syllabus Distribution – Term I (Classes I–V)',   file_path: '/uploads/planners/2025-26/syllabus_t1_1to5.pdf' },
    { id: 9,  title: 'Syllabus Distribution – Term I (Classes VI–X)',  file_path: '/uploads/planners/2025-26/syllabus_t1_6to10.pdf' },
    { id: 10, title: 'Syllabus Distribution – Term II (Classes XI–XII)',file_path: '/uploads/planners/2025-26/syllabus_t2_11to12.pdf' },
    { id: 11, title: 'Examination Schedule – Mid Term 2025',           file_path: '/uploads/planners/2025-26/exam_midterm_2025.pdf' },
    { id: 12, title: 'Examination Schedule – Annual 2026',             file_path: '/uploads/planners/2025-26/exam_annual_2026.pdf' },
    { id: 13, title: 'Holiday List 2025-26',                           file_path: '/uploads/planners/2025-26/holiday_list.pdf' },
    { id: 14, title: 'Co-Curricular Activities Planner 2025-26',       file_path: '/uploads/planners/2025-26/cca_planner.pdf' },
    { id: 15, title: 'Sports & Events Calendar 2025-26',               file_path: '/uploads/planners/2025-26/sports_calendar.pdf' },
    { id: 16, title: 'PTM Schedule 2025-26',                           file_path: '/uploads/planners/2025-26/ptm_schedule.pdf' },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/**
 * Derives a soft color token from the document title
 * so each category of planner gets a consistent accent color.
 */
const DOC_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe', label: 'blue' },
  { fg: '#7c3aed', bg: '#ede9fe', label: 'violet' },
  { fg: '#059669', bg: '#d1fae5', label: 'emerald' },
  { fg: '#d97706', bg: '#fef3c7', label: 'amber' },
  { fg: '#0891b2', bg: '#cffafe', label: 'cyan' },
  { fg: '#dc2626', bg: '#fee2e2', label: 'red' },
  { fg: '#0369a1', bg: '#e0f2fe', label: 'sky' },
]

function docColor(id) {
  return DOC_COLORS[(id - 1) % DOC_COLORS.length]
}

/** Pick a sensible icon based on document title keywords */
function DocIcon({ title, className = 'w-4 h-4' }) {
  const t = title.toLowerCase()
  if (t.includes('exam') || t.includes('schedule'))  return <Calendar className={className} />
  if (t.includes('syllabus'))                        return <BookMarked className={className} />
  if (t.includes('holiday'))                         return <Info className={className} />
  if (t.includes('sports') || t.includes('event'))  return <BarChart3 className={className} />
  if (t.includes('monthly'))                        return <Calendar className={className} />
  if (t.includes('annual'))                         return <GraduationCap className={className} />
  if (t.includes('co-curricular') || t.includes('cca')) return <BookOpen className={className} />
  if (t.includes('ptm'))                            return <Building2 className={className} />
  return <FileText className={className} />
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Accessible native select with chevron indicator */
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

/** Form field wrapper with label and error */
function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

/** Bottom toast notification */
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
      <button onClick={onClose} aria-label="Dismiss">
        <X className="w-4 h-4 opacity-75 hover:opacity-100" />
      </button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)]
      bg-gradient-to-r from-blue-50 via-white to-indigo-50
      dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35]
      px-6 py-5 text-center shadow-sm">
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
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full
        bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <Calendar className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Academic Planner Report
      </p>
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
      bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[22px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
          {value}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = docColor(row.id)

  const handleDownload = (e) => {
    e.preventDefault()
    // API integration placeholder: trigger actual file download
    alert(`Downloading: ${row.title}\nPath: ${row.file_path}`)
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]
      hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">

      {/* S.No */}
      <td className="px-4 py-3.5 text-center w-14">
        <span className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 tabular-nums">
          {idx}
        </span>
      </td>

      {/* Title */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span
            className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{ background: bg, color: fg }}
          >
            <DocIcon title={row.title} className="w-4 h-4" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">
              {row.title}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-xs">
              {row.file_path.split('/').pop()}
            </p>
          </div>
        </div>
      </td>

      {/* Action */}
      <td className="px-4 py-3.5 text-left w-36">
        <a
          href={row.file_path}
          onClick={handleDownload}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 border border-blue-100
            hover:bg-blue-600 hover:text-white hover:border-blue-600
            dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20
            dark:hover:bg-blue-600 dark:hover:text-white dark:hover:border-blue-600
            transition-all duration-150 group-hover:shadow-sm"
        >
          <Download className="w-3.5 h-3.5" />
          Download
        </a>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const { fg, bg } = docColor(row.id)

  const handleDownload = (e) => {
    e.preventDefault()
    // API integration placeholder
    alert(`Downloading: ${row.title}\nPath: ${row.file_path}`)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)]
      bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden
      hover:border-blue-200 dark:hover:border-indigo-500/30 transition-colors">

      <div className="flex items-start gap-3 px-4 py-4">
        {/* Icon badge */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: bg, color: fg }}
        >
          <DocIcon title={row.title} className="w-4.5 h-4.5" />
        </span>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* S.No + Title */}
          <div className="flex items-start gap-2 mb-1">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tabular-nums flex-shrink-0 mt-0.5">
              #{idx}
            </span>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">
              {row.title}
            </p>
          </div>

          {/* File name pill */}
          <div className="flex items-center gap-1.5 mt-1 mb-3">
            <FileText className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
              {row.file_path.split('/').pop()}
            </span>
          </div>

          {/* Download button */}
          <a
            href={row.file_path}
            onClick={handleDownload}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700
              dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-95 shadow-sm shadow-blue-500/20"
          >
            <Download className="w-3.5 h-3.5" />
            Download File
          </a>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl
          bg-white dark:bg-[#1a1f35]
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-3
          border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
              Select Session
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer body */}
        <div className="px-5 py-5">
          <Field label="Academic Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </NativeSelect>
          </Field>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">
            Select the academic session to view uploaded planner documents.
          </p>
        </div>

        {/* Drawer footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onShow(); onClose() }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              disabled:opacity-70 transition-all active:scale-95"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
      bg-white dark:bg-[#1a1f35] p-6 space-y-3">
      <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          style={{ opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4
      text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800
        flex items-center justify-center">
        <FolderOpen className="w-7 h-7 opacity-50" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
          No report generated yet
        </p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
          Select an academic session and click <strong>Show</strong> to load
          the uploaded planner documents.
        </p>
      </div>
    </div>
  )
}

// ─── NO SEARCH RESULTS ────────────────────────────────────────────────────────
function NoSearchResults({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3
      text-slate-400 dark:text-slate-600">
      <Search className="w-6 h-6 opacity-40" />
      <p className="text-[13px] font-semibold">No documents match your search.</p>
      <button
        onClick={onClear}
        className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
      >
        <X className="w-3 h-3" /> Clear search
      </button>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AcademicPlannerReport() {
  const [session,      setSession]      = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')

  /** Fire a toast and auto-dismiss after 3.5 s */
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Fetch documents (simulate API call) ──────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }

    setErrors({})
    setLoading(true)
    setSearch('')

    // Simulate network delay — replace with real API call
    setTimeout(() => {
      const data = PLANNER_DATA[session] || []
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)

      if (data.length === 0) {
        showToast('No planner documents found for this session.', 'error')
      } else {
        showToast(`Loaded ${data.length} document${data.length !== 1 ? 's' : ''} for session ${session}.`)
      }
    }, 700)
  }, [session, showToast])

  /** Reset all state back to initial */
  const handleReset = useCallback(() => {
    setSession('')
    setRows([])
    setSearch('')
    setErrors({})
    setShown(false)
    setShownSession('')
  }, [])

  // ── Client-side search filter ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r => r.title.toLowerCase().includes(q))
  }, [rows, search])

  const hasResults    = shown && rows.length > 0
  const activeFilters = session ? 1 : 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100
            flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Academic Planner Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and download academic planner documents uploaded for each session.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
        bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Filter card header */}
        <div className="flex items-center gap-3 px-5 py-3.5
          border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            Search Filters
          </span>
        </div>

        {/* Filter card body */}
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">

            {/* Session dropdown */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => {
                  setSession(e.target.value)
                  setErrors(p => ({ ...p, session: undefined }))
                }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </NativeSelect>
            </Field>

            {/* Spacers */}
            <div />
            <div />

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl
                  text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset"
                className="flex items-center justify-center px-3 py-2 rounded-xl
                  text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                  transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ───────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl
            text-[13px] font-semibold bg-blue-600 text-white
            dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Session'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilters}
            </span>
          )}
        </button>

        {hasResults && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300"
            aria-label="Reset"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School header */}
          <SchoolHeader session={shownSession} />

          {/* Summary stat cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SummaryCard
              icon={FileDown}
              label="Total Documents"
              value={rows.length}
              colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
            />
            <SummaryCard
              icon={Calendar}
              label="Academic Session"
              value={shownSession}
              colorClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />
            <SummaryCard
              icon={Search}
              label="Filtered View"
              value={`${filtered.length} shown`}
              colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />
          </div>

          {/* Main results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
            bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header with search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5
              border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
              bg-slate-50/70 dark:bg-white/[0.02]">

              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                  Planner Documents
                </span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">
                  · {shownSession}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                  bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} doc{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search documents…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint — desktop only */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2
              border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]
              bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Click <strong>Download</strong> to save any document. Files are served from the school's upload directory.
              </p>
            </div>

            {/* ── DESKTOP TABLE ─────────────────────────────────────────── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <NoSearchResults onClear={() => setSearch('')} />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]
                      bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Title', 'Action'].map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide
                            text-slate-500 dark:text-slate-400 whitespace-nowrap
                            first:text-center first:w-14 last:w-36"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.id} row={row} idx={i + 1} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ──────────────────────────────────────────── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <NoSearchResults onClear={() => setSearch('')} />
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium
                    flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap <strong>Download File</strong> to save a document.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={row.id} row={row} idx={i + 1} />
                  ))}
                </>
              )}
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5
              border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
              bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {filtered.length}
                </span>{' '}
                of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {rows.length}
                </span>{' '}
                documents
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline
                    flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State (no report yet) ──────────────────────────────────── */}
      {!hasResults && !loading && <EmptyState />}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
