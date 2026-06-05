/**
 * DefineTransportType.jsx
 * Folder: src/pages/Transport/DefineTransportType.jsx
 *
 * Converts legacy ASPX "Define_Transport_Type" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Add / Edit / Delete transport types
 *  - Live search filter on table
 *  - Confirmation modal before delete
 *  - Toast notifications
 *  - Mobile: card layout with action buttons
 *  - Desktop: dense ERP-style table
 *  - Same design language as StrengthReport.jsx
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Bus, Plus, Pencil, Trash2, X, Check,
  AlertCircle, Loader2, Search, RefreshCw,
  SlidersHorizontal, Info, ListFilter,
  ChevronRight, MoreVertical, ShieldAlert,
  FileSpreadsheet, Tag
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
let _id = 8
const INITIAL_DATA = [
  { transport_type_id: 1, name: 'School Bus' },
  { transport_type_id: 2, name: 'Mini Bus' },
  { transport_type_id: 3, name: 'Van' },
  { transport_type_id: 4, name: 'Auto Rickshaw' },
  { transport_type_id: 5, name: 'Car Pool' },
  { transport_type_id: 6, name: 'Tempo Traveller' },
  { transport_type_id: 7, name: 'Electric Bus' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const TYPE_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const typeColor = (id) => TYPE_COLORS[(id ?? 0) % TYPE_COLORS.length]

const abbr = (name = '') =>
  name.trim().split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'TT'

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Toast notification */
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

