/**
 * DefineLateFee.jsx
 * Folder: src/pages/Fee/DefineLateFee.jsx
 *
 * Converts legacy ASPX "Define Late Fee" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session dropdown
 *  - Fee Type radio (Regular / Transport / Hostel)
 *  - Late Fee Type radio (Fix / Per Day / Percentage / Monthly / Weekly)
 *  - Per-installment late fee slab table (From Date, To Date, Charges)
 *  - Add / Delete slab rows per installment
 *  - Submit saves all slabs
 *  - Mobile: accordion cards per installment, full-width inputs
 *  - Desktop: dense ERP table per installment
 */

import { useState, useCallback, useMemo } from 'react'
import {
  ChevronDown, ChevronUp, Plus, Trash2, Save,
  AlertCircle, Check, X, Loader2, RefreshCw,
  Calendar, DollarSign, Layers, Filter,
  Info, Clock, TrendingUp, Zap,
  BookOpen, Bus, Home, FileText,
  ChevronRight, BarChart3, Settings2
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26', '2026-27']

const FEE_TYPES = [
  { id: 'regular',   label: 'Regular',   icon: BookOpen,  color: 'blue'   },
  { id: 'transport', label: 'Transport', icon: Bus,       color: 'amber'  },
  { id: 'hostel',    label: 'Hostel',    icon: Home,      color: 'violet' },
]

const LATE_FEE_TYPES = [
  { id: 'fix',        label: 'Fix',        desc: 'One-time fixed charge'     },
  { id: 'per_day',    label: 'Per Day',    desc: 'Daily accrual after due'   },
  { id: 'percentage', label: 'Percentage', desc: '% of pending fee amount'   },
  { id: 'monthly',    label: 'Monthly',    desc: 'Charged once per month'    },
  { id: 'weekly',     label: 'Weekly',     desc: 'Charged once per week'     },
]

// Installments per fee type
const INSTALLMENTS = {
  regular:   ['April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December', 'January', 'February', 'March'],
  transport: ['Quarter-1 (Apr-Jun)', 'Quarter-2 (Jul-Sep)', 'Quarter-3 (Oct-Dec)', 'Quarter-4 (Jan-Mar)'],
  hostel:    ['Term-1 (Apr-Sep)', 'Term-2 (Oct-Mar)'],
}

// Dummy pre-filled slabs
const buildInitialSlabs = (feeType) => {
  const months = INSTALLMENTS[feeType] || []
  const result = {}
  months.forEach((month, idx) => {
    result[idx + 1] = [
      {
        id: `slab-${idx}-1`,
        late_fee_id: idx * 10 + 1,
        from_date: '',
        to_date: '',
        charge: '',
      },
    ]
  })
  return result
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let _uid = 1000
const uid = () => `slab-${++_uid}`

const FEE_TYPE_COLOR = {
  blue:   { ring: 'ring-blue-500',   bg: 'bg-blue-50 dark:bg-blue-500/10',   text: 'text-blue-700 dark:text-blue-400',   border: 'border-blue-200 dark:border-blue-500/30'   },
  amber:  { ring: 'ring-amber-500',  bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/30' },
  violet: { ring: 'ring-violet-500', bg: 'bg-violet-50 dark:bg-violet-500/10',text: 'text-violet-700 dark:text-violet-400',border: 'border-violet-200 dark:border-violet-500/30'},
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
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
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
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
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
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

// ─── FEE TYPE RADIO BUTTON ────────────────────────────────────────────────────
function FeeTypeCard({ option, selected, onClick }) {
  const Icon = option.icon
  const c = FEE_TYPE_COLOR[option.color]
  const isSelected = selected === option.id
  return (
    <button
      type="button"
      onClick={() => onClick(option.id)}
      className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer flex-1 min-w-0
        ${isSelected
          ? `${c.bg} ${c.border} ${c.ring} ring-2`
          : 'bg-white dark:bg-[#1e2238] border-slate-200 dark:border-[rgba(99,102,241,0.2)] hover:border-slate-300 dark:hover:border-[rgba(99,102,241,0.4)]'
        }`}
    >
      <Icon className={`w-4 h-4 flex-shrink-0 ${isSelected ? c.text : 'text-slate-400'}`} />
      <span className={`text-[13px] font-bold ${isSelected ? c.text : 'text-slate-600 dark:text-slate-300'}`}>
        {option.label}
      </span>
      {isSelected && (
        <span className={`ml-auto w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${c.bg}`}>
          <Check className={`w-2.5 h-2.5 ${c.text}`} />
        </span>
      )}
    </button>
  )
}

// ─── LATE FEE TYPE CHIP ───────────────────────────────────────────────────────
function LateFeeTypeChip({ option, selected, onClick }) {
  const isSelected = selected === option.id
  return (
    <button
      type="button"
      onClick={() => onClick(option.id)}
      title={option.desc}
      className={`px-3 py-2 rounded-xl border-2 transition-all duration-200 text-center flex-1 min-w-0
        ${isSelected
          ? 'bg-blue-600 dark:bg-indigo-600 border-blue-600 dark:border-indigo-600 text-white shadow-md shadow-blue-500/25'
          : 'bg-white dark:bg-[#1e2238] border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-indigo-400'
        }`}
    >
      <p className="text-[12px] font-bold whitespace-nowrap">{option.label}</p>
      <p className={`text-[10px] mt-0.5 hidden sm:block truncate ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
        {option.desc}
      </p>
    </button>
  )
}

// ─── DATE INPUT ───────────────────────────────────────────────────────────────
function DateInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input
        type="date"
        value={value}
        onChange={onChange}
        className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 border-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
          dark:focus:border-indigo-400"
        placeholder={placeholder}
      />
    </div>
  )
}

// ─── CHARGE INPUT ─────────────────────────────────────────────────────────────
function ChargeInput({ value, onChange, lateFeeType }) {
  const suffix = lateFeeType === 'percentage' ? '%' : '₹'
  return (
    <div className="relative">
      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[12px] text-slate-400 font-bold pointer-events-none select-none">
        {suffix}
      </span>
      <input
        type="number"
        min="0"
        value={value}
        onChange={onChange}
        placeholder="0"
        className="w-full pl-7 pr-3 py-2 text-[12px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 border-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
          dark:focus:border-indigo-400"
      />
    </div>
  )
}

// ─── INSTALLMENT PANEL (Desktop table) ───────────────────────────────────────
function InstallmentDesktopTable({ installNo, installName, slabs, onAdd, onDelete, onChange, lateFeeType }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-700 dark:to-purple-700">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center text-[11px] font-bold text-white">
            {installNo}
          </span>
          <span className="text-[13px] font-bold text-white">Installment {installNo} — {installName}</span>
        </div>
        <button
          type="button"
          onClick={() => onAdd(installNo)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[12px] font-semibold transition-all"
        >
          <Plus className="w-3.5 h-3.5" /> Add Slab
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-12">S.No</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">From Date</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">To Date</th>
              <th className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Charges</th>
              <th className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {slabs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center">
                  <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-600">
                    <Clock className="w-6 h-6 opacity-40" />
                    <p className="text-[12px]">No slabs defined. Click <strong>Add Slab</strong> to start.</p>
                  </div>
                </td>
              </tr>
            ) : slabs.map((slab, i) => (
              <tr key={slab.id} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/50 dark:hover:bg-white/[0.015] transition-colors">
                <td className="px-3 py-2.5 text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{i + 1}</td>
                <td className="px-3 py-2.5 min-w-[150px]">
                  <DateInput
                    value={slab.from_date}
                    onChange={e => onChange(installNo, slab.id, 'from_date', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2.5 min-w-[150px]">
                  <DateInput
                    value={slab.to_date}
                    onChange={e => onChange(installNo, slab.id, 'to_date', e.target.value)}
                  />
                </td>
                <td className="px-3 py-2.5 min-w-[120px]">
                  <ChargeInput
                    value={slab.charge}
                    onChange={e => onChange(installNo, slab.id, 'charge', e.target.value)}
                    lateFeeType={lateFeeType}
                  />
                </td>
                <td className="px-3 py-2.5 text-center">
                  <button
                    type="button"
                    onClick={() => onDelete(installNo, slab.id)}
                    className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── INSTALLMENT PANEL (Mobile accordion card) ────────────────────────────────
function InstallmentMobileCard({ installNo, installName, slabs, onAdd, onDelete, onChange, lateFeeType }) {
  const [open, setOpen] = useState(installNo <= 2) // first 2 open by default
  const filledCount = slabs.filter(s => s.from_date && s.to_date && s.charge).length

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] overflow-hidden shadow-sm">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-700 dark:to-purple-700 text-left"
      >
        <span className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0">
          {installNo}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-white leading-tight truncate">
            Installment {installNo} — {installName}
          </p>
          <p className="text-[10px] text-blue-100 mt-0.5">
            {filledCount}/{slabs.length} slab{slabs.length !== 1 ? 's' : ''} defined
          </p>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-white/70 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-white/70 flex-shrink-0" />
        }
      </button>

      {/* Body */}
      {open && (
        <div className="bg-white dark:bg-[#1a1f35]">
          {/* Slabs */}
          {slabs.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-6 text-slate-400 dark:text-slate-600">
              <Clock className="w-5 h-5 opacity-40" />
              <p className="text-[12px]">No slabs yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.08)]">
              {slabs.map((slab, i) => (
                <div key={slab.id} className="px-4 py-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                      Slab #{i + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDelete(installNo, slab.id)}
                      className="flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Delete
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="From Date">
                      <DateInput
                        value={slab.from_date}
                        onChange={e => onChange(installNo, slab.id, 'from_date', e.target.value)}
                      />
                    </Field>
                    <Field label="To Date">
                      <DateInput
                        value={slab.to_date}
                        onChange={e => onChange(installNo, slab.id, 'to_date', e.target.value)}
                      />
                    </Field>
                  </div>
                  <Field label={`Charges ${lateFeeType === 'percentage' ? '(%)' : '(₹)'}`}>
                    <ChargeInput
                      value={slab.charge}
                      onChange={e => onChange(installNo, slab.id, 'charge', e.target.value)}
                      lateFeeType={lateFeeType}
                    />
                  </Field>
                </div>
              ))}
            </div>
          )}

          {/* Add slab button */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button
              type="button"
              onClick={() => onAdd(installNo)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-blue-300 dark:border-indigo-500/40
                text-blue-600 dark:text-indigo-400 text-[13px] font-semibold hover:bg-blue-50 dark:hover:bg-indigo-500/10 transition-all"
            >
              <Plus className="w-4 h-4" /> Add Slab
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineLateFee() {
  const [session,      setSession]      = useState('')
  const [feeType,      setFeeType]      = useState('regular')
  const [lateFeeType,  setLateFeeType]  = useState('per_day')
  const [slabsMap,     setSlabsMap]     = useState(() => buildInitialSlabs('regular'))
  const [loading,      setLoading]      = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [activeTab,    setActiveTab]    = useState('all') // 'all' | installment index (mobile tab nav)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  // When fee type changes, rebuild installments
  const handleFeeTypeChange = useCallback((ft) => {
    setFeeType(ft)
    setSlabsMap(buildInitialSlabs(ft))
  }, [])

  // Add slab to an installment
  const handleAddSlab = useCallback((installNo) => {
    setSlabsMap(prev => ({
      ...prev,
      [installNo]: [
        ...(prev[installNo] || []),
        { id: uid(), late_fee_id: 0, from_date: '', to_date: '', charge: '' },
      ],
    }))
  }, [])

  // Delete slab
  const handleDeleteSlab = useCallback((installNo, slabId) => {
    setSlabsMap(prev => ({
      ...prev,
      [installNo]: (prev[installNo] || []).filter(s => s.id !== slabId),
    }))
  }, [])

  // Update slab field
  const handleSlabChange = useCallback((installNo, slabId, field, value) => {
    setSlabsMap(prev => ({
      ...prev,
      [installNo]: (prev[installNo] || []).map(s =>
        s.id === slabId ? { ...s, [field]: value } : s
      ),
    }))
  }, [])

  // Reset
  const handleReset = () => {
    setSession('')
    setFeeType('regular')
    setLateFeeType('per_day')
    setSlabsMap(buildInitialSlabs('regular'))
    setErrors({})
  }

  // Submit
  const handleSubmit = () => {
    const err = {}
    if (!session) err.session = 'Session is required'
    if (Object.keys(err).length) { setErrors(err); showToast('Please fill required fields.', 'error'); return }
    setErrors({})
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      showToast('Late fee slabs saved successfully!')
    }, 1200)
  }

  const installments = INSTALLMENTS[feeType] || []

  // Summary stats
  const totalSlabs = useMemo(() =>
    Object.values(slabsMap).reduce((s, arr) => s + arr.length, 0),
    [slabsMap]
  )
  const filledSlabs = useMemo(() =>
    Object.values(slabsMap).reduce((s, arr) =>
      s + arr.filter(x => x.from_date && x.to_date && x.charge).length, 0
    ), [slabsMap]
  )

  const activeFeeType = FEE_TYPES.find(f => f.id === feeType)
  const activeLFT     = LATE_FEE_TYPES.find(f => f.id === lateFeeType)

  return (
    <div className="space-y-4 pb-16">

      {/* ── PAGE TITLE ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Late Fee
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Configure late fee slabs per installment for Regular, Transport &amp; Hostel fees.
          </p>
        </div>

        {/* Stats — desktop */}
        <div className="hidden sm:flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">{filledSlabs}/{totalSlabs} Slabs Filled</span>
          </div>
        </div>
      </div>

      {/* ── CONFIGURATION CARD ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Configuration</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Row 1: Session */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
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
            <div className="sm:col-span-2 flex gap-2 sm:justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>

          {/* Row 2: Fee Type */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5">
              Select Fee Type
            </p>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap">
              {FEE_TYPES.map(ft => (
                <FeeTypeCard
                  key={ft.id}
                  option={ft}
                  selected={feeType}
                  onClick={handleFeeTypeChange}
                />
              ))}
            </div>
          </div>

          {/* Row 3: Late Fee Type */}
          <div>
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5">
              Select Late Fee Type
            </p>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap overflow-x-auto pb-1">
              {LATE_FEE_TYPES.map(lft => (
                <LateFeeTypeChip
                  key={lft.id}
                  option={lft}
                  selected={lateFeeType}
                  onClick={setLateFeeType}
                />
              ))}
            </div>
          </div>

          {/* Active config summary */}
          <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="text-[12px] text-slate-500 dark:text-slate-400">Active config:</span>
            </div>
            <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/15 px-2 py-0.5 rounded-lg">
              {activeFeeType?.label} Fee
            </span>
            <span className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/15 px-2 py-0.5 rounded-lg">
              {activeLFT?.label} late charges
            </span>
            <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/15 px-2 py-0.5 rounded-lg">
              {installments.length} installments
            </span>
            {session && (
              <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/15 px-2 py-0.5 rounded-lg">
                Session: {session}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── INSTALLMENTS SECTION ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Section Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
              Late Fee Slabs — {activeFeeType?.label}
            </span>
            <span className="hidden sm:inline text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400">
              {installments.length} Installments
            </span>
          </div>
          {/* Mobile stats */}
          <span className="sm:hidden text-[12px] font-bold text-blue-600 dark:text-blue-400">
            {filledSlabs}/{totalSlabs} done
          </span>
        </div>

        {/* Info bar */}
        <div className="flex items-center gap-2 px-5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] bg-blue-50/30 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Define multiple date-range slabs per installment. Each slab specifies when late fee applies and how much.
            {lateFeeType === 'per_day' && ' (Per day: charge accrues each day within the slab range)'}
            {lateFeeType === 'fix' && ' (Fix: flat charge applied once when due date passes)'}
            {lateFeeType === 'percentage' && ' (Percentage: % of pending fee amount)'}
          </p>
        </div>

        {/* ── DESKTOP: All installments stacked ── */}
        <div className="hidden md:block p-5 space-y-4">
          {installments.map((name, idx) => {
            const installNo = idx + 1
            return (
              <InstallmentDesktopTable
                key={installNo}
                installNo={installNo}
                installName={name}
                slabs={slabsMap[installNo] || []}
                onAdd={handleAddSlab}
                onDelete={handleDeleteSlab}
                onChange={handleSlabChange}
                lateFeeType={lateFeeType}
              />
            )
          })}
        </div>

        {/* ── MOBILE: Accordion cards ── */}
        <div className="md:hidden p-4 space-y-3">
          {/* Quick nav */}
          {installments.length > 4 && (
            <div className="overflow-x-auto pb-1">
              <div className="flex gap-2 min-w-max">
                {installments.map((name, idx) => {
                  const installNo = idx + 1
                  const slabs = slabsMap[installNo] || []
                  const filled = slabs.filter(s => s.from_date && s.to_date && s.charge).length
                  const isDone = slabs.length > 0 && filled === slabs.length
                  return (
                    <button
                      key={installNo}
                      type="button"
                      onClick={() => {
                        const el = document.getElementById(`install-mobile-${installNo}`)
                        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                      }}
                      className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all
                        ${isDone
                          ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30'
                          : slabs.length === 0
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
                            : 'bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30'
                        }`}
                    >
                      #{installNo}
                      {isDone && <Check className="inline w-3 h-3 ml-1" />}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {installments.map((name, idx) => {
            const installNo = idx + 1
            return (
              <div key={installNo} id={`install-mobile-${installNo}`}>
                <InstallmentMobileCard
                  installNo={installNo}
                  installName={name}
                  slabs={slabsMap[installNo] || []}
                  onAdd={handleAddSlab}
                  onDelete={handleDeleteSlab}
                  onChange={handleSlabChange}
                  lateFeeType={lateFeeType}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* ── SUBMIT FOOTER ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm px-5 py-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Progress indicator */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">
                Slabs completed: {filledSlabs} / {totalSlabs}
              </span>
              <span className="text-[12px] font-semibold text-blue-600 dark:text-blue-400">
                {totalSlabs > 0 ? Math.round((filledSlabs / totalSlabs) * 100) : 0}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-500"
                style={{ width: `${totalSlabs > 0 ? (filledSlabs / totalSlabs) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Submit button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl text-[14px] font-bold text-white
              bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
              dark:from-indigo-600 dark:to-purple-600 dark:hover:from-indigo-700 dark:hover:to-purple-700
              shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70
              w-full sm:w-auto flex-shrink-0"
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Submit Late Fee</>
            }
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
