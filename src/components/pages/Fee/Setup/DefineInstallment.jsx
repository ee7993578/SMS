/**
 * DefineInstallment.jsx
 * Folder: src/pages/Fee/DefineInstallment.jsx
 *
 * Converts legacy ASPX "Define Installment" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session dropdown
 *  - Fee Type radio (Regular / Transport / Hostel)
 *  - Installment Type radio (Fee Type Wise / Fee Head Wise)
 *  - Dynamic installment grid (add/delete rows)
 *  - Month multi-select popup (checkbox list)
 *  - Fee Type / Fee Head multi-select popup
 *  - Due date picker
 *  - Submit → saved installments grid
 *  - Mobile: full card-based layout, drawer filters, tab switching
 *  - Desktop: ERP-dense table, sticky headers, inline controls
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  ChevronDown, ChevronRight, Plus, Trash2, Save,
  RefreshCw, AlertCircle, Check, X, Loader2,
  Calendar, CreditCard, Bus, Building2, Hash,
  ListChecks, Filter, SlidersHorizontal, Info,
  CheckSquare, Square, ChevronUp, Eye, FileText,
  IndianRupee, Clock, BookOpen, Layers, Tag,
  LayoutGrid, Table2, ChevronLeft
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const MONTHS = [
  'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March'
]

const FEE_TYPES = {
  Regular:   ['Tuition Fee', 'Admission Fee', 'Exam Fee', 'Sports Fee', 'Lab Fee', 'Library Fee', 'Activity Fee'],
  Transport: ['Bus Fee', 'Van Fee', 'Auto Fee'],
  Hostel:    ['Hostel Fee', 'Mess Fee', 'Laundry Fee', 'Electricity Charge'],
}

const FEE_HEADS = {
  Regular:   ['TF-General', 'TF-Science', 'TF-Commerce', 'AdmFee', 'ExamFee', 'SportsFee', 'LabFee', 'LibFee'],
  Transport: ['BusFee-Zone1', 'BusFee-Zone2', 'VanFee', 'AutoFee'],
  Hostel:    ['HostelFee-AC', 'HostelFee-NonAC', 'MessFee', 'LaundryFee'],
}

// Dummy saved installments for display
const DUMMY_SAVED = [
  { id: 1, session: '2024-25', feeType: 'Regular', installType: 'Fee Type Wise', instNo: 1, feeTypeList: 'Tuition Fee, Exam Fee', months: 'April, May, June', dueDate: '10/04/2024' },
  { id: 2, session: '2024-25', feeType: 'Regular', installType: 'Fee Type Wise', instNo: 2, feeTypeList: 'Tuition Fee, Sports Fee', months: 'July, August, September', dueDate: '10/07/2024' },
  { id: 3, session: '2024-25', feeType: 'Transport', installType: 'Fee Type Wise', instNo: 1, feeTypeList: 'Bus Fee', months: 'April, May, June, July, August, September', dueDate: '05/04/2024' },
]

let rowIdCounter = 100

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const makeRow = () => ({
  id: ++rowIdCounter,
  feeTypeList: [],
  months: [],
  dueDate: '',
})

const FEE_TYPE_ICONS = { Regular: CreditCard, Transport: Bus, Hostel: Building2 }
const FEE_TYPE_COLORS = {
  Regular:   { bg: 'bg-blue-50 dark:bg-blue-500/10',   text: 'text-blue-700 dark:text-blue-300',   border: 'border-blue-200 dark:border-blue-500/25',   active: 'bg-blue-600 text-white' },
  Transport: { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-500/25', active: 'bg-amber-500 text-white' },
  Hostel:    { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/25', active: 'bg-emerald-600 text-white' },
}

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
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3
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

// ─── MULTI-SELECT POPUP ───────────────────────────────────────────────────────
function MultiSelectPopup({ options, selected, onChange, label, triggerClassName = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const toggle = (opt) => {
    onChange(selected.includes(opt) ? selected.filter(s => s !== opt) : [...selected, opt])
  }
  const selectAll = () => onChange([...options])
  const clearAll  = () => onChange([])

  const displayText = selected.length === 0
    ? `Select ${label}…`
    : selected.length <= 2
      ? selected.join(', ')
      : `${selected.slice(0, 2).join(', ')} +${selected.length - 2} more`

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between gap-2 pl-3 pr-2 py-2 text-[12px] rounded-lg border outline-none transition-all text-left
          bg-white dark:bg-[#1e2238]
          border-slate-200 dark:border-[rgba(99,102,241,0.25)]
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:focus:border-indigo-400
          ${triggerClassName}`}
      >
        <span className={`flex-1 truncate ${selected.length === 0 ? 'text-slate-400 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'}`}>
          {displayText}
        </span>
        {selected.length > 0 && (
          <span className="flex-shrink-0 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full mt-1 left-0 z-50 w-full min-w-[200px] max-w-[300px] bg-white dark:bg-[#1e2238] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-xl overflow-hidden">
          {/* Actions */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50 dark:bg-white/[0.02]">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
            <div className="flex gap-2">
              <button type="button" onClick={selectAll} className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold hover:underline">All</button>
              <span className="text-slate-300">|</span>
              <button type="button" onClick={clearAll} className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold hover:underline">Clear</button>
            </div>
          </div>
          {/* Options */}
          <div className="max-h-48 overflow-y-auto py-1">
            {options.map(opt => (
              <button
                key={opt}
                type="button"
                onClick={() => toggle(opt)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
              >
                <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all
                  ${selected.includes(opt)
                    ? 'bg-blue-600 border-blue-600 dark:bg-indigo-500 dark:border-indigo-500'
                    : 'border-slate-300 dark:border-slate-600'}`}>
                  {selected.includes(opt) && <Check className="w-2.5 h-2.5 text-white" />}
                </span>
                <span className="text-[12px] text-slate-700 dark:text-slate-300">{opt}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DATE INPUT ───────────────────────────────────────────────────────────────
function DateInput({ value, onChange, error }) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={onChange}
        className={`w-full pl-3 pr-2 py-2 text-[12px] rounded-lg border outline-none transition-all
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
          ${error ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      />
    </div>
  )
}

// ─── FEE TYPE RADIO BUTTON ────────────────────────────────────────────────────
function FeeTypeTab({ type, active, onClick }) {
  const Icon = FEE_TYPE_ICONS[type]
  const col  = FEE_TYPE_COLORS[type]
  return (
    <button
      type="button"
      onClick={() => onClick(type)}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold border transition-all active:scale-95
        ${active
          ? `${col.active} shadow-md border-transparent`
          : `bg-white dark:bg-[#1a1f35] ${col.text} ${col.border} hover:${col.bg}`
        }`}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {type}
    </button>
  )
}

// ─── INSTALLMENT TYPE TAB ─────────────────────────────────────────────────────
function InstallTypeTab({ value, active, onClick }) {
  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all
        ${active
          ? 'bg-blue-600 text-white dark:bg-indigo-600 shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
        }`}
    >
      {value === 'Fee Type Wise' ? <Tag className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
      {value}
    </button>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopInstallRow({ row, idx, feeType, installType, onUpdate, onDelete }) {
  const items    = installType === 'Fee Type Wise' ? FEE_TYPES[feeType]  || [] : FEE_HEADS[feeType]  || []
  const listLabel = installType === 'Fee Type Wise' ? 'Fee Type' : 'Fee Head'
  const errors   = {}
  if (row.feeTypeList.length === 0) errors.feeTypeList = true
  if (row.months.length === 0)      errors.months      = true
  if (!row.dueDate)                 errors.dueDate     = true

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
      {/* S.No */}
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-[11px] font-bold text-blue-600 dark:text-blue-400">
          {idx}
        </span>
      </td>

      {/* Fee Type / Fee Head */}
      <td className="px-3 py-2.5 min-w-[200px]">
        <MultiSelectPopup
          options={items}
          selected={row.feeTypeList}
          onChange={(v) => onUpdate(row.id, 'feeTypeList', v)}
          label={listLabel}
        />
        {errors.feeTypeList && <p className="text-[10px] text-rose-500 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Required</p>}
      </td>

      {/* Months */}
      <td className="px-3 py-2.5 min-w-[200px]">
        <MultiSelectPopup
          options={MONTHS}
          selected={row.months}
          onChange={(v) => onUpdate(row.id, 'months', v)}
          label="Months"
        />
        {errors.months && <p className="text-[10px] text-rose-500 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Required</p>}
      </td>

      {/* Due Date */}
      <td className="px-3 py-2.5 min-w-[140px]">
        <DateInput
          value={row.dueDate}
          onChange={(e) => onUpdate(row.id, 'dueDate', e.target.value)}
          error={errors.dueDate}
        />
        {errors.dueDate && <p className="text-[10px] text-rose-500 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />Required</p>}
      </td>

      {/* Delete */}
      <td className="px-3 py-2.5 text-center">
        <button
          type="button"
          onClick={() => onDelete(row.id)}
          className="p-2 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE INSTALLMENT CARD ──────────────────────────────────────────────────
function MobileInstallCard({ row, idx, feeType, installType, onUpdate, onDelete }) {
  const items     = installType === 'Fee Type Wise' ? FEE_TYPES[feeType]  || [] : FEE_HEADS[feeType]  || []
  const listLabel = installType === 'Fee Type Wise' ? 'Fee Type' : 'Fee Head'
  const col       = FEE_TYPE_COLORS[feeType]

  return (
    <div className={`rounded-xl border ${col.border} bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm`}>
      {/* Card Header */}
      <div className={`flex items-center justify-between px-4 py-2.5 ${col.bg}`}>
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-bold uppercase tracking-wide ${col.text}`}>
            Installment #{idx}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onDelete(row.id)}
          className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        <Field label={listLabel} required>
          <MultiSelectPopup
            options={items}
            selected={row.feeTypeList}
            onChange={(v) => onUpdate(row.id, 'feeTypeList', v)}
            label={listLabel}
          />
        </Field>

        <Field label="Months" required>
          <MultiSelectPopup
            options={MONTHS}
            selected={row.months}
            onChange={(v) => onUpdate(row.id, 'months', v)}
            label="Months"
          />
        </Field>

        <Field label="Due Date" required>
          <DateInput
            value={row.dueDate}
            onChange={(e) => onUpdate(row.id, 'dueDate', e.target.value)}
          />
        </Field>

        {/* Selected summary */}
        {(row.feeTypeList.length > 0 || row.months.length > 0) && (
          <div className="pt-2 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] space-y-1.5">
            {row.feeTypeList.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {row.feeTypeList.map(f => (
                  <span key={f} className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[10px] font-semibold">
                    {f}
                  </span>
                ))}
              </div>
            )}
            {row.months.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {row.months.map(m => (
                  <span key={m} className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 text-[10px] font-semibold">
                    {m}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── SAVED INSTALLMENTS TABLE ─────────────────────────────────────────────────
function SavedInstallmentsTable({ records }) {
  if (records.length === 0) return null
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
        <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Saved Installments</span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
          {records.length} records
        </span>
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['#', 'Session', 'Fee Type', 'Inst. Type', 'Inst. No', 'Fee Items', 'Months', 'Due Date'].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((rec, i) => {
              const col = FEE_TYPE_COLORS[rec.feeType] || FEE_TYPE_COLORS.Regular
              return (
                <tr key={rec.id} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                  <td className="px-4 py-3 text-center text-[12px] text-slate-400">{i + 1}</td>
                  <td className="px-4 py-3 text-[12px] font-semibold text-slate-700 dark:text-slate-200">{rec.session}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${col.bg} ${col.text}`}>{rec.feeType}</span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-300">{rec.installType}</td>
                  <td className="px-4 py-3 text-center">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[12px] font-bold inline-flex items-center justify-center">
                      {rec.instNo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{rec.feeTypeList}</td>
                  <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-300 max-w-[200px] truncate">{rec.months}</td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 dark:text-slate-200">
                      <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                      {rec.dueDate}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="md:hidden p-3 space-y-2">
        {records.map((rec, i) => {
          const col = FEE_TYPE_COLORS[rec.feeType] || FEE_TYPE_COLORS.Regular
          return (
            <div key={rec.id} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-white dark:bg-[#1e2238] overflow-hidden">
              <div className={`flex items-center justify-between px-3 py-2 ${col.bg}`}>
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-bold ${col.text}`}>{rec.feeType}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span className="text-[11px] text-slate-500">Installment #{rec.instNo}</span>
                </div>
                <span className="text-[11px] font-semibold text-slate-500">{rec.session}</span>
              </div>
              <div className="p-3 space-y-1.5">
                <div className="flex items-start gap-2">
                  <Tag className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[12px] text-slate-600 dark:text-slate-300">{rec.feeTypeList}</span>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-[12px] text-slate-600 dark:text-slate-300">{rec.months}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                  <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{rec.dueDate}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineInstallment() {
  // ── State ───────────────────────────────────────────────────────────────────
  const [session,     setSession]     = useState('')
  const [feeType,     setFeeType]     = useState('Regular')
  const [installType, setInstallType] = useState('Fee Type Wise')
  const [rows,        setRows]        = useState([makeRow()])
  const [savedRecords,setSavedRecords]= useState(DUMMY_SAVED)
  const [loading,     setLoading]     = useState(false)
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [activeTab,   setActiveTab]   = useState('define') // 'define' | 'saved'
  const [filterOpen,  setFilterOpen]  = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Row CRUD ────────────────────────────────────────────────────────────────
  const addRow = useCallback(() => {
    setRows(prev => [...prev, makeRow()])
  }, [])

  const deleteRow = useCallback((id) => {
    setRows(prev => {
      if (prev.length === 1) { showToast('At least one installment row is required.', 'error'); return prev }
      return prev.filter(r => r.id !== id)
    })
  }, [])

  const updateRow = useCallback((id, field, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r))
  }, [])

  // When fee type or install type changes, reset row selections
  const handleFeeTypeChange = (type) => {
    setFeeType(type)
    setRows(prev => prev.map(r => ({ ...r, feeTypeList: [] })))
  }
  const handleInstallTypeChange = (type) => {
    setInstallType(type)
    setRows(prev => prev.map(r => ({ ...r, feeTypeList: [] })))
  }

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    let rowErrs = false
    rows.forEach(r => {
      if (r.feeTypeList.length === 0 || r.months.length === 0 || !r.dueDate) rowErrs = true
    })
    if (rowErrs) err.rows = 'Please fill all installment details'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) { showToast('Please fix errors before submitting.', 'error'); return }
    setLoading(true)
    setTimeout(() => {
      const newRecords = rows.map((r, i) => ({
        id: Date.now() + i,
        session,
        feeType,
        installType,
        instNo: savedRecords.filter(s => s.session === session && s.feeType === feeType).length + i + 1,
        feeTypeList: r.feeTypeList.join(', '),
        months: r.months.join(', '),
        dueDate: r.dueDate ? new Date(r.dueDate).toLocaleDateString('en-IN') : '',
      }))
      setSavedRecords(prev => [...prev, ...newRecords])
      setRows([makeRow()])
      setLoading(false)
      setActiveTab('saved')
      showToast(`${rows.length} installment(s) saved successfully!`)
    }, 800)
  }

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession(''); setRows([makeRow()]); setErrors({})
    setFeeType('Regular'); setInstallType('Fee Type Wise')
  }

  const colCurrent = FEE_TYPE_COLORS[feeType]

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <IndianRupee className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Installment
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Configure fee installments — session, type, months &amp; due dates.
          </p>
        </div>

        {/* Desktop Tab Switcher */}
        <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          <button
            type="button"
            onClick={() => setActiveTab('define')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all
              ${activeTab === 'define' ? 'bg-white dark:bg-[#1a1f35] text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            <ListChecks className="w-3.5 h-3.5" /> Define
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all
              ${activeTab === 'saved' ? 'bg-white dark:bg-[#1a1f35] text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
          >
            <Eye className="w-3.5 h-3.5" /> Saved
            {savedRecords.length > 0 && (
              <span className="bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {savedRecords.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Tab Bar ────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        <button
          type="button"
          onClick={() => setActiveTab('define')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold transition-all
            ${activeTab === 'define' ? 'bg-white dark:bg-[#1a1f35] text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <ListChecks className="w-4 h-4" /> Define Installment
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('saved')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[12px] font-semibold transition-all
            ${activeTab === 'saved' ? 'bg-white dark:bg-[#1a1f35] text-slate-800 dark:text-slate-100 shadow-sm' : 'text-slate-500 dark:text-slate-400'}`}
        >
          <Eye className="w-4 h-4" /> Saved
          {savedRecords.length > 0 && (
            <span className="ml-1 bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {savedRecords.length}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/*  TAB: DEFINE                                                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'define' && (
        <>
          {/* ── Config Card (Session + Fee Type + Install Type) ──────────── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-visible">

            {/* Card Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Configuration</span>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
              >
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Row 1: Session */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <Field label="Academic Session" error={errors.session} required>
                  <NativeSelect
                    value={session}
                    onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                    placeholder="-- Select Session --"
                    error={!!errors.session}
                  >
                    {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </NativeSelect>
                </Field>
              </div>

              {/* Row 2: Fee Type */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5">
                  Fee Type <span className="text-rose-500">*</span>
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Regular', 'Transport', 'Hostel'].map(t => (
                    <FeeTypeTab key={t} type={t} active={feeType === t} onClick={handleFeeTypeChange} />
                  ))}
                </div>
              </div>

              {/* Row 3: Installment Type */}
              <div>
                <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2.5">
                  Installment Type <span className="text-rose-500">*</span>
                </p>
                <div className="flex gap-2">
                  {['Fee Type Wise', 'Fee Head Wise'].map(t => (
                    <InstallTypeTab key={t} value={t} active={installType === t} onClick={handleInstallTypeChange} />
                  ))}
                </div>
              </div>

              {/* Current Selection Summary */}
              {session && (
                <div className={`flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl border ${colCurrent.border} ${colCurrent.bg}`}>
                  <Info className={`w-4 h-4 flex-shrink-0 ${colCurrent.text}`} />
                  <span className={`text-[12px] font-semibold ${colCurrent.text}`}>
                    Session: <strong>{session}</strong>
                    &nbsp;·&nbsp; Fee Type: <strong>{feeType}</strong>
                    &nbsp;·&nbsp; Type: <strong>{installType}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Installments Grid Card ─────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-visible">

            {/* Card Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
                Installment Details
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                {rows.length} row{rows.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Info hint */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Each row = one installment. Select fee items, months covered &amp; due date. Click + to add more installments.
              </p>
            </div>

            {/* ── DESKTOP TABLE ─────────────────────────────────────────── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', installType === 'Fee Type Wise' ? 'Fee Type' : 'Fee Head', 'Month(s)', 'Due Date', 'Action'].map((h, i) => (
                      <th key={i} className={`px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                        ${i === 0 || i === 4 ? 'text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => (
                    <DesktopInstallRow
                      key={row.id}
                      row={row}
                      idx={i + 1}
                      feeType={feeType}
                      installType={installType}
                      onUpdate={updateRow}
                      onDelete={deleteRow}
                    />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                    <td colSpan={5} className="px-3 py-3">
                      <button
                        type="button"
                        onClick={addRow}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold
                          bg-blue-50 text-blue-700 hover:bg-blue-100
                          dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20
                          border border-blue-200 dark:border-blue-500/25 border-dashed
                          transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" /> Add Installment
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* ── MOBILE CARDS ──────────────────────────────────────────── */}
            <div className="md:hidden p-4 space-y-3">
              {rows.map((row, i) => (
                <MobileInstallCard
                  key={row.id}
                  row={row}
                  idx={i + 1}
                  feeType={feeType}
                  installType={installType}
                  onUpdate={updateRow}
                  onDelete={deleteRow}
                />
              ))}
              <button
                type="button"
                onClick={addRow}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                  bg-blue-50 text-blue-700 hover:bg-blue-100
                  dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20
                  border-2 border-dashed border-blue-200 dark:border-blue-500/25
                  transition-all active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Another Installment
              </button>
            </div>

            {/* Row errors */}
            {errors.rows && (
              <div className="mx-5 mb-3 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-700 dark:text-rose-400 text-[12px] font-semibold">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {errors.rows}
              </div>
            )}
          </div>

          {/* ── Submit Footer ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm px-5 py-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[12px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-slate-700 dark:text-slate-200">{rows.length} installment{rows.length !== 1 ? 's' : ''}</span>
                  {' '}ready to save
                  {session ? ` for Session ${session}` : ''}.
                  {' '}All fields are required.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                    bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
                    transition-colors active:scale-95"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                    bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                    shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {loading ? 'Saving…' : 'Save Installments'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/*  TAB: SAVED                                                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'saved' && (
        <>
          {savedRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400 dark:text-slate-600">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileText className="w-7 h-7 opacity-50" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No saved installments yet</p>
                <p className="text-[12px] text-slate-400 mt-1">Define and save installments to see them here.</p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('define')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" /> Define Installments
              </button>
            </div>
          ) : (
            <SavedInstallmentsTable records={savedRecords} />
          )}
        </>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
