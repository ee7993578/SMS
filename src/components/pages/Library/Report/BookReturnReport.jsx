/**
 * BookReturnReport.jsx
 * Folder: src/pages/Library/Reports/BookReturnReport.jsx
 *
 * Converts legacy ASPX "Book Issue Return Details" report to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Member Id, Member Type, Member Name, Class, Item Acc No, Name,
 *          Issue Date, Return Date, Due Date
 *
 * Features:
 *  - Category radio (Student / Faculty)
 *  - Session dropdown filter
 *  - From date / To date pickers
 *  - Show report button + Excel export
 *  - School name header in report
 *  - Mobile: collapsible cards with expandable details
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, Calendar, BookOpen,
  SlidersHorizontal, Info, Search,
  FileSpreadsheet, School2,
  MapPin, Building2, ChevronRight,
  GraduationCap, UserCog, BadgeCheck,
  CalendarCheck, CalendarClock, CalendarX
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CATEGORIES = [
  { value: 'Student', label: 'Student', icon: GraduationCap },
  { value: 'Faculty', label: 'Faculty', icon: UserCog },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Sample return-records data, keyed by category
const RETURN_DATA = {
  Student: [
    { member_id: 'STU-1042', member_type: 'Student', member_name: 'Ananya Sharma', class: 'Class IX-A', item_acc_no: 'ACC-2210', name: 'Physics NCERT Part 1', issue_date: '02 Jun 2026', return_date: '10 Jun 2026', due_date: '09 Jun 2026' },
    { member_id: 'STU-1055', member_type: 'Student', member_name: 'Rohan Verma', class: 'Class X-B', item_acc_no: 'ACC-1187', name: 'Modern History of India', issue_date: '28 May 2026', return_date: '11 Jun 2026', due_date: '11 Jun 2026' },
    { member_id: 'STU-1078', member_type: 'Student', member_name: 'Priya Singh', class: 'Class VIII-A', item_acc_no: 'ACC-0945', name: 'English Grammar Workbook', issue_date: '01 Jun 2026', return_date: '09 Jun 2026', due_date: '08 Jun 2026' },
    { member_id: 'STU-1090', member_type: 'Student', member_name: 'Karan Mehta', class: 'Class XII-A', item_acc_no: 'ACC-3301', name: 'Organic Chemistry Vol 2', issue_date: '25 May 2026', return_date: '08 Jun 2026', due_date: '07 Jun 2026' },
    { member_id: 'STU-1103', member_type: 'Student', member_name: 'Sneha Gupta', class: 'Class VII-B', item_acc_no: 'ACC-0782', name: 'World of Science Vol 1', issue_date: '30 May 2026', return_date: '10 Jun 2026', due_date: '10 Jun 2026' },
    { member_id: 'STU-1115', member_type: 'Student', member_name: 'Aditya Joshi', class: 'Class XI-B', item_acc_no: 'ACC-2876', name: 'Mathematics for Class XI', issue_date: '27 May 2026', return_date: '07 Jun 2026', due_date: '05 Jun 2026' },
    { member_id: 'STU-1128', member_type: 'Student', member_name: 'Ishita Rao', class: 'Class VI-A', item_acc_no: 'ACC-0654', name: 'Tales from Panchatantra', issue_date: '03 Jun 2026', return_date: '11 Jun 2026', due_date: '11 Jun 2026' },
    { member_id: 'STU-1140', member_type: 'Student', member_name: 'Vivaan Kapoor', class: 'Class X-A', item_acc_no: 'ACC-1209', name: 'Computer Science Basics', issue_date: '29 May 2026', return_date: '06 Jun 2026', due_date: '06 Jun 2026' },
  ],
  Faculty: [
    { member_id: 'FAC-0021', member_type: 'Faculty', member_name: 'Mrs. Anita Desai', class: '-', item_acc_no: 'ACC-4410', name: 'Teaching Pedagogy Handbook', issue_date: '20 May 2026', return_date: '10 Jun 2026', due_date: '09 Jun 2026' },
    { member_id: 'FAC-0034', member_type: 'Faculty', member_name: 'Mr. Sanjay Pillai', class: '-', item_acc_no: 'ACC-4502', name: 'Advanced Physics Reference', issue_date: '15 May 2026', return_date: '08 Jun 2026', due_date: '08 Jun 2026' },
    { member_id: 'FAC-0047', member_type: 'Faculty', member_name: 'Ms. Lata Nair', class: '-', item_acc_no: 'ACC-4598', name: 'Classroom Management Guide', issue_date: '22 May 2026', return_date: '11 Jun 2026', due_date: '10 Jun 2026' },
    { member_id: 'FAC-0058', member_type: 'Faculty', member_name: 'Mr. Vikram Chauhan', class: '-', item_acc_no: 'ACC-4623', name: 'Mathematics Olympiad Guide', issue_date: '18 May 2026', return_date: '09 Jun 2026', due_date: '07 Jun 2026' },
    { member_id: 'FAC-0063', member_type: 'Faculty', member_name: 'Mrs. Rina Bose', class: '-', item_acc_no: 'ACC-4711', name: 'NEP 2020 Implementation', issue_date: '24 May 2026', return_date: '07 Jun 2026', due_date: '06 Jun 2026' },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const MEMBER_TYPE_STYLE = {
  Student: { fg: '#1d4ed8', bg: '#dbeafe', icon: GraduationCap },
  Faculty: { fg: '#7c3aed', bg: '#ede9fe', icon: UserCog },
}

const initials = (name = '') =>
  name.replace(/^(Mr\.|Mrs\.|Ms\.)\s*/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0])
    .join('')
    .toUpperCase()

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

