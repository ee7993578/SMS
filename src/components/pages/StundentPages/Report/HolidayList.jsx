/**
 * HolidayList.jsx
 * Folder: src/pages/Student/Reports/HolidayList.jsx
 *
 * Converts legacy ASPX "Holiday List" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Holiday, From Date, To Date, Duration (derived)
 * Features:
 *  - Session dropdown filter
 *  - Show report button
 *  - School name / address / session header in report
 *  - Summary cards (total holidays, working days, etc.)
 *  - Mobile: touch-friendly cards with category badges
 *  - Desktop: dense ERP-style table
 *  - Search / filter by holiday name or month
 *  - Excel export placeholder
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, Info,
  FileSpreadsheet, BookOpen, Building2,
  MapPin, Calendar, CalendarDays, CalendarRange,
  Gift, Sun, Moon, Star, Clock,
  TrendingUp, ChevronRight, Sparkles
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Holiday categories for badge display
const HOLIDAY_CATEGORIES = {
  national:  { label: 'National',   color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',   icon: Star    },
  religious: { label: 'Religious',  color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', icon: Moon    },
  festival:  { label: 'Festival',   color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',   icon: Gift    },
  regional:  { label: 'Regional',   color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: Sun },
  winter:    { label: 'Break',      color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/15 dark:text-cyan-400',   icon: Sparkles },
  summer:    { label: 'Break',      color: 'bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400', icon: Sun },
}

// Helper: days between two dates (inclusive)
const daysBetween = (from, to) => {
  const d1 = new Date(from)
  const d2 = new Date(to)
  return Math.round((d2 - d1) / 86400000) + 1
}

// Helper: format date to DD-MMM-YYYY
const fmtDate = (str) => {
  const d = new Date(str)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// Helper: get month name
const monthOf = (str) => new Date(str).toLocaleDateString('en-IN', { month: 'long' })

const HOLIDAYS_DATA = {
  '2022-23': [
    { id: 1,  holiday: 'Republic Day',              from: '2023-01-26', to: '2023-01-26', category: 'national'  },
    { id: 2,  holiday: 'Basant Panchami',            from: '2023-01-26', to: '2023-01-26', category: 'religious' },
    { id: 3,  holiday: 'Mahashivratri',              from: '2023-02-18', to: '2023-02-18', category: 'religious' },
    { id: 4,  holiday: 'Holi',                       from: '2023-03-07', to: '2023-03-08', category: 'festival'  },
    { id: 5,  holiday: 'Good Friday',                from: '2023-04-07', to: '2023-04-07', category: 'religious' },
    { id: 6,  holiday: 'Ram Navami',                 from: '2023-03-30', to: '2023-03-30', category: 'religious' },
    { id: 7,  holiday: 'Dr. B.R. Ambedkar Jayanti',  from: '2023-04-14', to: '2023-04-14', category: 'national'  },
    { id: 8,  holiday: 'Summer Vacation',            from: '2023-05-20', to: '2023-06-25', category: 'summer'    },
    { id: 9,  holiday: 'Eid-ul-Fitr',               from: '2023-04-22', to: '2023-04-22', category: 'religious' },
    { id: 10, holiday: 'Independence Day',           from: '2023-08-15', to: '2023-08-15', category: 'national'  },
    { id: 11, holiday: 'Raksha Bandhan',             from: '2023-08-30', to: '2023-08-30', category: 'festival'  },
    { id: 12, holiday: 'Janmashtami',                from: '2023-09-07', to: '2023-09-07', category: 'religious' },
    { id: 13, holiday: 'Gandhi Jayanti',             from: '2023-10-02', to: '2023-10-02', category: 'national'  },
    { id: 14, holiday: 'Dussehra',                   from: '2023-10-24', to: '2023-10-24', category: 'festival'  },
    { id: 15, holiday: 'Diwali Vacation',            from: '2023-11-12', to: '2023-11-16', category: 'festival'  },
    { id: 16, holiday: 'Guru Nanak Jayanti',         from: '2023-11-27', to: '2023-11-27', category: 'religious' },
    { id: 17, holiday: 'Winter Break',               from: '2023-12-25', to: '2024-01-01', category: 'winter'    },
  ],
  '2023-24': [
    { id: 1,  holiday: 'Republic Day',              from: '2024-01-26', to: '2024-01-26', category: 'national'  },
    { id: 2,  holiday: 'Basant Panchami',            from: '2024-02-14', to: '2024-02-14', category: 'religious' },
    { id: 3,  holiday: 'Mahashivratri',              from: '2024-03-08', to: '2024-03-08', category: 'religious' },
    { id: 4,  holiday: 'Holi',                       from: '2024-03-25', to: '2024-03-26', category: 'festival'  },
    { id: 5,  holiday: 'Good Friday',                from: '2024-03-29', to: '2024-03-29', category: 'religious' },
    { id: 6,  holiday: 'Ram Navami',                 from: '2024-04-17', to: '2024-04-17', category: 'religious' },
    { id: 7,  holiday: 'Dr. B.R. Ambedkar Jayanti',  from: '2024-04-14', to: '2024-04-14', category: 'national'  },
    { id: 8,  holiday: 'Summer Vacation',            from: '2024-05-18', to: '2024-06-22', category: 'summer'    },
    { id: 9,  holiday: 'Eid-ul-Fitr',               from: '2024-04-11', to: '2024-04-11', category: 'religious' },
    { id: 10, holiday: 'Independence Day',           from: '2024-08-15', to: '2024-08-15', category: 'national'  },
    { id: 11, holiday: 'Raksha Bandhan',             from: '2024-08-19', to: '2024-08-19', category: 'festival'  },
    { id: 12, holiday: 'Janmashtami',                from: '2024-08-26', to: '2024-08-26', category: 'religious' },
    { id: 13, holiday: 'Gandhi Jayanti',             from: '2024-10-02', to: '2024-10-02', category: 'national'  },
    { id: 14, holiday: 'Dussehra',                   from: '2024-10-12', to: '2024-10-12', category: 'festival'  },
    { id: 15, holiday: 'Diwali Vacation',            from: '2024-11-01', to: '2024-11-05', category: 'festival'  },
    { id: 16, holiday: 'Guru Nanak Jayanti',         from: '2024-11-15', to: '2024-11-15', category: 'religious' },
    { id: 17, holiday: 'Winter Break',               from: '2024-12-25', to: '2025-01-01', category: 'winter'    },
  ],
  '2024-25': [
    { id: 1,  holiday: 'Republic Day',              from: '2025-01-26', to: '2025-01-26', category: 'national'  },
    { id: 2,  holiday: 'Basant Panchami',            from: '2025-02-02', to: '2025-02-02', category: 'religious' },
    { id: 3,  holiday: 'Mahashivratri',              from: '2025-02-26', to: '2025-02-26', category: 'religious' },
    { id: 4,  holiday: 'Holi',                       from: '2025-03-13', to: '2025-03-14', category: 'festival'  },
    { id: 5,  holiday: 'Good Friday',                from: '2025-04-18', to: '2025-04-18', category: 'religious' },
    { id: 6,  holiday: 'Ram Navami',                 from: '2025-04-06', to: '2025-04-06', category: 'religious' },
    { id: 7,  holiday: 'Dr. B.R. Ambedkar Jayanti',  from: '2025-04-14', to: '2025-04-14', category: 'national'  },
    { id: 8,  holiday: 'Summer Vacation',            from: '2025-05-17', to: '2025-06-21', category: 'summer'    },
    { id: 9,  holiday: 'Eid-ul-Fitr',               from: '2025-03-31', to: '2025-03-31', category: 'religious' },
    { id: 10, holiday: 'Independence Day',           from: '2025-08-15', to: '2025-08-15', category: 'national'  },
    { id: 11, holiday: 'Raksha Bandhan',             from: '2025-08-09', to: '2025-08-09', category: 'festival'  },
    { id: 12, holiday: 'Janmashtami',                from: '2025-08-16', to: '2025-08-16', category: 'religious' },
    { id: 13, holiday: 'Gandhi Jayanti',             from: '2025-10-02', to: '2025-10-02', category: 'national'  },
    { id: 14, holiday: 'Dussehra',                   from: '2025-10-02', to: '2025-10-02', category: 'festival'  },
    { id: 15, holiday: 'Diwali Vacation',            from: '2025-10-20', to: '2025-10-24', category: 'festival'  },
    { id: 16, holiday: 'Guru Nanak Jayanti',         from: '2025-11-05', to: '2025-11-05', category: 'religious' },
    { id: 17, holiday: 'Winter Break',               from: '2025-12-25', to: '2026-01-01', category: 'winter'    },
  ],
  '2025-26': [
    { id: 1,  holiday: 'Republic Day',              from: '2026-01-26', to: '2026-01-26', category: 'national'  },
    { id: 2,  holiday: 'Basant Panchami',            from: '2026-01-23', to: '2026-01-23', category: 'religious' },
    { id: 3,  holiday: 'Mahashivratri',              from: '2026-02-15', to: '2026-02-15', category: 'religious' },
    { id: 4,  holiday: 'Holi',                       from: '2026-03-03', to: '2026-03-04', category: 'festival'  },
    { id: 5,  holiday: 'Good Friday',                from: '2026-04-03', to: '2026-04-03', category: 'religious' },
    { id: 6,  holiday: 'Ram Navami',                 from: '2026-03-26', to: '2026-03-26', category: 'religious' },
    { id: 7,  holiday: 'Dr. B.R. Ambedkar Jayanti',  from: '2026-04-14', to: '2026-04-14', category: 'national'  },
    { id: 8,  holiday: 'Summer Vacation',            from: '2026-05-16', to: '2026-06-20', category: 'summer'    },
    { id: 9,  holiday: 'Eid-ul-Fitr',               from: '2026-03-20', to: '2026-03-20', category: 'religious' },
    { id: 10, holiday: 'Independence Day',           from: '2026-08-15', to: '2026-08-15', category: 'national'  },
    { id: 11, holiday: 'Raksha Bandhan',             from: '2026-08-28', to: '2026-08-28', category: 'festival'  },
    { id: 12, holiday: 'Janmashtami',                from: '2026-08-05', to: '2026-08-05', category: 'religious' },
    { id: 13, holiday: 'Gandhi Jayanti',             from: '2026-10-02', to: '2026-10-02', category: 'national'  },
    { id: 14, holiday: 'Dussehra',                   from: '2026-10-21', to: '2026-10-21', category: 'festival'  },
    { id: 15, holiday: 'Diwali Vacation',            from: '2026-11-08', to: '2026-11-12', category: 'festival'  },
    { id: 16, holiday: 'Guru Nanak Jayanti',         from: '2026-11-24', to: '2026-11-24', category: 'religious' },
    { id: 17, holiday: 'Winter Break',               from: '2026-12-25', to: '2027-01-01', category: 'winter'    },
  ],
}

// Month filter options derived dynamically
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

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

// ─── CATEGORY BADGE ───────────────────────────────────────────────────────────
function CategoryBadge({ category, size = 'sm' }) {
  const cat = HOLIDAY_CATEGORIES[category] || HOLIDAY_CATEGORIES.national
  const IconComp = cat.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${cat.color}`}>
      <IconComp className="w-3 h-3" />
      {cat.label}
    </span>
  )
}

// ─── SUMMARY CARD ─────────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
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

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ session }) {
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
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Holiday List
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const days = daysBetween(row.from, row.to)
  const isMultiDay = days > 1

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Holiday Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10">
            <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{row.holiday}</p>
            <div className="mt-0.5">
              <CategoryBadge category={row.category} />
            </div>
          </div>
        </div>
      </td>

      {/* From Date */}
      <td className="px-4 py-3 text-center">
        <div className="inline-flex flex-col items-center">
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{fmtDate(row.from)}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(row.from).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
        </div>
      </td>

      {/* To Date */}
      <td className="px-4 py-3 text-center">
        <div className="inline-flex flex-col items-center">
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{fmtDate(row.to)}</span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">{new Date(row.to).toLocaleDateString('en-IN', { weekday: 'short' })}</span>
        </div>
      </td>

      {/* Duration */}
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold tabular-nums
          ${isMultiDay
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
          }`}>
          <Clock className="w-3 h-3" />
          {days} {days === 1 ? 'day' : 'days'}
        </span>
      </td>
    </tr>
  )
}

// Grand Total Row
function GrandTotalRow({ total, multiDayCount }) {
  return (
    <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
      <td className="px-4 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
      <td className="px-4 py-3" colSpan={3}>
        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Grand Total
        </span>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
          <Clock className="w-3.5 h-3.5" />
          {total} days
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const days = daysBetween(row.from, row.to)
  const isMultiDay = days > 1
  const cat = HOLIDAY_CATEGORIES[row.category] || HOLIDAY_CATEGORIES.national
  const IconComp = cat.icon

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Icon */}
        <span className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${cat.color}`}>
          <IconComp className="w-5 h-5" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.holiday}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{fmtDate(row.from)}</span>
            {isMultiDay && (
              <>
                <span className="text-slate-300 dark:text-slate-600">→</span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500">{fmtDate(row.to)}</span>
              </>
            )}
          </div>
        </div>

        {/* Duration badge */}
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold tabular-nums
            ${isMultiDay
              ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
            }`}>
            {days}d
          </span>
          <span className="text-[9px] text-slate-400">duration</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {/* From */}
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> From
              </p>
              <p className="text-[14px] font-bold text-emerald-700 dark:text-emerald-300 leading-tight">{fmtDate(row.from)}</p>
              <p className="text-[11px] text-emerald-600/70 dark:text-emerald-400/70">
                {new Date(row.from).toLocaleDateString('en-IN', { weekday: 'long' })}
              </p>
            </div>
            {/* To */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" /> To
              </p>
              <p className="text-[14px] font-bold text-amber-700 dark:text-amber-300 leading-tight">{fmtDate(row.to)}</p>
              <p className="text-[11px] text-amber-600/70 dark:text-amber-400/70">
                {new Date(row.to).toLocaleDateString('en-IN', { weekday: 'long' })}
              </p>
            </div>
          </div>

          {/* Category + Duration row */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CategoryBadge category={row.category} />
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[12px] font-semibold
              ${isMultiDay
                ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}>
              <Clock className="w-3.5 h-3.5" />
              {days} {days === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, month, setMonth, onShow, loading, errors }) {
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
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Filter by Month">
            <NativeSelect value={month} onChange={e => setMonth(e.target.value)} placeholder="All Months">
              {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
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

// ─── MONTH GROUP HEADER (desktop table section divider) ───────────────────────
function MonthDivider({ month }) {
  return (
    <tr>
      <td colSpan={5} className="px-4 pt-4 pb-1.5">
        <div className="flex items-center gap-2">
          <CalendarRange className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{month}</span>
          <div className="flex-1 h-px bg-indigo-100 dark:bg-indigo-500/20" />
        </div>
      </td>
    </tr>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HolidayList() {
  const [session,      setSession]      = useState('')
  const [monthFilter,  setMonthFilter]  = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = HOLIDAYS_DATA[session] || []
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} holidays for session ${session}.`)
    }, 650)
  }, [session])

  const handleReset = () => {
    setSession(''); setRows([]); setSearch('')
    setMonthFilter('')
    setErrors({}); setShown(false); setShownSession('')
  }

  // ── Excel Export placeholder ──────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = rows
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r => r.holiday.toLowerCase().includes(q))
    }
    if (monthFilter) {
      data = data.filter(r => monthOf(r.from) === monthFilter || monthOf(r.to) === monthFilter)
    }
    return data
  }, [rows, search, monthFilter])

  // ── Summary stats ─────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const totalDays = filtered.reduce((s, r) => s + daysBetween(r.from, r.to), 0)
    const multiDay  = filtered.filter(r => daysBetween(r.from, r.to) > 1).length
    const byCategory = {}
    filtered.forEach(r => { byCategory[r.category] = (byCategory[r.category] || 0) + 1 })
    return { totalHolidays: filtered.length, totalDays, multiDay, byCategory }
  }, [filtered])

  // ── Group by month for desktop ────────────────────────────────────────────
  const groupedByMonth = useMemo(() => {
    const map = {}
    filtered.forEach(r => {
      const m = monthOf(r.from)
      if (!map[m]) map[m] = []
      map[m].push(r)
    })
    return map
  }, [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = [session, monthFilter].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Holiday List
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Session-wise list of all holidays — national, religious, festivals &amp; breaks.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
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

            <Field label="Filter by Month">
              <NativeSelect
                value={monthFilter}
                onChange={e => setMonthFilter(e.target.value)}
                placeholder="All Months"
              >
                {MONTHS.map(m => <option key={m} value={m}>{m}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacer */}
            <div />

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

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Session'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
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
        session={session}
        setSession={setSession}
        month={monthFilter}
        setMonth={setMonthFilter}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={CalendarDays}  label="Total Holidays"  value={stats.totalHolidays} color="blue"    />
            <SummaryCard icon={Clock}         label="Total Off Days"  value={stats.totalDays}     color="rose"    sub="incl. multi-day breaks" />
            <SummaryCard icon={CalendarRange} label="Extended Breaks" value={stats.multiDay}      color="amber"   sub="holidays > 1 day" />
            <SummaryCard icon={Star}          label="National Hols."  value={stats.byCategory.national || 0} color="violet" />
          </div>

          {/* Category legend strip */}
          <div className="flex flex-wrap gap-2 px-1">
            {Object.entries(HOLIDAY_CATEGORIES).map(([key, cat]) => {
              const count = stats.byCategory[key] || 0
              if (!count) return null
              const IconComp = cat.icon
              return (
                <span key={key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cat.color}`}>
                  <IconComp className="w-3 h-3" />
                  {cat.label}: {count}
                </span>
              )
            })}
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Holiday Schedule</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} holiday{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search holiday…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
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

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Duration = total calendar days including start and end date. Multi-day breaks shown in red.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No holidays match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Holiday', 'From Date', 'To Date', 'Duration'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Render rows grouped by month */}
                    {Object.entries(groupedByMonth).map(([month, mRows]) => (
                      <>
                        <MonthDivider key={`div-${month}`} month={month} />
                        {mRows.map((row, i) => (
                          <DesktopRow
                            key={row.id}
                            row={row}
                            idx={filtered.indexOf(row) + 1}
                          />
                        ))}
                      </>
                    ))}
                    {/* Grand Total */}
                    <GrandTotalRow total={stats.totalDays} multiDayCount={stats.multiDay} />
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No holidays match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full date details.
                  </p>

                  {/* Group by month on mobile too */}
                  {Object.entries(groupedByMonth).map(([month, mRows]) => (
                    <div key={month} className="space-y-2">
                      {/* Month label */}
                      <div className="flex items-center gap-2 pt-2">
                        <CalendarRange className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 flex-shrink-0" />
                        <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">{month}</span>
                        <div className="flex-1 h-px bg-indigo-100 dark:bg-indigo-500/20" />
                        <span className="text-[10px] text-indigo-400 font-semibold">{mRows.length} holiday{mRows.length !== 1 ? 's' : ''}</span>
                      </div>
                      {mRows.map((row) => (
                        <MobileCard key={row.id} row={row} />
                      ))}
                    </div>
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4 mt-2">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Holidays
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{stats.totalHolidays}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Holidays</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-rose-700 dark:text-rose-300 tabular-nums">{stats.totalDays}</p>
                        <p className="text-[10px] font-semibold text-rose-600 dark:text-rose-400">Total Off Days</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{stats.multiDay}</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Extended Breaks</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{stats.byCategory.national || 0}</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">National Holidays</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> holidays
                &nbsp;·&nbsp;
                <span className="font-semibold text-slate-700 dark:text-slate-300">{stats.totalDays}</span> total off days
              </p>
              {(search || monthFilter) && (
                <button
                  onClick={() => { setSearch(''); setMonthFilter('') }}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear filters
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <CalendarDays className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No holiday list generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to view the holiday list.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
