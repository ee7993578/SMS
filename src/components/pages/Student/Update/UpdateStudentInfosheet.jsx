/**
 * UpdateStudentInfosheet.jsx
 * Folder: src/pages/Student/Work/UpdateStudentInfosheet.jsx
 * Dependencies: lucide-react
 */

import { useState, useRef, useCallback } from 'react'
import {
  ChevronDown, Search, Save, RefreshCw, Loader2, Check,
  AlertCircle, X, User, Users, Building2, FileText,
  CreditCard, Heart, Camera, Upload, ChevronRight,
  GraduationCap, Sparkles
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS    = ['2023-24', '2024-25', '2025-26']
const CLASSES     = ['Nursery','LKG','UKG','Class I','Class II','Class III','Class IV','Class V','Class VI','Class VII','Class VIII','Class IX','Class X','Class XI','Class XII']
const AFFILIATIONS= ['CBSE','ICSE','U.P. BOARD','Other']
const BLOOD       = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const CATEGORIES  = ['General','OBC','SC','ST','EWS']
const RELIGIONS   = ['Hindu','Muslim','Christian','Sikh','Jain','Buddhist','Other']
const QUOTAS      = ['None','Sports','NCC','Management','Staff Ward','RTE']
const OCCUPATIONS = ['Business','Service','Farming','Doctor','Engineer','Lawyer','Teacher','Other']
const GROUPS      = ['Alaabhit Samooh','Durbal Varg']
const BANKS       = ['SBI','HDFC Bank','ICICI Bank','PNB','Bank of Baroda','Axis Bank','Canara Bank','Union Bank']
const HOUSES      = ['Red House','Blue House','Green House','Yellow House']
const STATES      = ['Uttar Pradesh','Delhi','Maharashtra','Bihar','Rajasthan','Punjab','Haryana','Uttarakhand']
const CITIES      = { 'Uttar Pradesh':['Meerut','Lucknow','Agra','Varanasi','Kanpur'], 'Delhi':['New Delhi','Dwarka','Rohini'], 'Maharashtra':['Mumbai','Pune','Nagpur'], 'Bihar':['Patna','Gaya'], 'Rajasthan':['Jaipur','Jodhpur'], 'Punjab':['Amritsar','Ludhiana'], 'Haryana':['Gurugram','Faridabad'], 'Uttarakhand':['Dehradun','Haridwar'] }
const PREV_CLASSES= CLASSES
const DOCUMENTS   = ['Transfer Certificate','Birth Certificate','Marksheet','Migration Certificate','Aadhar Card','Cast Certificate']

// Students by class (for dropdown)
const STUDENTS_BY_CLASS = {
  'Nursery': [
    { id:'S001', name:'Aarav Sharma',    adm:'2024/NUR/001', feebook:'FB001' },
    { id:'S002', name:'Ananya Singh',    adm:'2024/NUR/002', feebook:'FB002' },
    { id:'S003', name:'Arjun Verma',     adm:'2024/NUR/003', feebook:'FB003' },
  ],
  'LKG': [
    { id:'S004', name:'Diya Gupta',      adm:'2024/LKG/001', feebook:'FB004' },
    { id:'S005', name:'Ishaan Tiwari',   adm:'2024/LKG/002', feebook:'FB005' },
  ],
  'Class I': [
    { id:'S006', name:'Kavya Yadav',     adm:'2024/I/001', feebook:'FB006' },
    { id:'S007', name:'Mohit Rastogi',   adm:'2024/I/002', feebook:'FB007' },
    { id:'S008', name:'Neha Agarwal',    adm:'2024/I/003', feebook:'FB008' },
  ],
  'Class V': [
    { id:'S009', name:'Priya Mishra',    adm:'2024/V/001', feebook:'FB009' },
    { id:'S010', name:'Rahul Joshi',     adm:'2024/V/002', feebook:'FB010' },
  ],
  'Class X': [
    { id:'S011', name:'Tanvi Srivastava',adm:'2024/X/001', feebook:'FB011' },
    { id:'S012', name:'Vikas Chauhan',   adm:'2024/X/002', feebook:'FB012' },
  ],
}

// Full student record (for editing)
const STUDENT_RECORDS = {
  'S001': {
    session:'2024-25', regNo:'2024/NUR/001', feebook:'FB001', class_:'Nursery', studentId:'S001',
    prevSchool:'Delhi Public School', affiliation:'CBSE', remark:'Good student', prevClass:['LKG'], rollNo:'05',
    docs:['Transfer Certificate','Birth Certificate'],
    firstName:'Aarav', midName:'', lastName:'Sharma',
    dobDay:'12', dobMonth:'3', dobYear:'2020',
    gender:'Male', blood:'A+', category:'General', religion:'Hindu', quota:'None',
    address:'12 Green Park Meerut', state:'Uttar Pradesh', city:'Meerut',
    ncc:'0', house:'Red House', aadhar:'123456789012', pen:'100200300', udise:'210012345678', apaar:'100200300400',
    admDate:'15 Apr 2024', admClass:'Nursery', group:'',
    fName:'Rajesh Sharma', fQual:'B.Tech', fOcc:'Service', fMobile:'9876543210', fEmail:'rajesh@example.com', fIncome:'600000', fWhats:'9876543210', fAadhar:'234567890123',
    mName:'Sunita Sharma', mQual:'M.A.', mOcc:'Teacher', mMobile:'9876543211', mEmail:'sunita@example.com', mIncome:'400000', mWhats:'9876543211', mAadhar:'345678901234',
    accHolder:'', bank:'', branch:'', accType:'', accNo:'', ifsc:'',
    sibAdm:'', sibName:'',
  },
}

const getStudentsForClass = (cls) => STUDENTS_BY_CLASS[cls] || []
const getStudentRecord    = (id)  => STUDENT_RECORDS[id] || null

// ─── AVATAR COLORS ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ['#1d4ed8','#dbeafe'],['#7c3aed','#ede9fe'],['#0891b2','#cffafe'],
  ['#059669','#d1fae5'],['#d97706','#fef3c7'],['#dc2626','#fee2e2'],
]
const avatarColor = (n) => AVATAR_COLORS[(n?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

// ─── REUSABLE COMPONENTS ──────────────────────────────────────────────────────
function NativeSelect({ value, onChange, children, placeholder, error, disabled, className='' }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'} ${className}`}>
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Inp({ value, onChange, placeholder, error, type='text', maxLength, className='' }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} maxLength={maxLength}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
        dark:placeholder-slate-600 dark:focus:border-indigo-400
        ${error ? '!border-rose-400' : ''} ${className}`} />
  )
}

function Field({ label, error, required, children, className='' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5"><AlertCircle className="w-3 h-3 flex-shrink-0" />{error}</p>}
    </div>
  )
}

// Section card with collapsible
function SectionCard({ icon: Icon, title, accent='blue', open, onToggle, children, badge }) {
  const bars = { blue:'bg-blue-500', violet:'bg-violet-500', rose:'bg-rose-500', emerald:'bg-emerald-500', amber:'bg-amber-500', sky:'bg-sky-500', purple:'bg-purple-500' }
  const icons = { blue:'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10', violet:'text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-500/10', rose:'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10', emerald:'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10', amber:'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10', sky:'text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-500/10', purple:'text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10' }
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden bg-white dark:bg-[#1a1f35] shadow-sm">
      <button type="button" onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 text-left transition-colors
          bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:bg-white/[0.05]
          ${open ? 'border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]' : ''}`}>
        <span className={`w-1 h-5 rounded-full flex-shrink-0 ${bars[accent]}`} />
        <span className={`p-1.5 rounded-lg flex-shrink-0 ${icons[accent]}`}><Icon className="w-3.5 h-3.5" /></span>
        <span className="flex-1 text-[13px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
        {badge && <span className="hidden sm:inline text-[11px] text-slate-400 dark:text-slate-500 mr-1">{badge}</span>}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-4 sm:p-5">{children}</div>}
    </div>
  )
}

