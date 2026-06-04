/**
 * LateFeeReport.jsx
 * Folder: src/pages/Fee/Reports/LateFeeReport.jsx
 *
 * Premium, fully-responsive Late Fee Report page.
 * Converted from legacy ASPX — same workflow, modern UI.
 *
 * Features:
 *  - Session dropdown + Fee Type radio (Regular / Transport / Hostel)
 *  - Show report button with loading state
 *  - Summary stat cards (total records, total late fee, unique classes, pay modes)
 *  - Desktop: dense sticky-header table
 *  - Mobile: card-based layout with expandable details
 *  - Search/filter by name, class, adm no
 *  - Export to CSV placeholder
 *  - Toast notifications
 *  - Empty & loading states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, Search, FileDown, SlidersHorizontal,
  Info, IndianRupee, CalendarDays, CreditCard, BookOpen,
  TrendingUp, Users, Clock, Banknote, BadgeIndianRupee,
  Receipt, Building2, MapPin, GraduationCap, UserRound, Hash
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const FEE_TYPES = [
  { id: 'regular',   label: 'Regular',   icon: BookOpen },
  { id: 'transport', label: 'Transport', icon: Building2 },
  { id: 'hostel',    label: 'Hostel',    icon: MapPin },
]

// Pay mode colors
const PAYMODE_STYLE = {
  Cash:       { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400' },
  Online:     { bg: 'bg-blue-100 dark:bg-blue-500/15',    text: 'text-blue-700 dark:text-blue-400' },
  Cheque:     { bg: 'bg-amber-100 dark:bg-amber-500/15',  text: 'text-amber-700 dark:text-amber-400' },
  DD:         { bg: 'bg-violet-100 dark:bg-violet-500/15',text: 'text-violet-700 dark:text-violet-400' },
  UPI:        { bg: 'bg-cyan-100 dark:bg-cyan-500/15',    text: 'text-cyan-700 dark:text-cyan-400' },
  'Net Banking':{ bg: 'bg-indigo-100 dark:bg-indigo-500/15', text: 'text-indigo-700 dark:text-indigo-400' },
}

// Generate rich dummy data per session + fee type
const generateData = (session, feeType) => {
  const classes = ['Class I','Class II','Class III','Class IV','Class V',
                   'Class VI','Class VII','Class VIII','Class IX','Class X',
                   'Class XI','Class XII']
  const fathers = ['Ramesh Kumar','Suresh Sharma','Anil Verma','Vijay Singh',
                   'Rajesh Gupta','Manoj Tiwari','Deepak Yadav','Sanjay Mishra',
                   'Arun Pandey','Vinod Joshi','Prem Lal','Ganesh Rao',
                   'Harish Soni','Naveen Dixit','Pankaj Saxena','Lalit Rawat']
  const names = ['Aarav','Riya','Arjun','Sneha','Rohan','Priya','Vivek','Anjali',
                 'Mohit','Divya','Saurabh','Pooja','Nikhil','Meera','Akash','Kavya',
                 'Rahul','Nisha','Deepak','Shreya','Kunal','Preeti','Amit','Swati']
  const modes = ['Cash','Online','UPI','Net Banking','Cheque','DD']

  const seed = session.charCodeAt(0) + feeType.charCodeAt(0)
  const count = 18 + (seed % 12)
  const rows = []

  for (let i = 0; i < count; i++) {
    const idx = (i * 7 + seed) % names.length
    const classIdx = (i * 3 + seed) % classes.length
    const modeIdx = (i * 5 + seed) % modes.length
    const day = 10 + ((i * 3 + seed) % 20)
    const month = 4 + ((i + seed) % 8)
    const year = parseInt(session.split('-')[0]) + (month > 3 ? 0 : 1)
    const instNo = (i % 4) + 1
    const lateFee = 50 + ((i * 37 + seed) % 450)

    rows.push({
      id: i + 1,
      adm_no: `ADM/${session.replace('-', '/')}/${String(1001 + i * 3).padStart(4, '0')}`,
      name: names[idx] + ' ' + (feeType === 'hostel' ? 'Hostel' : ''),
      class: classes[classIdx],
      father_name: fathers[idx % fathers.length],
      inst_no: instNo,
      pay_mode: modes[modeIdx],
      pay_date: `${String(day).padStart(2,'0')}-${String(month).padStart(2,'0')}-${year}`,
      late_fee: lateFee,
    })
  }

  return rows
}

// Pre-generate data map
const DATA_MAP = {}
SESSIONS.forEach(s => {
  FEE_TYPES.forEach(f => {
    DATA_MAP[`${s}_${f.id}`] = generateData(s, f.id)
  })
})

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

// ─── PAY MODE BADGE ──────────────────────────────────────────────────────────
function PayModeBadge({ mode }) {
  const style = PAYMODE_STYLE[mode] || { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-400' }
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${style.bg} ${style.text}`}>
      <CreditCard className="w-3 h-3 flex-shrink-0" />
      {mode}
    </span>
  )
}

// ─── SUMMARY CARD ─────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] sm:text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-600 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, feeType }) {
  const feeLabel = FEE_TYPES.find(f => f.id === feeType)?.label || ''
  return (
    <div className="rounded-2xl border border-rose-100 dark:border-[rgba(239,68,68,0.2)]
      bg-gradient-to-r from-rose-50 via-white to-orange-50
      dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35]
      px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
        <h2 className="text-[15px] sm:text-[17px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-rose-100 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/25">
          <span className="text-[12px] font-bold text-rose-700 dark:text-rose-400">{feeLabel} Fee</span>
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-400">
        Late Fee Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ────────────────────────────────────────────────────────────
function DesktopTable({ rows, totalFee }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
        <Search className="w-6 h-6 opacity-40" />
        <span className="text-[13px]">No records match your search.</span>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px]">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/80 dark:bg-white/[0.02]">
            {[
              { label: 'S.No.',        w: 'w-12' },
              { label: 'Adm. No.',     w: '' },
              { label: 'Student Name', w: '' },
              { label: 'Class',        w: '' },
              { label: 'Father Name',  w: '' },
              { label: 'Inst. No.',    w: 'w-20 text-center' },
              { label: 'Pay Mode',     w: 'text-center' },
              { label: 'Pay Date',     w: 'text-center' },
              { label: 'Late Fee (₹)', w: 'text-right' },
            ].map((h, i) => (
              <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap ${h.w}`}>
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id}
              className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)]
                hover:bg-rose-50/30 dark:hover:bg-rose-500/[0.03] transition-colors group"
            >
              {/* S.No */}
              <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-600 tabular-nums w-12">
                {i + 1}
              </td>
              {/* Adm No */}
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-[12px] font-mono font-semibold text-slate-600 dark:text-slate-300">
                  <Hash className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  {row.adm_no}
                </span>
              </td>
              {/* Name */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400
                    text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {row.name.charAt(0)}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                    {row.name}
                  </span>
                </div>
              </td>
              {/* Class */}
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold
                  bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 whitespace-nowrap">
                  <GraduationCap className="w-3 h-3 flex-shrink-0" />
                  {row.class}
                </span>
              </td>
              {/* Father Name */}
              <td className="px-4 py-3 text-[13px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {row.father_name}
              </td>
              {/* Inst No */}
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg
                  bg-slate-100 dark:bg-slate-800 text-[12px] font-bold text-slate-600 dark:text-slate-300">
                  {row.inst_no}
                </span>
              </td>
              {/* Pay Mode */}
              <td className="px-4 py-3 text-center">
                <PayModeBadge mode={row.pay_mode} />
              </td>
              {/* Pay Date */}
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-400 font-mono">
                  <CalendarDays className="w-3 h-3 flex-shrink-0" />
                  {row.pay_date}
                </span>
              </td>
              {/* Late Fee */}
              <td className="px-4 py-3 text-right">
                <span className="inline-flex items-center justify-end gap-1 text-[14px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                  ₹{row.late_fee.toLocaleString('en-IN')}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
        {/* Grand Total Row */}
        <tfoot>
          <tr className="bg-rose-50 dark:bg-rose-500/[0.07] border-t-2 border-rose-200 dark:border-rose-500/30">
            <td className="px-4 py-3 text-center text-[12px] text-rose-400">—</td>
            <td className="px-4 py-3" colSpan={7}>
              <span className="flex items-center gap-2 text-[13px] font-bold text-rose-700 dark:text-rose-400">
                <TrendingUp className="w-4 h-4" />
                Grand Total — {rows.length} Record{rows.length !== 1 ? 's' : ''}
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              <span className="text-[15px] font-extrabold text-rose-700 dark:text-rose-400 tabular-nums">
                ₹{totalFee.toLocaleString('en-IN')}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── MOBILE FEE CARD ──────────────────────────────────────────────────────────
function MobileFeeCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)]
      bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">

      {/* Card Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400
          text-[13px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
          {row.name.charAt(0)}
        </span>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.name}</p>
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold
              bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
              {row.class}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            <span className="font-mono">{row.adm_no}</span>
            &nbsp;·&nbsp;Inst {row.inst_no}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <PayModeBadge mode={row.pay_mode} />
            <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <CalendarDays className="w-3 h-3 flex-shrink-0" />
              {row.pay_date}
            </span>
          </div>
        </div>

        {/* Late Fee Amount */}
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className="text-[18px] font-extrabold text-rose-600 dark:text-rose-400 tabular-nums leading-tight">
            ₹{row.late_fee.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">late fee</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 mt-1 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: UserRound,    label: "Father's Name", value: row.father_name, color: 'text-slate-700 dark:text-slate-200' },
              { icon: Hash,         label: 'Admission No',  value: row.adm_no,       color: 'text-blue-700 dark:text-blue-300 font-mono text-[11px]' },
              { icon: CalendarDays, label: 'Pay Date',      value: row.pay_date,     color: 'text-slate-700 dark:text-slate-200' },
              { icon: Receipt,      label: 'Installment',   value: `# ${row.inst_no}`, color: 'text-slate-700 dark:text-slate-200' },
            ].map(({ icon: Icon, label, value, color }, i) => (
              <div key={i} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                </div>
                <p className={`text-[13px] font-bold ${color} truncate`}>{value}</p>
              </div>
            ))}
          </div>
          {/* Late Fee highlight */}
          <div className="mt-2 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span className="text-[12px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wide">Late Fee Charged</span>
            </div>
            <span className="text-[20px] font-extrabold text-rose-700 dark:text-rose-300 tabular-nums">
              ₹{row.late_fee.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, feeType, setFeeType, onShow, loading, errors }) {
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
            <SlidersHorizontal className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Session */}
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

          {/* Fee Type */}
          <Field label="Fee Type">
            <div className="grid grid-cols-3 gap-2">
              {FEE_TYPES.map(ft => (
                <button
                  key={ft.id}
                  type="button"
                  onClick={() => setFeeType(ft.id)}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border text-[12px] font-semibold transition-all
                    ${feeType === ft.id
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 shadow-sm'
                      : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                    }`}
                >
                  <ft.icon className="w-4 h-4" />
                  {ft.label}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-rose-600 hover:bg-rose-700 disabled:opacity-70 shadow-md shadow-rose-500/20 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LateFeeReport() {
  const [session,      setSession]      = useState('')
  const [feeType,      setFeeType]      = useState('regular')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')
  const [shownFeeType, setShownFeeType] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ─────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const key = `${session}_${feeType}`
      const data = DATA_MAP[key] || []
      setRows(data)
      setShownSession(session)
      setShownFeeType(feeType)
      setShown(true)
      setLoading(false)
      const label = FEE_TYPES.find(f => f.id === feeType)?.label
      showToast(`${data.length} late fee records loaded for ${label} · ${session}`)
    }, 700)
  }, [session, feeType])

  const handleReset = () => {
    setSession(''); setRows([]); setSearch('')
    setErrors({}); setShown(false)
    setShownSession(''); setShownFeeType('')
  }

  // ── Export CSV ───────────────────────────────────────────────────────────
  const handleExport = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      // Build CSV
      const headers = ['S.No','Adm No','Name','Class','Father Name','Inst No','Pay Mode','Pay Date','Late Fee']
      const csvRows = [
        headers.join(','),
        ...filtered.map((r, i) => [
          i + 1, `"${r.adm_no}"`, `"${r.name}"`, `"${r.class}"`,
          `"${r.father_name}"`, r.inst_no, r.pay_mode, r.pay_date, r.late_fee
        ].join(','))
      ]
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `late_fee_${shownSession}_${shownFeeType}.csv`
      a.click()
      URL.revokeObjectURL(url)
      setExporting(false)
      showToast('CSV exported successfully!')
    }, 800)
  }

  // ── Filtered rows ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.adm_no.toLowerCase().includes(q) ||
      r.father_name.toLowerCase().includes(q) ||
      r.pay_mode.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    filtered.length,
    totalFee: filtered.reduce((s, r) => s + r.late_fee, 0),
    avgFee:   filtered.length ? Math.round(filtered.reduce((s, r) => s + r.late_fee, 0) / filtered.length) : 0,
    classes:  new Set(filtered.map(r => r.class)).size,
  }), [filtered])

  const hasResults = shown && rows.length > 0
  const feeTypeLabel = FEE_TYPES.find(f => f.id === feeType)?.label || ''
  const shownFeeTypeLabel = FEE_TYPES.find(f => f.id === shownFeeType)?.label || ''

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Late Fee Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Track students who paid fee after the due date — session &amp; fee type wise.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            Export CSV
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
        bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">

            {/* Session */}
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

            {/* Fee Type — radio style buttons */}
            <div className="lg:col-span-2">
              <Field label="Fee Type">
                <div className="flex gap-2">
                  {FEE_TYPES.map(ft => (
                    <button
                      key={ft.id}
                      type="button"
                      onClick={() => setFeeType(ft.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg border text-[12px] font-semibold transition-all
                        ${feeType === ft.id
                          ? 'border-rose-500 bg-rose-50 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400 shadow-sm'
                          : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                        }`}
                    >
                      <ft.icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {ft.label}
                    </button>
                  ))}
                </div>
              </Field>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20
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

      {/* ── MOBILE Filter Bar ───────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-rose-600 text-white shadow-md shadow-rose-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `${session} · ${feeTypeLabel}` : 'Select Filters'}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
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
        feeType={feeType}
        setFeeType={setFeeType}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
          bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
              style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header Banner */}
          <SchoolHeader session={shownSession} feeType={shownFeeType} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard
              icon={Users}
              label="Total Records"
              value={stats.total}
              color="blue"
            />
            <SummaryCard
              icon={BadgeIndianRupee}
              label="Total Late Fee"
              value={`₹${stats.totalFee.toLocaleString('en-IN')}`}
              color="rose"
            />
            <SummaryCard
              icon={Banknote}
              label="Avg Late Fee"
              value={`₹${stats.avgFee.toLocaleString('en-IN')}`}
              color="amber"
            />
            <SummaryCard
              icon={GraduationCap}
              label="Classes Affected"
              value={stats.classes}
              color="violet"
            />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
            bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5
              border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
              bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
                <Receipt className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Late Fee Records</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession} · {shownFeeTypeLabel}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                  bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, class, adm no…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-rose-400 focus:ring-2 focus:ring-rose-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-rose-400"
                />
                {search && (
                  <button onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2
              border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]
              bg-rose-50/20 dark:bg-rose-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <p className="text-[12px] text-rose-700 dark:text-rose-400">
                Students who paid fee after the due date. Late fee amount is charged as per school policy.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block">
              <DesktopTable rows={filtered} totalFee={stats.totalFee} />
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
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full details.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileFeeCard key={row.id} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-rose-200 dark:border-rose-500/30
                    bg-rose-50 dark:bg-rose-500/[0.07] p-4 mt-2">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-rose-700 dark:text-rose-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Records
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-3 text-center">
                        <p className="text-[24px] font-extrabold text-rose-700 dark:text-rose-300 tabular-nums">
                          ₹{stats.totalFee.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Total Late Fee</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-3 text-center">
                        <p className="text-[24px] font-extrabold text-blue-700 dark:text-blue-300 tabular-nums">
                          {filtered.length}
                        </p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Records</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-3 text-center">
                        <p className="text-[24px] font-extrabold text-amber-700 dark:text-amber-300 tabular-nums">
                          ₹{stats.avgFee.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Avg Late Fee</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-3 text-center">
                        <p className="text-[24px] font-extrabold text-violet-700 dark:text-violet-300 tabular-nums">
                          {stats.classes}
                        </p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Classes</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5
              border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
              bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span>
                {' '}records
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
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-rose-400 dark:text-rose-500 opacity-60" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>session</strong> &amp; <strong>fee type</strong>, then click <strong>Show</strong>.
            </p>
          </div>
          {/* Quick action hint on mobile */}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="flex sm:hidden items-center gap-2 mt-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
              bg-rose-600 text-white shadow-md shadow-rose-500/20"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Open Filters
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
