/**
 * StudentTransportReport.jsx
 * Folder: src/pages/Student/Reports/StudentTransportReport.jsx
 *
 * Converts legacy ASPX "Student Transport Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Reg No, Student Name, Class, Father Name, Mobile No, Route, Stoppage, Slab
 * Features:
 *  - Session dropdown
 *  - Multi-select Class filter
 *  - Multi-select Route filter
 *  - Slab dropdown
 *  - Show report + Excel export
 *  - School header / session banner
 *  - Mobile: collapsible cards with full detail
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, Info,
  FileSpreadsheet, BookOpen,
  School2, TrendingUp,
  MapPin, Building2, ChevronRight,
  Bus, User, Phone, BookMarked,
  Users, Navigation, Layers
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const ROUTES = [
  'Route A – Civil Lines',
  'Route B – Rajpur Road',
  'Route C – Balliwala',
  'Route D – Patel Nagar',
  'Route E – Kaonli',
]

const SLABS = [
  { value: '', label: '-- All Slabs --' },
  { value: '1', label: 'Slab 1 (0-5 km)' },
  { value: '2', label: 'Slab 2 (5-10 km)' },
  { value: '3', label: 'Slab 3 (10-15 km)' },
  { value: '4', label: 'Slab 4 (15+ km)' },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Dummy transport students
const ALL_TRANSPORT_DATA = [
  { id: 1,  adm_no: 'ADM001', name: 'Aarav Sharma',      class: 'Class V',    father_name: 'Rajan Sharma',    mobile: '9812345670', route: 'Route A – Civil Lines',   stoppage: 'Gandhi Chowk',      slab: '1', slab_name: 'Slab 1 (0-5 km)'   },
  { id: 2,  adm_no: 'ADM002', name: 'Priya Gupta',       class: 'Class VII',  father_name: 'Suresh Gupta',    mobile: '9823456781', route: 'Route B – Rajpur Road',   stoppage: 'Clock Tower',       slab: '2', slab_name: 'Slab 2 (5-10 km)'  },
  { id: 3,  adm_no: 'ADM003', name: 'Rohan Verma',       class: 'Class III',  father_name: 'Manoj Verma',     mobile: '9834567892', route: 'Route C – Balliwala',     stoppage: 'Balliwala Chowk',   slab: '3', slab_name: 'Slab 3 (10-15 km)' },
  { id: 4,  adm_no: 'ADM004', name: 'Sneha Rawat',       class: 'Class IX',   father_name: 'Dinesh Rawat',    mobile: '9845678903', route: 'Route D – Patel Nagar',   stoppage: 'Patel Nagar Stand', slab: '2', slab_name: 'Slab 2 (5-10 km)'  },
  { id: 5,  adm_no: 'ADM005', name: 'Arjun Bisht',       class: 'Class XI',   father_name: 'Harish Bisht',    mobile: '9856789014', route: 'Route E – Kaonli',        stoppage: 'Kaonli Turn',       slab: '4', slab_name: 'Slab 4 (15+ km)'   },
  { id: 6,  adm_no: 'ADM006', name: 'Riya Joshi',        class: 'Class II',   father_name: 'Vinod Joshi',     mobile: '9867890125', route: 'Route A – Civil Lines',   stoppage: 'DC Office',         slab: '1', slab_name: 'Slab 1 (0-5 km)'   },
  { id: 7,  adm_no: 'ADM007', name: 'Karan Negi',        class: 'Class VIII', father_name: 'Ramesh Negi',     mobile: '9878901236', route: 'Route B – Rajpur Road',   stoppage: 'Survey Chowk',      slab: '2', slab_name: 'Slab 2 (5-10 km)'  },
  { id: 8,  adm_no: 'ADM008', name: 'Ananya Pant',       class: 'Class VI',   father_name: 'Sanjay Pant',     mobile: '9889012347', route: 'Route C – Balliwala',     stoppage: 'Guru Ram Rai',      slab: '3', slab_name: 'Slab 3 (10-15 km)' },
  { id: 9,  adm_no: 'ADM009', name: 'Vivek Pandey',      class: 'Class X',    father_name: 'Anil Pandey',     mobile: '9890123458', route: 'Route D – Patel Nagar',   stoppage: 'Saharanpur Chowk',  slab: '2', slab_name: 'Slab 2 (5-10 km)'  },
  { id: 10, adm_no: 'ADM010', name: 'Nisha Thakur',      class: 'Class XII',  father_name: 'Gopal Thakur',    mobile: '9801234569', route: 'Route E – Kaonli',        stoppage: 'New Bus Stand',     slab: '4', slab_name: 'Slab 4 (15+ km)'   },
  { id: 11, adm_no: 'ADM011', name: 'Mohit Chauhan',     class: 'Class IV',   father_name: 'Sunil Chauhan',   mobile: '9812340670', route: 'Route A – Civil Lines',   stoppage: 'Gandhi Chowk',      slab: '1', slab_name: 'Slab 1 (0-5 km)'   },
  { id: 12, adm_no: 'ADM012', name: 'Pooja Bhatt',       class: 'Class I',    father_name: 'Rakesh Bhatt',    mobile: '9823451781', route: 'Route B – Rajpur Road',   stoppage: 'Rajpur Mod',        slab: '3', slab_name: 'Slab 3 (10-15 km)' },
  { id: 13, adm_no: 'ADM013', name: 'Sumit Dobhal',      class: 'Class VII',  father_name: 'Bharat Dobhal',   mobile: '9834562892', route: 'Route C – Balliwala',     stoppage: 'Balliwala Market',  slab: '3', slab_name: 'Slab 3 (10-15 km)' },
  { id: 14, adm_no: 'ADM014', name: 'Kajal Rana',        class: 'Class IX',   father_name: 'Bhawani Rana',    mobile: '9845673903', route: 'Route A – Civil Lines',   stoppage: 'EC Road',           slab: '1', slab_name: 'Slab 1 (0-5 km)'   },
  { id: 15, adm_no: 'ADM015', name: 'Deepak Juyal',      class: 'Class XI',   father_name: 'Madan Juyal',     mobile: '9856784014', route: 'Route D – Patel Nagar',   stoppage: 'Laxman Chowk',      slab: '2', slab_name: 'Slab 2 (5-10 km)'  },
  { id: 16, adm_no: 'ADM016', name: 'Tanya Mehra',       class: 'Class VI',   father_name: 'Rajiv Mehra',     mobile: '9867895125', route: 'Route E – Kaonli',        stoppage: 'Jakhan',            slab: '4', slab_name: 'Slab 4 (15+ km)'   },
  { id: 17, adm_no: 'ADM017', name: 'Gaurav Dimri',      class: 'Class III',  father_name: 'Pramod Dimri',    mobile: '9878906236', route: 'Route B – Rajpur Road',   stoppage: 'IT Park',           slab: '2', slab_name: 'Slab 2 (5-10 km)'  },
  { id: 18, adm_no: 'ADM018', name: 'Simran Arora',      class: 'Class VIII', father_name: 'Ajay Arora',      mobile: '9889017347', route: 'Route C – Balliwala',     stoppage: 'Old Survey Road',   slab: '3', slab_name: 'Slab 3 (10-15 km)' },
  { id: 19, adm_no: 'ADM019', name: 'Himanshu Semwal',   class: 'Class X',    father_name: 'Kedar Semwal',    mobile: '9890128458', route: 'Route E – Kaonli',        stoppage: 'Mothrowala',        slab: '4', slab_name: 'Slab 4 (15+ km)'   },
  { id: 20, adm_no: 'ADM020', name: 'Divya Nautiyal',    class: 'Class XII',  father_name: 'Surendra Nautiyal', mobile: '9801239569', route: 'Route A – Civil Lines', stoppage: 'Parade Ground',     slab: '1', slab_name: 'Slab 1 (0-5 km)'   },
  { id: 21, adm_no: 'ADM021', name: 'Abhishek Kimothi',  class: 'Class V',    father_name: 'Girish Kimothi',  mobile: '9812341670', route: 'Route D – Patel Nagar',   stoppage: 'Niranjanpur',       slab: '2', slab_name: 'Slab 2 (5-10 km)'  },
  { id: 22, adm_no: 'ADM022', name: 'Pallavi Bhandari',  class: 'Class II',   father_name: 'Naresh Bhandari', mobile: '9823452781', route: 'Route B – Rajpur Road',   stoppage: 'Rajpur Road End',   slab: '3', slab_name: 'Slab 3 (10-15 km)' },
  { id: 23, adm_no: 'ADM023', name: 'Nikhil Uniyal',     class: 'Class IV',   father_name: 'Trilok Uniyal',   mobile: '9834563892', route: 'Route C – Balliwala',     stoppage: 'Vijay Colony',      slab: '3', slab_name: 'Slab 3 (10-15 km)' },
  { id: 24, adm_no: 'ADM024', name: 'Shalini Badoni',    class: 'Class I',    father_name: 'Ramvir Badoni',   mobile: '9845674903', route: 'Route A – Civil Lines',   stoppage: 'Civil Lines Turn',  slab: '1', slab_name: 'Slab 1 (0-5 km)'   },
]

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name) => CLASS_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

const SLAB_COLORS = {
  '1': { fg: '#15803d', bg: '#dcfce7', darkBg: 'bg-emerald-500/10', darkFg: 'text-emerald-400', label: '0-5 km' },
  '2': { fg: '#1d4ed8', bg: '#dbeafe', darkBg: 'bg-blue-500/10',    darkFg: 'text-blue-400',    label: '5-10 km' },
  '3': { fg: '#d97706', bg: '#fef3c7', darkBg: 'bg-amber-500/10',   darkFg: 'text-amber-400',   label: '10-15 km' },
  '4': { fg: '#7c3aed', bg: '#ede9fe', darkBg: 'bg-violet-500/10',  darkFg: 'text-violet-400',  label: '15+ km' },
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

// ─── MULTI-SELECT CHIP PICKER ──────────────────────────────────────────────────
function MultiSelectPicker({ label, options, selected, onChange, placeholder, error }) {
  const [open, setOpen] = useState(false)

  const toggle = (val) => {
    if (selected.includes(val)) onChange(selected.filter(v => v !== val))
    else onChange([...selected, val])
  }
  const selectAll = () => onChange([...options])
  const clearAll  = () => onChange([])

  return (
    <div className="flex flex-col gap-1 relative">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between pl-3 pr-2.5 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white dark:bg-[#1e2238] text-left
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${error ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        <span className={selected.length === 0 ? 'text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'}>
          {selected.length === 0
            ? (placeholder || 'Select...')
            : selected.length === options.length
              ? `All (${options.length})`
              : selected.length <= 2
                ? selected.join(', ')
                : `${selected[0]}, +${selected.length - 1} more`}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 right-0 z-40 mt-1 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-xl overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50 dark:bg-white/[0.02]">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{selected.length}/{options.length} selected</span>
              <div className="flex gap-2">
                <button type="button" onClick={selectAll} className="text-[11px] font-semibold text-blue-600 dark:text-indigo-400 hover:underline">All</button>
                <span className="text-slate-300 dark:text-slate-600">|</span>
                <button type="button" onClick={clearAll} className="text-[11px] font-semibold text-rose-500 hover:underline">Clear</button>
              </div>
            </div>
            {/* Options */}
            <div className="max-h-44 overflow-y-auto">
              {options.map(opt => (
                <label
                  key={opt}
                  className="flex items-center gap-2.5 px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.04] cursor-pointer transition-colors"
                >
                  <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors
                    ${selected.includes(opt)
                      ? 'bg-blue-600 dark:bg-indigo-600 border-blue-600 dark:border-indigo-600'
                      : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2238]'}`}
                  >
                    {selected.includes(opt) && <Check className="w-2.5 h-2.5 text-white" />}
                  </span>
                  <span className="text-[13px] text-slate-700 dark:text-slate-200">{opt}</span>
                  <input type="checkbox" className="sr-only" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
                </label>
              ))}
            </div>
          </div>
        </>
      )}
      {error && <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session }) {
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
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Student Transport Report
      </p>
    </div>
  )
}

