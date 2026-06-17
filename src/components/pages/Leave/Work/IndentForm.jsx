/**
 * IndentForm.jsx
 * Folder: src/pages/Leave/IndentForm.jsx
 *
 * Converts legacy ASPX "Indent Form" (Leave/Indentform.aspx) to fully-responsive
 * React + Tailwind, reusing the same design system / primitives as the
 * StrengthReport reference (Field, NativeSelect, Toast, color tokens, dark mode).
 *
 * Original ASPX behaviour preserved:
 *  - "Indent By" shows the logged-in user, read-only
 *  - "HOD / Concern Authority" dropdown (AutoPostBack -> updates approval card)
 *  - "Indent Date" + "Stock availability" remark
 *  - Dynamic item grid: Item Description, Qty, Price -> auto-calculated
 *    Total Amount per row, Department, Reason/Purpose
 *  - Per-row Add / Delete (every row can spawn a new row or remove itself,
 *    same as the legacy GridView template fields)
 *  - Grand total of all rows
 *  - Three-stage approval strip: Indent By -> HOD/Concern Authority -> Principal
 *  - Submit with client-side validation (same spirit as the old `validate()`)
 *
 * Desktop: dense editable ERP-style table.
 * Mobile: stacked editable cards, sticky submit bar, no horizontal scroll.
 */

