/**
 * ItemCategory.jsx
 * Folder: src/pages/Library/ItemCategory.jsx
 *
 * Converts legacy ASPX "lib_book_category" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Add / Edit / Delete item categories
 *  - Fields: Code, Name, Unit, Remark
 *  - Inline form with validation
 *  - Desktop: data-dense ERP table
 *  - Mobile: card-based layout with actions
 *  - Toast notifications
 *  - Loading states, empty states
 *  - Search/filter on grid
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Plus, Edit2, Trash2, Save, X, RefreshCw,
  Search, AlertCircle, Check, Loader2,
  BookOpen, Tag, Hash, AlignLeft, Layers,
  ChevronDown, MoreVertical, Info,
  Library, PackageOpen, ArrowUpDown
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────
const INITIAL_DATA = [
  { itemcat_id: 1, code: 'BK001', name: 'BOOKS',        unit: 'PCS',  remark: 'All kinds of books'         },
  { itemcat_id: 2, code: 'MG002', name: 'MAGAZINES',    unit: 'COPY', remark: 'Monthly and weekly issues'  },
  { itemcat_id: 3, code: 'JR003', name: 'JOURNALS',     unit: 'VOL',  remark: 'Academic journals'          },
  { itemcat_id: 4, code: 'NP004', name: 'NEWSPAPERS',   unit: 'COPY', remark: 'Daily newspapers'           },
  { itemcat_id: 5, code: 'RF005', name: 'REFERENCE',    unit: 'PCS',  remark: 'Reference material only'    },
  { itemcat_id: 6, code: 'CD006', name: 'CDS AND DVDS', unit: 'NOS',  remark: 'Audio visual material'      },
  { itemcat_id: 7, code: 'MP007', name: 'MAPS',         unit: 'ROLL', remark: 'Geographic and educational' },
]

let _nextId = 8

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const UNIT_COLORS = {
  PCS:  { bg: 'bg-blue-50  dark:bg-blue-500/10',   text: 'text-blue-700  dark:text-blue-300'  },
  COPY: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300' },
  VOL:  { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-300' },
  NOS:  { bg: 'bg-amber-50  dark:bg-amber-500/10',  text: 'text-amber-700  dark:text-amber-300'  },
  ROLL: { bg: 'bg-cyan-50   dark:bg-cyan-500/10',   text: 'text-cyan-700   dark:text-cyan-300'   },
}
const unitStyle = (u = '') => UNIT_COLORS[u] ?? { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-600 dark:text-slate-300' }

const CAT_BADGE_COLORS = [
  { bg: '#dbeafe', fg: '#1d4ed8' },
  { bg: '#ede9fe', fg: '#7c3aed' },
  { bg: '#d1fae5', fg: '#059669' },
  { bg: '#fef3c7', fg: '#d97706' },
  { bg: '#cffafe', fg: '#0891b2' },
  { bg: '#fee2e2', fg: '#dc2626' },
  { bg: '#e0f2fe', fg: '#0369a1' },
]
const catColor = (id) => CAT_BADGE_COLORS[(id ?? 0) % CAT_BADGE_COLORS.length]

const EMPTY_FORM = { code: '', name: '', unit: '', remark: '' }

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Input field wrapper */
function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="ml-auto text-[10px] font-medium text-slate-400 dark:text-slate-500 normal-case tracking-normal">{hint}</span>
        )}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

/** Text input */
function TextInput({ value, onChange, placeholder, error, disabled, uppercase = true, icon: Icon, maxLength }) {
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      )}
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${uppercase ? 'uppercase' : ''}
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      />
    </div>
  )
}

