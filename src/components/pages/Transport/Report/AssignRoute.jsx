/**
 * AssignRoute.jsx
 * Folder: src/pages/Transport/Reports/AssignRoute.jsx
 *
 * Converts legacy ASPX "Route Report" (assignRoute.aspx) to fully-responsive React + Tailwind.
 *
 * Filters: Session, Class, Route
 * Columns: S.No, Registration No, Student Name, Class Name, Route
 * Features:
 *  - Three cascading dropdowns (Session → Class → Route)
 *  - Show report button + Excel export
 *  - Mobile: card view with expandable details
 *  - Desktop: dense ERP-style table
 *  - Search filter on results
 *  - Summary stats
 *  - School header banner
 *  - Grand total / record count footer
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Info, Search,
  FileSpreadsheet, BookOpen,
  Building2, MapPin, Bus, Route, Users,
  ChevronRight, Navigation, School2, TrendingUp,
  UserCircle2, Hash, GraduationCap, Map
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const ROUTES = [
  'All Routes',
  'Route A – Rajpur Road',
  'Route B – Saharanpur Road',
  'Route C – Haridwar Bypass',
  'Route D – Mussoorie Diversion',
  'Route E – Prem Nagar',
  'Route F – Raipur Road',
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Dummy student-route assignment data
const RAW_DATA = [
  { registration_no: 'REG-2025-001', Name: 'Aarav Sharma',    Class_Name: 'Class VI',   Route: 'Route A – Rajpur Road' },
  { registration_no: 'REG-2025-002', Name: 'Priya Negi',      Class_Name: 'Class VI',   Route: 'Route B – Saharanpur Road' },
  { registration_no: 'REG-2025-003', Name: 'Rohan Bisht',     Class_Name: 'Class VI',   Route: 'Route C – Haridwar Bypass' },
  { registration_no: 'REG-2025-004', Name: 'Sneha Rawat',     Class_Name: 'Class VII',  Route: 'Route A – Rajpur Road' },
  { registration_no: 'REG-2025-005', Name: 'Karan Thapliyal', Class_Name: 'Class VII',  Route: 'Route D – Mussoorie Diversion' },
  { registration_no: 'REG-2025-006', Name: 'Ananya Dobhal',   Class_Name: 'Class VIII', Route: 'Route E – Prem Nagar' },
  { registration_no: 'REG-2025-007', Name: 'Vivek Panwar',    Class_Name: 'Class VIII', Route: 'Route B – Saharanpur Road' },
  { registration_no: 'REG-2025-008', Name: 'Meera Joshi',     Class_Name: 'Class IX',   Route: 'Route F – Raipur Road' },
  { registration_no: 'REG-2025-009', Name: 'Arjun Singh',     Class_Name: 'Class IX',   Route: 'Route C – Haridwar Bypass' },
  { registration_no: 'REG-2025-010', Name: 'Tanvi Lal',       Class_Name: 'Class X',    Route: 'Route A – Rajpur Road' },
  { registration_no: 'REG-2025-011', Name: 'Nikhil Uniyal',   Class_Name: 'Class X',    Route: 'Route D – Mussoorie Diversion' },
  { registration_no: 'REG-2025-012', Name: 'Divya Aswal',     Class_Name: 'Class XI',   Route: 'Route E – Prem Nagar' },
  { registration_no: 'REG-2025-013', Name: 'Harsh Kandpal',   Class_Name: 'Class XI',   Route: 'Route B – Saharanpur Road' },
  { registration_no: 'REG-2025-014', Name: 'Sakshi Bora',     Class_Name: 'Class XII',  Route: 'Route F – Raipur Road' },
  { registration_no: 'REG-2025-015', Name: 'Aditya Semwal',   Class_Name: 'Class XII',  Route: 'Route A – Rajpur Road' },
  { registration_no: 'REG-2025-016', Name: 'Pooja Riyal',     Class_Name: 'Nursery',    Route: 'Route C – Haridwar Bypass' },
  { registration_no: 'REG-2025-017', Name: 'Rahul Gairola',   Class_Name: 'LKG',        Route: 'Route B – Saharanpur Road' },
  { registration_no: 'REG-2025-018', Name: 'Tanya Nayal',     Class_Name: 'UKG',        Route: 'Route A – Rajpur Road' },
  { registration_no: 'REG-2025-019', Name: 'Mohan Bajpai',    Class_Name: 'Class I',    Route: 'Route D – Mussoorie Diversion' },
  { registration_no: 'REG-2025-020', Name: 'Riya Kapoor',     Class_Name: 'Class II',   Route: 'Route E – Prem Nagar' },
  { registration_no: 'REG-2025-021', Name: 'Yash Matiyali',   Class_Name: 'Class III',  Route: 'Route F – Raipur Road' },
  { registration_no: 'REG-2025-022', Name: 'Nisha Pokhriyal', Class_Name: 'Class IV',   Route: 'Route A – Rajpur Road' },
  { registration_no: 'REG-2025-023', Name: 'Suresh Ramola',   Class_Name: 'Class V',    Route: 'Route C – Haridwar Bypass' },
  { registration_no: 'REG-2025-024', Name: 'Kavya Mamgain',   Class_Name: 'Class VI',   Route: 'Route B – Saharanpur Road' },
  { registration_no: 'REG-2025-025', Name: 'Deepak Barthwal', Class_Name: 'Class VII',  Route: 'Route E – Prem Nagar' },
  { registration_no: 'REG-2025-026', Name: 'Shivani Gosain',  Class_Name: 'Class VIII', Route: 'Route D – Mussoorie Diversion' },
  { registration_no: 'REG-2025-027', Name: 'Lokesh Purohit',  Class_Name: 'Class IX',   Route: 'Route F – Raipur Road' },
  { registration_no: 'REG-2025-028', Name: 'Anjali Verma',    Class_Name: 'Class X',    Route: 'Route A – Rajpur Road' },
  { registration_no: 'REG-2025-029', Name: 'Raj Shukla',      Class_Name: 'Class XI',   Route: 'Route B – Saharanpur Road' },
  { registration_no: 'REG-2025-030', Name: 'Preeti Nainwal',  Class_Name: 'Class XII',  Route: 'Route C – Haridwar Bypass' },
]

// Route color palette
const ROUTE_COLORS = {
  'Route A – Rajpur Road':          { fg: '#1d4ed8', bg: '#dbeafe', dot: 'bg-blue-500' },
  'Route B – Saharanpur Road':      { fg: '#7c3aed', bg: '#ede9fe', dot: 'bg-violet-500' },
  'Route C – Haridwar Bypass':      { fg: '#0891b2', bg: '#cffafe', dot: 'bg-cyan-500' },
  'Route D – Mussoorie Diversion':  { fg: '#059669', bg: '#d1fae5', dot: 'bg-emerald-500' },
  'Route E – Prem Nagar':           { fg: '#d97706', bg: '#fef3c7', dot: 'bg-amber-500' },
  'Route F – Raipur Road':          { fg: '#dc2626', bg: '#fee2e2', dot: 'bg-rose-500' },
}

const getRouteColor = (route) =>
  ROUTE_COLORS[route] ?? { fg: '#475569', bg: '#f1f5f9', dot: 'bg-slate-400' }

// Avatar initials
const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

// Avatar bg from name
const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-emerald-500',
  'bg-amber-500', 'bg-rose-500', 'bg-cyan-500', 'bg-indigo-500',
]
const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────

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

// ─── SUMMARY STAT CARD ───────────────────────────────────────────────────────
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

// ─── SCHOOL HEADER BANNER ────────────────────────────────────────────────────
function SchoolHeader({ session, appliedClass, appliedRoute }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </span>
        {appliedClass && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
            <GraduationCap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">{appliedClass}</span>
          </span>
        )}
        {appliedRoute && appliedRoute !== 'All Routes' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25">
            <Navigation className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">{appliedRoute}</span>
          </span>
        )}
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Route Report
      </p>
    </div>
  )
}

// ─── ROUTE BADGE ─────────────────────────────────────────────────────────────
function RouteBadge({ route }) {
  const { fg, bg } = getRouteColor(route)
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap"
      style={{ background: bg, color: fg }}
    >
      <Navigation className="w-3 h-3 flex-shrink-0" />
      {route}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ───────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const initials = getInitials(row.Name)
  const avBg = avatarColor(row.Name)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Registration No */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-mono font-semibold
          bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Hash className="w-3 h-3 flex-shrink-0 opacity-60" />
          {row.registration_no}
        </span>
      </td>

      {/* Student Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-white ${avBg}`}>
            {initials}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.Name}</span>
        </div>
      </td>

      {/* Class Name */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold
          bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 whitespace-nowrap">
          {row.Class_Name}
        </span>
      </td>

      {/* Route */}
      <td className="px-4 py-3">
        <RouteBadge route={row.Route} />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const initials = getInitials(row.Name)
  const avBg = avatarColor(row.Name)
  const { fg, bg, dot } = getRouteColor(row.Route)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card Header – always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-bold text-white ${avBg}`}>
          {initials}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.Name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{row.registration_no}</p>
        </div>

        {/* Route dot + class */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg"
            style={{ background: bg, color: fg }}>
            {row.Class_Name}
          </span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Route strip */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">{row.Route}</span>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* 3 detail chips */}
          <div className="grid grid-cols-1 gap-2">
            {/* Reg No */}
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3">
              <span className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <Hash className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Registration No</p>
                <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 font-mono">{row.registration_no}</p>
              </div>
            </div>
            {/* Class */}
            <div className="flex items-center gap-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
              <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500 dark:text-blue-400">Class</p>
                <p className="text-[13px] font-bold text-blue-700 dark:text-blue-300">{row.Class_Name}</p>
              </div>
            </div>
            {/* Route */}
            <div className="flex items-center gap-3 rounded-xl p-3 border"
              style={{ background: bg + '33', borderColor: bg }}>
              <span className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: bg }}>
                <Navigation className="w-4 h-4" style={{ color: fg }} />
              </span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: fg }}>Assigned Route</p>
                <p className="text-[13px] font-bold" style={{ color: fg }}>{row.Route}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, cls, setCls, route, setRoute, onShow, loading, errors }) {
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
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls}>
            <NativeSelect value={cls} onChange={e => setCls(e.target.value)} placeholder="-- All Classes --">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Route" error={errors.route}>
            <NativeSelect value={route} onChange={e => setRoute(e.target.value)} placeholder="-- All Routes --">
              {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
            </NativeSelect>
          </Field>
        </div>

        {/* Actions */}
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AssignRoute() {
  // Filter state
  const [session,   setSession]   = useState('')
  const [cls,       setCls]       = useState('')
  const [route,     setRoute]     = useState('')

  // UI state
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)

  // Applied filter labels (for header banner)
  const [applied, setApplied] = useState({ session: '', cls: '', route: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Show Report (simulate API) ───────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = [...RAW_DATA]

      // Filter by class
      if (cls) {
        data = data.filter(r => r.Class_Name === cls)
      }

      // Filter by route (skip "All Routes")
      if (route && route !== 'All Routes') {
        data = data.filter(r => r.Route === route)
      }

      // Add sno
      data = data.map((r, i) => ({ ...r, sno: i + 1 }))

      setRows(data)
      setApplied({ session, cls: cls || 'All Classes', route: route || 'All Routes' })
      setShown(true)
      setLoading(false)
      showToast(`${data.length} records loaded for session ${session}.`)
    }, 650)
  }, [session, cls, route])

  const handleReset = () => {
    setSession(''); setCls(''); setRoute('')
    setRows([]); setSearch(''); setErrors({})
    setShown(false); setApplied({ session: '', cls: '', route: '' })
  }

  // ── Excel Export placeholder ─────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.Name.toLowerCase().includes(q) ||
      r.registration_no.toLowerCase().includes(q) ||
      r.Class_Name.toLowerCase().includes(q) ||
      r.Route.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Unique routes in results ─────────────────────────────────────────────
  const uniqueRoutes = useMemo(() =>
    [...new Set(rows.map(r => r.Route))].length
  , [rows])

  const hasResults   = shown && rows.length > 0
  const activeFilters = [session, cls, route].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Route Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View students assigned to transport routes by session, class &amp; route.
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

            {/* Class */}
            <Field label="Class">
              <NativeSelect value={cls} onChange={e => setCls(e.target.value)} placeholder="-- All Classes --">
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Route */}
            <Field label="Route">
              <NativeSelect value={route} onChange={e => setRoute(e.target.value)} placeholder="-- All Routes --">
                {ROUTES.map(r => <option key={r} value={r}>{r}</option>)}
              </NativeSelect>
            </Field>

            {/* Buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
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

      {/* ── MOBILE Filter Bar ───────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 ? `Filters Applied (${activeFilters})` : 'Select Filters'}
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
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        route={route} setRoute={setRoute}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={applied.session}
            appliedClass={applied.cls !== 'All Classes' ? applied.cls : ''}
            appliedRoute={applied.route}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SummaryCard icon={Users}      label="Total Students"  value={rows.length}  color="blue"    />
            <SummaryCard icon={Map}        label="Routes Covered"  value={uniqueRoutes} color="emerald" />
            <SummaryCard icon={School2}    label="Filtered Records" value={filtered.length} color="amber" />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Route Assignments</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {applied.session}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, reg no, route…"
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
                Displaying students assigned to transport routes. Use filters above to narrow by class or specific route.
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
                      {['S.No.', 'Registration No.', 'Student Name', 'Class', 'Route'].map((h, i) => (
                        <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                          ${i === 0 ? 'text-center w-12' : i === 3 ? 'text-center' : 'text-left'}`}>
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
                  {filtered.map((row, i) => (
                    <MobileCard key={row.registration_no} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile summary footer */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{filtered.length}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{uniqueRoutes}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Routes Covered</p>
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
              Select a session (and optionally class/route) then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
