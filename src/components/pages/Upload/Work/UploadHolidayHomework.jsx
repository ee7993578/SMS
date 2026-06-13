/**
 * UploadHolidayHomework.jsx
 * Folder: src/pages/Uploads/UploadHolidayHomework.jsx
 *
 * Converts legacy ASPX "Upload Holiday Homework" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Faculty / Class / Section cascading dropdowns
 *  - Holiday Homework Title input with validation
 *  - PDF-only file upload with drag-and-drop on desktop
 *  - Save button with validation + loading state
 *  - Uploaded records table (desktop) / cards (mobile) with delete
 *  - Toast notifications
 *  - Empty state
 *  - No horizontal scroll on mobile
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Upload, BookOpen, Trash2, Eye, RefreshCw,
  AlertCircle, X, Check, Loader2, ChevronDown,
  FileText, School2, Users, Filter,
  SlidersHorizontal, FilePlus2, FolderOpen,
  ClipboardList, Info, Search,
} from 'lucide-react'

// ─── STATIC DUMMY DATA ────────────────────────────────────────────────────────

const FACULTIES = [
  { id: '1', name: 'Mrs. Sunita Sharma' },
  { id: '2', name: 'Mr. Rajesh Verma' },
  { id: '3', name: 'Mrs. Priya Singh' },
  { id: '4', name: 'Mr. Anil Kumar' },
]

const CLASSES = [
  { id: '1', name: 'Class I' },
  { id: '2', name: 'Class II' },
  { id: '3', name: 'Class III' },
  { id: '4', name: 'Class IV' },
  { id: '5', name: 'Class V' },
  { id: '6', name: 'Class VI' },
  { id: '7', name: 'Class VII' },
  { id: '8', name: 'Class VIII' },
  { id: '9', name: 'Class IX' },
  { id: '10', name: 'Class X' },
  { id: '11', name: 'Class XI' },
  { id: '12', name: 'Class XII' },
]

// Sections cascade from class
const SECTIONS_BY_CLASS = {
  '1': ['A', 'B'],
  '2': ['A', 'B'],
  '3': ['A'],
  '4': ['A'],
  '5': ['A'],
  '6': ['A', 'B', 'C'],
  '7': ['A', 'B'],
  '8': ['A'],
  '9': ['A', 'B'],
  '10': ['A', 'B'],
  '11': ['A', 'B', 'C'],
  '12': ['A', 'B'],
}

// Pre-loaded dummy uploaded records
const INITIAL_RECORDS = [
  {
    id: 1,
    title: 'Summer Vacation Homework - Science',
    class_name: 'Class VI',
    class_id: '6',
    sec_id: 'A',
    faculty: 'Mrs. Sunita Sharma',
    fpath: '#',
    LName: 'science_homework.pdf',
    uploaded_on: '2025-05-10',
  },
  {
    id: 2,
    title: 'Diwali Holiday Assignment - Maths',
    class_name: 'Class IX',
    class_id: '9',
    sec_id: 'B',
    faculty: 'Mr. Rajesh Verma',
    fpath: '#',
    LName: 'maths_assignment.pdf',
    uploaded_on: '2025-10-18',
  },
  {
    id: 3,
    title: 'Winter Break Project - English',
    class_name: 'Class XI',
    class_id: '11',
    sec_id: 'A',
    faculty: 'Mrs. Priya Singh',
    fpath: '#',
    LName: 'english_project.pdf',
    uploaded_on: '2025-12-22',
  },
  {
    id: 4,
    title: 'Republic Day Special - Social Science',
    class_name: 'Class VII',
    class_id: '7',
    sec_id: 'A',
    faculty: 'Mr. Anil Kumar',
    fpath: '#',
    LName: 'social_science_hw.pdf',
    uploaded_on: '2026-01-24',
  },
]

// ─── COLOUR PALETTE ───────────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') =>
  CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

// ─── PRIMITIVE: NativeSelect ──────────────────────────────────────────────────
function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none
          transition-all cursor-pointer bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

// ─── PRIMITIVE: Field ─────────────────────────────────────────────────────────
function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
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

// ─── PRIMITIVE: Toast ─────────────────────────────────────────────────────────
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

// ─── FILE UPLOAD ZONE ─────────────────────────────────────────────────────────
function FileUploadZone({ file, onChange, error }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onChange(f)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed
        cursor-pointer transition-all select-none
        ${dragging
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10'
          : error
            ? 'border-rose-300 bg-rose-50 dark:bg-rose-500/5'
            : file
              ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
              : 'border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 dark:border-[rgba(99,102,241,0.25)] dark:hover:bg-blue-500/5'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => onChange(e.target.files[0] || null)}
      />
      {file ? (
        <>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
            <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-300 truncate max-w-[200px]">{file.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="text-[11px] text-rose-500 hover:underline flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Remove
          </button>
        </>
      ) : (
        <>
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FilePlus2 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
              {dragging ? 'Drop PDF here' : 'Click or drag PDF here'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Only PDF files accepted</p>
          </div>
        </>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ record, idx, onDelete, deleting }) {
  const { fg, bg } = classColor(record.class_name)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3.5 text-center text-[12px] text-slate-400 tabular-nums w-12">{idx}</td>

      {/* Title */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex-shrink-0 flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{record.title}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{record.faculty}</p>
          </div>
        </div>
      </td>

      {/* Class */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {record.class_name.replace('Class ', '')}
          </span>
          <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{record.class_name}</span>
        </div>
      </td>

      {/* Section */}
      <td className="px-4 py-3.5 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {record.sec_id}
        </span>
      </td>

      {/* File */}
      <td className="px-4 py-3.5">
        <a
          href={record.fpath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate max-w-[160px]">{record.LName}</span>
        </a>
      </td>

      {/* Uploaded On */}
      <td className="px-4 py-3.5 text-center text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {record.uploaded_on}
      </td>

      {/* Delete */}
      <td className="px-4 py-3.5 text-center">
        <button
          onClick={() => onDelete(record.id)}
          disabled={deleting === record.id}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            transition-colors disabled:opacity-50"
        >
          {deleting === record.id
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />}
          Delete
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ record, onDelete, deleting }) {
  const { fg, bg } = classColor(record.class_name)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Top */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5"
          style={{ background: bg, color: fg }}
        >
          {record.class_name.replace('Class ', '')}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{record.title}</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{record.faculty}</p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              {record.class_name}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
              Sec {record.sec_id}
            </span>
            <span className="text-[11px] text-slate-400">{record.uploaded_on}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.08)] bg-slate-50/50 dark:bg-white/[0.015]">
        <a
          href={record.fpath}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline min-w-0"
        >
          <FileText className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{record.LName}</span>
        </a>
        <button
          onClick={() => onDelete(record.id)}
          disabled={deleting === record.id}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold flex-shrink-0
            bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            transition-colors disabled:opacity-50"
        >
          {deleting === record.id
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />}
          Delete
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UploadHolidayHomework() {
  // Form state
  const [faculty,  setFaculty]  = useState('')
  const [classId,  setClassId]  = useState('')
  const [section,  setSection]  = useState('')
  const [title,    setTitle]    = useState('')
  const [file,     setFile]     = useState(null)
  const [errors,   setErrors]   = useState({})
  const [saving,   setSaving]   = useState(false)

  // Records state
  const [records,  setRecords]  = useState(INITIAL_RECORDS)
  const [deleting, setDeleting] = useState(null) // id of row being deleted
  const [search,   setSearch]   = useState('')

  // Toast
  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Cascade sections on class change
  const sections = useMemo(() => SECTIONS_BY_CLASS[classId] || [], [classId])
  const handleClassChange = (e) => {
    setClassId(e.target.value)
    setSection('')
    setErrors(p => ({ ...p, classId: undefined, section: undefined }))
  }

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!faculty)  err.faculty  = 'Select faculty'
    if (!classId)  err.classId  = 'Select class'
    if (!section)  err.section  = 'Select section'
    if (!title.trim())    err.title   = 'Enter homework title'
    if (!file)     err.file    = 'Upload a PDF file'
    else if (!file.name.toLowerCase().endsWith('.pdf'))
      err.file = 'Only PDF files are allowed'
    return err
  }

  // ── Save ────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setSaving(true)

    // Simulate API save
    setTimeout(() => {
      const facultyObj = FACULTIES.find(f => f.id === faculty)
      const classObj   = CLASSES.find(c => c.id === classId)
      const newRecord  = {
        id: Date.now(),
        title: title.trim(),
        class_name: classObj?.name || '',
        class_id: classId,
        sec_id: section,
        faculty: facultyObj?.name || '',
        fpath: '#',
        LName: file.name,
        uploaded_on: new Date().toISOString().slice(0, 10),
      }
      setRecords(p => [newRecord, ...p])
      // Reset form
      setFaculty(''); setClassId(''); setSection('')
      setTitle(''); setFile(null)
      setSaving(false)
      showToast('Holiday homework uploaded successfully!')
    }, 900)
  }, [faculty, classId, section, title, file])

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    setDeleting(id)
    setTimeout(() => {
      setRecords(p => p.filter(r => r.id !== id))
      setDeleting(null)
      showToast('Record deleted.', 'success')
    }, 600)
  }

  // ── Filtered records ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return records
    const q = search.toLowerCase()
    return records.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.sec_id.toLowerCase().includes(q) ||
      r.faculty.toLowerCase().includes(q)
    )
  }, [records, search])

  return (
    <div className="space-y-5 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Upload className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Upload Holiday Homework
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Assign PDF homework to a class section — visible to students &amp; parents.
        </p>
      </div>

      {/* ── UPLOAD FORM CARD ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <FilePlus2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">New Upload</span>
        </div>

        <div className="p-5 space-y-5">

          {/* Row 1: Faculty + Class + Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Field label="Faculty" error={errors.faculty} required>
              <NativeSelect
                value={faculty}
                onChange={e => { setFaculty(e.target.value); setErrors(p => ({ ...p, faculty: undefined })) }}
                placeholder="-- Select Faculty --"
                error={errors.faculty}
              >
                {FACULTIES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.classId} required>
              <NativeSelect
                value={classId}
                onChange={handleClassChange}
                placeholder="-- Select Class --"
                error={errors.classId}
              >
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Section" error={errors.section} required>
              <NativeSelect
                value={section}
                onChange={e => { setSection(e.target.value); setErrors(p => ({ ...p, section: undefined })) }}
                placeholder="-- Select Section --"
                error={errors.section}
                disabled={!classId}
              >
                {sections.map(s => <option key={s} value={s}>Section {s}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Row 2: Title + File */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Homework Title" error={errors.title} required>
              <input
                type="text"
                value={title}
                onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })) }}
                placeholder="e.g. Summer Vacation Homework – Science"
                className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                  bg-white text-slate-800 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                  dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                  ${errors.title ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
              />
            </Field>

            <Field label="Upload File (PDF only)" error={errors.file} required>
              <FileUploadZone
                file={file}
                onChange={(f) => { setFile(f); setErrors(p => ({ ...p, file: undefined })) }}
                error={errors.file}
              />
            </Field>
          </div>

          {/* Hint */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/[0.06] border border-blue-100 dark:border-blue-500/20">
            <Info className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              Only <strong>PDF</strong> files are accepted. File will be visible to students and parents of the selected class/section.
            </p>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Check className="w-4 h-4" /> Save</>}
            </button>
          </div>
        </div>
      </div>

      {/* ── UPLOADED RECORDS ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
            <ClipboardList className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Uploaded Homework</span>
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
              placeholder="Search title, class…"
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
            <EmptyState search={search} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Title / Faculty', 'Class', 'Sec', 'File', 'Date', 'Action'].map((h, i) => (
                    <th key={i}
                      className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12 last:w-24">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <DesktopRow key={r.id} record={r} idx={i + 1} onDelete={handleDelete} deleting={deleting} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0
            ? <EmptyState search={search} />
            : filtered.map(r => (
              <MobileCard key={r.id} record={r} onDelete={handleDelete} deleting={deleting} />
            ))
          }
        </div>

        {/* Footer */}
        {records.length > 0 && (
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
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
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <FolderOpen className="w-7 h-7 opacity-50" />
      </div>
      <div className="text-center">
        {search
          ? <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No records match "{search}"</p>
            <p className="text-[12px] mt-1">Try a different search term.</p>
          </>
          : <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No homework uploaded yet</p>
            <p className="text-[12px] mt-1">Fill the form above and click <strong>Save</strong> to upload.</p>
          </>
        }
      </div>
    </div>
  )
}
