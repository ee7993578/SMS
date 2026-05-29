/**
 * StudentList.jsx
 * Folder: src/pages/Student/Reports/StudentList.jsx
 *
 * Converts legacy ASPX "Student List" (Not Promoted / Section Not Alloted) report
 * to fully-responsive React + Tailwind.
 *
 * Columns  : S.No, Registration No, Name, Class
 * Filters  : Session, Type (Not Promoted | Section Not Alloted)
 * Features : Show report, Excel export, search, mobile cards, drawer filter
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, UserX, BookOpen, SlidersHorizontal,
  Search, FileSpreadsheet, BarChart3, Info,
  School2, MapPin, Building2, ChevronRight,
  Hash, BadgeCheck, GraduationCap, TrendingUp,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const TYPES = [
  { value: 'notpromoted',        label: 'Not Promoted'          },
  { value: 'section_notalloted', label: 'Section Not Alloted'   },
]

const SCHOOL_INFO = {
  name:    'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// ── Dummy students per session × type ─────────────────────────────────────────
const STUDENT_DATA = {
  '2022-23': {
    notpromoted: [
      { registration_no: 'REG-2201', name: 'Aarav Sharma',       class_name: 'Class V'    },
      { registration_no: 'REG-2202', name: 'Priya Gupta',        class_name: 'Class III'  },
      { registration_no: 'REG-2203', name: 'Rahul Verma',        class_name: 'Class VII'  },
      { registration_no: 'REG-2204', name: 'Sneha Patel',        class_name: 'Class II'   },
      { registration_no: 'REG-2205', name: 'Mohit Singh',        class_name: 'Class VIII' },
      { registration_no: 'REG-2206', name: 'Divya Rao',          class_name: 'Class IV'   },
      { registration_no: 'REG-2207', name: 'Ankur Mishra',       class_name: 'Class VI'   },
      { registration_no: 'REG-2208', name: 'Kavya Joshi',        class_name: 'Class IX'   },
    ],
    section_notalloted: [
      { registration_no: 'REG-2230', name: 'Riya Tiwari',        class_name: 'Class I'    },
      { registration_no: 'REG-2231', name: 'Harsh Yadav',        class_name: 'Class XI'   },
      { registration_no: 'REG-2232', name: 'Nisha Chauhan',      class_name: 'Class X'    },
      { registration_no: 'REG-2233', name: 'Vikram Soni',        class_name: 'Class VI'   },
      { registration_no: 'REG-2234', name: 'Pooja Kumari',       class_name: 'Class XII'  },
    ],
  },
  '2023-24': {
    notpromoted: [
      { registration_no: 'REG-2301', name: 'Arjun Nair',         class_name: 'Class VI'   },
      { registration_no: 'REG-2302', name: 'Simran Kaur',        class_name: 'Class IV'   },
      { registration_no: 'REG-2303', name: 'Deepak Kumar',       class_name: 'Class VIII' },
      { registration_no: 'REG-2304', name: 'Anita Mehra',        class_name: 'Class II'   },
      { registration_no: 'REG-2305', name: 'Suraj Pandey',       class_name: 'Class IX'   },
      { registration_no: 'REG-2306', name: 'Tanvi Saxena',       class_name: 'Class III'  },
      { registration_no: 'REG-2307', name: 'Rohit Dubey',        class_name: 'Class VII'  },
      { registration_no: 'REG-2308', name: 'Meera Pillai',       class_name: 'Class V'    },
      { registration_no: 'REG-2309', name: 'Nitin Agarwal',      class_name: 'Class X'    },
      { registration_no: 'REG-2310', name: 'Sonal Trivedi',      class_name: 'Class I'    },
    ],
    section_notalloted: [
      { registration_no: 'REG-2340', name: 'Gaurav Bhatt',       class_name: 'Class XI'   },
      { registration_no: 'REG-2341', name: 'Lakshmi Devi',       class_name: 'Class VII'  },
      { registration_no: 'REG-2342', name: 'Rakesh Rawat',       class_name: 'Class III'  },
    ],
  },
  '2024-25': {
    notpromoted: [
      { registration_no: 'REG-2401', name: 'Ishaan Malik',       class_name: 'Class VII'  },
      { registration_no: 'REG-2402', name: 'Poonam Dixit',       class_name: 'Class V'    },
      { registration_no: 'REG-2403', name: 'Karan Thakur',       class_name: 'Class IX'   },
      { registration_no: 'REG-2404', name: 'Swati Bose',         class_name: 'Class VI'   },
      { registration_no: 'REG-2405', name: 'Varun Goswami',      class_name: 'Class XI'   },
      { registration_no: 'REG-2406', name: 'Ritika Jain',        class_name: 'Class IV'   },
      { registration_no: 'REG-2407', name: 'Aditya Shukla',      class_name: 'Class VIII' },
    ],
    section_notalloted: [
      { registration_no: 'REG-2430', name: 'Preeti Vyas',        class_name: 'Class XII'  },
      { registration_no: 'REG-2431', name: 'Saurabh Tomar',      class_name: 'Class X'    },
      { registration_no: 'REG-2432', name: 'Anjali Bhardwaj',    class_name: 'Class II'   },
      { registration_no: 'REG-2433', name: 'Manish Rathore',     class_name: 'Class IX'   },
      { registration_no: 'REG-2434', name: 'Kajal Singh',        class_name: 'Class VI'   },
      { registration_no: 'REG-2435', name: 'Sumit Pandey',       class_name: 'Class XI'   },
    ],
  },
  '2025-26': {
    notpromoted: [
      { registration_no: 'REG-2501', name: 'Naman Kapoor',       class_name: 'Class VI'   },
      { registration_no: 'REG-2502', name: 'Roshni Desai',       class_name: 'Class IV'   },
      { registration_no: 'REG-2503', name: 'Yash Bajaj',         class_name: 'Class VIII' },
      { registration_no: 'REG-2504', name: 'Shweta Bansal',      class_name: 'Class III'  },
      { registration_no: 'REG-2505', name: 'Tarun Choudhary',    class_name: 'Class X'    },
      { registration_no: 'REG-2506', name: 'Aditi Srivastava',   class_name: 'Class VII'  },
      { registration_no: 'REG-2507', name: 'Vishal Yadav',       class_name: 'Class V'    },
      { registration_no: 'REG-2508', name: 'Nikita Garg',        class_name: 'Class IX'   },
      { registration_no: 'REG-2509', name: 'Pranav Mehta',       class_name: 'Class II'   },
      { registration_no: 'REG-2510', name: 'Shruti Puri',        class_name: 'Class XI'   },
      { registration_no: 'REG-2511', name: 'Ankit Rana',         class_name: 'Class VI'   },
      { registration_no: 'REG-2512', name: 'Deepika Negi',       class_name: 'Class XII'  },
    ],
    section_notalloted: [
      { registration_no: 'REG-2540', name: 'Himanshu Tiwari',    class_name: 'Class X'    },
      { registration_no: 'REG-2541', name: 'Pallavi Shah',       class_name: 'Class VIII' },
      { registration_no: 'REG-2542', name: 'Rohit Sahu',         class_name: 'Class III'  },
      { registration_no: 'REG-2543', name: 'Sweta Biswas',       class_name: 'Class VII'  },
    ],
  },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') =>
  CLASS_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

const classAbbr = (name = '') =>
  name.replace('Class ', '').slice(0, 3).toUpperCase() || name.slice(0, 3).toUpperCase()

const TYPE_META = {
  notpromoted:        { label: 'Not Promoted',        color: 'rose',    icon: UserX     },
  section_notalloted: { label: 'Section Not Alloted', color: 'amber',   icon: BookOpen  },
}

const TYPE_BADGE = {
  rose:  'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
}

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
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
          }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
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
    blue:  'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    rose:  'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
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

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────

function SchoolHeader({ session, type }) {
  const meta = TYPE_META[type] || {}
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </div>
        {meta.label && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold ${TYPE_BADGE[meta.color]}`}>
            {meta.icon && <meta.icon className="w-3.5 h-3.5" />}
            {meta.label}
          </div>
        )}
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Student List Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx }) {
  const { fg, bg } = classColor(row.class_name)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-14">
        {idx}
      </td>

      {/* Registration No */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="font-mono text-[12px] font-semibold text-blue-700 dark:text-blue-400 tracking-wide">
            {row.registration_no}
          </span>
        </div>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold uppercase"
            style={{ background: bg, color: fg }}
          >
            {row.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.name}</span>
        </div>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold border"
            style={{ background: bg, color: fg, borderColor: `${fg}33` }}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            {row.class_name}
          </span>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────

