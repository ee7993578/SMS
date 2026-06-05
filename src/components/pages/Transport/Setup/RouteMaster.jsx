/**
 * RouteMaster.jsx
 * Folder: src/pages/Transport/RouteMaster.jsx
 *
 * Converts legacy ASPX "Route Master" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Add new route (Route Name input + Submit)
 *  - Inline Edit / Update / Cancel per row
 *  - Delete with confirmation toast
 *  - Search / filter routes instantly
 *  - Desktop: dense ERP-style table
 *  - Mobile: card-based layout with swipe-friendly actions
 *  - Full validation, loading states, toast notifications
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Bus, MapPin, Plus, RefreshCw, Search,
  Pencil, Trash2, Check, X, AlertCircle,
  Loader2, ChevronDown, SlidersHorizontal,
  Info, Route, Navigation, CheckCircle2,
  ArrowRight, BookOpen, Filter
} from 'lucide-react'

// ─── STATIC DUMMY DATA ────────────────────────────────────────────────────────
const INITIAL_ROUTES = [
  { route_id: 1,  route_name: 'Rajpur Road' },
  { route_id: 2,  route_name: 'Prem Nagar' },
  { route_id: 3,  route_name: 'Clement Town' },
  { route_id: 4,  route_name: 'Saharanpur Road' },
  { route_id: 5,  route_name: 'Haridwar Road' },
  { route_id: 6,  route_name: 'Rispana Pull' },
  { route_id: 7,  route_name: 'Ballupur Chowk' },
  { route_id: 8,  route_name: 'Karanpur' },
  { route_id: 9,  route_name: 'Turner Road' },
  { route_id: 10, route_name: 'Chakrata Road' },
  { route_id: 11, route_name: 'GMS Road' },
  { route_id: 12, route_name: 'Nathanpur' },
]

// ─── ROUTE COLOR PALETTE ──────────────────────────────────────────────────────
const ROUTE_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const routeColor = (id) => ROUTE_COLORS[(id - 1) % ROUTE_COLORS.length]
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || 'R'

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Styled text input */
function TextInput({ value, onChange, placeholder, error, disabled, autoFocus, onKeyDown }) {
  return (
    <input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      autoFocus={autoFocus}
      onKeyDown={onKeyDown}
      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        }`}
    />
  )
}

/** Form field wrapper */
function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
          {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  const colors = {
    success: 'bg-emerald-600 text-white',
    error:   'bg-rose-600 text-white',
    info:    'bg-blue-600 text-white',
  }
  const Icon = type === 'success' ? CheckCircle2 : AlertCircle
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
        px-5 py-3 rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${colors[type]}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

/** Confirm delete modal */
function DeleteModal({ route, onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onCancel} />
      <div
        className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2
          z-50 w-full sm:w-[380px] rounded-2xl bg-white dark:bg-[#1a1f35]
          border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6"
        style={{ animation: 'popIn .2s ease' }}
      >
        <style>{`@keyframes popIn{from{opacity:0;transform:translateX(-50%) translateY(calc(-50% + 10px))}to{opacity:1;transform:translateX(-50%) translateY(-50%)}}`}</style>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Delete Route?</h3>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-semibold text-slate-700 dark:text-slate-200">"{route?.route_name}"</span> will be permanently deleted. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white
              hover:bg-rose-700 transition-colors shadow-md shadow-rose-500/25">
            Delete
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const clr = {
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    emerald:'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
      bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${clr[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ route, idx, editId, editValue, setEditValue, onEdit, onUpdate, onCancel, onDelete }) {
  const isEditing = editId === route.route_id
  const { fg, bg } = routeColor(route.route_id)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* Sr No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-14">{idx}</td>

      {/* Route Name */}
      <td className="px-4 py-3">
        {isEditing ? (
          <TextInput
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            placeholder="Enter route name"
            autoFocus
            onKeyDown={e => { if (e.key === 'Enter') onUpdate(); if (e.key === 'Escape') onCancel() }}
          />
        ) : (
          <div className="flex items-center gap-2.5">
            <span
              className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
              style={{ background: bg, color: fg }}
            >
              {initials(route.route_name)}
            </span>
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{route.route_name}</span>
          </div>
        )}
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-right w-44">
        {isEditing ? (
          <div className="flex items-center justify-end gap-2">
            <button onClick={onUpdate}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">
              <Check className="w-3.5 h-3.5" /> Update
            </button>
            <button onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button onClick={() => onEdit(route)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors border border-blue-100 dark:border-blue-500/20">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(route)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors border border-rose-100 dark:border-rose-500/20">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  )
}

// ─── MOBILE ROUTE CARD ────────────────────────────────────────────────────────
function MobileCard({ route, idx, editId, editValue, setEditValue, onEdit, onUpdate, onCancel, onDelete }) {
  const isEditing = editId === route.route_id
  const { fg, bg } = routeColor(route.route_id)

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm transition-all
      ${isEditing
        ? 'border-blue-300 dark:border-indigo-500/50 ring-2 ring-blue-100 dark:ring-indigo-500/20'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'
      }`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Badge */}
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {initials(route.route_name)}
        </span>

        {/* Name / Edit input */}
        <div className="flex-1 min-w-0">
          {isEditing ? (
            <TextInput
              value={editValue}
              onChange={e => setEditValue(e.target.value)}
              placeholder="Enter route name"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') onUpdate(); if (e.key === 'Escape') onCancel() }}
            />
          ) : (
            <>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{route.route_name}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
                <Navigation className="w-3 h-3" /> Route #{idx}
              </p>
            </>
          )}
        </div>

        {/* Actions */}
        {!isEditing && (
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button onClick={() => onEdit(route)}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600
                hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors">
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => onDelete(route)}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-rose-50 text-rose-600
                hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Edit action bar */}
      {isEditing && (
        <div className="flex gap-3 px-4 pb-3.5">
          <button onClick={onUpdate}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            <Check className="w-4 h-4" /> Update
          </button>
          <button onClick={onCancel}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            <X className="w-4 h-4" /> Cancel
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RouteMaster() {
  const [routes,      setRoutes]      = useState(INITIAL_ROUTES)
  const [routeName,   setRouteName]   = useState('')
  const [formError,   setFormError]   = useState('')
  const [submitting,  setSubmitting]  = useState(false)

  const [editId,      setEditId]      = useState(null)
  const [editValue,   setEditValue]   = useState('')

  const [search,      setSearch]      = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast,       setToast]       = useState(null)
  const nextId = useRef(INITIAL_ROUTES.length + 1)

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  // ── Submit new route ──────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const trimmed = routeName.trim()
    if (!trimmed) { setFormError('Route name is required'); return }
    if (routes.some(r => r.route_name.toLowerCase() === trimmed.toLowerCase())) {
      setFormError('Route already exists'); return
    }
    setFormError('')
    setSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      const newRoute = { route_id: nextId.current++, route_name: trimmed }
      setRoutes(prev => [...prev, newRoute])
      setRouteName('')
      setSubmitting(false)
      showToast(`Route "${trimmed}" added successfully!`)
    }, 500)
  }, [routeName, routes])

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((route) => {
    setEditId(route.route_id)
    setEditValue(route.route_name)
  }, [])

  const handleUpdate = useCallback(() => {
    const trimmed = editValue.trim()
    if (!trimmed) { showToast('Route name cannot be empty', 'error'); return }
    const duplicate = routes.find(r => r.route_name.toLowerCase() === trimmed.toLowerCase() && r.route_id !== editId)
    if (duplicate) { showToast('Route already exists', 'error'); return }
    setRoutes(prev => prev.map(r => r.route_id === editId ? { ...r, route_name: trimmed } : r))
    showToast(`Route updated successfully!`)
    setEditId(null)
    setEditValue('')
  }, [editId, editValue, routes])

  const handleCancelEdit = useCallback(() => {
    setEditId(null)
    setEditValue('')
  }, [])

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(() => {
    if (!deleteTarget) return
    setRoutes(prev => prev.filter(r => r.route_id !== deleteTarget.route_id))
    showToast(`Route "${deleteTarget.route_name}" deleted.`, 'info')
    setDeleteTarget(null)
  }, [deleteTarget])

  // ── Reset form ────────────────────────────────────────────────────────────
  const handleReset = () => {
    setRouteName(''); setFormError(''); setSearch('')
    setEditId(null); setEditValue('')
  }

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return routes
    const q = search.toLowerCase()
    return routes.filter(r => r.route_name.toLowerCase().includes(q))
  }, [routes, search])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Route Master
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage transport routes — add, edit, or remove routes.
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-shrink-0">
          <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Home</span>
          <ArrowRight className="w-3 h-3" />
          <span className="text-slate-600 dark:text-slate-300 font-semibold">Route Master</span>
        </nav>
      </div>

      {/* ── Summary Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon={Route}      label="Total Routes"   value={routes.length}          color="blue"    />
        <StatCard icon={Navigation} label="Active Routes"  value={routes.length}          color="emerald" />
        <StatCard icon={Bus}        label="Search Results" value={filtered.length}        color="violet"  />
      </div>

      {/* ── ADD NEW ROUTE FORM ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Add New Route</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Route Name */}
            <Field label="Route Name" error={formError} required>
              <TextInput
                value={routeName}
                onChange={e => { setRouteName(e.target.value); setFormError('') }}
                placeholder="e.g. Rajpur Road"
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit() }}
                error={formError}
              />
            </Field>

            {/* Spacers on wider screens */}
            <div className="hidden lg:block" />
            <div className="hidden lg:block" />

            {/* Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {submitting
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Check className="w-4 h-4" />}
                Submit
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Hint */}
          <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            Press <kbd className="px-1 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 font-mono border border-slate-200 dark:border-slate-700">Enter</kbd> to quickly submit.
          </p>
        </div>
      </div>

      {/* ── ROUTES LIST CARD ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">All Routes</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-52 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search routes…"
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

        {/* Info hint */}
        <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Hover on a row to see Edit / Delete actions. Click Edit to modify inline.
          </p>
        </div>

        {/* ── DESKTOP TABLE ────────────────────────────────────────────────── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No routes match your search.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['Sr No.', 'Route Name', 'Action'].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                        ${i === 0 ? 'text-center w-14' : i === 2 ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((route, i) => (
                  <DesktopRow
                    key={route.route_id}
                    route={route}
                    idx={i + 1}
                    editId={editId}
                    editValue={editValue}
                    setEditValue={setEditValue}
                    onEdit={handleEdit}
                    onUpdate={handleUpdate}
                    onCancel={handleCancelEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ─────────────────────────────────────────────────── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No routes match your search.</span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap edit icon to modify a route.
              </p>
              {filtered.map((route, i) => (
                <MobileCard
                  key={route.route_id}
                  route={route}
                  idx={i + 1}
                  editId={editId}
                  editValue={editValue}
                  setEditValue={setEditValue}
                  onEdit={handleEdit}
                  onUpdate={handleUpdate}
                  onCancel={handleCancelEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{routes.length}</span> routes
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* ── Empty State (no routes at all) ───────────────────────────────── */}
      {routes.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Bus className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No routes added yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Enter a route name above and click <strong>Submit</strong> to get started.
            </p>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ─────────────────────────────────────────── */}
      {deleteTarget && (
        <DeleteModal
          route={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
