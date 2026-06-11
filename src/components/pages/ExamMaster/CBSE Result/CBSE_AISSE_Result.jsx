/**
 * CBSE_AISSE_Result.jsx
 * Folder: src/pages/Reports/Exam/CBSE_AISSE_Result.jsx
 *
 * Converts legacy ASPX "CBSE AISSE Result: OVER ALL" to fully-responsive React + Tailwind.
 * Reference theme: StrengthReport.jsx (same design system)
 *
 * Report Types:
 *  1 - Over All
 *  3 - Top Five Students
 *  4 - Subject Aggregate
 *  5 - Highest Subject Marks
 *  6 - Comparative Result Analysis
 *  7 - Result at a Glance
 *  8 - Result Analysis
 *  9 - Section Wise Result Analysis
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Search, Info,
  FileSpreadsheet, BookOpen, Building2, MapPin, TrendingUp,
  Award, Users, BarChart3, Star, Trophy, Layers,
  GraduationCap, ClipboardList, PieChart, Target,
  ArrowUpRight, Minus, CheckCircle2, XCircle, Clock
} from 'lucide-react'

// ─── SCHOOL INFO ──────────────────────────────────────────────────────────────
const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const REPORT_TYPES = [
  { value: '1', label: 'Over All',                   icon: BarChart3 },
  { value: '3', label: 'Top Five Students',           icon: Trophy },
  { value: '4', label: 'Subject Aggregate',           icon: Layers },
  { value: '5', label: 'Highest Subject Marks',       icon: Star },
  { value: '6', label: 'Comparative Result Analysis', icon: TrendingUp },
  { value: '7', label: 'Result at a Glance',          icon: PieChart },
  { value: '8', label: 'Result Analysis',             icon: ClipboardList },
  { value: '9', label: 'Section Wise Result Analysis',icon: Target },
]

const STREAMS = ['Science', 'Commerce', 'Humanities']
const SECTIONS = ['A', 'B', 'C', 'D']

// ─── DUMMY DATA PER REPORT TYPE ───────────────────────────────────────────────

// Type 1: Over All
const OVERALL_DATA = {
  '10': {
    '2025-26': {
      appeared: 98, passed: 94, failed: 4, compartment: 2,
      passPercent: 95.92, distinctions: 32, firstDiv: 41, secondDiv: 14, thirdDiv: 7,
      sections: [
        { section:'A', appeared:49, passed:47, failed:2, passPercent:95.92, topScore:98.2, avgScore:82.4 },
        { section:'B', appeared:49, passed:47, failed:2, passPercent:95.92, topScore:97.0, avgScore:80.1 },
      ]
    },
    '2024-25': {
      appeared: 92, passed: 87, failed: 5, compartment: 3,
      passPercent: 94.57, distinctions: 28, firstDiv: 37, secondDiv: 15, thirdDiv: 7,
      sections: [
        { section:'A', appeared:46, passed:43, failed:3, passPercent:93.48, topScore:97.4, avgScore:80.2 },
        { section:'B', appeared:46, passed:44, failed:2, passPercent:95.65, topScore:96.8, avgScore:79.8 },
      ]
    },
  },
  '12': {
    '2025-26': {
      appeared: 118, passed: 112, failed: 6, compartment: 3,
      passPercent: 94.92, distinctions: 45, firstDiv: 38, secondDiv: 21, thirdDiv: 8,
      sections: [
        { section:'A (Science)',   appeared:62, passed:59, failed:3, passPercent:95.16, topScore:99.0, avgScore:84.2 },
        { section:'B (Commerce)', appeared:56, passed:53, failed:3, passPercent:94.64, topScore:97.6, avgScore:82.1 },
      ]
    },
    '2024-25': {
      appeared: 110, passed: 104, failed: 6, compartment: 4,
      passPercent: 94.55, distinctions: 40, firstDiv: 34, secondDiv: 20, thirdDiv: 10,
      sections: [
        { section:'A (Science)',   appeared:58, passed:55, failed:3, passPercent:94.83, topScore:98.4, avgScore:82.0 },
        { section:'B (Commerce)', appeared:52, passed:49, failed:3, passPercent:94.23, topScore:96.2, avgScore:80.6 },
      ]
    },
  },
}

// Type 3: Top Five Students
const TOP5_DATA = {
  '10': {
    '2025-26': [
      { rank:1, name:'Priya Sharma',    rollNo:'1001A', section:'A', percentage:98.20, grade:'A1' },
      { rank:2, name:'Rohan Gupta',     rollNo:'1002A', section:'A', percentage:97.60, grade:'A1' },
      { rank:3, name:'Ananya Singh',    rollNo:'1003B', section:'B', percentage:97.00, grade:'A1' },
      { rank:4, name:'Vikram Joshi',    rollNo:'1004A', section:'A', percentage:96.40, grade:'A1' },
      { rank:5, name:'Sneha Rawat',     rollNo:'1005B', section:'B', percentage:96.00, grade:'A1' },
    ],
    '2024-25': [
      { rank:1, name:'Aditi Negi',      rollNo:'1001A', section:'A', percentage:97.40, grade:'A1' },
      { rank:2, name:'Rahul Bisht',     rollNo:'1002B', section:'B', percentage:96.80, grade:'A1' },
      { rank:3, name:'Pooja Chauhan',   rollNo:'1003A', section:'A', percentage:96.20, grade:'A1' },
      { rank:4, name:'Amit Thakur',     rollNo:'1004B', section:'B', percentage:95.60, grade:'A1' },
      { rank:5, name:'Kavya Arora',     rollNo:'1005A', section:'A', percentage:95.00, grade:'A1' },
    ],
  },
  '12': {
    '2025-26': [
      { rank:1, name:'Harshita Dobhal', rollNo:'2001A', section:'A (Science)',   percentage:99.00, grade:'A1' },
      { rank:2, name:'Tanvi Rana',      rollNo:'2002A', section:'A (Science)',   percentage:98.40, grade:'A1' },
      { rank:3, name:'Kunal Mehra',     rollNo:'2003B', section:'B (Commerce)', percentage:97.60, grade:'A1' },
      { rank:4, name:'Sakshi Verma',    rollNo:'2004A', section:'A (Science)',   percentage:97.20, grade:'A1' },
      { rank:5, name:'Arjun Pant',      rollNo:'2005B', section:'B (Commerce)', percentage:96.80, grade:'A1' },
    ],
    '2024-25': [
      { rank:1, name:'Divya Uniyal',    rollNo:'2001A', section:'A (Science)',   percentage:98.40, grade:'A1' },
      { rank:2, name:'Mohit Kandpal',   rollNo:'2002B', section:'B (Commerce)', percentage:97.80, grade:'A1' },
      { rank:3, name:'Ritu Bhatt',      rollNo:'2003A', section:'A (Science)',   percentage:97.20, grade:'A1' },
      { rank:4, name:'Aakash Lal',      rollNo:'2004B', section:'B (Commerce)', percentage:96.60, grade:'A1' },
      { rank:5, name:'Nidhi Gusain',    rollNo:'2005A', section:'A (Science)',   percentage:96.00, grade:'A1' },
    ],
  },
}

// Type 4: Subject Aggregate
const SUBJECT_AGG_DATA = {
  '10': {
    '2025-26': [
      { subject:'Mathematics',       avgMarks:78.4, highest:100, lowest:34, passPercent:91.8 },
      { subject:'Science',           avgMarks:80.2, highest:99,  lowest:38, passPercent:93.9 },
      { subject:'Social Science',    avgMarks:76.6, highest:98,  lowest:32, passPercent:89.8 },
      { subject:'English',           avgMarks:82.0, highest:99,  lowest:42, passPercent:96.9 },
      { subject:'Hindi',             avgMarks:74.8, highest:98,  lowest:30, passPercent:88.8 },
    ],
  },
  '12': {
    '2025-26': [
      { subject:'Physics',           avgMarks:76.2, highest:100, lowest:30, passPercent:88.1 },
      { subject:'Chemistry',         avgMarks:74.8, highest:99,  lowest:28, passPercent:86.4 },
      { subject:'Mathematics',       avgMarks:79.6, highest:100, lowest:34, passPercent:90.7 },
      { subject:'Biology',           avgMarks:80.4, highest:99,  lowest:36, passPercent:92.4 },
      { subject:'English',           avgMarks:83.2, highest:99,  lowest:44, passPercent:97.5 },
      { subject:'Accountancy',       avgMarks:77.0, highest:100, lowest:32, passPercent:89.8 },
      { subject:'Business Studies',  avgMarks:78.8, highest:98,  lowest:36, passPercent:91.5 },
      { subject:'Economics',         avgMarks:75.4, highest:97,  lowest:30, passPercent:87.3 },
    ],
  },
}

// Type 5: Highest Subject Marks
const HIGHEST_MARKS_DATA = {
  '10': {
    '2025-26': [
      { subject:'Mathematics',    name:'Priya Sharma',    rollNo:'1001A', marks:100, maxMarks:100, section:'A' },
      { subject:'Science',        name:'Rohan Gupta',     rollNo:'1002A', marks:99,  maxMarks:100, section:'A' },
      { subject:'Social Science', name:'Ananya Singh',    rollNo:'1003B', marks:98,  maxMarks:100, section:'B' },
      { subject:'English',        name:'Sneha Rawat',     rollNo:'1005B', marks:99,  maxMarks:100, section:'B' },
      { subject:'Hindi',          name:'Vikram Joshi',    rollNo:'1004A', marks:98,  maxMarks:100, section:'A' },
    ],
  },
  '12': {
    '2025-26': [
      { subject:'Physics',          name:'Harshita Dobhal',rollNo:'2001A', marks:100, maxMarks:100, section:'A (Science)'   },
      { subject:'Chemistry',        name:'Tanvi Rana',      rollNo:'2002A', marks:99,  maxMarks:100, section:'A (Science)'   },
      { subject:'Mathematics',      name:'Kunal Mehra',     rollNo:'2003B', marks:100, maxMarks:100, section:'B (Commerce)'  },
      { subject:'Biology',          name:'Sakshi Verma',    rollNo:'2004A', marks:99,  maxMarks:100, section:'A (Science)'   },
      { subject:'English',          name:'Arjun Pant',      rollNo:'2005B', marks:99,  maxMarks:100, section:'B (Commerce)'  },
      { subject:'Accountancy',      name:'Divya Uniyal',    rollNo:'2006B', marks:100, maxMarks:100, section:'B (Commerce)'  },
    ],
  },
}

// Type 6: Comparative Result Analysis
const COMPARATIVE_DATA = {
  '10': [
    { session:'2022-23', appeared:84, passed:79, passPercent:94.05, distinctions:22, avgPercent:76.4 },
    { session:'2023-24', appeared:88, passed:83, passPercent:94.32, distinctions:26, avgPercent:78.2 },
    { session:'2024-25', appeared:92, passed:87, passPercent:94.57, distinctions:28, avgPercent:80.2 },
    { session:'2025-26', appeared:98, passed:94, passPercent:95.92, distinctions:32, avgPercent:82.4 },
  ],
  '12': [
    { session:'2022-23', appeared:96, passed:90, passPercent:93.75, distinctions:30, avgPercent:78.0 },
    { session:'2023-24', appeared:102,passed:97, passPercent:95.10, distinctions:36, avgPercent:80.6 },
    { session:'2024-25', appeared:110,passed:104,passPercent:94.55, distinctions:40, avgPercent:82.0 },
    { session:'2025-26', appeared:118,passed:112,passPercent:94.92, distinctions:45, avgPercent:84.2 },
  ],
}

// Type 7: Result at a Glance
const GLANCE_DATA = {
  '10': {
    '2025-26': {
      registered:100, appeared:98, absent:2, passed:94, failed:4, compartment:2,
      passPercent:95.92, distinctions:32, firstDiv:41, secondDiv:14, thirdDiv:7,
      gradeDistribution:[
        { grade:'A1 (91-100)', count:32 }, { grade:'A2 (81-90)', count:41 },
        { grade:'B1 (71-80)', count:14 }, { grade:'B2 (61-70)', count:5 },
        { grade:'C1 (51-60)', count:2 }, { grade:'Failed', count:4 },
      ]
    },
  },
  '12': {
    '2025-26': {
      registered:120, appeared:118, absent:2, passed:112, failed:6, compartment:3,
      passPercent:94.92, distinctions:45, firstDiv:38, secondDiv:21, thirdDiv:8,
      gradeDistribution:[
        { grade:'A1 (91-100)', count:45 }, { grade:'A2 (81-90)', count:38 },
        { grade:'B1 (71-80)', count:21 }, { grade:'B2 (61-70)', count:8 },
        { grade:'C1 (51-60)', count:0 }, { grade:'Failed', count:6 },
      ]
    },
  },
}

// Type 8: Result Analysis
const RESULT_ANALYSIS_DATA = {
  '10': {
    '2025-26': [
      { category:'Appeared',     count:98,  color:'blue' },
      { category:'Passed',       count:94,  color:'emerald' },
      { category:'Failed',       count:4,   color:'rose' },
      { category:'Compartment',  count:2,   color:'amber' },
      { category:'Distinction',  count:32,  color:'violet' },
      { category:'1st Division', count:41,  color:'cyan' },
      { category:'2nd Division', count:14,  color:'orange' },
      { category:'3rd Division', count:7,   color:'teal' },
    ]
  },
  '12': {
    '2025-26': [
      { category:'Appeared',     count:118, color:'blue' },
      { category:'Passed',       count:112, color:'emerald' },
      { category:'Failed',       count:6,   color:'rose' },
      { category:'Compartment',  count:3,   color:'amber' },
      { category:'Distinction',  count:45,  color:'violet' },
      { category:'1st Division', count:38,  color:'cyan' },
      { category:'2nd Division', count:21,  color:'orange' },
      { category:'3rd Division', count:8,   color:'teal' },
    ]
  },
}

// Type 9: Section Wise Result Analysis
const SECTION_RESULT_DATA = {
  '10': {
    '2025-26': [
      { section:'A', appeared:49, passed:47, failed:2, compartment:1, passPercent:95.92, topScore:98.2, avgScore:82.4 },
      { section:'B', appeared:49, passed:47, failed:2, compartment:1, passPercent:95.92, topScore:97.0, avgScore:80.1 },
    ],
  },
  '12': {
    '2025-26': [
      { section:'A (Science)',   appeared:62, passed:59, failed:3, compartment:2, passPercent:95.16, topScore:99.0, avgScore:84.2 },
      { section:'B (Commerce)', appeared:56, passed:53, failed:3, compartment:1, passPercent:94.64, topScore:97.6, avgScore:82.1 },
    ],
  },
}

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  blue:    { bg:'bg-blue-50 dark:bg-blue-500/10',    text:'text-blue-700 dark:text-blue-300',    border:'border-blue-100 dark:border-blue-500/20',    badge:'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300' },
  emerald: { bg:'bg-emerald-50 dark:bg-emerald-500/10', text:'text-emerald-700 dark:text-emerald-300', border:'border-emerald-100 dark:border-emerald-500/20', badge:'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300' },
  rose:    { bg:'bg-rose-50 dark:bg-rose-500/10',    text:'text-rose-700 dark:text-rose-300',    border:'border-rose-100 dark:border-rose-500/20',    badge:'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300' },
  amber:   { bg:'bg-amber-50 dark:bg-amber-500/10',  text:'text-amber-700 dark:text-amber-300',  border:'border-amber-100 dark:border-amber-500/20',  badge:'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300' },
  violet:  { bg:'bg-violet-50 dark:bg-violet-500/10',text:'text-violet-700 dark:text-violet-300',border:'border-violet-100 dark:border-violet-500/20',badge:'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300' },
  cyan:    { bg:'bg-cyan-50 dark:bg-cyan-500/10',    text:'text-cyan-700 dark:text-cyan-300',    border:'border-cyan-100 dark:border-cyan-500/20',    badge:'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300' },
  orange:  { bg:'bg-orange-50 dark:bg-orange-500/10',text:'text-orange-700 dark:text-orange-300',border:'border-orange-100 dark:border-orange-500/20',badge:'bg-orange-100 text-orange-800 dark:bg-orange-500/20 dark:text-orange-300' },
  teal:    { bg:'bg-teal-50 dark:bg-teal-500/10',    text:'text-teal-700 dark:text-teal-300',    border:'border-teal-100 dark:border-teal-500/20',    badge:'bg-teal-100 text-teal-800 dark:bg-teal-500/20 dark:text-teal-300' },
}

const RANK_MEDAL = { 1:'🥇', 2:'🥈', 3:'🥉' }

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
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────
function SchoolHeader({ session, classLabel, reportLabel }) {
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
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </span>
        <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">Class: {classLabel}</span>
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        CBSE AISSE — {reportLabel}
      </p>
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color = 'blue', sub }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── CARD WRAPPER ─────────────────────────────────────────────────────────────
function ResultCard({ title, subtitle, children, action }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">{title}</span>
        {subtitle && <span className="text-[12px] text-slate-400">{subtitle}</span>}
        {action}
      </div>
      <div className="p-0">{children}</div>
    </div>
  )
}

// ─── REPORT TYPE 1: OVERALL ───────────────────────────────────────────────────
function OverallReport({ data }) {
  if (!data) return <EmptySection msg="No data available for selected filters." />
  const { appeared, passed, failed, compartment, passPercent, distinctions, firstDiv, secondDiv, thirdDiv, sections } = data

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={Users}     label="Appeared"      value={appeared}               color="blue" />
        <SummaryCard icon={CheckCircle2} label="Passed"     value={passed}                 color="emerald" />
        <SummaryCard icon={XCircle}   label="Failed"        value={failed}                 color="rose" />
        <SummaryCard icon={TrendingUp} label="Pass %"       value={`${passPercent}%`}      color="amber" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={Star}    label="Distinction"     value={distinctions}            color="violet" />
        <SummaryCard icon={Award}   label="1st Division"    value={firstDiv}                color="cyan" />
        <SummaryCard icon={Award}   label="2nd Division"    value={secondDiv}               color="amber" />
        <SummaryCard icon={Clock}   label="Compartment"     value={compartment}             color="rose" />
      </div>

      {/* Section breakdown */}
      <ResultCard title="Section-wise Breakdown">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                {['Section','Appeared','Passed','Failed','Pass %','Top Score','Avg Score'].map((h,i) => (
                  <th key={i} className="px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sections.map((s, i) => (
                <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                  <td className="px-5 py-3 text-center"><span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold text-[13px]">{s.section}</span></td>
                  <td className="px-5 py-3 text-center text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{s.appeared}</td>
                  <td className="px-5 py-3 text-center"><span className="px-2 py-0.5 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">{s.passed}</span></td>
                  <td className="px-5 py-3 text-center"><span className="px-2 py-0.5 rounded-lg text-[12px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 tabular-nums">{s.failed}</span></td>
                  <td className="px-5 py-3 text-center"><span className="px-2 py-0.5 rounded-lg text-[12px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 tabular-nums">{s.passPercent}%</span></td>
                  <td className="px-5 py-3 text-center text-[13px] font-semibold text-violet-700 dark:text-violet-300 tabular-nums">{s.topScore}</td>
                  <td className="px-5 py-3 text-center text-[13px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">{s.avgScore}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Mobile */}
        <div className="md:hidden p-4 space-y-3">
          {sections.map((s, i) => (
            <div key={i} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/50 dark:bg-white/[0.02] p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="inline-flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold text-[13px] flex items-center justify-center">{s.section}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 text-[14px]">Section {s.section}</span>
                </span>
                <span className="text-[13px] font-bold text-amber-700 dark:text-amber-400">{s.passPercent}% pass</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label:'Appeared', val:s.appeared, color:'text-blue-700 dark:text-blue-300' },
                  { label:'Passed',   val:s.passed,   color:'text-emerald-700 dark:text-emerald-300' },
                  { label:'Failed',   val:s.failed,   color:'text-rose-700 dark:text-rose-300' },
                  { label:'Top Score',val:s.topScore,  color:'text-violet-700 dark:text-violet-300' },
                  { label:'Avg Score',val:s.avgScore,  color:'text-slate-700 dark:text-slate-200' },
                ].map((item,j) => (
                  <div key={j} className="text-center bg-white dark:bg-[#1e2238] rounded-lg p-2 border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                    <p className={`text-[16px] font-bold tabular-nums ${item.color}`}>{item.val}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ResultCard>
    </div>
  )
}

// ─── REPORT TYPE 3: TOP FIVE STUDENTS ────────────────────────────────────────
function TopFiveReport({ data }) {
  if (!data || data.length === 0) return <EmptySection msg="No data available for selected filters." />

  return (
    <ResultCard title="Top Five Students" subtitle={`${data.length} toppers`}>
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['Rank','Student Name','Roll No.','Section','Percentage','Grade'].map((h,i) => (
                <th key={i} className="px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s) => (
              <tr key={s.rank} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                <td className="px-5 py-3.5 text-center">
                  <span className="text-[20px]">{RANK_MEDAL[s.rank] || `#${s.rank}`}</span>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                      {s.name.split(' ').map(n => n[0]).join('').slice(0,2)}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{s.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-center text-[13px] font-mono text-slate-500 dark:text-slate-400">{s.rollNo}</td>
                <td className="px-5 py-3.5 text-center"><span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[12px] font-semibold">{s.section}</span></td>
                <td className="px-5 py-3.5 text-center">
                  <span className={`px-3 py-1 rounded-lg text-[13px] font-bold tabular-nums ${s.percentage >= 95 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'}`}>
                    {s.percentage}%
                  </span>
                </td>
                <td className="px-5 py-3.5 text-center"><span className="px-2.5 py-1 rounded-lg bg-violet-100 text-violet-800 dark:bg-violet-500/15 dark:text-violet-300 text-[12px] font-bold">{s.grade}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile: podium cards */}
      <div className="md:hidden p-4 space-y-3">
        {data.map((s) => (
          <div key={s.rank} className={`rounded-xl border p-4 ${s.rank === 1 ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/50 dark:bg-amber-500/5' : 'border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/50 dark:bg-white/[0.02]'}`}>
            <div className="flex items-center gap-3">
              <span className="text-[28px] flex-shrink-0">{RANK_MEDAL[s.rank] || <span className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 font-bold text-[14px] flex items-center justify-center">#{s.rank}</span>}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">Roll: {s.rollNo} · Sec: {s.section}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{s.percentage}%</p>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300">{s.grade}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ResultCard>
  )
}

// ─── REPORT TYPE 4: SUBJECT AGGREGATE ────────────────────────────────────────
function SubjectAggregateReport({ data }) {
  if (!data || data.length === 0) return <EmptySection msg="No data available for selected filters." />

  return (
    <ResultCard title="Subject-wise Aggregate" subtitle={`${data.length} subjects`}>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['S.No.','Subject','Avg Marks','Highest','Lowest','Pass %'].map((h,i) => (
                <th key={i} className="px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-center text-[12px] text-slate-400 tabular-nums">{i+1}</td>
                <td className="px-5 py-3 text-[13px] font-semibold text-slate-700 dark:text-slate-200">{s.subject}</td>
                <td className="px-5 py-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold text-[12px] tabular-nums">{s.avgMarks}</span></td>
                <td className="px-5 py-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-[12px] tabular-nums">{s.highest}</span></td>
                <td className="px-5 py-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold text-[12px] tabular-nums">{s.lowest}</span></td>
                <td className="px-5 py-3 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-16 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width:`${s.passPercent}%` }} />
                    </div>
                    <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">{s.passPercent}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden p-4 space-y-3">
        {data.map((s, i) => (
          <div key={i} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/50 dark:bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{s.subject}</span>
              <span className="text-[12px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300">{s.passPercent}% pass</span>
            </div>
            <div className="mb-2">
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{ width:`${s.passPercent}%` }} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                {label:'Avg', val:s.avgMarks, color:'text-blue-700 dark:text-blue-300'},
                {label:'Highest', val:s.highest, color:'text-emerald-700 dark:text-emerald-300'},
                {label:'Lowest', val:s.lowest, color:'text-rose-700 dark:text-rose-300'},
              ].map((item,j) => (
                <div key={j} className="text-center bg-white dark:bg-[#1e2238] rounded-lg p-2 border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                  <p className={`text-[16px] font-bold tabular-nums ${item.color}`}>{item.val}</p>
                  <p className="text-[10px] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ResultCard>
  )
}

// ─── REPORT TYPE 5: HIGHEST SUBJECT MARKS ────────────────────────────────────
function HighestMarksReport({ data }) {
  if (!data || data.length === 0) return <EmptySection msg="No data available for selected filters." />

  return (
    <ResultCard title="Highest Marks — Subject Wise" subtitle={`${data.length} subjects`}>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['S.No.','Subject','Student Name','Roll No.','Section','Marks / Max'].map((h,i) => (
                <th key={i} className="px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s,i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                <td className="px-5 py-3 text-center text-[12px] text-slate-400 tabular-nums">{i+1}</td>
                <td className="px-5 py-3 text-[13px] font-semibold text-slate-700 dark:text-slate-200">{s.subject}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                    </span>
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{s.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-center text-[12px] font-mono text-slate-500 dark:text-slate-400">{s.rollNo}</td>
                <td className="px-5 py-3 text-center"><span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[12px] font-semibold">{s.section}</span></td>
                <td className="px-5 py-3 text-center">
                  <span className={`px-3 py-1 rounded-lg text-[13px] font-bold tabular-nums ${s.marks === s.maxMarks ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300' : 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-300'}`}>
                    {s.marks}/{s.maxMarks}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden p-4 space-y-3">
        {data.map((s,i) => (
          <div key={i} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/50 dark:bg-white/[0.02] p-4 flex items-center gap-3">
            <span className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
              {s.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
              <p className="text-[11px] text-slate-400">{s.subject} · Roll: {s.rollNo}</p>
              <p className="text-[11px] text-slate-400">Section: {s.section}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-[20px] font-bold tabular-nums ${s.marks===s.maxMarks ? 'text-emerald-700 dark:text-emerald-300':'text-blue-700 dark:text-blue-300'}`}>{s.marks}</p>
              <p className="text-[10px] text-slate-400">/{s.maxMarks}</p>
            </div>
          </div>
        ))}
      </div>
    </ResultCard>
  )
}

// ─── REPORT TYPE 6: COMPARATIVE RESULT ANALYSIS ───────────────────────────────
function ComparativeReport({ data }) {
  if (!data || data.length === 0) return <EmptySection msg="No data available for selected filters." />

  return (
    <ResultCard title="Comparative Result Analysis" subtitle="Year on Year">
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['Session','Appeared','Passed','Pass %','Distinctions','Avg %'].map((h,i)=>(
                <th key={i} className="px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => {
              const prev = data[i - 1]
              const trend = prev ? (r.passPercent > prev.passPercent ? 'up' : r.passPercent < prev.passPercent ? 'down' : 'flat') : null
              return (
                <tr key={i} className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] ${i === data.length - 1 ? 'bg-blue-50/30 dark:bg-blue-500/[0.03]' : ''}`}>
                  <td className="px-5 py-3 text-center">
                    <span className={`px-3 py-1 rounded-lg text-[12px] font-bold ${i===data.length-1 ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{r.session}</span>
                  </td>
                  <td className="px-5 py-3 text-center text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{r.appeared}</td>
                  <td className="px-5 py-3 text-center text-[13px] font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">{r.passed}</td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      {trend === 'up' && <ArrowUpRight className="w-3.5 h-3.5 text-emerald-500" />}
                      {trend === 'down' && <ArrowUpRight className="w-3.5 h-3.5 text-rose-500 rotate-90" />}
                      {trend === 'flat' && <Minus className="w-3.5 h-3.5 text-slate-400" />}
                      <span className={`px-2 py-0.5 rounded-lg text-[12px] font-bold tabular-nums ${r.passPercent>=95?'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300':'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300'}`}>{r.passPercent}%</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-center text-[13px] font-semibold text-violet-700 dark:text-violet-300 tabular-nums">{r.distinctions}</td>
                  <td className="px-5 py-3 text-center text-[13px] font-semibold text-blue-700 dark:text-blue-300 tabular-nums">{r.avgPercent}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden p-4 space-y-3">
        {data.map((r, i) => {
          const isLatest = i === data.length - 1
          return (
            <div key={i} className={`rounded-xl border p-4 ${isLatest ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/5' : 'border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/50 dark:bg-white/[0.02]'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[13px] font-bold px-3 py-1 rounded-lg ${isLatest ? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>{r.session}{isLatest && ' ✦'}</span>
                <span className={`text-[16px] font-bold tabular-nums ${r.passPercent>=95?'text-emerald-700 dark:text-emerald-300':'text-amber-700 dark:text-amber-300'}`}>{r.passPercent}% pass</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[
                  {label:'Appeared',val:r.appeared,color:'text-blue-700 dark:text-blue-300'},
                  {label:'Passed',val:r.passed,color:'text-emerald-700 dark:text-emerald-300'},
                  {label:'Distinc.',val:r.distinctions,color:'text-violet-700 dark:text-violet-300'},
                  {label:'Avg %',val:r.avgPercent+'%',color:'text-slate-700 dark:text-slate-200'},
                ].map((item,j)=>(
                  <div key={j} className="text-center bg-white dark:bg-[#1e2238] rounded-lg p-2 border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                    <p className={`text-[14px] font-bold tabular-nums ${item.color}`}>{item.val}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </ResultCard>
  )
}

// ─── REPORT TYPE 7: RESULT AT A GLANCE ───────────────────────────────────────
function GlanceReport({ data }) {
  if (!data) return <EmptySection msg="No data available for selected filters." />

  const { registered, appeared, absent, passed, failed, compartment, passPercent, distinctions, firstDiv, secondDiv, thirdDiv, gradeDistribution } = data
  const maxCount = Math.max(...gradeDistribution.map(g => g.count))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SummaryCard icon={Users}       label="Registered"    value={registered}        color="blue" />
        <SummaryCard icon={Users}       label="Appeared"      value={appeared}          color="cyan" />
        <SummaryCard icon={CheckCircle2}label="Passed"        value={passed}            color="emerald" />
        <SummaryCard icon={XCircle}     label="Failed"        value={failed}            color="rose" />
        <SummaryCard icon={Clock}       label="Compartment"   value={compartment}       color="amber" />
        <SummaryCard icon={TrendingUp}  label="Pass %"        value={`${passPercent}%`} color="violet" />
      </div>
      <ResultCard title="Grade Distribution">
        <div className="p-5 space-y-3">
          {gradeDistribution.map((g, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 w-32 flex-shrink-0">{g.grade}</span>
              <div className="flex-1 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                <div
                  className={`h-full rounded-lg transition-all duration-700 ${g.grade.includes('Failed') ? 'bg-rose-400' : 'bg-blue-500 dark:bg-indigo-500'}`}
                  style={{ width: maxCount ? `${(g.count/maxCount)*100}%` : '0%' }}
                />
                <span className="absolute inset-0 flex items-center px-2 text-[11px] font-bold text-white">{g.count > 0 ? g.count : ''}</span>
              </div>
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums w-8 text-right">{g.count}</span>
            </div>
          ))}
        </div>
      </ResultCard>
    </div>
  )
}

// ─── REPORT TYPE 8: RESULT ANALYSIS ──────────────────────────────────────────
function ResultAnalysisReport({ data }) {
  if (!data || data.length === 0) return <EmptySection msg="No data available for selected filters." />

  return (
    <ResultCard title="Result Analysis">
      <div className="p-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {data.map((item, i) => {
            const c = CATEGORY_COLORS[item.color] || CATEGORY_COLORS.blue
            return (
              <div key={i} className={`rounded-xl border p-4 text-center ${c.bg} ${c.border}`}>
                <p className={`text-[28px] font-extrabold tabular-nums leading-tight ${c.text}`}>{item.count}</p>
                <p className={`text-[11px] font-bold uppercase tracking-wide mt-1 ${c.text} opacity-80`}>{item.category}</p>
              </div>
            )
          })}
        </div>
      </div>
    </ResultCard>
  )
}

// ─── REPORT TYPE 9: SECTION WISE RESULT ANALYSIS ─────────────────────────────
function SectionWiseReport({ data }) {
  if (!data || data.length === 0) return <EmptySection msg="No data available for selected filters." />

  return (
    <ResultCard title="Section-wise Result Analysis" subtitle={`${data.length} sections`}>
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['Section','Appeared','Passed','Failed','Compartment','Pass %','Top Score','Avg Score'].map((h,i)=>(
                <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((s,i)=>(
              <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-center"><span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold text-[12px]">{s.section}</span></td>
                <td className="px-4 py-3 text-center text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{s.appeared}</td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold text-[12px] tabular-nums">{s.passed}</span></td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 font-semibold text-[12px] tabular-nums">{s.failed}</span></td>
                <td className="px-4 py-3 text-center"><span className="px-2 py-0.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-semibold text-[12px] tabular-nums">{s.compartment}</span></td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center gap-2 justify-center">
                    <div className="w-14 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{width:`${s.passPercent}%`}} />
                    </div>
                    <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{s.passPercent}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center text-[13px] font-semibold text-violet-700 dark:text-violet-300 tabular-nums">{s.topScore}</td>
                <td className="px-4 py-3 text-center text-[13px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">{s.avgScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden p-4 space-y-3">
        {data.map((s,i)=>(
          <div key={i} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/50 dark:bg-white/[0.02] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="px-3 py-1 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold text-[14px]">{s.section}</span>
              <span className="text-[16px] font-bold text-emerald-700 dark:text-emerald-300">{s.passPercent}%</span>
            </div>
            <div className="mb-3">
              <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500" style={{width:`${s.passPercent}%`}} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                {label:'Appeared',val:s.appeared,color:'text-blue-700 dark:text-blue-300'},
                {label:'Passed',val:s.passed,color:'text-emerald-700 dark:text-emerald-300'},
                {label:'Failed',val:s.failed,color:'text-rose-700 dark:text-rose-300'},
                {label:'Compt.',val:s.compartment,color:'text-amber-700 dark:text-amber-300'},
                {label:'Top Score',val:s.topScore,color:'text-violet-700 dark:text-violet-300'},
                {label:'Avg Score',val:s.avgScore,color:'text-slate-700 dark:text-slate-200'},
              ].map((item,j)=>(
                <div key={j} className="text-center bg-white dark:bg-[#1e2238] rounded-lg p-2 border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                  <p className={`text-[15px] font-bold tabular-nums ${item.color}`}>{item.val}</p>
                  <p className="text-[10px] text-slate-400">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ResultCard>
  )
}

// ─── EMPTY & LOADING STATES ───────────────────────────────────────────────────
function EmptySection({ msg }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
      <Info className="w-8 h-8 opacity-40" />
      <p className="text-[13px]">{msg}</p>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, values, setValues, onShow, loading, errors }) {
  if (!open) return null
  const needsStream = values.classVal === '12'
  const needsSection = values.reportType === '9'

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[85vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
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
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={values.session} onChange={e=>setValues(p=>({...p,session:e.target.value}))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s=><option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class">
            <NativeSelect value={values.classVal} onChange={e=>setValues(p=>({...p,classVal:e.target.value}))}>
              <option value="10">Class 10th</option>
              <option value="12">Class 12th</option>
            </NativeSelect>
          </Field>
          <Field label="Report Type">
            <NativeSelect value={values.reportType} onChange={e=>setValues(p=>({...p,reportType:e.target.value}))}>
              {REPORT_TYPES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
            </NativeSelect>
          </Field>
          {needsStream && (
            <Field label="Stream">
              <NativeSelect value={values.stream} onChange={e=>setValues(p=>({...p,stream:e.target.value}))}>
                {STREAMS.map(s=><option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
          )}
          {needsSection && (
            <Field label="Section">
              <NativeSelect value={values.section} onChange={e=>setValues(p=>({...p,section:e.target.value}))}>
                {SECTIONS.map(s=><option key={s} value={s}>Section {s}</option>)}
              </NativeSelect>
            </Field>
          )}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={()=>{onShow();onClose()}} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function CBSEAISSEResult() {
  const [values, setValues] = useState({ session: '', classVal: '10', reportType: '1', stream: 'Science', section: 'A' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [reportData, setReportData] = useState(null)
  const [shownMeta, setShownMeta] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Determines if stream/section selectors should show
  const needsStream  = values.classVal === '12'
  const needsSection = values.reportType === '9'

  // ── Show Report ────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!values.session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const cls = values.classVal
      const sess = values.session
      const type = values.reportType

      let data = null
      if (type === '1')      data = OVERALL_DATA?.[cls]?.[sess] ?? null
      else if (type === '3') data = TOP5_DATA?.[cls]?.[sess] ?? []
      else if (type === '4') data = SUBJECT_AGG_DATA?.[cls]?.[sess] ?? []
      else if (type === '5') data = HIGHEST_MARKS_DATA?.[cls]?.[sess] ?? []
      else if (type === '6') data = COMPARATIVE_DATA?.[cls] ?? []
      else if (type === '7') data = GLANCE_DATA?.[cls]?.[sess] ?? null
      else if (type === '8') data = RESULT_ANALYSIS_DATA?.[cls]?.[sess] ?? []
      else if (type === '9') data = SECTION_RESULT_DATA?.[cls]?.[sess] ?? []

      setReportData(data)
      setShownMeta({ ...values })
      setLoading(false)
      showToast(`Report loaded successfully.`)
    }, 700)
  }, [values])

  const handleReset = () => {
    setValues({ session:'', classVal:'10', reportType:'1', stream:'Science', section:'A' })
    setErrors({})
    setReportData(null)
    setShownMeta(null)
  }

  const handleExcel = () => {
    if (!reportData) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  const hasResults = !!reportData && !!shownMeta
  const reportLabel = REPORT_TYPES.find(r => r.value === (shownMeta?.reportType || values.reportType))?.label || ''
  const classLabel = (shownMeta?.classVal || values.classVal) === '10' ? 'Class 10th (AISSE)' : 'Class 12th (AISSCE)'

  // Render the active report
  const renderReport = () => {
    if (!hasResults) return null
    const t = shownMeta.reportType
    if (t === '1') return <OverallReport data={reportData} />
    if (t === '3') return <TopFiveReport data={reportData} />
    if (t === '4') return <SubjectAggregateReport data={reportData} />
    if (t === '5') return <HighestMarksReport data={reportData} />
    if (t === '6') return <ComparativeReport data={reportData} />
    if (t === '7') return <GlanceReport data={reportData} />
    if (t === '8') return <ResultAnalysisReport data={reportData} />
    if (t === '9') return <SectionWiseReport data={reportData} />
    return <EmptySection msg="Report type not yet implemented." />
  }

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            CBSE AISSE Result
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Board result analysis — Class 10th &amp; 12th · Multiple report views
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

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────────── */}
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
              <NativeSelect value={values.session} onChange={e=>setValues(p=>({...p,session:e.target.value}))} placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s=><option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class">
              <NativeSelect value={values.classVal} onChange={e=>setValues(p=>({...p,classVal:e.target.value}))}>
                <option value="10">Class 10th</option>
                <option value="12">Class 12th</option>
              </NativeSelect>
            </Field>

            {/* Report Type */}
            <Field label="Report Type">
              <NativeSelect value={values.reportType} onChange={e=>setValues(p=>({...p,reportType:e.target.value}))}>
                {REPORT_TYPES.map(r=><option key={r.value} value={r.value}>{r.label}</option>)}
              </NativeSelect>
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
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Conditional: Stream & Section (2nd row) */}
          {(needsStream || needsSection) && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              {needsStream && (
                <Field label="Stream">
                  <NativeSelect value={values.stream} onChange={e=>setValues(p=>({...p,stream:e.target.value}))}>
                    {STREAMS.map(s=><option key={s} value={s}>{s}</option>)}
                  </NativeSelect>
                </Field>
              )}
              {needsSection && (
                <Field label="Section">
                  <NativeSelect value={values.section} onChange={e=>setValues(p=>({...p,section:e.target.value}))}>
                    {SECTIONS.map(s=><option key={s} value={s}>Section {s}</option>)}
                  </NativeSelect>
                </Field>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {values.session ? `${values.session} · Class ${values.classVal}` : 'Select Filters'}
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
        values={values}
        setValues={setValues}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_,i)=>(
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          {[...Array(5)].map((_,i)=>(
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{opacity:1-i*0.15}} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <div className="space-y-4">
          {/* School / Report Header */}
          <SchoolHeader session={shownMeta.session} classLabel={classLabel} reportLabel={reportLabel} />

          {/* Active report type badge */}
          <div className="flex flex-wrap gap-2 items-center">
            {REPORT_TYPES.map(r => {
              const Icon = r.icon
              const isActive = r.value === shownMeta.reportType
              return (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => { setValues(p=>({...p,reportType:r.value})); setReportData(null); setShownMeta(null) }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold transition-all border
                    ${isActive
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 dark:bg-[#1a1f35] dark:text-slate-300 dark:border-[rgba(99,102,241,0.2)] dark:hover:border-indigo-400'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden sm:inline">{r.label}</span>
                  <span className="sm:hidden">{r.label.split(' ')[0]}</span>
                </button>
              )
            })}
          </div>

          {/* Stream/Section info if applicable */}
          {(shownMeta.classVal==='12' || shownMeta.reportType==='9') && (
            <div className="flex flex-wrap gap-2">
              {shownMeta.classVal==='12' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-cyan-100 dark:bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-500/25">
                  Stream: {shownMeta.stream}
                </span>
              )}
              {shownMeta.reportType==='9' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-violet-100 dark:bg-violet-500/15 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/25">
                  Section: {shownMeta.section}
                </span>
              )}
            </div>
          )}

          {/* Report Content */}
          {renderReport()}
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session, class &amp; report type, then click <strong>Show</strong>.
            </p>
          </div>
          {/* Quick preview chips */}
          <div className="flex flex-wrap gap-2 justify-center mt-2 max-w-xs">
            {REPORT_TYPES.map(r=>(
              <span key={r.value} className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">{r.label}</span>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
    </div>
  )
}