function MobileCard({ row, idx }) {
  const { fg, bg } = classColor(row.class_name)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Avatar */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold uppercase"
          style={{ background: bg, color: fg }}
        >
          {row.name.slice(0, 2).toUpperCase()}
        </span>

        <div className="flex-1 min-w-0">
          {/* Name */}
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.name}
          </p>
          {/* Reg No */}
          <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            <Hash className="w-3 h-3" />
            <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{row.registration_no}</span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {/* S.No badge */}
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">#{idx}</span>
          {/* Class pill */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border"
            style={{ background: bg, color: fg, borderColor: `${fg}33` }}
          >
            <GraduationCap className="w-3 h-3" />
            {row.class_name}
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, session, setSession, type, setType, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Title */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Type" error={errors.type} required>
            <NativeSelect
              value={type}
              onChange={e => setType(e.target.value)}
              placeholder="-- Select Type --"
              error={errors.type}
            >
              {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </NativeSelect>
          </Field>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onShow(); onClose() }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function StudentList() {
  const [session,      setSession]      = useState('')
  const [type,         setType]         = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')
  const [shownType,    setShownType]    = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate + Fetch ──────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!type)    err.type    = 'Please select a type'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = STUDENT_DATA[session]?.[type] || []
      setRows(data)
      setShownSession(session)
      setShownType(type)
      setShown(true)
      setLoading(false)
      if (data.length === 0) {
        showToast(`No students found for selected criteria.`, 'error')
      } else {
        showToast(`Loaded ${data.length} student${data.length !== 1 ? 's' : ''} for session ${session}.`)
      }
    }, 650)
  }, [session, type])

  const handleReset = () => {
    setSession(''); setType(''); setRows([])
    setSearch(''); setErrors({}); setShown(false)
    setShownSession(''); setShownType('')
  }

  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search Filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.registration_no.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults    = shown && rows.length > 0
  const activeFilters = [session, type].filter(Boolean).length
  const typeMeta      = TYPE_META[shownType] || {}

  // Unique classes in filtered results
  const uniqueClasses = useMemo(
    () => [...new Set(filtered.map(r => r.class_name))].length,
    [filtered]
  )

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <School2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Student List
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View not-promoted students or students with section not alloted.
          </p>
        </div>

        {hasResults && (
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

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Type */}
            <Field label="Type" error={errors.type} required>
              <NativeSelect
                value={type}
                onChange={e => { setType(e.target.value); setErrors(p => ({ ...p, type: undefined })) }}
                placeholder="-- Select Type --"
                error={errors.type}
              >
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacer */}
            <div />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {session && type
            ? `${session} · ${TYPES.find(t => t.value === type)?.label || type}`
            : session
              ? `Session: ${session}`
              : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>

        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}

        {hasResults && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────────────────────── */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        type={type}
        setType={setType}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
              style={{ opacity: 1 - i * 0.12 }}
            />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} type={shownType} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SummaryCard icon={Users}          label="Total Students"    value={filtered.length}  color="blue"   />
            <SummaryCard icon={typeMeta.icon || UserX} label={typeMeta.label || 'Students'} value={rows.length} color="rose" />
            <SummaryCard icon={GraduationCap}  label="Classes Affected"  value={uniqueClasses}    color="amber"  />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student List</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                {typeMeta.label && (
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${TYPE_BADGE[typeMeta.color]} flex-shrink-0`}>
                    {typeMeta.label}
                  </span>
                )}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, reg no, class…"
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
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                {shownType === 'notpromoted'
                  ? 'Students who were not promoted to the next class in the selected session.'
                  : 'Students who are admitted but have not been assigned to any section yet.'}
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Registration No', 'Name', 'Class'].map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-14"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.registration_no} row={row} idx={i + 1} />
                    ))}
                  </tbody>
                  {/* Footer total row */}
                  <tfoot>
                    <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                      <td className="px-4 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                      <td className="px-4 py-3" colSpan={3}>
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Total: <span className="text-blue-600 dark:text-blue-400">{filtered.length}</span> student{filtered.length !== 1 ? 's' : ''}
                          &nbsp;·&nbsp;
                          <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{uniqueClasses} class{uniqueClasses !== 1 ? 'es' : ''} affected</span>
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    {filtered.length} student{filtered.length !== 1 ? 's' : ''} found · {uniqueClasses} class{uniqueClasses !== 1 ? 'es' : ''} affected
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={row.registration_no} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Total Summary */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{filtered.length}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{uniqueClasses}</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Classes Affected</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>Session</strong> and <strong>Type</strong>, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
