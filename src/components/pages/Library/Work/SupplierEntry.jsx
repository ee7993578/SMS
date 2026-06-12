/**
 * SupplierEntry.jsx
 * Folder: src/pages/Library/SupplierEntry.jsx
 *
 * Converts legacy ASPX "Supplier Entry" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Code + Supplier Category fields (top box)
 *  - Supplier Personal Detail form (Name, Address, State, City, Zip, Remark, Phone1, Phone2, Mobile, Fax, Email)
 *  - GridView → responsive table (desktop) / cards (mobile)
 *  - Edit / Delete per record
 *  - Toast notifications
 *  - Mobile-first: form stacks, drawer-style filter, card list
 *  - Production-ready, no TypeScript
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Building2, Tag, User, MapPin, Phone, Mail, FileText,
  Trash2, Pencil, Plus, RefreshCw, Save, X, Check,
  AlertCircle, ChevronDown, Loader2, Search,
  SlidersHorizontal, ChevronRight, Hash, Smartphone,
  Printer, Globe, BookOpen, Home
} from 'lucide-react'

// ─── STATIC DATA ─────────────────────────────────────────────────────────────

const SUPPLIER_CATEGORIES = [
  'Books Supplier',
  'Stationery Supplier',
  'Digital Resources',
  'Furniture Supplier',
  'IT Equipment',
  'Periodical Supplier',
  'Other',
]

const STATES = {
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Agra', 'Varanasi', 'Ghaziabad', 'Noida', 'Meerut'],
  'Delhi':         ['New Delhi', 'Dwarka', 'Rohini', 'Lajpat Nagar'],
  'Maharashtra':   ['Mumbai', 'Pune', 'Nagpur', 'Nashik'],
  'Rajasthan':     ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota'],
  'Karnataka':     ['Bengaluru', 'Mysuru', 'Hubli', 'Mangaluru'],
  'Gujarat':       ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot'],
}

const INITIAL_SUPPLIERS = [
  {
    supplier_id: 1, code: 'SUP001', category: 'Books Supplier',
    name: 'NATIONAL BOOK DEPOT', address: '12, BOOK MARKET, CONNAUGHT PLACE',
    state: 'Delhi', city: 'New Delhi', zip: '110001',
    phone1: '011-23456789', phone2: '', mobile: '9876543210',
    fax: '011-23456780', email: 'NBD@NATIONALBOOKDEPOT.COM', remark: 'PRIMARY SUPPLIER',
  },
  {
    supplier_id: 2, code: 'SUP002', category: 'Stationery Supplier',
    name: 'SHARMA STATIONERY HOUSE', address: '45, MARKET ROAD, HAZRATGANJ',
    state: 'Uttar Pradesh', city: 'Lucknow', zip: '226001',
    phone1: '0522-3456789', phone2: '0522-3456790', mobile: '9988776655',
    fax: '', email: 'SHARMA.STATIONERY@GMAIL.COM', remark: '',
  },
  {
    supplier_id: 3, code: 'SUP003', category: 'Digital Resources',
    name: 'EDUTECH SOLUTIONS PVT LTD', address: 'PLOT 7, TECH PARK, WHITEFIELD',
    state: 'Karnataka', city: 'Bengaluru', zip: '560066',
    phone1: '080-45678901', phone2: '', mobile: '9123456789',
    fax: '080-45678902', email: 'INFO@EDUTECHSOLUTIONS.IN', remark: 'E-BOOK PLATFORM',
  },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  'Books Supplier':      { fg: '#1d4ed8', bg: '#dbeafe' },
  'Stationery Supplier': { fg: '#059669', bg: '#d1fae5' },
  'Digital Resources':   { fg: '#7c3aed', bg: '#ede9fe' },
  'Furniture Supplier':  { fg: '#d97706', bg: '#fef3c7' },
  'IT Equipment':        { fg: '#0891b2', bg: '#cffafe' },
  'Periodical Supplier': { fg: '#dc2626', bg: '#fee2e2' },
  'Other':               { fg: '#64748b', bg: '#f1f5f9' },
}

const catColor = (cat) =>
  CATEGORY_COLORS[cat] || { fg: '#64748b', bg: '#f1f5f9' }

const EMPTY_FORM = {
  code: '', category: '', name: '', address: '',
  state: '', city: '', zip: '', remark: '',
  phone1: '', phone2: '', mobile: '', fax: '', email: '',
}

let nextId = INITIAL_SUPPLIERS.length + 1

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function Label({ children, required }) {
  return (
    <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
      {children}
      {required && <span className="text-rose-500">*</span>}
    </label>
  )
}

function Input({ value, onChange, placeholder, maxLength, type = 'text', error, disabled, className = '' }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      disabled={disabled}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
        ${className}`}
    />
  )
}

function Textarea({ value, onChange, placeholder, error, rows = 2 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
    />
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
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200
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

function FieldError({ msg }) {
  if (!msg) return null
  return (
    <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
      <AlertCircle className="w-3 h-3 flex-shrink-0" />{msg}
    </p>
  )
}

function SectionBox({ title, icon: Icon, color = 'blue', children }) {
  const colors = {
    blue:   'border-blue-200 dark:border-[rgba(99,102,241,0.2)] bg-blue-50 dark:bg-blue-500/5 text-blue-700 dark:text-blue-400',
    green:  'border-emerald-200 dark:border-[rgba(16,185,129,0.2)] bg-emerald-50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400',
  }
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className={`flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] ${colors[color]}`}>
        <span className="w-1 h-5 rounded-full bg-current flex-shrink-0" />
        <Icon className="w-4 h-4 flex-shrink-0" />
        <span className="text-[14px] font-bold">{title}</span>
      </div>
      <div className="p-5">{children}</div>
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

// ─── DELETE CONFIRM MODAL ─────────────────────────────────────────────────────

function DeleteModal({ supplier, onConfirm, onCancel }) {
  if (!supplier) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#1a1f35] rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6 w-full max-w-sm"
          style={{ animation: 'popIn .2s ease' }}>
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </span>
            <div>
              <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Delete Supplier</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
            </div>
          </div>
          <p className="text-[13px] text-slate-600 dark:text-slate-300 mb-5">
            Are you sure you want to delete <strong>{supplier.name}</strong> ({supplier.code})?
          </p>
          <div className="flex gap-3">
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

// ─── SUPPLIER MOBILE CARD ─────────────────────────────────────────────────────

function SupplierMobileCard({ supplier, idx, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = catColor(supplier.category)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {supplier.code?.slice(-3)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{supplier.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
            <Hash className="w-3 h-3" />{supplier.code}
            &nbsp;·&nbsp;
            <span style={{ color: fg }}>{supplier.category}</span>
          </p>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-1 gap-2 text-[12px]">
            {supplier.address && (
              <div className="flex items-start gap-2 text-slate-600 dark:text-slate-300">
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-slate-400" />
                <span>{supplier.address}, {supplier.city}, {supplier.state} – {supplier.zip}</span>
              </div>
            )}
            {supplier.phone1 && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span>{supplier.phone1}{supplier.phone2 ? ` / ${supplier.phone2}` : ''}</span>
              </div>
            )}
            {supplier.mobile && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Smartphone className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span>{supplier.mobile}</span>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="w-3.5 h-3.5 flex-shrink-0 text-slate-400" />
                <span className="truncate lowercase">{supplier.email}</span>
              </div>
            )}
            {supplier.remark && (
              <div className="flex items-start gap-2 text-slate-500 dark:text-slate-400 italic">
                <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                <span>{supplier.remark}</span>
              </div>
            )}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(supplier)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold
                bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => onDelete(supplier)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold
                bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function SupplierEntry() {
  const [suppliers,    setSuppliers]    = useState(INITIAL_SUPPLIERS)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [editingId,    setEditingId]    = useState(null)   // null = new entry
  const [errors,       setErrors]       = useState({})
  const [loading,      setLoading]      = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [search,       setSearch]       = useState('')
  const [toast,        setToast]        = useState(null)
  const [showForm,     setShowForm]     = useState(true)   // mobile: toggle form visibility
  const formRef = useRef(null)

  // ── Derived city list from selected state ─────────────────────────────────
  const cities = useMemo(() => STATES[form.state] || [], [form.state])

  // ── Reset state/city when state changes ──────────────────────────────────
  const handleStateChange = (e) => {
    setForm(f => ({ ...f, state: e.target.value, city: '' }))
  }

  // ── Generic form field handler ────────────────────────────────────────────
  const setField = useCallback((key) => (e) => {
    const val = e.target.value.toUpperCase()
    setForm(f => ({ ...f, [key]: val }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])

  const setFieldRaw = useCallback((key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }))
    setErrors(prev => ({ ...prev, [key]: undefined }))
  }, [])

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!form.code.trim())     err.code     = 'Code is required'
    if (!form.category)        err.category = 'Select a category'
    if (!form.name.trim())     err.name     = 'Supplier name is required'
    return err
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    // Check duplicate code
    const dupCode = suppliers.find(s =>
      s.code.trim().toUpperCase() === form.code.trim().toUpperCase() &&
      s.supplier_id !== editingId
    )
    if (dupCode) {
      setErrors({ code: 'This code already exists' })
      setLoading(false)
      return
    }

    setTimeout(() => {
      if (editingId !== null) {
        setSuppliers(prev => prev.map(s =>
          s.supplier_id === editingId ? { ...form, supplier_id: editingId } : s
        ))
        showToast(`Supplier "${form.name}" updated successfully.`)
      } else {
        const newSupplier = { ...form, supplier_id: nextId++ }
        setSuppliers(prev => [...prev, newSupplier])
        showToast(`Supplier "${form.name}" added successfully.`)
      }
      setForm(EMPTY_FORM)
      setEditingId(null)
      setLoading(false)
      if (window.innerWidth < 640) setShowForm(false) // collapse form on mobile after save
    }, 600)
  }, [form, editingId, suppliers])

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((supplier) => {
    setForm({
      code:     supplier.code,
      category: supplier.category,
      name:     supplier.name,
      address:  supplier.address,
      state:    supplier.state,
      city:     supplier.city,
      zip:      supplier.zip,
      remark:   supplier.remark,
      phone1:   supplier.phone1,
      phone2:   supplier.phone2,
      mobile:   supplier.mobile,
      fax:      supplier.fax,
      email:    supplier.email,
    })
    setEditingId(supplier.supplier_id)
    setErrors({})
    setShowForm(true)
    // Scroll to form
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, [])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    setSuppliers(prev => prev.filter(s => s.supplier_id !== deleteTarget.supplier_id))
    showToast(`Supplier "${deleteTarget.name}" deleted.`, 'error')
    if (editingId === deleteTarget.supplier_id) {
      setForm(EMPTY_FORM); setEditingId(null)
    }
    setDeleteTarget(null)
  }, [deleteTarget, editingId])

  // ── Reset form ─────────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm(EMPTY_FORM); setEditingId(null); setErrors({})
  }

  // ── Toast ─────────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Filtered suppliers ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return suppliers
    const q = search.toLowerCase()
    return suppliers.filter(s =>
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q)
    )
  }, [suppliers, search])

  const isEditing = editingId !== null

  return (
    <div className="space-y-4 pb-10 max-w-7xl mx-auto">

      {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <BookOpen className="w-3.5 h-3.5" />
        <span>Library</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700 dark:text-slate-200 font-semibold">Supplier Entry</span>
      </nav>

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Supplier Entry
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage library suppliers — add, edit, and track supplier details.
          </p>
        </div>

        {/* Mobile form toggle */}
        <button
          type="button"
          onClick={() => setShowForm(p => !p)}
          className="sm:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20 self-start"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm ? 'Hide Form' : isEditing ? 'Edit Form' : 'Add Supplier'}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* FORM SECTION                                                      */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div
        ref={formRef}
        className={`transition-all duration-300 space-y-4 ${!showForm ? 'hidden sm:block' : ''}`}
      >

        {/* Edit banner */}
        {isEditing && (
          <div className="flex items-center gap-3 px-5 py-3 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/25">
            <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-[13px] font-semibold text-amber-800 dark:text-amber-300 flex-1">
              Editing supplier: <span className="font-bold">{form.name || form.code}</span>
            </p>
            <button onClick={handleReset} className="text-[12px] text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1">
              <X className="w-3.5 h-3.5" /> Cancel Edit
            </button>
          </div>
        )}

        {/* Box 1: Code + Category */}
        <SectionBox title="Supplier Entry" icon={Tag} color="blue">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Code */}
            <div>
              <Label required>Code</Label>
              <Input
                value={form.code}
                onChange={setField('code')}
                placeholder="e.g. SUP004"
                error={errors.code}
              />
              <FieldError msg={errors.code} />
            </div>

            {/* Supplier Category */}
            <div>
              <Label required>Supplier Category</Label>
              <Select
                value={form.category}
                onChange={setFieldRaw('category')}
                placeholder="-- Select Category --"
                error={errors.category}
              >
                {SUPPLIER_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <FieldError msg={errors.category} />
            </div>
          </div>
        </SectionBox>

        {/* Box 2: Personal Detail */}
        <SectionBox title="Supplier Personal Detail" icon={User} color="green">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Name */}
            <div className="sm:col-span-2">
              <Label required>Name</Label>
              <Input
                value={form.name}
                onChange={setField('name')}
                placeholder="Supplier full name"
                error={errors.name}
              />
              <FieldError msg={errors.name} />
            </div>

            {/* Address */}
            <div className="sm:col-span-2">
              <Label>Address</Label>
              <Textarea
                value={form.address}
                onChange={setField('address')}
                placeholder="Street address"
              />
            </div>

            {/* State */}
            <div>
              <Label>State</Label>
              <Select
                value={form.state}
                onChange={handleStateChange}
                placeholder="-- Select State --"
              >
                {Object.keys(STATES).map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>

            {/* City */}
            <div>
              <Label>City</Label>
              <Select
                value={form.city}
                onChange={setFieldRaw('city')}
                placeholder="-- Select City --"
                disabled={!form.state}
              >
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>

            {/* Zip */}
            <div>
              <Label>ZIP Code</Label>
              <Input
                value={form.zip}
                onChange={setField('zip')}
                placeholder="e.g. 226001"
                maxLength={6}
              />
            </div>

            {/* Remark */}
            <div>
              <Label>Remark</Label>
              <Textarea
                value={form.remark}
                onChange={setField('remark')}
                placeholder="Optional note"
                rows={1}
              />
            </div>

            {/* Phone1 */}
            <div>
              <Label>Phone 1</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <Input
                  value={form.phone1}
                  onChange={setFieldRaw('phone1')}
                  placeholder="STD + number"
                  maxLength={12}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Phone2 */}
            <div>
              <Label>Phone 2</Label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <Input
                  value={form.phone2}
                  onChange={setFieldRaw('phone2')}
                  placeholder="Alternate number"
                  maxLength={12}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Mobile */}
            <div>
              <Label>Mobile</Label>
              <div className="relative">
                <Smartphone className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <Input
                  value={form.mobile}
                  onChange={setFieldRaw('mobile')}
                  placeholder="10-digit mobile"
                  maxLength={12}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Fax */}
            <div>
              <Label>Fax</Label>
              <div className="relative">
                <Printer className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <Input
                  value={form.fax}
                  onChange={setFieldRaw('fax')}
                  placeholder="Fax number"
                  maxLength={10}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Email */}
            <div className="sm:col-span-2">
              <Label>Email</Label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={form.email}
                  onChange={setFieldRaw('email')}
                  placeholder="email@example.com"
                  className="w-full pl-8 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                    dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                    border-slate-200 dark:border-[rgba(99,102,241,0.25)]"
                />
              </div>
            </div>

          </div>

          {/* Form Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.12)]">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70 w-full sm:w-auto"
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isEditing ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {loading ? 'Saving…' : isEditing ? 'Update Supplier' : 'Add Supplier'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                transition-colors w-full sm:w-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        </SectionBox>
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* SUPPLIERS LIST                                                    */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* List Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Supplier List</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search code, name, category…"
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

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Code', 'Category', 'Name', 'City / State', 'Contact', 'Actions'].map((h, i) => (
                    <th key={i}
                      className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, i) => {
                  const { fg, bg } = catColor(s.category)
                  return (
                    <tr
                      key={s.supplier_id}
                      className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors
                        ${editingId === s.supplier_id ? 'bg-amber-50/60 dark:bg-amber-500/5' : ''}`}
                    >
                      {/* S.No */}
                      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{i + 1}</td>

                      {/* Code */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-slate-700 dark:text-slate-200">
                          <span
                            className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
                            style={{ background: bg, color: fg }}
                          >
                            {s.code?.slice(-3)}
                          </span>
                          {s.code}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
                          style={{ background: bg, color: fg }}
                        >
                          {s.category}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3">
                        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{s.name}</p>
                        {s.email && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 lowercase truncate max-w-[180px]">{s.email}</p>
                        )}
                      </td>

                      {/* City / State */}
                      <td className="px-4 py-3">
                        <p className="text-[12px] text-slate-600 dark:text-slate-300">{s.city || '—'}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">{s.state}</p>
                      </td>

                      {/* Contact */}
                      <td className="px-4 py-3">
                        {s.mobile && (
                          <p className="text-[12px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                            <Smartphone className="w-3 h-3 text-slate-400" />{s.mobile}
                          </p>
                        )}
                        {s.phone1 && (
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                            <Phone className="w-3 h-3" />{s.phone1}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                              bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors"
                          >
                            <Pencil className="w-3 h-3" /> Edit
                          </button>
                          <button
                            onClick={() => setDeleteTarget(s)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                              bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0
            ? <EmptyState search={search} />
            : filtered.map((s, i) => (
              <SupplierMobileCard
                key={s.supplier_id}
                supplier={s}
                idx={i + 1}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))
          }
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{suppliers.length}</span> suppliers
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        supplier={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────

function EmptyState({ search }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Building2 className="w-6 h-6 opacity-50" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
          {search ? 'No suppliers match your search' : 'No suppliers added yet'}
        </p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
          {search ? 'Try a different name, code, or category.' : 'Fill the form above and click Add Supplier.'}
        </p>
      </div>
    </div>
  )
}
