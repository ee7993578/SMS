/**
 * AdminDashBoardMarks.jsx
 * Folder: src/pages/Dashboard/AdminDashBoardMarks.jsx
 *
 * Converts legacy ASPX "AdminDashBoardNewMarks" to fully-responsive React + Tailwind.
 *
 * Sections:
 *  1. Top KPI Cards — Marks Entry Status (Locked/InProgress/Pending)
 *  2. Modified Marks by Teacher (Teacher count + Entries Modified)
 *  3. Pass / Fail Ratio
 *  4. Bar Chart — Standard-wise Marks % Comparison (Recharts)
 *  5. Donut Chart — Overall Highest % (Recharts)
 *  6. Bar Chart — Standard-wise Performance vs Previous Year (Recharts)
 *  7. Donut Chart — Overall Range-wise % in Standard (Recharts)
 *  8. Grouped Bar Chart — Range-wise % in Subject of Standard (Recharts)
 *
 * Mobile: cards stack vertically, charts full-width, tabs for switching chart views
 * Desktop: 2-col / 3-col grid, data-dense ERP layout
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer, LabelList
} from 'recharts'
import {
  Lock, Loader2, Clock, CheckCircle2, XCircle,
  TrendingUp, TrendingDown, Users, BookOpen,
  Award, AlertTriangle, BarChart3, PieChartIcon,
  ChevronDown, RefreshCw, Filter, Eye,
  GraduationCap, FileText, Pencil, ChevronRight,
  LayoutDashboard, Activity, Target, Layers
} from 'lucide-react'

// ─── STATIC DUMMY DATA ────────────────────────────────────────────────────────

const CLASSES = [
  'Class I','Class II','Class III','Class IV','Class V',
  'Class VI','Class VII','Class VIII','Class IX','Class X',
  'Class XI','Class XII'
]

const MARKS_STATUS = {
  locked:     { value: 68, count: 204 },
  inProgress: { value: 22, count: 66  },
  pending:    { value: 10, count: 30  },
}

const MODIFIED_MARKS = {
  teachers:         { value: 75, count: 18 },
  entriesModified:  { value: 82, count: 246 },
}

const PASS_FAIL = {
  pass: { value: 78, count: 1872 },
  fail: { value: 22, count: 528  },
}

// Standard-wise marks comparison (Highest / Average / Lowest)
const STD_WISE_DATA = [
  { std: 'I',   Highest: 95, Average: 72, Lowest: 38 },
  { std: 'II',  Highest: 92, Average: 69, Lowest: 35 },
  { std: 'III', Highest: 89, Average: 68, Lowest: 40 },
  { std: 'IV',  Highest: 91, Average: 71, Lowest: 42 },
  { std: 'V',   Highest: 88, Average: 67, Lowest: 36 },
  { std: 'VI',  Highest: 93, Average: 74, Lowest: 44 },
  { std: 'VII', Highest: 90, Average: 70, Lowest: 39 },
  { std: 'VIII',Highest: 86, Average: 65, Lowest: 33 },
  { std: 'IX',  Highest: 94, Average: 73, Lowest: 45 },
  { std: 'X',   Highest: 97, Average: 76, Lowest: 48 },
  { std: 'XI',  Highest: 96, Average: 78, Lowest: 52 },
  { std: 'XII', Highest: 98, Average: 80, Lowest: 55 },
]

// Overall highest % donut
const HIGHEST_PCT_DATA = [
  { name: 'Highest', value: 60.79, color: '#6366f1' },
  { name: 'Lowest',  value: 39.21, color: '#e2e8f0' },
]
const HIGHEST_PCT_DATA_DARK = [
  { name: 'Highest', value: 60.79, color: '#818cf8' },
  { name: 'Lowest',  value: 39.21, color: '#1e2238' },
]

// Standard-wise performance vs previous year
const PREV_YEAR_DATA = [
  { std: 'I',   '2023-24': 68, '2024-25': 72 },
  { std: 'II',  '2023-24': 65, '2024-25': 69 },
  { std: 'III', '2023-24': 66, '2024-25': 68 },
  { std: 'IV',  '2023-24': 70, '2024-25': 71 },
  { std: 'V',   '2023-24': 64, '2024-25': 67 },
  { std: 'VI',  '2023-24': 72, '2024-25': 74 },
  { std: 'VII', '2023-24': 68, '2024-25': 70 },
  { std: 'VIII','2023-24': 63, '2024-25': 65 },
  { std: 'IX',  '2023-24': 70, '2024-25': 73 },
  { std: 'X',   '2023-24': 74, '2024-25': 76 },
  { std: 'XI',  '2023-24': 76, '2024-25': 78 },
  { std: 'XII', '2023-24': 78, '2024-25': 80 },
]

// Range-wise % in standard (donut, per class)
const RANGE_WISE_BY_CLASS = {
  'Class I':    [{ name:'0-40%',value:8,color:'#ef4444' },{ name:'41-60%',value:15,color:'#f97316' },{ name:'61-80%',value:42,color:'#6366f1' },{ name:'81-100%',value:35,color:'#22c55e' }],
  'Class II':   [{ name:'0-40%',value:6,color:'#ef4444' },{ name:'41-60%',value:12,color:'#f97316' },{ name:'61-80%',value:44,color:'#6366f1' },{ name:'81-100%',value:38,color:'#22c55e' }],
  'Class III':  [{ name:'0-40%',value:10,color:'#ef4444' },{ name:'41-60%',value:18,color:'#f97316' },{ name:'61-80%',value:40,color:'#6366f1' },{ name:'81-100%',value:32,color:'#22c55e' }],
  'Class IV':   [{ name:'0-40%',value:7,color:'#ef4444' },{ name:'41-60%',value:14,color:'#f97316' },{ name:'61-80%',value:43,color:'#6366f1' },{ name:'81-100%',value:36,color:'#22c55e' }],
  'Class V':    [{ name:'0-40%',value:9,color:'#ef4444' },{ name:'41-60%',value:16,color:'#f97316' },{ name:'61-80%',value:41,color:'#6366f1' },{ name:'81-100%',value:34,color:'#22c55e' }],
  'Class VI':   [{ name:'0-40%',value:5,color:'#ef4444' },{ name:'41-60%',value:11,color:'#f97316' },{ name:'61-80%',value:45,color:'#6366f1' },{ name:'81-100%',value:39,color:'#22c55e' }],
  'Class VII':  [{ name:'0-40%',value:8,color:'#ef4444' },{ name:'41-60%',value:13,color:'#f97316' },{ name:'61-80%',value:43,color:'#6366f1' },{ name:'81-100%',value:36,color:'#22c55e' }],
  'Class VIII': [{ name:'0-40%',value:11,color:'#ef4444' },{ name:'41-60%',value:19,color:'#f97316' },{ name:'61-80%',value:39,color:'#6366f1' },{ name:'81-100%',value:31,color:'#22c55e' }],
  'Class IX':   [{ name:'0-40%',value:7,color:'#ef4444' },{ name:'41-60%',value:12,color:'#f97316' },{ name:'61-80%',value:44,color:'#6366f1' },{ name:'81-100%',value:37,color:'#22c55e' }],
  'Class X':    [{ name:'0-40%',value:4,color:'#ef4444' },{ name:'41-60%',value:10,color:'#f97316' },{ name:'61-80%',value:46,color:'#6366f1' },{ name:'81-100%',value:40,color:'#22c55e' }],
  'Class XI':   [{ name:'0-40%',value:3,color:'#ef4444' },{ name:'41-60%',value:8,color:'#f97316' },{ name:'61-80%',value:47,color:'#6366f1' },{ name:'81-100%',value:42,color:'#22c55e' }],
  'Class XII':  [{ name:'0-40%',value:2,color:'#ef4444' },{ name:'41-60%',value:7,color:'#f97316' },{ name:'61-80%',value:48,color:'#6366f1' },{ name:'81-100%',value:43,color:'#22c55e' }],
}

// Range-wise % in subject per class (grouped bar)
const SUBJECT_RANGE_BY_CLASS = {
  'Class X': [
    { subject:'Hindi',  '0-40%':8,  '41-60%':15, '61-80%':42, '81-100%':35 },
    { subject:'English','0-40%':10, '41-60%':18, '61-80%':38, '81-100%':34 },
    { subject:'Maths',  '0-40%':14, '41-60%':20, '61-80%':36, '81-100%':30 },
    { subject:'Science','0-40%':6,  '41-60%':14, '61-80%':44, '81-100%':36 },
    { subject:'SST',    '0-40%':5,  '41-60%':12, '61-80%':46, '81-100%':37 },
  ],
  'Class IX': [
    { subject:'Hindi',  '0-40%':9,  '41-60%':16, '61-80%':40, '81-100%':35 },
    { subject:'English','0-40%':11, '41-60%':19, '61-80%':37, '81-100%':33 },
    { subject:'Maths',  '0-40%':15, '41-60%':21, '61-80%':35, '81-100%':29 },
    { subject:'Science','0-40%':7,  '41-60%':13, '61-80%':43, '81-100%':37 },
    { subject:'SST',    '0-40%':6,  '41-60%':13, '61-80%':45, '81-100%':36 },
  ],
}
const defaultSubjectData = SUBJECT_RANGE_BY_CLASS['Class X']

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`w-full appearance-none pl-3 pr-8 py-1.5 text-[12px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-700 border-slate-200
          focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20 ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

// Progress bar with label
function ProgressBar({ pct, color, height = 'h-2' }) {
  const colors = {
    green:  'bg-emerald-500',
    blue:   'bg-indigo-500',
    pink:   'bg-rose-500',
    yellow: 'bg-amber-400',
    violet: 'bg-violet-500',
  }
  return (
    <div className={`w-full rounded-full bg-slate-200 dark:bg-slate-700/60 overflow-hidden ${height}`}>
      <div
        className={`h-full rounded-full transition-all duration-700 ease-out ${colors[color] || 'bg-indigo-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// Chart Card wrapper
function ChartCard({ title, children, action }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide truncate">{title}</span>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─── STATUS CARD (Locked / InProgress / Pending + Modified Marks + Pass/Fail) ─

function StatusBlock({ icon: Icon, label, pct, count, color, iconBg }) {
  const barColors = { green:'green', blue:'blue', pink:'pink', yellow:'yellow', violet:'violet' }
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{label}</span>
          <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{pct}%</span>
        </div>
        <ProgressBar pct={pct} color={color} height="h-1.5" />
        {count !== undefined && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 tabular-nums">{count} entries</p>
        )}
      </div>
    </div>
  )
}

function TopStatCard({ icon: Icon, label, value, sub, color }) {
  const cls = {
    indigo:  { bg: 'bg-indigo-50 dark:bg-indigo-500/10',   text: 'text-indigo-600 dark:text-indigo-400', val: 'text-indigo-700 dark:text-indigo-300' },
    emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', val: 'text-emerald-700 dark:text-emerald-300' },
    rose:    { bg: 'bg-rose-50 dark:bg-rose-500/10',       text: 'text-rose-600 dark:text-rose-400', val: 'text-rose-700 dark:text-rose-300' },
    amber:   { bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-600 dark:text-amber-400', val: 'text-amber-700 dark:text-amber-300' },
    violet:  { bg: 'bg-violet-50 dark:bg-violet-500/10',   text: 'text-violet-600 dark:text-violet-400', val: 'text-violet-700 dark:text-violet-300' },
  }[color]
  return (
    <div className={`flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3.5 shadow-sm`}>
      <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${cls.bg}`}>
        <Icon className={`w-5 h-5 ${cls.text}`} />
      </span>
      <div className="min-w-0">
        <p className={`text-[22px] font-bold tabular-nums leading-tight ${cls.val}`}>{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className={`text-[11px] font-semibold ${cls.text}`}>{sub}</p>}
      </div>
    </div>
  )
}

// ─── CUSTOM RECHARTS TOOLTIP ──────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.3)] shadow-xl px-3 py-2.5 text-[12px]">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2 mb-0.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-semibold text-slate-700 dark:text-slate-200">{p.value}%</span>
        </div>
      ))}
    </div>
  )
}

// ─── DONUT CHART with center label ────────────────────────────────────────────
function DonutChart({ data, centerLabel, centerValue, height = 220 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="55%"
          outerRadius="80%"
          startAngle={90}
          endAngle={-270}
          dataKey="value"
          paddingAngle={2}
        >
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="none" />
          ))}
        </Pie>
        <Tooltip
          formatter={(v) => [`${v.toFixed(1)}%`, '']}
          contentStyle={{
            borderRadius: 12,
            border: '1px solid rgba(99,102,241,0.2)',
            background: '#1a1f35',
            color: '#e2e8f0',
            fontSize: 12,
          }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

// ─── MOBILE CHART TABS ────────────────────────────────────────────────────────
function MobileChartTabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60 mb-4">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all
            ${active === t.id
              ? 'bg-white dark:bg-[#1a1f35] text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400'}`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashBoardMarks() {
  const [rangeClass,   setRangeClass]   = useState('Class X')
  const [subjectClass, setSubjectClass] = useState('Class X')
  const [mobileTab,    setMobileTab]    = useState('std')

  const rangeData   = RANGE_WISE_BY_CLASS[rangeClass]   || RANGE_WISE_BY_CLASS['Class X']
  const subjectData = SUBJECT_RANGE_BY_CLASS[subjectClass] || defaultSubjectData

  const MOBILE_TABS = [
    { id: 'std',     label: 'Std Marks' },
    { id: 'prevyr',  label: 'Vs Prev Yr' },
    { id: 'range',   label: 'Range Wise' },
    { id: 'subject', label: 'Subjects' },
  ]

  // Grand summary numbers for top KPI row
  const totalStudents = PASS_FAIL.pass.count + PASS_FAIL.fail.count
  const totalSubjects  = 5

  return (
    <div className="space-y-5 pb-10">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-indigo-500" />
            Marks Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Academic performance analytics — marks entry, pass/fail ratio & standard-wise comparison.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
            Session 2024-25
          </span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Top KPI Strip ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <TopStatCard icon={GraduationCap} label="Total Students"    value={totalStudents.toLocaleString()} color="indigo"  />
        <TopStatCard icon={CheckCircle2}  label="Pass Students"     value={PASS_FAIL.pass.count.toLocaleString()} sub={`${PASS_FAIL.pass.value}% pass rate`} color="emerald" />
        <TopStatCard icon={XCircle}       label="Fail Students"     value={PASS_FAIL.fail.count.toLocaleString()} sub={`${PASS_FAIL.fail.value}% fail rate`} color="rose"    />
        <TopStatCard icon={Lock}          label="Locked Entries"    value={MARKS_STATUS.locked.count.toLocaleString()} sub={`${MARKS_STATUS.locked.value}% locked`} color="violet"  />
      </div>

      {/* ── Row 1: 3 Status Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Marks Entry Status */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
            <FileText className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              Marks Entry Status <span className="text-slate-400 font-normal normal-case tracking-normal">(%)</span>
            </span>
          </div>
          <div className="px-5 py-3 divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
            <StatusBlock
              icon={Lock} label="Locked"
              pct={MARKS_STATUS.locked.value} count={MARKS_STATUS.locked.count}
              color="green" iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />
            <StatusBlock
              icon={Loader2} label="In Progress"
              pct={MARKS_STATUS.inProgress.value} count={MARKS_STATUS.inProgress.count}
              color="blue" iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            />
            <StatusBlock
              icon={Clock} label="Pending"
              pct={MARKS_STATUS.pending.value} count={MARKS_STATUS.pending.count}
              color="pink" iconBg="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
            />
          </div>
          {/* Mini summary pills */}
          <div className="flex gap-2 px-5 pb-4">
            <span className="flex-1 text-center py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
              {MARKS_STATUS.locked.value}% Done
            </span>
            <span className="flex-1 text-center py-1.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-[11px] font-bold text-rose-700 dark:text-rose-400">
              {MARKS_STATUS.pending.value}% Pending
            </span>
          </div>
        </div>

        {/* Modified Marks by Teacher */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-amber-500 flex-shrink-0" />
            <Pencil className="w-4 h-4 text-amber-500 dark:text-amber-400" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide leading-tight">
              Modified Marks by Teacher
            </span>
          </div>
          <div className="px-5 py-3 divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
            <StatusBlock
              icon={Users} label="Teachers"
              pct={MODIFIED_MARKS.teachers.value} count={MODIFIED_MARKS.teachers.count}
              color="yellow" iconBg="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400"
            />
            <StatusBlock
              icon={BookOpen} label="Entries Modified"
              pct={MODIFIED_MARKS.entriesModified.value} count={MODIFIED_MARKS.entriesModified.count}
              color="blue" iconBg="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400"
            />
          </div>
          <div className="px-5 pb-4">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/[0.08] border border-amber-100 dark:border-amber-500/20 px-4 py-3 text-center">
              <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{MODIFIED_MARKS.entriesModified.count}</p>
              <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">Total Modifications</p>
            </div>
          </div>
        </div>

        {/* Pass / Fail Ratio */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.18)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
            <Target className="w-4 h-4 text-violet-500 dark:text-violet-400" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
              Pass &amp; Fail Ratio
            </span>
          </div>
          <div className="px-5 py-3 divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
            <StatusBlock
              icon={TrendingUp} label="Pass"
              pct={PASS_FAIL.pass.value} count={PASS_FAIL.pass.count}
              color="yellow" iconBg="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
            />
            <StatusBlock
              icon={TrendingDown} label="Fail"
              pct={PASS_FAIL.fail.value} count={PASS_FAIL.fail.count}
              color="blue" iconBg="bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
            />
          </div>
          <div className="px-5 pb-4 space-y-2">
            {/* Stacked bar */}
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              <div className="bg-emerald-500 rounded-l-full transition-all" style={{ width: `${PASS_FAIL.pass.value}%` }} />
              <div className="bg-rose-500 rounded-r-full transition-all" style={{ width: `${PASS_FAIL.fail.value}%` }} />
            </div>
            <div className="flex text-[11px] font-semibold justify-between">
              <span className="text-emerald-600 dark:text-emerald-400">Pass {PASS_FAIL.pass.value}%</span>
              <span className="text-rose-600 dark:text-rose-400">Fail {PASS_FAIL.fail.value}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── DESKTOP CHARTS GRID ───────────────────────────────────────────── */}
      <div className="hidden md:grid grid-cols-12 gap-4">

        {/* Chart 1: Standard-wise marks comparison — col-8 */}
        <div className="col-span-8">
          <ChartCard title="Standard-wise Marks (%) Comparison">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={STD_WISE_DATA} barCategoryGap="30%" barGap={3}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="std" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Highest" fill="#22c55e" radius={[4,4,0,0]} maxBarSize={20} />
                <Bar dataKey="Average" fill="#6366f1" radius={[4,4,0,0]} maxBarSize={20} />
                <Bar dataKey="Lowest"  fill="#f97316" radius={[4,4,0,0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Chart 2: Overall Highest % donut — col-4 */}
        <div className="col-span-4">
          <ChartCard title="Overall Student Highest %">
            <DonutChart data={HIGHEST_PCT_DATA_DARK} centerLabel="Highest" centerValue="60.79%" height={240} />
            <div className="flex gap-2 mt-2">
              <div className="flex-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 py-2.5 text-center">
                <p className="text-[20px] font-bold text-indigo-700 dark:text-indigo-300 tabular-nums">60.79%</p>
                <p className="text-[10px] font-semibold text-indigo-500 dark:text-indigo-400">Highest</p>
              </div>
              <div className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 py-2.5 text-center">
                <p className="text-[20px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">39.21%</p>
                <p className="text-[10px] font-semibold text-slate-400">Lowest</p>
              </div>
            </div>
          </ChartCard>
        </div>

        {/* Chart 3: Std-wise vs Prev Year — col-6 */}
        <div className="col-span-6">
          <ChartCard title="Standard-wise Performance vs Previous Year">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={PREV_YEAR_DATA} barCategoryGap="30%" barGap={3}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="std" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[50,90]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="2023-24" fill="#94a3b8" radius={[4,4,0,0]} maxBarSize={18} />
                <Bar dataKey="2024-25" fill="#6366f1" radius={[4,4,0,0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Chart 4: Range-wise % in Standard donut — col-6 */}
        <div className="col-span-6">
          <ChartCard
            title="Overall Range-wise % in Standard"
            action={
              <NativeSelect value={rangeClass} onChange={e => setRangeClass(e.target.value)}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            }
          >
            <DonutChart data={rangeData} height={240} />
          </ChartCard>
        </div>

        {/* Chart 5: Range-wise % in Subject — col-12 */}
        <div className="col-span-12">
          <ChartCard
            title="Range-wise % in Subject of Standard"
            action={
              <NativeSelect value={subjectClass} onChange={e => setSubjectClass(e.target.value)}>
                {Object.keys(SUBJECT_RANGE_BY_CLASS).map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            }
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={subjectData} barCategoryGap="25%" barGap={2}
                margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0,60]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="0-40%"    fill="#ef4444" radius={[4,4,0,0]} maxBarSize={18} />
                <Bar dataKey="41-60%"   fill="#f97316" radius={[4,4,0,0]} maxBarSize={18} />
                <Bar dataKey="61-80%"   fill="#6366f1" radius={[4,4,0,0]} maxBarSize={18} />
                <Bar dataKey="81-100%"  fill="#22c55e" radius={[4,4,0,0]} maxBarSize={18} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* ── MOBILE CHARTS (Tabs) ──────────────────────────────────────────── */}
      <div className="md:hidden">
        <MobileChartTabs tabs={MOBILE_TABS} active={mobileTab} onChange={setMobileTab} />

        {mobileTab === 'std' && (
          <ChartCard title="Std-wise Marks Comparison">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={STD_WISE_DATA} barCategoryGap="30%" barGap={2}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="std" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0,100]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="Highest" fill="#22c55e" radius={[3,3,0,0]} maxBarSize={14} />
                <Bar dataKey="Average" fill="#6366f1" radius={[3,3,0,0]} maxBarSize={14} />
                <Bar dataKey="Lowest"  fill="#f97316" radius={[3,3,0,0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {mobileTab === 'prevyr' && (
          <ChartCard title="Performance vs Previous Year">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PREV_YEAR_DATA} barCategoryGap="30%" barGap={2}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.12)" />
                <XAxis dataKey="std" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[50,90]} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={7} wrapperStyle={{ fontSize: 10 }} />
                <Bar dataKey="2023-24" fill="#94a3b8" radius={[3,3,0,0]} maxBarSize={16} />
                <Bar dataKey="2024-25" fill="#6366f1" radius={[3,3,0,0]} maxBarSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}

        {mobileTab === 'range' && (
          <ChartCard
            title="Range-wise % in Standard"
            action={
              <NativeSelect value={rangeClass} onChange={e => setRangeClass(e.target.value)}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            }
          >
            <DonutChart data={rangeData} height={200} />
            {/* Range legend pills */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              {rangeData.map((d) => (
                <div key={d.name} className="flex items-center gap-2 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] px-3 py-2">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  <span className="text-[11px] text-slate-600 dark:text-slate-300 flex-1">{d.name}</span>
                  <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{d.value}%</span>
                </div>
              ))}
            </div>
          </ChartCard>
        )}

        {mobileTab === 'subject' && (
          <ChartCard
            title="Range-wise % in Subjects"
            action={
              <NativeSelect value={subjectClass} onChange={e => setSubjectClass(e.target.value)}>
                {Object.keys(SUBJECT_RANGE_BY_CLASS).map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            }
          >
            {/* Mobile: stacked bar per subject as cards */}
            <div className="space-y-3">
              {subjectData.map((row) => (
                <div key={row.subject} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50 dark:bg-white/[0.02] px-3 py-3">
                  <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200 mb-2">{row.subject}</p>
                  <div className="flex h-3 rounded-full overflow-hidden gap-0.5 mb-2">
                    <div className="bg-rose-500    transition-all" style={{ width: `${row['0-40%']}%`   }} />
                    <div className="bg-orange-400  transition-all" style={{ width: `${row['41-60%']}%`  }} />
                    <div className="bg-indigo-500  transition-all" style={{ width: `${row['61-80%']}%`  }} />
                    <div className="bg-emerald-500 transition-all rounded-r-full" style={{ width: `${row['81-100%']}%` }} />
                  </div>
                  <div className="grid grid-cols-4 gap-1">
                    {[
                      { l:'0-40%',  v:row['0-40%'],   c:'text-rose-600 dark:text-rose-400'    },
                      { l:'41-60%', v:row['41-60%'],  c:'text-orange-600 dark:text-orange-400' },
                      { l:'61-80%', v:row['61-80%'],  c:'text-indigo-600 dark:text-indigo-400' },
                      { l:'81-100%',v:row['81-100%'], c:'text-emerald-600 dark:text-emerald-400' },
                    ].map((x) => (
                      <div key={x.l} className="text-center">
                        <p className={`text-[13px] font-bold tabular-nums ${x.c}`}>{x.v}%</p>
                        <p className="text-[9px] text-slate-400">{x.l}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        )}
      </div>

      {/* ── Bottom Overall Highest % — visible both desktop (already in grid) & standalone on mobile ── */}
      <div className="md:hidden">
        <ChartCard title="Overall Student Highest %">
          <DonutChart data={HIGHEST_PCT_DATA_DARK} height={200} />
          <div className="flex gap-3 mt-2">
            <div className="flex-1 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 py-3 text-center">
              <p className="text-[22px] font-bold text-indigo-700 dark:text-indigo-300 tabular-nums">60.79%</p>
              <p className="text-[11px] font-semibold text-indigo-500 dark:text-indigo-400">Highest</p>
            </div>
            <div className="flex-1 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 py-3 text-center">
              <p className="text-[22px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">39.21%</p>
              <p className="text-[11px] font-semibold text-slate-400">Lowest</p>
            </div>
          </div>
        </ChartCard>
      </div>

    </div>
  )
}
