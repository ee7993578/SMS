/**
 * Dashboard.jsx
 * Folder: src/pages/Student/Dashboard/Dashboard.jsx
 *
 * School Parent Portal Dashboard — fully responsive React + Tailwind.
 * Converts legacy ASPX dashboard.aspx to modern ERP-style UI.
 *
 * Features:
 *  - Welcome banner with student/parent info
 *  - Quick stats (Attendance, Fees, Homework, Rank)
 *  - Recent announcements
 *  - Upcoming events
 *  - Today's timetable
 *  - Recent exam results
 *  - Fee dues alert
 *  - Mobile: stacked cards, tab-based sections
 *  - Desktop: multi-column grid ERP layout
 */

import { useState, useMemo } from 'react'
import {
  Bell, Calendar, BookOpen, TrendingUp, Users, CreditCard,
  ClipboardList, Award, ChevronRight, ChevronDown, AlertCircle,
  CheckCircle2, Clock, MapPin, Phone, Mail, Star,
  FileText, Megaphone, GraduationCap, Home, BarChart3,
  ArrowUpRight, ArrowDownRight, Zap, Target, BookMarked,
  UserCheck, AlertTriangle, Info, X, Eye, Loader2,
  School2, Building2, CalendarDays, BookOpenCheck,
  Percent, Hash, BadgeCheck, Pencil
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const STUDENT_INFO = {
  name: 'Arjun Sharma',
  rollNo: 'A-2024-042',
  class: 'Class X',
  section: 'A',
  admissionNo: 'SVM/2019/042',
  fatherName: 'Rajesh Sharma',
  motherName: 'Sunita Sharma',
  dob: '12 March 2009',
  phone: '+91 98765 43210',
  email: 'rajesh.sharma@email.com',
  avatar: null,
  session: '2024-25',
  houseColor: 'Red House',
}

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Sr. Sec. School',
  address: 'Civil Lines, Dehradun, Uttarakhand',
}

const STATS = [
  {
    id: 'attendance',
    label: 'Attendance',
    value: '92%',
    rawValue: 92,
    sub: '184 / 200 days',
    icon: UserCheck,
    color: 'emerald',
    trend: '+2%',
    trendUp: true,
  },
  {
    id: 'fees',
    label: 'Fees Paid',
    value: '₹42,000',
    rawValue: 70,
    sub: '₹18,000 due',
    icon: CreditCard,
    color: 'amber',
    trend: 'Due: Apr 30',
    trendUp: false,
    alert: true,
  },
  {
    id: 'rank',
    label: 'Class Rank',
    value: '#7',
    rawValue: null,
    sub: 'Out of 48 students',
    icon: Award,
    color: 'violet',
    trend: '↑ 3 from last term',
    trendUp: true,
  },
  {
    id: 'homework',
    label: 'Homework',
    value: '3 Pending',
    rawValue: null,
    sub: '12 submitted this week',
    icon: ClipboardList,
    color: 'blue',
    trend: 'Due today: 1',
    trendUp: false,
    alert: true,
  },
]

const ANNOUNCEMENTS = [
  {
    id: 1,
    title: 'Annual Sports Day – Registration Open',
    body: 'Register your ward for Annual Sports Day 2025. Last date: 20 April 2025.',
    date: '14 Apr 2025',
    type: 'event',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Half-Yearly Exam Schedule Released',
    body: 'Half-yearly examinations will commence from 5 May 2025. Schedule uploaded in portal.',
    date: '12 Apr 2025',
    type: 'exam',
    priority: 'high',
  },
  {
    id: 3,
    title: 'Fee Payment Reminder',
    body: 'April installment is due by 30 April 2025. Pay online or at school counter.',
    date: '10 Apr 2025',
    type: 'fee',
    priority: 'medium',
  },
  {
    id: 4,
    title: 'Summer Vacation: 15 May – 15 June',
    body: 'School will remain closed for summer vacation from 15 May to 15 June 2025.',
    date: '08 Apr 2025',
    type: 'holiday',
    priority: 'low',
  },
  {
    id: 5,
    title: 'PTM Scheduled on 26 April 2025',
    body: 'Parent-Teacher Meeting for Class X & XII on Saturday, 26 April 2025 from 9 AM – 1 PM.',
    date: '07 Apr 2025',
    type: 'event',
    priority: 'medium',
  },
]

