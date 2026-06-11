/**
 * DefineMaxMinExam.jsx
 * Folder: src/pages/ExamMaster/DefineMaxMinExam.jsx
 *
 * Converts legacy ASPX "Define Max/Min/Date of Exam" page to
 * fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class Type → Class → Term → Exam → Header → Marks Type cascading dropdowns
 *  - Show button with client-side validation (red border on empty fields)
 *  - GridView with nested category → attributes (Max, Min, Date, Marks/Grade checkboxes)
 *  - Mobile: stacked accordion cards per category/attribute
 *  - Desktop: dense ERP-style nested table
 *  - Save button with toast feedback
 *  - Loading spinner overlay
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  ChevronDown, AlertCircle, X, Check, Loader2,
  Filter, RefreshCw, Eye, Save, SlidersHorizontal,
  Calendar, BookOpen, ClipboardList, ChevronRight,
  Info, Building2, GraduationCap, FileEdit,
  CheckSquare, Square, Hash, Star
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const CLASS_TYPES = ['Regular', 'Cambridge']

const CLASSES = {
  Regular: [
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
  ],
  Cambridge: [
    { id: '16', name: 'Cambridge I' },
    { id: '17', name: 'Cambridge II' },
    { id: '18', name: 'Cambridge III' },
    { id: '19', name: 'IGCSE' },
    { id: '20', name: 'AS Level' },
    { id: '21', name: 'A Level' },
  ],
}

const TERMS = [
  { id: '1', name: 'Term 1' },
  { id: '2', name: 'Term 2' },
  { id: '3', name: 'Term 3' },
  { id: '4', name: 'Annual' },
]

const EXAMS = {
  '1': [{ id: 'e1', name: 'Unit Test 1' }, { id: 'e2', name: 'Unit Test 2' }],
  '2': [{ id: 'e3', name: 'Half Yearly' }, { id: 'e4', name: 'Pre-Board' }],
  '3': [{ id: 'e5', name: 'Unit Test 3' }, { id: 'e6', name: 'Unit Test 4' }],
  '4': [{ id: 'e7', name: 'Annual Exam' }, { id: 'e8', name: 'Board Exam' }],
}

const HEADERS = {
  e1: [{ id: 'h1', name: 'Written' }, { id: 'h2', name: 'Oral' }],
  e2: [{ id: 'h1', name: 'Written' }, { id: 'h2', name: 'Oral' }],
  e3: [{ id: 'h3', name: 'Theory' }, { id: 'h4', name: 'Practical' }],
  e4: [{ id: 'h3', name: 'Theory' }, { id: 'h4', name: 'Practical' }],
  e5: [{ id: 'h1', name: 'Written' }, { id: 'h5', name: 'Project' }],
  e6: [{ id: 'h1', name: 'Written' }, { id: 'h5', name: 'Project' }],
  e7: [{ id: 'h3', name: 'Theory' }, { id: 'h4', name: 'Practical' }, { id: 'h6', name: 'Internal Assessment' }],
  e8: [{ id: 'h3', name: 'Theory' }, { id: 'h4', name: 'Practical' }],
}

// Subject categories with their attributes (subjects/components)
const GRID_DATA = {
  'h1': [
    {
      category_id: 'cat1', category_name: 'Core Subjects',
      attributes: [
        { attribute_id: 'a1', attribute_name: 'Mathematics', max_marks: '100', min_marks: '33', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'a2', attribute_name: 'Science', max_marks: '100', min_marks: '33', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'a3', attribute_name: 'English', max_marks: '100', min_marks: '33', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'a4', attribute_name: 'Hindi', max_marks: '100', min_marks: '33', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'a5', attribute_name: 'Social Science', max_marks: '100', min_marks: '33', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
      ],
    },
    {
      category_id: 'cat2', category_name: 'Co-Scholastic Activities',
      attributes: [
        { attribute_id: 'b1', attribute_name: 'Drawing & Painting', max_marks: '50', min_marks: '17', exam_date: '', Grade_subject: 'Y', is_marks: false, is_grade: true },
        { attribute_id: 'b2', attribute_name: 'Computer Science', max_marks: '50', min_marks: '17', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'b3', attribute_name: 'Physical Education', max_marks: '50', min_marks: '17', exam_date: '', Grade_subject: 'Y', is_marks: false, is_grade: true },
      ],
    },
  ],
  'h2': [
    {
      category_id: 'cat3', category_name: 'Oral Assessment',
      attributes: [
        { attribute_id: 'c1', attribute_name: 'English Speaking', max_marks: '20', min_marks: '7', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'c2', attribute_name: 'Hindi Recitation', max_marks: '20', min_marks: '7', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
      ],
    },
  ],
  'h3': [
    {
      category_id: 'cat1', category_name: 'Core Subjects',
      attributes: [
        { attribute_id: 'a1', attribute_name: 'Mathematics', max_marks: '100', min_marks: '33', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'a2', attribute_name: 'Physics', max_marks: '70', min_marks: '23', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'a3', attribute_name: 'Chemistry', max_marks: '70', min_marks: '23', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'a4', attribute_name: 'Biology', max_marks: '70', min_marks: '23', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'a5', attribute_name: 'English', max_marks: '100', min_marks: '33', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
      ],
    },
    {
      category_id: 'cat4', category_name: 'Optional Subjects',
      attributes: [
        { attribute_id: 'd1', attribute_name: 'Computer Science', max_marks: '70', min_marks: '23', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'd2', attribute_name: 'Physical Education', max_marks: '70', min_marks: '23', exam_date: '', Grade_subject: 'Y', is_marks: false, is_grade: true },
      ],
    },
  ],
  'h4': [
    {
      category_id: 'cat5', category_name: 'Practical Subjects',
      attributes: [
        { attribute_id: 'e1', attribute_name: 'Physics Practical', max_marks: '30', min_marks: '11', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'e2', attribute_name: 'Chemistry Practical', max_marks: '30', min_marks: '11', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
        { attribute_id: 'e3', attribute_name: 'Biology Practical', max_marks: '30', min_marks: '11', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
      ],
    },
  ],
}

// Fallback grid data for headers not explicitly mapped
const DEFAULT_GRID = [
  {
    category_id: 'cat_def', category_name: 'General Subjects',
    attributes: [
      { attribute_id: 'g1', attribute_name: 'Subject 1', max_marks: '100', min_marks: '33', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
      { attribute_id: 'g2', attribute_name: 'Subject 2', max_marks: '100', min_marks: '33', exam_date: '', Grade_subject: 'N', is_marks: true, is_grade: false },
    ],
  },
]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Styled native select with chevron icon */
function NativeSelect({ value, onChange, children, placeholder, error, disabled, id }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`
          w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none
          transition-all cursor-pointer bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }
        `}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

