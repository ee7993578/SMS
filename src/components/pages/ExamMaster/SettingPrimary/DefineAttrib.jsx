/**
 * DefineAttrib.jsx
 * Folder: src/pages/Exam/DefineAttrib.jsx
 *
 * Converts legacy ASPX "Define Attributes" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class, Class Type, Header, Category dropdowns (cascading)
 *  - Attribute name + Order inputs
 *  - Save / Reset buttons with validation
 *  - GridView → Desktop table + Mobile cards
 *  - Edit / Delete actions per row
 *  - Toast notifications
 *  - Mobile filter drawer
 *  - All dummy data, API-ready structure
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Tag, RefreshCw, Save, Pencil, Trash2,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, BookOpen, LayoutList,
  School2, ChevronRight, Info, Search,
  Hash, ListOrdered, Layers, FolderOpen,
  PlusCircle, FileText
} from 'lucide-react'

// ─── STATIC DUMMY DATA ────────────────────────────────────────────────────────

const CLASSES = [
  { id: '1', name: 'Nursery' },
  { id: '2', name: 'LKG' },
  { id: '3', name: 'UKG' },
  { id: '4', name: 'Class I' },
  { id: '5', name: 'Class II' },
  { id: '6', name: 'Class III' },
  { id: '7', name: 'Class IV' },
  { id: '8', name: 'Class V' },
  { id: '9', name: 'Class VI' },
  { id: '10', name: 'Class VII' },
  { id: '11', name: 'Class VIII' },
  { id: '12', name: 'Class IX' },
  { id: '13', name: 'Class X' },
  { id: '14', name: 'Class XI' },
  { id: '15', name: 'Class XII' },
]

const CLASS_TYPES = ['Regular', 'Cambridge']

// Headers per class (simulate server-side cascade)
const HEADERS_BY_CLASS = {
  '1': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }],
  '2': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }],
  '3': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }],
  '4': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }],
  '5': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }],
  '6': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }],
  '7': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }],
  '8': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }],
  '9': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }, { id: 'h4', name: 'Co-Curricular' }],
  '10': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }, { id: 'h4', name: 'Co-Curricular' }],
  '11': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }, { id: 'h4', name: 'Co-Curricular' }],
  '12': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }, { id: 'h4', name: 'Co-Curricular' }],
  '13': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }, { id: 'h4', name: 'Co-Curricular' }],
  '14': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }, { id: 'h4', name: 'Co-Curricular' }, { id: 'h5', name: 'Stream Info' }],
  '15': [{ id: 'h1', name: 'Personal Info' }, { id: 'h2', name: 'Academic Info' }, { id: 'h3', name: 'Health Info' }, { id: 'h4', name: 'Co-Curricular' }, { id: 'h5', name: 'Stream Info' }],
}

// Categories per header (simulate cascade)
const CATEGORIES_BY_HEADER = {
  h1: [{ id: 'c1', name: 'Student Details' }, { id: 'c2', name: 'Parent Details' }, { id: 'c3', name: 'Address Details' }],
  h2: [{ id: 'c4', name: 'Subject Details' }, { id: 'c5', name: 'Result Details' }],
  h3: [{ id: 'c6', name: 'Medical History' }, { id: 'c7', name: 'Physical Stats' }],
  h4: [{ id: 'c8', name: 'Sports' }, { id: 'c9', name: 'Arts & Crafts' }],
  h5: [{ id: 'c10', name: 'Science Stream' }, { id: 'c11', name: 'Commerce Stream' }, { id: 'c12', name: 'Arts Stream' }],
}

// Pre-loaded grid data
const INITIAL_ATTRIBUTES = [
  { id: 1, class_id: '4',  class_name: 'Class I',   header_id: 'h1', header_name: 'Personal Info',  category_id: 'c1', category_name: 'Student Details', attribute_id: 'a1',  attribute_name: 'Student Name',   attribute_order: 1 },
  { id: 2, class_id: '4',  class_name: 'Class I',   header_id: 'h1', header_name: 'Personal Info',  category_id: 'c2', category_name: 'Parent Details',  attribute_id: 'a2',  attribute_name: 'Father Name',    attribute_order: 2 },
  { id: 3, class_id: '4',  class_name: 'Class I',   header_id: 'h1', header_name: 'Personal Info',  category_id: 'c2', category_name: 'Parent Details',  attribute_id: 'a3',  attribute_name: 'Mother Name',    attribute_order: 3 },
  { id: 4, class_id: '4',  class_name: 'Class I',   header_id: 'h2', header_name: 'Academic Info',  category_id: 'c4', category_name: 'Subject Details', attribute_id: 'a4',  attribute_name: 'Roll Number',    attribute_order: 1 },
  { id: 5, class_id: '9',  class_name: 'Class VI',  header_id: 'h1', header_name: 'Personal Info',  category_id: 'c1', category_name: 'Student Details', attribute_id: 'a5',  attribute_name: 'Date of Birth',  attribute_order: 4 },
  { id: 6, class_id: '9',  class_name: 'Class VI',  header_id: 'h4', header_name: 'Co-Curricular',  category_id: 'c8', category_name: 'Sports',          attribute_id: 'a6',  attribute_name: 'Sport Name',     attribute_order: 1 },
  { id: 7, class_id: '14', class_name: 'Class XI',  header_id: 'h5', header_name: 'Stream Info',    category_id: 'c10', category_name: 'Science Stream', attribute_id: 'a7',  attribute_name: 'Physics',        attribute_order: 1 },
  { id: 8, class_id: '14', class_name: 'Class XI',  header_id: 'h5', header_name: 'Stream Info',    category_id: 'c10', category_name: 'Science Stream', attribute_id: 'a8',  attribute_name: 'Chemistry',      attribute_order: 2 },
  { id: 9, class_id: '14', class_name: 'Class XI',  header_id: 'h5', header_name: 'Stream Info',    category_id: 'c11', category_name: 'Commerce Stream',attribute_id: 'a9',  attribute_name: 'Accountancy',    attribute_order: 1 },
  { id: 10, class_id: '15', class_name: 'Class XII', header_id: 'h2', header_name: 'Academic Info',  category_id: 'c5', category_name: 'Result Details',  attribute_id: 'a10', attribute_name: 'Board Roll No',  attribute_order: 1 },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

let nextId = INITIAL_ATTRIBUTES.length + 1

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

function Field({ label, error, required, children, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
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

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ open, onConfirm, onCancel, title, message }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-6 w-full max-w-sm"
          style={{ animation: 'popIn .2s ease' }}>
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </span>
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">{title}</h3>
          </div>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-5">{message}</p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2 rounded-xl text-[13px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors">
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
  const { fg, bg } = classColor(row.class_name)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}>
            {formatAbbr(row.class_name)}
          </span>
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class_name}</span>
        </div>
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          <BookOpen className="w-3 h-3 flex-shrink-0" />{row.header_name}
        </span>
      </td>
      <td className="px-3 py-3">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
          <FolderOpen className="w-3 h-3 flex-shrink-0" />{row.category_name}
        </span>
      </td>
      <td className="px-3 py-3">
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{row.attribute_name}</span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 tabular-nums">
          {row.attribute_order}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        <button onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            transition-colors border border-blue-100 dark:border-blue-500/20">
          <Pencil className="w-3 h-3" /> Edit
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class_name)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button type="button" onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {formatAbbr(row.class_name)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.attribute_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {row.class_name} · {row.header_name}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 tabular-nums">
            {row.attribute_order}
          </span>
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Class</p>
              <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{row.class_name}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-1">Order</p>
              <p className="text-[12px] font-bold text-amber-600 dark:text-amber-400 tabular-nums">{row.attribute_order}</p>
            </div>
            <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-400 mb-1">Header</p>
              <p className="text-[12px] font-bold text-blue-700 dark:text-blue-300">{row.header_name}</p>
            </div>
            <div className="rounded-lg bg-violet-50 dark:bg-violet-500/10 p-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-violet-400 mb-1">Category</p>
              <p className="text-[12px] font-bold text-violet-700 dark:text-violet-300">{row.category_name}</p>
            </div>
          </div>
          <button onClick={() => onEdit(row)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors">
            <Pencil className="w-4 h-4" /> Edit Attribute
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineAttrib() {

  // ── Form State ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    classId: '',
    classType: 'Regular',
    headerId: '',
    categoryId: '',
    attribute: '',
    order: '',
  })
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null) // null = add mode, number = edit mode

  // ── Data State ──────────────────────────────────────────────────────────────
  const [attributes, setAttributes] = useState(INITIAL_ATTRIBUTES)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null) // row to delete

  // ── Mobile ──────────────────────────────────────────────────────────────────
  const [mobileFormOpen, setMobileFormOpen] = useState(false)

  // ── Cascading data ──────────────────────────────────────────────────────────
  const headers = useMemo(() => HEADERS_BY_CLASS[form.classId] || [], [form.classId])
  const categories = useMemo(() => CATEGORIES_BY_HEADER[form.headerId] || [], [form.headerId])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Field change handlers ────────────────────────────────────────────────────
  const setField = (key, value) => {
    setForm(prev => {
      const next = { ...prev, [key]: value }
      // Cascade reset
      if (key === 'classId') { next.headerId = ''; next.categoryId = '' }
      if (key === 'headerId') { next.categoryId = '' }
      return next
    })
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!form.classId) err.classId = 'Select a class'
    if (!form.headerId) err.headerId = 'Select a header'
    if (!form.categoryId) err.categoryId = 'Select a category'
    if (!form.attribute.trim()) err.attribute = 'Enter attribute name'
    if (!form.order.toString().trim()) err.order = 'Enter display order'
    return err
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setSaving(true)

    const cls = CLASSES.find(c => c.id === form.classId)
    const hdr = headers.find(h => h.id === form.headerId)
    const cat = categories.find(c => c.id === form.categoryId)

    setTimeout(() => {
      if (editingId !== null) {
        setAttributes(prev => prev.map(a => a.id === editingId ? {
          ...a,
          class_id: form.classId, class_name: cls?.name || '',
          header_id: form.headerId, header_name: hdr?.name || '',
          category_id: form.categoryId, category_name: cat?.name || '',
          attribute_name: form.attribute.trim(),
          attribute_order: parseInt(form.order, 10) || 0,
        } : a))
        showToast('Attribute updated successfully.')
      } else {
        const newRow = {
          id: nextId++,
          class_id: form.classId, class_name: cls?.name || '',
          header_id: form.headerId, header_name: hdr?.name || '',
          category_id: form.categoryId, category_name: cat?.name || '',
          attribute_id: `a${nextId}`,
          attribute_name: form.attribute.trim(),
          attribute_order: parseInt(form.order, 10) || 0,
        }
        setAttributes(prev => [...prev, newRow])
        showToast('Attribute saved successfully.')
      }
      setSaving(false)
      handleReset()
      setMobileFormOpen(false)
    }, 600)
  }, [form, editingId, headers, categories])

  // ── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm({ classId: '', classType: 'Regular', headerId: '', categoryId: '', attribute: '', order: '' })
    setErrors({})
    setEditingId(null)
  }

  // ── Edit row ─────────────────────────────────────────────────────────────────
  const handleEdit = (row) => {
    setForm({
      classId: row.class_id,
      classType: 'Regular',
      headerId: row.header_id,
      categoryId: row.category_id,
      attribute: row.attribute_name,
      order: String(row.attribute_order),
    })
    setEditingId(row.id)
    setErrors({})
    setMobileFormOpen(true)
    // Scroll to top on desktop
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Delete row ───────────────────────────────────────────────────────────────
  const handleDeleteConfirm = (row) => setConfirmDelete(row)
  const handleDeleteExecute = () => {
    if (!confirmDelete) return
    setAttributes(prev => prev.filter(a => a.id !== confirmDelete.id))
    showToast(`"${confirmDelete.attribute_name}" deleted.`)
    setConfirmDelete(null)
    if (editingId === confirmDelete.id) handleReset()
  }

  // ── Search filter ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return attributes
    const q = search.toLowerCase()
    return attributes.filter(r =>
      r.attribute_name.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.header_name.toLowerCase().includes(q) ||
      r.category_name.toLowerCase().includes(q)
    )
  }, [attributes, search])

  const isEditing = editingId !== null

  // ─── FORM FIELDS (shared between desktop panel and mobile drawer) ───────────
  const FormFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Class */}
      <Field label="Class" error={errors.classId} required icon={School2}>
        <NativeSelect value={form.classId} onChange={e => setField('classId', e.target.value)}
          placeholder="-- Select Class --" error={errors.classId}>
          {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </NativeSelect>
      </Field>

      {/* Class Type */}
      <Field label="Class Type" icon={Layers}>
        <NativeSelect value={form.classType} onChange={e => setField('classType', e.target.value)}>
          {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </NativeSelect>
      </Field>

      {/* Header */}
      <Field label="Header" error={errors.headerId} required icon={BookOpen}>
        <NativeSelect value={form.headerId} onChange={e => setField('headerId', e.target.value)}
          placeholder={form.classId ? '-- Select Header --' : '-- Select Class First --'}
          error={errors.headerId} disabled={!form.classId}>
          {headers.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </NativeSelect>
      </Field>

      {/* Category */}
      <Field label="Category" error={errors.categoryId} required icon={FolderOpen}>
        <NativeSelect value={form.categoryId} onChange={e => setField('categoryId', e.target.value)}
          placeholder={form.headerId ? '-- Select Category --' : '-- Select Header First --'}
          error={errors.categoryId} disabled={!form.headerId}>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </NativeSelect>
      </Field>

      {/* Attribute */}
      <Field label="Attribute" error={errors.attribute} required icon={Tag}>
        <div className="relative">
          <input
            type="text"
            value={form.attribute}
            onChange={e => {
              // Prevent single quotes (mimic FilteredTextBoxExtender)
              const val = e.target.value.replace(/'/g, '')
              setField('attribute', val)
            }}
            placeholder="Enter attribute name"
            className={`w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
              bg-white text-slate-800 placeholder-slate-300
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
              dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
              ${errors.attribute ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
          />
        </div>
      </Field>

      {/* Order */}
      <Field label="Order" error={errors.order} required icon={ListOrdered}>
        <input
          type="text"
          inputMode="numeric"
          value={form.order}
          onChange={e => {
            // Only digits
            const val = e.target.value.replace(/[^0-9]/g, '')
            setField('order', val)
          }}
          placeholder="e.g. 1"
          className={`w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
            bg-white text-slate-800 placeholder-slate-300
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
            dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
            ${errors.order ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
        />
      </Field>
    </div>
  )

  // ─── MOBILE FORM DRAWER ────────────────────────────────────────────────────
  const MobileFormDrawer = () => {
    if (!mobileFormOpen) return null
    return (
      <>
        <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => { setMobileFormOpen(false); handleReset() }} />
        <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[92vh] overflow-y-auto"
          style={{ animation: 'drawerUp .25s ease' }}>
          <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
          <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35] z-10">
            <div className="flex items-center gap-2">
              {isEditing
                ? <Pencil className="w-4 h-4 text-amber-500" />
                : <PlusCircle className="w-4 h-4 text-blue-600 dark:text-indigo-400" />}
              <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
                {isEditing ? 'Edit Attribute' : 'Define Attribute'}
              </span>
            </div>
            <button onClick={() => { setMobileFormOpen(false); handleReset() }}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="px-5 py-5 space-y-4">
            <FormFields />
          </div>

          <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
            <button type="button" onClick={() => { handleReset(); setMobileFormOpen(false) }}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isEditing ? 'Update' : 'Save'}
            </button>
          </div>
        </div>
      </>
    )
  }

  // ─── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Tag className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Attributes
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Configure class-wise report card attributes — headers, categories, and display order.
          </p>
        </div>
        {/* Mobile FAB to open form */}
        <button type="button" onClick={() => { handleReset(); setMobileFormOpen(true) }}
          className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white shadow-lg shadow-blue-500/25 active:scale-95 transition-all self-start">
          <PlusCircle className="w-4 h-4" /> Add Attribute
        </button>
      </div>

      {/* ── BREADCRUMB ─────────────────────────────────────────────────────── */}
      <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
        <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300 font-semibold">Define Attributes</span>
      </div>

      {/* ── DESKTOP FORM CARD ──────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className={`flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] 
          ${isEditing
            ? 'bg-amber-50/60 dark:bg-amber-500/[0.05]'
            : 'bg-slate-50/70 dark:bg-white/[0.02]'}`}>
          <span className={`w-1 h-5 rounded-full flex-shrink-0 ${isEditing ? 'bg-amber-500' : 'bg-blue-500'}`} />
          {isEditing
            ? <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            : <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            {isEditing ? `Editing: "${attributes.find(a => a.id === editingId)?.attribute_name}"` : 'Define New Attribute'}
          </span>
          {isEditing && (
            <button onClick={handleReset}
              className="flex items-center gap-1 text-[12px] font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors">
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          <FormFields />

          {/* Info hint for cascading */}
          {!form.classId && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50/60 dark:bg-blue-500/[0.05] border border-blue-100 dark:border-blue-500/15">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Start by selecting a <strong>Class</strong>. Headers and Categories will load based on your selection.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-95 disabled:opacity-70">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {isEditing ? 'Update Attribute' : 'Save Attribute'}
          </button>
          <button type="button" onClick={handleReset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          {isEditing && (
            <span className="text-[12px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 ml-2">
              <Pencil className="w-3 h-3" /> Editing mode — click Reset to cancel
            </span>
          )}
        </div>
      </div>

      {/* ── MOBILE FORM DRAWER ─────────────────────────────────────────────── */}
      <MobileFormDrawer />

      {/* ── ATTRIBUTES TABLE / CARDS ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <LayoutList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Attributes List</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search attributes…"
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

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              <FileText className="w-7 h-7 opacity-40" />
              <span className="text-[13px]">
                {search ? 'No attributes match your search.' : 'No attributes defined yet. Add one above.'}
              </span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Class', 'Header', 'Category', 'Attribute', 'Order', 'Actions'].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.id} row={row} idx={i + 1}
                    onEdit={handleEdit}
                    onDelete={handleDeleteConfirm} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <FileText className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">
                {search ? 'No results.' : 'No attributes yet. Tap "Add Attribute" to begin.'}
              </span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to see details and edit.
              </p>
              {filtered.map((row, i) => (
                <MobileCard key={row.id} row={row} idx={i + 1}
                  onEdit={handleEdit}
                  onDelete={handleDeleteConfirm} />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{attributes.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* ── MOBILE BOTTOM FAB (always visible when form is closed) ─────────── */}
      {!mobileFormOpen && (
        <div className="fixed bottom-6 right-5 sm:hidden z-30">
          <button type="button" onClick={() => { handleReset(); setMobileFormOpen(true) }}
            className="flex items-center gap-2 px-4 py-3 rounded-2xl text-[13px] font-bold
              bg-blue-600 text-white shadow-xl shadow-blue-500/30 active:scale-95 transition-all">
            <PlusCircle className="w-5 h-5" />
            Add Attribute
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        open={!!confirmDelete}
        title="Delete Attribute"
        message={`Are you sure you want to delete "${confirmDelete?.attribute_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteExecute}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
