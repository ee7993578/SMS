/**
 * TransferCertificate.jsx
 * Folder: src/pages/Certificates/TransferCertificate.jsx
 *
 * Converts legacy ASPX "Transfer Certificate" to fully-responsive React + Tailwind.
 *
 * Workflow:
 *  1. Select Session → Class → Student → Admission Class → Last Date → Promoted To
 *  2. Click "Get Certificate" → loads student data into editable TC form (25 fields)
 *  3. Preview → print-ready view with signatures section
 *
 * Mobile: stacked cards, drawer filters, full-width inputs
 * Desktop: dense ERP multi-column layout
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  ChevronDown, AlertCircle, X, Check, Loader2, Eye,
  RefreshCw, Printer, FileText, User, CalendarDays,
  BookOpen, School2, Building2, MapPin, SlidersHorizontal,
  ChevronRight, ChevronUp, Info, Search, Shield,
  ClipboardList, BadgeCheck, Users, GraduationCap,
  Hash, Star, Activity
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const PROMOTED_TO = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
  'Passed Out',
]

// Students per class (dummy)
const STUDENTS_BY_CLASS = {
  'Nursery':    [{ id: 1, name: 'Aarav Sharma', adm: 'NUR-001' }, { id: 2, name: 'Priya Singh', adm: 'NUR-002' }],
  'LKG':        [{ id: 3, name: 'Rohan Gupta', adm: 'LKG-001' }, { id: 4, name: 'Sneha Verma', adm: 'LKG-002' }],
  'UKG':        [{ id: 5, name: 'Karan Mehta', adm: 'UKG-001' }],
  'Class I':    [{ id: 6, name: 'Ananya Joshi', adm: 'I-001' }, { id: 7, name: 'Rahul Yadav', adm: 'I-002' }],
  'Class II':   [{ id: 8, name: 'Pooja Mishra', adm: 'II-001' }],
  'Class III':  [{ id: 9, name: 'Amit Tiwari', adm: 'III-001' }, { id: 10, name: 'Kavya Patel', adm: 'III-002' }],
  'Class IV':   [{ id: 11, name: 'Vikram Chauhan', adm: 'IV-001' }],
  'Class V':    [{ id: 12, name: 'Divya Shukla', adm: 'V-001' }, { id: 13, name: 'Neeraj Kumar', adm: 'V-002' }],
  'Class VI':   [{ id: 14, name: 'Sunita Pandey', adm: 'VI-001' }],
  'Class VII':  [{ id: 15, name: 'Deepak Rawat', adm: 'VII-001' }, { id: 16, name: 'Ritu Saxena', adm: 'VII-002' }],
  'Class VIII': [{ id: 17, name: 'Manoj Dubey', adm: 'VIII-001' }],
  'Class IX':   [{ id: 18, name: 'Shreya Agarwal', adm: 'IX-001' }, { id: 19, name: 'Arjun Nair', adm: 'IX-002' }],
  'Class X':    [{ id: 20, name: 'Tanvi Bose', adm: 'X-001' }],
  'Class XI':   [{ id: 21, name: 'Yash Malhotra', adm: 'XI-001' }, { id: 22, name: 'Isha Reddy', adm: 'XI-002' }],
  'Class XII':  [{ id: 23, name: 'Siddharth Roy', adm: 'XII-001' }],
}

// Full student record (dummy TC data)
const STUDENT_RECORDS = {
  1:  { stu_name: 'Aarav Sharma',    mother_name: 'Priya Sharma',    father_name: 'Rajesh Sharma',     dob: '15 Mar 2019', inwords: 'Fifteenth March Two Thousand Nineteen',     nationality: 'Indian', stu_category: '1', admission_date: '01 Apr 2022', last_class: 'Nursery', last_class_word1: 'Nursery', last_exam_result: 'Promoted', failed_status: 'No', subjects: 'English, Hindi, Math, EVS', qualified_status: 'Yes', paid_fee_status: 'Yes', fee_concession: 'No', total_att: '210', ncc_cadet_status: 'No', extra_activity: 'Drawing', general_conduct: 'Good', application_date: '10 Mar 2025', issue_date: '12 Mar 2025', reason_for_leaving: 'Parent Transfer', withdrawn_date: '31 Mar 2025', remark: 'NIL', PEN_No: 'UK2024001', enroll_no: '' },
  6:  { stu_name: 'Ananya Joshi',    mother_name: 'Meena Joshi',     father_name: 'Suresh Joshi',      dob: '22 Jun 2015', inwords: 'Twenty Second June Two Thousand Fifteen',    nationality: 'Indian', stu_category: '1', admission_date: '03 Apr 2019', last_class: 'Class I', last_class_word1: 'One',     last_exam_result: 'Pass', failed_status: 'No', subjects: 'English, Hindi, Math, EVS, GK', qualified_status: 'Yes', paid_fee_status: 'Yes', fee_concession: 'No', total_att: '220', ncc_cadet_status: 'No', extra_activity: 'Dance, Music', general_conduct: 'Excellent', application_date: '05 Apr 2025', issue_date: '07 Apr 2025', reason_for_leaving: 'Shifting to another city', withdrawn_date: '05 Apr 2025', remark: 'Good student', PEN_No: 'UK2024006', enroll_no: '' },
  18: { stu_name: 'Shreya Agarwal',  mother_name: 'Sunita Agarwal',  father_name: 'Vikas Agarwal',     dob: '09 Dec 2009', inwords: 'Ninth December Two Thousand Nine',           nationality: 'Indian', stu_category: '1', admission_date: '01 Apr 2015', last_class: 'Class IX', last_class_word1: 'Nine',    last_exam_result: 'Pass', failed_status: 'No', subjects: 'English, Hindi, Math, Science, Social Science, Computer', qualified_status: 'Yes', paid_fee_status: 'Yes', fee_concession: 'No', total_att: '235', ncc_cadet_status: 'Yes', extra_activity: 'NCC, Badminton', general_conduct: 'Very Good', application_date: '10 Mar 2025', issue_date: '12 Mar 2025', reason_for_leaving: 'Admission in another school', withdrawn_date: '31 Mar 2025', remark: 'NIL', PEN_No: 'UK2024018', enroll_no: 'UK2025-0098' },
  23: { stu_name: 'Siddharth Roy',   mother_name: 'Rekha Roy',       father_name: 'Bimal Roy',         dob: '17 Aug 2006', inwords: 'Seventeenth August Two Thousand Six',        nationality: 'Indian', stu_category: '4', admission_date: '01 Apr 2012', last_class: 'Class XII', last_class_word1: 'Twelve', last_exam_result: 'Pass - 82%', failed_status: 'No', subjects: 'English, Hindi, Math, Physics, Chemistry, Computer Science', qualified_status: 'Yes', paid_fee_status: 'Yes', fee_concession: 'No', total_att: '240', ncc_cadet_status: 'No', extra_activity: 'Cricket, Debate', general_conduct: 'Good', application_date: '15 May 2025', issue_date: '17 May 2025', reason_for_leaving: 'Passed out from school', withdrawn_date: '31 May 2025', remark: 'NIL', PEN_No: 'UK2024023', enroll_no: 'UK2025-1234' },
}

const defaultRecord = {
  stu_name: '', mother_name: '', father_name: '', dob: '', inwords: '',
  nationality: 'Indian', stu_category: '0', admission_date: '', last_class: '',
  last_class_word1: '', last_exam_result: '', failed_status: '0',
  subjects: '', qualified_status: '0', paid_fee_status: '0',
  fee_concession: '0', total_att: '', ncc_cadet_status: '0', extra_activity: '',
  general_conduct: '', application_date: '', issue_date: '',
  reason_for_leaving: '', withdrawn_date: '', remark: '', PEN_No: '', enroll_no: '',
}

// ─── SCHOOL INFO ──────────────────────────────────────────────────────────────
const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const todayStr = () => {
  const d = new Date()
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

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

function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

function Input({ value, onChange, placeholder, error, disabled, readOnly, className = '', multiline = false, rows = 3 }) {
  const base = `w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
    bg-white text-slate-800
    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
    dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
    disabled:opacity-50 disabled:cursor-not-allowed
    ${readOnly ? 'bg-slate-50 cursor-default dark:bg-[#161929]' : ''}
    ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
    ${className}`

  if (multiline) return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} readOnly={readOnly} rows={rows} className={`${base} resize-none`} />
  )
  return <input type="text" value={value} onChange={onChange} placeholder={placeholder} disabled={disabled} readOnly={readOnly} className={base} />
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
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

function SectionHeader({ icon: Icon, title, subtitle, color = 'blue' }) {
  const colorMap = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }
  return (
    <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div>
        <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{title}</p>
        {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500">{subtitle}</p>}
      </div>
    </div>
  )
}

// Accordion for mobile TC sections
function Accordion({ title, icon: Icon, color = 'blue', defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen)
  const colorMap = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400 border-violet-100 dark:border-violet-500/20',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 border-cyan-100 dark:border-cyan-500/20',
  }
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </span>
        <span className="flex-1 text-[13px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] pt-3">
          {children}
        </div>
      )}
    </div>
  )
}

// Field row for TC form
function TCField({ number, label, children }) {
  return (
    <div className="grid grid-cols-[32px_1fr] gap-2 items-start py-1.5 border-b border-dashed border-slate-100 dark:border-[rgba(99,102,241,0.08)] last:border-0">
      <span className="text-[12px] font-bold text-slate-400 dark:text-slate-500 pt-2 text-center">{number}.</span>
      <div className="flex flex-col gap-1.5">
        <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 leading-snug">{label}</label>
        {children}
      </div>
    </div>
  )
}

// Print-style TC Preview Modal
function PreviewModal({ open, onClose, data, meta }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-4 sm:inset-8 z-50 bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl overflow-auto flex flex-col">
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-50 dark:bg-white/[0.02] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Transfer Certificate Preview</p>
              <p className="text-[12px] text-slate-400">{data.stu_name} · {meta.selectedClass}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Printer className="w-4 h-4" /> Print
            </button>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TC Body */}
        <div className="flex-1 overflow-auto p-4 sm:p-8 print:p-0">
          <div className="max-w-[750px] mx-auto print:max-w-full">
            {/* School Header */}
            <div className="text-center mb-4 pb-4 border-b-2 border-slate-300 dark:border-slate-600">
              <h1 className="text-[18px] font-extrabold text-slate-800 dark:text-slate-100 uppercase tracking-wide">{SCHOOL_INFO.name}</h1>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">{SCHOOL_INFO.address}</p>
              <h2 className="text-[15px] font-bold text-blue-700 dark:text-blue-400 mt-2 uppercase tracking-widest">Transfer Certificate</h2>
            </div>

            {/* TC Meta row */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 text-[12px] text-slate-600 dark:text-slate-300 mb-5">
              <span>Date: <strong>{data.issuedate || todayStr()}</strong></span>
              <span>Sl.No: <strong>{data.sno || '—'}</strong></span>
              <span>Admission No: <strong>{data.admissionNo || meta.admNo}</strong></span>
              {data.enroll_no && <span>Registration No: <strong>{data.enroll_no}</strong></span>}
            </div>

            {/* 25-field table */}
            <table className="w-full text-[12px] border-collapse">
              <tbody>
                {[
                  ['1', 'Name of the Pupil', data.stu_name],
                  ["2", "Mother's Name", data.mother_name],
                  ["3", "Father's/Guardian's Name", data.father_name],
                  ["4", "Date of Birth (in figures)", data.dob],
                  ["", "In words", data.inwords],
                  ["5", "Nationality", data.nationality],
                  ["6", "Whether SC/ST/OBC", { 0: '—', 1: 'GEN', 2: 'ST', 3: 'SC', 4: 'OBC' }[data.stu_category] || '—'],
                  ["7", "Date of first admission with class", data.admission_date],
                  ["8", "Class in which pupil last studied (figures)", data.last_class],
                  ["", "(In words)", data.last_class_word1],
                  ["9", "School/Board Annual Examination last taken with result", data.last_exam_result],
                  ["10", "Whether the student failed, if so once/twice", data.failed_status === '0' ? '—' : data.failed_status],
                  ["11", "Subjects Studied", data.subjects],
                  ["12", "Whether qualified for promotion to next class", data.qualified_status === '0' ? '—' : data.qualified_status],
                  ["13", "Whether the pupil has paid all dues", data.paid_fee_status === '0' ? '—' : data.paid_fee_status],
                  ["14", "Any fee concession availed", data.fee_concession === '0' ? '—' : data.fee_concession],
                  ["15", "Total no. of working days in academic session", data.totalWorkingDays || '—'],
                  ["16", "Total no. of working days pupil was present", data.total_att],
                  ["17", "Whether NCC Cadet/Boy Scout/Girl Guide", data.ncc_cadet_status === '0' ? '—' : `${data.ncc_cadet_status}${data.txtncc ? ` — ${data.txtncc}` : ''}`],
                  ["18", "Games/Extra curricular activities", data.extra_activity],
                  ["19", "General conduct", data.general_conduct],
                  ["20", "Date of application for certificate", data.application_date],
                  ["21", "Date of issue of certificate", data.issue_date],
                  ["22", "Reason for leaving the school", data.reason_for_leaving],
                  ["23", "Date of removal from the school", data.withdrawn_date],
                  ["24", "Any other remark", data.remark],
                  ["25", "PEN No.", data.PEN_No],
                ].map(([num, label, val], i) => (
                  <tr key={i} className={`border border-slate-200 dark:border-slate-600 ${i % 2 === 0 ? 'bg-slate-50/60 dark:bg-white/[0.02]' : ''}`}>
                    <td className="px-2 py-1.5 w-8 text-center font-bold text-slate-400 dark:text-slate-500">{num}</td>
                    <td className="px-3 py-1.5 w-[45%] text-slate-600 dark:text-slate-300 leading-relaxed">{label}</td>
                    <td className="px-3 py-1.5 text-slate-800 dark:text-slate-100 font-medium">{val || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Signatures */}
            <div className="mt-10 grid grid-cols-3 gap-4 text-center text-[12px] text-slate-600 dark:text-slate-400">
              <div className="pt-8 border-t border-slate-300 dark:border-slate-600">
                <p className="font-bold text-slate-700 dark:text-slate-200">Prepared by</p>
                <p>Name & Designation</p>
              </div>
              <div className="pt-8 border-t border-slate-300 dark:border-slate-600">
                <p className="font-bold text-slate-700 dark:text-slate-200">Checked by</p>
                <p>Name & Designation</p>
              </div>
              <div className="pt-8 border-t border-slate-300 dark:border-slate-600">
                <p className="font-bold text-slate-700 dark:text-slate-200">Principal</p>
                <p>with official seal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── FILTER DRAWER (mobile) ────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, students, onGet, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease', maxHeight: '90vh', overflowY: 'auto' }}>
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Student Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setFilters(p => ({ ...p, session: e.target.value }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={filters.cls} onChange={e => setFilters(p => ({ ...p, cls: e.target.value, student: '' }))} placeholder="-- Select Class --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Student" error={errors.student} required>
            <NativeSelect value={filters.student} onChange={e => setFilters(p => ({ ...p, student: e.target.value }))} placeholder="-- Select Student --" error={errors.student} disabled={!filters.cls}>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Admission Class" error={errors.admClass} required>
            <NativeSelect value={filters.admClass} onChange={e => setFilters(p => ({ ...p, admClass: e.target.value }))} placeholder="-- Select Class --" error={errors.admClass}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Last Date of Attendance" error={errors.lastAtt} required>
            <Input value={filters.lastAtt} onChange={e => setFilters(p => ({ ...p, lastAtt: e.target.value }))} placeholder="e.g. 31 Mar 2025" error={errors.lastAtt} />
          </Field>
          <Field label="Promoted To" error={errors.promoted} required>
            <NativeSelect value={filters.promoted} onChange={e => setFilters(p => ({ ...p, promoted: e.target.value }))} placeholder="-- Select Class --" error={errors.promoted}>
              {PROMOTED_TO.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onGet(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Get Certificate
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TransferCertificate() {
  // Filter state
  const [filters, setFilters] = useState({ session: '', cls: '', student: '', admClass: '', lastAtt: '', promoted: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  // TC form data (all 25 fields + extras)
  const [tcData, setTcData] = useState(null)
  const [tcMeta, setTcMeta] = useState({})
  const [shown, setShown] = useState(false)

  // Preview
  const [previewOpen, setPreviewOpen] = useState(false)

  // Toast
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Students for selected class
  const students = useMemo(() => STUDENTS_BY_CLASS[filters.cls] || [], [filters.cls])

  // ── Validate filters ──────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!filters.session)  err.session  = 'Select a session'
    if (!filters.cls)      err.cls      = 'Select a class'
    if (!filters.student)  err.student  = 'Select a student'
    if (!filters.admClass) err.admClass = 'Select admission class'
    if (!filters.lastAtt)  err.lastAtt  = 'Enter last attendance date'
    if (!filters.promoted) err.promoted = 'Select promoted to class'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Get Certificate ───────────────────────────────────────────────────────
  const handleGet = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const sid = parseInt(filters.student)
      const record = STUDENT_RECORDS[sid] || defaultRecord
      const student = students.find(s => s.id === sid)
      setTcData({
        ...record,
        sno: `TC-${new Date().getFullYear()}-${String(sid).padStart(4, '0')}`,
        admissionNo: student?.adm || '',
        issuedate: record.issue_date || todayStr(),
        txtncc: '',
        totalWorkingDays: '240',
      })
      setTcMeta({
        selectedClass: filters.cls,
        session: filters.session,
        admClass: filters.admClass,
        lastAtt: filters.lastAtt,
        promoted: filters.promoted,
        admNo: student?.adm || '',
        studentName: student?.name || '',
      })
      setShown(true)
      setLoading(false)
      showToast(`Certificate loaded for ${student?.name || 'student'}.`)
    }, 700)
  }, [filters, students])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFilters({ session: '', cls: '', student: '', admClass: '', lastAtt: '', promoted: '' })
    setErrors({}); setTcData(null); setTcMeta({}); setShown(false)
  }

  // ── Update TC field ───────────────────────────────────────────────────────
  const setField = (key, val) => setTcData(p => ({ ...p, [key]: val }))

  // Qualified → show text reason if 'Other'
  const qualifiedStatus = tcData?.qualified_status || '0'

  return (
    <div className="space-y-4 pb-16">
      <style>{`
        @media print {
          body > *:not(#tc-print-area) { display: none; }
          #tc-print-area { display: block !important; }
        }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .tc-fade { animation: fadeIn 0.3s ease; }
      `}</style>

      {/* ── Page Title ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Transfer Certificate
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Select student and fill TC details, then preview or print.
          </p>
        </div>
        {shown && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={() => setPreviewOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95">
              <Printer className="w-4 h-4" /> Preview & Print
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <SectionHeader icon={SlidersHorizontal} title="Student Search Filters" subtitle="All fields required to generate certificate" color="blue" />
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={filters.cls}
                onChange={e => { setFilters(p => ({ ...p, cls: e.target.value, student: '' })); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Class --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Student" error={errors.student} required>
              <NativeSelect value={filters.student}
                onChange={e => { setFilters(p => ({ ...p, student: e.target.value })); setErrors(p => ({ ...p, student: undefined })) }}
                placeholder="-- Student --" error={errors.student} disabled={!filters.cls}>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Admission Class" error={errors.admClass} required>
              <NativeSelect value={filters.admClass}
                onChange={e => { setFilters(p => ({ ...p, admClass: e.target.value })); setErrors(p => ({ ...p, admClass: undefined })) }}
                placeholder="-- Class --" error={errors.admClass}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Last Date of Attendance" error={errors.lastAtt} required>
              <Input value={filters.lastAtt}
                onChange={e => { setFilters(p => ({ ...p, lastAtt: e.target.value })); setErrors(p => ({ ...p, lastAtt: undefined })) }}
                placeholder="dd MMM yyyy" error={errors.lastAtt} />
            </Field>

            <Field label="Promoted To" error={errors.promoted} required>
              <NativeSelect value={filters.promoted}
                onChange={e => { setFilters(p => ({ ...p, promoted: e.target.value })); setErrors(p => ({ ...p, promoted: undefined })) }}
                placeholder="-- Class --" error={errors.promoted}>
                {PROMOTED_TO.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <button type="button" onClick={handleGet} disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Get Certificate
            </button>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md">
          <SlidersHorizontal className="w-4 h-4" />
          {filters.student
            ? students.find(s => s.id === parseInt(filters.student))?.name || 'Filters Set'
            : 'Select Student'}
          {Object.values(filters).filter(Boolean).length > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {Object.values(filters).filter(Boolean).length}
            </span>
          )}
        </button>
        {shown && (
          <button type="button" onClick={() => setPreviewOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700">
            <Printer className="w-4 h-4" />
          </button>
        )}
        {shown && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} setFilters={setFilters}
        students={students} onGet={handleGet}
        loading={loading} errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── TC FORM (shown after Get Certificate) ────────────────────── */}
      {shown && tcData && !loading && (
        <div className="tc-fade space-y-4">

          {/* Student Info Banner */}
          <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 shadow-sm">
            <div className="flex flex-wrap items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-slate-100 truncate">{tcData.stu_name}</h2>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[12px] text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{tcMeta.selectedClass} · {tcMeta.session}</span>
                  <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{tcData.admissionNo}</span>
                  <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />Promoted to: {tcMeta.promoted}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/25">
                  <CalendarDays className="w-3 h-3" />Last Att: {tcMeta.lastAtt}
                </span>
              </div>
            </div>
          </div>

          {/* ── TC FORM — DESKTOP (two column grid) ────────────────────── */}
          <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Section A: Identity */}
            <SectionHeader icon={User} title="Identity Details" subtitle="Fields 1–6: Basic student information" color="blue" />
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0 divide-y lg:divide-y-0">

              {/* Left col */}
              <div className="space-y-0">
                <TCField number="Date" label="TC Issue Date">
                  <Input value={tcData.issuedate} onChange={e => setField('issuedate', e.target.value)} placeholder="dd MMM yyyy" />
                </TCField>
                <TCField number="SL" label="SL No.">
                  <Input value={tcData.sno} onChange={e => setField('sno', e.target.value)} />
                </TCField>
                <TCField number="ADM" label="Admission No.">
                  <Input value={tcData.admissionNo} onChange={e => setField('admissionNo', e.target.value)} />
                </TCField>
                <TCField number="" label="Registration No. (Class IX–XII)">
                  <Input value={tcData.enroll_no} onChange={e => setField('enroll_no', e.target.value)} placeholder="If applicable" />
                </TCField>
                <TCField number="1" label="Name of the Pupil">
                  <Input value={tcData.stu_name} onChange={e => setField('stu_name', e.target.value)} />
                </TCField>
                <TCField number="2" label="Mother's Name">
                  <Input value={tcData.mother_name} onChange={e => setField('mother_name', e.target.value)} />
                </TCField>
                <TCField number="3" label="Father's / Guardian's Name">
                  <Input value={tcData.father_name} onChange={e => setField('father_name', e.target.value)} />
                </TCField>
              </div>

              {/* Right col */}
              <div className="space-y-0 lg:border-l lg:border-slate-100 lg:dark:border-[rgba(99,102,241,0.08)] lg:pl-8">
                <TCField number="4" label="Date of Birth (figures)">
                  <Input value={tcData.dob} onChange={e => setField('dob', e.target.value)} placeholder="dd MMM yyyy" />
                </TCField>
                <TCField number="" label="Date of Birth (in words)">
                  <Input value={tcData.inwords} onChange={e => setField('inwords', e.target.value)} />
                </TCField>
                <TCField number="5" label="Nationality">
                  <Input value={tcData.nationality} onChange={e => setField('nationality', e.target.value)} />
                </TCField>
                <TCField number="6" label="Category (SC/ST/OBC/GEN)">
                  <NativeSelect value={tcData.stu_category} onChange={e => setField('stu_category', e.target.value)}>
                    <option value="0">-- Select --</option>
                    <option value="1">GEN</option>
                    <option value="3">SC</option>
                    <option value="2">ST</option>
                    <option value="4">OBC</option>
                  </NativeSelect>
                </TCField>
                <TCField number="25" label="PEN No.">
                  <Input value={tcData.PEN_No} onChange={e => setField('PEN_No', e.target.value)} />
                </TCField>
              </div>
            </div>

            {/* Section B: Academic */}
            <SectionHeader icon={GraduationCap} title="Academic Details" subtitle="Fields 7–12: Classes and examination records" color="emerald" />
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0">
              <div className="space-y-0">
                <TCField number="7" label="Date of first admission with class">
                  <Input value={tcData.admission_date} onChange={e => setField('admission_date', e.target.value)} placeholder="dd MMM yyyy" />
                </TCField>
                <TCField number="8" label="Class last studied (figures)">
                  <Input value={tcData.last_class} onChange={e => setField('last_class', e.target.value)} />
                </TCField>
                <TCField number="" label="Class last studied (in words)">
                  <Input value={tcData.last_class_word1} onChange={e => setField('last_class_word1', e.target.value)} />
                </TCField>
                <TCField number="9" label="Board/Annual Exam last taken with result">
                  <Input value={tcData.last_exam_result} onChange={e => setField('last_exam_result', e.target.value)} />
                </TCField>
              </div>
              <div className="space-y-0 lg:border-l lg:border-slate-100 lg:dark:border-[rgba(99,102,241,0.08)] lg:pl-8">
                <TCField number="10" label="Whether student failed (once/twice in same class)">
                  <NativeSelect value={tcData.failed_status} onChange={e => setField('failed_status', e.target.value)}>
                    <option value="0">-- Select --</option>
                    <option>Yes</option>
                    <option>No</option>
                  </NativeSelect>
                </TCField>
                <TCField number="11" label="Subjects Studied">
                  <Input value={tcData.subjects} onChange={e => setField('subjects', e.target.value)} multiline rows={3} />
                </TCField>
                <TCField number="12" label="Qualified for promotion to next class">
                  <div className="space-y-2">
                    <NativeSelect value={tcData.qualified_status} onChange={e => setField('qualified_status', e.target.value)}>
                      <option value="0">-- Select --</option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                      <option value="Other">Other</option>
                    </NativeSelect>
                    {tcData.qualified_status === 'Other' && (
                      <Input value={tcData.promotedReason || ''} onChange={e => setField('promotedReason', e.target.value)} placeholder="Enter reason here…" multiline rows={2} />
                    )}
                  </div>
                </TCField>
              </div>
            </div>

            {/* Section C: Attendance & Fees */}
            <SectionHeader icon={ClipboardList} title="Attendance & Fee Details" subtitle="Fields 13–17" color="violet" />
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0">
              <div className="space-y-0">
                <TCField number="13" label="Whether all dues paid to the school">
                  <NativeSelect value={tcData.paid_fee_status} onChange={e => setField('paid_fee_status', e.target.value)}>
                    <option value="0">-- Select --</option>
                    <option>Yes</option>
                    <option>No</option>
                  </NativeSelect>
                </TCField>
                <TCField number="14" label="Any fee concession availed">
                  <NativeSelect value={tcData.fee_concession} onChange={e => setField('fee_concession', e.target.value)}>
                    <option value="0">-- Select --</option>
                    <option>Yes</option>
                    <option>No</option>
                  </NativeSelect>
                </TCField>
              </div>
              <div className="space-y-0 lg:border-l lg:border-slate-100 lg:dark:border-[rgba(99,102,241,0.08)] lg:pl-8">
                <TCField number="15" label="Total working days in academic session">
                  <Input value={tcData.totalWorkingDays || ''} onChange={e => setField('totalWorkingDays', e.target.value)} />
                </TCField>
                <TCField number="16" label="Total days pupil was present">
                  <Input value={tcData.total_att} onChange={e => setField('total_att', e.target.value)} />
                </TCField>
                <TCField number="17" label="Whether NCC Cadet/Boy Scout/Girl Guide">
                  <div className="space-y-2">
                    <NativeSelect value={tcData.ncc_cadet_status} onChange={e => setField('ncc_cadet_status', e.target.value)}>
                      <option value="0">-- Select --</option>
                      <option>Yes</option>
                      <option>No</option>
                    </NativeSelect>
                    {tcData.ncc_cadet_status === 'Yes' && (
                      <Input value={tcData.txtncc || ''} onChange={e => setField('txtncc', e.target.value)} placeholder="NCC rank / details" />
                    )}
                  </div>
                </TCField>
              </div>
            </div>

            {/* Section D: Conduct & Dates */}
            <SectionHeader icon={Star} title="Activities, Conduct & Dates" subtitle="Fields 18–24" color="amber" />
            <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-0">
              <div className="space-y-0">
                <TCField number="18" label="Games / Extra curricular activities">
                  <Input value={tcData.extra_activity} onChange={e => setField('extra_activity', e.target.value)} />
                </TCField>
                <TCField number="19" label="General conduct">
                  <Input value={tcData.general_conduct} onChange={e => setField('general_conduct', e.target.value)} />
                </TCField>
                <TCField number="20" label="Date of application for certificate">
                  <Input value={tcData.application_date} onChange={e => setField('application_date', e.target.value)} placeholder="dd MMM yyyy" />
                </TCField>
                <TCField number="21" label="Date of issue of certificate">
                  <Input value={tcData.issue_date} onChange={e => setField('issue_date', e.target.value)} placeholder="dd MMM yyyy" />
                </TCField>
              </div>
              <div className="space-y-0 lg:border-l lg:border-slate-100 lg:dark:border-[rgba(99,102,241,0.08)] lg:pl-8">
                <TCField number="22" label="Reason for leaving the school">
                  <Input value={tcData.reason_for_leaving} onChange={e => setField('reason_for_leaving', e.target.value)} multiline rows={3} />
                </TCField>
                <TCField number="23" label="Date of removal from the school">
                  <Input value={tcData.withdrawn_date} onChange={e => setField('withdrawn_date', e.target.value)} placeholder="dd MMM yyyy" />
                </TCField>
                <TCField number="24" label="Any other remark">
                  <Input value={tcData.remark} onChange={e => setField('remark', e.target.value)} multiline rows={2} />
                </TCField>
              </div>
            </div>

            {/* Footer actions */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <div className="flex items-center gap-2 text-[12px] text-slate-400 dark:text-slate-500">
                <Info className="w-3.5 h-3.5" />
                All fields are editable before printing.
              </div>
              <button onClick={() => setPreviewOpen(true)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95">
                <Printer className="w-4 h-4" /> Preview & Print
              </button>
            </div>
          </div>

          {/* ── TC FORM — MOBILE (accordion sections) ─────────────────── */}
          <div className="md:hidden space-y-3">

            {/* Meta row (date, sno, adm) */}
            <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Certificate Info
              </p>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Issue Date">
                  <Input value={tcData.issuedate} onChange={e => setField('issuedate', e.target.value)} placeholder="dd MMM yyyy" />
                </Field>
                <Field label="SL No.">
                  <Input value={tcData.sno} onChange={e => setField('sno', e.target.value)} />
                </Field>
                <Field label="Admission No.">
                  <Input value={tcData.admissionNo} onChange={e => setField('admissionNo', e.target.value)} />
                </Field>
                <Field label="Reg. No. (IX–XII)">
                  <Input value={tcData.enroll_no} onChange={e => setField('enroll_no', e.target.value)} placeholder="If applicable" />
                </Field>
              </div>
            </div>

            <Accordion title="Identity Details (1–6)" icon={User} color="blue" defaultOpen>
              <Field label="1. Name of the Pupil">
                <Input value={tcData.stu_name} onChange={e => setField('stu_name', e.target.value)} />
              </Field>
              <Field label="2. Mother's Name">
                <Input value={tcData.mother_name} onChange={e => setField('mother_name', e.target.value)} />
              </Field>
              <Field label="3. Father's / Guardian's Name">
                <Input value={tcData.father_name} onChange={e => setField('father_name', e.target.value)} />
              </Field>
              <Field label="4. Date of Birth (figures)">
                <Input value={tcData.dob} onChange={e => setField('dob', e.target.value)} placeholder="dd MMM yyyy" />
              </Field>
              <Field label="Date of Birth (in words)">
                <Input value={tcData.inwords} onChange={e => setField('inwords', e.target.value)} />
              </Field>
              <Field label="5. Nationality">
                <Input value={tcData.nationality} onChange={e => setField('nationality', e.target.value)} />
              </Field>
              <Field label="6. Category">
                <NativeSelect value={tcData.stu_category} onChange={e => setField('stu_category', e.target.value)}>
                  <option value="0">-- Select --</option>
                  <option value="1">GEN</option>
                  <option value="3">SC</option>
                  <option value="2">ST</option>
                  <option value="4">OBC</option>
                </NativeSelect>
              </Field>
              <Field label="25. PEN No.">
                <Input value={tcData.PEN_No} onChange={e => setField('PEN_No', e.target.value)} />
              </Field>
            </Accordion>

            <Accordion title="Academic Details (7–12)" icon={GraduationCap} color="emerald">
              <Field label="7. Date of first admission with class">
                <Input value={tcData.admission_date} onChange={e => setField('admission_date', e.target.value)} placeholder="dd MMM yyyy" />
              </Field>
              <Field label="8. Class last studied (figures)">
                <Input value={tcData.last_class} onChange={e => setField('last_class', e.target.value)} />
              </Field>
              <Field label="Class last studied (in words)">
                <Input value={tcData.last_class_word1} onChange={e => setField('last_class_word1', e.target.value)} />
              </Field>
              <Field label="9. Last exam result">
                <Input value={tcData.last_exam_result} onChange={e => setField('last_exam_result', e.target.value)} />
              </Field>
              <Field label="10. Student failed?">
                <NativeSelect value={tcData.failed_status} onChange={e => setField('failed_status', e.target.value)}>
                  <option value="0">-- Select --</option>
                  <option>Yes</option>
                  <option>No</option>
                </NativeSelect>
              </Field>
              <Field label="11. Subjects Studied">
                <Input value={tcData.subjects} onChange={e => setField('subjects', e.target.value)} multiline rows={3} />
              </Field>
              <Field label="12. Qualified for promotion?">
                <NativeSelect value={tcData.qualified_status} onChange={e => setField('qualified_status', e.target.value)}>
                  <option value="0">-- Select --</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Other">Other</option>
                </NativeSelect>
              </Field>
              {tcData.qualified_status === 'Other' && (
                <Field label="Reason">
                  <Input value={tcData.promotedReason || ''} onChange={e => setField('promotedReason', e.target.value)} placeholder="Enter reason…" multiline rows={2} />
                </Field>
              )}
            </Accordion>

            <Accordion title="Attendance & Fee Details (13–17)" icon={ClipboardList} color="violet">
              <Field label="13. All dues paid?">
                <NativeSelect value={tcData.paid_fee_status} onChange={e => setField('paid_fee_status', e.target.value)}>
                  <option value="0">-- Select --</option>
                  <option>Yes</option>
                  <option>No</option>
                </NativeSelect>
              </Field>
              <Field label="14. Fee concession availed?">
                <NativeSelect value={tcData.fee_concession} onChange={e => setField('fee_concession', e.target.value)}>
                  <option value="0">-- Select --</option>
                  <option>Yes</option>
                  <option>No</option>
                </NativeSelect>
              </Field>
              <Field label="15. Total working days in session">
                <Input value={tcData.totalWorkingDays || ''} onChange={e => setField('totalWorkingDays', e.target.value)} />
              </Field>
              <Field label="16. Days pupil was present">
                <Input value={tcData.total_att} onChange={e => setField('total_att', e.target.value)} />
              </Field>
              <Field label="17. NCC Cadet / Scout / Guide?">
                <NativeSelect value={tcData.ncc_cadet_status} onChange={e => setField('ncc_cadet_status', e.target.value)}>
                  <option value="0">-- Select --</option>
                  <option>Yes</option>
                  <option>No</option>
                </NativeSelect>
              </Field>
              {tcData.ncc_cadet_status === 'Yes' && (
                <Field label="NCC Details">
                  <Input value={tcData.txtncc || ''} onChange={e => setField('txtncc', e.target.value)} placeholder="Rank / details…" />
                </Field>
              )}
            </Accordion>

            <Accordion title="Activities, Conduct & Dates (18–24)" icon={Star} color="amber">
              <Field label="18. Extra curricular activities">
                <Input value={tcData.extra_activity} onChange={e => setField('extra_activity', e.target.value)} />
              </Field>
              <Field label="19. General conduct">
                <Input value={tcData.general_conduct} onChange={e => setField('general_conduct', e.target.value)} />
              </Field>
              <Field label="20. Date of application for certificate">
                <Input value={tcData.application_date} onChange={e => setField('application_date', e.target.value)} placeholder="dd MMM yyyy" />
              </Field>
              <Field label="21. Date of issue of certificate">
                <Input value={tcData.issue_date} onChange={e => setField('issue_date', e.target.value)} placeholder="dd MMM yyyy" />
              </Field>
              <Field label="22. Reason for leaving">
                <Input value={tcData.reason_for_leaving} onChange={e => setField('reason_for_leaving', e.target.value)} multiline rows={3} />
              </Field>
              <Field label="23. Date of removal from school">
                <Input value={tcData.withdrawn_date} onChange={e => setField('withdrawn_date', e.target.value)} placeholder="dd MMM yyyy" />
              </Field>
              <Field label="24. Any other remark">
                <Input value={tcData.remark} onChange={e => setField('remark', e.target.value)} multiline rows={2} />
              </Field>
            </Accordion>

            {/* Mobile Preview Button */}
            <button onClick={() => setPreviewOpen(true)}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-bold text-white
                bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all active:scale-95">
              <Printer className="w-5 h-5" /> Preview & Print TC
            </button>
          </div>
        </div>
      )}

      {/* ── Empty State ────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No certificate loaded</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
              Select session, class and student above, then click <strong>Get Certificate</strong> to load the TC form.
            </p>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewOpen && tcData && (
        <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} data={tcData} meta={tcMeta} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
