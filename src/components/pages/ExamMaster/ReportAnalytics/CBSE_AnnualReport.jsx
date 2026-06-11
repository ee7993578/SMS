/**
 * CBSE_AnnualReport.jsx
 * Folder: src/pages/Reports/Configuration/CBSE_AnnualReport.jsx
 *
 * Converts legacy ASPX "CBSE Annual Report" upload/manage page to
 * fully-responsive React + Tailwind.
 *
 * Features:
 *  - Title input + Date picker + File upload → Submit
 *  - GridView: S.No, Title, Date, Delete action
 *  - Desktop: clean ERP table layout
 *  - Mobile: card-based layout with touch-friendly actions
 *  - Toast notifications, loading states, empty states
 *  - Full validation, confirmation on delete
 */

import { useState, useCallback, useMemo, useRef } from 'react'
import {
  FileText, Calendar, Upload, Trash2, Plus,
  AlertCircle, X, Check, Loader2,
  Search, RefreshCw, BookOpen,
  ChevronDown, FileUp, Info,
  ClipboardList, FilePlus2, Eye,
  SlidersHorizontal, Building2,
} from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const INITIAL_REPORTS = [
  { id: 1,  title: 'CBSE Annual Report 2019-20', c_date: '15 Mar 2020', fileName: 'annual_report_2019_20.pdf' },
  { id: 2,  title: 'CBSE Annual Report 2020-21', c_date: '20 Apr 2021', fileName: 'annual_report_2020_21.pdf' },
  { id: 3,  title: 'CBSE Annual Report 2021-22', c_date: '10 May 2022', fileName: 'annual_report_2021_22.pdf' },
  { id: 4,  title: 'CBSE Annual Report 2022-23', c_date: '05 Jun 2023', fileName: 'annual_report_2022_23.pdf' },
  { id: 5,  title: 'CBSE Annual Report 2023-24', c_date: '12 Jul 2024', fileName: 'annual_report_2023_24.pdf' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let nextId = 6

function formatDateDisplay(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (isNaN(d)) return dateStr
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

function getTodayISO() {
  return new Date().toISOString().split('T')[0]
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
      style={{ animation: 'toastUp .25s ease' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

/** Field wrapper with label + error */
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

/** Delete confirmation modal */
function DeleteModal({ report, onConfirm, onCancel, loading }) {
  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onCancel}
        style={{ animation: 'fadeIn .2s ease' }}
      />
      <div
        className="fixed inset-x-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 z-50
          w-full sm:w-[400px] rounded-2xl bg-white dark:bg-[#1a1f35]
          border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6"
        style={{ animation: 'modalIn .2s ease' }}
      >
        <style>{`
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          @keyframes modalIn{from{opacity:0;transform:translate(-50%,-48%)}to{opacity:1;transform:translate(-50%,-50%)}}
        `}</style>
        <div className="flex items-start gap-4">
          <span className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </span>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Delete Report</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              Are you sure you want to delete&nbsp;
              <span className="font-semibold text-slate-700 dark:text-slate-200">"{report?.title}"</span>?
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-500/25
              transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </div>
    </>
  )
}

// ─── FILE UPLOAD DROPZONE ─────────────────────────────────────────────────────
function FileDropzone({ file, onChange, error }) {
  const inputRef = useRef(null)
  const [dragging, setDragging] = useState(false)

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) onChange(f)
  }, [onChange])

  const handleChange = useCallback((e) => {
    const f = e.target.files?.[0]
    if (f) onChange(f)
  }, [onChange])

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative flex flex-col items-center justify-center gap-2 px-4 py-4 rounded-xl border-2 border-dashed
        cursor-pointer transition-all select-none
        ${dragging
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10'
          : error
            ? 'border-rose-400 bg-rose-50/30 dark:bg-rose-500/5'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-slate-50/50 dark:bg-white/[0.02] hover:border-blue-400 hover:bg-blue-50/50 dark:hover:bg-blue-500/5'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx"
        onChange={handleChange}
      />

      {file ? (
        <div className="flex items-center gap-3 w-full">
          <span className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
            <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center
              hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-500/20 text-slate-500 transition-colors flex-shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
            <FileUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </span>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
              {dragging ? 'Drop file here' : 'Click or drag file here'}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">PDF, DOC, XLS supported</p>
          </div>
        </>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ report, idx, onDelete, deleting }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] font-semibold text-slate-400 dark:text-slate-500 tabular-nums">{idx}</span>
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{report.title}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate max-w-[220px]">{report.fileName}</p>
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[13px] text-slate-600 dark:text-slate-300 tabular-nums">{report.c_date}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onDelete(report)}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            border border-rose-100 dark:border-rose-500/20 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE REPORT CARD ───────────────────────────────────────────────────────
function MobileCard({ report, idx, onDelete, deleting }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-start gap-3 p-4">
        {/* Index badge */}
        <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center text-[11px] font-bold text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5">
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{report.title}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{report.fileName}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <Calendar className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <span className="text-[12px] text-slate-500 dark:text-slate-400 font-medium">{report.c_date}</span>
          </div>
        </div>

        {/* Delete button */}
        <button
          type="button"
          onClick={() => onDelete(report)}
          disabled={deleting}
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0
            bg-rose-50 text-rose-500 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            border border-rose-100 dark:border-rose-500/20 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CBSEAnnualReport() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [title,    setTitle]    = useState('')
  const [date,     setDate]     = useState('')
  const [file,     setFile]     = useState(null)
  const [errors,   setErrors]   = useState({})
  const [submitting, setSubmitting] = useState(false)

  // ── Data state ───────────────────────────────────────────────────────────────
  const [reports,  setReports]  = useState(INITIAL_REPORTS)

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [search,   setSearch]   = useState('')
  const [toast,    setToast]    = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  // ── Toast helper ─────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate ─────────────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const err = {}
    if (!title.trim())  err.title = 'Title is required'
    if (!date)          err.date  = 'Date of submission is required'
    if (!file)          err.file  = 'Please select a file to upload'
    setErrors(err)
    return Object.keys(err).length === 0
  }, [title, date, file])

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!validate()) return
    setSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      const newReport = {
        id: nextId++,
        title: title.trim(),
        c_date: formatDateDisplay(date),
        fileName: file.name,
      }
      setReports(prev => [newReport, ...prev])
      setTitle('')
      setDate('')
      setFile(null)
      setErrors({})
      setSubmitting(false)
      showToast('Report submitted successfully!')
    }, 700)
  }, [title, date, file, validate])

  // ── Delete ────────────────────────────────────────────────────────────────────
  const confirmDelete = useCallback(() => {
    if (!deleteTarget) return
    setDeleting(true)
    setTimeout(() => {
      setReports(prev => prev.filter(r => r.id !== deleteTarget.id))
      setDeleting(false)
      setDeleteTarget(null)
      showToast('Report deleted successfully!', 'success')
    }, 500)
  }, [deleteTarget])

  // ── Search filter ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return reports
    const q = search.toLowerCase()
    return reports.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.c_date.toLowerCase().includes(q)
    )
  }, [reports, search])

  return (
    <div className="space-y-5 pb-10">

      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            CBSE Annual Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Upload and manage CBSE annual submission reports.
          </p>
        </div>

        {/* Quick count badge */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10
            border border-blue-100 dark:border-blue-500/20 text-[12px] font-semibold text-blue-700 dark:text-blue-400">
            <FileText className="w-3.5 h-3.5" />
            {reports.length} Report{reports.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* ── Upload Form Card ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <FilePlus2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Upload New Report</span>
        </div>

        <div className="p-5">
          {/* Form grid: 1-col mobile, 3-col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-start">

            {/* Title */}
            <div className="sm:col-span-1 lg:col-span-1">
              <Field label="Title of the Report" required error={errors.title}>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={title}
                    onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })) }}
                    placeholder="e.g. CBSE Annual Report 2024-25"
                    className={`w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                      bg-white text-slate-800 placeholder-slate-300
                      focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                      dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                      dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                      ${errors.title
                        ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
                        : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                      }`}
                  />
                </div>
              </Field>
            </div>

            {/* Date */}
            <div className="sm:col-span-1 lg:col-span-1">
              <Field label="Date of Submission" required error={errors.date}>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    max={getTodayISO()}
                    onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: undefined })) }}
                    className={`w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                      bg-white text-slate-800
                      focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                      dark:bg-[#1e2238] dark:text-slate-200 dark:color-scheme-dark
                      dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                      ${errors.date
                        ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
                        : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                      }`}
                  />
                </div>
              </Field>
            </div>

            {/* File Upload */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Field label="Select File" required error={errors.file}>
                <FileDropzone
                  file={file}
                  onChange={(f) => { setFile(f); setErrors(p => ({ ...p, file: undefined })) }}
                  error={errors.file}
                />
              </Field>
            </div>

            {/* Submit Button */}
            <div className="sm:col-span-2 lg:col-span-1 flex flex-col justify-end">
              <div className="hidden lg:block h-[23px]" /> {/* label height spacer */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl
                  text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  shadow-md shadow-blue-500/25 dark:shadow-indigo-500/20
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Submitting…</>
                  : <><Plus className="w-4 h-4" />Submit Report</>
                }
              </button>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2 text-center hidden lg:block">
                PDF, DOC, XLS — Max 10 MB
              </p>
            </div>
          </div>

          {/* Info hint */}
          <div className="flex items-start gap-2 mt-4 px-3 py-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-500/[0.06] border border-blue-100 dark:border-blue-500/15">
            <Info className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-blue-700 dark:text-blue-300">
              All fields are mandatory. Uploaded report will be listed below for reference and management.
            </p>
          </div>
        </div>
      </div>

      {/* ── Reports List Card ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Submitted Reports</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search title or date…"
              className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
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
                  {['S.No.', 'Report Title & File', 'Date of Submission', 'Action'].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                        ${i === 0 || i === 3 ? 'text-center w-16' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((report, i) => (
                  <DesktopRow
                    key={report.id}
                    report={report}
                    idx={i + 1}
                    onDelete={setDeleteTarget}
                    deleting={deleting}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState search={search} onClear={() => setSearch('')} mobile />
          ) : (
            <>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap the trash icon to delete a report.
              </p>
              {filtered.map((report, i) => (
                <MobileCard
                  key={report.id}
                  report={report}
                  idx={i + 1}
                  onDelete={setDeleteTarget}
                  deleting={deleting}
                />
              ))}
            </>
          )}
        </div>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{reports.length}</span> reports
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
        )}
      </div>

      {/* Delete Modal */}
      {deleteTarget && (
        <DeleteModal
          report={deleteTarget}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search, onClear, mobile }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-slate-600 ${mobile ? 'py-10' : 'py-14'}`}>
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        {search
          ? <Search className="w-7 h-7 opacity-40" />
          : <ClipboardList className="w-7 h-7 opacity-40" />
        }
      </div>
      <div className="text-center">
        {search ? (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No results found</p>
            <p className="text-[12px] mt-1">No reports match <span className="font-semibold">"{search}"</span></p>
            <button
              onClick={onClear}
              className="mt-3 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Clear search
            </button>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No reports yet</p>
            <p className="text-[12px] mt-1">Submit the form above to add the first report.</p>
          </>
        )}
      </div>
    </div>
  )
}
