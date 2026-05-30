/**
 * FacultyRegistration.jsx
 * Complete React + Tailwind conversion of faculty-registartion.aspx
 * All sections: Faculty Detail, Contact Detail, Other Detail
 * Fully responsive: desktop table-dense ERP | mobile card/stack layout
 */

import { useState, useCallback, useRef } from 'react'
import {
  User, Upload, Camera, ChevronDown, AlertCircle, X, Check,
  Loader2, Building2, Phone, Mail, MapPin, CreditCard, Landmark,
  GraduationCap, Calendar, Users, Briefcase, Hash, Shield,
  ChevronRight, Info, RotateCcw, Save, Eye, EyeOff,
  BookOpen, Award, Home, FileText, BadgeCheck
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SALUTATIONS = ['Mr.', 'Ms.', 'Mrs.', 'Dr.']
const GENDERS = ['Male', 'Female']
const MARITAL_STATUS = ['Single', 'Married']
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const DESIGNATIONS = [
  { value: '0', label: '-- Select Designation --' },
  { value: 'principal', label: 'Principal' },
  { value: 'vice_principal', label: 'Vice Principal' },
  { value: 'hod', label: 'Head of Department' },
  { value: 'sr_teacher', label: 'Senior Teacher' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'asst_teacher', label: 'Assistant Teacher' },
  { value: 'lecturer', label: 'Lecturer' },
  { value: 'lab_asst', label: 'Lab Assistant' },
  { value: 'librarian', label: 'Librarian' },
  { value: 'counselor', label: 'Counselor' },
]
const DEPARTMENTS = [
  { value: '0', label: '-- Select Department --' },
  { value: 'science', label: 'Science' },
  { value: 'maths', label: 'Mathematics' },
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'social', label: 'Social Studies' },
  { value: 'computer', label: 'Computer Science' },
  { value: 'commerce', label: 'Commerce' },
  { value: 'arts', label: 'Arts' },
  { value: 'physical', label: 'Physical Education' },
]
const EDUCATION_QUALS = [
  { value: '0', label: '-- Select Qualification --' },
  { value: 'ba', label: 'B.A.' },
  { value: 'bsc', label: 'B.Sc.' },
  { value: 'bcom', label: 'B.Com.' },
  { value: 'btech', label: 'B.Tech.' },
  { value: 'ma', label: 'M.A.' },
  { value: 'msc', label: 'M.Sc.' },
  { value: 'mcom', label: 'M.Com.' },
  { value: 'mtech', label: 'M.Tech.' },
  { value: 'bed', label: 'B.Ed.' },
  { value: 'med', label: 'M.Ed.' },
  { value: 'phd', label: 'Ph.D.' },
]
const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'History', 'Geography',
  'Civics', 'Economics', 'Computer Science', 'Physical Education',
]
const STATES = [
  { value: '0', label: '-- Select State --' },
  { value: 'up', label: 'Uttar Pradesh' },
  { value: 'uk', label: 'Uttarakhand' },
  { value: 'dl', label: 'Delhi' },
  { value: 'hr', label: 'Haryana' },
  { value: 'rj', label: 'Rajasthan' },
  { value: 'mp', label: 'Madhya Pradesh' },
  { value: 'mh', label: 'Maharashtra' },
  { value: 'wb', label: 'West Bengal' },
  { value: 'ka', label: 'Karnataka' },
  { value: 'tn', label: 'Tamil Nadu' },
]
const DISTRICTS_BY_STATE = {
  up: ['Lucknow', 'Agra', 'Varanasi', 'Prayagraj', 'Kanpur', 'Ghaziabad', 'Noida', 'Meerut'],
  uk: ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital', 'Mussoorie', 'Roorkee'],
  dl: ['New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi'],
  hr: ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Rohtak'],
  rj: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  mp: ['Bhopal', 'Indore', 'Jabalpur', 'Gwalior', 'Ujjain'],
  mh: ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  wb: ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  ka: ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum'],
  tn: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem'],
}
const BANKS = [
  { value: '0', label: '-- Select Bank --' },
  { value: 'sbi', label: 'State Bank of India' },
  { value: 'pnb', label: 'Punjab National Bank' },
  { value: 'bob', label: 'Bank of Baroda' },
  { value: 'hdfc', label: 'HDFC Bank' },
  { value: 'icici', label: 'ICICI Bank' },
  { value: 'axis', label: 'Axis Bank' },
  { value: 'kotak', label: 'Kotak Mahindra Bank' },
  { value: 'canara', label: 'Canara Bank' },
  { value: 'union', label: 'Union Bank of India' },
]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, error, disabled, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}
          ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="text-[10px] font-normal normal-case text-slate-400 tracking-normal ml-1">({hint})</span>
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