/** Form field wrapper with label + error */
function Field({ label, error, required, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
      >
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

/** Bottom toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999]
        flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl
        text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}
      `}
      style={{ animation: 'toastUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
      <style>{`
        @keyframes toastUp {
          from { opacity:0; transform:translateX(-50%) translateY(12px) }
          to   { opacity:1; transform:translateX(-50%) translateY(0) }
        }
      `}</style>
    </div>
  )
}

/** Full-page loading overlay */
function LoadingOverlay() {
  return (
    <div className="fixed inset-0 z-[9998] bg-slate-900/30 backdrop-blur-[2px] flex items-center justify-center">
      <div className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-indigo-400 animate-spin" />
        <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300">Loading data…</span>
      </div>
    </div>
  )
}

// ─── DATE PICKER INPUT (simple text-based for compatibility) ──────────────────
function DateInput({ value, onChange, error }) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={onChange}
        className={`
          w-full pl-3 pr-2 py-1.5 text-[12px] rounded-lg border outline-none transition-all
          bg-white text-slate-700 dark:bg-[#1e2238] dark:text-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${error
            ? 'border-rose-400 ring-1 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }
        `}
      />
    </div>
  )
}

// ─── DESKTOP ATTRIBUTE ROW ────────────────────────────────────────────────────
function AttributeRow({ attr, idx, marksType, onChange }) {
  const hasError = (field) => {
    if (field === 'max' && !attr.max_marks) return true
    if (field === 'min' && !attr.min_marks) return true
    return false
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-blue-50/30 dark:hover:bg-white/[0.015] transition-colors">
      {/* S.No */}
      <td className="px-3 py-2.5 text-center text-[11px] text-slate-400 dark:text-slate-500 tabular-nums w-10">
        {idx}
      </td>

      {/* Attribute Name */}
      <td className="px-3 py-2.5">
        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{attr.attribute_name}</span>
      </td>

      {/* Marks Checkbox */}
      <td className="px-3 py-2.5 text-center">
        <button
          type="button"
          onClick={() => onChange(attr.attribute_id, 'is_marks', !attr.is_marks)}
          className={`w-5 h-5 rounded flex items-center justify-center transition-all mx-auto
            ${attr.is_marks
              ? 'bg-blue-600 border-blue-600 text-white dark:bg-indigo-600 dark:border-indigo-600'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-blue-400'
            }`}
        >
          {attr.is_marks && <Check className="w-3 h-3" />}
        </button>
      </td>

      {/* Grade Checkbox */}
      <td className="px-3 py-2.5 text-center">
        <button
          type="button"
          onClick={() => onChange(attr.attribute_id, 'is_grade', !attr.is_grade)}
          className={`w-5 h-5 rounded flex items-center justify-center transition-all mx-auto
            ${attr.is_grade
              ? 'bg-violet-600 border-violet-600 text-white dark:bg-violet-500 dark:border-violet-500'
              : 'border-2 border-slate-300 dark:border-slate-600 hover:border-violet-400'
            }`}
        >
          {attr.is_grade && <Check className="w-3 h-3" />}
        </button>
      </td>

      {/* Max Marks */}
      <td className="px-3 py-2.5 w-28">
        <div className="relative">
          <input
            type="text"
            value={attr.max_marks}
            onChange={e => onChange(attr.attribute_id, 'max_marks', e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="Max"
            className={`
              w-full px-2.5 py-1.5 text-[12px] rounded-lg border outline-none transition-all text-right
              bg-white text-slate-700 dark:bg-[#1e2238] dark:text-slate-200
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:focus:border-indigo-400
              ${hasError('max') ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
            `}
          />
          {hasError('max') && (
            <span className="absolute -top-1 -right-1 text-rose-500 text-[10px] font-bold">*</span>
          )}
        </div>
      </td>

      {/* Min Marks */}
      <td className="px-3 py-2.5 w-28">
        <div className="relative">
          <input
            type="text"
            value={attr.min_marks}
            onChange={e => onChange(attr.attribute_id, 'min_marks', e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="Min"
            className={`
              w-full px-2.5 py-1.5 text-[12px] rounded-lg border outline-none transition-all text-right
              bg-white text-slate-700 dark:bg-[#1e2238] dark:text-slate-200
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:focus:border-indigo-400
              ${hasError('min') ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
            `}
          />
          {hasError('min') && (
            <span className="absolute -top-1 -right-1 text-rose-500 text-[10px] font-bold">*</span>
          )}
        </div>
      </td>

      {/* Date */}
      <td className="px-3 py-2.5 w-40">
        <DateInput
          value={attr.exam_date}
          onChange={e => onChange(attr.attribute_id, 'exam_date', e.target.value)}
        />
      </td>
    </tr>
  )
}

// ─── MOBILE ATTRIBUTE CARD ────────────────────────────────────────────────────
function MobileAttributeCard({ attr, idx, onChange }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
        <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          {idx}
        </span>
        <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 flex-1 min-w-0">
          {attr.attribute_name}
        </span>
        {/* Badge */}
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0
          ${attr.Grade_subject === 'Y'
            ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
          }`}>
          {attr.Grade_subject === 'Y' ? 'Grade' : 'Marks'}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Checkboxes Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Marks */}
          <button
            type="button"
            onClick={() => onChange(attr.attribute_id, 'is_marks', !attr.is_marks)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all
              ${attr.is_marks
                ? 'border-blue-400 bg-blue-50 dark:border-indigo-500 dark:bg-indigo-500/10'
                : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-transparent'
              }`}
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0
              ${attr.is_marks ? 'bg-blue-600 dark:bg-indigo-600' : 'border-2 border-slate-300 dark:border-slate-600'}`}>
              {attr.is_marks && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className={`text-[12px] font-semibold ${attr.is_marks ? 'text-blue-700 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400'}`}>
              Marks
            </span>
          </button>

          {/* Grade */}
          <button
            type="button"
            onClick={() => onChange(attr.attribute_id, 'is_grade', !attr.is_grade)}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl border-2 transition-all
              ${attr.is_grade
                ? 'border-violet-400 bg-violet-50 dark:border-violet-500 dark:bg-violet-500/10'
                : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-transparent'
              }`}
          >
            <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0
              ${attr.is_grade ? 'bg-violet-600 dark:bg-violet-500' : 'border-2 border-slate-300 dark:border-slate-600'}`}>
              {attr.is_grade && <Check className="w-2.5 h-2.5 text-white" />}
            </div>
            <span className={`text-[12px] font-semibold ${attr.is_grade ? 'text-violet-700 dark:text-violet-400' : 'text-slate-500 dark:text-slate-400'}`}>
              Grade
            </span>
          </button>
        </div>

        {/* Max / Min / Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Max Marks</label>
            <input
              type="text"
              value={attr.max_marks}
              onChange={e => onChange(attr.attribute_id, 'max_marks', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="e.g. 100"
              className={`
                w-full px-3 py-2 text-[13px] rounded-xl border outline-none text-right font-semibold
                bg-white text-slate-700 dark:bg-[#1e2238] dark:text-slate-200
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                ${!attr.max_marks ? 'border-rose-300' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
              `}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Min Marks</label>
            <input
              type="text"
              value={attr.min_marks}
              onChange={e => onChange(attr.attribute_id, 'min_marks', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="e.g. 33"
              className={`
                w-full px-3 py-2 text-[13px] rounded-xl border outline-none text-right font-semibold
                bg-white text-slate-700 dark:bg-[#1e2238] dark:text-slate-200
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                ${!attr.min_marks ? 'border-rose-300' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
              `}
            />
          </div>
        </div>

        {/* Date */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Calendar className="w-3 h-3" /> Exam Date
          </label>
          <input
            type="date"
            value={attr.exam_date}
            onChange={e => onChange(attr.attribute_id, 'exam_date', e.target.value)}
            className="w-full px-3 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none transition-all bg-white text-slate-700 dark:bg-[#1e2238] dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE CATEGORY ACCORDION ───────────────────────────────────────────────
function MobileCategoryAccordion({ category, onChange }) {
  const [open, setOpen] = useState(true)

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-50 dark:bg-[#161b2e] overflow-hidden shadow-sm">
      {/* Category Header */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-100/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
        <span className="flex-1 text-[14px] font-bold text-slate-800 dark:text-slate-100">{category.category_name}</span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 flex-shrink-0">
          {category.attributes.length} subject{category.attributes.length !== 1 ? 's' : ''}
        </span>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Attributes */}
      {open && (
        <div className="px-3 pb-3 space-y-2.5">
          {category.attributes.map((attr, idx) => (
            <MobileAttributeCard
              key={attr.attribute_id}
              attr={attr}
              idx={idx + 1}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── DESKTOP CATEGORY TABLE ───────────────────────────────────────────────────
function DesktopCategoryTable({ category, onChange }) {
  return (
    <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
      {/* Category Name Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-indigo-700 dark:to-blue-700">
        <span className="w-2 h-2 rounded-full bg-white/60 flex-shrink-0" />
        <span className="text-[13px] font-bold text-white tracking-wide">{category.category_name}</span>
        <span className="ml-auto text-[11px] text-white/70 font-medium">{category.attributes.length} Subjects</span>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-[rgba(99,102,241,0.12)]">
            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 w-10">S.No</th>
            <th className="px-3 py-2 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400">Subject / Attribute</th>
            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 w-16">Marks</th>
            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 w-16">Grade</th>
            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 w-28">Max</th>
            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 w-28">Min</th>
            <th className="px-3 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-slate-400 w-40">Exam Date</th>
          </tr>
        </thead>
        <tbody>
          {category.attributes.map((attr, idx) => (
            <AttributeRow
              key={attr.attribute_id}
              attr={attr}
              idx={idx + 1}
              onChange={onChange}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors, dropdownOptions }) {
  if (!open) return null

  const { classType, selectedClass, term, exam, header, marksType } = filters
  const { classes, terms, exams, headers } = dropdownOptions

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Title */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Exam Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4">
          <Field label="Class Type" required>
            <NativeSelect value={classType} onChange={e => setFilters(p => ({ ...p, classType: e.target.value, selectedClass: '', term: '', exam: '', header: '' }))}>
              {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Select Class" error={errors.selectedClass} required>
            <NativeSelect value={selectedClass} onChange={e => setFilters(p => ({ ...p, selectedClass: e.target.value, term: '', exam: '', header: '' }))} placeholder="<-Select->" error={errors.selectedClass}>
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Select Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setFilters(p => ({ ...p, term: e.target.value, exam: '', header: '' }))} placeholder="<-Select->" error={errors.term}>
              {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Select Exam" error={errors.exam} required>
            <NativeSelect value={exam} onChange={e => setFilters(p => ({ ...p, exam: e.target.value, header: '' }))} placeholder="<-Select->" error={errors.exam}>
              {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Select Header" error={errors.header} required>
            <NativeSelect value={header} onChange={e => setFilters(p => ({ ...p, header: e.target.value }))} placeholder="<-Select->" error={errors.header}>
              {headers.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Marks Type" error={errors.marksType} required>
            <NativeSelect value={marksType} onChange={e => setFilters(p => ({ ...p, marksType: e.target.value }))} placeholder="<-Select->" error={errors.marksType}>
              <option value="N">Marks</option>
              <option value="Y">Grade</option>
            </NativeSelect>
          </Field>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
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

// ─── SUMMARY BAR ─────────────────────────────────────────────────────────────
function SummaryBar({ categories }) {
  const totalSubjects = categories.reduce((s, c) => s + c.attributes.length, 0)
  return (
    <div className="flex flex-wrap items-center gap-3 px-5 py-3 bg-blue-50/60 dark:bg-indigo-500/[0.04] border-b border-blue-100 dark:border-[rgba(99,102,241,0.1)]">
      <div className="flex items-center gap-2">
        <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
        <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-300">
          {categories.length} Categor{categories.length !== 1 ? 'ies' : 'y'}
        </span>
      </div>
      <span className="text-slate-300 dark:text-slate-600">·</span>
      <div className="flex items-center gap-2">
        <ClipboardList className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
        <span className="text-[12px] font-semibold text-indigo-700 dark:text-indigo-300">
          {totalSubjects} Subject{totalSubjects !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
        <span className="text-[11px] text-blue-600 dark:text-blue-400 hidden sm:inline">
          Fill Max, Min and Exam Date for each subject. Check Marks or Grade type.
        </span>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineMaxMinExam() {
  // ── Filter State ────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState({
    classType: 'Regular',
    selectedClass: '',
    term: '',
    exam: '',
    header: '',
    marksType: '0',
  })

  // ── UI State ────────────────────────────────────────────────────────────────
  const [categories, setCategories]   = useState([])
  const [loading, setLoading]         = useState(false)
  const [saving, setSaving]           = useState(false)
  const [shown, setShown]             = useState(false)
  const [filterOpen, setFilterOpen]   = useState(false)
  const [errors, setErrors]           = useState({})
  const [toast, setToast]             = useState(null)

  // ── Derived Dropdown Options ─────────────────────────────────────────────
  const dropdownOptions = useMemo(() => {
    const classes = CLASSES[filters.classType] || []
    const terms   = TERMS
    const exams   = filters.term ? (EXAMS[filters.term] || []) : []
    const headers = filters.exam ? (HEADERS[filters.exam] || []) : []
    return { classes, terms, exams, headers }
  }, [filters.classType, filters.term, filters.exam])

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = useCallback(() => {
    const err = {}
    if (!filters.selectedClass) err.selectedClass = 'Select a class'
    if (!filters.term)          err.term          = 'Select a term'
    if (!filters.exam)          err.exam          = 'Select an exam'
    if (!filters.header)        err.header        = 'Select a header'
    if (!filters.marksType || filters.marksType === '0') err.marksType = 'Select marks type'
    setErrors(err)
    return Object.keys(err).length === 0
  }, [filters])

  // ── Show Handler ──────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setShown(false)

    setTimeout(() => {
      // Fetch grid data based on header selection
      const data = (GRID_DATA[filters.header] || DEFAULT_GRID).map(cat => ({
        ...cat,
        attributes: cat.attributes.map(attr => ({ ...attr }))
      }))
      setCategories(data)
      setShown(true)
      setLoading(false)
      showToast('Data loaded successfully.')
    }, 700)
  }, [filters, validate, showToast])

  // ── Attribute Change Handler ──────────────────────────────────────────────
  const handleAttrChange = useCallback((attrId, field, value) => {
    setCategories(prev =>
      prev.map(cat => ({
        ...cat,
        attributes: cat.attributes.map(attr =>
          attr.attribute_id === attrId ? { ...attr, [field]: value } : attr
        ),
      }))
    )
  }, [])

  // ── Save Handler ─────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    // Validate all rows have max/min
    let hasError = false
    for (const cat of categories) {
      for (const attr of cat.attributes) {
        if (!attr.max_marks || !attr.min_marks) { hasError = true; break }
      }
      if (hasError) break
    }
    if (hasError) {
      showToast('Please fill Max and Min marks for all subjects.', 'error')
      return
    }

    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast('Data saved successfully!')
    }, 900)
  }, [categories, showToast])

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setFilters({ classType: 'Regular', selectedClass: '', term: '', exam: '', header: '', marksType: '0' })
    setCategories([])
    setShown(false)
    setErrors({})
  }, [])

  // ── Active filter count (for mobile badge) ────────────────────────────────
  const activeCount = [filters.selectedClass, filters.term, filters.exam, filters.header].filter(Boolean).length

  // ── Label helpers ─────────────────────────────────────────────────────────
  const getLabel = useCallback((list, val) => list.find(i => i.id === val)?.name || '', [])
  const { classes, terms, exams, headers } = dropdownOptions

  const filterSummaryLabel = useMemo(() => {
    if (!filters.selectedClass) return 'Set Filters'
    const parts = [
      getLabel(classes, filters.selectedClass),
      getLabel(terms, filters.term),
    ].filter(Boolean)
    return parts.join(' · ') || 'Set Filters'
  }, [filters, classes, terms, getLabel])

  return (
    <div className="space-y-4 pb-16">

      {/* Loading overlay */}
      {(loading || saving) && <LoadingOverlay />}

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <FileEdit className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            </span>
            Define Max / Min / Date of Exam
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 ml-10">
            Configure maximum marks, minimum marks, and exam date for each subject.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Define Max/Min/Date of Exam</span>
        </div>

        {/* Filter Rows */}
        <div className="p-5 space-y-4">
          {/* Row 1: Class Type + Class + Term + Exam */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Class Type */}
            <Field label="Class Type">
              <NativeSelect
                value={filters.classType}
                onChange={e => setFilters(p => ({ ...p, classType: e.target.value, selectedClass: '', term: '', exam: '', header: '' }))}
              >
                {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            {/* Select Class */}
            <Field label="Select Class" error={errors.selectedClass} required>
              <NativeSelect
                value={filters.selectedClass}
                onChange={e => setFilters(p => ({ ...p, selectedClass: e.target.value, term: '', exam: '', header: '' }))}
                placeholder="<-Select->"
                error={errors.selectedClass}
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Select Term */}
            <Field label="Select Term" error={errors.term} required>
              <NativeSelect
                value={filters.term}
                onChange={e => setFilters(p => ({ ...p, term: e.target.value, exam: '', header: '' }))}
                placeholder="<-Select->"
                error={errors.term}
              >
                {terms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Select Exam */}
            <Field label="Select Exam" error={errors.exam} required>
              <NativeSelect
                value={filters.exam}
                onChange={e => setFilters(p => ({ ...p, exam: e.target.value, header: '' }))}
                placeholder="<-Select->"
                error={errors.exam}
                disabled={!filters.term}
              >
                {exams.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* Row 2: Header + Marks Type + Buttons */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Select Header */}
            <Field label="Select Header" error={errors.header} required>
              <NativeSelect
                value={filters.header}
                onChange={e => setFilters(p => ({ ...p, header: e.target.value }))}
                placeholder="<-Select->"
                error={errors.header}
                disabled={!filters.exam}
              >
                {headers.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Marks Type */}
            <Field label="Select Marks Type" error={errors.marksType} required>
              <NativeSelect
                value={filters.marksType}
                onChange={e => setFilters(p => ({ ...p, marksType: e.target.value }))}
                error={errors.marksType}
              >
                <option value="0">&lt;-Select-&gt;</option>
                <option value="N">Marks</option>
                <option value="Y">Grade</option>
              </NativeSelect>
            </Field>

            {/* Spacer */}
            <div />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset filters"
              >
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
          className="flex-1 flex items-center gap-2 py-3 px-4 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20 text-left"
        >
          <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
          <span className="flex-1 truncate">{filterSummaryLabel}</span>
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">
              {activeCount}/4
            </span>
          )}
        </button>
        {shown && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 flex-shrink-0"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onShow={handleShow}
        loading={loading}
        errors={errors}
        dropdownOptions={dropdownOptions}
      />

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No data to display</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select Class, Term, Exam, Header &amp; Marks Type then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── Results Panel ─────────────────────────────────────────────────── */}
      {shown && !loading && categories.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Panel Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Subject Configuration</span>

              {/* Context pills */}
              {filters.selectedClass && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {getLabel(classes, filters.selectedClass)}
                </span>
              )}
              {filters.term && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0">
                  {getLabel(terms, filters.term)}
                </span>
              )}
              {filters.exam && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 flex-shrink-0">
                  {getLabel(exams, filters.exam)}
                </span>
              )}
              {filters.marksType !== '0' && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400 flex-shrink-0">
                  {filters.marksType === 'Y' ? 'Grade Mode' : 'Marks Mode'}
                </span>
              )}
            </div>
          </div>

          {/* Summary Bar */}
          <SummaryBar categories={categories} />

          {/* ── DESKTOP TABLE VIEW ── */}
          <div className="hidden md:block p-5">
            {categories.map(cat => (
              <DesktopCategoryTable
                key={cat.category_id}
                category={cat}
                onChange={handleAttrChange}
              />
            ))}
          </div>

          {/* ── MOBILE ACCORDION VIEW ── */}
          <div className="md:hidden p-3 space-y-3">
            <div className="flex items-center gap-2 px-1 pb-1">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                Tap a category to expand. Fill Max, Min marks and Exam Date for each subject.
              </p>
            </div>
            {categories.map(cat => (
              <MobileCategoryAccordion
                key={cat.category_id}
                category={cat}
                onChange={handleAttrChange}
              />
            ))}
          </div>

          {/* Save Button Footer */}
          <div className="flex items-center justify-between gap-4 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500 hidden sm:block">
              * Fields marked required must be filled before saving.
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70 ml-auto"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          </div>
        </div>
      )}

      {/* ── Sticky Mobile Save Button ─────────────────────────────────────── */}
      {shown && !loading && categories.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 md:hidden z-30 px-4 pb-4 pt-2 bg-white/90 dark:bg-[#161b2e]/90 backdrop-blur-sm border-t border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-bold text-white
              bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30
              transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Configuration
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
