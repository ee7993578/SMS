/**
 * FeeCertificate.jsx
 * Folder: src/pages/Certificates/FeeCertificate.jsx
 *
 * Full React + Tailwind conversion of FeeCertificate.aspx
 * Features:
 *  - Session / Class / Student / Fee Head (multi-select) / Report Type / Date filters
 *  - Admission number autocomplete search
 *  - Get Certificate + Export + Print actions
 *  - Report preview panel (ReportViewer placeholder)
 *  - Mobile: drawer-based filters, touch-friendly layout
 *  - Desktop: compact ERP-style filter bar
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, ChevronDown, X, Check, AlertCircle, Loader2,
  SlidersHorizontal, RefreshCw, Eye, FileDown, Printer,
  GraduationCap, BookOpen, Users, Calendar, FileText,
  ChevronRight, Filter, User, Phone, School, Hash,
  CheckSquare, Square, Layers, ClipboardList
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  { id: '1',  label: 'Nursery'   },
  { id: '2',  label: 'LKG'       },
  { id: '3',  label: 'UKG'       },
  { id: '4',  label: 'Class I'   },
  { id: '5',  label: 'Class II'  },
  { id: '6',  label: 'Class III' },
  { id: '7',  label: 'Class IV'  },
  { id: '8',  label: 'Class V'   },
  { id: '9',  label: 'Class VI'  },
  { id: '10', label: 'Class VII' },
  { id: '11', label: 'Class VIII'},
  { id: '12', label: 'Class IX'  },
  { id: '13', label: 'Class X'   },
  { id: '14', label: 'Class XI'  },
  { id: '15', label: 'Class XII' },
]

const STUDENTS_BY_CLASS = {
  '4':  [{ id: 's1', label: 'Rahul Sharma (ADM001)'   }, { id: 's2', label: 'Priya Verma (ADM002)'    }],
  '5':  [{ id: 's3', label: 'Amit Kumar (ADM003)'     }, { id: 's4', label: 'Sneha Singh (ADM004)'    }],
  '9':  [{ id: 's5', label: 'Ravi Gupta (ADM005)'     }, { id: 's6', label: 'Neha Joshi (ADM006)'     }],
  '12': [{ id: 's7', label: 'Vikram Yadav (ADM007)'   }, { id: 's8', label: 'Pooja Mishra (ADM008)'   }],
  '14': [{ id: 's9', label: 'Suresh Patel (ADM009)'   }, { id: 's10',label: 'Anjali Tiwari (ADM010)'  }],
}

const FEE_HEADS = [
  { id: 'f1',  label: 'Tuition Fee'        },
  { id: 'f2',  label: 'Annual Charges'     },
  { id: 'f3',  label: 'Development Fund'   },
  { id: 'f4',  label: 'Library Fee'        },
  { id: 'f5',  label: 'Sports Fee'         },
  { id: 'f6',  label: 'Transport Fee'      },
  { id: 'f7',  label: 'Examination Fee'    },
  { id: 'f8',  label: 'Computer Fee'       },
  { id: 'f9',  label: 'Admission Fee'      },
  { id: 'f10', label: 'Miscellaneous'      },
]

const REPORT_TYPES = [
  { value: 'Multiple',  label: 'Multiple Fee Report'   },
  { value: 'Composite', label: 'Composite Fee Report'  },
]

// Autocomplete student search suggestions
const STUDENT_SUGGESTIONS = [
  { RegistrationNo: 'ADM001', Name: 'Rahul Sharma',   Class: 'Class I - A',   FatherName: 'Sunil Sharma',   PhoneNo: '9876543210', ImageUrl: '' },
  { RegistrationNo: 'ADM002', Name: 'Priya Verma',    Class: 'Class I - B',   FatherName: 'Ramesh Verma',   PhoneNo: '9876543211', ImageUrl: '' },
  { RegistrationNo: 'ADM003', Name: 'Amit Kumar',     Class: 'Class II - A',  FatherName: 'Vikas Kumar',    PhoneNo: '9876543212', ImageUrl: '' },
  { RegistrationNo: 'ADM004', Name: 'Sneha Singh',    Class: 'Class II - B',  FatherName: 'Rakesh Singh',   PhoneNo: '9876543213', ImageUrl: '' },
  { RegistrationNo: 'ADM005', Name: 'Ravi Gupta',     Class: 'Class VI - A',  FatherName: 'Dinesh Gupta',   PhoneNo: '9876543214', ImageUrl: '' },
  { RegistrationNo: 'ADM006', Name: 'Neha Joshi',     Class: 'Class VI - A',  FatherName: 'Ashok Joshi',    PhoneNo: '9876543215', ImageUrl: '' },
  { RegistrationNo: 'ADM007', Name: 'Vikram Yadav',   Class: 'Class IX - A',  FatherName: 'Pramod Yadav',   PhoneNo: '9876543216', ImageUrl: '' },
  { RegistrationNo: 'ADM008', Name: 'Pooja Mishra',   Class: 'Class IX - B',  FatherName: 'Santosh Mishra', PhoneNo: '9876543217', ImageUrl: '' },
  { RegistrationNo: 'ADM009', Name: 'Suresh Patel',   Class: 'Class XI - A',  FatherName: 'Mahesh Patel',   PhoneNo: '9876543218', ImageUrl: '' },
  { RegistrationNo: 'ADM010', Name: 'Anjali Tiwari',  Class: 'Class XI - B',  FatherName: 'Rajesh Tiwari',  PhoneNo: '9876543219', ImageUrl: '' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function AvatarCircle({ name, size = 36 }) {
  const colors = ['#3B82F6','#8B5CF6','#06B6D4','#10B981','#F59E0B','#EF4444']
  const color = colors[(name?.charCodeAt(0) ?? 0) % colors.length]
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: color + '22', border: `2px solid ${color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <span style={{ fontSize: size * 0.35, fontWeight: 700, color }}>{getInitials(name)}</span>
    </div>
  )
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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

function Select({ value, onChange, children, placeholder, error, disabled }) {
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
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function TextInput({ value, onChange, placeholder, error, disabled, readOnly, suffix }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className={`w-full pl-3 ${suffix ? 'pr-10' : 'pr-3'} py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
          disabled:opacity-50 read-only:bg-slate-50 dark:read-only:bg-slate-900
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      />
      {suffix && <div className="absolute right-2.5 top-1/2 -translate-y-1/2">{suffix}</div>}
    </div>
  )
}

// ─── MULTI-SELECT DROPDOWN ────────────────────────────────────────────────────

function MultiSelectDropdown({ options, selected, onChange, placeholder, error }) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  // Close on outside click
  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = useMemo(() =>
    options.filter(o => o.label.toLowerCase().includes(search.toLowerCase())),
    [options, search]
  )

  const allSelected = options.every(o => selected.includes(o.id))

  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter(s => s !== id))
    else onChange([...selected, id])
  }

  const toggleAll = () => {
    if (allSelected) onChange([])
    else onChange(options.map(o => o.id))
  }

  const displayText = selected.length === 0
    ? placeholder
    : selected.length === options.length
      ? 'All Fee Heads'
      : selected.length === 1
        ? options.find(o => o.id === selected[0])?.label
        : `${selected.length} selected`

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between pl-3 pr-2.5 py-2 text-[13px] rounded-lg border outline-none transition-all text-left
          bg-white dark:bg-[#1e2238] cursor-pointer
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        <span className={selected.length === 0 ? 'text-slate-300 dark:text-slate-600' : 'text-slate-800 dark:text-slate-200'}>
          {displayText}
        </span>
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
          {selected.length > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              {selected.length}
            </span>
          )}
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] shadow-xl overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <input
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search fee heads…"
                className="w-full pl-7 pr-3 py-1.5 text-[12px] rounded-lg bg-slate-50 dark:bg-[#171c30] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] outline-none text-slate-700 dark:text-slate-300 placeholder-slate-400"
              />
            </div>
          </div>

          {/* Select All */}
          <button
            type="button"
            onClick={toggleAll}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-[12px] font-semibold text-blue-600 dark:text-indigo-400 hover:bg-blue-50 dark:hover:bg-indigo-500/10 transition-colors border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]"
          >
            {allSelected
              ? <CheckSquare className="w-3.5 h-3.5 flex-shrink-0" />
              : <Square className="w-3.5 h-3.5 flex-shrink-0" />}
            {allSelected ? 'Deselect All' : 'Select All'}
          </button>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-[12px] text-slate-400 py-4">No results</p>
            ) : (
              filtered.map(opt => {
                const isSelected = selected.includes(opt.id)
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggle(opt.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-left transition-colors
                      ${isSelected
                        ? 'bg-blue-50 dark:bg-indigo-500/10 text-blue-700 dark:text-indigo-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.03]'}`}
                  >
                    <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all
                      ${isSelected ? 'bg-blue-500 border-blue-500 dark:bg-indigo-500 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
                      {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    {opt.label}
                  </button>
                )
              })
            )}
          </div>

          {/* Footer */}
          {selected.length > 0 && (
            <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{selected.length} selected</span>
              <button
                type="button"
                onClick={() => { onChange([]); setOpen(false) }}
                className="text-[11px] text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── DATE PICKER INPUT ────────────────────────────────────────────────────────

function DateInput({ value, onChange, error }) {
  return (
    <div className="relative">
      <input
        type="date"
        value={value}
        onChange={onChange}
        className={`w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      />
    </div>
  )
}

// ─── AUTOCOMPLETE SEARCH ──────────────────────────────────────────────────────

function AdmissionSearch({ value, onChange, onSelect, session }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleChange = (e) => {
    const val = e.target.value
    onChange(val)
    clearTimeout(timerRef.current)
    if (val.length < 1) { setSuggestions([]); setOpen(false); return }
    setLoading(true)
    timerRef.current = setTimeout(() => {
      // Simulate API call: filter STUDENT_SUGGESTIONS
      const results = STUDENT_SUGGESTIONS.filter(s =>
        s.RegistrationNo.toLowerCase().includes(val.toLowerCase()) ||
        s.Name.toLowerCase().includes(val.toLowerCase())
      )
      setSuggestions(results)
      setOpen(results.length > 0)
      setLoading(false)
    }, 300)
  }

  const handleSelect = (item) => {
    onChange(item.RegistrationNo)
    setOpen(false)
    onSelect(item)
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={handleChange}
          placeholder="Search by Adm No or Name…"
          autoComplete="off"
          className="w-full pl-8 pr-8 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none transition-all
            bg-white text-slate-800 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400"
        />
        {loading && <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 animate-spin" />}
        {!loading && value && (
          <button onClick={() => { onChange(''); setSuggestions([]); setOpen(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] shadow-2xl overflow-hidden max-h-72 overflow-y-auto">
          {suggestions.map(item => (
            <button
              key={item.RegistrationNo}
              type="button"
              onClick={() => handleSelect(item)}
              className="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-blue-50 dark:hover:bg-indigo-500/10 transition-colors border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] last:border-0"
            >
              <AvatarCircle name={item.Name} size={36} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{item.Name}</span>
                  <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300">{item.RegistrationNo}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <School className="w-3 h-3" />{item.Class}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <User className="w-3 h-3" />{item.FatherName}
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <Phone className="w-3 h-3" />{item.PhoneNo}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3
      rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw] animate-slide-up
      ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}.animate-slide-up{animation:slideUp .25s ease}`}</style>
    </div>
  )
}

// ─── REPORT VIEWER PLACEHOLDER ────────────────────────────────────────────────

function ReportViewer({ data, reportType, loading }) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        <p className="text-[13px] text-slate-500 dark:text-slate-400">Generating certificate…</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <FileText className="w-7 h-7 opacity-40" />
        </div>
        <div className="text-center">
          <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No certificate generated yet</p>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
            Fill filters and click <strong>Get Certificate</strong> to preview.
          </p>
        </div>
      </div>
    )
  }

  // Certificate preview
  return (
    <div className="p-4 sm:p-6">
      <div className="max-w-2xl mx-auto rounded-2xl border-2 border-blue-200 dark:border-indigo-500/30 bg-white dark:bg-[#1a1f35] overflow-hidden shadow-lg">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5 text-center">
          <h2 className="text-[18px] font-extrabold text-white tracking-wide">FEE CERTIFICATE</h2>
          <p className="text-[12px] text-blue-100 mt-0.5">{data.schoolName}</p>
        </div>

        {/* Meta */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Certificate Date', value: data.date },
              { label: 'Session',          value: data.session },
              { label: 'Class',            value: data.classLabel },
              { label: 'Report Type',      value: data.reportType },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</span>
                <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Student info */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex items-center gap-4">
          <AvatarCircle name={data.studentName} size={48} />
          <div>
            <p className="text-[16px] font-bold text-slate-800 dark:text-slate-100">{data.studentName}</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">{data.admNo} · {data.className}</p>
          </div>
        </div>

        {/* Fee details */}
        <div className="px-6 py-4">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">Fee Details</p>
          <div className="rounded-xl overflow-hidden border border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/[0.03]">
                  <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fee Head</th>
                  <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount (₹)</th>
                </tr>
              </thead>
              <tbody>
                {data.feeHeads.map((fh, i) => (
                  <tr key={i} className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
                    <td className="px-4 py-2.5 text-[13px] text-slate-700 dark:text-slate-300">{fh.label}</td>
                    <td className="px-4 py-2.5 text-right text-[13px] font-semibold text-slate-800 dark:text-slate-200 tabular-nums">
                      {fh.amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07]">
                  <td className="px-4 py-3 text-[13px] font-bold text-blue-700 dark:text-blue-300">Total Amount</td>
                  <td className="px-4 py-3 text-right text-[14px] font-extrabold text-blue-700 dark:text-blue-300 tabular-nums">
                    ₹ {data.feeHeads.reduce((s, f) => s + f.amount, 0).toLocaleString('en-IN')}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between">
          <p className="text-[11px] text-slate-400">This is a computer-generated certificate.</p>
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center gap-1">
            <Check className="w-3 h-3" /> Verified
          </span>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilter, students, onGetCert, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Fields */}
        <div className="px-5 py-4 space-y-4">
          <Field label="Session" required error={errors.session}>
            <Select value={filters.session} onChange={e => setFilter('session', e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </Field>

          <Field label="Search Student">
            <AdmissionSearch
              value={filters.admNo}
              onChange={v => setFilter('admNo', v)}
              onSelect={item => {
                setFilter('admNo', item.RegistrationNo)
                setFilter('selectedStudent', item)
              }}
              session={filters.session}
            />
          </Field>

          <Field label="Select Class" required error={errors.classId}>
            <Select value={filters.classId} onChange={e => { setFilter('classId', e.target.value); setFilter('studentId', '') }} placeholder="-- Select Class --" error={errors.classId}>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </Select>
          </Field>

          <Field label="Select Student">
            <Select value={filters.studentId} onChange={e => setFilter('studentId', e.target.value)} placeholder="-- Select Student --" disabled={!filters.classId}>
              {(STUDENTS_BY_CLASS[filters.classId] || []).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </Select>
          </Field>

          <Field label="Select Fee Head" required error={errors.feeHeads}>
            <MultiSelectDropdown
              options={FEE_HEADS}
              selected={filters.feeHeads}
              onChange={v => setFilter('feeHeads', v)}
              placeholder="Select Fee Heads…"
              error={errors.feeHeads}
            />
          </Field>

          <Field label="Report Type">
            <Select value={filters.reportType} onChange={e => setFilter('reportType', e.target.value)}>
              {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </Select>
          </Field>

          <Field label="Enter Date">
            <DateInput value={filters.date} onChange={e => setFilter('date', e.target.value)} />
          </Field>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 pb-safe">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onGetCert(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all shadow-md shadow-blue-500/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Get Certificate
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function FeeCertificate() {
  const [filters, setFilters] = useState({
    session:         '',
    admNo:           '',
    selectedStudent: null,
    classId:         '',
    studentId:       '',
    feeHeads:        [],
    reportType:      'Multiple',
    date:            new Date().toISOString().slice(0, 10),
  })

  const [reportData,  setReportData]  = useState(null)
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [printing,    setPrinting]    = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [showPrint,   setShowPrint]   = useState(false)

  const setFilter = useCallback((key, val) => {
    setFilters(p => ({ ...p, [key]: val }))
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }))
  }, [errors])

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!filters.session)          err.session  = 'Please select a session'
    if (!filters.classId)          err.classId  = 'Please select a class'
    if (filters.feeHeads.length === 0) err.feeHeads = 'Select at least one fee head'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Get Certificate ────────────────────────────────────────────────────────
  const handleGetCert = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setShowPrint(false)

    // Simulate API call
    setTimeout(() => {
      const classLabel  = CLASSES.find(c => c.id === filters.classId)?.label || ''
      const studentInfo = filters.selectedStudent
        || (filters.studentId
            ? { Name: (STUDENTS_BY_CLASS[filters.classId] || []).find(s => s.id === filters.studentId)?.label?.split(' (')[0] || 'Student', RegistrationNo: filters.admNo || 'N/A', Class: classLabel }
            : { Name: 'Sample Student', RegistrationNo: 'ADM001', Class: classLabel })

      const selectedHeads = FEE_HEADS.filter(f => filters.feeHeads.includes(f.id))
      const feeAmounts    = selectedHeads.map(fh => ({ ...fh, amount: Math.floor(Math.random() * 4000) + 500 }))

      setReportData({
        schoolName:  'Saraswati Vidya Mandir Senior Secondary School',
        session:     filters.session,
        classLabel,
        reportType:  REPORT_TYPES.find(r => r.value === filters.reportType)?.label || '',
        studentName: studentInfo.Name,
        admNo:       studentInfo.RegistrationNo,
        className:   studentInfo.Class,
        date:        filters.date
          ? new Date(filters.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
          : new Date().toLocaleDateString('en-IN'),
        feeHeads:    feeAmounts,
      })

      setLoading(false)
      setShowPrint(true)
      showToast('Fee certificate generated successfully.')
    }, 900)
  }, [filters])

  // ── Export ─────────────────────────────────────────────────────────────────
  const handleExport = () => {
    if (!reportData) { showToast('Generate a certificate first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Certificate exported to Excel. (API integration pending)', 'info')
    }, 1200)
  }

  // ── Print ──────────────────────────────────────────────────────────────────
  const handlePrint = () => {
    if (!reportData) { showToast('Generate a certificate first.', 'error'); return }
    setPrinting(true)
    setTimeout(() => {
      setPrinting(false)
      window.print()
      showToast('Print dialog opened.')
    }, 400)
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFilters({ session: '', admNo: '', selectedStudent: null, classId: '', studentId: '', feeHeads: [], reportType: 'Multiple', date: new Date().toISOString().slice(0, 10) })
    setReportData(null)
    setErrors({})
    setShowPrint(false)
  }

  const activeFilterCount = [filters.session, filters.classId, filters.feeHeads.length > 0].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Fee Certificate
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Generate and print fee certificates for students.
          </p>
        </div>

        {/* Desktop action buttons */}
        {showPrint && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Export
            </button>
            <button onClick={handlePrint} disabled={printing}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-700 text-white hover:bg-slate-800 shadow-md transition-all disabled:opacity-70">
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
              Print
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Fee Certificate Filters</span>
        </div>

        <div className="p-5">
          {/* Row 1 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <Field label="Session" required error={errors.session}>
              <Select value={filters.session} onChange={e => setFilter('session', e.target.value)} placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </Field>

            <Field label="Search Student">
              <AdmissionSearch
                value={filters.admNo}
                onChange={v => setFilter('admNo', v)}
                onSelect={item => { setFilter('admNo', item.RegistrationNo); setFilter('selectedStudent', item) }}
                session={filters.session}
              />
            </Field>

            <Field label="Select Class" required error={errors.classId}>
              <Select value={filters.classId} onChange={e => { setFilter('classId', e.target.value); setFilter('studentId', '') }} placeholder="-- Select Class --" error={errors.classId}>
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
              </Select>
            </Field>

            <Field label="Select Student">
              <Select value={filters.studentId} onChange={e => setFilter('studentId', e.target.value)} placeholder="-- Select Student --" disabled={!filters.classId}>
                {(STUDENTS_BY_CLASS[filters.classId] || []).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </Select>
            </Field>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Select Fee Head" required error={errors.feeHeads}>
              <MultiSelectDropdown
                options={FEE_HEADS}
                selected={filters.feeHeads}
                onChange={v => setFilter('feeHeads', v)}
                placeholder="Select Fee Heads…"
                error={errors.feeHeads}
              />
            </Field>

            <Field label="Report Type">
              <Select value={filters.reportType} onChange={e => setFilter('reportType', e.target.value)}>
                {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Select>
            </Field>

            <Field label="Enter Date">
              <DateInput value={filters.date} onChange={e => setFilter('date', e.target.value)} />
            </Field>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={handleGetCert} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Get
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset filters">
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
          {activeFilterCount > 0 ? `${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} set` : 'Set Filters'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {showPrint && (
          <>
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
            </button>
            <button onClick={handlePrint} disabled={printing}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-700 text-white disabled:opacity-70">
              {printing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4" />}
            </button>
            <button onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* Mobile drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        onGetCert={handleGetCert}
        loading={loading}
        errors={errors}
      />

      {/* ── Selected Student Preview (when searched by adm no) ───────────── */}
      {filters.selectedStudent && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/[0.07] px-4 py-3 flex items-center gap-3">
          <AvatarCircle name={filters.selectedStudent.Name} size={40} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{filters.selectedStudent.Name}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{filters.selectedStudent.RegistrationNo}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{filters.selectedStudent.Class}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{filters.selectedStudent.FatherName}</span>
            </div>
          </div>
          <button onClick={() => { setFilter('admNo', ''); setFilter('selectedStudent', null) }}
            className="p-1.5 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Report Viewer Card ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Certificate Preview</span>
          {reportData && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Ready
            </span>
          )}
        </div>

        <ReportViewer data={reportData} loading={loading} />
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
