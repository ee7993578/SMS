/**
 * LateFeeReport.jsx
 * Late Fee Report page — converted from ASPX to React + Tailwind
 * Features: Session/Class/AdmNo filters, GridView with Edit modal,
 *           mobile card layout, desktop dense table, toast notifications
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Search, RefreshCw, Filter, SlidersHorizontal,
  X, Check, AlertCircle, Loader2, ChevronDown,
  ChevronRight, Edit2, IndianRupee, Receipt,
  User, Users, GraduationCap, Calendar,
  FileText, ArrowLeft, Eye, TrendingUp,
  BadgeIndianRupee, Clock, BookOpen, Info,
  CheckCircle2, XCircle, Hash
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  { id: '0', name: 'All Classes' },
  { id: '1', name: 'Nursery' },
  { id: '2', name: 'LKG' },
  { id: '3', name: 'UKG' },
  { id: '4', name: 'Class I' },
  { id: '5', name: 'Class II' },
  { id: '6', name: 'Class III' },
  { id: '7', name: 'Class IV' },
  { id: '8', name: 'Class V' },
  { id: '9', name: 'Class VI' },
  { id: '10', name: 'Class VII' },
  { id: '11', name: 'Class VIII' },
  { id: '12', name: 'Class IX' },
  { id: '13', name: 'Class X' },
  { id: '14', name: 'Class XI' },
  { id: '15', name: 'Class XII' },
]

const LATE_FEE_DATA = [
  { id: 1, Registration_No: 'ADM001', Name: 'Arjun Sharma', Father_name: 'Ramesh Sharma', Class: 'Class IX - A', Status: 'Pending', installment: '1st', lateFee: 200, receiptNo: 'R001', session: '2025-26' },
  { id: 2, Registration_No: 'ADM002', Name: 'Priya Gupta', Father_name: 'Suresh Gupta', Class: 'Class X - B', Status: 'Paid', installment: '2nd', lateFee: 150, receiptNo: 'R002', session: '2025-26' },
  { id: 3, Registration_No: 'ADM003', Name: 'Rohit Verma', Father_name: 'Mahesh Verma', Class: 'Class VIII - A', Status: 'Pending', installment: '1st', lateFee: 300, receiptNo: 'R003', session: '2025-26' },
  { id: 4, Registration_No: 'ADM004', Name: 'Sneha Singh', Father_name: 'Dinesh Singh', Class: 'Class VII - A', Status: 'Paid', installment: '3rd', lateFee: 100, receiptNo: 'R004', session: '2025-26' },
  { id: 5, Registration_No: 'ADM005', Name: 'Amit Patel', Father_name: 'Harish Patel', Class: 'Class VI - B', Status: 'Pending', installment: '2nd', lateFee: 250, receiptNo: 'R005', session: '2025-26' },
  { id: 6, Registration_No: 'ADM006', Name: 'Kavya Mishra', Father_name: 'Rajesh Mishra', Class: 'Class XI - A', Status: 'Pending', installment: '1st', lateFee: 500, receiptNo: 'R006', session: '2025-26' },
  { id: 7, Registration_No: 'ADM007', Name: 'Vivek Kumar', Father_name: 'Anil Kumar', Class: 'Class XII - B', Status: 'Paid', installment: '4th', lateFee: 0, receiptNo: 'R007', session: '2025-26' },
  { id: 8, Registration_No: 'ADM008', Name: 'Pooja Yadav', Father_name: 'Ramkumar Yadav', Class: 'Class V - A', Status: 'Pending', installment: '1st', lateFee: 175, receiptNo: 'R008', session: '2025-26' },
  { id: 9, Registration_No: 'ADM009', Name: 'Harsh Agarwal', Father_name: 'Vinod Agarwal', Class: 'Class IV - A', Status: 'Paid', installment: '2nd', lateFee: 50, receiptNo: 'R009', session: '2025-26' },
  { id: 10, Registration_No: 'ADM010', Name: 'Ananya Tiwari', Father_name: 'Deepak Tiwari', Class: 'Class III - A', Status: 'Pending', installment: '3rd', lateFee: 400, receiptNo: 'R010', session: '2025-26' },
  { id: 11, Registration_No: 'ADM011', Name: 'Siddharth Joshi', Father_name: 'Pramod Joshi', Class: 'Class II - A', Status: 'Paid', installment: '1st', lateFee: 125, receiptNo: 'R011', session: '2025-26' },
  { id: 12, Registration_No: 'ADM012', Name: 'Riya Dubey', Father_name: 'Santosh Dubey', Class: 'Class I - B', Status: 'Pending', installment: '2nd', lateFee: 225, receiptNo: 'R012', session: '2025-26' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const statusConfig = {
  Paid:    { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2 },
  Pending: { bg: 'bg-rose-50 dark:bg-rose-500/10',     text: 'text-rose-700 dark:text-rose-400',       border: 'border-rose-200 dark:border-rose-500/20',   icon: Clock },
}

const installmentColors = ['bg-blue-100 text-blue-700', 'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700', 'bg-cyan-100 text-cyan-700']
const installmentColor = (inst) => {
  const map = { '1st': 0, '2nd': 1, '3rd': 2, '4th': 3 }
  return installmentColors[map[inst] ?? 0] || installmentColors[0]
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[92vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}
      `}
      style={{ transform: 'translateX(-50%)', animation: 'toastUp .28s cubic-bezier(.34,1.56,.64,1)' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  )
}

// ─── NATIVE SELECT ────────────────────────────────────────────────────────────
function NativeSelect({ value, onChange, children, error, disabled, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 font-medium
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 hover:border-slate-300'}
          ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

// ─── FIELD WRAPPER ─────────────────────────────────────────────────────────────
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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    blue:    { bg: 'bg-blue-50',    text: 'text-blue-600',    val: 'text-blue-800' },
    rose:    { bg: 'bg-rose-50',    text: 'text-rose-600',    val: 'text-rose-800' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', val: 'text-emerald-800' },
    amber:   { bg: 'bg-amber-50',   text: 'text-amber-600',   val: 'text-amber-800' },
    violet:  { bg: 'bg-violet-50',  text: 'text-violet-600',  val: 'text-violet-800' },
  }
  const c = colors[color] || colors.blue
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
        <Icon className={`w-5 h-5 ${c.text}`} />
      </span>
      <div className="min-w-0">
        <p className={`text-[20px] font-extrabold tabular-nums leading-tight ${c.val}`}>{value}</p>
        <p className="text-[11px] text-slate-500 truncate">{label}</p>
        {sub && <p className={`text-[10px] font-semibold ${c.text} truncate`}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ row, onClose, onSave }) {
  const [amount, setAmount] = useState('')
  const [error, setError]   = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = () => {
    if (!amount || isNaN(amount) || Number(amount) < 0) { setError('Enter a valid amount'); return }
    if (Number(amount) > row.lateFee) { setError(`Amount cannot exceed current late fee ₹${row.lateFee}`); return }
    setError('')
    setSaving(true)
    setTimeout(() => { setSaving(false); onSave(row, Number(amount)) }, 700)
  }

  const cfg = statusConfig[row.Status] || statusConfig.Pending
  const StatusIcon = cfg.icon

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm px-0 sm:px-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn .3s cubic-bezier(.34,1.56,.64,1)' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(30px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Edit2 className="w-4 h-4 text-blue-600" />
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800">Update Late Fee</h3>
              <p className="text-[11px] text-slate-400 font-medium">Adm No: {row.Registration_No}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Student Info Banner */}
        <div className="mx-5 mt-4 rounded-2xl bg-slate-50 border border-slate-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-[14px] flex-shrink-0">
              {row.Name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-slate-800 truncate">{row.Name}</p>
              <p className="text-[12px] text-slate-500 truncate">{row.Father_name} · {row.Class}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                  <StatusIcon className="w-2.5 h-2.5" />{row.Status}
                </span>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${installmentColor(row.installment)}`}>
                  {row.installment} Installment
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Receipt: {row.receiptNo}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          {/* Current Late Fee Display */}
          <div className="flex items-center justify-between rounded-xl bg-rose-50 border border-rose-100 px-4 py-3">
            <span className="text-[13px] font-semibold text-rose-700 flex items-center gap-2">
              <IndianRupee className="w-4 h-4" /> Current Late Fee
            </span>
            <span className="text-[18px] font-extrabold text-rose-700 tabular-nums">₹{row.lateFee}</span>
          </div>

          {/* Input */}
          <Field label="Amount to Decrease" error={error} required>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-[14px]">₹</span>
              <input
                type="number"
                min="0"
                max={row.lateFee}
                value={amount}
                onChange={e => { setAmount(e.target.value); setError('') }}
                placeholder="Enter amount…"
                className={`w-full pl-8 pr-4 py-2.5 text-[14px] font-semibold rounded-xl border outline-none transition-all
                  bg-white text-slate-800
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
              />
            </div>
            {amount && !error && Number(amount) <= row.lateFee && (
              <p className="text-[12px] text-emerald-600 font-semibold mt-1">
                New Late Fee will be: ₹{row.lateFee - Number(amount)}
              </p>
            )}
          </Field>
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, index, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = statusConfig[row.Status] || statusConfig.Pending
  const StatusIcon = cfg.icon

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Main row */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-50/70 transition-colors"
      >
        {/* Index badge */}
        <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 flex-shrink-0">
          {index}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[14px] font-bold text-slate-800 truncate leading-tight">{row.Name}</p>
            {/* Late fee pill */}
            <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-[12px] font-extrabold tabular-nums
              ${row.lateFee > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
              ₹{row.lateFee}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 truncate mt-0.5">{row.Registration_No} · {row.Class}</p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <StatusIcon className="w-2.5 h-2.5" />{row.Status}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${installmentColor(row.installment)}`}>
              {row.installment}
            </span>
          </div>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pt-3.5 pb-4 bg-slate-50/50">
          <div className="grid grid-cols-2 gap-2.5 mb-3.5">
            {[
              { label: 'Admission No',  value: row.Registration_No, icon: Hash },
              { label: 'Father Name',   value: row.Father_name,     icon: User },
              { label: 'Class',         value: row.Class,           icon: GraduationCap },
              { label: 'Installment',   value: row.installment,     icon: Calendar },
              { label: 'Receipt No',    value: row.receiptNo,       icon: Receipt },
              { label: 'Session',       value: row.session,         icon: BookOpen },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="rounded-xl bg-white border border-slate-100 p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3 h-3 text-slate-400 flex-shrink-0" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate">{label}</span>
                </div>
                <p className="text-[12px] font-bold text-slate-700 truncate">{value}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => onEdit(row)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl
              bg-blue-600 text-white text-[13px] font-bold hover:bg-blue-700
              shadow-md shadow-blue-500/15 transition-all active:scale-98"
          >
            <Edit2 className="w-4 h-4" /> Edit Late Fee
          </button>
        </div>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, index, onEdit }) {
  const cfg = statusConfig[row.Status] || statusConfig.Pending
  const StatusIcon = cfg.icon

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-12 font-medium">{index}</td>
      <td className="px-4 py-3">
        <span className="text-[13px] font-bold text-slate-700">{row.Registration_No}</span>
      </td>
      <td className="px-4 py-3">
        <p className="text-[13px] font-semibold text-slate-800 whitespace-nowrap">{row.Name}</p>
        <p className="text-[11px] text-slate-400 whitespace-nowrap">{row.Father_name}</p>
      </td>
      <td className="px-4 py-3">
        <span className="text-[12px] font-medium text-slate-600 whitespace-nowrap">{row.Father_name}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-[12px] font-semibold text-slate-700 whitespace-nowrap">{row.Class}</span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
          <StatusIcon className="w-3 h-3" />{row.Status}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${installmentColor(row.installment)}`}>
          {row.installment}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[13px] font-extrabold tabular-nums
          ${row.lateFee > 0 ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
          ₹{row.lateFee}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] font-medium text-slate-600">{row.receiptNo}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
          {row.session}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-bold
            bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/15
            transition-all active:scale-95 group-hover:shadow-blue-500/25"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
      </td>
    </tr>
  )
}

// ─── FILTER DRAWER (MOBILE) ───────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, classId, setClassId, admno, setAdmno, onSubmit, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white border-t border-slate-200 shadow-2xl"
        style={{ animation: 'drawerUp .28s cubic-bezier(.34,1.56,.64,1)' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="text-[15px] font-bold text-slate-800">Search Filters</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} error={errors.session}>
              <option value="">-- Select Session --</option>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class">
            <NativeSelect value={classId} onChange={e => setClassId(e.target.value)}>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Admission No">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={admno}
                onChange={e => setAdmno(e.target.value)}
                placeholder="Enter admission number…"
                className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border border-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-slate-800"
              />
            </div>
          </Field>
        </div>
        <div className="px-5 pb-6 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Search
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────
export default function LateFeeReport() {
  // Filter state
  const [session,  setSession]  = useState('')
  const [classId,  setClassId]  = useState('0')
  const [admno,    setAdmno]    = useState('')
  const [errors,   setErrors]   = useState({})

  // Data state
  const [rows,    setRows]    = useState([])
  const [shown,   setShown]   = useState(false)
  const [loading, setLoading] = useState(false)

  // UI state
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [editRow,     setEditRow]     = useState(null)
  const [toast,       setToast]       = useState(null)
  const [searchText,  setSearchText]  = useState('')
  const [activeTab,   setActiveTab]   = useState('all') // all | pending | paid

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Submit / Fetch ─────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearchText('')
    setActiveTab('all')

    // Simulate API call
    setTimeout(() => {
      let filtered = LATE_FEE_DATA
      if (classId !== '0') {
        const className = CLASSES.find(c => c.id === classId)?.name || ''
        filtered = filtered.filter(r => r.Class.includes(className))
      }
      if (admno) {
        filtered = filtered.filter(r => r.Registration_No.toLowerCase().includes(admno.toLowerCase()))
      }
      setRows(filtered)
      setShown(true)
      setLoading(false)
      showToast(`Found ${filtered.length} records for session ${session}`, 'success')
    }, 700)
  }, [session, classId, admno])

  const handleReset = () => {
    setSession(''); setClassId('0'); setAdmno('')
    setRows([]); setShown(false); setSearchText('')
    setErrors({}); setActiveTab('all')
  }

  // ── Edit Save ──────────────────────────────────────────────────────────────
  const handleSave = (row, decreaseAmount) => {
    setRows(prev => prev.map(r =>
      r.id === row.id
        ? { ...r, lateFee: r.lateFee - decreaseAmount, Status: (r.lateFee - decreaseAmount === 0) ? 'Paid' : r.Status }
        : r
    ))
    setEditRow(null)
    showToast(`Late fee updated for ${row.Name}. Decreased by ₹${decreaseAmount}.`, 'success')
  }

  // ── Computed / Filtered ────────────────────────────────────────────────────
  const displayRows = useMemo(() => {
    let data = rows
    if (searchText) {
      const q = searchText.toLowerCase()
      data = data.filter(r =>
        r.Name.toLowerCase().includes(q) ||
        r.Registration_No.toLowerCase().includes(q) ||
        r.Class.toLowerCase().includes(q) ||
        r.Father_name.toLowerCase().includes(q)
      )
    }
    if (activeTab === 'pending') data = data.filter(r => r.Status === 'Pending')
    if (activeTab === 'paid')    data = data.filter(r => r.Status === 'Paid')
    return data
  }, [rows, searchText, activeTab])

  const stats = useMemo(() => ({
    total:        rows.length,
    pending:      rows.filter(r => r.Status === 'Pending').length,
    paid:         rows.filter(r => r.Status === 'Paid').length,
    totalFee:     rows.reduce((s, r) => s + r.lateFee, 0),
    pendingFee:   rows.filter(r => r.Status === 'Pending').reduce((s, r) => s + r.lateFee, 0),
  }), [rows])

  const activeFilters = [session, classId !== '0', admno].filter(Boolean).length

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center gap-3">
          <button className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors flex-shrink-0">
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 leading-tight flex items-center gap-2">
              <BadgeIndianRupee className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <span className="truncate">Late Fee Report</span>
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block mt-0.5">View and manage student late fee records</p>
          </div>

          {/* Desktop: Back to Deposit */}
          <button className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold
            bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 transition-all">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Deposit
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ── DESKTOP FILTER CARD ──────────────────────────────────────── */}
        <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50/60">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Filter className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700">Search Filters</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <Field label="Session" error={errors.session} required>
                <NativeSelect
                  value={session}
                  onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                  error={errors.session}
                >
                  <option value="">-- Select Session --</option>
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </NativeSelect>
              </Field>

              <Field label="Class">
                <NativeSelect value={classId} onChange={e => setClassId(e.target.value)}>
                  {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </NativeSelect>
              </Field>

              <Field label="Admission No">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    value={admno}
                    onChange={e => setAdmno(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Search by adm no…"
                    className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border border-slate-200 outline-none
                      focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-slate-800"
                  />
                </div>
              </Field>

              <div className="flex gap-2">
                <button onClick={handleSubmit} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white
                    bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Search
                </button>
                <button onClick={handleReset}
                  className="w-10 flex items-center justify-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE FILTER BAR ────────────────────────────────────────── */}
        <div className="flex sm:hidden gap-2">
          <button onClick={() => setFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[13px] font-bold
              bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <SlidersHorizontal className="w-4 h-4" />
            {activeFilters > 0 ? `Filters (${activeFilters})` : 'Set Filters & Search'}
          </button>
          {shown && (
            <button onClick={handleReset}
              className="w-11 rounded-2xl bg-slate-200 text-slate-600 hover:bg-slate-300 flex items-center justify-center transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ── LOADING ────────────────────────────────────────────────────── */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            <div className="h-16 rounded-xl bg-slate-100 animate-pulse mb-4" />
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {/* ── RESULTS ────────────────────────────────────────────────────── */}
        {shown && !loading && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Users}       label="Total Records"    value={stats.total}                  color="blue"    />
              <StatCard icon={Clock}       label="Pending"          value={stats.pending}                color="rose"    sub={`₹${stats.pendingFee.toLocaleString()} due`} />
              <StatCard icon={CheckCircle2}label="Paid"             value={stats.paid}                   color="emerald" />
              <StatCard icon={IndianRupee} label="Total Late Fee"   value={`₹${stats.totalFee.toLocaleString()}`} color="amber" />
            </div>

            {/* Results Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* Card header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                  <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                  <FileText className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="text-[14px] font-bold text-slate-700">Late Fee Records</span>
                  {session && (
                    <span className="text-[12px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700">
                      {session}
                    </span>
                  )}
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {displayRows.length} record{displayRows.length !== 1 ? 's' : ''}
                  </span>
                </div>
                {/* Live search */}
                <div className="relative w-full sm:w-56 flex-shrink-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    value={searchText}
                    onChange={e => setSearchText(e.target.value)}
                    placeholder="Search name, adm no…"
                    className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-xl border border-slate-200 outline-none
                      focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-slate-700"
                  />
                  {searchText && (
                    <button onClick={() => setSearchText('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 px-5 py-2.5 border-b border-slate-100 bg-white overflow-x-auto scrollbar-hide">
                {[
                  { key: 'all',     label: 'All',     count: rows.length },
                  { key: 'pending', label: 'Pending', count: stats.pending },
                  { key: 'paid',    label: 'Paid',    count: stats.paid },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-xl text-[12px] font-bold whitespace-nowrap transition-all
                      ${activeTab === tab.key
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {tab.label}
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold
                      ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-white text-slate-600'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* ── DESKTOP TABLE ── */}
              <div className="hidden md:block overflow-x-auto">
                {displayRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Search className="w-6 h-6 opacity-40" />
                    </div>
                    <p className="text-[13px] font-semibold">No records found</p>
                    <p className="text-[12px]">Try adjusting your search or filters.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/70">
                        {['S.No.', 'Adm No', 'Name / Father', 'Father Name', 'Class', 'Status', 'Installment', 'Late Fee', 'Receipt', 'Session', 'Action'].map((h, i) => (
                          <th key={i}
                            className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 text-left whitespace-nowrap first:text-center">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {displayRows.map((row, i) => (
                        <DesktopRow key={row.id} row={row} index={i + 1} onEdit={setEditRow} />
                      ))}
                    </tbody>
                    {/* Grand total row */}
                    <tfoot>
                      <tr className="bg-blue-50 border-t-2 border-blue-200">
                        <td className="px-4 py-3 text-center text-[12px] text-blue-500">—</td>
                        <td className="px-4 py-3" colSpan={6}>
                          <span className="flex items-center gap-2 text-[13px] font-bold text-blue-700">
                            <TrendingUp className="w-4 h-4" /> Grand Total ({displayRows.length} records)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-[13px] font-extrabold bg-rose-100 text-rose-800 tabular-nums border border-rose-200">
                            ₹{displayRows.reduce((s, r) => s + r.lateFee, 0).toLocaleString()}
                          </span>
                        </td>
                        <td colSpan={3} />
                      </tr>
                    </tfoot>
                  </table>
                )}
              </div>

              {/* ── MOBILE CARDS ── */}
              <div className="md:hidden p-4 space-y-3">
                {displayRows.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center">
                      <Search className="w-6 h-6 opacity-40" />
                    </div>
                    <p className="text-[13px] font-semibold">No records found</p>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-blue-600 font-semibold flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      Tap a card to see full details &amp; edit
                    </p>
                    {displayRows.map((row, i) => (
                      <MobileCard key={row.id} row={row} index={i + 1} onEdit={setEditRow} />
                    ))}
                    {/* Mobile total */}
                    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 px-4 py-4">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 flex items-center gap-2 mb-2">
                        <TrendingUp className="w-3.5 h-3.5" /> Total ({displayRows.length} records)
                      </p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl bg-white p-2.5 text-center border border-blue-100">
                          <p className="text-[18px] font-extrabold text-blue-700 tabular-nums">{displayRows.length}</p>
                          <p className="text-[10px] font-bold text-blue-500">Records</p>
                        </div>
                        <div className="rounded-xl bg-white p-2.5 text-center border border-rose-100">
                          <p className="text-[18px] font-extrabold text-rose-700 tabular-nums">
                            {displayRows.filter(r => r.Status === 'Pending').length}
                          </p>
                          <p className="text-[10px] font-bold text-rose-500">Pending</p>
                        </div>
                        <div className="rounded-xl bg-white p-2.5 text-center border border-amber-100">
                          <p className="text-[16px] font-extrabold text-amber-700 tabular-nums">
                            ₹{displayRows.reduce((s, r) => s + r.lateFee, 0)}
                          </p>
                          <p className="text-[10px] font-bold text-amber-500">Total Fee</p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
                <p className="text-[12px] text-slate-400">
                  Showing <span className="font-bold text-slate-700">{displayRows.length}</span> of{' '}
                  <span className="font-bold text-slate-700">{rows.length}</span> records
                </p>
                {(searchText || activeTab !== 'all') && (
                  <button
                    onClick={() => { setSearchText(''); setActiveTab('all') }}
                    className="text-[12px] text-blue-600 hover:underline flex items-center gap-1 font-semibold">
                    <X className="w-3 h-3" /> Clear filters
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── EMPTY STATE ───────────────────────────────────────────────── */}
        {!shown && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-slate-400">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center shadow-lg">
                <BadgeIndianRupee className="w-10 h-10 text-blue-400" />
              </div>
              <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-amber-400 flex items-center justify-center">
                <Search className="w-3 h-3 text-white" />
              </span>
            </div>
            <div className="text-center max-w-xs">
              <p className="text-[16px] font-bold text-slate-600 mb-1">No Report Generated</p>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                Select a <span className="font-semibold text-blue-600">session</span> and optionally filter by class or admission no, then click <span className="font-semibold text-blue-600">Search</span> to view late fee records.
              </p>
            </div>
            {/* CTA hint for mobile */}
            <div className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span className="text-[12px] font-semibold text-blue-700">Tap "Set Filters" above to begin</span>
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE FILTER DRAWER ────────────────────────────────────────── */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        classId={classId} setClassId={setClassId}
        admno={admno} setAdmno={setAdmno}
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors}
      />

      {/* ── EDIT MODAL ──────────────────────────────────────────────────── */}
      {editRow && (
        <EditModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onSave={handleSave}
        />
      )}

      {/* ── TOAST ───────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
