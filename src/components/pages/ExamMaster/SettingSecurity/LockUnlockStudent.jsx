/**
 * LockUnlockStudent.jsx
 * Folder: src/pages/Student/LockUnlockStudent.jsx
 *
 * Converts legacy ASPX "Lock And Unlock Student" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session + Class + Student + Adm No. filters
 *  - GridView with Lock/Unlock toggle per student
 *  - Lock All / Unlock All bulk actions
 *  - Mobile: card-based layout with status badges
 *  - Desktop: ERP-style data table
 *  - Toast notifications
 *  - Loading skeleton
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Lock, Unlock, Search, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Users, ShieldCheck, ShieldOff,
  Filter, Hash, User, GraduationCap, BookOpen,
  LockKeyhole, UnlockKeyhole, ToggleLeft, ToggleRight,
  ChevronRight, Info, BarChart3
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

// Students per class (with Registration_No, name, stu_id, Status)
const STUDENTS_DATA = {
  'Nursery': [
    { stu_id: 1,  Registration_No: 'NUR001', name: 'Aarav Sharma',      Status: 'Unlock' },
    { stu_id: 2,  Registration_No: 'NUR002', name: 'Priya Singh',        Status: 'Lock'   },
    { stu_id: 3,  Registration_No: 'NUR003', name: 'Rohan Verma',        Status: 'Unlock' },
    { stu_id: 4,  Registration_No: 'NUR004', name: 'Sneha Patel',        Status: 'Unlock' },
    { stu_id: 5,  Registration_No: 'NUR005', name: 'Arjun Gupta',        Status: 'Lock'   },
  ],
  'LKG': [
    { stu_id: 6,  Registration_No: 'LKG001', name: 'Kavya Rajput',       Status: 'Unlock' },
    { stu_id: 7,  Registration_No: 'LKG002', name: 'Vivaan Mishra',      Status: 'Lock'   },
    { stu_id: 8,  Registration_No: 'LKG003', name: 'Ananya Yadav',       Status: 'Unlock' },
    { stu_id: 9,  Registration_No: 'LKG004', name: 'Ishaan Tiwari',      Status: 'Unlock' },
  ],
  'UKG': [
    { stu_id: 10, Registration_No: 'UKG001', name: 'Diya Chauhan',       Status: 'Lock'   },
    { stu_id: 11, Registration_No: 'UKG002', name: 'Kabir Joshi',        Status: 'Unlock' },
    { stu_id: 12, Registration_No: 'UKG003', name: 'Mira Pandey',        Status: 'Unlock' },
  ],
  'Class I': [
    { stu_id: 13, Registration_No: 'C1001',  name: 'Aditya Kumar',       Status: 'Unlock' },
    { stu_id: 14, Registration_No: 'C1002',  name: 'Nisha Srivastava',   Status: 'Lock'   },
    { stu_id: 15, Registration_No: 'C1003',  name: 'Ravi Dubey',         Status: 'Unlock' },
    { stu_id: 16, Registration_No: 'C1004',  name: 'Sonal Agarwal',      Status: 'Lock'   },
    { stu_id: 17, Registration_No: 'C1005',  name: 'Yash Khatri',        Status: 'Unlock' },
    { stu_id: 18, Registration_No: 'C1006',  name: 'Pooja Mehta',        Status: 'Unlock' },
  ],
  'Class II': [
    { stu_id: 19, Registration_No: 'C2001',  name: 'Akash Bhatia',       Status: 'Unlock' },
    { stu_id: 20, Registration_No: 'C2002',  name: 'Deepa Nair',         Status: 'Lock'   },
    { stu_id: 21, Registration_No: 'C2003',  name: 'Harshit Saxena',     Status: 'Unlock' },
    { stu_id: 22, Registration_No: 'C2004',  name: 'Ritika Thakur',      Status: 'Lock'   },
  ],
  'Class III': [
    { stu_id: 23, Registration_No: 'C3001',  name: 'Gaurav Yadav',       Status: 'Unlock' },
    { stu_id: 24, Registration_No: 'C3002',  name: 'Pallavi Singh',      Status: 'Unlock' },
    { stu_id: 25, Registration_No: 'C3003',  name: 'Siddharth Verma',    Status: 'Lock'   },
  ],
  'Class IV': [
    { stu_id: 26, Registration_No: 'C4001',  name: 'Bhavna Sharma',      Status: 'Unlock' },
    { stu_id: 27, Registration_No: 'C4002',  name: 'Nikhil Pandey',      Status: 'Lock'   },
    { stu_id: 28, Registration_No: 'C4003',  name: 'Tanvi Gupta',        Status: 'Unlock' },
    { stu_id: 29, Registration_No: 'C4004',  name: 'Vipul Mishra',       Status: 'Unlock' },
  ],
  'Class V': [
    { stu_id: 30, Registration_No: 'C5001',  name: 'Aishwarya Patel',    Status: 'Lock'   },
    { stu_id: 31, Registration_No: 'C5002',  name: 'Dhruv Tiwari',       Status: 'Unlock' },
    { stu_id: 32, Registration_No: 'C5003',  name: 'Komal Jain',         Status: 'Unlock' },
  ],
  'Class VI': [
    { stu_id: 33, Registration_No: 'C6001',  name: 'Amit Rajput',        Status: 'Unlock' },
    { stu_id: 34, Registration_No: 'C6002',  name: 'Chetna Dubey',       Status: 'Lock'   },
    { stu_id: 35, Registration_No: 'C6003',  name: 'Farhan Khan',        Status: 'Unlock' },
    { stu_id: 36, Registration_No: 'C6004',  name: 'Garima Chauhan',     Status: 'Lock'   },
    { stu_id: 37, Registration_No: 'C6005',  name: 'Harsh Soni',         Status: 'Unlock' },
  ],
  'Class VII': [
    { stu_id: 38, Registration_No: 'C7001',  name: 'Isha Kapoor',        Status: 'Unlock' },
    { stu_id: 39, Registration_No: 'C7002',  name: 'Jaimin Shah',        Status: 'Lock'   },
    { stu_id: 40, Registration_No: 'C7003',  name: 'Kratika Sahu',       Status: 'Unlock' },
  ],
  'Class VIII': [
    { stu_id: 41, Registration_No: 'C8001',  name: 'Lakshay Bansal',     Status: 'Lock'   },
    { stu_id: 42, Registration_No: 'C8002',  name: 'Mansi Rawat',        Status: 'Unlock' },
    { stu_id: 43, Registration_No: 'C8003',  name: 'Naman Joshi',        Status: 'Unlock' },
    { stu_id: 44, Registration_No: 'C8004',  name: 'Ojasvi Trivedi',     Status: 'Lock'   },
  ],
  'Class IX': [
    { stu_id: 45, Registration_No: 'C9001',  name: 'Parth Malhotra',     Status: 'Unlock' },
    { stu_id: 46, Registration_No: 'C9002',  name: 'Qayam Ali',          Status: 'Lock'   },
    { stu_id: 47, Registration_No: 'C9003',  name: 'Ruchika Sinha',      Status: 'Unlock' },
    { stu_id: 48, Registration_No: 'C9004',  name: 'Sameer Bose',        Status: 'Unlock' },
    { stu_id: 49, Registration_No: 'C9005',  name: 'Tanya Roy',          Status: 'Lock'   },
  ],
  'Class X': [
    { stu_id: 50, Registration_No: 'C10001', name: 'Udit Nagar',         Status: 'Unlock' },
    { stu_id: 51, Registration_No: 'C10002', name: 'Vandana Srivastava', Status: 'Lock'   },
    { stu_id: 52, Registration_No: 'C10003', name: 'Wamika Chandra',     Status: 'Unlock' },
    { stu_id: 53, Registration_No: 'C10004', name: 'Xander Mehta',       Status: 'Unlock' },
  ],
  'Class XI': [
    { stu_id: 54, Registration_No: 'C11001', name: 'Yuvraj Gill',        Status: 'Lock'   },
    { stu_id: 55, Registration_No: 'C11002', name: 'Zara Hussain',       Status: 'Unlock' },
    { stu_id: 56, Registration_No: 'C11003', name: 'Abhijit Das',        Status: 'Unlock' },
    { stu_id: 57, Registration_No: 'C11004', name: 'Bhumi Pednekar',     Status: 'Lock'   },
    { stu_id: 58, Registration_No: 'C11005', name: 'Chirag Paswan',      Status: 'Unlock' },
  ],
  'Class XII': [
    { stu_id: 59, Registration_No: 'C12001', name: 'Devika Rao',         Status: 'Unlock' },
    { stu_id: 60, Registration_No: 'C12002', name: 'Eshan Nanda',        Status: 'Lock'   },
    { stu_id: 61, Registration_No: 'C12003', name: 'Falak Shabir',       Status: 'Unlock' },
    { stu_id: 62, Registration_No: 'C12004', name: 'Gaurangi Sharma',    Status: 'Lock'   },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const isLocked = (status) => status === 'Lock'

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') =>
  CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

const formatAbbr = (name = '') =>
  name.replace('Class ', '').slice(0, 3).toUpperCase()

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
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
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
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

// ─── SUMMARY STAT CARDS ───────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const variants = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${variants[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── LOCK/UNLOCK BUTTON ───────────────────────────────────────────────────────
function LockToggleBtn({ status, onClick, size = 'sm' }) {
  const locked = isLocked(status)
  const base = size === 'sm'
    ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-95'
    : 'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all active:scale-95'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${locked
        ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:hover:bg-rose-500/25 border border-rose-200 dark:border-rose-500/25'
        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25 border border-emerald-200 dark:border-emerald-500/25'
      }`}
    >
      {locked
        ? <><LockKeyhole className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />{size === 'sm' ? 'Locked' : 'Locked – Click to Unlock'}</>
        : <><UnlockKeyhole className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />{size === 'sm' ? 'Unlocked' : 'Unlocked – Click to Lock'}</>
      }
    </button>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const locked = isLocked(status)
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide
      ${locked
        ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'
      }`}>
      {locked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
      {status}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onToggle }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Adm No */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{row.Registration_No}</span>
        </div>
      </td>

      {/* Student */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            {row.name.charAt(0)}
          </span>
          <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{row.name}</span>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3 text-center">
        <StatusBadge status={row.Status} />
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-center">
        <LockToggleBtn status={row.Status} onClick={() => onToggle(row.stu_id)} />
      </td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function MobileCard({ row, idx, onToggle }) {
  const locked = isLocked(row.Status)
  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm transition-all
      ${locked
        ? 'border-rose-100 dark:border-rose-500/20'
        : 'border-emerald-100 dark:border-emerald-500/20'
      }`}>
      {/* Color indicator strip */}
      <div className={`h-1 w-full ${locked ? 'bg-rose-400' : 'bg-emerald-400'}`} />

      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Avatar */}
        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[14px] font-bold flex-shrink-0">
          {row.name.charAt(0)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
              <Hash className="w-3 h-3" />{row.Registration_No}
            </span>
            <StatusBadge status={row.Status} />
          </div>
        </div>

        {/* S.No */}
        <span className="text-[11px] font-bold text-slate-300 dark:text-slate-600 w-6 text-right flex-shrink-0">#{idx}</span>
      </div>

      {/* Action */}
      <div className={`px-4 pb-3.5 pt-0`}>
        <button
          type="button"
          onClick={() => onToggle(row.stu_id)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold transition-all active:scale-95
            ${locked
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20'
              : 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20'
            }`}
        >
          {locked
            ? <><UnlockKeyhole className="w-4 h-4" />Unlock Student</>
            : <><LockKeyhole className="w-4 h-4" />Lock Student</>
          }
        </button>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({
  open, onClose,
  session, setSession,
  selectedClass, setSelectedClass,
  selectedStudent, setSelectedStudent,
  admNo, setAdmNo,
  studentList,
  onShow, loading, errors,
}) {
  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-6 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Fields */}
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={selectedClass} onChange={e => { setSelectedClass(e.target.value); setSelectedStudent('') }} placeholder="-- Select Class --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Student">
            <NativeSelect value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} placeholder="-- All Students --" disabled={!selectedClass}>
              {studentList.map(s => <option key={s.stu_id} value={s.stu_id}>{s.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Admission No.">
            <div className="relative">
              <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={admNo}
                onChange={e => setAdmNo(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                placeholder="e.g. C9003"
                className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 placeholder-slate-300 dark:placeholder-slate-600"
              />
              {admNo && (
                <button onClick={() => setAdmNo('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </Field>
        </div>
        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Students
          </button>
        </div>
      </div>
    </>
  )
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ open, action, count, onConfirm, onCancel }) {
  if (!open) return null
  const isLockAction = action === 'lock'
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6"
          style={{ animation: 'modalPop .2s ease' }}
        >
          <style>{`@keyframes modalPop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4
            ${isLockAction ? 'bg-rose-100 dark:bg-rose-500/15' : 'bg-emerald-100 dark:bg-emerald-500/15'}`}>
            {isLockAction
              ? <LockKeyhole className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              : <UnlockKeyhole className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            }
          </div>
          <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-100 text-center mb-2">
            {isLockAction ? 'Lock All Students?' : 'Unlock All Students?'}
          </h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center mb-6">
            This will {isLockAction ? 'lock' : 'unlock'} <strong>{count}</strong> student{count !== 1 ? 's' : ''}.
            {isLockAction ? ' They will not be able to access the system.' : ' They will regain system access.'}
          </p>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all
                ${isLockAction
                  ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20'
                }`}>
              Confirm {isLockAction ? 'Lock All' : 'Unlock All'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LockUnlockStudent() {
  // Filter state
  const [session,         setSession]         = useState('')
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedStudent, setSelectedStudent] = useState('')
  const [admNo,           setAdmNo]           = useState('')
  const [errors,          setErrors]          = useState({})

  // Data state
  const [students,   setStudents]   = useState([])
  const [loading,    setLoading]    = useState(false)
  const [shown,      setShown]      = useState(false)
  const [search,     setSearch]     = useState('')

  // UI state
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [confirm,      setConfirm]      = useState(null) // { action: 'lock'|'unlock' }
  const [toast,        setToast]        = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Students dropdown list for selected class
  const studentList = useMemo(() => {
    if (!selectedClass) return []
    return STUDENTS_DATA[selectedClass] || []
  }, [selectedClass])

  // ── Validate & Fetch ────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session)       err.session = 'Please select a session'
    if (!selectedClass) err.cls     = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    // Simulate API call
    setTimeout(() => {
      let data = [...(STUDENTS_DATA[selectedClass] || [])]

      // Filter by specific student if selected
      if (selectedStudent) {
        data = data.filter(s => String(s.stu_id) === String(selectedStudent))
      }

      // Filter by adm no if provided
      if (admNo.trim()) {
        data = data.filter(s =>
          s.Registration_No.toLowerCase().includes(admNo.toLowerCase())
        )
      }

      setStudents(data)
      setShown(true)
      setLoading(false)
      showToast(`${data.length} student${data.length !== 1 ? 's' : ''} loaded for ${selectedClass}.`)
    }, 700)
  }, [session, selectedClass, selectedStudent, admNo, showToast])

  const handleReset = () => {
    setSession(''); setSelectedClass(''); setSelectedStudent(''); setAdmNo('')
    setErrors({}); setStudents([]); setShown(false); setSearch('')
  }

  // ── Toggle single student ───────────────────────────────────────────────────
  const handleToggle = useCallback((stuId) => {
    setStudents(prev =>
      prev.map(s =>
        s.stu_id === stuId
          ? { ...s, Status: isLocked(s.Status) ? 'Unlock' : 'Lock' }
          : s
      )
    )
    const stu = students.find(s => s.stu_id === stuId)
    if (stu) {
      const newStatus = isLocked(stu.Status) ? 'Unlocked' : 'Locked'
      showToast(`${stu.name} has been ${newStatus}.`)
    }
  }, [students, showToast])

  // ── Bulk Lock/Unlock ────────────────────────────────────────────────────────
  const handleBulk = useCallback((action) => {
    setStudents(prev => prev.map(s => ({ ...s, Status: action === 'lock' ? 'Lock' : 'Unlock' })))
    setConfirm(null)
    showToast(
      action === 'lock'
        ? `All ${students.length} students locked.`
        : `All ${students.length} students unlocked.`
    )
  }, [students.length, showToast])

  // ── Search filter ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.Registration_No.toLowerCase().includes(q)
    )
  }, [students, search])

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    students.length,
    locked:   students.filter(s => isLocked(s.Status)).length,
    unlocked: students.filter(s => !isLocked(s.Status)).length,
  }), [students])

  const hasResults    = shown && students.length > 0
  const activeFilters = [session, selectedClass, selectedStudent, admNo].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <LockKeyhole className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Lock &amp; Unlock Students
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage student login access — lock or unlock individually or in bulk.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
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

            {/* Class */}
            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={selectedClass}
                onChange={e => {
                  setSelectedClass(e.target.value)
                  setSelectedStudent('')
                  setErrors(p => ({ ...p, cls: undefined }))
                }}
                placeholder="-- Select Class --"
                error={errors.cls}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Student */}
            <Field label="Student">
              <NativeSelect
                value={selectedStudent}
                onChange={e => setSelectedStudent(e.target.value)}
                placeholder="-- All Students --"
                disabled={!selectedClass}
              >
                {studentList.map(s => <option key={s.stu_id} value={s.stu_id}>{s.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Adm No. */}
            <Field label="Admission No.">
              <div className="relative">
                <Hash className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={admNo}
                  onChange={e => setAdmNo(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  placeholder="e.g. C9003"
                  className="w-full pl-8 pr-7 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 placeholder-slate-300 dark:placeholder-slate-600 transition-all"
                />
                {admNo && (
                  <button onClick={() => setAdmNo('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </Field>

            {/* Actions */}
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
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {selectedClass ? `${selectedClass} · ${session || 'No session'}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        selectedClass={selectedClass} setSelectedClass={setSelectedClass}
        selectedStudent={selectedStudent} setSelectedStudent={setSelectedStudent}
        admNo={admNo} setAdmNo={setAdmNo}
        studentList={studentList}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Users}     label="Total Students"   value={stats.total}    color="blue"    />
            <StatCard icon={ShieldOff} label="Locked"           value={stats.locked}   color="rose"    />
            <StatCard icon={ShieldCheck} label="Unlocked"       value={stats.unlocked} color="emerald" />
          </div>

          {/* Main results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{selectedClass}</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {session}</span>
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
                  placeholder="Search name or adm no…"
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

            {/* Info strip */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-amber-50/40 dark:bg-amber-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <p className="text-[12px] text-amber-700 dark:text-amber-400">
                Locked students cannot log in. Use <strong>Lock All</strong> / <strong>Unlock All</strong> for bulk changes.
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
                      {['S.No.', 'Adm No.', 'Student Name', 'Status', 'Action'].map((h, i) => (
                        <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                          ${i === 0 ? 'text-center w-12' : i >= 3 ? 'text-center' : 'text-left'}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.stu_id} row={row} idx={i + 1} onToggle={handleToggle} />
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
                filtered.map((row, i) => (
                  <MobileCard key={row.stu_id} row={row} idx={i + 1} onToggle={handleToggle} />
                ))
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

          {/* ── BULK ACTIONS ── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
              <ToggleLeft className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Bulk Actions</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Affects all {students.length} students</span>
            </div>
            <div className="p-5">
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Lock All */}
                <button
                  type="button"
                  onClick={() => setConfirm({ action: 'lock' })}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-[13px] font-semibold
                    bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/20 transition-all active:scale-95"
                >
                  <LockKeyhole className="w-4 h-4" />
                  Lock All Students
                  <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{students.length}</span>
                </button>

                {/* Unlock All */}
                <button
                  type="button"
                  onClick={() => setConfirm({ action: 'unlock' })}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl text-[13px] font-semibold
                    bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 transition-all active:scale-95"
                >
                  <UnlockKeyhole className="w-4 h-4" />
                  Unlock All Students
                  <span className="bg-white/20 text-white text-[11px] font-bold px-2 py-0.5 rounded-full">{students.length}</span>
                </button>
              </div>

              {/* Visual lock ratio bar */}
              {students.length > 0 && (
                <div className="mt-4">
                  <div className="flex text-[11px] font-semibold justify-between mb-1.5">
                    <span className="text-rose-600 dark:text-rose-400 flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Locked: {stats.locked} ({Math.round((stats.locked / stats.total) * 100)}%)
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      Unlocked: {stats.unlocked} ({Math.round((stats.unlocked / stats.total) * 100)}%)
                      <Unlock className="w-3 h-3" />
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-emerald-200 dark:bg-emerald-500/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-rose-500 transition-all duration-500"
                      style={{ width: `${Math.round((stats.locked / stats.total) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <LockKeyhole className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No students loaded</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>Session</strong> and <strong>Class</strong>, then click <strong>Show</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {confirm && (
        <ConfirmModal
          open={!!confirm}
          action={confirm.action}
          count={students.length}
          onConfirm={() => handleBulk(confirm.action)}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
