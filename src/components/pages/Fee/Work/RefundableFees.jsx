/**
 * RefundableFees.jsx
 * Student Security Amount Information (Refundable)
 * Premium ERP-style, fully responsive — desktop table + mobile cards
 * Mirrors the ASPX workflow: search student → select session/head → add deduction → view ledger
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Search, User, BookOpen, CreditCard, Calendar, FileText,
  Plus, Trash2, RefreshCw, ChevronDown, AlertCircle, X,
  Check, Loader2, TrendingDown, Wallet, ArrowUpRight,
  ArrowDownRight, Shield, Info, Filter, ChevronRight,
  SlidersHorizontal, ReceiptIndianRupee, GraduationCap,
  BadgeIndianRupee, Clock, Eye
} from 'lucide-react'

// ─── DUMMY DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const FEE_HEADS = [
  { id: 1, name: 'Security Deposit' },
  { id: 2, name: 'Library Security' },
  { id: 3, name: 'Lab Security' },
  { id: 4, name: 'Book Bank Deposit' },
  { id: 5, name: 'Uniform Deposit' },
]

const STUDENTS = {
  'ADM001': { name: 'Aarav Sharma', class: 'Class X - A', rollNo: '01' },
  'ADM002': { name: 'Priya Singh', class: 'Class IX - B', rollNo: '12' },
  'ADM003': { name: 'Rahul Verma', class: 'Class XII - A', rollNo: '05' },
  'ADM004': { name: 'Sneha Gupta', class: 'Class VIII - A', rollNo: '18' },
  'ADM005': { name: 'Aryan Patel', class: 'Class XI - B', rollNo: '22' },
}

// Per student, per session deposit amounts
const DEPOSITS = {
  'ADM001-2024-25-1': 2000,
  'ADM001-2024-25-2': 500,
  'ADM001-2023-24-1': 2000,
  'ADM002-2024-25-1': 1500,
  'ADM002-2024-25-3': 1000,
  'ADM003-2025-26-1': 2500,
  'ADM004-2024-25-1': 2000,
  'ADM004-2024-25-5': 800,
  'ADM005-2025-26-1': 2000,
}

// Pre-existing deduction records
const INITIAL_RECORDS = {
  'ADM001-2024-25-1': [
    { id: 1, name: 'Aarav Sharma', class: 'Class X - A', session: '2024-25', fee_head_id: 1, deduction_amt: 300, date: '2024-08-10', reason: 'Book damage', row_id: 'r1' },
    { id: 2, name: 'Aarav Sharma', class: 'Class X - A', session: '2024-25', fee_head_id: 1, deduction_amt: 150, date: '2024-11-20', reason: 'Lost ID card', row_id: 'r2' },
  ],
  'ADM002-2024-25-1': [
    { id: 3, name: 'Priya Singh', class: 'Class IX - B', session: '2024-25', fee_head_id: 1, deduction_amt: 200, date: '2024-09-05', reason: 'Lab equipment damage', row_id: 'r3' },
  ],
}

// ─── HELPER ──────────────────────────────────────────────────────────────────

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

const today = () => {
  const d = new Date()
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

// ─── TOAST ───────────────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl
        text-[13px] font-semibold min-w-[260px] max-w-[90vw] -translate-x-1/2
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}
      style={{ animation: 'toastUp .25s ease' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  )
}

// ─── STAT BADGE ──────────────────────────────────────────────────────────────

function StatBadge({ label, value, color, icon: Icon }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20',
    red:     'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:border-rose-500/20',
    green:   'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20',
    amber:   'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20',
  }
  return (
    <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 flex-1 min-w-0 ${colors[color]}`}>
      <Icon className="w-5 h-5 flex-shrink-0 opacity-80" />
      <div className="min-w-0">
        <p className="text-[18px] font-bold tabular-nums leading-tight truncate">{value}</p>
        <p className="text-[10px] font-semibold uppercase tracking-wide opacity-70 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── STUDENT INFO CARD ───────────────────────────────────────────────────────

function StudentCard({ student, admNo }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50
      dark:border-indigo-500/20 dark:from-[#1a1f35] dark:to-[#1e2238] px-4 py-3">
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
        <GraduationCap className="w-5 h-5 text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
        <p className="text-[12px] text-slate-500 dark:text-slate-400">{student.class} · Adm No: <span className="font-semibold text-blue-600 dark:text-blue-400">{admNo}</span></p>
      </div>
      <span className="text-[11px] font-bold px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0">ACTIVE</span>
    </div>
  )
}

// ─── FIELD WRAPPER ───────────────────────────────────────────────────────────

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// ─── SELECT ──────────────────────────────────────────────────────────────────

function Select({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all
          bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
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

// ─── INPUT ───────────────────────────────────────────────────────────────────

function Input({ value, onChange, placeholder, error, type = 'text', prefix, readOnly, className = '' }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-bold text-slate-400 pointer-events-none">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full py-2.5 text-[13px] rounded-xl border outline-none transition-all
          bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
          focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          read-only:bg-slate-50 read-only:text-slate-500 dark:read-only:bg-slate-800/50
          ${prefix ? 'pl-7' : 'pl-3'} pr-3
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${className}`}
      />
    </div>
  )
}

// ─── DELETE CONFIRM MODAL ────────────────────────────────────────────────────

function DeleteModal({ record, onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-6"
          style={{ animation: 'modalIn .2s ease' }}>
          <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-100 text-center mb-1">Delete Deduction?</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center mb-5">
            {fmt(record.deduction_amt)} deduction on {record.date} — <span className="font-semibold">{record.reason}</span>
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors">
              Yes, Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── LEDGER TABLE (Desktop) ──────────────────────────────────────────────────

function LedgerTable({ records, onDelete, totalDed, deposit, balance }) {
  const [delTarget, setDelTarget] = useState(null)

  const handleDel = (rec) => setDelTarget(rec)
  const confirmDel = () => { onDelete(delTarget.id); setDelTarget(null) }

  return (
    <>
      {delTarget && <DeleteModal record={delTarget} onConfirm={confirmDel} onCancel={() => setDelTarget(null)} />}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              {['S.No', 'Session', 'Name', 'Class', 'Amount', 'Date', 'Reason', 'Action'].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 whitespace-nowrap first:text-center">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, i) => (
              <tr key={r.id} className="border-b border-slate-50 dark:border-[rgba(99,102,241,0.06)] hover:bg-slate-50/50 dark:hover:bg-white/[0.015] transition-colors">
                <td className="px-4 py-3 text-center text-[12px] text-slate-400">{i + 1}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 text-[11px] font-bold">{r.session}</span>
                </td>
                <td className="px-4 py-3 font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{r.name}</td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{r.class}</td>
                <td className="px-4 py-3">
                  <span className="font-bold text-rose-600 dark:text-rose-400">{fmt(r.deduction_amt)}</span>
                </td>
                <td className="px-4 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{r.date}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300 max-w-[160px] truncate" title={r.reason}>{r.reason}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleDel(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100
                      dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 text-[12px] font-semibold transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />Delete
                  </button>
                </td>
              </tr>
            ))}
            {/* Footer totals */}
            <tr className="bg-blue-50 dark:bg-indigo-500/[0.06] border-t-2 border-blue-200 dark:border-indigo-500/30">
              <td colSpan={4} className="px-4 py-3 text-[12px] font-bold text-blue-700 dark:text-blue-400">Grand Total</td>
              <td className="px-4 py-3 font-bold text-rose-600 dark:text-rose-400">{fmt(totalDed)}</td>
              <td colSpan={3} className="px-4 py-3" />
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}

