/**
 * MarksStatusGraph.jsx
 * Converts legacy ASPX "Marks Status Subject-wise (Graph)" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session, Class, Term, Exam, Subject dropdowns (Class & Term trigger dependent loading)
 *  - Graph type selector: bar, column, line, area, pie, doughnut, scatter, bubble
 *  - Fully interactive charts rendered via recharts
 *  - Desktop: filter panel + rich chart view
 *  - Mobile: drawer filter + tab-based chart/table toggle
 *  - Export placeholder (Excel button)
 *  - No horizontal scroll on mobile
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  BarChart3, BarChart2, TrendingUp, Activity, PieChart, Donut,
  ScatterChart, Loader2, Eye, RefreshCw, SlidersHorizontal,
  X, ChevronDown, AlertCircle, Check, Download,
  BookOpen, School2, Filter, Info, FileSpreadsheet,
  ChevronRight, Award, Users, Target, Layers
} from 'lucide-react'
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area,
  ScatterChart as RechartsScatter, Scatter,
  PieChart as RechartsPie, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ZAxis
} from 'recharts'

// ─── STATIC DATA ─────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES_BY_SESSION = {
  '2022-23': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

const TERMS = ['Term 1', 'Term 2', 'Annual']

const EXAMS_BY_TERM = {
  'Term 1':  ['Unit Test 1', 'Half Yearly'],
  'Term 2':  ['Unit Test 2', 'Pre Board'],
  'Annual':  ['Annual Exam', 'Board Exam'],
}

const SUBJECTS_BY_CLASS = {
  'Class I':    ['English', 'Hindi', 'Mathematics', 'EVS'],
  'Class II':   ['English', 'Hindi', 'Mathematics', 'EVS'],
  'Class III':  ['English', 'Hindi', 'Mathematics', 'EVS', 'Drawing'],
  'Class IV':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  'Class V':    ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  'Class VI':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class VII':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class VIII': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  'Class IX':   ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  'Class X':    ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  'Class XI':   ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
  'Class XII':  ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
}

// Score ranges: Excellent (≥80), Good (60-79), Average (40-59), Below Average (<40)
const generateMarksData = (cls, subject, exam) => {
  // Deterministic but varied dummy data based on inputs
  const seed = (cls?.length ?? 5) + (subject?.length ?? 7) + (exam?.length ?? 6)
  const base = (seed * 7) % 20
  return [
    { range: '0–20',   count: 2 + (base % 4),    label: 'Very Low'     },
    { range: '21–40',  count: 5 + (base % 6),    label: 'Below Avg'    },
    { range: '41–60',  count: 12 + (base % 8),   label: 'Average'      },
    { range: '61–80',  count: 18 + (base % 10),  label: 'Good'         },
    { range: '81–100', count: 10 + (base % 7),   label: 'Excellent'    },
  ]
}

const generateStudentData = (cls, subject, exam) => {
  const seed = (cls?.length ?? 5) + (subject?.length ?? 7)
  const names = ['Aarav S.', 'Ananya P.', 'Rohan M.', 'Priya K.', 'Kabir T.', 'Sneha R.',
                 'Arjun B.', 'Divya N.', 'Yash G.', 'Pooja V.', 'Dev H.', 'Riya J.',
                 'Aditya L.', 'Simran C.', 'Nikhil D.', 'Meera S.']
  return names.map((name, i) => ({
    name,
    marks: Math.min(100, 35 + ((seed * (i + 3)) % 65)),
    outOf: 100,
  }))
}

// Palette for chart series
const CHART_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6']

const PIE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#6366f1']

// ─── GRAPH TYPE CONFIG ────────────────────────────────────────────────────────

const GRAPH_TYPES = [
  { id: 'column',   label: 'Column',   icon: BarChart3     },
  { id: 'bar',      label: 'Bar',      icon: BarChart2     },
  { id: 'line',     label: 'Line',     icon: TrendingUp    },
  { id: 'area',     label: 'Area',     icon: Activity      },
  { id: 'pie',      label: 'Pie',      icon: PieChart      },
  { id: 'doughnut', label: 'Doughnut', icon: Layers        },
  { id: 'scatter',  label: 'Scatter',  icon: ScatterChart  },
  { id: 'bubble',   label: 'Bubble',   icon: Target        },
]

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-40 disabled:cursor-not-allowed
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
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    indigo:  'bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── GRAPH TYPE SELECTOR ──────────────────────────────────────────────────────

function GraphTypeSelector({ selected, onChange }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
        <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Select Graph Type</span>
      </div>
      {/* Scrollable horizontally on mobile, wrap on desktop */}
      <div className="px-4 py-3 overflow-x-auto">
        <div className="flex gap-2 min-w-max sm:min-w-0 sm:flex-wrap">
          {GRAPH_TYPES.map(({ id, label, icon: Icon }) => {
            const active = selected === id
            return (
              <button
                key={id}
                onClick={() => onChange(id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold border transition-all flex-shrink-0
                  ${active
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20 dark:bg-indigo-500 dark:border-indigo-500'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 dark:bg-[#1e2238] dark:text-slate-300 dark:border-[rgba(99,102,241,0.2)] dark:hover:border-indigo-500/50'
                  }`}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── CHART RENDERER ───────────────────────────────────────────────────────────

function ChartRenderer({ type, data, studentData }) {
  const chartHeight = 320

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.3)] rounded-xl shadow-xl px-4 py-3 text-[13px]">
        <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="font-semibold" style={{ color: p.color ?? p.fill }}>
            {p.name}: <span className="tabular-nums">{p.value}</span>
          </p>
        ))}
      </div>
    )
  }

  // Scatter needs numeric x
  const scatterData = data.map((d, i) => ({ x: i * 20 + 10, y: d.count, z: d.count * 10, name: d.range }))

  const commonAxis = {
    xAxis: <XAxis dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />,
    yAxis: <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />,
    grid:  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} vertical={false} />,
  }

  if (type === 'column') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} barSize={36}>
          {commonAxis.grid}{commonAxis.xAxis}{commonAxis.yAxis}
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }
  if (type === 'bar') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart data={data} layout="vertical" barSize={26}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="range" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={48} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="count" name="Students" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    )
  }
  if (type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <LineChart data={data}>
          {commonAxis.grid}{commonAxis.xAxis}{commonAxis.yAxis}
          <Tooltip content={<CustomTooltip />} />
          <Line type="monotone" dataKey="count" name="Students" stroke={CHART_COLORS[0]} strokeWidth={3} dot={{ r: 5, fill: CHART_COLORS[0] }} activeDot={{ r: 7 }} />
        </LineChart>
      </ResponsiveContainer>
    )
  }
  if (type === 'area') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart data={data}>
          {commonAxis.grid}{commonAxis.xAxis}{commonAxis.yAxis}
          <Tooltip content={<CustomTooltip />} />
          <defs>
            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.25} />
              <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="count" name="Students" stroke={CHART_COLORS[0]} strokeWidth={3} fill="url(#areaGrad)" dot={{ r: 4, fill: CHART_COLORS[0] }} />
        </AreaChart>
      </ResponsiveContainer>
    )
  }
  if (type === 'pie' || type === 'doughnut') {
    const innerRadius = type === 'doughnut' ? '55%' : '0%'
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <RechartsPie>
          <Pie
            data={data}
            dataKey="count"
            nameKey="range"
            cx="50%"
            cy="50%"
            outerRadius="70%"
            innerRadius={innerRadius}
            label={({ range, percent }) => `${range} (${(percent * 100).toFixed(0)}%)`}
            labelLine={true}
          >
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip formatter={(v, n) => [v, 'Students']} />
          <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: '12px' }} />
        </RechartsPie>
      </ResponsiveContainer>
    )
  }
  if (type === 'scatter') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <RechartsScatter>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
          <XAxis dataKey="x" name="Score Midpoint" type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} label={{ value: 'Score Range', position: 'insideBottom', offset: -5, fontSize: 11, fill: '#94a3b8' }} />
          <YAxis dataKey="y" name="Students" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0]?.payload
            return (
              <div className="bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.3)] rounded-xl shadow-xl px-3 py-2 text-[12px]">
                <p className="font-bold text-slate-700 dark:text-slate-200">{scatterData.find(s => s.x === d?.x)?.name}</p>
                <p className="text-indigo-600">Students: {d?.y}</p>
              </div>
            )
          }} />
          <Scatter data={scatterData} fill={CHART_COLORS[0]} />
        </RechartsScatter>
      </ResponsiveContainer>
    )
  }
  if (type === 'bubble') {
    return (
      <ResponsiveContainer width="100%" height={chartHeight}>
        <RechartsScatter>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.4} />
          <XAxis dataKey="x" name="Score Midpoint" type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis dataKey="y" name="Students" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={30} />
          <ZAxis dataKey="z" range={[60, 400]} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            const d = payload[0]?.payload
            return (
              <div className="bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.3)] rounded-xl shadow-xl px-3 py-2 text-[12px]">
                <p className="font-bold text-slate-700 dark:text-slate-200">{scatterData.find(s => s.x === d?.x)?.name}</p>
                <p className="text-indigo-600">Students: {d?.y}</p>
              </div>
            )
          }} />
          <Scatter data={scatterData} fill={CHART_COLORS[1]} fillOpacity={0.7} />
        </RechartsScatter>
      </ResponsiveContainer>
    )
  }
  return null
}

// ─── MARK TABLE (mobile/desktop) ──────────────────────────────────────────────

function MarksTable({ data }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]">
      <table className="w-full min-w-[320px]">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            {['Score Range', 'Category', 'Students'].map((h, i) => (
              <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] hover:bg-slate-50/60 dark:hover:bg-white/[0.015] transition-colors">
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-bold tabular-nums"
                  style={{ background: PIE_COLORS[i] + '20', color: PIE_COLORS[i] }}>
                  {row.range}
                </span>
              </td>
              <td className="px-4 py-3 text-[12px] font-semibold text-slate-600 dark:text-slate-300">{row.label}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex-1 max-w-[80px] h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (row.count / 25) * 100)}%`, background: PIE_COLORS[i] }} />
                  </div>
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums w-6">{row.count}</span>
                </div>
              </td>
            </tr>
          ))}
          <tr className="bg-indigo-50 dark:bg-indigo-500/[0.07] border-t-2 border-indigo-200 dark:border-indigo-500/30">
            <td className="px-4 py-3 text-[12px] font-bold text-indigo-700 dark:text-indigo-400" colSpan={2}>Grand Total</td>
            <td className="px-4 py-3">
              <span className="text-[14px] font-bold text-indigo-700 dark:text-indigo-300 tabular-nums">
                {data.reduce((s, r) => s + r.count, 0)}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors, terms, exams, subjects }) {
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
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Fields */}
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setFilters(p => ({ ...p, session: e.target.value, class: '', term: '', exam: '', subject: '' }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.class} required>
            <NativeSelect value={filters.class} onChange={e => setFilters(p => ({ ...p, class: e.target.value, subject: '' }))} placeholder="-- Select Class --" disabled={!filters.session} error={errors.class}>
              {(CLASSES_BY_SESSION[filters.session] || []).map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.term} required>
            <NativeSelect value={filters.term} onChange={e => setFilters(p => ({ ...p, term: e.target.value, exam: '' }))} placeholder="-- Select Term --" disabled={!filters.class} error={errors.term}>
              {terms.map(t => <option key={t} value={t}>{t}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Exam" error={errors.exam} required>
            <NativeSelect value={filters.exam} onChange={e => setFilters(p => ({ ...p, exam: e.target.value }))} placeholder="-- Select Exam --" disabled={!filters.term} error={errors.exam}>
              {exams.map(e => <option key={e} value={e}>{e}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Subject" error={errors.subject} required>
            <NativeSelect value={filters.subject} onChange={e => setFilters(p => ({ ...p, subject: e.target.value }))} placeholder="-- Select Subject --" disabled={!filters.class} error={errors.subject}>
              {subjects.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 transition-all shadow-md shadow-indigo-500/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MOBILE VIEW TABS ─────────────────────────────────────────────────────────

function MobileTabs({ active, onChange }) {
  return (
    <div className="flex gap-1 p-1 bg-slate-100 dark:bg-[#1e2238] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]">
      {[{ id: 'chart', label: 'Chart' }, { id: 'table', label: 'Table' }].map(tab => (
        <button key={tab.id} onClick={() => onChange(tab.id)}
          className={`flex-1 py-2 rounded-lg text-[13px] font-semibold transition-all
            ${active === tab.id
              ? 'bg-white dark:bg-[#1a1f35] text-indigo-700 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
              : 'text-slate-500 dark:text-slate-400'
            }`}>
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// ─── REPORT HEADER ────────────────────────────────────────────────────────────

function ReportHeader({ filters }) {
  return (
    <div className="rounded-2xl border border-indigo-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <h2 className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100 truncate">
              Marks Status — Subject-wise
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {[
              { label: 'Session', value: filters.session },
              { label: 'Class', value: filters.class },
              { label: 'Term', value: filters.term },
              { label: 'Exam', value: filters.exam },
              { label: 'Subject', value: filters.subject },
            ].map(({ label, value }) => (
              <span key={label} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-white/5 border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-600 dark:text-slate-300">
                <span className="text-slate-400 dark:text-slate-500">{label}:</span> {value}
              </span>
            ))}
          </div>
        </div>
        <div className="flex-shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/15 border border-indigo-200 dark:border-indigo-500/25">
            <School2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400">Saraswati Vidya Mandir</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN PAGE COMPONENT ──────────────────────────────────────────────────────

export default function MarksStatusGraph() {
  const [filters, setFilters]         = useState({ session: '', class: '', term: '', exam: '', subject: '' })
  const [graphType, setGraphType]     = useState('column')
  const [marksData, setMarksData]     = useState([])
  const [studentData, setStudentData] = useState([])
  const [shownFilters, setShownFilters] = useState(null)
  const [loading, setLoading]         = useState(false)
  const [exporting, setExporting]     = useState(false)
  const [filterOpen, setFilterOpen]   = useState(false)
  const [mobileTab, setMobileTab]     = useState('chart')
  const [errors, setErrors]           = useState({})
  const [toast, setToast]             = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Dependent dropdown options
  const terms    = TERMS
  const exams    = useMemo(() => EXAMS_BY_TERM[filters.term] || [], [filters.term])
  const subjects = useMemo(() => SUBJECTS_BY_CLASS[filters.class] || [], [filters.class])

  // Reset exam when term changes
  useEffect(() => {
    if (filters.exam && !exams.includes(filters.exam)) {
      setFilters(p => ({ ...p, exam: '' }))
    }
  }, [exams, filters.exam])

  // Reset subject when class changes
  useEffect(() => {
    if (filters.subject && !subjects.includes(filters.subject)) {
      setFilters(p => ({ ...p, subject: '' }))
    }
  }, [subjects, filters.subject])

  const validate = () => {
    const err = {}
    if (!filters.session) err.session = 'Required'
    if (!filters.class)   err.class   = 'Required'
    if (!filters.term)    err.term    = 'Required'
    if (!filters.exam)    err.exam    = 'Required'
    if (!filters.subject) err.subject = 'Required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleShow = useCallback(() => {
    if (!validate()) return
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const mData = generateMarksData(filters.class, filters.subject, filters.exam)
      const sData = generateStudentData(filters.class, filters.subject, filters.exam)
      setMarksData(mData)
      setStudentData(sData)
      setShownFilters({ ...filters })
      setLoading(false)
      setMobileTab('chart')
      showToast(`Report loaded for ${filters.subject} — ${filters.exam}`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', class: '', term: '', exam: '', subject: '' })
    setMarksData([])
    setStudentData([])
    setShownFilters(null)
    setErrors({})
    showToast('Filters cleared.', 'success')
  }

  const handleExport = () => {
    if (!marksData.length) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  const hasResults = !!shownFilters && marksData.length > 0

  const totalStudents = useMemo(() => marksData.reduce((s, r) => s + r.count, 0), [marksData])
  const excellentCount = useMemo(() => marksData.find(r => r.range === '81–100')?.count ?? 0, [marksData])
  const failCount = useMemo(() => marksData.find(r => r.range === '0–20')?.count ?? 0, [marksData])
  const passRate = totalStudents ? Math.round(((totalStudents - failCount) / totalStudents) * 100) : 0

  const activeFilterCount = Object.values(filters).filter(Boolean).length

  return (
    <div className="space-y-4 pb-12">

      {/* ── PAGE TITLE ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Mark List — Subject-wise Graph
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize student performance distribution by subject and exam.
          </p>
        </div>
        {hasResults && (
          <button onClick={handleExport} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP FILTER PANEL ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value, class: '', term: '', exam: '', subject: '' })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Class" error={errors.class} required>
              <NativeSelect value={filters.class}
                onChange={e => { setFilters(p => ({ ...p, class: e.target.value, subject: '' })); setErrors(p => ({ ...p, class: undefined })) }}
                placeholder="-- Class --" disabled={!filters.session} error={errors.class}>
                {(CLASSES_BY_SESSION[filters.session] || []).map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Term" error={errors.term} required>
              <NativeSelect value={filters.term}
                onChange={e => { setFilters(p => ({ ...p, term: e.target.value, exam: '' })); setErrors(p => ({ ...p, term: undefined })) }}
                placeholder="-- Term --" disabled={!filters.class} error={errors.term}>
                {terms.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Exam" error={errors.exam} required>
              <NativeSelect value={filters.exam}
                onChange={e => { setFilters(p => ({ ...p, exam: e.target.value })); setErrors(p => ({ ...p, exam: undefined })) }}
                placeholder="-- Exam --" disabled={!filters.term} error={errors.exam}>
                {exams.map(e => <option key={e} value={e}>{e}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Subject" error={errors.subject} required>
              <NativeSelect value={filters.subject}
                onChange={e => { setFilters(p => ({ ...p, subject: e.target.value })); setErrors(p => ({ ...p, subject: undefined })) }}
                placeholder="-- Subject --" disabled={!filters.class} error={errors.subject}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <button onClick={handleShow} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show
            </button>
            <button onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER BAR ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold bg-indigo-600 text-white shadow-md shadow-indigo-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} selected` : 'Select Filters'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {hasResults && (
          <>
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70 shadow-sm">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
            <button onClick={handleReset}
              className="px-3.5 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onShow={handleShow}
        loading={loading}
        errors={errors}
        terms={terms}
        exams={exams}
        subjects={subjects}
      />

      {/* ── LOADING SKELETON ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          <div className="grid grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        </div>
      )}

      {/* ── RESULTS ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Report Header */}
          <ReportHeader filters={shownFilters} />

          {/* Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={Users}   label="Total Students"   value={totalStudents}      color="indigo"  />
            <StatCard icon={Award}   label="Excellent (81+)"  value={excellentCount}     color="emerald" />
            <StatCard icon={Target}  label="Pass Rate"        value={`${passRate}%`}     color="amber"   />
            <StatCard icon={AlertCircle} label="Very Low (<20)" value={failCount}         color="rose"    />
          </div>

          {/* Graph Type Selector */}
          <GraphTypeSelector selected={graphType} onChange={setGraphType} />

          {/* ── DESKTOP CHART + TABLE SIDE BY SIDE ── */}
          <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
              <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                {shownFilters.subject} — Score Distribution ({shownFilters.exam})
              </span>
              <span className="ml-auto text-[12px] font-semibold text-indigo-600 dark:text-indigo-400 capitalize bg-indigo-50 dark:bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-100 dark:border-indigo-500/20">
                {graphType} chart
              </span>
            </div>
            <div className="flex gap-0 divide-x divide-slate-100 dark:divide-[rgba(99,102,241,0.1)]">
              {/* Chart */}
              <div className="flex-1 min-w-0 p-5">
                <ChartRenderer type={graphType} data={marksData} studentData={studentData} />
              </div>
              {/* Table */}
              <div className="w-72 flex-shrink-0 p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" /> Breakdown
                </p>
                <MarksTable data={marksData} />
              </div>
            </div>
          </div>

          {/* ── MOBILE TABS ── */}
          <div className="sm:hidden space-y-3">
            <MobileTabs active={mobileTab} onChange={setMobileTab} />

            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
                <span className="w-1 h-4 rounded-full bg-indigo-500 flex-shrink-0" />
                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate flex-1">
                  {shownFilters.subject} — {shownFilters.exam}
                </span>
                <span className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 capitalize bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-lg">
                  {graphType}
                </span>
              </div>

              {mobileTab === 'chart' && (
                <div className="p-4 overflow-hidden">
                  <ChartRenderer type={graphType} data={marksData} studentData={studentData} />
                </div>
              )}
              {mobileTab === 'table' && (
                <div className="p-4">
                  <MarksTable data={marksData} />
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── EMPTY STATE ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-500/10 dark:to-purple-500/10 flex items-center justify-center border border-indigo-100 dark:border-indigo-500/20">
            <BarChart3 className="w-8 h-8 text-indigo-400 dark:text-indigo-500" />
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400">No chart generated yet</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
              Select session, class, term, exam &amp; subject, then click <strong>Show</strong> to visualize marks distribution.
            </p>
          </div>
          {/* Step guide */}
          <div className="mt-2 flex flex-col sm:flex-row gap-2 text-[12px]">
            {['Select Session', 'Choose Class', 'Pick Term & Exam', 'Select Subject', 'Click Show'].map((step, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-slate-500 dark:text-slate-500 whitespace-nowrap">{step}</span>
                {i < 4 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:block flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
