/**
 * TC_Report.jsx
 * Folder: src/pages/Student/Reports/TC_Report.jsx
 *
 * Transfer Certificate Report — converted from ASPX to React + Tailwind.
 *
 * Columns: S.No, Registration No, Student Name, Class, Registration Date,
 *          Withdrawn Date, Withdrawn Reason, TC Issued Status
 * Features:
 *  - Session dropdown filter
 *  - Show report + Export Excel buttons
 *  - School header banner
 *  - Status badge for TC Issued Status
 *  - Mobile: card-based layout with expandable details
 *  - Desktop: dense ERP-style table
 *  - Search/filter, loading states, empty states, toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search,
  FileSpreadsheet, BookOpen,
  School2, Building2, MapPin,
  ChevronRight, FileText, UserMinus,
  Calendar, Hash, ClipboardList,
  CheckCircle2, XCircle, Clock
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const WITHDRAWN_REASONS = [
  'Family Relocation',
  'School Transfer',
  'Financial Issues',
  'Personal Reasons',
  'Better Opportunity',
  'Health Issues',
]

const generateTCData = (session) => {
  const base = {
    '2022-23': [
      { registration_no: 'REG/22/001', stu_name: 'Aarav Sharma',      class_name: 'Class X',    registration_date: '15-Apr-2022', withdrawn_date: '20-Mar-2023', withdrawn_reason: 'Family Relocation', tc_issued_status: 'Issued'     },
      { registration_no: 'REG/22/002', stu_name: 'Priya Singh',       class_name: 'Class VIII', registration_date: '10-Apr-2022', withdrawn_date: '15-Feb-2023', withdrawn_reason: 'School Transfer',   tc_issued_status: 'Issued'     },
      { registration_no: 'REG/22/003', stu_name: 'Rohit Verma',       class_name: 'Class VI',   registration_date: '12-Apr-2022', withdrawn_date: '28-Jan-2023', withdrawn_reason: 'Financial Issues',  tc_issued_status: 'Pending'    },
      { registration_no: 'REG/22/004', stu_name: 'Neha Patel',        class_name: 'Class IX',   registration_date: '08-Apr-2022', withdrawn_date: '10-Mar-2023', withdrawn_reason: 'Personal Reasons',  tc_issued_status: 'Issued'     },
      { registration_no: 'REG/22/005', stu_name: 'Karan Mehta',       class_name: 'Class VII',  registration_date: '18-Apr-2022', withdrawn_date: '05-Mar-2023', withdrawn_reason: 'Better Opportunity','tc_issued_status': 'Issued'   },
      { registration_no: 'REG/22/006', stu_name: 'Ananya Gupta',      class_name: 'Class XI',   registration_date: '14-Apr-2022', withdrawn_date: '22-Feb-2023', withdrawn_reason: 'Health Issues',     tc_issued_status: 'Not Issued' },
      { registration_no: 'REG/22/007', stu_name: 'Vikram Joshi',      class_name: 'Class V',    registration_date: '16-Apr-2022', withdrawn_date: '18-Jan-2023', withdrawn_reason: 'Family Relocation', tc_issued_status: 'Issued'     },
      { registration_no: 'REG/22/008', stu_name: 'Sneha Yadav',       class_name: 'Class XII',  registration_date: '11-Apr-2022', withdrawn_date: '30-Mar-2023', withdrawn_reason: 'School Transfer',   tc_issued_status: 'Pending'    },
    ],
    '2023-24': [
      { registration_no: 'REG/23/001', stu_name: 'Arjun Tiwari',      class_name: 'Class IX',   registration_date: '10-Apr-2023', withdrawn_date: '15-Mar-2024', withdrawn_reason: 'Family Relocation', tc_issued_status: 'Issued'     },
      { registration_no: 'REG/23/002', stu_name: 'Divya Nair',        class_name: 'Class VII',  registration_date: '12-Apr-2023', withdrawn_date: '20-Feb-2024', withdrawn_reason: 'School Transfer',   tc_issued_status: 'Issued'     },
      { registration_no: 'REG/23/003', stu_name: 'Aditya Kumar',      class_name: 'Class XI',   registration_date: '08-Apr-2023', withdrawn_date: '10-Jan-2024', withdrawn_reason: 'Better Opportunity','tc_issued_status': 'Issued'   },
      { registration_no: 'REG/23/004', stu_name: 'Pooja Sharma',      class_name: 'Class VIII', registration_date: '15-Apr-2023', withdrawn_date: '25-Mar-2024', withdrawn_reason: 'Financial Issues',  tc_issued_status: 'Pending'    },
      { registration_no: 'REG/23/005', stu_name: 'Rahul Singh',       class_name: 'Class X',    registration_date: '09-Apr-2023', withdrawn_date: '18-Feb-2024', withdrawn_reason: 'Personal Reasons',  tc_issued_status: 'Issued'     },
      { registration_no: 'REG/23/006', stu_name: 'Meera Joshi',       class_name: 'Class VI',   registration_date: '11-Apr-2023', withdrawn_date: '08-Mar-2024', withdrawn_reason: 'Health Issues',     tc_issued_status: 'Not Issued' },
      { registration_no: 'REG/23/007', stu_name: 'Suresh Patel',      class_name: 'Class XII',  registration_date: '13-Apr-2023', withdrawn_date: '28-Mar-2024', withdrawn_reason: 'School Transfer',   tc_issued_status: 'Issued'     },
      { registration_no: 'REG/23/008', stu_name: 'Kavita Verma',      class_name: 'Class IV',   registration_date: '16-Apr-2023', withdrawn_date: '12-Jan-2024', withdrawn_reason: 'Family Relocation', tc_issued_status: 'Issued'     },
      { registration_no: 'REG/23/009', stu_name: 'Nikhil Gupta',      class_name: 'Class III',  registration_date: '17-Apr-2023', withdrawn_date: '22-Feb-2024', withdrawn_reason: 'Financial Issues',  tc_issued_status: 'Pending'    },
    ],
    '2024-25': [
      { registration_no: 'REG/24/001', stu_name: 'Ishaan Malhotra',   class_name: 'Class VIII', registration_date: '08-Apr-2024', withdrawn_date: '20-Mar-2025', withdrawn_reason: 'School Transfer',   tc_issued_status: 'Issued'     },
      { registration_no: 'REG/24/002', stu_name: 'Riya Chopra',       class_name: 'Class X',    registration_date: '10-Apr-2024', withdrawn_date: '15-Feb-2025', withdrawn_reason: 'Family Relocation', tc_issued_status: 'Issued'     },
      { registration_no: 'REG/24/003', stu_name: 'Sanjay Rao',        class_name: 'Class IX',   registration_date: '12-Apr-2024', withdrawn_date: '28-Jan-2025', withdrawn_reason: 'Better Opportunity','tc_issued_status': 'Issued'   },
      { registration_no: 'REG/24/004', stu_name: 'Tanya Mishra',      class_name: 'Class VII',  registration_date: '09-Apr-2024', withdrawn_date: '10-Mar-2025', withdrawn_reason: 'Health Issues',     tc_issued_status: 'Not Issued' },
      { registration_no: 'REG/24/005', stu_name: 'Akash Dubey',       class_name: 'Class XI',   registration_date: '11-Apr-2024', withdrawn_date: '05-Feb-2025', withdrawn_reason: 'Personal Reasons',  tc_issued_status: 'Pending'    },
      { registration_no: 'REG/24/006', stu_name: 'Nisha Agarwal',     class_name: 'Class VI',   registration_date: '14-Apr-2024', withdrawn_date: '18-Mar-2025', withdrawn_reason: 'Financial Issues',  tc_issued_status: 'Issued'     },
      { registration_no: 'REG/24/007', stu_name: 'Deepak Pandey',     class_name: 'Class XII',  registration_date: '15-Apr-2024', withdrawn_date: '25-Mar-2025', withdrawn_reason: 'School Transfer',   tc_issued_status: 'Pending'    },
      { registration_no: 'REG/24/008', stu_name: 'Anjali Saxena',     class_name: 'Class V',    registration_date: '16-Apr-2024', withdrawn_date: '08-Jan-2025', withdrawn_reason: 'Family Relocation', tc_issued_status: 'Issued'     },
      { registration_no: 'REG/24/009', stu_name: 'Mohit Srivastava',  class_name: 'Class II',   registration_date: '17-Apr-2024', withdrawn_date: '20-Feb-2025', withdrawn_reason: 'Personal Reasons',  tc_issued_status: 'Issued'     },
      { registration_no: 'REG/24/010', stu_name: 'Preeti Chauhan',    class_name: 'Class I',    registration_date: '18-Apr-2024', withdrawn_date: '15-Mar-2025', withdrawn_reason: 'School Transfer',   tc_issued_status: 'Not Issued' },
    ],
    '2025-26': [
      { registration_no: 'REG/25/001', stu_name: 'Vivek Rastogi',     class_name: 'Class IX',   registration_date: '07-Apr-2025', withdrawn_date: '12-Jan-2026', withdrawn_reason: 'Family Relocation', tc_issued_status: 'Issued'     },
      { registration_no: 'REG/25/002', stu_name: 'Simran Kaur',       class_name: 'Class XI',   registration_date: '09-Apr-2025', withdrawn_date: '28-Feb-2026', withdrawn_reason: 'Better Opportunity','tc_issued_status': 'Issued'   },
      { registration_no: 'REG/25/003', stu_name: 'Harsh Bajaj',       class_name: 'Class VII',  registration_date: '10-Apr-2025', withdrawn_date: '15-Mar-2026', withdrawn_reason: 'School Transfer',   tc_issued_status: 'Pending'    },
      { registration_no: 'REG/25/004', stu_name: 'Swati Goel',        class_name: 'Class VIII', registration_date: '11-Apr-2025', withdrawn_date: '20-Jan-2026', withdrawn_reason: 'Health Issues',     tc_issued_status: 'Not Issued' },
      { registration_no: 'REG/25/005', stu_name: 'Manish Khanna',     class_name: 'Class X',    registration_date: '12-Apr-2025', withdrawn_date: '05-Mar-2026', withdrawn_reason: 'Financial Issues',  tc_issued_status: 'Issued'     },
      { registration_no: 'REG/25/006', stu_name: 'Ritika Bose',       class_name: 'Class XII',  registration_date: '14-Apr-2025', withdrawn_date: '10-Apr-2026', withdrawn_reason: 'Personal Reasons',  tc_issued_status: 'Pending'    },
    ],
  }
  return base[session] || []
}

// ─── TC STATUS CONFIG ─────────────────────────────────────────────────────────
const TC_STATUS_CONFIG = {
  'Issued':     { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/20', icon: CheckCircle2, dot: 'bg-emerald-500' },
  'Pending':    { bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-400',     border: 'border-amber-200 dark:border-amber-500/20',     icon: Clock,         dot: 'bg-amber-500'   },
  'Not Issued': { bg: 'bg-rose-50 dark:bg-rose-500/10',       text: 'text-rose-700 dark:text-rose-400',       border: 'border-rose-200 dark:border-rose-500/20',       icon: XCircle,       dot: 'bg-rose-500'    },
}

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

// ─── TC STATUS BADGE ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = TC_STATUS_CONFIG[status] || TC_STATUS_CONFIG['Pending']
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
      {status}
    </span>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Transfer Certificate Report
      </p>
    </div>
  )
}

// ─── SUMMARY STATS ────────────────────────────────────────────────────────────
function SummaryBar({ rows }) {
  const total   = rows.length
  const issued  = rows.filter(r => r.tc_issued_status === 'Issued').length
  const pending = rows.filter(r => r.tc_issued_status === 'Pending').length
  const notIssued = rows.filter(r => r.tc_issued_status === 'Not Issued').length

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: 'Total Students',  value: total,      colorClass: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',       numClass: 'text-slate-800 dark:text-slate-100' },
        { label: 'TC Issued',        value: issued,     colorClass: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400', numClass: 'text-emerald-700 dark:text-emerald-400' },
        { label: 'TC Pending',       value: pending,    colorClass: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',       numClass: 'text-amber-700 dark:text-amber-400' },
        { label: 'Not Issued',       value: notIssued,  colorClass: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',           numClass: 'text-rose-700 dark:text-rose-400' },
      ].map(({ label, value, colorClass, numClass }) => (
        <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm">
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
            <FileText className="w-4 h-4" />
          </span>
          <div>
            <p className={`text-[22px] font-bold tabular-nums leading-tight ${numClass}`}>{value}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10 font-medium">{idx}</td>

      {/* Reg No */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg whitespace-nowrap">
          <Hash className="w-3 h-3 flex-shrink-0" />
          {row.registration_no}
        </span>
      </td>

      {/* Student Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            {row.stu_name.split(' ').map(n => n[0]).slice(0,2).join('')}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.stu_name}</span>
        </div>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg whitespace-nowrap">
          {row.class_name}
        </span>
      </td>

      {/* Reg Date */}
      <td className="px-4 py-3">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          {row.registration_date}
        </span>
      </td>

      {/* Withdrawn Date */}
      <td className="px-4 py-3">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 whitespace-nowrap">
          <Calendar className="w-3 h-3 flex-shrink-0 text-rose-400" />
          {row.withdrawn_date}
        </span>
      </td>

      {/* Withdrawn Reason */}
      <td className="px-4 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.withdrawn_reason}</span>
      </td>

      {/* TC Issued Status */}
      <td className="px-4 py-3 text-center">
        <StatusBadge status={row.tc_issued_status} />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = TC_STATUS_CONFIG[row.tc_issued_status] || TC_STATUS_CONFIG['Pending']

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm ${cfg.border} dark:border-[rgba(99,102,241,0.15)]`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
          {row.stu_name.split(' ').map(n => n[0]).slice(0,2).join('')}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.stu_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Hash className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{row.registration_no}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="text-blue-500 dark:text-blue-400 font-semibold">{row.class_name}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={row.tc_issued_status} />
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Quick info strip */}
      <div className="px-4 pb-3 flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500">
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-emerald-500" />
          Reg: <span className="text-slate-600 dark:text-slate-300 font-medium ml-0.5">{row.registration_date}</span>
        </span>
        <span className="text-slate-200 dark:text-slate-700">|</span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-rose-400" />
          Left: <span className="text-slate-600 dark:text-slate-300 font-medium ml-0.5">{row.withdrawn_date}</span>
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-[#1e2238] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Registration Date</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-emerald-500 flex-shrink-0" />{row.registration_date}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-[#1e2238] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Withdrawn Date</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-3 h-3 text-rose-400 flex-shrink-0" />{row.withdrawn_date}
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-500/[0.07] border border-amber-100 dark:border-amber-500/20 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">Withdrawn Reason</p>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.withdrawn_reason}</p>
          </div>

          <div className={`rounded-xl border p-3 ${cfg.bg} ${cfg.border}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wide mb-1 ${cfg.text}`}>TC Issued Status</p>
            <StatusBadge status={row.tc_issued_status} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, onShow, loading, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Session</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
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
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TCReport() {
  const [session,      setSession]      = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setStatusFilter('')

    setTimeout(() => {
      const data = generateTCData(session)
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} TC records for session ${session}.`)
    }, 650)
  }, [session])

  const handleReset = () => {
    setSession(''); setRows([]); setSearch('')
    setStatusFilter(''); setErrors({}); setShown(false); setShownSession('')
  }

  // ── Excel Export placeholder ──────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = rows
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r =>
        r.stu_name.toLowerCase().includes(q) ||
        r.registration_no.toLowerCase().includes(q) ||
        r.class_name.toLowerCase().includes(q) ||
        r.withdrawn_reason.toLowerCase().includes(q)
      )
    }
    if (statusFilter) {
      data = data.filter(r => r.tc_issued_status === statusFilter)
    }
    return data
  }, [rows, search, statusFilter])

  const hasResults   = shown && rows.length > 0
  const activeFilters = session ? 1 : 0

  // ── Status filter tabs ────────────────────────────────────────────────────
  const STATUS_TABS = ['', 'Issued', 'Pending', 'Not Issued']
  const statusCounts = useMemo(() => ({
    '':           rows.length,
    'Issued':     rows.filter(r => r.tc_issued_status === 'Issued').length,
    'Pending':    rows.filter(r => r.tc_issued_status === 'Pending').length,
    'Not Issued': rows.filter(r => r.tc_issued_status === 'Not Issued').length,
  }), [rows])

  return (
    <div className="space-y-4 pb-10">
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}
      `}</style>

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Transfer Certificate Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Session-wise TC report — withdrawn students and certificate issuance status.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
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
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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

            {/* Spacers */}
            <div /><div />

            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
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

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
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
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
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
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} />

          {/* Summary Bar */}
          <SummaryBar rows={rows} />

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">TC Records</span>
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
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, reg no, class…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] overflow-x-auto scrollbar-none">
              {STATUS_TABS.map(tab => {
                const isActive = statusFilter === tab
                const label = tab === '' ? 'All' : tab
                const count = statusCounts[tab]
                const tabCfg = tab === '' ? null : TC_STATUS_CONFIG[tab]
                return (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all flex-shrink-0
                      ${isActive
                        ? 'bg-blue-600 text-white dark:bg-indigo-600 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    {tabCfg && !isActive && (
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tabCfg.dot}`} />
                    )}
                    {label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your filter.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Reg No', 'Student Name', 'Class', 'Reg Date', 'Withdrawn Date', 'Withdrawn Reason', 'TC Status'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.registration_no} row={row} idx={i + 1} />
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
                  <span className="text-[13px]">No records match your filter.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <UserMinus className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full details.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={row.registration_no} row={row} idx={i + 1} />
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
              {(search || statusFilter) && (
                <button
                  onClick={() => { setSearch(''); setStatusFilter('') }}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to generate the TC report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
