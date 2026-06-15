/**
 * AttendanceReport.jsx
 * Folder: src/pages/Student/Reports/AttendanceReport.jsx
 *
 * Converts legacy ASPX "Attendance Report" to fully-responsive React + Tailwind.
 *
 * Flow (mirrors original ASPX):
 *  1. Monthly summary  → GridView1 (month_name, att / workday)
 *  2. Month-year list  → GridView2 (month_name, year, att, %)  — click % link
 *  3. Day-level detail → GridView3 (date, present, absent)
 *
 * Mobile: stacked cards with expandable detail
 * Desktop: dense ERP-style tables
 */

import { useState, useMemo, useCallback } from 'react'
import {
  CalendarDays, ChevronDown, ChevronRight, ChevronUp,
  AlertCircle, X, Check, Loader2,
  SlidersHorizontal, Filter, RefreshCw, Eye,
  Search, Info, BarChart3,
  Calendar, Clock, TrendingUp,
  CheckCircle2, XCircle, Percent,
  FileSpreadsheet, BookOpen, Building2, MapPin,
  ArrowLeft, Users
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ────────────────────────────────────────────────────
const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const STUDENT_INFO = {
  name: 'Rahul Sharma',
  roll: 'STU2024-089',
  class: 'Class X',
  section: 'A',
  session: '2024-25',
}

// GridView1: monthly summary — att/workday
const MONTHLY_SUMMARY = [
  { month_name: 'April 2024',     att: '22/24' },
  { month_name: 'May 2024',       att: '20/23' },
  { month_name: 'June 2024',      att: '18/22' },
  { month_name: 'July 2024',      att: '24/26' },
  { month_name: 'August 2024',    att: '21/25' },
  { month_name: 'September 2024', att: '19/24' },
  { month_name: 'October 2024',   att: '23/26' },
  { month_name: 'November 2024',  att: '20/22' },
  { month_name: 'December 2024',  att: '17/21' },
  { month_name: 'January 2025',   att: '22/24' },
  { month_name: 'February 2025',  att: '19/21' },
  { month_name: 'March 2025',     att: '21/23' },
]

// GridView2: month-year list with attendance % (LinkButton "per")
const MONTH_YEAR_LIST = [
  { month_id: '4',  month_name: 'April',     att_year: '2024', att: '22/24', per: '91.7%', stu_id: 'STU089' },
  { month_id: '5',  month_name: 'May',       att_year: '2024', att: '20/23', per: '87.0%', stu_id: 'STU089' },
  { month_id: '6',  month_name: 'June',      att_year: '2024', att: '18/22', per: '81.8%', stu_id: 'STU089' },
  { month_id: '7',  month_name: 'July',      att_year: '2024', att: '24/26', per: '92.3%', stu_id: 'STU089' },
  { month_id: '8',  month_name: 'August',    att_year: '2024', att: '21/25', per: '84.0%', stu_id: 'STU089' },
  { month_id: '9',  month_name: 'September', att_year: '2024', att: '19/24', per: '79.2%', stu_id: 'STU089' },
  { month_id: '10', month_name: 'October',   att_year: '2024', att: '23/26', per: '88.5%', stu_id: 'STU089' },
  { month_id: '11', month_name: 'November',  att_year: '2024', att: '20/22', per: '90.9%', stu_id: 'STU089' },
  { month_id: '12', month_name: 'December',  att_year: '2024', att: '17/21', per: '81.0%', stu_id: 'STU089' },
  { month_id: '1',  month_name: 'January',   att_year: '2025', att: '22/24', per: '91.7%', stu_id: 'STU089' },
  { month_id: '2',  month_name: 'February',  att_year: '2025', att: '19/21', per: '90.5%', stu_id: 'STU089' },
  { month_id: '3',  month_name: 'March',     att_year: '2025', att: '21/23', per: '91.3%', stu_id: 'STU089' },
]

// GridView3: day-level detail keyed by month_id
const DAY_DETAIL = {
  '4-2024': [
    { att_date: '01 Apr 2024', present: 'P', absent: '' },
    { att_date: '02 Apr 2024', present: 'P', absent: '' },
    { att_date: '03 Apr 2024', present: '',  absent: 'A' },
    { att_date: '04 Apr 2024', present: 'P', absent: '' },
    { att_date: '05 Apr 2024', present: 'P', absent: '' },
    { att_date: '08 Apr 2024', present: 'P', absent: '' },
    { att_date: '09 Apr 2024', present: '',  absent: 'A' },
    { att_date: '10 Apr 2024', present: 'P', absent: '' },
    { att_date: '11 Apr 2024', present: 'P', absent: '' },
    { att_date: '12 Apr 2024', present: 'P', absent: '' },
    { att_date: '15 Apr 2024', present: 'P', absent: '' },
    { att_date: '16 Apr 2024', present: 'P', absent: '' },
    { att_date: '17 Apr 2024', present: 'P', absent: '' },
    { att_date: '18 Apr 2024', present: 'P', absent: '' },
    { att_date: '19 Apr 2024', present: 'P', absent: '' },
    { att_date: '22 Apr 2024', present: 'P', absent: '' },
    { att_date: '23 Apr 2024', present: 'P', absent: '' },
    { att_date: '24 Apr 2024', present: 'P', absent: '' },
    { att_date: '25 Apr 2024', present: 'P', absent: '' },
    { att_date: '26 Apr 2024', present: 'P', absent: '' },
    { att_date: '29 Apr 2024', present: 'P', absent: '' },
    { att_date: '30 Apr 2024', present: 'P', absent: '' },
    { att_date: '31 Apr 2024', present: 'P', absent: '' },
    { att_date: '31 Apr 2024', present: '',  absent: 'A' },
  ],
  '5-2024': [
    { att_date: '01 May 2024', present: 'P', absent: '' },
    { att_date: '02 May 2024', present: 'P', absent: '' },
    { att_date: '03 May 2024', present: '',  absent: 'A' },
    { att_date: '06 May 2024', present: 'P', absent: '' },
    { att_date: '07 May 2024', present: 'P', absent: '' },
    { att_date: '08 May 2024', present: 'P', absent: '' },
    { att_date: '09 May 2024', present: '',  absent: 'A' },
    { att_date: '10 May 2024', present: 'P', absent: '' },
    { att_date: '13 May 2024', present: 'P', absent: '' },
    { att_date: '14 May 2024', present: 'P', absent: '' },
    { att_date: '15 May 2024', present: '',  absent: 'A' },
    { att_date: '16 May 2024', present: 'P', absent: '' },
    { att_date: '17 May 2024', present: 'P', absent: '' },
    { att_date: '20 May 2024', present: 'P', absent: '' },
    { att_date: '21 May 2024', present: 'P', absent: '' },
    { att_date: '22 May 2024', present: 'P', absent: '' },
    { att_date: '23 May 2024', present: 'P', absent: '' },
    { att_date: '24 May 2024', present: 'P', absent: '' },
    { att_date: '27 May 2024', present: 'P', absent: '' },
    { att_date: '28 May 2024', present: 'P', absent: '' },
    { att_date: '29 May 2024', present: 'P', absent: '' },
    { att_date: '30 May 2024', present: 'P', absent: '' },
    { att_date: '31 May 2024', present: 'P', absent: '' },
  ],
}

// Fallback day detail generator for months without specific data
const generateDayDetail = (monthId, year, attStr) => {
  const [present, total] = attStr.split('/').map(Number)
  const absent = total - present
  const days = []
  for (let i = 1; i <= total; i++) {
    const isAbsent = i > present
    days.push({
      att_date: `${String(i).padStart(2,'0')} ${monthId} ${year}`,
      present: isAbsent ? '' : 'P',
      absent:  isAbsent ? 'A' : '',
    })
  }
  return days
}

// ─── HELPERS ────────────────────────────────────────────────────────────────
const parsePercentage = (per) => parseFloat(per?.replace('%','') || 0)

const getPercentColor = (pct) => {
  if (pct >= 90) return { text: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' }
  if (pct >= 75) return { text: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-500',  badge: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' }
  return           { text: 'text-rose-600 dark:text-rose-400',    bg: 'bg-rose-500',   badge: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' }
}

const overallStats = () => {
  const total   = MONTHLY_SUMMARY.reduce((s, r) => s + parseInt(r.att.split('/')[1]), 0)
  const present = MONTHLY_SUMMARY.reduce((s, r) => s + parseInt(r.att.split('/')[0]), 0)
  const absent  = total - present
  const pct     = total ? ((present / total) * 100).toFixed(1) : '0.0'
  return { total, present, absent, pct }
}

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────

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
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
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

// ─── STAT CARD ───────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ────────────────────────────────────────────────────
function SchoolHeader() {
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
      <div className="flex flex-wrap items-center justify-center gap-2 mt-1">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {STUDENT_INFO.session}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
          {STUDENT_INFO.class} – Sec {STUDENT_INFO.section}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Attendance Report
      </p>
    </div>
  )
}

// ─── PERCENTAGE BAR ──────────────────────────────────────────────────────────
function PercentBar({ pct }) {
  const { bg } = getPercentColor(pct)
  return (
    <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden w-full">
      <div
        className={`h-full rounded-full transition-all duration-500 ${bg}`}
        style={{ width: `${Math.min(pct, 100)}%` }}
      />
    </div>
  )
}

// ─── TAB SWITCHER ────────────────────────────────────────────────────────────
function TabSwitcher({ tabs, active, onChange }) {
  return (
    <div className="flex rounded-xl bg-slate-100 dark:bg-[#1e2238] p-1 gap-1">
      {tabs.map(t => (
        <button
          key={t.id}
          type="button"
          onClick={() => onChange(t.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-semibold transition-all
            ${active === t.id
              ? 'bg-white dark:bg-[#1a1f35] text-blue-700 dark:text-blue-400 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
        >
          {t.icon && <t.icon className="w-3.5 h-3.5" />}
          {t.label}
        </button>
      ))}
    </div>
  )
}

// ─── MONTHLY SUMMARY TABLE (GridView1) ──────────────────────────────────────
function MonthlySummaryTable({ data }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Monthly Attendance Summary</span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
          {data.length} months
        </span>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['S.No.', 'Month', 'Attendance / Working Days', 'Percentage'].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const [p, t] = row.att.split('/').map(Number)
              const pct = t ? ((p / t) * 100).toFixed(1) : 0
              const { badge } = getPercentColor(parseFloat(pct))
              return (
                <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 flex-shrink-0">
                        <Calendar className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                      </span>
                      <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.month_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{row.att}</span>
                      <div className="flex-1 max-w-[120px]">
                        <PercentBar pct={parseFloat(pct)} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold tabular-nums ${badge}`}>
                      <Percent className="w-3 h-3" />{pct}%
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-2">
        {data.map((row, i) => {
          const [p, t] = row.att.split('/').map(Number)
          const pct = t ? parseFloat(((p / t) * 100).toFixed(1)) : 0
          const { text, badge } = getPercentColor(pct)
          return (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] px-4 py-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                  </span>
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">{row.month_name}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">{row.att}</span>
                  <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[11px] font-bold tabular-nums ${badge}`}>
                    {pct}%
                  </span>
                </div>
              </div>
              <PercentBar pct={pct} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── MONTH-YEAR LIST TABLE (GridView2) — with drill-down link ────────────────
function MonthYearTable({ data, onDrillDown }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-amber-500 flex-shrink-0" />
        <TrendingUp className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Month-wise Attendance</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">Click % to view daily details</span>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['S.No.', 'Month', 'Year', 'Attendance / Working Days', 'Percentage (Click for details)'].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const pct = parsePercentage(row.per)
              const { badge, text } = getPercentColor(pct)
              return (
                <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{i + 1}</td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.month_name}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 tabular-nums">
                      {row.att_year}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{row.att}</span>
                      <div className="flex-1 max-w-[100px]">
                        <PercentBar pct={pct} />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => onDrillDown(row)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all hover:scale-105 active:scale-95 ${badge} cursor-pointer border border-current/20`}
                    >
                      <Percent className="w-3 h-3" />{row.per}
                      <ChevronRight className="w-3 h-3 opacity-60" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden p-4 space-y-2">
        <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          Tap the % badge to view daily attendance details.
        </p>
        {data.map((row, i) => {
          const pct = parsePercentage(row.per)
          const { badge } = getPercentColor(pct)
          return (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] px-4 py-3">
              <div className="flex items-center justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center bg-amber-50 dark:bg-amber-500/10 flex-shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{row.month_name} {row.att_year}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">{row.att} days</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDrillDown(row)}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold flex-shrink-0 ${badge} border border-current/20`}
                >
                  {row.per} <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <PercentBar pct={pct} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── DAY DETAIL TABLE (GridView3) ────────────────────────────────────────────
function DayDetailPanel({ selectedMonth, detailData, onBack }) {
  const presentCount = detailData.filter(d => d.present === 'P').length
  const absentCount  = detailData.filter(d => d.absent === 'A').length
  const total        = detailData.length
  const pct          = total ? ((presentCount / total) * 100).toFixed(1) : '0.0'
  const { badge }    = getPercentColor(parseFloat(pct))

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <button
          type="button"
          onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
            Daily Attendance — {selectedMonth?.month_name} {selectedMonth?.att_year}
          </span>
        </div>
        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex-shrink-0 ${badge}`}>
          {pct}%
        </span>
      </div>

      {/* Mini stats strip */}
      <div className="flex divide-x divide-slate-100 dark:divide-[rgba(99,102,241,0.1)] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        {[
          { label: 'Working Days', value: total,         color: 'text-slate-700 dark:text-slate-200' },
          { label: 'Days Present', value: presentCount,  color: 'text-emerald-600 dark:text-emerald-400' },
          { label: 'Days Absent',  value: absentCount,   color: 'text-rose-600 dark:text-rose-400' },
        ].map((s, i) => (
          <div key={i} className="flex-1 text-center py-3 px-2">
            <p className={`text-[18px] font-bold tabular-nums ${s.color}`}>{s.value}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['S.No.', 'Date', 'Present', 'Absent'].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 first:text-center first:w-12">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {detailData.map((row, i) => (
              <tr key={i} className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
                ${row.absent === 'A' ? 'bg-rose-50/40 dark:bg-rose-500/[0.04] hover:bg-rose-50/70' : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}
              >
                <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                    <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{row.att_date}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {row.present === 'P' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Present
                    </span>
                  ) : (
                    <span className="text-[12px] text-slate-300 dark:text-slate-600">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {row.absent === 'A' ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
                      <XCircle className="w-3.5 h-3.5" /> Absent
                    </span>
                  ) : (
                    <span className="text-[12px] text-slate-300 dark:text-slate-600">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: compact day list */}
      <div className="md:hidden p-4 space-y-2">
        {detailData.map((row, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-xl px-4 py-3 border
              ${row.present === 'P'
                ? 'bg-emerald-50/60 dark:bg-emerald-500/[0.06] border-emerald-100 dark:border-emerald-500/20'
                : 'bg-rose-50/60 dark:bg-rose-500/[0.06] border-rose-100 dark:border-rose-500/20'
              }`}
          >
            <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums w-6 text-right flex-shrink-0">{i + 1}</span>
            <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="flex-1 text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.att_date}</span>
            {row.present === 'P' ? (
              <span className="flex items-center gap-1 text-[12px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" /> P
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[12px] font-bold text-rose-600 dark:text-rose-400 flex-shrink-0">
                <XCircle className="w-4 h-4" /> A
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, view, setView, onShow, loading }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <Field label="Report View">
            <NativeSelect value={view} onChange={e => setView(e.target.value)}>
              <option value="monthly">Monthly Summary</option>
              <option value="monthyear">Month-Year List</option>
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function AttendanceReport() {
  // View mode: 'monthly' | 'monthyear'
  const [view,         setView]         = useState('monthly')
  const [loading,      setLoading]      = useState(false)
  const [shown,        setShown]        = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [toast,        setToast]        = useState(null)

  // Drill-down state (GridView3)
  const [selectedMonth,  setSelectedMonth]  = useState(null)
  const [detailData,     setDetailData]     = useState([])
  const [showDetail,     setShowDetail]     = useState(false)
  const [detailLoading,  setDetailLoading]  = useState(false)

  const stats = useMemo(() => overallStats(), [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Show report ──────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    setLoading(true)
    setShowDetail(false)
    setSelectedMonth(null)
    setTimeout(() => {
      setShown(true)
      setLoading(false)
      showToast(`Attendance report loaded for ${STUDENT_INFO.name}.`)
    }, 650)
  }, [])

  const handleReset = () => {
    setShown(false)
    setShowDetail(false)
    setSelectedMonth(null)
    setView('monthly')
  }

  // ── Drill-down: LinkButton1_Click equivalent ─────────────────────────────
  const handleDrillDown = useCallback((row) => {
    setDetailLoading(true)
    setShowDetail(false)
    setTimeout(() => {
      const key  = `${row.month_id}-${row.att_year}`
      const data = DAY_DETAIL[key] || generateDayDetail(row.month_name, row.att_year, row.att)
      setSelectedMonth(row)
      setDetailData(data)
      setShowDetail(true)
      setDetailLoading(false)
    }, 400)
  }, [])

  const handleBackFromDetail = () => {
    setShowDetail(false)
    setSelectedMonth(null)
  }

  const TABS = [
    { id: 'monthly',   label: 'Monthly',   icon: CalendarDays },
    { id: 'monthyear', label: 'Month-Year', icon: TrendingUp   },
  ]

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Attendance Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Monthly &amp; day-wise attendance for {STUDENT_INFO.name} · {STUDENT_INFO.class} Sec {STUDENT_INFO.section}
          </p>
        </div>
        {shown && (
          <button
            type="button"
            onClick={() => showToast('Excel export ready! (API integration pending)')}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 flex-shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" /> Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Report Options</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Report View">
              <NativeSelect value={view} onChange={e => setView(e.target.value)}>
                <option value="monthly">Monthly Summary</option>
                <option value="monthyear">Month-Year List</option>
              </NativeSelect>
            </Field>

            <div /><div />

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
        </div>
      </div>

      {/* ── MOBILE Filter Bar ───────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {view === 'monthly' ? 'Monthly Summary' : 'Month-Year List'}
        </button>
        {shown && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        view={view}
        setView={setView}
        onShow={handleShow}
        loading={loading}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {shown && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader />

          {/* Overall Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={CalendarDays} label="Working Days"  value={stats.total}          color="blue"    />
            <StatCard icon={CheckCircle2} label="Days Present"  value={stats.present}        color="emerald" />
            <StatCard icon={XCircle}      label="Days Absent"   value={stats.absent}         color="rose"    />
            <StatCard icon={Percent}      label="Attendance %"  value={`${stats.pct}%`}      color="amber"   sub="Overall" />
          </div>

          {/* Tab Switcher (desktop: buttons in filter; mobile: tab bar here) */}
          <div className="sm:hidden">
            <TabSwitcher tabs={TABS} active={view} onChange={v => { setView(v); setShowDetail(false) }} />
          </div>

          {/* Detail loading */}
          {detailLoading && (
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
              ))}
            </div>
          )}

          {/* Day Detail (GridView3) */}
          {showDetail && !detailLoading && (
            <DayDetailPanel
              selectedMonth={selectedMonth}
              detailData={detailData}
              onBack={handleBackFromDetail}
            />
          )}

          {/* Main Grid: show monthly OR month-year based on view */}
          {!showDetail && !detailLoading && (
            <>
              {view === 'monthly' && (
                <MonthlySummaryTable data={MONTHLY_SUMMARY} />
              )}
              {view === 'monthyear' && (
                <MonthYearTable data={MONTH_YEAR_LIST} onDrillDown={handleDrillDown} />
              )}
            </>
          )}

          {/* Desktop tab-like toggle between both views simultaneously */}
          <div className="hidden sm:block">
            {view === 'monthly' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setView('monthyear')}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <TrendingUp className="w-4 h-4" /> View Month-Year breakdown →
                </button>
              </div>
            )}
            {view === 'monthyear' && !showDetail && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setView('monthly')}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <CalendarDays className="w-4 h-4" /> ← Back to Monthly Summary
                </button>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <CalendarDays className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a view and click <strong>Show</strong> to generate the attendance report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
