/**
 * ItemLanguage.jsx
 * Folder: src/pages/Library/ItemLanguage.jsx
 *
 * Converts legacy ASPX "Item Language" master page to fully-responsive React + Tailwind.
 *
 * Fields: Code, Name, Remark
 * Features:
 *  - Add / Edit / Reset form
 *  - Validation (required: Code, Name)
 *  - Grid listing with Edit / Delete actions
 *  - Desktop: dense ERP-style table
 *  - Mobile: collapsible cards with edit/delete actions
 *  - Toast notifications + confirm-delete modal
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Languages, Plus, Save, RotateCcw, Pencil, Trash2,
  AlertCircle, X, Check, Loader2, Search, Info,
  BookOpen, Hash, Tag, FileText, AlertTriangle
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const INITIAL_LANGUAGES = [
  { itemlang_id: 1, code: 'EN', name: 'ENGLISH',  remark: 'DEFAULT LANGUAGE FOR ALL TITLES' },
  { itemlang_id: 2, code: 'HI', name: 'HINDI',    remark: 'USED FOR REGIONAL LANGUAGE BOOKS' },
  { itemlang_id: 3, code: 'SA', name: 'SANSKRIT', remark: 'CLASSICAL / RELIGIOUS TEXTS' },
  { itemlang_id: 4, code: 'FR', name: 'FRENCH',   remark: '' },
  { itemlang_id: 5, code: 'UR', name: 'URDU',     remark: 'RIGHT TO LEFT SCRIPT' },
]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function TextInput({ value, onChange, placeholder, error, multiline, maxLength, icon: Icon }) {
  const Tag = multiline ? 'textarea' : 'input'
  return (
    <div className="relative">
      {Icon && (
        <Icon className={`absolute left-3 ${multiline ? 'top-3' : 'top-1/2 -translate-y-1/2'} w-3.5 h-3.5 text-slate-400 pointer-events-none`} />
      )}
      <Tag
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={multiline ? 2 : undefined}
        className={`w-full ${Icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-[13px] uppercase rounded-lg border outline-none transition-all
          bg-white text-slate-800 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${multiline ? 'resize-none' : ''}
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
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

// ─── CONFIRM DELETE MODAL ──────────────────────────────────────────────────────
function ConfirmDeleteModal({ open, item, onCancel, onConfirm, loading }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-5"
          style={{ animation: 'popIn .2s ease' }}
        >
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </span>
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Delete Language?</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">This action cannot be undone.</p>
            </div>
          </div>
          {item && (
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-3 py-2 mb-4">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{item.name}</p>
              <p className="text-[11px] text-slate-400">Code: {item.code}</p>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-70 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit, onDelete, isEditing }) {
  return (
    <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
      ${isEditing
        ? 'bg-blue-50/70 dark:bg-indigo-500/[0.08]'
        : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}>
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums tracking-wide">
          {row.code}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.name}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-[12px] text-slate-500 dark:text-slate-400">{row.remark || '—'}</span>
      </td>
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => onEdit(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button onClick={() => onDelete(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onEdit, onDelete, isEditing }) {
  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm transition-colors
      ${isEditing
        ? 'border-blue-300 dark:border-indigo-500/40 bg-blue-50/60 dark:bg-indigo-500/[0.08]'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'}`}>
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          {row.code}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {row.remark || 'No remark'}
          </p>
        </div>
        <span className="text-[11px] text-slate-300 dark:text-slate-600 tabular-nums mt-1 flex-shrink-0">#{idx}</span>
      </div>
      <div className="flex border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <button onClick={() => onEdit(row)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold
            text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
        <div className="w-px bg-slate-100 dark:bg-[rgba(99,102,241,0.1)]" />
        <button onClick={() => onDelete(row)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold
            text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ItemLanguage() {
  const [languages, setLanguages] = useState(INITIAL_LANGUAGES)
  const [code, setCode]     = useState('')
  const [name, setName]     = useState('')
  const [remark, setRemark] = useState('')
  const [errors, setErrors] = useState({})
  const [editingId, setEditingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast]   = useState(null)
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const formTopRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!code.trim()) err.code = 'Code is required'
    if (!name.trim()) err.name = 'Name is required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Reset form ────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setCode(''); setName(''); setRemark('')
    setErrors({}); setEditingId(null)
  }, [])

  // ── Submit (Add / Update) ───────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!validate()) return
    setSaving(true)

    setTimeout(() => {
      if (editingId) {
        // Update existing
        setLanguages(prev => prev.map(l =>
          l.itemlang_id === editingId
            ? { ...l, code: code.toUpperCase(), name: name.toUpperCase(), remark: remark.toUpperCase() }
            : l
        ))
        showToast(`"${name.toUpperCase()}" updated successfully.`)
      } else {
        // Add new
        const nextId = languages.length
          ? Math.max(...languages.map(l => l.itemlang_id)) + 1
          : 1
        setLanguages(prev => [
          ...prev,
          { itemlang_id: nextId, code: code.toUpperCase(), name: name.toUpperCase(), remark: remark.toUpperCase() }
        ])
        showToast(`"${name.toUpperCase()}" added successfully.`)
      }
      setSaving(false)
      handleReset()
    }, 500)
  }, [code, name, remark, editingId, languages, handleReset])

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((row) => {
    setCode(row.code)
    setName(row.name)
    setRemark(row.remark)
    setEditingId(row.itemlang_id)
    setErrors({})
    formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteRequest = useCallback((row) => setDeleteTarget(row), [])

  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    setDeleting(true)
    setTimeout(() => {
      setLanguages(prev => prev.filter(l => l.itemlang_id !== deleteTarget.itemlang_id))
      if (editingId === deleteTarget.itemlang_id) handleReset()
      showToast(`"${deleteTarget.name}" deleted successfully.`)
      setDeleting(false)
      setDeleteTarget(null)
    }, 450)
  }, [deleteTarget, editingId, handleReset])

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return languages
    const q = search.toLowerCase()
    return languages.filter(l =>
      l.code.toLowerCase().includes(q) ||
      l.name.toLowerCase().includes(q) ||
      (l.remark || '').toLowerCase().includes(q)
    )
  }, [languages, search])

  return (
    <div className="space-y-4 pb-10" ref={formTopRef}>

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Languages className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Item Language
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Manage language masters used for library items — code, name &amp; remark.
        </p>
      </div>

      {/* ── Form Card ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          {editingId ? <Pencil className="w-4 h-4 text-amber-500 flex-shrink-0" /> : <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            {editingId ? 'Edit Language' : 'Add New Language'}
          </span>
          {editingId && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              Editing
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Code" error={errors.code} required>
              <TextInput
                icon={Hash}
                value={code}
                onChange={e => { setCode(e.target.value); setErrors(p => ({ ...p, code: undefined })) }}
                placeholder="e.g. EN"
                error={errors.code}
                maxLength={10}
              />
            </Field>

            <Field label="Name" error={errors.name} required>
              <TextInput
                icon={Tag}
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }}
                placeholder="e.g. ENGLISH"
                error={errors.name}
                maxLength={50}
              />
            </Field>

            <Field label="Remark">
              <TextInput
                icon={FileText}
                value={remark}
                onChange={e => setRemark(e.target.value)}
                placeholder="Optional remark"
                multiline
              />
            </Field>
          </div>

          {/* Form actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button onClick={handleSubmit} disabled={saving}
              className="flex-1 sm:flex-none sm:min-w-[150px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Update' : 'Submit'}
            </button>
            <button onClick={handleReset} disabled={saving}
              className="flex-1 sm:flex-none sm:min-w-[120px] flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-70">
              <RotateCcw className="w-4 h-4" />
              {editingId ? 'Cancel' : 'Reset'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Listing Card ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Language List</span>
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
              placeholder="Search code, name, remark…"
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
        <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Click <strong>Edit</strong> to load a record into the form above, or <strong>Delete</strong> to remove it.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">There are no data records to display.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['SrNo.', 'Code', 'Name', 'Remark', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow
                    key={row.itemlang_id}
                    row={row}
                    idx={i + 1}
                    onEdit={handleEdit}
                    onDelete={handleDeleteRequest}
                    isEditing={editingId === row.itemlang_id}
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
              <span className="text-[13px] text-center px-4">There are no data records to display.</span>
            </div>
          ) : (
            filtered.map((row, i) => (
              <MobileCard
                key={row.itemlang_id}
                row={row}
                idx={i + 1}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                isEditing={editingId === row.itemlang_id}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{languages.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        item={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
