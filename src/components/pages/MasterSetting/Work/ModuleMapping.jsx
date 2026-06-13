/**
 * ModuleMapping.jsx
 * Folder: src/pages/Admin/ModuleMapping.jsx
 *
 * Converts legacy ASPX "Module Mapping" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Module dropdown selector
 *  - Class multi-select with checkbox grid
 *  - Save mapping functionality
 *  - GridView of saved mappings (module → class list)
 *  - Desktop: clean ERP table layout
 *  - Mobile: card-based touch-friendly layout
 *  - Toast notifications, loading states, empty states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BookOpen, Save, Layers, School2, Check, X,
  AlertCircle, Loader2, ChevronDown, Info,
  SlidersHorizontal, Search, RefreshCw,
  LayoutGrid, Tag, CheckSquare, Square,
  Trash2, Edit3, ClipboardList, ChevronRight,
  BookMarked, GraduationCap, Shield
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const MODULES = [
  { id: '1', name: 'Attendance Management' },
  { id: '2', name: 'Fee Management' },
  { id: '3', name: 'Examination Management' },
  { id: '4', name: 'Library Management' },
  { id: '5', name: 'Transport Management' },
  { id: '6', name: 'Hostel Management' },
  { id: '7', name: 'Result Management' },
  { id: '8', name: 'Timetable Management' },
]

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III',
  'Class IV', 'Class V', 'Class VI',
  'Class VII', 'Class VIII', 'Class IX',
  'Class X', 'Class XI', 'Class XII',
]

const INITIAL_MAPPINGS = [
  { id: 1, module_name: 'Attendance Management', classname: 'Class I, Class II, Class III, Class IV, Class V' },
  { id: 2, module_name: 'Fee Management', classname: 'Nursery, LKG, UKG, Class I, Class II' },
  { id: 3, module_name: 'Examination Management', classname: 'Class VI, Class VII, Class VIII, Class IX, Class X, Class XI, Class XII' },
  { id: 4, module_name: 'Library Management', classname: 'Class III, Class IV, Class V, Class VI, Class VII' },
  { id: 5, module_name: 'Transport Management', classname: 'All Classes' },
]

// ─── COLOR HELPERS ─────────────────────────────────────────────────────────────

const MODULE_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe', accent: 'blue' },
  { fg: '#7c3aed', bg: '#ede9fe', accent: 'violet' },
  { fg: '#0891b2', bg: '#cffafe', accent: 'cyan' },
  { fg: '#059669', bg: '#d1fae5', accent: 'emerald' },
  { fg: '#d97706', bg: '#fef3c7', accent: 'amber' },
  { fg: '#dc2626', bg: '#fee2e2', accent: 'red' },
  { fg: '#0369a1', bg: '#e0f2fe', accent: 'sky' },
  { fg: '#7e22ce', bg: '#f3e8ff', accent: 'purple' },
]

const moduleColor = (name = '') =>
  MODULE_COLORS[(name.charCodeAt(0) ?? 0) % MODULE_COLORS.length]

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Toast notification */
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

/** Field wrapper with label + error */
function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="ml-1 text-[10px] font-normal normal-case text-slate-400 dark:text-slate-500">
            ({hint})
          </span>
        )}
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

/** Native select dropdown */
function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
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
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

// ─── CLASS CHECKBOX GRID ──────────────────────────────────────────────────────

