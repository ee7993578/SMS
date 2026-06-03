/**
 * MiscellaneousFee.jsx
 * Student Miscellaneous Fee Entry — Mobile-first, production-ready ERP page
 * Reference theme: StrengthReport.jsx (dark/light, indigo/blue palette)
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Receipt, Search, RefreshCw, Save, ChevronDown,
  AlertCircle, X, Check, Loader2, Info,
  User, GraduationCap, IndianRupee, CalendarDays,
  FileText, Hash, BookOpen, SlidersHorizontal,
  Banknote, Clock, TrendingUp, Filter,
  ChevronRight, CheckCircle2, XCircle,
  School2, Building2, MapPin, Eye, Printer,
  CreditCard, Tag, Users, LayoutList
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const MISC_HEADS = [
  { id: 1, label: 'Sports Fee' },
  { id: 2, label: 'Library Fee' },
  { id: 3, label: 'Lab Fee' },
  { id: 4, label: 'Computer Fee' },
  { id: 5, label: 'Exam Fee' },
  { id: 6, label: 'Uniform Fee' },
  { id: 7, label: 'Activity Fee' },
  { id: 8, label: 'Transport Fee' },
  { id: 9, label: 'Hostel Fee' },
  { id: 10, label: 'Medical Fee' },
]

const STUDENT_DB = {
  'ADM001': { name: 'Ravi Kumar Sharma',   father: 'Suresh Kumar Sharma',   class: 'Class IX - A',  classId: 9 },
  'ADM002': { name: 'Priya Verma',         father: 'Rajesh Verma',          class: 'Class X - B',   classId: 10 },
  'ADM003': { name: 'Ankit Singh',         father: 'Mohan Singh',           class: 'Class VIII - A',classId: 8 },
  'ADM004': { name: 'Sneha Gupta',         father: 'Vinod Gupta',           class: 'Class XI - A',  classId: 11 },
  'ADM005': { name: 'Rahul Agarwal',       father: 'Sunil Agarwal',         class: 'Class VII - A', classId: 7 },
  'ADM006': { name: 'Divya Mishra',        father: 'Anil Mishra',           class: 'Class XII - B', classId: 12 },
  'ADM007': { name: 'Mohit Yadav',         father: 'Ramesh Yadav',          class: 'Class VI - A',  classId: 6 },
  'ADM008': { name: 'Kavya Tiwari',        father: 'Rakesh Tiwari',         class: 'Class IX - B',  classId: 9 },
}

// Pre-seeded transaction history
const INITIAL_RECORDS = [
  { uid: 1, pay_date: '01 Jun 2025', head: 'Sports Fee',   adm_no: 'ADM001', stu_id: 1, name: 'Ravi Kumar Sharma', amount: 500,  remarks: 'Annual sports fee', receipt_no: 'RCP1001', session: '2025-26' },
  { uid: 2, pay_date: '02 Jun 2025', head: 'Library Fee',  adm_no: 'ADM002', stu_id: 2, name: 'Priya Verma',       amount: 300,  remarks: 'Q1 library fee',   receipt_no: 'RCP1002', session: '2025-26' },
  { uid: 3, pay_date: '03 Jun 2025', head: 'Exam Fee',     adm_no: 'ADM003', stu_id: 3, name: 'Ankit Singh',       amount: 450,  remarks: 'Term 1 exam fee',  receipt_no: 'RCP1003', session: '2025-26' },
  { uid: 4, pay_date: '03 Jun 2025', head: 'Computer Fee', adm_no: 'ADM004', stu_id: 4, name: 'Sneha Gupta',       amount: 600,  remarks: 'Lab usage fee',    receipt_no: 'RCP1004', session: '2025-26' },
  { uid: 5, pay_date: '03 Jun 2025', head: 'Transport Fee',adm_no: 'ADM005', stu_id: 5, name: 'Rahul Agarwal',     amount: 1200, remarks: 'Monthly bus fee',  receipt_no: 'RCP1005', session: '2025-26' },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const HEAD_COLORS = {
  'Sports Fee':    { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', dot: 'bg-emerald-500' },
  'Library Fee':   { bg: 'bg-blue-50 dark:bg-blue-500/10',       text: 'text-blue-700 dark:text-blue-400',       dot: 'bg-blue-500' },
  'Lab Fee':       { bg: 'bg-violet-50 dark:bg-violet-500/10',   text: 'text-violet-700 dark:text-violet-400',   dot: 'bg-violet-500' },
  'Computer Fee':  { bg: 'bg-cyan-50 dark:bg-cyan-500/10',       text: 'text-cyan-700 dark:text-cyan-400',       dot: 'bg-cyan-500' },
  'Exam Fee':      { bg: 'bg-rose-50 dark:bg-rose-500/10',       text: 'text-rose-700 dark:text-rose-400',       dot: 'bg-rose-500' },
  'Uniform Fee':   { bg: 'bg-orange-50 dark:bg-orange-500/10',   text: 'text-orange-700 dark:text-orange-400',   dot: 'bg-orange-500' },
  'Activity Fee':  { bg: 'bg-pink-50 dark:bg-pink-500/10',       text: 'text-pink-700 dark:text-pink-400',       dot: 'bg-pink-500' },
  'Transport Fee': { bg: 'bg-amber-50 dark:bg-amber-500/10',     text: 'text-amber-700 dark:text-amber-400',     dot: 'bg-amber-500' },
  'Hostel Fee':    { bg: 'bg-teal-50 dark:bg-teal-500/10',       text: 'text-teal-700 dark:text-teal-400',       dot: 'bg-teal-500' },
  'Medical Fee':   { bg: 'bg-red-50 dark:bg-red-500/10',         text: 'text-red-700 dark:text-red-400',         dot: 'bg-red-500' },
}
const getHeadColor = (h) => HEAD_COLORS[h] || { bg: 'bg-slate-50 dark:bg-slate-500/10', text: 'text-slate-700 dark:text-slate-400', dot: 'bg-slate-500' }

const formatDate = (d) => {
  if (!d) return ''
  const dt = new Date(d)
  if (isNaN(dt)) return d
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const todayISO = () => new Date().toISOString().split('T')[0]

// ─── PRIMITIVE UI COMPONENTS ──────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function TextInput({ value, onChange, placeholder, error, disabled, readOnly, type = 'text', prefix }) {
  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 text-[13px] pointer-events-none">
          {prefix}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full py-2.5 text-[13px] rounded-xl border outline-none transition-all
          bg-white text-slate-800 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          read-only:bg-slate-50 dark:read-only:bg-[#181d30] read-only:cursor-default
          ${prefix ? 'pl-7' : 'pl-3'} pr-3
          ${error ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      />
    </div>
  )
}

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="ml-1 text-[10px] font-normal text-slate-400 normal-case tracking-normal">({hint})</span>
        )}
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

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100"><X className="w-4 h-4" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const c = {
    blue:    'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    amber:   'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400',
    violet:  'bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3.5 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── STUDENT INFO CARD (shown after admission no lookup) ─────────────────────
function StudentInfoBadge({ student }) {
  if (!student) return null
  return (
    <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/25 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-500/[0.06] dark:to-teal-500/[0.04] p-4 flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div>
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{student.name}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">S/O {student.father}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/5 border border-emerald-200 dark:border-emerald-500/20 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
          <BookOpen className="w-3.5 h-3.5" />{student.class}
        </span>
      </div>
      <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-500 ml-auto font-semibold">
        <CheckCircle2 className="w-3.5 h-3.5" /> Student Found
      </span>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const hc = getHeadColor(row.head)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>
      <td className="px-4 py-3 text-center text-[12px] text-slate-600 dark:text-slate-300 font-medium whitespace-nowrap">
        <span className="flex items-center gap-1.5 justify-center">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          {row.pay_date}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold ${hc.bg} ${hc.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${hc.dot} flex-shrink-0`} />
          {row.head}
        </span>
      </td>
      <td className="px-4 py-3 text-center text-[12px] font-mono font-semibold text-slate-600 dark:text-slate-300">{row.adm_no}</td>
      <td className="px-4 py-3">
        <div className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</div>
      </td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[13px] font-bold tabular-nums">
          <IndianRupee className="w-3.5 h-3.5" />{row.amount.toLocaleString('en-IN')}
        </span>
      </td>
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400 max-w-[150px] truncate">
        {row.remarks || <span className="text-slate-300 dark:text-slate-600 italic">—</span>}
      </td>
    </tr>
  )
}

// ─── MOBILE RECORD CARD ───────────────────────────────────────────────────────
function MobileRecordCard({ row, idx }) {
  const hc = getHeadColor(row.head)
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-start gap-3 p-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${hc.bg}`}>
          <Tag className={`w-4 h-4 ${hc.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.name}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">Adm: {row.adm_no} · {row.pay_date}</p>
            </div>
            <span className="flex items-center gap-0.5 text-[16px] font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums flex-shrink-0">
              <IndianRupee className="w-3.5 h-3.5" />{row.amount.toLocaleString('en-IN')}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${hc.bg} ${hc.text}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${hc.dot}`} />{row.head}
            </span>
            {row.remarks && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700/50 truncate max-w-[160px]">
                <FileText className="w-3 h-3 flex-shrink-0" />{row.remarks}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── ENTRY FORM ───────────────────────────────────────────────────────────────
function EntryForm({ onSave, sessions, miscHeads, studentDb }) {
  const [form, setForm] = useState({
    receipt: '', session: '2025-26', head: '', admNo: '', amount: '', date: todayISO(), remark: ''
  })
  const [student, setStudent] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [admLookup, setAdmLookup] = useState(false)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  // Auto-lookup student on admission no change
  useEffect(() => {
    const adm = form.admNo.trim().toUpperCase()
    if (adm.length >= 4) {
      setAdmLookup(true)
      const t = setTimeout(() => {
        setStudent(studentDb[adm] || null)
        setAdmLookup(false)
      }, 400)
      return () => clearTimeout(t)
    } else {
      setStudent(null)
    }
  }, [form.admNo])

  const validate = () => {
    const e = {}
    if (!form.receipt.trim()) e.receipt = 'Receipt No. required'
    if (!form.head) e.head = 'Select miscellaneous head'
    if (!form.admNo.trim()) e.admNo = 'Admission No. required'
    if (!student && form.admNo.trim()) e.admNo = 'Student not found'
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) e.amount = 'Enter valid amount'
    if (!form.date) e.date = 'Select date'
    return e
  }

  const handleSave = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setSaving(true)
    setTimeout(() => {
      const headLabel = miscHeads.find(h => String(h.id) === form.head)?.label || form.head
      onSave({
        pay_date: formatDate(form.date),
        head: headLabel,
        adm_no: form.admNo.trim().toUpperCase(),
        name: student.name,
        amount: Number(form.amount),
        remarks: form.remark,
        receipt_no: form.receipt.trim(),
        session: form.session,
        stu_id: Date.now(),
      })
      setForm({ receipt: '', session: form.session, head: '', admNo: '', amount: '', date: todayISO(), remark: '' })
      setStudent(null)
      setSaving(false)
    }, 700)
  }

  const handleReset = () => {
    setForm({ receipt: '', session: '2025-26', head: '', admNo: '', amount: '', date: todayISO(), remark: '' })
    setStudent(null)
    setErrors({})
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-6 rounded-full bg-blue-500 flex-shrink-0" />
        <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">New Fee Entry</span>
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 text-[11px] font-semibold text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
          <Info className="w-3 h-3" /> Fill all required fields
        </span>
      </div>

      <div className="p-5 space-y-5">
        {/* Row 1: Receipt + Session + Head */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Receipt No." required error={errors.receipt}>
            <TextInput
              value={form.receipt}
              onChange={e => { set('receipt', e.target.value); setErrors(p => ({ ...p, receipt: undefined })) }}
              placeholder="e.g. RCP2001"
              error={errors.receipt}
              prefix={<Hash className="w-3.5 h-3.5" />}
            />
          </Field>

          <Field label="Session" required>
            <NativeSelect value={form.session} onChange={e => set('session', e.target.value)}>
              {sessions.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Miscellaneous Head" required error={errors.head}>
            <NativeSelect
              value={form.head}
              onChange={e => { set('head', e.target.value); setErrors(p => ({ ...p, head: undefined })) }}
              placeholder="-- Select Head --"
              error={errors.head}
            >
              {miscHeads.map(h => <option key={h.id} value={String(h.id)}>{h.label}</option>)}
            </NativeSelect>
          </Field>
        </div>

        {/* Row 2: Admission No. + Amount + Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="Admission No." required error={errors.admNo} hint="auto-fills student info">
            <div className="relative">
              <TextInput
                value={form.admNo}
                onChange={e => { set('admNo', e.target.value.toUpperCase()); setErrors(p => ({ ...p, admNo: undefined })) }}
                placeholder="e.g. ADM001"
                error={errors.admNo}
              />
              {admLookup && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                </span>
              )}
              {student && !admLookup && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </span>
              )}
            </div>
          </Field>

          <Field label="Amount (₹)" required error={errors.amount}>
            <TextInput
              value={form.amount}
              onChange={e => {
                const v = e.target.value.replace(/[^0-9]/g, '')
                set('amount', v)
                setErrors(p => ({ ...p, amount: undefined }))
              }}
              placeholder="Enter amount"
              error={errors.amount}
              prefix={<IndianRupee className="w-3.5 h-3.5" />}
            />
          </Field>

          <Field label="Date" required error={errors.date}>
            <TextInput
              type="date"
              value={form.date}
              onChange={e => { set('date', e.target.value); setErrors(p => ({ ...p, date: undefined })) }}
              error={errors.date}
            />
          </Field>
        </div>

        {/* Student Info Banner */}
        {student && <StudentInfoBadge student={student} />}

        {/* Row 3: Read-only student fields + Remark */}
        {student && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Student Name">
              <TextInput value={student.name} readOnly />
            </Field>
            <Field label="Class">
              <TextInput value={student.class} readOnly />
            </Field>
            <Field label="Father's Name">
              <TextInput value={student.father} readOnly />
            </Field>
          </div>
        )}

        <Field label="Remark">
          <TextInput
            value={form.remark}
            onChange={e => set('remark', e.target.value)}
            placeholder="Optional note (e.g. Annual fee, Term 1…)"
          />
        </Field>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex-1 sm:flex-none sm:w-48 flex items-center justify-center gap-2 py-3 px-6 rounded-xl
              text-[14px] font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-lg shadow-blue-500/20 dark:shadow-indigo-500/20 transition-all active:scale-[0.98] disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Entry'}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 py-3 px-5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── RECORDS TABLE / LIST ─────────────────────────────────────────────────────
