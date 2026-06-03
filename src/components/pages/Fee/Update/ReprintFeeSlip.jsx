/**
 * ReprintFeeSlip.jsx
 * Folder: src/pages/FEE/ReprintFeeSlip.jsx
 *
 * Converts legacy ASPX "Reprint Fee Slip" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Fee Type: Regular / Transport toggle
 *  - Session, Admission No. (text search), Class, Adm No. (dropdown) filters
 *  - Show button → GridView of deposits (date, amount, receipt)
 *  - Each row: View (expand inline) + Print buttons
 *  - Nested GridView8: Fee Head Name, Amount, Month breakdown
 *  - Mobile: Fully card-based, accordion expand, thumb-friendly
 *  - Desktop: Dense ERP table with inline expand
 *  - Print slip modal
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Receipt, Bus, Search, RefreshCw, Eye, Printer,
  ChevronDown, ChevronUp, AlertCircle, X, Check,
  Loader2, SlidersHorizontal, Filter, CalendarDays,
  BadgeIndianRupee, Hash, BookOpen, FileText,
  ArrowLeft, Building2, MapPin, Phone, Mail,
  CheckCircle2, Info, CreditCard, TrendingUp,
  ChevronRight, ChevronLeft, User, GraduationCap,
  ReceiptText, Banknote, Tag
} from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  phone: '+91-135-2654321',
  email: 'info@svmschool.edu.in',
}

// Adm numbers per class
const ADM_BY_CLASS = {
  'Nursery':    ['NUR/001','NUR/002','NUR/003','NUR/004'],
  'LKG':        ['LKG/001','LKG/002','LKG/003'],
  'UKG':        ['UKG/001','UKG/002','UKG/003'],
  'Class I':    ['I/001','I/002','I/003','I/004','I/005'],
  'Class II':   ['II/001','II/002','II/003'],
  'Class III':  ['III/001','III/002','III/003'],
  'Class IV':   ['IV/001','IV/002'],
  'Class V':    ['V/001','V/002','V/003'],
  'Class VI':   ['VI/001','VI/002','VI/003','VI/004'],
  'Class VII':  ['VII/001','VII/002','VII/003'],
  'Class VIII': ['VIII/001','VIII/002'],
  'Class IX':   ['IX/001','IX/002','IX/003'],
  'Class X':    ['X/001','X/002','X/003'],
  'Class XI':   ['XI/001','XI/002','XI/003','XI/004'],
  'Class XII':  ['XII/001','XII/002','XII/003'],
}

// Student names map
const STUDENT_NAMES = {
  'NUR/001': 'Aarav Sharma',   'NUR/002': 'Priya Gupta',     'NUR/003': 'Rahul Verma',    'NUR/004': 'Sneha Joshi',
  'LKG/001': 'Amit Kumar',     'LKG/002': 'Kavita Singh',    'LKG/003': 'Ravi Mishra',
  'UKG/001': 'Pooja Tiwari',   'UKG/002': 'Sanjay Yadav',   'UKG/003': 'Anita Rawat',
  'I/001':   'Vikram Negi',    'I/002':   'Sunita Bisht',    'I/003':   'Deepak Pant',    'I/004':  'Rekha Chauhan',  'I/005': 'Mohan Lal',
  'II/001':  'Suresh Dubey',   'II/002':  'Geeta Thakur',    'II/003':  'Harish Bhatt',
  'III/001': 'Meena Devi',     'III/002': 'Rajesh Uniyal',   'III/003': 'Lalita Kandpal',
  'IV/001':  'Gopal Joshi',    'IV/002':  'Savita Negi',
  'V/001':   'Vinod Kumar',    'V/002':   'Pushpa Rawat',    'V/003':   'Anil Bisht',
  'VI/001':  'Ramesh Pande',   'VI/002':  'Sushma Verma',    'VI/003':  'Naresh Semwal',   'VI/004': 'Kamla Devi',
  'VII/001': 'Dinesh Bhatt',   'VII/002': 'Seema Lohani',    'VII/003': 'Girish Pant',
  'VIII/001':'Chandra Pal',    'VIII/002':'Kaveri Singh',
  'IX/001':  'Sunil Rawat',    'IX/002':  'Annu Kumari',     'IX/003':  'Praveen Negi',
  'X/001':   'Ajay Tiwari',    'X/002':   'Babita Joshi',    'X/003':   'Manoj Uniyal',
  'XI/001':  'Rohit Chauhan',  'XI/002':  'Sonia Gupta',     'XI/003':  'Tarun Bisht',     'XI/004': 'Priti Sharma',
  'XII/001': 'Vikas Negi',     'XII/002': 'Neha Rawat',      'XII/003': 'Aman Verma',
}

// Regular fee receipts
const REGULAR_RECEIPTS = {
  'I/001': [
    {
      id: 'r1', pay_date: '05-Apr-2025', dip_amt: 4850, receipt_no: 'REC/2025/1001',
      details: [
        { fee_head_name: 'Tuition Fee',      receive_amt: 2500, inst_no: 'April' },
        { fee_head_name: 'Development Fee',  receive_amt: 800,  inst_no: 'April' },
        { fee_head_name: 'Activity Fee',     receive_amt: 500,  inst_no: 'April' },
        { fee_head_name: 'Computer Fee',     receive_amt: 600,  inst_no: 'April' },
        { fee_head_name: 'Library Fee',      receive_amt: 450,  inst_no: 'April' },
      ]
    },
    {
      id: 'r2', pay_date: '08-May-2025', dip_amt: 3700, receipt_no: 'REC/2025/1048',
      details: [
        { fee_head_name: 'Tuition Fee',      receive_amt: 2500, inst_no: 'May' },
        { fee_head_name: 'Development Fee',  receive_amt: 800,  inst_no: 'May' },
        { fee_head_name: 'Activity Fee',     receive_amt: 400,  inst_no: 'May' },
      ]
    },
    {
      id: 'r3', pay_date: '03-Jun-2025', dip_amt: 3700, receipt_no: 'REC/2025/1092',
      details: [
        { fee_head_name: 'Tuition Fee',      receive_amt: 2500, inst_no: 'June' },
        { fee_head_name: 'Development Fee',  receive_amt: 800,  inst_no: 'June' },
        { fee_head_name: 'Activity Fee',     receive_amt: 400,  inst_no: 'June' },
      ]
    },
  ],
  'I/002': [
    {
      id: 'r4', pay_date: '04-Apr-2025', dip_amt: 4250, receipt_no: 'REC/2025/1002',
      details: [
        { fee_head_name: 'Tuition Fee',      receive_amt: 2500, inst_no: 'April' },
        { fee_head_name: 'Development Fee',  receive_amt: 800,  inst_no: 'April' },
        { fee_head_name: 'Activity Fee',     receive_amt: 500,  inst_no: 'April' },
        { fee_head_name: 'Library Fee',      receive_amt: 450,  inst_no: 'April' },
      ]
    },
    {
      id: 'r5', pay_date: '06-May-2025', dip_amt: 3300, receipt_no: 'REC/2025/1051',
      details: [
        { fee_head_name: 'Tuition Fee',      receive_amt: 2500, inst_no: 'May' },
        { fee_head_name: 'Development Fee',  receive_amt: 800,  inst_no: 'May' },
      ]
    },
  ],
  'VI/001': [
    {
      id: 'r6', pay_date: '02-Apr-2025', dip_amt: 5800, receipt_no: 'REC/2025/2001',
      details: [
        { fee_head_name: 'Tuition Fee',      receive_amt: 3200, inst_no: 'April' },
        { fee_head_name: 'Development Fee',  receive_amt: 1000, inst_no: 'April' },
        { fee_head_name: 'Science Lab Fee',  receive_amt: 600,  inst_no: 'April' },
        { fee_head_name: 'Computer Fee',     receive_amt: 600,  inst_no: 'April' },
        { fee_head_name: 'Library Fee',      receive_amt: 400,  inst_no: 'April' },
      ]
    },
    {
      id: 'r7', pay_date: '05-May-2025', dip_amt: 4200, receipt_no: 'REC/2025/2044',
      details: [
        { fee_head_name: 'Tuition Fee',      receive_amt: 3200, inst_no: 'May' },
        { fee_head_name: 'Development Fee',  receive_amt: 1000, inst_no: 'May' },
      ]
    },
  ],
  'IX/001': [
    {
      id: 'r8', pay_date: '01-Apr-2025', dip_amt: 7200, receipt_no: 'REC/2025/3001',
      details: [
        { fee_head_name: 'Tuition Fee',      receive_amt: 4000, inst_no: 'April' },
        { fee_head_name: 'Development Fee',  receive_amt: 1200, inst_no: 'April' },
        { fee_head_name: 'Science Lab Fee',  receive_amt: 800,  inst_no: 'April' },
        { fee_head_name: 'Computer Fee',     receive_amt: 700,  inst_no: 'April' },
        { fee_head_name: 'Library Fee',      receive_amt: 500,  inst_no: 'April' },
      ]
    },
    {
      id: 'r9', pay_date: '04-May-2025', dip_amt: 5200, receipt_no: 'REC/2025/3051',
      details: [
        { fee_head_name: 'Tuition Fee',      receive_amt: 4000, inst_no: 'May' },
        { fee_head_name: 'Development Fee',  receive_amt: 1200, inst_no: 'May' },
      ]
    },
    {
      id: 'r10', pay_date: '02-Jun-2025', dip_amt: 5200, receipt_no: 'REC/2025/3098',
      details: [
        { fee_head_name: 'Tuition Fee',      receive_amt: 4000, inst_no: 'June' },
        { fee_head_name: 'Development Fee',  receive_amt: 1200, inst_no: 'June' },
      ]
    },
  ],
}

// Transport fee receipts
const TRANSPORT_RECEIPTS = {
  'I/001': [
    {
      id: 't1', pay_date: '05-Apr-2025', dip_amt: 1200, receipt_no: 'TRP/2025/0201',
      details: [
        { fee_head_name: 'Transport Fee',    receive_amt: 1000, inst_no: 'April' },
        { fee_head_name: 'Fuel Surcharge',   receive_amt: 200,  inst_no: 'April' },
      ]
    },
    {
      id: 't2', pay_date: '08-May-2025', dip_amt: 1200, receipt_no: 'TRP/2025/0241',
      details: [
        { fee_head_name: 'Transport Fee',    receive_amt: 1000, inst_no: 'May' },
        { fee_head_name: 'Fuel Surcharge',   receive_amt: 200,  inst_no: 'May' },
      ]
    },
  ],
  'VI/001': [
    {
      id: 't3', pay_date: '02-Apr-2025', dip_amt: 1400, receipt_no: 'TRP/2025/0302',
      details: [
        { fee_head_name: 'Transport Fee',    receive_amt: 1200, inst_no: 'April' },
        { fee_head_name: 'Fuel Surcharge',   receive_amt: 200,  inst_no: 'April' },
      ]
    },
  ],
}

// Default fallback receipts for any adm
const DEFAULT_RECEIPTS = [
  {
    id: 'def1', pay_date: '05-Apr-2025', dip_amt: 3500, receipt_no: 'REC/2025/9001',
    details: [
      { fee_head_name: 'Tuition Fee',     receive_amt: 2500, inst_no: 'April' },
      { fee_head_name: 'Development Fee', receive_amt: 600,  inst_no: 'April' },
      { fee_head_name: 'Activity Fee',    receive_amt: 400,  inst_no: 'April' },
    ]
  },
  {
    id: 'def2', pay_date: '06-May-2025', dip_amt: 3100, receipt_no: 'REC/2025/9044',
    details: [
      { fee_head_name: 'Tuition Fee',     receive_amt: 2500, inst_no: 'May' },
      { fee_head_name: 'Development Fee', receive_amt: 600,  inst_no: 'May' },
    ]
  },
]

const DEFAULT_TRANSPORT = [
  {
    id: 'td1', pay_date: '05-Apr-2025', dip_amt: 1200, receipt_no: 'TRP/2025/9001',
    details: [
      { fee_head_name: 'Transport Fee', receive_amt: 1000, inst_no: 'April' },
      { fee_head_name: 'Fuel Surcharge',receive_amt: 200,  inst_no: 'April' },
    ]
  },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getReceipts(feeType, admNo) {
  const src = feeType === 'transport' ? TRANSPORT_RECEIPTS : REGULAR_RECEIPTS
  const def = feeType === 'transport' ? DEFAULT_TRANSPORT : DEFAULT_RECEIPTS
  return src[admNo] || def
}

function formatCurrency(n) {
  return '₹' + Number(n).toLocaleString('en-IN')
}

// ─── REUSABLE PRIMITIVES ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 font-medium
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}
          ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
        {Icon && <Icon className="w-3 h-3 text-slate-400" />}
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

function Badge({ children, color = 'blue' }) {
  const map = {
    blue:    'bg-blue-50 text-blue-700 border-blue-100',
    green:   'bg-emerald-50 text-emerald-700 border-emerald-100',
    amber:   'bg-amber-50 text-amber-700 border-amber-100',
    violet:  'bg-violet-50 text-violet-700 border-violet-100',
    rose:    'bg-rose-50 text-rose-700 border-rose-100',
    slate:   'bg-slate-100 text-slate-600 border-slate-200',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${map[color]}`}>
      {children}
    </span>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
      rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
      ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}>
      {type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-70 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── FEE TYPE TOGGLE ──────────────────────────────────────────────────────────

function FeeTypeToggle({ value, onChange }) {
  return (
    <div className="flex rounded-xl border border-slate-200 overflow-hidden bg-slate-50 p-1 gap-1">
      {[
        { val: 'regular',   label: 'Regular Fee',   Icon: Receipt },
        { val: 'transport', label: 'Transport Fee',  Icon: Bus },
      ].map(({ val, label, Icon }) => (
        <button
          key={val}
          type="button"
          onClick={() => onChange(val)}
          className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-[12px] font-bold transition-all
            ${value === val
              ? val === 'transport'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
              : 'text-slate-500 hover:bg-white hover:text-slate-700'}`}
        >
          <Icon className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{label}</span>
          <span className="sm:hidden">{val === 'regular' ? 'Regular' : 'Transport'}</span>
        </button>
      ))}
    </div>
  )
}

// ─── PRINT MODAL ─────────────────────────────────────────────────────────────

function PrintModal({ receipt, student, admNo, feeType, session, className, onClose }) {
  const total = receipt.details.reduce((s, d) => s + d.receive_amt, 0)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{ animation: 'modalPop .2s ease' }}>
        <style>{`@keyframes modalPop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>

        {/* Header */}
        <div className={`px-6 pt-6 pb-4 text-white ${feeType === 'transport' ? 'bg-gradient-to-r from-amber-500 to-orange-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-80 mb-0.5">
                {feeType === 'transport' ? 'Transport Fee Receipt' : 'Fee Receipt'}
              </p>
              <p className="text-[18px] font-extrabold leading-tight">{SCHOOL_INFO.name}</p>
              <p className="text-[11px] opacity-80 mt-0.5">{SCHOOL_INFO.address}</p>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 flex-shrink-0 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          {/* Student info */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 pb-4 border-b border-dashed border-slate-200">
            {[
              ['Student Name', student],
              ['Adm. No.',     admNo],
              ['Class',        className],
              ['Session',      session],
              ['Receipt No.',  receipt.receipt_no],
              ['Date',         receipt.pay_date],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{k}</p>
                <p className="text-[12px] text-slate-700 font-bold">{v}</p>
              </div>
            ))}
          </div>

          {/* Fee details table */}
          <table className="w-full mb-4 text-[12px]">
            <thead>
              <tr className="bg-slate-50 border-y border-slate-200">
                <th className="py-2 px-3 text-left text-[10px] font-bold uppercase text-slate-400 tracking-wide">Fee Head</th>
                <th className="py-2 px-3 text-center text-[10px] font-bold uppercase text-slate-400 tracking-wide">Month</th>
                <th className="py-2 px-3 text-right text-[10px] font-bold uppercase text-slate-400 tracking-wide">Amount</th>
              </tr>
            </thead>
            <tbody>
              {receipt.details.map((d, i) => (
                <tr key={i} className="border-b border-slate-100">
                  <td className="py-2 px-3 text-slate-700 font-medium">{d.fee_head_name}</td>
                  <td className="py-2 px-3 text-center text-slate-500">{d.inst_no}</td>
                  <td className="py-2 px-3 text-right text-slate-700 font-semibold tabular-nums">{formatCurrency(d.receive_amt)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className={`${feeType === 'transport' ? 'bg-amber-50 text-amber-800' : 'bg-blue-50 text-blue-800'}`}>
                <td colSpan={2} className="py-2.5 px-3 font-extrabold text-[13px]">Total Amount</td>
                <td className="py-2.5 px-3 text-right font-extrabold text-[15px] tabular-nums">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>

          <p className="text-center text-[10px] text-slate-400 border-t border-dashed border-slate-200 pt-3">
            This is a computer-generated receipt. No signature required.
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors">
            Close
          </button>
          <button
            onClick={() => window.print()}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all
              ${feeType === 'transport' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
            <Printer className="w-4 h-4" /> Print
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── FEE DETAIL TABLE (nested) ────────────────────────────────────────────────

function FeeDetailTable({ details }) {
  const total = details.reduce((s, d) => s + d.receive_amt, 0)
  return (
    <div className="rounded-xl overflow-hidden border border-blue-100 bg-blue-50/50 mt-1">
      <table className="w-full text-[12px]">
        <thead>
          <tr className="bg-blue-100/70 border-b border-blue-200">
            <th className="py-2 px-3 text-left font-bold text-blue-700 text-[10px] uppercase tracking-wide w-8">#</th>
            <th className="py-2 px-3 text-left font-bold text-blue-700 text-[10px] uppercase tracking-wide">Fee Head</th>
            <th className="py-2 px-3 text-center font-bold text-blue-700 text-[10px] uppercase tracking-wide">Month</th>
            <th className="py-2 px-3 text-right font-bold text-blue-700 text-[10px] uppercase tracking-wide">Amount</th>
          </tr>
        </thead>
        <tbody>
          {details.map((d, i) => (
            <tr key={i} className="border-b border-blue-100 last:border-0 bg-white/70 hover:bg-blue-50/50 transition-colors">
              <td className="py-2 px-3 text-slate-400 tabular-nums">{i + 1}</td>
              <td className="py-2 px-3 text-slate-700 font-medium">{d.fee_head_name}</td>
              <td className="py-2 px-3 text-center">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold border border-slate-200">
                  {d.inst_no}
                </span>
              </td>
              <td className="py-2 px-3 text-right font-bold text-slate-700 tabular-nums">{formatCurrency(d.receive_amt)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-blue-100/80 border-t border-blue-200">
            <td colSpan={3} className="py-2 px-3 font-extrabold text-blue-800 text-[12px]">Total</td>
            <td className="py-2 px-3 text-right font-extrabold text-blue-800 text-[13px] tabular-nums">{formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

// ─── DESKTOP RECEIPT ROW ──────────────────────────────────────────────────────

function DesktopReceiptRow({ receipt, idx, feeType, onView, onPrint, isExpanded, onToggle }) {
  return (
    <>
      <tr className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${isExpanded ? 'bg-blue-50/30' : ''}`}>
        <td className="px-4 py-3.5 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-3.5 h-3.5 text-slate-500" />
            </span>
            <span className="text-[13px] font-semibold text-slate-700">{receipt.pay_date}</span>
          </div>
        </td>
        <td className="px-4 py-3.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[13px] font-bold
            ${feeType === 'transport'
              ? 'bg-amber-50 text-amber-700 border border-amber-100'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
            <BadgeIndianRupee className="w-3.5 h-3.5" />
            {formatCurrency(receipt.dip_amt)}
          </span>
        </td>
        <td className="px-4 py-3.5">
          <div className="flex items-center gap-1.5">
            <ReceiptText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-[12px] font-mono font-semibold text-slate-600">{receipt.receipt_no}</span>
          </div>
        </td>
        <td className="px-4 py-3.5 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onToggle(receipt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all
                ${isExpanded
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              <Eye className="w-3.5 h-3.5" />
              {isExpanded ? 'Hide' : 'View'}
              {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            <button
              onClick={() => onPrint(receipt)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-sm shadow-blue-500/20">
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr className="border-b border-slate-100 bg-blue-50/20">
          <td />
          <td colSpan={4} className="px-4 pb-4 pt-1">
            <FeeDetailTable details={receipt.details} />
          </td>
        </tr>
      )}
    </>
  )
}

