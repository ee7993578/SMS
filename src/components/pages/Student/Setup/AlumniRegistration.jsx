/**
 * AlumniRegistration.jsx
 * Folder: src/pages/Alumni/AlumniRegistration.jsx
 *
 * Converts legacy ASPX "Alumni Registration" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Alumni registration form (name, student ID, batch, DOB, qualification,
 *    current status, email, mobile, gender, address, photo upload)
 *  - Form validation with inline error messages
 *  - Records table with search/filter
 *  - Mobile: stacked form + card list view
 *  - Desktop: ERP-style form + data table
 *  - Toast notifications
 *  - Export Excel placeholder
 *  - Empty state, loading skeleton
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  UserPlus, Users, Search, X, RefreshCw, AlertCircle, Check,
  Loader2, Filter, SlidersHorizontal, ChevronDown, Info,
  FileSpreadsheet, Camera, Mail, Phone, MapPin, Calendar,
  GraduationCap, Briefcase, Hash, User, ChevronRight,
  BookOpen, TrendingUp, Eye, EyeOff, Upload
} from 'lucide-react'

// ─── STATIC DUMMY DATA ────────────────────────────────────────────────────────
const INITIAL_ALUMNI = [
  {
    id: 1, FullName: 'Aarav Sharma', StudentId: 'STU2018001', Batch: '2018-22',
    DOB: '2000-04-15', Qualification: 'B.Tech CSE', CurrentStatus: 'Software Engineer @ TCS',
    EmailAddress: 'aarav.sharma@email.com', PhoneNumber: '9876543210', Gender: 'Male',
    PermanentAddress: 'Sector 12, Noida, UP', Photo: null,
  },
  {
    id: 2, FullName: 'Priya Verma', StudentId: 'STU2018042', Batch: '2018-22',
    DOB: '2000-08-22', Qualification: 'B.Tech ECE', CurrentStatus: 'MBA Student @ IIM-A',
    EmailAddress: 'priya.verma@email.com', PhoneNumber: '9988776655', Gender: 'Female',
    PermanentAddress: 'Civil Lines, Allahabad, UP', Photo: null,
  },
  {
    id: 3, FullName: 'Rohan Gupta', StudentId: 'STU2019011', Batch: '2019-23',
    DOB: '2001-01-10', Qualification: 'B.Tech ME', CurrentStatus: 'Design Engineer @ ISRO',
    EmailAddress: 'rohan.gupta@email.com', PhoneNumber: '9123456789', Gender: 'Male',
    PermanentAddress: 'Aliganj, Lucknow, UP', Photo: null,
  },
  {
    id: 4, FullName: 'Sneha Mishra', StudentId: 'STU2017088', Batch: '2017-21',
    DOB: '1999-11-30', Qualification: 'B.Sc Physics', CurrentStatus: 'Research Scholar @ IIT-D',
    EmailAddress: 'sneha.mishra@email.com', PhoneNumber: '8765432109', Gender: 'Female',
    PermanentAddress: 'Vasundhara, Ghaziabad, UP', Photo: null,
  },
  {
    id: 5, FullName: 'Karan Singh', StudentId: 'STU2020005', Batch: '2020-24',
    DOB: '2002-06-18', Qualification: 'B.Com Hons', CurrentStatus: 'CA Articleship',
    EmailAddress: 'karan.singh@email.com', PhoneNumber: '7654321098', Gender: 'Male',
    PermanentAddress: 'Indira Nagar, Dehradun, UK', Photo: null,
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const GENDER_COLORS = {
  Male:   { fg: '#1d4ed8', bg: '#dbeafe' },
  Female: { fg: '#be185d', bg: '#fce7f3' },
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

const AVATAR_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
]
const avatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
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

function Field({ label, error, required, icon: Icon, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Input({ error, ...props }) {
  return (
    <input
      {...props}
      className={`w-full px-3 py-2.5 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
        ${props.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  )
}

function Textarea({ error, ...props }) {
  return (
    <textarea
      {...props}
      rows={3}
      className={`w-full px-3 py-2.5 text-[13px] rounded-lg border outline-none transition-all resize-none
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
    />
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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    pink:    'bg-pink-50 text-pink-600 dark:bg-pink-500/10 dark:text-pink-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── PHOTO UPLOAD COMPONENT ───────────────────────────────────────────────────
function PhotoUpload({ value, onChange, error }) {
  const inputRef = useRef()
  const [preview, setPreview] = useState(null)

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    onChange(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target.result)
    reader.readAsDataURL(file)
  }

  const handleClear = () => {
    onChange(null)
    setPreview(null)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
      {preview ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/10">
          <img src={preview} alt="Preview" className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-300 truncate">{value?.name}</p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400">{value ? (value.size / 1024).toFixed(1) + ' KB' : ''}</p>
          </div>
          <button type="button" onClick={handleClear} className="p-1.5 rounded-lg bg-rose-100 text-rose-600 hover:bg-rose-200 flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={`w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed transition-all
            hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/5
            ${error ? 'border-rose-300 bg-rose-50 dark:bg-rose-500/5' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-slate-50 dark:bg-[#1e2238]'}`}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${error ? 'bg-rose-100 text-rose-500' : 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400'}`}>
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">Click to upload photo</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">PNG, JPG up to 5MB</p>
          </div>
        </button>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = avatarColor(row.FullName)
  const gColor = GENDER_COLORS[row.Gender] || GENDER_COLORS.Male

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>
      {/* Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={{ background: bg, color: fg }}>
            {getInitials(row.FullName)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.FullName}</span>
        </div>
      </td>
      {/* Student ID */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-300">
          <Hash className="w-2.5 h-2.5" />{row.StudentId}
        </span>
      </td>
      {/* Batch */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 text-[12px] font-semibold">
          {row.Batch}
        </span>
      </td>
      {/* Mobile */}
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">{row.PhoneNumber}</td>
      {/* Email */}
      <td className="px-3 py-3 text-[12px] text-blue-600 dark:text-blue-400 max-w-[160px] truncate">{row.EmailAddress || '—'}</td>
      {/* Qualification */}
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.Qualification}</td>
      {/* Current Status */}
      <td className="px-3 py-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-[11px] font-semibold max-w-[160px] truncate block">
          {row.CurrentStatus}
        </span>
      </td>
      {/* Gender */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold"
          style={{ background: gColor.bg, color: gColor.fg }}>
          {row.Gender}
        </span>
      </td>
      {/* DOB */}
      <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">{formatDate(row.DOB)}</td>
    </tr>
  )
}

