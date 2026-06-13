/**
 * SessionMaster.jsx
 * Folder: src/pages/Configuration/SessionMaster.jsx
 *
 * Converts legacy ASPX "Define Session" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Year/Session dropdown to define new session
 *  - Sessions grid with Set Default checkbox
 *  - Active session highlighted with badge
 *  - Toast notifications
 *  - Mobile: card-based layout
 *  - Desktop: ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Settings2, ChevronDown, AlertCircle, X, Check, Loader2,
  CalendarDays, ToggleLeft, ToggleRight, PlusCircle,
  RefreshCw, Star, StarOff, ShieldCheck, Clock,
  LayoutGrid, Info, Pencil, Trash2, BadgeCheck, Circle
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

/** Available years to select for a new session */
const YEAR_OPTIONS = [
  { value: '0',       label: '-- Select Session --' },
  { value: '2021-22', label: '2021-22' },
  { value: '2022-23', label: '2022-23' },
  { value: '2023-24', label: '2023-24' },
  { value: '2024-25', label: '2024-25' },
  { value: '2025-26', label: '2025-26' },
  { value: '2026-27', label: '2026-27' },
  { value: '2027-28', label: '2027-28' },
]

/** Pre-existing sessions in the system (mirrors GridView data) */
const INITIAL_SESSIONS = [
  { id: 1, session: '2022-23', status: 'inactive' },
  { id: 2, session: '2023-24', status: 'inactive' },
  { id: 3, session: '2024-25', status: 'inactive' },
  { id: 4, session: '2025-26', status: 'active'   },
]

