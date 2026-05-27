/**
 * BirthdayReport.jsx
 * Folder: src/components/pages/BirthdayReport.jsx
 *
 * Rebuilt from: Reports/Configuration/birthday_report.aspx
 * Stack: React + Tailwind CSS + Lucide Icons
 * Responsive: Mobile cards | Tablet adaptive | Desktop table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Cake, Search, Filter, RefreshCw, Download,
  ChevronDown, X, Loader2, SlidersHorizontal,
  User, Users, GraduationCap, CalendarDays,
  Phone, AlertCircle, Info, ChevronRight,
  FileSpreadsheet, Printer, Mail
} from 'lucide-react'

// ─── STATIC DUMMY DATA ───────────────────────────────────────────────────────

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)

const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
]

const STUDENT_DATA = [
  { id: 1,  name: 'Aarav Sharma',       dob: '2014-01-05', class: 'Class V-A',   contact: '9876543210', type: 'Student', gender: 'Male'   },
  { id: 2,  name: 'Ananya Singh',        dob: '2014-01-12', class: 'Class V-B',   contact: '9876543211', type: 'Student', gender: 'Female' },
  { id: 3,  name: 'Arjun Verma',         dob: '2013-01-18', class: 'Class VI-A',  contact: '9876543212', type: 'Student', gender: 'Male'   },
  { id: 4,  name: 'Diya Gupta',          dob: '2015-01-22', class: 'Class IV-A',  contact: '9876543213', type: 'Student', gender: 'Female' },
  { id: 5,  name: 'Ishaan Tiwari',       dob: '2012-02-03', class: 'Class VII-A', contact: '9876543214', type: 'Student', gender: 'Male'   },
  { id: 6,  name: 'Kavya Yadav',         dob: '2015-02-14', class: 'Class IV-B',  contact: '9876543215', type: 'Student', gender: 'Female' },
  { id: 7,  name: 'Mohit Rastogi',       dob: '2016-02-20', class: 'Class III-A', contact: '9876543216', type: 'Student', gender: 'Male'   },
  { id: 8,  name: 'Neha Agarwal',        dob: '2014-03-07', class: 'Class V-C',   contact: '9876543217', type: 'Student', gender: 'Female' },
  { id: 9,  name: 'Priya Mishra',        dob: '2013-03-15', class: 'Class VI-B',  contact: '9876543218', type: 'Student', gender: 'Female' },
  { id: 10, name: 'Rahul Joshi',         dob: '2011-03-28', class: 'Class VIII-A',contact: '9876543219', type: 'Student', gender: 'Male'   },
  { id: 11, name: 'Rohan Dubey',         dob: '2010-04-02', class: 'Class IX-A',  contact: '9876543220', type: 'Student', gender: 'Male'   },
  { id: 12, name: 'Sneha Pandey',        dob: '2015-04-18', class: 'Class IV-C',  contact: '9876543221', type: 'Student', gender: 'Female' },
  { id: 13, name: 'Tanvi Srivastava',    dob: '2009-04-25', class: 'Class X-A',   contact: '9876543222', type: 'Student', gender: 'Female' },
  { id: 14, name: 'Vikas Chauhan',       dob: '2008-05-10', class: 'Class XI-A',  contact: '9876543223', type: 'Student', gender: 'Male'   },
  { id: 15, name: 'Yash Kumar',          dob: '2016-05-22', class: 'Class III-B', contact: '9876543224', type: 'Student', gender: 'Male'   },
]

const FACULTY_DATA = [
  { id: 101, name: 'Rajesh Kumar',       dob: '1985-01-08', class: 'Mathematics',  contact: '9812345001', type: 'Faculty', gender: 'Male'   },
  { id: 102, name: 'Sunita Sharma',      dob: '1988-01-19', class: 'English',       contact: '9812345002', type: 'Faculty', gender: 'Female' },
  { id: 103, name: 'Deepak Mishra',      dob: '1980-02-11', class: 'Science',       contact: '9812345003', type: 'Faculty', gender: 'Male'   },
  { id: 104, name: 'Meena Patel',        dob: '1990-02-25', class: 'Hindi',         contact: '9812345004', type: 'Faculty', gender: 'Female' },
  { id: 105, name: 'Anil Tiwari',        dob: '1982-03-04', class: 'Social Studies',contact: '9812345005', type: 'Faculty', gender: 'Male'   },
  { id: 106, name: 'Priya Yadav',        dob: '1992-03-21', class: 'Computer',      contact: '9812345006', type: 'Faculty', gender: 'Female' },
  { id: 107, name: 'Sanjay Gupta',       dob: '1978-04-09', class: 'Physical Ed.',  contact: '9812345007', type: 'Faculty', gender: 'Male'   },
  { id: 108, name: 'Kavita Singh',       dob: '1987-04-30', class: 'Art & Craft',   contact: '9812345008', type: 'Faculty', gender: 'Female' },
  { id: 109, name: 'Ramesh Dubey',       dob: '1983-05-14', class: 'Chemistry',     contact: '9812345009', type: 'Faculty', gender: 'Male'   },
  { id: 110, name: 'Anjali Verma',       dob: '1991-05-27', class: 'Biology',       contact: '9812345010', type: 'Faculty', gender: 'Female' },
]

// ─── AVATAR COLORS ────────────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  ['#1d4ed8', '#dbeafe'], ['#7c3aed', '#ede9fe'], ['#0891b2', '#cffafe'],
  ['#059669', '#d1fae5'], ['#d97706', '#fef3c7'], ['#dc2626', '#fee2e2'],
  ['#db2777', '#fce7f3'], ['#0369a1', '#e0f2fe'],
]
const getAvatarColors = (name) =>
  AVATAR_PALETTE[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length]

// Get day/month from dob string
const parseDob = (dob) => {
  const d = new Date(dob)
  return {
    day:   d.getDate(),
    month: String(d.getMonth() + 1).padStart(2, '0'),
    monthName: MONTHS[d.getMonth()].label,
    fullDate: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
  }
}

// Days until next birthday
const daysUntilBirthday = (dob) => {
  const today = new Date()
  const bday = new Date(dob)
  const next = new Date(today.getFullYear(), bday.getMonth(), bday.getDate())
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  const diff = Math.ceil((next - today) / (1000 * 60 * 60 * 24))
  return diff === 0 ? 'Today! 🎂' : diff === 1 ? 'Tomorrow!' : `In ${diff} days`
}

// ─── SMALL REUSABLE COMPONENTS ────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-rose-400 dark:border-rose-500/60'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }
          ${className}`}
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
    <div className="flex flex-col gap-1.5">
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
      style={{ animation: 'toastSlide .25s ease' }}
    >
      {type === 'success'
        ? <Cake className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes toastSlide{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// Type badge: Student or Faculty
function TypeBadge({ type }) {
  const isStudent = type === 'Student'
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0
      ${isStudent
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
        : 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400'
      }`}>
      {isStudent ? <GraduationCap className="w-3 h-3" /> : <Users className="w-3 h-3" />}
      {type}
    </span>
  )
}

// Birthday countdown badge
function CountdownBadge({ dob }) {
  const text = daysUntilBirthday(dob)
  const isToday    = text.startsWith('Today')
  const isTomorrow = text.startsWith('Tomorrow')
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold flex-shrink-0
      ${isToday
        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 animate-pulse'
        : isTomorrow
          ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400'
          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
      }`}>
      <Cake className="w-3 h-3 flex-shrink-0" />
      {text}
    </span>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({
  open, onClose,
  fromDay, setFromDay, fromMonth, setFromMonth,
  toDay, setToDay, toMonth, setToMonth,
  selType, setSelType,
  errors, onSearch, loading,
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35]
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .28s cubic-bezier(.4,0,.2,1)' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Cake className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Birthday Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4 max-h-[55vh] overflow-y-auto">
          {/* From Date */}
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              From Date <span className="text-rose-500">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Day" error={errors.fromDay}>
                <NativeSelect value={fromDay} onChange={e => setFromDay(e.target.value)} placeholder="Day" error={errors.fromDay}>
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Month" error={errors.fromMonth}>
                <NativeSelect value={fromMonth} onChange={e => setFromMonth(e.target.value)} placeholder="Month" error={errors.fromMonth}>
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </NativeSelect>
              </Field>
            </div>
          </div>

          {/* To Date */}
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              To Date <span className="text-rose-500">*</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Day">
                <NativeSelect value={toDay} onChange={e => setToDay(e.target.value)} placeholder="Day">
                  {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Month">
                <NativeSelect value={toMonth} onChange={e => setToMonth(e.target.value)} placeholder="Month">
                  {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </NativeSelect>
              </Field>
            </div>
          </div>

          {/* Type */}
          <Field label="Select Type" error={errors.selType} required>
            <NativeSelect value={selType} onChange={e => setSelType(e.target.value)} placeholder="-- Select Type --" error={errors.selType}>
              <option value="Faculty">Faculty</option>
              <option value="Student">Student</option>
            </NativeSelect>
          </Field>
        </div>

        {/* CTA */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button"
            onClick={() => { onSearch(); onClose() }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 shadow-md shadow-blue-500/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Search
          </button>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const [fg, bg] = getAvatarColors(row.name)
  const { monthName, fullDate } = parseDob(row.dob)
  const isStudent = row.type === 'Student'

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]
      hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">

      {/* S.No */}
      <td className="px-4 py-3 text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Name + Avatar */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{row.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.gender}</p>
          </div>
        </div>
      </td>

      {/* Class / Department */}
      <td className="px-4 py-3">
        <span className="text-[12.5px] text-slate-600 dark:text-slate-300 font-medium">{row.class}</span>
      </td>

      {/* DOB */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="text-[12.5px] text-slate-600 dark:text-slate-300">{fullDate}</span>
        </div>
      </td>

      {/* Month */}
      <td className="px-4 py-3">
        <span className="text-[12.5px] font-medium text-slate-600 dark:text-slate-300">{monthName}</span>
      </td>

      {/* Contact */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="text-[12px] font-mono text-slate-600 dark:text-slate-300">{row.contact}</span>
        </div>
      </td>

      {/* Type */}
      <td className="px-4 py-3">
        <TypeBadge type={row.type} />
      </td>

      {/* Countdown */}
      <td className="px-4 py-3">
        <CountdownBadge dob={row.dob} />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const [fg, bg] = getAvatarColors(row.name)
  const { monthName, fullDate } = parseDob(row.dob)
  const countdown = daysUntilBirthday(row.dob)
  const isToday = countdown.startsWith('Today')

  return (
    <div className={`rounded-xl border overflow-hidden bg-white dark:bg-[#1a1f35] transition-all
      ${isToday
        ? 'border-amber-300 dark:border-amber-500/40 shadow-sm shadow-amber-100 dark:shadow-amber-500/5'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'
      }`}>

      {/* Card Top — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
      >
        {/* S.No + Avatar */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums w-5 text-center">{idx}</span>
          <span
            className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        </div>

        {/* Name + info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
            {isToday && <Cake className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{row.class}</p>
        </div>

        {/* Countdown badge */}
        <CountdownBadge dob={row.dob} />

        {/* Expand */}
        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ml-1 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="px-4 pb-4 pt-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]
          grid grid-cols-2 gap-3">

          {/* DOB */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Date of Birth</p>
            <div className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="text-[12.5px] text-slate-700 dark:text-slate-200 font-medium">{fullDate}</span>
            </div>
          </div>

          {/* Month */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Month</p>
            <span className="text-[12.5px] text-slate-700 dark:text-slate-200 font-medium">{monthName}</span>
          </div>

          {/* Type */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Type</p>
            <TypeBadge type={row.type} />
          </div>

          {/* Contact */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Contact</p>
            <div className="flex items-center gap-1.5">
              <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="text-[12px] font-mono text-slate-600 dark:text-slate-300">{row.contact}</span>
            </div>
          </div>

          {/* Gender — full width */}
          <div className="col-span-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Gender</p>
            <span className="text-[12.5px] text-slate-700 dark:text-slate-200 font-medium">{row.gender}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SUMMARY STAT MINI CARD ───────────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, color }) {
  const colorMap = {
    blue:   'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    violet: 'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/20',
    amber:  'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
    emerald:'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
  }
  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${colorMap[color]}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div>
        <p className="text-[18px] font-bold leading-tight">{value}</p>
        <p className="text-[11px] opacity-75 font-medium">{label}</p>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function BirthdayReport() {
  // Filter state
  const [fromDay,   setFromDay]   = useState('')
  const [fromMonth, setFromMonth] = useState('')
  const [toDay,     setToDay]     = useState('')
  const [toMonth,   setToMonth]   = useState('')
  const [selType,   setSelType]   = useState('')

  // Data & UI state
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [hasSearched,setHasSearched]= useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [activeTab,  setActiveTab]  = useState('All') // All | Student | Faculty

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!fromDay)   err.fromDay   = 'Select day'
    if (!fromMonth) err.fromMonth = 'Select month'
    if (!selType)   err.selType   = 'Select type'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Search ─────────────────────────────────────────────────────────────────
  const handleSearch = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setSearch('')
    setActiveTab('All')

    setTimeout(() => {
      // Pick source by type
      const source = selType === 'Faculty' ? FACULTY_DATA : STUDENT_DATA

      // Filter by month range (day+month from → to)
      const fMonth = parseInt(fromMonth, 10)
      const tMonth = toMonth ? parseInt(toMonth, 10) : fMonth
      const fDay   = fromDay ? parseInt(fromDay, 10) : 1
      const tDay   = toDay   ? parseInt(toDay, 10)   : 31

      const result = source.filter(p => {
        const d = new Date(p.dob)
        const m = d.getMonth() + 1
        const day = d.getDate()

        if (fMonth === tMonth) {
          return m === fMonth && day >= fDay && day <= tDay
        }
        // Cross-month range
        if (m === fMonth) return day >= fDay
        if (m === tMonth) return day <= tDay
        return m > fMonth && m < tMonth
      })

      setRows(result)
      setHasSearched(true)
      setLoading(false)

      if (result.length === 0) {
        showToast('No birthdays found in the selected range.', 'error')
      } else {
        showToast(`${result.length} birthday${result.length > 1 ? 's' : ''} found!`)
      }
    }, 700)
  }, [fromDay, fromMonth, toDay, toMonth, selType])

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFromDay(''); setFromMonth(''); setToDay(''); setToMonth(''); setSelType('')
    setRows([]); setSearch(''); setActiveTab('All')
    setErrors({}); setHasSearched(false)
  }

  // ── Filtered rows (search + tab) ───────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = rows
    if (activeTab !== 'All') r = r.filter(x => x.type === activeTab)
    if (search) r = r.filter(x =>
      x.name.toLowerCase().includes(search.toLowerCase()) ||
      x.class.toLowerCase().includes(search.toLowerCase()) ||
      x.contact.includes(search)
    )
    return r
  }, [rows, activeTab, search])

  const counts = useMemo(() => ({
    total:    rows.length,
    students: rows.filter(r => r.type === 'Student').length,
    faculty:  rows.filter(r => r.type === 'Faculty').length,
    today:    rows.filter(r => daysUntilBirthday(r.dob).startsWith('Today')).length,
  }), [rows])

  const hasResults = rows.length > 0

  // ── From date label ────────────────────────────────────────────────────────
  const fromLabel = fromDay && fromMonth
    ? `${fromDay} ${MONTHS.find(m => m.value === fromMonth)?.label}`
    : null
  const toLabel = toDay && toMonth
    ? `${toDay} ${MONTHS.find(m => m.value === toMonth)?.label}`
    : null

  // ── Tab Pill ───────────────────────────────────────────────────────────────
  const TabPill = ({ label, value, count, color }) => (
    <button
      type="button"
      onClick={() => setActiveTab(value)}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all flex-shrink-0
        ${activeTab === value
          ? color === 'blue'   ? 'bg-blue-500 text-white shadow-sm'
          : color === 'violet' ? 'bg-violet-500 text-white shadow-sm'
                               : 'bg-slate-700 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
        }`}
    >
      {label}
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full
        ${activeTab === value
          ? 'bg-white/25 text-white'
          : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-400'}`}>
        {count}
      </span>
    </button>
  )

  return (
    <div className="space-y-4 pb-8 page-animate">

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1e3a8a,#4f46e5)', boxShadow: '0 4px 12px rgba(30,58,138,0.3)' }}>
            <Cake className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Birthday Report
            </h1>
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
              View upcoming birthdays for students &amp; faculty by date range.
            </p>
          </div>
        </div>

        {/* Export buttons — visible only after search, desktop */}
        {hasResults && (
          <div className="hidden sm:flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20 transition-colors">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 dark:hover:bg-blue-500/20 transition-colors">
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
        bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">

            {/* From Date — Day + Month side by side */}
            <div className="sm:col-span-1">
              <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                From Date <span className="text-rose-500">*</span>
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <NativeSelect
                    value={fromDay}
                    onChange={e => { setFromDay(e.target.value); setErrors(p => ({...p, fromDay: undefined})) }}
                    placeholder="Day"
                    error={errors.fromDay}
                  >
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </NativeSelect>
                  {errors.fromDay && <p className="text-[10px] text-rose-500 mt-0.5">{errors.fromDay}</p>}
                </div>
                <div className="flex-1">
                  <NativeSelect
                    value={fromMonth}
                    onChange={e => { setFromMonth(e.target.value); setErrors(p => ({...p, fromMonth: undefined})) }}
                    placeholder="Month"
                    error={errors.fromMonth}
                  >
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </NativeSelect>
                  {errors.fromMonth && <p className="text-[10px] text-rose-500 mt-0.5">{errors.fromMonth}</p>}
                </div>
              </div>
            </div>

            {/* To Date */}
            <div className="sm:col-span-1">
              <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
                To Date
              </p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <NativeSelect value={toDay} onChange={e => setToDay(e.target.value)} placeholder="Day">
                    {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                  </NativeSelect>
                </div>
                <div className="flex-1">
                  <NativeSelect value={toMonth} onChange={e => setToMonth(e.target.value)} placeholder="Month">
                    {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                  </NativeSelect>
                </div>
              </div>
            </div>

            {/* Type */}
            <Field label="Select Type" error={errors.selType} required>
              <NativeSelect
                value={selType}
                onChange={e => { setSelType(e.target.value); setErrors(p => ({...p, selType: undefined})) }}
                placeholder="-- Select Type --"
                error={errors.selType}
              >
                <option value="Faculty">Faculty</option>
                <option value="Student">Student</option>
              </NativeSelect>
            </Field>

            {/* Actions */}
            <div className="flex gap-2 items-end col-span-1 xl:col-span-2">
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold
                  text-white transition-all active:scale-95 disabled:opacity-70
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Search
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold
                  transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
            shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {(fromDay || fromMonth || selType) && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {[fromDay, fromMonth, selType].filter(Boolean).length}
            </span>
          )}
        </button>
        {hasResults && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        fromDay={fromDay} setFromDay={setFromDay}
        fromMonth={fromMonth} setFromMonth={setFromMonth}
        toDay={toDay} setToDay={setToDay}
        toMonth={toMonth} setToMonth={setToMonth}
        selType={selType} setSelType={setSelType}
        errors={errors} onSearch={handleSearch} loading={loading}
      />

      {/* ── RESULTS ──────────────────────────────────────────────────────────── */}
      {hasResults && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
          bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Results header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5
            border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
            bg-slate-50/70 dark:bg-white/[0.02]">

            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-amber-400 flex-shrink-0" />
              <Cake className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Results</span>

              {/* Date range label */}
              {fromLabel && (
                <span className="text-[12px] text-slate-400 dark:text-slate-500 flex-shrink-0">
                  · {fromLabel}{toLabel ? ` → ${toLabel}` : ''} · {selType}
                </span>
              )}
            </div>

            {/* Search input */}
            <div className="relative w-full sm:w-56 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, class…"
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

          {/* Mini stats row */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]
            bg-slate-50/30 dark:bg-white/[0.01] overflow-x-auto">
            <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
              <MiniStat label="Total" value={counts.total} icon={Cake}          color="amber" />
              <MiniStat label="Students" value={counts.students} icon={GraduationCap} color="blue" />
              <MiniStat label="Faculty"  value={counts.faculty}  icon={Users}         color="violet" />
              {counts.today > 0 && (
                <MiniStat label="Today!"   value={counts.today}   icon={Cake}          color="emerald" />
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2 px-5 py-3
            border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]
            bg-slate-50/30 dark:bg-white/[0.01] overflow-x-auto">
            <TabPill label="All"     value="All"     count={counts.total}    color="slate" />
            <TabPill label="Student" value="Student" count={counts.students} color="blue" />
            <TabPill label="Faculty" value="Faculty" count={counts.faculty}  color="violet" />
          </div>

          {/* Hint */}
          <div className="hidden sm:flex items-center gap-2 px-5 py-2
            border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)]
            bg-blue-50/30 dark:bg-blue-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              Showing birthdays between{' '}
              <strong>{fromLabel || '—'}</strong> and{' '}
              <strong>{toLabel || fromLabel || '—'}</strong> for <strong>{selType}</strong>.
              Tap headers to sort (coming soon).
            </p>
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <Search className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No records match your search.</span>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]
                    bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No', 'Name', 'Class / Dept', 'Date of Birth', 'Month', 'Contact', 'Type', 'Countdown'].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide
                        text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <DesktopRow key={row.id} row={row} idx={i + 1} />
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
                <span className="text-[13px]">No records match your search.</span>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap a card to see full details.
                </p>
                {filtered.map((row, i) => (
                  <MobileCard key={row.id} row={row} idx={i + 1} />
                ))}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4
            border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
            bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500 text-center sm:text-left">
              Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{filtered.length}</span>{' '}
              of <span className="font-semibold text-slate-600 dark:text-slate-300">{counts.total}</span> records
              {counts.today > 0 && (
                <> · <span className="text-amber-600 dark:text-amber-400 font-semibold">{counts.today} birthday{counts.today > 1 ? 's' : ''} today! 🎂</span></>
              )}
            </p>

            {/* Mobile export buttons */}
            <div className="flex gap-2 sm:hidden">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20">
                <Printer className="w-3.5 h-3.5" /> Print
              </button>
            </div>

            {/* Desktop: total count */}
            <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-slate-400">
              <Cake className="w-3.5 h-3.5 text-amber-400" />
              <span>{counts.students} Students · {counts.faculty} Faculty</span>
            </div>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE (before first search) ─────────────────────────────────── */}
      {!hasResults && !loading && !hasSearched && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.08), rgba(79,70,229,0.08))' }}>
            <Cake className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No results yet</p>
            <p className="text-[12.5px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
              Select a date range and type (Student / Faculty), then click <strong>Search</strong> to view birthday records.
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[13px] text-slate-500 dark:text-slate-400">Fetching birthday records…</p>
        </div>
      )}

      {/* After search, no results */}
      {hasSearched && !loading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Cake className="w-7 h-7 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No birthdays found</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Try a different date range or type.
            </p>
          </div>
          <button onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}

      {/* Toast notification */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
