/**
 * UploadSyllabus.jsx
 * Folder: src/pages/Uploads/UploadSyllabus.jsx
 *
 * Converts legacy ASPX "Upload Syllabus" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class → Section → Term → Exam cascade dropdowns
 *  - Syllabus Title input + File upload
 *  - Save with validation
 *  - GridView of uploaded syllabi with Delete action
 *  - Desktop: ERP-style table view
 *  - Mobile: card-based layout with drawer filters
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Upload, BookOpen, Trash2, Eye, RefreshCw, Filter,
  AlertCircle, X, Check, Loader2, ChevronDown,
  FileText, SlidersHorizontal, Search, Info,
  FolderOpen, GraduationCap, Calendar, Award,
  BookMarked, FilePlus, School2, Download,
  ChevronRight, File, Plus
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

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

const SECTIONS_MAP = {
  '1': [{ id: 'A', name: 'Section A' }],
  '2': [{ id: 'A', name: 'Section A' }],
  '3': [{ id: 'A', name: 'Section A' }, { id: 'B', name: 'Section B' }],
  '4': [{ id: 'A', name: 'Section A' }, { id: 'B', name: 'Section B' }],
  '5': [{ id: 'A', name: 'Section A' }, { id: 'B', name: 'Section B' }],
  '6': [{ id: 'A', name: 'Section A' }],
  '7': [{ id: 'A', name: 'Section A' }],
  '8': [{ id: 'A', name: 'Section A' }],
  '9': [{ id: 'A', name: 'Section A' }, { id: 'B', name: 'Section B' }],
  '10': [{ id: 'A', name: 'Section A' }],
  '11': [{ id: 'A', name: 'Section A' }],
  '12': [{ id: 'A', name: 'Section A' }, { id: 'B', name: 'Section B' }],
  '13': [{ id: 'A', name: 'Section A' }],
  '14': [{ id: 'A', name: 'Section A' }, { id: 'B', name: 'Section B' }],
  '15': [{ id: 'A', name: 'Section A' }, { id: 'B', name: 'Section B' }],
}

const TERMS = [
  { id: '1', name: 'Term 1 (April – September)' },
  { id: '2', name: 'Term 2 (October – March)' },
  { id: '3', name: 'Annual' },
]

const EXAMS = [
  { id: '1', name: 'Unit Test 1' },
  { id: '2', name: 'Half Yearly' },
  { id: '3', name: 'Unit Test 2' },
  { id: '4', name: 'Final / Annual' },
  { id: '5', name: 'Pre-Board' },
]

// Pre-loaded dummy syllabus records
const INITIAL_RECORDS = [
  {
    id: 1,
    title: 'Mathematics Syllabus',
    class_name: 'Class IX',
    class_id: '12',
    sec_id: 'A',
    term_id: '1',
    exam_type: 'Half Yearly',
    exam_type_id: '2',
    session: '2024-25',
    fpath: '#',
    fileName: 'math_syllabus_IX_A.pdf',
  },
  {
    id: 2,
    title: 'Science Syllabus',
    class_name: 'Class X',
    class_id: '13',
    sec_id: 'A',
    term_id: '2',
    exam_type: 'Final / Annual',
    exam_type_id: '4',
    session: '2024-25',
    fpath: '#',
    fileName: 'science_syllabus_X_A.pdf',
  },
  {
    id: 3,
    title: 'English Literature',
    class_name: 'Class XI',
    class_id: '14',
    sec_id: 'B',
    term_id: '1',
    exam_type: 'Unit Test 1',
    exam_type_id: '1',
    session: '2024-25',
    fpath: '#',
    fileName: 'english_lit_XI_B.pdf',
  },
  {
    id: 4,
    title: 'Hindi Grammar',
    class_name: 'Class VI',
    class_id: '9',
    sec_id: 'A',
    term_id: '2',
    exam_type: 'Half Yearly',
    exam_type_id: '2',
    session: '2024-25',
    fpath: '#',
    fileName: 'hindi_grammar_VI_A.pdf',
  },
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

const classColor = (name = '') =>
  CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

const formatAbbr = (name = '') =>
  name.replace('Class ', '').slice(0, 3).toUpperCase()

const examBadgeColor = (exam = '') => {
  if (exam.includes('Annual') || exam.includes('Final'))
    return 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
  if (exam.includes('Half'))
    return 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
  if (exam.includes('Unit'))
    return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
  if (exam.includes('Pre'))
    return 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400'
  return 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
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

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="ml-1 text-slate-300 dark:text-slate-600 normal-case font-normal tracking-normal">
            ({hint})
          </span>
        )}
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

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── FILE DROP ZONE ───────────────────────────────────────────────────────────

function FileDropZone({ file, onChange, error }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) onChange(dropped)
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative flex flex-col items-center justify-center gap-2 px-4 py-5 rounded-xl border-2 border-dashed cursor-pointer transition-all
        ${dragging
          ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10'
          : error
            ? 'border-rose-300 bg-rose-50/50 dark:bg-rose-500/5'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-slate-50/50 dark:bg-white/[0.02] hover:border-blue-300 hover:bg-blue-50/40 dark:hover:bg-blue-500/5'
        }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
        className="hidden"
        onChange={(e) => onChange(e.target.files[0] || null)}
      />
      {file ? (
        <div className="flex items-center gap-2.5 w-full">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <File className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{file.name}</p>
            <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(null) }}
            className="p-1.5 rounded-lg hover:bg-rose-100 dark:hover:bg-rose-500/15 text-slate-400 hover:text-rose-500 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <>
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <Upload className="w-5 h-5 text-blue-500 dark:text-blue-400" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
              Drop file here or <span className="text-blue-600 dark:text-blue-400">browse</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">PDF, DOC, PPT, XLS supported</p>
          </div>
        </>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx, onDelete }) {
  const { fg, bg } = classColor(row.class_name)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.title}</span>
        </div>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.class_name)}
          </span>
          <span className="text-[13px] text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {row.class_name}
            <span className="ml-1 text-[11px] text-slate-400">/ Sec {row.sec_id}</span>
          </span>
        </div>
      </td>

      {/* Exam */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${examBadgeColor(row.exam_type)}`}>
          {row.exam_type}
        </span>
      </td>

      {/* Session */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {row.session}
        </span>
      </td>

      {/* File */}
      <td className="px-4 py-3">
        <a
          href={row.fpath}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate max-w-[160px]"
        >
          <Download className="w-3.5 h-3.5 flex-shrink-0" />
          {row.fileName}
        </a>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onDelete(row.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-rose-50 text-rose-600 hover:bg-rose-100
            dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            transition-colors opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE RECORD CARD ───────────────────────────────────────────────────────

function MobileCard({ row, idx, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class_name)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.title}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-bold"
              style={{ background: bg, color: fg }}
            >
              {formatAbbr(row.class_name)}
            </span>
            <span>{row.class_name} · Sec {row.sec_id}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span>{row.session}</span>
          </p>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Exam badge pill */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold ${examBadgeColor(row.exam_type)}`}>
          <Award className="w-3 h-3 mr-1" />
          {row.exam_type}
        </span>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Class</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.class_name}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Section</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Section {row.sec_id}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Session</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.session}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Exam</p>
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{row.exam_type}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <a
              href={row.fpath}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download File
            </a>
            <button
              onClick={() => onDelete(row.id)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-100 dark:border-rose-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── UPLOAD FORM ─────────────────────────────────────────────────────────────

function UploadForm({ onSave, saving }) {
  const [classId, setClassId]   = useState('')
  const [secId, setSecId]       = useState('')
  const [termId, setTermId]     = useState('')
  const [examId, setExamId]     = useState('')
  const [title, setTitle]       = useState('')
  const [file, setFile]         = useState(null)
  const [errors, setErrors]     = useState({})

  const sections = classId ? (SECTIONS_MAP[classId] || []) : []
  const showSection = sections.length > 1

  const handleClassChange = (val) => {
    setClassId(val)
    setSecId('')
    setErrors(p => ({ ...p, classId: undefined }))
  }

  const validate = () => {
    const err = {}
    if (!classId) err.classId = 'Select a class'
    if (!termId)  err.termId  = 'Select a term'
    if (!examId)  err.examId  = 'Select an exam'
    if (!title.trim()) err.title = 'Enter syllabus title'
    if (!file)    err.file    = 'Upload a file'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    const className = CLASSES.find(c => c.id === classId)?.name || ''
    const examName  = EXAMS.find(e => e.id === examId)?.name || ''
    const payload = {
      id: Date.now(),
      title: title.trim(),
      class_name: className,
      class_id: classId,
      sec_id: secId || (sections[0]?.id || 'A'),
      term_id: termId,
      exam_type: examName,
      exam_type_id: examId,
      session: '2024-25',
      fpath: URL.createObjectURL(file),
      fileName: file.name,
    }
    onSave(payload)
    // Reset
    setClassId(''); setSecId(''); setTermId(''); setExamId('')
    setTitle(''); setFile(null); setErrors({})
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <FilePlus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Upload New Syllabus</span>
      </div>

      {/* Form Body */}
      <div className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Class */}
          <Field label="Select Class" error={errors.classId} required>
            <NativeSelect
              value={classId}
              onChange={e => handleClassChange(e.target.value)}
              placeholder="-- Select Class --"
              error={errors.classId}
            >
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>

          {/* Section — shown only when class has multiple sections */}
          {showSection && (
            <Field label="Select Section">
              <NativeSelect
                value={secId}
                onChange={e => setSecId(e.target.value)}
                placeholder="-- Select Section --"
                disabled={!classId}
              >
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
            </Field>
          )}

          {/* Term */}
          <Field label="Select Term" error={errors.termId} required>
            <NativeSelect
              value={termId}
              onChange={e => { setTermId(e.target.value); setErrors(p => ({ ...p, termId: undefined })) }}
              placeholder="-- Select Term --"
              error={errors.termId}
            >
              {TERMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </NativeSelect>
          </Field>

          {/* Exam */}
          <Field label="Select Exam" error={errors.examId} required>
            <NativeSelect
              value={examId}
              onChange={e => { setExamId(e.target.value); setErrors(p => ({ ...p, examId: undefined })) }}
              placeholder="-- Select Exam --"
              error={errors.examId}
            >
              {EXAMS.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </NativeSelect>
          </Field>

          {/* Title */}
          <Field label="Syllabus Title" error={errors.title} required>
            <input
              type="text"
              value={title}
              onChange={e => {
                // Strip invalid chars (mirrors ASPX FilteredTextBoxExtender)
                const filtered = e.target.value.replace(/[,.;'=<>?:"{}|+_`~!@#$%^&*()]+/g, '')
                setTitle(filtered)
                setErrors(p => ({ ...p, title: undefined }))
              }}
              placeholder="e.g. Mathematics Syllabus"
              className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                bg-white text-slate-800 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                ${errors.title
                  ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
                  : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                }`}
            />
          </Field>
        </div>

        {/* File Upload */}
        <div className="mt-4">
          <Field label="File to Upload" error={errors.file} required>
            <FileDropZone file={file} onChange={(f) => { setFile(f); setErrors(p => ({ ...p, file: undefined })) }} error={errors.file} />
          </Field>
        </div>

        {/* Save Button */}
        <div className="mt-5 flex items-center gap-3">
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
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Upload className="w-4 h-4" />
            }
            {saving ? 'Saving…' : 'Save Syllabus'}
          </button>
          <button
            type="button"
            onClick={() => {
              setClassId(''); setSecId(''); setTermId(''); setExamId('')
              setTitle(''); setFile(null); setErrors({})
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── RECORDS PANEL ────────────────────────────────────────────────────────────

function RecordsPanel({ records, onDelete }) {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return records
    const q = search.toLowerCase()
    return records.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.exam_type.toLowerCase().includes(q) ||
      r.session.toLowerCase().includes(q)
    )
  }, [records, search])

  if (records.length === 0) return null

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
          <BookMarked className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Uploaded Syllabi</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            {records.length} file{records.length !== 1 ? 's' : ''}
          </span>
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-56 flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search syllabus…"
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

      {/* Info */}
      <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
        <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        <p className="text-[12px] text-blue-700 dark:text-blue-400">
          Hover a row and click Delete to remove a syllabus. Click the file link to download.
        </p>
      </div>

      {/* DESKTOP TABLE */}
      <div className="hidden md:block overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
            <Search className="w-6 h-6 opacity-40" />
            <span className="text-[13px]">No records match your search.</span>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                {['S.No.', 'Title', 'Class / Section', 'Exam', 'Session', 'File', 'Actions'].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => (
                <DesktopRow key={row.id} row={row} idx={i + 1} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MOBILE CARDS */}
      <div className="md:hidden p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
            <Search className="w-6 h-6 opacity-40" />
            <span className="text-[13px]">No records match your search.</span>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              Tap a card to view details and actions.
            </p>
            {filtered.map((row, i) => (
              <MobileCard key={row.id} row={row} idx={i + 1} onDelete={onDelete} />
            ))}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
        <p className="text-[12px] text-slate-400 dark:text-slate-500">
          Showing{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
          {' '}of{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span>
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
  )
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────

function DeleteModal({ onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[90vw] max-w-sm
          rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
          shadow-2xl p-6 text-center"
        style={{ animation: 'fadeIn .2s ease' }}
      >
        <style>{`@keyframes fadeIn{from{opacity:0;transform:translate(-50%,-45%)}to{opacity:1;transform:translate(-50%,-50%)}}`}</style>
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
        </div>
        <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-100 mb-1">Delete Syllabus?</h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-5">
          This action cannot be undone. The file will be permanently removed.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20 transition-all active:scale-95"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function UploadSyllabus() {
  const [records,      setRecords]      = useState(INITIAL_RECORDS)
  const [saving,       setSaving]       = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast,        setToast]        = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSave = useCallback((payload) => {
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setRecords(prev => [payload, ...prev])
      setSaving(false)
      showToast('Syllabus uploaded successfully!')
    }, 700)
  }, [])

  const handleDelete = (id) => setDeleteTarget(id)

  const confirmDelete = () => {
    setRecords(prev => prev.filter(r => r.id !== deleteTarget))
    setDeleteTarget(null)
    showToast('Syllabus deleted.', 'error')
  }

  return (
    <div className="space-y-5 pb-10">
      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Upload Syllabus
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Upload and manage class syllabi — term-wise and exam-wise.
          </p>
        </div>

        {/* Stats pill */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300">{records.length}</span>
            <span className="text-[12px] text-blue-500 dark:text-blue-400">syllabi uploaded</span>
          </div>
        </div>
      </div>

      {/* ── Breadcrumbs ─────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
        <a href="#" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">Home</a>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-600 dark:text-slate-300 font-semibold">Upload Syllabus</span>
      </nav>

      {/* ── Upload Form ─────────────────────────────────────────────────────── */}
      <UploadForm onSave={handleSave} saving={saving} />

      {/* ── Records Table / Cards ───────────────────────────────────────────── */}
      <RecordsPanel records={records} onDelete={handleDelete} />

      {/* Empty state when no records */}
      {records.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No syllabi uploaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Fill in the form above and click <strong>Save Syllabus</strong> to get started.
            </p>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <DeleteModal onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