/** Delete Confirmation Modal */
function ConfirmModal({ item, onConfirm, onCancel }) {
  if (!item) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
          w-[90vw] max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35]
          border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6"
        style={{ animation: 'popIn .22s ease' }}
      >
        <style>{`@keyframes popIn{from{opacity:0;transform:translate(-50%,-50%) scale(.94)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
        <div className="flex flex-col items-center text-center gap-3">
          <span className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Delete Transport Type?</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">"{item.name}"</span> will be permanently removed.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-rose-600 hover:bg-rose-700 transition-colors shadow-md shadow-rose-500/20"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

/** Input field wrapper */
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

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit, onDelete }) {
  const { fg, bg } = typeColor(row.transport_type_id)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Transport Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {abbr(row.name)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.name}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => onDelete(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const { fg, bg } = typeColor(row.transport_type_id)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm flex items-center gap-3 px-4 py-3.5">
      {/* Badge */}
      <span
        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
        style={{ background: bg, color: fg }}
      >
        {abbr(row.name)}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">ID: #{row.transport_type_id} · Transport Type</p>
      </div>

      {/* Serial */}
      <span className="text-[11px] text-slate-300 dark:text-slate-600 tabular-nums flex-shrink-0 mr-1">#{idx}</span>

      {/* Actions menu */}
      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(p => !p)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] shadow-xl overflow-hidden"
            style={{ animation: 'popMenu .18s ease' }}
          >
            <style>{`@keyframes popMenu{from{opacity:0;transform:scale(.95) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
            <button
              onClick={() => { onEdit(row); setMenuOpen(false) }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
            >
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <div className="h-px bg-slate-100 dark:bg-[rgba(99,102,241,0.1)]" />
            <button
              onClick={() => { onDelete(row); setMenuOpen(false) }}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineTransportType() {
  // ── State ─────────────────────────────────────────────────────────────────
  const [records,      setRecords]     = useState(INITIAL_DATA)
  const [typeName,     setTypeName]    = useState('')
  const [editId,       setEditId]      = useState(null)   // null = add mode
  const [search,       setSearch]      = useState('')
  const [errors,       setErrors]      = useState({})
  const [loading,      setLoading]     = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast,        setToast]       = useState(null)
  const inputRef = useRef(null)

  const isEditMode = editId !== null

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!typeName.trim()) err.typeName = 'Transport type name is required'
    else if (typeName.trim().length < 2) err.typeName = 'Name must be at least 2 characters'
    else if (
      records.some(r =>
        r.name.toLowerCase() === typeName.trim().toLowerCase() &&
        r.transport_type_id !== editId
      )
    ) err.typeName = 'This transport type already exists'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Submit (Add / Update) ─────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      if (isEditMode) {
        setRecords(prev => prev.map(r =>
          r.transport_type_id === editId ? { ...r, name: typeName.trim() } : r
        ))
        showToast(`"${typeName.trim()}" updated successfully.`)
      } else {
        const newRec = { transport_type_id: _id++, name: typeName.trim() }
        setRecords(prev => [...prev, newRec])
        showToast(`"${typeName.trim()}" added successfully.`)
      }
      handleClear()
      setLoading(false)
    }, 500)
  }, [typeName, editId, records])

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = (row) => {
    setTypeName(row.name)
    setEditId(row.transport_type_id)
    setErrors({})
    inputRef.current?.focus()
    // Scroll to form on mobile
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = () => {
    if (!deleteTarget) return
    setRecords(prev => prev.filter(r => r.transport_type_id !== deleteTarget.transport_type_id))
    showToast(`"${deleteTarget.name}" deleted.`, 'success')
    setDeleteTarget(null)
    // If we were editing this item, clear form
    if (editId === deleteTarget.transport_type_id) handleClear()
  }

  // ── Clear / Reset ─────────────────────────────────────────────────────────
  const handleClear = () => {
    setTypeName(''); setEditId(null); setErrors({})
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return records
    const q = search.toLowerCase()
    return records.filter(r => r.name.toLowerCase().includes(q))
  }, [records, search])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Transport Type
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Define and manage transport types used for student routing.
          </p>
        </div>
        {/* Record count badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[12px] font-semibold text-blue-700 dark:text-blue-400">
            <Tag className="w-3.5 h-3.5" />
            {records.length} Type{records.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── FORM CARD ─────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className={`w-1 h-5 rounded-full flex-shrink-0 ${isEditMode ? 'bg-amber-500' : 'bg-blue-500'}`} />
          {isEditMode
            ? <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            : <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          }
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            {isEditMode ? 'Edit Transport Type' : 'Add Transport Type'}
          </span>
          {isEditMode && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 flex-shrink-0">
              Edit Mode
            </span>
          )}
        </div>

        {/* Form Body */}
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Input */}
            <div className="sm:col-span-1 lg:col-span-2">
              <Field label="Transport Type Name" error={errors.typeName} required>
                <div className="relative">
                  <Bus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={typeName}
                    onChange={e => {
                      setTypeName(e.target.value)
                      if (errors.typeName) setErrors(p => ({ ...p, typeName: undefined }))
                    }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="e.g. School Bus, Van, Mini Bus…"
                    maxLength={60}
                    className={`w-full pl-9 pr-4 py-2 text-[13px] rounded-lg border outline-none transition-all
                      bg-white text-slate-800 placeholder-slate-300
                      focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                      dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                      dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                      ${errors.typeName
                        ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
                        : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                      }`}
                  />
                </div>
              </Field>
            </div>

            {/* Spacer on large screens */}
            <div className="hidden lg:block" />

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  transition-all active:scale-95 disabled:opacity-70 shadow-md
                  ${isEditMode
                    ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                    : 'bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-blue-500/20'
                  }`}
              >
                {loading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : isEditMode ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />
                }
                {isEditMode ? 'Update' : 'Submit'}
              </button>
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                    bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                  title="Cancel Edit"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Edit banner hint */}
          {isEditMode && (
            <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
              <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-[12px] text-amber-700 dark:text-amber-400 font-medium">
                Editing: <span className="font-bold">"{records.find(r => r.transport_type_id === editId)?.name}"</span>. Press Esc or click ✕ to cancel.
              </p>
              <button onClick={handleClear} className="ml-auto text-amber-500 hover:text-amber-700"><X className="w-3.5 h-3.5" /></button>
            </div>
          )}
        </div>
      </div>

      {/* ── RECORDS TABLE / CARD ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <ListFilter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Transport Types</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-52 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search transport type…"
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
            Click <span className="font-bold">Edit</span> to modify a type or <span className="font-bold">Delete</span> to remove it permanently.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState search={search} onClear={() => setSearch('')} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Transport Name', 'Actions'].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                        ${i === 0 ? 'w-16 text-center' : i === 2 ? 'text-center' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow
                    key={row.transport_type_id}
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
            <EmptyState search={search} onClear={() => setSearch('')} />
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap ⋮ on any card for edit / delete options.
              </p>
              {filtered.map((row, i) => (
                <MobileCard
                  key={row.transport_type_id}
                  row={row}
                  idx={i + 1}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* ── Delete Confirm Modal ───────────────────────────────────────────── */}
      <ConfirmModal
        item={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Bus className="w-6 h-6 opacity-40" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
          {search ? 'No matching records' : 'No transport types yet'}
        </p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
          {search
            ? <>No results for "<span className="font-semibold">{search}</span>".</>
            : 'Add your first transport type using the form above.'}
        </p>
        {search && (
          <button onClick={onClear} className="mt-2 text-[12px] text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Clear search
          </button>
        )}
      </div>
    </div>
  )
}