function TextInput({ value, onChange, placeholder, error, disabled, maxLength, type = 'text', className = '', readOnly }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      maxLength={maxLength}
      readOnly={readOnly}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        disabled:opacity-50 disabled:bg-slate-50 disabled:cursor-not-allowed
        read-only:bg-slate-50 read-only:cursor-default
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}
        ${className}`}
    />
  )
}

function TextArea({ value, onChange, placeholder, error, rows = 3 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
    />
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
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

// ─── SECTION WRAPPER ──────────────────────────────────────────────────────────
function SectionCard({ title, icon: Icon, color = 'blue', children, badge }) {
  const colors = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    violet: 'text-violet-600 bg-violet-50 border-violet-100',
    amber: 'text-amber-600 bg-amber-50 border-amber-100',
  }
  const accent = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
  }
  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className={`flex items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60`}>
        <span className={`w-1 h-6 rounded-full flex-shrink-0 ${accent[color]}`} />
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </span>
        <h3 className="text-[15px] font-bold text-slate-800 flex-1">{title}</h3>
        {badge && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700">{badge}</span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── MOBILE TAB NAVIGATION ───────────────────────────────────────────────────
function MobileTabNav({ tabs, active, onChange }) {
  return (
    <div className="flex sm:hidden sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex flex-col items-center gap-1 px-3 py-3 text-[11px] font-semibold whitespace-nowrap transition-colors min-w-0
            ${active === tab.id
              ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50/50'
              : 'text-slate-500 border-b-2 border-transparent'
            }`}
        >
          <tab.icon className="w-4 h-4 flex-shrink-0" />
          <span className="truncate">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── PHOTO UPLOAD MODAL ───────────────────────────────────────────────────────
