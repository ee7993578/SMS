/**
 * DefineMaxMin.jsx
 * Folder: src/pages/ExamMaster/DefineMaxMin.jsx
 *
 * Converts legacy ASPX "Define Max/Min/Date of Exam" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class / Section / Term dropdowns
 *  - Show button to load subject-exam grid
 *  - Per-exam: Marks / Grade / Grade+Marks radio toggle
 *  - Max Marks, Min Marks, Exam Date inputs per exam per subject
 *  - Save with success toast/modal
 *  - Mobile: stacked accordion cards per subject
 *  - Desktop: dense nested grid table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  ChevronRight, SlidersHorizontal,
  BookOpen, Calendar, Save,
  School2, ClipboardList, Hash,
  GraduationCap, BarChart2, Star,
  Info, Layers, CheckCircle2,
  FileText, Settings2
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const CLASSES = [
  { id: '1',  label: 'Nursery'   },
  { id: '2',  label: 'LKG'       },
  { id: '3',  label: 'UKG'       },
  { id: '4',  label: 'Class I'   },
  { id: '5',  label: 'Class II'  },
  { id: '6',  label: 'Class III' },
  { id: '7',  label: 'Class IV'  },
  { id: '8',  label: 'Class V'   },
  { id: '9',  label: 'Class VI'  },
  { id: '10', label: 'Class VII' },
  { id: '11', label: 'Class VIII'},
  { id: '12', label: 'Class IX'  },
  { id: '13', label: 'Class X'   },
  { id: '14', label: 'Class XI'  },
  { id: '15', label: 'Class XII' },
]

const SECTIONS_MAP = {
  '1': [], '2': [], '3': [],
  '4':  [{ id: 'A', label: 'Section A' }, { id: 'B', label: 'Section B' }],
  '5':  [{ id: 'A', label: 'Section A' }, { id: 'B', label: 'Section B' }],
  '6':  [{ id: 'A', label: 'Section A' }],
  '7':  [{ id: 'A', label: 'Section A' }],
  '8':  [{ id: 'A', label: 'Section A' }],
  '9':  [{ id: 'A', label: 'Section A' }, { id: 'B', label: 'Section B' }],
  '10': [{ id: 'A', label: 'Section A' }],
  '11': [{ id: 'A', label: 'Section A' }],
  '12': [{ id: 'A', label: 'Section A' }, { id: 'B', label: 'Section B' }],
  '13': [{ id: 'A', label: 'Section A' }],
  '14': [{ id: 'A', label: 'Section A' }, { id: 'B', label: 'Section B' }],
  '15': [{ id: 'A', label: 'Section A' }, { id: 'B', label: 'Section B' }],
}

const TERMS = [
  { id: '1', label: 'Term 1 (April – September)' },
  { id: '2', label: 'Term 2 (October – March)'   },
  { id: '3', label: 'Annual Exam'                 },
  { id: '4', label: 'Pre-Board'                   },
]

// Dummy subject-exam data (simulates API response)
const SUBJECT_EXAM_DATA = {
  default: [
    {
      subject_id: 's1', subject: 'Mathematics',
      exams: [
        { exam_id: 'e1', exam_type_id: 'et1', exam_type: 'Unit Test 1',   max_marks: 25, min_marks: 9,  e_date: '05 Apr 2025', grade_subject: 'N' },
        { exam_id: 'e2', exam_type_id: 'et2', exam_type: 'Half Yearly',   max_marks: 80, min_marks: 27, e_date: '15 Sep 2025', grade_subject: 'N' },
        { exam_id: 'e3', exam_type_id: 'et3', exam_type: 'Unit Test 2',   max_marks: 25, min_marks: 9,  e_date: '10 Nov 2025', grade_subject: 'N' },
        { exam_id: 'e4', exam_type_id: 'et4', exam_type: 'Annual Exam',   max_marks: 80, min_marks: 27, e_date: '15 Mar 2026', grade_subject: 'N' },
      ]
    },
    {
      subject_id: 's2', subject: 'Science',
      exams: [
        { exam_id: 'e5', exam_type_id: 'et1', exam_type: 'Unit Test 1',   max_marks: 25, min_marks: 9,  e_date: '06 Apr 2025', grade_subject: 'N' },
        { exam_id: 'e6', exam_type_id: 'et2', exam_type: 'Half Yearly',   max_marks: 80, min_marks: 27, e_date: '16 Sep 2025', grade_subject: 'N' },
        { exam_id: 'e7', exam_type_id: 'et3', exam_type: 'Unit Test 2',   max_marks: 25, min_marks: 9,  e_date: '11 Nov 2025', grade_subject: 'N' },
        { exam_id: 'e8', exam_type_id: 'et4', exam_type: 'Annual Exam',   max_marks: 80, min_marks: 27, e_date: '16 Mar 2026', grade_subject: 'N' },
      ]
    },
    {
      subject_id: 's3', subject: 'English',
      exams: [
        { exam_id: 'e9',  exam_type_id: 'et1', exam_type: 'Unit Test 1', max_marks: 25, min_marks: 9,  e_date: '07 Apr 2025', grade_subject: 'N' },
        { exam_id: 'e10', exam_type_id: 'et2', exam_type: 'Half Yearly', max_marks: 80, min_marks: 27, e_date: '17 Sep 2025', grade_subject: 'N' },
        { exam_id: 'e11', exam_type_id: 'et3', exam_type: 'Unit Test 2', max_marks: 25, min_marks: 9,  e_date: '12 Nov 2025', grade_subject: 'N' },
        { exam_id: 'e12', exam_type_id: 'et4', exam_type: 'Annual Exam', max_marks: 80, min_marks: 27, e_date: '17 Mar 2026', grade_subject: 'N' },
      ]
    },
    {
      subject_id: 's4', subject: 'Hindi',
      exams: [
        { exam_id: 'e13', exam_type_id: 'et1', exam_type: 'Unit Test 1', max_marks: 25, min_marks: 9,  e_date: '08 Apr 2025', grade_subject: 'N' },
        { exam_id: 'e14', exam_type_id: 'et2', exam_type: 'Half Yearly', max_marks: 80, min_marks: 27, e_date: '18 Sep 2025', grade_subject: 'N' },
        { exam_id: 'e15', exam_type_id: 'et3', exam_type: 'Unit Test 2', max_marks: 25, min_marks: 9,  e_date: '13 Nov 2025', grade_subject: 'N' },
        { exam_id: 'e16', exam_type_id: 'et4', exam_type: 'Annual Exam', max_marks: 80, min_marks: 27, e_date: '18 Mar 2026', grade_subject: 'N' },
      ]
    },
    {
      subject_id: 's5', subject: 'Social Science',
      exams: [
        { exam_id: 'e17', exam_type_id: 'et1', exam_type: 'Unit Test 1', max_marks: 25, min_marks: 9,  e_date: '09 Apr 2025', grade_subject: 'N' },
        { exam_id: 'e18', exam_type_id: 'et2', exam_type: 'Half Yearly', max_marks: 80, min_marks: 27, e_date: '19 Sep 2025', grade_subject: 'N' },
        { exam_id: 'e19', exam_type_id: 'et3', exam_type: 'Unit Test 2', max_marks: 25, min_marks: 9,  e_date: '14 Nov 2025', grade_subject: 'N' },
        { exam_id: 'e20', exam_type_id: 'et4', exam_type: 'Annual Exam', max_marks: 80, min_marks: 27, e_date: '19 Mar 2026', grade_subject: 'N' },
      ]
    },
    {
      subject_id: 's6', subject: 'Computer Science',
      exams: [
        { exam_id: 'e21', exam_type_id: 'et1', exam_type: 'Unit Test 1', max_marks: 0,  min_marks: 0, e_date: '10 Apr 2025', grade_subject: 'Y' },
        { exam_id: 'e22', exam_type_id: 'et2', exam_type: 'Half Yearly', max_marks: 50, min_marks: 17, e_date: '20 Sep 2025', grade_subject: 'N' },
        { exam_id: 'e23', exam_type_id: 'et4', exam_type: 'Annual Exam', max_marks: 50, min_marks: 17, e_date: '20 Mar 2026', grade_subject: 'N' },
      ]
    },
    {
      subject_id: 's7', subject: 'Physical Education',
      exams: [
        { exam_id: 'e24', exam_type_id: 'et2', exam_type: 'Half Yearly', max_marks: 0,  min_marks: 0, e_date: '21 Sep 2025', grade_subject: 'Y' },
        { exam_id: 'e25', exam_type_id: 'et4', exam_type: 'Annual Exam', max_marks: 0,  min_marks: 0, e_date: '21 Mar 2026', grade_subject: 'Y' },
      ]
    },
  ]
}

// Color palette for subjects
const SUBJECT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe', light: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' },
  { fg: '#059669', bg: '#d1fae5', light: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' },
  { fg: '#7c3aed', bg: '#ede9fe', light: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400' },
  { fg: '#d97706', bg: '#fef3c7', light: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400' },
  { fg: '#0891b2', bg: '#cffafe', light: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400' },
  { fg: '#dc2626', bg: '#fee2e2', light: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' },
  { fg: '#0369a1', bg: '#e0f2fe', light: 'bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400' },
]
const subjectColor = (idx) => SUBJECT_COLORS[idx % SUBJECT_COLORS.length]
const subjectAbbr = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()

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

// Success Modal (mirrors old ASPX modal popup)
function SaveSuccessModal({ onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] w-full max-w-sm p-8 text-center"
          style={{ animation: 'popIn .3s cubic-bezier(.34,1.56,.64,1)' }}
        >
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-[17px] font-bold text-slate-800 dark:text-slate-100 mb-2">Data Saved Successfully!</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-6">
            Max/Min marks and exam dates have been updated.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[14px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95"
          >
            OK
          </button>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.85)}to{opacity:1;transform:scale(1)}}`}</style>
    </>
  )
}

// ─── MARKS TYPE TOGGLE (Marks / Grade / Grade+Marks) ─────────────────────────
const MARK_TYPES = [
  { id: 'marks',       label: 'Marks',        icon: Hash     },
  { id: 'grade',       label: 'Grade',        icon: Star     },
  { id: 'grademarks',  label: 'Grade+Marks',  icon: BarChart2},
]

function MarkTypeToggle({ value, onChange, disabled }) {
  return (
    <div className="flex rounded-lg overflow-hidden border border-slate-200 dark:border-[rgba(99,102,241,0.25)] flex-shrink-0">
      {MARK_TYPES.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          disabled={disabled}
          onClick={() => onChange(id)}
          className={`flex items-center gap-1 px-2 py-1.5 text-[10px] font-semibold transition-all leading-none whitespace-nowrap
            ${value === id
              ? 'bg-blue-600 text-white dark:bg-indigo-600'
              : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-[#1e2238] dark:text-slate-400 dark:hover:bg-white/5'}
            disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          <Icon className="w-3 h-3" />{label}
        </button>
      ))}
    </div>
  )
}

// ─── COMPACT INPUT ────────────────────────────────────────────────────────────
function CompactInput({ value, onChange, disabled, placeholder, type = 'text', error }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full px-2.5 py-1.5 text-[12px] rounded-lg border outline-none transition-all tabular-nums
        bg-white text-slate-700 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
        dark:placeholder-slate-600 dark:focus:border-indigo-400
        disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-900/30
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
    />
  )
}

// ─── DESKTOP: Subject Row with nested exam rows ───────────────────────────────
function DesktopSubjectBlock({ subject, subjectIdx, examData, onExamChange }) {
  const { fg, bg } = subjectColor(subjectIdx)
  const abbr = subjectAbbr(subject.subject)

  return (
    <>
      {/* Subject header row */}
      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-slate-50/70 dark:bg-white/[0.015]">
        <td colSpan={7} className="px-4 py-2">
          <div className="flex items-center gap-2.5">
            <span
              className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
              style={{ background: bg, color: fg }}
            >
              {abbr}
            </span>
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{subject.subject}</span>
            <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold" style={{ background: bg, color: fg }}>
              {subject.exams.length} Exam{subject.exams.length !== 1 ? 's' : ''}
            </span>
          </div>
        </td>
      </tr>
      {/* Exam rows */}
      {subject.exams.map((exam, eIdx) => {
        const key = `${subject.subject_id}_${exam.exam_id}`
        const row = examData[key] || {
          markType: exam.grade_subject === 'Y' ? 'grade' : 'marks',
          max: String(exam.max_marks),
          min: String(exam.min_marks),
          date: exam.e_date,
        }
        const isGrade = row.markType === 'grade'
        const disabled = isGrade

        return (
          <tr
            key={exam.exam_id}
            className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.05)] hover:bg-slate-50/40 dark:hover:bg-white/[0.015] transition-colors"
          >
            {/* S.No */}
            <td className="px-4 py-2.5 text-center text-[11px] text-slate-400 dark:text-slate-600 tabular-nums w-10">
              {eIdx + 1}
            </td>
            {/* Exam Type */}
            <td className="px-4 py-2.5">
              <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{exam.exam_type}</span>
            </td>
            {/* Mark Type Toggle */}
            <td className="px-3 py-2.5">
              <MarkTypeToggle
                value={row.markType}
                onChange={(val) => onExamChange(key, 'markType', val)}
              />
            </td>
            {/* Max Marks */}
            <td className="px-3 py-2.5 w-24">
              <CompactInput
                value={row.max}
                onChange={(e) => onExamChange(key, 'max', e.target.value)}
                disabled={disabled}
                placeholder="Max"
                type="number"
              />
            </td>
            {/* Min Marks */}
            <td className="px-3 py-2.5 w-24">
              <CompactInput
                value={row.min}
                onChange={(e) => onExamChange(key, 'min', e.target.value)}
                disabled={disabled}
                placeholder="Min"
                type="number"
              />
            </td>
            {/* Date */}
            <td className="px-3 py-2.5 w-40">
              <CompactInput
                value={row.date}
                onChange={(e) => onExamChange(key, 'date', e.target.value)}
                placeholder="DD MMM YYYY"
                type="date"
              />
            </td>
            {/* Status */}
            <td className="px-3 py-2.5 text-center w-16">
              {isGrade ? (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                  <Star className="w-3 h-3" />GRADE
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  <Hash className="w-3 h-3" />MARKS
                </span>
              )}
            </td>
          </tr>
        )
      })}
    </>
  )
}

