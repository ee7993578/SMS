/**
 * AcademicPlanner.jsx
 * Folder: src/pages/Uploads/AcademicPlanner.jsx
 *
 * Converts legacy ASPX "Academic Planner" upload page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Title input with validation
 *  - File upload with drag & drop (mobile friendly)
 *  - Save button with loading state
 *  - GridView: S.No, Title, Download, Edit, Delete
 *  - Edit modal (inline update title + optional re-upload)
 *  - Delete confirmation modal
 *  - Toast notifications
 *  - Desktop: ERP table layout
 *  - Mobile: card-based layout with actions
 */

import { useState, useCallback, useRef, useMemo } from 'react'
import {
  Upload, FileText, Save, Trash2, Pencil, Download,
  AlertCircle, X, Check, Loader2, BookOpen,
  Search, RefreshCw, FolderOpen, FilePlus,
  ChevronDown, Home, ChevronRight, FileUp,
  Eye, SlidersHorizontal, MoreVertical
} from 'lucide-react'

// ─── STATIC DUMMY DATA ────────────────────────────────────────────────────────
const INITIAL_PLANS = [
  { id: 1, title: 'Annual Academic Plan 2025-26',       file_path: '/uploads/annual_plan_2025.pdf',   file_name: 'annual_plan_2025.pdf',   uploaded_at: '2025-04-01' },
  { id: 2, title: 'Monthly Planner - April 2025',       file_path: '/uploads/monthly_apr_2025.pdf',   file_name: 'monthly_apr_2025.pdf',   uploaded_at: '2025-04-03' },
  { id: 3, title: 'Syllabus Coverage Plan - Term I',    file_path: '/uploads/syllabus_term1.pdf',      file_name: 'syllabus_term1.pdf',     uploaded_at: '2025-04-10' },
  { id: 4, title: 'Holiday & Event Calendar 2025',      file_path: '/uploads/holiday_calendar.pdf',    file_name: 'holiday_calendar.pdf',   uploaded_at: '2025-04-12' },
  { id: 5, title: 'Examination Schedule - Term I',      file_path: '/uploads/exam_schedule_t1.pdf',   file_name: 'exam_schedule_t1.pdf',   uploaded_at: '2025-04-15' },
  { id: 6, title: 'Co-Curricular Activity Planner',     file_path: '/uploads/cocurricular_plan.pdf',  file_name: 'cocurricular_plan.pdf',  uploaded_at: '2025-04-18' },
]

let _nextId = INITIAL_PLANS.length + 1
const genId = () => _nextId++

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const formatDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const fileExt = (name = '') => name.split('.').pop().toUpperCase() || 'FILE'

const EXT_COLORS = {
  PDF:  { bg: '#fee2e2', fg: '#b91c1c' },
  DOC:  { bg: '#dbeafe', fg: '#1d4ed8' },
  DOCX: { bg: '#dbeafe', fg: '#1d4ed8' },
  XLS:  { bg: '#d1fae5', fg: '#065f46' },
  XLSX: { bg: '#d1fae5', fg: '#065f46' },
  PPT:  { bg: '#fef3c7', fg: '#92400e' },
  PPTX: { bg: '#fef3c7', fg: '#92400e' },
}
const extColor = (name) => EXT_COLORS[fileExt(name)] ?? { bg: '#e0e7ff', fg: '#3730a3' }

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3
        px-5 py-3 rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

/** Field wrapper with label + error */
function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

/** File extension badge */
function ExtBadge({ fileName, size = 'sm' }) {
  const ext = fileExt(fileName)
  const { bg, fg } = extColor(fileName)
  const sz = size === 'lg'
    ? 'w-10 h-10 text-[10px]'
    : 'w-7 h-7 text-[9px]'
  return (
    <span
      className={`${sz} rounded-lg flex items-center justify-center font-bold flex-shrink-0`}
      style={{ background: bg, color: fg }}
    >
      {ext}
    </span>
  )
}