// ─── MOBILE RECEIPT CARD ──────────────────────────────────────────────────────

function MobileReceiptCard({ receipt, idx, feeType, onPrint }) {
  const [expanded, setExpanded] = useState(false)
  const total = receipt.details.reduce((s, d) => s + d.receive_amt, 0)

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm transition-all
      ${expanded ? 'border-blue-200 bg-blue-50/30' : 'border-slate-200 bg-white'}`}>

      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 p-4 text-left hover:bg-slate-50/60 transition-colors">

        {/* Receipt icon badge */}
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-[11px] font-bold
          ${feeType === 'transport' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-[13px] font-bold text-slate-800">{receipt.receipt_no}</span>
            <span className={`text-[15px] font-extrabold tabular-nums
              ${feeType === 'transport' ? 'text-amber-600' : 'text-emerald-600'}`}>
              {formatCurrency(receipt.dip_amt)}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center gap-1 text-[11px] text-slate-500">
              <CalendarDays className="w-3 h-3" /> {receipt.pay_date}
            </span>
            <span className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-500">{receipt.details.length} fee heads</span>
          </div>
        </div>

        <span className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform duration-200 mt-1
          ${expanded ? 'bg-blue-100 text-blue-600 rotate-180' : 'bg-slate-100 text-slate-400'}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Fee breakdown cards */}
          <div className="space-y-2">
            {receipt.details.map((d, i) => (
              <div key={i} className="flex items-center justify-between bg-white rounded-xl border border-slate-100 px-3 py-2.5 shadow-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-md bg-blue-50 text-blue-600 flex items-center justify-center text-[9px] font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[12px] font-semibold text-slate-700 truncate">{d.fee_head_name}</p>
                    <p className="text-[10px] text-slate-400">{d.inst_no}</p>
                  </div>
                </div>
                <span className="text-[13px] font-bold text-slate-700 tabular-nums ml-2 flex-shrink-0">
                  {formatCurrency(d.receive_amt)}
                </span>
              </div>
            ))}
          </div>

          {/* Total row */}
          <div className={`flex items-center justify-between rounded-xl px-4 py-3 font-extrabold
            ${feeType === 'transport' ? 'bg-amber-500 text-white' : 'bg-blue-600 text-white'}`}>
            <span className="text-[13px]">Total Amount</span>
            <span className="text-[16px] tabular-nums">{formatCurrency(total)}</span>
          </div>

          {/* Print button */}
          <button
            onClick={() => onPrint(receipt)}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white transition-all
              ${feeType === 'transport' ? 'bg-amber-500 hover:bg-amber-600 shadow-md shadow-amber-500/25' : 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25'}`}>
            <Printer className="w-4 h-4" /> Print Fee Slip
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ────────────────────────────────────────────────────