const TIMETABLE_TODAY = [
  { period: 1, subject: 'Mathematics',        teacher: 'Mr. R.K. Gupta',    time: '7:30 – 8:15',  room: 'R-12', status: 'done'    },
  { period: 2, subject: 'English',             teacher: 'Mrs. P. Srivastava',time: '8:15 – 9:00',  room: 'R-12', status: 'done'    },
  { period: 3, subject: 'Physics',             teacher: 'Mr. A. Mishra',     time: '9:00 – 9:45',  room: 'Lab-1',status: 'current' },
  { period: 4, subject: 'Break',               teacher: '',                  time: '9:45 – 10:00', room: '',     status: 'break'  },
  { period: 5, subject: 'Chemistry',           teacher: 'Mrs. S. Negi',      time: '10:00 – 10:45',room: 'Lab-2',status: 'upcoming'},
  { period: 6, subject: 'Social Science',      teacher: 'Mr. D. Verma',      time: '10:45 – 11:30',room: 'R-12', status: 'upcoming'},
  { period: 7, subject: 'Computer Science',    teacher: 'Ms. R. Joshi',      time: '11:30 – 12:15',room: 'CL-1', status: 'upcoming'},
  { period: 8, subject: 'Hindi',               teacher: 'Mr. K.L. Arya',     time: '12:15 – 1:00', room: 'R-12', status: 'upcoming'},
]

const RECENT_RESULTS = [
  { subject: 'Mathematics',     marks: 87, total: 100, grade: 'A',  color: 'blue'    },
  { subject: 'English',         marks: 91, total: 100, grade: 'A+', color: 'emerald' },
  { subject: 'Physics',         marks: 78, total: 100, grade: 'B+', color: 'violet'  },
  { subject: 'Chemistry',       marks: 82, total: 100, grade: 'A',  color: 'amber'   },
  { subject: 'Social Science',  marks: 88, total: 100, grade: 'A',  color: 'cyan'    },
  { subject: 'Computer Science',marks: 95, total: 100, grade: 'A+', color: 'indigo'  },
]

const UPCOMING_EVENTS = [
  { date: '20 Apr', title: 'Sports Day Registration Deadline', type: 'deadline', color: 'rose'    },
  { date: '26 Apr', title: 'Parent-Teacher Meeting',           type: 'meeting',  color: 'blue'    },
  { date: '30 Apr', title: 'Fee Payment Deadline',             type: 'fee',      color: 'amber'   },
  { date: '05 May', title: 'Half-Yearly Exams Begin',          type: 'exam',     color: 'violet'  },
  { date: '15 May', title: 'Summer Vacation Starts',           type: 'holiday',  color: 'emerald' },
]

