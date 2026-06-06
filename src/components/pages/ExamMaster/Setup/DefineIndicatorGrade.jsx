/**
 * DefineIndicatorGrade.jsx
 * Folder: src/pages/ExamMaster/DefineIndicatorGrade.jsx
 *
 * Converts legacy ASPX "Define Indicator Grade" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session / Class / Term / Indicator Category filter dropdowns
 *  - Show button with validation
 *  - GridView → responsive cards (mobile) / dense table (desktop)
 *  - Nested DataList → each student shows all indicators with grade DDL + remark textarea
 *  - Save button (batch save all student-indicator grades)
 *  - Mobile: student cards with expandable indicator list
 *  - Desktop: full table with inline grade selectors
 *  - Loading skeleton, toast notifications, empty states
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, Save, BookOpen, Users,
  GraduationCap, ClipboardList, SlidersHorizontal,
  Info, Search, Award, FileCheck, BarChart3, School2,
  MessageSquare, CheckCircle2, AlertTriangle
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  { id: '1', label: 'Nursery' },
  { id: '2', label: 'LKG' },
  { id: '3', label: 'UKG' },
  { id: '4', label: 'Class I' },
  { id: '5', label: 'Class II' },
  { id: '6', label: 'Class III' },
  { id: '7', label: 'Class IV' },
  { id: '8', label: 'Class V' },
]

const TERMS = [
  { id: '1', label: 'Term 1 (April – September)' },
  { id: '2', label: 'Term 2 (October – March)' },
]

const INDICATOR_CATEGORIES = [
  { id: '1', label: 'Physical Development' },
  { id: '2', label: 'Social & Emotional Development' },
  { id: '3', label: 'Cognitive Development' },
  { id: '4', label: 'Language & Literacy' },
  { id: '5', label: 'Creative Arts' },
]

// Indicators per category
const INDICATORS = {
  '1': [
    { indicator_id: 'IND101', indicator_name: 'Gross Motor Skills' },
    { indicator_id: 'IND102', indicator_name: 'Fine Motor Skills' },
    { indicator_id: 'IND103', indicator_name: 'Body Coordination' },
    { indicator_id: 'IND104', indicator_name: 'Physical Fitness' },
  ],
  '2': [
    { indicator_id: 'IND201', indicator_name: 'Peer Interaction' },
    { indicator_id: 'IND202', indicator_name: 'Self-Confidence' },
    { indicator_id: 'IND203', indicator_name: 'Emotional Regulation' },
    { indicator_id: 'IND204', indicator_name: 'Empathy & Sharing' },
  ],
  '3': [
    { indicator_id: 'IND301', indicator_name: 'Problem Solving' },
    { indicator_id: 'IND302', indicator_name: 'Logical Thinking' },
    { indicator_id: 'IND303', indicator_name: 'Curiosity & Exploration' },
    { indicator_id: 'IND304', indicator_name: 'Concept Understanding' },
  ],
  '4': [
    { indicator_id: 'IND401', indicator_name: 'Reading Readiness' },
    { indicator_id: 'IND402', indicator_name: 'Writing Skills' },
    { indicator_id: 'IND403', indicator_name: 'Oral Communication' },
    { indicator_id: 'IND404', indicator_name: 'Vocabulary' },
  ],
  '5': [
    { indicator_id: 'IND501', indicator_name: 'Drawing & Colouring' },
    { indicator_id: 'IND502', indicator_name: 'Music & Rhythm' },
    { indicator_id: 'IND503', indicator_name: 'Craft & Creativity' },
    { indicator_id: 'IND504', indicator_name: 'Role Play & Drama' },
  ],
}

// Dummy students per class
const STUDENTS = {
  '1': [
    { stu_id: 'S001', adm_no: 'ADM2024001', name: 'Aarav Sharma' },
    { stu_id: 'S002', adm_no: 'ADM2024002', name: 'Diya Verma' },
    { stu_id: 'S003', adm_no: 'ADM2024003', name: 'Rohan Singh' },
    { stu_id: 'S004', adm_no: 'ADM2024004', name: 'Ananya Gupta' },
    { stu_id: 'S005', adm_no: 'ADM2024005', name: 'Vihan Patel' },
  ],
  '2': [
    { stu_id: 'S006', adm_no: 'ADM2024006', name: 'Ishaan Kumar' },
    { stu_id: 'S007', adm_no: 'ADM2024007', name: 'Kavya Nair' },
    { stu_id: 'S008', adm_no: 'ADM2024008', name: 'Arjun Mishra' },
    { stu_id: 'S009', adm_no: 'ADM2024009', name: 'Meera Joshi' },
  ],
  '3': [
    { stu_id: 'S010', adm_no: 'ADM2024010', name: 'Advait Rao' },
    { stu_id: 'S011', adm_no: 'ADM2024011', name: 'Priya Chauhan' },
    { stu_id: 'S012', adm_no: 'ADM2024012', name: 'Kabir Tiwari' },
  ],
  '4': [
    { stu_id: 'S013', adm_no: 'ADM2024013', name: 'Riya Pandey' },
    { stu_id: 'S014', adm_no: 'ADM2024014', name: 'Siddharth Yadav' },
    { stu_id: 'S015', adm_no: 'ADM2024015', name: 'Tanvi Agarwal' },
    { stu_id: 'S016', adm_no: 'ADM2024016', name: 'Om Srivastava' },
  ],
  '5': [
    { stu_id: 'S017', adm_no: 'ADM2024017', name: 'Shreya Dubey' },
    { stu_id: 'S018', adm_no: 'ADM2024018', name: 'Aditya Saxena' },
    { stu_id: 'S019', adm_no: 'ADM2024019', name: 'Nisha Yadav' },
  ],
  '6': [
    { stu_id: 'S020', adm_no: 'ADM2024020', name: 'Raj Mehta' },
    { stu_id: 'S021', adm_no: 'ADM2024021', name: 'Sneha Pathak' },
    { stu_id: 'S022', adm_no: 'ADM2024022', name: 'Harsh Bajpai' },
    { stu_id: 'S023', adm_no: 'ADM2024023', name: 'Pooja Shukla' },
  ],
  '7': [
    { stu_id: 'S024', adm_no: 'ADM2024024', name: 'Vivek Tripathi' },
    { stu_id: 'S025', adm_no: 'ADM2024025', name: 'Anjali Singh' },
    { stu_id: 'S026', adm_no: 'ADM2024026', name: 'Manav Kapoor' },
  ],
  '8': [
    { stu_id: 'S027', adm_no: 'ADM2024027', name: 'Ritika Jain' },
    { stu_id: 'S028', adm_no: 'ADM2024028', name: 'Dhruv Malhotra' },
    { stu_id: 'S029', adm_no: 'ADM2024029', name: 'Simran Khurana' },
    { stu_id: 'S030', adm_no: 'ADM2024030', name: 'Nikhil Bhatt' },
  ],
}

// Grade options
const GRADE_OPTIONS = ['select', 'A', 'B', 'C', 'NA', 'ML', 'AB']

// Grade color mapping
const gradeColor = (g) => {
  const map = {
    A:  'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30',
    B:  'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 border-blue-200 dark:border-blue-500/30',
    C:  'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 border-amber-200 dark:border-amber-500/30',
    NA: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600',
    ML: 'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300 border-orange-200 dark:border-orange-500/30',
    AB: 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 border-rose-200 dark:border-rose-500/30',
  }
  return map[g] || 'bg-slate-50 text-slate-500 border-slate-200'
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
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'warning' ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : type === 'warning'
        ? <AlertTriangle className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── GRADE PILL (read-only display) ──────────────────────────────────────────
function GradePill({ grade }) {
  if (!grade || grade === 'select') return (
    <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
      —
    </span>
  )
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-[12px] font-bold border ${gradeColor(grade)}`}>
      {grade}
    </span>
  )
}

// ─── INLINE GRADE SELECT ──────────────────────────────────────────────────────
function GradeSelect({ value, onChange }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`appearance-none pl-2 pr-6 py-1 text-[12px] font-semibold rounded-lg border outline-none transition-all cursor-pointer
          ${value && value !== 'select'
            ? gradeColor(value) + ' focus:ring-2 focus:ring-blue-100'
            : 'bg-white text-slate-700 border-slate-200 dark:bg-[#1e2238] dark:text-slate-300 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      >
        {GRADE_OPTIONS.map(g => (
          <option key={g} value={g}>{g}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-current opacity-60 pointer-events-none" />
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilter, onShow, loading, errors }) {
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
        <div className="px-5 py-4 space-y-4 overflow-y-auto max-h-[55vh]">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.class} required>
            <NativeSelect value={filters.class} onChange={e => setFilter('class', e.target.value)} placeholder="-- Select Class --" error={errors.class}>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={filters.term} onChange={e => setFilter('term', e.target.value)} placeholder="-- Select Term --" error={errors.term}>
              {TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Indicator Category" error={errors.indicator} required>
            <NativeSelect value={filters.indicator} onChange={e => setFilter('indicator', e.target.value)} placeholder="-- Select Category --" error={errors.indicator}>
              {INDICATOR_CATEGORIES.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
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
            Show
          </button>
        </div>
      </div>
    </>
  )
}

// ─── PROGRESS STATS BAR ───────────────────────────────────────────────────────
function ProgressStats({ gradeData, totalIndicators }) {
  const stats = useMemo(() => {
    let filled = 0, A = 0, B = 0, C = 0, other = 0
    gradeData.forEach(entry => {
      if (entry.grade && entry.grade !== 'select') {
        filled++
        if (entry.grade === 'A') A++
        else if (entry.grade === 'B') B++
        else if (entry.grade === 'C') C++
        else other++
      }
    })
    return { filled, A, B, C, other }
  }, [gradeData])

  const pct = totalIndicators ? Math.round((stats.filled / totalIndicators) * 100) : 0

  return (
    <div className="flex flex-wrap items-center gap-3 text-[12px]">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-28 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden flex-shrink-0">
          <div className="h-full rounded-full bg-blue-500 transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <span className="text-slate-500 dark:text-slate-400 font-medium">{stats.filled}/{totalIndicators} filled</span>
      </div>
      {stats.A > 0 && <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-bold text-[11px]">A×{stats.A}</span>}
      {stats.B > 0 && <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 font-bold text-[11px]">B×{stats.B}</span>}
      {stats.C > 0 && <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400 font-bold text-[11px]">C×{stats.C}</span>}
      {stats.other > 0 && <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400 font-bold text-[11px]">Other×{stats.other}</span>}
    </div>
  )
}

// ─── DESKTOP: Student Row with nested indicator rows ──────────────────────────
function DesktopStudentRow({ student, indicators, grades, onGradeChange, onRemarkChange, idx }) {
  const studentGrades = grades[student.stu_id] || {}

  return (
    <>
      {/* Student header row spans indicators */}
      {indicators.map((ind, indIdx) => {
        const entry = studentGrades[ind.indicator_id] || { grade: 'select', remark: '' }
        return (
          <tr
            key={`${student.stu_id}-${ind.indicator_id}`}
            className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
          >
            {/* S.No — only on first indicator row */}
            {indIdx === 0 && (
              <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 align-top w-12" rowSpan={indicators.length}>
                {idx}
              </td>
            )}
            {/* Admission No — only on first */}
            {indIdx === 0 && (
              <td className="px-4 py-3 align-top" rowSpan={indicators.length}>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400 font-mono">{student.adm_no}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{student.stu_id}</span>
                </div>
              </td>
            )}
            {/* Name — only on first */}
            {indIdx === 0 && (
              <td className="px-4 py-3 align-top" rowSpan={indicators.length}>
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{student.name}</span>
                </div>
              </td>
            )}
            {/* Indicator Name */}
            <td className="px-4 py-2.5">
              <span className="text-[12px] text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 flex-shrink-0 inline-block" />
                {ind.indicator_name}
              </span>
            </td>
            {/* Grade */}
            <td className="px-4 py-2.5 text-center">
              <GradeSelect
                value={entry.grade}
                onChange={e => onGradeChange(student.stu_id, ind.indicator_id, e.target.value)}
              />
            </td>
            {/* Remark */}
            <td className="px-4 py-2">
              <textarea
                value={entry.remark}
                onChange={e => onRemarkChange(student.stu_id, ind.indicator_id, e.target.value)}
                placeholder="Add remark…"
                rows={1}
                className="w-full min-w-[140px] text-[12px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
                  bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600
                  focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                  resize-none transition-all overflow-hidden"
                style={{ height: '34px' }}
                onInput={e => { e.target.style.height = '34px'; e.target.style.height = e.target.scrollHeight + 'px' }}
              />
            </td>
          </tr>
        )
      })}
      {/* Visual separator between students */}
      <tr>
        <td colSpan={6} className="py-0">
          <div className="border-b-2 border-dashed border-slate-100 dark:border-[rgba(99,102,241,0.08)]" />
        </td>
      </tr>
    </>
  )
}

