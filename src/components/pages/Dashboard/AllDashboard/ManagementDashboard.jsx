/**
 * ManagementDashboard.jsx
 * Folder: src/pages/Dashboard/ManagementDashboard.jsx
 *
 * Converts legacy ASPX "ManagementDashboard.aspx" to fully-responsive React + Tailwind.
 *
 * Sections:
 *  1. Fee Revenue Summary + Student Head
 *  2. Today's Paymode Summary
 *  3. Staff Statistics (registered/total, male/female, biometric/manual attendance)
 *  4. Average Attendance (vs yesterday)
 *  5. This Month's Holidays
 *  6. Student Headcounts (gender-wise YTD)
 *  7. New Admissions Statistics (school vs online)
 *  8. New Admissions Ratio (this year vs prev year)
 *  9. Student Statistics (this year vs prev year)
 * 10. Student Strength Standards Wise (bar chart via Recharts)
 * 11. Today's Time Table (after substitution)
 *
 * Features:
 *  - Dark/Light theme via ThemeCtx + makeTokens
 *  - Mobile: collapsible sections, cards, tabs
 *  - Desktop: dense ERP-style dashboard panels
 *  - No horizontal scroll on mobile
 *  - Recharts for bar chart (replaces Highcharts)
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Users, UserPlus, UserCheck, UserX, School2, BookOpen,
  TrendingUp, TrendingDown, Calendar, Clock, CheckCircle2,
  AlertCircle, Wallet, CreditCard, Smartphone, Banknote,
  Building2, GraduationCap, ShieldCheck, Activity,
  ChevronDown, ChevronRight, ChevronLeft, X,
  BarChart3, ArrowUpRight, ArrowDownRight, Minus,
  Fingerprint, ClipboardList, Eye, RefreshCw,
  Sun, Moon, Bell, Search, Menu, SlidersHorizontal,
  BookMarked, Layers, Info, MapPin, Table2
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, Cell
} from 'recharts'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'APS International School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  session: '2025-26',
  today: 'Thursday, 04 Jun 2025',
}

const FEE_SUMMARY = {
  totalCollected:  1842500,
  todayCollection: 84200,
  pending:         312800,
  totalStudents:   3850,
}

const PAYMODE_TODAY = [
  { mode: 'Cash',          icon: Banknote,    amount: 42000, count: 28, color: 'emerald' },
  { mode: 'Online/UPI',    icon: Smartphone,  amount: 28600, count: 19, color: 'blue'    },
  { mode: 'Cheque/DD',     icon: CreditCard,  amount: 9400,  count: 6,  color: 'amber'   },
  { mode: 'Bank Transfer', icon: Building2,   amount: 4200,  count: 3,  color: 'violet'  },
]

const STAFF_STATS = {
  total: 160, registered: 140,
  male: { total: 160, registered: 120 },
  female: { total: 160, registered: 40 },
  biometric: { count: 78, pct: 66 },
  manual:    { count: 38, pct: 34 },
}

const AVG_ATTENDANCE = {
  boys:  { total: '1840 (80%)', yesterday: '1780 (77%)' },
  girls: { total: '1210 (78%)', yesterday: '1180 (76%)' },
}

const HOLIDAYS = [
  { date: '15-Jun-Thu', name: "Idu'l Fitr"         },
  { date: '29-Jun-Sat', name: 'Bakrid'              },
  { date: '17-Jul-Wed', name: 'Muharram'            },
  { date: '15-Aug-Thu', name: 'Independence Day'    },
]

const STUDENT_HEADCOUNTS = {
  total: 3850,
  male:   { count: 2310, pct: 60 },
  female: { count: 1540, pct: 40 },
}

const NEW_ADMISSIONS = {
  total: 290,
  school: { count: 203, pct: 70 },
  online: { count: 87,  pct: 30 },
}

const ADMISSION_RATIO = {
  boys:  { thisYear: 210, prevYear: 185, change: +13.5 },
  girls: { thisYear: 80,  prevYear: 95,  change: -15.8 },
}

const STUDENT_STATS = {
  boys:  { thisYear: 2310, prevYear: 2100, change: +10.0 },
  girls: { thisYear: 1540, prevYear: 1460, change:  +5.4 },
}

const STRENGTH_CHART_DATA = [
  { class: 'Nursery', strength: 76 },
  { class: 'LKG',     strength: 93 },
  { class: 'UKG',     strength: 91 },
  { class: 'Class I', strength: 113 },
  { class: 'Class II',strength: 115 },
  { class: 'Class III',strength: 54 },
  { class: 'Class IV', strength: 49 },
  { class: 'Class V',  strength: 54 },
  { class: 'Class VI', strength: 125 },
  { class: 'Class VII',strength: 61 },
  { class: 'Class VIII',strength: 52 },
  { class: 'Class IX', strength: 108 },
  { class: 'Class X',  strength: 55 },
  { class: 'Class XI', strength: 120 },
  { class: 'Class XII',strength: 116 },
]

const TIMETABLE_DATA = {
  classes: ['Class I-A', 'Class II-A', 'Class VI-A', 'Class IX-A', 'Class XI-A'],
  periods: ['P1\n8:00-8:40', 'P2\n8:40-9:20', 'P3\n9:20-10:00', 'RECESS', 'P4\n10:20-11:00', 'P5\n11:00-11:40', 'P6\n11:40-12:20'],
  data: {
    'Class I-A':    ['English',  'Maths',   'Hindi',   'RECESS', 'EVS',     'Drawing', 'P.T.'],
    'Class II-A':   ['Hindi',    'English', 'Maths',   'RECESS', 'EVS',     'G.K.',    'Music'],
    'Class VI-A':   ['Science',  'Maths',   'English', 'RECESS', 'S.St.',   'Hindi',   'Computer'],
    'Class IX-A':   ['Physics',  'Chemistry','Maths',  'RECESS', 'English', 'Biology', 'Hindi'],
    'Class XI-A':   ['Maths',    'Physics', 'Chemistry','RECESS','English', 'Biology', 'P.E.'],
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) => n?.toLocaleString('en-IN') ?? '—'

const CHART_COLORS = [
  '#3b82f6','#6366f1','#8b5cf6','#0ea5e9','#06b6d4',
  '#10b981','#f59e0b','#f97316','#ef4444','#ec4899',
  '#84cc16','#14b8a6','#a855f7','#f43f5e','#0891b2',
]

const COLOR_MAP = {
  emerald: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-500/20', icon: 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400' },
  blue:    { bg: 'bg-blue-50 dark:bg-blue-500/10',       text: 'text-blue-700 dark:text-blue-400',       border: 'border-blue-100 dark:border-blue-500/20',     icon: 'bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400'       },
  amber:   { bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-400',     border: 'border-amber-100 dark:border-amber-500/20',   icon: 'bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400'   },
  violet:  { bg: 'bg-violet-50 dark:bg-violet-500/10',   text: 'text-violet-700 dark:text-violet-400',   border: 'border-violet-100 dark:border-violet-500/20', icon: 'bg-violet-100 dark:bg-violet-500/15 text-violet-600 dark:text-violet-400'},
  cyan:    { bg: 'bg-cyan-50 dark:bg-cyan-500/10',       text: 'text-cyan-700 dark:text-cyan-400',       border: 'border-cyan-100 dark:border-cyan-500/20',     icon: 'bg-cyan-100 dark:bg-cyan-500/15 text-cyan-600 dark:text-cyan-400'       },
  rose:    { bg: 'bg-rose-50 dark:bg-rose-500/10',       text: 'text-rose-700 dark:text-rose-400',       border: 'border-rose-100 dark:border-rose-500/20',     icon: 'bg-rose-100 dark:bg-rose-500/15 text-rose-600 dark:text-rose-400'       },
}

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────

/** Panel wrapper — consistent card styling */
function Panel({ children, className = '', noPad = false }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden ${noPad ? '' : ''} ${className}`}>
      {children}
    </div>
  )
}

/** Panel header strip */
function PanelHeader({ icon: Icon, title, sub, right, color = 'blue' }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
      <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
      {Icon && <Icon className={`w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400`} />}
      <div className="flex-1 min-w-0">
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
        {sub && <span className="ml-2 text-[11px] text-slate-400 dark:text-slate-500">{sub}</span>}
      </div>
      {right && <div className="flex-shrink-0">{right}</div>}
    </div>
  )
}

/** Stat pill with progress bar */
function StatRow({ icon: Icon, label, value, total, pct, colorClass }) {
  return (
    <div className="flex items-center gap-3 py-2.5">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{label}</span>
          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{value}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#3b82f6,#6366f1)' }}
          />
        </div>
      </div>
    </div>
  )
}

/** Change badge */
function ChangeBadge({ change }) {
  if (change === 0 || change == null) return <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-0.5"><Minus className="w-3 h-3" />0%</span>
  const pos = change > 0
  return (
    <span className={`text-[11px] font-bold flex items-center gap-0.5 ${pos ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
      {pos ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
      {Math.abs(change)}%
    </span>
  )
}

/** Comparison table row (this year vs prev year) */
function CompareRow({ icon: Icon, label, thisYear, prevYear, change, imgColor }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 dark:border-[rgba(99,102,241,0.07)] last:border-0">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${imgColor}`}>
        <Icon className="w-4 h-4" />
      </div>
      <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 flex-1 min-w-0">{label}</span>
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{fmt(thisYear)}</p>
          <ChangeBadge change={change} />
        </div>
        <div className="text-right w-16">
          <p className="text-[12px] text-slate-500 dark:text-slate-400 tabular-nums">{fmt(prevYear)}</p>
          <p className="text-[10px] text-slate-400">prev yr</p>
        </div>
      </div>
    </div>
  )
}

