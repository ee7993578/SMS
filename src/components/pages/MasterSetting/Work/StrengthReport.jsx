/**
 * StrengthReport.jsx
 * Total Strength Report – React + Tailwind (Vite / JS)
 *
 * Desktop : dense ERP table with sticky header
 * Mobile  : expandable cards, bottom-sheet filter drawer
 * Features: session filter, live search, grand total, summary stats, Excel export stub
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, Users, UserPlus, History,
  SlidersHorizontal, Info, Search, BarChart3, FileSpreadsheet,
  BookOpen, School2, TrendingUp, ShieldCheck, MapPin, Building2,
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const STRENGTH_DATA = {
  '2022-23': [
    { class: 'Nursery',    Section: 'A', new_admission: 28, old_admission: 0,  RTE: 4, Total: 32 },
    { class: 'Nursery',    Section: 'B', new_admission: 24, old_admission: 0,  RTE: 3, Total: 27 },
    { class: 'LKG',        Section: 'A', new_admission: 20, old_admission: 10, RTE: 3, Total: 33 },
    { class: 'LKG',        Section: 'B', new_admission: 18, old_admission: 12, RTE: 2, Total: 32 },
    { class: 'UKG',        Section: 'A', new_admission: 14, old_admission: 16, RTE: 3, Total: 33 },
    { class: 'UKG',        Section: 'B', new_admission: 12, old_admission: 16, RTE: 2, Total: 30 },
    { class: 'Class I',    Section: 'A', new_admission: 10, old_admission: 28, RTE: 5, Total: 43 },
    { class: 'Class I',    Section: 'B', new_admission:  8, old_admission: 30, RTE: 4, Total: 42 },
    { class: 'Class II',   Section: 'A', new_admission:  6, old_admission: 34, RTE: 5, Total: 45 },
    { class: 'Class II',   Section: 'B', new_admission:  6, old_admission: 32, RTE: 4, Total: 42 },
    { class: 'Class III',  Section: 'A', new_admission:  4, old_admission: 32, RTE: 4, Total: 40 },
    { class: 'Class IV',   Section: 'A', new_admission:  4, old_admission: 30, RTE: 3, Total: 37 },
    { class: 'Class V',    Section: 'A', new_admission:  6, old_admission: 30, RTE: 4, Total: 40 },
    { class: 'Class VI',   Section: 'A', new_admission: 10, old_admission: 34, RTE: 5, Total: 49 },
    { class: 'Class VI',   Section: 'B', new_admission: 10, old_admission: 28, RTE: 4, Total: 42 },
    { class: 'Class VII',  Section: 'A', new_admission:  8, old_admission: 34, RTE: 4, Total: 46 },
    { class: 'Class VIII', Section: 'A', new_admission:  4, old_admission: 32, RTE: 3, Total: 39 },
    { class: 'Class IX',   Section: 'A', new_admission: 10, old_admission: 28, RTE: 3, Total: 41 },
    { class: 'Class IX',   Section: 'B', new_admission:  8, old_admission: 26, RTE: 3, Total: 37 },
    { class: 'Class X',    Section: 'A', new_admission:  4, old_admission: 36, RTE: 2, Total: 42 },
    { class: 'Class XI',   Section: 'A', new_admission: 50, old_admission: 0,  RTE: 0, Total: 50 },
    { class: 'Class XI',   Section: 'B', new_admission: 46, old_admission: 0,  RTE: 0, Total: 46 },
    { class: 'Class XII',  Section: 'A', new_admission:  0, old_admission: 48, RTE: 0, Total: 48 },
    { class: 'Class XII',  Section: 'B', new_admission:  0, old_admission: 44, RTE: 0, Total: 44 },
  ],
  '2023-24': [
    { class: 'Nursery',    Section: 'A', new_admission: 30, old_admission: 0,  RTE: 5, Total: 35 },
    { class: 'Nursery',    Section: 'B', new_admission: 26, old_admission: 0,  RTE: 4, Total: 30 },
    { class: 'LKG',        Section: 'A', new_admission: 22, old_admission: 12, RTE: 4, Total: 38 },
    { class: 'LKG',        Section: 'B', new_admission: 20, old_admission: 14, RTE: 3, Total: 37 },
    { class: 'UKG',        Section: 'A', new_admission: 16, old_admission: 18, RTE: 3, Total: 37 },
    { class: 'UKG',        Section: 'B', new_admission: 14, old_admission: 18, RTE: 3, Total: 35 },
    { class: 'Class I',    Section: 'A', new_admission: 12, old_admission: 30, RTE: 5, Total: 47 },
    { class: 'Class I',    Section: 'B', new_admission: 10, old_admission: 32, RTE: 4, Total: 46 },
    { class: 'Class II',   Section: 'A', new_admission:  8, old_admission: 36, RTE: 5, Total: 49 },
    { class: 'Class II',   Section: 'B', new_admission:  8, old_admission: 34, RTE: 5, Total: 47 },
    { class: 'Class III',  Section: 'A', new_admission:  6, old_admission: 34, RTE: 4, Total: 44 },
    { class: 'Class IV',   Section: 'A', new_admission:  5, old_admission: 32, RTE: 3, Total: 40 },
    { class: 'Class V',    Section: 'A', new_admission:  8, old_admission: 32, RTE: 4, Total: 44 },
    { class: 'Class VI',   Section: 'A', new_admission: 14, old_admission: 36, RTE: 6, Total: 56 },
    { class: 'Class VI',   Section: 'B', new_admission: 12, old_admission: 32, RTE: 5, Total: 49 },
    { class: 'Class VII',  Section: 'A', new_admission: 10, old_admission: 36, RTE: 5, Total: 51 },
    { class: 'Class VIII', Section: 'A', new_admission:  5, old_admission: 34, RTE: 4, Total: 43 },
    { class: 'Class IX',   Section: 'A', new_admission: 12, old_admission: 30, RTE: 4, Total: 46 },
    { class: 'Class IX',   Section: 'B', new_admission: 10, old_admission: 28, RTE: 4, Total: 42 },
    { class: 'Class X',    Section: 'A', new_admission:  5, old_admission: 38, RTE: 3, Total: 46 },
    { class: 'Class XI',   Section: 'A', new_admission: 54, old_admission: 0,  RTE: 0, Total: 54 },
    { class: 'Class XI',   Section: 'B', new_admission: 50, old_admission: 0,  RTE: 0, Total: 50 },
    { class: 'Class XII',  Section: 'A', new_admission:  0, old_admission: 52, RTE: 0, Total: 52 },
    { class: 'Class XII',  Section: 'B', new_admission:  0, old_admission: 48, RTE: 0, Total: 48 },
  ],
  '2024-25': [
    { class: 'Nursery',    Section: 'A', new_admission: 32, old_admission: 0,  RTE: 5, Total: 37 },
    { class: 'Nursery',    Section: 'B', new_admission: 28, old_admission: 0,  RTE: 4, Total: 32 },
    { class: 'LKG',        Section: 'A', new_admission: 24, old_admission: 14, RTE: 4, Total: 42 },
    { class: 'LKG',        Section: 'B', new_admission: 22, old_admission: 16, RTE: 3, Total: 41 },
    { class: 'UKG',        Section: 'A', new_admission: 18, old_admission: 20, RTE: 4, Total: 42 },
    { class: 'UKG',        Section: 'B', new_admission: 16, old_admission: 20, RTE: 3, Total: 39 },
    { class: 'Class I',    Section: 'A', new_admission: 14, old_admission: 32, RTE: 6, Total: 52 },
    { class: 'Class I',    Section: 'B', new_admission: 12, old_admission: 34, RTE: 5, Total: 51 },
    { class: 'Class II',   Section: 'A', new_admission: 10, old_admission: 38, RTE: 6, Total: 54 },
    { class: 'Class II',   Section: 'B', new_admission: 10, old_admission: 36, RTE: 5, Total: 51 },
    { class: 'Class III',  Section: 'A', new_admission:  8, old_admission: 36, RTE: 5, Total: 49 },
    { class: 'Class IV',   Section: 'A', new_admission:  6, old_admission: 34, RTE: 4, Total: 44 },
    { class: 'Class V',    Section: 'A', new_admission: 10, old_admission: 34, RTE: 5, Total: 49 },
    { class: 'Class VI',   Section: 'A', new_admission: 16, old_admission: 38, RTE: 7, Total: 61 },
    { class: 'Class VI',   Section: 'B', new_admission: 14, old_admission: 34, RTE: 6, Total: 54 },
    { class: 'Class VII',  Section: 'A', new_admission: 12, old_admission: 38, RTE: 6, Total: 56 },
    { class: 'Class VIII', Section: 'A', new_admission:  6, old_admission: 36, RTE: 5, Total: 47 },
    { class: 'Class IX',   Section: 'A', new_admission: 14, old_admission: 32, RTE: 5, Total: 51 },
    { class: 'Class IX',   Section: 'B', new_admission: 12, old_admission: 30, RTE: 5, Total: 47 },
    { class: 'Class X',    Section: 'A', new_admission:  6, old_admission: 40, RTE: 4, Total: 50 },
    { class: 'Class XI',   Section: 'A', new_admission: 58, old_admission: 0,  RTE: 0, Total: 58 },
    { class: 'Class XI',   Section: 'B', new_admission: 54, old_admission: 0,  RTE: 0, Total: 54 },
    { class: 'Class XII',  Section: 'A', new_admission:  0, old_admission: 56, RTE: 0, Total: 56 },
    { class: 'Class XII',  Section: 'B', new_admission:  0, old_admission: 52, RTE: 0, Total: 52 },
  ],
  '2025-26': [
    { class: 'Nursery',    Section: 'A', new_admission: 35, old_admission: 0,  RTE: 6, Total: 41 },
    { class: 'Nursery',    Section: 'B', new_admission: 30, old_admission: 0,  RTE: 5, Total: 35 },
    { class: 'LKG',        Section: 'A', new_admission: 26, old_admission: 16, RTE: 5, Total: 47 },
    { class: 'LKG',        Section: 'B', new_admission: 24, old_admission: 18, RTE: 4, Total: 46 },
    { class: 'UKG',        Section: 'A', new_admission: 20, old_admission: 22, RTE: 5, Total: 47 },
    { class: 'UKG',        Section: 'B', new_admission: 18, old_admission: 22, RTE: 4, Total: 44 },
    { class: 'Class I',    Section: 'A', new_admission: 16, old_admission: 34, RTE: 7, Total: 57 },
    { class: 'Class I',    Section: 'B', new_admission: 14, old_admission: 36, RTE: 6, Total: 56 },
    { class: 'Class II',   Section: 'A', new_admission: 12, old_admission: 40, RTE: 7, Total: 59 },
    { class: 'Class II',   Section: 'B', new_admission: 12, old_admission: 38, RTE: 6, Total: 56 },
    { class: 'Class III',  Section: 'A', new_admission: 10, old_admission: 38, RTE: 6, Total: 54 },
    { class: 'Class IV',   Section: 'A', new_admission:  8, old_admission: 36, RTE: 5, Total: 49 },
    { class: 'Class V',    Section: 'A', new_admission: 12, old_admission: 36, RTE: 6, Total: 54 },
    { class: 'Class VI',   Section: 'A', new_admission: 18, old_admission: 40, RTE: 8, Total: 66 },
    { class: 'Class VI',   Section: 'B', new_admission: 16, old_admission: 36, RTE: 7, Total: 59 },
    { class: 'Class VII',  Section: 'A', new_admission: 14, old_admission: 40, RTE: 7, Total: 61 },
    { class: 'Class VIII', Section: 'A', new_admission:  8, old_admission: 38, RTE: 6, Total: 52 },
    { class: 'Class IX',   Section: 'A', new_admission: 16, old_admission: 34, RTE: 6, Total: 56 },
    { class: 'Class IX',   Section: 'B', new_admission: 14, old_admission: 32, RTE: 6, Total: 52 },
    { class: 'Class X',    Section: 'A', new_admission:  8, old_admission: 42, RTE: 5, Total: 55 },
    { class: 'Class XI',   Section: 'A', new_admission: 62, old_admission: 0,  RTE: 0, Total: 62 },
    { class: 'Class XI',   Section: 'B', new_admission: 58, old_admission: 0,  RTE: 0, Total: 58 },
    { class: 'Class XII',  Section: 'A', new_admission:  0, old_admission: 60, RTE: 0, Total: 60 },
    { class: 'Class XII',  Section: 'B', new_admission:  0, old_admission: 56, RTE: 0, Total: 56 },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CLASS_PALETTE = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_PALETTE[name.charCodeAt(0) % CLASS_PALETTE.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Native <select> with chevron icon */
