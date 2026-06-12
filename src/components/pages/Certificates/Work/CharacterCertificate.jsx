/**
 * CharacterCertificate.jsx
 * Folder: src/pages/Student/Certificates/CharacterCertificate.jsx
 *
 * Converts legacy ASPX "Character Certificate" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session / Class / Student dropdowns (cascading)
 *  - Date picker (calendar input)
 *  - Admission Year field
 *  - Get Certificate button with validation
 *  - Certificate preview card (printable)
 *  - Mobile: stacked form + full-width certificate preview
 *  - Desktop: side panel filter + certificate preview
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Award, ChevronDown, CalendarDays, User, BookOpen,
  AlertCircle, X, Check, Loader2, Printer,
  GraduationCap, Building2, MapPin, School2,
  FileText, RefreshCw, Search, Info,
  Shield, Star, ClipboardList, ChevronRight
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  phone: '+91-135-2710123',
  email: 'info@svmschool.edu.in',
  affiliation: 'CBSE Affiliation No. 05001234',
}

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

// Section-wise student data keyed by class
const STUDENTS_BY_CLASS = {
  'Nursery':    [{ id: 1, name: 'Aarav Sharma',     roll: 'NR-001', father: 'Rajesh Sharma',    mother: 'Priya Sharma',    dob: '15 Mar 2021', address: 'House No. 12, Rajpur Road, Dehradun' }],
  'LKG':        [{ id: 2, name: 'Ananya Singh',     roll: 'LK-001', father: 'Vikram Singh',     mother: 'Sunita Singh',    dob: '22 Jun 2020', address: '45 Haridwar Road, Dehradun' }],
  'UKG':        [{ id: 3, name: 'Rohan Gupta',      roll: 'UK-001', father: 'Sunil Gupta',      mother: 'Meera Gupta',     dob: '08 Jan 2019', address: '78 Race Course, Dehradun' }],
  'Class I':    [
    { id: 4,  name: 'Priya Verma',      roll: 'I-001',  father: 'Anil Verma',       mother: 'Kavita Verma',    dob: '05 Apr 2018', address: '23 Saharanpur Road, Dehradun' },
    { id: 5,  name: 'Arjun Mehta',      roll: 'I-002',  father: 'Deepak Mehta',     mother: 'Neha Mehta',      dob: '17 Sep 2018', address: '56 Clock Tower, Dehradun' },
  ],
  'Class II':   [
    { id: 6,  name: 'Shreya Patel',     roll: 'II-001', father: 'Hitesh Patel',     mother: 'Hetal Patel',     dob: '12 Feb 2017', address: '34 Patel Nagar, Dehradun' },
    { id: 7,  name: 'Dev Kumar',        roll: 'II-002', father: 'Manoj Kumar',      mother: 'Shalini Kumar',   dob: '25 Jul 2017', address: '89 Ballupur Road, Dehradun' },
  ],
  'Class III':  [{ id: 8,  name: 'Ishaan Joshi',     roll: 'III-001',father: 'Neeraj Joshi',     mother: 'Renu Joshi',      dob: '30 Nov 2016', address: '12 Karanpur, Dehradun' }],
  'Class IV':   [{ id: 9,  name: 'Tanvi Rawat',      roll: 'IV-001', father: 'Gopal Rawat',      mother: 'Laxmi Rawat',     dob: '18 Aug 2015', address: '67 Rispana Pul, Dehradun' }],
  'Class V':    [{ id: 10, name: 'Kabir Thakur',     roll: 'V-001',  father: 'Suresh Thakur',    mother: 'Geeta Thakur',    dob: '03 May 2014', address: '45 Chakrata Road, Dehradun' }],
  'Class VI':   [
    { id: 11, name: 'Aisha Khan',       roll: 'VI-001', father: 'Imran Khan',       mother: 'Fatima Khan',     dob: '21 Jan 2013', address: '78 Rispana, Dehradun' },
    { id: 12, name: 'Nikhil Saxena',    roll: 'VI-002', father: 'Vivek Saxena',     mother: 'Vandana Saxena',  dob: '14 Oct 2013', address: '23 Balliwala Chowk, Dehradun' },
  ],
  'Class VII':  [{ id: 13, name: 'Pooja Bisht',      roll: 'VII-001',father: 'Dinesh Bisht',     mother: 'Kamla Bisht',     dob: '07 Jun 2012', address: '56 Jakhan, Dehradun' }],
  'Class VIII': [{ id: 14, name: 'Rahul Negi',       roll: 'VIII-001',father:'Mohan Negi',        mother: 'Seema Negi',      dob: '28 Mar 2011', address: '90 Mussoorie Diversion, Dehradun' }],
  'Class IX':   [
    { id: 15, name: 'Simran Chauhan',   roll: 'IX-001', father: 'Rakesh Chauhan',   mother: 'Usha Chauhan',    dob: '11 Dec 2010', address: '34 Survey Road, Dehradun' },
    { id: 16, name: 'Aditya Pandey',    roll: 'IX-002', father: 'Sanjay Pandey',    mother: 'Rekha Pandey',    dob: '19 Feb 2010', address: '67 Rajpur, Dehradun' },
  ],
  'Class X':    [{ id: 17, name: 'Megha Rana',       roll: 'X-001',  father: 'Prakash Rana',     mother: 'Sunita Rana',     dob: '05 Sep 2009', address: '45 Clement Town, Dehradun' }],
  'Class XI':   [
    { id: 18, name: 'Vivek Tomar',      roll: 'XI-001', father: 'Harish Tomar',     mother: 'Anita Tomar',     dob: '22 Apr 2008', address: '78 Prem Nagar, Dehradun' },
    { id: 19, name: 'Riya Dobhal',      roll: 'XI-002', father: 'Kamal Dobhal',     mother: 'Pushpa Dobhal',   dob: '16 Nov 2008', address: '12 Saket Colony, Dehradun' },
  ],
  'Class XII':  [
    { id: 20, name: 'Harsh Uniyal',     roll: 'XII-001',father: 'Trilok Uniyal',    mother: 'Vimla Uniyal',    dob: '03 Jul 2007', address: '56 Vasant Vihar, Dehradun' },
    { id: 21, name: 'Komal Rawat',      roll: 'XII-002',father: 'Bhupesh Rawat',    mother: 'Manju Rawat',     dob: '28 Jan 2007', address: '89 Turner Road, Dehradun' },
  ],
}

// Format today's date as "dd MMM yyyy"
const todayFormatted = () => {
  const d = new Date()
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`
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

function Field({ label, error, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="ml-1 text-[10px] font-normal text-slate-400 normal-case tracking-normal">({hint})</span>
        )}
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

// ─── CERTIFICATE PREVIEW COMPONENT ───────────────────────────────────────────

function CertificatePreview({ student, session, issueDate, className, admissionYear, printRef }) {
  const currentYear = new Date().getFullYear()

  return (
    <div
      ref={printRef}
      className="bg-white rounded-2xl border-2 border-blue-200 shadow-xl overflow-hidden print:shadow-none print:border-none"
    >
      {/* Certificate Border Decoration */}
      <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600" />

      <div className="p-6 sm:p-8">
        {/* School Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-7 h-7 text-blue-600" />
            </div>
            <div className="text-left">
              <h2 className="text-[15px] sm:text-[17px] font-extrabold text-slate-800 leading-tight">{SCHOOL_INFO.name}</h2>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3 flex-shrink-0" />{SCHOOL_INFO.address}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400">
            <span>{SCHOOL_INFO.phone}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{SCHOOL_INFO.email}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300" />
            <span>{SCHOOL_INFO.affiliation}</span>
          </div>
          {/* Divider */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-blue-200" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">Character Certificate</span>
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
            </div>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-blue-200" />
          </div>
        </div>

        {/* Certificate Number & Date Row */}
        <div className="flex flex-col sm:flex-row justify-between gap-2 mb-5 text-[12px] text-slate-500">
          <span>Certificate No.: <strong className="text-slate-700">CC/{currentYear}/{String(student.id).padStart(4,'0')}</strong></span>
          <span>Date: <strong className="text-slate-700">{issueDate}</strong></span>
        </div>

        {/* Main Body */}
        <div className="text-[13px] text-slate-700 leading-relaxed space-y-4">
          <p>
            This is to certify that <strong className="text-slate-900">{student.name}</strong>,{' '}
            son/daughter of <strong className="text-slate-900">{student.father}</strong> and{' '}
            <strong className="text-slate-900">{student.mother}</strong>, residing at{' '}
            <em>{student.address}</em>, was a bonafide student of this institution.
          </p>
          <p>
            He/She was admitted to this school in the year{' '}
            <strong className="text-slate-900">{admissionYear}</strong> and studied in{' '}
            <strong className="text-slate-900">{className}</strong> during the academic session{' '}
            <strong className="text-slate-900">{session}</strong>.
          </p>
          <p>
            His/Her Date of Birth as recorded in the school register is{' '}
            <strong className="text-slate-900">{student.dob}</strong>.
          </p>
          <p>
            During his/her stay in this institution, his/her{' '}
            <strong className="text-emerald-700">conduct and character were found to be good</strong>.
            He/She was hardworking, sincere, and a well-disciplined student.
          </p>
          <p>
            This certificate is being issued on the request of the student/parent for submission wherever required.
          </p>
        </div>

        {/* Student Info Grid */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: 'Student Name',    value: student.name,       icon: User },
            { label: "Father's Name",   value: student.father,     icon: User },
            { label: "Mother's Name",   value: student.mother,     icon: User },
            { label: 'Roll Number',     value: student.roll,       icon: ClipboardList },
            { label: 'Class',           value: className,           icon: BookOpen },
            { label: 'Session',         value: session,             icon: CalendarDays },
            { label: 'Date of Birth',   value: student.dob,        icon: CalendarDays },
            { label: 'Admission Year',  value: admissionYear,       icon: School2 },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-start gap-3 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
              <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon className="w-3.5 h-3.5 text-blue-600" />
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
                <p className="text-[13px] font-semibold text-slate-800 truncate">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Signature Section */}
        <div className="mt-8 flex flex-col sm:flex-row justify-between items-end gap-6">
          <div className="text-center">
            <div className="w-32 border-b border-slate-400 mb-1" />
            <p className="text-[12px] font-semibold text-slate-600">Class Teacher</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200">
            <Shield className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-700">Verified & Issued</p>
              <p className="text-[11px] text-emerald-600">{issueDate}</p>
            </div>
          </div>
          <div className="text-center">
            <div className="w-32 border-b border-slate-400 mb-1" />
            <p className="text-[12px] font-semibold text-slate-600">Principal</p>
            <p className="text-[10px] text-slate-400">{SCHOOL_INFO.name}</p>
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="h-2 bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-600" />
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CharacterCertificate() {
  const [session,        setSession]        = useState('')
  const [selectedClass,  setSelectedClass]  = useState('')
  const [studentId,      setStudentId]      = useState('')
  const [issueDate,      setIssueDate]      = useState(todayFormatted())
  const [admissionYear,  setAdmissionYear]  = useState('')
  const [errors,         setErrors]         = useState({})
  const [loading,        setLoading]        = useState(false)
  const [certificateData,setCertificateData]= useState(null)
  const [toast,          setToast]          = useState(null)
  const printRef = useRef(null)

  // Cascading: students list based on selected class
  const studentList = useMemo(() => {
    return STUDENTS_BY_CLASS[selectedClass] || []
  }, [selectedClass])

  const selectedStudent = useMemo(() => {
    return studentList.find(s => String(s.id) === String(studentId)) || null
  }, [studentList, studentId])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Cascade: reset student on class change
  const handleClassChange = (val) => {
    setSelectedClass(val)
    setStudentId('')
    setCertificateData(null)
    setErrors(p => ({ ...p, class: undefined, student: undefined }))
  }

  // Validate & generate certificate
  const handleGetCertificate = useCallback(() => {
    const err = {}
    if (!session)       err.session       = 'Please select a session'
    if (!selectedClass) err.class         = 'Please select a class'
    if (!studentId)     err.student       = 'Please select a student'
    if (!issueDate)     err.issueDate     = 'Please enter a date'
    if (!admissionYear) err.admissionYear = 'Please enter admission year'

    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setCertificateData(null)

    // Simulate API call
    setTimeout(() => {
      setCertificateData({
        student:        selectedStudent,
        session,
        className:      selectedClass,
        issueDate,
        admissionYear,
      })
      setLoading(false)
      showToast(`Certificate generated for ${selectedStudent.name}`)
    }, 800)
  }, [session, selectedClass, studentId, issueDate, admissionYear, selectedStudent])

  const handleReset = () => {
    setSession('')
    setSelectedClass('')
    setStudentId('')
    setIssueDate(todayFormatted())
    setAdmissionYear('')
    setErrors({})
    setCertificateData(null)
  }

  const handlePrint = () => {
    if (!certificateData) return
    window.print()
  }

  return (
    <div className="space-y-5 pb-10">

      {/* ── Page Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Character Certificate
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Generate and print character certificates for students.
          </p>
        </div>
        {certificateData && (
          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
          >
            <Printer className="w-4 h-4" />
            Print Certificate
          </button>
        )}
      </div>

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
        <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="hover:text-blue-600 cursor-pointer transition-colors">Certificates</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-blue-600 dark:text-indigo-400 font-semibold">Character Certificate</span>
      </nav>

      {/* ── Filter Card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Certificate Details</span>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All fields are required</span>
          </div>
        </div>

        <div className="p-5">
          {/* Form Grid: 2 cols on sm, 3 on lg */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

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
            <Field label="Class" error={errors.class} required>
              <NativeSelect
                value={selectedClass}
                onChange={e => handleClassChange(e.target.value)}
                placeholder="-- Select Class --"
                error={errors.class}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Student */}
            <Field label="Student" error={errors.student} required>
              <NativeSelect
                value={studentId}
                onChange={e => { setStudentId(e.target.value); setErrors(p => ({ ...p, student: undefined })); setCertificateData(null) }}
                placeholder={selectedClass ? '-- Select Student --' : '-- Select Class First --'}
                error={errors.student}
                disabled={!selectedClass}
              >
                {studentList.map(s => <option key={s.id} value={s.id}>{s.name} ({s.roll})</option>)}
              </NativeSelect>
            </Field>

            {/* Date */}
            <Field label="Issue Date" error={errors.issueDate} required>
              <div className="relative">
                <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={(() => {
                    // Convert "dd MMM yyyy" ↔ "yyyy-mm-dd" for input
                    try {
                      const parts = issueDate.split(' ')
                      const months = { Jan:'01',Feb:'02',Mar:'03',Apr:'04',May:'05',Jun:'06',Jul:'07',Aug:'08',Sep:'09',Oct:'10',Nov:'11',Dec:'12' }
                      return `${parts[2]}-${months[parts[1]]}-${parts[0]}`
                    } catch { return '' }
                  })()}
                  onChange={e => {
                    const d = new Date(e.target.value)
                    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                    const formatted = `${String(d.getDate()).padStart(2,'0')} ${months[d.getMonth()]} ${d.getFullYear()}`
                    setIssueDate(formatted)
                    setErrors(p => ({ ...p, issueDate: undefined }))
                  }}
                  className={`w-full pl-9 pr-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                    bg-white text-slate-800
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
                    ${errors.issueDate ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                />
              </div>
            </Field>

            {/* Admission Year */}
            <Field label="Admission Year" error={errors.admissionYear} required hint="e.g. 2018">
              <div className="relative">
                <School2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="number"
                  min="2000"
                  max={new Date().getFullYear()}
                  placeholder="e.g. 2018"
                  value={admissionYear}
                  onChange={e => { setAdmissionYear(e.target.value); setErrors(p => ({ ...p, admissionYear: undefined })) }}
                  className={`w-full pl-9 pr-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                    bg-white text-slate-800 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
                    ${errors.admissionYear ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                />
              </div>
            </Field>

          </div>

          {/* Selected Student Preview Strip */}
          {selectedStudent && (
            <div className="mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-blue-800 dark:text-blue-300 truncate">{selectedStudent.name}</p>
                <p className="text-[11px] text-blue-500 dark:text-blue-400">
                  Roll: {selectedStudent.roll} &nbsp;·&nbsp; DOB: {selectedStudent.dob}
                </p>
              </div>
              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              type="button"
              onClick={handleGetCertificate}
              disabled={loading}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl
                text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Award className="w-4 h-4" />}
              Get Certificate
            </button>

            {certificateData && (
              <button
                type="button"
                onClick={handlePrint}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl
                  text-[13px] font-semibold text-white
                  bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                  transition-all active:scale-95 sm:hidden"
              >
                <Printer className="w-4 h-4" />
                Print Certificate
              </button>
            )}

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="sm:hidden">Reset</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.18 }} />
          ))}
        </div>
      )}

      {/* ── Certificate Preview ── */}
      {certificateData && !loading && (
        <div className="space-y-3">
          {/* Preview Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-emerald-500" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Certificate Preview</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                Ready to Print
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-400">
              <Printer className="w-3.5 h-3.5" />
              Use browser print (Ctrl+P)
            </div>
          </div>

          {/* Certificate */}
          <CertificatePreview
            student={certificateData.student}
            session={certificateData.session}
            className={certificateData.className}
            issueDate={certificateData.issueDate}
            admissionYear={certificateData.admissionYear}
            printRef={printRef}
          />
        </div>
      )}

      {/* ── Empty State ── */}
      {!certificateData && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Award className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No certificate generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Fill in the details above — session, class, student, date, and admission year — then click <strong>Get Certificate</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          body > *:not(#print-root) { display: none !important; }
          .no-print { display: none !important; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(10px) }
          to   { opacity: 1; transform: translateX(-50%) translateY(0) }
        }
      `}</style>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
