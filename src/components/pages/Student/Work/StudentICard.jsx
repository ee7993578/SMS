import { useState, useMemo } from 'react'
import {
  ChevronDown, Search, CreditCard, Printer,
  CheckSquare, Square, AlertCircle, X, Check,
  User,Users, GraduationCap, Building2, RefreshCw, Eye
} from 'lucide-react'
 
// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const SESSIONS = ['2024-25', '2025-26', '2026-27']
 
const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]
 
const SECTIONS_BY_CLASS = {
  'Nursery': ['A', 'B'],
  'LKG':     ['A', 'B'],
  'UKG':     ['A', 'B'],
  'Class I': ['A', 'B', 'C'],
  'Class II': ['A', 'B', 'C'],
  'Class III': ['A', 'B'],
  'Class IV': ['A', 'B'],
  'Class V': ['A', 'B'],
  'Class VI': ['A', 'B', 'C'],
  'Class VII': ['A', 'B', 'C'],
  'Class VIII': ['A', 'B'],
  'Class IX': ['A', 'B', 'C'],
  'Class X': ['A', 'B', 'C'],
  'Class XI': ['Science', 'Commerce', 'Arts'],
  'Class XII': ['Science', 'Commerce', 'Arts'],
}
 
const DUMMY_STUDENTS = {
  'Nursery-A': [
    { id: 'S001', name: 'Aarav Sharma',     adm: 'ADM-001', roll: '01', father: 'Rajesh Sharma',   dob: '12/03/2020', blood: 'A+', phone: '9876543210', address: '12, Green Park, Meerut' },
    { id: 'S002', name: 'Ananya Singh',     adm: 'ADM-002', roll: '02', father: 'Vijay Singh',     dob: '05/07/2020', blood: 'B+', phone: '9812345678', address: '45, Shastri Nagar, Meerut' },
    { id: 'S003', name: 'Arjun Verma',      adm: 'ADM-003', roll: '03', father: 'Suresh Verma',    dob: '19/01/2020', blood: 'O+', phone: '9834567890', address: '7, Civil Lines, Meerut' },
    { id: 'S004', name: 'Diya Gupta',       adm: 'ADM-004', roll: '04', father: 'Anil Gupta',      dob: '23/09/2020', blood: 'AB+', phone: '9856789012', address: '89, Lajpat Nagar, Meerut' },
    { id: 'S005', name: 'Ishaan Tiwari',    adm: 'ADM-005', roll: '05', father: 'Manoj Tiwari',    dob: '14/11/2020', blood: 'A-', phone: '9867890123', address: '3, Gandhinagar, Meerut' },
    { id: 'S006', name: 'Kavya Yadav',      adm: 'ADM-006', roll: '06', father: 'Ramesh Yadav',    dob: '30/06/2020', blood: 'B-', phone: '9878901234', address: '56, Saket, Meerut' },
  ],
  'Nursery-B': [
    { id: 'S007', name: 'Mohit Rastogi',    adm: 'ADM-007', roll: '01', father: 'Dinesh Rastogi',  dob: '08/02/2020', blood: 'O-', phone: '9789012345', address: '21, Raj Nagar, Meerut' },
    { id: 'S008', name: 'Neha Agarwal',     adm: 'ADM-008', roll: '02', father: 'Sanjay Agarwal',  dob: '17/05/2020', blood: 'A+', phone: '9790123456', address: '67, Surya Nagar, Meerut' },
    { id: 'S009', name: 'Priya Mishra',     adm: 'ADM-009', roll: '03', father: 'Rakesh Mishra',   dob: '25/08/2020', blood: 'B+', phone: '9801234567', address: '34, Vikas Nagar, Meerut' },
    { id: 'S010', name: 'Rahul Joshi',      adm: 'ADM-010', roll: '04', father: 'Naresh Joshi',    dob: '11/12/2019', blood: 'AB-', phone: '9812345679', address: '78, Patel Nagar, Meerut' },
  ],
  'LKG-A': [
    { id: 'S011', name: 'Rohan Dubey',      adm: 'ADM-011', roll: '01', father: 'Kamlesh Dubey',   dob: '02/04/2019', blood: 'O+', phone: '9823456780', address: '15, Model Town, Meerut' },
    { id: 'S012', name: 'Sneha Pandey',     adm: 'ADM-012', roll: '02', father: 'Girish Pandey',   dob: '20/10/2019', blood: 'A+', phone: '9834567891', address: '29, Anand Vihar, Meerut' },
    { id: 'S013', name: 'Tanvi Srivastava', adm: 'ADM-013', roll: '03', father: 'Umesh Srivastava',dob: '13/07/2019', blood: 'B+', phone: '9845678902', address: '62, Shyam Nagar, Meerut' },
    { id: 'S014', name: 'Vikas Chauhan',    adm: 'ADM-014', roll: '04', father: 'Hemant Chauhan',  dob: '28/01/2019', blood: 'O-', phone: '9856789013', address: '91, Ram Nagar, Meerut' },
    { id: 'S015', name: 'Yash Kumar',       adm: 'ADM-015', roll: '05', father: 'Pankaj Kumar',    dob: '06/06/2019', blood: 'A-', phone: '9867890124', address: '44, Krishna Nagar, Meerut' },
  ],
}
 
