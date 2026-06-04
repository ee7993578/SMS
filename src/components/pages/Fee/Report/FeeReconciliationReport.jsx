/**
 * FeeReconciliationReport.jsx
 * Folder: src/pages/Reports/FEE/FeeReconciliationReport.jsx
 *
 * Converts legacy ASPX "Fee Reconciliation Report" to fully-responsive React + Tailwind.
 *
 * Filters: Session, Class, Bus Type
 * Features:
 *  - Tab-based navigation: Summary | Detail | Bus-wise
 *  - Summary stat cards with trend indicators
 *  - Desktop: dense ERP-style data table
 *  - Mobile: rich expandable cards with inline charts
 *  - Excel export placeholder
 *  - Mobile bottom-sheet filter drawer
 *  - Search/filter with instant results
 *  - Grand total rows
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check,
  Loader2, ChevronDown, ChevronRight, SlidersHorizontal,
  FileSpreadsheet, Search, TrendingUp, TrendingDown,
  IndianRupee, Bus, Users, Receipt, BookOpen,
  Building2, MapPin, Banknote, CreditCard, Wallet,
  CheckCircle2, Clock, XCircle, BarChart3, Info,
  ArrowUpRight, ArrowDownRight, School2, CalendarDays,
  PieChart, Download
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'All Classes', 'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const BUS_TYPES = ['All Bus Types', 'School Bus', 'Van', 'Mini Bus', 'No Transport']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Fee head definitions
const FEE_HEADS = ['Tuition Fee', 'Transport Fee', 'Activity Fee', 'Library Fee', 'Exam Fee']

// Generate deterministic dummy reconciliation data
function generateData(session, cls, busType) {
  const seed = (session + cls + busType).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const rng = (min, max, offset = 0) => min + ((seed + offset) % (max - min + 1))

  const classRows = [
    'Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III',
    'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII',
    'Class IX', 'Class X', 'Class XI', 'Class XII',
  ].filter(c => cls === 'All Classes' || c === cls)

  return classRows.flatMap((className, ci) => {
    const sections = className.startsWith('Class IX') || className.startsWith('Class VI') || className.startsWith('Nursery') || className.startsWith('LKG') || className.startsWith('UKG') || className.startsWith('Class I') || className.startsWith('Class II') || className.startsWith('Class XI') || className.startsWith('Class XII')
      ? ['A', 'B']
      : ['A']

    return sections.map((sec, si) => {
      const total = rng(30, 60, ci * 7 + si * 3)
      const collected = rng(Math.floor(total * 0.6), total, ci * 11 + si * 5)
      const pending = total - collected
      const tuition = rng(1200, 2500, ci * 13)
      const transport = busType !== 'No Transport' ? rng(300, 800, ci * 7) : 0
      const activity = rng(100, 300, ci * 9)
      const library = rng(50, 150, ci * 3)
      const exam = rng(200, 500, ci * 5)
      const totalFee = tuition + transport + activity + library + exam
      const collectedAmt = Math.round(totalFee * (collected / total))
      const pendingAmt = totalFee - collectedAmt

      return {
        id: `${className}-${sec}`,
        class: className,
        section: sec,
        totalStudents: total,
        collected,
        pending,
        tuitionFee: tuition,
        transportFee: transport,
        activityFee: activity,
        libraryFee: library,
        examFee: exam,
        totalFee,
        collectedAmt,
        pendingAmt,
        collectionPct: Math.round((collectedAmt / totalFee) * 100),
      }
    })
  })
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) => `₹${n.toLocaleString('en-IN')}`
const fmtShort = (n) => n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : n >= 1000 ? `₹${(n / 1000).toFixed(1)}K` : `₹${n}`

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
  { fg: '#9333ea', bg: '#f3e8ff' },
]
const classColor = (name) => CLASS_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

const TABS = [
  { id: 'summary',  label: 'Summary',   icon: PieChart },
  { id: 'detail',   label: 'Detail',    icon: Receipt },
  { id: 'buswise',  label: 'Bus-wise',  icon: Bus },
]

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
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── COLLECTION PROGRESS BAR ──────────────────────────────────────────────────

function CollectionBar({ pct, size = 'sm' }) {
  const color = pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
  const h = size === 'lg' ? 'h-2.5' : 'h-1.5'
  return (
    <div className={`w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden ${h}`}>
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function PctBadge({ pct }) {
  if (pct >= 80) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400"><CheckCircle2 className="w-3 h-3" />{pct}%</span>
  if (pct >= 50) return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400"><Clock className="w-3 h-3" />{pct}%</span>
  return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400"><XCircle className="w-3 h-3" />{pct}%</span>
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3.5 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <p className="text-[19px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight truncate">{value}</p>
          {trend !== undefined && (
            <span className={`text-[11px] font-bold flex items-center gap-0.5 flex-shrink-0 ${trend >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────

function SchoolHeader({ session, cls, busType }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <h2 className="text-[14px] sm:text-[16px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
              {SCHOOL_INFO.name}
            </h2>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span>{SCHOOL_INFO.address}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[11px] font-bold text-amber-700 dark:text-amber-400">
            <CalendarDays className="w-3 h-3" />Session: {session}
          </span>
          {cls !== 'All Classes' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[11px] font-bold text-blue-700 dark:text-blue-400">
              <School2 className="w-3 h-3" />{cls}
            </span>
          )}
          {busType !== 'All Bus Types' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 text-[11px] font-bold text-violet-700 dark:text-violet-400">
              <Bus className="w-3 h-3" />{busType}
            </span>
          )}
        </div>
      </div>
      <p className="mt-2 text-[12px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400 text-center sm:text-left">
        Fee Reconciliation Report
      </p>
    </div>
  )
}

// ─── TAB BAR ─────────────────────────────────────────────────────────────────

function TabBar({ active, onChange }) {
  return (
    <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1 gap-1">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-semibold transition-all duration-200
            ${active === id
              ? 'bg-white dark:bg-[#1a1f35] text-blue-700 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
        >
          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden xs:inline sm:inline">{label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── DESKTOP TABLE ────────────────────────────────────────────────────────────

function DesktopTable({ data }) {
  const totals = useMemo(() => ({
    totalStudents: data.reduce((s, r) => s + r.totalStudents, 0),
    collected:     data.reduce((s, r) => s + r.collected, 0),
    pending:       data.reduce((s, r) => s + r.pending, 0),
    tuitionFee:    data.reduce((s, r) => s + r.tuitionFee, 0),
    transportFee:  data.reduce((s, r) => s + r.transportFee, 0),
    activityFee:   data.reduce((s, r) => s + r.activityFee, 0),
    libraryFee:    data.reduce((s, r) => s + r.libraryFee, 0),
    examFee:       data.reduce((s, r) => s + r.examFee, 0),
    totalFee:      data.reduce((s, r) => s + r.totalFee, 0),
    collectedAmt:  data.reduce((s, r) => s + r.collectedAmt, 0),
    pendingAmt:    data.reduce((s, r) => s + r.pendingAmt, 0),
  }), [data])
  const grandPct = totals.totalFee ? Math.round((totals.collectedAmt / totals.totalFee) * 100) : 0

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px]">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/60 dark:bg-white/[0.02]">
            {['#', 'Class', 'Sec', 'Students', 'Collected', 'Pending', 'Tuition', 'Transport', 'Activity', 'Library', 'Exam', 'Total Fee', 'Coll. Amt', 'Pending Amt', '%'].map((h, i) => (
              <th key={i} className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-8">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const { fg, bg } = classColor(row.class)
            return (
              <tr key={row.id} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-2.5 text-center text-[11px] text-slate-400 tabular-nums">{i + 1}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold" style={{ background: bg, color: fg }}>
                      {formatAbbr(row.class)}
                    </span>
                    <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{row.section}</span>
                </td>
                <td className="px-3 py-2.5 text-center text-[12px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{row.totalStudents}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 px-1.5 py-0.5 rounded-md tabular-nums">{row.collected}</span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className="text-[11px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 px-1.5 py-0.5 rounded-md tabular-nums">{row.pending}</span>
                </td>
                <td className="px-3 py-2.5 text-center text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">{fmtShort(row.tuitionFee)}</td>
                <td className="px-3 py-2.5 text-center text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">{fmtShort(row.transportFee)}</td>
                <td className="px-3 py-2.5 text-center text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">{fmtShort(row.activityFee)}</td>
                <td className="px-3 py-2.5 text-center text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">{fmtShort(row.libraryFee)}</td>
                <td className="px-3 py-2.5 text-center text-[11px] text-slate-600 dark:text-slate-400 tabular-nums">{fmtShort(row.examFee)}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{fmtShort(row.totalFee)}</span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{fmtShort(row.collectedAmt)}</span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <span className="text-[12px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">{fmtShort(row.pendingAmt)}</span>
                </td>
                <td className="px-3 py-2.5 text-center">
                  <PctBadge pct={row.collectionPct} />
                </td>
              </tr>
            )
          })}
          {/* Grand Total Row */}
          <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
            <td className="px-3 py-3 text-center text-[11px] text-blue-400">—</td>
            <td className="px-3 py-3" colSpan={2}>
              <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />Grand Total
              </span>
            </td>
            <td className="px-3 py-3 text-center text-[12px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">{totals.totalStudents}</td>
            <td className="px-3 py-3 text-center"><span className="text-[12px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 px-2 py-0.5 rounded-md tabular-nums">{totals.collected}</span></td>
            <td className="px-3 py-3 text-center"><span className="text-[12px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 px-2 py-0.5 rounded-md tabular-nums">{totals.pending}</span></td>
            <td className="px-3 py-3 text-center text-[11px] font-bold text-slate-600 dark:text-slate-400 tabular-nums">{fmtShort(totals.tuitionFee)}</td>
            <td className="px-3 py-3 text-center text-[11px] font-bold text-slate-600 dark:text-slate-400 tabular-nums">{fmtShort(totals.transportFee)}</td>
            <td className="px-3 py-3 text-center text-[11px] font-bold text-slate-600 dark:text-slate-400 tabular-nums">{fmtShort(totals.activityFee)}</td>
            <td className="px-3 py-3 text-center text-[11px] font-bold text-slate-600 dark:text-slate-400 tabular-nums">{fmtShort(totals.libraryFee)}</td>
            <td className="px-3 py-3 text-center text-[11px] font-bold text-slate-600 dark:text-slate-400 tabular-nums">{fmtShort(totals.examFee)}</td>
            <td className="px-3 py-3 text-center"><span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(totals.totalFee)}</span></td>
            <td className="px-3 py-3 text-center"><span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(totals.collectedAmt)}</span></td>
            <td className="px-3 py-3 text-center"><span className="text-[13px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">{fmt(totals.pendingAmt)}</span></td>
            <td className="px-3 py-3 text-center"><PctBadge pct={grandPct} /></td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────

function MobileCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5" style={{ background: bg, color: fg }}>
          {formatAbbr(row.class)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{row.class}</p>
            <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">Sec {row.section}</span>
            <PctBadge pct={row.collectionPct} />
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <span className="text-[11px] text-slate-400">Total: <span className="font-bold text-blue-700 dark:text-blue-400">{fmt(row.totalFee)}</span></span>
            <span className="text-slate-200 dark:text-slate-700">|</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">{fmt(row.collectedAmt)} collected</span>
          </div>
          <div className="mt-2">
            <CollectionBar pct={row.collectionPct} />
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Student count row */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{row.totalStudents}</p>
              <p className="text-[10px] font-bold uppercase text-blue-600 dark:text-blue-400 mt-0.5">Total</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <p className="text-[20px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{row.collected}</p>
              <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mt-0.5">Paid</p>
            </div>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3 text-center">
              <p className="text-[20px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{row.pending}</p>
              <p className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 mt-0.5">Pending</p>
            </div>
          </div>

          {/* Fee heads breakdown */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Fee Breakdown</p>
            {[
              { label: 'Tuition Fee', val: row.tuitionFee, color: 'text-blue-700 dark:text-blue-400' },
              { label: 'Transport Fee', val: row.transportFee, color: 'text-violet-700 dark:text-violet-400' },
              { label: 'Activity Fee', val: row.activityFee, color: 'text-amber-700 dark:text-amber-400' },
              { label: 'Library Fee', val: row.libraryFee, color: 'text-cyan-700 dark:text-cyan-400' },
              { label: 'Exam Fee', val: row.examFee, color: 'text-pink-700 dark:text-pink-400' },
            ].map(({ label, val, color }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[12px] text-slate-500 dark:text-slate-400">{label}</span>
                <span className={`text-[12px] font-semibold tabular-nums ${color}`}>{fmt(val)}</span>
              </div>
            ))}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-1 flex items-center justify-between">
              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Total Fee</span>
              <span className="text-[14px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{fmt(row.totalFee)}</span>
            </div>
          </div>

          {/* Collected vs Pending */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <p className="text-[16px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(row.collectedAmt)}</p>
              <p className="text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 mt-0.5">Collected</p>
            </div>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3 text-center">
              <p className="text-[16px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{fmt(row.pendingAmt)}</p>
              <p className="text-[10px] font-bold uppercase text-rose-600 dark:text-rose-400 mt-0.5">Outstanding</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SUMMARY TAB ──────────────────────────────────────────────────────────────

function SummaryTab({ data }) {
  const totals = useMemo(() => ({
    totalFee:     data.reduce((s, r) => s + r.totalFee, 0),
    collectedAmt: data.reduce((s, r) => s + r.collectedAmt, 0),
    pendingAmt:   data.reduce((s, r) => s + r.pendingAmt, 0),
    totalStudents:data.reduce((s, r) => s + r.totalStudents, 0),
    paid:         data.reduce((s, r) => s + r.collected, 0),
    pending:      data.reduce((s, r) => s + r.pending, 0),
    tuitionFee:   data.reduce((s, r) => s + r.tuitionFee, 0),
    transportFee: data.reduce((s, r) => s + r.transportFee, 0),
    activityFee:  data.reduce((s, r) => s + r.activityFee, 0),
    libraryFee:   data.reduce((s, r) => s + r.libraryFee, 0),
    examFee:      data.reduce((s, r) => s + r.examFee, 0),
  }), [data])
  const collPct = totals.totalFee ? Math.round((totals.collectedAmt / totals.totalFee) * 100) : 0

  // Class-wise summary
  const classSummary = useMemo(() => {
    const map = {}
    data.forEach(r => {
      if (!map[r.class]) map[r.class] = { class: r.class, totalFee: 0, collectedAmt: 0, pendingAmt: 0, students: 0 }
      map[r.class].totalFee += r.totalFee
      map[r.class].collectedAmt += r.collectedAmt
      map[r.class].pendingAmt += r.pendingAmt
      map[r.class].students += r.totalStudents
    })
    return Object.values(map)
  }, [data])

  return (
    <div className="space-y-5">
      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={IndianRupee} label="Total Demand"    value={fmtShort(totals.totalFee)}     color="blue"    trend={4}  />
        <StatCard icon={Wallet}      label="Total Collected" value={fmtShort(totals.collectedAmt)} color="emerald" trend={7}  />
        <StatCard icon={CreditCard}  label="Outstanding"     value={fmtShort(totals.pendingAmt)}   color="rose"    trend={-3} />
        <StatCard icon={Users}       label="Total Students"  value={totals.totalStudents}           color="violet"             />
      </div>

      {/* Collection rate big indicator */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-widest text-slate-400 mb-1">Overall Collection Rate</p>
            <div className="flex items-baseline gap-3">
              <span className={`text-[48px] font-black tabular-nums leading-none ${collPct >= 80 ? 'text-emerald-600' : collPct >= 50 ? 'text-amber-500' : 'text-rose-600'}`}>{collPct}%</span>
              <div className="flex flex-col">
                <span className="text-[13px] font-semibold text-emerald-600">{fmt(totals.collectedAmt)} collected</span>
                <span className="text-[13px] font-semibold text-rose-500">{fmt(totals.pendingAmt)} pending</span>
              </div>
            </div>
          </div>
          <div className="w-full sm:w-64">
            <CollectionBar pct={collPct} size="lg" />
            <div className="flex justify-between text-[11px] font-semibold mt-1.5">
              <span className="text-emerald-600">{collPct}% Collected</span>
              <span className="text-rose-500">{100 - collPct}% Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* Fee head breakdown */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-5 shadow-sm">
        <h3 className="text-[13px] font-bold text-slate-700 dark:text-slate-200 mb-4 flex items-center gap-2">
          <Banknote className="w-4 h-4 text-blue-600 dark:text-blue-400" />Fee Head-wise Demand
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: 'Tuition', val: totals.tuitionFee, color: 'blue' },
            { label: 'Transport', val: totals.transportFee, color: 'violet' },
            { label: 'Activity', val: totals.activityFee, color: 'amber' },
            { label: 'Library', val: totals.libraryFee, color: 'cyan' },
            { label: 'Exam', val: totals.examFee, color: 'pink' },
          ].map(({ label, val, color }) => {
            const colorMap = {
              blue:   'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
              violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border-violet-100 dark:border-violet-500/20',
              amber:  'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
              cyan:   'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20',
              pink:   'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-400 border-pink-100 dark:border-pink-500/20',
            }
            return (
              <div key={label} className={`rounded-xl border p-3 text-center ${colorMap[color]}`}>
                <p className="text-[18px] font-bold tabular-nums leading-tight">{fmtShort(val)}</p>
                <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5 opacity-80">{label}</p>
                <p className="text-[10px] opacity-60 mt-0.5">{totals.totalFee ? Math.round((val / totals.totalFee) * 100) : 0}% of total</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Class-wise collection summary */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Class-wise Collection Summary</span>
        </div>
        <div className="p-4 space-y-3">
          {classSummary.map(cs => {
            const pct = cs.totalFee ? Math.round((cs.collectedAmt / cs.totalFee) * 100) : 0
            const { fg, bg } = classColor(cs.class)
            return (
              <div key={cs.class} className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold" style={{ background: bg, color: fg }}>
                  {formatAbbr(cs.class)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{cs.class}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 tabular-nums hidden sm:inline">{fmt(cs.collectedAmt)} / {fmt(cs.totalFee)}</span>
                      <PctBadge pct={pct} />
                    </div>
                  </div>
                  <CollectionBar pct={pct} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── DETAIL TAB ───────────────────────────────────────────────────────────────

function DetailTab({ data, search, setSearch }) {
  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter(r =>
      r.class.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q)
    )
  }, [data, search])

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3 flex-1">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Section-wise Reconciliation</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
            {filtered.length} records
          </span>
        </div>
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

      {/* Info */}
      <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
        <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        <p className="text-[11px] text-blue-700 dark:text-blue-400">
          All amounts shown in ₹. Scroll horizontally on desktop for full breakdown. On mobile, tap a card for details.
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
            <Search className="w-6 h-6 opacity-40" />
            <span className="text-[13px]">No records match your search.</span>
          </div>
        ) : (
          <DesktopTable data={filtered} />
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
            <Search className="w-6 h-6 opacity-40" />
            <span className="text-[13px]">No records match your search.</span>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
              <Info className="w-3.5 h-3.5" />Tap a card to see full fee breakdown.
            </p>
            {filtered.map(row => <MobileCard key={row.id} row={row} />)}

            {/* Mobile Grand Total */}
            <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
              <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />Grand Total — {filtered.length} Sections
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Total Demand',  val: fmt(filtered.reduce((s, r) => s + r.totalFee, 0)),     color: 'text-blue-700 dark:text-blue-300' },
                  { label: 'Collected',     val: fmt(filtered.reduce((s, r) => s + r.collectedAmt, 0)), color: 'text-emerald-700 dark:text-emerald-300' },
                  { label: 'Outstanding',   val: fmt(filtered.reduce((s, r) => s + r.pendingAmt, 0)),   color: 'text-rose-700 dark:text-rose-300' },
                  { label: 'Students',      val: filtered.reduce((s, r) => s + r.totalStudents, 0),     color: 'text-violet-700 dark:text-violet-300' },
                ].map(({ label, val, color }) => (
                  <div key={label} className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                    <p className={`text-[18px] font-bold tabular-nums ${color}`}>{val}</p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
        <p className="text-[12px] text-slate-400 dark:text-slate-500">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{data.length}</span> records
        </p>
        {search && (
          <button onClick={() => setSearch('')} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <X className="w-3 h-3" />Clear search
          </button>
        )}
      </div>
    </div>
  )
}

// ─── BUS-WISE TAB ─────────────────────────────────────────────────────────────

function BuswiseTab({ data }) {
  const busData = useMemo(() => {
    const seed = data.length * 7 + 13
    return [
      { type: 'School Bus', routes: 3, students: Math.round(data.length * 4.1), collected: Math.round(data.length * 2800), pending: Math.round(data.length * 600), color: 'blue' },
      { type: 'Van',        routes: 5, students: Math.round(data.length * 2.8), collected: Math.round(data.length * 1900), pending: Math.round(data.length * 450), color: 'violet' },
      { type: 'Mini Bus',   routes: 2, students: Math.round(data.length * 1.6), collected: Math.round(data.length * 1200), pending: Math.round(data.length * 300), color: 'amber' },
      { type: 'No Transport', routes: 0, students: Math.round(data.length * 3.5), collected: 0, pending: 0, color: 'slate' },
    ]
  }, [data])

  const colorMap = {
    blue:   { card: 'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20', text: 'text-blue-700 dark:text-blue-400', badge: 'bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300' },
    violet: { card: 'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20', text: 'text-violet-700 dark:text-violet-400', badge: 'bg-violet-100 dark:bg-violet-500/20 text-violet-800 dark:text-violet-300' },
    amber:  { card: 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20', text: 'text-amber-700 dark:text-amber-400', badge: 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300' },
    slate:  { card: 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50', text: 'text-slate-600 dark:text-slate-400', badge: 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300' },
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {busData.map(b => {
          const c = colorMap[b.color]
          const total = b.collected + b.pending
          const pct = total ? Math.round((b.collected / total) * 100) : 0
          return (
            <div key={b.type} className={`rounded-2xl border ${c.card} p-5 space-y-3`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.badge}`}>
                    <Bus className="w-5 h-5" />
                  </span>
                  <div>
                    <p className={`text-[14px] font-bold ${c.text}`}>{b.type}</p>
                    {b.routes > 0 && <p className="text-[11px] text-slate-400">{b.routes} routes</p>}
                  </div>
                </div>
                <span className={`text-[13px] font-bold tabular-nums ${c.text}`}>{b.students} students</span>
              </div>

              {b.type !== 'No Transport' ? (
                <>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-semibold">
                      <span className="text-emerald-600 dark:text-emerald-400">Collected: {fmt(b.collected)}</span>
                      <span className="text-rose-500">Pending: {fmt(b.pending)}</span>
                    </div>
                    <CollectionBar pct={pct} />
                    <p className={`text-[11px] font-bold text-right ${c.text}`}>{pct}% collected</p>
                  </div>
                </>
              ) : (
                <p className="text-[12px] text-slate-400 italic">No transport fee applicable</p>
              )}
            </div>
          )
        })}
      </div>

      {/* Bus-wise table on desktop */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
          <Bus className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Transport Fee Summary</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                {['Bus Type', 'Routes', 'Students', 'Total Demand', 'Collected', 'Outstanding', 'Collection %'].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {busData.filter(b => b.type !== 'No Transport').map((b, i) => {
                const total = b.collected + b.pending
                const pct = total ? Math.round((b.collected / total) * 100) : 0
                return (
                  <tr key={b.type} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-center">
                      <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-1.5">
                        <Bus className="w-3.5 h-3.5 text-violet-500" />{b.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-[12px] font-semibold text-slate-600 dark:text-slate-400 tabular-nums">{b.routes}</td>
                    <td className="px-4 py-3 text-center text-[12px] font-semibold text-blue-700 dark:text-blue-400 tabular-nums">{b.students}</td>
                    <td className="px-4 py-3 text-center text-[12px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">{fmt(total)}</td>
                    <td className="px-4 py-3 text-center"><span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{fmt(b.collected)}</span></td>
                    <td className="px-4 py-3 text-center"><span className="text-[12px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">{fmt(b.pending)}</span></td>
                    <td className="px-4 py-3 text-center"><PctBadge pct={pct} /></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── FILTER DRAWER (MOBILE) ───────────────────────────────────────────────────

function FilterDrawer({ open, onClose, session, setSession, cls, setCls, busType, setBusType, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}>
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
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
          <Field label="Class">
            <NativeSelect value={cls} onChange={e => setCls(e.target.value)}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Bus Type">
            <NativeSelect value={busType} onChange={e => setBusType(e.target.value)}>
              {BUS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
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

export default function FeeReconciliationReport() {
  const [session,    setSession]    = useState('')
  const [cls,        setCls]        = useState('All Classes')
  const [busType,    setBusType]    = useState('All Bus Types')
  const [data,       setData]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [activeTab,  setActiveTab]  = useState('summary')
  const [shownMeta,  setShownMeta]  = useState({ session: '', cls: '', busType: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const generated = generateData(session, cls, busType)
      setData(generated)
      setShownMeta({ session, cls, busType })
      setShown(true)
      setActiveTab('summary')
      setLoading(false)
      showToast(`Loaded ${generated.length} records for session ${session}.`)
    }, 700)
  }, [session, cls, busType])

  const handleReset = () => {
    setSession(''); setCls('All Classes'); setBusType('All Bus Types')
    setData([]); setSearch(''); setErrors({})
    setShown(false); setShownMeta({ session: '', cls: '', busType: '' })
  }

  const handleExcel = () => {
    if (data.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  const hasResults = shown && data.length > 0
  const activeFilters = [session, cls !== 'All Classes' && cls, busType !== 'All Bus Types' && busType].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Fee Reconciliation Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Session-wise fee demand, collection &amp; outstanding — class &amp; transport breakdown.
          </p>
        </div>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* DESKTOP Filter Card */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session} onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Select Class">
              <NativeSelect value={cls} onChange={e => setCls(e.target.value)}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Select Bus Type">
              <NativeSelect value={busType} onChange={e => setBusType(e.target.value)}>
                {BUS_TYPES.map(b => <option key={b} value={b}>{b}</option>)}
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
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset filters">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE Filter Bar */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 ? `${activeFilters} Filter${activeFilters > 1 ? 's' : ''} Applied` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
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
        open={filterOpen} onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        busType={busType} setBusType={setBusType}
        onShow={handleShow} loading={loading} errors={errors}
      />

      {/* Loading Skeleton */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* Results */}
      {hasResults && !loading && (
        <>
          <SchoolHeader session={shownMeta.session} cls={shownMeta.cls} busType={shownMeta.busType} />

          {/* Tab Bar */}
          <TabBar active={activeTab} onChange={setActiveTab} />

          {/* Tab Content */}
          {activeTab === 'summary' && <SummaryTab data={data} />}
          {activeTab === 'detail'  && <DetailTab  data={data} search={search} setSearch={setSearch} />}
          {activeTab === 'buswise' && <BuswiseTab data={data} />}
        </>
      )}

      {/* Empty State */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Receipt className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-bold text-slate-600 dark:text-slate-400">No report generated yet</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session, class, and bus type then click <strong>Show</strong> to generate the fee reconciliation report.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {['Session-wise Summary', 'Fee Head Breakdown', 'Transport Analysis', 'Collection %'].map(tag => (
              <span key={tag} className="text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
