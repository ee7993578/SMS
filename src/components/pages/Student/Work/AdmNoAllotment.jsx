import { useState, useMemo } from 'react'
import {
  AlertCircle, Search, CheckCircle2, Trash2, CreditCard,
  ChevronDown, ChevronUp, X, GraduationCap, User, Calendar,
  Hash, BookOpen, Layers, Filter, SlidersHorizontal
} from 'lucide-react'

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const SESSIONS = ['2023-24', '2024-25', '2025-26', '2026-27']

const DUMMY_STUDENTS = [
  { uid: 1,  form_no: '1001', name: 'Aarav Sharma',    class: 'Class IX',   class_id: 9,  section_options: ['A','B','C'], stream_options: ['Science','Commerce','Arts'], optional_subjects: ['Maths','Bio','CS'],  dob: '12 Jan 2010', father_name: 'Ramesh Sharma',  status: 'Pending', adm_no: '', fee_book_no: '', adm_date: '', section: '', stream: '', optional_subject: '' },
  { uid: 2,  form_no: '1002', name: 'Priya Verma',     class: 'Class X',    class_id: 10, section_options: ['A','B'],     stream_options: [],                           optional_subjects: [],                   dob: '05 Mar 2009', father_name: 'Suresh Verma',   status: 'Pending', adm_no: '', fee_book_no: '', adm_date: '', section: '', stream: '', optional_subject: '' },
  { uid: 3,  form_no: '1003', name: 'Rohan Gupta',     class: 'Class XI',   class_id: 11, section_options: ['A','B'],     stream_options: ['Science','Commerce','Arts'], optional_subjects: ['Maths','Bio'],       dob: '22 Jul 2008', father_name: 'Vijay Gupta',    status: 'Pending', adm_no: '', fee_book_no: '', adm_date: '', section: '', stream: '', optional_subject: '' },
  { uid: 4,  form_no: '1004', name: 'Sneha Singh',     class: 'Class VI',   class_id: 6,  section_options: ['A','B','C'], stream_options: [],                           optional_subjects: [],                   dob: '15 Aug 2012', father_name: 'Anil Singh',     status: 'Pending', adm_no: '', fee_book_no: '', adm_date: '', section: '', stream: '', optional_subject: '' },
  { uid: 5,  form_no: '1005', name: 'Karan Patel',     class: 'Class XII',  class_id: 12, section_options: ['A','B'],     stream_options: ['Science','Commerce','Arts'], optional_subjects: ['Maths','CS'],        dob: '03 Nov 2007', father_name: 'Dinesh Patel',   status: 'Admitted', adm_no: '5001', fee_book_no: '5001', adm_date: '2025-04-10', section: 'A', stream: 'Science', optional_subject: 'Maths' },
  { uid: 6,  form_no: '1006', name: 'Ananya Mishra',   class: 'Class VII',  class_id: 7,  section_options: ['A','B'],     stream_options: [],                           optional_subjects: [],                   dob: '19 Feb 2011', father_name: 'Rakesh Mishra',  status: 'Pending', adm_no: '', fee_book_no: '', adm_date: '', section: '', stream: '', optional_subject: '' },
  { uid: 7,  form_no: '1007', name: 'Yash Tiwari',     class: 'Class VIII', class_id: 8,  section_options: ['A','B','C'], stream_options: [],                           optional_subjects: [],                   dob: '28 Jun 2010', father_name: 'Manoj Tiwari',   status: 'Pending', adm_no: '', fee_book_no: '', adm_date: '', section: '', stream: '', optional_subject: '' },
  { uid: 8,  form_no: '1008', name: 'Pooja Yadav',     class: 'Class IX',   class_id: 9,  section_options: ['A','B','C'], stream_options: ['Science','Commerce','Arts'], optional_subjects: ['Maths','Bio','CS'],  dob: '11 Sep 2009', father_name: 'Santosh Yadav', status: 'Pending', adm_no: '', fee_book_no: '', adm_date: '', section: '', stream: '', optional_subject: '' },
  { uid: 9,  form_no: '1009', name: 'Amit Chauhan',    class: 'Class V',    class_id: 5,  section_options: ['A','B'],     stream_options: [],                           optional_subjects: [],                   dob: '07 Dec 2013', father_name: 'Sunil Chauhan',  status: 'Pending', adm_no: '', fee_book_no: '', adm_date: '', section: '', stream: '', optional_subject: '' },
  { uid: 10, form_no: '1010', name: 'Divya Joshi',     class: 'Class X',    class_id: 10, section_options: ['A','B'],     stream_options: [],                           optional_subjects: [],                   dob: '14 Apr 2009', father_name: 'Prakash Joshi',  status: 'Pending', adm_no: '', fee_book_no: '', adm_date: '', section: '', stream: '', optional_subject: '' },
  { uid: 11, form_no: '1011', name: 'Nikhil Saxena',   class: 'Class XI',   class_id: 11, section_options: ['A','B'],     stream_options: ['Science','Commerce','Arts'], optional_subjects: ['Maths','CS'],        dob: '30 Jan 2008', father_name: 'Ashok Saxena',  status: 'Pending', adm_no: '', fee_book_no: '', adm_date: '', section: '', stream: '', optional_subject: '' },
  { uid: 12, form_no: '1012', name: 'Riya Agarwal',    class: 'Class III',  class_id: 3,  section_options: ['A','B'],     stream_options: [],                           optional_subjects: [],                   dob: '23 May 2015', father_name: 'Mohit Agarwal', status: 'Pending', adm_no: '', fee_book_no: '', adm_date: '', section: '', stream: '', optional_subject: '' },
]

