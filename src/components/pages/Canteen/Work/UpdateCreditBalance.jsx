/**
 * UpdateCreditBalance.jsx
 * Folder: src/pages/Tuckshop/UpdateCreditBalance.jsx
 *
 * Converts legacy ASPX "Update Credit Balance" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session dropdown filter
 *  - Show + Export buttons
 *  - Inline editable credit balance per student
 *  - Save / Cancel edit per row
 *  - Desktop: dense ERP-style table with inline edit
 *  - Mobile: card layout with tap-to-edit
 *  - Search by name or admission no
 *  - Toast notifications
 *  - Loading skeleton
 *  - Empty state
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  CreditCard, User, School2, Search,
  FileSpreadsheet, SlidersHorizontal,
  Pencil, Save, XCircle, Info,
  Wallet, GraduationCap, Hash, BookOpen,
  TrendingUp, ChevronRight
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CREDIT_DATA = {
  '2022-23': [
    { id: 1,  registration_no: 'ADM001', name: 'Aarav Sharma',      class_name: 'Class X - A',    credit_balance: 250 },
    { id: 2,  registration_no: 'ADM002', name: 'Priya Verma',       class_name: 'Class IX - B',   credit_balance: 120 },
    { id: 3,  registration_no: 'ADM003', name: 'Rohan Gupta',       class_name: 'Class VIII - A', credit_balance: 340 },
    { id: 4,  registration_no: 'ADM004', name: 'Sneha Patel',       class_name: 'Class XI - A',   credit_balance: 80  },
    { id: 5,  registration_no: 'ADM005', name: 'Karan Singh',       class_name: 'Class XII - B',  credit_balance: 500 },
    { id: 6,  registration_no: 'ADM006', name: 'Divya Mehta',       class_name: 'Class VII - A',  credit_balance: 175 },
    { id: 7,  registration_no: 'ADM007', name: 'Arjun Yadav',       class_name: 'Class VI - A',   credit_balance: 220 },
    { id: 8,  registration_no: 'ADM008', name: 'Pooja Joshi',       class_name: 'Class X - A',    credit_balance: 60  },
    { id: 9,  registration_no: 'ADM009', name: 'Vikram Mishra',     class_name: 'Class IX - A',   credit_balance: 410 },
    { id: 10, registration_no: 'ADM010', name: 'Anjali Tiwari',     class_name: 'Class XII - A',  credit_balance: 190 },
  ],
  '2023-24': [
    { id: 1,  registration_no: 'ADM101', name: 'Rahul Kumar',       class_name: 'Class XI - B',   credit_balance: 300 },
    { id: 2,  registration_no: 'ADM102', name: 'Neha Agarwal',      class_name: 'Class X - A',    credit_balance: 145 },
    { id: 3,  registration_no: 'ADM103', name: 'Siddharth Roy',     class_name: 'Class IX - A',   credit_balance: 275 },
    { id: 4,  registration_no: 'ADM104', name: 'Kavita Sharma',     class_name: 'Class VIII - B', credit_balance: 95  },
    { id: 5,  registration_no: 'ADM105', name: 'Amit Pandey',       class_name: 'Class XII - A',  credit_balance: 480 },
    { id: 6,  registration_no: 'ADM106', name: 'Ritu Singh',        class_name: 'Class VII - A',  credit_balance: 210 },
    { id: 7,  registration_no: 'ADM107', name: 'Manish Dubey',      class_name: 'Class XI - A',   credit_balance: 360 },
    { id: 8,  registration_no: 'ADM108', name: 'Sunita Rani',       class_name: 'Class VI - B',   credit_balance: 55  },
    { id: 9,  registration_no: 'ADM109', name: 'Deepak Chaudhary',  class_name: 'Class X - B',    credit_balance: 390 },
    { id: 10, registration_no: 'ADM110', name: 'Monika Srivastava', class_name: 'Class IX - B',   credit_balance: 165 },
    { id: 11, registration_no: 'ADM111', name: 'Tarun Saxena',      class_name: 'Class XII - B',  credit_balance: 520 },
    { id: 12, registration_no: 'ADM112', name: 'Poonam Dixit',      class_name: 'Class VIII - A', credit_balance: 130 },
  ],
  '2024-25': [
    { id: 1,  registration_no: 'ADM201', name: 'Harsh Raj',         class_name: 'Class X - A',    credit_balance: 420 },
    { id: 2,  registration_no: 'ADM202', name: 'Simran Kaur',       class_name: 'Class XI - B',   credit_balance: 200 },
    { id: 3,  registration_no: 'ADM203', name: 'Abhinav Sinha',     class_name: 'Class IX - A',   credit_balance: 315 },
    { id: 4,  registration_no: 'ADM204', name: 'Isha Trivedi',      class_name: 'Class XII - A',  credit_balance: 75  },
    { id: 5,  registration_no: 'ADM205', name: 'Nikhil Bajpai',     class_name: 'Class VII - B',  credit_balance: 560 },
    { id: 6,  registration_no: 'ADM206', name: 'Shruti Pathak',     class_name: 'Class VIII - A', credit_balance: 240 },
    { id: 7,  registration_no: 'ADM207', name: 'Gaurav Tomar',      class_name: 'Class XI - A',   credit_balance: 180 },
    { id: 8,  registration_no: 'ADM208', name: 'Ritika Bhatt',      class_name: 'Class VI - A',   credit_balance: 95  },
    { id: 9,  registration_no: 'ADM209', name: 'Yash Awasthi',      class_name: 'Class X - B',    credit_balance: 470 },
    { id: 10, registration_no: 'ADM210', name: 'Pallavi Garg',      class_name: 'Class IX - B',   credit_balance: 310 },
  ],
  '2025-26': [
    { id: 1,  registration_no: 'ADM301', name: 'Dev Prakash',       class_name: 'Class XI - A',   credit_balance: 600 },
    { id: 2,  registration_no: 'ADM302', name: 'Ananya Mishra',     class_name: 'Class X - B',    credit_balance: 155 },
    { id: 3,  registration_no: 'ADM303', name: 'Kunal Shukla',      class_name: 'Class XII - B',  credit_balance: 290 },
    { id: 4,  registration_no: 'ADM304', name: 'Megha Jain',        class_name: 'Class IX - A',   credit_balance: 430 },
    { id: 5,  registration_no: 'ADM305', name: 'Rohit Kapoor',      class_name: 'Class VIII - B', credit_balance: 110 },
    { id: 6,  registration_no: 'ADM306', name: 'Tanvi Rastogi',     class_name: 'Class VII - A',  credit_balance: 375 },
    { id: 7,  registration_no: 'ADM307', name: 'Ankit Chauhan',     class_name: 'Class XI - B',   credit_balance: 225 },
    { id: 8,  registration_no: 'ADM308', name: 'Sakshi Gupta',      class_name: 'Class X - A',    credit_balance: 490 },
    { id: 9,  registration_no: 'ADM309', name: 'Vivek Nagar',       class_name: 'Class XII - A',  credit_balance: 340 },
    { id: 10, registration_no: 'ADM310', name: 'Prachi Yadav',      class_name: 'Class IX - B',   credit_balance: 185 },
    { id: 11, registration_no: 'ADM311', name: 'Sourabh Tripathi',  class_name: 'Class VI - A',   credit_balance: 70  },
    { id: 12, registration_no: 'ADM312', name: 'Nidhi Soni',        class_name: 'Class VIII - A', credit_balance: 545 },
  ],
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const BALANCE_COLORS = [
  { range: [0, 100],    label: 'Low',    fg: '#dc2626', bg: '#fee2e2' },
  { range: [100, 300],  label: 'Medium', fg: '#d97706', bg: '#fef3c7' },
  { range: [300, 1000], label: 'Good',   fg: '#059669', bg: '#d1fae5' },
]
const balanceColor = (amount) =>
  BALANCE_COLORS.find(c => amount >= c.range[0] && amount < c.range[1]) || BALANCE_COLORS[2]

const avatarColor = (name = '') => {
  const colors = [
    { bg: '#dbeafe', fg: '#1d4ed8' }, { bg: '#ede9fe', fg: '#7c3aed' },
    { bg: '#d1fae5', fg: '#059669' }, { bg: '#fef3c7', fg: '#d97706' },
    { bg: '#fee2e2', fg: '#dc2626' }, { bg: '#cffafe', fg: '#0891b2' },
    { bg: '#fce7f3', fg: '#be185d' }, { bg: '#e0f2fe', fg: '#0369a1' },
  ]
  return colors[(name.charCodeAt(0) ?? 0) % colors.length]
}

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color, prefix }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
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

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, editingId, editValue, onEdit, onSave, onCancel, onEditChange }) {
  const isEditing = editingId === row.id
  const { fg, bg } = avatarColor(row.name)
  const bal = balanceColor(row.credit_balance)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Adm No */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-mono font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded-lg">
          <Hash className="w-3 h-3" />{row.registration_no}
        </span>
      </td>

      {/* Student Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {initials(row.name)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300 font-medium">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
          {row.class_name}
        </span>
      </td>

      {/* Credit Balance */}
      <td className="px-4 py-3 text-center">
        {isEditing ? (
          <input
            type="number"
            value={editValue}
            onChange={e => onEditChange(e.target.value)}
            className="w-28 text-center px-3 py-1.5 text-[13px] font-semibold rounded-lg border-2 border-blue-400
              bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-100 outline-none
              focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 transition-all"
            autoFocus
          />
        ) : (
          <span
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg text-[13px] font-bold tabular-nums"
            style={{ background: bal.bg, color: bal.fg }}
          >
            ₹{row.credit_balance.toLocaleString()}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onSave(row.id)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-sm shadow-emerald-500/25"
            >
              <Save className="w-3.5 h-3.5" /> Save
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-all"
            >
              <XCircle className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => onEdit(row.id, row.credit_balance)}
            disabled={editingId !== null}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
              opacity-0 group-hover:opacity-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────
function MobileCard({ row, idx, editingId, editValue, onEdit, onSave, onCancel, onEditChange }) {
  const isEditing = editingId === row.id
  const { fg, bg } = avatarColor(row.name)
  const bal = balanceColor(row.credit_balance)
  const [expanded, setExpanded] = useState(false)

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm transition-all
      ${isEditing
        ? 'border-blue-400 dark:border-blue-500/60 ring-2 ring-blue-100 dark:ring-blue-500/20'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'
      }`}
    >
      {/* Main row */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Avatar */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {initials(row.name)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-1.5 py-0.5 rounded">
              {row.registration_no}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{row.class_name}</span>
          </div>
        </div>

        {/* Balance + expand toggle */}
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span
            className="text-[16px] font-bold tabular-nums px-2 py-0.5 rounded-lg"
            style={{ background: bal.bg, color: bal.fg }}
          >
            ₹{row.credit_balance.toLocaleString()}
          </span>
          <button
            onClick={() => setExpanded(p => !p)}
            disabled={editingId !== null && !isEditing}
            className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-0.5 hover:text-blue-500 transition-colors disabled:opacity-30"
          >
            {expanded ? 'Hide' : 'Edit'}
            <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Edit panel */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          {isEditing ? (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block">
                  New Credit Balance (₹)
                </label>
                <input
                  type="number"
                  value={editValue}
                  onChange={e => onEditChange(e.target.value)}
                  className="w-full text-center px-3 py-2.5 text-[16px] font-bold rounded-xl border-2 border-blue-400
                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-100 outline-none
                    focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-500/30 transition-all"
                  autoFocus
                  placeholder="Enter amount"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { onSave(row.id); setExpanded(false) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                    bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
                <button
                  onClick={() => { onCancel(); setExpanded(false) }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                    bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-all"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onEdit(row.id, row.credit_balance)}
              disabled={editingId !== null}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
            >
              <Pencil className="w-4 h-4" /> Edit Credit Balance
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function UpdateCreditBalance() {
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

  // Inline edit state
  const [editingId,  setEditingId]  = useState(null)
  const [editValue,  setEditValue]  = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Load data ──────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setEditingId(null)

    setTimeout(() => {
      const data = (CREDIT_DATA[session] || []).map(d => ({ ...d }))
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} students for session ${session}.`)
    }, 650)
  }, [session])

  const handleReset = () => {
    setSession(''); setRows([]); setSearch('')
    setErrors({}); setShown(false); setShownSession('')
    setEditingId(null); setEditValue('')
  }

  // ── Edit handlers ──────────────────────────────────────────────────────────
  const handleEdit = useCallback((id, currentBalance) => {
    setEditingId(id)
    setEditValue(String(currentBalance))
  }, [])

  const handleSave = useCallback((id) => {
    const parsed = parseFloat(editValue)
    if (isNaN(parsed) || parsed < 0) {
      showToast('Please enter a valid amount (₹0 or more).', 'error')
      return
    }
    setRows(prev => prev.map(r => r.id === id ? { ...r, credit_balance: Math.round(parsed) } : r))
    setEditingId(null)
    setEditValue('')
    showToast('Credit balance updated successfully!')
  }, [editValue])

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setEditValue('')
  }, [])

  // ── Export placeholder ─────────────────────────────────────────────────────
  const handleExport = () => {
    if (rows.length === 0) { showToast('No data to export. Show records first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.registration_no.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Totals ────────────────────────────────────────────────────────────────
  const totalBalance = useMemo(() => rows.reduce((s, r) => s + r.credit_balance, 0), [rows])
  const avgBalance   = useMemo(() => rows.length ? Math.round(totalBalance / rows.length) : 0, [totalBalance, rows.length])
  const lowCount     = useMemo(() => rows.filter(r => r.credit_balance < 100).length, [rows])

  const hasResults   = shown && rows.length > 0
  const activeFilter = session ? 1 : 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Credit Balance
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and update student tuckshop credit balances by session.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExport}
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

      {/* ── DESKTOP Filter Card ───────────────────────────────────────────── */}
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

            <div />
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
          {activeFilter > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilter}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
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

      {/* ── Loading Skeleton ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={School2}    label="Total Students"   value={rows.length}   color="blue"   />
            <SummaryCard icon={Wallet}     label="Total Balance"    value={totalBalance}  color="emerald" prefix="₹" />
            <SummaryCard icon={TrendingUp} label="Avg. Balance"     value={avgBalance}    color="amber"  prefix="₹" />
            <SummaryCard icon={AlertCircle}label="Low Balance (<₹100)" value={lowCount}  color="violet" />
          </div>

          {/* Main Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student Credit Balances</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name or adm. no…"
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
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Click <strong>Edit</strong> on any row to update a student's credit balance. Changes save immediately.
                {editingId !== null && (
                  <span className="ml-2 text-amber-600 dark:text-amber-400 font-semibold">
                    ⚠ Finish current edit before editing another row.
                  </span>
                )}
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Adm. No.', 'Student Name', 'Class', 'Credit Balance', 'Action'].map((h, i) => (
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
                        editingId={editingId}
                        editValue={editValue}
                        onEdit={handleEdit}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onEditChange={setEditValue}
                      />
                    ))}
                  </tbody>
                  {/* Table footer totals */}
                  <tfoot>
                    <tr className="border-t-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07]">
                      <td className="px-4 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                      <td colSpan={3} className="px-4 py-3">
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Students
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
                          ₹{filtered.reduce((s, r) => s + r.credit_balance, 0).toLocaleString()}
                        </span>
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card and select Edit to update the credit balance.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard
                      key={row.id}
                      row={row}
                      idx={i + 1}
                      editingId={editingId}
                      editValue={editValue}
                      onEdit={handleEdit}
                      onSave={handleSave}
                      onCancel={handleCancel}
                      onEditChange={setEditValue}
                    />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Grand Total — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{filtered.length}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center col-span-2">
                        <p className="text-[20px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                          ₹{filtered.reduce((s, r) => s + r.credit_balance, 0).toLocaleString()}
                        </p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Total Credit Balance</p>
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
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> students
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

      {/* ── Empty State ───────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <CreditCard className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No records loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to view student credit balances.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
