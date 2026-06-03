/**
 * WaveOffLateFees.jsx
 * 
 * Wave Off Late Fees — Production-ready ERP page
 * Mobile-first, fully responsive, touch-friendly
 * Desktop: dense table with inline editing
 * Mobile: card-based layout with accordion details
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Search, ChevronDown, AlertCircle, X, Check, Loader2,
  RefreshCw, IndianRupee, Calendar, User, BookOpen,
  ChevronRight, Phone, Users, Hash, FileText,
  CheckCircle2, Clock, BadgeIndianRupee, Wallet,
  SlidersHorizontal, ArrowLeft, Info, Sparkles,
  TrendingDown, Receipt, Shield, RotateCcw, Save
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const STUDENT_DB = {
  'ADM001': {
    name: 'Arjun Sharma',
    class: 'Class IX - A',
    fatherName: 'Rajesh Sharma',
    phone: '9876543210',
    photo: null,
  },
  'ADM002': {
    name: 'Priya Patel',
    class: 'Class X - B',
    fatherName: 'Suresh Patel',
    phone: '9812345678',
    photo: null,
  },
  'ADM003': {
    name: 'Rohan Verma',
    class: 'Class VIII - A',
    fatherName: 'Mohan Verma',
    phone: '9898989898',
    photo: null,
  },
}

// Late fee installment data per student
const LATE_FEE_DATA = {
  'ADM001': [
    { id: 1, installment_no: 1, month_name: 'April', latefee: 200,  WaveOffFeeValue: 0,  balancelatefee: 200, Remark: '', status: '0' },
    { id: 2, installment_no: 2, month_name: 'May',   latefee: 150,  WaveOffFeeValue: 150, balancelatefee: 0,  Remark: 'Waived',  status: '1' },
    { id: 3, installment_no: 3, month_name: 'June',  latefee: 300,  WaveOffFeeValue: 0,  balancelatefee: 300, Remark: '', status: '0' },
    { id: 4, installment_no: 4, month_name: 'July',  latefee: 250,  WaveOffFeeValue: 100, balancelatefee: 150, Remark: 'Partial', status: '0' },
    { id: 5, installment_no: 5, month_name: 'August',latefee: 180,  WaveOffFeeValue: 0,  balancelatefee: 180, Remark: '', status: '0' },
  ],
  'ADM002': [
    { id: 1, installment_no: 1, month_name: 'April', latefee: 500, WaveOffFeeValue: 0,  balancelatefee: 500, Remark: '', status: '0' },
    { id: 2, installment_no: 2, month_name: 'May',   latefee: 400, WaveOffFeeValue: 400, balancelatefee: 0,  Remark: 'Full waiver', status: '1' },
    { id: 3, installment_no: 3, month_name: 'June',  latefee: 350, WaveOffFeeValue: 0,  balancelatefee: 350, Remark: '', status: '0' },
  ],
  'ADM003': [
    { id: 1, installment_no: 1, month_name: 'April', latefee: 100, WaveOffFeeValue: 0,  balancelatefee: 100, Remark: '', status: '0' },
    { id: 2, installment_no: 2, month_name: 'May',   latefee: 100, WaveOffFeeValue: 0,  balancelatefee: 100, Remark: '', status: '0' },
  ],
}

// Autocomplete suggestions
const ADMISSION_SUGGESTIONS = [
  { RegistrationNo: 'ADM001', Name: 'Arjun Sharma',  Class: 'Class IX - A',  FatherName: 'Rajesh Sharma', PhoneNo: '9876543210', ImageUrl: null },
  { RegistrationNo: 'ADM002', Name: 'Priya Patel',   Class: 'Class X - B',   FatherName: 'Suresh Patel',  PhoneNo: '9812345678', ImageUrl: null },
  { RegistrationNo: 'ADM003', Name: 'Rohan Verma',   Class: 'Class VIII - A',FatherName: 'Mohan Verma',   PhoneNo: '9898989898', ImageUrl: null },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  return name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
}

function formatINR(n) {
  return '₹' + Number(n || 0).toLocaleString('en-IN')
}

const MONTH_COLORS = {
  April:   { bg: '#fef3c7', fg: '#d97706' },
  May:     { bg: '#d1fae5', fg: '#059669' },
  June:    { bg: '#dbeafe', fg: '#2563eb' },
  July:    { bg: '#ede9fe', fg: '#7c3aed' },
  August:  { bg: '#fee2e2', fg: '#dc2626' },
  September:{ bg: '#fce7f3', fg: '#db2777' },
  October: { bg: '#cffafe', fg: '#0891b2' },
  November:{ bg: '#f0fdf4', fg: '#15803d' },
  December:{ bg: '#fff7ed', fg: '#ea580c' },
}

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 font-medium
          focus:border-blue-500 focus:ring-2 focus:ring-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
        {label}{required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400">{hint}</p>}
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
      style={{ animation: 'slideUp .3s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" />
        : type === 'error' ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
        : <Info className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── STUDENT AVATAR ──────────────────────────────────────────────────────────

function Avatar({ name, size = 'md' }) {
  const initials = getInitials(name)
  const sizes = { sm: 'w-8 h-8 text-[11px]', md: 'w-10 h-10 text-[13px]', lg: 'w-14 h-14 text-[16px]' }
  return (
    <div className={`${sizes[size]} rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white flex-shrink-0`}>
      {initials}
    </div>
  )
}

// ─── STUDENT INFO BANNER ─────────────────────────────────────────────────────

function StudentBanner({ student, admNo, onBack }) {
  return (
    <div className="rounded-2xl border border-blue-100 bg-gradient-to-r from-blue-50 via-white to-indigo-50 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <Avatar name={student.name} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-[15px] font-extrabold text-slate-800">{student.name}</h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {admNo}
            </span>
          </div>
          <p className="text-[12px] text-slate-500 mt-0.5 flex items-center gap-1">
            <BookOpen className="w-3 h-3" />{student.class}
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <User className="w-3 h-3" />{student.fatherName}
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <Phone className="w-3 h-3" />{student.phone}
            </span>
          </div>
        </div>
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-[12px] text-blue-600 font-semibold hover:text-blue-800 transition-colors flex-shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Change</span>
        </button>
      </div>
    </div>
  )
}

// ─── SUMMARY CARDS ───────────────────────────────────────────────────────────

function SummaryStrip({ rows }) {
  const totalFee     = rows.reduce((s, r) => s + Number(r.latefee), 0)
  const totalWaveOff = rows.reduce((s, r) => s + Number(r.WaveOffFeeValue || 0), 0)
  const totalBalance = rows.reduce((s, r) => s + Number(r.balancelatefee || 0), 0)
  const waived       = rows.filter(r => r.status === '1').length

  const cards = [
    { icon: BadgeIndianRupee, label: 'Total Late Fee',  value: formatINR(totalFee),     color: 'blue'   },
    { icon: TrendingDown,     label: 'Wave Off Amount', value: formatINR(totalWaveOff), color: 'emerald' },
    { icon: Wallet,           label: 'Balance Due',     value: formatINR(totalBalance), color: totalBalance > 0 ? 'rose' : 'slate' },
    { icon: CheckCircle2,     label: 'Rows Waived',     value: `${waived} / ${rows.length}`, color: 'amber' },
  ]

  const colorMap = {
    blue:    'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose:    'bg-rose-50 text-rose-600 border-rose-100',
    amber:   'bg-amber-50 text-amber-600 border-amber-100',
    slate:   'bg-slate-50 text-slate-500 border-slate-100',
  }
  const valColorMap = {
    blue:    'text-blue-700',
    emerald: 'text-emerald-700',
    rose:    'text-rose-700',
    amber:   'text-amber-700',
    slate:   'text-slate-600',
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ icon: Icon, label, value, color }) => (
        <div key={label} className={`flex items-center gap-3 rounded-xl border ${colorMap[color]} bg-white px-3 py-3 shadow-sm`}>
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[color]}`}>
            <Icon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className={`text-[18px] font-extrabold tabular-nums leading-tight ${valColorMap[color]}`}>{value}</p>
            <p className="text-[10px] text-slate-500 font-medium truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── AUTOCOMPLETE INPUT ───────────────────────────────────────────────────────

function AdmNoInput({ value, onChange, onSelect, suggestions }) {
  const [open, setOpen] = useState(false)
  const [filtered, setFiltered] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    if (value.length >= 1) {
      const q = value.toLowerCase()
      setFiltered(suggestions.filter(s =>
        s.RegistrationNo.toLowerCase().includes(q) ||
        s.Name.toLowerCase().includes(q)
      ))
      setOpen(true)
    } else {
      setOpen(false)
    }
  }, [value, suggestions])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="Type Admission No. or Name…"
          autoComplete="off"
          className="w-full pl-9 pr-9 py-2.5 text-[13px] rounded-xl border border-slate-200 outline-none
            focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-slate-800 font-medium
            placeholder:text-slate-300 transition-all"
        />
        {value && (
          <button onClick={() => { onChange(''); setOpen(false) }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden">
          {filtered.map(item => (
            <button
              key={item.RegistrationNo}
              type="button"
              onClick={() => { onSelect(item); setOpen(false) }}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-blue-50 transition-colors text-left border-b border-slate-50 last:border-0"
            >
              <Avatar name={item.Name} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-bold text-slate-800">{item.Name}</span>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-blue-100 text-blue-700">{item.RegistrationNo}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.Class} · {item.FatherName} · {item.PhoneNo}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 mt-1 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ───────────────────────────────────────────────────────

function DesktopRow({ row, idx, onCheck, onWaveOff, onRemark }) {
  const mc = MONTH_COLORS[row.month_name] || { bg: '#f1f5f9', fg: '#475569' }
  const isWaived = row.status === '1'
  const [localWaveOff, setLocalWaveOff] = useState(row.WaveOffFeeValue)
  const [localRemark,  setLocalRemark]  = useState(row.Remark)

  // sync from parent
  useEffect(() => { setLocalWaveOff(row.WaveOffFeeValue) }, [row.WaveOffFeeValue])
  useEffect(() => { setLocalRemark(row.Remark) }, [row.Remark])

  const handleWaveOffBlur = () => {
    const val = Math.min(Number(localWaveOff) || 0, Number(row.latefee))
    onWaveOff(row.id, val)
  }

  const balance = Math.max(0, Number(row.latefee) - Number(localWaveOff || 0))
  const waveOffPct = row.latefee > 0 ? Math.round((Number(localWaveOff || 0) / row.latefee) * 100) : 0

  return (
    <tr className={`border-b border-slate-100 transition-colors ${isWaived ? 'bg-emerald-50/40' : 'hover:bg-slate-50/60'}`}>
      {/* Checkbox */}
      <td className="px-4 py-3 text-center w-10">
        <input
          type="checkbox"
          checked={isWaived}
          onChange={e => onCheck(row.id, e.target.checked)}
          className="w-4 h-4 rounded accent-blue-600 cursor-pointer"
        />
      </td>

      {/* Inst No */}
      <td className="px-4 py-3 text-center w-12">
        <span className="text-[12px] font-bold text-slate-500 tabular-nums">#{row.installment_no}</span>
      </td>

      {/* Month */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold"
          style={{ background: mc.bg, color: mc.fg }}>
          <Calendar className="w-3 h-3" />
          {row.month_name}
        </span>
      </td>

      {/* Late Fee */}
      <td className="px-4 py-3 text-right">
        <span className="text-[13px] font-bold text-slate-700 tabular-nums">{formatINR(row.latefee)}</span>
      </td>

      {/* Wave Off Amount */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <div className="relative">
            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 font-semibold">₹</span>
            <input
              type="number"
              min={0}
              max={row.latefee}
              value={localWaveOff}
              onChange={e => setLocalWaveOff(e.target.value)}
              onBlur={handleWaveOffBlur}
              placeholder="0"
              className={`w-full pl-6 pr-2 py-1.5 text-[13px] font-semibold rounded-lg border outline-none transition-all tabular-nums text-right
                ${Number(localWaveOff) > 0
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 focus:ring-2 focus:ring-emerald-100'
                  : 'border-slate-200 bg-white text-slate-700 focus:border-blue-400 focus:ring-2 focus:ring-blue-100'}`}
            />
          </div>
          {Number(localWaveOff) > 0 && (
            <div className="h-1 rounded-full bg-slate-200 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${waveOffPct}%` }} />
            </div>
          )}
        </div>
      </td>

      {/* Balance Late Fee */}
      <td className="px-4 py-3 text-right">
        <span className={`text-[13px] font-bold tabular-nums ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
          {formatINR(balance)}
        </span>
        {balance === 0 && <span className="ml-1 text-[10px] text-emerald-500 font-bold">✓</span>}
      </td>

      {/* Remark */}
      <td className="px-4 py-3">
        <input
          type="text"
          value={localRemark}
          onChange={e => setLocalRemark(e.target.value)}
          onBlur={() => onRemark(row.id, localRemark)}
          placeholder="Add remark…"
          className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-slate-200 outline-none
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white text-slate-700 placeholder:text-slate-300 transition-all"
        />
      </td>

      {/* Status */}
      <td className="px-4 py-3 text-center">
        {isWaived
          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700"><CheckCircle2 className="w-3 h-3" />Waived</span>
          : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700"><Clock className="w-3 h-3" />Pending</span>
        }
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────

function MobileCard({ row, onCheck, onWaveOff, onRemark }) {
  const [expanded, setExpanded] = useState(false)
  const [localWaveOff, setLocalWaveOff] = useState(row.WaveOffFeeValue)
  const [localRemark,  setLocalRemark]  = useState(row.Remark)
  const mc = MONTH_COLORS[row.month_name] || { bg: '#f1f5f9', fg: '#475569' }
  const isWaived = row.status === '1'

  useEffect(() => { setLocalWaveOff(row.WaveOffFeeValue) }, [row.WaveOffFeeValue])
  useEffect(() => { setLocalRemark(row.Remark) }, [row.Remark])

  const handleWaveOffBlur = () => {
    const val = Math.min(Number(localWaveOff) || 0, Number(row.latefee))
    onWaveOff(row.id, val)
  }

  const balance = Math.max(0, Number(row.latefee) - Number(localWaveOff || 0))
  const waveOffPct = row.latefee > 0 ? Math.round((Number(localWaveOff || 0) / row.latefee) * 100) : 0

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm transition-all
      ${isWaived ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-200 bg-white'}`}>

      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <input
          type="checkbox"
          checked={isWaived}
          onChange={e => onCheck(row.id, e.target.checked)}
          className="w-5 h-5 rounded accent-blue-600 cursor-pointer flex-shrink-0"
        />

        {/* Month badge */}
        <span className="w-9 h-9 rounded-xl flex items-center justify-center text-[11px] font-bold flex-shrink-0"
          style={{ background: mc.bg, color: mc.fg }}>
          {row.month_name.slice(0, 3)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[13px] font-bold text-slate-800">{row.month_name}</span>
            <span className="text-[10px] font-semibold text-slate-400">· Inst #{row.installment_no}</span>
          </div>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-500">Fee: <span className="font-bold text-slate-700">{formatINR(row.latefee)}</span></span>
            <span className={`text-[11px] font-bold ${balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
              Bal: {formatINR(balance)}
            </span>
          </div>
        </div>

        {/* Status + Toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isWaived
            ? <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Waived</span>
            : <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Pending</span>
          }
          <button
            onClick={() => setExpanded(p => !p)}
            className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Wave-off progress bar */}
      {Number(localWaveOff) > 0 && (
        <div className="px-4 pb-2">
          <div className="flex text-[10px] font-semibold justify-between mb-1">
            <span className="text-emerald-600">Waived {waveOffPct}%</span>
            <span className="text-rose-500">Balance {100 - waveOffPct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-rose-100 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-500 transition-all duration-500" style={{ width: `${waveOffPct}%` }} />
          </div>
        </div>
      )}

      {/* Expanded: Edit Fields */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pt-4 pb-4 space-y-3 bg-white/80">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Late Fee</label>
              <div className="px-3 py-2 rounded-xl bg-slate-100 text-[13px] font-bold text-slate-700 tabular-nums">
                {formatINR(row.latefee)}
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1">Balance</label>
              <div className={`px-3 py-2 rounded-xl text-[13px] font-bold tabular-nums
                ${balance > 0 ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                {formatINR(balance)}
              </div>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
              Wave Off Amount <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold text-[13px]">₹</span>
              <input
                type="number"
                min={0}
                max={row.latefee}
                value={localWaveOff}
                onChange={e => setLocalWaveOff(e.target.value)}
                onBlur={handleWaveOffBlur}
                placeholder="Enter amount"
                className={`w-full pl-7 pr-3 py-2.5 text-[13px] font-semibold rounded-xl border outline-none transition-all
                  ${Number(localWaveOff) > 0
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 bg-white text-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-100'}`}
              />
            </div>
            {Number(localWaveOff) > Number(row.latefee) && (
              <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />Cannot exceed {formatINR(row.latefee)}
              </p>
            )}
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">Remark</label>
            <input
              type="text"
              value={localRemark}
              onChange={e => setLocalRemark(e.target.value)}
              onBlur={() => onRemark(row.id, localRemark)}
              placeholder="Add remark for this wave off…"
              className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 outline-none
                focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white text-slate-700 placeholder:text-slate-300 transition-all"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ icon: Icon, title, desc, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
        <Icon className="w-8 h-8 opacity-40" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-bold text-slate-500">{title}</p>
        <p className="text-[12px] text-slate-400 mt-1 max-w-xs mx-auto">{desc}</p>
      </div>
      {action}
    </div>
  )
}

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────

function StepIndicator({ step }) {
  const steps = [
    { n: 1, label: 'Select Session' },
    { n: 2, label: 'Enter Admission No.' },
    { n: 3, label: 'Review & Submit' },
  ]
  return (
    <div className="flex items-center gap-0 w-full max-w-sm mx-auto sm:max-w-none">
      {steps.map((s, i) => (
        <div key={s.n} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all
              ${step >= s.n
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-slate-100 text-slate-400'}`}>
              {step > s.n ? <Check className="w-3.5 h-3.5" /> : s.n}
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-wide hidden sm:block
              ${step >= s.n ? 'text-blue-600' : 'text-slate-400'}`}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1.5 rounded-full transition-all mb-4 sm:mb-4
              ${step > s.n ? 'bg-blue-400' : 'bg-slate-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function WaveOffLateFees() {
  const [step,       setStep]       = useState(1)          // 1=session 2=admno 3=table
  const [session,    setSession]    = useState('')
  const [admNo,      setAdmNo]      = useState('')
  const [student,    setStudent]    = useState(null)
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Handle show ─────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!admNo.trim()) err.admNo = 'Please enter admission number'
    if (Object.keys(err).length) { setErrors(err); return }

    const st = STUDENT_DB[admNo.trim().toUpperCase()]
    if (!st) { setErrors({ admNo: 'Student not found. Try ADM001, ADM002, ADM003' }); return }

    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const data = (LATE_FEE_DATA[admNo.trim().toUpperCase()] || []).map(r => ({ ...r }))
      setStudent(st)
      setRows(data)
      setStep(3)
      setLoading(false)
      showToast(`Loaded ${data.length} installments for ${st.name}`)
    }, 700)
  }, [session, admNo, showToast])

  // ── Handle autocomplete select ───────────────────────────────────────────
  const handleSelect = useCallback((item) => {
    setAdmNo(item.RegistrationNo)
    setErrors(p => ({ ...p, admNo: undefined }))
  }, [])

  // ── Handle row check ────────────────────────────────────────────────────
  const handleCheck = useCallback((id, checked) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, status: checked ? '1' : '0' } : r))
  }, [])

  // ── Handle wave off ─────────────────────────────────────────────────────
  const handleWaveOff = useCallback((id, val) => {
    setRows(prev => prev.map(r => {
      if (r.id !== id) return r
      const safeVal = Math.min(val, Number(r.latefee))
      const bal = Math.max(0, Number(r.latefee) - safeVal)
      return { ...r, WaveOffFeeValue: safeVal, balancelatefee: bal }
    }))
  }, [])

  // ── Handle remark ───────────────────────────────────────────────────────
  const handleRemark = useCallback((id, remark) => {
    setRows(prev => prev.map(r => r.id === id ? { ...r, Remark: remark } : r))
  }, [])

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setStep(1); setSession(''); setAdmNo(''); setStudent(null)
    setRows([]); setErrors({})
  }

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const changed = rows.filter(r => Number(r.WaveOffFeeValue) > 0 || r.status === '1')
    if (changed.length === 0) { showToast('No wave-off amounts entered.', 'error'); return }

    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      showToast(`Wave off saved successfully for ${changed.length} installment(s)!`)
    }, 1200)
  }

  // ── Current step guard for wizard on mobile ──────────────────────────────
  const currentStep = step === 3 && student ? 3 : step === 1 ? 1 : 2

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Page wrapper */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-5 space-y-5 pb-20">

        {/* ── Page Header ──────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium mb-1">
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600 font-semibold">Wave Off Late Fees</span>
            </div>
            <h1 className="text-[20px] sm:text-[22px] font-extrabold text-slate-800 flex items-center gap-2 leading-tight">
              <span className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
                <TrendingDown className="w-4 h-4 text-white" />
              </span>
              Wave Off Late Fees
            </h1>
            <p className="text-[12px] text-slate-500 mt-0.5">
              Select session &amp; student to manage late fee wave-offs installment-wise.
            </p>
          </div>

          {step === 3 && (
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
                bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-all flex-shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}
        </div>

        {/* ── Step Indicator ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
          <StepIndicator step={currentStep} />
        </div>

        {/* ── Step 1 & 2: Search Filters ──────────────────────────── */}
        {step !== 3 && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
              <span className="w-1 h-5 rounded-full bg-blue-500" />
              <SlidersHorizontal className="w-4 h-4 text-blue-600" />
              <span className="text-[14px] font-bold text-slate-700">Search Filters</span>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                {/* Session */}
                <Field label="Session" error={errors.session} required hint="Select academic year">
                  <NativeSelect
                    value={session}
                    onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })); setStep(2) }}
                    placeholder="-- Select Session --"
                    error={errors.session}
                  >
                    {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </NativeSelect>
                </Field>

                {/* Admission No */}
                <div className="sm:col-span-1 lg:col-span-2">
                  <Field label="Admission No." error={errors.admNo} required hint="Type to search student">
                    <AdmNoInput
                      value={admNo}
                      onChange={v => { setAdmNo(v); setErrors(p => ({ ...p, admNo: undefined })) }}
                      onSelect={handleSelect}
                      suggestions={ADMISSION_SUGGESTIONS}
                    />
                  </Field>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleShow}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white
                      bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    Show
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tip */}
              <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
                <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-blue-700">
                  Demo data: Try admission nos. <strong>ADM001</strong>, <strong>ADM002</strong>, or <strong>ADM003</strong> with any session.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Loading ─────────────────────────────────────────────── */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <p className="text-[13px] font-semibold text-slate-500">Fetching student late fee data…</p>
            <div className="w-full max-w-xs space-y-2">
              {[100, 80, 60].map((w, i) => (
                <div key={i} className="h-3 rounded-full bg-slate-100 animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Table / Cards ────────────────────────────────── */}
        {step === 3 && student && !loading && (
          <>
            {/* Student Banner */}
            <StudentBanner student={student} admNo={admNo} onBack={handleReset} />

            {/* Summary */}
            <SummaryStrip rows={rows} />

            {/* Table Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* Card Header */}
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
                <span className="w-1 h-5 rounded-full bg-blue-500" />
                <Receipt className="w-4 h-4 text-blue-600" />
                <span className="text-[14px] font-bold text-slate-700 flex-1">Installment-wise Late Fees</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                  {rows.length} installment{rows.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Info bar */}
              <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-50 bg-amber-50/50">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <p className="text-[12px] text-amber-700 font-medium">
                  Check the box to mark as waived. Enter amount to partially waive. Add remark for records.
                </p>
              </div>

              {/* ── DESKTOP TABLE ── */}
              <div className="hidden md:block overflow-x-auto">
                {rows.length === 0 ? (
                  <EmptyState icon={Receipt} title="No installments found" desc="No late fee installments found for this student." />
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        {['', '#', 'Month', 'Late Fee', 'Wave Off Amount', 'Balance Due', 'Remark', 'Status'].map((h, i) => (
                          <th key={i} className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap
                            ${i === 0 ? 'w-10 text-center' : i === 1 ? 'text-center' : i >= 3 ? 'text-right' : 'text-left'}`}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => (
                        <DesktopRow
                          key={row.id}
                          row={row}
                          idx={i + 1}
                          onCheck={handleCheck}
                          onWaveOff={handleWaveOff}
                          onRemark={handleRemark}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ── MOBILE CARDS ── */}
              <div className="md:hidden p-4 space-y-3">
                {rows.length === 0 ? (
                  <EmptyState icon={Receipt} title="No installments found" desc="No late fee installments found for this student." />
                ) : (
                  rows.map(row => (
                    <MobileCard
                      key={row.id}
                      row={row}
                      onCheck={handleCheck}
                      onWaveOff={handleWaveOff}
                      onRemark={handleRemark}
                    />
                  ))
                )}
              </div>

              {/* ── Submit Footer ── */}
              {rows.length > 0 && (
                <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-[12px] text-slate-500">
                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                    All changes will be saved permanently after submission.
                  </div>
                  <div className="flex gap-3 w-full sm:w-auto">
                    <button
                      type="button"
                      onClick={handleReset}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold
                        bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Reset
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={submitting}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white
                        bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70"
                    >
                      {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {submitting ? 'Saving…' : 'Submit Wave Off'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Initial Empty State ──────────────────────────────────── */}
        {step === 1 && !loading && (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white">
            <EmptyState
              icon={TrendingDown}
              title="No data loaded yet"
              desc="Select a session and enter the admission number to load late fee installments."
            />
          </div>
        )}

      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
