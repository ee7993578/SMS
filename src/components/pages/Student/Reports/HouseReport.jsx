/**
 * HouseReport.jsx
 * Folder: src/pages/Student/Reports/HouseReport.jsx
 *
 * Converts legacy ASPX "House Report" to fully-responsive React + Tailwind.
 *
 * Filters: Session → Class → Section → House (cascading dropdowns)
 * Columns: S.No, Admission No, Student Name, Roll No, Class, Section, House, Gender
 * Features:
 *  - Cascading dropdowns (Session → Class → Section → House)
 *  - Show report + Export Excel button
 *  - Session & Class label shown in report header
 *  - Grand total footer row
 *  - Mobile: collapsible cards
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, SlidersHorizontal, Info, Search,
  BarChart3, FileSpreadsheet, BookOpen,
  School2, TrendingUp, ChevronRight,
  Shield, UserCircle2, Hash,
  Layers, GraduationCap, MapPin, Building2
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

// Sections available per class
const SECTIONS_BY_CLASS = {
  'Nursery':    ['A', 'B'],
  'LKG':        ['A', 'B'],
  'UKG':        ['A', 'B'],
  'Class I':    ['A', 'B'],
  'Class II':   ['A', 'B'],
  'Class III':  ['A'],
  'Class IV':   ['A'],
  'Class V':    ['A'],
  'Class VI':   ['A', 'B'],
  'Class VII':  ['A'],
  'Class VIII': ['A'],
  'Class IX':   ['A', 'B'],
  'Class X':    ['A'],
  'Class XI':   ['A', 'B'],
  'Class XII':  ['A', 'B'],
}

const HOUSES = ['Red House', 'Blue House', 'Green House', 'Yellow House']

const HOUSE_COLORS = {
  'Red House':    { fg: '#b91c1c', bg: '#fee2e2', accent: 'rose' },
  'Blue House':   { fg: '#1d4ed8', bg: '#dbeafe', accent: 'blue' },
  'Green House':  { fg: '#15803d', bg: '#dcfce7', accent: 'green' },
  'Yellow House': { fg: '#a16207', bg: '#fef9c3', accent: 'yellow' },
}

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// ─── GENERATE DUMMY STUDENTS ─────────────────────────────────────────────────
const FIRST_NAMES = [
  'Aarav','Aditya','Akash','Ananya','Arjun','Bhavna','Chetan','Deepak',
  'Divya','Gaurav','Ishaan','Kavya','Kunal','Manish','Meera','Neha',
  'Nikhil','Pooja','Priya','Rahul','Ravi','Rohit','Sakshi','Shreya',
  'Siddharth','Sneha','Tanvi','Tushar','Uday','Varun','Vidya','Vivek',
  'Yash','Zara','Arnav','Dhruv','Esha','Farhan','Garima','Harshit',
]
const LAST_NAMES = [
  'Sharma','Verma','Gupta','Singh','Kumar','Patel','Joshi','Mishra',
  'Tiwari','Pandey','Yadav','Chauhan','Rajput','Malik','Agarwal','Saxena',
]
const GENDERS = ['Male', 'Female']

let _studentSeed = 1
function generateStudents(cls, section, house, session, count) {
  const results = []
  const sessionPrefix = session.replace('-', '')
  for (let i = 0; i < count; i++) {
    _studentSeed++
    const seed = _studentSeed
    const fname = FIRST_NAMES[seed % FIRST_NAMES.length]
    const lname = LAST_NAMES[(seed * 3) % LAST_NAMES.length]
    const gender = GENDERS[seed % 2]
    results.push({
      adm_no:   `ADM${sessionPrefix}${String(seed * 7 + 1001).slice(-4)}`,
      name:     `${fname} ${lname}`,
      roll_no:  String(i + 1).padStart(2, '0'),
      class:    cls,
      section:  section,
      house:    house,
      gender:   gender,
    })
  }
  return results
}

// Pre-generate data for all combos (for quick lookup)
function buildStudentData() {
  const data = {}
  SESSIONS.forEach(sess => {
    data[sess] = {}
    CLASSES.forEach(cls => {
      data[sess][cls] = {}
      const sections = SECTIONS_BY_CLASS[cls] || ['A']
      sections.forEach(sec => {
        data[sess][cls][sec] = {}
        const perHouse = Math.ceil(8 + Math.random() * 6)
        HOUSES.forEach(house => {
          data[sess][cls][sec][house] = generateStudents(cls, sec, house, sess, perHouse)
        })
        // "All" = all students in this class+section
        data[sess][cls][sec]['All'] = HOUSES.flatMap(h => data[sess][cls][sec][h])
      })
      // All sections
      data[sess][cls]['All'] = {}
      data[sess][cls]['All']['All'] = Object.values(sections).flatMap(
        sec => data[sess][cls][sec]['All']
      )
      HOUSES.forEach(house => {
        data[sess][cls]['All'][house] = sections.flatMap(
          sec => data[sess][cls][sec][house]
        )
      })
    })
  })
  return data
}

const STUDENT_DATA = buildStudentData()

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const CLASS_BADGE_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classBadgeColor = (name) =>
  CLASS_BADGE_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_BADGE_COLORS.length]

const formatAbbr = (name = '') =>
  name.replace('Class ', '').slice(0, 3).toUpperCase()

const HOUSE_ACCENT_CLASSES = {
  rose:   'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
  blue:   'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
  green:  'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20',
  yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20',
}

const getHouseAccent = (house) => {
  const h = HOUSE_COLORS[house]
  return h ? HOUSE_ACCENT_CLASSES[h.accent] : HOUSE_ACCENT_CLASSES.blue
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
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    rose:   'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    green:  'bg-green-50 text-green-600 dark:bg-green-500/10 dark:text-green-400',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-500/10 dark:text-yellow-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color] ?? colors.blue}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value.toLocaleString()}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, cls, section, house }) {
  const houseInfo = HOUSE_COLORS[house]
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
          Class: {cls}
        </span>
        {section && section !== 'All' && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-[12px] font-bold text-slate-700 dark:text-slate-300">
            Section: {section}
          </span>
        )}
        {house && house !== 'All' && houseInfo && (
          <span
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-bold"
            style={{ background: houseInfo.bg, color: houseInfo.fg, borderColor: houseInfo.fg + '44' }}
          >
            <Shield className="w-3 h-3" /> {house}
          </span>
        )}
      </div>
      <p className="mt-3 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        House Report
      </p>
    </div>
  )
}

// ─── GENDER BADGE ─────────────────────────────────────────────────────────────
function GenderBadge({ gender }) {
  return gender === 'Male'
    ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">♂ Male</span>
    : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">♀ Female</span>
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  const { fg, bg } = classBadgeColor(row.class)

  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-4 py-3 text-center text-[12px] text-blue-500">—</td>
        <td className="px-4 py-3" colSpan={5}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Grand Total
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
            {row._count} Students
          </span>
        </td>
        <td className="px-4 py-3 text-center text-[12px] text-slate-400">—</td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-12">{idx}</td>

      {/* Adm No */}
      <td className="px-4 py-3">
        <span className="text-[12px] font-mono font-semibold text-slate-600 dark:text-slate-300">{row.adm_no}</span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {row.name.charAt(0)}
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Roll No */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
          {row.roll_no}
        </span>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span
            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.class)}
          </span>
          <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.class}</span>
        </div>
      </td>

      {/* Section */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {row.section}
        </span>
      </td>

      {/* House */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${getHouseAccent(row.house)} whitespace-nowrap`}>
          <Shield className="w-3 h-3 flex-shrink-0" />
          {row.house}
        </span>
      </td>

      {/* Gender */}
      <td className="px-4 py-3 text-center">
        <GenderBadge gender={row.gender} />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classBadgeColor(row.class)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
          {row.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
            <span className="font-mono">{row.adm_no}</span>
            <span>·</span>
            <span className="font-semibold" style={{ color: fg }}>{row.class} – {row.section}</span>
          </p>
        </div>

        {/* House chip */}
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border flex-shrink-0 ${getHouseAccent(row.house)}`}>
          <Shield className="w-2.5 h-2.5" />
          {row.house.replace(' House', '')}
        </span>

        <span className={`w-5 h-5 flex items-center justify-center ml-0.5 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Roll No</p>
              <p className="text-[16px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{row.roll_no}</p>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Gender</p>
              <div className="mt-0.5"><GenderBadge gender={row.gender} /></div>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">Class</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-6 h-6 rounded-md text-[9px] font-bold flex items-center justify-center" style={{ background: bg, color: fg }}>
                  {formatAbbr(row.class)}
                </span>
                <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{row.class}</span>
              </div>
            </div>
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-2.5">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-0.5">House</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border mt-0.5 ${getHouseAccent(row.house)}`}>
                <Shield className="w-2.5 h-2.5" />{row.house}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({
  open, onClose,
  session, setSession,
  cls, setCls,
  section, setSection,
  house, setHouse,
  availableSections,
  onShow, loading, errors
}) {
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
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => { setSession(e.target.value); setCls(''); setSection(''); setHouse('') }} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setSection(''); setHouse('') }} placeholder="-- Select Class --" disabled={!session} error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Section">
            <NativeSelect value={section} onChange={e => setSection(e.target.value)} placeholder="-- All Sections --" disabled={!cls}>
              {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="House">
            <NativeSelect value={house} onChange={e => setHouse(e.target.value)} placeholder="-- All Houses --" disabled={!cls}>
              {HOUSES.map(h => <option key={h} value={h}>{h}</option>)}
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
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── HOUSE DISTRIBUTION BAR ──────────────────────────────────────────────────
function HouseDistribution({ rows }) {
  const counts = useMemo(() => {
    const c = {}
    HOUSES.forEach(h => { c[h] = 0 })
    rows.forEach(r => { if (c[r.house] !== undefined) c[r.house]++ })
    return c
  }, [rows])
  const total = rows.length || 1

  return (
    <div className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
        <Shield className="w-3.5 h-3.5" /> House Distribution
      </p>
      <div className="space-y-2.5">
        {HOUSES.map(h => {
          const hc = HOUSE_COLORS[h]
          const pct = Math.round((counts[h] / total) * 100)
          return (
            <div key={h}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold" style={{ color: hc.fg }}>{h}</span>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                  {counts[h]} <span className="font-normal opacity-60">({pct}%)</span>
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: hc.fg }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HouseReport() {
  const [session,    setSession]    = useState('')
  const [cls,        setCls]        = useState('')
  const [section,    setSection]    = useState('')
  const [house,      setHouse]      = useState('')
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [meta,       setMeta]       = useState({ session: '', cls: '', section: '', house: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Available sections for selected class
  const availableSections = useMemo(() =>
    cls ? (SECTIONS_BY_CLASS[cls] || ['A']) : [],
    [cls]
  )

  // ── Fetch (simulate API) ─────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!cls)     err.cls     = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const secKey   = section || 'All'
      const houseKey = house   || 'All'

      // Navigate the data tree safely
      const sessionData = STUDENT_DATA[session] || {}
      const classData   = sessionData[cls] || {}
      const sectionData = classData[secKey] || classData['All'] || {}
      let result        = sectionData[houseKey] || sectionData['All'] || []

      // If specific section but no "All" for that house, filter manually
      if (section && house && classData[section] && classData[section][house]) {
        result = classData[section][house]
      } else if (section && !house && classData[section]) {
        result = classData[section]['All'] || []
      } else if (!section && house) {
        result = Object.values(SECTIONS_BY_CLASS[cls] || ['A'])
          .flatMap(s => (classData[s] && classData[s][house]) || [])
      } else if (!section && !house) {
        result = Object.values(SECTIONS_BY_CLASS[cls] || ['A'])
          .flatMap(s => (classData[s] && classData[s]['All']) || [])
      }

      // Deduplicate by adm_no (safety)
      const seen = new Set()
      result = result.filter(r => {
        if (seen.has(r.adm_no)) return false
        seen.add(r.adm_no)
        return true
      })

      setRows(result)
      setMeta({ session, cls, section: section || 'All', house: house || 'All' })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${result.length} student${result.length !== 1 ? 's' : ''} for ${cls}${section ? ' – Sec ' + section : ''}.`)
    }, 700)
  }, [session, cls, section, house])

  const handleReset = () => {
    setSession(''); setCls(''); setSection(''); setHouse('')
    setRows([]); setSearch(''); setErrors({})
    setShown(false); setMeta({ session: '', cls: '', section: '', house: '' })
  }

  // ── Excel Export placeholder ─────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.adm_no.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.house.toLowerCase().includes(q) ||
      r.section.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Counts ───────────────────────────────────────────────────────────────
  const maleCount   = useMemo(() => filtered.filter(r => r.gender === 'Male').length,   [filtered])
  const femaleCount = useMemo(() => filtered.filter(r => r.gender === 'Female').length, [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = [session, cls, section, house].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            House Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View students by house — filter by session, class, section &amp; house.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">

            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setCls(''); setSection(''); setHouse(''); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={cls}
                onChange={e => { setCls(e.target.value); setSection(''); setHouse(''); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select Class --"
                disabled={!session}
                error={errors.cls}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Section">
              <NativeSelect
                value={section}
                onChange={e => setSection(e.target.value)}
                placeholder="-- All Sections --"
                disabled={!cls}
              >
                {availableSections.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="House">
              <NativeSelect
                value={house}
                onChange={e => setHouse(e.target.value)}
                placeholder="-- All Houses --"
                disabled={!cls}
              >
                {HOUSES.map(h => <option key={h} value={h}>{h}</option>)}
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
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ───────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {cls ? `${cls}${section ? ' – ' + section : ''}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
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
        open={filterOpen} onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        section={section} setSection={setSection}
        house={house} setHouse={setHouse}
        availableSections={availableSections}
        onShow={handleShow} loading={loading} errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={meta.session}
            cls={meta.cls}
            section={meta.section !== 'All' ? meta.section : ''}
            house={meta.house !== 'All' ? meta.house : ''}
          />

          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}       label="Total Students" value={filtered.length}  color="blue"   />
            <SummaryCard icon={UserCircle2} label="Male Students"  value={maleCount}         color="violet" />
            <SummaryCard icon={UserCircle2} label="Female Students"value={femaleCount}        color="rose"   />
            <SummaryCard icon={GraduationCap}label="Sections Shown"
              value={meta.section !== 'All' ? 1 : availableSections.length}
              color="green"
            />
          </div>

          {/* House Distribution (only if "All Houses" shown) */}
          {meta.house === 'All' && (
            <HouseDistribution rows={filtered} />
          )}

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student List</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {meta.session}</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {meta.cls}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, house, adm no…"
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
                Showing student-wise house data. Use filters above to narrow by session, class, section, or house.
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
                      {['S.No.', 'Adm No', 'Student Name', 'Roll No', 'Class', 'Section', 'House', 'Gender'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.adm_no} row={row} idx={i + 1} />
                    ))}
                    <DesktopRow row={{ ...filtered[0], _count: filtered.length }} idx={0} isTotal />
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
                    Tap a card to see full student details.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={row.adm_no} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{filtered.length}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                          {maleCount}<span className="text-[14px] text-slate-400 mx-0.5">/</span>{femaleCount}
                        </p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Male / Female</p>
                      </div>
                    </div>
                    {/* Gender bar */}
                    <div className="mt-3">
                      <div className="flex text-[10px] font-semibold justify-between mb-1">
                        <span className="text-blue-600 dark:text-blue-400">♂ Male {filtered.length ? Math.round((maleCount/filtered.length)*100) : 0}%</span>
                        <span className="text-rose-500 dark:text-rose-400">♀ Female {filtered.length ? Math.round((femaleCount/filtered.length)*100) : 0}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500 transition-all duration-500"
                          style={{ width: `${filtered.length ? Math.round((maleCount/filtered.length)*100) : 50}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> students
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

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>Session</strong> and <strong>Class</strong>, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
