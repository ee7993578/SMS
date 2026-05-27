import { useState, useRef } from 'react'
import {
  Search, Save, RotateCcw, ChevronDown, AlertCircle,
  Check, X, Edit3, User, Users, GraduationCap,
  Phone, Mail, MapPin, Calendar, Hash, FileText,
  SlidersHorizontal, CheckCircle2, XCircle, Loader2,
  ChevronLeft, ChevronRight, Eye, EyeOff
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS  = ['2024-25','2025-26','2026-27']
const CLASSES   = ['Nursery','LKG','UKG','Class I','Class II','Class III','Class IV','Class V','Class VI','Class VII','Class VIII','Class IX','Class X','Class XI','Class XII']
const BLOOD     = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const CATEGORIES= ['General','OBC','SC','ST','EWS']
const HOUSES    = ['Red House','Blue House','Green House','Yellow House']
const OCCUPATIONS=['Business','Service','Farming','Doctor','Engineer','Lawyer','Teacher','Other']
const QUOTAS    = ['None','R.T.E.','Management','Staff Ward','Other']
const STATES    = ['Uttar Pradesh','Delhi','Maharashtra','Bihar','Rajasthan','Gujarat','Punjab','Haryana']
const CITIES    = { 'Uttar Pradesh':['Meerut','Lucknow','Agra','Noida','Kanpur'], 'Delhi':['New Delhi','Dwarka','Rohini'], 'Maharashtra':['Mumbai','Pune','Nagpur'], 'Bihar':['Patna','Gaya'], 'Rajasthan':['Jaipur','Jodhpur'], 'Gujarat':['Ahmedabad','Surat'], 'Punjab':['Amritsar','Ludhiana'], 'Haryana':['Gurugram','Faridabad'] }
const STREAMS   = ['N/A','Science','Commerce','Arts','Vocational']
const OPT_SUBS  = ['N/A','Mathematics','Biology','Computer Science','Physical Education','Fine Arts','Music','Home Science']
const DOCS      = ['Transfer Certificate','Birth Certificate','Marksheet','Aadhar Card','Caste Certificate','Migration Certificate']

const MOCK_DATA = [
  { uid:1, admNo:'ADM001', rollNo:'01', firstName:'Aarav',    midName:'Kumar',  lastName:'Sharma',    gender:'Male',   dob:'12 Mar 2015', bloodgroup:'A+',  category:'General', house:'Red House',   doa:'01 Apr 2022', feeBook:'FB001', phone:'0121-2345678', mobile:'9876543210', fatherName:'Rajesh Sharma',  fOcc:'Service',  fOrgAdd:'Sector 12, Noida',   motherName:'Sunita Sharma',   mOcc:'Teacher',  mOrgAdd:'N/A', resAddress:'45, Shastri Nagar, Meerut', quota:'None',    state:'Uttar Pradesh', city:'Meerut', email:'rajesh@gmail.com',  aadhar:'123456789012', doat:'01 Apr 2022', fatherWhatsapp:'9876543210', motherWhatsapp:'9876543211', stream:'N/A',     optSub:'N/A',           tc:'No', bc:'Yes', marksheet:'No', aadharCard:'Yes', castCert:'No', migration:'No' },
  { uid:2, admNo:'ADM002', rollNo:'02', firstName:'Priya',    midName:'',       lastName:'Singh',     gender:'Female', dob:'05 Jul 2014', bloodgroup:'B+',  category:'OBC',     house:'Blue House',  doa:'10 Apr 2021', feeBook:'FB002', phone:'0121-2345679', mobile:'9812345678', fatherName:'Suresh Singh',   fOcc:'Business', fOrgAdd:'Civil Lines, Delhi',  motherName:'Rekha Singh',     mOcc:'Service',  mOrgAdd:'N/A', resAddress:'12, Model Town, Meerut',    quota:'R.T.E.',  state:'Uttar Pradesh', city:'Meerut', email:'suresh@yahoo.com',  aadhar:'234567890123', doat:'10 Apr 2021', fatherWhatsapp:'9812345678', motherWhatsapp:'9812345679', stream:'N/A',     optSub:'N/A',           tc:'Yes',bc:'Yes', marksheet:'Yes',aadharCard:'Yes', castCert:'Yes', migration:'No' },
  { uid:3, admNo:'ADM003', rollNo:'03', firstName:'Rohan',    midName:'Vijay',  lastName:'Gupta',     gender:'Male',   dob:'22 Jan 2013', bloodgroup:'O+',  category:'General', house:'Green House', doa:'05 Apr 2020', feeBook:'FB003', phone:'011-23456789', mobile:'9898989898', fatherName:'Vinod Gupta',    fOcc:'Doctor',   fOrgAdd:'GK-2, New Delhi',    motherName:'Kavita Gupta',    mOcc:'Farming',  mOrgAdd:'N/A', resAddress:'7, Gandhi Nagar, Delhi',    quota:'None',    state:'Delhi',         city:'New Delhi',email:'vinod@gmail.com',   aadhar:'345678901234', doat:'05 Apr 2020', fatherWhatsapp:'9898989898', motherWhatsapp:'9898989899', stream:'Science', optSub:'Mathematics',   tc:'Yes',bc:'No',  marksheet:'Yes',aadharCard:'No',  castCert:'No', migration:'Yes'},
  { uid:4, admNo:'ADM004', rollNo:'04', firstName:'Ananya',   midName:'',       lastName:'Verma',     gender:'Female', dob:'10 Sep 2014', bloodgroup:'AB+', category:'SC',      house:'Yellow House',doa:'02 Apr 2021', feeBook:'FB004', phone:'0522-3456789', mobile:'9023456789', fatherName:'Manoj Verma',    fOcc:'Lawyer',   fOrgAdd:'Hazratganj, Lucknow', motherName:'Pooja Verma',     mOcc:'Business', mOrgAdd:'N/A', resAddress:'88, Sector 5, Noida',       quota:'None',    state:'Uttar Pradesh', city:'Lucknow',email:'manoj@gmail.com',   aadhar:'456789012345', doat:'02 Apr 2021', fatherWhatsapp:'9023456789', motherWhatsapp:'9023456780', stream:'N/A',     optSub:'N/A',           tc:'No', bc:'Yes', marksheet:'No', aadharCard:'Yes', castCert:'Yes', migration:'No' },
  { uid:5, admNo:'ADM005', rollNo:'05', firstName:'Karan',    midName:'Dev',    lastName:'Mehta',     gender:'Male',   dob:'18 Feb 2012', bloodgroup:'B-',  category:'General', house:'Red House',   doa:'08 Apr 2019', feeBook:'FB005', phone:'0171-4567890', mobile:'9711223344', fatherName:'Sanjay Mehta',   fOcc:'Engineer', fOrgAdd:'Sector 14, Gurgaon', motherName:'Nisha Mehta',     mOcc:'Teacher',  mOrgAdd:'N/A', resAddress:'23, Lajpat Nagar, Delhi',   quota:'Management',state:'Delhi',         city:'Dwarka', email:'sanjay@gmail.com',  aadhar:'567890123456', doat:'08 Apr 2019', fatherWhatsapp:'9711223344', motherWhatsapp:'9711223345', stream:'Commerce','optSub':'N/A',          tc:'Yes',bc:'Yes', marksheet:'Yes',aadharCard:'Yes', castCert:'No', migration:'Yes'},
  { uid:6, admNo:'ADM006', rollNo:'06', firstName:'Diya',     midName:'',       lastName:'Patel',     gender:'Female', dob:'30 Nov 2015', bloodgroup:'A-',  category:'OBC',     house:'Blue House',  doa:'01 Apr 2023', feeBook:'FB006', phone:'0121-5678901', mobile:'9654321098', fatherName:'Amit Patel',     fOcc:'Other',    fOrgAdd:'Navrangpura, Ahmedabad',motherName:'Hetal Patel',     mOcc:'Other',    mOrgAdd:'N/A', resAddress:'67, Ashok Vihar, Meerut',   quota:'R.T.E.',  state:'Uttar Pradesh', city:'Meerut', email:'amit@yahoo.com',    aadhar:'678901234567', doat:'01 Apr 2023', fatherWhatsapp:'9654321098', motherWhatsapp:'9654321099', stream:'N/A',     optSub:'N/A',           tc:'No', bc:'No',  marksheet:'No', aadharCard:'No',  castCert:'No', migration:'No' },
  { uid:7, admNo:'ADM007', rollNo:'07', firstName:'Arjun',    midName:'Ravi',   lastName:'Nair',      gender:'Male',   dob:'14 Apr 2011', bloodgroup:'O-',  category:'General', house:'Green House', doa:'03 Apr 2018', feeBook:'FB007', phone:'044-67890123', mobile:'9445566778', fatherName:'Sunil Nair',     fOcc:'Service',  fOrgAdd:'Anna Nagar, Chennai', motherName:'Geeta Nair',      mOcc:'Doctor',   mOrgAdd:'N/A', resAddress:'3, Connaught Place, Delhi', quota:'Staff Ward',state:'Delhi',         city:'New Delhi',email:'sunil@gmail.com',   aadhar:'789012345678', doat:'03 Apr 2018', fatherWhatsapp:'9445566778', motherWhatsapp:'9445566779', stream:'Science', optSub:'Biology',       tc:'Yes',bc:'Yes', marksheet:'Yes',aadharCard:'Yes', castCert:'No', migration:'No' },
  { uid:8, admNo:'ADM008', rollNo:'08', firstName:'Sneha',    midName:'',       lastName:'Rao',       gender:'Female', dob:'07 Aug 2013', bloodgroup:'B+',  category:'ST',      house:'Yellow House',doa:'06 Apr 2020', feeBook:'FB008', phone:'040-78901234', mobile:'9332211009', fatherName:'Krishna Rao',    fOcc:'Farming',  fOrgAdd:'Banjara Hills, Hyd',  motherName:'Sarla Rao',       mOcc:'Service',  mOrgAdd:'N/A', resAddress:'91, Rajpur Road, Dehradun', quota:'R.T.E.',  state:'Uttar Pradesh', city:'Agra',   email:'krishna@gmail.com', aadhar:'890123456789', doat:'06 Apr 2020', fatherWhatsapp:'9332211009', motherWhatsapp:'9332211008', stream:'Arts',    optSub:'Fine Arts',     tc:'No', bc:'Yes', marksheet:'No', aadharCard:'Yes', castCert:'Yes', migration:'No' },
]

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
const inputBase = `w-full px-2.5 py-1.5 text-[12px] border rounded-md outline-none transition-all font-medium
  border-slate-200 bg-white text-slate-800 placeholder-slate-300
  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
  dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500
  dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
  disabled:opacity-40 disabled:cursor-not-allowed`

const selBase = `${inputBase} appearance-none cursor-pointer`

function Inp({ value, onChange, disabled, type = 'text', placeholder = '', maxLength, className = '' }) {
  return <input type={type} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder} maxLength={maxLength}
    className={`${inputBase} ${className}`} />
}

