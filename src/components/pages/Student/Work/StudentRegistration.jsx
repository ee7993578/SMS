import { useState, useRef } from 'react'
import { ChevronDown, Upload, Camera, AlertCircle, Save, Printer, X, Check, GraduationCap, User, Users, CreditCard, Heart, FileText, Building2, Sparkles } from 'lucide-react'

// ─── DATA ─────────────────────────────────────────────────────────────────────
const CLASSES     = ['Nursery','LKG','UKG','Class I','Class II','Class III','Class IV','Class V','Class VI','Class VII','Class VIII','Class IX','Class X','Class XI','Class XII']
const SESSIONS    = ['2024-25','2025-26','2026-27']
const STUD_TYPES  = ['Regular','New Admission','Transfer','RTE']
const MOP         = ['Cash','Cheque','Online','DD']
const BLOOD       = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const RELIGIONS   = ['Hindu','Muslim','Christian','Sikh','Jain','Buddhist','Other']
const CATEGORIES  = ['General','OBC','SC','ST','EWS']
const QUOTAS      = ['None','Sports','NCC','Management','Staff Ward','RTE']
const OCCUPATIONS = ['Business','Service','Farming','Doctor','Engineer','Lawyer','Teacher','Other']
const STATES      = ['Uttar Pradesh','Delhi','Maharashtra','Bihar','Rajasthan','Madhya Pradesh','Gujarat','Punjab','Haryana','Uttarakhand']
const CITIES      = {
  'Uttar Pradesh': ['Meerut','Lucknow','Agra','Varanasi','Kanpur','Prayagraj','Noida','Ghaziabad'],
  'Delhi':         ['New Delhi','Dwarka','Rohini','Pitampura'],
  'Maharashtra':   ['Mumbai','Pune','Nagpur','Nashik'],
  'Bihar':         ['Patna','Gaya','Muzaffarpur'],
  'Rajasthan':     ['Jaipur','Jodhpur','Udaipur'],
  'Madhya Pradesh':['Bhopal','Indore','Gwalior'],
  'Gujarat':       ['Ahmedabad','Surat','Vadodara'],
  'Punjab':        ['Amritsar','Ludhiana','Chandigarh'],
  'Haryana':       ['Gurugram','Faridabad','Hisar'],
  'Uttarakhand':   ['Dehradun','Haridwar','Nainital'],
}
const BANKS       = ['SBI','HDFC Bank','ICICI Bank','PNB','Bank of Baroda','Axis Bank','Canara Bank','Union Bank']
const AFFILIATIONS= ['CBSE','ICSE','U.P. BOARD','Other']
const GROUPS      = ['Alaabhit Samooh','Durbal Varg']
const PREV_CLASSES= ['Nursery','LKG','UKG','Class I','Class II','Class III','Class IV','Class V','Class VI','Class VII','Class VIII','Class IX','Class X','Class XI','Class XII']
const DOCUMENTS   = ['Transfer Certificate','Birth Certificate','Marksheet','Migration Certificate','Aadhar Card','Caste Certificate']
const MONTHS      = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS        = Array.from({ length: 31 }, (_, i) => i + 1)
const YEARS       = Array.from({ length: 30 }, (_, i) => 2015 - i)

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
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

// ─── INPUT ────────────────────────────────────────────────────────────────────
function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-1.5 text-[13px] border rounded-md outline-none transition-all
        border-slate-200 bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200
        dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${error ? 'border-rose-400 dark:border-rose-500' : ''} ${className}`}
      {...props}
    />
  )
}

// ─── NATIVE SELECT ────────────────────────────────────────────────────────────
function NativeSelect({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-3 py-1.5 text-[13px] border rounded-md outline-none transition-all appearance-none cursor-pointer
        border-slate-200 bg-white text-slate-800
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20 ${className}`}
      {...props}
    >{children}</select>
  )
}

