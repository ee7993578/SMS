/**
 * ProductBalanceReport.jsx
 * Folder: src/pages/Reports/Tuckshop/ProductBalanceReport.jsx
 *
 * Converts legacy ASPX "Product Balance Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Product Name, Total Qty, Cost Price, Total C.P,
 *          Issue Qty, Sell Price, Total S.P, Remaining Qty, Total Amt.
 * Features:
 *  - Session dropdown filter
 *  - Show report + Excel export buttons
 *  - Grand total footer row
 *  - Mobile: expandable cards with key metrics
 *  - Desktop: dense ERP-style table with sticky header
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, Info,
  FileSpreadsheet, BarChart3,
  ShoppingCart, Package, TrendingUp, TrendingDown,
  Coins, Tag, Boxes, ChevronRight,
  Building2, MapPin, BadgeIndianRupee
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

/** product_name, total_qty, cost_price, total_cp, issueqty, sp, total_sp, rem_qty, total_amt */
const PRODUCT_DATA = {
  '2022-23': [
    { product_name: 'Biscuit (Parle-G)',     total_qty: 500, cost_price: 5,   total_cp: 2500,  issueqty: 420, sp: 7,   total_sp: 2940,  rem_qty: 80,  total_amt: 400  },
    { product_name: 'Chips (Lays Classic)',  total_qty: 400, cost_price: 10,  total_cp: 4000,  issueqty: 360, sp: 15,  total_sp: 5400,  rem_qty: 40,  total_amt: 400  },
    { product_name: 'Cold Drink (Maaza)',    total_qty: 300, cost_price: 18,  total_cp: 5400,  issueqty: 280, sp: 25,  total_sp: 7000,  rem_qty: 20,  total_amt: 360  },
    { product_name: 'Kurkure (Masala)',      total_qty: 350, cost_price: 10,  total_cp: 3500,  issueqty: 310, sp: 15,  total_sp: 4650,  rem_qty: 40,  total_amt: 400  },
    { product_name: 'Bread Jam Pack',        total_qty: 200, cost_price: 20,  total_cp: 4000,  issueqty: 180, sp: 30,  total_sp: 5400,  rem_qty: 20,  total_amt: 400  },
    { product_name: 'Pencil (Apsara)',       total_qty: 1000,cost_price: 2,   total_cp: 2000,  issueqty: 850, sp: 3,   total_sp: 2550,  rem_qty: 150, total_amt: 300  },
    { product_name: 'Notebook (100pg)',      total_qty: 600, cost_price: 30,  total_cp: 18000, issueqty: 520, sp: 45,  total_sp: 23400, rem_qty: 80,  total_amt: 2400 },
    { product_name: 'Eraser (Faber)',        total_qty: 800, cost_price: 3,   total_cp: 2400,  issueqty: 700, sp: 5,   total_sp: 3500,  rem_qty: 100, total_amt: 300  },
    { product_name: 'Scale (30cm)',          total_qty: 500, cost_price: 8,   total_cp: 4000,  issueqty: 440, sp: 12,  total_sp: 5280,  rem_qty: 60,  total_amt: 480  },
    { product_name: 'Water Bottle (500ml)',  total_qty: 250, cost_price: 35,  total_cp: 8750,  issueqty: 200, sp: 50,  total_sp: 10000, rem_qty: 50,  total_amt: 1750 },
  ],
  '2023-24': [
    { product_name: 'Biscuit (Parle-G)',     total_qty: 600, cost_price: 5,   total_cp: 3000,  issueqty: 530, sp: 7,   total_sp: 3710,  rem_qty: 70,  total_amt: 350  },
    { product_name: 'Chips (Lays Classic)',  total_qty: 450, cost_price: 10,  total_cp: 4500,  issueqty: 400, sp: 15,  total_sp: 6000,  rem_qty: 50,  total_amt: 500  },
    { product_name: 'Cold Drink (Maaza)',    total_qty: 350, cost_price: 18,  total_cp: 6300,  issueqty: 320, sp: 25,  total_sp: 8000,  rem_qty: 30,  total_amt: 540  },
    { product_name: 'Kurkure (Masala)',      total_qty: 400, cost_price: 10,  total_cp: 4000,  issueqty: 360, sp: 15,  total_sp: 5400,  rem_qty: 40,  total_amt: 400  },
    { product_name: 'Bread Jam Pack',        total_qty: 250, cost_price: 22,  total_cp: 5500,  issueqty: 220, sp: 32,  total_sp: 7040,  rem_qty: 30,  total_amt: 660  },
    { product_name: 'Pencil (Apsara)',       total_qty: 1200,cost_price: 2,   total_cp: 2400,  issueqty: 1050,sp: 3,   total_sp: 3150,  rem_qty: 150, total_amt: 300  },
    { product_name: 'Notebook (100pg)',      total_qty: 700, cost_price: 32,  total_cp: 22400, issueqty: 620, sp: 48,  total_sp: 29760, rem_qty: 80,  total_amt: 2560 },
    { product_name: 'Eraser (Faber)',        total_qty: 900, cost_price: 3,   total_cp: 2700,  issueqty: 800, sp: 5,   total_sp: 4000,  rem_qty: 100, total_amt: 300  },
    { product_name: 'Scale (30cm)',          total_qty: 600, cost_price: 9,   total_cp: 5400,  issueqty: 520, sp: 13,  total_sp: 6760,  rem_qty: 80,  total_amt: 720  },
    { product_name: 'Water Bottle (500ml)',  total_qty: 300, cost_price: 38,  total_cp: 11400, issueqty: 260, sp: 55,  total_sp: 14300, rem_qty: 40,  total_amt: 1520 },
    { product_name: 'Geometry Box',         total_qty: 350, cost_price: 55,  total_cp: 19250, issueqty: 300, sp: 80,  total_sp: 24000, rem_qty: 50,  total_amt: 2750 },
  ],
  '2024-25': [
    { product_name: 'Biscuit (Parle-G)',     total_qty: 700, cost_price: 6,   total_cp: 4200,  issueqty: 640, sp: 8,   total_sp: 5120,  rem_qty: 60,  total_amt: 360  },
    { product_name: 'Chips (Lays Classic)',  total_qty: 500, cost_price: 10,  total_cp: 5000,  issueqty: 460, sp: 15,  total_sp: 6900,  rem_qty: 40,  total_amt: 400  },
    { product_name: 'Cold Drink (Maaza)',    total_qty: 400, cost_price: 20,  total_cp: 8000,  issueqty: 370, sp: 28,  total_sp: 10360, rem_qty: 30,  total_amt: 600  },
    { product_name: 'Kurkure (Masala)',      total_qty: 450, cost_price: 10,  total_cp: 4500,  issueqty: 410, sp: 15,  total_sp: 6150,  rem_qty: 40,  total_amt: 400  },
    { product_name: 'Bread Jam Pack',        total_qty: 300, cost_price: 25,  total_cp: 7500,  issueqty: 270, sp: 35,  total_sp: 9450,  rem_qty: 30,  total_amt: 750  },
    { product_name: 'Pencil (Apsara)',       total_qty: 1500,cost_price: 2,   total_cp: 3000,  issueqty: 1300,sp: 3,   total_sp: 3900,  rem_qty: 200, total_amt: 400  },
    { product_name: 'Notebook (100pg)',      total_qty: 800, cost_price: 35,  total_cp: 28000, issueqty: 720, sp: 52,  total_sp: 37440, rem_qty: 80,  total_amt: 2800 },
    { product_name: 'Eraser (Faber)',        total_qty: 1000,cost_price: 3,   total_cp: 3000,  issueqty: 880, sp: 5,   total_sp: 4400,  rem_qty: 120, total_amt: 360  },
    { product_name: 'Scale (30cm)',          total_qty: 700, cost_price: 9,   total_cp: 6300,  issueqty: 620, sp: 14,  total_sp: 8680,  rem_qty: 80,  total_amt: 720  },
    { product_name: 'Water Bottle (500ml)',  total_qty: 350, cost_price: 40,  total_cp: 14000, issueqty: 310, sp: 60,  total_sp: 18600, rem_qty: 40,  total_amt: 1600 },
    { product_name: 'Geometry Box',         total_qty: 400, cost_price: 60,  total_cp: 24000, issueqty: 360, sp: 85,  total_sp: 30600, rem_qty: 40,  total_amt: 2400 },
    { product_name: 'Sketch Pens (12pc)',   total_qty: 300, cost_price: 45,  total_cp: 13500, issueqty: 260, sp: 65,  total_sp: 16900, rem_qty: 40,  total_amt: 1800 },
  ],
  '2025-26': [
    { product_name: 'Biscuit (Parle-G)',     total_qty: 800, cost_price: 6,   total_cp: 4800,  issueqty: 730, sp: 9,   total_sp: 6570,  rem_qty: 70,  total_amt: 420  },
    { product_name: 'Chips (Lays Classic)',  total_qty: 550, cost_price: 12,  total_cp: 6600,  issueqty: 500, sp: 18,  total_sp: 9000,  rem_qty: 50,  total_amt: 600  },
    { product_name: 'Cold Drink (Maaza)',    total_qty: 450, cost_price: 22,  total_cp: 9900,  issueqty: 410, sp: 30,  total_sp: 12300, rem_qty: 40,  total_amt: 880  },
    { product_name: 'Kurkure (Masala)',      total_qty: 500, cost_price: 12,  total_cp: 6000,  issueqty: 450, sp: 18,  total_sp: 8100,  rem_qty: 50,  total_amt: 600  },
    { product_name: 'Bread Jam Pack',        total_qty: 350, cost_price: 28,  total_cp: 9800,  issueqty: 310, sp: 40,  total_sp: 12400, rem_qty: 40,  total_amt: 1120 },
    { product_name: 'Pencil (Apsara)',       total_qty: 1800,cost_price: 2,   total_cp: 3600,  issueqty: 1600,sp: 4,   total_sp: 6400,  rem_qty: 200, total_amt: 400  },
    { product_name: 'Notebook (100pg)',      total_qty: 900, cost_price: 38,  total_cp: 34200, issueqty: 820, sp: 55,  total_sp: 45100, rem_qty: 80,  total_amt: 3040 },
    { product_name: 'Eraser (Faber)',        total_qty: 1100,cost_price: 4,   total_cp: 4400,  issueqty: 980, sp: 6,   total_sp: 5880,  rem_qty: 120, total_amt: 480  },
    { product_name: 'Scale (30cm)',          total_qty: 800, cost_price: 10,  total_cp: 8000,  issueqty: 720, sp: 15,  total_sp: 10800, rem_qty: 80,  total_amt: 800  },
    { product_name: 'Water Bottle (500ml)',  total_qty: 400, cost_price: 45,  total_cp: 18000, issueqty: 360, sp: 65,  total_sp: 23400, rem_qty: 40,  total_amt: 1800 },
    { product_name: 'Geometry Box',         total_qty: 450, cost_price: 65,  total_cp: 29250, issueqty: 400, sp: 95,  total_sp: 38000, rem_qty: 50,  total_amt: 3250 },
    { product_name: 'Sketch Pens (12pc)',   total_qty: 350, cost_price: 48,  total_cp: 16800, issueqty: 310, sp: 70,  total_sp: 21700, rem_qty: 40,  total_amt: 1920 },
    { product_name: 'Sharpener (metal)',    total_qty: 600, cost_price: 5,   total_cp: 3000,  issueqty: 530, sp: 8,   total_sp: 4240,  rem_qty: 70,  total_amt: 350  },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt  = (n) => `₹${Number(n).toLocaleString('en-IN')}`
const fmtN = (n) => Number(n).toLocaleString('en-IN')

/** Profit margin % for a single product */
const margin = (r) =>
  r.total_cp > 0 ? (((r.total_sp - r.total_cp) / r.total_cp) * 100).toFixed(1) : '0.0'

/** Color category by product type (food vs stationery) */
const PRODUCT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const productColor = (name = '') =>
  PRODUCT_COLORS[name.charCodeAt(0) % PRODUCT_COLORS.length]

const abbr = (name = '') =>
  name
    .split(/[\s(]/)[0]
    .slice(0, 3)
    .toUpperCase()

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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, prefix = '' }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight truncate">
          {prefix}{value}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL / REPORT HEADER BANNER ───────────────────────────────────────────
function ReportHeader({ session }) {
  return (
    <div className="rounded-2xl border border-orange-100 dark:border-[rgba(251,146,60,0.2)] bg-gradient-to-r from-orange-50 via-white to-amber-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
        <h2 className="text-[15px] sm:text-[17px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
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
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-orange-700 dark:text-orange-400">
        Tuckshop · Product Balance Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  const { fg, bg } = productColor(row.product_name)
  const pct = margin(row)

  if (isTotal) {
    return (
      <tr className="bg-orange-50 dark:bg-orange-500/[0.06] border-t-2 border-orange-200 dark:border-orange-500/30">
        <td className="px-3 py-3 text-center text-[12px] text-orange-400">—</td>
        <td className="px-3 py-3 font-bold text-[13px] text-orange-700 dark:text-orange-300 flex items-center gap-2 whitespace-nowrap">
          <TrendingUp className="w-4 h-4" /> Grand Total
        </td>
        {/* total_qty */}
        <td className="px-3 py-3 text-center">
          <Pill color="blue">{fmtN(row.total_qty)}</Pill>
        </td>
        {/* cost_price — blank for total */}
        <td className="px-3 py-3 text-center text-slate-400">—</td>
        {/* total_cp */}
        <td className="px-3 py-3 text-center">
          <Pill color="amber">{fmt(row.total_cp)}</Pill>
        </td>
        {/* issueqty */}
        <td className="px-3 py-3 text-center">
          <Pill color="violet">{fmtN(row.issueqty)}</Pill>
        </td>
        {/* sp — blank */}
        <td className="px-3 py-3 text-center text-slate-400">—</td>
        {/* total_sp */}
        <td className="px-3 py-3 text-center">
          <Pill color="emerald">{fmt(row.total_sp)}</Pill>
        </td>
        {/* rem_qty */}
        <td className="px-3 py-3 text-center">
          <Pill color="rose">{fmtN(row.rem_qty)}</Pill>
        </td>
        {/* total_amt */}
        <td className="px-3 py-3 text-center">
          <Pill color="emerald">{fmt(row.total_amt)}</Pill>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>

      {/* Product Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {abbr(row.product_name)}
          </span>
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.product_name}</span>
        </div>
      </td>

      {/* Total Qty */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{fmtN(row.total_qty)}</span>
      </td>

      {/* Cost Price */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-400 tabular-nums">{fmt(row.cost_price)}</span>
      </td>

      {/* Total C.P */}
      <td className="px-3 py-3 text-center">
        <Pill color="amber">{fmt(row.total_cp)}</Pill>
      </td>

      {/* Issue Qty */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-semibold text-violet-700 dark:text-violet-400 tabular-nums">{fmtN(row.issueqty)}</span>
      </td>

      {/* Sell Price */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">{fmt(row.sp)}</span>
      </td>

      {/* Total S.P */}
      <td className="px-3 py-3 text-center">
        <Pill color="emerald">{fmt(row.total_sp)}</Pill>
      </td>

      {/* Remaining Qty */}
      <td className="px-3 py-3 text-center">
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-lg text-[11px] font-bold tabular-nums
          ${row.rem_qty < 50
            ? 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
          }`}>
          {fmtN(row.rem_qty)}
        </span>
      </td>

      {/* Total Amt */}
      <td className="px-3 py-3 text-center">
        <Pill color="emerald">{fmt(row.total_amt)}</Pill>
      </td>
    </tr>
  )
}

/** Tiny colored pill badge */
function Pill({ color, children }) {
  const styles = {
    blue:    'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
    amber:   'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
    violet:  'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
    rose:    'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  }
  return (
    <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold tabular-nums ${styles[color]}`}>
      {children}
    </span>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = productColor(row.product_name)
  const issuePct = row.total_qty ? Math.round((row.issueqty / row.total_qty) * 100) : 0
  const profitAmt = row.total_sp - row.total_cp

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">

      {/* Always-visible header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {abbr(row.product_name)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.product_name}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Qty: <span className="text-slate-600 dark:text-slate-300 font-semibold">{fmtN(row.total_qty)}</span>
            &nbsp;·&nbsp;
            Issued: <span className="text-violet-600 dark:text-violet-400 font-semibold">{fmtN(row.issueqty)}</span>
            &nbsp;·&nbsp;
            Rem: <span className={`font-semibold ${row.rem_qty < 50 ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}`}>{fmtN(row.rem_qty)}</span>
          </p>
        </div>

        {/* Profit indicator */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className={`text-[14px] font-bold tabular-nums ${profitAmt >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            {fmt(row.total_amt)}
          </span>
          <span className="text-[10px] text-slate-400">rem.val</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Issue progress bar */}
      <div className="px-4 pb-3">
        <div className="flex text-[10px] font-semibold justify-between mb-1">
          <span className="text-violet-600 dark:text-violet-400">Issued {issuePct}%</span>
          <span className="text-slate-400">Remaining {100 - issuePct}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-violet-500 transition-all duration-500"
            style={{ width: `${issuePct}%` }}
          />
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Price row */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 text-center">
              <Tag className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-[18px] font-bold text-amber-700 dark:text-amber-300 tabular-nums leading-tight">{fmt(row.cost_price)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-0.5">Cost Price</p>
            </div>
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <BadgeIndianRupee className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[18px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums leading-tight">{fmt(row.sp)}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Sell Price</p>
            </div>
          </div>

          {/* Totals grid */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-lg bg-amber-50/60 dark:bg-amber-500/[0.07] p-2.5 text-center">
              <p className="text-[13px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{fmt(row.total_cp)}</p>
              <p className="text-[9px] font-semibold uppercase text-amber-500 mt-0.5">Total C.P</p>
            </div>
            <div className="rounded-lg bg-emerald-50/60 dark:bg-emerald-500/[0.07] p-2.5 text-center">
              <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(row.total_sp)}</p>
              <p className="text-[9px] font-semibold uppercase text-emerald-500 mt-0.5">Total S.P</p>
            </div>
            <div className="rounded-lg bg-blue-50/60 dark:bg-blue-500/[0.07] p-2.5 text-center">
              <p className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(row.total_amt)}</p>
              <p className="text-[9px] font-semibold uppercase text-blue-500 mt-0.5">Rem. Amt</p>
            </div>
          </div>

          {/* Profit indicator */}
          <div className={`flex items-center justify-between rounded-lg px-3 py-2.5
            ${profitAmt >= 0
              ? 'bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20'
              : 'bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20'}`}>
            {profitAmt >= 0
              ? <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              : <TrendingDown className="w-4 h-4 text-rose-600" />}
            <div className="flex-1 ml-2">
              <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Profit on issued qty
              </p>
            </div>
            <p className={`text-[14px] font-bold tabular-nums
              ${profitAmt >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700'}`}>
              {profitAmt >= 0 ? '+' : ''}{fmt(profitAmt)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, onShow, loading, errors }) {
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
            <SlidersHorizontal className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Session</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
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
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-orange-600 hover:bg-orange-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ProductBalanceReport() {
  const [session,      setSession]      = useState('')
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

  // ── Show report ───────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = PRODUCT_DATA[session] || []
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} products for session ${session}.`)
    }, 650)
  }, [session])

  const handleReset = () => {
    setSession(''); setRows([]); setSearch('')
    setErrors({}); setShown(false); setShownSession('')
  }

  // ── Excel export placeholder ──────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return rows
    const q = search.toLowerCase()
    return rows.filter(r => r.product_name.toLowerCase().includes(q))
  }, [rows, search])

  // ── Grand totals ──────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    total_qty: filtered.reduce((s, r) => s + r.total_qty, 0),
    total_cp:  filtered.reduce((s, r) => s + r.total_cp,  0),
    issueqty:  filtered.reduce((s, r) => s + r.issueqty,  0),
    total_sp:  filtered.reduce((s, r) => s + r.total_sp,  0),
    rem_qty:   filtered.reduce((s, r) => s + r.rem_qty,   0),
    total_amt: filtered.reduce((s, r) => s + r.total_amt, 0),
  }), [filtered])

  const hasResults = shown && rows.length > 0
  const profit = totals.total_sp - totals.total_cp

  const TABLE_HEADERS = [
    'S.No', 'Product Name', 'Total Qty', 'Cost Price',
    'Total C.P', 'Issue Qty', 'Sell Price', 'Total S.P',
    'Rem. Qty', 'Total Amt.'
  ]

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            Product Balance Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tuckshop product-wise stock, pricing &amp; balance summary.
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

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-orange-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
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

            <div /><div />

            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-orange-600 hover:bg-orange-700 shadow-md shadow-orange-500/20
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
            bg-orange-600 text-white shadow-md shadow-orange-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Session'}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        onShow={handleShow}
        loading={loading}
        errors={errors}
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

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Report Banner */}
          <ReportHeader session={shownSession} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <SummaryCard icon={Boxes}       label="Total Stock"    value={fmtN(totals.total_qty)} color="blue"    />
            <SummaryCard icon={Package}     label="Issued Qty"     value={fmtN(totals.issueqty)}  color="violet"  />
            <SummaryCard icon={Tag}         label="Remaining Qty"  value={fmtN(totals.rem_qty)}   color="rose"    />
            <SummaryCard icon={Coins}       label="Total Cost"     value={fmt(totals.total_cp)}   color="amber"   />
            <SummaryCard icon={BadgeIndianRupee} label="Total Revenue" value={fmt(totals.total_sp)} color="emerald" />
            <SummaryCard
              icon={profit >= 0 ? TrendingUp : TrendingDown}
              label="Net Profit"
              value={fmt(Math.abs(profit))}
              color={profit >= 0 ? 'emerald' : 'rose'}
              prefix={profit >= 0 ? '+' : '-'}
            />
          </div>

          {/* Main table card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-orange-500 flex-shrink-0" />
                <ShoppingCart className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Product-wise Balance</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400 flex-shrink-0">
                  {filtered.length} product{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search product…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-orange-400 focus:ring-2 focus:ring-orange-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-orange-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-orange-50/20 dark:bg-orange-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
              <p className="text-[12px] text-orange-700 dark:text-orange-400">
                Rem. Qty highlighted in red when below 50 units. Total Amt. = Remaining Qty × Cost Price.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No products match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {TABLE_HEADERS.map((h, i) => (
                        <th
                          key={i}
                          className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.product_name} row={row} idx={i + 1} />
                    ))}
                    {/* Grand Total row */}
                    <DesktopRow row={totals} idx={0} isTotal />
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No products match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-orange-600 dark:text-orange-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see pricing &amp; profit details.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={row.product_name} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-orange-200 dark:border-orange-500/30 bg-orange-50 dark:bg-orange-500/[0.06] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-orange-700 dark:text-orange-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Products
                    </p>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[18px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{fmtN(totals.total_qty)}</p>
                        <p className="text-[9px] font-semibold text-blue-600 dark:text-blue-400">Total Stock</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[18px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{fmtN(totals.issueqty)}</p>
                        <p className="text-[9px] font-semibold text-violet-600 dark:text-violet-400">Issued Qty</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[18px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{fmt(totals.total_cp)}</p>
                        <p className="text-[9px] font-semibold text-amber-600 dark:text-amber-400">Total Cost</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[18px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmt(totals.total_sp)}</p>
                        <p className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400">Total Revenue</p>
                      </div>
                    </div>

                    {/* Net profit bar */}
                    <div className={`flex items-center justify-between rounded-xl px-4 py-3
                      ${profit >= 0
                        ? 'bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-200 dark:border-emerald-500/25'
                        : 'bg-rose-100 dark:bg-rose-500/15 border border-rose-200 dark:border-rose-500/25'}`}>
                      {profit >= 0
                        ? <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        : <TrendingDown className="w-5 h-5 text-rose-600" />}
                      <div className="flex-1 ml-3">
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Net Profit (issued qty)</p>
                      </div>
                      <p className={`text-[18px] font-bold tabular-nums
                        ${profit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700'}`}>
                        {profit >= 0 ? '+' : '-'}{fmt(Math.abs(profit))}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span>
                {' '}products
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to generate the product balance report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
