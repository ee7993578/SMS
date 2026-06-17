/**
 * ShowAssignment.jsx
 * Folder: src/pages/Student/Assignment/ShowAssignment.jsx
 *
 * Converts legacy ASPX "show_Assignment.aspx" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Assignment Title, File (View button)
 * Features:
 *  - Class / Subject / Session filter
 *  - Show button + file preview (inline panel or modal)
 *  - Mobile: card-based layout with expandable file viewer
 *  - Desktop: dense ERP-style table
 *  - Empty / loading / error states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check,
  Loader2, ChevronDown, SlidersHorizontal, Search,
  FileText, BookOpen, School2, Download, ExternalLink,
  ClipboardList, Info, ChevronRight, File,
  Calendar, Tag, BookMarked, ChevronUp,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SUBJECTS_BY_CLASS = {
  'Nursery': ['English', 'Drawing', 'EVS'],
  'LKG':     ['English', 'Hindi', 'Drawing', 'EVS'],
  'UKG':     ['English', 'Hindi', 'Maths', 'Drawing'],
  'Class I': ['English', 'Hindi', 'Maths', 'EVS'],
  'Class II':['English', 'Hindi', 'Maths', 'EVS'],
  'Class III':['English', 'Hindi', 'Maths', 'Science', 'Social Science'],
  'Class IV': ['English', 'Hindi', 'Maths', 'Science', 'Social Science'],
  'Class V':  ['English', 'Hindi', 'Maths', 'Science', 'Social Science'],
  'Class VI': ['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  'Class VII':['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  'Class VIII':['English', 'Hindi', 'Maths', 'Science', 'Social Science', 'Sanskrit'],
  'Class IX': ['English', 'Hindi', 'Maths', 'Science', 'Social Science'],
  'Class X':  ['English', 'Hindi', 'Maths', 'Science', 'Social Science'],
  'Class XI': ['English', 'Physics', 'Chemistry', 'Maths', 'Biology', 'Computer Science'],
  'Class XII':['English', 'Physics', 'Chemistry', 'Maths', 'Biology', 'Computer Science'],
}

const ASSIGNMENT_DATA = {
  'Class IX': {
    'Science': {
      '2024-25': [
        {
          id: 1,
          title: 'Chapter 1 – Matter in Our Surroundings',
          description: 'Complete Q&A from Chapter 1 and draw labeled diagrams of states of matter.',
          subject: 'Science',
          class: 'Class IX',
          section: 'A',
          assignedDate: '2024-04-10',
          dueDate: '2024-04-18',
          fileType: 'pdf',
          fileName: 'science_ch1_matter.pdf',
          filePath: '/assignments/sci_ch1.pdf',
        },
        {
          id: 2,
          title: 'Chapter 2 – Is Matter Around Us Pure?',
          description: 'Write short notes on mixtures and compounds. Solve numericals from NCERT.',
          subject: 'Science',
          class: 'Class IX',
          section: 'A',
          assignedDate: '2024-04-22',
          dueDate: '2024-04-30',
          fileType: 'docx',
          fileName: 'science_ch2_pure_matter.docx',
          filePath: '/assignments/sci_ch2.docx',
        },
        {
          id: 3,
          title: 'Chapter 3 – Atoms and Molecules',
          description: 'Complete all exercises including in-text questions for Chapter 3.',
          subject: 'Science',
          class: 'Class IX',
          section: 'B',
          assignedDate: '2024-05-05',
          dueDate: '2024-05-14',
          fileType: 'pdf',
          fileName: 'science_ch3_atoms.pdf',
          filePath: '/assignments/sci_ch3.pdf',
        },
        {
          id: 4,
          title: 'Lab Report – Separation of Mixtures',
          description: 'Prepare a detailed lab report on the experiment performed in class.',
          subject: 'Science',
          class: 'Class IX',
          section: 'A',
          assignedDate: '2024-05-15',
          dueDate: '2024-05-22',
          fileType: 'pdf',
          fileName: 'lab_report_sep.pdf',
          filePath: '/assignments/lab_sep.pdf',
        },
      ],
      '2025-26': [
        {
          id: 5,
          title: 'Motion – Numericals Practice',
          description: 'Solve all numericals from the Motion chapter. Show all steps clearly.',
          subject: 'Science',
          class: 'Class IX',
          section: 'A',
          assignedDate: '2025-04-08',
          dueDate: '2025-04-16',
          fileType: 'pdf',
          fileName: 'motion_numericals.pdf',
          filePath: '/assignments/motion_num.pdf',
        },
        {
          id: 6,
          title: 'Force and Laws of Motion – Summary',
          description: 'Write a chapter summary and derive all three laws with real-life examples.',
          subject: 'Science',
          class: 'Class IX',
          section: 'B',
          assignedDate: '2025-04-20',
          dueDate: '2025-04-28',
          fileType: 'docx',
          fileName: 'force_laws.docx',
          filePath: '/assignments/force_laws.docx',
        },
      ],
    },
    'Maths': {
      '2024-25': [
        {
          id: 7,
          title: 'Number Systems – Exercise 1.1 & 1.2',
          description: 'Complete Exercise 1.1 and 1.2 from NCERT. Show all working.',
          subject: 'Maths',
          class: 'Class IX',
          section: 'A',
          assignedDate: '2024-04-12',
          dueDate: '2024-04-20',
          fileType: 'pdf',
          fileName: 'maths_number_system.pdf',
          filePath: '/assignments/maths_ns.pdf',
        },
        {
          id: 8,
          title: 'Polynomials – Practice Sheet',
          description: 'Solve the attached practice sheet on polynomials.',
          subject: 'Maths',
          class: 'Class IX',
          section: 'A',
          assignedDate: '2024-04-28',
          dueDate: '2024-05-06',
          fileType: 'pdf',
          fileName: 'polynomials_sheet.pdf',
          filePath: '/assignments/poly_sheet.pdf',
        },
      ],
      '2025-26': [
        {
          id: 9,
          title: 'Coordinate Geometry – Graph Work',
          description: 'Plot the given points and find distances using the distance formula.',
          subject: 'Maths',
          class: 'Class IX',
          section: 'A',
          assignedDate: '2025-04-10',
          dueDate: '2025-04-18',
          fileType: 'pdf',
          fileName: 'coord_geometry.pdf',
          filePath: '/assignments/coord_geo.pdf',
        },
      ],
    },
    'English': {
      '2025-26': [
        {
          id: 10,
          title: 'Beehive – Chapter 1 Comprehension',
          description: 'Answer all comprehension questions from Chapter 1 of Beehive.',
          subject: 'English',
          class: 'Class IX',
          section: 'A',
          assignedDate: '2025-04-05',
          dueDate: '2025-04-13',
          fileType: 'docx',
          fileName: 'beehive_ch1.docx',
          filePath: '/assignments/beehive_ch1.docx',
        },
        {
          id: 11,
          title: 'Letter Writing Practice',
          description: 'Write 5 formal letters on the given topics. Follow proper format.',
          subject: 'English',
          class: 'Class IX',
          section: 'B',
          assignedDate: '2025-04-20',
          dueDate: '2025-04-28',
          fileType: 'pdf',
          fileName: 'letter_writing.pdf',
          filePath: '/assignments/letter_writing.pdf',
        },
      ],
    },
  },
  'Class X': {
    'Maths': {
      '2025-26': [
        {
          id: 12,
          title: 'Real Numbers – Exercise 1.1',
          description: 'Complete all questions of Exercise 1.1. State Euclid\'s theorem clearly.',
          subject: 'Maths',
          class: 'Class X',
          section: 'A',
          assignedDate: '2025-04-07',
          dueDate: '2025-04-15',
          fileType: 'pdf',
          fileName: 'real_numbers.pdf',
          filePath: '/assignments/real_numbers.pdf',
        },
      ],
      '2024-25': [
        {
          id: 13,
          title: 'Quadratic Equations – Full Exercise',
          description: 'Solve all exercises of Chapter 4. Show discriminant method clearly.',
          subject: 'Maths',
          class: 'Class X',
          section: 'A',
          assignedDate: '2024-04-15',
          dueDate: '2024-04-23',
          fileType: 'pdf',
          fileName: 'quad_eq.pdf',
          filePath: '/assignments/quad_eq.pdf',
        },
      ],
    },
  },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const FILE_TYPE_CONFIG = {
  pdf:  { color: '#dc2626', bg: '#fee2e2', label: 'PDF'  },
  docx: { color: '#2563eb', bg: '#dbeafe', label: 'DOCX' },
  pptx: { color: '#d97706', bg: '#fef3c7', label: 'PPTX' },
  xlsx: { color: '#059669', bg: '#d1fae5', label: 'XLSX' },
  img:  { color: '#7c3aed', bg: '#ede9fe', label: 'IMG'  },
}

const getFileConfig = (type) => FILE_TYPE_CONFIG[type] || FILE_TYPE_CONFIG.pdf

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const isDueSoon = (dueDate) => {
  const diff = (new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24)
  return diff >= 0 && diff <= 3
}

const isOverdue = (dueDate) => new Date(dueDate) < new Date()

// Flatten nested data structure for a given class/subject/session
const getAssignments = (cls, subject, session) => {
  try {
    return ASSIGNMENT_DATA?.[cls]?.[subject]?.[session] || []
  } catch {
    return []
  }
}

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

// ─── FILE TYPE BADGE ─────────────────────────────────────────────────────────

function FileBadge({ type, size = 'sm' }) {
  const cfg = getFileConfig(type)
  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-md
        ${size === 'lg' ? 'px-2.5 py-1 text-[11px]' : 'px-2 py-0.5 text-[10px]'}`}
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  )
}

// ─── DUE DATE BADGE ──────────────────────────────────────────────────────────

function DueBadge({ dueDate }) {
  const overdue  = isOverdue(dueDate)
  const dueSoon  = isDueSoon(dueDate)

  if (overdue) return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-full">
      <AlertCircle className="w-3 h-3" /> Overdue
    </span>
  )
  if (dueSoon) return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full">
      <AlertCircle className="w-3 h-3" /> Due Soon
    </span>
  )
  return null
}

// ─── FILE PREVIEW MODAL ──────────────────────────────────────────────────────

function FilePreviewModal({ assignment, onClose }) {
  if (!assignment) return null
  const cfg = getFileConfig(assignment.fileType)

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto
          rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200
          dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn .22s ease' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(calc(-50% + 16px))}to{opacity:1;transform:translateY(-50%)}}`}</style>

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              <FileText className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
                {assignment.title}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {assignment.subject} · {assignment.class} · Sec {assignment.section}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex-shrink-0 ml-3"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Area */}
        <div className="p-5 space-y-4">
          {/* File Preview Placeholder */}
          <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-8 flex flex-col items-center gap-3 bg-slate-50/50 dark:bg-white/[0.02]">
            <span
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: cfg.bg }}
            >
              <File className="w-7 h-7" style={{ color: cfg.color }} />
            </span>
            <div className="text-center">
              <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{assignment.fileName}</p>
              <p className="text-[12px] text-slate-400 mt-1">
                Preview will open when API is connected.
              </p>
            </div>
            <FileBadge type={assignment.fileType} size="lg" />
          </div>

          {/* Assignment Details */}
          <div className="space-y-2.5">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
              <ClipboardList className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Description</p>
                <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">{assignment.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                <Calendar className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Assigned</p>
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{formatDate(assignment.assignedDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                <Calendar className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Due Date</p>
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{formatDate(assignment.dueDate)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              Close
            </button>
            <a
              href={assignment.filePath}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 shadow-md shadow-blue-500/20"
              onClick={(e) => e.preventDefault()}
            >
              <Download className="w-4 h-4" /> Download
            </a>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx, onView }) {
  const cfg = getFileConfig(row.fileType)
  const overdue = isOverdue(row.dueDate)
  const dueSoon = isDueSoon(row.dueDate)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Assignment Title */}
      <td className="px-4 py-3">
        <div className="flex items-start gap-3">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-0.5"
            style={{ background: cfg.bg }}
          >
            <FileText className="w-4 h-4" style={{ color: cfg.color }} />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">
              {row.title}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
              {row.description}
            </p>
          </div>
        </div>
      </td>

      {/* Subject / Section */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
            <Tag className="w-3 h-3 text-blue-400" /> {row.subject}
          </span>
          <span className="text-[11px] text-slate-400">Sec {row.section}</span>
        </div>
      </td>

      {/* Assigned */}
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">
          {formatDate(row.assignedDate)}
        </span>
      </td>

      {/* Due Date */}
      <td className="px-4 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className={`text-[12px] font-semibold tabular-nums
            ${overdue ? 'text-rose-500' : dueSoon ? 'text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>
            {formatDate(row.dueDate)}
          </span>
          <DueBadge dueDate={row.dueDate} />
        </div>
      </td>

      {/* File */}
      <td className="px-4 py-3 text-center">
        <FileBadge type={row.fileType} />
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onView(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100
            dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/20
            transition-all active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" /> Show
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────

function MobileCard({ row, idx, onView }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = getFileConfig(row.fileType)
  const overdue = isOverdue(row.dueDate)
  const dueSoon = isDueSoon(row.dueDate)

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm transition-all
      ${overdue
        ? 'border-rose-200 dark:border-rose-500/20'
        : dueSoon
          ? 'border-amber-200 dark:border-amber-500/20'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'
      }`}
    >
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* File icon */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: cfg.bg }}
        >
          <FileText className="w-5 h-5" style={{ color: cfg.color }} />
        </span>

        <div className="flex-1 min-w-0 text-left">
          {/* Title */}
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-snug pr-6">
            {row.title}
          </p>
          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
            <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <Tag className="w-3 h-3 text-blue-400" /> {row.subject}
            </span>
            <span className="text-[11px] text-slate-400">Sec {row.section}</span>
            <FileBadge type={row.fileType} />
            <DueBadge dueDate={row.dueDate} />
          </div>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 flex-shrink-0 mt-1 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {/* Due date strip */}
      <div className={`flex items-center justify-between px-4 py-2 text-[11px] font-semibold border-t
        ${overdue
          ? 'border-rose-100 bg-rose-50 dark:bg-rose-500/5 dark:border-rose-500/10 text-rose-600 dark:text-rose-400'
          : dueSoon
            ? 'border-amber-100 bg-amber-50 dark:bg-amber-500/5 dark:border-amber-500/10 text-amber-600 dark:text-amber-400'
            : 'border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-slate-50/50 dark:bg-transparent text-slate-400 dark:text-slate-500'
        }`}
      >
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3" /> Assigned: {formatDate(row.assignedDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3 h-3" /> Due: {formatDate(row.dueDate)}
        </span>
      </div>

      {/* Expandable detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3"
          style={{ animation: 'expandDown .18s ease' }}
        >
          <style>{`@keyframes expandDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>

          {/* Description */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Description</p>
            <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">{row.description}</p>
          </div>

          {/* File info */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.08)] flex items-center gap-3">
            <span
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: cfg.bg }}
            >
              <File className="w-4 h-4" style={{ color: cfg.color }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-0.5">Attachment</p>
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">{row.fileName}</p>
            </div>
            <FileBadge type={row.fileType} size="lg" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onView(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 shadow-md shadow-blue-500/20"
            >
              <Eye className="w-4 h-4" /> View File
            </button>
            <button
              type="button"
              className="px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-emerald-50 text-emerald-700 hover:bg-emerald-100
                border border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400
                dark:border-emerald-500/20 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors }) {
  const subjects = filters.class ? (SUBJECTS_BY_CLASS[filters.class] || []) : []

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35]
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
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
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={filters.session}
              onChange={e => setFilters(p => ({ ...p, session: e.target.value }))}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Class" error={errors.cls} required>
            <NativeSelect
              value={filters.class}
              onChange={e => setFilters(p => ({ ...p, class: e.target.value, subject: '' }))}
              placeholder="-- Select Class --"
              error={errors.cls}
            >
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Subject" error={errors.subject} required>
            <NativeSelect
              value={filters.subject}
              onChange={e => setFilters(p => ({ ...p, subject: e.target.value }))}
              placeholder="-- Select Subject --"
              error={errors.subject}
              disabled={!filters.class}
            >
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onShow(); onClose() }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              disabled:opacity-70 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show
          </button>
        </div>
      </div>
    </>
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
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
          {typeof value === 'number' ? value : value}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ShowAssignment() {
  const [filters, setFilters] = useState({ session: '', class: '', subject: '' })
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [shown, setShown] = useState(false)
  const [shownFilters, setShownFilters] = useState({})
  const [previewAssignment, setPreviewAssignment] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const subjects = filters.class ? (SUBJECTS_BY_CLASS[filters.class] || []) : []

  // ── Validate & Fetch ──────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Select a session'
    if (!filters.class)   err.cls     = 'Select a class'
    if (!filters.subject) err.subject = 'Select a subject'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = getAssignments(filters.class, filters.subject, filters.session)
      setRows(data)
      setShownFilters({ ...filters })
      setShown(true)
      setLoading(false)
      if (data.length === 0) {
        showToast(`No assignments found for ${filters.class} – ${filters.subject} (${filters.session}).`, 'error')
      } else {
        showToast(`${data.length} assignment${data.length > 1 ? 's' : ''} loaded.`)
      }
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', class: '', subject: '' })
    setRows([]); setSearch(''); setErrors({})
    setShown(false); setShownFilters({})
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q) ||
      r.description.toLowerCase().includes(q)
    )
  }, [rows, search])

  const overdueCount = useMemo(() => filtered.filter(r => isOverdue(r.dueDate)).length, [filtered])
  const dueSoonCount = useMemo(() => filtered.filter(r => isDueSoon(r.dueDate)).length, [filtered])

  const hasResults = shown && rows.length > 0
  const activeFilterCount = [filters.session, filters.class, filters.subject].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Assignments
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View assignments by class, subject, and session.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">

            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={filters.class}
                onChange={e => { setFilters(p => ({ ...p, class: e.target.value, subject: '' })); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.cls}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Subject */}
            <Field label="Subject" error={errors.subject} required>
              <NativeSelect
                value={filters.subject}
                onChange={e => { setFilters(p => ({ ...p, subject: e.target.value })); setErrors(p => ({ ...p, subject: undefined })) }}
                placeholder="-- Select Subject --"
                error={errors.subject}
                disabled={!filters.class}
              >
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacer */}
            <div />

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
                  dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {filters.class && filters.subject
            ? `${filters.class} · ${filters.subject}`
            : 'Select Filters'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
        {hasResults && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
              style={{ opacity: 1 - i * 0.15 }}
            />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Context Header */}
          <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)]
            bg-gradient-to-r from-blue-50 via-white to-indigo-50
            dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35]
            px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm"
          >
            <BookMarked className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
                {shownFilters.class} &mdash; {shownFilters.subject}
              </p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">
                Session {shownFilters.session}
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
              <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">
                {filtered.length} assignment{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={ClipboardList} label="Total Assignments" value={filtered.length}  color="blue"    />
            <SummaryCard icon={FileText}      label="Files Attached"    value={filtered.length}  color="violet"  />
            <SummaryCard icon={AlertCircle}   label="Overdue"           value={overdueCount}     color="rose"    />
            <SummaryCard icon={Calendar}      label="Due Soon (3 days)" value={dueSoonCount}     color="amber"   />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5
              border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
              bg-slate-50/70 dark:bg-white/[0.02]"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                  Assignment List
                </span>
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
                  placeholder="Search title, subject…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400"
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

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Click <strong>Show</strong> to preview or download any assignment file.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No assignments match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Assignment Title', 'Subject / Sec', 'Assigned On', 'Due Date', 'Type', 'Action'].map((h, i) => (
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
                        key={row.id}
                        row={row}
                        idx={i + 1}
                        onView={setPreviewAssignment}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No assignments match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to expand details and view the file.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard
                      key={row.id}
                      row={row}
                      idx={i + 1}
                      onView={setPreviewAssignment}
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
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span>
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
        </>
      )}

      {/* ── Empty state (after show, no data) ────────────────────────────── */}
      {shown && rows.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 text-slate-300 dark:text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
              No assignments found
            </p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              No assignments for{' '}
              <strong>{shownFilters.class} – {shownFilters.subject}</strong> in{' '}
              <strong>{shownFilters.session}</strong>.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400
              border border-blue-100 dark:border-blue-500/20 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Different Filters
          </button>
        </div>
      )}

      {/* ── Initial empty state ───────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
              No report generated yet
            </p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session, class, and subject, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── File Preview Modal ────────────────────────────────────────────── */}
      {previewAssignment && (
        <FilePreviewModal
          assignment={previewAssignment}
          onClose={() => setPreviewAssignment(null)}
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
