/**
 * StudentFeeSummary.jsx
 * Path: src/pages/Student/Fee/StudentFeeSummary.jsx
 *
 * ASP.NET "StudentFeeSummary.aspx" → Modern React + Tailwind ERP Page
 *
 * Sections:
 *  1. Filter Bar  — Session dropdown + Admission No. (autocomplete)
 *  2. Student Card — Photo + details grid
 *  3. Fee Structure Table — installments, due, paid, action (Pay Now)
 *  4. Transaction History — receipts, print button
 *
 * Mobile patterns:
 *  - Student card → compact info tiles
 *  - Fee structure → tab/accordion cards per installment
 *  - Transaction table → swipeable mini-cards
 *  - No horizontal scroll anywhere
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, RefreshCw, ChevronDown, ChevronRight, ChevronUp,
  User, Phone, BookOpen, Calendar, Users, Shield,
  CreditCard, Receipt, Printer, AlertCircle, CheckCircle2,
  Clock, XCircle, Banknote, TrendingDown, TrendingUp,
  ArrowLeft, Eye, Loader2, X, Check, Info,
  Hash, BadgeIndianRupee, FileText, SlidersHorizontal,
  GraduationCap, School, UserCheck, IndianRupee,
  BadgeCheck, TriangleAlert, CircleDollarSign, Wallet
} from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const STUDENTS = [
  {
    reg_no: 'ADM-2024-001',
    name: 'Riya Sharma',
    father_name: 'Ramesh Kumar Sharma',
    class_section: 'Class X - A',
    mobile: '9876543210',
    gender: 'Female',
    dob: '15/03/2009',
    category: 'General',
    class_teacher: 'Mrs. Sunita Verma',
    photo: null,
  },
  {
    reg_no: 'ADM-2024-002',
    name: 'Arjun Singh',
    father_name: 'Vikram Singh',
    class_section: 'Class IX - B',
    mobile: '9812345670',
    gender: 'Male',
    dob: '22/07/2010',
    category: 'OBC',
    class_teacher: 'Mr. Rajesh Gupta',
    photo: null,
  },
  {
    reg_no: 'ADM-2024-003',
    name: 'Priya Patel',
    father_name: 'Suresh Patel',
    class_section: 'Class VIII - A',
    mobile: '9988776655',
    gender: 'Female',
    dob: '10/11/2011',
    category: 'SC',
    class_teacher: 'Mrs. Kavita Tiwari',
    photo: null,
  },
]

const FEE_STRUCTURE = {
  'ADM-2024-001': [
    { id: 1, type: '2024-25', installment_no: 1, InstallmentAmt: 8500, Concession: 500, Payable: 8000, latefee: 0, Balance_with_latefee: 0, ReceiveAmt: 8000, nextDueDate: '15/04/2024', status: 'Paid' },
    { id: 2, type: '2024-25', installment_no: 2, InstallmentAmt: 8500, Concession: 500, Payable: 8000, latefee: 0, Balance_with_latefee: 0, ReceiveAmt: 8000, nextDueDate: '15/07/2024', status: 'Paid' },
    { id: 3, type: '2024-25', installment_no: 3, InstallmentAmt: 8500, Concession: 500, Payable: 8000, latefee: 200, Balance_with_latefee: 8200, ReceiveAmt: 0, nextDueDate: '15/10/2024', status: 'Pay Now' },
    { id: 4, type: '2024-25', installment_no: 4, InstallmentAmt: 8500, Concession: 500, Payable: 8000, latefee: 0, Balance_with_latefee: 8000, ReceiveAmt: 0, nextDueDate: '15/01/2025', status: 'Upcoming' },
  ],
  'ADM-2024-002': [
    { id: 1, type: '2024-25', installment_no: 1, InstallmentAmt: 7500, Concession: 0, Payable: 7500, latefee: 0, Balance_with_latefee: 0, ReceiveAmt: 7500, nextDueDate: '15/04/2024', status: 'Paid' },
    { id: 2, type: '2024-25', installment_no: 2, InstallmentAmt: 7500, Concession: 0, Payable: 7500, latefee: 500, Balance_with_latefee: 8000, ReceiveAmt: 0, nextDueDate: '15/07/2024', status: 'Pay Now' },
    { id: 3, type: '2024-25', installment_no: 3, InstallmentAmt: 7500, Concession: 0, Payable: 7500, latefee: 0, Balance_with_latefee: 7500, ReceiveAmt: 0, nextDueDate: '15/10/2024', status: 'Upcoming' },
    { id: 4, type: '2024-25', installment_no: 4, InstallmentAmt: 7500, Concession: 0, Payable: 7500, latefee: 0, Balance_with_latefee: 7500, ReceiveAmt: 0, nextDueDate: '15/01/2025', status: 'Upcoming' },
  ],
  'ADM-2024-003': [
    { id: 1, type: '2024-25', installment_no: 1, InstallmentAmt: 6500, Concession: 1000, Payable: 5500, latefee: 0, Balance_with_latefee: 0, ReceiveAmt: 5500, nextDueDate: '15/04/2024', status: 'Paid' },
    { id: 2, type: '2024-25', installment_no: 2, InstallmentAmt: 6500, Concession: 1000, Payable: 5500, latefee: 0, Balance_with_latefee: 0, ReceiveAmt: 5500, nextDueDate: '15/07/2024', status: 'Paid' },
    { id: 3, type: '2024-25', installment_no: 3, InstallmentAmt: 6500, Concession: 1000, Payable: 5500, latefee: 0, Balance_with_latefee: 5500, ReceiveAmt: 0, nextDueDate: '15/10/2024', status: 'Pay Now' },
    { id: 4, type: '2024-25', installment_no: 4, InstallmentAmt: 6500, Concession: 1000, Payable: 5500, latefee: 0, Balance_with_latefee: 5500, ReceiveAmt: 0, nextDueDate: '15/01/2025', status: 'Upcoming' },
  ],
}

const TRANSACTIONS = {
  'ADM-2024-001': [
    { id: 1, inst_no: 1, receipt_no: 'REC-240401', session: '2024-25', paymentdate: '02/04/2024', mop: 'Cash', transaction_no: 'TXN-001', installment_amount: 8000, latefee: 0, advance_amount: 0, amount: 8000 },
    { id: 2, inst_no: 2, receipt_no: 'REC-240702', session: '2024-25', paymentdate: '14/07/2024', mop: 'UPI', transaction_no: 'TXN-002', installment_amount: 8000, latefee: 0, advance_amount: 0, amount: 8000 },
  ],
  'ADM-2024-002': [
    { id: 1, inst_no: 1, receipt_no: 'REC-240301', session: '2024-25', paymentdate: '10/04/2024', mop: 'Online', transaction_no: 'TXN-101', installment_amount: 7500, latefee: 0, advance_amount: 0, amount: 7500 },
  ],
  'ADM-2024-003': [
    { id: 1, inst_no: 1, receipt_no: 'REC-240501', session: '2024-25', paymentdate: '05/04/2024', mop: 'NEFT', transaction_no: 'TXN-201', installment_amount: 5500, latefee: 0, advance_amount: 0, amount: 5500 },
    { id: 2, inst_no: 2, receipt_no: 'REC-240702', session: '2024-25', paymentdate: '12/07/2024', mop: 'Cash', transaction_no: 'TXN-202', installment_amount: 5500, latefee: 0, advance_amount: 0, amount: 5500 },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) => `₹${Number(n || 0).toLocaleString('en-IN')}`

const STATUS_CONFIG = {
  paid:     { label: 'Paid',     bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2,  dot: 'bg-emerald-500' },
  'pay now': { label: 'Pay Now', bg: 'bg-rose-100 dark:bg-rose-500/15',       text: 'text-rose-700 dark:text-rose-400',       icon: AlertCircle,   dot: 'bg-rose-500' },
  upcoming: { label: 'Upcoming', bg: 'bg-amber-100 dark:bg-amber-500/15',     text: 'text-amber-700 dark:text-amber-400',     icon: Clock,         dot: 'bg-amber-500' },
}
const getStatusCfg = (s) => STATUS_CONFIG[s?.toLowerCase()] || STATUS_CONFIG.upcoming

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={onChange} disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20
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
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="flex items-center gap-1 text-[11px] text-rose-500"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5
      rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
      ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'info' ? 'bg-blue-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── AUTOCOMPLETE SEARCH BOX ─────────────────────────────────────────────────

function AdmissionSearch({ value, onChange, session }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value || '')
  const ref = useRef(null)

  // Filter students by query
  const suggestions = useMemo(() => {
    if (!query || query.length < 1) return []
    const q = query.toLowerCase()
    return STUDENTS.filter(s =>
      s.reg_no.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
    ).slice(0, 5)
  }, [query])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (s) => {
    setQuery(s.reg_no)
    onChange(s.reg_no)
    setOpen(false)
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    onChange(e.target.value)
    setOpen(e.target.value.length > 0)
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => query && setOpen(suggestions.length > 0)}
          placeholder="Enter Admission No. or Name..."
          className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
            bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
            outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(''); onChange(''); setOpen(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1.5 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
          bg-white dark:bg-[#1a1f35] shadow-xl overflow-hidden">
          {suggestions.map(s => (
            <button key={s.reg_no} onMouseDown={() => handleSelect(s)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-indigo-500/10 transition-colors text-left border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] last:border-0">
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center bg-blue-100 dark:bg-blue-500/20 text-[12px] font-bold text-blue-700 dark:text-blue-400">
                {s.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">{s.reg_no} · {s.class_section}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── FEE SUMMARY PILLS ───────────────────────────────────────────────────────

function FeeSummaryPill({ label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    rose:    'bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-400',
    amber:   'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400',
  }
  return (
    <div className={`rounded-xl border px-4 py-3 flex-1 min-w-0 ${colors[color]}`}>
      <p className="text-[20px] font-bold tabular-nums leading-tight">{value}</p>
      <p className="text-[11px] font-semibold uppercase tracking-wide opacity-75 mt-0.5">{label}</p>
    </div>
  )
}

// ─── STUDENT INFO CARD ────────────────────────────────────────────────────────

function StudentCard({ student }) {
  const fields = [
    { label: 'Father\'s Name', value: student.father_name, icon: User },
    { label: 'Class & Section', value: student.class_section, icon: BookOpen },
    { label: 'Mobile', value: student.mobile, icon: Phone },
    { label: 'Registration No.', value: student.reg_no, icon: Hash },
    { label: 'Gender', value: student.gender, icon: UserCheck },
    { label: 'Date of Birth', value: student.dob, icon: Calendar },
    { label: 'Category', value: student.category, icon: Shield },
    { label: 'Class Teacher', value: student.class_teacher, icon: School },
  ]

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-[#1e2238] dark:to-[#1a1f35]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Details</span>
      </div>

      <div className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6">
          {/* Photo */}
          <div className="flex-shrink-0 self-center sm:self-start">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center border-2 border-blue-200 dark:border-blue-500/30 overflow-hidden">
              {student.photo
                ? <img src={student.photo} alt={student.name} className="w-full h-full object-cover" />
                : <span className="text-[28px] sm:text-[32px] font-bold text-blue-600 dark:text-blue-400">{student.name.charAt(0)}</span>
              }
            </div>
          </div>

          {/* Info Grid */}
          <div className="flex-1 min-w-0 w-full">
            {/* Name + Reg */}
            <div className="mb-3">
              <h2 className="text-[18px] sm:text-[20px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">{student.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">{student.reg_no}</span>
                <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{student.class_section}</span>
                <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400">{student.category}</span>
              </div>
            </div>

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {fields.slice(0, 6).map(f => (
                <div key={f.label} className="flex items-start gap-2.5">
                  <f.icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{f.label}</p>
                    <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-2 sm:mt-3">
              {fields.slice(6).map(f => (
                <div key={f.label} className="flex items-start gap-2.5">
                  <f.icon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{f.label}</p>
                    <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{f.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── FEE STATUS BADGE ─────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = getStatusCfg(status)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {cfg.label}
    </span>
  )
}

// ─── FEE STRUCTURE — DESKTOP TABLE ───────────────────────────────────────────

function FeeStructureDesktop({ rows, onPayNow }) {
  const cols = ['#', 'Year', 'Inst. No.', 'Inst. Amt', 'Discount', 'Payable', 'Late Fee', 'Due', 'Paid', 'Due Date', 'Action']
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth: 880 }}>
        <thead>
          <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            {cols.map(c => (
              <th key={c} className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap text-left first:w-10">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const cfg = getStatusCfg(row.status)
            const isPayNow = row.status?.toLowerCase() === 'pay now'
            return (
              <tr key={row.id}
                className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] transition-colors
                  ${isPayNow ? 'bg-rose-50/40 dark:bg-rose-500/[0.04] hover:bg-rose-50/70 dark:hover:bg-rose-500/[0.07]'
                    : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}
              >
                <td className="px-3 py-3 text-[12px] text-slate-400 tabular-nums">{i + 1}</td>
                <td className="px-3 py-3">
                  <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{row.type}</span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {row.installment_no}
                  </span>
                </td>
                <td className="px-3 py-3 text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{fmt(row.InstallmentAmt)}</td>
                <td className="px-3 py-3">
                  {row.Concession > 0
                    ? <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">{fmt(row.Concession)}</span>
                    : <span className="text-[12px] text-slate-300 dark:text-slate-600">—</span>
                  }
                </td>
                <td className="px-3 py-3 text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{fmt(row.Payable)}</td>
                <td className="px-3 py-3">
                  {row.latefee > 0
                    ? <span className="text-[12px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">{fmt(row.latefee)}</span>
                    : <span className="text-[12px] text-slate-300 dark:text-slate-600">—</span>
                  }
                </td>
                <td className="px-3 py-3">
                  {row.Balance_with_latefee > 0
                    ? <span className="text-[13px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">{fmt(row.Balance_with_latefee)}</span>
                    : <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold">—</span>
                  }
                </td>
                <td className="px-3 py-3">
                  {row.ReceiveAmt > 0
                    ? <span className="text-[13px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt(row.ReceiveAmt)}</span>
                    : <span className="text-[12px] text-slate-300 dark:text-slate-600">—</span>
                  }
                </td>
                <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.nextDueDate}</td>
                <td className="px-3 py-3">
                  {isPayNow
                    ? (
                      <button onClick={() => onPayNow(row)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold
                          bg-rose-600 hover:bg-rose-700 text-white transition-all active:scale-95 shadow-sm shadow-rose-500/20 whitespace-nowrap">
                        <CreditCard className="w-3 h-3" /> Pay Now
                      </button>
                    )
                    : <StatusBadge status={row.status} />
                  }
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── FEE STRUCTURE — MOBILE CARD ─────────────────────────────────────────────

function FeeInstallmentCard({ row, idx, onPayNow }) {
  const [expanded, setExpanded] = useState(false)
  const isPayNow = row.status?.toLowerCase() === 'pay now'
  const isPaid = row.status?.toLowerCase() === 'paid'

  return (
    <div className={`rounded-xl border overflow-hidden transition-all
      ${isPayNow ? 'border-rose-200 dark:border-rose-500/30 shadow-rose-100 dark:shadow-none shadow-sm'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'}`}>

      {/* Top strip for pay now */}
      {isPayNow && <div className="h-1 bg-gradient-to-r from-rose-500 to-orange-500" />}

      {/* Main row */}
      <button type="button" onClick={() => setExpanded(p => !p)}
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors
          ${isPayNow ? 'bg-rose-50/60 dark:bg-rose-500/[0.05]' : 'bg-white dark:bg-[#1a1f35]'}
          hover:bg-slate-50 dark:hover:bg-white/[0.02]`}>

        {/* Installment number badge */}
        <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold
          ${isPayNow ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400'
            : isPaid ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}>
          {row.installment_no}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Inst. {row.installment_no}</span>
            <StatusBadge status={row.status} />
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">Due: {row.nextDueDate}</p>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p className={`text-[16px] font-extrabold tabular-nums ${isPayNow ? 'text-rose-600 dark:text-rose-400' : isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
            {fmt(isPayNow ? row.Balance_with_latefee : row.Payable)}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500">{isPayNow ? 'due' : isPaid ? 'paid' : 'payable'}</p>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className={`border-t px-4 py-4 space-y-3 ${isPayNow ? 'bg-rose-50/30 dark:bg-rose-500/[0.03] border-rose-100 dark:border-rose-500/20' : 'bg-slate-50/30 dark:bg-white/[0.01] border-slate-100 dark:border-[rgba(99,102,241,0.08)]'}`}>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Inst. Amount', value: fmt(row.InstallmentAmt), color: 'text-slate-700 dark:text-slate-200' },
              { label: 'Discount', value: row.Concession > 0 ? fmt(row.Concession) : '—', color: 'text-emerald-600 dark:text-emerald-400' },
              { label: 'Payable', value: fmt(row.Payable), color: 'text-slate-700 dark:text-slate-200' },
              { label: 'Late Fee', value: row.latefee > 0 ? fmt(row.latefee) : '—', color: row.latefee > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400' },
              { label: 'Total Due', value: row.Balance_with_latefee > 0 ? fmt(row.Balance_with_latefee) : '—', color: 'text-rose-700 dark:text-rose-400 font-bold' },
              { label: 'Amount Paid', value: row.ReceiveAmt > 0 ? fmt(row.ReceiveAmt) : '—', color: 'text-emerald-600 dark:text-emerald-400 font-bold' },
            ].map(item => (
              <div key={item.label} className="rounded-xl bg-white dark:bg-[#1a1f35] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{item.label}</p>
                <p className={`text-[15px] font-bold mt-0.5 tabular-nums ${item.color}`}>{item.value}</p>
              </div>
            ))}
          </div>

          {isPayNow && (
            <button onClick={() => onPayNow(row)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold
                bg-rose-600 hover:bg-rose-700 text-white transition-all active:scale-95 shadow-md shadow-rose-500/20">
              <CreditCard className="w-4 h-4" />
              Pay Now — {fmt(row.Balance_with_latefee)}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── TRANSACTION — DESKTOP TABLE ─────────────────────────────────────────────

function TransactionDesktop({ rows, onPrint }) {
  const cols = ['S.No.', 'Inst No.', 'Rec. No.', 'Rec. Date', 'MOP', 'Txn No.', 'Inst.', 'Late Fee', 'Extra', 'Total', 'Action']
  return (
    <div className="overflow-x-auto">
      <table className="w-full" style={{ minWidth: 840 }}>
        <thead>
          <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            {cols.map(c => (
              <th key={c} className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap text-left">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
              <td className="px-3 py-3 text-[12px] text-slate-400 tabular-nums">{i + 1}</td>
              <td className="px-3 py-3">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">{row.inst_no}</span>
              </td>
              <td className="px-3 py-3 text-[12px] font-semibold text-blue-600 dark:text-blue-400 whitespace-nowrap">{row.receipt_no}</td>
              <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.paymentdate}</td>
              <td className="px-3 py-3">
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">{row.mop}</span>
              </td>
              <td className="px-3 py-3 text-[11px] text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{row.transaction_no}</td>
              <td className="px-3 py-3 text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{fmt(row.installment_amount)}</td>
              <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
                {row.latefee > 0 ? <span className="text-rose-600 dark:text-rose-400 font-semibold">{fmt(row.latefee)}</span> : '—'}
              </td>
              <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
                {row.advance_amount > 0 ? fmt(row.advance_amount) : '—'}
              </td>
              <td className="px-3 py-3 text-[14px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt(row.amount)}</td>
              <td className="px-3 py-3">
                <button onClick={() => onPrint(row)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold
                    bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95">
                  <Printer className="w-3 h-3" /> Print
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        {/* Total row */}
        <tfoot>
          <tr className="bg-emerald-50/60 dark:bg-emerald-500/[0.05] border-t-2 border-emerald-200 dark:border-emerald-500/25">
            <td colSpan={6} className="px-3 py-3">
              <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> Grand Total
              </span>
            </td>
            <td className="px-3 py-3 text-[13px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {fmt(rows.reduce((s, r) => s + r.installment_amount, 0))}
            </td>
            <td className="px-3 py-3 text-[13px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">
              {fmt(rows.reduce((s, r) => s + r.latefee, 0)) || '—'}
            </td>
            <td className="px-3 py-3 text-[13px] font-bold tabular-nums">—</td>
            <td className="px-3 py-3 text-[14px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              {fmt(rows.reduce((s, r) => s + r.amount, 0))}
            </td>
            <td />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── TRANSACTION — MOBILE CARD ────────────────────────────────────────────────

function TransactionCard({ row, onPrint }) {
  const mopColors = {
    Cash: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
    UPI: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400',
    Online: 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400',
    NEFT: 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400',
  }
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 space-y-3">
      {/* Top */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{row.receipt_no}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${mopColors[row.mop] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>{row.mop}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{row.paymentdate} · Inst. {row.inst_no}</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[18px] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt(row.amount)}</p>
          <p className="text-[10px] text-slate-400">Total Paid</p>
        </div>
      </div>

      {/* Detail row */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
        <div className="flex gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Inst. Amt</p>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{fmt(row.installment_amount)}</p>
          </div>
          {row.latefee > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Late Fee</p>
              <p className="text-[13px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">{fmt(row.latefee)}</p>
            </div>
          )}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Txn No.</p>
            <p className="text-[12px] font-mono text-slate-500 dark:text-slate-400">{row.transaction_no}</p>
          </div>
        </div>
        <button onClick={() => onPrint(row)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-bold
            bg-blue-600 hover:bg-blue-700 text-white transition-all active:scale-95 flex-shrink-0">
          <Printer className="w-3.5 h-3.5" /> Print
        </button>
      </div>
    </div>
  )
}

// ─── PAY NOW MODAL ────────────────────────────────────────────────────────────

function PayModal({ row, student, onClose, onConfirm }) {
  const [mop, setMop] = useState('Cash')
  const [txnNo, setTxnNo] = useState('')
  const [paying, setPaying] = useState(false)

  const handlePay = () => {
    setPaying(true)
    setTimeout(() => {
      setPaying(false)
      onConfirm({ row, mop, txnNo })
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-[999] flex items-end sm:items-center justify-center p-0 sm:p-4" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-hidden"
        style={{ animation: 'modalUp .3s ease' }}>
        <style>{`@keyframes modalUp{from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-12 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Collect Fee</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">Installment {row.installment_no}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {/* Student info */}
          <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-[14px] font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">
              {student?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{student?.name}</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">{student?.reg_no} · {student?.class_section}</p>
            </div>
          </div>

          {/* Amount breakdown */}
          <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] overflow-hidden">
            {[
              { label: 'Installment Amount', value: fmt(row.Payable), highlight: false },
              row.latefee > 0 ? { label: 'Late Fee', value: fmt(row.latefee), highlight: 'rose' } : null,
              { label: 'Total Payable', value: fmt(row.Balance_with_latefee), highlight: 'bold' },
            ].filter(Boolean).map((item, i) => (
              <div key={i} className={`flex items-center justify-between px-4 py-3 border-b last:border-0 border-slate-100 dark:border-[rgba(99,102,241,0.08)]
                ${item.highlight === 'bold' ? 'bg-slate-50 dark:bg-white/[0.02]' : ''}`}>
                <span className={`text-[13px] ${item.highlight === 'bold' ? 'font-bold text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}>{item.label}</span>
                <span className={`text-[14px] font-bold tabular-nums ${item.highlight === 'rose' ? 'text-rose-600 dark:text-rose-400' : item.highlight === 'bold' ? 'text-rose-700 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'}`}>{item.value}</span>
              </div>
            ))}
          </div>

          {/* MOP */}
          <Field label="Mode of Payment" required>
            <NativeSelect value={mop} onChange={e => setMop(e.target.value)}>
              {['Cash', 'UPI', 'NEFT', 'RTGS', 'Cheque', 'DD', 'Online'].map(m => <option key={m} value={m}>{m}</option>)}
            </NativeSelect>
          </Field>

          {/* Txn No */}
          {mop !== 'Cash' && (
            <Field label="Transaction / Reference No.">
              <input
                type="text"
                value={txnNo}
                onChange={e => setTxnNo(e.target.value)}
                placeholder="Enter transaction number..."
                className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600
                  outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20 transition-all"
              />
            </Field>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handlePay} disabled={paying}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold
              text-white bg-rose-600 hover:bg-rose-700 transition-all active:scale-95 shadow-md shadow-rose-500/20 disabled:opacity-70">
            {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeIndianRupee className="w-4 h-4" />}
            {paying ? 'Processing...' : `Collect ${fmt(row.Balance_with_latefee)}`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SECTION WRAPPER ─────────────────────────────────────────────────────────

function SectionCard({ title, icon: Icon, accent = 'blue', count, children, extra }) {
  const accents = {
    blue:    'bg-blue-500',
    rose:    'bg-rose-500',
    emerald: 'bg-emerald-500',
    violet:  'bg-violet-500',
  }
  const countColors = {
    blue:    'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400',
    rose:    'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400',
    emerald: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400',
    violet:  'bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-400',
  }
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className={`w-1 h-5 rounded-full ${accents[accent]} flex-shrink-0`} />
        <Icon className={`w-4 h-4 flex-shrink-0 ${accent === 'blue' ? 'text-blue-600 dark:text-blue-400' : accent === 'rose' ? 'text-rose-600 dark:text-rose-400' : accent === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 'text-violet-600 dark:text-violet-400'}`} />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">{title}</span>
        {count !== undefined && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${countColors[accent]}`}>{count} records</span>
        )}
        {extra}
      </div>
      {children}
    </div>
  )
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

export default function StudentFeeSummary() {
  const [session, setSession] = useState('')
  const [admNo,   setAdmNo]   = useState('')
  const [student, setStudent] = useState(null)
  const [feeRows, setFeeRows] = useState([])
  const [txnRows, setTxnRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [errors,  setErrors]  = useState({})
  const [toast,   setToast]   = useState(null)
  const [payModal,setPayModal] = useState(null)
  const [activeTab, setActiveTab] = useState('fee') // mobile tab: fee | txn

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch / Show ─────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Select a session'
    if (!admNo.trim()) err.admNo = 'Enter admission number'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const found = STUDENTS.find(s => s.reg_no.toLowerCase() === admNo.trim().toLowerCase())
      if (!found) {
        setLoading(false)
        setStudent(null); setFeeRows([]); setTxnRows([])
        setErrors({ admNo: 'Student not found. Try: ADM-2024-001, ADM-2024-002, ADM-2024-003' })
        return
      }
      setStudent(found)
      setFeeRows(FEE_STRUCTURE[found.reg_no] || [])
      setTxnRows(TRANSACTIONS[found.reg_no] || [])
      setLoading(false)
      showToast(`Loaded fee summary for ${found.name}`, 'success')
    }, 700)
  }, [session, admNo])

  const handleReset = () => {
    setSession(''); setAdmNo(''); setStudent(null)
    setFeeRows([]); setTxnRows([]); setErrors({})
  }

  // ── Pay Now flow ──────────────────────────────────────────────────────────
  const handlePayConfirm = ({ row, mop, txnNo }) => {
    setFeeRows(prev => prev.map(r => r.id === row.id ? { ...r, status: 'Paid', ReceiveAmt: r.Balance_with_latefee, Balance_with_latefee: 0 } : r))
    const newTxn = {
      id: txnRows.length + 1,
      inst_no: row.installment_no,
      receipt_no: `REC-${Date.now().toString().slice(-6)}`,
      session,
      paymentdate: new Date().toLocaleDateString('en-IN'),
      mop,
      transaction_no: txnNo || `TXN-${Date.now().toString().slice(-5)}`,
      installment_amount: row.Payable,
      latefee: row.latefee,
      advance_amount: 0,
      amount: row.Balance_with_latefee,
    }
    setTxnRows(prev => [...prev, newTxn])
    setPayModal(null)
    showToast(`Payment of ${fmt(row.Balance_with_latefee)} collected successfully!`, 'success')
    setActiveTab('txn')
  }

  // ── Fee summary stats ─────────────────────────────────────────────────────
  const feeStats = useMemo(() => {
    const totalPayable = feeRows.reduce((s, r) => s + r.Payable, 0)
    const totalPaid    = feeRows.reduce((s, r) => s + r.ReceiveAmt, 0)
    const totalDue     = feeRows.reduce((s, r) => s + r.Balance_with_latefee, 0)
    const totalDisc    = feeRows.reduce((s, r) => s + r.Concession, 0)
    const pendingCount = feeRows.filter(r => r.status?.toLowerCase() === 'pay now').length
    return { totalPayable, totalPaid, totalDue, totalDisc, pendingCount }
  }, [feeRows])

  const hasData = !!student && feeRows.length > 0

  return (
    <div className="space-y-4 pb-10">
      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
            Student Fee Summary
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 ml-10.5">
            View fee structure, dues &amp; payment history for any student.
          </p>
        </div>
        {hasData && (
          <button onClick={handleReset}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
            <ArrowLeft className="w-4 h-4" /> New Search
          </button>
        )}
      </div>

      {/* ── FILTER CARD ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Student</span>
          {(session || admNo) && (
            <button onClick={handleReset}
              className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session} onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Admission No. */}
            <div className="sm:col-span-1 lg:col-span-2">
              <Field label="Admission / Registration No." error={errors.admNo} required>
                <AdmissionSearch value={admNo} onChange={v => { setAdmNo(v); setErrors(p => ({ ...p, admNo: undefined })) }} session={session} />
              </Field>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  shadow-md shadow-blue-500/20 dark:shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                {loading ? 'Searching...' : 'Show'}
              </button>
              <button type="button" onClick={handleReset}
                className="px-3.5 py-2.5 rounded-xl text-[13px] font-bold
                  bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Quick hint */}
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            Try: <span className="font-semibold text-blue-600 dark:text-blue-400">ADM-2024-001</span>,&nbsp;
            <span className="font-semibold text-blue-600 dark:text-blue-400">ADM-2024-002</span>,&nbsp;
            <span className="font-semibold text-blue-600 dark:text-blue-400">ADM-2024-003</span>
          </p>
        </div>
      </div>

      {/* ── Loading skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Main Content (shown after search) ────────────────────────────── */}
      {hasData && !loading && (
        <>
          {/* Student Card */}
          <StudentCard student={student} />

          {/* ── Fee Summary Pills ──────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <FeeSummaryPill label="Total Payable" value={fmt(feeStats.totalPayable)} color="blue" />
            <FeeSummaryPill label="Total Paid" value={fmt(feeStats.totalPaid)} color="emerald" />
            <FeeSummaryPill label="Total Due" value={fmt(feeStats.totalDue)} color="rose" />
            <FeeSummaryPill label="Discount" value={fmt(feeStats.totalDisc)} color="amber" />
          </div>

          {/* ── MOBILE Tab Switcher ─────────────────────────────────────── */}
          <div className="flex sm:hidden rounded-xl overflow-hidden border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-50 dark:bg-[#1e2238] p-1 gap-1">
            {[
              { id: 'fee', label: 'Fee Structure', icon: Wallet, badge: feeStats.pendingCount > 0 ? `${feeStats.pendingCount} due` : null },
              { id: 'txn', label: 'Transactions', icon: Receipt, badge: txnRows.length > 0 ? txnRows.length : null },
            ].map(tab => (
              <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[13px] font-bold transition-all
                  ${activeTab === tab.id
                    ? 'bg-white dark:bg-[#1a1f35] text-blue-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}>
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.badge && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.id
                    ? tab.id === 'fee' ? 'bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400' : 'bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* ── FEE STRUCTURE SECTION ────────────────────────────────────── */}
          <div className={`${activeTab !== 'fee' ? 'hidden sm:block' : ''}`}>
            <SectionCard
              title="Fee Structure"
              icon={Wallet}
              accent="rose"
              count={feeRows.length}
              extra={
                feeStats.pendingCount > 0 && (
                  <span className="flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-100 dark:bg-rose-500/15 text-rose-700 dark:text-rose-400">
                    <TriangleAlert className="w-3 h-3" /> {feeStats.pendingCount} due
                  </span>
                )
              }
            >
              {/* Desktop Table */}
              <div className="hidden sm:block">
                <FeeStructureDesktop rows={feeRows} onPayNow={row => setPayModal(row)} />
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden p-4 space-y-3">
                {feeStats.pendingCount > 0 && (
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20">
                    <TriangleAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                    <p className="text-[12px] font-semibold text-rose-700 dark:text-rose-400">
                      {feeStats.pendingCount} installment{feeStats.pendingCount > 1 ? 's' : ''} pending. Tap to pay.
                    </p>
                  </div>
                )}
                {feeRows.map((row, i) => (
                  <FeeInstallmentCard key={row.id} row={row} idx={i + 1} onPayNow={r => setPayModal(r)} />
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/40 dark:bg-white/[0.01]">
                <p className="text-[12px] text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <BadgeCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Paid: <span className="font-bold text-emerald-600 dark:text-emerald-400">{fmt(feeStats.totalPaid)}</span>
                </p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  Due: <span className="font-bold text-rose-600 dark:text-rose-400">{fmt(feeStats.totalDue)}</span>
                </p>
              </div>
            </SectionCard>
          </div>

          {/* ── TRANSACTION SECTION ─────────────────────────────────────── */}
          <div className={`${activeTab !== 'txn' ? 'hidden sm:block' : ''}`}>
            <SectionCard
              title="Transaction History"
              icon={Receipt}
              accent="emerald"
              count={txnRows.length}
            >
              {txnRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Receipt className="w-6 h-6 opacity-40" />
                  </div>
                  <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">No transactions yet</p>
                  <p className="text-[12px] text-center max-w-xs">Transactions will appear here once fee payments are made.</p>
                </div>
              ) : (
                <>
                  {/* Desktop Table */}
                  <div className="hidden sm:block">
                    <TransactionDesktop rows={txnRows} onPrint={row => showToast(`Printing receipt ${row.receipt_no}...`, 'info')} />
                  </div>

                  {/* Mobile Cards */}
                  <div className="sm:hidden p-4 space-y-3">
                    {txnRows.map(row => (
                      <TransactionCard key={row.id} row={row} onPrint={r => showToast(`Printing receipt ${r.receipt_no}...`, 'info')} />
                    ))}

                    {/* Mobile Total */}
                    <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-500/[0.05] p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-[12px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Total Collected
                        </p>
                        <p className="text-[20px] font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {fmt(txnRows.reduce((s, r) => s + r.amount, 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </SectionCard>
          </div>

          {/* Mobile reset button */}
          <div className="flex sm:hidden">
            <button onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold
                bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-4 h-4" /> New Search
            </button>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasData && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/15 dark:to-indigo-500/15 flex items-center justify-center">
              <IndianRupee className="w-9 h-9 text-blue-500 dark:text-blue-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-[15px] font-bold text-slate-600 dark:text-slate-300">Search a Student</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Select a session and enter the admission number to view fee summary, structure and payment history.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {['ADM-2024-001', 'ADM-2024-002', 'ADM-2024-003'].map(id => (
              <button key={id} onClick={() => { setAdmNo(id); setSession('2024-25') }}
                className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-500/25
                  text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                {id}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Pay Modal ─────────────────────────────────────────────────────── */}
      {payModal && (
        <PayModal
          row={payModal}
          student={student}
          onClose={() => setPayModal(null)}
          onConfirm={handlePayConfirm}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
