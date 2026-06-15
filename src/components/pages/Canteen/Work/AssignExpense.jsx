/**
 * AssignExpense.jsx
 * Folder: src/pages/Tuckshop/AssignExpense.jsx
 *
 * Converts legacy ASPX "Assign Expense" (Tuckshop module) to fully-responsive React + Tailwind.
 *
 * Workflow (same as ASPX):
 *  1. Select Session -> Class -> Student (or type Registration No with autocomplete)
 *  2. Student details + Debit/Credit balance auto-populate
 *  3. "Debit Balance" button posts a debit transaction against the student
 *  4. Add one or more expense rows (Expense, Amount, Description) via a dynamic grid
 *  5. "Save" persists all added expense rows for the student
 *  6. "Show" opens a modal with the student's expense history (editable/deletable),
 *     plus a totals-by-expense summary table
 *  7. "Reset" clears the form back to defaults
 *
 * Mobile: dynamic grid rows become stacked cards, history modal becomes
 * full-screen with accordion-style expense cards + summary cards.
 * Desktop: dense ERP table layout, modal dialog with two tables.
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Filter, RefreshCw, Eye, Save, Plus, Trash2, Pencil,
  AlertCircle, X, Check, Loader2, ChevronDown, ChevronRight,
  Wallet, CreditCard, User, Calendar, BookOpen,
  SlidersHorizontal, Info, Search,
  Receipt, ClipboardList, Banknote, GraduationCap,
  TrendingDown, TrendingUp, ListChecks
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  { id: 'C1', name: 'Class I' },
  { id: 'C2', name: 'Class II' },
  { id: 'C3', name: 'Class III' },
  { id: 'C6', name: 'Class VI' },
  { id: 'C9', name: 'Class IX' },
  { id: 'C10', name: 'Class X' },
]

const STUDENTS_BY_CLASS = {
  C1: [
    { id: 'S101', reg_no: 'REG-1001', name: 'Aarav Sharma', father: 'Rakesh Sharma', class: 'Class I', debit: 250, credit: 1500 },
    { id: 'S102', reg_no: 'REG-1002', name: 'Diya Verma', father: 'Sanjay Verma', class: 'Class I', debit: 0, credit: 800 },
  ],
  C2: [
    { id: 'S201', reg_no: 'REG-2001', name: 'Kabir Singh', father: 'Manjit Singh', class: 'Class II', debit: 120, credit: 600 },
    { id: 'S202', reg_no: 'REG-2002', name: 'Anaya Gupta', father: 'Vikas Gupta', class: 'Class II', debit: 50, credit: 1200 },
  ],
  C3: [
    { id: 'S301', reg_no: 'REG-3001', name: 'Vivaan Mehta', father: 'Ashok Mehta', class: 'Class III', debit: 300, credit: 900 },
  ],
  C6: [
    { id: 'S601', reg_no: 'REG-6001', name: 'Riya Kapoor', father: 'Sandeep Kapoor', class: 'Class VI', debit: 0, credit: 2000 },
    { id: 'S602', reg_no: 'REG-6002', name: 'Aditya Joshi', father: 'Naresh Joshi', class: 'Class VI', debit: 400, credit: 1100 },
  ],
  C9: [
    { id: 'S901', reg_no: 'REG-9001', name: 'Saanvi Reddy', father: 'Kiran Reddy', class: 'Class IX', debit: 150, credit: 2500 },
  ],
  C10: [
    { id: 'S1001', reg_no: 'REG-10001', name: 'Arjun Nair', father: 'Suresh Nair', class: 'Class X', debit: 75, credit: 1800 },
  ],
}

// Flat list for registration-number autocomplete
const ALL_STUDENTS = Object.values(STUDENTS_BY_CLASS).flat()

const EXPENSE_OPTIONS = [
  { id: 'EXP01', name: 'Tuckshop - Snacks & Beverages' },
  { id: 'EXP02', name: 'Stationery - Notebooks & Pens' },
  { id: 'EXP03', name: 'Library Fine' },
  { id: 'EXP04', name: 'Sports Equipment' },
  { id: 'EXP05', name: 'Lab Material - Science' },
  { id: 'EXP06', name: 'Field Trip Contribution' },
  { id: 'EXP07', name: 'ID Card Replacement' },
  { id: 'EXP08', name: 'Uniform Accessories' },
]

// Sample saved expense history (for "Show" modal) keyed by student id
const EXPENSE_HISTORY = {
  S101: [
    { id: 'H1', registration_no: 'REG-1001', name: 'Aarav Sharma', expense_code: 'EXP01', expense_name: 'Tuckshop - Snacks & Beverages', trans_date: '02 Jun 2026', charges: 60, class_name: 'Class I', description: 'Snacks during recess' },
    { id: 'H2', registration_no: 'REG-1001', name: 'Aarav Sharma', expense_code: 'EXP02', expense_name: 'Stationery - Notebooks & Pens', trans_date: '05 Jun 2026', charges: 120, class_name: 'Class I', description: 'Notebooks for term 2' },
    { id: 'H3', registration_no: 'REG-1001', name: 'Aarav Sharma', expense_code: 'EXP03', expense_name: 'Library Fine', trans_date: '10 Jun 2026', charges: 70, class_name: 'Class I', description: 'Late return of book' },
  ],
  S602: [
    { id: 'H4', registration_no: 'REG-6002', name: 'Aditya Joshi', expense_code: 'EXP04', expense_name: 'Sports Equipment', trans_date: '01 Jun 2026', charges: 300, class_name: 'Class VI', description: 'Cricket kit replacement' },
    { id: 'H5', registration_no: 'REG-6002', name: 'Aditya Joshi', expense_code: 'EXP01', expense_name: 'Tuckshop - Snacks & Beverages', trans_date: '08 Jun 2026', charges: 100, class_name: 'Class VI', description: 'Canteen purchases' },
  ],
}

const todayLabel = () =>
  new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

let rowIdCounter = 1
const newExpenseRow = () => ({ rowId: `row-${rowIdCounter++}`, expense_code: '', amount: '', description: '' })

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

function TextInput({ value, onChange, placeholder, error, disabled, type = 'text', icon: Icon, className = '', ...rest }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'} ${className}`}
        {...rest}
      />
    </div>
  )
}

function TextArea({ value, onChange, placeholder, rows = 2, className = '' }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        border-slate-200 dark:border-[rgba(99,102,241,0.25)] ${className}`}
    />
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} aria-label="Dismiss"><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── STUDENT INFO BANNER ──────────────────────────────────────────────────────
function StudentInfoBanner({ student, date }) {
  if (!student) return null
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Avatar */}
        <div className="flex items-center gap-3">
          <span className="w-12 h-12 rounded-2xl flex items-center justify-center bg-blue-100 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-400 font-bold text-[16px] flex-shrink-0">
            {student.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
          </span>
          <div>
            <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{student.name}</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">{student.reg_no} · {student.class}</p>
          </div>
        </div>

        <div className="hidden sm:block w-px h-10 bg-slate-200 dark:bg-[rgba(99,102,241,0.2)]" />

        {/* Guardian + Date */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-4 flex-1">
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Guardian</p>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{student.father}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">Date</p>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />{date}
            </p>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-shrink-0">
          <div className="rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 px-3 py-2 text-center min-w-[100px]">
            <p className="text-[10px] font-bold uppercase tracking-wide text-rose-600 dark:text-rose-400">Debit Balance</p>
            <p className="text-[18px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">₹{student.debit.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-3 py-2 text-center min-w-[100px]">
            <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">Credit Balance</p>
            <p className="text-[18px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">₹{student.credit.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── EXPENSE ROW (DESKTOP TABLE ROW) ──────────────────────────────────────────
function ExpenseRowDesktop({ row, idx, onChange, onDelete, canDelete }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <NativeSelect
          value={row.expense_code}
          onChange={e => onChange(row.rowId, 'expense_code', e.target.value)}
          placeholder="-- Select Expense --"
          error={row.errors?.expense_code}
        >
          {EXPENSE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
        </NativeSelect>
        {row.errors?.expense_code && (
          <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{row.errors.expense_code}
          </p>
        )}
      </td>
      <td className="px-4 py-3 w-40">
        <TextInput
          type="number"
          value={row.amount}
          onChange={e => onChange(row.rowId, 'amount', e.target.value)}
          placeholder="0.00"
          icon={Banknote}
          error={row.errors?.amount}
        />
        {row.errors?.amount && (
          <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{row.errors.amount}
          </p>
        )}
      </td>
      <td className="px-4 py-3">
        <TextArea
          value={row.description}
          onChange={e => onChange(row.rowId, 'description', e.target.value)}
          placeholder="Add a short note…"
          rows={1}
        />
      </td>
      <td className="px-4 py-3 text-center w-16">
        <button
          type="button"
          onClick={() => onDelete(row.rowId)}
          disabled={!canDelete}
          aria-label="Delete row"
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  )
}

// ─── EXPENSE ROW (MOBILE CARD) ────────────────────────────────────────────────
function ExpenseRowMobile({ row, idx, onChange, onDelete, canDelete }) {
  const selected = EXPENSE_OPTIONS.find(o => o.id === row.expense_code)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          <span className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 flex items-center justify-center text-[11px]">{idx}</span>
          Expense Row
        </span>
        <button
          type="button"
          onClick={() => onDelete(row.rowId)}
          disabled={!canDelete}
          aria-label="Delete row"
          className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
            disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <Field label="Select Expense" required error={row.errors?.expense_code}>
        <NativeSelect
          value={row.expense_code}
          onChange={e => onChange(row.rowId, 'expense_code', e.target.value)}
          placeholder="-- Select Expense --"
          error={row.errors?.expense_code}
        >
          {EXPENSE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
        </NativeSelect>
        {selected && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{selected.name}</p>
        )}
      </Field>

      <Field label="Amount" required error={row.errors?.amount}>
        <TextInput
          type="number"
          value={row.amount}
          onChange={e => onChange(row.rowId, 'amount', e.target.value)}
          placeholder="0.00"
          icon={Banknote}
          error={row.errors?.amount}
        />
      </Field>

      <Field label="Description">
        <TextArea
          value={row.description}
          onChange={e => onChange(row.rowId, 'description', e.target.value)}
          placeholder="Add a short note…"
          rows={2}
        />
      </Field>
    </div>
  )
}

// ─── HISTORY ITEM (for "Show" modal) ──────────────────────────────────────────
function HistoryRowDesktop({ item, idx, editing, onEditStart, onEditCancel, onEditSave, onDelete }) {
  const [draft, setDraft] = useState(item)

  useEffect(() => { setDraft(item) }, [item, editing])

  if (editing) {
    return (
      <tr className="bg-blue-50/60 dark:bg-indigo-500/[0.06] border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
        <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 tabular-nums">{idx}</td>
        <td className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300">{item.registration_no}</td>
        <td className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300">{item.name}</td>
        <td className="px-3 py-2.5">
          <NativeSelect
            value={draft.expense_code}
            onChange={e => {
              const opt = EXPENSE_OPTIONS.find(o => o.id === e.target.value)
              setDraft(d => ({ ...d, expense_code: e.target.value, expense_name: opt?.name || d.expense_name }))
            }}
          >
            {EXPENSE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
          </NativeSelect>
        </td>
        <td className="px-3 py-2.5">
          <TextInput value={draft.trans_date} onChange={e => setDraft(d => ({ ...d, trans_date: e.target.value }))} icon={Calendar} />
        </td>
        <td className="px-3 py-2.5">
          <TextInput type="number" value={draft.charges} onChange={e => setDraft(d => ({ ...d, charges: e.target.value }))} icon={Banknote} />
        </td>
        <td className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300">{item.class_name}</td>
        <td className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300">{item.description}</td>
        <td className="px-3 py-2.5">
          <div className="flex items-center gap-1.5">
            <button onClick={() => onEditSave(draft)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 transition-colors" aria-label="Save">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={onEditCancel} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-colors" aria-label="Cancel">
              <X className="w-4 h-4" />
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{idx}</td>
      <td className="px-3 py-2.5 text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{item.registration_no}</td>
      <td className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.name}</td>
      <td className="px-3 py-2.5 text-[12px] text-slate-700 dark:text-slate-200">{item.expense_name}</td>
      <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{item.trans_date}</td>
      <td className="px-3 py-2.5 text-right">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 tabular-nums">₹{Number(item.charges).toLocaleString()}</span>
      </td>
      <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{item.class_name}</td>
      <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400">{item.description}</td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <button onClick={() => onEditStart(item.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors" aria-label="Edit">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(item.id)} className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 transition-colors" aria-label="Delete">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

function HistoryCardMobile({ item, idx, editing, onEditStart, onEditCancel, onEditSave, onDelete }) {
  const [draft, setDraft] = useState(item)
  useEffect(() => { setDraft(item) }, [item, editing])

  if (editing) {
    return (
      <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50/60 dark:bg-indigo-500/[0.06] p-4 space-y-3">
        <p className="text-[12px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <Pencil className="w-3.5 h-3.5" /> Editing entry #{idx}
        </p>
        <Field label="Expense">
          <NativeSelect
            value={draft.expense_code}
            onChange={e => {
              const opt = EXPENSE_OPTIONS.find(o => o.id === e.target.value)
              setDraft(d => ({ ...d, expense_code: e.target.value, expense_name: opt?.name || d.expense_name }))
            }}
          >
            {EXPENSE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
          </NativeSelect>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Transaction Date">
            <TextInput value={draft.trans_date} onChange={e => setDraft(d => ({ ...d, trans_date: e.target.value }))} icon={Calendar} />
          </Field>
          <Field label="Charge">
            <TextInput type="number" value={draft.charges} onChange={e => setDraft(d => ({ ...d, charges: e.target.value }))} icon={Banknote} />
          </Field>
        </div>
        <div className="flex gap-2 pt-1">
          <button onClick={() => onEditSave(draft)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
            <Check className="w-4 h-4" /> Save
          </button>
          <button onClick={onEditCancel} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 shadow-sm space-y-2.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{item.expense_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3" />{item.trans_date} · {item.class_name}
          </p>
        </div>
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[13px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 tabular-nums flex-shrink-0">
          ₹{Number(item.charges).toLocaleString()}
        </span>
      </div>
      {item.description && (
        <p className="text-[12px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-white/[0.02] rounded-lg px-2.5 py-1.5">{item.description}</p>
      )}
      <div className="flex gap-2 pt-1">
        <button onClick={() => onEditStart(item.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => onDelete(item.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  )
}

// ─── HISTORY / SUMMARY MODAL ───────────────────────────────────────────────────
function HistoryModal({ open, onClose, student, history, setHistory }) {
  const [editingId, setEditingId] = useState(null)

  if (!open) return null

  const handleEditSave = (draft) => {
    setHistory(prev => prev.map(h => h.id === draft.id ? { ...draft, charges: Number(draft.charges) || 0 } : h))
    setEditingId(null)
  }

  const handleDelete = (id) => {
    setHistory(prev => prev.filter(h => h.id !== id))
  }

  // Totals grouped by expense
  const totalsByExpense = useMemo(() => {
    const map = new Map()
    history.forEach(h => {
      const cur = map.get(h.expense_name) || 0
      map.set(h.expense_name, cur + Number(h.charges))
    })
    return Array.from(map.entries()).map(([expense_name, charges]) => ({ expense_name, charges }))
  }, [history])

  const grandTotal = totalsByExpense.reduce((s, r) => s + r.charges, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div
        className="relative w-full sm:max-w-4xl sm:mx-4 bg-white dark:bg-[#161a2e] rounded-t-2xl sm:rounded-2xl shadow-2xl
          max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden"
        style={{ animation: 'modalIn .25s ease' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-indigo-500/10 text-blue-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
              <Receipt className="w-4.5 h-4.5" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Expense History</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 truncate">{student?.name} · {student?.reg_no}</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex-shrink-0">
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Body (scrollable) */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
              <ListChecks className="w-10 h-10 opacity-40" />
              <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">No expense records found</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 text-center max-w-xs">
                Add expense rows above and click Save to start building this student's expense history.
              </p>
            </div>
          ) : (
            <>
              {/* DESKTOP: detail table */}
              <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
                      {['S No', 'I No', 'Name', 'Expense Name', 'Transaction Date', 'Charge', 'Class', 'Description', 'Actions'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item, i) => (
                      <HistoryRowDesktop
                        key={item.id}
                        item={item}
                        idx={i + 1}
                        editing={editingId === item.id}
                        onEditStart={setEditingId}
                        onEditCancel={() => setEditingId(null)}
                        onEditSave={handleEditSave}
                        onDelete={handleDelete}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* MOBILE: cards */}
              <div className="md:hidden space-y-3">
                {history.map((item, i) => (
                  <HistoryCardMobile
                    key={item.id}
                    item={item}
                    idx={i + 1}
                    editing={editingId === item.id}
                    onEditStart={setEditingId}
                    onEditCancel={() => setEditingId(null)}
                    onEditSave={handleEditSave}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Totals summary */}
              <div>
                <p className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-500" /> Total Expense (Debit Balance)
                </p>

                {/* Desktop summary table */}
                <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
                        <th className="px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-12">S No</th>
                        <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Expense Name</th>
                        <th className="px-3 py-2 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Charge</th>
                      </tr>
                    </thead>
                    <tbody>
                      {totalsByExpense.map((row, i) => (
                        <tr key={row.expense_name} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
                          <td className="px-3 py-2 text-center text-[12px] text-slate-400 tabular-nums">{i + 1}</td>
                          <td className="px-3 py-2 text-[12px] text-slate-700 dark:text-slate-200">{row.expense_name}</td>
                          <td className="px-3 py-2 text-right text-[12px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">₹{row.charges.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07]">
                        <td className="px-3 py-2.5" colSpan={2}>
                          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 uppercase">Total</span>
                        </td>
                        <td className="px-3 py-2.5 text-right">
                          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">₹{grandTotal.toLocaleString()}</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Mobile summary cards */}
                <div className="md:hidden space-y-2">
                  {totalsByExpense.map(row => (
                    <div key={row.expense_name} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-white dark:bg-[#1a1f35] px-3.5 py-2.5">
                      <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 flex-1 pr-2">{row.expense_name}</span>
                      <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums flex-shrink-0">₹{row.charges.toLocaleString()}</span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] px-3.5 py-3">
                    <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 uppercase">Total Expense</span>
                    <span className="text-[16px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.12)] flex-shrink-0">
          <button onClick={onClose} className="w-full sm:w-auto sm:ml-auto sm:flex px-5 py-2.5 rounded-xl text-[13px] font-semibold
            bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DEBIT CONFIRMATION MODAL ──────────────────────────────────────────────────
function DebitModal({ open, onClose, student, amount, onConfirm, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#161a2e] rounded-2xl shadow-2xl p-6 text-center"
        style={{ animation: 'modalIn .25s ease' }}>
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-3">
          <TrendingDown className="w-6 h-6" />
        </span>
        <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-1">Confirm Debit Balance</p>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">
          This will post a debit transaction of <span className="font-bold text-rose-600 dark:text-rose-400">₹{Number(amount || 0).toLocaleString()}</span> against <span className="font-semibold text-slate-700 dark:text-slate-200">{student?.name}</span>.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-70 transition-colors">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER (Session / Class / Student / Reg No) ────────────────
function FilterDrawer({ open, onClose, filters, setFilters, students, errors, setErrors, onRegSearch, regSuggestions }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[88vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35]">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Find Student</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={filters.session}
              onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Class">
            <NativeSelect
              value={filters.classId}
              onChange={e => setFilters(p => ({ ...p, classId: e.target.value, studentId: '' }))}
              placeholder="-- Select Class --"
            >
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Student">
            <NativeSelect
              value={filters.studentId}
              onChange={e => setFilters(p => ({ ...p, studentId: e.target.value, regNo: '' }))}
              placeholder="-- Select Student --"
              disabled={!filters.classId}
            >
              {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.reg_no})</option>)}
            </NativeSelect>
          </Field>

          <div className="relative">
            <Field label="Or Enter Registration No">
              <TextInput
                value={filters.regNo}
                onChange={e => onRegSearch(e.target.value)}
                placeholder="e.g. REG-1001"
                icon={Search}
              />
            </Field>
            {regSuggestions.length > 0 && (
              <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] shadow-lg max-h-44 overflow-y-auto">
                {regSuggestions.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setFilters(p => ({ ...p, regNo: s.reg_no, studentId: s.id, classId: Object.keys(STUDENTS_BY_CLASS).find(k => STUDENTS_BY_CLASS[k].some(st => st.id === s.id)) || p.classId }))}
                    className="w-full text-left px-3 py-2 text-[12px] hover:bg-blue-50 dark:hover:bg-indigo-500/10 text-slate-700 dark:text-slate-200 border-b border-slate-50 dark:border-white/5 last:border-0"
                  >
                    <span className="font-semibold">{s.reg_no}</span> — {s.name} ({s.class})
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={onClose}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all">
            <Check className="w-4 h-4" /> Apply
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AssignExpense() {
  const [filters, setFilters] = useState({ session: '', classId: '', studentId: '', regNo: '' })
  const [errors, setErrors] = useState({})
  const [filterOpen, setFilterOpen] = useState(false)
  const [regSuggestions, setRegSuggestions] = useState([])

  const [rows, setRows] = useState([newExpenseRow()])
  const [toast, setToast] = useState(null)
  const [saving, setSaving] = useState(false)

  const [historyOpen, setHistoryOpen] = useState(false)
  const [history, setHistory] = useState([])

  const [debitOpen, setDebitOpen] = useState(false)
  const [debitLoading, setDebitLoading] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Derived: selected student ─────────────────────────────────────────────
  const studentsInClass = useMemo(() => STUDENTS_BY_CLASS[filters.classId] || [], [filters.classId])

  const selectedStudent = useMemo(() => {
    if (filters.studentId) {
      return ALL_STUDENTS.find(s => s.id === filters.studentId) || null
    }
    if (filters.regNo) {
      return ALL_STUDENTS.find(s => s.reg_no.toLowerCase() === filters.regNo.toLowerCase()) || null
    }
    return null
  }, [filters.studentId, filters.regNo])

  // ── Registration No autocomplete (mirrors AutoCompleteExtender) ───────────
  const onRegSearch = useCallback((value) => {
    setFilters(p => ({ ...p, regNo: value, studentId: '' }))
    if (!value) { setRegSuggestions([]); return }
    const matches = ALL_STUDENTS.filter(s => s.reg_no.toLowerCase().includes(value.toLowerCase()))
    setRegSuggestions(matches.slice(0, 6))
  }, [])

  // ── Class change resets student & reg no (ddlclass_SelectedIndexChanged) ──
  const handleClassChange = (classId) => {
    setFilters(p => ({ ...p, classId, studentId: '', regNo: '' }))
    setRegSuggestions([])
  }

  // ── Student change loads details (ddlstudent_SelectedIndexChanged) ────────
  const handleStudentChange = (studentId) => {
    setFilters(p => ({ ...p, studentId, regNo: '' }))
    setRegSuggestions([])
  }

  // Load history when student changes
  useEffect(() => {
    if (selectedStudent) {
      setHistory(EXPENSE_HISTORY[selectedStudent.id] || [])
    } else {
      setHistory([])
    }
  }, [selectedStudent])

  // ── Expense grid handlers ──────────────────────────────────────────────────
  const updateRow = useCallback((rowId, field, value) => {
    setRows(prev => prev.map(r => r.rowId === rowId ? { ...r, [field]: value, errors: { ...r.errors, [field]: undefined } } : r))
  }, [])

  const addRow = () => setRows(prev => [...prev, newExpenseRow()])

  const deleteRow = (rowId) => {
    setRows(prev => prev.length > 1 ? prev.filter(r => r.rowId !== rowId) : prev)
  }

  // ── Validation (mirrors RequiredFieldValidator group "a") ──────────────────
  const validateRows = () => {
    let valid = true
    const next = rows.map(r => {
      const rowErrors = {}
      if (!r.expense_code) { rowErrors.expense_code = 'Enter Expense Name.'; valid = false }
      if (r.amount === '' || r.amount === null) { rowErrors.amount = 'Enter Amount'; valid = false }
      else if (Number(r.amount) <= 0) { rowErrors.amount = 'Amount must be greater than 0'; valid = false }
      return { ...r, errors: rowErrors }
    })
    setRows(next)
    return valid
  }

  // ── Save (btn_submit_Click) ────────────────────────────────────────────────
  const handleSave = () => {
    const next = {}
    if (!filters.session) next.session = 'Please select a session'
    if (!selectedStudent) next.student = 'Please select a student or enter registration no'
    setErrors(next)
    if (Object.keys(next).length) {
      showToast('Please complete the required fields above.', 'error')
      return
    }
    if (!validateRows()) {
      showToast('Please fix the highlighted expense rows.', 'error')
      return
    }

    setSaving(true)
    setTimeout(() => {
      const dateStr = todayLabel()
      const newEntries = rows.map((r, i) => {
        const opt = EXPENSE_OPTIONS.find(o => o.id === r.expense_code)
        return {
          id: `NEW-${Date.now()}-${i}`,
          registration_no: selectedStudent.reg_no,
          name: selectedStudent.name,
          expense_code: r.expense_code,
          expense_name: opt?.name || '',
          trans_date: dateStr,
          charges: Number(r.amount) || 0,
          class_name: selectedStudent.class,
          description: r.description,
        }
      })
      setHistory(prev => [...prev, ...newEntries])
      setRows([newExpenseRow()])
      setSaving(false)
      showToast('Record Updated Successfully!')
    }, 700)
  }

  // ── Debit Balance (btndebitbalance_Click) ──────────────────────────────────
  const totalAmount = useMemo(
    () => rows.reduce((s, r) => s + (Number(r.amount) || 0), 0),
    [rows]
  )

  const openDebitConfirm = () => {
    if (!selectedStudent) {
      setErrors(p => ({ ...p, student: 'Please select a student or enter registration no' }))
      showToast('Select a student first.', 'error')
      return
    }
    if (totalAmount <= 0) {
      showToast('Add an amount before debiting balance.', 'error')
      return
    }
    setDebitOpen(true)
  }

  const confirmDebit = () => {
    setDebitLoading(true)
    setTimeout(() => {
      setDebitLoading(false)
      setDebitOpen(false)
      showToast(`₹${totalAmount.toLocaleString()} debited from ${selectedStudent.name}'s balance.`)
    }, 700)
  }

  // ── Show history (Button8_Click) ───────────────────────────────────────────
  const handleShowHistory = () => {
    if (!selectedStudent) {
      setErrors(p => ({ ...p, student: 'Please select a student or enter registration no' }))
      showToast('Select a student to view history.', 'error')
      return
    }
    setHistoryOpen(true)
  }

  // ── Reset (btnreset_Click) ─────────────────────────────────────────────────
  const handleReset = () => {
    setFilters({ session: '', classId: '', studentId: '', regNo: '' })
    setRows([newExpenseRow()])
    setErrors({})
    setRegSuggestions([])
  }

  const activeFilters = (filters.session ? 1 : 0) + (selectedStudent ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Assign Expense
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tuckshop module — assign expenses to a student and manage debit balance.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Find Student</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-start">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class">
              <NativeSelect
                value={filters.classId}
                onChange={e => handleClassChange(e.target.value)}
                placeholder="-- Select Class --"
              >
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Student" error={errors.student}>
              <NativeSelect
                value={filters.studentId}
                onChange={e => handleStudentChange(e.target.value)}
                placeholder="-- Select Student --"
                disabled={!filters.classId}
                error={errors.student}
              >
                {studentsInClass.map(s => <option key={s.id} value={s.id}>{s.name} ({s.reg_no})</option>)}
              </NativeSelect>
            </Field>

            <div className="relative">
              <Field label="Or Enter Registration No">
                <TextInput
                  value={filters.regNo}
                  onChange={e => onRegSearch(e.target.value)}
                  placeholder="e.g. REG-1001"
                  icon={Search}
                />
              </Field>
              {regSuggestions.length > 0 && (
                <div className="absolute z-10 mt-1 w-full rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] shadow-lg max-h-44 overflow-y-auto">
                  {regSuggestions.map(s => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { setFilters(p => ({ ...p, regNo: s.reg_no, studentId: s.id, classId: Object.keys(STUDENTS_BY_CLASS).find(k => STUDENTS_BY_CLASS[k].some(st => st.id === s.id)) || p.classId })); setRegSuggestions([]) }}
                      className="w-full text-left px-3 py-2 text-[12px] hover:bg-blue-50 dark:hover:bg-indigo-500/10 text-slate-700 dark:text-slate-200 border-b border-slate-50 dark:border-white/5 last:border-0"
                    >
                      <span className="font-semibold">{s.reg_no}</span> — {s.name} ({s.class})
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {selectedStudent ? `${selectedStudent.name}` : 'Find Student'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        <button type="button" onClick={handleReset}
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>
      {errors.student && (
        <p className="sm:hidden flex items-center gap-1 text-[11px] text-rose-500 -mt-2">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.student}
        </p>
      )}

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        students={studentsInClass}
        errors={errors}
        setErrors={setErrors}
        onRegSearch={onRegSearch}
        regSuggestions={regSuggestions}
      />

      {/* ── Student Info + Balances ─────────────────────────────────────────── */}
      <StudentInfoBanner student={selectedStudent} date={todayLabel()} />

      {/* ── Balance Action Bar ───────────────────────────────────────────────── */}
      {selectedStudent && (
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm">
          <p className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            Posting amount of <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">₹{totalAmount.toLocaleString()}</span> from expense rows below.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={openDebitConfirm}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 transition-all active:scale-95">
              <TrendingDown className="w-4 h-4" /> Debit Balance
            </button>
            <button type="button" onClick={handleShowHistory}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-md shadow-blue-500/20 transition-all active:scale-95">
              <Eye className="w-4 h-4" /> Show
            </button>
          </div>
        </div>
      )}

      {/* ── Expense Grid Card ────────────────────────────────────────────────── */}
      {selectedStudent && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Expense Entries</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                {rows.length} row{rows.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button type="button" onClick={addRow}
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20
                transition-all active:scale-95">
              <Plus className="w-4 h-4" /> Add Row
            </button>
          </div>

          {/* DESKTOP TABLE */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S No.', 'Select Expense', 'Amount', 'Description', ''].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <ExpenseRowDesktop
                    key={row.rowId}
                    row={row}
                    idx={i + 1}
                    onChange={updateRow}
                    onDelete={deleteRow}
                    canDelete={rows.length > 1}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden p-4 space-y-3">
            {rows.map((row, i) => (
              <ExpenseRowMobile
                key={row.rowId}
                row={row}
                idx={i + 1}
                onChange={updateRow}
                onDelete={deleteRow}
                canDelete={rows.length > 1}
              />
            ))}
          </div>

          {/* Footer with totals + save */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[13px] text-slate-500 dark:text-slate-400">
              Total amount: <span className="font-bold text-slate-800 dark:text-slate-100 tabular-nums">₹{totalAmount.toLocaleString()}</span>
            </p>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-md shadow-blue-500/20
                transition-all active:scale-95 disabled:opacity-70 w-full sm:w-auto">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!selectedStudent && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600 rounded-2xl border border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center px-4">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No student selected</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm">
              Select a session, class and student — or type a registration number — to load the student's profile and assign expenses.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        student={selectedStudent}
        history={history}
        setHistory={setHistory}
      />
      <DebitModal
        open={debitOpen}
        onClose={() => setDebitOpen(false)}
        student={selectedStudent}
        amount={totalAmount}
        onConfirm={confirmDebit}
        loading={debitLoading}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
