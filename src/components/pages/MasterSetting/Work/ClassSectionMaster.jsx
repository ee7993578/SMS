/**
 * ClassSectionMaster.jsx
 * Folder: src/pages/Configuration/ClassSectionMaster.jsx
 *
 * Converts legacy ASPX "Define Class Section" to fully-responsive React + Tailwind.
 *
 * Modes:
 *  - Class Mode: GridView of all classes with Select checkbox, Alternate Name, Group dropdown
 *  - Section Mode: TextBox for section name, multi-select class popup, type dropdown
 *
 * Features:
 *  - RadioButton toggle (Class / Section)
 *  - Class mode: inline editable grid with group assignment
 *  - Section mode: section name input + class multi-select + type dropdown
 *  - Bottom records grid with Type update per row
 *  - Mobile: accordion cards, drawer filters, stacked forms
 *  - Desktop: dense ERP table layout
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  ChevronDown, ChevronRight, Check, X, AlertCircle,
  Loader2, RefreshCw, Save, Edit3, BookOpen,
  GraduationCap, Users, Settings, Tag, List,
  Plus, Search, Info, CheckSquare, Square,
  LayoutGrid, Rows, Shield, Star
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const CLASS_LIST = [
  { id: 1,  class: 'Nursery',    altClass: 'Nur',   group: 'KinderGarten', sts: false },
  { id: 2,  class: 'LKG',        altClass: 'LKG',   group: 'KinderGarten', sts: false },
  { id: 3,  class: 'UKG',        altClass: 'UKG',   group: 'KinderGarten', sts: false },
  { id: 4,  class: 'Class I',    altClass: 'I',     group: 'Primary',      sts: true  },
  { id: 5,  class: 'Class II',   altClass: 'II',    group: 'Primary',      sts: true  },
  { id: 6,  class: 'Class III',  altClass: 'III',   group: 'Primary',      sts: true  },
  { id: 7,  class: 'Class IV',   altClass: 'IV',    group: 'Primary',      sts: true  },
  { id: 8,  class: 'Class V',    altClass: 'V',     group: 'Primary',      sts: true  },
  { id: 9,  class: 'Class VI',   altClass: 'VI',    group: 'Junior',       sts: false },
  { id: 10, class: 'Class VII',  altClass: 'VII',   group: 'Junior',       sts: false },
  { id: 11, class: 'Class VIII', altClass: 'VIII',  group: 'Junior',       sts: false },
  { id: 12, class: 'Class IX',   altClass: 'IX',    group: 'Senior',       sts: false },
  { id: 13, class: 'Class X',    altClass: 'X',     group: 'Senior',       sts: false },
  { id: 14, class: 'Class XI',   altClass: 'XI',    group: 'Senior',       sts: false },
  { id: 15, class: 'Class XII',  altClass: 'XII',   group: 'Senior',       sts: false },
]

const SECTION_RECORDS = [
  { Sec_id: 1,  class: 'Class I',    Section: 'A', Type: 'Regular'   },
  { Sec_id: 2,  class: 'Class I',    Section: 'B', Type: 'Regular'   },
  { Sec_id: 3,  class: 'Class II',   Section: 'A', Type: 'Regular'   },
  { Sec_id: 4,  class: 'Class III',  Section: 'A', Type: 'Cambridge' },
  { Sec_id: 5,  class: 'Class IV',   Section: 'A', Type: 'Regular'   },
  { Sec_id: 6,  class: 'Class V',    Section: 'A', Type: 'Regular'   },
  { Sec_id: 7,  class: 'Class VI',   Section: 'A', Type: 'Regular'   },
  { Sec_id: 8,  class: 'Class VI',   Section: 'B', Type: 'Cambridge' },
  { Sec_id: 9,  class: 'Class VII',  Section: 'A', Type: 'Regular'   },
  { Sec_id: 10, class: 'Class VIII', Section: 'A', Type: 'Regular'   },
]

const GROUPS = ['Select', 'Primary', 'Junior', 'Senior', 'KinderGarten']
const TYPES  = ['Regular', 'Cambridge']

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const GROUP_COLORS = {
  KinderGarten: { fg: '#7c3aed', bg: '#ede9fe' },
  Primary:      { fg: '#059669', bg: '#d1fae5' },
  Junior:       { fg: '#0891b2', bg: '#cffafe' },
  Senior:       { fg: '#d97706', bg: '#fef3c7' },
  Select:       { fg: '#94a3b8', bg: '#f1f5f9' },
}
const groupColor = (g) => GROUP_COLORS[g] || GROUP_COLORS.Select

const CLASS_BADGE_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classBadgeColor = (name = '') => CLASS_BADGE_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_BADGE_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
        px-5 py-3 rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
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

function NativeSelect({ value, onChange, children, error, disabled, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// Mode toggle pill
function ModeToggle({ mode, onChange }) {
  return (
    <div className="inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 gap-1">
      {[
        { value: 'class',   label: 'Class',   icon: GraduationCap },
        { value: 'section', label: 'Section', icon: LayoutGrid    },
      ].map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all
            ${mode === value
              ? 'bg-white dark:bg-[#1a1f35] text-blue-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── CLASS GRID ROW (Desktop) ─────────────────────────────────────────────────

function ClassDesktopRow({ row, idx, onChange }) {
  const { fg, bg } = classBadgeColor(row.class)
  const { fg: gfg, bg: gbg } = groupColor(row.group)

  return (
    <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
      ${row.selected ? 'bg-blue-50/40 dark:bg-indigo-500/[0.04]' : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}
    `}>
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>

      {/* Select checkbox */}
      <td className="px-4 py-3 text-center w-14">
        <button
          type="button"
          disabled={row.sts}
          onClick={() => !row.sts && onChange(row.id, 'selected', !row.selected)}
          className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all mx-auto
            ${row.sts
              ? 'bg-slate-100 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700'
              : row.selected
                ? 'bg-blue-600 border-blue-600 dark:bg-indigo-600 dark:border-indigo-600'
                : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-indigo-400'
            }`}
        >
          {(row.selected || row.sts) && <Check className="w-3 h-3 text-white" />}
        </button>
      </td>

      {/* Class Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}>
            {formatAbbr(row.class)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {row.class}
          </span>
        </div>
      </td>

      {/* Alternate Name */}
      <td className="px-4 py-3">
        <input
          type="text"
          value={row.altClass}
          onChange={e => onChange(row.id, 'altClass', e.target.value)}
          className="w-full max-w-[120px] px-3 py-1.5 text-[12px] rounded-lg border border-slate-200
            dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238]
            text-slate-700 dark:text-slate-200 outline-none
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
          placeholder="Alt name"
        />
      </td>

      {/* Group */}
      <td className="px-4 py-3 min-w-[150px]">
        <div className="relative">
          <select
            value={row.group}
            onChange={e => onChange(row.id, 'group', e.target.value)}
            className="w-full appearance-none pl-3 pr-8 py-1.5 text-[12px] rounded-lg border
              border-slate-200 dark:border-[rgba(99,102,241,0.25)]
              bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200
              outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:focus:border-indigo-400 transition-all"
          >
            {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
        {row.group !== 'Select' && (
          <span className="inline-flex items-center mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ background: gbg, color: gfg }}>
            {row.group}
          </span>
        )}
      </td>
    </tr>
  )
}

// ─── CLASS MOBILE CARD ────────────────────────────────────────────────────────

function ClassMobileCard({ row, idx, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classBadgeColor(row.class)
  const { fg: gfg, bg: gbg } = groupColor(row.group)

  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm transition-all
      ${row.selected
        ? 'border-blue-300 dark:border-indigo-500/50 bg-blue-50/30 dark:bg-indigo-500/[0.04]'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'
      }`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Checkbox */}
        <button
          type="button"
          disabled={row.sts}
          onClick={() => !row.sts && onChange(row.id, 'selected', !row.selected)}
          className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-all
            ${row.sts
              ? 'bg-slate-100 border-slate-200 cursor-not-allowed dark:bg-slate-800 dark:border-slate-700'
              : row.selected
                ? 'bg-blue-600 border-blue-600 dark:bg-indigo-600 dark:border-indigo-600'
                : 'border-slate-300 dark:border-slate-600'
            }`}
        >
          {(row.selected || row.sts) && <Check className="w-3 h-3 text-white" />}
        </button>

        {/* Badge */}
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {formatAbbr(row.class)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.class}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {row.group !== 'Select' && (
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={{ background: gbg, color: gfg }}>{row.group}</span>
            )}
            {row.sts && (
              <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Pre-selected
              </span>
            )}
          </div>
        </div>

        {/* Expand */}
        <button
          type="button"
          onClick={() => setExpanded(p => !p)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <Field label="Alternate Name">
            <input
              type="text"
              value={row.altClass}
              onChange={e => onChange(row.id, 'altClass', e.target.value)}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200
                dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238]
                text-slate-700 dark:text-slate-200 outline-none
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
              placeholder="Enter alternate name"
            />
          </Field>
          <Field label="Group">
            <NativeSelect value={row.group} onChange={e => onChange(row.id, 'group', e.target.value)}>
              {GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
            </NativeSelect>
          </Field>
        </div>
      )}
    </div>
  )
}

// ─── MULTI-SELECT CLASS POPUP (Section Mode) ──────────────────────────────────

function ClassMultiSelect({ selectedClasses, onChange, availableClasses }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  const displayText = selectedClasses.length === 0
    ? 'Click to select classes…'
    : selectedClasses.join(', ')

  const toggle = (cls) => {
    if (selectedClasses.includes(cls)) {
      onChange(selectedClasses.filter(c => c !== cls))
    } else {
      onChange([...selectedClasses, cls])
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full px-3 py-2 text-left text-[13px] rounded-lg border border-slate-200
          dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238]
          text-slate-700 dark:text-slate-200 outline-none
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all
          flex items-center justify-between gap-2"
      >
        <span className={`flex-1 truncate ${selectedClasses.length === 0 ? 'text-slate-400' : ''}`}>
          {displayText}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 rounded-xl border border-slate-200
          dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-xl overflow-hidden">
          <div className="px-3 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Select Classes ({selectedClasses.length} selected)
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5 p-3 max-h-52 overflow-y-auto">
            {availableClasses.map(cls => {
              const { fg, bg } = classBadgeColor(cls.class)
              const isSelected = selectedClasses.includes(cls.class)
              return (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => toggle(cls.class)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg text-[11px] font-semibold border transition-all
                    ${isSelected
                      ? 'border-blue-400 bg-blue-50 dark:bg-indigo-500/15 dark:border-indigo-400'
                      : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] hover:border-blue-300 dark:hover:border-indigo-400/50'
                    }`}
                >
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold relative"
                    style={{ background: bg, color: fg }}>
                    {formatAbbr(cls.class)}
                    {isSelected && (
                      <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 dark:bg-indigo-600 flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 text-white" />
                      </span>
                    )}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 text-center leading-tight"
                    style={{ fontSize: '10px' }}>
                    {cls.class.replace('Class ', 'Cl ')}
                  </span>
                </button>
              )
            })}
          </div>
          <div className="px-3 py-2 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-2">
            <button type="button" onClick={() => onChange(availableClasses.map(c => c.class))}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-600
                dark:bg-indigo-500/15 dark:text-indigo-400 hover:bg-blue-100 transition-colors">
              Select All
            </button>
            <button type="button" onClick={() => onChange([])}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-600
                dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 transition-colors">
              Clear
            </button>
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-600
                dark:bg-emerald-500/15 dark:text-emerald-400 hover:bg-emerald-100 transition-colors">
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SECTION RECORDS TABLE (Desktop) ─────────────────────────────────────────

