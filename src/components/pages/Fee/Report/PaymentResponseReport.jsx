/**
 * PaymentResponseReport.jsx
 * Gateway Response Report — School ERP
 *
 * Converts legacy ASP.NET PaymentResponseReport.aspx to
 * fully-responsive React + Tailwind production-quality page.
 *
 * Columns: S.No, Action, Payment Date, Settlement Date,
 *          Order ID, Tracking ID, Bank Ref No, Order Status,
 *          Status Message, Platform, Amount, Registration No,
 *          Student Name, Father Name, Mobile Number, Class,
 *          Payment User Name
 *
 * Features:
 *  - Platform filter (All / Mobile App / Website / Online Admission)
 *  - From Date / To Date range picker
 *  - Admission No autocomplete search
 *  - Show report + Excel export
 *  - Status badge colours (Success / Failed / Pending / Aborted)
 *  - "Update Status" action button for pending transactions
 *  - Summary stat cards (Total, Success, Failed, Pending, Total Amount)
 *  - Desktop: dense ERP table with sticky header
 *  - Mobile: swipeable card layout with expandable detail drawer
 *  - Filter drawer on mobile
 *  - Search within results
 *  - Toast notifications
 *  - Loading skeleton
 *  - Empty / No-result states
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, Filter, RefreshCw, Eye, Download,
  AlertCircle, X, Check, Loader2, ChevronDown,
  ChevronRight, MoreVertical, Calendar, CreditCard,
  Smartphone, Globe, GraduationCap, User, Phone,
  Hash, Receipt, Building2, ArrowUpDown,
  TrendingUp, IndianRupee, CheckCircle2,
  XCircle, Clock, ShieldAlert, SlidersHorizontal,
  FileSpreadsheet, Zap, RotateCcw, Info,
  ChevronUp, ExternalLink, Copy
} from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const PLATFORMS = [
  { value: '0', label: '-- Select All --' },
  { value: 'App', label: 'Mobile App' },
  { value: 'Erp', label: 'Website' },
  { value: 'Admission', label: 'Online Admission' },
]

// Order statuses with style config
const STATUS_CONFIG = {
  Success: {
    label: 'Success',
    bg: 'bg-emerald-50', text: 'text-emerald-700',
    border: 'border-emerald-200', dot: 'bg-emerald-500',
    icon: CheckCircle2,
    dark: 'dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
  },
  Failure: {
    label: 'Failed',
    bg: 'bg-rose-50', text: 'text-rose-700',
    border: 'border-rose-200', dot: 'bg-rose-500',
    icon: XCircle,
    dark: 'dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  },
  Pending: {
    label: 'Pending',
    bg: 'bg-amber-50', text: 'text-amber-700',
    border: 'border-amber-200', dot: 'bg-amber-400',
    icon: Clock,
    dark: 'dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
  },
  Aborted: {
    label: 'Aborted',
    bg: 'bg-slate-100', text: 'text-slate-600',
    border: 'border-slate-200', dot: 'bg-slate-400',
    icon: ShieldAlert,
    dark: 'dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  },
}

// Dummy transaction records
const DUMMY_RECORDS = [
  { id: 1, PaymentDate: '2025-06-01', Settlement_Date: '2025-06-02', OrderID: 'ORD-2506-001', TrackingID: 'TRK10023456', BankRefNo: 'HDFC2506001', OrderStatus: 'Success', StatusMessage: 'Transaction Successful', Platform: 'App', Amount: 4500, RegistrationNo: 'ADM-2025-001', StudentName: 'Arjun Sharma', FatherName: 'Ramesh Sharma', MobileNo: '9876543210', Class: 'X - A', PaymentUserName: 'rsharma', sts: false },
  { id: 2, PaymentDate: '2025-06-01', Settlement_Date: '-', OrderID: 'ORD-2506-002', TrackingID: 'TRK10023457', BankRefNo: '-', OrderStatus: 'Failure', StatusMessage: 'Transaction Failed - Insufficient Funds', Platform: 'Erp', Amount: 3200, RegistrationNo: 'ADM-2025-002', StudentName: 'Priya Verma', FatherName: 'Suresh Verma', MobileNo: '9812345678', Class: 'IX - B', PaymentUserName: 'sverma', sts: false },
  { id: 3, PaymentDate: '2025-06-02', Settlement_Date: '-', OrderID: 'ORD-2506-003', TrackingID: 'TRK10023458', BankRefNo: '-', OrderStatus: 'Pending', StatusMessage: 'Transaction Pending - Awaiting Bank Confirmation', Platform: 'App', Amount: 5800, RegistrationNo: 'ADM-2025-003', StudentName: 'Rohan Gupta', FatherName: 'Anil Gupta', MobileNo: '9898765432', Class: 'XI - A', PaymentUserName: 'agupta', sts: true },
  { id: 4, PaymentDate: '2025-06-02', Settlement_Date: '2025-06-03', OrderID: 'ORD-2506-004', TrackingID: 'TRK10023459', BankRefNo: 'SBI2506004', OrderStatus: 'Success', StatusMessage: 'Transaction Successful', Platform: 'Erp', Amount: 6200, RegistrationNo: 'ADM-2025-004', StudentName: 'Anjali Singh', FatherName: 'Vikram Singh', MobileNo: '9765432109', Class: 'XII - B', PaymentUserName: 'vsingh', sts: false },
  { id: 5, PaymentDate: '2025-06-03', Settlement_Date: '-', OrderID: 'ORD-2506-005', TrackingID: 'TRK10023460', BankRefNo: '-', OrderStatus: 'Aborted', StatusMessage: 'Transaction Aborted by User', Platform: 'Admission', Amount: 2500, RegistrationNo: 'ADM-2025-005', StudentName: 'Karan Mehta', FatherName: 'Deepak Mehta', MobileNo: '9654321098', Class: 'VI - A', PaymentUserName: 'dmehta', sts: false },
  { id: 6, PaymentDate: '2025-06-03', Settlement_Date: '2025-06-04', OrderID: 'ORD-2506-006', TrackingID: 'TRK10023461', BankRefNo: 'ICICI2506006', OrderStatus: 'Success', StatusMessage: 'Transaction Successful', Platform: 'App', Amount: 4800, RegistrationNo: 'ADM-2025-006', StudentName: 'Sneha Patel', FatherName: 'Mahesh Patel', MobileNo: '9543210987', Class: 'VIII - A', PaymentUserName: 'mpatel', sts: false },
  { id: 7, PaymentDate: '2025-06-04', Settlement_Date: '-', OrderID: 'ORD-2506-007', TrackingID: 'TRK10023462', BankRefNo: '-', OrderStatus: 'Pending', StatusMessage: 'Transaction Pending - Payment Gateway Timeout', Platform: 'Erp', Amount: 7100, RegistrationNo: 'ADM-2025-007', StudentName: 'Vikash Yadav', FatherName: 'Rajesh Yadav', MobileNo: '9432109876', Class: 'VII - B', PaymentUserName: 'ryadav', sts: true },
  { id: 8, PaymentDate: '2025-06-04', Settlement_Date: '2025-06-05', OrderID: 'ORD-2506-008', TrackingID: 'TRK10023463', BankRefNo: 'AXIS2506008', OrderStatus: 'Success', StatusMessage: 'Transaction Successful', Platform: 'App', Amount: 3600, RegistrationNo: 'ADM-2025-008', StudentName: 'Neha Joshi', FatherName: 'Ramesh Joshi', MobileNo: '9321098765', Class: 'V - A', PaymentUserName: 'rjoshi', sts: false },
  { id: 9, PaymentDate: '2025-06-05', Settlement_Date: '-', OrderID: 'ORD-2506-009', TrackingID: 'TRK10023464', BankRefNo: '-', OrderStatus: 'Failure', StatusMessage: 'Card Declined - Try Different Card', Platform: 'Admission', Amount: 1500, RegistrationNo: 'ADM-2025-009', StudentName: 'Amit Tiwari', FatherName: 'Suresh Tiwari', MobileNo: '9210987654', Class: 'III - A', PaymentUserName: 'stiwari', sts: false },
  { id: 10, PaymentDate: '2025-06-05', Settlement_Date: '2025-06-06', OrderID: 'ORD-2506-010', TrackingID: 'TRK10023465', BankRefNo: 'PNB2506010', OrderStatus: 'Success', StatusMessage: 'Transaction Successful', Platform: 'Erp', Amount: 5500, RegistrationNo: 'ADM-2025-010', StudentName: 'Pooja Chauhan', FatherName: 'Dinesh Chauhan', MobileNo: '9109876543', Class: 'IV - B', PaymentUserName: 'dchauhan', sts: false },
  { id: 11, PaymentDate: '2025-06-06', Settlement_Date: '-', OrderID: 'ORD-2506-011', TrackingID: 'TRK10023466', BankRefNo: '-', OrderStatus: 'Pending', StatusMessage: 'Awaiting Bank Response', Platform: 'App', Amount: 8200, RegistrationNo: 'ADM-2025-011', StudentName: 'Siddharth Rao', FatherName: 'Naresh Rao', MobileNo: '9001234567', Class: 'XII - A', PaymentUserName: 'nrao', sts: true },
  { id: 12, PaymentDate: '2025-06-06', Settlement_Date: '2025-06-07', OrderID: 'ORD-2506-012', TrackingID: 'TRK10023467', BankRefNo: 'KOTAK2506012', OrderStatus: 'Success', StatusMessage: 'Transaction Successful', Platform: 'Erp', Amount: 4200, RegistrationNo: 'ADM-2025-012', StudentName: 'Ritu Saxena', FatherName: 'Arun Saxena', MobileNo: '9112233445', Class: 'XI - B', PaymentUserName: 'asaxena', sts: false },
]

// Student autocomplete suggestions
const STUDENT_SUGGESTIONS = DUMMY_RECORDS.map(r => ({
  label: r.RegistrationNo,
  name: r.StudentName,
  class: r.Class,
  father: r.FatherName,
  phone: r.MobileNo,
}))

// ─── UTILITY / HELPERS ────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

const getPlatformIcon = (platform) => {
  if (platform === 'App') return Smartphone
  if (platform === 'Erp') return Globe
  if (platform === 'Admission') return GraduationCap
  return CreditCard
}

const getPlatformLabel = (platform) => {
  if (platform === 'App') return 'Mobile App'
  if (platform === 'Erp') return 'Website'
  if (platform === 'Admission') return 'Admission'
  return platform
}

const getPlatformColors = (platform) => {
  if (platform === 'App') return 'bg-violet-50 text-violet-700 border-violet-200'
  if (platform === 'Erp') return 'bg-sky-50 text-sky-700 border-sky-200'
  if (platform === 'Admission') return 'bg-orange-50 text-orange-700 border-orange-200'
  return 'bg-slate-50 text-slate-700 border-slate-200'
}

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold
      border ${cfg.bg} ${cfg.text} ${cfg.border} whitespace-nowrap`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  )
}

function PlatformBadge({ platform }) {
  const Icon = getPlatformIcon(platform)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold
      border ${getPlatformColors(platform)} whitespace-nowrap`}>
      <Icon className="w-3 h-3" />
      {getPlatformLabel(platform)}
    </span>
  )
}

function NativeSelect({ value, onChange, children, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-xl border outline-none
          bg-white text-slate-800 border-slate-200 cursor-pointer
          focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function DateInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input
        type="date"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-9 pr-3 py-2 text-[13px] rounded-xl border outline-none
          bg-white text-slate-800 border-slate-200
          focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          transition-all"
      />
    </div>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  )
}

function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3
      px-5 py-3.5 rounded-2xl shadow-2xl shadow-black/20 text-[13px] font-semibold
      min-w-[280px] max-w-[90vw] animate-slide-up
      ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'info' ? 'bg-indigo-600 text-white' : 'bg-rose-600 text-white'}`}>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
       : type === 'info'    ? <Info className="w-4 h-4 flex-shrink-0" />
       :                      <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-80 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  )
}

// ─── SUMMARY STAT CARDS ───────────────────────────────────────────────────────

function SummaryCards({ records }) {
  const total   = records.length
  const success = records.filter(r => r.OrderStatus === 'Success').length
  const failed  = records.filter(r => r.OrderStatus === 'Failure').length
  const pending = records.filter(r => r.OrderStatus === 'Pending').length
  const amount  = records.filter(r => r.OrderStatus === 'Success').reduce((s, r) => s + r.Amount, 0)

  const cards = [
    { label: 'Total Txns',       value: total,          icon: Receipt,       color: 'indigo', sub: 'All Transactions' },
    { label: 'Success',          value: success,        icon: CheckCircle2,  color: 'emerald', sub: `₹${(records.filter(r=>r.OrderStatus==='Success').reduce((s,r)=>s+r.Amount,0)/100000).toFixed(1)}L collected` },
    { label: 'Failed',           value: failed,         icon: XCircle,       color: 'rose', sub: 'Bank declined / error' },
    { label: 'Pending',          value: pending,        icon: Clock,         color: 'amber', sub: 'Awaiting confirmation' },
    { label: 'Collected Amount', value: fmt(amount),    icon: IndianRupee,   color: 'blue', sub: 'Successful payments', wide: true },
  ]

  const colorMap = {
    indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600 bg-indigo-100', val: 'text-indigo-700', ring: 'ring-indigo-200' },
    emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600 bg-emerald-100', val: 'text-emerald-700', ring: 'ring-emerald-200' },
    rose:    { bg: 'bg-rose-50',    icon: 'text-rose-600 bg-rose-100', val: 'text-rose-700', ring: 'ring-rose-200' },
    amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600 bg-amber-100', val: 'text-amber-700', ring: 'ring-amber-200' },
    blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600 bg-blue-100', val: 'text-blue-700', ring: 'ring-blue-200' },
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((c) => {
        const col = colorMap[c.color]
        const Icon = c.icon
        return (
          <div key={c.label}
            className={`rounded-2xl ${col.bg} border border-white shadow-sm p-4 flex items-start gap-3
              ${c.wide ? 'col-span-2 sm:col-span-3 lg:col-span-1' : ''} animate-slide-up`}>
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${col.icon}`}>
              <Icon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className={`text-[22px] leading-tight font-black tabular-nums ${col.val}`}>{c.value}</p>
              <p className="text-[11px] font-bold text-slate-600 mt-0.5">{c.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{c.sub}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── DESKTOP TABLE ────────────────────────────────────────────────────────────

const COLS = [
  { key: 'sno',             label: 'S.No',           w: 'w-10' },
  { key: 'Action',          label: 'Action',         w: 'w-24' },
  { key: 'PaymentDate',     label: 'Pay Date',       w: 'w-24' },
  { key: 'Settlement_Date', label: 'Settle Date',    w: 'w-24' },
  { key: 'OrderID',         label: 'Order ID',       w: 'w-32' },
  { key: 'TrackingID',      label: 'Tracking ID',    w: 'w-28' },
  { key: 'BankRefNo',       label: 'Bank Ref',       w: 'w-28' },
  { key: 'OrderStatus',     label: 'Status',         w: 'w-24' },
  { key: 'Platform',        label: 'Platform',       w: 'w-24' },
  { key: 'Amount',          label: 'Amount',         w: 'w-24' },
  { key: 'RegistrationNo',  label: 'Reg No.',        w: 'w-28' },
  { key: 'StudentName',     label: 'Student',        w: 'w-36' },
  { key: 'Class',           label: 'Class',          w: 'w-20' },
  { key: 'MobileNo',        label: 'Mobile',         w: 'w-28' },
]

function DesktopTable({ records, onUpdateStatus }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full erp-table" style={{ minWidth: '1100px' }}>
        <thead className="sticky top-0 z-10">
          <tr className="bg-slate-800 text-white">
            {COLS.map(c => (
              <th key={c.key}
                className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wider whitespace-nowrap first:rounded-tl-none last:rounded-tr-none">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((row, i) => (
            <tr key={row.id} className="border-b border-slate-100 hover:bg-indigo-50/40 transition-colors group">
              {/* S.No */}
              <td className="px-3 py-2.5 text-[12px] text-slate-400 font-mono tabular-nums">{i + 1}</td>
              {/* Action */}
              <td className="px-3 py-2.5">
                {row.sts ? (
                  <button onClick={() => onUpdateStatus(row)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold
                      bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-95 whitespace-nowrap shadow-sm">
                    <RotateCcw className="w-3 h-3" />
                    Update
                  </button>
                ) : (
                  <span className="text-[11px] text-slate-300 italic">—</span>
                )}
              </td>
              {/* Pay Date */}
              <td className="px-3 py-2.5 text-[12px] text-slate-700 whitespace-nowrap font-mono">{row.PaymentDate}</td>
              {/* Settle Date */}
              <td className="px-3 py-2.5 text-[12px] text-slate-500 whitespace-nowrap font-mono">
                {row.Settlement_Date === '-' ? <span className="text-slate-300">—</span> : row.Settlement_Date}
              </td>
              {/* Order ID */}
              <td className="px-3 py-2.5">
                <span className="text-[11px] font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg">{row.OrderID}</span>
              </td>
              {/* Tracking ID */}
              <td className="px-3 py-2.5 text-[11px] font-mono text-slate-600 whitespace-nowrap">{row.TrackingID}</td>
              {/* Bank Ref */}
              <td className="px-3 py-2.5 text-[11px] font-mono text-slate-600 whitespace-nowrap">
                {row.BankRefNo === '-' ? <span className="text-slate-300">—</span> : row.BankRefNo}
              </td>
              {/* Status */}
              <td className="px-3 py-2.5"><StatusBadge status={row.OrderStatus} /></td>
              {/* Platform */}
              <td className="px-3 py-2.5"><PlatformBadge platform={row.Platform} /></td>
              {/* Amount */}
              <td className="px-3 py-2.5">
                <span className={`text-[13px] font-black tabular-nums ${row.OrderStatus === 'Success' ? 'text-emerald-700' : 'text-slate-400'}`}>
                  {row.OrderStatus === 'Success' ? fmt(row.Amount) : <span className="text-[12px]">{fmt(row.Amount)}</span>}
                </span>
              </td>
              {/* Reg No */}
              <td className="px-3 py-2.5 text-[11px] font-mono text-slate-700 whitespace-nowrap">{row.RegistrationNo}</td>
              {/* Student Name */}
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {row.StudentName.charAt(0)}
                  </span>
                  <div>
                    <p className="text-[12px] font-semibold text-slate-800 whitespace-nowrap">{row.StudentName}</p>
                    <p className="text-[10px] text-slate-400">{row.FatherName}</p>
                  </div>
                </div>
              </td>
              {/* Class */}
              <td className="px-3 py-2.5 text-[12px] font-semibold text-slate-700 whitespace-nowrap">{row.Class}</td>
              {/* Mobile */}
              <td className="px-3 py-2.5 text-[12px] font-mono text-slate-600 whitespace-nowrap">{row.MobileNo}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE TRANSACTION CARD ──────────────────────────────────────────────────

function MobileCard({ row, idx, onUpdateStatus }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden animate-slide-up">
      {/* Card Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full px-4 py-3.5 text-left flex items-start gap-3 hover:bg-slate-50/60 transition-colors"
      >
        {/* Index circle */}
        <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center text-[11px] font-bold flex-shrink-0 mt-0.5">
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          {/* Student name + status */}
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-slate-800 leading-tight">{row.StudentName}</p>
            <StatusBadge status={row.OrderStatus} />
          </div>
          {/* Second row: reg no + class */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[11px] font-mono text-indigo-600 font-semibold">{row.RegistrationNo}</span>
            <span className="text-slate-300 text-[11px]">·</span>
            <span className="text-[11px] text-slate-500">{row.Class}</span>
            <span className="text-slate-300 text-[11px]">·</span>
            <PlatformBadge platform={row.Platform} />
          </div>
          {/* Third row: amount + date */}
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className={`text-[16px] font-black tabular-nums ${row.OrderStatus === 'Success' ? 'text-emerald-600' : 'text-slate-400'}`}>
              {fmt(row.Amount)}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">{row.PaymentDate}</span>
          </div>
        </div>

        <span className={`text-slate-400 transition-transform duration-200 flex-shrink-0 mt-1 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Quick action strip */}
      {row.sts && (
        <div className="px-4 pb-3 flex">
          <button onClick={() => onUpdateStatus(row)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold
              bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-95 shadow-sm">
            <RotateCcw className="w-3.5 h-3.5" />
            Update Status
          </button>
        </div>
      )}

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-4 animate-fade-in bg-slate-50/50">

          {/* Transaction IDs section */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Transaction Details</p>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: 'Order ID',      value: row.OrderID,         mono: true, accent: true },
                { label: 'Tracking ID',   value: row.TrackingID,      mono: true },
                { label: 'Bank Ref No',   value: row.BankRefNo,       mono: true },
                { label: 'Status Msg',    value: row.StatusMessage,   mono: false },
              ].map(f => (
                <div key={f.label} className="flex items-start justify-between gap-3 py-1.5 border-b border-slate-100 last:border-0">
                  <span className="text-[11px] text-slate-400 font-semibold flex-shrink-0">{f.label}</span>
                  <span className={`text-[12px] text-right break-all
                    ${f.mono ? 'font-mono' : ''}
                    ${f.accent ? 'text-indigo-700 font-bold' : 'text-slate-700 font-medium'}
                    ${f.value === '-' ? 'text-slate-300 italic' : ''}`}>
                    {f.value === '-' ? '—' : f.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Dates</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white border border-slate-200 p-3 text-center">
                <p className="text-[10px] text-slate-400 font-semibold mb-1">Payment Date</p>
                <p className="text-[13px] font-bold text-slate-800 font-mono">{row.PaymentDate}</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-200 p-3 text-center">
                <p className="text-[10px] text-slate-400 font-semibold mb-1">Settlement Date</p>
                <p className={`text-[13px] font-bold font-mono ${row.Settlement_Date === '-' ? 'text-slate-300 italic text-[12px]' : 'text-slate-800'}`}>
                  {row.Settlement_Date === '-' ? 'Pending' : row.Settlement_Date}
                </p>
              </div>
            </div>
          </div>

          {/* Student info */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Student Info</p>
            <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2">
              {[
                { icon: User,       label: 'Student', value: row.StudentName },
                { icon: User,       label: 'Father',  value: row.FatherName },
                { icon: Phone,      label: 'Mobile',  value: row.MobileNo },
                { icon: Hash,       label: 'Reg No',  value: row.RegistrationNo },
                { icon: Building2,  label: 'Class',   value: row.Class },
                { icon: User,       label: 'User',    value: row.PaymentUserName },
              ].map(f => {
                const Icon = f.icon
                return (
                  <div key={f.label} className="flex items-center gap-3">
                    <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-[11px] text-slate-400 w-14 flex-shrink-0">{f.label}</span>
                    <span className="text-[12px] font-semibold text-slate-700 flex-1">{f.value}</span>
                  </div>
                )
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  )
}

// ─── FILTER DRAWER (MOBILE) ───────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading }) {
  if (!open) return null
  const { platform, fromDate, toDate, admNo } = filters

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white shadow-2xl animate-drawer-up"
        style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
            </span>
            <span className="text-[15px] font-bold text-slate-800">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Fields */}
        <div className="px-5 py-5 space-y-4">
          <Field label="E-Platform">
            <NativeSelect value={platform} onChange={e => setFilters(p => ({ ...p, platform: e.target.value }))}>
              {PLATFORMS.map(pl => <option key={pl.value} value={pl.value}>{pl.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="From Date">
            <DateInput value={fromDate} onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value }))} />
          </Field>
          <Field label="To Date">
            <DateInput value={toDate} onChange={e => setFilters(p => ({ ...p, toDate: e.target.value }))} />
          </Field>
          <Field label="Admission No.">
            <input
              value={admNo}
              onChange={e => setFilters(p => ({ ...p, admNo: e.target.value }))}
              placeholder="Search admission no or name…"
              className="w-full px-3 py-2 text-[13px] rounded-xl border border-slate-200 outline-none
                focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
            />
          </Field>
        </div>
        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-[13px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button type="button"
            onClick={() => { onShow(); onClose() }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-bold
              text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 transition-all shadow-lg shadow-indigo-500/25">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const DEFAULT_FILTERS = { platform: '0', fromDate: '', toDate: '', admNo: '' }

export default function PaymentResponseReport() {
  const [filters,      setFilters]      = useState(DEFAULT_FILTERS)
  const [records,      setRecords]      = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [statusTab,    setStatusTab]    = useState('All')
  const [suggestions,  setSuggestions]  = useState([])
  const [showSuggest,  setShowSuggest]  = useState(false)
  const admRef = useRef(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Autocomplete handler
  const handleAdmInput = (val) => {
    setFilters(p => ({ ...p, admNo: val }))
    if (val.length >= 1) {
      const q = val.toLowerCase()
      setSuggestions(STUDENT_SUGGESTIONS.filter(s =>
        s.label.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
      ).slice(0, 6))
      setShowSuggest(true)
    } else {
      setShowSuggest(false)
    }
  }

  const pickSuggestion = (s) => {
    setFilters(p => ({ ...p, admNo: s.label }))
    setShowSuggest(false)
  }

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (admRef.current && !admRef.current.contains(e.target)) setShowSuggest(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // ── Fetch / Show Report ───────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    setLoading(true)
    setSearch('')
    setStatusTab('All')
    setTimeout(() => {
      // Apply platform filter
      let data = [...DUMMY_RECORDS]
      if (filters.platform !== '0') {
        data = data.filter(r => r.Platform === filters.platform)
      }
      // Apply admission no filter
      if (filters.admNo.trim()) {
        const q = filters.admNo.trim().toLowerCase()
        data = data.filter(r =>
          r.RegistrationNo.toLowerCase().includes(q) ||
          r.StudentName.toLowerCase().includes(q)
        )
      }
      setRecords(data)
      setShown(true)
      setLoading(false)
      showToast(`${data.length} records loaded successfully.`, 'success')
    }, 700)
  }, [filters, showToast])

  const handleReset = () => {
    setFilters(DEFAULT_FILTERS)
    setRecords([])
    setShown(false)
    setSearch('')
    setStatusTab('All')
  }

  const handleExcel = () => {
    if (!shown || records.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel file ready! (API integration pending)', 'info')
    }, 1200)
  }

  const handleUpdateStatus = (row) => {
    showToast(`Status check initiated for Order ${row.OrderID}`, 'info')
    // API integration placeholder: POST to /api/payment/check-status
  }

  // ── Filter records by search + status tab ────────────────────────────────
  const filtered = useMemo(() => {
    let data = records
    if (statusTab !== 'All') data = data.filter(r => r.OrderStatus === statusTab)
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(r =>
        r.StudentName.toLowerCase().includes(q) ||
        r.RegistrationNo.toLowerCase().includes(q) ||
        r.OrderID.toLowerCase().includes(q) ||
        r.TrackingID.toLowerCase().includes(q) ||
        r.MobileNo.includes(q) ||
        r.Class.toLowerCase().includes(q)
      )
    }
    return data
  }, [records, statusTab, search])

  // ── Tab counts ────────────────────────────────────────────────────────────
  const tabCounts = useMemo(() => ({
    All:     records.length,
    Success: records.filter(r => r.OrderStatus === 'Success').length,
    Failure: records.filter(r => r.OrderStatus === 'Failure').length,
    Pending: records.filter(r => r.OrderStatus === 'Pending').length,
    Aborted: records.filter(r => r.OrderStatus === 'Aborted').length,
  }), [records])

  const STATUS_TABS = ['All', 'Success', 'Failure', 'Pending', 'Aborted']

  const activeFilterCount = [
    filters.platform !== '0',
    filters.fromDate !== '',
    filters.toDate !== '',
    filters.admNo !== '',
  ].filter(Boolean).length

  return (
    <div className="min-h-screen bg-[#f0f4ff] p-3 sm:p-4 lg:p-6">
      <div className="max-w-screen-2xl mx-auto space-y-4">

        {/* ── PAGE HEADER ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <CreditCard className="w-4 h-4 text-white" />
              </span>
              <h1 className="text-[20px] sm:text-[22px] font-black text-slate-800 tracking-tight">
                Gateway Response Report
              </h1>
            </div>
            <p className="text-[12px] text-slate-500 ml-10">
              Payment gateway transactions — track, verify & update status
            </p>
          </div>
          <div className="flex items-center gap-2 ml-10 sm:ml-0">
            {shown && (
              <button onClick={handleExcel} disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold
                  bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                  disabled:opacity-70 transition-all active:scale-95">
                {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Export Excel</span>
              </button>
            )}
          </div>
        </div>

        {/* ── DESKTOP FILTER CARD ───────────────────────────────────────── */}
        <div className="hidden sm:block rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">
          {/* Card header */}
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
            <span className="w-1.5 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
            <Filter className="w-4 h-4 text-indigo-600" />
            <span className="text-[13px] font-bold text-slate-700">Search Filters</span>
            {activeFilterCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-[10px] font-bold rounded-full bg-indigo-600 text-white">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <Field label="E-Platform">
                <NativeSelect
                  value={filters.platform}
                  onChange={e => setFilters(p => ({ ...p, platform: e.target.value }))}>
                  {PLATFORMS.map(pl => <option key={pl.value} value={pl.value}>{pl.label}</option>)}
                </NativeSelect>
              </Field>
              <Field label="From Date">
                <DateInput value={filters.fromDate}
                  onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value }))} />
              </Field>
              <Field label="To Date">
                <DateInput value={filters.toDate}
                  onChange={e => setFilters(p => ({ ...p, toDate: e.target.value }))} />
              </Field>
              {/* Admission No with autocomplete */}
              <Field label="Admission No.">
                <div className="relative" ref={admRef}>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    value={filters.admNo}
                    onChange={e => handleAdmInput(e.target.value)}
                    placeholder="Adm no. or name…"
                    className="w-full pl-9 pr-3 py-2 text-[13px] rounded-xl border border-slate-200 outline-none
                      focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  {/* Autocomplete dropdown */}
                  {showSuggest && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl border border-slate-200 shadow-2xl z-50 overflow-hidden">
                      {suggestions.map(s => (
                        <button key={s.label} type="button" onClick={() => pickSuggestion(s)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-indigo-50 text-left transition-colors border-b border-slate-50 last:border-0">
                          <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                            {s.name.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <p className="text-[12px] font-bold text-slate-800">{s.name}</p>
                            <p className="text-[10px] text-slate-400">{s.label} · {s.class}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              {/* Action buttons */}
              <div className="flex gap-2">
                <button type="button" onClick={handleShow} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-bold
                    bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20
                    transition-all active:scale-95 disabled:opacity-70">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Show
                </button>
                <button type="button" onClick={handleReset}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE FILTER BAR ──────────────────────────────────────────── */}
        <div className="flex sm:hidden gap-2">
          <button type="button" onClick={() => setFilterOpen(true)}
            className="flex-1 flex items-center gap-2.5 py-3 px-4 rounded-2xl font-bold text-[13px]
              bg-indigo-600 text-white shadow-lg shadow-indigo-500/25">
            <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left">
              {activeFilterCount > 0 ? `${activeFilterCount} Filter${activeFilterCount > 1 ? 's' : ''} Active` : 'Filters & Search'}
            </span>
            {activeFilterCount > 0 && (
              <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{activeFilterCount}</span>
            )}
          </button>
          {shown && (
            <>
              <button type="button" onClick={handleExcel} disabled={exporting}
                className="px-4 py-3 rounded-2xl bg-emerald-600 text-white shadow-sm disabled:opacity-70">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              </button>
              <button type="button" onClick={handleReset}
                className="px-3.5 py-3 rounded-2xl bg-white text-slate-600 border border-slate-200 shadow-sm">
                <RefreshCw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>

        {/* Filter Drawer */}
        <FilterDrawer
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          filters={filters}
          setFilters={setFilters}
          onShow={handleShow}
          loading={loading}
        />

        {/* ── LOADING SKELETON ───────────────────────────────────────────── */}
        {loading && (
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-5">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {/* ── RESULTS SECTION ────────────────────────────────────────────── */}
        {shown && !loading && (
          <>
            {/* Summary Stats */}
            <SummaryCards records={records} />

            {/* Results Card */}
            <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden">

              {/* Card Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4
                border-b border-slate-100 bg-slate-50/70">
                <div className="flex items-center gap-2.5 flex-1 min-w-0 flex-wrap">
                  <span className="w-1.5 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
                  <Receipt className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="text-[14px] font-bold text-slate-700">Transaction Records</span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700">
                    {filtered.length} records
                  </span>
                </div>
                {/* Search box */}
                <div className="relative w-full sm:w-64 flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search name, order, mobile…"
                    className="w-full pl-9 pr-8 py-2 text-[12px] rounded-xl border border-slate-200 outline-none
                      bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* STATUS TABS */}
              <div className="flex items-center gap-1 px-4 py-3 border-b border-slate-100 overflow-x-auto no-scrollbar">
                {STATUS_TABS.map(tab => {
                  const isActive = statusTab === tab
                  const count    = tabCounts[tab] ?? 0
                  const cfg      = tab === 'All'
                    ? { dot: 'bg-slate-400', active: 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20' }
                    : STATUS_CONFIG[tab]
                      ? { dot: STATUS_CONFIG[tab].dot, active: `${STATUS_CONFIG[tab].bg} ${STATUS_CONFIG[tab].text} border ${STATUS_CONFIG[tab].border}` }
                      : {}

                  return (
                    <button key={tab} type="button"
                      onClick={() => setStatusTab(tab)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-bold
                        whitespace-nowrap transition-all flex-shrink-0
                        ${isActive
                          ? tab === 'All'
                            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                            : cfg.active
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                        }`}>
                      {tab !== 'All' && (
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      )}
                      {tab}
                      <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full
                        ${isActive
                          ? tab === 'All' ? 'bg-white/25 text-white' : 'bg-black/10'
                          : 'bg-white text-slate-600'
                        }`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* DESKTOP TABLE */}
              <div className="hidden md:block">
                {filtered.length === 0 ? (
                  <EmptyResult search={search} />
                ) : (
                  <DesktopTable records={filtered} onUpdateStatus={handleUpdateStatus} />
                )}
              </div>

              {/* MOBILE CARDS */}
              <div className="md:hidden p-3 space-y-3">
                {filtered.length === 0 ? (
                  <EmptyResult search={search} />
                ) : (
                  filtered.map((row, i) => (
                    <MobileCard key={row.id} row={row} idx={i + 1} onUpdateStatus={handleUpdateStatus} />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5
                border-t border-slate-100 bg-slate-50/50">
                <p className="text-[12px] text-slate-400">
                  Showing <span className="font-bold text-slate-700">{filtered.length}</span> of{' '}
                  <span className="font-bold text-slate-700">{records.length}</span> records
                  {statusTab !== 'All' && (
                    <> — filtered by <span className="font-bold text-indigo-600">{statusTab}</span></>
                  )}
                </p>
                <div className="flex items-center gap-2">
                  {search && (
                    <button onClick={() => setSearch('')}
                      className="text-[12px] text-indigo-600 hover:underline flex items-center gap-1">
                      <X className="w-3 h-3" />Clear search
                    </button>
                  )}
                  {statusTab !== 'All' && (
                    <button onClick={() => setStatusTab('All')}
                      className="text-[12px] text-indigo-600 hover:underline flex items-center gap-1">
                      <X className="w-3 h-3" />Clear filter
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── EMPTY / INITIAL STATE ─────────────────────────────────────── */}
        {!shown && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-5">
            <div className="w-20 h-20 rounded-3xl bg-white border-2 border-dashed border-slate-200
              flex items-center justify-center shadow-sm">
              <CreditCard className="w-9 h-9 text-slate-300" />
            </div>
            <div className="text-center max-w-sm">
              <p className="text-[16px] font-bold text-slate-600 mb-1">No Report Generated</p>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                Select your filters above and click <strong>Show</strong> to load payment gateway transactions.
              </p>
            </div>
            <button type="button"
              onClick={() => { setFilters(DEFAULT_FILTERS); handleShow() }}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[13px] font-bold
                bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              <Zap className="w-4 h-4" />
              Load All Records
            </button>
          </div>
        )}

      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY RESULT STATE ───────────────────────────────────────────────────────
function EmptyResult({ search }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400">
      <Search className="w-8 h-8 opacity-30" />
      <p className="text-[13px] font-semibold text-slate-500">No records found</p>
      <p className="text-[12px] text-slate-400 text-center max-w-xs">
        {search
          ? `No results for "${search}". Try different keywords.`
          : 'No transactions match the selected status filter.'}
      </p>
    </div>
  )
}
