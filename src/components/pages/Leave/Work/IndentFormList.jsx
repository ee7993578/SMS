/**
 * IndentFormList.jsx
 * Folder: src/pages/Leave/IndentFormList.jsx
 *
 * Converts legacy ASPX "Indent Form List" page to fully-responsive React + Tailwind.
 *
 * Each indent form has header info (indent no, faculty, date) plus a HOD approval
 * stage, a Principal approval stage, and a list of requested items (desc, qty,
 * price, total, department, reason/purpose) — mirroring the nested GridView2 /
 * GridView3 structure of the original page.
 *
 * Features:
 *  - Session / Faculty / Status filters (desktop bar, mobile drawer)
 *  - Show button + client-side search across loaded records
 *  - Expand/collapse per record to reveal requested items (desktop row, mobile card)
 *  - "View" action opens a full detail modal with an approval timeline
 *  - Summary stat cards (total indents, approved, pending, total value)
 *  - Mobile: card stack, no horizontal scroll, thumb-friendly controls
 *  - Desktop: dense ERP-style table with sticky header
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2, ChevronDown,
  ChevronRight, Search, Info, SlidersHorizontal, ClipboardList, Package,
  CheckCircle2, Clock3, XCircle, Building2, CalendarDays, IndianRupee,
  User, FileText, ArrowRight, ListChecks, Layers,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────
const SESSIONS = ['2023-24', '2024-25', '2025-26']
const FACULTIES = ['Dr. Ramesh Gupta', 'Mrs. Sunita Sharma', 'Mr. Amit Verma', 'Dr. Priya Singh', 'Mr. Vikram Yadav']

const STATUS_OPTIONS = [
  { value: '0', label: 'Select All Status' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Not Approved', label: 'Not Approved' },
]

// item = { id, itemdesc, itemqty, price, department, reason_purpose }; totalamount derived
const item = (id, itemdesc, itemqty, price, department, reason_purpose) => ({
  id, itemdesc, itemqty, price, totalamount: itemqty * price, department, reason_purpose,
})

const indent = (indentno, name, date, hod, principal, items) => ({
  indentno, name, date, headofdepartment_approval: hod, principal_approval: principal, items,
})

const INDENT_DATA = {
  '2023-24': [
    indent('IND/23-24/001', 'Dr. Ramesh Gupta', '14 Jul 2023', 'Approved', 'Approved', [
      item('a1', 'A4 Paper Ream', 12, 320, 'Administration', 'Routine office stationery replenishment'),
      item('a2', 'Printer Toner Cartridge', 2, 2450, 'Administration', 'Printer running low on toner'),
    ]),
    indent('IND/23-24/002', 'Mrs. Sunita Sharma', '02 Aug 2023', 'Approved', 'Pending', [
      item('b1', 'Chemistry Reagent Kit', 3, 1850, 'Chemistry', 'Lab consumables for practical sessions'),
      item('b2', 'Lab Beakers (Set of 12)', 4, 640, 'Chemistry', 'Replacement of damaged glassware'),
    ]),
    indent('IND/23-24/003', 'Mr. Amit Verma', '20 Aug 2023', 'Pending', 'Pending', [
      item('c1', 'Network Switch 24-port', 1, 8200, 'Computer Science', 'IT infrastructure upgrade'),
    ]),
    indent('IND/23-24/004', 'Dr. Priya Singh', '05 Sep 2023', 'Approved', 'Approved', [
      item('d1', 'Library Reference Books', 25, 410, 'Library', 'Library collection update'),
      item('d2', 'Whiteboard Markers (Box)', 6, 180, 'Library', 'Routine office stationery replenishment'),
    ]),
    indent('IND/23-24/005', 'Mr. Vikram Yadav', '18 Sep 2023', 'Rejected', 'Rejected', [
      item('e1', 'Sports Kit - Volleyball', 5, 1450, 'Sports', 'Annual sports equipment requirement'),
    ]),
    indent('IND/23-24/006', 'Dr. Ramesh Gupta', '03 Oct 2023', 'Approved', 'Approved', [
      item('f1', 'Drawing Sheets (Ream)', 8, 260, 'Administration', 'Routine office stationery replenishment'),
      item('f2', 'Microscope Slides (Pack)', 6, 390, 'Physics', 'Lab consumables for practical sessions'),
      item('f3', 'Projector Replacement Bulb', 2, 3100, 'Physics', 'Replacement of damaged equipment'),
    ]),
  ],
  '2024-25': [
    indent('IND/24-25/001', 'Mrs. Sunita Sharma', '10 May 2024', 'Approved', 'Approved', [
      item('g1', 'A4 Paper Ream', 15, 330, 'Administration', 'Routine office stationery replenishment'),
    ]),
    indent('IND/24-25/002', 'Mr. Amit Verma', '28 May 2024', 'Approved', 'Pending', [
      item('h1', 'Network Switch 24-port', 2, 8400, 'Computer Science', 'IT infrastructure upgrade'),
      item('h2', 'Printer Toner Cartridge', 3, 2500, 'Computer Science', 'Printer running low on toner'),
    ]),
    indent('IND/24-25/003', 'Dr. Priya Singh', '14 Jun 2024', 'Pending', 'Pending', [
      item('i1', 'Library Reference Books', 30, 420, 'Library', 'Library collection update'),
    ]),
    indent('IND/24-25/004', 'Mr. Vikram Yadav', '02 Jul 2024', 'Approved', 'Approved', [
      item('j1', 'Sports Kit - Volleyball', 6, 1500, 'Sports', 'Annual sports equipment requirement'),
      item('j2', 'Drawing Sheets (Ream)', 10, 270, 'Sports', 'Routine office stationery replenishment'),
    ]),
    indent('IND/24-25/005', 'Dr. Ramesh Gupta', '21 Jul 2024', 'Rejected', 'Rejected', [
      item('k1', 'Chemistry Reagent Kit', 4, 1900, 'Chemistry', 'Lab consumables for practical sessions'),
    ]),
    indent('IND/24-25/006', 'Mrs. Sunita Sharma', '09 Aug 2024', 'Approved', 'Approved', [
      item('l1', 'Lab Beakers (Set of 12)', 5, 660, 'Chemistry', 'Replacement of damaged glassware'),
      item('l2', 'Microscope Slides (Pack)', 8, 400, 'Chemistry', 'Lab consumables for practical sessions'),
    ]),
    indent('IND/24-25/007', 'Mr. Amit Verma', '30 Aug 2024', 'Approved', 'Approved', [
      item('m1', 'Whiteboard Markers (Box)', 8, 190, 'Computer Science', 'Routine office stationery replenishment'),
    ]),
  ],
  '2025-26': [
    indent('IND/25-26/001', 'Dr. Priya Singh', '18 Apr 2025', 'Approved', 'Approved', [
      item('n1', 'Projector Replacement Bulb', 3, 3200, 'Physics', 'Replacement of damaged equipment'),
      item('n2', 'A4 Paper Ream', 10, 335, 'Physics', 'Routine office stationery replenishment'),
    ]),
    indent('IND/25-26/002', 'Mr. Vikram Yadav', '02 May 2025', 'Pending', 'Pending', [
      item('o1', 'Sports Kit - Volleyball', 7, 1550, 'Sports', 'Annual sports equipment requirement'),
    ]),
    indent('IND/25-26/003', 'Dr. Ramesh Gupta', '21 May 2025', 'Approved', 'Pending', [
      item('p1', 'Printer Toner Cartridge', 4, 2550, 'Administration', 'Printer running low on toner'),
      item('p2', 'Drawing Sheets (Ream)', 12, 280, 'Administration', 'Routine office stationery replenishment'),
    ]),
    indent('IND/25-26/004', 'Mrs. Sunita Sharma', '09 Jun 2025', 'Approved', 'Approved', [
      item('q1', 'Chemistry Reagent Kit', 5, 1950, 'Chemistry', 'Lab consumables for practical sessions'),
      item('q2', 'Lab Beakers (Set of 12)', 6, 680, 'Chemistry', 'Replacement of damaged glassware'),
    ]),
    indent('IND/25-26/005', 'Mr. Amit Verma', '27 Jun 2025', 'Rejected', 'Rejected', [
      item('r1', 'Network Switch 24-port', 1, 8600, 'Computer Science', 'IT infrastructure upgrade'),
    ]),
    indent('IND/25-26/006', 'Dr. Priya Singh', '11 Jul 2025', 'Approved', 'Approved', [
      item('s1', 'Library Reference Books', 35, 430, 'Library', 'Library collection update'),
    ]),
  ],
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
const formatCurrency = (n = 0) => `₹${n.toLocaleString('en-IN')}`

const overallStatus = (rec) =>
  rec.headofdepartment_approval === 'Approved' && rec.principal_approval === 'Approved'
    ? 'Approved'
    : 'Not Approved'

const STATUS_STYLE = {
  Approved: {
    icon: CheckCircle2,
    pill: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  Pending: {
    icon: Clock3,
    pill: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25',
    dot: 'bg-amber-500',
  },
  Rejected: {
    icon: XCircle,
    pill: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25',
    dot: 'bg-rose-500',
  },
}

const indentTotal = (rec) => rec.items.reduce((s, it) => s + it.totalamount, 0)

// ─── PRIMITIVE COMPONENTS ──────────────────────────────────────────────────
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
      <button onClick={onClose} aria-label="Dismiss notification"><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

function StatusPill({ status, size = 'md' }) {
  const cfg = STATUS_STYLE[status] || STATUS_STYLE.Pending
  const Icon = cfg.icon
  const sizeCls = size === 'sm' ? 'px-2 py-0.5 text-[10px] gap-1' : 'px-2.5 py-1 text-[11px] gap-1.5'
  return (
    <span className={`inline-flex items-center ${sizeCls} rounded-full border font-bold ${cfg.pill}`}>
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {status}
    </span>
  )
}

// ─── SUMMARY STAT CARD ──────────────────────────────────────────────────────
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
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight truncate">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── ITEMS TABLE (desktop expand — proper table, no horizontal scroll needed
//     since it's already inside the wide desktop table container) ───────────
function ItemsTableDesktop({ items }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-100/80 dark:bg-white/[0.03]">
            {['Item Description', 'Qty', 'Price', 'Total', 'Department', 'Reason / Purpose'].map((h) => (
              <th key={h} className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((it, i) => (
            <tr key={it.id} className={i % 2 === 0 ? 'bg-white dark:bg-[#1a1f35]' : 'bg-slate-50/60 dark:bg-white/[0.015]'}>
              <td className="px-3 py-2 text-[12.5px] font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{it.itemdesc}</td>
              <td className="px-3 py-2 text-[12.5px] text-slate-600 dark:text-slate-300 tabular-nums">{it.itemqty}</td>
              <td className="px-3 py-2 text-[12.5px] text-slate-600 dark:text-slate-300 tabular-nums">{formatCurrency(it.price)}</td>
              <td className="px-3 py-2 text-[12.5px] font-semibold text-blue-700 dark:text-blue-400 tabular-nums">{formatCurrency(it.totalamount)}</td>
              <td className="px-3 py-2 text-[12.5px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{it.department}</td>
              <td className="px-3 py-2 text-[12.5px] text-slate-500 dark:text-slate-400">{it.reason_purpose}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── ITEMS LIST (mobile expand — stacked cards, never a wide table) ────────
function ItemsListMobile({ items }) {
  return (
    <div className="space-y-2">
      {items.map((it) => (
        <div key={it.id} className="rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/60 dark:bg-white/[0.02] p-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{it.itemdesc}</p>
            <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums flex-shrink-0">{formatCurrency(it.totalamount)}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            Qty <span className="font-semibold text-slate-600 dark:text-slate-300">{it.itemqty}</span>
            &nbsp;·&nbsp; Price <span className="font-semibold text-slate-600 dark:text-slate-300">{formatCurrency(it.price)}</span>
            &nbsp;·&nbsp; <span className="font-semibold text-slate-600 dark:text-slate-300">{it.department}</span>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">{it.reason_purpose}</p>
        </div>
      ))}
    </div>
  )
}

// ─── APPROVAL TIMELINE (used in detail modal) ──────────────────────────────
function ApprovalTimeline({ rec }) {
  const steps = [
    { label: 'Submitted', status: 'Approved' },
    { label: 'HOD Approval', status: rec.headofdepartment_approval },
    { label: 'Principal Approval', status: rec.principal_approval },
  ]
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {steps.map((s, i) => {
        const cfg = STATUS_STYLE[s.status] || STATUS_STYLE.Pending
        return (
          <div key={s.label} className="flex items-center gap-1.5 flex-shrink-0">
            <div className="flex flex-col items-center gap-1">
              <span className={`w-3 h-3 rounded-full ${cfg.dot}`} />
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{s.label}</span>
            </div>
            {i < steps.length - 1 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mb-4" />}
          </div>
        )
      })}
    </div>
  )
}

// ─── DETAIL MODAL (replaces legacy "Show" → detail page navigation) ───────
function DetailModal({ rec, onClose }) {
  if (!rec) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <div
          className="w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
          style={{ animation: 'modalUp .2s ease' }}
        >
          <style>{`@keyframes modalUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)]">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </span>
              <div className="min-w-0">
                <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100 truncate">{rec.indentno}</p>
                <p className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                  <User className="w-3 h-3 flex-shrink-0" /> {rec.name}
                </p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close details" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex-shrink-0">
              <X className="w-4.5 h-4.5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-5">
            <div className="flex flex-wrap items-center gap-4 text-[12px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5"><CalendarDays className="w-3.5 h-3.5" /> {rec.date}</span>
              <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5" /> {rec.items.length} item{rec.items.length !== 1 ? 's' : ''}</span>
              <span className="flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400"><IndianRupee className="w-3.5 h-3.5" /> {formatCurrency(indentTotal(rec)).slice(1)}</span>
            </div>

            <div className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02] p-4">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">Approval Status</p>
              <ApprovalTimeline rec={rec} />
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5" /> Requested Items
              </p>
              <div className="hidden sm:block">
                <ItemsTableDesktop items={rec.items} />
              </div>
              <div className="sm:hidden">
                <ItemsListMobile items={rec.items} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/50 dark:bg-white/[0.015]">
            <span className="text-[12px] text-slate-500 dark:text-slate-400">Total Indent Value</span>
            <span className="text-[18px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{formatCurrency(indentTotal(rec))}</span>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ──────────────────────────────────────────────────────
function DesktopRow({ rec, idx, onView }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

        {/* Expand toggle */}
        <td className="px-2 py-3 text-center">
          <button
            type="button"
            onClick={() => setExpanded((p) => !p)}
            aria-label={expanded ? 'Collapse items' : 'Expand items'}
            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors flex-shrink-0
              ${expanded ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </td>

        {/* Indent No */}
        <td className="px-3 py-3">
          <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{rec.indentno}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5"><CalendarDays className="w-3 h-3" />{rec.date}</p>
        </td>

        {/* Faculty */}
        <td className="px-3 py-3">
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{rec.name}</span>
        </td>

        {/* Items count */}
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            <Package className="w-3 h-3" />{rec.items.length}
          </span>
        </td>

        {/* HOD status */}
        <td className="px-3 py-3 text-center"><StatusPill status={rec.headofdepartment_approval} /></td>

        {/* Principal status */}
        <td className="px-3 py-3 text-center"><StatusPill status={rec.principal_approval} /></td>

        {/* Total */}
        <td className="px-3 py-3 text-right">
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums whitespace-nowrap">{formatCurrency(indentTotal(rec))}</span>
        </td>

        {/* Action */}
        <td className="px-3 py-3 text-center">
          <button
            type="button"
            onClick={() => onView(rec)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors active:scale-95"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="bg-slate-50/40 dark:bg-white/[0.015]">
          <td></td>
          <td colSpan={8} className="px-4 py-3">
            <ItemsTableDesktop items={rec.items} />
          </td>
        </tr>
      )}
    </>
  )
}

