/**
 * ProductMaster.jsx
 * Folder: src/pages/Tuckshop/ProductMaster.jsx
 *
 * Converts legacy ASPX "Product Detail Master" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Product Group dropdown filter
 *  - Product Name, Max Quantity, Cost Price, Sale Price, Add Quantity inputs
 *  - Auto-calculate margin on cost/sale price change
 *  - Add / Clear / Export actions
 *  - Edit / Delete per row
 *  - Remaining Quantity display (edit mode)
 *  - Desktop: dense ERP-style table
 *  - Mobile: collapsible cards with expandable details
 *  - No horizontal scroll on mobile
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Plus, RefreshCw, Download, Edit2, Trash2,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Package, Tag, Hash, DollarSign, ShoppingCart,
  SlidersHorizontal, Info, Search, BarChart3,
  ChevronRight, TrendingUp, Layers, ArrowUpDown,
  FileSpreadsheet, BoxSelect, Percent, Archive,
  ClipboardList, BadgeCheck, Eye
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const PRODUCT_GROUPS = [
  { id: '1', name: 'Beverages' },
  { id: '2', name: 'Snacks' },
  { id: '3', name: 'Stationery' },
  { id: '4', name: 'Dairy' },
  { id: '5', name: 'Bakery' },
]

const INITIAL_PRODUCTS = [
  { product_id: 'P001', p_id: '1', product_group: 'Beverages', product_name: 'Mango Juice', total_qty: 200, issueqty: 80, rem_qty: 120, add_qty: 50, sell_price: 25, cost_price: 18, product_code: 'MJ001' },
  { product_id: 'P002', p_id: '1', product_group: 'Beverages', product_name: 'Lemon Soda', total_qty: 150, issueqty: 60, rem_qty: 90, add_qty: 30, sell_price: 20, cost_price: 14, product_code: 'LS001' },
  { product_id: 'P003', p_id: '2', product_group: 'Snacks', product_name: 'Potato Chips', total_qty: 300, issueqty: 120, rem_qty: 180, add_qty: 100, sell_price: 15, cost_price: 10, product_code: 'PC001' },
  { product_id: 'P004', p_id: '2', product_group: 'Snacks', product_name: 'Biscuit Pack', total_qty: 250, issueqty: 100, rem_qty: 150, add_qty: 75, sell_price: 10, cost_price: 7, product_code: 'BP001' },
  { product_id: 'P005', p_id: '3', product_group: 'Stationery', product_name: 'Blue Pen', total_qty: 500, issueqty: 200, rem_qty: 300, add_qty: 0, sell_price: 5, cost_price: 3, product_code: 'PEN01' },
  { product_id: 'P006', p_id: '4', product_group: 'Dairy', product_name: 'Milk Packet', total_qty: 100, issueqty: 40, rem_qty: 60, add_qty: 20, sell_price: 30, cost_price: 24, product_code: 'MK001' },
  { product_id: 'P007', p_id: '5', product_group: 'Bakery', product_name: 'Bread Loaf', total_qty: 80, issueqty: 30, rem_qty: 50, add_qty: 10, sell_price: 40, cost_price: 30, product_code: 'BL001' },
]

// ─── GROUP COLOR MAP ──────────────────────────────────────────────────────────
const GROUP_COLORS = {
  'Beverages':  { fg: '#0369a1', bg: '#e0f2fe' },
  'Snacks':     { fg: '#d97706', bg: '#fef3c7' },
  'Stationery': { fg: '#7c3aed', bg: '#ede9fe' },
  'Dairy':      { fg: '#059669', bg: '#d1fae5' },
  'Bakery':     { fg: '#dc2626', bg: '#fee2e2' },
}
const groupColor = (name = '') =>
  GROUP_COLORS[name] || { fg: '#475569', bg: '#f1f5f9' }

const formatAbbr = (name = '') => name.slice(0, 3).toUpperCase()

let _idCounter = 8

// ─── PRIMITIVE COMPONENTS ──────────────────────────────────────────────────────

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

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}{required && <span className="text-rose-500">*</span>}
        {hint && <span className="text-slate-400 normal-case font-normal text-[10px]">({hint})</span>}
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

function TextInput({ value, onChange, placeholder, error, disabled, type = 'text', onBlur }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      placeholder={placeholder}
      disabled={disabled}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-50 dark:disabled:bg-slate-800/50
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        }`}
    />
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

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-6 max-w-sm w-full"
          style={{ animation: 'fadeIn .2s ease' }}>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </span>
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Delete Product</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{message}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[19px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit, onDelete }) {
  const { fg, bg } = groupColor(row.product_group)
  const margin = row.sell_price && row.cost_price
    ? (((row.sell_price - row.cost_price) / row.sell_price) * 100).toFixed(1)
    : '0.0'
  const stockPct = row.total_qty > 0 ? Math.round((row.rem_qty / row.total_qty) * 100) : 0
  const stockColor = stockPct > 50 ? 'bg-emerald-500' : stockPct > 20 ? 'bg-amber-400' : 'bg-rose-500'

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Product Group */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}>
            {formatAbbr(row.product_group)}
          </span>
          <span className="text-[12px] font-medium text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.product_group}</span>
        </div>
      </td>

      {/* Product Name */}
      <td className="px-3 py-3">
        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{row.product_name}</p>
        <p className="text-[10px] text-slate-400 dark:text-slate-500">{row.product_code || row.product_id}</p>
      </td>

      {/* Total Qty */}
      <td className="px-3 py-3 text-center">
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums">{row.total_qty}</span>
      </td>

      {/* Issue Qty */}
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 tabular-nums">{row.issueqty}</span>
      </td>

      {/* Remaining Qty */}
      <td className="px-3 py-3 text-center">
        <div className="flex flex-col items-center gap-1">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[12px] font-semibold tabular-nums
            ${stockPct > 50 ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : stockPct > 20 ? 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
              : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'}`}>
            {row.rem_qty}
          </span>
          <div className="w-12 h-1 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div className={`h-full rounded-full ${stockColor}`} style={{ width: `${stockPct}%` }} />
          </div>
        </div>
      </td>

      {/* Add Qty */}
      <td className="px-3 py-3 text-center">
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">{row.add_qty}</span>
      </td>

      {/* Sell Price */}
      <td className="px-3 py-3 text-center">
        <span className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">₹{row.sell_price}</span>
      </td>

      {/* Cost Price */}
      <td className="px-3 py-3 text-center">
        <div className="flex flex-col items-center">
          <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">₹{row.cost_price}</span>
          <span className="text-[10px] text-violet-600 dark:text-violet-400 font-semibold">{margin}% margin</span>
        </div>
      </td>

      {/* Edit */}
      <td className="px-3 py-3 text-center">
        <button onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors">
          <Edit2 className="w-3 h-3" /> Edit
        </button>
      </td>

      {/* Delete */}
      <td className="px-3 py-3 text-center">
        <button onClick={() => onDelete(row)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
            bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors">
          <Trash2 className="w-3 h-3" /> Del
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE PRODUCT CARD ──────────────────────────────────────────────────────
function MobileCard({ row, idx, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = groupColor(row.product_group)
  const margin = row.sell_price && row.cost_price
    ? (((row.sell_price - row.cost_price) / row.sell_price) * 100).toFixed(1)
    : '0.0'
  const stockPct = row.total_qty > 0 ? Math.round((row.rem_qty / row.total_qty) * 100) : 0
  const stockColor = stockPct > 50 ? 'bg-emerald-500' : stockPct > 20 ? 'bg-amber-400' : 'bg-rose-500'
  const stockLabel = stockPct > 50 ? 'Good Stock' : stockPct > 20 ? 'Low Stock' : 'Critical'
  const stockTextColor = stockPct > 50 ? 'text-emerald-600 dark:text-emerald-400'
    : stockPct > 20 ? 'text-amber-600 dark:text-amber-400'
    : 'text-rose-600 dark:text-rose-400'

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button type="button" onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {formatAbbr(row.product_group)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.product_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{row.product_group} · {row.product_code || row.product_id}</p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[15px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">₹{row.sell_price}</span>
          <span className="text-[10px] text-slate-400">sell price</span>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Stock bar */}
      <div className="px-4 pb-3">
        <div className="flex justify-between text-[10px] font-semibold mb-1">
          <span className={stockTextColor}>{stockLabel} · {stockPct}%</span>
          <span className="text-slate-400">Rem: <span className="font-bold text-slate-600 dark:text-slate-300">{row.rem_qty}</span> / {row.total_qty}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div className={`h-full rounded-full ${stockColor} transition-all`} style={{ width: `${stockPct}%` }} />
        </div>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Price & Margin */}
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 p-3 text-center">
              <ShoppingCart className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
              <p className="text-[18px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">₹{row.sell_price}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400 mt-0.5">Sale Price</p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 p-3 text-center">
              <DollarSign className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto mb-1" />
              <p className="text-[18px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">₹{row.cost_price}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mt-0.5">Cost Price</p>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3 text-center">
              <Percent className="w-4 h-4 text-violet-600 dark:text-violet-400 mx-auto mb-1" />
              <p className="text-[18px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{margin}%</p>
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mt-0.5">Margin</p>
            </div>
          </div>

          {/* Qty Grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Total', value: row.total_qty, color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-500/10' },
              { label: 'Issued', value: row.issueqty, color: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/10' },
              { label: 'Remain', value: row.rem_qty, color: stockTextColor, bg: 'bg-slate-50 dark:bg-slate-800/50' },
              { label: 'Added', value: row.add_qty, color: 'text-slate-700 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800/50' },
            ].map(({ label, value, color, bg: bgg }) => (
              <div key={label} className={`rounded-lg ${bgg} p-2 text-center`}>
                <p className={`text-[17px] font-bold tabular-nums ${color}`}>{value}</p>
                <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={() => onEdit(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => onDelete(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20 transition-all">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── FORM PANEL (Add / Edit) ──────────────────────────────────────────────────
function FormPanel({ form, errors, editMode, onField, onSubmit, onClear, loading, remQty }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${editMode ? 'bg-amber-50 dark:bg-amber-500/10' : 'bg-blue-50 dark:bg-blue-500/10'}`}>
          {editMode ? <Edit2 className="w-4 h-4 text-amber-600 dark:text-amber-400" /> : <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
        </span>
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
          {editMode ? 'Edit Product' : 'Add New Product'}
        </span>
        {editMode && (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
            Edit Mode
          </span>
        )}
      </div>

      <div className="p-5">
        {/* Row 1: Group, Name, Max Qty */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Product Group" required error={errors.product_group}>
            <NativeSelect
              value={form.product_group}
              onChange={e => onField('product_group', e.target.value)}
              placeholder="-- Select Group --"
              error={errors.product_group}
            >
              {PRODUCT_GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Product Name" required error={errors.product_name}>
            <TextInput
              value={form.product_name}
              onChange={e => onField('product_name', e.target.value.replace(/'/g, ''))}
              placeholder="Enter product name"
              error={errors.product_name}
            />
          </Field>

          <Field label="Max Quantity" required error={errors.max_qty} hint="numbers only">
            <TextInput
              value={form.max_qty}
              onChange={e => onField('max_qty', e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              error={errors.max_qty}
              type="text"
              inputMode="numeric"
            />
          </Field>

          <Field label="Cost Price (₹)" required error={errors.cost_price} hint="auto-margin">
            <TextInput
              value={form.cost_price}
              onChange={e => onField('cost_price', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              error={errors.cost_price}
              type="text"
              inputMode="decimal"
            />
          </Field>
        </div>

        {/* Row 2: Sale Price, Add Qty, Remaining (edit only) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Field label="Sale Price (₹)" required error={errors.sale_price}>
            <TextInput
              value={form.sale_price}
              onChange={e => onField('sale_price', e.target.value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              error={errors.sale_price}
              type="text"
              inputMode="decimal"
            />
          </Field>

          <Field label="Add Quantity" hint="optional">
            <TextInput
              value={form.add_qty}
              onChange={e => onField('add_qty', e.target.value.replace(/\D/g, ''))}
              placeholder="0"
              disabled={!editMode}
              type="text"
              inputMode="numeric"
            />
          </Field>

          {/* Margin Preview */}
          {form.cost_price && form.sale_price ? (
            <div className="flex flex-col justify-end">
              <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 px-4 py-2.5 flex items-center gap-2">
                <Percent className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-violet-500 dark:text-violet-400 font-semibold uppercase tracking-wide">Margin</p>
                  <p className="text-[18px] font-bold text-violet-700 dark:text-violet-300 tabular-nums leading-tight">
                    {(((parseFloat(form.sale_price) - parseFloat(form.cost_price)) / parseFloat(form.sale_price)) * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ) : <div />}

          {/* Remaining Qty (edit mode) */}
          {editMode && (
            <div className="flex flex-col justify-end">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-[rgba(99,102,241,0.15)] px-4 py-2.5 flex items-center gap-2">
                <Archive className="w-4 h-4 text-slate-500 flex-shrink-0" />
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wide">Remaining Qty</p>
                  <p className="text-[18px] font-bold text-slate-700 dark:text-slate-200 tabular-nums leading-tight">{remQty}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <button type="button" onClick={onSubmit} disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70">
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : editMode ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editMode ? 'Update Product' : 'Add Product'}
          </button>

          <button type="button" onClick={onClear}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Clear
          </button>

          {editMode && (
            <p className="text-[12px] text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              You are editing an existing product. Clear to cancel.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── EMPTY FORM STATE ─────────────────────────────────────────────────────────
const EMPTY_FORM = {
  product_group: '',
  product_name: '',
  max_qty: '',
  cost_price: '',
  sale_price: '',
  add_qty: '',
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ProductMaster() {
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [errors, setErrors]     = useState({})
  const [loading, setLoading]   = useState(false)
  const [exporting, setExporting] = useState(false)
  const [toast, setToast]       = useState(null)
  const [editRow, setEditRow]   = useState(null) // row being edited
  const [confirmDelete, setConfirmDelete] = useState(null) // row to delete
  const [search, setSearch]     = useState('')
  const [filterGroup, setFilterGroup] = useState('')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Field handler ──────────────────────────────────────────────────────────
  const onField = useCallback((key, val) => {
    setForm(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: undefined }))
  }, [])

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.product_group) e.product_group = 'Select a product group'
    if (!form.product_name.trim()) e.product_name = 'Product name is required'
    if (!form.max_qty) e.max_qty = 'Max quantity is required'
    if (!form.cost_price) e.cost_price = 'Cost price is required'
    if (!form.sale_price) e.sale_price = 'Sale price is required'
    if (parseFloat(form.cost_price) > parseFloat(form.sale_price)) e.sale_price = 'Sale price must be ≥ cost price'
    return e
  }

  // ── Submit (Add / Update) ──────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setLoading(true)
    const groupObj = PRODUCT_GROUPS.find(g => g.id === form.product_group)

    setTimeout(() => {
      if (editRow) {
        // Update
        setProducts(prev => prev.map(p => p.product_id === editRow.product_id ? {
          ...p,
          p_id: form.product_group,
          product_group: groupObj?.name || p.product_group,
          product_name: form.product_name.trim(),
          total_qty: parseInt(form.max_qty) || p.total_qty,
          cost_price: parseFloat(form.cost_price),
          sell_price: parseFloat(form.sale_price),
          add_qty: parseInt(form.add_qty) || 0,
          rem_qty: p.rem_qty + (parseInt(form.add_qty) || 0),
        } : p))
        showToast('Product updated successfully!')
      } else {
        // Add new
        const newProduct = {
          product_id: `P${String(_idCounter++).padStart(3, '0')}`,
          p_id: form.product_group,
          product_group: groupObj?.name || '',
          product_name: form.product_name.trim(),
          total_qty: parseInt(form.max_qty) || 0,
          issueqty: 0,
          rem_qty: parseInt(form.max_qty) || 0,
          add_qty: parseInt(form.add_qty) || 0,
          sell_price: parseFloat(form.sale_price),
          cost_price: parseFloat(form.cost_price),
          product_code: `PRD${_idCounter}`,
        }
        setProducts(prev => [newProduct, ...prev])
        showToast('Product added successfully!')
      }
      setForm(EMPTY_FORM)
      setEditRow(null)
      setErrors({})
      setLoading(false)
    }, 600)
  }, [form, editRow])

  // ── Clear / Cancel Edit ────────────────────────────────────────────────────
  const handleClear = () => {
    setForm(EMPTY_FORM)
    setEditRow(null)
    setErrors({})
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((row) => {
    setEditRow(row)
    setForm({
      product_group: row.p_id,
      product_name: row.product_name,
      max_qty: String(row.total_qty),
      cost_price: String(row.cost_price),
      sale_price: String(row.sell_price),
      add_qty: '',
    })
    setErrors({})
    // Scroll to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteRequest = useCallback((row) => setConfirmDelete(row), [])
  const handleDeleteConfirm = () => {
    setProducts(prev => prev.filter(p => p.product_id !== confirmDelete.product_id))
    showToast(`"${confirmDelete.product_name}" deleted.`, 'success')
    setConfirmDelete(null)
  }

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Export ready! (API integration pending)')
    }, 1200)
  }

  // ── Filter / Search ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchGroup = !filterGroup || p.p_id === filterGroup
      const q = search.toLowerCase()
      const matchSearch = !q || p.product_name.toLowerCase().includes(q) || p.product_group.toLowerCase().includes(q) || (p.product_code || '').toLowerCase().includes(q)
      return matchGroup && matchSearch
    })
  }, [products, search, filterGroup])

  // ── Summary stats ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: filtered.length,
    totalQty: filtered.reduce((s, r) => s + r.total_qty, 0),
    totalRem: filtered.reduce((s, r) => s + r.rem_qty, 0),
    totalSaleValue: filtered.reduce((s, r) => s + r.rem_qty * r.sell_price, 0),
  }), [filtered])

  const remQty = editRow ? editRow.rem_qty : 0

  return (
    <div className="space-y-4 pb-10">
      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Product Detail Master
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage products — add, edit, track stock and pricing.
          </p>
        </div>
        <button type="button" onClick={handleExport} disabled={exporting}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
            bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
            transition-all active:scale-95 disabled:opacity-70 flex-shrink-0 self-start">
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          Export
        </button>
      </div>

      {/* ── Form Panel ──────────────────────────────────────────────────── */}
      <FormPanel
        form={form}
        errors={errors}
        editMode={!!editRow}
        onField={onField}
        onSubmit={handleSubmit}
        onClear={handleClear}
        loading={loading}
        remQty={remQty}
      />

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={ClipboardList} label="Total Products"    value={stats.total}                        color="blue"    />
        <SummaryCard icon={Layers}        label="Total Stock (Qty)" value={stats.totalQty.toLocaleString()}    color="emerald" />
        <SummaryCard icon={Archive}       label="Remaining Stock"   value={stats.totalRem.toLocaleString()}    color="amber"   />
        <SummaryCard icon={TrendingUp}    label="Stock Value (₹)"  value={`₹${(stats.totalSaleValue/1000).toFixed(1)}k`} color="violet" sub="at sale price" />
      </div>

      {/* ── Table / List Card ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header with filters */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Product List</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} records
            </span>
          </div>

          {/* Desktop filters inline */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {/* Group filter */}
            <div className="w-44">
              <NativeSelect value={filterGroup} onChange={e => setFilterGroup(e.target.value)} placeholder="All Groups">
                {PRODUCT_GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </NativeSelect>
            </div>
            {/* Search */}
            <div className="relative w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
                className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600 dark:focus:border-indigo-400" />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {/* Reset */}
            {(search || filterGroup) && (
              <button onClick={() => { setSearch(''); setFilterGroup('') }}
                className="px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 flex items-center gap-1">
                <X className="w-3.5 h-3.5" /> Reset
              </button>
            )}
          </div>

          {/* Mobile: filter + export buttons */}
          <div className="flex sm:hidden gap-2">
            <button type="button" onClick={() => setMobileFilterOpen(true)}
              className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold
                bg-blue-600 text-white dark:bg-indigo-600">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filter {(search || filterGroup) ? '·' : ''}
            </button>
            <button type="button" onClick={handleExport} disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70">
              {exporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No products match your filter.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Product Group', 'Product Name', 'Total Qty', 'Issue Qty', 'Remaining Qty', 'Add Qty', 'Sell Price', 'Cost Price', 'Edit', 'Delete'].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.product_id} row={row} idx={i + 1} onEdit={handleEdit} onDelete={handleDeleteRequest} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {/* Mobile search bar always visible */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products…"
              className="w-full pl-9 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400" />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No products match your filter.</span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a product card to see full details & actions.
              </p>
              {filtered.map((row, i) => (
                <MobileCard key={row.product_id} row={row} idx={i + 1} onEdit={handleEdit} onDelete={handleDeleteRequest} />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{products.length}</span> products
          </p>
          {(search || filterGroup) && (
            <button onClick={() => { setSearch(''); setFilterGroup('') }}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile Filter Drawer ─────────────────────────────────────────── */}
      {mobileFilterOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
          <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
            style={{ animation: 'drawerUp .25s ease' }}>
            <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filter Products</span>
              </div>
              <button onClick={() => setMobileFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-5 space-y-4">
              <Field label="Product Group">
                <NativeSelect value={filterGroup} onChange={e => setFilterGroup(e.target.value)} placeholder="All Groups">
                  {PRODUCT_GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </NativeSelect>
              </Field>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
              <button type="button" onClick={() => { setFilterGroup(''); setMobileFilterOpen(false) }}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                Reset
              </button>
              <button type="button" onClick={() => setMobileFilterOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all">
                <Eye className="w-4 h-4" /> Apply
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Confirm Delete Dialog ─────────────────────────────────────────── */}
      <ConfirmDialog
        open={!!confirmDelete}
        message={confirmDelete ? `Are you sure you want to delete "${confirmDelete.product_name}"? This cannot be undone.` : ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* ── Toast ──────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
