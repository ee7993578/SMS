/**
 * IndentFormApprovalPrincipal.jsx
 * Folder: src/pages/Indent/IndentFormApprovalPrincipal.jsx
 *
 * Converts legacy ASPX "Indent Form Approval Principal" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session + Status dropdown filters
 *  - Expandable nested item details (like ASPX divexpandcollapse)
 *  - HOD / Principal status columns
 *  - Approve / Reject action button per row
 *  - Remark textbox per row
 *  - Desktop: data-dense ERP table
 *  - Mobile: stacked cards with expandable item detail accordion
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Search,
  FileText, ClipboardList, Package, Users, ShieldCheck,
  CheckCircle2, XCircle, Clock, Building2, User, Info,
  MessageSquare, Hash, Tag, TrendingUp, RotateCcw
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const STATUS_OPTIONS = [
  { value: '0', label: 'Select All Status' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Not Approved', label: 'Not Approved' },
]

// Dummy indent items nested inside each indent form
const makeItems = (indentno) => [
  {
    itemdesc: 'A4 Size Paper (500 Sheets Bundle)',
    itemqty: 10,
    price: 250,
    totalamount: 2500,
    department: 'Administration',
    reason_purpose: 'For office printing and documentation work.',
  },
  {
    itemdesc: 'Whiteboard Markers (Pack of 12)',
    itemqty: 5,
    price: 180,
    totalamount: 900,
    department: 'Science Department',
    reason_purpose: 'Required for classroom teaching aids.',
  },
  {
    itemdesc: 'Stapler with Pins Set',
    itemqty: 3,
    price: 120,
    totalamount: 360,
    department: 'Library',
    reason_purpose: 'Binding of library registers.',
  },
]

const INDENT_DATA = {
  '2022-23': [
    { indentformid: 1, indentno: 'IF-2022-001', name: 'Mr. Anil Kumar',    headofdepartment: 'Dr. Sharma',   headofdepartment_approvalstatus: 'Approved',     status: 'Approved',     principal_approval: 'Approved',     remark: 'Good.' },
    { indentformid: 2, indentno: 'IF-2022-002', name: 'Mrs. Priya Singh',  headofdepartment: 'Mr. Verma',    headofdepartment_approvalstatus: 'Approved',     status: 'Not Approved', principal_approval: 'Not Approved', remark: '' },
    { indentformid: 3, indentno: 'IF-2022-003', name: 'Mr. Ramesh Gupta',  headofdepartment: 'Mrs. Kapoor',  headofdepartment_approvalstatus: 'Not Approved', status: 'Not Approved', principal_approval: 'Not Approved', remark: '' },
    { indentformid: 4, indentno: 'IF-2022-004', name: 'Ms. Sunita Yadav',  headofdepartment: 'Dr. Sharma',   headofdepartment_approvalstatus: 'Approved',     status: 'Approved',     principal_approval: 'Approved',     remark: 'Sanctioned.' },
  ],
  '2023-24': [
    { indentformid: 5,  indentno: 'IF-2023-001', name: 'Mr. Deepak Mishra',  headofdepartment: 'Mr. Verma',   headofdepartment_approvalstatus: 'Approved',     status: 'Approved',     principal_approval: 'Approved',     remark: 'Ok.' },
    { indentformid: 6,  indentno: 'IF-2023-002', name: 'Mrs. Kavita Joshi',  headofdepartment: 'Mrs. Kapoor', headofdepartment_approvalstatus: 'Approved',     status: 'Not Approved', principal_approval: 'Not Approved', remark: '' },
    { indentformid: 7,  indentno: 'IF-2023-003', name: 'Mr. Suresh Tiwari',  headofdepartment: 'Dr. Sharma',  headofdepartment_approvalstatus: 'Not Approved', status: 'Not Approved', principal_approval: 'Not Approved', remark: '' },
    { indentformid: 8,  indentno: 'IF-2023-004', name: 'Ms. Meena Patel',    headofdepartment: 'Mr. Verma',   headofdepartment_approvalstatus: 'Approved',     status: 'Approved',     principal_approval: 'Approved',     remark: 'Approved with note.' },
    { indentformid: 9,  indentno: 'IF-2023-005', name: 'Mr. Vikas Soni',     headofdepartment: 'Mrs. Kapoor', headofdepartment_approvalstatus: 'Approved',     status: 'Not Approved', principal_approval: 'Not Approved', remark: '' },
    { indentformid: 10, indentno: 'IF-2023-006', name: 'Mrs. Nita Rawat',    headofdepartment: 'Dr. Sharma',  headofdepartment_approvalstatus: 'Not Approved', status: 'Not Approved', principal_approval: 'Not Approved', remark: '' },
  ],
  '2024-25': [
    { indentformid: 11, indentno: 'IF-2024-001', name: 'Mr. Arvind Shah',     headofdepartment: 'Mr. Verma',   headofdepartment_approvalstatus: 'Approved',     status: 'Not Approved', principal_approval: 'Approve',      remark: '' },
    { indentformid: 12, indentno: 'IF-2024-002', name: 'Ms. Pooja Chauhan',   headofdepartment: 'Mrs. Kapoor', headofdepartment_approvalstatus: 'Approved',     status: 'Not Approved', principal_approval: 'Approve',      remark: '' },
    { indentformid: 13, indentno: 'IF-2024-003', name: 'Mr. Rajesh Pandey',   headofdepartment: 'Dr. Sharma',  headofdepartment_approvalstatus: 'Approved',     status: 'Not Approved', principal_approval: 'Approve',      remark: '' },
    { indentformid: 14, indentno: 'IF-2024-004', name: 'Mrs. Anita Mathur',   headofdepartment: 'Mr. Verma',   headofdepartment_approvalstatus: 'Not Approved', status: 'Not Approved', principal_approval: 'Approve',      remark: '' },
    { indentformid: 15, indentno: 'IF-2024-005', name: 'Mr. Karan Bajaj',     headofdepartment: 'Mrs. Kapoor', headofdepartment_approvalstatus: 'Approved',     status: 'Not Approved', principal_approval: 'Approve',      remark: '' },
  ],
  '2025-26': [
    { indentformid: 16, indentno: 'IF-2025-001', name: 'Ms. Ritu Saxena',     headofdepartment: 'Dr. Sharma',  headofdepartment_approvalstatus: 'Approved',     status: 'Not Approved', principal_approval: 'Approve',      remark: '' },
    { indentformid: 17, indentno: 'IF-2025-002', name: 'Mr. Sunil Dubey',     headofdepartment: 'Mr. Verma',   headofdepartment_approvalstatus: 'Approved',     status: 'Not Approved', principal_approval: 'Approve',      remark: '' },
    { indentformid: 18, indentno: 'IF-2025-003', name: 'Mrs. Geeta Malhotra', headofdepartment: 'Mrs. Kapoor', headofdepartment_approvalstatus: 'Not Approved', status: 'Not Approved', principal_approval: 'Approve',      remark: '' },
  ],
}

// Attach items to each row
const attachItems = (rows) => rows.map(r => ({ ...r, items: makeItems(r.indentno) }))

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const statusMeta = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'approved')
    return { color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', icon: CheckCircle2 }
  if (s === 'not approved')
    return { color: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400', icon: XCircle }
  return { color: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400', icon: Clock }
}

const totalAmount = (items) => items.reduce((s, i) => s + i.totalamount, 0)

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

function SummaryCard({ icon: Icon, label, value, color }) {
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
      </div>
    </div>
  )
}

// ─── ITEMS SUB-TABLE (Desktop expand) ─────────────────────────────────────────

function ItemsSubTable({ items }) {
  return (
    <div className="bg-slate-50 dark:bg-[#151929] border border-slate-200 dark:border-[rgba(99,102,241,0.15)] rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-200 dark:border-[rgba(99,102,241,0.12)]">
        <Package className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Item Details</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="border-b border-slate-200 dark:border-[rgba(99,102,241,0.1)]">
              {['Item Description', 'Qty', 'Price (₹)', 'Total (₹)', 'Department', 'Reason / Purpose'].map((h, i) => (
                <th key={i} className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] last:border-0">
                <td className="px-3 py-2 text-slate-700 dark:text-slate-200 font-medium">{item.itemdesc}</td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300 tabular-nums">{item.itemqty}</td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300 tabular-nums">₹{item.price.toLocaleString()}</td>
                <td className="px-3 py-2 font-semibold text-blue-700 dark:text-blue-400 tabular-nums">₹{item.totalamount.toLocaleString()}</td>
                <td className="px-3 py-2 text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.department}</td>
                <td className="px-3 py-2 text-slate-500 dark:text-slate-400 max-w-[200px]">{item.reason_purpose}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-end gap-2 px-4 py-2 border-t border-slate-200 dark:border-[rgba(99,102,241,0.1)]">
        <span className="text-[11px] text-slate-400">Grand Total:</span>
        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">
          ₹{items.reduce((s, i) => s + i.totalamount, 0).toLocaleString()}
        </span>
      </div>
    </div>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const { color, icon: Icon } = statusMeta(status)
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${color}`}>
      <Icon className="w-3 h-3 flex-shrink-0" />
      {status || '—'}
    </span>
  )
}

// ─── APPROVE BUTTON ──────────────────────────────────────────────────────────

function ApproveBtn({ currentStatus, onToggle, loading }) {
  const isApproved = currentStatus === 'Approved'
  return (
    <button
      onClick={onToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-95 disabled:opacity-60 whitespace-nowrap
        ${isApproved
          ? 'bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/15 dark:text-rose-400 dark:hover:bg-rose-500/25'
          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:hover:bg-emerald-500/25'
        }`}
    >
      {loading
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : isApproved
          ? <><XCircle className="w-3.5 h-3.5" /> Revoke</>
          : <><CheckCircle2 className="w-3.5 h-3.5" /> Approve</>
      }
    </button>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, sno, onApprove, onRemarkChange, savingId }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        {/* SNO */}
        <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{sno}</td>

        {/* Expand toggle */}
        <td className="px-3 py-3 text-center w-10">
          <button
            onClick={() => setExpanded(p => !p)}
            className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            title="View items"
          >
            <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </td>

        {/* Indent No */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Hash className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            </span>
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.indentno}</span>
          </div>
        </td>

        {/* Faculty Name */}
        <td className="px-3 py-3">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            </span>
            <span className="text-[13px] text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
          </div>
        </td>

        {/* HOD */}
        <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">
          {row.headofdepartment}
        </td>

        {/* HOD Status */}
        <td className="px-3 py-3">
          <StatusBadge status={row.headofdepartment_approvalstatus} />
        </td>

        {/* Principal Status */}
        <td className="px-3 py-3">
          <StatusBadge status={row.status} />
        </td>

        {/* Action */}
        <td className="px-3 py-3">
          <ApproveBtn
            currentStatus={row.status}
            onToggle={() => onApprove(row.indentformid)}
            loading={savingId === row.indentformid}
          />
        </td>

        {/* Remark */}
        <td className="px-3 py-3 min-w-[160px]">
          <input
            type="text"
            value={row.remark}
            onChange={e => onRemarkChange(row.indentformid, e.target.value)}
            placeholder="Add remark…"
            className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
              bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200
              placeholder-slate-300 dark:placeholder-slate-600
              focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20 transition-all"
          />
        </td>

        {/* Total Amount */}
        <td className="px-3 py-3 text-right">
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">
            ₹{totalAmount(row.items).toLocaleString()}
          </span>
        </td>
      </tr>

      {/* Expanded items sub-row */}
      {expanded && (
        <tr className="bg-slate-50/50 dark:bg-[#151929]/50">
          <td colSpan={10} className="px-6 py-3">
            <ItemsSubTable items={row.items} />
          </td>
        </tr>
      )}
    </>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────

