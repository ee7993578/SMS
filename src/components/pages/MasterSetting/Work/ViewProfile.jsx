/**
 * ViewProfile.jsx
 * Folder: src/pages/Faculty/ViewProfile.jsx
 *
 * Converts legacy ASPX "Faculty Profile" page to fully-responsive React + Tailwind.
 *
 * Sections:
 *  1. Faculty Detail (personal info, qualifications, dept/designation)
 *  2. Contact Detail (addresses, phone, email)
 *  3. Update Password
 *  4. Other Detail (Aadhar, PAN, Bank info)
 *
 * Features:
 *  - Photo upload modal
 *  - Form validation (same logic as original JS)
 *  - Mobile: section tabs + stacked fields
 *  - Desktop: multi-column grid layout
 *  - Toast notifications
 */

import { useState, useCallback, useRef } from 'react'
import {
  User, Phone, Lock, CreditCard, Camera, Upload, X, Check,
  AlertCircle, ChevronDown, Eye, EyeOff, MapPin, Mail,
  Building2, GraduationCap, Calendar, Shield, Loader2,
  ChevronRight, Home, BookOpen, Briefcase, RefreshCw,
  UserCircle, Save, SlidersHorizontal
} from 'lucide-react'

// ─── STATIC DUMMY DATA ────────────────────────────────────────────────────────
const DEPARTMENTS = [
  { value: '0', label: '-- Select Department --' },
  { value: 'science', label: 'Science' },
  { value: 'maths', label: 'Mathematics' },
  { value: 'english', label: 'English' },
  { value: 'hindi', label: 'Hindi' },
  { value: 'social', label: 'Social Science' },
  { value: 'computer', label: 'Computer Science' },
  { value: 'commerce', label: 'Commerce' },
]

const DESIGNATIONS = [
  { value: '0', label: '-- Select Designation --' },
  { value: 'principal', label: 'Principal' },
  { value: 'vice_principal', label: 'Vice Principal' },
  { value: 'hod', label: 'Head of Department' },
  { value: 'senior_teacher', label: 'Senior Teacher' },
  { value: 'teacher', label: 'Teacher' },
  { value: 'assistant_teacher', label: 'Assistant Teacher' },
  { value: 'prt', label: 'PRT' },
  { value: 'tgt', label: 'TGT' },
  { value: 'pgt', label: 'PGT' },
]

const BLOOD_GROUPS = [
  { value: '0', label: '-- Select --' },
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
]

const STATES = [
  { value: '0', label: '-- Select State --' },
  { value: 'UP', label: 'Uttar Pradesh' },
  { value: 'UK', label: 'Uttarakhand' },
  { value: 'DL', label: 'Delhi' },
  { value: 'HP', label: 'Himachal Pradesh' },
  { value: 'HR', label: 'Haryana' },
  { value: 'RJ', label: 'Rajasthan' },
  { value: 'MP', label: 'Madhya Pradesh' },
]