function MobileFilterDrawer({ open, onClose, form, setForm, admOptions, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white border-t border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}>
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="text-[14px] font-bold text-slate-800">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Fee Type */}
          <Field label="Fee Type" icon={Tag}>
            <FeeTypeToggle value={form.feeType} onChange={v => setForm(p => ({ ...p, feeType: v, admNo: '' }))} />
          </Field>

          {/* Session */}
          <Field label="Session" icon={CalendarDays} error={errors.session} required>
            <NativeSelect value={form.session} onChange={e => setForm(p => ({ ...p, session: e.target.value }))}
              placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          {/* Admission No text */}
          <Field label="Admission No. (type to search)" icon={Search}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input value={form.txtAdm}
                onChange={e => setForm(p => ({ ...p, txtAdm: e.target.value }))}
                placeholder="Type admission no…"
                className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border border-slate-200 outline-none
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-slate-700 font-medium" />
            </div>
          </Field>

          {/* Class */}
          <Field label="Class" icon={GraduationCap} error={errors.cls} required>
            <NativeSelect value={form.cls}
              onChange={e => setForm(p => ({ ...p, cls: e.target.value, admNo: '' }))}
              placeholder="-- Select Class --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          {/* Adm Dropdown */}
          <Field label="Select Adm No." icon={User} error={errors.admNo} required>
            <NativeSelect value={form.admNo}
              onChange={e => setForm(p => ({ ...p, admNo: e.target.value }))}
              placeholder="-- Select Adm No. --" error={errors.admNo}
              disabled={!form.cls}>
              {admOptions.map(a => <option key={a} value={a}>{a} — {STUDENT_NAMES[a] || a}</option>)}
            </NativeSelect>
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700">
            Cancel
          </button>
          <button onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Slips
          </button>
        </div>
      </div>
    </>
  )
}

