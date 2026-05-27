import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Search, X, Filter, Download, Copy, RefreshCw,
  ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
  User, Phone, MapPin, Calendar, BookOpen, Hash,
  AlertCircle, Check, Eye, FileText, Loader2,
  GraduationCap, Users, SlidersHorizontal, RotateCcw
} from 'lucide-react'

// ─── STATIC MOCK DATA ─────────────────────────────────────────────────────────
const SESSIONS = ['2024-25', '2025-26', '2026-27']
const CLASSES  = [
  'All Classes','Nursery','LKG','UKG',
  'Class I','Class II','Class III','Class IV','Class V',
  'Class VI','Class VII','Class VIII','Class IX','Class X','Class XI','Class XII',
]

const MOCK_STUDENTS = [
  { id:1,  session:'2025-26', regNo:'REG001', name:'Aarav Sharma',    rte:'No',  status:'Active',   cls:'Class I (A)',    feeBook:'FB001', fatherName:'Rajesh Sharma',   motherName:'Sunita Sharma',   fatherMobile:'9876543210', motherMobile:'9876543211', address:'12, MG Road, Meerut, UP – 250001', dob:'12 Mar 2018', photo:null },
  { id:2,  session:'2025-26', regNo:'REG002', name:'Priya Singh',     rte:'Yes', status:'Active',   cls:'Class I (A)',    feeBook:'FB002', fatherName:'Suresh Singh',    motherName:'Rekha Singh',     fatherMobile:'9812345678', motherMobile:'9812345679', address:'45, Civil Lines, Meerut, UP – 250001',dob:'05 Jul 2018', photo:null },
  { id:3,  session:'2025-26', regNo:'REG003', name:'Rohan Gupta',     rte:'No',  status:'Active',   cls:'Class II (B)',   feeBook:'FB003', fatherName:'Vinod Gupta',     motherName:'Kavita Gupta',    fatherMobile:'9898989898', motherMobile:'9898989899', address:'7, Gandhi Nagar, Delhi – 110031',    dob:'22 Jan 2018', photo:null },
  { id:4,  session:'2025-26', regNo:'REG004', name:'Ananya Verma',    rte:'No',  status:'Inactive', cls:'Class III (A)',  feeBook:'FB004', fatherName:'Manoj Verma',     motherName:'Pooja Verma',     fatherMobile:'9023456789', motherMobile:'9023456780', address:'88, Sector 5, Noida, UP – 201301',   dob:'10 Sep 2017', photo:null },
  { id:5,  session:'2025-26', regNo:'REG005', name:'Karan Mehta',     rte:'Yes', status:'Active',   cls:'Class V (A)',    feeBook:'FB005', fatherName:'Sanjay Mehta',    motherName:'Nisha Mehta',     fatherMobile:'9711223344', motherMobile:'9711223345', address:'23, Lajpat Nagar, Delhi – 110024',   dob:'18 Feb 2016', photo:null },
  { id:6,  session:'2025-26', regNo:'REG006', name:'Diya Patel',      rte:'No',  status:'Active',   cls:'Class VI (B)',   feeBook:'FB006', fatherName:'Amit Patel',      motherName:'Hetal Patel',     fatherMobile:'9654321098', motherMobile:'9654321099', address:'67, Ashok Vihar, Meerut, UP – 250002',dob:'30 Nov 2014', photo:null },
  { id:7,  session:'2025-26', regNo:'REG007', name:'Arjun Nair',      rte:'No',  status:'Active',   cls:'Class VIII (A)', feeBook:'FB007', fatherName:'Sunil Nair',      motherName:'Geeta Nair',      fatherMobile:'9445566778', motherMobile:'9445566779', address:'3, Connaught Place, Delhi – 110001',  dob:'14 Apr 2013', photo:null },
  { id:8,  session:'2025-26', regNo:'REG008', name:'Sneha Rao',       rte:'Yes', status:'Active',   cls:'Class IX (A)',   feeBook:'FB008', fatherName:'Krishna Rao',     motherName:'Sarla Rao',       fatherMobile:'9332211009', motherMobile:'9332211008', address:'91, Rajpur Road, Dehradun – 248001',  dob:'07 Aug 2011', photo:null },
  { id:9,  session:'2025-26', regNo:'REG009', name:'Vikas Kumar',     rte:'No',  status:'Active',   cls:'Class X (A)',    feeBook:'FB009', fatherName:'Ramesh Kumar',    motherName:'Seema Kumar',     fatherMobile:'9001122334', motherMobile:'9001122335', address:'55, Model Town, Ludhiana – 141001',   dob:'03 Jun 2010', photo:null },
  { id:10, session:'2025-26', regNo:'REG010', name:'Pooja Joshi',     rte:'No',  status:'Inactive', cls:'Class X (B)',    feeBook:'FB010', fatherName:'Dinesh Joshi',    motherName:'Usha Joshi',      fatherMobile:'9887766554', motherMobile:'9887766555', address:'16, Sadar Bazar, Meerut, UP – 250003', dob:'25 Oct 2010', photo:null },
  { id:11, session:'2025-26', regNo:'REG011', name:'Amit Yadav',      rte:'Yes', status:'Active',   cls:'Class XI (Science)', feeBook:'FB011', fatherName:'Rakesh Yadav',  motherName:'Mamta Yadav',   fatherMobile:'9765432109', motherMobile:'9765432108', address:'29, Sector 22, Noida, UP – 201301',   dob:'16 Dec 2009', photo:null },
  { id:12, session:'2025-26', regNo:'REG012', name:'Neha Singh',      rte:'No',  status:'Active',   cls:'Class XII (Commerce)', feeBook:'FB012', fatherName:'Hemant Singh', motherName:'Asha Singh',  fatherMobile:'9543219876', motherMobile:'9543219877', address:'78, Ring Road, Delhi – 110044',       dob:'09 May 2008', photo:null },
  { id:13, session:'2024-25', regNo:'REG013', name:'Rahul Mishra',    rte:'No',  status:'Active',   cls:'Class IX (B)',   feeBook:'FB013', fatherName:'Anil Mishra',     motherName:'Priya Mishra',    fatherMobile:'9234567890', motherMobile:'9234567891', address:'44, Shastri Nagar, Meerut, UP – 250004',dob:'11 Jan 2011',photo:null },
  { id:14, session:'2024-25', regNo:'REG014', name:'Sakshi Dubey',    rte:'No',  status:'Active',   cls:'Class VII (A)',  feeBook:'FB014', fatherName:'Vivek Dubey',     motherName:'Anita Dubey',     fatherMobile:'9112233445', motherMobile:'9112233446', address:'5, Indira Nagar, Lucknow – 226016',  dob:'23 Mar 2013', photo:null },
  { id:15, session:'2024-25', regNo:'REG015', name:'Tarun Kapoor',    rte:'Yes', status:'Active',   cls:'Class IV (A)',   feeBook:'FB015', fatherName:'Suresh Kapoor',   motherName:'Puja Kapoor',     fatherMobile:'9988776655', motherMobile:'9988776656', address:'32, Krishna Colony, Agra – 282001',  dob:'07 Aug 2015', photo:null },
]

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Sel({ value, onChange, disabled, children, className = '' }) {
  return (
    <select value={value} onChange={onChange} disabled={disabled}
      className={`w-full px-3 py-2 text-[13px] border rounded-lg outline-none transition-all appearance-none cursor-pointer font-medium
        bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400
        dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        border-slate-200 dark:border-[rgba(99,102,241,0.2)]
        hover:border-slate-300 dark:hover:border-indigo-400/40
        disabled:opacity-40 disabled:cursor-not-allowed ${className}`}>
      {children}
    </select>
  )
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isActive = status === 'Active'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold
      ${isActive
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
        : 'bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-slate-400'
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {status}
    </span>
  )
}