function Sel({ value, onChange, disabled, children, className = '' }) {
  return (
    <select value={value} onChange={onChange} disabled={disabled}
      className={`${selBase} ${className}`}>
      {children}
    </select>
  )
}

function FilterSel({ label, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      <select value={value} onChange={onChange}
        className="w-full px-3 py-2 text-[13px] border rounded-lg outline-none transition-all appearance-none cursor-pointer font-medium
          border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400
          dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          hover:border-slate-300 dark:hover:border-indigo-400/40">
        {children}
      </select>
    </div>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ items, onRemove }) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {items.map(t => (
        <div key={t.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-[13px] font-semibold
          pointer-events-auto max-w-sm animate-in slide-in-from-right-4 duration-300
          ${t.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500/30 dark:text-emerald-300'
            : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-500/30 dark:text-rose-300'
          }`}>
          {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-50 hover:opacity-100 transition-opacity">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── YES/NO TOGGLE ────────────────────────────────────────────────────────────
function YesNo({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1">
      {['Yes','No'].map(v => (
        <button key={v} type="button" disabled={disabled} onClick={() => onChange(v)}
          className={`flex-1 py-1 text-[11px] font-bold rounded-md border transition-all
            ${value === v
              ? v === 'Yes'
                ? 'bg-emerald-500 border-emerald-500 text-white dark:bg-emerald-600'
                : 'bg-slate-400 border-slate-400 text-white dark:bg-slate-600'
              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-[#1e2238] dark:border-white/10 dark:text-slate-400'
            } disabled:opacity-40 disabled:cursor-not-allowed`}>
          {v}
        </button>
      ))}
    </div>
  )
}

// ─── SECTION DIVIDER ─────────────────────────────────────────────────────────
function SectionDiv({ label }) {
  return (
    <div className="flex items-center gap-3 col-span-full mt-2 mb-0.5">
      <div className="h-px flex-1 bg-slate-100 dark:bg-[rgba(99,102,241,0.12)]" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
      <div className="h-px flex-1 bg-slate-100 dark:bg-[rgba(99,102,241,0.12)]" />
    </div>
  )
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ student, onSave, onClose }) {
  const [draft, setDraft] = useState({ ...student })
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('basic')

  const set = (k) => (e) => setDraft(p => ({ ...p, [k]: typeof e === 'string' ? e : e.target.value }))
  const cities = CITIES[draft.state] || []

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => { setSaving(false); onSave(draft) }, 700)
  }

  const TABS = [
    { id: 'basic',   label: 'Basic Info',   icon: User },
    { id: 'parents', label: 'Parents',      icon: Users },
    { id: 'address', label: 'Address',      icon: MapPin },
    { id: 'docs',    label: 'Documents',    icon: FileText },
    { id: 'other',   label: 'Other',        icon: SlidersHorizontal },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-2xl bg-white dark:bg-[#1a1f35] rounded-t-3xl sm:rounded-2xl shadow-2xl
        border border-slate-200 dark:border-[rgba(99,102,241,0.2)] flex flex-col max-h-[92vh] sm:max-h-[88vh]">

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-[15px] font-bold text-slate-500 flex-shrink-0">
            {draft.firstName.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">
              {draft.firstName} {draft.midName} {draft.lastName}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{draft.admNo} · Roll {draft.rollNo}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 px-4 pt-3 overflow-x-auto flex-shrink-0 scrollbar-none">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} type="button"
              className={`flex items-center gap-1.5 px-3 py-2 text-[11px] font-semibold rounded-lg whitespace-nowrap transition-all flex-shrink-0
                ${tab === t.id
                  ? 'bg-blue-50 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                  : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-white/[0.05]'
                }`}>
              <t.icon className="w-3 h-3" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-5 min-h-0">

          {/* ── BASIC INFO ── */}
          {tab === 'basic' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <SectionDiv label="Name" />
              <div className="field col-span-full sm:col-span-1">
                <label className="lbl">First Name</label>
                <Inp value={draft.firstName} onChange={set('firstName')} placeholder="First name" />
              </div>
              <div className="field">
                <label className="lbl">Middle Name</label>
                <Inp value={draft.midName} onChange={set('midName')} placeholder="Middle name" />
              </div>
              <div className="field">
                <label className="lbl">Last Name</label>
                <Inp value={draft.lastName} onChange={set('lastName')} placeholder="Last name" />
              </div>

              <SectionDiv label="Personal Details" />
              <div className="field">
                <label className="lbl">Adm. No.</label>
                <Inp value={draft.admNo} disabled />
              </div>
              <div className="field">
                <label className="lbl">Roll No.</label>
                <Inp value={draft.rollNo} onChange={set('rollNo')} placeholder="Roll no" />
              </div>
              <div className="field">
                <label className="lbl">Date of Birth</label>
                <Inp type="date" value={draft.dob} onChange={set('dob')} />
              </div>
              <div className="field">
                <label className="lbl">Gender</label>
                <Sel value={draft.gender} onChange={set('gender')}>
                  <option>Male</option><option>Female</option>
                </Sel>
              </div>
              <div className="field">
                <label className="lbl">Blood Group</label>
                <Sel value={draft.bloodgroup} onChange={set('bloodgroup')}>
                  {BLOOD.map(b => <option key={b}>{b}</option>)}
                </Sel>
              </div>
              <div className="field">
                <label className="lbl">Category</label>
                <Sel value={draft.category} onChange={set('category')}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </Sel>
              </div>
              <div className="field">
                <label className="lbl">House</label>
                <Sel value={draft.house} onChange={set('house')}>
                  {HOUSES.map(h => <option key={h}>{h}</option>)}
                </Sel>
              </div>
              <div className="field">
                <label className="lbl">Date of Admission</label>
                <Inp type="date" value={draft.doa} onChange={set('doa')} />
              </div>
              <div className="field">
                <label className="lbl">Fee Book No.</label>
                <Inp value={draft.feeBook} onChange={set('feeBook')} placeholder="Fee book" />
              </div>
              <div className="field">
                <label className="lbl">Quota</label>
                <Sel value={draft.quota} onChange={set('quota')}>
                  {QUOTAS.map(q => <option key={q}>{q}</option>)}
                </Sel>
              </div>

              <SectionDiv label="Contact" />
              <div className="field">
                <label className="lbl">Phone</label>
                <Inp value={draft.phone} onChange={set('phone')} placeholder="Phone no" />
              </div>
              <div className="field">
                <label className="lbl">Mobile</label>
                <Inp value={draft.mobile} onChange={set('mobile')} maxLength={10} />
              </div>
              <div className="field">
                <label className="lbl">Email</label>
                <Inp type="email" value={draft.email} onChange={set('email')} placeholder="Email" />
              </div>
              <div className="field">
                <label className="lbl">Aadhar No.</label>
                <Inp value={draft.aadhar} onChange={set('aadhar')} maxLength={12} />
              </div>
              <div className="field">
                <label className="lbl">Date of Attendance</label>
                <Inp type="date" value={draft.doat} onChange={set('doat')} />
              </div>
            </div>
          )}

          {/* ── PARENTS ── */}
          {tab === 'parents' && (
            <div className="space-y-4">
              {/* Father */}
              <div className="rounded-xl border border-blue-100 dark:border-blue-500/15 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50/60 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-500/15">
                  <div className="w-1 h-4 rounded-full bg-blue-500" />
                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Father's Details</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div className="field col-span-2 sm:col-span-1">
                    <label className="lbl">Father's Name</label>
                    <Inp value={draft.fatherName} onChange={set('fatherName')} placeholder="Father's full name" />
                  </div>
                  <div className="field">
                    <label className="lbl">Occupation</label>
                    <Sel value={draft.fOcc} onChange={set('fOcc')}>
                      {OCCUPATIONS.map(o => <option key={o}>{o}</option>)}
                    </Sel>
                  </div>
                  <div className="field">
                    <label className="lbl">Mobile</label>
                    <Inp value={draft.mobile} onChange={set('mobile')} maxLength={10} />
                  </div>
                  <div className="field">
                    <label className="lbl">WhatsApp No.</label>
                    <Inp value={draft.fatherWhatsapp} onChange={set('fatherWhatsapp')} maxLength={10} />
                  </div>
                  <div className="field col-span-2">
                    <label className="lbl">Official Address</label>
                    <Inp value={draft.fOrgAdd} onChange={set('fOrgAdd')} placeholder="Official address" />
                  </div>
                </div>
              </div>
              {/* Mother */}
              <div className="rounded-xl border border-pink-100 dark:border-pink-500/15 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 bg-pink-50/60 dark:bg-pink-900/10 border-b border-pink-100 dark:border-pink-500/15">
                  <div className="w-1 h-4 rounded-full bg-pink-500" />
                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Mother's Details</span>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                  <div className="field col-span-2 sm:col-span-1">
                    <label className="lbl">Mother's Name</label>
                    <Inp value={draft.motherName} onChange={set('motherName')} placeholder="Mother's full name" />
                  </div>
                  <div className="field">
                    <label className="lbl">Occupation</label>
                    <Sel value={draft.mOcc} onChange={set('mOcc')}>
                      {OCCUPATIONS.map(o => <option key={o}>{o}</option>)}
                    </Sel>
                  </div>
                  <div className="field">
                    <label className="lbl">Mobile</label>
                    <Inp value={draft.motherWhatsapp} onChange={set('motherWhatsapp')} maxLength={10} />
                  </div>
                  <div className="field">
                    <label className="lbl">WhatsApp No.</label>
                    <Inp value={draft.motherWhatsapp} onChange={set('motherWhatsapp')} maxLength={10} />
                  </div>
                  <div className="field col-span-2">
                    <label className="lbl">Official Address</label>
                    <Inp value={draft.mOrgAdd} onChange={set('mOrgAdd')} placeholder="Official address" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ADDRESS ── */}
          {tab === 'address' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="field col-span-2">
                <label className="lbl">Residential Address</label>
                <textarea value={draft.resAddress} onChange={set('resAddress')} rows={3} placeholder="Full residential address"
                  className={`${inputBase} resize-none`} />
              </div>
              <div className="field">
                <label className="lbl">State</label>
                <Sel value={draft.state} onChange={e => { set('state')(e); setDraft(p => ({...p, city: ''})) }}>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </Sel>
              </div>
              <div className="field">
                <label className="lbl">City</label>
                <Sel value={draft.city} onChange={set('city')}>
                  <option value="">— Select —</option>
                  {cities.map(c => <option key={c}>{c}</option>)}
                </Sel>
              </div>
              <div className="field">
                <label className="lbl">Email</label>
                <Inp type="email" value={draft.email} onChange={set('email')} placeholder="Email" />
              </div>
            </div>
          )}

          {/* ── DOCUMENTS ── */}
          {tab === 'docs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                ['tc',          'Transfer Certificate'],
                ['bc',          'Birth Certificate'],
                ['marksheet',   'Marksheet'],
                ['aadharCard',  'Aadhar Card'],
                ['castCert',    'Caste Certificate'],
                ['migration',   'Migration Certificate'],
              ].map(([k, label]) => (
                <div key={k} className={`flex items-center justify-between p-3.5 rounded-xl border transition-all
                  ${draft[k] === 'Yes'
                    ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                    : 'border-slate-200 bg-slate-50/50 dark:border-white/[0.08] dark:bg-white/[0.02]'
                  }`}>
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                      ${draft[k] === 'Yes' ? 'bg-emerald-100 dark:bg-emerald-500/20' : 'bg-slate-100 dark:bg-white/[0.08]'}`}>
                      <FileText className={`w-3.5 h-3.5 ${draft[k] === 'Yes' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`} />
                    </div>
                    <span className={`text-[12px] font-semibold ${draft[k] === 'Yes' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300'}`}>
                      {label}
                    </span>
                  </div>
                  <YesNo value={draft[k]} onChange={v => setDraft(p => ({...p, [k]: v}))} />
                </div>
              ))}
            </div>
          )}

          {/* ── OTHER ── */}
          {tab === 'other' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="field">
                <label className="lbl">Stream</label>
                <Sel value={draft.stream} onChange={set('stream')}>
                  {STREAMS.map(s => <option key={s}>{s}</option>)}
                </Sel>
              </div>
              <div className="field">
                <label className="lbl">Optional Subject</label>
                <Sel value={draft.optSub} onChange={set('optSub')}>
                  {OPT_SUBS.map(s => <option key={s}>{s}</option>)}
                </Sel>
              </div>
              <div className="field">
                <label className="lbl">Date of Attendance</label>
                <Inp type="date" value={draft.doat} onChange={set('doat')} />
              </div>
              <div className="field">
                <label className="lbl">Quota</label>
                <Sel value={draft.quota} onChange={set('quota')}>
                  {QUOTAS.map(q => <option key={q}>{q}</option>)}
                </Sel>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/60 dark:bg-white/[0.02] flex-shrink-0 flex-wrap">
          <button onClick={onClose}
            className="px-5 py-2 text-[13px] font-semibold rounded-xl transition-colors
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-7 py-2 text-[13px] font-semibold text-white rounded-xl transition-all active:scale-95
              bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20
              dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20
              disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
            {saving
              ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving...</>
              : <><Save className="w-4 h-4" />Update Record</>
            }
          </button>
        </div>
      </div>

      {/* Inline label styles */}
      <style>{`.lbl{font-size:11px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.06em;margin-bottom:5px;display:block}.field{display:flex;flex-direction:column;}.dark .lbl{color:#9ca3af}`}</style>
    </div>
  )
}

