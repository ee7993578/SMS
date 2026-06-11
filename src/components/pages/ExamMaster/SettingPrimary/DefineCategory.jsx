/**
 * DefineCategory.jsx
 * Folder: src/pages/Admin/Category/DefineCategory.jsx
 *
 * Converts legacy ASPX "Define Category" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class dropdown → filters Class Type & Header dropdowns
 *  - Category name + Order inputs
 *  - Save / Reset flow with validation
 *  - GridView → Desktop table + Mobile cards
 *  - Edit row → re-populates form
 *  - Toast notifications
 *  - Mobile bottom-drawer filter
 *  - Matches StrengthReport.jsx design language
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Save, Edit2,
  AlertCircle, X, Check, Loader2, ChevronDown,
  ChevronRight, Search, BookOpen, Layers,
  SlidersHorizontal, Info, Plus, Tag,
  GraduationCap, ListOrdered, Hash, LayoutList,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const CLASSES = [
  { id: '1',  name: 'Nursery'   },
  { id: '2',  name: 'LKG'       },
  { id: '3',  name: 'UKG'       },
  { id: '4',  name: 'Class I'   },
  { id: '5',  name: 'Class II'  },
  { id: '6',  name: 'Class III' },
  { id: '7',  name: 'Class IV'  },
  { id: '8',  name: 'Class V'   },
  { id: '9',  name: 'Class VI'  },
  { id: '10', name: 'Class VII' },
  { id: '11', name: 'Class VIII'},
  { id: '12', name: 'Class IX'  },
  { id: '13', name: 'Class X'   },
  { id: '14', name: 'Class XI'  },
  { id: '15', name: 'Class XII' },
]

const CLASS_TYPES = ['Regular', 'Cambridge']

// Headers per class (simulated server response on class select)
const HEADERS_BY_CLASS = {
  '1':  [{ id: 'h1', name: 'Language'   }, { id: 'h2', name: 'Maths' }],
  '2':  [{ id: 'h1', name: 'Language'   }, { id: 'h2', name: 'Maths' }],
  '3':  [{ id: 'h1', name: 'Language'   }, { id: 'h2', name: 'Maths' }, { id: 'h3', name: 'EVS' }],
  '4':  [{ id: 'h1', name: 'Core Subjects'  }, { id: 'h2', name: 'Activity' }],
  '5':  [{ id: 'h1', name: 'Core Subjects'  }, { id: 'h2', name: 'Activity' }],
  '6':  [{ id: 'h1', name: 'Core Subjects'  }, { id: 'h2', name: 'Co-Scholastic' }],
  '7':  [{ id: 'h1', name: 'Core Subjects'  }, { id: 'h2', name: 'Co-Scholastic' }],
  '8':  [{ id: 'h1', name: 'Core Subjects'  }, { id: 'h2', name: 'Co-Scholastic' }],
  '9':  [{ id: 'h1', name: 'Main Subjects'  }, { id: 'h2', name: 'Optional' }, { id: 'h3', name: 'Physical Education' }],
  '10': [{ id: 'h1', name: 'Main Subjects'  }, { id: 'h2', name: 'Optional' }, { id: 'h3', name: 'Physical Education' }],
  '11': [{ id: 'h1', name: 'Main Subjects'  }, { id: 'h2', name: 'Optional' }, { id: 'h3', name: 'Physical Education' }],
  '12': [{ id: 'h1', name: 'Main Subjects'  }, { id: 'h2', name: 'Optional' }, { id: 'h3', name: 'Physical Education' }],
  '13': [{ id: 'h1', name: 'Board Subjects' }, { id: 'h2', name: 'Skill Subject' }],
  '14': [{ id: 'h1', name: 'Theory'         }, { id: 'h2', name: 'Practical' }, { id: 'h3', name: 'Internal Assessment' }],
  '15': [{ id: 'h1', name: 'Theory'         }, { id: 'h2', name: 'Practical' }, { id: 'h3', name: 'Internal Assessment' }],
}

// Initial grid data
const INITIAL_RECORDS = [
  { id: 1,  class_id: '1',  class_name: 'Nursery',    classtype: 'Regular',   header_id: 'h1', header_name: 'Language',          category_id: 'c1',  category_name: 'English',           cat_order: 1  },
  { id: 2,  class_id: '1',  class_name: 'Nursery',    classtype: 'Regular',   header_id: 'h2', header_name: 'Maths',              category_id: 'c2',  category_name: 'Number Work',        cat_order: 2  },
  { id: 3,  class_id: '4',  class_name: 'Class I',    classtype: 'Regular',   header_id: 'h1', header_name: 'Core Subjects',      category_id: 'c3',  category_name: 'Hindi',              cat_order: 1  },
  { id: 4,  class_id: '4',  class_name: 'Class I',    classtype: 'Regular',   header_id: 'h1', header_name: 'Core Subjects',      category_id: 'c4',  category_name: 'English',            cat_order: 2  },
  { id: 5,  class_id: '4',  class_name: 'Class I',    classtype: 'Cambridge', header_id: 'h2', header_name: 'Activity',           category_id: 'c5',  category_name: 'Art & Craft',        cat_order: 1  },
  { id: 6,  class_id: '9',  class_name: 'Class VI',   classtype: 'Regular',   header_id: 'h1', header_name: 'Main Subjects',      category_id: 'c6',  category_name: 'Science',            cat_order: 3  },
  { id: 7,  class_id: '9',  class_name: 'Class VI',   classtype: 'Regular',   header_id: 'h2', header_name: 'Optional',           category_id: 'c7',  category_name: 'Sanskrit',           cat_order: 1  },
  { id: 8,  class_id: '12', class_name: 'Class IX',   classtype: 'Regular',   header_id: 'h1', header_name: 'Main Subjects',      category_id: 'c8',  category_name: 'Mathematics',        cat_order: 1  },
  { id: 9,  class_id: '12', class_name: 'Class IX',   classtype: 'Regular',   header_id: 'h3', header_name: 'Physical Education', category_id: 'c9',  category_name: 'PT & Sports',        cat_order: 1  },
  { id: 10, class_id: '14', class_name: 'Class XI',   classtype: 'Regular',   header_id: 'h1', header_name: 'Theory',             category_id: 'c10', category_name: 'Physics Theory',     cat_order: 1  },
  { id: 11, class_id: '14', class_name: 'Class XI',   classtype: 'Cambridge', header_id: 'h2', header_name: 'Practical',          category_id: 'c11', category_name: 'Chemistry Practical',cat_order: 2  },
  { id: 12, class_id: '15', class_name: 'Class XII',  classtype: 'Regular',   header_id: 'h3', header_name: 'Internal Assessment',category_id: 'c12', category_name: 'Project Work',       cat_order: 3  },
]

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Native select with chevron */
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

