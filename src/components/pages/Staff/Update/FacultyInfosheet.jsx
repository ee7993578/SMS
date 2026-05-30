/**
 * FacultyInfosheet.jsx
 * Folder: src/pages/Registration/FacultyInfosheet.jsx
 *
 * Converts legacy ASPX "Faculty Infosheet" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Faculty Name, Faculty ID, Department, Mobile, Edit, Withdraw
 * Features:
 *  - GridView of faculty records
 *  - Edit modal (tabbed on mobile) with all faculty fields
 *  - Withdraw modal with reason text
 *  - Toast notifications
 *  - Mobile-first responsive cards
 *  - Desktop ERP-style table
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Search, RefreshCw, Edit2, UserMinus, X, Check,
  Loader2, ChevronDown, AlertCircle, Upload, Eye, EyeOff,
  User, Mail, Phone, MapPin, Building2, Calendar,
  BookOpen, CreditCard, Shield, Briefcase, Info,
  ChevronRight, ChevronLeft, Users, SlidersHorizontal,
  FileText, Camera, Home, GraduationCap, BadgeCheck,
  Banknote, Hash
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const DEPARTMENTS = [
  'Mathematics', 'Science', 'English', 'Hindi', 'Social Studies',
  'Computer Science', 'Physical Education', 'Arts & Crafts',
  'Commerce', 'Biology', 'Chemistry', 'Physics'
]

const DISTRICTS = [
  'Dehradun', 'Haridwar', 'Rishikesh', 'Roorkee', 'Mussoorie',
  'Pauri', 'Tehri', 'Uttarkashi', 'Chamoli', 'Rudraprayag'
]

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']

const PRIORITIES = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']

const FACULTY_DATA = [
  {
    f_id: 'F001', name: 'Dr. Rajesh Kumar Sharma', e_mail: 'rajesh.sharma@school.edu',
    staff_u_id: 'STAFF001', department: 'Mathematics', Mobile: '9876543210',
    first_name: 'Rajesh', mid_name: 'Kumar', last_name: 'Sharma',
    father_name: 'Ramesh Sharma', husband_name: '', dob: '15/03/1978',
    gender: 'Male', blood_group: 'B+', edu_grad: 'B.Sc. Mathematics', edu_pg: 'M.Sc. Mathematics',
    experience: '18', priority: '1', address: '45, Rajpur Road, Dehradun',
    doj: '01/07/2006', district: 'Dehradun', city: 'Dehradun',
    aadhar: '234567891234', pan: 'ABCDE1234F', acc_no: '12345678901234',
    ifsc: 'SBIN0001234', image: null, status: 'Active'
  },
  {
    f_id: 'F002', name: 'Mrs. Priya Verma', e_mail: 'priya.verma@school.edu',
    staff_u_id: 'STAFF002', department: 'English', Mobile: '9876543211',
    first_name: 'Priya', mid_name: '', last_name: 'Verma',
    father_name: 'Suresh Verma', husband_name: 'Amit Verma', dob: '22/07/1985',
    gender: 'Female', blood_group: 'A+', edu_grad: 'B.A. English', edu_pg: 'M.A. English',
    experience: '12', priority: '2', address: '12, Gandhi Nagar, Haridwar',
    doj: '15/08/2012', district: 'Haridwar', city: 'Haridwar',
    aadhar: '345678912345', pan: 'BCDEF2345G', acc_no: '23456789012345',
    ifsc: 'HDFC0002345', image: null, status: 'Active'
  },
  {
    f_id: 'F003', name: 'Mr. Sunil Singh Rawat', e_mail: 'sunil.rawat@school.edu',
    staff_u_id: 'STAFF003', department: 'Science', Mobile: '9876543212',
    first_name: 'Sunil', mid_name: 'Singh', last_name: 'Rawat',
    father_name: 'Mohan Singh Rawat', husband_name: '', dob: '10/11/1980',
    gender: 'Male', blood_group: 'O+', edu_grad: 'B.Sc. Physics', edu_pg: 'M.Sc. Physics',
    experience: '15', priority: '3', address: '78, Saharanpur Road, Roorkee',
    doj: '01/04/2009', district: 'Roorkee', city: 'Roorkee',
    aadhar: '456789123456', pan: 'CDEFG3456H', acc_no: '34567890123456',
    ifsc: 'ICICI0003456', image: null, status: 'Active'
  },
  {
    f_id: 'F004', name: 'Ms. Anjali Negi', e_mail: 'anjali.negi@school.edu',
    staff_u_id: 'STAFF004', department: 'Hindi', Mobile: '9876543213',
    first_name: 'Anjali', mid_name: '', last_name: 'Negi',
    father_name: 'Dinesh Negi', husband_name: '', dob: '05/05/1990',
    gender: 'Female', blood_group: 'AB+', edu_grad: 'B.A. Hindi', edu_pg: 'M.A. Hindi',
    experience: '8', priority: '4', address: '34, Indira Nagar, Rishikesh',
    doj: '10/06/2016', district: 'Rishikesh', city: 'Rishikesh',
    aadhar: '567891234567', pan: 'DEFGH4567I', acc_no: '45678901234567',
    ifsc: 'AXIS0004567', image: null, status: 'Active'
  },
  {
    f_id: 'F005', name: 'Mr. Vikram Bisht', e_mail: 'vikram.bisht@school.edu',
    staff_u_id: 'STAFF005', department: 'Computer Science', Mobile: '9876543214',
    first_name: 'Vikram', mid_name: '', last_name: 'Bisht',
    father_name: 'Govind Bisht', husband_name: '', dob: '18/09/1987',
    gender: 'Male', blood_group: 'B-', edu_grad: 'B.Tech. CS', edu_pg: 'M.Tech. CS',
    experience: '10', priority: '5', address: '90, Clock Tower Area, Dehradun',
    doj: '20/03/2014', district: 'Dehradun', city: 'Dehradun',
    aadhar: '678912345678', pan: 'EFGHI5678J', acc_no: '56789012345678',
    ifsc: 'PNB0005678', image: null, status: 'Active'
  },
  {
    f_id: 'F006', name: 'Mrs. Kavita Joshi', e_mail: 'kavita.joshi@school.edu',
    staff_u_id: 'STAFF006', department: 'Social Studies', Mobile: '9876543215',
    first_name: 'Kavita', mid_name: '', last_name: 'Joshi',
    father_name: 'Harish Joshi', husband_name: 'Deepak Joshi', dob: '12/01/1983',
    gender: 'Female', blood_group: 'A-', edu_grad: 'B.A. History', edu_pg: 'M.A. History',
    experience: '14', priority: '6', address: '56, Rajpur Extension, Dehradun',
    doj: '05/07/2010', district: 'Dehradun', city: 'Dehradun',
    aadhar: '789123456789', pan: 'FGHIJ6789K', acc_no: '67890123456789',
    ifsc: 'BOB0006789', image: null, status: 'Active'
  },
  {
    f_id: 'F007', name: 'Mr. Anil Thapa', e_mail: 'anil.thapa@school.edu',
    staff_u_id: 'STAFF007', department: 'Physical Education', Mobile: '9876543216',
    first_name: 'Anil', mid_name: '', last_name: 'Thapa',
    father_name: 'Bal Thapa', husband_name: '', dob: '25/06/1979',
    gender: 'Male', blood_group: 'O-', edu_grad: 'B.P.Ed.', edu_pg: 'M.P.Ed.',
    experience: '17', priority: '7', address: '23, Mussoorie Road, Dehradun',
    doj: '01/01/2007', district: 'Mussoorie', city: 'Mussoorie',
    aadhar: '891234567891', pan: 'GHIJK7891L', acc_no: '78901234567890',
    ifsc: 'UCO0007891', image: null, status: 'Active'
  },
]

// ─── DEPT COLOR MAP ───────────────────────────────────────────────────────────
const DEPT_COLORS = {
  'Mathematics':        { fg: '#1d4ed8', bg: '#dbeafe' },
  'Science':            { fg: '#059669', bg: '#d1fae5' },
  'English':            { fg: '#7c3aed', bg: '#ede9fe' },
  'Hindi':              { fg: '#d97706', bg: '#fef3c7' },
  'Social Studies':     { fg: '#0891b2', bg: '#cffafe' },
  'Computer Science':   { fg: '#dc2626', bg: '#fee2e2' },
  'Physical Education': { fg: '#0369a1', bg: '#e0f2fe' },
  'Arts & Crafts':      { fg: '#7c3aed', bg: '#ede9fe' },
  'Commerce':           { fg: '#16a34a', bg: '#dcfce7' },
  'Biology':            { fg: '#059669', bg: '#d1fae5' },
  'Chemistry':          { fg: '#9333ea', bg: '#f3e8ff' },
  'Physics':            { fg: '#0ea5e9', bg: '#e0f2fe' },
}

const getDeptColor = (dept) =>
  DEPT_COLORS[dept] || { fg: '#475569', bg: '#f1f5f9' }

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

// ─── EDIT MODAL TABS ──────────────────────────────────────────────────────────
const EDIT_TABS = [
  { id: 'personal', label: 'Personal', icon: User },
  { id: 'academic', label: 'Academic', icon: GraduationCap },
  { id: 'contact',  label: 'Contact',  icon: MapPin },
  { id: 'banking',  label: 'Banking',  icon: Banknote },
]

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
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          } ${className}`}
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

function TextInput({ value, onChange, placeholder, error, maxLength, type = 'text', readOnly, className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      readOnly={readOnly}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        read-only:bg-slate-50 dark:read-only:bg-slate-800/50
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        } ${className}`}
    />
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
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────
function Avatar({ name, size = 'md' }) {
  const initials = getInitials(name)
  const colors = [
    'bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700',
    'bg-emerald-100 text-emerald-700', 'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700', 'bg-cyan-100 text-cyan-700',
  ]
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length]
  const sizeClass = size === 'lg'
    ? 'w-12 h-12 text-[15px]'
    : size === 'sm'
    ? 'w-8 h-8 text-[10px]'
    : 'w-10 h-10 text-[12px]'

  return (
    <div className={`rounded-xl flex-shrink-0 flex items-center justify-center font-bold ${sizeClass} ${color}`}>
      {initials}
    </div>
  )
}

// ─── DEPT BADGE ───────────────────────────────────────────────────────────────
function DeptBadge({ dept }) {
  const { fg, bg } = getDeptColor(dept)
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap"
      style={{ color: fg, background: bg }}
    >
      {dept}
    </span>
  )
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ faculty, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('personal')
  const [form, setForm] = useState({ ...faculty })
  const [saving, setSaving] = useState(false)
  const [imagePreview, setImagePreview] = useState(null)
  const fileRef = useRef()

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImagePreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      onUpdate({ ...form, image: imagePreview || form.image })
      setSaving(false)
    }, 800)
  }

  // Tab content panels
  const renderPersonal = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Image upload */}
      <div className="sm:col-span-2 lg:col-span-3">
        <div className="flex items-center gap-4 p-4 rounded-xl border border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-slate-50 dark:bg-white/[0.02]">
          <div className="relative">
            {imagePreview || form.image
              ? <img src={imagePreview || form.image} alt="Faculty" className="w-16 h-16 rounded-xl object-cover border border-slate-200" />
              : <Avatar name={form.name} size="lg" />
            }
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors"
            >
              <Camera className="w-3 h-3" />
            </button>
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Faculty Photo</p>
            <p className="text-[11px] text-slate-400 mt-0.5">JPG, PNG · Max 2MB</p>
            <button type="button" onClick={() => fileRef.current?.click()}
              className="mt-1.5 text-[12px] font-semibold text-blue-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
              <Upload className="w-3 h-3" /> Upload Image
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
        </div>
      </div>

      <Field label="Faculty ID">
        <TextInput value={form.f_id} onChange={set('f_id')} readOnly />
      </Field>
      <Field label="First Name" required>
        <TextInput value={form.first_name} onChange={set('first_name')} placeholder="First name" />
      </Field>
      <Field label="Middle Name">
        <TextInput value={form.mid_name} onChange={set('mid_name')} placeholder="Middle name" />
      </Field>
      <Field label="Last Name" required>
        <TextInput value={form.last_name} onChange={set('last_name')} placeholder="Last name" />
      </Field>
      <Field label="Father's / Husband Name">
        <TextInput value={form.father_name} onChange={set('father_name')} placeholder="Father's name" />
      </Field>
      <Field label="Husband Name">
        <TextInput value={form.husband_name} onChange={set('husband_name')} placeholder="Husband name" />
      </Field>
      <Field label="Date of Birth">
        <TextInput value={form.dob} onChange={set('dob')} placeholder="DD/MM/YYYY" type="date" />
      </Field>
      <Field label="Gender">
        <div className="flex gap-4 pt-1.5">
          {['Male', 'Female'].map(g => (
            <label key={g} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="edit-gender"
                value={g}
                checked={form.gender === g}
                onChange={set('gender')}
                className="w-4 h-4 accent-blue-600"
              />
              <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{g}</span>
            </label>
          ))}
        </div>
      </Field>
      <Field label="Blood Group">
        <NativeSelect value={form.blood_group} onChange={set('blood_group')} placeholder="-- Select --">
          {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
        </NativeSelect>
      </Field>
    </div>
  )

  const renderAcademic = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Field label="Education (Graduate Level)" required className="lg:col-span-1">
        <TextInput value={form.edu_grad} onChange={set('edu_grad')} placeholder="e.g. B.Sc. Mathematics" />
      </Field>
      <Field label="Education (P.G Level)" className="lg:col-span-1">
        <TextInput value={form.edu_pg} onChange={set('edu_pg')} placeholder="e.g. M.Sc. Mathematics" />
      </Field>
      <Field label="Experience (Years)" required>
        <TextInput value={form.experience} onChange={set('experience')} placeholder="0" type="number" />
      </Field>
      <Field label="Department" required>
        <NativeSelect value={form.department} onChange={set('department')} placeholder="-- Select Dept --">
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </NativeSelect>
      </Field>
      <Field label="Priority">
        <NativeSelect value={form.priority} onChange={set('priority')} placeholder="-- Select --">
          {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
        </NativeSelect>
      </Field>
      <Field label="Date of Joining">
        <TextInput value={form.doj} onChange={set('doj')} placeholder="DD/MM/YYYY" type="date" />
      </Field>
    </div>
  )

  const renderContact = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <Field label="Mobile No." required>
        <TextInput value={form.Mobile} onChange={set('Mobile')} placeholder="10-digit mobile" maxLength={10} />
      </Field>
      <Field label="Email ID / User ID" required className="sm:col-span-1">
        <TextInput value={form.e_mail} onChange={set('e_mail')} placeholder="email@school.edu" type="email" />
      </Field>
      <Field label="Aadhar Card No.">
        <TextInput value={form.aadhar} onChange={set('aadhar')} placeholder="12-digit Aadhar" maxLength={12} />
      </Field>
      <Field label="PAN Card No.">
        <TextInput value={form.pan} onChange={set('pan')} placeholder="ABCDE1234F" maxLength={10} />
      </Field>
      <Field label="District">
        <NativeSelect value={form.district} onChange={set('district')} placeholder="-- Select District --">
          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </NativeSelect>
      </Field>
      <Field label="City">
        <TextInput value={form.city} onChange={set('city')} placeholder="City name" />
      </Field>
      <Field label="Present Address" className="sm:col-span-2 lg:col-span-3">
        <textarea
          value={form.address}
          onChange={set('address')}
          rows={3}
          placeholder="Full address..."
          className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
            bg-white text-slate-800 placeholder-slate-300
            border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
            dark:placeholder-slate-600 dark:focus:border-indigo-400"
        />
      </Field>
    </div>
  )

  const renderBanking = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="sm:col-span-2 lg:col-span-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 flex items-start gap-3">
        <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <p className="text-[12px] text-amber-700 dark:text-amber-300 font-medium">
          Banking details are sensitive. Ensure information is verified before saving.
        </p>
      </div>
      <Field label="Account Number" className="sm:col-span-2">
        <TextInput value={form.acc_no} onChange={set('acc_no')} placeholder="Account number" maxLength={16} />
      </Field>
      <Field label="IFSC Code">
        <TextInput value={form.ifsc} onChange={set('ifsc')} placeholder="SBIN0001234" maxLength={11} />
      </Field>
    </div>
  )

  const tabPanels = { personal: renderPersonal, academic: renderAcademic, contact: renderContact, banking: renderBanking }

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="relative w-full sm:max-w-3xl bg-white dark:bg-[#1a1f35] sm:rounded-2xl shadow-2xl
          border-0 sm:border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
          min-h-screen sm:min-h-0 flex flex-col"
        style={{ animation: 'modalIn .22s ease' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.97) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

        {/* Modal Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] flex-shrink-0">
          <Avatar name={form.name} />
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 truncate">
              Edit Faculty — {form.first_name} {form.last_name}
            </h3>
            <p className="text-[12px] text-slate-400">{form.f_id} · {form.department}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-600 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] overflow-x-auto flex-shrink-0 scrollbar-none">
          {EDIT_TABS.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-[13px] font-semibold whitespace-nowrap
                  border-b-2 transition-all flex-shrink-0
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-indigo-400 dark:border-indigo-400 bg-blue-50/50 dark:bg-indigo-500/5'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50/50 dark:hover:bg-white/[0.02]'
                  }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {tabPanels[activeTab]?.()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] flex-shrink-0 bg-slate-50/50 dark:bg-white/[0.01]">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            <Info className="w-3.5 h-3.5" />
            <span>Tab through sections to complete all fields</span>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Update Faculty'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── WITHDRAW MODAL ───────────────────────────────────────────────────────────
function WithdrawModal({ faculty, onClose, onWithdraw }) {
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = () => {
    if (!reason.trim()) { setError('Please enter a reason for withdrawal'); return }
    setError('')
    setLoading(true)
    setTimeout(() => {
      onWithdraw(faculty.f_id, reason)
      setLoading(false)
    }, 700)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="w-full max-w-md bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden"
        style={{ animation: 'modalIn .22s ease' }}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-rose-50 dark:bg-rose-500/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
                <UserMinus className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <h3 className="text-[14px] font-bold text-rose-700 dark:text-rose-400">Faculty Withdrawal</h3>
                <p className="text-[12px] text-rose-500 dark:text-rose-500">{faculty.name}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white/60 dark:hover:bg-white/10 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] font-semibold text-amber-700 dark:text-amber-300">
              Note: Timetable for this faculty will be deleted upon withdrawal.
            </p>
          </div>

          {/* Faculty info preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <Avatar name={faculty.name} size="sm" />
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{faculty.name}</p>
              <p className="text-[11px] text-slate-400">{faculty.f_id} · {faculty.department}</p>
            </div>
          </div>

          {/* Reason textarea */}
          <Field label="Withdrawal Reason" error={error} required>
            <textarea
              value={reason}
              onChange={(e) => { setReason(e.target.value); setError('') }}
              rows={4}
              placeholder="Enter reason for withdrawal (required)..."
              className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
                bg-white text-slate-800 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                dark:focus:border-indigo-400
                ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 disabled:opacity-70 transition-all active:scale-95">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserMinus className="w-4 h-4" />}
            {loading ? 'Processing…' : 'Withdraw Faculty'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit, onWithdraw }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Faculty Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar name={row.name} size="sm" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap truncate max-w-[180px]">{row.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.e_mail}</p>
          </div>
        </div>
      </td>

      {/* Faculty ID */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <Hash className="w-3 h-3" />
          {row.f_id}
        </span>
      </td>

      {/* Department */}
      <td className="px-4 py-3">
        <DeptBadge dept={row.department} />
      </td>

      {/* Mobile */}
      <td className="px-4 py-3">
        <span className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300">
          <Phone className="w-3 h-3 text-slate-400" />
          {row.Mobile}
        </span>
      </td>

      {/* Edit */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            transition-colors border border-blue-100 dark:border-blue-500/20"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </button>
      </td>

      {/* Withdraw */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onWithdraw(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            transition-colors border border-rose-100 dark:border-rose-500/20"
        >
          <UserMinus className="w-3 h-3" /> Withdraw
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onEdit, onWithdraw }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <Avatar name={row.name} />
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] font-mono text-slate-400">#{row.f_id}</span>
            <DeptBadge dept={row.department} />
          </div>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Contact row always visible */}
      <div className="px-4 pb-3 flex items-center gap-4">
        <span className="flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-400">
          <Phone className="w-3 h-3" /> {row.Mobile}
        </span>
        <span className="flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-400 truncate">
          <Mail className="w-3 h-3 flex-shrink-0" /> <span className="truncate">{row.e_mail}</span>
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5">
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">Experience</p>
              <p className="font-bold text-slate-700 dark:text-slate-200">{row.experience} Years</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5">
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">Joined</p>
              <p className="font-bold text-slate-700 dark:text-slate-200">{row.doj}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5">
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">Blood Group</p>
              <p className="font-bold text-slate-700 dark:text-slate-200">{row.blood_group}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5">
              <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">City</p>
              <p className="font-bold text-slate-700 dark:text-slate-200">{row.city}</p>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] p-2.5">
            <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-0.5">Qualification</p>
            <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{row.edu_grad}{row.edu_pg ? ` · ${row.edu_pg}` : ''}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <button type="button" onClick={() => onEdit(row)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-semibold
            text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
        <div className="w-px bg-slate-100 dark:bg-[rgba(99,102,241,0.1)]" />
        <button type="button" onClick={() => onWithdraw(row)}
          className="flex-1 flex items-center justify-center gap-2 py-3 text-[13px] font-semibold
            text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
          <UserMinus className="w-3.5 h-3.5" /> Withdraw
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FacultyInfosheet() {
  const [faculty, setFaculty] = useState(FACULTY_DATA)
  const [search,  setSearch]  = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [editTarget, setEditTarget] = useState(null)
  const [withdrawTarget, setWithdrawTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Search + filter
  const filtered = useMemo(() => {
    return faculty.filter(f => {
      const q = search.toLowerCase()
      const matchesSearch = !q ||
        f.name.toLowerCase().includes(q) ||
        f.f_id.toLowerCase().includes(q) ||
        f.e_mail.toLowerCase().includes(q) ||
        f.Mobile.includes(q)
      const matchesDept = !deptFilter || f.department === deptFilter
      return matchesSearch && matchesDept
    })
  }, [faculty, search, deptFilter])

  const handleUpdate = useCallback((updatedFaculty) => {
    setFaculty(prev => prev.map(f => f.f_id === updatedFaculty.f_id
      ? { ...f, ...updatedFaculty, name: `${updatedFaculty.first_name} ${updatedFaculty.mid_name ? updatedFaculty.mid_name + ' ' : ''}${updatedFaculty.last_name}`.trim() }
      : f
    ))
    setEditTarget(null)
    showToast(`Faculty "${updatedFaculty.first_name} ${updatedFaculty.last_name}" updated successfully!`)
  }, [])

  const handleWithdraw = useCallback((fId, reason) => {
    const f = faculty.find(x => x.f_id === fId)
    setFaculty(prev => prev.filter(x => x.f_id !== fId))
    setWithdrawTarget(null)
    showToast(`${f?.name} has been withdrawn.`, 'success')
  }, [faculty])

  const handleReset = () => { setSearch(''); setDeptFilter('') }

  // Unique depts for filter
  const depts = useMemo(() => [...new Set(faculty.map(f => f.department))].sort(), [faculty])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumb ── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
        <Home className="w-3.5 h-3.5" />
        <ChevronRight className="w-3 h-3" />
        <span>Registration</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-700 dark:text-slate-300 font-semibold">Faculty Infosheet</span>
      </nav>

      {/* ── Page Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Faculty Infosheet
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage faculty details — edit profiles and handle withdrawals.
          </p>
        </div>

        {/* Summary chip */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[13px] font-semibold text-blue-700 dark:text-blue-400">
              {faculty.length} Active Faculty
            </span>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search & Filter</span>
          {(search || deptFilter) && (
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by name, ID, email, mobile…"
                className="w-full pl-9 pr-4 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 placeholder-slate-300 border-slate-200
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600 dark:focus:border-indigo-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Department filter */}
            <div className="sm:w-52">
              <NativeSelect value={deptFilter} onChange={e => setDeptFilter(e.target.value)} placeholder="All Departments">
                {depts.map(d => <option key={d} value={d}>{d}</option>)}
              </NativeSelect>
            </div>
          </div>

          {/* Active filter chips */}
          {(search || deptFilter) && (
            <div className="flex flex-wrap gap-2 mt-3">
              {search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  <Search className="w-3 h-3" /> "{search}"
                  <button onClick={() => setSearch('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {deptFilter && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400">
                  <Building2 className="w-3 h-3" /> {deptFilter}
                  <button onClick={() => setDeptFilter('')}><X className="w-3 h-3" /></button>
                </span>
              )}
              <span className="text-[11px] text-slate-400 self-center">
                {filtered.length} result{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Faculty Detail Card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Faculty Detail</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            {filtered.length} record{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-7 h-7 opacity-40" />
              <p className="text-[13px]">No faculty records match your filter.</p>
              <button onClick={handleReset} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline">Clear filters</button>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Faculty Name', 'Faculty ID', 'Department', 'Mobile', 'Edit', 'Withdraw'].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                      ${i === 0 ? 'text-center w-12' : i >= 5 ? 'text-center' : 'text-left'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow
                    key={row.f_id}
                    row={row}
                    idx={i + 1}
                    onEdit={setEditTarget}
                    onWithdraw={setWithdrawTarget}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-7 h-7 opacity-40" />
              <p className="text-[13px]">No records found.</p>
              <button onClick={handleReset} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline">Clear filters</button>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to see full details
              </p>
              {filtered.map((row, i) => (
                <MobileCard
                  key={row.f_id}
                  row={row}
                  idx={i + 1}
                  onEdit={setEditTarget}
                  onWithdraw={setWithdrawTarget}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{faculty.length}</span> faculty
          </p>
          {(search || deptFilter) && (
            <button onClick={handleReset}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      {editTarget && (
        <EditModal
          faculty={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdate={handleUpdate}
        />
      )}

      {withdrawTarget && (
        <WithdrawModal
          faculty={withdrawTarget}
          onClose={() => setWithdrawTarget(null)}
          onWithdraw={handleWithdraw}
        />
      )}

      {/* ── Toast ── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
