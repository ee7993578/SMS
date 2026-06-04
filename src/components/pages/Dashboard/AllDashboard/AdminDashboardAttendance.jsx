/**
 * AdminDashboardAttendance.jsx
 * Folder: src/pages/Dashboard/AdminDashboardAttendance.jsx
 *
 * Converts legacy ASPX "AdminDashBoardAttendance.aspx" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Student strength stats (total, male, female)
 *  - Attendance authentication stats (biometric vs manual)
 *  - Average attendance comparison (today vs yesterday)
 *  - This month's holiday list (carousel)
 *  - Student attendance analysis - date wise (line chart via recharts)
 *  - Class wise attendance head count (bar chart)
 *  - Section wise attendance head count (bar chart with class filter)
 *  - Monthly attendance chart (area chart with class filter)
 *  - Mobile: tabs + cards layout, Desktop: full grid dashboard
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Users, UserCheck, UserX, Fingerprint, ClipboardEdit,
  TrendingUp, TrendingDown, CalendarDays, ChevronLeft,
  ChevronRight, BarChart3, BookOpen, School2, RefreshCw,
  CheckCircle2, XCircle, AlertCircle, ArrowUpRight, ArrowDownRight,
  GraduationCap, ShieldCheck, LayoutDashboard, Activity,
  Building2, Calendar, Filter, Info, Layers
} from 'lucide-react'
import {
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer
} from 'recharts'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const STUDENT_STATS = {
  total: 1248,
  male: { present: 396, total: 524 },
  female: { present: 348, total: 468 },
  totalPresent: 744,
  totalAbsent: 504,
}

const AUTH_STATS = {
  biometric: { count: 492, pct: 66 },
  manual:    { count: 252, pct: 34 },
}

const ATTENDANCE_COMPARISON = {
  boys:  { today: 396, yesterday: 378 },
  girls: { today: 348, yesterday: 362 },
}

const HOLIDAYS = [
  { date: '15 Jun, Thursday', name: "Idu'l Fitr" },
  { date: '21 Jun, Wednesday', name: 'Yoga Day' },
  { date: '15 Aug, Tuesday', name: 'Independence Day' },
  { date: '02 Oct, Tuesday', name: 'Gandhi Jayanti' },
  { date: '12 Nov, Sunday', name: 'Diwali' },
]

// Date-wise attendance for line chart (last 14 days)
const DATE_WISE_DATA = [
  { date: 'Jun 1',  present: 692, absent: 156 },
  { date: 'Jun 2',  present: 718, absent: 130 },
  { date: 'Jun 3',  present: 644, absent: 204 },
  { date: 'Jun 4',  present: 760, absent: 88  },
  { date: 'Jun 5',  present: 744, absent: 104 },
  { date: 'Jun 6',  present: 780, absent: 68  },
  { date: 'Jun 7',  present: 698, absent: 150 },
  { date: 'Jun 8',  present: 724, absent: 124 },
  { date: 'Jun 9',  present: 688, absent: 160 },
  { date: 'Jun 10', present: 756, absent: 92  },
  { date: 'Jun 11', present: 740, absent: 108 },
  { date: 'Jun 12', present: 764, absent: 84  },
  { date: 'Jun 13', present: 718, absent: 130 },
  { date: 'Jun 14', present: 744, absent: 104 },
]

// Class-wise attendance head count
const CLASS_WISE_DATA = [
  { class: 'Nur',  present: 56, absent: 20 },
  { class: 'LKG',  present: 68, absent: 14 },
  { class: 'UKG',  present: 72, absent: 12 },
  { class: 'I',    present: 82, absent: 16 },
  { class: 'II',   present: 78, absent: 18 },
  { class: 'III',  present: 42, absent: 8  },
  { class: 'IV',   present: 38, absent: 6  },
  { class: 'V',    present: 46, absent: 10 },
  { class: 'VI',   present: 88, absent: 22 },
  { class: 'VII',  present: 52, absent: 12 },
  { class: 'VIII', present: 44, absent: 8  },
  { class: 'IX',   present: 80, absent: 16 },
  { class: 'X',    present: 48, absent: 10 },
  { class: 'XI',   present: 92, absent: 22 },
  { class: 'XII',  present: 88, absent: 20 },
]

// Section-wise data per class
const SECTION_WISE_DATA = {
  'Class VI':  [
    { section: 'Sec A', present: 48, absent: 13 },
    { section: 'Sec B', present: 40, absent: 9  },
  ],
  'Class IX':  [
    { section: 'Sec A', present: 42, absent: 9  },
    { section: 'Sec B', present: 38, absent: 7  },
  ],
  'Class XI':  [
    { section: 'Sec A', present: 48, absent: 14 },
    { section: 'Sec B', present: 44, absent: 8  },
  ],
  'Class XII': [
    { section: 'Sec A', present: 46, absent: 10 },
    { section: 'Sec B', present: 42, absent: 10 },
  ],
  'Class I':   [
    { section: 'Sec A', present: 44, absent: 8  },
    { section: 'Sec B', present: 38, absent: 8  },
  ],
  'Nursery':   [
    { section: 'Sec A', present: 30, absent: 11 },
    { section: 'Sec B', present: 26, absent: 9  },
  ],
}
const SECTION_CLASSES = Object.keys(SECTION_WISE_DATA)

// Monthly attendance for area chart
const MONTHLY_DATA_BY_CLASS = {
  'Class VI': [
    { month: 'Jan', present: 80, absent: 12 }, { month: 'Feb', present: 74, absent: 18 },
    { month: 'Mar', present: 82, absent: 10 }, { month: 'Apr', present: 76, absent: 16 },
    { month: 'May', present: 86, absent: 6  }, { month: 'Jun', present: 88, absent: 4  },
  ],
  'Class IX': [
    { month: 'Jan', present: 72, absent: 16 }, { month: 'Feb', present: 68, absent: 20 },
    { month: 'Mar', present: 78, absent: 10 }, { month: 'Apr', present: 74, absent: 14 },
    { month: 'May', present: 80, absent: 8  }, { month: 'Jun', present: 80, absent: 8  },
  ],
  'Class XI': [
    { month: 'Jan', present: 86, absent: 8  }, { month: 'Feb', present: 80, absent: 14 },
    { month: 'Mar', present: 88, absent: 6  }, { month: 'Apr', present: 84, absent: 10 },
    { month: 'May', present: 90, absent: 4  }, { month: 'Jun', present: 92, absent: 2  },
  ],
  'Class XII': [
    { month: 'Jan', present: 82, absent: 14 }, { month: 'Feb', present: 76, absent: 20 },
    { month: 'Mar', present: 84, absent: 12 }, { month: 'Apr', present: 78, absent: 18 },
    { month: 'May', present: 86, absent: 10 }, { month: 'Jun', present: 88, absent: 8  },
  ],
  'Class I': [
    { month: 'Jan', present: 76, absent: 6  }, { month: 'Feb', present: 70, absent: 12 },
    { month: 'Mar', present: 80, absent: 2  }, { month: 'Apr', present: 74, absent: 8  },
    { month: 'May', present: 82, absent: 0  }, { month: 'Jun', present: 82, absent: 0  },
  ],
}
const MONTHLY_CLASSES = Object.keys(MONTHLY_DATA_BY_CLASS)

// Day range options for date-wise chart
const DAY_RANGES = ['Last 7 Days', 'Last 10 Days', 'Last 14 Days']

// Mobile tab definitions
const MOBILE_TABS = [
  { id: 'overview',  label: 'Overview', icon: LayoutDashboard },
  { id: 'datewise',  label: 'Date Wise', icon: Activity },
  { id: 'classwise', label: 'Class Wise', icon: BarChart3 },
  { id: 'monthly',   label: 'Monthly', icon: Calendar },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const pct = (val, total) => (total ? Math.round((val / total) * 100) : 0)

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Native select styled to match ERP theme */
function NativeSelect({ value, onChange, children, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none pl-3 pr-8 py-1.5 text-[12px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 border-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {children}
      </select>
      <ChevronRight className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none rotate-90" />
    </div>
  )
}

// ─── STAT CARD ─────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, trend }) {
  const colorMap = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3.5 shadow-sm">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value.toLocaleString()}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div className={`flex flex-col items-end flex-shrink-0 ${trend >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
          {trend >= 0
            ? <ArrowUpRight className="w-4 h-4" />
            : <ArrowDownRight className="w-4 h-4" />}
          <span className="text-[10px] font-bold">{Math.abs(trend)}%</span>
        </div>
      )}
    </div>
  )
}

