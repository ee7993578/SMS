/**
 * ItemFrequencyMaster.jsx
 * Folder: src/pages/Library/Master/ItemFrequencyMaster.jsx
 *
 * Converts legacy ASPX "Define Item Frequency" master page to fully-responsive
 * React + Tailwind, matching the design system used in StrengthReport.jsx.
 *
 * Features:
 *  - Add / Edit form (Code, Name, Remark)
 *  - Validation (required fields, no quotes allowed)
 *  - List of existing frequencies in a GridView-style table (desktop)
 *  - Mobile: responsive cards with Edit / Delete actions
 *  - Edit prefill, Delete confirm, Reset form
 *  - Toast notifications + loading states + empty state
 */

import { useState, useCallback, useMemo } from 'react'
import {
  Plus, Pencil, Trash2, RotateCcw, Check, X,
  AlertCircle, Loader2, ListChecks, Tag, FileText,
  Search, Info, Layers,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ────────────────────────────────────────────────────
const INITIAL_FREQUENCIES = [
  { itemf_id: 1, code: 'DAILY',   name: 'DAILY',     remark: 'ISSUED EVERY DAY' },
  { itemf_id: 2, code: 'WEEKLY',  name: 'WEEKLY',    remark: 'ISSUED ONCE A WEEK' },
  { itemf_id: 3, code: 'MONTHLY', name: 'MONTHLY',   remark: 'ISSUED ONCE A MONTH' },
  { itemf_id: 4, code: 'ONEYR',   name: 'YEARLY',    remark: 'ISSUED ONCE A YEAR' },
  { itemf_id: 5, code: 'ONCE',    name: 'ONE TIME',  remark: 'ISSUED ONLY ONCE' },
]

// Disallow single/double quotes (mirrors the FilteredTextBoxExtender InvalidChars)
const INVALID_CHARS_REGEX = /['"]/

// ─── PRIMITIVE COMPONENTS ───────────────────────────────────────────────────

function TextInput({ value, onChange, error, placeholder, uppercase = true, multiline = false, maxLength }) {
  const baseClasses = `w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
    bg-white text-slate-800 placeholder-slate-300
    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
    dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
    dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
    ${uppercase ? 'uppercase' : ''}
    ${error
      ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
      : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
    }`

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={2}
        maxLength={maxLength}
        className={`${baseClasses} resize-none`}
      />
    )
  }

  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={baseClasses}
    />
  )
}

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error ? (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      ) : hint ? (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>
      ) : null}
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
      <button onClick={onClose} aria-label="Dismiss notification">
        <X className="w-4 h-4 opacity-75 hover:opacity-100" />
      </button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// Small confirm dialog used for delete
