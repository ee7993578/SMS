/**
 * StuHealthStatus.jsx
 * Folder: src/pages/Configuration/StuHealthStatus.jsx
 *
 * Converts legacy ASPX "Student Health Status" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class + Term dropdown filter with validation
 *  - Show button triggers student health data grid
 *  - Editable fields: Height, Weight, Vision, Teeth, Oral Hygiene, Specific Ailment
 *  - Save button to persist health records
 *  - Desktop: rich ERP-style editable table
 *  - Mobile: card-based expandable editor per student
 *  - Summary stats header
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Info, Save,
  Heart, Activity, Users, BookOpen, Building2, MapPin,
  Stethoscope, Ruler, Weight, Eye as EyeIcon, Smile, Sparkles,
  ClipboardList, TrendingUp, Search
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const TERMS = ['Term 1', 'Term 2', 'Term 3', 'Annual']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Simulated student health data per class-term combo
const generateStudents = (className, term) => {
  const base = [
    { stu_id: 1, name: 'Aarav Sharma',     height: '142', weight: '38', vision: 'Normal',            teeth: 'Normal',            oral_hygiene: 'Normal',            Specificaliment: '' },
    { stu_id: 2, name: 'Priya Singh',       height: '138', weight: '35', vision: 'Needs Attention',   teeth: 'Normal',            oral_hygiene: 'Normal',            Specificaliment: 'Mild myopia' },
    { stu_id: 3, name: 'Rohan Verma',       height: '145', weight: '42', vision: 'Normal',            teeth: 'Needs Attention',   oral_hygiene: 'Needs Attention',   Specificaliment: '' },
    { stu_id: 4, name: 'Sneha Gupta',       height: '136', weight: '33', vision: 'Normal',            teeth: 'Normal',            oral_hygiene: 'Normal',            Specificaliment: '' },
    { stu_id: 5, name: 'Karan Mehta',       height: '150', weight: '45', vision: 'Normal',            teeth: 'Normal',            oral_hygiene: 'Normal',            Specificaliment: 'Asthma (mild)' },
    { stu_id: 6, name: 'Anjali Patel',      height: '133', weight: '31', vision: 'Needs Attention',   teeth: 'Normal',            oral_hygiene: 'Normal',            Specificaliment: '' },
    { stu_id: 7, name: 'Vikram Joshi',      height: '148', weight: '43', vision: 'Normal',            teeth: 'Normal',            oral_hygiene: 'Needs Attention',   Specificaliment: '' },
    { stu_id: 8, name: 'Neha Yadav',        height: '135', weight: '32', vision: 'Normal',            teeth: 'Needs Attention',   oral_hygiene: 'Normal',            Specificaliment: 'Tooth sensitivity' },
    { stu_id: 9, name: 'Arjun Kumar',       height: '152', weight: '47', vision: 'Normal',            teeth: 'Normal',            oral_hygiene: 'Normal',            Specificaliment: '' },
    { stu_id: 10, name: 'Pooja Rawat',      height: '130', weight: '29', vision: 'Normal',            teeth: 'Normal',            oral_hygiene: 'Normal',            Specificaliment: '' },
    { stu_id: 11, name: 'Manish Tiwari',    height: '147', weight: '41', vision: 'Needs Attention',   teeth: 'Normal',            oral_hygiene: 'Normal',            Specificaliment: 'Color blindness' },
    { stu_id: 12, name: 'Divya Negi',       height: '134', weight: '30', vision: 'Normal',            teeth: 'Normal',            oral_hygiene: 'Normal',            Specificaliment: '' },
  ]
  return base.map(s => ({ ...s, class: className, term }))
}

// Blood group options
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const HEALTH_OPTIONS = ['<-select->', 'Normal', 'Needs Attention']

// ─── CLASS COLOR HELPERS ──────────────────────────────────────────────────────

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className: cls = '' }) {
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
          disabled:opacity-50 disabled:cursor-not-allowed ${cls}
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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
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

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────

function SchoolHeader({ selectedClass, term }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
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
      <div className="flex items-center justify-center flex-wrap gap-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">Class: {selectedClass}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Term: {term}</span>
        </div>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Student Health Status
      </p>
    </div>
  )
}

// ─── INLINE TEXT INPUT (for table cells) ──────────────────────────────────────

function CellInput({ value, onChange, placeholder = '' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
        bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 outline-none
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
        placeholder-slate-300 dark:placeholder-slate-600 transition-all min-w-[70px]"
    />
  )
}

// Small inline select for table cells
function CellSelect({ value, onChange }) {
  return (
    <div className="relative min-w-[130px]">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full appearance-none pl-2.5 pr-7 py-1.5 text-[12px] rounded-lg border border-slate-200
          dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200
          outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
          cursor-pointer transition-all"
      >
        {HEALTH_OPTIONS.map(o => (
          <option key={o} value={o === '<-select->' ? '0' : o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
    </div>
  )
}

// Status badge for display
function StatusBadge({ value }) {
  if (!value || value === '0' || value === '<-select->') {
    return <span className="text-[11px] text-slate-400">—</span>
  }
  const isOk = value === 'Normal'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold
      ${isOk
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
        : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
      }`}>
      {isOk ? <Check className="w-2.5 h-2.5" /> : <AlertCircle className="w-2.5 h-2.5" />}
      {value}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ student, idx, onChange }) {
  const { fg, bg } = classColor(student.name)

  const handleField = (field, val) => onChange(student.stu_id, field, val)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10 flex-shrink-0">{idx}</td>

      {/* Student Name */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {student.name.charAt(0)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{student.name}</span>
        </div>
      </td>

      {/* Height */}
      <td className="px-3 py-2.5">
        <CellInput value={student.height} onChange={v => handleField('height', v)} placeholder="cm" />
      </td>

      {/* Weight */}
      <td className="px-3 py-2.5">
        <CellInput value={student.weight} onChange={v => handleField('weight', v)} placeholder="kg" />
      </td>

      {/* Vision */}
      <td className="px-3 py-2.5">
        <CellSelect value={student.vision} onChange={v => handleField('vision', v)} />
      </td>

      {/* Teeth */}
      <td className="px-3 py-2.5">
        <CellSelect value={student.teeth} onChange={v => handleField('teeth', v)} />
      </td>

      {/* Oral Hygiene */}
      <td className="px-3 py-2.5">
        <CellSelect value={student.oral_hygiene} onChange={v => handleField('oral_hygiene', v)} />
      </td>

      {/* Specific Ailment */}
      <td className="px-3 py-2.5">
        <CellInput
          value={student.Specificaliment}
          onChange={v => handleField('Specificaliment', v)}
          placeholder="If any…"
        />
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT HEALTH CARD ───────────────────────────────────────────────

function MobileCard({ student, idx, onChange }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(student.name)

  const handleField = (field, val) => onChange(student.stu_id, field, val)

  const hasAlert =
    student.vision === 'Needs Attention' ||
    student.teeth === 'Needs Attention' ||
    student.oral_hygiene === 'Needs Attention' ||
    student.Specificaliment

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {student.name.charAt(0)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {student.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {student.height && (
              <span className="text-[11px] text-slate-400">
                H: <span className="text-slate-600 dark:text-slate-300 font-medium">{student.height}cm</span>
              </span>
            )}
            {student.weight && (
              <span className="text-[11px] text-slate-400">
                W: <span className="text-slate-600 dark:text-slate-300 font-medium">{student.weight}kg</span>
              </span>
            )}
            {hasAlert && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 dark:text-rose-400">
                <AlertCircle className="w-2.5 h-2.5" /> Attention
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[10px] font-semibold text-slate-400">#{idx}</span>
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {/* Quick status pills */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        <StatusBadge value={student.vision} />
        <StatusBadge value={student.teeth} />
        <StatusBadge value={student.oral_hygiene} />
        {student.Specificaliment && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
            <ClipboardList className="w-2.5 h-2.5" /> {student.Specificaliment}
          </span>
        )}
      </div>

      {/* Expanded Edit Form */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-5 space-y-4">

          {/* Height & Weight row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Ruler className="w-3 h-3" /> Height (cm)
              </label>
              <input
                type="text"
                value={student.height}
                onChange={e => handleField('height', e.target.value)}
                placeholder="e.g. 140"
                className="w-full px-3 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
                  bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 outline-none
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                <Activity className="w-3 h-3" /> Weight (kg)
              </label>
              <input
                type="text"
                value={student.weight}
                onChange={e => handleField('weight', e.target.value)}
                placeholder="e.g. 38"
                className="w-full px-3 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
                  bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 outline-none
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
              />
            </div>
          </div>

          {/* Health status selects */}
          {[
            { key: 'vision',        label: 'Vision',        Icon: EyeIcon },
            { key: 'teeth',         label: 'Teeth',         Icon: Smile },
            { key: 'oral_hygiene',  label: 'Oral Hygiene',  Icon: Sparkles },
          ].map(({ key, label, Icon }) => (
            <div key={key}>
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Icon className="w-3 h-3" /> {label}
              </label>
              <div className="relative">
                <select
                  value={student[key] || '0'}
                  onChange={e => handleField(key, e.target.value)}
                  className="w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border border-slate-200
                    dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200
                    outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer transition-all"
                >
                  {HEALTH_OPTIONS.map(o => (
                    <option key={o} value={o === '<-select->' ? '0' : o}>{o}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
            </div>
          ))}

          {/* Specific Ailment */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 flex items-center gap-1.5">
              <ClipboardList className="w-3 h-3" /> Specific Ailment (If Any)
            </label>
            <input
              type="text"
              value={student.Specificaliment}
              onChange={e => handleField('Specificaliment', e.target.value)}
              placeholder="E.g. Asthma, Myopia…"
              className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
                bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 outline-none
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, selClass, setSelClass, selTerm, setSelTerm, onShow, loading, errors }) {
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
        <div className="px-5 py-5 space-y-4">
          <Field label="Select Class" error={errors.selClass} required>
            <NativeSelect
              value={selClass}
              onChange={e => setSelClass(e.target.value)}
              placeholder="-- Select Class --"
              error={errors.selClass}
            >
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Select Term" error={errors.selTerm} required>
            <NativeSelect
              value={selTerm}
              onChange={e => setSelTerm(e.target.value)}
              placeholder="-- Select Term --"
              error={errors.selTerm}
            >
              {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function StuHealthStatus() {
  const [selClass,     setSelClass]     = useState('')
  const [selTerm,      setSelTerm]      = useState('')
  const [students,     setStudents]     = useState([])
  const [loading,      setLoading]      = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownClass,   setShownClass]   = useState('')
  const [shownTerm,    setShownTerm]    = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!selClass) err.selClass = 'Please select a class'
    if (!selTerm)  err.selTerm  = 'Please select a term'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = generateStudents(selClass, selTerm)
      setStudents(data)
      setShownClass(selClass)
      setShownTerm(selTerm)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} students for ${selClass} — ${selTerm}.`)
    }, 700)
  }, [selClass, selTerm])

  // ── Field change handler ──────────────────────────────────────────────────
  const handleFieldChange = useCallback((stuId, field, value) => {
    setStudents(prev =>
      prev.map(s => s.stu_id === stuId ? { ...s, [field]: value } : s)
    )
  }, [])

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast(`Health records saved for ${shownClass} — ${shownTerm}!`)
    }, 1000)
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelClass(''); setSelTerm(''); setStudents([])
    setSearch(''); setErrors({}); setShown(false)
    setShownClass(''); setShownTerm('')
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s => s.name.toLowerCase().includes(q))
  }, [students, search])

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = filtered.length
    const visionAlert     = filtered.filter(s => s.vision === 'Needs Attention').length
    const teethAlert      = filtered.filter(s => s.teeth === 'Needs Attention').length
    const ailments        = filtered.filter(s => s.Specificaliment?.trim()).length
    return { total, visionAlert, teethAlert, ailments }
  }, [filtered])

  const hasResults   = shown && students.length > 0
  const activeFilters = (selClass ? 1 : 0) + (selTerm ? 1 : 0)

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500" />
            Student Health Status
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Record height, weight, vision, teeth, oral hygiene &amp; specific ailments per student.
          </p>
        </div>
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
            Save Records
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-rose-500 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Select Class" error={errors.selClass} required>
              <NativeSelect
                value={selClass}
                onChange={e => { setSelClass(e.target.value); setErrors(p => ({ ...p, selClass: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.selClass}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Select Term" error={errors.selTerm} required>
              <NativeSelect
                value={selTerm}
                onChange={e => { setSelTerm(e.target.value); setErrors(p => ({ ...p, selTerm: undefined })) }}
                placeholder="-- Select Term --"
                error={errors.selTerm}
              >
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            {/* spacer */}
            <div />

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
          {selClass && selTerm ? `${selClass} · ${selTerm}` : selClass || selTerm || 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
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
        selClass={selClass}
        setSelClass={setSelClass}
        selTerm={selTerm}
        setSelTerm={setSelTerm}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader selectedClass={shownClass} term={shownTerm} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}        label="Total Students"     value={stats.total}        color="blue"    />
            <SummaryCard icon={EyeIcon}      label="Vision Alerts"      value={stats.visionAlert}  color="rose"    />
            <SummaryCard icon={Smile}        label="Teeth Alerts"       value={stats.teethAlert}   color="amber"   />
            <SummaryCard icon={ClipboardList}label="Specific Ailments"  value={stats.ailments}     color="violet"  />
          </div>

          {/* Main Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
                <Stethoscope className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Health Records</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownClass} · {shownTerm}</span>
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
                Edit health data inline below. Click <strong>Save Records</strong> when done.
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
                      {['S.No.', 'Student Name', 'Height (cm)', 'Weight (kg)', 'Vision', 'Teeth', 'Oral Hygiene', 'Specific Ailment'].map((h, i) => (
                        <th key={i}
                          className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <DesktopRow
                        key={s.stu_id}
                        student={s}
                        idx={i + 1}
                        onChange={handleFieldChange}
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
                    Tap a card to edit health details.
                  </p>
                  {filtered.map((s, i) => (
                    <MobileCard
                      key={s.stu_id}
                      student={s}
                      idx={i + 1}
                      onChange={handleFieldChange}
                    />
                  ))}
                  {/* Mobile Save Button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-[14px] font-bold text-white
                        bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-70"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save All Records
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span> students
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>

          {/* Desktop Save Footer */}
          <div className="hidden sm:flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[14px] font-bold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Records
            </button>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Stethoscope className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No health data loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>Class</strong> and <strong>Term</strong>, then click <strong>Show</strong> to view and edit student health records.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