// ─── SLAB BADGE ───────────────────────────────────────────────────────────────
function SlabBadge({ slab, slabName }) {
  const c = SLAB_COLORS[slab] || SLAB_COLORS['1']
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold ${c.darkBg} ${c.darkFg}`}
      style={{ backgroundColor: c.bg, color: c.fg }}
    >
      {slabName || c.label}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = classColor(row.class)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Reg No */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 tabular-nums font-mono tracking-wide">{row.adm_no}</span>
      </td>

      {/* Student Name */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {row.name.charAt(0)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Class */}
      <td className="px-3 py-2.5 text-center">
        <span
          className="inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[11px] font-bold whitespace-nowrap"
          style={{ background: bg, color: fg }}
        >
          {row.class}
        </span>
      </td>

      {/* Father Name */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.father_name}</span>
      </td>

      {/* Mobile */}
      <td className="px-3 py-2.5">
        <span className="inline-flex items-center gap-1 text-[12px] font-mono text-slate-600 dark:text-slate-300 tabular-nums">
          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
          {row.mobile}
        </span>
      </td>

      {/* Route */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Bus className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.route}</span>
        </div>
      </td>

      {/* Stoppage */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <Navigation className="w-3 h-3 text-emerald-500 flex-shrink-0" />
          <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.stoppage}</span>
        </div>
      </td>

      {/* Slab */}
      <td className="px-3 py-2.5 text-center">
        <SlabBadge slab={row.slab} slabName={row.slab_name} />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {row.name.charAt(0)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold"
              style={{ background: bg, color: fg }}
            >
              {row.class}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{row.adm_no}</span>
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <SlabBadge slab={row.slab} slabName={row.slab_name} />
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Quick info strip — always visible */}
      <div className="px-4 pb-3 flex items-center gap-3 flex-wrap">
        <span className="flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400">
          <Bus className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate max-w-[140px]">{row.route.split('–')[1]?.trim() || row.route}</span>
        </span>
        <span className="text-slate-200 dark:text-slate-700">·</span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
          <Navigation className="w-3 h-3 flex-shrink-0" />
          {row.stoppage}
        </span>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Detail rows */}
          <div className="space-y-2">
            {[
              { icon: User,       label: 'Father Name', value: row.father_name,  color: 'text-slate-700 dark:text-slate-200' },
              { icon: Phone,      label: 'Mobile No.',  value: row.mobile,       color: 'text-slate-700 dark:text-slate-200 font-mono' },
              { icon: Bus,        label: 'Route',       value: row.route,        color: 'text-blue-700 dark:text-blue-300' },
              { icon: Navigation, label: 'Stoppage',    value: row.stoppage,     color: 'text-emerald-700 dark:text-emerald-300' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-start gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
                  <p className={`text-[13px] font-semibold ${color} leading-snug`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Slab highlight */}
          <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-400" />
              <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Distance Slab</span>
            </div>
            <SlabBadge slab={row.slab} slabName={row.slab_name} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors }) {
  if (!open) return null

  const { session, classes, routes, slab } = filters

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[85vh] flex flex-col"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Title */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Fields */}
        <div className="px-5 py-5 space-y-4 overflow-y-auto flex-1">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setFilters(p => ({ ...p, session: e.target.value }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <MultiSelectPicker label="Class" options={CLASSES} selected={classes} onChange={v => setFilters(p => ({ ...p, classes: v }))} placeholder="-- All Classes --" />
          <MultiSelectPicker label="Route" options={ROUTES} selected={routes} onChange={v => setFilters(p => ({ ...p, routes: v }))} placeholder="-- All Routes --" />
          <Field label="Slab">
            <NativeSelect value={slab} onChange={e => setFilters(p => ({ ...p, slab: e.target.value }))}>
              {SLABS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </NativeSelect>
          </Field>
        </div>
        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 flex-shrink-0">
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
export default function StudentTransportReport() {
  // Filters
  const [filters, setFilters] = useState({ session: '', classes: [], routes: [], slab: '' })

  // UI state
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownMeta,   setShownMeta]   = useState({ session: '', classes: [], routes: [], slab: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = [...ALL_TRANSPORT_DATA]
      if (filters.classes.length > 0) data = data.filter(r => filters.classes.includes(r.class))
      if (filters.routes.length  > 0) data = data.filter(r => filters.routes.includes(r.route))
      if (filters.slab)               data = data.filter(r => r.slab === filters.slab)

      setRows(data)
      setShownMeta({ ...filters })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} student${data.length !== 1 ? 's' : ''} for session ${filters.session}.`)
    }, 650)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', classes: [], routes: [], slab: '' })
    setRows([]); setSearch(''); setErrors({})
    setShown(false); setShownMeta({ session: '', classes: [], routes: [], slab: '' })
  }

  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.adm_no.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.father_name.toLowerCase().includes(q) ||
      r.mobile.includes(q) ||
      r.route.toLowerCase().includes(q) ||
      r.stoppage.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const routes   = [...new Set(filtered.map(r => r.route))]
    const stoppages = [...new Set(filtered.map(r => r.stoppage))]
    return {
      total:    filtered.length,
      routes:   routes.length,
      stoppages: stoppages.length,
    }
  }, [filtered])

  const hasResults   = shown && rows.length > 0
  const activeCount  = (filters.session ? 1 : 0) + filters.classes.length + filters.routes.length + (filters.slab ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Student Transport Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Route-wise student listing — route, stoppage, slab &amp; contact details.
          </p>
        </div>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ────────────────────────────────────────── */}
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
                value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <MultiSelectPicker
              label="Class"
              options={CLASSES}
              selected={filters.classes}
              onChange={v => setFilters(p => ({ ...p, classes: v }))}
              placeholder="-- All Classes --"
            />

            {/* Route */}
            <MultiSelectPicker
              label="Route"
              options={ROUTES}
              selected={filters.routes}
              onChange={v => setFilters(p => ({ ...p, routes: v }))}
              placeholder="-- All Routes --"
            />

            {/* Slab + Buttons */}
            <div className="flex flex-col gap-1">
              <Field label="Slab">
                <NativeSelect value={filters.slab} onChange={e => setFilters(p => ({ ...p, slab: e.target.value }))}>
                  {SLABS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </NativeSelect>
              </Field>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex gap-2 mt-4 justify-end">
            <button type="button" onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button type="button" onClick={handleShow} disabled={loading}
              className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {filters.session ? `${filters.session}` : 'Select Filters'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
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
        filters={filters}
        setFilters={setFilters}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownMeta.session} />

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard icon={Users}      label="Total Students" value={stats.total}     color="blue"    />
            <SummaryCard icon={Bus}        label="Routes"         value={stats.routes}    color="amber"   />
            <SummaryCard icon={Navigation} label="Stoppages"      value={stats.stoppages} color="emerald" />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Transport Students</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.session}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Name, route, stoppage…"
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
                Route-wise student details with slab information. Search by name, admission no, route, or stoppage.
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
                      {['S.No.', 'Reg No', 'Student Name', 'Class', 'Father Name', 'Mobile No.', 'Route', 'Stoppage', 'Slab'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.id} row={row} idx={i + 1} />
                    ))}
                  </tbody>
                  {/* Grand total row */}
                  <tfoot>
                    <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                      <td className="px-3 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                      <td className="px-3 py-3" colSpan={3}>
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Total: {filtered.length} Students
                        </span>
                      </td>
                      <td colSpan={5} className="px-3 py-3 text-right">
                        <span className="text-[12px] text-slate-400 dark:text-slate-500">
                          {stats.routes} route{stats.routes !== 1 ? 's' : ''} · {stats.stoppages} stoppage{stats.stoppages !== 1 ? 's' : ''}
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
                    Tap a card to see full details.
                  </p>
                  {filtered.map(row => (
                    <MobileCard key={row.id} row={row} />
                  ))}
                  {/* Mobile Summary */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Students', value: stats.total,     color: 'text-blue-700 dark:text-blue-300' },
                        { label: 'Routes',   value: stats.routes,    color: 'text-amber-700 dark:text-amber-300' },
                        { label: 'Stops',    value: stats.stoppages, color: 'text-emerald-700 dark:text-emerald-300' },
                      ].map(({ label, value, color }) => (
                        <div key={label} className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                          <p className={`text-[22px] font-bold tabular-nums leading-tight ${color}`}>{value}</p>
                          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
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
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Bus className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show Report</strong> to load transport data.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
