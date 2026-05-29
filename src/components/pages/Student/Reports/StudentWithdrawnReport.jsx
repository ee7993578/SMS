/**
 * StudentWithdrawnReport.jsx
 * Folder: src/pages/Student/Reports/StudentWithdrawnReport.jsx
 *
 * Converts legacy ASPX "Student Withdrawn Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Class Name, Registration No, Student Name, Address, Mobile,
 *          DOB, Gender, Withdrawn Date, Withdrawn Reason, Edit/Update/Cancel
 *
 * Features:
 *  - Session / Class / Section dropdowns (cascading)
 *  - Show report button
 *  - Inline edit of Withdrawn Reason
 *  - Mobile: collapsible cards with expandable details
 *  - Desktop: dense ERP-style table
 *  - Search / filter
 *  - Toast notifications
 *  - Loading skeleton
 *  - Empty state
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search,
  FileSpreadsheet, BookOpen,
  School2, TrendingUp,
  MapPin, Building2, ChevronRight,
  UserX, Phone, Calendar, MapPinIcon,
  ClipboardEdit, Save, XCircle, Pencil,
  ShieldOff, User, GraduationCap, ChevronUp,
  Info
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SECTIONS_MAP = {
  'Nursery': ['A', 'B'],
  'LKG':     ['A', 'B'],
  'UKG':     ['A', 'B'],
  'Class I':   ['A', 'B'],
  'Class II':  ['A', 'B'],
  'Class III': ['A'],
  'Class IV':  ['A'],
  'Class V':   ['A'],
  'Class VI':  ['A', 'B'],
  'Class VII': ['A'],
  'Class VIII':['A'],
  'Class IX':  ['A', 'B'],
  'Class X':   ['A'],
  'Class XI':  ['A', 'B'],
  'Class XII': ['A', 'B'],
}

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Dummy withdrawn students data
const WITHDRAWN_DATA = [
  {
    id: 1, session: '2024-25', class_name: 'Class VI', section: 'A',
    registration_no: 'REG-2024-0042', name: 'Aarav Sharma',
    R_Address: '12, Rajpur Road, Dehradun', mobile: '9876543210',
    DOB: '2012-05-14', Gender: 'Male',
    withdrawn_date: '2024-09-10', withdrawn_reason: 'Relocated to another city',
  },
  {
    id: 2, session: '2024-25', class_name: 'Class VI', section: 'A',
    registration_no: 'REG-2024-0078', name: 'Priya Negi',
    R_Address: '7, Haridwar Bypass, Rishikesh', mobile: '9823456780',
    DOB: '2013-01-22', Gender: 'Female',
    withdrawn_date: '2024-10-05', withdrawn_reason: 'Transferred to government school',
  },
  {
    id: 3, session: '2024-25', class_name: 'Class VI', section: 'B',
    registration_no: 'REG-2024-0091', name: 'Rohit Bisht',
    R_Address: '34, Saharanpur Road, Dehradun', mobile: '9911223344',
    DOB: '2012-11-03', Gender: 'Male',
    withdrawn_date: '2024-11-20', withdrawn_reason: 'Family financial issues',
  },
  {
    id: 4, session: '2024-25', class_name: 'Class IX', section: 'A',
    registration_no: 'REG-2024-0150', name: 'Sunita Rawat',
    R_Address: '5, Indira Nagar, Dehradun', mobile: '9988776655',
    DOB: '2010-07-30', Gender: 'Female',
    withdrawn_date: '2024-08-15', withdrawn_reason: 'Migrated abroad',
  },
  {
    id: 5, session: '2024-25', class_name: 'Class IX', section: 'A',
    registration_no: 'REG-2024-0167', name: 'Karan Joshi',
    R_Address: '88, Clock Tower Area, Dehradun', mobile: '8765432109',
    DOB: '2010-03-12', Gender: 'Male',
    withdrawn_date: '2024-09-25', withdrawn_reason: 'Health reasons',
  },
  {
    id: 6, session: '2024-25', class_name: 'Class IX', section: 'B',
    registration_no: 'REG-2024-0189', name: 'Anjali Thakur',
    R_Address: '22, Balliwala, Dehradun', mobile: '7654321098',
    DOB: '2011-09-18', Gender: 'Female',
    withdrawn_date: '2024-10-30', withdrawn_reason: 'Shifted to boarding school',
  },
  {
    id: 7, session: '2024-25', class_name: 'Class XI', section: 'A',
    registration_no: 'REG-2024-0201', name: 'Deepak Verma',
    R_Address: '15, Prem Nagar, Dehradun', mobile: '9001234567',
    DOB: '2008-02-28', Gender: 'Male',
    withdrawn_date: '2024-07-20', withdrawn_reason: 'Joined coaching institute',
  },
  {
    id: 8, session: '2024-25', class_name: 'Class XI', section: 'B',
    registration_no: 'REG-2024-0215', name: 'Meera Chauhan',
    R_Address: '6, GMS Road, Dehradun', mobile: '8899001122',
    DOB: '2008-06-15', Gender: 'Female',
    withdrawn_date: '2024-12-01', withdrawn_reason: 'Marriage in family, temporary leave',
  },
  {
    id: 9, session: '2023-24', class_name: 'Class X', section: 'A',
    registration_no: 'REG-2023-0333', name: 'Vikas Panwar',
    R_Address: '45, Raipur Road, Dehradun', mobile: '9876001234',
    DOB: '2008-11-10', Gender: 'Male',
    withdrawn_date: '2023-09-12', withdrawn_reason: 'Transferred to CBSE school',
  },
  {
    id: 10, session: '2023-24', class_name: 'Class VII', section: 'A',
    registration_no: 'REG-2023-0298', name: 'Rina Kandpal',
    R_Address: '18, Turner Road, Dehradun', mobile: '9765432100',
    DOB: '2011-04-05', Gender: 'Female',
    withdrawn_date: '2023-11-18', withdrawn_reason: 'Personal / family reasons',
  },
]

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
const classColor = (name = '') => CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()
const formatDate = (d = '') => {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

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

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session }) {
  return (
    <div className="rounded-2xl border border-rose-100 dark:border-[rgba(239,68,68,0.2)] bg-gradient-to-r from-rose-50 via-white to-orange-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0" />
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
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-rose-700 dark:text-rose-400">
        Student Withdrawn Report
      </p>
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
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

// ─── INLINE EDIT CELL ─────────────────────────────────────────────────────────
function EditableReasonCell({ value, editingId, rowId, onEdit, onSave, onCancel, editValue, setEditValue }) {
  const isEditing = editingId === rowId
  if (isEditing) {
    return (
      <div className="flex items-center gap-1.5 min-w-[180px]">
        <input
          autoFocus
          value={editValue}
          onChange={e => setEditValue(e.target.value)}
          className="flex-1 px-2 py-1 text-[12px] rounded-lg border border-blue-300 outline-none ring-2 ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:border-indigo-400 dark:ring-indigo-500/20"
          onKeyDown={e => { if (e.key === 'Enter') onSave(rowId); if (e.key === 'Escape') onCancel() }}
        />
        <button onClick={() => onSave(rowId)}
          className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors flex-shrink-0">
          <Save className="w-3 h-3" />
        </button>
        <button onClick={onCancel}
          className="p-1.5 rounded-lg bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 transition-colors flex-shrink-0">
          <XCircle className="w-3 h-3" />
        </button>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 group">
      <span className="text-[12px] text-slate-600 dark:text-slate-300 leading-snug max-w-[200px]">{value || '—'}</span>
      <button onClick={() => onEdit(rowId, value)}
        className="p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 flex-shrink-0">
        <Pencil className="w-3 h-3" />
      </button>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, editingId, onEdit, onSave, onCancel, editValue, setEditValue }) {
  const { fg, bg } = classColor(row.class_name)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Class */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}>{formatAbbr(row.class_name)}</span>
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class_name}</span>
        </div>
      </td>

      {/* Reg No */}
      <td className="px-3 py-3">
        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md whitespace-nowrap">{row.registration_no}</span>
      </td>

      {/* Student Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {row.name.charAt(0)}
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Address */}
      <td className="px-3 py-3 max-w-[160px]">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-1" title={row.R_Address}>{row.R_Address}</span>
      </td>

      {/* Mobile */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.mobile}</span>
      </td>

      {/* DOB */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(row.DOB)}</span>
      </td>

      {/* Gender */}
      <td className="px-3 py-3 text-center">
        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
          row.Gender === 'Female'
            ? 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
        }`}>{row.Gender}</span>
      </td>

      {/* Withdrawn Date */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-semibold text-rose-600 dark:text-rose-400 whitespace-nowrap bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md">{formatDate(row.withdrawn_date)}</span>
      </td>

      {/* Withdrawn Reason — editable */}
      <td className="px-3 py-3">
        <EditableReasonCell
          value={row.withdrawn_reason}
          editingId={editingId}
          rowId={row.id}
          onEdit={onEdit}
          onSave={onSave}
          onCancel={onCancel}
          editValue={editValue}
          setEditValue={setEditValue}
        />
      </td>

      {/* Actions */}
      <td className="px-3 py-3 text-center">
        {editingId === row.id ? (
          <div className="flex items-center justify-center gap-1.5">
            <button onClick={() => onSave(row.id)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
              <Save className="w-3 h-3" /> Update
            </button>
            <button onClick={onCancel}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <button onClick={() => onEdit(row.id, row.withdrawn_reason)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors whitespace-nowrap">
            <ClipboardEdit className="w-3 h-3" /> Edit
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, editingId, onEdit, onSave, onCancel, editValue, setEditValue }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class_name)
  const isEditing = editingId === row.id

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-400 to-orange-400 flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0">
          {row.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md" style={{ background: bg, color: fg }}>
              {row.class_name}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Sec {row.section}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              row.Gender === 'Female'
                ? 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400'
                : 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
            }`}>{row.Gender}</span>
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className="text-[10px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-md whitespace-nowrap">
            {formatDate(row.withdrawn_date)}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-4 space-y-3">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3" /> Reg No
              </p>
              <p className="text-[12px] font-mono text-slate-700 dark:text-slate-300 break-all">{row.registration_no}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3" /> Mobile
              </p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{row.mobile}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Date of Birth
              </p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">{formatDate(row.DOB)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-rose-400 mb-1 flex items-center gap-1">
                <ShieldOff className="w-3 h-3" /> Withdrawn Date
              </p>
              <p className="text-[13px] font-bold text-rose-700 dark:text-rose-400">{formatDate(row.withdrawn_date)}</p>
            </div>
          </div>

          {/* Address */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
              <MapPinIcon className="w-3 h-3" /> Address
            </p>
            <p className="text-[12px] text-slate-700 dark:text-slate-300">{row.R_Address}</p>
          </div>

          {/* Withdrawn Reason — editable */}
          <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-2">Withdrawn Reason</p>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  autoFocus
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-blue-300 outline-none ring-2 ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-indigo-400"
                  placeholder="Enter reason..."
                />
                <div className="flex gap-2">
                  <button onClick={() => onSave(row.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
                    <Save className="w-3.5 h-3.5" /> Update
                  </button>
                  <button onClick={onCancel}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 transition-colors">
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-2">
                <p className="text-[13px] text-amber-800 dark:text-amber-300 flex-1">{row.withdrawn_reason || '—'}</p>
                <button onClick={() => onEdit(row.id, row.withdrawn_reason)}
                  className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, selectedClass, setSelectedClass, selectedSection, setSelectedSection, onShow, loading, errors }) {
  const sections = selectedClass ? (SECTIONS_MAP[selectedClass] || []) : []

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
            <SlidersHorizontal className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.selectedClass}>
            <NativeSelect value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedSection('') }} placeholder="-- All Classes --">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Section">
            <NativeSelect value={selectedSection} onChange={e => setSelectedSection(e.target.value)} placeholder="-- All Sections --" disabled={!selectedClass}>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-rose-600 hover:bg-rose-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StudentWithdrawnReport() {
  // Filter state
  const [session,         setSession]         = useState('')
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedSection, setSelectedSection] = useState('')

  // Data state
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [shownSession, setShownSession] = useState('')

  // Inline edit state
  const [editingId,  setEditingId]  = useState(null)
  const [editValue,  setEditValue]  = useState('')

  const sections = selectedClass ? (SECTIONS_MAP[selectedClass] || []) : []

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setEditingId(null)

    setTimeout(() => {
      let data = WITHDRAWN_DATA.filter(r => r.session === session)
      if (selectedClass)   data = data.filter(r => r.class_name === selectedClass)
      if (selectedSection) data = data.filter(r => r.section === selectedSection)
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} withdrawn student${data.length !== 1 ? 's' : ''}.`)
    }, 700)
  }, [session, selectedClass, selectedSection])

  const handleReset = () => {
    setSession(''); setSelectedClass(''); setSelectedSection('')
    setRows([]); setSearch(''); setErrors({})
    setShown(false); setShownSession(''); setEditingId(null)
  }

  // ── Edit actions ─────────────────────────────────────────────────────────
  const handleEdit = (id, reason) => { setEditingId(id); setEditValue(reason || '') }
  const handleCancel = () => { setEditingId(null); setEditValue('') }
  const handleSave = (id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, withdrawn_reason: editValue } : r))
    setEditingId(null)
    showToast('Withdrawn reason updated successfully.')
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.registration_no.toLowerCase().includes(q) ||
      r.mobile.includes(q) ||
      (r.withdrawn_reason || '').toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary counts ────────────────────────────────────────────────────────
  const maleCount   = filtered.filter(r => r.Gender === 'Male').length
  const femaleCount = filtered.filter(r => r.Gender === 'Female').length
  const activeFilters = [session, selectedClass, selectedSection].filter(Boolean).length
  const hasResults = shown && rows.length > 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserX className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            Student Withdrawn Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and manage withdrawn students with editable reasons.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
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

            <Field label="Class">
              <NativeSelect
                value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setSelectedSection('') }}
                placeholder="-- All Classes --"
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Section">
              <NativeSelect
                value={selectedSection}
                onChange={e => setSelectedSection(e.target.value)}
                placeholder="-- All Sections --"
                disabled={!selectedClass}
              >
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20
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
            bg-rose-600 text-white shadow-md shadow-rose-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
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
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
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
            <SummaryCard icon={UserX}         label="Total Withdrawn"  value={filtered.length} color="rose"   />
            <SummaryCard icon={User}          label="Male Students"    value={maleCount}        color="blue"   />
            <SummaryCard icon={GraduationCap} label="Female Students"  value={femaleCount}      color="violet" />
            <SummaryCard icon={School2}       label="Classes Affected" value={new Set(filtered.map(r => r.class_name)).size} color="amber" />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Withdrawn Students</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, class, reason…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-rose-400 focus:ring-2 focus:ring-rose-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-rose-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-rose-50/30 dark:bg-rose-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-rose-500 flex-shrink-0" />
              <p className="text-[12px] text-rose-700 dark:text-rose-400">
                Click <strong>Edit</strong> on any row to update the withdrawn reason inline. Press Enter or click Update to save.
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
                      {['S.No.','Class Name','Reg. No.','Student Name','Address','Mobile','DOB','Gender','Withdrawn Date','Withdrawn Reason','Action'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow
                        key={row.id}
                        row={row}
                        idx={i + 1}
                        editingId={editingId}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        editValue={editValue}
                        setEditValue={setEditValue}
                      />
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
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to expand details and edit reason.
                  </p>
                  {filtered.map(row => (
                    <MobileCard
                      key={row.id}
                      row={row}
                      editingId={editingId}
                      onEdit={handleEdit}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      editValue={editValue}
                      setEditValue={setEditValue}
                    />
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
                  className="text-[12px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1">
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
            <UserX className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to view withdrawn students.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
