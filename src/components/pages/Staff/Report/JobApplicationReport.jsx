/**
 * JobApplicationReport.jsx
 * Converts legacy ASPX "Job Application Report" to fully-responsive React + Tailwind.
 *
 * Filters: Applied Post, Subject, Month
 * Actions: Show Report, Excel Export
 * Columns: S.No, Resume, Vacancy Form, Documents, Reg No, Full Name,
 *           Mobile, Email, City, State, Applied Post, Department,
 *           App Status, App Date, Fee Payment Date, Settlement Date,
 *           Settlement Amount, Order ID, Transaction No
 * Mobile: Smart card layout with expandable details + bottom-drawer filters
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Search,
  FileSpreadsheet, Download, ExternalLink, FileText,
  User, Phone, Mail, MapPin, Building2, Calendar,
  CreditCard, Hash, Receipt, Briefcase, BookOpen,
  TrendingUp, BarChart3, Info, CheckCircle, Clock,
  GraduationCap, Users, ChevronUp, MoreHorizontal
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const APPLIED_POSTS = ['PGT', 'TGT', 'PRT', 'Non Teaching']

const SUBJECTS_BY_POST = {
  PGT: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Hindi', 'History', 'Geography', 'Economics', 'Computer Science'],
  TGT: ['Science', 'Mathematics', 'Social Studies', 'English', 'Hindi', 'Sanskrit'],
  PRT: ['General (PRT)', 'Hindi', 'English', 'Drawing', 'Music', 'Physical Education'],
  'Non Teaching': ['Accountant', 'Clerk', 'Lab Assistant', 'Librarian', 'Office Staff', 'Security', 'Peon'],
  '': [],
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const DUMMY_DATA = [
  {
    ApplicationID: 'APP001', registrationno: 'REG2025001', FullName: 'Rajesh Kumar Sharma',
    MobileNumber: '9876543210', Email: 'rajesh.sharma@email.com', City: 'Delhi', State: 'Delhi',
    AppliedPost: 'PGT', Department: 'Physics', ApplicationStatus: 'Complete',
    DateOfApplication: '05-Jan-2025', FeePaymentDate: '05-Jan-2025',
    settlementDate: '07-Jan-2025', RegistrationFees: '₹500', orderId: 'ORD20250001',
    FeeTransactionID: 'TXN8876543210', ResumePath: 'https://example.com/resume1.pdf',
  },
  {
    ApplicationID: 'APP002', registrationno: 'REG2025002', FullName: 'Priya Singh',
    MobileNumber: '9988776655', Email: 'priya.singh@email.com', City: 'Noida', State: 'Uttar Pradesh',
    AppliedPost: 'TGT', Department: 'Mathematics', ApplicationStatus: 'Complete',
    DateOfApplication: '08-Jan-2025', FeePaymentDate: '08-Jan-2025',
    settlementDate: '10-Jan-2025', RegistrationFees: '₹400', orderId: 'ORD20250002',
    FeeTransactionID: 'TXN9988776655', ResumePath: 'https://example.com/resume2.pdf',
  },
  {
    ApplicationID: 'APP003', registrationno: 'REG2025003', FullName: 'Amit Verma',
    MobileNumber: '9765432109', Email: 'amit.verma@email.com', City: 'Gurgaon', State: 'Haryana',
    AppliedPost: 'PRT', Department: 'General (PRT)', ApplicationStatus: 'Pending',
    DateOfApplication: '12-Jan-2025', FeePaymentDate: '',
    settlementDate: '', RegistrationFees: '', orderId: '',
    FeeTransactionID: '', ResumePath: '',
  },
  {
    ApplicationID: 'APP004', registrationno: 'REG2025004', FullName: 'Sunita Devi',
    MobileNumber: '9654321098', Email: 'sunita.devi@email.com', City: 'Dehradun', State: 'Uttarakhand',
    AppliedPost: 'PGT', Department: 'Chemistry', ApplicationStatus: 'Complete',
    DateOfApplication: '15-Jan-2025', FeePaymentDate: '15-Jan-2025',
    settlementDate: '17-Jan-2025', RegistrationFees: '₹500', orderId: 'ORD20250004',
    FeeTransactionID: 'TXN9654321098', ResumePath: 'https://example.com/resume4.pdf',
  },
  {
    ApplicationID: 'APP005', registrationno: 'REG2025005', FullName: 'Mohammed Arif',
    MobileNumber: '9543210987', Email: 'arif.m@email.com', City: 'Lucknow', State: 'Uttar Pradesh',
    AppliedPost: 'Non Teaching', Department: 'Accountant', ApplicationStatus: 'Complete',
    DateOfApplication: '18-Jan-2025', FeePaymentDate: '18-Jan-2025',
    settlementDate: '20-Jan-2025', RegistrationFees: '₹300', orderId: 'ORD20250005',
    FeeTransactionID: 'TXN9543210987', ResumePath: 'https://example.com/resume5.pdf',
  },
  {
    ApplicationID: 'APP006', registrationno: 'REG2025006', FullName: 'Kavita Joshi',
    MobileNumber: '9432109876', Email: 'kavita.j@email.com', City: 'Meerut', State: 'Uttar Pradesh',
    AppliedPost: 'TGT', Department: 'English', ApplicationStatus: 'Pending',
    DateOfApplication: '20-Jan-2025', FeePaymentDate: '',
    settlementDate: '', RegistrationFees: '', orderId: '',
    FeeTransactionID: '', ResumePath: 'https://example.com/resume6.pdf',
  },
  {
    ApplicationID: 'APP007', registrationno: 'REG2025007', FullName: 'Deepak Negi',
    MobileNumber: '9321098765', Email: 'deepak.negi@email.com', City: 'Rishikesh', State: 'Uttarakhand',
    AppliedPost: 'PGT', Department: 'Biology', ApplicationStatus: 'Complete',
    DateOfApplication: '22-Feb-2025', FeePaymentDate: '22-Feb-2025',
    settlementDate: '24-Feb-2025', RegistrationFees: '₹500', orderId: 'ORD20250007',
    FeeTransactionID: 'TXN9321098765', ResumePath: 'https://example.com/resume7.pdf',
  },
  {
    ApplicationID: 'APP008', registrationno: 'REG2025008', FullName: 'Anita Rawat',
    MobileNumber: '9210987654', Email: 'anita.rawat@email.com', City: 'Haridwar', State: 'Uttarakhand',
    AppliedPost: 'PRT', Department: 'Hindi', ApplicationStatus: 'Complete',
    DateOfApplication: '25-Feb-2025', FeePaymentDate: '25-Feb-2025',
    settlementDate: '27-Feb-2025', RegistrationFees: '₹400', orderId: 'ORD20250008',
    FeeTransactionID: 'TXN9210987654', ResumePath: '',
  },
  {
    ApplicationID: 'APP009', registrationno: 'REG2025009', FullName: 'Suresh Pandey',
    MobileNumber: '9109876543', Email: 'suresh.pandey@email.com', City: 'Agra', State: 'Uttar Pradesh',
    AppliedPost: 'TGT', Department: 'Social Studies', ApplicationStatus: 'Pending',
    DateOfApplication: '01-Mar-2025', FeePaymentDate: '',
    settlementDate: '', RegistrationFees: '', orderId: '',
    FeeTransactionID: '', ResumePath: 'https://example.com/resume9.pdf',
  },
  {
    ApplicationID: 'APP010', registrationno: 'REG2025010', FullName: 'Pooja Chauhan',
    MobileNumber: '9098765432', Email: 'pooja.c@email.com', City: 'Chandigarh', State: 'Punjab',
    AppliedPost: 'PGT', Department: 'Computer Science', ApplicationStatus: 'Complete',
    DateOfApplication: '05-Mar-2025', FeePaymentDate: '05-Mar-2025',
    settlementDate: '07-Mar-2025', RegistrationFees: '₹500', orderId: 'ORD20250010',
    FeeTransactionID: 'TXN9098765432', ResumePath: 'https://example.com/resume10.pdf',
  },
  {
    ApplicationID: 'APP011', registrationno: 'REG2025011', FullName: 'Vikram Singh Rawat',
    MobileNumber: '8998765432', Email: 'vikram.rawat@email.com', City: 'Jaipur', State: 'Rajasthan',
    AppliedPost: 'Non Teaching', Department: 'Clerk', ApplicationStatus: 'Complete',
    DateOfApplication: '10-Mar-2025', FeePaymentDate: '10-Mar-2025',
    settlementDate: '12-Mar-2025', RegistrationFees: '₹300', orderId: 'ORD20250011',
    FeeTransactionID: 'TXN8998765432', ResumePath: 'https://example.com/resume11.pdf',
  },
  {
    ApplicationID: 'APP012', registrationno: 'REG2025012', FullName: 'Reena Gupta',
    MobileNumber: '8887654321', Email: 'reena.g@email.com', City: 'Varanasi', State: 'Uttar Pradesh',
    AppliedPost: 'PGT', Department: 'History', ApplicationStatus: 'Pending',
    DateOfApplication: '14-Mar-2025', FeePaymentDate: '',
    settlementDate: '', RegistrationFees: '', orderId: '',
    FeeTransactionID: '', ResumePath: '',
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const POST_CONFIG = {
  PGT:            { color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',    dot: 'bg-blue-500' },
  TGT:            { color: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400', dot: 'bg-violet-500' },
  PRT:            { color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',    dot: 'bg-cyan-500' },
  'Non Teaching': { color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', dot: 'bg-amber-500' },
}

const getPostConfig = (post) => POST_CONFIG[post] || { color: 'bg-slate-100 text-slate-700', dot: 'bg-slate-400' }

const getMonthFromDate = (dateStr) => {
  if (!dateStr) return ''
  const parts = dateStr.split('-')
  if (parts.length < 2) return ''
  return parts[1]
}

const MONTH_MAP = {
  Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April',
  May: 'May', Jun: 'June', Jul: 'July', Aug: 'August',
  Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December',
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
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
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

function Field({ label, children, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3
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

function StatusBadge({ status }) {
  const isComplete = status === 'Complete'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold
      ${isComplete
        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'}`}>
      {isComplete ? <CheckCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
      {status || '—'}
    </span>
  )
}

function PostBadge({ post }) {
  const cfg = getPostConfig(post)
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold ${cfg.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} flex-shrink-0`} />
      {post || '—'}
    </span>
  )
}

function SummaryCard({ icon: Icon, label, value, color }) {
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
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────

function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = getPostConfig(row.AppliedPost)
  const isComplete = row.ApplicationStatus === 'Complete'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <span className="text-[13px] font-bold text-white">
            {row.FullName?.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.FullName}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">#{row.registrationno}</p>
            </div>
            <StatusBadge status={row.ApplicationStatus} />
          </div>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <PostBadge post={row.AppliedPost} />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {row.Department}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Phone className="w-3 h-3" />{row.MobileNumber}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <MapPin className="w-3 h-3" />{row.City}
            </span>
          </div>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 mt-1 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Quick action buttons */}
      <div className="flex items-center gap-2 px-4 pb-3 -mt-1">
        {row.ResumePath && (
          <a href={row.ResumePath} target="_blank" rel="noreferrer"
            onClick={e => e.stopPropagation()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
              bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20">
            <ExternalLink className="w-3 h-3" /> Resume
          </a>
        )}
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
          bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
          <Download className="w-3 h-3" /> Form
        </button>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
          bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
          <FileText className="w-3 h-3" /> Docs
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          {/* Contact info */}
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Contact & Location</p>
          <div className="grid grid-cols-1 gap-2 mb-4">
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.03]">
              <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-[12px] text-slate-700 dark:text-slate-300 truncate">{row.Email}</span>
            </div>
            <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.03]">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-[12px] text-slate-700 dark:text-slate-300">{row.City}, {row.State}</span>
            </div>
          </div>

          {/* Payment info — only if complete */}
          {isComplete && (
            <>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Payment Details</p>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold mb-0.5">Amount</p>
                  <p className="text-[15px] font-bold text-emerald-700 dark:text-emerald-300">{row.RegistrationFees || '—'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                  <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mb-0.5">Pay Date</p>
                  <p className="text-[12px] font-bold text-blue-700 dark:text-blue-300">{row.FeePaymentDate || '—'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] col-span-2">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Order ID</p>
                  <p className="text-[12px] font-mono font-semibold text-slate-700 dark:text-slate-300">{row.orderId || '—'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-white/[0.03] col-span-2">
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold mb-0.5">Transaction ID</p>
                  <p className="text-[12px] font-mono font-semibold text-slate-700 dark:text-slate-300 truncate">{row.FeeTransactionID || '—'}</p>
                </div>
              </div>

              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">Settlement</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mb-0.5">Settlement Date</p>
                  <p className="text-[12px] font-bold text-amber-700 dark:text-amber-300">{row.settlementDate || '—'}</p>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                  <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold mb-0.5">App Date</p>
                  <p className="text-[12px] font-bold text-amber-700 dark:text-amber-300">{row.DateOfApplication || '—'}</p>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 tabular-nums">{idx}</td>

      {/* Resume */}
      <td className="px-3 py-2.5 text-center">
        {row.ResumePath ? (
          <a href={row.ResumePath} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold
              bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 transition-colors">
            <ExternalLink className="w-3 h-3" /> View
          </a>
        ) : <span className="text-[11px] text-slate-300 dark:text-slate-700">—</span>}
      </td>

      {/* Vacancy Form */}
      <td className="px-3 py-2.5 text-center">
        <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold
          bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 hover:bg-violet-100 transition-colors">
          <Download className="w-3 h-3" /> Download
        </button>
      </td>

      {/* Documents */}
      <td className="px-3 py-2.5 text-center">
        <button className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold
          bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 transition-colors">
          <FileText className="w-3 h-3" /> Download
        </button>
      </td>

      {/* Registration No */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono text-slate-600 dark:text-slate-300">{row.registrationno}</span>
      </td>

      {/* Full Name */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-bold text-white">
              {row.FullName?.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </span>
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.FullName}</span>
        </div>
      </td>

      {/* Mobile */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 tabular-nums">{row.MobileNumber}</span>
      </td>

      {/* Email */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 truncate max-w-[160px] block">{row.Email}</span>
      </td>

      {/* City */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-300">{row.City}</span>
      </td>

      {/* State */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.State}</span>
      </td>

      {/* Applied Post */}
      <td className="px-3 py-2.5">
        <PostBadge post={row.AppliedPost} />
      </td>

      {/* Department */}
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {row.Department}
        </span>
      </td>

      {/* Status */}
      <td className="px-3 py-2.5">
        <StatusBadge status={row.ApplicationStatus} />
      </td>

      {/* App Date */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">{row.DateOfApplication || '—'}</span>
      </td>

      {/* Fee Payment Date */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">{row.FeePaymentDate || '—'}</span>
      </td>

      {/* Settlement Date */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">{row.settlementDate || '—'}</span>
      </td>

      {/* Settlement Amount */}
      <td className="px-3 py-2.5 text-center">
        <span className={`text-[12px] font-semibold tabular-nums ${row.RegistrationFees ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-700'}`}>
          {row.RegistrationFees || '—'}
        </span>
      </td>

      {/* Order ID */}
      <td className="px-3 py-2.5">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{row.orderId || '—'}</span>
      </td>

      {/* Transaction No */}
      <td className="px-3 py-2.5">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{row.FeeTransactionID || '—'}</span>
      </td>
    </tr>
  )
}

// ─── FILTER DRAWER (Mobile) ───────────────────────────────────────────────────

function FilterDrawer({ open, onClose, appliedPost, setAppliedPost, subject, setSubject, month, setMonth, onShow, onReset, loading, errors }) {
  const subjects = SUBJECTS_BY_POST[appliedPost] || []

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[80vh] overflow-y-auto"
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
        <div className="px-5 py-5 space-y-4">
          <Field label="Applied Post">
            <NativeSelect value={appliedPost} onChange={e => { setAppliedPost(e.target.value); setSubject('') }} placeholder="-- Select All --">
              {APPLIED_POSTS.map(p => <option key={p} value={p}>{p}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subject">
            <NativeSelect value={subject} onChange={e => setSubject(e.target.value)} placeholder="-- Select All --" disabled={!appliedPost}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Month">
            <NativeSelect value={month} onChange={e => setMonth(e.target.value)} placeholder="-- Select All --">
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={() => { onReset(); onClose() }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
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

export default function JobApplicationReport() {
  const [appliedPost, setAppliedPost] = useState('')
  const [subject,     setSubject]     = useState('')
  const [month,       setMonth]       = useState('')
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)

  const subjects = SUBJECTS_BY_POST[appliedPost] || []

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Show Report ────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = [...DUMMY_DATA]

      if (appliedPost) data = data.filter(r => r.AppliedPost === appliedPost)
      if (subject)     data = data.filter(r => r.Department === subject)
      if (month)       data = data.filter(r => {
        const m = getMonthFromDate(r.DateOfApplication)
        return MONTH_MAP[m] === month
      })

      setRows(data)
      setShown(true)
      setLoading(false)
      showToast(`Found ${data.length} application${data.length !== 1 ? 's' : ''}.`)
    }, 700)
  }, [appliedPost, subject, month])

  const handleReset = () => {
    setAppliedPost(''); setSubject(''); setMonth('')
    setRows([]); setSearch(''); setErrors({}); setShown(false)
  }

  // ── Excel Export ──────────────────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.FullName?.toLowerCase().includes(q) ||
      r.registrationno?.toLowerCase().includes(q) ||
      r.Email?.toLowerCase().includes(q) ||
      r.MobileNumber?.includes(q) ||
      r.City?.toLowerCase().includes(q) ||
      r.Department?.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    filtered.length,
    complete: filtered.filter(r => r.ApplicationStatus === 'Complete').length,
    pending:  filtered.filter(r => r.ApplicationStatus === 'Pending').length,
    withResume: filtered.filter(r => r.ResumePath).length,
  }), [filtered])

  const hasResults   = shown && rows.length > 0
  const activeCount  = [appliedPost, subject, month].filter(Boolean).length

  // ─── TABLE HEADERS ────────────────────────────────────────────────────────
  const TABLE_HEADERS = [
    'S.No.', 'Resume', 'Vacancy Form', 'Documents', 'Reg No',
    'Full Name', 'Mobile', 'Email', 'City', 'State',
    'Applied Post', 'Department', 'Status', 'App Date',
    'Fee Pay Date', 'Settlement Date', 'Amount', 'Order ID', 'Transaction No',
  ]

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Job Application Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage and review all job applications — filter by post, subject &amp; month.
          </p>
        </div>

        {/* Desktop Excel button */}
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
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
          {activeCount > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {activeCount} active
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Applied Post */}
            <Field label="Applied Post">
              <NativeSelect value={appliedPost} onChange={e => { setAppliedPost(e.target.value); setSubject('') }} placeholder="-- Select All --">
                {APPLIED_POSTS.map(p => <option key={p} value={p}>{p}</option>)}
              </NativeSelect>
            </Field>

            {/* Subject */}
            <Field label="Subject">
              <NativeSelect value={subject} onChange={e => setSubject(e.target.value)} placeholder="-- Select All --" disabled={!appliedPost}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Month */}
            <Field label="Month">
              <NativeSelect value={month} onChange={e => setMonth(e.target.value)} placeholder="-- Select All --">
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </NativeSelect>
            </Field>

            {/* Actions */}
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
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                title="Reset">
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
          {activeCount > 0 ? `${activeCount} Filter${activeCount > 1 ? 's' : ''} Active` : 'Filters'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
          )}
        </button>
        <button type="button" onClick={handleShow} disabled={loading}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-800 text-white dark:bg-indigo-800 disabled:opacity-70">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          Show
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        appliedPost={appliedPost}
        setAppliedPost={(v) => { setAppliedPost(v); setSubject('') }}
        subject={subject}
        setSubject={setSubject}
        month={month}
        setMonth={setMonth}
        onShow={handleShow}
        onReset={handleReset}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}       label="Total Applications"  value={stats.total}       color="blue"    />
            <SummaryCard icon={CheckCircle} label="Complete"            value={stats.complete}    color="emerald" />
            <SummaryCard icon={Clock}       label="Pending"             value={stats.pending}     color="amber"   />
            <SummaryCard icon={FileText}    label="With Resume"         value={stats.withResume}  color="violet"  />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5
              border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
              bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Briefcase className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Applications List</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
                {appliedPost && <PostBadge post={appliedPost} />}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, email, mobile…"
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

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {TABLE_HEADERS.map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.ApplicationID} row={row} idx={i + 1} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full details including payment info.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={row.ApplicationID} row={row} idx={i + 1} />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5
              border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
              bg-slate-50/50 dark:bg-white/[0.015]">
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

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Briefcase className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select filters and click <strong>Show</strong> to generate the job application report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
