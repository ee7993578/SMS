/**
 * RemainingProductReport.jsx
 * Folder: src/pages/Reports/Tuckshop/RemainingProductReport.jsx
 *
 * Converts legacy ASPX "Product Remaining Report" (remainingproductreport.aspx) to
 * fully-responsive React + Tailwind.
 *
 * Columns: S.No | Product Group | Product Name | Total Qty | Issue Qty | Remaining Qty | Add Qty
 * Features:
 *  - Session dropdown filter
 *  - Show Report + Excel Export buttons
 *  - Desktop: dense ERP-style table
 *  - Mobile: collapsible cards with stock progress bar
 *  - Grand total footer row
 *  - Search / filter by product name or group
 *  - Loading skeleton + empty state + toast
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, Info,
  FileSpreadsheet, Package, PackageCheck,
  PackageMinus, PackagePlus, Layers,
  ChevronRight, TrendingDown, BarChart3,
  ShoppingCart, Building2,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const PRODUCT_DATA = {
  '2022-23': [
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P001', product_name: 'Chips (Plain)',       product_code: 'CH-PL', total_qty: 500, issueqty: 420, rem_qty: 80,  add_qty: 100 },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P002', product_name: 'Chips (Masala)',      product_code: 'CH-MS', total_qty: 450, issueqty: 390, rem_qty: 60,  add_qty: 80  },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P003', product_name: 'Biscuits (Cream)',    product_code: 'BI-CR', total_qty: 600, issueqty: 540, rem_qty: 60,  add_qty: 120 },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P004', product_name: 'Namkeen Mix',         product_code: 'NK-MX', total_qty: 300, issueqty: 270, rem_qty: 30,  add_qty: 60  },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P005', product_name: 'Cold Drink (200ml)',  product_code: 'CD-SM', total_qty: 800, issueqty: 750, rem_qty: 50,  add_qty: 200 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P006', product_name: 'Cold Drink (500ml)',  product_code: 'CD-LG', total_qty: 400, issueqty: 360, rem_qty: 40,  add_qty: 100 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P007', product_name: 'Water Bottle',        product_code: 'WB-01', total_qty: 1000,issueqty: 920, rem_qty: 80,  add_qty: 300 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P008', product_name: 'Juice Pack',          product_code: 'JP-01', total_qty: 350, issueqty: 300, rem_qty: 50,  add_qty: 100 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P009', product_name: 'Samosa',              product_code: 'SM-01', total_qty: 400, issueqty: 390, rem_qty: 10,  add_qty: 150 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P010', product_name: 'Bread Roll',          product_code: 'BR-01', total_qty: 300, issueqty: 285, rem_qty: 15,  add_qty: 100 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P011', product_name: 'Veg Sandwich',        product_code: 'VS-01', total_qty: 200, issueqty: 190, rem_qty: 10,  add_qty: 80  },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P012', product_name: 'Chocolate Bar',       product_code: 'CB-01', total_qty: 600, issueqty: 520, rem_qty: 80,  add_qty: 150 },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P013', product_name: 'Toffee (Mix)',        product_code: 'TF-MX', total_qty: 1000,issueqty: 860, rem_qty: 140, add_qty: 200 },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P014', product_name: 'Candy (Lemon)',       product_code: 'CN-LM', total_qty: 800, issueqty: 700, rem_qty: 100, add_qty: 200 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P015', product_name: 'Pen (Blue)',          product_code: 'PN-BL', total_qty: 500, issueqty: 460, rem_qty: 40,  add_qty: 100 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P016', product_name: 'Pencil (HB)',         product_code: 'PC-HB', total_qty: 600, issueqty: 550, rem_qty: 50,  add_qty: 100 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P017', product_name: 'Eraser',              product_code: 'ER-01', total_qty: 400, issueqty: 360, rem_qty: 40,  add_qty: 80  },
  ],
  '2023-24': [
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P001', product_name: 'Chips (Plain)',       product_code: 'CH-PL', total_qty: 550, issueqty: 480, rem_qty: 70,  add_qty: 110 },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P002', product_name: 'Chips (Masala)',      product_code: 'CH-MS', total_qty: 500, issueqty: 430, rem_qty: 70,  add_qty: 90  },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P003', product_name: 'Biscuits (Cream)',    product_code: 'BI-CR', total_qty: 650, issueqty: 590, rem_qty: 60,  add_qty: 130 },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P004', product_name: 'Namkeen Mix',         product_code: 'NK-MX', total_qty: 350, issueqty: 310, rem_qty: 40,  add_qty: 70  },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P005', product_name: 'Cold Drink (200ml)',  product_code: 'CD-SM', total_qty: 900, issueqty: 830, rem_qty: 70,  add_qty: 220 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P006', product_name: 'Cold Drink (500ml)',  product_code: 'CD-LG', total_qty: 450, issueqty: 400, rem_qty: 50,  add_qty: 110 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P007', product_name: 'Water Bottle',        product_code: 'WB-01', total_qty: 1100,issueqty:1020, rem_qty: 80,  add_qty: 320 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P008', product_name: 'Juice Pack',          product_code: 'JP-01', total_qty: 400, issueqty: 340, rem_qty: 60,  add_qty: 110 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P009', product_name: 'Samosa',              product_code: 'SM-01', total_qty: 450, issueqty: 435, rem_qty: 15,  add_qty: 160 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P010', product_name: 'Bread Roll',          product_code: 'BR-01', total_qty: 340, issueqty: 320, rem_qty: 20,  add_qty: 110 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P011', product_name: 'Veg Sandwich',        product_code: 'VS-01', total_qty: 220, issueqty: 205, rem_qty: 15,  add_qty: 90  },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P012', product_name: 'Chocolate Bar',       product_code: 'CB-01', total_qty: 650, issueqty: 570, rem_qty: 80,  add_qty: 160 },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P013', product_name: 'Toffee (Mix)',        product_code: 'TF-MX', total_qty: 1100,issueqty: 950, rem_qty: 150, add_qty: 220 },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P014', product_name: 'Candy (Lemon)',       product_code: 'CN-LM', total_qty: 850, issueqty: 750, rem_qty: 100, add_qty: 210 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P015', product_name: 'Pen (Blue)',          product_code: 'PN-BL', total_qty: 550, issueqty: 510, rem_qty: 40,  add_qty: 110 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P016', product_name: 'Pencil (HB)',         product_code: 'PC-HB', total_qty: 650, issueqty: 600, rem_qty: 50,  add_qty: 110 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P017', product_name: 'Eraser',              product_code: 'ER-01', total_qty: 440, issueqty: 400, rem_qty: 40,  add_qty: 90  },
  ],
  '2024-25': [
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P001', product_name: 'Chips (Plain)',       product_code: 'CH-PL', total_qty: 600, issueqty: 530, rem_qty: 70,  add_qty: 120 },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P002', product_name: 'Chips (Masala)',      product_code: 'CH-MS', total_qty: 560, issueqty: 490, rem_qty: 70,  add_qty: 100 },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P003', product_name: 'Biscuits (Cream)',    product_code: 'BI-CR', total_qty: 700, issueqty: 640, rem_qty: 60,  add_qty: 140 },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P004', product_name: 'Namkeen Mix',         product_code: 'NK-MX', total_qty: 380, issueqty: 340, rem_qty: 40,  add_qty: 80  },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P005', product_name: 'Cold Drink (200ml)',  product_code: 'CD-SM', total_qty: 950, issueqty: 880, rem_qty: 70,  add_qty: 240 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P006', product_name: 'Cold Drink (500ml)',  product_code: 'CD-LG', total_qty: 500, issueqty: 450, rem_qty: 50,  add_qty: 120 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P007', product_name: 'Water Bottle',        product_code: 'WB-01', total_qty: 1200,issueqty:1110, rem_qty: 90,  add_qty: 350 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P008', product_name: 'Juice Pack',          product_code: 'JP-01', total_qty: 430, issueqty: 370, rem_qty: 60,  add_qty: 120 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P009', product_name: 'Samosa',              product_code: 'SM-01', total_qty: 500, issueqty: 488, rem_qty: 12,  add_qty: 180 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P010', product_name: 'Bread Roll',          product_code: 'BR-01', total_qty: 380, issueqty: 358, rem_qty: 22,  add_qty: 120 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P011', product_name: 'Veg Sandwich',        product_code: 'VS-01', total_qty: 250, issueqty: 238, rem_qty: 12,  add_qty: 100 },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P012', product_name: 'Chocolate Bar',       product_code: 'CB-01', total_qty: 700, issueqty: 620, rem_qty: 80,  add_qty: 170 },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P013', product_name: 'Toffee (Mix)',        product_code: 'TF-MX', total_qty: 1200,issueqty:1040, rem_qty: 160, add_qty: 240 },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P014', product_name: 'Candy (Lemon)',       product_code: 'CN-LM', total_qty: 900, issueqty: 800, rem_qty: 100, add_qty: 220 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P015', product_name: 'Pen (Blue)',          product_code: 'PN-BL', total_qty: 600, issueqty: 558, rem_qty: 42,  add_qty: 120 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P016', product_name: 'Pencil (HB)',         product_code: 'PC-HB', total_qty: 700, issueqty: 648, rem_qty: 52,  add_qty: 120 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P017', product_name: 'Eraser',              product_code: 'ER-01', total_qty: 480, issueqty: 438, rem_qty: 42,  add_qty: 100 },
  ],
  '2025-26': [
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P001', product_name: 'Chips (Plain)',       product_code: 'CH-PL', total_qty: 650, issueqty: 580, rem_qty: 70,  add_qty: 130 },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P002', product_name: 'Chips (Masala)',      product_code: 'CH-MS', total_qty: 600, issueqty: 530, rem_qty: 70,  add_qty: 110 },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P003', product_name: 'Biscuits (Cream)',    product_code: 'BI-CR', total_qty: 750, issueqty: 690, rem_qty: 60,  add_qty: 150 },
    { p_id: 'PG01', product_group: 'Snacks',     product_id: 'P004', product_name: 'Namkeen Mix',         product_code: 'NK-MX', total_qty: 420, issueqty: 376, rem_qty: 44,  add_qty: 90  },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P005', product_name: 'Cold Drink (200ml)',  product_code: 'CD-SM', total_qty:1000, issueqty: 930, rem_qty: 70,  add_qty: 260 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P006', product_name: 'Cold Drink (500ml)',  product_code: 'CD-LG', total_qty: 550, issueqty: 498, rem_qty: 52,  add_qty: 130 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P007', product_name: 'Water Bottle',        product_code: 'WB-01', total_qty:1300, issueqty:1206, rem_qty: 94,  add_qty: 380 },
    { p_id: 'PG02', product_group: 'Beverages',  product_id: 'P008', product_name: 'Juice Pack',          product_code: 'JP-01', total_qty: 460, issueqty: 400, rem_qty: 60,  add_qty: 130 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P009', product_name: 'Samosa',              product_code: 'SM-01', total_qty: 550, issueqty: 540, rem_qty: 10,  add_qty: 200 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P010', product_name: 'Bread Roll',          product_code: 'BR-01', total_qty: 420, issueqty: 395, rem_qty: 25,  add_qty: 130 },
    { p_id: 'PG03', product_group: 'Meals',      product_id: 'P011', product_name: 'Veg Sandwich',        product_code: 'VS-01', total_qty: 280, issueqty: 265, rem_qty: 15,  add_qty: 110 },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P012', product_name: 'Chocolate Bar',       product_code: 'CB-01', total_qty: 750, issueqty: 668, rem_qty: 82,  add_qty: 180 },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P013', product_name: 'Toffee (Mix)',        product_code: 'TF-MX', total_qty:1300, issueqty:1138, rem_qty: 162, add_qty: 260 },
    { p_id: 'PG04', product_group: 'Sweets',     product_id: 'P014', product_name: 'Candy (Lemon)',       product_code: 'CN-LM', total_qty: 950, issueqty: 848, rem_qty: 102, add_qty: 240 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P015', product_name: 'Pen (Blue)',          product_code: 'PN-BL', total_qty: 650, issueqty: 606, rem_qty: 44,  add_qty: 130 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P016', product_name: 'Pencil (HB)',         product_code: 'PC-HB', total_qty: 750, issueqty: 696, rem_qty: 54,  add_qty: 130 },
    { p_id: 'PG05', product_group: 'Stationery', product_id: 'P017', product_name: 'Eraser',              product_code: 'ER-01', total_qty: 520, issueqty: 476, rem_qty: 44,  add_qty: 110 },
  ],
}

// ─── GROUP COLOR MAP ─────────────────────────────────────────────────────────
const GROUP_COLORS = {
  Snacks:     { fg: '#b45309', bg: '#fef3c7', dot: 'bg-amber-500'    },
  Beverages:  { fg: '#0369a1', bg: '#e0f2fe', dot: 'bg-sky-500'      },
  Meals:      { fg: '#059669', bg: '#d1fae5', dot: 'bg-emerald-500'  },
  Sweets:     { fg: '#7c3aed', bg: '#ede9fe', dot: 'bg-violet-500'   },
  Stationery: { fg: '#dc2626', bg: '#fee2e2', dot: 'bg-rose-500'     },
}

// Remaining qty badge: red if <20, amber if <50, green otherwise
const stockStatus = (rem, total) => {
  const pct = total ? (rem / total) * 100 : 0
  if (pct < 10) return { cls: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400',       label: 'Low' }
  if (pct < 25) return { cls: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', label: 'Mid' }
  return           { cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400', label: 'OK' }
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

// ─── SUMMARY STAT CARD ───────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, colorKey }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[colorKey]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value.toLocaleString()}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── GROUP BADGE ─────────────────────────────────────────────────────────────
function GroupBadge({ group }) {
  const c = GROUP_COLORS[group] || { fg: '#334155', bg: '#f1f5f9', dot: 'bg-slate-400' }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold"
      style={{ background: c.bg, color: c.fg }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} flex-shrink-0`} />
      {group}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isTotal }) {
  if (isTotal) {
    return (
      <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
        <td className="px-4 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
        <td className="px-4 py-3" colSpan={2}>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
            <TrendingDown className="w-4 h-4" /> Grand Total
          </span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">{row.total_qty.toLocaleString()}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 tabular-nums">{row.issueqty.toLocaleString()}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 tabular-nums">{row.rem_qty.toLocaleString()}</span>
        </td>
        <td className="px-4 py-3 text-center">
          <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300 tabular-nums">{row.add_qty.toLocaleString()}</span>
        </td>
      </tr>
    )
  }

  const st = stockStatus(row.rem_qty, row.total_qty)
  const remPct = row.total_qty ? Math.round((row.rem_qty / row.total_qty) * 100) : 0

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Product Group */}
      <td className="px-4 py-3">
        <GroupBadge group={row.product_group} />
      </td>

      {/* Product Name */}
      <td className="px-4 py-3">
        <div>
          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.product_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{row.product_code}</p>
        </div>
      </td>

      {/* Total Qty */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
          {row.total_qty.toLocaleString()}
        </span>
      </td>

      {/* Issue Qty */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 tabular-nums">
          {row.issueqty.toLocaleString()}
        </span>
      </td>

      {/* Remaining Qty */}
      <td className="px-4 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className={`inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-bold tabular-nums ${st.cls}`}>
            {row.rem_qty.toLocaleString()}
          </span>
          {/* mini progress */}
          <div className="w-16 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                remPct < 10 ? 'bg-red-500' : remPct < 25 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${remPct}%` }}
            />
          </div>
        </div>
      </td>

      {/* Add Qty */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 tabular-nums">
          {row.add_qty.toLocaleString()}
        </span>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const st = stockStatus(row.rem_qty, row.total_qty)
  const remPct = row.total_qty ? Math.round((row.rem_qty / row.total_qty) * 100) : 0
  const issuePct = row.total_qty ? Math.round((row.issueqty / row.total_qty) * 100) : 0
  const c = GROUP_COLORS[row.product_group] || { fg: '#334155', bg: '#f1f5f9' }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Group color indicator */}
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: c.bg }}
        >
          <Package className="w-4 h-4" style={{ color: c.fg }} />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.product_name}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{row.product_code}</p>
        </div>

        {/* Remaining badge */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className={`text-[16px] font-bold tabular-nums ${
            remPct < 10 ? 'text-red-600 dark:text-red-400' :
            remPct < 25 ? 'text-amber-600 dark:text-amber-400' :
            'text-emerald-600 dark:text-emerald-400'
          }`}>{row.rem_qty}</span>
          <span className="text-[10px] text-slate-400">remaining</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Group tag + progress bar: always visible */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <GroupBadge group={row.product_group} />
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${st.cls}`}>
            {st.label} · {remPct}% left
          </span>
        </div>
        {/* Issue vs remaining bar */}
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-amber-400 transition-all duration-500"
            style={{ width: `${issuePct}%` }}
          />
        </div>
        <div className="flex text-[10px] font-semibold justify-between mt-1">
          <span className="text-amber-600 dark:text-amber-400">Issued {issuePct}%</span>
          <span className={remPct < 10 ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}>Rem {remPct}%</span>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {/* Total */}
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3 text-center">
              <Package className="w-4 h-4 text-blue-600 dark:text-blue-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums leading-tight">{row.total_qty.toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mt-0.5">Total Qty</p>
            </div>
            {/* Issue */}
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 text-center">
              <PackageMinus className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums leading-tight">{row.issueqty.toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-0.5">Issue Qty</p>
            </div>
            {/* Remaining */}
            <div className={`rounded-xl border p-3 text-center ${
              remPct < 10
                ? 'bg-red-50 dark:bg-red-500/10 border-red-100 dark:border-red-500/20'
                : remPct < 25
                ? 'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20'
                : 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20'
            }`}>
              <PackageCheck className="w-4 h-4 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
              <p className="text-[22px] font-bold tabular-nums leading-tight text-emerald-700 dark:text-emerald-300">{row.rem_qty.toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Remaining</p>
            </div>
            {/* Add Qty */}
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3 text-center">
              <PackagePlus className="w-4 h-4 text-violet-600 dark:text-violet-400 mx-auto mb-1" />
              <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums leading-tight">{row.add_qty.toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mt-0.5">Add Qty</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ────────────────────────────────────────────────────
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
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
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
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function RemainingProductReport() {
  const [session,      setSession]      = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [groupFilter,  setGroupFilter]  = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // unique groups from loaded rows
  const availableGroups = useMemo(() =>
    [...new Set(rows.map(r => r.product_group))], [rows])

  // ── Fetch (simulate API) ─────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setGroupFilter('')

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
    setSession(''); setRows([]); setSearch(''); setGroupFilter('')
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

  // ── Search + group filter ─────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = rows
    if (groupFilter) data = data.filter(r => r.product_group === groupFilter)
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r =>
        r.product_name.toLowerCase().includes(q) ||
        r.product_group.toLowerCase().includes(q) ||
        r.product_code.toLowerCase().includes(q)
      )
    }
    return data
  }, [rows, search, groupFilter])

  // ── Totals ────────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    total_qty: filtered.reduce((s, r) => s + r.total_qty, 0),
    issueqty:  filtered.reduce((s, r) => s + r.issueqty,  0),
    rem_qty:   filtered.reduce((s, r) => s + r.rem_qty,   0),
    add_qty:   filtered.reduce((s, r) => s + r.add_qty,   0),
  }), [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = session ? 1 : 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Product Remaining Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Tuckshop stock overview — total, issued, remaining &amp; add quantity per product.
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

            {/* Spacers */}
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

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────── */}
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
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Package}      label="Total Qty"      value={totals.total_qty} colorKey="blue"    />
            <SummaryCard icon={PackageMinus} label="Issue Qty"      value={totals.issueqty}  colorKey="amber"   />
            <SummaryCard icon={PackageCheck} label="Remaining Qty"  value={totals.rem_qty}   colorKey="emerald" />
            <SummaryCard icon={PackagePlus}  label="Add Qty"        value={totals.add_qty}   colorKey="violet"  />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Product Stock</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} product{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search + group filter row */}
              <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
                {/* Group filter pills (desktop) */}
                <div className="hidden sm:flex gap-1 flex-wrap">
                  <button
                    onClick={() => setGroupFilter('')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                      !groupFilter
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >All</button>
                  {availableGroups.map(g => (
                    <button
                      key={g}
                      onClick={() => setGroupFilter(g === groupFilter ? '' : g)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                        groupFilter === g
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >{g}</button>
                  ))}
                </div>

                {/* Search */}
                <div className="relative flex-1 sm:w-44 sm:flex-initial">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search product…"
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
            </div>

            {/* Mobile group filter chips */}
            {hasResults && (
              <div className="flex sm:hidden gap-2 px-4 pt-3 pb-1 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => setGroupFilter('')}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                    !groupFilter
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >All</button>
                {availableGroups.map(g => (
                  <button
                    key={g}
                    onClick={() => setGroupFilter(g === groupFilter ? '' : g)}
                    className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-colors ${
                      groupFilter === g
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >{g}</button>
                ))}
              </div>
            )}

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Stock progress bar shows remaining % against total. Red = critical (&lt;10%), Amber = low (&lt;25%), Green = healthy.
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
                      {['S.No.', 'Product Group', 'Product Name', 'Total Qty', 'Issue Qty', 'Remaining Qty', 'Add Qty'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.product_id} row={row} idx={i + 1} />
                    ))}
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
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full stock details.
                  </p>

                  {filtered.map((row) => (
                    <MobileCard key={row.product_id} row={row} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Grand Total — {filtered.length} Products
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.total_qty.toLocaleString()}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Qty</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[20px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{totals.issueqty.toLocaleString()}</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Issue Qty</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[20px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{totals.rem_qty.toLocaleString()}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Remaining Qty</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[20px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{totals.add_qty.toLocaleString()}</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Add Qty</p>
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
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> products
              </p>
              {(search || groupFilter) && (
                <button onClick={() => { setSearch(''); setGroupFilter('') }}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
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
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to generate the product remaining report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
