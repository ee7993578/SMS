/**
 * UploadDailyHomework.jsx
 * Folder: src/pages/Homework/UploadDailyHomework.jsx
 *
 * Converts legacy ASPX "Upload Daily Homework" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class dropdown + Date picker filter
 *  - Existing homework viewer (repeater → table/cards)
 *  - Upload/Update homework grid (GridView → editable table/cards)
 *  - Delete confirmation modal
 *  - File upload per subject
 *  - Mobile: card-based layouts, drawer filters, touch-friendly
 *  - Desktop: dense ERP-style table with inline editing
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Upload, Eye, Trash2, FileText, X, Check,
  ChevronDown, AlertCircle, Loader2,
  BookOpen, Calendar, School2, ClipboardList,
  Paperclip, Search, RefreshCw, SlidersHorizontal,
  Info, ChevronRight, Plus, Edit3, Save,
  GraduationCap, BookMarked, FilePlus2, FolderOpen
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const CLASSES = [
  { id: '1',  label: 'Nursery' },
  { id: '2',  label: 'LKG' },
  { id: '3',  label: 'UKG' },
  { id: '4',  label: 'Class I' },
  { id: '5',  label: 'Class II' },
  { id: '6',  label: 'Class III' },
  { id: '7',  label: 'Class IV' },
  { id: '8',  label: 'Class V' },
  { id: '9',  label: 'Class VI' },
  { id: '10', label: 'Class VII' },
  { id: '11', label: 'Class VIII' },
  { id: '12', label: 'Class IX' },
  { id: '13', label: 'Class X' },
  { id: '14', label: 'Class XI' },
  { id: '15', label: 'Class XII' },
]

// Subjects per class (simplified for demo)
const SUBJECTS_BY_CLASS = {
  '1':  ['English', 'Hindi', 'Maths', 'EVS', 'Drawing'],
  '2':  ['English', 'Hindi', 'Maths', 'EVS', 'Drawing'],
  '3':  ['English', 'Hindi', 'Maths', 'EVS', 'GK'],
  '4':  ['English', 'Hindi', 'Maths', 'EVS', 'GK', 'Computer'],
  '5':  ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Computer'],
  '6':  ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  '7':  ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  '8':  ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit', 'Computer'],
  '9':  ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit', 'Computer', 'Drawing'],
  '10': ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  '11': ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  '12': ['English', 'Hindi', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Computer'],
  '13': ['English', 'Hindi', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Computer'],
  '14': ['English', 'Physics', 'Chemistry', 'Maths', 'Biology', 'Computer Science', 'Physical Education'],
  '15': ['English', 'Physics', 'Chemistry', 'Maths', 'Biology', 'Computer Science', 'Physical Education'],
}

// Existing homework (dummy — keyed by classId + date string)
const EXISTING_HW = {
  '4_13 Jun 2025': [
    { homeworkid: 'hw001', Subject: 'English',        homework_desc: 'Read chapter 5 and answer Q1–Q5 in notebook.',       file_path: '/uploads/eng_hw.pdf' },
    { homeworkid: 'hw002', Subject: 'Hindi',           homework_desc: 'लेख लिखो – मेरा विद्यालय (200 शब्द)',              file_path: '' },
    { homeworkid: 'hw003', Subject: 'Maths',           homework_desc: 'Exercise 3.2: Q1 to Q10 complete karo.',            file_path: '/uploads/maths_hw.pdf' },
    { homeworkid: 'hw004', Subject: 'EVS',             homework_desc: 'Draw a food chain diagram with labels.',            file_path: '' },
  ],
  '9_13 Jun 2025': [
    { homeworkid: 'hw010', Subject: 'Science',         homework_desc: 'Write notes on photosynthesis — diagram required.', file_path: '/uploads/sci_hw.pdf' },
    { homeworkid: 'hw011', Subject: 'Social Science',  homework_desc: 'Map work: Rivers of India on outline map.',         file_path: '' },
    { homeworkid: 'hw012', Subject: 'Maths',           homework_desc: 'NCERT Ex 5.1 Q1–Q8 with steps.',                   file_path: '/uploads/maths9.pdf' },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const SUBJECT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe', abbr: 'EN' },
  { fg: '#7c3aed', bg: '#ede9fe', abbr: 'HI' },
  { fg: '#0891b2', bg: '#cffafe', abbr: 'MA' },
  { fg: '#059669', bg: '#d1fae5', abbr: 'SC' },
  { fg: '#d97706', bg: '#fef3c7', abbr: 'SS' },
  { fg: '#dc2626', bg: '#fee2e2', abbr: 'SK' },
  { fg: '#0369a1', bg: '#e0f2fe', abbr: 'CO' },
  { fg: '#7e22ce', bg: '#f3e8ff', abbr: 'DR' },
]

const subjectColor = (name = '') =>
  SUBJECT_COLORS[(name.charCodeAt(0) ?? 0) % SUBJECT_COLORS.length]

const subjectAbbr = (name = '') => name.slice(0, 2).toUpperCase()

// Format today for default display
const todayStr = () => {
  const d = new Date()
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
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
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
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

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────

function DeleteModal({ subject, onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] w-full max-w-sm p-6"
          style={{ animation: 'popIn .2s ease' }}
        >
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="flex items-start gap-4 mb-5">
            <span className="w-11 h-11 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </span>
            <div>
              <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Delete Homework?</h3>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1">
                Delete homework for <strong className="text-slate-700 dark:text-slate-200">"{subject}"</strong>? This cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors">
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── FILE UPLOAD CELL ─────────────────────────────────────────────────────────

function FileUploadCell({ currentFilePath, onChange, fileName }) {
  const inputRef = useRef(null)
  return (
    <div className="space-y-1.5">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-slate-600
          hover:border-blue-400 hover:bg-blue-50/50 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/5
          text-[12px] text-slate-500 dark:text-slate-400 transition-all w-full"
      >
        <FilePlus2 className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
        <span className="truncate">{fileName || 'Choose file…'}</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={e => onChange(e.target.files[0])}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
      />
      {currentFilePath && !fileName && (
        <a
          href={currentFilePath}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400 hover:underline"
        >
          <Paperclip className="w-3 h-3" />Current File
        </a>
      )}
    </div>
  )
}

// ─── EXISTING HOMEWORK — DESKTOP TABLE ROW ────────────────────────────────────

function ExistingHwRow({ row, idx, onDelete }) {
  const { fg, bg } = subjectColor(row.Subject)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {subjectAbbr(row.Subject)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.Subject}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{row.homework_desc || <span className="text-slate-300 italic">No description</span>}</p>
      </td>
      <td className="px-4 py-3 text-center">
        {row.file_path ? (
          <a href={row.file_path} target="_blank" rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 text-[12px] font-semibold hover:bg-blue-100 transition-colors">
            <FileText className="w-3.5 h-3.5" />View
          </a>
        ) : (
          <span className="text-slate-300 dark:text-slate-600 text-[13px]">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onDelete(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 text-[12px] font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />Delete
        </button>
      </td>
    </tr>
  )
}

// ─── EXISTING HOMEWORK — MOBILE CARD ─────────────────────────────────────────

function ExistingHwCard({ row, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = subjectColor(row.Subject)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {subjectAbbr(row.Subject)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.Subject}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {row.homework_desc || 'No description'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {row.file_path && (
            <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
              <FileText className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </span>
          )}
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {row.homework_desc && (
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-1.5 flex items-center gap-1.5">
                <BookMarked className="w-3 h-3" />Description
              </p>
              <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">{row.homework_desc}</p>
            </div>
          )}
          <div className="flex gap-2">
            {row.file_path && (
              <a href={row.file_path} target="_blank" rel="noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-[13px] font-semibold hover:bg-blue-100 transition-colors border border-blue-100 dark:border-blue-500/20">
                <FileText className="w-4 h-4" />View File
              </a>
            )}
            <button onClick={() => onDelete(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-[13px] font-semibold hover:bg-rose-100 transition-colors border border-rose-100 dark:border-rose-500/20">
              <Trash2 className="w-4 h-4" />Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── UPLOAD HOMEWORK — DESKTOP TABLE ROW ─────────────────────────────────────

function UploadHwRow({ row, idx, onChange, onFileChange }) {
  const { fg, bg } = subjectColor(row.subjectname)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-12 align-top pt-4">{idx}</td>
      <td className="px-4 py-3 align-top pt-4">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}>
            {subjectAbbr(row.subjectname)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.subjectname}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <textarea
          rows={2}
          value={row.homework_desc}
          onChange={e => onChange(row.subject_id, 'homework_desc', e.target.value)}
          placeholder="Enter homework description…"
          className="w-full px-3 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
            bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
            outline-none resize-none placeholder-slate-300 dark:placeholder-slate-600 transition-all"
        />
      </td>
      <td className="px-4 py-3 align-top pt-4">
        <FileUploadCell
          currentFilePath={row.file_path}
          fileName={row._fileName}
          onChange={file => onFileChange(row.subject_id, file)}
        />
      </td>
    </tr>
  )
}

// ─── UPLOAD HOMEWORK — MOBILE CARD ───────────────────────────────────────────

function UploadHwCard({ row, onChange, onFileChange }) {
  const { fg, bg } = subjectColor(row.subjectname)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {subjectAbbr(row.subjectname)}
        </span>
        <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{row.subjectname}</span>
        {row.homework_desc && (
          <span className="ml-auto w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" title="Has description" />
        )}
      </div>
      {/* Body */}
      <div className="px-4 py-3 space-y-3">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5 block">
            Homework Description
          </label>
          <textarea
            rows={3}
            value={row.homework_desc}
            onChange={e => onChange(row.subject_id, 'homework_desc', e.target.value)}
            placeholder="Enter homework description…"
            className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
              bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
              outline-none resize-none placeholder-slate-300 dark:placeholder-slate-600 transition-all"
          />
        </div>
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5 block">
            Upload File
          </label>
          <FileUploadCell
            currentFilePath={row.file_path}
            fileName={row._fileName}
            onChange={file => onFileChange(row.subject_id, file)}
          />
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, classId, setClassId, date, setDate, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Class" error={errors.classId} required>
            <NativeSelect value={classId} onChange={e => setClassId(e.target.value)} placeholder="-- Select Class --" error={errors.classId}>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Issue Date" error={errors.date} required>
            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className={`w-full pl-3 pr-4 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                  bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                  ${errors.date ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
              />
            </div>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show
          </button>
        </div>
      </div>
    </>
  )
}

// ─── STAT BADGE ───────────────────────────────────────────────────────────────

function StatBadge({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    amber:   'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
    violet:  'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border-violet-100 dark:border-violet-500/20',
  }
  return (
    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border ${colors[color]} flex-1 min-w-0`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[18px] font-bold tabular-nums leading-tight">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function UploadDailyHomework() {
  // ── Filter state
  const [classId, setClassId]   = useState('')
  const [date, setDate]         = useState('')          // ISO date string yyyy-mm-dd
  const [errors, setErrors]     = useState({})

  // ── UI state
  const [loading, setLoading]       = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [toast, setToast]           = useState(null)

  // ── Data state
  const [existingHw, setExistingHw]   = useState([])   // rows shown in view panel
  const [uploadRows, setUploadRows]   = useState([])   // rows in upload grid
  const [shown, setShown]             = useState(false)
  const [shownLabel, setShownLabel]   = useState({ class: '', date: '' })

  // ── Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null)  // { homeworkid, Subject }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Format date from ISO to display string
  const formatDateDisplay = (iso) => {
    if (!iso) return ''
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  // ── Show Report ─────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!classId) err.classId = 'Select a class'
    if (!date)    err.date    = 'Select a date'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const dateDisp = formatDateDisplay(date)
      const key = `${classId}_${dateDisp}`
      const existing = EXISTING_HW[key] || []

      // Build upload rows from subjects for this class
      const subjects = SUBJECTS_BY_CLASS[classId] || []
      const rows = subjects.map((s, i) => {
        const found = existing.find(e => e.Subject === s)
        return {
          subject_id:    `${classId}_${i}`,
          subjectname:   s,
          homework_desc: found?.homework_desc || '',
          file_path:     found?.file_path || '',
          _fileName:     '',
          _file:         null,
        }
      })

      setExistingHw(existing)
      setUploadRows(rows)
      setShownLabel({
        class: CLASSES.find(c => c.id === classId)?.label || '',
        date: dateDisp,
      })
      setShown(true)
      setLoading(false)
      showToast(existing.length > 0
        ? `Found ${existing.length} existing homework records.`
        : `No existing homework for this date. You can add new.`)
    }, 700)
  }, [classId, date])

  // ── Reset ───────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setClassId(''); setDate(''); setErrors({})
    setExistingHw([]); setUploadRows([])
    setShown(false); setShownLabel({ class: '', date: '' })
  }

  // ── Upload row change ────────────────────────────────────────────────────────
  const handleRowChange = useCallback((subjectId, field, value) => {
    setUploadRows(prev => prev.map(r =>
      r.subject_id === subjectId ? { ...r, [field]: value } : r
    ))
  }, [])

  const handleFileChange = useCallback((subjectId, file) => {
    setUploadRows(prev => prev.map(r =>
      r.subject_id === subjectId
        ? { ...r, _file: file, _fileName: file?.name || '' }
        : r
    ))
  }, [])

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const hasAny = uploadRows.some(r => r.homework_desc || r._file)
    if (!hasAny) { showToast('Enter at least one homework description or file.', 'error'); return }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      showToast(`Homework uploaded successfully for ${shownLabel.class} — ${shownLabel.date}!`)
      // Simulate updating existing list
      const updated = uploadRows
        .filter(r => r.homework_desc || r._file)
        .map(r => ({ homeworkid: `hw_${r.subject_id}`, Subject: r.subjectname, homework_desc: r.homework_desc, file_path: r._file ? URL.createObjectURL(r._file) : r.file_path }))
      setExistingHw(updated)
    }, 1000)
  }

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDeleteClick = (row) => setDeleteTarget(row)

  const handleDeleteConfirm = () => {
    setExistingHw(prev => prev.filter(r => r.homeworkid !== deleteTarget.homeworkid))
    setDeleteTarget(null)
    showToast(`Homework for "${deleteTarget.Subject}" deleted.`)
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const hasExisting  = existingHw.length > 0
  const filledCount  = uploadRows.filter(r => r.homework_desc || r._file).length
  const activeFilters = [classId, date].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">
      <style>{`
        input[type="date"]::-webkit-calendar-picker-indicator { opacity: 0.5; cursor: pointer; }
      `}</style>

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Upload Daily Homework
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View, upload, and manage daily homework per class and subject.
          </p>
        </div>
        {shown && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">
              {shownLabel.class} · {shownLabel.date}
            </span>
          </div>
        )}
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
          <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Select Class" error={errors.classId} required>
              <NativeSelect
                value={classId}
                onChange={e => { setClassId(e.target.value); setErrors(p => ({ ...p, classId: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.classId}
              >
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Issue Date" error={errors.date} required>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  type="date"
                  value={date}
                  onChange={e => { setDate(e.target.value); setErrors(p => ({ ...p, date: undefined })) }}
                  className={`w-full pl-9 pr-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                    bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                    ${errors.date ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                />
              </div>
            </Field>

            {/* Spacer */}
            <div />

            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {classId && date
            ? `${CLASSES.find(c => c.id === classId)?.label} · ${formatDateDisplay(date)}`
            : 'Select Class & Date'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {shown && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        classId={classId} setClassId={setClassId}
        date={date} setDate={setDate}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {shown && !loading && (
        <>
          {/* Context Banner */}
          <div className="rounded-2xl border border-emerald-100 dark:border-[rgba(52,211,153,0.2)] bg-gradient-to-r from-emerald-50 via-white to-teal-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                  <School2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </span>
                <div>
                  <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100">{shownLabel.class}</p>
                  <p className="text-[12px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3" />{shownLabel.date}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 sm:ml-auto flex-wrap">
                <StatBadge icon={BookOpen}   label="Subjects"   value={uploadRows.length}  color="blue"    />
                <StatBadge icon={ClipboardList} label="Existing" value={existingHw.length}  color="emerald" />
                <StatBadge icon={Edit3}      label="Filled"     value={filledCount}         color="amber"   />
              </div>
            </div>
          </div>

          {/* ── EXISTING HOMEWORK PANEL ───────────────────────────────────── */}
          {hasExisting && (
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-blue-50/40 dark:bg-blue-500/[0.04]">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Eye className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Existing Homework</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {existingHw.length} record{existingHw.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Info bar */}
              <div className="flex items-center gap-2 px-5 py-2 bg-blue-50/20 dark:bg-blue-500/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <p className="text-[12px] text-blue-700 dark:text-blue-400">
                  These records are already saved. Use the upload section below to edit or add homework.
                </p>
              </div>

              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Subject', 'Homework Description', 'File', 'Action'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-left first:text-center first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {existingHw.map((row, i) => (
                      <ExistingHwRow
                        key={row.homeworkid}
                        row={row}
                        idx={i + 1}
                        onDelete={handleDeleteClick}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden p-4 space-y-3">
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />Tap a card to view details and delete.
                </p>
                {existingHw.map(row => (
                  <ExistingHwCard key={row.homeworkid} row={row} onDelete={handleDeleteClick} />
                ))}
              </div>
            </div>
          )}

          {/* ── UPLOAD / UPDATE HOMEWORK PANEL ────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-emerald-50/40 dark:bg-emerald-500/[0.04]">
              <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
              <Upload className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Upload / Update Homework</span>
              {filledCount > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  {filledCount} filled
                </span>
              )}
            </div>

            {/* Info bar */}
            <div className="flex items-center gap-2 px-5 py-2 bg-emerald-50/20 dark:bg-emerald-500/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
              <Info className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <p className="text-[12px] text-emerald-700 dark:text-emerald-400">
                Fill description and/or upload a file for each subject. Empty rows will be skipped.
              </p>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Subject', 'Homework Description', 'Upload File'].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-left first:text-center first:w-12">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {uploadRows.map((row, i) => (
                    <UploadHwRow
                      key={row.subject_id}
                      row={row}
                      idx={i + 1}
                      onChange={handleRowChange}
                      onFileChange={handleFileChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {uploadRows.map(row => (
                <UploadHwCard
                  key={row.subject_id}
                  row={row}
                  onChange={handleRowChange}
                  onFileChange={handleFileChange}
                />
              ))}
            </div>

            {/* Footer / Submit */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Subjects: <span className="font-semibold text-slate-600 dark:text-slate-300">{uploadRows.length}</span>
                {' '}· Filled: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{filledCount}</span>
              </p>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                  transition-all active:scale-95 disabled:opacity-70 w-full sm:w-auto"
              >
                {submitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />}
                {submitting ? 'Submitting…' : 'Submit Homework'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FolderOpen className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No homework loaded</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a class and date, then click <strong>Show</strong> to view and manage homework.
            </p>
          </div>
        </div>
      )}

      {/* ── Delete Modal ─────────────────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          subject={deleteTarget.Subject}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
