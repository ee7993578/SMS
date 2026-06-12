/**
 * ItemRulesMaster.jsx
 * Folder: src/pages/Library/ItemRulesMaster.jsx
 *
 * Converts legacy ASPX "Item Rules Master" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Student / Staff type toggle (RadioButton)
 *  - Select All Classes checkbox + individual class checkboxes
 *  - Select All Categories checkbox + individual category checkboxes
 *  - Caution Money (Library & Book Bank), Monthly Charge, Fine (Library & Book Bank per day)
 *  - Days of Return (Library & Book Bank), Remark field
 *  - Submit button with validation
 *  - GridView of saved rules with modal popup (view details)
 *  - Mobile: stacked layout, drawer filter, card-based grid rows
 *  - Desktop: clean ERP-style form + table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BookOpen, Users, UserCheck, CheckSquare, Square,
  AlertCircle, X, Check, Loader2, ChevronDown, Eye,
  Grid3X3, FileText, IndianRupee, Calendar, MessageSquare,
  RefreshCw, Plus, SlidersHorizontal, ChevronRight,
  ChevronUp, Library, BookMarked, GraduationCap, Briefcase,
  Info, Search, TrendingUp, Home, ChevronLeft
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const BOOK_CATEGORIES = [
  'General', 'Reference', 'Fiction', 'Non-Fiction',
  'Science', 'Mathematics', 'History', 'Geography',
  'Literature', 'Computer Science',
]

const SAVED_RULES = [
  {
    id: 1,
    type: 'Student',
    name: 'Class I - Class V',
    item_category: 'General',
    details: [
      { class_name: 'Class I',   days_return_lib: 14, days_return_bb: 90 },
      { class_name: 'Class II',  days_return_lib: 14, days_return_bb: 90 },
      { class_name: 'Class III', days_return_lib: 14, days_return_bb: 90 },
      { class_name: 'Class IV',  days_return_lib: 14, days_return_bb: 90 },
      { class_name: 'Class V',   days_return_lib: 14, days_return_bb: 90 },
    ],
  },
  {
    id: 2,
    type: 'Student',
    name: 'Class VI - Class X',
    item_category: 'Reference',
    details: [
      { class_name: 'Class VI',   days_return_lib: 21, days_return_bb: 120 },
      { class_name: 'Class VII',  days_return_lib: 21, days_return_bb: 120 },
      { class_name: 'Class VIII', days_return_lib: 21, days_return_bb: 120 },
      { class_name: 'Class IX',   days_return_lib: 21, days_return_bb: 120 },
      { class_name: 'Class X',    days_return_lib: 21, days_return_bb: 120 },
    ],
  },
  {
    id: 3,
    type: 'Staff',
    name: 'Teaching Staff',
    item_category: 'Science',
    details: [
      { class_name: 'Senior Staff', days_return_lib: 30, days_return_bb: 180 },
      { class_name: 'Junior Staff', days_return_lib: 30, days_return_bb: 180 },
    ],
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const catColor = (name = '') => CATEGORY_COLORS[(name.charCodeAt(0) ?? 0) % CATEGORY_COLORS.length]

const initForm = () => ({
  memberType: 'Student',
  selectedClasses: [],
  selectedCategories: [],
  cautionMoneyLib: '',
  cautionMoneyBb: '',
  monthlyCharge: '',
  fineLib: '',
  fineBb: '',
  returnDaysLib: '',
  returnDaysBb: '',
  remark: '',
})

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Info className="w-3 h-3 flex-shrink-0" />{hint}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Input({ value, onChange, placeholder, error, type = 'text', className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        } ${className}`}
    />
  )
}

function Textarea({ value, onChange, placeholder, error }) {
  return (
    <textarea
      rows={3}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
    />
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

// ─── RADIO TYPE TOGGLE ────────────────────────────────────────────────────────

function TypeToggle({ value, onChange }) {
  const options = [
    { val: 'Student', icon: GraduationCap, label: 'Student' },
    { val: 'Staff',   icon: Briefcase,     label: 'Staff'   },
  ]
  return (
    <div className="flex gap-2">
      {options.map(({ val, icon: Icon, label }) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold border-2 transition-all
            ${value === val
              ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-indigo-500 dark:bg-indigo-500/15 dark:text-indigo-300 shadow-sm'
              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-400'
            }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── CHECKBOX GROUP (CLASSES / CATEGORIES) ───────────────────────────────────

function CheckGroup({ label, items, selected, onToggleAll, onToggleOne, allChecked }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <button
          type="button"
          onClick={onToggleAll}
          className="flex-shrink-0 text-blue-600 dark:text-indigo-400"
          title={allChecked ? 'Deselect All' : 'Select All'}
        >
          {allChecked
            ? <CheckSquare className="w-4.5 h-4.5 w-[18px] h-[18px]" />
            : <Square className="w-[18px] h-[18px] text-slate-400" />
          }
        </button>
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">{label}</span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
          {selected.length}/{items.length}
        </span>
        <button
          type="button"
          onClick={() => setExpanded(p => !p)}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Items */}
      {expanded && (
        <div className="p-3 flex flex-wrap gap-2">
          {items.map(item => {
            const checked = selected.includes(item)
            return (
              <button
                key={item}
                type="button"
                onClick={() => onToggleOne(item)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all
                  ${checked
                    ? 'bg-blue-600 text-white border-blue-600 dark:bg-indigo-600 dark:border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 dark:bg-[#1e2238] dark:text-slate-400 dark:border-[rgba(99,102,241,0.2)]'
                  }`}
              >
                {checked
                  ? <Check className="w-3 h-3 flex-shrink-0" />
                  : <Square className="w-3 h-3 flex-shrink-0 opacity-50" />
                }
                {item}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── MODAL (VIEW DETAILS) ─────────────────────────────────────────────────────

function RulesModal({ rule, onClose }) {
  if (!rule) return null
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="w-full max-w-2xl bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl overflow-hidden"
          style={{ animation: 'modalIn .2s ease' }}
        >
          <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Item Rules Detail</h3>
                <p className="text-[12px] text-slate-400 dark:text-slate-500">{rule.name} · {rule.type}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 overflow-y-auto max-h-[65vh]">
            {/* Category badge */}
            <div className="flex items-center gap-2 mb-4">
              <span
                className="px-3 py-1 rounded-full text-[12px] font-bold"
                style={{ background: catColor(rule.item_category).bg, color: catColor(rule.item_category).fg }}
              >
                {rule.item_category}
              </span>
              <span className={`px-3 py-1 rounded-full text-[11px] font-bold
                ${rule.type === 'Student'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'}`}>
                {rule.type}
              </span>
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block rounded-xl overflow-hidden border border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                    {['S.No.', 'Class / Category', 'Library Return Days', 'Book Bank Return Days'].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rule.details.map((d, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums">{i + 1}</td>
                      <td className="px-4 py-3">
                        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{d.class_name}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                          <Library className="w-3 h-3" />
                          {d.days_return_lib} days
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-bold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">
                          <BookMarked className="w-3 h-3" />
                          {d.days_return_bb} days
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-2">
              {rule.details.map((d, i) => (
                <div key={i} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50 dark:bg-[#1e2238] p-3.5">
                  <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 mb-2.5">{d.class_name}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-2.5 text-center">
                      <Library className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
                      <p className="text-[18px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{d.days_return_lib}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">Library Days</p>
                    </div>
                    <div className="rounded-lg bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-2.5 text-center">
                      <BookMarked className="w-4 h-4 text-violet-600 dark:text-violet-400 mx-auto mb-1" />
                      <p className="text-[18px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{d.days_return_bb}</p>
                      <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">Book Bank Days</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── SAVED RULES TABLE ROW ────────────────────────────────────────────────────

function RuleRow({ rule, idx, onView }) {
  const { fg, bg } = catColor(rule.item_category)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {rule.item_category.slice(0, 3).toUpperCase()}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{rule.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{rule.item_category}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold
          ${rule.type === 'Student'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
            : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'}`}>
          {rule.type === 'Student' ? <GraduationCap className="w-3 h-3" /> : <Briefcase className="w-3 h-3" />}
          {rule.type}
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onView(rule)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
            transition-all active:scale-95 shadow-sm"
        >
          <Eye className="w-3.5 h-3.5" />
          View
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE RULE CARD ─────────────────────────────────────────────────────────

function RuleMobileCard({ rule, idx, onView }) {
  const { fg, bg } = catColor(rule.item_category)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 flex items-center gap-3 shadow-sm">
      <span
        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
        style={{ background: bg, color: fg }}
      >
        {rule.item_category.slice(0, 3).toUpperCase()}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{rule.name}</p>
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <span className="text-[11px] text-slate-400 dark:text-slate-500">{rule.item_category}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
            ${rule.type === 'Student'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'}`}>
            {rule.type}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onView(rule)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
          bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
          transition-all active:scale-95 flex-shrink-0"
      >
        <Eye className="w-3.5 h-3.5" />
        View
      </button>
    </div>
  )
}

// ─── SECTION HEADER ───────────────────────────────────────────────────────────

function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
      <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <div>
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
        {subtitle && <span className="ml-2 text-[12px] text-slate-400 dark:text-slate-500">{subtitle}</span>}
      </div>
    </div>
  )
}

// ─── AMOUNT FIELD WITH ICON ───────────────────────────────────────────────────

function AmountInput({ value, onChange, placeholder, error }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <IndianRupee className="w-3.5 h-3.5" />
      </span>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder || '0'}
        min="0"
        className={`w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      />
    </div>
  )
}

// ─── DAYS INPUT WITH ICON ─────────────────────────────────────────────────────

function DaysInput({ value, onChange, placeholder, error }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        <Calendar className="w-3.5 h-3.5" />
      </span>
      <input
        type="number"
        value={value}
        onChange={onChange}
        placeholder={placeholder || '0'}
        min="0"
        className={`w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      />
    </div>
  )
}

// ─── BREADCRUMB ───────────────────────────────────────────────────────────────

function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-[12px] flex-wrap">
      <button className="flex items-center gap-1 text-blue-600 dark:text-indigo-400 hover:underline font-medium">
        <Home className="w-3.5 h-3.5" />
        Home
      </button>
      <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
      <span className="text-slate-500 dark:text-slate-400 font-medium">Registration</span>
      <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
      <span className="text-slate-800 dark:text-slate-200 font-bold">Item Rules Master</span>
    </nav>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ItemRulesMaster() {
  const [form, setForm] = useState(initForm())
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [savedRules, setSavedRules] = useState(SAVED_RULES)
  const [modalRule, setModalRule] = useState(null)
  const [toast, setToast] = useState(null)
  const [formOpen, setFormOpen] = useState(true)   // mobile: collapse form

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Field helpers ─────────────────────────────────────────────────────────
  const setField = (key, val) => {
    setForm(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: undefined }))
  }

  // ── Type change → reset class selections ─────────────────────────────────
  const handleTypeChange = useCallback((val) => {
    setForm(p => ({ ...p, memberType: val, selectedClasses: [] }))
  }, [])

  // ── Class toggle ──────────────────────────────────────────────────────────
  const handleToggleAllClasses = useCallback(() => {
    setForm(p => ({
      ...p,
      selectedClasses: p.selectedClasses.length === CLASSES.length ? [] : [...CLASSES],
    }))
  }, [])

  const handleToggleOneClass = useCallback((cls) => {
    setForm(p => ({
      ...p,
      selectedClasses: p.selectedClasses.includes(cls)
        ? p.selectedClasses.filter(c => c !== cls)
        : [...p.selectedClasses, cls],
    }))
  }, [])

  // ── Category toggle ───────────────────────────────────────────────────────
  const handleToggleAllCats = useCallback(() => {
    setForm(p => ({
      ...p,
      selectedCategories: p.selectedCategories.length === BOOK_CATEGORIES.length ? [] : [...BOOK_CATEGORIES],
    }))
  }, [])

  const handleToggleOneCat = useCallback((cat) => {
    setForm(p => ({
      ...p,
      selectedCategories: p.selectedCategories.includes(cat)
        ? p.selectedCategories.filter(c => c !== cat)
        : [...p.selectedCategories, cat],
    }))
  }, [])

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (form.memberType === 'Student' && form.selectedClasses.length === 0)
      err.classes = 'Please select at least one class'
    if (form.selectedCategories.length === 0)
      err.categories = 'Please select at least one category'
    if (!form.cautionMoneyLib) err.cautionMoneyLib = 'Required'
    if (!form.cautionMoneyBb) err.cautionMoneyBb = 'Required'
    if (!form.fineLib) err.fineLib = 'Required'
    if (!form.fineBb) err.fineBb = 'Required'
    if (!form.returnDaysLib) err.returnDaysLib = 'Required'
    if (!form.returnDaysBb) err.returnDaysBb = 'Required'
    return err
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) {
      setErrors(err)
      showToast('Please fill in all required fields.', 'error')
      return
    }
    setErrors({})
    setSubmitting(true)

    setTimeout(() => {
      const newRule = {
        id: Date.now(),
        type: form.memberType,
        name: form.selectedClasses.length > 0
          ? form.selectedClasses.join(', ')
          : form.memberType,
        item_category: form.selectedCategories[0] || 'General',
        details: (form.selectedClasses.length > 0 ? form.selectedClasses : ['All']).map(c => ({
          class_name: c,
          days_return_lib: Number(form.returnDaysLib),
          days_return_bb:  Number(form.returnDaysBb),
        })),
      }
      setSavedRules(p => [newRule, ...p])
      setForm(initForm())
      setSubmitting(false)
      showToast('Item rule saved successfully!')
    }, 800)
  }, [form])

  const handleReset = () => {
    setForm(initForm())
    setErrors({})
  }

  // ─── COMPUTED ─────────────────────────────────────────────────────────────
  const allClassesChecked = form.selectedClasses.length === CLASSES.length
  const allCatsChecked    = form.selectedCategories.length === BOOK_CATEGORIES.length

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1220] p-4 sm:p-6 space-y-5 pb-16">

      {/* Breadcrumb */}
      <Breadcrumb />

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Item Rules Master
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Configure library borrowing rules for students and staff by category.
          </p>
        </div>

        {/* Mobile: toggle form */}
        <button
          type="button"
          onClick={() => setFormOpen(p => !p)}
          className="sm:hidden flex items-center gap-2 self-start px-4 py-2 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          {formOpen ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {formOpen ? 'Collapse Form' : 'Add Rule'}
        </button>
      </div>

      {/* ── FORM CARD ──────────────────────────────────────────────────────── */}
      <div className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden
        ${!formOpen ? 'hidden sm:block' : ''}`}
      >
        <SectionHeader icon={Grid3X3} title="Item Rules" subtitle="Set borrowing policies" />

        <div className="p-5 space-y-5">

          {/* Member Type */}
          <Field label="Member Type" required>
            <TypeToggle value={form.memberType} onChange={handleTypeChange} />
          </Field>

          {/* Classes (Student only) */}
          {form.memberType === 'Student' && (
            <div>
              <CheckGroup
                label="Select Classes"
                items={CLASSES}
                selected={form.selectedClasses}
                allChecked={allClassesChecked}
                onToggleAll={handleToggleAllClasses}
                onToggleOne={handleToggleOneClass}
              />
              {errors.classes && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1.5">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.classes}
                </p>
              )}
            </div>
          )}

          {/* Book Categories */}
          <div>
            <CheckGroup
              label="Select Book Categories"
              items={BOOK_CATEGORIES}
              selected={form.selectedCategories}
              allChecked={allCatsChecked}
              onToggleAll={handleToggleAllCats}
              onToggleOne={handleToggleOneCat}
            />
            {errors.categories && (
              <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.categories}
              </p>
            )}
          </div>

          {/* ── FINANCIAL FIELDS ── */}
          <div className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/50 dark:bg-white/[0.02] p-4">
            <p className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <IndianRupee className="w-3.5 h-3.5 text-blue-500" />
              Financial Settings
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <Field label="Caution Money – Library" required error={errors.cautionMoneyLib}>
                <AmountInput
                  value={form.cautionMoneyLib}
                  onChange={e => setField('cautionMoneyLib', e.target.value)}
                  error={errors.cautionMoneyLib}
                />
              </Field>

              <Field label="Caution Money – Book Bank" required error={errors.cautionMoneyBb}>
                <AmountInput
                  value={form.cautionMoneyBb}
                  onChange={e => setField('cautionMoneyBb', e.target.value)}
                  error={errors.cautionMoneyBb}
                />
              </Field>

              <Field label="Monthly Charge – Library" error={errors.monthlyCharge}
                hint="Leave blank if no monthly charge">
                <AmountInput
                  value={form.monthlyCharge}
                  onChange={e => setField('monthlyCharge', e.target.value)}
                  error={errors.monthlyCharge}
                />
              </Field>

              {/* Spacer on large screens */}
              <div className="hidden lg:block" />

              <Field label="Fine – Library (Per Day)" required error={errors.fineLib}>
                <AmountInput
                  value={form.fineLib}
                  onChange={e => setField('fineLib', e.target.value)}
                  error={errors.fineLib}
                />
              </Field>

              <Field label="Fine – Book Bank (Per Day)" required error={errors.fineBb}>
                <AmountInput
                  value={form.fineBb}
                  onChange={e => setField('fineBb', e.target.value)}
                  error={errors.fineBb}
                />
              </Field>

            </div>
          </div>

          {/* ── RETURN DAYS ── */}
          <div className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/50 dark:bg-white/[0.02] p-4">
            <p className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-blue-500" />
              Return Period Settings
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

              <Field label="Return Days – Library" required error={errors.returnDaysLib}
                hint="e.g. 14 for 2 weeks">
                <DaysInput
                  value={form.returnDaysLib}
                  onChange={e => setField('returnDaysLib', e.target.value)}
                  error={errors.returnDaysLib}
                />
              </Field>

              <Field label="Return Days – Book Bank" required error={errors.returnDaysBb}
                hint="e.g. 90 for a semester">
                <DaysInput
                  value={form.returnDaysBb}
                  onChange={e => setField('returnDaysBb', e.target.value)}
                  error={errors.returnDaysBb}
                />
              </Field>

            </div>
          </div>

          {/* Remark */}
          <Field label="Remark" error={errors.remark}>
            <Textarea
              value={form.remark}
              onChange={e => setField('remark', e.target.value)}
              placeholder="Optional notes about this rule…"
              error={errors.remark}
            />
          </Field>

        </div>

        {/* Form Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
          >
            {submitting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Check className="w-4 h-4" />
            }
            {submitting ? 'Saving…' : 'Submit'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
              dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* ── SAVED RULES TABLE ──────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Saved Rules</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {savedRules.length}
            </span>
          </div>
        </div>

        {savedRules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-600">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <BookOpen className="w-7 h-7 opacity-40" />
            </div>
            <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">No rules saved yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500">Fill in the form above and click Submit.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Category / Name', 'Type', 'Action'].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {savedRules.map((rule, i) => (
                    <RuleRow key={rule.id} rule={rule} idx={i + 1} onView={setModalRule} />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {savedRules.map((rule, i) => (
                <RuleMobileCard key={rule.id} rule={rule} idx={i + 1} onView={setModalRule} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      <RulesModal rule={modalRule} onClose={() => setModalRule(null)} />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