// ─── MOBILE ALUMNI CARD ───────────────────────────────────────────────────────
function MobileAlumniCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = avatarColor(row.FullName)
  const gColor = GENDER_COLORS[row.Gender] || GENDER_COLORS.Male

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0"
          style={{ background: bg, color: fg }}>
          {getInitials(row.FullName)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.FullName}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            <span className="font-mono">{row.StudentId}</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{row.Batch}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: gColor.bg, color: gColor.fg }}>
            {row.Gender}
          </span>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Status chip */}
      <div className="px-4 pb-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold max-w-full truncate">
          <Briefcase className="w-3 h-3 flex-shrink-0" />
          {row.CurrentStatus}
        </span>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <DetailChip icon={GraduationCap} label="Qualification" value={row.Qualification} color="violet" />
            <DetailChip icon={Calendar} label="Date of Birth" value={formatDate(row.DOB)} color="amber" />
          </div>
          {row.EmailAddress && (
            <DetailChip icon={Mail} label="Email" value={row.EmailAddress} color="blue" full />
          )}
          <DetailChip icon={Phone} label="Mobile" value={row.PhoneNumber} color="emerald" />
          {row.PermanentAddress && (
            <DetailChip icon={MapPin} label="Address" value={row.PermanentAddress} color="slate" full />
          )}
        </div>
      )}
    </div>
  )
}