function SectionRecordDesktop({ records, onTypeChange, onUpdate, updating }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
            {['S.No', 'Class', 'Section', 'Type', 'Action'].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {records.map((row, i) => {
            const { fg, bg } = classBadgeColor(row.class)
            return (
              <tr key={row.Sec_id}
                className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-[12px] text-slate-400 tabular-nums w-12">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                      style={{ background: bg, color: fg }}>
                      {formatAbbr(row.class)}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.class}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold
                    bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {row.Section}
                  </span>
                </td>
                <td className="px-4 py-3 min-w-[160px]">
                  <NativeSelect value={row.Type} onChange={e => onTypeChange(row.Sec_id, e.target.value)}>
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </NativeSelect>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onUpdate(row.Sec_id)}
                    disabled={updating === row.Sec_id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white
                      bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20
                      disabled:opacity-70 transition-all active:scale-95"
                  >
                    {updating === row.Sec_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    Update
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── SECTION RECORD MOBILE CARD ───────────────────────────────────────────────

function SectionRecordMobileCard({ row, idx, onTypeChange, onUpdate, updating }) {
  const { fg, bg } = classBadgeColor(row.class)
  const typeColor = row.Type === 'Cambridge'
    ? 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border-violet-100 dark:border-violet-500/20'
    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)]
      bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className="w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {formatAbbr(row.class)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
            {row.class}
            <span className="ml-2 text-[11px] font-semibold text-slate-400">Sec {row.Section}</span>
          </p>
          <span className={`inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeColor}`}>
            {row.Type}
          </span>
        </div>
        <span className="text-[11px] text-slate-400 tabular-nums">#{idx}</span>
      </div>

      <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 flex gap-2">
        <div className="flex-1">
          <NativeSelect value={row.Type} onChange={e => onTypeChange(row.Sec_id, e.target.value)}>
            {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </NativeSelect>
        </div>
        <button
          type="button"
          onClick={() => onUpdate(row.Sec_id)}
          disabled={updating === row.Sec_id}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-semibold text-white
            bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20
            disabled:opacity-70 transition-all active:scale-95 flex-shrink-0"
        >
          {updating === row.Sec_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
          Update
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ClassSectionMaster() {
  const [mode, setMode] = useState('class') // 'class' | 'section'

  // ── Class Mode State ──────────────────────────────────────────────────────
  const [classes, setClasses] = useState(() =>
    CLASS_LIST.map(c => ({ ...c, selected: c.sts }))
  )

  const handleClassChange = useCallback((id, field, value) => {
    setClasses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c))
  }, [])

  // ── Section Mode State ────────────────────────────────────────────────────
  const [sectionName,      setSectionName]      = useState('')
  const [selectedClasses,  setSelectedClasses]  = useState([])
  const [sectionType,      setSectionType]      = useState('Regular')
  const [sectionErrors,    setSectionErrors]    = useState({})

  // ── Records (Section Table) ────────────────────────────────────────────────
  const [records,   setRecords]   = useState(SECTION_RECORDS)
  const [updating,  setUpdating]  = useState(null) // Sec_id being updated

  const handleTypeChange = (secId, type) => {
    setRecords(prev => prev.map(r => r.Sec_id === secId ? { ...r, Type: type } : r))
  }

  const handleUpdate = (secId) => {
    setUpdating(secId)
    setTimeout(() => {
      setUpdating(null)
      showToast('Record updated successfully.')
    }, 700)
  }

  const handleBulkUpdate = () => {
    setUpdating('bulk')
    setTimeout(() => {
      setUpdating(null)
      showToast(`All ${records.length} records updated.`)
    }, 900)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(false)
  const [toast,   setToast]   = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleSubmit = () => {
    if (mode === 'section') {
      const err = {}
      if (!sectionName.trim()) err.sectionName = 'Section name is required'
      if (selectedClasses.length === 0) err.classes = 'Select at least one class'
      if (sectionType === '0' || !sectionType) err.type = 'Select a type'
      if (Object.keys(err).length) { setSectionErrors(err); return }
      setSectionErrors({})
    }

    const classSelections = classes.filter(c => c.selected)
    if (mode === 'class' && classSelections.length === 0) {
      showToast('Please select at least one class.', 'error')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      showToast(
        mode === 'class'
          ? `${classSelections.length} class(es) saved successfully.`
          : `Section "${sectionName}" created successfully.`
      )
    }, 800)
  }

  const handleReset = () => {
    if (mode === 'class') {
      setClasses(CLASS_LIST.map(c => ({ ...c, selected: c.sts })))
    } else {
      setSectionName('')
      setSelectedClasses([])
      setSectionType('Regular')
      setSectionErrors({})
    }
  }

  // Selected count for badge
  const selectedCount = useMemo(() => classes.filter(c => c.selected && !c.sts).length, [classes])

  return (
    <div className="space-y-4 pb-10">
      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Class Section
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Configure classes, alternate names, groups, and section types.
          </p>
        </div>
      </div>

      {/* ── Mode Toggle ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
            <Tag className="w-4 h-4 text-blue-500" />
            Mode:
          </div>
          <ModeToggle mode={mode} onChange={(m) => { setMode(m); handleReset() }} />
          {mode === 'class' && selectedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold
              bg-blue-100 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-400 ml-auto">
              <Check className="w-3.5 h-3.5" />
              {selectedCount} class{selectedCount > 1 ? 'es' : ''} selected
            </span>
          )}
        </div>
      </div>

      {/* ── CLASS MODE ──────────────────────────────────────────────────── */}
      {mode === 'class' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Class Configuration</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {classes.length} classes
            </span>
          </div>

          {/* Info hint */}
          <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              Check a class to activate it. Pre-selected (grey) classes are already active.
              Set alternate names and groups as needed.
            </p>
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No', 'Select', 'Class Name', 'Alternate Name', 'Group'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classes.map((row, i) => (
                  <ClassDesktopRow key={row.id} row={row} idx={i + 1} onChange={handleClassChange} />
                ))}
              </tbody>
            </table>
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="md:hidden p-4 space-y-2">
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              Tap the arrow to edit alternate name &amp; group.
            </p>
            {classes.map((row, i) => (
              <ClassMobileCard key={row.id} row={row} idx={i + 1} onChange={handleClassChange} />
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Submit
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION MODE ────────────────────────────────────────────────── */}
      {mode === 'section' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Section Configuration</span>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Section Name */}
              <Field label="Section Name" error={sectionErrors.sectionName} required>
                <input
                  type="text"
                  value={sectionName}
                  onChange={e => {
                    setSectionName(e.target.value)
                    setSectionErrors(p => ({ ...p, sectionName: undefined }))
                  }}
                  placeholder="e.g. A, B, C…"
                  className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                    ${sectionErrors.sectionName
                      ? 'border-rose-400 ring-2 ring-rose-100'
                      : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                    }`}
                />
              </Field>

              {/* Class Multi Select */}
              <Field label="Class Name" error={sectionErrors.classes} required>
                <ClassMultiSelect
                  selectedClasses={selectedClasses}
                  onChange={(cls) => {
                    setSelectedClasses(cls)
                    setSectionErrors(p => ({ ...p, classes: undefined }))
                  }}
                  availableClasses={classes}
                />
              </Field>

              {/* Type */}
              <Field label="Select Type" error={sectionErrors.type} required>
                <NativeSelect
                  value={sectionType}
                  onChange={e => {
                    setSectionType(e.target.value)
                    setSectionErrors(p => ({ ...p, type: undefined }))
                  }}
                  error={sectionErrors.type}
                >
                  <option value="0">-- select --</option>
                  {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </NativeSelect>
              </Field>
            </div>

            {/* Selected classes preview */}
            {selectedClasses.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-blue-50/50 dark:bg-indigo-500/[0.05] border border-blue-100 dark:border-indigo-500/20">
                <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-2">
                  Selected Classes ({selectedClasses.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {selectedClasses.map(cls => {
                    const { fg, bg } = classBadgeColor(cls)
                    return (
                      <span key={cls} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold"
                        style={{ background: bg, color: fg }}>
                        {cls}
                        <button type="button" onClick={() => setSelectedClasses(p => p.filter(c => c !== cls))}
                          className="hover:opacity-70 transition-opacity">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Submit
            </button>
          </div>
        </div>
      )}

      {/* ── SECTION RECORDS (always visible) ────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1">
            <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
            <Rows className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Section Records</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              {records.length} records
            </span>
          </div>
          <button
            type="button"
            onClick={handleBulkUpdate}
            disabled={updating === 'bulk'}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20
              disabled:opacity-70 transition-all active:scale-95 flex-shrink-0 self-start sm:self-auto"
          >
            {updating === 'bulk' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Update All
          </button>
        </div>

        {/* Info */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-emerald-50/20 dark:bg-emerald-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <p className="text-[12px] text-emerald-700 dark:text-emerald-400">
            Change type per section individually or use "Update All" for bulk update.
          </p>
        </div>

        {/* Desktop Table */}
        <SectionRecordDesktop
          records={records}
          onTypeChange={handleTypeChange}
          onUpdate={handleUpdate}
          updating={updating}
        />

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-2">
          {records.map((row, i) => (
            <SectionRecordMobileCard
              key={row.Sec_id}
              row={row}
              idx={i + 1}
              onTypeChange={handleTypeChange}
              onUpdate={handleUpdate}
              updating={updating}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span> section records
          </p>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
