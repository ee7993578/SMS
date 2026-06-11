/**
 * IndicatorCategory.jsx
 * Folder: src/pages/ExamMaster/IndicatorCategory.jsx
 *
 * Converts legacy ASPX "Define Indicator Category" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class Type dropdown (Regular / Cambridge)
 *  - Indicator Category text input with validation
 *  - Save button with inline validation
 *  - Editable GridView → responsive table (desktop) / card list (mobile)
 *  - Inline Edit / Update / Cancel / Delete per row
 *  - Toast notifications
 *  - Mobile-first layout with filter drawer
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Tag, Save, Pencil, Trash2, X, Check, AlertCircle,
  Loader2, ChevronDown, SlidersHorizontal, Plus,
  BookOpen, RefreshCw, Search, Info, ListFilter,
  GraduationCap, LayoutGrid, TrendingUp
} from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const INITIAL_DATA = [
  { id: 1, indicator_category: 'Academic Performance',    ClassType: 'Regular'   },
  { id: 2, indicator_category: 'Behavioural Skills',      ClassType: 'Regular'   },
  { id: 3, indicator_category: 'Co-Curricular Activity',  ClassType: 'Regular'   },
  { id: 4, indicator_category: 'Language Proficiency',    ClassType: 'Cambridge' },
  { id: 5, indicator_category: 'Critical Thinking',       ClassType: 'Cambridge' },
  { id: 6, indicator_category: 'Sports & Fitness',        ClassType: 'Regular'   },
  { id: 7, indicator_category: 'Creative Expression',     ClassType: 'Cambridge' },
  { id: 8, indicator_category: 'Digital Literacy',        ClassType: 'Regular'   },
]

const CLASS_TYPES = ['Regular', 'Cambridge']

// ─── HELPERS ─────────────────────────────────────────────────────────────────
let _nextId = INITIAL_DATA.length + 1
const newId = () => _nextId++

const CLASS_TYPE_STYLE = {
  Regular:   { fg: '#1d4ed8', bg: '#dbeafe' },
  Cambridge: { fg: '#7c3aed', bg: '#ede9fe' },
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

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[90vw] max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] shadow-2xl
          border border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-6"
        style={{ animation: 'fadeIn .2s ease' }}
      >
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translate(-50%,-48%)}to{opacity:1;transform:translate(-50%,-50%)}}`}</style>
        <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <p className="text-[14px] font-semibold text-slate-800 dark:text-slate-100 text-center mb-1">Delete Category</p>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white
              hover:bg-rose-700 transition-colors shadow-md shadow-rose-500/20">
            Delete
          </button>
        </div>
      </div>
    </>
  )
}

// ─── CLASS TYPE BADGE ─────────────────────────────────────────────────────────
function ClassTypeBadge({ type }) {
  const s = CLASS_TYPE_STYLE[type] || { fg: '#64748b', bg: '#f1f5f9' }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold"
      style={{ background: s.bg, color: s.fg }}
    >
      {type}
    </span>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
      bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, editingId, editValues, onEdit, onUpdate, onCancel, onDelete, onEditChange }) {
  const isEditing = editingId === row.id

  if (isEditing) {
    return (
      <tr className="border-b border-blue-100 dark:border-indigo-500/20 bg-blue-50/40 dark:bg-indigo-500/[0.04]">
        <td className="px-4 py-3 text-center text-[12px] text-slate-400 w-12">{idx}</td>
        <td className="px-4 py-3">
          <div className="relative">
            <input
              value={editValues.indicator_category}
              onChange={e => onEditChange('indicator_category', e.target.value)}
              className={`w-full pl-3 pr-8 py-1.5 text-[13px] rounded-lg border outline-none transition-all
                bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
                ${!editValues.indicator_category.trim() ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
              placeholder="Indicator Category"
              autoFocus
            />
          </div>
        </td>
        <td className="px-4 py-3">
          <NativeSelect
            value={editValues.ClassType}
            onChange={e => onEditChange('ClassType', e.target.value)}
          >
            {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </NativeSelect>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button onClick={() => onUpdate(row.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">
              <Check className="w-3.5 h-3.5" /> Update
            </button>
            <button onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </td>
        <td className="px-4 py-3" />
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.indicator_category}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <ClassTypeBadge type={row.ClassType} />
      </td>
      <td className="px-4 py-3">
        <button onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            transition-colors">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
      </td>
      <td className="px-4 py-3">
        <button onClick={() => onDelete(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, editingId, editValues, onEdit, onUpdate, onCancel, onDelete, onEditChange }) {
  const isEditing = editingId === row.id

  if (isEditing) {
    return (
      <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/40 bg-blue-50/40 dark:bg-indigo-500/[0.04] overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-100 dark:border-indigo-500/20 bg-blue-50/60 dark:bg-indigo-500/[0.06]">
          <Pencil className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Editing Row #{idx}</span>
        </div>
        <div className="p-4 space-y-3">
          <Field label="Indicator Category" required error={!editValues.indicator_category.trim() ? 'Required' : undefined}>
            <input
              value={editValues.indicator_category}
              onChange={e => onEditChange('indicator_category', e.target.value)}
              className={`w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
                ${!editValues.indicator_category.trim() ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
              placeholder="Enter indicator category"
              autoFocus
            />
          </Field>
          <Field label="Class Type" required>
            <NativeSelect
              value={editValues.ClassType}
              onChange={e => onEditChange('ClassType', e.target.value)}
            >
              {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <div className="flex gap-2 pt-1">
            <button onClick={() => onUpdate(row.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">
              <Check className="w-4 h-4" /> Update
            </button>
            <button onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.indicator_category}</p>
          <div className="mt-0.5">
            <ClassTypeBadge type={row.ClassType} />
          </div>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 tabular-nums flex-shrink-0">#{idx}</span>
      </div>
      <div className="flex border-t border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
        <button onClick={() => onEdit(row)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold
            text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors border-r border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <button onClick={() => onDelete(row)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold
            text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function IndicatorCategory() {
  // ── Form State ──────────────────────────────────────────────────────────────
  const [classType,  setClassType]  = useState('Regular')
  const [catName,    setCatName]    = useState('')
  const [formErrors, setFormErrors] = useState({})
  const [saving,     setSaving]     = useState(false)

  // ── Table State ─────────────────────────────────────────────────────────────
  const [rows,      setRows]      = useState(INITIAL_DATA)
  const [editingId, setEditingId] = useState(null)
  const [editVals,  setEditVals]  = useState({ indicator_category: '', ClassType: 'Regular' })
  const [search,    setSearch]    = useState('')
  const [filterType, setFilterType] = useState('') // '' = all

  // ── UI State ─────────────────────────────────────────────────────────────────
  const [toast,       setToast]       = useState(null)
  const [confirmDel,  setConfirmDel]  = useState(null) // row object or null
  const [formVisible, setFormVisible] = useState(true)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & Save ─────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const err = {}
    if (!catName.trim()) err.catName = 'Indicator Category is required'
    if (Object.keys(err).length) { setFormErrors(err); return }
    setFormErrors({})
    setSaving(true)

    setTimeout(() => {
      const newRow = {
        id: newId(),
        indicator_category: catName.trim(),
        ClassType: classType,
      }
      setRows(prev => [...prev, newRow])
      setCatName('')
      setSaving(false)
      showToast(`Category "${newRow.indicator_category}" saved successfully.`)
    }, 500)
  }, [catName, classType])

  // ── Edit Handlers ────────────────────────────────────────────────────────────
  const handleEdit = (row) => {
    setEditingId(row.id)
    setEditVals({ indicator_category: row.indicator_category, ClassType: row.ClassType })
  }

  const handleEditChange = (key, val) => setEditVals(p => ({ ...p, [key]: val }))

  const handleUpdate = useCallback((id) => {
    if (!editVals.indicator_category.trim()) return
    setRows(prev => prev.map(r => r.id === id ? { ...r, ...editVals, indicator_category: editVals.indicator_category.trim() } : r))
    setEditingId(null)
    showToast('Category updated successfully.')
  }, [editVals])

  const handleCancelEdit = () => setEditingId(null)

  // ── Delete Handlers ──────────────────────────────────────────────────────────
  const handleDeleteClick = (row) => setConfirmDel(row)

  const handleDeleteConfirm = useCallback(() => {
    if (!confirmDel) return
    setRows(prev => prev.filter(r => r.id !== confirmDel.id))
    showToast(`Category "${confirmDel.indicator_category}" deleted.`, 'error')
    setConfirmDel(null)
  }, [confirmDel])

  // ── Filtered Rows ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = rows
    if (filterType) r = r.filter(x => x.ClassType === filterType)
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(x => x.indicator_category.toLowerCase().includes(q) || x.ClassType.toLowerCase().includes(q))
    }
    return r
  }, [rows, search, filterType])

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const totalRegular   = rows.filter(r => r.ClassType === 'Regular').length
  const totalCambridge = rows.filter(r => r.ClassType === 'Cambridge').length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Indicator Category
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage exam indicator categories for Regular and Cambridge class types.
          </p>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard icon={LayoutGrid}     label="Total Categories"  value={rows.length}      color="blue"    />
        <SummaryCard icon={GraduationCap}  label="Regular"           value={totalRegular}     color="emerald" />
        <SummaryCard icon={BookOpen}       label="Cambridge"         value={totalCambridge}   color="violet"  />
      </div>

      {/* ── Add Category Form ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Form Header */}
        <button
          type="button"
          onClick={() => setFormVisible(p => !p)}
          className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
            bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.04] transition-colors text-left"
        >
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Add New Category</span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${formVisible ? 'rotate-180' : ''}`} />
        </button>

        {formVisible && (
          <div className="p-5">
            {/* Breadcrumb hint */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 mb-4">
              <span>Home</span>
              <span>›</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">Define Indicator Category</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              {/* Class Type */}
              <Field label="Class Type" required>
                <NativeSelect
                  value={classType}
                  onChange={e => setClassType(e.target.value)}
                >
                  {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </NativeSelect>
              </Field>

              {/* Category Name */}
              <Field label="Indicator Category" required error={formErrors.catName}>
                <input
                  value={catName}
                  onChange={e => { setCatName(e.target.value); setFormErrors(p => ({ ...p, catName: undefined })) }}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  placeholder="e.g. Academic Performance"
                  className={`w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                    dark:focus:border-indigo-400
                    ${formErrors.catName
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                    }`}
                />
              </Field>

              {/* Spacer on lg */}
              <div className="hidden lg:block" />

              {/* Save Button */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-2 py-2 px-6 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />}
                Save Category
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Records Table/Cards ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5
          border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">All Categories</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Type filter */}
            <div className="relative flex-shrink-0">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="appearance-none pl-3 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 cursor-pointer
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]"
              >
                <option value="">All Types</option>
                {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ListFilter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {(search || filterType) && (
              <button
                onClick={() => { setSearch(''); setFilterType('') }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100
                  dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                title="Reset filters"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Info hint */}
        <div className="hidden sm:flex items-center gap-2 px-5 py-2
          border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]
          bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Click Edit to modify a category inline. Changes are saved immediately on Update.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Tag className="w-6 h-6 opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">No categories found</p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {search || filterType ? 'Try adjusting your search or filter.' : 'Add a new category using the form above.'}
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Indicator Category Name', 'Class Type', 'Edit', 'Delete'].map((h, i) => (
                    <th key={i}
                      className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
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
                    editingId={editingId}
                    editValues={editVals}
                    onEdit={handleEdit}
                    onUpdate={handleUpdate}
                    onCancel={handleCancelEdit}
                    onDelete={handleDeleteClick}
                    onEditChange={handleEditChange}
                  />
                ))}
                {/* Grand total row */}
                <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                  <td className="px-4 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                  <td className="px-4 py-3" colSpan={4}>
                    <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Total: {filtered.length} categor{filtered.length !== 1 ? 'ies' : 'y'} shown
                      {filterType && <span className="text-[11px] font-normal text-blue-500">· filtered by {filterType}</span>}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Tag className="w-6 h-6 opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">No categories found</p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {search || filterType ? 'Try adjusting your search or filter.' : 'Add a new category using the form above.'}
                </p>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap Edit on any card to modify it inline.
              </p>

              {filtered.map((row, i) => (
                <MobileCard
                  key={row.id}
                  row={row}
                  idx={i + 1}
                  editingId={editingId}
                  editValues={editVals}
                  onEdit={handleEdit}
                  onUpdate={handleUpdate}
                  onCancel={handleCancelEdit}
                  onDelete={handleDeleteClick}
                  onEditChange={handleEditChange}
                />
              ))}

              {/* Mobile totals */}
              <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" /> Summary
                </p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                    <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{rows.length}</p>
                    <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total</p>
                  </div>
                  <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                    <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{totalRegular}</p>
                    <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Regular</p>
                  </div>
                  <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                    <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{totalCambridge}</p>
                    <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Cambridge</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5
          border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> categories
          </p>
          {(search || filterType) && (
            <button
              onClick={() => { setSearch(''); setFilterType('') }}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirm Modal */}
      {confirmDel && (
        <ConfirmModal
          message={`Are you sure you want to delete "${confirmDel.indicator_category}"? This action cannot be undone.`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setConfirmDel(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
