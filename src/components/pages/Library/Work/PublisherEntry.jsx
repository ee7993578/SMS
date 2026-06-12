/**
 * PublisherEntry.jsx
 * Folder: src/pages/Library/PublisherEntry.jsx
 *
 * Converts legacy ASPX "Publisher Entry" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Code + Publisher Category fields
 *  - Publisher Personal Details form (Name, Phone1, Phone2, Mobile, Address, State, City, Zip, Fax, Email, Remark)
 *  - Client-side validation (required fields highlighted)
 *  - Submit / Reset actions
 *  - Data grid with Delete + Edit actions
 *  - Mobile: stacked card layout with drawer-style form
 *  - Desktop: ERP-style dense table + inline form
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BookOpen, Building2, Phone, Smartphone, MapPin, Mail,
  FileText, Hash, Tag, Globe, Printer, AlignLeft,
  Plus, RotateCcw, Search, Trash2, Pencil, X, Check,
  AlertCircle, ChevronDown, Loader2, SlidersHorizontal,
  ChevronRight, Info, Users, Eye, EyeOff, Save,
  ArrowLeft, Filter
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const PUBLISHER_CATEGORIES = [
  { id: '1', name: 'Academic' },
  { id: '2', name: 'Children' },
  { id: '3', name: 'Fiction' },
  { id: '4', name: 'Non-Fiction' },
  { id: '5', name: 'Reference' },
  { id: '6', name: 'Scientific' },
  { id: '7', name: 'Technical' },
]

const STATES = [
  { id: '1', name: 'Uttar Pradesh' },
  { id: '2', name: 'Delhi' },
  { id: '3', name: 'Maharashtra' },
  { id: '4', name: 'Rajasthan' },
  { id: '5', name: 'Uttarakhand' },
  { id: '6', name: 'Gujarat' },
  { id: '7', name: 'Karnataka' },
]

const CITIES_BY_STATE = {
  '1': ['Lucknow', 'Agra', 'Varanasi', 'Kanpur', 'Noida', 'Ghaziabad'],
  '2': ['New Delhi', 'Dwarka', 'Rohini', 'Janakpuri'],
  '3': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad'],
  '4': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer'],
  '5': ['Dehradun', 'Haridwar', 'Rishikesh', 'Nainital'],
  '6': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
  '7': ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru'],
}

const INITIAL_PUBLISHERS = [
  { id: 1, code: 'PUB001', name: 'Oxford University Press', category: 'Academic', phone1: '011-23456789', mobile: '9876543210', city: 'New Delhi', state: 'Delhi' },
  { id: 2, code: 'PUB002', name: 'Penguin Books India', category: 'Fiction', phone1: '022-34567890', mobile: '9865432109', city: 'Mumbai', state: 'Maharashtra' },
  { id: 3, code: 'PUB003', name: 'S. Chand Publishing', category: 'Reference', phone1: '011-45678901', mobile: '9854321098', city: 'New Delhi', state: 'Delhi' },
  { id: 4, code: 'PUB004', name: 'Macmillan Publishers', category: 'Academic', phone1: '080-56789012', mobile: '9843210987', city: 'Bengaluru', state: 'Karnataka' },
  { id: 5, code: 'PUB005', name: 'Navneet Publications', category: 'Children', phone1: '022-67890123', mobile: '9832109876', city: 'Mumbai', state: 'Maharashtra' },
]

const EMPTY_FORM = {
  code: '', category: '0', name: '', phone1: '', phone2: '',
  mobile: '', address: '', state: '0', city: '0',
  zip: '', fax: '', email: '', remark: '',
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CAT_COLORS = {
  'Academic':    { fg: '#1d4ed8', bg: '#dbeafe' },
  'Children':    { fg: '#059669', bg: '#d1fae5' },
  'Fiction':     { fg: '#7c3aed', bg: '#ede9fe' },
  'Non-Fiction': { fg: '#d97706', bg: '#fef3c7' },
  'Reference':   { fg: '#0891b2', bg: '#cffafe' },
  'Scientific':  { fg: '#dc2626', bg: '#fee2e2' },
  'Technical':   { fg: '#0369a1', bg: '#e0f2fe' },
}

const catColor = (cat) => CAT_COLORS[cat] || { fg: '#475569', bg: '#f1f5f9' }

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

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
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      >
        {placeholder && <option value="0">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, icon: Icon, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
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

function TextInput({ value, onChange, placeholder, error, maxLength, type = 'text', multiline, className = '' }) {
  const base = `w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
    bg-white text-slate-800 placeholder-slate-300
    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
    dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
    dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
    ${error ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
    ${className}`

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={3}
        className={base + ' resize-none'}
        style={{ textTransform: 'uppercase' }}
      />
    )
  }
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      className={base}
      style={type !== 'email' ? { textTransform: 'uppercase' } : {}}
    />
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
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SECTION HEADER ──────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, accent = 'blue' }) {
  const accents = {
    blue:    'bg-blue-500',
    emerald: 'bg-emerald-500',
    violet:  'bg-violet-500',
  }
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
      <span className={`w-1 h-5 rounded-full ${accents[accent]} flex-shrink-0`} />
      <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
      <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{title}</span>
    </div>
  )
}

// ─── PUBLISHER GRID ROW ───────────────────────────────────────────────────────
function DesktopRow({ pub, idx, onEdit, onDelete }) {
  const { fg, bg } = catColor(pub.category)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg font-mono">
          {pub.code}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: bg, color: fg }}>
            {pub.name.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{pub.name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold" style={{ background: bg, color: fg }}>
          {pub.category}
        </span>
      </td>
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400">{pub.phone1}</td>
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400">{pub.mobile}</td>
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400">{pub.city}, {pub.state}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(pub)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-500/10 dark:hover:bg-blue-500/20 transition-colors"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => onDelete(pub.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:text-rose-400 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE PUBLISHER CARD ────────────────────────────────────────────────────
function MobileCard({ pub, idx, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = catColor(pub.category)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold" style={{ background: bg, color: fg }}>
          {pub.name.slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{pub.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">{pub.code}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: bg, color: fg }}>
              {pub.category}
            </span>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3">
          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Phone, label: 'Phone', val: pub.phone1 },
              { icon: Smartphone, label: 'Mobile', val: pub.mobile },
              { icon: MapPin, label: 'City', val: pub.city },
              { icon: Globe, label: 'State', val: pub.state },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="flex items-start gap-2 min-w-0">
                <Icon className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
                  <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">{val || '—'}</p>
                </div>
              </div>
            ))}
          </div>
          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(pub)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => onDelete(pub.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────
function DeleteModal({ onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[360px] rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-slate-800 dark:text-slate-100">Delete Publisher?</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">This action cannot be undone. The publisher record will be permanently removed.</p>
          </div>
          <div className="flex gap-3 w-full">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PublisherEntry() {
  const [form,        setForm]        = useState({ ...EMPTY_FORM })
  const [publishers,  setPublishers]  = useState(INITIAL_PUBLISHERS)
  const [errors,      setErrors]      = useState({})
  const [loading,     setLoading]     = useState(false)
  const [toast,       setToast]       = useState(null)
  const [editId,      setEditId]      = useState(null)
  const [deleteId,    setDeleteId]    = useState(null)
  const [search,      setSearch]      = useState('')
  const [mobileForm,  setMobileForm]  = useState(false) // mobile: show form panel

  // Cities derived from selected state
  const cities = useMemo(() => CITIES_BY_STATE[form.state] || [], [form.state])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Form field update ──────────────────────────────────────────────────────
  const set = (field) => (e) => {
    const val = e.target.value
    setForm(p => ({
      ...p,
      [field]: val,
      // Reset city when state changes
      ...(field === 'state' ? { city: '0' } : {}),
    }))
    setErrors(p => ({ ...p, [field]: undefined }))
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!form.code.trim())         err.code     = 'Code is required'
    if (form.category === '0')     err.category = 'Select a category'
    if (!form.name.trim())         err.name     = 'Name is required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = () => {
    if (!validate()) return
    setLoading(true)

    setTimeout(() => {
      if (editId !== null) {
        // Update existing
        const stateName = STATES.find(s => s.id === form.state)?.name || ''
        const catName   = PUBLISHER_CATEGORIES.find(c => c.id === form.category)?.name || ''
        setPublishers(p => p.map(pub => pub.id === editId
          ? { ...pub, code: form.code.toUpperCase(), name: form.name.toUpperCase(), category: catName, phone1: form.phone1, mobile: form.mobile, city: form.city, state: stateName }
          : pub
        ))
        showToast('Publisher updated successfully.')
        setEditId(null)
      } else {
        // Add new
        const stateName = STATES.find(s => s.id === form.state)?.name || ''
        const catName   = PUBLISHER_CATEGORIES.find(c => c.id === form.category)?.name || ''
        const newPub = {
          id:       Date.now(),
          code:     form.code.toUpperCase(),
          name:     form.name.toUpperCase(),
          category: catName,
          phone1:   form.phone1,
          mobile:   form.mobile,
          city:     form.city,
          state:    stateName,
        }
        setPublishers(p => [newPub, ...p])
        showToast('Publisher added successfully.')
      }
      setForm({ ...EMPTY_FORM })
      setLoading(false)
      setMobileForm(false)
    }, 600)
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm({ ...EMPTY_FORM })
    setErrors({})
    setEditId(null)
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = (pub) => {
    const stateId = STATES.find(s => s.name === pub.state)?.id || '0'
    const catId   = PUBLISHER_CATEGORIES.find(c => c.name === pub.category)?.id || '0'
    setForm({
      ...EMPTY_FORM,
      code:     pub.code,
      category: catId,
      name:     pub.name,
      phone1:   pub.phone1,
      mobile:   pub.mobile,
      state:    stateId,
      city:     pub.city,
    })
    setEditId(pub.id)
    setErrors({})
    // On mobile, open form panel
    setMobileForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = () => {
    setPublishers(p => p.filter(pub => pub.id !== deleteId))
    setDeleteId(null)
    showToast('Publisher deleted.', 'error')
  }

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return publishers
    const q = search.toLowerCase()
    return publishers.filter(p =>
      p.code.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.city || '').toLowerCase().includes(q)
    )
  }, [publishers, search])

  // ─── FORM PANEL (shared between desktop left panel + mobile drawer) ─────────
  const FormPanel = ({ compact = false }) => (
    <div className="space-y-4">
      {/* Basic Info */}
      <div className={`rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden`}>
        <SectionHeader icon={Hash} title="Publisher Info" accent="blue" />
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Code" required icon={Hash} error={errors.code}>
            <TextInput
              value={form.code}
              onChange={set('code')}
              placeholder="e.g. PUB006"
              error={errors.code}
              maxLength={20}
            />
          </Field>
          <Field label="Publisher Category" required icon={Tag} error={errors.category}>
            <NativeSelect value={form.category} onChange={set('category')} placeholder="-- Select Category --" error={errors.category}>
              {PUBLISHER_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>
        </div>
      </div>

      {/* Personal Detail */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <SectionHeader icon={Building2} title="Publisher Personal Detail" accent="blue" />
        <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="sm:col-span-2">
            <Field label="Name" required icon={Building2} error={errors.name}>
              <TextInput value={form.name} onChange={set('name')} placeholder="Publisher name" error={errors.name} />
            </Field>
          </div>

          <Field label="Phone 1" icon={Phone}>
            <TextInput value={form.phone1} onChange={set('phone1')} placeholder="e.g. 011-23456789" maxLength={12} />
          </Field>
          <Field label="Phone 2" icon={Phone}>
            <TextInput value={form.phone2} onChange={set('phone2')} placeholder="e.g. 011-23456790" maxLength={12} />
          </Field>
          <Field label="Mobile" icon={Smartphone}>
            <TextInput value={form.mobile} onChange={set('mobile')} placeholder="e.g. 9876543210" maxLength={12} />
          </Field>
          <Field label="Fax" icon={Printer}>
            <TextInput value={form.fax} onChange={set('fax')} placeholder="e.g. 011-23456791" maxLength={10} />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Address" icon={MapPin}>
              <TextInput value={form.address} onChange={set('address')} placeholder="Street address" multiline />
            </Field>
          </div>

          <Field label="State" icon={Globe}>
            <NativeSelect value={form.state} onChange={set('state')} placeholder="-- Select State --">
              {STATES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="City" icon={MapPin}>
            <NativeSelect value={form.city} onChange={set('city')} placeholder="-- Select City --" disabled={form.state === '0'}>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Zip" icon={Hash}>
            <TextInput value={form.zip} onChange={set('zip')} placeholder="e.g. 110001" maxLength={6} />
          </Field>
          <Field label="Email" icon={Mail}>
            <TextInput value={form.email} onChange={set('email')} placeholder="publisher@example.com" type="email" />
          </Field>

          <div className="sm:col-span-2">
            <Field label="Remark" icon={AlignLeft}>
              <TextInput value={form.remark} onChange={set('remark')} placeholder="Any additional notes" multiline />
            </Field>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              disabled:opacity-70 transition-all active:scale-95"
          >
            {loading
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : editId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />
            }
            {editId ? 'Update Publisher' : 'Add Publisher'}
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          {editId && (
            <span className="flex items-center gap-1.5 text-[12px] text-amber-600 dark:text-amber-400 font-semibold ml-1">
              <Pencil className="w-3 h-3" /> Editing record
            </span>
          )}
        </div>
      </div>
    </div>
  )

  // ─── MOBILE FORM SLIDE PANEL ──────────────────────────────────────────────
  const MobileFormPanel = () => (
    <>
      <div className="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm" onClick={() => { setMobileForm(false); handleReset() }} />
      <div
        className="fixed inset-x-0 bottom-0 z-40 rounded-t-3xl bg-slate-50 dark:bg-[#111827] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-y-auto"
        style={{ maxHeight: '92vh', animation: 'drawerUp .3s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>
        {/* Panel header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">
              {editId ? 'Edit Publisher' : 'Add Publisher'}
            </span>
          </div>
          <button
            onClick={() => { setMobileForm(false); handleReset() }}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <FormPanel compact />
        </div>
      </div>
    </>
  )

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400 flex-shrink-0" />
            Publisher Entry
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage library publisher records — add, edit, and remove publishers.
          </p>
        </div>

        {/* Mobile: FAB to open form */}
        <button
          type="button"
          onClick={() => { handleReset(); setMobileForm(true) }}
          className="sm:hidden flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white
            bg-blue-600 shadow-md shadow-blue-500/20 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {/* ── DESKTOP LAYOUT: Left form | Right table ──────────────────────── */}
      <div className="hidden sm:flex gap-5 items-start">
        {/* Form – left column */}
        <div className="w-full max-w-[420px] flex-shrink-0 space-y-4">
          <FormPanel />
        </div>

        {/* Table – right column */}
        <div className="flex-1 min-w-0">
          <PublisherTable
            filtered={filtered}
            total={publishers.length}
            search={search}
            setSearch={setSearch}
            onEdit={handleEdit}
            onDelete={setDeleteId}
            desktop
          />
        </div>
      </div>

      {/* ── MOBILE LAYOUT: Table only; form in drawer ─────────────────── */}
      <div className="sm:hidden">
        <PublisherTable
          filtered={filtered}
          total={publishers.length}
          search={search}
          setSearch={setSearch}
          onEdit={handleEdit}
          onDelete={setDeleteId}
        />
      </div>

      {/* Mobile Form Drawer */}
      {mobileForm && <MobileFormPanel />}

      {/* Delete Confirmation */}
      {deleteId && (
        <DeleteModal
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── PUBLISHER TABLE COMPONENT ────────────────────────────────────────────────
function PublisherTable({ filtered, total, search, setSearch, onEdit, onDelete, desktop }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

      {/* Card header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Publishers</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
            {filtered.length} of {total}
          </span>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-56 flex-shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search publisher…"
            className="w-full pl-8 pr-7 py-2 text-[12px] rounded-xl border outline-none transition-all
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

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden sm:block overflow-x-auto">
        {filtered.length === 0 ? (
          <EmptyState search={search} />
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                {['S.No.', 'Code', 'Publisher Name', 'Category', 'Phone', 'Mobile', 'Location', 'Actions'].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((pub, i) => (
                <DesktopRow key={pub.id} pub={pub} idx={i + 1} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="sm:hidden p-4 space-y-3">
        {filtered.length === 0
          ? <EmptyState search={search} />
          : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to view details and actions.
              </p>
              {filtered.map((pub, i) => (
                <MobileCard key={pub.id} pub={pub} idx={i + 1} onEdit={onEdit} onDelete={onDelete} />
              ))}
            </>
          )
        }
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
        <p className="text-[12px] text-slate-400 dark:text-slate-500">
          Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
          <span className="font-semibold text-slate-700 dark:text-slate-300">{total}</span> publishers
        </p>
        {search && (
          <button onClick={() => setSearch('')} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <X className="w-3 h-3" /> Clear search
          </button>
        )}
      </div>
    </div>
  )
}

function EmptyState({ search }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Search className="w-6 h-6 opacity-40" />
      </div>
      <p className="text-[13px] font-semibold text-slate-500 dark:text-slate-400">
        {search ? 'No publishers match your search.' : 'No publishers found.'}
      </p>
    </div>
  )
}
