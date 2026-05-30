/**
 * StudentRegistrationDetails.jsx
 * Folder: src/pages/Student/Reports/StudentRegistrationDetails.jsx
 *
 * Converts legacy ASPX "Student Registration Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Form No, Registration Date, Student Name, Father Name, Mother Name,
 *          Address, Class, Mobile No, Registration Fee
 * Features:
 *  - Session + Class + Registration Date filters
 *  - Show report button + Excel export
 *  - School name / session header in report
 *  - Total registration fee footer
 *  - Mobile: expandable cards
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, Users, FileSpreadsheet, Search,
  BarChart3, BookOpen, Building2, MapPin, TrendingUp,
  SlidersHorizontal, Info, Phone, Home, User, GraduationCap,
  CalendarDays, BadgeIndianRupee, UserCheck, FileText
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'All Classes', 'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const REGISTRATION_DATA = [
  { form_no: 'FRM-001', registration_date: '05 Apr 2025', name: 'Aarav Sharma', father_name: 'Rajesh Sharma', mother_name: 'Sunita Sharma', address: '12, Rajpur Road, Dehradun', class_name: 'Class I', mobile: '9876543210', reg_fee: 500, session: '2025-26' },
  { form_no: 'FRM-002', registration_date: '06 Apr 2025', name: 'Priya Singh', father_name: 'Amit Singh', mother_name: 'Rekha Singh', address: '45, Balliwala, Dehradun', class_name: 'Class II', mobile: '9812345678', reg_fee: 500, session: '2025-26' },
  { form_no: 'FRM-003', registration_date: '06 Apr 2025', name: 'Rohan Gupta', father_name: 'Suresh Gupta', mother_name: 'Meena Gupta', address: '7, Raipur Road, Dehradun', class_name: 'Nursery', mobile: '9988776655', reg_fee: 400, session: '2025-26' },
  { form_no: 'FRM-004', registration_date: '07 Apr 2025', name: 'Sneha Verma', father_name: 'Pawan Verma', mother_name: 'Anita Verma', address: '88, Dharampur, Dehradun', class_name: 'Class III', mobile: '9870001234', reg_fee: 500, session: '2025-26' },
  { form_no: 'FRM-005', registration_date: '07 Apr 2025', name: 'Karan Rawat', father_name: 'Dinesh Rawat', mother_name: 'Kavita Rawat', address: '23, Turner Road, Dehradun', class_name: 'Class VI', mobile: '9654321098', reg_fee: 600, session: '2025-26' },
  { form_no: 'FRM-006', registration_date: '08 Apr 2025', name: 'Ananya Joshi', father_name: 'Mahesh Joshi', mother_name: 'Pooja Joshi', address: '3, Canal Road, Dehradun', class_name: 'LKG', mobile: '9712345678', reg_fee: 400, session: '2025-26' },
  { form_no: 'FRM-007', registration_date: '08 Apr 2025', name: 'Vivek Kumar', father_name: 'Rakesh Kumar', mother_name: 'Savita Kumar', address: '56, Patel Nagar, Dehradun', class_name: 'Class IX', mobile: '9823456789', reg_fee: 700, session: '2025-26' },
  { form_no: 'FRM-008', registration_date: '09 Apr 2025', name: 'Riya Bisht', father_name: 'Mohan Bisht', mother_name: 'Kamla Bisht', address: '19, Dispensary Road, Dehradun', class_name: 'Class IV', mobile: '9934567890', reg_fee: 500, session: '2025-26' },
  { form_no: 'FRM-009', registration_date: '09 Apr 2025', name: 'Harsh Negi', father_name: 'Govind Negi', mother_name: 'Leela Negi', address: '77, Saharanpur Road, Dehradun', class_name: 'Class XI', mobile: '9045678901', reg_fee: 800, session: '2025-26' },
  { form_no: 'FRM-010', registration_date: '10 Apr 2025', name: 'Pooja Chauhan', father_name: 'Naresh Chauhan', mother_name: 'Geeta Chauhan', address: '31, Old Survey Road, Dehradun', class_name: 'UKG', mobile: '9156789012', reg_fee: 400, session: '2025-26' },
  { form_no: 'FRM-011', registration_date: '10 Apr 2025', name: 'Akash Thakur', father_name: 'Vijay Thakur', mother_name: 'Usha Thakur', address: '62, Krishna Nagar, Dehradun', class_name: 'Class VII', mobile: '9267890123', reg_fee: 600, session: '2025-26' },
  { form_no: 'FRM-012', registration_date: '11 Apr 2025', name: 'Divya Pandey', father_name: 'Arun Pandey', mother_name: 'Shobha Pandey', address: '14, Jakhan, Dehradun', class_name: 'Class XII', mobile: '9378901234', reg_fee: 800, session: '2025-26' },
  { form_no: 'FRM-013', registration_date: '11 Apr 2025', name: 'Nikhil Arora', father_name: 'Sanjeev Arora', mother_name: 'Renu Arora', address: '41, Race Course, Dehradun', class_name: 'Class X', mobile: '9489012345', reg_fee: 700, session: '2025-26' },
  { form_no: 'FRM-014', registration_date: '12 Apr 2025', name: 'Sakshi Mishra', father_name: 'Deepak Mishra', mother_name: 'Nirmala Mishra', address: '8, Saket Colony, Dehradun', class_name: 'Class V', mobile: '9590123456', reg_fee: 500, session: '2025-26' },
  { form_no: 'FRM-015', registration_date: '12 Apr 2025', name: 'Tarun Bhandari', father_name: 'Ramesh Bhandari', mother_name: 'Pushpa Bhandari', address: '99, Shimla Road, Dehradun', class_name: 'Class VIII', mobile: '9601234567', reg_fee: 600, session: '2025-26' },
  // 2024-25 data
  { form_no: 'FRM-101', registration_date: '03 Apr 2024', name: 'Sumit Rathore', father_name: 'Prakash Rathore', mother_name: 'Sarla Rathore', address: '5, Haridwar Road, Dehradun', class_name: 'Class I', mobile: '9711111111', reg_fee: 500, session: '2024-25' },
  { form_no: 'FRM-102', registration_date: '04 Apr 2024', name: 'Neha Tomar', father_name: 'Bharat Tomar', mother_name: 'Sunita Tomar', address: '33, Vasant Vihar, Dehradun', class_name: 'Class VI', mobile: '9722222222', reg_fee: 600, session: '2024-25' },
  { form_no: 'FRM-103', registration_date: '05 Apr 2024', name: 'Ritesh Yadav', father_name: 'Ramkumar Yadav', mother_name: 'Seema Yadav', address: '72, New Road, Dehradun', class_name: 'Nursery', mobile: '9733333333', reg_fee: 400, session: '2024-25' },
  { form_no: 'FRM-104', registration_date: '06 Apr 2024', name: 'Priyanka Dubey', father_name: 'Ashok Dubey', mother_name: 'Manju Dubey', address: '28, Indira Nagar, Dehradun', class_name: 'Class IX', mobile: '9744444444', reg_fee: 700, session: '2024-25' },
  { form_no: 'FRM-105', registration_date: '07 Apr 2024', name: 'Amit Saxena', father_name: 'Ravi Saxena', mother_name: 'Priya Saxena', address: '16, Sahastradhara Road, Dehradun', class_name: 'Class XII', mobile: '9755555555', reg_fee: 800, session: '2024-25' },
]

// ─── CLASS COLOR HELPERS (same as StrengthReport) ─────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── PRIMITIVE COMPONENTS (reused from StrengthReport style) ─────────────────

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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, prefix }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, selectedClass, regDate }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </span>
        {selectedClass && selectedClass !== 'All Classes' && (
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
            <GraduationCap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">{selectedClass}</span>
          </span>
        )}
        {regDate && (
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25">
            <CalendarDays className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">{regDate}</span>
          </span>
        )}
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Student Registration Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  const { fg, bg } = classColor(row.class_name)

  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-3 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
        <td className="px-3 py-3" colSpan={8}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Total ({row.count} Students)
          </span>
        </td>
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center gap-1 px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">
            ₹{row.reg_fee.toLocaleString()}
          </span>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Form No */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[12px] font-bold text-slate-600 dark:text-slate-300">
          <FileText className="w-3 h-3" />{row.form_no}
        </span>
      </td>

      {/* Reg Date */}
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
        <span className="flex items-center gap-1.5">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {row.registration_date}
        </span>
      </td>

      {/* Student Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {row.name.charAt(0)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Father Name */}
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.father_name}</td>

      {/* Mother Name */}
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.mother_name}</td>

      {/* Address */}
      <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400 max-w-[160px]">
        <span className="line-clamp-1">{row.address}</span>
      </td>

      {/* Class */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.class_name)}
          </span>
          <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.class_name}</span>
        </div>
      </td>

      {/* Mobile */}
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
        <span className="flex items-center gap-1.5">
          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
          {row.mobile}
        </span>
      </td>

      {/* Reg Fee */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
          ₹{row.reg_fee}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class_name)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Always-visible header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[14px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {row.name.charAt(0)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold"
              style={{ background: bg, color: fg }}
            >
              {row.class_name}
            </span>
            <span className="text-[11px] text-slate-400">{row.form_no}</span>
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 mr-1">
          <span className="text-[16px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">₹{row.reg_fee}</span>
          <span className="text-[10px] text-slate-400">reg fee</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Subtle date strip */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <CalendarDays className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
        <span className="text-[11px] text-slate-400 dark:text-slate-500">Reg. Date: <span className="font-semibold text-slate-600 dark:text-slate-300">{row.registration_date}</span></span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Parent info */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500 dark:text-blue-400 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Father
              </p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{row.father_name}</p>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500 dark:text-violet-400 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Mother
              </p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{row.mother_name}</p>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3 flex items-start gap-2">
            <Home className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">{row.address}</p>
          </div>

          {/* Mobile */}
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 flex items-center gap-2">
            <Phone className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.mobile}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, selectedClass, setSelectedClass, regDate, setRegDate, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
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
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class">
            <NativeSelect value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Registration Date">
            <div className="relative">
              <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="date"
                value={regDate}
                onChange={e => setRegDate(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none transition-all
                  bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400"
              />
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
export default function StudentRegistrationDetails() {
  // Filter state
  const [session,       setSession]       = useState('')
  const [selectedClass, setSelectedClass] = useState('All Classes')
  const [regDate,       setRegDate]       = useState('')

  // Report state
  const [rows,          setRows]          = useState([])
  const [loading,       setLoading]       = useState(false)
  const [exporting,     setExporting]     = useState(false)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [search,        setSearch]        = useState('')
  const [errors,        setErrors]        = useState({})
  const [toast,         setToast]         = useState(null)
  const [shown,         setShown]         = useState(false)
  const [shownFilters,  setShownFilters]  = useState({})

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
      let data = REGISTRATION_DATA.filter(r => r.session === session)

      if (selectedClass && selectedClass !== 'All Classes') {
        data = data.filter(r => r.class_name === selectedClass)
      }

      // regDate filter — match against YYYY-MM-DD vs stored "dd MMM yyyy"
      if (regDate) {
        const d = new Date(regDate)
        const formatted = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
        data = data.filter(r => r.registration_date === formatted)
      }

      setRows(data)
      setShownFilters({ session, selectedClass, regDate })
      setShown(true)
      setLoading(false)
      if (data.length === 0) {
        showToast('No records found for selected filters.', 'error')
      } else {
        showToast(`${data.length} student(s) found for session ${session}.`)
      }
    }, 700)
  }, [session, selectedClass, regDate])

  const handleReset = () => {
    setSession(''); setSelectedClass('All Classes'); setRegDate('')
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownFilters({})
  }

  // ── Excel Export placeholder ─────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Live search filter ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.form_no.toLowerCase().includes(q) ||
      r.father_name.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.mobile.includes(q)
    )
  }, [rows, search])

  // ── Totals ───────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    count: filtered.length,
    reg_fee: filtered.reduce((s, r) => s + r.reg_fee, 0),
  }), [filtered])

  const hasResults = shown && rows.length > 0
  const activeFilters = [session, selectedClass !== 'All Classes' ? selectedClass : '', regDate].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Student Registration Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View registration details — form no, date, student &amp; parent info, class, mobile, fee.
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

      {/* ── DESKTOP Filter Card ───────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
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

            {/* Class */}
            <Field label="Class">
              <NativeSelect value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Registration Date */}
            <Field label="Registration Date">
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={regDate}
                  onChange={e => setRegDate(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none transition-all
                    bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400"
                />
              </div>
            </Field>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Set Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        regDate={regDate}
        setRegDate={setRegDate}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={shownFilters.session}
            selectedClass={shownFilters.selectedClass}
            regDate={shownFilters.regDate}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SummaryCard icon={Users}              label="Total Students"       value={totals.count}   color="blue"    />
            <SummaryCard icon={BadgeIndianRupee}   label="Total Reg. Fee"       value={totals.reg_fee} color="emerald" prefix="₹" />
            <SummaryCard icon={GraduationCap}      label="Classes Covered"
              value={[...new Set(filtered.map(r => r.class_name))].length}
              color="violet"
            />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Registration Records</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownFilters.session}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, form, mobile…"
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

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Showing registration data for all admitted students. Use search to find a specific student.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Form No.', 'Reg. Date', 'Student Name', 'Father Name', 'Mother Name', 'Address', 'Class', 'Mobile', 'Reg. Fee'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.form_no} row={row} idx={i + 1} />
                    ))}
                    {/* Total row */}
                    <DesktopRow row={totals} idx={0} isTotal />
                  </tbody>
                </table>
              )}
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
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see parent &amp; address details.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={row.form_no} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Total Card */}
                  <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-3 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.count}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-3 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">₹{totals.reg_fee.toLocaleString()}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Total Reg. Fee</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to generate the registration report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