// ─── UI PRIMITIVES (exact same as StudentRegistration) ────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

function Input({ error, className = '', ...props }) {
  return (
    <input
      className={`w-full px-3 py-1.5 text-[13px] border rounded-md outline-none transition-all
        border-slate-200 bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200
        dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-40 disabled:cursor-not-allowed
        ${error ? 'border-rose-400 dark:border-rose-500' : ''}
        ${className}`}
      {...props}
    />
  )
}

function NativeSelect({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full px-3 py-1.5 text-[13px] border rounded-md outline-none transition-all appearance-none cursor-pointer
        border-slate-200 bg-white text-slate-800
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${className}`}
      {...props}
    >
      {children}
    </select>
  )
}

// ─── AVATAR INITIALS ──────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
  'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300',
]
function Avatar({ name, uid }) {
  const initials = name.split(' ').map(w => w[0]).slice(0, 2).join('')
  const color = AVATAR_COLORS[uid % AVATAR_COLORS.length]
  return (
    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0 ${color}`}>
      {initials}
    </div>
  )
}

// ─── STATUS PILL ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  return status === 'Admitted'
    ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 whitespace-nowrap"><CheckCircle2 className="w-3 h-3" />Admitted</span>
    : <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 whitespace-nowrap">Pending</span>
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, accent }) {
  const accents = {
    blue:    { bg: 'bg-blue-50 dark:bg-blue-900/20',    icon: 'text-blue-500 dark:text-blue-400',    val: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-100 dark:border-blue-500/20' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', icon: 'text-emerald-500 dark:text-emerald-400', val: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-100 dark:border-emerald-500/20' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-900/20',  icon: 'text-amber-500 dark:text-amber-400',  val: 'text-amber-700 dark:text-amber-300',  border: 'border-amber-100 dark:border-amber-500/20' },
    violet:  { bg: 'bg-violet-50 dark:bg-violet-900/20',icon: 'text-violet-500 dark:text-violet-400',val: 'text-violet-700 dark:text-violet-300',border: 'border-violet-100 dark:border-violet-500/20' },
  }
  const a = accents[accent]
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${a.bg} ${a.border}`}>
      <div className={`p-2 rounded-lg bg-white dark:bg-[#1e2238] ${a.icon}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">{label}</p>
        <p className={`text-[16px] font-bold leading-tight ${a.val}`}>{value ?? '—'}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── STUDENT CARD (the main list item) ───────────────────────────────────────
function StudentCard({ student: s, selected, onToggle, onUpdate, idx }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl border transition-all duration-200
      ${selected
        ? 'border-blue-300 dark:border-indigo-500/60 bg-blue-50/40 dark:bg-indigo-500/5 shadow-sm shadow-blue-100 dark:shadow-indigo-900/20'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] hover:border-slate-300 dark:hover:border-[rgba(99,102,241,0.3)]'
      }`}>

      {/* ── Card Header ── */}
      <div className="flex items-start gap-3 p-3 sm:p-4">
        {/* Checkbox */}
        <input type="checkbox" checked={selected} onChange={onToggle}
          className="mt-0.5 accent-blue-600 dark:accent-indigo-400 w-4 h-4 cursor-pointer flex-shrink-0" />

        {/* Avatar */}
        <Avatar name={s.name} uid={s.uid} />

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{s.name}</span>
                <StatusPill status={s.status} />
              </div>
              <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                <span className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <GraduationCap className="w-3 h-3" />{s.class}
                  {s.section && <span className="ml-0.5 font-semibold text-slate-600 dark:text-slate-300">– Sec {s.section}</span>}
                </span>
                <span className="text-[12px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Hash className="w-3 h-3" />Form {s.form_no}
                </span>
                <span className="text-[12px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <User className="w-3 h-3" />{s.father_name}
                </span>
              </div>
            </div>

            {/* Adm badge if already allotted */}
            {s.adm_no && (
              <div className="flex-shrink-0 flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 dark:text-emerald-400">Adm No.</span>
                <span className="text-[15px] font-black text-emerald-600 dark:text-emerald-400">{s.adm_no}</span>
              </div>
            )}
          </div>
        </div>

        {/* Expand toggle */}
        <button onClick={() => setExpanded(p => !p)}
          className="flex-shrink-0 p-1.5 rounded-lg transition-colors
            text-slate-400 hover:text-blue-600 hover:bg-blue-50
            dark:hover:text-indigo-400 dark:hover:bg-indigo-500/10">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* ── Quick row: DOB + Stream + Opt.Sub (visible always, collapses nicely) ── */}
      {!expanded && (s.stream || s.optional_subject) && (
        <div className="px-3 sm:px-4 pb-3 flex flex-wrap gap-2 ml-11">
          {s.stream && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 font-semibold">
              {s.stream}
            </span>
          )}
          {s.optional_subject && (
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 font-semibold">
              {s.optional_subject}
            </span>
          )}
        </div>
      )}

      {/* ── Expanded: Allotment Fields ── */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] mx-3 sm:mx-4 pb-4 pt-3 space-y-3">

          {/* Row 1: Adm No + Fee Book + Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Admission No." required>
              <Input
                value={s.adm_no}
                onChange={e => onUpdate('adm_no', e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 5001"
                maxLength={10}
              />
            </Field>
            <Field label="Fee Book No.">
              <Input
                value={s.fee_book_no}
                onChange={e => onUpdate('fee_book_no', e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 5001"
                maxLength={10}
                disabled={!s.adm_no}
              />
            </Field>
            <Field label="Admission Date">
              <Input
                type="date"
                value={s.adm_date}
                onChange={e => onUpdate('adm_date', e.target.value)}
              />
            </Field>
          </div>

          {/* Row 2: Section + Stream + Optional */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Section">
              <NativeSelect value={s.section} onChange={e => onUpdate('section', e.target.value)}>
                <option value="">-- Select --</option>
                {s.section_options.map(o => <option key={o}>{o}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Stream">
              {s.stream_options.length > 0
                ? <NativeSelect value={s.stream} onChange={e => onUpdate('stream', e.target.value)}>
                    <option value="">-- Select --</option>
                    {s.stream_options.map(o => <option key={o}>{o}</option>)}
                  </NativeSelect>
                : <div className="px-3 py-1.5 text-[13px] rounded-md border
                    border-slate-100 bg-slate-50 text-slate-300
                    dark:border-[rgba(99,102,241,0.1)] dark:bg-[#1e2238]/50 dark:text-slate-600">
                    Not applicable
                  </div>
              }
            </Field>
            <Field label="Optional Subject">
              {s.optional_subjects.length > 0
                ? <NativeSelect value={s.optional_subject} onChange={e => onUpdate('optional_subject', e.target.value)}>
                    <option value="">-- Select --</option>
                    {s.optional_subjects.map(o => <option key={o}>{o}</option>)}
                  </NativeSelect>
                : <div className="px-3 py-1.5 text-[13px] rounded-md border
                    border-slate-100 bg-slate-50 text-slate-300
                    dark:border-[rgba(99,102,241,0.1)] dark:bg-[#1e2238]/50 dark:text-slate-600">
                    Not applicable
                  </div>
              }
            </Field>
          </div>

          {/* Info pills: DOB + Father */}
          <div className="flex flex-wrap gap-2 pt-1">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1e2238]/60 border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">DOB:</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{s.dob}</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#1e2238]/60 border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              <User className="w-3 h-3 text-slate-400" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400">Father:</span>
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">{s.father_name}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdmNoAllotment() {
  const [session,       setSession]       = useState('2025-26')
  const [nameInput,     setNameInput]     = useState('')
  const [formInput,     setFormInput]     = useState('')
  const [searchName,    setSearchName]    = useState('')
  const [searchForm,    setSearchForm]    = useState('')
  const [students,      setStudents]      = useState(DUMMY_STUDENTS)
  const [selected,      setSelected]      = useState([])
  const [toast,         setToast]         = useState(null)
  const [confirmDel,    setConfirmDel]    = useState(false)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [statusFilter,  setStatusFilter]  = useState('All')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Derived stats ──────────────────────────────────────────────────────────
  const admittedList = students.filter(s => s.status === 'Admitted' && s.adm_no)
  const lastAdmNo    = admittedList.length ? Math.max(...admittedList.map(s => parseInt(s.adm_no) || 0)) : null
  const lastFeeNo    = admittedList.length ? Math.max(...admittedList.map(s => parseInt(s.fee_book_no) || 0)) : null

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...students]
    if (searchName)                  list = list.filter(s => s.name.toLowerCase().includes(searchName.toLowerCase()))
    if (searchForm)                  list = list.filter(s => s.form_no.includes(searchForm))
    if (statusFilter !== 'All')      list = list.filter(s => s.status === statusFilter)
    return list
  }, [students, searchName, searchForm, statusFilter])

  // ── Selection ──────────────────────────────────────────────────────────────
  const toggleSelect = uid => setSelected(s => s.includes(uid) ? s.filter(x => x !== uid) : [...s, uid])
  const toggleAll    = () => setSelected(s => s.length === filtered.length ? [] : filtered.map(x => x.uid))
  const anySelected  = selected.length > 0

  // ── Update field ──────────────────────────────────────────────────────────
  const updateStudent = (uid, field, value) =>
    setStudents(prev => prev.map(s => s.uid === uid ? { ...s, [field]: value } : s))

  // ── Admit ──────────────────────────────────────────────────────────────────
  const handleAdmit = () => {
    const uids = anySelected ? selected : filtered.map(s => s.uid)
    const invalid = uids.filter(uid => {
      const s = students.find(x => x.uid === uid)
      return !s?.adm_no?.trim()
    })
    if (invalid.length) { showToast(`Fill Admission No. for all students first`, 'error'); return }
    setStudents(prev => prev.map(s => uids.includes(s.uid) ? { ...s, status: 'Admitted' } : s))
    setSelected([])
    showToast(`${uids.length} student(s) admitted successfully!`)
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = () => {
    if (!anySelected) { showToast('Select students first', 'error'); return }
    setStudents(prev => prev.filter(s => !selected.includes(s.uid)))
    setSelected([])
    setConfirmDel(false)
    showToast(`${selected.length} record(s) removed`)
  }

  const clearFilters = () => {
    setNameInput(''); setFormInput(''); setSearchName(''); setSearchForm(''); setStatusFilter('All')
  }

  return (
    <div className="page-animate space-y-4 pb-8">

      {/* ── Toast ── */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-[13px] font-semibold
          ${toast.type === 'error' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      {/* ── Confirm Delete Modal ── */}
      {confirmDel && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h3 className="font-display text-[16px] font-bold text-slate-800 dark:text-slate-100 mb-2">Confirm Delete</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-5">
              Remove {selected.length} selected record(s)? This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDel(false)}
                className="px-4 py-2 text-[13px] font-semibold rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="px-4 py-2 text-[13px] font-semibold rounded-xl bg-rose-500 text-white hover:bg-rose-600">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Title ── */}
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">Admission No. Allotment</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Allot admission numbers to registered students for session <span className="font-semibold text-slate-600 dark:text-slate-300">{session}</span>
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Session"        value={session}            icon={BookOpen}    accent="blue"    />
        <StatCard label="Total Students" value={students.length}    icon={GraduationCap} accent="violet" />
        <StatCard label="Last Adm. No."  value={lastAdmNo}          icon={Hash}        accent="amber"   />
        <StatCard label="Admitted"       value={admittedList.length} icon={CheckCircle2} accent="emerald" sub={`of ${students.length} students`} />
      </div>

      {/* ── Session selector + Filter toggle ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex-shrink-0 w-44">
          <NativeSelect value={session} onChange={e => setSession(e.target.value)}>
            {SESSIONS.map(s => <option key={s}>{s}</option>)}
          </NativeSelect>
        </div>
        <button onClick={() => setFilterOpen(p => !p)}
          className={`flex items-center gap-2 px-3 py-1.5 text-[13px] font-semibold rounded-lg border transition-colors
            ${filterOpen
              ? 'bg-blue-50 border-blue-300 text-blue-700 dark:bg-indigo-500/10 dark:border-indigo-500/40 dark:text-indigo-300'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.2)] dark:text-slate-400'
            }`}>
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Filters
          {(searchName || searchForm || statusFilter !== 'All') && (
            <span className="ml-0.5 w-4 h-4 rounded-full bg-blue-500 dark:bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
              {[searchName, searchForm, statusFilter !== 'All'].filter(Boolean).length}
            </span>
          )}
        </button>
        {(searchName || searchForm || statusFilter !== 'All') && (
          <button onClick={clearFilters}
            className="flex items-center gap-1 text-[12px] font-semibold text-rose-500 hover:text-rose-700 dark:hover:text-rose-400 transition-colors">
            <X className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      {/* ── Filter Panel ── */}
      {filterOpen && (
        <div className="rounded-xl border bg-white dark:bg-[#1a1f35] border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Search by Student Name">
              <div className="relative">
                <Input
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setSearchName(nameInput)}
                  placeholder="Name & press Enter"
                  className="pr-9"
                />
                <button onClick={() => setSearchName(nameInput)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-500 dark:hover:text-indigo-400">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </Field>
            <Field label="Search by Form No.">
              <div className="relative">
                <Input
                  value={formInput}
                  onChange={e => setFormInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && setSearchForm(formInput)}
                  placeholder="Form No & press Enter"
                  className="pr-9"
                />
                <button onClick={() => setSearchForm(formInput)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-500 dark:hover:text-indigo-400">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </Field>
            <Field label="Status">
              <NativeSelect value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="All">All Students</option>
                <option value="Pending">Pending</option>
                <option value="Admitted">Admitted</option>
              </NativeSelect>
            </Field>
          </div>
        </div>
      )}

      {/* ── List Header ── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox"
              checked={filtered.length > 0 && selected.length === filtered.length}
              onChange={toggleAll}
              className="accent-blue-600 dark:accent-indigo-400 w-4 h-4 cursor-pointer" />
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">
              {anySelected ? `${selected.length} selected` : 'Select all'}
            </span>
          </label>
          <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {filtered.length} records
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Click a card to expand & allot</span>
        </div>
      </div>

      {/* ── Student Cards ── */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
          <GraduationCap className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-slate-400 dark:text-slate-500">No students found</p>
          <p className="text-[12px] text-slate-300 dark:text-slate-600 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((s, idx) => (
            <StudentCard
              key={s.uid}
              student={s}
              idx={idx}
              selected={selected.includes(s.uid)}
              onToggle={() => toggleSelect(s.uid)}
              onUpdate={(field, value) => updateStudent(s.uid, field, value)}
            />
          ))}
        </div>
      )}

      {/* ── Action Bar ── */}
      <div className="sticky bottom-4 mt-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-2xl border shadow-xl
          bg-white/90 backdrop-blur-md border-slate-200
          dark:bg-[#1a1f35]/90 dark:border-[rgba(99,102,241,0.2)]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500 text-center sm:text-left">
            {anySelected
              ? <><span className="font-bold text-blue-600 dark:text-indigo-400">{selected.length}</span> student(s) selected</>
              : 'Expand a card ↑ to enter Adm. No., then admit'}
          </p>
          <div className="flex gap-2 flex-wrap justify-center sm:justify-end">
            {anySelected && (
              <button onClick={() => setConfirmDel(true)}
                className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold rounded-xl transition-colors
                  bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200
                  dark:bg-rose-900/20 dark:text-rose-400 dark:hover:bg-rose-900/30 dark:border-rose-500/30">
                <Trash2 className="w-4 h-4" /> Remove
              </button>
            )}
            <button onClick={handleAdmit}
              className="flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold rounded-xl transition-all active:scale-95
                bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/25">
              <CheckCircle2 className="w-4 h-4" />
              {anySelected ? `Admit (${selected.length})` : 'Admit All'}
            </button>
            <button
              className="flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold rounded-xl transition-all active:scale-95
                bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20">
              <CreditCard className="w-4 h-4" /> Deposit Fee
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}