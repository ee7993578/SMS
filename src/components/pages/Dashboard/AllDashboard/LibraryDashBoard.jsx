/**
 * LibraryDashBoard.jsx
 * Folder: src/pages/Library/LibraryDashBoard.jsx
 *
 * Converts legacy ASPX "Library Dashboard" to fully-responsive React + Tailwind.
 *
 * Sections:
 *  - Top KPI Cards: Books Count, Books Issued, Books Circulation, Magazines Count
 *  - Today's Library Schedule (period-wise timetable)
 *  - Books Statistics (bar chart via pure CSS)
 *  - Recently Issued Books (list)
 *  - Top 10 Most Circulated Books (horizontal bar chart)
 *  - Fine Statistics (toggle: Today / Last 7 Days / Last 30 Days)
 *
 * Mobile: Cards, tabs, accordions, stacked sections — zero horizontal scroll
 * Desktop: Dense ERP-style grid layout
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BookOpen, BookMarked, RefreshCw, TrendingUp,
  AlertCircle, X, Check, ChevronDown, ChevronRight,
  Users, Library, RotateCcw, Newspaper,
  Clock, Calendar, Search, BarChart3,
  BookX, IndentIncrease, Banknote, Award,
  Loader2, Info, Filter, Eye, ArrowUpRight,
  BookCheck, BookCopy, Star, Layers,
  CircleDollarSign, Receipt, SlidersHorizontal,
  ShieldAlert, Bookmark, Hash
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const TODAY_LABEL = '30-JUN-2023'

const KPI_DATA = {
  books_count: {
    total: 12480,
    available: 9842,
    issued: 2638,
    new_books: 254,
    new_pct: 2.03,
  },
  books_issued: {
    total_issued: 2638,
    today_issued: 47,
    expected_return_today: 32,
    overdue: 118,
  },
  circulation: {
    circulated_ytd: 18650,
    imposed_fine: 43200,
    returned_today: 29,
    lost: 14,
  },
  magazines: {
    total: 380,
    new_this_month: 28,
    active_subscriptions: 42,
    expired: 6,
  },
}

const SCHEDULE_DATA = [
  { period: '1st Period', time: '08:00 – 08:45', class: 'Class VI-A',   teacher: 'Mrs. Sharma',   books: 12 },
  { period: '2nd Period', time: '08:45 – 09:30', class: 'Class VIII-B', teacher: 'Mr. Verma',     books: 18 },
  { period: '3rd Period', time: '09:30 – 10:15', class: 'Class X-A',    teacher: 'Mrs. Gupta',    books: 22 },
  { period: '4th Period', time: '11:00 – 11:45', class: 'Class VII-A',  teacher: 'Mr. Pandey',    books: 15 },
  { period: '5th Period', time: '11:45 – 12:30', class: 'Class IX-B',   teacher: 'Mrs. Joshi',    books: 20 },
  { period: '6th Period', time: '01:15 – 02:00', class: 'Class XI-A',   teacher: 'Mr. Mishra',    books: 25 },
]

const RECENT_ISSUES = [
  { id: 1, name: 'Ravi Kumar',      class: 'IX-A', book: 'Mathematics NCERT',       issued: '29-JUN-2023', due: '06-JUL-2023', avatar: 'RK' },
  { id: 2, name: 'Priya Singh',     class: 'XI-B', book: 'Physics Part-I',           issued: '29-JUN-2023', due: '06-JUL-2023', avatar: 'PS' },
  { id: 3, name: 'Anil Sharma',     class: 'VII-A',book: 'English Literature',        issued: '28-JUN-2023', due: '05-JUL-2023', avatar: 'AS' },
  { id: 4, name: 'Meera Patel',     class: 'X-A',  book: 'History of India',          issued: '28-JUN-2023', due: '05-JUL-2023', avatar: 'MP' },
  { id: 5, name: 'Suresh Yadav',    class: 'XII-A',book: 'Chemistry Textbook',        issued: '27-JUN-2023', due: '04-JUL-2023', avatar: 'SY' },
  { id: 6, name: 'Kavita Dubey',    class: 'VI-B', book: 'Science Explorer',          issued: '27-JUN-2023', due: '04-JUL-2023', avatar: 'KD' },
  { id: 7, name: 'Rohit Mishra',    class: 'VIII-A',book: 'Geography World',          issued: '26-JUN-2023', due: '03-JUL-2023', avatar: 'RM' },
  { id: 8, name: 'Anita Tiwari',    class: 'IX-B', book: 'Biology NCERT',             issued: '26-JUN-2023', due: '03-JUL-2023', avatar: 'AT' },
]

const TOP_CIRCULATED = [
  { rank: 1,  title: 'Mathematics NCERT Class X',     author: 'NCERT',        count: 285, category: 'Textbook'  },
  { rank: 2,  title: 'Physics Part-I Class XII',      author: 'NCERT',        count: 241, category: 'Textbook'  },
  { rank: 3,  title: 'English Grammar & Composition', author: 'S.C. Gupta',   count: 198, category: 'Reference' },
  { rank: 4,  title: 'History of Modern India',       author: 'Bipan Chandra',count: 176, category: 'Reference' },
  { rank: 5,  title: 'Chemistry NCERT Class XII',     author: 'NCERT',        count: 164, category: 'Textbook'  },
  { rank: 6,  title: 'Biology NCERT Class XI',        author: 'NCERT',        count: 152, category: 'Textbook'  },
  { rank: 7,  title: 'Manorama Yearbook 2023',        author: 'Manorama',     count: 138, category: 'Magazine'  },
  { rank: 8,  title: 'Wings of Fire',                 author: 'A.P.J. Kalam', count: 124, category: 'Story'     },
  { rank: 9,  title: 'Geography India Class XI',      author: 'NCERT',        count: 112, category: 'Textbook'  },
  { rank: 10, title: 'Sanskrit Vyakaran',             author: 'Board Pub.',   count: 98,  category: 'Textbook'  },
]

const FINE_DATA = {
  today: {
    collected: 420,
    pending: 1850,
    waivedOff: 60,
    transactions: 7,
    chart: [
      { label: 'Mon', value: 320 }, { label: 'Tue', value: 480 },
      { label: 'Wed', value: 210 }, { label: 'Thu', value: 560 },
      { label: 'Fri', value: 420 }, { label: 'Sat', value: 190 },
      { label: 'Sun', value: 80  },
    ],
  },
  7: {
    collected: 3280,
    pending: 4200,
    waivedOff: 380,
    transactions: 54,
    chart: [
      { label: 'Mon', value: 320 }, { label: 'Tue', value: 480 },
      { label: 'Wed', value: 210 }, { label: 'Thu', value: 560 },
      { label: 'Fri', value: 420 }, { label: 'Sat', value: 190 },
      { label: 'Sun', value: 80  },
    ],
  },
  30: {
    collected: 14500,
    pending: 9800,
    waivedOff: 1200,
    transactions: 218,
    chart: [
      { label: 'W1', value: 3200 }, { label: 'W2', value: 4100 },
      { label: 'W3', value: 3800 }, { label: 'W4', value: 3400 },
    ],
  },
}

const BOOKS_STATS = {
  categories: [
    { label: 'Textbooks',  count: 5420, color: '#3b82f6' },
    { label: 'Reference',  count: 2180, color: '#8b5cf6' },
    { label: 'Story',      count: 1640, color: '#10b981' },
    { label: 'Magazine',   count: 1120, color: '#f59e0b' },
    { label: 'Science',    count: 980,  color: '#06b6d4' },
    { label: 'History',    count: 740,  color: '#ef4444' },
    { label: 'General',    count: 400,  color: '#64748b' },
  ],
}

// ─── AVATAR COLORS ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { bg: '#dbeafe', fg: '#1d4ed8' }, { bg: '#ede9fe', fg: '#7c3aed' },
  { bg: '#d1fae5', fg: '#059669' }, { bg: '#fef3c7', fg: '#d97706' },
  { bg: '#fee2e2', fg: '#dc2626' }, { bg: '#cffafe', fg: '#0891b2' },
  { bg: '#fce7f3', fg: '#be185d' }, { bg: '#f0fdf4', fg: '#166534' },
]
const avatarColor = (str = '') => AVATAR_COLORS[str.charCodeAt(0) % AVATAR_COLORS.length]

const CATEGORY_COLORS = {
  Textbook:  { bg: '#dbeafe', fg: '#1d4ed8' },
  Reference: { bg: '#ede9fe', fg: '#7c3aed' },
  Story:     { bg: '#d1fae5', fg: '#059669' },
  Magazine:  { bg: '#fef3c7', fg: '#d97706' },
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function SectionCard({ title, subtitle, icon: Icon, accent = 'blue', children, className = '', action }) {
  const accents = {
    blue:    'bg-blue-500',
    violet:  'bg-violet-500',
    emerald: 'bg-emerald-500',
    amber:   'bg-amber-500',
    cyan:    'bg-cyan-500',
    rose:    'bg-rose-500',
  }
  return (
    <div className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden ${className}`}>
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className={`w-1 h-5 rounded-full flex-shrink-0 ${accents[accent]}`} />
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 text-${accent}-600 dark:text-${accent}-400`} />}
        <div className="flex-1 min-w-0">
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
          {subtitle && <span className="ml-2 text-[12px] text-slate-400 dark:text-slate-500">{subtitle}</span>}
        </div>
        {action}
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

// ─── KPI STAT CARD ────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, title, main, mainLabel, stats, accent }) {
  const accents = {
    blue:    { icon: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',    border: 'border-blue-100 dark:border-blue-500/15',    badge: 'bg-blue-600 dark:bg-blue-500'    },
    violet:  { icon: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400', border: 'border-violet-100 dark:border-violet-500/15', badge: 'bg-violet-600 dark:bg-violet-500' },
    emerald: { icon: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400', border: 'border-emerald-100 dark:border-emerald-500/15', badge: 'bg-emerald-600 dark:bg-emerald-500' },
    amber:   { icon: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400', border: 'border-amber-100 dark:border-amber-500/15', badge: 'bg-amber-600 dark:bg-amber-500' },
  }
  const c = accents[accent]
  return (
    <div className={`rounded-2xl border ${c.border} bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden flex flex-col`}>
      {/* Top */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <span className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
          <Icon className="w-5 h-5" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">{title}</p>
          <p className="text-[26px] font-black text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{main.toLocaleString()}</p>
          {mainLabel && <p className="text-[10px] text-slate-400 dark:text-slate-500">{mainLabel}</p>}
        </div>
      </div>
      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-px bg-slate-100 dark:bg-[rgba(99,102,241,0.1)] border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] mt-auto">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#1a1f35] px-3 py-2.5">
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{s.label}</p>
            <p className={`text-[16px] font-bold tabular-nums ${s.color || 'text-slate-700 dark:text-slate-200'}`}>{typeof s.value === 'number' ? s.value.toLocaleString() : s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SCHEDULE TABLE (Desktop) ─────────────────────────────────────────────────
function ScheduleDesktop({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            {['Period', 'Time', 'Class', 'Teacher', 'Books Req.'].map(h => (
              <th key={h} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{row.period}</span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="flex items-center justify-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300 font-medium">
                  <Clock className="w-3 h-3 text-slate-400" />{row.time}
                </span>
              </td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">{row.class}</span>
              </td>
              <td className="px-4 py-3 text-center text-[13px] text-slate-700 dark:text-slate-300 font-medium">{row.teacher}</td>
              <td className="px-4 py-3 text-center">
                <span className="inline-flex items-center justify-center w-9 h-9 rounded-xl text-[14px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">{row.books}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── SCHEDULE CARDS (Mobile) ──────────────────────────────────────────────────
function ScheduleMobile({ data }) {
  return (
    <div className="space-y-2">
      {data.map((row, i) => (
        <div key={i} className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{row.period}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">{row.class}</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{row.time} · {row.teacher}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-[18px] font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{row.books}</p>
            <p className="text-[9px] font-bold uppercase text-slate-400">books</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── BOOKS STATS CHART (CSS bars) ─────────────────────────────────────────────
function BooksStatsChart({ data }) {
  const max = Math.max(...data.categories.map(c => c.count))
  return (
    <div className="space-y-3">
      {data.categories.map((cat, i) => (
        <div key={i} className="flex items-center gap-3">
          <div className="w-20 text-right text-[12px] font-semibold text-slate-500 dark:text-slate-400 flex-shrink-0 truncate">{cat.label}</div>
          <div className="flex-1 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden relative">
            <div
              className="h-full rounded-lg transition-all duration-700 flex items-center justify-end pr-2"
              style={{ width: `${(cat.count / max) * 100}%`, background: cat.color }}
            >
              <span className="text-[11px] font-bold text-white tabular-nums">{cat.count.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ))}
      {/* Legend */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        {data.categories.map((cat, i) => (
          <span key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: cat.color }} />
            {cat.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ─── RECENTLY ISSUED BOOKS ────────────────────────────────────────────────────
function RecentIssueCard({ item }) {
  const { bg, fg } = avatarColor(item.avatar)
  const isOverdue = false // placeholder
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] last:border-0">
      <span className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: bg, color: fg }}>
        {item.avatar}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{item.book}</p>
      </div>
      <div className="text-right flex-shrink-0 ml-1">
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{item.class}</span>
        <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Due: {item.due}</p>
      </div>
    </div>
  )
}

// ─── TOP CIRCULATED BOOKS ─────────────────────────────────────────────────────
function TopCirculatedChart({ data }) {
  const max = data[0].count
  const catColor = (cat) => {
    const c = CATEGORY_COLORS[cat] || { bg: '#f1f5f9', fg: '#64748b' }
    return c
  }
  return (
    <div className="space-y-2.5">
      {data.map((book) => (
        <div key={book.rank} className="flex items-center gap-3">
          {/* Rank */}
          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-black flex-shrink-0 ${book.rank <= 3 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
            {book.rank}
          </span>
          {/* Bar + Title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate pr-2">{book.title}</p>
              <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 tabular-nums flex-shrink-0">{book.count}</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(book.count / max) * 100}%`, background: book.rank === 1 ? '#f59e0b' : book.rank === 2 ? '#94a3b8' : book.rank === 3 ? '#b45309' : '#3b82f6' }}
              />
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{book.author}</p>
          </div>
          {/* Category badge */}
          <span
            className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0"
            style={{ background: catColor(book.category).bg, color: catColor(book.category).fg }}
          >
            {book.category}
          </span>
        </div>
      ))}
    </div>
  )
}

// ─── FINE STATISTICS ──────────────────────────────────────────────────────────
function FineStats({ data, period }) {
  const max = Math.max(...data.chart.map(d => d.value))
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      {/* Summary table */}
      <div className="lg:col-span-1">
        <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/60 dark:bg-white/[0.02]">
                <th className="px-3 py-2 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Type</th>
                <th className="px-3 py-2 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
                <td className="px-3 py-2.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0"/>Collected</td>
                <td className="px-3 py-2.5 text-right text-[13px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">₹{data.collected.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
                <td className="px-3 py-2.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0"/>Pending</td>
                <td className="px-3 py-2.5 text-right text-[13px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">₹{data.pending.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
                <td className="px-3 py-2.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0"/>Waived Off</td>
                <td className="px-3 py-2.5 text-right text-[13px] font-bold text-amber-600 dark:text-amber-400 tabular-nums">₹{data.waivedOff.toLocaleString()}</td>
              </tr>
              <tr className="border-t border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/40 dark:bg-white/[0.02]">
                <td className="px-3 py-2.5 text-[12px] font-bold text-slate-700 dark:text-slate-200">Transactions</td>
                <td className="px-3 py-2.5 text-right text-[13px] font-black text-blue-700 dark:text-blue-400 tabular-nums">{data.transactions}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Bar chart */}
      <div className="lg:col-span-2">
        <div className="flex items-end justify-between gap-2 h-36 px-1">
          {data.chart.map((d, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 tabular-nums">
                {period === 30 ? `₹${(d.value/1000).toFixed(1)}k` : `₹${d.value}`}
              </span>
              <div className="w-full rounded-t-lg transition-all duration-700 bg-gradient-to-t from-blue-600 to-blue-400 dark:from-indigo-600 dark:to-indigo-400"
                style={{ height: `${Math.max(10, (d.value / max) * 100)}%` }}
              />
              <span className="text-[10px] text-slate-400 dark:text-slate-500">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE SECTION TOGGLE ────────────────────────────────────────────────────
function Accordion({ title, icon: Icon, accent = 'blue', children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  const accents = {
    blue:    'text-blue-600 dark:text-blue-400',
    violet:  'text-violet-600 dark:text-violet-400',
    emerald: 'text-emerald-600 dark:text-emerald-400',
    amber:   'text-amber-600 dark:text-amber-400',
    cyan:    'text-cyan-600 dark:text-cyan-400',
    rose:    'text-rose-600 dark:text-rose-400',
  }
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {Icon && <Icon className={`w-4 h-4 flex-shrink-0 ${accents[accent]}`} />}
        <span className="flex-1 text-[14px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-4 pb-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] pt-3">{children}</div>}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LibraryDashBoard() {
  const [finePeriod, setFinePeriod]   = useState('today')
  const [mobileTab,  setMobileTab]    = useState('overview')

  const fineKey  = finePeriod === 'today' ? 'today' : parseInt(finePeriod)
  const fineData = FINE_DATA[fineKey]

  const MOBILE_TABS = [
    { id: 'overview',  label: 'Overview',   icon: BarChart3   },
    { id: 'schedule',  label: 'Schedule',   icon: Calendar    },
    { id: 'issued',    label: 'Issued',     icon: BookCheck   },
    { id: 'fine',      label: 'Fine',       icon: Receipt     },
  ]

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Library className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Library Dashboard
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {TODAY_LABEL} — Real-time library statistics &amp; activity
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors text-[13px] font-semibold">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </div>
      </div>

      {/* ── KPI CARDS — 2×2 on mobile, 4-col on desktop ─────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          icon={BookOpen} title="Books Count" accent="blue"
          main={KPI_DATA.books_count.total} mainLabel="Total books in library"
          stats={[
            { label: 'Available',    value: KPI_DATA.books_count.available,    color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Issued',       value: KPI_DATA.books_count.issued,        color: 'text-amber-600 dark:text-amber-400'     },
            { label: 'New Books',    value: KPI_DATA.books_count.new_books,     color: 'text-blue-600 dark:text-blue-400'       },
            { label: 'New Books %',  value: `${KPI_DATA.books_count.new_pct}%`, color: 'text-slate-600 dark:text-slate-300'    },
          ]}
        />
        <KpiCard
          icon={BookMarked} title="Books Issued" accent="violet"
          main={KPI_DATA.books_issued.total_issued} mainLabel="Currently with members"
          stats={[
            { label: "Today's Issue",    value: KPI_DATA.books_issued.today_issued,       color: 'text-violet-600 dark:text-violet-400' },
            { label: 'Exp. Return Today',value: KPI_DATA.books_issued.expected_return_today, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Overdue',          value: KPI_DATA.books_issued.overdue,             color: 'text-rose-600 dark:text-rose-400'    },
            { label: 'Returned Today',   value: KPI_DATA.circulation.returned_today,       color: 'text-blue-600 dark:text-blue-400'    },
          ]}
        />
        <KpiCard
          icon={RotateCcw} title="Books Circulation" accent="emerald"
          main={KPI_DATA.circulation.circulated_ytd} mainLabel="Year-to-date circulations"
          stats={[
            { label: 'Fine Imposed',  value: `₹${KPI_DATA.circulation.imposed_fine.toLocaleString()}`, color: 'text-amber-600 dark:text-amber-400' },
            { label: 'Returned Today',value: KPI_DATA.circulation.returned_today,  color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Books Lost',    value: KPI_DATA.circulation.lost,             color: 'text-rose-600 dark:text-rose-400'       },
            { label: 'Status',        value: 'Active',                              color: 'text-blue-600 dark:text-blue-400'       },
          ]}
        />
        <KpiCard
          icon={Newspaper} title="Magazines Count" accent="amber"
          main={KPI_DATA.magazines.total} mainLabel="Total magazine titles"
          stats={[
            { label: 'New This Month',   value: KPI_DATA.magazines.new_this_month,       color: 'text-amber-600 dark:text-amber-400'   },
            { label: 'Active Subscr.',   value: KPI_DATA.magazines.active_subscriptions, color: 'text-emerald-600 dark:text-emerald-400' },
            { label: 'Expired',          value: KPI_DATA.magazines.expired,              color: 'text-rose-600 dark:text-rose-400'      },
            { label: 'Renewals Due',     value: 8,                                       color: 'text-blue-600 dark:text-blue-400'      },
          ]}
        />
      </div>

      {/* ── MOBILE TABS ──────────────────────────────────────────────────── */}
      <div className="flex md:hidden gap-1 rounded-xl p-1 bg-slate-100 dark:bg-slate-800/60">
        {MOBILE_TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setMobileTab(tab.id)}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg text-[10px] font-bold transition-all ${
              mobileTab === tab.id
                ? 'bg-white dark:bg-[#1a1f35] text-blue-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─────────────── DESKTOP LAYOUT ─────────────────────────────────── */}
      <div className="hidden md:block space-y-4">

        {/* ── Today's Schedule ─── */}
        <SectionCard
          title="Today's Library Schedule"
          subtitle={TODAY_LABEL}
          icon={Calendar}
          accent="blue"
        >
          <ScheduleDesktop data={SCHEDULE_DATA} />
        </SectionCard>

        {/* ── Books Stats + Recently Issued ─── */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <SectionCard title="Books Statistics" subtitle="by category" icon={BarChart3} accent="violet" className="h-full">
              <BooksStatsChart data={BOOKS_STATS} />
            </SectionCard>
          </div>
          <div className="col-span-5">
            <SectionCard
              title="Recently Issued Books"
              subtitle={`${RECENT_ISSUES.length} entries`}
              icon={BookCheck}
              accent="emerald"
              className="h-full"
            >
              <div className="space-y-0 divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
                {RECENT_ISSUES.map(item => <RecentIssueCard key={item.id} item={item} />)}
              </div>
            </SectionCard>
          </div>
        </div>

        {/* ── Top 10 Circulated ─── */}
        <SectionCard
          title="Top 10 Most Circulated Books"
          subtitle="Year-to-Date"
          icon={Award}
          accent="amber"
        >
          <TopCirculatedChart data={TOP_CIRCULATED} />
        </SectionCard>

        {/* ── Fine Statistics ─── */}
        <SectionCard
          title="Fine Statistics"
          icon={CircleDollarSign}
          accent="rose"
          action={
            <div className="flex gap-1 flex-shrink-0">
              {[
                { val: 'today', label: "Today's" },
                { val: '7',     label: 'Last 7 Days' },
                { val: '30',    label: 'Last 30 Days' },
              ].map(btn => (
                <button
                  key={btn.val}
                  onClick={() => setFinePeriod(btn.val)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                    finePeriod === btn.val
                      ? 'bg-blue-600 text-white shadow-sm dark:bg-indigo-600'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          }
        >
          <FineStats data={fineData} period={fineKey} />
        </SectionCard>
      </div>

      {/* ─────────────── MOBILE LAYOUT ──────────────────────────────────── */}
      <div className="md:hidden space-y-3">

        {/* Overview Tab */}
        {mobileTab === 'overview' && (
          <>
            <SectionCard title="Books Statistics" subtitle="by category" icon={BarChart3} accent="violet">
              <BooksStatsChart data={BOOKS_STATS} />
            </SectionCard>
            <SectionCard title="Top 10 Circulated" subtitle="YTD" icon={Award} accent="amber">
              <TopCirculatedChart data={TOP_CIRCULATED} />
            </SectionCard>
          </>
        )}

        {/* Schedule Tab */}
        {mobileTab === 'schedule' && (
          <SectionCard title="Today's Schedule" subtitle={TODAY_LABEL} icon={Calendar} accent="blue">
            <ScheduleMobile data={SCHEDULE_DATA} />
          </SectionCard>
        )}

        {/* Recently Issued Tab */}
        {mobileTab === 'issued' && (
          <SectionCard title="Recently Issued Books" subtitle={`${RECENT_ISSUES.length} entries`} icon={BookCheck} accent="emerald">
            <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
              {RECENT_ISSUES.map(item => <RecentIssueCard key={item.id} item={item} />)}
            </div>
          </SectionCard>
        )}

        {/* Fine Tab */}
        {mobileTab === 'fine' && (
          <SectionCard
            title="Fine Statistics"
            icon={CircleDollarSign}
            accent="rose"
            action={
              <select
                value={finePeriod}
                onChange={e => setFinePeriod(e.target.value)}
                className="text-[11px] font-bold px-2 py-1 rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="today">Today</option>
                <option value="7">Last 7 Days</option>
                <option value="30">Last 30 Days</option>
              </select>
            }
          >
            <FineStats data={fineData} period={fineKey} />
          </SectionCard>
        )}
      </div>
    </div>
  )
}
