/**
 * AcademicPerformance.jsx
 * Folder: src/pages/Student/Reports/AcademicPerformance.jsx
 *
 * Converts legacy ASPX "Academic Performance" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session + Term dropdown filters with validation
 *  - Multiple chart type selector (column, line, area, pie, doughnut, scatter, bubble)
 *  - Recharts-powered charts (no external CDN needed)
 *  - Subject-wise marks table
 *  - Grade summary cards
 *  - Desktop: full chart + table layout
 *  - Mobile: tab-switcher between chart and table, drawer filter
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BarChart2, TrendingUp, PieChart, Activity,
  ChevronDown, AlertCircle, X, Check, Loader2,
  SlidersHorizontal, Eye, RefreshCw, BookOpen,
  Award, Star, Target, Filter, Info,
  ArrowUpRight, ArrowDownRight, Minus,
  GraduationCap, FileBarChart, LayoutGrid, Table2
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  PieChart as RechartsPie, Pie, Cell,
  ScatterChart, Scatter, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

// ─── STATIC DATA ─────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']
const TERMS    = ['Term 1', 'Term 2', 'Term 3', 'Annual']

// Subject performance data keyed by session + term
const PERFORMANCE_DATA = {
  '2022-23_Term 1': [
    { subject: 'Mathematics',  obtained: 78, total: 100, grade: 'B+' },
    { subject: 'Science',      obtained: 82, total: 100, grade: 'A'  },
    { subject: 'English',      obtained: 88, total: 100, grade: 'A'  },
    { subject: 'Hindi',        obtained: 74, total: 100, grade: 'B'  },
    { subject: 'Social Sci',   obtained: 80, total: 100, grade: 'B+' },
    { subject: 'Computer',     obtained: 91, total: 100, grade: 'A+' },
    { subject: 'Sanskrit',     obtained: 69, total: 100, grade: 'B'  },
  ],
  '2022-23_Term 2': [
    { subject: 'Mathematics',  obtained: 83, total: 100, grade: 'A'  },
    { subject: 'Science',      obtained: 79, total: 100, grade: 'B+' },
    { subject: 'English',      obtained: 91, total: 100, grade: 'A+' },
    { subject: 'Hindi',        obtained: 77, total: 100, grade: 'B+' },
    { subject: 'Social Sci',   obtained: 85, total: 100, grade: 'A'  },
    { subject: 'Computer',     obtained: 94, total: 100, grade: 'A+' },
    { subject: 'Sanskrit',     obtained: 72, total: 100, grade: 'B'  },
  ],
  '2022-23_Annual': [
    { subject: 'Mathematics',  obtained: 81, total: 100, grade: 'A'  },
    { subject: 'Science',      obtained: 84, total: 100, grade: 'A'  },
    { subject: 'English',      obtained: 90, total: 100, grade: 'A+' },
    { subject: 'Hindi',        obtained: 76, total: 100, grade: 'B+' },
    { subject: 'Social Sci',   obtained: 83, total: 100, grade: 'A'  },
    { subject: 'Computer',     obtained: 95, total: 100, grade: 'A+' },
    { subject: 'Sanskrit',     obtained: 71, total: 100, grade: 'B'  },
  ],
  '2023-24_Term 1': [
    { subject: 'Mathematics',  obtained: 85, total: 100, grade: 'A'  },
    { subject: 'Science',      obtained: 88, total: 100, grade: 'A'  },
    { subject: 'English',      obtained: 92, total: 100, grade: 'A+' },
    { subject: 'Hindi',        obtained: 79, total: 100, grade: 'B+' },
    { subject: 'Social Sci',   obtained: 87, total: 100, grade: 'A'  },
    { subject: 'Computer',     obtained: 96, total: 100, grade: 'A+' },
    { subject: 'Sanskrit',     obtained: 75, total: 100, grade: 'B+' },
  ],
  '2023-24_Term 2': [
    { subject: 'Mathematics',  obtained: 87, total: 100, grade: 'A'  },
    { subject: 'Science',      obtained: 90, total: 100, grade: 'A+' },
    { subject: 'English',      obtained: 89, total: 100, grade: 'A'  },
    { subject: 'Hindi',        obtained: 82, total: 100, grade: 'A'  },
    { subject: 'Social Sci',   obtained: 84, total: 100, grade: 'A'  },
    { subject: 'Computer',     obtained: 97, total: 100, grade: 'A+' },
    { subject: 'Sanskrit',     obtained: 78, total: 100, grade: 'B+' },
  ],
  '2023-24_Annual': [
    { subject: 'Mathematics',  obtained: 89, total: 100, grade: 'A'  },
    { subject: 'Science',      obtained: 91, total: 100, grade: 'A+' },
    { subject: 'English',      obtained: 93, total: 100, grade: 'A+' },
    { subject: 'Hindi',        obtained: 83, total: 100, grade: 'A'  },
    { subject: 'Social Sci',   obtained: 88, total: 100, grade: 'A'  },
    { subject: 'Computer',     obtained: 98, total: 100, grade: 'A+' },
    { subject: 'Sanskrit',     obtained: 80, total: 100, grade: 'B+' },
  ],
  '2024-25_Term 1': [
    { subject: 'Mathematics',  obtained: 72, total: 100, grade: 'B'  },
    { subject: 'Science',      obtained: 76, total: 100, grade: 'B+' },
    { subject: 'English',      obtained: 85, total: 100, grade: 'A'  },
    { subject: 'Hindi',        obtained: 68, total: 100, grade: 'B'  },
    { subject: 'Social Sci',   obtained: 74, total: 100, grade: 'B'  },
    { subject: 'Computer',     obtained: 89, total: 100, grade: 'A'  },
    { subject: 'Sanskrit',     obtained: 64, total: 100, grade: 'B'  },
  ],
  '2024-25_Term 2': [
    { subject: 'Mathematics',  obtained: 77, total: 100, grade: 'B+' },
    { subject: 'Science',      obtained: 80, total: 100, grade: 'B+' },
    { subject: 'English',      obtained: 87, total: 100, grade: 'A'  },
    { subject: 'Hindi',        obtained: 72, total: 100, grade: 'B'  },
    { subject: 'Social Sci',   obtained: 79, total: 100, grade: 'B+' },
    { subject: 'Computer',     obtained: 92, total: 100, grade: 'A+' },
    { subject: 'Sanskrit',     obtained: 68, total: 100, grade: 'B'  },
  ],
  '2024-25_Annual': [
    { subject: 'Mathematics',  obtained: 80, total: 100, grade: 'B+' },
    { subject: 'Science',      obtained: 84, total: 100, grade: 'A'  },
    { subject: 'English',      obtained: 89, total: 100, grade: 'A'  },
    { subject: 'Hindi',        obtained: 76, total: 100, grade: 'B+' },
    { subject: 'Social Sci',   obtained: 82, total: 100, grade: 'A'  },
    { subject: 'Computer',     obtained: 94, total: 100, grade: 'A+' },
    { subject: 'Sanskrit',     obtained: 71, total: 100, grade: 'B'  },
  ],
  '2025-26_Term 1': [
    { subject: 'Mathematics',  obtained: 90, total: 100, grade: 'A+' },
    { subject: 'Science',      obtained: 87, total: 100, grade: 'A'  },
    { subject: 'English',      obtained: 94, total: 100, grade: 'A+' },
    { subject: 'Hindi',        obtained: 85, total: 100, grade: 'A'  },
    { subject: 'Social Sci',   obtained: 88, total: 100, grade: 'A'  },
    { subject: 'Computer',     obtained: 98, total: 100, grade: 'A+' },
    { subject: 'Sanskrit',     obtained: 81, total: 100, grade: 'A'  },
  ],
}

// Chart color palette
const CHART_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

// Grade color map
const GRADE_STYLE = {
  'A+': { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-500/30' },
  'A':  { bg: 'bg-blue-100 dark:bg-blue-500/20',    text: 'text-blue-700 dark:text-blue-300',    border: 'border-blue-200 dark:border-blue-500/30'    },
  'B+': { bg: 'bg-violet-100 dark:bg-violet-500/20',text: 'text-violet-700 dark:text-violet-300',border: 'border-violet-200 dark:border-violet-500/30' },
  'B':  { bg: 'bg-amber-100 dark:bg-amber-500/20',  text: 'text-amber-700 dark:text-amber-300',  border: 'border-amber-200 dark:border-amber-500/30'  },
  'C':  { bg: 'bg-orange-100 dark:bg-orange-500/20',text: 'text-orange-700 dark:text-orange-300',border: 'border-orange-200 dark:border-orange-500/30' },
}

const CHART_TYPES = [
  { value: 'column',   label: 'Column',   icon: BarChart2    },
  { value: 'line',     label: 'Line',     icon: TrendingUp   },
  { value: 'area',     label: 'Area',     icon: Activity     },
  { value: 'pie',      label: 'Pie',      icon: PieChart     },
  { value: 'doughnut', label: 'Doughnut', icon: PieChart     },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getPercentColor(pct) {
  if (pct >= 90) return 'text-emerald-600 dark:text-emerald-400'
  if (pct >= 75) return 'text-blue-600 dark:text-blue-400'
  if (pct >= 60) return 'text-amber-600 dark:text-amber-400'
  return 'text-rose-600 dark:text-rose-400'
}

function getBarColor(pct) {
  if (pct >= 90) return 'bg-emerald-500'
  if (pct >= 75) return 'bg-blue-500'
  if (pct >= 60) return 'bg-amber-500'
  return 'bg-rose-500'
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

function SummaryCard({ icon: Icon, label, value, sub, color }) {
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
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── CHART TYPE SELECTOR ──────────────────────────────────────────────────────

function ChartTypeSelector({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {CHART_TYPES.map(({ value: v, label, icon: Icon }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all
            ${value === v
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:border-indigo-600'
              : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:text-blue-600 dark:bg-[#1e2238] dark:text-slate-300 dark:border-[rgba(99,102,241,0.25)] dark:hover:border-indigo-400'
            }`}
        >
          <Icon className="w-3.5 h-3.5" />
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── CHART RENDERER ───────────────────────────────────────────────────────────

function PerformanceChart({ data, chartType }) {
  const chartData = data.map((d) => ({
    subject: d.subject.length > 8 ? d.subject.slice(0, 8) + '…' : d.subject,
    fullSubject: d.subject,
    Obtained: d.obtained,
    Total: d.total,
    pct: Math.round((d.obtained / d.total) * 100),
  }))

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.25)] rounded-xl shadow-xl px-4 py-3 text-[12px]">
        <p className="font-bold text-slate-800 dark:text-slate-100 mb-1">{payload[0]?.payload?.fullSubject || label}</p>
        {payload.map((p) => (
          <p key={p.dataKey} style={{ color: p.color }} className="font-semibold">
            {p.dataKey}: {p.value}
            {p.dataKey === 'Obtained' ? ` (${payload[0]?.payload?.pct}%)` : ''}
          </p>
        ))}
      </div>
    )
  }

  const PieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-xl shadow-xl px-4 py-2 text-[12px]">
        <p className="font-bold text-slate-700 dark:text-slate-200">{payload[0].payload.fullSubject}</p>
        <p className="font-semibold" style={{ color: payload[0].fill }}>{payload[0].value} marks</p>
      </div>
    )
  }

  const commonAxis = (
    <>
      <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
      <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
      <Tooltip content={<CustomTooltip />} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
    </>
  )

  if (chartType === 'column') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} barGap={4}>
          {commonAxis}
          <Bar dataKey="Obtained" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={40}>
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Bar>
          <Bar dataKey="Total" fill="#e2e8f0" radius={[6, 6, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'line') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          {commonAxis}
          <Line type="monotone" dataKey="Obtained" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 5, fill: '#3b82f6' }} activeDot={{ r: 7 }} />
          <Line type="monotone" dataKey="Total" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="5 5" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'area') {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          {commonAxis}
          <defs>
            <linearGradient id="areaBlue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="Obtained" stroke="#3b82f6" strokeWidth={2.5} fill="url(#areaBlue)" dot={{ r: 4 }} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }

  if (chartType === 'pie' || chartType === 'doughnut') {
    const innerRadius = chartType === 'doughnut' ? '50%' : '0%'
    return (
      <ResponsiveContainer width="100%" height={300}>
        <RechartsPie>
          <Pie
            data={chartData.map(d => ({ ...d, value: d.Obtained }))}
            cx="50%" cy="50%"
            innerRadius={innerRadius}
            outerRadius="75%"
            paddingAngle={3}
            dataKey="value"
            label={({ fullSubject, pct }) => `${fullSubject?.slice(0, 5)} ${pct}%`}
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} formatter={(val, entry) => entry.payload.fullSubject} />
        </RechartsPie>
      </ResponsiveContainer>
    )
  }

  // fallback — column
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        {commonAxis}
        <Bar dataKey="Obtained" radius={[6, 6, 0, 0]} maxBarSize={44}>
          {chartData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── SUBJECT TABLE ROW (Desktop) ──────────────────────────────────────────────

function SubjectRow({ row, idx }) {
  const pct   = Math.round((row.obtained / row.total) * 100)
  const grade = GRADE_STYLE[row.grade] || GRADE_STYLE['B']

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Subject */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
            {row.subject.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.subject}</span>
        </div>
      </td>

      {/* Total Marks */}
      <td className="px-4 py-3.5 text-center">
        <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">{row.total}</span>
      </td>

      {/* Obtained */}
      <td className="px-4 py-3.5 text-center">
        <span className={`text-[14px] font-bold tabular-nums ${getPercentColor(pct)}`}>{row.obtained}</span>
      </td>

      {/* Percentage + Bar */}
      <td className="px-4 py-3.5 min-w-[140px]">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${getBarColor(pct)}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`text-[12px] font-bold tabular-nums w-10 text-right ${getPercentColor(pct)}`}>{pct}%</span>
        </div>
      </td>

      {/* Grade */}
      <td className="px-4 py-3.5 text-center">
        <span className={`inline-flex items-center justify-center px-3 py-1 rounded-lg text-[12px] font-bold border ${grade.bg} ${grade.text} ${grade.border}`}>
          {row.grade}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE SUBJECT CARD ──────────────────────────────────────────────────────

