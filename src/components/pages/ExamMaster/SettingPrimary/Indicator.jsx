/**
 * Indicator.jsx
 * Folder: src/pages/ExamMaster/Indicator.jsx
 *
 * Converts legacy ASPX "Define Indicator" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Indicator Category dropdown (with class filter)
 *  - Class dropdown
 *  - Indicator Name text input
 *  - Indicator Order number input
 *  - Save / Edit / Delete functionality
 *  - Desktop: ERP-style dense table
 *  - Mobile: collapsible cards with action buttons
 *  - Toast notifications
 *  - Loading states
 *  - Empty states
 *  - Full validation
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  ChevronDown, AlertCircle, X, Check, Loader2,
  Search, RefreshCw, Plus, Pencil, Trash2,
  BookOpen, Tag, SlidersHorizontal, Info,
  ChevronRight, LayoutList, Save, Ban,
  GraduationCap, Hash, ListOrdered, Layers
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const INDICATOR_CATEGORIES = [
  { id: '1', name: 'Academic Performance' },
  { id: '2', name: 'Behavioural Development' },
  { id: '3', name: 'Co-Curricular Activities' },
  { id: '4', name: 'Physical Education' },
  { id: '5', name: 'Life Skills' },
]

const CLASSES = [
  { id: '1',  name: 'Nursery'   },
  { id: '2',  name: 'LKG'       },
  { id: '3',  name: 'UKG'       },
  { id: '4',  name: 'Class I'   },
  { id: '5',  name: 'Class II'  },
  { id: '6',  name: 'Class III' },
  { id: '7',  name: 'Class IV'  },
  { id: '8',  name: 'Class V'   },
  { id: '9',  name: 'Class VI'  },
  { id: '10', name: 'Class VII' },
  { id: '11', name: 'Class VIII'},
  { id: '12', name: 'Class IX'  },
  { id: '13', name: 'Class X'   },
  { id: '14', name: 'Class XI'  },
  { id: '15', name: 'Class XII' },
]

const INITIAL_INDICATORS = [
  { id: 1, indicator_cat: 'Academic Performance',      indicator_cat_id: '1', indicator_name: 'Reading Comprehension',  IndicatorOrder: 1, class_name: 'Class I',   class_id: '4'  },
  { id: 2, indicator_cat: 'Academic Performance',      indicator_cat_id: '1', indicator_name: 'Mathematical Reasoning', IndicatorOrder: 2, class_name: 'Class II',  class_id: '5'  },
  { id: 3, indicator_cat: 'Behavioural Development',   indicator_cat_id: '2', indicator_name: 'Classroom Discipline',   IndicatorOrder: 1, class_name: 'Class III', class_id: '6'  },
  { id: 4, indicator_cat: 'Co-Curricular Activities',  indicator_cat_id: '3', indicator_name: 'Art & Craft Skills',     IndicatorOrder: 1, class_name: 'Class IV',  class_id: '7'  },
  { id: 5, indicator_cat: 'Physical Education',        indicator_cat_id: '4', indicator_name: 'Sports Participation',   IndicatorOrder: 1, class_name: 'Class V',   class_id: '8'  },
  { id: 6, indicator_cat: 'Life Skills',               indicator_cat_id: '5', indicator_name: 'Communication Skills',   IndicatorOrder: 2, class_name: 'Class VI',  class_id: '9'  },
  { id: 7, indicator_cat: 'Academic Performance',      indicator_cat_id: '1', indicator_name: 'Science Aptitude',       IndicatorOrder: 3, class_name: 'Class VII', class_id: '10' },
  { id: 8, indicator_cat: 'Behavioural Development',   indicator_cat_id: '2', indicator_name: 'Team Collaboration',     IndicatorOrder: 2, class_name: 'Class VIII',class_id: '11' },
]

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
const CAT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
]
const catColor = (id) => CAT_COLORS[(Number(id) - 1) % CAT_COLORS.length] || CAT_COLORS[0]
const abbr = (s = '') => s.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Styled native <select> */
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

/** Form field wrapper with label + error */
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

