/**
 * TuckshopAssignExpenseReport.jsx
 * Folder: src/pages/Reports/Tuckshop/TuckshopAssignExpenseReport.jsx
 *
 * Converts legacy ASPX "Tuckshop Assign Expense Report" to
 * fully-responsive React + Tailwind.
 *
 * Columns: S.No, Registration No, Name, Total Expense
 * Features:
 *  - Session dropdown filter
 *  - Submit + Excel export buttons
 *  - Loading states, empty states, toast notifications
 *  - Mobile: stacked cards with expense highlight
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search,
  FileSpreadsheet, ShoppingBag,
  Receipt, IndianRupee, Hash, User,
  TrendingUp, BarChart3, ChevronRight,
  Info, Building2, MapPin
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const EXPENSE_DATA = {
  '2022-23': [
    { registration_no: 'SVM2200001', name: 'Aarav Sharma',       charges: 4850  },
    { registration_no: 'SVM2200002', name: 'Priya Negi',          charges: 3200  },
    { registration_no: 'SVM2200003', name: 'Rohan Bisht',         charges: 5600  },
    { registration_no: 'SVM2200004', name: 'Sneha Rawat',         charges: 2900  },
    { registration_no: 'SVM2200005', name: 'Karan Joshi',         charges: 6100  },
    { registration_no: 'SVM2200006', name: 'Ananya Pandey',       charges: 4100  },
    { registration_no: 'SVM2200007', name: 'Vikram Singh',        charges: 3750  },
    { registration_no: 'SVM2200008', name: 'Pooja Thakur',        charges: 5300  },
    { registration_no: 'SVM2200009', name: 'Arnav Gupta',         charges: 2600  },
    { registration_no: 'SVM2200010', name: 'Riya Mehta',          charges: 4400  },
    { registration_no: 'SVM2200011', name: 'Siddharth Kumar',     charges: 3980  },
    { registration_no: 'SVM2200012', name: 'Tanvi Arora',         charges: 5150  },
  ],
  '2023-24': [
    { registration_no: 'SVM2300001', name: 'Aditya Verma',        charges: 5200  },
    { registration_no: 'SVM2300002', name: 'Meera Chauhan',       charges: 3800  },
    { registration_no: 'SVM2300003', name: 'Rahul Dobhal',        charges: 6400  },
    { registration_no: 'SVM2300004', name: 'Kavya Rana',          charges: 3100  },
    { registration_no: 'SVM2300005', name: 'Ishaan Tomar',        charges: 7200  },
    { registration_no: 'SVM2300006', name: 'Divya Bhatt',         charges: 4500  },
    { registration_no: 'SVM2300007', name: 'Yash Nandal',         charges: 3950  },
    { registration_no: 'SVM2300008', name: 'Nandini Saxena',      charges: 5800  },
    { registration_no: 'SVM2300009', name: 'Parth Agarwal',       charges: 2750  },
    { registration_no: 'SVM2300010', name: 'Shruti Kapoor',       charges: 4650  },
    { registration_no: 'SVM2300011', name: 'Dev Malhotra',        charges: 6100  },
    { registration_no: 'SVM2300012', name: 'Aditi Srivastava',    charges: 3300  },
    { registration_no: 'SVM2300013', name: 'Nikhil Rathore',      charges: 5500  },
    { registration_no: 'SVM2300014', name: 'Swati Mishra',        charges: 4200  },
  ],
  '2024-25': [
    { registration_no: 'SVM2400001', name: 'Arjun Patil',         charges: 5600  },
    { registration_no: 'SVM2400002', name: 'Simran Khatri',       charges: 4100  },
    { registration_no: 'SVM2400003', name: 'Varun Dixit',         charges: 7000  },
    { registration_no: 'SVM2400004', name: 'Pallavi Dubey',       charges: 3400  },
    { registration_no: 'SVM2400005', name: 'Kartik Sharma',       charges: 8100  },
    { registration_no: 'SVM2400006', name: 'Ritika Bansal',       charges: 4700  },
    { registration_no: 'SVM2400007', name: 'Mohit Yadav',         charges: 4050  },
    { registration_no: 'SVM2400008', name: 'Neha Pandey',         charges: 6200  },
    { registration_no: 'SVM2400009', name: 'Saurav Tiwari',       charges: 2900  },
    { registration_no: 'SVM2400010', name: 'Anjali Gupta',        charges: 5100  },
    { registration_no: 'SVM2400011', name: 'Deepak Rawat',        charges: 6700  },
    { registration_no: 'SVM2400012', name: 'Megha Negi',          charges: 3600  },
    { registration_no: 'SVM2400013', name: 'Shubham Bisht',       charges: 5950  },
    { registration_no: 'SVM2400014', name: 'Prachi Jain',         charges: 4450  },
    { registration_no: 'SVM2400015', name: 'Aman Verma',          charges: 7300  },
    { registration_no: 'SVM2400016', name: 'Komal Singh',         charges: 3850  },
  ],
  '2025-26': [
    { registration_no: 'SVM2500001', name: 'Ayush Thakur',        charges: 6100  },
    { registration_no: 'SVM2500002', name: 'Ishita Sharma',       charges: 4400  },
    { registration_no: 'SVM2500003', name: 'Rishabh Chauhan',     charges: 7500  },
    { registration_no: 'SVM2500004', name: 'Sanya Negi',          charges: 3700  },
    { registration_no: 'SVM2500005', name: 'Harsh Dobhal',        charges: 8800  },
    { registration_no: 'SVM2500006', name: 'Tanya Rana',          charges: 5100  },
    { registration_no: 'SVM2500007', name: 'Abhishek Tomar',      charges: 4250  },
    { registration_no: 'SVM2500008', name: 'Vrinda Bhatt',        charges: 6600  },
    { registration_no: 'SVM2500009', name: 'Gaurav Nandal',       charges: 3150  },
    { registration_no: 'SVM2500010', name: 'Monika Saxena',       charges: 5500  },
    { registration_no: 'SVM2500011', name: 'Tushar Agarwal',      charges: 7100  },
    { registration_no: 'SVM2500012', name: 'Nisha Kapoor',        charges: 3900  },
    { registration_no: 'SVM2500013', name: 'Rahul Malhotra',      charges: 6350  },
    { registration_no: 'SVM2500014', name: 'Preeti Srivastava',   charges: 4800  },
    { registration_no: 'SVM2500015', name: 'Akash Rathore',       charges: 7750  },
    { registration_no: 'SVM2500016', name: 'Jyoti Mishra',        charges: 4150  },
    { registration_no: 'SVM2500017', name: 'Vivek Patil',         charges: 5850  },
    { registration_no: 'SVM2500018', name: 'Renu Khatri',         charges: 3550  },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)

/** Color band based on expense amount */
const expenseLevel = (charges) => {
  if (charges >= 7000) return { label: 'High',   badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',   dot: 'bg-rose-500'   }
  if (charges >= 4500) return { label: 'Medium', badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400', dot: 'bg-amber-500'  }
  return                      { label: 'Low',    badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400', dot: 'bg-emerald-500' }
}

/** Avatar initials color */
const AVATAR_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

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

// ─── SUMMARY STAT CARDS ───────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session }) {
  return (
    <div className="rounded-2xl border border-orange-100 dark:border-[rgba(251,146,60,0.2)] bg-gradient-to-r from-orange-50 via-white to-amber-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-400">
        Tuckshop Assign Expense Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-orange-50 dark:bg-orange-500/[0.07] border-t-2 border-orange-200 dark:border-orange-500/30">
        <td className="px-4 py-3 text-center text-[12px] text-orange-400">—</td>
        <td className="px-4 py-3 text-center text-[12px] text-orange-400">—</td>
        <td className="px-4 py-3">
          <span className="text-[13px] font-bold text-orange-700 dark:text-orange-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Grand Total
          </span>
        </td>
        <td className="px-4 py-3 text-right pr-6">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[13px] font-bold bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 tabular-nums">
            <IndianRupee className="w-3.5 h-3.5" />
            {row.charges.toLocaleString('en-IN')}
          </span>
        </td>
      </tr>
    )
  }

  const { fg, bg } = avatarColor(row.name)
  const level = expenseLevel(row.charges)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Reg No */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
          <Hash className="w-3 h-3 text-slate-400" />
          {row.registration_no}
        </span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {initials(row.name)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.name}</span>
        </div>
      </td>

      {/* Total Expense */}
      <td className="px-4 py-3 text-right pr-6">
        <div className="flex items-center justify-end gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${level.badge}`}>
            {level.label}
          </span>
          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">
            {formatCurrency(row.charges)}
          </span>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE EXPENSE CARD ──────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const { fg, bg } = avatarColor(row.name)
  const level = expenseLevel(row.charges)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Avatar */}
        <span
          className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {initials(row.name)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Hash className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">{row.registration_no}</span>
          </div>
        </div>

        {/* Expense */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[18px] font-bold text-orange-600 dark:text-orange-400 tabular-nums leading-tight">
            ₹{row.charges.toLocaleString('en-IN')}
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${level.badge}`}>
            {level.label}
          </span>
        </div>
      </div>

      {/* Bottom expense bar */}
      <div className="px-4 pb-3">
        <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-orange-400 transition-all duration-500"
            style={{ width: `${Math.min((row.charges / 10000) * 100, 100)}%` }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">₹{row.charges.toLocaleString('en-IN')} of ₹10,000 cap</p>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, onSubmit, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Session</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
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
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-orange-500 hover:bg-orange-600 disabled:opacity-70 transition-all shadow-md shadow-orange-500/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function TuckshopAssignExpenseReport() {
  const [session,      setSession]      = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Submit / fetch (simulate API) ────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = EXPENSE_DATA[session] || []
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} expense records for session ${session}.`)
    }, 650)
  }, [session])

  const handleReset = () => {
    setSession(''); setRows([]); setSearch('')
    setErrors({}); setShown(false); setShownSession('')
  }

  // ── Excel Export placeholder ──────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.registration_no.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Aggregates ───────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    charges: filtered.reduce((s, r) => s + r.charges, 0),
    count:   filtered.length,
    avg:     filtered.length ? Math.round(filtered.reduce((s, r) => s + r.charges, 0) / filtered.length) : 0,
    high:    filtered.length ? Math.max(...filtered.map(r => r.charges)) : 0,
  }), [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = session ? 1 : 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            Tuckshop Expense Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Assign &amp; view student-wise tuckshop expense records by session.
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
          <span className="w-1 h-5 rounded-full bg-orange-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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

            {/* Spacers */}
            <div />
            <div />

            <div className="flex gap-2">
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Submit
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-orange-500 text-white shadow-md shadow-orange-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Session'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard
              icon={User}
              label="Total Students"
              value={totals.count}
              color="blue"
            />
            <SummaryCard
              icon={IndianRupee}
              label="Total Expense"
              value={`₹${totals.charges.toLocaleString('en-IN')}`}
              color="orange"
              color="amber"
            />
            <SummaryCard
              icon={Receipt}
              label="Avg per Student"
              value={`₹${totals.avg.toLocaleString('en-IN')}`}
              color="violet"
            />
            <SummaryCard
              icon={TrendingUp}
              label="Highest Expense"
              value={`₹${totals.high.toLocaleString('en-IN')}`}
              color="rose"
            />
          </div>

          {/* Expense legend */}
          <div className="flex flex-wrap gap-3 px-1">
            {[
              { label: 'Low  (< ₹4,500)',     dot: 'bg-emerald-500' },
              { label: 'Medium (₹4,500–₹6,999)', dot: 'bg-amber-500'   },
              { label: 'High  (≥ ₹7,000)',    dot: 'bg-rose-500'    },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <span className={`w-2 h-2 rounded-full ${l.dot}`} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-orange-500 flex-shrink-0" />
                <Receipt className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Expense Records</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name or reg. no…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-orange-400 focus:ring-2 focus:ring-orange-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-orange-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint desktop */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-orange-50/20 dark:bg-orange-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              <p className="text-[12px] text-orange-700 dark:text-orange-400">
                Student-wise tuckshop expenses for session {shownSession}. Color badges indicate expense level.
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
                      {['S.No.', 'Registration No.', 'Name', 'Total Expense'].map((h, i) => (
                        <th
                          key={i}
                          className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                            ${i === 3 ? 'text-right pr-6' : 'text-center'} ${i === 0 ? 'w-12' : ''}`}
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
                    {/* Grand Total */}
                    <DesktopRow row={totals} idx={0} isTotal />
                  </tbody>
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
                  {filtered.map((row) => (
                    <MobileCard key={row.registration_no} row={row} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[20px] font-bold text-orange-700 dark:text-orange-300 tabular-nums">
                          ₹{totals.charges.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] font-semibold text-orange-600 dark:text-orange-400">Total Expense</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[20px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">
                          ₹{totals.avg.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Avg per Student</p>
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
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1">
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
            <ShoppingBag className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Submit</strong> to generate the expense report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