// Image uploader
function ImageUploader({ label, preview, onChange }) {
  const ref = useRef()
  return (
    <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-xl
      border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-50 dark:bg-[#1a1f35]
      hover:border-blue-300 dark:hover:border-indigo-400 transition-colors">
      <div onClick={() => ref.current.click()}
        className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center border
          border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238]
          hover:border-blue-300 dark:hover:border-indigo-400 transition-colors group">
        {preview
          ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
          : <Camera className="w-7 h-7 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 transition-colors" />}
      </div>
      <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <button type="button" onClick={() => ref.current.click()}
        className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-lg
          bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20 transition-colors">
        <Upload className="w-3 h-3" /> Upload
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => {
        const f = e.target.files[0]; if (f && onChange) onChange(URL.createObjectURL(f))
      }} />
    </div>
  )
}

// Parent fieldset
function ParentSection({ title, accent, fields }) {
  const colors = { blue:'bg-blue-50/60 dark:bg-blue-900/10 border-slate-200 dark:border-[rgba(99,102,241,0.2)]', pink:'bg-pink-50/60 dark:bg-pink-900/10 border-slate-200 dark:border-[rgba(99,102,241,0.2)]' }
  const bars   = { blue:'bg-blue-500', pink:'bg-pink-500' }
  return (
    <div className={`rounded-xl border overflow-hidden ${colors[accent]}`}>
      <div className={`px-4 py-2.5 border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)] flex items-center gap-2`}>
        <span className={`w-1 h-4 rounded-full ${bars[accent]}`} />
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">{fields}</div>
    </div>
  )
}

