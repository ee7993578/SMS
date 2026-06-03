/**
 * DepositLateFees.jsx
 * Folder: src/pages/Fee/DepositLateFees.jsx
 *
 * Converts deposit-late-fees.aspx → React + Tailwind (Vite, JS only)
 *
 * Features:
 *  - Fee type: Regular / Transport / Hostel (radio)
 *  - Print Receipt checkbox
 *  - Session, Adm No, Class, Student dropdowns + Date picker
 *  - Show button → installment late-fee grid
 *  - Per-row Deposit button
 *  - Receipt success modal
 *  - Fully responsive: table → cards on mobile
 *  - No horizontal scroll on mobile
 */

import { useState, useMemo, useCallback } from 'react'
import {
  IndianRupee, Search, ChevronDown, Calendar,
  Check, X, AlertCircle, Loader2, Eye,
  Printer, RefreshCw, Receipt, Clock,
  Banknote, Bus, Building2, Info,
  CheckCircle2, ArrowRight, ChevronRight
} from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  { id: '1', name: 'Nursery' }, { id: '2', name: 'LKG' }, { id: '3', name: 'UKG' },
  { id: '4', name: 'Class I' }, { id: '5', name: 'Class II' }, { id: '6', name: 'Class III' },
  { id: '7', name: 'Class IV' }, { id: '8', name: 'Class V' }, { id: '9', name: 'Class VI' },
  { id: '10', name: 'Class VII' }, { id: '11', name: 'Class VIII' }, { id: '12', name: 'Class IX' },
  { id: '13', name: 'Class X' }, { id: '14', name: 'Class XI' }, { id: '15', name: 'Class XII' },
]

const STUDENTS_DB = [
  { id: 'S001', admNo: '13-6114', name: 'ARYAN SHARMA',    classId: '13', class: 'Class X - A'  },
  { id: 'S002', admNo: '13-6218', name: 'PRIYA VERMA',     classId: '13', class: 'Class X - B'  },
  { id: 'S003', admNo: '13-6301', name: 'RAHUL GUPTA',     classId: '14', class: 'Class XI - A' },
  { id: 'S004', admNo: '13-6445', name: 'SNEHA PATEL',     classId: '12', class: 'Class IX - B' },
  { id: 'S005', admNo: '14-1001', name: 'VIKAS YADAV',     classId: '12', class: 'Class IX - A' },
  { id: 'S006', admNo: '14-1045', name: 'ANJALI SINGH',    classId: '14', class: 'Class XI - B' },
]

