/**
 * ChangeAdmNo.jsx
 * Folder: src/pages/Student/Work/ChangeAdmNo.jsx
 * Dependencies: lucide-react (already in project)
 */

import { useState, useMemo } from 'react'
import {
  ChevronDown, Search, Hash, CheckSquare, Square,
  AlertCircle, Save, RefreshCw, X, Loader2,
  Check, Eye, Edit3, Calendar
} from 'lucide-react'

// ─── STATIC DATA (replace with API) ─────────────────────────────────────────
const SESSIONS = ['2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const STATIC_STUDENTS = {
  'Nursery': [
    { uid: 1, stu_id: 'STU001', name: 'Aarav Sharma',      registration_no: '2024/NUR/001', registration_date: '10 Apr 2024', admission_date: '15 Apr 2024' },
    { uid: 2, stu_id: 'STU002', name: 'Ananya Singh',       registration_no: '2024/NUR/002', registration_date: '11 Apr 2024', admission_date: '16 Apr 2024' },
    { uid: 3, stu_id: 'STU003', name: 'Arjun Verma',        registration_no: '2024/NUR/003', registration_date: '12 Apr 2024', admission_date: '17 Apr 2024' },
    { uid: 4, stu_id: 'STU004', name: 'Diya Gupta',         registration_no: '2024/NUR/004', registration_date: '12 Apr 2024', admission_date: '17 Apr 2024' },
    { uid: 5, stu_id: 'STU005', name: 'Ishaan Tiwari',      registration_no: '2024/NUR/005', registration_date: '13 Apr 2024', admission_date: '18 Apr 2024' },
  ],
  'LKG': [
    { uid: 6,  stu_id: 'STU006', name: 'Kavya Yadav',       registration_no: '2024/LKG/001', registration_date: '10 Apr 2024', admission_date: '15 Apr 2024' },
    { uid: 7,  stu_id: 'STU007', name: 'Mohit Rastogi',     registration_no: '2024/LKG/002', registration_date: '10 Apr 2024', admission_date: '15 Apr 2024' },
    { uid: 8,  stu_id: 'STU008', name: 'Neha Agarwal',      registration_no: '2024/LKG/003', registration_date: '11 Apr 2024', admission_date: '16 Apr 2024' },
  ],
  'UKG': [
    { uid: 9,  stu_id: 'STU009', name: 'Priya Mishra',      registration_no: '2024/UKG/001', registration_date: '10 Apr 2024', admission_date: '15 Apr 2024' },
    { uid: 10, stu_id: 'STU010', name: 'Rahul Joshi',       registration_no: '2024/UKG/002', registration_date: '11 Apr 2024', admission_date: '16 Apr 2024' },
    { uid: 11, stu_id: 'STU011', name: 'Rohan Dubey',       registration_no: '2024/UKG/003', registration_date: '11 Apr 2024', admission_date: '16 Apr 2024' },
    { uid: 12, stu_id: 'STU012', name: 'Sneha Pandey',      registration_no: '2024/UKG/004', registration_date: '12 Apr 2024', admission_date: '17 Apr 2024' },
  ],
  'Class I': [
    { uid: 13, stu_id: 'STU013', name: 'Tanvi Srivastava',  registration_no: '2024/I/001',   registration_date: '08 Apr 2024', admission_date: '12 Apr 2024' },
    { uid: 14, stu_id: 'STU014', name: 'Vikas Chauhan',     registration_no: '2024/I/002',   registration_date: '08 Apr 2024', admission_date: '12 Apr 2024' },
    { uid: 15, stu_id: 'STU015', name: 'Yash Kumar',        registration_no: '2024/I/003',   registration_date: '09 Apr 2024', admission_date: '13 Apr 2024' },
    { uid: 16, stu_id: 'STU016', name: 'Zara Khan',         registration_no: '2024/I/004',   registration_date: '09 Apr 2024', admission_date: '13 Apr 2024' },
    { uid: 17, stu_id: 'STU017', name: 'Aditya Tripathi',   registration_no: '2024/I/005',   registration_date: '10 Apr 2024', admission_date: '14 Apr 2024' },
    { uid: 18, stu_id: 'STU018', name: 'Bhavna Singh',      registration_no: '2024/I/006',   registration_date: '10 Apr 2024', admission_date: '14 Apr 2024' },
  ],
  'Class V': [
    { uid: 19, stu_id: 'STU019', name: 'Chetan Sharma',     registration_no: '2024/V/001',   registration_date: '05 Apr 2024', admission_date: '10 Apr 2024' },
    { uid: 20, stu_id: 'STU020', name: 'Deepika Verma',     registration_no: '2024/V/002',   registration_date: '05 Apr 2024', admission_date: '10 Apr 2024' },
    { uid: 21, stu_id: 'STU021', name: 'Gaurav Mishra',     registration_no: '2024/V/003',   registration_date: '06 Apr 2024', admission_date: '11 Apr 2024' },
  ],
  'Class X': [
    { uid: 22, stu_id: 'STU022', name: 'Harshita Gupta',    registration_no: '2024/X/001',   registration_date: '01 Apr 2024', admission_date: '05 Apr 2024' },
    { uid: 23, stu_id: 'STU023', name: 'Himanshu Yadav',    registration_no: '2024/X/002',   registration_date: '01 Apr 2024', admission_date: '05 Apr 2024' },
    { uid: 24, stu_id: 'STU024', name: 'Jyoti Tiwari',      registration_no: '2024/X/003',   registration_date: '02 Apr 2024', admission_date: '06 Apr 2024' },
    { uid: 25, stu_id: 'STU025', name: 'Kiran Agarwal',     registration_no: '2024/X/004',   registration_date: '02 Apr 2024', admission_date: '06 Apr 2024' },
    { uid: 26, stu_id: 'STU026', name: 'Lalit Rastogi',     registration_no: '2024/X/005',   registration_date: '03 Apr 2024', admission_date: '07 Apr 2024' },
  ],
}

