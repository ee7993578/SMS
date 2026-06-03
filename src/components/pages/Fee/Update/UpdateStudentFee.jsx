/**
 * UpdateStudentFee.jsx
 * Converts legacy ASPX "Update Student Fee" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session dropdown
 *  - Fee Type tabs (Regular / Transport / Hostel)
 *  - Admission No. lookup → auto-fill Class, Student Name, Father Name
 *  - Nested GridView: Installments → Fee Heads with checkboxes + amounts
 *  - Submit selected fee heads per installment
 *  - Mobile: card-based accordion layout
 *  - Desktop: dense ERP table layout
 *  - Loading spinner, toast notifications, empty states
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  Search, RefreshCw, CheckSquare, Square, ChevronDown, ChevronUp,
  AlertCircle, X, Check, Loader2, User, Users, BookOpen,
  CreditCard, Bus, Home, Filter, Save, Info,
  Hash, IndianRupee, Building2, Phone, ClipboardList,
  ChevronRight, Eye, CheckCircle2, Clock, Banknote
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const FEE_TYPES = [
  { key: 'regular',   label: 'Regular',   icon: CreditCard, color: 'blue'   },
  { key: 'transport', label: 'Transport',  icon: Bus,        color: 'amber'  },
  { key: 'hostel',    label: 'Hostel',     icon: Home,       color: 'violet' },
]

// Student lookup by admission number
const STUDENTS = {
  'A001': { name: 'Rahul Kumar Sharma',   father: 'Rajesh Kumar Sharma',   class: 'Class X - A',   classId: 10 },
  'A002': { name: 'Priya Singh',          father: 'Arun Kumar Singh',      class: 'Class IX - B',  classId: 9  },
  'A003': { name: 'Aman Gupta',           father: 'Suresh Gupta',          class: 'Class VIII - A',classId: 8  },
  'A004': { name: 'Sunita Verma',         father: 'Mahesh Verma',          class: 'Class VII - A', classId: 7  },
  'A005': { name: 'Rohit Yadav',          father: 'Vijay Yadav',           class: 'Class XII - A', classId: 12 },
  'A006': { name: 'Anita Patel',          father: 'Ramesh Patel',          class: 'Class VI - B',  classId: 6  },
}

// Fee data: { [feeType]: { [session]: installments[] } }
const FEE_DATA = {
  regular: {
    '2024-25': [
      {
        installment_no: 1,
        installment_label: 'April - June',
        heads: [
          { fee_head_id: 1, fee_type_id: 1, fee_head: 'Tuition Fee',       head_amount: 3500 },
          { fee_head_id: 2, fee_type_id: 1, fee_head: 'Computer Fee',      head_amount: 500  },
          { fee_head_id: 3, fee_type_id: 1, fee_head: 'Activity Fee',      head_amount: 300  },
          { fee_head_id: 4, fee_type_id: 1, fee_head: 'Library Fee',       head_amount: 200  },
        ],
      },
      {
        installment_no: 2,
        installment_label: 'July - September',
        heads: [
          { fee_head_id: 5, fee_type_id: 1, fee_head: 'Tuition Fee',       head_amount: 3500 },
          { fee_head_id: 6, fee_type_id: 1, fee_head: 'Exam Fee',          head_amount: 600  },
          { fee_head_id: 7, fee_type_id: 1, fee_head: 'Sports Fee',        head_amount: 400  },
        ],
      },
      {
        installment_no: 3,
        installment_label: 'October - December',
        heads: [
          { fee_head_id: 8,  fee_type_id: 1, fee_head: 'Tuition Fee',      head_amount: 3500 },
          { fee_head_id: 9,  fee_type_id: 1, fee_head: 'Computer Fee',     head_amount: 500  },
          { fee_head_id: 10, fee_type_id: 1, fee_head: 'Magazine Fee',     head_amount: 150  },
        ],
      },
      {
        installment_no: 4,
        installment_label: 'January - March',
        heads: [
          { fee_head_id: 11, fee_type_id: 1, fee_head: 'Tuition Fee',      head_amount: 3500 },
          { fee_head_id: 12, fee_type_id: 1, fee_head: 'Annual Charges',   head_amount: 1000 },
          { fee_head_id: 13, fee_type_id: 1, fee_head: 'Exam Fee',         head_amount: 600  },
        ],
      },
    ],
    '2025-26': [
      {
        installment_no: 1,
        installment_label: 'April - June',
        heads: [
          { fee_head_id: 1,  fee_type_id: 1, fee_head: 'Tuition Fee',      head_amount: 3800 },
          { fee_head_id: 2,  fee_type_id: 1, fee_head: 'Computer Fee',     head_amount: 600  },
          { fee_head_id: 3,  fee_type_id: 1, fee_head: 'Activity Fee',     head_amount: 350  },
          { fee_head_id: 4,  fee_type_id: 1, fee_head: 'Library Fee',      head_amount: 250  },
        ],
      },
      {
        installment_no: 2,
        installment_label: 'July - September',
        heads: [
          { fee_head_id: 5,  fee_type_id: 1, fee_head: 'Tuition Fee',      head_amount: 3800 },
          { fee_head_id: 6,  fee_type_id: 1, fee_head: 'Exam Fee',         head_amount: 700  },
          { fee_head_id: 7,  fee_type_id: 1, fee_head: 'Sports Fee',       head_amount: 450  },
        ],
      },
    ],
  },
  transport: {
    '2024-25': [
      {
        installment_no: 1,
        installment_label: 'April - June',
        heads: [
          { fee_head_id: 20, fee_type_id: 2, fee_head: 'Bus Fare',         head_amount: 1800 },
          { fee_head_id: 21, fee_type_id: 2, fee_head: 'Route Charges',    head_amount: 200  },
        ],
      },
      {
        installment_no: 2,
        installment_label: 'July - September',
        heads: [
          { fee_head_id: 22, fee_type_id: 2, fee_head: 'Bus Fare',         head_amount: 1800 },
          { fee_head_id: 23, fee_type_id: 2, fee_head: 'Maintenance',      head_amount: 150  },
        ],
      },
    ],
    '2025-26': [
      {
        installment_no: 1,
        installment_label: 'April - June',
        heads: [
          { fee_head_id: 20, fee_type_id: 2, fee_head: 'Bus Fare',         head_amount: 2000 },
          { fee_head_id: 21, fee_type_id: 2, fee_head: 'Route Charges',    head_amount: 250  },
        ],
      },
    ],
  },
  hostel: {
    '2024-25': [
      {
        installment_no: 1,
        installment_label: 'April - June',
        heads: [
          { fee_head_id: 30, fee_type_id: 3, fee_head: 'Room Charges',     head_amount: 5000 },
          { fee_head_id: 31, fee_type_id: 3, fee_head: 'Mess Charges',     head_amount: 3000 },
          { fee_head_id: 32, fee_type_id: 3, fee_head: 'Laundry',          head_amount: 500  },
        ],
      },
      {
        installment_no: 2,
        installment_label: 'July - September',
        heads: [
          { fee_head_id: 33, fee_type_id: 3, fee_head: 'Room Charges',     head_amount: 5000 },
          { fee_head_id: 34, fee_type_id: 3, fee_head: 'Mess Charges',     head_amount: 3000 },
        ],
      },
    ],
    '2025-26': [
      {
        installment_no: 1,
        installment_label: 'April - June',
        heads: [
          { fee_head_id: 30, fee_type_id: 3, fee_head: 'Room Charges',     head_amount: 5500 },
          { fee_head_id: 31, fee_type_id: 3, fee_head: 'Mess Charges',     head_amount: 3200 },
          { fee_head_id: 32, fee_type_id: 3, fee_head: 'Laundry',          head_amount: 600  },
          { fee_head_id: 35, fee_type_id: 3, fee_head: 'Wi-Fi Charges',    head_amount: 400  },
        ],
      },
    ],
  },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const feeTypeColor = {
  blue:   { tab: 'bg-blue-600 text-white shadow-blue-500/30',   badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',   ring: 'ring-blue-400',   light: 'bg-blue-50 dark:bg-blue-500/10'   },
  amber:  { tab: 'bg-amber-500 text-white shadow-amber-500/30', badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300', ring: 'ring-amber-400',  light: 'bg-amber-50 dark:bg-amber-500/10' },
  violet: { tab: 'bg-violet-600 text-white shadow-violet-500/30',badge: 'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300',ring: 'ring-violet-400',light: 'bg-violet-50 dark:bg-violet-500/10'},
}

const formatINR = (n) => `₹${Number(n).toLocaleString('en-IN')}`

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success'
          ? 'bg-emerald-600 text-white shadow-emerald-500/30'
          : type === 'error'
          ? 'bg-rose-600 text-white shadow-rose-500/30'
          : 'bg-blue-600 text-white shadow-blue-500/30'
        }`}
      style={{ animation: 'toastUp .3s cubic-bezier(.22,1,.36,1)' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

function InfoField({ label, value, icon: Icon, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
        {Icon && <Icon className="w-3.5 h-3.5" />}
        {label}
      </label>
      <div className={`px-3 py-2 rounded-xl border text-[13px] font-semibold min-h-[38px] flex items-center
        ${value
          ? 'bg-white dark:bg-[#1e2238] border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-800 dark:text-slate-100'
          : 'bg-slate-50 dark:bg-[#181c30] border-dashed border-slate-200 dark:border-slate-700 text-slate-300 dark:text-slate-600 italic'
        }`}>
        {value || placeholder || '—'}
      </div>
    </div>
  )
}

// ─── STUDENT INFO CARD ────────────────────────────────────────────────────────

function StudentInfoCard({ student }) {
  if (!student) return null
  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/25 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/5 dark:to-teal-500/5 p-4 shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{student.name}</p>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Student Found ✓</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 text-[12px]">
        <div className="bg-white/70 dark:bg-white/5 rounded-lg px-3 py-2">
          <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wide mb-0.5">Class</p>
          <p className="font-bold text-slate-700 dark:text-slate-200">{student.class}</p>
        </div>
        <div className="bg-white/70 dark:bg-white/5 rounded-lg px-3 py-2">
          <p className="text-slate-400 font-medium text-[10px] uppercase tracking-wide mb-0.5">Father's Name</p>
          <p className="font-bold text-slate-700 dark:text-slate-200 truncate">{student.father}</p>
        </div>
      </div>
    </div>
  )
}

// ─── FEE TYPE TABS ────────────────────────────────────────────────────────────

function FeeTypeTabs({ active, onChange }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {FEE_TYPES.map(({ key, label, icon: Icon, color }) => {
        const isActive = active === key
        const c = feeTypeColor[color]
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold transition-all duration-200 border
              ${isActive
                ? `${c.tab} shadow-lg border-transparent`
                : 'bg-white dark:bg-[#1a1f35] border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-[rgba(99,102,241,0.4)]'
              }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        )
      })}
    </div>
  )
}

// ─── INSTALLMENT BLOCK (Desktop Table) ───────────────────────────────────────

function InstallmentDesktop({ installment, selections, onToggleHead, onToggleAll, feeColor }) {
  const c = feeTypeColor[feeColor]
  const allChecked = installment.heads.every(h => selections[h.fee_head_id])
  const someChecked = installment.heads.some(h => selections[h.fee_head_id])
  const selectedTotal = installment.heads.filter(h => selections[h.fee_head_id]).reduce((s, h) => s + h.head_amount, 0)
  const installmentTotal = installment.heads.reduce((s, h) => s + h.head_amount, 0)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.12)] overflow-hidden shadow-sm mb-4 last:mb-0">
      {/* Installment Header */}
      <div className={`flex items-center justify-between px-4 py-3 ${c.light} border-b border-slate-200 dark:border-[rgba(99,102,241,0.12)]`}>
        <div className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold ${c.badge}`}>
            {installment.installment_no}
          </div>
          <div>
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
              Installment #{installment.installment_no}
            </span>
            <span className="ml-2 text-[12px] text-slate-500 dark:text-slate-400">
              {installment.installment_label}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-[11px] text-slate-400">Selected / Total</p>
            <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
              <span className="text-emerald-600 dark:text-emerald-400">{formatINR(selectedTotal)}</span>
              <span className="text-slate-300 dark:text-slate-600 mx-1">/</span>
              {formatINR(installmentTotal)}
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
            <th className="px-4 py-2.5 w-10 text-center">
              <button
                type="button"
                onClick={() => onToggleAll(installment.installment_no, !allChecked)}
                className="text-slate-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                title={allChecked ? 'Deselect all' : 'Select all'}
              >
                {allChecked
                  ? <CheckSquare className="w-4 h-4 text-blue-500" />
                  : someChecked
                  ? <CheckSquare className="w-4 h-4 text-blue-300" />
                  : <Square className="w-4 h-4" />
                }
              </button>
            </th>
            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Sr.</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fee Head</th>
            <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Charges</th>
          </tr>
        </thead>
        <tbody>
          {installment.heads.map((head, idx) => {
            const isChecked = !!selections[head.fee_head_id]
            return (
              <tr
                key={head.fee_head_id}
                onClick={() => onToggleHead(head.fee_head_id)}
                className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] cursor-pointer transition-colors
                  ${isChecked
                    ? 'bg-blue-50/60 dark:bg-blue-500/[0.06] hover:bg-blue-50 dark:hover:bg-blue-500/10'
                    : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                  }`}
              >
                <td className="px-4 py-3 text-center">
                  {isChecked
                    ? <CheckSquare className="w-4 h-4 text-blue-500 inline" />
                    : <Square className="w-4 h-4 text-slate-300 inline" />
                  }
                </td>
                <td className="px-4 py-3 text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{idx + 1}</td>
                <td className="px-4 py-3">
                  <span className={`text-[13px] font-semibold ${isChecked ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
                    {head.fee_head}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`text-[13px] font-bold tabular-nums ${isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                    {formatINR(head.head_amount)}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── INSTALLMENT BLOCK (Mobile Card) ─────────────────────────────────────────

function InstallmentMobile({ installment, selections, onToggleHead, onToggleAll, feeColor }) {
  const [expanded, setExpanded] = useState(true)
  const c = feeTypeColor[feeColor]
  const allChecked = installment.heads.every(h => selections[h.fee_head_id])
  const someChecked = installment.heads.some(h => selections[h.fee_head_id])
  const selectedTotal = installment.heads.filter(h => selections[h.fee_head_id]).reduce((s, h) => s + h.head_amount, 0)
  const installmentTotal = installment.heads.reduce((s, h) => s + h.head_amount, 0)
  const selectedCount = installment.heads.filter(h => selections[h.fee_head_id]).length

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden mb-3 last:mb-0">
      {/* Header */}
      <button
        type="button"
        className={`w-full flex items-center gap-3 px-4 py-3.5 text-left ${c.light}`}
        onClick={() => setExpanded(p => !p)}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${c.badge}`}>
          #{installment.installment_no}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
            Installment {installment.installment_no}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {installment.installment_label}
            {selectedCount > 0 && (
              <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                · {selectedCount} selected
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end flex-shrink-0 mr-2">
          <span className="text-[14px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
            {formatINR(selectedTotal)}
          </span>
          <span className="text-[10px] text-slate-400">of {formatINR(installmentTotal)}</span>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
          : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        }
      </button>

      {/* Select All Strip */}
      {expanded && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {installment.heads.length} fee heads
          </span>
          <button
            type="button"
            onClick={() => onToggleAll(installment.installment_no, !allChecked)}
            className={`flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1 rounded-lg transition-colors
              ${allChecked
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-600'
              }`}
          >
            {allChecked ? <CheckSquare className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
            {allChecked ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      )}

      {/* Fee Heads */}
      {expanded && (
        <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
          {installment.heads.map((head, idx) => {
            const isChecked = !!selections[head.fee_head_id]
            return (
              <button
                key={head.fee_head_id}
                type="button"
                onClick={() => onToggleHead(head.fee_head_id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors
                  ${isChecked
                    ? 'bg-blue-50/60 dark:bg-blue-500/[0.06]'
                    : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                  }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors ${isChecked ? 'text-blue-500' : 'text-slate-300 dark:text-slate-600'}`}>
                  {isChecked ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                </div>
                <span className={`text-[11px] text-slate-400 w-5 flex-shrink-0 tabular-nums`}>{idx + 1}</span>
                <span className={`flex-1 text-[13px] font-semibold ${isChecked ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
                  {head.fee_head}
                </span>
                <span className={`text-[13px] font-bold tabular-nums flex-shrink-0 ${isChecked ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}`}>
                  {formatINR(head.head_amount)}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── SUMMARY FOOTER ───────────────────────────────────────────────────────────

function SelectionSummary({ installments, selections }) {
  const totalSelected = useMemo(() => {
    let amount = 0, count = 0
    installments.forEach(inst => {
      inst.heads.forEach(h => {
        if (selections[h.fee_head_id]) { amount += h.head_amount; count++ }
      })
    })
    return { amount, count }
  }, [installments, selections])

  if (totalSelected.count === 0) return null

  return (
    <div className="sticky bottom-0 z-20 rounded-2xl border border-emerald-200 dark:border-emerald-500/30
      bg-white/95 dark:bg-[#1a1f35]/95 backdrop-blur-sm shadow-2xl shadow-emerald-500/10 px-5 py-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
            <Banknote className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-[12px] text-slate-400 font-medium">
              {totalSelected.count} head{totalSelected.count !== 1 ? 's' : ''} selected
            </p>
            <p className="text-[20px] font-bold text-emerald-600 dark:text-emerald-400 tabular-nums leading-tight">
              {formatINR(totalSelected.amount)}
            </p>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 hidden sm:block">
          Click Submit to update the selected fee heads.
        </p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function UpdateStudentFee() {
  // Filter state
  const [session,   setSession]   = useState('')
  const [feeType,   setFeeType]   = useState('regular')
  const [admNo,     setAdmNo]     = useState('')
  const [admInput,  setAdmInput]  = useState('')

  // Data state
  const [student,   setStudent]   = useState(null)
  const [notFound,  setNotFound]  = useState(false)
  const [installments, setInstallments] = useState([])
  const [selections,   setSelections]   = useState({})  // { [fee_head_id]: bool }

  // UI state
  const [loading,   setLoading]   = useState(false)
  const [submitting,setSubmitting]= useState(false)
  const [toast,     setToast]     = useState(null)
  const [errors,    setErrors]    = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Student lookup on admno change ────────────────────────────────────────
  const handleAdmSearch = useCallback(() => {
    const key = admInput.trim().toUpperCase()
    if (!key) return

    if (!session) {
      setErrors(p => ({ ...p, session: 'Please select a session first' }))
      return
    }
    setErrors({})
    setLoading(true)
    setInstallments([])
    setSelections({})
    setStudent(null)
    setNotFound(false)
    setAdmNo(key)

    setTimeout(() => {
      const stu = STUDENTS[key]
      if (!stu) {
        setNotFound(true)
        setLoading(false)
        showToast(`No student found with Admission No. ${key}`, 'error')
        return
      }
      setStudent(stu)

      // Load fee data
      const data = FEE_DATA[feeType]?.[session] || []
      setInstallments(data)

      // Pre-check all heads
      const sel = {}
      data.forEach(inst => inst.heads.forEach(h => { sel[h.fee_head_id] = true }))
      setSelections(sel)

      setLoading(false)
      showToast(`Student found. ${data.length} installment${data.length !== 1 ? 's' : ''} loaded.`)
    }, 700)
  }, [admInput, session, feeType])

  // When fee type changes, reload installments for same student
  useEffect(() => {
    if (!admNo || !student || !session) return
    setLoading(true)
    setInstallments([])
    setSelections({})
    setTimeout(() => {
      const data = FEE_DATA[feeType]?.[session] || []
      setInstallments(data)
      const sel = {}
      data.forEach(inst => inst.heads.forEach(h => { sel[h.fee_head_id] = true }))
      setSelections(sel)
      setLoading(false)
    }, 400)
  }, [feeType]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Checkbox handlers ─────────────────────────────────────────────────────
  const handleToggleHead = useCallback((headId) => {
    setSelections(p => ({ ...p, [headId]: !p[headId] }))
  }, [])

  const handleToggleAll = useCallback((installmentNo, value) => {
    const inst = installments.find(i => i.installment_no === installmentNo)
    if (!inst) return
    const next = { ...selections }
    inst.heads.forEach(h => { next[h.fee_head_id] = value })
    setSelections(next)
  }, [installments, selections])

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const selected = Object.entries(selections)
      .filter(([, v]) => v)
      .map(([k]) => Number(k))

    if (selected.length === 0) {
      showToast('Please select at least one fee head.', 'error')
      return
    }
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      showToast(`Fee updated successfully! ${selected.length} head${selected.length !== 1 ? 's' : ''} updated.`)
    }, 1000)
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSession(''); setFeeType('regular'); setAdmInput(''); setAdmNo('')
    setStudent(null); setNotFound(false); setInstallments([])
    setSelections({}); setErrors({})
  }

  // ── Derived ───────────────────────────────────────────────────────────────
  const activeColor  = FEE_TYPES.find(f => f.key === feeType)?.color || 'blue'
  const hasResults   = !!student && installments.length > 0

  const totalSelected = useMemo(() => {
    let amount = 0, count = 0
    installments.forEach(inst => {
      inst.heads.forEach(h => {
        if (selections[h.fee_head_id]) { amount += h.head_amount; count++ }
      })
    })
    return { amount, count }
  }, [installments, selections])

  const totalAll = useMemo(() => installments.reduce((s, inst) =>
    s + inst.heads.reduce((ss, h) => ss + h.head_amount, 0), 0
  ), [installments])

  return (
    <div className="space-y-5 pb-28 max-w-5xl mx-auto px-0 sm:px-2">
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .fade-in{animation:fadeIn .3s cubic-bezier(.22,1,.36,1)}
      `}</style>

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5 leading-tight">
            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <IndianRupee className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
            </span>
            Update Student Fee
          </h1>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5 ml-10">
            Select fee heads to update for a student's installments
          </p>
        </div>
        {(session || admNo) && (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
              bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
              dark:hover:bg-slate-700 transition-colors flex-shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        )}
      </div>

      {/* ─── STEP 1: Filter Card ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Student</span>
          <span className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
            <Info className="w-3.5 h-3.5" /> Fill all fields then press Search
          </span>
        </div>

        <div className="p-5 space-y-4">
          {/* Row 1: Session + Fee Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Session */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Session <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={session}
                  onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                  className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                    bg-white text-slate-800 cursor-pointer
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                    ${errors.session ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                >
                  <option value="">-- Select Session --</option>
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              {errors.session && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500">
                  <AlertCircle className="w-3 h-3" />{errors.session}
                </p>
              )}
            </div>

            {/* Admission No */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> Admission No. <span className="text-rose-500">*</span>
              </label>
              <div className="flex gap-2">
                <input
                  value={admInput}
                  onChange={e => setAdmInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAdmSearch()}
                  placeholder="e.g. A001, A002…"
                  className="flex-1 min-w-0 px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                    bg-white text-slate-800 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400 border-slate-200"
                />
                <button
                  type="button"
                  onClick={handleAdmSearch}
                  disabled={loading || !admInput.trim()}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white
                    bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                    shadow-md shadow-blue-500/20 disabled:opacity-60 transition-all active:scale-95 flex-shrink-0"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </div>
          </div>

          {/* Fee Type Tabs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5" /> Fee Type
            </label>
            <FeeTypeTabs active={feeType} onChange={t => setFeeType(t)} />
          </div>

          {/* Demo hint */}
          <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-500/[0.05] border border-blue-100 dark:border-blue-500/15">
            <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              <strong>Demo students:</strong> Try Admission No.{' '}
              {['A001','A002','A003','A004','A005','A006'].map((a, i, arr) => (
                <span key={a}>
                  <button
                    type="button"
                    onClick={() => { setAdmInput(a) }}
                    className="font-bold underline underline-offset-2 hover:text-blue-900 dark:hover:text-blue-200 transition-colors"
                  >{a}</button>
                  {i < arr.length - 1 ? ', ' : ''}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>

      {/* ─── Loading skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-5 space-y-3">
          <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          {[1,2,3].map(i => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      )}

      {/* ─── Not found state ──────────────────────────────────────────────── */}
      {notFound && !loading && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/25 bg-rose-50 dark:bg-rose-500/5 p-8 text-center fade-in">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-3" />
          <p className="text-[15px] font-bold text-rose-700 dark:text-rose-400">Student Not Found</p>
          <p className="text-[12px] text-rose-500 dark:text-rose-400/70 mt-1">
            No student exists with Admission No. <strong>{admNo}</strong>. Please verify and try again.
          </p>
        </div>
      )}

      {/* ─── Student Info + Fee Heads ─────────────────────────────────────── */}
      {student && !loading && (
        <div className="fade-in space-y-5">

          {/* Student Info Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
              <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Details</span>
              <span className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center gap-1">
                <Check className="w-3 h-3" /> Found
              </span>
            </div>

            {/* Desktop: single row | Mobile: 2-col grid */}
            <div className="p-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <InfoField label="Admission No." value={admNo}         icon={Hash}      />
                <InfoField label="Class"         value={student.class} icon={BookOpen}  />
                <InfoField label="Student Name"  value={student.name}  icon={User}      />
                <InfoField label="Father's Name" value={student.father} icon={Users}    />
              </div>
            </div>
          </div>

          {/* ─── Fee Installments ─────────────────────────────────────────── */}
          {installments.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-500/25 bg-amber-50 dark:bg-amber-500/5 p-8 text-center fade-in">
              <ClipboardList className="w-10 h-10 text-amber-400 mx-auto mb-3" />
              <p className="text-[15px] font-bold text-amber-700 dark:text-amber-400">No Fee Structure Found</p>
              <p className="text-[12px] text-amber-600 dark:text-amber-400/70 mt-1">
                No {feeType} fee data available for session {session}. Please check the fee setup.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/60 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                  <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                    {FEE_TYPES.find(f => f.key === feeType)?.label} Fee — {session}
                  </span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                    {installments.length} installment{installments.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Summary chips */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                    <IndianRupee className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                      {formatINR(totalSelected.amount)} selected
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                    <IndianRupee className="w-3 h-3 text-slate-500" />
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">
                      {formatINR(totalAll)} total
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                {/* Desktop */}
                <div className="hidden md:block">
                  {installments.map(inst => (
                    <InstallmentDesktop
                      key={inst.installment_no}
                      installment={inst}
                      selections={selections}
                      onToggleHead={handleToggleHead}
                      onToggleAll={handleToggleAll}
                      feeColor={activeColor}
                    />
                  ))}
                </div>

                {/* Mobile */}
                <div className="md:hidden">
                  {installments.map(inst => (
                    <InstallmentMobile
                      key={inst.installment_no}
                      installment={inst}
                      selections={selections}
                      onToggleHead={handleToggleHead}
                      onToggleAll={handleToggleAll}
                      feeColor={activeColor}
                    />
                  ))}
                </div>
              </div>

              {/* Footer with Submit */}
              <div className="px-5 pb-5 pt-2 border-t border-slate-100 dark:border-[rgba(99,102,241,0.12)] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 flex items-center gap-2 text-[12px] text-slate-400 dark:text-slate-500">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Click a row to toggle selection. Use "Select All" on each installment for bulk action.
                </div>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || totalSelected.count === 0}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-[13px] font-bold text-white
                    bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                    shadow-lg shadow-blue-500/25 disabled:opacity-60 transition-all active:scale-95 flex-shrink-0"
                >
                  {submitting
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                    : <><Save className="w-4 h-4" /> Submit Update{totalSelected.count > 0 ? ` (${totalSelected.count})` : ''}</>
                  }
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ─── Empty / initial state ────────────────────────────────────────── */}
      {!student && !notFound && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <IndianRupee className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">No student selected</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Select a <strong>Session</strong>, choose <strong>Fee Type</strong>, enter an <strong>Admission No.</strong> and press Search.
            </p>
          </div>
          {/* Quick steps */}
          <div className="flex flex-col sm:flex-row gap-2 mt-2">
            {[
              { step: '1', label: 'Select Session',      color: 'blue'   },
              { step: '2', label: 'Choose Fee Type',     color: 'amber'  },
              { step: '3', label: 'Enter Admission No.', color: 'violet' },
              { step: '4', label: 'Press Search',        color: 'emerald'},
            ].map(({ step, label, color }) => (
              <div key={step}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[12px] font-semibold
                  bg-${color}-50 dark:bg-${color}-500/5 border-${color}-100 dark:border-${color}-500/15
                  text-${color}-700 dark:text-${color}-400`}
              >
                <span className={`w-5 h-5 rounded-full bg-${color}-100 dark:bg-${color}-500/20 flex items-center justify-center text-[10px] font-bold`}>
                  {step}
                </span>
                {label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Sticky summary footer (mobile) ──────────────────────────────── */}
      {hasResults && totalSelected.count > 0 && (
        <SelectionSummary installments={installments} selections={selections} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
