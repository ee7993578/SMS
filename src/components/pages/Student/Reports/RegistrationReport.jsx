/**
 * RegistrationReport.jsx
 * Folder: src/pages/Student/Reports/RegistrationReport.jsx
 *
 * Converts legacy ASPX "Registered Student Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Form No, Class, Student Name, Status, Registration Date, Registration No, Reprint Receipt
 * Features:
 *  - Session dropdown + Registration Date picker + Status filter
 *  - Show / Excel Export buttons
 *  - Mobile: card-based layout with expandable details + filter drawer
 *  - Desktop: dense ERP-style table
 *  - Search bar in results header
 *  - Summary stat cards
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  ChevronRight, Search, SlidersHorizontal,
  FileSpreadsheet, BookOpen, Info,
  User, Hash, Calendar, ShieldCheck,
  PrinterIcon, ClipboardList, TrendingUp,
  CheckCircle2, Clock, BarChart3
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const STATUS_OPTIONS = [
  { value: '0',          label: 'Select All' },
  { value: 'Registered', label: 'Confirmed'  },
  { value: 'Admitted',   label: 'Not Confirmed' },
]

const CLASS_LIST = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

// Generate realistic dummy records
const generateRecords = (session) => {
  const names = [
    'Aarav Sharma','Priya Verma','Rohan Gupta','Sneha Singh','Aditya Kumar',
    'Pooja Mishra','Vikram Patel','Anjali Yadav','Rahul Tiwari','Kavya Joshi',
    'Aryan Dubey','Divya Nair','Karan Mehta','Simran Kaur','Deepak Rao',
    'Neha Pandey','Mohit Srivastava','Ritika Saxena','Amit Chauhan','Sunita Devi',
    'Lakshmi Iyer','Tarun Bajaj','Geeta Kumari','Suresh Pillai','Meena Rawat',
    'Harsh Agarwal','Swati Bose','Naveen Reddy','Ritu Sharma','Pankaj Jain',
    'Ananya Bhatt','Saurabh Singh','Kritika Mahajan','Vivek Shukla','Priti Das',
    'Rishab Goel','Mansi Gupta','Tushar Negi','Pallavi Sinha','Rajesh Dhawan',
  ]
  const statuses = ['Registered', 'Admitted']
  const records = []
  const yr = session?.split('-')[0] ?? '2024'

  for (let i = 0; i < 38; i++) {
    const cls = CLASS_LIST[i % CLASS_LIST.length]
    const day = String((i % 28) + 1).padStart(2, '0')
    const month = String((i % 10) + 1).padStart(2, '0')
    records.push({
      id:               i + 1,
      form_no:          `FRM${yr}${String(1000 + i).slice(1)}`,
      class_name:       cls,
      name:             names[i % names.length],
      status:           statuses[i % 2],
      Registration_date:`${day} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct'][i % 10]} ${yr}`,
      registration_no:  `REG${yr}${String(2000 + i).slice(1)}`,
    })
  }
  return records
}

const ALL_DATA = Object.fromEntries(
  SESSIONS.map(s => [s, generateRecords(s)])
)

// ─── CLASS COLOR HELPER ───────────────────────────────────────────────────────
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

// ─── STATUS PILL ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const confirmed = status === 'Registered'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap
      ${confirmed
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25'
        : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/25'
      }`}
    >
      {confirmed
        ? <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
        : <Clock className="w-3 h-3 flex-shrink-0" />
      }
      {confirmed ? 'Confirmed' : 'Not Confirmed'}
    </span>
  )
}

// ─── NATIVE SELECT ────────────────────────────────────────────────────────────
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

// ─── DATE INPUT ───────────────────────────────────────────────────────────────
function DateInput({ value, onChange, placeholder, error }) {
  return (
    <div className="relative">
      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input
        type="date"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      />
    </div>
  )
}

// ─── FIELD WRAPPER ────────────────────────────────────────────────────────────
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

// ─── TOAST ────────────────────────────────────────────────────────────────────
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
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value.toLocaleString()}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onReprint }) {
  const { fg, bg } = classColor(row.class_name)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Form No */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-700 dark:text-blue-400 font-mono">
          <Hash className="w-3 h-3 opacity-60" />
          {row.form_no}
        </span>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.class_name)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class_name}</span>
        </div>
      </td>

      {/* Student Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold">
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <StatusPill status={row.status} />
      </td>

      {/* Registration Date */}
      <td className="px-4 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap tabular-nums">
          {row.Registration_date}
        </span>
      </td>

      {/* Registration No */}
      <td className="px-4 py-3">
        <span className="text-[12px] font-mono font-semibold text-slate-600 dark:text-slate-300">
          {row.registration_no}
        </span>
      </td>

      {/* Reprint */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onReprint(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
            bg-emerald-50 text-emerald-700 border border-emerald-200
            hover:bg-emerald-100 hover:border-emerald-300
            dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25 dark:hover:bg-emerald-500/20
            transition-colors"
        >
          <PrinterIcon className="w-3 h-3" />
          Reprint
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onReprint }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class_name)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">

      {/* Header row — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[12px] font-bold">
          {row.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span
              className="inline-flex items-center justify-center px-2 py-0.5 rounded text-[9px] font-bold"
              style={{ background: bg, color: fg }}
            >
              {row.class_name}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">{row.form_no}</span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusPill status={row.status} />
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">

          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">

            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500 dark:text-blue-400 mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Form No
              </p>
              <p className="text-[13px] font-bold text-blue-800 dark:text-blue-300 font-mono">{row.form_no}</p>
            </div>

            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500 dark:text-violet-400 mb-1 flex items-center gap-1">
                <ClipboardList className="w-3 h-3" /> Reg. No
              </p>
              <p className="text-[13px] font-bold text-violet-800 dark:text-violet-300 font-mono">{row.registration_no}</p>
            </div>

            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-500 dark:text-emerald-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Reg. Date
              </p>
              <p className="text-[12px] font-bold text-emerald-800 dark:text-emerald-300 tabular-nums">{row.Registration_date}</p>
            </div>

            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Class
              </p>
              <div className="flex items-center gap-1.5">
                <span
                  className="w-5 h-5 rounded flex items-center justify-center text-[8px] font-bold"
                  style={{ background: classColor(row.class_name).bg, color: classColor(row.class_name).fg }}
                >
                  {formatAbbr(row.class_name)}
                </span>
                <p className="text-[12px] font-bold text-slate-800 dark:text-slate-200">{row.class_name}</p>
              </div>
            </div>
          </div>

          {/* Reprint button — full width on mobile */}
          <button
            type="button"
            onClick={() => onReprint(row)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-md shadow-emerald-500/20"
          >
            <PrinterIcon className="w-4 h-4" />
            Reprint Receipt
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({
  open, onClose,
  session, setSession,
  regDate, setRegDate,
  status, setStatus,
  onShow, loading, errors
}) {
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

        {/* Drawer header */}
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

          <Field label="Registration Date">
            <DateInput
              value={regDate}
              onChange={e => setRegDate(e.target.value)}
              placeholder="Registration Date"
            />
          </Field>

          <Field label="Select Status">
            <NativeSelect value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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

// ─── REPRINT MODAL ────────────────────────────────────────────────────────────
function ReprintModal({ row, onClose }) {
  if (!row) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-hidden"
          style={{ animation: 'fadeIn .2s ease' }}>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <PrinterIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Reprint Receipt</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5 space-y-3">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-4 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <p className="text-[14px] font-bold text-emerald-800 dark:text-emerald-300">{row.name}</p>
              <p className="text-[12px] text-emerald-600 dark:text-emerald-400">{row.class_name}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[12px]">
              {[
                { label: 'Form No', value: row.form_no },
                { label: 'Reg. No', value: row.registration_no },
                { label: 'Reg. Date', value: row.Registration_date },
                { label: 'Status', value: row.status === 'Registered' ? 'Confirmed' : 'Not Confirmed' },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-0.5">{label}</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200 font-mono">{value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="px-5 pb-5 flex gap-2">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button
              onClick={() => { window.print(); onClose() }}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-500/20"
            >
              <PrinterIcon className="w-4 h-4" />
              Print Now
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RegistrationReport() {
  const [session,    setSession]    = useState('')
  const [regDate,    setRegDate]    = useState('')
  const [status,     setStatus]     = useState('0')
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [shownSession, setShownSession] = useState('')
  const [reprintRow, setReprintRow] = useState(null)

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

    setTimeout(() => {
      let data = ALL_DATA[session] || []

      // Filter by date if selected
      if (regDate) {
        // just a placeholder — in real API pass regDate to backend
        // For demo keep all records when date picked
      }

      // Filter by status
      if (status && status !== '0') {
        data = data.filter(r => r.status === status)
      }

      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} records for session ${session}.`)
    }, 650)
  }, [session, regDate, status])

  const handleReset = () => {
    setSession(''); setRegDate(''); setStatus('0')
    setRows([]); setSearch(''); setErrors({})
    setShown(false); setShownSession('')
  }

  // ── Excel export placeholder ──────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Reprint handler ───────────────────────────────────────────────────────
  const handleReprint = useCallback((row) => { setReprintRow(row) }, [])

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.form_no.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.registration_no.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary counts ────────────────────────────────────────────────────────
  const summary = useMemo(() => ({
    total:       filtered.length,
    confirmed:   filtered.filter(r => r.status === 'Registered').length,
    notConfirmed:filtered.filter(r => r.status === 'Admitted').length,
  }), [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = [session, regDate, status !== '0' ? status : ''].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Registered Student Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and manage registered student records by session, date and status.
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
            Excel Download
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

            <Field label="Select Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Registration Date">
              <DateInput
                value={regDate}
                onChange={e => setRegDate(e.target.value)}
                placeholder="dd MMM yyyy"
              />
            </Field>

            <Field label="Select Status">
              <NativeSelect value={status} onChange={e => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Action buttons */}
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
          {session ? `Session: ${session}` : 'Search Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilters}
            </span>
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

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}        setSession={setSession}
        regDate={regDate}        setRegDate={setRegDate}
        status={status}          setStatus={setStatus}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary stat cards */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryCard icon={ClipboardList}  label="Total Records"     value={summary.total}        color="blue"    />
            <SummaryCard icon={CheckCircle2}   label="Confirmed"         value={summary.confirmed}    color="emerald" />
            <SummaryCard icon={Clock}          label="Not Confirmed"     value={summary.notConfirmed} color="amber"   />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Registered Students</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
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
                  placeholder="Search name, form no…"
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
                Click <strong>Reprint</strong> on any row to reprint the student's registration receipt.
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
                      {['S.No.','Form No','Class','Student Name','Status','Registration Date','Registration No','Reprint Receipt'].map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12 last:text-center"
                        >
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
                        onReprint={handleReprint}
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
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to expand details and reprint receipt.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard
                      key={row.id}
                      row={row}
                      idx={i + 1}
                      onReprint={handleReprint}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
                {' '}of{' '}
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
              Select a session and click <strong>Show</strong> to generate the registration report.
            </p>
          </div>
        </div>
      )}

      {/* Reprint Modal */}
      <ReprintModal row={reprintRow} onClose={() => setReprintRow(null)} />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