const getStudents = (cls, sec) => {
  const key = `${cls}-${sec}`
  if (DUMMY_STUDENTS[key]) return DUMMY_STUDENTS[key]
  return Array.from({ length: Math.floor(Math.random() * 5) + 3 }, (_, i) => ({
    id:      `${cls}-${sec}-${i+1}`,
    name:    `Student ${i+1}`,
    adm:     `ADM-${cls.replace(/\s/g,'')}-${sec}-${String(i+1).padStart(2,'0')}`,
    roll:    String(i+1).padStart(2,'0'),
    father:  `Father ${i+1}`,
    dob:     `0${(i%9)+1}/0${(i%9)+1}/201${5-i%5}`,
    blood:   ['A+','B+','O+','AB+','A-','O-'][i%6],
    phone:   `98${String(Math.floor(10000000+Math.random()*89999999))}`,
    address: `House ${i+1}, Sample Colony, Meerut`,
  }))
}
 
// ─── SCHOOL INFO (for I-Card preview) ────────────────────────────────────────
const SCHOOL = {
  name:    'St. Mary\'s Public School',
  address: 'Civil Lines, Meerut – 250001, Uttar Pradesh',
  phone:   '0121-2654321',
  email:   'info@stmarys.edu.in',
  session: '',
}
 
// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
function NativeSelect({ value, onChange, children, placeholder, error }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${error
            ? 'border-rose-400 dark:border-rose-500'
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
 
function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
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
 
// ─── I-CARD COMPONENT (single card) ──────────────────────────────────────────
function ICard({ student, cls, section, session }) {
  const initials = student.name.split(' ').map(n => n[0]).join('').slice(0, 2)
  return (
    <div className="w-full max-w-[240px] rounded-2xl border-2 border-blue-200 dark:border-indigo-500/30 overflow-hidden shadow-lg bg-white dark:bg-[#1e2238] flex flex-col text-[11px] select-none">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-indigo-700 dark:to-indigo-800 px-3 py-2.5 text-white text-center">
        <p className="font-bold text-[12px] leading-tight">{SCHOOL.name}</p>
        <p className="opacity-80 text-[9px] mt-0.5 leading-tight">{SCHOOL.address}</p>
        <p className="opacity-70 text-[9px]">{SCHOOL.phone}</p>
      </div>
 
      {/* IDENTITY CARD label */}
      <div className="bg-blue-50 dark:bg-indigo-500/10 text-center py-1">
        <span className="text-[9px] font-black tracking-[0.2em] text-blue-600 dark:text-indigo-400 uppercase">Identity Card</span>
        <span className="ml-2 text-[9px] text-slate-500 dark:text-slate-400">{session}</span>
      </div>
 
      {/* Photo + Info */}
      <div className="flex gap-3 px-3 py-3">
        {/* Photo placeholder */}
        <div className="w-14 h-16 rounded-lg border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/10 flex-shrink-0 flex items-center justify-center">
          <span className="text-[16px] font-black text-blue-500 dark:text-indigo-400">{initials}</span>
        </div>
 
        {/* Details */}
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <p className="font-bold text-[12px] text-slate-800 dark:text-slate-100 leading-tight truncate">{student.name}</p>
          <div className="space-y-0.5 text-slate-600 dark:text-slate-400">
            <p><span className="font-semibold text-slate-500 dark:text-slate-500">Class:</span> {cls} – {section}</p>
            <p><span className="font-semibold text-slate-500 dark:text-slate-500">Roll:</span> {student.roll}</p>
            <p><span className="font-semibold text-slate-500 dark:text-slate-500">Adm:</span> {student.adm}</p>
            <p><span className="font-semibold text-slate-500 dark:text-slate-500">DOB:</span> {student.dob}</p>
            <p><span className="font-semibold text-slate-500 dark:text-slate-500">Blood:</span> <span className="text-rose-600 dark:text-rose-400 font-bold">{student.blood}</span></p>
          </div>
        </div>
      </div>
 
      {/* Father + Phone */}
      <div className="px-3 pb-2 space-y-0.5 text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] pt-2">
        <p className="truncate"><span className="font-semibold text-slate-500 dark:text-slate-500">Father:</span> {student.father}</p>
        <p><span className="font-semibold text-slate-500 dark:text-slate-500">Ph:</span> {student.phone}</p>
        <p className="truncate text-[10px] text-slate-400 dark:text-slate-500">{student.address}</p>
      </div>
 
      {/* Footer */}
      <div className="bg-blue-600 dark:bg-indigo-700 px-3 py-1.5 flex items-center justify-between mt-auto">
        <span className="text-[9px] text-blue-100 dark:text-indigo-200">Principal's Sign</span>
        <span className="text-[9px] text-blue-100 dark:text-indigo-200">Student's Sign</span>
      </div>
    </div>
  )
}
 
// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function StudentICard() {
  const [session, setSession]     = useState('')
  const [cls, setCls]             = useState('')
  const [section, setSection]     = useState('')
  const [allStudents, setAllStudents] = useState([])
  const [selected, setSelected]   = useState([])   // selected student ids
  const [search, setSearch]       = useState('')
  const [errors, setErrors]       = useState({})
  const [preview, setPreview]     = useState(false) // show I-card grid
 
  const sections = cls ? (SECTIONS_BY_CLASS[cls] || []) : []
 
  // ── handlers ──────────────────────────────────────────────────────────────
  const handleClassChange = (val) => {
    setCls(val)
    setSection('')
    setAllStudents([])
    setSelected([])
    setPreview(false)
    setErrors(p => ({ ...p, cls: undefined, section: undefined }))
  }
 
  const handleSectionChange = (val) => {
    setSection(val)
    setAllStudents([])
    setSelected([])
    setPreview(false)
    setErrors(p => ({ ...p, section: undefined }))
  }
 
  const handleSessionChange = (val) => {
    setSession(val)
    setErrors(p => ({ ...p, session: undefined }))
  }
 
  const handleShow = () => {
    const err = {}
    if (!session) err.session = 'Select session'
    if (!cls)     err.cls     = 'Select class'
    if (!section) err.section = 'Select section'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    const list = getStudents(cls, section)
    setAllStudents(list)
    setSelected(list.map(s => s.id))  // select all by default
    setPreview(false)
  }
 
  const handleReset = () => {
    setSession(''); setCls(''); setSection('')
    setAllStudents([]); setSelected([])
    setSearch(''); setErrors({}); setPreview(false)
  }
 
  const toggleStudent = (id) =>
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
 
  const filtered = useMemo(() =>
    allStudents.filter(s =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.adm.toLowerCase().includes(search.toLowerCase()) ||
      s.roll.includes(search)
    ), [allStudents, search])
 
  const allChecked  = filtered.length > 0 && filtered.every(s => selected.includes(s.id))
  const someChecked = filtered.some(s => selected.includes(s.id))
 
  const selectedStudents = allStudents.filter(s => selected.includes(s.id))
 
  return (
    <div className="space-y-4 pb-8 page-animate">
 
      {/* Page Title */}
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">Students I-Card</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Select session, class &amp; section — then pick students and print.
        </p>
      </div>
 
      {/* ── Filter Card ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500" />
          <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Filter Students</span>
        </div>
 
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Session" error={errors.session}>
              <NativeSelect value={session} onChange={e => handleSessionChange(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
 
            <Field label="Class" error={errors.cls}>
              <NativeSelect value={cls} onChange={e => handleClassChange(e.target.value)} placeholder="-- Select Class --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
 
            <Field label="Section" error={errors.section}>
              <NativeSelect value={section} onChange={e => handleSectionChange(e.target.value)} placeholder={cls ? '-- Select Section --' : '-- Select Class First --'} error={errors.section}>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
 
            {/* Show button — vertically aligned */}
            <div className="flex flex-col justify-end">
              <button
                type="button"
                onClick={handleShow}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20"
              >
                <Eye className="w-4 h-4" /> Show Students
              </button>
            </div>
          </div>
        </div>
      </div>
 
      {/* ── Student List Card (shown after fetch) ────────────────────────── */}
      {allStudents.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
 
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 truncate">
                {cls} – {section} &nbsp;·&nbsp; {session}
              </span>
              <span className="flex-shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                {selected.length} / {allStudents.length}
              </span>
            </div>
 
            {/* Search */}
            <div className="relative sm:w-52 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name / adm / roll…"
                className="w-full pl-8 pr-3 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600 dark:focus:border-indigo-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
 
          {/* Select All row */}
          <div className="px-5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] bg-slate-50/30 dark:bg-white/[0.01]">
            <button
              type="button"
              onClick={() => {
                if (allChecked) setSelected(p => p.filter(id => !filtered.map(s=>s.id).includes(id)))
                else setSelected(p => [...new Set([...p, ...filtered.map(s => s.id)])])
              }}
              className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
            >
              {allChecked
                ? <CheckSquare className="w-4 h-4 text-blue-500 dark:text-indigo-400" />
                : someChecked
                  ? <Square className="w-4 h-4 text-blue-400/70 dark:text-indigo-400/50" />
                  : <Square className="w-4 h-4 text-slate-400" />
              }
              {allChecked ? 'Deselect All' : 'Select All'}
              <span className="text-slate-400 dark:text-slate-500 font-normal ml-1">{filtered.length} students</span>
            </button>
          </div>
 
          {/* Student rows */}
          <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)] max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-[13px] text-slate-400 dark:text-slate-600">
                No students match your search.
              </div>
            ) : filtered.map(s => {
              const checked = selected.includes(s.id)
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => toggleStudent(s.id)}
                  className={`w-full flex items-center gap-3 px-5 py-3 text-left transition-colors
                    ${checked
                      ? 'bg-blue-50/60 dark:bg-blue-500/[0.07]'
                      : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                    }`}
                >
                  {/* Checkbox */}
                  <span className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
                    ${checked ? 'bg-blue-500 border-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
                    {checked && (
                      <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
                        <polyline points="1.5,5 4,7.5 8.5,2" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </span>
 
                  {/* Avatar */}
                  <span className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                    {s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </span>
 
                  {/* Info */}
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{s.name}</span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">{s.adm} · Roll {s.roll} · {s.father}</span>
                  </span>
 
                  {/* Blood */}
                  <span className="hidden sm:block text-[11px] font-bold text-rose-600 dark:text-rose-400 flex-shrink-0">{s.blood}</span>
                </button>
              )
            })}
          </div>
 
          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              <span className="font-semibold text-slate-600 dark:text-slate-300">{selected.length}</span> student{selected.length !== 1 ? 's' : ''} selected for I-Card
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold transition-colors
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
              <button
                type="button"
                onClick={() => { if (selected.length === 0) { setErrors({ global: 'Select at least one student' }); return } setErrors({}); setPreview(true) }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95
                  bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                  dark:bg-emerald-700 dark:hover:bg-emerald-800"
              >
                <Eye className="w-4 h-4" /> Preview I-Cards
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20"
              >
                <Printer className="w-4 h-4" /> Print
              </button>
            </div>
          </div>
 
          {errors.global && (
            <div className="px-5 pb-3">
              <p className="flex items-center gap-1.5 text-[12px] text-rose-500">
                <AlertCircle className="w-3.5 h-3.5" />{errors.global}
              </p>
            </div>
          )}
        </div>
      )}
 
      {/* ── I-Card Preview Grid ───────────────────────────────────────────── */}
      {preview && selectedStudents.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-violet-500" />
            <CreditCard className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
              I-Card Preview &nbsp;<span className="text-slate-400 font-normal text-[13px]">({selectedStudents.length} cards)</span>
            </span>
            <button
              type="button"
              onClick={() => setPreview(false)}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
 
          {/* Cards Grid */}
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 justify-items-center">
              {selectedStudents.map(s => (
                <ICard key={s.id} student={s} cls={cls} section={section} session={session} />
              ))}
            </div>
          </div>
 
          {/* Print footer */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              {selectedStudents.length} I-Cards ready to print
            </p>
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700"
            >
              <Printer className="w-4 h-4" /> Print All I-Cards
            </button>
          </div>
        </div>
      )}
    </div>
  )
}