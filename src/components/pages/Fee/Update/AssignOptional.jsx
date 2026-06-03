/**
 * AssignOptional.jsx
 * Folder: src/pages/Fee/AssignOptional.jsx
 *
 * Converts legacy ASPX "Assign Optional Subject (Fee)" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session / Class / Fee Head dropdowns
 *  - Student grid with per-student installment checkboxes (1–12)
 *  - Header row "Select All" checkboxes per installment column
 *  - Select All students checkbox
 *  - Submit button
 *  - Desktop: dense ERP table
 *  - Mobile: card-per-student with tabbed installment selector
 *  - Loading states, empty states, toast feedback
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  ChevronDown, RefreshCw, CheckSquare, Square,
  AlertCircle, X, Check, Loader2, Search,
  BookOpen, Users, CreditCard, CalendarDays,
  SlidersHorizontal, ChevronRight, ChevronUp,
  Save, Info, ListChecks, Banknote, UserCheck,
  Filter, CheckCheck
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  { id: 1, name: 'Nursery' },
  { id: 2, name: 'LKG' },
  { id: 3, name: 'UKG' },
  { id: 4, name: 'Class I' },
  { id: 5, name: 'Class II' },
  { id: 6, name: 'Class III' },
  { id: 7, name: 'Class IV' },
  { id: 8, name: 'Class V' },
  { id: 9, name: 'Class VI' },
  { id: 10, name: 'Class VII' },
  { id: 11, name: 'Class VIII' },
  { id: 12, name: 'Class IX' },
  { id: 13, name: 'Class X' },
  { id: 14, name: 'Class XI' },
  { id: 15, name: 'Class XII' },
]

const FEE_HEADS = [
  { id: 1, name: 'Computer Fee' },
  { id: 2, name: 'Sports Fee' },
  { id: 3, name: 'Science Lab Fee' },
  { id: 4, name: 'Art & Craft Fee' },
  { id: 5, name: 'Music Fee' },
  { id: 6, name: 'Dance Fee' },
  { id: 7, name: 'Transport Fee' },
  { id: 8, name: 'Hostel Fee' },
]

const INST_MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']

// Dummy students per class (we'll generate dynamically)
const STUDENTS_BY_CLASS = {
  1: [
    { stu_id: 101, Registration_NO: 'NRS-001', name: 'Aarav Sharma' },
    { stu_id: 102, Registration_NO: 'NRS-002', name: 'Ananya Gupta' },
    { stu_id: 103, Registration_NO: 'NRS-003', name: 'Rohan Verma' },
    { stu_id: 104, Registration_NO: 'NRS-004', name: 'Priya Singh' },
    { stu_id: 105, Registration_NO: 'NRS-005', name: 'Vivaan Kumar' },
  ],
  4: [
    { stu_id: 201, Registration_NO: 'CI-001', name: 'Ishaan Mehta' },
    { stu_id: 202, Registration_NO: 'CI-002', name: 'Diya Patel' },
    { stu_id: 203, Registration_NO: 'CI-003', name: 'Aryan Joshi' },
    { stu_id: 204, Registration_NO: 'CI-004', name: 'Kavya Reddy' },
    { stu_id: 205, Registration_NO: 'CI-005', name: 'Rehan Khan' },
    { stu_id: 206, Registration_NO: 'CI-006', name: 'Nisha Tiwari' },
  ],
  9: [
    { stu_id: 301, Registration_NO: 'CVI-001', name: 'Aditya Rao' },
    { stu_id: 302, Registration_NO: 'CVI-002', name: 'Shreya Nair' },
    { stu_id: 303, Registration_NO: 'CVI-003', name: 'Kabir Bose' },
    { stu_id: 304, Registration_NO: 'CVI-004', name: 'Tanvi Shetty' },
    { stu_id: 305, Registration_NO: 'CVI-005', name: 'Yash Malhotra' },
    { stu_id: 306, Registration_NO: 'CVI-006', name: 'Riya Chopra' },
    { stu_id: 307, Registration_NO: 'CVI-007', name: 'Arjun Das' },
  ],
  12: [
    { stu_id: 401, Registration_NO: 'CIX-001', name: 'Siddharth Pandey' },
    { stu_id: 402, Registration_NO: 'CIX-002', name: 'Meera Iyer' },
    { stu_id: 403, Registration_NO: 'CIX-003', name: 'Rahul Dubey' },
    { stu_id: 404, Registration_NO: 'CIX-004', name: 'Pooja Saxena' },
    { stu_id: 405, Registration_NO: 'CIX-005', name: 'Nikhil Agarwal' },
  ],
  14: [
    { stu_id: 501, Registration_NO: 'CXI-001', name: 'Vikram Chauhan' },
    { stu_id: 502, Registration_NO: 'CXI-002', name: 'Sneha Kapoor' },
    { stu_id: 503, Registration_NO: 'CXI-003', name: 'Manish Yadav' },
    { stu_id: 504, Registration_NO: 'CXI-004', name: 'Ankita Roy' },
    { stu_id: 505, Registration_NO: 'CXI-005', name: 'Prashant Mishra' },
    { stu_id: 506, Registration_NO: 'CXI-006', name: 'Simran Gill' },
  ],
}

// Default fallback students for any class not listed above
const DEFAULT_STUDENTS = [
  { stu_id: 901, Registration_NO: 'STD-001', name: 'Rahul Kumar' },
  { stu_id: 902, Registration_NO: 'STD-002', name: 'Priya Sharma' },
  { stu_id: 903, Registration_NO: 'STD-003', name: 'Amit Singh' },
  { stu_id: 904, Registration_NO: 'STD-004', name: 'Sunita Patel' },
]

const getStudentsForClass = (classId) => STUDENTS_BY_CLASS[classId] || DEFAULT_STUDENTS

// Build initial installment state per student (some pre-checked for demo)
const buildInitialInst = (stuId) => {
  // first 3 months pre-checked for demo
  return INST_MONTHS.map((_, i) => i < 3)
}

// ─── AVATAR / COLOR HELPERS ───────────────────────────────────────────────────

const AVATAR_COLORS = [
  { bg: '#dbeafe', fg: '#1d4ed8' },
  { bg: '#d1fae5', fg: '#065f46' },
  { bg: '#fce7f3', fg: '#9d174d' },
  { bg: '#ede9fe', fg: '#5b21b6' },
  { bg: '#fef3c7', fg: '#92400e' },
  { bg: '#cffafe', fg: '#155e75' },
  { bg: '#fee2e2', fg: '#991b1b' },
]
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 font-medium
          focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 hover:border-slate-300'}
          ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {Icon && <Icon className="w-3.5 h-3.5 text-indigo-500" />}
        {label}{required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
        ${type === 'success'
          ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white'
          : 'bg-gradient-to-r from-rose-600 to-red-600 text-white'}`}
      style={{ animation: 'toastUp .3s cubic-bezier(.34,1.56,.64,1)' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(16px) scale(.96)}to{opacity:1;transform:translateX(-50%) translateY(0) scale(1)}}`}</style>
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${type === 'success' ? 'bg-white/20' : 'bg-white/20'}`}>
        {type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      </span>
      <span className="flex-1 leading-snug">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── INSTALLMENT CHECKBOX (reusable) ─────────────────────────────────────────

function InstCheckbox({ checked, onChange, label, compact = false }) {
  return (
    <button
      type="button"
      onClick={onChange}
      title={label}
      className={`
        flex flex-col items-center justify-center transition-all duration-150 select-none
        ${compact
          ? 'w-9 h-9 rounded-lg text-[9px]'
          : 'w-10 h-10 rounded-xl text-[9px]'}
        ${checked
          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105'
          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'}
        font-bold uppercase tracking-tight
      `}
    >
      <span className={`${checked ? 'text-white' : 'text-slate-400'} text-[7px] leading-none mb-0.5`}>
        {checked ? '✓' : ''}
      </span>
      {label}
    </button>
  )
}

// ─── MOBILE STUDENT CARD ─────────────────────────────────────────────────────

function MobileStudentCard({ student, instChecked, onInstChange, selected, onSelectChange, sno }) {
  const [expanded, setExpanded] = useState(false)
  const { bg, fg } = avatarColor(student.name)
  const checkedCount = instChecked.filter(Boolean).length

  return (
    <div className={`rounded-2xl border-2 transition-all duration-200 overflow-hidden shadow-sm
      ${selected
        ? 'border-indigo-400 bg-indigo-50/60 shadow-indigo-100'
        : 'border-slate-200 bg-white'}`}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Select checkbox */}
        <button
          type="button"
          onClick={onSelectChange}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${selected
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'border-slate-300 bg-white hover:border-indigo-400'}`}
        >
          {selected && <Check className="w-3 h-3" />}
        </button>

        {/* Avatar */}
        <span
          className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-black flex-shrink-0 shadow-sm"
          style={{ background: bg, color: fg }}
        >
          {initials(student.name)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 truncate leading-tight">{student.name}</p>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">{student.Registration_NO}</p>
        </div>

        {/* Inst count badge + expand */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2.5 py-1 rounded-lg text-[11px] font-bold
            ${checkedCount === 12
              ? 'bg-emerald-100 text-emerald-700'
              : checkedCount > 0
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-slate-100 text-slate-500'}`}>
            {checkedCount}/12
          </span>
          <button
            type="button"
            onClick={() => setExpanded(p => !p)}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-indigo-100 flex items-center justify-center text-slate-500 hover:text-indigo-600 transition-all"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Installments — expanded */}
      {expanded && (
        <div className="px-4 pb-4 border-t border-slate-100">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide mt-3 mb-2.5 flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5 text-indigo-500" />
            Select Installments (Monthly)
          </p>
          {/* Quick actions */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => onInstChange(INST_MONTHS.map(() => true))}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={() => onInstChange(INST_MONTHS.map(() => false))}
              className="flex-1 py-1.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
            >
              Clear All
            </button>
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {INST_MONTHS.map((month, i) => (
              <InstCheckbox
                key={i}
                checked={instChecked[i]}
                onChange={() => {
                  const next = [...instChecked]
                  next[i] = !next[i]
                  onInstChange(next)
                }}
                label={month}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ student, instChecked, onInstChange, selected, onSelectChange, sno }) {
  const { bg, fg } = avatarColor(student.name)
  return (
    <tr className={`border-b border-slate-100 transition-colors group
      ${selected ? 'bg-indigo-50/50' : 'hover:bg-slate-50/60'}`}>

      {/* Checkbox */}
      <td className="pl-5 pr-3 py-3 w-10">
        <button
          type="button"
          onClick={onSelectChange}
          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
            ${selected
              ? 'bg-indigo-600 border-indigo-600 text-white'
              : 'border-slate-300 bg-white hover:border-indigo-400'}`}
        >
          {selected && <Check className="w-3 h-3" />}
        </button>
      </td>

      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{sno}</td>

      {/* Adm No */}
      <td className="px-3 py-3">
        <span className="font-mono text-[12px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">{student.Registration_NO}</span>
      </td>

      {/* Student */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black flex-shrink-0"
            style={{ background: bg, color: fg }}>{initials(student.name)}</span>
          <span className="text-[13px] font-semibold text-slate-700 whitespace-nowrap">{student.name}</span>
        </div>
      </td>

      {/* Installments */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1 flex-wrap">
          {INST_MONTHS.map((month, i) => (
            <InstCheckbox
              key={i}
              checked={instChecked[i]}
              onChange={() => {
                const next = [...instChecked]
                next[i] = !next[i]
                onInstChange(next)
              }}
              label={month}
              compact
            />
          ))}
        </div>
      </td>
    </tr>
  )
}

// ─── SUMMARY BAR ─────────────────────────────────────────────────────────────

function SummaryBar({ students, instMap, selectedMap }) {
  const totalSelected = Object.values(selectedMap).filter(Boolean).length
  const totalInstChecked = Object.values(instMap).flat().filter(Boolean).length
  const totalStudents = students.length

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: Users, label: 'Total Students', value: totalStudents, color: 'blue' },
        { icon: UserCheck, label: 'Selected', value: totalSelected, color: 'indigo' },
        { icon: CalendarDays, label: 'Installments Assigned', value: totalInstChecked, color: 'emerald' },
      ].map(({ icon: Icon, label, value, color }) => (
        <div key={label} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-sm
          bg-white
          ${color === 'blue' ? 'border-blue-100' : color === 'indigo' ? 'border-indigo-100' : 'border-emerald-100'}`}>
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
            ${color === 'blue' ? 'bg-blue-50 text-blue-600'
              : color === 'indigo' ? 'bg-indigo-50 text-indigo-600'
                : 'bg-emerald-50 text-emerald-600'}`}>
            <Icon className="w-5 h-5" />
          </span>
          <div>
            <p className="text-[20px] font-black text-slate-800 leading-tight tabular-nums">{value}</p>
            <p className="text-[11px] text-slate-500 font-medium">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── HEADER INSTALLMENT ROW (desktop) ────────────────────────────────────────

function HeaderInstRow({ instHeaderChecked, onHeaderInstChange }) {
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {INST_MONTHS.map((month, i) => (
        <InstCheckbox
          key={i}
          checked={instHeaderChecked[i]}
          onChange={() => onHeaderInstChange(i)}
          label={month}
          compact
        />
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AssignOptional() {
  // ── Filter state ────────────────────────────────────────────────────────────
  const [session,    setSession]   = useState('')
  const [classId,    setClassId]   = useState('')
  const [feeHeadId,  setFeeHeadId] = useState('')
  const [errors,     setErrors]    = useState({})

  // ── Table state ──────────────────────────────────────────────────────────────
  const [students,   setStudents]  = useState([])
  const [instMap,    setInstMap]   = useState({})   // { stuId: [bool x12] }
  const [selectedMap, setSelectedMap] = useState({}) // { stuId: bool }
  const [search,     setSearch]    = useState('')

  // ── UI state ─────────────────────────────────────────────────────────────────
  const [loading,    setLoading]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [toast,      setToast]     = useState(null)
  const [shown,      setShown]     = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)

  // ── Header installment state (select-all per column) ─────────────────────────
  const [instHeaderChecked, setInstHeaderChecked] = useState(INST_MONTHS.map(() => false))

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Load students ────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session)   err.session  = 'Select a session'
    if (!classId)   err.classId  = 'Select a class'
    if (!feeHeadId) err.feeHeadId = 'Select a fee head'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setFilterOpen(false)

    setTimeout(() => {
      const data = getStudentsForClass(Number(classId))
      const iMap = {}
      const sMap = {}
      data.forEach(s => {
        iMap[s.stu_id] = buildInitialInst(s.stu_id)
        sMap[s.stu_id] = false
      })
      setStudents(data)
      setInstMap(iMap)
      setSelectedMap(sMap)
      setInstHeaderChecked(INST_MONTHS.map(() => false))
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} students successfully.`)
    }, 700)
  }, [session, classId, feeHeadId])

  // ── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession(''); setClassId(''); setFeeHeadId('')
    setStudents([]); setInstMap({}); setSelectedMap({})
    setErrors({}); setShown(false); setSearch('')
    setInstHeaderChecked(INST_MONTHS.map(() => false))
  }

  // ── Select All students ───────────────────────────────────────────────────────
  const allSelected = students.length > 0 && students.every(s => selectedMap[s.stu_id])
  const someSelected = students.some(s => selectedMap[s.stu_id])

  const handleSelectAll = () => {
    const next = {}
    students.forEach(s => { next[s.stu_id] = !allSelected })
    setSelectedMap(next)
  }

  // ── Header installment column toggle ─────────────────────────────────────────
  const handleHeaderInstChange = useCallback((colIdx) => {
    const newVal = !instHeaderChecked[colIdx]
    setInstHeaderChecked(prev => {
      const next = [...prev]; next[colIdx] = newVal; return next
    })
    setInstMap(prev => {
      const next = { ...prev }
      students.forEach(s => {
        next[s.stu_id] = prev[s.stu_id].map((v, i) => i === colIdx ? newVal : v)
      })
      return next
    })
  }, [instHeaderChecked, students])

  // ── Per-student inst change ───────────────────────────────────────────────────
  const handleInstChange = useCallback((stuId, newArr) => {
    setInstMap(prev => ({ ...prev, [stuId]: newArr }))
  }, [])

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const payload = students.map(s => ({
      stu_id: s.stu_id,
      class_id: classId,
      installments: instMap[s.stu_id],
    }))
    setSubmitting(true)
    setTimeout(() => {
      console.log('Submit payload:', payload)
      setSubmitting(false)
      showToast(`Optional fee assigned for ${students.length} students!`)
    }, 1000)
  }

  // ── Search filter ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.Registration_NO.toLowerCase().includes(q)
    )
  }, [students, search])

  const hasResults = shown && students.length > 0

  // ── Selected class/session/feehead labels ────────────────────────────────────
  const sessionLabel  = session  || '—'
  const className     = CLASSES.find(c => c.id === Number(classId))?.name || '—'
  const feeHeadLabel  = FEE_HEADS.find(f => f.id === Number(feeHeadId))?.name || '—'

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── TOP NAV BAR (breadcrumb) ──────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[13px] text-slate-500 font-medium min-w-0">
            <span className="text-slate-400">Home</span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-300" />
            <span className="text-slate-400">Fee</span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0 text-slate-300" />
            <span className="text-indigo-700 font-bold truncate">Assign Optional Subject</span>
          </div>
          {/* Mobile filter trigger */}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-[12px] font-bold shadow-sm"
          >
            <Filter className="w-3.5 h-3.5" />
            Filters
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 space-y-5">

        {/* ── PAGE TITLE ─────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-[22px] sm:text-[26px] font-black text-slate-900 flex items-center gap-2.5">
              <span className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-200">
                <Banknote className="w-5 h-5 text-white" />
              </span>
              Assign Optional Subject
            </h1>
            <p className="text-[13px] text-slate-500 mt-1 ml-[52px]">
              Assign optional fee heads &amp; installments to students class-wise.
            </p>
          </div>
        </div>

        {/* ── DESKTOP FILTER CARD ──────────────────────────────────────── */}
        <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50/60 to-white">
            <span className="w-1.5 h-6 rounded-full bg-indigo-600 flex-shrink-0" />
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 flex-1">Search Filters</span>
            {(session || classId || feeHeadId) && (
              <button onClick={handleReset}
                className="flex items-center gap-1.5 text-[12px] text-rose-500 hover:text-rose-700 font-semibold transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>
          {/* Filters grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 items-end">
              <Field label="Session" required icon={CalendarDays} error={errors.session}>
                <NativeSelect
                  value={session}
                  onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                  placeholder="-- Select Session --"
                  error={errors.session}
                >
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </NativeSelect>
              </Field>

              <Field label="Class" required icon={BookOpen} error={errors.classId}>
                <NativeSelect
                  value={classId}
                  onChange={e => { setClassId(e.target.value); setErrors(p => ({ ...p, classId: undefined })) }}
                  placeholder="-- Select Class --"
                  error={errors.classId}
                >
                  {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </NativeSelect>
              </Field>

              <Field label="Fee Head" required icon={CreditCard} error={errors.feeHeadId}>
                <NativeSelect
                  value={feeHeadId}
                  onChange={e => { setFeeHeadId(e.target.value); setErrors(p => ({ ...p, feeHeadId: undefined })) }}
                  placeholder="-- Select Fee Head --"
                  error={errors.feeHeadId}
                >
                  {FEE_HEADS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </NativeSelect>
              </Field>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleShow}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white
                    bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200
                    transition-all active:scale-95 disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Show
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  title="Reset"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE FILTER DRAWER ─────────────────────────────────────── */}
        {filterOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm sm:hidden"
              onClick={() => setFilterOpen(false)}
            />
            <div
              className="fixed inset-x-0 bottom-0 z-50 sm:hidden rounded-t-3xl bg-white border-t border-slate-200 shadow-2xl"
              style={{ animation: 'drawerUp .28s cubic-bezier(.34,1.56,.64,1)' }}
            >
              <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 rounded-full bg-slate-200" />
              </div>
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-600" />
                  <span className="text-[15px] font-bold text-slate-800">Filters</span>
                </div>
                <button onClick={() => setFilterOpen(false)} className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-5 space-y-4">
                <Field label="Session" required icon={CalendarDays} error={errors.session}>
                  <NativeSelect value={session} onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                    placeholder="-- Select Session --" error={errors.session}>
                    {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </NativeSelect>
                </Field>
                <Field label="Class" required icon={BookOpen} error={errors.classId}>
                  <NativeSelect value={classId} onChange={e => { setClassId(e.target.value); setErrors(p => ({ ...p, classId: undefined })) }}
                    placeholder="-- Select Class --" error={errors.classId}>
                    {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </NativeSelect>
                </Field>
                <Field label="Fee Head" required icon={CreditCard} error={errors.feeHeadId}>
                  <NativeSelect value={feeHeadId} onChange={e => { setFeeHeadId(e.target.value); setErrors(p => ({ ...p, feeHeadId: undefined })) }}
                    placeholder="-- Select Fee Head --" error={errors.feeHeadId}>
                    {FEE_HEADS.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                  </NativeSelect>
                </Field>
              </div>
              <div className="px-5 pb-8 pt-2 flex gap-3">
                <button type="button" onClick={handleReset}
                  className="px-5 py-3 rounded-xl text-[13px] font-bold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
                  Reset
                </button>
                <button type="button" onClick={handleShow} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
                    bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all disabled:opacity-70">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Show Students
                </button>
              </div>
            </div>
          </>
        )}

        {/* ── LOADING SKELETON ─────────────────────────────────────────── */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 h-10 rounded-xl bg-slate-100 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
              </div>
            ))}
          </div>
        )}

        {/* ── RESULTS SECTION ──────────────────────────────────────────── */}
        {hasResults && !loading && (
          <>
            {/* Context ribbon */}
            <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-4 flex flex-wrap gap-3 items-center shadow-lg shadow-indigo-100">
              <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 text-white text-[12px] font-bold">
                  <CalendarDays className="w-3.5 h-3.5" /> {sessionLabel}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 text-white text-[12px] font-bold">
                  <BookOpen className="w-3.5 h-3.5" /> {className}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 text-white text-[12px] font-bold">
                  <CreditCard className="w-3.5 h-3.5" /> {feeHeadLabel}
                </span>
              </div>
              <span className="text-white/70 text-[12px] font-semibold">{students.length} students</span>
            </div>

            {/* Summary bar */}
            <SummaryBar students={students} instMap={instMap} selectedMap={selectedMap} />

            {/* Main data card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* Card header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-1.5 h-6 rounded-full bg-indigo-600 flex-shrink-0" />
                  <ListChecks className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span className="text-[14px] font-bold text-slate-700">Student Installments</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 flex-shrink-0">
                    {filtered.length} records
                  </span>
                </div>
                {/* Search */}
                <div className="relative w-full sm:w-56 flex-shrink-0">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search student…"
                    className="w-full pl-9 pr-8 py-2 text-[12px] rounded-xl border border-slate-200 outline-none
                      bg-white text-slate-700 placeholder-slate-300
                      focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                  />
                  {search && (
                    <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Info banner */}
              <div className="flex items-center gap-2 px-5 py-2.5 bg-amber-50/60 border-b border-amber-100">
                <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <p className="text-[12px] text-amber-700 font-medium">
                  Click month badges to toggle installments. Use column headers to select all students for a month.
                </p>
              </div>

              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <Search className="w-8 h-8 opacity-30" />
                  <p className="text-[13px] font-semibold">No students match your search.</p>
                  <button onClick={() => setSearch('')} className="text-[12px] text-indigo-600 hover:underline">Clear search</button>
                </div>
              ) : (
                <>
                  {/* ── DESKTOP TABLE ────────────────────────────────────── */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                      <thead>
                        <tr className="border-b-2 border-slate-100 bg-slate-50">
                          {/* Select All */}
                          <th className="pl-5 pr-3 py-3 w-10">
                            <button
                              type="button"
                              onClick={handleSelectAll}
                              title="Select All"
                              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                                ${allSelected
                                  ? 'bg-indigo-600 border-indigo-600 text-white'
                                  : someSelected
                                    ? 'bg-indigo-200 border-indigo-400 text-indigo-700'
                                    : 'border-slate-300 bg-white hover:border-indigo-400'}`}
                            >
                              {allSelected && <Check className="w-3 h-3" />}
                              {someSelected && !allSelected && <span className="w-2 h-2 rounded-sm bg-indigo-600 block" />}
                            </button>
                          </th>
                          <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 text-center w-10">S.No</th>
                          <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 text-left">Adm No.</th>
                          <th className="px-3 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 text-left">Student</th>
                          <th className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 text-left">
                            <div className="flex flex-col gap-1.5">
                              <span className="flex items-center gap-1.5 text-indigo-600">
                                <CheckCheck className="w-3.5 h-3.5" /> Installments (Click column to toggle all)
                              </span>
                              <HeaderInstRow
                                instHeaderChecked={instHeaderChecked}
                                onHeaderInstChange={handleHeaderInstChange}
                              />
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((stu, i) => (
                          <DesktopRow
                            key={stu.stu_id}
                            student={stu}
                            sno={i + 1}
                            instChecked={instMap[stu.stu_id] || INST_MONTHS.map(() => false)}
                            onInstChange={(arr) => handleInstChange(stu.stu_id, arr)}
                            selected={!!selectedMap[stu.stu_id]}
                            onSelectChange={() => setSelectedMap(p => ({ ...p, [stu.stu_id]: !p[stu.stu_id] }))}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* ── TABLET TABLE (simplified, no per-cell inst, uses cards) ── */}
                  {/* Shown on md, hidden on lg+ and hidden on mobile */}
                  <div className="hidden md:block lg:hidden">
                    {/* Select all row */}
                    <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-slate-50/40">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                          ${allSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white hover:border-indigo-400'}`}
                      >
                        {allSelected && <Check className="w-3 h-3" />}
                        {someSelected && !allSelected && <span className="w-2 h-2 rounded-sm bg-indigo-600 block" />}
                      </button>
                      <span className="text-[12px] font-bold text-slate-500">Select All Students</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {filtered.map((stu, i) => (
                        <MobileStudentCard
                          key={stu.stu_id}
                          student={stu}
                          sno={i + 1}
                          instChecked={instMap[stu.stu_id] || INST_MONTHS.map(() => false)}
                          onInstChange={(arr) => handleInstChange(stu.stu_id, arr)}
                          selected={!!selectedMap[stu.stu_id]}
                          onSelectChange={() => setSelectedMap(p => ({ ...p, [stu.stu_id]: !p[stu.stu_id] }))}
                        />
                      ))}
                    </div>
                  </div>

                  {/* ── MOBILE CARDS ───────────────────────────────────────── */}
                  <div className="md:hidden">
                    {/* Select all row */}
                    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                      <button
                        type="button"
                        onClick={handleSelectAll}
                        className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all
                          ${allSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-300 bg-white hover:border-indigo-400'}`}
                      >
                        {allSelected && <Check className="w-3.5 h-3.5" />}
                        {someSelected && !allSelected && <span className="w-2.5 h-2.5 rounded-sm bg-indigo-600 block" />}
                      </button>
                      <span className="text-[13px] font-bold text-slate-600">Select All Students</span>
                      <span className="ml-auto text-[11px] text-slate-400 font-medium">
                        {Object.values(selectedMap).filter(Boolean).length}/{students.length} selected
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      {filtered.map((stu, i) => (
                        <MobileStudentCard
                          key={stu.stu_id}
                          student={stu}
                          sno={i + 1}
                          instChecked={instMap[stu.stu_id] || INST_MONTHS.map(() => false)}
                          onInstChange={(arr) => handleInstChange(stu.stu_id, arr)}
                          selected={!!selectedMap[stu.stu_id]}
                          onSelectChange={() => setSelectedMap(p => ({ ...p, [stu.stu_id]: !p[stu.stu_id] }))}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Footer with record count + submit */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/40">
                <p className="text-[12px] text-slate-400">
                  Showing <span className="font-bold text-slate-700">{filtered.length}</span> of{' '}
                  <span className="font-bold text-slate-700">{students.length}</span> students
                </p>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white
                    bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700
                    shadow-md shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Submit
                </button>
              </div>
            </div>

            {/* Mobile sticky submit */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 px-4 py-4 bg-white/95 backdrop-blur border-t border-slate-200 shadow-2xl">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-[15px] font-black text-white
                  bg-gradient-to-r from-indigo-600 to-violet-600 shadow-xl shadow-indigo-300
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Submit Assignment
              </button>
            </div>
            {/* Spacer for mobile sticky button */}
            <div className="sm:hidden h-24" />
          </>
        )}

        {/* ── EMPTY STATE ────────────────────────────────────────────────── */}
        {!hasResults && !loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-5 text-slate-400">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center shadow-inner">
              <Banknote className="w-10 h-10 text-indigo-400" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-[16px] font-bold text-slate-500 mb-1">No Data Loaded</p>
              <p className="text-[13px] text-slate-400 leading-relaxed">
                Select a <strong>Session</strong>, <strong>Class</strong>, and <strong>Fee Head</strong>, then click <strong>Show</strong> to load students.
              </p>
            </div>
            {/* Quick guide chips */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {['1. Select Session', '2. Select Class', '3. Select Fee Head', '4. Click Show'].map(step => (
                <span key={step} className="px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-[12px] font-bold border border-indigo-100">
                  {step}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