// ─── STUDENT CARD (mobile) ────────────────────────────────────────────────────
function StudentCard({ student, onEdit }) {
  const docCount = DOCS.filter(d => {
    const k = d.replace(/\s+/g,'').replace('Certificate','Cert').toLowerCase()
    return student[k] === 'Yes' || student.tc === 'Yes'  // approximate
  }).length

  return (
    <div className="bg-white dark:bg-[#1e2238] rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-[16px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
          {student.firstName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">
            {student.firstName} {student.midName} {student.lastName}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{student.admNo} · Roll {student.rollNo}</p>
        </div>
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
          ${student.gender === 'Male' ? 'bg-blue-50 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-300' : 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300'}`}>
          {student.gender}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 px-4 pb-3">
        {[
          { icon: Calendar, val: student.dob },
          { icon: GraduationCap, val: student.house },
          { icon: User, val: student.fatherName },
          { icon: Phone, val: student.mobile },
        ].map(({ icon: Icon, val }) => (
          <div key={val} className="flex items-center gap-1.5">
            <Icon className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{val}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.05]">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.08] text-slate-500 dark:text-slate-400 font-semibold">{student.category}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold">{student.bloodgroup}</span>
          {student.quota !== 'None' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 font-semibold">{student.quota}</span>}
        </div>
        <button onClick={() => onEdit(student)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20">
          <Edit3 className="w-3 h-3" /> Edit
        </button>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function TableRow({ student, idx, onEdit }) {
  const docYes = [student.tc, student.bc, student.marksheet, student.aadharCard, student.castCert, student.migration].filter(v => v === 'Yes').length
  return (
    <tr className={`group transition-colors hover:bg-blue-50/30 dark:hover:bg-indigo-500/5 ${idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/40 dark:bg-white/[0.015]'}`}>
      <td className="px-3 py-2.5 text-[11px] text-slate-400 dark:text-slate-500 font-mono">{idx + 1}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
            {student.firstName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">
              {student.firstName} {student.midName} {student.lastName}
            </p>
            <p className="text-[10px] text-slate-400">{student.admNo}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 font-mono">{student.rollNo}</td>
      <td className="px-3 py-2.5">
        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded
          ${student.gender === 'Male' ? 'bg-blue-50 text-blue-700 dark:bg-indigo-500/10 dark:text-indigo-300' : 'bg-pink-50 text-pink-700 dark:bg-pink-500/10 dark:text-pink-300'}`}>
          {student.gender}
        </span>
      </td>
      <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{student.dob}</td>
      <td className="px-3 py-2.5">
        <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">{student.bloodgroup}</span>
      </td>
      <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400">{student.category}</td>
      <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{student.fatherName}</td>
      <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400 font-mono whitespace-nowrap">{student.mobile}</td>
      <td className="px-3 py-2.5">
        <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded
          ${docYes >= 4 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
            : docYes >= 2 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300'
            : 'bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-slate-400'}`}>
          {docYes}/6 docs
        </span>
      </td>
      <td className="px-3 py-2.5">
        <button onClick={() => onEdit(student)}
          className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-all
            bg-blue-50 text-blue-700 hover:bg-blue-500 hover:text-white
            dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500 dark:hover:text-white">
          <Edit3 className="w-3 h-3" /> Edit
        </button>
      </td>
    </tr>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function UpdateStudentInfo({ title = 'Student Info-Sheet' }) {
  const [session,   setSession]   = useState('')
  const [cls,       setCls]       = useState('')
  const [regNo,     setRegNo]     = useState('')
  const [loading,   setLoading]   = useState(false)
  const [records,   setRecords]   = useState([])
  const [hasViewed, setHasViewed] = useState(false)
  const [editStudent, setEditStudent] = useState(null)
  const [tableSearch, setTableSearch] = useState('')
  const [page,        setPage]        = useState(1)
  const [toasts,      setToasts]      = useState([])
  const PER_PAGE = 6

  const addToast = (msg, type = 'success') => {
    const id = Date.now()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }

  const handleView = () => {
    setLoading(true)
    setHasViewed(true)
    setPage(1)
    setTimeout(() => {
      let data = [...MOCK_DATA]
      if (session) data = data.filter(s => true)          // filter by session when API ready
      if (cls)     data = data.filter(s => true)          // filter by class when API ready
      if (regNo.trim()) data = data.filter(s => s.admNo.toLowerCase().includes(regNo.toLowerCase()))
      setRecords(data)
      setLoading(false)
    }, 600)
  }

  const handleClear = () => {
    setSession(''); setCls(''); setRegNo('')
    setRecords([]); setHasViewed(false); setTableSearch(''); setPage(1)
  }

  const handleSave = (updated) => {
    setRecords(prev => prev.map(s => s.uid === updated.uid ? updated : s))
    setEditStudent(null)
    addToast(`${updated.firstName} ${updated.lastName}'s record updated successfully!`)
  }

  const filtered = records.filter(s => {
    const q = tableSearch.toLowerCase()
    return !q || s.firstName.toLowerCase().includes(q) || s.admNo.toLowerCase().includes(q) || s.fatherName.toLowerCase().includes(q)
  })
  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="page-animate space-y-4 pb-8">

      {/* ── Page Title ── */}
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Filter students, click <span className="font-semibold text-slate-600 dark:text-slate-300">View Record</span>, then edit any field and save.
        </p>
      </div>

      {/* ── Filter Card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden bg-white dark:bg-[#1a1f35] shadow-sm">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <SlidersHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tracking-tight">Filter Records</span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FilterSel label="Session" value={session} onChange={e => setSession(e.target.value)}>
              <option value="">All Sessions</option>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </FilterSel>
            <FilterSel label="Class" value={cls} onChange={e => setCls(e.target.value)}>
              <option value="">All Classes</option>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </FilterSel>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Registration / Adm. No.
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input value={regNo} onChange={e => setRegNo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleView()}
                  placeholder="e.g. ADM001"
                  className="w-full pl-9 pr-3 py-2 text-[13px] border rounded-lg outline-none transition-all font-medium
                    border-slate-200 bg-white text-slate-800 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400" />
              </div>
            </div>
          </div>
          <div className="flex gap-2.5 mt-4">
            <button onClick={handleView} disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-[13px] font-semibold text-white rounded-lg transition-all active:scale-95
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20
                disabled:opacity-60 disabled:cursor-not-allowed">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading...</>
                : <><Eye className="w-4 h-4" />View Record</>
              }
            </button>
            <button onClick={handleClear}
              className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold rounded-lg transition-colors
                bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-white/[0.1]">
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* ── Records Table ── */}
      {hasViewed && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden bg-white dark:bg-[#1a1f35] shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] flex-wrap gap-y-2">
            <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
            <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tracking-tight flex-1">
              Records
              {records.length > 0 && <span className="ml-2 text-[11px] font-semibold text-slate-400">({filtered.length})</span>}
            </span>
            {records.length > 0 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                <input value={tableSearch} onChange={e => { setTableSearch(e.target.value); setPage(1) }}
                  placeholder="Filter records..."
                  className="pl-7 pr-3 py-1.5 text-[12px] border rounded-lg outline-none w-36 transition-all
                    border-slate-200 bg-white text-slate-700 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500" />
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-14 gap-3">
              <span className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin dark:border-indigo-700 dark:border-t-indigo-400" />
              <span className="text-[13px] text-slate-400 dark:text-slate-500">Loading records...</span>
            </div>
          )}

          {/* Empty */}
          {!loading && records.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
                <Users className="w-7 h-7 text-slate-300 dark:text-slate-600" />
              </div>
              <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">No records found</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">Try changing the filters</p>
            </div>
          )}

          {/* Desktop Table */}
          {!loading && pageData.length > 0 && (
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                    {['#','Student','Roll','Gender','DOB','Blood','Category','Father','Mobile','Docs','Action'].map(h => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((s, i) => <TableRow key={s.uid} student={s} idx={(page-1)*PER_PAGE + i} onEdit={setEditStudent} />)}
                </tbody>
              </table>
            </div>
          )}

          {/* Mobile Cards */}
          {!loading && pageData.length > 0 && (
            <div className="sm:hidden p-4 space-y-3">
              {pageData.map(s => <StudentCard key={s.uid} student={s} onEdit={setEditStudent} />)}
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > PER_PAGE && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5
              border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/60 dark:bg-white/[0.01] flex-wrap">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                {(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({length:totalPages},(_,i)=>i+1).filter(p=>p===1||p===totalPages||Math.abs(p-page)<=1).map((p,i,arr)=>(
                  <span key={p}>
                    {i>0&&arr[i-1]!==p-1&&<span className="text-slate-300 dark:text-slate-600 px-1 text-[12px]">…</span>}
                    <button onClick={()=>setPage(p)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-[12px] font-semibold transition-colors
                        ${page===p ? 'bg-blue-600 text-white dark:bg-indigo-600 shadow-sm' : 'border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]'}`}>
                      {p}
                    </button>
                  </span>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages,p+1))} disabled={page===totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editStudent && <EditModal student={editStudent} onSave={handleSave} onClose={() => setEditStudent(null)} />}

      {/* Toasts */}
      <Toast items={toasts} onRemove={id => setToasts(p => p.filter(t => t.id !== id))} />
    </div>
  )
}
