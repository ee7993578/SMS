/**
 * SiblingReport.jsx
 * Folder: src/components/pages/SiblingReport.jsx
 *
 * Rebuilt from: Reports/Configuration/sibling_reports.aspx
 * Stack: React + Tailwind CSS + Lucide Icons
 *
 * Layout:
 *  - Outer rows: grouped by family (Father + Mother name)
 *  - Inner nested: all siblings per family (Adm No, Name, Class)
 *  - Filters: Session (required), Reg No, Father Name
 *  - Actions: Show + Export to Excel
 *  - Desktop: nested table-in-table (data-dense)
 *  - Mobile: family cards with expandable sibling list
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Users, Search, Filter, RefreshCw, Download,
  ChevronDown, ChevronRight, X, Loader2,
  SlidersHorizontal, AlertCircle, Info,
  FileSpreadsheet, GraduationCap, User,
  UsersRound, BookOpen, Hash, Phone,
  ChevronUp, Heart
} from 'lucide-react'

// ─── STATIC DUMMY DATA ────────────────────────────────────────────────────────
// Shape: families[] → each family has parentInfo + children[]

const SESSIONS = ['2023-24', '2024-25', '2025-26']

const FAMILIES_RAW = [
  {
    id: 'F001',
    father_name: 'Ramesh Kumar Sharma',
    mother_name: 'Sunita Sharma',
    mobile: '9876500001',
    children: [
      { reg: '2024/III/001', name: 'Aarav Sharma',    class: 'Class III-A', gender: 'Male'   },
      { reg: '2022/V/008',   name: 'Ananya Sharma',   class: 'Class V-B',   gender: 'Female' },
      { reg: '2019/IX/003',  name: 'Aryan Sharma',    class: 'Class IX-A',  gender: 'Male'   },
    ],
  },
  {
    id: 'F002',
    father_name: 'Suresh Gupta',
    mother_name: 'Priya Gupta',
    mobile: '9876500002',
    children: [
      { reg: '2023/IV/012',  name: 'Diya Gupta',      class: 'Class IV-A',  gender: 'Female' },
      { reg: '2021/VI/005',  name: 'Dev Gupta',        class: 'Class VI-B',  gender: 'Male'   },
    ],
  },
  {
    id: 'F003',
    father_name: 'Mahesh Tiwari',
    mother_name: 'Kavita Tiwari',
    mobile: '9876500003',
    children: [
      { reg: '2024/II/007',  name: 'Ishaan Tiwari',   class: 'Class II-A',  gender: 'Male'   },
      { reg: '2022/IV/019',  name: 'Isha Tiwari',     class: 'Class IV-C',  gender: 'Female' },
      { reg: '2020/VII/002', name: 'Ishan Tiwari',    class: 'Class VII-A', gender: 'Male'   },
      { reg: '2018/X/011',   name: 'Ira Tiwari',      class: 'Class X-B',   gender: 'Female' },
    ],
  },
  {
    id: 'F004',
    father_name: 'Anil Kumar Yadav',
    mother_name: 'Meena Yadav',
    mobile: '9876500004',
    children: [
      { reg: '2023/III/022', name: 'Kavya Yadav',     class: 'Class III-B', gender: 'Female' },
      { reg: '2021/V/014',   name: 'Kartik Yadav',    class: 'Class V-A',   gender: 'Male'   },
    ],
  },
  {
    id: 'F005',
    father_name: 'Dinesh Rastogi',
    mother_name: 'Rekha Rastogi',
    mobile: '9876500005',
    children: [
      { reg: '2024/I/003',   name: 'Mohit Rastogi',   class: 'Class I-A',   gender: 'Male'   },
      { reg: '2022/III/015', name: 'Monika Rastogi',  class: 'Class III-A', gender: 'Female' },
    ],
  },
  {
    id: 'F006',
    father_name: 'Pramod Agarwal',
    mother_name: 'Nisha Agarwal',
    mobile: '9876500006',
    children: [
      { reg: '2023/II/008',  name: 'Neha Agarwal',    class: 'Class II-B',  gender: 'Female' },
      { reg: '2020/VI/021',  name: 'Nikhil Agarwal',  class: 'Class VI-A',  gender: 'Male'   },
      { reg: '2017/XI/004',  name: 'Nidhi Agarwal',   class: 'Class XI-B',  gender: 'Female' },
    ],
  },
  {
    id: 'F007',
    father_name: 'Vijay Mishra',
    mother_name: 'Sangeeta Mishra',
    mobile: '9876500007',
    children: [
      { reg: '2024/NUR/009', name: 'Priya Mishra',    class: 'Nursery-A',   gender: 'Female' },
      { reg: '2022/II/031',  name: 'Pranav Mishra',   class: 'Class II-C',  gender: 'Male'   },
    ],
  },
  {
    id: 'F008',
    father_name: 'Sanjay Joshi',
    mother_name: 'Deepa Joshi',
    mobile: '9876500008',
    children: [
      { reg: '2021/V/027',   name: 'Rahul Joshi',     class: 'Class V-C',   gender: 'Male'   },
      { reg: '2019/VIII/013',name: 'Rohit Joshi',     class: 'Class VIII-A',gender: 'Male'   },
    ],
  },
  {
    id: 'F009',
    father_name: 'Rakesh Dubey',
    mother_name: 'Asha Dubey',
    mobile: '9876500009',
    children: [
      { reg: '2024/LKG/011', name: 'Rohan Dubey',     class: 'LKG-B',       gender: 'Male'   },
      { reg: '2022/III/044', name: 'Riya Dubey',      class: 'Class III-C', gender: 'Female' },
      { reg: '2020/VI/007',  name: 'Rishabh Dubey',   class: 'Class VI-C',  gender: 'Male'   },
    ],
  },
  {
    id: 'F010',
    father_name: 'Ajay Pandey',
    mother_name: 'Savita Pandey',
    mobile: '9876500010',
    children: [
      { reg: '2023/IV/033',  name: 'Sneha Pandey',    class: 'Class IV-B',  gender: 'Female' },
      { reg: '2021/VI/018',  name: 'Shubham Pandey',  class: 'Class VI-A',  gender: 'Male'   },
    ],
  },
]

// ─── AVATAR COLORS ────────────────────────────────────────────────────────────
const AVATAR_PALETTE = [
  ['#1d4ed8','#dbeafe'], ['#7c3aed','#ede9fe'], ['#0891b2','#cffafe'],
  ['#059669','#d1fae5'], ['#d97706','#fef3c7'], ['#dc2626','#fee2e2'],
  ['#db2777','#fce7f3'], ['#0369a1','#e0f2fe'],
]
const getAvatarColors = (name) =>
  AVATAR_PALETTE[(name?.charCodeAt(0) ?? 0) % AVATAR_PALETTE.length]

// ─── FAMILY AVATAR (first letters of father surname) ──────────────────────────
const familyInitials = (fatherName) => {
  const parts = fatherName.trim().split(' ')
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  return parts[0].slice(0, 2).toUpperCase()
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
          } ${className}`}
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

function TextInput({ value, onChange, placeholder, className = '' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-400
        border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
        dark:placeholder-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${className}`}
    />
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
        ? <Users className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes toastSlide{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// Sibling count badge
function SiblingCountBadge({ count }) {
  const color =
    count >= 4 ? 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400' :
    count === 3 ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400' :
    'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold flex-shrink-0 ${color}`}>
      <GraduationCap className="w-3 h-3" />
      {count} {count === 1 ? 'child' : 'children'}
    </span>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({
  open, onClose,
  session, setSession,
  regNo, setRegNo,
  fatherName, setFatherName,
  errors, onShow, loading,
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
              <UsersRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Sibling Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4 max-h-[55vh] overflow-y-auto">
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

          <Field label="Registration No.">
            <TextInput value={regNo} onChange={e => setRegNo(e.target.value)} placeholder="e.g. 2024/III/001" />
          </Field>

          <Field label="Father Name">
            <TextInput
              value={fatherName}
              onChange={e => setFatherName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
              placeholder="Enter father's name…"
            />
          </Field>
        </div>

        {/* CTA */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button"
            onClick={() => { onShow(); onClose() }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              disabled:opacity-70 shadow-md shadow-blue-500/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Show Results
          </button>
        </div>
      </div>
    </>
  )
}

