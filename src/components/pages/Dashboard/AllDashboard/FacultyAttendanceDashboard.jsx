/**
 * FacultyAttendanceDashboard.jsx
 * Folder: src/pages/Dashboard/FacultyAttendanceDashboard.jsx
 *
 * Converts legacy ASPX "AdminDashBoard_FacultyAttendance.aspx" to
 * fully-responsive React + Tailwind.
 *
 * Sections:
 *  1. Staff Statistics (Teaching / Total, Male / Female)
 *  2. Attendance Authentication Statistics (Biometric / Manual)
 *  3. Today vs Yesterday Attendance Comparison
 *  4. This Month's Holidays (carousel → swipeable cards on mobile)
 *  5. Staff Attendance Analysis – Shift-wise (bar chart via recharts)
 *  6. Staff Attendance Analysis – Department-wise (bar chart via recharts)
 *  7. Department-wise Head Count (donut chart via recharts)
 *  8. Monthly Attendance Trend (grouped column chart via recharts)
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Users, UserCheck, UserX, UserPlus,
  Fingerprint, ClipboardList, Calendar,
  ChevronLeft, ChevronRight, TrendingUp,
  BarChart3, PieChart, Activity,
  Sun, Clock, Moon, Building2,
  RefreshCw, AlertCircle, Info,
  ArrowUpRight, ArrowDownRight,
  BadgeCheck, ShieldAlert, Timer,
  LogOut, Coffee, Layers,
  GraduationCap, BookOpen, Users2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Cell, PieChart as RPieChart, Pie,
  LineChart, Line
} from 'recharts'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const STAFF_STATS = {
  total: 160, teaching: 140,
  male:  { teaching: 95, total: 115 },
  female:{ teaching: 45, total: 45  },
}

const AUTH_STATS = {
  date: 'Today, 04 Jun 2026',
  biometric: { count: 98, pct: 70 },
  manual:    { count: 42, pct: 30 },
}

const ATTENDANCE_COMPARE = {
  today:     { date: '04-Jun-2026', present: 116, absent: 24 },
  yesterday: { date: '03-Jun-2026', present: 122, absent: 18 },
}

const HOLIDAYS = [
  { date: '15-Jun-2026', day: 'Monday',    name: "Eid ul-Adha (Bakrid)"   },
  { date: '17-Jun-2026', day: 'Wednesday', name: "Half-year Holiday"       },
  { date: '29-Jun-2026', day: 'Sunday',    name: "Foundation Day"          },
  { date: '30-Jun-2026', day: 'Monday',    name: "Summer Break Begins"     },
]

// Shift-wise data
const SHIFT_DATA = [
  { shift: 'Morning',   Total: 80, Present: 68, Late: 8,  Absent: 7,  Leave: 5, EarlyExit: 3 },
  { shift: 'Afternoon', Total: 50, Present: 42, Late: 5,  Absent: 5,  Leave: 3, EarlyExit: 8 },
  { shift: 'Evening',   Total: 30, Present: 22, Late: 3,  Absent: 4,  Leave: 2, EarlyExit: 6 },
]

const SHIFT_SUMMARY = {
  total: 160, present: 132, late: 16, absent: 16, leave: 10, earlyExit: 17,
}

// Department-wise data
const DEPT_RANGE = {
  today:   [
    { dept: 'Teaching',    Total: 80, Present: 68, Late: 6, Absent: 6, Leave: 4, EarlyExit: 5 },
    { dept: 'Accounts',    Total: 20, Present: 17, Late: 2, Absent: 2, Leave: 1, EarlyExit: 2 },
    { dept: 'Front Office',Total: 15, Present: 12, Late: 3, Absent: 2, Leave: 1, EarlyExit: 3 },
    { dept: 'Admin',       Total: 15, Present: 12, Late: 2, Absent: 1, Leave: 2, EarlyExit: 2 },
    { dept: 'Transport',   Total: 18, Present: 15, Late: 2, Absent: 2, Leave: 1, EarlyExit: 3 },
    { dept: 'Support',     Total: 12, Present: 10, Late: 1, Absent: 2, Leave: 1, EarlyExit: 2 },
  ],
  last7:   [
    { dept: 'Teaching',    Total: 80, Present: 72, Late: 4, Absent: 4, Leave: 3, EarlyExit: 3 },
    { dept: 'Accounts',    Total: 20, Present: 18, Late: 1, Absent: 1, Leave: 1, EarlyExit: 1 },
    { dept: 'Front Office',Total: 15, Present: 13, Late: 1, Absent: 1, Leave: 1, EarlyExit: 1 },
    { dept: 'Admin',       Total: 15, Present: 13, Late: 1, Absent: 1, Leave: 1, EarlyExit: 1 },
    { dept: 'Transport',   Total: 18, Present: 16, Late: 1, Absent: 1, Leave: 1, EarlyExit: 1 },
    { dept: 'Support',     Total: 12, Present: 11, Late: 1, Absent: 0, Leave: 1, EarlyExit: 0 },
  ],
  last30:  [
    { dept: 'Teaching',    Total: 80, Present: 74, Late: 3, Absent: 3, Leave: 2, EarlyExit: 2 },
    { dept: 'Accounts',    Total: 20, Present: 19, Late: 1, Absent: 0, Leave: 1, EarlyExit: 0 },
    { dept: 'Front Office',Total: 15, Present: 14, Late: 1, Absent: 0, Leave: 1, EarlyExit: 0 },
    { dept: 'Admin',       Total: 15, Present: 14, Late: 0, Absent: 1, Leave: 0, EarlyExit: 1 },
    { dept: 'Transport',   Total: 18, Present: 17, Late: 1, Absent: 0, Leave: 1, EarlyExit: 0 },
    { dept: 'Support',     Total: 12, Present: 12, Late: 0, Absent: 0, Leave: 0, EarlyExit: 0 },
  ],
}

const DEPT_SUMMARY = {
  today:  { date: '04-Jun-2026', total: 160, present: 132, late: 16, absent: 13, leave: 10, earlyExit: 17 },
  last7:  { date: 'Last 7 Days', total: 160, present: 143, late: 9,  absent: 8,  leave: 8,  earlyExit: 7  },
  last30: { date: 'Last 30 Days',total: 160, present: 150, late: 6,  absent: 4,  leave: 5,  earlyExit: 3  },
}

// Department head-count (donut)
const DEPT_HEADCOUNT = [
  { name: 'Teaching',    value: 80,  color: '#3b82f6' },
  { name: 'Accounts',    value: 20,  color: '#8b5cf6' },
  { name: 'Front Office',value: 15,  color: '#06b6d4' },
  { name: 'Admin',       value: 15,  color: '#f59e0b' },
  { name: 'Transport',   value: 18,  color: '#10b981' },
  { name: 'Support',     value: 12,  color: '#ef4444' },
]

// Monthly attendance trend (this month, day 1-10 shown)
const MONTHLY_TREND = Array.from({ length: 10 }, (_, i) => ({
  day: `${i + 1}`,
  Present: [120, 115, 122, 118, 130, 125, 112, 128, 116, 132][i],
  Absent:  [40, 45, 38, 42, 30, 35, 48, 32, 44, 28][i],
  Leave:   [10, 12, 8, 14, 9, 11, 13, 8, 12, 10][i],
  Late:    [18, 15, 20, 16, 12, 14, 22, 18, 16, 14][i],
  Holiday: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0][i],
  WeekOff: [0, 0, 0, 0, 0, 0, 8, 0, 0, 0][i],
}))

const CHART_COLORS = {
  Total:    '#64748b',
  Present:  '#10b981',
  Late:     '#f59e0b',
  Absent:   '#ef4444',
  Leave:    '#8b5cf6',
  EarlyExit:'#06b6d4',
  WeekOff:  '#0369a1',
  Holiday:  '#d97706',
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const pct = (part, total) => (total ? Math.round((part / total) * 100) : 0)

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Animated progress bar */
function ProgressBar({ value, max, colorClass = 'bg-blue-500' }) {
  const w = pct(value, max)
  return (
    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden w-full">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${w}%` }}
      />
    </div>
  )
}

