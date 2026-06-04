/**
 * DefineConcessionValue.jsx
 * Folder: src/pages/Fee/DefineConcessionValue.jsx
 *
 * React port of define_concession_value.aspx
 * — Concession Group Detail page
 *
 * Workflow:
 *  1. Select Fee Type (Regular / Transport)
 *  2. Select Session
 *  3. Select Concession Group
 *  4. [Transport only] Enter value + Fix/Per type
 *  5. Submit → installment-wise, fee-head-wise grid appears
 *  6. Edit per-head concession type (Fix/Per) + value
 *  7. Save
 */

import { useState, useMemo, useCallback } from 'react'
import {
  ChevronDown, AlertCircle, X, Check, Loader2,
  SlidersHorizontal, Save, RefreshCw, Eye,
  Receipt, Bus, School, Layers, IndianRupee,
  Percent, Hash, ChevronRight, ChevronUp,
  Info, Sparkles, BookOpen, Banknote,
} from 'lucide-react'

// ─── DUMMY DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26', '2026-27']

const CONCESSION_GROUPS = [
  { id: '1', label: 'Staff Ward' },
  { id: '2', label: 'SC/ST Students' },
  { id: '3', label: 'Freedom Fighter Ward' },
  { id: '4', label: 'Sibling Concession' },
  { id: '5', label: 'Merit Scholar' },
  { id: '6', label: 'BPL Category' },
]

// installment-wise fee heads for Regular
const REGULAR_INSTALLMENT_DATA = [
  {
    installment_no: 1,
    label: 'April – June',
    heads: [
      { fee_head_id: 'h1', fee_head: 'Tuition Fee',        fee_type_id: '1', con_type: 'Fix', con_value: '' },
      { fee_head_id: 'h2', fee_head: 'Development Fund',   fee_type_id: '1', con_type: 'Per', con_value: '' },
      { fee_head_id: 'h3', fee_head: 'Library Charges',    fee_type_id: '1', con_type: 'Fix', con_value: '' },
      { fee_head_id: 'h4', fee_head: 'Lab Charges',        fee_type_id: '1', con_type: 'Per', con_value: '' },
    ],
  },
  {
    installment_no: 2,
    label: 'July – September',
    heads: [
      { fee_head_id: 'h1', fee_head: 'Tuition Fee',        fee_type_id: '1', con_type: 'Fix', con_value: '' },
      { fee_head_id: 'h2', fee_head: 'Development Fund',   fee_type_id: '1', con_type: 'Per', con_value: '' },
      { fee_head_id: 'h3', fee_head: 'Library Charges',    fee_type_id: '1', con_type: 'Fix', con_value: '' },
      { fee_head_id: 'h5', fee_head: 'Sports Fee',         fee_type_id: '1', con_type: 'Per', con_value: '' },
    ],
  },
  {
    installment_no: 3,
    label: 'October – December',
    heads: [
      { fee_head_id: 'h1', fee_head: 'Tuition Fee',        fee_type_id: '1', con_type: 'Fix', con_value: '' },
      { fee_head_id: 'h2', fee_head: 'Development Fund',   fee_type_id: '1', con_type: 'Per', con_value: '' },
      { fee_head_id: 'h6', fee_head: 'Annual Charges',     fee_type_id: '1', con_type: 'Fix', con_value: '' },
    ],
  },
  {
    installment_no: 4,
    label: 'January – March',
    heads: [
      { fee_head_id: 'h1', fee_head: 'Tuition Fee',        fee_type_id: '1', con_type: 'Fix', con_value: '' },
      { fee_head_id: 'h2', fee_head: 'Development Fund',   fee_type_id: '1', con_type: 'Per', con_value: '' },
      { fee_head_id: 'h7', fee_head: 'Exam Fee',           fee_type_id: '1', con_type: 'Fix', con_value: '' },
    ],
  },
]