const generateStudents = (cls) => {
  const names = ['Amit Sharma','Priti Singh','Rohit Verma','Sunita Gupta','Rajesh Tiwari','Pooja Yadav','Vikram Agarwal','Kavita Mishra']
  const short  = cls.replace(/\s/g,'').replace('Class','').toUpperCase().slice(0,4)
  return names.slice(0, 4 + (cls.length % 3)).map((name, i) => ({
    uid:               100 + i,
    stu_id:            `STU${short}${String(i+1).padStart(2,'0')}`,
    name,
    registration_no:   `2024/${short}/${String(i+1).padStart(3,'0')}`,
    registration_date: `${String((i%28)+1).padStart(2,'0')} Apr 2024`,
    admission_date:    `${String((i%28)+5).padStart(2,'0')} Apr 2024`,
  }))
}

const fetchStudents = (cls) =>
  STATIC_STUDENTS[cls] ? [...STATIC_STUDENTS[cls]] : generateStudents(cls)

// ─── AVATAR COLOR ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ['#1d4ed8','#dbeafe'],['#7c3aed','#ede9fe'],['#0891b2','#cffafe'],
  ['#059669','#d1fae5'],['#d97706','#fef3c7'],['#dc2626','#fee2e2'],
]
const avatarColor = (name) => AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

// ─── SMALL UI COMPONENTS ──────────────────────────────────────────────────────
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
            ? 'border-rose-400 dark:border-rose-500'
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

