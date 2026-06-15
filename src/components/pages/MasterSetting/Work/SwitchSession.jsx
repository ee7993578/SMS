/**
 * SwitchSession.jsx
 * Folder: src/pages/Admin/SwitchSession.jsx
 *
 * Converts legacy ASPX "Switch Session" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - From Session / To Session dropdowns
 *  - Go button triggers action cards panel
 *  - 20+ define action buttons organized in themed groups
 *  - Confirmation modal (Yes/No)
 *  - Result modal (Ok/Cancel)
 *  - Success toast
 *  - Mobile: drawer-based filter, card-grid action layout
 *  - Desktop: compact ERP-style action grid
 */

import { useState, useCallback } from 'react'
import {
  ArrowRightLeft, ChevronDown, AlertCircle, X, Check,
  Loader2, RefreshCw, SlidersHorizontal,
  Users, BookOpen, FlaskConical, Scale, BarChart2,
  FileText, Tag, Layers, TrendingUp, UserCheck,
  BookMarked, Clock, Percent, DollarSign, CreditCard,
  CalendarClock, Truck, Timer, Banknote, Wrench,
  GitMerge, ChevronRight, Info, Zap
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = [
  '2020-21', '2021-22', '2022-23', '2023-24', '2024-25', '2025-26',
]

// Action buttons — grouped by domain
const ACTION_GROUPS = [
  {
    label: 'Academics',
    color: 'blue',
    actions: [
      { id: 'faculty',          label: 'Define Session Faculty',        icon: Users },
      { id: 'classsub',         label: 'Define Class Subject',          icon: BookOpen },
      { id: 'prac',             label: 'Define Practical Subject',      icon: FlaskConical },
      { id: 'subsubject',       label: 'Define Sub Subject',            icon: BookMarked },
      { id: 'facultysubmap',    label: 'Define Faculty Subject Mapping',icon: GitMerge },
      { id: 'clsteacher',       label: 'Define Class Teacher',          icon: UserCheck },
      { id: 'timetable',        label: 'Define Time Table',             icon: Clock },
    ],
  },
  {
    label: 'Examination',
    color: 'violet',
    actions: [
      { id: 'weightage',        label: 'Define Weightage',              icon: Scale },
      { id: 'maxmin',           label: 'Define Max Min',                icon: BarChart2 },
      { id: 'maxminprimary',    label: 'Define Max Min Primary',        icon: TrendingUp },
      { id: 'header',           label: 'Define Header',                 icon: FileText },
      { id: 'indicator',        label: 'Define Indicator',              icon: Zap },
      { id: 'category',         label: 'Define Category',               icon: Tag },
      { id: 'attribute',        label: 'Define Attribute',              icon: Layers },
    ],
  },
  {
    label: 'Fee Management',
    color: 'emerald',
    actions: [
      { id: 'feehead',          label: 'Define Fee Head',               icon: DollarSign },
      { id: 'feecharge',        label: 'Define Fee Charge',             icon: CreditCard },
      { id: 'installment',      label: 'Define Installment',            icon: CalendarClock },
      { id: 'latefee',          label: 'Define Late Fee',               icon: Timer },
      { id: 'miscell',          label: 'Define Miscellaneous Head',     icon: Banknote },
      { id: 'concess',          label: 'Define Concession Group',       icon: Percent },
      { id: 'concessval',       label: 'Define Concession Group Value', icon: Wrench },
    ],
  },
  {
    label: 'Transport',
    color: 'amber',
    actions: [
      { id: 'transport',        label: 'Define Transport',              icon: Truck },
      { id: 'transportcharges', label: 'Define Transport Charges',      icon: CreditCard },
      { id: 'transportinst',    label: 'Define Transport Installment',  icon: CalendarClock },
    ],
  },
]

// Color map for group badges & buttons
const GROUP_COLORS = {
  blue: {
    badge:  'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    bar:    'bg-blue-500',
    btn:    'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/20',
    btnActive: 'bg-blue-600 text-white border-blue-700 shadow-md shadow-blue-500/20',
  },
  violet: {
    badge:  'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
    bar:    'bg-violet-500',
    btn:    'bg-violet-50 hover:bg-violet-100 text-violet-700 border-violet-100 dark:bg-violet-500/10 dark:hover:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/20',
    btnActive: 'bg-violet-600 text-white border-violet-700 shadow-md shadow-violet-500/20',
  },
  emerald: {
    badge:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    bar:    'bg-emerald-500',
    btn:    'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/20',
    btnActive: 'bg-emerald-600 text-white border-emerald-700 shadow-md shadow-emerald-500/20',
  },
  amber: {
    badge:  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    bar:    'bg-amber-500',
    btn:    'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:hover:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/20',
    btnActive: 'bg-amber-600 text-white border-amber-700 shadow-md shadow-amber-500/20',
  },
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
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
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'toastUp .25s ease' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  )
}

