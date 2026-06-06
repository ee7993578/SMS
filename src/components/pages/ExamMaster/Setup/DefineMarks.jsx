/**
 * DefineMarks.jsx
 * Folder: src/pages/ExamMaster/DefineMarks.jsx
 *
 * Converts legacy ASPX "Define Marks" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Adm No, Student Name, Marks/Grade, Weightage, Absentism
 * Features:
 *  - Marks / Grade toggle (radio)
 *  - Cascaded dropdowns: Faculty → Class → Term → Exam Type → Subject
 *  - Show button + Save button
 *  - Absentism: Absent / Medical Leave / New Admission / Reset
 *  - Min/Max marks display
 *  - Mobile: card-based layout per student with expandable controls
 *  - Desktop: dense ERP-style table
 *  - Toast notifications
 *  - Loading/empty states
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, Users, Save, FileEdit, BookOpen, School2,
  SlidersHorizontal, Info, Search, BarChart3, ClipboardList,
  UserCheck, UserX, Stethoscope, UserPlus as UserPlusIcon,
  ChevronRight, Award, Hash, RotateCcw, CheckCircle2,
  GraduationCap, BookMarked, Layers, Calendar, ListFilter
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const FACULTIES = [
  { id: '1', name: 'Science' },
  { id: '2', name: 'Commerce' },
  { id: '3', name: 'Arts' },
  { id: '4', name: 'General' },
]

const CLASSES_BY_FACULTY = {
  '1': ['Class IX', 'Class X', 'Class XI (Sci)', 'Class XII (Sci)'],
  '2': ['Class XI (Com)', 'Class XII (Com)'],
  '3': ['Class XI (Arts)', 'Class XII (Arts)'],
  '4': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII'],
}

const TERMS = ['Term 1', 'Term 2', 'Annual']

const EXAM_TYPES = ['Unit Test', 'Mid Term', 'Pre Board', 'Board Exam', 'Half Yearly', 'Final']

const SUBJECTS_BY_CLASS = {
  'Class IX':        ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science'],
  'Class X':         ['Mathematics', 'Science', 'English', 'Hindi', 'Social Science'],
  'Class XI (Sci)':  ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
  'Class XII (Sci)': ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Computer Science'],
  'Class XI (Com)':  ['Accountancy', 'Business Studies', 'Economics', 'English', 'Mathematics'],
  'Class XII (Com)': ['Accountancy', 'Business Studies', 'Economics', 'English', 'Mathematics'],
  'Class XI (Arts)': ['History', 'Geography', 'Political Science', 'English', 'Hindi'],
  'Class XII (Arts)':['History', 'Geography', 'Political Science', 'English', 'Hindi'],
  default:           ['English', 'Hindi', 'Mathematics', 'EVS', 'Drawing'],
}

// Dummy students (would come from API based on Class selection)
const DUMMY_STUDENTS = [
  { stu_id: 1, registration_no: 'ADM001', Name: 'Aarav Sharma',     Marks: '', Grade: '-1', weightage: '20', absentism: '' },
  { stu_id: 2, registration_no: 'ADM002', Name: 'Priya Singh',      Marks: '', Grade: '-1', weightage: '20', absentism: '' },
  { stu_id: 3, registration_no: 'ADM003', Name: 'Rohan Verma',      Marks: '', Grade: '-1', weightage: '20', absentism: '' },
  { stu_id: 4, registration_no: 'ADM004', Name: 'Anjali Gupta',     Marks: '', Grade: '-1', weightage: '20', absentism: '' },
  { stu_id: 5, registration_no: 'ADM005', Name: 'Karan Mehta',      Marks: '', Grade: '-1', weightage: '20', absentism: '' },
  { stu_id: 6, registration_no: 'ADM006', Name: 'Sneha Patel',      Marks: '', Grade: '-1', weightage: '20', absentism: '' },
  { stu_id: 7, registration_no: 'ADM007', Name: 'Vikram Yadav',     Marks: '', Grade: '-1', weightage: '20', absentism: '' },
  { stu_id: 8, registration_no: 'ADM008', Name: 'Neha Joshi',       Marks: '', Grade: '-1', weightage: '20', absentism: '' },
  { stu_id: 9, registration_no: 'ADM009', Name: 'Amit Tiwari',      Marks: '', Grade: '-1', weightage: '20', absentism: '' },
  { stu_id: 10, registration_no: 'ADM010', Name: 'Pooja Mishra',    Marks: '', Grade: '-1', weightage: '20', absentism: '' },
  { stu_id: 11, registration_no: 'ADM011', Name: 'Rahul Dubey',     Marks: '', Grade: '-1', weightage: '20', absentism: '' },
  { stu_id: 12, registration_no: 'ADM012', Name: 'Kavya Pandey',    Marks: '', Grade: '-1', weightage: '20', absentism: '' },
]

const MIN_MARKS = 0
const MAX_MARKS = 100

const GRADES = ['-1', 'A', 'B', 'C', 'D', 'E']
const ABSENTISM_OPTIONS = [
  { value: 'AB', label: 'Absent',        icon: UserX,       color: 'rose' },
  { value: 'ML', label: 'Medical Leave', icon: Stethoscope, color: 'amber' },
  { value: 'NA', label: 'New Admission', icon: UserPlusIcon, color: 'cyan' },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const getSubjects = (cls) => SUBJECTS_BY_CLASS[cls] || SUBJECTS_BY_CLASS['default']

function isValidMarks(val, max) {
  if (val === '' || val === null || val === undefined) return true
  const n = parseFloat(val)
  if (isNaN(n)) return false
  return n >= MIN_MARKS && n <= max
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

function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

// ─── MARKS / GRADE TYPE TOGGLE ────────────────────────────────────────────────
function TypeToggle({ value, onChange }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit">
      {['Marks', 'Grade'].map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all ${
            value === opt
              ? 'bg-white dark:bg-[#1e2238] text-blue-700 dark:text-indigo-300 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          {opt === 'Marks' ? <span className="flex items-center gap-1.5"><Hash className="w-3.5 h-3.5" />Marks</span>
                           : <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" />Grade</span>}
        </button>
      ))}
    </div>
  )
}

// ─── ABSENTISM PILL BUTTONS ───────────────────────────────────────────────────
function AbsentismButtons({ value, onChange, compact = false }) {
  const colorMap = {
    rose:  { active: 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/40', hover: 'hover:bg-rose-50 dark:hover:bg-rose-500/10' },
    amber: { active: 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/40', hover: 'hover:bg-amber-50 dark:hover:bg-amber-500/10' },
    cyan:  { active: 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300 dark:border-cyan-500/40', hover: 'hover:bg-cyan-50 dark:hover:bg-cyan-500/10' },
  }

  return (
    <div className={`flex flex-wrap gap-1.5 ${compact ? 'justify-start' : 'justify-center'}`}>
      {ABSENTISM_OPTIONS.map(({ value: v, label, icon: Icon, color }) => {
        const isActive = value === v
        const c = colorMap[color]
        return (
          <button
            key={v}
            type="button"
            onClick={() => onChange(isActive ? '' : v)}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-semibold transition-all
              ${isActive ? c.active : `border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/60 ${c.hover}`}
            `}
          >
            <Icon className="w-3 h-3" />
            {!compact && label}
            {compact && label.slice(0, 2)}
          </button>
        )
      })}
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-400 hover:text-slate-600 bg-white dark:bg-slate-800/60 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          {!compact && 'Reset'}
        </button>
      )}
    </div>
  )
}

// ─── MIN/MAX MARKS BADGE ──────────────────────────────────────────────────────
function MinMaxBadge({ min, max }) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[12px] font-semibold text-slate-600 dark:text-slate-300">
        <span className="text-slate-400 text-[10px] font-bold uppercase">Min</span>
        <span className="text-slate-700 dark:text-slate-200">{min}</span>
      </span>
      <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/25 text-[12px] font-semibold text-blue-700 dark:text-blue-300">
        <span className="text-blue-500 text-[10px] font-bold uppercase">Max</span>
        <span>{max}</span>
      </span>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ student, idx, entryType, maxMarks, onUpdate, marksError }) {
  const isAbsent = !!student.absentism

  return (
    <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
      ${isAbsent ? 'bg-rose-50/40 dark:bg-rose-500/[0.04]' : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}>

      {/* S.No */}
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">
        {idx}
      </td>

      {/* Adm No */}
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">
          {student.registration_no}
        </span>
      </td>

      {/* Student Name */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
            {student.Name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{student.Name}</span>
        </div>
      </td>

      {/* Marks / Grade */}
      <td className="px-3 py-2.5 text-center">
        {entryType === 'Marks' ? (
          <div className="flex flex-col items-center gap-0.5">
            <input
              type="number"
              min={0}
              max={maxMarks}
              value={student.Marks}
              disabled={isAbsent}
              onChange={e => onUpdate(student.stu_id, 'Marks', e.target.value)}
              placeholder="—"
              className={`w-16 text-center py-1.5 text-[13px] font-semibold rounded-lg border outline-none transition-all tabular-nums
                ${marksError
                  ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300'
                  : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200'
                }
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                disabled:opacity-40 disabled:cursor-not-allowed
                [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
            />
            {marksError && <span className="text-[10px] text-rose-500 font-semibold">0–{maxMarks}</span>}
          </div>
        ) : (
          <div className="relative inline-block">
            <select
              value={student.Grade}
              disabled={isAbsent}
              onChange={e => onUpdate(student.stu_id, 'Grade', e.target.value)}
              className="appearance-none pl-3 pr-7 py-1.5 text-[12px] font-semibold rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 outline-none
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <option value="-1">— Grade —</option>
              {['A', 'B', 'C', 'D', 'E'].map(g => <option key={g} value={g}>{g}</option>)}
            </select>
            <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        )}
      </td>

      {/* Weightage */}
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[12px] font-bold tabular-nums">
          {student.weightage}
        </span>
      </td>

      {/* Absentism */}
      <td className="px-3 py-2.5">
        <AbsentismButtons
          value={student.absentism}
          onChange={v => onUpdate(student.stu_id, 'absentism', v)}
        />
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileCard({ student, idx, entryType, maxMarks, onUpdate, marksError }) {
  const [expanded, setExpanded] = useState(false)
  const isAbsent = !!student.absentism

  const absentLabel = ABSENTISM_OPTIONS.find(o => o.value === student.absentism)?.label || ''
  const absentColor = ABSENTISM_OPTIONS.find(o => o.value === student.absentism)?.color || ''

  const absentBadgeClass = {
    rose:  'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    cyan:  'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-300',
  }[absentColor] || ''

  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm transition-all
      ${isAbsent
        ? 'border-rose-200 dark:border-rose-500/25 bg-rose-50/40 dark:bg-rose-500/[0.04]'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'
      }`}>

      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
      >
        {/* Avatar */}
        <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          {student.Name.split(' ').map(w => w[0]).join('').slice(0, 2)}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{student.Name}</p>
            {isAbsent && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${absentBadgeClass}`}>
                {absentLabel}
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            <span className="font-mono">{student.registration_no}</span>
            &nbsp;·&nbsp;Weightage:&nbsp;
            <span className="font-semibold text-indigo-600 dark:text-indigo-400">{student.weightage}</span>
          </p>
        </div>

        {/* Marks/Grade badge */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {entryType === 'Marks' ? (
            <span className={`text-[16px] font-bold tabular-nums ${student.Marks === '' ? 'text-slate-300 dark:text-slate-600' : 'text-blue-700 dark:text-blue-400'}`}>
              {student.Marks === '' ? '—' : student.Marks}
            </span>
          ) : (
            <span className={`text-[16px] font-bold ${student.Grade === '-1' ? 'text-slate-300 dark:text-slate-600' : 'text-violet-700 dark:text-violet-400'}`}>
              {student.Grade === '-1' ? '—' : student.Grade}
            </span>
          )}
          <span className="text-[10px] text-slate-400">{entryType === 'Marks' ? 'marks' : 'grade'}</span>
        </div>

        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded Controls */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-4">
          {/* Marks / Grade Input */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">
              {entryType === 'Marks' ? `Enter Marks (0–${maxMarks})` : 'Select Grade'}
            </p>
            {entryType === 'Marks' ? (
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={0}
                  max={maxMarks}
                  value={student.Marks}
                  disabled={isAbsent}
                  onChange={e => onUpdate(student.stu_id, 'Marks', e.target.value)}
                  placeholder={`0 – ${maxMarks}`}
                  className={`w-32 text-center py-2 text-[15px] font-bold rounded-xl border outline-none transition-all
                    ${marksError
                      ? 'border-rose-400 bg-rose-50 dark:bg-rose-500/10 text-rose-700'
                      : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200'
                    }
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    disabled:opacity-40 disabled:cursor-not-allowed
                    [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
                />
                {marksError && <span className="text-[12px] text-rose-500 font-semibold">Must be 0–{maxMarks}</span>}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {['A', 'B', 'C', 'D', 'E'].map(g => (
                  <button
                    key={g}
                    type="button"
                    disabled={isAbsent}
                    onClick={() => onUpdate(student.stu_id, 'Grade', student.Grade === g ? '-1' : g)}
                    className={`w-10 h-10 rounded-xl text-[14px] font-bold border transition-all disabled:opacity-40 disabled:cursor-not-allowed
                      ${student.Grade === g
                        ? 'bg-violet-600 text-white border-violet-600 shadow-md shadow-violet-500/20'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/60 hover:border-violet-300'
                      }`}
                  >
                    {g}
                  </button>
                ))}
                {student.Grade !== '-1' && (
                  <button
                    type="button"
                    onClick={() => onUpdate(student.stu_id, 'Grade', '-1')}
                    className="px-3 h-10 rounded-xl text-[12px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 bg-white dark:bg-slate-800/60"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Absentism */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 mb-2">Absentism</p>
            <div className="flex flex-wrap gap-2">
              {ABSENTISM_OPTIONS.map(({ value: v, label, icon: Icon, color }) => {
                const isActive = student.absentism === v
                const colorClass = {
                  rose:  isActive ? 'bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-500/20 dark:text-rose-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/60 hover:bg-rose-50',
                  amber: isActive ? 'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-500/20 dark:text-amber-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/60 hover:bg-amber-50',
                  cyan:  isActive ? 'bg-cyan-100 text-cyan-700 border-cyan-300 dark:bg-cyan-500/20 dark:text-cyan-300' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800/60 hover:bg-cyan-50',
                }[color]
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onUpdate(student.stu_id, 'absentism', isActive ? '' : v)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold transition-all ${colorClass}`}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </button>
                )
              })}
              {student.absentism && (
                <button
                  type="button"
                  onClick={() => onUpdate(student.stu_id, 'absentism', '')}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-[12px] font-semibold text-slate-400 bg-white dark:bg-slate-800/60"
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilter, onShow, loading, errors }) {
  if (!open) return null
  const { faculty, cls, term, examType, subject } = filters

  const classes   = faculty ? (CLASSES_BY_FACULTY[faculty] || []) : []
  const subjects  = cls    ? getSubjects(cls) : []

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[92vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <Field label="Faculty" error={errors.faculty} required>
            <NativeSelect value={faculty} onChange={e => setFilter('faculty', e.target.value)} placeholder="-- Select Faculty --" error={errors.faculty}>
              {FACULTIES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => setFilter('cls', e.target.value)} placeholder="-- Select Class --" error={errors.cls} disabled={!faculty}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setFilter('term', e.target.value)} placeholder="-- Select Term --" error={errors.term}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Exam Type" error={errors.examType} required>
            <NativeSelect value={examType} onChange={e => setFilter('examType', e.target.value)} placeholder="-- Select Exam Type --" error={errors.examType}>
              {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subject" error={errors.subject} required>
            <NativeSelect value={subject} onChange={e => setFilter('subject', e.target.value)} placeholder="-- Select Subject --" error={errors.subject} disabled={!cls}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SUMMARY STAT BAR ────────────────────────────────────────────────────────
function StatPill({ icon: Icon, label, value, colorClass }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${colorClass}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[18px] font-bold tabular-nums leading-tight">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide leading-tight">{label}</p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineMarks() {
  // ── Filter state ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({ faculty: '', cls: '', term: '', examType: '', subject: '' })
  const setFilter = (key, val) => {
    setFilters(prev => {
      const next = { ...prev, [key]: val }
      if (key === 'faculty') { next.cls = ''; next.subject = '' }
      if (key === 'cls')     { next.subject = '' }
      return next
    })
    setErrors(p => ({ ...p, [key]: undefined }))
  }

  // ── Entry type ────────────────────────────────────────────────────────────
  const [entryType, setEntryType] = useState('Marks')

  // ── UI state ──────────────────────────────────────────────────────────────
  const [students,    setStudents]    = useState([])
  const [loading,     setLoading]     = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [marksErrors, setMarksErrors] = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownMeta,   setShownMeta]   = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate filters ─────────────────────────────────────────────────────
  const validateFilters = () => {
    const err = {}
    if (!filters.faculty)  err.faculty  = 'Select faculty'
    if (!filters.cls)      err.cls      = 'Select class'
    if (!filters.term)     err.term     = 'Select term'
    if (!filters.examType) err.examType = 'Select exam type'
    if (!filters.subject)  err.subject  = 'Select subject'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Show (load students) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validateFilters()) return
    setLoading(true)
    setSearch('')
    setMarksErrors({})
    setTimeout(() => {
      const data = DUMMY_STUDENTS.map(s => ({ ...s, Marks: '', Grade: '-1', absentism: '' }))
      setStudents(data)
      setShownMeta({ ...filters })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} students.`)
    }, 700)
  }, [filters])

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFilters({ faculty: '', cls: '', term: '', examType: '', subject: '' })
    setStudents([])
    setSearch('')
    setErrors({})
    setMarksErrors({})
    setShown(false)
    setShownMeta(null)
    setEntryType('Marks')
  }

  // ── Update student field ──────────────────────────────────────────────────
  const handleUpdate = useCallback((id, field, value) => {
    setStudents(prev => prev.map(s => {
      if (s.stu_id !== id) return s
      const updated = { ...s, [field]: value }
      // When absentism set, clear marks/grade
      if (field === 'absentism' && value) {
        updated.Marks = ''
        updated.Grade = '-1'
      }
      return updated
    }))
    // Validate marks
    if (field === 'Marks') {
      const valid = isValidMarks(value, MAX_MARKS)
      setMarksErrors(prev => ({ ...prev, [id]: !valid && value !== '' }))
    }
  }, [])

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = () => {
    // Validate all marks
    const newErrors = {}
    let hasError = false
    students.forEach(s => {
      if (!s.absentism && s.Marks !== '' && !isValidMarks(s.Marks, MAX_MARKS)) {
        newErrors[s.stu_id] = true
        hasError = true
      }
    })
    setMarksErrors(newErrors)
    if (hasError) { showToast('Fix marks errors before saving.', 'error'); return }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast('Marks saved successfully!')
    }, 900)
  }

  // ── Filtered students ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.Name.toLowerCase().includes(q) ||
      s.registration_no.toLowerCase().includes(q)
    )
  }, [students, search])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const filled   = filtered.filter(s => !s.absentism && (s.Marks !== '' || s.Grade !== '-1')).length
    const absent   = filtered.filter(s => s.absentism === 'AB').length
    const medLeave = filtered.filter(s => s.absentism === 'ML').length
    const newAdm   = filtered.filter(s => s.absentism === 'NA').length
    return { total: filtered.length, filled, absent, medLeave, newAdm }
  }, [filtered])

  const hasResults = shown && students.length > 0

  // ── Active filters count ──────────────────────────────────────────────────
  const activeFilters = Object.values(filters).filter(Boolean).length

  // ── Desktop filter: derived lists ────────────────────────────────────────
  const desktopClasses  = filters.faculty ? (CLASSES_BY_FACULTY[filters.faculty] || []) : []
  const desktopSubjects = filters.cls ? getSubjects(filters.cls) : []

  return (
    <div className="space-y-4 pb-16">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Marks
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Enter student marks / grades by faculty, class, term, exam type &amp; subject.
          </p>
        </div>
        {/* Type Toggle — always visible on desktop */}
        <div className="hidden sm:block">
          <TypeToggle value={entryType} onChange={setEntryType} />
        </div>
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            {/* Faculty */}
            <Field label="Faculty" error={errors.faculty} required>
              <NativeSelect value={filters.faculty} onChange={e => setFilter('faculty', e.target.value)} placeholder="-- Faculty --" error={errors.faculty}>
                {FACULTIES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </NativeSelect>
            </Field>
            {/* Class */}
            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={filters.cls} onChange={e => setFilter('cls', e.target.value)} placeholder="-- Class --" error={errors.cls} disabled={!filters.faculty}>
                {desktopClasses.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            {/* Term */}
            <Field label="Term" error={errors.term} required>
              <NativeSelect value={filters.term} onChange={e => setFilter('term', e.target.value)} placeholder="-- Term --" error={errors.term}>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>
            {/* Exam Type */}
            <Field label="Exam Type" error={errors.examType} required>
              <NativeSelect value={filters.examType} onChange={e => setFilter('examType', e.target.value)} placeholder="-- Exam Type --" error={errors.examType}>
                {EXAM_TYPES.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>
            {/* Subject */}
            <Field label="Subject" error={errors.subject} required>
              <NativeSelect value={filters.subject} onChange={e => setFilter('subject', e.target.value)} placeholder="-- Subject --" error={errors.subject} disabled={!filters.cls}>
                {desktopSubjects.map(s => <option key={s} value={s}>{s}</option>)}
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
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        {/* Type toggle on mobile */}
        <TypeToggle value={entryType} onChange={setEntryType} />
        <div className="flex-1" />
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <ListFilter className="w-4 h-4" />
          Filters
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Context banner */}
          <div className="rounded-2xl border border-indigo-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-[14px] font-extrabold text-slate-800 dark:text-slate-100">
                    {shownMeta?.cls}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">{shownMeta?.subject}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                  <span className="text-[13px] text-slate-500 dark:text-slate-400">{shownMeta?.term} · {shownMeta?.examType}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                    <BookMarked className="w-3 h-3" />{entryType} Entry
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                    <Users className="w-3 h-3" />{students.length} Students
                  </span>
                </div>
              </div>
              <MinMaxBadge min={MIN_MARKS} max={MAX_MARKS} />
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatPill icon={Users}       label="Total"        value={stats.total}    colorClass="bg-white dark:bg-[#1a1f35] border-slate-200 dark:border-[rgba(99,102,241,0.15)] text-blue-700 dark:text-blue-400" />
            <StatPill icon={CheckCircle2} label="Filled"      value={stats.filled}   colorClass="bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400" />
            <StatPill icon={UserX}       label="Absent"       value={stats.absent}   colorClass="bg-rose-50 dark:bg-rose-500/10 border-rose-100 dark:border-rose-500/20 text-rose-700 dark:text-rose-400" />
            <StatPill icon={Stethoscope} label="Med. Leave"   value={stats.medLeave} colorClass="bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400" />
          </div>

          {/* Main card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Marks Entry</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name or adm no…"
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
                Selecting Absentism clears marks/grade. Marks must be between {MIN_MARKS} – {MAX_MARKS}.
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
                      {['S.No.', 'Adm No.', 'Student Name', entryType, 'Weightage', 'Absentism'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <DesktopRow
                        key={s.stu_id}
                        student={s}
                        idx={i + 1}
                        entryType={entryType}
                        maxMarks={MAX_MARKS}
                        onUpdate={handleUpdate}
                        marksError={marksErrors[s.stu_id]}
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
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to enter marks / absentism.
                  </p>
                  {filtered.map((s, i) => (
                    <MobileCard
                      key={s.stu_id}
                      student={s}
                      idx={i + 1}
                      entryType={entryType}
                      maxMarks={MAX_MARKS}
                      onUpdate={handleUpdate}
                      marksError={marksErrors[s.stu_id]}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span> records
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>

          {/* ── SAVE BUTTON ── */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2.5 px-8 py-3 rounded-2xl text-[14px] font-bold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25
                transition-all active:scale-95 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saving…' : 'Save Marks'}
            </button>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No data loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select Faculty, Class, Term, Exam Type &amp; Subject, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
