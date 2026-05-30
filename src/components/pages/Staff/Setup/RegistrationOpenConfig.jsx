/**
 * RegistrationOpenConfig.jsx
 * Converted from: jobVacancyFormConfiguration.aspx
 *
 * Features:
 *  - Session dropdown
 *  - Start Date / End Date pickers (end ≥ start)
 *  - Registration Fee (numeric only)
 *  - Add New / Submit / Cancel form flow
 *  - GridView with inline Edit / Update / Cancel
 *  - Session filter for grid
 *  - Mobile: cards layout for grid rows
 *  - Desktop: dense ERP-style table
 *  - Toast notifications, loading states, empty states
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  PlusCircle, X, Check, AlertCircle, Loader2, ChevronDown,
  Calendar, IndianRupee, Filter, RefreshCw, Pencil, Save,
  BookOpen, School2, CheckCircle2, XCircle, SlidersHorizontal,
  ChevronRight, Info, Layers, LayoutList,
} from 'lucide-react'

// ─── STATIC DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const INITIAL_RECORDS = [
  { RowID: 1, session: '2023-24', startDate: '2023-04-01', endDate: '2023-04-30', feeAmount: 500,  status: '1' },
  { RowID: 2, session: '2023-24', startDate: '2023-07-01', endDate: '2023-07-20', feeAmount: 300,  status: '0' },
  { RowID: 3, session: '2024-25', startDate: '2024-04-05', endDate: '2024-05-05', feeAmount: 600,  status: '1' },
  { RowID: 4, session: '2024-25', startDate: '2024-08-01', endDate: '2024-08-15', feeAmount: 250,  status: '0' },
  { RowID: 5, session: '2025-26', startDate: '2025-04-10', endDate: '2025-05-10', feeAmount: 700,  status: '1' },
]

// ─── HELPERS ────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
const formatINR = (n) =>
  '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const todayISO = () => new Date().toISOString().slice(0, 10)

// ─── PRIMITIVE COMPONENTS ───────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, id }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
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
      <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
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
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  )
}

// Status Badge
function StatusBadge({ status }) {
  const active = status === '1'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold
      ${active
        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
        : 'bg-slate-100 text-slate-500 border border-slate-200'}`}>
      {active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
      {active ? 'Active' : 'Inactive'}
    </span>
  )
}

// ─── ADD / EDIT FORM ────────────────────────────────────────────────────────
function RegistrationForm({ onSubmit, onCancel, loading }) {
  const [form, setForm] = useState({ session: '', startDate: '', endDate: '', feeAmount: '' })
  const [errors, setErrors] = useState({})

  const set = (k, v) => {
    setForm(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: undefined }))
  }

  const validate = () => {
    const e = {}
    if (!form.session)    e.session   = 'Select a session'
    if (!form.startDate)  e.startDate = 'Select start date'
    if (!form.endDate)    e.endDate   = 'Select end date'
    if (!form.feeAmount)  e.feeAmount = 'Fee amount is required'
    else if (!/^\d+$/.test(form.feeAmount)) e.feeAmount = 'Only numeric values allowed'
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = 'End date must be ≥ start date'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onSubmit(form)
  }

  return (
    <div className="rounded-2xl border border-blue-100 bg-blue-50/40 shadow-sm overflow-hidden">
      {/* Form Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-blue-100 bg-white/60">
        <span className="w-1 h-5 rounded-full bg-blue-500" />
        <PlusCircle className="w-4 h-4 text-blue-600" />
        <span className="text-[14px] font-bold text-slate-700">New Registration Opening</span>
      </div>

      {/* Form Body */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Session */}
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={form.session}
              onChange={e => set('session', e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          {/* Start Date */}
          <Field label="Start Date" error={errors.startDate} required>
            <div className="relative">
              <input
                type="date"
                value={form.startDate}
                min={todayISO()}
                onChange={e => {
                  set('startDate', e.target.value)
                  // reset end if before start
                  if (form.endDate && e.target.value > form.endDate)
                    set('endDate', '')
                }}
                className={`w-full pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  ${errors.startDate ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
              />
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </Field>

          {/* End Date */}
          <Field label="End Date" error={errors.endDate} required>
            <div className="relative">
              <input
                type="date"
                value={form.endDate}
                min={form.startDate || todayISO()}
                onChange={e => set('endDate', e.target.value)}
                className={`w-full pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  ${errors.endDate ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
              />
              <Calendar className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            </div>
          </Field>

          {/* Fee Amount */}
          <Field label="Registration Fee" error={errors.feeAmount} required>
            <div className="relative">
              <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                inputMode="numeric"
                value={form.feeAmount}
                onChange={e => set('feeAmount', e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="e.g. 500"
                className={`w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  ${errors.feeAmount ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
              />
            </div>
          </Field>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-5">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20
              disabled:opacity-70 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Submit
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
              bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-all"
          >
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ───────────────────────────────────────────────────────────
function DesktopTable({ rows, editingId, editForm, setEditForm, onEdit, onUpdate, onCancel }) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400">
        <LayoutList className="w-8 h-8 opacity-30" />
        <p className="text-[13px]">No records found for this session.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60">
            {['S.No', 'Start Date', 'Close Date', 'Fee Amount', 'Session', 'Status', 'Actions'].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isEditing = editingId === row.RowID
            return (
              <tr key={row.RowID} className={`border-b border-slate-100 transition-colors
                ${isEditing ? 'bg-amber-50' : 'hover:bg-slate-50/60'}`}>
                {/* S.No */}
                <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{i + 1}</td>

                {/* Start Date */}
                <td className="px-4 py-3 text-center text-[13px] font-semibold text-slate-700 whitespace-nowrap">
                  {isEditing ? (
                    <input type="date" value={editForm.startDate}
                      onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))}
                      className="w-full border border-amber-300 rounded-lg px-2 py-1 text-[12px] outline-none focus:ring-2 focus:ring-amber-200" />
                  ) : formatDate(row.startDate)}
                </td>

                {/* End Date */}
                <td className="px-4 py-3 text-center text-[13px] font-semibold text-slate-700 whitespace-nowrap">
                  {isEditing ? (
                    <input type="date" value={editForm.endDate}
                      min={editForm.startDate}
                      onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value }))}
                      className="w-full border border-amber-300 rounded-lg px-2 py-1 text-[12px] outline-none focus:ring-2 focus:ring-amber-200" />
                  ) : formatDate(row.endDate)}
                </td>

                {/* Fee Amount */}
                <td className="px-4 py-3 text-center">
                  {isEditing ? (
                    <div className="relative">
                      <IndianRupee className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                      <input
                        type="text" inputMode="numeric"
                        value={editForm.feeAmount}
                        onChange={e => setEditForm(p => ({ ...p, feeAmount: e.target.value.replace(/[^0-9]/g, '') }))}
                        className="w-full border border-amber-300 rounded-lg pl-6 pr-2 py-1 text-[12px] outline-none focus:ring-2 focus:ring-amber-200"
                      />
                    </div>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold bg-emerald-50 text-emerald-700">
                      {formatINR(row.feeAmount)}
                    </span>
                  )}
                </td>

                {/* Session */}
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                    {row.session}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-3 text-center">
                  {isEditing ? (
                    <NativeSelect
                      value={editForm.status}
                      onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}
                    >
                      <option value="1">Active</option>
                      <option value="0">Inactive</option>
                    </NativeSelect>
                  ) : <StatusBadge status={row.status} />}
                </td>

                {/* Actions */}
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {isEditing ? (
                      <>
                        <button onClick={() => onUpdate(row.RowID)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                          <Save className="w-3.5 h-3.5" /> Update
                        </button>
                        <button onClick={onCancel}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                          <X className="w-3.5 h-3.5" /> Cancel
                        </button>
                      </>
                    ) : (
                      <button onClick={() => onEdit(row)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200">
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE RECORD CARD ──────────────────────────────────────────────────────
function MobileCard({ row, idx, editingId, editForm, setEditForm, onEdit, onUpdate, onCancel }) {
  const [expanded, setExpanded] = useState(false)
  const isEditing = editingId === row.RowID

  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm transition-all
      ${isEditing ? 'border-amber-300 bg-amber-50' : 'border-slate-200 bg-white'}`}>

      {/* Card Header */}
      <button type="button" onClick={() => !isEditing && setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left">
        {/* Index */}
        <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold bg-blue-100 text-blue-700">
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-slate-800">{row.session}</span>
            <StatusBadge status={row.status} />
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {formatDate(row.startDate)} → {formatDate(row.endDate)}
          </p>
        </div>

        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[16px] font-bold text-emerald-700">{formatINR(row.feeAmount)}</span>
          <span className="text-[10px] text-slate-400">fee</span>
        </div>

        {!isEditing && (
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
        )}
      </button>

      {/* Expanded Detail / Edit Mode */}
      {(expanded || isEditing) && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
          {isEditing ? (
            /* ── Edit Form (inline mobile) ── */
            <div className="space-y-3">
              <Field label="Start Date">
                <input type="date" value={editForm.startDate}
                  onChange={e => setEditForm(p => ({ ...p, startDate: e.target.value }))}
                  className="w-full border border-amber-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-amber-200" />
              </Field>
              <Field label="End Date">
                <input type="date" value={editForm.endDate} min={editForm.startDate}
                  onChange={e => setEditForm(p => ({ ...p, endDate: e.target.value }))}
                  className="w-full border border-amber-300 rounded-lg px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-amber-200" />
              </Field>
              <Field label="Fee Amount">
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input type="text" inputMode="numeric" value={editForm.feeAmount}
                    onChange={e => setEditForm(p => ({ ...p, feeAmount: e.target.value.replace(/[^0-9]/g, '') }))}
                    className="w-full border border-amber-300 rounded-lg pl-8 pr-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-amber-200" />
                </div>
              </Field>
              <Field label="Status">
                <NativeSelect value={editForm.status}
                  onChange={e => setEditForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </NativeSelect>
              </Field>
              <div className="flex gap-3 pt-1">
                <button onClick={() => onUpdate(row.RowID)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
                  <Save className="w-4 h-4" /> Update
                </button>
                <button onClick={onCancel}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                  <X className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ── View Detail ── */
            <>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-3 text-center">
                  <Calendar className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-blue-700">{formatDate(row.startDate)}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500 mt-0.5">Start Date</p>
                </div>
                <div className="rounded-xl bg-rose-50 border border-rose-100 p-3 text-center">
                  <Calendar className="w-4 h-4 text-rose-500 mx-auto mb-1" />
                  <p className="text-[11px] font-bold text-rose-700">{formatDate(row.endDate)}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-rose-500 mt-0.5">Close Date</p>
                </div>
              </div>
              <button onClick={() => onEdit(row)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20">
                <Pencil className="w-4 h-4" /> Edit Record
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ───────────────────────────────────────────────────
function FilterDrawer({ open, onClose, sessionFilter, setSessionFilter }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white border-t border-slate-200 shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}>
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="text-[14px] font-bold text-slate-800">Filter by Session</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-5">
          <Field label="Session">
            <NativeSelect value={sessionFilter} onChange={e => setSessionFilter(e.target.value)} placeholder="-- All Sessions --">
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={() => { setSessionFilter(''); onClose() }}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200">
            Reset
          </button>
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700">
            Apply
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN PAGE COMPONENT ────────────────────────────────────────────────────
export default function RegistrationOpenConfig() {
  const [records, setRecords]           = useState(INITIAL_RECORDS)
  const [showForm, setShowForm]         = useState(false)
  const [formLoading, setFormLoading]   = useState(false)
  const [editingId, setEditingId]       = useState(null)
  const [editForm, setEditForm]         = useState({})
  const [sessionFilter, setSessionFilter] = useState('')
  const [filterOpen, setFilterOpen]     = useState(false)
  const [toast, setToast]               = useState(null)
  const nextId = useRef(INITIAL_RECORDS.length + 1)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Add new record ──────────────────────────────────────────────────────
  const handleSubmit = useCallback((form) => {
    setFormLoading(true)
    setTimeout(() => {
      setRecords(prev => [
        ...prev,
        {
          RowID: nextId.current++,
          session: form.session,
          startDate: form.startDate,
          endDate: form.endDate,
          feeAmount: Number(form.feeAmount),
          status: '1',
        }
      ])
      setShowForm(false)
      setFormLoading(false)
      showToast('Registration opening added successfully!')
    }, 600)
  }, [])

  // ── Start editing ───────────────────────────────────────────────────────
  const handleEdit = (row) => {
    setEditingId(row.RowID)
    setEditForm({
      startDate: row.startDate,
      endDate: row.endDate,
      feeAmount: String(row.feeAmount),
      status: row.status,
    })
  }

  // ── Save edit ───────────────────────────────────────────────────────────
  const handleUpdate = (id) => {
    setRecords(prev => prev.map(r =>
      r.RowID === id
        ? { ...r, startDate: editForm.startDate, endDate: editForm.endDate, feeAmount: Number(editForm.feeAmount), status: editForm.status }
        : r
    ))
    setEditingId(null)
    showToast('Record updated successfully!')
  }

  // ── Cancel edit ─────────────────────────────────────────────────────────
  const handleCancelEdit = () => setEditingId(null)

  // ── Filtered rows ───────────────────────────────────────────────────────
  const filteredRows = useMemo(() =>
    sessionFilter ? records.filter(r => r.session === sessionFilter) : records,
    [records, sessionFilter]
  )

  // ── Summary stats ────────────────────────────────────────────────────────
  const activeCount   = filteredRows.filter(r => r.status === '1').length
  const inactiveCount = filteredRows.filter(r => r.status === '0').length

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 pb-16 space-y-5">

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-[12px] text-slate-400">
        <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-semibold text-slate-700">Registration Open</span>
      </nav>

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold text-slate-800 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
              <BookOpen className="w-5 h-5 text-white" />
            </span>
            Registration Open
          </h1>
          <p className="text-[13px] text-slate-500 mt-1">
            Configure registration windows — set session, dates &amp; fee.
          </p>
        </div>

        {/* Add New Button (desktop) */}
        {!showForm && (
          <button
            type="button"
            onClick={() => { setShowForm(true); setEditingId(null) }}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" /> Add New
          </button>
        )}
      </div>

      {/* ── Summary Stats ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total',    value: filteredRows.length, color: 'bg-blue-50   text-blue-700   border-blue-100'   },
          { label: 'Active',   value: activeCount,         color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
          { label: 'Inactive', value: inactiveCount,       color: 'bg-slate-50  text-slate-600  border-slate-200'  },
        ].map(({ label, value, color }) => (
          <div key={label} className={`rounded-xl border ${color} px-4 py-3 text-center shadow-sm`}>
            <p className="text-[22px] font-extrabold tabular-nums leading-tight">{value}</p>
            <p className="text-[11px] font-semibold uppercase tracking-wide mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Add Form (desktop/tablet) ──────────────────────────────────────── */}
      {showForm && (
        <RegistrationForm
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
          loading={formLoading}
        />
      )}

      {/* ── Records Card ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Layers className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700">All Registrations</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
              {filteredRows.length} record{filteredRows.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Desktop Session Filter */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-44">
              <NativeSelect
                value={sessionFilter}
                onChange={e => setSessionFilter(e.target.value)}
                placeholder="All Sessions"
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </div>
            {sessionFilter && (
              <button onClick={() => setSessionFilter('')}
                className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors" title="Clear filter">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Info Strip */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 bg-blue-50/30">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700">
            Click <strong>Edit</strong> on any row to update fee amount, dates, or status.
            {showForm ? '' : ' Click Add New to create a fresh registration window.'}
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block">
          <DesktopTable
            rows={filteredRows}
            editingId={editingId}
            editForm={editForm}
            setEditForm={setEditForm}
            onEdit={handleEdit}
            onUpdate={handleUpdate}
            onCancel={handleCancelEdit}
          />
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {/* Mobile: Add New + Filter row */}
          <div className="flex gap-2">
            {!showForm && (
              <button type="button" onClick={() => setShowForm(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <PlusCircle className="w-4 h-4" /> Add New
              </button>
            )}
            <button type="button" onClick={() => setFilterOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700">
              <Filter className="w-4 h-4" />
              {sessionFilter || 'Filter'}
              {sessionFilter && (
                <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">1</span>
              )}
            </button>
          </div>

          {/* Mobile Add Form */}
          {showForm && (
            <RegistrationForm
              onSubmit={handleSubmit}
              onCancel={() => setShowForm(false)}
              loading={formLoading}
            />
          )}

          {filteredRows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
              <LayoutList className="w-8 h-8 opacity-30" />
              <p className="text-[13px]">No records for this session.</p>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to expand details.
              </p>
              {filteredRows.map((row, i) => (
                <MobileCard
                  key={row.RowID}
                  row={row}
                  idx={i + 1}
                  editingId={editingId}
                  editForm={editForm}
                  setEditForm={setEditForm}
                  onEdit={handleEdit}
                  onUpdate={handleUpdate}
                  onCancel={handleCancelEdit}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <p className="text-[12px] text-slate-400">
            Showing <span className="font-semibold text-slate-700">{filteredRows.length}</span> of{' '}
            <span className="font-semibold text-slate-700">{records.length}</span> records
          </p>
          {sessionFilter && (
            <button onClick={() => setSessionFilter('')}
              className="text-[12px] text-blue-600 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filter
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        sessionFilter={sessionFilter}
        setSessionFilter={setSessionFilter}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
