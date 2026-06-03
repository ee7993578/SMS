/**
 * ImportExcelFee.jsx
 * Fee Excel Import / Upload Page
 * Converts ASPX upload_excel_importexcel_database to fully responsive React + Tailwind
 *
 * Features:
 *  - Step-based upload wizard (mobile friendly)
 *  - Session / Month / Mode / Bank dropdowns
 *  - File upload with drag & drop
 *  - Uploaded records grid with Failed Students popup
 *  - Edit failed student reg_no inline
 *  - Delete sheet
 *  - View report popup link
 *  - Mobile: card-based records, drawer filters
 *  - Desktop: dense ERP table
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X,
  ChevronDown, Loader2, Eye, Trash2, RefreshCw,
  Filter, SlidersHorizontal, Building2, MapPin,
  Calendar, Banknote, CreditCard, FileCheck,
  Users, AlertTriangle, Edit3, Check, Search,
  ChevronRight, ChevronLeft, Info, Download,
  UploadCloud, File, XCircle, BadgeCheck, Clock,
  ArrowRight, IndianRupee, BookOpen, TrendingUp,
  Landmark, ReceiptText, ShieldAlert
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const MONTHS = [
  { id: '1', name: 'April' }, { id: '2', name: 'May' }, { id: '3', name: 'June' },
  { id: '4', name: 'July' }, { id: '5', name: 'August' }, { id: '6', name: 'September' },
  { id: '7', name: 'October' }, { id: '8', name: 'November' }, { id: '9', name: 'December' },
  { id: '10', name: 'January' }, { id: '11', name: 'February' }, { id: '12', name: 'March' },
]

const BANKS = [
  { id: '1', name: 'State Bank of India' },
  { id: '2', name: 'HDFC Bank' },
  { id: '3', name: 'ICICI Bank' },
  { id: '4', name: 'Punjab National Bank' },
  { id: '5', name: 'Axis Bank' },
  { id: '6', name: 'Bank of Baroda' },
]

const PAY_MODES = ['Cash', 'Cheque', 'Net Banking', 'Bank', 'UPI', 'DD']

const FILE_TYPES = [
  { id: '1', name: 'CMS' },
  { id: '2', name: 'Qfix' },
]

// Dummy uploaded records
const DUMMY_RECORDS = [
  {
    guid: 'abc123', title: 'April Fee 2024',
    month: 'April', mode: 'Net Banking', filetype: 'CMS',
    postedDate: '01 Apr 2024', session: '2024-25',
    total: 42, failed: 3, bank: 'HDFC Bank',
  },
  {
    guid: 'def456', title: 'May Fee 2024',
    month: 'May', mode: 'Cash', filetype: 'CMS',
    postedDate: '02 May 2024', session: '2024-25',
    total: 38, failed: 0, bank: '',
  },
  {
    guid: 'ghi789', title: 'June CMS Upload',
    month: 'June', mode: 'Cheque', filetype: 'CMS',
    postedDate: '01 Jun 2024', session: '2024-25',
    total: 55, failed: 7, bank: 'SBI',
  },
  {
    guid: 'jkl012', title: 'July Qfix Data',
    month: 'July', mode: 'UPI', filetype: 'Qfix',
    postedDate: '02 Jul 2024', session: '2024-25',
    total: 61, failed: 1, bank: '',
  },
]

// Dummy failed students
const DUMMY_FAILED = {
  abc123: [
    { id: 1, reg_no: '', stu_name: 'Ravi Kumar', class: '', amount: '1200' },
    { id: 2, reg_no: 'SR0045', stu_name: 'Priya Singh', class: '', amount: '1500' },
    { id: 3, reg_no: '', stu_name: 'Amit Sharma', class: 'Class V', amount: '900' },
  ],
  ghi789: Array.from({ length: 7 }, (_, i) => ({
    id: i + 1,
    reg_no: i % 2 === 0 ? '' : `SR00${10 + i}`,
    stu_name: `Student ${i + 1}`,
    class: i % 3 === 0 ? '' : `Class ${['III', 'IV', 'V', 'VI'][i % 4]}`,
    amount: String(800 + i * 100),
  })),
  jkl012: [
    { id: 1, reg_no: '', stu_name: 'Nisha Yadav', class: 'Class VIII', amount: '2000' },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const MODE_COLORS = {
  Cash:        'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300',
  Cheque:      'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300',
  'Net Banking':'bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300',
  Bank:        'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/20 dark:text-indigo-300',
  UPI:         'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300',
  DD:          'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300',
}

const bankRequired = (mode) => ['Cheque', 'Net Banking', 'Bank'].includes(mode)

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
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
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
          } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, hint, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}{required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="ml-1 text-[11px] text-slate-400 normal-case font-normal tracking-normal">{hint}</span>
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
        ${type === 'success'
          ? 'bg-emerald-600 text-white'
          : type === 'error'
          ? 'bg-rose-600 text-white'
          : 'bg-blue-600 text-white'
        }`}
      style={{ animation: 'slideUp .3s ease' }}
    >
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100 ml-1">
        <X className="w-4 h-4" />
      </button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── STEP INDICATOR ───────────────────────────────────────────────────────────

function StepBar({ steps, current }) {
  return (
    <div className="flex items-center gap-0 w-full mb-6">
      {steps.map((step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-300
                ${done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'}`}>
                {done ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span className={`text-[10px] font-semibold whitespace-nowrap hidden sm:block ${active ? 'text-blue-600 dark:text-blue-400' : done ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`h-0.5 flex-1 mx-1 transition-all duration-300 ${done ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── FILE DROP ZONE ───────────────────────────────────────────────────────────

function FileDropZone({ file, onFile, error }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef()

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }

  const handleChange = (e) => {
    const f = e.target.files[0]
    if (f) onFile(f)
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 overflow-hidden
          ${dragging ? 'border-blue-400 bg-blue-50 dark:bg-blue-500/10 scale-[1.01]' :
            file ? 'border-emerald-400 bg-emerald-50/60 dark:bg-emerald-500/10' :
            error ? 'border-rose-400 bg-rose-50/40 dark:bg-rose-500/10' :
            'border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-50/50 dark:bg-white/[0.02] hover:border-blue-300 dark:hover:border-indigo-400/50 hover:bg-blue-50/30 dark:hover:bg-blue-500/5'
          }`}
      >
        <input ref={inputRef} type="file" accept=".xlsx" className="hidden" onChange={handleChange} />

        {file ? (
          <div className="flex items-center gap-4 px-5 py-5">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{file.name}</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                {(file.size / 1024).toFixed(1)} KB · Excel File (.xlsx)
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); onFile(null) }}
              className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-6 text-center gap-3">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${dragging ? 'bg-blue-100 dark:bg-blue-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
              <UploadCloud className={`w-7 h-7 transition-colors ${dragging ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                {dragging ? 'Drop your Excel file here' : 'Click or drag Excel file here'}
              </p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
                Only <span className="font-semibold text-green-600 dark:text-green-400">.xlsx</span> files supported · Max 10MB
              </p>
            </div>
          </div>
        )}
      </div>
      {error && (
        <p className="flex items-center gap-1.5 text-[12px] text-rose-500 mt-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

// ─── FAILED STUDENTS MODAL ────────────────────────────────────────────────────

function FailedStudentsModal({ record, onClose }) {
  const [students, setStudents] = useState(DUMMY_FAILED[record?.guid] || [])
  const [editId, setEditId] = useState(null)
  const [editVal, setEditVal] = useState('')
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.stu_name.toLowerCase().includes(q) ||
      (s.reg_no || '').toLowerCase().includes(q) ||
      (s.class || '').toLowerCase().includes(q)
    )
  }, [students, search])

  const startEdit = (s) => { setEditId(s.id); setEditVal(s.reg_no || '') }

  const saveEdit = (id) => {
    setSaving(true)
    setTimeout(() => {
      setStudents(prev => prev.map(s =>
        s.id === id ? { ...s, reg_no: editVal } : s
      ))
      setSaving(false)
      setEditId(null)
    }, 600)
  }

  const cancelEdit = () => { setEditId(null); setEditVal('') }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full sm:max-w-2xl bg-white dark:bg-[#1a1f35] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden flex flex-col max-h-[90vh]"
        style={{ animation: 'modalIn .3s ease' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Handle (mobile) */}
        <div className="flex justify-center pt-3 sm:hidden">
          <div className="w-10 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] flex-shrink-0">
          <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-4.5 h-4.5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Failed Students</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{record?.title}</p>
          </div>
          <span className="text-[12px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300 flex-shrink-0">
            {students.length} Records
          </span>
          <button onClick={onClose} className="ml-1 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info banner */}
        <div className="flex items-start gap-2.5 mx-5 mt-4 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex-shrink-0">
          <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-[12px] text-amber-700 dark:text-amber-300 leading-relaxed">
            These students have missing <strong>Reg No</strong> or <strong>Class</strong>. Edit their Admission No below and update to fix records.
          </p>
        </div>

        {/* Search */}
        <div className="px-5 pt-3 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, reg no, class..."
              className="w-full pl-9 pr-8 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20 placeholder-slate-300 dark:placeholder-slate-600"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Table — desktop */}
        <div className="flex-1 overflow-y-auto px-5 py-3 space-y-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
              <Search className="w-8 h-8 opacity-30" />
              <p className="text-[13px]">No matching students found</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                      {['#', 'Reg No', 'Student Name', 'Class', 'Amount', 'Action'].map(h => (
                        <th key={h} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id} className="border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] hover:bg-slate-50/50 dark:hover:bg-white/[0.015]">
                        <td className="px-3 py-3 text-slate-400 text-[12px]">{i + 1}</td>
                        <td className="px-3 py-3">
                          {editId === s.id ? (
                            <input
                              autoFocus
                              value={editVal}
                              onChange={e => setEditVal(e.target.value)}
                              className="w-28 px-2 py-1 text-[12px] rounded-lg border border-blue-400 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-400 outline-none text-slate-800 dark:text-slate-100 font-mono"
                              placeholder="e.g. SR0123"
                            />
                          ) : (
                            <span className={`font-mono text-[12px] ${!s.reg_no ? 'text-rose-500 dark:text-rose-400 italic' : 'text-slate-700 dark:text-slate-200'}`}>
                              {s.reg_no || '— missing —'}
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-700 dark:text-slate-200">{s.stu_name}</td>
                        <td className="px-3 py-3">
                          <span className={`text-[12px] ${!s.class ? 'text-rose-500 dark:text-rose-400 italic' : 'text-slate-600 dark:text-slate-400'}`}>
                            {s.class || '— missing —'}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          <span className="flex items-center gap-0.5 text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
                            <IndianRupee className="w-3 h-3" />{s.amount}
                          </span>
                        </td>
                        <td className="px-3 py-3">
                          {editId === s.id ? (
                            <div className="flex items-center gap-1.5">
                              <button onClick={() => saveEdit(s.id)} disabled={saving}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 text-white text-[11px] font-bold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1">
                                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                                Save
                              </button>
                              <button onClick={cancelEdit}
                                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-200">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => startEdit(s)}
                              className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[11px] font-bold hover:bg-amber-200 dark:hover:bg-amber-500/30 flex items-center gap-1">
                              <Edit3 className="w-3 h-3" />Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-2">
                {filtered.map((s, i) => (
                  <div key={s.id} className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1e2238] p-3.5">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{s.stu_name}</p>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                          <span className={`text-[12px] ${!s.class ? 'text-rose-500 italic' : 'text-slate-500 dark:text-slate-400'}`}>
                            {s.class || 'Class missing'}
                          </span>
                          <span className="flex items-center gap-0.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400">
                            <IndianRupee className="w-3 h-3" />{s.amount}
                          </span>
                        </div>

                        {/* Reg No edit row */}
                        <div className="mt-2.5">
                          {editId === s.id ? (
                            <div className="flex gap-2">
                              <input
                                autoFocus
                                value={editVal}
                                onChange={e => setEditVal(e.target.value)}
                                className="flex-1 px-3 py-2 text-[13px] rounded-xl border border-blue-400 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-400 outline-none text-slate-800 dark:text-slate-100 font-mono"
                                placeholder="Admission No e.g. SR0123"
                              />
                              <button onClick={() => saveEdit(s.id)} disabled={saving}
                                className="px-3 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-bold hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1">
                                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={cancelEdit}
                                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200">
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className={`flex-1 font-mono text-[12px] px-2.5 py-1.5 rounded-lg border ${!s.reg_no ? 'border-rose-200 bg-rose-50 text-rose-500 dark:bg-rose-500/10 dark:border-rose-500/30 dark:text-rose-400 italic' : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                                {s.reg_no || 'Reg No missing'}
                              </span>
                              <button onClick={() => startEdit(s)}
                                className="px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[12px] font-bold hover:bg-amber-200 flex items-center gap-1">
                                <Edit3 className="w-3.5 h-3.5" />Edit
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.12)] flex-shrink-0 bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400">{filtered.length} of {students.length} shown</p>
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white text-[13px] font-semibold hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CONFIRM DELETE MODAL ─────────────────────────────────────────────────────

function DeleteConfirmModal({ record, onConfirm, onClose }) {
  const [deleting, setDeleting] = useState(false)

  const handleConfirm = () => {
    setDeleting(true)
    setTimeout(() => { setDeleting(false); onConfirm() }, 900)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-6"
        style={{ animation: 'modalIn .25s ease' }}>
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-[16px] font-bold text-slate-800 dark:text-slate-100">Delete Upload?</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              "<span className="font-semibold text-slate-700 dark:text-slate-200">{record?.title}</span>" will be permanently deleted. This cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[13px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button onClick={handleConfirm} disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-rose-600 text-white text-[13px] font-semibold hover:bg-rose-700 disabled:opacity-70 transition-colors">
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── UPLOADED RECORD CARD (Mobile) ────────────────────────────────────────────

function RecordCard({ rec, idx, session, onFailed, onDelete, onView }) {
  const [expanded, setExpanded] = useState(false)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button type="button" onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <FileSpreadsheet className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{rec.title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-400">{rec.postedDate}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${MODE_COLORS[rec.mode] || 'bg-slate-100 text-slate-600'}`}>
              {rec.mode}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">{rec.total}</span>
          <span className="text-[9px] font-semibold text-slate-400 uppercase">records</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-300 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.08)] px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Month</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{rec.month}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">File Type</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{rec.filetype}</p>
            </div>
            {rec.bank && (
              <div className="col-span-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2.5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Bank</p>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5">{rec.bank}</p>
              </div>
            )}
          </div>

          {/* Failed count */}
          {rec.failed > 0 && (
            <button onClick={() => onFailed(rec)}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
              <AlertTriangle className="w-4 h-4 text-rose-500 dark:text-rose-400 flex-shrink-0" />
              <span className="flex-1 text-[13px] font-semibold text-rose-700 dark:text-rose-300">
                {rec.failed} Failed Records — Tap to Fix
              </span>
              <ChevronRight className="w-4 h-4 text-rose-400" />
            </button>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={() => onView(rec)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 transition-colors">
              <Eye className="w-4 h-4" />View Report
            </button>
            <button onClick={() => onDelete(rec)}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[13px] font-semibold hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const STEPS = ['Details', 'Upload File', 'Preview & Submit']

export default function ImportExcelFee() {
  // ── Upload wizard state ───────────────────────────────────────────────────
  const [step, setStep] = useState(0)
  const [session, setSession] = useState('')
  const [title, setTitle] = useState('')
  const [month, setMonth] = useState('')
  const [mode, setMode] = useState('')
  const [bank, setBank] = useState('')
  const [fileType, setFileType] = useState('')
  const [file, setFile] = useState(null)
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)

  // ── Records table state ───────────────────────────────────────────────────
  const [gridSession, setGridSession] = useState('2024-25')
  const [records, setRecords] = useState(DUMMY_RECORDS)
  const [gridSearch, setGridSearch] = useState('')

  // ── Modals ────────────────────────────────────────────────────────────────
  const [failedModal, setFailedModal] = useState(null)
  const [deleteModal, setDeleteModal] = useState(null)

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null)

  // ── Accordion (mobile form) ───────────────────────────────────────────────
  const [formOpen, setFormOpen] = useState(true)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validateStep0 = () => {
    const e = {}
    if (!session) e.session = 'Required'
    if (!title.trim()) e.title = 'Required'
    if (!month) e.month = 'Required'
    if (!mode) e.mode = 'Required'
    if (bankRequired(mode) && !bank) e.bank = 'Required for this pay mode'
    if (!fileType) e.fileType = 'Required'
    return e
  }

  const validateStep1 = () => {
    const e = {}
    if (!file) e.file = 'Please select an Excel (.xlsx) file'
    return e
  }

  const nextStep = () => {
    let e = {}
    if (step === 0) e = validateStep0()
    if (step === 1) e = validateStep1()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setStep(s => s + 1)
  }

  const prevStep = () => { setErrors({}); setStep(s => s - 1) }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    setUploading(true)
    setTimeout(() => {
      const newRec = {
        guid: Math.random().toString(36).slice(2, 8),
        title,
        month: MONTHS.find(m => m.id === month)?.name || '',
        mode,
        filetype: FILE_TYPES.find(f => f.id === fileType)?.name || '',
        postedDate: new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }),
        session: gridSession || session,
        total: Math.floor(Math.random() * 40) + 20,
        failed: Math.floor(Math.random() * 5),
        bank: bank ? BANKS.find(b => b.id === bank)?.name || '' : '',
      }
      setRecords(prev => [newRec, ...prev])
      setUploading(false)
      setUploadSuccess(true)
      showToast('Excel imported to database successfully!')
      setTimeout(() => {
        setUploadSuccess(false)
        setStep(0)
        setSession(''); setTitle(''); setMonth(''); setMode('')
        setBank(''); setFileType(''); setFile(null)
        setFormOpen(false)
      }, 2500)
    }, 1800)
  }

  // ── Delete record ─────────────────────────────────────────────────────────
  const handleDelete = () => {
    setRecords(prev => prev.filter(r => r.guid !== deleteModal.guid))
    setDeleteModal(null)
    showToast('Record deleted successfully.')
  }

  // ── Filtered grid records ─────────────────────────────────────────────────
  const filteredRecords = useMemo(() => {
    let list = records.filter(r => r.session === gridSession)
    if (gridSearch) {
      const q = gridSearch.toLowerCase()
      list = list.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.month.toLowerCase().includes(q) ||
        r.mode.toLowerCase().includes(q)
      )
    }
    return list
  }, [records, gridSession, gridSearch])

  const totalStudents = useMemo(() => filteredRecords.reduce((s, r) => s + r.total, 0), [filteredRecords])
  const totalFailed   = useMemo(() => filteredRecords.reduce((s, r) => s + r.failed, 0), [filteredRecords])

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111827] pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* ── PAGE HEADER ────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
              <IndianRupee className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[20px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-tight">
                Fee Excel Import
              </h1>
              <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
                Import fee collection data from Excel files
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href="#" className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] text-[13px] font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm">
              <Download className="w-4 h-4" />Sample File
            </a>
          </div>
        </div>

        {/* ── UPLOAD FORM CARD ──────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card header with toggle */}
          <button
            type="button"
            onClick={() => setFormOpen(p => !p)}
            className="w-full flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100/50 dark:hover:bg-white/[0.03] transition-colors"
          >
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1 text-left">
              Upload New Excel File
            </span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${formOpen ? 'rotate-180' : ''}`} />
          </button>

          {formOpen && (
            <div className="p-5">
              {/* Step bar */}
              <StepBar steps={STEPS} current={step} />

              {/* ── STEP 0: Details ── */}
              {step === 0 && (
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Session" error={errors.session} required>
                      <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
                        {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </NativeSelect>
                    </Field>

                    <Field label="Upload Title" error={errors.title} required>
                      <input
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="e.g. April Fee CMS 2024"
                        className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                          bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                          focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20
                          placeholder-slate-300 dark:placeholder-slate-600
                          ${errors.title ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)]'}`}
                      />
                    </Field>

                    <Field label="Fee Month" error={errors.month} required>
                      <NativeSelect value={month} onChange={e => setMonth(e.target.value)} placeholder="-- Select Month --" error={errors.month}>
                        {MONTHS.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </NativeSelect>
                    </Field>

                    <Field label="Pay Mode" error={errors.mode} required>
                      <NativeSelect value={mode} onChange={e => { setMode(e.target.value); setBank('') }} placeholder="-- Select Pay Mode --" error={errors.mode}>
                        {PAY_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                      </NativeSelect>
                    </Field>

                    {bankRequired(mode) && (
                      <Field label="Bank Name" error={errors.bank} required hint="(required for this pay mode)">
                        <NativeSelect value={bank} onChange={e => setBank(e.target.value)} placeholder="-- Select Bank --" error={errors.bank}>
                          {BANKS.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </NativeSelect>
                      </Field>
                    )}

                    <Field label="File Type" error={errors.fileType} required>
                      <NativeSelect value={fileType} onChange={e => setFileType(e.target.value)} placeholder="-- Select File Type --" error={errors.fileType}>
                        {FILE_TYPES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                      </NativeSelect>
                    </Field>
                  </div>

                  {/* Pay mode info */}
                  {mode && (
                    <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <p className="text-[12px] text-blue-700 dark:text-blue-300">
                        Selected mode: <strong>{mode}</strong>
                        {bankRequired(mode) ? ' — Bank selection is mandatory.' : ' — No bank required.'}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── STEP 1: Upload File ── */}
              {step === 1 && (
                <div className="space-y-5">
                  <FileDropZone file={file} onFile={setFile} error={errors.file} />

                  <div className="rounded-xl border border-blue-200 dark:border-blue-500/25 bg-blue-50 dark:bg-blue-500/10 p-4 space-y-2">
                    <p className="text-[12px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5" />Required Excel Columns
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {['Admission No', 'Student Name', 'Amount', 'Paid Date', 'Pay mode', 'Bank Ref No', 'Bank Name', 'Pay Mode Date', 'Remark'].map(col => (
                        <span key={col} className="flex items-center gap-1.5 text-[11px] font-mono text-blue-800 dark:text-blue-300">
                          <BadgeCheck className="w-3 h-3 text-blue-500 flex-shrink-0" />{col}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── STEP 2: Preview & Submit ── */}
              {step === 2 && !uploadSuccess && (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden">
                    <div className="px-4 py-3 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                      <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Upload Summary</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-[rgba(99,102,241,0.1)]">
                      {[
                        { label: 'Session', value: session, icon: Calendar },
                        { label: 'Title', value: title, icon: FileSpreadsheet },
                        { label: 'Month', value: MONTHS.find(m => m.id === month)?.name, icon: Clock },
                        { label: 'Pay Mode', value: mode, icon: CreditCard },
                        ...(bankRequired(mode) && bank ? [{ label: 'Bank', value: BANKS.find(b => b.id === bank)?.name, icon: Landmark }] : []),
                        { label: 'File Type', value: FILE_TYPES.find(f => f.id === fileType)?.name, icon: ReceiptText },
                        { label: 'File', value: file?.name, icon: File },
                      ].map(({ label, value, icon: Icon }) => (
                        <div key={label} className="flex items-center gap-3 px-4 py-3">
                          <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wide">{label}</p>
                            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20">
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <p className="text-[12px] text-amber-700 dark:text-amber-300">
                      Review all details before submitting. Once uploaded, student fee records will be created in the system.
                    </p>
                  </div>
                </div>
              )}

              {/* ── SUCCESS STATE ── */}
              {uploadSuccess && (
                <div className="flex flex-col items-center justify-center py-10 gap-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-emerald-700 dark:text-emerald-400">Import Successful!</p>
                    <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">Excel data imported to database.</p>
                  </div>
                </div>
              )}

              {/* ── STEP NAV ── */}
              {!uploadSuccess && (
                <div className="flex items-center justify-between mt-6 pt-5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={step === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[13px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />Back
                  </button>

                  <div className="flex items-center gap-1.5">
                    {STEPS.map((_, i) => (
                      <div key={i} className={`rounded-full transition-all duration-300 ${i === step ? 'w-5 h-2 bg-blue-500' : i < step ? 'w-2 h-2 bg-emerald-400' : 'w-2 h-2 bg-slate-200 dark:bg-slate-700'}`} />
                    ))}
                  </div>

                  {step < 2 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95"
                    >
                      Next<ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={uploading}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white text-[13px] font-bold hover:bg-emerald-700 shadow-md shadow-emerald-500/20 disabled:opacity-70 transition-all active:scale-95"
                    >
                      {uploading
                        ? <><Loader2 className="w-4 h-4 animate-spin" />Importing...</>
                        : <><Upload className="w-4 h-4" />Import Now</>
                      }
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── UPLOADED RECORDS SECTION ──────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
              <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Uploaded Records</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {filteredRecords.length} files
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="w-36">
                <NativeSelect value={gridSession} onChange={e => setGridSession(e.target.value)}>
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </NativeSelect>
              </div>
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={gridSearch}
                  onChange={e => setGridSearch(e.target.value)}
                  placeholder="Search..."
                  className="pl-8 pr-7 py-2 text-[12px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20 w-40 placeholder-slate-300 dark:placeholder-slate-600"
                />
                {gridSearch && (
                  <button onClick={() => setGridSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Summary stats */}
          {filteredRecords.length > 0 && (
            <div className="grid grid-cols-3 divide-x divide-slate-100 dark:divide-[rgba(99,102,241,0.1)] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              {[
                { label: 'Total Uploads', value: filteredRecords.length, icon: FileSpreadsheet, color: 'blue' },
                { label: 'Total Students', value: totalStudents, icon: Users, color: 'emerald' },
                { label: 'Failed Records', value: totalFailed, icon: AlertTriangle, color: totalFailed > 0 ? 'rose' : 'emerald' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3">
                  <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0
                    ${color === 'blue' ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                      color === 'emerald' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' :
                      'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'}`}>
                    <Icon className="w-4 h-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[18px] sm:text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate leading-tight">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── DESKTOP TABLE ── */}
          {filteredRecords.length > 0 ? (
            <>
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] bg-slate-50/40 dark:bg-white/[0.01]">
                      {['#', 'Title', 'Month', 'Mode', 'File Type', 'Posted Date', 'Total', 'Failed', 'Actions'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((rec, i) => (
                      <tr key={rec.guid} className="border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] hover:bg-slate-50/60 dark:hover:bg-white/[0.015] transition-colors group">
                        <td className="px-4 py-3 text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap max-w-[160px] truncate" title={rec.title}>{rec.title}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">{rec.month}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${MODE_COLORS[rec.mode] || 'bg-slate-100 text-slate-700'}`}>
                            {rec.mode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${rec.filetype === 'CMS' ? 'bg-violet-100 text-violet-800 dark:bg-violet-500/20 dark:text-violet-300' : 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/20 dark:text-cyan-300'}`}>
                            {rec.filetype}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{rec.postedDate}</td>
                        <td className="px-4 py-3">
                          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">{rec.total}</span>
                        </td>
                        <td className="px-4 py-3">
                          {rec.failed > 0 ? (
                            <button onClick={() => setFailedModal(rec)}
                              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 text-[11px] font-bold hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors">
                              <AlertTriangle className="w-3 h-3" />{rec.failed} Failed
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 className="w-3.5 h-3.5" />All OK
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => setFailedModal(rec.failed > 0 ? rec : null) || (rec.failed === 0 && showToast('No failed records for this upload.', 'info'))}
                              title="View Report"
                              onClick={() => setRecords(prev => prev)} // placeholder for open_window
                              className="p-2 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-500/30 transition-colors"
                              onClick={() => showToast(`Opening report for: ${rec.title}`, 'info')}
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setDeleteModal(rec)}
                              title="Delete"
                              className="p-2 rounded-lg bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-500/30 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ── MOBILE CARDS ── */}
              <div className="md:hidden p-4 space-y-3">
                {filteredRecords.map((rec, i) => (
                  <RecordCard
                    key={rec.guid}
                    rec={rec}
                    idx={i + 1}
                    session={gridSession}
                    onFailed={setFailedModal}
                    onDelete={setDeleteModal}
                    onView={r => showToast(`Opening report: ${r.title}`, 'info')}
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/40 dark:bg-white/[0.01]">
                <p className="text-[12px] text-slate-400">
                  Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{filteredRecords.length}</span> uploads for session <span className="font-semibold text-slate-600 dark:text-slate-300">{gridSession}</span>
                </p>
                {gridSearch && (
                  <button onClick={() => setGridSearch('')} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" />Clear search
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 gap-4 text-center px-4">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <FileSpreadsheet className="w-7 h-7 text-slate-400 dark:text-slate-500" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400">No records found</p>
                <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
                  {gridSearch
                    ? 'No uploads match your search. Try a different keyword.'
                    : `No fee imports found for session ${gridSession}. Upload an Excel file above.`}
                </p>
              </div>
              {gridSearch ? (
                <button onClick={() => setGridSearch('')}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[13px] font-semibold hover:bg-slate-200 dark:hover:bg-slate-700">
                  Clear Search
                </button>
              ) : (
                <button onClick={() => setFormOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-[13px] font-semibold hover:bg-blue-700 shadow-md shadow-blue-500/20">
                  <UploadCloud className="w-4 h-4" />Upload Excel File
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── MODALS ────────────────────────────────────────────────────────────── */}
      {failedModal && (
        <FailedStudentsModal record={failedModal} onClose={() => setFailedModal(null)} />
      )}
      {deleteModal && (
        <DeleteConfirmModal
          record={deleteModal}
          onConfirm={handleDelete}
          onClose={() => setDeleteModal(null)}
        />
      )}

      {/* ── TOAST ───────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