/** Form field wrapper with label + error */
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

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
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

// ─── CLASS TYPE BADGE ─────────────────────────────────────────────────────────
function ClassTypeBadge({ type }) {
  return type === 'Cambridge'
    ? <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">Cambridge</span>
    : <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300">Regular</span>
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, onEdit }) {
  const { fg, bg } = classColor(row.class_name)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{row.id}</td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}>
            {formatAbbr(row.class_name)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class_name}</span>
        </div>
      </td>

      {/* Class Type */}
      <td className="px-4 py-3 text-center"><ClassTypeBadge type={row.classtype} /></td>

      {/* Header */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold
          bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Layers className="w-3 h-3 flex-shrink-0" />
          {row.header_name}
        </span>
      </td>

      {/* Category */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold
          bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
          <Tag className="w-3 h-3 flex-shrink-0" />
          {row.category_name}
        </span>
      </td>

      {/* Order */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-bold
          bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 tabular-nums">
          {row.cat_order}
        </span>
      </td>

      {/* Edit */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white
            dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white
            transition-all active:scale-95 border border-blue-100 dark:border-blue-500/20"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class_name)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {formatAbbr(row.class_name)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.class_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {row.header_name} · <span className="font-semibold text-emerald-600 dark:text-emerald-400">{row.category_name}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ClassTypeBadge type={row.classtype} />
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50 p-3 text-center">
              <Layers className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300 leading-tight">{row.header_name}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mt-0.5">Header</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 leading-tight">{row.category_name}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Category</p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 text-center">
              <ListOrdered className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 leading-tight tabular-nums">{row.cat_order}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-0.5">Order</p>
            </div>
          </div>
          <button
            onClick={() => onEdit(row)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 transition-all active:scale-95"
          >
            <Edit2 className="w-4 h-4" /> Edit This Category
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FORM DRAWER ───────────────────────────────────────────────────────
function MobileFormDrawer({ open, onClose, children }) {
  if (!open) return null
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
        {children}
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineCategory() {
  // ── Form state ──────────────────────────────────────────────────────────────
  const [selectedClass,     setSelectedClass]     = useState('')
  const [selectedClassType, setSelectedClassType] = useState('Regular')
  const [selectedHeader,    setSelectedHeader]    = useState('')
  const [categoryName,      setCategoryName]      = useState('')
  const [orderVal,          setOrderVal]          = useState('')
  const [editId,            setEditId]            = useState(null)
  const [errors,            setErrors]            = useState({})
  const [saving,            setSaving]            = useState(false)

  // ── Grid / list state ───────────────────────────────────────────────────────
  const [records,      setRecords]      = useState(INITIAL_RECORDS)
  const [search,       setSearch]       = useState('')
  const [mobileForm,   setMobileForm]   = useState(false)
  const [toast,        setToast]        = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Available headers based on selected class
  const availableHeaders = useMemo(
    () => (selectedClass ? HEADERS_BY_CLASS[selectedClass] ?? [] : []),
    [selectedClass]
  )

  // When class changes, reset header
  const handleClassChange = (val) => {
    setSelectedClass(val)
    setSelectedHeader('')
    setErrors(p => ({ ...p, class: undefined, header: undefined }))
  }

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!selectedClass)     err.class    = 'Select a class'
    if (!selectedHeader)    err.header   = 'Select a header'
    if (!categoryName.trim()) err.category = 'Enter category name'
    if (!orderVal.trim())   err.order    = 'Enter order'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!validate()) return
    setSaving(true)

    const cls   = CLASSES.find(c => c.id === selectedClass)
    const hdr   = availableHeaders.find(h => h.id === selectedHeader)

    setTimeout(() => {
      if (editId !== null) {
        // Update existing
        setRecords(prev => prev.map(r => r.id === editId
          ? { ...r, class_id: selectedClass, class_name: cls?.name ?? '', classtype: selectedClassType,
              header_id: selectedHeader, header_name: hdr?.name ?? '',
              category_name: categoryName.trim(), cat_order: parseInt(orderVal, 10) || 0 }
          : r))
        showToast('Category updated successfully.')
      } else {
        // New record
        const newId = Math.max(...records.map(r => r.id), 0) + 1
        setRecords(prev => [...prev, {
          id: newId,
          class_id: selectedClass, class_name: cls?.name ?? '',
          classtype: selectedClassType,
          header_id: selectedHeader, header_name: hdr?.name ?? '',
          category_id: `c${newId}`, category_name: categoryName.trim(),
          cat_order: parseInt(orderVal, 10) || 0,
        }])
        showToast('Category saved successfully.')
      }
      setSaving(false)
      handleReset()
      setMobileForm(false)
    }, 600)
  }, [selectedClass, selectedClassType, selectedHeader, categoryName, orderVal, editId, records, availableHeaders])

  // ── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedClass(''); setSelectedClassType('Regular')
    setSelectedHeader(''); setCategoryName(''); setOrderVal('')
    setEditId(null); setErrors({})
  }

  // ── Edit ─────────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((row) => {
    setSelectedClass(row.class_id)
    setSelectedClassType(row.classtype)
    setSelectedHeader(row.header_id)
    setCategoryName(row.category_name)
    setOrderVal(String(row.cat_order))
    setEditId(row.id)
    setErrors({})
    // On mobile open the drawer
    setMobileForm(true)
    // On desktop scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Filtered records ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return records
    const q = search.toLowerCase()
    return records.filter(r =>
      r.class_name.toLowerCase().includes(q) ||
      r.header_name.toLowerCase().includes(q) ||
      r.category_name.toLowerCase().includes(q) ||
      r.classtype.toLowerCase().includes(q)
    )
  }, [records, search])

  // ── Stats ─────────────────────────────────────────────────────────────────────
  const uniqueClasses    = useMemo(() => new Set(records.map(r => r.class_id)).size,    [records])
  const uniqueHeaders    = useMemo(() => new Set(records.map(r => r.header_name)).size, [records])
  const uniqueCategories = records.length

  // ── Form panel (shared JSX between desktop + mobile drawer) ──────────────────
  const FormPanel = (
    <div className="p-5 space-y-4">
      {/* Row 1: Class + Class Type */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Class" error={errors.class} required>
          <NativeSelect
            value={selectedClass}
            onChange={e => handleClassChange(e.target.value)}
            placeholder="-- Select Class --"
            error={errors.class}
          >
            {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </NativeSelect>
        </Field>

        <Field label="Class Type">
          <NativeSelect
            value={selectedClassType}
            onChange={e => setSelectedClassType(e.target.value)}
          >
            {CLASS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </NativeSelect>
        </Field>
      </div>

      {/* Row 2: Header + Category */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Header" error={errors.header} required>
          <NativeSelect
            value={selectedHeader}
            onChange={e => { setSelectedHeader(e.target.value); setErrors(p => ({ ...p, header: undefined })) }}
            placeholder="-- Select Header --"
            error={errors.header}
            disabled={!selectedClass}
          >
            {availableHeaders.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
          </NativeSelect>
          {!selectedClass && (
            <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Info className="w-3 h-3" /> Select a class first
            </p>
          )}
        </Field>

        <Field label="Category" error={errors.category} required>
          <div className="relative">
            <input
              type="text"
              value={categoryName}
              onChange={e => { setCategoryName(e.target.value); setErrors(p => ({ ...p, category: undefined })) }}
              placeholder="e.g. Science, Hindi"
              className={`w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                bg-white text-slate-800 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                ${errors.category
                  ? 'border-rose-400 ring-2 ring-rose-100'
                  : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                }`}
            />
          </div>
        </Field>
      </div>

      {/* Row 3: Order (narrow) */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Field label="Order" error={errors.order} required>
          <input
            type="text"
            inputMode="numeric"
            value={orderVal}
            onChange={e => {
              const v = e.target.value.replace(/[^0-9]/g, '')
              setOrderVal(v)
              setErrors(p => ({ ...p, order: undefined }))
            }}
            placeholder="1"
            maxLength={3}
            className={`w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
              bg-white text-slate-800 placeholder-slate-300
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
              dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
              ${errors.order
                ? 'border-rose-400 ring-2 ring-rose-100'
                : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
              }`}
          />
        </Field>
      </div>
    </div>
  )

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <LayoutList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Category
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Map category names to class headers for exam structure configuration.
          </p>
        </div>

        {/* Desktop: Add button when in edit mode */}
        {editId !== null && (
          <button
            type="button"
            onClick={handleReset}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
              transition-all active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New Instead
          </button>
        )}
      </div>

      {/* ── Summary Stats ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={GraduationCap} label="Classes"    value={uniqueClasses}    color="blue"    />
        <StatCard icon={Layers}        label="Headers"    value={uniqueHeaders}    color="violet"  />
        <StatCard icon={Tag}           label="Categories" value={uniqueCategories} color="emerald" />
      </div>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* DESKTOP FORM CARD */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            {editId !== null ? 'Edit Category' : 'Define Category'}
          </span>
          {editId !== null && (
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300 flex items-center gap-1">
              <Edit2 className="w-3 h-3" /> Editing Record #{editId}
            </span>
          )}
        </div>

        {/* Form fields */}
        {FormPanel}

        {/* Footer actions */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
              dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-95 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editId !== null ? 'Update Category' : 'Save Category'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
              transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MOBILE: Floating Add / Edit button */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => { handleReset(); setMobileForm(true) }}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <Plus className="w-4 h-4" /> Add New Category
        </button>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* MOBILE DRAWER FORM */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <MobileFormDrawer open={mobileForm} onClose={() => { setMobileForm(false); handleReset() }}>
        {/* Drawer header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
              {editId !== null ? `Edit Category #${editId}` : 'Add New Category'}
            </span>
          </div>
          <button
            onClick={() => { setMobileForm(false); handleReset() }}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        {FormPanel}

        {/* Drawer footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
          <button
            type="button"
            onClick={() => { setMobileForm(false); handleReset() }}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              disabled:opacity-70 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editId !== null ? 'Update' : 'Save'}
          </button>
        </div>
      </MobileFormDrawer>

      {/* ─────────────────────────────────────────────────────────────────────── */}
      {/* GRID / LIST CARD */}
      {/* ─────────────────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Category List</span>
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
              placeholder="Search class, header, category…"
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
            Click <strong>Edit</strong> on any row to load it into the form above. Changes are reflected immediately.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No categories match your search.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Class', 'Class Type', 'Header', 'Category', 'Order', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <DesktopRow key={row.id} row={row} onEdit={handleEdit} />
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
              <span className="text-[13px]">No categories match your search.</span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to see details & edit.
              </p>
              {filtered.map(row => (
                <MobileCard key={row.id} row={row} onEdit={handleEdit} />
              ))}
            </>
          )}
        </div>

        {/* Table footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span> records
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
