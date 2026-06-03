/**
 * FeeHeadChargeMaster.jsx
 * Folder: src/pages/Fee/FeeHeadChargeMaster.jsx
 *
 * Converts legacy ASPX "Fee Head Charge Master" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session dropdown
 *  - School Type (RadioButton group)
 *  - Class selection (RadioButton group)
 *  - Fee charges grid (editable per row) with Save / Update
 *  - Fee Chart tab (New/Old student toggle + nested installment grid)
 *  - Mobile: Cards, accordions, tabs
 *  - Desktop: Dense ERP table style
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ChevronDown, ChevronRight, ChevronUp,
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2,
  SlidersHorizontal, Search,
  FileSpreadsheet, BookOpen,
  Building2, TrendingUp,
  Save, Edit3, RotateCcw,
  IndianRupee, Users, GraduationCap,
  LayoutGrid, Table2, Info,
  CheckCircle2, School, Layers,
  BadgeIndianRupee, Receipt, CreditCard,
  MapPin, Calendar, ToggleLeft, ToggleRight,
  PlusCircle, Settings2
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_TYPES = [
  { value: 'primary',   label: 'Primary (Nur–V)'   },
  { value: 'secondary', label: 'Secondary (VI–X)'  },
  { value: 'senior',    label: 'Senior (XI–XII)'   },
]

const CLASSES_BY_TYPE = {
  primary:   ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V'],
  secondary: ['Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X'],
  senior:    ['Class XI', 'Class XII'],
}

const FEE_HEADS = [
  { fee_head_id: 1, fee_head: 'Tuition Fee',        fee_type_id: 1, fee_type: 'Monthly'   },
  { fee_head_id: 2, fee_head: 'Development Fee',    fee_type_id: 2, fee_type: 'Quarterly' },
  { fee_head_id: 3, fee_head: 'Computer Fee',       fee_type_id: 1, fee_type: 'Monthly'   },
  { fee_head_id: 4, fee_head: 'Library Fee',        fee_type_id: 3, fee_type: 'Annual'    },
  { fee_head_id: 5, fee_head: 'Sports Fee',         fee_type_id: 3, fee_type: 'Annual'    },
  { fee_head_id: 6, fee_head: 'Examination Fee',    fee_type_id: 2, fee_type: 'Quarterly' },
  { fee_head_id: 7, fee_head: 'Transportation Fee', fee_type_id: 1, fee_type: 'Monthly'   },
  { fee_head_id: 8, fee_head: 'Smart Class Fee',    fee_type_id: 1, fee_type: 'Monthly'   },
]

// Charges per class (new/old)
const BASE_CHARGES = {
  'Nursery':    { new: [800,200,150,500,300,400,1200,300], old: [750,200,150,500,300,350,1200,250] },
  'LKG':        { new: [850,200,150,500,300,400,1200,300], old: [800,200,150,500,300,350,1200,250] },
  'UKG':        { new: [900,250,150,500,300,450,1200,300], old: [850,250,150,500,300,400,1200,250] },
  'Class I':    { new: [1000,300,200,600,400,500,1400,350], old: [950,300,200,600,400,450,1400,300] },
  'Class II':   { new: [1000,300,200,600,400,500,1400,350], old: [950,300,200,600,400,450,1400,300] },
  'Class III':  { new: [1050,300,200,600,400,550,1400,350], old: [1000,300,200,600,400,500,1400,300] },
  'Class IV':   { new: [1050,300,200,600,400,550,1400,350], old: [1000,300,200,600,400,500,1400,300] },
  'Class V':    { new: [1100,350,250,700,450,600,1500,400], old: [1050,350,250,700,450,550,1500,350] },
  'Class VI':   { new: [1200,400,300,800,500,700,1600,450], old: [1150,400,300,800,500,650,1600,400] },
  'Class VII':  { new: [1200,400,300,800,500,700,1600,450], old: [1150,400,300,800,500,650,1600,400] },
  'Class VIII': { new: [1300,450,350,800,500,750,1600,450], old: [1250,450,350,800,500,700,1600,400] },
  'Class IX':   { new: [1400,500,400,900,600,800,1700,500], old: [1350,500,400,900,600,750,1700,450] },
  'Class X':    { new: [1500,500,400,900,600,900,1700,500], old: [1450,500,400,900,600,850,1700,450] },
  'Class XI':   { new: [1800,600,500,1000,700,1000,1800,600], old: [1750,600,500,1000,700,950,1800,550] },
  'Class XII':  { new: [1800,600,500,1000,700,1000,1800,600], old: [1750,600,500,1000,700,950,1800,550] },
}

// Fee Chart installments (4 quarters) per class
const generateFeeChart = (cls, isNew) => {
  const key = isNew ? 'new' : 'old'
  const charges = BASE_CHARGES[cls]?.[key] || FEE_HEADS.map(() => 0)
  return [1,2,3,4].map(q => ({
    installment_no: `Installment ${q} (${['Apr–Jun','Jul–Sep','Oct–Dec','Jan–Mar'][q-1]})`,
    details: FEE_HEADS.map((h,i) => ({
      fee_head: h.fee_head,
      fee_type: h.fee_type,
      amount: h.fee_type_id === 1 ? charges[i] * 3
             : h.fee_type_id === 2 ? (q % 2 === 0 ? charges[i] : 0)
             : (q === 1 ? charges[i] : 0),
    })).filter(d => d.amount > 0)
  }))
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const formatINR = n => n > 0
  ? `₹${n.toLocaleString('en-IN')}`
  : <span className="text-slate-300 dark:text-slate-700">—</span>

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = name => CLASS_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const abbr = name => name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}{required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
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
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── BADGE ───────────────────────────────────────────────────────────────────
function Badge({ children, color = 'blue' }) {
  const map = {
    blue:    'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    amber:   'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    violet:  'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
    rose:    'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
    slate:   'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold ${map[color]}`}>
      {children}
    </span>
  )
}

// ─── RADIO PILL GROUP ─────────────────────────────────────────────────────────
function RadioPills({ options, value, onChange, wrap = false }) {
  return (
    <div className={`flex gap-2 ${wrap ? 'flex-wrap' : 'flex-wrap'}`}>
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all flex-shrink-0
            ${value === opt.value
              ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:border-indigo-600'
              : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.25)] dark:text-slate-400'
            }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

// ─── CLASS RADIO PILLS ────────────────────────────────────────────────────────
function ClassPills({ classes, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {classes.map(cls => {
        const { fg, bg } = classColor(cls)
        const active = value === cls
        return (
          <button
            key={cls}
            type="button"
            onClick={() => onChange(cls)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all
              ${active
                ? 'border-blue-500 bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:border-indigo-600'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.2)] dark:text-slate-400'
              }`}
          >
            <span
              className="w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold flex-shrink-0"
              style={active ? { background: 'rgba(255,255,255,0.25)', color: '#fff' } : { background: bg, color: fg }}
            >
              {abbr(cls)}
            </span>
            {cls}
          </button>
        )
      })}
    </div>
  )
}

// ─── EDITABLE FEE ROW (DESKTOP) ───────────────────────────────────────────────
function FeeRow({ row, idx, onUpdate, saving }) {
  const [val, setVal] = useState(String(row.fee_charges))
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  const feeTypeColor = t =>
    t === 'Monthly' ? 'blue' : t === 'Quarterly' ? 'amber' : 'violet'

  const handleUpdate = () => {
    setBusy(true)
    setTimeout(() => {
      onUpdate(row.fee_head_id, Number(val))
      setBusy(false)
      setEditing(false)
    }, 500)
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Receipt className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.fee_head}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <Badge color={feeTypeColor(row.fee_type)}>{row.fee_type}</Badge>
      </td>
      <td className="px-4 py-3 text-center">
        {editing ? (
          <div className="flex items-center justify-center gap-1">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[12px]">₹</span>
              <input
                type="number"
                value={val}
                onChange={e => setVal(e.target.value)}
                className="w-28 pl-6 pr-2 py-1.5 text-[13px] font-semibold rounded-lg border border-blue-400 ring-2 ring-blue-100
                  dark:border-indigo-500 dark:ring-indigo-500/20 bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-100 outline-none text-center"
                autoFocus
                min={0}
              />
            </div>
            <button onClick={handleUpdate} disabled={busy}
              className="p-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-colors">
              {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            </button>
            <button onClick={() => { setEditing(false); setVal(String(row.fee_charges)) }}
              className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
              <IndianRupee className="w-3 h-3" />{Number(val).toLocaleString('en-IN')}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={handleUpdate}
          disabled={busy || String(val) === String(row.fee_charges)}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100
            dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/15
            disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Update
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE FEE CARD ──────────────────────────────────────────────────────────
function FeeMobileCard({ row, idx, onUpdate }) {
  const [val, setVal] = useState(String(row.fee_charges))
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)

  const feeTypeColor = t =>
    t === 'Monthly' ? 'blue' : t === 'Quarterly' ? 'amber' : 'violet'

  const handleUpdate = () => {
    setBusy(true)
    setTimeout(() => {
      onUpdate(row.fee_head_id, Number(val))
      setBusy(false)
      setEditing(false)
    }, 500)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Receipt className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.fee_head}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <Badge color={feeTypeColor(row.fee_type)}>{row.fee_type}</Badge>
            <span className="text-[11px] text-slate-400">#{idx}</span>
          </div>
        </div>
        {!editing && (
          <div className="flex flex-col items-end gap-1 flex-shrink-0">
            <span className="text-[18px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
              ₹{Number(val).toLocaleString('en-IN')}
            </span>
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400"
            >
              <Edit3 className="w-3 h-3" /> Edit
            </button>
          </div>
        )}
      </div>

      {editing && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 bg-blue-50/30 dark:bg-blue-500/[0.04]">
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2 block">
            Update Charges
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[13px] font-bold">₹</span>
              <input
                type="number"
                value={val}
                onChange={e => setVal(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 text-[14px] font-bold rounded-xl border border-blue-400 ring-2 ring-blue-100
                  dark:border-indigo-500 dark:ring-indigo-500/20 bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-100 outline-none"
                min={0}
                autoFocus
              />
            </div>
            <button
              onClick={handleUpdate}
              disabled={busy}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-70"
            >
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
            <button
              onClick={() => { setEditing(false); setVal(String(row.fee_charges)) }}
              className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── FEE CHART: INSTALLMENT CARD ─────────────────────────────────────────────
function InstallmentCard({ inst, idx }) {
  const [open, setOpen] = useState(idx === 0)
  const total = inst.details.reduce((s, d) => s + d.amount, 0)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center flex-shrink-0">
          <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{inst.installment_no}</p>
          <p className="text-[11px] text-slate-400">{inst.details.length} fee heads</p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
          <span className="text-[16px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">
            ₹{total.toLocaleString('en-IN')}
          </span>
          <span className="text-[10px] text-slate-400">total</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-90' : ''} flex-shrink-0`} />
      </button>

      {open && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          {inst.details.map((d, i) => (
            <div key={i} className={`flex items-center gap-3 px-4 py-2.5 ${i % 2 === 0 ? 'bg-slate-50/40 dark:bg-white/[0.01]' : ''}`}>
              <span className="text-[12px] text-slate-500 dark:text-slate-400 w-4 text-center tabular-nums">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{d.fee_head}</p>
                <p className="text-[11px] text-slate-400">{d.fee_type}</p>
              </div>
              <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                ₹{d.amount.toLocaleString('en-IN')}
              </span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-2.5 bg-blue-50 dark:bg-blue-500/[0.06] border-t border-blue-100 dark:border-blue-500/10">
            <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Installment Total
            </span>
            <span className="text-[14px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── FILTER DRAWER (MOBILE) ───────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, schoolType, setSchoolType, selectedClass, setSelectedClass, onSubmit, loading, errors }) {
  if (!open) return null
  const classes = CLASSES_BY_TYPE[schoolType] || []

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
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Configure Fee</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="School Type" error={errors.schoolType} required>
            <RadioPills options={SCHOOL_TYPES} value={schoolType} onChange={setSchoolType} />
          </Field>

          {schoolType && (
            <Field label="Select Class" error={errors.selectedClass} required>
              <ClassPills classes={classes} value={selectedClass} onChange={setSelectedClass} />
            </Field>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Cancel
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Load Fee Data
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SUMMARY PILL ────────────────────────────────────────────────────────────
function SummaryPill({ icon: Icon, label, value, color }) {
  const map = {
    blue:    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    amber:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    violet:  'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
  }
  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${map[color]} flex-1 min-w-0`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[16px] font-bold tabular-nums leading-tight">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-80 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FeeHeadChargeMaster() {
  // Filter state
  const [session,       setSession]       = useState('')
  const [schoolType,    setSchoolType]    = useState('')
  const [selectedClass, setSelectedClass] = useState('')

  // UI state
  const [loading,     setLoading]     = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [activeTab,   setActiveTab]   = useState('charges') // 'charges' | 'chart'
  const [feeStudType, setFeeStudType] = useState('new')     // 'new' | 'old'
  const [saving,      setSaving]      = useState(false)
  const [savingAll,   setSavingAll]   = useState(false)

  // Data state
  const [feeRows,      setFeeRows]     = useState([])
  const [shownInfo,    setShownInfo]   = useState({ session: '', class: '', type: '' })
  const [feeChart,     setFeeChart]    = useState([])
  const [savedRows,    setSavedRows]   = useState([])  // track which row ids are unsaved

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Reset class when type changes
  useEffect(() => { setSelectedClass('') }, [schoolType])

  // ── Validate & Load ────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = {}
    if (!session)       err.session       = 'Select a session'
    if (!schoolType)    err.schoolType    = 'Select school type'
    if (!selectedClass) err.selectedClass = 'Select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const charges = BASE_CHARGES[selectedClass] || {}
      const key = feeStudType === 'new' ? 'new' : 'old'
      const rows = FEE_HEADS.map((h, i) => ({
        ...h,
        fee_charges: (charges[key] || [])[i] ?? 0,
        btn: true,
      }))
      setFeeRows(rows)
      setFeeChart(generateFeeChart(selectedClass, feeStudType === 'new'))
      setShownInfo({ session, class: selectedClass, type: schoolType })
      setShown(true)
      setLoading(false)
      showToast(`Fee data loaded for ${selectedClass} — Session ${session}`)
    }, 700)
  }, [session, schoolType, selectedClass, feeStudType])

  // ── Update single row charge ───────────────────────────────────────────────
  const handleUpdate = useCallback((id, val) => {
    setFeeRows(prev => prev.map(r => r.fee_head_id === id ? { ...r, fee_charges: val } : r))
    showToast('Charge updated successfully.')
  }, [])

  // ── Save All ──────────────────────────────────────────────────────────────
  const handleSaveAll = () => {
    setSavingAll(true)
    setTimeout(() => {
      setSavingAll(false)
      showToast(`All charges saved for ${shownInfo.class} — ${shownInfo.session}`)
    }, 900)
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession(''); setSchoolType(''); setSelectedClass('')
    setFeeRows([]); setFeeChart([])
    setErrors({}); setShown(false); setShownInfo({ session: '', class: '', type: '' })
    setActiveTab('charges'); setFeeStudType('new')
  }

  // ── Fee chart update on student type change ────────────────────────────────
  const handleFeeStudTypeChange = (t) => {
    setFeeStudType(t)
    if (shown) {
      setFeeChart(generateFeeChart(shownInfo.class, t === 'new'))
    }
  }

  // ── Totals ─────────────────────────────────────────────────────────────────
  const totalCharge = useMemo(() => feeRows.reduce((s, r) => s + r.fee_charges, 0), [feeRows])
  const chartGrandTotal = useMemo(() => feeChart.reduce((s, inst) => s + inst.details.reduce((a, d) => a + d.amount, 0), 0), [feeChart])

  const activeFilters = [session, schoolType, selectedClass].filter(Boolean).length
  const classes = CLASSES_BY_TYPE[schoolType] || []

  // ── Tabs config ────────────────────────────────────────────────────────────
  const tabs = [
    { id: 'charges', label: 'Fee Charges',   icon: Receipt    },
    { id: 'chart',   label: 'Fee Chart',     icon: LayoutGrid },
  ]

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BadgeIndianRupee className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Fee Head Charge Master
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Configure fee charges per class, session &amp; type · View fee chart installments
          </p>
        </div>

        {shown && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button onClick={handleSaveAll} disabled={savingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-70">
              {savingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save All
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP FILTER PANEL ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Configure Parameters</span>
          {shown && (
            <div className="flex items-center gap-2">
              <Badge color="emerald">
                <CheckCircle2 className="w-3 h-3 mr-1" />{shownInfo.class} · {shownInfo.session}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Row 1: session + type */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={session} onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }} placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="School Type" error={errors.schoolType} required>
              <RadioPills
                options={SCHOOL_TYPES}
                value={schoolType}
                onChange={v => { setSchoolType(v); setErrors(p => ({ ...p, schoolType: undefined })) }}
              />
            </Field>

            {/* Actions */}
            <div className="flex gap-2">
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Load
              </button>
              <button type="button" onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Row 2: Class pills */}
          {schoolType && (
            <Field label="Select Class" error={errors.selectedClass} required hint="Select one class to view/edit its fee structure">
              <ClassPills
                classes={classes}
                value={selectedClass}
                onChange={v => { setSelectedClass(v); setErrors(p => ({ ...p, selectedClass: undefined })) }}
              />
            </Field>
          )}
        </div>
      </div>

      {/* ── MOBILE FILTER BAR ────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {selectedClass ? `${selectedClass} · ${session || 'No Session'}` : 'Configure Fee'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {shown && (
          <>
            <button onClick={handleSaveAll} disabled={savingAll}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 shadow-sm disabled:opacity-70">
              {savingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
            <button type="button" onClick={handleReset}
              className="px-3.5 py-3 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <RotateCcw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={v => { setSession(v); setErrors(p => ({ ...p, session: undefined })) }}
        schoolType={schoolType}
        setSchoolType={v => { setSchoolType(v); setErrors(p => ({ ...p, schoolType: undefined })) }}
        selectedClass={selectedClass}
        setSelectedClass={v => { setSelectedClass(v); setErrors(p => ({ ...p, selectedClass: undefined })) }}
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors}
      />

      {/* ── LOADING ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── RESULTS ──────────────────────────────────────────────────────── */}
      {shown && !loading && (
        <>
          {/* Context banner */}
          <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </span>
              <div>
                <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100">{shownInfo.class}</p>
                <div className="flex flex-wrap items-center gap-2 mt-0.5">
                  <Badge color="amber">Session: {shownInfo.session}</Badge>
                  <Badge color="violet">{SCHOOL_TYPES.find(t => t.value === shownInfo.type)?.label}</Badge>
                </div>
              </div>
            </div>
            {/* Summary pills */}
            <div className="flex gap-2 flex-wrap w-full sm:w-auto">
              <SummaryPill icon={Receipt}    label="Fee Heads"  value={feeRows.length}                          color="blue"    />
              <SummaryPill icon={IndianRupee} label="Total/Mo"  value={`₹${totalCharge.toLocaleString('en-IN')}`} color="emerald" />
            </div>
          </div>

          {/* ── TABS ──────────────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Tab Bar */}
            <div className="flex border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.01] px-2 pt-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-t-xl transition-all mr-1
                    ${activeTab === tab.id
                      ? 'bg-white dark:bg-[#1a1f35] text-blue-700 dark:text-indigo-400 border border-b-0 border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-sm'
                      : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'
                    }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>

            {/* ── TAB: FEE CHARGES ─────────────────────────────────────────── */}
            {activeTab === 'charges' && (
              <>
                {/* Tab header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                    <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Fee Head Charges</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                      {feeRows.length} heads
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[12px] text-slate-500 dark:text-slate-400 hidden sm:inline">Click the edit icon on any row to update charges individually.</span>
                  </div>
                </div>

                {/* Info strip */}
                <div className="flex items-center gap-2 px-5 py-2 bg-amber-50/50 dark:bg-amber-500/[0.03] border-b border-amber-100 dark:border-amber-500/10">
                  <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <p className="text-[12px] text-amber-700 dark:text-amber-400">
                    Showing charges for <strong>{shownInfo.class}</strong>. Edit inline &amp; click Update, or Save All at top.
                  </p>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                        {['S.No.', 'Fee Head', 'Fee Type', 'Charges (₹)', 'Action'].map((h, i) => (
                          <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {feeRows.map((row, i) => (
                        <FeeRow key={row.fee_head_id} row={row} idx={i + 1} onUpdate={handleUpdate} />
                      ))}
                      {/* Total Row */}
                      <tr className="bg-emerald-50 dark:bg-emerald-500/[0.06] border-t-2 border-emerald-200 dark:border-emerald-500/20">
                        <td className="px-4 py-3 text-center text-[12px] text-emerald-500">—</td>
                        <td className="px-4 py-3" colSpan={2}>
                          <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Grand Total (All Heads)
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[14px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">
                            <IndianRupee className="w-3.5 h-3.5" />{totalCharge.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={handleSaveAll} disabled={savingAll}
                            className="flex items-center justify-center gap-1.5 mx-auto px-4 py-1.5 rounded-lg text-[12px] font-bold text-white
                              bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-70">
                            {savingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            Save All
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* MOBILE CARDS */}
                <div className="md:hidden p-4 space-y-3">
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap Edit on any card to update charges.
                  </p>
                  {feeRows.map((row, i) => (
                    <FeeMobileCard key={row.fee_head_id} row={row} idx={i + 1} onUpdate={handleUpdate} />
                  ))}

                  {/* Mobile Total */}
                  <div className="rounded-xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/[0.06] p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Grand Total
                      </span>
                      <span className="text-[20px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        ₹{totalCharge.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <button onClick={handleSaveAll} disabled={savingAll}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white
                        bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-70">
                      {savingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save All Charges
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* ── TAB: FEE CHART ────────────────────────────────────────────── */}
            {activeTab === 'chart' && (
              <>
                {/* Tab header */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <span className="w-1 h-5 rounded-full bg-amber-500 flex-shrink-0" />
                    <LayoutGrid className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Fee Chart</span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                      4 Installments
                    </span>
                  </div>

                  {/* New / Old toggle */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-[12px] text-slate-500 dark:text-slate-400 hidden sm:inline">Student Type:</span>
                    <div className="flex rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden bg-slate-50 dark:bg-[#1e2238]">
                      {[{ v: 'new', l: 'New Student' }, { v: 'old', l: 'Old Student' }].map(t => (
                        <button
                          key={t.v}
                          type="button"
                          onClick={() => handleFeeStudTypeChange(t.v)}
                          className={`px-3.5 py-2 text-[12px] font-semibold transition-all
                            ${feeStudType === t.v
                              ? 'bg-blue-600 text-white dark:bg-indigo-600'
                              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                        >
                          {t.l}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Grand total strip */}
                <div className="flex items-center justify-between px-5 py-3 bg-blue-50/40 dark:bg-blue-500/[0.04] border-b border-blue-100 dark:border-blue-500/10">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Annual Fee Total</span>
                    <Badge color={feeStudType === 'new' ? 'emerald' : 'amber'}>
                      {feeStudType === 'new' ? 'New Student' : 'Old Student'}
                    </Badge>
                  </div>
                  <span className="text-[18px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                    ₹{chartGrandTotal.toLocaleString('en-IN')}
                  </span>
                </div>

                {/* DESKTOP: nested table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50/50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-52">Installment</th>
                        <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fee Head</th>
                        <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-28">Fee Type</th>
                        <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-36">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeChart.map((inst, qi) => {
                        const instTotal = inst.details.reduce((s, d) => s + d.amount, 0)
                        return inst.details.length > 0 ? (
                          <>
                            {inst.details.map((d, di) => (
                              <tr
                                key={`${qi}-${di}`}
                                className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] hover:bg-slate-50/40 dark:hover:bg-white/[0.01] transition-colors`}
                              >
                                {di === 0 && (
                                  <td
                                    rowSpan={inst.details.length + 1}
                                    className="px-4 py-3 align-top border-r border-slate-100 dark:border-[rgba(99,102,241,0.1)]"
                                  >
                                    <div className="flex flex-col gap-1.5 sticky top-0 pt-1">
                                      <span className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                                        <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                      </span>
                                      <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 leading-snug">{inst.installment_no}</span>
                                    </div>
                                  </td>
                                )}
                                <td className="px-4 py-2.5">
                                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{d.fee_head}</span>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <Badge color={d.fee_type === 'Monthly' ? 'blue' : d.fee_type === 'Quarterly' ? 'amber' : 'violet'}>{d.fee_type}</Badge>
                                </td>
                                <td className="px-4 py-2.5 text-center">
                                  <span className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">₹{d.amount.toLocaleString('en-IN')}</span>
                                </td>
                              </tr>
                            ))}
                            {/* Subtotal row */}
                            <tr key={`sub-${qi}`} className="bg-slate-50 dark:bg-white/[0.02] border-b-2 border-slate-200 dark:border-[rgba(99,102,241,0.12)]">
                              <td className="px-4 py-2.5" colSpan={2}>
                                <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
                                  <TrendingUp className="w-3.5 h-3.5" /> Subtotal
                                </span>
                              </td>
                              <td className="px-4 py-2.5 text-center">
                                <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">₹{instTotal.toLocaleString('en-IN')}</span>
                              </td>
                            </tr>
                          </>
                        ) : null
                      })}
                      {/* Grand total */}
                      <tr className="bg-blue-50 dark:bg-blue-500/[0.07] border-t-2 border-blue-200 dark:border-blue-500/20">
                        <td className="px-4 py-3 text-center text-blue-400">—</td>
                        <td className="px-4 py-3" colSpan={2}>
                          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4" /> Annual Grand Total
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[14px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
                            <IndianRupee className="w-3.5 h-3.5" />{chartGrandTotal.toLocaleString('en-IN')}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* MOBILE: accordion cards */}
                <div className="md:hidden p-4 space-y-3">
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap installment to expand fee details.
                  </p>
                  {feeChart.map((inst, i) => inst.details.length > 0 && (
                    <InstallmentCard key={i} inst={inst} idx={i} />
                  ))}

                  {/* Mobile grand total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/[0.07] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <div>
                        <p className="text-[12px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Annual Total</p>
                        <p className="text-[11px] text-blue-500 dark:text-blue-500">{feeStudType === 'new' ? 'New' : 'Old'} Student</p>
                      </div>
                    </div>
                    <span className="text-[22px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                      ₹{chartGrandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Footer */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500 flex-1">
                {activeTab === 'charges'
                  ? `${feeRows.length} fee heads · Total ₹${totalCharge.toLocaleString('en-IN')} per billing cycle`
                  : `4 installments · Annual total ₹${chartGrandTotal.toLocaleString('en-IN')}`
                }
              </p>
              <Badge color="slate">
                {shownInfo.class} · {shownInfo.session}
              </Badge>
            </div>
          </div>
        </>
      )}

      {/* ── EMPTY STATE ───────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BadgeIndianRupee className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400">No Fee Data Loaded</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1.5">
              Select a <strong>Session</strong>, <strong>School Type</strong> and <strong>Class</strong>, then click <strong>Load</strong> to view and edit fee charges.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-6 mt-2">
            {[
              { icon: Calendar,      label: 'Pick Session',  color: 'text-blue-500'   },
              { icon: School,        label: 'Choose Type',   color: 'text-violet-500' },
              { icon: GraduationCap, label: 'Select Class',  color: 'text-emerald-500'},
              { icon: Eye,           label: 'Click Load',    color: 'text-amber-500'  },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className={`w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </span>
                <span className="text-[11px] text-slate-400 font-medium">{s.label}</span>
                {i < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 absolute ml-16 mt-1.5" style={{ position: 'unset' }} />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