const HOMEWORK_LIST = [
  { subject: 'Mathematics',   task: 'Ex 3.4 – Q1 to Q10',           dueDate: 'Today',    status: 'pending',   teacher: 'Mr. R.K. Gupta'    },
  { subject: 'Physics',       task: 'Numericals from Ch.5 (Light)',  dueDate: 'Tomorrow', status: 'pending',   teacher: 'Mr. A. Mishra'     },
  { subject: 'English',       task: 'Write essay: My Favourite Book',dueDate: '18 Apr',   status: 'pending',   teacher: 'Mrs. P. Srivastava'},
  { subject: 'Chemistry',     task: 'Lab report – Experiment 6',     dueDate: '16 Apr',   status: 'submitted', teacher: 'Mrs. S. Negi'      },
  { subject: 'Social Science',task: 'Map work – Ch. 4',              dueDate: '15 Apr',   status: 'submitted', teacher: 'Mr. D. Verma'      },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const MOBILE_TABS = [
  { id: 'overview',     label: 'Overview',   icon: Home         },
  { id: 'timetable',   label: 'Timetable',  icon: Clock        },
  { id: 'results',     label: 'Results',    icon: BarChart3    },
  { id: 'homework',    label: 'Homework',   icon: BookOpen     },
  { id: 'news',        label: 'News',       icon: Megaphone    },
]

const ANNOUNCEMENT_META = {
  event:   { color: 'blue',   bg: 'bg-blue-50   dark:bg-blue-500/10',   text: 'text-blue-700   dark:text-blue-300',   label: 'Event'   },
  exam:    { color: 'violet', bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-300', label: 'Exam'    },
  fee:     { color: 'amber',  bg: 'bg-amber-50  dark:bg-amber-500/10',  text: 'text-amber-700  dark:text-amber-300',  label: 'Fee'     },
  holiday: { color: 'emerald',bg: 'bg-emerald-50dark:bg-emerald-500/10',text: 'text-emerald-700dark:text-emerald-300',label: 'Holiday' },
}

const GRADE_COLORS = {
  'A+': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  'A':  'bg-blue-100    text-blue-800    dark:bg-blue-500/20    dark:text-blue-300',
  'B+': 'bg-amber-100   text-amber-800   dark:bg-amber-500/20   dark:text-amber-300',
  'B':  'bg-orange-100  text-orange-800  dark:bg-orange-500/20  dark:text-orange-300',
}

const SUBJECT_ABBR = {
  'Mathematics':     'MTH',
  'English':         'ENG',
  'Physics':         'PHY',
  'Chemistry':       'CHM',
  'Social Science':  'SST',
  'Computer Science':'CSC',
  'Hindi':           'HIN',
  'Biology':         'BIO',
}
const subjectColor = (subject) => {
  const palette = [
    { fg: '#1d4ed8', bg: '#dbeafe' },
    { fg: '#7c3aed', bg: '#ede9fe' },
    { fg: '#0891b2', bg: '#cffafe' },
    { fg: '#059669', bg: '#d1fae5' },
    { fg: '#d97706', bg: '#fef3c7' },
    { fg: '#dc2626', bg: '#fee2e2' },
    { fg: '#0369a1', bg: '#e0f2fe' },
  ]
  return palette[(subject?.charCodeAt(0) ?? 0) % palette.length]
}

const STAT_COLORS = {
  emerald: {
    icon:    'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    badge:   'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    bar:     'bg-emerald-500',
    barBg:   'bg-emerald-100 dark:bg-emerald-500/20',
  },
  amber: {
    icon:    'bg-amber-50   text-amber-600   dark:bg-amber-500/10   dark:text-amber-400',
    badge:   'bg-amber-100   text-amber-700   dark:bg-amber-500/15   dark:text-amber-400',
    bar:     'bg-amber-500',
    barBg:   'bg-amber-100   dark:bg-amber-500/20',
  },
  violet: {
    icon:    'bg-violet-50  text-violet-600  dark:bg-violet-500/10  dark:text-violet-400',
    badge:   'bg-violet-100  text-violet-700  dark:bg-violet-500/15  dark:text-violet-400',
    bar:     'bg-violet-500',
    barBg:   'bg-violet-100  dark:bg-violet-500/20',
  },
  blue: {
    icon:    'bg-blue-50    text-blue-600    dark:bg-blue-500/10    dark:text-blue-400',
    badge:   'bg-blue-100    text-blue-700    dark:bg-blue-500/15    dark:text-blue-400',
    bar:     'bg-blue-500',
    barBg:   'bg-blue-100    dark:bg-blue-500/20',
  },
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Section card wrapper */
function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

/** Card section header bar */
function CardHeader({ icon: Icon, title, badge, action, color = 'blue' }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
      <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
      {Icon && <Icon className={`w-4 h-4 flex-shrink-0 text-${color}-600 dark:text-${color}-400`} />}
      <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">{title}</span>
      {badge && (
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
          {badge}
        </span>
      )}
      {action}
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ stat }) {
  const { icon: Icon, label, value, sub, color, trend, trendUp, alert, rawValue } = stat
  const c = STAT_COLORS[color] || STAT_COLORS.blue
  return (
    <div className={`relative flex flex-col gap-3 rounded-2xl border bg-white dark:bg-[#1a1f35] px-4 py-4 shadow-sm
      ${alert
        ? 'border-amber-200 dark:border-amber-500/30'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
      }`}>
      {alert && (
        <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
      )}
      <div className="flex items-start justify-between gap-2">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </span>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex-shrink-0 ${c.badge}`}>
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[22px] font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{sub}</p>
      </div>
      {rawValue !== null && rawValue !== undefined && (
        <div className={`h-1.5 rounded-full ${c.barBg} overflow-hidden`}>
          <div className={`h-full rounded-full ${c.bar} transition-all duration-700`} style={{ width: `${rawValue}%` }} />
        </div>
      )}
    </div>
  )
}

// ─── WELCOME BANNER ───────────────────────────────────────────────────────────
function WelcomeBanner() {
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening'
  const day = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] overflow-hidden shadow-sm">
      {/* Gradient header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-700 dark:from-[#1e2a5e] dark:via-[#1a2050] dark:to-[#161b40] px-5 py-5 sm:px-6 sm:py-6">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 border-2 border-white/30">
            <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-blue-200 dark:text-blue-400 text-[12px] font-semibold">{greeting} 👋</p>
            <h2 className="text-[18px] sm:text-[22px] font-extrabold text-white leading-tight truncate">{STUDENT_INFO.name}</h2>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="bg-white/20 text-white/90 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                {STUDENT_INFO.class} – Sec {STUDENT_INFO.section}
              </span>
              <span className="bg-white/20 text-white/90 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                Roll: {STUDENT_INFO.rollNo}
              </span>
            </div>
          </div>
          {/* School badge – desktop only */}
          <div className="hidden sm:flex flex-col items-end flex-shrink-0">
            <Building2 className="w-5 h-5 text-white/50 mb-1 self-end" />
            <p className="text-white/70 text-[11px] font-semibold text-right max-w-[160px] leading-tight">{SCHOOL_INFO.name}</p>
            <p className="text-white/50 text-[10px] mt-0.5">{day}</p>
          </div>
        </div>
      </div>

      {/* Info pills row */}
      <div className="bg-white dark:bg-[#1a1f35] px-5 py-3 flex flex-wrap gap-3 border-t border-blue-100 dark:border-[rgba(99,102,241,0.15)]">
        {[
          { icon: Hash,          label: 'Adm. No',     value: STUDENT_INFO.admissionNo },
          { icon: CalendarDays,  label: 'DOB',          value: STUDENT_INFO.dob         },
          { icon: Phone,         label: 'Parent Ph.',  value: STUDENT_INFO.phone       },
          { icon: BadgeCheck,    label: 'Session',      value: STUDENT_INFO.session     },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-1.5">
            <Icon className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{label}:</span>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── TODAY'S TIMETABLE ────────────────────────────────────────────────────────
function TimetableSection() {
  const statusStyle = {
    done:    'opacity-50',
    current: 'ring-2 ring-blue-400 dark:ring-indigo-400 bg-blue-50/60 dark:bg-indigo-500/10',
    upcoming:'',
    break:   'bg-slate-50 dark:bg-slate-800/40',
  }
  return (
    <Card>
      <CardHeader icon={Clock} title="Today's Timetable" badge={`${TIMETABLE_TODAY.filter(t => t.status === 'upcoming').length} upcoming`} />
      <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
        {TIMETABLE_TODAY.map((row) => {
          const { fg, bg } = subjectColor(row.subject)
          const abbr = SUBJECT_ABBR[row.subject] || row.subject.slice(0, 3).toUpperCase()
          return (
            <div key={row.period} className={`flex items-center gap-3 px-5 py-3 transition-all ${statusStyle[row.status]}`}>
              {row.status === 'break' ? (
                <>
                  <span className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                    <Coffee className="w-4 h-4 text-slate-500" />
                  </span>
                  <div className="flex-1">
                    <p className="text-[12px] font-semibold text-slate-400 dark:text-slate-500">Break</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.time}</p>
                  </div>
                </>
              ) : (
                <>
                  {/* Subject badge */}
                  <span
                    className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                    style={{ background: bg, color: fg }}
                  >{abbr}</span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{row.subject}</p>
                      {row.status === 'current' && (
                        <span className="flex-shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white animate-pulse">LIVE</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{row.teacher}{row.room ? ` · ${row.room}` : ''}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">{row.time}</p>
                    {row.status === 'done' && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 ml-auto mt-0.5" />
                    )}
                  </div>
                </>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── RECENT RESULTS ───────────────────────────────────────────────────────────
function ResultsSection() {
  const avg = Math.round(RECENT_RESULTS.reduce((s, r) => s + r.marks, 0) / RECENT_RESULTS.length)
  return (
    <Card>
      <CardHeader
        icon={BarChart3}
        title="Recent Exam Results"
        badge={`Avg: ${avg}%`}
      />
      <div className="p-4 space-y-3">
        {RECENT_RESULTS.map((r) => {
          const pct = Math.round((r.marks / r.total) * 100)
          const { fg, bg } = subjectColor(r.subject)
          const abbr = SUBJECT_ABBR[r.subject] || r.subject.slice(0, 3).toUpperCase()
          return (
            <div key={r.subject} className="flex items-center gap-3">
              <span
                className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                style={{ background: bg, color: fg }}
              >{abbr}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">{r.subject}</p>
                  <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                    <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{r.marks}/{r.total}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${GRADE_COLORS[r.grade] || GRADE_COLORS['B']}`}>{r.grade}</span>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: fg }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── HOMEWORK ─────────────────────────────────────────────────────────────────
function HomeworkSection() {
  const pending   = HOMEWORK_LIST.filter(h => h.status === 'pending')
  const submitted = HOMEWORK_LIST.filter(h => h.status === 'submitted')

  return (
    <Card>
      <CardHeader
        icon={BookOpen}
        title="Homework"
        badge={`${pending.length} pending`}
      />
      <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
        {HOMEWORK_LIST.map((hw) => {
          const { fg, bg } = subjectColor(hw.subject)
          const abbr = SUBJECT_ABBR[hw.subject] || hw.subject.slice(0, 3).toUpperCase()
          const isPending = hw.status === 'pending'
          return (
            <div key={hw.task} className={`flex items-start gap-3 px-5 py-3.5 ${!isPending ? 'opacity-60' : ''}`}>
              <span
                className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold mt-0.5"
                style={{ background: bg, color: fg }}
              >{abbr}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{hw.task}</p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{hw.subject} · {hw.teacher}</p>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                {isPending ? (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    hw.dueDate === 'Today'
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300'
                      : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300'
                  }`}>
                    {hw.dueDate}
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
                    Submitted
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}

// ─── ANNOUNCEMENTS ────────────────────────────────────────────────────────────
function AnnouncementsSection() {
  const [expanded, setExpanded] = useState(null)
  const PRIORITY_ICON = {
    high:   <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />,
    medium: <Info className="w-3.5 h-3.5 text-amber-500" />,
    low:    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  }
  const TYPE_COLOR = {
    event:   'bg-blue-100   text-blue-700   dark:bg-blue-500/15   dark:text-blue-300',
    exam:    'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
    fee:     'bg-amber-100  text-amber-700  dark:bg-amber-500/15  dark:text-amber-300',
    holiday: 'bg-emerald-100text-emerald-700dark:bg-emerald-500/15dark:text-emerald-300',
  }

  return (
    <Card>
      <CardHeader icon={Megaphone} title="Announcements" badge={`${ANNOUNCEMENTS.length} new`} />
      <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
        {ANNOUNCEMENTS.map((a) => (
          <div key={a.id}>
            <button
              type="button"
              onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              className="w-full flex items-start gap-3 px-5 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
            >
              <span className="mt-0.5 flex-shrink-0">{PRIORITY_ICON[a.priority]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${TYPE_COLOR[a.type] || TYPE_COLOR.event}`}>
                    {a.type}
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{a.date}</span>
                </div>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">{a.title}</p>
              </div>
              <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200 ${expanded === a.id ? 'rotate-180' : ''}`} />
            </button>
            {expanded === a.id && (
              <div className="px-5 pb-4 pt-1">
                <p className="text-[12px] text-slate-500 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3">
                  {a.body}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── UPCOMING EVENTS TIMELINE ─────────────────────────────────────────────────
function EventsTimeline() {
  const EVENT_COLORS = {
    deadline: 'bg-rose-100   text-rose-700   dark:bg-rose-500/20   dark:text-rose-300',
    meeting:  'bg-blue-100   text-blue-700   dark:bg-blue-500/20   dark:text-blue-300',
    fee:      'bg-amber-100  text-amber-700  dark:bg-amber-500/20  dark:text-amber-300',
    exam:     'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',
    holiday:  'bg-emerald-100text-emerald-700dark:bg-emerald-500/20dark:text-emerald-300',
  }
  const DOT_BG = {
    deadline: 'bg-rose-500',
    meeting:  'bg-blue-500',
    fee:      'bg-amber-500',
    exam:     'bg-violet-500',
    holiday:  'bg-emerald-500',
  }

  return (
    <Card>
      <CardHeader icon={Calendar} title="Upcoming Events" badge={`${UPCOMING_EVENTS.length} events`} />
      <div className="p-4 space-y-3">
        {UPCOMING_EVENTS.map((ev, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* Date pill */}
            <div className="flex-shrink-0 w-14 text-center">
              <div className="rounded-xl bg-slate-100 dark:bg-slate-800 px-2 py-1.5">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                  {ev.date.split(' ')[1]}
                </p>
                <p className="text-[17px] font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
                  {ev.date.split(' ')[0]}
                </p>
              </div>
            </div>

            {/* Dot + line */}
            <div className="flex flex-col items-center self-stretch flex-shrink-0">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1 ${DOT_BG[ev.type] || 'bg-slate-400'}`} />
              {i < UPCOMING_EVENTS.length - 1 && (
                <div className="flex-1 w-px bg-slate-200 dark:bg-slate-700 my-1" />
              )}
            </div>

            {/* Event label */}
            <div className="flex-1 min-w-0 pb-3">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">{ev.title}</p>
              <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${EVENT_COLORS[ev.type] || EVENT_COLORS.meeting}`}>
                {ev.type}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

// ─── FEE ALERT BANNER ────────────────────────────────────────────────────────
function FeeAlert() {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-200 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10 px-5 py-4">
      <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-amber-800 dark:text-amber-300">Fee Payment Due</p>
        <p className="text-[12px] text-amber-700 dark:text-amber-400 mt-0.5">
          ₹18,000 is pending for April installment. Last date: <strong>30 April 2025</strong>.
        </p>
        <button type="button" className="mt-2 text-[12px] font-bold text-amber-800 dark:text-amber-300 underline underline-offset-2">
          Pay Now
        </button>
      </div>
      <button type="button" onClick={() => setDismissed(true)} className="text-amber-500 hover:text-amber-700 flex-shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── MOBILE TAB BAR ───────────────────────────────────────────────────────────
function MobileTabBar({ active, onChange }) {
  return (
    <div className="flex sm:hidden gap-0.5 bg-slate-100 dark:bg-[#141828] rounded-2xl p-1 overflow-x-auto no-scrollbar">
      {MOBILE_TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex-1 min-w-0 flex flex-col items-center gap-1 px-2 py-2 rounded-xl text-[10px] font-bold transition-all whitespace-nowrap
            ${active === id
              ? 'bg-white dark:bg-[#1a1f35] text-blue-600 dark:text-indigo-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400'
            }`}
        >
          <Icon className="w-4 h-4 flex-shrink-0" />
          {label}
        </button>
      ))}
    </div>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [mobileTab, setMobileTab] = useState('overview')

  return (
    <div className="space-y-4 pb-10">

      {/* Page title */}
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Home className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Parent Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Welcome back — here's your child's daily overview.
          </p>
        </div>
        <button type="button" className="relative p-2.5 rounded-xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-sm text-slate-500 hover:text-blue-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
        </button>
      </div>

      {/* Fee Alert */}
      <FeeAlert />

      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* ── MOBILE: Tab Navigation ── */}
      <MobileTabBar active={mobileTab} onChange={setMobileTab} />

      {/* ── MOBILE CONTENT ─────────────────────────────────────────────────── */}
      <div className="sm:hidden space-y-4">
        {mobileTab === 'overview' && (
          <>
            {/* Stat Cards */}
            <div className="grid grid-cols-2 gap-3">
              {STATS.map(stat => <StatCard key={stat.id} stat={stat} />)}
            </div>
            {/* Events */}
            <EventsTimeline />
            {/* Quick announcements preview */}
            <AnnouncementsSection />
          </>
        )}
        {mobileTab === 'timetable' && <TimetableSection />}
        {mobileTab === 'results'   && <ResultsSection />}
        {mobileTab === 'homework'  && <HomeworkSection />}
        {mobileTab === 'news'      && <AnnouncementsSection />}
      </div>

      {/* ── DESKTOP LAYOUT ─────────────────────────────────────────────────── */}
      <div className="hidden sm:block space-y-4">

        {/* Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {STATS.map(stat => <StatCard key={stat.id} stat={stat} />)}
        </div>

        {/* Main two-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Left column: Timetable + Homework */}
          <div className="lg:col-span-2 space-y-4">
            <TimetableSection />
            <HomeworkSection />
          </div>

          {/* Right column: Events + Results */}
          <div className="space-y-4">
            <EventsTimeline />
            <ResultsSection />
          </div>
        </div>

        {/* Announcements full-width */}
        <AnnouncementsSection />

      </div>
    </div>
  )
}

// A tiny coffee icon used for break slots
function Coffee({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 8h1a4 4 0 0 1 0 8h-1"/>
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/>
      <line x1="6" y1="2" x2="6" y2="4"/>
      <line x1="10" y1="2" x2="10" y2="4"/>
      <line x1="14" y1="2" x2="14" y2="4"/>
    </svg>
  )
}