// installment data for Transport
const TRANSPORT_INSTALLMENT_DATA = [
  {
    installment_no: 1,
    label: 'April – June',
    heads: [
      { fee_head_id: 'th1', fee_head: 'Transport Charges', fee_type_id: '6', con_type: 'Fix', con_value: '' },
      { fee_head_id: 'th2', fee_head: 'Fuel Surcharge',    fee_type_id: '6', con_type: 'Per', con_value: '' },
    ],
  },
  {
    installment_no: 2,
    label: 'July – September',
    heads: [
      { fee_head_id: 'th1', fee_head: 'Transport Charges', fee_type_id: '6', con_type: 'Fix', con_value: '' },
      { fee_head_id: 'th2', fee_head: 'Fuel Surcharge',    fee_type_id: '6', con_type: 'Per', con_value: '' },
    ],
  },
  {
    installment_no: 3,
    label: 'October – December',
    heads: [
      { fee_head_id: 'th1', fee_head: 'Transport Charges', fee_type_id: '6', con_type: 'Fix', con_value: '' },
    ],
  },
  {
    installment_no: 4,
    label: 'January – March',
    heads: [
      { fee_head_id: 'th1', fee_head: 'Transport Charges', fee_type_id: '6', con_type: 'Fix', con_value: '' },
      { fee_head_id: 'th3', fee_head: 'Annual Maintenance', fee_type_id: '6', con_type: 'Per', con_value: '' },
    ],
  },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

/** Deep-clone installment data so each submit starts fresh */
const cloneInstallments = (data) =>
  data.map((inst) => ({
    ...inst,
    heads: inst.heads.map((h) => ({ ...h, con_value: '' })),
  }))

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
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
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

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
          <Info className="w-3 h-3 flex-shrink-0" />{hint}
        </p>
      )}
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

// ─── FEE TYPE TOGGLE ─────────────────────────────────────────────────────────

function FeeTypeToggle({ value, onChange }) {
  return (
    <div className="flex gap-2">
      {[
        { val: 'regular',   label: 'Regular',   Icon: School },
        { val: 'transport', label: 'Transport',  Icon: Bus },
      ].map(({ val, label, Icon }) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold border transition-all
            ${value === val
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 dark:bg-indigo-600 dark:border-indigo-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50 dark:bg-[#1e2238] dark:text-slate-300 dark:border-[rgba(99,102,241,0.25)] dark:hover:bg-indigo-500/10'
            }`}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── CONCESSION TYPE PILLS ────────────────────────────────────────────────────

function ConTypePills({ value, onChange }) {
  return (
    <div className="flex gap-1.5">
      {['Fix', 'Per'].map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all
            ${value === opt
              ? opt === 'Fix'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-500/20'
                : 'bg-violet-600 text-white border-violet-600 shadow-sm shadow-violet-500/20'
              : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 dark:bg-slate-800/60 dark:text-slate-400 dark:border-slate-700'
            }`}
        >
          {opt === 'Fix' ? <IndianRupee className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
          {opt}
        </button>
      ))}
    </div>
  )
}

// ─── VALUE INPUT ──────────────────────────────────────────────────────────────

function ValueInput({ value, onChange, conType, placeholder }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[12px] font-bold pointer-events-none">
        {conType === 'Fix' ? '₹' : '%'}
      </span>
      <input
        type="text"
        inputMode="decimal"
        value={value}
        onChange={(e) => {
          const v = e.target.value.replace(/[^0-9.]/g, '')
          onChange(v)
        }}
        placeholder={placeholder || '0'}
        className="w-full pl-7 pr-3 py-1.5 text-[13px] rounded-lg border outline-none transition-all tabular-nums
          bg-white text-slate-800 border-slate-200 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
          dark:placeholder-slate-600 dark:focus:border-indigo-400"
      />
    </div>
  )
}

// ─── INSTALLMENT CARD (Mobile) ────────────────────────────────────────────────

