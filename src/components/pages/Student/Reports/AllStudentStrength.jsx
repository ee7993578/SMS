/**
 * StrengthReport.jsx
 * Folder: src/pages/Student/Reports/StrengthReport.jsx
 *
 * Converts legacy ASPX "Total Strength Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Class, Section, New Admission, Old Admission, RTE Students, Total
 * Features:
 *  - Session dropdown filter
 *  - Show report button + Excel export
 *  - School name / address / session header in report
 *  - Grand total footer row
 *  - Mobile: collapsible cards with expandable details
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, UserPlus, History,
  SlidersHorizontal, Info, Search,
  BarChart3, FileSpreadsheet, BookOpen,
  School2, TrendingUp, ShieldCheck,
  MapPin, Building2, ChevronRight
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Section-wise strength data (new_admission, old_admission, RTE, Total)
const STRENGTH_DATA = {
  '2022-23': [
    { class: 'Nursery',   Section: 'A', new_admission: 28, old_admission: 0,  RTE: 4,  Total: 32  },
    { class: 'Nursery',   Section: 'B', new_admission: 24, old_admission: 0,  RTE: 3,  Total: 27  },
    { class: 'LKG',       Section: 'A', new_admission: 20, old_admission: 10, RTE: 3,  Total: 33  },
    { class: 'LKG',       Section: 'B', new_admission: 18, old_admission: 12, RTE: 2,  Total: 32  },
    { class: 'UKG',       Section: 'A', new_admission: 14, old_admission: 16, RTE: 3,  Total: 33  },
    { class: 'UKG',       Section: 'B', new_admission: 12, old_admission: 16, RTE: 2,  Total: 30  },
    { class: 'Class I',   Section: 'A', new_admission: 10, old_admission: 28, RTE: 5,  Total: 43  },
    { class: 'Class I',   Section: 'B', new_admission: 8,  old_admission: 30, RTE: 4,  Total: 42  },
    { class: 'Class II',  Section: 'A', new_admission: 6,  old_admission: 34, RTE: 5,  Total: 45  },
    { class: 'Class II',  Section: 'B', new_admission: 6,  old_admission: 32, RTE: 4,  Total: 42  },
    { class: 'Class III', Section: 'A', new_admission: 4,  old_admission: 32, RTE: 4,  Total: 40  },
    { class: 'Class IV',  Section: 'A', new_admission: 4,  old_admission: 30, RTE: 3,  Total: 37  },
    { class: 'Class V',   Section: 'A', new_admission: 6,  old_admission: 30, RTE: 4,  Total: 40  },
    { class: 'Class VI',  Section: 'A', new_admission: 10, old_admission: 34, RTE: 5,  Total: 49  },
    { class: 'Class VI',  Section: 'B', new_admission: 10, old_admission: 28, RTE: 4,  Total: 42  },
    { class: 'Class VII', Section: 'A', new_admission: 8,  old_admission: 34, RTE: 4,  Total: 46  },
    { class: 'Class VIII',Section: 'A', new_admission: 4,  old_admission: 32, RTE: 3,  Total: 39  },
    { class: 'Class IX',  Section: 'A', new_admission: 10, old_admission: 28, RTE: 3,  Total: 41  },
    { class: 'Class IX',  Section: 'B', new_admission: 8,  old_admission: 26, RTE: 3,  Total: 37  },
    { class: 'Class X',   Section: 'A', new_admission: 4,  old_admission: 36, RTE: 2,  Total: 42  },
    { class: 'Class XI',  Section: 'A', new_admission: 50, old_admission: 0,  RTE: 0,  Total: 50  },
    { class: 'Class XI',  Section: 'B', new_admission: 46, old_admission: 0,  RTE: 0,  Total: 46  },
    { class: 'Class XII', Section: 'A', new_admission: 0,  old_admission: 48, RTE: 0,  Total: 48  },
    { class: 'Class XII', Section: 'B', new_admission: 0,  old_admission: 44, RTE: 0,  Total: 44  },
  ],
  '2023-24': [
    { class: 'Nursery',   Section: 'A', new_admission: 30, old_admission: 0,  RTE: 5,  Total: 35  },
    { class: 'Nursery',   Section: 'B', new_admission: 26, old_admission: 0,  RTE: 4,  Total: 30  },
    { class: 'LKG',       Section: 'A', new_admission: 22, old_admission: 12, RTE: 4,  Total: 38  },
    { class: 'LKG',       Section: 'B', new_admission: 20, old_admission: 14, RTE: 3,  Total: 37  },
    { class: 'UKG',       Section: 'A', new_admission: 16, old_admission: 18, RTE: 3,  Total: 37  },
    { class: 'UKG',       Section: 'B', new_admission: 14, old_admission: 18, RTE: 3,  Total: 35  },
    { class: 'Class I',   Section: 'A', new_admission: 12, old_admission: 30, RTE: 5,  Total: 47  },
    { class: 'Class I',   Section: 'B', new_admission: 10, old_admission: 32, RTE: 4,  Total: 46  },
    { class: 'Class II',  Section: 'A', new_admission: 8,  old_admission: 36, RTE: 5,  Total: 49  },
    { class: 'Class II',  Section: 'B', new_admission: 8,  old_admission: 34, RTE: 5,  Total: 47  },
    { class: 'Class III', Section: 'A', new_admission: 6,  old_admission: 34, RTE: 4,  Total: 44  },
    { class: 'Class IV',  Section: 'A', new_admission: 5,  old_admission: 32, RTE: 3,  Total: 40  },
    { class: 'Class V',   Section: 'A', new_admission: 8,  old_admission: 32, RTE: 4,  Total: 44  },
    { class: 'Class VI',  Section: 'A', new_admission: 14, old_admission: 36, RTE: 6,  Total: 56  },
    { class: 'Class VI',  Section: 'B', new_admission: 12, old_admission: 32, RTE: 5,  Total: 49  },
    { class: 'Class VII', Section: 'A', new_admission: 10, old_admission: 36, RTE: 5,  Total: 51  },
    { class: 'Class VIII',Section: 'A', new_admission: 5,  old_admission: 34, RTE: 4,  Total: 43  },
    { class: 'Class IX',  Section: 'A', new_admission: 12, old_admission: 30, RTE: 4,  Total: 46  },
    { class: 'Class IX',  Section: 'B', new_admission: 10, old_admission: 28, RTE: 4,  Total: 42  },
    { class: 'Class X',   Section: 'A', new_admission: 5,  old_admission: 38, RTE: 3,  Total: 46  },
    { class: 'Class XI',  Section: 'A', new_admission: 54, old_admission: 0,  RTE: 0,  Total: 54  },
    { class: 'Class XI',  Section: 'B', new_admission: 50, old_admission: 0,  RTE: 0,  Total: 50  },
    { class: 'Class XII', Section: 'A', new_admission: 0,  old_admission: 52, RTE: 0,  Total: 52  },
    { class: 'Class XII', Section: 'B', new_admission: 0,  old_admission: 48, RTE: 0,  Total: 48  },
  ],
  '2024-25': [
    { class: 'Nursery',   Section: 'A', new_admission: 32, old_admission: 0,  RTE: 5,  Total: 37  },
    { class: 'Nursery',   Section: 'B', new_admission: 28, old_admission: 0,  RTE: 4,  Total: 32  },
    { class: 'LKG',       Section: 'A', new_admission: 24, old_admission: 14, RTE: 4,  Total: 42  },
    { class: 'LKG',       Section: 'B', new_admission: 22, old_admission: 16, RTE: 3,  Total: 41  },
    { class: 'UKG',       Section: 'A', new_admission: 18, old_admission: 20, RTE: 4,  Total: 42  },
    { class: 'UKG',       Section: 'B', new_admission: 16, old_admission: 20, RTE: 3,  Total: 39  },
    { class: 'Class I',   Section: 'A', new_admission: 14, old_admission: 32, RTE: 6,  Total: 52  },
    { class: 'Class I',   Section: 'B', new_admission: 12, old_admission: 34, RTE: 5,  Total: 51  },
    { class: 'Class II',  Section: 'A', new_admission: 10, old_admission: 38, RTE: 6,  Total: 54  },
    { class: 'Class II',  Section: 'B', new_admission: 10, old_admission: 36, RTE: 5,  Total: 51  },
    { class: 'Class III', Section: 'A', new_admission: 8,  old_admission: 36, RTE: 5,  Total: 49  },
    { class: 'Class IV',  Section: 'A', new_admission: 6,  old_admission: 34, RTE: 4,  Total: 44  },
    { class: 'Class V',   Section: 'A', new_admission: 10, old_admission: 34, RTE: 5,  Total: 49  },
    { class: 'Class VI',  Section: 'A', new_admission: 16, old_admission: 38, RTE: 7,  Total: 61  },
    { class: 'Class VI',  Section: 'B', new_admission: 14, old_admission: 34, RTE: 6,  Total: 54  },
    { class: 'Class VII', Section: 'A', new_admission: 12, old_admission: 38, RTE: 6,  Total: 56  },
    { class: 'Class VIII',Section: 'A', new_admission: 6,  old_admission: 36, RTE: 5,  Total: 47  },
    { class: 'Class IX',  Section: 'A', new_admission: 14, old_admission: 32, RTE: 5,  Total: 51  },
    { class: 'Class IX',  Section: 'B', new_admission: 12, old_admission: 30, RTE: 5,  Total: 47  },
    { class: 'Class X',   Section: 'A', new_admission: 6,  old_admission: 40, RTE: 4,  Total: 50  },
    { class: 'Class XI',  Section: 'A', new_admission: 58, old_admission: 0,  RTE: 0,  Total: 58  },
    { class: 'Class XI',  Section: 'B', new_admission: 54, old_admission: 0,  RTE: 0,  Total: 54  },
    { class: 'Class XII', Section: 'A', new_admission: 0,  old_admission: 56, RTE: 0,  Total: 56  },
    { class: 'Class XII', Section: 'B', new_admission: 0,  old_admission: 52, RTE: 0,  Total: 52  },
  ],
  '2025-26': [
    { class: 'Nursery',   Section: 'A', new_admission: 35, old_admission: 0,  RTE: 6,  Total: 41  },
    { class: 'Nursery',   Section: 'B', new_admission: 30, old_admission: 0,  RTE: 5,  Total: 35  },
    { class: 'LKG',       Section: 'A', new_admission: 26, old_admission: 16, RTE: 5,  Total: 47  },
    { class: 'LKG',       Section: 'B', new_admission: 24, old_admission: 18, RTE: 4,  Total: 46  },
    { class: 'UKG',       Section: 'A', new_admission: 20, old_admission: 22, RTE: 5,  Total: 47  },
    { class: 'UKG',       Section: 'B', new_admission: 18, old_admission: 22, RTE: 4,  Total: 44  },
    { class: 'Class I',   Section: 'A', new_admission: 16, old_admission: 34, RTE: 7,  Total: 57  },
    { class: 'Class I',   Section: 'B', new_admission: 14, old_admission: 36, RTE: 6,  Total: 56  },
    { class: 'Class II',  Section: 'A', new_admission: 12, old_admission: 40, RTE: 7,  Total: 59  },
    { class: 'Class II',  Section: 'B', new_admission: 12, old_admission: 38, RTE: 6,  Total: 56  },
    { class: 'Class III', Section: 'A', new_admission: 10, old_admission: 38, RTE: 6,  Total: 54  },
    { class: 'Class IV',  Section: 'A', new_admission: 8,  old_admission: 36, RTE: 5,  Total: 49  },
    { class: 'Class V',   Section: 'A', new_admission: 12, old_admission: 36, RTE: 6,  Total: 54  },
    { class: 'Class VI',  Section: 'A', new_admission: 18, old_admission: 40, RTE: 8,  Total: 66  },
    { class: 'Class VI',  Section: 'B', new_admission: 16, old_admission: 36, RTE: 7,  Total: 59  },
    { class: 'Class VII', Section: 'A', new_admission: 14, old_admission: 40, RTE: 7,  Total: 61  },
    { class: 'Class VIII',Section: 'A', new_admission: 8,  old_admission: 38, RTE: 6,  Total: 52  },
    { class: 'Class IX',  Section: 'A', new_admission: 16, old_admission: 34, RTE: 6,  Total: 56  },
    { class: 'Class IX',  Section: 'B', new_admission: 14, old_admission: 32, RTE: 6,  Total: 52  },
    { class: 'Class X',   Section: 'A', new_admission: 8,  old_admission: 42, RTE: 5,  Total: 55  },
    { class: 'Class XI',  Section: 'A', new_admission: 62, old_admission: 0,  RTE: 0,  Total: 62  },
    { class: 'Class XI',  Section: 'B', new_admission: 58, old_admission: 0,  RTE: 0,  Total: 58  },
    { class: 'Class XII', Section: 'A', new_admission: 0,  old_admission: 60, RTE: 0,  Total: 60  },
    { class: 'Class XII', Section: 'B', new_admission: 0,  old_admission: 56, RTE: 0,  Total: 56  },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name) => CLASS_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

const formatAbbr = (name = '') =>
  name.replace('Class ', '').slice(0, 3).toUpperCase()

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
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value.toLocaleString()}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session }) {
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
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Total Strength Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  const { fg, bg } = classColor(row.class)

  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-4 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
        <td className="px-4 py-3" colSpan={2}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Grand Total
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">{row.new_admission}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 tabular-nums">{row.old_admission}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 tabular-nums">{row.RTE}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">{row.Total}</span>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.class)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class}</span>
        </div>
      </td>

      {/* Section */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {row.Section}
        </span>
      </td>

      {/* New Admission */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
          {row.new_admission}
        </span>
      </td>

      {/* Old Admission */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 tabular-nums">
          {row.old_admission}
        </span>
      </td>

      {/* RTE Students */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 tabular-nums">
          {row.RTE}
        </span>
      </td>

      {/* Total */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-[14px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
          {row.Total}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  const newPct = row.Total ? Math.round((row.new_admission / row.Total) * 100) : 0
  const rtePct = row.Total ? Math.round((row.RTE / row.Total) * 100) : 0

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Class badge */}
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {formatAbbr(row.class)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {row.class}
            <span className="ml-2 text-[12px] font-semibold text-slate-400 dark:text-slate-500">Sec {row.Section}</span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            New: <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{row.new_admission}</span>
            &nbsp;·&nbsp;
            Old: <span className="text-amber-600 dark:text-amber-400 font-semibold">{row.old_admission}</span>
            &nbsp;·&nbsp;
            RTE: <span className="text-violet-600 dark:text-violet-400 font-semibold">{row.RTE}</span>
          </p>
        </div>

        {/* Total badge */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[20px] font-bold text-blue-700 dark:text-blue-400 tabular-nums leading-tight">{row.Total}</span>
          <span className="text-[10px] text-slate-400">total</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Progress bar: new vs old */}
      <div className="px-4 pb-3">
        <div className="flex text-[10px] font-semibold justify-between mb-1">
          <span className="text-emerald-600 dark:text-emerald-400">New {newPct}%</span>
          <span className="text-amber-600 dark:text-amber-400">Old {100 - newPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-amber-200 dark:bg-amber-500/20 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${newPct}%` }} />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {/* New Admission */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <UserPlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums leading-tight">{row.new_admission}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">New</p>
            </div>
            {/* Old Admission */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 text-center">
              <History className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums leading-tight">{row.old_admission}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-0.5">Old</p>
            </div>
            {/* RTE */}
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3 text-center">
              <ShieldCheck className="w-4 h-4 text-violet-600 dark:text-violet-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums leading-tight">{row.RTE}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mt-0.5">RTE</p>
            </div>
          </div>

          {/* RTE share bar */}
          <div>
            <div className="flex text-[10px] font-semibold justify-between mb-1">
              <span className="text-violet-600 dark:text-violet-400">RTE {rtePct}%</span>
              <span className="text-slate-400">of total students</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${rtePct}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, onShow, loading, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Session</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
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
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AllStudentStrength() {
  const [session,    setSession]    = useState('')
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [shownSession, setShownSession] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = STRENGTH_DATA[session] || []
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} records for session ${session}.`)
    }, 650)
  }, [session])

  const handleReset = () => {
    setSession(''); setRows([]); setSearch('')
    setErrors({}); setShown(false); setShownSession('')
  }

  // ── Excel Export placeholder ──────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.class.toLowerCase().includes(q) ||
      r.Section.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Grand totals ──────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    new_admission: filtered.reduce((s, r) => s + r.new_admission, 0),
    old_admission: filtered.reduce((s, r) => s + r.old_admission, 0),
    RTE:           filtered.reduce((s, r) => s + r.RTE, 0),
    Total:         filtered.reduce((s, r) => s + r.Total, 0),
  }), [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = session ? 1 : 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <School2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Strength Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Section-wise total strength — new admissions, old admissions &amp; RTE students.
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

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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

            {/* Spacers */}
            <div />
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
          {session ? `Session: ${session}` : 'Select Session'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
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

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}      label="Total Students"   value={totals.Total}         color="blue"    />
            <SummaryCard icon={UserPlus}   label="New Admissions"   value={totals.new_admission}  color="emerald" />
            <SummaryCard icon={History}    label="Old Admissions"   value={totals.old_admission}  color="amber"   />
            <SummaryCard icon={ShieldCheck}label="RTE Students"     value={totals.RTE}            color="violet"  />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Section-wise Strength</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search class or section…"
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
                Showing section-wise breakdown. New + Old = Total Students per section. RTE under Right to Education Act.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Class', 'Section', 'New Admission', 'Old Admission', 'RTE Students', 'Total'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.class}-${row.Section}`} row={row} idx={i + 1} />
                    ))}
                    {/* Grand Total */}
                    <DesktopRow row={totals} idx={0} isTotal />
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see detailed breakdown.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.class}-${row.Section}`} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Sections
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.Total}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{totals.RTE}</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">RTE Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{totals.new_admission}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">New Admissions</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{totals.old_admission}</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Old Admissions</p>
                      </div>
                    </div>
                    {/* New vs Old bar */}
                    <div>
                      <div className="flex text-[10px] font-semibold justify-between mb-1">
                        <span className="text-emerald-600 dark:text-emerald-400">
                          New {totals.Total ? Math.round((totals.new_admission / totals.Total) * 100) : 0}%
                        </span>
                        <span className="text-amber-600 dark:text-amber-400">
                          Old {totals.Total ? Math.round((totals.old_admission / totals.Total) * 100) : 0}%
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-amber-200 dark:bg-amber-500/20 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                          style={{ width: `${totals.Total ? Math.round((totals.new_admission / totals.Total) * 100) : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
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
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to generate the strength report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