// ─── NESTED SIBLING TABLE (used inside desktop outer row) ────────────────────
function SiblingInnerTable({ children }) {
  return (
    <table className="w-full rounded-lg overflow-hidden"
      style={{ background: 'rgba(248,250,252,0.6)' }}>
      <thead>
        <tr className="border-b border-slate-200 dark:border-[rgba(99,102,241,0.12)]"
          style={{ background: 'rgba(241,245,249,0.8)' }}>
          {['Adm. No.', 'Student Name', 'Class'].map((h, i) => (
            <th key={i} className="px-3 py-2 text-left text-[10.5px] font-bold uppercase tracking-wide
              text-slate-500 dark:text-slate-400">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children}
      </tbody>
    </table>
  )
}

// Inner table row
function SiblingInnerRow({ child, idx }) {
  const [fg, bg] = getAvatarColors(child.name)
  const isMale = child.gender === 'Male'

  return (
    <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] last:border-0
      hover:bg-blue-50/40 dark:hover:bg-indigo-500/[0.04] transition-colors`}>

      {/* Adm No */}
      <td className="px-3 py-2">
        <span className="text-[11.5px] font-mono font-semibold text-blue-600 dark:text-blue-400">
          {child.reg}
        </span>
      </td>

      {/* Name */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-2">
          <span
            className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {child.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[12.5px] font-medium text-slate-700 dark:text-slate-200">{child.name}</span>
          <span className={`text-[9.5px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0
            ${isMale
              ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400'
              : 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400'
            }`}>
            {isMale ? '♂' : '♀'}
          </span>
        </div>
      </td>

      {/* Class */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="text-[12px] text-slate-600 dark:text-slate-300">{child.class}</span>
        </div>
      </td>
    </tr>
  )
}

// ─── DESKTOP OUTER ROW (family group) ────────────────────────────────────────
function DesktopFamilyRow({ family, idx }) {
  const [fg, bg] = getAvatarColors(family.father_name)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] align-top
      hover:bg-slate-50/40 dark:hover:bg-white/[0.015] transition-colors">

      {/* S.No */}
      <td className="px-4 py-4 text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12 align-top">
        {idx}
      </td>

      {/* Family Header — Father + Mother */}
      <td className="px-4 py-4 min-w-[200px] align-top">
        <div className="flex items-start gap-3 mb-1">
          {/* Family avatar */}
          <span
            className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-bold mt-0.5"
            style={{
              background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
              color: fg,
              boxShadow: `0 2px 8px ${bg}80`,
            }}
          >
            {familyInitials(family.father_name)}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <User className="w-3 h-3 text-blue-500 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                {family.father_name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Heart className="w-3 h-3 text-pink-400 dark:text-pink-400 flex-shrink-0" />
              <span className="text-[12px] text-slate-500 dark:text-slate-400">
                {family.mother_name}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-1.5">
              <Phone className="w-3 h-3 text-slate-400 flex-shrink-0" />
              <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                {family.mobile}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Siblings — nested table */}
      <td className="px-4 py-4" colSpan={1}>
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[rgba(99,102,241,0.15)]
          shadow-sm">
          {/* Inner table header label */}
          <div className="flex items-center justify-between px-3 py-2
            bg-slate-100/80 dark:bg-[rgba(99,102,241,0.07)]
            border-b border-slate-200 dark:border-[rgba(99,102,241,0.12)]">
            <div className="flex items-center gap-1.5">
              <UsersRound className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              <span className="text-[11.5px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Siblings
              </span>
            </div>
            <SiblingCountBadge count={family.children.length} />
          </div>

          {/* Inner sibling table */}
          <div className="dark:bg-[#161b2e]/50 bg-white/80">
            <SiblingInnerTable>
              {family.children.map((child, ci) => (
                <SiblingInnerRow key={ci} child={child} idx={ci + 1} />
              ))}
            </SiblingInnerTable>
          </div>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE FAMILY CARD ───────────────────────────────────────────────────────
function MobileFamilyCard({ family, idx }) {
  const [expanded, setExpanded] = useState(false)
  const [fg, bg] = getAvatarColors(family.father_name)

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)]
      bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">

      {/* Card header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left
          hover:bg-slate-50/70 dark:hover:bg-white/[0.025] transition-colors"
      >
        {/* Index */}
        <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums w-5 text-center flex-shrink-0">
          {idx}
        </span>

        {/* Family avatar */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold"
          style={{
            background: `linear-gradient(135deg, ${bg}, ${bg}cc)`,
            color: fg,
            boxShadow: `0 2px 8px ${bg}80`,
          }}
        >
          {familyInitials(family.father_name)}
        </span>

        {/* Family info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">
              {family.father_name}
            </p>
          </div>
          <p className="text-[11.5px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {family.mother_name}
          </p>
        </div>

        {/* Sibling count badge */}
        <SiblingCountBadge count={family.children.length} />

        {/* Chevron */}
        <div className={`ml-1 flex-shrink-0 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </div>
      </button>

      {/* Expanded sibling list */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          {/* Parent info detail bar */}
          <div className="flex items-center justify-between px-4 py-2.5
            bg-slate-50/80 dark:bg-[rgba(99,102,241,0.05)]
            border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <Phone className="w-3 h-3 text-slate-400" />
                <span className="text-[11.5px] font-mono text-slate-500 dark:text-slate-400">
                  {family.mobile}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <UsersRound className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11.5px] font-bold text-indigo-600 dark:text-indigo-400">
                {family.children.length} {family.children.length === 1 ? 'sibling' : 'siblings'}
              </span>
            </div>
          </div>

          {/* Sibling cards */}
          <div className="p-3 space-y-2">
            {family.children.map((child, ci) => {
              const [cFg, cBg] = getAvatarColors(child.name)
              const isMale = child.gender === 'Male'
              return (
                <div key={ci}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl
                    bg-slate-50 dark:bg-[rgba(99,102,241,0.05)]
                    border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                  {/* Child avatar */}
                  <span
                    className="w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
                    style={{ background: cBg, color: cFg }}
                  >
                    {child.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>

                  {/* Child info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-[12.5px] font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {child.name}
                      </p>
                      <span className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0
                        ${isMale
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400'
                          : 'bg-pink-100 text-pink-700 dark:bg-pink-500/15 dark:text-pink-400'
                        }`}>
                        {isMale ? '♂' : '♀'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">{child.reg}</span>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">·</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{child.class}</span>
                    </div>
                  </div>

                  {/* Index pill */}
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 tabular-nums w-5 text-right flex-shrink-0">
                    #{ci + 1}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SUMMARY MINI STAT ────────────────────────────────────────────────────────
function MiniStat({ label, value, icon: Icon, colorClass }) {
  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border ${colorClass}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div>
        <p className="text-[18px] font-bold leading-tight">{value}</p>
        <p className="text-[11px] opacity-75 font-medium">{label}</p>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function SiblingReport() {
  // Filter state
  const [session,    setSession]    = useState('')
  const [regNo,      setRegNo]      = useState('')
  const [fatherName, setFatherName] = useState('')

  // Data & UI state
  const [families,    setFamilies]    = useState([])
  const [loading,     setLoading]     = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!session) err.session = 'Session is required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Search / Show ──────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let result = [...FAMILIES_RAW]

      // Filter by registration no — show family of that student
      if (regNo.trim()) {
        result = result.filter(f =>
          f.children.some(c =>
            c.reg.toLowerCase().includes(regNo.trim().toLowerCase())
          )
        )
      }

      // Filter by father name
      if (fatherName.trim()) {
        result = result.filter(f =>
          f.father_name.toLowerCase().includes(fatherName.trim().toLowerCase())
        )
      }

      setFamilies(result)
      setHasSearched(true)
      setLoading(false)

      if (result.length === 0) {
        showToast('No sibling records found.', 'error')
      } else {
        const totalChildren = result.reduce((s, f) => s + f.children.length, 0)
        showToast(`${result.length} famil${result.length > 1 ? 'ies' : 'y'} · ${totalChildren} students found.`)
      }
    }, 700)
  }, [session, regNo, fatherName])

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession(''); setRegNo(''); setFatherName('')
    setFamilies([]); setSearch(''); setErrors({}); setHasSearched(false)
  }

  // ── Filtered families (live search) ───────────────────────────────────────
  const filteredFamilies = useMemo(() => {
    if (!search) return families
    const q = search.toLowerCase()
    return families.filter(f =>
      f.father_name.toLowerCase().includes(q) ||
      f.mother_name.toLowerCase().includes(q) ||
      f.children.some(c =>
        c.name.toLowerCase().includes(q) ||
        c.reg.toLowerCase().includes(q) ||
        c.class.toLowerCase().includes(q)
      )
    )
  }, [families, search])

  // ── Summary counts ─────────────────────────────────────────────────────────
  const summary = useMemo(() => ({
    families: families.length,
    students: families.reduce((s, f) => s + f.children.length, 0),
    maxSiblings: families.length > 0
      ? Math.max(...families.map(f => f.children.length))
      : 0,
    largeFamilies: families.filter(f => f.children.length >= 3).length,
  }), [families])

  const hasResults = families.length > 0
  const activeFilters = [session, regNo, fatherName].filter(Boolean).length

  return (
    <div className="space-y-4 pb-8 page-animate">

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg,#1e3a8a,#4f46e5)',
              boxShadow: '0 4px 12px rgba(30,58,138,0.3)',
            }}
          >
            <UsersRound className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
              Sibling Report
            </h1>
            <p className="text-[12.5px] text-slate-500 dark:text-slate-400 mt-0.5">
              View all siblings grouped by family — search by session, reg. no. or father's name.
            </p>
          </div>
        </div>

        {/* Export — desktop only, after search */}
        {hasResults && (
          <div className="hidden sm:flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100
              dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20 transition-colors">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export to Excel
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP FILTER CARD ─────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
        bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card header accent */}
        <div className="flex items-center gap-3 px-5 py-3.5
          border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            Search Filters
          </span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">

            {/* Session */}
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

            {/* Reg No */}
            <Field label="Registration No.">
              <TextInput
                value={regNo}
                onChange={e => setRegNo(e.target.value)}
                placeholder="e.g. 2024/III/001"
              />
            </Field>

            {/* Father Name */}
            <Field label="Father Name">
              <TextInput
                value={fatherName}
                onChange={e => setFatherName(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                placeholder="Enter father's name…"
              />
            </Field>

            {/* Action buttons */}
            <div className="flex gap-2 items-end col-span-1 xl:col-span-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold
                  text-white transition-all active:scale-95 disabled:opacity-70
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Show
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

      {/* ── MOBILE FILTER BAR ───────────────────────────────────────────────── */}
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
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilters}
            </span>
          )}
        </button>
        {hasResults && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        regNo={regNo} setRegNo={setRegNo}
        fatherName={fatherName} setFatherName={setFatherName}
        errors={errors} onShow={handleShow} loading={loading}
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
              <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
              <UsersRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                Results
              </span>
              {session && (
                <span className="text-[12.5px] text-slate-400 dark:text-slate-500">
                  · Session {session}
                </span>
              )}
            </div>

            {/* Live search */}
            <div className="relative w-full sm:w-60 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search family, student, class…"
                className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600 dark:focus:border-indigo-400"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Summary stats row */}
          <div className="px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]
            bg-slate-50/30 dark:bg-white/[0.01] overflow-x-auto">
            <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
              <MiniStat
                label="Families"
                value={summary.families}
                icon={Users}
                colorClass="bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-500/20"
              />
              <MiniStat
                label="Total Students"
                value={summary.students}
                icon={GraduationCap}
                colorClass="bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20"
              />
              {summary.largeFamilies > 0 && (
                <MiniStat
                  label="3+ Children"
                  value={summary.largeFamilies}
                  icon={UsersRound}
                  colorClass="bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-500/20"
                />
              )}
              <MiniStat
                label="Max Siblings"
                value={summary.maxSiblings}
                icon={Hash}
                colorClass="bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-500/20"
              />
            </div>
          </div>

          {/* Info hint */}
          <div className="hidden sm:flex items-center gap-2 px-5 py-2
            border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)]
            bg-blue-50/30 dark:bg-blue-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              Each row shows a family group. Siblings are listed in the nested table on the right.
            </p>
          </div>

          {/* ── DESKTOP OUTER TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            {filteredFamilies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <Search className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No families match your search.</span>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]
                    bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No', 'Parent Details', 'Sibling Details'].map((h, i) => (
                      <th
                        key={i}
                        className={`px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide
                          text-slate-500 dark:text-slate-400
                          ${i === 2 ? 'w-[60%]' : ''}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredFamilies.map((family, i) => (
                    <DesktopFamilyRow key={family.id} family={family} idx={i + 1} />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── MOBILE FAMILY CARDS ── */}
          <div className="md:hidden p-4 space-y-3">
            {filteredFamilies.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <Search className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No families match your search.</span>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap a family card to see all siblings.
                </p>
                {filteredFamilies.map((family, i) => (
                  <MobileFamilyCard key={family.id} family={family} idx={i + 1} />
                ))}
              </>
            )}
          </div>

          {/* Results footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4
            border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
            bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500 text-center sm:text-left">
              Showing{' '}
              <span className="font-semibold text-slate-600 dark:text-slate-300">{filteredFamilies.length}</span>{' '}
              of{' '}
              <span className="font-semibold text-slate-600 dark:text-slate-300">{summary.families}</span>{' '}
              famil{summary.families > 1 ? 'ies' : 'y'} ·{' '}
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">{summary.students}</span> total students
            </p>

            {/* Mobile export button */}
            <button className="flex sm:hidden items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold
              bg-emerald-50 text-emerald-700 border border-emerald-200
              dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              <FileSpreadsheet className="w-3.5 h-3.5" /> Export to Excel
            </button>
          </div>
        </div>
      )}

      {/* ── EMPTY STATE (before first search) ─────────────────────────────────── */}
      {!hasResults && !loading && !hasSearched && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(30,58,138,0.08), rgba(79,70,229,0.08))' }}
          >
            <UsersRound className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No results yet</p>
            <p className="text-[12.5px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
              Select a session and optionally filter by registration number or father's name, then click{' '}
              <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <p className="text-[13px] text-slate-500 dark:text-slate-400">Fetching sibling records…</p>
        </div>
      )}

      {/* After search, empty */}
      {hasSearched && !loading && families.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <UsersRound className="w-7 h-7 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No sibling groups found</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Try different filters or clear the search.
            </p>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
