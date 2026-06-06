/**
 * DefineStudentRemark.jsx
 * Folder: src/pages/ExamMaster/DefineStudentRemark.jsx
 *
 * Converts legacy ASPX "Define Students Remark" to fully-responsive React + Tailwind.
 *
 * Remark Types: Remark (Term 1/Term 2), Exam Wise Remark, Promoted Class
 * Features:
 *  - Remark Type, Class, Term/Session, Exam, Promoted Class dropdowns (conditional)
 *  - Show button → loads student list
 *  - Per-student remark dropdown + Reset + Save
 *  - Total Meetings + Meetings Attended fields (for Term remark type)
 *  - Promoted class mode (GridView2 equivalent)
 *  - Exam Wise mode (GridView3 equivalent with textarea)
 *  - Mobile: card-based per-student layout
 *  - Desktop: dense ERP-style table
 *  - Loading states, toast notifications, validation
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, SlidersHorizontal, Search, BookOpen, School2,
  Users, Save, RotateCcw, ClipboardList, GraduationCap,
  ChevronRight, Info, FileText, Award, BarChart3
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const REMARK_TYPES = [
  { value: '1', label: 'Remark (Term 1 / Term 2)' },
  { value: '3', label: 'Exam Wise Remark' },
  { value: '4', label: 'Promoted Class' },
]

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const TERMS = ['Term 1', 'Term 2', 'Annual']

const EXAMS = ['Half Yearly', 'Annual Exam', 'Unit Test 1', 'Unit Test 2', 'Pre-Board']

const PROMOTED_CLASSES = [
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const REMARK_OPTIONS = [
  'Excellent', 'Very Good', 'Good', 'Average',
  'Needs Improvement', 'Outstanding', 'Satisfactory', 'Unsatisfactory',
]

const PROMOTED_CLASS_RESULT_OPTIONS = [
  'Promoted', 'Detained', 'Passed', 'Failed', 'Compartment', 'Distinction',
]

// ─── Dummy students generator ─────────────────────────────────────────────────
const generateStudents = (cls) => {
  const names = [
    'Aarav Sharma', 'Priya Singh', 'Rohan Verma', 'Ananya Gupta',
    'Arjun Patel', 'Shreya Mishra', 'Karan Kumar', 'Divya Joshi',
    'Siddharth Yadav', 'Pooja Agarwal', 'Rahul Tiwari', 'Neha Pandey',
    'Vikram Rao', 'Swati Bhatt', 'Amit Chauhan',
  ]
  return names.slice(0, 10 + Math.floor(Math.random() * 5)).map((name, i) => ({
    id: `STU${String(i + 1).padStart(3, '0')}`,
    registration_no: `ADM-${2024100 + i}`,
    name,
    stu_id: `${cls.replace(/\s/g, '')}_${i + 1}`,
    remark: '',
    promoted_result: '',
    exam_remark: '',
    exam_textarea: '',
    total_meetings: '',
    meetings_attended: '',
    saved: false,
    saving: false,
  }))
}

// ─── CLASS COLORS ─────────────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_COLORS[name.charCodeAt(0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

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

// ─── BADGE COMPONENT ──────────────────────────────────────────────────────────
function StatusBadge({ saved }) {
  if (!saved) return null
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
      <Check className="w-2.5 h-2.5" /> Saved
    </span>
  )
}

// ─── FILTER DRAWER (MOBILE) ───────────────────────────────────────────────────
function FilterDrawer({
  open, onClose,
  remarkType, setRemarkType,
  selectedClass, setSelectedClass,
  term, setTerm,
  exam, setExam,
  promotedClass, setPromotedClass,
  onShow, loading, errors,
}) {
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
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <Field label="Remark Type" error={errors.remarkType} required>
            <NativeSelect value={remarkType} onChange={e => setRemarkType(e.target.value)} placeholder="-- Select Type --" error={errors.remarkType}>
              {REMARK_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.selectedClass} required>
            <NativeSelect value={selectedClass} onChange={e => setSelectedClass(e.target.value)} placeholder="-- Select Class --" error={errors.selectedClass}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setTerm(e.target.value)} placeholder="-- Select Term --" error={errors.term}>
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          {remarkType === '3' && (
            <Field label="Exam">
              <NativeSelect value={exam} onChange={e => setExam(e.target.value)} placeholder="-- Select Exam --">
                {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>
          )}
          {remarkType === '4' && (
            <Field label="Promoted Class">
              <NativeSelect value={promotedClass} onChange={e => setPromotedClass(e.target.value)} placeholder="-- Select Class --">
                {PROMOTED_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
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
            Show
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileStudentCard({ student, remarkType, onRemarkChange, onReset, onSave, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(student.name)

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden transition-all
      ${student.saved
        ? 'border-emerald-200 dark:border-emerald-500/30'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'}`}>
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{student.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{student.registration_no}</p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge saved={student.saved} />
          {!student.saved && (
            <span className="text-[10px] text-slate-400">tap to fill</span>
          )}
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded form */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3">
          {/* Remark dropdown — type 1 and 3 */}
          {(remarkType === '1' || remarkType === '3') && (
            <Field label={remarkType === '3' ? 'Exam Remark' : 'Remark'}>
              <NativeSelect
                value={remarkType === '3' ? student.exam_remark : student.remark}
                onChange={e => onRemarkChange(student.id, remarkType === '3' ? 'exam_remark' : 'remark', e.target.value)}
              >
                <option value="">-- Select Remark --</option>
                {REMARK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </NativeSelect>
            </Field>
          )}

          {/* Exam Wise textarea */}
          {remarkType === '3' && (
            <Field label="Detailed Remark">
              <textarea
                value={student.exam_textarea}
                onChange={e => onRemarkChange(student.id, 'exam_textarea', e.target.value)}
                placeholder="Enter detailed remark..."
                maxLength={300}
                rows={3}
                className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none resize-none
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
              />
            </Field>
          )}

          {/* Promoted class result */}
          {remarkType === '4' && (
            <Field label="Result">
              <NativeSelect
                value={student.promoted_result}
                onChange={e => onRemarkChange(student.id, 'promoted_result', e.target.value)}
              >
                <option value="">-- Select Result --</option>
                {PROMOTED_CLASS_RESULT_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </NativeSelect>
            </Field>
          )}

          {/* Meetings — type 1 only */}
          {remarkType === '1' && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Total Meetings">
                <input
                  type="number"
                  value={student.total_meetings}
                  onChange={e => onRemarkChange(student.id, 'total_meetings', e.target.value)}
                  placeholder="e.g. 220"
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </Field>
              <Field label="Meetings Attended">
                <input
                  type="number"
                  value={student.meetings_attended}
                  onChange={e => onRemarkChange(student.id, 'meetings_attended', e.target.value)}
                  placeholder="e.g. 198"
                  className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
              </Field>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onReset(student.id)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={() => onSave(student.id)}
              disabled={student.saving}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all disabled:opacity-70"
            >
              {student.saving
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Save className="w-3.5 h-3.5" />}
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROWS ───────────────────────────────────────────────────────

// Type 1: Remark (Term 1/2)
function DesktopRowType1({ student, onRemarkChange, onReset, onSave }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-2.5 text-[12px] text-slate-400 text-center tabular-nums w-10">
        {student.idx}
      </td>
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono font-semibold text-blue-700 dark:text-blue-400">{student.registration_no}</span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: classColor(student.name).bg, color: classColor(student.name).fg }}
          >
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{student.name}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <select
            value={student.remark}
            onChange={e => onRemarkChange(student.id, 'remark', e.target.value)}
            className="appearance-none pl-2 pr-7 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
              bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none cursor-pointer
              focus:border-blue-400 focus:ring-1 focus:ring-blue-100 dark:focus:border-indigo-400 min-w-[140px]"
          >
            <option value="">-- Remark --</option>
            {REMARK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <StatusBadge saved={student.saved} />
          <button
            type="button"
            onClick={() => onReset(student.id)}
            className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" /> Reset
          </button>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <input
          type="number"
          value={student.total_meetings}
          onChange={e => onRemarkChange(student.id, 'total_meetings', e.target.value)}
          placeholder="Total"
          className="w-20 px-2 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
            bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none
            focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        />
      </td>
      <td className="px-3 py-2.5">
        <input
          type="number"
          value={student.meetings_attended}
          onChange={e => onRemarkChange(student.id, 'meetings_attended', e.target.value)}
          placeholder="Attended"
          className="w-24 px-2 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
            bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none
            focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        />
      </td>
      <td className="px-3 py-2.5">
        <button
          type="button"
          onClick={() => onSave(student.id)}
          disabled={student.saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white
            bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70"
        >
          {student.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save
        </button>
      </td>
    </tr>
  )
}

// Type 3: Exam Wise Remark
function DesktopRowType3({ student, onRemarkChange, onReset, onSave }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-2.5 text-[12px] text-slate-400 text-center tabular-nums w-10">{student.idx}</td>
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono font-semibold text-blue-700 dark:text-blue-400">{student.registration_no}</span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: classColor(student.name).bg, color: classColor(student.name).fg }}
          >
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{student.name}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex flex-col gap-1.5">
          <select
            value={student.exam_remark}
            onChange={e => onRemarkChange(student.id, 'exam_remark', e.target.value)}
            className="appearance-none pl-2 pr-7 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
              bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none cursor-pointer
              focus:border-blue-400 focus:ring-1 focus:ring-blue-100 min-w-[140px]"
          >
            <option value="">-- Remark --</option>
            {REMARK_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <div className="flex items-center gap-1.5">
            <StatusBadge saved={student.saved} />
            <button
              type="button"
              onClick={() => onReset(student.id)}
              className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 dark:text-slate-400 transition-colors flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <textarea
          value={student.exam_textarea}
          onChange={e => onRemarkChange(student.id, 'exam_textarea', e.target.value)}
          placeholder="Enter detailed remark..."
          maxLength={300}
          rows={2}
          className="w-full min-w-[200px] px-2 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
            bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none resize-none
            focus:border-blue-400 focus:ring-1 focus:ring-blue-100"
        />
      </td>
      <td className="px-3 py-2.5">
        <button
          type="button"
          onClick={() => onSave(student.id)}
          disabled={student.saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white
            bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70"
        >
          {student.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save
        </button>
      </td>
    </tr>
  )
}

// Type 4: Promoted Class
function DesktopRowType4({ student, onRemarkChange, onSave }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-3 py-2.5 text-[12px] text-slate-400 text-center tabular-nums w-10">{student.idx}</td>
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono font-semibold text-blue-700 dark:text-blue-400">{student.registration_no}</span>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: classColor(student.name).bg, color: classColor(student.name).fg }}
          >
            {student.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{student.name}</span>
        </div>
      </td>
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <select
            value={student.promoted_result}
            onChange={e => onRemarkChange(student.id, 'promoted_result', e.target.value)}
            className="appearance-none pl-2 pr-7 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
              bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none cursor-pointer
              focus:border-blue-400 focus:ring-1 focus:ring-blue-100 min-w-[140px]"
          >
            <option value="">-- Result --</option>
            {PROMOTED_CLASS_RESULT_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <StatusBadge saved={student.saved} />
        </div>
      </td>
      <td className="px-3 py-2.5">
        <button
          type="button"
          onClick={() => onSave(student.id)}
          disabled={student.saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white
            bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70"
        >
          {student.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Save
        </button>
      </td>
    </tr>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineStudentRemark() {
  // ── Filters ───────────────────────────────────────────────────────────────
  const [remarkType,     setRemarkType]     = useState('')
  const [selectedClass,  setSelectedClass]  = useState('')
  const [term,           setTerm]           = useState('')
  const [exam,           setExam]           = useState('')
  const [promotedClass,  setPromotedClass]  = useState('')

  // ── UI state ──────────────────────────────────────────────────────────────
  const [students,    setStudents]    = useState([])
  const [loading,     setLoading]     = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownMeta,   setShownMeta]   = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!remarkType)    err.remarkType    = 'Select remark type'
    if (!selectedClass) err.selectedClass = 'Select class'
    if (!term)          err.term          = 'Select term'
    return err
  }

  // ── Show students ─────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = generateStudents(selectedClass).map((s, i) => ({ ...s, idx: i + 1 }))
      setStudents(data)
      setShownMeta({ remarkType, selectedClass, term, exam, promotedClass })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} students for ${selectedClass} — ${term}`)
    }, 700)
  }, [remarkType, selectedClass, term, exam, promotedClass])

  const handleReset = () => {
    setRemarkType(''); setSelectedClass(''); setTerm('')
    setExam(''); setPromotedClass(''); setStudents([])
    setSearch(''); setErrors({}); setShown(false); setShownMeta({})
  }

  // ── Per-student remark/field update ───────────────────────────────────────
  const onRemarkChange = useCallback((id, field, value) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, [field]: value, saved: false } : s))
  }, [])

  // ── Reset a single student ────────────────────────────────────────────────
  const onReset = useCallback((id) => {
    setStudents(prev => prev.map(s =>
      s.id === id
        ? { ...s, remark: '', exam_remark: '', exam_textarea: '', promoted_result: '', total_meetings: '', meetings_attended: '', saved: false }
        : s
    ))
  }, [])

  // ── Save a single student ─────────────────────────────────────────────────
  const onSave = useCallback((id) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, saving: true } : s))
    setTimeout(() => {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, saving: false, saved: true } : s))
      showToast('Remark saved successfully!')
    }, 600)
  }, [])

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.registration_no.toLowerCase().includes(q)
    )
  }, [students, search])

  const savedCount = students.filter(s => s.saved).length
  const hasResults = shown && students.length > 0
  const activeFilters = [remarkType, selectedClass, term].filter(Boolean).length

  // ── Remark type label ─────────────────────────────────────────────────────
  const remarkLabel = REMARK_TYPES.find(r => r.value === shownMeta.remarkType)?.label || ''

  // ── Desktop table headers per type ───────────────────────────────────────
  const desktopHeaders = {
    '1': ['S.No.', 'Adm No.', 'Student Name', 'Remark', 'Total Meetings', 'Meetings Attended', 'Action'],
    '3': ['S.No.', 'Adm No.', 'Student Name', 'Remark', 'Detailed Remark', 'Action'],
    '4': ['S.No.', 'Adm No.', 'Student Name', 'Result', 'Action'],
  }

  return (
    <div className="space-y-4 pb-10">
      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Student Remark
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Assign term-wise, exam-wise or promotion remarks to students.
          </p>
        </div>
        {hasResults && savedCount > 0 && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
              {savedCount} / {students.length} saved
            </span>
          </div>
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
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Remark Type */}
            <Field label="Remark Type" error={errors.remarkType} required>
              <NativeSelect
                value={remarkType}
                onChange={e => { setRemarkType(e.target.value); setErrors(p => ({ ...p, remarkType: undefined })) }}
                placeholder="-- Select Type --"
                error={errors.remarkType}
              >
                {REMARK_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.selectedClass} required>
              <NativeSelect
                value={selectedClass}
                onChange={e => { setSelectedClass(e.target.value); setErrors(p => ({ ...p, selectedClass: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.selectedClass}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Term */}
            <Field label="Term" error={errors.term} required>
              <NativeSelect
                value={term}
                onChange={e => { setTerm(e.target.value); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select Term --"
                error={errors.term}
              >
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            {/* Conditional: Exam */}
            {remarkType === '3' ? (
              <Field label="Exam">
                <NativeSelect value={exam} onChange={e => setExam(e.target.value)} placeholder="-- Select Exam --">
                  {EXAMS.map(e => <option key={e} value={e}>{e}</option>)}
                </NativeSelect>
              </Field>
            ) : remarkType === '4' ? (
              <Field label="Promoted Class">
                <NativeSelect value={promotedClass} onChange={e => setPromotedClass(e.target.value)} placeholder="-- Select Class --">
                  {PROMOTED_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </NativeSelect>
              </Field>
            ) : <div />}

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

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {selectedClass ? `${selectedClass} · ${term || 'No Term'}` : 'Select Filters'}
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
        remarkType={remarkType} setRemarkType={setRemarkType}
        selectedClass={selectedClass} setSelectedClass={setSelectedClass}
        term={term} setTerm={setTerm}
        exam={exam} setExam={setExam}
        promotedClass={promotedClass} setPromotedClass={setPromotedClass}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
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
          {/* Summary strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: Users,        label: 'Total Students', value: students.length,  color: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400' },
              { icon: Check,        label: 'Remarks Saved',  value: savedCount,       color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' },
              { icon: BookOpen,     label: 'Pending',        value: students.length - savedCount, color: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' },
              { icon: GraduationCap,label: 'Class',          value: shownMeta.selectedClass, isText: true, color: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' },
            ].map(({ icon: Icon, label, value, color, isText }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm">
                <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
                  <Icon className="w-5 h-5" />
                </span>
                <div className="min-w-0">
                  {isText
                    ? <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{value}</p>
                    : <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>}
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Result card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            {/* Card header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 flex-wrap min-w-0">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student List</span>
                <span className="text-[12px] text-slate-400">· {shownMeta.selectedClass} · {shownMeta.term}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
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
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                {remarkLabel} · {shownMeta.selectedClass} · {shownMeta.term}
                {shownMeta.exam && ` · ${shownMeta.exam}`}
                {shownMeta.promotedClass && ` → ${shownMeta.promotedClass}`}
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
                      {(desktopHeaders[shownMeta.remarkType] || desktopHeaders['1']).map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(student =>
                      shownMeta.remarkType === '1' ? (
                        <DesktopRowType1 key={student.id} student={student} onRemarkChange={onRemarkChange} onReset={onReset} onSave={onSave} />
                      ) : shownMeta.remarkType === '3' ? (
                        <DesktopRowType3 key={student.id} student={student} onRemarkChange={onRemarkChange} onReset={onReset} onSave={onSave} />
                      ) : (
                        <DesktopRowType4 key={student.id} student={student} onRemarkChange={onRemarkChange} onSave={onSave} />
                      )
                    )}
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
                    Tap a student card to fill remark details.
                  </p>
                  {filtered.map(student => (
                    <MobileStudentCard
                      key={student.id}
                      student={student}
                      remarkType={shownMeta.remarkType}
                      onRemarkChange={onRemarkChange}
                      onReset={onReset}
                      onSave={onSave}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span> students
                {savedCount > 0 && (
                  <> · <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{savedCount} saved</span></>
                )}
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

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No data loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select remark type, class &amp; term — then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