import { useState, useMemo, useCallback } from 'react'
import {
  ClipboardList, User, Building2, CalendarDays, Boxes, ListChecks,
  Plus, Trash2, IndianRupee, Send, RefreshCw, CheckCircle2, Clock,
  XCircle, AlertCircle, X, Check, Loader2, ChevronDown, ChevronRight, Hash,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────
const CURRENT_USER = { name: 'Rahul Sharma', empId: 'EMP-1024', designation: 'Junior Clerk' }

const HOD_OPTIONS = [
  { value: 'admin',     label: 'Mr. A.K. Verma — Administration' },
  { value: 'academics', label: 'Mrs. S. Kapoor — Academics' },
  { value: 'sports',    label: 'Mr. R. Singh — Sports Dept.' },
  { value: 'science',   label: 'Dr. N. Mehta — Science Dept.' },
  { value: 'accounts',  label: 'Mr. P. Joshi — Accounts' },
]

const PRINCIPAL_NAME = 'Dr. V. Shukla — Principal'

let rowIdCounter = 1
const emptyItem = () => ({
  id: rowIdCounter++,
  itemdesc: '',
  itemqty: '',
  price: '',
  department: '',
  reason_purpose: '',
})

// ─── PRIMITIVE COMPONENTS (shared visual language) ─────────────────────────

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

function Input({ value, onChange, placeholder, type = 'text', disabled, error, icon: Icon, min, step }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        step={step}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-60 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-[#161a2c]
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      />
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

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button type="button" onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SECTION CARD WRAPPER ──────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, badge, action, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] flex-wrap">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
        {badge && (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
            {badge}
          </span>
        )}
        {action && <div className="ml-auto">{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

// ─── APPROVAL STEP ──────────────────────────────────────────────────────────
const STATUS_CFG = {
  submitted: { Icon: CheckCircle2, badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',     text: 'Submitted' },
  pending:   { Icon: Clock,        badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', text: 'Pending' },
  approved:  { Icon: CheckCircle2, badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', text: 'Approved' },
  rejected:  { Icon: XCircle,      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',     text: 'Rejected' },
}

function ApprovalStep({ icon: Icon, label, name, status }) {
  const cfg = STATUS_CFG[status]
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 truncate">{label}</p>
        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{name || 'Not selected yet'}</p>
      </div>
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold flex-shrink-0 ${cfg.badge}`}>
        <cfg.Icon className="w-3 h-3" /> {cfg.text}
      </span>
    </div>
  )
}

// ─── DESKTOP ITEM ROW ───────────────────────────────────────────────────────
function DesktopItemRow({ item, idx, onChange, onAdd, onDelete, canDelete, errors }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors align-top">
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>
      <td className="px-3 py-3 min-w-[180px]">
        <Input value={item.itemdesc} onChange={e => onChange('itemdesc', e.target.value)} placeholder="e.g. A4 paper ream" error={errors.itemdesc} />
      </td>
      <td className="px-3 py-3 w-24">
        <Input type="number" min="0" value={item.itemqty} onChange={e => onChange('itemqty', e.target.value)} placeholder="0" error={errors.itemqty} />
      </td>
      <td className="px-3 py-3 w-28">
        <Input type="number" min="0" step="0.01" value={item.price} onChange={e => onChange('price', e.target.value)} placeholder="0.00" error={errors.price} />
      </td>
      <td className="px-3 py-3 w-32 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1.5 rounded-lg text-[13px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums whitespace-nowrap">
          ₹{item.totalamount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </span>
      </td>
      <td className="px-3 py-3 w-32">
        <Input value={item.department} onChange={e => onChange('department', e.target.value)} placeholder="Dept" />
      </td>
      <td className="px-3 py-3 min-w-[160px]">
        <Input value={item.reason_purpose} onChange={e => onChange('reason_purpose', e.target.value)} placeholder="Reason / purpose" />
      </td>
      <td className="px-3 py-3 text-center w-20">
        <div className="flex items-center justify-center gap-1.5">
          <button type="button" onClick={onAdd} title="Add row"
            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button type="button" onClick={onDelete} disabled={!canDelete} title="Delete row"
            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE ITEM CARD ───────────────────────────────────────────────────────
function MobileItemCard({ item, idx, onChange, onAdd, onDelete, canDelete, errors }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-500 dark:text-slate-400">
          <Hash className="w-3 h-3" /> Item {idx}
        </span>
        <div className="flex items-center gap-1.5">
          <button type="button" onClick={onAdd} title="Add item"
            className="p-1.5 rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={onDelete} disabled={!canDelete} title="Delete item"
            className="p-1.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400 disabled:opacity-40">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <Field label="Item description" error={errors.itemdesc} required>
          <Input value={item.itemdesc} onChange={e => onChange('itemdesc', e.target.value)} placeholder="e.g. A4 paper ream" error={errors.itemdesc} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Qty" error={errors.itemqty} required>
            <Input type="number" min="0" value={item.itemqty} onChange={e => onChange('itemqty', e.target.value)} placeholder="0" error={errors.itemqty} />
          </Field>
          <Field label="Price / item" error={errors.price} required>
            <Input type="number" min="0" step="0.01" icon={IndianRupee} value={item.price} onChange={e => onChange('price', e.target.value)} placeholder="0.00" error={errors.price} />
          </Field>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-2.5">
          <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-400">Total amount</span>
          <span className="text-[16px] font-bold text-blue-800 dark:text-blue-300 tabular-nums">
            ₹{item.totalamount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
          </span>
        </div>

        <Field label="Department">
          <Input value={item.department} onChange={e => onChange('department', e.target.value)} placeholder="Department" />
        </Field>
        <Field label="Reason / purpose">
          <Input value={item.reason_purpose} onChange={e => onChange('reason_purpose', e.target.value)} placeholder="Reason / purpose" />
        </Field>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function IndentForm() {
  // header fields
  const [hod, setHod] = useState('')
  const [indentDate, setIndentDate] = useState('')
  const [stockAvailable, setStockAvailable] = useState('')

  // dynamic item rows
  const [items, setItems] = useState([emptyItem()])

  // validation / ui state
  const [errors, setErrors] = useState({})
  const [itemErrors, setItemErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  // approval strip (HOD name fills in once selected — mirrors the old
  // ddlwingincharge_SelectedIndexChanged postback behaviour)
  const [hodApprovalName, setHodApprovalName] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── derived: per-row + grand total ────────────────────────────────────────
  const computedItems = useMemo(
    () => items.map(it => ({
      ...it,
      totalamount: (parseFloat(it.itemqty) || 0) * (parseFloat(it.price) || 0),
    })),
    [items]
  )

  const grandTotal = useMemo(
    () => computedItems.reduce((sum, it) => sum + it.totalamount, 0),
    [computedItems]
  )

  // ── row mutators ──────────────────────────────────────────────────────────
  const updateItem = useCallback((id, field, value) => {
    setItems(prev => prev.map(it => (it.id === id ? { ...it, [field]: value } : it)))
  }, [])

  const addItemAfter = useCallback((id) => {
    setItems(prev => {
      const idx = prev.findIndex(it => it.id === id)
      const next = [...prev]
      next.splice(idx + 1, 0, emptyItem())
      return next
    })
  }, [])

  const addItemAtEnd = () => setItems(prev => [...prev, emptyItem()])

  const removeItem = useCallback((id) => {
    setItems(prev => (prev.length === 1 ? prev : prev.filter(it => it.id !== id)))
  }, [])

  // ── header field handlers ───────────────────────────────────────────────
  const handleHodChange = (e) => {
    const val = e.target.value
    setHod(val)
    setErrors(p => ({ ...p, hod: undefined }))
    const selected = HOD_OPTIONS.find(o => o.value === val)
    setHodApprovalName(selected ? selected.label.split('—')[0].trim() : '')
  }

  // ── validation (mirrors the old client-side validate()) ────────────────
  const validate = () => {
    const err = {}
    if (!hod) err.hod = 'Please select HOD / concern authority'
    if (!indentDate) err.indentDate = 'Please select the indent date'
    if (!stockAvailable.trim()) err.stockAvailable = 'Please mention stock availability'

    const iErr = {}
    let itemsValid = true
    computedItems.forEach(it => {
      const e = {}
      if (!it.itemdesc.trim()) { e.itemdesc = 'Required'; itemsValid = false }
      if (!it.itemqty || parseFloat(it.itemqty) <= 0) { e.itemqty = 'Required'; itemsValid = false }
      if (!it.price || parseFloat(it.price) <= 0) { e.price = 'Required'; itemsValid = false }
      if (Object.keys(e).length) iErr[it.id] = e
    })

    setErrors(err)
    setItemErrors(iErr)
    return Object.keys(err).length === 0 && itemsValid
  }

  // ── submit (simulated API call — placeholder for real endpoint) ────────
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!validate()) {
      showToast('Please fix the highlighted fields before submitting.', 'error')
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      // TODO: replace with real API integration, e.g.
      // await fetch('/api/leave/indent', { method: 'POST', body: JSON.stringify(payload) })
      setSubmitting(false)
      showToast('Indent submitted successfully for approval.')
    }, 900)
  }

  const handleReset = () => {
    setHod(''); setIndentDate(''); setStockAvailable('')
    setItems([emptyItem()])
    setErrors({}); setItemErrors({})
    setHodApprovalName('')
  }

  return (
    <div className="space-y-4 pb-28 sm:pb-10">

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
        <span>Home</span>
        <ChevronRight className="w-3 h-3" />
        <span>Leave</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600 dark:text-slate-300 font-medium">Indent Form</span>
      </div>

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Indent Form
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Raise a stock / purchase indent and route it for HOD &amp; Principal approval.
        </p>
      </div>

      <form id="indent-form" onSubmit={handleSubmit} className="space-y-4">

        {/* ── Section 1: Indent Details ─────────────────────────────────── */}
        <SectionCard icon={ClipboardList} title="Indent Details">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Indent By">
              <Input value={CURRENT_USER.name} icon={User} disabled />
            </Field>

            <Field label="HOD / Concern Authority" error={errors.hod} required>
              <NativeSelect value={hod} onChange={handleHodChange} placeholder="-- Select Authority --" error={errors.hod}>
                {HOD_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Indent Date" error={errors.indentDate} required>
              <Input
                type="date"
                icon={CalendarDays}
                value={indentDate}
                onChange={e => { setIndentDate(e.target.value); setErrors(p => ({ ...p, indentDate: undefined })) }}
                error={errors.indentDate}
              />
            </Field>

            <Field label="Item available in stock?" error={errors.stockAvailable} required>
              <Input
                icon={Boxes}
                value={stockAvailable}
                onChange={e => { setStockAvailable(e.target.value); setErrors(p => ({ ...p, stockAvailable: undefined })) }}
                placeholder="e.g. Not available in store"
                error={errors.stockAvailable}
              />
            </Field>
          </div>
        </SectionCard>

        {/* ── Section 2: Items ─────────────────────────────────────────── */}
        <SectionCard
          icon={ListChecks}
          title="Indent Items"
          badge={`${items.length} item${items.length !== 1 ? 's' : ''}`}
          action={
            <button type="button" onClick={addItemAtEnd}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-sm transition-colors">
              <Plus className="w-3.5 h-3.5" /> Add Item
            </button>
          }
        >
          {/* DESKTOP TABLE */}
          <div className="hidden md:block -mx-5 overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['#', 'Item Description', 'Qty', 'Price / Item', 'Total', 'Dept', 'Reason / Purpose', 'Actions'].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {computedItems.map((item, i) => (
                  <DesktopItemRow
                    key={item.id}
                    item={item}
                    idx={i + 1}
                    errors={itemErrors[item.id] || {}}
                    canDelete={items.length > 1}
                    onChange={(field, value) => updateItem(item.id, field, value)}
                    onAdd={() => addItemAfter(item.id)}
                    onDelete={() => removeItem(item.id)}
                  />
                ))}
                {/* Grand total row */}
                <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                  <td className="px-3 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                  <td className="px-3 py-3" colSpan={3}>
                    <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <IndianRupee className="w-4 h-4" /> Grand Total
                    </span>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg text-[14px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums whitespace-nowrap">
                      ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </span>
                  </td>
                  <td className="px-3 py-3" colSpan={3} />
                </tr>
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS */}
          <div className="md:hidden space-y-3">
            {computedItems.map((item, i) => (
              <MobileItemCard
                key={item.id}
                item={item}
                idx={i + 1}
                errors={itemErrors[item.id] || {}}
                canDelete={items.length > 1}
                onChange={(field, value) => updateItem(item.id, field, value)}
                onAdd={() => addItemAfter(item.id)}
                onDelete={() => removeItem(item.id)}
              />
            ))}

            {/* Mobile grand total */}
            <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4 flex items-center justify-between">
              <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
                <IndianRupee className="w-4 h-4" /> Grand Total
              </span>
              <span className="text-[20px] font-bold text-blue-800 dark:text-blue-300 tabular-nums">
                ₹{grandTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ── Section 3: Approval Status ───────────────────────────────── */}
        <SectionCard icon={Building2} title="Approval Status">
          <div className="flex flex-col sm:flex-row gap-3">
            <ApprovalStep icon={User} label="Indent By" name={CURRENT_USER.name} status="submitted" />
            <ApprovalStep icon={Building2} label="HOD / Concern Authority" name={hodApprovalName} status="pending" />
            <ApprovalStep icon={ClipboardList} label="Principal" name={PRINCIPAL_NAME} status="pending" />
          </div>
        </SectionCard>

        {/* ── Desktop submit bar ───────────────────────────────────────── */}
        <div className="hidden sm:flex items-center justify-end gap-3 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm px-5 py-4">
          <button type="button" onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          <button type="submit" disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-md shadow-blue-500/20
              transition-all active:scale-95 disabled:opacity-70">
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Indent
          </button>
        </div>
      </form>

      {/* ── Mobile sticky submit bar ─────────────────────────────────────── */}
      <div
        className="fixed bottom-0 inset-x-0 sm:hidden z-30 bg-white/95 dark:bg-[#11142a]/95 backdrop-blur
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.15)] px-4 py-3 flex items-center gap-3"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <button type="button" onClick={handleReset}
          className="p-3 rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex-shrink-0">
          <RefreshCw className="w-4 h-4" />
        </button>
        <button type="submit" form="indent-form" disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
            bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          Submit Indent
        </button>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