// Divider
function Divider({ label }) {
  return (
    <div className="flex items-center gap-3 my-1">
      <div className="h-px flex-1 bg-slate-100 dark:bg-[rgba(99,102,241,0.15)]" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      <div className="h-px flex-1 bg-slate-100 dark:bg-[rgba(99,102,241,0.15)]" />
    </div>
  )
}

// Toast
function Toast({ msg, type, onClose }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}>
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{msg}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── DEFAULT EMPTY FORM ────────────────────────────────────────────────────────
const EMPTY_FORM = {
  session:'2024-25', regNo:'', feebook:'', class_:'', studentId:'',
  prevSchool:'', affiliation:'', remark:'', prevClass:[], rollNo:'',
  docs:[],
  firstName:'', midName:'', lastName:'',
  dobDay:'', dobMonth:'', dobYear:'',
  gender:'Male', blood:'', category:'', religion:'', quota:'None',
  address:'', state:'Uttar Pradesh', city:'', ncc:'0', house:'', aadhar:'', pen:'', udise:'', apaar:'',
  admDate:'', admClass:'', group:'',
  fName:'', fQual:'', fOcc:'', fMobile:'', fEmail:'', fIncome:'', fWhats:'', fAadhar:'',
  mName:'', mQual:'', mOcc:'', mMobile:'', mEmail:'', mIncome:'', mWhats:'', mAadhar:'',
  accHolder:'', bank:'', branch:'', accType:'', accNo:'', ifsc:'',
  sibAdm:'', sibName:'',
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS   = Array.from({length:31},(_,i)=>i+1)
const YEARS  = Array.from({length:30},(_,i)=>2015-i)

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function UpdateStudentInfosheet() {
  const [form,         setForm]         = useState({ ...EMPTY_FORM })
  const [errors,       setErrors]       = useState({})
  const [loading,      setLoading]      = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [studentList,  setStudentList]  = useState([])
  const [openSection,  setOpenSection]  = useState(null)
  const [showPrevPicker, setShowPrevPicker] = useState(false)
  const [toast,        setToast]        = useState(null)
  const [photos, setPhotos] = useState({ stu: null, father: null, mother: null })
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)

  const showToast = (msg, type='success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  const toggle = n => setOpenSection(p => p === n ? null : n)
  const set    = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const setV   = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const toggleDoc = v => setForm(p => ({
    ...p, docs: p.docs.includes(v) ? p.docs.filter(d => d !== v) : [...p.docs, v]
  }))
  const togglePC = cls => setForm(p => ({
    ...p, prevClass: p.prevClass.includes(cls) ? p.prevClass.filter(c => c !== cls) : [...p.prevClass, cls]
  }))

  // When class changes — load students
  const handleClassChange = v => {
    setV('class_', v); setV('studentId', '')
    setStudentList(getStudentsForClass(v))
    setErrors(p => ({ ...p, class_: undefined }))
  }

  // When student selected — load their full record
  const handleStudentChange = v => {
    setV('studentId', v)
    if (!v) return
    setLoading(true)
    setTimeout(() => {
      const rec = getStudentRecord(v)
      if (rec) {
        setForm({ ...EMPTY_FORM, ...rec })
        setOpenSection(1)
        showToast('Student record loaded.')
      } else {
        showToast('No record found for this student.', 'error')
      }
      setLoading(false)
    }, 500)
  }

  // When regNo typed — auto-find (simulated)
  const handleRegNoChange = v => {
    setV('regNo', v)
    if (v.length >= 8) {
      // Find student across all classes
      const found = Object.entries(STUDENT_RECORDS).find(([,r]) => r.regNo === v)
      if (found) {
        const rec = found[1]
        setForm({ ...EMPTY_FORM, ...rec })
        setStudentList(getStudentsForClass(rec.class_))
        setOpenSection(1)
        showToast('Record loaded from Registration No.')
      }
    }
  }

  // When feebook typed — auto-find (simulated)
  const handleFeebookChange = v => {
    setV('feebook', v)
    if (v.length >= 3) {
      const found = Object.entries(STUDENT_RECORDS).find(([,r]) => r.feebook === v)
      if (found) {
        const rec = found[1]
        setForm({ ...EMPTY_FORM, ...rec })
        setStudentList(getStudentsForClass(rec.class_))
        setOpenSection(1)
        showToast('Record loaded from Fee Book No.')
      }
    }
  }

  // Sibling lookup
  const handleSiblingAdm = v => {
    setV('sibAdm', v)
    if (v.length >= 7) {
      const found = Object.values(STUDENT_RECORDS).find(r => r.regNo === v)
      setV('sibName', found ? found.firstName + ' ' + found.lastName : 'Not found')
    }
  }

  // Validate
  const validate = () => {
    const e = {}
    if (!form.class_)           e.class_    = 'Required'
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (form.fEmail  && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.fEmail))  e.fEmail  = 'Invalid email'
    if (form.mEmail  && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.mEmail))  e.mEmail  = 'Invalid email'
    if (form.fMobile && !/^\d{10}$/.test(form.fMobile)) e.fMobile = '10 digits'
    if (form.mMobile && !/^\d{10}$/.test(form.mMobile)) e.mMobile = '10 digits'
    if (form.fWhats  && !/^\d{10}$/.test(form.fWhats))  e.fWhats  = '10 digits'
    if (form.mWhats  && !/^\d{10}$/.test(form.mWhats))  e.mWhats  = '10 digits'
    if (form.aadhar  && !/^\d{12}$/.test(form.aadhar))  e.aadhar  = '12 digits'
    if (form.fAadhar && !/^\d{12}$/.test(form.fAadhar)) e.fAadhar = '12 digits'
    if (form.mAadhar && !/^\d{12}$/.test(form.mAadhar)) e.mAadhar = '12 digits'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleUpdate = () => {
    if (!validate()) {
      // Open first section with errors
      if (errors.class_ || errors.firstName) setOpenSection(3)
      showToast('Fix validation errors first.', 'error'); return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setShowSuccessScreen(true)
    }, 900)
  }

  const handleReset = () => {
    setForm({ ...EMPTY_FORM }); setErrors({}); setStudentList([])
    setOpenSection(null); setShowSuccessScreen(false); setPhotos({ stu:null, father:null, mother:null })
  }

  const cities = CITIES[form.state] || []
  const isRTE  = form.quota === 'RTE'

  // ── Success screen ──────────────────────────────────────────────────────────
  if (showSuccessScreen) {
    const [fg, bg] = avatarColor(form.firstName)
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6 page-animate">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="text-center">
          <h2 className="text-[18px] font-bold text-slate-800 dark:text-slate-100">Record Updated!</h2>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold" style={{background:bg,color:fg}}>
              {form.firstName[0]}{form.lastName[0]}
            </span>
            <div className="text-left">
              <p className="text-[14px] font-semibold text-slate-700 dark:text-slate-200">{form.firstName} {form.midName} {form.lastName}</p>
              <p className="text-[12px] text-slate-400">{form.class_} · {form.regNo || '—'} · {form.session}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button type="button" onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold rounded-xl
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            <RefreshCw className="w-4 h-4" /> Update Another
          </button>
          <button type="button" onClick={() => setShowSuccessScreen(false)}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold rounded-xl text-white transition-all
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-lg shadow-blue-500/20">
            <Sparkles className="w-4 h-4" /> Continue Editing
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8 page-animate">

      {/* Page Title */}
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">Student Infosheet</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Search by Reg No / Fee Book No / Class → edit details → update.
        </p>
      </div>

      {/* ══ 0. STUDENT LOOKUP CARD ════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Find Student</span>
          {loading && <Loader2 className="w-4 h-4 animate-spin text-blue-500 dark:text-indigo-400" />}
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <Field label="Session">
              <NativeSelect value={form.session} onChange={set('session')}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Registration No.">
              <Inp value={form.regNo} onChange={e => handleRegNoChange(e.target.value)} placeholder="e.g. 2024/NUR/001" />
            </Field>
            <Field label="Fee Book No.">
              <Inp value={form.feebook} onChange={e => handleFeebookChange(e.target.value)} placeholder="e.g. FB001" />
            </Field>
            <Field label="Class" error={errors.class_}>
              <NativeSelect value={form.class_} onChange={e => handleClassChange(e.target.value)} placeholder="-- Select Class --" error={errors.class_}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Student">
              <NativeSelect value={form.studentId} onChange={e => handleStudentChange(e.target.value)} placeholder={form.class_ ? '-- Select Student --' : '-- Select Class First --'} disabled={!form.class_}>
                {studentList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
            </Field>
          </div>
        </div>
      </div>

      {/* ══ 1. PREVIOUS SCHOOL ════════════════════════════════════════════ */}
      <SectionCard icon={Building2} title="Previous School Detail" accent="sky" open={openSection===1} onToggle={() => toggle(1)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Previous School Name">
            <Inp value={form.prevSchool} onChange={set('prevSchool')} placeholder="School name" />
          </Field>
          <Field label="Affiliation">
            <NativeSelect value={form.affiliation} onChange={set('affiliation')} placeholder="-- Select --">
              {AFFILIATIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Remark">
            <Inp value={form.remark} onChange={set('remark')} placeholder="Any remarks…" />
          </Field>
          <Field label="Previous Class">
            <div className="relative">
              <button type="button" onClick={() => setShowPrevPicker(p => !p)}
                className="w-full px-3 py-2 text-[13px] border rounded-lg flex items-center justify-between transition-all
                  border-slate-200 bg-white text-slate-800 hover:border-blue-400
                  dark:border-[rgba(99,102,241,0.25)] dark:bg-[#1e2238] dark:text-slate-200">
                <span className={form.prevClass.length === 0 ? 'text-slate-400 dark:text-slate-500' : ''}>
                  {form.prevClass.length > 0 ? form.prevClass.join(', ') : '-- Select --'}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              </button>
              {showPrevPicker && (
                <div className="absolute top-full left-0 mt-1 z-30 rounded-xl border shadow-xl p-3 w-72
                  bg-white border-slate-200 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.3)]">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500">Select Class(es)</span>
                    <button type="button" onClick={() => setShowPrevPicker(false)}><X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" /></button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {PREV_CLASSES.map(cls => (
                      <button key={cls} type="button" onClick={() => togglePC(cls)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all
                          ${form.prevClass.includes(cls) ? 'bg-blue-500 border-blue-500 text-white dark:bg-indigo-600 dark:border-indigo-600' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'}`}>
                        {cls}
                      </button>
                    ))}
                  </div>
                  <button type="button" onClick={() => setShowPrevPicker(false)}
                    className="mt-3 w-full py-1.5 rounded-lg text-[12px] font-semibold text-white bg-blue-500 hover:bg-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                    Done
                  </button>
                </div>
              )}
            </div>
          </Field>
          <Field label="Roll No.">
            <Inp value={form.rollNo} onChange={e => setV('rollNo', e.target.value.replace(/\D/g,''))} placeholder="Roll number" maxLength={10} />
          </Field>
        </div>
      </SectionCard>

      {/* ══ 2. DOCUMENTS ══════════════════════════════════════════════════ */}
      <SectionCard icon={FileText} title="Student Documents" accent="amber" open={openSection===2} onToggle={() => toggle(2)} badge={`${form.docs.length}/${DOCUMENTS.length} selected`}>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {DOCUMENTS.map(doc => (
            <label key={doc} onClick={() => toggleDoc(doc)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all select-none text-center
                ${form.docs.includes(doc)
                  ? 'border-blue-400 bg-blue-50 text-blue-700 dark:border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1a1f35] dark:text-slate-400'
                }`}>
              <input type="checkbox" checked={form.docs.includes(doc)} onChange={() => toggleDoc(doc)} className="hidden" />
              <div className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all
                ${form.docs.includes(doc) ? 'bg-blue-500 border-blue-500 dark:bg-indigo-500 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                {form.docs.includes(doc) && <svg viewBox="0 0 10 10" className="w-2.5 h-2.5"><polyline points="1.5,5 4,7.5 8.5,2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
              </div>
              <span className="text-[11px] font-medium leading-tight">{doc}</span>
            </label>
          ))}
        </div>
      </SectionCard>

      {/* ══ 3. STUDENT BASIC DETAIL ═══════════════════════════════════════ */}
      <SectionCard icon={User} title="Student Basic Detail" accent="violet" open={openSection===3} onToggle={() => toggle(3)}>
        <div className="space-y-4">
          {/* Name */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="First Name" required error={errors.firstName}>
              <Inp value={form.firstName} onChange={e => setV('firstName', e.target.value.replace(/[^a-zA-Z ]/g,''))} placeholder="First name" error={errors.firstName} />
            </Field>
            <Field label="Middle Name">
              <Inp value={form.midName} onChange={e => setV('midName', e.target.value.replace(/[^a-zA-Z ]/g,''))} placeholder="Middle name" />
            </Field>
            <Field label="Last Name">
              <Inp value={form.lastName} onChange={e => setV('lastName', e.target.value.replace(/[^a-zA-Z ]/g,''))} placeholder="Last name" />
            </Field>
          </div>

          {/* DOB + gender + blood */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="col-span-2">
              <Field label="Date of Birth">
                <div className="flex gap-2">
                  <NativeSelect value={form.dobDay}   onChange={set('dobDay')}   className="flex-1"><option value="">Day</option>{DAYS.map(d=><option key={d}>{d}</option>)}</NativeSelect>
                  <NativeSelect value={form.dobMonth} onChange={set('dobMonth')} className="flex-1"><option value="">Month</option>{MONTHS.map((m,i)=><option key={m} value={i+1}>{m}</option>)}</NativeSelect>
                  <NativeSelect value={form.dobYear}  onChange={set('dobYear')}  className="flex-1"><option value="">Year</option>{YEARS.map(y=><option key={y}>{y}</option>)}</NativeSelect>
                </div>
              </Field>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Gender</label>
              <div className="flex gap-4 h-[34px] items-center">
                {['Male','Female'].map(g => (
                  <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="radio" name="gender" value={g} checked={form.gender===g} onChange={() => setV('gender',g)} className="accent-blue-600 w-4 h-4" />
                    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{g}</span>
                  </label>
                ))}
              </div>
            </div>
            <Field label="Blood Group"><NativeSelect value={form.blood} onChange={set('blood')} placeholder="-- Select --">{BLOOD.map(b=><option key={b}>{b}</option>)}</NativeSelect></Field>
            <Field label="Category"><NativeSelect value={form.category} onChange={set('category')} placeholder="-- Select --">{CATEGORIES.map(c=><option key={c}>{c}</option>)}</NativeSelect></Field>
            <Field label="Religion"><NativeSelect value={form.religion} onChange={set('religion')} placeholder="-- Select --">{RELIGIONS.map(r=><option key={r}>{r}</option>)}</NativeSelect></Field>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Field label="Quota"><NativeSelect value={form.quota} onChange={set('quota')}>{QUOTAS.map(q=><option key={q}>{q}</option>)}</NativeSelect></Field>
            <Field label="NCC"><NativeSelect value={form.ncc} onChange={set('ncc')}><option value="0">No</option><option value="1">Yes</option></NativeSelect></Field>
            <Field label="House"><NativeSelect value={form.house} onChange={set('house')} placeholder="-- Select --">{HOUSES.map(h=><option key={h}>{h}</option>)}</NativeSelect></Field>
            <Field label="Adm. Date" className="col-span-2 sm:col-span-1">
              <Inp value={form.admDate} onChange={set('admDate')} placeholder="dd MMM yyyy" />
            </Field>
            <Field label="Adm. Class"><NativeSelect value={form.admClass} onChange={set('admClass')} placeholder="-- Select --">{CLASSES.map(c=><option key={c}>{c}</option>)}</NativeSelect></Field>
            <Field label="Group"><NativeSelect value={form.group} onChange={set('group')} placeholder="-- Select --">{GROUPS.map(g=><option key={g}>{g}</option>)}</NativeSelect></Field>
          </div>

          <Divider label="Address & IDs" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <Field label="Address"><Inp value={form.address} onChange={set('address')} placeholder="Full address" /></Field>
            </div>
            <Field label="State"><NativeSelect value={form.state} onChange={e => { setV('state',e.target.value); setV('city','') }}>{STATES.map(s=><option key={s}>{s}</option>)}</NativeSelect></Field>
            <Field label="City"><NativeSelect value={form.city} onChange={set('city')} placeholder="-- Select --">{cities.map(c=><option key={c}>{c}</option>)}</NativeSelect></Field>
            <Field label="Aadhar No." error={errors.aadhar}><Inp value={form.aadhar} onChange={e => setV('aadhar', e.target.value.replace(/\D/g,''))} placeholder="12-digit" maxLength={12} error={errors.aadhar} /></Field>
            <Field label="PEN Number"><Inp value={form.pen} onChange={e => setV('pen', e.target.value.replace(/\D/g,''))} placeholder="PEN number" maxLength={12} /></Field>
            <Field label="UDISE"><Inp value={form.udise} onChange={e => setV('udise', e.target.value.replace(/\D/g,''))} placeholder="UDISE code" maxLength={12} /></Field>
            <Field label="APAAR ID"><Inp value={form.apaar} onChange={e => setV('apaar', e.target.value.replace(/\D/g,''))} placeholder="APAAR ID" maxLength={12} /></Field>
          </div>

          <Divider label="Photo Upload" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ImageUploader label="Student Photo"  preview={photos.stu}    onChange={v => setPhotos(p => ({...p, stu:v}))} />
            <ImageUploader label="Father Photo"   preview={photos.father} onChange={v => setPhotos(p => ({...p, father:v}))} />
            <ImageUploader label="Mother Photo"   preview={photos.mother} onChange={v => setPhotos(p => ({...p, mother:v}))} />
          </div>
        </div>
      </SectionCard>

      {/* ══ 4. PARENT DETAILS ══════════════════════════════════════════════ */}
      <SectionCard icon={Users} title="Parent Details" accent="rose" open={openSection===4} onToggle={() => toggle(4)}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ParentSection title="Father's Detail" accent="blue" fields={<>
            <Field label="Name"><Inp value={form.fName} onChange={e=>setV('fName',e.target.value.replace(/[^a-zA-Z .]/g,''))} placeholder="Father's name"/></Field>
            <Field label="Qualification"><Inp value={form.fQual} onChange={set('fQual')} placeholder="e.g. B.Tech"/></Field>
            <Field label="Occupation"><NativeSelect value={form.fOcc} onChange={set('fOcc')}><option value="">-- Select --</option>{OCCUPATIONS.map(o=><option key={o}>{o}</option>)}</NativeSelect></Field>
            <Field label="Mobile No." error={errors.fMobile}><Inp value={form.fMobile} onChange={e=>setV('fMobile',e.target.value.replace(/\D/g,''))} placeholder="10-digit" maxLength={10} error={errors.fMobile}/></Field>
            <Field label="Email" error={errors.fEmail}><Inp type="email" value={form.fEmail} onChange={set('fEmail')} placeholder="father@email.com" error={errors.fEmail}/></Field>
            <Field label="Annual Income"><Inp value={form.fIncome} onChange={e=>setV('fIncome',e.target.value.replace(/\D/g,''))} placeholder="e.g. 500000"/></Field>
            <Field label="WhatsApp No." error={errors.fWhats}><Inp value={form.fWhats} onChange={e=>setV('fWhats',e.target.value.replace(/\D/g,''))} placeholder="10-digit" maxLength={10} error={errors.fWhats}/></Field>
            <Field label="Aadhaar No." error={errors.fAadhar}><Inp value={form.fAadhar} onChange={e=>setV('fAadhar',e.target.value.replace(/\D/g,''))} placeholder="12-digit" maxLength={12} error={errors.fAadhar}/></Field>
          </>} />
          <ParentSection title="Mother's Detail" accent="pink" fields={<>
            <Field label="Name"><Inp value={form.mName} onChange={e=>setV('mName',e.target.value.replace(/[^a-zA-Z .]/g,''))} placeholder="Mother's name"/></Field>
            <Field label="Qualification"><Inp value={form.mQual} onChange={set('mQual')} placeholder="e.g. M.A."/></Field>
            <Field label="Occupation"><NativeSelect value={form.mOcc} onChange={set('mOcc')}><option value="">-- Select --</option>{OCCUPATIONS.map(o=><option key={o}>{o}</option>)}</NativeSelect></Field>
            <Field label="Mobile No." error={errors.mMobile}><Inp value={form.mMobile} onChange={e=>setV('mMobile',e.target.value.replace(/\D/g,''))} placeholder="10-digit" maxLength={10} error={errors.mMobile}/></Field>
            <Field label="Email" error={errors.mEmail}><Inp type="email" value={form.mEmail} onChange={set('mEmail')} placeholder="mother@email.com" error={errors.mEmail}/></Field>
            <Field label="Annual Income"><Inp value={form.mIncome} onChange={e=>setV('mIncome',e.target.value.replace(/\D/g,''))} placeholder="e.g. 300000"/></Field>
            <Field label="WhatsApp No." error={errors.mWhats}><Inp value={form.mWhats} onChange={e=>setV('mWhats',e.target.value.replace(/\D/g,''))} placeholder="10-digit" maxLength={10} error={errors.mWhats}/></Field>
            <Field label="Aadhaar No." error={errors.mAadhar}><Inp value={form.mAadhar} onChange={e=>setV('mAadhar',e.target.value.replace(/\D/g,''))} placeholder="12-digit" maxLength={12} error={errors.mAadhar}/></Field>
          </>} />
        </div>
      </SectionCard>

      {/* ══ 5. BANK DETAIL (RTE) ══════════════════════════════════════════ */}
      <SectionCard icon={CreditCard} title="Parents Bank Account (RTE)" accent="emerald" open={openSection===5} onToggle={() => toggle(5)} badge={isRTE ? 'RTE Quota Active' : 'Only for RTE quota'}>
        {!isRTE ? (
          <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-blue-100 bg-blue-50/50 dark:border-blue-500/20 dark:bg-blue-500/[0.05] text-blue-700 dark:text-blue-400 text-[13px]">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Bank details are only applicable when Quota is set to <strong>RTE</strong>. Go to Student Basic Detail → Quota → RTE.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Account Holder Name"><Inp value={form.accHolder} onChange={e=>setV('accHolder',e.target.value.replace(/[^a-zA-Z .]/g,''))} placeholder="As per bank records"/></Field>
            <Field label="Bank Name"><NativeSelect value={form.bank} onChange={set('bank')} placeholder="-- Select --">{BANKS.map(b=><option key={b}>{b}</option>)}</NativeSelect></Field>
            <Field label="Branch"><Inp value={form.branch} onChange={set('branch')} placeholder="Branch name"/></Field>
            <Field label="Account Type"><NativeSelect value={form.accType} onChange={set('accType')} placeholder="-- Select --"><option>Saving</option><option>Current</option></NativeSelect></Field>
            <Field label="Account No."><Inp value={form.accNo} onChange={e=>setV('accNo',e.target.value.replace(/\D/g,''))} placeholder="Account number"/></Field>
            <Field label="IFSC Code"><Inp value={form.ifsc} onChange={e=>setV('ifsc',e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234"/></Field>
          </div>
        )}
      </SectionCard>

      {/* ══ 6. SIBLINGS ═══════════════════════════════════════════════════ */}
      <SectionCard icon={Heart} title="Siblings Information" accent="purple" open={openSection===6} onToggle={() => toggle(6)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Enter Adm No.">
            <Inp value={form.sibAdm} onChange={e => handleSiblingAdm(e.target.value)} placeholder="Enter sibling Adm No." />
          </Field>
          <Field label="Student Name">
            <Inp value={form.sibName} placeholder="Auto-filled on Adm No." className="opacity-70 cursor-not-allowed" />
          </Field>
        </div>
      </SectionCard>

      {/* ══ SUBMIT BAR ════════════════════════════════════════════════════ */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 rounded-2xl border
        bg-white border-slate-200 dark:bg-[#1a1f35] dark:border-[rgba(99,102,241,0.2)] shadow-sm">
        <p className="text-[12px] text-slate-400 dark:text-slate-500">
          Fields marked <span className="text-rose-500 font-bold">*</span> are required
        </p>
        <div className="flex gap-3 w-full sm:w-auto">
          <button type="button" onClick={handleReset}
            className="flex-1 sm:flex-none px-5 py-2 text-[13px] font-semibold rounded-xl transition-colors
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            Reset
          </button>
          <button type="button" onClick={handleUpdate} disabled={saving}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-2 text-[13px] font-semibold text-white rounded-xl transition-all active:scale-95 disabled:opacity-70
              bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20
              dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Updating…</> : <><Save className="w-4 h-4" /> Update</>}
          </button>
        </div>
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