function MobileCard({ row, sno, onApprove, onRemarkChange, savingId }) {
  const [itemsOpen, setItemsOpen] = useState(false)
  const hodMeta = statusMeta(row.headofdepartment_approvalstatus)
  const prinMeta = statusMeta(row.status)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">

      {/* Card Header */}
      <div className="flex items-start gap-3 px-4 py-4">
        <span className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <FileText className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.indentno}</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
            <User className="w-3 h-3" /> {row.name}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[15px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">
            ₹{totalAmount(row.items).toLocaleString()}
          </span>
          <span className="text-[10px] text-slate-400">total value</span>
        </div>
      </div>

      {/* HOD + Principal Status Row */}
      <div className="px-4 pb-3 grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1.5 flex items-center gap-1">
            <Building2 className="w-3 h-3" /> HOD
          </p>
          <p className="text-[11px] text-slate-600 dark:text-slate-300 mb-1.5">{row.headofdepartment}</p>
          <StatusBadge status={row.headofdepartment_approvalstatus} />
        </div>
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40 p-2.5">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Principal
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-1.5">Current status</p>
          <StatusBadge status={row.status} />
        </div>
      </div>

      {/* Action + Remark */}
      <div className="px-4 pb-3 space-y-2">
        <ApproveBtn
          currentStatus={row.status}
          onToggle={() => onApprove(row.indentformid)}
          loading={savingId === row.indentformid}
        />
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <input
            type="text"
            value={row.remark}
            onChange={e => onRemarkChange(row.indentformid, e.target.value)}
            placeholder="Add remark…"
            className="flex-1 px-2.5 py-1.5 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
              bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200
              placeholder-slate-300 dark:placeholder-slate-600
              focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20 transition-all"
          />
        </div>
      </div>

      {/* Items Toggle */}
      <button
        onClick={() => setItemsOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-2.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]
          text-[12px] font-semibold text-blue-600 dark:text-blue-400
          hover:bg-blue-50/50 dark:hover:bg-blue-500/5 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <Package className="w-3.5 h-3.5" />
          {row.items.length} Item{row.items.length !== 1 ? 's' : ''} &nbsp;·&nbsp; ₹{totalAmount(row.items).toLocaleString()}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${itemsOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Expanded Items (Mobile) */}
      {itemsOpen && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 space-y-2">
          {row.items.map((item, i) => (
            <div key={i} className="rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/30 p-3">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mb-1">{item.itemdesc}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                <span className="text-slate-400">Qty: <span className="text-slate-600 dark:text-slate-300 font-medium">{item.itemqty}</span></span>
                <span className="text-slate-400">Price: <span className="text-slate-600 dark:text-slate-300 font-medium">₹{item.price.toLocaleString()}</span></span>
                <span className="text-slate-400">Total: <span className="text-blue-600 dark:text-blue-400 font-bold">₹{item.totalamount.toLocaleString()}</span></span>
                <span className="text-slate-400">Dept: <span className="text-slate-600 dark:text-slate-300 font-medium">{item.department}</span></span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">{item.reason_purpose}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, session, setSession, filterStatus, setFilterStatus, onShow, loading, errors }) {
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
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Status">
            <NativeSelect value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
            Show
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function IndentFormApprovalPrincipal() {
  const [session,      setSession]      = useState('')
  const [filterStatus, setFilterStatus] = useState('0')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [savingId,     setSavingId]     = useState(null)
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

  // ── Fetch (simulate API) ────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = attachItems(INDENT_DATA[session] || [])
      // Filter by status if not "Select All"
      if (filterStatus !== '0') {
        data = data.filter(r => r.status === filterStatus)
      }
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} indent form(s) for session ${session}.`)
    }, 650)
  }, [session, filterStatus])

  const handleReset = () => {
    setSession(''); setFilterStatus('0'); setRows([])
    setSearch(''); setErrors({}); setShown(false); setShownSession('')
  }

  // ── Toggle principal approval ───────────────────────────────────────────────
  const handleApprove = useCallback((indentformid) => {
    setSavingId(indentformid)
    setTimeout(() => {
      setRows(prev => prev.map(r => {
        if (r.indentformid !== indentformid) return r
        const next = r.status === 'Approved' ? 'Not Approved' : 'Approved'
        return {
          ...r,
          status: next,
          principal_approval: next === 'Approved' ? 'Approved' : 'Approve',
        }
      }))
      setSavingId(null)
      showToast('Principal approval status updated.')
    }, 600)
  }, [])

  // ── Remark change ───────────────────────────────────────────────────────────
  const handleRemarkChange = useCallback((indentformid, value) => {
    setRows(prev => prev.map(r => r.indentformid === indentformid ? { ...r, remark: value } : r))
  }, [])

  // ── Search filter ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.indentno.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.headofdepartment.toLowerCase().includes(q) ||
      r.status.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary counts ──────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:       filtered.length,
    approved:    filtered.filter(r => r.status === 'Approved').length,
    notApproved: filtered.filter(r => r.status === 'Not Approved').length,
    pending:     filtered.filter(r => r.status !== 'Approved' && r.status !== 'Not Approved').length,
  }), [filtered])

  const hasResults = shown && rows.length > 0
  const activeFilters = (session ? 1 : 0) + (filterStatus !== '0' ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Indent Form Approval
          <span className="text-[13px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
            Principal
          </span>
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Review and approve faculty indent forms. Expand each row to view item details.
        </p>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────────── */}
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

            <Field label="Status">
              <NativeSelect value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            </Field>

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

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `${session}${filterStatus !== '0' ? ' · ' + filterStatus : ''}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RotateCcw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={ClipboardList} label="Total Forms"   value={stats.total}       color="blue"    />
            <SummaryCard icon={CheckCircle2}  label="Approved"      value={stats.approved}    color="emerald" />
            <SummaryCard icon={XCircle}       label="Not Approved"  value={stats.notApproved} color="rose"    />
            <SummaryCard icon={Clock}         label="Pending"       value={stats.pending}     color="amber"   />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Indent Forms</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search form, name, HOD…"
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

            {/* Info Hint (Desktop) */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Click the <ChevronRight className="w-3 h-3 inline" /> arrow to expand item details per indent form. Approve/Revoke changes principal status immediately.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {[
                        'S.No.', '', 'Indent No.', 'Faculty Name',
                        'HOD', 'HOD Status', 'Principal Status',
                        'Action', 'Remark', 'Total (₹)'
                      ].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow
                        key={row.indentformid}
                        row={row}
                        sno={i + 1}
                        onApprove={handleApprove}
                        onRemarkChange={handleRemarkChange}
                        savingId={savingId}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap "Items" to expand item detail. Use Approve/Revoke to update principal status.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard
                      key={row.indentformid}
                      row={row}
                      sno={i + 1}
                      onApprove={handleApprove}
                      onRemarkChange={handleRemarkChange}
                      savingId={savingId}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No forms loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to view indent forms for approval.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
