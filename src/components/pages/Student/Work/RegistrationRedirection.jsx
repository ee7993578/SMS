import { useState, useMemo, useCallback } from 'react'
import {
  Search, RefreshCw, Check, AlertCircle, X, ChevronDown,
  User, Phone, MapPin, BookOpen, Users, Camera,
  ChevronRight, ChevronLeft, Eye, EyeOff, Upload,
  GraduationCap, Calendar, Hash, Globe, Home,
  FileText, Shield, Heart, Briefcase, Mail,
  CheckCircle2, Circle, Info, Save, RotateCcw,
  ArrowRight, Plus, Trash2, Edit3, Filter, Download
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const CLASSES = [
  'Nursery','LKG','UKG','Class I','Class II','Class III',
  'Class IV','Class V','Class VI','Class VII','Class VIII',
  'Class IX','Class X','Class XI','Class XII'
]
const SECTIONS = ['A','B','C','D','E']
const RELIGIONS = ['Hindu','Muslim','Christian','Sikh','Jain','Buddhist','Other']
const CATEGORIES = ['General','OBC','SC','ST','EWS']
const BLOOD_GROUPS = ['A+','A-','B+','B-','O+','O-','AB+','AB-']
const GENDERS = ['Male','Female','Other']
const RELATIONS = ['Father','Mother','Guardian','Grandparent','Uncle','Aunt','Other']
const TRANSPORT_ROUTES = ['Route 1 – Sector 14','Route 2 – MG Road','Route 3 – Civil Lines','Route 4 – Raj Nagar','Route 5 – Kaushambi','None']
const HOUSE_GROUPS = ['Red House','Blue House','Green House','Yellow House']
const OCCUPATIONS = ['Government Service','Private Service','Business','Self-Employed','Doctor','Engineer','Teacher','Lawyer','Farmer','Other']

// Dummy existing students for reference
const EXISTING_STUDENTS = [
  { id:'ADM-2024-001', name:'Aarav Sharma',   class:'Class V – A',  status:'Active' },
  { id:'ADM-2024-002', name:'Ananya Singh',   class:'Class III – B',status:'Active' },
  { id:'ADM-2024-003', name:'Rohan Dubey',    class:'Class VII – A',status:'Active' },
  { id:'ADM-2024-004', name:'Priya Mishra',   class:'Class II – A', status:'Active' },
  { id:'ADM-2024-005', name:'Kavya Yadav',    class:'LKG – B',      status:'Active' },
]

// ─── WIZARD STEPS ─────────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: 'Basic Info',    icon: User,      short: 'Basic'    },
  { id: 2, label: 'Academic',      icon: BookOpen,  short: 'Academic' },
  { id: 3, label: 'Parent/Guardian', icon: Users,   short: 'Parent'   },
  { id: 4, label: 'Address',       icon: MapPin,    short: 'Address'  },
  { id: 5, label: 'Health & Other',icon: Heart,     short: 'Health'   },
  { id: 6, label: 'Documents',     icon: FileText,  short: 'Docs'     },
]

// ─── INITIAL FORM STATE ───────────────────────────────────────────────────────
const INITIAL_FORM = {
  // Step 1 – Basic Info
  firstName: '', middleName: '', lastName: '',
  dob: '', gender: '', religion: '', category: '', nationality: 'Indian',
  aadharNo: '', bloodGroup: '', motherTongue: '',
  // Step 2 – Academic
  admissionClass: '', section: '', rollNo: '', admissionNo: '',
  admissionDate: '', houseGroup: '', previousSchool: '', previousClass: '',
  tcNumber: '', transportRoute: 'None',
  // Step 3 – Parent/Guardian
  fatherName: '', fatherOccupation: '', fatherPhone: '', fatherEmail: '', fatherAadhar: '', fatherIncome: '',
  motherName: '', motherOccupation: '', motherPhone: '', motherEmail: '', motherAadhar: '', motherIncome: '',
  guardianName: '', guardianRelation: '', guardianPhone: '', guardianEmail: '',
  emergencyContact: '', emergencyName: '', emergencyRelation: '',
  // Step 4 – Address
  houseNo: '', streetArea: '', city: '', state: '', pincode: '', country: 'India',
  sameAsPermanent: true,
  permHouseNo: '', permStreet: '', permCity: '', permState: '', permPincode: '',
  // Step 5 – Health & Other
  height: '', weight: '', specialNeed: 'No', specialNeedDetails: '',
  medicalCondition: '', allergies: '', lastMedicalDate: '',
  smsBoardNumber: '', rteStudent: 'No', newOldStudent: 'New',
  // Step 6 – Documents
  photoUploaded: false, birthCertUploaded: false, tcUploaded: false,
  aadharUploaded: false, medicalUploaded: false,
  remarks: '',
}