const DISTRICTS = {
  UP: ['-- Select District --', 'Lucknow', 'Agra', 'Meerut', 'Varanasi', 'Allahabad', 'Kanpur'],
  UK: ['-- Select District --', 'Dehradun', 'Haridwar', 'Nainital', 'Almora', 'Pithoragarh'],
  DL: ['-- Select District --', 'Central Delhi', 'North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
  HR: ['-- Select District --', 'Gurugram', 'Faridabad', 'Ambala', 'Hisar', 'Rohtak'],
  RJ: ['-- Select District --', 'Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  HP: ['-- Select District --', 'Shimla', 'Kangra', 'Mandi', 'Kullu'],
  MP: ['-- Select District --', 'Bhopal', 'Indore', 'Gwalior', 'Jabalpur'],
}

const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'History', 'Geography',
  'Computer Science', 'Economics', 'Accountancy', 'Business Studies',
  'Physical Education', 'Music', 'Art',
]

// Pre-filled dummy faculty data
const INITIAL_DATA = {
  facultyId: 'FAC-2024-001',
  salutation: 'Mr.',
  firstName: 'Rajesh',
  middleName: 'Kumar',
  lastName: 'Sharma',
  dob: '15 Mar 1985',
  gender: 'Male',
  fatherHusbandName: 'Ramesh Sharma',
  maritalStatus: 'Married',
  anniversaryDate: '20 Jun 2012',
  bQualification: 'B.Sc. (Physics)',
  hQualification: 'M.Sc. (Physics)',
  dateOfJoining: '01 Jul 2010',
  experience: '14',
  department: 'science',
  designation: 'tgt',
  bloodGroup: 'B+',
  subjects: ['Physics', 'Mathematics'],
  presentAddress: '45, Shastri Nagar, Meerut - 250004',
  permanentAddress: '45, Shastri Nagar, Meerut - 250004',
  state: 'UP',
  district: 'Meerut',
  city: 'Meerut',
  pin: '250004',
  telephone: '0121-2650123',
  mobile: '9876543210',
  email: 'rajesh.sharma@school.edu.in',
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
  aadharCard: '123456789012',
  panCard: 'ABCDE1234F',
  accountNo: '1234567890123456',
  ifscCode: 'SBIN0001234',
}

// ─── SECTION TABS CONFIG ──────────────────────────────────────────────────────
const SECTIONS = [
  { id: 'faculty',  label: 'Faculty Detail',  icon: User },
  { id: 'contact',  label: 'Contact',          icon: Phone },
  { id: 'password', label: 'Password',         icon: Lock },
  { id: 'other',    label: 'Other Info',       icon: CreditCard },
]

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-800/50
        ${error ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
        ${className}`}
      {...props}
    />
  )
}

function Select({ error, children, className = '', ...props }) {
  return (
    <div className="relative">
      <select
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function RadioGroup({ options, value, onChange, name }) {
  return (
    <div className="flex gap-4 pt-1">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
          <div
            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all
              ${value === opt.value
                ? 'border-blue-600 dark:border-indigo-500'
                : 'border-slate-300 dark:border-slate-600'}`}
            onClick={() => onChange(opt.value)}
          >
            {value === opt.value && (
              <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-indigo-500" />
            )}
          </div>
          <span className="text-[13px] text-slate-700 dark:text-slate-300 select-none" onClick={() => onChange(opt.value)}>
            {opt.label}
          </span>
        </label>
      ))}
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

