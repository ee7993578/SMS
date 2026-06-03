/**
 * FeeHeadMaster.jsx
 * Folder: src/pages/Fee/FeeHeadMaster.jsx
 *
 * Converts legacy ASPX "Fee Head Master" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session + Fee Head + Fee Code + Fee Type + Order + Status + Optional
 *  - Add / Edit / Update flow
 *  - Desktop: dense ERP table with inline action
 *  - Mobile: collapsible cards, bottom-sheet form, touch-friendly
 *  - Search / filter on the grid
 *  - Toast notifications
 *  - Loading / empty states
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  ChevronDown, AlertCircle, X, Check, Loader2,
  Plus, Edit2, Save, RefreshCw, Search, Filter,
  SlidersHorizontal, Info, ChevronRight,
  DollarSign, Hash, Tag, ArrowUpDown,
  ShieldCheck, BookOpen, LayoutList,
  ToggleLeft, ToggleRight, FileText,
  CheckCircle2, XCircle, Eye, EyeOff,
  Layers, CreditCard, Receipt, Banknote,
  BadgeIndianRupee
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const FEE_TYPES = [
  { id: 1, label: 'Tuition Fee' },
  { id: 2, label: 'Transport Fee' },
  { id: 3, label: 'Library Fee' },
  { id: 4, label: 'Lab Fee' },
  { id: 5, label: 'Sports Fee' },
  { id: 6, label: 'Exam Fee' },
  { id: 7, label: 'Miscellaneous' },
]

const INITIAL_RECORDS = [
  { id: 1, session: '2024-25', fee_head: 'Tuition Fee',    fee_code: 'TF001', fee_type_id: 1, fee_type: 'Tuition Fee',     order: 1, is_optional: false, status: 1,  status_label: 'Active'   },
  { id: 2, session: '2024-25', fee_head: 'Transport Fee',  fee_code: 'TR002', fee_type_id: 2, fee_type: 'Transport Fee',    order: 2, is_optional: true,  status: 1,  status_label: 'Active'   },
  { id: 3, session: '2024-25', fee_head: 'Library Fee',    fee_code: 'LF003', fee_type_id: 3, fee_type: 'Library Fee',      order: 3, is_optional: true,  status: 1,  status_label: 'Active'   },
  { id: 4, session: '2024-25', fee_head: 'Lab Fee',        fee_code: 'LB004', fee_type_id: 4, fee_type: 'Lab Fee',          order: 4, is_optional: true,  status: 2,  status_label: 'In-Active'},
  { id: 5, session: '2024-25', fee_head: 'Sports Fee',     fee_code: 'SF005', fee_type_id: 5, fee_type: 'Sports Fee',       order: 5, is_optional: true,  status: 1,  status_label: 'Active'   },
  { id: 6, session: '2024-25', fee_head: 'Exam Fee',       fee_code: 'EF006', fee_type_id: 6, fee_type: 'Exam Fee',         order: 6, is_optional: false, status: 1,  status_label: 'Active'   },
  { id: 7, session: '2023-24', fee_head: 'Tuition Fee',    fee_code: 'TF001', fee_type_id: 1, fee_type: 'Tuition Fee',      order: 1, is_optional: false, status: 1,  status_label: 'Active'   },
  { id: 8, session: '2023-24', fee_head: 'Miscellaneous',  fee_code: 'MC007', fee_type_id: 7, fee_type: 'Miscellaneous',    order: 7, is_optional: true,  status: 2,  status_label: 'In-Active'},
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const EMPTY_FORM = {
  session: '', fee_head: '', fee_code: '',
  fee_type_id: '', order: '', status: '1', is_optional: false,
}

const FEE_TYPE_COLORS = {
  1: { bg: 'bg-blue-50 dark:bg-blue-500/10',    text: 'text-blue-700 dark:text-blue-400',    dot: 'bg-blue-500'    },
  2: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  3: { bg: 'bg-amber-50 dark:bg-amber-500/10',  text: 'text-amber-700 dark:text-amber-400',  dot: 'bg-amber-500'   },
  4: { bg: 'bg-violet-50 dark:bg-violet-500/10',text: 'text-violet-700 dark:text-violet-400',dot: 'bg-violet-500'  },
  5: { bg: 'bg-cyan-50 dark:bg-cyan-500/10',    text: 'text-cyan-700 dark:text-cyan-400',    dot: 'bg-cyan-500'    },
  6: { bg: 'bg-rose-50 dark:bg-rose-500/10',    text: 'text-rose-700 dark:text-rose-400',    dot: 'bg-rose-500'    },
  7: { bg: 'bg-slate-100 dark:bg-slate-700/40', text: 'text-slate-700 dark:text-slate-300',  dot: 'bg-slate-500'   },
}

const getTypeColor = (id) => FEE_TYPE_COLORS[id] || FEE_TYPE_COLORS[7]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
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
          } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function TextInput({ value, onChange, placeholder, error, disabled, type = 'text', className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        } ${className}`}
    />
  )
}

function Field({ label, error, required, children, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
        {label}{required && <span className="text-rose-500">*</span>}
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

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isActive = status === 1
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold
      ${isActive
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
        : 'bg-slate-100 text-slate-500 dark:bg-slate-700/60 dark:text-slate-400'
      }`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {isActive ? 'Active' : 'In-Active'}
    </span>
  )
}

// ─── OPTIONAL BADGE ───────────────────────────────────────────────────────────
function OptionalBadge({ value }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold
      ${value
        ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400'
        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
      }`}>
      {value ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {value ? 'Optional' : 'Mandatory'}
    </span>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── FORM PANEL ───────────────────────────────────────────────────────────────
function FeeHeadForm({ form, setForm, errors, loading, editId, onSubmit, onCancel, isSheet }) {
  const handleChange = (key, val) => setForm(p => ({ ...p, [key]: val }))

  const containerClass = isSheet
    ? 'px-5 py-4 space-y-4'
    : 'p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'

  return (
    <div className={containerClass}>
      {/* Session */}
      <Field label="Session" error={errors.session} required icon={BookOpen}>
        <NativeSelect
          value={form.session}
          onChange={e => handleChange('session', e.target.value)}
          placeholder="-- Select Session --"
          error={errors.session}
        >
          {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </NativeSelect>
      </Field>

      {/* Fee Head */}
      <Field label="Fee Head" error={errors.fee_head} required icon={FileText}>
        <TextInput
          value={form.fee_head}
          onChange={e => handleChange('fee_head', e.target.value)}
          placeholder="e.g. Tuition Fee"
          error={errors.fee_head}
        />
      </Field>

      {/* Fee Code */}
      <Field label="Fee Code" error={errors.fee_code} required icon={Hash}>
        <TextInput
          value={form.fee_code}
          onChange={e => handleChange('fee_code', e.target.value.toUpperCase())}
          placeholder="e.g. TF001"
          error={errors.fee_code}
        />
      </Field>

      {/* Fee Type */}
      <Field label="Fee Type" error={errors.fee_type_id} required icon={Tag}>
        <NativeSelect
          value={form.fee_type_id}
          onChange={e => handleChange('fee_type_id', e.target.value)}
          placeholder="-- Select Fee Type --"
          error={errors.fee_type_id}
        >
          {FEE_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
        </NativeSelect>
      </Field>

      {/* Order */}
      <Field label="Order" error={errors.order} required icon={ArrowUpDown}>
        <TextInput
          value={form.order}
          onChange={e => {
            const v = e.target.value.replace(/\D/g, '')
            handleChange('order', v)
          }}
          placeholder="e.g. 1"
          error={errors.order}
          type="text"
        />
      </Field>

      {/* Status */}
      <Field label="Status" error={errors.status} required icon={ShieldCheck}>
        <NativeSelect
          value={form.status}
          onChange={e => handleChange('status', e.target.value)}
          error={errors.status}
        >
          <option value="1">Active</option>
          <option value="2">In-Active</option>
        </NativeSelect>
      </Field>

      {/* Is Optional — spans full in sheet, else auto */}
      <div className={`flex items-center gap-3 ${isSheet ? '' : 'sm:col-span-1'}`}>
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
            <ToggleLeft className="w-3 h-3" />
            Is Optional
          </label>
          <button
            type="button"
            onClick={() => handleChange('is_optional', !form.is_optional)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-[13px] font-semibold transition-all
              ${form.is_optional
                ? 'bg-violet-50 border-violet-200 text-violet-700 dark:bg-violet-500/10 dark:border-violet-500/30 dark:text-violet-400'
                : 'bg-white border-slate-200 text-slate-600 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.25)] dark:text-slate-400'
              }`}
          >
            {form.is_optional
              ? <ToggleRight className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              : <ToggleLeft className="w-5 h-5 text-slate-400" />
            }
            {form.is_optional ? 'Yes — Optional' : 'No — Mandatory'}
          </button>
        </div>
      </div>

      {/* Action buttons — span full width in grid */}
      {!isSheet && (
        <div className={`flex items-end gap-2 sm:col-span-2 lg:col-span-3 xl:col-span-4`}>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
              dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editId ? 'Update Record' : 'Add Fee Head'}
          </button>
          {editId && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel Edit
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE BOTTOM SHEET ──────────────────────────────────────────────────────
function BottomSheet({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white dark:bg-[#1a1f35]
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[92vh] flex flex-col"
        style={{ animation: 'drawerUp .3s cubic-bezier(.16,1,.3,1)' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{title}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ rec, idx, onEdit }) {
  const tc = getTypeColor(rec.fee_type_id)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-blue-50/30 dark:hover:bg-white/[0.015] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Fee Head */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10">
            <BadgeIndianRupee className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{rec.fee_head}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{rec.session}</p>
          </div>
        </div>
      </td>

      {/* Fee Code */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tracking-wide font-mono">
          {rec.fee_code}
        </span>
      </td>

      {/* Fee Type */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${tc.bg} ${tc.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
          {rec.fee_type}
        </span>
      </td>

      {/* Order */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 tabular-nums">
          {rec.order}
        </span>
      </td>

      {/* Optional */}
      <td className="px-4 py-3 text-center">
        <OptionalBadge value={rec.is_optional} />
      </td>

      {/* Status */}
      <td className="px-4 py-3 text-center">
        <StatusBadge status={rec.status} />
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onEdit(rec)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100
            dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            border border-blue-100 dark:border-blue-500/20
            transition-all active:scale-95"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE RECORD CARD ───────────────────────────────────────────────────────
function MobileCard({ rec, idx, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const tc = getTypeColor(rec.fee_type_id)

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Always-visible header row */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Icon */}
        <span className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10">
          <BadgeIndianRupee className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {rec.fee_head}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">{rec.fee_code}</span>
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9.5px] font-semibold ${tc.bg} ${tc.text}`}>
              {rec.fee_type}
            </span>
          </div>
        </div>

        {/* Right: status + chevron */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge status={rec.status} />
          <span className="text-[10px] text-slate-400">Order: {rec.order}</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Session</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{rec.session}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Fee Code</p>
              <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 font-mono">{rec.fee_code}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Type</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${tc.bg} ${tc.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tc.dot}`} />
                {rec.fee_type}
              </span>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase text-slate-400 mb-1">Optional</p>
              <OptionalBadge value={rec.is_optional} />
            </div>
          </div>

          {/* Edit button */}
          <button
            type="button"
            onClick={() => onEdit(rec)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-[0.98] shadow-md shadow-blue-500/20"
          >
            <Edit2 className="w-4 h-4" /> Edit This Record
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FeeHeadMaster() {
  const [records, setRecords]       = useState(INITIAL_RECORDS)
  const [form,    setForm]          = useState(EMPTY_FORM)
  const [errors,  setErrors]        = useState({})
  const [loading, setLoading]       = useState(false)
  const [editId,  setEditId]        = useState(null)
  const [search,  setSearch]        = useState('')
  const [filterSession, setFilterSession] = useState('')
  const [filterStatus,  setFilterStatus]  = useState('')
  const [toast,   setToast]         = useState(null)
  const [sheetOpen, setSheetOpen]   = useState(false)   // mobile form sheet
  const [mobileFilter, setMobileFilter] = useState(false) // mobile filter sheet
  const [activeTab, setActiveTab]   = useState('list')  // mobile tabs: 'form' | 'list'
  const nextId = useRef(INITIAL_RECORDS.length + 1)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!form.session)     err.session     = 'Select a session'
    if (!form.fee_head.trim())  err.fee_head  = 'Fee Head is required'
    if (!form.fee_code.trim())  err.fee_code  = 'Fee Code is required'
    if (!form.fee_type_id) err.fee_type_id = 'Select fee type'
    if (!form.order)       err.order       = 'Order is required'
    if (!form.status)      err.status      = 'Select status'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!validate()) return
    setLoading(true)

    setTimeout(() => {
      const feeTypeObj = FEE_TYPES.find(t => String(t.id) === String(form.fee_type_id))
      if (editId) {
        setRecords(prev => prev.map(r =>
          r.id === editId
            ? {
                ...r,
                session:     form.session,
                fee_head:    form.fee_head.trim(),
                fee_code:    form.fee_code.trim(),
                fee_type_id: Number(form.fee_type_id),
                fee_type:    feeTypeObj?.label || '',
                order:       Number(form.order),
                is_optional: form.is_optional,
                status:      Number(form.status),
                status_label: form.status === '1' ? 'Active' : 'In-Active',
              }
            : r
        ))
        showToast('Record updated successfully!')
        setEditId(null)
      } else {
        const newRec = {
          id:          nextId.current++,
          session:     form.session,
          fee_head:    form.fee_head.trim(),
          fee_code:    form.fee_code.trim(),
          fee_type_id: Number(form.fee_type_id),
          fee_type:    feeTypeObj?.label || '',
          order:       Number(form.order),
          is_optional: form.is_optional,
          status:      Number(form.status),
          status_label: form.status === '1' ? 'Active' : 'In-Active',
        }
        setRecords(prev => [...prev, newRec])
        showToast('Fee Head added successfully!')
      }
      setForm(EMPTY_FORM)
      setErrors({})
      setLoading(false)
      setSheetOpen(false)
      setActiveTab('list')
    }, 600)
  }, [form, editId])

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((rec) => {
    setForm({
      session:     rec.session,
      fee_head:    rec.fee_head,
      fee_code:    rec.fee_code,
      fee_type_id: String(rec.fee_type_id),
      order:       String(rec.order),
      status:      String(rec.status),
      is_optional: rec.is_optional,
    })
    setErrors({})
    setEditId(rec.id)
    setSheetOpen(true)
    setActiveTab('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleCancel = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setSheetOpen(false)
    setActiveTab('list')
  }

  // ── Filter / search ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = records
    if (filterSession) data = data.filter(r => r.session === filterSession)
    if (filterStatus)  data = data.filter(r => String(r.status) === filterStatus)
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r =>
        r.fee_head.toLowerCase().includes(q) ||
        r.fee_code.toLowerCase().includes(q) ||
        r.fee_type.toLowerCase().includes(q)
      )
    }
    return data
  }, [records, filterSession, filterStatus, search])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    records.length,
    active:   records.filter(r => r.status === 1).length,
    optional: records.filter(r => r.is_optional).length,
    sessions: [...new Set(records.map(r => r.session))].length,
  }), [records])

  const hasFilter = filterSession || filterStatus || search

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Fee Head Master
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Define fee heads, codes, types and ordering for each session.
          </p>
        </div>
        {/* Mobile: Add button */}
        <button
          type="button"
          onClick={() => { setSheetOpen(true); setActiveTab('form') }}
          className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white
            bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 self-start"
        >
          <Plus className="w-4 h-4" /> Add Fee Head
        </button>
      </div>

      {/* ── Summary Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Layers}      label="Total Fee Heads"  value={stats.total}    color="blue"    />
        <StatCard icon={CheckCircle2}label="Active Heads"     value={stats.active}   color="emerald" />
        <StatCard icon={ToggleRight} label="Optional Heads"   value={stats.optional} color="violet"  />
        <StatCard icon={BookOpen}    label="Sessions Covered" value={stats.sessions} color="amber"   />
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* DESKTOP LAYOUT                                                      */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* ── DESKTOP: Add / Edit Form ───────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Form header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          {editId
            ? <Edit2 className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            : <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          }
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            {editId ? `Editing: ${form.fee_head || 'Record'}` : 'Add New Fee Head'}
          </span>
          {editId && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              Edit Mode
            </span>
          )}
        </div>
        <FeeHeadForm
          form={form} setForm={setForm}
          errors={errors} loading={loading}
          editId={editId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSheet={false}
        />
      </div>

      {/* ── DESKTOP: Filter + Table ────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Table header with filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <LayoutList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Fee Head Records</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Filters row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Session filter */}
            <div className="w-36">
              <NativeSelect
                value={filterSession}
                onChange={e => setFilterSession(e.target.value)}
                placeholder="All Sessions"
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </div>
            {/* Status filter */}
            <div className="w-32">
              <NativeSelect
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                placeholder="All Status"
              >
                <option value="1">Active</option>
                <option value="2">In-Active</option>
              </NativeSelect>
            </div>
            {/* Search */}
            <div className="relative w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search fee head, code…"
                className="w-full pl-8 pr-7 py-2 text-[12px] rounded-xl border outline-none transition-all
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
            {/* Reset */}
            {hasFilter && (
              <button
                onClick={() => { setFilterSession(''); setFilterStatus(''); setSearch('') }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
                  bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Hint bar */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Click <strong>Edit</strong> on any row to modify it. Order controls the display sequence in fee collection screens.
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-7 h-7 opacity-30" />
              <p className="text-[13px]">No records found{hasFilter ? ' — try clearing filters.' : '.'}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Fee Head', 'Fee Code', 'Fee Type', 'Order', 'Optional', 'Status', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((rec, i) => (
                  <DesktopRow key={rec.id} rec={rec} idx={i + 1} onEdit={handleEdit} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span> records
          </p>
          {hasFilter && (
            <button
              onClick={() => { setFilterSession(''); setFilterStatus(''); setSearch('') }}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* MOBILE LAYOUT                                                        */}
      {/* ═══════════════════════════════════════════════════════════════════ */}

      {/* ── MOBILE: Tab bar ─────────────────────────────────────────────── */}
      <div className="sm:hidden rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">

        {/* Mobile filter + search bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search fee head…"
              className="w-full pl-8 pr-7 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setMobileFilter(true)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold border transition-colors
              ${(filterSession || filterStatus)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
              }`}
          >
            <Filter className="w-3.5 h-3.5" />
            Filter
            {(filterSession || filterStatus) && (
              <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {[filterSession, filterStatus].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {/* Record count */}
        <div className="px-4 py-2 flex items-center justify-between border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of {records.length} records
          </p>
          {hasFilter && (
            <button
              onClick={() => { setFilterSession(''); setFilterStatus(''); setSearch('') }}
              className="text-[12px] text-blue-600 dark:text-blue-400 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Card list */}
        <div className="p-3 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-30" />
              <p className="text-[13px]">No records found{hasFilter ? '. Try clearing filters.' : '.'}</p>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to see full details and edit.
              </p>
              {filtered.map((rec, i) => (
                <MobileCard key={rec.id} rec={rec} idx={i + 1} onEdit={handleEdit} />
              ))}
            </>
          )}
        </div>
      </div>

      {/* ── MOBILE: Filter Bottom Sheet ──────────────────────────────────── */}
      <BottomSheet
        open={mobileFilter}
        onClose={() => setMobileFilter(false)}
        title="Filter Records"
      >
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" icon={BookOpen}>
            <NativeSelect
              value={filterSession}
              onChange={e => setFilterSession(e.target.value)}
              placeholder="All Sessions"
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Status" icon={ShieldCheck}>
            <NativeSelect
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              placeholder="All Status"
            >
              <option value="1">Active</option>
              <option value="2">In-Active</option>
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 pb-6 flex gap-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] pt-4">
          <button
            type="button"
            onClick={() => { setFilterSession(''); setFilterStatus(''); setMobileFilter(false) }}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setMobileFilter(false)}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600"
          >
            Apply Filters
          </button>
        </div>
      </BottomSheet>

      {/* ── MOBILE: Add / Edit Bottom Sheet ─────────────────────────────── */}
      <BottomSheet
        open={sheetOpen}
        onClose={() => { setSheetOpen(false); if (!editId) handleCancel() }}
        title={editId ? `Edit: ${form.fee_head || 'Record'}` : 'Add New Fee Head'}
      >
        <FeeHeadForm
          form={form} setForm={setForm}
          errors={errors} loading={loading}
          editId={editId}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSheet
        />
        {/* Sheet footer buttons */}
        <div className="px-5 pb-8 pt-4 flex gap-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          {editId && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel Edit
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 transition-all disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : editId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editId ? 'Update Record' : 'Save Fee Head'}
          </button>
        </div>
      </BottomSheet>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
