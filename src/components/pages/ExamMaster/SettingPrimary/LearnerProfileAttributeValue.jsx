/**
 * LearnerProfileAttributeValue.jsx
 * Folder: src/pages/Student/LearnerProfileAttributeValue.jsx
 *
 * Converts legacy ASPX "Define Learner Profile Attribute Value" to
 * fully-responsive React + Tailwind (Vite, JS only).
 *
 * Features:
 *  - Session dropdown
 *  - Attribute dropdown (auto-populated per session)
 *  - Attribute Value text input
 *  - Save / Reset workflow
 *  - GridView → responsive table (desktop) / cards (mobile)
 *  - Edit inline flow
 *  - Full validation with inline errors
 *  - Toast notifications
 *  - Mobile-friendly drawer for form
 *  - Production-quality, no horizontal scroll on mobile
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Tag, Plus, RefreshCw, Save, Pencil,
  AlertCircle, X, Check, Loader2,
  ChevronDown, SlidersHorizontal,
  Search, Info, BookOpen, Settings2,
  ListFilter, Hash
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const ATTRIBUTES_BY_SESSION = {
  '2022-23': [
    { id: 1, name: 'Category' },
    { id: 2, name: 'House' },
    { id: 3, name: 'Transport Mode' },
    { id: 4, name: 'Blood Group' },
  ],
  '2023-24': [
    { id: 1, name: 'Category' },
    { id: 2, name: 'House' },
    { id: 3, name: 'Transport Mode' },
    { id: 4, name: 'Blood Group' },
    { id: 5, name: 'Nationality' },
  ],
  '2024-25': [
    { id: 1, name: 'Category' },
    { id: 2, name: 'House' },
    { id: 3, name: 'Transport Mode' },
    { id: 4, name: 'Blood Group' },
    { id: 5, name: 'Nationality' },
    { id: 6, name: 'Religion' },
  ],
  '2025-26': [
    { id: 1, name: 'Category' },
    { id: 2, name: 'House' },
    { id: 3, name: 'Transport Mode' },
    { id: 4, name: 'Blood Group' },
    { id: 5, name: 'Nationality' },
    { id: 6, name: 'Religion' },
    { id: 7, name: 'Caste' },
  ],
}

// Pre-seeded attribute values (simulates DB rows)
let SEED_ID = 100
const generateId = () => ++SEED_ID

const INITIAL_RECORDS = [
  // Category
  { rowid: 1, session: '2025-26', ATTRIBUTE_ID: 1, ATTRIBUTE_NAME: 'Category', Attribute_Value_Id: 10, Attribute_Value: 'General' },
  { rowid: 2, session: '2025-26', ATTRIBUTE_ID: 1, ATTRIBUTE_NAME: 'Category', Attribute_Value_Id: 11, Attribute_Value: 'OBC' },
  { rowid: 3, session: '2025-26', ATTRIBUTE_ID: 1, ATTRIBUTE_NAME: 'Category', Attribute_Value_Id: 12, Attribute_Value: 'SC' },
  { rowid: 4, session: '2025-26', ATTRIBUTE_ID: 1, ATTRIBUTE_NAME: 'Category', Attribute_Value_Id: 13, Attribute_Value: 'ST' },
  // House
  { rowid: 5, session: '2025-26', ATTRIBUTE_ID: 2, ATTRIBUTE_NAME: 'House', Attribute_Value_Id: 20, Attribute_Value: 'Red House' },
  { rowid: 6, session: '2025-26', ATTRIBUTE_ID: 2, ATTRIBUTE_NAME: 'House', Attribute_Value_Id: 21, Attribute_Value: 'Blue House' },
  { rowid: 7, session: '2025-26', ATTRIBUTE_ID: 2, ATTRIBUTE_NAME: 'House', Attribute_Value_Id: 22, Attribute_Value: 'Green House' },
  // Transport
  { rowid: 8, session: '2025-26', ATTRIBUTE_ID: 3, ATTRIBUTE_NAME: 'Transport Mode', Attribute_Value_Id: 30, Attribute_Value: 'School Bus' },
  { rowid: 9, session: '2025-26', ATTRIBUTE_ID: 3, ATTRIBUTE_NAME: 'Transport Mode', Attribute_Value_Id: 31, Attribute_Value: 'Private Vehicle' },
  { rowid: 10, session: '2025-26', ATTRIBUTE_ID: 3, ATTRIBUTE_NAME: 'Transport Mode', Attribute_Value_Id: 32, Attribute_Value: 'Walking' },
  // Blood Group
  { rowid: 11, session: '2025-26', ATTRIBUTE_ID: 4, ATTRIBUTE_NAME: 'Blood Group', Attribute_Value_Id: 40, Attribute_Value: 'A+' },
  { rowid: 12, session: '2025-26', ATTRIBUTE_ID: 4, ATTRIBUTE_NAME: 'Blood Group', Attribute_Value_Id: 41, Attribute_Value: 'B+' },
  { rowid: 13, session: '2025-26', ATTRIBUTE_ID: 4, ATTRIBUTE_NAME: 'Blood Group', Attribute_Value_Id: 42, Attribute_Value: 'O+' },
  { rowid: 14, session: '2025-26', ATTRIBUTE_ID: 4, ATTRIBUTE_NAME: 'Blood Group', Attribute_Value_Id: 43, Attribute_Value: 'AB+' },
]

// Attribute color palette (cycled by attribute id)
const ATTR_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe', ring: 'ring-blue-200' },
  { fg: '#7c3aed', bg: '#ede9fe', ring: 'ring-violet-200' },
  { fg: '#0891b2', bg: '#cffafe', ring: 'ring-cyan-200' },
  { fg: '#059669', bg: '#d1fae5', ring: 'ring-emerald-200' },
  { fg: '#d97706', bg: '#fef3c7', ring: 'ring-amber-200' },
  { fg: '#dc2626', bg: '#fee2e2', ring: 'ring-rose-200' },
  { fg: '#0369a1', bg: '#e0f2fe', ring: 'ring-sky-200' },
]
const attrColor = (id) => ATTR_COLORS[(id ?? 0) % ATTR_COLORS.length]

// Sanitize: remove single quotes (mirrors FilteredTextBoxExtender)
const sanitize = (val) => val.replace(/'/g, '')

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
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
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

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>
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
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success'
          ? 'bg-emerald-600 text-white'
          : type === 'info'
          ? 'bg-blue-600 text-white'
          : 'bg-rose-600 text-white'
        }`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── ATTRIBUTE BADGE ──────────────────────────────────────────────────────────
function AttrBadge({ id, name, size = 'sm' }) {
  const { fg, bg } = attrColor(id)
  const abbr = (name || '').slice(0, 2).toUpperCase()
  if (size === 'lg') {
    return (
      <div className="flex items-center gap-2.5">
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {abbr}
        </span>
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{name}</span>
      </div>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold"
      style={{ background: bg, color: fg }}
    >
      <Tag className="w-3 h-3" />
      {name}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ record, onEdit, isEditing }) {
  return (
    <tr
      className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
        ${isEditing
          ? 'bg-amber-50/60 dark:bg-amber-500/[0.05]'
          : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
        }`}
    >
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {record.sno}
      </td>

      {/* Attribute Name */}
      <td className="px-4 py-3">
        <AttrBadge id={record.ATTRIBUTE_ID} name={record.ATTRIBUTE_NAME} size="lg" />
      </td>

      {/* Attribute Value */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-[13px] text-slate-700 dark:text-slate-200 font-medium">
            {record.Attribute_Value}
          </span>
          {isEditing && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              Editing
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onEdit(record)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-95
            ${isEditing
              ? 'bg-amber-500 text-white hover:bg-amber-600'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/20'
            }`}
        >
          <Pencil className="w-3 h-3" />
          {isEditing ? 'Editing…' : 'Edit'}
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE RECORD CARD ───────────────────────────────────────────────────────
function MobileCard({ record, onEdit, isEditing }) {
  const { fg, bg } = attrColor(record.ATTRIBUTE_ID)
  return (
    <div
      className={`rounded-xl border overflow-hidden shadow-sm transition-all
        ${isEditing
          ? 'border-amber-300 dark:border-amber-500/40 bg-amber-50/50 dark:bg-amber-500/[0.05]'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'
        }`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Badge */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {(record.ATTRIBUTE_NAME || '').slice(0, 2).toUpperCase()}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: fg }}>
            {record.ATTRIBUTE_NAME}
          </p>
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate mt-0.5">
            {record.Attribute_Value}
          </p>
        </div>

        {isEditing && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 flex-shrink-0">
            Editing
          </span>
        )}

        <button
          onClick={() => onEdit(record)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-95
            ${isEditing
              ? 'bg-amber-500 text-white'
              : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
            }`}
        >
          <Pencil className="w-3 h-3" />
          Edit
        </button>
      </div>
    </div>
  )
}

