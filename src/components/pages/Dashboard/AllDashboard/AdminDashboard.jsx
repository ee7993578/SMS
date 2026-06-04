/**
 * AdminDashboard.jsx
 * Folder: src/pages/Dashboard/AdminDashboard.jsx
 *
 * Converts legacy ASPX "Admin Dashboard New" to fully-responsive React + Tailwind.
 *
 * Sections:
 *  1. Student Headcounts (YTD) — gender-wise with progress bars
 *  2. New Admissions Statistics — school reg vs online reg
 *  3. New Admissions Ratio (vs prev year) — gender comparison table
 *  4. Student Statistics (vs prev year) — boys/girls comparison table
 *  5. Student Strength Standards Wise — Bar chart (Recharts)
 *  6. Student Statistics Comparison with Prev Year — Grouped bar chart
 *  7. New Admissions In (Last 7/15/30 days) — Line chart with toggle
 *  8. Standard Wise Statistics — Donut/Pie chart
 *  9. Religion Wise Student Strength — Pie chart
 * 10. Transfer Certificate Statistics — Bar chart
 * 11. Category Wise Student Statistics — Horizontal bar chart
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts'
import {
  Users, UserPlus, TrendingUp, TrendingDown,
  GraduationCap, School2, BookOpen, Award,
  ChevronRight, ChevronDown, BarChart3,
  ArrowUpRight, ArrowDownRight, Minus,
  Moon, Sun, Menu, X, Activity,
  BookMarked, Tag, FileText, Clock,
  RefreshCw, Calendar, Layers, Building2, MapPin
} from 'lucide-react'

// ─── DUMMY DATA ────────────────────────────────────────────────────────────────

const CURRENT_SESSION = '2025-26'
const PREV_SESSION    = '2024-25'

const HEADCOUNT_DATA = {
  total:  1247,
  male:   712,
  female: 535,
}

const NEW_ADMISSION_DATA = {
  total:   290,
  school:  203,
  online:  87,
}

const ADMISSION_RATIO = {
  thisYear: { male: 168, female: 122 },
  prevYear: { male: 148, female: 102 },
}

const STUDENT_STATS = {
  thisYear: { boys: 712, girls: 535 },
  prevYear: { boys: 648, girls: 509 },
}

// Standards-wise strength (Bar chart)
const STRENGTH_STANDARDS = [
  { name: 'Nur',  students: 76 },
  { name: 'LKG',  students: 93 },
  { name: 'UKG',  students: 91 },
  { name: 'I',    students: 113 },
  { name: 'II',   students: 115 },
  { name: 'III',  students: 54 },
  { name: 'IV',   students: 49 },
  { name: 'V',    students: 54 },
  { name: 'VI',   students: 125 },
  { name: 'VII',  students: 61 },
  { name: 'VIII', students: 52 },
  { name: 'IX',   students: 108 },
  { name: 'X',    students: 55 },
  { name: 'XI',   students: 120 },
  { name: 'XII',  students: 116 },
]

// Comparison prev vs current year
const COMPARISON_DATA = [
  { name: 'Nur',  thisYear: 76,  prevYear: 69  },
  { name: 'LKG',  thisYear: 93,  prevYear: 83  },
  { name: 'UKG',  thisYear: 91,  prevYear: 81  },
  { name: 'I',    thisYear: 113, prevYear: 103 },
  { name: 'II',   thisYear: 115, prevYear: 105 },
  { name: 'III',  thisYear: 54,  prevYear: 49  },
  { name: 'IV',   thisYear: 49,  prevYear: 44  },
  { name: 'V',    thisYear: 54,  prevYear: 49  },
  { name: 'VI',   thisYear: 125, prevYear: 115 },
  { name: 'VII',  thisYear: 61,  prevYear: 51  },
  { name: 'VIII', thisYear: 52,  prevYear: 47  },
  { name: 'IX',   thisYear: 108, prevYear: 88  },
  { name: 'X',    thisYear: 55,  prevYear: 50  },
  { name: 'XI',   thisYear: 120, prevYear: 104 },
  { name: 'XII',  thisYear: 116, prevYear: 100 },
]

// New admissions day-wise (last 7/15/30)
const ADMISSIONS_DAY_DATA = {
  7:  [
    { day: 'Mon', count: 12 }, { day: 'Tue', count: 8  },
    { day: 'Wed', count: 15 }, { day: 'Thu', count: 10 },
    { day: 'Fri', count: 18 }, { day: 'Sat', count: 22 },
    { day: 'Sun', count: 5  },
  ],
  15: [
    { day: 'D1',  count: 8  }, { day: 'D2',  count: 12 }, { day: 'D3',  count: 6  },
    { day: 'D4',  count: 15 }, { day: 'D5',  count: 9  }, { day: 'D6',  count: 11 },
    { day: 'D7',  count: 12 }, { day: 'D8',  count: 8  }, { day: 'D9',  count: 15 },
    { day: 'D10', count: 10 }, { day: 'D11', count: 18 }, { day: 'D12', count: 22 },
    { day: 'D13', count: 5  }, { day: 'D14', count: 14 }, { day: 'D15', count: 7  },
  ],
  30: [
    { day: 'W1', count: 45 }, { day: 'W2', count: 62 },
    { day: 'W3', count: 78 }, { day: 'W4', count: 55 },
    { day: 'W5', count: 32 }, { day: 'W6', count: 48 },
    { day: 'W7', count: 71 }, { day: 'W8', count: 39 },
  ],
}

// Standard-wise donut
const STANDARD_WISE = [
  { name: 'Primary (N–V)',   value: 442, color: '#3b82f6' },
  { name: 'Middle (VI–VIII)', value: 238, color: '#8b5cf6' },
  { name: 'High (IX–X)',     value: 163, color: '#06b6d4' },
  { name: 'Senior (XI–XII)', value: 236, color: '#10b981' },
]

// Religion wise
const RELIGION_DATA = [
  { name: 'Hindu',    value: 820, color: '#f59e0b' },
  { name: 'Muslim',   value: 210, color: '#3b82f6' },
  { name: 'Sikh',     value: 95,  color: '#10b981' },
  { name: 'Christian', value: 72,  color: '#8b5cf6' },
  { name: 'Others',   value: 50,  color: '#ec4899' },
]

// TC Stats
const TC_DATA = [
  { month: 'Apr', issued: 8 },  { month: 'May', issued: 12 },
  { month: 'Jun', issued: 5 },  { month: 'Jul', issued: 15 },
  { month: 'Aug', issued: 9 },  { month: 'Sep', issued: 11 },
  { month: 'Oct', issued: 7 },  { month: 'Nov', issued: 14 },
  { month: 'Dec', issued: 6 },  { month: 'Jan', issued: 10 },
  { month: 'Feb', issued: 8 },  { month: 'Mar', issued: 13 },
]

// Category wise
const CATEGORY_DATA = [
  { name: 'General', value: 680, color: '#3b82f6' },
  { name: 'OBC',     value: 320, color: '#10b981' },
  { name: 'SC',      value: 148, color: '#f59e0b' },
  { name: 'ST',      value: 62,  color: '#8b5cf6' },
  { name: 'EWS',     value: 37,  color: '#ec4899' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const pct = (part, total) => total ? Math.round((part / total) * 100) : 0

const trendIcon = (curr, prev) => {
  const diff = curr - prev
  if (diff > 0) return { icon: ArrowUpRight, color: 'text-emerald-500', label: `+${diff}`, bg: 'bg-emerald-50 dark:bg-emerald-500/10' }
  if (diff < 0) return { icon: ArrowDownRight, color: 'text-rose-500', label: `${diff}`, bg: 'bg-rose-50 dark:bg-rose-500/10' }
  return { icon: Minus, color: 'text-slate-400', label: '0', bg: 'bg-slate-50 dark:bg-slate-800' }
}

// ─── CHART TOOLTIP ─────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-xl px-3 py-2.5 text-[12px]">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1.5">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-bold" style={{ color: p.color }}>{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// ─── SECTION CARD WRAPPER ─────────────────────────────────────────────────────
function ChartCard({ title, subtitle, children, className = '', headerRight }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="text-[13px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200 truncate">{title}</p>
            {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {headerRight && <div className="flex-shrink-0">{headerRight}</div>}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

// ─── STAT WIDGET CARD (top row) ───────────────────────────────────────────────
function StatWidget({ title, subtitle, icon: Icon, iconColor, iconBg, children }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden h-full">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          <Icon className={`w-4 h-4 ${iconColor}`} />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200 truncate leading-tight">{title}</p>
          {subtitle && <p className="text-[10px] text-slate-400 dark:text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="px-4 py-4">{children}</div>
    </div>
  )
}

// ─── GENDER BAR ROW ───────────────────────────────────────────────────────────
function GenderBar({ label, count, total, color, imgSrc }) {
  const p = pct(count, total)
  return (
    <div className="flex items-center gap-3 py-2.5">
      {/* Avatar circle */}
      <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center ${color === 'blue' ? 'bg-blue-100 dark:bg-blue-500/15' : 'bg-pink-100 dark:bg-pink-500/15'}`}>
        <Users className={`w-4 h-4 ${color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 'text-pink-600 dark:text-pink-400'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{label}</span>
          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{count} <span className="text-[11px] font-medium text-slate-400">({p}%)</span></span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${color === 'blue' ? 'bg-blue-500' : 'bg-pink-500'}`}
            style={{ width: `${p}%` }}
          />
        </div>
      </div>
    </div>
  )
}

// ─── COMPARISON TABLE ROW ─────────────────────────────────────────────────────
function CompRow({ label, curr, prev, icon: Icon, iconBg, iconColor }) {
  const { icon: TIcon, color, label: tLabel, bg } = trendIcon(curr, prev)
  const diffPct = prev ? Math.abs(Math.round(((curr - prev) / prev) * 100)) : 0

  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] last:border-0">
      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center ${iconBg}`}>
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 w-16 flex-shrink-0">{label}</span>
      <div className="flex-1 flex items-center gap-3 justify-end">
        <div className="text-right">
          <p className="text-[16px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{curr}</p>
          <p className="text-[10px] text-slate-400">{CURRENT_SESSION}</p>
        </div>
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${bg}`}>
          <TIcon className={`w-3.5 h-3.5 ${color}`} />
          <span className={`text-[11px] font-bold tabular-nums ${color}`}>{diffPct}%</span>
        </div>
        <div className="text-right">
          <p className="text-[16px] font-bold text-slate-500 dark:text-slate-400 tabular-nums leading-tight">{prev}</p>
          <p className="text-[10px] text-slate-400">{PREV_SESSION}</p>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [admDays, setAdmDays] = useState(7)

  const malePct    = pct(HEADCOUNT_DATA.male,  HEADCOUNT_DATA.total)
  const femalePct  = pct(HEADCOUNT_DATA.female, HEADCOUNT_DATA.total)
  const schoolPct  = pct(NEW_ADMISSION_DATA.school, NEW_ADMISSION_DATA.total)
  const onlinePct  = pct(NEW_ADMISSION_DATA.online, NEW_ADMISSION_DATA.total)

  const admDayData = ADMISSIONS_DAY_DATA[admDays]

  // Top summary KPI cards (quick glance)
  const kpiCards = [
    { label: 'Total Students', value: HEADCOUNT_DATA.total.toLocaleString(), icon: Users, color: 'blue', sub: `${CURRENT_SESSION}` },
    { label: 'New Admissions', value: NEW_ADMISSION_DATA.total, icon: UserPlus, color: 'emerald', sub: 'This session' },
    { label: 'Online Registrations', value: NEW_ADMISSION_DATA.online, icon: Activity, color: 'violet', sub: `${onlinePct}% of new` },
    { label: 'Growth (vs prev yr)', value: `+${pct(HEADCOUNT_DATA.total - 1157, 1157)}%`, icon: TrendingUp, color: 'amber', sub: `${PREV_SESSION} → ${CURRENT_SESSION}` },
  ]

  const kpiColors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }

  return (
    <div className="space-y-5 pb-10">

      {/* ── PAGE TITLE ───────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Admin Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Academic year overview — session {CURRENT_SESSION}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/25">
            <Calendar className="w-3.5 h-3.5" />
            {CURRENT_SESSION}
          </span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 dark:bg-indigo-600 text-white text-[12px] font-semibold shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95">
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ── TOP KPI STRIP ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {kpiCards.map((k, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3.5 shadow-sm">
            <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${kpiColors[k.color]}`}>
              <k.icon className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[22px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{k.value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate font-medium">{k.label}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{k.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── ROW 1: 4 STAT WIDGETS ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* 1. Student Headcounts (YTD) */}
        <StatWidget
          title="Student Headcounts"
          subtitle="YTD"
          icon={Users}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-100 dark:bg-blue-500/15"
        >
          {/* Total */}
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Total</span>
            <span className="text-[28px] font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-none">
              {HEADCOUNT_DATA.total.toLocaleString()}
            </span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.08)]">
            <GenderBar label="Male"   count={HEADCOUNT_DATA.male}   total={HEADCOUNT_DATA.total} color="blue" />
            <GenderBar label="Female" count={HEADCOUNT_DATA.female} total={HEADCOUNT_DATA.total} color="pink" />
          </div>
        </StatWidget>

        {/* 2. New Admissions Statistics */}
        <StatWidget
          title="New Admissions"
          subtitle="Statistics"
          icon={UserPlus}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-100 dark:bg-emerald-500/15"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">Total</span>
            <span className="text-[28px] font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-none">
              {NEW_ADMISSION_DATA.total}
            </span>
          </div>

          {/* School Reg */}
          <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
            <div className="w-9 h-9 rounded-xl bg-yellow-100 dark:bg-yellow-500/15 flex-shrink-0 flex items-center justify-center">
              <School2 className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Reg. at School</span>
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{NEW_ADMISSION_DATA.school} <span className="text-[11px] text-slate-400">({schoolPct}%)</span></span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-yellow-400 transition-all duration-700" style={{ width: `${schoolPct}%` }} />
              </div>
            </div>
          </div>

          {/* Online Reg */}
          <div className="flex items-center gap-3 py-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex-shrink-0 flex items-center justify-center">
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Online Reg.</span>
                <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{NEW_ADMISSION_DATA.online} <span className="text-[11px] text-slate-400">({onlinePct}%)</span></span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${onlinePct}%` }} />
              </div>
            </div>
          </div>
        </StatWidget>

        {/* 3. New Admissions Ratio (vs prev year) */}
        <StatWidget
          title="New Admissions Ratio"
          subtitle={`vs ${PREV_SESSION}`}
          icon={TrendingUp}
          iconColor="text-violet-600 dark:text-violet-400"
          iconBg="bg-violet-100 dark:bg-violet-500/15"
        >
          <CompRow
            label="Male"
            curr={ADMISSION_RATIO.thisYear.male}
            prev={ADMISSION_RATIO.prevYear.male}
            icon={Users}
            iconBg="bg-blue-100 dark:bg-blue-500/15"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <CompRow
            label="Female"
            curr={ADMISSION_RATIO.thisYear.female}
            prev={ADMISSION_RATIO.prevYear.female}
            icon={Users}
            iconBg="bg-pink-100 dark:bg-pink-500/15"
            iconColor="text-pink-600 dark:text-pink-400"
          />
        </StatWidget>

        {/* 4. Student Statistics (vs prev year) */}
        <StatWidget
          title="Student Statistics"
          subtitle={`vs ${PREV_SESSION}`}
          icon={BarChart3}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-100 dark:bg-amber-500/15"
        >
          <CompRow
            label="Boys"
            curr={STUDENT_STATS.thisYear.boys}
            prev={STUDENT_STATS.prevYear.boys}
            icon={Users}
            iconBg="bg-blue-100 dark:bg-blue-500/15"
            iconColor="text-blue-600 dark:text-blue-400"
          />
          <CompRow
            label="Girls"
            curr={STUDENT_STATS.thisYear.girls}
            prev={STUDENT_STATS.prevYear.girls}
            icon={Users}
            iconBg="bg-pink-100 dark:bg-pink-500/15"
            iconColor="text-pink-600 dark:text-pink-400"
          />
        </StatWidget>
      </div>

      {/* ── ROW 2: STRENGTH STANDARDS WISE (full width) ─────────────────────── */}
      <ChartCard
        title="Student Strength — Standards Wise"
        subtitle={`Session ${CURRENT_SESSION} · All classes`}
      >
        <div className="h-64 sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={STRENGTH_STANDARDS} margin={{ top: 4, right: 8, left: -16, bottom: 0 }} barCategoryGap="25%">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
              <Bar dataKey="students" name="Students" radius={[6, 6, 0, 0]}>
                {STRENGTH_STANDARDS.map((_, i) => (
                  <Cell key={i} fill={`hsl(${220 + i * 5}, 70%, ${55 + (i % 3) * 5}%)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* ── ROW 3: COMPARISON + NEW ADMISSIONS IN ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Student Statistics Comparison */}
        <ChartCard
          title="Student Statistics Comparison"
          subtitle={`${CURRENT_SESSION} vs ${PREV_SESSION}`}
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={COMPARISON_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle" iconSize={8}
                />
                <Bar dataKey="thisYear" name={CURRENT_SESSION} fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="prevYear" name={PREV_SESSION}    fill="#94a3b8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* New Admissions In (Last 7/15/30 days) */}
        <ChartCard
          title="New Admissions In"
          headerRight={
            <div className="flex gap-1">
              {[7, 15, 30].map(d => (
                <button
                  key={d}
                  onClick={() => setAdmDays(d)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    admDays === d
                      ? 'bg-blue-600 dark:bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  Last {d}
                </button>
              ))}
            </div>
          }
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={admDayData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  name="Admissions"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  dot={{ fill: '#10b981', r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* ── ROW 4: STANDARD WISE + RELIGION WISE ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Standard Wise Statistics */}
        <ChartCard title="Standard Wise Statistics" subtitle="Group-wise strength">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Donut */}
            <div className="w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={STANDARD_WISE}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {STANDARD_WISE.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex-1 w-full space-y-2">
              {STANDARD_WISE.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-[12px] text-slate-600 dark:text-slate-300 truncate">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct(item.value, HEADCOUNT_DATA.total)}%`, background: item.color }} />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 tabular-nums w-8 text-right">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        {/* Religion Wise Student Strength */}
        <ChartCard title="Religion Wise Student Strength">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Pie */}
            <div className="w-48 h-48 flex-shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={RELIGION_DATA}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {RELIGION_DATA.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="flex-1 w-full space-y-2">
              {RELIGION_DATA.map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                    <span className="text-[12px] text-slate-600 dark:text-slate-300">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${pct(item.value, HEADCOUNT_DATA.total)}%`, background: item.color }} />
                    </div>
                    <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 tabular-nums w-8 text-right">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>
      </div>

      {/* ── ROW 5: TC STATISTICS + CATEGORY WISE ────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Transfer Certificate Statistics */}
        <ChartCard title="Transfer Certificate Statistics" subtitle="Monthly TC issued">
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={TC_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barCategoryGap="35%">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(99,102,241,0.06)' }} />
                <Bar dataKey="issued" name="TC Issued" fill="#f59e0b" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Category Wise Student Statistics */}
        <ChartCard title="Category Wise Student Statistics">
          <div className="space-y-3">
            {CATEGORY_DATA.map((item, i) => {
              const p = pct(item.value, HEADCOUNT_DATA.total)
              return (
                <div key={i} className="flex items-center gap-3">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md flex-shrink-0 w-14 text-center"
                    style={{ background: item.color + '22', color: item.color }}
                  >
                    {item.name}
                  </span>
                  <div className="flex-1 h-5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
                    <div
                      className="h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                      style={{ width: `${p}%`, background: item.color }}
                    >
                      {p > 8 && (
                        <span className="text-[10px] font-bold text-white">{p}%</span>
                      )}
                    </div>
                  </div>
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums w-10 text-right flex-shrink-0">
                    {item.value}
                  </span>
                </div>
              )
            })}
          </div>
        </ChartCard>
      </div>

    </div>
  )
}
