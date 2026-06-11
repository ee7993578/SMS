/**
 * DefineHeader.jsx
 * Folder: src/pages/ExamMaster/DefineHeader.jsx
 *
 * Converts legacy ASPX "Define Header" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Header name input (letters only, uppercase transform)
 *  - Order input (numbers only)
 *  - Class Type dropdown (Regular / Cambridge)
 *  - Save / Edit functionality
 *  - GridView of saved headers with Edit button
 *  - Mobile: card-based list layout
 *  - Desktop: dense ERP-style table
 *  - Toast notifications, validation, loading states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Save, Edit2, RefreshCw, Plus, AlertCircle,
  X, Check, Loader2, ChevronDown, Search,
  BookOpen, SlidersHorizontal, Hash,
  Tag, Layers, ListOrdered, Eye,
  LayoutList, Info, Filter
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const CLASS_TYPES = ['Regular', 'Cambridge']

const INITIAL_HEADERS = [
  { Header_id: 1, header_name: 'MATHEMATICS',       header_order: 1,  classtype: 'Regular'   },
  { Header_id: 2, header_name: 'SCIENCE',            header_order: 2,  classtype: 'Regular'   },
  { Header_id: 3, header_name: 'ENGLISH',            header_order: 3,  classtype: 'Regular'   },
  { Header_id: 4, header_name: 'SOCIAL STUDIES',     header_order: 4,  classtype: 'Regular'   },
  { Header_id: 5, header_name: 'HINDI',              header_order: 5,  classtype: 'Regular'   },
  { Header_id: 6, header_name: 'COMPUTER SCIENCE',   header_order: 6,  classtype: 'Regular'   },
  { Header_id: 7, header_name: 'PHYSICS',            header_order: 1,  classtype: 'Cambridge' },
  { Header_id: 8, header_name: 'CHEMISTRY',          header_order: 2,  classtype: 'Cambridge' },
  { Header_id: 9, header_name: 'BIOLOGY',            header_order: 3,  classtype: 'Cambridge' },
  { Header_id: 10,header_name: 'LITERATURE',         header_order: 4,  classtype: 'Cambridge' },
  { Header_id: 11,header_name: 'ENVIRONMENTAL SCIENCE',header_order: 7,classtype: 'Regular'   },
  { Header_id: 12,header_name: 'PHYSICAL EDUCATION', header_order: 8,  classtype: 'Regular'   },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let nextId = INITIAL_HEADERS.length + 1

const CLASS_TYPE_STYLES = {
  Regular:   { fg: '#1d4ed8', bg: '#dbeafe', dot: 'bg-blue-500'   },
  Cambridge: { fg: '#7c3aed', bg: '#ede9fe', dot: 'bg-violet-500' },
}

// Strip invalid chars: keep only A-Z space
const sanitizeHeader = (val) => val.replace(/[^a-zA-Z\s]/g, '').toUpperCase()

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

// ─── CLASS TYPE BADGE ─────────────────────────────────────────────────────────
function ClassTypeBadge({ type }) {
  const style = CLASS_TYPE_STYLES[type] || CLASS_TYPE_STYLES.Regular
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
      style={{ background: style.bg, color: style.fg }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {type}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Class Type */}
      <td className="px-4 py-3">
        <ClassTypeBadge type={row.classtype} />
      </td>

      {/* Header Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10">
            <Tag className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
            {row.header_name}
          </span>
        </div>
      </td>

      {/* Order */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-bold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 tabular-nums">
          {row.header_order}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            transition-all active:scale-95"
        >
          <Edit2 className="w-3.5 h-3.5" /> Edit
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onEdit }) {
  const style = CLASS_TYPE_STYLES[row.classtype] || CLASS_TYPE_STYLES.Regular

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Order badge */}
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold"
          style={{ background: style.bg, color: style.fg }}
        >
          {row.header_order}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.header_name}
          </p>
          <div className="mt-1">
            <ClassTypeBadge type={row.classtype} />
          </div>
        </div>

        {/* Edit button */}
        <button
          type="button"
          onClick={() => onEdit(row)}
          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
            bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
            transition-all active:scale-95 shadow-sm shadow-blue-500/20"
        >
          <Edit2 className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineHeader() {
  // ── Form State ──────────────────────────────────────────────────────────────
  const [headerName, setHeaderName]     = useState('')
  const [order,      setOrder]          = useState('')
  const [classType,  setClassType]      = useState('Regular')
  const [editingId,  setEditingId]      = useState(null)
  const [errors,     setErrors]         = useState({})
  const [saving,     setSaving]         = useState(false)

  // ── Data State ───────────────────────────────────────────────────────────────
  const [headers,    setHeaders]        = useState(INITIAL_HEADERS)

  // ── UI State ─────────────────────────────────────────────────────────────────
  const [search,     setSearch]         = useState('')
  const [filterType, setFilterType]     = useState('')   // '' = All
  const [toast,      setToast]          = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const err = {}
    if (!headerName.trim()) err.headerName = 'Header name is required'
    else if (headerName.trim().length < 2) err.headerName = 'Too short — min 2 characters'
    if (!order.toString().trim()) err.order = 'Order is required'
    else if (isNaN(Number(order)) || Number(order) < 1) err.order = 'Enter a valid positive number'
    return err
  }, [headerName, order])

  // ── Save / Update ────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setSaving(true)

    setTimeout(() => {
      if (editingId !== null) {
        // Update existing
        setHeaders(prev =>
          prev.map(h =>
            h.Header_id === editingId
              ? { ...h, header_name: headerName.trim(), header_order: Number(order), classtype: classType }
              : h
          )
        )
        showToast(`Header "${headerName.trim()}" updated successfully.`)
      } else {
        // Add new
        const newRow = {
          Header_id:    nextId++,
          header_name:  headerName.trim(),
          header_order: Number(order),
          classtype:    classType,
        }
        setHeaders(prev => [...prev, newRow])
        showToast(`Header "${headerName.trim()}" saved successfully.`)
      }
      handleReset()
      setSaving(false)
    }, 600)
  }, [headerName, order, classType, editingId, validate])

  // ── Edit ──────────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((row) => {
    setHeaderName(row.header_name)
    setOrder(row.header_order.toString())
    setClassType(row.classtype)
    setEditingId(row.Header_id)
    setErrors({})
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Reset Form ────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setHeaderName('')
    setOrder('')
    setClassType('Regular')
    setEditingId(null)
    setErrors({})
  }, [])

  // ── Filtered list ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return headers.filter(h => {
      const matchSearch = !search ||
        h.header_name.toLowerCase().includes(search.toLowerCase()) ||
        h.classtype.toLowerCase().includes(search.toLowerCase())
      const matchType = !filterType || h.classtype === filterType
      return matchSearch && matchType
    })
  }, [headers, search, filterType])

  const isEditing = editingId !== null

  return (
    <div className="space-y-5 pb-12">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <LayoutList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Header
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Create and manage exam section headers for Regular &amp; Cambridge classes.
          </p>
        </div>

        {/* Summary pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[12px] font-semibold text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
            <Layers className="w-3.5 h-3.5" />
            {headers.filter(h => h.classtype === 'Regular').length} Regular
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-[12px] font-semibold text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-500/20">
            <Layers className="w-3.5 h-3.5" />
            {headers.filter(h => h.classtype === 'Cambridge').length} Cambridge
          </span>
        </div>
      </div>

      {/* ── Form Card ──────────────────────────────────────────────────────── */}
      <div className={`rounded-2xl border shadow-sm overflow-hidden transition-all
        ${isEditing
          ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/30 dark:bg-amber-500/[0.03]'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35]'
        }`}
      >
        {/* Card Header */}
        <div className={`flex items-center justify-between px-5 py-3.5 border-b
          ${isEditing
            ? 'border-amber-200 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/[0.05]'
            : 'border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className={`w-1 h-5 rounded-full flex-shrink-0 ${isEditing ? 'bg-amber-500' : 'bg-blue-500'}`} />
            {isEditing
              ? <Edit2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              : <Plus  className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            }
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
              {isEditing ? `Editing — ${headerName || 'Header'}` : 'Add New Header'}
            </span>
          </div>
          {isEditing && (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        {/* Form Body */}
        <div className="p-5">
          {/* Edit mode notice */}
          {isEditing && (
            <div className="flex items-center gap-2 mb-4 px-4 py-3 rounded-xl bg-amber-100/60 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-[12px] text-amber-700 dark:text-amber-400 font-medium">
              <Info className="w-4 h-4 flex-shrink-0" />
              You are editing an existing header. Make changes and click <strong className="ml-1">Update</strong>.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Header Name */}
            <Field label="Header Name" error={errors.headerName} required hint="Letters only — auto converted to uppercase">
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={headerName}
                  onChange={e => {
                    setHeaderName(sanitizeHeader(e.target.value))
                    setErrors(p => ({ ...p, headerName: undefined }))
                  }}
                  placeholder="e.g. MATHEMATICS"
                  maxLength={60}
                  className={`w-full pl-9 pr-4 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                    dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                    ${errors.headerName
                      ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
                      : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                    }`}
                />
              </div>
            </Field>

            {/* Order */}
            <Field label="Order" error={errors.order} required hint="Display sequence number">
              <div className="relative">
                <ListOrdered className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={order}
                  onChange={e => {
                    const val = e.target.value.replace(/[^0-9]/g, '')
                    setOrder(val)
                    setErrors(p => ({ ...p, order: undefined }))
                  }}
                  placeholder="e.g. 1"
                  maxLength={4}
                  className={`w-full pl-9 pr-4 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                    dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                    ${errors.order
                      ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
                      : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                    }`}
                />
              </div>
            </Field>

            {/* Class Type */}
            <Field label="Class Type" required>
              <NativeSelect
                value={classType}
                onChange={e => setClassType(e.target.value)}
              >
                {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                shadow-md transition-all active:scale-95 disabled:opacity-70
                ${isEditing
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700'
                }`}
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />
              }
              {isEditing ? 'Update Header' : 'Save Header'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                transition-colors active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Headers List Card ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">All Headers</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Controls row */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {/* Class Type filter */}
            <div className="relative flex-shrink-0">
              <Filter className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="appearance-none pl-7 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all cursor-pointer
                  bg-white text-slate-700 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]"
              >
                <option value="">All Types</option>
                {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
            </div>

            {/* Search */}
            <div className="relative flex-1 sm:w-52 sm:flex-none">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search headers…"
                className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600"
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
          </div>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState search={search} filterType={filterType} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Class Type', 'Header Name', 'Order', 'Action'].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow
                    key={row.Header_id}
                    row={row}
                    idx={i + 1}
                    onEdit={handleEdit}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState search={search} filterType={filterType} />
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap Edit to modify a header.
              </p>
              {filtered.map((row, i) => (
                <MobileCard
                  key={row.Header_id}
                  row={row}
                  idx={i + 1}
                  onEdit={handleEdit}
                />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
            {' '}of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{headers.length}</span>
            {' '}headers
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

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search, filterType }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Search className="w-6 h-6 opacity-40" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No headers found</p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
          {search || filterType
            ? 'Try adjusting your search or filter.'
            : 'Add a header using the form above.'}
        </p>
      </div>
    </div>
  )
}