// ─── FILE UPLOAD ZONE ─────────────────────────────────────────────────────────
function FileDropZone({ file, onChange, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onChange(f)
  }, [onChange])

  const handleDrag = (e) => { e.preventDefault(); setDragging(true) }
  const handleDragLeave = () => setDragging(false)

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDrag}
        onDragLeave={handleDragLeave}
        className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 py-5 px-4 text-center
          ${dragging
            ? 'border-blue-400 bg-blue-50 dark:border-indigo-400 dark:bg-indigo-500/10 scale-[1.01]'
            : error
              ? 'border-rose-300 bg-rose-50/40 dark:border-rose-500/50 dark:bg-rose-500/5'
              : 'border-slate-200 bg-slate-50/60 hover:border-blue-300 hover:bg-blue-50/30 dark:border-[rgba(99,102,241,0.25)] dark:bg-white/[0.02] dark:hover:border-indigo-400/50'
          }`}
      >
        {file ? (
          <div className="flex items-center gap-3 w-full justify-center flex-wrap">
            <ExtBadge fileName={file.name} size="lg" />
            <div className="text-left min-w-0">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[200px]">{file.name}</p>
              <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null) }}
              className="ml-auto p-1.5 rounded-lg bg-rose-100 text-rose-500 hover:bg-rose-200 dark:bg-rose-500/10 dark:text-rose-400 transition-colors flex-shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <>
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-indigo-500/15 flex items-center justify-center">
              <FileUp className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                Drag & drop or <span className="text-blue-600 dark:text-indigo-400">browse</span>
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">PDF, DOC, DOCX, XLS, PPT supported</p>
            </div>
          </>
        )}
        <input ref={inputRef} type="file" className="hidden" onChange={e => onChange(e.target.files?.[0] || null)} />
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
function DeleteModal({ plan, onConfirm, onCancel, loading }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] w-full max-w-sm"
          style={{ animation: 'modalIn .2s ease' }}
        >
          <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="p-6">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-100 mb-1">Delete Plan?</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-1">
              You're about to delete:
            </p>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-4 bg-slate-50 dark:bg-slate-800/60 px-3 py-2 rounded-lg truncate">
              {plan?.title}
            </p>
            <p className="text-[12px] text-rose-500 dark:text-rose-400 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-70 transition-all"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── EDIT MODAL ───────────────────────────────────────────────────────────────
function EditModal({ plan, onSave, onCancel, loading }) {
  const [title, setTitle] = useState(plan?.title || '')
  const [file,  setFile]  = useState(null)
  const [errors, setErrors] = useState({})

  const handleSave = () => {
    const err = {}
    if (!title.trim()) err.title = 'Title is required'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    onSave({ title: title.trim(), file })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] w-full max-w-md"
          style={{ animation: 'modalIn .2s ease' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-indigo-500/15 flex items-center justify-center">
                <Pencil className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              </div>
              <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Edit Plan</span>
            </div>
            <button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            <Field label="Title" error={errors.title} required>
              <input
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })) }}
                placeholder="Enter planner title…"
                className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                  ${errors.title ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
              />
            </Field>

            <Field
              label="Replace File (Optional)"
              hint={`Current: ${plan?.file_name}`}
            >
              <FileDropZone file={file} onChange={setFile} />
            </Field>
          </div>

          {/* Footer */}
          <div className="px-6 pb-6 flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all shadow-md shadow-blue-500/20">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Update
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobilePlanCard({ plan, idx, onEdit, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Badge */}
        <ExtBadge fileName={plan.file_name} size="lg" />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug truncate">{plan.title}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">#{idx}</span>
            {formatDate(plan.uploaded_at)}
            <span className="mx-0.5">·</span>
            {plan.file_name}
          </p>
        </div>

        {/* Actions */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-[#1e2238] rounded-xl shadow-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden min-w-[150px]">
                <a
                  href={plan.file_path}
                  download
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                >
                  <Download className="w-4 h-4" /> Download
                </a>
                <button
                  onClick={() => { setMenuOpen(false); onEdit(plan) }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <Pencil className="w-4 h-4 text-amber-500" /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onDelete(plan) }}
                  className="w-full flex items-center gap-2.5 px-4 py-3 text-[13px] font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
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
function DesktopRow({ plan, idx, onEdit, onDelete }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3.5 text-center">
        <span className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 tabular-nums">{idx}</span>
      </td>

      {/* Title */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <ExtBadge fileName={plan.file_name} />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[320px]">{plan.title}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[280px]">{plan.file_name}</p>
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3.5 text-center">
        <span className="text-[12px] text-slate-500 dark:text-slate-400">{formatDate(plan.uploaded_at)}</span>
      </td>

      {/* Download */}
      <td className="px-4 py-3.5 text-center">
        <a
          href={plan.file_path}
          download
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            border border-blue-100 dark:border-blue-500/20 transition-colors"
        >
          <Download className="w-3.5 h-3.5" /> Download
        </a>
      </td>

      {/* Edit */}
      <td className="px-4 py-3.5 text-center">
        <button
          onClick={() => onEdit(plan)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20
            border border-amber-100 dark:border-amber-500/20 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
      </td>

      {/* Delete */}
      <td className="px-4 py-3.5 text-center">
        <button
          onClick={() => onDelete(plan)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            border border-rose-100 dark:border-rose-500/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </td>
    </tr>
  )
}

// ─── UPLOAD FORM PANEL ────────────────────────────────────────────────────────
function UploadForm({ onSave }) {
  const [title, setTitle] = useState('')
  const [file,  setFile]  = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  const handleSave = useCallback(async () => {
    const err = {}
    if (!title.trim()) err.title = 'Title is required'
    if (!file)         err.file  = 'Please select a file to upload'
    if (Object.keys(err).length) { setErrors(err); return }

    setErrors({})
    setSaving(true)
    // Simulate API upload delay
    await new Promise(r => setTimeout(r, 900))

    onSave({
      id:          genId(),
      title:       title.trim(),
      file_path:   `/uploads/${file.name}`,
      file_name:   file.name,
      uploaded_at: new Date().toISOString().split('T')[0],
    })

    setTitle('')
    setFile(null)
    setSaving(false)
  }, [title, file, onSave])

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Panel Header */}
      <button
        type="button"
        onClick={() => setCollapsed(p => !p)}
        className="w-full flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.03] transition-colors text-left"
      >
        <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
        <FilePlus className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Upload New Academic Planner</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${collapsed ? '-rotate-90' : ''}`} />
      </button>

      {/* Form Body */}
      {!collapsed && (
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <Field label="Title" error={errors.title} required>
              <input
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })) }}
                placeholder="Enter academic planner title…"
                maxLength={200}
                className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                  ${errors.title ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
              />
            </Field>

            {/* File Upload */}
            <Field label="File to Upload" error={errors.file} required>
              <FileDropZone
                file={file}
                onChange={(f) => { setFile(f); setErrors(p => ({ ...p, file: undefined })) }}
                error={errors.file}
              />
            </Field>
          </div>

          {/* Save Button */}
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                disabled:opacity-70 transition-all active:scale-95"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AcademicPlanner() {
  const [plans,      setPlans]      = useState(INITIAL_PLANS)
  const [search,     setSearch]     = useState('')
  const [editTarget, setEditTarget] = useState(null)  // plan being edited
  const [delTarget,  setDelTarget]  = useState(null)  // plan being deleted
  const [editLoading, setEditLoading] = useState(false)
  const [delLoading,  setDelLoading]  = useState(false)
  const [toast,      setToast]      = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── CRUD handlers ─────────────────────────────────────────────────────────
  const handleSave = useCallback((newPlan) => {
    setPlans(p => [newPlan, ...p])
    showToast(`"${newPlan.title}" uploaded successfully!`)
  }, [showToast])

  const handleEditSave = useCallback(async ({ title, file }) => {
    setEditLoading(true)
    await new Promise(r => setTimeout(r, 800))
    setPlans(p => p.map(x =>
      x.id === editTarget.id
        ? {
            ...x,
            title,
            ...(file ? { file_name: file.name, file_path: `/uploads/${file.name}` } : {}),
          }
        : x
    ))
    showToast(`"${title}" updated successfully!`)
    setEditTarget(null)
    setEditLoading(false)
  }, [editTarget, showToast])

  const handleDeleteConfirm = useCallback(async () => {
    setDelLoading(true)
    await new Promise(r => setTimeout(r, 700))
    setPlans(p => p.filter(x => x.id !== delTarget.id))
    showToast(`"${delTarget.title}" deleted.`, 'success')
    setDelTarget(null)
    setDelLoading(false)
  }, [delTarget, showToast])

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return plans
    const q = search.toLowerCase()
    return plans.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.file_name.toLowerCase().includes(q)
    )
  }, [plans, search])

  return (
    <div className="space-y-5 pb-10">

      {/* ── Breadcrumb ───────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
        <Home className="w-3.5 h-3.5 flex-shrink-0" />
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <span>Uploads</span>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
        <span className="font-semibold text-slate-600 dark:text-slate-300">Academic Planner</span>
      </nav>

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Academic Planner
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Upload, manage and download academic planning documents.
          </p>
        </div>
        {/* Stats chip */}
        <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm self-start">
          <FolderOpen className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{plans.length}</span>
          <span className="text-[12px] text-slate-400 dark:text-slate-500">documents</span>
        </div>
      </div>

      {/* ── Upload Form ──────────────────────────────────────────────────── */}
      <UploadForm onSave={handleSave} />

      {/* ── Records Panel ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Uploaded Planners</span>
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
              placeholder="Search title or file…"
              className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState search={search} onClear={() => setSearch('')} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Title & File', 'Date', 'Download', 'Edit', 'Delete'].map((h, i) => (
                    <th key={i}
                      className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                        ${i === 0 ? 'text-center w-14' : i >= 3 ? 'text-center' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((plan, i) => (
                  <DesktopRow
                    key={plan.id}
                    plan={plan}
                    idx={i + 1}
                    onEdit={setEditTarget}
                    onDelete={setDelTarget}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden">
          {filtered.length === 0 ? (
            <EmptyState search={search} onClear={() => setSearch('')} />
          ) : (
            <div className="p-4 space-y-3">
              {filtered.map((plan, i) => (
                <MobilePlanCard
                  key={plan.id}
                  plan={plan}
                  idx={i + 1}
                  onEdit={setEditTarget}
                  onDelete={setDelTarget}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{plans.length}</span> records
            </p>
            {search && (
              <button onClick={() => setSearch('')}
                className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear search
              </button>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ───────────────────────────────────────────────────────── */}
      {editTarget && (
        <EditModal
          plan={editTarget}
          onSave={handleEditSave}
          onCancel={() => setEditTarget(null)}
          loading={editLoading}
        />
      )}

      {delTarget && (
        <DeleteModal
          plan={delTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDelTarget(null)}
          loading={delLoading}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        {search
          ? <Search className="w-7 h-7 opacity-40" />
          : <FolderOpen className="w-7 h-7 opacity-40" />}
      </div>
      <div className="text-center">
        {search ? (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No results found</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              No planners match "<strong>{search}</strong>"
            </p>
            <button onClick={onClear}
              className="mt-3 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
              Clear search
            </button>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No planners uploaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Use the form above to upload your first academic planner.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
