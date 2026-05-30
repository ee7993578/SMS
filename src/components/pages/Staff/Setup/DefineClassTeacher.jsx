/**
 * DefineClassTeacher.jsx
 * Folder: src/pages/Configuration/DefineClassTeacher.jsx
 *
 * Converts legacy ASPX "Define Class Teacher" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session header display
 *  - GridView with Class, Section, Class Teacher dropdown, Co-Class Teacher dropdown
 *  - Desktop: dense ERP-style table with dropdowns
 *  - Mobile: collapsible cards with inline dropdowns
 *  - Submit / Save button with toast feedback
 *  - Loading states, empty states
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ChevronDown, Check, AlertCircle, X, Loader2,
  UserCog, Users, BookOpen, School2,
  Save, RefreshCw, ChevronRight, Info,
  Building2, MapPin, GraduationCap, UserCheck,
  SlidersHorizontal, CheckCircle2
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const CURRENT_SESSION = '2025-26'

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// All available teachers for dropdown
const TEACHERS = [
  { id: '',   name: '-- Select Teacher --' },
  { id: 't1', name: 'Rajesh Kumar Sharma' },
  { id: 't2', name: 'Priya Mehta' },
  { id: 't3', name: 'Amit Singh Rawat' },
  { id: 't4', name: 'Sunita Devi Joshi' },
  { id: 't5', name: 'Deepak Chandra Pant' },
  { id: 't6', name: 'Kavita Bhandari' },
  { id: 't7', name: 'Mohan Lal Verma' },
  { id: 't8', name: 'Neha Gupta' },
  { id: 't9', name: 'Vikas Negi' },
  { id: 't10', name: 'Anita Rana' },
  { id: 't11', name: 'Suresh Bisht' },
  { id: 't12', name: 'Pooja Arora' },
  { id: 't13', name: 'Rakesh Thakur' },
  { id: 't14', name: 'Meena Kumari' },
  { id: 't15', name: 'Harish Bhatt' },
]

// Class-section data (simulating DB fetch)
const CLASS_SECTIONS = [
  { f_id: 'cs1',  f_id_co: 'co1',  class_id: 'cls1', class_name: 'Nursery',    sec_id: 's1',  section: 'A' },
  { f_id: 'cs2',  f_id_co: 'co2',  class_id: 'cls1', class_name: 'Nursery',    sec_id: 's2',  section: 'B' },
  { f_id: 'cs3',  f_id_co: 'co3',  class_id: 'cls2', class_name: 'LKG',        sec_id: 's3',  section: 'A' },
  { f_id: 'cs4',  f_id_co: 'co4',  class_id: 'cls2', class_name: 'LKG',        sec_id: 's4',  section: 'B' },
  { f_id: 'cs5',  f_id_co: 'co5',  class_id: 'cls3', class_name: 'UKG',        sec_id: 's5',  section: 'A' },
  { f_id: 'cs6',  f_id_co: 'co6',  class_id: 'cls3', class_name: 'UKG',        sec_id: 's6',  section: 'B' },
  { f_id: 'cs7',  f_id_co: 'co7',  class_id: 'cls4', class_name: 'Class I',    sec_id: 's7',  section: 'A' },
  { f_id: 'cs8',  f_id_co: 'co8',  class_id: 'cls4', class_name: 'Class I',    sec_id: 's8',  section: 'B' },
  { f_id: 'cs9',  f_id_co: 'co9',  class_id: 'cls5', class_name: 'Class II',   sec_id: 's9',  section: 'A' },
  { f_id: 'cs10', f_id_co: 'co10', class_id: 'cls5', class_name: 'Class II',   sec_id: 's10', section: 'B' },
  { f_id: 'cs11', f_id_co: 'co11', class_id: 'cls6', class_name: 'Class III',  sec_id: 's11', section: 'A' },
  { f_id: 'cs12', f_id_co: 'co12', class_id: 'cls7', class_name: 'Class IV',   sec_id: 's12', section: 'A' },
  { f_id: 'cs13', f_id_co: 'co13', class_id: 'cls8', class_name: 'Class V',    sec_id: 's13', section: 'A' },
  { f_id: 'cs14', f_id_co: 'co14', class_id: 'cls9', class_name: 'Class VI',   sec_id: 's14', section: 'A' },
  { f_id: 'cs15', f_id_co: 'co15', class_id: 'cls9', class_name: 'Class VI',   sec_id: 's15', section: 'B' },
  { f_id: 'cs16', f_id_co: 'co16', class_id: 'cls10',class_name: 'Class VII',  sec_id: 's16', section: 'A' },
  { f_id: 'cs17', f_id_co: 'co17', class_id: 'cls11',class_name: 'Class VIII', sec_id: 's17', section: 'A' },
  { f_id: 'cs18', f_id_co: 'co18', class_id: 'cls12',class_name: 'Class IX',   sec_id: 's18', section: 'A' },
  { f_id: 'cs19', f_id_co: 'co19', class_id: 'cls12',class_name: 'Class IX',   sec_id: 's19', section: 'B' },
  { f_id: 'cs20', f_id_co: 'co20', class_id: 'cls13',class_name: 'Class X',    sec_id: 's20', section: 'A' },
  { f_id: 'cs21', f_id_co: 'co21', class_id: 'cls14',class_name: 'Class XI',   sec_id: 's21', section: 'A' },
  { f_id: 'cs22', f_id_co: 'co22', class_id: 'cls14',class_name: 'Class XI',   sec_id: 's22', section: 'B' },
  { f_id: 'cs23', f_id_co: 'co23', class_id: 'cls15',class_name: 'Class XII',  sec_id: 's23', section: 'A' },
  { f_id: 'cs24', f_id_co: 'co24', class_id: 'cls15',class_name: 'Class XII',  sec_id: 's24', section: 'B' },
]

// Pre-assigned teachers (simulate existing data from DB)
const EXISTING_ASSIGNMENTS = {
  'cs1':  { teacher: 't1',  coTeacher: 't2'  },
  'cs2':  { teacher: 't3',  coTeacher: ''    },
  'cs7':  { teacher: 't4',  coTeacher: 't5'  },
  'cs14': { teacher: 't6',  coTeacher: 't7'  },
  'cs18': { teacher: 't8',  coTeacher: 't9'  },
  'cs21': { teacher: 't10', coTeacher: 't11' },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

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

/** Styled native select dropdown */
function TeacherSelect({ value, onChange, disabled, id }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none pl-3 pr-8 py-2 text-[12px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-700 border-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {TEACHERS.map(t => (
          <option key={t.id} value={t.id}>{t.name}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
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
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

/** Summary stat card — top stats row */
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
      bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
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

/** School header banner */
function SchoolHeader({ session }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)]
      bg-gradient-to-r from-blue-50 via-white to-indigo-50
      dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35]
      px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Define Class Teacher
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, assignments, onTeacherChange, onCoTeacherChange, saving }) {
  const { fg, bg } = classColor(row.class_name)
  const assignment = assignments[row.f_id] || { teacher: '', coTeacher: '' }
  const hasTeacher = !!assignment.teacher
  const hasCoTeacher = !!assignment.coTeacher

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.class_name)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {row.class_name}
          </span>
        </div>
      </td>

      {/* Section */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold
          bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {row.section}
        </span>
      </td>

      {/* Class Teacher */}
      <td className="px-4 py-3 min-w-[200px]">
        <div className="relative">
          <TeacherSelect
            id={`teacher-${row.f_id}`}
            value={assignment.teacher}
            onChange={e => onTeacherChange(row.f_id, e.target.value)}
            disabled={saving}
          />
          {hasTeacher && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </div>
      </td>

      {/* Co-Class Teacher */}
      <td className="px-4 py-3 min-w-[200px]">
        <div className="relative">
          <TeacherSelect
            id={`co-teacher-${row.f_id_co}`}
            value={assignment.coTeacher}
            onChange={e => onCoTeacherChange(row.f_id, e.target.value)}
            disabled={saving}
          />
          {hasCoTeacher && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <Check className="w-2.5 h-2.5 text-white" />
            </span>
          )}
        </div>
      </td>

      {/* Status indicator */}
      <td className="px-4 py-3 text-center w-20">
        {hasTeacher ? (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold
            bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Done
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold
            bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Pending
          </span>
        )}
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, assignments, onTeacherChange, onCoTeacherChange, saving }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class_name)
  const assignment = assignments[row.f_id] || { teacher: '', coTeacher: '' }
  const hasTeacher = !!assignment.teacher
  const hasCoTeacher = !!assignment.coTeacher

  const teacherName = hasTeacher
    ? TEACHERS.find(t => t.id === assignment.teacher)?.name || ''
    : null
  const coTeacherName = hasCoTeacher
    ? TEACHERS.find(t => t.id === assignment.coTeacher)?.name || ''
    : null

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm transition-all
      ${hasTeacher
        ? 'border-emerald-200 dark:border-emerald-500/25'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'}`}>

      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left
          hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {formatAbbr(row.class_name)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {row.class_name}
            <span className="ml-2 text-[12px] font-semibold text-slate-400 dark:text-slate-500">
              Sec {row.section}
            </span>
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {hasTeacher
              ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{teacherName}</span>
              : <span className="text-amber-500 font-medium">No teacher assigned</span>
            }
          </p>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {hasTeacher ? (
            <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </span>
          ) : (
            <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            </span>
          )}
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {/* Expanded Assignment Form */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-5 space-y-4">

          {/* Class Teacher */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide
              text-slate-500 dark:text-slate-400 mb-2">
              <UserCog className="w-3.5 h-3.5 text-blue-500" />
              Class Teacher
              <span className="text-rose-500">*</span>
            </label>
            <TeacherSelect
              id={`mob-teacher-${row.f_id}`}
              value={assignment.teacher}
              onChange={e => onTeacherChange(row.f_id, e.target.value)}
              disabled={saving}
            />
            {assignment.teacher && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                {TEACHERS.find(t => t.id === assignment.teacher)?.name}
              </p>
            )}
          </div>

          {/* Co-Class Teacher */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide
              text-slate-500 dark:text-slate-400 mb-2">
              <Users className="w-3.5 h-3.5 text-violet-500" />
              Co-Class Teacher
            </label>
            <TeacherSelect
              id={`mob-co-teacher-${row.f_id_co}`}
              value={assignment.coTeacher}
              onChange={e => onCoTeacherChange(row.f_id, e.target.value)}
              disabled={saving}
            />
            {assignment.coTeacher && (
              <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-violet-600 dark:text-violet-400 font-medium">
                <CheckCircle2 className="w-3 h-3" />
                {TEACHERS.find(t => t.id === assignment.coTeacher)?.name}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineClassTeacher() {
  const [rows,        setRows]        = useState([])
  const [assignments, setAssignments] = useState({})
  const [loading,     setLoading]     = useState(true)
  const [saving,      setSaving]      = useState(false)
  const [toast,       setToast]       = useState(null)
  const [filter,      setFilter]      = useState('all') // 'all' | 'assigned' | 'pending'

  // ── Show toast ─────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Initial data load (simulate API) ───────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    setTimeout(() => {
      setRows(CLASS_SECTIONS)
      setAssignments(EXISTING_ASSIGNMENTS)
      setLoading(false)
    }, 700)
  }, [])

  // ── Handle class teacher change ────────────────────────────────────────────
  const handleTeacherChange = useCallback((f_id, value) => {
    setAssignments(prev => ({
      ...prev,
      [f_id]: { ...(prev[f_id] || { coTeacher: '' }), teacher: value }
    }))
  }, [])

  // ── Handle co-class teacher change ─────────────────────────────────────────
  const handleCoTeacherChange = useCallback((f_id, value) => {
    setAssignments(prev => ({
      ...prev,
      [f_id]: { ...(prev[f_id] || { teacher: '' }), coTeacher: value }
    }))
  }, [])

  // ── Handle submit ──────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const unassigned = rows.filter(r => !assignments[r.f_id]?.teacher)
    if (unassigned.length > 0) {
      showToast(`${unassigned.length} class(es) have no Class Teacher assigned.`, 'error')
      return
    }
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      showToast(`Class teachers defined successfully for session ${CURRENT_SESSION}!`)
    }, 1200)
  }, [rows, assignments])

  // ── Handle reset ───────────────────────────────────────────────────────────
  const handleReset = () => {
    setAssignments(EXISTING_ASSIGNMENTS)
    showToast('Changes reset to last saved state.')
  }

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const assigned    = rows.filter(r => !!assignments[r.f_id]?.teacher).length
    const coAssigned  = rows.filter(r => !!assignments[r.f_id]?.coTeacher).length
    const pending     = rows.length - assigned
    return { total: rows.length, assigned, coAssigned, pending }
  }, [rows, assignments])

  // ── Filter rows ────────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    if (filter === 'assigned') return rows.filter(r => !!assignments[r.f_id]?.teacher)
    if (filter === 'pending')  return rows.filter(r => !assignments[r.f_id]?.teacher)
    return rows
  }, [rows, assignments, filter])

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Class Teacher
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Assign class teacher &amp; co-class teacher for each section — Session{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{CURRENT_SESSION}</span>
          </p>
        </div>

        {/* Desktop action buttons */}
        {!loading && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
                dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70"
            >
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Define Class Teacher'}
            </button>
          </div>
        )}
      </div>

      {/* ── Loading Skeleton ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
          bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
              style={{ opacity: 1 - i * 0.12 }}
            />
          ))}
        </div>
      )}

      {/* ── Main Content ─────────────────────────────────────────────────────── */}
      {!loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={CURRENT_SESSION} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={School2}     label="Total Sections"      value={stats.total}      color="blue"    />
            <SummaryCard icon={UserCog}     label="Teachers Assigned"   value={stats.assigned}   color="emerald" />
            <SummaryCard icon={Users}       label="Co-Teachers Assigned" value={stats.coAssigned} color="violet"  />
            <SummaryCard icon={GraduationCap} label="Pending Sections"  value={stats.pending}    color="amber"   />
          </div>

          {/* Main Table Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
            bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5
              border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
              bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                  Class-Section Assignment
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                  bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filteredRows.length} records
                </span>
              </div>

              {/* Filter Tabs */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1 flex-shrink-0">
                {[
                  { key: 'all',      label: 'All',      count: stats.total    },
                  { key: 'assigned', label: 'Assigned', count: stats.assigned },
                  { key: 'pending',  label: 'Pending',  count: stats.pending  },
                ].map(tab => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilter(tab.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all
                      ${filter === tab.key
                        ? 'bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-100 shadow-sm'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                  >
                    {tab.label}
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
                      ${filter === tab.key
                        ? tab.key === 'pending'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                          : tab.key === 'assigned'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Info hint */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100
              dark:border-[rgba(99,102,241,0.07)] bg-blue-50/30 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Assign one <strong>Class Teacher</strong> (required) and optionally a <strong>Co-Class Teacher</strong> per section.
                Click Save when done.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filteredRows.length === 0 ? (
                <EmptyState label="No records match the selected filter." />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]
                      bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Class', 'Section', 'Class Teacher', 'Co-Class Teacher', 'Status'].map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide
                            text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => (
                      <DesktopRow
                        key={row.f_id}
                        row={row}
                        idx={i + 1}
                        assignments={assignments}
                        onTeacherChange={handleTeacherChange}
                        onCoTeacherChange={handleCoTeacherChange}
                        saving={saving}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filteredRows.length === 0 ? (
                <EmptyState label="No records match the selected filter." />
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium
                    flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to assign teachers.
                  </p>
                  {filteredRows.map((row, i) => (
                    <MobileCard
                      key={row.f_id}
                      row={row}
                      idx={i + 1}
                      assignments={assignments}
                      onTeacherChange={handleTeacherChange}
                      onCoTeacherChange={handleCoTeacherChange}
                      saving={saving}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5
              border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
              bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">{stats.assigned}</span>
                &nbsp;assigned ·&nbsp;
                <span className="font-semibold text-amber-600 dark:text-amber-400">{stats.pending}</span>
                &nbsp;pending of&nbsp;
                <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.total}</span>
                &nbsp;sections
              </p>

              {/* Progress bar */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="w-24 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${stats.total ? (stats.assigned / stats.total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  {stats.total ? Math.round((stats.assigned / stats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* ── MOBILE Submit Button ─────────────────────────────────────────── */}
          <div className="md:hidden fixed bottom-0 left-0 right-0 z-30
            bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)]
            px-4 py-3 shadow-2xl">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={saving}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
                  transition-colors disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
                  bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/25
                  transition-all active:scale-[0.98] disabled:opacity-70"
              >
                {saving
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Save className="w-4 h-4" />}
                {saving ? 'Saving...' : 'Define Class Teacher'}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ label }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <UserCheck className="w-6 h-6 opacity-40" />
      </div>
      <p className="text-[13px] text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  )
}
