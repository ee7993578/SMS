/**
 * FeeNotice.jsx
 * Complete responsive Fee Notice page — React + Tailwind
 * Converts legacy ASPX Fee_notice page to modern mobile-first React UI
 *
 * Features:
 *  - Fee Type: Regular / Transport / Hostel (radio tabs)
 *  - Session, Class, Installment, Student dropdowns
 *  - Student search with autocomplete card
 *  - Date, Due Amount, Due Date, Order By fields
 *  - Email Subject input
 *  - Late Fee checkbox
 *  - Show Report & Send Email actions
 *  - Desktop: dense ERP grid layout
 *  - Mobile: stacked card layout with drawer filters
 *  - Report preview table with print-ready design
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, X, ChevronDown, Filter, RefreshCw, Eye,
  Mail, Printer, FileSpreadsheet, AlertCircle, Check,
  Loader2, SlidersHorizontal, ChevronRight, ChevronUp,
  Bus, Home, BookOpen, Calendar, IndianRupee, Clock,
  User, Users, ArrowUpDown, Bell, Download, MoreVertical,
  TrendingUp, Building2, MapPin, Phone, ReceiptText,
  CheckCircle2, XCircle, AlertTriangle, Info, Banknote,
  ArrowDownUp, ChevronsUpDown, Hash
} from 'lucide-react'

// ─── STATIC DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
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

const INSTALLMENTS = {
  Regular: [
    { id: '1', name: 'April - June (Q1)' },
    { id: '2', name: 'July - September (Q2)' },
    { id: '3', name: 'October - December (Q3)' },
    { id: '4', name: 'January - March (Q4)' },
    { id: '5', name: 'Annual' },
  ],
  Transport: [
    { id: 'T1', name: 'Transport April' },
    { id: 'T2', name: 'Transport May' },
    { id: 'T3', name: 'Transport June' },
    { id: 'T4', name: 'Transport Quarterly' },
  ],
  Hostel: [
    { id: 'H1', name: 'Hostel Term 1' },
    { id: 'H2', name: 'Hostel Term 2' },
    { id: 'H3', name: 'Hostel Annual' },
  ],
}

const STUDENTS = [
  { id: 'S001', admNo: 'ADM001', name: 'Aarav Sharma', father: 'Rajesh Sharma', class: 'Class IX - A', phone: '9876543210', photo: null },
  { id: 'S002', admNo: 'ADM002', name: 'Priya Singh', father: 'Vikram Singh', class: 'Class IX - B', phone: '9876543211', photo: null },
  { id: 'S003', admNo: 'ADM003', name: 'Rohit Kumar', father: 'Suresh Kumar', class: 'Class X - A', phone: '9876543212', photo: null },
  { id: 'S004', admNo: 'ADM004', name: 'Ananya Gupta', father: 'Amit Gupta', class: 'Class VIII - A', phone: '9876543213', photo: null },
  { id: 'S005', admNo: 'ADM005', name: 'Karan Verma', father: 'Dinesh Verma', class: 'Class XI - A', phone: '9876543214', photo: null },
  { id: 'S006', admNo: 'ADM006', name: 'Sneha Patel', father: 'Hemant Patel', class: 'Class VII - A', phone: '9876543215', photo: null },
  { id: 'S007', admNo: 'ADM007', name: 'Arjun Mishra', father: 'Manoj Mishra', class: 'Class XII - A', phone: '9876543216', photo: null },
]

// Dummy fee notice data for report preview
const generateFeeData = (feeType, classId, installmentId, session, dueAmount, orderBy) => {
  const baseData = [
    { sno: 1, admNo: 'ADM001', name: 'Aarav Sharma', class: 'IX-A', fatherName: 'Rajesh Sharma', phone: '9876543210', totalFee: 12500, paid: 8000, balance: 4500, lateFee: 250, dueDate: '30 Apr 2025' },
    { sno: 2, admNo: 'ADM002', name: 'Priya Singh', class: 'IX-B', fatherName: 'Vikram Singh', phone: '9876543211', totalFee: 12500, paid: 12500, balance: 0, lateFee: 0, dueDate: '30 Apr 2025' },
    { sno: 3, admNo: 'ADM003', name: 'Rohit Kumar', class: 'X-A', fatherName: 'Suresh Kumar', phone: '9876543212', totalFee: 15000, paid: 5000, balance: 10000, lateFee: 500, dueDate: '30 Apr 2025' },
    { sno: 4, admNo: 'ADM004', name: 'Ananya Gupta', class: 'VIII-A', fatherName: 'Amit Gupta', phone: '9876543213', totalFee: 11000, paid: 11000, balance: 0, lateFee: 0, dueDate: '30 Apr 2025' },
    { sno: 5, admNo: 'ADM005', name: 'Karan Verma', class: 'XI-A', fatherName: 'Dinesh Verma', phone: '9876543214', totalFee: 18000, paid: 10000, balance: 8000, lateFee: 400, dueDate: '30 Apr 2025' },
    { sno: 6, admNo: 'ADM006', name: 'Sneha Patel', class: 'VII-A', fatherName: 'Hemant Patel', phone: '9876543215', totalFee: 10500, paid: 3000, balance: 7500, lateFee: 375, dueDate: '30 Apr 2025' },
    { sno: 7, admNo: 'ADM007', name: 'Arjun Mishra', class: 'XII-A', fatherName: 'Manoj Mishra', phone: '9876543216', totalFee: 20000, paid: 20000, balance: 0, lateFee: 0, dueDate: '30 Apr 2025' },
    { sno: 8, admNo: 'ADM008', name: 'Divya Joshi', class: 'VI-A', fatherName: 'Prakash Joshi', phone: '9876543217', totalFee: 9500, paid: 2000, balance: 7500, lateFee: 375, dueDate: '30 Apr 2025' },
    { sno: 9, admNo: 'ADM009', name: 'Rahul Yadav', class: 'X-A', fatherName: 'Santosh Yadav', phone: '9876543218', totalFee: 15000, paid: 15000, balance: 0, lateFee: 0, dueDate: '30 Apr 2025' },
    { sno: 10, admNo: 'ADM010', name: 'Pooja Tiwari', class: 'IX-A', fatherName: 'Ramesh Tiwari', phone: '9876543219', totalFee: 12500, paid: 7000, balance: 5500, lateFee: 275, dueDate: '30 Apr 2025' },
  ]

  let filtered = baseData.filter(r => r.balance >= (parseInt(dueAmount) || 0))

  if (orderBy === 'balance asc') filtered.sort((a, b) => a.balance - b.balance)
  else if (orderBy === 'balance desc') filtered.sort((a, b) => b.balance - a.balance)
  else filtered.sort((a, b) => a.name.localeCompare(b.name))

  return filtered.map((r, i) => ({ ...r, sno: i + 1 }))
}

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Sr. Sec. School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  phone: '0135-2655321',
}

// ─── HELPER COMPONENTS ───────────────────────────────────────────────────────

function Pill({ children, color = 'slate' }) {
  const map = {
    green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    red: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${map[color]}`}>
      {children}
    </span>
  )
}

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
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
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 hover:border-slate-300'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronsUpDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
        {Icon && <Icon className="w-3 h-3" />}
        {label}{required && <span className="text-rose-500">*</span>}
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

function TextInput({ value, onChange, placeholder, error, type = 'text', disabled, onKeyPress, readOnly }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      readOnly={readOnly}
      onKeyPress={onKeyPress}
      className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all font-medium
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        disabled:opacity-50 read-only:bg-slate-50
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 hover:border-slate-300'}`}
    />
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
      rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
      ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : type === 'error' ? <XCircle className="w-4 h-4 flex-shrink-0" />
        : <Info className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── FEE TYPE TAB ────────────────────────────────────────────────────────────
function FeeTypeTabs({ value, onChange }) {
  const types = [
    { id: 'Regular', icon: BookOpen, label: 'Regular', color: 'blue' },
    { id: 'Transport', icon: Bus, label: 'Transport', color: 'amber' },
    { id: 'Hostel', icon: Home, label: 'Hostel', color: 'violet' },
  ]
  const colorMap = {
    blue: 'bg-blue-600 text-white shadow-md shadow-blue-500/30',
    amber: 'bg-amber-500 text-white shadow-md shadow-amber-500/30',
    violet: 'bg-violet-600 text-white shadow-md shadow-violet-500/30',
  }
  const activeType = types.find(t => t.id === value)

  return (
    <div className="flex gap-1.5 p-1 bg-slate-100 rounded-2xl">
      {types.map(({ id, icon: Icon, label, color }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12.5px] font-bold transition-all duration-200
            ${value === id ? colorMap[color] : 'text-slate-500 hover:text-slate-700 hover:bg-white/60'}`}
        >
          <Icon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{label.slice(0, 3)}</span>
        </button>
      ))}
    </div>
  )
}

// ─── STUDENT SEARCH AUTOCOMPLETE ─────────────────────────────────────────────
function StudentSearch({ value, onChange, onSelect, selectedStudent }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return []
    const q = query.toLowerCase()
    return STUDENTS.filter(s =>
      s.admNo.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.father.toLowerCase().includes(q)
    ).slice(0, 5)
  }, [query])

  useEffect(() => {
    const handleClick = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSelect = (student) => {
    setQuery(student.admNo)
    setOpen(false)
    onSelect(student)
  }

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => query && setOpen(true)}
          placeholder="Search by Adm No / Name…"
          className="w-full pl-9 pr-8 py-2.5 text-[13px] rounded-xl border border-slate-200 hover:border-slate-300 outline-none
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100 font-medium bg-white text-slate-800 placeholder-slate-300 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(''); onSelect(null) }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
          {filtered.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelect(s)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
                {initials(s.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-slate-800 truncate">{s.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{s.admNo} · {s.class}</p>
                <p className="text-[11px] text-slate-400 truncate">Father: {s.father} · {s.phone}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-blue-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}

      {/* Selected student badge */}
      {selectedStudent && (
        <div className="mt-2 flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50 border border-blue-100">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {initials(selectedStudent.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-bold text-blue-800 truncate">{selectedStudent.name}</p>
            <p className="text-[11px] text-blue-500 truncate">{selectedStudent.admNo} · {selectedStudent.class}</p>
          </div>
          <button onClick={() => { setQuery(''); onSelect(null) }} className="text-blue-400 hover:text-blue-600 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── SUMMARY STATS BAR ───────────────────────────────────────────────────────
function SummaryStats({ data, lateFee }) {
  const totalFee = data.reduce((s, r) => s + r.totalFee, 0)
  const totalPaid = data.reduce((s, r) => s + r.paid, 0)
  const totalBalance = data.reduce((s, r) => s + r.balance, 0)
  const totalLate = lateFee ? data.reduce((s, r) => s + r.lateFee, 0) : 0
  const pendingCount = data.filter(r => r.balance > 0).length

  const fmt = (n) => '₹' + n.toLocaleString('en-IN')

  const stats = [
    { label: 'Total Billed', value: fmt(totalFee), icon: ReceiptText, color: 'blue' },
    { label: 'Amount Paid', value: fmt(totalPaid), icon: CheckCircle2, color: 'green' },
    { label: 'Pending Balance', value: fmt(totalBalance), icon: AlertTriangle, color: 'red' },
    { label: 'Late Fee', value: fmt(totalLate), icon: Clock, color: 'amber' },
    { label: 'Due Students', value: pendingCount, icon: Users, color: 'violet' },
  ]
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    green: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    red: 'text-rose-600 bg-rose-50 border-rose-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
    violet: 'text-violet-600 bg-violet-50 border-violet-100',
  }
  const valMap = {
    blue: 'text-blue-700',
    green: 'text-emerald-700',
    red: 'text-rose-700',
    amber: 'text-amber-700',
    violet: 'text-violet-700',
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div key={label} className={`flex items-center gap-2.5 rounded-2xl border p-3.5 bg-white shadow-sm ${colorMap[color].split(' ').slice(1).join(' ')}`}>
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${colorMap[color]}`}>
            <Icon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className={`text-[17px] font-extrabold tabular-nums leading-tight ${valMap[color]}`}>{value}</p>
            <p className="text-[10.5px] text-slate-500 font-medium truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── DESKTOP REPORT TABLE ────────────────────────────────────────────────────
function DesktopReportTable({ data, lateFee }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="bg-slate-50 border-b-2 border-slate-200">
            {['#', 'Adm No', 'Student Name', 'Class', "Father's Name", 'Phone', 'Total Fee', 'Paid', 'Balance', ...(lateFee ? ['Late Fee'] : []), 'Due Date', 'Status'].map((h, i) => (
              <th key={i} className="px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap first:pl-5">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const isPaid = row.balance === 0
            const isHighDue = row.balance > 5000
            return (
              <tr key={row.admNo} className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors
                ${i % 2 === 0 ? '' : 'bg-slate-50/40'}`}>
                <td className="pl-5 pr-3 py-3 text-[12px] text-slate-400 tabular-nums">{row.sno}</td>
                <td className="px-4 py-3">
                  <span className="text-[12px] font-bold text-blue-700 font-mono">{row.admNo}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                      {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-[13px] font-semibold text-slate-800 whitespace-nowrap">{row.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[12px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg">{row.class}</span>
                </td>
                <td className="px-4 py-3 text-[12px] text-slate-600">{row.fatherName}</td>
                <td className="px-4 py-3 text-[12px] text-slate-500 font-mono">{row.phone}</td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[13px] font-semibold text-slate-700 tabular-nums">₹{row.totalFee.toLocaleString('en-IN')}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className="text-[13px] font-semibold text-emerald-700 tabular-nums">₹{row.paid.toLocaleString('en-IN')}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[13px] font-bold tabular-nums ${isPaid ? 'text-emerald-600' : isHighDue ? 'text-rose-600' : 'text-amber-600'}`}>
                    {isPaid ? '—' : `₹${row.balance.toLocaleString('en-IN')}`}
                  </span>
                </td>
                {lateFee && (
                  <td className="px-4 py-3 text-right">
                    <span className="text-[12px] font-semibold text-orange-600 tabular-nums">
                      {row.lateFee > 0 ? `₹${row.lateFee.toLocaleString('en-IN')}` : '—'}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3 text-[12px] text-slate-500 whitespace-nowrap">{row.dueDate}</td>
                <td className="px-4 py-3">
                  {isPaid
                    ? <Pill color="green"><CheckCircle2 className="w-3 h-3 mr-0.5" />Paid</Pill>
                    : isHighDue
                      ? <Pill color="red"><AlertTriangle className="w-3 h-3 mr-0.5" />High Due</Pill>
                      : <Pill color="amber"><Clock className="w-3 h-3 mr-0.5" />Pending</Pill>
                  }
                </td>
              </tr>
            )
          })}
        </tbody>
        {/* Grand Total row */}
        <tfoot>
          <tr className="bg-blue-50 border-t-2 border-blue-200">
            <td colSpan={6} className="pl-5 py-3">
              <span className="text-[13px] font-extrabold text-blue-800 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4" /> Grand Total — {data.length} students
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              <span className="text-[13px] font-extrabold text-blue-800 tabular-nums">
                ₹{data.reduce((s, r) => s + r.totalFee, 0).toLocaleString('en-IN')}
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              <span className="text-[13px] font-extrabold text-emerald-700 tabular-nums">
                ₹{data.reduce((s, r) => s + r.paid, 0).toLocaleString('en-IN')}
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              <span className="text-[13px] font-extrabold text-rose-700 tabular-nums">
                ₹{data.reduce((s, r) => s + r.balance, 0).toLocaleString('en-IN')}
              </span>
            </td>
            {lateFee && (
              <td className="px-4 py-3 text-right">
                <span className="text-[13px] font-extrabold text-orange-700 tabular-nums">
                  ₹{data.reduce((s, r) => s + r.lateFee, 0).toLocaleString('en-IN')}
                </span>
              </td>
            )}
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── MOBILE STUDENT FEE CARD ─────────────────────────────────────────────────
function MobileStudentCard({ row, lateFee }) {
  const [open, setOpen] = useState(false)
  const isPaid = row.balance === 0
  const isHighDue = row.balance > 5000
  const paidPct = row.totalFee ? Math.round((row.paid / row.totalFee) * 100) : 0

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm transition-all
      ${isPaid ? 'border-emerald-200 bg-emerald-50/40' : isHighDue ? 'border-rose-200 bg-rose-50/20' : 'border-amber-200 bg-white'}`}>

      {/* Card Header */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0
          ${isPaid ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : isHighDue ? 'bg-gradient-to-br from-rose-400 to-rose-600' : 'bg-gradient-to-br from-amber-400 to-amber-600'}`}>
          {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[13.5px] font-bold text-slate-800 truncate">{row.name}</p>
            <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md">{row.class}</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{row.admNo}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {isPaid
            ? <Pill color="green">Paid</Pill>
            : isHighDue
              ? <Pill color="red">High Due</Pill>
              : <Pill color="amber">Pending</Pill>
          }
          {!isPaid && (
            <span className="text-[13px] font-extrabold text-rose-700 tabular-nums">
              ₹{row.balance.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 ml-1 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="flex text-[10px] font-bold justify-between mb-1.5">
          <span className="text-emerald-600">Paid {paidPct}%</span>
          <span className="text-slate-400">Due {100 - paidPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${isPaid ? 'bg-emerald-500' : isHighDue ? 'bg-rose-500' : 'bg-amber-500'}`}
            style={{ width: `${paidPct}%` }}
          />
        </div>
      </div>

      {/* Expandable Details */}
      {open && (
        <div className="border-t border-slate-100 px-4 pt-3 pb-4">
          {/* Fee breakdown */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-center">
              <p className="text-[16px] font-extrabold text-blue-700 tabular-nums">₹{row.totalFee.toLocaleString('en-IN')}</p>
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-blue-500 mt-0.5">Total Fee</p>
            </div>
            <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-center">
              <p className="text-[16px] font-extrabold text-emerald-700 tabular-nums">₹{row.paid.toLocaleString('en-IN')}</p>
              <p className="text-[9.5px] font-bold uppercase tracking-wide text-emerald-500 mt-0.5">Paid</p>
            </div>
            <div className={`rounded-xl border p-2.5 text-center ${isPaid ? 'bg-slate-50 border-slate-100' : 'bg-rose-50 border-rose-100'}`}>
              <p className={`text-[16px] font-extrabold tabular-nums ${isPaid ? 'text-slate-400' : 'text-rose-700'}`}>
                {isPaid ? '—' : `₹${row.balance.toLocaleString('en-IN')}`}
              </p>
              <p className={`text-[9.5px] font-bold uppercase tracking-wide mt-0.5 ${isPaid ? 'text-slate-400' : 'text-rose-500'}`}>Balance</p>
            </div>
          </div>
          {lateFee && row.lateFee > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-orange-50 border border-orange-100 px-3 py-2 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-orange-500" />
                <span className="text-[12px] font-semibold text-orange-700">Late Fee Applicable</span>
              </div>
              <span className="text-[13px] font-extrabold text-orange-700">₹{row.lateFee.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <User className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Father: <strong className="text-slate-700">{row.fatherName}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <Phone className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="font-mono">{row.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Due Date: <strong className="text-slate-700">{row.dueDate}</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── REPORT PANEL ────────────────────────────────────────────────────────────
function ReportPanel({ data, session, feeType, lateFee, installmentName, className }) {
  const [search, setSearch] = useState('')
  const filtered = useMemo(() => {
    if (!search) return data
    const q = search.toLowerCase()
    return data.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.admNo.toLowerCase().includes(q) ||
      r.fatherName.toLowerCase().includes(q)
    )
  }, [data, search])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* School header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white px-5 py-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-0.5">
          <Building2 className="w-4 h-4 opacity-80" />
          <h2 className="text-[15px] font-extrabold tracking-tight">{SCHOOL_INFO.name}</h2>
        </div>
        <p className="text-[11px] text-blue-200 flex items-center justify-center gap-1">
          <MapPin className="w-3 h-3" />{SCHOOL_INFO.address}
        </p>
        <div className="flex items-center justify-center gap-3 mt-2 flex-wrap">
          <span className="text-[11px] bg-white/20 px-3 py-1 rounded-full font-bold">Session: {session}</span>
          <span className="text-[11px] bg-white/20 px-3 py-1 rounded-full font-bold">{feeType} Fee Notice</span>
          {installmentName && <span className="text-[11px] bg-white/20 px-3 py-1 rounded-full font-bold">{installmentName}</span>}
          {className && <span className="text-[11px] bg-white/20 px-3 py-1 rounded-full font-bold">{className}</span>}
        </div>
      </div>

      {/* Controls bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <ReceiptText className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-[13px] font-bold text-slate-700">Fee Notice Report</span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold flex-shrink-0">
            {filtered.length} students
          </span>
        </div>
        <div className="relative w-full sm:w-56 flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search student / adm no…"
            className="w-full pl-8 pr-7 py-2 text-[12px] rounded-xl border border-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white"
          />
          {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"><X className="w-3.5 h-3.5" /></button>}
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <DesktopReportTable data={filtered} lateFee={lateFee} />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-[13px]">No records found</p>
          </div>
        ) : filtered.map(row => (
          <MobileStudentCard key={row.admNo} row={row} lateFee={lateFee} />
        ))}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px] text-slate-400">
          Showing <span className="font-bold text-slate-600">{filtered.length}</span> of <span className="font-bold text-slate-600">{data.length}</span> records
        </p>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 hover:underline">
            <Printer className="w-3.5 h-3.5" />Print
          </button>
          <span className="text-slate-200">|</span>
          <button className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 hover:underline">
            <FileSpreadsheet className="w-3.5 h-3.5" />Export
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function MobileFilterDrawer({ open, onClose, form, setForm, students, onShow, onEmail, loading, errors }) {
  if (!open) return null
  const installments = INSTALLMENTS[form.feeType] || []

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white border-t border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .3s cubic-bezier(.32,.72,0,1)' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-12 h-1.5 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="text-[15px] font-extrabold text-slate-800">Filters</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* Fee Type */}
          <Field label="Fee Type" required>
            <FeeTypeTabs value={form.feeType} onChange={v => setForm(p => ({ ...p, feeType: v, installment: '' }))} />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Session" error={errors.session} required icon={Calendar}>
              <NativeSelect value={form.session} onChange={e => setForm(p => ({ ...p, session: e.target.value }))} placeholder="Select Session" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Class" icon={BookOpen}>
              <NativeSelect value={form.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))} placeholder="All Classes">
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NativeSelect>
            </Field>
          </div>

          <Field label="Installment" error={errors.installment} required icon={Hash}>
            <NativeSelect value={form.installment} onChange={e => setForm(p => ({ ...p, installment: e.target.value }))} placeholder="Select Installment" error={errors.installment}>
              {installments.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Search Student" icon={Search}>
            <StudentSearch
              value={form.admNo}
              onChange={v => setForm(p => ({ ...p, admNo: v }))}
              onSelect={s => setForm(p => ({ ...p, selectedStudent: s, admNo: s?.admNo || '' }))}
              selectedStudent={form.selectedStudent}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Date" icon={Calendar}>
              <TextInput value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} type="date" />
            </Field>
            <Field label="Due Date" icon={Calendar}>
              <TextInput value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} type="date" />
            </Field>
          </div>

          <Field label="Due Amount >=" icon={IndianRupee}>
            <TextInput value={form.dueAmount} onChange={e => setForm(p => ({ ...p, dueAmount: e.target.value }))} type="number" placeholder="0" />
          </Field>

          <Field label="Order By" icon={ArrowDownUp}>
            <NativeSelect value={form.orderBy} onChange={e => setForm(p => ({ ...p, orderBy: e.target.value }))}>
              <option value="balance asc">Balance ↑ Ascending</option>
              <option value="balance desc">Balance ↓ Descending</option>
              <option value="name">Student Name A-Z</option>
            </NativeSelect>
          </Field>

          <Field label="Email Subject" icon={Mail}>
            <TextInput value={form.emailSubject} onChange={e => setForm(p => ({ ...p, emailSubject: e.target.value }))} placeholder="Enter email subject…" />
          </Field>

          {/* Late Fee */}
          <div className="flex items-center justify-between rounded-2xl bg-orange-50 border border-orange-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <div>
                <p className="text-[13px] font-bold text-orange-800">Consider Late Fee</p>
                <p className="text-[11px] text-orange-500">Include late charges in notice</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm(p => ({ ...p, lateFee: !p.lateFee }))}
              className={`relative w-12 h-6 rounded-full transition-all duration-200 flex-shrink-0
                ${form.lateFee ? 'bg-orange-500' : 'bg-slate-200'}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
                ${form.lateFee ? 'translate-x-6' : ''}`} />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 grid grid-cols-2 gap-3">
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-bold text-white
              bg-blue-600 hover:bg-blue-700 disabled:opacity-70 shadow-lg shadow-blue-500/25 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
          <button type="button" onClick={() => { onEmail(); onClose() }} disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-bold text-white
              bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 shadow-lg shadow-indigo-500/25 transition-all">
            <Mail className="w-4 h-4" />
            Send Email
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────
export default function FeeNotice() {
  const [form, setForm] = useState({
    feeType: 'Regular',
    session: '',
    classId: '',
    installment: '',
    admNo: '',
    selectedStudent: null,
    date: '',
    dueAmount: '0',
    dueDate: '',
    orderBy: 'balance asc',
    emailSubject: '',
    lateFee: true,
  })

  const [reportData, setReportData] = useState([])
  const [reportMeta, setReportMeta] = useState(null)
  const [loading, setLoading] = useState(false)
  const [emailLoading, setEmailLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [shown, setShown] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const validate = () => {
    const err = {}
    if (!form.session) err.session = 'Select a session'
    if (!form.installment) err.installment = 'Select an installment'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const data = generateFeeData(form.feeType, form.classId, form.installment, form.session, form.dueAmount, form.orderBy)
      const installmentName = INSTALLMENTS[form.feeType]?.find(i => i.id === form.installment)?.name || ''
      const className = CLASSES.find(c => c.id === form.classId)?.name || ''
      setReportData(data)
      setReportMeta({ session: form.session, feeType: form.feeType, installmentName, className })
      setShown(true)
      setLoading(false)
      showToast(`Fee notice generated — ${data.length} students found.`)
    }, 800)
  }, [form])

  const handleEmail = useCallback(() => {
    if (!validate()) return
    if (!form.emailSubject.trim()) {
      showToast('Please enter an email subject before sending.', 'error')
      return
    }
    setEmailLoading(true)
    setTimeout(() => {
      setEmailLoading(false)
      showToast('Emails sent successfully to all parents!', 'success')
    }, 1500)
  }, [form])

  const handleReset = () => {
    setForm({
      feeType: 'Regular', session: '', classId: '', installment: '',
      admNo: '', selectedStudent: null, date: '', dueAmount: '0',
      dueDate: '', orderBy: 'balance asc', emailSubject: '', lateFee: true,
    })
    setReportData([])
    setReportMeta(null)
    setShown(false)
    setErrors({})
  }

  const installments = INSTALLMENTS[form.feeType] || []
  const activeFilterCount = [form.session, form.classId, form.installment].filter(Boolean).length

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
              <ReceiptText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-[17px] sm:text-[19px] font-extrabold text-slate-900 leading-tight truncate">Fee Notice</h1>
              <p className="text-[11.5px] text-slate-500 hidden sm:block">Generate &amp; send fee notices to parents</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {shown && (
              <>
                <button onClick={handleReset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors">
                  <Printer className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 space-y-5 pb-24 sm:pb-8">

        {/* ── DESKTOP FILTER CARD ─────────────────────────────────────────── */}
        <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
            <span className="w-1 h-5 rounded-full bg-blue-500" />
            <Filter className="w-4 h-4 text-blue-600" />
            <span className="text-[14px] font-extrabold text-slate-700 flex-1">Search Filters</span>
            <button onClick={handleReset} className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-slate-600 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset All
            </button>
          </div>
          <div className="p-5 space-y-4">
            {/* Row 1: Fee type */}
            <div>
              <label className="block text-[11.5px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Fee Type</label>
              <div className="max-w-xs">
                <FeeTypeTabs value={form.feeType} onChange={v => setForm(p => ({ ...p, feeType: v, installment: '' }))} />
              </div>
            </div>

            {/* Row 2: Main filters */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <Field label="Session" error={errors.session} required icon={Calendar}>
                <NativeSelect
                  value={form.session}
                  onChange={e => { setForm(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                  placeholder="Select Session"
                  error={errors.session}
                >
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </NativeSelect>
              </Field>

              <Field label="Class" icon={BookOpen}>
                <NativeSelect value={form.classId} onChange={e => setForm(p => ({ ...p, classId: e.target.value }))} placeholder="All Classes">
                  {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </NativeSelect>
              </Field>

              <Field label="Installment" error={errors.installment} required icon={Hash}>
                <NativeSelect
                  value={form.installment}
                  onChange={e => { setForm(p => ({ ...p, installment: e.target.value })); setErrors(p => ({ ...p, installment: undefined })) }}
                  placeholder="Select Installment"
                  error={errors.installment}
                >
                  {installments.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </NativeSelect>
              </Field>

              <Field label="Order By" icon={ArrowDownUp}>
                <NativeSelect value={form.orderBy} onChange={e => setForm(p => ({ ...p, orderBy: e.target.value }))}>
                  <option value="balance asc">Balance ↑ Ascending</option>
                  <option value="balance desc">Balance ↓ Descending</option>
                  <option value="name">Student Name A-Z</option>
                </NativeSelect>
              </Field>

              <Field label="Due Amount >=" icon={IndianRupee}>
                <TextInput value={form.dueAmount} onChange={e => setForm(p => ({ ...p, dueAmount: e.target.value }))} type="number" placeholder="0" />
              </Field>
            </div>

            {/* Row 3: Dates + Student search + Email */}
            <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <Field label="Date" icon={Calendar}>
                <TextInput value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} type="date" />
              </Field>

              <Field label="Due Date" icon={Calendar}>
                <TextInput value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} type="date" />
              </Field>

              <div className="col-span-2">
                <Field label="Search Student" icon={Search}>
                  <StudentSearch
                    value={form.admNo}
                    onChange={v => setForm(p => ({ ...p, admNo: v }))}
                    onSelect={s => setForm(p => ({ ...p, selectedStudent: s, admNo: s?.admNo || '' }))}
                    selectedStudent={form.selectedStudent}
                  />
                </Field>
              </div>

              <Field label="Email Subject" icon={Mail}>
                <TextInput value={form.emailSubject} onChange={e => setForm(p => ({ ...p, emailSubject: e.target.value }))} placeholder="Enter email subject…" />
              </Field>
            </div>

            {/* Row 4: Late fee + Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 border-t border-slate-100">
              {/* Late fee toggle */}
              <div className="flex items-center gap-3 rounded-2xl bg-orange-50 border border-orange-100 px-4 py-2.5">
                <Clock className="w-4 h-4 text-orange-500 flex-shrink-0" />
                <span className="text-[13px] font-bold text-orange-800">Consider Late Fee</span>
                <button
                  type="button"
                  onClick={() => setForm(p => ({ ...p, lateFee: !p.lateFee }))}
                  className={`relative w-11 h-6 rounded-full transition-all duration-200 ml-1 flex-shrink-0
                    ${form.lateFee ? 'bg-orange-500' : 'bg-slate-200'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200
                    ${form.lateFee ? 'translate-x-5' : ''}`} />
                </button>
                {form.lateFee && <span className="text-[11px] font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">Active</span>}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2.5">
                <button type="button" onClick={handleShow} disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[13.5px] font-extrabold text-white
                    bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Show Report
                </button>
                <button type="button" onClick={handleEmail} disabled={emailLoading || loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[13.5px] font-extrabold text-white
                    bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all active:scale-95 disabled:opacity-70">
                  {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send Email
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE FILTER TRIGGER ─────────────────────────────────────── */}
        <div className="flex sm:hidden gap-2">
          <button type="button" onClick={() => setFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-extrabold
              bg-blue-600 text-white shadow-lg shadow-blue-500/25">
            <SlidersHorizontal className="w-4 h-4" />
            Filters &amp; Options
            {activeFilterCount > 0 && (
              <span className="bg-white/30 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full">{activeFilterCount}</span>
            )}
          </button>
          {shown && (
            <button onClick={handleReset} className="px-4 py-3 rounded-2xl bg-slate-100 text-slate-600 font-semibold">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        <MobileFilterDrawer
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          form={form}
          setForm={setForm}
          onShow={handleShow}
          onEmail={handleEmail}
          loading={loading}
          errors={errors}
        />

        {/* ── LOADING SKELETON ─────────────────────────────────────────── */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
            <div className="h-16 rounded-2xl bg-slate-100 animate-pulse" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
            </div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {/* ── REPORT ───────────────────────────────────────────────────── */}
        {shown && !loading && reportMeta && (
          <>
            <SummaryStats data={reportData} lateFee={form.lateFee} />
            <ReportPanel
              data={reportData}
              session={reportMeta.session}
              feeType={reportMeta.feeType}
              lateFee={form.lateFee}
              installmentName={reportMeta.installmentName}
              className={reportMeta.className}
            />
          </>
        )}

        {/* ── EMPTY STATE ──────────────────────────────────────────────── */}
        {!shown && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-slate-400">
            <div className="relative">
              <div className="w-20 h-20 rounded-3xl bg-blue-50 border-2 border-blue-100 flex items-center justify-center">
                <ReceiptText className="w-9 h-9 text-blue-400" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-indigo-100 border-2 border-white flex items-center justify-center">
                <Search className="w-4 h-4 text-indigo-400" />
              </div>
            </div>
            <div className="text-center max-w-xs">
              <p className="text-[16px] font-extrabold text-slate-600 mb-1">No Report Generated</p>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                Select session &amp; installment, then click <strong className="text-blue-600">Show Report</strong> to generate the fee notice.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
              {['Select Session', 'Choose Class', 'Pick Installment', 'Click Show'].map((step, i) => (
                <div key={step} className="flex items-center gap-1.5">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-[10px] font-extrabold flex items-center justify-center">{i + 1}</span>
                  <span className="text-[12px] font-semibold text-slate-500">{step}</span>
                  {i < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-300" />}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── MOBILE BOTTOM ACTIONS (shown when report visible) ─────────── */}
      {shown && !loading && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-slate-200 px-4 py-3 flex gap-2 shadow-xl">
          <button onClick={handleShow} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13.5px] font-extrabold text-white bg-blue-600 shadow-lg shadow-blue-500/20">
            <Eye className="w-4 h-4" /> Refresh
          </button>
          <button onClick={handleEmail} disabled={emailLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13.5px] font-extrabold text-white bg-indigo-600 shadow-lg shadow-indigo-500/20">
            {emailLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
            Email
          </button>
          <button className="flex items-center justify-center px-4 py-3 rounded-2xl bg-emerald-100 text-emerald-700">
            <Printer className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
