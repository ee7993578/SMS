/**
 * ItemEntryMaster.jsx
 * Library → Item Entry Master
 *
 * Converts legacy ASPX "Item Entry Master" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Manual / Automatic accession mode toggle
 *  - All form fields: Title, Sub Title, Accession No, Total Books Count,
 *    Entry Date, Serial No, Vol/Part, Item Category, Frequency Code,
 *    Item Type, Publication Date, Publisher Name, Author, Keyword,
 *    ISBN No, Price, Lost Paid, Item Language, Remark, Supplier Name
 *  - Client-side validation (required fields highlighted)
 *  - Submit → saves to local list (API placeholder)
 *  - Edit / Delete on records
 *  - Search across Accession No, Category, Author, Publisher, Language, Frequency, Title
 *  - Mobile: drawer filter + card list
 *  - Desktop: dense ERP table
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  BookOpen, BookMarked, Search, X, Check, AlertCircle,
  Loader2, Edit2, Trash2, Plus, RefreshCw, ChevronDown,
  ChevronRight, SlidersHorizontal, Filter, Save,
  Library, Tag, Hash, Calendar, User, Globe,
  DollarSign, FileText, BarChart3, Layers,
  Building2, Info, Eye, TrendingUp, Package,
  AlignLeft, ShieldCheck
} from 'lucide-react'

// ─── STATIC DROPDOWN DATA ─────────────────────────────────────────────────────
const ITEM_CATEGORIES = [
  { value: '1', label: 'Book' },
  { value: '2', label: 'Magazine' },
  { value: '3', label: 'Journal' },
  { value: '4', label: 'Newspaper' },
  { value: '5', label: 'Reference' },
  { value: '6', label: 'Thesis' },
  { value: '7', label: 'Report' },
]

const FREQ_CODES = [
  { value: '1', label: 'Daily' },
  { value: '2', label: 'Weekly' },
  { value: '3', label: 'Monthly' },
  { value: '4', label: 'Quarterly' },
  { value: '5', label: 'Half Yearly' },
  { value: '6', label: 'Yearly' },
  { value: '7', label: 'One Time' },
]

const ITEM_TYPES = [
  { value: '1', label: 'Print' },
  { value: '2', label: 'Digital' },
  { value: '3', label: 'Audio-Visual' },
  { value: '4', label: 'Map/Atlas' },
  { value: '5', label: 'Microfilm' },
]

const PUBLISHERS = [
  { value: '1', label: 'Oxford University Press' },
  { value: '2', label: 'Penguin Books' },
  { value: '3', label: 'McGraw-Hill' },
  { value: '4', label: 'Macmillan' },
  { value: '5', label: 'Wiley' },
  { value: '6', label: 'Springer' },
  { value: '7', label: 'Pearson' },
]

const LANGUAGES = [
  { value: '1', label: 'English' },
  { value: '2', label: 'Hindi' },
  { value: '3', label: 'Sanskrit' },
  { value: '4', label: 'Urdu' },
  { value: '5', label: 'Bengali' },
  { value: '6', label: 'Tamil' },
  { value: '7', label: 'Other' },
]

const SUPPLIERS = [
  { value: '1', label: 'Book World Suppliers' },
  { value: '2', label: 'National Book Depot' },
  { value: '3', label: 'India Book House' },
  { value: '4', label: 'Premier Book Services' },
]

// ─── INITIAL DUMMY RECORDS ─────────────────────────────────────────────────────
const INITIAL_RECORDS = [
  {
    id: 1,
    acc_no: 'LIB-001',
    title: 'Introduction to Algorithms',
    subtitle: 'Third Edition',
    item_cat: '1', item_cat_label: 'Book',
    freq_code: '7', freq_label: 'One Time',
    item_type: '1', item_type_label: 'Print',
    pub_date: '15 Jan 2021',
    pub_name: '1', pub_label: 'Oxford University Press',
    author: 'Thomas H. Cormen',
    keyword: 'Algorithm, Data Structure',
    isbn: '978-0-262-03384-8',
    price: '1250',
    lost_paid: '1800',
    lang: '1', lang_label: 'English',
    serial: 'S001',
    vol: '1',
    total_books: '5',
    entry_date: '01 Jan 2024',
    mode: 'Manual',
    remark: '',
    supplier: '',
  },
  {
    id: 2,
    acc_no: 'LIB-002',
    title: 'Physics Concepts',
    subtitle: 'Advanced Level',
    item_cat: '1', item_cat_label: 'Book',
    freq_code: '7', freq_label: 'One Time',
    item_type: '1', item_type_label: 'Print',
    pub_date: '10 Mar 2020',
    pub_name: '7', pub_label: 'Pearson',
    author: 'H.C. Verma',
    keyword: 'Physics, Science',
    isbn: '978-81-208-0466-0',
    price: '650',
    lost_paid: '900',
    lang: '2', lang_label: 'Hindi',
    serial: 'S002',
    vol: '2',
    total_books: '10',
    entry_date: '05 Feb 2024',
    mode: 'Automatic',
    remark: 'Good condition',
    supplier: '2',
  },
  {
    id: 3,
    acc_no: 'LIB-003',
    title: 'Science Today',
    subtitle: 'Monthly Edition',
    item_cat: '2', item_cat_label: 'Magazine',
    freq_code: '3', freq_label: 'Monthly',
    item_type: '1', item_type_label: 'Print',
    pub_date: '01 Apr 2024',
    pub_name: '4', pub_label: 'Macmillan',
    author: 'Editorial Board',
    keyword: 'Science, Technology',
    isbn: '',
    price: '120',
    lost_paid: '200',
    lang: '1', lang_label: 'English',
    serial: 'MAG-001',
    vol: '',
    total_books: '12',
    entry_date: '10 Apr 2024',
    mode: 'Manual',
    remark: 'Subscription renewed',
    supplier: '1',
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getLabelFromList = (list, value) => list.find(i => i.value === value)?.label || ''

const CAT_COLORS = {
  '1': { bg: '#dbeafe', fg: '#1d4ed8' },
  '2': { bg: '#fce7f3', fg: '#be185d' },
  '3': { bg: '#d1fae5', fg: '#065f46' },
  '4': { bg: '#fef3c7', fg: '#92400e' },
  '5': { bg: '#ede9fe', fg: '#5b21b6' },
  '6': { bg: '#cffafe', fg: '#0e7490' },
  '7': { bg: '#fee2e2', fg: '#991b1b' },
}

const nextAccNo = (records) => {
  const nums = records.map(r => parseInt(r.acc_no.replace('LIB-', '')) || 0)
  const max = nums.length ? Math.max(...nums) : 0
  return `LIB-${String(max + 1).padStart(3, '0')}`
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────
function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
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

function Field({ label, error, required, children, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {Icon && <Icon className="w-3 h-3" />}
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

function TextInput({ value, onChange, placeholder, error, maxLength, type = 'text' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
    />
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
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

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <BookOpen className="w-7 h-7 opacity-40" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
          {search ? 'No records match your search' : 'No items added yet'}
        </p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
          {search ? 'Try different keywords.' : 'Fill the form above and click Submit.'}
        </p>
      </div>
    </div>
  )
}

// ─── MOBILE RECORD CARD ───────────────────────────────────────────────────────
function MobileRecordCard({ record, onEdit, onDelete, idx }) {
  const [expanded, setExpanded] = useState(false)
  const col = CAT_COLORS[record.item_cat] || { bg: '#f1f5f9', fg: '#475569' }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Serial */}
        <span className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 flex-shrink-0">
          {idx}
        </span>

        {/* Cat badge */}
        <span
          className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
          style={{ background: col.bg, color: col.fg }}
        >
          {record.item_cat_label.slice(0, 3).toUpperCase()}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {record.title}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {record.acc_no} · {record.author}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: col.bg, color: col.fg }}
          >
            {record.item_cat_label}
          </span>
          <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
            {[
              ['Accession No', record.acc_no],
              ['Language', record.lang_label],
              ['Publisher', record.pub_label],
              ['Frequency', record.freq_label],
              ['Price', `₹${record.price}`],
              ['Lost Paid', `₹${record.lost_paid}`],
              ['ISBN', record.isbn || '—'],
              ['Entry Date', record.entry_date],
            ].map(([label, val]) => (
              <div key={label} className="min-w-0">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
                <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">{val}</p>
              </div>
            ))}
          </div>

          {record.keyword && (
            <div className="mb-3">
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Keywords</p>
              <p className="text-[12px] text-slate-600 dark:text-slate-300">{record.keyword}</p>
            </div>
          )}

          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => onEdit(record)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold
                bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              type="button"
              onClick={() => onDelete(record.id)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold
                bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ record, idx, onEdit, onDelete }) {
  const col = CAT_COLORS[record.item_cat] || { bg: '#f1f5f9', fg: '#475569' }
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-3 py-3 text-center text-[11px] text-slate-400 w-10 tabular-nums">{idx}</td>
      <td className="px-3 py-3 text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{record.acc_no}</td>
      <td className="px-3 py-3">
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full" style={{ background: col.bg, color: col.fg }}>
          {record.item_cat_label}
        </span>
      </td>
      <td className="px-3 py-3">
        <p className="text-[12px] font-semibold text-slate-800 dark:text-slate-100 max-w-[160px] truncate">{record.title}</p>
        {record.subtitle && <p className="text-[10px] text-slate-400 truncate max-w-[160px]">{record.subtitle}</p>}
      </td>
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 max-w-[120px] truncate">{record.author}</td>
      <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap max-w-[120px] truncate">{record.pub_label}</td>
      <td className="px-3 py-3 text-center">
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-400">
          {record.lang_label}
        </span>
      </td>
      <td className="px-3 py-3 text-center text-[11px] text-slate-500 dark:text-slate-400">{record.freq_label}</td>
      <td className="px-3 py-3 text-center text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">₹{record.price}</td>
      <td className="px-3 py-3 text-center text-[12px] font-semibold text-amber-700 dark:text-amber-400 tabular-nums">₹{record.lost_paid}</td>
      <td className="px-3 py-3 text-[11px] text-slate-500 dark:text-slate-400 max-w-[100px] truncate">{record.keyword || '—'}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={() => onEdit(record)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors whitespace-nowrap"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          <button
            type="button"
            onClick={() => onDelete(record.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
              bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── CONFIRM DELETE MODAL ─────────────────────────────────────────────────────
function DeleteModal({ open, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-6 max-w-sm w-full"
          style={{ animation: 'fadeIn .2s ease' }}>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="flex flex-col items-center text-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
            </div>
            <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-100">Delete Record?</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">This action cannot be undone. The item will be permanently removed.</p>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const EMPTY_FORM = {
  mode: 'Manual',
  title: '', subtitle: '', acc_no: '', total_books: '',
  entry_date: '', serial: '', vol: '',
  item_cat: '', freq_code: '', item_type: '',
  pub_date: '', pub_name: '', author: '', keyword: '',
  isbn: '', price: '', lost_paid: '',
  lang: '', remark: '', supplier: '',
}

export default function ItemEntryMaster() {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [records, setRecords] = useState(INITIAL_RECORDS)
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)
  const [search, setSearch] = useState('')
  const [searchFields, setSearchFields] = useState({
    acc: '', cat: '', author: '', pub: '', lang: '', freq: '', title: ''
  })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formCollapsed, setFormCollapsed] = useState(false)

  const formRef = useRef(null)

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  // ── Field updater ─────────────────────────────────────────────────────────
  const setField = useCallback((key, val) => {
    setForm(p => ({ ...p, [key]: val }))
    if (errors[key]) setErrors(p => ({ ...p, [key]: undefined }))
    // Auto-fill accession no in automatic mode
    if (key === 'mode' && val === 'Automatic') {
      setForm(p => ({ ...p, mode: val, acc_no: nextAccNo(records) }))
    }
  }, [errors, records])

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!form.title.trim())      err.title      = 'Title is required'
    if (!form.entry_date.trim()) err.entry_date = 'Entry date is required'
    if (!form.author.trim())     err.author     = 'Author is required'
    if (!form.price.trim())      err.price      = 'Price is required'
    if (!form.lost_paid.trim())  err.lost_paid  = 'Lost paid amount is required'
    if (!form.item_cat)          err.item_cat   = 'Select item category'
    if (!form.pub_name)          err.pub_name   = 'Select publisher'
    if (!form.lang)              err.lang       = 'Select language'
    if (!form.freq_code)         err.freq_code  = 'Select frequency code'
    if (!form.item_type)         err.item_type  = 'Select item type'
    return err
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    const err = validate()
    if (Object.keys(err).length) {
      setErrors(err)
      showToast('Please fill all required fields.', 'error')
      // Scroll to form on mobile
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      if (formCollapsed) setFormCollapsed(false)
      return
    }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const newRecord = {
        ...form,
        id: editingId || Date.now(),
        item_cat_label: getLabelFromList(ITEM_CATEGORIES, form.item_cat),
        freq_label: getLabelFromList(FREQ_CODES, form.freq_code),
        item_type_label: getLabelFromList(ITEM_TYPES, form.item_type),
        pub_label: getLabelFromList(PUBLISHERS, form.pub_name),
        lang_label: getLabelFromList(LANGUAGES, form.lang),
        acc_no: form.acc_no || nextAccNo(records),
      }

      if (editingId) {
        setRecords(r => r.map(rec => rec.id === editingId ? newRecord : rec))
        showToast('Record updated successfully!')
        setEditingId(null)
      } else {
        setRecords(r => [newRecord, ...r])
        showToast('Item added to library!')
      }
      setForm(EMPTY_FORM)
      setLoading(false)
    }, 700)
  }

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = (record) => {
    setForm({
      mode: record.mode || 'Manual',
      title: record.title, subtitle: record.subtitle,
      acc_no: record.acc_no, total_books: record.total_books,
      entry_date: record.entry_date, serial: record.serial,
      vol: record.vol, item_cat: record.item_cat,
      freq_code: record.freq_code, item_type: record.item_type,
      pub_date: record.pub_date, pub_name: record.pub_name,
      author: record.author, keyword: record.keyword,
      isbn: record.isbn, price: record.price,
      lost_paid: record.lost_paid, lang: record.lang,
      remark: record.remark, supplier: record.supplier,
    })
    setEditingId(record.id)
    setErrors({})
    setFormCollapsed(false)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (id) => setDeleteTarget(id)
  const confirmDelete = () => {
    setRecords(r => r.filter(rec => rec.id !== deleteTarget))
    setDeleteTarget(null)
    showToast('Record deleted.', 'error')
  }

  // ── Reset form ────────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm(EMPTY_FORM)
    setEditingId(null)
    setErrors({})
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return records.filter(r => {
      const q = search.toLowerCase()
      const basicMatch = !search || [
        r.acc_no, r.item_cat_label, r.author, r.pub_label,
        r.lang_label, r.freq_label, r.title, r.subtitle, r.keyword
      ].some(f => f?.toLowerCase().includes(q))

      const fieldMatch =
        (!searchFields.acc    || r.acc_no?.toLowerCase().includes(searchFields.acc.toLowerCase())) &&
        (!searchFields.cat    || r.item_cat_label?.toLowerCase().includes(searchFields.cat.toLowerCase())) &&
        (!searchFields.author || r.author?.toLowerCase().includes(searchFields.author.toLowerCase())) &&
        (!searchFields.pub    || r.pub_label?.toLowerCase().includes(searchFields.pub.toLowerCase())) &&
        (!searchFields.lang   || r.lang_label?.toLowerCase().includes(searchFields.lang.toLowerCase())) &&
        (!searchFields.freq   || r.freq_label?.toLowerCase().includes(searchFields.freq.toLowerCase())) &&
        (!searchFields.title  || r.title?.toLowerCase().includes(searchFields.title.toLowerCase()))

      return basicMatch && fieldMatch
    })
  }, [records, search, searchFields])

  const setSF = (key, val) => setSearchFields(p => ({ ...p, [key]: val }))
  const clearSearch = () => {
    setSearch('')
    setSearchFields({ acc: '', cat: '', author: '', pub: '', lang: '', freq: '', title: '' })
  }

  const hasAnySearch = search || Object.values(searchFields).some(Boolean)

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1220] px-3 sm:px-5 py-4 sm:py-6 space-y-5 pb-16">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/25">
            <Library className="w-5 h-5 text-white" />
          </div>
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 mb-0.5">
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span>Library</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Item Entry Master</span>
            </nav>
            <h1 className="text-[18px] sm:text-[20px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              Item Entry Master
            </h1>
          </div>
        </div>

        {/* Stats pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-sm">
            <Package className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{records.length}</span>
            <span className="text-[11px] text-slate-400">items</span>
          </div>
          {/* Mobile form toggle */}
          <button
            type="button"
            onClick={() => setFormCollapsed(p => !p)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white text-[12px] font-semibold shadow-md shadow-blue-500/20"
          >
            {formCollapsed ? <Plus className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {formCollapsed ? 'Add Item' : 'View List'}
          </button>
        </div>
      </div>

      {/* ── ENTRY FORM CARD ───────────────────────────────────────────────── */}
      <div ref={formRef} className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden ${formCollapsed ? 'hidden sm:block' : ''}`}>
        {/* Card Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-gradient-to-r from-slate-50/80 to-white dark:from-white/[0.02] dark:to-transparent">
          <div className="flex items-center gap-2.5">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
              {editingId ? 'Edit Item' : 'Add New Item'}
            </span>
            {editingId && (
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 font-semibold">
                Editing
              </span>
            )}
          </div>
          {editingId && (
            <button type="button" onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          )}
        </div>

        <div className="p-4 sm:p-5 space-y-5">
          {/* ── Row 0: Mode toggle ──────────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Accession Mode:</span>
            <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-[rgba(99,102,241,0.25)]">
              {['Manual', 'Automatic'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setField('mode', m)}
                  className={`px-4 py-1.5 text-[12px] font-semibold transition-all ${
                    form.mode === m
                      ? 'bg-blue-600 text-white dark:bg-indigo-600'
                      : 'bg-white text-slate-600 hover:bg-slate-50 dark:bg-[#1e2238] dark:text-slate-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* ── Row 1 ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Title" required error={errors.title} icon={BookOpen}>
              <TextInput
                value={form.title}
                onChange={e => setField('title', e.target.value)}
                placeholder="Book / Magazine title"
                error={errors.title}
              />
            </Field>

            <Field label="Sub Title" icon={AlignLeft}>
              <TextInput
                value={form.subtitle}
                onChange={e => setField('subtitle', e.target.value)}
                placeholder="Sub title (optional)"
              />
            </Field>

            <Field label="Accession No." icon={Hash}>
              <TextInput
                value={form.acc_no}
                onChange={e => setField('acc_no', e.target.value)}
                placeholder={form.mode === 'Automatic' ? 'Auto-generated' : 'e.g. LIB-001'}
                disabled={form.mode === 'Automatic'}
              />
            </Field>

            <Field label="Total Books Count" icon={Layers}>
              <TextInput
                value={form.total_books}
                onChange={e => setField('total_books', e.target.value.replace(/\D/, ''))}
                placeholder="No. of copies"
              />
            </Field>
          </div>

          {/* ── Row 2 ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Library Entry Date" required error={errors.entry_date} icon={Calendar}>
              <TextInput
                value={form.entry_date}
                onChange={e => setField('entry_date', e.target.value)}
                placeholder="DD Mon YYYY"
                error={errors.entry_date}
              />
            </Field>

            <Field label="Serial No." icon={Hash}>
              <TextInput
                value={form.serial}
                onChange={e => setField('serial', e.target.value)}
                placeholder="e.g. S001"
              />
            </Field>

            <Field label="Vol / Part" icon={Layers}>
              <TextInput
                value={form.vol}
                onChange={e => setField('vol', e.target.value.replace(/\D/, ''))}
                placeholder="Volume number"
              />
            </Field>

            <Field label="Item Category" required error={errors.item_cat} icon={Tag}>
              <NativeSelect
                value={form.item_cat}
                onChange={e => setField('item_cat', e.target.value)}
                placeholder="-- Select Category --"
                error={errors.item_cat}
              >
                {ITEM_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* ── Row 3 ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Item Frequency Code" required error={errors.freq_code} icon={BarChart3}>
              <NativeSelect
                value={form.freq_code}
                onChange={e => setField('freq_code', e.target.value)}
                placeholder="-- Select Frequency --"
                error={errors.freq_code}
              >
                {FREQ_CODES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Item Type" required error={errors.item_type} icon={FileText}>
              <NativeSelect
                value={form.item_type}
                onChange={e => setField('item_type', e.target.value)}
                placeholder="-- Select Type --"
                error={errors.item_type}
              >
                {ITEM_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Publication Date" icon={Calendar}>
              <TextInput
                value={form.pub_date}
                onChange={e => setField('pub_date', e.target.value)}
                placeholder="DD Mon YYYY"
              />
            </Field>

            <Field label="Publisher Name" required error={errors.pub_name} icon={Building2}>
              <NativeSelect
                value={form.pub_name}
                onChange={e => setField('pub_name', e.target.value)}
                placeholder="-- Select Publisher --"
                error={errors.pub_name}
              >
                {PUBLISHERS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* ── Row 4 ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Author Detail" required error={errors.author} icon={User}>
              <TextInput
                value={form.author}
                onChange={e => setField('author', e.target.value)}
                placeholder="Author name(s)"
                error={errors.author}
              />
            </Field>

            <Field label="Keyword" icon={Tag}>
              <TextInput
                value={form.keyword}
                onChange={e => setField('keyword', e.target.value)}
                placeholder="Comma separated keywords"
              />
            </Field>

            <Field label="ISBN No." icon={Hash}>
              <TextInput
                value={form.isbn}
                onChange={e => setField('isbn', e.target.value)}
                placeholder="ISBN number"
              />
            </Field>

            <Field label="Price" required error={errors.price} icon={DollarSign}>
              <TextInput
                value={form.price}
                onChange={e => setField('price', e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="₹ Amount"
                error={errors.price}
              />
            </Field>
          </div>

          {/* ── Row 5 ───────────────────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Lost Paid" required error={errors.lost_paid} icon={ShieldCheck}>
              <TextInput
                value={form.lost_paid}
                onChange={e => setField('lost_paid', e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="₹ Lost paid amount"
                error={errors.lost_paid}
              />
            </Field>

            <Field label="Item Language" required error={errors.lang} icon={Globe}>
              <NativeSelect
                value={form.lang}
                onChange={e => setField('lang', e.target.value)}
                placeholder="-- Select Language --"
                error={errors.lang}
              >
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Supplier Name" icon={Building2}>
              <NativeSelect
                value={form.supplier}
                onChange={e => setField('supplier', e.target.value)}
                placeholder="-- Select Supplier --"
              >
                {SUPPLIERS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </NativeSelect>
            </Field>
          </div>

          {/* ── Remark ──────────────────────────────────────────────────── */}
          <div>
            <Field label="Remark" icon={AlignLeft}>
              <textarea
                value={form.remark}
                onChange={e => setField('remark', e.target.value)}
                placeholder="Any additional notes or remarks…"
                rows={2}
                className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
                  bg-white text-slate-800 placeholder-slate-300 border-slate-200
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                  dark:border-[rgba(99,102,241,0.25)] dark:focus:border-indigo-400"
              />
            </Field>
          </div>

          {/* ── Action Buttons ───────────────────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Update Record' : 'Submit'}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reset
            </button>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 sm:ml-auto flex items-center gap-1">
              <Info className="w-3 h-3 flex-shrink-0" />
              Fields marked <span className="text-rose-500 font-bold mx-0.5">*</span> are required
            </p>
          </div>
        </div>
      </div>

      {/* ── RECORDS SECTION ──────────────────────────────────────────────── */}
      <div className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden ${!formCollapsed ? '' : ''}`}>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5 flex-1 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Library Records</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          {/* Global search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Quick search…"
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

        {/* ── Advanced Search Bar (ASPX-style) ─────────────────────────── */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] bg-blue-50/20 dark:bg-blue-500/[0.02]">
          <div className="flex items-center gap-1.5 mb-2">
            <Filter className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400">Advanced Filters</span>
            {hasAnySearch && (
              <button onClick={clearSearch}
                className="ml-auto flex items-center gap-1 text-[11px] text-rose-500 hover:text-rose-700 font-semibold">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2">
            {[
              { key: 'acc', ph: 'Accession No.' },
              { key: 'cat', ph: 'Item Category' },
              { key: 'author', ph: 'Author' },
              { key: 'pub', ph: 'Publisher' },
              { key: 'lang', ph: 'Language' },
              { key: 'freq', ph: 'Frequency' },
              { key: 'title', ph: 'Title' },
            ].map(({ key, ph }) => (
              <div key={key} className="relative">
                <input
                  value={searchFields[key]}
                  onChange={e => setSF(key, e.target.value)}
                  placeholder={ph}
                  className="w-full px-2.5 py-1.5 text-[11px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-1 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600"
                />
                {searchFields[key] && (
                  <button onClick={() => setSF(key, '')} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── DESKTOP TABLE ──────────────────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState search={hasAnySearch} />
          ) : (
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Acc. No.', 'Category', 'Title', 'Author', 'Publisher', 'Language', 'Frequency', 'Price', 'Lost Paid', 'Keyword', 'Actions'].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((record, i) => (
                  <DesktopRow
                    key={record.id}
                    record={record}
                    idx={i + 1}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ───────────────────────────────────────────────── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState search={hasAnySearch} />
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to expand details &amp; actions.
              </p>
              {filtered.map((record, i) => (
                <MobileRecordCard
                  key={record.id}
                  record={record}
                  idx={i + 1}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span> records
          </p>
          {hasAnySearch && (
            <button onClick={clearSearch}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirm */}
      <DeleteModal
        open={!!deleteTarget}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