function NativeSelect({ value, onChange, children, placeholder, hasError, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={[
          'w-full appearance-none pl-3 pr-8 py-2.5 text-sm rounded-xl border outline-none',
          'transition-all cursor-pointer bg-white text-slate-800',
          'focus:border-blue-400 focus:ring-2 focus:ring-blue-100',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          hasError
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 hover:border-slate-300',
        ].join(' ')}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

/** Form field wrapper with label + error */
function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

/** Bottom toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={[
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-[60]',
        'flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl',
        'text-sm font-semibold min-w-[260px] max-w-[90vw]',
        type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white',
      ].join(' ')}
      style={{ animation: 'toastUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} aria-label="Dismiss"><X className="w-4 h-4 opacity-80 hover:opacity-100" /></button>
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────

const STAT_STYLES = {
  blue:    'bg-blue-50 text-blue-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber:   'bg-amber-50 text-amber-600',
  violet:  'bg-violet-50 text-violet-600',
}

function SummaryCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${STAT_STYLES[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[22px] font-black text-slate-800 tabular-nums leading-none">{value.toLocaleString()}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────

function SchoolHeader({ session }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1.5">
        <Building2 className="w-5 h-5 text-blue-600 flex-shrink-0" />
        <h2 className="text-base sm:text-lg font-extrabold text-slate-800 tracking-tight">{SCHOOL_INFO.name}</h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 border border-amber-200">
        <span className="text-[12px] font-bold text-amber-700">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700">Total Strength Report</p>
    </div>
  )
}

// ─── BADGE HELPERS ────────────────────────────────────────────────────────────

function Badge({ value, variant }) {
  const styles = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber:   'bg-amber-50 text-amber-700',
    violet:  'bg-violet-50 text-violet-700',
    blue:    'bg-blue-50 text-blue-700',
    slate:   'bg-slate-100 text-slate-600',
  }
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold tabular-nums ${styles[variant]}`}>
      {value}
    </span>
  )
}

// ─── DESKTOP TABLE ────────────────────────────────────────────────────────────

const TABLE_HEADERS = ['S.No.', 'Class', 'Section', 'New Admission', 'Old Admission', 'RTE Students', 'Total']

function DesktopTableRow({ row, idx }) {
  const { fg, bg } = classColor(row.class)
  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors group">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}>
            {formatAbbr(row.class)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 whitespace-nowrap">{row.class}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold bg-slate-100 text-slate-600">
          {row.Section}
        </span>
      </td>
      <td className="px-4 py-3 text-center"><Badge value={row.new_admission} variant="emerald" /></td>
      <td className="px-4 py-3 text-center"><Badge value={row.old_admission} variant="amber" /></td>
      <td className="px-4 py-3 text-center"><Badge value={row.RTE} variant="violet" /></td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-11 h-11 rounded-xl text-[14px] font-black bg-blue-50 text-blue-700 tabular-nums">
          {row.Total}
        </span>
      </td>
    </tr>
  )
}

function DesktopTotalRow({ totals }) {
  return (
    <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 border-t-2 border-blue-200">
      <td className="px-4 py-3 text-center text-[12px] text-blue-400">—</td>
      <td className="px-4 py-3" colSpan={2}>
        <span className="flex items-center gap-2 text-[13px] font-bold text-blue-700">
          <TrendingUp className="w-4 h-4" /> Grand Total
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 tabular-nums">{totals.new_admission}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-amber-100 text-amber-800 tabular-nums">{totals.old_admission}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-violet-100 text-violet-800 tabular-nums">{totals.RTE}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[14px] font-black bg-blue-100 text-blue-800 tabular-nums">{totals.Total}</span>
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
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Tap header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-slate-50 transition-colors"
        aria-expanded={expanded}
      >
        <span className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}>
          {formatAbbr(row.class)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-800 leading-tight">
            {row.class}
            <span className="ml-2 text-[12px] font-semibold text-slate-400">Sec {row.Section}</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            New: <span className="text-emerald-600 font-bold">{row.new_admission}</span>
            {' · '}
            Old: <span className="text-amber-600 font-bold">{row.old_admission}</span>
            {' · '}
            RTE: <span className="text-violet-600 font-bold">{row.RTE}</span>
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[22px] font-black text-blue-700 tabular-nums leading-none">{row.Total}</span>
          <span className="text-[10px] text-slate-400">total</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 ml-1 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Mini progress bar: new vs old */}
      <div className="px-4 pb-3">
        <div className="flex text-[10px] font-bold justify-between mb-1">
          <span className="text-emerald-600">New {newPct}%</span>
          <span className="text-amber-600">Old {100 - newPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${newPct}%` }} />
        </div>
      </div>

      {/* Expanded breakdown */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pt-3 pb-4 space-y-3 bg-slate-50/50">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-center">
              <UserPlus className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <p className="text-[20px] font-black text-emerald-700 tabular-nums">{row.new_admission}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 mt-0.5">New</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-100 p-3 text-center">
              <History className="w-4 h-4 text-amber-600 mx-auto mb-1" />
              <p className="text-[20px] font-black text-amber-700 tabular-nums">{row.old_admission}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600 mt-0.5">Old</p>
            </div>
            <div className="rounded-xl bg-violet-50 border border-violet-100 p-3 text-center">
              <ShieldCheck className="w-4 h-4 text-violet-600 mx-auto mb-1" />
              <p className="text-[20px] font-black text-violet-700 tabular-nums">{row.RTE}</p>
              <p className="text-[9px] font-bold uppercase tracking-wider text-violet-600 mt-0.5">RTE</p>
            </div>
          </div>
          {/* RTE bar */}
          <div>
            <div className="flex text-[10px] font-bold justify-between mb-1">
              <span className="text-violet-600">RTE {rtePct}% of total</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-violet-500 transition-all duration-500" style={{ width: `${rtePct}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE GRAND TOTAL CARD ──────────────────────────────────────────────────

function MobileGrandTotal({ totals, count }) {
  const newPct = totals.Total ? Math.round((totals.new_admission / totals.Total) * 100) : 0
  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <p className="text-[11px] font-bold uppercase tracking-widest text-blue-700 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" /> Grand Total — {count} Sections
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        {[
          { label: 'Total Students', value: totals.Total,         cls: 'text-blue-700',    bg: 'bg-white/70' },
          { label: 'RTE Students',   value: totals.RTE,           cls: 'text-violet-700',  bg: 'bg-white/70' },
          { label: 'New Admissions', value: totals.new_admission,  cls: 'text-emerald-700', bg: 'bg-white/70' },
          { label: 'Old Admissions', value: totals.old_admission,  cls: 'text-amber-700',   bg: 'bg-white/70' },
        ].map(({ label, value, cls, bg }) => (
          <div key={label} className={`rounded-xl ${bg} p-3 text-center`}>
            <p className={`text-[22px] font-black tabular-nums leading-none ${cls}`}>{value}</p>
            <p className="text-[10px] font-semibold text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>
      <div>
        <div className="flex text-[10px] font-bold justify-between mb-1">
          <span className="text-emerald-600">New {newPct}%</span>
          <span className="text-amber-600">Old {100 - newPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${newPct}%` }} />
        </div>
      </div>
    </div>
  )
}

// ─── FILTER DRAWER (MOBILE) ───────────────────────────────────────────────────

function FilterDrawer({ open, onClose, session, setSession, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white border-t border-slate-200 shadow-2xl"
        style={{ animation: 'drawerUp .28s cubic-bezier(.32,.72,0,1)' }}
        role="dialog"
        aria-label="Session filter"
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">Select Session</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="px-5 py-5">
          <Field label="Academic Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --"
              hasError={!!errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        {/* Actions */}
        <div className="px-5 pb-8 pt-2 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-sm font-semibold bg-slate-100 text-slate-700 active:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onShow(); onClose() }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white bg-blue-600 active:bg-blue-700 disabled:opacity-70 transition-all shadow-md shadow-blue-500/25"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
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
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
      <div className="h-20 rounded-xl bg-slate-100 animate-pulse mb-4" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
        <BarChart3 className="w-8 h-8 opacity-40" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-slate-500">No report generated yet</p>
        <p className="text-[12px] text-slate-400 mt-1 max-w-[220px]">
          Select a session and tap <strong>Show</strong> to generate the strength report.
        </p>
      </div>
    </div>
  )
}

// ─── NO SEARCH RESULTS ────────────────────────────────────────────────────────

function NoSearchResults({ onClear }) {
  return (
    <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400">
      <Search className="w-6 h-6 opacity-30" />
      <span className="text-[13px]">No records match your search.</span>
      <button onClick={onClear} className="text-[12px] text-blue-600 underline mt-1">Clear search</button>
    </div>
  )
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

export default function StrengthReport() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [session,      setSession]      = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Fetch data (API placeholder) ───────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }

    setErrors({})
    setLoading(true)
    setSearch('')

    // TODO: replace with real API call — GET /api/strength?session=${session}
    setTimeout(() => {
      const data = STRENGTH_DATA[session] ?? []
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`${data.length} records loaded for session ${session}.`)
    }, 650)
  }, [session, showToast])

  const handleReset = useCallback(() => {
    setSession('')
    setRows([])
    setSearch('')
    setErrors({})
    setShown(false)
    setShownSession('')
  }, [])

  // ── Excel export (API placeholder) ────────────────────────────────────────
  const handleExcel = useCallback(() => {
    if (!rows.length) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    // TODO: trigger server-side Excel generation via POST /api/strength/export
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }, [rows, showToast])

  // ── Filtered rows ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.class.toLowerCase().includes(q) ||
      r.Section.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Grand totals ───────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    new_admission: filtered.reduce((s, r) => s + r.new_admission, 0),
    old_admission: filtered.reduce((s, r) => s + r.old_admission, 0),
    RTE:           filtered.reduce((s, r) => s + r.RTE, 0),
    Total:         filtered.reduce((s, r) => s + r.Total, 0),
  }), [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilter = !!session

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 px-3 sm:px-6 lg:px-8 py-6 space-y-4 pb-16">

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-black text-slate-800 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <School2 className="w-4.5 h-4.5 text-white" />
            </span>
            Strength Report
          </h1>
          <p className="text-[13px] text-slate-500 mt-1 ml-[2.6rem]">
            Section-wise total strength — new admissions, old admissions &amp; RTE students.
          </p>
        </div>
        {/* Desktop export button */}
        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Panel ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-sm font-bold text-slate-700 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Academic Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                hasError={!!errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacers */}
            <div /><div />

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset filters"
                className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold text-white bg-blue-600 shadow-md shadow-blue-500/20 active:bg-blue-700 transition-colors"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Session'}
          {activeFilter && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">1</span>
          )}
        </button>
        {hasResults && (
          <>
            <button
              type="button"
              onClick={handleExcel}
              disabled={exporting}
              title="Export Excel"
              className="flex items-center justify-center px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-sm disabled:opacity-70 active:bg-emerald-700 transition-colors"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
            <button
              type="button"
              onClick={handleReset}
              title="Reset"
              className="flex items-center justify-center px-3.5 py-3 rounded-2xl bg-slate-100 text-slate-700 active:bg-slate-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} />

          {/* Summary Cards — 2-col on mobile, 4-col on desktop */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}       label="Total Students"  value={totals.Total}          color="blue"    />
            <SummaryCard icon={UserPlus}    label="New Admissions"  value={totals.new_admission}   color="emerald" />
            <SummaryCard icon={History}     label="Old Admissions"  value={totals.old_admission}   color="amber"   />
            <SummaryCard icon={ShieldCheck} label="RTE Students"    value={totals.RTE}             color="violet"  />
          </div>

          {/* Main data card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-sm font-bold text-slate-700">Section-wise Strength</span>
                <span className="text-[13px] text-slate-400">· {shownSession}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search class or section…"
                  className="w-full pl-9 pr-8 py-2 text-[13px] rounded-xl border border-slate-200 outline-none transition-all bg-white text-slate-700 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint (desktop only) */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 bg-blue-50/30">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700">
                Section-wise breakdown. New + Old = Total per section. RTE under Right to Education Act.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0
                ? <NoSearchResults onClear={() => setSearch('')} />
                : (
                  <table className="w-full">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b border-slate-100 bg-slate-50/90 backdrop-blur-sm">
                        {TABLE_HEADERS.map((h, i) => (
                          <th key={i} className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500 whitespace-nowrap first:w-12">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filtered.map((row, i) => (
                        <DesktopTableRow key={`${row.class}-${row.Section}`} row={row} idx={i + 1} />
                      ))}
                      <DesktopTotalRow totals={totals} />
                    </tbody>
                  </table>
                )
              }
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0
                ? <NoSearchResults onClear={() => setSearch('')} />
                : (
                  <>
                    <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      Tap a card to see the detailed breakdown.
                    </p>
                    {filtered.map((row, i) => (
                      <MobileCard key={`${row.class}-${row.Section}`} row={row} idx={i + 1} />
                    ))}
                    <MobileGrandTotal totals={totals} count={filtered.length} />
                  </>
                )
              }
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[12px] text-slate-400">
                Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700">{rows.length}</span> records
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────────── */}
      {!hasResults && !loading && <EmptyState />}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