function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
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
          <div className="flex items-start gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </span>
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{title}</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{message}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-70 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ──────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit, onDelete }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
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
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20
              transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(row)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
              transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onEdit, onDelete }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
              {row.code}
            </span>
            <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{row.name}</span>
          </div>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            {row.remark || 'No remark added'}
          </p>
        </div>
      </div>

      <div className="flex border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <button
          type="button"
          onClick={() => onEdit(row)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold
            text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors"
        >
          <Pencil className="w-4 h-4" /> Edit
        </button>
        <div className="w-px bg-slate-100 dark:bg-[rgba(99,102,241,0.1)]" />
        <button
          type="button"
          onClick={() => onDelete(row)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold
            text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" /> Delete
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────
export default function ItemFrequencyMaster() {
  const [list, setList]     = useState(INITIAL_FREQUENCIES)
  const [code, setCode]     = useState('')
  const [name, setName]     = useState('')
  const [remark, setRemark] = useState('')
  const [editingId, setEditingId] = useState(null)

  const [errors, setErrors]   = useState({})
  const [search, setSearch]   = useState('')
  const [saving, setSaving]   = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Validation (mirrors .req + InvalidChars rules) ────────────────────────
  const validate = () => {
    const err = {}
    if (!code.trim()) err.code = 'Code is required'
    else if (INVALID_CHARS_REGEX.test(code)) err.code = "Quotes ( ' \" ) are not allowed"

    if (!name.trim()) err.name = 'Name is required'
    else if (INVALID_CHARS_REGEX.test(name)) err.name = "Quotes ( ' \" ) are not allowed"

    if (remark && INVALID_CHARS_REGEX.test(remark)) err.remark = "Quotes ( ' \" ) are not allowed"

    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Reset form (mirrors reset_Click) ──────────────────────────────────────
  const handleReset = useCallback(() => {
    setCode('')
    setName('')
    setRemark('')
    setEditingId(null)
    setErrors({})
  }, [])

  // ── Submit (mirrors Button2_Click, add or update) ─────────────────────────
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    if (!validate()) return

    setSaving(true)
    setTimeout(() => {
      if (editingId !== null) {
        setList(prev => prev.map(item =>
          item.itemf_id === editingId
            ? { ...item, code: code.toUpperCase(), name: name.toUpperCase(), remark: remark.toUpperCase() }
            : item
        ))
        showToast('Item frequency updated successfully.')
      } else {
        const nextId = list.length ? Math.max(...list.map(i => i.itemf_id)) + 1 : 1
        setList(prev => [
          ...prev,
          { itemf_id: nextId, code: code.toUpperCase(), name: name.toUpperCase(), remark: remark.toUpperCase() },
        ])
        showToast('Item frequency added successfully.')
      }
      setSaving(false)
      handleReset()
    }, 500)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, name, remark, editingId, list, handleReset])

  // ── Edit (mirrors btnedit_Click — prefill the form) ────────────────────────
  const handleEdit = useCallback((row) => {
    setCode(row.code)
    setName(row.name)
    setRemark(row.remark)
    setEditingId(row.itemf_id)
    setErrors({})
    // Scroll to top so the operator sees the prefilled form
    window.scrollTo?.({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Delete (mirrors btndlt_Click) ──────────────────────────────────────────
  const requestDelete = (row) => setConfirmTarget(row)

  const confirmDelete = () => {
    if (!confirmTarget) return
    setDeleting(true)
    setTimeout(() => {
      setList(prev => prev.filter(item => item.itemf_id !== confirmTarget.itemf_id))
      if (editingId === confirmTarget.itemf_id) handleReset()
      showToast('Item frequency deleted.')
      setDeleting(false)
      setConfirmTarget(null)
    }, 400)
  }

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return list
    const q = search.toLowerCase()
    return list.filter(r =>
      r.code.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      (r.remark || '').toLowerCase().includes(q)
    )
  }, [list, search])

  const isEditing = editingId !== null

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Define Item Frequency
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Add, edit or remove item issue frequencies used across the library.
        </p>
      </div>

      {/* ── Form Card ──────────────────────────────────────────────────── */}
      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden"
      >
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          {isEditing ? <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" /> : <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            {isEditing ? `Editing: ${code || '—'}` : 'Add New Frequency'}
          </span>
          {isEditing && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              Edit mode
            </span>
          )}
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Code" error={errors.code} required>
              <TextInput
                value={code}
                onChange={e => { setCode(e.target.value); setErrors(p => ({ ...p, code: undefined })) }}
                placeholder="e.g. WEEKLY"
                error={errors.code}
                maxLength={20}
              />
            </Field>

            <Field label="Name" error={errors.name} required>
              <TextInput
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }}
                placeholder="e.g. WEEKLY"
                error={errors.name}
                maxLength={50}
              />
            </Field>

            <Field label="Remark" error={errors.remark} hint="Optional note about this frequency">
              <TextInput
                value={remark}
                onChange={e => { setRemark(e.target.value); setErrors(p => ({ ...p, remark: undefined })) }}
                placeholder="Optional remark"
                error={errors.remark}
                multiline
                maxLength={150}
              />
            </Field>
          </div>
        </div>

        {/* Form Footer / Actions */}
        <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 sm:flex-none sm:min-w-[160px] flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-95 disabled:opacity-70"
          >
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : isEditing ? <Pencil className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEditing ? 'Update Frequency' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 sm:flex-none sm:min-w-[120px] flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" /> Reset
          </button>
        </div>
      </form>

      {/* ── List Card ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Item Frequencies</span>
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
              placeholder="Search code, name or remark…"
              className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400"
            />
            {search && (
              <button onClick={() => setSearch('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Info hint */}
        <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Use Edit to load a record into the form above, or Delete to remove it permanently.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              {search ? (
                <>
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </>
              ) : (
                <>
                  <Tag className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">There are no data records to display.</span>
                </>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['Sr No.', 'Code', 'Name', 'Remark', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.itemf_id} row={row} idx={i + 1} onEdit={handleEdit} onDelete={requestDelete} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              {search ? (
                <>
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </>
              ) : (
                <>
                  <Tag className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">There are no data records to display.</span>
                </>
              )}
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap Edit to load a record into the form above.
              </p>
              {filtered.map((row, i) => (
                <MobileCard key={row.itemf_id} row={row} idx={i + 1} onEdit={handleEdit} onDelete={requestDelete} />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{list.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirmTarget}
        title="Delete this frequency?"
        message={confirmTarget ? `"${confirmTarget.name}" (${confirmTarget.code}) will be removed permanently.` : ''}
        onConfirm={confirmDelete}
        onCancel={() => setConfirmTarget(null)}
        loading={deleting}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
