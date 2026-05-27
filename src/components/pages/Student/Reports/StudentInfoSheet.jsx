import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Search, Download, FileSpreadsheet, RefreshCw, Filter,
  ChevronDown, ChevronUp, Check, X, Eye, SlidersHorizontal,
  Users, GraduationCap, ChevronLeft, ChevronRight,
  CheckCircle2, XCircle, Columns, AlertCircle, LayoutList,
  Phone, Mail, MapPin, Calendar, Hash, User
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2023-24', '2024-25', '2025-26']

const ALL_CLASSES = [
  'Nursery','LKG','UKG',
  'Class I','Class II','Class III','Class IV','Class V',
  'Class VI','Class VII','Class VIII','Class IX','Class X','Class XI','Class XII',
]

const CLASS_TYPES = ['All','Pre-Primary','Primary','Middle','Secondary','Senior Secondary']

const SECTIONS = ['A','B','C','D','E']

const STUDENT_TYPE_NEW_OLD = [
  { value: '0', label: 'All' },
  { value: '1', label: 'New Student' },
  { value: '2', label: 'Old Student' },
]

const STUDENT_TYPE_FILTER = [
  { value: '0', label: '— All —' },
  { value: '1', label: 'RTE Student' },
  { value: '2', label: 'Boys' },
  { value: '3', label: 'Girls' },
]

const STUDENT_STATUS = [
  { value: '0', label: 'All' },
  { value: '1', label: 'Registered' },
  { value: '2', label: 'Withdrawn' },
]

const CERT_STATUS = [
  { value: '0', label: 'All' },
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
]

// All available columns — user can toggle visibility
const ALL_COLUMNS = [
  { id: 'sno',       label: 'S.No',           always: true  },
  { id: 'admNo',     label: 'Adm. No.',        always: false },
  { id: 'name',      label: 'Student Name',    always: true  },
  { id: 'class',     label: 'Class',           always: false },
  { id: 'section',   label: 'Section',         always: false },
  { id: 'session',   label: 'Session',         always: false },
  { id: 'gender',    label: 'Gender',          always: false },
  { id: 'dob',       label: 'Date of Birth',   always: false },
  { id: 'fatherName',label: "Father's Name",   always: false },
  { id: 'motherName',label: "Mother's Name",   always: false },
  { id: 'mobile',    label: 'Mobile',          always: false },
  { id: 'address',   label: 'Address',         always: false },
  { id: 'category',  label: 'Category',        always: false },
  { id: 'rte',       label: 'RTE',             always: false },
  { id: 'status',    label: 'Status',          always: false },
  { id: 'certStatus',label: 'Cert. Status',    always: false },
  { id: 'feeBook',   label: 'Fee Book No.',    always: false },
  { id: 'aadhar',    label: 'Aadhar No.',      always: false },
  { id: 'bloodGroup',label: 'Blood Group',     always: false },
  { id: 'quota',     label: 'Quota',           always: false },
]

// Default visible columns
const DEFAULT_VIS = new Set(['sno','admNo','name','class','section','gender','fatherName','mobile','status'])

