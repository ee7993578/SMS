/**
 * IncomeCertificate.jsx
 * Folder: src/pages/Student/Certificates/IncomeCertificate.jsx
 *
 * Converts legacy ASPX "Income Certificate" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session dropdown filter
 *  - Class dropdown filter (cascades from session)
 *  - Student dropdown filter (cascades from class)
 *  - Get Certificate button
 *  - Rendered certificate preview (replaces ReportViewer)
 *  - Print / Download placeholder actions
 *  - Mobile: stacked card layout with drawer filters
 *  - Desktop: clean ERP-style layout
 */

import { useState, useMemo, useCallback } from 'react'
import {
  FileText, ChevronDown, AlertCircle, X, Check, Loader2,
  Printer, Download, RefreshCw, Eye, User, BookOpen,
  School2, MapPin, Building2, Calendar, SlidersHorizontal,
  IndianRupee, Users, GraduationCap, BadgeCheck, Info,
  ChevronRight, Filter
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  phone: '0135-2712345',
  email: 'info@svmdehradun.edu.in',
  affiliation: 'CBSE Affiliation No. 2130XXX',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

// Classes per session (same across sessions for simplicity)
const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

// Dummy students per class (in real use, fetched from API)
const STUDENTS_BY_CLASS = {
  'Nursery':    [{ id: 1, name: 'Aarav Sharma',     father: 'Rajesh Sharma',     mother: 'Sunita Sharma',     income: 120000, address: 'House No. 12, Civil Lines, Dehradun', dob: '15 Apr 2020', rollNo: 'NUR-001', caste: 'General' },
                 { id: 2, name: 'Priya Gupta',       father: 'Suresh Gupta',      mother: 'Meena Gupta',       income: 95000,  address: 'Rajpur Road, Dehradun',              dob: '20 Jun 2020', rollNo: 'NUR-002', caste: 'OBC' }],
  'LKG':        [{ id: 3, name: 'Rohan Verma',       father: 'Amit Verma',        mother: 'Kavita Verma',      income: 145000, address: 'Chakrata Road, Dehradun',            dob: '10 Mar 2019', rollNo: 'LKG-001', caste: 'General' },
                 { id: 4, name: 'Sneha Rawat',       father: 'Dinesh Rawat',      mother: 'Geeta Rawat',       income: 80000,  address: 'Raipur, Dehradun',                   dob: '05 Sep 2019', rollNo: 'LKG-002', caste: 'SC' }],
  'UKG':        [{ id: 5, name: 'Arjun Singh',       father: 'Pawan Singh',       mother: 'Anjali Singh',      income: 200000, address: 'Vasant Vihar, Dehradun',             dob: '22 Jan 2018', rollNo: 'UKG-001', caste: 'General' }],
  'Class I':    [{ id: 6, name: 'Neha Bisht',        father: 'Mohan Bisht',       mother: 'Rekha Bisht',       income: 130000, address: 'Patel Nagar, Dehradun',              dob: '14 Aug 2017', rollNo: 'I-001',   caste: 'OBC' },
                 { id: 7, name: 'Vikram Chauhan',    father: 'Ramesh Chauhan',    mother: 'Sushma Chauhan',    income: 175000, address: 'Ballupur, Dehradun',                 dob: '03 Dec 2017', rollNo: 'I-002',   caste: 'General' }],
  'Class II':   [{ id: 8, name: 'Riya Negi',         father: 'Sunil Negi',        mother: 'Poonam Negi',       income: 110000, address: 'Majra, Dehradun',                    dob: '28 Feb 2016', rollNo: 'II-001',  caste: 'SC' }],
  'Class III':  [{ id: 9, name: 'Aditya Joshi',      father: 'Vijay Joshi',       mother: 'Seema Joshi',       income: 160000, address: 'Karanpur, Dehradun',                 dob: '11 Jul 2015', rollNo: 'III-001', caste: 'General' }],
  'Class IV':   [{ id: 10, name: 'Pooja Panwar',     father: 'Girish Panwar',     mother: 'Manju Panwar',      income: 90000,  address: 'Dalanwala, Dehradun',                dob: '19 Oct 2014', rollNo: 'IV-001',  caste: 'OBC' }],
  'Class V':    [{ id: 11, name: 'Kabir Thapa',      father: 'Narayan Thapa',     mother: 'Laxmi Thapa',       income: 125000, address: 'Clement Town, Dehradun',             dob: '07 May 2013', rollNo: 'V-001',   caste: 'ST' }],
  'Class VI':   [{ id: 12, name: 'Divya Kandpal',    father: 'Hemant Kandpal',    mother: 'Shobha Kandpal',    income: 180000, address: 'Rajpur Road, Dehradun',              dob: '25 Jan 2012', rollNo: 'VI-001',  caste: 'General' },
                 { id: 13, name: 'Ankit Uniyal',     father: 'Deepak Uniyal',     mother: 'Mamta Uniyal',      income: 105000, address: 'Niranjanpur, Dehradun',              dob: '09 Nov 2012', rollNo: 'VI-002',  caste: 'OBC' }],
  'Class VII':  [{ id: 14, name: 'Simran Arora',     father: 'Naveen Arora',      mother: 'Reena Arora',       income: 220000, address: 'GMS Road, Dehradun',                 dob: '30 Apr 2011', rollNo: 'VII-001', caste: 'General' }],
  'Class VIII': [{ id: 15, name: 'Mohit Balodi',     father: 'Ganesh Balodi',     mother: 'Pushpa Balodi',     income: 95000,  address: 'Sewla Kalan, Dehradun',              dob: '12 Jun 2010', rollNo: 'VIII-001',caste: 'SC' }],
  'Class IX':   [{ id: 16, name: 'Sakshi Dobhal',    father: 'Harish Dobhal',     mother: 'Usha Dobhal',       income: 155000, address: 'Indira Nagar, Dehradun',             dob: '18 Aug 2009', rollNo: 'IX-001',  caste: 'General' },
                 { id: 17, name: 'Harsh Badola',     father: 'Prakash Badola',    mother: 'Savita Badola',     income: 115000, address: 'Doon Vihar, Dehradun',               dob: '02 Mar 2009', rollNo: 'IX-002',  caste: 'OBC' }],
  'Class X':    [{ id: 18, name: 'Tanvi Mehra',      father: 'Sanjeev Mehra',     mother: 'Renu Mehra',        income: 190000, address: 'Sahastradhara Road, Dehradun',       dob: '21 Sep 2008', rollNo: 'X-001',   caste: 'General' }],
  'Class XI':   [{ id: 19, name: 'Shreya Semwal',    father: 'Rakesh Semwal',     mother: 'Nirmala Semwal',    income: 135000, address: 'Hathibarkala, Dehradun',             dob: '14 Dec 2007', rollNo: 'XI-001',  caste: 'OBC' }],
  'Class XII':  [{ id: 20, name: 'Rahul Aswal',      father: 'Bharat Aswal',      mother: 'Kamla Aswal',       income: 170000, address: 'Mothrowala, Dehradun',               dob: '06 Feb 2007', rollNo: 'XII-001', caste: 'General' },
                 { id: 21, name: 'Priyanka Nautiyal', father: 'Suresh Nautiyal', mother: 'Saroj Nautiyal',     income: 88000,  address: 'Rishikesh Road, Dehradun',           dob: '17 Jul 2006', rollNo: 'XII-002', caste: 'ST' }],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

const numberToWords = (num) => {
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']
  const toWords = (n) => {
    if (n === 0) return ''
    if (n < 20) return a[n] + ' '
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '') + ' '
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred ' + toWords(n % 100)
    if (n < 100000) return toWords(Math.floor(n / 1000)) + 'Thousand ' + toWords(n % 1000)
    if (n < 10000000) return toWords(Math.floor(n / 100000)) + 'Lakh ' + toWords(n % 100000)
    return toWords(Math.floor(n / 10000000)) + 'Crore ' + toWords(n % 10000000)
  }
  return toWords(num).trim()
}

const todayFormatted = () => {
  return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
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
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
      <button onClick={onClose} className="opacity-75 hover:opacity-100"><X className="w-4 h-4" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, session, setSession, className, setClassName, student, setStudent, onGenerate, loading, errors, studentOptions }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Select Student</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Fields */}
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => { setSession(e.target.value); setClassName(''); }} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.className} required>
            <NativeSelect value={className} onChange={e => { setClassName(e.target.value); }} placeholder="-- Select Class --" disabled={!session} error={errors.className}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Student" error={errors.student} required>
            <NativeSelect value={student} onChange={e => setStudent(e.target.value)} placeholder="-- Select Student --" disabled={!className} error={errors.student}>
              {studentOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </NativeSelect>
          </Field>
        </div>
        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onGenerate(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Get Certificate
          </button>
        </div>
      </div>
    </>
  )
}