// ─── LEDGER CARDS (Mobile) ───────────────────────────────────────────────────

function LedgerCards({ records, onDelete }) {
  const [delTarget, setDelTarget] = useState(null)
  const [expanded, setExpanded] = useState(null)

  return (
    <>
      {delTarget && (
        <DeleteModal
          record={delTarget}
          onConfirm={() => { onDelete(delTarget.id); setDelTarget(null) }}
          onCancel={() => setDelTarget(null)}
        />
      )}
      <div className="md:hidden space-y-3">
        {records.map((r, i) => (
          <div key={r.id} className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
            <button type="button" onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{r.reason}</p>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">{r.session}</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{r.date}</p>
              </div>
              <div className="flex flex-col items-end flex-shrink-0 gap-1">
                <span className="text-[18px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">{fmt(r.deduction_amt)}</span>
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${expanded === r.id ? 'rotate-90' : ''}`} />
              </div>
            </button>
            {expanded === r.id && (
              <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 space-y-2 bg-slate-50/50 dark:bg-white/[0.015]">
                <div className="grid grid-cols-2 gap-2 text-[12px]">
                  <div><span className="text-slate-400">Name</span><p className="font-semibold text-slate-700 dark:text-slate-200">{r.name}</p></div>
                  <div><span className="text-slate-400">Class</span><p className="font-semibold text-slate-700 dark:text-slate-200">{r.class}</p></div>
                </div>
                <button onClick={() => setDelTarget(r)}
                  className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100
                    dark:bg-rose-500/10 dark:text-rose-400 text-[12px] font-semibold transition-colors mt-1">
                  <Trash2 className="w-3.5 h-3.5" />Delete Deduction
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function RefundableFees() {
  // ── Step 1: Student Search
  const [admNo, setAdmNo]         = useState('')
  const [student, setStudent]     = useState(null)
  const [admError, setAdmError]   = useState('')
  const [searching, setSearching] = useState(false)

  // ── Step 2: Session & Head
  const [session, setSession]     = useState('')
  const [headId, setHeadId]       = useState('')
  const [sessionError, setSessionError] = useState('')
  const [headError, setHeadError]       = useState('')

  // ── Step 3: Add Deduction
  const [date, setDate]           = useState('')
  const [amount, setAmount]       = useState('')
  const [reason, setReason]       = useState('')
  const [amtError, setAmtError]   = useState('')
  const [reasonError, setReasonError] = useState('')
  const [dateError, setDateError]   = useState('')
  const [submitting, setSubmitting] = useState(false)

  // ── Records
  const [records, setRecords]     = useState(INITIAL_RECORDS)

  // ── UI State
  const [activeTab, setActiveTab] = useState('add')  // 'add' | 'ledger'
  const [toast, setToast]         = useState(null)
  const [panelVisible, setPanelVisible] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Derived key for records lookup
  const recordKey = useMemo(() => {
    if (!admNo || !session || !headId) return null
    return `${admNo}-${session}-${headId}`
  }, [admNo, session, headId])

  const currentRecords = useMemo(() => records[recordKey] || [], [records, recordKey])

  // Deposit amount for selected combo
  const depositAmt = useMemo(() => {
    if (!recordKey) return 0
    return DEPOSITS[recordKey] || 0
  }, [recordKey])

  const totalDeduction = useMemo(() => currentRecords.reduce((s, r) => s + r.deduction_amt, 0), [currentRecords])
  const balance = depositAmt - totalDeduction

  // ── Search Student
  const handleSearch = useCallback(() => {
    const trimmed = admNo.trim().toUpperCase()
    if (!trimmed) { setAdmError('Enter admission number'); return }
    setAdmError('')
    setSearching(true)
    setStudent(null)
    setPanelVisible(false)
    setSession('')
    setHeadId('')

    setTimeout(() => {
      const found = STUDENTS[trimmed]
      if (found) {
        setStudent(found)
        setPanelVisible(true)
        showToast(`Student found: ${found.name}`)
      } else {
        setAdmError('No student found with this admission number')
      }
      setSearching(false)
    }, 500)
  }, [admNo])

  // ── Submit Deduction
  const handleSubmit = () => {
    let valid = true
    if (!session) { setSessionError('Select session'); valid = false } else setSessionError('')
    if (!headId)  { setHeadError('Select fee head'); valid = false }  else setHeadError('')
    if (!date)    { setDateError('Select date'); valid = false }       else setDateError('')
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setAmtError('Enter valid amount'); valid = false
    } else if (Number(amount) > balance) {
      setAmtError(`Amount exceeds balance (${fmt(balance)})`); valid = false
    } else setAmtError('')
    if (!reason.trim()) { setReasonError('Enter reason'); valid = false } else setReasonError('')
    if (!valid) return

    setSubmitting(true)
    setTimeout(() => {
      const key = `${admNo.trim().toUpperCase()}-${session}-${headId}`
      const newRec = {
        id: Date.now(),
        name: student.name,
        class: student.class,
        session,
        fee_head_id: parseInt(headId),
        deduction_amt: Number(amount),
        date,
        reason: reason.trim(),
        row_id: `r${Date.now()}`,
      }
      setRecords(prev => ({ ...prev, [key]: [...(prev[key] || []), newRec] }))
      setAmount(''); setReason(''); setDate('')
      setSubmitting(false)
      setActiveTab('ledger')
      showToast('Deduction recorded successfully!')
    }, 600)
  }

  // ── Delete
  const handleDelete = (id) => {
    setRecords(prev => ({
      ...prev,
      [recordKey]: (prev[recordKey] || []).filter(r => r.id !== id)
    }))
    showToast('Record deleted', 'error')
  }

  const headName = FEE_HEADS.find(h => h.id === parseInt(headId))?.name || ''

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1120] p-4 sm:p-6 font-sans">
      <style>{`
        * { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; }
        .tab-active { background: white; box-shadow: 0 1px 3px rgba(0,0,0,.1); }
        .dark .tab-active { background: #1e2238; box-shadow: 0 1px 3px rgba(0,0,0,.3); }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-4">

        {/* ── PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <ReceiptIndianRupee className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-[18px] sm:text-[20px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
                  Refundable Fee Ledger
                </h1>
                <p className="text-[12px] text-slate-500 dark:text-slate-400">Student Security Amount Information (Refundable)</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <Shield className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Security Deposits</span>
          </div>
        </div>

        {/* ── STEP 1: STUDENT SEARCH CARD */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">1</span>
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Find Student</span>
          </div>
          <div className="p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <Field label="Admission Number" error={admError} required>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                      value={admNo}
                      onChange={e => { setAdmNo(e.target.value.replace(/'/g, '')); setAdmError('') }}
                      onKeyDown={e => e.key === 'Enter' && handleSearch()}
                      placeholder="e.g. ADM001, ADM002, ADM003..."
                      className={`w-full pl-10 pr-4 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                        bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
                        focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-indigo-400
                        ${admError ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                    />
                  </div>
                </Field>
              </div>
              <div className="flex gap-2 sm:items-end sm:pb-0 pb-0">
                <button onClick={handleSearch} disabled={searching}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                    bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                    shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
                  {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  Search
                </button>
                <button onClick={() => { setAdmNo(''); setStudent(null); setPanelVisible(false); setSession(''); setHeadId(''); setAdmError('') }}
                  className="p-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Demo hint */}
            <p className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mt-2">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              Demo: Try ADM001, ADM002, ADM003, ADM004, ADM005
            </p>

            {/* Student found */}
            {student && (
              <div className="mt-4">
                <StudentCard student={student} admNo={admNo.trim().toUpperCase()} />
              </div>
            )}
          </div>
        </div>

        {/* ── STEPS 2 + 3: Only visible after student found */}
        {panelVisible && student && (
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden"
            style={{ animation: 'fadeIn .3s ease' }}>
            <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

            {/* ── Session + Head Selection (Step 2) */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">2</span>
              <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Select Session & Fee Head</span>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Session" error={sessionError} required>
                  <Select value={session} onChange={e => { setSession(e.target.value); setSessionError('') }}
                    placeholder="-- Select Session --" error={sessionError}>
                    {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </Field>
                <Field label="Fee Head" error={headError} required>
                  <Select value={headId} onChange={e => { setHeadId(e.target.value); setHeadError('') }}
                    placeholder="-- Select Fee Head --" error={headError}>
                    {FEE_HEADS.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                  </Select>
                </Field>
              </div>

              {/* Balance Summary — shown when session + head selected */}
              {session && headId && (
                <div className="mt-4 space-y-3" style={{ animation: 'fadeIn .25s ease' }}>
                  <div className="grid grid-cols-3 gap-3">
                    <StatBadge label="Deposit" value={fmt(depositAmt)} color="blue" icon={BadgeIndianRupee} />
                    <StatBadge label="Deducted" value={fmt(totalDeduction)} color="red" icon={TrendingDown} />
                    <StatBadge label="Balance" value={fmt(balance)} color={balance >= 0 ? 'green' : 'red'} icon={Wallet} />
                  </div>
                  {depositAmt === 0 && (
                    <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                      <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                      <p className="text-[12px] text-amber-700 dark:text-amber-400 font-medium">
                        No deposit record found for <strong>{headName}</strong> in session <strong>{session}</strong>.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: Add / Ledger */}
              {session && headId && (
                <div className="mt-5">
                  {/* Tab Pills */}
                  <div className="flex gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 w-fit mb-5">
                    {[
                      { id: 'add', label: 'Add Deduction', icon: Plus },
                      { id: 'ledger', label: `Ledger (${currentRecords.length})`, icon: Eye }
                    ].map(({ id, label, icon: Icon }) => (
                      <button key={id} onClick={() => setActiveTab(id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all
                          ${activeTab === id
                            ? 'tab-active text-blue-700 dark:text-indigo-300'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                        <Icon className="w-3.5 h-3.5" />{label}
                      </button>
                    ))}
                  </div>

                  {/* TAB: ADD DEDUCTION */}
                  {activeTab === 'add' && (
                    <div style={{ animation: 'fadeIn .2s ease' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Field label="Date" error={dateError} required>
                          <Input value={date} onChange={e => { setDate(e.target.value); setDateError('') }}
                            placeholder="DD/MM/YYYY" error={dateError} />
                        </Field>
                        <Field label="Deduction Amount (₹)" error={amtError} required
                          hint={`Max deductable: ${fmt(balance)}`}>
                          <Input value={amount} onChange={e => { setAmount(e.target.value); setAmtError('') }}
                            type="number" placeholder="0.00" prefix="₹" error={amtError} />
                        </Field>
                        <Field label="Reason" error={reasonError} required>
                          <Input value={reason} onChange={e => { setReason(e.target.value); setReasonError('') }}
                            placeholder="e.g. Book damage, Lab breakage" error={reasonError} />
                        </Field>
                      </div>

                      {/* Preview */}
                      {amount && reason && date && !amtError && (
                        <div className="mt-4 rounded-xl border border-blue-100 dark:border-indigo-500/20
                          bg-blue-50 dark:bg-indigo-500/[0.06] px-4 py-3 flex items-center gap-3"
                          style={{ animation: 'fadeIn .2s ease' }}>
                          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                          <p className="text-[12px] text-blue-700 dark:text-blue-300 flex-wrap">
                            Recording <strong>{fmt(amount)}</strong> deduction from <strong>{headName}</strong> on <strong>{date}</strong> — "{reason}"
                            · Balance will be <strong>{fmt(balance - Number(amount))}</strong>
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex gap-3">
                        <button onClick={handleSubmit} disabled={submitting || depositAmt === 0}
                          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                            bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                            transition-all active:scale-95 disabled:opacity-50">
                          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                          Add Deduction
                        </button>
                        <button onClick={() => { setAmount(''); setReason(''); setDate(''); setAmtError(''); setReasonError(''); setDateError('') }}
                          className="px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-600
                            hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                          Clear
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TAB: LEDGER */}
                  {activeTab === 'ledger' && (
                    <div style={{ animation: 'fadeIn .2s ease' }}>
                      {currentRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
                          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <FileText className="w-7 h-7 opacity-40" />
                          </div>
                          <div className="text-center">
                            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No deductions recorded</p>
                            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5">Switch to "Add Deduction" tab to record one</p>
                          </div>
                        </div>
                      ) : (
                        <>
                          {/* Desktop Table */}
                          <LedgerTable
                            records={currentRecords}
                            onDelete={handleDelete}
                            totalDed={totalDeduction}
                            deposit={depositAmt}
                            balance={balance}
                          />
                          {/* Mobile Cards */}
                          <LedgerCards records={currentRecords} onDelete={handleDelete} />

                          {/* Summary Footer */}
                          <div className="mt-4 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)]
                            bg-slate-50 dark:bg-white/[0.02] px-4 py-3 flex flex-wrap gap-4 items-center justify-between">
                            <p className="text-[12px] text-slate-500 dark:text-slate-400">
                              <span className="font-semibold text-slate-700 dark:text-slate-200">{currentRecords.length}</span> deduction{currentRecords.length !== 1 ? 's' : ''} recorded
                            </p>
                            <div className="flex flex-wrap gap-3 text-[12px] font-semibold">
                              <span className="text-blue-700 dark:text-blue-400">Deposit: {fmt(depositAmt)}</span>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <span className="text-rose-600 dark:text-rose-400">Deducted: {fmt(totalDeduction)}</span>
                              <span className="text-slate-300 dark:text-slate-600">|</span>
                              <span className={balance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                                Balance: {fmt(balance)}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── EMPTY STATE */}
        {!panelVisible && !searching && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <ReceiptIndianRupee className="w-8 h-8 opacity-40" />
            </div>
            <div className="text-center max-w-xs">
              <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">Search a student to begin</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
                Enter the admission number above to view or manage refundable security deposits.
              </p>
            </div>
            {/* Quick access cards */}
            <div className="grid grid-cols-3 gap-3 mt-2 w-full max-w-sm">
              {[
                { icon: Search, label: 'Find Student', color: 'blue' },
                { icon: BadgeIndianRupee, label: 'Manage Deposits', color: 'emerald' },
                { icon: FileText, label: 'View Ledger', color: 'violet' },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`flex flex-col items-center gap-2 rounded-xl border p-3 text-center
                  ${color === 'blue' ? 'border-blue-100 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/5' :
                    color === 'emerald' ? 'border-emerald-100 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/5' :
                    'border-violet-100 bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/5'}`}>
                  <Icon className={`w-5 h-5 ${color === 'blue' ? 'text-blue-500' : color === 'emerald' ? 'text-emerald-500' : 'text-violet-500'}`} />
                  <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
