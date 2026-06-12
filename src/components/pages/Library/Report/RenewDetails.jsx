/**
 * RenewDetails.jsx
 * Folder: src/pages/Library/Reports/RenewDetails.jsx
 *
 * Converts legacy ASPX "Renew Details" report to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Member ID, Item Acc No, Book Name, Member Name, Member Type,
 *          Issue Date, Renew Date, Renew Due Date
 *
 * Features:
 *  - Category filter (Student / Faculty) — radio style segmented control
 *  - Show report button + Excel export
 *  - Mobile: collapsible cards with expandable details
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, GraduationCap, BookOpen,
  SlidersHorizontal, Info, Search,
  FileSpreadsheet, BookMarked, ChevronRight,
  CalendarClock, CalendarCheck, CalendarDays,
  Hash, IdCard, User2
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const CATEGORIES = [
  { value: 'Student', label: 'Student', icon: GraduationCap },
  { value: 'Faculty', label: 'Faculty', icon: Users },
]

// Renew records, keyed by category
const RENEW_DATA = {
  Student: [
    { member_id: 'STU-1042', item_acc_no: 'ACC-3301', book_name: 'Introduction to Algorithms', name: 'Aarav Sharma', member_type: 'Student', issue_date: '02-May-2026', renewed_date: '01-Jun-2026', renew_due_date: '15-Jun-2026' },
    { member_id: 'STU-1108', item_acc_no: 'ACC-2247', book_name: 'Organic Chemistry Fundamentals', name: 'Diya Patel', member_type: 'Student', issue_date: '10-May-2026', renewed_date: '03-Jun-2026', renew_due_date: '17-Jun-2026' },
    { member_id: 'STU-0987', item_acc_no: 'ACC-1190', book_name: 'A Brief History of Time', name: 'Rohan Mehta', member_type: 'Student', issue_date: '28-Apr-2026', renewed_date: '05-Jun-2026', renew_due_date: '19-Jun-2026' },
    { member_id: 'STU-1233', item_acc_no: 'ACC-4456', book_name: 'Wings of Fire', name: 'Ishita Verma', member_type: 'Student', issue_date: '15-May-2026', renewed_date: '06-Jun-2026', renew_due_date: '20-Jun-2026' },
    { member_id: 'STU-1056', item_acc_no: 'ACC-3789', book_name: 'Database System Concepts', name: 'Kabir Singh', member_type: 'Student', issue_date: '20-May-2026', renewed_date: '07-Jun-2026', renew_due_date: '21-Jun-2026' },
    { member_id: 'STU-1199', item_acc_no: 'ACC-2954', book_name: 'The Theory of Everything', name: 'Sneha Reddy', member_type: 'Student', issue_date: '12-May-2026', renewed_date: '08-Jun-2026', renew_due_date: '22-Jun-2026' },
    { member_id: 'STU-1077', item_acc_no: 'ACC-1822', book_name: 'Clean Code', name: 'Vivaan Joshi', member_type: 'Student', issue_date: '18-May-2026', renewed_date: '09-Jun-2026', renew_due_date: '23-Jun-2026' },
    { member_id: 'STU-1311', item_acc_no: 'ACC-5023', book_name: 'Discrete Mathematics', name: 'Ananya Gupta', member_type: 'Student', issue_date: '22-May-2026', renewed_date: '10-Jun-2026', renew_due_date: '24-Jun-2026' },
  ],
  Faculty: [
    { member_id: 'FAC-0021', item_acc_no: 'ACC-0871', book_name: 'Pedagogy of the Oppressed', name: 'Dr. Sunita Rao', member_type: 'Faculty', issue_date: '01-May-2026', renewed_date: '02-Jun-2026', renew_due_date: '02-Jul-2026' },
    { member_id: 'FAC-0045', item_acc_no: 'ACC-1325', book_name: 'Modern Operating Systems', name: 'Prof. Anil Kapoor', member_type: 'Faculty', issue_date: '05-May-2026', renewed_date: '04-Jun-2026', renew_due_date: '04-Jul-2026' },
    { member_id: 'FAC-0012', item_acc_no: 'ACC-0456', book_name: 'Research Methodology', name: 'Dr. Meera Nair', member_type: 'Faculty', issue_date: '10-May-2026', renewed_date: '06-Jun-2026', renew_due_date: '06-Jul-2026' },
    { member_id: 'FAC-0033', item_acc_no: 'ACC-2210', book_name: 'Linear Algebra and Its Applications', name: 'Prof. Rakesh Verma', member_type: 'Faculty', issue_date: '14-May-2026', renewed_date: '08-Jun-2026', renew_due_date: '08-Jul-2026' },
    { member_id: 'FAC-0058', item_acc_no: 'ACC-3104', book_name: 'Principles of Economics', name: 'Dr. Kavita Iyer', member_type: 'Faculty', issue_date: '20-May-2026', renewed_date: '10-Jun-2026', renew_due_date: '10-Jul-2026' },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const TYPE_COLORS = {
  Student: { fg: '#1d4ed8', bg: '#dbeafe' },
  Faculty: { fg: '#7c3aed', bg: '#ede9fe' },
}

const initials = (name = '') =>
  name
    .replace(/^(Dr\.|Prof\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase()

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

// ─── CATEGORY SEGMENTED CONTROL ────────────────────────────────────────────────
function CategorySelector({ value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        Select Category<span className="text-rose-500 ml-0.5">*</span>
      </label>
      <div className={`inline-flex rounded-xl border overflow-hidden w-full sm:w-auto
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}>
        {CATEGORIES.map(({ value: val, label, icon: Icon }) => {
          const active = value === val
          return (
            <button
              key={val}
              type="button"
              onClick={() => onChange(val)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 text-[13px] font-semibold transition-all
                ${active
                  ? 'bg-blue-600 text-white dark:bg-indigo-600'
                  : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-[#1e2238] dark:text-slate-300 dark:hover:bg-white/[0.03]'
                }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          )
        })}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = TYPE_COLORS[row.member_type] || TYPE_COLORS.Student

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Member */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {initials(row.name)}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap leading-tight">{row.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">{row.member_id}</p>
          </div>
        </div>
      </td>

      {/* Member Type */}
      <td className="px-4 py-3 text-center">
        <span
          className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {row.member_type}
        </span>
      </td>

      {/* Item Acc No */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">
          {row.item_acc_no}
        </span>
      </td>

      {/* Book Name */}
      <td className="px-4 py-3">
        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{row.book_name}</span>
      </td>

      {/* Issue Date */}
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">{row.issue_date}</span>
      </td>

      {/* Renew Date */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums whitespace-nowrap">
          {row.renewed_date}
        </span>
      </td>

      {/* Renew Due Date */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 tabular-nums whitespace-nowrap">
          {row.renew_due_date}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = TYPE_COLORS[row.member_type] || TYPE_COLORS.Student

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Member avatar */}
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {initials(row.name)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.name}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {row.book_name}
          </p>
        </div>

        {/* Due badge */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 whitespace-nowrap tabular-nums">
            {row.renew_due_date}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">due date</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Sno + type strip */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 tabular-nums">
          #{idx}
        </span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ background: bg, color: fg }}
        >
          {row.member_type}
        </span>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 tabular-nums">
          {row.item_acc_no}
        </span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-2.5">

          {/* Member ID */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] p-3">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 flex-shrink-0">
              <IdCard className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Member ID</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{row.member_id}</p>
            </div>
          </div>

          {/* Book name */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] p-3">
            <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400 flex-shrink-0">
              <BookMarked className="w-4 h-4" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Book Name</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.book_name}</p>
            </div>
          </div>

          {/* Dates grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-[rgba(99,102,241,0.08)] p-3 text-center">
              <CalendarDays className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-200 tabular-nums leading-tight">{row.issue_date}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mt-0.5">Issue</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <CalendarCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums leading-tight">{row.renewed_date}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Renewed</p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 text-center">
              <CalendarClock className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300 tabular-nums leading-tight">{row.renew_due_date}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-0.5">Due</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, category, setCategory, onShow, loading, errors }) {
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
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Category</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <CategorySelector value={category} onChange={setCategory} error={errors.category} />
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RenewDetails() {
  const [category,   setCategory]   = useState('')
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [shownCategory, setShownCategory] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) — placeholder for RadioButtonList1_SelectedIndexChanged + Button1_Click ──
  const handleShow = useCallback(() => {
    const err = {}
    if (!category) err.category = 'Please select a category'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = RENEW_DATA[category] || []
      setRows(data)
      setShownCategory(category)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} record${data.length !== 1 ? 's' : ''} for ${category}.`)
    }, 650)
  }, [category])

  const handleReset = () => {
    setCategory(''); setRows([]); setSearch('')
    setErrors({}); setShown(false); setShownCategory('')
  }

  // ── Excel Export placeholder — for btnexport_Click ──────────────────────────
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
      r.member_id.toLowerCase().includes(q) ||
      r.item_acc_no.toLowerCase().includes(q) ||
      r.book_name.toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults    = shown && rows.length > 0
  const activeFilters = category ? 1 : 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Renew Details
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View renewed book records by member category — issue, renew &amp; due dates.
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
          <div className="flex flex-wrap items-end gap-4">
            <CategorySelector
              value={category}
              onChange={(v) => { setCategory(v); setErrors(p => ({ ...p, category: undefined })) }}
              error={errors.category}
            />

            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
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
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {category ? `Category: ${category}` : 'Select Category'}
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
        category={category}
        setCategory={setCategory}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Renew Details</span>
              <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownCategory}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-64 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, ID, acc no, book…"
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
              Showing all renewed items for {shownCategory.toLowerCase()} members, sorted by renewal date.
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
                    {['S.No.', 'Member', 'Member Type', 'Item Acc No', 'Book Name', 'Issue Date', 'Renew Date', 'Renew Due Date'].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <DesktopRow key={`${row.member_id}-${row.item_acc_no}`} row={row} idx={i + 1} />
                  ))}
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
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap a card to see full renewal details.
                </p>

                {filtered.map((row, i) => (
                  <MobileCard key={`${row.member_id}-${row.item_acc_no}`} row={row} idx={i + 1} />
                ))}
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
                className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear search
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── No-record state (category chosen, but data empty / EmptyDataText) ── */}
      {shown && rows.length === 0 && !loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm">
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <BookMarked className="w-7 h-7 opacity-50" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No record found</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
                There are no renewed books for <strong>{shownCategory}</strong> members.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State (nothing selected yet) ─────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <CalendarClock className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a category and click <strong>Show</strong> to view renew details.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