function SubjectCard({ row, idx }) {
  const pct   = Math.round((row.obtained / row.total) * 100)
  const grade = GRADE_STYLE[row.grade] || GRADE_STYLE['B']

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] px-4 py-3.5 shadow-sm">
      <div className="flex items-center gap-3 mb-2.5">
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
          {row.subject.slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.subject}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">Max: {row.total} marks</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`text-[22px] font-extrabold tabular-nums leading-none ${getPercentColor(pct)}`}>{row.obtained}</span>
          <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold border ${grade.bg} ${grade.text} ${grade.border}`}>
            {row.grade}
          </span>
        </div>
      </div>
      {/* Progress */}
      <div>
        <div className="flex justify-between text-[10px] font-semibold mb-1">
          <span className="text-slate-400 dark:text-slate-500">Score</span>
          <span className={getPercentColor(pct)}>{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${getBarColor(pct)}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, session, setSession, term, setTerm, onShow, loading, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={term} onChange={e => setTerm(e.target.value)} placeholder="-- Select Term --" error={errors.term}>
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
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AcademicPerformance() {
  const [session,      setSession]      = useState('')
  const [term,         setTerm]         = useState('')
  const [chartType,    setChartType]    = useState('column')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownLabel,   setShownLabel]   = useState('')
  const [mobileTab,    setMobileTab]    = useState('chart') // 'chart' | 'table'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate + Load ───────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!term)    err.term    = 'Please select a term'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const key  = `${session}_${term}`
      const data = PERFORMANCE_DATA[key] || []
      setRows(data)
      setShownLabel(`${session} — ${term}`)
      setShown(true)
      setLoading(false)
      setMobileTab('chart')
      if (data.length)
        showToast(`Loaded ${data.length} subjects for ${session}, ${term}.`)
      else
        showToast(`No data found for ${session}, ${term}.`, 'error')
    }, 700)
  }, [session, term])

  const handleReset = () => {
    setSession(''); setTerm(''); setRows([])
    setErrors({}); setShown(false); setShownLabel('')
  }

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!rows.length) return null
    const totalObtained = rows.reduce((s, r) => s + r.obtained, 0)
    const totalMax      = rows.reduce((s, r) => s + r.total, 0)
    const overallPct    = Math.round((totalObtained / totalMax) * 100)
    const highest       = [...rows].sort((a, b) => b.obtained - a.obtained)[0]
    const lowest        = [...rows].sort((a, b) => a.obtained - b.obtained)[0]
    const aPlus         = rows.filter(r => r.grade === 'A+').length
    return { totalObtained, totalMax, overallPct, highest, lowest, aPlus }
  }, [rows])

  const hasResults  = shown && rows.length > 0
  const activeCount = [session, term].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Academic Performance
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Subject-wise marks, grades &amp; performance graphs by session and term.
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

            <Field label="Term" error={errors.term} required>
              <NativeSelect
                value={term}
                onChange={e => { setTerm(e.target.value); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Select Term --"
                error={errors.term}
              >
                {TERMS.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>

            <div /> {/* spacer */}

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

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session && term ? `${session} · ${term}` : 'Select Session & Term'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
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
        session={session} setSession={setSession}
        term={term}       setTerm={setTerm}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-10 w-1/2 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="h-56 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Header */}
          <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <p className="text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">Academic Performance</p>
                <h2 className="text-[16px] font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">{shownLabel}</h2>
              </div>
              {stats && (
                <div className="flex items-center gap-2">
                  <span className={`text-[28px] font-extrabold tabular-nums ${getPercentColor(stats.overallPct)}`}>
                    {stats.overallPct}%
                  </span>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    <p>{stats.totalObtained}/{stats.totalMax}</p>
                    <p>Overall</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Summary Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <SummaryCard icon={Target}   label="Overall Score"   value={`${stats.overallPct}%`} sub={`${stats.totalObtained}/${stats.totalMax}`} color="blue"    />
              <SummaryCard icon={Star}     label="A+ Grades"       value={stats.aPlus}            sub={`of ${rows.length} subjects`}               color="emerald" />
              <SummaryCard icon={Award}    label="Best Subject"    value={stats.highest?.obtained} sub={stats.highest?.subject}                   color="violet"  />
              <SummaryCard icon={BookOpen} label="Lowest Subject"  value={stats.lowest?.obtained}  sub={stats.lowest?.subject}                    color="amber"   />
            </div>
          )}

          {/* ── DESKTOP LAYOUT ── */}
          <div className="hidden md:block space-y-4">

            {/* Chart Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <FileBarChart className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Performance Chart</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">Select graph type:</span>
              </div>
              <div className="px-5 pt-4 pb-2">
                <ChartTypeSelector value={chartType} onChange={setChartType} />
              </div>
              <div className="px-4 py-4">
                <PerformanceChart data={rows} chartType={chartType} />
              </div>
            </div>

            {/* Table Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Table2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Subject-wise Marks</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {rows.length} subjects
                </span>
              </div>

              {/* Info bar */}
              <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <p className="text-[12px] text-blue-700 dark:text-blue-400">
                  Grades: A+ ≥ 90 · A ≥ 75 · B+ ≥ 60 · B ≥ 45. Progress bar shows percentage of total marks.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Subject', 'Max Marks', 'Obtained', 'Percentage', 'Grade'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <SubjectRow key={row.subject} row={row} idx={i + 1} />
                    ))}
                    {/* Totals Row */}
                    {stats && (
                      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                        <td className="px-4 py-3 text-center text-[12px] text-blue-500">—</td>
                        <td className="px-4 py-3 text-[13px] font-bold text-blue-700 dark:text-blue-300" colSpan={1}>Grand Total</td>
                        <td className="px-4 py-3 text-center text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.totalMax}</td>
                        <td className="px-4 py-3 text-center text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.totalObtained}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 rounded-full bg-blue-200 dark:bg-blue-500/20 overflow-hidden">
                              <div className="h-full rounded-full bg-blue-500" style={{ width: `${stats.overallPct}%` }} />
                            </div>
                            <span className={`text-[13px] font-bold tabular-nums ${getPercentColor(stats.overallPct)}`}>{stats.overallPct}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[12px] font-bold border bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30">
                            Overall
                          </span>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
                <p className="text-[12px] text-slate-400 dark:text-slate-500">
                  Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> subjects
                </p>
              </div>
            </div>
          </div>

          {/* ── MOBILE LAYOUT ── */}
          <div className="md:hidden space-y-3">

            {/* Mobile Tab Switcher */}
            <div className="flex rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-100 dark:bg-[#1a1f35] p-1 gap-1">
              {[
                { key: 'chart', label: 'Chart', icon: BarChart2 },
                { key: 'table', label: 'Subjects', icon: LayoutGrid },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMobileTab(key)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[13px] font-semibold transition-all
                    ${mobileTab === key
                      ? 'bg-white dark:bg-[#1e2238] text-blue-700 dark:text-blue-400 shadow-sm'
                      : 'text-slate-500 dark:text-slate-400'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>

            {/* Mobile Chart View */}
            {mobileTab === 'chart' && (
              <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
                <div className="px-4 pt-4 pb-2">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">Graph Type</p>
                  <ChartTypeSelector value={chartType} onChange={setChartType} />
                </div>
                <div className="px-2 py-3">
                  <PerformanceChart data={rows} chartType={chartType} />
                </div>
              </div>
            )}

            {/* Mobile Subject Cards */}
            {mobileTab === 'table' && (
              <div className="space-y-2.5">
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 px-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  {rows.length} subjects · Tap a card to see score
                </p>
                {rows.map((row, i) => (
                  <SubjectCard key={row.subject} row={row} idx={i + 1} />
                ))}
                {/* Mobile Grand Total */}
                {stats && (
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4" /> Grand Total — {rows.length} Subjects
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className={`text-[24px] font-extrabold tabular-nums ${getPercentColor(stats.overallPct)}`}>{stats.overallPct}%</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Overall %</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[24px] font-extrabold tabular-nums text-slate-800 dark:text-slate-100">{stats.totalObtained}</p>
                        <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">of {stats.totalMax} marks</p>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-blue-200 dark:bg-blue-500/20 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${stats.overallPct}%` }} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>Session</strong> and <strong>Term</strong>, then click <strong>Show</strong> to generate the performance report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