// ─── HELPER: STATUS COLORS ────────────────────────────────────────────────────
const statusMeta = (status) =>
  status === 'active'
    ? {
        dot: 'bg-emerald-500',
        badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25',
        label: 'Default',
      }
    : {
        dot: 'bg-slate-300 dark:bg-slate-600',
        badge: 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700',
        label: 'Inactive',
      }

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Native <select> with chevron icon */
function NativeSelect({ value, onChange, children, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-9 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

/** Form field wrapper with label + error */
function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5 font-medium">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

/** Slide-up toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success'
          ? 'bg-emerald-600 text-white shadow-emerald-500/30'
          : 'bg-rose-600 text-white shadow-rose-500/30'}`}
      style={{ animation: 'slideUp .25s cubic-bezier(0.34,1.56,0.64,1)' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
      <style>{`
        @keyframes slideUp {
          from { opacity:0; transform:translateX(-50%) translateY(14px); }
          to   { opacity:1; transform:translateX(-50%) translateY(0); }
        }
      `}</style>
    </div>
  )
}

// ─── STATS STRIP ─────────────────────────────────────────────────────────────

function StatsStrip({ sessions }) {
  const total   = sessions.length
  const active  = sessions.filter(s => s.status === 'active').length
  const inactive = sessions.filter(s => s.status === 'inactive').length

  const items = [
    { icon: LayoutGrid,   label: 'Total Sessions',    value: total,    color: 'blue'   },
    { icon: BadgeCheck,   label: 'Default Session',   value: active,   color: 'emerald'},
    { icon: Clock,        label: 'Inactive Sessions', value: inactive, color: 'amber'  },
  ]

  const colorMap = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }

  return (
    <div className="grid grid-cols-3 gap-3">
      {items.map(({ icon: Icon, label, value, color }) => (
        <div
          key={label}
          className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
            bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm"
        >
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
            <Icon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, sno, onToggleDefault, onDelete, toggleLoading }) {
  const meta = statusMeta(row.status)
  const isDefault = row.status === 'active'
  const isLoading = toggleLoading === row.id

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12 font-medium">
        {sno}
      </td>

      {/* Session */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${meta.dot}`} />
          <div>
            <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{row.session}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Academic Year</p>
          </div>
        </div>
      </td>

      {/* Status badge */}
      <td className="px-4 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${meta.badge}`}>
          {isDefault
            ? <Star className="w-3 h-3 fill-current" />
            : <Circle className="w-3 h-3" />}
          {meta.label}
        </span>
      </td>

      {/* Set Default toggle */}
      <td className="px-4 py-3.5 text-center">
        <button
          type="button"
          onClick={() => onToggleDefault(row.id)}
          disabled={isLoading || isDefault}
          title={isDefault ? 'Already default session' : 'Set as default session'}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all
            ${isDefault
              ? 'bg-emerald-50 text-emerald-600 cursor-default dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/25'
              : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 cursor-pointer border border-transparent hover:border-blue-200 dark:hover:border-blue-500/25'
            } disabled:opacity-60`}
        >
          {isLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : isDefault
              ? <ToggleRight className="w-3.5 h-3.5" />
              : <ToggleLeft className="w-3.5 h-3.5" />}
          {isDefault ? 'Default' : 'Set Default'}
        </button>
      </td>

      {/* Actions */}
      <td className="px-4 py-3.5 text-center">
        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onDelete(row.id)}
            disabled={isDefault}
            title={isDefault ? "Can't delete the active session" : "Delete session"}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400
              hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-500/10 dark:hover:text-rose-400
              transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE SESSION CARD ──────────────────────────────────────────────────────

function MobileSessionCard({ row, sno, onToggleDefault, onDelete, toggleLoading }) {
  const meta = statusMeta(row.status)
  const isDefault = row.status === 'active'
  const isLoading = toggleLoading === row.id

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm transition-all
      ${isDefault
        ? 'border-emerald-200 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-500/5 dark:to-[#1a1f35]'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'
      }`}>

      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Session icon */}
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0
          ${isDefault
            ? 'bg-emerald-100 dark:bg-emerald-500/15'
            : 'bg-slate-100 dark:bg-slate-800'
          }`}>
          <CalendarDays className={`w-5 h-5 ${isDefault ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
        </div>

        {/* Session info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[16px] font-extrabold text-slate-800 dark:text-slate-100">{row.session}</p>
            {isDefault && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
                bg-emerald-100 text-emerald-700 border border-emerald-200
                dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25">
                <Star className="w-2.5 h-2.5 fill-current" /> DEFAULT
              </span>
            )}
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">Academic Year · #{sno}</p>
        </div>

        {/* Status dot */}
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${meta.dot}`} />
      </div>

      {/* Card Footer Actions */}
      <div className={`flex items-center gap-2 px-4 py-3 border-t
        ${isDefault
          ? 'border-emerald-100 dark:border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-500/5'
          : 'border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]'
        }`}>

        {/* Set Default button */}
        <button
          type="button"
          onClick={() => onToggleDefault(row.id)}
          disabled={isLoading || isDefault}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95
            ${isDefault
              ? 'bg-emerald-100 text-emerald-700 cursor-default dark:bg-emerald-500/15 dark:text-emerald-400'
              : 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-md shadow-blue-500/20'
            } disabled:opacity-70`}
        >
          {isLoading
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : isDefault
              ? <><ShieldCheck className="w-4 h-4" /> Current Default</>
              : <><Star className="w-4 h-4" /> Set as Default</>
          }
        </button>

        {/* Delete */}
        <button
          type="button"
          onClick={() => onDelete(row.id)}
          disabled={isDefault}
          title={isDefault ? "Can't delete active session" : 'Delete'}
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500
            dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400
            transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function SessionMaster() {
  const [selectedYear,  setSelectedYear]  = useState('0')
  const [sessions,      setSessions]      = useState(INITIAL_SESSIONS)
  const [submitting,    setSubmitting]    = useState(false)
  const [toggleLoading, setToggleLoading] = useState(null) // row id being toggled
  const [errors,        setErrors]        = useState({})
  const [toast,         setToast]         = useState(null)

  // ── Helpers ──────────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  /** Already-added session years (to prevent duplicates) */
  const addedYears = useMemo(() => new Set(sessions.map(s => s.session)), [sessions])

  // ── Submit: Add new session ───────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    // Validation (mirrors ASPX validate())
    const err = {}
    if (!selectedYear || selectedYear === '0') {
      err.year = 'Please select a session year'
    } else if (addedYears.has(selectedYear)) {
      err.year = `Session "${selectedYear}" already exists`
    }
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setSubmitting(true)

    // Simulate API call (mirrors btnSubmit_Click)
    setTimeout(() => {
      const newSession = {
        id:      Date.now(),
        session: selectedYear,
        status:  'inactive',
      }
      setSessions(prev => [...prev, newSession])
      setSelectedYear('0')
      setSubmitting(false)
      showToast(`Session "${newSession.session}" added successfully.`)
    }, 700)
  }, [selectedYear, addedYears, showToast])

  // ── Toggle Default (mirrors CheckBox1_CheckedChanged) ─────────────────────
  const handleToggleDefault = useCallback((id) => {
    setToggleLoading(id)
    setTimeout(() => {
      setSessions(prev =>
        prev.map(s => ({ ...s, status: s.id === id ? 'active' : 'inactive' }))
      )
      setToggleLoading(null)
      const session = sessions.find(s => s.id === id)
      if (session) showToast(`"${session.session}" set as default session.`)
    }, 600)
  }, [sessions, showToast])

  // ── Delete session ────────────────────────────────────────────────────────
  const handleDelete = useCallback((id) => {
    const session = sessions.find(s => s.id === id)
    if (!session || session.status === 'active') return
    setSessions(prev => prev.filter(s => s.id !== id))
    showToast(`Session "${session.session}" removed.`, 'success')
  }, [sessions, showToast])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedYear('0')
    setErrors({})
  }

  return (
    <div className="space-y-5 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
              <span className="hover:text-blue-500 cursor-pointer transition-colors">Home</span>
              <ChevronDown className="w-3 h-3 -rotate-90 opacity-50" />
              <span className="text-slate-600 dark:text-slate-300 font-medium">Define Session</span>
            </nav>
          </div>
          <h1 className="text-[22px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Settings2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </span>
            Define Session
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 ml-11">
            Manage academic sessions and set the default active session.
          </p>
        </div>
      </div>

      {/* ── Stats Strip ───────────────────────────────────────────────────── */}
      <StatsStrip sessions={sessions} />

      {/* ── Add Session Card ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Add New Session</span>
        </div>

        {/* Card Body */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">

            {/* Session Dropdown */}
            <div className="sm:col-span-1">
              <Field label="Select a New Session" error={errors.year} required>
                <NativeSelect
                  value={selectedYear}
                  onChange={e => {
                    setSelectedYear(e.target.value)
                    setErrors(prev => ({ ...prev, year: undefined }))
                  }}
                  error={errors.year}
                >
                  {YEAR_OPTIONS.map(opt => (
                    <option
                      key={opt.value}
                      value={opt.value}
                      disabled={addedYears.has(opt.value)}
                    >
                      {opt.label}{addedYears.has(opt.value) ? ' (already added)' : ''}
                    </option>
                  ))}
                </NativeSelect>
              </Field>
            </div>

            {/* Preview label (mirrors lblyearto) */}
            <div className="flex items-end pb-0.5">
              {selectedYear && selectedYear !== '0' ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20">
                  <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300">{selectedYear}</span>
                </div>
              ) : (
                <div className="h-9" /> /* spacer */
              )}
            </div>

            {/* Spacer on large screens */}
            <div className="hidden lg:block" />

            {/* Action buttons */}
            <div className="flex gap-2 items-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
              >
                {submitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <PlusCircle className="w-4 h-4" />}
                Submit
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset form"
                className="flex items-center justify-center px-3 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
                  dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Info hint */}
          <div className="flex items-start gap-2 mt-4 px-3 py-2.5 rounded-xl bg-amber-50 border border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/20">
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-700 dark:text-amber-400">
              After adding a session, use the <strong>Set Default</strong> option in the table below to mark it as the active academic session.
            </p>
          </div>
        </div>
      </div>

      {/* ── Sessions List Card ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
          <LayoutGrid className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Session List</span>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* ── DESKTOP TABLE (md and up) ── */}
        <div className="hidden md:block overflow-x-auto">
          {sessions.length === 0 ? (
            <EmptyState />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Session', 'Status', 'Set Default', 'Actions'].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 whitespace-nowrap
                        ${i === 0 ? 'text-center w-12' : i >= 3 ? 'text-center' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sessions.map((row, i) => (
                  <DesktopRow
                    key={row.id}
                    row={row}
                    sno={i + 1}
                    onToggleDefault={handleToggleDefault}
                    onDelete={handleDelete}
                    toggleLoading={toggleLoading}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS (below md) ── */}
        <div className="md:hidden p-4 space-y-3">
          {sessions.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap "Set as Default" to activate a session.
              </p>
              {sessions.map((row, i) => (
                <MobileSessionCard
                  key={row.id}
                  row={row}
                  sno={i + 1}
                  onToggleDefault={handleToggleDefault}
                  onDelete={handleDelete}
                  toggleLoading={toggleLoading}
                />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Total <span className="font-semibold text-slate-600 dark:text-slate-300">{sessions.length}</span> session{sessions.length !== 1 ? 's' : ''} configured
          </p>
          {sessions.some(s => s.status === 'active') && (
            <span className="flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Default: {sessions.find(s => s.status === 'active')?.session}
            </span>
          )}
        </div>
      </div>

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-4 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <CalendarDays className="w-7 h-7 opacity-40" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No sessions configured</p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
          Use the form above to add your first academic session.
        </p>
      </div>
    </div>
  )
}