// ─── IMAGE UPLOADER ───────────────────────────────────────────────────────────
function ImageUploader({ label }) {
  const [preview, setPreview] = useState(null)
  const ref = useRef()
  return (
    <div className="flex flex-col items-center gap-2 p-4 border-2 border-dashed rounded-xl transition-colors
      border-slate-200 dark:border-[rgba(99,102,241,0.2)]
      hover:border-blue-300 dark:hover:border-indigo-400 bg-slate-50 dark:bg-[#1a1f35]">
      <div onClick={() => ref.current.click()}
        className="w-20 h-20 rounded-xl overflow-hidden cursor-pointer flex items-center justify-center border transition-colors group
          border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238]
          hover:border-blue-300 dark:hover:border-indigo-400">
        {preview
          ? <img src={preview} alt="preview" className="w-full h-full object-cover" />
          : <Camera className="w-7 h-7 text-slate-300 dark:text-slate-600 group-hover:text-blue-400 dark:group-hover:text-indigo-400 transition-colors" />
        }
      </div>
      <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <button type="button" onClick={() => ref.current.click()}
        className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold rounded-lg transition-colors
          bg-blue-50 text-blue-600 hover:bg-blue-100
          dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500/20">
        <Upload className="w-3 h-3" /> Upload
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={e => {
        const f = e.target.files[0]
        if (f) setPreview(URL.createObjectURL(f))
      }} />
    </div>
  )
}

// ─── SECTION DIVIDER ──────────────────────────────────────────────────────────
function SectionDivider({ label }) {
  return (
    <div className="flex items-center gap-3 my-2">
      <div className="h-px flex-1 bg-slate-100 dark:bg-[rgba(99,102,241,0.15)]" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</span>
      <div className="h-px flex-1 bg-slate-100 dark:bg-[rgba(99,102,241,0.15)]" />
    </div>
  )
}

// ─── PARENT SECTION ───────────────────────────────────────────────────────────
function ParentSection({ title, accent, fields }) {
  return (
    <div className="rounded-xl border overflow-hidden border-slate-200 dark:border-[rgba(99,102,241,0.2)]">
      <div className={`px-4 py-2.5 border-b flex items-center gap-2
        border-slate-200 dark:border-[rgba(99,102,241,0.2)]
        ${accent === 'blue' ? 'bg-blue-50/60 dark:bg-blue-900/10' : 'bg-pink-50/60 dark:bg-pink-900/10'}`}>
        <div className={`w-1 h-4 rounded-full ${accent === 'blue' ? 'bg-blue-500' : 'bg-pink-500'}`} />
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
      </div>
      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields}
      </div>
    </div>
  )
}