function PhotoUploadModal({ open, onClose, onUpload }) {
  const fileRef = useRef()
  const [preview, setPreview] = useState(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const url = URL.createObjectURL(file)
    setPreview(url)
  }

  const handleUpload = () => {
    if (preview) { onUpload(preview); onClose() }
  }

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              <h4 className="text-[15px] font-bold text-slate-800">Upload Photo</h4>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-5 space-y-4">
            {/* Preview */}
            <div className="flex justify-center">
              <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center bg-slate-50">
                {preview
                  ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
                  : <Camera className="w-8 h-8 text-slate-300" />
                }
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">Select Image</label>
              <input ref={fileRef} type="file" accept="image/*" onChange={handleFile}
                className="w-full text-[13px] text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0
                  file:text-[12px] file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer" />
            </div>
          </div>
          <div className="px-5 pb-5 flex gap-3">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
              Cancel
            </button>
            <button onClick={handleUpload} disabled={!preview}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <Upload className="w-4 h-4" /> Upload
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FacultyRegistration() {
  const [activeTab, setActiveTab] = useState('faculty')
  const [photoModal, setPhotoModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})

  // ── Faculty Detail State ──────────────────────────────────────────────────
  const [facultyPhoto, setFacultyPhoto] = useState(null)
  const [facultyId, setFacultyId] = useState('')
  const [salutation, setSalutation] = useState('')
  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('Male')
  const [fatherName, setFatherName] = useState('')
  const [husbandName, setHusbandName] = useState('')
  const [maritalStatus, setMaritalStatus] = useState('Single')
  const [anniversary, setAnniversary] = useState('')
  const [education, setEducation] = useState('0')
  const [experience, setExperience] = useState('')
  const [department, setDepartment] = useState('0')
  const [designation, setDesignation] = useState('0')
  const [bloodGroup, setBloodGroup] = useState('0')
  const [doj, setDoj] = useState('')
  const [subjects, setSubjects] = useState([])

  // ── Contact Detail State ──────────────────────────────────────────────────
  const [presentAddress, setPresentAddress] = useState('')
  const [permanentAddress, setPermanentAddress] = useState('')
  const [sameAddress, setSameAddress] = useState(false)
  const [state, setState] = useState('0')
  const [district, setDistrict] = useState('0')
  const [city, setCity] = useState('')
  const [pin, setPin] = useState('')
  const [telephone, setTelephone] = useState('')
  const [mobile, setMobile] = useState('')
  const [email, setEmail] = useState('')

  // ── Other Detail State ────────────────────────────────────────────────────
  const [aadhar, setAadhar] = useState('')
  const [pan, setPan] = useState('')
  const [bankName, setBankName] = useState('0')
  const [branch, setBranch] = useState('')
  const [accountNo, setAccountNo] = useState('')
  const [ifsc, setIfsc] = useState('')

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSameAddress = (checked) => {
    setSameAddress(checked)
    if (checked) setPermanentAddress(presentAddress)
    else setPermanentAddress('')
  }

  const handleStateChange = (val) => {
    setState(val)
    setDistrict('0')
  }

  const toggleSubject = (sub) => {
    setSubjects(prev =>
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    )
  }

  const handleOnlyNumbers = (setter) => (e) => {
    const val = e.target.value.replace(/\D/g, '')
    setter(val)
  }

  const handleOnlyText = (setter) => (e) => {
    const val = e.target.value.replace(/[^a-zA-Z\s]/g, '')
    setter(val)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {}
    if (!facultyId.trim()) errs.facultyId = 'Faculty ID is required'
    if (!salutation) errs.salutation = 'Select salutation'
    if (!firstName.trim()) errs.firstName = 'First name is required'
    if (designation === '0') errs.designation = 'Select designation'
    if (!doj) errs.doj = 'Date of joining is required'
    if (!mobile.trim()) errs.mobile = 'Mobile number is required'
    else if (mobile.length !== 10) errs.mobile = 'Enter valid 10-digit mobile'
    if (!email.trim()) errs.email = 'Email is required'
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) errs.email = 'Enter valid email'
    if (Object.keys(errs).length) {
      setErrors(errs)
      // Find which tab has error and switch to it
      const facultyFields = ['facultyId', 'salutation', 'firstName', 'designation', 'doj']
      const contactFields = ['mobile', 'email']
      if (facultyFields.some(f => errs[f])) setActiveTab('faculty')
      else if (contactFields.some(f => errs[f])) setActiveTab('contact')
      showToast('Please fill all required fields.', 'error')
      return false
    }
    return true
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!validate()) return
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      showToast('Faculty registered successfully!')
    }, 1400)
  }, [facultyId, salutation, firstName, designation, doj, mobile, email])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFacultyPhoto(null); setFacultyId(''); setSalutation(''); setFirstName(''); setMiddleName('')
    setLastName(''); setDob(''); setGender('Male'); setFatherName(''); setHusbandName('')
    setMaritalStatus('Single'); setAnniversary(''); setEducation('0'); setExperience('')
    setDepartment('0'); setDesignation('0'); setBloodGroup('0'); setDoj(''); setSubjects([])
    setPresentAddress(''); setPermanentAddress(''); setSameAddress(false)
    setState('0'); setDistrict('0'); setCity(''); setPin(''); setTelephone(''); setMobile(''); setEmail('')
    setAadhar(''); setPan(''); setBankName('0'); setBranch(''); setAccountNo(''); setIfsc('')
    setErrors({}); setActiveTab('faculty')
    showToast('Form has been reset.')
  }

  const districts = state !== '0' ? (DISTRICTS_BY_STATE[state] || []) : []

  const TABS = [
    { id: 'faculty', label: 'Faculty', icon: User },
    { id: 'contact', label: 'Contact', icon: Phone },
    { id: 'other', label: 'Other', icon: FileText },
  ]

  // ─────────────────────────────────────────────────────────────────────────
  // FACULTY DETAIL SECTION
  // ─────────────────────────────────────────────────────────────────────────
  const FacultySection = () => (
    <SectionCard title="Faculty Detail" icon={User} color="blue">
      <div className="space-y-5">
        {/* Photo + Basic Info Row */}
        <div className="flex flex-col sm:flex-row gap-5">
          {/* Photo Upload */}
          <div className="flex flex-col items-center gap-3 flex-shrink-0">
            <div
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden
                flex items-center justify-center bg-slate-50 cursor-pointer hover:border-blue-400 transition-colors relative group"
              onClick={() => setPhotoModal(true)}
            >
              {facultyPhoto
                ? <img src={facultyPhoto} alt="faculty" className="w-full h-full object-cover" />
                : (
                  <div className="flex flex-col items-center gap-2 text-slate-300">
                    <Camera className="w-8 h-8" />
                    <span className="text-[10px] font-semibold text-center px-2">Click to upload</span>
                  </div>
                )}
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                <Upload className="w-6 h-6 text-white" />
              </div>
            </div>
            <button type="button" onClick={() => setPhotoModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100">
              <Upload className="w-3 h-3" />
              Upload Photo
            </button>
          </div>

          {/* Faculty ID + Salutation + Names */}
          <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Faculty ID" required error={errors.facultyId}>
              <TextInput
                value={facultyId}
                onChange={(e) => { setFacultyId(e.target.value); setErrors(p => ({ ...p, facultyId: undefined })) }}
                placeholder="e.g. FAC001"
                error={errors.facultyId}
              />
            </Field>
            <Field label="Salutation" required error={errors.salutation}>
              <NativeSelect
                value={salutation}
                onChange={(e) => { setSalutation(e.target.value); setErrors(p => ({ ...p, salutation: undefined })) }}
                error={errors.salutation}
              >
                <option value="">-- Select --</option>
                {SALUTATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="First Name" required error={errors.firstName}>
              <TextInput
                value={firstName}
                onChange={(e) => { setFirstName(e.target.value.replace(/[^a-zA-Z\s]/g, '')); setErrors(p => ({ ...p, firstName: undefined })) }}
                placeholder="First name"
                error={errors.firstName}
              />
            </Field>
            <Field label="Middle Name">
              <TextInput value={middleName} onChange={handleOnlyText(setMiddleName)} placeholder="Middle name" />
            </Field>
          </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Last Name">
            <TextInput value={lastName} onChange={handleOnlyText(setLastName)} placeholder="Last name" />
          </Field>

          <Field label="Date of Birth">
            <TextInput
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              placeholder="dd/mm/yyyy"
              type="date"
            />
          </Field>

          <Field label="Gender">
            <div className="flex gap-3 pt-1">
              {GENDERS.map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => setGender(g)}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                      ${gender === g ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}
                  >
                    {gender === g && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-[13px] text-slate-700">{g}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Father's Name">
            <TextInput value={fatherName} onChange={handleOnlyText(setFatherName)} placeholder="Father's name" />
          </Field>
        </div>

        {/* Row 3 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Husband's Name">
            <TextInput
              value={husbandName}
              onChange={handleOnlyText(setHusbandName)}
              placeholder="Husband's name"
              disabled={maritalStatus === 'Single'}
            />
          </Field>

          <Field label="Marital Status">
            <div className="flex gap-3 pt-1">
              {MARITAL_STATUS.map(m => (
                <label key={m} className="flex items-center gap-2 cursor-pointer">
                  <div
                    onClick={() => { setMaritalStatus(m); if (m === 'Single') { setHusbandName(''); setAnniversary('') } }}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors
                      ${maritalStatus === m ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`}
                  >
                    {maritalStatus === m && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <span className="text-[13px] text-slate-700">{m}</span>
                </label>
              ))}
            </div>
          </Field>

          <Field label="Anniversary Date">
            <TextInput
              value={anniversary}
              onChange={(e) => setAnniversary(e.target.value)}
              type="date"
              disabled={maritalStatus === 'Single'}
            />
          </Field>

          <Field label="Education Qualification">
            <NativeSelect value={education} onChange={(e) => setEducation(e.target.value)}>
              {EDUCATION_QUALS.map(eq => <option key={eq.value} value={eq.value}>{eq.label}</option>)}
            </NativeSelect>
          </Field>
        </div>

        {/* Row 4 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Experience" hint="in years only">
            <TextInput
              value={experience}
              onChange={handleOnlyNumbers(setExperience)}
              placeholder="Years"
              maxLength={4}
            />
          </Field>

          <Field label="Department">
            <NativeSelect value={department} onChange={(e) => setDepartment(e.target.value)}>
              {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Designation" required error={errors.designation}>
            <NativeSelect
              value={designation}
              onChange={(e) => { setDesignation(e.target.value); setErrors(p => ({ ...p, designation: undefined })) }}
              error={errors.designation}
            >
              {DESIGNATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Blood Group">
            <NativeSelect value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
              <option value="0">-- Select --</option>
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </NativeSelect>
          </Field>
        </div>

        {/* Row 5: DOJ + Subjects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Date of Joining" required error={errors.doj}>
            <TextInput
              value={doj}
              onChange={(e) => { setDoj(e.target.value); setErrors(p => ({ ...p, doj: undefined })) }}
              type="date"
              error={errors.doj}
            />
          </Field>

          <Field label="Subjects">
            <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/50">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2 gap-x-3">
                {SUBJECTS.map(sub => (
                  <label key={sub} className="flex items-center gap-2 cursor-pointer group">
                    <div
                      onClick={() => toggleSubject(sub)}
                      className={`w-4 h-4 rounded flex items-center justify-center border-2 transition-all flex-shrink-0
                        ${subjects.includes(sub)
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-slate-300 group-hover:border-blue-400'
                        }`}
                    >
                      {subjects.includes(sub) && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                    </div>
                    <span className="text-[12px] text-slate-600">{sub}</span>
                  </label>
                ))}
              </div>
              {subjects.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap gap-1">
                  {subjects.map(s => (
                    <span key={s} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {s}
                      <button type="button" onClick={() => toggleSubject(s)}><X className="w-2.5 h-2.5" /></button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Field>
        </div>
      </div>
    </SectionCard>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // CONTACT DETAIL SECTION
  // ─────────────────────────────────────────────────────────────────────────
  const ContactSection = () => (
    <SectionCard title="Contact Detail" icon={Phone} color="emerald">
      <div className="space-y-4">
        {/* Addresses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Field label="Present Address">
            <TextArea
              value={presentAddress}
              onChange={(e) => {
                setPresentAddress(e.target.value)
                if (sameAddress) setPermanentAddress(e.target.value)
              }}
              placeholder="Enter present address..."
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[12px] font-semibold text-slate-600 uppercase tracking-wide">
                Permanent Address
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => handleSameAddress(!sameAddress)}
                  className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5
                    ${sameAddress ? 'bg-blue-500' : 'bg-slate-200'}`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${sameAddress ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
                <span className="text-[12px] font-semibold text-slate-500">Same as Present</span>
              </label>
            </div>
            <TextArea
              value={permanentAddress}
              onChange={(e) => setPermanentAddress(e.target.value)}
              placeholder="Enter permanent address..."
            />
          </div>
        </div>

        {/* State + District + City + Pin */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="State">
            <NativeSelect value={state} onChange={(e) => handleStateChange(e.target.value)}>
              {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="District">
            <NativeSelect value={district} onChange={(e) => setDistrict(e.target.value)} disabled={state === '0'}>
              <option value="0">-- Select District --</option>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </NativeSelect>
          </Field>

          <Field label="City">
            <TextInput value={city} onChange={(e) => setCity(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} placeholder="City name" />
          </Field>

          <Field label="PIN Code">
            <TextInput
              value={pin}
              onChange={handleOnlyNumbers(setPin)}
              placeholder="6-digit PIN"
              maxLength={6}
            />
          </Field>
        </div>

        {/* Phone + Mobile + Email */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Telephone" hint="with STD code">
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              <TextInput
                value={telephone}
                onChange={handleOnlyNumbers(setTelephone)}
                placeholder="STD + Number"
                maxLength={14}
                className="pl-8"
              />
            </div>
          </Field>

          <Field label="Mobile No." required error={errors.mobile}>
            <div className="relative">
              <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              <TextInput
                value={mobile}
                onChange={(e) => { handleOnlyNumbers(setMobile)(e); setErrors(p => ({ ...p, mobile: undefined })) }}
                placeholder="10-digit mobile"
                maxLength={10}
                error={errors.mobile}
                className="pl-8"
              />
            </div>
          </Field>

          <Field label="Email" required error={errors.email}>
            <div className="relative">
              <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              <TextInput
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors(p => ({ ...p, email: undefined })) }}
                placeholder="email@example.com"
                type="email"
                error={errors.email}
                className="pl-8"
              />
            </div>
          </Field>
        </div>
      </div>
    </SectionCard>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // OTHER DETAIL SECTION
  // ─────────────────────────────────────────────────────────────────────────
  const OtherSection = () => (
    <SectionCard title="Other Detail" icon={FileText} color="violet">
      <div className="space-y-4">
        {/* Aadhar + PAN */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Aadhar Card No.">
            <div className="relative">
              <Shield className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              <TextInput
                value={aadhar}
                onChange={handleOnlyNumbers(setAadhar)}
                placeholder="12-digit Aadhar number"
                maxLength={12}
                className="pl-8"
              />
            </div>
            {aadhar.length > 0 && aadhar.length < 12 && (
              <p className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5">
                <Info className="w-3 h-3" /> {12 - aadhar.length} more digits needed
              </p>
            )}
          </Field>

          <Field label="PAN Card No.">
            <div className="relative">
              <CreditCard className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
              <TextInput
                value={pan}
                onChange={(e) => setPan(e.target.value.toUpperCase())}
                placeholder="e.g. ABCDE1234F"
                maxLength={10}
                className="pl-8 uppercase"
              />
            </div>
          </Field>
        </div>

        {/* Bank Details */}
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex items-center gap-2 mb-4">
            <Landmark className="w-4 h-4 text-violet-600" />
            <span className="text-[13px] font-bold text-slate-700">Bank Details</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Bank Name">
              <NativeSelect value={bankName} onChange={(e) => setBankName(e.target.value)}>
                {BANKS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Branch">
              <TextInput value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="Branch name" />
            </Field>

            <Field label="Account No.">
              <TextInput
                value={accountNo}
                onChange={handleOnlyNumbers(setAccountNo)}
                placeholder="Account number"
                maxLength={16}
              />
            </Field>

            <Field label="IFSC Code">
              <TextInput
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value.toUpperCase())}
                placeholder="e.g. SBIN0001234"
                maxLength={15}
                className="uppercase"
              />
            </Field>
          </div>
        </div>
      </div>
    </SectionCard>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-100">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 mb-3 flex-wrap">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Registration</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 font-semibold">Faculty Registration</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-[20px] sm:text-[22px] font-bold text-slate-800 flex items-center gap-2.5">
                <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <GraduationCap className="w-5 h-5 text-white" />
                </span>
                Faculty Registration
              </h1>
              <p className="text-[13px] text-slate-500 mt-1">
                Fill in all details to register a new faculty member.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full
                bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Fields marked * are required
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Mobile Tab Nav ── */}
      <MobileTabNav tabs={TABS} active={activeTab} onChange={setActiveTab} />

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* Required fields hint — mobile only */}
        <div className="flex sm:hidden items-center gap-2 text-[12px] font-semibold px-3 py-2 rounded-xl
          bg-amber-50 text-amber-700 border border-amber-100">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          Fields marked * are required
        </div>

        {/* ── DESKTOP: All sections visible ── */}
        <div className="hidden sm:flex flex-col gap-5">
          <FacultySection />
          <ContactSection />
          <OtherSection />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 px-5 py-4
            rounded-2xl border border-slate-200 bg-white shadow-sm">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
            >
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold
                text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                transition-all active:scale-95 disabled:opacity-70"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit Registration'}
            </button>
          </div>
        </div>

        {/* ── MOBILE: Tabbed sections ── */}
        <div className="flex flex-col sm:hidden gap-4">
          {activeTab === 'faculty' && <FacultySection />}
          {activeTab === 'contact' && <ContactSection />}
          {activeTab === 'other' && <OtherSection />}

          {/* Mobile Nav Buttons */}
          <div className="flex gap-3">
            {activeTab !== 'faculty' && (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'other' ? 'contact' : 'faculty')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 border border-slate-200"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                Back
              </button>
            )}
            {activeTab !== 'other' ? (
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'faculty' ? 'contact' : 'other')}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                  text-white bg-blue-600 shadow-md shadow-blue-500/20"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                  text-white bg-blue-600 shadow-md shadow-blue-500/20 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 border border-slate-200"
          >
            <RotateCcw className="w-4 h-4" /> Reset Form
          </button>
        </div>
      </div>

      {/* Photo Upload Modal */}
      <PhotoUploadModal open={photoModal} onClose={() => setPhotoModal(false)} onUpload={setFacultyPhoto} />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Scrollbar hide utility */}
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  )
}