// Section Card wrapper
function SectionCard({ title, icon: Icon, children, accent = 'blue' }) {
  const accents = {
    blue:    'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500',
    violet:  'bg-violet-500',
  }
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className={`w-1 h-5 rounded-full ${accents[accent]} flex-shrink-0`} />
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── PHOTO UPLOAD MODAL ───────────────────────────────────────────────────────
function PhotoModal({ open, onClose, onUpload }) {
  const fileRef = useRef()
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(f)
  }

  const handleUpload = () => {
    if (!preview) return
    setUploading(true)
    setTimeout(() => {
      onUpload(preview)
      setUploading(false)
      setPreview(null)
      onClose()
    }, 800)
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-[rgba(99,102,241,0.2)]"
          style={{ animation: 'modalPop .2s ease' }}
        >
          <style>{`@keyframes modalPop{from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)}}`}</style>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Upload Photo</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Preview */}
            <div
              className="w-full h-44 rounded-xl border-2 border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.3)]
                flex items-center justify-center cursor-pointer hover:border-blue-400 dark:hover:border-indigo-400 transition-colors overflow-hidden bg-slate-50 dark:bg-[#1e2238]"
              onClick={() => fileRef.current?.click()}
            >
              {preview
                ? <img src={preview} alt="preview" className="w-full h-full object-cover rounded-xl" />
                : (
                  <div className="text-center space-y-2">
                    <Upload className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                    <p className="text-[12px] text-slate-400 dark:text-slate-500">Click to select image</p>
                    <p className="text-[11px] text-slate-300 dark:text-slate-600">JPG, PNG, GIF supported</p>
                  </div>
                )
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 pb-5">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={handleUpload} disabled={!preview || uploading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50 transition-all">
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              Upload
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── SECTION: FACULTY DETAIL ──────────────────────────────────────────────────
function FacultyDetailSection({ form, setForm, errors }) {
  const districts = form.state && DISTRICTS[form.state] ? DISTRICTS[form.state] : ['-- Select District --']

  return (
    <div className="space-y-5">
      {/* Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Faculty User ID" required>
          <Input value={form.facultyId} disabled className="bg-slate-50 dark:bg-slate-800/50" />
        </Field>
        <Field label="Salutation" error={errors.salutation} required>
          <Select value={form.salutation} onChange={e => setForm(p => ({ ...p, salutation: e.target.value }))} error={errors.salutation}>
            <option value="0">-- Select --</option>
            <option value="Mr.">Mr.</option>
            <option value="Ms.">Ms.</option>
            <option value="Mrs.">Mrs.</option>
          </Select>
        </Field>
        <Field label="First Name" error={errors.firstName} required>
          <Input
            value={form.firstName}
            onChange={e => setForm(p => ({ ...p, firstName: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))}
            placeholder="Enter first name"
            error={errors.firstName}
          />
        </Field>
        <Field label="Middle Name">
          <Input
            value={form.middleName}
            onChange={e => setForm(p => ({ ...p, middleName: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))}
            placeholder="Enter middle name"
          />
        </Field>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Last Name">
          <Input
            value={form.lastName}
            onChange={e => setForm(p => ({ ...p, lastName: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))}
            placeholder="Enter last name"
          />
        </Field>
        <Field label="Date of Birth">
          <Input
            type="date"
            value={form.dob}
            onChange={e => setForm(p => ({ ...p, dob: e.target.value }))}
          />
        </Field>
        <Field label="Gender">
          <RadioGroup
            name="gender"
            value={form.gender}
            onChange={v => setForm(p => ({ ...p, gender: v }))}
            options={[{ value: 'Male', label: 'Male' }, { value: 'Female', label: 'Female' }]}
          />
        </Field>
        <Field label="Father's / Husband's Name">
          <Input
            value={form.fatherHusbandName}
            onChange={e => setForm(p => ({ ...p, fatherHusbandName: e.target.value.replace(/[^a-zA-Z\s.]/g, '') }))}
            placeholder="Enter name"
          />
        </Field>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Marital Status">
          <RadioGroup
            name="maritalStatus"
            value={form.maritalStatus}
            onChange={v => setForm(p => ({ ...p, maritalStatus: v }))}
            options={[{ value: 'Single', label: 'Single' }, { value: 'Married', label: 'Married' }]}
          />
        </Field>
        {form.maritalStatus === 'Married' && (
          <Field label="Anniversary Date">
            <Input
              type="date"
              value={form.anniversaryDate}
              onChange={e => setForm(p => ({ ...p, anniversaryDate: e.target.value }))}
            />
          </Field>
        )}
        <Field label="Basic Qualification">
          <Input
            value={form.bQualification}
            onChange={e => setForm(p => ({ ...p, bQualification: e.target.value }))}
            placeholder="e.g. B.Sc., B.A."
          />
        </Field>
        <Field label="Higher Qualification">
          <Input
            value={form.hQualification}
            onChange={e => setForm(p => ({ ...p, hQualification: e.target.value }))}
            placeholder="e.g. M.Sc., M.A., Ph.D."
          />
        </Field>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Date of Joining">
          <Input
            type="date"
            value={form.dateOfJoining}
            onChange={e => setForm(p => ({ ...p, dateOfJoining: e.target.value }))}
          />
        </Field>
        <Field label="Experience (Years)" hint="Numbers only">
          <Input
            value={form.experience}
            maxLength={4}
            onChange={e => setForm(p => ({ ...p, experience: e.target.value.replace(/\D/g, '') }))}
            placeholder="e.g. 5"
          />
        </Field>
        <Field label="Department">
          <Select value={form.department} onChange={e => setForm(p => ({ ...p, designation: '0', department: e.target.value }))}>
            {DEPARTMENTS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </Select>
        </Field>
        <Field label="Designation" error={errors.designation} required>
          <Select value={form.designation} onChange={e => setForm(p => ({ ...p, designation: e.target.value }))} error={errors.designation}>
            {DESIGNATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </Select>
        </Field>
      </div>

      {/* Blood Group */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Blood Group">
          <Select value={form.bloodGroup} onChange={e => setForm(p => ({ ...p, bloodGroup: e.target.value }))}>
            {BLOOD_GROUPS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
          </Select>
        </Field>
      </div>

      {/* Subjects */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2 block">
          Subjects Taught
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {SUBJECTS.map(sub => {
            const checked = form.subjects.includes(sub)
            return (
              <label key={sub}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all text-[12px] font-medium
                  ${checked
                    ? 'border-blue-400 bg-blue-50 text-blue-700 dark:border-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-[rgba(99,102,241,0.4)]'
                  }`}
              >
                <div className={`w-3.5 h-3.5 rounded flex-shrink-0 flex items-center justify-center border transition-all
                  ${checked ? 'border-blue-500 bg-blue-500 dark:border-indigo-500 dark:bg-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}
                  onClick={() => {
                    setForm(p => ({
                      ...p,
                      subjects: checked ? p.subjects.filter(s => s !== sub) : [...p.subjects, sub]
                    }))
                  }}
                >
                  {checked && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <span onClick={() => {
                  setForm(p => ({
                    ...p,
                    subjects: checked ? p.subjects.filter(s => s !== sub) : [...p.subjects, sub]
                  }))
                }}>{sub}</span>
              </label>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── SECTION: CONTACT DETAIL ──────────────────────────────────────────────────
function ContactSection({ form, setForm, errors }) {
  const handleSameAddress = (checked) => {
    setForm(p => ({
      ...p,
      permanentAddress: checked ? p.presentAddress : ''
    }))
  }

  const districts = form.state && DISTRICTS[form.state] ? DISTRICTS[form.state] : ['-- Select District --']

  return (
    <div className="space-y-5">
      {/* Addresses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Field label="Present Address">
          <textarea
            value={form.presentAddress}
            onChange={e => setForm(p => ({ ...p, presentAddress: e.target.value.replace(/'/g, '') }))}
            rows={3}
            placeholder="Enter present address"
            className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
              outline-none resize-none transition-all bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
              placeholder-slate-300 dark:placeholder-slate-600
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
          />
        </Field>
        <Field label="Permanent Address">
          <label className="flex items-center gap-2 mb-1.5 cursor-pointer">
            <div
              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                ${form.presentAddress && form.permanentAddress === form.presentAddress
                  ? 'border-blue-500 bg-blue-500 dark:border-indigo-500 dark:bg-indigo-500'
                  : 'border-slate-300 dark:border-slate-600'}`}
              onClick={() => handleSameAddress(!(form.presentAddress && form.permanentAddress === form.presentAddress))}
            >
              {form.presentAddress && form.permanentAddress === form.presentAddress && (
                <Check className="w-2.5 h-2.5 text-white" />
              )}
            </div>
            <span className="text-[12px] text-slate-500 dark:text-slate-400 select-none"
              onClick={() => handleSameAddress(!(form.presentAddress && form.permanentAddress === form.presentAddress))}>
              Same as present address
            </span>
          </label>
          <textarea
            value={form.permanentAddress}
            onChange={e => setForm(p => ({ ...p, permanentAddress: e.target.value.replace(/'/g, '') }))}
            rows={3}
            placeholder="Enter permanent address"
            className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
              outline-none resize-none transition-all bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
              placeholder-slate-300 dark:placeholder-slate-600
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
          />
        </Field>
      </div>

      {/* Location */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="State">
          <Select value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value, district: '' }))}>
            {STATES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </Select>
        </Field>
        <Field label="District">
          <Select value={form.district} onChange={e => setForm(p => ({ ...p, district: e.target.value }))}>
            {districts.map((d, i) => <option key={i} value={i === 0 ? '0' : d}>{d}</option>)}
          </Select>
        </Field>
        <Field label="City">
          <Input
            value={form.city}
            onChange={e => setForm(p => ({ ...p, city: e.target.value.replace(/[^a-zA-Z\s]/g, '') }))}
            placeholder="Enter city"
          />
        </Field>
        <Field label="PIN Code" hint="6 digits">
          <Input
            value={form.pin}
            maxLength={6}
            onChange={e => setForm(p => ({ ...p, pin: e.target.value.replace(/\D/g, '') }))}
            placeholder="e.g. 110001"
          />
        </Field>
      </div>

      {/* Phone & Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Telephone (With STD Code)">
          <Input
            value={form.telephone}
            maxLength={14}
            onChange={e => setForm(p => ({ ...p, telephone: e.target.value.replace(/[^0-9-]/g, '') }))}
            placeholder="e.g. 0121-2650123"
          />
        </Field>
        <Field label="Mobile Number" hint="10 digits">
          <Input
            value={form.mobile}
            maxLength={10}
            onChange={e => setForm(p => ({ ...p, mobile: e.target.value.replace(/\D/g, '') }))}
            placeholder="e.g. 9876543210"
          />
        </Field>
        <Field label="Email Address" error={errors.email}>
          <Input
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="e.g. name@school.edu.in"
            error={errors.email}
          />
        </Field>
      </div>
    </div>
  )
}

// ─── SECTION: PASSWORD ────────────────────────────────────────────────────────
function PasswordSection({ form, setForm, errors }) {
  const [show, setShow] = useState({ old: false, new: false, confirm: false })

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3 flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-amber-700 dark:text-amber-400">
          Leave password fields empty if you don't want to change your password. Make sure new and confirm passwords match.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Old Password" error={errors.oldPassword}>
          <div className="relative">
            <Input
              type={show.old ? 'text' : 'password'}
              value={form.oldPassword}
              onChange={e => setForm(p => ({ ...p, oldPassword: e.target.value }))}
              placeholder="Enter old password"
              error={errors.oldPassword}
              className="pr-10"
              autoComplete="off"
            />
            <button type="button" onClick={() => setShow(p => ({ ...p, old: !p.old }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              {show.old ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>
        <Field label="New Password" error={errors.newPassword}>
          <div className="relative">
            <Input
              type={show.new ? 'text' : 'password'}
              value={form.newPassword}
              onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
              placeholder="Enter new password"
              error={errors.newPassword}
              className="pr-10"
              autoComplete="off"
            />
            <button type="button" onClick={() => setShow(p => ({ ...p, new: !p.new }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              {show.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>
        <Field label="Confirm New Password" error={errors.confirmPassword}>
          <div className="relative">
            <Input
              type={show.confirm ? 'text' : 'password'}
              value={form.confirmPassword}
              onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
              placeholder="Re-enter new password"
              error={errors.confirmPassword}
              className="pr-10"
              autoComplete="off"
            />
            <button type="button" onClick={() => setShow(p => ({ ...p, confirm: !p.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
              {show.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </Field>
      </div>

      {/* Password match indicator */}
      {form.newPassword && form.confirmPassword && (
        <div className={`flex items-center gap-2 text-[12px] font-semibold
          ${form.newPassword === form.confirmPassword ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}`}>
          {form.newPassword === form.confirmPassword
            ? <><Check className="w-4 h-4" /> Passwords match</>
            : <><AlertCircle className="w-4 h-4" /> Passwords do not match</>}
        </div>
      )}
    </div>
  )
}

// ─── SECTION: OTHER DETAIL ────────────────────────────────────────────────────
function OtherDetailSection({ form, setForm, errors }) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Aadhar Card No." hint="12 digits">
          <Input
            value={form.aadharCard}
            maxLength={12}
            onChange={e => setForm(p => ({ ...p, aadharCard: e.target.value.replace(/\D/g, '') }))}
            placeholder="Enter 12-digit Aadhar number"
          />
        </Field>
        <Field label="PAN Card No." hint="Format: ABCDE1234F">
          <Input
            value={form.panCard}
            maxLength={10}
            onChange={e => setForm(p => ({ ...p, panCard: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
            placeholder="e.g. ABCDE1234F"
          />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Bank Account Number" hint="Up to 16 digits">
          <Input
            value={form.accountNo}
            maxLength={16}
            onChange={e => setForm(p => ({ ...p, accountNo: e.target.value.replace(/\D/g, '') }))}
            placeholder="Enter account number"
          />
        </Field>
        <Field label="IFSC Code" hint="e.g. SBIN0001234">
          <Input
            value={form.ifscCode}
            maxLength={15}
            onChange={e => setForm(p => ({ ...p, ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '') }))}
            placeholder="e.g. SBIN0001234"
          />
        </Field>
      </div>
    </div>
  )
}

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-wrap">
      <div className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-indigo-400 cursor-pointer transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
      </div>
      <ChevronRight className="w-3 h-3" />
      <span className="text-blue-600 dark:text-indigo-400 font-semibold">Faculty Profile</span>
    </nav>
  )
}

// ─── FACULTY AVATAR + PHOTO AREA ─────────────────────────────────────────────
function FacultyAvatar({ photo, name, facultyId, onUploadClick }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Photo circle */}
      <div className="relative group">
        <div className="w-24 h-24 rounded-2xl border-2 border-slate-200 dark:border-[rgba(99,102,241,0.3)] overflow-hidden shadow-md bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center">
          {photo
            ? <img src={photo} alt={name} className="w-full h-full object-cover" />
            : <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{initials}</span>
          }
        </div>
        {/* Overlay */}
        <button
          type="button"
          onClick={onUploadClick}
          className="absolute inset-0 rounded-2xl bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
        >
          <Camera className="w-6 h-6 text-white" />
        </button>
      </div>

      <button
        type="button"
        onClick={onUploadClick}
        className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 dark:text-indigo-400 hover:underline"
      >
        <Upload className="w-3.5 h-3.5" />
        Upload Photo
      </button>

      <div className="text-center">
        <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{name}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{facultyId}</p>
      </div>
    </div>
  )
}

// ─── MOBILE SECTION TAB NAV ───────────────────────────────────────────────────
function MobileSectionNav({ active, onChange }) {
  return (
    <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-x-auto no-scrollbar">
      {SECTIONS.map(s => {
        const Icon = s.icon
        const isActive = active === s.id
        return (
          <button key={s.id} type="button" onClick={() => onChange(s.id)}
            className={`flex-1 min-w-[72px] flex flex-col items-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap
              ${isActive
                ? 'bg-white dark:bg-[#1a1f35] text-blue-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
          >
            <Icon className="w-4 h-4" />
            {s.label.split(' ')[0]}
          </button>
        )
      })}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ViewProfile() {
  const [form, setForm] = useState(INITIAL_DATA)
  const [photo, setPhoto] = useState(null)
  const [photoModal, setPhotoModal] = useState(false)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [activeSection, setActiveSection] = useState('faculty') // mobile tab

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation (same logic as original ASPX JS) ───────────────────────────
  const validate = useCallback(() => {
    const err = {}

    if (!form.salutation || form.salutation === '0') {
      err.salutation = 'Please select salutation'
    }
    if (!form.firstName?.trim()) {
      err.firstName = 'First name is required'
    }
    if (!form.designation || form.designation === '0') {
      err.designation = 'Please select designation'
    }

    // Email validation
    const emailReg = /^([\w-.]+@([\w-]+\.)+[\w-]{2,4})?$/
    if (form.email && !emailReg.test(form.email.trim())) {
      err.email = 'Invalid email address'
    }

    // Password match
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      err.confirmPassword = 'Confirm password does not match!'
    }

    setErrors(err)
    window.scrollTo(0, 0)
    return Object.keys(err).length === 0
  }, [form])

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleUpdate = () => {
    if (!validate()) {
      showToast('Please fix validation errors before saving.', 'error')
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast('Profile updated successfully!')
    }, 1000)
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm(INITIAL_DATA)
    setErrors({})
    showToast('Form reset to saved values.')
  }

  const fullName = [form.salutation !== '0' ? form.salutation : '', form.firstName, form.middleName, form.lastName]
    .filter(Boolean).join(' ')

  // Determine if a section has errors
  const sectionHasError = {
    faculty: !!(errors.salutation || errors.firstName || errors.designation),
    contact: !!errors.email,
    password: !!(errors.oldPassword || errors.newPassword || errors.confirmPassword),
    other: false,
  }

  return (
    <div className="space-y-4 pb-16">
      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Faculty Profile
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and update your personal, contact, and account details.
          </p>
        </div>

        {/* Desktop action buttons */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <button type="button" onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button type="button" onClick={handleUpdate} disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Profile
          </button>
        </div>
      </div>

      {/* ── DESKTOP LAYOUT ─────────────────────────────────────────────────── */}
      <div className="hidden sm:block space-y-4">

        {/* Faculty Detail Card — with photo sidebar */}
        <SectionCard title="Faculty Detail" icon={User} accent="blue">
          <div className="flex gap-6">
            {/* Left: Photo */}
            <div className="flex-shrink-0">
              <FacultyAvatar
                photo={photo}
                name={fullName || 'Faculty Name'}
                facultyId={form.facultyId}
                onUploadClick={() => setPhotoModal(true)}
              />
            </div>
            {/* Right: Fields */}
            <div className="flex-1 min-w-0">
              <FacultyDetailSection form={form} setForm={setForm} errors={errors} />
            </div>
          </div>
        </SectionCard>

        {/* Contact Detail */}
        <SectionCard title="Contact Detail" icon={Phone} accent="emerald">
          <ContactSection form={form} setForm={setForm} errors={errors} />
        </SectionCard>

        {/* Update Password */}
        <SectionCard title="Update Password" icon={Lock} accent="amber">
          <PasswordSection form={form} setForm={setForm} errors={errors} />
        </SectionCard>

        {/* Other Detail */}
        <SectionCard title="Other Detail" icon={CreditCard} accent="violet">
          <OtherDetailSection form={form} setForm={setForm} errors={errors} />
        </SectionCard>

        {/* Desktop Footer Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button type="button" onClick={handleUpdate} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Update Profile
          </button>
        </div>
      </div>

      {/* ── MOBILE LAYOUT ──────────────────────────────────────────────────── */}
      <div className="sm:hidden space-y-4">

        {/* Mobile Photo + Name card */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm p-5">
          <FacultyAvatar
            photo={photo}
            name={fullName || 'Faculty Name'}
            facultyId={form.facultyId}
            onUploadClick={() => setPhotoModal(true)}
          />
        </div>

        {/* Mobile Tab Navigation */}
        <MobileSectionNav active={activeSection} onChange={setActiveSection} />

        {/* Error indicator pills */}
        {Object.keys(errors).length > 0 && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-[12px] text-rose-700 dark:text-rose-400 font-semibold">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            Please fix validation errors before saving.
          </div>
        )}

        {/* Mobile Section Content */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          {/* Section header */}
          {(() => {
            const sec = SECTIONS.find(s => s.id === activeSection)
            if (!sec) return null
            const Icon = sec.icon
            const hasErr = sectionHasError[activeSection]
            return (
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">{sec.label}</span>
                {hasErr && (
                  <span className="flex items-center gap-1 text-[11px] text-rose-500 font-semibold">
                    <AlertCircle className="w-3 h-3" /> Error
                  </span>
                )}
              </div>
            )
          })()}

          <div className="p-4">
            {activeSection === 'faculty' && <FacultyDetailSection form={form} setForm={setForm} errors={errors} />}
            {activeSection === 'contact' && <ContactSection form={form} setForm={setForm} errors={errors} />}
            {activeSection === 'password' && <PasswordSection form={form} setForm={setForm} errors={errors} />}
            {activeSection === 'other' && <OtherDetailSection form={form} setForm={setForm} errors={errors} />}
          </div>
        </div>

        {/* Mobile tab navigation dots */}
        <div className="flex justify-center gap-1.5">
          {SECTIONS.map(s => (
            <div
              key={s.id}
              className={`h-1.5 rounded-full transition-all ${activeSection === s.id ? 'w-6 bg-blue-600 dark:bg-indigo-500' : 'w-1.5 bg-slate-200 dark:bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {/* ── MOBILE BOTTOM STICKY ACTIONS ──────────────────────────────────── */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] px-4 py-3 flex gap-3 shadow-lg">
        <button type="button" onClick={handleReset}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold
            bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
        <button type="button" onClick={handleUpdate} disabled={saving}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
            bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
            shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Update Profile
        </button>
      </div>

      {/* Photo Upload Modal */}
      <PhotoModal
        open={photoModal}
        onClose={() => setPhotoModal(false)}
        onUpload={(url) => { setPhoto(url); showToast('Photo uploaded successfully!') }}
      />

      {/* Toast Notification */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Prevent text cut off on mobile due to sticky bar */}
      <div className="sm:hidden h-4" />
    </div>
  )
}
