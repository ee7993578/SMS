/**
 * UploadMarks.jsx
 * Folder: src/pages/ExamMaster/UploadMarks.jsx
 *
 * Converts legacy ASPX "Upload Marks" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session & Class dropdown filters
 *  - .txt file upload with drag-and-drop
 *  - Save Data + Export Excel buttons
 *  - GridView → responsive table (desktop) / cards (mobile)
 *  - Loading states, toast notifications, empty states
 *  - Mobile drawer for filters
 *  - Row-level color coding by result status
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Upload, FileText, Save, FileSpreadsheet,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, RefreshCw, Eye,
  BookOpen, GraduationCap, BarChart3,
  Info, Search, Filter, TrendingUp,
  School2, Users, Award, ClipboardList,
  CheckCircle2, XCircle, MinusCircle,
  CloudUpload, FilePlus2, ChevronRight,
  Hash, User, Star
} from 'lucide-react'

// ─── STATIC DUMMY DATA ────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']
const CLASSES = [
  { value: '10', label: 'Class 10th' },
  { value: '12', label: 'Class 12th' },
]

// Dummy marks data per session+class
const MARKS_DATA = {
  '2024-25_10': [
    { roll: '1001', name: 'Aarav Sharma',     hindi: 78, english: 82, math: 91, science: 88, social: 75, total: 414, percent: 82.8, grade: 'A', status: 'Pass' },
    { roll: '1002', name: 'Priya Singh',      hindi: 85, english: 79, math: 76, science: 80, social: 83, total: 403, percent: 80.6, grade: 'A', status: 'Pass' },
    { roll: '1003', name: 'Rohan Verma',      hindi: 65, english: 58, math: 45, science: 52, social: 61, total: 281, percent: 56.2, grade: 'C', status: 'Pass' },
    { roll: '1004', name: 'Sneha Gupta',      hindi: 92, english: 95, math: 98, science: 94, social: 90, total: 469, percent: 93.8, grade: 'A+', status: 'Pass' },
    { roll: '1005', name: 'Vikram Patel',     hindi: 40, english: 35, math: 28, science: 42, social: 38, total: 183, percent: 36.6, grade: 'F', status: 'Fail' },
    { roll: '1006', name: 'Ananya Yadav',     hindi: 70, english: 74, math: 68, science: 72, social: 69, total: 353, percent: 70.6, grade: 'B', status: 'Pass' },
    { roll: '1007', name: 'Rahul Mishra',     hindi: 55, english: 48, math: 60, science: 55, social: 50, total: 268, percent: 53.6, grade: 'C', status: 'Pass' },
    { roll: '1008', name: 'Kavya Joshi',      hindi: 88, english: 91, math: 84, science: 87, social: 86, total: 436, percent: 87.2, grade: 'A', status: 'Pass' },
    { roll: '1009', name: 'Arjun Tiwari',     hindi: 33, english: 40, math: 25, science: 38, social: 30, total: 166, percent: 33.2, grade: 'F', status: 'Fail' },
    { roll: '1010', name: 'Ishaan Dubey',     hindi: 76, english: 70, math: 82, science: 78, social: 74, total: 380, percent: 76.0, grade: 'B', status: 'Pass' },
  ],
  '2024-25_12': [
    { roll: '1201', name: 'Divya Agarwal',    hindi: 82, english: 88, math: 90, science: 85, social: 79, total: 424, percent: 84.8, grade: 'A', status: 'Pass' },
    { roll: '1202', name: 'Manish Kumar',     hindi: 60, english: 55, math: 48, science: 58, social: 62, total: 283, percent: 56.6, grade: 'C', status: 'Pass' },
    { roll: '1203', name: 'Neha Pandey',      hindi: 95, english: 92, math: 97, science: 96, social: 93, total: 473, percent: 94.6, grade: 'A+', status: 'Pass' },
    { roll: '1204', name: 'Suresh Chauhan',   hindi: 42, english: 38, math: 30, science: 44, social: 40, total: 194, percent: 38.8, grade: 'F', status: 'Fail' },
    { roll: '1205', name: 'Pooja Rana',       hindi: 74, english: 78, math: 70, science: 76, social: 72, total: 370, percent: 74.0, grade: 'B', status: 'Pass' },
    { roll: '1206', name: 'Amit Srivastava',  hindi: 86, english: 84, math: 88, science: 82, social: 80, total: 420, percent: 84.0, grade: 'A', status: 'Pass' },
    { roll: '1207', name: 'Riya Thakur',      hindi: 65, english: 60, math: 72, science: 68, social: 64, total: 329, percent: 65.8, grade: 'B', status: 'Pass' },
    { roll: '1208', name: 'Nikhil Bajpai',    hindi: 50, english: 45, math: 38, science: 48, social: 52, total: 233, percent: 46.6, grade: 'C', status: 'Pass' },
  ],
  '2025-26_10': [
    { roll: '2001', name: 'Tanvi Mehta',      hindi: 80, english: 84, math: 92, science: 88, social: 77, total: 421, percent: 84.2, grade: 'A', status: 'Pass' },
    { roll: '2002', name: 'Harsh Saxena',     hindi: 68, english: 72, math: 65, science: 70, social: 66, total: 341, percent: 68.2, grade: 'B', status: 'Pass' },
    { roll: '2003', name: 'Aisha Khan',       hindi: 93, english: 96, math: 99, science: 95, social: 91, total: 474, percent: 94.8, grade: 'A+', status: 'Pass' },
    { roll: '2004', name: 'Dev Bhatia',       hindi: 38, english: 42, math: 30, science: 40, social: 35, total: 185, percent: 37.0, grade: 'F', status: 'Fail' },
    { roll: '2005', name: 'Simran Kapoor',    hindi: 77, english: 75, math: 80, science: 79, social: 73, total: 384, percent: 76.8, grade: 'B', status: 'Pass' },
    { roll: '2006', name: 'Yash Trivedi',     hindi: 58, english: 52, math: 46, science: 55, social: 60, total: 271, percent: 54.2, grade: 'C', status: 'Pass' },
  ],
  '2025-26_12': [
    { roll: '2201', name: 'Shruti Nair',      hindi: 89, english: 91, math: 87, science: 90, social: 85, total: 442, percent: 88.4, grade: 'A', status: 'Pass' },
    { roll: '2202', name: 'Karan Malhotra',   hindi: 72, english: 68, math: 75, science: 70, social: 69, total: 354, percent: 70.8, grade: 'B', status: 'Pass' },
    { roll: '2203', name: 'Preethi Iyer',     hindi: 45, english: 40, math: 35, science: 42, social: 44, total: 206, percent: 41.2, grade: 'F', status: 'Fail' },
    { roll: '2204', name: 'Abhishek Roy',     hindi: 84, english: 86, math: 90, science: 88, social: 83, total: 431, percent: 86.2, grade: 'A', status: 'Pass' },
    { roll: '2205', name: 'Pallavi Desai',    hindi: 62, english: 58, math: 55, science: 60, social: 64, total: 299, percent: 59.8, grade: 'C', status: 'Pass' },
  ],
}

// Subject columns
const SUBJECTS = ['hindi', 'english', 'math', 'science', 'social']
const SUBJECT_LABELS = { hindi: 'Hindi', english: 'English', math: 'Math', science: 'Science', social: 'Social' }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const gradeColor = (grade) => {
  if (grade === 'A+') return { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400' }
  if (grade === 'A')  return { bg: 'bg-blue-100 dark:bg-blue-500/15',     text: 'text-blue-700 dark:text-blue-400' }
  if (grade === 'B')  return { bg: 'bg-cyan-100 dark:bg-cyan-500/15',      text: 'text-cyan-700 dark:text-cyan-400' }
  if (grade === 'C')  return { bg: 'bg-amber-100 dark:bg-amber-500/15',    text: 'text-amber-700 dark:text-amber-400' }
  return { bg: 'bg-rose-100 dark:bg-rose-500/15', text: 'text-rose-700 dark:text-rose-400' }
}

const statusColor = (status) =>
  status === 'Pass'
    ? { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2 }
    : { bg: 'bg-rose-100 dark:bg-rose-500/15',       text: 'text-rose-700 dark:text-rose-400',       icon: XCircle }

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────
function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
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

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── DRAG & DROP FILE UPLOAD ──────────────────────────────────────────────────
function FileUploadZone({ file, onFile, error }) {
  const inputRef = useRef()
  const [dragging, setDragging] = useState(false)

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  const handleChange = (e) => {
    const f = e.target.files[0]
    if (f) onFile(f)
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".txt"
        className="hidden"
        onChange={handleChange}
      />
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
          cursor-pointer transition-all duration-200 py-5 px-4 text-center select-none
          ${dragging
            ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10'
            : error
              ? 'border-rose-300 bg-rose-50/40 dark:bg-rose-500/5'
              : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-slate-50/50 dark:bg-[#1e2238] hover:border-blue-300 hover:bg-blue-50/40 dark:hover:bg-blue-500/5'
          }`}
      >
        {file ? (
          <>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 truncate max-w-[200px]">{file.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onFile(null) }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center hover:bg-rose-200 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : (
          <>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dragging ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <CloudUpload className={`w-5 h-5 ${dragging ? 'text-blue-500' : 'text-slate-400'}`} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">
                {dragging ? 'Drop file here' : 'Click or drag & drop'}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">Only .txt files accepted</p>
            </div>
          </>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-3 py-3 text-center text-[11px] text-blue-400">—</td>
        <td className="px-3 py-3 text-[12px] font-bold text-blue-700 dark:text-blue-300" colSpan={2}>
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Grand Total
          </div>
        </td>
        {SUBJECTS.map(s => (
          <td key={s} className="px-3 py-3 text-center text-[12px] font-bold text-slate-500">—</td>
        ))}
        <td className="px-3 py-3 text-center">
          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
            {row.totalMarks}
          </span>
        </td>
        <td className="px-3 py-3 text-center text-[12px] font-bold text-slate-500">—</td>
        <td className="px-3 py-3 text-center text-[12px] font-bold text-slate-500">—</td>
        <td className="px-3 py-3 text-center">
          <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
            {row.passCount} Pass / {row.failCount} Fail
          </span>
        </td>
      </tr>
    )
  }

  const { bg: grBg, text: grText } = gradeColor(row.grade)
  const { bg: stBg, text: stText, icon: StatusIcon } = statusColor(row.status)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>
      <td className="px-3 py-3 text-[12px] font-bold text-slate-600 dark:text-slate-400 tabular-nums">{row.roll}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {row.name.charAt(0)}
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>
      {SUBJECTS.map(s => (
        <td key={s} className="px-3 py-3 text-center">
          <span className={`text-[12px] font-semibold tabular-nums ${row[s] < 33 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'}`}>
            {row[s]}
          </span>
        </td>
      ))}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
          {row.total}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">{row.percent}%</span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className={`inline-flex items-center justify-center w-8 h-7 rounded-lg text-[11px] font-bold ${grBg} ${grText}`}>
          {row.grade}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${stBg} ${stText}`}>
          <StatusIcon className="w-3 h-3" />{row.status}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { bg: grBg, text: grText } = gradeColor(row.grade)
  const { bg: stBg, text: stText, icon: StatusIcon } = statusColor(row.status)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[12px] font-bold flex-shrink-0">
          {row.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.name}</p>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">#{row.roll}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Total: <span className="font-semibold text-slate-600 dark:text-slate-300">{row.total}</span>
            &nbsp;·&nbsp;
            <span className="font-semibold text-slate-600 dark:text-slate-300">{row.percent}%</span>
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${stBg} ${stText}`}>
            <StatusIcon className="w-3 h-3" />{row.status}
          </span>
          <span className={`inline-flex items-center justify-center w-7 h-6 rounded-md text-[10px] font-bold ${grBg} ${grText}`}>
            {row.grade}
          </span>
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {/* Subject score pills (always visible) */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        {SUBJECTS.map(s => (
          <span
            key={s}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold
              ${row[s] < 33
                ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
              }`}
          >
            {SUBJECT_LABELS[s]}: <span className="font-bold">{row[s]}</span>
          </span>
        ))}
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Subject breakdown */}
          <div className="space-y-2">
            {SUBJECTS.map(s => {
              const pct = Math.min(100, Math.round((row[s] / 100) * 100))
              return (
                <div key={s}>
                  <div className="flex justify-between text-[11px] font-semibold mb-1">
                    <span className="text-slate-500 dark:text-slate-400">{SUBJECT_LABELS[s]}</span>
                    <span className={row[s] < 33 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>{row[s]}/100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${row[s] < 33 ? 'bg-rose-500' : row[s] >= 75 ? 'bg-emerald-500' : 'bg-blue-500'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Summary row */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 p-2.5 text-center">
              <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{row.total}</p>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">Total Marks</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 p-2.5 text-center">
              <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{row.percent}%</p>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">Percentage</p>
            </div>
            <div className={`rounded-xl border p-2.5 text-center ${grBg} border-transparent`}>
              <p className={`text-[18px] font-bold tabular-nums ${grText}`}>{row.grade}</p>
              <p className={`text-[9px] font-bold uppercase tracking-wide mt-0.5 ${grText} opacity-80`}>Grade</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, classVal, setClassVal, file, setFile, onSave, onExcel, saving, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-6 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Upload Marks</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Class" error={errors.classVal} required>
            <NativeSelect value={classVal} onChange={e => setClassVal(e.target.value)} placeholder="-- Select Class --" error={errors.classVal}>
              {CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Upload Marks File (.txt)" error={errors.file}>
            <FileUploadZone file={file} onFile={setFile} error={errors.file} />
          </Field>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex flex-col gap-2 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
          <button
            type="button"
            onClick={() => { onSave(); onClose() }}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Data
          </button>
          <button
            type="button"
            onClick={() => { onExcel(); onClose() }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
              bg-emerald-600 hover:bg-emerald-700 text-white transition-all"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Export Excel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UploadMarks() {
  const [session,     setSession]     = useState('')
  const [classVal,    setClassVal]    = useState('')
  const [file,        setFile]        = useState(null)
  const [rows,        setRows]        = useState([])
  const [saving,      setSaving]      = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownLabel,  setShownLabel]  = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!session)  err.session  = 'Please select a session'
    if (!classVal) err.classVal = 'Please select a class'
    if (!file)     err.file     = 'Please upload a marks file (.txt)'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Save Data ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!validate()) return
    setSaving(true)
    setSearch('')

    setTimeout(() => {
      const key = `${session}_${classVal}`
      const data = MARKS_DATA[key] || []
      const classLabel = CLASSES.find(c => c.value === classVal)?.label || `Class ${classVal}`
      setRows(data)
      setShownLabel(`${classLabel} · Session ${session}`)
      setShown(true)
      setSaving(false)
      showToast(`Data saved! Loaded ${data.length} student records.`)
    }, 800)
  }, [session, classVal, file])

  // ── Excel Export ──────────────────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Save data first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1000)
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession(''); setClassVal(''); setFile(null)
    setRows([]); setSearch(''); setErrors({})
    setShown(false); setShownLabel('')
  }

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.roll.toLowerCase().includes(q) ||
      r.grade.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary totals ────────────────────────────────────────────────────────
  const summary = useMemo(() => ({
    total:     filtered.length,
    pass:      filtered.filter(r => r.status === 'Pass').length,
    fail:      filtered.filter(r => r.status === 'Fail').length,
    aPlus:     filtered.filter(r => r.grade === 'A+').length,
    totalMarks: filtered.reduce((s, r) => s + r.total, 0),
    passCount:  filtered.filter(r => r.status === 'Pass').length,
    failCount:  filtered.filter(r => r.status === 'Fail').length,
  }), [filtered])

  const hasData   = shown && rows.length > 0
  const activeFilters = [session, classVal, file].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Upload Marks
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Upload student marks from a .txt file and save to the database.
          </p>
        </div>
        {hasData && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Upload className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Upload Marks</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Session */}
            <Field label="Select Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Select Class" error={errors.classVal} required>
              <NativeSelect
                value={classVal}
                onChange={e => { setClassVal(e.target.value); setErrors(p => ({ ...p, classVal: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.classVal}
              >
                {CLASSES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </NativeSelect>
            </Field>

            {/* File Upload */}
            <Field label="Upload Marks File (.txt)" error={errors.file}>
              <FileUploadZone
                file={file}
                onFile={(f) => { setFile(f); setErrors(p => ({ ...p, file: undefined })) }}
                error={errors.file}
              />
            </Field>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Data
            </button>

            <button
              type="button"
              onClick={handleExcel}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all active:scale-95 disabled:opacity-70"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              Excel
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <CloudUpload className="w-4 h-4" />
          Upload Marks
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasData && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasData && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        classVal={classVal}
        setClassVal={setClassVal}
        file={file}
        setFile={setFile}
        onSave={handleSave}
        onExcel={handleExcel}
        saving={saving}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {saving && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {hasData && !saving && (
        <>
          {/* Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}       label="Total Students"  value={summary.total}  color="blue"    />
            <SummaryCard icon={CheckCircle2} label="Passed"         value={summary.pass}   color="emerald" />
            <SummaryCard icon={XCircle}     label="Failed"          value={summary.fail}   color="rose"    />
            <SummaryCard icon={Star}        label="A+ Grades"       value={summary.aPlus}  color="amber"   />
          </div>

          {/* Context label */}
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/[0.07] border border-blue-100 dark:border-blue-500/20">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
            <p className="text-[13px] font-semibold text-blue-700 dark:text-blue-400">{shownLabel}</p>
            <span className="ml-auto text-[11px] text-blue-500 dark:text-blue-400">{rows.length} records loaded</span>
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header + Search */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Marks</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, roll, grade…"
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

            {/* Column legend (desktop) */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Marks are out of 100 per subject. <span className="text-rose-500">Red</span> = below passing (33). Total = sum of 5 subjects (max 500).
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
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
                      {['#', 'Roll No', 'Student Name', 'Hindi', 'English', 'Math', 'Science', 'Social', 'Total', '%', 'Grade', 'Status'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.roll} row={row} idx={i + 1} />
                    ))}
                    {/* Grand Total */}
                    <DesktopRow row={summary} idx={0} isTotal />
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
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
                    Tap a card to see subject-wise breakdown.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={row.roll} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{summary.total}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{summary.pass}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Passed</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{summary.fail}</p>
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Failed</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{summary.aPlus}</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">A+ Grade</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ────────────────────────────────────────────────────── */}
      {!hasData && !saving && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FilePlus2 className="w-8 h-8 opacity-50" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">No marks uploaded yet</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1.5 leading-relaxed">
              Select a session, choose a class, upload a .txt marks file, and click <strong className="text-slate-600 dark:text-slate-300">Save Data</strong> to view results.
            </p>
          </div>
          {/* Quick guide */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            {[
              { step: '1', label: 'Select Session', icon: BookOpen },
              { step: '2', label: 'Choose Class', icon: School2 },
              { step: '3', label: 'Upload .txt File', icon: CloudUpload },
              { step: '4', label: 'Save & View', icon: Eye },
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.15)] shadow-sm">
                <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                  {step}
                </span>
                <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 whitespace-nowrap">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