/** Styled text / number input */
function TextInput({ value, onChange, placeholder, type = 'text', error, disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        }`}
    />
  )
}

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}
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

/** Confirm delete modal */
function ConfirmModal({ open, onConfirm, onCancel, itemName }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6"
          style={{ animation: 'fadeIn .2s ease' }}>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-100 text-center mb-1">Delete Indicator</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center mb-6">
            Are you sure you want to delete <strong className="text-slate-700 dark:text-slate-200">"{itemName}"</strong>? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit, onDelete }) {
  const { fg, bg } = catColor(row.indicator_cat_id)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Indicator Category */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}>
            {abbr(row.indicator_cat)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.indicator_cat}</span>
        </div>
      </td>

      {/* Indicator Name */}
      <td className="px-4 py-3">
        <span className="text-[13px] text-slate-700 dark:text-slate-200 font-medium">{row.indicator_name}</span>
      </td>

      {/* Indicator Order */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
          {row.IndicatorOrder}
        </span>
      </td>

      {/* Class */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
          <GraduationCap className="w-3 h-3" />
          {row.class_name}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 transition-colors">
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button onClick={() => onDelete(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = catColor(row.indicator_cat_id)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button type="button" onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {abbr(row.indicator_cat)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.indicator_name}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {row.indicator_cat}
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
            {row.class_name}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            Order: <span className="font-bold text-blue-600 dark:text-blue-400">{row.IndicatorOrder}</span>
          </span>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail + actions */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-500 dark:text-blue-400 mb-1 flex items-center gap-1">
                <ListOrdered className="w-3 h-3" /> Order
              </p>
              <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{row.IndicatorOrder}</p>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-500 dark:text-violet-400 mb-1 flex items-center gap-1">
                <GraduationCap className="w-3 h-3" /> Class
              </p>
              <p className="text-[13px] font-bold text-violet-700 dark:text-violet-300 leading-tight">{row.class_name}</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3" /> Category
            </p>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.indicator_cat}</p>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-2 pt-1">
            <button onClick={() => onEdit(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── FORM PANEL ───────────────────────────────────────────────────────────────
function IndicatorForm({ form, setForm, errors, onSave, onCancel, saving, editMode }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
          {editMode ? 'Edit Indicator' : 'Define Indicator'}
        </span>
        {editMode && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
            Editing
          </span>
        )}
      </div>

      {/* Fields */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Indicator Category */}
          <Field label="Indicator Category" error={errors.indicator_cat_id} required>
            <NativeSelect
              value={form.indicator_cat_id}
              onChange={e => {
                const cat = INDICATOR_CATEGORIES.find(c => c.id === e.target.value)
                setForm(p => ({ ...p, indicator_cat_id: e.target.value, indicator_cat: cat?.name || '' }))
              }}
              placeholder="-- Select Category --"
              error={errors.indicator_cat_id}
            >
              {INDICATOR_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>

          {/* Class */}
          <Field label="Class" error={errors.class_id}>
            <NativeSelect
              value={form.class_id}
              onChange={e => {
                const cls = CLASSES.find(c => c.id === e.target.value)
                setForm(p => ({ ...p, class_id: e.target.value, class_name: cls?.name || '' }))
              }}
              placeholder="-- Select Class --"
              error={errors.class_id}
            >
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>

          {/* Indicator Name */}
          <Field label="Indicator Name" error={errors.indicator_name} required>
            <TextInput
              value={form.indicator_name}
              onChange={e => setForm(p => ({ ...p, indicator_name: e.target.value }))}
              placeholder="Enter indicator name"
              error={errors.indicator_name}
            />
          </Field>

          {/* Indicator Order */}
          <Field label="Indicator Order" error={errors.IndicatorOrder} required>
            <TextInput
              type="number"
              value={form.IndicatorOrder}
              onChange={e => setForm(p => ({ ...p, IndicatorOrder: e.target.value }))}
              placeholder="e.g. 1"
              error={errors.IndicatorOrder}
            />
          </Field>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.015]">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
            bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
            shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
        >
          {saving
            ? <Loader2 className="w-4 h-4 animate-spin" />
            : editMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />
          }
          {editMode ? 'Update' : 'Save'}
        </button>
        {editMode && (
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <Ban className="w-4 h-4" /> Cancel
          </button>
        )}
      </div>
    </div>
  )
}

// ─── EMPTY FORM DEFAULTS ──────────────────────────────────────────────────────
const EMPTY_FORM = {
  indicator_cat_id: '',
  indicator_cat: '',
  indicator_name: '',
  IndicatorOrder: '',
  class_id: '',
  class_name: '',
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Indicator() {
  const [indicators, setIndicators]   = useState(INITIAL_INDICATORS)
  const [form,       setForm]         = useState(EMPTY_FORM)
  const [errors,     setErrors]       = useState({})
  const [saving,     setSaving]       = useState(false)
  const [editId,     setEditId]       = useState(null)
  const [search,     setSearch]       = useState('')
  const [toast,      setToast]        = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const formRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!form.indicator_cat_id) err.indicator_cat_id = 'Please select a category'
    if (!form.indicator_name.trim()) err.indicator_name = 'Indicator name is required'
    if (!form.IndicatorOrder.toString().trim()) err.IndicatorOrder = 'Order is required'
    else if (isNaN(Number(form.IndicatorOrder)) || Number(form.IndicatorOrder) < 1)
      err.IndicatorOrder = 'Enter a valid order number'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Save / Update ──────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!validate()) return
    setSaving(true)
    setTimeout(() => {
      if (editId !== null) {
        setIndicators(prev => prev.map(r =>
          r.id === editId
            ? { ...r, ...form, IndicatorOrder: Number(form.IndicatorOrder) }
            : r
        ))
        showToast('Indicator updated successfully.')
        setEditId(null)
      } else {
        const newId = Math.max(0, ...indicators.map(r => r.id)) + 1
        setIndicators(prev => [...prev, { id: newId, ...form, IndicatorOrder: Number(form.IndicatorOrder) }])
        showToast('Indicator saved successfully.')
      }
      setForm(EMPTY_FORM)
      setErrors({})
      setSaving(false)
    }, 500)
  }, [form, editId, indicators])

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = (row) => {
    setForm({
      indicator_cat_id: row.indicator_cat_id,
      indicator_cat: row.indicator_cat,
      indicator_name: row.indicator_name,
      IndicatorOrder: row.IndicatorOrder,
      class_id: row.class_id,
      class_name: row.class_name,
    })
    setEditId(row.id)
    setErrors({})
    // Scroll form into view on mobile
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }

  const handleCancelEdit = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setErrors({})
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = () => {
    setIndicators(prev => prev.filter(r => r.id !== deleteTarget.id))
    if (editId === deleteTarget.id) { setEditId(null); setForm(EMPTY_FORM) }
    showToast(`"${deleteTarget.indicator_name}" deleted.`, 'error')
    setDeleteTarget(null)
  }

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return indicators
    const q = search.toLowerCase()
    return indicators.filter(r =>
      r.indicator_name.toLowerCase().includes(q) ||
      r.indicator_cat.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q)
    )
  }, [indicators, search])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Indicator
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage assessment indicators by category, class, and order.
          </p>
        </div>
        {/* Stats pill */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[12px] font-semibold text-blue-700 dark:text-blue-400">
            <LayoutList className="w-3.5 h-3.5" />
            {indicators.length} Indicator{indicators.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
        <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300 font-semibold">Indicator</span>
      </nav>

      {/* ── FORM PANEL ───────────────────────────────────────────────────── */}
      <div ref={formRef}>
        <IndicatorForm
          form={form}
          setForm={setForm}
          errors={errors}
          onSave={handleSave}
          onCancel={handleCancelEdit}
          saving={saving}
          editMode={editId !== null}
        />
      </div>

      {/* ── LIST PANEL ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Indicator List</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-60 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, category, class…"
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

          {search && (
            <button onClick={() => setSearch('')}
              className="hidden sm:flex items-center gap-1 text-[12px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0">
              <RefreshCw className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* Hint bar */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Click <strong>Edit</strong> on any row to load it into the form above. Changes save immediately.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No indicators match your search.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Indicator Category', 'Indicator Name', 'Order', 'Class', 'Actions'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12 last:w-44">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow
                    key={row.id}
                    row={row}
                    idx={i + 1}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No indicators match your search.</span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to view details and actions.
              </p>
              {filtered.map((row, i) => (
                <MobileCard
                  key={row.id}
                  row={row}
                  idx={i + 1}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </>
          )}
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{indicators.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* ── Empty global state (no indicators at all) ─────────────────────── */}
      {indicators.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Hash className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No indicators defined yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Fill in the form above and click <strong>Save</strong> to add your first indicator.
            </p>
          </div>
        </div>
      )}

      {/* ── Confirm Delete Modal ─────────────────────────────────────────── */}
      <ConfirmModal
        open={!!deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        itemName={deleteTarget?.indicator_name}
      />

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
