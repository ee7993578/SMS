/**
 * StudentWithdrawn.jsx
 * Folder: src/pages/Student/Work/StudentWithdrawn.jsx
 * Dependencies: lucide-react (already in project)
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Search, Filter, RefreshCw, Eye, Save,
  AlertCircle, X, Check, Loader2, ChevronDown,
  UserCheck, UserX, FileText, Calendar,
  SlidersHorizontal, ChevronRight, Info
} from 'lucide-react'

// ─── STATIC DATA (replace with API calls) ────────────────────────────────────
const SESSIONS = ['2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const STATIC_STUDENTS = [
  { id: 1,  adm: '2024/NUR/001', name: 'Aarav Sharma',       class: 'Nursery',   status: 'Registered', reason: '',                    date: '' },
  { id: 2,  adm: '2024/NUR/002', name: 'Ananya Singh',        class: 'Nursery',   status: 'Withdrawn',  reason: 'Shifted to another city', date: '10 Mar 2025' },
  { id: 3,  adm: '2024/LKG/001', name: 'Arjun Verma',         class: 'LKG',       status: 'Registered', reason: '',                    date: '' },
  { id: 4,  adm: '2024/LKG/002', name: 'Diya Gupta',          class: 'LKG',       status: 'Registered', reason: '',                    date: '' },
  { id: 5,  adm: '2024/UKG/001', name: 'Ishaan Tiwari',       class: 'UKG',       status: 'Withdrawn',  reason: 'Family relocation',   date: '15 Jan 2025' },
  { id: 6,  adm: '2024/UKG/002', name: 'Kavya Yadav',         class: 'UKG',       status: 'Registered', reason: '',                    date: '' },
  { id: 7,  adm: '2024/I/001',   name: 'Mohit Rastogi',       class: 'Class I',   status: 'Registered', reason: '',                    date: '' },
  { id: 8,  adm: '2024/I/002',   name: 'Neha Agarwal',        class: 'Class I',   status: 'Registered', reason: '',                    date: '' },
  { id: 9,  adm: '2024/I/003',   name: 'Priya Mishra',        class: 'Class I',   status: 'Withdrawn',  reason: 'TC issued',           date: '05 Feb 2025' },
  { id: 10, adm: '2024/V/001',   name: 'Rahul Joshi',         class: 'Class V',   status: 'Registered', reason: '',                    date: '' },
  { id: 11, adm: '2024/V/002',   name: 'Rohan Dubey',         class: 'Class V',   status: 'Registered', reason: '',                    date: '' },
  { id: 12, adm: '2024/V/003',   name: 'Sneha Pandey',        class: 'Class V',   status: 'Withdrawn',  reason: 'Admission cancelled', date: '20 Apr 2025' },
  { id: 13, adm: '2024/X/001',   name: 'Tanvi Srivastava',    class: 'Class X',   status: 'Registered', reason: '',                    date: '' },
  { id: 14, adm: '2024/X/002',   name: 'Vikas Chauhan',       class: 'Class X',   status: 'Registered', reason: '',                    date: '' },
  { id: 15, adm: '2024/X/003',   name: 'Yash Kumar',          class: 'Class X',   status: 'Withdrawn',  reason: 'Health issues',       date: '01 Mar 2025' },
  { id: 16, adm: '2024/XII/001', name: 'Zara Khan',           class: 'Class XII', status: 'Registered', reason: '',                    date: '' },
  { id: 17, adm: '2024/XII/002', name: 'Aditya Tripathi',     class: 'Class XII', status: 'Registered', reason: '',                    date: '' },
  { id: 18, adm: '2024/XII/003', name: 'Bhavna Singh',        class: 'Class XII', status: 'Withdrawn',  reason: 'Changed school',      date: '12 May 2025' },
]

// ─── AVATAR COLOR ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ['#1d4ed8','#dbeafe'], ['#7c3aed','#ede9fe'], ['#0891b2','#cffafe'],
  ['#059669','#d1fae5'], ['#d97706','#fef3c7'], ['#dc2626','#fee2e2'],
]
const avatarColor = (name) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

// ─── SMALL REUSABLE COMPONENTS ────────────────────────────────────────────────

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
          ${error ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${className}`}
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

function TextInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
        dark:placeholder-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${className}`}
    />
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

// Status badge
function StatusBadge({ status }) {
  const isWithdrawn = status === 'Withdrawn'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0
      ${isWithdrawn
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
      }`}>
      {isWithdrawn
        ? <UserX className="w-3 h-3" />
        : <UserCheck className="w-3 h-3" />}
      {status}
    </span>
  )
}

// Radio toggle — Registered / Withdrawn
function StatusToggle({ value, onChange }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-[12px] font-semibold flex-shrink-0">
      {['Registered', 'Withdrawn'].map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-3 py-1.5 transition-all flex items-center gap-1.5
            ${value === opt
              ? opt === 'Registered'
                ? 'bg-emerald-500 text-white'
                : 'bg-rose-500 text-white'
              : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-[#1e2238] dark:text-slate-400 dark:hover:bg-slate-700/50'
            }`}
        >
          {opt === 'Registered' ? <UserCheck className="w-3 h-3" /> : <UserX className="w-3 h-3" />}
          <span className="hidden sm:inline">{opt}</span>
          <span className="sm:hidden">{opt === 'Registered' ? 'Reg.' : 'W/D'}</span>
        </button>
      ))}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, cls, setCls, regNo, setRegNo, stuName, setStuName, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
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
          <Field label="Registration No.">
            <TextInput value={regNo} onChange={e => setRegNo(e.target.value)} placeholder="e.g. 2024/I/001" />
          </Field>
          <Field label="Student Name">
            <TextInput value={stuName} onChange={e => setStuName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} placeholder="Type student name…" />
          </Field>
        </div>

        {/* CTA */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button"
            onClick={() => { onShow(); onClose() }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Students
          </button>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, onStatusChange, onReasonChange, onDateChange, onSaveRow, saving }) {
  const [fg, bg] = avatarColor(row.name)
  const isWithdrawn = row.status === 'Withdrawn'
  const isDirty = row._dirty

  return (
    <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
      ${isDirty ? 'bg-amber-50/40 dark:bg-amber-500/[0.04]' : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}>

      {/* S.No */}
      <td className="px-4 py-3 text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{row._idx}</td>

      {/* Adm No */}
      <td className="px-4 py-3">
        <span className="text-[12px] font-mono font-semibold text-blue-700 dark:text-blue-400">{row.adm}</span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}>
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{row.name}</span>
        </div>
      </td>

      {/* Status Toggle */}
      <td className="px-4 py-3 w-52">
        <StatusToggle value={row.status} onChange={v => onStatusChange(row.id, v)} />
      </td>

      {/* Reason */}
      <td className="px-4 py-3 w-52">
        <input
          type="text"
          value={row.reason}
          onChange={e => onReasonChange(row.id, e.target.value)}
          disabled={!isWithdrawn}
          placeholder={isWithdrawn ? 'Enter reason…' : '—'}
          className={`w-full px-3 py-1.5 text-[12px] rounded-lg border outline-none transition-all
            ${isWithdrawn
              ? 'border-rose-200 bg-rose-50 text-rose-800 placeholder-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:placeholder-rose-500/60'
              : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-[rgba(99,102,241,0.1)] dark:bg-slate-800/40 dark:text-slate-600'
            }`}
        />
      </td>

      {/* Date */}
      <td className="px-4 py-3 w-44">
        <div className="relative">
          <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          <input
            type="text"
            value={row.date}
            onChange={e => onDateChange(row.id, e.target.value)}
            disabled={!isWithdrawn}
            placeholder={isWithdrawn ? 'dd MMM yyyy' : '—'}
            className={`w-full pl-7 pr-2 py-1.5 text-[12px] rounded-lg border outline-none transition-all
              ${isWithdrawn
                ? 'border-rose-200 bg-rose-50 text-rose-800 placeholder-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
                : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-[rgba(99,102,241,0.1)] dark:bg-slate-800/40 dark:text-slate-600'
              }`}
          />
        </div>
      </td>

      {/* Save per row */}
      <td className="px-4 py-3 w-20">
        <button
          type="button"
          onClick={() => onSaveRow(row.id)}
          disabled={!isDirty || saving === row.id}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all
            ${isDirty && saving !== row.id
              ? 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95 dark:bg-indigo-600 dark:hover:bg-indigo-700'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
            }`}
        >
          {saving === row.id
            ? <Loader2 className="w-3 h-3 animate-spin" />
            : <Save className="w-3 h-3" />}
          Save
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, onStatusChange, onReasonChange, onDateChange, onSaveRow, saving }) {
  const [expanded, setExpanded] = useState(false)
  const [fg, bg] = avatarColor(row.name)
  const isWithdrawn = row.status === 'Withdrawn'
  const isDirty = row._dirty

  return (
    <div className={`rounded-xl border transition-all overflow-hidden
      ${isDirty
        ? 'border-amber-300 dark:border-amber-500/40 shadow-sm'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'
      } bg-white dark:bg-[#1a1f35]`}>

      {/* Card header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
      >
        {/* Avatar */}
        <span className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold"
          style={{ background: bg, color: fg }}>
          {row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
            {isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
            )}
          </div>
          <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400">{row.adm}</p>
        </div>

        {/* Status badge */}
        <StatusBadge status={row.status} />

        {/* Expand chevron */}
        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ml-1 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded edit area */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] pt-3">
          {/* Status Toggle */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5">Status</p>
            <StatusToggle value={row.status} onChange={v => onStatusChange(row.id, v)} />
          </div>

          {/* Reason */}
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isWithdrawn ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
              Withdrawal Reason {!isWithdrawn && <span className="normal-case font-normal">(set status to Withdrawn)</span>}
            </p>
            <input
              type="text"
              value={row.reason}
              onChange={e => onReasonChange(row.id, e.target.value)}
              disabled={!isWithdrawn}
              placeholder={isWithdrawn ? 'Enter reason for withdrawal…' : '—'}
              className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                ${isWithdrawn
                  ? 'border-rose-200 bg-rose-50 text-rose-800 placeholder-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
                  : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-[rgba(99,102,241,0.1)] dark:bg-slate-800/40 dark:text-slate-600'
                }`}
            />
          </div>

          {/* Date */}
          <div>
            <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isWithdrawn ? 'text-rose-500' : 'text-slate-400 dark:text-slate-500'}`}>
              Withdrawal Date
            </p>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={row.date}
                onChange={e => onDateChange(row.id, e.target.value)}
                disabled={!isWithdrawn}
                placeholder={isWithdrawn ? 'dd MMM yyyy' : '—'}
                className={`w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  ${isWithdrawn
                    ? 'border-rose-200 bg-rose-50 text-rose-800 placeholder-rose-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200'
                    : 'border-slate-100 bg-slate-50 text-slate-400 cursor-not-allowed dark:border-[rgba(99,102,241,0.1)] dark:bg-slate-800/40 dark:text-slate-600'
                  }`}
              />
            </div>
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={() => onSaveRow(row.id)}
            disabled={!isDirty || saving === row.id}
            className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95
              ${isDirty && saving !== row.id
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
              }`}
          >
            {saving === row.id
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Save This Record</>
            }
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function StudentWithdrawn() {
  // Filter state
  const [session,  setSession]  = useState('')
  const [cls,      setCls]      = useState('')
  const [regNo,    setRegNo]    = useState('')
  const [stuName,  setStuName]  = useState('')

  // Data state
  const [rows,     setRows]     = useState([])
  const [loading,  setLoading]  = useState(false)
  const [savingId, setSavingId] = useState(null)   // which row is saving
  const [savingAll,setSavingAll]= useState(false)

  // UI state
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [statusTab,  setStatusTab]  = useState('All')  // All | Registered | Withdrawn
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch ────────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setStatusTab('All')

    setTimeout(() => {
      // Filter static data by class / regNo / name
      let result = [...STATIC_STUDENTS]
      if (cls)     result = result.filter(r => r.class === cls)
      if (regNo)   result = result.filter(r => r.adm.toLowerCase().includes(regNo.toLowerCase()))
      if (stuName) result = result.filter(r => r.name.toLowerCase().includes(stuName.toLowerCase()))

      setRows(result.map((r, i) => ({ ...r, _idx: i + 1, _dirty: false })))
      setLoading(false)
    }, 650)
  }, [session, cls, regNo, stuName])

  const handleReset = () => {
    setSession(''); setCls(''); setRegNo(''); setStuName('')
    setRows([]); setSearch(''); setStatusTab('All'); setErrors({})
  }

  // ── Row mutations ─────────────────────────────────────────────────────────
  const updateRow = (id, patch) =>
    setRows(p => p.map(r => r.id === id ? { ...r, ...patch, _dirty: true } : r))

  const onStatusChange = useCallback((id, v) => {
    setRows(p => p.map(r => r.id === id
      ? { ...r, status: v, reason: v === 'Registered' ? '' : r.reason, date: v === 'Registered' ? '' : r.date, _dirty: true }
      : r
    ))
  }, [])

  const onReasonChange = useCallback((id, v) => updateRow(id, { reason: v }), [])
  const onDateChange   = useCallback((id, v) => updateRow(id, { date: v }),   [])

  // ── Save single row ───────────────────────────────────────────────────────
  const onSaveRow = useCallback((id) => {
    const row = rows.find(r => r.id === id)
    if (!row) return
    if (row.status === 'Withdrawn' && !row.reason.trim()) {
      showToast('Enter a reason for withdrawal.', 'error'); return
    }
    setSavingId(id)
    setTimeout(() => {
      setRows(p => p.map(r => r.id === id ? { ...r, _dirty: false } : r))
      setSavingId(null)
      showToast(`${row.name} updated successfully.`)
    }, 700)
  }, [rows])

  // ── Save all dirty ────────────────────────────────────────────────────────
  const handleSaveAll = () => {
    const dirtyRows = rows.filter(r => r._dirty)
    if (dirtyRows.length === 0) { showToast('No changes to save.', 'error'); return }

    const invalid = dirtyRows.filter(r => r.status === 'Withdrawn' && !r.reason.trim())
    if (invalid.length > 0) {
      showToast(`Missing reason for: ${invalid.map(r => r.name).join(', ')}`, 'error'); return
    }
    setSavingAll(true)
    setTimeout(() => {
      setRows(p => p.map(r => ({ ...r, _dirty: false })))
      setSavingAll(false)
      showToast(`${dirtyRows.length} record${dirtyRows.length > 1 ? 's' : ''} saved successfully.`)
    }, 900)
  }

  // ── Filtered + search + tab ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = rows
    if (search) r = r.filter(x =>
      x.name.toLowerCase().includes(search.toLowerCase()) ||
      x.adm.toLowerCase().includes(search.toLowerCase())
    )
    if (statusTab !== 'All') r = r.filter(x => x.status === statusTab)
    return r
  }, [rows, search, statusTab])

  const counts = useMemo(() => ({
    all:        rows.length,
    registered: rows.filter(r => r.status === 'Registered').length,
    withdrawn:  rows.filter(r => r.status === 'Withdrawn').length,
    dirty:      rows.filter(r => r._dirty).length,
  }), [rows])

  const hasResults = rows.length > 0

  // ── Tab pill ──────────────────────────────────────────────────────────────
  const TabPill = ({ label, value, count, color }) => (
    <button
      type="button"
      onClick={() => setStatusTab(value)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all
        ${statusTab === value
          ? color === 'emerald'
            ? 'bg-emerald-500 text-white shadow-sm'
            : color === 'rose'
              ? 'bg-rose-500 text-white shadow-sm'
              : 'bg-blue-500 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
        }`}
    >
      {label}
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
        ${statusTab === value ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
        {count}
      </span>
    </button>
  )

  return (
    <div className="space-y-4 pb-8 page-animate">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">
            Student Withdrawn
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Search students → toggle status → enter reason &amp; date → save.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session} onChange={e => { setSession(e.target.value); setErrors(p => ({...p, session: undefined})) }} placeholder="-- Select --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Class">
              <NativeSelect value={cls} onChange={e => setCls(e.target.value)} placeholder="-- All Classes --">
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Registration No.">
              <TextInput value={regNo} onChange={e => setRegNo(e.target.value)} placeholder="e.g. 2024/I/001" />
            </Field>
            <Field label="Student Name">
              <TextInput value={stuName} onChange={e => setStuName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} placeholder="Type name…" />
            </Field>
            <div className="flex flex-col sm:flex-row gap-2 items-end col-span-2 lg:col-span-1">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95 disabled:opacity-70
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold transition-colors
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" /> Filters
          {(session || cls || regNo || stuName) && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {[session,cls,regNo,stuName].filter(Boolean).length}
            </span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        regNo={regNo} setRegNo={setRegNo}
        stuName={stuName} setStuName={setStuName}
        onShow={handleShow} loading={loading}
        errors={errors}
      />

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Results header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Results</span>
              {cls && <span className="text-[13px] text-slate-400 dark:text-slate-500">· {cls}</span>}
              {session && <span className="text-[13px] text-slate-400 dark:text-slate-500">· {session}</span>}
              {counts.dirty > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 flex-shrink-0">
                  {counts.dirty} unsaved
                </span>
              )}
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

          {/* Status Tabs */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] bg-slate-50/30 dark:bg-white/[0.01] overflow-x-auto">
            <TabPill label="All"        value="All"        count={counts.all}        color="blue" />
            <TabPill label="Registered" value="Registered" count={counts.registered} color="emerald" />
            <TabPill label="Withdrawn"  value="Withdrawn"  count={counts.withdrawn}  color="rose" />
          </div>

          {/* Hint */}
          <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/30 dark:bg-blue-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              Toggle status → fill reason &amp; date (for Withdrawn) → click <strong>Save</strong> per row or <strong>Save All</strong> below.
            </p>
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <Search className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No students match your filter.</span>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No', 'Adm No.', 'Student Name', 'Status', 'Reason', 'Date', 'Action'].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => (
                    <DesktopRow
                      key={row.id}
                      row={row}
                      onStatusChange={onStatusChange}
                      onReasonChange={onReasonChange}
                      onDateChange={onDateChange}
                      onSaveRow={onSaveRow}
                      saving={savingId}
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
                <span className="text-[13px]">No students match your filter.</span>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap a card to expand and edit status.
                </p>
                {filtered.map(row => (
                  <MobileCard
                    key={row.id}
                    row={row}
                    onStatusChange={onStatusChange}
                    onReasonChange={onReasonChange}
                    onDateChange={onDateChange}
                    onSaveRow={onSaveRow}
                    saving={savingId}
                  />
                ))}
              </>
            )}
          </div>

          {/* Footer — Save All */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
              <span className="text-[12px] text-slate-400 dark:text-slate-500">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{counts.registered}</span> Registered ·{' '}
                <span className="font-semibold text-rose-600 dark:text-rose-400">{counts.withdrawn}</span> Withdrawn
              </span>
              {counts.dirty > 0 && (
                <span className="text-[12px] font-semibold text-amber-600 dark:text-amber-400">
                  · {counts.dirty} unsaved change{counts.dirty > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={savingAll || counts.dirty === 0}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20`}
            >
              {savingAll
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> Save All Changes</>
              }
            </button>
          </div>
        </div>
      )}

      {/* Empty state — shown before first search */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <UserX className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No results yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session and click <strong>Show Students</strong> to load records.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
