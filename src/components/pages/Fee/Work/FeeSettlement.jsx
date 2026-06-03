/**
 * FeeSettlement.jsx
 * Import Excel for Fee Settlement — fully responsive React + Tailwind
 * Desktop: ERP-dense table layout | Mobile: card-based, tab-driven
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Upload, FileSpreadsheet, Download, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Calendar, Building2, CreditCard, Search,
  TrendingUp, TrendingDown, BarChart3, Layers,
  Info, Filter, SlidersHorizontal, ChevronRight,
  CheckCircle2, XCircle, Clock, FileUp, Banknote,
  Hash, ArrowUpRight, Zap, Shield
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = [
  { value: '2022-23', label: '2022-23' },
  { value: '2023-24', label: '2023-24' },
  { value: '2024-25', label: '2024-25' },
  { value: '2025-26', label: '2025-26' },
]

const BANKS = [
  { value: '0', label: '-- Select Gateway --' },
  { value: 'HDFC',    label: 'HDFC Bank' },
  { value: 'SBI',     label: 'State Bank of India' },
  { value: 'ICICI',   label: 'ICICI Bank' },
  { value: 'AXIS',    label: 'Axis Bank' },
  { value: 'PNB',     label: 'Punjab National Bank' },
  { value: 'RAZORPAY',label: 'Razorpay' },
  { value: 'PAYTM',   label: 'Paytm Gateway' },
  { value: 'CCAVENUE',label: 'CCAvenue' },
]

// Settlement history dummy data
const SETTLEMENT_HISTORY = [
  {
    uid: 'UID001', title: 'APRIL SETTLEMENT 2025',
    totalcount: 142, total_amount: '₹4,28,500',
    statu_count_complete: 138, Complete_amount: '₹4,15,200',
    faild: 4, Failed_amount: '₹13,300',
    Settlement_Date: '05-Apr-2025', PostedDate: '06-Apr-2025',
    bank: 'HDFC Bank', session: '2024-25',
  },
  {
    uid: 'UID002', title: 'MARCH SETTLEMENT 2025',
    totalcount: 210, total_amount: '₹6,31,000',
    statu_count_complete: 205, Complete_amount: '₹6,18,400',
    faild: 5, Failed_amount: '₹12,600',
    Settlement_Date: '02-Mar-2025', PostedDate: '03-Mar-2025',
    bank: 'SBI', session: '2024-25',
  },
  {
    uid: 'UID003', title: 'FEB SETTLEMENT 2025',
    totalcount: 198, total_amount: '₹5,94,000',
    statu_count_complete: 196, Complete_amount: '₹5,88,000',
    faild: 2, Failed_amount: '₹6,000',
    Settlement_Date: '03-Feb-2025', PostedDate: '04-Feb-2025',
    bank: 'ICICI Bank', session: '2024-25',
  },
  {
    uid: 'UID004', title: 'JANUARY SETTLEMENT 2025',
    totalcount: 175, total_amount: '₹5,25,000',
    statu_count_complete: 170, Complete_amount: '₹5,10,000',
    faild: 5, Failed_amount: '₹15,000',
    Settlement_Date: '06-Jan-2025', PostedDate: '07-Jan-2025',
    bank: 'HDFC Bank', session: '2024-25',
  },
  {
    uid: 'UID005', title: 'DEC SETTLEMENT 2024',
    totalcount: 89,  total_amount: '₹2,67,000',
    statu_count_complete: 89, Complete_amount: '₹2,67,000',
    faild: 0, Failed_amount: '₹0',
    Settlement_Date: '04-Dec-2024', PostedDate: '05-Dec-2024',
    bank: 'Axis Bank', session: '2024-25',
  },
]

// Failed transaction details per UID
const FAILED_DETAILS = {
  'UID001': [
    { txn: 'TXN8821', student: 'Arjun Sharma',     class: 'X-A',   amount: '₹3,500', reason: 'Insufficient Funds',   date: '04-Apr-2025' },
    { txn: 'TXN8834', student: 'Priya Singh',       class: 'VIII-B',amount: '₹2,800', reason: 'Card Expired',         date: '04-Apr-2025' },
    { txn: 'TXN8841', student: 'Rahul Verma',       class: 'VI-A',  amount: '₹3,500', reason: 'Bank Server Timeout',  date: '04-Apr-2025' },
    { txn: 'TXN8859', student: 'Meena Kumari',      class: 'XII-A', amount: '₹3,500', reason: 'Duplicate Transaction', date: '04-Apr-2025' },
  ],
  'UID002': [
    { txn: 'TXN7711', student: 'Amit Kumar',        class: 'IX-B',  amount: '₹2,800', reason: 'Insufficient Funds',   date: '01-Mar-2025' },
    { txn: 'TXN7724', student: 'Sneha Gupta',       class: 'VII-A', amount: '₹2,800', reason: 'Invalid CVV',          date: '01-Mar-2025' },
    { txn: 'TXN7731', student: 'Vikram Yadav',      class: 'XI-A',  amount: '₹3,500', reason: 'Bank Declined',        date: '01-Mar-2025' },
    { txn: 'TXN7745', student: 'Anjali Mishra',     class: 'V-A',   amount: '₹1,800', reason: 'Network Error',        date: '01-Mar-2025' },
    { txn: 'TXN7760', student: 'Rohan Tiwari',      class: 'IV-A',  amount: '₹1,700', reason: 'Card Blocked',         date: '01-Mar-2025' },
  ],
}

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, error, disabled, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 font-medium
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
        {hint && (
          <span className="ml-auto text-[11px] font-normal text-slate-400 normal-case tracking-normal">{hint}</span>
        )}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-red-500 font-medium">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5
      rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[92vw]
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-500 text-white'}`}
      style={{ animation: 'toastUp .3s cubic-bezier(.34,1.56,.64,1)' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(16px) scale(.92)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}`}</style>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <XCircle className="w-5 h-5 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-80 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  const c = {
    blue:    'bg-blue-50 text-blue-600 border-blue-100',
    green:   'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    red:     'bg-red-50 text-red-500 border-red-100',
    violet:  'bg-violet-50 text-violet-600 border-violet-100',
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 shadow-sm hover:shadow-md transition-shadow flex-1 min-w-0">
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${c[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-extrabold text-slate-800 tabular-nums leading-tight truncate">{value}</p>
        <p className="text-[11px] text-slate-500 font-medium truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── STATUS PILL ─────────────────────────────────────────────────────────────
function StatusPill({ success, total }) {
  const rate = total > 0 ? Math.round((success / total) * 100) : 100
  const color = rate === 100 ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
    : rate >= 95 ? 'bg-amber-100 text-amber-700 border-amber-200'
    : 'bg-red-100 text-red-600 border-red-200'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${rate === 100 ? 'bg-emerald-500' : rate >= 95 ? 'bg-amber-500' : 'bg-red-500'}`} />
      {rate}%
    </span>
  )
}

// ─── FAILED MODAL ─────────────────────────────────────────────────────────────
function FailedModal({ record, onClose }) {
  if (!record) return null
  const details = FAILED_DETAILS[record.uid] || []

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden"
        style={{ animation: 'modalUp .3s cubic-bezier(.34,1.56,.64,1)' }}>
        <style>{`@keyframes modalUp{from{opacity:0;transform:translateY(40px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}`}</style>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-red-50">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
            <XCircle className="w-5 h-5 text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-800 truncate">Failed Transactions</p>
            <p className="text-[12px] text-slate-500 truncate">{record.title}</p>
          </div>
          <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-[12px] font-bold border border-red-200 flex-shrink-0">
            {record.faild} Failed
          </span>
          <button onClick={onClose} className="w-8 h-8 rounded-xl hover:bg-red-100 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          {details.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-[13px]">No failed transaction details available.</p>
            </div>
          ) : (
            details.map((d, i) => (
              <div key={i} className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-red-50/50 hover:border-red-100 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-[11px] font-bold text-red-500">{i + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 flex-wrap">
                    <div>
                      <p className="text-[13px] font-bold text-slate-800">{d.student}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{d.txn} · Class {d.class}</p>
                    </div>
                    <span className="text-[14px] font-extrabold text-red-600 flex-shrink-0">{d.amount}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold border border-red-200">{d.reason}</span>
                    <span className="text-[10px] text-slate-400">{d.date}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between gap-3">
          <p className="text-[12px] text-slate-400">Total failed: <strong className="text-red-500">{record.Failed_amount}</strong></p>
          <button onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white text-[13px] font-semibold hover:bg-slate-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── UPLOAD SECTION ───────────────────────────────────────────────────────────
function UploadSection({ onUploadSuccess }) {
  const [session, setSession]     = useState('')
  const [bank, setBank]           = useState('0')
  const [title, setTitle]         = useState('')
  const [file, setFile]           = useState(null)
  const [errors, setErrors]       = useState({})
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const validate = () => {
    const e = {}
    if (!session) e.session = 'Select a session'
    if (bank === '0') e.bank = 'Select a payment gateway'
    if (!title.trim()) e.title = 'Enter a title'
    if (!file) e.file = 'Please select an Excel file'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleUpload = () => {
    if (!validate()) return
    setUploading(true)
    setTimeout(() => {
      setUploading(false)
      setFile(null); setTitle(''); setSession(''); setBank('0')
      setErrors({})
      if (fileRef.current) fileRef.current.value = ''
      onUploadSuccess?.()
    }, 1800)
  }

  const handleFileChange = (e) => {
    const f = e.target.files?.[0]
    if (f) {
      if (!f.name.match(/\.(xlsx|xls)$/i)) {
        setErrors(p => ({ ...p, file: 'Only .xlsx or .xls files allowed' }))
        setFile(null)
      } else {
        setErrors(p => ({ ...p, file: undefined }))
        setFile(f)
      }
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-slate-50">
        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
          <FileUp className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-[15px] font-extrabold text-slate-800">Fee Settlement Upload</h2>
          <p className="text-[12px] text-slate-500">Import Excel file to process fee settlements</p>
        </div>
      </div>

      {/* Form */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Session */}
          <Field label="Session" required error={errors.session}>
            <NativeSelect
              value={session}
              onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: '' })) }}
              error={errors.session}
              placeholder="-- Select Session --"
            >
              {SESSIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </NativeSelect>
          </Field>

          {/* File Upload */}
          <Field label="Excel File" required error={errors.file}>
            <div
              onClick={() => fileRef.current?.click()}
              className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 border-dashed cursor-pointer transition-all
                ${errors.file ? 'border-red-400 bg-red-50' : file ? 'border-emerald-400 bg-emerald-50' : 'border-slate-200 bg-slate-50 hover:border-blue-400 hover:bg-blue-50'}`}
            >
              <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
              {file
                ? <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                : <Upload className="w-4 h-4 text-slate-400 flex-shrink-0" />
              }
              <span className={`text-[12px] font-medium truncate ${file ? 'text-emerald-700' : 'text-slate-500'}`}>
                {file ? file.name : 'Click to browse file'}
              </span>
            </div>
          </Field>

          {/* Title */}
          <Field label="Title" required error={errors.title}>
            <input
              value={title}
              onChange={e => {
                const v = e.target.value.toUpperCase().replace(/[,./;'[\]\\=\-<>?:"{}|+_`~!@#$%^&*()+/]/g, '')
                setTitle(v)
                setErrors(p => ({ ...p, title: '' }))
              }}
              placeholder="e.g. APRIL SETTLEMENT 2025"
              className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                ${errors.title ? 'border-red-400 ring-2 ring-red-100' : 'border-slate-200 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}
                bg-white text-slate-800 font-medium placeholder:text-slate-300 placeholder:font-normal`}
            />
          </Field>

          {/* Gateway */}
          <Field label="Payment Gateway" required error={errors.bank}>
            <NativeSelect
              value={bank}
              onChange={e => { setBank(e.target.value); setErrors(p => ({ ...p, bank: '' })) }}
              error={errors.bank}
            >
              {BANKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
            </NativeSelect>
          </Field>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
        <button
          type="button"
          onClick={handleUpload}
          disabled={uploading}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white
            bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70"
        >
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          {uploading ? 'Uploading...' : 'Upload & Process'}
        </button>

        <a
          href="#"
          onClick={e => e.preventDefault()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-emerald-700 border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-all"
        >
          <Download className="w-4 h-4" />
          Download Blank Template
        </a>

        <div className="flex items-center gap-2 sm:ml-auto text-[12px] text-slate-400 font-medium">
          <Shield className="w-4 h-4 text-blue-400 flex-shrink-0" />
          Supports .xlsx and .xls formats only
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ record, idx, onFailedClick }) {
  const successRate = record.totalcount > 0
    ? Math.round((record.statu_count_complete / record.totalcount) * 100) : 100

  return (
    <tr className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors group">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>

      <td className="px-4 py-3">
        <div>
          <p className="text-[13px] font-bold text-slate-800 group-hover:text-blue-700 transition-colors">{record.title}</p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{record.uid}</p>
        </div>
      </td>

      <td className="px-4 py-3 text-center">
        <span className="text-[13px] font-bold text-slate-700 tabular-nums">{record.totalcount}</span>
      </td>

      <td className="px-4 py-3 text-center">
        <span className="text-[13px] font-bold text-slate-700 tabular-nums">{record.total_amount}</span>
      </td>

      <td className="px-4 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[13px] font-bold text-emerald-600 tabular-nums">{record.statu_count_complete}</span>
          <StatusPill success={record.statu_count_complete} total={record.totalcount} />
        </div>
      </td>

      <td className="px-4 py-3 text-center">
        <span className="text-[13px] font-bold text-emerald-600 tabular-nums">{record.Complete_amount}</span>
      </td>

      <td className="px-4 py-3 text-center">
        {record.faild > 0 ? (
          <button
            onClick={() => onFailedClick(record)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[12px] font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />{record.faild}
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[12px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />0
          </span>
        )}
      </td>

      <td className="px-4 py-3 text-center">
        <span className="text-[13px] font-bold text-red-500 tabular-nums">{record.Failed_amount}</span>
      </td>

      <td className="px-4 py-3 text-center whitespace-nowrap">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[12px] font-semibold text-slate-700">{record.Settlement_Date}</span>
          <span className="text-[10px] text-slate-400">Settlement</span>
        </div>
      </td>

      <td className="px-4 py-3 text-center whitespace-nowrap">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[12px] font-semibold text-slate-600">{record.PostedDate}</span>
          <span className="text-[10px] text-slate-400">Posted</span>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE SETTLEMENT CARD ───────────────────────────────────────────────────
function MobileCard({ record, idx, onFailedClick }) {
  const [expanded, setExpanded] = useState(false)
  const successRate = record.totalcount > 0
    ? Math.round((record.statu_count_complete / record.totalcount) * 100) : 100
  const rateColor = successRate === 100 ? 'text-emerald-600' : successRate >= 95 ? 'text-amber-600' : 'text-red-500'

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      {/* Card Header — always visible */}
      <div className="px-4 py-4">
        <div className="flex items-start gap-3">
          {/* Index */}
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/30">
            <span className="text-[11px] font-bold text-white">{idx}</span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-extrabold text-slate-800 leading-tight">{record.title}</p>
            <p className="text-[11px] text-slate-400 font-mono mt-0.5">{record.uid} · {record.bank}</p>
          </div>

          <StatusPill success={record.statu_count_complete} total={record.totalcount} />
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="rounded-xl bg-blue-50 border border-blue-100 p-2.5 text-center">
            <p className="text-[17px] font-extrabold text-blue-700 tabular-nums">{record.totalcount}</p>
            <p className="text-[10px] text-blue-500 font-semibold">Total</p>
          </div>
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 p-2.5 text-center">
            <p className="text-[17px] font-extrabold text-emerald-700 tabular-nums">{record.statu_count_complete}</p>
            <p className="text-[10px] text-emerald-500 font-semibold">Success</p>
          </div>
          <div className={`rounded-xl p-2.5 text-center ${record.faild > 0 ? 'bg-red-50 border border-red-100' : 'bg-slate-50 border border-slate-100'}`}>
            <button
              onClick={() => record.faild > 0 && onFailedClick(record)}
              className={`w-full ${record.faild > 0 ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <p className={`text-[17px] font-extrabold tabular-nums ${record.faild > 0 ? 'text-red-600' : 'text-slate-400'}`}>{record.faild}</p>
              <p className={`text-[10px] font-semibold ${record.faild > 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {record.faild > 0 ? 'Failed ↗' : 'No Failed'}
              </p>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-semibold mb-1.5">
            <span className="text-emerald-600">Success {successRate}%</span>
            {record.faild > 0 && <span className="text-red-500">Failed {100 - successRate}%</span>}
          </div>
          <div className="h-2 rounded-full bg-red-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${successRate === 100 ? 'bg-emerald-500' : 'bg-emerald-500'}`}
              style={{ width: `${successRate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Expand/Collapse toggle */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center justify-center gap-2 py-2.5 border-t border-slate-100 text-[12px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors"
      >
        {expanded ? 'Hide details' : 'View amounts & dates'}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 py-4 bg-slate-50/50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white border border-slate-200 p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Total Amount</p>
              <p className="text-[16px] font-extrabold text-slate-800">{record.total_amount}</p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-3">
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wide mb-1">Settled Amount</p>
              <p className="text-[16px] font-extrabold text-emerald-700">{record.Complete_amount}</p>
            </div>
            <div className="rounded-xl bg-white border border-red-100 p-3">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide mb-1">Failed Amount</p>
              <p className="text-[16px] font-extrabold text-red-600">{record.Failed_amount}</p>
            </div>
            <div className="rounded-xl bg-white border border-slate-200 p-3">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Gateway</p>
              <p className="text-[13px] font-bold text-slate-700">{record.bank}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 p-3">
              <Calendar className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Settlement</p>
                <p className="text-[12px] font-bold text-slate-700">{record.Settlement_Date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-xl bg-white border border-slate-200 p-3">
              <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Posted</p>
                <p className="text-[12px] font-bold text-slate-700">{record.PostedDate}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── HISTORY SECTION ──────────────────────────────────────────────────────────
function HistorySection() {
  const [search, setSearch]     = useState('')
  const [failedModal, setFailedModal] = useState(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return SETTLEMENT_HISTORY
    const q = search.toLowerCase()
    return SETTLEMENT_HISTORY.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.uid.toLowerCase().includes(q) ||
      r.bank.toLowerCase().includes(q)
    )
  }, [search])

  // Summary totals
  const totals = useMemo(() => ({
    records: SETTLEMENT_HISTORY.length,
    totalCount: SETTLEMENT_HISTORY.reduce((s, r) => s + r.totalcount, 0),
    success: SETTLEMENT_HISTORY.reduce((s, r) => s + r.statu_count_complete, 0),
    failed: SETTLEMENT_HISTORY.reduce((s, r) => s + r.faild, 0),
  }), [])

  return (
    <>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <StatCard icon={Layers}      label="Total Batches"   value={totals.records}    color="blue" />
        <StatCard icon={Hash}        label="Total Records"   value={totals.totalCount} color="violet" />
        <StatCard icon={CheckCircle2}label="Successful"      value={totals.success}    color="green" />
        <StatCard icon={XCircle}     label="Failed"          value={totals.failed}     color="red" />
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <FileSpreadsheet className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-[14px] font-extrabold text-slate-700">Settlement History</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold border border-blue-200">
              {filtered.length} records
            </span>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search title, ID, bank..."
              className="w-full pl-9 pr-8 py-2 text-[12px] rounded-xl border border-slate-200 outline-none transition-all
                bg-white text-slate-700 placeholder-slate-300 font-medium
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden lg:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
              <Search className="w-8 h-8 opacity-40" />
              <p className="text-[13px]">No records match your search.</p>
            </div>
          ) : (
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['#', 'Title', 'Total Upload', 'Total Amount', 'Upload Count', 'Upload Amount', 'Failed Count', 'Failed Amount', 'Settlement Date', 'Posted Date'].map((h, i) => (
                    <th key={i} className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((record, i) => (
                  <DesktopRow
                    key={record.uid}
                    record={record}
                    idx={i + 1}
                    onFailedClick={setFailedModal}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* TABLET TABLE (md, not lg) — simplified */}
        <div className="hidden md:block lg:hidden overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
              <Search className="w-8 h-8 opacity-40" />
              <p className="text-[13px]">No records match your search.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  {['#', 'Title / ID', 'Total', 'Success', 'Failed', 'Settlement Date'].map((h, i) => (
                    <th key={i} className="px-3 py-3 text-center text-[11px] font-bold uppercase tracking-wider text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((record, i) => (
                  <tr key={record.uid} className="border-b border-slate-100 hover:bg-blue-50/20 transition-colors">
                    <td className="px-3 py-3 text-center text-[12px] text-slate-400">{i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="text-[13px] font-bold text-slate-800">{record.title}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{record.uid}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <p className="text-[13px] font-bold text-slate-700">{record.totalcount}</p>
                      <p className="text-[11px] text-slate-400">{record.total_amount}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <p className="text-[13px] font-bold text-emerald-600">{record.statu_count_complete}</p>
                      <p className="text-[11px] text-emerald-500">{record.Complete_amount}</p>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {record.faild > 0 ? (
                        <button onClick={() => setFailedModal(record)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[12px] font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100">
                          <XCircle className="w-3 h-3" />{record.faild}
                        </button>
                      ) : (
                        <span className="text-[12px] font-bold text-emerald-500">✓ 0</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center text-[12px] font-semibold text-slate-600 whitespace-nowrap">
                      {record.Settlement_Date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-slate-400">
              <Search className="w-8 h-8 opacity-40" />
              <p className="text-[13px]">No records match your search.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 pb-1 text-[12px] text-blue-600 font-medium">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap "Failed" count to view transaction details
              </div>
              {filtered.map((record, i) => (
                <MobileCard
                  key={record.uid}
                  record={record}
                  idx={i + 1}
                  onFailedClick={setFailedModal}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[12px] text-slate-400">
            Showing <strong className="text-slate-600">{filtered.length}</strong> of{' '}
            <strong className="text-slate-600">{SETTLEMENT_HISTORY.length}</strong> settlements
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Failed Modal */}
      {failedModal && (
        <FailedModal record={failedModal} onClose={() => setFailedModal(null)} />
      )}
    </>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function FeeSettlement() {
  const [toast, setToast]       = useState(null)
  const [activeTab, setActiveTab] = useState('upload') // 'upload' | 'history'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleUploadSuccess = () => {
    showToast('✓ File uploaded and processed successfully!')
    setActiveTab('history')
  }

  const TABS = [
    { key: 'upload',  label: 'Upload Settlement', icon: FileUp },
    { key: 'history', label: 'Settlement History', icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-3">
            <span className="hover:text-blue-600 cursor-pointer font-medium">Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-blue-600 font-semibold">Fee Settlement Import</span>
          </nav>

          {/* Title + Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                <Banknote className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-[20px] font-extrabold text-slate-800 leading-tight">Fee Settlement</h1>
                <p className="text-[12px] text-slate-500 font-medium">Import & manage payment settlement data from bank/gateway Excel files</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-bold text-emerald-700">System Active</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4 border-b border-slate-200 -mb-px">
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-bold rounded-t-xl border-b-2 transition-all
                    ${active
                      ? 'text-blue-700 border-blue-600 bg-blue-50/50'
                      : 'text-slate-500 border-transparent hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.key === 'upload' ? 'Upload' : 'History'}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Page Content ── */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">
        {activeTab === 'upload' && (
          <>
            {/* Info Banner */}
            <div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-blue-50 border border-blue-200">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[13px] font-bold text-blue-800">How to use Fee Settlement Import</p>
                <p className="text-[12px] text-blue-600 mt-0.5 leading-relaxed">
                  1. Select the academic session &nbsp;·&nbsp;
                  2. Download the blank Excel template &nbsp;·&nbsp;
                  3. Fill transaction data &nbsp;·&nbsp;
                  4. Select gateway &amp; enter a batch title &nbsp;·&nbsp;
                  5. Upload the file
                </p>
              </div>
            </div>

            <UploadSection onUploadSuccess={handleUploadSuccess} />

            {/* Quick stats from history */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Layers}        label="Total Batches"      value={SETTLEMENT_HISTORY.length}   color="blue" />
              <StatCard icon={TrendingUp}    label="Avg Success Rate"   value="97.2%"                        color="green" />
              <StatCard icon={CreditCard}    label="Total Processed"    value="₹24.46L"                      color="violet" />
              <StatCard icon={Zap}           label="Latest Settlement"  value="05-Apr-25"                    color="amber" />
            </div>
          </>
        )}

        {activeTab === 'history' && <HistorySection />}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