/** Segment pill button (today / last 7 / last 30) */
function SegmentBtn({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all whitespace-nowrap
        ${active
          ? 'bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
        }`}
    >
      {label}
    </button>
  )
}

/** Card shell (glass-style) */
function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
      bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

/** Card header stripe */
function CardHeader({ icon: Icon, title, subtitle, actions }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100
      dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] flex-wrap gap-y-2">
      <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
      {Icon && <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
      <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1 min-w-0 truncate">{title}</span>
      {subtitle && (
        <span className="text-[12px] text-slate-400 dark:text-slate-500 flex-shrink-0">{subtitle}</span>
      )}
      {actions && <div className="flex items-center gap-2 ml-auto">{actions}</div>}
    </div>
  )
}

/** Stat mini-row inside the statistics cards */
function StatRow({ icon: Icon, label, countA, countB, barPct, barColor }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] last:border-0">
      <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4.5 h-4.5 text-slate-500 dark:text-slate-400" style={{ width: 18, height: 18 }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{label}</span>
          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums ml-2 flex-shrink-0">
            {countA}
            {countB !== undefined && (
              <span className="text-slate-400 dark:text-slate-500 font-normal text-[12px]">/{countB}</span>
            )}
          </span>
        </div>
        <ProgressBar value={barPct} max={100} colorClass={barColor} />
      </div>
    </div>
  )
}

// ─── SECTION 1: STAFF STATISTICS ─────────────────────────────────────────────
function StaffStatisticsCard() {
  const s = STAFF_STATS
  const maleTeachPct = pct(s.male.teaching, s.male.total)
  const femTeachPct  = pct(s.female.teaching, s.female.total)

  return (
    <Card>
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
              Staff Statistics
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">(Teaching / Total)</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[28px] font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-none">
              {s.teaching}
              <span className="text-[16px] font-semibold text-slate-400 dark:text-slate-500">/{s.total}</span>
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{pct(s.teaching, s.total)}% teaching</p>
          </div>
        </div>
        {/* overall bar */}
        <div className="mt-3">
          <ProgressBar value={s.teaching} max={s.total} colorClass="bg-blue-500" />
        </div>
      </div>

      <div className="px-5 pb-4 pt-2 space-y-0">
        <StatRow
          icon={Users}
          label="Male Staff"
          countA={s.male.teaching}
          countB={s.male.total}
          barPct={maleTeachPct}
          barColor="bg-blue-500"
        />
        <StatRow
          icon={Users2}
          label="Female Staff"
          countA={s.female.teaching}
          countB={s.female.total}
          barPct={femTeachPct}
          barColor="bg-pink-500"
        />
      </div>
    </Card>
  )
}

// ─── SECTION 2: AUTHENTICATION STATISTICS ────────────────────────────────────
function AuthStatisticsCard() {
  const a = AUTH_STATS
  return (
    <Card>
      <div className="px-5 pt-4 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
          Attendance Authentication
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{a.date}</p>
      </div>
      <div className="px-5 pb-4 pt-2 space-y-0">
        <StatRow
          icon={Fingerprint}
          label="Biometric"
          countA={a.biometric.count}
          barPct={a.biometric.pct}
          barColor="bg-amber-500"
        />
        <StatRow
          icon={ClipboardList}
          label="Manually"
          countA={a.manual.count}
          barPct={a.manual.pct}
          barColor="bg-emerald-500"
        />
      </div>
      {/* donut visual */}
      <div className="px-5 pb-4">
        <div className="relative h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-amber-500 rounded-l-full transition-all duration-700"
            style={{ width: `${a.biometric.pct}%` }}
          />
          <div
            className="absolute inset-y-0 bg-emerald-500 rounded-r-full transition-all duration-700"
            style={{ left: `${a.biometric.pct}%`, right: 0 }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">Bio {a.biometric.pct}%</span>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Manual {a.manual.pct}%</span>
        </div>
      </div>
    </Card>
  )
}

// ─── SECTION 3: TODAY vs YESTERDAY ───────────────────────────────────────────
function AttendanceCompareCard() {
  const { today, yesterday } = ATTENDANCE_COMPARE
  const presentChange = today.present - yesterday.present
  const absentChange  = today.absent  - yesterday.absent

  return (
    <Card>
      <div className="px-5 pt-4 pb-2">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
          Attendance Comparison
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">(vs Last Working Day)</p>
      </div>

      {/* Header row */}
      <div className="grid grid-cols-3 gap-0 px-5 pb-2">
        <div />
        {[today, yesterday].map((d, i) => (
          <div key={i} className="text-center">
            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              {i === 0 ? 'Today' : 'Yesterday'}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{d.date}</p>
          </div>
        ))}
      </div>

      {/* Present row */}
      <div className="grid grid-cols-3 items-center px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Present</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-[20px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{today.present}</span>
            {presentChange !== 0 && (
              <span className={`text-[10px] font-bold flex items-center ${presentChange > 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {presentChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(presentChange)}
              </span>
            )}
          </div>
        </div>
        <div className="text-center">
          <span className="text-[20px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">{yesterday.present}</span>
        </div>
      </div>

      {/* Absent row */}
      <div className="grid grid-cols-3 items-center px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center flex-shrink-0">
            <UserX className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Absent</span>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-[20px] font-bold text-rose-700 dark:text-rose-400 tabular-nums">{today.absent}</span>
            {absentChange !== 0 && (
              <span className={`text-[10px] font-bold flex items-center ${absentChange < 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {absentChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(absentChange)}
              </span>
            )}
          </div>
        </div>
        <div className="text-center">
          <span className="text-[20px] font-bold text-slate-400 dark:text-slate-500 tabular-nums">{yesterday.absent}</span>
        </div>
      </div>

      {/* Present % bar */}
      <div className="px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
        <div className="flex justify-between text-[10px] font-semibold mb-1">
          <span className="text-emerald-600 dark:text-emerald-400">Present {pct(today.present, today.present + today.absent)}%</span>
          <span className="text-rose-600 dark:text-rose-400">Absent {pct(today.absent, today.present + today.absent)}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-rose-200 dark:bg-rose-500/20 overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-700"
            style={{ width: `${pct(today.present, today.present + today.absent)}%` }}
          />
        </div>
      </div>
    </Card>
  )
}

// ─── SECTION 4: HOLIDAY LIST ──────────────────────────────────────────────────
function HolidayCard() {
  const [idx, setIdx] = useState(0)
  const prev = () => setIdx(i => (i - 1 + HOLIDAYS.length) % HOLIDAYS.length)
  const next = () => setIdx(i => (i + 1) % HOLIDAYS.length)
  const h = HOLIDAYS[idx]

  return (
    <Card>
      <div className="px-5 pt-4 pb-2 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-0.5">
            This Month's Holidays
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{HOLIDAYS.length} holidays this month</p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={prev}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-500" />
          </button>
          <button type="button" onClick={next}
            className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Holiday item */}
      <div className="px-5 pb-4 pt-1">
        <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-4">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug">{h.name}</p>
              <p className="text-[12px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">{h.date}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{h.day}</p>
            </div>
          </div>
        </div>

        {/* Dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {HOLIDAYS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === idx ? 'bg-amber-500 w-5' : 'bg-slate-300 dark:bg-slate-700 w-1.5'}`}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

// ─── CUSTOM CHART TOOLTIP ─────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] shadow-xl p-3 min-w-[140px]">
      <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200 mb-2 border-b border-slate-100 dark:border-slate-700 pb-1.5">{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center justify-between gap-3 py-0.5">
          <span className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: p.color }} />
            {p.name}
          </span>
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

// ─── SUMMARY ROW COMPONENT ────────────────────────────────────────────────────
function SummaryRow({ summary }) {
  const items = [
    { label: 'Total',      value: summary.total,    color: 'text-slate-700 dark:text-slate-300',   bg: 'bg-slate-100 dark:bg-slate-800' },
    { label: 'Present',    value: summary.present,  color: 'text-emerald-700 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { label: 'Late',       value: summary.late,     color: 'text-amber-700 dark:text-amber-400',   bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { label: 'Absent',     value: summary.absent,   color: 'text-rose-700 dark:text-rose-400',     bg: 'bg-rose-50 dark:bg-rose-500/10' },
    { label: 'On Leave',   value: summary.leave,    color: 'text-violet-700 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { label: 'Early Exit', value: summary.earlyExit,color: 'text-cyan-700 dark:text-cyan-400',     bg: 'bg-cyan-50 dark:bg-cyan-500/10' },
  ]
  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
      {items.map(({ label, value, color, bg }) => (
        <div key={label} className={`rounded-xl ${bg} p-3 text-center`}>
          <p className={`text-[20px] font-bold tabular-nums leading-tight ${color}`}>{value}</p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        </div>
      ))}
    </div>
  )
}

// ─── SECTION 5: SHIFT-WISE CHART ─────────────────────────────────────────────
function ShiftAnalysisCard() {
  const keys = ['Total', 'Present', 'Late', 'Absent', 'Leave', 'EarlyExit']
  return (
    <Card>
      <CardHeader icon={Clock} title="Staff Attendance Analysis" subtitle="Shift Wise" />

      <div className="p-5">
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={SHIFT_DATA} margin={{ top: 4, right: 0, left: -20, bottom: 0 }} barGap={2} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis dataKey="shift" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {keys.map(k => (
              <Bar key={k} dataKey={k} name={k === 'EarlyExit' ? 'Early Exit' : k}
                fill={CHART_COLORS[k]} radius={[3, 3, 0, 0]} maxBarSize={20} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SummaryRow summary={SHIFT_SUMMARY} />
    </Card>
  )
}

// ─── SECTION 6: DEPARTMENT-WISE CHART ────────────────────────────────────────
function DeptAnalysisCard() {
  const [range, setRange] = useState('today')
  const data    = DEPT_RANGE[range]
  const summary = DEPT_SUMMARY[range]
  const keys    = ['Total', 'Present', 'Late', 'Absent', 'Leave', 'EarlyExit']

  return (
    <Card>
      <CardHeader
        icon={Building2}
        title="Staff Attendance Analysis"
        subtitle="Department Wise"
        actions={
          <div className="flex items-center gap-1.5">
            {[['today', "Today"], ['last7', "Last 7D"], ['last30', "Last 30D"]].map(([v, l]) => (
              <SegmentBtn key={v} label={l} active={range === v} onClick={() => setRange(v)} />
            ))}
          </div>
        }
      />

      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 0, left: -20, bottom: 0 }} barGap={2} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis dataKey="dept" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {keys.map(k => (
              <Bar key={k} dataKey={k} name={k === 'EarlyExit' ? 'Early Exit' : k}
                fill={CHART_COLORS[k]} radius={[3, 3, 0, 0]} maxBarSize={14} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <SummaryRow summary={summary} />
    </Card>
  )
}

// ─── SECTION 7: DEPT HEAD COUNT DONUT ────────────────────────────────────────
const RADIAN = Math.PI / 180
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null
  const r = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + r * Math.cos(-midAngle * RADIAN)
  const y = cy + r * Math.sin(-midAngle * RADIAN)
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

function DeptHeadCountCard() {
  const total = DEPT_HEADCOUNT.reduce((s, d) => s + d.value, 0)
  return (
    <Card>
      <CardHeader icon={PieChart} title="Department Wise Head Count" />
      <div className="p-5">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* Donut */}
          <div className="w-48 h-48 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RPieChart>
                <Pie
                  data={DEPT_HEADCOUNT}
                  cx="50%" cy="50%"
                  innerRadius={52} outerRadius={90}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {DEPT_HEADCOUNT.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <Tooltip
                  formatter={(v, n) => [v, n]}
                  contentStyle={{
                    borderRadius: 12, fontSize: 12,
                    background: 'var(--tooltip-bg, #fff)',
                    border: '1px solid rgba(148,163,184,0.2)',
                  }}
                />
              </RPieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 grid grid-cols-2 gap-2 w-full">
            {DEPT_HEADCOUNT.map(d => (
              <div key={d.name} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03]">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 truncate">{d.name}</p>
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">
                    {d.value}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">{pct(d.value, total)}%</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total badge */}
        <div className="mt-4 flex justify-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">
              Total Staff: {total}
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}

// ─── SECTION 8: MONTHLY TREND ─────────────────────────────────────────────────
function MonthlyTrendCard() {
  const keys = ['Present', 'Absent', 'Leave', 'Late', 'WeekOff']
  return (
    <Card>
      <CardHeader icon={Activity} title="Attendance For This Month" subtitle="Day-wise Trend" />
      <div className="p-5">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={MONTHLY_TREND} margin={{ top: 4, right: 0, left: -20, bottom: 0 }} barGap={1} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            {keys.map(k => (
              <Bar key={k} dataKey={k} fill={CHART_COLORS[k]} radius={[3, 3, 0, 0]} maxBarSize={16} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}

// ─── TOP SUMMARY QUICK STATS ──────────────────────────────────────────────────
function QuickStatPill({ icon: Icon, label, value, color }) {
  const colorMap = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
      bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── MOBILE BOTTOM NAV TABS (for mobile section switching) ────────────────────
const MOBILE_SECTIONS = [
  { id: 'overview',  label: 'Overview',    icon: BarChart3  },
  { id: 'shift',     label: 'Shift',       icon: Clock      },
  { id: 'dept',      label: 'Department',  icon: Building2  },
  { id: 'trend',     label: 'Trend',       icon: TrendingUp },
]

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FacultyAttendanceDashboard() {
  const [mobileTab, setMobileTab] = useState('overview')
  const today = ATTENDANCE_COMPARE.today

  return (
    <div className="space-y-4 pb-28 sm:pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Faculty Attendance Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time staff attendance overview — shift, department &amp; monthly trends.
          </p>
        </div>
        <button type="button"
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
            bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400
            dark:hover:bg-slate-700 transition-colors flex-shrink-0">
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* ── Quick Stats Row ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <QuickStatPill icon={Users}      label="Total Staff"   value={SHIFT_SUMMARY.total}     color="blue"    />
        <QuickStatPill icon={UserCheck}  label="Present"       value={SHIFT_SUMMARY.present}   color="emerald" />
        <QuickStatPill icon={UserX}      label="Absent"        value={SHIFT_SUMMARY.absent}    color="rose"    />
        <QuickStatPill icon={Timer}      label="Late"          value={SHIFT_SUMMARY.late}      color="amber"   />
        <QuickStatPill icon={BookOpen}   label="On Leave"      value={SHIFT_SUMMARY.leave}     color="violet"  />
        <QuickStatPill icon={LogOut}     label="Early Exit"    value={SHIFT_SUMMARY.earlyExit} color="cyan"    />
      </div>

      {/* ══════════ DESKTOP LAYOUT ══════════════════════════════════════════ */}
      <div className="hidden sm:block space-y-4">

        {/* Row 1 — 4 info cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StaffStatisticsCard />
          <AuthStatisticsCard />
          <AttendanceCompareCard />
          <HolidayCard />
        </div>

        {/* Row 2 — Shift Analysis (full width) */}
        <ShiftAnalysisCard />

        {/* Row 3 — Dept Analysis (full width) */}
        <DeptAnalysisCard />

        {/* Row 4 — Donut + Monthly Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2"><DeptHeadCountCard /></div>
          <div className="lg:col-span-3"><MonthlyTrendCard /></div>
        </div>

      </div>

      {/* ══════════ MOBILE LAYOUT ══════════════════════════════════════════ */}
      <div className="sm:hidden space-y-4">

        {/* Section: Overview */}
        {mobileTab === 'overview' && (
          <div className="space-y-4">
            <StaffStatisticsCard />
            <AuthStatisticsCard />
            <AttendanceCompareCard />
            <HolidayCard />
            <DeptHeadCountCard />
          </div>
        )}

        {/* Section: Shift */}
        {mobileTab === 'shift' && (
          <div className="space-y-4">
            <ShiftAnalysisCard />
          </div>
        )}

        {/* Section: Department */}
        {mobileTab === 'dept' && (
          <div className="space-y-4">
            <DeptAnalysisCard />
          </div>
        )}

        {/* Section: Trend */}
        {mobileTab === 'trend' && (
          <div className="space-y-4">
            <MonthlyTrendCard />
          </div>
        )}
      </div>

      {/* ── Mobile Bottom Tab Bar ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 sm:hidden z-40 bg-white dark:bg-[#1a1f35]
        border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] px-2 pt-2 pb-safe">
        <div className="grid grid-cols-4 gap-1">
          {MOBILE_SECTIONS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMobileTab(id)}
              className={`flex flex-col items-center gap-1 py-2 rounded-xl transition-all text-[10px] font-semibold
                ${mobileTab === id
                  ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          ))}
        </div>
      </div>

    </div>
  )
}