// ─── STUDENT INFO BANNER ──────────────────────────────────────────────────────

function StudentBanner({ admNo, cls, session, feeType, count }) {
  const name = STUDENT_NAMES[admNo] || 'Student'
  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm
      ${feeType === 'transport'
        ? 'border-amber-200 bg-gradient-to-r from-amber-50 via-white to-orange-50'
        : 'border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4">
        {/* Avatar */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-[18px] font-extrabold flex-shrink-0
          ${feeType === 'transport' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
          {name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-[16px] font-extrabold text-slate-800">{name}</h3>
            <Badge color={feeType === 'transport' ? 'amber' : 'blue'}>
              {feeType === 'transport' ? '🚌 Transport' : '📚 Regular'}
            </Badge>
          </div>
          <div className="flex items-center gap-3 flex-wrap text-[12px] text-slate-500">
            <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{admNo}</span>
            <span className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{cls}</span>
            <span className="flex items-center gap-1"><CalendarDays className="w-3 h-3" />Session: {session}</span>
          </div>
        </div>
        <div className={`flex-shrink-0 text-center px-4 py-2 rounded-xl
          ${feeType === 'transport' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
          <p className="text-[22px] font-extrabold tabular-nums leading-tight">{count}</p>
          <p className="text-[10px] font-bold uppercase tracking-wide">Receipts</p>
        </div>
      </div>
    </div>
  )
}

// ─── SUMMARY STATS ROW ────────────────────────────────────────────────────────

function SummaryStats({ receipts, feeType }) {
  const totalPaid = receipts.reduce((s, r) => s + r.dip_amt, 0)
  const months = [...new Set(receipts.flatMap(r => r.details.map(d => d.inst_no)))]
  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: 'Total Paid',  value: formatCurrency(totalPaid), color: feeType === 'transport' ? 'amber' : 'green', icon: Banknote },
        { label: 'Receipts',   value: receipts.length,            color: 'blue',   icon: ReceiptText },
        { label: 'Months',     value: months.length,              color: 'violet', icon: CalendarDays },
      ].map(({ label, value, color, icon: Icon }) => {
        const colors = {
          green:  'bg-emerald-50 text-emerald-600 border-emerald-100',
          amber:  'bg-amber-50 text-amber-600 border-amber-100',
          blue:   'bg-blue-50 text-blue-600 border-blue-100',
          violet: 'bg-violet-50 text-violet-600 border-violet-100',
        }
        return (
          <div key={label} className={`flex flex-col items-center justify-center rounded-xl border p-3 ${colors[color]}`}>
            <Icon className="w-4 h-4 mb-1 opacity-70" />
            <p className="text-[18px] sm:text-[20px] font-extrabold tabular-nums leading-tight">{value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wide mt-0.5 opacity-80">{label}</p>
          </div>
        )
      })}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ReprintFeeSlip() {
  const [form, setForm] = useState({
    feeType: 'regular',
    session: '',
    txtAdm:  '',
    cls:     '',
    admNo:   '',
  })
  const [errors,      setErrors]      = useState({})
  const [loading,     setLoading]     = useState(false)
  const [receipts,    setReceipts]    = useState([])
  const [shown,       setShown]       = useState(false)
  const [shownInfo,   setShownInfo]   = useState(null)
  const [expandedIds, setExpandedIds] = useState(new Set())
  const [printReceipt,setPrintReceipt]= useState(null)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [toast,       setToast]       = useState(null)
  const resultsRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Adm dropdown options based on class
  const admOptions = useMemo(() =>
    form.cls ? (ADM_BY_CLASS[form.cls] || []) : [],
    [form.cls]
  )

  // Filter adm by txtAdm search
  const filteredAdm = useMemo(() => {
    if (!form.txtAdm.trim()) return admOptions
    const q = form.txtAdm.toLowerCase()
    return admOptions.filter(a =>
      a.toLowerCase().includes(q) ||
      (STUDENT_NAMES[a] || '').toLowerCase().includes(q)
    )
  }, [admOptions, form.txtAdm])

  // When class changes, reset admNo
  useEffect(() => {
    setForm(p => ({ ...p, admNo: '' }))
  }, [form.cls])

  // Show report
  const handleShow = useCallback(() => {
    const err = {}
    if (!form.session) err.session = 'Please select a session'
    if (!form.cls)     err.cls     = 'Please select a class'
    if (!form.admNo)   err.admNo   = 'Please select an admission no.'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setExpandedIds(new Set())

    setTimeout(() => {
      const data = getReceipts(form.feeType, form.admNo)
      setReceipts(data)
      setShownInfo({ ...form })
      setShown(true)
      setLoading(false)
      showToast(`${data.length} receipt(s) found for ${STUDENT_NAMES[form.admNo] || form.admNo}`)
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
    }, 700)
  }, [form])

  const handleReset = () => {
    setForm({ feeType: 'regular', session: '', txtAdm: '', cls: '', admNo: '' })
    setErrors({}); setShown(false); setShownInfo(null)
    setReceipts([]); setExpandedIds(new Set())
  }

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const s = new Set(prev)
      s.has(id) ? s.delete(id) : s.add(id)
      return s
    })
  }

  const hasResults = shown && receipts.length > 0
  const activeFilters = [form.session, form.cls, form.admNo].filter(Boolean).length

  return (
    <div className="space-y-4 pb-14 max-w-5xl mx-auto">
      <style>{`
        .fade-in { animation: fadeIn .3s ease; }
        @keyframes fadeIn { from { opacity:0; transform:translateY(6px) } to { opacity:1; transform:none } }
      `}</style>

      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-extrabold text-slate-800 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <ReceiptText className="w-4 h-4 text-white" />
            </span>
            Reprint Fee Slip
          </h1>
          <p className="text-[12px] text-slate-500 mt-0.5 ml-10.5">
            Search and reprint student fee receipts — Regular &amp; Transport.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <span className="w-1 h-5 rounded-full bg-blue-500" />
          <Filter className="w-4 h-4 text-blue-600" />
          <span className="text-[14px] font-bold text-slate-700 flex-1">Search Filters</span>
          {(form.session || form.cls || form.admNo) && (
            <button onClick={handleReset}
              className="flex items-center gap-1 text-[12px] text-slate-400 hover:text-rose-500 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        <div className="p-5 space-y-4">
          {/* Row 1: Fee type */}
          <Field label="Fee Type" icon={Tag}>
            <FeeTypeToggle value={form.feeType}
              onChange={v => setForm(p => ({ ...p, feeType: v, admNo: '' }))} />
          </Field>

          {/* Row 2: Session + txtAdm + Class + AdmNo + Button */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <Field label="Session" icon={CalendarDays} error={errors.session} required>
              <NativeSelect value={form.session}
                onChange={e => setForm(p => ({ ...p, session: e.target.value }))}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Admission No. (search)" icon={Search}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input value={form.txtAdm}
                  onChange={e => setForm(p => ({ ...p, txtAdm: e.target.value }))}
                  placeholder="Type to filter…"
                  className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border border-slate-200 outline-none
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-slate-700 font-medium" />
              </div>
            </Field>

            <Field label="Class" icon={GraduationCap} error={errors.cls} required>
              <NativeSelect value={form.cls}
                onChange={e => setForm(p => ({ ...p, cls: e.target.value, admNo: '' }))}
                placeholder="-- Select Class --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Select Adm No." icon={User} error={errors.admNo} required>
              <NativeSelect value={form.admNo}
                onChange={e => setForm(p => ({ ...p, admNo: e.target.value }))}
                placeholder="-- Select Adm No. --" error={errors.admNo}
                disabled={!form.cls}>
                {(form.txtAdm.trim() ? filteredAdm : admOptions).map(a =>
                  <option key={a} value={a}>{a} — {STUDENT_NAMES[a] || a}</option>
                )}
              </NativeSelect>
            </Field>

            <div className="flex gap-2">
              <button onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button onClick={handleReset}
                className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors" title="Reset">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white bg-blue-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {form.admNo
            ? `${form.admNo} · ${form.feeType === 'transport' ? 'Transport' : 'Regular'}`
            : 'Select Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/20 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {(form.session || form.cls) && (
          <button onClick={handleReset}
            className="px-3.5 py-3 rounded-xl bg-slate-100 text-slate-600">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <MobileFilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        form={form}
        setForm={setForm}
        admOptions={form.txtAdm.trim() ? filteredAdm : admOptions}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 fade-in">
          <div className="h-16 rounded-xl bg-slate-100 animate-pulse mb-4" />
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse" />)}
          </div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <div ref={resultsRef} className="space-y-4 fade-in">

          {/* Student Banner */}
          <StudentBanner
            admNo={shownInfo.admNo}
            cls={shownInfo.cls}
            session={shownInfo.session}
            feeType={shownInfo.feeType}
            count={receipts.length}
          />

          {/* Summary stats */}
          <SummaryStats receipts={receipts} feeType={shownInfo.feeType} />

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <ReceiptText className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 flex-1">
                Fee Receipts
                <span className="ml-2 text-[12px] font-normal text-slate-400">· {shownInfo.session}</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[11px] font-bold">
                {receipts.length} receipt{receipts.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 bg-blue-50/30 border-b border-slate-100">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700">
                Click <strong>View</strong> to expand fee breakdown, <strong>Print</strong> to reprint the slip.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['#', 'Deposit Date', 'Amount', 'Receipt No.', 'Actions'].map((h, i) => (
                      <th key={i}
                        className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500
                          ${i === 4 ? 'text-right' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {receipts.map((r, i) => (
                    <DesktopReceiptRow
                      key={r.id}
                      receipt={r}
                      idx={i + 1}
                      feeType={shownInfo.feeType}
                      onPrint={setPrintReceipt}
                      isExpanded={expandedIds.has(r.id)}
                      onToggle={toggleExpand}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              <p className="flex items-center gap-1.5 text-[11px] text-blue-600 font-medium pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to see fee breakdown.
              </p>
              {receipts.map((r, i) => (
                <MobileReceiptCard
                  key={r.id}
                  receipt={r}
                  idx={i + 1}
                  feeType={shownInfo.feeType}
                  onPrint={setPrintReceipt}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <p className="text-[12px] text-slate-400">
                Showing <span className="font-semibold text-slate-600">{receipts.length}</span> receipt{receipts.length !== 1 ? 's' : ''}
              </p>
              <button onClick={handleReset}
                className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-rose-500 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" /> New Search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center">
            <ReceiptText className="w-8 h-8 text-blue-200" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 mb-1">No receipts loaded yet</p>
            <p className="text-[12px] text-slate-400 max-w-xs">
              Select fee type, session, class &amp; admission no., then click <strong>Show</strong>.
            </p>
          </div>
          {/* Quick step guide */}
          <div className="flex items-center gap-2 flex-wrap justify-center mt-2">
            {['Select Fee Type', 'Choose Session', 'Pick Class', 'Select Adm No.', 'Click Show'].map((step, i, arr) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-600">{step}</span>
                </div>
                {i < arr.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Print Modal ──────────────────────────────────────────────── */}
      {printReceipt && shownInfo && (
        <PrintModal
          receipt={printReceipt}
          student={STUDENT_NAMES[shownInfo.admNo] || shownInfo.admNo}
          admNo={shownInfo.admNo}
          feeType={shownInfo.feeType}
          session={shownInfo.session}
          className={shownInfo.cls}
          onClose={() => setPrintReceipt(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
