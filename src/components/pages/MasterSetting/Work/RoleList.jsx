/**
 * RoleList.jsx
 * Converts legacy ASPX "Role List" (Designation Management) page to
 * fully-responsive React + Tailwind.
 *
 * Columns: Sr No, Design Name, Design Code, Display Name, Desig Order, Actions
 * Features:
 *  - Inline row editing (Edit / Submit / Cancel)
 *  - Search/filter bar
 *  - Add new role modal
 *  - Toast notifications
 *  - Desktop: dense ERP table with sticky header
 *  - Mobile: card-based layout with expandable edit form
 *  - Full responsive — no horizontal scroll on mobile
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Search, X, Edit2, Check, XCircle, Plus,
  ChevronDown, ChevronUp, AlertCircle, Loader2,
  ShieldCheck, RefreshCw, SlidersHorizontal,
  ArrowUpDown, Info, BookOpen, UserCog, Hash,
  Tag, ListOrdered, MoreVertical, Filter
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const INITIAL_ROLES = [
  { id: 1, Design_Name: 'Principal',          Design_Code: 'PRIN',  DisplayName: 'Principal',            Desig_Order: 1  },
  { id: 2, Design_Name: 'Vice Principal',     Design_Code: 'VPRIN', DisplayName: 'Vice Principal',       Desig_Order: 2  },
  { id: 3, Design_Name: 'Head of Department', Design_Code: 'HOD',   DisplayName: 'HOD',                  Desig_Order: 3  },
  { id: 4, Design_Name: 'Senior Teacher',     Design_Code: 'SRTCH', DisplayName: 'Sr. Teacher',          Desig_Order: 4  },
  { id: 5, Design_Name: 'Teacher',            Design_Code: 'TEACH', DisplayName: 'Teacher',              Desig_Order: 5  },
  { id: 6, Design_Name: 'Assistant Teacher',  Design_Code: 'ASTCH', DisplayName: 'Asst. Teacher',        Desig_Order: 6  },
  { id: 7, Design_Name: 'Librarian',          Design_Code: 'LIBR',  DisplayName: 'Librarian',            Desig_Order: 7  },
  { id: 8, Design_Name: 'Lab Assistant',      Design_Code: 'LABAS', DisplayName: 'Lab Assistant',        Desig_Order: 8  },
  { id: 9, Design_Name: 'Clerk',              Design_Code: 'CLERK', DisplayName: 'Office Clerk',         Desig_Order: 9  },
  { id: 10, Design_Name: 'Peon',             Design_Code: 'PEON',  DisplayName: 'Office Boy',           Desig_Order: 10 },
  { id: 11, Design_Name: 'Guard',            Design_Code: 'GUARD', DisplayName: 'Security Guard',       Desig_Order: 11 },
  { id: 12, Design_Name: 'Driver',           Design_Code: 'DRVR',  DisplayName: 'Bus Driver',           Desig_Order: 12 },
]

// ─── COLOUR HELPERS ───────────────────────────────────────────────────────────
const BADGE_COLORS = [
  { bg: 'bg-blue-50 dark:bg-blue-500/10',   text: 'text-blue-700 dark:text-blue-400',   ring: 'ring-blue-200 dark:ring-blue-500/30'   },
  { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400', ring: 'ring-violet-200 dark:ring-violet-500/30' },
  { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', ring: 'ring-emerald-200 dark:ring-emerald-500/30' },
  { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', ring: 'ring-amber-200 dark:ring-amber-500/30'   },
  { bg: 'bg-cyan-50 dark:bg-cyan-500/10',   text: 'text-cyan-700 dark:text-cyan-400',   ring: 'ring-cyan-200 dark:ring-cyan-500/30'   },
  { bg: 'bg-rose-50 dark:bg-rose-500/10',   text: 'text-rose-700 dark:text-rose-400',   ring: 'ring-rose-200 dark:ring-rose-500/30'   },
]
const roleColor = (name = '') => BADGE_COLORS[(name.charCodeAt(0) ?? 0) % BADGE_COLORS.length]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success'
          ? 'bg-emerald-600 text-white'
          : type === 'error'
          ? 'bg-rose-600 text-white'
          : 'bg-slate-800 text-white'}`}
      style={{ animation: 'toastUp .25s ease' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

/** Inline text input — used in desktop table edit row & modal */
function InlineInput({ value, onChange, placeholder, error, className = '' }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-2.5 py-1.5 text-[12px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
        ${className}`}
    />
  )
}

/** Order number input */
function OrderInput({ value, onChange, error }) {
  return (
    <input
      type="number"
      min={1}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`w-16 px-2 py-1.5 text-[12px] rounded-lg border outline-none transition-all text-center
        bg-white text-slate-800
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
    />
  )
}