function InstallmentCardMobile({ inst, instIdx, onTypeChange, onValueChange }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-indigo-500/[0.06] dark:to-violet-500/[0.03] hover:from-blue-100/60 transition-colors"
      >
        <span className="w-8 h-8 rounded-xl bg-blue-600 dark:bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/30">
          <span className="text-[11px] font-bold text-white">#{inst.installment_no}</span>
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
            Installment {inst.installment_no}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{inst.label} · {inst.heads.length} fee heads</p>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>

      {/* Body */}
      {open && (
        <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.08)]">
          {inst.heads.map((head, hIdx) => (
            <div key={head.fee_head_id} className="px-4 py-3.5">
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-blue-400 dark:bg-indigo-400 flex-shrink-0 mt-0.5" />
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{head.fee_head}</span>
                </div>
                <ConTypePills
                  value={head.con_type}
                  onChange={(val) => onTypeChange(instIdx, hIdx, val)}
                />
              </div>
              <ValueInput
                value={head.con_value}
                onChange={(val) => onValueChange(instIdx, hIdx, val)}
                conType={head.con_type}
                placeholder={head.con_type === 'Fix' ? 'Enter amount' : 'Enter %'}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── INSTALLMENT TABLE (Desktop) ─────────────────────────────────────────────

function InstallmentTableDesktop({ inst, instIdx, onTypeChange, onValueChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-50/60 to-indigo-50/30 dark:from-indigo-500/[0.06] dark:to-transparent border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)]">
        <span className="w-9 h-9 rounded-xl bg-blue-600 dark:bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm shadow-blue-500/30">
          <span className="text-[12px] font-bold text-white">#{inst.installment_no}</span>
        </span>
        <div>
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Installment {inst.installment_no}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{inst.label}</p>
        </div>
        <span className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-300">
          {inst.heads.length} heads
        </span>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] bg-slate-50/40 dark:bg-white/[0.015]">
            <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fee Head</th>
            <th className="px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-48">Concession Type</th>
            <th className="px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-44">Value</th>
          </tr>
        </thead>
        <tbody>
          {inst.heads.map((head, hIdx) => (
            <tr key={head.fee_head_id} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
              {/* Fee Head */}
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />
                  </span>
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{head.fee_head}</span>
                </div>
              </td>
              {/* Type */}
              <td className="px-5 py-3 text-center">
                <div className="flex justify-center">
                  <ConTypePills
                    value={head.con_type}
                    onChange={(val) => onTypeChange(instIdx, hIdx, val)}
                  />
                </div>
              </td>
              {/* Value */}
              <td className="px-5 py-3">
                <ValueInput
                  value={head.con_value}
                  onChange={(val) => onValueChange(instIdx, hIdx, val)}
                  conType={head.con_type}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── SUMMARY STRIP ────────────────────────────────────────────────────────────

function SummaryStrip({ feeType, session, group }) {
  const groupLabel = CONCESSION_GROUPS.find((g) => g.id === group)?.label || '—'
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50/60 dark:bg-emerald-500/[0.05]">
      <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
      <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
        Editing concession for:
      </span>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-200">
          {feeType === 'regular' ? <School className="w-3.5 h-3.5" /> : <Bus className="w-3.5 h-3.5" />}
          {feeType === 'regular' ? 'Regular' : 'Transport'}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-200">
          <Layers className="w-3.5 h-3.5" />{session}
        </span>
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-200">
          <Receipt className="w-3.5 h-3.5" />{groupLabel}
        </span>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function DefineConcessionValue() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [feeType,          setFeeType]          = useState('regular')   // 'regular' | 'transport'
  const [session,          setSession]          = useState('')
  const [concessionGroup,  setConcessionGroup]  = useState('')

  // Transport-only fields
  const [transportValue,   setTransportValue]   = useState('')
  const [transportConType, setTransportConType] = useState('Fix')       // 'Fix' | 'Per'

  // ── Grid state ────────────────────────────────────────────────────────────
  const [gridData,  setGridData]  = useState([])    // installment[] with editable heads
  const [gridShown, setGridShown] = useState(false)
  const [shownMeta, setShownMeta] = useState({})    // snapshot of filter at time of submit

  // ── UI state ──────────────────────────────────────────────────────────────
  const [loading,  setLoading]  = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [errors,   setErrors]   = useState({})
  const [toast,    setToast]    = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fee type change → reset grid ─────────────────────────────────────────
  const handleFeeTypeChange = (val) => {
    setFeeType(val)
    setGridData([])
    setGridShown(false)
    setTransportValue('')
    setTransportConType('Fix')
    setErrors({})
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!session)        err.session = 'Please select a session'
    if (!concessionGroup) err.group  = 'Please select a concession group'
    if (feeType === 'transport' && !transportValue.trim())
      err.transportValue = 'Enter a concession value for transport'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Submit (show grid) ────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setGridShown(false)

    // Simulate API fetch
    setTimeout(() => {
      const src = feeType === 'transport' ? TRANSPORT_INSTALLMENT_DATA : REGULAR_INSTALLMENT_DATA
      const fresh = cloneInstallments(src)

      // If transport with a global value, pre-fill all heads
      if (feeType === 'transport' && transportValue) {
        fresh.forEach((inst) => {
          inst.heads.forEach((h) => {
            h.con_type  = transportConType
            h.con_value = transportValue
          })
        })
      }

      setGridData(fresh)
      setShownMeta({ feeType, session, concessionGroup })
      setGridShown(true)
      setLoading(false)
      showToast('Concession grid loaded. Edit values and save.')
    }, 700)
  }, [feeType, session, concessionGroup, transportValue, transportConType])

  // ── Grid cell updates ─────────────────────────────────────────────────────
  const handleTypeChange = useCallback((instIdx, hIdx, val) => {
    setGridData((prev) => {
      const next = prev.map((inst, i) =>
        i !== instIdx ? inst : {
          ...inst,
          heads: inst.heads.map((h, j) =>
            j !== hIdx ? h : { ...h, con_type: val }
          ),
        }
      )
      return next
    })
  }, [])

  const handleValueChange = useCallback((instIdx, hIdx, val) => {
    setGridData((prev) => {
      const next = prev.map((inst, i) =>
        i !== instIdx ? inst : {
          ...inst,
          heads: inst.heads.map((h, j) =>
            j !== hIdx ? h : { ...h, con_value: val }
          ),
        }
      )
      return next
    })
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    // Validate all values filled
    const missing = gridData.some((inst) => inst.heads.some((h) => !h.con_value.trim()))
    if (missing) {
      showToast('Please fill in all concession values before saving.', 'error')
      return
    }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast('Concession values saved successfully!')
      // TODO: POST to API
    }, 900)
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFeeType('regular')
    setSession('')
    setConcessionGroup('')
    setTransportValue('')
    setTransportConType('Fix')
    setGridData([])
    setGridShown(false)
    setErrors({})
  }

  // ── Filled heads count (for progress pill) ────────────────────────────────
  const { filled, total } = useMemo(() => {
    if (!gridData.length) return { filled: 0, total: 0 }
    const allHeads = gridData.flatMap((i) => i.heads)
    return {
      filled: allHeads.filter((h) => h.con_value.trim() !== '').length,
      total:  allHeads.length,
    }
  }, [gridData])

  const progressPct = total ? Math.round((filled / total) * 100) : 0

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Concession Group Detail
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Define installment-wise concession values for each fee head.
          </p>
        </div>

        {gridShown && (
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
              {filled}/{total} filled
            </span>
            <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full rounded-full bg-blue-500 dark:bg-indigo-500 transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={`text-[12px] font-bold tabular-nums ${progressPct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
              {progressPct}%
            </span>
          </div>
        )}
      </div>

      {/* ── Filter Card ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Select Parameters</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Row 1: Fee Type */}
          <Field label="Fee Type" required>
            <FeeTypeToggle value={feeType} onChange={handleFeeTypeChange} />
          </Field>

          {/* Row 2: Session + Group */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={(e) => { setSession(e.target.value); setErrors((p) => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Concession Group" error={errors.group} required>
              <NativeSelect
                value={concessionGroup}
                onChange={(e) => { setConcessionGroup(e.target.value); setErrors((p) => ({ ...p, group: undefined })) }}
                placeholder="-- Select Group --"
                error={errors.group}
              >
                {CONCESSION_GROUPS.map((g) => <option key={g.id} value={g.id}>{g.label}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Row 3: Transport-only panel */}
          {feeType === 'transport' && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-500/25 bg-amber-50/50 dark:bg-amber-500/[0.06] p-4">
              <div className="flex items-center gap-2 mb-3">
                <Bus className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span className="text-[13px] font-bold text-amber-700 dark:text-amber-300">
                  Transport Concession — Global Value
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field
                  label="Concession Value"
                  error={errors.transportValue}
                  required
                  hint="This value will be pre-filled for all transport installments"
                >
                  <ValueInput
                    value={transportValue}
                    onChange={setTransportValue}
                    conType={transportConType}
                    placeholder={transportConType === 'Fix' ? 'Enter fixed amount' : 'Enter percentage'}
                  />
                </Field>
                <Field label="Concession Type" required>
                  <div className="flex items-center h-[34px]">
                    <ConTypePills value={transportConType} onChange={setTransportConType} />
                  </div>
                </Field>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 sm:flex-none sm:px-6 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Concession Grid
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-4">
          <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Concession Grid ───────────────────────────────────────────────── */}
      {gridShown && !loading && (
        <>
          {/* Summary strip */}
          <SummaryStrip
            feeType={shownMeta.feeType}
            session={shownMeta.session}
            group={shownMeta.concessionGroup}
          />

          {/* Info tip — mobile */}
          <div className="flex sm:hidden items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/[0.06] border border-blue-100 dark:border-blue-500/15">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-300">
              Tap any card to expand/collapse. Fill all values then tap <strong>Save</strong>.
            </p>
          </div>

          {/* ── MOBILE: stacked accordion cards ── */}
          <div className="sm:hidden space-y-3">
            {gridData.map((inst, instIdx) => (
              <InstallmentCardMobile
                key={inst.installment_no}
                inst={inst}
                instIdx={instIdx}
                onTypeChange={handleTypeChange}
                onValueChange={handleValueChange}
              />
            ))}
          </div>

          {/* ── DESKTOP: table per installment ── */}
          <div className="hidden sm:block space-y-4">
            {gridData.map((inst, instIdx) => (
              <InstallmentTableDesktop
                key={inst.installment_no}
                inst={inst}
                instIdx={instIdx}
                onTypeChange={handleTypeChange}
                onValueChange={handleValueChange}
              />
            ))}
          </div>

          {/* ── Save Section ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm">
            <div className="p-5">
              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-[12px] mb-1.5">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    Completion Progress
                  </span>
                  <span className={`font-bold tabular-nums ${progressPct === 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-blue-600 dark:text-indigo-400'}`}>
                    {filled}/{total} values filled ({progressPct}%)
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${progressPct === 100 ? 'bg-emerald-500' : 'bg-blue-500 dark:bg-indigo-500'}`}
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {progressPct === 100 && (
                  <p className="flex items-center gap-1.5 mt-2 text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    <Check className="w-3.5 h-3.5" />
                    All concession values filled — ready to save!
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex-1 sm:flex-none sm:px-8 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
                    bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25
                    transition-all active:scale-95 disabled:opacity-70"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Concession Values
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setGridData(cloneInstallments(
                      feeType === 'transport' ? TRANSPORT_INSTALLMENT_DATA : REGULAR_INSTALLMENT_DATA
                    ))
                    showToast('All values cleared.', 'error')
                  }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[13px] font-semibold
                    bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100
                    dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/25 dark:hover:bg-rose-500/15
                    transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!gridShown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Banknote className="w-7 h-7 opacity-40" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No concession grid loaded</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select fee type, session, and concession group, then click{' '}
              <strong className="text-blue-600 dark:text-indigo-400">Show Concession Grid</strong> to begin.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
