/**
 * ExpenseNameMaster.jsx
 * Converts legacy ASPX "Expense Name Master" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Group dropdown filter
 *  - Add expense name
 *  - Inline edit / delete with confirmation
 *  - Desktop: ERP-style table
 *  - Mobile: cards with accordion detail + touch-friendly actions
 *  - Toast notifications
 *  - Empty & loading states
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Plus, Pencil, Trash2, Check, X, AlertCircle, Loader2,
  ChevronDown, SlidersHorizontal, Search, RefreshCw,
  Tag, FolderOpen, Info, ChevronRight, ReceiptText
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const GROUPS = [
  { id: 1, name: 'Administration' },
  { id: 2, name: 'Academic' },
  { id: 3, name: 'Infrastructure' },
  { id: 4, name: 'Transport' },
  { id: 5, name: 'Sports & Activities' },
]

let _nextId = 10
const seed = [
  { id: 1,  expense_name: 'Staff Salary',        group_id: 1, group_name: 'Administration' },
  { id: 2,  expense_name: 'Office Supplies',      group_id: 1, group_name: 'Administration' },
  { id: 3,  expense_name: 'Book Purchase',        group_id: 2, group_name: 'Academic' },
  { id: 4,  expense_name: 'Lab Equipment',        group_id: 2, group_name: 'Academic' },
  { id: 5,  expense_name: 'Building Maintenance', group_id: 3, group_name: 'Infrastructure' },
  { id: 6,  expense_name: 'Electricity Bill',     group_id: 3, group_name: 'Infrastructure' },
  { id: 7,  expense_name: 'Fuel & Oil',           group_id: 4, group_name: 'Transport' },
  { id: 8,  expense_name: 'Bus Repair',           group_id: 4, group_name: 'Transport' },
  { id: 9,  expense_name: 'Sports Kit',           group_id: 5, group_name: 'Sports & Activities' },
]

// ─── GROUP COLOR PALETTE ──────────────────────────────────────────────────────
const GROUP_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
]
const groupColor = (id) => GROUP_COLORS[(id - 1) % GROUP_COLORS.length]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
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
      <button onClick={onClose} className="opacity-75 hover:opacity-100"><X className="w-4 h-4" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6"
        style={{ animation: 'popIn .2s ease' }}>
        <style>{`@keyframes popIn{from{opacity:0;transform:translateY(-50%) scale(.95)}to{opacity:1;transform:translateY(-50%) scale(1)}}`}</style>
        <div className="flex items-start gap-3 mb-5">
          <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </span>
          <div>
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Confirm Delete</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">{message}</p>
          </div>
        </div>
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
    </>
  )
}

// ─── GROUP BADGE ──────────────────────────────────────────────────────────────
function GroupBadge({ groupId, groupName }) {
  const { fg, bg } = groupColor(groupId)
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold"
      style={{ background: bg, color: fg }}>
      <FolderOpen className="w-3 h-3" />
      {groupName}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit, onDelete }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.expense_name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <GroupBadge groupId={row.group_id} groupName={row.group_name} />
      </td>
      <td className="px-4 py-3 text-center w-20">
        <button onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            transition-colors opacity-0 group-hover:opacity-100">
          <Pencil className="w-3 h-3" /> Edit
        </button>
      </td>
      <td className="px-4 py-3 text-center w-20">
        <button onClick={() => onDelete(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            transition-colors opacity-0 group-hover:opacity-100">
          <Trash2 className="w-3 h-3" /> Delete
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = groupColor(row.group_id)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}>
          {idx}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.expense_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{row.group_name}</p>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Group</span>
            <GroupBadge groupId={row.group_id} groupName={row.group_name} />
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => onEdit(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors">
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => onDelete(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── EDIT MODAL ──────────────────────────────────────────────────────────────
function EditModal({ row, groups, onSave, onClose }) {
  const [name, setName]   = useState(row.expense_name)
  const [gid,  setGid]    = useState(String(row.group_id))
  const [errors, setErr]  = useState({})

  const handleSave = () => {
    const e = {}
    if (!name.trim()) e.name = 'Expense name is required'
    if (!gid)         e.gid  = 'Please select a group'
    if (Object.keys(e).length) { setErr(e); return }
    const grp = groups.find(g => g.id === Number(gid))
    onSave({ ...row, expense_name: name.trim(), group_id: Number(gid), group_name: grp?.name ?? '' })
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6"
        style={{ animation: 'popIn .2s ease' }}>
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
            <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Edit Expense</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Group" error={errors.gid} required>
            <NativeSelect value={gid} onChange={e => setGid(e.target.value)} placeholder="-- Select Group --" error={errors.gid}>
              {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Expense Name" error={errors.name} required>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter expense name"
              className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                ${errors.name ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
            />
          </Field>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors">
            <Check className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ExpenseNameMaster() {
  const [records,    setRecords]    = useState(seed)
  const [group,      setGroup]      = useState('')
  const [expName,    setExpName]    = useState('')
  const [search,     setSearch]     = useState('')
  const [filterOpen, setFilterOpen] = useState(false)
  const [errors,     setErrors]     = useState({})
  const [adding,     setAdding]     = useState(false)
  const [editRow,    setEditRow]    = useState(null)
  const [deleteRow,  setDeleteRow]  = useState(null)
  const [toast,      setToast]      = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Add ──────────────────────────────────────────────────────────────────
  const handleAdd = useCallback(() => {
    const e = {}
    if (!group)          e.group   = 'Please select a group'
    if (!expName.trim()) e.expName = 'Expense name is required'
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setAdding(true)
    const grp = GROUPS.find(g => g.id === Number(group))
    setTimeout(() => {
      setRecords(prev => [...prev, {
        id: _nextId++,
        expense_name: expName.trim(),
        group_id: Number(group),
        group_name: grp?.name ?? '',
      }])
      setExpName('')
      setGroup('')
      setAdding(false)
      showToast('Expense added successfully.')
    }, 500)
  }, [group, expName])

  // ── Edit save ────────────────────────────────────────────────────────────
  const handleSaveEdit = useCallback((updated) => {
    setRecords(prev => prev.map(r => r.id === updated.id ? updated : r))
    setEditRow(null)
    showToast('Expense updated successfully.')
  }, [])

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleConfirmDelete = useCallback(() => {
    setRecords(prev => prev.filter(r => r.id !== deleteRow.id))
    showToast(`"${deleteRow.expense_name}" deleted.`, 'error')
    setDeleteRow(null)
  }, [deleteRow])

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setGroup(''); setExpName(''); setSearch(''); setErrors({})
  }

  // ── Filtered list ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return records.filter(r =>
      (!q || r.expense_name.toLowerCase().includes(q) || r.group_name.toLowerCase().includes(q))
    )
  }, [records, search])

  return (
    <div className="space-y-4 pb-10">
      {/* ── Page Title ───────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ReceiptText className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Expense Name Master
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Manage expense categories grouped by department.
        </p>
      </div>

      {/* ── ADD FORM — Desktop ───────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Add New Expense</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Select Group" error={errors.group} required>
              <NativeSelect
                value={group}
                onChange={e => { setGroup(e.target.value); setErrors(p => ({ ...p, group: undefined })) }}
                placeholder="-- Select Group --"
                error={errors.group}
              >
                {GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Expense Name" error={errors.expName} required>
              <input
                value={expName}
                onChange={e => { setExpName(e.target.value); setErrors(p => ({ ...p, expName: undefined })) }}
                onKeyDown={e => e.key === 'Enter' && handleAdd()}
                placeholder="e.g. Stationery"
                className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:focus:border-indigo-400
                  ${errors.expName ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
              />
            </Field>
            <div /> {/* spacer */}
            <div className="flex gap-2">
              <button onClick={handleAdd} disabled={adding}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Add
              </button>
              <button onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── ADD FORM — Mobile (full-width stacked) ────────────────────── */}
      <div className="sm:hidden rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500" />
          <Plus className="w-4 h-4 text-blue-600" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Add New Expense</span>
        </div>
        <div className="p-4 space-y-3">
          <Field label="Select Group" error={errors.group} required>
            <NativeSelect
              value={group}
              onChange={e => { setGroup(e.target.value); setErrors(p => ({ ...p, group: undefined })) }}
              placeholder="-- Select Group --"
              error={errors.group}
            >
              {GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Expense Name" error={errors.expName} required>
            <input
              value={expName}
              onChange={e => { setExpName(e.target.value); setErrors(p => ({ ...p, expName: undefined })) }}
              placeholder="e.g. Stationery"
              className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                ${errors.expName ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
            />
          </Field>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} disabled={adding}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 disabled:opacity-70 transition-all active:scale-95">
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Expense
            </button>
            <button onClick={handleReset}
              className="px-4 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── RECORDS PANEL ────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Panel header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
            <ReceiptText className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Expense Records</span>
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
              placeholder="Search expense or group…"
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

        {/* Hint bar */}
        <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Hover over a row to reveal Edit and Delete actions.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Expense Name', 'Group Name', 'Edit', 'Delete'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.id} row={row} idx={i + 1} onEdit={setEditRow} onDelete={setDeleteRow} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to view details and actions.
              </p>
              {filtered.map((row, i) => (
                <MobileCard key={row.id} row={row} idx={i + 1} onEdit={setEditRow} onDelete={setDeleteRow} />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {editRow   && <EditModal row={editRow} groups={GROUPS} onSave={handleSaveEdit} onClose={() => setEditRow(null)} />}
      {deleteRow && (
        <ConfirmDialog
          message={`Are you sure you want to delete "${deleteRow.expense_name}"? This action cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteRow(null)}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <ReceiptText className="w-6 h-6 opacity-40" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
          {search ? 'No matching records' : 'No expenses added yet'}
        </p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
          {search ? `No results for "${search}". Try a different term.` : 'Use the form above to add your first expense.'}
        </p>
      </div>
    </div>
  )
}
