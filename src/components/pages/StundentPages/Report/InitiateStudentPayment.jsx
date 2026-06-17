/**
 * InitiateStudentPayment.jsx
 * Folder: src/pages/Student/Payment/InitiateStudentPayment.jsx
 *
 * Converts legacy ASPX "Initiate_Student_Payment.aspx" to fully-responsive React + Tailwind.
 *
 * Sections:
 *  1. Student Detail (photo + info grid)
 *  2. Fee Structure GridView  → responsive table (desktop) / accordion cards (mobile)
 *  3. Transaction History GridView → responsive table (desktop) / cards (mobile)
 *
 * Features:
 *  - Pay Now / status badge action column
 *  - Print Receipt button per transaction
 *  - Late-fee computation helper (mirrors GetTotalLateFee server method)
 *  - Mobile: no horizontal scroll, touch-friendly cards
 *  - Toast feedback on pay / print actions
 */

import { useState, useMemo, useCallback } from 'react'
import {
  User, BookOpen, Phone, Calendar, Tag, Users,
  CreditCard, Receipt, Printer, AlertCircle, Check,
  ChevronDown, ChevronRight, X, Loader2,
  BadgeCheck, Clock, Ban, IndianRupee,
  ArrowRightCircle, FileText, History,
  TrendingUp, ShieldAlert, Info, MapPin, Building2,
  GraduationCap, UserCheck, Hash, School
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const STUDENT = {
  name: 'Aryan Sharma',
  class_section: 'Class IX – A',
  father_name: 'Rajesh Sharma',
  reg_no: 'SVM/2025/00421',
  mobile: '9876543210',
  gender: 'Male',
  dob: '14/03/2010',
  category: 'General',
  class_teacher: 'Mrs. Sunita Verma',
  photo: null, // replace with image URL
}

// Fee structure rows — mirrors ASPX gvFeeStructure columns
// status: "pay now" | "paid" | "overdue" | "upcoming"
const FEE_STRUCTURE = [
  {
    id: 1,
    type: '2025-26',
    installment_no: 1,
    InstallmentAmt: 8500,
    Concession: 500,
    Payable: 8000,
    latefee: 0,
    Balance_with_latefee: 0,
    ReceiveAmt: 8000,
    nextDueDate: '10/04/2025',
    status: 'paid',
  },
  {
    id: 2,
    type: '2025-26',
    installment_no: 2,
    InstallmentAmt: 8500,
    Concession: 500,
    Payable: 8000,
    latefee: 200,
    Balance_with_latefee: 8200,
    ReceiveAmt: 0,
    nextDueDate: '10/07/2025',
    status: 'pay now',
  },
  {
    id: 3,
    type: '2025-26',
    installment_no: 3,
    InstallmentAmt: 8500,
    Concession: 500,
    Payable: 8000,
    latefee: 0,
    Balance_with_latefee: 8000,
    ReceiveAmt: 0,
    nextDueDate: '10/10/2025',
    status: 'upcoming',
  },
  {
    id: 4,
    type: '2025-26',
    installment_no: 4,
    InstallmentAmt: 8500,
    Concession: 500,
    Payable: 8000,
    latefee: 0,
    Balance_with_latefee: 8000,
    ReceiveAmt: 0,
    nextDueDate: '10/01/2026',
    status: 'upcoming',
  },
]

// Transaction history rows — mirrors ASPX gvPrevTxn columns
const TRANSACTIONS = [
  {
    id: 1,
    inst_no: 1,
    session: '2025-26',
    receipt_no: 'REC/25/00841',
    paymentdate: '08/04/2025',
    mop: 'Online',
    installment_amount: 8000,
    latefee: 0,
    advance_amount: 0,
    amount: 8000,
    reconsil_BY: 'System',
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

/** Mirrors GetTotalLateFee() server method */
const getTotalLateFee = (val) => {
  const n = parseFloat(val) || 0
  return n > 0 ? n : 0
}

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

const STATUS_CONFIG = {
  'pay now': {
    label: 'Pay Now',
    bg: 'bg-emerald-600 hover:bg-emerald-700',
    textColor: 'text-white',
    badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    icon: ArrowRightCircle,
    isAction: true,
  },
  paid: {
    label: 'Paid',
    bg: '',
    textColor: '',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    icon: BadgeCheck,
    isAction: false,
  },
  overdue: {
    label: 'Overdue',
    bg: '',
    textColor: '',
    badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
    icon: ShieldAlert,
    isAction: false,
  },
  upcoming: {
    label: 'Upcoming',
    bg: '',
    textColor: '',
    badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    icon: Clock,
    isAction: false,
  },
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
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
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── STUDENT DETAIL HEADER ────────────────────────────────────────────────────
function StudentHeader({ student }) {
  const InfoRow = ({ icon: Icon, label, value, color = 'blue' }) => {
    const iconColors = {
      blue: 'text-blue-500 dark:text-blue-400',
      violet: 'text-violet-500 dark:text-violet-400',
      emerald: 'text-emerald-500 dark:text-emerald-400',
      amber: 'text-amber-500 dark:text-amber-400',
      slate: 'text-slate-500 dark:text-slate-400',
    }
    return (
      <div className="flex items-start gap-3 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] last:border-0">
        <span className={`mt-0.5 flex-shrink-0 ${iconColors[color]}`}>
          <Icon className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <span className="text-[11px] uppercase tracking-wide font-semibold text-slate-400 dark:text-slate-500 flex-shrink-0">{label}</span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 text-right">{value || '—'}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Card header bar */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <User className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Detail</span>
      </div>

      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-5">

          {/* Photo */}
          <div className="flex-shrink-0 flex flex-col items-center gap-2 self-start">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 border-blue-100 dark:border-indigo-500/20 bg-slate-100 dark:bg-slate-800 overflow-hidden flex items-center justify-center shadow-md">
              {student.photo
                ? <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                : <User className="w-10 h-10 text-slate-300 dark:text-slate-600" />}
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
              {student.class_section}
            </span>
          </div>

          {/* Info Grid */}
          <div className="flex-1 min-w-0 grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <InfoRow icon={User}        label="Name"          value={student.name}          color="blue"    />
            <InfoRow icon={GraduationCap} label="Class–Section" value={student.class_section} color="violet"  />
            <InfoRow icon={Users}       label="Father's Name" value={student.father_name}    color="slate"   />
            <InfoRow icon={Hash}        label="Reg. No."      value={student.reg_no}         color="amber"   />
            <InfoRow icon={Phone}       label="Mobile"        value={student.mobile}         color="emerald" />
            <InfoRow icon={UserCheck}   label="Gender"        value={student.gender}         color="blue"    />
            <InfoRow icon={Calendar}    label="Date of Birth" value={student.dob}            color="violet"  />
            <InfoRow icon={Tag}         label="Category"      value={student.category}       color="amber"   />
            <InfoRow icon={School}      label="Class Teacher" value={student.class_teacher}  color="slate"   />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── FEE STRUCTURE — DESKTOP TABLE ROW ───────────────────────────────────────
function FeeTableRow({ row, onPay, paying }) {
  const st = STATUS_CONFIG[row.status] || STATUS_CONFIG['upcoming']
  const StatusIcon = st.icon
  const lateFee = getTotalLateFee(row.latefee)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.type}</td>
      <td className="px-4 py-3 text-center text-[13px] font-semibold text-slate-700 dark:text-slate-200">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[12px] font-bold text-slate-600 dark:text-slate-300">{row.installment_no}</span>
      </td>
      <td className="px-4 py-3 text-right text-[13px] font-medium text-slate-700 dark:text-slate-300 tabular-nums">{fmt(row.InstallmentAmt)}</td>
      <td className="px-4 py-3 text-right">
        <span className="text-[12px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">−{fmt(row.Concession)}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{fmt(row.Payable)}</span>
      </td>
      <td className="px-4 py-3 text-right">
        {lateFee > 0
          ? <span className="text-[12px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">+{fmt(lateFee)}</span>
          : <span className="text-[12px] text-slate-300 dark:text-slate-600">—</span>}
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(row.Balance_with_latefee)}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className={`text-[12px] font-semibold tabular-nums ${row.ReceiveAmt > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}>
          {row.ReceiveAmt > 0 ? fmt(row.ReceiveAmt) : '—'}
        </span>
      </td>
      <td className="px-4 py-3 text-center text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.nextDueDate}</td>
      <td className="px-4 py-3 text-center">
        {st.isAction ? (
          <button
            onClick={() => onPay(row)}
            disabled={paying === row.id}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold ${st.bg} text-white shadow-sm transition-all active:scale-95 disabled:opacity-60`}
          >
            {paying === row.id
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ArrowRightCircle className="w-3.5 h-3.5" />}
            Pay Now
          </button>
        ) : (
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[11px] font-bold ${st.badge}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {st.label}
          </span>
        )}
      </td>
    </tr>
  )
}

// ─── FEE STRUCTURE — MOBILE CARD ─────────────────────────────────────────────
function FeeCard({ row, onPay, paying }) {
  const [expanded, setExpanded] = useState(false)
  const st = STATUS_CONFIG[row.status] || STATUS_CONFIG['upcoming']
  const StatusIcon = st.icon
  const lateFee = getTotalLateFee(row.latefee)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Inst. badge */}
        <span className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
          <span className="text-[13px] font-bold text-indigo-700 dark:text-indigo-300">#{row.installment_no}</span>
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
            Installment {row.installment_no}
            <span className="ml-2 text-[11px] font-medium text-slate-400 dark:text-slate-500">{row.type}</span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Due: <span className="font-semibold text-slate-600 dark:text-slate-300">{row.nextDueDate}</span>
            &nbsp;·&nbsp;
            Payable: <span className="font-semibold text-blue-600 dark:text-blue-400">{fmt(row.Payable)}</span>
          </p>
        </div>

        {/* Status badge */}
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold flex-shrink-0 ${st.badge}`}>
          <StatusIcon className="w-3 h-3" />
          {st.label}
        </span>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3">

          {/* Amount breakdown grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Inst. Amount</p>
              <p className="text-[18px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{fmt(row.InstallmentAmt)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-rose-400 mb-1">Discount</p>
              <p className="text-[18px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">−{fmt(row.Concession)}</p>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500 mb-1">Payable</p>
              <p className="text-[18px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(row.Payable)}</p>
            </div>
            <div className={`rounded-xl p-3 ${lateFee > 0 ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Late Fee</p>
              <p className={`text-[18px] font-bold tabular-nums ${lateFee > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-300 dark:text-slate-600'}`}>
                {lateFee > 0 ? `+${fmt(lateFee)}` : '—'}
              </p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500 mb-1">Paid</p>
              <p className="text-[18px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                {row.ReceiveAmt > 0 ? fmt(row.ReceiveAmt) : '—'}
              </p>
            </div>
            <div className="rounded-xl bg-indigo-50 dark:bg-indigo-500/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-indigo-500 mb-1">Balance Due</p>
              <p className="text-[18px] font-bold text-indigo-700 dark:text-indigo-300 tabular-nums">{fmt(row.Balance_with_latefee)}</p>
            </div>
          </div>

          {/* Action button */}
          {st.isAction && (
            <button
              onClick={() => onPay(row)}
              disabled={paying === row.id}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold
                bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all active:scale-[.98] disabled:opacity-60"
            >
              {paying === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightCircle className="w-4 h-4" />}
              Pay ₹{Number(row.Balance_with_latefee).toLocaleString('en-IN')} Now
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── TRANSACTION HISTORY — DESKTOP TABLE ROW ─────────────────────────────────
function TxnTableRow({ row, onPrint }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{row.id}</td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-[12px] font-bold text-slate-600 dark:text-slate-300">{row.inst_no}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[12px] font-bold text-indigo-600 dark:text-indigo-400">{row.receipt_no}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{row.session}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.paymentdate}</td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
          <CreditCard className="w-3 h-3" />{row.mop}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-[12px] text-slate-700 dark:text-slate-300 tabular-nums">{fmt(row.installment_amount)}</td>
      <td className="px-4 py-3 text-right text-[12px] text-rose-600 dark:text-rose-400 tabular-nums">
        {row.latefee > 0 ? `+${fmt(row.latefee)}` : '—'}
      </td>
      <td className="px-4 py-3 text-right text-[12px] text-amber-600 dark:text-amber-400 tabular-nums">
        {row.advance_amount > 0 ? fmt(row.advance_amount) : '—'}
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(row.amount)}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onPrint(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all active:scale-95"
        >
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
      </td>
    </tr>
  )
}

// ─── TRANSACTION HISTORY — MOBILE CARD ───────────────────────────────────────
function TxnCard({ row, onPrint }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 shadow-sm space-y-3">
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-bold text-indigo-600 dark:text-indigo-400">{row.receipt_no}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {row.paymentdate} &nbsp;·&nbsp; Inst. #{row.inst_no} &nbsp;·&nbsp; {row.session}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
          <CreditCard className="w-3 h-3" />{row.mop}
        </span>
      </div>

      {/* Amount breakdown */}
      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2.5 text-center">
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide mb-1">Inst.</p>
          <p className="text-[15px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{fmt(row.installment_amount)}</p>
        </div>
        <div className={`rounded-xl p-2.5 text-center ${row.latefee > 0 ? 'bg-rose-50 dark:bg-rose-500/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
          <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wide mb-1">Late Fee</p>
          <p className={`text-[15px] font-bold tabular-nums ${row.latefee > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-300 dark:text-slate-600'}`}>
            {row.latefee > 0 ? `+${fmt(row.latefee)}` : '—'}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 p-2.5 text-center">
          <p className="text-[10px] font-bold uppercase text-emerald-500 tracking-wide mb-1">Total</p>
          <p className="text-[15px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(row.amount)}</p>
        </div>
      </div>

      {/* Print button */}
      <button
        onClick={() => onPrint(row)}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
          bg-sky-500 hover:bg-sky-600 text-white shadow-sm transition-all active:scale-[.98]"
      >
        <Printer className="w-4 h-4" /> Print Receipt
      </button>
    </div>
  )
}

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, children, badge }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">{title}</span>
        {badge != null && (
          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

// ─── FEE STRUCTURE SECTION ────────────────────────────────────────────────────
function FeeStructureSection({ fees, onPay, paying }) {
  return (
    <SectionCard icon={CreditCard} title="Fee Structure" badge={`${fees.length} installments`}>

      {/* Info hint */}
      <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
        <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        <p className="text-[12px] text-blue-700 dark:text-blue-400">
          Click <strong>Pay Now</strong> on overdue or current installments to initiate online payment.
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['Year', 'Inst. No.', 'Inst. Amt.', 'Discount', 'Payable', 'Late Fee', 'Due', 'Paid', 'Due Date', 'Action'].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fees.map(row => (
              <FeeTableRow key={row.id} row={row} onPay={onPay} paying={paying} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-3">
        <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          Tap a card to see details and pay.
        </p>
        {fees.map(row => (
          <FeeCard key={row.id} row={row} onPay={onPay} paying={paying} />
        ))}
      </div>
    </SectionCard>
  )
}

// ─── TRANSACTION HISTORY SECTION ─────────────────────────────────────────────
function TransactionSection({ txns, onPrint }) {
  return (
    <SectionCard icon={History} title="Transaction History" badge={`${txns.length} record${txns.length !== 1 ? 's' : ''}`}>

      {txns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText className="w-6 h-6 opacity-40" />
          </div>
          <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">No transaction yet.</p>
          <p className="text-[12px] text-slate-400 dark:text-slate-500">Completed payments will appear here.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Inst No.', 'Rec. No.', 'Rec. Date', 'MOP', 'Inst. Amt.', 'Late Fee', 'Extra Amt.', 'Total Amt.', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {txns.map(row => (
                  <TxnTableRow key={row.id} row={row} onPrint={onPrint} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {txns.map(row => (
              <TxnCard key={row.id} row={row} onPrint={onPrint} />
            ))}
          </div>
        </>
      )}
    </SectionCard>
  )
}

// ─── SUMMARY STATS ────────────────────────────────────────────────────────────
function FeeSummaryStrip({ fees }) {
  const totalPayable  = fees.reduce((s, r) => s + r.Payable, 0)
  const totalPaid     = fees.reduce((s, r) => s + r.ReceiveAmt, 0)
  const totalDue      = fees.reduce((s, r) => s + r.Balance_with_latefee, 0)
  const totalLateFee  = fees.reduce((s, r) => s + getTotalLateFee(r.latefee), 0)

  const Card = ({ label, value, color }) => {
    const styles = {
      blue:    'bg-blue-50   dark:bg-blue-500/10   text-blue-700   dark:text-blue-300   border-blue-100 dark:border-blue-500/15',
      emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-100 dark:border-emerald-500/15',
      rose:    'bg-rose-50   dark:bg-rose-500/10   text-rose-700   dark:text-rose-300   border-rose-100 dark:border-rose-500/15',
      amber:   'bg-amber-50  dark:bg-amber-500/10  text-amber-700  dark:text-amber-300  border-amber-100 dark:border-amber-500/15',
    }
    return (
      <div className={`flex-1 min-w-0 rounded-xl border px-4 py-3 ${styles[color]}`}>
        <p className="text-[20px] font-bold tabular-nums leading-tight">{fmt(value)}</p>
        <p className="text-[11px] font-semibold uppercase tracking-wide mt-0.5 opacity-80">{label}</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <Card label="Total Payable" value={totalPayable} color="blue"    />
      <Card label="Amount Paid"   value={totalPaid}    color="emerald" />
      <Card label="Balance Due"   value={totalDue}     color="rose"    />
      <Card label="Late Fees"     value={totalLateFee} color="amber"   />
    </div>
  )
}

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
function Breadcrumb() {
  const items = ['Home', 'Student', 'Payment']
  return (
    <nav className="flex items-center gap-1 text-[12px] text-slate-400 dark:text-slate-500 flex-wrap">
      {items.map((item, i) => (
        <span key={item} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-40" />}
          <span className={`${i === items.length - 1 ? 'font-semibold text-slate-600 dark:text-slate-300' : 'hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer'}`}>
            {item}
          </span>
        </span>
      ))}
    </nav>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function InitiateStudentPayment() {
  const [paying, setPaying] = useState(null)   // row.id being processed
  const [toast, setToast]   = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Pay Now handler (placeholder for API integration) ─────────────────────
  const handlePay = useCallback((row) => {
    setPaying(row.id)
    // TODO: API call → payment gateway redirect
    setTimeout(() => {
      setPaying(null)
      showToast(`Payment initiated for Installment ${row.installment_no} — ₹${Number(row.Balance_with_latefee).toLocaleString('en-IN')}`)
    }, 1400)
  }, [])

  // ── Print Receipt handler (placeholder) ───────────────────────────────────
  const handlePrint = useCallback((row) => {
    // TODO: Open print receipt in new tab / modal
    showToast(`Receipt ${row.receipt_no} sent to printer. (API integration pending)`)
  }, [])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <Breadcrumb />
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-1">
            <IndianRupee className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Initiate Student Payment
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Review fee structure, initiate payments &amp; download receipts.
          </p>
        </div>
      </div>

      {/* ── Student Detail ─────────────────────────────────────────────────── */}
      <StudentHeader student={STUDENT} />

      {/* ── Fee Summary Strip ──────────────────────────────────────────────── */}
      <FeeSummaryStrip fees={FEE_STRUCTURE} />

      {/* ── Fee Structure ──────────────────────────────────────────────────── */}
      <FeeStructureSection fees={FEE_STRUCTURE} onPay={handlePay} paying={paying} />

      {/* ── Transaction History ────────────────────────────────────────────── */}
      <TransactionSection txns={TRANSACTIONS} onPrint={handlePrint} />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