// ─── MOBILE CARD ────────────────────────────────────────────────────────────
function MobileCard({ rec, onView }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <FileText className="w-4.5 h-4.5" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{rec.indentno}</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{rec.name} · {rec.date}</p>
        </div>

        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[15px] font-bold text-blue-700 dark:text-blue-400 tabular-nums leading-tight">{formatCurrency(indentTotal(rec))}</span>
          <span className="text-[10px] text-slate-400">{rec.items.length} item{rec.items.length !== 1 ? 's' : ''}</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Status row */}
      <div className="px-4 pb-3 flex items-center gap-2 flex-wrap">
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">HOD</span>
        <StatusPill status={rec.headofdepartment_approval} size="sm" />
        <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 ml-2">Principal</span>
        <StatusPill status={rec.principal_approval} size="sm" />
      </div>

      {/* Expanded items */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <ItemsListMobile items={rec.items} />
          <button
            type="button"
            onClick={() => onView(rec)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors active:scale-95"
          >
            <Eye className="w-4 h-4" /> View Full Details
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ───────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, faculty, setFaculty, status, setStatus, onShow, loading, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filter Indents</span>
          </div>
          <button onClick={onClose} aria-label="Close filters" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={(e) => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Faculty">
            <NativeSelect value={faculty} onChange={(e) => setFaculty(e.target.value)}>
              <option value="All">All Faculty</option>
              {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Status">
            <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
            Show
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function IndentFormList() {
  const [session,     setSession]     = useState('')
  const [faculty,      setFaculty]     = useState('All')
  const [status,       setStatus]      = useState('Approved')
  const [rows,         setRows]        = useState([])
  const [loading,      setLoading]     = useState(false)
  const [filterOpen,   setFilterOpen]  = useState(false)
  const [search,       setSearch]      = useState('')
  const [errors,       setErrors]      = useState({})
  const [toast,        setToast]       = useState(null)
  const [shown,        setShown]       = useState(false)
  const [shownSession, setShownSession]= useState('')
  const [viewRec,       setViewRec]    = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = INDENT_DATA[session] || []
      if (faculty !== 'All') data = data.filter((r) => r.name === faculty)
      if (status !== '0') data = data.filter((r) => overallStatus(r) === status)
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} indent form${data.length !== 1 ? 's' : ''} for session ${session}.`)
    }, 650)
  }, [session, faculty, status])

  const handleReset = () => {
    setSession(''); setFaculty('All'); setStatus('Approved')
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownSession('')
  }

  // ── Search filter (client-side, within loaded records) ────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter((r) => r.indentno.toLowerCase().includes(q) || r.name.toLowerCase().includes(q))
  }, [rows, search])

  // ── Summary ──────────────────────────────────────────────────────────
  const summary = useMemo(() => ({
    total: filtered.length,
    approved: filtered.filter((r) => overallStatus(r) === 'Approved').length,
    pending: filtered.filter((r) => overallStatus(r) === 'Not Approved').length,
    value: filtered.reduce((s, r) => s + indentTotal(r), 0),
  }), [filtered])

  const hasResults = shown && rows.length > 0
  const activeFilters = (session ? 1 : 0) + (faculty !== 'All' ? 1 : 0) + (status !== '0' ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Indent Form List
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Track faculty purchase indents with HOD and Principal approval status.
        </p>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────── */}
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
                onChange={(e) => { setSession(e.target.value); setErrors((p) => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Faculty">
              <NativeSelect value={faculty} onChange={(e) => setFaculty(e.target.value)}>
                <option value="All">All Faculty</option>
                {FACULTIES.map((f) => <option key={f} value={f}>{f}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Status">
              <NativeSelect value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
              <button type="button" onClick={handleReset} aria-label="Reset filters"
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ───────────────────────────────────────── */}
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
          <button type="button" onClick={handleReset} aria-label="Reset filters"
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        faculty={faculty} setFaculty={setFaculty}
        status={status} setStatus={setStatus}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={ClipboardList} label="Total Indents"   value={summary.total}                    color="blue"    />
            <SummaryCard icon={CheckCircle2}  label="Fully Approved"  value={summary.approved}                 color="emerald" />
            <SummaryCard icon={Clock3}        label="Awaiting Action" value={summary.pending}                  color="amber"   />
            <SummaryCard icon={IndianRupee}   label="Total Value"     value={formatCurrency(summary.value)}    color="violet"  />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Indent Forms</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search indent no. or faculty…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Click the arrow to expand requested items, or use View to open full approval details.
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
                      <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-12">S.No.</th>
                      <th className="px-2 py-2.5 w-10"></th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Indent No.</th>
                      <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Faculty Name</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Items</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">HOD Status</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Principal Status</th>
                      <th className="px-3 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Total</th>
                      <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((rec, i) => (
                      <DesktopRow key={rec.indentno} rec={rec} idx={i + 1} onView={setViewRec} />
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
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see requested items.
                  </p>
                  {filtered.map((rec) => (
                    <MobileCard key={rec.indentno} rec={rec} onView={setViewRec} />
                  ))}
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

      {/* ── Empty State ─────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No indent forms loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to load indent forms.
            </p>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal rec={viewRec} onClose={() => setViewRec(null)} />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