function DetailChip({ icon: Icon, label, value, color, full }) {
  const colors = {
    blue:   'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    emerald:'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
    amber:  'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    slate:  'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  }
  return (
    <div className={`rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-2.5 ${full ? 'col-span-2' : ''}`}>
      <div className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide mb-1 ${colors[color]}`}>
        <Icon className="w-3 h-3" />{label}
      </div>
      <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 break-all">{value || '—'}</p>
    </div>
  )
}

// ─── FORM SECTION ─────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  FullName: '', StudentId: '', Batch: '', DOB: '',
  Qualification: '', CurrentStatus: '', EmailAddress: '',
  PhoneNumber: '', Gender: '', PermanentAddress: '', Photo: null,
}

function RegistrationForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ ...EMPTY_FORM })
  const [errors, setErrors] = useState({})

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target ? e.target.value : e }))
  const setFile = (file) => setForm(p => ({ ...p, Photo: file }))

  const validate = () => {
    const err = {}
    if (!form.FullName.trim())        err.FullName       = 'Name is required'
    if (!form.StudentId.trim())       err.StudentId      = 'Student ID is required'
    if (!form.Batch.trim())           err.Batch          = 'Batch is required'
    if (!form.DOB)                    err.DOB            = 'Date of birth is required'
    if (!form.Qualification.trim())   err.Qualification  = 'Qualification is required'
    if (!form.CurrentStatus.trim())   err.CurrentStatus  = 'Current status is required'
    if (!form.PhoneNumber.trim())     err.PhoneNumber    = 'Mobile number is required'
    else if (!/^\d{10}$/.test(form.PhoneNumber)) err.PhoneNumber = 'Enter valid 10-digit mobile number'
    if (!form.Gender)                 err.Gender         = 'Please select gender'
    if (!form.Photo)                  err.Photo          = 'Alumni photo is required'
    if (form.EmailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.EmailAddress))
                                      err.EmailAddress   = 'Enter valid email address'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) return
    onSubmit({ ...form, id: Date.now() })
    setForm({ ...EMPTY_FORM })
    setErrors({})
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <UserPlus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Alumni Registration Form</span>
          <span className="text-[11px] text-slate-400">* Required</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Row 1: Name, Student ID, Batch */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Name of the Alumni" required icon={User} error={errors.FullName}>
              <Input
                type="text"
                placeholder="Enter full name"
                value={form.FullName}
                onChange={set('FullName')}
                error={errors.FullName}
              />
            </Field>
            <Field label="Student ID" required icon={Hash} error={errors.StudentId}>
              <Input
                type="text"
                placeholder="e.g. STU2020001"
                value={form.StudentId}
                onChange={set('StudentId')}
                error={errors.StudentId}
              />
            </Field>
            <Field label="Batch" required icon={BookOpen} error={errors.Batch} hint="e.g. 2018-22">
              <Input
                type="text"
                placeholder="e.g. 2018-22"
                value={form.Batch}
                onChange={set('Batch')}
                error={errors.Batch}
              />
            </Field>
          </div>

          {/* Row 2: DOB, Qualification, Current Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Date of Birth" required icon={Calendar} error={errors.DOB}>
              <Input
                type="date"
                value={form.DOB}
                onChange={set('DOB')}
                error={errors.DOB}
              />
            </Field>
            <Field label="Qualification" required icon={GraduationCap} error={errors.Qualification}>
              <Input
                type="text"
                placeholder="e.g. B.Tech CSE"
                value={form.Qualification}
                onChange={set('Qualification')}
                error={errors.Qualification}
              />
            </Field>
            <Field label="Current Status" required icon={Briefcase} error={errors.CurrentStatus}>
              <Input
                type="text"
                placeholder="e.g. Software Engineer @ TCS"
                value={form.CurrentStatus}
                onChange={set('CurrentStatus')}
                error={errors.CurrentStatus}
              />
            </Field>
          </div>

          {/* Row 3: Email, Mobile, Gender */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Email" icon={Mail} error={errors.EmailAddress}>
              <Input
                type="email"
                placeholder="email@example.com"
                value={form.EmailAddress}
                onChange={set('EmailAddress')}
                error={errors.EmailAddress}
              />
            </Field>
            <Field label="Mobile No" required icon={Phone} error={errors.PhoneNumber} hint="10-digit mobile number">
              <Input
                type="tel"
                maxLength={10}
                placeholder="9876543210"
                value={form.PhoneNumber}
                onChange={set('PhoneNumber')}
                error={errors.PhoneNumber}
              />
            </Field>
            <Field label="Gender" required icon={User} error={errors.Gender}>
              <NativeSelect
                value={form.Gender}
                onChange={set('Gender')}
                placeholder="-- Select Gender --"
                error={errors.Gender}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </NativeSelect>
            </Field>
          </div>

          {/* Row 4: Address full width */}
          <Field label="Permanent Address" icon={MapPin} error={errors.PermanentAddress}>
            <Textarea
              placeholder="Enter permanent address..."
              value={form.PermanentAddress}
              onChange={set('PermanentAddress')}
              error={errors.PermanentAddress}
            />
          </Field>

          {/* Row 5: Photo upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Alumni Photo" required icon={Camera} error={errors.Photo}>
              <PhotoUpload value={form.Photo} onChange={setFile} error={errors.Photo} />
            </Field>
          </div>

          {/* Submit */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <UserPlus className="w-4 h-4" />}
              Submit Registration
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────
export default function AlumniRegistration() {
  const [alumni,     setAlumni]     = useState(INITIAL_ALUMNI)
  const [submitting, setSubmitting] = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [search,     setSearch]     = useState('')
  const [toast,      setToast]      = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Submit new alumni ─────────────────────────────────────────────────────
  const handleSubmit = useCallback((data) => {
    setSubmitting(true)
    setTimeout(() => {
      setAlumni(prev => [data, ...prev])
      setSubmitting(false)
      showToast(`Alumni "${data.FullName}" registered successfully!`)
    }, 700)
  }, [])

  // ── Excel Export placeholder ──────────────────────────────────────────────
  const handleExcel = () => {
    if (alumni.length === 0) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filtered list ──────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return alumni
    const q = search.toLowerCase()
    return alumni.filter(a =>
      a.FullName.toLowerCase().includes(q) ||
      a.StudentId.toLowerCase().includes(q) ||
      a.Batch.toLowerCase().includes(q) ||
      a.CurrentStatus.toLowerCase().includes(q) ||
      a.Qualification.toLowerCase().includes(q)
    )
  }, [alumni, search])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   alumni.length,
    male:    alumni.filter(a => a.Gender === 'Male').length,
    female:  alumni.filter(a => a.Gender === 'Female').length,
    batches: [...new Set(alumni.map(a => a.Batch))].length,
  }), [alumni])

  return (
    <div className="space-y-5 pb-10">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Alumni Registration
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Register and manage alumni records for your institution.
          </p>
        </div>
        {alumni.length > 0 && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={Users}       label="Total Alumni"    value={stats.total}   color="blue"    />
        <SummaryCard icon={User}        label="Male"            value={stats.male}    color="violet"  />
        <SummaryCard icon={UserPlus}    label="Female"          value={stats.female}  color="pink"    />
        <SummaryCard icon={BookOpen}    label="Batches"         value={stats.batches} color="amber"   />
      </div>

      {/* Registration Form */}
      <RegistrationForm onSubmit={handleSubmit} loading={submitting} />

      {/* ── Alumni Records Table ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
            <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Alumni Records</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search + Export (mobile) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search alumni…"
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
            {/* Mobile export */}
            <button
              type="button"
              onClick={handleExcel}
              disabled={exporting}
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70 flex-shrink-0"
            >
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Showing all registered alumni. Use the search to filter by name, ID, batch, or status.
          </p>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptySearchState onClear={() => setSearch('')} search={search} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Name', 'Student ID', 'Batch', 'Mobile', 'Email', 'Qualification', 'Current Status', 'Gender', 'DOB'].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.id} row={row} idx={i + 1} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* MOBILE CARDS */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptySearchState onClear={() => setSearch('')} search={search} />
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to see full alumni details.
              </p>
              {filtered.map(row => (
                <MobileAlumniCard key={row.id} row={row} />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{alumni.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATES ─────────────────────────────────────────────────────────────
function EmptySearchState({ onClear, search }) {
  if (search) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Search className="w-6 h-6 opacity-40" />
        </div>
        <div className="text-center">
          <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No results for "{search}"</p>
          <p className="text-[12px] mt-1">Try a different name, ID, or batch.</p>
        </div>
        <button onClick={onClear}
          className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
          <X className="w-3 h-3" /> Clear search
        </button>
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Users className="w-6 h-6 opacity-40" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No Alumni Records Found</p>
        <p className="text-[12px] mt-1">Register your first alumni using the form above.</p>
      </div>
    </div>
  )
}