function RecordsPanel({ records }) {
  const [search, setSearch] = useState('')
  const [filterHead, setFilterHead] = useState('')

  const heads = useMemo(() => [...new Set(records.map(r => r.head))], [records])

  const filtered = useMemo(() => {
    let r = records
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(x => x.name.toLowerCase().includes(q) || x.adm_no.toLowerCase().includes(q) || x.head.toLowerCase().includes(q))
    }
    if (filterHead) r = r.filter(x => x.head === filterHead)
    return r
  }, [records, search, filterHead])

  const totalAmt = useMemo(() => filtered.reduce((s, r) => s + r.amount, 0), [filtered])

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
          <LayoutList className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Fee Records</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400">
            {filtered.length} entries
          </span>
          {totalAmt > 0 && (
            <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
              <IndianRupee className="w-3.5 h-3.5" />{totalAmt.toLocaleString('en-IN')} total
            </span>
          )}
        </div>
        {/* Search + Filter */}
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-52">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name, adm no…"
              className="w-full pl-8 pr-7 py-2 text-[12px] rounded-xl border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:placeholder-slate-600"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="relative flex-shrink-0">
            <select
              value={filterHead}
              onChange={e => setFilterHead(e.target.value)}
              className="appearance-none pl-3 pr-7 py-2 text-[12px] rounded-xl border outline-none transition-all
                bg-white text-slate-700 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] cursor-pointer"
            >
              <option value="">All Heads</option>
              {heads.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <Filter className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-600">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Receipt className="w-6 h-6 opacity-40" />
          </div>
          <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
            {records.length === 0 ? 'No fee entries yet' : 'No records match your search'}
          </p>
          {records.length === 0 && (
            <p className="text-[12px] text-slate-400 dark:text-slate-500 text-center max-w-[240px]">
              Fill the form above and click <strong>Save Entry</strong> to record a fee payment.
            </p>
          )}
        </div>
      )}

      {/* Desktop Table */}
      {filtered.length > 0 && (
        <>
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Date', 'Head', 'Adm. No.', 'Student Name', 'Amount (₹)', 'Remark'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center first:w-10 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.uid} row={row} idx={i + 1} />
                ))}
                {/* Summary row */}
                <tr className="bg-emerald-50/60 dark:bg-emerald-500/[0.05] border-t-2 border-emerald-200 dark:border-emerald-500/30">
                  <td colSpan={5} className="px-4 py-3 text-right">
                    <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-2 justify-end">
                      <TrendingUp className="w-4 h-4" />Total Amount ({filtered.length} entries)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[14px] font-extrabold tabular-nums">
                      <IndianRupee className="w-3.5 h-3.5" />{totalAmt.toLocaleString('en-IN')}
                    </span>
                  </td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0" /> {filtered.length} entries — ₹{totalAmt.toLocaleString('en-IN')} collected
            </p>
            {filtered.map((row, i) => <MobileRecordCard key={row.uid} row={row} idx={i + 1} />)}
            {/* Mobile Total */}
            <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/[0.07] p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">Total Collected</span>
              </div>
              <span className="flex items-center gap-0.5 text-[20px] font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">
                <IndianRupee className="w-4 h-4" />{totalAmt.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      {filtered.length > 0 && (
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/40 dark:bg-white/[0.01]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-300">{records.length}</span> records
          </p>
          {(search || filterHead) && (
            <button onClick={() => { setSearch(''); setFilterHead('') }}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function MiscellaneousFee() {
  const [records, setRecords] = useState(INITIAL_RECORDS.map((r, i) => ({ ...r, uid: i + 1 })))
  const [toast, setToast] = useState(null)
  // Tab state for mobile
  const [mobileTab, setMobileTab] = useState('entry') // 'entry' | 'records'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  const handleSave = useCallback((entry) => {
    setRecords(prev => [{ ...entry, uid: Date.now() }, ...prev])
    showToast(`Fee saved! ₹${entry.amount.toLocaleString('en-IN')} — ${entry.name}`)
    setMobileTab('records') // switch to records tab on mobile after save
  }, [])

  // Stats
  const stats = useMemo(() => ({
    total: records.length,
    amount: records.reduce((s, r) => s + r.amount, 0),
    today: records.filter(r => r.pay_date === formatDate(todayISO())).length,
    heads: new Set(records.map(r => r.head)).size,
  }), [records])

  return (
    <div className="space-y-4 pb-14 md:pb-8">
      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Miscellaneous Fee
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Collect & track student miscellaneous fee payments — sports, library, lab, transport, and more.
          </p>
        </div>
        {/* School badge */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex-shrink-0">
          <Building2 className="w-4 h-4 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-[11px] font-bold text-blue-700 dark:text-blue-300 max-w-[200px] truncate">{SCHOOL_INFO.name}</p>
            <p className="text-[10px] text-blue-500 dark:text-blue-400 flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5" />{SCHOOL_INFO.address.split(',')[0]}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Receipt}      label="Total Entries"      value={stats.total.toString()}                            color="blue"    />
        <StatCard icon={IndianRupee}  label="Total Collected"    value={`₹${stats.amount.toLocaleString('en-IN')}`}       color="emerald" />
        <StatCard icon={Clock}        label="Today's Entries"    value={stats.today.toString()}                            color="amber"   />
        <StatCard icon={Tag}          label="Fee Heads Used"     value={stats.heads.toString()}                            color="violet"  />
      </div>

      {/* ── DESKTOP: Form + Records stacked normally ───────────────────── */}
      <div className="hidden md:block space-y-4">
        <EntryForm onSave={handleSave} sessions={SESSIONS} miscHeads={MISC_HEADS} studentDb={STUDENT_DB} />
        <RecordsPanel records={records} />
      </div>

      {/* ── MOBILE: Tab switcher ───────────────────────────────────────── */}
      <div className="md:hidden">
        {/* Tab Bar */}
        <div className="flex rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-100 dark:bg-[#151929] p-1 mb-4">
          <button
            type="button"
            onClick={() => setMobileTab('entry')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all
              ${mobileTab === 'entry'
                ? 'bg-white dark:bg-[#1a1f35] text-blue-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <CreditCard className="w-4 h-4" /> New Entry
          </button>
          <button
            type="button"
            onClick={() => setMobileTab('records')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold transition-all
              ${mobileTab === 'records'
                ? 'bg-white dark:bg-[#1a1f35] text-emerald-600 dark:text-emerald-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <LayoutList className="w-4 h-4" /> Records
            {records.length > 0 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                {records.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {mobileTab === 'entry' && (
          <EntryForm onSave={handleSave} sessions={SESSIONS} miscHeads={MISC_HEADS} studentDb={STUDENT_DB} />
        )}
        {mobileTab === 'records' && (
          <RecordsPanel records={records} />
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
