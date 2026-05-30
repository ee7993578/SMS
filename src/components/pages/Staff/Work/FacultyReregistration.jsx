/**
 * FacultyReregistration.jsx
 * Converts legacy ASPX "Faculty Re-Registration" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Faculty list with GridView (checkbox, S.No, Name, Email, Mobile, DOB, Reason, Action)
 *  - "Details" button opens modal popup with full faculty edit form
 *  - "Re Register" bulk action button
 *  - Tabbed mobile layout for the modal form (Personal / Professional / Contact / Documents)
 *  - Toast notifications, loading states, empty states
 *  - Fully responsive — no horizontal scroll on mobile
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Users, Search, RefreshCw, CheckSquare, Square, Eye,
  X, Check, AlertCircle, Loader2, ChevronDown, ChevronRight,
  User, Mail, Phone, Calendar, FileText, Building2,
  Briefcase, MapPin, CreditCard, Shield, BookOpen,
  UserCheck, SlidersHorizontal, Info, UserX
} from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const DEPARTMENTS  = ['Computer Science', 'Mathematics', 'Physics', 'Chemistry', 'English', 'History', 'Biology', 'Commerce']
const DESIGNATIONS = ['Professor', 'Associate Professor', 'Assistant Professor', 'Lecturer', 'Lab Instructor', 'HOD']
const DISTRICTS    = ['Dehradun', 'Haridwar', 'Pauri', 'Tehri', 'Uttarkashi', 'Nainital', 'Almora', 'Pithoragarh']

const DUMMY_FACULTY = [
  { f_id: 1, staff_u_id: 'STF001', name: 'Dr. Ramesh Kumar Sharma', e_mail: 'ramesh.sharma@school.edu', Mobile: '9876543210', dob: '15/04/1975', remark: 'Contract expired', firstName: 'Ramesh', midName: 'Kumar', lastName: 'Sharma', gender: 'Male', bloodGroup: 'B+', eduGrad: 'B.Sc (Hons)', eduPG: 'M.Sc Physics', experience: '18', department: 'Physics', designation: 'Professor', doj: '01/07/2006', district: 'Dehradun', city: 'Dehradun', aadhar: '1234 5678 9012', panCard: 'ABCDE1234F', accNo: '1234567890123456', ifsc: 'SBIN0001234' },
  { f_id: 2, staff_u_id: 'STF002', name: 'Mrs. Sunita Devi Negi', e_mail: 'sunita.negi@school.edu', Mobile: '9812345678', dob: '22/09/1980', remark: 'Re-joining after sabbatical', firstName: 'Sunita', midName: 'Devi', lastName: 'Negi', gender: 'Female', bloodGroup: 'O+', eduGrad: 'B.A (Hons)', eduPG: 'M.A English', experience: '12', department: 'English', designation: 'Associate Professor', doj: '15/08/2012', district: 'Haridwar', city: 'Rishikesh', aadhar: '2345 6789 0123', panCard: 'BCDEF2345G', accNo: '2345678901234567', ifsc: 'HDFC0002345' },
  { f_id: 3, staff_u_id: 'STF003', name: 'Mr. Vijay Singh Rawat', e_mail: 'vijay.rawat@school.edu', Mobile: '9801234567', dob: '05/12/1978', remark: 'Annual re-registration', firstName: 'Vijay', midName: 'Singh', lastName: 'Rawat', gender: 'Male', bloodGroup: 'A+', eduGrad: 'B.Com', eduPG: 'M.Com', experience: '15', department: 'Commerce', designation: 'Assistant Professor', doj: '01/01/2009', district: 'Pauri', city: 'Kotdwar', aadhar: '3456 7890 1234', panCard: 'CDEFG3456H', accNo: '3456789012345678', ifsc: 'ICIC0003456' },
  { f_id: 4, staff_u_id: 'STF004', name: 'Ms. Priya Kapoor Joshi', e_mail: 'priya.joshi@school.edu', Mobile: '9823456789', dob: '18/03/1985', remark: 'Document update required', firstName: 'Priya', midName: 'Kapoor', lastName: 'Joshi', gender: 'Female', bloodGroup: 'AB+', eduGrad: 'B.Sc Math', eduPG: 'M.Sc Mathematics', experience: '9', department: 'Mathematics', designation: 'Lecturer', doj: '20/06/2015', district: 'Nainital', city: 'Haldwani', aadhar: '4567 8901 2345', panCard: 'DEFGH4567I', accNo: '4567890123456789', ifsc: 'PUNB0004567' },
  { f_id: 5, staff_u_id: 'STF005', name: 'Dr. Anil Prasad Bisht', e_mail: 'anil.bisht@school.edu', Mobile: '9834567890', dob: '29/07/1970', remark: 'Promotion re-registration', firstName: 'Anil', midName: 'Prasad', lastName: 'Bisht', gender: 'Male', bloodGroup: 'O-', eduGrad: 'B.Sc Chemistry', eduPG: 'Ph.D Chemistry', experience: '22', department: 'Chemistry', designation: 'HOD', doj: '10/03/2002', district: 'Almora', city: 'Almora', aadhar: '5678 9012 3456', panCard: 'EFGHI5678J', accNo: '5678901234567890', ifsc: 'BKID0005678' },
  { f_id: 6, staff_u_id: 'STF006', name: 'Mrs. Meena Lal Thakur', e_mail: 'meena.thakur@school.edu', Mobile: '9845678901', dob: '11/11/1982', remark: 'Transfer re-registration', firstName: 'Meena', midName: 'Lal', lastName: 'Thakur', gender: 'Female', bloodGroup: 'B-', eduGrad: 'B.Sc Biology', eduPG: 'M.Sc Biology', experience: '11', department: 'Biology', designation: 'Assistant Professor', doj: '05/09/2013', district: 'Tehri', city: 'New Tehri', aadhar: '6789 0123 4567', panCard: 'FGHIJ6789K', accNo: '6789012345678901', ifsc: 'UBIN0006789' },
]

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3
      rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw] animate-slideUp
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  )
}

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange} disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}>
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function FormInput({ label, value, onChange, type = 'text', maxLength, placeholder, required, filterMode, pattern, disabled }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
          outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          placeholder:text-slate-300 dark:placeholder:text-slate-600
          disabled:opacity-50"
      />
    </div>
  )
}

// ─── MODAL TABS CONFIG ────────────────────────────────────────────────────────
const MODAL_TABS = [
  { id: 'personal',      label: 'Personal',     icon: User       },
  { id: 'professional',  label: 'Professional', icon: Briefcase  },
  { id: 'contact',       label: 'Contact',      icon: MapPin     },
  { id: 'documents',     label: 'Documents',    icon: CreditCard },
]

// ─── FACULTY DETAIL MODAL ─────────────────────────────────────────────────────
function FacultyModal({ faculty, onClose, onUpdate }) {
  const [activeTab, setActiveTab] = useState('personal')
  const [form, setForm] = useState({
    firstName:   faculty?.firstName   || '',
    midName:     faculty?.midName     || '',
    lastName:    faculty?.lastName    || '',
    dob:         faculty?.dob         || '',
    gender:      faculty?.gender      || 'Male',
    bloodGroup:  faculty?.bloodGroup  || '',
    eduGrad:     faculty?.eduGrad     || '',
    eduPG:       faculty?.eduPG       || '',
    experience:  faculty?.experience  || '',
    department:  faculty?.department  || '',
    designation: faculty?.designation || '',
    doj:         faculty?.doj         || '',
    district:    faculty?.district    || '',
    city:        faculty?.city        || '',
    mobile:      faculty?.Mobile      || '',
    email:       faculty?.e_mail      || '',
    aadhar:      faculty?.aadhar      || '',
    panCard:     faculty?.panCard     || '',
    accNo:       faculty?.accNo       || '',
    ifsc:        faculty?.ifsc        || '',
  })
  const [saving, setSaving] = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }))

  const handleUpdate = () => {
    setSaving(true)
    setTimeout(() => { setSaving(false); onUpdate(form); }, 800)
  }

  const tabContent = {
    personal: (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormInput label="First Name" value={form.firstName} onChange={set('firstName')} required />
        <FormInput label="Middle Name" value={form.midName} onChange={set('midName')} />
        <FormInput label="Last Name" value={form.lastName} onChange={set('lastName')} required />
        <FormInput label="Date of Birth" value={form.dob} onChange={set('dob')} placeholder="DD/MM/YYYY" required />
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            Gender <span className="text-rose-500">*</span>
          </label>
          <div className="flex gap-4 mt-1">
            {['Male', 'Female'].map(g => (
              <label key={g} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value={g} checked={form.gender === g}
                  onChange={set('gender')}
                  className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-400" />
                <span className="text-[13px] text-slate-700 dark:text-slate-200">{g}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Blood Group</label>
          <NativeSelect value={form.bloodGroup} onChange={set('bloodGroup')} placeholder="-- Select --">
            {BLOOD_GROUPS.map(b => <option key={b} value={b}>{b}</option>)}
          </NativeSelect>
        </div>
      </div>
    ),
    professional: (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <FormInput label="Education — Graduate Level" value={form.eduGrad} onChange={set('eduGrad')} placeholder="e.g. B.Sc Physics" />
        <FormInput label="Education — PG Level" value={form.eduPG} onChange={set('eduPG')} placeholder="e.g. M.Sc Physics" />
        <FormInput label="Experience (Years)" value={form.experience} onChange={set('experience')} maxLength={2} placeholder="e.g. 10" />
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Department</label>
          <NativeSelect value={form.department} onChange={set('department')} placeholder="-- Select Department --">
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Designation</label>
          <NativeSelect value={form.designation} onChange={set('designation')} placeholder="-- Select Designation --">
            {DESIGNATIONS.map(d => <option key={d} value={d}>{d}</option>)}
          </NativeSelect>
        </div>
        <FormInput label="Date of Joining" value={form.doj} onChange={set('doj')} placeholder="DD/MM/YYYY" />
      </div>
    ),
    contact: (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">District</label>
          <NativeSelect value={form.district} onChange={set('district')} placeholder="-- Select District --">
            {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
          </NativeSelect>
        </div>
        <FormInput label="City" value={form.city} onChange={set('city')} placeholder="City name" />
        <FormInput label="Mobile No." value={form.mobile} onChange={set('mobile')} maxLength={10} placeholder="10-digit number" required />
        <div className="sm:col-span-2 lg:col-span-3">
          <FormInput label="E-mail Id / User Id" value={form.email} onChange={set('email')} type="email" placeholder="example@email.com" required />
        </div>
      </div>
    ),
    documents: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="Aadhar Card No." value={form.aadhar} onChange={set('aadhar')} maxLength={14} placeholder="XXXX XXXX XXXX" />
        <FormInput label="PAN Card No." value={form.panCard} onChange={set('panCard')} maxLength={11} placeholder="ABCDE1234F" />
        <FormInput label="Bank Account No." value={form.accNo} onChange={set('accNo')} maxLength={16} placeholder="Account number" />
        <FormInput label="IFSC Code" value={form.ifsc} onChange={set('ifsc')} maxLength={15} placeholder="e.g. SBIN0001234" />
      </div>
    ),
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}>
      <div className="w-full sm:max-w-3xl bg-white dark:bg-[#1a1f35] rounded-t-2xl sm:rounded-2xl
        border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl
        flex flex-col max-h-[92vh] sm:max-h-[85vh]"
        style={{ animation: 'modalUp .25s ease' }}>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[rgba(99,102,241,0.07)] dark:to-transparent
          rounded-t-2xl flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 truncate">Faculty Details</h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{faculty?.name}</p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800
              text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] flex-shrink-0 overflow-x-auto">
          {MODAL_TABS.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-[12px] font-semibold whitespace-nowrap transition-colors border-b-2
                  ${active
                    ? 'border-blue-600 text-blue-700 dark:text-blue-400 dark:border-indigo-400 bg-blue-50/50 dark:bg-indigo-500/5'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                  }`}>
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {tabContent[activeTab]}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-slate-100
          dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] flex-shrink-0 rounded-b-2xl">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleUpdate} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Update
          </button>
        </div>
      </div>

      <style>{`
        @keyframes modalUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        .animate-slideUp{animation:slideUp .25s ease}
      `}</style>
    </div>
  )
}

// ─── MOBILE FACULTY CARD ──────────────────────────────────────────────────────
function MobileFacultyCard({ faculty, checked, onCheck, onDetails }) {
  const [expanded, setExpanded] = useState(false)
  const initials = faculty.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const COLORS = [
    { bg: 'bg-blue-100 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-400' },
    { bg: 'bg-violet-100 dark:bg-violet-500/20', text: 'text-violet-700 dark:text-violet-400' },
    { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400' },
    { bg: 'bg-amber-100 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-400' },
    { bg: 'bg-rose-100 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-400' },
    { bg: 'bg-cyan-100 dark:bg-cyan-500/20', text: 'text-cyan-700 dark:text-cyan-400' },
  ]
  const color = COLORS[faculty.f_id % COLORS.length]

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm transition-all
      ${checked ? 'border-blue-300 dark:border-indigo-400/60 ring-2 ring-blue-100 dark:ring-indigo-500/20' : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'}`}>

      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button onClick={() => onCheck(faculty.f_id)} className="flex-shrink-0 p-0.5">
          {checked
            ? <div className="w-5 h-5 rounded bg-blue-600 dark:bg-indigo-600 flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            : <div className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600" />
          }
        </button>

        {/* Avatar */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${color.bg} ${color.text}`}>
          {initials}
        </div>

        <div className="flex-1 min-w-0" onClick={() => setExpanded(p => !p)}>
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{faculty.name}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{faculty.e_mail}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button onClick={() => onDetails(faculty)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-blue-50 text-blue-700 dark:bg-indigo-500/10 dark:text-indigo-400
              hover:bg-blue-100 dark:hover:bg-indigo-500/20 transition-colors border border-blue-100 dark:border-indigo-500/20">
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Details</span>
          </button>
          <button onClick={() => setExpanded(p => !p)}
            className={`w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 bg-slate-50/50 dark:bg-white/[0.02] space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-[12px] text-slate-600 dark:text-slate-300">{faculty.Mobile}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-[12px] text-slate-600 dark:text-slate-300">{faculty.dob}</span>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span className="text-[12px] text-slate-600 dark:text-slate-300">
              <span className="font-semibold text-slate-500">Reason: </span>{faculty.remark}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────
