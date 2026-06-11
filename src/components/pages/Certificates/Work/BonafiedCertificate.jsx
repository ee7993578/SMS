/**
 * BonafiedCertificate.jsx
 * Folder: src/pages/Certificates/BonafiedCertificate.jsx
 *
 * Converts legacy ASPX "Bonafide Certificate" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session / Class / Student / Date selection
 *  - Generate Certificate button with validation
 *  - Print-ready certificate preview panel
 *  - Mobile: stacked form + collapsible certificate preview
 *  - Desktop: side-by-side or stacked clean ERP layout
 */

import { useState, useRef, useCallback, useMemo } from 'react'
import {
  Award, ChevronDown, AlertCircle, X, Check, Loader2,
  Printer, RefreshCw, CalendarDays, User, BookOpen,
  School2, MapPin, Building2, FileText, Eye, Download,
  ChevronRight, Info, Shield, BadgeCheck
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  phone: '0135-2654321',
  email: 'info@svmdehradun.edu.in',
  affiliation: 'CBSE Affiliation No. 050123',
  principal: 'Dr. Anita Sharma',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES_DATA = {
  'Nursery':    ['A', 'B'],
  'LKG':        ['A', 'B'],
  'UKG':        ['A', 'B'],
  'Class I':    ['A', 'B'],
  'Class II':   ['A', 'B'],
  'Class III':  ['A'],
  'Class IV':   ['A'],
  'Class V':    ['A'],
  'Class VI':   ['A', 'B'],
  'Class VII':  ['A'],
  'Class VIII': ['A'],
  'Class IX':   ['A', 'B'],
  'Class X':    ['A'],
  'Class XI':   ['A', 'B'],
  'Class XII':  ['A', 'B'],
}

// Students per class (dummy)
const STUDENTS_DATA = {
  'Nursery-A':    [{ id: '001', name: 'Aarav Sharma',   father: 'Rajesh Sharma',   dob: '15 Mar 2021', gender: 'Male',   address: 'Rajpur Road, Dehradun' }],
  'Nursery-B':    [{ id: '002', name: 'Ananya Singh',   father: 'Vikram Singh',    dob: '22 Jun 2021', gender: 'Female', address: 'Haridwar Road, Dehradun' }],
  'LKG-A':        [{ id: '003', name: 'Rohan Verma',    father: 'Suresh Verma',    dob: '10 Jan 2020', gender: 'Male',   address: 'Clement Town, Dehradun' }],
  'LKG-B':        [{ id: '004', name: 'Priya Gupta',    father: 'Anil Gupta',      dob: '05 Apr 2020', gender: 'Female', address: 'Prem Nagar, Dehradun' }],
  'UKG-A':        [{ id: '005', name: 'Arjun Rawat',    father: 'Deepak Rawat',    dob: '19 Sep 2019', gender: 'Male',   address: 'Sahastradhara, Dehradun' }],
  'Class I-A':    [
    { id: '006', name: 'Kabir Mehta',    father: 'Sanjeev Mehta',   dob: '12 Jul 2018', gender: 'Male',   address: 'Race Course, Dehradun' },
    { id: '007', name: 'Siya Joshi',     father: 'Prakash Joshi',   dob: '03 Nov 2018', gender: 'Female', address: 'Karanpur, Dehradun' },
    { id: '008', name: 'Dev Thakur',     father: 'Mohan Thakur',    dob: '28 Feb 2018', gender: 'Male',   address: 'Dalanwala, Dehradun' },
  ],
  'Class I-B':    [
    { id: '009', name: 'Naina Bisht',    father: 'Gopal Bisht',     dob: '17 Aug 2018', gender: 'Female', address: 'Ballupur, Dehradun' },
    { id: '010', name: 'Harsh Negi',     father: 'Ramesh Negi',     dob: '09 Dec 2018', gender: 'Male',   address: 'Nathanpur, Dehradun' },
  ],
  'Class IX-A':   [
    { id: '011', name: 'Tanvi Arora',    father: 'Manoj Arora',     dob: '14 Mar 2010', gender: 'Female', address: 'Turner Road, Dehradun' },
    { id: '012', name: 'Parth Saxena',   father: 'Vinay Saxena',    dob: '23 Jun 2010', gender: 'Male',   address: 'Rajendra Nagar, Dehradun' },
    { id: '013', name: 'Ridhi Chauhan',  father: 'Sunil Chauhan',   dob: '07 Oct 2010', gender: 'Female', address: 'GMS Road, Dehradun' },
  ],
  'Class IX-B':   [
    { id: '014', name: 'Ayaan Khan',     father: 'Imran Khan',      dob: '11 Jan 2010', gender: 'Male',   address: 'Majra, Dehradun' },
    { id: '015', name: 'Kriti Pandey',   father: 'Dinesh Pandey',   dob: '30 Apr 2010', gender: 'Female', address: 'Jakhan, Dehradun' },
  ],
  'Class X-A':    [
    { id: '016', name: 'Ishaan Malhotra',father: 'Vivek Malhotra',  dob: '21 May 2009', gender: 'Male',   address: 'Vasant Vihar, Dehradun' },
    { id: '017', name: 'Aarohi Trivedi', father: 'Hemant Trivedi',  dob: '08 Sep 2009', gender: 'Female', address: 'Indira Nagar, Dehradun' },
  ],
  'Class XI-A':   [
    { id: '018', name: 'Vivaan Kapoor',  father: 'Rahul Kapoor',    dob: '15 Feb 2008', gender: 'Male',   address: 'Hathibarkala, Dehradun' },
    { id: '019', name: 'Meera Sharma',   father: 'Ajay Sharma',     dob: '27 Jul 2008', gender: 'Female', address: 'Chakrata Road, Dehradun' },
  ],
  'Class XII-A':  [
    { id: '020', name: 'Aditya Rawat',   father: 'Pramod Rawat',    dob: '03 Nov 2007', gender: 'Male',   address: 'Mussoorie Road, Dehradun' },
    { id: '021', name: 'Sneha Bhandari', father: 'Girish Bhandari', dob: '19 Mar 2007', gender: 'Female', address: 'Araghar, Dehradun' },
  ],
}

// Helper: get students for class+section
const getStudents = (cls, section) => {
  if (!cls || !section) return []
  const key = `${cls}-${section}`
  return STUDENTS_DATA[key] || [
    { id: `${cls}${section}01`, name: 'Rahul Kumar',  father: 'Suresh Kumar',  dob: '12 Apr 2010', gender: 'Male',   address: 'Civil Lines, Dehradun' },
    { id: `${cls}${section}02`, name: 'Priya Devi',   father: 'Ramesh Devi',   dob: '20 Aug 2010', gender: 'Female', address: 'Rajpur Road, Dehradun' },
    { id: `${cls}${section}03`, name: 'Ankur Bisht',  father: 'Mohan Bisht',   dob: '07 Jan 2010', gender: 'Male',   address: 'Haridwar Road, Dehradun' },
  ]
}

// Format today's date
const formatDate = (date) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return date
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

const todayStr = () => {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${yyyy}-${mm}-${dd}`
}

const displayDate = (val) => {
  if (!val) return ''
  const [y, m, day] = val.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${day} ${months[parseInt(m, 10) - 1]} ${y}`
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
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
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

// ─── CERTIFICATE PREVIEW ──────────────────────────────────────────────────────

function CertificatePreview({ student, cls, section, session, date }) {
  const certificateRef = useRef(null)

  const handlePrint = () => {
    const content = certificateRef.current
    if (!content) return
    const printWin = window.open('', '_blank', 'width=800,height=650')
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bonafide Certificate - ${student.name}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Times New Roman', serif; background: #fff; color: #000; }
            .cert-wrap { width: 700px; margin: 30px auto; padding: 40px; border: 3px double #1e3a5f; }
            .header { text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 18px; margin-bottom: 24px; }
            .school-name { font-size: 22px; font-weight: bold; color: #1e3a5f; letter-spacing: 1px; }
            .school-addr { font-size: 13px; color: #444; margin-top: 4px; }
            .affil { font-size: 12px; color: #666; margin-top: 3px; }
            .cert-title { text-align: center; font-size: 20px; font-weight: bold; color: #1e3a5f; text-decoration: underline; text-underline-offset: 5px; margin-bottom: 28px; letter-spacing: 2px; }
            .cert-body { font-size: 14px; line-height: 2.2; color: #222; }
            .underline-val { border-bottom: 1px solid #333; display: inline-block; min-width: 120px; padding: 0 4px; font-weight: bold; }
            .footer { margin-top: 50px; display: flex; justify-content: space-between; font-size: 13px; }
            .sig-line { border-top: 1px solid #333; padding-top: 6px; text-align: center; min-width: 160px; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="cert-wrap">
            <div class="header">
              <div class="school-name">${SCHOOL_INFO.name.toUpperCase()}</div>
              <div class="school-addr">${SCHOOL_INFO.address}</div>
              <div class="affil">${SCHOOL_INFO.affiliation} &nbsp;|&nbsp; Ph: ${SCHOOL_INFO.phone}</div>
            </div>
            <div class="cert-title">BONAFIDE CERTIFICATE</div>
            <div class="cert-body">
              <p>This is to certify that <span class="underline-val">${student.name}</span>, ${student.gender === 'Female' ? 'D/o' : 'S/o'} 
              <span class="underline-val">${student.father}</span>, is a <em>bonafide</em> student of this school 
              studying in Class <span class="underline-val">${cls} - ${section}</span> during the academic 
              session <span class="underline-val">${session}</span>.</p>
              <br/>
              <p>His/Her Date of Birth as per school records is 
              <span class="underline-val">${student.dob}</span>.</p>
              <br/>
              <p>His/Her permanent address is: <span class="underline-val">${student.address}</span>.</p>
              <br/>
              <p>This certificate is issued on the request of the student/parent for the purpose as stated by them.</p>
            </div>
            <div class="footer">
              <div>
                <p>Date: ${displayDate(date)}</p>
              </div>
              <div>
                <div class="sig-line">
                  <strong>${SCHOOL_INFO.principal}</strong><br/>Principal
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `)
    printWin.document.close()
    printWin.focus()
    setTimeout(() => printWin.print(), 400)
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <BadgeCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">Certificate Ready</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>

      {/* Certificate Card */}
      <div
        ref={certificateRef}
        className="rounded-2xl border-2 border-blue-200 dark:border-[rgba(99,102,241,0.3)] bg-white dark:bg-[#fafbff] shadow-lg overflow-hidden"
      >
        {/* Certificate Header */}
        <div className="bg-gradient-to-b from-[#1e3a5f] to-[#2a4f7c] px-6 py-5 text-white text-center">
          <div className="flex justify-center mb-2">
            <div className="w-14 h-14 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
              <School2 className="w-7 h-7 text-white" />
            </div>
          </div>
          <h2 className="text-[16px] sm:text-[18px] font-extrabold tracking-wide leading-tight">
            {SCHOOL_INFO.name.toUpperCase()}
          </h2>
          <div className="flex items-center justify-center gap-1.5 mt-1 text-blue-100 text-[12px]">
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{SCHOOL_INFO.address}</span>
          </div>
          <p className="text-[11px] text-blue-200 mt-1">{SCHOOL_INFO.affiliation} &nbsp;|&nbsp; Ph: {SCHOOL_INFO.phone}</p>
        </div>

        {/* Certificate Title */}
        <div className="text-center py-4 border-b-2 border-dashed border-blue-200 dark:border-blue-300/30 bg-blue-50/50 dark:bg-blue-500/5">
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 bg-blue-200 dark:bg-blue-400/30 max-w-[80px]" />
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              <span className="text-[16px] font-black tracking-[3px] uppercase text-blue-800 dark:text-blue-300">
                Bonafide Certificate
              </span>
              <Award className="w-5 h-5 text-blue-700 dark:text-blue-400" />
            </div>
            <div className="h-px flex-1 bg-blue-200 dark:bg-blue-400/30 max-w-[80px]" />
          </div>
        </div>

        {/* Certificate Body */}
        <div className="px-6 sm:px-10 py-7 bg-white dark:bg-[#fafbff] text-slate-800 space-y-5">
          {/* Main text */}
          <p className="text-[13.5px] leading-[2.1] font-serif">
            This is to certify that&nbsp;
            <CertField value={student.name} />,&nbsp;
            {student.gender === 'Female' ? 'Daughter of' : 'Son of'}&nbsp;
            <CertField value={student.father} />,
            is a <em className="font-semibold">bonafide</em> student of this institution, studying in&nbsp;
            Class&nbsp;<CertField value={`${cls} – ${section}`} />&nbsp;during the academic session&nbsp;
            <CertField value={session} />.
          </p>

          <p className="text-[13.5px] leading-[2.1] font-serif">
            His/Her Date of Birth as per school records is&nbsp;
            <CertField value={student.dob} />.
          </p>

          <p className="text-[13.5px] leading-[2.1] font-serif">
            His/Her permanent address is:&nbsp;
            <CertField value={student.address} />.
          </p>

          <p className="text-[13px] text-slate-600 leading-relaxed font-serif mt-2">
            This certificate is issued on the request of the student/parent for the purpose as stated by them.
          </p>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 pt-6 border-t border-slate-200">
            {/* Date */}
            <div>
              <p className="text-[12px] text-slate-500 uppercase tracking-wide font-semibold mb-1">Date of Issue</p>
              <p className="text-[14px] font-bold text-slate-800">{displayDate(date) || '—'}</p>
            </div>
            {/* Signature */}
            <div className="text-center">
              <div className="w-36 border-t-2 border-slate-400 pt-2 mx-auto">
                <p className="text-[12px] font-bold text-slate-700">{SCHOOL_INFO.principal}</p>
                <p className="text-[11px] text-slate-500">Principal</p>
              </div>
            </div>
          </div>
        </div>

        {/* Certificate Footer stripe */}
        <div className="h-2 bg-gradient-to-r from-[#1e3a5f] via-[#2a7ddc] to-[#1e3a5f]" />
      </div>

      {/* Student info chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Name',    value: student.name,   color: 'blue' },
          { label: 'Class',   value: `${cls} – ${section}`, color: 'emerald' },
          { label: 'Session', value: session,         color: 'amber' },
          { label: 'Gender',  value: student.gender,  color: 'violet' },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl p-3 border text-center
            ${color === 'blue'    ? 'bg-blue-50 border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20' : ''}
            ${color === 'emerald' ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20' : ''}
            ${color === 'amber'   ? 'bg-amber-50 border-amber-100 dark:bg-amber-500/10 dark:border-amber-500/20' : ''}
            ${color === 'violet'  ? 'bg-violet-50 border-violet-100 dark:bg-violet-500/10 dark:border-violet-500/20' : ''}
          `}>
            <p className={`text-[10px] font-bold uppercase tracking-wide mb-0.5
              ${color === 'blue'    ? 'text-blue-600 dark:text-blue-400' : ''}
              ${color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : ''}
              ${color === 'amber'   ? 'text-amber-600 dark:text-amber-400' : ''}
              ${color === 'violet'  ? 'text-violet-600 dark:text-violet-400' : ''}
            `}>{label}</p>
            <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 truncate">{value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// Inline certificate field with underline styling
function CertField({ value }) {
  return (
    <span className="inline font-bold text-blue-900 border-b-2 border-blue-300 pb-0.5 mx-0.5 px-1">
      {value}
    </span>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function BonafiedCertificate() {
  const [session,   setSession]   = useState('')
  const [cls,       setCls]       = useState('')
  const [section,   setSection]   = useState('')
  const [studentId, setStudentId] = useState('')
  const [date,      setDate]      = useState(todayStr())
  const [loading,   setLoading]   = useState(false)
  const [errors,    setErrors]    = useState({})
  const [toast,     setToast]     = useState(null)
  const [cert,      setCert]      = useState(null) // generated certificate data
  const [preview,   setPreview]   = useState(false) // mobile preview toggle

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Derived data ──────────────────────────────────────────────────────────
  const sections = useMemo(() => (cls ? CLASSES_DATA[cls] || [] : []), [cls])
  const students = useMemo(() => getStudents(cls, section), [cls, section])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSessionChange = (e) => {
    setSession(e.target.value)
    setErrors(p => ({ ...p, session: undefined }))
    resetCert()
  }

  const handleClassChange = (e) => {
    const val = e.target.value
    setCls(val); setSection(''); setStudentId('')
    setErrors(p => ({ ...p, cls: undefined }))
    resetCert()
  }

  const handleSectionChange = (e) => {
    setSection(e.target.value); setStudentId('')
    resetCert()
  }

  const handleStudentChange = (e) => {
    setStudentId(e.target.value)
    setErrors(p => ({ ...p, student: undefined }))
    resetCert()
  }

  const resetCert = () => { setCert(null); setPreview(false) }

  const handleReset = () => {
    setSession(''); setCls(''); setSection(''); setStudentId('')
    setDate(todayStr()); setErrors({}); setCert(null); setPreview(false)
  }

  // Validate and generate
  const handleGenerate = useCallback(() => {
    const err = {}
    if (!session)   err.session = 'Select a session'
    if (!cls)       err.cls     = 'Select a class'
    if (!section)   err.section = 'Select a section'
    if (!studentId) err.student = 'Select a student'
    if (!date)      err.date    = 'Select a date'

    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setCert(null)

    // Simulate API call
    setTimeout(() => {
      const student = students.find(s => s.id === studentId)
      if (!student) { showToast('Student not found.', 'error'); setLoading(false); return }
      setCert({ student, cls, section, session, date })
      setLoading(false)
      setPreview(true)
      showToast(`Certificate generated for ${student.name}.`)
    }, 700)
  }, [session, cls, section, studentId, date, students])

  return (
    <div className="space-y-5 pb-12">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <Award className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Bonafide Certificate
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Generate and print bonafide certificates for enrolled students.
          </p>
        </div>
        {cert && (
          <button
            onClick={handleReset}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* ── Form Card ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Select Details</span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All fields are required</span>
          </div>
        </div>

        {/* Form Grid */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Session */}
            <Field label="Session" error={errors.session} required icon={BookOpen}>
              <NativeSelect
                value={session}
                onChange={handleSessionChange}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.cls} required icon={School2}>
              <NativeSelect
                value={cls}
                onChange={handleClassChange}
                placeholder="-- Select Class --"
                error={errors.cls}
                disabled={!session}
              >
                {Object.keys(CLASSES_DATA).map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </NativeSelect>
            </Field>

            {/* Section — derived from class */}
            {cls && (
              <Field label="Section" error={errors.section} required icon={BookOpen}>
                <NativeSelect
                  value={section}
                  onChange={handleSectionChange}
                  placeholder="-- Select Section --"
                  error={errors.section}
                >
                  {sections.map(sec => (
                    <option key={sec} value={sec}>Section {sec}</option>
                  ))}
                </NativeSelect>
              </Field>
            )}

            {/* Student */}
            <Field label="Student" error={errors.student} required icon={User}>
              <NativeSelect
                value={studentId}
                onChange={handleStudentChange}
                placeholder="-- Select Student --"
                error={errors.student}
                disabled={!section}
              >
                {students.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </NativeSelect>
            </Field>

            {/* Date */}
            <Field label="Date" error={errors.date} required icon={CalendarDays}>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: undefined })) }}
                  max={todayStr()}
                  className={`w-full pl-3 pr-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                    bg-white text-slate-800
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
                    ${errors.date ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                />
              </div>
            </Field>

          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.12)]">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold
                text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Eye className="w-4 h-4" />}
              {loading ? 'Generating…' : 'Get Certificate'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>

            {cert && (
              <div className="sm:ml-auto flex items-center gap-2 text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <BadgeCheck className="w-4 h-4" />
                Certificate Generated
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Loading Skeleton ────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            <span className="text-[14px] font-semibold text-slate-600 dark:text-slate-300">Generating certificate…</span>
          </div>
          <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="h-40 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse opacity-80" />
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse opacity-60" />
        </div>
      )}

      {/* ── Certificate Preview ──────────────────────────────────────────── */}
      {cert && !loading && (
        <>
          {/* Mobile toggle */}
          <button
            onClick={() => setPreview(p => !p)}
            className="flex sm:hidden w-full items-center justify-between px-5 py-3.5 rounded-2xl border-2
              border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/10
              text-blue-700 dark:text-indigo-300 font-semibold text-[14px] transition-all"
          >
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Certificate Preview
            </div>
            <ChevronRight className={`w-5 h-5 transition-transform duration-200 ${preview ? 'rotate-90' : ''}`} />
          </button>

          {/* Desktop: always show. Mobile: show when preview toggled */}
          <div className={`${preview ? 'block' : 'hidden'} sm:block`}>
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              {/* Card header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
                <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Certificate Preview</span>
                <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 font-semibold">
                  <Shield className="w-3 h-3" />
                  Ready to Print
                </div>
              </div>

              <div className="p-5">
                <CertificatePreview
                  student={cert.student}
                  cls={cert.cls}
                  section={cert.section}
                  session={cert.session}
                  date={cert.date}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!cert && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Award className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No certificate generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session, class, section, student and date, then click <strong>Get Certificate</strong> to generate the bonafide certificate.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