// Dummy student data generator
const NAMES = ['Aarav Sharma','Priya Singh','Rohan Gupta','Ananya Verma','Karan Mehta','Diya Patel','Arjun Nair','Sneha Rao','Vikas Kumar','Pooja Joshi','Amit Yadav','Neha Singh','Rahul Mishra','Sakshi Dubey','Tarun Kapoor','Ishaan Bajaj','Kavya Reddy','Mohit Soni','Divya Saxena','Harsh Trivedi','Naina Bose','Yash Chauhan','Preeti Sharma','Deepak Tiwari','Aditya Pandey','Roshni Gupta','Nikhil Rawat','Bhavna Jain','Chirag Shah','Swati Dixit','Pranav Pillai','Shruti Bansal','Akash Thakur','Mansi Goyal','Varun Chopra','Ankita Rao','Rohit Sinha','Pallavi Menon','Gaurav Khanna','Megha Iyer']
const FATHER_NAMES = ['Rajesh Sharma','Suresh Singh','Vinod Gupta','Manoj Verma','Sanjay Mehta','Amit Patel','Sunil Nair','Krishna Rao','Ramesh Kumar','Dinesh Joshi','Rakesh Yadav','Hemant Singh','Anil Mishra','Vivek Dubey','Suresh Kapoor','Neeraj Bajaj','Venkat Reddy','Deepak Soni','Pramod Saxena','Alok Trivedi']
const MOTHER_NAMES = ['Sunita Sharma','Rekha Singh','Kavita Gupta','Pooja Verma','Nisha Mehta','Hetal Patel','Geeta Nair','Sarla Rao','Seema Kumar','Usha Joshi','Mamta Yadav','Asha Singh','Priya Mishra','Anita Dubey','Puja Kapoor','Tina Bajaj','Lata Reddy','Meena Soni','Renu Saxena','Sona Trivedi']
const CLASSES_LIST = ['Class I','Class II','Class III','Class IV','Class V','Class VI','Class VII','Class VIII','Class IX','Class X']
const CATS = ['General','OBC','SC','ST','EWS']
const BLOODS = ['A+','A-','B+','B-','AB+','AB-','O+','O-']
const QUOTAS = ['None','RTE','Management','Staff Ward']
const ADDRESSES = ['45, Shastri Nagar, Meerut','12, Model Town, Delhi','88, Sector 5, Noida','7, Gandhi Nagar, Agra','23, Civil Lines, Lucknow','67, Ashok Vihar, Kanpur']

function makeDummyData() {
  return Array.from({ length: 80 }, (_, i) => ({
    id: i + 1,
    admNo: `ADM${String(i + 1).padStart(3,'0')}`,
    name: NAMES[i % NAMES.length],
    class: CLASSES_LIST[i % CLASSES_LIST.length],
    section: SECTIONS[i % 4],
    session: '2025-26',
    gender: i % 2 === 0 ? 'Male' : 'Female',
    dob: `${String((i % 28) + 1).padStart(2,'0')} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i % 12]} ${2008 + (i % 8)}`,
    fatherName: FATHER_NAMES[i % FATHER_NAMES.length],
    motherName: MOTHER_NAMES[i % MOTHER_NAMES.length],
    mobile: `9${String(876543210 + i).slice(0,9)}`,
    address: ADDRESSES[i % ADDRESSES.length],
    category: CATS[i % CATS.length],
    rte: i % 7 === 0 ? 'Yes' : 'No',
    status: i % 9 === 0 ? 'Withdrawn' : 'Registered',
    certStatus: i % 3 === 0 ? 'Yes' : 'No',
    feeBook: `FB${String(i + 1).padStart(3,'0')}`,
    aadhar: `${String(100000000000 + i * 111111111).slice(0,12)}`,
    bloodGroup: BLOODS[i % BLOODS.length],
    quota: QUOTAS[i % QUOTAS.length],
    studentTypeNew: i % 3 === 0 ? 'New Student' : 'Old Student',
  }))
}

const RAW_DATA = makeDummyData()
const PER_PAGE_OPTIONS = [10, 25, 50, 100]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function cx(...a) { return a.filter(Boolean).join(' ') }

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{children}</label>
}

function Sel({ value, onChange, children, className = '' }) {
  return (
    <select value={value} onChange={onChange}
      className={cx(
        'w-full px-3 py-2 text-[13px] border rounded-lg outline-none transition-all appearance-none cursor-pointer font-medium',
        'border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400',
        'dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400',
        'hover:border-slate-300 dark:hover:border-indigo-400/40',
        className
      )}>
      {children}
    </select>
  )
}

function MultiPills({ options, selected, onToggle, onSelectAll, onClearAll, label }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <div className="flex gap-1">
          <button type="button" onClick={onSelectAll} className="text-[10px] font-semibold text-blue-600 dark:text-indigo-400 hover:underline">All</button>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <button type="button" onClick={onClearAll} className="text-[10px] font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:underline">Clear</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 p-2 border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-lg bg-slate-50/60 dark:bg-white/[0.03] min-h-[40px]">
        {options.map(opt => (
          <button key={opt} type="button" onClick={() => onToggle(opt)}
            className={cx(
              'px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all',
              selected.has(opt)
                ? 'bg-blue-500 border-blue-500 text-white dark:bg-indigo-600 dark:border-indigo-600'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:bg-[#1e2238] dark:border-white/[0.1] dark:text-slate-400 dark:hover:border-indigo-400/50'
            )}>
            {opt}
          </button>
        ))}
        {selected.size === 0 && <span className="text-[11px] text-slate-400 dark:text-slate-500 self-center">None selected — showing all</span>}
      </div>
    </div>
  )
}

