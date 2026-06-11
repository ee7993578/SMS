/**
 * SubjectReport.jsx
 * Folder: src/pages/Reports/Configuration/SubjectReport.jsx
 *
 * Converts legacy ASPX "Subject Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Subject, Subject Code, Is Optional, Grade Subject, Practical, Subject Order
 * Features:
 *  - Session → Class → Section (conditional) cascading dropdowns
 *  - Show report button with client-side validation
 *  - Mobile: collapsible cards with expandable details + bottom-sheet filter drawer
 *  - Desktop: dense ERP-style table with inline search
 *  - Grand summary footer
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown, ChevronRight,
  Search, BookOpen, BookMarked, SlidersHorizontal,
  Info, BarChart3, Building2, MapPin,
  CheckCircle2, XCircle, FlaskConical, GraduationCap,
  ListOrdered, Hash, Tag
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES_BY_SESSION = {
  '2022-23': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

// Classes that have sections
const SECTIONS_BY_CLASS = {
  'Nursery': ['A', 'B'],
  'LKG': ['A', 'B'],
  'UKG': ['A', 'B'],
  'Class I': ['A', 'B'],
  'Class II': ['A', 'B'],
  'Class III': ['A'],
  'Class IV': ['A'],
  'Class V': ['A'],
  'Class VI': ['A', 'B'],
  'Class VII': ['A'],
  'Class VIII': ['A'],
  'Class IX': ['A', 'B'],
  'Class X': ['A'],
  'Class XI': ['A', 'B', 'C'],
  'Class XII': ['A', 'B'],
}

// Subject data per class (static dummy — replace with API)
const SUBJECT_DATA = {
  'Nursery': [
    { Subject: 'English',       Subject_code: 'ENG01', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN01', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT01', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'Drawing',       Subject_code: 'DRW01', isoptional: 'true',  isgrade: 'true',  isprac: 'true',  subject_order: 4 },
  ],
  'LKG': [
    { Subject: 'English',       Subject_code: 'ENG02', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN02', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT02', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'EVS',           Subject_code: 'EVS02', isoptional: 'false', isgrade: 'true',  isprac: 'false', subject_order: 4 },
    { Subject: 'Drawing',       Subject_code: 'DRW02', isoptional: 'true',  isgrade: 'true',  isprac: 'true',  subject_order: 5 },
  ],
  'UKG': [
    { Subject: 'English',       Subject_code: 'ENG03', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN03', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT03', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'EVS',           Subject_code: 'EVS03', isoptional: 'false', isgrade: 'true',  isprac: 'false', subject_order: 4 },
    { Subject: 'G.K.',          Subject_code: 'GK03',  isoptional: 'true',  isgrade: 'false', isprac: 'false', subject_order: 5 },
    { Subject: 'Drawing',       Subject_code: 'DRW03', isoptional: 'true',  isgrade: 'true',  isprac: 'true',  subject_order: 6 },
  ],
  'Class I': [
    { Subject: 'English',       Subject_code: 'ENG04', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN04', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT04', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'EVS',           Subject_code: 'EVS04', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 4 },
    { Subject: 'G.K.',          Subject_code: 'GK04',  isoptional: 'true',  isgrade: 'false', isprac: 'false', subject_order: 5 },
    { Subject: 'Drawing',       Subject_code: 'DRW04', isoptional: 'true',  isgrade: 'true',  isprac: 'true',  subject_order: 6 },
  ],
  'Class II': [
    { Subject: 'English',       Subject_code: 'ENG05', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN05', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT05', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'EVS',           Subject_code: 'EVS05', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 4 },
    { Subject: 'G.K.',          Subject_code: 'GK05',  isoptional: 'true',  isgrade: 'false', isprac: 'false', subject_order: 5 },
  ],
  'Class III': [
    { Subject: 'English',       Subject_code: 'ENG06', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN06', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT06', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'EVS',           Subject_code: 'EVS06', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 4 },
    { Subject: 'Sanskrit',      Subject_code: 'SKT06', isoptional: 'true',  isgrade: 'false', isprac: 'false', subject_order: 5 },
    { Subject: 'G.K.',          Subject_code: 'GK06',  isoptional: 'true',  isgrade: 'false', isprac: 'false', subject_order: 6 },
  ],
  'Class IV': [
    { Subject: 'English',       Subject_code: 'ENG07', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN07', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT07', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'Science',       Subject_code: 'SCI07', isoptional: 'false', isgrade: 'false', isprac: 'true',  subject_order: 4 },
    { Subject: 'Social Science',Subject_code: 'SST07', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 5 },
    { Subject: 'Sanskrit',      Subject_code: 'SKT07', isoptional: 'true',  isgrade: 'false', isprac: 'false', subject_order: 6 },
  ],
  'Class V': [
    { Subject: 'English',       Subject_code: 'ENG08', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN08', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT08', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'Science',       Subject_code: 'SCI08', isoptional: 'false', isgrade: 'false', isprac: 'true',  subject_order: 4 },
    { Subject: 'Social Science',Subject_code: 'SST08', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 5 },
    { Subject: 'Sanskrit',      Subject_code: 'SKT08', isoptional: 'true',  isgrade: 'false', isprac: 'false', subject_order: 6 },
    { Subject: 'G.K.',          Subject_code: 'GK08',  isoptional: 'true',  isgrade: 'false', isprac: 'false', subject_order: 7 },
  ],
  'Class VI': [
    { Subject: 'English',       Subject_code: 'ENG09', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN09', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT09', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'Science',       Subject_code: 'SCI09', isoptional: 'false', isgrade: 'false', isprac: 'true',  subject_order: 4 },
    { Subject: 'Social Science',Subject_code: 'SST09', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 5 },
    { Subject: 'Sanskrit',      Subject_code: 'SKT09', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 6 },
    { Subject: 'Computer',      Subject_code: 'COM09', isoptional: 'true',  isgrade: 'false', isprac: 'true',  subject_order: 7 },
  ],
  'Class VII': [
    { Subject: 'English',       Subject_code: 'ENG10', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN10', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT10', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'Science',       Subject_code: 'SCI10', isoptional: 'false', isgrade: 'false', isprac: 'true',  subject_order: 4 },
    { Subject: 'Social Science',Subject_code: 'SST10', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 5 },
    { Subject: 'Sanskrit',      Subject_code: 'SKT10', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 6 },
    { Subject: 'Computer',      Subject_code: 'COM10', isoptional: 'true',  isgrade: 'false', isprac: 'true',  subject_order: 7 },
  ],
  'Class VIII': [
    { Subject: 'English',       Subject_code: 'ENG11', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN11', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT11', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'Science',       Subject_code: 'SCI11', isoptional: 'false', isgrade: 'false', isprac: 'true',  subject_order: 4 },
    { Subject: 'Social Science',Subject_code: 'SST11', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 5 },
    { Subject: 'Sanskrit',      Subject_code: 'SKT11', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 6 },
    { Subject: 'Computer',      Subject_code: 'COM11', isoptional: 'true',  isgrade: 'false', isprac: 'true',  subject_order: 7 },
  ],
  'Class IX': [
    { Subject: 'English',       Subject_code: 'ENG12', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN12', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT12', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'Science',       Subject_code: 'SCI12', isoptional: 'false', isgrade: 'false', isprac: 'true',  subject_order: 4 },
    { Subject: 'Social Science',Subject_code: 'SST12', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 5 },
    { Subject: 'Sanskrit',      Subject_code: 'SKT12', isoptional: 'true',  isgrade: 'false', isprac: 'false', subject_order: 6 },
    { Subject: 'IT',            Subject_code: 'IT12',  isoptional: 'true',  isgrade: 'false', isprac: 'true',  subject_order: 7 },
  ],
  'Class X': [
    { Subject: 'English',       Subject_code: 'ENG13', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Hindi',         Subject_code: 'HIN13', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 2 },
    { Subject: 'Mathematics',   Subject_code: 'MAT13', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 3 },
    { Subject: 'Science',       Subject_code: 'SCI13', isoptional: 'false', isgrade: 'false', isprac: 'true',  subject_order: 4 },
    { Subject: 'Social Science',Subject_code: 'SST13', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 5 },
    { Subject: 'Sanskrit',      Subject_code: 'SKT13', isoptional: 'true',  isgrade: 'false', isprac: 'false', subject_order: 6 },
    { Subject: 'IT',            Subject_code: 'IT13',  isoptional: 'true',  isgrade: 'false', isprac: 'true',  subject_order: 7 },
  ],
  'Class XI': [
    { Subject: 'English',       Subject_code: 'ENG14', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Physics',       Subject_code: 'PHY14', isoptional: 'false', isgrade: 'false', isprac: 'true',  subject_order: 2 },
    { Subject: 'Chemistry',     Subject_code: 'CHE14', isoptional: 'false', isgrade: 'false', isprac: 'true',  subject_order: 3 },
    { Subject: 'Mathematics',   Subject_code: 'MAT14', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 4 },
    { Subject: 'Biology',       Subject_code: 'BIO14', isoptional: 'true',  isgrade: 'false', isprac: 'true',  subject_order: 5 },
    { Subject: 'Computer Sc.',  Subject_code: 'CSC14', isoptional: 'true',  isgrade: 'false', isprac: 'true',  subject_order: 6 },
    { Subject: 'Physical Edu.', Subject_code: 'PHE14', isoptional: 'true',  isgrade: 'true',  isprac: 'true',  subject_order: 7 },
  ],
  'Class XII': [
    { Subject: 'English',       Subject_code: 'ENG15', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 1 },
    { Subject: 'Physics',       Subject_code: 'PHY15', isoptional: 'false', isgrade: 'false', isprac: 'true',  subject_order: 2 },
    { Subject: 'Chemistry',     Subject_code: 'CHE15', isoptional: 'false', isgrade: 'false', isprac: 'true',  subject_order: 3 },
    { Subject: 'Mathematics',   Subject_code: 'MAT15', isoptional: 'false', isgrade: 'false', isprac: 'false', subject_order: 4 },
    { Subject: 'Biology',       Subject_code: 'BIO15', isoptional: 'true',  isgrade: 'false', isprac: 'true',  subject_order: 5 },
    { Subject: 'Computer Sc.',  Subject_code: 'CSC15', isoptional: 'true',  isgrade: 'false', isprac: 'true',  subject_order: 6 },
    { Subject: 'Physical Edu.', Subject_code: 'PHE15', isoptional: 'true',  isgrade: 'true',  isprac: 'true',  subject_order: 7 },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// ASPX logic: isoptional=="false" → show "Yes" (confusing but keeping same logic)
const boolLabel = (val) => val === 'false' ? 'Yes' : 'No'
const boolTrue  = (val) => val === 'false'   // "Yes" = true visually

const SUBJECT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const subjectColor = (name = '') =>
  SUBJECT_COLORS[name.charCodeAt(0) % SUBJECT_COLORS.length]

const subjectAbbr = (name = '') =>
  name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()

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
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
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

// ─── BOOLEAN BADGE ────────────────────────────────────────────────────────────
function BoolBadge({ value, trueLabel = 'Yes', falseLabel = 'No' }) {
  const isYes = boolTrue(value)
  return isYes ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
      <CheckCircle2 className="w-3 h-3" />{trueLabel}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
      <XCircle className="w-3 h-3" />{falseLabel}
    </span>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session, className, section }) {
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
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </span>
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">{className}</span>
        </span>
        {section && (
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25">
            <span className="text-[12px] font-bold text-violet-700 dark:text-violet-400">Section: {section}</span>
          </span>
        )}
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Subject Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = subjectColor(row.Subject)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Subject */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {subjectAbbr(row.Subject)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.Subject}</span>
        </div>
      </td>

      {/* Subject Code */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-mono font-semibold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Hash className="w-3 h-3" />{row.Subject_code}
        </span>
      </td>

      {/* Is Optional */}
      <td className="px-4 py-3 text-center">
        <BoolBadge value={row.isoptional} />
      </td>

      {/* Grade Subject */}
      <td className="px-4 py-3 text-center">
        <BoolBadge value={row.isgrade} />
      </td>

      {/* Practical */}
      <td className="px-4 py-3 text-center">
        <BoolBadge value={row.isprac} />
      </td>

      {/* Subject Order */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full text-[13px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
          {row.subject_order}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = subjectColor(row.Subject)

  const flags = [
    { label: 'Optional',  value: row.isoptional, icon: Tag },
    { label: 'Grade',     value: row.isgrade,    icon: GraduationCap },
    { label: 'Practical', value: row.isprac,      icon: FlaskConical },
  ]

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {subjectAbbr(row.Subject)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.Subject}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-400 dark:text-slate-500">
              <Hash className="w-2.5 h-2.5" />{row.Subject_code}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">
              Order: <span className="font-bold text-blue-600 dark:text-blue-400">{row.subject_order}</span>
            </span>
          </div>
        </div>

        {/* Quick flag pills */}
        <div className="flex gap-1 flex-shrink-0">
          {boolTrue(row.isprac) && (
            <span className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center" title="Practical">
              <FlaskConical className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            </span>
          )}
          {boolTrue(row.isoptional) && (
            <span className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center" title="Optional">
              <Tag className="w-3 h-3 text-amber-600 dark:text-amber-400" />
            </span>
          )}
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-3 gap-2">
            {flags.map(({ label, value, icon: Icon }) => {
              const yes = boolTrue(value)
              return (
                <div
                  key={label}
                  className={`rounded-xl p-3 text-center border ${
                    yes
                      ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 mx-auto mb-1 ${yes ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`} />
                  <p className={`text-[13px] font-bold ${yes ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-400 dark:text-slate-600'}`}>
                    {boolLabel(value)}
                  </p>
                  <p className={`text-[10px] font-bold uppercase tracking-wide mt-0.5 ${yes ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                    {label}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, selectedClass, setSelectedClass, section, setSection, onShow, loading, errors }) {
  const classes  = session ? (CLASSES_BY_SESSION[session] || []) : []
  const sections = selectedClass ? (SECTIONS_BY_CLASS[selectedClass] || []) : []
  const hasSections = sections.length > 0

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease', maxHeight: '85vh', overflowY: 'auto' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Fields */}
        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => { setSession(e.target.value); setSelectedClass(''); setSection('') }}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.selectedClass} required>
            <NativeSelect
              value={selectedClass}
              onChange={e => { setSelectedClass(e.target.value); setSection('') }}
              placeholder="-- Select Class --"
              disabled={!session}
              error={errors.selectedClass}
            >
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          {hasSections && (
            <Field label="Section">
              <NativeSelect
                value={section}
                onChange={e => setSection(e.target.value)}
                placeholder="-- Select Section --"
                disabled={!selectedClass}
              >
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
          )}
        </div>
        {/* Actions */}
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
export default function SubjectReport() {
  const [session,       setSession]       = useState('')
  const [selectedClass, setSelectedClass] = useState('')
  const [section,       setSection]       = useState('')
  const [rows,          setRows]          = useState([])
  const [loading,       setLoading]       = useState(false)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [search,        setSearch]        = useState('')
  const [errors,        setErrors]        = useState({})
  const [toast,         setToast]         = useState(null)
  const [shown,         setShown]         = useState(false)
  const [shownMeta,     setShownMeta]     = useState({ session: '', class: '', section: '' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Derived
  const classes  = session ? (CLASSES_BY_SESSION[session] || []) : []
  const sections = selectedClass ? (SECTIONS_BY_CLASS[selectedClass] || []) : []
  const hasSections = sections.length > 0

  // ── Cascading dropdown handlers ───────────────────────────────────────────
  const handleSessionChange = (val) => {
    setSession(val)
    setSelectedClass('')
    setSection('')
    setErrors(p => ({ ...p, session: undefined }))
  }

  const handleClassChange = (val) => {
    setSelectedClass(val)
    setSection('')
    setErrors(p => ({ ...p, selectedClass: undefined }))
  }

  // ── Show report ───────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session)       err.session       = 'Please select a session'
    if (!selectedClass) err.selectedClass = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    // Simulate API call — replace with: fetch(`/api/subjects?class=${selectedClass}&session=${session}&section=${section}`)
    setTimeout(() => {
      const data = SUBJECT_DATA[selectedClass] || []
      setRows(data)
      setShownMeta({ session, class: selectedClass, section })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} subjects for ${selectedClass}.`)
    }, 600)
  }, [session, selectedClass, section])

  const handleReset = () => {
    setSession(''); setSelectedClass(''); setSection('')
    setRows([]); setSearch(''); setErrors({})
    setShown(false); setShownMeta({ session: '', class: '', section: '' })
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.Subject.toLowerCase().includes(q) ||
      r.Subject_code.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     filtered.length,
    optional:  filtered.filter(r => boolTrue(r.isoptional)).length,
    practical: filtered.filter(r => boolTrue(r.isprac)).length,
    grade:     filtered.filter(r => boolTrue(r.isgrade)).length,
  }), [filtered])

  const hasResults = shown && rows.length > 0
  const activeFilters = [session, selectedClass].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Subject Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Class-wise subject configuration — optional, grade-based &amp; practical flags.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => handleSessionChange(e.target.value)}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.selectedClass} required>
              <NativeSelect
                value={selectedClass}
                onChange={e => handleClassChange(e.target.value)}
                placeholder="-- Select Class --"
                disabled={!session}
                error={errors.selectedClass}
              >
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Section (conditional — matches ASPX sec_id visibility logic) */}
            <Field label="Section">
              <NativeSelect
                value={section}
                onChange={e => setSection(e.target.value)}
                placeholder="-- Select Section --"
                disabled={!selectedClass || !hasSections}
              >
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
              {selectedClass && !hasSections && (
                <p className="text-[11px] text-slate-400 dark:text-slate-600 mt-0.5">No sections for this class</p>
              )}
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
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset filters"
              >
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
          {selectedClass ? `${selectedClass}${section ? ` · ${section}` : ''}` : 'Select Class'}
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

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        section={section}
        setSection={setSection}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownMeta.session} className={shownMeta.class} section={shownMeta.section} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={BookOpen}      label="Total Subjects"     value={stats.total}     color="blue"    />
            <SummaryCard icon={Tag}           label="Optional Subjects"  value={stats.optional}  color="amber"   />
            <SummaryCard icon={FlaskConical}  label="With Practical"     value={stats.practical} color="emerald" />
            <SummaryCard icon={GraduationCap} label="Grade Subjects"     value={stats.grade}     color="violet"  />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Subjects</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownMeta.class}</span>
                {shownMeta.section && (
                  <span className="text-[13px] text-slate-400 dark:text-slate-500">· Sec {shownMeta.section}</span>
                )}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} subject{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search subject or code…"
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
                <span className="font-semibold">Yes</span> = feature enabled for this subject. Optional / Grade / Practical flags are configurable per class.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No subjects match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Subject', 'Subject Code', 'Is Optional', 'Grade Subject', 'Practical', 'Subject Order'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.Subject_code}-${i}`} row={row} idx={i + 1} />
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
                  <span className="text-[13px]">No subjects match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see subject flags.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.Subject_code}-${i}`} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile summary footer */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4 mt-2">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <ListOrdered className="w-4 h-4" /> Summary — {filtered.length} Subjects
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.total}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Subjects</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{stats.optional}</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Optional</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{stats.practical}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Practical</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{stats.grade}</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Grade Based</p>
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
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> subjects
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
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and class, then click <strong>Show</strong> to view subjects.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
