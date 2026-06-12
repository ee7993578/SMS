/**
 * Issue_book.jsx
 * Library → Item Issue / Return / Renew
 *
 * Converted from ASPX Issue_book.aspx to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Member type toggle (Student / Staff)
 *  - Item Accession No lookup → Book details panel
 *  - Member Code autocomplete → Member details panel
 *  - Class + Student dropdowns (Student mode)
 *  - Faculty dropdown (Staff mode)
 *  - Issue Date / Due Date pickers
 *  - Return / Renew / Lost flow with fine calculation
 *  - Show/hide Book Info & Member Info panels
 *  - Mobile: drawer filters, card-based member/book details
 *  - Desktop: dense ERP layout
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  BookOpen, Users, UserCheck, Search, RefreshCw,
  Calendar, AlertCircle, CheckCircle2, X, ChevronDown,
  BookMarked, ArrowLeftRight, RotateCcw, AlertTriangle,
  Eye, EyeOff, IndianRupee, StickyNote, Info,
  School, Briefcase, Hash, Phone, User, BookCopy,
  Clock, CalendarDays, ShieldAlert, Loader2, Check,
  ChevronRight, Home, Library, FileText, TrendingUp
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const CLASSES = [
  { id: 'nur_a', label: 'Nursery – A' },
  { id: 'nur_b', label: 'Nursery – B' },
  { id: 'lkg_a', label: 'LKG – A' },
  { id: 'lkg_b', label: 'LKG – B' },
  { id: 'ukg_a', label: 'UKG – A' },
  { id: 'cls1_a', label: 'Class I – A' },
  { id: 'cls1_b', label: 'Class I – B' },
  { id: 'cls6_a', label: 'Class VI – A' },
  { id: 'cls9_a', label: 'Class IX – A' },
  { id: 'cls10_a', label: 'Class X – A' },
  { id: 'cls12_a', label: 'Class XII – A' },
]

const STUDENTS_BY_CLASS = {
  cls1_a: [
    { id: 's1', admNo: 'ADM2025001', name: 'Aarav Sharma', father: 'Rajesh Sharma', phone: '9876543210', photo: 'https://ui-avatars.com/api/?name=Aarav+Sharma&background=3b82f6&color=fff&size=64' },
    { id: 's2', admNo: 'ADM2025002', name: 'Priya Verma',  father: 'Suresh Verma',  phone: '9876543211', photo: 'https://ui-avatars.com/api/?name=Priya+Verma&background=8b5cf6&color=fff&size=64'  },
    { id: 's3', admNo: 'ADM2025003', name: 'Rohan Gupta',  father: 'Mohan Gupta',   phone: '9876543212', photo: 'https://ui-avatars.com/api/?name=Rohan+Gupta&background=059669&color=fff&size=64'  },
  ],
  cls6_a: [
    { id: 's4', admNo: 'ADM2025004', name: 'Sneha Patel',  father: 'Dinesh Patel',  phone: '9876543213', photo: 'https://ui-avatars.com/api/?name=Sneha+Patel&background=d97706&color=fff&size=64'  },
    { id: 's5', admNo: 'ADM2025005', name: 'Karan Singh',  father: 'Harpal Singh',  phone: '9876543214', photo: 'https://ui-avatars.com/api/?name=Karan+Singh&background=dc2626&color=fff&size=64'  },
  ],
  cls9_a: [
    { id: 's6', admNo: 'ADM2025006', name: 'Ananya Joshi', father: 'Prakash Joshi', phone: '9876543215', photo: 'https://ui-avatars.com/api/?name=Ananya+Joshi&background=0891b2&color=fff&size=64' },
  ],
}

const STAFF_LIST = [
  { id: 'f1', empId: 'EMP001', name: 'Dr. Meena Kapoor',  dept: 'Science',    phone: '9811001100', photo: 'https://ui-avatars.com/api/?name=Meena+Kapoor&background=3b82f6&color=fff&size=64'  },
  { id: 'f2', empId: 'EMP002', name: 'Mr. Ramesh Tiwari', dept: 'Mathematics',phone: '9811001101', photo: 'https://ui-avatars.com/api/?name=Ramesh+Tiwari&background=8b5cf6&color=fff&size=64'  },
  { id: 'f3', empId: 'EMP003', name: 'Ms. Sunita Rawat',  dept: 'English',    phone: '9811001102', photo: 'https://ui-avatars.com/api/?name=Sunita+Rawat&background=059669&color=fff&size=64'   },
  { id: 'f4', empId: 'EMP004', name: 'Mr. Ajay Bhandari', dept: 'History',    phone: '9811001103', photo: 'https://ui-avatars.com/api/?name=Ajay+Bhandari&background=d97706&color=fff&size=64'  },
]

const BOOKS_DB = {
  'ACC001': { accNo: 'ACC001', title: 'Mathematics for Class X', author: 'R.D. Sharma',    publisher: 'Dhanpat Rai', isbn: '978-81-900-1234', edition: '12th', category: 'Textbook',  status: 'Available', rack: 'R-01', price: 450  },
  'ACC002': { accNo: 'ACC002', title: 'Science Wonders Vol 2',   author: 'P.K. Nag',       publisher: 'Tata McGraw', isbn: '978-81-900-5678', edition: '3rd',  category: 'Reference', status: 'Available', rack: 'R-02', price: 520  },
  'ACC003': { accNo: 'ACC003', title: 'Wings of Fire',           author: 'A.P.J. Kalam',   publisher: 'Universities Press', isbn: '978-81-7371-146-6', edition: '1st', category: 'Biography', status: 'Issued', rack: 'R-03', price: 195 },
  'ACC004': { accNo: 'ACC004', title: 'India After Gandhi',      author: 'Ramachandra Guha',publisher: 'Pan Macmillan', isbn: '978-0-33-390516-9', edition: '2nd',  category: 'History',   status: 'Available', rack: 'R-04', price: 699 },
}

// Issued records (for return/renew flow)
const ISSUED_RECORDS = {
  'ACC003-s4': {
    issueId: 'ISS2025001',
    accNo: 'ACC003',
    memberId: 's4',
    issueDate: '01 Jun 2025',
    dueDate: '15 Jun 2025',
    renewDate: null,
    returnDate: null,
    fineDue: 60,  // ₹ 4/day × 15 days overdue (dummy)
    isLost: false,
  }
}

const today = () => {
  const d = new Date()
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}

const dueDateDefault = () => {
  const d = new Date()
  d.setDate(d.getDate() + 14)
  return d.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' })
}

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
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function TextInput({ value, onChange, placeholder, error, disabled, icon: Icon, onKeyDown, readOnly, className = '' }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />}
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          read-only:bg-slate-50 dark:read-only:bg-slate-800/50 read-only:cursor-default
          ${Icon ? 'pl-8 pr-3' : 'px-3'}
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${className}`}
      />
    </div>
  )
}

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────
function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 mb-4">
      <Home className="w-3.5 h-3.5" />
      <ChevronRight className="w-3 h-3" />
      <span>Library</span>
      <ChevronRight className="w-3 h-3" />
      <span className="text-slate-700 dark:text-slate-300 font-semibold">Item Issue</span>
    </nav>
  )
}

// ─── MEMBER TYPE TOGGLE ───────────────────────────────────────────────────────
function MemberTypeToggle({ value, onChange }) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-slate-100 dark:bg-[#1e2238] p-0.5 gap-0.5">
      {['Student', 'Staff'].map(type => (
        <button
          key={type}
          type="button"
          onClick={() => onChange(type)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all flex-1 justify-center
            ${value === type
              ? 'bg-white dark:bg-[#252b45] text-blue-700 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          {type === 'Student' ? <School className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
          {type}
        </button>
      ))}
    </div>
  )
}

// ─── AUTOCOMPLETE INPUT ───────────────────────────────────────────────────────
function AutocompleteInput({ value, onChange, suggestions, onSelect, placeholder, icon: Icon, loading }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        {Icon && <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />}
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => value && setOpen(true)}
          placeholder={placeholder}
          className={`w-full py-2 pr-3 text-[13px] rounded-lg border outline-none transition-all
            bg-white text-slate-800 border-slate-200 placeholder-slate-300
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
            dark:placeholder-slate-600 dark:focus:border-indigo-400
            ${Icon ? 'pl-8' : 'pl-3'}`}
        />
        {loading && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 animate-spin" />}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 z-30 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] shadow-xl overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map(item => (
            <button
              key={item.id}
              type="button"
              onMouseDown={() => { onSelect(item); setOpen(false) }}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-indigo-500/10 transition-colors border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] last:border-0"
            >
              <img src={item.photo} alt={item.name} className="w-9 h-9 rounded-full flex-shrink-0 object-cover" />
              <div className="min-w-0">
                <p className="text-[12px] font-bold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">
                  {item.admNo || item.empId} · {item.dept || item.father}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── BOOK INFO CARD ───────────────────────────────────────────────────────────
function BookInfoCard({ book }) {
  const statusColor = book.status === 'Available'
    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
    : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50/60 dark:bg-blue-500/5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Book Details</span>
        <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor}`}>{book.status}</span>
      </div>
      <div className="p-4">
        <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-0.5">{book.title}</p>
        <p className="text-[12px] text-slate-500 dark:text-slate-400 mb-3">by {book.author}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {[
            { label: 'Accession No', value: book.accNo, icon: Hash },
            { label: 'Publisher', value: book.publisher, icon: BookCopy },
            { label: 'ISBN', value: book.isbn, icon: FileText },
            { label: 'Category', value: book.category, icon: BookMarked },
            { label: 'Rack', value: book.rack, icon: Library },
          ].map(({ label, value, icon: I }) => (
            <div key={label} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <div className="flex items-center gap-1 mb-1">
                <I className="w-3 h-3 text-blue-500 dark:text-blue-400" />
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</span>
              </div>
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MEMBER INFO CARD ─────────────────────────────────────────────────────────
function MemberInfoCard({ member, memberType, classLabel }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-violet-50/60 dark:bg-violet-500/5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <Users className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Member Details</span>
        <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
          {memberType}
        </span>
      </div>
      <div className="flex items-center gap-4 p-4">
        <img src={member.photo} alt={member.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0 shadow-sm" />
        <div className="flex-1 min-w-0">
          <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-1">{member.name}</p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Hash className="w-3 h-3" /> {member.admNo || member.empId}
            </span>
            {memberType === 'Student' && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <School className="w-3 h-3" /> {classLabel}
              </span>
            )}
            {memberType === 'Student' && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <User className="w-3 h-3" /> {member.father}
              </span>
            )}
            {memberType === 'Staff' && (
              <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <Briefcase className="w-3 h-3" /> {member.dept}
              </span>
            )}
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Phone className="w-3 h-3" /> {member.phone}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── RETURN / RENEW PANEL ─────────────────────────────────────────────────────
function ReturnRenewPanel({
  record, isLost, setIsLost,
  returnMode, setReturnMode,
  renewDate, setRenewDate,
  returnDate, setReturnDate,
  lostDate, setLostDate,
  finePaid, setFinePaid,
  remark, setRemark,
}) {
  return (
    <div className="rounded-xl border border-amber-200 dark:border-amber-500/25 bg-amber-50/40 dark:bg-amber-500/5 p-4 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span className="text-[13px] font-bold text-amber-700 dark:text-amber-400">Previously Issued — Action Required</span>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Issue Date',    value: record.issueDate,  color: 'blue',   icon: CalendarDays },
          { label: 'Due Date',      value: record.dueDate,    color: 'rose',   icon: Clock       },
          { label: 'Fine Due',      value: `₹ ${record.fineDue}`, color: 'amber', icon: IndianRupee },
          { label: 'Issue ID',      value: record.issueId,    color: 'violet', icon: Hash        },
        ].map(({ label, value, color, icon: I }) => {
          const cs = {
            blue:   'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
            rose:   'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
            amber:  'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
            violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400',
          }[color]
          return (
            <div key={label} className={`rounded-lg p-2.5 ${cs}`}>
              <div className="flex items-center gap-1 mb-0.5">
                <I className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase tracking-wide opacity-70">{label}</span>
              </div>
              <p className="text-[13px] font-bold">{value}</p>
            </div>
          )
        })}
      </div>

      {/* Is Lost toggle */}
      <label className="flex items-center gap-2.5 cursor-pointer select-none group w-fit">
        <div
          onClick={() => setIsLost(p => !p)}
          className={`w-10 h-5 rounded-full transition-all flex items-center px-0.5 ${isLost ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'}`}
        >
          <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${isLost ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Mark as Lost</span>
        {isLost && <ShieldAlert className="w-4 h-4 text-rose-500" />}
      </label>

      {/* Return / Renew radio */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-slate-100 dark:bg-[#1e2238] p-0.5 gap-0.5 w-fit">
        {[{ val: 'return', label: 'Return', icon: ArrowLeftRight }, { val: 'renew', label: 'Renew', icon: RotateCcw }].map(({ val, label, icon: I }) => (
          <button
            key={val}
            type="button"
            onClick={() => setReturnMode(val)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all
              ${returnMode === val ? 'bg-white dark:bg-[#252b45] text-blue-700 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-500'}`}
          >
            <I className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      {/* Date fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field label="Renew Date">
          <TextInput
            value={renewDate} onChange={e => setRenewDate(e.target.value)}
            placeholder="dd MMM yyyy" icon={Calendar}
            disabled={returnMode !== 'renew'}
          />
        </Field>
        <Field label="Return Date">
          <TextInput
            value={returnDate} onChange={e => setReturnDate(e.target.value)}
            placeholder="dd MMM yyyy" icon={Calendar}
          />
        </Field>
        {isLost && (
          <Field label="Lost Date">
            <TextInput
              value={lostDate} onChange={e => setLostDate(e.target.value)}
              placeholder="dd MMM yyyy" icon={Calendar}
            />
          </Field>
        )}
        <Field label="Fine Due">
          <TextInput value={`₹ ${record.fineDue}`} readOnly icon={IndianRupee} />
        </Field>
        <Field label="Fine Paid">
          <TextInput value={finePaid} onChange={e => setFinePaid(e.target.value)} placeholder="0" icon={IndianRupee} />
        </Field>
        <Field label="Remark">
          <TextInput value={remark} onChange={e => setRemark(e.target.value)} placeholder="Optional note…" icon={StickyNote} />
        </Field>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function IssueBook() {
  // ── Member type ────────────────────────────────────────────────────────
  const [memberType, setMemberType] = useState('Student')

  // ── Book lookup ────────────────────────────────────────────────────────
  const [accNo,     setAccNo]     = useState('')
  const [book,      setBook]      = useState(null)
  const [bookError, setBookError] = useState('')
  const [bookLoading, setBookLoading] = useState(false)

  // ── Member lookup ──────────────────────────────────────────────────────
  const [memberCodeInput, setMemberCodeInput] = useState('')
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [selectedFaculty, setSelectedFaculty] = useState('')
  const [member,          setMember]          = useState(null)
  const [memberLoading,   setMemberLoading]   = useState(false)

  // ── Issue dates ────────────────────────────────────────────────────────
  const [issueDate, setIssueDate] = useState(today())
  const [dueDate,   setDueDate]   = useState(dueDateDefault())

  // ── Return / Renew ─────────────────────────────────────────────────────
  const [issuedRecord, setIssuedRecord] = useState(null)
  const [isLost,       setIsLost]       = useState(false)
  const [returnMode,   setReturnMode]   = useState('return')
  const [renewDate,    setRenewDate]    = useState('')
  const [returnDate,   setReturnDate]   = useState(today())
  const [lostDate,     setLostDate]     = useState('')
  const [finePaid,     setFinePaid]     = useState('')
  const [remark,       setRemark]       = useState('')

  // ── UI state ───────────────────────────────────────────────────────────
  const [showBookInfo,   setShowBookInfo]   = useState(true)
  const [showMemberInfo, setShowMemberInfo] = useState(true)
  const [submitting,     setSubmitting]     = useState(false)
  const [toast,          setToast]          = useState(null)
  const [errors,         setErrors]         = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Derived: student autocomplete suggestions ──────────────────────────
  const studentSuggestions = useMemo(() => {
    if (!memberCodeInput || memberType !== 'Student') return []
    const q = memberCodeInput.toLowerCase()
    const pool = selectedClass ? (STUDENTS_BY_CLASS[selectedClass] || []) : Object.values(STUDENTS_BY_CLASS).flat()
    return pool.filter(s => s.name.toLowerCase().includes(q) || s.admNo.toLowerCase().includes(q)).slice(0, 6)
  }, [memberCodeInput, memberType, selectedClass])

  const staffSuggestions = useMemo(() => {
    if (!memberCodeInput || memberType !== 'Staff') return []
    const q = memberCodeInput.toLowerCase()
    return STAFF_LIST.filter(f => f.name.toLowerCase().includes(q) || f.empId.toLowerCase().includes(q)).slice(0, 6)
  }, [memberCodeInput, memberType])

  const suggestions = memberType === 'Student' ? studentSuggestions : staffSuggestions

  // ── Book lookup on accession no blur ──────────────────────────────────
  const handleAccNoLookup = useCallback(() => {
    if (!accNo.trim()) { setBook(null); setBookError(''); setIssuedRecord(null); return }
    setBookLoading(true)
    setBookError('')
    setTimeout(() => {
      const found = BOOKS_DB[accNo.trim().toUpperCase()]
      if (found) {
        setBook(found)
        // Check if this book is already issued to current member
        const key = `${found.accNo}-${member?.id}`
        const ir = ISSUED_RECORDS[key]
        setIssuedRecord(ir || null)
        if (ir) showToast('This book is already issued to this member. Select Return or Renew.', 'info')
      } else {
        setBook(null)
        setIssuedRecord(null)
        setBookError('No book found with this accession number.')
      }
      setBookLoading(false)
    }, 400)
  }, [accNo, member])

  // ── Member selection ───────────────────────────────────────────────────
  const handleSelectMember = useCallback((item) => {
    setMember(item)
    setMemberCodeInput(item.admNo || item.empId)
    if (memberType === 'Student') {
      setSelectedStudent(item.id)
    } else {
      setSelectedFaculty(item.id)
    }
    // Re-check issued record
    if (book) {
      const key = `${book.accNo}-${item.id}`
      const ir = ISSUED_RECORDS[key]
      setIssuedRecord(ir || null)
      if (ir) showToast('This book is issued to this member. You can Return or Renew.', 'info')
    }
  }, [memberType, book])

  // ── Student dropdown select ────────────────────────────────────────────
  const handleStudentDropdown = useCallback((e) => {
    const sid = e.target.value
    setSelectedStudent(sid)
    if (!sid) { setMember(null); setMemberCodeInput(''); return }
    const pool = STUDENTS_BY_CLASS[selectedClass] || []
    const found = pool.find(s => s.id === sid)
    if (found) {
      setMember(found)
      setMemberCodeInput(found.admNo)
    }
  }, [selectedClass])

  // ── Faculty dropdown select ────────────────────────────────────────────
  const handleFacultyDropdown = useCallback((e) => {
    const fid = e.target.value
    setSelectedFaculty(fid)
    if (!fid) { setMember(null); setMemberCodeInput(''); return }
    const found = STAFF_LIST.find(f => f.id === fid)
    if (found) {
      setMember(found)
      setMemberCodeInput(found.empId)
    }
  }, [])

  // ── Class change ───────────────────────────────────────────────────────
  const handleClassChange = (e) => {
    setSelectedClass(e.target.value)
    setSelectedStudent('')
    setMember(null)
    setMemberCodeInput('')
  }

  // ── Member type change ─────────────────────────────────────────────────
  const handleMemberTypeChange = (type) => {
    setMemberType(type)
    setMember(null)
    setMemberCodeInput('')
    setSelectedClass('')
    setSelectedStudent('')
    setSelectedFaculty('')
    setIssuedRecord(null)
  }

  // ── Validate ───────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!accNo.trim())                             e.accNo = 'Accession number required'
    if (!book)                                     e.accNo = 'Lookup book first (press Enter or Tab)'
    if (!member)                                   e.member = 'Select a member'
    if (!issueDate)                                e.issueDate = 'Issue date required'
    if (!dueDate)                                  e.dueDate = 'Due date required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleIssue = () => {
    if (!validate()) { showToast('Please fill all required fields.', 'error'); return }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      const action = issuedRecord ? (returnMode === 'return' ? 'Returned' : 'Renewed') : 'Issued'
      showToast(`Book ${action} successfully! 🎉`)
      // Reset
      setAccNo(''); setBook(null); setMember(null); setMemberCodeInput('')
      setSelectedClass(''); setSelectedStudent(''); setSelectedFaculty('')
      setIssuedRecord(null); setIsLost(false); setReturnMode('return')
      setRenewDate(''); setReturnDate(today()); setLostDate(''); setFinePaid(''); setRemark('')
      setIssueDate(today()); setDueDate(dueDateDefault())
      setErrors({})
    }, 900)
  }

  const classLabel = CLASSES.find(c => c.id === selectedClass)?.label || ''

  return (
    <div className="space-y-4 pb-12 max-w-screen-xl mx-auto px-3 sm:px-4">
      <style>{`
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn .2s ease}
      `}</style>

      <Breadcrumb />

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Item Issue
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Issue, return, or renew library items for students and staff.
          </p>
        </div>
      </div>

      {/* ── MAIN FORM CARD ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Issue Details</span>
        </div>

        <div className="p-4 sm:p-5 space-y-5">
          {/* Row 1: Type + Accession + Member Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Member Type */}
            <div className="sm:col-span-1">
              <Field label="Member Type" required>
                <MemberTypeToggle value={memberType} onChange={handleMemberTypeChange} />
              </Field>
            </div>

            {/* Accession No */}
            <Field label="Item Accession No" error={errors.accNo} required>
              <div className="flex gap-1">
                <div className="flex-1">
                  <TextInput
                    value={accNo}
                    onChange={e => { setAccNo(e.target.value.toUpperCase()); setBookError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleAccNoLookup()}
                    placeholder="e.g. ACC001"
                    icon={Hash}
                    error={errors.accNo}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAccNoLookup}
                  disabled={bookLoading}
                  className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors disabled:opacity-70 flex-shrink-0"
                  title="Lookup"
                >
                  {bookLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </button>
              </div>
              {bookError && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
                  <AlertCircle className="w-3 h-3" />{bookError}
                </p>
              )}
            </Field>

            {/* Member Code */}
            <Field label="Member Code / Name" error={errors.member} required>
              <AutocompleteInput
                value={memberCodeInput}
                onChange={val => { setMemberCodeInput(val); if (!val) setMember(null) }}
                suggestions={suggestions}
                onSelect={handleSelectMember}
                placeholder={memberType === 'Student' ? 'Adm No or Name…' : 'Emp ID or Name…'}
                icon={UserCheck}
              />
              {errors.member && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
                  <AlertCircle className="w-3 h-3" />{errors.member}
                </p>
              )}
            </Field>

            {/* Spacer on large */}
            <div className="hidden lg:block" />
          </div>

          {/* Row 2: Class/Student (Student) or Faculty (Staff) */}
          {memberType === 'Student' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fade-in">
              <Field label="Select Class">
                <NativeSelect value={selectedClass} onChange={handleClassChange} placeholder="-- All Classes --">
                  {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Select Student">
                <NativeSelect
                  value={selectedStudent}
                  onChange={handleStudentDropdown}
                  placeholder="-- Select Student --"
                  disabled={!selectedClass}
                >
                  {(STUDENTS_BY_CLASS[selectedClass] || []).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.admNo})</option>
                  ))}
                </NativeSelect>
              </Field>
            </div>
          )}

          {memberType === 'Staff' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 fade-in">
              <Field label="Select Faculty">
                <NativeSelect value={selectedFaculty} onChange={handleFacultyDropdown} placeholder="-- Select Faculty --">
                  {STAFF_LIST.map(f => <option key={f.id} value={f.id}>{f.name} ({f.dept})</option>)}
                </NativeSelect>
              </Field>
            </div>
          )}

          {/* Row 3: Issue + Due dates */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Issue Date" error={errors.issueDate} required>
              <TextInput
                value={issueDate}
                onChange={e => setIssueDate(e.target.value)}
                placeholder="dd MMM yyyy"
                icon={Calendar}
                error={errors.issueDate}
              />
            </Field>
            <Field label="Due Date" error={errors.dueDate} required>
              <TextInput
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                placeholder="dd MMM yyyy"
                icon={Calendar}
                error={errors.dueDate}
              />
            </Field>
          </div>

          {/* Return / Renew panel — shown only if record already issued */}
          {issuedRecord && (
            <ReturnRenewPanel
              record={issuedRecord}
              isLost={isLost} setIsLost={setIsLost}
              returnMode={returnMode} setReturnMode={setReturnMode}
              renewDate={renewDate} setRenewDate={setRenewDate}
              returnDate={returnDate} setReturnDate={setReturnDate}
              lostDate={lostDate} setLostDate={setLostDate}
              finePaid={finePaid} setFinePaid={setFinePaid}
              remark={remark} setRemark={setRemark}
            />
          )}

          {/* Show/Hide toggles */}
          <div className="flex flex-wrap gap-3 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div
                onClick={() => setShowBookInfo(p => !p)}
                className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5 ${showBookInfo ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${showBookInfo ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="flex items-center gap-1 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                {showBookInfo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                Show Book Info
              </span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div
                onClick={() => setShowMemberInfo(p => !p)}
                className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5 ${showMemberInfo ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform ${showMemberInfo ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <span className="flex items-center gap-1 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                {showMemberInfo ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                Show Member Info
              </span>
            </label>
          </div>
        </div>

        {/* Card Footer / Submit */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center px-4 sm:px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <button
            type="button"
            onClick={handleIssue}
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-8 py-2.5 rounded-xl text-[13px] font-bold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70"
          >
            {submitting ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Processing…</>
            ) : issuedRecord ? (
              returnMode === 'return'
                ? <><ArrowLeftRight className="w-4 h-4" /> Return Item</>
                : <><RotateCcw className="w-4 h-4" /> Renew Item</>
            ) : (
              <><BookMarked className="w-4 h-4" /> Issue Item</>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setAccNo(''); setBook(null); setMember(null); setMemberCodeInput('')
              setSelectedClass(''); setSelectedStudent(''); setSelectedFaculty('')
              setIssuedRecord(null); setIsLost(false); setReturnMode('return')
              setRenewDate(''); setReturnDate(today()); setLostDate(''); setFinePaid(''); setRemark('')
              setIssueDate(today()); setDueDate(dueDateDefault()); setErrors({})
              setBookError('')
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
              transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* ── INFO PANELS ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        {/* Book Details */}
        {showBookInfo && book && (
          <div className="fade-in">
            <BookInfoCard book={book} />
          </div>
        )}

        {/* Book not found hint */}
        {showBookInfo && !book && accNo && !bookLoading && (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-6 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600 fade-in">
            <BookOpen className="w-8 h-8 opacity-40" />
            <p className="text-[13px] font-semibold">Enter a valid accession number and press lookup to see book details.</p>
          </div>
        )}

        {/* Member Details */}
        {showMemberInfo && member && (
          <div className="fade-in">
            <MemberInfoCard member={member} memberType={memberType} classLabel={classLabel} />
          </div>
        )}

        {/* Empty member hint */}
        {showMemberInfo && !member && (
          <div className="rounded-xl border border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-6 flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600 fade-in">
            <Users className="w-8 h-8 opacity-40" />
            <p className="text-[13px] font-semibold">Search by member code or select from the dropdown to see member details.</p>
          </div>
        )}
      </div>

      {/* ── QUICK TIPS ─────────────────────────────────────────────────────── */}
      <div className="rounded-xl border border-blue-100 dark:border-[rgba(99,102,241,0.15)] bg-blue-50/40 dark:bg-blue-500/[0.04] p-4">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[12px] font-bold text-blue-700 dark:text-blue-400">Quick Tips</p>
            <ul className="text-[12px] text-blue-600 dark:text-blue-400/80 space-y-0.5 list-disc list-inside">
              <li>Type accession number and press <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-mono">Enter</kbd> or click the search icon to look up a book.</li>
              <li>Use member code field to search by admission number, employee ID, or name (autocomplete).</li>
              <li>If a book is already issued to the selected member, the Return/Renew panel appears automatically.</li>
              <li>Try Accession No: <strong>ACC001</strong>, <strong>ACC002</strong>, <strong>ACC003</strong>, <strong>ACC004</strong> · For ACC003 + Class I-A → Sneha Patel triggers Return flow.</li>
            </ul>
          </div>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
