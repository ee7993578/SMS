/**
 * ClasswiseFeeReport.jsx
 * Folder: src/pages/Fee/Reports/ClasswiseFeeReport.jsx
 *
 * Converts legacy ASPX "Class Wise Fee Details Report"
 * to fully-responsive React + Tailwind.
 *
 * Filters : Session · Class · Type (Regular/Transport) · Student Type
 * Actions : Export (Excel)
 * Tables  : Fee Structure GridView + Student Fee GridView
 * Mobile  : Tab-based layout, card accordions, bottom drawer filters
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, FileSpreadsheet, AlertCircle,
  X, Check, Loader2, ChevronDown, ChevronRight,
  SlidersHorizontal, Search, Info, BookOpen,
  IndianRupee, Users, LayoutList, Table2,
  BadgePercent, GraduationCap, Bus, UserCheck,
  UserX, User2, TrendingUp, ChevronsUpDown,
  ArrowDownUp, Receipt, Wallet, BadgeCheck,
  Building2, MapPin
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Sr. Sec. School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Fee head structure per class (Regular)
const REGULAR_FEE_STRUCTURE = {
  'Nursery':    [{ head: 'Tuition Fee', monthly: 1200, annual: 14400 }, { head: 'Activity Fee', monthly: 200, annual: 2400 }, { head: 'Development Fee', monthly: 0, annual: 2000 }, { head: 'Annual Charges', monthly: 0, annual: 3500 }],
  'LKG':        [{ head: 'Tuition Fee', monthly: 1400, annual: 16800 }, { head: 'Activity Fee', monthly: 200, annual: 2400 }, { head: 'Development Fee', monthly: 0, annual: 2000 }, { head: 'Annual Charges', monthly: 0, annual: 3500 }],
  'UKG':        [{ head: 'Tuition Fee', monthly: 1500, annual: 18000 }, { head: 'Activity Fee', monthly: 200, annual: 2400 }, { head: 'Development Fee', monthly: 0, annual: 2000 }, { head: 'Annual Charges', monthly: 0, annual: 3500 }],
  'Class I':    [{ head: 'Tuition Fee', monthly: 1800, annual: 21600 }, { head: 'Computer Fee', monthly: 150, annual: 1800 }, { head: 'Development Fee', monthly: 0, annual: 2500 }, { head: 'Annual Charges', monthly: 0, annual: 4000 }],
  'Class II':   [{ head: 'Tuition Fee', monthly: 1800, annual: 21600 }, { head: 'Computer Fee', monthly: 150, annual: 1800 }, { head: 'Development Fee', monthly: 0, annual: 2500 }, { head: 'Annual Charges', monthly: 0, annual: 4000 }],
  'Class III':  [{ head: 'Tuition Fee', monthly: 2000, annual: 24000 }, { head: 'Computer Fee', monthly: 150, annual: 1800 }, { head: 'Development Fee', monthly: 0, annual: 2500 }, { head: 'Annual Charges', monthly: 0, annual: 4000 }],
  'Class IV':   [{ head: 'Tuition Fee', monthly: 2000, annual: 24000 }, { head: 'Computer Fee', monthly: 150, annual: 1800 }, { head: 'Development Fee', monthly: 0, annual: 2500 }, { head: 'Annual Charges', monthly: 0, annual: 4000 }],
  'Class V':    [{ head: 'Tuition Fee', monthly: 2200, annual: 26400 }, { head: 'Computer Fee', monthly: 200, annual: 2400 }, { head: 'Development Fee', monthly: 0, annual: 3000 }, { head: 'Annual Charges', monthly: 0, annual: 4500 }],
  'Class VI':   [{ head: 'Tuition Fee', monthly: 2500, annual: 30000 }, { head: 'Computer Fee', monthly: 200, annual: 2400 }, { head: 'Science Fee', monthly: 150, annual: 1800 }, { head: 'Development Fee', monthly: 0, annual: 3000 }, { head: 'Annual Charges', monthly: 0, annual: 5000 }],
  'Class VII':  [{ head: 'Tuition Fee', monthly: 2500, annual: 30000 }, { head: 'Computer Fee', monthly: 200, annual: 2400 }, { head: 'Science Fee', monthly: 150, annual: 1800 }, { head: 'Development Fee', monthly: 0, annual: 3000 }, { head: 'Annual Charges', monthly: 0, annual: 5000 }],
  'Class VIII': [{ head: 'Tuition Fee', monthly: 2800, annual: 33600 }, { head: 'Computer Fee', monthly: 200, annual: 2400 }, { head: 'Science Fee', monthly: 150, annual: 1800 }, { head: 'Development Fee', monthly: 0, annual: 3000 }, { head: 'Annual Charges', monthly: 0, annual: 5000 }],
  'Class IX':   [{ head: 'Tuition Fee', monthly: 3000, annual: 36000 }, { head: 'Computer Fee', monthly: 250, annual: 3000 }, { head: 'Science Fee', monthly: 200, annual: 2400 }, { head: 'Development Fee', monthly: 0, annual: 3500 }, { head: 'Annual Charges', monthly: 0, annual: 6000 }],
  'Class X':    [{ head: 'Tuition Fee', monthly: 3000, annual: 36000 }, { head: 'Computer Fee', monthly: 250, annual: 3000 }, { head: 'Science Fee', monthly: 200, annual: 2400 }, { head: 'Development Fee', monthly: 0, annual: 3500 }, { head: 'Annual Charges', monthly: 0, annual: 6000 }],
  'Class XI':   [{ head: 'Tuition Fee', monthly: 3500, annual: 42000 }, { head: 'Lab Fee', monthly: 300, annual: 3600 }, { head: 'Computer Fee', monthly: 250, annual: 3000 }, { head: 'Development Fee', monthly: 0, annual: 4000 }, { head: 'Annual Charges', monthly: 0, annual: 7000 }],
  'Class XII':  [{ head: 'Tuition Fee', monthly: 3500, annual: 42000 }, { head: 'Lab Fee', monthly: 300, annual: 3600 }, { head: 'Computer Fee', monthly: 250, annual: 3000 }, { head: 'Development Fee', monthly: 0, annual: 4000 }, { head: 'Annual Charges', monthly: 0, annual: 7000 }],
}

const TRANSPORT_FEE_STRUCTURE = {
  'Nursery':    [{ head: 'Transport Fee (Near Zone)', monthly: 800, annual: 9600 }, { head: 'Transport Fee (Far Zone)', monthly: 1200, annual: 14400 }],
  'LKG':        [{ head: 'Transport Fee (Near Zone)', monthly: 800, annual: 9600 }, { head: 'Transport Fee (Far Zone)', monthly: 1200, annual: 14400 }],
  'UKG':        [{ head: 'Transport Fee (Near Zone)', monthly: 800, annual: 9600 }, { head: 'Transport Fee (Far Zone)', monthly: 1200, annual: 14400 }],
  'Class I':    [{ head: 'Transport Fee (Near Zone)', monthly: 900, annual: 10800 }, { head: 'Transport Fee (Far Zone)', monthly: 1400, annual: 16800 }],
  'Class II':   [{ head: 'Transport Fee (Near Zone)', monthly: 900, annual: 10800 }, { head: 'Transport Fee (Far Zone)', monthly: 1400, annual: 16800 }],
  'Class III':  [{ head: 'Transport Fee (Near Zone)', monthly: 900, annual: 10800 }, { head: 'Transport Fee (Far Zone)', monthly: 1400, annual: 16800 }],
  'Class IV':   [{ head: 'Transport Fee (Near Zone)', monthly: 900, annual: 10800 }, { head: 'Transport Fee (Far Zone)', monthly: 1400, annual: 16800 }],
  'Class V':    [{ head: 'Transport Fee (Near Zone)', monthly: 1000, annual: 12000 }, { head: 'Transport Fee (Far Zone)', monthly: 1500, annual: 18000 }],
  'Class VI':   [{ head: 'Transport Fee (Near Zone)', monthly: 1000, annual: 12000 }, { head: 'Transport Fee (Far Zone)', monthly: 1500, annual: 18000 }],
  'Class VII':  [{ head: 'Transport Fee (Near Zone)', monthly: 1000, annual: 12000 }, { head: 'Transport Fee (Far Zone)', monthly: 1500, annual: 18000 }],
  'Class VIII': [{ head: 'Transport Fee (Near Zone)', monthly: 1000, annual: 12000 }, { head: 'Transport Fee (Far Zone)', monthly: 1500, annual: 18000 }],
  'Class IX':   [{ head: 'Transport Fee (Near Zone)', monthly: 1100, annual: 13200 }, { head: 'Transport Fee (Far Zone)', monthly: 1600, annual: 19200 }],
  'Class X':    [{ head: 'Transport Fee (Near Zone)', monthly: 1100, annual: 13200 }, { head: 'Transport Fee (Far Zone)', monthly: 1600, annual: 19200 }],
  'Class XI':   [{ head: 'Transport Fee (Near Zone)', monthly: 1200, annual: 14400 }, { head: 'Transport Fee (Far Zone)', monthly: 1800, annual: 21600 }],
  'Class XII':  [{ head: 'Transport Fee (Near Zone)', monthly: 1200, annual: 14400 }, { head: 'Transport Fee (Far Zone)', monthly: 1800, annual: 21600 }],
}

// Student-wise fee details (GridView2 equivalent)
function generateStudentData(cls, type, studentType) {
  const baseNames = [
    'Aarav Sharma','Priya Singh','Rohan Verma','Sneha Patel','Amit Kumar',
    'Neha Gupta','Vikram Yadav','Pooja Mishra','Rahul Dubey','Anjali Tiwari',
    'Mohit Agarwal','Riya Joshi','Deepak Rawat','Kavya Nair','Arjun Pandey',
    'Simran Kaur','Harsh Chauhan','Divya Mehta','Saurabh Bajaj','Tanvi Saxena',
  ]
  const sections = ['A', 'B']
  const statuses = studentType === 'Withdrawn'
    ? ['Withdrawn']
    : studentType === 'Registered'
    ? ['Registered']
    : ['Registered', 'Registered', 'Registered', 'Withdrawn']

  const feeStructure = type === '2'
    ? (TRANSPORT_FEE_STRUCTURE[cls] || [])
    : (REGULAR_FEE_STRUCTURE[cls] || [])

  const totalFee = feeStructure.reduce((s, f) => s + f.annual, 0)

  return baseNames.slice(0, 12).map((name, i) => {
    const paid = Math.floor(totalFee * (0.3 + Math.random() * 0.6))
    const balance = totalFee - paid
    const status = statuses[i % statuses.length]
    return {
      id: i + 1,
      name,
      admNo: `ADM${2024 + Math.floor(i / 10)}${String(i + 1).padStart(3, '0')}`,
      section: sections[i % 2],
      rollNo: String(i + 1).padStart(2, '0'),
      status,
      totalFee,
      paid,
      balance,
      concession: Math.random() > 0.7 ? Math.floor(totalFee * 0.1) : 0,
    }
  })
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name) => CLASS_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── PRIMITIVE UI COMPONENTS ─────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20 dark:focus:border-indigo-400
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

function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────

function SchoolHeader({ session, cls, type, studentType }) {
  const typeLabel = type === '1' ? 'Regular' : type === '2' ? 'Transport' : '—'
  const stLabel = studentType === 'All' ? 'All Students'
    : studentType === 'Registered' ? 'Registered'
    : studentType === 'Withdrawn' ? 'Withdrawn' : '—'

  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[15px] sm:text-[17px] font-extrabold text-slate-800 dark:text-slate-100 text-center leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3 h-3 flex-shrink-0" /><span>{SCHOOL_INFO.address}</span>
      </div>
      {/* Pill row */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Pill color="amber">{session}</Pill>
        <Pill color="blue">{cls}</Pill>
        <Pill color={type === '2' ? 'cyan' : 'emerald'}>{typeLabel}</Pill>
        <Pill color="violet">{stLabel}</Pill>
      </div>
      <p className="mt-2.5 text-center text-[12px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Class Wise Fee Details Report
      </p>
    </div>
  )
}