// ─── COLUMN MANAGER DROPDOWN ──────────────────────────────────────────────────
function ColumnManager({ visibleCols, onToggle, onSelectAll, onClearAll }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const filtered = ALL_COLUMNS.filter(c => !c.always && c.label.toLowerCase().includes(search.toLowerCase()))
  const selected = ALL_COLUMNS.filter(c => !c.always && visibleCols.has(c.id)).length
  const total    = ALL_COLUMNS.filter(c => !c.always).length

  // Close on outside click
  const handleBlur = (e) => {
    if (ref.current && !ref.current.contains(e.relatedTarget)) setOpen(false)
  }

  return (
    <div className="flex flex-col gap-1.5 relative" ref={ref} onBlur={handleBlur} tabIndex={-1}>
      <FieldLabel>Manage Columns</FieldLabel>
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between px-3 py-2 text-[13px] border rounded-lg transition-all font-medium
          border-slate-200 bg-white text-slate-700 hover:border-slate-300
          dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:hover:border-indigo-400/40">
        <div className="flex items-center gap-2">
          <Columns className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[13px]">{selected} / {total} columns</span>
        </div>
        <ChevronDown className={cx('w-3.5 h-3.5 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-40 rounded-xl border shadow-2xl bg-white dark:bg-[#1e2238]
          border-slate-200 dark:border-[rgba(99,102,241,0.3)] overflow-hidden" style={{ maxHeight: 340, display: 'flex', flexDirection: 'column' }}>
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-white/[0.06]">
            <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search columns..."
              className="flex-1 text-[12px] outline-none bg-transparent text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-500" />
          </div>
          {/* Select all / none */}
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-100 dark:border-white/[0.06] bg-slate-50/60 dark:bg-white/[0.02]">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{filtered.length} columns</span>
            <div className="flex gap-2">
              <button type="button" onClick={onSelectAll} className="text-[11px] font-semibold text-blue-600 dark:text-indigo-400 hover:underline">All</button>
              <button type="button" onClick={onClearAll} className="text-[11px] font-semibold text-slate-400 hover:underline">None</button>
            </div>
          </div>
          {/* Column list */}
          <div className="overflow-y-auto flex-1 p-2 grid grid-cols-2 gap-1">
            {filtered.map(col => (
              <label key={col.id}
                className={cx(
                  'flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all select-none text-[12px] font-medium',
                  visibleCols.has(col.id)
                    ? 'bg-blue-50 text-blue-700 dark:bg-indigo-500/10 dark:text-indigo-300'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
                )}>
                <span className={cx(
                  'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all',
                  visibleCols.has(col.id) ? 'bg-blue-500 border-blue-500 dark:bg-indigo-500 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-600'
                )}>
                  {visibleCols.has(col.id) && <svg viewBox="0 0 10 10" className="w-2.5 h-2.5"><polyline points="1.5,5 4,7.5 8.5,2" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/></svg>}
                </span>
                <input type="checkbox" className="hidden" checked={visibleCols.has(col.id)} onChange={() => onToggle(col.id)} />
                {col.label}
              </label>
            ))}
          </div>
          <div className="px-3 py-2 border-t border-slate-100 dark:border-white/[0.06]">
            <button type="button" onClick={() => setOpen(false)}
              className="w-full py-1.5 rounded-lg text-[12px] font-semibold text-white bg-blue-500 hover:bg-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CELL RENDERER ────────────────────────────────────────────────────────────
function renderCell(colId, row) {
  switch (colId) {
    case 'status':     return <span className={cx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold', row.status === 'Registered' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-slate-400')}><span className={cx('w-1.5 h-1.5 rounded-full', row.status === 'Registered' ? 'bg-emerald-500' : 'bg-slate-400')} />{row.status}</span>
    case 'rte':        return row.rte === 'Yes' ? <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-300">RTE</span> : <span className="text-slate-300 dark:text-slate-600">—</span>
    case 'certStatus': return <span className={cx('inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold', row.certStatus === 'Yes' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300')}>{row.certStatus}</span>
    case 'gender':     return <span className={cx('inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold', row.gender === 'Male' ? 'bg-blue-50 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-300' : 'bg-pink-50 text-pink-700 dark:bg-pink-500/15 dark:text-pink-300')}>{row.gender}</span>
    case 'sno':        return <span className="font-mono text-[11px] text-slate-400">{row.id}</span>
    case 'admNo':      return <span className="font-mono text-[12px] font-semibold text-slate-600 dark:text-slate-300">{row.admNo}</span>
    case 'mobile':     return <a href={`tel:${row.mobile}`} className="font-mono text-[12px] text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-indigo-300 transition-colors">{row.mobile}</a>
    default:           return <span className="text-[12px] text-slate-600 dark:text-slate-300">{row[colId] ?? '—'}</span>
  }
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function StudentCard({ row, visibleCols }) {
  const [expanded, setExpanded] = useState(false)
  const extraCols = ALL_COLUMNS.filter(c => c.id !== 'sno' && c.id !== 'name' && c.id !== 'class' && c.id !== 'admNo' && c.id !== 'status' && visibleCols.has(c.id))

  return (
    <div className={cx(
      'rounded-xl border overflow-hidden transition-all',
      row.status === 'Withdrawn'
        ? 'border-slate-200 bg-white dark:border-[rgba(99,102,241,0.1)] dark:bg-[#1e2238] opacity-70'
        : 'border-slate-100 bg-white dark:border-[rgba(99,102,241,0.12)] dark:bg-[#1e2238]'
    )}>
      <div className="flex items-center gap-3 p-3.5">
        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-[14px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
          {row.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
            {renderCell('status', row)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.admNo} · {row.class} – {row.section}</p>
        </div>
        <button onClick={() => setExpanded(v => !v)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors flex-shrink-0">
          <ChevronDown className={cx('w-4 h-4 text-slate-400 transition-transform', expanded && 'rotate-180')} />
        </button>
      </div>

      {/* Quick pills */}
      <div className="flex flex-wrap gap-1.5 px-3.5 pb-3">
        {visibleCols.has('gender')     && renderCell('gender', row)}
        {visibleCols.has('rte')        && row.rte === 'Yes' && renderCell('rte', row)}
        {visibleCols.has('certStatus') && renderCell('certStatus', row)}
        {visibleCols.has('fatherName') && (
          <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <User className="w-3 h-3" />{row.fatherName}
          </span>
        )}
        {visibleCols.has('mobile') && (
          <a href={`tel:${row.mobile}`} className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">
            <Phone className="w-3 h-3" />{row.mobile}
          </a>
        )}
      </div>

      {/* Expanded details */}
      {expanded && extraCols.length > 0 && (
        <div className="border-t border-slate-100 dark:border-white/[0.06] px-3.5 py-3 grid grid-cols-2 gap-2 bg-slate-50/60 dark:bg-white/[0.02]">
          {extraCols.map(col => (
            <div key={col.id} className="flex flex-col gap-0.5">
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{col.label}</span>
              <div>{renderCell(col.id, row)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ items, onRemove }) {
  if (!items.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2" style={{ maxWidth: 300, width: '90vw' }}>
      {items.map(t => (
        <div key={t.id} className={cx('flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-[12px] font-semibold',
          t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500/30 dark:text-emerald-300' : 'bg-rose-50 border-rose-200 text-rose-700')}>
          {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => onRemove(t.id)}><X className="w-3.5 h-3.5 opacity-50 hover:opacity-100" /></button>
        </div>
      ))}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function StudentInfoSheet({ title = 'Student Info Sheet' }) {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [session,       setSession]       = useState('2025-26')
  const [selClasses,    setSelClasses]    = useState(new Set())
  const [classType,     setClassType]     = useState('All')
  const [selSections,   setSelSections]   = useState(new Set())
  const [newOldType,    setNewOldType]    = useState('0')
  const [studentType,   setStudentType]   = useState('0')
  const [stuStatus,     setStuStatus]     = useState('1')
  const [certStatus,    setCertStatus]    = useState('0')

  // ── Column visibility ─────────────────────────────────────────────────────
  const [visibleCols, setVisibleCols]     = useState(DEFAULT_VIS)

  // ── Table state ───────────────────────────────────────────────────────────
  const [results,       setResults]       = useState([])
  const [hasLoaded,     setHasLoaded]     = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [tableSearch,   setTableSearch]   = useState('')
  const [sortCol,       setSortCol]       = useState('sno')
  const [sortDir,       setSortDir]       = useState('asc')
  const [page,          setPage]          = useState(1)
  const [perPage,       setPerPage]       = useState(25)
  const [toasts,        setToasts]        = useState([])
  const [filtersOpen,   setFiltersOpen]   = useState(true)   // mobile filter accordion

  // ── Toast helpers ─────────────────────────────────────────────────────────
  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])
  const removeToast = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), [])

  // ── Multi-select helpers ──────────────────────────────────────────────────
  const toggleClass   = c  => setSelClasses(p  => { const n = new Set(p);  n.has(c)  ? n.delete(c)  : n.add(c);  return n })
  const toggleSection = s  => setSelSections(p => { const n = new Set(p); n.has(s)  ? n.delete(s)  : n.add(s); return n })
  const toggleCol     = id => setVisibleCols(p => { const n = new Set(p); n.has(id) ? (id !== 'name' && id !== 'sno' && n.delete(id)) : n.add(id); return n })

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    setLoading(true)
    setHasLoaded(true)
    setPage(1)
    setTableSearch('')
    setTimeout(() => {
      let data = [...RAW_DATA]
      if (selClasses.size  > 0) data = data.filter(r => selClasses.has(r.class))
      if (selSections.size > 0) data = data.filter(r => selSections.has(r.section))
      if (newOldType !== '0') {
        const target = newOldType === '1' ? 'New Student' : 'Old Student'
        data = data.filter(r => r.studentTypeNew === target)
      }
      if (studentType === '1') data = data.filter(r => r.rte === 'Yes')
      if (studentType === '2') data = data.filter(r => r.gender === 'Male')
      if (studentType === '3') data = data.filter(r => r.gender === 'Female')
      if (stuStatus !== '0') data = data.filter(r => r.status === (stuStatus === '1' ? 'Registered' : 'Withdrawn'))
      if (certStatus !== '0') data = data.filter(r => r.certStatus === certStatus)
      setResults(data)
      setLoading(false)
      addToast(`${data.length} students found`)
    }, 600)
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession('2025-26'); setSelClasses(new Set()); setClassType('All')
    setSelSections(new Set()); setNewOldType('0'); setStudentType('0')
    setStuStatus('1'); setCertStatus('0'); setResults([]); setHasLoaded(false)
    setTableSearch(''); setPage(1)
  }

  // ── Sort ──────────────────────────────────────────────────────────────────
  const toggleSort = col => { setSortCol(col); setSortDir(d => col === sortCol ? (d === 'asc' ? 'desc' : 'asc') : 'asc'); setPage(1) }

  // ── Filtered + sorted + paginated ─────────────────────────────────────────
  const processed = useMemo(() => {
    let d = results.filter(r => {
      const q = tableSearch.toLowerCase()
      return !q || r.name.toLowerCase().includes(q) || r.admNo.toLowerCase().includes(q) || r.fatherName.toLowerCase().includes(q) || r.mobile.includes(q)
    })
    d = [...d].sort((a, b) => {
      const va = String(a[sortCol] ?? ''), vb = String(b[sortCol] ?? '')
      return sortDir === 'asc' ? va.localeCompare(vb, undefined, { numeric: true }) : vb.localeCompare(va, undefined, { numeric: true })
    })
    return d
  }, [results, tableSearch, sortCol, sortDir])

  const totalPages = Math.max(1, Math.ceil(processed.length / perPage))
  const pageData   = processed.slice((page - 1) * perPage, page * perPage)

  // ── Export CSV ────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const visCols = ALL_COLUMNS.filter(c => visibleCols.has(c.id))
    const header  = visCols.map(c => c.label).join(',')
    const rows    = processed.map(r => visCols.map(c => `"${String(r[c.id] ?? '').replace(/"/g, '""')}"`).join(','))
    const blob    = new Blob([header + '\n' + rows.join('\n')], { type: 'text/csv' })
    const url     = URL.createObjectURL(blob)
    const a       = document.createElement('a'); a.href = url; a.download = `student-info-${session}.csv`; a.click()
    URL.revokeObjectURL(url)
    addToast(`Exported ${processed.length} rows as CSV`)
  }

  // ── Visible columns for table ─────────────────────────────────────────────
  const tableCols = ALL_COLUMNS.filter(c => visibleCols.has(c.id))

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ChevronDown className="w-3 h-3 opacity-25" />
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />
  }

  return (
    <div className="space-y-4 pb-8">

      {/* ── Page Title ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100">{title}</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Apply filters to search students, manage visible columns, then export.
          </p>
        </div>
      </div>

      {/* ── FILTER CARD ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Header — clickable on mobile to collapse */}
        <button type="button"
          className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] text-left"
          onClick={() => setFiltersOpen(v => !v)}>
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          <ChevronDown className={cx('w-4 h-4 text-slate-400 transition-transform sm:hidden', !filtersOpen && 'rotate-180')} />
        </button>

        <div className={cx('sm:block', filtersOpen ? 'block' : 'hidden')}>
          <div className="p-4 sm:p-5 space-y-4">
            {/* Row 1: Session, Classes, Class Type, Sections */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Session */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Session</FieldLabel>
                <Sel value={session} onChange={e => setSession(e.target.value)}>
                  {SESSIONS.map(s => <option key={s}>{s}</option>)}
                </Sel>
              </div>

              {/* Class Type */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Class Type</FieldLabel>
                <Sel value={classType} onChange={e => setClassType(e.target.value)}>
                  {CLASS_TYPES.map(t => <option key={t}>{t}</option>)}
                </Sel>
              </div>

              {/* Student Type New/Old */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel>New / Old Student</FieldLabel>
                <Sel value={newOldType} onChange={e => setNewOldType(e.target.value)}>
                  {STUDENT_TYPE_NEW_OLD.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Sel>
              </div>

              {/* Student Type RTE/Boys/Girls */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Student Type</FieldLabel>
                <Sel value={studentType} onChange={e => setStudentType(e.target.value)}>
                  {STUDENT_TYPE_FILTER.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Sel>
              </div>
            </div>

            {/* Row 2: Multi-select Class pills */}
            <MultiPills
              label="Select Classes (multi-select)"
              options={ALL_CLASSES}
              selected={selClasses}
              onToggle={toggleClass}
              onSelectAll={() => setSelClasses(new Set(ALL_CLASSES))}
              onClearAll={() => setSelClasses(new Set())}
            />

            {/* Row 3: Sections pills */}
            <MultiPills
              label="Select Sections (multi-select)"
              options={SECTIONS}
              selected={selSections}
              onToggle={toggleSection}
              onSelectAll={() => setSelSections(new Set(SECTIONS))}
              onClearAll={() => setSelSections(new Set())}
            />

            {/* Row 4: Status dropdowns + Column manager */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Student Status */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Student Status</FieldLabel>
                <Sel value={stuStatus} onChange={e => setStuStatus(e.target.value)}>
                  {STUDENT_STATUS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Sel>
              </div>

              {/* Certificate Status */}
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Certificate Status</FieldLabel>
                <Sel value={certStatus} onChange={e => setCertStatus(e.target.value)}>
                  {CERT_STATUS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Sel>
              </div>

              {/* Column Manager */}
              <div className="lg:col-span-2">
                <ColumnManager
                  visibleCols={visibleCols}
                  onToggle={toggleCol}
                  onSelectAll={() => setVisibleCols(new Set(ALL_COLUMNS.map(c => c.id)))}
                  onClearAll={() => setVisibleCols(new Set(ALL_COLUMNS.filter(c => c.always || DEFAULT_VIS.has(c.id)).map(c => c.id)))}
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5
            border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/60 dark:bg-white/[0.02] flex-wrap">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              {selClasses.size > 0 ? `${selClasses.size} class${selClasses.size > 1 ? 'es' : ''} selected` : 'All classes'}
              {selSections.size > 0 ? ` · ${selSections.size} section${selSections.size > 1 ? 's' : ''}` : ''}
            </p>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={handleReset}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-[13px] font-semibold rounded-lg transition-colors
                  bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-white/[0.1]">
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
              <button onClick={handleSubmit} disabled={loading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-2 text-[13px] font-semibold text-white rounded-lg transition-all active:scale-95
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20
                  disabled:opacity-60 disabled:cursor-not-allowed">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading...</>
                  : <><Eye className="w-4 h-4" /> Submit</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── RESULTS ── */}
      {hasLoaded && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Results header */}
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] flex-wrap gap-y-2">
            <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
            <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">
              Results
              {results.length > 0 && <span className="ml-2 text-[11px] font-normal text-slate-400">({processed.length} of {results.length})</span>}
            </span>

            {/* Table search */}
            {results.length > 0 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                <input value={tableSearch} onChange={e => { setTableSearch(e.target.value); setPage(1) }} placeholder="Quick search..."
                  className="pl-7 pr-3 py-1.5 text-[12px] border rounded-lg outline-none transition-all w-36 sm:w-44
                    border-slate-200 bg-white text-slate-700 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400" />
              </div>
            )}

            {/* Per page */}
            {results.length > 0 && (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Show</span>
                <Sel value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1) }} className="!py-1.5 !text-[12px] w-16">
                  {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                </Sel>
              </div>
            )}

            {/* Export */}
            {results.length > 0 && (
              <button onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors
                  bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100
                  dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20 dark:hover:bg-emerald-500/15">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Export Excel
              </button>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <span className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-[13px] text-slate-400">Loading...</span>
            </div>
          )}

          {/* Empty */}
          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center py-16 gap-3">
              <Users className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No students found</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">Try adjusting the filters above</p>
            </div>
          )}

          {/* ── DESKTOP TABLE ── */}
          {!loading && pageData.length > 0 && (
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                    {tableCols.map(col => (
                      <th key={col.id}
                        onClick={() => toggleSort(col.id)}
                        className="px-3 py-2.5 text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {col.label}
                          <SortIcon col={col.id} />
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((row, i) => (
                    <tr key={row.id} className={cx(
                      'transition-colors hover:bg-blue-50/30 dark:hover:bg-indigo-500/5',
                      i % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/40 dark:bg-white/[0.015]'
                    )}>
                      {tableCols.map(col => (
                        <td key={col.id} className="px-3 py-2.5 whitespace-nowrap">
                          {renderCell(col.id, row)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── MOBILE CARDS ── */}
          {!loading && pageData.length > 0 && (
            <div className="sm:hidden p-3 space-y-2">
              {pageData.map(row => <StudentCard key={row.id} row={row} visibleCols={visibleCols} />)}
            </div>
          )}

          {/* ── PAGINATION ── */}
          {!loading && processed.length > perPage && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3
              border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/60 dark:bg-white/[0.01] flex-wrap">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                {(page - 1) * perPage + 1}–{Math.min(page * perPage, processed.length)} of {processed.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, i, arr) => (
                    <span key={p} className="flex items-center">
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-300 dark:text-slate-600 px-1 text-[12px]">…</span>}
                      <button onClick={() => setPage(p)}
                        className={cx('min-w-[32px] h-8 px-2 rounded-lg text-[12px] font-semibold transition-colors',
                          page === p ? 'bg-blue-600 text-white dark:bg-indigo-600 shadow-sm' : 'border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]')}>
                        {p}
                      </button>
                    </span>
                  ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Toast items={toasts} onRemove={removeToast} />
    </div>
  )
}
