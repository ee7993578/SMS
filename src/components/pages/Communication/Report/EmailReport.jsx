/**
 * EmailReport.jsx
 * Folder: src/pages/Communication/EmailReport.jsx
 *
 * Converts legacy ASPX "Email Status Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Entity Type, Created Date, Recipient Email, Sender Email,
 *          Adm No, Status, Status Date, Inst No, Subject, Content
 *
 * Features:
 *  - Session / Entity Type / Status / Date Range filters
 *  - Show report (GO) + Export buttons
 *  - School name / report title / session / date header
 *  - View Content modal (replaces "Show Content" link button)
 *  - Mobile: collapsible cards with expandable details
 *  - Desktop: dense ERP-style table with sticky header
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Mail, Send, Inbox, CalendarDays,
  SlidersHorizontal, Info, Search,
  FileSpreadsheet, BookOpen,
  School2, ChevronRight, FileText,
  MailCheck, MailX, MailWarning, Clock,
  Building2, Hash
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const ENTITY_TYPES = ['Student', 'Faculty', 'Individual', 'Others']

const STATUS_OPTIONS = ['Delivered', 'Failed', 'Sent', 'Not Delivered', 'DND', 'EXPIRED', 'Rejected By Provider', 'Bounced']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Email report records (per session)
const EMAIL_DATA = {
  '2025-26': [
    { entitytype: 'Student', created_date: '01 Jun 2026', ReceipientEmailId: 'aarav.sharma@gmail.com', SenderEmailId: 'noreply@svmschool.in', registration_no: 'SVM-2026-0145', EmailStatus: 'Delivered', EmailStatusDate: '01 Jun 2026, 09:14 AM', inst_no: 'INST001', EmailSubject: 'Fee Receipt - June 2026', EmailContent: 'Dear Parent, this is to confirm that the fee payment of Rs. 8,500 for the month of June 2026 has been received successfully. Please keep this email for future reference. Thank you for your prompt payment.' },
    { entitytype: 'Student', created_date: '01 Jun 2026', ReceipientEmailId: 'priya.verma@yahoo.com', SenderEmailId: 'noreply@svmschool.in', registration_no: 'SVM-2026-0212', EmailStatus: 'Delivered', EmailStatusDate: '01 Jun 2026, 09:16 AM', inst_no: 'INST001', EmailSubject: 'Exam Datesheet - Class X', EmailContent: 'Dear Student/Parent, please find attached the datesheet for the upcoming Class X examinations starting from 15th June 2026. All students are requested to come prepared with their admit cards.' },
    { entitytype: 'Faculty', created_date: '02 Jun 2026', ReceipientEmailId: 'r.mehta@svmschool.in', SenderEmailId: 'admin@svmschool.in', registration_no: 'EMP-0034', EmailStatus: 'Sent', EmailStatusDate: '02 Jun 2026, 10:05 AM', inst_no: 'INST001', EmailSubject: 'Staff Meeting Notice', EmailContent: 'All teaching staff are requested to attend a mandatory staff meeting on 5th June 2026 at 3:30 PM in the conference hall to discuss the upcoming annual function.' },
    { entitytype: 'Student', created_date: '02 Jun 2026', ReceipientEmailId: 'rohan.k@outlook.com', SenderEmailId: 'noreply@svmschool.in', registration_no: 'SVM-2026-0089', EmailStatus: 'Failed', EmailStatusDate: '02 Jun 2026, 09:20 AM', inst_no: 'INST001', EmailSubject: 'Fee Receipt - June 2026', EmailContent: 'Dear Parent, this is to confirm that the fee payment of Rs. 7,200 for the month of June 2026 has been received successfully.' },
    { entitytype: 'Student', created_date: '03 Jun 2026', ReceipientEmailId: 'sneha.gupta@gmail.com', SenderEmailId: 'noreply@svmschool.in', registration_no: 'SVM-2026-0301', EmailStatus: 'Delivered', EmailStatusDate: '03 Jun 2026, 08:55 AM', inst_no: 'INST001', EmailSubject: 'Report Card - Term 2', EmailContent: 'Dear Parent, the Term 2 report card of your child is now available. Please log in to the parent portal to view the detailed marksheet and remarks from class teachers.' },
    { entitytype: 'Individual', created_date: '03 Jun 2026', ReceipientEmailId: 'contact.vendor@suppliers.com', SenderEmailId: 'admin@svmschool.in', registration_no: '-', EmailStatus: 'Not Delivered', EmailStatusDate: '03 Jun 2026, 11:30 AM', inst_no: 'INST001', EmailSubject: 'Purchase Order #2026-118', EmailContent: 'Please find attached the purchase order for stationery items required for the new academic session. Kindly confirm the delivery schedule at the earliest.' },
    { entitytype: 'Student', created_date: '04 Jun 2026', ReceipientEmailId: 'kabir.singh@gmail.com', SenderEmailId: 'noreply@svmschool.in', registration_no: 'SVM-2026-0178', EmailStatus: 'Delivered', EmailStatusDate: '04 Jun 2026, 09:02 AM', inst_no: 'INST001', EmailSubject: 'Transport Fee Reminder', EmailContent: 'Dear Parent, this is a gentle reminder that the transport fee for the month of June 2026 amounting to Rs. 1,800 is due by 10th June 2026. Kindly clear the dues to avoid late fee charges.' },
    { entitytype: 'Faculty', created_date: '04 Jun 2026', ReceipientEmailId: 'a.kumar@svmschool.in', SenderEmailId: 'admin@svmschool.in', registration_no: 'EMP-0067', EmailStatus: 'DND', EmailStatusDate: '04 Jun 2026, 10:45 AM', inst_no: 'INST001', EmailSubject: 'Salary Slip - May 2026', EmailContent: 'Dear Employee, please find attached your salary slip for the month of May 2026. In case of any discrepancy, kindly contact the accounts department within 7 days.' },
    { entitytype: 'Student', created_date: '05 Jun 2026', ReceipientEmailId: 'ananya.j@gmail.com', SenderEmailId: 'noreply@svmschool.in', registration_no: 'SVM-2026-0254', EmailStatus: 'Sent', EmailStatusDate: '05 Jun 2026, 09:30 AM', inst_no: 'INST001', EmailSubject: 'Annual Function Invitation', EmailContent: 'Dear Parent, you are cordially invited to attend the Annual Day function on 20th June 2026 at 4:00 PM in the school auditorium. Your presence will encourage our students.' },
    { entitytype: 'Student', created_date: '05 Jun 2026', ReceipientEmailId: 'dev.patel@gmail.com', SenderEmailId: 'noreply@svmschool.in', registration_no: 'SVM-2026-0067', EmailStatus: 'EXPIRED', EmailStatusDate: '05 Jun 2026, 09:32 AM', inst_no: 'INST001', EmailSubject: 'Library Book Return Reminder', EmailContent: 'Dear Student, you have 2 library books overdue for return. Kindly return the books to the library within 3 days to avoid a late fine of Rs. 5 per day per book.' },
    { entitytype: 'Others', created_date: '06 Jun 2026', ReceipientEmailId: 'inspector.edu@govt.in', SenderEmailId: 'admin@svmschool.in', registration_no: '-', EmailStatus: 'Delivered', EmailStatusDate: '06 Jun 2026, 12:00 PM', inst_no: 'INST001', EmailSubject: 'Annual Compliance Report Submission', EmailContent: 'Respected Sir/Madam, please find attached the annual compliance report for the academic year 2025-26 as per the guidelines issued by the education department.' },
    { entitytype: 'Student', created_date: '06 Jun 2026', ReceipientEmailId: 'ishita.rao@yahoo.com', SenderEmailId: 'noreply@svmschool.in', registration_no: 'SVM-2026-0192', EmailStatus: 'Rejected By Provider', EmailStatusDate: '06 Jun 2026, 09:18 AM', inst_no: 'INST001', EmailSubject: 'Fee Receipt - June 2026', EmailContent: 'Dear Parent, this is to confirm that the fee payment of Rs. 9,000 for the month of June 2026 has been received successfully.' },
  ],
  '2024-25': [
    { entitytype: 'Student', created_date: '12 Mar 2025', ReceipientEmailId: 'manav.j@gmail.com', SenderEmailId: 'noreply@svmschool.in', registration_no: 'SVM-2025-0144', EmailStatus: 'Delivered', EmailStatusDate: '12 Mar 2025, 09:10 AM', inst_no: 'INST001', EmailSubject: 'Fee Receipt - March 2025', EmailContent: 'Dear Parent, this is to confirm that the fee payment for March 2025 has been received successfully.' },
    { entitytype: 'Faculty', created_date: '13 Mar 2025', ReceipientEmailId: 'p.tiwari@svmschool.in', SenderEmailId: 'admin@svmschool.in', registration_no: 'EMP-0021', EmailStatus: 'Sent', EmailStatusDate: '13 Mar 2025, 10:00 AM', inst_no: 'INST001', EmailSubject: 'Appraisal Cycle Notice', EmailContent: 'Dear Employee, the annual appraisal cycle for 2024-25 has begun. Please submit your self-assessment form by 25th March 2025.' },
    { entitytype: 'Student', created_date: '14 Mar 2025', ReceipientEmailId: 'tanvi.shah@gmail.com', SenderEmailId: 'noreply@svmschool.in', registration_no: 'SVM-2025-0098', EmailStatus: 'Failed', EmailStatusDate: '14 Mar 2025, 09:25 AM', inst_no: 'INST001', EmailSubject: 'Pre-Board Result Notification', EmailContent: 'Dear Parent, the pre-board examination results for your child are now available on the parent portal. Please review the performance and discuss with the class teacher if required.' },
  ],
  '2023-24': [],
  '2022-23': [],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const STATUS_STYLES = {
  Delivered:            { fg: '#059669', bg: '#d1fae5', icon: MailCheck },
  Sent:                 { fg: '#0891b2', bg: '#cffafe', icon: Send },
  Failed:               { fg: '#dc2626', bg: '#fee2e2', icon: MailX },
  'Not Delivered':      { fg: '#dc2626', bg: '#fee2e2', icon: MailX },
  DND:                  { fg: '#d97706', bg: '#fef3c7', icon: MailWarning },
  EXPIRED:              { fg: '#d97706', bg: '#fef3c7', icon: Clock },
  'Rejected By Provider': { fg: '#dc2626', bg: '#fee2e2', icon: MailX },
  Bounced:              { fg: '#dc2626', bg: '#fee2e2', icon: MailX },
}
const statusStyle = (status) => STATUS_STYLES[status] || { fg: '#64748b', bg: '#f1f5f9', icon: Mail }

const ENTITY_COLORS = {
  Student:    { fg: '#1d4ed8', bg: '#dbeafe' },
  Faculty:    { fg: '#7c3aed', bg: '#ede9fe' },
  Individual: { fg: '#0891b2', bg: '#cffafe' },
  Others:     { fg: '#d97706', bg: '#fef3c7' },
}
const entityColor = (name) => ENTITY_COLORS[name] || { fg: '#64748b', bg: '#f1f5f9' }

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

function NativeInput({ value, onChange, type = 'text', placeholder, error, ...rest }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-400
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        }`}
      {...rest}
    />
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

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const { fg, bg, icon: Icon } = statusStyle(status)
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
      style={{ background: bg, color: fg }}
    >
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {status}
    </span>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, fromDate, toDate }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <p className="text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400 mb-2">
        Email Status Report
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
          <CalendarDays className="w-3.5 h-3.5" />
          {fromDate} – {toDate}
        </span>
      </div>
    </div>
  )
}

// ─── CONTENT MODAL ────────────────────────────────────────────────────────────
function ContentModal({ row, onClose }) {
  if (!row) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-lg rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-hidden"
          style={{ animation: 'popIn .2s ease' }}
        >
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-blue-600 dark:text-indigo-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">Email Content</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="px-5 py-4 max-h-[60vh] overflow-y-auto space-y-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Subject</p>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{row.EmailSubject}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">To</p>
              <p className="text-[13px] text-slate-700 dark:text-slate-300 break-all">{row.ReceipientEmailId}</p>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Message</p>
              <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">{row.EmailContent}</p>
            </div>
          </div>
          <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex justify-end">
            <button onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onShowContent }) {
  const { fg, bg } = entityColor(row.entitytype)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Entity Type */}
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
          style={{ background: bg, color: fg }}
        >
          {row.entitytype}
        </span>
      </td>

      {/* Created Date */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.created_date}</td>

      {/* Recipient Email */}
      <td className="px-4 py-3 text-[12px] text-slate-700 dark:text-slate-200 max-w-[220px] truncate" title={row.ReceipientEmailId}>
        {row.ReceipientEmailId}
      </td>

      {/* Sender Email */}
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400 max-w-[200px] truncate" title={row.SenderEmailId}>
        {row.SenderEmailId}
      </td>

      {/* Adm No */}
      <td className="px-4 py-3 text-center text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.registration_no}</td>

      {/* Status */}
      <td className="px-4 py-3 text-center"><StatusBadge status={row.EmailStatus} /></td>

      {/* Status Date */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.EmailStatusDate}</td>

      {/* Inst No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.inst_no}</td>

      {/* Subject */}
      <td className="px-4 py-3 text-[12px] text-slate-700 dark:text-slate-200 max-w-[220px] truncate" title={row.EmailSubject}>
        {row.EmailSubject}
      </td>

      {/* Content */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onShowContent(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            transition-colors whitespace-nowrap"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onShowContent }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = entityColor(row.entitytype)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Entity badge */}
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: bg, color: fg }}
        >
          <Mail className="w-4 h-4" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.ReceipientEmailId}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {row.EmailSubject}
          </p>
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
            #{idx} · {row.entitytype} · {row.created_date}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge status={row.EmailStatus} />
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-2.5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Adm / Emp No</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{row.registration_no}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Inst No</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{row.inst_no}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5 col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Sender</p>
              <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 mt-0.5 break-all">{row.SenderEmailId}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5 col-span-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Status Date</p>
              <p className="text-[12px] font-medium text-slate-700 dark:text-slate-200 mt-0.5">{row.EmailStatusDate}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onShowContent(row)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
              transition-colors"
          >
            <Eye className="w-4 h-4" /> View Email Content
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({
  open, onClose,
  session, setSession,
  entityType, setEntityType,
  status, setStatus,
  fromDate, setFromDate,
  toDate, setToDate,
  onShow, loading, errors,
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[88vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
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

          <Field label="Entity Type">
            <NativeSelect value={entityType} onChange={e => setEntityType(e.target.value)} placeholder="All Types">
              {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="From Date" error={errors.fromDate} required>
              <NativeInput type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} error={errors.fromDate} />
            </Field>
            <Field label="To Date" error={errors.toDate} required>
              <NativeInput type="date" value={toDate} onChange={e => setToDate(e.target.value)} error={errors.toDate} />
            </Field>
          </div>

          <Field label="Status">
            <NativeSelect value={status} onChange={e => setStatus(e.target.value)} placeholder="-- Select All --">
              {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
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
export default function EmailReport() {
  // Filter state (mirrors ASPX controls: ddlsession, ddlentitytype, txtfromdate, txttodate, ddlstatus)
  const [session,    setSession]    = useState('')
  const [entityType, setEntityType] = useState('')
  const [status,     setStatus]     = useState('')
  const [fromDate,   setFromDate]   = useState('')
  const [toDate,     setToDate]     = useState('')

  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [contentRow, setContentRow] = useState(null)

  // Snapshot of filters used for the currently-shown report (for header display)
  const [shownMeta, setShownMeta] = useState({ session: '', fromDate: '', toDate: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const formatDisplayDate = (iso) => {
    if (!iso) return '—'
    const d = new Date(iso)
    if (isNaN(d.getTime())) return iso
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // ── GO button handler (validate(): session, fromdate, todate required) ────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session)   err.session   = 'Please select a session'
    if (!fromDate)  err.fromDate  = 'Please select from date'
    if (!toDate)    err.toDate    = 'Please select to date'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = EMAIL_DATA[session] || []
      if (entityType) data = data.filter(r => r.entitytype === entityType)
      if (status)     data = data.filter(r => r.EmailStatus === status)

      setRows(data)
      setShownMeta({ session, fromDate: formatDisplayDate(fromDate), toDate: formatDisplayDate(toDate) })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} email record(s) for session ${session}.`)
    }, 650)
  }, [session, entityType, status, fromDate, toDate])

  const handleReset = () => {
    setSession(''); setEntityType(''); setStatus('')
    setFromDate(''); setToDate('')
    setRows([]); setSearch('')
    setErrors({}); setShown(false)
    setShownMeta({ session: '', fromDate: '', toDate: '' })
  }

  // ── Export placeholder (btnexp / Button3_Click) ────────────────────────────
  const handleExport = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter (client-side, across recipient / subject / adm no) ──────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.ReceipientEmailId.toLowerCase().includes(q) ||
      r.SenderEmailId.toLowerCase().includes(q) ||
      r.EmailSubject.toLowerCase().includes(q) ||
      r.registration_no.toLowerCase().includes(q) ||
      r.EmailStatus.toLowerCase().includes(q) ||
      r.entitytype.toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults = shown && rows.length > 0
  const activeFilters = [session, entityType, status, fromDate, toDate].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Inbox className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Email Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Status of emails sent to students, faculty &amp; others.
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
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
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

            <Field label="Entity Type">
              <NativeSelect value={entityType} onChange={e => setEntityType(e.target.value)} placeholder="All Types">
                {ENTITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            <Field label="From Date" error={errors.fromDate} required>
              <NativeInput
                type="date"
                value={fromDate}
                onChange={e => { setFromDate(e.target.value); setErrors(p => ({ ...p, fromDate: undefined })) }}
                error={errors.fromDate}
              />
            </Field>

            <Field label="To Date" error={errors.toDate} required>
              <NativeInput
                type="date"
                value={toDate}
                onChange={e => { setToDate(e.target.value); setErrors(p => ({ ...p, toDate: undefined })) }}
                error={errors.toDate}
              />
            </Field>

            <Field label="Status">
              <NativeSelect value={status} onChange={e => setStatus(e.target.value)} placeholder="-- Select All --">
                {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Go
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
          {session ? `Session: ${session}` : 'Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
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
        session={session} setSession={setSession}
        entityType={entityType} setEntityType={setEntityType}
        status={status} setStatus={setStatus}
        fromDate={fromDate} setFromDate={setFromDate}
        toDate={toDate} setToDate={setToDate}
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
      {shown && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownMeta.session} fromDate={shownMeta.fromDate} toDate={shownMeta.toDate} />

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Email Records</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search email, subject, adm no…"
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
                Click <strong>View</strong> to read the full email content. Use search to quickly find a recipient, subject or admission/employee number.
              </p>
            </div>

            {/* ── DESKTOP TABLE (sticky header, horizontal scroll within card only) ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search / filters.</span>
                </div>
              ) : (
                <table className="w-full min-w-[1100px]">
                  <thead className="sticky top-0 z-10">
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50 dark:bg-[#1e2238]">
                      {['S.No.', 'Entity Type', 'Created Date', 'Recipient Email', 'Sender Email', 'Adm/Emp No', 'Status', 'Status Date', 'Inst No', 'Subject', 'Content'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={i} row={row} idx={i + 1} onShowContent={setContentRow} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search / filters.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full details, then view email content.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={i} row={row} idx={i + 1} onShowContent={setContentRow} />
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
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <School2 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Select a session, date range and filters, then click <strong>Go</strong> to generate the email status report.
            </p>
          </div>
        </div>
      )}

      {/* Content Modal */}
      <ContentModal row={contentRow} onClose={() => setContentRow(null)} />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