// ─── PANEL WRAPPER ─────────────────────────────────────────────────────────────
function Panel({ title, subtitle, icon: Icon, action, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        {Icon && <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1 truncate">{title}</span>
        {subtitle && <span className="text-[12px] text-slate-400 dark:text-slate-500 hidden sm:block">{subtitle}</span>}
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─── STRENGTH CARD ─────────────────────────────────────────────────────────────
function StrengthCard() {
  const { total, male, female } = STUDENT_STATS
  const malePct  = pct(male.present, male.total)
  const femPct   = pct(female.present, female.total)
  const totalPct = pct(male.present + female.present, total)

  return (
    <Panel title="Total Student Strength" icon={Users}>
      {/* Total badge */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div>
          <p className="text-[28px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{total.toLocaleString()}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Total enrolled students</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[22px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">{(male.present + female.present).toLocaleString()}</span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">{totalPct}% present today</span>
        </div>
      </div>
      {/* Male row */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-[12px] mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Male</span>
              <span className="tabular-nums text-slate-500 dark:text-slate-400">{male.present}/{male.total}</span>
            </div>
            <div className="h-2 rounded-full bg-blue-100 dark:bg-blue-500/15 overflow-hidden">
              <div className="h-full rounded-full bg-blue-500 transition-all duration-700" style={{ width: `${malePct}%` }} />
            </div>
          </div>
          <span className="text-[12px] font-bold text-blue-600 dark:text-blue-400 tabular-nums w-10 text-right">{malePct}%</span>
        </div>
        {/* Female row */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-pink-50 dark:bg-pink-500/10 flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-pink-600 dark:text-pink-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-[12px] mb-1">
              <span className="font-semibold text-slate-600 dark:text-slate-300">Female</span>
              <span className="tabular-nums text-slate-500 dark:text-slate-400">{female.present}/{female.total}</span>
            </div>
            <div className="h-2 rounded-full bg-pink-100 dark:bg-pink-500/15 overflow-hidden">
              <div className="h-full rounded-full bg-pink-500 transition-all duration-700" style={{ width: `${femPct}%` }} />
            </div>
          </div>
          <span className="text-[12px] font-bold text-pink-600 dark:text-pink-400 tabular-nums w-10 text-right">{femPct}%</span>
        </div>
      </div>
    </Panel>
  )
}

// ─── AUTH STATS CARD ───────────────────────────────────────────────────────────
function AuthStatsCard() {
  const { biometric, manual } = AUTH_STATS
  return (
    <Panel title="Attendance Authentication" subtitle="How attendance was marked" icon={ShieldCheck}>
      <div className="space-y-4">
        {/* Biometric */}
        <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="text-[13px] font-semibold text-amber-800 dark:text-amber-300">Through Biometric Terminal</span>
            </div>
            <span className="text-[14px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{biometric.count} <span className="text-[11px] font-normal">({biometric.pct}%)</span></span>
          </div>
          <div className="h-2 rounded-full bg-amber-200 dark:bg-amber-500/20 overflow-hidden">
            <div className="h-full rounded-full bg-amber-500 transition-all duration-700" style={{ width: `${biometric.pct}%` }} />
          </div>
        </div>
        {/* Manual */}
        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ClipboardEdit className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-[13px] font-semibold text-emerald-800 dark:text-emerald-300">Manually</span>
            </div>
            <span className="text-[14px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{manual.count} <span className="text-[11px] font-normal">({manual.pct}%)</span></span>
          </div>
          <div className="h-2 rounded-full bg-emerald-200 dark:bg-emerald-500/20 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-700" style={{ width: `${manual.pct}%` }} />
          </div>
        </div>
        {/* Donut visual summary */}
        <div className="flex items-center gap-3 pt-1">
          <div className="relative w-12 h-12 flex-shrink-0">
            <svg viewBox="0 0 36 36" className="w-12 h-12 -rotate-90">
              <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-slate-800" />
              <circle cx="18" cy="18" r="14" fill="none" stroke="currentColor" strokeWidth="4"
                strokeDasharray={`${biometric.pct * 0.879} 87.9`}
                className="text-amber-500 transition-all duration-700" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300">{biometric.pct}%</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            <span className="text-amber-600 dark:text-amber-400 font-semibold">{biometric.pct}% biometric</span>, <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{manual.pct}% manual</span> — out of total {biometric.count + manual.count} marked present
          </p>
        </div>
      </div>
    </Panel>
  )
}

// ─── AVERAGE ATTENDANCE COMPARISON CARD ──────────────────────────────────────
function AvgAttendanceCard() {
  const { boys, girls } = ATTENDANCE_COMPARISON
  const boysDiff  = boys.today - boys.yesterday
  const girlsDiff = girls.today - girls.yesterday
  return (
    <Panel title="Average Attendance" subtitle="Comparison with last working day" icon={TrendingUp}>
      <div className="space-y-3">
        {/* Table header */}
        <div className="grid grid-cols-3 gap-2 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 px-1">
          <span></span>
          <span className="text-center">Today</span>
          <span className="text-center">Yesterday</span>
        </div>
        {/* Boys row */}
        <div className="grid grid-cols-3 gap-2 items-center rounded-xl bg-blue-50 dark:bg-blue-500/10 p-3">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[12px] font-semibold text-blue-800 dark:text-blue-300">Present</span>
          </div>
          <div className="text-center">
            <span className="text-[18px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{boys.today}</span>
            <span className={`ml-1 text-[10px] font-bold ${boysDiff >= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {boysDiff >= 0 ? '+' : ''}{boysDiff}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[18px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">{boys.yesterday}</span>
          </div>
        </div>
        {/* Girls row */}
        <div className="grid grid-cols-3 gap-2 items-center rounded-xl bg-rose-50 dark:bg-rose-500/10 p-3">
          <div className="flex items-center gap-2">
            <UserX className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span className="text-[12px] font-semibold text-rose-800 dark:text-rose-300">Absent</span>
          </div>
          <div className="text-center">
            <span className="text-[18px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{girls.today}</span>
            <span className={`ml-1 text-[10px] font-bold ${girlsDiff <= 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
              {girlsDiff >= 0 ? '+' : ''}{girlsDiff}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[18px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">{girls.yesterday}</span>
          </div>
        </div>
        {/* Attendance rate */}
        <div className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3 mt-1">
          <div className="flex justify-between text-[12px] mb-1.5">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Present rate today</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{pct(boys.today + girls.today, STUDENT_STATS.total)}%</span>
          </div>
          <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-700"
              style={{ width: `${pct(boys.today + girls.today, STUDENT_STATS.total)}%` }}
            />
          </div>
        </div>
      </div>
    </Panel>
  )
}

// ─── HOLIDAYS CAROUSEL ─────────────────────────────────────────────────────────
function HolidaysCard() {
  const [idx, setIdx] = useState(0)
  const holiday = HOLIDAYS[idx]
  const prev = () => setIdx(i => (i - 1 + HOLIDAYS.length) % HOLIDAYS.length)
  const next = () => setIdx(i => (i + 1) % HOLIDAYS.length)

  return (
    <Panel
      title="This Month's Holidays"
      icon={CalendarDays}
      action={
        <button className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 flex-shrink-0">
          View All
        </button>
      }
    >
      <div className="flex items-center gap-3">
        <button onClick={prev}
          className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors flex-shrink-0">
          <ChevronLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>

        <div className="flex-1 rounded-xl bg-gradient-to-r from-blue-50 via-indigo-50 to-violet-50 dark:from-[rgba(59,130,246,0.08)] dark:via-[rgba(99,102,241,0.08)] dark:to-[rgba(139,92,246,0.08)] border border-blue-100 dark:border-[rgba(99,102,241,0.15)] p-4 text-center transition-all duration-300">
          <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
          <p className="text-[13px] font-bold text-blue-800 dark:text-blue-200">{holiday.name}</p>
          <p className="text-[11px] text-blue-600/70 dark:text-blue-400/70 mt-0.5">{holiday.date}</p>
        </div>

        <button onClick={next}
          className="w-8 h-8 rounded-xl flex items-center justify-center border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors flex-shrink-0">
          <ChevronRight className="w-4 h-4 text-slate-500 dark:text-slate-400" />
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-1.5 mt-3">
        {HOLIDAYS.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${i === idx ? 'bg-blue-500 w-3' : 'bg-slate-300 dark:bg-slate-600'}`}
          />
        ))}
      </div>

      {/* Quick list */}
      <div className="mt-3 space-y-1">
        {HOLIDAYS.map((h, i) => (
          <div key={i}
            onClick={() => setIdx(i)}
            className={`flex items-center justify-between px-3 py-1.5 rounded-lg cursor-pointer transition-colors text-[12px] ${i === idx ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}>
            <span className={`font-semibold ${i === idx ? 'text-blue-700 dark:text-blue-300' : 'text-slate-600 dark:text-slate-400'}`}>{h.name}</span>
            <span className="text-slate-400 dark:text-slate-500">{h.date.split(',')[0]}</span>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ─── CUSTOM CHART TOOLTIP ──────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-lg px-3 py-2 text-[12px]">
      <p className="font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-2" style={{ color: p.color }}>
          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: p.color }} />
          <span className="text-slate-500 dark:text-slate-400">{p.name}:</span>
          <span className="font-bold tabular-nums">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

// ─── DATE WISE ATTENDANCE CHART ─────────────────────────────────────────────────
function DateWiseChart() {
  const [range, setRange] = useState('Last 14 Days')

  const sliced = useMemo(() => {
    const n = range === 'Last 7 Days' ? 7 : range === 'Last 10 Days' ? 10 : 14
    return DATE_WISE_DATA.slice(-n)
  }, [range])

  return (
    <Panel
      title="Student's Attendance Analysis"
      subtitle="Date wise"
      icon={Activity}
      action={
        <div className="w-36 flex-shrink-0">
          <NativeSelect value={range} onChange={e => setRange(e.target.value)}>
            {DAY_RANGES.map(d => <option key={d} value={d}>{d}</option>)}
          </NativeSelect>
        </div>
      }
    >
      {/* Summary pills */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {[
          { label: 'Avg Present', val: Math.round(sliced.reduce((s, r) => s + r.present, 0) / sliced.length), color: 'emerald' },
          { label: 'Avg Absent', val: Math.round(sliced.reduce((s, r) => s + r.absent, 0) / sliced.length), color: 'rose' },
          { label: 'Best Day', val: Math.max(...sliced.map(r => r.present)), color: 'blue' },
        ].map(({ label, val, color }) => (
          <div key={label} className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold
            ${color === 'emerald' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
            ${color === 'rose' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : ''}
            ${color === 'blue' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : ''}`}>
            {label}: <span className="font-bold tabular-nums">{val}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={sliced} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgb(148,163,184)' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'rgb(148,163,184)' }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Line type="monotone" dataKey="present" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Present" />
          <Line type="monotone" dataKey="absent" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Absent" />
        </LineChart>
      </ResponsiveContainer>
    </Panel>
  )
}

// ─── CLASS WISE CHART ──────────────────────────────────────────────────────────
function ClassWiseChart() {
  const total = CLASS_WISE_DATA.reduce((s, r) => s + r.present + r.absent, 0)
  const totalPresent = CLASS_WISE_DATA.reduce((s, r) => s + r.present, 0)
  return (
    <Panel title="Class Wise Attendance Head Count" icon={BarChart3}>
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        <div className="px-3 py-1.5 rounded-xl text-[12px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          Overall: <span className="font-bold">{pct(totalPresent, total)}%</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Present
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block ml-2" /> Absent
        </div>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={CLASS_WISE_DATA} margin={{ top: 0, right: 4, left: -28, bottom: 0 }} barSize={10}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
          <XAxis dataKey="class" tick={{ fontSize: 9, fill: 'rgb(148,163,184)' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'rgb(148,163,184)' }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="present" name="Present" fill="#3b82f6" radius={[3, 3, 0, 0]} />
          <Bar dataKey="absent" name="Absent" fill="#fb7185" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

// ─── SECTION WISE CHART ────────────────────────────────────────────────────────
function SectionWiseChart() {
  const [selClass, setSelClass] = useState(SECTION_CLASSES[0])
  const data = SECTION_WISE_DATA[selClass] || []

  return (
    <Panel
      title="Section Wise Attendance Head Count"
      icon={Layers}
      action={
        <div className="w-36 flex-shrink-0">
          <NativeSelect value={selClass} onChange={e => setSelClass(e.target.value)}>
            {SECTION_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </NativeSelect>
        </div>
      }
    >
      {/* Section summary pills */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {data.map(s => (
          <div key={s.section} className="flex flex-col items-center px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{s.section}</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">{s.present} P</span>
            <span className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold">{s.absent} A</span>
          </div>
        ))}
        <div className="flex flex-col items-center px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
          <span className="text-[11px] font-bold text-blue-700 dark:text-blue-300">Total</span>
          <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">{data.reduce((s, r) => s + r.present, 0)} P</span>
          <span className="text-[10px] text-rose-500 dark:text-rose-400 font-semibold">{data.reduce((s, r) => s + r.absent, 0)} A</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 0, right: 4, left: -20, bottom: 0 }} barSize={24}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
          <XAxis dataKey="section" tick={{ fontSize: 11, fill: 'rgb(148,163,184)' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'rgb(148,163,184)' }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Bar dataKey="present" name="Present" fill="#6366f1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="absent" name="Absent" fill="#fb7185" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  )
}

// ─── MONTHLY ATTENDANCE CHART ──────────────────────────────────────────────────
function MonthlyChart() {
  const [selClass, setSelClass] = useState(MONTHLY_CLASSES[0])
  const data = MONTHLY_DATA_BY_CLASS[selClass] || []

  return (
    <Panel
      title="Attendance"
      subtitle="Monthly"
      icon={Calendar}
      action={
        <div className="w-36 flex-shrink-0">
          <NativeSelect value={selClass} onChange={e => setSelClass(e.target.value)}>
            {MONTHLY_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </NativeSelect>
        </div>
      }
    >
      {/* Monthly trend pills */}
      <div className="flex gap-2 mb-3 flex-wrap">
        {[
          { label: 'Best Month', val: data.reduce((b, r) => r.present > b.present ? r : b, data[0] || {})?.month || '—', color: 'emerald' },
          { label: 'Avg Present', val: Math.round(data.reduce((s, r) => s + r.present, 0) / (data.length || 1)), color: 'blue' },
          { label: 'Avg Absent', val: Math.round(data.reduce((s, r) => s + r.absent, 0) / (data.length || 1)), color: 'rose' },
        ].map(({ label, val, color }) => (
          <div key={label} className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold
            ${color === 'emerald' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
            ${color === 'rose' ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' : ''}
            ${color === 'blue' ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400' : ''}`}>
            {label}: <span className="font-bold">{val}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPresent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorAbsent" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#fb7185" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#fb7185" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
          <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'rgb(148,163,184)' }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'rgb(148,163,184)' }} tickLine={false} axisLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
          <Area type="monotone" dataKey="present" stroke="#6366f1" strokeWidth={2.5} fill="url(#colorPresent)" name="Present" dot={{ r: 3 }} />
          <Area type="monotone" dataKey="absent" stroke="#fb7185" strokeWidth={2.5} fill="url(#colorAbsent)" name="Absent" dot={{ r: 3 }} />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  )
}

// ─── QUICK STATS ROW ───────────────────────────────────────────────────────────
function QuickStatsRow() {
  const boysAtt  = pct(ATTENDANCE_COMPARISON.boys.today,  STUDENT_STATS.male.total)
  const girlsAtt = pct(ATTENDANCE_COMPARISON.girls.today, STUDENT_STATS.female.total)
  const overallAtt = pct(STUDENT_STATS.totalPresent, STUDENT_STATS.total)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard icon={Users}      label="Total Students"       value={STUDENT_STATS.total}         color="blue"    />
      <StatCard icon={UserCheck}  label="Present Today"        value={STUDENT_STATS.totalPresent}   color="emerald" trend={+3} />
      <StatCard icon={UserX}      label="Absent Today"         value={STUDENT_STATS.totalAbsent}    color="rose"    trend={-3} />
      <StatCard icon={TrendingUp} label="Attendance Rate"      value={overallAtt} sub="%" color="violet" />
    </div>
  )
}

// ─── MOBILE TAB BAR ────────────────────────────────────────────────────────────
function MobileTabBar({ activeTab, setActiveTab }) {
  return (
    <div className="flex sm:hidden gap-1 bg-slate-100 dark:bg-slate-800/60 rounded-2xl p-1.5 overflow-x-auto scrollbar-none">
      {MOBILE_TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setActiveTab(id)}
          className={`flex-1 min-w-[70px] flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all
            ${activeTab === id
              ? 'bg-white dark:bg-[#1a1f35] text-blue-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
        >
          <Icon className="w-4 h-4" />
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function AdminDashboardAttendance() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Attendance Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Live overview — student strength, authentication &amp; analysis
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400">Live</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold
            bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Quick Stats ─────────────────────────────────────────────────────── */}
      <QuickStatsRow />

      {/* ── Mobile Tab Bar ──────────────────────────────────────────────────── */}
      <MobileTabBar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* ── DESKTOP: All panels visible. MOBILE: Tab-driven ─────────────────── */}

      {/* OVERVIEW TAB / DESKTOP-ALWAYS-VISIBLE top row */}
      <div className={`${activeTab !== 'overview' ? 'hidden sm:grid' : 'grid'} grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4`}>
        <StrengthCard />
        <AuthStatsCard />
        <AvgAttendanceCard />
        <HolidaysCard />
      </div>

      {/* DATE-WISE TAB / DESKTOP-ALWAYS-VISIBLE */}
      <div className={`${activeTab !== 'datewise' ? 'hidden sm:block' : 'block'}`}>
        <DateWiseChart />
      </div>

      {/* CLASS + SECTION ROW */}
      <div className={`${activeTab !== 'classwise' ? 'hidden sm:grid' : 'grid'} grid-cols-1 lg:grid-cols-2 gap-4`}>
        <ClassWiseChart />
        <SectionWiseChart />
      </div>

      {/* MONTHLY TAB / DESKTOP-ALWAYS-VISIBLE */}
      <div className={`${activeTab !== 'monthly' ? 'hidden sm:block' : 'block'}`}>
        <MonthlyChart />
      </div>

      {/* ── Info footer ──────────────────────────────────────────────────────── */}
      <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-100 dark:border-[rgba(99,102,241,0.15)] bg-blue-50/40 dark:bg-blue-500/[0.03]">
        <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        <p className="text-[11px] text-blue-700 dark:text-blue-400">
          Data shown is for today's session. Biometric terminal syncs every 15 minutes. Section-wise chart filters by class. Monthly chart shows last 6 months.
        </p>
      </div>
    </div>
  )
}