function ClassCheckboxGrid({ selected, onChange, error }) {
  const toggleClass = (cls) => {
    if (selected.includes(cls)) {
      onChange(selected.filter(c => c !== cls))
    } else {
      onChange([...selected, cls])
    }
  }

  const toggleAll = () => {
    if (selected.length === CLASSES.length) {
      onChange([])
    } else {
      onChange([...CLASSES])
    }
  }

  const allSelected = selected.length === CLASSES.length
  const someSelected = selected.length > 0 && selected.length < CLASSES.length

  return (
    <div className="space-y-2">
      {/* Select All toggle */}
      <button
        type="button"
        onClick={toggleAll}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all
          ${allSelected
            ? 'bg-blue-600 text-white border-blue-600'
            : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 dark:bg-[#1e2238] dark:text-slate-300 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      >
        {allSelected
          ? <CheckSquare className="w-3.5 h-3.5" />
          : someSelected
            ? <CheckSquare className="w-3.5 h-3.5 text-blue-500" />
            : <Square className="w-3.5 h-3.5" />
        }
        {allSelected ? 'Deselect All' : 'Select All'}
        {selected.length > 0 && (
          <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${allSelected ? 'bg-white/20' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'}`}>
            {selected.length}/{CLASSES.length}
          </span>
        )}
      </button>

      {/* Checkbox grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 p-3 rounded-xl border transition-all
        ${error
          ? 'border-rose-300 bg-rose-50/30 dark:border-rose-500/30'
          : 'border-slate-200 bg-slate-50/50 dark:border-[rgba(99,102,241,0.15)] dark:bg-white/[0.015]'
        }`}
      >
        {CLASSES.map((cls) => {
          const isSelected = selected.includes(cls)
          return (
            <button
              key={cls}
              type="button"
              onClick={() => toggleClass(cls)}
              className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-semibold text-left transition-all
                ${isSelected
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:bg-[#1e2238] dark:text-slate-300 dark:border-[rgba(99,102,241,0.2)] dark:hover:border-indigo-400'
                }`}
            >
              <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 text-[9px]
                ${isSelected ? 'bg-white/20' : 'border border-slate-300 dark:border-slate-600'}`}
              >
                {isSelected && <Check className="w-3 h-3" />}
              </span>
              <span className="truncate leading-tight">{cls}</span>
            </button>
          )
        })}
      </div>

      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx, onDelete }) {
  const { fg, bg } = moduleColor(row.module_name)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12 font-medium">
        {idx}
      </td>

      {/* Module Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {getInitials(row.module_name)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
            {row.module_name}
          </span>
        </div>
      </td>

      {/* Classes */}
      <td className="px-4 py-3">
        <div className="flex flex-wrap gap-1.5">
          {row.classname.split(',').map((cls, i) => (
            <span key={i}
              className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold
                bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400"
            >
              {cls.trim()}
            </span>
          ))}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center w-24">
        <button
          onClick={() => onDelete(row.id)}
          className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg
            text-[11px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-all"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Remove
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE MAPPING CARD ──────────────────────────────────────────────────────

function MobileMappingCard({ row, idx, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = moduleColor(row.module_name)
  const classList = row.classname.split(',').map(c => c.trim())

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {getInitials(row.module_name)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.module_name}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {classList.length} class{classList.length !== 1 ? 'es' : ''} mapped
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
            {classList.length}
          </span>
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
            Mapped Classes
          </p>
          <div className="flex flex-wrap gap-1.5">
            {classList.map((cls, i) => (
              <span key={i}
                className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-semibold
                  bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20"
              >
                {cls}
              </span>
            ))}
          </div>
          <button
            onClick={() => onDelete(row.id)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-[12px] font-semibold text-rose-600
              bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 border border-rose-100 dark:border-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove Mapping
          </button>
        </div>
      )}
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ModuleMapping() {
  const [selectedModule, setSelectedModule] = useState('')
  const [selectedClasses, setSelectedClasses] = useState([])
  const [mappings, setMappings] = useState(INITIAL_MAPPINGS)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & Save ───────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const err = {}
    if (!selectedModule) err.module = 'Please select a module'
    if (selectedClasses.length === 0) err.classes = 'Please select at least one class'

    if (Object.keys(err).length) {
      setErrors(err)
      return
    }
    setErrors({})
    setSaving(true)

    // Simulate API call
    setTimeout(() => {
      const moduleName = MODULES.find(m => m.id === selectedModule)?.name || ''
      const classStr = selectedClasses.length === CLASSES.length
        ? 'All Classes'
        : selectedClasses.join(', ')

      // Update existing or add new
      const existingIdx = mappings.findIndex(m => m.module_name === moduleName)
      if (existingIdx >= 0) {
        setMappings(prev => prev.map((m, i) =>
          i === existingIdx ? { ...m, classname: classStr } : m
        ))
        showToast(`Mapping updated for "${moduleName}"`)
      } else {
        const newMapping = {
          id: Date.now(),
          module_name: moduleName,
          classname: classStr,
        }
        setMappings(prev => [...prev, newMapping])
        showToast(`Mapping saved for "${moduleName}"`)
      }

      // Reset form
      setSelectedModule('')
      setSelectedClasses([])
      setSaving(false)
    }, 700)
  }, [selectedModule, selectedClasses, mappings])

  const handleReset = () => {
    setSelectedModule('')
    setSelectedClasses([])
    setErrors({})
  }

  const handleDelete = (id) => {
    setMappings(prev => prev.filter(m => m.id !== id))
    showToast('Mapping removed successfully')
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return mappings
    const q = search.toLowerCase()
    return mappings.filter(m =>
      m.module_name.toLowerCase().includes(q) ||
      m.classname.toLowerCase().includes(q)
    )
  }, [mappings, search])

  const totalClassMappings = useMemo(() => {
    return mappings.reduce((sum, m) => {
      const count = m.classname === 'All Classes' ? CLASSES.length : m.classname.split(',').length
      return sum + count
    }, 0)
  }, [mappings])

  return (
    <div className="space-y-5 pb-10">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Module Mapping
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Assign modules to classes — control which features are available per class level.
          </p>
        </div>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SummaryCard icon={BookMarked} label="Total Modules"   value={MODULES.length}      color="blue"    />
        <SummaryCard icon={Layers}     label="Active Mappings" value={mappings.length}      color="emerald" />
        <SummaryCard icon={GraduationCap} label="Class Links"  value={totalClassMappings}   color="violet"  />
      </div>

      {/* ── FORM CARD ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Add / Update Mapping</span>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-5">

          {/* Module Select */}
          <Field label="Module Name" required error={errors.module}>
            <NativeSelect
              value={selectedModule}
              onChange={e => {
                setSelectedModule(e.target.value)
                setErrors(p => ({ ...p, module: undefined }))
              }}
              placeholder="-- Select Module --"
              error={errors.module}
            >
              {MODULES.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </NativeSelect>
          </Field>

          {/* Class Checkboxes */}
          <Field
            label="Select Classes"
            required
            hint="choose one or more"
            error={errors.classes}
          >
            <ClassCheckboxGrid
              selected={selectedClasses}
              onChange={(val) => {
                setSelectedClasses(val)
                setErrors(p => ({ ...p, classes: undefined }))
              }}
              error={errors.classes}
            />
          </Field>

          {/* Selected preview */}
          {selectedClasses.length > 0 && (
            <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-500/[0.07] border border-blue-100 dark:border-blue-500/20">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                <span className="font-bold">{selectedClasses.length} class{selectedClasses.length > 1 ? 'es' : ''} selected:</span>{' '}
                {selectedClasses.slice(0, 5).join(', ')}
                {selectedClasses.length > 5 && ` +${selectedClasses.length - 5} more`}
              </p>
            </div>
          )}
        </div>

        {/* Form Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/40 dark:bg-white/[0.01]">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
              dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-95 disabled:opacity-70"
          >
            {saving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />
            }
            {saving ? 'Saving…' : 'Save Mapping'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
        </div>
      </div>

      {/* ── MAPPINGS TABLE / LIST ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Saved Mappings</span>
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
              placeholder="Search module or class…"
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
            Saving a module that already exists will update its class mapping. Hover a row to remove it.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-600">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                  {search ? 'No results match your search.' : 'No mappings saved yet.'}
                </p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">
                  {search ? 'Try a different search term.' : 'Use the form above to add a module mapping.'}
                </p>
              </div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['Sr.No.', 'Module Name', 'Classes Mapped', 'Actions'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12 last:text-center last:w-24">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.id} row={row} idx={i + 1} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
              <ClipboardList className="w-8 h-8 opacity-30" />
              <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
                {search ? 'No results found.' : 'No mappings yet.'}
              </p>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to view mapped classes or remove mapping.
              </p>
              {filtered.map((row, i) => (
                <MobileMappingCard
                  key={row.id}
                  row={row}
                  idx={i + 1}
                  onDelete={handleDelete}
                />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{mappings.length}</span> mappings
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