export default function FacultyReregistration() {
  const [facultyList, setFacultyList]   = useState(DUMMY_FACULTY)
  const [selected, setSelected]         = useState([])
  const [modalFaculty, setModalFaculty] = useState(null)
  const [search, setSearch]             = useState('')
  const [loading, setLoading]           = useState(false)
  const [reregLoading, setReregLoading] = useState(false)
  const [toast, setToast]               = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return facultyList
    const q = search.toLowerCase()
    return facultyList.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.e_mail.toLowerCase().includes(q) ||
      f.Mobile.includes(q) ||
      f.remark.toLowerCase().includes(q)
    )
  }, [facultyList, search])

  // ── Select All ────────────────────────────────────────────────────────────
  const allSelected   = filtered.length > 0 && filtered.every(f => selected.includes(f.f_id))
  const someSelected  = filtered.some(f => selected.includes(f.f_id))

  const toggleAll = useCallback(() => {
    if (allSelected) {
      setSelected(p => p.filter(id => !filtered.map(f => f.f_id).includes(id)))
    } else {
      setSelected(p => [...new Set([...p, ...filtered.map(f => f.f_id)])])
    }
  }, [allSelected, filtered])

  const toggleOne = useCallback((id) => {
    setSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  }, [])

  // ── Re Register ──────────────────────────────────────────────────────────
  const handleReregister = useCallback(() => {
    if (selected.length === 0) { showToast('Please select at least one faculty.', 'error'); return }
    setReregLoading(true)
    setTimeout(() => {
      setFacultyList(p => p.filter(f => !selected.includes(f.f_id)))
      setSelected([])
      setReregLoading(false)
      showToast(`${selected.length} faculty re-registered successfully!`)
    }, 1000)
  }, [selected])

  // ── Update faculty ────────────────────────────────────────────────────────
  const handleUpdate = useCallback((updatedForm) => {
    setFacultyList(p => p.map(f => f.f_id === modalFaculty.f_id
      ? { ...f, firstName: updatedForm.firstName, midName: updatedForm.midName, lastName: updatedForm.lastName,
          name: [updatedForm.firstName, updatedForm.midName, updatedForm.lastName].filter(Boolean).join(' '),
          Mobile: updatedForm.mobile, e_mail: updatedForm.email, dob: updatedForm.dob,
          gender: updatedForm.gender, bloodGroup: updatedForm.bloodGroup, ...updatedForm }
      : f))
    setModalFaculty(null)
    showToast('Faculty details updated successfully!')
  }, [modalFaculty])

  const handleReset = () => { setSearch(''); setSelected([]) }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    facultyList.length,
    selected: selected.length,
    filtered: filtered.length,
  }), [facultyList, selected, filtered])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 mb-2">
            <span className="hover:text-blue-600 cursor-pointer">Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Faculty Re-Registration</span>
          </nav>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Faculty Re-Registration
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Review and re-register withdrawn faculty members.
          </p>
        </div>

        {/* Re-Register button — desktop */}
        {selected.length > 0 && (
          <button onClick={handleReregister} disabled={reregLoading}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0 self-start">
            {reregLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            Re-Register ({selected.length})
          </button>
        )}
      </div>

      {/* ── Summary Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Users,     label: 'Total Faculty',  value: stats.total,    color: 'blue'   },
          { icon: UserX,     label: 'Shown',           value: stats.filtered, color: 'amber'  },
          { icon: UserCheck, label: 'Selected',        value: stats.selected, color: 'emerald'},
        ].map(({ icon: Icon, label, value, color }) => {
          const cls = {
            blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
            amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
            emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
          }
          return (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
              bg-white dark:bg-[#1a1f35] px-3 py-3 shadow-sm">
              <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cls[color]}`}>
                <Icon className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <p className="text-[18px] sm:text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* ── Search & Actions bar ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Faculty</span>
        </div>
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, mobile, reason…"
              className="w-full pl-9 pr-8 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                placeholder:text-slate-300 dark:placeholder:text-slate-600" />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {/* Reset */}
          <button onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors flex-shrink-0">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ── Faculty Table + Cards ─────────────────────────────────────────── */}
      {filtered.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Faculty List</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
            {someSelected && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                {selected.length} selected
              </span>
            )}
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {/* Select All */}
                  <th className="px-4 py-2.5 w-10">
                    <button onClick={toggleAll} className="flex items-center justify-center w-full">
                      {allSelected
                        ? <div className="w-4.5 h-4.5 rounded bg-blue-600 dark:bg-indigo-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                        : <div className={`w-4.5 h-4.5 rounded border-2 ${someSelected ? 'border-blue-400 dark:border-indigo-400 bg-blue-100 dark:bg-indigo-500/20' : 'border-slate-300 dark:border-slate-600'}`} />
                      }
                    </button>
                  </th>
                  {['S No.', 'Name', 'Email Id', 'Mobile', 'DOB', 'Reason', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((faculty, idx) => {
                  const isChecked = selected.includes(faculty.f_id)
                  const initials = faculty.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
                  return (
                    <tr key={faculty.f_id}
                      className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
                        ${isChecked ? 'bg-blue-50/40 dark:bg-indigo-500/[0.04]' : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => toggleOne(faculty.f_id)}>
                          {isChecked
                            ? <div className="w-4.5 h-4.5 rounded bg-blue-600 dark:bg-indigo-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                            : <div className="w-4.5 h-4.5 rounded border-2 border-slate-300 dark:border-slate-600" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 w-12 tabular-nums">{idx + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{faculty.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{faculty.staff_u_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{faculty.e_mail}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">{faculty.Mobile}</td>
                      <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">{faculty.dob}</td>
                      <td className="px-4 py-3 max-w-[180px]">
                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] font-medium
                          bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-100 dark:border-amber-500/20 truncate max-w-full">
                          <FileText className="w-3 h-3 flex-shrink-0" />
                          <span className="truncate">{faculty.remark}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => setModalFaculty(faculty)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                            bg-blue-50 text-blue-700 dark:bg-indigo-500/10 dark:text-indigo-400
                            hover:bg-blue-100 dark:hover:bg-indigo-500/20 transition-colors border border-blue-100 dark:border-indigo-500/20
                            whitespace-nowrap">
                          <Eye className="w-3.5 h-3.5" />
                          Details
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="md:hidden p-4 space-y-3">
            {/* Select all mobile */}
            <div className="flex items-center justify-between py-2 px-1">
              <button onClick={toggleAll} className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                {allSelected
                  ? <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>
                  : <div className={`w-5 h-5 rounded border-2 ${someSelected ? 'border-blue-400 bg-blue-100 dark:bg-indigo-500/20 dark:border-indigo-400' : 'border-slate-300 dark:border-slate-600'}`} />
                }
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
              {someSelected && (
                <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {selected.length} selected
                </span>
              )}
            </div>

            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              Tap a card to expand details. Tap Details to view/edit.
            </p>

            {filtered.map(faculty => (
              <MobileFacultyCard
                key={faculty.f_id}
                faculty={faculty}
                checked={selected.includes(faculty.f_id)}
                onCheck={toggleOne}
                onDetails={(f) => setModalFaculty(f)}
              />
            ))}
          </div>

          {/* Footer with Re-Register button */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3
            px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
            bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{facultyList.length}</span> records
              {selected.length > 0 && (
                <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                  · {selected.length} selected
                </span>
              )}
            </p>
            <button onClick={handleReregister} disabled={reregLoading || selected.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto justify-center">
              {reregLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              Re Register{selected.length > 0 ? ` (${selected.length})` : ''}
            </button>
          </div>
        </div>
      ) : (
        // ── Empty State ──
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600
          rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Users className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No faculty records found</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              {search ? 'Try a different search term.' : 'All faculty have been processed or no records exist.'}
            </p>
          </div>
          {search && (
            <button onClick={() => setSearch('')}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-blue-50 text-blue-700 dark:bg-indigo-500/10 dark:text-indigo-400 hover:bg-blue-100 transition-colors">
              <X className="w-3.5 h-3.5" />
              Clear Search
            </button>
          )}
        </div>
      )}

      {/* ── Modal ────────────────────────────────────────────────────────── */}
      {modalFaculty && (
        <FacultyModal
          faculty={modalFaculty}
          onClose={() => setModalFaculty(null)}
          onUpdate={handleUpdate}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