// ─── CERTIFICATE PREVIEW ──────────────────────────────────────────────────────

function CertificatePreview({ student, session, className }) {
  const amountWords = numberToWords(student.income)
  const issueDate = todayFormatted()

  return (
    <div
      id="certificate-print-area"
      className="bg-white rounded-2xl border-2 border-slate-200 shadow-xl overflow-hidden"
    >
      {/* Decorative top bar */}
      <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-700" />

      <div className="p-6 sm:p-10">
        {/* School Header */}
        <div className="text-center mb-8 pb-6 border-b-2 border-dashed border-slate-200">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/25">
              <School2 className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-[17px] sm:text-[20px] font-extrabold text-slate-800 leading-tight">{SCHOOL_INFO.name}</h1>
              <p className="text-[12px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />{SCHOOL_INFO.address}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-2 text-[11px] text-slate-400">
            <span>📞 {SCHOOL_INFO.phone}</span>
            <span>✉ {SCHOOL_INFO.email}</span>
            <span>🎓 {SCHOOL_INFO.affiliation}</span>
          </div>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <div className="inline-flex flex-col items-center gap-1">
            <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-blue-600 bg-blue-50 px-4 py-1 rounded-full border border-blue-100">
              Official Document
            </span>
            <h2 className="text-[22px] sm:text-[26px] font-extrabold text-slate-800 mt-2 tracking-tight">
              Income Certificate
            </h2>
            <div className="w-16 h-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 mt-1" />
          </div>
        </div>

        {/* Certificate Body */}
        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-5 sm:p-7 mb-7 text-[14px] sm:text-[15px] leading-relaxed text-slate-700 space-y-4">
          <p>
            This is to certify that <span className="font-bold text-slate-900">{student.name}</span>,
            son/daughter of <span className="font-semibold text-slate-800">{student.father}</span> and{' '}
            <span className="font-semibold text-slate-800">{student.mother}</span>, residing at{' '}
            <span className="font-semibold text-slate-800">{student.address}</span>,
            is a bonafide student of this institution.
          </p>
          <p>
            The student is currently enrolled in <span className="font-bold text-slate-900">{className}</span>{' '}
            (Roll No. <span className="font-bold text-slate-900">{student.rollNo}</span>) for the academic session{' '}
            <span className="font-bold text-blue-700">{session}</span>.
          </p>
          <p>
            It is hereby certified that the total annual family income of the above-named student is{' '}
            <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
              {formatINR(student.income)} ({amountWords} Rupees Only)
            </span>{' '}
            per annum as reported by the parent/guardian.
          </p>
          <p>
            Category / Caste: <span className="font-bold text-slate-900">{student.caste}</span>.
          </p>
          <p>
            This certificate is issued on the request of the student for the purpose of{' '}
            <span className="font-semibold">scholarship / fee concession / government scheme</span> and
            is valid for the current academic session only.
          </p>
        </div>

        {/* Student Info Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: User,          label: 'Student Name',  value: student.name },
            { icon: GraduationCap, label: 'Class',         value: className },
            { icon: BookOpen,      label: 'Roll Number',   value: student.rollNo },
            { icon: Calendar,      label: 'Date of Birth', value: student.dob },
            { icon: IndianRupee,   label: 'Annual Income', value: formatINR(student.income) },
            { icon: BadgeCheck,    label: 'Category',      value: student.caste },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-xl border border-slate-100 bg-white px-4 py-3 flex flex-col gap-1 shadow-sm">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[10px] font-bold uppercase tracking-wide">{label}</span>
              </div>
              <span className="text-[13px] font-semibold text-slate-800 break-words">{value}</span>
            </div>
          ))}
        </div>

        {/* Footer / Signatures */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-8 pt-6 border-t border-slate-200">
          <div className="flex flex-col gap-1">
            <div className="w-40 border-b-2 border-slate-400 mb-1" />
            <span className="text-[12px] font-bold text-slate-700">Class Teacher</span>
            <span className="text-[11px] text-slate-400">{SCHOOL_INFO.name}</span>
          </div>
          <div className="text-center sm:text-right">
            <p className="text-[11px] text-slate-400 mb-1">Issue Date</p>
            <p className="text-[13px] font-bold text-slate-700">{issueDate}</p>
          </div>
          <div className="flex flex-col gap-1 sm:items-end">
            <div className="w-40 border-b-2 border-slate-400 mb-1" />
            <span className="text-[12px] font-bold text-slate-700">Principal</span>
            <span className="text-[11px] text-slate-400">With Official Seal</span>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-100">
          <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-700 leading-relaxed">
            This is a computer-generated certificate and is valid without a physical signature. For verification, contact the school office.
          </p>
        </div>
      </div>

      {/* Decorative bottom bar */}
      <div className="h-2 bg-gradient-to-r from-blue-700 via-indigo-500 to-blue-600" />
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function IncomeCertificate() {
  const [session,     setSession]     = useState('')
  const [className,   setClassName]   = useState('')
  const [studentId,   setStudentId]   = useState('')
  const [certificate, setCertificate] = useState(null)   // { student, session, className }
  const [loading,     setLoading]     = useState(false)
  const [printing,    setPrinting]    = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Students available for the selected class
  const studentOptions = useMemo(() =>
    className ? (STUDENTS_BY_CLASS[className] || []) : [],
    [className]
  )

  // Validation
  const validate = () => {
    const err = {}
    if (!session)   err.session   = 'Please select a session'
    if (!className) err.className = 'Please select a class'
    if (!studentId) err.student   = 'Please select a student'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // Generate certificate
  const handleGenerate = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const student = studentOptions.find(s => String(s.id) === String(studentId))
      if (!student) {
        showToast('Student not found. Please try again.', 'error')
        setLoading(false)
        return
      }
      setCertificate({ student, session, className })
      setLoading(false)
      showToast(`Certificate generated for ${student.name}.`)
    }, 700)
  }, [session, className, studentId, studentOptions])

  const handleReset = () => {
    setSession(''); setClassName(''); setStudentId('')
    setErrors({}); setCertificate(null)
  }

  // Print handler
  const handlePrint = () => {
    setPrinting(true)
    setTimeout(() => {
      window.print()
      setPrinting(false)
    }, 300)
  }

  // Active filter count for mobile badge
  const activeFilters = [session, className, studentId].filter(Boolean).length

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Income Certificate
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Generate income certificate for a student — for scholarship or fee concession purposes.
          </p>
        </div>

        {/* Desktop action buttons */}
        {certificate && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              disabled={printing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-700 text-white hover:bg-slate-800 shadow-md shadow-slate-500/20
                transition-all active:scale-95 disabled:opacity-70"
            >
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              Print
            </button>
            <button
              type="button"
              onClick={() => showToast('PDF download — API integration pending.')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        )}
      </div>

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
        <span className="hover:text-blue-600 cursor-pointer">Home</span>
        <ChevronRight className="w-3 h-3" />
        <span className="hover:text-blue-600 cursor-pointer">Certificates</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600 dark:text-slate-300 font-semibold">Income Certificate</span>
      </nav>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
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
                onChange={e => { setSession(e.target.value); setClassName(''); setStudentId(''); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.className} required>
              <NativeSelect
                value={className}
                onChange={e => { setClassName(e.target.value); setStudentId(''); setErrors(p => ({ ...p, className: undefined })) }}
                placeholder="-- Select Class --"
                disabled={!session}
                error={errors.className}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Student */}
            <Field label="Student" error={errors.student} required>
              <NativeSelect
                value={studentId}
                onChange={e => { setStudentId(e.target.value); setErrors(p => ({ ...p, student: undefined })) }}
                placeholder="-- Select Student --"
                disabled={!className}
                error={errors.student}
              >
                {studentOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Get Certificate
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset"
                className="flex items-center justify-center px-3 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {studentId
            ? studentOptions.find(s => String(s.id) === String(studentId))?.name ?? 'Select Student'
            : className || session || 'Select Student'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}/3</span>
          )}
        </button>
        {certificate && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
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
        className={className}
        setClassName={setClassName}
        student={studentId}
        setStudent={setStudentId}
        onGenerate={handleGenerate}
        loading={loading}
        errors={errors}
        studentOptions={studentOptions}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-8 space-y-4">
          <div className="flex justify-center mb-6">
            <div className="h-16 w-48 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          </div>
          <div className="h-8 w-56 mx-auto rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-full rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-3/4 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-4 w-5/6 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="grid grid-cols-3 gap-3 mt-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* ── Certificate Panel ─────────────────────────────────────────────── */}
      {certificate && !loading && (
        <>
          {/* Mobile Action Bar */}
          <div className="flex sm:hidden gap-2">
            <button
              type="button"
              onClick={handlePrint}
              disabled={printing}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                bg-slate-700 text-white hover:bg-slate-800 shadow-sm disabled:opacity-70 transition-all"
            >
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              Print
            </button>
            <button
              type="button"
              onClick={() => showToast('PDF download — API integration pending.')}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm transition-all"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          {/* Certificate */}
          <CertificatePreview
            student={certificate.student}
            session={certificate.session}
            className={certificate.className}
          />
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!certificate && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-5 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText className="w-8 h-8 opacity-50" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">No certificate generated</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>session</strong>, <strong>class</strong>, and <strong>student</strong>, then click <strong>Get Certificate</strong>.
            </p>
          </div>

          {/* Quick steps hint */}
          <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
            {['Select Session', 'Select Class', 'Select Student', 'Get Certificate'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">{step}</span>
                </div>
                {i < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 hidden sm:block" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Print styles */}
      <style>{`
        @media print {
          body > *:not(#certificate-print-area) { display: none !important; }
          #certificate-print-area { display: block !important; box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  )
}