// ─── FORM PANEL ───────────────────────────────────────────────────────────────
function FormPanel({ form, errors, attributes, onSessionChange, onAttributeChange, onValueChange, isEditMode, loading, onSave, onReset, inline }) {
  const formContent = (
    <div className={inline ? 'space-y-0' : 'space-y-1'}>
      {/* Row: Session + Attribute + Value + Buttons */}
      <div className={`grid gap-4 ${inline ? 'grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_auto]' : 'grid-cols-1'}`}>
        {/* Session */}
        <Field label="Session" error={errors.session} required>
          <NativeSelect
            value={form.session}
            onChange={e => onSessionChange(e.target.value)}
            placeholder="-- Select Session --"
            error={errors.session}
          >
            {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </NativeSelect>
        </Field>

        {/* Attribute */}
        <Field label="Attribute" error={errors.attribute} required>
          <NativeSelect
            value={form.attributeId}
            onChange={e => onAttributeChange(e.target.value)}
            placeholder="-- Select Attribute --"
            error={errors.attribute}
            disabled={!form.session}
          >
            {attributes.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </NativeSelect>
        </Field>

        {/* Attribute Value */}
        <Field
          label="Attribute Value"
          error={errors.value}
          required
          hint="Single quotes are not allowed"
        >
          <input
            type="text"
            value={form.value}
            onChange={e => onValueChange(sanitize(e.target.value))}
            placeholder="Enter attribute value…"
            className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
              bg-white text-slate-800 placeholder-slate-300
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
              dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
              ${errors.value
                ? 'border-rose-400 ring-2 ring-rose-100'
                : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
              }`}
          />
        </Field>

        {/* Buttons */}
        <div className={`flex gap-2 ${inline ? 'items-end pb-[1px]' : 'pt-1'}`}>
          <button
            type="button"
            onClick={onSave}
            disabled={loading}
            className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
              transition-all active:scale-95 disabled:opacity-70 shadow-md whitespace-nowrap
              ${isEditMode
                ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700'
              }`}
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : isEditMode
              ? <Check className="w-4 h-4" />
              : <Save className="w-4 h-4" />
            }
            {isEditMode ? 'Update' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
  return formContent
}

// ─── MOBILE FILTER / FORM DRAWER ──────────────────────────────────────────────
function FormDrawer({ open, onClose, ...formProps }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
              {formProps.isEditMode ? 'Edit Attribute Value' : 'Add Attribute Value'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <FormPanel {...formProps} inline={false} />
        </div>
        <div className="px-5 pb-6 pt-2 flex gap-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { formProps.onSave(); }}
            disabled={formProps.loading}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              transition-all disabled:opacity-70
              ${formProps.isEditMode
                ? 'bg-amber-500 hover:bg-amber-600'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700'
              }`}
          >
            {formProps.loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : formProps.isEditMode
              ? <Check className="w-4 h-4" />
              : <Save className="w-4 h-4" />
            }
            {formProps.isEditMode ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LearnerProfileAttributeValue() {
  // Form state
  const [form, setForm] = useState({ session: '', attributeId: '', value: '' })
  const [errors, setErrors] = useState({})
  const [isEditMode, setIsEditMode] = useState(false)
  const [editRowId, setEditRowId] = useState(null)
  const [loading, setSaving] = useState(false)

  // Records state (simulates DB)
  const [records, setRecords] = useState(INITIAL_RECORDS)

  // UI state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const formRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Available attributes based on selected session
  const attributes = useMemo(
    () => (form.session ? (ATTRIBUTES_BY_SESSION[form.session] ?? []) : []),
    [form.session]
  )

  // Records shown in grid — filter by search if any
  const filteredRecords = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return records
    return records.filter(r =>
      r.ATTRIBUTE_NAME.toLowerCase().includes(q) ||
      r.Attribute_Value.toLowerCase().includes(q) ||
      r.session.toLowerCase().includes(q)
    )
  }, [records, search])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleSessionChange = useCallback((val) => {
    setForm(p => ({ ...p, session: val, attributeId: '' }))
    setErrors(p => ({ ...p, session: undefined, attribute: undefined }))
  }, [])

  const handleAttributeChange = useCallback((val) => {
    setForm(p => ({ ...p, attributeId: val }))
    setErrors(p => ({ ...p, attribute: undefined }))
  }, [])

  const handleValueChange = useCallback((val) => {
    setForm(p => ({ ...p, value: val }))
    setErrors(p => ({ ...p, value: undefined }))
  }, [])

  const validate = () => {
    const err = {}
    if (!form.session)     err.session   = 'Please select a session'
    if (!form.attributeId) err.attribute = 'Please select an attribute'
    if (!form.value.trim()) err.value    = 'Attribute value is required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSave = useCallback(() => {
    if (!validate()) return
    setSaving(true)

    setTimeout(() => {
      const attrObj = attributes.find(a => String(a.id) === String(form.attributeId))
      if (isEditMode && editRowId !== null) {
        // Update existing
        setRecords(prev =>
          prev.map(r =>
            r.rowid === editRowId
              ? {
                  ...r,
                  session: form.session,
                  ATTRIBUTE_ID: attrObj?.id,
                  ATTRIBUTE_NAME: attrObj?.name,
                  Attribute_Value: form.value.trim(),
                }
              : r
          )
        )
        showToast('Record updated successfully.')
      } else {
        // Insert new
        const newRow = {
          rowid: generateId(),
          session: form.session,
          ATTRIBUTE_ID: attrObj?.id,
          ATTRIBUTE_NAME: attrObj?.name,
          Attribute_Value_Id: generateId(),
          Attribute_Value: form.value.trim(),
        }
        setRecords(prev => [...prev, newRow])
        showToast('Attribute value saved successfully.')
      }

      setForm({ session: '', attributeId: '', value: '' })
      setIsEditMode(false)
      setEditRowId(null)
      setErrors({})
      setSaving(false)
      setDrawerOpen(false)
    }, 600)
  }, [form, isEditMode, editRowId, attributes])

  const handleReset = useCallback(() => {
    setForm({ session: '', attributeId: '', value: '' })
    setIsEditMode(false)
    setEditRowId(null)
    setErrors({})
    setDrawerOpen(false)
  }, [])

  const handleEdit = useCallback((record) => {
    // Scroll to top (mirrors OnClientClick="javascript:scroll(0,0)")
    window.scrollTo({ top: 0, behavior: 'smooth' })

    setForm({
      session: record.session,
      attributeId: String(record.ATTRIBUTE_ID),
      value: record.Attribute_Value,
    })
    setIsEditMode(true)
    setEditRowId(record.rowid)
    setErrors({})
    setDrawerOpen(true) // opens drawer on mobile; on desktop form is always visible
    showToast(`Editing: ${record.ATTRIBUTE_NAME} → "${record.Attribute_Value}"`, 'info')
  }, [])

  const formProps = {
    form, errors, attributes,
    onSessionChange: handleSessionChange,
    onAttributeChange: handleAttributeChange,
    onValueChange: handleValueChange,
    isEditMode, loading,
    onSave: handleSave,
    onReset: handleReset,
  }

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Learner Profile Attribute Value
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage predefined values for each learner profile attribute per session.
          </p>
        </div>

        {/* Mobile: FAB to open form drawer */}
        <button
          type="button"
          onClick={() => { handleReset(); setDrawerOpen(true) }}
          className="sm:hidden flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white shadow-md shadow-blue-500/20 self-start dark:bg-indigo-600"
        >
          <Plus className="w-4 h-4" />
          Add Value
        </button>
      </div>

      {/* ── DESKTOP Form Card ────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            {isEditMode ? 'Edit Attribute Value' : 'Add Attribute Value'}
          </span>
          {isEditMode && (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              Edit Mode Active
            </span>
          )}
        </div>
        <div className="p-5" ref={formRef}>
          <FormPanel {...formProps} inline={true} />
        </div>
      </div>

      {/* Mobile Form Drawer */}
      <FormDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} {...formProps} />

      {/* ── Records Section ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Attribute Values</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search attribute or value…"
              className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
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
        </div>

        {/* Info hint */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Click <strong>Edit</strong> on any row to load it into the form above for modification.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <EmptyState search={search} onClear={() => setSearch('')} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Attribute Name', 'Attribute Value', 'Action'].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12 last:w-28"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((rec, i) => (
                  <DesktopRow
                    key={rec.rowid}
                    record={{ ...rec, sno: i + 1 }}
                    onEdit={handleEdit}
                    isEditing={editRowId === rec.rowid}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filteredRecords.length === 0 ? (
            <EmptyState search={search} onClear={() => setSearch('')} />
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap <strong>Edit</strong> on a card to modify that value.
              </p>
              {filteredRecords.map((rec, i) => (
                <MobileCard
                  key={rec.rowid}
                  record={{ ...rec, sno: i + 1 }}
                  onEdit={handleEdit}
                  isEditing={editRowId === rec.rowid}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredRecords.length}</span>
            {' '}of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span>
            {' '}records
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <ListFilter className="w-6 h-6 opacity-50" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
          {search ? 'No matching records' : 'No records yet'}
        </p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
          {search
            ? 'Try a different search term.'
            : 'Use the form above to define attribute values.'}
        </p>
      </div>
      {search && (
        <button
          onClick={onClear}
          className="text-[13px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"
        >
          <X className="w-3.5 h-3.5" /> Clear search
        </button>
      )}
    </div>
  )
}
