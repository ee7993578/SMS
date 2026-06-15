/**
 * Product_Group.jsx
 * Converts legacy ASPX "Product Group" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Add new product group
 *  - Inline Edit / Delete / Update / Cancel in grid
 *  - Client-side validation
 *  - Search filter on grid
 *  - Toast notifications
 *  - Desktop: ERP-style table
 *  - Mobile: card-based layout with expandable actions
 *  - Loading states, empty states
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Plus, Edit2, Trash2, Check, X, Search,
  RefreshCw, AlertCircle, Loader2, Package,
  ChevronRight, Hash, Tag, MoreVertical,
  ShieldCheck, SlidersHorizontal, Save
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
let _nextId = 13
const INITIAL_PRODUCTS = [
  { id: 1,  Product_code: 'PG001', Product_name: 'BEVERAGES'       },
  { id: 2,  Product_code: 'PG002', Product_name: 'SNACKS'          },
  { id: 3,  Product_code: 'PG003', Product_name: 'DAIRY PRODUCTS'  },
  { id: 4,  Product_code: 'PG004', Product_name: 'BAKERY ITEMS'    },
  { id: 5,  Product_code: 'PG005', Product_name: 'CONFECTIONERY'   },
  { id: 6,  Product_code: 'PG006', Product_name: 'STATIONERY'      },
  { id: 7,  Product_code: 'PG007', Product_name: 'FROZEN FOODS'    },
  { id: 8,  Product_code: 'PG008', Product_name: 'CANNED GOODS'    },
  { id: 9,  Product_code: 'PG009', Product_name: 'FRESH PRODUCE'   },
  { id: 10, Product_code: 'PG010', Product_name: 'HEALTH DRINKS'   },
  { id: 11, Product_code: 'PG011', Product_name: 'INSTANT FOODS'   },
  { id: 12, Product_code: 'PG012', Product_name: 'PERSONAL CARE'   },
]

// Auto-generate next product code
const genCode = (list) => {
  const nums = list.map(p => parseInt(p.Product_code.replace('PG', ''), 10)).filter(Boolean)
  const max = nums.length ? Math.max(...nums) : 0
  return `PG${String(max + 1).padStart(3, '0')}`
}

// Badge color palette per first char
const BADGE_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
  { fg: '#be185d', bg: '#fce7f3' },
]
const getBadgeColor = (name = '') => BADGE_COLORS[(name.charCodeAt(0) ?? 65) % BADGE_COLORS.length]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
        px-5 py-3 rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'toastUp .25s ease' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

/** Confirm delete modal */
function DeleteConfirm({ product, onConfirm, onCancel }) {
  if (!product) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
          w-[90vw] max-w-sm bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] p-6"
        style={{ animation: 'scaleIn .2s ease' }}
      >
        <style>{`@keyframes scaleIn{from{opacity:0;transform:translate(-50%,-50%) scale(.92)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
        <div className="flex items-center gap-3 mb-3">
          <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Delete Product Group</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
          </div>
        </div>
        <p className="text-[13px] text-slate-600 dark:text-slate-300 mb-5">
          Are you sure you want to delete{' '}
          <span className="font-bold text-slate-800 dark:text-slate-100">"{product.Product_name}"</span>?
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(product.id)}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
              bg-rose-600 text-white hover:bg-rose-700 transition-colors active:scale-95"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  )
}

// ─── ADD PRODUCT FORM ─────────────────────────────────────────────────────────
function AddProductForm({ onAdd, loading }) {
  const [name, setName]   = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const validate = () => {
    if (!name.trim()) { setError('Product name is required.'); return false }
    if (name.includes("'")) { setError("Apostrophes are not allowed."); return false }
    setError(''); return true
  }

  const handleSubmit = () => {
    if (!validate()) return
    onAdd(name.trim(), () => { setName(''); inputRef.current?.focus() })
  }

  const handleKey = (e) => { if (e.key === 'Enter') handleSubmit() }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
        <Package className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Add New Product Group</span>
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          {/* Input */}
          <div className="flex-1 w-full">
            <label className="block text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={e => { setName(e.target.value.replace(/'/g, '')); if (error) setError('') }}
                onKeyDown={handleKey}
                placeholder="e.g. BEVERAGES"
                className={`w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                  bg-white text-slate-800 placeholder-slate-300
                  focus:ring-2 focus:ring-blue-100 focus:border-blue-400
                  dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                  dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                  ${error
                    ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
                    : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                  }`}
              />
            </div>
            {error && (
              <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
              </p>
            )}
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl
              text-[13px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700
              shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70
              flex-shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            ADD
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, editingId, editName, setEditName, onEdit, onUpdate, onCancel, onDelete }) {
  const isEditing = editingId === row.id
  const { fg, bg } = getBadgeColor(row.Product_name)

  if (isEditing) {
    return (
      <tr className="bg-blue-50/60 dark:bg-indigo-500/[0.05] border-b border-blue-100 dark:border-indigo-500/20">
        <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums">{idx}</td>
        <td className="px-4 py-3 text-center">
          <span className="text-[12px] font-mono font-semibold text-slate-500 dark:text-slate-400">{row.Product_code}</span>
        </td>
        <td className="px-4 py-3">
          <input
            type="text"
            value={editName}
            onChange={e => setEditName(e.target.value.replace(/'/g, ''))}
            onKeyDown={e => { if (e.key === 'Enter') onUpdate(row.id); if (e.key === 'Escape') onCancel() }}
            autoFocus
            className="w-full px-3 py-1.5 text-[13px] rounded-lg border border-blue-300 dark:border-indigo-400
              bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
              outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-indigo-500/30"
          />
        </td>
        <td className="px-4 py-3 text-center">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onUpdate(row.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 transition-colors active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />Update
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              <X className="w-3.5 h-3.5" />Cancel
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-14">{idx}</td>

      {/* Code */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-mono font-bold
          bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <Hash className="w-3 h-3 opacity-60" />{row.Product_code}
        </span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {row.Product_name.slice(0, 2)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.Product_name}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        <div className="flex items-center justify-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
              border border-blue-100 dark:border-blue-500/20 transition-colors active:scale-95"
          >
            <Edit2 className="w-3.5 h-3.5" />Edit
          </button>
          <button
            onClick={() => onDelete(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
              border border-rose-100 dark:border-rose-500/20 transition-colors active:scale-95"
          >
            <Trash2 className="w-3.5 h-3.5" />Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, editingId, editName, setEditName, onEdit, onUpdate, onCancel, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const isEditing = editingId === row.id
  const { fg, bg } = getBadgeColor(row.Product_name)

  if (isEditing) {
    return (
      <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/40 bg-blue-50/50 dark:bg-indigo-500/[0.05] p-4 space-y-3">
        <div className="flex items-center gap-2 mb-1">
          <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400">Editing — {row.Product_code}</span>
        </div>
        <input
          type="text"
          value={editName}
          onChange={e => setEditName(e.target.value.replace(/'/g, ''))}
          onKeyDown={e => { if (e.key === 'Enter') onUpdate(row.id); if (e.key === 'Escape') onCancel() }}
          autoFocus
          className="w-full px-3 py-2.5 text-[14px] rounded-xl border border-blue-300 dark:border-indigo-400
            bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
            outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-indigo-500/30"
          placeholder="Product name"
        />
        <div className="flex gap-2">
          <button
            onClick={() => onUpdate(row.id)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 transition-colors active:scale-95"
          >
            <Save className="w-4 h-4" />Update
          </button>
          <button
            onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            <X className="w-4 h-4" />Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Badge */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {row.Product_name.slice(0, 2)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{row.Product_name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] font-mono font-semibold text-slate-400 dark:text-slate-500">{row.Product_code}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="text-[11px] text-slate-400 dark:text-slate-500">#{idx}</span>
          </div>
        </div>

        {/* Action menu */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setMenuOpen(p => !p)}
            className="w-8 h-8 rounded-lg flex items-center justify-center
              text-slate-400 hover:text-slate-600 hover:bg-slate-100
              dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-9 z-20 w-36 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] shadow-xl overflow-hidden"
                style={{ animation: 'menuIn .15s ease' }}>
                <style>{`@keyframes menuIn{from{opacity:0;transform:scale(.95) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
                <button
                  onClick={() => { onEdit(row); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold
                    text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors text-left"
                >
                  <Edit2 className="w-3.5 h-3.5 flex-shrink-0" />Edit
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-700/50" />
                <button
                  onClick={() => { onDelete(row); setMenuOpen(false) }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold
                    text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors text-left"
                >
                  <Trash2 className="w-3.5 h-3.5 flex-shrink-0" />Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ProductGroup() {
  const [products,   setProducts]   = useState(INITIAL_PRODUCTS)
  const [editingId,  setEditingId]  = useState(null)
  const [editName,   setEditName]   = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [search,     setSearch]     = useState('')
  const [toast,      setToast]      = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // ── ADD ───────────────────────────────────────────────────────────────────
  const handleAdd = useCallback((name, reset) => {
    setAddLoading(true)
    setTimeout(() => {
      const code = genCode(products)
      setProducts(prev => [...prev, { id: _nextId++, Product_code: code, Product_name: name.toUpperCase() }])
      setAddLoading(false)
      reset()
      showToast(`"${name.toUpperCase()}" added successfully!`)
    }, 400)
  }, [products, showToast])

  // ── EDIT / UPDATE / CANCEL ────────────────────────────────────────────────
  const handleEdit   = (row)  => { setEditingId(row.id); setEditName(row.Product_name) }
  const handleCancel = ()     => { setEditingId(null); setEditName('') }

  const handleUpdate = useCallback((id) => {
    if (!editName.trim()) { showToast('Product name cannot be empty.', 'error'); return }
    setProducts(prev => prev.map(p => p.id === id ? { ...p, Product_name: editName.trim().toUpperCase() } : p))
    setEditingId(null); setEditName('')
    showToast('Product group updated successfully!')
  }, [editName, showToast])

  // ── DELETE ────────────────────────────────────────────────────────────────
  const handleDeleteRequest = (row) => setDeleteTarget(row)

  const handleDeleteConfirm = useCallback((id) => {
    const name = products.find(p => p.id === id)?.Product_name
    setProducts(prev => prev.filter(p => p.id !== id))
    setDeleteTarget(null)
    if (editingId === id) handleCancel()
    showToast(`"${name}" deleted.`, 'error')
  }, [products, editingId, showToast])

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return products
    const q = search.toLowerCase()
    return products.filter(p =>
      p.Product_name.toLowerCase().includes(q) ||
      p.Product_code.toLowerCase().includes(q)
    )
  }, [products, search])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#111827] p-4 sm:p-6">
      <div className="max-w-5xl mx-auto space-y-4">

        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-[12px] text-slate-400 dark:text-slate-500">
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="font-semibold text-slate-600 dark:text-slate-300">Product Group</span>
        </nav>

        {/* ── Page Title ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-[22px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2 tracking-tight">
              <Package className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              Product Group
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Manage product groups — add, edit, and remove categories.
            </p>
          </div>

          {/* Stats pill */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm flex-shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
              {products.length} <span className="font-normal text-slate-400">total groups</span>
            </span>
          </div>
        </div>

        {/* ── Add Form ───────────────────────────────────────────────────── */}
        <AddProductForm onAdd={handleAdd} loading={addLoading} />

        {/* ── Product List Card ──────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
              <SlidersHorizontal className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">All Product Groups</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name or code…"
                className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600 dark:focus:border-indigo-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            {filtered.length === 0 ? (
              <EmptyState search={search} onClearSearch={() => setSearch('')} />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Product Code', 'Product Name', 'Action'].map((h, i) => (
                      <th
                        key={i}
                        className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap"
                      >
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
                      editName={editName}
                      setEditName={setEditName}
                      onEdit={handleEdit}
                      onUpdate={handleUpdate}
                      onCancel={handleCancel}
                      onDelete={handleDeleteRequest}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="md:hidden p-4 space-y-3">
            {filtered.length === 0 ? (
              <EmptyState search={search} onClearSearch={() => setSearch('')} />
            ) : filtered.map((row, i) => (
              <MobileCard
                key={row.id}
                row={row}
                idx={i + 1}
                editingId={editingId}
                editName={editName}
                setEditName={setEditName}
                onEdit={handleEdit}
                onUpdate={handleUpdate}
                onCancel={handleCancel}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{products.length}</span> records
            </p>
            {(search || editingId) && (
              <button
                onClick={() => { setSearch(''); handleCancel() }}
                className="flex items-center gap-1.5 text-[12px] text-blue-600 dark:text-blue-400 hover:underline"
              >
                <RefreshCw className="w-3 h-3" />Reset
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      <DeleteConfirm
        product={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search, onClearSearch }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Package className="w-7 h-7 opacity-40" />
      </div>
      <div className="text-center">
        {search ? (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No matches found</p>
            <p className="text-[12px] mt-1">No product group matches <strong>"{search}"</strong></p>
            <button onClick={onClearSearch} className="mt-2 text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 mx-auto">
              <X className="w-3.5 h-3.5" />Clear search
            </button>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No product groups yet</p>
            <p className="text-[12px] mt-1">Add your first product group using the form above.</p>
          </>
        )}
      </div>
    </div>
  )
}
