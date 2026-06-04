/**
 * FeeDefaulterReport.jsx
 * Installment-Wise Fee Defaulter Report
 * Converted from ASPX to React + Tailwind (reference: StrengthReport theme)
 *
 * Features:
 *  - Session, Class, Section, Installment, Fee Type filters
 *  - Tabbed mobile layout (Summary | Details)
 *  - Desktop: ERP-grade dense table
 *  - Mobile: Touch-friendly cards with expandable detail
 *  - Grand total footer
 *  - Excel export placeholder
 *  - Loading skeleton, empty state, toast feedback
 *  - Filter drawer for mobile
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, Search, FileSpreadsheet,
  SlidersHorizontal, Info, TrendingUp, Building2, MapPin,
  IndianRupee, Users, AlertTriangle, CheckCircle2,
  BookOpen, BarChart3, CreditCard, Wallet, BadgeAlert,
  LayoutList, LayoutGrid
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'All', 'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII'
]

const SECTIONS = ['All', 'A', 'B', 'C']

const INSTALLMENTS = [
  { label: '-- Select Installment --', value: '0' },
  { label: 'April', value: '1' },
  { label: 'May', value: '2' },
  { label: 'June', value: '3' },
  { label: 'July', value: '4' },
  { label: 'August', value: '5' },
  { label: 'September', value: '6' },
  { label: 'October', value: '7' },
  { label: 'November', value: '8' },
  { label: 'December', value: '9' },
  { label: 'January', value: '10' },
  { label: 'February', value: '11' },
  { label: 'March', value: '12' },
  { label: '1st Quarter (Apr-Jun)', value: 'q1' },
  { label: '2nd Quarter (Jul-Sep)', value: 'q2' },
  { label: '3rd Quarter (Oct-Dec)', value: 'q3' },
  { label: '4th Quarter (Jan-Mar)', value: 'q4' },
]

const FEE_TYPES = [
  { label: '--Select--', value: '4' },
  { label: 'Total Paid', value: '1' },
  { label: 'Total Fee', value: '2' },
  { label: 'Total Dues', value: '3' },
  { label: 'Quarter Wise Fees', value: '44' },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Generate dummy defaulter data
const generateDefaulters = (session, cls, sec, installment) => {
  const baseNames = [
    'Aarav Sharma', 'Priya Singh', 'Rohan Gupta', 'Sneha Patel',
    'Vikram Yadav', 'Ananya Mishra', 'Arjun Verma', 'Kavita Joshi',
    'Rahul Kumar', 'Pooja Rawat', 'Deepak Negi', 'Sunita Bisht',
    'Amit Chauhan', 'Ritu Thakur', 'Manish Bhatt', 'Neha Pandey',
    'Sanjay Tiwari', 'Meera Dubey', 'Ajay Saxena', 'Lalita Trivedi',
  ]

  const classes = cls === 'All'
    ? ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
       'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII']
    : [cls]

  const sections = sec === 'All' ? ['A', 'B'] : [sec]

  const rows = []
  let sno = 1
  const seed = (session?.charCodeAt(0) ?? 65) + (installment?.charCodeAt(0) ?? 65)

  classes.forEach((c) => {
    sections.forEach((s) => {
      // 3–5 defaulters per class-section
      const count = 3 + (seed % 3)
      for (let i = 0; i < count; i++) {
        const nameIdx = (sno * 3 + i + seed) % baseNames.length
        const totalFee = 2400 + ((sno + i) % 6) * 400
        const paid = Math.floor(totalFee * (0.2 + ((sno + i) % 5) * 0.1))
        const dues = totalFee - paid
        rows.push({
          sno: sno++,
          admNo: `ADM${2020 + (sno % 5)}${String(sno).padStart(4, '0')}`,
          studentName: baseNames[nameIdx],
          fatherName: `${baseNames[(nameIdx + 1) % baseNames.length].split(' ')[0]} (Father)`,
          class: c,
          section: s,
          totalFee,
          paid,
          dues,
          mobile: `98${String(7000000 + sno * 1337).slice(-8)}`,
        })
      }
    })
  })

  return rows
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

const STATUS_COLOR = (dues) =>
  dues > 3000
    ? { text: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/20' }
    : dues > 1500
    ? { text: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/20' }
    : { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-500/10', border: 'border-orange-200 dark:border-orange-500/20' }

const CLASS_AVATAR_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_AVATAR_COLORS.length]
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

// ─── PRIMITIVE COMPONENTS ──────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
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
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SCHOOL HEADER ─────────────────────────────────────────────────────────────
function SchoolHeader({ session, installLabel, feeTypeLabel }) {
  return (
    <div className="rounded-2xl border border-rose-100 dark:border-[rgba(239,68,68,0.2)] bg-gradient-to-r from-rose-50 via-white to-orange-50 dark:from-[#1f1a1a] dark:via-[#1e2238] dark:to-[#1f1a1a] px-5 py-4 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-0.5">
        <Building2 className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
        <h2 className="text-[15px] sm:text-[17px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3 h-3 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[11px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        {installLabel && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[11px] font-bold text-blue-700 dark:text-blue-400">
            Installment: {installLabel}
          </span>
        )}
        {feeTypeLabel && feeTypeLabel !== '--Select--' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 text-[11px] font-bold text-violet-700 dark:text-violet-400">
            {feeTypeLabel}
          </span>
        )}
      </div>
      <p className="mt-2 text-[12px] font-extrabold uppercase tracking-widest text-rose-700 dark:text-rose-400 flex items-center justify-center gap-2">
        <BadgeAlert className="w-4 h-4" />
        Fee Defaulter Report — Installment Wise
      </p>
    </div>
  )
}

// ─── SUMMARY CARDS ─────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, isMoney }) {
  const colors = {
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[17px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight truncate">
          {isMoney ? fmt(value) : value.toLocaleString()}
        </p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ─────────────────────────────────────────────────────────
function DesktopRow({ row, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-rose-50/80 dark:bg-rose-500/[0.07] border-t-2 border-rose-200 dark:border-rose-500/30 font-bold">
        <td className="px-3 py-3 text-center text-[11px] text-rose-400">—</td>
        <td className="px-3 py-3 text-[12px] text-rose-700 dark:text-rose-300" colSpan={5}>
          <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" />Grand Total ({row._count} students)</span>
        </td>
        <td className="px-3 py-3 text-center text-[12px] text-blue-700 dark:text-blue-300">
          <span className="px-2 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/20 tabular-nums">{fmt(row.totalFee)}</span>
        </td>
        <td className="px-3 py-3 text-center text-[12px] text-emerald-700 dark:text-emerald-300">
          <span className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 tabular-nums">{fmt(row.paid)}</span>
        </td>
        <td className="px-3 py-3 text-center text-[12px] text-rose-700 dark:text-rose-300">
          <span className="px-2 py-1 rounded-lg bg-rose-100 dark:bg-rose-500/20 tabular-nums">{fmt(row.dues)}</span>
        </td>
        <td className="px-3 py-3"></td>
      </tr>
    )
  }

  const sc = STATUS_COLOR(row.dues)
  const paidPct = row.totalFee > 0 ? Math.round((row.paid / row.totalFee) * 100) : 0

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[11px] text-slate-400 tabular-nums w-10">{row.sno}</td>

      {/* Adm No */}
      <td className="px-3 py-3">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{row.admNo}</span>
      </td>

      {/* Student */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: classColor(row.studentName).bg, color: classColor(row.studentName).fg }}
          >
            {initials(row.studentName)}
          </span>
          <div>
            <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.studentName}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{row.fatherName}</p>
          </div>
        </div>
      </td>

      {/* Class + Section */}
      <td className="px-3 py-3 text-center">
        <div className="flex items-center justify-center gap-1 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.class}</span>
          <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-500">{row.section}</span>
        </div>
      </td>

      {/* Mobile */}
      <td className="px-3 py-3 text-center">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">{row.mobile}</span>
      </td>

      {/* Total Fee */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-400 tabular-nums">{fmt(row.totalFee)}</span>
      </td>

      {/* Paid */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">{fmt(row.paid)}</span>
      </td>

      {/* Dues */}
      <td className="px-3 py-3 text-center">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold tabular-nums ${sc.text} ${sc.bg}`}>
          {fmt(row.dues)}
        </span>
      </td>

      {/* Progress */}
      <td className="px-3 py-3 w-28">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{ width: `${paidPct}%` }}
            />
          </div>
          <span className="text-[10px] text-slate-400 tabular-nums w-8 text-right">{paidPct}%</span>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const sc = STATUS_COLOR(row.dues)
  const paidPct = row.totalFee > 0 ? Math.round((row.paid / row.totalFee) * 100) : 0

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm ${sc.border}`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: classColor(row.studentName).bg, color: classColor(row.studentName).fg }}
        >
          {initials(row.studentName)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.studentName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 truncate">
            {row.admNo} · {row.class} – Sec {row.section}
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className={`text-[16px] font-bold tabular-nums ${sc.text}`}>{fmt(row.dues)}</span>
          <span className="text-[10px] text-slate-400">dues</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Mini progress */}
      <div className="px-4 pb-3">
        <div className="flex text-[10px] font-semibold justify-between mb-1">
          <span className="text-emerald-600 dark:text-emerald-400">Paid {paidPct}% · {fmt(row.paid)}</span>
          <span className={sc.text}>Due {100 - paidPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500" style={{ width: `${paidPct}%` }} />
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="text-[14px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(row.totalFee)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Total Fee</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[14px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(row.paid)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Paid</p>
            </div>
            <div className={`rounded-xl border p-3 text-center ${sc.bg} ${sc.border}`}>
              <AlertTriangle className={`w-4 h-4 mx-auto mb-1 ${sc.text}`} />
              <p className={`text-[14px] font-bold tabular-nums ${sc.text}`}>{fmt(row.dues)}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wide ${sc.text}`}>Dues</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Father's Name</span>
              <span className="text-slate-700 dark:text-slate-200 font-medium">{row.fatherName}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Mobile</span>
              <a href={`tel:${row.mobile}`} className="text-blue-600 dark:text-blue-400 font-semibold">{row.mobile}</a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── FILTER DRAWER (Mobile) ───────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-rose-600" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setFilters(p => ({ ...p, session: e.target.value }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class">
            <NativeSelect value={filters.cls} onChange={e => setFilters(p => ({ ...p, cls: e.target.value }))}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Section">
            <NativeSelect value={filters.section} onChange={e => setFilters(p => ({ ...p, section: e.target.value }))}>
              {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Installment" error={errors.installment} required>
            <NativeSelect value={filters.installment} onChange={e => setFilters(p => ({ ...p, installment: e.target.value }))} error={errors.installment}>
              {INSTALLMENTS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Fee Type">
            <NativeSelect value={filters.feeType} onChange={e => setFilters(p => ({ ...p, feeType: e.target.value }))}>
              {FEE_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
              bg-rose-600 hover:bg-rose-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── TABS (Mobile View Toggle) ────────────────────────────────────────────────
function Tabs({ active, onChange, counts }) {
  const tabs = [
    { id: 'list', label: 'Defaulters', icon: LayoutList, count: counts.total },
    { id: 'summary', label: 'Summary', icon: BarChart3 },
  ]
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-semibold transition-all
            ${active === t.id
              ? 'bg-white dark:bg-[#1a1f35] text-rose-600 dark:text-rose-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <t.icon className="w-3.5 h-3.5" />
          {t.label}
          {t.count !== undefined && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
              ${active === t.id ? 'bg-rose-100 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'}`}>
              {t.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

// ─── MOBILE SUMMARY VIEW ──────────────────────────────────────────────────────
function MobileSummary({ rows }) {
  // Group by class
  const grouped = useMemo(() => {
    const map = {}
    rows.forEach(r => {
      if (!map[r.class]) map[r.class] = { class: r.class, count: 0, totalFee: 0, paid: 0, dues: 0 }
      map[r.class].count++
      map[r.class].totalFee += r.totalFee
      map[r.class].paid += r.paid
      map[r.class].dues += r.dues
    })
    return Object.values(map)
  }, [rows])

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-slate-500 dark:text-slate-400 px-1">Class-wise defaulter summary</p>
      {grouped.map(g => {
        const pct = g.totalFee > 0 ? Math.round((g.paid / g.totalFee) * 100) : 0
        const sc = STATUS_COLOR(g.dues / g.count)
        return (
          <div key={g.class} className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{ background: classColor(g.class).bg, color: classColor(g.class).fg }}
                >
                  {g.class.replace('Class ', '').slice(0, 3).toUpperCase()}
                </span>
                <div>
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{g.class}</p>
                  <p className="text-[10px] text-slate-400">{g.count} defaulters</p>
                </div>
              </div>
              <span className={`text-[14px] font-bold tabular-nums ${sc.text}`}>{fmt(g.dues)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                <span className="text-slate-500">Total Fee:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200 ml-auto">{fmt(g.totalFee)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                <span className="text-slate-500">Paid:</span>
                <span className="font-semibold text-emerald-700 dark:text-emerald-400 ml-auto">{fmt(g.paid)}</span>
              </div>
            </div>
            <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[10px] text-slate-400">
              <span>Paid {pct}%</span>
              <span>Pending {100 - pct}%</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FeeDefaulterReport() {
  const [filters, setFilters] = useState({
    session: '', cls: 'All', section: 'All', installment: '0', feeType: '4'
  })
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch]       = useState('')
  const [errors, setErrors]       = useState({})
  const [toast, setToast]         = useState(null)
  const [shown, setShown]         = useState(false)
  const [shownMeta, setShownMeta] = useState({})
  const [mobileTab, setMobileTab] = useState('list')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & Fetch ────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Select a session'
    if (filters.installment === '0') err.installment = 'Select an installment'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = generateDefaulters(filters.session, filters.cls, filters.section, filters.installment)
      setRows(data)
      setShownMeta({
        session: filters.session,
        installLabel: INSTALLMENTS.find(i => i.value === filters.installment)?.label,
        feeTypeLabel: FEE_TYPES.find(f => f.value === filters.feeType)?.label,
      })
      setShown(true)
      setLoading(false)
      setMobileTab('list')
      showToast(`Found ${data.length} defaulters for ${INSTALLMENTS.find(i => i.value === filters.installment)?.label}.`)
    }, 750)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', cls: 'All', section: 'All', installment: '0', feeType: '4' })
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownMeta({})
  }

  const handleExcel = () => {
    if (!rows.length) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Filter rows by search ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.studentName.toLowerCase().includes(q) ||
      r.fatherName.toLowerCase().includes(q) ||
      r.admNo.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.mobile.includes(q)
    )
  }, [rows, search])

  // ── Totals ──────────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    _count:   filtered.length,
    totalFee: filtered.reduce((s, r) => s + r.totalFee, 0),
    paid:     filtered.reduce((s, r) => s + r.paid, 0),
    dues:     filtered.reduce((s, r) => s + r.dues, 0),
  }), [filtered])

  const hasResults = shown && rows.length > 0
  const activeFilters = [filters.session, filters.installment !== '0'].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BadgeAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Fee Defaulter Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Installment-wise defaulter list — track pending dues per class, section &amp; month.
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

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          {hasResults && (
            <span className="text-[12px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              {rows.length} defaulters found
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 xl:grid-cols-6 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Class">
              <NativeSelect value={filters.cls} onChange={e => setFilters(p => ({ ...p, cls: e.target.value }))}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Section">
              <NativeSelect value={filters.section} onChange={e => setFilters(p => ({ ...p, section: e.target.value }))}>
                {SECTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Installment" error={errors.installment} required>
              <NativeSelect value={filters.installment}
                onChange={e => { setFilters(p => ({ ...p, installment: e.target.value })); setErrors(p => ({ ...p, installment: undefined })) }}
                error={errors.installment}>
                {INSTALLMENTS.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Fee Type">
              <NativeSelect value={filters.feeType} onChange={e => setFilters(p => ({ ...p, feeType: e.target.value }))}>
                {FEE_TYPES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
              </NativeSelect>
            </Field>
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset} title="Reset filters"
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
            bg-rose-600 text-white shadow-md shadow-rose-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 ? `Filters (${activeFilters})` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={shownMeta.session}
            installLabel={shownMeta.installLabel}
            feeTypeLabel={shownMeta.feeTypeLabel}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}        label="Total Defaulters"  value={totals._count}   color="rose" />
            <SummaryCard icon={CreditCard}   label="Total Fee"         value={totals.totalFee} color="blue"    isMoney />
            <SummaryCard icon={Wallet}       label="Total Paid"        value={totals.paid}     color="emerald" isMoney />
            <SummaryCard icon={AlertTriangle}label="Total Dues"        value={totals.dues}     color="amber"   isMoney />
          </div>

          {/* ── MOBILE TABS ──────────────────────────────────────────────────── */}
          <div className="md:hidden space-y-3">
            <Tabs active={mobileTab} onChange={setMobileTab} counts={{ total: filtered.length }} />

            {/* Search (always visible) */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student, adm no, class…"
                className="w-full pl-9 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-rose-400 focus:ring-2 focus:ring-rose-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {mobileTab === 'list' && (
              <div className="space-y-2.5">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <Search className="w-7 h-7 opacity-30" />
                    <span className="text-[13px]">No defaulters match your search.</span>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-rose-500 dark:text-rose-400 font-medium flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      Tap a card to see fee details &amp; contact info.
                    </p>
                    {filtered.map(row => <MobileCard key={row.admNo} row={row} />)}

                    {/* Mobile Grand Total */}
                    <div className="rounded-xl border-2 border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-500/[0.07] p-4 mt-2">
                      <p className="text-[12px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Defaulters
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[16px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(totals.totalFee)}</p>
                          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Fee</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[16px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(totals.paid)}</p>
                          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Paid</p>
                        </div>
                        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className="text-[16px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{fmt(totals.dues)}</p>
                          <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Dues</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {mobileTab === 'summary' && <MobileSummary rows={filtered} />}
          </div>

          {/* ── DESKTOP TABLE ─────────────────────────────────────────────────── */}
          <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            {/* Table Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Defaulter List</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.installLabel}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
                  {filtered.length} records
                </span>
              </div>
              <div className="relative w-full sm:w-60 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search student, adm no, class…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-rose-400 focus:ring-2 focus:ring-rose-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-amber-50/30 dark:bg-amber-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Red = high dues (&gt;₹3000) · Amber = medium · Orange = low. Click a row to contact parent.
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Adm No.', 'Student / Father', 'Class', 'Mobile', 'Total Fee', 'Paid', 'Dues', 'Paid %'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(row => <DesktopRow key={row.admNo} row={row} />)}
                    <DesktopRow row={totals} isTotal />
                  </tbody>
                </table>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <IndianRupee className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select <strong>Session</strong> &amp; <strong>Installment</strong>, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