// ─── COLLAPSIBLE SECTION CARD ─────────────────────────────────────────────────
const ACCENT_MAP = {
  blue:    { bar: 'bg-blue-500',    icon: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',    ring: 'border-blue-100 dark:border-blue-500/10' },
  violet:  { bar: 'bg-violet-500',  icon: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400', ring: 'border-violet-100 dark:border-violet-500/10' },
  rose:    { bar: 'bg-rose-500',    icon: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',    ring: 'border-rose-100 dark:border-rose-500/10' },
  emerald: { bar: 'bg-emerald-500', icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400', ring: 'border-emerald-100 dark:border-emerald-500/10' },
  amber:   { bar: 'bg-amber-500',   icon: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400', ring: 'border-amber-100 dark:border-amber-500/10' },
  sky:     { bar: 'bg-sky-500',     icon: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',        ring: 'border-sky-100 dark:border-sky-500/10' },
  purple:  { bar: 'bg-purple-500',  icon: 'bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400', ring: 'border-purple-100 dark:border-purple-500/10' },
}

function CollapsibleCard({ icon: Icon, title, badge, accent = 'blue', open, onToggle, children }) {
  const a = ACCENT_MAP[accent]
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden bg-white dark:bg-[#1a1f35] shadow-sm">
      {/* Header — always visible, click to toggle */}
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center gap-3 px-4 sm:px-5 py-3.5 transition-colors text-left
          bg-slate-50/70 dark:bg-white/[0.03] hover:bg-slate-100/70 dark:hover:bg-white/[0.05]
          ${open ? `border-b ${a.ring}` : ''}`}
      >
        {/* Accent bar */}
        <span className={`w-1 h-5 rounded-full flex-shrink-0 ${a.bar}`} />

        {/* Icon */}
        <span className={`p-1.5 rounded-lg flex-shrink-0 ${a.icon}`}>
          <Icon className="w-3.5 h-3.5" />
        </span>

        {/* Title */}
        <span className="flex-1 text-[13px] font-bold text-slate-700 dark:text-slate-200 tracking-tight">
          {title}
        </span>

        {/* Badge */}
        {badge && (
          <span className="hidden sm:inline-flex text-[11px] font-medium text-slate-400 dark:text-slate-500 mr-1">
            {badge}
          </span>
        )}

        {/* Chevron — small and subtle */}
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Body */}
      {open && (
        <div className="p-4 sm:p-5">
          {children}
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function StudentRegistration({ title = 'Student Registration' }) {
  const [form, setForm] = useState({
    formNo: '', class_: '', session: '2025-26', studType: 'Regular',
    mop: 'Cash', regFee: '500', regDate: new Date().toISOString().split('T')[0],
    firstName: '', middleName: '', lastName: '',
    dobDay: '', dobMonth: '', dobYear: '',
    gender: 'Male', blood: '', religion: '', category: '', quota: 'None', ncc: '0',
    address: '', state: 'Uttar Pradesh', city: '', pin: '', aadhar: '', group: '',
    fName: '', fQual: '', fOcc: '', fMobile: '', fEmail: '', fAadhar: '', fIncome: '', fWa: '',
    mName: '', mQual: '', mOcc: '', mMobile: '', mEmail: '', mAadhar: '', mIncome: '', mWa: '',
    accHolder: '', bank: '', branch: '', accType: '', accNo: '', ifsc: '',
    sibAdm: '', sibName: '', sibClass: '', sibSection: '',
    docs: [],
    prevSchool: '', affiliation: '', udise: '', pen: '', apaar: '', remark: '', prevClass: [],
  })

  const [errors, setErrors]                   = useState({})
  const [submitted, setSubmitted]             = useState(false)
  const [showClassPicker, setShowClassPicker] = useState(false)
  // Accordion: only one section open at a time; section 1 open by default
  const [openSection, setOpenSection]         = useState(1)
  const toggle = (n) => setOpenSection(prev => prev === n ? null : n)

  const set  = k => e => setForm(p => ({ ...p, [k]: e.target.value }))
  const setV = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const toggleDoc = v => setForm(p => ({
    ...p, docs: p.docs.includes(v) ? p.docs.filter(d => d !== v) : [...p.docs, v]
  }))
  const togglePC = cls => setForm(p => ({
    ...p, prevClass: p.prevClass.includes(cls) ? p.prevClass.filter(c => c !== cls) : [...p.prevClass, cls]
  }))

  const validate = () => {
    const e = {}
    if (!form.formNo.trim())    e.formNo    = 'Required'
    if (!form.class_)           e.class_    = 'Required'
    if (!form.firstName.trim()) e.firstName = 'Required'
    if (!form.regDate)          e.regDate   = 'Required'
    if (!form.regFee.trim())    e.regFee    = 'Required'
    if (form.fEmail  && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.fEmail))  e.fEmail  = 'Invalid email'
    if (form.mEmail  && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(form.mEmail))  e.mEmail  = 'Invalid email'
    if (form.fMobile && !/^\d{10}$/.test(form.fMobile)) e.fMobile = '10 digits only'
    if (form.mMobile && !/^\d{10}$/.test(form.mMobile)) e.mMobile = '10 digits only'
    if (form.fWa     && !/^\d{10}$/.test(form.fWa))     e.fWa     = '10 digits only'
    if (form.mWa     && !/^\d{10}$/.test(form.mWa))     e.mWa     = '10 digits only'
    if (form.aadhar  && !/^\d{12}$/.test(form.aadhar))  e.aadhar  = '12 digits only'
    if (form.fAadhar && !/^\d{12}$/.test(form.fAadhar)) e.fAadhar = '12 digits only'
    if (form.mAadhar && !/^\d{12}$/.test(form.mAadhar)) e.mAadhar = '12 digits only'
    if (form.pin     && !/^\d{6}$/.test(form.pin))      e.pin     = '6 digits only'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = e => {
    e.preventDefault()
    if (validate()) setSubmitted(true)
  }

  const cities = CITIES[form.state] || []

  // ── Success Screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="page-animate flex flex-col items-center justify-center py-20 gap-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
          <Check className="w-8 h-8 text-emerald-600" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-[18px] font-bold text-slate-800 dark:text-slate-100">Registration Submitted!</h2>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
            Form No: <span className="font-semibold text-blue-600 dark:text-indigo-400">{form.formNo}</span>
            &nbsp;|&nbsp;{form.firstName} {form.middleName} {form.lastName}
          </p>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">{form.class_} · Session {form.session}</p>
        </div>
        <div className="flex gap-3 flex-wrap justify-center">
          <button type="button"
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold rounded-xl transition-colors
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
            <Printer className="w-4 h-4" /> Print Form
          </button>
          <button type="button"
            onClick={() => { setSubmitted(false); setV('formNo', ''); setOpenSection(1) }}
            className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold rounded-xl text-white transition-all
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-lg shadow-blue-500/20">
            <Sparkles className="w-4 h-4" /> New Registration
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page-animate space-y-4 pb-8">

      {/* Page Title */}
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          Fill all details carefully. Fields marked <span className="text-rose-500 font-bold">*</span> are mandatory.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-3">

        {/* ══ 1. ADMISSION DETAIL ══════════════════════════════════════════ */}
        <CollapsibleCard icon={GraduationCap} title="Admission Detail" badge="Form no, class & fee" accent="blue" open={openSection === 1} onToggle={() => toggle(1)}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
            <Field label="Form No." required error={errors.formNo}>
              <Input value={form.formNo} onChange={e => setV('formNo', e.target.value.replace(/\D/g,''))} placeholder="e.g. 1001" maxLength={10} error={errors.formNo} />
            </Field>
            <Field label="Class" required error={errors.class_}>
              <NativeSelect value={form.class_} onChange={set('class_')} className={errors.class_ ? 'border-rose-400 dark:border-rose-500' : ''}>
                <option value="">-- Select --</option>
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Session">
              <NativeSelect value={form.session} onChange={set('session')}>
                {SESSIONS.map(s => <option key={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Student Type">
              <NativeSelect value={form.studType} onChange={set('studType')}>
                {STUD_TYPES.map(t => <option key={t}>{t}</option>)}
              </NativeSelect>
            </Field>
            <Field label="MOP" required>
              <NativeSelect value={form.mop} onChange={set('mop')}>
                {MOP.map(m => <option key={m}>{m}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Reg. Fee" required error={errors.regFee}>
              <Input value={form.regFee} onChange={e => setV('regFee', e.target.value.replace(/[^0-9.]/g,''))} placeholder="500" error={errors.regFee} />
            </Field>
            <Field label="Reg. Date" required error={errors.regDate}>
              <Input type="date" value={form.regDate} onChange={set('regDate')} error={errors.regDate} />
            </Field>
          </div>
        </CollapsibleCard>

        {/* ══ 2. STUDENT BASIC DETAIL ══════════════════════════════════════ */}
        <CollapsibleCard icon={User} title="Student Basic Detail" badge="Name, DOB, address & photos" accent="violet" open={openSection === 2} onToggle={() => toggle(2)}>
          <div className="space-y-4">
            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="First Name" required error={errors.firstName}>
                <Input value={form.firstName} onChange={e => setV('firstName', e.target.value.replace(/[^a-zA-Z ]/g,''))} placeholder="First name" error={errors.firstName} />
              </Field>
              <Field label="Middle Name">
                <Input value={form.middleName} onChange={e => setV('middleName', e.target.value.replace(/[^a-zA-Z ]/g,''))} placeholder="Middle name" />
              </Field>
              <Field label="Last Name">
                <Input value={form.lastName} onChange={e => setV('lastName', e.target.value.replace(/[^a-zA-Z ]/g,''))} placeholder="Last name" />
              </Field>
            </div>

            {/* DOB + personal */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              <div className="col-span-2">
                <Field label="Date of Birth">
                  <div className="flex gap-2">
                    <NativeSelect value={form.dobDay}   onChange={set('dobDay')}   className="flex-1">
                      <option value="">Day</option>
                      {DAYS.map(d => <option key={d}>{d}</option>)}
                    </NativeSelect>
                    <NativeSelect value={form.dobMonth} onChange={set('dobMonth')} className="flex-1">
                      <option value="">Month</option>
                      {MONTHS.map((m, i) => <option key={m} value={i+1}>{m}</option>)}
                    </NativeSelect>
                    <NativeSelect value={form.dobYear}  onChange={set('dobYear')}  className="flex-1">
                      <option value="">Year</option>
                      {YEARS.map(y => <option key={y}>{y}</option>)}
                    </NativeSelect>
                  </div>
                </Field>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Gender</label>
                <div className="flex gap-4 h-[34px] items-center">
                  {['Male','Female'].map(g => (
                    <label key={g} className="flex items-center gap-1.5 cursor-pointer">
                      <input type="radio" name="gender" value={g} checked={form.gender === g}
                        onChange={() => setV('gender', g)} className="accent-blue-600 dark:accent-indigo-400 w-4 h-4" />
                      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{g}</span>
                    </label>
                  ))}
                </div>
              </div>
              <Field label="Blood Group">
                <NativeSelect value={form.blood} onChange={set('blood')}>
                  <option value="">-- Select --</option>
                  {BLOOD.map(b => <option key={b}>{b}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Religion">
                <NativeSelect value={form.religion} onChange={set('religion')}>
                  <option value="">-- Select --</option>
                  {RELIGIONS.map(r => <option key={r}>{r}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Category">
                <NativeSelect value={form.category} onChange={set('category')}>
                  <option value="">-- Select --</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Quota">
                <NativeSelect value={form.quota} onChange={set('quota')}>
                  {QUOTAS.map(q => <option key={q}>{q}</option>)}
                </NativeSelect>
              </Field>
              <Field label="NCC">
                <NativeSelect value={form.ncc} onChange={set('ncc')}>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </NativeSelect>
              </Field>
              <Field label="Group">
                <NativeSelect value={form.group} onChange={set('group')}>
                  <option value="">-- Select --</option>
                  {GROUPS.map(g => <option key={g}>{g}</option>)}
                </NativeSelect>
              </Field>
            </div>

            <SectionDivider label="Address" />

            {/* Address */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="col-span-2">
                <Field label="Address">
                  <Input value={form.address} onChange={set('address')} placeholder="Full address" />
                </Field>
              </div>
              <Field label="State">
                <NativeSelect value={form.state} onChange={e => { setV('state', e.target.value); setV('city','') }}>
                  {STATES.map(s => <option key={s}>{s}</option>)}
                </NativeSelect>
              </Field>
              <Field label="City">
                <NativeSelect value={form.city} onChange={set('city')}>
                  <option value="">-- Select --</option>
                  {cities.map(c => <option key={c}>{c}</option>)}
                </NativeSelect>
              </Field>
              <Field label="PIN Code" error={errors.pin}>
                <Input value={form.pin} onChange={e => setV('pin', e.target.value.replace(/\D/g,''))} placeholder="110001" maxLength={6} error={errors.pin} />
              </Field>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Field label="Student Aadhar No." error={errors.aadhar}>
                <Input value={form.aadhar} onChange={e => setV('aadhar', e.target.value.replace(/\D/g,''))} placeholder="12-digit Aadhar" maxLength={12} error={errors.aadhar} />
              </Field>
            </div>

            <SectionDivider label="Photo Upload" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <ImageUploader label="Student Photo" />
              <ImageUploader label="Father Photo" />
              <ImageUploader label="Mother Photo" />
            </div>
          </div>
        </CollapsibleCard>

        {/* ══ 3. PARENT DETAILS ════════════════════════════════════════════ */}
        <CollapsibleCard icon={Users} title="Parent Details" badge="Father & mother information" accent="rose" open={openSection === 3} onToggle={() => toggle(3)}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ParentSection title="Father's Detail" accent="blue" fields={<>
              <Field label="Name"><Input value={form.fName} onChange={e => setV('fName', e.target.value.replace(/[^a-zA-Z .]/g,''))} placeholder="Father's full name" /></Field>
              <Field label="Qualification"><Input value={form.fQual} onChange={set('fQual')} placeholder="e.g. B.Tech" /></Field>
              <Field label="Occupation"><NativeSelect value={form.fOcc} onChange={set('fOcc')}><option value="">-- Select --</option>{OCCUPATIONS.map(o=><option key={o}>{o}</option>)}</NativeSelect></Field>
              <Field label="Mobile No." error={errors.fMobile}><Input value={form.fMobile} onChange={e=>setV('fMobile',e.target.value.replace(/\D/g,''))} placeholder="10-digit" maxLength={10} error={errors.fMobile}/></Field>
              <Field label="Email Id" error={errors.fEmail}><Input type="email" value={form.fEmail} onChange={set('fEmail')} placeholder="father@email.com" error={errors.fEmail}/></Field>
              <Field label="Aadhar No." error={errors.fAadhar}><Input value={form.fAadhar} onChange={e=>setV('fAadhar',e.target.value.replace(/\D/g,''))} placeholder="12-digit" maxLength={12} error={errors.fAadhar}/></Field>
              <Field label="Annual Income"><Input value={form.fIncome} onChange={set('fIncome')} placeholder="e.g. 500000"/></Field>
              <Field label="WhatsApp No." error={errors.fWa}><Input value={form.fWa} onChange={e=>setV('fWa',e.target.value.replace(/\D/g,''))} placeholder="10-digit" maxLength={10} error={errors.fWa}/></Field>
            </>} />
            <ParentSection title="Mother's Detail" accent="pink" fields={<>
              <Field label="Name"><Input value={form.mName} onChange={e=>setV('mName',e.target.value.replace(/[^a-zA-Z .]/g,''))} placeholder="Mother's full name"/></Field>
              <Field label="Qualification"><Input value={form.mQual} onChange={set('mQual')} placeholder="e.g. M.A."/></Field>
              <Field label="Occupation"><NativeSelect value={form.mOcc} onChange={set('mOcc')}><option value="">-- Select --</option>{OCCUPATIONS.map(o=><option key={o}>{o}</option>)}</NativeSelect></Field>
              <Field label="Mobile No." error={errors.mMobile}><Input value={form.mMobile} onChange={e=>setV('mMobile',e.target.value.replace(/\D/g,''))} placeholder="10-digit" maxLength={10} error={errors.mMobile}/></Field>
              <Field label="Email Id" error={errors.mEmail}><Input type="email" value={form.mEmail} onChange={set('mEmail')} placeholder="mother@email.com" error={errors.mEmail}/></Field>
              <Field label="Aadhar No." error={errors.mAadhar}><Input value={form.mAadhar} onChange={e=>setV('mAadhar',e.target.value.replace(/\D/g,''))} placeholder="12-digit" maxLength={12} error={errors.mAadhar}/></Field>
              <Field label="Annual Income"><Input value={form.mIncome} onChange={set('mIncome')} placeholder="e.g. 300000"/></Field>
              <Field label="WhatsApp No." error={errors.mWa}><Input value={form.mWa} onChange={e=>setV('mWa',e.target.value.replace(/\D/g,''))} placeholder="10-digit" maxLength={10} error={errors.mWa}/></Field>
            </>} />
          </div>
        </CollapsibleCard>

        {/* ══ 4. BANK DETAIL ═══════════════════════════════════════════════ */}
        <CollapsibleCard icon={CreditCard} title="Parents Bank Account Detail" badge="Scholarship / refund account" accent="emerald" open={openSection === 4} onToggle={() => toggle(4)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Account Holder Name"><Input value={form.accHolder} onChange={e=>setV('accHolder',e.target.value.replace(/[^a-zA-Z .]/g,''))} placeholder="As per bank records"/></Field>
            <Field label="Bank Name"><NativeSelect value={form.bank} onChange={set('bank')}><option value="">-- Select --</option>{BANKS.map(b=><option key={b}>{b}</option>)}</NativeSelect></Field>
            <Field label="Branch"><Input value={form.branch} onChange={set('branch')} placeholder="Branch name"/></Field>
            <Field label="Account Type"><NativeSelect value={form.accType} onChange={set('accType')}><option value="">-- Select --</option><option>Saving</option><option>Current</option></NativeSelect></Field>
            <Field label="Account No."><Input value={form.accNo} onChange={e=>setV('accNo',e.target.value.replace(/\D/g,''))} placeholder="Account number"/></Field>
            <Field label="IFSC Code"><Input value={form.ifsc} onChange={e=>setV('ifsc',e.target.value.toUpperCase())} placeholder="e.g. SBIN0001234"/></Field>
          </div>
        </CollapsibleCard>

        {/* ══ 5. SIBLINGS ══════════════════════════════════════════════════ */}
        <CollapsibleCard icon={Heart} title="Siblings Information" badge="If sibling already enrolled" accent="amber" open={openSection === 5} onToggle={() => toggle(5)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Admission No."><Input value={form.sibAdm} onChange={set('sibAdm')} placeholder="Enter Adm. No."/></Field>
            <Field label="Student Name"><Input value={form.sibName} onChange={set('sibName')} placeholder="Auto-filled"/></Field>
            <Field label="Class"><Input value={form.sibClass} onChange={set('sibClass')} placeholder="Auto-filled"/></Field>
            <Field label="Section"><Input value={form.sibSection} onChange={set('sibSection')} placeholder="Auto-filled"/></Field>
          </div>
        </CollapsibleCard>

        {/* ══ 6. DOCUMENTS ═════════════════════════════════════════════════ */}
        <CollapsibleCard icon={FileText} title="Documents Submitted" badge={`${form.docs.length} of ${DOCUMENTS.length} selected`} accent="sky" open={openSection === 6} onToggle={() => toggle(6)}>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {DOCUMENTS.map(doc => (
              <label key={doc}
                onClick={() => toggleDoc(doc)}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all select-none text-center
                  ${form.docs.includes(doc)
                    ? 'border-blue-400 bg-blue-50 text-blue-700 dark:border-indigo-500 dark:bg-indigo-500/10 dark:text-indigo-300'
                    : 'border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1a1f35] dark:text-slate-400 dark:hover:border-indigo-400/50'
                  }`}>
                <input type="checkbox" checked={form.docs.includes(doc)} onChange={() => toggleDoc(doc)} className="hidden" />
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-all
                  ${form.docs.includes(doc) ? 'bg-blue-500 border-blue-500 dark:bg-indigo-500 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                  {form.docs.includes(doc) && (
                    <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
                      <polyline points="1.5,5 4,7.5 8.5,2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                    </svg>
                  )}
                </div>
                <span className="text-[11px] font-medium leading-tight">{doc}</span>
              </label>
            ))}
          </div>
        </CollapsibleCard>

        {/* ══ 7. PREVIOUS SCHOOL ═══════════════════════════════════════════ */}
        <CollapsibleCard icon={Building2} title="Previous School Detail" badge="Transfer / migration info" accent="purple" open={openSection === 7} onToggle={() => toggle(7)}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Previous School Name"><Input value={form.prevSchool} onChange={set('prevSchool')} placeholder="School name"/></Field>
            <Field label="Affiliation"><NativeSelect value={form.affiliation} onChange={set('affiliation')}><option value="">-- Select --</option>{AFFILIATIONS.map(a=><option key={a}>{a}</option>)}</NativeSelect></Field>
            <Field label="UDISE Code"><Input value={form.udise} onChange={set('udise')} placeholder="School UDISE code"/></Field>
            <Field label="PEN No."><Input value={form.pen} onChange={set('pen')} placeholder="PEN number"/></Field>
            <Field label="APAAR ID"><Input value={form.apaar} onChange={set('apaar')} placeholder="APAAR ID"/></Field>

            {/* Multi-class picker */}
            <Field label="Previous Class">
              <div className="relative">
                <button type="button" onClick={() => setShowClassPicker(p => !p)}
                  className="w-full px-3 py-1.5 text-[13px] border rounded-md outline-none flex items-center justify-between transition-all
                    border-slate-200 bg-white text-slate-800 hover:border-blue-400
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:hover:border-indigo-400">
                  <span className={form.prevClass.length === 0 ? 'text-slate-400 dark:text-slate-500' : ''}>
                    {form.prevClass.length > 0 ? form.prevClass.join(', ') : '-- Select --'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 flex-shrink-0 text-slate-400"/>
                </button>
                {showClassPicker && (
                  <div className="absolute top-full left-0 mt-1 z-30 rounded-xl border shadow-xl p-3 w-72
                    bg-white border-slate-200 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.3)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Select Class(es)</span>
                      <button type="button" onClick={() => setShowClassPicker(false)}>
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"/>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {PREV_CLASSES.map(cls => (
                        <button key={cls} type="button" onClick={() => togglePC(cls)}
                          className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-all
                            ${form.prevClass.includes(cls)
                              ? 'bg-blue-500 border-blue-500 text-white dark:bg-indigo-600 dark:border-indigo-600'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-400'
                            }`}>
                          {cls}
                        </button>
                      ))}
                    </div>
                    <button type="button" onClick={() => setShowClassPicker(false)}
                      className="mt-3 w-full py-1.5 rounded-lg text-[12px] font-semibold text-white transition-colors
                        bg-blue-500 hover:bg-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                      Done
                    </button>
                  </div>
                )}
              </div>
            </Field>

            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Remark"><Input value={form.remark} onChange={set('remark')} placeholder="Any remarks..."/></Field>
            </div>
          </div>
        </CollapsibleCard>

        {/* ══ SUBMIT BAR ═══════════════════════════════════════════════════ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 rounded-2xl border
          bg-white border-slate-200 dark:bg-[#1a1f35] dark:border-[rgba(99,102,241,0.2)]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Fields marked <span className="text-rose-500 font-bold">*</span> are required · All data saved on submit
          </p>
          <div className="flex gap-3 w-full sm:w-auto">
            <button type="button"
              onClick={() => { setForm(p => ({...p, formNo:'', class_:'', firstName:''})); setErrors({}) }}
              className="flex-1 sm:flex-none px-5 py-2 text-[13px] font-semibold rounded-xl transition-colors
                bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              Reset
            </button>
            <button type="submit"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-2 text-[13px] font-semibold text-white rounded-xl transition-all active:scale-95
                bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20">
              <Save className="w-4 h-4"/> Submit Registration
            </button>
          </div>
        </div>

      </form>
    </div>
  )
}
