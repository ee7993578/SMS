/**
 * VehicleMaster.jsx
 * Folder: src/pages/Transport/VehicleMaster.jsx
 *
 * Converts legacy ASPX "Vehicle Master" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Transport Type dropdown (required)
 *  - Vehicle No input (required)
 *  - Vehicle Name input
 *  - Submit / Edit / Delete / Update / Cancel actions
 *  - Inline GridView → Desktop table + Mobile cards
 *  - Toast notifications
 *  - Loading states, empty states
 *  - Mobile filter drawer
 *  - Search across table
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Bus, ChevronDown, AlertCircle, X, Check, Loader2,
  Plus, Search, RefreshCw, Pencil, Trash2, Save,
  SlidersHorizontal, Info, ChevronRight,
  Car, Truck, ShieldCheck, Filter, Hash,
  FileText, Eye, MoreVertical, CheckCircle2
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const TRANSPORT_TYPES = [
  { id: '0', label: '-- Select Transport Type --' },
  { id: '1', label: 'School Bus' },
  { id: '2', label: 'Mini Bus' },
  { id: '3', label: 'Van' },
  { id: '4', label: 'Auto' },
  { id: '5', label: 'Private Vehicle' },
]

const INITIAL_VEHICLES = [
  { id: 1, transport_type: 'School Bus', vehicle_no: 'UK07PA1234', vehicle_name: 'Tata Starbus 1' },
  { id: 2, transport_type: 'School Bus', vehicle_no: 'UK07PA5678', vehicle_name: 'Tata Starbus 2' },
  { id: 3, transport_type: 'Mini Bus',   vehicle_no: 'UK07CB2341', vehicle_name: 'Force Traveller A' },
  { id: 4, transport_type: 'Mini Bus',   vehicle_no: 'UK07CB9982', vehicle_name: 'Force Traveller B' },
  { id: 5, transport_type: 'Van',        vehicle_no: 'UK07BA4421', vehicle_name: 'Maruti Eeco 1' },
  { id: 6, transport_type: 'Van',        vehicle_no: 'UK07BA8814', vehicle_name: 'Maruti Eeco 2' },
  { id: 7, transport_type: 'Auto',       vehicle_no: 'UK07D11223', vehicle_name: 'E-Rickshaw Alpha' },
  { id: 8, transport_type: 'Private Vehicle', vehicle_no: 'DL01AB3344', vehicle_name: 'Toyota Innova' },
]

// ─── TYPE → COLOR MAP ─────────────────────────────────────────────────────────
const TYPE_COLORS = {
  'School Bus':      { fg: '#1d4ed8', bg: '#dbeafe', icon: Bus },
  'Mini Bus':        { fg: '#7c3aed', bg: '#ede9fe', icon: Bus },
  'Van':             { fg: '#0891b2', bg: '#cffafe', icon: Car },
  'Auto':            { fg: '#d97706', bg: '#fef3c7', icon: Car },
  'Private Vehicle': { fg: '#059669', bg: '#d1fae5', icon: Truck },
}
const typeStyle = (t) => TYPE_COLORS[t] || { fg: '#64748b', bg: '#f1f5f9', icon: Bus }

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, error, disabled }) {
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
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="ml-1 text-[10px] font-normal normal-case text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">
            {hint}
          </span>
        )}
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

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="ml-1 opacity-75 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── CONFIRM MODAL ────────────────────────────────────────────────────────────
function ConfirmModal({ open, vehicle, onConfirm, onCancel }) {
  if (!open || !vehicle) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6"
          style={{ animation: 'fadeIn .2s ease' }}
        >
          <div className="flex items-center gap-3 mb-4">
            <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            </span>
            <div>
              <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Delete Vehicle?</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3 mb-5">
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{vehicle.vehicle_no}</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">{vehicle.transport_type} · {vehicle.vehicle_name || '—'}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button onClick={onConfirm}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </>
  )
}

// ─── TRANSPORT TYPE BADGE ─────────────────────────────────────────────────────
function TypeBadge({ type, size = 'sm' }) {
  const { fg, bg, icon: Icon } = typeStyle(type)
  const abbr = type?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (size === 'lg') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold"
        style={{ background: bg, color: fg }}>
        <Icon className="w-3.5 h-3.5" />
        {type}
      </span>
    )
  }
  return (
    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
      style={{ background: bg, color: fg }}>
      {abbr}
    </span>
  )
}

// ─── DESKTOP TABLE ROW (normal + edit) ────────────────────────────────────────
function DesktopRow({ row, idx, editId, editData, setEditData, onEditStart, onEditSave, onEditCancel, onDelete }) {
  const isEditing = editId === row.id

  if (isEditing) {
    return (
      <tr className="bg-blue-50/60 dark:bg-indigo-500/[0.05] border-b border-blue-100 dark:border-indigo-500/20">
        <td className="px-4 py-2.5 text-center text-[12px] text-slate-400">{idx}</td>
        {/* Transport Type Edit */}
        <td className="px-4 py-2.5">
          <NativeSelect
            value={editData.transport_type_id}
            onChange={e => setEditData(p => ({ ...p, transport_type_id: e.target.value, transport_type: TRANSPORT_TYPES.find(t => t.id === e.target.value)?.label || '' }))}
          >
            {TRANSPORT_TYPES.slice(1).map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </NativeSelect>
        </td>
        {/* Vehicle No Edit */}
        <td className="px-4 py-2.5">
          <input
            value={editData.vehicle_no}
            onChange={e => setEditData(p => ({ ...p, vehicle_no: e.target.value.replace(/'/g, '') }))}
            className="w-full px-3 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Vehicle No."
          />
        </td>
        {/* Vehicle Name Edit */}
        <td className="px-4 py-2.5">
          <input
            value={editData.vehicle_name}
            onChange={e => setEditData(p => ({ ...p, vehicle_name: e.target.value }))}
            className="w-full px-3 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            placeholder="Vehicle Name"
          />
        </td>
        {/* Actions */}
        <td className="px-4 py-2.5">
          <div className="flex items-center justify-center gap-2">
            <button onClick={onEditSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
              <Save className="w-3.5 h-3.5" /> Update
            </button>
            <button onClick={onEditCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
          </div>
        </td>
      </tr>
    )
  }

  const { fg, bg } = typeStyle(row.transport_type)

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Transport Type */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <TypeBadge type={row.transport_type} />
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.transport_type}</span>
        </div>
      </td>

      {/* Vehicle No */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tracking-wide">
          <Hash className="w-3 h-3 opacity-50" />
          {row.vehicle_no}
        </span>
      </td>

      {/* Vehicle Name */}
      <td className="px-4 py-3">
        <span className="text-[13px] text-slate-600 dark:text-slate-300">{row.vehicle_name || <span className="text-slate-300 dark:text-slate-600 italic">—</span>}</span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditStart(row)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => onDelete(row)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[12px] font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE VEHICLE CARD ──────────────────────────────────────────────────────
function MobileCard({ row, idx, editId, editData, setEditData, onEditStart, onEditSave, onEditCancel, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const isEditing = editId === row.id
  const { fg, bg, icon: Icon } = typeStyle(row.transport_type)

  if (isEditing) {
    return (
      <div className="rounded-xl border-2 border-blue-300 dark:border-indigo-500/40 bg-blue-50/50 dark:bg-indigo-500/[0.05] overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-blue-200 dark:border-indigo-500/20 bg-blue-100/50 dark:bg-blue-500/[0.07]">
          <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400">Editing Vehicle #{idx}</span>
        </div>
        <div className="p-4 space-y-3">
          <Field label="Transport Type" required>
            <NativeSelect
              value={editData.transport_type_id}
              onChange={e => setEditData(p => ({ ...p, transport_type_id: e.target.value, transport_type: TRANSPORT_TYPES.find(t => t.id === e.target.value)?.label || '' }))}
            >
              {TRANSPORT_TYPES.slice(1).map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Vehicle No." required>
            <input
              value={editData.vehicle_no}
              onChange={e => setEditData(p => ({ ...p, vehicle_no: e.target.value.replace(/'/g, '') }))}
              className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. UK07PA1234"
            />
          </Field>
          <Field label="Vehicle Name">
            <input
              value={editData.vehicle_name}
              onChange={e => setEditData(p => ({ ...p, vehicle_name: e.target.value }))}
              className="w-full px-3 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              placeholder="e.g. Tata Starbus 1"
            />
          </Field>
        </div>
        <div className="flex gap-3 px-4 py-3 border-t border-blue-200 dark:border-indigo-500/20">
          <button onClick={onEditCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button onClick={onEditSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors">
            <Save className="w-4 h-4" /> Update
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: bg }}>
          <Icon className="w-5 h-5" style={{ color: fg }} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight flex items-center gap-2 flex-wrap">
            <span className="font-mono tracking-wide">{row.vehicle_no}</span>
          </p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{row.transport_type}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">#{idx}</span>
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Type</p>
              <TypeBadge type={row.transport_type} size="lg" />
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Vehicle Name</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{row.vehicle_name || <span className="text-slate-400 italic text-[12px]">Not specified</span>}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button onClick={() => onEditStart(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors border border-blue-100 dark:border-blue-500/20">
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => onDelete(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors border border-rose-100 dark:border-rose-500/20">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function VehicleMaster() {
  // ── Form State ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({ transport_type_id: '0', vehicle_no: '', vehicle_name: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  // ── Data State ──────────────────────────────────────────────────────────────
  const [vehicles, setVehicles] = useState(INITIAL_VEHICLES)
  const nextId = useRef(INITIAL_VEHICLES.length + 1)

  // ── Edit State ──────────────────────────────────────────────────────────────
  const [editId, setEditId] = useState(null)
  const [editData, setEditData] = useState({})

  // ── UI State ─────────────────────────────────────────────────────────────────
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [filterOpen, setFilterOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!form.transport_type_id || form.transport_type_id === '0') err.transport_type_id = 'Please select transport type'
    if (!form.vehicle_no.trim()) err.vehicle_no = 'Vehicle No. is required'
    return err
  }

  // ── Submit ───────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setSubmitting(true)

    setTimeout(() => {
      const typeLabel = TRANSPORT_TYPES.find(t => t.id === form.transport_type_id)?.label || ''
      setVehicles(prev => [
        ...prev,
        {
          id: nextId.current++,
          transport_type: typeLabel,
          vehicle_no: form.vehicle_no.trim().toUpperCase(),
          vehicle_name: form.vehicle_name.trim(),
        }
      ])
      setForm({ transport_type_id: '0', vehicle_no: '', vehicle_name: '' })
      setSubmitting(false)
      showToast('Vehicle added successfully!')
    }, 600)
  }, [form])

  const handleReset = () => {
    setForm({ transport_type_id: '0', vehicle_no: '', vehicle_name: '' })
    setErrors({})
  }

  // ── Edit ──────────────────────────────────────────────────────────────────────
  const handleEditStart = (row) => {
    const typeId = TRANSPORT_TYPES.find(t => t.label === row.transport_type)?.id || '1'
    setEditId(row.id)
    setEditData({ ...row, transport_type_id: typeId })
  }

  const handleEditSave = () => {
    if (!editData.vehicle_no?.trim()) { showToast('Vehicle No. is required', 'error'); return }
    setVehicles(prev =>
      prev.map(v => v.id === editId
        ? { ...v, transport_type: editData.transport_type, vehicle_no: editData.vehicle_no.trim().toUpperCase(), vehicle_name: editData.vehicle_name?.trim() || '' }
        : v
      )
    )
    setEditId(null)
    setEditData({})
    showToast('Vehicle updated successfully!')
  }

  const handleEditCancel = () => {
    setEditId(null)
    setEditData({})
  }

  // ── Delete ────────────────────────────────────────────────────────────────────
  const handleDeleteClick = (row) => setDeleteTarget(row)
  const handleDeleteConfirm = () => {
    setVehicles(prev => prev.filter(v => v.id !== deleteTarget.id))
    setDeleteTarget(null)
    showToast('Vehicle deleted successfully!')
  }

  // ── Filter ────────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = vehicles
    if (typeFilter !== 'all') data = data.filter(v => v.transport_type === typeFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      data = data.filter(v =>
        v.vehicle_no.toLowerCase().includes(q) ||
        v.vehicle_name.toLowerCase().includes(q) ||
        v.transport_type.toLowerCase().includes(q)
      )
    }
    return data
  }, [vehicles, search, typeFilter])

  const transportTypes = useMemo(() => [...new Set(vehicles.map(v => v.transport_type))], [vehicles])
  const activeFilterCount = (typeFilter !== 'all' ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Vehicle Master
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage transport vehicles — add, edit and remove fleet records.
          </p>
        </div>
        {/* Stats pill */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <Car className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400">{vehicles.length} Vehicles</span>
          </div>
        </div>
      </div>

      {/* ── ADD VEHICLE FORM CARD ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Add New Vehicle</span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
            Fields marked <span className="text-rose-500 font-bold">*</span> are required
          </span>
        </div>

        <div className="p-5">
          {/* Form Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Transport Type */}
            <Field label="Transport Type" error={errors.transport_type_id} required>
              <NativeSelect
                value={form.transport_type_id}
                onChange={e => { setForm(p => ({ ...p, transport_type_id: e.target.value })); setErrors(p => ({ ...p, transport_type_id: undefined })) }}
                error={errors.transport_type_id}
              >
                {TRANSPORT_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Vehicle No */}
            <Field label="Vehicle No." error={errors.vehicle_no} required hint="No apostrophes">
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={form.vehicle_no}
                  onChange={e => { setForm(p => ({ ...p, vehicle_no: e.target.value.replace(/'/g, '').toUpperCase() })); setErrors(p => ({ ...p, vehicle_no: undefined })) }}
                  placeholder="e.g. UK07PA1234"
                  className={`w-full pl-9 pr-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                    bg-white text-slate-800 placeholder-slate-300 dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                    ${errors.vehicle_no ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                />
              </div>
            </Field>

            {/* Vehicle Name */}
            <Field label="Vehicle Name">
              <div className="relative">
                <Bus className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={form.vehicle_name}
                  onChange={e => setForm(p => ({ ...p, vehicle_name: e.target.value }))}
                  placeholder="e.g. Tata Starbus 1"
                  className="w-full pl-9 pr-3 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none transition-all
                    bg-white text-slate-800 placeholder-slate-300 dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
                />
              </div>
            </Field>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
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
                title="Reset form"
                className="flex items-center justify-center px-3 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── VEHICLE LIST CARD ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Vehicle Records</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} of {vehicles.length}
            </span>
          </div>

          {/* Desktop Search + Filter */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {/* Type filter */}
            <div className="w-44">
              <NativeSelect value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="all">All Types</option>
                {transportTypes.map(t => <option key={t} value={t}>{t}</option>)}
              </NativeSelect>
            </div>
            {/* Search */}
            <div className="relative w-52">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search vehicles…"
                className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-xl border outline-none transition-all
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

          {/* Mobile Search Bar */}
          <div className="flex sm:hidden items-center gap-2 w-full">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search vehicles…"
                className="w-full pl-8 pr-7 py-2 text-[13px] rounded-xl border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600 dark:focus:border-indigo-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={() => setFilterOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold border transition-colors
                ${activeFilterCount > 0
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
            >
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="bg-white/25 text-white text-[10px] font-bold px-1 py-0.5 rounded-full">{activeFilterCount}</span>
              )}
            </button>
          </div>
        </div>

        {/* Info hint */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            <span className="hidden sm:inline">Hover a row to see Edit / Delete actions. </span>
            <span className="sm:hidden">Tap a card to see details and actions. </span>
            All changes are saved instantly.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No vehicles found.</span>
              {(search || typeFilter !== 'all') && (
                <button onClick={() => { setSearch(''); setTypeFilter('all') }} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['Sr. No.', 'Transport Type', 'Vehicle No.', 'Vehicle Name', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12 last:w-40">
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
                    editId={editId}
                    editData={editData}
                    setEditData={setEditData}
                    onEditStart={handleEditStart}
                    onEditSave={handleEditSave}
                    onEditCancel={handleEditCancel}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No vehicles found.</span>
              {(search || typeFilter !== 'all') && (
                <button onClick={() => { setSearch(''); setTypeFilter('all') }} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline mt-1">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to expand and manage the vehicle.
              </p>
              {filtered.map((row, i) => (
                <MobileCard
                  key={row.id}
                  row={row}
                  idx={i + 1}
                  editId={editId}
                  editData={editData}
                  setEditData={setEditData}
                  onEditStart={handleEditStart}
                  onEditSave={handleEditSave}
                  onEditCancel={handleEditCancel}
                  onDelete={handleDeleteClick}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{vehicles.length}</span> vehicles
          </p>
          {(search || typeFilter !== 'all') && (
            <button onClick={() => { setSearch(''); setTypeFilter('all') }}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear filters
            </button>
          )}
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ─────────────────────────────────────────────── */}
      {filterOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={() => setFilterOpen(false)} />
          <div
            className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
            style={{ animation: 'drawerUp .25s ease' }}
          >
            <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
            </div>
            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filter Vehicles</span>
              </div>
              <button onClick={() => setFilterOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="px-5 py-5">
              <Field label="Transport Type">
                <NativeSelect value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                  <option value="all">All Types</option>
                  {transportTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </NativeSelect>
              </Field>
            </div>
            <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
              <button onClick={() => { setTypeFilter('all'); setFilterOpen(false) }}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                Reset
              </button>
              <button onClick={() => setFilterOpen(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all">
                <Eye className="w-4 h-4" /> Apply
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── DELETE CONFIRM MODAL ─────────────────────────────────────────────── */}
      <ConfirmModal
        open={!!deleteTarget}
        vehicle={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
