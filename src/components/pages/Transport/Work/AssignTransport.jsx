/**
 * AssignTransport.jsx
 * Folder: src/pages/Transport/AssignTransport.jsx
 *
 * Converts legacy ASPX "Assign Transport" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session, Type (Registered/Withdrawn), Class, Student dropdowns
 *  - Stoppage name search → Route display
 *  - Student grid with Route, Stoppage, Transport Type, Months selection
 *  - Save / Change Route per row
 *  - Bulk Save / Bulk Change Route footer actions
 *  - Mobile: stacked cards with accordion month picker
 *  - Desktop: dense ERP-style table
 *  - Toast notifications, loading states, empty states
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Bus, Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Search,
  MapPin, Route, Save, ArrowLeftRight, Users, CheckSquare,
  Calendar, Info, Building2, Navigation, Layers, User,
  Hash, Home, BookOpen, ToggleLeft, TrendingUp, FileSpreadsheet
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']
const STUDENT_TYPES = ['Registered', 'Withdrawn']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const STUDENTS_BY_CLASS = {
  'Nursery': [
    { id: 1, admNo: 'ADM001', name: 'Aarav Sharma',   father: 'Rajesh Sharma',   address: '12, MG Road, Dehradun' },
    { id: 2, admNo: 'ADM002', name: 'Priya Singh',    father: 'Mohan Singh',     address: '45, Civil Lines, Dehradun' },
    { id: 3, admNo: 'ADM003', name: 'Riya Gupta',     father: 'Suresh Gupta',    address: '78, Rajpur Road, Dehradun' },
  ],
  'LKG': [
    { id: 4, admNo: 'ADM004', name: 'Karan Verma',    father: 'Anil Verma',      address: '23, Saharanpur Road, Dehradun' },
    { id: 5, admNo: 'ADM005', name: 'Neha Rawat',     father: 'Dinesh Rawat',    address: '56, Ballupur, Dehradun' },
  ],
  'Class I': [
    { id: 6, admNo: 'ADM006', name: 'Amit Kumar',     father: 'Vijay Kumar',     address: '34, Raipur Road, Dehradun' },
    { id: 7, admNo: 'ADM007', name: 'Pooja Chauhan',  father: 'Ramesh Chauhan',  address: '89, Kargi Road, Dehradun' },
    { id: 8, admNo: 'ADM008', name: 'Rohit Bisht',    father: 'Naresh Bisht',    address: '11, ISBT Road, Dehradun' },
    { id: 9, admNo: 'ADM009', name: 'Sonia Negi',     father: 'Harish Negi',     address: '67, Chakrata Road, Dehradun' },
  ],
  'Class VI': [
    { id: 10, admNo: 'ADM010', name: 'Vikram Joshi',  father: 'Mahesh Joshi',    address: '29, Race Course, Dehradun' },
    { id: 11, admNo: 'ADM011', name: 'Anjali Pant',   father: 'Rakesh Pant',     address: '44, Neshvilla Road, Dehradun' },
  ],
  'Class IX': [
    { id: 12, admNo: 'ADM012', name: 'Deepak Arya',   father: 'Ganesh Arya',     address: '91, Haridwar Bypass, Dehradun' },
    { id: 13, admNo: 'ADM013', name: 'Kavya Rana',    father: 'Sunil Rana',      address: '33, Survey Road, Dehradun' },
  ],
}

const ROUTES = [
  { id: 'R1', name: 'Route 1 – Rajpur Road',       stoppages: ['Rajpur Chowk', 'Malsi', 'Mussoorie Diversion', 'GMS Road'] },
  { id: 'R2', name: 'Route 2 – Haridwar Bypass',   stoppages: ['ISBT', 'Jakhan', 'Ballupur', 'IMA Chowk'] },
  { id: 'R3', name: 'Route 3 – Chakrata Road',     stoppages: ['Kishanpur', 'Nathanpur', 'Niranjanpur', 'Prem Nagar'] },
  { id: 'R4', name: 'Route 4 – Saharanpur Road',   stoppages: ['Clement Town', 'Kargi', 'Sewla Kalan', 'Bhauwala'] },
  { id: 'R5', name: 'Route 5 – Raipur Road',       stoppages: ['Raipur Chowk', 'Bhaniawala', 'Doiwala', 'Rishikesh Bypass'] },
]

const TRANSPORT_TYPES = ['One Way (Morning)', 'One Way (Evening)', 'Both Way']
const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

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

// Build initial row state for a student
const buildRow = (stu) => ({
  ...stu,
  route: '',
  stoppage: '',
  transportType: '',
  months: [],
  saved: false,
  routeChanged: false,
})

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

function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
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

// ─── MONTH PICKER (compact grid) ──────────────────────────────────────────────
function MonthPicker({ selected, onChange }) {
  const allSelected = selected.length === MONTHS.length

  const toggleAll = () => {
    onChange(allSelected ? [] : [...MONTHS])
  }

  const toggle = (m) => {
    onChange(selected.includes(m) ? selected.filter(x => x !== m) : [...selected, m])
  }

  return (
    <div className="space-y-1.5">
      {/* Select All */}
      <button
        type="button"
        onClick={toggleAll}
        className={`flex items-center gap-1.5 text-[11px] font-bold px-2 py-1 rounded-lg transition-colors
          ${allSelected
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
      >
        <CheckSquare className="w-3 h-3" />
        {allSelected ? 'Deselect All' : 'Select All'}
      </button>
      {/* Month grid */}
      <div className="flex flex-wrap gap-1">
        {MONTHS.map(m => (
          <button
            key={m}
            type="button"
            onClick={() => toggle(m)}
            className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-all
              ${selected.includes(m)
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onUpdate, onSave, onChangeRoute }) {
  const { fg, bg } = classColor(row.name)
  const route = ROUTES.find(r => r.id === row.route)
  const stoppages = route?.stoppages || []

  const set = (field, val) => onUpdate(row.id, field, val)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors align-top">
      {/* Checkbox + S.No */}
      <td className="px-3 py-3 text-center w-10">
        <input
          type="checkbox"
          checked={row.selected || false}
          onChange={e => set('selected', e.target.checked)}
          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
        />
      </td>
      {/* Adm No */}
      <td className="px-3 py-3">
        <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">{row.admNo}</span>
      </td>
      {/* Student Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}>
            {row.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>
      {/* Father Name */}
      <td className="px-3 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.father}</span>
      </td>
      {/* Address */}
      <td className="px-3 py-3 max-w-[160px]">
        <span className="text-[11px] text-slate-500 dark:text-slate-500 line-clamp-2">{row.address}</span>
      </td>
      {/* Route */}
      <td className="px-3 py-3 min-w-[160px]">
        <NativeSelect value={row.route} onChange={e => { set('route', e.target.value); set('stoppage', '') }} placeholder="-- Route --">
          {ROUTES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </NativeSelect>
      </td>
      {/* Stoppage */}
      <td className="px-3 py-3 min-w-[140px]">
        <NativeSelect value={row.stoppage} onChange={e => set('stoppage', e.target.value)} placeholder="-- Stoppage --" disabled={!row.route}>
          {stoppages.map(s => <option key={s} value={s}>{s}</option>)}
        </NativeSelect>
      </td>
      {/* Transport Type */}
      <td className="px-3 py-3 min-w-[150px]">
        <NativeSelect value={row.transportType} onChange={e => set('transportType', e.target.value)} placeholder="-- Type --">
          {TRANSPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </NativeSelect>
      </td>
      {/* Months */}
      <td className="px-3 py-3 min-w-[260px]">
        <MonthPicker selected={row.months} onChange={val => set('months', val)} />
      </td>
      {/* Actions */}
      <td className="px-3 py-3 min-w-[130px]">
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => onSave(row.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-sm shadow-emerald-500/20"
          >
            <Save className="w-3.5 h-3.5" /> Save
          </button>
          <button
            type="button"
            onClick={() => onChangeRoute(row.id)}
            className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-95 shadow-sm shadow-amber-500/20"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" /> Change Route
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileCard({ row, idx, onUpdate, onSave, onChangeRoute }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.name)
  const route = ROUTES.find(r => r.id === row.route)
  const stoppages = route?.stoppages || []
  const set = (field, val) => onUpdate(row.id, field, val)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <input
          type="checkbox"
          checked={row.selected || false}
          onChange={e => { e.stopPropagation(); set('selected', e.target.checked) }}
          onClick={e => e.stopPropagation()}
          className="w-4 h-4 rounded accent-blue-600 cursor-pointer flex-shrink-0"
        />
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {row.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            <span className="font-semibold text-slate-500 dark:text-slate-400">{row.admNo}</span>
            &nbsp;·&nbsp;{row.father}
          </p>
        </div>
        {/* Status pill */}
        {row.saved && (
          <span className="flex-shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
            <Check className="w-3 h-3" /> Saved
          </span>
        )}
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Address strip */}
      <div className="px-4 pb-3 flex items-center gap-1.5">
        <Home className="w-3 h-3 text-slate-400 flex-shrink-0" />
        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{row.address}</p>
      </div>

      {/* Expanded Transport Assignment */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-4 space-y-3">
          {/* Route */}
          <Field label="Route">
            <NativeSelect value={row.route} onChange={e => { set('route', e.target.value); set('stoppage', '') }} placeholder="-- Select Route --">
              {ROUTES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </NativeSelect>
          </Field>

          {/* Stoppage */}
          <Field label="Stoppage">
            <NativeSelect value={row.stoppage} onChange={e => set('stoppage', e.target.value)} placeholder="-- Select Stoppage --" disabled={!row.route}>
              {stoppages.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          {/* Transport Type */}
          <Field label="Transport Type">
            <NativeSelect value={row.transportType} onChange={e => set('transportType', e.target.value)} placeholder="-- Select Type --">
              {TRANSPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>

          {/* Months */}
          <Field label="Select Months">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
              <MonthPicker selected={row.months} onChange={val => set('months', val)} />
            </div>
          </Field>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onSave(row.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
            >
              <Save className="w-4 h-4" /> Save
            </button>
            <button
              type="button"
              onClick={() => onChangeRoute(row.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeftRight className="w-4 h-4" /> Change Route
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, onSubmit, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35]">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setFilters(p => ({ ...p, session: e.target.value }))}
              placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Student Type" error={errors.type}>
            <NativeSelect value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
              placeholder="-- Select Type --">
              {STUDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Class" error={errors.cls}>
            <NativeSelect value={filters.cls} onChange={e => setFilters(p => ({ ...p, cls: e.target.value, student: '' }))}
              placeholder="-- Select Class --">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Student (Optional)">
            <NativeSelect value={filters.student} onChange={e => setFilters(p => ({ ...p, student: e.target.value }))}
              placeholder="-- All Students --" disabled={!filters.cls}>
              {(STUDENTS_BY_CLASS[filters.cls] || []).map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.admNo})</option>
              ))}
            </NativeSelect>
          </Field>

          <Field label="Stoppage Search">
            <div className="relative">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={filters.stoppage}
                onChange={e => setFilters(p => ({ ...p, stoppage: e.target.value }))}
                placeholder="Enter stoppage name…"
                className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 border-slate-200 dark:bg-[#1e2238] dark:text-slate-200
                  dark:border-[rgba(99,102,241,0.25)] focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </Field>

          {/* Route display if stoppage matched */}
          {filters.stoppage && (
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1 flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5" /> Matched Routes
              </p>
              {ROUTES.filter(r => r.stoppages.some(s => s.toLowerCase().includes(filters.stoppage.toLowerCase())))
                .map(r => (
                  <p key={r.id} className="text-[12px] text-blue-700 dark:text-blue-300 py-0.5">• {r.name}</p>
                ))}
            </div>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Students
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AssignTransport() {
  const [filters, setFilters] = useState({ session: '', type: 'Registered', cls: '', student: '', stoppage: '' })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [shown, setShown] = useState(false)
  const [shownMeta, setShownMeta] = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Please select a session'
    if (!filters.cls) err.cls = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let students = STUDENTS_BY_CLASS[filters.cls] || []
      // If specific student selected
      if (filters.student) {
        students = students.filter(s => String(s.id) === String(filters.student))
      }
      const data = students.map(buildRow)
      setRows(data)
      setShownMeta({ session: filters.session, cls: filters.cls, type: filters.type })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} student${data.length !== 1 ? 's' : ''} for ${filters.cls} · ${filters.session}`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', type: 'Registered', cls: '', student: '', stoppage: '' })
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownMeta({})
  }

  // ── Row update ────────────────────────────────────────────────────────────
  const handleUpdate = useCallback((id, field, val) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r))
  }, [])

  // ── Save row ──────────────────────────────────────────────────────────────
  const handleSave = useCallback((id) => {
    const row = rows.find(r => r.id === id)
    if (!row.route || !row.stoppage || !row.transportType || row.months.length === 0) {
      showToast('Please fill Route, Stoppage, Type & at least one Month.', 'error'); return
    }
    setRows(prev => prev.map(r => r.id === id ? { ...r, saved: true, routeChanged: false } : r))
    showToast(`Transport assigned for ${row.name}.`)
  }, [rows])

  // ── Change Route ──────────────────────────────────────────────────────────
  const handleChangeRoute = useCallback((id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, route: '', stoppage: '', saved: false, routeChanged: true } : r))
    showToast('Route cleared. Please re-assign.', 'error')
  }, [])

  // ── Bulk Save ─────────────────────────────────────────────────────────────
  const handleBulkSave = () => {
    const selected = rows.filter(r => r.selected)
    if (selected.length === 0) { showToast('Select at least one student.', 'error'); return }
    const invalid = selected.filter(r => !r.route || !r.stoppage || !r.transportType || r.months.length === 0)
    if (invalid.length > 0) { showToast(`${invalid.length} student(s) missing transport details.`, 'error'); return }
    setRows(prev => prev.map(r => r.selected ? { ...r, saved: true } : r))
    showToast(`Transport saved for ${selected.length} student(s).`)
  }

  const handleBulkChangeRoute = () => {
    const selected = rows.filter(r => r.selected)
    if (selected.length === 0) { showToast('Select at least one student.', 'error'); return }
    setRows(prev => prev.map(r => r.selected ? { ...r, route: '', stoppage: '', saved: false, routeChanged: true } : r))
    showToast(`Route cleared for ${selected.length} student(s).`, 'error')
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.admNo.toLowerCase().includes(q) ||
      r.father.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: filtered.length,
    assigned: filtered.filter(r => r.saved).length,
    pending: filtered.filter(r => !r.saved).length,
    selected: filtered.filter(r => r.selected).length,
  }), [filtered])

  const hasResults = shown && rows.length > 0
  const activeFilters = [filters.session, filters.cls].filter(Boolean).length

  // ── Route display for stoppage search (desktop) ───────────────────────────
  const matchedRoutes = filters.stoppage
    ? ROUTES.filter(r => r.stoppages.some(s => s.toLowerCase().includes(filters.stoppage.toLowerCase())))
    : []

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Assign Transport
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Assign routes, stoppages &amp; months to registered students.
          </p>
        </div>
        {hasResults && (
          <div className="hidden sm:flex items-center gap-2">
            <button type="button" onClick={handleBulkSave}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95">
              <Save className="w-4 h-4" /> Bulk Save
            </button>
            <button type="button" onClick={handleBulkChangeRoute}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-amber-500 text-white hover:bg-amber-600 shadow-md shadow-amber-500/20
                transition-all active:scale-95">
              <ArrowLeftRight className="w-4 h-4" /> Bulk Change Route
            </button>
          </div>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Type */}
            <Field label="Student Type">
              <NativeSelect value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}>
                {STUDENT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={filters.cls}
                onChange={e => { setFilters(p => ({ ...p, cls: e.target.value, student: '' })); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Class --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Student */}
            <Field label="Student">
              <NativeSelect value={filters.student}
                onChange={e => setFilters(p => ({ ...p, student: e.target.value }))}
                placeholder="-- All Students --" disabled={!filters.cls}>
                {(STUDENTS_BY_CLASS[filters.cls] || []).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.admNo})</option>
                ))}
              </NativeSelect>
            </Field>

            {/* Stoppage Search */}
            <Field label="Stoppage Name">
              <div className="relative">
                <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={filters.stoppage}
                  onChange={e => setFilters(p => ({ ...p, stoppage: e.target.value }))}
                  placeholder="Search stoppage…"
                  className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 border-slate-200 dark:bg-[#1e2238] dark:text-slate-200
                    dark:border-[rgba(99,102,241,0.25)] focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </Field>

            {/* Actions */}
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

          {/* Stoppage → Route result strip */}
          {matchedRoutes.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 text-[12px] font-bold text-blue-600 dark:text-blue-400">
                <Route className="w-3.5 h-3.5" /> Matched routes:
              </span>
              {matchedRoutes.map(r => (
                <span key={r.id} className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[12px] font-semibold text-blue-700 dark:text-blue-300">
                  {r.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {filters.cls ? `${filters.cls} · ${filters.session || 'No Session'}` : 'Select Filters'}
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
        filters={filters}
        setFilters={setFilters}
        onSubmit={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.18 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}       label="Total Students"  value={stats.total}    color="blue"    />
            <SummaryCard icon={Check}       label="Assigned"        value={stats.assigned} color="emerald" />
            <SummaryCard icon={AlertCircle} label="Pending"         value={stats.pending}  color="amber"   />
            <SummaryCard icon={CheckSquare} label="Selected"        value={stats.selected} color="violet"  />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Bus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Transport Assignment</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.cls} · {shownMeta.session}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name / adm no…"
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
                Select students using checkboxes for bulk operations. Fill Route, Stoppage, Type &amp; Months then Save.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {[
                        { label: '', w: 'w-10' },
                        { label: 'Adm No', w: '' },
                        { label: 'Student Name', w: '' },
                        { label: 'Father Name', w: '' },
                        { label: 'Address', w: '' },
                        { label: 'Route', w: '' },
                        { label: 'Stoppage', w: '' },
                        { label: 'Transport Type', w: '' },
                        { label: 'Months', w: '' },
                        { label: 'Action', w: '' },
                      ].map((h, i) => (
                        <th key={i} className={`px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap ${h.w}`}>
                          {h.label}
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
                        onUpdate={handleUpdate}
                        onSave={handleSave}
                        onChangeRoute={handleChangeRoute}
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
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to assign transport details.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard
                      key={row.id}
                      row={row}
                      idx={i + 1}
                      onUpdate={handleUpdate}
                      onSave={handleSave}
                      onChangeRoute={handleChangeRoute}
                    />
                  ))}
                </>
              )}
            </div>

            {/* ── MOBILE Bulk Actions Footer ── */}
            {hasResults && !loading && stats.selected > 0 && (
              <div className="md:hidden border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] px-4 py-3 bg-blue-50/50 dark:bg-blue-500/[0.04]">
                <p className="text-[12px] font-semibold text-blue-700 dark:text-blue-400 mb-2">
                  {stats.selected} student{stats.selected !== 1 ? 's' : ''} selected
                </p>
                <div className="flex gap-2">
                  <button type="button" onClick={handleBulkSave}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                      bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95">
                    <Save className="w-4 h-4" /> Bulk Save
                  </button>
                  <button type="button" onClick={handleBulkChangeRoute}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                      bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-95">
                    <ArrowLeftRight className="w-4 h-4" /> Change Route
                  </button>
                </div>
              </div>
            )}

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> students
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>

          {/* ── DESKTOP Bulk Footer ── */}
          <div className="hidden sm:flex items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm px-5 py-4">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-[13px] text-slate-600 dark:text-slate-400">
                {stats.selected > 0
                  ? <><span className="font-bold text-slate-800 dark:text-slate-200">{stats.selected}</span> student{stats.selected !== 1 ? 's' : ''} selected</>
                  : 'Select students via checkboxes for bulk operations'}
              </span>
            </div>
            {stats.selected > 0 && (
              <div className="flex gap-2">
                <button type="button" onClick={handleBulkSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                    bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-sm">
                  <Save className="w-4 h-4" /> Save Selected
                </button>
                <button type="button" onClick={handleBulkChangeRoute}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                    bg-amber-500 text-white hover:bg-amber-600 transition-all active:scale-95 shadow-sm">
                  <ArrowLeftRight className="w-4 h-4" /> Change Route
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Bus className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No data loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select Session, Class and click <strong>Show</strong> to load students for transport assignment.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