// Late fee rows per student (keyed by studentId + feeType)
const LATE_FEE_DATA = {
  'S001-regular': [
    { id: 1, uid: 'LF-001', Installment_no: 'April',     late_fee: 150,  receive_amount: 0,   balance: 150, deposit_amount: '' },
    { id: 2, uid: 'LF-002', Installment_no: 'May',       late_fee: 200,  receive_amount: 100, balance: 100, deposit_amount: '' },
    { id: 3, uid: 'LF-003', Installment_no: 'June',      late_fee: 0,    receive_amount: 0,   balance: 0,   deposit_amount: '' },
    { id: 4, uid: 'LF-004', Installment_no: 'July',      late_fee: 300,  receive_amount: 0,   balance: 300, deposit_amount: '' },
    { id: 5, uid: 'LF-005', Installment_no: 'August',    late_fee: 150,  receive_amount: 150, balance: 0,   deposit_amount: '' },
    { id: 6, uid: 'LF-006', Installment_no: 'September', late_fee: 200,  receive_amount: 0,   balance: 200, deposit_amount: '' },
  ],
  'S001-transport': [
    { id: 1, uid: 'TLF-001', Installment_no: 'April',   late_fee: 50,  receive_amount: 0,  balance: 50,  deposit_amount: '' },
    { id: 2, uid: 'TLF-002', Installment_no: 'May',     late_fee: 100, receive_amount: 50, balance: 50,  deposit_amount: '' },
    { id: 3, uid: 'TLF-003', Installment_no: 'June',    late_fee: 0,   receive_amount: 0,  balance: 0,   deposit_amount: '' },
  ],
  'S001-hostel': [
    { id: 1, uid: 'HLF-001', Installment_no: 'Quarter 1', late_fee: 500, receive_amount: 0,   balance: 500, deposit_amount: '' },
    { id: 2, uid: 'HLF-002', Installment_no: 'Quarter 2', late_fee: 250, receive_amount: 250, balance: 0,   deposit_amount: '' },
  ],
  'S002-regular': [
    { id: 1, uid: 'LF-101', Installment_no: 'April',     late_fee: 200, receive_amount: 0,   balance: 200, deposit_amount: '' },
    { id: 2, uid: 'LF-102', Installment_no: 'May',       late_fee: 200, receive_amount: 200, balance: 0,   deposit_amount: '' },
    { id: 3, uid: 'LF-103', Installment_no: 'June',      late_fee: 300, receive_amount: 0,   balance: 300, deposit_amount: '' },
  ],
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, className = '', disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-xl border outline-none transition-all
          bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Input({ value, onChange, placeholder, disabled, className = '', type = 'text', error }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 text-[13px] rounded-xl border outline-none transition-all
        bg-white text-slate-800 border-slate-200 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
        dark:placeholder-slate-600 dark:focus:border-indigo-400
        disabled:bg-slate-50 dark:disabled:bg-[#191c2a] disabled:text-slate-400 disabled:cursor-not-allowed
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : ''}
        ${className}`}
    />
  )
}

function FieldLabel({ children, required }) {
  return (
    <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
      {children}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </p>
  )
}

function RadioPill({ id, name, checked, onChange, label, icon: Icon, color = 'blue' }) {
  const colors = {
    blue:   checked ? 'bg-blue-600 border-blue-600 text-white dark:bg-indigo-600 dark:border-indigo-600' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-slate-500 dark:text-slate-400 hover:border-blue-300 hover:text-blue-600',
    amber:  checked ? 'bg-amber-500 border-amber-500 text-white' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-slate-500 dark:text-slate-400 hover:border-amber-300 hover:text-amber-600',
    violet: checked ? 'bg-violet-600 border-violet-600 text-white' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-slate-500 dark:text-slate-400 hover:border-violet-300 hover:text-violet-600',
  }
  return (
    <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all select-none font-semibold text-[13px] ${colors[color]}`}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="hidden" />
      {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
      {label}
      {checked && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" strokeWidth={3} />}
    </label>
  )
}

function Toast({ message, type = 'success', onClose }) {
  const bg = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw] ${bg} text-white`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  )
}

// ─── RECEIPT MODAL ────────────────────────────────────────────────────────────

function ReceiptModal({ receipt, onClose }) {
  if (!receipt) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ animation: 'fadeIn .2s ease' }}
      >
        <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>
        <div className="w-full max-w-sm bg-white dark:bg-[#1a1f35] rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-4 text-white">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                <span className="text-[15px] font-black">Payment Receipt</span>
              </div>
              <button onClick={onClose} className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-emerald-100 text-[12px]">Late fee deposited successfully</p>
          </div>

          {/* Body */}
          <div className="p-5 space-y-3">
            {/* Success icon */}
            <div className="flex justify-center py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-500" />
              </div>
            </div>

            {/* Receipt rows */}
            <div className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.15)] overflow-hidden">
              {[
                { label: 'Student',         value: receipt.studentName },
                { label: 'Adm No.',         value: receipt.admNo },
                { label: 'Installment',     value: receipt.installment },
                { label: 'Late Fee',        value: `₹${receipt.lateFee}` },
                { label: 'Amount Paid',     value: `₹${receipt.amount}`, highlight: true },
                { label: 'Date',            value: receipt.date },
                { label: 'Fee Type',        value: receipt.feeType },
              ].map(({ label, value, highlight }, i) => (
                <div key={i} className={`flex items-center justify-between px-4 py-2.5 border-b last:border-b-0 border-slate-100 dark:border-[rgba(99,102,241,0.08)]
                  ${i % 2 === 0 ? 'bg-slate-50/50 dark:bg-white/[0.02]' : ''}`}>
                  <span className="text-[12px] text-slate-500 dark:text-slate-400">{label}</span>
                  <span className={`text-[13px] font-semibold ${highlight ? 'text-emerald-600 dark:text-emerald-400 text-[15px] font-black' : 'text-slate-800 dark:text-slate-100'}`}>{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-2 px-5 pb-5">
            <button
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[13px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => { alert('Print triggered'); onClose() }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors shadow-md shadow-blue-500/20"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function DepositLateFees() {
  // ── filter state ─────────────────────────────────────────────────────────
  const [feeType,    setFeeType]    = useState('regular')   // regular | transport | hostel
  const [printRec,   setPrintRec]   = useState(true)
  const [session,    setSession]    = useState('')
  const [admNo,      setAdmNo]      = useState('')
  const [classId,    setClassId]    = useState('')
  const [studentId,  setStudentId]  = useState('')
  const [date,       setDate]       = useState('')
  const [errors,     setErrors]     = useState({})

  // ── data state ────────────────────────────────────────────────────────────
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [shown,      setShown]      = useState(false)
  const [receipt,    setReceipt]    = useState(null)
  const [toast,      setToast]      = useState(null)
  const [depositing, setDepositing] = useState(null) // row id being deposited

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── filtered student list ─────────────────────────────────────────────────
  const students = useMemo(() =>
    classId ? STUDENTS_DB.filter(s => s.classId === classId) : STUDENTS_DB
  , [classId])

  // ── auto-fill admNo when student selected ────────────────────────────────
  const handleStudentChange = (e) => {
    const sid = e.target.value
    setStudentId(sid)
    const s = STUDENTS_DB.find(x => x.id === sid)
    if (s) setAdmNo(s.admNo)
  }

  // ── auto-fill student when admNo entered ─────────────────────────────────
  const handleAdmNoChange = (e) => {
    const v = e.target.value
    setAdmNo(v)
    const s = STUDENTS_DB.find(x => x.admNo.toLowerCase() === v.toLowerCase())
    if (s) { setStudentId(s.id); setClassId(s.classId) }
  }

  // ── validate & show ───────────────────────────────────────────────────────
  const handleShow = () => {
    const err = {}
    if (!classId)   err.classId   = 'Required'
    if (!studentId) err.studentId = 'Required'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const key = `${studentId}-${feeType}`
      const data = LATE_FEE_DATA[key] || []
      setRows(data.map(r => ({ ...r }))) // fresh copy
      setShown(true)
      setLoading(false)
      if (data.length === 0) showToast('No late fee records found.', 'error')
    }, 700)
  }

  const handleReset = () => {
    setFeeType('regular'); setSession(''); setAdmNo(''); setClassId('')
    setStudentId(''); setDate(''); setRows([]); setShown(false); setErrors({})
  }

  // ── update deposit amount in row ─────────────────────────────────────────
  const updateAmt = (id, val) => {
    setRows(r => r.map(x => x.id === id ? { ...x, deposit_amount: val } : x))
  }

  // ── deposit single row ────────────────────────────────────────────────────
  const handleDeposit = (row) => {
    const amt = parseFloat(row.deposit_amount)
    if (!amt || amt <= 0) { showToast('Enter deposit amount.', 'error'); return }
    if (amt > row.balance) { showToast(`Amount exceeds balance ₹${row.balance}.`, 'error'); return }
    if (!date)             { showToast('Please select a date.', 'error'); return }

    setDepositing(row.id)
    setTimeout(() => {
      const student = STUDENTS_DB.find(s => s.id === studentId)
      // Update row
      setRows(r => r.map(x => {
        if (x.id !== row.id) return x
        const newRec = (x.receive_amount || 0) + amt
        const newBal = x.late_fee - newRec
        return { ...x, receive_amount: newRec, balance: Math.max(0, newBal), deposit_amount: '' }
      }))
      setDepositing(null)
      // Show receipt
      const rec = {
        studentName:  student?.name || '',
        admNo:        student?.admNo || '',
        installment:  row.Installment_no,
        lateFee:      row.late_fee,
        amount:       amt,
        date:         date || new Date().toLocaleDateString('en-IN'),
        feeType:      feeType.charAt(0).toUpperCase() + feeType.slice(1),
      }
      if (printRec) setReceipt(rec)
      else showToast(`₹${amt} deposited for ${row.Installment_no}!`)
    }, 600)
  }

  // ── stats ─────────────────────────────────────────────────────────────────
  const totalLate    = rows.reduce((s, r) => s + (r.late_fee || 0), 0)
  const totalPaid    = rows.reduce((s, r) => s + (r.receive_amount || 0), 0)
  const totalBalance = rows.reduce((s, r) => s + (r.balance || 0), 0)
  const pendingCount = rows.filter(r => r.balance > 0).length

  const feeTypeConfig = {
    regular:   { label: 'Regular Fee',   color: 'blue',   icon: IndianRupee },
    transport: { label: 'Transport Fee', color: 'amber',  icon: Bus         },
    hostel:    { label: 'Hostel Fee',    color: 'violet', icon: Building2   },
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117]">

      {/* ── PAGE HEADER ── */}
      <div className="sticky top-0 z-30 bg-white dark:bg-[#13172a] border-b border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
            <Clock className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-[15px] font-black text-slate-800 dark:text-slate-100 leading-tight">
              Deposit Late Fees
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 hidden sm:block">
              Collect overdue installment late charges
            </p>
          </div>
          {shown && totalBalance > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 flex-shrink-0">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <span className="text-[12px] font-bold text-rose-600 dark:text-rose-400">
                {pendingCount} due · ₹{totalBalance.toLocaleString('en-IN')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-3 sm:p-5 space-y-4">

        {/* ── FILTER CARD ── */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-amber-500 flex-shrink-0" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Search Filters</span>
          </div>

          <div className="p-4 sm:p-5 space-y-4">

            {/* ── Fee Type radios ── */}
            <div>
              <FieldLabel>Fee Type</FieldLabel>
              <div className="flex flex-wrap gap-2">
                <RadioPill
                  name="feeType" checked={feeType === 'regular'}
                  onChange={() => { setFeeType('regular'); setShown(false) }}
                  label="Regular" icon={IndianRupee} color="blue"
                />
                <RadioPill
                  name="feeType" checked={feeType === 'transport'}
                  onChange={() => { setFeeType('transport'); setShown(false) }}
                  label="Transport" icon={Bus} color="amber"
                />
                <RadioPill
                  name="feeType" checked={feeType === 'hostel'}
                  onChange={() => { setFeeType('hostel'); setShown(false) }}
                  label="Hostel" icon={Building2} color="violet"
                />

                {/* Print receipt toggle — inline on desktop, same row */}
                <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 cursor-pointer transition-all select-none font-semibold text-[13px] ml-auto
                  ${printRec
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                    : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-slate-500 dark:text-slate-400'}`}>
                  <span
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                      ${printRec ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600'}`}
                    onClick={() => setPrintRec(p => !p)}
                  >
                    {printRec && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <Printer className="w-4 h-4" />
                  Print Receipt
                </label>
              </div>
            </div>

            {/* ── Main fields grid ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

              {/* Session */}
              <div>
                <FieldLabel>Session</FieldLabel>
                <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Session --">
                  {SESSIONS.map(s => <option key={s}>{s}</option>)}
                </NativeSelect>
              </div>

              {/* Adm No */}
              <div>
                <FieldLabel>Adm No.</FieldLabel>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <Input
                    value={admNo}
                    onChange={handleAdmNoChange}
                    placeholder="e.g. 13-6114"
                    className="pl-8"
                  />
                </div>
              </div>

              {/* Class */}
              <div>
                <FieldLabel required>Class</FieldLabel>
                <NativeSelect
                  value={classId}
                  onChange={e => { setClassId(e.target.value); setStudentId(''); setErrors(p => ({ ...p, classId: undefined })) }}
                  placeholder="-- Select Class --"
                  error={errors.classId}
                >
                  {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </NativeSelect>
                {errors.classId && <p className="text-[11px] text-rose-500 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.classId}</p>}
              </div>

              {/* Student */}
              <div>
                <FieldLabel required>Student Name</FieldLabel>
                <NativeSelect
                  value={studentId}
                  onChange={e => { handleStudentChange(e); setErrors(p => ({ ...p, studentId: undefined })) }}
                  placeholder="-- Select Student --"
                  error={errors.studentId}
                >
                  {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.admNo})</option>)}
                </NativeSelect>
                {errors.studentId && <p className="text-[11px] text-rose-500 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.studentId}</p>}
              </div>

              {/* Date */}
              <div>
                <FieldLabel>Date</FieldLabel>
                <div className="relative">
                  <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="pl-8" />
                </div>
              </div>

            </div>

            {/* ── Buttons ── */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 sm:flex-none sm:w-36 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                {loading ? 'Loading…' : 'Show'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-600 hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>

          </div>
        </div>

        {/* ── LOADING SKELETON ── */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-5 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {/* ── RESULTS ── */}
        {shown && !loading && rows.length > 0 && (
          <>
            {/* ── Summary pills ── */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Late Fee', value: totalLate,    colorCls: 'from-slate-600 to-slate-500' },
                { label: 'Amount Paid',    value: totalPaid,    colorCls: 'from-emerald-600 to-emerald-500' },
                { label: 'Balance Due',    value: totalBalance, colorCls: totalBalance > 0 ? 'from-rose-600 to-rose-500' : 'from-slate-500 to-slate-400' },
              ].map(({ label, value, colorCls }, i) => (
                <div key={i} className="rounded-2xl border border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm">
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1">{label}</p>
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-gradient-to-br ${colorCls} text-white text-[14px] font-black tabular-nums shadow-sm`}>
                    <IndianRupee className="w-3 h-3 opacity-80" />
                    {value.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>

            {/* ── Late Fee Grid ── */}
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

              {/* Card header */}
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2.5">
                  <span className="w-1 h-5 rounded-full bg-amber-500 flex-shrink-0" />
                  <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div>
                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 leading-tight">
                      Late Fee Installments
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      {feeTypeConfig[feeType].label} · {rows.length} records
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold
                    ${feeType === 'regular'   ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300' :
                      feeType === 'transport' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' :
                                                'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300'}`}>
                    {feeType === 'regular'   && <IndianRupee className="w-3 h-3" />}
                    {feeType === 'transport' && <Bus className="w-3 h-3" />}
                    {feeType === 'hostel'    && <Building2 className="w-3 h-3" />}
                    {feeTypeConfig[feeType].label}
                  </span>
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/40 dark:bg-white/[0.02]">
                    <tr>
                      {[
                        { label: 'Installment', align: 'left'   },
                        { label: 'Late Fee',    align: 'right'  },
                        { label: 'Rec. Amount', align: 'right'  },
                        { label: 'Balance',     align: 'right'  },
                        { label: 'Deposit Amt', align: 'center' },
                        { label: 'Action',      align: 'center' },
                      ].map((h, i) => (
                        <th key={i} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap text-${h.align}`}>
                          {h.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => {
                      const isPaid    = row.balance <= 0
                      const isActive  = depositing === row.id
                      return (
                        <tr
                          key={row.id}
                          className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] transition-colors
                            ${isPaid ? 'opacity-50' : 'hover:bg-slate-50/50 dark:hover:bg-white/[0.015]'}
                            ${idx % 2 !== 0 ? 'bg-slate-50/30 dark:bg-white/[0.01]' : ''}`}
                        >
                          {/* Installment */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {isPaid
                                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                                : <Clock className="w-4 h-4 text-amber-500 flex-shrink-0" />
                              }
                              <span className={`text-[13px] font-semibold ${isPaid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200'}`}>
                                {row.Installment_no}
                              </span>
                              {isPaid && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300 font-bold">Paid</span>}
                            </div>
                          </td>

                          {/* Late Fee */}
                          <td className="px-4 py-3 text-right">
                            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                              {row.late_fee.toLocaleString('en-IN')}
                            </span>
                          </td>

                          {/* Received */}
                          <td className="px-4 py-3 text-right">
                            <span className={`text-[13px] font-semibold tabular-nums ${row.receive_amount > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                              {row.receive_amount > 0 ? row.receive_amount.toLocaleString('en-IN') : '—'}
                            </span>
                          </td>

                          {/* Balance */}
                          <td className="px-4 py-3 text-right">
                            <span className={`text-[14px] font-black tabular-nums ${isPaid ? 'text-emerald-500' : 'text-rose-600 dark:text-rose-400'}`}>
                              {isPaid ? '0' : row.balance.toLocaleString('en-IN')}
                            </span>
                          </td>

                          {/* Deposit input */}
                          <td className="px-4 py-3 text-center">
                            {!isPaid ? (
                              <div className="flex items-center gap-1 max-w-[120px] mx-auto">
                                <span className="text-[12px] text-slate-400 flex-shrink-0">₹</span>
                                <input
                                  type="number"
                                  min="0"
                                  max={row.balance}
                                  value={row.deposit_amount}
                                  onChange={e => updateAmt(row.id, e.target.value)}
                                  placeholder={String(row.balance)}
                                  className="w-full px-2 py-1.5 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none
                                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 text-right tabular-nums
                                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
                                />
                              </div>
                            ) : (
                              <span className="text-[12px] text-slate-300 dark:text-slate-600">—</span>
                            )}
                          </td>

                          {/* Deposit button */}
                          <td className="px-4 py-3 text-center">
                            {!isPaid ? (
                              <button
                                type="button"
                                disabled={isActive}
                                onClick={() => handleDeposit(row)}
                                className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-[12px] font-semibold text-white
                                  bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20
                                  disabled:opacity-60 transition-all active:scale-95"
                              >
                                {isActive ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
                                {isActive ? 'Saving…' : 'Deposit'}
                              </button>
                            ) : (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto" />
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden p-3 space-y-3">
                {rows.map(row => {
                  const isPaid   = row.balance <= 0
                  const isActive = depositing === row.id
                  return (
                    <div
                      key={row.id}
                      className={`rounded-xl border-2 overflow-hidden transition-all
                        ${isPaid
                          ? 'border-emerald-200 dark:border-emerald-500/20 opacity-70'
                          : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238]'}`}
                    >
                      {/* Card top */}
                      <div className={`flex items-center justify-between px-4 py-3 ${isPaid ? 'bg-emerald-50 dark:bg-emerald-500/8' : 'bg-white dark:bg-[#1e2238]'}`}>
                        <div className="flex items-center gap-2">
                          {isPaid
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                            : <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                          }
                          <div>
                            <p className={`text-[14px] font-bold ${isPaid ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-100'}`}>
                              {row.Installment_no}
                            </p>
                            {isPaid && <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Fully Paid</span>}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-[18px] font-black tabular-nums leading-tight ${isPaid ? 'text-emerald-500' : 'text-rose-600 dark:text-rose-400'}`}>
                            {isPaid ? '₹0' : `₹${row.balance.toLocaleString('en-IN')}`}
                          </p>
                          <p className="text-[10px] text-slate-400">{isPaid ? 'balance' : 'due'}</p>
                        </div>
                      </div>

                      {/* Stats row */}
                      <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-[rgba(99,102,241,0.1)] border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                        {[
                          { label: 'Late Fee', value: row.late_fee,         color: 'text-slate-700 dark:text-slate-200' },
                          { label: 'Received', value: row.receive_amount,   color: 'text-emerald-600 dark:text-emerald-400' },
                          { label: 'Balance',  value: row.balance,          color: isPaid ? 'text-emerald-500' : 'text-rose-600 dark:text-rose-400' },
                        ].map(({ label, value, color }, i) => (
                          <div key={i} className="px-3 py-2 text-center bg-slate-50/50 dark:bg-white/[0.02]">
                            <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">{label}</p>
                            <p className={`text-[13px] font-bold tabular-nums ${color}`}>{value.toLocaleString('en-IN')}</p>
                          </div>
                        ))}
                      </div>

                      {/* Deposit section */}
                      {!isPaid && (
                        <div className="px-4 py-3 bg-white dark:bg-[#1e2238] border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex items-center gap-2">
                          <div className="flex-1 relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] text-slate-400 font-semibold pointer-events-none">₹</span>
                            <input
                              type="number"
                              min="0"
                              max={row.balance}
                              value={row.deposit_amount}
                              onChange={e => updateAmt(row.id, e.target.value)}
                              placeholder={`Max ${row.balance}`}
                              className="w-full pl-7 pr-3 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none
                                bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 tabular-nums
                                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={isActive}
                            onClick={() => handleDeposit(row)}
                            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                              bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                              disabled:opacity-60 transition-all active:scale-95 whitespace-nowrap"
                          >
                            {isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                            {isActive ? 'Saving…' : 'Deposit'}
                          </button>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/40 dark:bg-white/[0.015]">
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="text-[12px] text-slate-400 dark:text-slate-500">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{rows.filter(r => r.balance <= 0).length}</span> paid ·{' '}
                    <span className="font-semibold text-rose-600">{pendingCount}</span> pending
                  </p>
                  {!date && shown && (
                    <p className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" /> Set a date before depositing
                    </p>
                  )}
                </div>
                {totalBalance === 0 && rows.length > 0 && (
                  <div className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="w-4 h-4" /> All late fees cleared!
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* ── EMPTY STATE (after show, no data) ── */}
        {shown && !loading && rows.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] text-slate-400 dark:text-slate-600">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-emerald-400 opacity-60" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-bold text-slate-500 dark:text-slate-400">No late fee records</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
                No pending late fees found for this student and fee type.
              </p>
            </div>
          </div>
        )}

        {/* ── INITIAL EMPTY STATE ── */}
        {!shown && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] text-slate-400 dark:text-slate-600">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Clock className="w-7 h-7 opacity-40" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-bold text-slate-500 dark:text-slate-400">No data yet</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
                Select class &amp; student, then click <strong>Show</strong> to load late fees.
              </p>
            </div>
          </div>
        )}

      </div>

      {/* Receipt Modal */}
      {receipt && <ReceiptModal receipt={receipt} onClose={() => setReceipt(null)} />}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