// ─── CONFIRMATION MODAL ───────────────────────────────────────────────────────
function ConfirmModal({ open, title, message, onYes, onNo, yesLabel = 'Yes', noLabel = 'No', loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn .2s ease' }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}} @keyframes slideIn{from{opacity:0;transform:scale(.95) translateY(8px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onNo} />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-hidden"
        style={{ animation: 'slideIn .25s ease' }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </span>
          <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          <button onClick={onNo} className="ml-auto p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2.5 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <button
            onClick={onNo}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            {noLabel}
          </button>
          <button
            onClick={onYes}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-70"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {yesLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── RESULT MODAL (Ok / Cancel) ───────────────────────────────────────────────
function ResultModal({ open, message, onOk, onCancel }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn .2s ease' }}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative z-10 w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-hidden"
        style={{ animation: 'slideIn .25s ease' }}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </span>
          <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Confirmation Message</h3>
          <button onClick={onCancel} className="ml-auto p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4">
          <p className="text-[13px] text-slate-600 dark:text-slate-400 leading-relaxed">{message}</p>
        </div>
        <div className="flex gap-2.5 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onOk}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all"
          >
            Ok
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, fromSession, setFromSession, toSession, setToSession, errors, onGo, loading }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Sessions</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="From Session" error={errors.from} required>
            <NativeSelect value={fromSession} onChange={e => setFromSession(e.target.value)} placeholder="-- Select From Session --" error={errors.from}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="To Session" error={errors.to} required>
            <NativeSelect value={toSession} onChange={e => setToSession(e.target.value)} placeholder="-- Select To Session --" error={errors.to}>
              {SESSIONS.filter(s => s !== fromSession).map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onGo(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
            Go
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SESSION BADGE ────────────────────────────────────────────────────────────
function SessionBadge({ label, session }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</span>
      <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{session}</span>
    </div>
  )
}

// ─── ACTION BUTTON ────────────────────────────────────────────────────────────
function ActionButton({ action, color, onClick, active }) {
  const c = GROUP_COLORS[color]
  const Icon = action.icon
  return (
    <button
      type="button"
      onClick={() => onClick(action)}
      className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-xl border text-left transition-all duration-150 active:scale-[0.98]
        ${active ? c.btnActive : c.btn}`}
    >
      <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-white/20' : 'bg-white dark:bg-white/10'}`}>
        <Icon className="w-4 h-4" />
      </span>
      <span className="text-[12px] font-semibold leading-snug flex-1">{action.label}</span>
      <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 opacity-50 ${active ? 'opacity-80' : ''}`} />
    </button>
  )
}

// ─── ACTION GROUP CARD ────────────────────────────────────────────────────────
function ActionGroupCard({ group, onAction, activeAction }) {
  const c = GROUP_COLORS[group.color]
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Group Header */}
      <div className={`flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/60 dark:bg-white/[0.02]`}>
        <span className={`w-1 h-5 rounded-full ${c.bar} flex-shrink-0`} />
        <span className={`text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${c.badge}`}>
          {group.label}
        </span>
        <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-600">{group.actions.length} actions</span>
      </div>
      {/* Actions Grid */}
      <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {group.actions.map(action => (
          <ActionButton
            key={action.id}
            action={action}
            color={group.color}
            onClick={onAction}
            active={activeAction?.id === action.id}
          />
        ))}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SwitchSession() {
  const [fromSession,  setFromSession]  = useState('')
  const [toSession,    setToSession]    = useState('')
  const [errors,       setErrors]       = useState({})
  const [loading,      setLoading]      = useState(false)
  const [actionsVisible, setActionsVisible] = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState({ open: false, action: null, message: '' })
  const [confirmLoading, setConfirmLoading] = useState(false)

  // Result modal state
  const [resultModal,  setResultModal]  = useState({ open: false, message: '' })

  const [activeAction, setActiveAction] = useState(null)
  const [toast,        setToast]        = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & Go ─────────────────────────────────────────────────────────
  const handleGo = useCallback(() => {
    const err = {}
    if (!fromSession) err.from = 'Please select From Session'
    if (!toSession)   err.to   = 'Please select To Session'
    if (fromSession && toSession && fromSession === toSession) err.to = 'Sessions must be different'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setActionsVisible(true)
      showToast(`Session switched: ${fromSession} → ${toSession}`)
    }, 700)
  }, [fromSession, toSession])

  const handleReset = () => {
    setFromSession(''); setToSession('')
    setErrors({}); setActionsVisible(false); setActiveAction(null)
  }

  // ── Action click → show confirm modal ────────────────────────────────────
  const handleAction = useCallback((action) => {
    setActiveAction(action)
    setConfirmModal({
      open: true,
      action,
      message: `Are you sure you want to copy "${action.label}" data from session "${fromSession}" to session "${toSession}"?`,
    })
  }, [fromSession, toSession])

  // ── Confirm Yes ───────────────────────────────────────────────────────────
  const handleConfirmYes = () => {
    setConfirmLoading(true)
    setTimeout(() => {
      setConfirmLoading(false)
      setConfirmModal({ open: false, action: null, message: '' })
      // Show result modal
      setResultModal({
        open: true,
        message: `"${activeAction?.label}" data has been successfully copied from ${fromSession} to ${toSession}. Please verify the data in the target session.`,
      })
    }, 900)
  }

  const handleConfirmNo = () => {
    setConfirmModal({ open: false, action: null, message: '' })
    setActiveAction(null)
  }

  // ── Result Ok ─────────────────────────────────────────────────────────────
  const handleResultOk = () => {
    setResultModal({ open: false, message: '' })
    showToast(`${activeAction?.label} — Data saved successfully!`)
    setActiveAction(null)
  }

  const handleResultCancel = () => {
    setResultModal({ open: false, message: '' })
    setActiveAction(null)
  }

  const hasFilters = fromSession || toSession

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Switch Session
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Copy session configuration from one academic year to another.
          </p>
        </div>
        {actionsVisible && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
              bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <ArrowRightLeft className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Session Configuration</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="From Session" error={errors.from} required>
              <NativeSelect
                value={fromSession}
                onChange={e => { setFromSession(e.target.value); setErrors(p => ({ ...p, from: undefined })) }}
                placeholder="-- Select From Session --"
                error={errors.from}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="To Session" error={errors.to} required>
              <NativeSelect
                value={toSession}
                onChange={e => { setToSession(e.target.value); setErrors(p => ({ ...p, to: undefined })) }}
                placeholder="-- Select To Session --"
                error={errors.to}
              >
                {SESSIONS.filter(s => s !== fromSession).map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* spacer */}
            <div />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleGo}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRightLeft className="w-4 h-4" />}
                Go
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2.5 rounded-xl text-[13px] font-semibold
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
          {hasFilters
            ? <span className="truncate max-w-[180px]">{fromSession || '?'} → {toSession || '?'}</span>
            : 'Select Sessions'
          }
        </button>
        {hasFilters && (
          <button
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        fromSession={fromSession}
        setFromSession={setFromSession}
        toSession={toSession}
        setToSession={setToSession}
        errors={errors}
        onGo={handleGo}
        loading={loading}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-5 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.18 }} />
          ))}
        </div>
      )}

      {/* ── Actions Panel ────────────────────────────────────────────────── */}
      {actionsVisible && !loading && (
        <>
          {/* Session route banner */}
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-3.5 shadow-sm">
            <SessionBadge label="From" session={fromSession} />
            <div className="flex items-center gap-1.5 text-slate-400">
              <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700 w-6 hidden sm:block" />
              <ArrowRightLeft className="w-4 h-4 text-blue-500 dark:text-indigo-400" />
              <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700 w-6 hidden sm:block" />
            </div>
            <SessionBadge label="To" session={toSession} />
            <span className="ml-auto text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Ready to copy
            </span>
          </div>

          {/* Info hint */}
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/[0.07] border border-amber-100 dark:border-amber-500/20">
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-amber-700 dark:text-amber-400 leading-relaxed">
              Click any action below to copy that configuration from <strong>{fromSession}</strong> to <strong>{toSession}</strong>. Each action requires separate confirmation.
            </p>
          </div>

          {/* Action groups */}
          <div className="space-y-4">
            {ACTION_GROUPS.map(group => (
              <ActionGroupCard
                key={group.label}
                group={group}
                onAction={handleAction}
                activeAction={activeAction}
              />
            ))}
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!actionsVisible && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ArrowRightLeft className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No session selected</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Choose <strong>From Session</strong> and <strong>To Session</strong>, then click <strong>Go</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── Confirm Modal ─────────────────────────────────────────────────── */}
      <ConfirmModal
        open={confirmModal.open}
        title="Confirm Action"
        message={confirmModal.message}
        yesLabel="Yes, Copy"
        noLabel="No, Cancel"
        onYes={handleConfirmYes}
        onNo={handleConfirmNo}
        loading={confirmLoading}
      />

      {/* ── Result Modal ──────────────────────────────────────────────────── */}
      <ResultModal
        open={resultModal.open}
        message={resultModal.message}
        onOk={handleResultOk}
        onCancel={handleResultCancel}
      />

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