function DateInput({ value, onChange, error }) {
  return (
    <div className="relative">
      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input
        type="date"
        value={value}
        onChange={onChange}
        className={`w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      />
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

// ─── CATEGORY PICKER ───────────────────────────────────────────────────────────
function CategoryPicker({ value, onChange, error }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        Select Category<span className="text-rose-500 ml-0.5">*</span>
      </label>
      <div className={`flex gap-2 rounded-lg border p-1
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
        bg-white dark:bg-[#1e2238]`}
      >
        {CATEGORIES.map(({ value: v, label, icon: Icon }) => {
          const active = value === v
          return (
            <button
              key={v}
              type="button"
              onClick={() => onChange(v)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[13px] font-semibold transition-all
                ${active
                  ? 'bg-blue-600 text-white shadow-sm dark:bg-indigo-600'
                  : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5'}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          )
        })}
      </div>
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ category, session }) {
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
      <div className="flex flex-wrap items-center justify-center gap-2">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">Category: {category}</span>
        </div>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Book Issue Return Details
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const typeStyle = MEMBER_TYPE_STYLE[row.member_type] || MEMBER_TYPE_STYLE.Student
  const TypeIcon = typeStyle.icon

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Member */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: typeStyle.bg, color: typeStyle.fg }}
          >
            {initials(row.member_name)}
          </span>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.member_name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.member_id}</p>
          </div>
        </div>
      </td>

      {/* Member Type */}
      <td className="px-4 py-3 text-center">
        <span
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold"
          style={{ background: typeStyle.bg, color: typeStyle.fg }}
        >
          <TypeIcon className="w-3 h-3" />
          {row.member_type}
        </span>
      </td>

      {/* Class */}
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.class}</span>
      </td>

      {/* Item Acc No + Name */}
      <td className="px-4 py-3">
        <div className="min-w-0 max-w-[220px]">
          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.item_acc_no}</p>
        </div>
      </td>

      {/* Issue Date */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 tabular-nums whitespace-nowrap">
          <CalendarCheck className="w-3 h-3" />
          {row.issue_date}
        </span>
      </td>

      {/* Return Date */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums whitespace-nowrap">
          <CalendarClock className="w-3 h-3" />
          {row.return_date}
        </span>
      </td>

      {/* Due Date */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 tabular-nums whitespace-nowrap">
          <CalendarX className="w-3 h-3" />
          {row.due_date}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const typeStyle = MEMBER_TYPE_STYLE[row.member_type] || MEMBER_TYPE_STYLE.Student
  const TypeIcon = typeStyle.icon

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Member badge */}
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: typeStyle.bg, color: typeStyle.fg }}
        >
          {initials(row.member_name)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.member_name}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {row.member_id}{row.class !== '-' ? ` · ${row.class}` : ''}
          </p>
        </div>

        {/* Type badge */}
        <span
          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold flex-shrink-0"
          style={{ background: typeStyle.bg, color: typeStyle.fg }}
        >
          <TypeIcon className="w-3 h-3" />
          {row.member_type}
        </span>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Book title — always visible */}
      <div className="px-4 pb-3 -mt-1">
        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <span className="truncate">{row.name}</span>
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 ml-5">Acc No: {row.item_acc_no}</p>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {/* Issue Date */}
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 p-3 text-center">
              <CalendarCheck className="w-4 h-4 text-slate-500 dark:text-slate-400 mx-auto mb-1" />
              <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200 leading-tight">{row.issue_date}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mt-0.5">Issued</p>
            </div>
            {/* Return Date */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <CalendarClock className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[12px] font-bold text-emerald-700 dark:text-emerald-300 leading-tight">{row.return_date}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Returned</p>
            </div>
            {/* Due Date */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 text-center">
              <CalendarX className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-[12px] font-bold text-amber-700 dark:text-amber-300 leading-tight">{row.due_date}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-0.5">Due</p>
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
  category, setCategory,
  session, setSession,
  fromDate, setFromDate,
  toDate, setToDate,
  onShow, loading, errors,
}) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[88vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filter Report</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <CategoryPicker value={category} onChange={setCategory} error={errors.category} />

          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="From Date">
              <DateInput value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </Field>
            <Field label="To Date">
              <DateInput value={toDate} onChange={e => setToDate(e.target.value)} />
            </Field>
          </div>
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BookReturnReport() {
  const [category,   setCategory]   = useState('Student')
  const [session,    setSession]    = useState('')
  const [fromDate,   setFromDate]   = useState('')
  const [toDate,     setToDate]     = useState('')

  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)
  const [shownMeta,  setShownMeta]  = useState({ category: '', session: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!category) err.category = 'Please select a category'
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = RETURN_DATA[category] || []
      setRows(data)
      setShownMeta({ category, session })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} record${data.length !== 1 ? 's' : ''} for ${category} · ${session}.`)
    }, 650)
  }, [category, session])

  const handleReset = () => {
    setCategory('Student'); setSession(''); setFromDate(''); setToDate('')
    setRows([]); setSearch(''); setErrors({}); setShown(false); setShownMeta({ category: '', session: '' })
  }

  // ── Excel Export placeholder ──────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.member_name.toLowerCase().includes(q) ||
      r.member_id.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.item_acc_no.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults    = shown && rows.length > 0
  const activeFilters = (category ? 1 : 0) + (session ? 1 : 0) + (fromDate ? 1 : 0) + (toDate ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Book Issue Return Details
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View issue, return, and due dates for student &amp; faculty book transactions.
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

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <CategoryPicker value={category} onChange={setCategory} error={errors.category} />

            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="From Date">
              <DateInput value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </Field>

            <Field label="To Date">
              <DateInput value={toDate} onChange={e => setToDate(e.target.value)} />
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

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `${category} · ${session}` : 'Set Filters'}
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
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        category={category} setCategory={setCategory}
        session={session} setSession={setSession}
        fromDate={fromDate} setFromDate={setFromDate}
        toDate={toDate} setToDate={setToDate}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader category={shownMeta.category} session={shownMeta.session} />

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Member Details</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-64 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, ID, book, acc no…"
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
                Showing book issue, return, and due dates for {shownMeta.category.toLowerCase()} members in session {shownMeta.session}.
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
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Member', 'Type', 'Class', 'Book / Acc No', 'Issue Date', 'Return Date', 'Due Date'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.member_id}-${row.item_acc_no}`} row={row} idx={i + 1} />
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
                    Tap a card to see issue, return &amp; due dates.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.member_id}-${row.item_acc_no}`} row={row} idx={i + 1} />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
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

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookOpen className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center px-6">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select category, session and date range, then click <strong>Show</strong> to generate the report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
