/**
 * DefineMarks.jsx
 * Folder: src/pages/ExamMaster/DefineMarks.jsx
 *
 * Converts legacy ASPX "Define Marks" (preprimary_marks.aspx) to
 * fully-responsive React + Tailwind.
 *
 * Modes:
 *  1. Class Wise  → select Class → Term → Exam Name → Show → GridView1 (student list + marks/grade entry)
 *  2. Student Wise → select Class → Term → Exam Name → Admission No → Show → same entry
 *
 * Entry types per attribute:
 *  - Marks  → numeric TextBox + absent/NA/AB/ML dropdown
 *  - Grade  → dropdown (A+, A, B+, B, C, D, E)
 *
 * Features:
 *  - Accordion-per-student on mobile, dense table on desktop
 *  - Inline validation
 *  - Toast feedback
 *  - Loading skeleton
 *  - Save (console log / API placeholder)
 *  - Reset
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, Save, School2, BookOpen,
  UserCheck, Users, SlidersHorizontal, Info, Search,
  ClipboardList, GraduationCap, BarChart3, User,
  ListChecks, FileText, ShieldCheck, Hash
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const TERMS = ['Term 1', 'Term 2', 'Annual']

const EXAM_NAMES = {
  'Term 1':  ['Unit Test 1', 'Monthly Test', 'Mid Term'],
  'Term 2':  ['Unit Test 2', 'Half Yearly', 'Pre Board'],
  'Annual':  ['Annual Exam', 'Board Practical', 'Final Assessment'],
}

const GRADE_OPTIONS = ['Select', 'A+', 'A', 'B+', 'B', 'C', 'D', 'E']
const ABSENT_OPTIONS = ['None', 'NA', 'AB', 'ML']

// Attributes config: type = 'marks' | 'grade'
const ATTRIBUTES_BY_CLASS = {
  Nursery: [
    { id: 'a1', name: 'English', type: 'marks', max: 50, min: 17 },
    { id: 'a2', name: 'Hindi', type: 'marks', max: 50, min: 17 },
    { id: 'a3', name: 'Maths', type: 'marks', max: 50, min: 17 },
    { id: 'a4', name: 'Drawing', type: 'grade' },
    { id: 'a5', name: 'Behaviour', type: 'grade' },
  ],
  LKG: [
    { id: 'a1', name: 'English', type: 'marks', max: 50, min: 17 },
    { id: 'a2', name: 'Hindi', type: 'marks', max: 50, min: 17 },
    { id: 'a3', name: 'Maths', type: 'marks', max: 50, min: 17 },
    { id: 'a4', name: 'EVS', type: 'marks', max: 25, min: 8 },
    { id: 'a5', name: 'Drawing', type: 'grade' },
    { id: 'a6', name: 'Behaviour', type: 'grade' },
  ],
  UKG: [
    { id: 'a1', name: 'English', type: 'marks', max: 50, min: 17 },
    { id: 'a2', name: 'Hindi', type: 'marks', max: 50, min: 17 },
    { id: 'a3', name: 'Maths', type: 'marks', max: 50, min: 17 },
    { id: 'a4', name: 'EVS', type: 'marks', max: 25, min: 8 },
    { id: 'a5', name: 'Drawing', type: 'grade' },
    { id: 'a6', name: 'Behaviour', type: 'grade' },
    { id: 'a7', name: 'Oral', type: 'marks', max: 25, min: 8 },
  ],
  default: [
    { id: 'a1', name: 'English', type: 'marks', max: 100, min: 33 },
    { id: 'a2', name: 'Hindi', type: 'marks', max: 100, min: 33 },
    { id: 'a3', name: 'Mathematics', type: 'marks', max: 100, min: 33 },
    { id: 'a4', name: 'Science', type: 'marks', max: 100, min: 33 },
    { id: 'a5', name: 'Social Science', type: 'marks', max: 100, min: 33 },
    { id: 'a6', name: 'Computer', type: 'marks', max: 50, min: 17 },
    { id: 'a7', name: 'Drawing', type: 'grade' },
    { id: 'a8', name: 'Discipline', type: 'grade' },
  ],
}

// Dummy students per class
const generateStudents = (cls) => {
  const names = [
    'Aarav Sharma', 'Priya Verma', 'Rohan Gupta', 'Sneha Singh', 'Karan Patel',
    'Ananya Joshi', 'Dev Agarwal', 'Ishaan Kumar', 'Pooja Yadav', 'Rahul Mishra',
    'Divya Tiwari', 'Aryan Chauhan', 'Nisha Rawat', 'Vikram Bhat', 'Sanya Khanna',
  ]
  return names.map((name, i) => ({
    stu_id: `STU${String(i + 1).padStart(3, '0')}`,
    adm_no: `ADM${2024000 + i + 1}`,
    name,
  }))
}

const ADMISSION_LIST = (cls) =>
  generateStudents(cls).map(s => ({ value: s.adm_no, label: `${s.adm_no} — ${s.name}` }))

const getAttributes = (cls) =>
  ATTRIBUTES_BY_CLASS[cls] ?? ATTRIBUTES_BY_CLASS['default']

// Build initial marks state for a student list
const buildInitialMarks = (students, attributes) => {
  const state = {}
  students.forEach(s => {
    state[s.stu_id] = {}
    attributes.forEach(attr => {
      state[s.stu_id][attr.id] = attr.type === 'marks'
        ? { marks: '', absent: 'None', error: '' }
        : { grade: 'Select', error: '' }
    })
  })
  return state
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name) => CLASS_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
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
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          } ${className}`}
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

function Badge({ children, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${colors[color]}`}>
      {children}
    </span>
  )
}

// ─── MODE TOGGLE ──────────────────────────────────────────────────────────────

function ModeToggle({ value, onChange }) {
  const modes = [
    { label: 'Class Wise', value: 'class', icon: Users },
    { label: 'Student Wise', value: 'student', icon: User },
  ]
  return (
    <div className="inline-flex rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-50 dark:bg-[#1e2238] p-1 gap-1">
      {modes.map(m => {
        const Icon = m.icon
        const active = value === m.value
        return (
          <button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all
              ${active
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 dark:bg-indigo-600'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {m.label}
          </button>
        )
      })}
    </div>
  )
}

// ─── MARKS INPUT ──────────────────────────────────────────────────────────────

function MarksInput({ attr, value, onChange }) {
  const isDisabled = value.absent !== 'None'

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2">
        {/* Marks textbox */}
        <input
          type="number"
          min={0}
          max={attr.max}
          disabled={isDisabled}
          value={value.marks}
          onChange={e => onChange({ ...value, marks: e.target.value, error: '' })}
          placeholder="Marks"
          className={`w-20 px-2.5 py-1.5 text-[13px] rounded-lg border outline-none transition-all tabular-nums
            bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
            disabled:opacity-40 disabled:cursor-not-allowed
            ${value.error ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
        />
        {/* Absent dropdown */}
        <div className="relative">
          <select
            value={value.absent}
            onChange={e => onChange({ ...value, absent: e.target.value, marks: e.target.value !== 'None' ? '' : value.marks })}
            className="appearance-none pl-2.5 pr-6 py-1.5 text-[12px] rounded-lg border border-slate-200
              dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-300
              outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 cursor-pointer"
          >
            {ABSENT_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>
      {/* Max / Min */}
      <div className="flex gap-3 text-[11px] text-slate-400">
        <span>Max: <span className="font-semibold text-slate-600 dark:text-slate-400">{attr.max}</span></span>
        <span>Min: <span className="font-semibold text-slate-600 dark:text-slate-400">{attr.min}</span></span>
      </div>
      {value.error && (
        <p className="text-[11px] text-rose-500 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{value.error}
        </p>
      )}
    </div>
  )
}

function GradeInput({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value.grade}
        onChange={e => onChange({ grade: e.target.value, error: '' })}
        className={`appearance-none pl-2.5 pr-6 py-1.5 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
          focus:border-violet-400 focus:ring-2 focus:ring-violet-100 dark:focus:border-violet-500
          ${value.error ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {GRADE_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
      {value.error && (
        <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{value.error}
        </p>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ────────────────────────────────────────────────────────────

function DesktopTable({ students, attributes, marksState, onMarksChange }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
            <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-10">S.No</th>
            <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-28">Adm No.</th>
            <th className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-40">Student Name</th>
            {attributes.map(attr => (
              <th key={attr.id} className="px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                <div className="flex items-center gap-1">
                  {attr.type === 'marks'
                    ? <Hash className="w-3 h-3 text-blue-400" />
                    : <GraduationCap className="w-3 h-3 text-violet-400" />
                  }
                  {attr.name}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((stu, idx) => (
            <tr
              key={stu.stu_id}
              className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
            >
              <td className="px-3 py-3 text-[12px] text-slate-400 tabular-nums">{idx + 1}</td>
              <td className="px-3 py-3">
                <span className="text-[12px] font-mono font-semibold text-slate-600 dark:text-slate-400">{stu.adm_no}</span>
              </td>
              <td className="px-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400 flex-shrink-0">
                    {stu.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{stu.name}</span>
                </div>
              </td>
              {attributes.map(attr => {
                const val = marksState[stu.stu_id]?.[attr.id]
                if (!val) return <td key={attr.id} />
                return (
                  <td key={attr.id} className="px-3 py-3">
                    {attr.type === 'marks'
                      ? <MarksInput attr={attr} value={val} onChange={v => onMarksChange(stu.stu_id, attr.id, v)} />
                      : <GradeInput value={val} onChange={v => onMarksChange(stu.stu_id, attr.id, v)} />
                    }
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────

function MobileStudentCard({ stu, idx, attributes, marksState, onMarksChange }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(stu.name)

  const marksAttrs = attributes.filter(a => a.type === 'marks')
  const gradeAttrs = attributes.filter(a => a.type === 'grade')

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {stu.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{stu.name}</p>
          <p className="text-[11px] text-slate-400 mt-0.5 font-mono">{stu.adm_no}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-slate-400">{idx}</span>
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {/* Expanded: attribute inputs */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-5 space-y-4">

          {/* Marks section */}
          {marksAttrs.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> Marks Subjects
              </p>
              <div className="space-y-3">
                {marksAttrs.map(attr => {
                  const val = marksState[stu.stu_id]?.[attr.id]
                  if (!val) return null
                  return (
                    <div key={attr.id} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50 dark:bg-white/[0.02] p-3">
                      <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-2">{attr.name}</p>
                      <MarksInput attr={attr} value={val} onChange={v => onMarksChange(stu.stu_id, attr.id, v)} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Grade section */}
          {gradeAttrs.length > 0 && (
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5" /> Grade Attributes
              </p>
              <div className="grid grid-cols-2 gap-3">
                {gradeAttrs.map(attr => {
                  const val = marksState[stu.stu_id]?.[attr.id]
                  if (!val) return null
                  return (
                    <div key={attr.id} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50 dark:bg-white/[0.02] p-3">
                      <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 mb-2">{attr.name}</p>
                      <GradeInput value={val} onChange={v => onMarksChange(stu.stu_id, attr.id, v)} />
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({
  open, onClose,
  mode, setMode,
  cls, setCls,
  term, setTerm,
  examName, setExamName,
  admNo, setAdmNo,
  onShow, loading, errors,
}) {
  if (!open) return null
  const examOptions = EXAM_NAMES[term] || []
  const admOptions = cls ? ADMISSION_LIST(cls) : []

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" /></div>

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
          {/* Mode */}
          <div>
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Mode</p>
            <ModeToggle value={mode} onChange={setMode} />
          </div>

          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => setCls(e.target.value)} placeholder="-- Select Class --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => { setTerm(e.target.value); setExamName('') }} placeholder="-- Select Term --" error={errors.term}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Exam Name" error={errors.examName} required>
            <NativeSelect value={examName} onChange={e => setExamName(e.target.value)} placeholder="-- Select Exam --" error={errors.examName} disabled={!term}>
              {examOptions.map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>

          {mode === 'student' && (
            <Field label="Admission No." error={errors.admNo} required>
              <NativeSelect value={admNo} onChange={e => setAdmNo(e.target.value)} placeholder="-- Select Student --" error={errors.admNo} disabled={!cls}>
                {admOptions.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
              </NativeSelect>
            </Field>
          )}
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

// ─── SUMMARY BAR ──────────────────────────────────────────────────────────────

function SummaryBar({ students, shownCls, shownTerm, shownExam, mode }) {
  const { fg, bg } = classColor(shownCls)
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 flex flex-wrap gap-3 items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold" style={{ background: bg, color: fg }}>
          {formatAbbr(shownCls)}
        </span>
        <div>
          <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100">{shownCls}</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">{shownTerm} · {shownExam}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge color="blue">
          <Users className="w-3 h-3 mr-1" />{students.length} Students
        </Badge>
        <Badge color="slate">
          {mode === 'class' ? 'Class Wise' : 'Student Wise'}
        </Badge>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function DefineMarks() {
  // Filter state
  const [mode, setMode]           = useState('class')
  const [cls, setCls]             = useState('')
  const [term, setTerm]           = useState('')
  const [examName, setExamName]   = useState('')
  const [admNo, setAdmNo]         = useState('')

  // UI state
  const [loading, setLoading]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [errors, setErrors]       = useState({})
  const [toast, setToast]         = useState(null)
  const [search, setSearch]       = useState('')

  // Data state
  const [shown, setShown]         = useState(false)
  const [students, setStudents]   = useState([])
  const [attributes, setAttributes] = useState([])
  const [marksState, setMarksState] = useState({})

  // Snapshot of what was shown
  const [shownCls, setShownCls]   = useState('')
  const [shownTerm, setShownTerm] = useState('')
  const [shownExam, setShownExam] = useState('')

  const examOptions = EXAM_NAMES[term] || []

  // Reset exam when term changes
  useEffect(() => { setExamName('') }, [term])
  // Reset admNo when class changes
  useEffect(() => { setAdmNo('') }, [cls])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!cls) err.cls = 'Select a class'
    if (!term) err.term = 'Select a term'
    if (!examName) err.examName = 'Select an exam'
    if (mode === 'student' && !admNo) err.admNo = 'Select a student'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Show ──────────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const allStudents = generateStudents(cls)
      const stuList = mode === 'student'
        ? allStudents.filter(s => s.adm_no === admNo)
        : allStudents

      const attrs = getAttributes(cls)
      const marks = buildInitialMarks(stuList, attrs)

      setStudents(stuList)
      setAttributes(attrs)
      setMarksState(marks)
      setShownCls(cls)
      setShownTerm(term)
      setShownExam(examName)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${stuList.length} student${stuList.length !== 1 ? 's' : ''} for ${cls} · ${examName}`)
    }, 700)
  }, [mode, cls, term, examName, admNo])

  // ── Marks change ──────────────────────────────────────────────────────────
  const handleMarksChange = useCallback((stuId, attrId, val) => {
    setMarksState(prev => ({
      ...prev,
      [stuId]: { ...prev[stuId], [attrId]: val }
    }))
  }, [])

  // ── Save validation + submit ───────────────────────────────────────────────
  const handleSave = () => {
    let hasError = false
    const newState = { ...marksState }

    students.forEach(stu => {
      attributes.forEach(attr => {
        const val = newState[stu.stu_id]?.[attr.id]
        if (!val) return

        if (attr.type === 'marks') {
          const m = parseFloat(val.marks)
          if (val.absent === 'None') {
            if (val.marks === '' || isNaN(m)) {
              newState[stu.stu_id][attr.id] = { ...val, error: 'Required' }
              hasError = true
            } else if (m > attr.max) {
              newState[stu.stu_id][attr.id] = { ...val, error: `Max is ${attr.max}` }
              hasError = true
            }
          }
        } else {
          if (val.grade === 'Select') {
            newState[stu.stu_id][attr.id] = { ...val, error: 'Required' }
            hasError = true
          }
        }
      })
    })

    if (hasError) {
      setMarksState(newState)
      showToast('Fix validation errors before saving.', 'error')
      return
    }

    setSaving(true)
    // TODO: Replace with real API call
    setTimeout(() => {
      console.log('Saving marks data:', marksState)
      setSaving(false)
      showToast('Marks saved successfully!')
    }, 900)
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setCls(''); setTerm(''); setExamName(''); setAdmNo('')
    setErrors({}); setShown(false); setStudents([])
    setAttributes([]); setMarksState({}); setSearch('')
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filteredStudents = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) || s.adm_no.toLowerCase().includes(q)
    )
  }, [students, search])

  const hasResults = shown && students.length > 0
  const activeFilterCount = [cls, term, examName, mode === 'student' ? admNo : null].filter(Boolean).length

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Marks
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Enter marks &amp; grades for students — class wise or student wise.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 disabled:opacity-70 transition-all active:scale-95 flex-shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Marks
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

        <div className="p-5 space-y-4">
          {/* Mode toggle */}
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mode:</span>
            <ModeToggle value={mode} onChange={v => { setMode(v); setShown(false); setStudents([]) }} />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setErrors(p => ({ ...p, cls: undefined })) }} placeholder="-- Select Class --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Term" error={errors.term} required>
              <NativeSelect value={term} onChange={e => { setTerm(e.target.value); setErrors(p => ({ ...p, term: undefined })) }} placeholder="-- Select Term --" error={errors.term}>
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Exam Name" error={errors.examName} required>
              <NativeSelect value={examName} onChange={e => { setExamName(e.target.value); setErrors(p => ({ ...p, examName: undefined })) }} placeholder="-- Select Exam --" error={errors.examName} disabled={!term}>
                {examOptions.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>

            {/* Student Wise: admission dropdown | otherwise actions */}
            {mode === 'student' ? (
              <Field label="Admission No." error={errors.admNo} required>
                <NativeSelect value={admNo} onChange={e => { setAdmNo(e.target.value); setErrors(p => ({ ...p, admNo: undefined })) }} placeholder="-- Select Student --" error={errors.admNo} disabled={!cls}>
                  {(cls ? ADMISSION_LIST(cls) : []).map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </NativeSelect>
              </Field>
            ) : (
              <div className="flex gap-2 items-end">
                <button type="button" onClick={handleShow} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                    bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                    transition-all active:scale-95 disabled:opacity-70">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Show
                </button>
                <button type="button" onClick={handleReset}
                  className="px-3 py-2 rounded-xl text-[13px] bg-slate-100 text-slate-700 hover:bg-slate-200
                    dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Student wise: second row with show button */}
          {mode === 'student' && (
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="px-3 py-2 rounded-xl text-[13px] bg-slate-100 text-slate-700 hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {cls ? `${cls} · ${term || 'No Term'}` : 'Set Filters'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {hasResults && (
          <>
            <button type="button" onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white shadow-sm disabled:opacity-70">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            </button>
            <button type="button" onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <FilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        mode={mode} setMode={v => { setMode(v); setShown(false); setStudents([]) }}
        cls={cls} setCls={setCls}
        term={term} setTerm={setTerm}
        examName={examName} setExamName={setExamName}
        admNo={admNo} setAdmNo={setAdmNo}
        onShow={handleShow} loading={loading} errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary bar */}
          <SummaryBar students={filteredStudents} shownCls={shownCls} shownTerm={shownTerm} shownExam={shownExam} mode={mode} />

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <ListChecks className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Mark Entry</span>
                <span className="text-[13px] text-slate-400">· {shownCls} · {shownExam}</span>
                <Badge color="blue">{filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}</Badge>
                <Badge color="violet">{attributes.length} attributes</Badge>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search student…"
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
                Enter numeric marks or select grade. Mark absent students as NA / AB / ML. Click Save when done.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block">
              {filteredStudents.length === 0 ? (
                <EmptySearch />
              ) : (
                <DesktopTable
                  students={filteredStudents}
                  attributes={attributes}
                  marksState={marksState}
                  onMarksChange={handleMarksChange}
                />
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filteredStudents.length === 0 ? (
                <EmptySearch />
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5" />
                    Tap a student card to expand and enter marks.
                  </p>
                  {filteredStudents.map((stu, i) => (
                    <MobileStudentCard
                      key={stu.stu_id}
                      stu={stu}
                      idx={i + 1}
                      attributes={attributes}
                      marksState={marksState}
                      onMarksChange={handleMarksChange}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Card Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredStudents.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span> students
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>

          {/* Bottom Save (mobile sticky) */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 bg-white/90 dark:bg-[#0f1225]/90 backdrop-blur-md border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)]">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 disabled:opacity-70 transition-all"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Marks
            </button>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No data loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select class, term &amp; exam name, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY SEARCH STATE ───────────────────────────────────────────────────────
function EmptySearch() {
  return (
    <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
      <Search className="w-6 h-6 opacity-40" />
      <span className="text-[13px]">No students match your search.</span>
    </div>
  )
}