function RTEBadge({ rte }) {
  return rte === 'Yes'
    ? <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-300">RTE</span>
    : <span className="text-[12px] text-slate-300 dark:text-slate-600">—</span>
}

// ─── STUDENT DETAIL DRAWER (mobile) ──────────────────────────────────────────
function StudentDrawer({ student, onClose }) {
  if (!student) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-md bg-white dark:bg-[#1a1f35] rounded-t-3xl sm:rounded-2xl shadow-2xl
        border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden max-h-[90vh] flex flex-col">

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-white/20" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-[16px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
            {student.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{student.regNo} · {student.cls}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Hash,         label: 'Reg. No.',       val: student.regNo },
              { icon: BookOpen,     label: 'Fee Book',        val: student.feeBook },
              { icon: Calendar,     label: 'Date of Birth',   val: student.dob },
              { icon: GraduationCap,label: 'Class',           val: student.cls },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex flex-col gap-1 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.08]">
                <div className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
                </div>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{val}</p>
              </div>
            ))}
          </div>

          <div className="space-y-2.5">
            {[
              { label: "Father's Name",   val: student.fatherName,   sub: student.fatherMobile },
              { label: "Mother's Name",   val: student.motherName,   sub: student.motherMobile },
            ].map(({ label, val, sub }) => (
              <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.08]">
                <div className="w-8 h-8 rounded-full bg-white dark:bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{val}</p>
                  <p className="text-[12px] text-slate-400">{sub}</p>
                </div>
                <a href={`tel:${sub}`} className="p-2 rounded-lg bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 hover:bg-blue-100 transition-colors">
                  <Phone className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.08]">
            <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Address</p>
              <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">{student.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={student.status} />
            <RTEBadge rte={student.rte} />
            <span className="text-[11px] text-slate-400">{student.session}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function TableRow({ student, onView, idx }) {
  return (
    <tr className={`group transition-colors hover:bg-blue-50/40 dark:hover:bg-indigo-500/5 ${idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/40 dark:bg-white/[0.015]'}`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-[12px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
            {student.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[140px]">{student.name}</p>
            <p className="text-[11px] text-slate-400">{student.regNo}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-300 font-medium">{student.cls}</td>
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400">{student.session}</td>
      <td className="px-4 py-3"><StatusBadge status={student.status} /></td>
      <td className="px-4 py-3"><RTEBadge rte={student.rte} /></td>
      <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-300">{student.fatherName}</td>
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400">{student.fatherMobile}</td>
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400">{student.dob}</td>
      <td className="px-4 py-3">
        <button onClick={() => onView(student)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors
            bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700
            dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-indigo-500/15 dark:hover:text-indigo-300">
          <Eye className="w-3 h-3" /> View
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ student, onView }) {
  return (
    <div className="bg-white dark:bg-[#1e2238] rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
      overflow-hidden shadow-sm hover:shadow-md transition-all hover:border-slate-200 dark:hover:border-indigo-400/25">
      <div className="flex items-center gap-3 p-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-[16px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
          {student.name.charAt(0)}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">{student.regNo} · {student.cls}</p>
            </div>
            <StatusBadge status={student.status} />
          </div>
        </div>
      </div>

      {/* Detail pills */}
      <div className="flex flex-wrap gap-2 px-4 pb-3">
        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <User className="w-3 h-3" />{student.fatherName}
        </span>
        <span className="text-slate-200 dark:text-slate-700">·</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Phone className="w-3 h-3" />{student.fatherMobile}
        </span>
        <span className="text-slate-200 dark:text-slate-700">·</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
          <Calendar className="w-3 h-3" />{student.dob}
        </span>
        {student.rte === 'Yes' && <RTEBadge rte="Yes" />}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 dark:bg-white/[0.02] border-t border-slate-100 dark:border-white/[0.05]">
        <span className="text-[11px] text-slate-400 font-medium">{student.session} · {student.feeBook}</span>
        <button onClick={() => onView(student)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors
            bg-blue-50 text-blue-700 hover:bg-blue-100
            dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20">
          <Eye className="w-3 h-3" /> View Details
        </button>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SearchStudent({ title = 'Search Students' }) {
  const [session,    setSession]    = useState('')
  const [cls,        setCls]        = useState('')
  const [nameSearch, setNameSearch] = useState('')
  const [searchInput,setSearchInput]= useState('')
  const [suggestions,setSuggestions]= useState([])
  const [showSug,    setShowSug]    = useState(false)
  const [loading,    setLoading]    = useState(false)
  const [results,    setResults]    = useState([])
  const [hasSearched,setHasSearched]= useState(false)
  const [viewStudent,setViewStudent]= useState(null)

  // Table state
  const [tableSearch, setTableSearch] = useState('')
  const [sortCol,     setSortCol]     = useState(null)
  const [sortDir,     setSortDir]     = useState('asc')
  const [page,        setPage]        = useState(1)
  const PER_PAGE = 10

  const searchRef = useRef(null)

  // ── Autocomplete suggestions ───────────────────────────────────────────────
  useEffect(() => {
    if (searchInput.length < 1) { setSuggestions([]); setShowSug(false); return }
    const lower = searchInput.toLowerCase()
    const filtered = MOCK_STUDENTS.filter(s =>
      s.name.toLowerCase().includes(lower) ||
      s.regNo.toLowerCase().includes(lower) ||
      s.fatherName.toLowerCase().includes(lower)
    ).slice(0, 6)
    setSuggestions(filtered)
    setShowSug(true)
  }, [searchInput])

  // ── Submit search ──────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    setLoading(true)
    setHasSearched(true)
    setPage(1)
    setTimeout(() => {
      let data = [...MOCK_STUDENTS]
      if (session)      data = data.filter(s => s.session === session)
      if (cls && cls !== 'All Classes') {
        data = data.filter(s => s.cls.startsWith(cls))
      }
      const q = nameSearch.toLowerCase()
      if (q) data = data.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.regNo.toLowerCase().includes(q) ||
        s.fatherName.toLowerCase().includes(q) ||
        s.fatherMobile.includes(q)
      )
      setResults(data)
      setLoading(false)
      setTableSearch('')
    }, 500)
  }, [session, cls, nameSearch])

  // ── Clear ──────────────────────────────────────────────────────────────────
  const handleClear = () => {
    setSession(''); setCls(''); setNameSearch(''); setSearchInput('')
    setResults([]); setHasSearched(false); setTableSearch(''); setSuggestions([]); setShowSug(false)
  }

  // ── Table filter + sort + paginate ─────────────────────────────────────────
  const colMap = { name:0, cls:1, session:2, status:3, fatherName:5, fatherMobile:6 }
  let display = results.filter(s => {
    const q = tableSearch.toLowerCase()
    return !q || s.name.toLowerCase().includes(q) || s.regNo.toLowerCase().includes(q) ||
      s.cls.toLowerCase().includes(q) || s.fatherName.toLowerCase().includes(q) ||
      s.fatherMobile.includes(q)
  })
  if (sortCol) {
    display = [...display].sort((a, b) => {
      const va = a[sortCol] || '', vb = b[sortCol] || ''
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
  }
  const totalPages = Math.max(1, Math.ceil(display.length / PER_PAGE))
  const pageData   = display.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const toggleSort = (col) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
    setPage(1)
  }

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <ChevronDown className="w-3 h-3 opacity-30" />
    return sortDir === 'asc' ? <ChevronUp className="w-3 h-3 text-blue-500" /> : <ChevronDown className="w-3 h-3 text-blue-500" />
  }

  // ── Copy to clipboard ──────────────────────────────────────────────────────
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    const header = 'Reg No\tName\tClass\tSession\tStatus\tFather\tMobile\tDOB'
    const rows   = display.map(s => `${s.regNo}\t${s.name}\t${s.cls}\t${s.session}\t${s.status}\t${s.fatherName}\t${s.fatherMobile}\t${s.dob}`).join('\n')
    navigator.clipboard?.writeText(`${header}\n${rows}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ── Export CSV ─────────────────────────────────────────────────────────────
  const handleExport = () => {
    const header = ['Reg No','Name','Class','Session','Status','RTE','Fee Book','Father','Mother','Father Mobile','Mother Mobile','Address','DOB'].join(',')
    const rows   = display.map(s => [s.regNo,s.name,s.cls,s.session,s.status,s.rte,s.feeBook,s.fatherName,s.motherName,s.fatherMobile,s.motherMobile,`"${s.address}"`,s.dob].join(','))
    const csv    = [header, ...rows].join('\n')
    const blob   = new Blob([csv], { type: 'text/csv' })
    const url    = URL.createObjectURL(blob)
    const a      = document.createElement('a'); a.href = url; a.download = 'students.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const COLS = [
    { key: 'name',        label: 'Student',       sortable: true },
    { key: 'cls',         label: 'Class',          sortable: true },
    { key: 'session',     label: 'Session',        sortable: true },
    { key: 'status',      label: 'Status',         sortable: false },
    { key: 'rte',         label: 'RTE',            sortable: false },
    { key: 'fatherName',  label: 'Father',         sortable: true },
    { key: 'fatherMobile',label: 'Mobile',         sortable: false },
    { key: 'dob',         label: 'DOB',            sortable: false },
    { key: 'action',      label: '',               sortable: false },
  ]

  return (
    <div className="page-animate space-y-4 pb-8">

      {/* ── Page Title ── */}
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Search students by session, class or name. Tap a row to view full details.
        </p>
      </div>

      {/* ── Filter Card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden bg-white dark:bg-[#1a1f35] shadow-sm">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <SlidersHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tracking-tight">Search Filters</span>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            {/* Session */}
            <Field label="Session">
              <Sel value={session} onChange={e => setSession(e.target.value)}>
                <option value="">All Sessions</option>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </Sel>
            </Field>

            {/* Class */}
            <Field label="Class">
              <Sel value={cls} onChange={e => setCls(e.target.value)}>
                <option value="">All Classes</option>
                {CLASSES.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
              </Sel>
            </Field>

            {/* Student autocomplete search */}
            <Field label="Student / Father / Reg. No.">
              <div className="relative" ref={searchRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={searchInput}
                  onChange={e => { setSearchInput(e.target.value); setNameSearch(e.target.value) }}
                  onFocus={() => suggestions.length > 0 && setShowSug(true)}
                  onBlur={() => setTimeout(() => setShowSug(false), 200)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Type name, reg no, or father..."
                  className="w-full pl-9 pr-9 py-2 text-[13px] border rounded-lg outline-none transition-all font-medium
                    border-slate-200 bg-white text-slate-800 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200
                    dark:placeholder-slate-500 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                />
                {searchInput && (
                  <button onClick={() => { setSearchInput(''); setNameSearch(''); setSuggestions([]); setShowSug(false) }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Autocomplete dropdown */}
                {showSug && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 z-40 rounded-xl border shadow-xl overflow-hidden
                    bg-white border-slate-200 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.25)]">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-white/[0.06]">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{suggestions.length} suggestions</p>
                    </div>
                    <div className="max-h-56 overflow-y-auto">
                      {suggestions.map(s => (
                        <button key={s.id} type="button"
                          onMouseDown={() => {
                            setSearchInput(s.name); setNameSearch(s.name); setShowSug(false)
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors text-left">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-[13px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
                            {s.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                            <p className="text-[11px] text-slate-400 dark:text-slate-500">{s.regNo} · {s.cls} · {s.fatherName}</p>
                          </div>
                          <StatusBadge status={s.status} />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Field>
          </div>

          {/* Buttons */}
          <div className="flex gap-2.5 mt-4 flex-wrap">
            <button type="button" onClick={handleSearch} disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-[13px] font-semibold text-white rounded-lg transition-all active:scale-95
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20
                disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Searching...</>
                : <><Search className="w-4 h-4" />Search</>
              }
            </button>
            <button type="button" onClick={handleClear}
              className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold rounded-lg transition-colors
                bg-slate-100 text-slate-600 hover:bg-slate-200
                dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-white/[0.1]">
              <RotateCcw className="w-3.5 h-3.5" /> Clear
            </button>
          </div>
        </div>
      </div>

      {/* ── Results ── */}
      {hasSearched && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden bg-white dark:bg-[#1a1f35] shadow-sm">

          {/* Results header */}
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] flex-wrap gap-y-2">
            <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
            <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tracking-tight flex-1">
              Results
              {results.length > 0 && (
                <span className="ml-2 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                  ({display.length} of {results.length})
                </span>
              )}
            </span>

            {/* Table search */}
            {results.length > 0 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                <input value={tableSearch} onChange={e => { setTableSearch(e.target.value); setPage(1) }}
                  placeholder="Filter results..."
                  className="pl-7 pr-3 py-1.5 text-[12px] border rounded-lg outline-none transition-all w-40
                    border-slate-200 bg-white text-slate-700 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400" />
              </div>
            )}

            {/* Export buttons */}
            {results.length > 0 && (
              <div className="flex gap-2">
                <button onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors
                    border border-slate-200 bg-white text-slate-600 hover:bg-slate-50
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/[0.05]">
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={handleExport}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors
                    bg-blue-50 text-blue-700 hover:bg-blue-100
                    dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20">
                  <Download className="w-3 h-3" /> Export CSV
                </button>
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <span className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin dark:border-indigo-700 dark:border-t-indigo-400" />
              <span className="text-[13px] text-slate-400 dark:text-slate-500">Searching students...</span>
            </div>
          )}

          {/* Empty state */}
          {!loading && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
                <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-slate-600 dark:text-slate-300">No students found</p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">Try adjusting your filters or search term</p>
              </div>
              <button onClick={handleClear}
                className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold rounded-lg transition-colors
                  bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-indigo-500/10 dark:text-indigo-300">
                <RotateCcw className="w-3.5 h-3.5" /> Clear filters
              </button>
            </div>
          )}

          {/* ── Desktop table (hidden on mobile) ── */}
          {!loading && pageData.length > 0 && (
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                    {COLS.map(col => (
                      <th key={col.key}
                        onClick={() => col.sortable && toggleSort(col.key)}
                        className={`px-4 py-3 text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider
                          ${col.sortable ? 'cursor-pointer hover:text-slate-600 dark:hover:text-slate-300 select-none' : ''}`}>
                        <div className="flex items-center gap-1">
                          {col.label}
                          {col.sortable && <SortIcon col={col.key} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((s, i) => (
                    <TableRow key={s.id} student={s} onView={setViewStudent} idx={i} />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ── Mobile cards (hidden on desktop) ── */}
          {!loading && pageData.length > 0 && (
            <div className="sm:hidden p-4 space-y-3">
              {pageData.map(s => (
                <MobileCard key={s.id} student={s} onView={setViewStudent} />
              ))}
            </div>
          )}

          {/* ── Pagination ── */}
          {!loading && display.length > PER_PAGE && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5
              border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/60 dark:bg-white/[0.01] flex-wrap">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, display.length)} of {display.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400
                    hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1).map((p, i, arr) => (
                  <>
                    {i > 0 && arr[i-1] !== p - 1 && <span key={`dot-${p}`} className="text-slate-300 dark:text-slate-600 px-1 text-[12px]">…</span>}
                    <button key={p} onClick={() => setPage(p)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-[12px] font-semibold transition-colors
                        ${page === p
                          ? 'bg-blue-600 text-white dark:bg-indigo-600 shadow-sm'
                          : 'border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                        }`}>
                      {p}
                    </button>
                  </>
                ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400
                    hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Student detail drawer */}
      {viewStudent && <StudentDrawer student={viewStudent} onClose={() => setViewStudent(null)} />}
    </div>
  )
}