// ─── ADD ROLE MODAL ───────────────────────────────────────────────────────────
function AddRoleModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ Design_Name: '', Design_Code: '', DisplayName: '', Desig_Order: '' })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const firstRef = useRef(null)

  useEffect(() => { firstRef.current?.focus() }, [])

  const set = (key) => (val) => setForm(p => ({ ...p, [key]: val }))

  const validate = () => {
    const e = {}
    if (!form.Design_Name.trim())  e.Design_Name  = 'Required'
    if (!form.Design_Code.trim())  e.Design_Code  = 'Required'
    if (!form.DisplayName.trim())  e.DisplayName  = 'Required'
    if (!form.Desig_Order || isNaN(Number(form.Desig_Order))) e.Desig_Order = 'Valid number required'
    return e
  }

  const handleSubmit = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setSaving(true)
    // Simulate API
    setTimeout(() => {
      onAdd({ ...form, Desig_Order: Number(form.Desig_Order) })
      setSaving(false)
      onClose()
    }, 600)
  }

  const fields = [
    { key: 'Design_Name',  label: 'Design Name',  placeholder: 'e.g. Senior Teacher', icon: UserCog   },
    { key: 'Design_Code',  label: 'Design Code',  placeholder: 'e.g. SRTCH',          icon: Hash      },
    { key: 'DisplayName',  label: 'Display Name', placeholder: 'e.g. Sr. Teacher',    icon: Tag       },
    { key: 'Desig_Order',  label: 'Order',        placeholder: 'e.g. 5',              icon: ListOrdered, numeric: true },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" onClick={onClose} />

      {/* Modal */}
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-md mx-auto
          bg-white dark:bg-[#1a1f35] rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
          shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn .2s ease' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(calc(-50% + 12px))}to{opacity:1;transform:translateY(-50%)}}`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center">
              <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">Add New Role</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Fill in the designation details below.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-5 space-y-4">
          {fields.map(({ key, label, placeholder, icon: Icon, numeric }, i) => (
            <div key={key} className="space-y-1">
              <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Icon className="w-3 h-3" /> {label} <span className="text-rose-500">*</span>
              </label>
              {numeric
                ? <OrderInput value={form[key]} onChange={set(key)} error={errors[key]} />
                : <InlineInput
                    ref={i === 0 ? firstRef : undefined}
                    value={form[key]}
                    onChange={set(key)}
                    placeholder={placeholder}
                    error={errors[key]}
                    className="text-[13px] py-2"
                  />
              }
              {errors[key] && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500">
                  <AlertCircle className="w-3 h-3" /> {errors[key]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Save Role
          </button>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ role, idx, editData, onEdit, onCancel, onSave, onChange, saving }) {
  const isEditing = editData !== null
  const { bg, text } = roleColor(role.Design_Name)

  if (isEditing) {
    const e = editData._errors || {}
    return (
      <tr className="border-b border-blue-100 dark:border-indigo-500/20 bg-blue-50/40 dark:bg-indigo-500/[0.04]">
        <td className="px-4 py-2.5 text-center text-[12px] text-blue-500 font-semibold tabular-nums">{idx}</td>
        <td className="px-4 py-2.5">
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300">{role.Design_Name}</span>
        </td>
        <td className="px-3 py-2.5">
          <InlineInput value={editData.Design_Code} onChange={v => onChange('Design_Code', v)} error={e.Design_Code} />
          {e.Design_Code && <p className="text-[10px] text-rose-500 mt-0.5">{e.Design_Code}</p>}
        </td>
        <td className="px-3 py-2.5">
          <InlineInput value={editData.DisplayName} onChange={v => onChange('DisplayName', v)} error={e.DisplayName} />
          {e.DisplayName && <p className="text-[10px] text-rose-500 mt-0.5">{e.DisplayName}</p>}
        </td>
        <td className="px-3 py-2.5">
          <OrderInput value={editData.Desig_Order} onChange={v => onChange('Desig_Order', v)} error={e.Desig_Order} />
          {e.Desig_Order && <p className="text-[10px] text-rose-500 mt-0.5">{e.Desig_Order}</p>}
        </td>
        <td className="px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-all active:scale-95"
            >
              {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
              Submit
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              <X className="w-3 h-3" /> Cancel
            </button>
          </div>
        </td>
      </tr>
    )
  }

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold ring-1 ${bg} ${text} ${roleColor(role.Design_Name).ring}`}>
            {role.Design_Name.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{role.Design_Name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <code className="text-[12px] font-mono font-semibold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          {role.Design_Code}
        </code>
      </td>
      <td className="px-4 py-3 text-[13px] text-slate-600 dark:text-slate-300">{role.DisplayName}</td>
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-[12px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
          {role.Desig_Order}
        </span>
      </td>
      <td className="px-4 py-3">
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-white
            bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
            shadow-sm shadow-blue-500/20 transition-all active:scale-95 opacity-0 group-hover:opacity-100"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </button>
        {/* Fallback visible button for non-hover */}
        <button
          onClick={onEdit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-blue-700 dark:text-blue-400
            border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10
            hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-all active:scale-95 group-hover:hidden"
        >
          <Edit2 className="w-3 h-3" /> Edit
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ role, idx, editData, onEdit, onCancel, onSave, onChange, saving }) {
  const isEditing = editData !== null
  const { bg, text, ring } = roleColor(role.Design_Name)
  const e = editData?._errors || {}

  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm transition-all
      ${isEditing
        ? 'border-blue-200 dark:border-indigo-500/40 bg-blue-50/30 dark:bg-indigo-500/[0.04]'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'}`}
    >
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold ring-1 ${bg} ${text} ${ring}`}>
          {role.Design_Name.slice(0, 2).toUpperCase()}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{role.Design_Name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
            <code className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1.5 py-0.5 rounded">
              {role.Design_Code}
            </code>
            <span>·</span>
            <span>Order: <span className="font-semibold text-blue-600 dark:text-blue-400">{role.Desig_Order}</span></span>
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 text-right">{role.DisplayName}</span>
          {!isEditing && (
            <button
              onClick={onEdit}
              className="w-8 h-8 rounded-lg flex items-center justify-center
                bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400
                hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Edit Form — shown when editing */}
      {isEditing && (
        <div className="border-t border-blue-100 dark:border-indigo-500/20 px-4 py-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 flex items-center gap-1.5 mb-2">
            <Edit2 className="w-3 h-3" /> Edit Designation
          </p>

          {/* Design Code */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Hash className="w-2.5 h-2.5" /> Design Code <span className="text-rose-500">*</span>
            </label>
            <InlineInput
              value={editData.Design_Code}
              onChange={v => onChange('Design_Code', v)}
              placeholder="e.g. SRTCH"
              error={e.Design_Code}
              className="text-[13px] py-2.5"
            />
            {e.Design_Code && <p className="text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{e.Design_Code}</p>}
          </div>

          {/* Display Name */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" /> Display Name <span className="text-rose-500">*</span>
            </label>
            <InlineInput
              value={editData.DisplayName}
              onChange={v => onChange('DisplayName', v)}
              placeholder="e.g. Sr. Teacher"
              error={e.DisplayName}
              className="text-[13px] py-2.5"
            />
            {e.DisplayName && <p className="text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{e.DisplayName}</p>}
          </div>

          {/* Desig Order */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
              <ListOrdered className="w-2.5 h-2.5" /> Desig Order <span className="text-rose-500">*</span>
            </label>
            <OrderInput value={editData.Desig_Order} onChange={v => onChange('Desig_Order', v)} error={e.Desig_Order} />
            {e.Desig_Order && <p className="text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{e.Desig_Order}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-2">
            <button
              onClick={onSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Submit
            </button>
            <button
              onClick={onCancel}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function RoleList() {
  const [roles,      setRoles]      = useState(INITIAL_ROLES)
  const [editId,     setEditId]     = useState(null)
  const [editData,   setEditData]   = useState(null)
  const [saving,     setSaving]     = useState(false)
  const [search,     setSearch]     = useState('')
  const [sortField,  setSortField]  = useState('Desig_Order')
  const [sortDir,    setSortDir]    = useState('asc')
  const [showAdd,    setShowAdd]    = useState(false)
  const [toast,      setToast]      = useState(null)

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
  }, [])

  // ── Edit handlers ──────────────────────────────────────────────────────────
  const handleEdit = useCallback((role) => {
    setEditId(role.id)
    setEditData({ Design_Code: role.Design_Code, DisplayName: role.DisplayName, Desig_Order: role.Desig_Order, _errors: {} })
  }, [])

  const handleCancel = useCallback(() => {
    setEditId(null)
    setEditData(null)
  }, [])

  const handleChange = useCallback((key, value) => {
    setEditData(prev => ({ ...prev, [key]: value, _errors: { ...prev._errors, [key]: undefined } }))
  }, [])

  const validateEdit = (data) => {
    const e = {}
    if (!data.Design_Code?.trim()) e.Design_Code = 'Required'
    if (!data.DisplayName?.trim()) e.DisplayName = 'Required'
    if (!data.Desig_Order || isNaN(Number(data.Desig_Order))) e.Desig_Order = 'Valid number'
    return e
  }

  const handleSave = useCallback(() => {
    const e = validateEdit(editData)
    if (Object.keys(e).length) {
      setEditData(prev => ({ ...prev, _errors: e }))
      return
    }
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setRoles(prev => prev.map(r =>
        r.id === editId
          ? { ...r, Design_Code: editData.Design_Code.trim(), DisplayName: editData.DisplayName.trim(), Desig_Order: Number(editData.Desig_Order) }
          : r
      ))
      setEditId(null)
      setEditData(null)
      setSaving(false)
      showToast('Designation updated successfully.')
    }, 700)
  }, [editId, editData, showToast])

  // ── Add role ──────────────────────────────────────────────────────────────
  const handleAdd = useCallback((newRole) => {
    setRoles(prev => [
      ...prev,
      { ...newRole, id: Date.now() }
    ])
    showToast('New role added successfully.')
  }, [showToast])

  // ── Sort ──────────────────────────────────────────────────────────────────
  const toggleSort = useCallback((field) => {
    setSortField(prev => {
      if (prev === field) { setSortDir(d => d === 'asc' ? 'desc' : 'asc'); return field }
      setSortDir('asc'); return field
    })
  }, [])

  // ── Filtered + Sorted data ────────────────────────────────────────────────
  const displayed = useMemo(() => {
    let data = [...roles]
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r =>
        r.Design_Name.toLowerCase().includes(q) ||
        r.Design_Code.toLowerCase().includes(q) ||
        r.DisplayName.toLowerCase().includes(q)
      )
    }
    data.sort((a, b) => {
      const av = sortField === 'Desig_Order' ? a[sortField] : String(a[sortField])
      const bv = sortField === 'Desig_Order' ? b[sortField] : String(b[sortField])
      if (av < bv) return sortDir === 'asc' ? -1 : 1
      if (av > bv) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return data
  }, [roles, search, sortField, sortDir])

  const SORT_COLS = [
    { key: 'Design_Name',  label: 'Name'  },
    { key: 'Design_Code',  label: 'Code'  },
    { key: 'Desig_Order',  label: 'Order' },
  ]

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Role List
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage designations — edit codes, display names, and ordering.
          </p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white
            bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
            shadow-md shadow-blue-500/20 transition-all active:scale-95 flex-shrink-0 self-start"
        >
          <Plus className="w-4 h-4" /> Add Role
        </button>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: 'Total Roles',     value: roles.length,    icon: BookOpen,    color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10'    },
          { label: 'Showing',         value: displayed.length, icon: Filter,     color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
          { label: 'Currently Editing', value: editId ? 1 : 0, icon: Edit2,     color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-500/10'  },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm">
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </span>
            <div className="min-w-0">
              <p className={`text-[20px] font-bold tabular-nums leading-tight ${color}`}>{value}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Search & Filter Bar ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search &amp; Sort</span>
        </div>
        <div className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, code, or display name…"
              className="w-full pl-9 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort buttons */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide hidden sm:block">Sort:</span>
            {SORT_COLS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => toggleSort(key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold transition-all
                  ${sortField === key
                    ? 'bg-blue-100 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-400'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'}`}
              >
                {label}
                {sortField === key && (
                  sortDir === 'asc'
                    ? <ChevronUp className="w-3 h-3" />
                    : <ChevronDown className="w-3 h-3" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Data Table (Desktop) ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Designation Records</span>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
            {displayed.length} record{displayed.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Info hint */}
        <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Click <strong>Edit</strong> on any row to update Design Code, Display Name, or Order. Design Name is read-only.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No roles match your search.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {[
                    { label: 'Sr No',        key: null         },
                    { label: 'Design Name',  key: 'Design_Name' },
                    { label: 'Design Code',  key: 'Design_Code' },
                    { label: 'Display Name', key: null          },
                    { label: 'Desig Order',  key: 'Desig_Order' },
                    { label: 'Action',       key: null          },
                  ].map(({ label, key }, i) => (
                    <th
                      key={i}
                      onClick={() => key && toggleSort(key)}
                      className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                        ${i === 0 || i === 5 ? 'text-center w-20' : 'text-left'}
                        ${key ? 'cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 select-none' : ''}`}
                    >
                      <span className="flex items-center gap-1">
                        {label}
                        {key && (
                          sortField === key
                            ? (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)
                            : <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((role, i) => (
                  <DesktopRow
                    key={role.id}
                    role={role}
                    idx={i + 1}
                    editData={editId === role.id ? editData : null}
                    onEdit={() => handleEdit(role)}
                    onCancel={handleCancel}
                    onSave={handleSave}
                    onChange={handleChange}
                    saving={saving}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No roles match your search.</span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap the pencil icon on any card to edit.
              </p>
              {displayed.map((role, i) => (
                <MobileCard
                  key={role.id}
                  role={role}
                  idx={i + 1}
                  editData={editId === role.id ? editData : null}
                  onEdit={() => handleEdit(role)}
                  onCancel={handleCancel}
                  onSave={handleSave}
                  onChange={handleChange}
                  saving={saving}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{displayed.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{roles.length}</span> roles
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* ── Add Modal ─────────────────────────────────────────────────────────── */}
      {showAdd && (
        <AddRoleModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
        />
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