/** Textarea */
function TextArea({ value, onChange, placeholder, error, disabled }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      rows={2}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed uppercase
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
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
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success'
          ? 'bg-emerald-600 text-white'
          : type === 'error'
          ? 'bg-rose-600 text-white'
          : 'bg-amber-500 text-white'
        }`}
      style={{ animation: 'slideUpToast .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
      <style>{`
        @keyframes slideUpToast {
          from { opacity: 0; transform: translateX(-50%) translateY(10px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0);    }
        }
      `}</style>
    </div>
  )
}

/** Delete confirm modal */
function DeleteModal({ item, onConfirm, onCancel, loading }) {
  if (!item) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
          w-[90vw] max-w-md bg-white dark:bg-[#1a1f35]
          rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
          shadow-2xl p-6"
        style={{ animation: 'popIn .2s ease' }}
      >
        <style>{`@keyframes popIn{from{opacity:0;transform:translate(-50%,-50%) scale(.95)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Delete Category?</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span> ({item.code})?
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-70 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { bg, fg } = catColor(row.itemcat_id)
  const ust = unitStyle(row.unit)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Badge */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold leading-tight text-center"
          style={{ background: bg, color: fg }}
        >
          {row.code.slice(0, 3)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${ust.bg} ${ust.text}`}>
              {row.unit || '—'}
            </span>
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
            Code: <span className="font-semibold text-slate-600 dark:text-slate-300">{row.code}</span>
          </p>
          {row.remark && (
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">{row.remark}</p>
          )}
        </div>

        {/* Actions menu */}
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen(p => !p)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] shadow-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onEdit(row) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-blue-500" /> Edit
                </button>
                <button
                  type="button"
                  onClick={() => { setMenuOpen(false); onDelete(row) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit, onDelete }) {
  const { bg, fg } = catColor(row.itemcat_id)
  const ust = unitStyle(row.unit)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Code */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {row.code.slice(0, 3)}
          </span>
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tracking-wide">{row.code}</span>
        </div>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{row.name}</span>
      </td>

      {/* Unit */}
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${ust.bg} ${ust.text}`}>
          {row.unit || '—'}
        </span>
      </td>

      {/* Remark */}
      <td className="px-4 py-3">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 line-clamp-2">{row.remark || '—'}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(row)}
            title="Edit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100
              dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            title="Delete"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
              bg-rose-50 text-rose-600 hover:bg-rose-100
              dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── FORM PANEL ───────────────────────────────────────────────────────────────
function FormPanel({ form, errors, onChange, onSubmit, onCancel, loading, isEdit }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
          {isEdit ? <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        </div>
        <div className="flex-1">
          <h3 className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
            {isEdit ? 'Edit Item Category' : 'Add Item Category'}
          </h3>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {isEdit ? 'Update the category details below.' : 'Fill in details to create a new library item category.'}
          </p>
        </div>
        {isEdit && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            title="Cancel edit"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Fields */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Code" required error={errors.code} hint="e.g. BK001">
            <TextInput
              value={form.code}
              onChange={e => onChange('code', e.target.value.replace(/['"`]/g, ''))}
              placeholder="Enter code"
              error={errors.code}
              disabled={loading}
              icon={Hash}
              maxLength={20}
            />
          </Field>

          <Field label="Name" required error={errors.name}>
            <TextInput
              value={form.name}
              onChange={e => onChange('name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
              placeholder="Enter name"
              error={errors.name}
              disabled={loading}
              icon={Tag}
            />
          </Field>

          <Field label="Unit" error={errors.unit} hint="PCS, COPY, VOL…">
            <TextInput
              value={form.unit}
              onChange={e => onChange('unit', e.target.value.replace(/[^0-9A-Z]/gi, ''))}
              placeholder="e.g. PCS"
              error={errors.unit}
              disabled={loading}
              icon={PackageOpen}
              maxLength={10}
            />
          </Field>

          <Field label="Remark">
            <TextArea
              value={form.remark}
              onChange={e => onChange('remark', e.target.value.replace(/['"`]/g, ''))}
              placeholder="Optional note…"
              disabled={loading}
            />
          </Field>
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : isEdit
              ? <Save className="w-4 h-4" />
              : <Plus className="w-4 h-4" />
            }
            {isEdit ? 'Save Changes' : 'Submit'}
          </button>
          {isEdit && (
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SUMMARY STATS ────────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }
  return (
    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${colors[color]} border border-current/10`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="text-[13px] font-bold tabular-nums">{value}</span>
      <span className="text-[11px] font-semibold opacity-75">{label}</span>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ItemCategory() {
  // ── State ──────────────────────────────────────────────────────────────────
  const [items,       setItems]       = useState(INITIAL_DATA)
  const [form,        setForm]        = useState(EMPTY_FORM)
  const [errors,      setErrors]      = useState({})
  const [editingId,   setEditingId]   = useState(null)   // null = add mode
  const [loading,     setLoading]     = useState(false)
  const [deleteTarget,setDeleteTarget]= useState(null)
  const [delLoading,  setDelLoading]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [sortAsc,     setSortAsc]     = useState(true)
  const [toast,       setToast]       = useState(null)
  const formRef = useRef(null)

  const isEdit = editingId !== null

  // ── Helpers ────────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleChange = useCallback((field, value) => {
    setForm(p => ({ ...p, [field]: value.toUpperCase() }))
    setErrors(p => ({ ...p, [field]: undefined }))
  }, [])

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!form.code.trim()) err.code = 'Code is required'
    else if (items.some(i => i.code === form.code.trim() && i.itemcat_id !== editingId))
      err.code = 'Code already exists'
    if (!form.name.trim()) err.name = 'Name is required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Submit (Add / Edit) ────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      if (isEdit) {
        setItems(prev => prev.map(i =>
          i.itemcat_id === editingId
            ? { ...i, code: form.code.trim(), name: form.name.trim(), unit: form.unit.trim(), remark: form.remark.trim() }
            : i
        ))
        showToast(`Category "${form.name}" updated successfully.`)
        setEditingId(null)
      } else {
        const newItem = {
          itemcat_id: _nextId++,
          code:   form.code.trim(),
          name:   form.name.trim(),
          unit:   form.unit.trim(),
          remark: form.remark.trim(),
        }
        setItems(prev => [newItem, ...prev])
        showToast(`Category "${form.name}" added successfully.`)
      }
      setForm(EMPTY_FORM)
      setErrors({})
      setLoading(false)
    }, 600)
  }, [form, isEdit, editingId, items])

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((row) => {
    setEditingId(row.itemcat_id)
    setForm({ code: row.code, name: row.name, unit: row.unit, remark: row.remark })
    setErrors({})
    // Scroll form into view on mobile
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50)
  }, [])

  const handleCancelEdit = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    setDelLoading(true)
    setTimeout(() => {
      setItems(prev => prev.filter(i => i.itemcat_id !== deleteTarget.itemcat_id))
      showToast(`Category "${deleteTarget.name}" deleted.`, 'error')
      setDeleteTarget(null)
      setDelLoading(false)
      if (editingId === deleteTarget.itemcat_id) handleCancelEdit()
    }, 500)
  }, [deleteTarget, editingId])

  // ── Reset form ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    setEditingId(null)
    setSearch('')
  }

  // ── Filtered + sorted data ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let data = q
      ? items.filter(i =>
          i.code.toLowerCase().includes(q) ||
          i.name.toLowerCase().includes(q) ||
          i.unit.toLowerCase().includes(q) ||
          i.remark.toLowerCase().includes(q)
        )
      : [...items]
    data.sort((a, b) => sortAsc
      ? a.name.localeCompare(b.name)
      : b.name.localeCompare(a.name)
    )
    return data
  }, [items, search, sortAsc])

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
        <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Home</span>
        <span>/</span>
        <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Library</span>
        <span>/</span>
        <span className="text-slate-700 dark:text-slate-200 font-semibold">Item Category</span>
      </nav>

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <Library className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h1 className="text-[20px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              Item Category
            </h1>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
              Manage library item categories — books, magazines, journals and more.
            </p>
          </div>
        </div>

        {/* Summary pills — desktop */}
        <div className="hidden sm:flex items-center gap-2">
          <StatPill icon={Layers}   label="Total"      value={items.length}   color="blue"   />
          <StatPill icon={BookOpen} label="Shown"      value={filtered.length} color="violet" />
        </div>
      </div>

      {/* ── FORM PANEL ──────────────────────────────────────────────────────── */}
      <div ref={formRef}>
        <FormPanel
          form={form}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onCancel={handleCancelEdit}
          loading={loading}
          isEdit={isEdit}
        />
      </div>

      {/* ── GRID / TABLE ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5
          border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Category List</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full
              bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 sm:w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600 dark:focus:border-indigo-400"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort toggle */}
            <button
              type="button"
              onClick={() => setSortAsc(p => !p)}
              title={`Sort ${sortAsc ? 'Z→A' : 'A→Z'}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-slate-100 text-slate-600 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{sortAsc ? 'A→Z' : 'Z→A'}</span>
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={handleReset}
              title="Reset"
              className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Info hint */}
        <div className="flex items-center gap-2 px-5 py-2
          border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]
          bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[11px] text-blue-700 dark:text-blue-400">
            Click <strong>Edit</strong> on a row to modify it. Changes are saved instantly.
            {' '}On mobile, tap the ⋮ menu on each card.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-600">
              <Search className="w-8 h-8 opacity-30" />
              <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                {search ? 'No categories match your search.' : 'No categories added yet.'}
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Code', 'Name', 'Unit', 'Remark', 'Action'].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow
                    key={row.itemcat_id}
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
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
              <Search className="w-8 h-8 opacity-30" />
              <p className="text-[13px] font-semibold text-center">
                {search ? 'No categories match your search.' : 'No categories yet. Add one above!'}
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap the ⋮ menu on any card to edit or delete.
              </p>
              {filtered.map(row => (
                <MobileCard
                  key={row.itemcat_id}
                  row={row}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5
          border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
            {' '}of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{items.length}</span>
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

      {/* ── Delete Confirm Modal ─────────────────────────────────────────────── */}
      <DeleteModal
        item={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={delLoading}
      />

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
