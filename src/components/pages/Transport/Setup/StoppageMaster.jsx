/**
 * StoppageMaster.jsx
 * Transport → Stoppage Master
 * Converted from stoppage_master.aspx
 * Fields: Session, Stoppage Name, Pick Up Time, Drop Time, Charges, Transport Type (multi-check), Slab
 * Grid: Sr No, Stoppage Name, Pick Up Time, Drop Time, Transport Type, Slab, Fee, Actions
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Bus, Filter, RefreshCw, Eye, Plus, Download, Edit2, Trash2,
  Check, X, AlertCircle, Loader2, ChevronDown, SlidersHorizontal,
  Search, MapPin, Clock, IndianRupee, Save, Ban,
  ChevronRight, Layers, Info, TrendingUp, CheckSquare, Square,
  FileSpreadsheet, Tag, Navigation, MoreVertical
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const TRANSPORT_TYPES = [
  { id: 'bus',    label: 'Bus' },
  { id: 'van',    label: 'Van' },
  { id: 'auto',   label: 'Auto' },
  { id: 'taxi',   label: 'Taxi' },
  { id: 'cycle',  label: 'E-Cycle' },
  { id: 'walker', label: 'Walker' },
]

const SLABS = [
  { id: '', label: '-- Select Slab --' },
  { id: 'slab_a', label: 'Slab A (0–5 km)' },
  { id: 'slab_b', label: 'Slab B (5–10 km)' },
  { id: 'slab_c', label: 'Slab C (10–15 km)' },
  { id: 'slab_d', label: 'Slab D (15+ km)' },
]

const DUMMY_RECORDS = {
  '2024-25': [
    { id: 1, stoppage: 'Civil Lines',     pickup: '07:00 AM', drop: '02:30 PM', types: ['bus', 'van'],   slab: 'slab_b', fee: 1800 },
    { id: 2, stoppage: 'Rajpur Road',     pickup: '07:15 AM', drop: '02:45 PM', types: ['bus'],           slab: 'slab_c', fee: 2200 },
    { id: 3, stoppage: 'Ballupur Chowk',  pickup: '07:20 AM', drop: '02:50 PM', types: ['van', 'auto'],  slab: 'slab_a', fee: 1200 },
    { id: 4, stoppage: 'GMS Road',        pickup: '07:30 AM', drop: '03:00 PM', types: ['bus'],           slab: 'slab_c', fee: 2400 },
    { id: 5, stoppage: 'Haridwar Bypass', pickup: '06:50 AM', drop: '03:15 PM', types: ['bus', 'taxi'],  slab: 'slab_d', fee: 3000 },
    { id: 6, stoppage: 'Dehradun Cantt',  pickup: '07:05 AM', drop: '02:40 PM', types: ['van'],           slab: 'slab_b', fee: 1600 },
  ],
  '2025-26': [
    { id: 1, stoppage: 'Civil Lines',     pickup: '07:00 AM', drop: '02:30 PM', types: ['bus', 'van'],   slab: 'slab_b', fee: 2000 },
    { id: 2, stoppage: 'Rajpur Road',     pickup: '07:15 AM', drop: '02:45 PM', types: ['bus'],           slab: 'slab_c', fee: 2500 },
    { id: 3, stoppage: 'Ballupur Chowk',  pickup: '07:20 AM', drop: '02:50 PM', types: ['van', 'auto'],  slab: 'slab_a', fee: 1400 },
    { id: 4, stoppage: 'GMS Road',        pickup: '07:30 AM', drop: '03:00 PM', types: ['bus'],           slab: 'slab_c', fee: 2800 },
    { id: 5, stoppage: 'Haridwar Bypass', pickup: '06:50 AM', drop: '03:15 PM', types: ['bus', 'taxi'],  slab: 'slab_d', fee: 3500 },
  ],
}

const TYPE_COLORS = {
  bus:    { bg: '#dbeafe', fg: '#1d4ed8' },
  van:    { bg: '#d1fae5', fg: '#059669' },
  auto:   { bg: '#fef3c7', fg: '#d97706' },
  taxi:   { bg: '#ede9fe', fg: '#7c3aed' },
  cycle:  { bg: '#cffafe', fg: '#0891b2' },
  walker: { bg: '#fee2e2', fg: '#dc2626' },
}

const slabLabel = (id) => SLABS.find(s => s.id === id)?.label ?? id
const typeName  = (id) => TRANSPORT_TYPES.find(t => t.id === id)?.label ?? id

let nextId = 100

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'} ${className}`}
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
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
        {label}{required && <span className="text-rose-500">*</span>}
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
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3
      rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw] anim-slide
      ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white'}`}>
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  )
}

// ─── TRANSPORT TYPE CHECKBOXES ────────────────────────────────────────────────

function TransportTypeSelector({ selected, onChange, selectAll, onSelectAll }) {
  return (
    <div className="flex flex-col gap-2">
      {/* Select All */}
      <button
        type="button"
        onClick={onSelectAll}
        className="flex items-center gap-2 text-[12px] font-semibold text-blue-600 hover:text-blue-700 transition-colors w-fit"
      >
        {selectAll ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
        Select All
      </button>
      <div className="flex flex-wrap gap-2">
        {TRANSPORT_TYPES.map(t => {
          const active = selected.includes(t.id)
          const { bg, fg } = TYPE_COLORS[t.id] || { bg: '#f1f5f9', fg: '#475569' }
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => {
                onChange(
                  active ? selected.filter(x => x !== t.id) : [...selected, t.id]
                )
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border-2 transition-all active:scale-95
                ${active ? 'border-transparent shadow-sm' : 'border-slate-200 bg-white text-slate-500'}`}
              style={active ? { background: bg, color: fg, borderColor: fg + '33' } : {}}
            >
              {active && <Check className="w-3 h-3" />}
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── TYPE BADGE CHIPS ─────────────────────────────────────────────────────────

function TypeBadges({ types }) {
  return (
    <div className="flex flex-wrap gap-1">
      {(types || []).map(t => {
        const { bg, fg } = TYPE_COLORS[t] || { bg: '#f1f5f9', fg: '#475569' }
        return (
          <span key={t} className="px-2 py-0.5 rounded-md text-[10px] font-bold" style={{ background: bg, color: fg }}>
            {typeName(t)}
          </span>
        )
      })}
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber:   'bg-amber-50 text-amber-600',
    violet:  'bg-violet-50 text-violet-600',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-4.5 h-4.5" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW (normal + edit mode) ───────────────────────────────────

function DesktopRow({ row, idx, onEdit, onDelete, onUpdate, onCancel, editRow, setEditRow, slabs }) {
  const isEditing = editRow?.id === row.id
  const allSelected = editRow?.types?.length === TRANSPORT_TYPES.length

  if (isEditing) {
    return (
      <tr className="bg-blue-50/60 border-b border-blue-100">
        <td className="px-3 py-2 text-center text-[12px] text-blue-400 tabular-nums">{idx}</td>
        <td className="px-3 py-2">
          <input
            value={editRow.stoppage}
            onChange={e => setEditRow(p => ({ ...p, stoppage: e.target.value }))}
            className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-blue-200 focus:border-blue-400 outline-none bg-white"
            placeholder="Stoppage name"
          />
        </td>
        <td className="px-3 py-2">
          <input
            value={editRow.pickup}
            onChange={e => setEditRow(p => ({ ...p, pickup: e.target.value }))}
            className="w-28 px-2.5 py-1.5 text-[12px] rounded-lg border border-blue-200 focus:border-blue-400 outline-none bg-white"
            placeholder="07:00 AM"
          />
        </td>
        <td className="px-3 py-2">
          <input
            value={editRow.drop}
            onChange={e => setEditRow(p => ({ ...p, drop: e.target.value }))}
            className="w-28 px-2.5 py-1.5 text-[12px] rounded-lg border border-blue-200 focus:border-blue-400 outline-none bg-white"
            placeholder="02:30 PM"
          />
        </td>
        <td className="px-3 py-2">
          <div className="flex flex-wrap gap-1 min-w-[180px]">
            {TRANSPORT_TYPES.map(t => {
              const active = editRow.types.includes(t.id)
              const { bg, fg } = TYPE_COLORS[t.id]
              return (
                <button key={t.id} type="button"
                  onClick={() => setEditRow(p => ({
                    ...p,
                    types: active ? p.types.filter(x => x !== t.id) : [...p.types, t.id]
                  }))}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold border-2 transition-all"
                  style={active
                    ? { background: bg, color: fg, borderColor: fg + '55' }
                    : { background: '#f8fafc', color: '#94a3b8', borderColor: '#e2e8f0' }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </td>
        <td className="px-3 py-2">
          <NativeSelect value={editRow.slab} onChange={e => setEditRow(p => ({ ...p, slab: e.target.value }))}>
            {slabs.filter(s => s.id).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </NativeSelect>
        </td>
        <td className="px-3 py-2">
          <input
            value={editRow.fee}
            onChange={e => setEditRow(p => ({ ...p, fee: e.target.value }))}
            className="w-24 px-2.5 py-1.5 text-[12px] rounded-lg border border-blue-200 focus:border-blue-400 outline-none bg-white mono"
            placeholder="0"
            type="number"
          />
        </td>
        <td className="px-3 py-2">
          <div className="flex items-center gap-1.5">
            <button onClick={() => onUpdate(editRow)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              <Save className="w-3 h-3" /> Update
            </button>
            <button onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-bold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors">
              <Ban className="w-3 h-3" /> Cancel
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
      <td className="px-3 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
          </span>
          <span className="text-[13px] font-semibold text-slate-700 whitespace-nowrap">{row.stoppage}</span>
        </div>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg whitespace-nowrap">
          <Clock className="w-3 h-3" />{row.pickup}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg whitespace-nowrap">
          <Clock className="w-3 h-3" />{row.drop}
        </span>
      </td>
      <td className="px-3 py-3"><TypeBadges types={row.types} /></td>
      <td className="px-3 py-3">
        <span className="text-[12px] font-semibold text-violet-700 bg-violet-50 px-2 py-1 rounded-lg whitespace-nowrap">
          {slabLabel(row.slab)}
        </span>
      </td>
      <td className="px-3 py-3 text-center">
        <span className="inline-flex items-center gap-1 text-[13px] font-bold text-slate-800 mono">
          <IndianRupee className="w-3 h-3 text-slate-500" />{row.fee.toLocaleString()}
        </span>
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(row)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100">
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          <button onClick={() => onDelete(row.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors border border-rose-100">
            <Trash2 className="w-3 h-3" /> Del
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────

function MobileCard({ row, idx, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // close menu on outside click
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm anim-slide">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
          <MapPin className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 leading-tight truncate">{row.stoppage}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{slabLabel(row.slab)}</p>
        </div>
        {/* Fee */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[18px] font-bold text-blue-700 mono leading-tight">₹{row.fee.toLocaleString()}</span>
          <span className="text-[10px] text-slate-400">per month</span>
        </div>
        {/* 3-dot menu */}
        <div ref={menuRef} className="relative ml-1 flex-shrink-0">
          <button onClick={() => setMenuOpen(p => !p)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-20 rounded-xl border border-slate-200 bg-white shadow-xl min-w-[130px] py-1 anim-fade">
              <button onClick={() => { onEdit(row); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-[13px] font-semibold text-blue-600 hover:bg-blue-50 transition-colors">
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => { onDelete(row.id); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-[13px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick info row */}
      <div className="grid grid-cols-2 gap-2 px-4 pb-3">
        <div className="flex items-center gap-2 bg-emerald-50 rounded-xl px-3 py-2">
          <Clock className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-wide">Pickup</p>
            <p className="text-[12px] font-bold text-emerald-800">{row.pickup}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-50 rounded-xl px-3 py-2">
          <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
          <div>
            <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide">Drop</p>
            <p className="text-[12px] font-bold text-amber-800">{row.drop}</p>
          </div>
        </div>
      </div>

      {/* Transport types */}
      <div className="px-4 pb-3">
        <TypeBadges types={row.types} />
      </div>

      {/* Expand toggle */}
      <button
        onClick={() => setExpanded(p => !p)}
        className="flex items-center justify-center gap-1 w-full py-2 border-t border-slate-100 text-[11px] font-semibold text-slate-400 hover:bg-slate-50 transition-colors"
      >
        {expanded ? 'Hide details' : 'More details'}
        <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 anim-fade">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Slab</p>
              <p className="text-[12px] font-semibold text-violet-700">{slabLabel(row.slab)}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mb-1">Fee</p>
              <p className="text-[13px] font-bold text-slate-800 mono">₹{row.fee.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE EDIT DRAWER ───────────────────────────────────────────────────────

function EditDrawer({ row, onSave, onClose }) {
  const [form, setForm] = useState({ ...row })
  const allSelected = form.types.length === TRANSPORT_TYPES.length

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm anim-fade" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white border-t border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto anim-drawer">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-blue-600" />
            <span className="text-[14px] font-bold text-slate-800">Edit Stoppage</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <Field label="Stoppage Name" icon={MapPin}>
            <input value={form.stoppage} onChange={e => setForm(p => ({ ...p, stoppage: e.target.value }))}
              className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Pick Up Time" icon={Clock}>
              <input value={form.pickup} onChange={e => setForm(p => ({ ...p, pickup: e.target.value }))}
                className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="07:00 AM" />
            </Field>
            <Field label="Drop Time" icon={Clock}>
              <input value={form.drop} onChange={e => setForm(p => ({ ...p, drop: e.target.value }))}
                className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none" placeholder="02:30 PM" />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Fee (₹)" icon={IndianRupee}>
              <input type="number" value={form.fee} onChange={e => setForm(p => ({ ...p, fee: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none mono" />
            </Field>
            <Field label="Slab" icon={Layers}>
              <NativeSelect value={form.slab} onChange={e => setForm(p => ({ ...p, slab: e.target.value }))}>
                {SLABS.filter(s => s.id).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </NativeSelect>
            </Field>
          </div>
          <Field label="Transport Type" icon={Bus}>
            <TransportTypeSelector
              selected={form.types}
              onChange={(types) => setForm(p => ({ ...p, types }))}
              selectAll={allSelected}
              onSelectAll={() => setForm(p => ({
                ...p,
                types: allSelected ? [] : TRANSPORT_TYPES.map(t => t.id)
              }))}
            />
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onSave(form); onClose() }}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all active:scale-95">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, session, setSession, onLoad, loading, error }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white border-t border-slate-200 shadow-2xl anim-drawer">
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="text-[14px] font-bold text-slate-800">Session Filter</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-5">
          <Field label="Academic Session" error={error} required icon={Filter}>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={error}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700">Cancel</button>
          <button onClick={() => { onLoad(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all active:scale-95">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Load
          </button>
        </div>
      </div>
    </>
  )
}

// ─── ADD FORM ────────────────────────────────────────────────────────────────

const defaultForm = () => ({
  stoppage: '', pickup: '', drop: '', charges: '', slab: '', types: []
})

function AddForm({ session, onSave, loading }) {
  const [form, setForm] = useState(defaultForm())
  const [errors, setErrors] = useState({})
  const [mobileOpen, setMobileOpen] = useState(false)
  const allSelected = form.types.length === TRANSPORT_TYPES.length

  const validate = () => {
    const e = {}
    if (!form.stoppage.trim()) e.stoppage = 'Required'
    if (!form.charges || isNaN(Number(form.charges))) e.charges = 'Enter valid amount'
    if (!form.slab) e.slab = 'Required'
    if (form.types.length === 0) e.types = 'Select at least one'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    onSave({ ...form, fee: Number(form.charges) })
    setForm(defaultForm())
    setMobileOpen(false)
  }

  const FormContent = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Field label="Stoppage Name" error={errors.stoppage} required icon={MapPin}>
          <input
            value={form.stoppage}
            onChange={e => setForm(p => ({ ...p, stoppage: e.target.value }))}
            className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              ${errors.stoppage ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
            placeholder="e.g. Civil Lines Bus Stop"
          />
        </Field>
        <Field label="Pick Up Time" icon={Clock}>
          <input
            value={form.pickup}
            onChange={e => setForm(p => ({ ...p, pickup: e.target.value }))}
            className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            placeholder="07:00 AM"
          />
        </Field>
        <Field label="Drop Time" icon={Clock}>
          <input
            value={form.drop}
            onChange={e => setForm(p => ({ ...p, drop: e.target.value }))}
            className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
            placeholder="02:30 PM"
          />
        </Field>
        <Field label="Charges (₹)" error={errors.charges} required icon={IndianRupee}>
          <input
            type="number"
            value={form.charges}
            onChange={e => setForm(p => ({ ...p, charges: e.target.value }))}
            className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all mono
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              ${errors.charges ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
            placeholder="0"
          />
        </Field>
        <Field label="Select Slab" error={errors.slab} required icon={Layers}>
          <NativeSelect
            value={form.slab}
            onChange={e => setForm(p => ({ ...p, slab: e.target.value }))}
            placeholder="-- Select Slab --"
            error={errors.slab}
          >
            {SLABS.filter(s => s.id).map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
          </NativeSelect>
        </Field>
      </div>

      {/* Transport Type */}
      <Field label="Transport Type" error={errors.types} icon={Bus}>
        <div className={`p-3 rounded-xl border transition-all ${errors.types ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50/50'}`}>
          <TransportTypeSelector
            selected={form.types}
            onChange={(types) => setForm(p => ({ ...p, types }))}
            selectAll={allSelected}
            onSelectAll={() => setForm(p => ({
              ...p,
              types: allSelected ? [] : TRANSPORT_TYPES.map(t => t.id)
            }))}
          />
        </div>
      </Field>

      {/* Actions */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={handleSubmit}
          disabled={loading || !session}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white
            bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
            disabled:opacity-60 transition-all active:scale-95"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Add Stoppage
        </button>
        <button
          onClick={() => setForm(defaultForm())}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
            bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop: inline card */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Plus className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 flex-1">Add New Stoppage</span>
          {!session && (
            <span className="text-[11px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> Select session first
            </span>
          )}
        </div>
        <div className="p-5">{FormContent}</div>
      </div>

      {/* Mobile: FAB + drawer */}
      <div className="sm:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed bottom-6 right-5 z-30 flex items-center gap-2 px-5 py-3.5 rounded-2xl
            bg-blue-600 text-white font-bold text-[13px] shadow-xl shadow-blue-500/30 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Stoppage
        </button>

        {mobileOpen && (
          <>
            <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white border-t border-slate-200 shadow-2xl max-h-[92vh] overflow-y-auto anim-drawer">
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 rounded-full bg-slate-200" />
              </div>
              <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span className="text-[14px] font-bold text-slate-800">Add New Stoppage</span>
                </div>
                <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="px-5 py-4">{FormContent}</div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function StoppageMaster() {
  const [session,     setSession]     = useState('')
  const [records,     setRecords]     = useState([])
  const [loading,     setLoading]     = useState(false)
  const [submitting,  setSubmitting]  = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [filterError, setFilterError] = useState('')
  const [shown,       setShown]       = useState(false)
  const [shownSession, setShownSession] = useState('')
  const [editRow,     setEditRow]     = useState(null)
  const [mobileEditRow, setMobileEditRow] = useState(null)
  const [toast,       setToast]       = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }, [])

  // Load records for session
  const handleLoad = useCallback(() => {
    if (!session) { setFilterError('Please select a session'); return }
    setFilterError('')
    setLoading(true)
    setSearch('')
    setTimeout(() => {
      const data = DUMMY_RECORDS[session] ? [...DUMMY_RECORDS[session]] : []
      setRecords(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} stoppage(s) for session ${session}.`)
    }, 600)
  }, [session, showToast])

  const handleReset = () => {
    setSession(''); setRecords([]); setSearch('')
    setShown(false); setShownSession(''); setFilterError('')
  }

  // Add
  const handleAdd = useCallback((form) => {
    setSubmitting(true)
    setTimeout(() => {
      const newRec = { id: nextId++, stoppage: form.stoppage, pickup: form.pickup, drop: form.drop, types: form.types, slab: form.slab, fee: form.fee }
      setRecords(p => [...p, newRec])
      setSubmitting(false)
      showToast(`"${form.stoppage}" added successfully.`)
    }, 400)
  }, [showToast])

  // Edit
  const handleEdit = useCallback((row) => {
    setEditRow({ ...row })
  }, [])

  const handleMobileEdit = useCallback((row) => {
    setMobileEditRow({ ...row })
  }, [])

  // Update
  const handleUpdate = useCallback((updated) => {
    setRecords(p => p.map(r => r.id === updated.id ? { ...r, ...updated, fee: Number(updated.fee) } : r))
    setEditRow(null)
    showToast(`"${updated.stoppage}" updated.`)
  }, [showToast])

  const handleMobileUpdate = useCallback((updated) => {
    setRecords(p => p.map(r => r.id === updated.id ? { ...r, ...updated } : r))
    showToast(`"${updated.stoppage}" updated.`)
  }, [showToast])

  // Delete
  const handleDelete = useCallback((id) => {
    setRecords(p => p.filter(r => r.id !== id))
    showToast('Stoppage deleted.', 'error')
  }, [showToast])

  // Excel export placeholder
  const handleExport = () => {
    if (!records.length) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // Search filter
  const filtered = useMemo(() => {
    if (!search) return records
    const q = search.toLowerCase()
    return records.filter(r => r.stoppage.toLowerCase().includes(q) || r.types.some(t => typeName(t).toLowerCase().includes(q)))
  }, [records, search])

  const hasResults = shown && !loading

  return (
    <div className="space-y-4 pb-24 sm:pb-10">

      {/* ── Page Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600" />
            Stoppage Master
          </h1>
          <p className="text-[13px] text-slate-500 mt-0.5">
            Transport stoppages — manage pick-up & drop times, charges, and transport types.
          </p>
        </div>
        {hasResults && (
          <button onClick={handleExport} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Download Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 flex-1">Select Session</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Academic Session" error={filterError} required icon={Filter}>
              <NativeSelect value={session} onChange={e => { setSession(e.target.value); setFilterError('') }} placeholder="-- Select Session --" error={filterError}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <div /><div />
            <div className="flex gap-2">
              <button onClick={handleLoad} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Load
              </button>
              <button onClick={handleReset}
                className="flex items-center justify-center px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ── */}
      <div className="flex sm:hidden gap-2">
        <button onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold
            bg-blue-600 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Session'}
        </button>
        {hasResults && (
          <>
            <button onClick={handleExport} disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-bold bg-emerald-600 text-white disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
            <button onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <FilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        onLoad={handleLoad} loading={loading} error={filterError}
      />

      {/* ── Add Form (always visible after session selected, or show prompt) ── */}
      {(shown || session) && (
        <AddForm session={session || shownSession} onSave={handleAdd} loading={submitting} />
      )}

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3">
          <div className="h-14 rounded-xl bg-slate-100 animate-pulse mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ── */}
      {hasResults && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatCard icon={MapPin}       label="Total Stoppages"  value={filtered.length}                            color="blue"    />
            <StatCard icon={Bus}          label="Routes Covered"   value={new Set(filtered.flatMap(r => r.types)).size} color="emerald" />
            <StatCard icon={IndianRupee}  label="Avg Fee"          value={filtered.length ? `₹${Math.round(filtered.reduce((s,r) => s+r.fee,0) / filtered.length).toLocaleString()}` : '—'} color="amber" />
            <StatCard icon={TrendingUp}   label="Max Fee"          value={filtered.length ? `₹${Math.max(...filtered.map(r=>r.fee)).toLocaleString()}` : '—'} color="violet" />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Navigation className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700">Stoppage Records</span>
                <span className="text-[13px] text-slate-400">· {shownSession}</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search stoppage or type…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border border-slate-200
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none bg-white"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 bg-blue-50/20">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700">
                Hover a row to reveal Edit / Delete actions. Click Edit to modify inline.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      {['Sr No.', 'Stoppage Name', 'Pick Up Time', 'Drop Time', 'Transport Type', 'Slab', 'Fee (₹)', 'Action'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap first:w-10">
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
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onUpdate={handleUpdate}
                        onCancel={() => setEditRow(null)}
                        editRow={editRow}
                        setEditRow={setEditRow}
                        slabs={SLABS}
                      />
                    ))}
                  </tbody>
                  {/* Footer totals */}
                  <tfoot>
                    <tr className="border-t-2 border-blue-100 bg-blue-50/60">
                      <td className="px-3 py-2.5 text-center text-[12px] text-blue-400">—</td>
                      <td className="px-3 py-2.5" colSpan={5}>
                        <span className="text-[12px] font-bold text-blue-700 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5" /> Total — {filtered.length} stoppages
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="text-[13px] font-bold text-blue-800 mono bg-blue-100 px-3 py-1 rounded-lg">
                          ₹{filtered.reduce((s, r) => s + r.fee, 0).toLocaleString()}
                        </span>
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap ⋮ on any card to Edit or Delete.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard
                      key={row.id}
                      row={row}
                      idx={i + 1}
                      onEdit={handleMobileEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                  {/* Mobile grand total */}
                  <div className="rounded-xl border-2 border-blue-200 bg-blue-50 p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 mb-2 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Stoppages
                    </p>
                    <p className="text-[22px] font-bold text-blue-800 mono">
                      ₹{filtered.reduce((s, r) => s + r.fee, 0).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-blue-600 font-semibold">Total Monthly Collection</p>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[12px] text-slate-400">
                Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700">{records.length}</span> records
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="text-[12px] text-blue-600 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
            <Bus className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500">No stoppage records loaded</p>
            <p className="text-[12px] text-slate-400 mt-1">
              Select a session and click <strong>Load</strong> to view stoppage data.
            </p>
          </div>
        </div>
      )}

      {/* Mobile Edit Drawer */}
      {mobileEditRow && (
        <EditDrawer
          row={mobileEditRow}
          onSave={handleMobileUpdate}
          onClose={() => setMobileEditRow(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
