/**
 * IndentFormApproval.jsx
 * Folder: src/pages/Approvals/IndentFormApproval.jsx
 *
 * Converts legacy ASPX "Indent Form Approval" page to fully-responsive React + Tailwind.
 *
 * Workflow: Faculty raise indent (purchase) forms with line items. The HOD reviews
 * each indent on this screen, inspects the itemized request, records a remark, and
 * approves it. The Principal's decision is shown read-only alongside it.
 *
 * Columns (desktop): S.No, expand toggle, Indent Form No., Faculty Name, HOD,
 * HOD Status, Principal Status, Action (Approve), Remark.
 *
 * Features:
 *  - Session + Status dropdown filters, Show button (matches legacy postback filters)
 *  - Expandable rows revealing itemized indent details (desktop: inline row, mobile: card)
 *  - HOD approve action + editable/savable remark per indent
 *  - Read-only Principal approval status
 *  - Summary cards, instant search, toast notifications, loading & empty states
 *  - Mobile: collapsible cards + filter drawer. Desktop: dense ERP-style table.
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2, ChevronDown, ChevronRight,
  Search, Info, SlidersHorizontal, ClipboardList, Hash, User, Building2,
  IndianRupee, MessageSquare, Clock, CheckCircle2, XCircle, Package, FileText, Save,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']
const STATUS_FILTERS = ['All Status', 'Approved', 'Not Approved']

// Each indent: id, indentNo, facultyName, department, hod, hodStatus, principalStatus,
// remark, items: [{ itemDesc, itemQty, price, department, reasonPurpose }]
const INDENT_DATA = {
  '2025-26': [
    {
      id: 'r1', indentNo: 'IND/25-26/014', facultyName: 'Dr. Anjali Sharma',
      department: 'Computer Science', hod: 'Prof. R.K. Verma',
      hodStatus: 'Approved', principalStatus: 'Approved',
      remark: 'Approved for lab upgrade.',
      items: [
        { itemDesc: 'Dell Laptop i7 16GB', itemQty: 5, price: 65000, department: 'Computer Science', reasonPurpose: 'Replacement of outdated lab systems' },
        { itemDesc: 'Wireless Mouse', itemQty: 10, price: 650, department: 'Computer Science', reasonPurpose: 'Lab peripherals' },
      ],
    },
    {
      id: 'r2', indentNo: 'IND/25-26/015', facultyName: 'Mr. Vikram Chauhan',
      department: 'Physics', hod: 'Dr. S.N. Mishra',
      hodStatus: 'Pending', principalStatus: 'Pending', remark: '',
      items: [
        { itemDesc: 'Digital Oscilloscope', itemQty: 2, price: 42000, department: 'Physics', reasonPurpose: 'Practical demonstration equipment' },
      ],
    },
    {
      id: 'r3', indentNo: 'IND/25-26/016', facultyName: 'Ms. Priya Nair',
      department: 'Chemistry', hod: 'Dr. Meenal Kapoor',
      hodStatus: 'Rejected', principalStatus: 'Pending',
      remark: 'Budget exceeded for this quarter.',
      items: [
        { itemDesc: 'Bunsen Burner', itemQty: 15, price: 450, department: 'Chemistry', reasonPurpose: 'Replacement of damaged burners' },
        { itemDesc: 'Glass Beaker Set', itemQty: 20, price: 280, department: 'Chemistry', reasonPurpose: 'Lab consumables' },
      ],
    },
    {
      id: 'r4', indentNo: 'IND/25-26/017', facultyName: 'Dr. Arjun Mehta',
      department: 'Mathematics', hod: 'Prof. Suresh Iyer',
      hodStatus: 'Approved', principalStatus: 'Approved', remark: 'Cleared.',
      items: [
        { itemDesc: 'Graphic Calculator', itemQty: 8, price: 3200, department: 'Mathematics', reasonPurpose: 'Senior secondary practicals' },
      ],
    },
    {
      id: 'r5', indentNo: 'IND/25-26/018', facultyName: 'Ms. Kavita Joshi',
      department: 'English', hod: 'Dr. Neha Bhatt',
      hodStatus: 'Pending', principalStatus: 'Pending', remark: '',
      items: [
        { itemDesc: 'Reference Books Set', itemQty: 30, price: 550, department: 'English', reasonPurpose: 'Library collection update' },
      ],
    },
    {
      id: 'r6', indentNo: 'IND/25-26/019', facultyName: 'Mr. Rohit Malhotra',
      department: 'Physical Education', hod: 'Mr. Deepak Rawat',
      hodStatus: 'Approved', principalStatus: 'Pending',
      remark: 'Forwarded for final approval.',
      items: [
        { itemDesc: 'Football Set', itemQty: 6, price: 1200, department: 'Physical Education', reasonPurpose: 'Annual sports meet' },
        { itemDesc: 'Cricket Kit', itemQty: 4, price: 4500, department: 'Physical Education', reasonPurpose: 'Annual sports meet' },
      ],
    },
  ],
  '2024-25': [
    {
      id: 'r7', indentNo: 'IND/24-25/041', facultyName: 'Dr. Sandeep Rana',
      department: 'Computer Science', hod: 'Prof. R.K. Verma',
      hodStatus: 'Approved', principalStatus: 'Approved', remark: 'Approved.',
      items: [
        { itemDesc: 'Network Switch 24-Port', itemQty: 3, price: 8500, department: 'Computer Science', reasonPurpose: 'Lab network upgrade' },
      ],
    },
    {
      id: 'r8', indentNo: 'IND/24-25/042', facultyName: 'Ms. Ritu Bisht',
      department: 'Biology', hod: 'Dr. Alok Tiwari',
      hodStatus: 'Pending', principalStatus: 'Pending', remark: '',
      items: [
        { itemDesc: 'Microscope (Binocular)', itemQty: 4, price: 12500, department: 'Biology', reasonPurpose: 'Practical batch shortage' },
        { itemDesc: 'Specimen Slides Set', itemQty: 12, price: 320, department: 'Biology', reasonPurpose: 'Practical consumables' },
      ],
    },
    {
      id: 'r9', indentNo: 'IND/24-25/043', facultyName: 'Mr. Harish Negi',
      department: 'Commerce', hod: 'Dr. Pooja Saxena',
      hodStatus: 'Rejected', principalStatus: 'Pending',
      remark: 'Duplicate request, already procured last term.',
      items: [
        { itemDesc: 'Calculator (Financial)', itemQty: 25, price: 950, department: 'Commerce', reasonPurpose: 'Accountancy practicals' },
      ],
    },
    {
      id: 'r10', indentNo: 'IND/24-25/044', facultyName: 'Dr. Meera Pant',
      department: 'Physics', hod: 'Dr. S.N. Mishra',
      hodStatus: 'Approved', principalStatus: 'Approved', remark: 'Approved as requested.',
      items: [
        { itemDesc: 'Resistor Assortment Box', itemQty: 10, price: 480, department: 'Physics', reasonPurpose: 'Circuit lab consumables' },
      ],
    },
    {
      id: 'r11', indentNo: 'IND/24-25/045', facultyName: 'Mr. Ajay Bhandari',
      department: 'Physical Education', hod: 'Mr. Deepak Rawat',
      hodStatus: 'Pending', principalStatus: 'Pending', remark: '',
      items: [
        { itemDesc: 'Volleyball Net', itemQty: 3, price: 1800, department: 'Physical Education', reasonPurpose: 'Inter-house tournament' },
      ],
    },
  ],
  '2023-24': [
    {
      id: 'r12', indentNo: 'IND/23-24/028', facultyName: 'Dr. Anjali Sharma',
      department: 'Computer Science', hod: 'Prof. R.K. Verma',
      hodStatus: 'Approved', principalStatus: 'Approved', remark: 'Approved.',
      items: [
        { itemDesc: 'Projector (Full HD)', itemQty: 2, price: 38000, department: 'Computer Science', reasonPurpose: 'Smart classroom setup' },
      ],
    },
    {
      id: 'r13', indentNo: 'IND/23-24/029', facultyName: 'Ms. Sunita Rawat',
      department: 'English', hod: 'Dr. Neha Bhatt',
      hodStatus: 'Approved', principalStatus: 'Rejected',
      remark: 'HOD cleared, awaiting budget revision from Principal.',
      items: [
        { itemDesc: 'Audio System (Classroom)', itemQty: 1, price: 21000, department: 'English', reasonPurpose: 'Listening comprehension sessions' },
      ],
    },
    {
      id: 'r14', indentNo: 'IND/23-24/030', facultyName: 'Mr. Vikram Chauhan',
      department: 'Physics', hod: 'Dr. S.N. Mishra',
      hodStatus: 'Pending', principalStatus: 'Pending', remark: '',
      items: [
        { itemDesc: 'Voltmeter (Digital)', itemQty: 6, price: 2100, department: 'Physics', reasonPurpose: 'Practical equipment shortage' },
        { itemDesc: 'Connecting Wires (Box)', itemQty: 8, price: 220, department: 'Physics', reasonPurpose: 'Lab consumables' },
      ],
    },
    {
      id: 'r15', indentNo: 'IND/23-24/031', facultyName: 'Dr. Arjun Mehta',
      department: 'Mathematics', hod: 'Prof. Suresh Iyer',
      hodStatus: 'Rejected', principalStatus: 'Pending',
      remark: 'Items not covered under current procurement policy.',
      items: [
        { itemDesc: 'Geometry Box (Demo Size)', itemQty: 5, price: 1100, department: 'Mathematics', reasonPurpose: 'Classroom demonstration aid' },
      ],
    },
    {
      id: 'r16', indentNo: 'IND/23-24/032', facultyName: 'Ms. Priya Nair',
      department: 'Chemistry', hod: 'Dr. Meenal Kapoor',
      hodStatus: 'Approved', principalStatus: 'Approved', remark: 'Approved.',
      items: [
        { itemDesc: 'Fume Hood Filter', itemQty: 2, price: 6800, department: 'Chemistry', reasonPurpose: 'Safety equipment maintenance' },
      ],
    },
  ],
  '2022-23': [
    {
      id: 'r17', indentNo: 'IND/22-23/009', facultyName: 'Mr. Harish Negi',
      department: 'Commerce', hod: 'Dr. Pooja Saxena',
      hodStatus: 'Approved', principalStatus: 'Approved', remark: 'Approved.',
      items: [
        { itemDesc: 'Ledger Books (Practice)', itemQty: 40, price: 90, department: 'Commerce', reasonPurpose: 'Bookkeeping practicals' },
      ],
    },
    {
      id: 'r18', indentNo: 'IND/22-23/010', facultyName: 'Dr. Sandeep Rana',
      department: 'Computer Science', hod: 'Prof. R.K. Verma',
      hodStatus: 'Pending', principalStatus: 'Pending', remark: '',
      items: [
        { itemDesc: 'UPS (1.5 KVA)', itemQty: 4, price: 9200, department: 'Computer Science', reasonPurpose: 'Power backup for lab systems' },
      ],
    },
    {
      id: 'r19', indentNo: 'IND/22-23/011', facultyName: 'Ms. Ritu Bisht',
      department: 'Biology', hod: 'Dr. Alok Tiwari',
      hodStatus: 'Rejected', principalStatus: 'Pending',
      remark: 'Re-submit with revised vendor quotation.',
      items: [
        { itemDesc: 'Dissection Tray Set', itemQty: 10, price: 380, department: 'Biology', reasonPurpose: 'Practical batch requirement' },
      ],
    },
    {
      id: 'r20', indentNo: 'IND/22-23/012', facultyName: 'Mr. Ajay Bhandari',
      department: 'Physical Education', hod: 'Mr. Deepak Rawat',
      hodStatus: 'Approved', principalStatus: 'Approved', remark: 'Approved.',
      items: [
        { itemDesc: 'Badminton Racquet Set', itemQty: 8, price: 950, department: 'Physical Education', reasonPurpose: 'Sports equipment renewal' },
      ],
    },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const currency = (n) => `₹${n.toLocaleString('en-IN')}`
const itemTotal = (item) => item.itemQty * item.price
const indentTotal = (row) => row.items.reduce((s, it) => s + itemTotal(it), 0)

const STATUS_STYLES = {
  Approved: { fg: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200 dark:border-emerald-500/25', Icon: CheckCircle2 },
  Rejected: { fg: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200 dark:border-rose-500/25', Icon: XCircle },
  Pending: { fg: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200 dark:border-amber-500/25', Icon: Clock },
}

const DEPT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const deptColor = (name) => DEPT_COLORS[(name?.charCodeAt(0) ?? 0) % DEPT_COLORS.length]
const deptAbbr = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()

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
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight truncate">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status, bold }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[12px] ${bold ? 'font-bold' : 'font-semibold'} ${s.fg} ${s.bg} ${s.border}`}>
      <s.Icon className="w-3.5 h-3.5 flex-shrink-0" />
      {status}
    </span>
  )
}

function ApproveButton({ row, onApprove }) {
  if (row.hodStatus !== 'Pending') {
    return (
      <span className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold cursor-default
        ${row.hodStatus === 'Approved'
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
          : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'}`}>
        {row.hodStatus === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
        {row.hodStatus}
      </span>
    )
  }
  return (
    <button
      type="button"
      onClick={() => onApprove(row.id)}
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white
        bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-sm shadow-blue-500/20
        transition-all active:scale-95 whitespace-nowrap"
    >
      <Check className="w-3.5 h-3.5" /> Approve
    </button>
  )
}

function RemarkField({ row, onChange, onSave, compact }) {
  const dirty = row.remark !== row.committedRemark
  return (
    <div className="flex items-center gap-1.5">
      <input
        value={row.remark}
        onChange={(e) => onChange(row.id, e.target.value)}
        placeholder="Add remark…"
        className={`flex-1 ${compact ? 'min-w-0' : 'w-44'} px-2.5 py-1.5 text-[12px] rounded-lg border outline-none transition-all
          bg-white text-slate-700 border-slate-200 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:placeholder-slate-600`}
      />
      {dirty && (
        <button
          type="button"
          onClick={() => onSave(row.id)}
          title="Save remark"
          className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
        >
          <Save className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}

// ─── ITEM DETAILS (expanded indent line items) ────────────────────────────────
function ItemsDetailDesktop({ row }) {
  return (
    <tr className="bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
      <td />
      <td colSpan={8} className="px-4 py-3">
        <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/60 dark:bg-white/[0.02]">
            <Package className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300">Indent Items — {row.indentNo}</span>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                <th className="px-4 py-2 text-left">Item Description</th>
                <th className="px-4 py-2 text-center">Qty</th>
                <th className="px-4 py-2 text-right">Price</th>
                <th className="px-4 py-2 text-right">Total Amount</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Reason / Purpose</th>
              </tr>
            </thead>
            <tbody>
              {row.items.map((it, i) => (
                <tr key={i} className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.06)]">
                  <td className="px-4 py-2 text-[12px] font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{it.itemDesc}</td>
                  <td className="px-4 py-2 text-[12px] text-center text-slate-500 dark:text-slate-400 tabular-nums">{it.itemQty}</td>
                  <td className="px-4 py-2 text-[12px] text-right text-slate-500 dark:text-slate-400 tabular-nums">{currency(it.price)}</td>
                  <td className="px-4 py-2 text-[12px] text-right font-bold text-blue-700 dark:text-blue-400 tabular-nums">{currency(itemTotal(it))}</td>
                  <td className="px-4 py-2 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{it.department}</td>
                  <td className="px-4 py-2 text-[12px] text-slate-500 dark:text-slate-400">{it.reasonPurpose}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/60 dark:bg-white/[0.02]">
                <td colSpan={3} className="px-4 py-2 text-[12px] font-bold text-slate-600 dark:text-slate-300 text-right">Indent Total</td>
                <td className="px-4 py-2 text-[13px] font-bold text-blue-700 dark:text-blue-400 text-right tabular-nums">{currency(indentTotal(row))}</td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          </table>
        </div>
      </td>
    </tr>
  )
}

function ItemsDetailMobile({ row }) {
  return (
    <div className="space-y-2">
      {row.items.map((it, i) => (
        <div key={i} className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-tight">{it.itemDesc}</p>
            <span className="flex-shrink-0 text-[12px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{currency(itemTotal(it))}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Qty: <strong className="text-slate-700 dark:text-slate-300">{it.itemQty}</strong></span>
            <span>@ {currency(it.price)}</span>
            <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{it.department}</span>
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 flex items-start gap-1">
            <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />{it.reasonPurpose}
          </p>
        </div>
      ))}
      <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10">
        <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">Indent Total</span>
        <span className="text-[14px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{currency(indentTotal(row))}</span>
      </div>
    </div>
  )
}

// ─── DESKTOP ROW ──────────────────────────────────────────────────────────────
function DesktopRow({ row, idx, expanded, onToggle, onApprove, onRemarkChange, onSaveRemark }) {
  const { fg, bg } = deptColor(row.department)
  return (
    <>
      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>
        <td className="px-2 py-3 text-center w-8">
          <button
            type="button"
            onClick={() => onToggle(row.id)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-white/5 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: bg, color: fg }}>
              {deptAbbr(row.department)}
            </span>
            <div className="min-w-0">
              <p className="text-[12px] font-mono font-bold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.indentNo}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">{row.department}</p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3 text-[13px] font-medium text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.facultyName}</td>
        <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.hod}</td>
        <td className="px-4 py-3"><StatusBadge status={row.hodStatus} /></td>
        <td className="px-4 py-3"><StatusBadge status={row.principalStatus} bold /></td>
        <td className="px-4 py-3"><ApproveButton row={row} onApprove={onApprove} /></td>
        <td className="px-4 py-3"><RemarkField row={row} onChange={onRemarkChange} onSave={onSaveRemark} /></td>
      </tr>
      {expanded && <ItemsDetailDesktop row={row} />}
    </>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onApprove, onRemarkChange, onSaveRemark }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = deptColor(row.department)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: bg, color: fg }}>
          {deptAbbr(row.department)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-mono font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.indentNo}</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
            {row.facultyName} <span className="text-slate-300 dark:text-slate-600">·</span> {row.department}
          </p>
        </div>
        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums flex-shrink-0">{currency(indentTotal(row))}</span>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      <div className="px-4 pb-3 flex flex-wrap gap-2">
        <StatusBadge status={row.hodStatus} />
        <span className="text-[11px] text-slate-400 self-center">HOD</span>
        <span className="w-px h-4 bg-slate-200 dark:bg-slate-700 self-center" />
        <StatusBadge status={row.principalStatus} bold />
        <span className="text-[11px] text-slate-400 self-center">Principal</span>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="flex items-center gap-2 text-[12px] text-slate-500 dark:text-slate-400">
            <User className="w-3.5 h-3.5 flex-shrink-0" /> HOD: <span className="font-semibold text-slate-700 dark:text-slate-200">{row.hod}</span>
          </div>

          <ItemsDetailMobile row={row} />

          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> Remark
            </label>
            <RemarkField row={row} onChange={onRemarkChange} onSave={onSaveRemark} compact />
          </div>

          <div className="pt-1">
            <ApproveButton row={row} onApprove={onApprove} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, status, setStatus, onShow, loading, errors }) {
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
            <NativeSelect value={status} onChange={e => setStatus(e.target.value)}>
              {STATUS_FILTERS.map(s => <option key={s} value={s}>{s}</option>)}
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
export default function IndentFormApproval() {
  const [session, setSession] = useState('')
  const [status, setStatus] = useState('All Status')
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [shown, setShown] = useState(false)
  const [shownSession, setShownSession] = useState('')
  const [expandedIds, setExpandedIds] = useState(new Set())

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Fetch (simulate API call against session + status filters) ────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setExpandedIds(new Set())

    setTimeout(() => {
      let data = (INDENT_DATA[session] || []).map(r => ({ ...r, committedRemark: r.remark }))
      if (status === 'Approved') data = data.filter(r => r.hodStatus === 'Approved')
      if (status === 'Not Approved') data = data.filter(r => r.hodStatus !== 'Approved')
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} indent form${data.length !== 1 ? 's' : ''} for session ${session}.`)
    }, 650)
  }, [session, status])

  const handleReset = () => {
    setSession(''); setStatus('All Status'); setRows([]); setSearch('')
    setErrors({}); setShown(false); setShownSession(''); setExpandedIds(new Set())
  }

  // ── Row-level actions ──────────────────────────────────────────────────────
  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const handleApprove = useCallback((id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, hodStatus: 'Approved' } : r))
    const row = rows.find(r => r.id === id)
    showToast(`Indent ${row?.indentNo ?? ''} approved.`)
  }, [rows])

  const handleRemarkChange = useCallback((id, value) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, remark: value } : r))
  }, [])

  const handleSaveRemark = useCallback((id) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, committedRemark: r.remark } : r))
    const row = rows.find(r => r.id === id)
    showToast(`Remark saved for ${row?.indentNo ?? 'indent'}.`)
  }, [rows])

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.indentNo.toLowerCase().includes(q) ||
      r.facultyName.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.hod.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary metrics ─────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total: filtered.length,
    pending: filtered.filter(r => r.hodStatus === 'Pending').length,
    approved: filtered.filter(r => r.hodStatus === 'Approved').length,
    value: filtered.reduce((s, r) => s + indentTotal(r), 0),
  }), [filtered])

  const hasResults = shown && rows.length > 0
  const activeFilters = (session ? 1 : 0) + (status !== 'All Status' ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Indent Form Approval
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Review faculty purchase indents, inspect itemized requests, and record HOD approval.
        </p>
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

            <Field label="Status">
              <NativeSelect value={status} onChange={e => setStatus(e.target.value)}>
                {STATUS_FILTERS.map(s => <option key={s} value={s}>{s}</option>)}
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

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
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
        status={status}
        setStatus={setStatus}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={ClipboardList} label="Total Indents" value={stats.total} color="blue" />
            <SummaryCard icon={Clock} label="Pending HOD Review" value={stats.pending} color="amber" />
            <SummaryCard icon={CheckCircle2} label="Approved by HOD" value={stats.approved} color="emerald" />
            <SummaryCard icon={IndianRupee} label="Total Indent Value" value={currency(stats.value)} color="violet" />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
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
                  placeholder="Search faculty, dept, indent no…"
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
                Click the arrow to expand an indent and view item-wise details. Principal status is read-only here.
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
                      {['S.No.', '', 'Indent Form No.', 'Faculty Name', 'HOD', 'HOD Status', 'Principal Status', 'Action', 'Remark'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow
                        key={row.id}
                        row={row}
                        idx={i + 1}
                        expanded={expandedIds.has(row.id)}
                        onToggle={toggleExpand}
                        onApprove={handleApprove}
                        onRemarkChange={handleRemarkChange}
                        onSaveRemark={handleSaveRemark}
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
                    Tap a card to view items, add a remark, and approve.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard
                      key={row.id}
                      row={row}
                      idx={i + 1}
                      onApprove={handleApprove}
                      onRemarkChange={handleRemarkChange}
                      onSaveRemark={handleSaveRemark}
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

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No indent forms loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and status, then click <strong>Show</strong> to load indent forms for approval.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