/** Fee KPI card */
function FeeKPI({ icon: Icon, label, value, color, sub }) {
  const c = COLOR_MAP[color]
  return (
    <div className={`rounded-xl border p-3 flex items-center gap-3 ${c.bg} ${c.border}`}>
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className={`text-[19px] font-extrabold tabular-nums leading-tight ${c.text}`}>₹{fmt(value)}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SECTION 1 : FEE REVENUE ──────────────────────────────────────────────────
function FeeRevenueSection() {
  return (
    <Panel>
      <PanelHeader icon={Wallet} title="Fee Revenue Summary" sub={SCHOOL_INFO.session} />
      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <FeeKPI icon={TrendingUp} label="Total Collected"    value={FEE_SUMMARY.totalCollected}  color="emerald" />
        <FeeKPI icon={Wallet}     label="Today's Collection" value={FEE_SUMMARY.todayCollection}  color="blue"    sub="Live" />
        <FeeKPI icon={AlertCircle}label="Outstanding"        value={FEE_SUMMARY.pending}          color="rose"    />
        <div className={`rounded-xl border p-3 flex items-center gap-3 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20`}>
          <span className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400">
            <Users className="w-5 h-5" />
          </span>
          <div>
            <p className="text-[19px] font-extrabold tabular-nums leading-tight text-amber-700 dark:text-amber-400">{fmt(FEE_SUMMARY.totalStudents)}</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Students</p>
          </div>
        </div>
      </div>
    </Panel>
  )
}

// ─── SECTION 2 : PAYMODE SUMMARY ─────────────────────────────────────────────
function PaymodeSummary() {
  const total = PAYMODE_TODAY.reduce((s, p) => s + p.amount, 0)
  return (
    <Panel>
      <PanelHeader icon={CreditCard} title="Today's Paymode Summary" />
      <div className="p-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        {PAYMODE_TODAY.map(({ mode, icon: Icon, amount, count, color }) => {
          const c = COLOR_MAP[color]
          const pct = Math.round((amount / total) * 100)
          return (
            <div key={mode} className={`rounded-xl border p-3.5 ${c.bg} ${c.border}`}>
              <div className="flex items-center justify-between mb-2">
                <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${c.icon}`}>
                  <Icon className="w-4 h-4" />
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/60 dark:bg-white/10 ${c.text}`}>{pct}%</span>
              </div>
              <p className={`text-[18px] font-extrabold tabular-nums leading-tight ${c.text}`}>₹{fmt(amount)}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{mode}</p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">{count} transactions</p>
              <div className="mt-2 h-1 rounded-full bg-white/50 dark:bg-white/10 overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#3b82f6,#6366f1)' }} />
              </div>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}

// ─── SECTION 3 : STAFF STATISTICS ────────────────────────────────────────────
function StaffStatistics() {
  return (
    <Panel>
      <PanelHeader
        icon={UserCheck}
        title="Staff Statistics"
        sub={`${STAFF_STATS.registered}/${STAFF_STATS.total} Registered`}
      />
      <div className="p-4 space-y-1">
        {/* Overall progress */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px] text-slate-500 dark:text-slate-400">Registered / Total</span>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">
            {STAFF_STATS.registered}/{STAFF_STATS.total}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
          <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
            style={{ width: `${Math.round(STAFF_STATS.registered / STAFF_STATS.total * 100)}%` }} />
        </div>
        <StatRow
          icon={Users} label="Male Staff"
          value={`${STAFF_STATS.male.registered}/${STAFF_STATS.male.total}`}
          pct={Math.round(STAFF_STATS.male.registered / STAFF_STATS.male.total * 100)}
          colorClass="bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
        />
        <StatRow
          icon={Users} label="Female Staff"
          value={`${STAFF_STATS.female.registered}/${STAFF_STATS.female.total}`}
          pct={Math.round(STAFF_STATS.female.registered / STAFF_STATS.female.total * 100)}
          colorClass="bg-pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400"
        />
      </div>
    </Panel>
  )
}

// ─── SECTION 3b : ATTENDANCE AUTH ────────────────────────────────────────────
function AttendanceAuth() {
  return (
    <Panel>
      <PanelHeader icon={Fingerprint} title="Attendance Authentication" />
      <div className="p-4 space-y-1">
        <StatRow
          icon={Fingerprint} label="Biometric Terminal"
          value={`${STAFF_STATS.biometric.count} (${STAFF_STATS.biometric.pct}%)`}
          pct={STAFF_STATS.biometric.pct}
          colorClass="bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"
        />
        <div className="h-1 border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)]" />
        <StatRow
          icon={ClipboardList} label="Manually"
          value={`${STAFF_STATS.manual.count} (${STAFF_STATS.manual.pct}%)`}
          pct={STAFF_STATS.manual.pct}
          colorClass="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
      </div>
    </Panel>
  )
}

// ─── SECTION 4 : AVERAGE ATTENDANCE ──────────────────────────────────────────
function AverageAttendance() {
  const rows = [
    { label: 'Boys Present',  icon: Users, thisDay: AVG_ATTENDANCE.boys.total,  yesterday: AVG_ATTENDANCE.boys.yesterday,  color: 'blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400' },
    { label: 'Girls Absent',  icon: Users, thisDay: AVG_ATTENDANCE.girls.total, yesterday: AVG_ATTENDANCE.girls.yesterday, color: 'pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400'  },
  ]
  return (
    <Panel>
      <PanelHeader icon={Activity} title="Avg. Attendance" sub="vs Last Working Day" />
      <div className="p-4">
        <div className="grid grid-cols-3 text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 pb-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <span>Type</span>
          <span className="text-center">Today</span>
          <span className="text-center">Yesterday</span>
        </div>
        {rows.map(({ label, icon: Icon, thisDay, yesterday, color }) => (
          <div key={label} className="grid grid-cols-3 items-center gap-2 py-3 border-b border-slate-50 dark:border-[rgba(99,102,241,0.06)] last:border-0">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 bg-${color}`}>
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 leading-tight">{label}</span>
            </div>
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 text-center tabular-nums">{thisDay}</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 text-center tabular-nums">{yesterday}</p>
          </div>
        ))}
      </div>
    </Panel>
  )
}

// ─── SECTION 5 : HOLIDAYS ────────────────────────────────────────────────────
function HolidaysList() {
  const [idx, setIdx] = useState(0)
  const holiday = HOLIDAYS[idx]
  return (
    <Panel>
      <PanelHeader
        icon={Calendar}
        title="This Month's Holidays"
        right={
          <button className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline">
            <Eye className="w-3.5 h-3.5" /> View All
          </button>
        }
      />
      <div className="p-4">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-500/10 dark:to-indigo-500/10 border border-blue-100 dark:border-blue-500/20 p-4 text-center mb-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-500 dark:text-blue-400 mb-1">{holiday.date}</p>
          <p className="text-[16px] font-extrabold text-slate-800 dark:text-slate-100">{holiday.name}</p>
        </div>
        <div className="flex items-center justify-between">
          <button onClick={() => setIdx(p => Math.max(0, p - 1))} disabled={idx === 0}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
          <div className="flex gap-1.5">
            {HOLIDAYS.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-blue-500 w-4' : 'bg-slate-200 dark:bg-slate-700'}`} />
            ))}
          </div>
          <button onClick={() => setIdx(p => Math.min(HOLIDAYS.length - 1, p + 1))} disabled={idx === HOLIDAYS.length - 1}
            className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center disabled:opacity-30 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </button>
        </div>
        <div className="mt-3 space-y-1.5">
          {HOLIDAYS.map((h, i) => (
            <div key={i} className={`flex items-center gap-2 p-2 rounded-lg transition-colors cursor-pointer ${i === idx ? 'bg-blue-50 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}
              onClick={() => setIdx(i)}>
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 w-28 flex-shrink-0">{h.date}</span>
              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 truncate">{h.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  )
}

// ─── SECTION 6 : STUDENT HEADCOUNTS ──────────────────────────────────────────
function StudentHeadcounts() {
  return (
    <Panel>
      <PanelHeader
        icon={GraduationCap}
        title="Student Headcounts"
        sub="YTD"
        right={<span className="text-[13px] font-extrabold text-blue-700 dark:text-blue-400 tabular-nums">{fmt(STUDENT_HEADCOUNTS.total)}</span>}
      />
      <div className="p-4 space-y-1">
        <StatRow
          icon={Users} label="Male Students"
          value={`${fmt(STUDENT_HEADCOUNTS.male.count)} (${STUDENT_HEADCOUNTS.male.pct}%)`}
          pct={STUDENT_HEADCOUNTS.male.pct}
          colorClass="bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
        />
        <StatRow
          icon={Users} label="Female Students"
          value={`${fmt(STUDENT_HEADCOUNTS.female.count)} (${STUDENT_HEADCOUNTS.female.pct}%)`}
          pct={STUDENT_HEADCOUNTS.female.pct}
          colorClass="bg-pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400"
        />
        {/* Gender donut-like bar */}
        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-[rgba(99,102,241,0.08)]">
          <div className="flex text-[10px] font-bold justify-between mb-1.5">
            <span className="text-blue-600 dark:text-blue-400">Male {STUDENT_HEADCOUNTS.male.pct}%</span>
            <span className="text-pink-500 dark:text-pink-400">Female {STUDENT_HEADCOUNTS.female.pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex">
            <div className="h-full rounded-l-full bg-blue-500 transition-all" style={{ width: `${STUDENT_HEADCOUNTS.male.pct}%` }} />
            <div className="h-full rounded-r-full bg-pink-400 flex-1" />
          </div>
        </div>
      </div>
    </Panel>
  )
}

// ─── SECTION 7 : NEW ADMISSIONS ───────────────────────────────────────────────
function NewAdmissions() {
  return (
    <Panel>
      <PanelHeader
        icon={UserPlus}
        title="New Admissions"
        right={<span className="text-[13px] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">Total: {fmt(NEW_ADMISSIONS.total)}</span>}
      />
      <div className="p-4 space-y-1">
        <StatRow
          icon={School2} label="Reg. at School"
          value={`${NEW_ADMISSIONS.school.count} (${NEW_ADMISSIONS.school.pct}%)`}
          pct={NEW_ADMISSIONS.school.pct}
          colorClass="bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400"
        />
        <StatRow
          icon={Smartphone} label="Online Reg."
          value={`${NEW_ADMISSIONS.online.count} (${NEW_ADMISSIONS.online.pct}%)`}
          pct={NEW_ADMISSIONS.online.pct}
          colorClass="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
        <div className="mt-3 pt-3 border-t border-slate-50 dark:border-[rgba(99,102,241,0.08)]">
          <div className="flex text-[10px] font-bold justify-between mb-1.5">
            <span className="text-amber-600 dark:text-amber-400">School {NEW_ADMISSIONS.school.pct}%</span>
            <span className="text-emerald-600 dark:text-emerald-400">Online {NEW_ADMISSIONS.online.pct}%</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden flex">
            <div className="h-full rounded-l-full bg-amber-400 transition-all" style={{ width: `${NEW_ADMISSIONS.school.pct}%` }} />
            <div className="h-full rounded-r-full bg-emerald-400 flex-1" />
          </div>
        </div>
      </div>
    </Panel>
  )
}

// ─── SECTION 8 : ADMISSION RATIO ─────────────────────────────────────────────
function AdmissionRatio() {
  return (
    <Panel>
      <PanelHeader icon={TrendingUp} title="Admission Ratio" sub="vs Prev Year" />
      <div className="p-4">
        <div className="grid grid-cols-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 pb-2 mb-1 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <span></span>
          <span className="text-center">This Year</span>
          <span className="text-center">Prev Year</span>
        </div>
        <CompareRow
          icon={Users} label="Boys"
          thisYear={ADMISSION_RATIO.boys.thisYear}
          prevYear={ADMISSION_RATIO.boys.prevYear}
          change={ADMISSION_RATIO.boys.change}
          imgColor="bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
        />
        <CompareRow
          icon={Users} label="Girls"
          thisYear={ADMISSION_RATIO.girls.thisYear}
          prevYear={ADMISSION_RATIO.girls.prevYear}
          change={ADMISSION_RATIO.girls.change}
          imgColor="bg-pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400"
        />
      </div>
    </Panel>
  )
}

// ─── SECTION 9 : STUDENT STATS ────────────────────────────────────────────────
function StudentStatistics() {
  return (
    <Panel>
      <PanelHeader icon={BarChart3} title="Student Statistics" sub="vs Prev Year" />
      <div className="p-4">
        <div className="grid grid-cols-3 text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 pb-2 mb-1 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <span></span>
          <span className="text-center">This Year</span>
          <span className="text-center">Prev Year</span>
        </div>
        <CompareRow
          icon={Users} label="Boys"
          thisYear={STUDENT_STATS.boys.thisYear}
          prevYear={STUDENT_STATS.boys.prevYear}
          change={STUDENT_STATS.boys.change}
          imgColor="bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400"
        />
        <CompareRow
          icon={Users} label="Girls"
          thisYear={STUDENT_STATS.girls.thisYear}
          prevYear={STUDENT_STATS.girls.prevYear}
          change={STUDENT_STATS.girls.change}
          imgColor="bg-pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400"
        />
      </div>
    </Panel>
  )
}

// ─── SECTION 10 : STRENGTH CHART ─────────────────────────────────────────────

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] shadow-lg px-3 py-2.5">
        <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200 mb-1">{label}</p>
        <p className="text-[13px] font-extrabold text-blue-600 dark:text-blue-400 tabular-nums">
          {payload[0].value} students
        </p>
      </div>
    )
  }
  return null
}

function StrengthChart() {
  return (
    <Panel>
      <PanelHeader icon={BarChart3} title="Student Strength — Standards Wise" sub={SCHOOL_INFO.session} />
      <div className="p-4">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={STRENGTH_CHART_DATA}
            margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
            barSize={22}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis
              dataKey="class"
              tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              interval={0}
              angle={-35}
              textAnchor="end"
              height={52}
              tickFormatter={v => v.replace('Class ', 'Cls ')}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)' }} />
            <Bar dataKey="strength" radius={[6, 6, 0, 0]}>
              {STRENGTH_CHART_DATA.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  )
}

// ─── SECTION 11 : TIMETABLE ───────────────────────────────────────────────────

const PERIOD_COLORS = {
  'RECESS': 'bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-bold text-[10px] uppercase tracking-wider',
}

const subjectColors = {
  'Maths':     'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300',
  'English':   'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  'Hindi':     'bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-300',
  'Science':   'bg-cyan-50 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  'Physics':   'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300',
  'Chemistry': 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300',
  'Biology':   'bg-teal-50 dark:bg-teal-500/10 text-teal-700 dark:text-teal-300',
  'default':   'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
}

function TimetableDesktop({ selectedClass }) {
  const periods = TIMETABLE_DATA.periods
  const row = TIMETABLE_DATA.data[selectedClass] || []
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[540px]">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-28">Class</th>
            {periods.map((p, i) => (
              <th key={i} className={`px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide whitespace-pre-line ${p === 'RECESS' ? 'text-amber-600 dark:text-amber-400 w-16' : 'text-slate-500 dark:text-slate-400'}`}>
                {p === 'RECESS' ? 'Recess' : p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
            <td className="px-4 py-3">
              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{selectedClass}</span>
            </td>
            {row.map((subj, j) => (
              <td key={j} className="px-2 py-2 text-center">
                {subj === 'RECESS' ? (
                  <span className="inline-block px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">
                    Recess
                  </span>
                ) : (
                  <span className={`inline-block px-2.5 py-1.5 rounded-lg text-[11px] font-semibold ${subjectColors[subj] || subjectColors.default}`}>
                    {subj}
                  </span>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function TimetableMobileCards({ selectedClass }) {
  const periods = TIMETABLE_DATA.periods
  const row = TIMETABLE_DATA.data[selectedClass] || []
  return (
    <div className="grid grid-cols-2 gap-2 p-4">
      {periods.map((p, i) => {
        const subj = row[i]
        if (subj === 'RECESS') return (
          <div key={i} className="col-span-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-4 py-2.5 text-center">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-400">— Recess —</p>
          </div>
        )
        return (
          <div key={i} className={`rounded-xl border p-3 ${subjectColors[subj] || subjectColors.default} border-slate-100 dark:border-[rgba(99,102,241,0.1)]`}>
            <p className="text-[10px] font-bold uppercase tracking-wide opacity-60 mb-0.5">
              {p.replace('RECESS', 'Recess').split('\n')[0]}
            </p>
            <p className="text-[13px] font-extrabold">{subj}</p>
            {p.split('\n')[1] && <p className="text-[10px] opacity-60 mt-0.5">{p.split('\n')[1]}</p>}
          </div>
        )
      })}
    </div>
  )
}

function TimetableSection() {
  const [selectedDate, setSelectedDate] = useState('2025-06-04')
  const [selectedClass, setSelectedClass] = useState(TIMETABLE_DATA.classes[0])

  return (
    <Panel>
      <PanelHeader
        icon={Table2}
        title="Today's Time Table"
        sub="After Substitution"
        right={
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            className="text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 px-2.5 py-1.5 outline-none focus:border-blue-400"
          />
        }
      />

      {/* Class selector */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] scrollbar-hide">
        {TIMETABLE_DATA.classes.map(cls => (
          <button
            key={cls}
            type="button"
            onClick={() => setSelectedClass(cls)}
            className={`flex-shrink-0 px-3.5 py-1.5 rounded-xl text-[12px] font-semibold transition-all ${
              selectedClass === cls
                ? 'bg-blue-600 dark:bg-indigo-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {cls}
          </button>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block">
        <TimetableDesktop selectedClass={selectedClass} />
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        <TimetableMobileCards selectedClass={selectedClass} />
      </div>
    </Panel>
  )
}

// ─── MOBILE SECTION ACCORDION ────────────────────────────────────────────────
function MobileSection({ title, icon: Icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100/60 dark:hover:bg-white/[0.03] transition-colors"
      >
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1 text-left">{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div>{children}</div>}
    </div>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function ManagementDashboard() {
  const [dark, setDark] = useState(false)

  // Toggle dark class on root
  const toggleDark = useCallback(() => {
    setDark(p => {
      const next = !p
      document.documentElement.classList.toggle('dark', next)
      return next
    })
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] transition-colors duration-300">

      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 flex items-center gap-3 px-4 sm:px-6 py-3.5
        bg-white/80 dark:bg-[#1a1f35]/90 backdrop-blur-md
        border-b border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-sm">

        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <School2 className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-[14px] font-extrabold text-slate-800 dark:text-slate-100 truncate leading-tight">
              {SCHOOL_INFO.name}
            </h1>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate hidden sm:block">
              Management Dashboard · Session {SCHOOL_INFO.session}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-xl">
            <Clock className="w-3 h-3" />
            {SCHOOL_INFO.today}
          </div>
          <button
            onClick={toggleDark}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 relative">
            <Bell className="w-4 h-4" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500" />
          </button>
        </div>
      </div>

      {/* ── Main Content ────────────────────────────────────────────────────── */}
      <div className="px-4 sm:px-6 py-5 max-w-screen-xl mx-auto space-y-4 pb-10">

        {/* ── DESKTOP LAYOUT ── */}
        <div className="hidden sm:block space-y-4">

          {/* Row 1: Fee Summary (full width) */}
          <FeeRevenueSection />

          {/* Row 2: Paymode Summary (full width) */}
          <PaymodeSummary />

          {/* Row 3: Staff 4-col grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StaffStatistics />
            <AttendanceAuth />
            <AverageAttendance />
            <HolidaysList />
          </div>

          {/* Row 4: Student 4-col grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StudentHeadcounts />
            <NewAdmissions />
            <AdmissionRatio />
            <StudentStatistics />
          </div>

          {/* Row 5: Strength Chart (full width) */}
          <StrengthChart />

          {/* Row 6: Timetable (full width) */}
          <TimetableSection />
        </div>

        {/* ── MOBILE LAYOUT ── */}
        <div className="sm:hidden space-y-3">

          {/* Fee + Paymode always expanded */}
          <FeeRevenueSection />
          <PaymodeSummary />

          {/* Staff section accordion */}
          <MobileSection title="Staff Statistics" icon={UserCheck} defaultOpen>
            <div className="p-4 space-y-4">
              <div className="space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Staff Headcount</p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-slate-500 dark:text-slate-400">Registered / Total</span>
                  <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">
                    {STAFF_STATS.registered}/{STAFF_STATS.total}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
                    style={{ width: `${Math.round(STAFF_STATS.registered / STAFF_STATS.total * 100)}%` }} />
                </div>
                <StatRow icon={Users} label="Male Staff" value={`${STAFF_STATS.male.registered}/${STAFF_STATS.male.total}`}
                  pct={Math.round(STAFF_STATS.male.registered / STAFF_STATS.male.total * 100)}
                  colorClass="bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400" />
                <StatRow icon={Users} label="Female Staff" value={`${STAFF_STATS.female.registered}/${STAFF_STATS.female.total}`}
                  pct={Math.round(STAFF_STATS.female.registered / STAFF_STATS.female.total * 100)}
                  colorClass="bg-pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">Attendance Auth</p>
                <StatRow icon={Fingerprint} label="Biometric Terminal"
                  value={`${STAFF_STATS.biometric.count} (${STAFF_STATS.biometric.pct}%)`}
                  pct={STAFF_STATS.biometric.pct}
                  colorClass="bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400" />
                <StatRow icon={ClipboardList} label="Manually"
                  value={`${STAFF_STATS.manual.count} (${STAFF_STATS.manual.pct}%)`}
                  pct={STAFF_STATS.manual.pct}
                  colorClass="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" />
              </div>
            </div>
          </MobileSection>

          {/* Attendance + Holidays */}
          <div className="grid grid-cols-1 gap-3">
            <AverageAttendance />
            <HolidaysList />
          </div>

          {/* Student section accordion */}
          <MobileSection title="Student Statistics" icon={GraduationCap} defaultOpen>
            <div className="p-4 space-y-4">
              <div className="space-y-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Headcounts (YTD)</p>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-slate-500 dark:text-slate-400">Total Students</span>
                  <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{fmt(STUDENT_HEADCOUNTS.total)}</span>
                </div>
                <StatRow icon={Users} label="Male" value={`${fmt(STUDENT_HEADCOUNTS.male.count)} (${STUDENT_HEADCOUNTS.male.pct}%)`}
                  pct={STUDENT_HEADCOUNTS.male.pct} colorClass="bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400" />
                <StatRow icon={Users} label="Female" value={`${fmt(STUDENT_HEADCOUNTS.female.count)} (${STUDENT_HEADCOUNTS.female.pct}%)`}
                  pct={STUDENT_HEADCOUNTS.female.pct} colorClass="bg-pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">New Admissions · Total: {NEW_ADMISSIONS.total}</p>
                <StatRow icon={School2} label="Reg. at School" value={`${NEW_ADMISSIONS.school.count} (${NEW_ADMISSIONS.school.pct}%)`}
                  pct={NEW_ADMISSIONS.school.pct} colorClass="bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400" />
                <StatRow icon={Smartphone} label="Online Reg." value={`${NEW_ADMISSIONS.online.count} (${NEW_ADMISSIONS.online.pct}%)`}
                  pct={NEW_ADMISSIONS.online.pct} colorClass="bg-emerald-100 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Admission Ratio vs Prev Year</p>
                <CompareRow icon={Users} label="Boys" thisYear={ADMISSION_RATIO.boys.thisYear} prevYear={ADMISSION_RATIO.boys.prevYear} change={ADMISSION_RATIO.boys.change} imgColor="bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400" />
                <CompareRow icon={Users} label="Girls" thisYear={ADMISSION_RATIO.girls.thisYear} prevYear={ADMISSION_RATIO.girls.prevYear} change={ADMISSION_RATIO.girls.change} imgColor="bg-pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400" />
              </div>
              <div className="pt-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2">Student Stats vs Prev Year</p>
                <CompareRow icon={Users} label="Boys" thisYear={STUDENT_STATS.boys.thisYear} prevYear={STUDENT_STATS.boys.prevYear} change={STUDENT_STATS.boys.change} imgColor="bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400" />
                <CompareRow icon={Users} label="Girls" thisYear={STUDENT_STATS.girls.thisYear} prevYear={STUDENT_STATS.girls.prevYear} change={STUDENT_STATS.girls.change} imgColor="bg-pink-100 dark:bg-pink-500/15 text-pink-600 dark:text-pink-400" />
              </div>
            </div>
          </MobileSection>

          {/* Strength Chart */}
          <MobileSection title="Student Strength — Standards Wise" icon={BarChart3} defaultOpen={false}>
            <StrengthChart />
          </MobileSection>

          {/* Timetable */}
          <MobileSection title="Today's Time Table" icon={Table2} defaultOpen={false}>
            <TimetableSection />
          </MobileSection>
        </div>

      </div>
    </div>
  )
}