function Pill({ color, children }) {
  const colors = {
    amber:   'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25',
    blue:    'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25',
    emerald: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25',
    cyan:    'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-400 dark:border-cyan-500/25',
    violet:  'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-400 dark:border-violet-500/25',
  }
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full border text-[11px] font-bold ${colors[color]}`}>
      {children}
    </span>
  )
}

// ─── SUMMARY STAT CARDS ───────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, small }) {
  const palette = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3.5 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${palette[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className={`font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-tight ${small ? 'text-[14px]' : 'text-[17px]'}`}>{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">{label}</p>
      </div>
    </div>
  )
}

// ─── FEE STRUCTURE TABLE (GridView1) ─────────────────────────────────────────

function FeeStructureTable({ data }) {
  const totalMonthly = data.reduce((s, r) => s + r.monthly, 0)
  const totalAnnual  = data.reduce((s, r) => s + r.annual, 0)

  // Mobile card version
  const MobileView = () => (
    <div className="md:hidden space-y-2 p-3">
      {data.map((row, i) => (
        <div key={i} className="flex items-center justify-between rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-white dark:bg-[#1e2238] px-4 py-3 gap-3">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{row.head}</span>
          </div>
          <div className="flex gap-3 flex-shrink-0 text-right">
            {row.monthly > 0 && (
              <div>
                <p className="text-[12px] font-bold text-emerald-600 dark:text-emerald-400">{fmt(row.monthly)}</p>
                <p className="text-[10px] text-slate-400">Monthly</p>
              </div>
            )}
            <div>
              <p className="text-[12px] font-bold text-blue-700 dark:text-blue-300">{fmt(row.annual)}</p>
              <p className="text-[10px] text-slate-400">Annual</p>
            </div>
          </div>
        </div>
      ))}
      {/* Total row */}
      <div className="flex items-center justify-between rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] px-4 py-3 gap-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300">Total</span>
        </div>
        <div className="flex gap-3 text-right">
          {totalMonthly > 0 && (
            <div>
              <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300">{fmt(totalMonthly)}</p>
              <p className="text-[10px] text-slate-400">Monthly</p>
            </div>
          )}
          <div>
            <p className="text-[13px] font-bold text-blue-700 dark:text-blue-300">{fmt(totalAnnual)}</p>
            <p className="text-[10px] text-slate-400">Annual</p>
          </div>
        </div>
      </div>
    </div>
  )

  // Desktop table
  const DesktopView = () => (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
            {['S.No.','Fee Head','Monthly Amount','Annual Amount'].map((h,i) => (
              <th key={i} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3 text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{i+1}</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 dark:bg-blue-500 flex-shrink-0" />
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.head}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                {row.monthly > 0
                  ? <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">{fmt(row.monthly)}</span>
                  : <span className="text-[12px] text-slate-400 dark:text-slate-600">—</span>
                }
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{fmt(row.annual)}</span>
              </td>
            </tr>
          ))}
          {/* Total */}
          <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
            <td className="px-4 py-3 text-center text-[12px] text-blue-500">—</td>
            <td className="px-4 py-3">
              <span className="flex items-center gap-2 text-[13px] font-bold text-blue-700 dark:text-blue-300">
                <TrendingUp className="w-4 h-4" />Total
              </span>
            </td>
            <td className="px-4 py-3">
              {totalMonthly > 0
                ? <span className="inline-flex px-2.5 py-1 rounded-lg text-[12px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300">{fmt(totalMonthly)}</span>
                : <span className="text-[12px] text-slate-400">—</span>
              }
            </td>
            <td className="px-4 py-3">
              <span className="inline-flex px-2.5 py-1 rounded-lg text-[12px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300">{fmt(totalAnnual)}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      <MobileView />
      <DesktopView />
    </>
  )
}

// ─── STUDENT ROW MOBILE CARD ─────────────────────────────────────────────────

function StudentCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const paidPct = row.totalFee ? Math.round((row.paid / row.totalFee) * 100) : 0
  const isWithdrawn = row.status === 'Withdrawn'

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm
      ${isWithdrawn ? 'border-rose-200 dark:border-rose-500/25' : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'}`}>
      {/* Main row */}
      <button type="button" onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 text-white text-[12px] font-bold shadow-sm">
          {row.name.split(' ').map(w => w[0]).slice(0,2).join('')}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.name}</p>
            {isWithdrawn && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400">Withdrawn</span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            <span className="font-medium text-slate-500 dark:text-slate-400">{row.admNo}</span>
            &nbsp;·&nbsp;Sec&nbsp;{row.section}&nbsp;·&nbsp;Roll&nbsp;{row.rollNo}
          </p>
        </div>
        {/* Balance chip */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className={`text-[15px] font-extrabold tabular-nums ${row.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
            {fmt(row.balance)}
          </span>
          <span className="text-[10px] text-slate-400">balance</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="flex text-[10px] justify-between mb-1 font-semibold">
          <span className="text-emerald-600 dark:text-emerald-400">Paid {paidPct}%</span>
          <span className="text-rose-500 dark:text-rose-400">Due {100-paidPct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-rose-100 dark:bg-rose-500/20 overflow-hidden">
          <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${paidPct}%` }} />
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 grid grid-cols-3 gap-2">
          {[
            { label: 'Total Fee', value: fmt(row.totalFee), color: 'text-blue-700 dark:text-blue-300' },
            { label: 'Paid', value: fmt(row.paid), color: 'text-emerald-700 dark:text-emerald-300' },
            { label: 'Concession', value: fmt(row.concession), color: 'text-violet-700 dark:text-violet-300' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3 text-center">
              <p className={`text-[14px] font-bold tabular-nums leading-tight ${item.color}`}>{item.value}</p>
              <p className="text-[10px] text-slate-400 mt-0.5 font-medium">{item.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── STUDENT FEE TABLE (GridView2) ────────────────────────────────────────────

function StudentFeeTable({ students, search, setSearch }) {
  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.admNo.toLowerCase().includes(q) ||
      s.section.toLowerCase().includes(q)
    )
  }, [students, search])

  const totals = useMemo(() => ({
    totalFee: filtered.reduce((s, r) => s + r.totalFee, 0),
    paid:     filtered.reduce((s, r) => s + r.paid, 0),
    balance:  filtered.reduce((s, r) => s + r.balance, 0),
    concession: filtered.reduce((s, r) => s + r.concession, 0),
  }), [filtered])

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3 flex-1">
          <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
          <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Student-wise Fee Details</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0">
            {filtered.length} students
          </span>
        </div>
        {/* Search */}
        <div className="relative w-full sm:w-52 flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name / adm no…"
            className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-xl border outline-none transition-all
              bg-white text-slate-700 border-slate-200 placeholder-slate-300
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
              dark:placeholder-slate-600 dark:focus:border-indigo-400"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
          <Search className="w-6 h-6 opacity-40" />
          <span className="text-[13px]">No students match your search.</span>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="md:hidden p-3 space-y-2">
            {filtered.map(row => <StudentCard key={row.id} row={row} />)}
            {/* Grand total mobile */}
            <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4 mt-2">
              <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> Total — {filtered.length} Students
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Total Fee', value: fmt(totals.totalFee), color: 'text-blue-700 dark:text-blue-300' },
                  { label: 'Paid', value: fmt(totals.paid), color: 'text-emerald-700 dark:text-emerald-300' },
                  { label: 'Balance', value: fmt(totals.balance), color: 'text-rose-700 dark:text-rose-300' },
                  { label: 'Concession', value: fmt(totals.concession), color: 'text-violet-700 dark:text-violet-300' },
                ].map((item, i) => (
                  <div key={i} className="rounded-xl bg-white/70 dark:bg-white/5 p-3 text-center">
                    <p className={`text-[16px] font-extrabold tabular-nums leading-tight ${item.color}`}>{item.value}</p>
                    <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.','Student Name','Adm No.','Section','Roll No','Status','Total Fee','Paid','Balance','Concession'].map((h,i) => (
                    <th key={i} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <tr key={row.id} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                    <td className="px-3 py-3 text-[12px] text-slate-400 tabular-nums w-10">{i+1}</td>
                    {/* Name */}
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                          {row.name.split(' ').map(w => w[0]).slice(0,2).join('')}
                        </div>
                        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[12px] font-medium text-slate-600 dark:text-slate-300 tabular-nums whitespace-nowrap">{row.admNo}</td>
                    <td className="px-3 py-3 text-center">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">{row.section}</span>
                    </td>
                    <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400 text-center tabular-nums">{row.rollNo}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold
                        ${row.status === 'Withdrawn'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                        }`}>
                        {row.status === 'Withdrawn' ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                        {row.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(row.totalFee)}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(row.paid)}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`text-[12px] font-bold tabular-nums ${row.balance > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>{fmt(row.balance)}</span>
                    </td>
                    <td className="px-3 py-3">
                      {row.concession > 0
                        ? <span className="text-[12px] font-semibold text-violet-700 dark:text-violet-300 tabular-nums">{fmt(row.concession)}</span>
                        : <span className="text-[12px] text-slate-400">—</span>
                      }
                    </td>
                  </tr>
                ))}
                {/* Total row */}
                <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                  <td className="px-3 py-3 text-center text-[12px] text-blue-400">—</td>
                  <td className="px-3 py-3" colSpan={5}>
                    <span className="flex items-center gap-2 text-[13px] font-bold text-blue-700 dark:text-blue-300">
                      <TrendingUp className="w-4 h-4" />Grand Total ({filtered.length} students)
                    </span>
                  </td>
                  <td className="px-3 py-3"><span className="text-[13px] font-bold text-blue-700 dark:text-blue-300">{fmt(totals.totalFee)}</span></td>
                  <td className="px-3 py-3"><span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300">{fmt(totals.paid)}</span></td>
                  <td className="px-3 py-3"><span className="text-[13px] font-bold text-rose-700 dark:text-rose-300">{fmt(totals.balance)}</span></td>
                  <td className="px-3 py-3"><span className="text-[13px] font-bold text-violet-700 dark:text-violet-300">{fmt(totals.concession)}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
        <p className="text-[12px] text-slate-400 dark:text-slate-500">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span> students
        </p>
        {search && (
          <button onClick={() => setSearch('')} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilters, onExport, loading, errors }) {
  if (!open) return null
  const { session, cls, type, studentType } = filters
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[88vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex justify-center pt-3 pb-1"><div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" /></div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-4 h-4" /></button>
          </div>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setFilters(p => ({ ...p, session: e.target.value }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => setFilters(p => ({ ...p, cls: e.target.value }))} placeholder="-- Select Class --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Fee Type" error={errors.type} required>
            <NativeSelect value={type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))} placeholder="-- Select Type --" error={errors.type}>
              <option value="1">Regular</option>
              <option value="2">Transport</option>
            </NativeSelect>
          </Field>
          <Field label="Student Type" error={errors.studentType} required>
            <NativeSelect value={studentType} onChange={e => setFilters(p => ({ ...p, studentType: e.target.value }))} placeholder="-- Select Student Type --" error={errors.studentType}>
              <option value="All">All Students</option>
              <option value="Registered">Registered</option>
              <option value="Withdrawn">Withdrawn</option>
            </NativeSelect>
          </Field>
        </div>
        <div className="sticky bottom-0 bg-white dark:bg-[#1a1f35] border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-5 py-4 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onExport(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── TAB BAR ─────────────────────────────────────────────────────────────────

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800/60 p-1 gap-1">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-[12px] font-bold transition-all
            ${active === tab.id
              ? 'bg-white dark:bg-[#1e2238] text-blue-700 dark:text-blue-300 shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
            }`}
        >
          <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="hidden xs:inline">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const TABS = [
  { id: 'structure', label: 'Fee Structure', icon: Table2 },
  { id: 'students',  label: 'Students',      icon: Users  },
]

export default function ClasswiseFeeReport() {
  // Filters
  const [filters, setFilters] = useState({ session: '', cls: '', type: '', studentType: '' })
  const [errors, setErrors]   = useState({})

  // Report state
  const [feeStructure, setFeeStructure] = useState([])
  const [students, setStudents]         = useState([])
  const [shown, setShown]               = useState(false)
  const [shownFilters, setShownFilters] = useState(null)

  // UI state
  const [loading, setLoading]       = useState(false)
  const [exporting, setExporting]   = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [activeTab, setActiveTab]   = useState('structure')
  const [search, setSearch]         = useState('')
  const [toast, setToast]           = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate ──────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!filters.session) err.session = 'Select a session'
    if (!filters.cls) err.cls = 'Select a class'
    if (!filters.type) err.type = 'Select fee type'
    if (!filters.studentType) err.studentType = 'Select student type'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Show Report ───────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const structure = filters.type === '2'
        ? (TRANSPORT_FEE_STRUCTURE[filters.cls] || [])
        : (REGULAR_FEE_STRUCTURE[filters.cls] || [])
      const studs = generateStudentData(filters.cls, filters.type, filters.studentType)
      setFeeStructure(structure)
      setStudents(studs)
      setShownFilters({ ...filters })
      setShown(true)
      setLoading(false)
      setActiveTab('structure')
      showToast(`Report loaded — ${studs.length} students · ${structure.length} fee heads`)
    }, 750)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', cls: '', type: '', studentType: '' })
    setFeeStructure([]); setStudents([])
    setShown(false); setShownFilters(null)
    setErrors({}); setSearch('')
  }

  const handleExport = () => {
    if (!shown) { showToast('Generate report first before exporting.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Summary stats ─────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    if (!shown) return null
    const totalAnnual = feeStructure.reduce((s, r) => s + r.annual, 0)
    const totalPaid   = students.reduce((s, r) => s + r.paid, 0)
    const totalDue    = students.reduce((s, r) => s + r.balance, 0)
    return { totalAnnual, totalPaid, totalDue, count: students.length }
  }, [shown, feeStructure, students])

  // Active filter count
  const activeFilters = Object.values(filters).filter(Boolean).length

  return (
    <div className="space-y-4 pb-16">
      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/30">
              <IndianRupee className="w-4 h-4 text-white" />
            </span>
            Class Wise Fee Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 ml-10">
            Fee structure &amp; student-wise details by class, session and type.
          </p>
        </div>
        {shown && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          {activeFilters > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {activeFilters} selected
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={filters.cls}
                onChange={e => { setFilters(p => ({ ...p, cls: e.target.value })); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Fee Type" error={errors.type} required>
              <NativeSelect value={filters.type}
                onChange={e => { setFilters(p => ({ ...p, type: e.target.value })); setErrors(p => ({ ...p, type: undefined })) }}
                placeholder="-- Select --" error={errors.type}>
                <option value="1">Regular</option>
                <option value="2">Transport</option>
              </NativeSelect>
            </Field>
            <Field label="Student Type" error={errors.studentType} required>
              <NativeSelect value={filters.studentType}
                onChange={e => { setFilters(p => ({ ...p, studentType: e.target.value })); setErrors(p => ({ ...p, studentType: undefined })) }}
                placeholder="-- Select --" error={errors.studentType}>
                <option value="All">All Students</option>
                <option value="Registered">Registered</option>
                <option value="Withdrawn">Withdrawn</option>
              </NativeSelect>
            </Field>
            {/* Action buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center px-3 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
                title="Reset filters">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0
            ? `${filters.cls || 'Class'} · ${filters.session || 'Session'}`
            : 'Set Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {shown && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
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
        filters={filters}
        setFilters={setFilters}
        onExport={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Report Results ────────────────────────────────────────────────── */}
      {shown && !loading && shownFilters && (
        <>
          {/* School Header */}
          <SchoolHeader
            session={shownFilters.session}
            cls={shownFilters.cls}
            type={shownFilters.type}
            studentType={shownFilters.studentType}
          />

          {/* Summary Stats */}
          {summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard icon={Users}        label="Total Students"   value={summary.count}              color="blue"    />
              <StatCard icon={IndianRupee}  label="Annual Fee"       value={fmt(summary.totalAnnual)}   color="violet"  small />
              <StatCard icon={Wallet}       label="Total Collected"  value={fmt(summary.totalPaid)}     color="emerald" small />
              <StatCard icon={BadgePercent} label="Total Balance"    value={fmt(summary.totalDue)}      color="rose"    small />
            </div>
          )}

          {/* Tab bar — mobile only, desktop shows both tables stacked */}
          <div className="md:hidden">
            <TabBar tabs={TABS} active={activeTab} onChange={setActiveTab} />
          </div>

          {/* ── Fee Structure Table (GridView1) ─────────────────────────── */}
          <div className={`${activeTab === 'structure' ? 'block' : 'hidden'} md:block`}>
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <LayoutList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Fee Structure</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {feeStructure.length} heads
                </span>
                <span className={`hidden sm:inline text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1
                  ${shownFilters.type === '2'
                    ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'}`}>
                  {shownFilters.type === '2' ? <Bus className="w-3 h-3" /> : <GraduationCap className="w-3 h-3" />}
                  {shownFilters.type === '2' ? 'Transport' : 'Regular'}
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <p className="text-[12px] text-blue-700 dark:text-blue-400">
                  Fee heads applicable for <strong>{shownFilters.cls}</strong> — {shownFilters.type === '2' ? 'Transport' : 'Regular'} category.
                </p>
              </div>
              <FeeStructureTable data={feeStructure} />
            </div>
          </div>

          {/* ── Student Fee Table (GridView2) ─────────────────────────────── */}
          <div className={`${activeTab === 'students' ? 'block' : 'hidden'} md:block`}>
            <StudentFeeTable students={students} search={search} setSearch={setSearch} />
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-5 text-slate-400 dark:text-slate-600">
          <div className="relative">
            <div className="w-20 h-20 rounded-3xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center">
              <IndianRupee className="w-9 h-9 text-blue-400 dark:text-blue-600" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-center max-w-xs">
            <p className="text-[15px] font-bold text-slate-600 dark:text-slate-400">No report generated yet</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-600 mt-1.5">
              Select session, class, fee type &amp; student type, then click <strong className="text-blue-600 dark:text-blue-400">Show</strong> to generate the report.
            </p>
          </div>
          {/* Quick hint chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-1">
            {['Select Session', 'Select Class', 'Select Type', 'Click Show'].map((step, i) => (
              <span key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">{i+1}</span>
                {step}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
