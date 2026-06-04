/**
 * DefineConcession.jsx
 * Folder: src/pages/Fee/DefineConcession.jsx
 *
 * Converts legacy define_fee_concession.aspx → fully-responsive React + Tailwind.
 *
 * Workflow:
 *  1. Select Fee Type (Regular / Transport / Hostel)
 *  2. Select Session
 *  3. Enter Admission No → auto-fills student info
 *  4. Fill Remark, Concession Group, Quota
 *  5. Nested installment table → set Fix/Per mode + value per fee head
 *  6. Submit concession
 *  7. "Get Concession Request" → drawer with history
 *
 * Mobile: step-by-step wizard feel with sticky bottom actions
 * Desktop: side-by-side form + live concession table
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  User, GraduationCap, CreditCard, Building2, Wallet,
  Search, RefreshCw, ChevronDown, ChevronRight,
  AlertCircle, X, Check, Loader2,
  History, Eye, Send, FileText,
  IndianRupee, Percent, Calculator,
  ClipboardList, Bell, ArrowLeft, Info,
  BadgeCheck, Clock, Filter, ChevronUp
} from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26', '2026-27']

const CONCESSION_GROUPS = [
  { id: '1', label: 'Staff Ward' },
  { id: '2', label: 'SC/ST Concession' },
  { id: '3', label: 'Minority Concession' },
  { id: '4', label: 'Sports Quota' },
  { id: '5', label: 'Management Quota' },
  { id: '6', label: 'BPL Category' },
]

const QUOTA_LIST = [
  { id: '1', label: 'General' },
  { id: '2', label: 'Management' },
  { id: '3', label: 'Sports' },
  { id: '4', label: 'NRI' },
  { id: '5', label: 'SC' },
  { id: '6', label: 'ST' },
  { id: '7', label: 'OBC' },
]

// Simulated student lookup by admission no
const STUDENT_DB = {
  '1001': {
    name: 'Arjun Sharma',
    father: 'Rajesh Sharma',
    class: 'Class IX - A',
    classId: '9A',
    stuId: 'S1001',
    quota: 'General',
  },
  '1002': {
    name: 'Priya Verma',
    father: 'Suresh Verma',
    class: 'Class VI - B',
    classId: '6B',
    stuId: 'S1002',
    quota: 'OBC',
  },
  '1003': {
    name: 'Mohammed Aslam',
    father: 'Abdul Rehman',
    class: 'Class X - A',
    classId: '10A',
    stuId: 'S1003',
    quota: 'General',
  },
  '2001': {
    name: 'Kavya Singh',
    father: 'Yogesh Singh',
    class: 'Class III - A',
    classId: '3A',
    stuId: 'S2001',
    quota: 'SC',
  },
  '2002': {
    name: 'Rohan Gupta',
    father: 'Mahesh Gupta',
    class: 'Class XII - B',
    classId: '12B',
    stuId: 'S2002',
    quota: 'General',
  },
}

// Installment data per student (Regular fee)
const REGULAR_FEE_DATA = {
  S1001: [
    {
      installment_no: 1,
      heads: [
        { fee_head_id: 1, fee_head: 'Tuition Fee',     head_amount: 2500, concession: 0, Payable: 2500, Receive_amount: 0, balance: 2500, type: 'Fix', concession_val: 0 },
        { fee_head_id: 2, fee_head: 'Dev. Fund',        head_amount: 500,  concession: 0, Payable: 500,  Receive_amount: 0, balance: 500,  type: 'Fix', concession_val: 0 },
        { fee_head_id: 3, fee_head: 'Computer Fee',     head_amount: 300,  concession: 0, Payable: 300,  Receive_amount: 0, balance: 300,  type: 'Fix', concession_val: 0 },
        { fee_head_id: 4, fee_head: 'Sports Fee',       head_amount: 200,  concession: 0, Payable: 200,  Receive_amount: 0, balance: 200,  type: 'Fix', concession_val: 0 },
        { fee_head_id: 5, fee_head: 'Exam Fee',         head_amount: 150,  concession: 0, Payable: 150,  Receive_amount: 0, balance: 150,  type: 'Fix', concession_val: 0 },
      ],
    },
    {
      installment_no: 2,
      heads: [
        { fee_head_id: 1, fee_head: 'Tuition Fee',     head_amount: 2500, concession: 0, Payable: 2500, Receive_amount: 2500, balance: 0, type: 'Fix', concession_val: 0 },
        { fee_head_id: 2, fee_head: 'Dev. Fund',        head_amount: 500,  concession: 0, Payable: 500,  Receive_amount: 0,    balance: 500, type: 'Fix', concession_val: 0 },
        { fee_head_id: 3, fee_head: 'Computer Fee',     head_amount: 300,  concession: 0, Payable: 300,  Receive_amount: 300,  balance: 0, type: 'Fix', concession_val: 0 },
        { fee_head_id: 4, fee_head: 'Sports Fee',       head_amount: 200,  concession: 0, Payable: 200,  Receive_amount: 0,    balance: 200, type: 'Fix', concession_val: 0 },
        { fee_head_id: 5, fee_head: 'Exam Fee',         head_amount: 150,  concession: 0, Payable: 150,  Receive_amount: 150,  balance: 0, type: 'Fix', concession_val: 0 },
      ],
    },
    {
      installment_no: 3,
      heads: [
        { fee_head_id: 1, fee_head: 'Tuition Fee',     head_amount: 2500, concession: 0, Payable: 2500, Receive_amount: 0, balance: 2500, type: 'Fix', concession_val: 0 },
        { fee_head_id: 2, fee_head: 'Dev. Fund',        head_amount: 500,  concession: 0, Payable: 500,  Receive_amount: 0, balance: 500,  type: 'Fix', concession_val: 0 },
        { fee_head_id: 5, fee_head: 'Exam Fee',         head_amount: 150,  concession: 0, Payable: 150,  Receive_amount: 0, balance: 150,  type: 'Fix', concession_val: 0 },
      ],
    },
  ],
  S1002: [
    {
      installment_no: 1,
      heads: [
        { fee_head_id: 1, fee_head: 'Tuition Fee',  head_amount: 1800, concession: 0, Payable: 1800, Receive_amount: 1800, balance: 0,    type: 'Fix', concession_val: 0 },
        { fee_head_id: 2, fee_head: 'Dev. Fund',     head_amount: 400,  concession: 0, Payable: 400,  Receive_amount: 0,    balance: 400,  type: 'Fix', concession_val: 0 },
        { fee_head_id: 3, fee_head: 'Activity Fee',  head_amount: 250,  concession: 0, Payable: 250,  Receive_amount: 0,    balance: 250,  type: 'Fix', concession_val: 0 },
      ],
    },
    {
      installment_no: 2,
      heads: [
        { fee_head_id: 1, fee_head: 'Tuition Fee',  head_amount: 1800, concession: 0, Payable: 1800, Receive_amount: 0, balance: 1800, type: 'Fix', concession_val: 0 },
        { fee_head_id: 2, fee_head: 'Dev. Fund',     head_amount: 400,  concession: 0, Payable: 400,  Receive_amount: 0, balance: 400,  type: 'Fix', concession_val: 0 },
        { fee_head_id: 4, fee_head: 'Exam Fee',      head_amount: 200,  concession: 0, Payable: 200,  Receive_amount: 0, balance: 200,  type: 'Fix', concession_val: 0 },
      ],
    },
  ],
}

const TRANSPORT_FEE_DATA = {
  S1001: [
    {
      installment_no: 1,
      heads: [
        { fee_head_id: 10, fee_head: 'Transport Charges', head_amount: 1200, concession: 0, Payable: 1200, Receive_amount: 0, balance: 1200, type: 'Fix', concession_val: 0 },
        { fee_head_id: 11, fee_head: 'Route Maintenance',  head_amount: 100,  concession: 0, Payable: 100,  Receive_amount: 0, balance: 100,  type: 'Fix', concession_val: 0 },
      ],
    },
  ],
}

const HOSTEL_FEE_DATA = {
  S1001: [
    {
      installment_no: 1,
      heads: [
        { fee_head_id: 20, fee_head: 'Room Rent',     head_amount: 5000, concession: 0, Payable: 5000, Receive_amount: 0, balance: 5000, type: 'Fix', concession_val: 0 },
        { fee_head_id: 21, fee_head: 'Mess Charges',  head_amount: 3000, concession: 0, Payable: 3000, Receive_amount: 0, balance: 3000, type: 'Fix', concession_val: 0 },
        { fee_head_id: 22, fee_head: 'Laundry',       head_amount: 500,  concession: 0, Payable: 500,  Receive_amount: 0, balance: 500,  type: 'Fix', concession_val: 0 },
      ],
    },
  ],
}

// Concession request history
const CONCESSION_HISTORY = [
  { id: 1, requestDate: '12-Apr-2026', inst_no: 1, fee_head: 'Tuition Fee',  con_type: 'Fix', con_charge: 500,  con_per: '-',  remark: 'Staff Ward',       ApprovalStatus: 'Approved', session: '2025-26', activeStatus: 'Active'   },
  { id: 2, requestDate: '12-Apr-2026', inst_no: 1, fee_head: 'Dev. Fund',     con_type: 'Per', con_charge: '-', con_per: '50%', remark: 'Staff Ward',       ApprovalStatus: 'Pending',  session: '2025-26', activeStatus: 'Active'   },
  { id: 3, requestDate: '01-Jan-2025', inst_no: 2, fee_head: 'Tuition Fee',  con_type: 'Fix', con_charge: 300,  con_per: '-',  remark: 'SC Concession',    ApprovalStatus: 'Approved', session: '2024-25', activeStatus: 'Inactive' },
  { id: 4, requestDate: '15-Jun-2024', inst_no: 1, fee_head: 'Computer Fee', con_type: 'Per', con_charge: '-', con_per: '25%', remark: 'Minority Quota',   ApprovalStatus: 'Rejected', session: '2023-24', activeStatus: 'Inactive' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const FEE_TYPES = [
  { id: 'Regular',   label: 'Regular',   icon: GraduationCap, color: 'blue'   },
  { id: 'Transport', label: 'Transport', icon: Building2,     color: 'amber'  },
  { id: 'Hostel',    label: 'Hostel',    icon: CreditCard,    color: 'violet' },
]

const FEE_DATA_MAP = { Regular: REGULAR_FEE_DATA, Transport: TRANSPORT_FEE_DATA, Hostel: HOSTEL_FEE_DATA }

function calcConcession(head_amount, type, val) {
  const v = parseFloat(val) || 0
  if (type === 'Per') return Math.min(Math.round((head_amount * v) / 100), head_amount)
  return Math.min(v, head_amount)
}

function statusBadge(status) {
  if (status === 'Approved') return { bg: 'bg-emerald-100 dark:bg-emerald-500/15', text: 'text-emerald-700 dark:text-emerald-400', icon: BadgeCheck }
  if (status === 'Pending')  return { bg: 'bg-amber-100 dark:bg-amber-500/15',   text: 'text-amber-700 dark:text-amber-400',   icon: Clock       }
  return                            { bg: 'bg-rose-100 dark:bg-rose-500/15',     text: 'text-rose-700 dark:text-rose-400',     icon: X           }
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${className}`}
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
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(14px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── INFO CHIP ────────────────────────────────────────────────────────────────
function InfoChip({ icon: Icon, label, value, color = 'blue' }) {
  const colors = {
    blue:   'bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20 text-blue-700 dark:text-blue-400',
    violet: 'bg-violet-50 dark:bg-violet-500/10 border-violet-100 dark:border-violet-500/20 text-violet-700 dark:text-violet-400',
    emerald:'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-100 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400',
    amber:  'bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20 text-amber-700 dark:text-amber-400',
    slate:  'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300',
  }
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[13px] ${colors[color]}`}>
      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
      <span className="font-medium text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wide flex-shrink-0">{label}</span>
      <span className="font-bold truncate">{value}</span>
    </div>
  )
}

// ─── FEE TYPE SELECTOR ────────────────────────────────────────────────────────
function FeeTypeSelector({ value, onChange }) {
  const colorMap = {
    blue:   { active: 'bg-blue-600 text-white shadow-blue-200 dark:shadow-blue-900/40',   inactive: 'bg-white dark:bg-[#1a1f35] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[rgba(99,102,241,0.2)] hover:border-blue-300' },
    amber:  { active: 'bg-amber-500 text-white shadow-amber-200 dark:shadow-amber-900/40', inactive: 'bg-white dark:bg-[#1a1f35] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[rgba(99,102,241,0.2)] hover:border-amber-300' },
    violet: { active: 'bg-violet-600 text-white shadow-violet-200 dark:shadow-violet-900/40', inactive: 'bg-white dark:bg-[#1a1f35] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-[rgba(99,102,241,0.2)] hover:border-violet-300' },
  }
  return (
    <div className="flex gap-2 flex-wrap">
      {FEE_TYPES.map(ft => {
        const Icon = ft.icon
        const c = colorMap[ft.color]
        const isActive = value === ft.id
        return (
          <button
            key={ft.id}
            type="button"
            onClick={() => onChange(ft.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-150 shadow-sm active:scale-95
              ${isActive ? `${c.active} shadow-md` : c.inactive}`}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {ft.label}
            {isActive && <Check className="w-3.5 h-3.5 ml-0.5" />}
          </button>
        )
      })}
    </div>
  )
}

// ─── INSTALLMENT ACCORDION ROW ────────────────────────────────────────────────
function InstallmentAccordion({ inst, instIndex, onChange, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)

  // Live totals from current state
  const totals = useMemo(() => {
    return inst.heads.reduce((acc, h) => {
      const con = calcConcession(h.head_amount, h.type, h.concession_val)
      return {
        charges:  acc.charges  + h.head_amount,
        con:      acc.con      + con,
        payable:  acc.payable  + (h.head_amount - con),
        received: acc.received + h.Receive_amount,
        balance:  acc.balance  + h.balance,
      }
    }, { charges: 0, con: 0, payable: 0, received: 0, balance: 0 })
  }, [inst.heads])

  function handleTypeChange(headIdx, newType) {
    onChange(instIndex, headIdx, 'type', newType)
  }
  function handleValChange(headIdx, val) {
    onChange(instIndex, headIdx, 'concession_val', val)
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] overflow-hidden bg-white dark:bg-[#1a1f35] shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors"
      >
        <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 flex items-center justify-center text-[12px] font-bold flex-shrink-0">
          {inst.installment_no}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Installment {inst.installment_no}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {inst.heads.length} heads · Payable ₹{totals.charges.toLocaleString()}
            {totals.con > 0 && <span className="text-emerald-600 dark:text-emerald-400 ml-1">· Con ₹{totals.con}</span>}
          </p>
        </div>
        {/* Summary chips */}
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
            ₹{totals.payable.toLocaleString()} payable
          </span>
          {totals.balance > 0 && (
            <span className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400">
              ₹{totals.balance.toLocaleString()} due
            </span>
          )}
        </div>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ml-1 ${open ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Desktop Table */}
      {open && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          {/* Desktop */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
                  {['#', 'Fee Head', 'Charges', 'Concession', 'Payable', 'Received', 'Balance', 'Mode', 'Value'].map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {inst.heads.map((h, hi) => {
                  const con = calcConcession(h.head_amount, h.type, h.concession_val)
                  const payable = h.head_amount - con
                  return (
                    <tr
                      key={h.fee_head_id}
                      className="border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] hover:bg-slate-50/50 dark:hover:bg-white/[0.015] transition-colors"
                    >
                      <td className="px-3 py-2.5 text-slate-400 w-8">{hi + 1}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{h.fee_head}</td>
                      <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">₹{h.head_amount.toLocaleString()}</td>
                      <td className="px-3 py-2.5 tabular-nums">
                        {con > 0
                          ? <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{con.toLocaleString()}</span>
                          : <span className="text-slate-400">—</span>
                        }
                      </td>
                      <td className="px-3 py-2.5 tabular-nums font-semibold text-blue-700 dark:text-blue-400">₹{payable.toLocaleString()}</td>
                      <td className="px-3 py-2.5 tabular-nums text-slate-600 dark:text-slate-300">₹{h.Receive_amount.toLocaleString()}</td>
                      <td className="px-3 py-2.5 tabular-nums">
                        {h.balance > 0
                          ? <span className="text-rose-600 dark:text-rose-400 font-semibold">₹{h.balance.toLocaleString()}</span>
                          : <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Paid</span>
                        }
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1">
                          {['Fix', 'Per'].map(mode => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => handleTypeChange(hi, mode)}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all
                                ${h.type === mode
                                  ? mode === 'Fix'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-violet-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                }`}
                            >
                              {mode === 'Fix' ? <IndianRupee className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                              {mode}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 w-24">
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            max={h.type === 'Per' ? 100 : h.head_amount}
                            value={h.concession_val || ''}
                            onChange={e => handleValChange(hi, e.target.value)}
                            placeholder="0"
                            className="w-20 pl-2 pr-1 py-1.5 text-[12px] rounded-lg border outline-none transition-all text-right tabular-nums
                              bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                              border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                              focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
                          />
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {/* Footer totals */}
                <tr className="bg-blue-50/50 dark:bg-indigo-500/[0.05] font-bold text-[12px]">
                  <td className="px-3 py-2.5" colSpan={2}>
                    <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1">
                      <Calculator className="w-3.5 h-3.5" /> Total
                    </span>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums text-slate-700 dark:text-slate-300">₹{totals.charges.toLocaleString()}</td>
                  <td className="px-3 py-2.5 tabular-nums text-emerald-600 dark:text-emerald-400">₹{totals.con.toLocaleString()}</td>
                  <td className="px-3 py-2.5 tabular-nums text-blue-700 dark:text-blue-400">₹{totals.payable.toLocaleString()}</td>
                  <td className="px-3 py-2.5 tabular-nums text-slate-700 dark:text-slate-300">₹{totals.received.toLocaleString()}</td>
                  <td className="px-3 py-2.5 tabular-nums text-rose-600 dark:text-rose-400">₹{totals.balance.toLocaleString()}</td>
                  <td colSpan={2} />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="sm:hidden p-3 space-y-2">
            {/* Mobile totals bar */}
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {[
                { label: 'Charges',  value: totals.charges,  cls: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' },
                { label: 'Concession', value: totals.con,    cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
                { label: 'Payable',  value: totals.payable,  cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' },
                { label: 'Balance',  value: totals.balance,  cls: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400' },
              ].map(s => (
                <div key={s.label} className={`flex-shrink-0 rounded-lg px-3 py-2 text-center ${s.cls}`}>
                  <p className="text-[15px] font-bold tabular-nums">₹{s.value.toLocaleString()}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wide opacity-75">{s.label}</p>
                </div>
              ))}
            </div>

            {inst.heads.map((h, hi) => {
              const con = calcConcession(h.head_amount, h.type, h.concession_val)
              const payable = h.head_amount - con
              return (
                <div key={h.fee_head_id} className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1e2238] p-3 space-y-2.5">
                  {/* Head name + balance */}
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{h.fee_head}</p>
                    {h.balance > 0
                      ? <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded-lg">Due ₹{h.balance.toLocaleString()}</span>
                      : <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-lg">Paid</span>
                    }
                  </div>

                  {/* Amount row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2">
                      <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">₹{h.head_amount.toLocaleString()}</p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">Charges</p>
                    </div>
                    <div className="rounded-lg bg-emerald-50 dark:bg-emerald-500/10 p-2">
                      <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">₹{con.toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">Con.</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 dark:bg-blue-500/10 p-2">
                      <p className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">₹{payable.toLocaleString()}</p>
                      <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">Payable</p>
                    </div>
                  </div>

                  {/* Mode + Value */}
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {['Fix', 'Per'].map(mode => (
                        <button
                          key={mode}
                          type="button"
                          onClick={() => handleTypeChange(hi, mode)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all
                            ${h.type === mode
                              ? mode === 'Fix' ? 'bg-blue-600 text-white' : 'bg-violet-600 text-white'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                            }`}
                        >
                          {mode === 'Fix' ? <IndianRupee className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                          {mode}
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min="0"
                      max={h.type === 'Per' ? 100 : h.head_amount}
                      value={h.concession_val || ''}
                      onChange={e => handleValChange(hi, e.target.value)}
                      placeholder={`Enter ${h.type === 'Per' ? '%' : '₹'}`}
                      className="flex-1 px-3 py-1.5 text-[13px] rounded-lg border outline-none transition-all text-right tabular-nums
                        bg-white dark:bg-[#1a1f35] text-slate-800 dark:text-slate-200
                        border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                        focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CONCESSION HISTORY DRAWER ────────────────────────────────────────────────
function HistoryDrawer({ open, onClose, history, studentName }) {
  if (!open) return null
  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed inset-y-0 right-0 z-50 w-full sm:w-[560px] bg-white dark:bg-[#1a1f35] shadow-2xl flex flex-col"
        style={{ animation: 'drawerIn .25s ease' }}
      >
        <style>{`@keyframes drawerIn{from{transform:translateX(100%)}to{transform:translateX(0)}}`}</style>

        {/* Drawer Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50 dark:bg-white/[0.02] flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Concession Requests</p>
            {studentName && <p className="text-[12px] text-slate-400 dark:text-slate-500 truncate">{studentName}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 gap-3 text-slate-400 dark:text-slate-600">
              <ClipboardList className="w-10 h-10 opacity-30" />
              <p className="text-[13px]">No concession requests found.</p>
            </div>
          ) : (
            history.map(req => {
              const badge = statusBadge(req.ApprovalStatus)
              const BadgeIcon = badge.icon
              return (
                <div key={req.id} className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1e2238] p-4 space-y-3">
                  {/* Row 1: Date + Status */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span className="text-[12px] text-slate-500 dark:text-slate-400">{req.requestDate}</span>
                      <span className="text-[11px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-lg font-semibold">
                        Session {req.session}
                      </span>
                    </div>
                    <span className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-lg ${badge.bg} ${badge.text}`}>
                      <BadgeIcon className="w-3 h-3" />
                      {req.ApprovalStatus}
                    </span>
                  </div>

                  {/* Row 2: Fee details */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Fee Head</p>
                      <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{req.fee_head}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Installment</p>
                      <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Inst. {req.inst_no}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Con. Type</p>
                      <span className={`inline-flex items-center gap-1 text-[12px] font-bold px-2 py-0.5 rounded-lg
                        ${req.con_type === 'Fix' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' : 'bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400'}`}>
                        {req.con_type === 'Fix' ? <IndianRupee className="w-3 h-3" /> : <Percent className="w-3 h-3" />}
                        {req.con_type}
                      </span>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">
                        {req.con_type === 'Fix' ? 'Amount' : 'Percentage'}
                      </p>
                      <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">
                        {req.con_type === 'Fix' ? `₹${req.con_charge}` : req.con_per}
                      </p>
                    </div>
                  </div>

                  {/* Remark */}
                  {req.remark && (
                    <div className="px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
                      <p className="text-[11px] text-slate-400 uppercase tracking-wide font-semibold mb-0.5">Remark</p>
                      <p className="text-[12px] text-slate-600 dark:text-slate-300">{req.remark}</p>
                    </div>
                  )}

                  {/* Active status */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full
                      ${req.activeStatus === 'Active'
                        ? 'bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                      {req.activeStatus}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50 dark:bg-white/[0.02] flex-shrink-0">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-slate-800 dark:bg-indigo-600 text-white hover:bg-slate-900 dark:hover:bg-indigo-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SUMMARY PANEL ────────────────────────────────────────────────────────────
function ConcessionSummary({ installments }) {
  const grand = useMemo(() => {
    return installments.reduce((acc, inst) => {
      inst.heads.forEach(h => {
        const con = calcConcession(h.head_amount, h.type, h.concession_val)
        acc.charges  += h.head_amount
        acc.con      += con
        acc.payable  += (h.head_amount - con)
        acc.received += h.Receive_amount
        acc.balance  += h.balance
      })
      return acc
    }, { charges: 0, con: 0, payable: 0, received: 0, balance: 0 })
  }, [installments])

  const conPct = grand.charges > 0 ? Math.round((grand.con / grand.charges) * 100) : 0

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-500/5 dark:to-blue-500/5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Concession Summary</span>
      </div>

      <div className="p-4 space-y-3">
        {/* Key stats */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Total Payable', value: grand.charges, cls: 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300' },
            { label: 'Total Concession', value: grand.con, cls: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400' },
            { label: 'Net Payable', value: grand.payable, cls: 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400' },
            { label: 'Due Balance', value: grand.balance, cls: 'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl p-3 text-center ${s.cls}`}>
              <p className="text-[17px] font-extrabold tabular-nums">₹{s.value.toLocaleString()}</p>
              <p className="text-[10px] font-bold uppercase tracking-wide opacity-70 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Concession % bar */}
        {grand.charges > 0 && (
          <div>
            <div className="flex justify-between text-[11px] font-semibold mb-1.5">
              <span className="text-emerald-600 dark:text-emerald-400">Concession {conPct}%</span>
              <span className="text-slate-400">of total charges</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700/60 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                style={{ width: `${conPct}%` }}
              />
            </div>
          </div>
        )}

        {grand.con === 0 && (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
            <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-[12px] text-amber-700 dark:text-amber-400">Enter values in the table below to apply concession.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineConcession() {
  // Form state
  const [feeType,          setFeeType]          = useState('Regular')
  const [session,          setSession]          = useState('')
  const [admNo,            setAdmNo]            = useState('')
  const [admLoading,       setAdmLoading]       = useState(false)
  const [student,          setStudent]          = useState(null)
  const [remark,           setRemark]           = useState('')
  const [concessionGroup,  setConcessionGroup]  = useState('')
  const [quota,            setQuota]            = useState('')

  // Installment data (editable)
  const [installments, setInstallments] = useState([])

  // UI state
  const [historyOpen,  setHistoryOpen]  = useState(false)
  const [submitting,   setSubmitting]   = useState(false)
  const [submitted,    setSubmitted]    = useState(false)
  const [toast,        setToast]        = useState(null)
  const [errors,       setErrors]       = useState({})

  const admInputRef = useRef(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // Auto-lookup student when adm no changes
  const handleAdmNoChange = useCallback((val) => {
    setAdmNo(val)
    setStudent(null)
    setInstallments([])
    setSubmitted(false)
    setErrors(p => ({ ...p, admNo: undefined }))

    if (val.length >= 3) {
      setAdmLoading(true)
      setTimeout(() => {
        const found = STUDENT_DB[val]
        if (found) {
          setStudent(found)
          // Deep clone installments so they're mutable
          const feeDb = FEE_DATA_MAP[feeType] || REGULAR_FEE_DATA
          const raw = feeDb[found.stuId] || []
          setInstallments(raw.map(inst => ({
            ...inst,
            heads: inst.heads.map(h => ({ ...h })),
          })))
        } else {
          setErrors(p => ({ ...p, admNo: 'Student not found' }))
        }
        setAdmLoading(false)
      }, 600)
    }
  }, [feeType])

  // When fee type changes, reload installments if student is loaded
  useEffect(() => {
    if (!student) return
    const feeDb = FEE_DATA_MAP[feeType] || REGULAR_FEE_DATA
    const raw = feeDb[student.stuId] || []
    setInstallments(raw.map(inst => ({
      ...inst,
      heads: inst.heads.map(h => ({ ...h })),
    })))
    setSubmitted(false)
  }, [feeType])

  // Handle value/mode change in nested installment table
  const handleInstallmentChange = useCallback((instIdx, headIdx, field, value) => {
    setInstallments(prev =>
      prev.map((inst, ii) => {
        if (ii !== instIdx) return inst
        return {
          ...inst,
          heads: inst.heads.map((h, hi) => {
            if (hi !== headIdx) return h
            const updated = { ...h, [field]: field === 'concession_val' ? value : value }
            // Reset val on mode switch
            if (field === 'type') updated.concession_val = 0
            return updated
          }),
        }
      })
    )
  }, [])

  // Validate + submit
  const handleSubmit = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Select a session'
    if (!admNo)   err.admNo   = 'Enter admission number'
    if (!student) err.admNo   = 'Student not found'
    if (Object.keys(err).length) { setErrors(err); return }

    const hasAnyVal = installments.some(inst =>
      inst.heads.some(h => parseFloat(h.concession_val) > 0)
    )
    if (!hasAnyVal) {
      showToast('Please enter at least one concession value before submitting.', 'error')
      return
    }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
      showToast('Fee concession saved successfully!')
    }, 1200)
  }, [session, admNo, student, installments, showToast])

  const handleReset = useCallback(() => {
    setFeeType('Regular'); setSession(''); setAdmNo(''); setStudent(null)
    setRemark(''); setConcessionGroup(''); setQuota('')
    setInstallments([]); setErrors({}); setSubmitted(false)
    admInputRef.current?.focus()
  }, [])

  const hasInstallments = installments.length > 0

  return (
    <div className="space-y-4 pb-20 sm:pb-10">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-indigo-400 flex-shrink-0" />
            Define Fee Concession
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Apply concession to student fee heads — installment-wise, head-wise.
          </p>
        </div>

        {/* Action buttons top-right (desktop) */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          {student && (
            <button
              type="button"
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                border border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-slate-700 dark:text-slate-300
                bg-white dark:bg-[#1a1f35] hover:bg-slate-50 dark:hover:bg-[#1e2238] transition-colors"
            >
              <History className="w-4 h-4" /> Concession Requests
            </button>
          )}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
              hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
        </div>
      </div>

      {/* ── SECTION 1: Search / Filter Form ──────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Search</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Fee Type */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-2">
              Fee Type <span className="text-rose-500">*</span>
            </label>
            <FeeTypeSelector value={feeType} onChange={ft => { setFeeType(ft); setInstallments([]); setSubmitted(false) }} />
          </div>

          {/* Session + Adm No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

            <Field label="Admission No." error={errors.admNo} required hint="Type 1001, 1002, 1003, 2001, 2002">
              <div className="relative">
                <input
                  ref={admInputRef}
                  type="text"
                  value={admNo}
                  onChange={e => handleAdmNoChange(e.target.value)}
                  placeholder="Enter admission number"
                  className={`w-full pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                    ${errors.admNo ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                />
                {admLoading && (
                  <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 animate-spin" />
                )}
                {student && !admLoading && (
                  <Check className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                )}
              </div>
            </Field>

            <Field label="Concession Group">
              <NativeSelect
                value={concessionGroup}
                onChange={e => setConcessionGroup(e.target.value)}
                placeholder="-- Select Group --"
                disabled={!student}
              >
                {CONCESSION_GROUPS.map(g => <option key={g.id} value={g.id}>{g.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Select Quota">
              <NativeSelect
                value={quota}
                onChange={e => setQuota(e.target.value)}
                placeholder="-- Select Quota --"
                disabled={!student}
              >
                {QUOTA_LIST.map(q => <option key={q.id} value={q.id}>{q.label}</option>)}
              </NativeSelect>
            </Field>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Student Info (after lookup) ────────────────────────── */}
      {student && !admLoading && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/20 bg-gradient-to-r from-emerald-50/60 to-white dark:from-emerald-500/5 dark:to-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-emerald-100 dark:border-emerald-500/15">
            <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Information</span>
            <span className="ml-auto text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
              Adm. {admNo}
            </span>
          </div>

          <div className="p-4">
            {/* Info chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-4">
              <InfoChip icon={User}          label="Name"    value={student.name}   color="blue"    />
              <InfoChip icon={GraduationCap} label="Father"  value={student.father} color="slate"   />
              <InfoChip icon={Building2}     label="Class"   value={student.class}  color="violet"  />
              <InfoChip icon={Wallet}        label="Quota"   value={student.quota}  color="amber"   />
            </div>

            {/* Remark field */}
            <Field label="Remark (Optional)">
              <input
                type="text"
                value={remark}
                onChange={e => setRemark(e.target.value)}
                placeholder="Add a remark for this concession…"
                className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                  border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
              />
            </Field>

            {/* Mobile: History Button */}
            <div className="sm:hidden mt-4">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                  border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-700 dark:text-slate-300
                  bg-white dark:bg-[#1e2238] hover:bg-slate-50 dark:hover:bg-[#242844] transition-colors"
              >
                <History className="w-4 h-4" /> View Concession Requests
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── SECTION 3: Installment Tables ─────────────────────────────────── */}
      {hasInstallments && (
        <>
          {/* Summary panel */}
          <ConcessionSummary installments={installments} />

          {/* Installments */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <IndianRupee className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Fee Head — Concession Entry</span>
              <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">
                {installments.length} Installment{installments.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="p-4 space-y-3">
              {/* Hint */}
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/[0.07] border border-blue-100 dark:border-blue-500/20">
                <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-blue-700 dark:text-blue-400">
                  Select <strong>Fix</strong> for fixed amount or <strong>Per</strong> for percentage concession per fee head. Enter value in the last column.
                </p>
              </div>

              {installments.map((inst, ii) => (
                <InstallmentAccordion
                  key={inst.installment_no}
                  inst={inst}
                  instIndex={ii}
                  onChange={handleInstallmentChange}
                  defaultOpen={ii === 0}
                />
              ))}
            </div>

            {/* Footer — Submit */}
            <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/50 dark:bg-white/[0.01] flex flex-col sm:flex-row items-center gap-3">
              {submitted && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[13px] font-semibold flex-1">
                  <BadgeCheck className="w-4 h-4 flex-shrink-0" /> Concession saved successfully!
                </div>
              )}
              <div className="flex gap-3 sm:ml-auto w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                    bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" /> Reset
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold
                    bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                    text-white shadow-md shadow-blue-500/25 dark:shadow-indigo-500/25
                    disabled:opacity-70 transition-all active:scale-[0.98]"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Submit Concession
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {!hasInstallments && !admLoading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Wallet className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center max-w-sm">
            <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">No fee data loaded</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 leading-relaxed">
              Select a fee type &amp; session, then enter the student's admission number to load installment data.
            </p>
          </div>
        </div>
      )}

      {/* ── Mobile sticky bottom CTA ────────────────────────────────────────── */}
      {hasInstallments && (
        <div className="fixed bottom-0 left-0 right-0 z-30 sm:hidden px-4 py-3 bg-white/95 dark:bg-[#1a1f35]/95 backdrop-blur-sm border-t border-slate-200 dark:border-[rgba(99,102,241,0.15)] flex gap-2">
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold
              border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-600 dark:text-slate-400
              bg-white dark:bg-[#1e2238]"
          >
            <History className="w-4 h-4" />
            History
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[12px] font-semibold
              bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold
              bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit Concession
          </button>
        </div>
      )}

      {/* ── History Drawer ─────────────────────────────────────────────────── */}
      <HistoryDrawer
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={CONCESSION_HISTORY}
        studentName={student?.name}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