function Field({ label, error, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
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

// ─── INLINE DATE INPUT ────────────────────────────────────────────────────────
function DateInput({ value, onChange, disabled }) {
  return (
    <div className="relative">
      <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder="dd MMM yyyy"
        className={`w-full pl-7 pr-2 py-1.5 text-[12px] rounded-lg border outline-none transition-all
          border-slate-200 bg-white text-slate-700
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-50 dark:bg-slate-800/50' : ''}`}
      />
    </div>
  )
}

// ─── INLINE ADM NO INPUT ──────────────────────────────────────────────────────
function AdmInput({ value, onChange, disabled, changed }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full pl-3 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all font-mono
          focus:ring-2
          ${disabled
            ? 'border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed dark:border-[rgba(99,102,241,0.15)] dark:bg-slate-800/50 dark:text-slate-500'
            : changed
              ? 'border-amber-400 bg-amber-50 text-amber-800 focus:border-amber-500 focus:ring-amber-100 dark:border-amber-500/50 dark:bg-amber-500/10 dark:text-amber-300 dark:focus:ring-amber-500/20'
              : 'border-blue-300 bg-blue-50 text-blue-800 focus:border-blue-400 focus:ring-blue-100 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-200 dark:focus:ring-indigo-500/20'
          }`}
      />
      {changed && !disabled && (
        <span className="absolute right-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-amber-500" />
      )}
    </div>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
  const styles = type === 'success'
    ? 'bg-emerald-600 text-white'
    : 'bg-rose-600 text-white'
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw] ${styles}`}
      style={{ animation: 'slideUp 0.25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />
      }
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-70 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function ChangeAdmNo() {
  const [session,      setSession]      = useState('')
  const [cls,          setCls]          = useState('')
  const [loading,      setLoading]      = useState(false)
  const [saving,       setSaving]       = useState(false)
  const [rows,         setRows]         = useState([])        // working copy
  const [checkedIds,   setCheckedIds]   = useState([])        // checked row uids
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── fetch ─────────────────────────────────────────────────────────────────
  const handleShow = () => {
    const err = {}
    if (!session) err.session = 'Required'
    if (!cls)     err.cls     = 'Required'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setCheckedIds([])
    setSearch('')
    setTimeout(() => {
      const data = fetchStudents(cls)
      setRows(data.map(r => ({ ...r, _origAdm: r.registration_no })))
      setLoading(false)
    }, 600)
  }

  const handleReset = () => {
    setSession(''); setCls('')
    setRows([]); setCheckedIds([])
    setSearch(''); setErrors({})
  }

  // ── row field changes ─────────────────────────────────────────────────────
  const updateRow = (uid, field, val) =>
    setRows(p => p.map(r => r.uid === uid ? { ...r, [field]: val } : r))

  const toggleCheck = (uid) => {
    const row = rows.find(r => r.uid === uid)
    if (!row) return
    setCheckedIds(p =>
      p.includes(uid) ? p.filter(x => x !== uid) : [...p, uid]
    )
    // Enable/disable fields based on check
    updateRow(uid, '_enabled', !checkedIds.includes(uid))
  }

  const isEnabled = (uid) => checkedIds.includes(uid)

  // ── filtered rows ─────────────────────────────────────────────────────────
  const filtered = useMemo(() =>
    rows.filter(r =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.registration_no.toLowerCase().includes(search.toLowerCase()) ||
      r.stu_id.toLowerCase().includes(search.toLowerCase())
    )
  , [rows, search])

  const allChecked  = filtered.length > 0 && filtered.every(r => checkedIds.includes(r.uid))
  const someChecked = filtered.some(r => checkedIds.includes(r.uid))
  const changedCount = rows.filter(r => checkedIds.includes(r.uid) && r.registration_no !== r._origAdm).length

  const toggleAll = () => {
    const ids = filtered.map(r => r.uid)
    if (allChecked) setCheckedIds(p => p.filter(id => !ids.includes(id)))
    else            setCheckedIds(p => [...new Set([...p, ...ids])])
  }

  // ── save ──────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (checkedIds.length === 0) {
      showToast('Check at least one student to save.', 'error'); return
    }
    // Validate: checked rows must have non-empty adm no
    const empty = rows.filter(r => checkedIds.includes(r.uid) && !r.registration_no.trim())
    if (empty.length > 0) {
      showToast(`Admission No. cannot be empty (${empty.map(r=>r.name).join(', ')})`, 'error'); return
    }
    setSaving(true)
    // Simulate API save
    setTimeout(() => {
      setRows(p => p.map(r => ({ ...r, _origAdm: r.registration_no })))
      setCheckedIds([])
      setSaving(false)
      showToast(`${checkedIds.length} record${checkedIds.length > 1 ? 's' : ''} saved successfully.`)
    }, 800)
  }

  // ── desktop table row ─────────────────────────────────────────────────────
  const DesktopRow = ({ r, idx }) => {
    const enabled = isEnabled(r.uid)
    const changed = enabled && r.registration_no !== r._origAdm
    const [fg, bg] = avatarColor(r.name)
    return (
      <tr className={`transition-colors border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]
        ${enabled
          ? 'bg-blue-50/40 dark:bg-blue-500/[0.05]'
          : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
        }`}>
        {/* Checkbox */}
        <td className="px-4 py-3 w-10">
          <button type="button" onClick={() => toggleCheck(r.uid)}
            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all flex-shrink-0
              ${enabled ? 'bg-blue-500 border-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
            {enabled && (
              <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
                <polyline points="1.5,5 4,7.5 8.5,2" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
        </td>
        {/* S.No */}
        <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-500 w-12 tabular-nums">{idx + 1}</td>
        {/* Name */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
              style={{ background: bg, color: fg }}>
              {r.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
            </span>
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{r.name}</span>
          </div>
        </td>
        {/* Reg Date */}
        <td className="px-4 py-3 w-40">
          <DateInput
            value={r.registration_date}
            onChange={e => updateRow(r.uid, 'registration_date', e.target.value)}
            disabled={!enabled}
          />
        </td>
        {/* Adm Date */}
        <td className="px-4 py-3 w-40">
          <DateInput
            value={r.admission_date}
            onChange={e => updateRow(r.uid, 'admission_date', e.target.value)}
            disabled={!enabled}
          />
        </td>
        {/* Adm No */}
        <td className="px-4 py-3 w-44">
          <AdmInput
            value={r.registration_no}
            onChange={e => updateRow(r.uid, 'registration_no', e.target.value)}
            disabled={!enabled}
            changed={changed}
          />
          {changed && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium truncate">
              Was: {r._origAdm}
            </p>
          )}
        </td>
      </tr>
    )
  }

  // ── mobile card row ───────────────────────────────────────────────────────
  const MobileCard = ({ r, idx }) => {
    const enabled = isEnabled(r.uid)
    const changed = enabled && r.registration_no !== r._origAdm
    const [fg, bg] = avatarColor(r.name)
    return (
      <div className={`rounded-xl border transition-all p-4 space-y-3
        ${enabled
          ? 'border-blue-300 bg-blue-50/60 dark:border-indigo-500/40 dark:bg-indigo-500/[0.07] shadow-sm'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'
        }`}>
        {/* Card top row: checkbox + avatar + name + sno */}
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => toggleCheck(r.uid)}
            className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all
              ${enabled ? 'bg-blue-500 border-blue-500' : 'border-slate-300 dark:border-slate-600'}`}>
            {enabled && (
              <svg viewBox="0 0 10 10" className="w-3 h-3">
                <polyline points="1.5,5 4,7.5 8.5,2" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <span className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[12px] font-bold"
            style={{ background: bg, color: fg }}>
            {r.name.split(' ').map(n=>n[0]).join('').slice(0,2).toUpperCase()}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{r.name}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">#{idx + 1} · {r.stu_id}</p>
          </div>
          {enabled && (
            <span className="flex-shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              <Edit3 className="w-2.5 h-2.5" /> Editing
            </span>
          )}
        </div>

        {/* Fields — only shown when enabled */}
        {enabled && (
          <div className="grid grid-cols-1 gap-2.5 pt-1 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Registration Date</p>
              <DateInput
                value={r.registration_date}
                onChange={e => updateRow(r.uid, 'registration_date', e.target.value)}
                disabled={false}
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Admission Date</p>
              <DateInput
                value={r.admission_date}
                onChange={e => updateRow(r.uid, 'admission_date', e.target.value)}
                disabled={false}
              />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">
                Admission No.
                {changed && <span className="ml-1 text-amber-500">● Changed</span>}
              </p>
              <AdmInput
                value={r.registration_no}
                onChange={e => updateRow(r.uid, 'registration_no', e.target.value)}
                disabled={false}
                changed={changed}
              />
              {changed && (
                <p className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5 font-medium">
                  Original: {r._origAdm}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Collapsed preview */}
        {!enabled && (
          <div className="flex items-center gap-4 pt-1 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Adm No.</p>
              <p className="text-[12px] font-mono font-semibold text-slate-700 dark:text-slate-200">{r.registration_no}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Reg. Date</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">{r.registration_date}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Adm. Date</p>
              <p className="text-[11px] text-slate-600 dark:text-slate-300">{r.admission_date}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-8 page-animate">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">
          Change Admission No.
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Select session &amp; class → check students → edit admission number → save.
        </p>
      </div>

      {/* ── Filter Card ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Hash className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Filter</span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Session" error={errors.session}>
              <NativeSelect value={session} onChange={e => { setSession(e.target.value); setErrors(p=>({...p,session:undefined})) }} placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class" error={errors.cls}>
              <NativeSelect value={cls} onChange={e => { setCls(e.target.value); setErrors(p=>({...p,cls:undefined})) }} placeholder="-- Select Class --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <div className="sm:col-span-2 lg:col-span-2 flex flex-col sm:flex-row gap-2 items-end">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95 disabled:opacity-70
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700"
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
                  : <><Eye className="w-4 h-4" /> Show Students</>
                }
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold transition-colors
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <RefreshCw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Results Card ─────────────────────────────────────────────────── */}
      {rows.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 truncate">{cls}</span>
              <span className="text-[13px] text-slate-400">·</span>
              <span className="text-[13px] text-slate-500 dark:text-slate-400">{session}</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 flex-shrink-0">
                {rows.length} students
              </span>
              {checkedIds.length > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {checkedIds.length} selected
                </span>
              )}
              {changedCount > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 flex-shrink-0">
                  {changedCount} changed
                </span>
              )}
            </div>

            {/* Search */}
            <div className="relative sm:w-56 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name / adm no…"
                className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600 dark:focus:border-indigo-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Hint banner */}
          <div className="px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] bg-blue-50/40 dark:bg-blue-500/[0.04]">
            <p className="text-[12px] text-blue-700 dark:text-blue-400 font-medium flex items-center gap-1.5">
              <Edit3 className="w-3.5 h-3.5 flex-shrink-0" />
              Check a student to enable editing. Uncheck to lock fields back.
            </p>
          </div>

          {/* Select All */}
          <div className="px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] bg-slate-50/30 dark:bg-white/[0.01]">
            <button type="button" onClick={toggleAll}
              className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-slate-100 transition-colors">
              {allChecked
                ? <CheckSquare className="w-4 h-4 text-blue-500 dark:text-indigo-400" />
                : someChecked
                  ? <Square className="w-4 h-4 text-blue-400/60" />
                  : <Square className="w-4 h-4 text-slate-400" />
              }
              {allChecked ? 'Deselect All' : 'Select All'}
              <span className="text-slate-400 font-normal">({filtered.length})</span>
            </button>
          </div>

          {/* ── DESKTOP TABLE (md+) ── */}
          <div className="hidden md:block overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-[13px] text-slate-400 dark:text-slate-600">
                No students match your search.
              </div>
            ) : (
              <table className="w-full min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['','S.No','Student Name','Reg. Date','Adm. Date','Admission No.'].map((h,i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, idx) => <DesktopRow key={r.uid} r={r} idx={idx} />)}
                </tbody>
              </table>
            )}
          </div>

          {/* ── MOBILE CARDS (< md) ── */}
          <div className="md:hidden p-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="flex items-center justify-center h-20 text-[13px] text-slate-400 dark:text-slate-600">
                No students match your search.
              </div>
            ) : filtered.map((r, idx) => <MobileCard key={r.uid} r={r} idx={idx} />)}
          </div>

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500 text-center sm:text-left">
              {checkedIds.length > 0
                ? <><span className="font-semibold text-slate-600 dark:text-slate-300">{checkedIds.length}</span> student{checkedIds.length>1?'s':''} selected · {changedCount} adm no. changed</>
                : 'Check students to enable editing'
              }
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || checkedIds.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20"
            >
              {saving
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                : <><Save className="w-4 h-4" /> Save Changes</>
              }
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
