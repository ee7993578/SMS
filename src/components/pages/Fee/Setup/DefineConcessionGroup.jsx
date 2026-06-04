/**
 * DefineConcessionGroup.jsx
 * Folder: src/pages/Fee/DefineConcessionGroup.jsx
 *
 * Converts legacy define_con_group.aspx → Modern React + Tailwind.
 *
 * Features:
 *  - Session + Main Group + Group Name + Late Fee Applicable form
 *  - Add New Main Group modal popup
 *  - GridView with inline Edit/Update/Cancel
 *  - Mobile: stacked card list with edit drawer
 *  - Desktop: dense ERP table
 *  - Full validation, toast feedback, loading states
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Plus, X, Check, AlertCircle, Loader2, ChevronDown,
  Edit3, Save, XCircle, Layers, RefreshCw, Search,
  BadgePercent, Building2, Tag, ToggleLeft, ToggleRight,
  ChevronRight, MoreVertical, CheckSquare, Square,
  ArrowRight, Filter, Info, Trash2
} from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const SESSIONS_LIST = ['2022-23', '2023-24', '2024-25', '2025-26']

const INITIAL_MAIN_GROUPS = [
  { id: 1, name: 'Staff Concession' },
  { id: 2, name: 'RTE Concession' },
  { id: 3, name: 'Sibling Concession' },
  { id: 4, name: 'Merit Concession' },
  { id: 5, name: 'SC/ST Concession' },
]

const INITIAL_GROUPS = [
  { id: 1, main_group_id: 1, main_group_name: 'Staff Concession',  Group_name: 'Teaching Staff',    group_code: 'GRP001', is_late_fee_applicable: true  },
  { id: 2, main_group_id: 1, main_group_name: 'Staff Concession',  Group_name: 'Non-Teaching Staff', group_code: 'GRP002', is_late_fee_applicable: false },
  { id: 3, main_group_id: 2, main_group_name: 'RTE Concession',    Group_name: 'RTE Full Waiver',   group_code: 'GRP003', is_late_fee_applicable: false },
  { id: 4, main_group_id: 3, main_group_name: 'Sibling Concession',Group_name: '2nd Child',         group_code: 'GRP004', is_late_fee_applicable: true  },
  { id: 5, main_group_id: 3, main_group_name: 'Sibling Concession',Group_name: '3rd Child',         group_code: 'GRP005', is_late_fee_applicable: true  },
  { id: 6, main_group_id: 4, main_group_name: 'Merit Concession',  Group_name: 'Class Topper',      group_code: 'GRP006', is_late_fee_applicable: false },
  { id: 7, main_group_id: 5, main_group_name: 'SC/ST Concession',  Group_name: 'SC Students',       group_code: 'GRP007', is_late_fee_applicable: false },
]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
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
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          } ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500">{hint}</p>}
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success'
          ? 'bg-emerald-600 text-white shadow-emerald-500/30'
          : type === 'info'
          ? 'bg-blue-600 text-white shadow-blue-500/30'
          : 'bg-rose-600 text-white shadow-rose-500/30'
        }`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : type === 'info'
        ? <Info className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ── Checkbox Toggle component ────────────────────────────────────────────────
function CheckToggle({ checked, onChange, label, disabled }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all select-none
        ${checked
          ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-500/10 dark:border-emerald-500/40'
          : 'bg-slate-50 border-slate-200 dark:bg-slate-800 dark:border-slate-700'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:shadow-sm'}`}
    >
      <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-colors
        ${checked ? 'bg-emerald-500 text-white' : 'bg-white border border-slate-300 dark:bg-slate-700 dark:border-slate-600'}`}>
        {checked && <Check className="w-3 h-3" />}
      </span>
      <span className={`text-[12px] font-semibold whitespace-nowrap
        ${checked ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
        {label}
      </span>
    </button>
  )
}

// ─── ADD MAIN GROUP MODAL ─────────────────────────────────────────────────────
function AddMainGroupModal({ open, onClose, onSubmit, loading }) {
  const [name, setName] = useState('')
  const [err, setErr] = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    if (open) {
      setName(''); setErr('')
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const handleSubmit = () => {
    if (!name.trim()) { setErr('Main Group Name is required'); return }
    onSubmit(name.trim())
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-[9000] backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className="fixed inset-0 z-[9001] flex items-center justify-center p-4"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.25)] shadow-2xl overflow-hidden"
          style={{ animation: 'modalIn .2s ease' }}
        >
          <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>

          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-indigo-500/5 dark:to-indigo-500/5">
            <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
              <Layers className="w-4 h-4" />
            </span>
            <div className="flex-1">
              <h3 className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Add New Main Group</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Create a parent concession category</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-5">
            <Field label="Main Group Name" error={err} required>
              <input
                ref={inputRef}
                value={name}
                onChange={e => { setName(e.target.value); setErr('') }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="e.g. Staff Concession"
                className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                  dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                  ${err ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MOBILE EDIT DRAWER ───────────────────────────────────────────────────────
function MobileEditDrawer({ open, onClose, row, mainGroups, onUpdate }) {
  const [groupName, setGroupName]   = useState('')
  const [mainGroup, setMainGroup]   = useState('')
  const [lateFee,   setLateFee]     = useState(true)
  const [errors,    setErrors]      = useState({})

  useEffect(() => {
    if (row) {
      setGroupName(row.Group_name || '')
      setMainGroup(String(row.main_group_id || ''))
      setLateFee(row.is_late_fee_applicable ?? true)
      setErrors({})
    }
  }, [row])

  const handleUpdate = () => {
    const err = {}
    if (!mainGroup) err.mainGroup = 'Select main group'
    if (!groupName.trim()) err.groupName = 'Enter group name'
    if (Object.keys(err).length) { setErrors(err); return }
    onUpdate({ ...row, Group_name: groupName.trim(), main_group_id: parseInt(mainGroup), is_late_fee_applicable: lateFee })
    onClose()
  }

  if (!open || !row) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35]
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Edit Group</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <Field label="Main Group" error={errors.mainGroup} required>
            <NativeSelect
              value={mainGroup}
              onChange={e => { setMainGroup(e.target.value); setErrors(p => ({ ...p, mainGroup: undefined })) }}
              placeholder="-- Select Main Group --"
              error={errors.mainGroup}
            >
              {mainGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Group Name" error={errors.groupName} required>
            <input
              value={groupName}
              onChange={e => { setGroupName(e.target.value); setErrors(p => ({ ...p, groupName: undefined })) }}
              placeholder="Enter group name"
              className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                bg-white text-slate-800 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
                ${errors.groupName ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
            />
          </Field>
          <Field label="Late Fee Applicable">
            <CheckToggle
              checked={lateFee}
              onChange={setLateFee}
              label={lateFee ? 'Yes — Late fee applicable' : 'No — Late fee not applicable'}
            />
          </Field>
        </div>
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleUpdate}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 transition-all active:scale-95">
            <Save className="w-4 h-4" />
            Update
          </button>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW (view + edit) ──────────────────────────────────────────
function DesktopRow({ row, idx, editingId, onEdit, onUpdate, onCancel, mainGroups }) {
  const isEditing = editingId === row.id
  const [editName,    setEditName]    = useState(row.Group_name)
  const [editGroup,   setEditGroup]   = useState(String(row.main_group_id))
  const [editLateFee, setEditLateFee] = useState(row.is_late_fee_applicable)

  // Reset when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditName(row.Group_name)
      setEditGroup(String(row.main_group_id))
      setEditLateFee(row.is_late_fee_applicable)
    }
  }, [isEditing])

  const handleUpdate = () => {
    if (!editName.trim() || !editGroup) return
    onUpdate({ ...row, Group_name: editName.trim(), main_group_id: parseInt(editGroup), is_late_fee_applicable: editLateFee })
  }

  const mgName = mainGroups.find(g => g.id === row.main_group_id)?.name || row.main_group_name

  return (
    <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
      ${isEditing
        ? 'bg-blue-50/50 dark:bg-indigo-500/[0.05]'
        : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}
    >
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Main Group */}
      <td className="px-4 py-3">
        {isEditing ? (
          <NativeSelect
            value={editGroup}
            onChange={e => setEditGroup(e.target.value)}
            placeholder="-- Select --"
          >
            {mainGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
          </NativeSelect>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold
            bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400 whitespace-nowrap">
            <Layers className="w-3 h-3 flex-shrink-0" />
            {mgName}
          </span>
        )}
      </td>

      {/* Group Name */}
      <td className="px-4 py-3">
        {isEditing ? (
          <input
            value={editName}
            onChange={e => setEditName(e.target.value)}
            className="w-full px-3 py-1.5 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
              outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200"
          />
        ) : (
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.Group_name}</span>
        )}
      </td>

      {/* Late Fee */}
      <td className="px-4 py-3 text-center">
        {isEditing ? (
          <div className="flex justify-center">
            <CheckToggle
              checked={editLateFee}
              onChange={setEditLateFee}
              label={editLateFee ? 'Yes' : 'No'}
            />
          </div>
        ) : (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold
            ${row.is_late_fee_applicable
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
            {row.is_late_fee_applicable ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {row.is_late_fee_applicable ? 'Yes' : 'No'}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={handleUpdate}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                  bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition-all active:scale-95"
              >
                <Save className="w-3.5 h-3.5" />Update
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
              >
                <XCircle className="w-3.5 h-3.5" />Cancel
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onEdit(row.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />Edit
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE GROUP CARD ────────────────────────────────────────────────────────
function MobileGroupCard({ row, idx, onEdit }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Index */}
        <span className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400
          text-[12px] font-bold flex items-center justify-center flex-shrink-0">
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          {/* Group name */}
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.Group_name}</p>
          {/* Main group badge */}
          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md text-[10px] font-semibold
            bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
            <Layers className="w-2.5 h-2.5" />
            {row.main_group_name}
          </span>
        </div>

        {/* Late fee badge + edit */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold
            ${row.is_late_fee_applicable
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
            {row.is_late_fee_applicable ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
            Late Fee
          </span>
          <button
            type="button"
            onClick={() => onEdit(row)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors"
          >
            <Edit3 className="w-3 h-3" />Edit
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineConcessionGroup() {
  // Form state
  const [session,    setSession]    = useState('')
  const [mainGroup,  setMainGroup]  = useState('')
  const [groupName,  setGroupName]  = useState('')
  const [lateFee,    setLateFee]    = useState(true)
  const [errors,     setErrors]     = useState({})
  const [submitting, setSubmitting] = useState(false)

  // Data state
  const [mainGroups, setMainGroups] = useState(INITIAL_MAIN_GROUPS)
  const [groups,     setGroups]     = useState(INITIAL_GROUPS)

  // Modal / Edit state
  const [showModal,    setShowModal]    = useState(false)
  const [modalLoading, setModalLoading] = useState(false)
  const [editingId,    setEditingId]    = useState(null)        // desktop grid edit
  const [mobileEdit,   setMobileEdit]   = useState(null)        // mobile drawer edit row
  const [search,       setSearch]       = useState('')

  // Toast
  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & Submit ──────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = {}
    if (!session)          err.session   = 'Select a session'
    if (!mainGroup)        err.mainGroup = 'Select main group'
    if (!groupName.trim()) err.groupName = 'Enter group name'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setSubmitting(true)

    setTimeout(() => {
      const mgObj  = mainGroups.find(g => g.id === parseInt(mainGroup))
      const newRow = {
        id:                  Date.now(),
        main_group_id:       parseInt(mainGroup),
        main_group_name:     mgObj?.name || '',
        Group_name:          groupName.trim(),
        group_code:          `GRP${String(groups.length + 1).padStart(3, '0')}`,
        is_late_fee_applicable: lateFee,
      }
      setGroups(prev => [...prev, newRow])
      setGroupName('')
      setMainGroup('')
      setLateFee(true)
      setSubmitting(false)
      showToast('Concession group added successfully!')
    }, 700)
  }, [session, mainGroup, groupName, lateFee, mainGroups, groups.length])

  // ── Add Main Group ─────────────────────────────────────────────────────────
  const handleAddMainGroup = (name) => {
    setModalLoading(true)
    setTimeout(() => {
      const newGroup = { id: Date.now(), name }
      setMainGroups(prev => [...prev, newGroup])
      setModalLoading(false)
      setShowModal(false)
      showToast(`Main Group "${name}" added!`)
    }, 600)
  }

  // ── Desktop grid update ────────────────────────────────────────────────────
  const handleDesktopUpdate = (updated) => {
    const mgName = mainGroups.find(g => g.id === updated.main_group_id)?.name || updated.main_group_name
    setGroups(prev => prev.map(r => r.id === updated.id ? { ...updated, main_group_name: mgName } : r))
    setEditingId(null)
    showToast('Group updated successfully!')
  }

  // ── Mobile drawer update ───────────────────────────────────────────────────
  const handleMobileUpdate = (updated) => {
    const mgName = mainGroups.find(g => g.id === updated.main_group_id)?.name || updated.main_group_name
    setGroups(prev => prev.map(r => r.id === updated.id ? { ...updated, main_group_name: mgName } : r))
    setMobileEdit(null)
    showToast('Group updated successfully!')
  }

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return groups
    const q = search.toLowerCase()
    return groups.filter(r =>
      r.Group_name.toLowerCase().includes(q) ||
      r.main_group_name.toLowerCase().includes(q)
    )
  }, [groups, search])

  return (
    <div className="space-y-5 pb-12">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Concession Group
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Define concession group names under main group categories.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
            shadow-md shadow-blue-500/20 transition-all active:scale-95 self-start flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Main Group
        </button>
      </div>

      {/* ── FORM CARD ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-gradient-to-r from-blue-50/60 to-indigo-50/40 dark:from-indigo-500/5 dark:to-transparent">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Add Concession Group</span>
        </div>

        {/* Form fields */}
        <div className="p-5">
          {/* Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Main Group" error={errors.mainGroup} required>
              <NativeSelect
                value={mainGroup}
                onChange={e => { setMainGroup(e.target.value); setErrors(p => ({ ...p, mainGroup: undefined })) }}
                placeholder="-- Select Main Group --"
                error={errors.mainGroup}
              >
                {mainGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Concession Group Name" error={errors.groupName} required>
              <input
                value={groupName}
                onChange={e => { setGroupName(e.target.value); setErrors(p => ({ ...p, groupName: undefined })) }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="e.g. Teaching Staff"
                className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
                  ${errors.groupName ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
              />
            </Field>

            <Field label="Late Fee Applicable">
              <CheckToggle
                checked={lateFee}
                onChange={setLateFee}
                label={lateFee ? 'Applicable' : 'Not Applicable'}
              />
            </Field>
          </div>
        </div>

        {/* Form Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.01]">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              disabled:opacity-70 transition-all active:scale-95"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Submit
          </button>
          <button
            type="button"
            onClick={() => {
              setSession(''); setMainGroup(''); setGroupName(''); setLateFee(true); setErrors({})
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* ── GRID / LIST CARD ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
            <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Concession Groups</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-52 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search group…"
              className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400"
            />
            {search && (
              <button onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
              <Search className="w-7 h-7 opacity-40" />
              <p className="text-[13px]">No groups found.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Main Group Name', 'Group Name', 'Late Fee Applicable', 'Action'].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                      ${i === 0 ? 'text-center w-12' : i >= 3 ? 'text-center' : 'text-left'}`}>
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
                    onEdit={id => setEditingId(id)}
                    onUpdate={handleDesktopUpdate}
                    onCancel={() => setEditingId(null)}
                    mainGroups={mainGroups}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400 dark:text-slate-600">
              <Search className="w-7 h-7 opacity-40" />
              <p className="text-[13px]">No groups found.</p>
            </div>
          ) : (
            filtered.map((row, i) => (
              <MobileGroupCard
                key={row.id}
                row={row}
                idx={i + 1}
                onEdit={row => setMobileEdit(row)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{groups.length}</span> groups
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Modals / Drawers ──────────────────────────────────────────────────── */}
      <AddMainGroupModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleAddMainGroup}
        loading={modalLoading}
      />

      <MobileEditDrawer
        open={!!mobileEdit}
        onClose={() => setMobileEdit(null)}
        row={mobileEdit}
        mainGroups={mainGroups}
        onUpdate={handleMobileUpdate}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