// ─── MOBILE: Subject Accordion Card ──────────────────────────────────────────
function MobileSubjectCard({ subject, subjectIdx, examData, onExamChange }) {
  const [expanded, setExpanded] = useState(true) // open by default
  const { fg, bg } = subjectColor(subjectIdx)
  const abbr = subjectAbbr(subject.subject)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Subject header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {abbr}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{subject.subject}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subject.exams.length} exam{subject.exams.length !== 1 ? 's' : ''}</p>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Exam list */}
      {expanded && (
        <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
          {subject.exams.map((exam, eIdx) => {
            const key = `${subject.subject_id}_${exam.exam_id}`
            const row = examData[key] || {
              markType: exam.grade_subject === 'Y' ? 'grade' : 'marks',
              max: String(exam.max_marks),
              min: String(exam.min_marks),
              date: exam.e_date,
            }
            const isGrade = row.markType === 'grade'

            return (
              <div key={exam.exam_id} className="px-4 py-4 space-y-3">
                {/* Exam header */}
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md text-[10px] font-bold flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex-shrink-0 tabular-nums">
                      {eIdx + 1}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{exam.exam_type}</span>
                  </div>
                  {isGrade ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                      <Star className="w-3 h-3" />GRADE
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      <Hash className="w-3 h-3" />MARKS
                    </span>
                  )}
                </div>

                {/* Mark type toggle */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Result Type</p>
                  <MarkTypeToggle
                    value={row.markType}
                    onChange={(val) => onExamChange(key, 'markType', val)}
                  />
                </div>

                {/* Max / Min / Date */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Max Marks</p>
                    <CompactInput
                      value={row.max}
                      onChange={(e) => onExamChange(key, 'max', e.target.value)}
                      disabled={isGrade}
                      placeholder="Max"
                      type="number"
                    />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">Min Marks</p>
                    <CompactInput
                      value={row.min}
                      onChange={(e) => onExamChange(key, 'min', e.target.value)}
                      disabled={isGrade}
                      placeholder="Min"
                      type="number"
                    />
                  </div>
                  <div className="col-span-2">
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />Exam Date
                    </p>
                    <CompactInput
                      value={row.date}
                      onChange={(e) => onExamChange(key, 'date', e.target.value)}
                      placeholder="DD MMM YYYY"
                      type="date"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, classId, setClassId, sectionId, setSectionId, termId, setTermId, onShow, loading, errors }) {
  if (!open) return null
  const sections = SECTIONS_MAP[classId] || []

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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Class" error={errors.classId} required>
            <NativeSelect value={classId} onChange={e => { setClassId(e.target.value); setSectionId('') }} placeholder="-- Select Class --" error={errors.classId}>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </NativeSelect>
          </Field>

          {sections.length > 0 && (
            <Field label="Section" error={errors.sectionId} required>
              <NativeSelect value={sectionId} onChange={e => setSectionId(e.target.value)} placeholder="-- Select Section --" error={errors.sectionId}>
                {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </NativeSelect>
            </Field>
          )}

          <Field label="Term" error={errors.termId} required>
            <NativeSelect value={termId} onChange={e => setTermId(e.target.value)} placeholder="-- Select Term --" error={errors.termId}>
              {TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </NativeSelect>
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
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineMaxMin() {
  // Filter state
  const [classId,   setClassId]   = useState('')
  const [sectionId, setSectionId] = useState('')
  const [termId,    setTermId]    = useState('')
  const [errors,    setErrors]    = useState({})

  // UI state
  const [loading,     setLoading]     = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [shown,       setShown]       = useState(false)
  const [showModal,   setShowModal]   = useState(false)
  const [toast,       setToast]       = useState(null)

  // Data state
  const [subjects,   setSubjects]   = useState([])
  const [examData,   setExamData]   = useState({}) // { `${subject_id}_${exam_id}`: { markType, max, min, date } }
  const [shownLabel, setShownLabel] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Derived
  const sections = SECTIONS_MAP[classId] || []
  const needsSection = sections.length > 0

  // Active filter count for mobile badge
  const activeFilters = [classId, termId, needsSection ? sectionId : 'ok'].filter(Boolean).length

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const err = {}
    if (!classId)              err.classId   = 'Please select a class'
    if (needsSection && !sectionId) err.sectionId = 'Please select a section'
    if (!termId)               err.termId    = 'Please select a term'
    setErrors(err)
    return Object.keys(err).length === 0
  }, [classId, sectionId, termId, needsSection])

  // ── Show (simulate fetch) ─────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)

    setTimeout(() => {
      const data = SUBJECT_EXAM_DATA.default // API: fetch by classId, sectionId, termId
      setSubjects(data)

      // Initialize examData from API response
      const init = {}
      data.forEach(subj => {
        subj.exams.forEach(exam => {
          const key = `${subj.subject_id}_${exam.exam_id}`
          init[key] = {
            markType: exam.grade_subject === 'Y' ? 'grade' : 'marks',
            max:  String(exam.max_marks),
            min:  String(exam.min_marks),
            date: exam.e_date,
          }
        })
      })
      setExamData(init)

      const className = CLASSES.find(c => c.id === classId)?.label || ''
      const secLabel  = needsSection && sectionId ? ` – Sec ${sectionId}` : ''
      const termLabel = TERMS.find(t => t.id === termId)?.label || ''
      setShownLabel(`${className}${secLabel} · ${termLabel}`)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} subjects.`)
    }, 700)
  }, [classId, sectionId, termId, validate, needsSection])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setClassId(''); setSectionId(''); setTermId('')
    setErrors({}); setSubjects([]); setExamData({})
    setShown(false); setShownLabel('')
  }

  // ── Exam field change ─────────────────────────────────────────────────────
  const handleExamChange = useCallback((key, field, value) => {
    setExamData(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] || {}),
        [field]: value,
        // If switching to grade, clear max/min
        ...(field === 'markType' && value === 'grade' ? { max: '0', min: '0' } : {}),
        ...(field === 'markType' && value !== 'grade' && (prev[key]?.max === '0') ? { max: '', min: '' } : {}),
      }
    }))
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    // Basic validation: check required fields
    let hasError = false
    subjects.forEach(subj => {
      subj.exams.forEach(exam => {
        const key = `${subj.subject_id}_${exam.exam_id}`
        const row = examData[key]
        if (!row) return
        if (row.markType !== 'grade') {
          if (!row.max || !row.min) hasError = true
        }
      })
    })
    if (hasError) {
      showToast('Please fill Max and Min marks for all exams.', 'error')
      return
    }

    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setShowModal(true) // show success modal like old ASPX
    }, 900)
  }

  // Total exam count
  const totalExams = useMemo(() => subjects.reduce((s, sub) => s + sub.exams.length, 0), [subjects])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Max / Min / Date of Exam
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Set maximum marks, minimum passing marks and exam dates per subject.
          </p>
        </div>
        {shown && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
              dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">

            {/* Class */}
            <Field label="Class" error={errors.classId} required>
              <NativeSelect
                value={classId}
                onChange={e => { setClassId(e.target.value); setSectionId(''); setErrors(p => ({ ...p, classId: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.classId}
              >
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Section — conditional */}
            {needsSection ? (
              <Field label="Section" error={errors.sectionId} required>
                <NativeSelect
                  value={sectionId}
                  onChange={e => { setSectionId(e.target.value); setErrors(p => ({ ...p, sectionId: undefined })) }}
                  placeholder="-- Select Section --"
                  error={errors.sectionId}
                >
                  {sections.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </NativeSelect>
              </Field>
            ) : (
              <div /> // spacer when no section needed
            )}

            {/* Term */}
            <Field label="Term" error={errors.termId} required>
              <NativeSelect
                value={termId}
                onChange={e => { setTermId(e.target.value); setErrors(p => ({ ...p, termId: undefined })) }}
                placeholder="-- Select Term --"
                error={errors.termId}
              >
                {TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {classId
            ? `${CLASSES.find(c => c.id === classId)?.label}${needsSection && sectionId ? ` · Sec ${sectionId}` : ''}`
            : 'Select Filters'}
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
        sectionId={sectionId} setSectionId={setSectionId}
        termId={termId} setTermId={setTermId}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-8 w-48 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {shown && !loading && (
        <>
          {/* Summary strip */}
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-blue-50/60 dark:bg-indigo-500/[0.05] px-4 py-3">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{shownLabel}</span>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0 flex-wrap">
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-500/20 px-2.5 py-1 rounded-full">
                <BookOpen className="w-3.5 h-3.5" />{subjects.length} Subjects
              </span>
              <span className="flex items-center gap-1.5 text-[12px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-100 dark:bg-violet-500/20 px-2.5 py-1 rounded-full">
                <GraduationCap className="w-3.5 h-3.5" />{totalExams} Exams
              </span>
            </div>
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Subject-wise Exam Configuration</span>
              <div className="flex items-center gap-1.5 text-[11px] text-blue-600 dark:text-blue-400">
                <Info className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Grade-only subjects have disabled mark fields</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No', 'Exam / Test', 'Result Type', 'Max Marks', 'Min Marks', 'Exam Date', 'Status'].map((h, i) => (
                      <th key={i}
                        className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-10">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {subjects.map((subj, idx) => (
                    <DesktopSubjectBlock
                      key={subj.subject_id}
                      subject={subj}
                      subjectIdx={idx}
                      examData={examData}
                      onExamChange={handleExamChange}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Footer with save */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Changes are saved only after clicking "Save Changes".
              </p>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </div>
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="md:hidden space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[11px] text-blue-700 dark:text-blue-400 font-medium">
                Tap a subject card to expand. Grade subjects have disabled mark fields.
              </p>
            </div>

            {subjects.map((subj, idx) => (
              <MobileSubjectCard
                key={subj.subject_id}
                subject={subj}
                subjectIdx={idx}
                examData={examData}
                onExamChange={handleExamChange}
              />
            ))}

            {/* Mobile Save Button */}
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-bold text-white
                bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-[0.98] disabled:opacity-70 mt-2"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              Save All Changes
            </button>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileText className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No data loaded</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select Class, Section (if applicable), and Term, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Save Success Modal */}
      {showModal && <SaveSuccessModal onClose={() => setShowModal(false)} />}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