// ─── MOBILE: Student Card with expandable indicator list ──────────────────────
function MobileStudentCard({ student, indicators, grades, onGradeChange, onRemarkChange, idx }) {
  const [expanded, setExpanded] = useState(false)
  const studentGrades = grades[student.stu_id] || {}

  // Count filled grades for this student
  const filledCount = indicators.filter(ind => {
    const g = (studentGrades[ind.indicator_id] || {}).grade
    return g && g !== 'select'
  }).length

  const allFilled = filledCount === indicators.length

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{student.adm_no}</p>
        </div>

        {/* Progress */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0 mr-1">
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${allFilled ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'}`}>
            {filledCount}/{indicators.length}
          </span>
          {allFilled && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
        </div>

        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${allFilled ? 'bg-emerald-500' : 'bg-blue-500'}`}
            style={{ width: `${indicators.length ? (filledCount / indicators.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      {/* Expanded Indicators */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] divide-y divide-slate-50 dark:divide-[rgba(99,102,241,0.05)]">
          {indicators.map((ind) => {
            const entry = studentGrades[ind.indicator_id] || { grade: 'select', remark: '' }
            return (
              <div key={ind.indicator_id} className="px-4 py-3 space-y-2">
                {/* Indicator Name */}
                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  {ind.indicator_name}
                </p>
                {/* Grade + Remark row */}
                <div className="flex gap-2 items-start">
                  <div className="flex-shrink-0">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1">Grade</label>
                    <GradeSelect
                      value={entry.grade}
                      onChange={e => onGradeChange(student.stu_id, ind.indicator_id, e.target.value)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide block mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> Remark
                    </label>
                    <textarea
                      value={entry.remark}
                      onChange={e => onRemarkChange(student.stu_id, ind.indicator_id, e.target.value)}
                      placeholder="Add remark (optional)…"
                      rows={2}
                      className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
                        bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600
                        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                        resize-none transition-all"
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineIndicatorGrade() {
  // ── Filter state ─────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({ session: '', class: '', term: '', indicator: '' })
  const [errors, setErrors] = useState({})

  // ── Data state ────────────────────────────────────────────────────────────
  const [students, setStudents]     = useState([])
  const [indicators, setIndicators] = useState([])
  const [grades, setGrades]         = useState({})  // { stu_id: { indicator_id: { grade, remark } } }

  // ── UI state ──────────────────────────────────────────────────────────────
  const [loading,    setLoading]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [shown,      setShown]      = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [toast,      setToast]      = useState(null)
  const [shownMeta,  setShownMeta]  = useState({})

  const setFilter = useCallback((key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate ─────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!filters.session)   err.session   = 'Select a session'
    if (!filters.class)     err.class     = 'Select a class'
    if (!filters.term)      err.term      = 'Select a term'
    if (!filters.indicator) err.indicator = 'Select indicator category'
    return err
  }

  // ── Show / Fetch ──────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const stuList  = STUDENTS[filters.class] || []
      const indList  = INDICATORS[filters.indicator] || []

      // Build initial grade state from dummy (empty on fresh load)
      const initGrades = {}
      stuList.forEach(s => {
        initGrades[s.stu_id] = {}
        indList.forEach(ind => {
          initGrades[s.stu_id][ind.indicator_id] = { grade: 'select', remark: '' }
        })
      })

      setStudents(stuList)
      setIndicators(indList)
      setGrades(initGrades)
      setShownMeta({
        session:   filters.session,
        className: CLASSES.find(c => c.id === filters.class)?.label || '',
        term:      TERMS.find(t => t.id === filters.term)?.label || '',
        category:  INDICATOR_CATEGORIES.find(i => i.id === filters.indicator)?.label || '',
      })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${stuList.length} students with ${indList.length} indicators.`)
    }, 700)
  }, [filters])

  // ── Grade / Remark change ─────────────────────────────────────────────────
  const handleGradeChange = useCallback((stuId, indId, val) => {
    setGrades(prev => ({
      ...prev,
      [stuId]: { ...prev[stuId], [indId]: { ...prev[stuId]?.[indId], grade: val } }
    }))
  }, [])

  const handleRemarkChange = useCallback((stuId, indId, val) => {
    setGrades(prev => ({
      ...prev,
      [stuId]: { ...prev[stuId], [indId]: { ...prev[stuId]?.[indId], remark: val } }
    }))
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    // Check for ungraded
    let ungraded = 0
    students.forEach(s => {
      indicators.forEach(ind => {
        const g = grades[s.stu_id]?.[ind.indicator_id]?.grade
        if (!g || g === 'select') ungraded++
      })
    })
    if (ungraded > 0) {
      showToast(`${ungraded} indicator(s) still ungraded. Please complete all grades.`, 'warning')
      return
    }
    setSaving(true)
    // ── API Integration Placeholder ──────────────────────────────────────────
    // const payload = students.map(s => ({
    //   stu_id: s.stu_id,
    //   session: filters.session,
    //   class_id: filters.class,
    //   term_id: filters.term,
    //   indicator_category_id: filters.indicator,
    //   grades: indicators.map(ind => ({
    //     indicator_id: ind.indicator_id,
    //     grade: grades[s.stu_id]?.[ind.indicator_id]?.grade,
    //     remark: grades[s.stu_id]?.[ind.indicator_id]?.remark || '',
    //   }))
    // }))
    // await fetch('/api/indicator-grades/save', { method: 'POST', body: JSON.stringify(payload) })
    setTimeout(() => {
      setSaving(false)
      showToast(`Grades saved successfully for ${students.length} students!`)
    }, 1000)
  }, [students, indicators, grades, filters])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFilters({ session: '', class: '', term: '', indicator: '' })
    setStudents([]); setIndicators([]); setGrades({})
    setErrors({}); setShown(false); setSearch(''); setShownMeta({})
  }

  // ── Filtered students ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.adm_no.toLowerCase().includes(q)
    )
  }, [students, search])

  // ── Overall progress stats ────────────────────────────────────────────────
  const allGradeEntries = useMemo(() => {
    const entries = []
    students.forEach(s => {
      indicators.forEach(ind => {
        entries.push(grades[s.stu_id]?.[ind.indicator_id] || { grade: 'select', remark: '' })
      })
    })
    return entries
  }, [grades, students, indicators])

  const totalSlots = students.length * indicators.length
  const hasResults = shown && students.length > 0
  const activeFilters = Object.values(filters).filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Indicator Grade
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Assign indicator grades &amp; remarks to students by session, class, term &amp; category.
          </p>
        </div>

        {/* Save button — desktop top-right */}
        {hasResults && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Grades
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
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)} placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Class" error={errors.class} required>
              <NativeSelect value={filters.class} onChange={e => setFilter('class', e.target.value)} placeholder="-- Select Class --" error={errors.class}>
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Term" error={errors.term} required>
              <NativeSelect value={filters.term} onChange={e => setFilter('term', e.target.value)} placeholder="-- Select Term --" error={errors.term}>
                {TERMS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Indicator Category" error={errors.indicator} required>
              <NativeSelect value={filters.indicator} onChange={e => setFilter('indicator', e.target.value)} placeholder="-- Select Category --" error={errors.indicator}>
                {INDICATOR_CATEGORIES.map(i => <option key={i.id} value={i.id}>{i.label}</option>)}
              </NativeSelect>
            </Field>
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

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 ? `Filters (${activeFilters}/4)` : 'Select Filters'}
          {activeFilters === 4 && <CheckCircle2 className="w-4 h-4 text-white/80" />}
        </button>
        {hasResults && (
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </button>
        )}
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
          <div className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Meta info banner */}
          <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4">
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <div className="flex items-center gap-2">
                <School2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                  Session: <span className="text-blue-700 dark:text-blue-300">{shownMeta.session}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                  Class: <span className="text-indigo-700 dark:text-indigo-300">{shownMeta.className}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                  Term: <span className="text-amber-700 dark:text-amber-300">{shownMeta.term}</span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
                  Category: <span className="text-emerald-700 dark:text-emerald-300">{shownMeta.category}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <Users className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="text-[12px] text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-slate-700 dark:text-slate-200">{students.length}</span> students ·{' '}
                  <span className="font-bold text-slate-700 dark:text-slate-200">{indicators.length}</span> indicators
                </span>
              </div>
            </div>
            {/* Overall progress */}
            <div className="mt-3 pt-3 border-t border-blue-100 dark:border-[rgba(99,102,241,0.15)]">
              <ProgressStats gradeData={allGradeEntries} totalIndicators={totalSlots} />
            </div>
          </div>

          {/* Main Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Indicator Grades</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search student / admission no…"
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

            {/* Hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Assign a grade for each indicator per student. Add optional remarks. Click <strong>Save Grades</strong> when done.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Adm. No.', 'Student Name', 'Indicator', 'Grade', 'Remark'].map((h, i) => (
                        <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap ${i < 3 ? 'text-left' : 'text-center'} ${i === 0 ? 'w-12' : ''}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((student, i) => (
                      <DesktopStudentRow
                        key={student.stu_id}
                        student={student}
                        indicators={indicators}
                        grades={grades}
                        onGradeChange={handleGradeChange}
                        onRemarkChange={handleRemarkChange}
                        idx={i + 1}
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
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a student card to expand and grade their indicators.
                  </p>
                  {filtered.map((student, i) => (
                    <MobileStudentCard
                      key={student.stu_id}
                      student={student}
                      indicators={indicators}
                      grades={grades}
                      onGradeChange={handleGradeChange}
                      onRemarkChange={handleRemarkChange}
                      idx={i + 1}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span> students
              </p>
              <div className="flex items-center gap-3">
                {search && (
                  <button onClick={() => setSearch('')}
                    className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear search
                  </button>
                )}
                {/* Mobile Save Button (bottom of results) */}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="sm:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                    bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70 transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Grades
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                    bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70 transition-all"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                  Save All Grades
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Award className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center px-4">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No data yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Select <strong>Session</strong>, <strong>Class</strong>, <strong>Term</strong>, and <strong>Indicator Category</strong>, then click <strong>Show</strong> to load students.
            </p>
          </div>
          {/* Quick hint chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {['Select Session', 'Select Class', 'Select Term', 'Select Category', 'Click Show'].map((step, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold flex-shrink-0">{i + 1}</span>
                {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