// ─── REUSABLE UI COMPONENTS ───────────────────────────────────────────────────

/** Native select with chevron */
function NativeSelect({ value, onChange, children, className = '', placeholder, error }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 border-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          ${error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''}
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20 ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

/** Text / date / number input */
function FormInput({ label, value, onChange, type = 'text', placeholder, error, required, icon: Icon, hint, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1">
          {label}{required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
            bg-white text-slate-800 border-slate-200 placeholder-slate-300
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            ${error ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : ''}
            dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
            dark:placeholder-slate-600 dark:focus:border-indigo-400`}
        />
      </div>
      {error && <p className="text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
    </div>
  )
}

/** Select with label */
function FormSelect({ label, value, onChange, options, placeholder, error, required, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <NativeSelect value={value} onChange={onChange} placeholder={placeholder} error={error}>
        {options.map(o => (
          typeof o === 'string'
            ? <option key={o} value={o}>{o}</option>
            : <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </NativeSelect>
      {error && <p className="text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

/** Section header inside form steps */
function SectionHeader({ icon: Icon, title, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    violet: 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400 border-violet-100 dark:border-violet-500/20',
    emerald:'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    amber:  'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
    rose:   'bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border-rose-100 dark:border-rose-500/20',
    slate:  'bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
  }
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-bold mb-3 ${colors[color]}`}>
      {Icon && <Icon className="w-3.5 h-3.5 flex-shrink-0" />}
      <span>{title}</span>
    </div>
  )
}

/** Toggle / Radio pill group */
function PillGroup({ options, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(o => (
        <button
          key={o}
          type="button"
          onClick={() => onChange(o)}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all
            ${value === o
              ? 'bg-blue-500 border-blue-500 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.25)] dark:text-slate-400'
            }`}
        >
          {o}
        </button>
      ))}
    </div>
  )
}

/** Document upload stub */
function DocUpload({ label, uploaded, onToggle, required }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`flex items-center gap-3 w-full p-3 rounded-xl border-2 border-dashed transition-all
        ${uploaded
          ? 'border-emerald-300 bg-emerald-50/70 dark:border-emerald-500/30 dark:bg-emerald-500/[0.07]'
          : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 dark:border-[rgba(99,102,241,0.2)] dark:bg-white/[0.02]'
        }`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${uploaded ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
        {uploaded
          ? <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          : <Upload className="w-4 h-4 text-slate-400" />
        }
      </span>
      <span className="flex-1 text-left">
        <span className={`block text-[13px] font-semibold ${uploaded ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </span>
        <span className="block text-[11px] text-slate-400">
          {uploaded ? 'Uploaded ✓ (click to remove)' : 'Click to upload'}
        </span>
      </span>
    </button>
  )
}

/** Success Toast */
function SuccessToast({ message, onClose }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl
      bg-emerald-600 text-white text-[13px] font-semibold min-w-[280px] max-w-[90vw]"
      style={{ animation: 'slideUp 0.3s ease' }}>
      <Check className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── STEP COMPONENTS ──────────────────────────────────────────────────────────

/** Step 1 – Basic Student Info */
function Step1({ form, set, errors }) {
  return (
    <div className="space-y-4">
      <SectionHeader icon={User} title="Student Personal Details" color="blue" />

      {/* Photo upload placeholder */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-slate-50 dark:bg-white/[0.02] flex flex-col items-center justify-center cursor-pointer hover:border-blue-300 transition-colors group">
            {form.photoUploaded
              ? <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              : <>
                  <Camera className="w-6 h-6 text-slate-300 group-hover:text-blue-400 transition-colors" />
                  <span className="text-[10px] text-slate-400 mt-1">Photo</span>
                </>
            }
          </div>
          <span className="text-[10px] text-slate-400">3.5 × 4.5 cm</span>
        </div>

        {/* Name row */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <FormInput label="First Name" value={form.firstName} onChange={e=>set('firstName',e.target.value)} placeholder="First" error={errors.firstName} required />
          <FormInput label="Middle Name" value={form.middleName} onChange={e=>set('middleName',e.target.value)} placeholder="Middle" />
          <FormInput label="Last Name / Surname" value={form.lastName} onChange={e=>set('lastName',e.target.value)} placeholder="Last" error={errors.lastName} required />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormInput label="Date of Birth" value={form.dob} onChange={e=>set('dob',e.target.value)} type="date" error={errors.dob} required icon={Calendar} />
        <FormSelect label="Gender" value={form.gender} onChange={e=>set('gender',e.target.value)} options={GENDERS} placeholder="-- Select --" error={errors.gender} required />
        <FormSelect label="Blood Group" value={form.bloodGroup} onChange={e=>set('bloodGroup',e.target.value)} options={BLOOD_GROUPS} placeholder="-- Select --" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormSelect label="Religion" value={form.religion} onChange={e=>set('religion',e.target.value)} options={RELIGIONS} placeholder="-- Select --" />
        <FormSelect label="Category" value={form.category} onChange={e=>set('category',e.target.value)} options={CATEGORIES} placeholder="-- Select --" error={errors.category} required />
        <FormInput label="Nationality" value={form.nationality} onChange={e=>set('nationality',e.target.value)} placeholder="Indian" icon={Globe} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormInput label="Aadhar Number" value={form.aadharNo} onChange={e=>set('aadharNo',e.target.value)} placeholder="XXXX XXXX XXXX" icon={Shield} hint="12-digit Aadhar card number" />
        <FormInput label="Mother Tongue" value={form.motherTongue} onChange={e=>set('motherTongue',e.target.value)} placeholder="e.g. Hindi, English" />
      </div>
    </div>
  )
}

/** Step 2 – Academic Details */
function Step2({ form, set, errors }) {
  return (
    <div className="space-y-4">
      <SectionHeader icon={BookOpen} title="Academic & Admission Details" color="violet" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormSelect label="Admission Class" value={form.admissionClass} onChange={e=>set('admissionClass',e.target.value)} options={CLASSES} placeholder="-- Select Class --" error={errors.admissionClass} required />
        <FormSelect label="Section" value={form.section} onChange={e=>set('section',e.target.value)} options={SECTIONS} placeholder="-- Select --" error={errors.section} required />
        <FormInput label="Roll Number" value={form.rollNo} onChange={e=>set('rollNo',e.target.value)} placeholder="Auto / Manual" icon={Hash} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormInput label="Admission Number" value={form.admissionNo} onChange={e=>set('admissionNo',e.target.value)} placeholder="ADM-2024-XXX" hint="Leave blank to auto-generate" />
        <FormInput label="Admission Date" value={form.admissionDate} onChange={e=>set('admissionDate',e.target.value)} type="date" icon={Calendar} required error={errors.admissionDate} />
        <FormSelect label="House Group" value={form.houseGroup} onChange={e=>set('houseGroup',e.target.value)} options={HOUSE_GROUPS} placeholder="-- Select --" />
      </div>

      <SectionHeader icon={GraduationCap} title="Previous School Details" color="emerald" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormInput label="Previous School Name" value={form.previousSchool} onChange={e=>set('previousSchool',e.target.value)} placeholder="School name" icon={GraduationCap} />
        <FormSelect label="Previous Class" value={form.previousClass} onChange={e=>set('previousClass',e.target.value)} options={CLASSES} placeholder="-- Select --" />
        <FormInput label="TC Number" value={form.tcNumber} onChange={e=>set('tcNumber',e.target.value)} placeholder="Transfer certificate no." />
      </div>

      <SectionHeader icon={Briefcase} title="Transport & Other" color="amber" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormSelect label="Transport Route" value={form.transportRoute} onChange={e=>set('transportRoute',e.target.value)} options={TRANSPORT_ROUTES} />
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">New / Old Student</label>
          <PillGroup options={['New','Old']} value={form.newOldStudent} onChange={v=>set('newOldStudent',v)} />
        </div>
      </div>
    </div>
  )
}

/** Step 3 – Parent / Guardian */
function Step3({ form, set }) {
  return (
    <div className="space-y-5">
      {/* Father */}
      <div>
        <SectionHeader icon={User} title="Father's Details" color="blue" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <FormInput label="Father's Name" value={form.fatherName} onChange={e=>set('fatherName',e.target.value)} placeholder="Full name" required />
          <FormSelect label="Occupation" value={form.fatherOccupation} onChange={e=>set('fatherOccupation',e.target.value)} options={OCCUPATIONS} placeholder="-- Select --" />
          <FormInput label="Mobile Number" value={form.fatherPhone} onChange={e=>set('fatherPhone',e.target.value)} placeholder="+91 XXXXX XXXXX" icon={Phone} type="tel" required />
          <FormInput label="Email" value={form.fatherEmail} onChange={e=>set('fatherEmail',e.target.value)} placeholder="email@example.com" icon={Mail} type="email" />
          <FormInput label="Aadhar Number" value={form.fatherAadhar} onChange={e=>set('fatherAadhar',e.target.value)} placeholder="XXXX XXXX XXXX" icon={Shield} />
          <FormInput label="Annual Income" value={form.fatherIncome} onChange={e=>set('fatherIncome',e.target.value)} placeholder="₹ per annum" />
        </div>
      </div>

      {/* Mother */}
      <div>
        <SectionHeader icon={User} title="Mother's Details" color="violet" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <FormInput label="Mother's Name" value={form.motherName} onChange={e=>set('motherName',e.target.value)} placeholder="Full name" required />
          <FormSelect label="Occupation" value={form.motherOccupation} onChange={e=>set('motherOccupation',e.target.value)} options={OCCUPATIONS} placeholder="-- Select --" />
          <FormInput label="Mobile Number" value={form.motherPhone} onChange={e=>set('motherPhone',e.target.value)} placeholder="+91 XXXXX XXXXX" icon={Phone} type="tel" />
          <FormInput label="Email" value={form.motherEmail} onChange={e=>set('motherEmail',e.target.value)} placeholder="email@example.com" icon={Mail} type="email" />
          <FormInput label="Aadhar Number" value={form.motherAadhar} onChange={e=>set('motherAadhar',e.target.value)} placeholder="XXXX XXXX XXXX" icon={Shield} />
          <FormInput label="Annual Income" value={form.motherIncome} onChange={e=>set('motherIncome',e.target.value)} placeholder="₹ per annum" />
        </div>
      </div>

      {/* Guardian */}
      <div>
        <SectionHeader icon={Users} title="Guardian Details (if different)" color="slate" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <FormInput label="Guardian Name" value={form.guardianName} onChange={e=>set('guardianName',e.target.value)} placeholder="Full name" />
          <FormSelect label="Relation" value={form.guardianRelation} onChange={e=>set('guardianRelation',e.target.value)} options={RELATIONS} placeholder="-- Select --" />
          <FormInput label="Mobile" value={form.guardianPhone} onChange={e=>set('guardianPhone',e.target.value)} placeholder="+91 XXXXX XXXXX" icon={Phone} type="tel" />
          <FormInput label="Email" value={form.guardianEmail} onChange={e=>set('guardianEmail',e.target.value)} placeholder="email@example.com" icon={Mail} type="email" />
        </div>
      </div>

      {/* Emergency */}
      <div>
        <SectionHeader icon={Phone} title="Emergency Contact" color="rose" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FormInput label="Contact Name" value={form.emergencyName} onChange={e=>set('emergencyName',e.target.value)} placeholder="Name" required />
          <FormInput label="Phone Number" value={form.emergencyContact} onChange={e=>set('emergencyContact',e.target.value)} placeholder="+91 XXXXX XXXXX" icon={Phone} type="tel" required />
          <FormSelect label="Relation" value={form.emergencyRelation} onChange={e=>set('emergencyRelation',e.target.value)} options={RELATIONS} placeholder="-- Select --" />
        </div>
      </div>
    </div>
  )
}

/** Step 4 – Address */
function Step4({ form, set }) {
  const handleSameToggle = () => set('sameAsPermanent', !form.sameAsPermanent)
  return (
    <div className="space-y-4">
      <SectionHeader icon={Home} title="Current / Communication Address" color="blue" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormInput label="House No. / Flat" value={form.houseNo} onChange={e=>set('houseNo',e.target.value)} placeholder="H.No / Flat No." icon={Home} required />
        <FormInput label="Street / Colony / Area" value={form.streetArea} onChange={e=>set('streetArea',e.target.value)} placeholder="Street or colony name" className="sm:col-span-2" required />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <FormInput label="City" value={form.city} onChange={e=>set('city',e.target.value)} placeholder="City" required />
        <FormInput label="State" value={form.state} onChange={e=>set('state',e.target.value)} placeholder="State" required />
        <FormInput label="PIN Code" value={form.pincode} onChange={e=>set('pincode',e.target.value)} placeholder="110001" required />
        <FormInput label="Country" value={form.country} onChange={e=>set('country',e.target.value)} placeholder="India" icon={Globe} />
      </div>

      {/* Same as permanent toggle */}
      <div className="flex items-center gap-2 py-2">
        <button
          type="button"
          onClick={handleSameToggle}
          className={`w-10 h-6 rounded-full transition-all relative flex-shrink-0
            ${form.sameAsPermanent ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${form.sameAsPermanent ? 'left-4' : 'left-0.5'}`} />
        </button>
        <span className="text-[13px] font-medium text-slate-600 dark:text-slate-400">Permanent address same as current</span>
      </div>

      {!form.sameAsPermanent && (
        <>
          <SectionHeader icon={MapPin} title="Permanent Address" color="violet" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <FormInput label="House No. / Flat" value={form.permHouseNo} onChange={e=>set('permHouseNo',e.target.value)} placeholder="H.No / Flat No." icon={Home} />
            <FormInput label="Street / Colony / Area" value={form.permStreet} onChange={e=>set('permStreet',e.target.value)} placeholder="Street or colony name" className="sm:col-span-2" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <FormInput label="City" value={form.permCity} onChange={e=>set('permCity',e.target.value)} placeholder="City" />
            <FormInput label="State" value={form.permState} onChange={e=>set('permState',e.target.value)} placeholder="State" />
            <FormInput label="PIN Code" value={form.permPincode} onChange={e=>set('permPincode',e.target.value)} placeholder="110001" />
          </div>
        </>
      )}
    </div>
  )
}

/** Step 5 – Health & Other */
function Step5({ form, set }) {
  return (
    <div className="space-y-4">
      <SectionHeader icon={Heart} title="Health Information" color="rose" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormInput label="Height (cm)" value={form.height} onChange={e=>set('height',e.target.value)} placeholder="e.g. 120" type="number" />
        <FormInput label="Weight (kg)" value={form.weight} onChange={e=>set('weight',e.target.value)} placeholder="e.g. 32" type="number" />
        <FormInput label="Last Medical Checkup Date" value={form.lastMedicalDate} onChange={e=>set('lastMedicalDate',e.target.value)} type="date" icon={Calendar} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">Special Need / Disability</label>
          <PillGroup options={['No','Yes']} value={form.specialNeed} onChange={v=>set('specialNeed',v)} />
        </div>
        {form.specialNeed === 'Yes' && (
          <FormInput label="Special Need Details" value={form.specialNeedDetails} onChange={e=>set('specialNeedDetails',e.target.value)} placeholder="Describe disability or special need" />
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormInput label="Medical Condition (if any)" value={form.medicalCondition} onChange={e=>set('medicalCondition',e.target.value)} placeholder="e.g. Asthma, Diabetes" />
        <FormInput label="Allergies (if any)" value={form.allergies} onChange={e=>set('allergies',e.target.value)} placeholder="e.g. Peanuts, Dust" />
      </div>

      <SectionHeader icon={Info} title="Other Details" color="amber" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <FormInput label="SMS Board / Exam Board No." value={form.smsBoardNumber} onChange={e=>set('smsBoardNumber',e.target.value)} placeholder="Board number" />
        <div className="flex flex-col gap-1">
          <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">RTE Student</label>
          <PillGroup options={['No','Yes']} value={form.rteStudent} onChange={v=>set('rteStudent',v)} />
        </div>
      </div>
    </div>
  )
}

/** Step 6 – Documents & Remarks */
function Step6({ form, set }) {
  return (
    <div className="space-y-4">
      <SectionHeader icon={FileText} title="Document Upload" color="blue" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <DocUpload label="Student Photo" uploaded={form.photoUploaded} onToggle={()=>set('photoUploaded',!form.photoUploaded)} required />
        <DocUpload label="Birth Certificate" uploaded={form.birthCertUploaded} onToggle={()=>set('birthCertUploaded',!form.birthCertUploaded)} required />
        <DocUpload label="Transfer Certificate (TC)" uploaded={form.tcUploaded} onToggle={()=>set('tcUploaded',!form.tcUploaded)} />
        <DocUpload label="Aadhar Card Copy" uploaded={form.aadharUploaded} onToggle={()=>set('aadharUploaded',!form.aadharUploaded)} />
        <DocUpload label="Medical / Fitness Certificate" uploaded={form.medicalUploaded} onToggle={()=>set('medicalUploaded',!form.medicalUploaded)} />
      </div>

      <SectionHeader icon={Edit3} title="Remarks" color="slate" />
      <div className="flex flex-col gap-1">
        <label className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">Additional Remarks / Notes</label>
        <textarea
          value={form.remarks}
          onChange={e=>set('remarks',e.target.value)}
          rows={4}
          placeholder="Any special remarks or notes about the student…"
          className="w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all resize-none
            bg-white text-slate-800 border-slate-200 placeholder-slate-300
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:placeholder-slate-600"
        />
      </div>

      {/* Preview summary */}
      <div className="rounded-xl border border-blue-100 dark:border-blue-500/20 bg-blue-50/60 dark:bg-blue-500/[0.05] p-4">
        <p className="text-[12px] font-bold text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" /> Registration Summary
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1">
          {[
            ['Photo',           form.photoUploaded ? '✓ Uploaded' : '✗ Missing'],
            ['Birth Certificate',form.birthCertUploaded ? '✓ Uploaded' : '✗ Missing'],
            ['TC',              form.tcUploaded ? '✓ Uploaded' : 'Not uploaded'],
            ['Aadhar',          form.aadharUploaded ? '✓ Uploaded' : 'Not uploaded'],
          ].map(([k,v]) => (
            <div key={k} className="flex gap-2">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{k}:</span>
              <span className={`text-[11px] font-semibold ${v.startsWith('✓') ? 'text-emerald-600 dark:text-emerald-400' : v.startsWith('✗') ? 'text-rose-500' : 'text-slate-400'}`}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────
function StepIndicator({ steps, currentStep, completedSteps, onStepClick }) {
  return (
    <>
      {/* Desktop stepper */}
      <div className="hidden md:flex items-center w-full">
        {steps.map((s, i) => {
          const done = completedSteps.includes(s.id)
          const active = currentStep === s.id
          const Icon = s.icon
          return (
            <div key={s.id} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => done || active ? onStepClick(s.id) : null}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-[12px] font-semibold flex-shrink-0
                  ${active
                    ? 'bg-blue-500 text-white shadow-md shadow-blue-200 dark:shadow-blue-500/20'
                    : done
                      ? 'bg-emerald-500 text-white cursor-pointer hover:bg-emerald-600'
                      : 'bg-slate-100 dark:bg-slate-800/60 text-slate-400 dark:text-slate-500 cursor-default'
                  }`}
              >
                {done && !active
                  ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  : <Icon className="w-4 h-4 flex-shrink-0" />
                }
                <span className="hidden lg:block">{s.label}</span>
              </button>
              {i < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 rounded-full transition-all ${done ? 'bg-emerald-300 dark:bg-emerald-500/40' : 'bg-slate-200 dark:bg-slate-700'}`} />
              )}
            </div>
          )
        })}
      </div>

      {/* Mobile step indicator: pill row */}
      <div className="flex md:hidden gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {steps.map(s => {
          const done = completedSteps.includes(s.id)
          const active = currentStep === s.id
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => (done || active) ? onStepClick(s.id) : null}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold flex-shrink-0 transition-all
                ${active
                  ? 'bg-blue-500 text-white shadow-sm'
                  : done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                }`}
            >
              {done && !active ? <CheckCircle2 className="w-3 h-3" /> : <s.icon className="w-3 h-3" />}
              {s.short}
            </button>
          )
        })}
      </div>
    </>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function StudentRegistration() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState([])
  const [form, setForm] = useState({ ...INITIAL_FORM })
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [showStudentList, setShowStudentList] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const showToast = useCallback((msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Generic field setter
  const set = useCallback((key, val) => {
    setForm(p => ({ ...p, [key]: val }))
    if (errors[key]) setErrors(p => { const n = { ...p }; delete n[key]; return n })
  }, [errors])

  // Per-step validation
  const validateStep = (step) => {
    const err = {}
    if (step === 1) {
      if (!form.firstName.trim()) err.firstName = 'Required'
      if (!form.lastName.trim()) err.lastName = 'Required'
      if (!form.dob) err.dob = 'Required'
      if (!form.gender) err.gender = 'Required'
      if (!form.category) err.category = 'Required'
    }
    if (step === 2) {
      if (!form.admissionClass) err.admissionClass = 'Required'
      if (!form.section) err.section = 'Required'
      if (!form.admissionDate) err.admissionDate = 'Required'
    }
    return err
  }

  const handleNext = () => {
    const err = validateStep(currentStep)
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setCompletedSteps(p => p.includes(currentStep) ? p : [...p, currentStep])
    setCurrentStep(p => Math.min(p + 1, STEPS.length))
  }

  const handleBack = () => {
    setCurrentStep(p => Math.max(p - 1, 1))
    setErrors({})
  }

  const handleSave = () => {
    // Final validation on all required steps
    let allErrors = {}
    for (let i = 1; i <= 2; i++) {
      const e = validateStep(i)
      allErrors = { ...allErrors, ...e }
    }
    if (Object.keys(allErrors).length) {
      setErrors(allErrors)
      setCurrentStep(1)
      return
    }
    setCompletedSteps([1,2,3,4,5,6])
    showToast(`Student ${form.firstName} ${form.lastName} registered successfully!`)
  }

  const handleReset = () => {
    setForm({ ...INITIAL_FORM })
    setErrors({})
    setCurrentStep(1)
    setCompletedSteps([])
  }

  // Filtered student list
  const filteredStudents = useMemo(() =>
    EXISTING_STUDENTS.filter(s =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
    ), [searchQuery])

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1 form={form} set={set} errors={errors} />
      case 2: return <Step2 form={form} set={set} errors={errors} />
      case 3: return <Step3 form={form} set={set} />
      case 4: return <Step4 form={form} set={set} />
      case 5: return <Step5 form={form} set={set} />
      case 6: return <Step6 form={form} set={set} />
      default: return null
    }
  }

  return (
    <div className="space-y-4 pb-8">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100">
            Student Registration
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Fill all steps to register a new student. Fields marked <span className="text-rose-500 font-bold">*</span> are required.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View existing students toggle */}
          <button
            type="button"
            onClick={() => setShowStudentList(!showStudentList)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold border transition-all
              ${showStudentList
                ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-400'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.25)] dark:text-slate-400'
              }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Registered Students</span>
            <span className="sm:hidden">Students</span>
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-colors
              bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Reset Form</span>
          </button>
        </div>
      </div>

      {/* ── Existing Students Panel ──────────────────────────────────────── */}
      {showStudentList && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-4 rounded-full bg-blue-500 flex-shrink-0" />
            <Users className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">Registered Students</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {EXISTING_STUDENTS.length} records
            </span>
          </div>
          <div className="p-3">
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name or admission no…"
                className="w-full pl-9 pr-3 py-2 text-[12px] rounded-xl border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:placeholder-slate-600"
              />
            </div>
            {/* Desktop table / Mobile cards */}
            <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.02] text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="text-left px-4 py-2.5">Adm. No.</th>
                    <th className="text-left px-4 py-2.5">Name</th>
                    <th className="text-left px-4 py-2.5">Class</th>
                    <th className="text-left px-4 py-2.5">Status</th>
                    <th className="text-right px-4 py-2.5">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.08)]">
                  {filteredStudents.map(s => (
                    <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-2.5 font-mono text-slate-500 dark:text-slate-400">{s.id}</td>
                      <td className="px-4 py-2.5 font-semibold text-slate-700 dark:text-slate-200">{s.name}</td>
                      <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400">{s.class}</td>
                      <td className="px-4 py-2.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button type="button" className="text-blue-500 hover:text-blue-600 dark:text-indigo-400">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {filteredStudents.map(s => (
                <div key={s.id} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/50 dark:bg-white/[0.02]">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center text-[11px] font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">
                    {s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{s.name}</p>
                    <p className="text-[11px] text-slate-400">{s.id} · {s.class}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Registration Card ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">New Student Registration</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            Step {currentStep} of {STEPS.length}
          </span>
        </div>

        {/* Step Indicator */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/30 dark:bg-white/[0.01]">
          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
            onStepClick={setCurrentStep}
          />
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 min-h-[320px]">
          {renderStep()}
        </div>

        {/* Footer Nav */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center sm:text-left hidden sm:block">
            {completedSteps.length} of {STEPS.length} steps completed
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold transition-colors
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}
            {currentStep < STEPS.length ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95
                  bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95
                  bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
              >
                <Save className="w-4 h-4" /> Save Registration
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Completion Banner ─────────────────────────────────────────────── */}
      {completedSteps.length === STEPS.length && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-emerald-50/60 dark:bg-emerald-500/[0.05] px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-[13px] text-emerald-800 dark:text-emerald-300 font-semibold">
              All steps completed! Click <em>Save Registration</em> to finalize.
            </p>
            <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">
              Student details will be saved and an admission number will be generated.
            </p>
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-sm flex-shrink-0"
          >
            <Save className="w-4 h-4" /> Save Now
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && <SuccessToast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
