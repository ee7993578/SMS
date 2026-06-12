/**
 * SmsReport.jsx
 * Folder: src/pages/Communication/SmsReport.jsx
 *
 * Converts legacy ASPX "SMS Delivery Status Report" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session, Date Range, Status, User Type, Mobile No, Class, Section filters
 *  - GO (show report) + EXPORT buttons
 *  - Two report views:
 *    1. Single-date: Mobile No + Status + Count + nested student detail (GridView1)
 *    2. Date-range: Full SMS log table (GridView2) with pagination
 *  - Mobile: collapsible cards, drawer filters
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Search,
  MessageSquare, Download, Calendar, Phone, User, Users,
  BookOpen, Building2, MapPin, TrendingUp, Info, Clock,
  CheckCircle2, XCircle, AlertTriangle, Send, BarChart3,
  ChevronLeft, MoreHorizontal, FileSpreadsheet, Inbox,
  GraduationCap, BriefcaseBusiness, PersonStanding
} from 'lucide-react'

// ─── STATIC DATA ─────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  { value: '0', label: '-- All Classes --' },
  { value: 'Nursery', label: 'Nursery' },
  { value: 'LKG', label: 'LKG' },
  { value: 'UKG', label: 'UKG' },
  { value: 'Class I', label: 'Class I' },
  { value: 'Class II', label: 'Class II' },
  { value: 'Class III', label: 'Class III' },
  { value: 'Class IV', label: 'Class IV' },
  { value: 'Class V', label: 'Class V' },
  { value: 'Class VI', label: 'Class VI' },
  { value: 'Class VII', label: 'Class VII' },
  { value: 'Class VIII', label: 'Class VIII' },
  { value: 'Class IX', label: 'Class IX' },
  { value: 'Class X', label: 'Class X' },
  { value: 'Class XI', label: 'Class XI' },
  { value: 'Class XII', label: 'Class XII' },
]

const SECTIONS = {
  '0': [{ value: '0', label: '-- All Sections --' }],
  Nursery: [{ value: '0', label: '-- All --' }, { value: 'A', label: 'A' }, { value: 'B', label: 'B' }],
  LKG: [{ value: '0', label: '-- All --' }, { value: 'A', label: 'A' }, { value: 'B', label: 'B' }],
  UKG: [{ value: '0', label: '-- All --' }, { value: 'A', label: 'A' }, { value: 'B', label: 'B' }],
  'Class I': [{ value: '0', label: '-- All --' }, { value: 'A', label: 'A' }, { value: 'B', label: 'B' }],
  'Class VI': [{ value: '0', label: '-- All --' }, { value: 'A', label: 'A' }, { value: 'B', label: 'B' }],
  'Class IX': [{ value: '0', label: '-- All --' }, { value: 'A', label: 'A' }, { value: 'B', label: 'B' }],
}

const SMS_STATUSES = [
  { value: '0', label: '-- Select All --' },
  { value: 'Delivered', label: 'Delivered' },
  { value: 'Failed', label: 'Failed' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Not Delivered', label: 'Not Delivered' },
  { value: 'DND', label: 'DND' },
  { value: 'EXPIRED', label: 'EXPIRED' },
  { value: 'Rejected By Provider', label: 'Rejected By Provider' },
  { value: 'UNDELIVERABLE', label: 'UNDELIVERABLE' },
]

const USER_TYPES = [
  { value: '0', label: '-- Select All --' },
  { value: 'S', label: 'Student' },
  { value: 'F', label: 'Faculty' },
  { value: 'I', label: 'Individual' },
  { value: 'O', label: 'Others' },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Dummy SMS log data (GridView2 style - date range report)
const generateSmsData = (count = 40) => {
  const statuses = ['Delivered', 'Failed', 'Not Delivered', 'DND', 'Sent', 'EXPIRED']
  const names = ['Rahul Sharma', 'Priya Singh', 'Amit Kumar', 'Neha Gupta', 'Raj Patel', 'Anjali Verma', 'Deepak Yadav', 'Sunita Tiwari', 'Vikram Joshi', 'Meena Kumari']
  const categories = ['Student', 'Faculty', 'Individual', 'Others']
  const classes = ['Class I-A', 'Class V-B', 'Class IX-A', 'Nursery-A', 'Class XII-B', 'LKG-A', 'Class VI-B', '—']
  const messages = [
    'Dear Parent, Fee payment due for March 2025. Please pay before 10th.',
    'School will remain closed tomorrow due to Annual Day function.',
    'Result declared. Please collect report card from office.',
    'PTM scheduled on 15th March 2025 at 9:00 AM. Please attend.',
    'Holiday notice: School closed on account of Holi festival.',
  ]
  const data = []
  for (let i = 1; i <= count; i++) {
    const d = new Date(2025, 2, Math.ceil(i / 2))
    data.push({
      id: i,
      UserId: `USR${1000 + i}`,
      UserName: names[i % names.length],
      UserCategory: categories[i % categories.length],
      cls: classes[i % classes.length],
      MobileNo: `98${String(10000000 + i * 111111).slice(0, 8)}`,
      Status: statuses[i % statuses.length],
      SMSCount: Math.ceil(i / 10),
      Message: messages[i % messages.length],
      SendDateTime: `${d.getDate().toString().padStart(2, '0')} Mar 2025 ${(9 + (i % 10)).toString().padStart(2, '0')}:${((i * 7) % 60).toString().padStart(2, '0')} AM`,
    })
  }
  return data
}

// Dummy grouped data (GridView1 style - single date / mobile filter)
const GROUPED_DATA = [
  {
    mobno: '9876543210',
    sts: 'Delivered',
    cnt: 3,
    details: [
      { adm: 'ADM001', name: 'Rahul Sharma', cls: 'Class IX-A', fname: 'Ramesh Sharma', mname: 'Sunita Sharma', addr: '12, MG Road, Dehradun', stype: 'Student' },
      { adm: 'ADM002', name: 'Priya Singh', cls: 'Class X-A', fname: 'Suresh Singh', mname: 'Rita Singh', addr: '45, Civil Lines', stype: 'Student' },
      { adm: 'ADM003', name: 'Amit Kumar', cls: 'Class VIII-A', fname: 'Rajesh Kumar', mname: 'Meena Kumar', addr: '8, Rajpur Road', stype: 'Student' },
    ],
  },
  {
    mobno: '9812345678',
    sts: 'Failed',
    cnt: 1,
    details: [
      { adm: 'ADM010', name: 'Neha Gupta', cls: 'Nursery-A', fname: 'Manoj Gupta', mname: 'Reena Gupta', addr: '3, Karanpur', stype: 'Student' },
    ],
  },
  {
    mobno: '9765432100',
    sts: 'Delivered',
    cnt: 2,
    details: [
      { adm: 'FAC001', name: 'Dr. Anita Sharma', cls: '—', fname: '—', mname: '—', addr: '22, Dalanwala', stype: 'Faculty' },
      { adm: 'FAC002', name: 'Mr. Suresh Tiwari', cls: '—', fname: '—', mname: '—', addr: '7, Race Course', stype: 'Faculty' },
    ],
  },
  {
    mobno: '9900112233',
    sts: 'Not Delivered',
    cnt: 1,
    details: [
      { adm: 'ADM020', name: 'Raj Patel', cls: 'Class VI-B', fname: 'Vinod Patel', mname: 'Kiran Patel', addr: '19, Haridwar Road', stype: 'Student' },
    ],
  },
  {
    mobno: '9988776655',
    sts: 'DND',
    cnt: 1,
    details: [
      { adm: 'IND001', name: 'Mohit Aggarwal', cls: '—', fname: '—', mname: '—', addr: '55, Saharanpur Road', stype: 'Individual' },
    ],
  },
]

const ALL_SMS_DATA = generateSmsData(40)

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 10

const statusMeta = (sts) => {
  const map = {
    Delivered:              { color: 'emerald', icon: CheckCircle2,    bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/25' },
    Failed:                 { color: 'rose',    icon: XCircle,         bg: 'bg-rose-50 dark:bg-rose-500/10',       text: 'text-rose-700 dark:text-rose-400',       border: 'border-rose-200 dark:border-rose-500/25' },
    Sent:                   { color: 'blue',    icon: Send,            bg: 'bg-blue-50 dark:bg-blue-500/10',       text: 'text-blue-700 dark:text-blue-400',       border: 'border-blue-200 dark:border-blue-500/25' },
    'Not Delivered':        { color: 'amber',   icon: AlertTriangle,   bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-400',     border: 'border-amber-200 dark:border-amber-500/25' },
    DND:                    { color: 'orange',  icon: XCircle,         bg: 'bg-orange-50 dark:bg-orange-500/10',   text: 'text-orange-700 dark:text-orange-400',   border: 'border-orange-200 dark:border-orange-500/25' },
    EXPIRED:                { color: 'slate',   icon: Clock,           bg: 'bg-slate-100 dark:bg-slate-800',       text: 'text-slate-600 dark:text-slate-400',     border: 'border-slate-200 dark:border-slate-600/30' },
    'Rejected By Provider': { color: 'red',     icon: XCircle,         bg: 'bg-red-50 dark:bg-red-500/10',         text: 'text-red-700 dark:text-red-400',         border: 'border-red-200 dark:border-red-500/25' },
    UNDELIVERABLE:          { color: 'rose',    icon: AlertTriangle,   bg: 'bg-rose-50 dark:bg-rose-500/10',       text: 'text-rose-700 dark:text-rose-400',       border: 'border-rose-200 dark:border-rose-500/25' },
  }
  return map[sts] || map['EXPIRED']
}

const userTypeLabel = (v) => ({ S: 'Student', F: 'Faculty', I: 'Individual', O: 'Others' }[v] || v)
const userTypeIcon  = (cat) => {
  if (cat === 'Student' || cat === 'S') return GraduationCap
  if (cat === 'Faculty' || cat === 'F') return BriefcaseBusiness
  return PersonStanding
}

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
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
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function DateInput({ value, onChange, error, placeholder }) {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      className={`w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      placeholder={placeholder}
    />
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

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status, size = 'sm' }) {
  const meta = statusMeta(status)
  const Icon = meta.icon
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-3 py-1 text-[12px]'
  return (
    <span className={`inline-flex items-center gap-1 rounded-lg font-semibold border ${meta.bg} ${meta.text} ${meta.border} ${padding}`}>
      <Icon className="w-3 h-3 flex-shrink-0" />
      {status}
    </span>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────
function SchoolHeader({ session, fromDate, toDate }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[15px] sm:text-[17px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[11px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        {fromDate && toDate && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[11px] font-bold text-blue-700 dark:text-blue-400">
            <Calendar className="w-3 h-3" />
            {fromDate} – {toDate}
          </span>
        )}
      </div>
      <p className="mt-2 text-[12px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        SMS Delivery Status Report
      </p>
    </div>
  )
}

// ─── SUMMARY CARDS ────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value.toLocaleString()}</p>
        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── PAGINATION ───────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visible = pages.filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)

  return (
    <div className="flex items-center gap-1 flex-wrap">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
      </button>
      {visible.map((p, i, arr) => (
        <>
          {i > 0 && arr[i - 1] !== p - 1 && (
            <span key={`dots-${i}`} className="px-1 text-slate-400 text-[12px]"><MoreHorizontal className="w-3.5 h-3.5" /></span>
          )}
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`min-w-[30px] h-[30px] rounded-lg text-[12px] font-semibold border transition-all
              ${page === p
                ? 'bg-blue-600 text-white border-blue-600 dark:bg-indigo-600 dark:border-indigo-600'
                : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
          >
            {p}
          </button>
        </>
      ))}
      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
      </button>
    </div>
  )
}

// ─── GROUPED REPORT (single-date / mobile-filter view) ────────────────────────

function GroupedDetailTable({ rows }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            {['S.No.', 'Adm. No.', 'Name', 'Class', 'Father Name', 'Mother Name', 'Address', 'Type'].map(h => (
              <th key={h} className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] hover:bg-slate-50/60 dark:hover:bg-white/[0.01] transition-colors">
              <td className="px-3 py-2 text-slate-400">{i + 1}</td>
              <td className="px-3 py-2 font-mono text-slate-600 dark:text-slate-300">{r.adm}</td>
              <td className="px-3 py-2 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{r.name}</td>
              <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.cls}</td>
              <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.fname}</td>
              <td className="px-3 py-2 whitespace-nowrap text-slate-600 dark:text-slate-300">{r.mname}</td>
              <td className="px-3 py-2 max-w-[180px] truncate text-slate-600 dark:text-slate-300">{r.addr}</td>
              <td className="px-3 py-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-semibold border border-blue-100 dark:border-blue-500/20">
                  {r.stype}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function GroupedRowDesktop({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <>
      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-colors">
        <td className="px-4 py-3 text-center text-[12px] text-slate-400">{idx}</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-mono text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.mobno}</span>
          </div>
        </td>
        <td className="px-4 py-3"><StatusBadge status={row.sts} /></td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[14px] font-bold tabular-nums">
            {row.cnt}
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <button
            onClick={() => setExpanded(p => !p)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
            {expanded ? 'Hide' : 'Details'}
          </button>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-slate-50/50 dark:bg-white/[0.01]">
          <td colSpan={5} className="px-6 py-4">
            <GroupedDetailTable rows={row.details} />
          </td>
        </tr>
      )}
    </>
  )
}

// Mobile card for grouped view
function GroupedMobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const meta = statusMeta(row.sts)
  return (
    <div className={`rounded-xl border ${meta.border} bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden`}>
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[14px] font-bold ${meta.bg} ${meta.text}`}>
          {idx}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="font-mono text-[14px] font-bold text-slate-800 dark:text-slate-100">{row.mobno}</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <StatusBadge status={row.sts} size="sm" />
            <span className="text-[11px] text-slate-400">{row.cnt} SMS</span>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Recipient Details</p>
          {row.details.map((d, i) => (
            <div key={i} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/60 dark:bg-white/[0.02] p-3 space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-semibold text-[13px] text-slate-800 dark:text-slate-100">{d.name}</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[10px] font-semibold border border-blue-100 dark:border-blue-500/20">
                  {d.stype}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span><span className="font-medium text-slate-600 dark:text-slate-300">Adm:</span> {d.adm}</span>
                <span><span className="font-medium text-slate-600 dark:text-slate-300">Class:</span> {d.cls}</span>
                <span><span className="font-medium text-slate-600 dark:text-slate-300">Father:</span> {d.fname}</span>
                <span><span className="font-medium text-slate-600 dark:text-slate-300">Mother:</span> {d.mname}</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400"><span className="font-medium text-slate-600 dark:text-slate-300">Address:</span> {d.addr}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── DATE-RANGE LOG ROW (GridView2) ──────────────────────────────────────────
function LogRowDesktop({ row, idx }) {
  const UserIcon = userTypeIcon(row.UserCategory)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-colors">
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>
      <td className="px-3 py-3 font-mono text-[12px] text-slate-600 dark:text-slate-400">{row.UserId}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <UserIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.UserName}</span>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
          {row.UserCategory}
        </span>
      </td>
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.cls}</td>
      <td className="px-3 py-3 font-mono text-[12px] text-slate-600 dark:text-slate-300">{row.MobileNo}</td>
      <td className="px-3 py-3"><StatusBadge status={row.Status} /></td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[12px] font-bold tabular-nums">
          {row.SMSCount}
        </span>
      </td>
      <td className="px-3 py-3 max-w-[220px]">
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">{row.Message}</p>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Clock className="w-3 h-3 flex-shrink-0" />
          {row.SendDateTime}
        </div>
      </td>
    </tr>
  )
}

// Mobile card for log view
function LogMobileCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const UserIcon = userTypeIcon(row.UserCategory)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.UserName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <Phone className="w-3 h-3" />
            <span className="font-mono">{row.MobileNo}</span>
            <span className="text-slate-200 dark:text-slate-700">·</span>
            <span>{row.cls}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={row.Status} size="sm" />
          <span className="text-[10px] text-slate-400 dark:text-slate-500">SMS ×{row.SMSCount}</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-1 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5">
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">User ID</p>
              <p className="font-mono text-slate-700 dark:text-slate-200 font-semibold mt-0.5">{row.UserId}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5">
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Category</p>
              <p className="text-slate-700 dark:text-slate-200 font-semibold mt-0.5">{row.UserCategory}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5 col-span-2">
              <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase mb-0.5">Date &amp; Time</p>
              <p className="text-slate-700 dark:text-slate-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-slate-400" />{row.SendDateTime}
              </p>
            </div>
          </div>
          <div className="rounded-lg bg-blue-50/60 dark:bg-blue-500/[0.06] border border-blue-100 dark:border-blue-500/15 p-3">
            <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 uppercase mb-1 flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Message
            </p>
            <p className="text-[12px] text-slate-700 dark:text-slate-300 leading-relaxed">{row.Message}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilter, sections, onGo, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-4 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="From Date" error={errors.fromDate} required>
            <DateInput value={filters.fromDate} onChange={e => setFilter('fromDate', e.target.value)} error={errors.fromDate} />
          </Field>
          <Field label="To Date" error={errors.toDate} required>
            <DateInput value={filters.toDate} onChange={e => setFilter('toDate', e.target.value)} error={errors.toDate} />
          </Field>
          <Field label="Status">
            <NativeSelect value={filters.status} onChange={e => setFilter('status', e.target.value)}>
              {SMS_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="User Type">
            <NativeSelect value={filters.userType} onChange={e => setFilter('userType', e.target.value)}>
              {USER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Mobile No.">
            <input
              type="tel"
              maxLength={10}
              value={filters.mobile}
              onChange={e => setFilter('mobile', e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 10-digit mobile no."
              className="w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 transition-all"
            />
          </Field>
          <Field label="Class">
            <NativeSelect value={filters.cls} onChange={e => setFilter('cls', e.target.value)}>
              {CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Section">
            <NativeSelect value={filters.section} onChange={e => setFilter('section', e.target.value)}>
              {sections.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onGo(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            GO
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SmsReport() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [filters, setFiltersState] = useState({
    session:  '',
    fromDate: '',
    toDate:   '',
    status:   '0',
    userType: '0',
    mobile:   '',
    cls:      '0',
    section:  '0',
  })

  const setFilter = useCallback((key, val) => {
    setFiltersState(prev => {
      const next = { ...prev, [key]: val }
      if (key === 'cls') next.section = '0'
      return next
    })
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])

  const sections = useMemo(() =>
    SECTIONS[filters.cls] || [{ value: '0', label: '-- All Sections --' }],
    [filters.cls]
  )

  // ── Result state ──────────────────────────────────────────────────────────
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownFilters,setShownFilters]= useState(null)
  const [viewMode,    setViewMode]    = useState('grouped')  // 'grouped' | 'log'
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)

  // ── Data ──────────────────────────────────────────────────────────────────
  const groupedData = GROUPED_DATA
  const logData     = ALL_SMS_DATA

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & GO ─────────────────────────────────────────────────────────
  const handleGo = useCallback(() => {
    const err = {}
    if (!filters.session) err.session  = 'Select a session'
    if (!filters.fromDate) err.fromDate = 'Select from date'
    if (!filters.toDate)   err.toDate   = 'Select to date'
    if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate)
      err.toDate = 'To date must be after from date'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setPage(1)

    setTimeout(() => {
      setShownFilters({ ...filters })
      setShown(true)
      // Show grouped if mobile filter used, else log view
      setViewMode(filters.mobile ? 'grouped' : 'log')
      setLoading(false)
      showToast('Report loaded successfully.')
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFiltersState({ session: '', fromDate: '', toDate: '', status: '0', userType: '0', mobile: '', cls: '0', section: '0' })
    setErrors({})
    setShown(false)
    setShownFilters(null)
    setSearch('')
    setPage(1)
  }

  // ── Export ────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!shown) { showToast('Load the report first before exporting.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter on log data ─────────────────────────────────────────────
  const filteredLog = useMemo(() => {
    if (!search) return logData
    const q = search.toLowerCase()
    return logData.filter(r =>
      r.UserName.toLowerCase().includes(q) ||
      r.MobileNo.includes(q) ||
      r.Status.toLowerCase().includes(q) ||
      r.UserCategory.toLowerCase().includes(q) ||
      r.cls.toLowerCase().includes(q)
    )
  }, [logData, search])

  const totalPages = Math.ceil(filteredLog.length / PAGE_SIZE)
  const pagedLog   = filteredLog.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const delivered   = logData.filter(r => r.Status === 'Delivered').length
    const failed      = logData.filter(r => ['Failed', 'Not Delivered', 'DND', 'UNDELIVERABLE', 'Rejected By Provider'].includes(r.Status)).length
    const total       = logData.length
    const totalSms    = logData.reduce((s, r) => s + r.SMSCount, 0)
    return { total, delivered, failed, totalSms }
  }, [logData])

  const hasResults   = shown && !loading
  const activeFilterCount = [
    filters.session, filters.fromDate, filters.toDate,
    filters.status !== '0' ? filters.status : '',
    filters.userType !== '0' ? filters.userType : '',
    filters.mobile,
    filters.cls !== '0' ? filters.cls : '',
  ].filter(Boolean).length

  // ── Format date for display ───────────────────────────────────────────────
  const fmtDate = (d) => {
    if (!d) return ''
    const [y, m, day] = d.split('-')
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    return `${day} ${months[parseInt(m) - 1]} ${y}`
  }

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            SMS Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Track SMS delivery status by session, date range, status, and user type.
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
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5 space-y-4">
          {/* Row 1 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)} placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="From Date" error={errors.fromDate} required>
              <DateInput value={filters.fromDate} onChange={e => setFilter('fromDate', e.target.value)} error={errors.fromDate} />
            </Field>
            <Field label="To Date" error={errors.toDate} required>
              <DateInput value={filters.toDate} onChange={e => setFilter('toDate', e.target.value)} error={errors.toDate} />
            </Field>
            <Field label="Status">
              <NativeSelect value={filters.status} onChange={e => setFilter('status', e.target.value)}>
                {SMS_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </NativeSelect>
            </Field>
          </div>
          {/* Row 2 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-end">
            <Field label="User Type">
              <NativeSelect value={filters.userType} onChange={e => setFilter('userType', e.target.value)}>
                {USER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Mobile No.">
              <input
                type="tel"
                maxLength={10}
                value={filters.mobile}
                onChange={e => setFilter('mobile', e.target.value.replace(/\D/g, ''))}
                placeholder="10-digit mobile no."
                className="w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 transition-all placeholder-slate-300 dark:placeholder-slate-600"
              />
            </Field>
            <Field label="Class">
              <NativeSelect value={filters.cls} onChange={e => setFilter('cls', e.target.value)}>
                {CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Section">
              <NativeSelect value={filters.section} onChange={e => setFilter('section', e.target.value)}>
                {sections.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={handleGo} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              GO
            </button>
            <button type="button" onClick={handleExport} disabled={exporting || !shown}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 transition-all disabled:opacity-50">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export
            </button>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
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
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        sections={sections}
        onGo={handleGo}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── RESULTS ──────────────────────────────────────────────────────── */}
      {hasResults && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={shownFilters.session}
            fromDate={fmtDate(shownFilters.fromDate)}
            toDate={fmtDate(shownFilters.toDate)}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={MessageSquare} label="Total SMS Sent"    value={stats.totalSms}   color="blue"    />
            <SummaryCard icon={Send}          label="Total Records"     value={stats.total}      color="violet"  />
            <SummaryCard icon={CheckCircle2}  label="Delivered"         value={stats.delivered}  color="emerald" />
            <SummaryCard icon={XCircle}       label="Failed / Not Dlv." value={stats.failed}     color="rose"    />
          </div>

          {/* ── View Toggle ───────────────────────────────────────────────── */}
          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden bg-slate-50 dark:bg-[#1e2238] p-1 gap-1">
              <button
                onClick={() => { setViewMode('grouped'); setPage(1) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all
                  ${viewMode === 'grouped'
                    ? 'bg-white dark:bg-[#1a1f35] text-blue-700 dark:text-indigo-300 shadow-sm border border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile-wise</span>
                <span className="sm:hidden">Mobile</span>
              </button>
              <button
                onClick={() => { setViewMode('log'); setPage(1) }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all
                  ${viewMode === 'log'
                    ? 'bg-white dark:bg-[#1a1f35] text-blue-700 dark:text-indigo-300 shadow-sm border border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Detailed Log</span>
                <span className="sm:hidden">Log</span>
              </button>
            </div>
            {/* Applied filters chips */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {shownFilters.status !== '0' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 text-[11px] font-semibold text-blue-700 dark:text-blue-400">
                  {shownFilters.status}
                </span>
              )}
              {shownFilters.userType !== '0' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/25 text-[11px] font-semibold text-violet-700 dark:text-violet-400">
                  {userTypeLabel(shownFilters.userType)}
                </span>
              )}
              {shownFilters.mobile && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25 text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  <Phone className="w-2.5 h-2.5" />{shownFilters.mobile}
                </span>
              )}
            </div>
          </div>

          {/* ─────── GROUPED VIEW (GridView1) ────────────────────────────── */}
          {viewMode === 'grouped' && (
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Mobile-wise Summary</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {groupedData.length} numbers
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <p className="text-[12px] text-blue-700 dark:text-blue-400">
                  Click "Details" to expand recipient information for each mobile number.
                </p>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Mobile No.', 'Status', 'Count', 'Recipients'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {groupedData.map((row, i) => (
                      <GroupedRowDesktop key={row.mobno} row={row} idx={i + 1} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-3">
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap a card to view recipient details.
                </p>
                {groupedData.map((row, i) => (
                  <GroupedMobileCard key={row.mobno} row={row} idx={i + 1} />
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
                <p className="text-[12px] text-slate-400 dark:text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{groupedData.length}</span> mobile numbers
                </p>
              </div>
            </div>
          )}

          {/* ─────── LOG VIEW (GridView2) ─────────────────────────────────── */}
          {viewMode === 'log' && (
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                  <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                  <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Detailed SMS Log</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                    {filteredLog.length} records
                  </span>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-56 flex-shrink-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => { setSearch(e.target.value); setPage(1) }}
                    placeholder="Search name, mobile, status…"
                    className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                      bg-white text-slate-700 border-slate-200 placeholder-slate-300
                      focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                      dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                      dark:placeholder-slate-600 dark:focus:border-indigo-400"
                  />
                  {search && (
                    <button onClick={() => { setSearch(''); setPage(1) }} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                {pagedLog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                    <Inbox className="w-6 h-6 opacity-40" />
                    <span className="text-[13px]">No records match your search.</span>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                        {['S.No.', 'User ID', 'Name', 'Category', 'Class', 'Mobile No.', 'Status', 'SMS Count', 'Message', 'Date & Time'].map(h => (
                          <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {pagedLog.map((row, i) => (
                        <LogRowDesktop key={row.id} row={row} idx={(page - 1) * PAGE_SIZE + i + 1} />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-3">
                {pagedLog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                    <Inbox className="w-6 h-6 opacity-40" />
                    <span className="text-[13px]">No records match your search.</span>
                  </div>
                ) : (
                  <>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      Tap a card to expand message and details.
                    </p>
                    {pagedLog.map(row => <LogMobileCard key={row.id} row={row} />)}
                  </>
                )}
              </div>

              {/* Table Footer + Pagination */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
                <p className="text-[12px] text-slate-400 dark:text-slate-500">
                  Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredLog.length)}</span>{' '}
                  of <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredLog.length}</span> records
                </p>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session, date range and click <strong>GO</strong> to generate the SMS report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
