/**
 * ExpenseGroupMaster.jsx
 * Folder: src/pages/Expense/ExpenseGroupMaster.jsx
 *
 * Converts legacy ASPX "Expense Group Master" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Add / Edit / Delete expense groups
 *  - Inline validation with error states
 *  - Toast notifications
 *  - Desktop: classic ERP table layout
 *  - Mobile: card-based list with swipe-friendly actions
 *  - Search/filter on table
 *  - Loading & empty states
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Tags, Plus, Pencil, Trash2, Check, X,
  AlertCircle, Loader2, Search, RefreshCw,
  ChevronRight, MoreVertical, FolderOpen,
  Save, Ban, Info, LayoutList
} from 'lucide-react'

// ─── DUMMY DATA ────────────────────────────────────────────────────────────────
const INITIAL_GROUPS = [
  { id: 1, group_name: 'Office Supplies' },
  { id: 2, group_name: 'Travel & Conveyance' },
  { id: 3, group_name: 'Utilities' },
  { id: 4, group_name: 'Staff Welfare' },
  { id: 5, group_name: 'Maintenance & Repairs' },
  { id: 6, group_name: 'Communication' },
  { id: 7, group_name: 'Printing & Stationery' },
  { id: 8, group_name: 'Miscellaneous' },
]

let nextId = 9

// ─── TOAST COMPONENT ──────────────────────────────────────────────────────────
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
          : 'bg-amber-500 text-white'
        }`}
      style={{ animation: 'toastUp .25s ease' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
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

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, groupName, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onCancel} />
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-sm mx-auto
          rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
          shadow-2xl p-6"
        style={{ animation: 'dialogPop .2s ease' }}
      >
        <style>{`@keyframes dialogPop{from{opacity:0;transform:translateY(-50%) scale(.95)}to{opacity:1;transform:translateY(-50%) scale(1)}}`}</style>
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-500/15 mx-auto mb-4">
          <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 text-center mb-1">Delete Group?</h3>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 text-center mb-5">
          Are you sure you want to delete <span className="font-semibold text-slate-700 dark:text-slate-200">"{groupName}"</span>? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white
              hover:bg-rose-700 transition-colors shadow-md shadow-rose-500/20"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MOBILE ACTION SHEET ──────────────────────────────────────────────────────
function MobileActionSheet({ open, group, onEdit, onDelete, onClose }) {
  if (!open || !group) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35]
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">Actions for</p>
          <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mt-0.5 truncate">{group.group_name}</p>
        </div>
        <div className="p-4 space-y-2.5">
          <button
            onClick={() => { onEdit(group); onClose() }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10
              text-blue-700 dark:text-blue-400 text-[14px] font-semibold hover:bg-blue-100 dark:hover:bg-blue-500/15 transition-colors"
          >
            <Pencil className="w-4 h-4 flex-shrink-0" />
            Edit Group Name
          </button>
          <button
            onClick={() => { onDelete(group); onClose() }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-rose-50 dark:bg-rose-500/10
              text-rose-700 dark:text-rose-400 text-[14px] font-semibold hover:bg-rose-100 dark:hover:bg-rose-500/15 transition-colors"
          >
            <Trash2 className="w-4 h-4 flex-shrink-0" />
            Delete Group
          </button>
        </div>
        <div className="px-4 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </>
  )
}

// ─── ADD / EDIT FORM ──────────────────────────────────────────────────────────
function GroupForm({ editGroup, onSave, onCancel, loading }) {
  const [value, setValue] = useState(editGroup ? editGroup.group_name : '')
  const [error, setError]   = useState('')
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50)
  }, [])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) { setError('Group name is required.'); return }
    if (trimmed.length < 2) { setError('Group name must be at least 2 characters.'); return }
    setError('')
    onSave(trimmed)
  }

  const isEdit = !!editGroup

  return (
    <div className={`rounded-2xl border ${isEdit
        ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/40 dark:bg-amber-500/[0.04]'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35]'
      } shadow-sm overflow-hidden`}
    >
      {/* Header */}
      <div className={`flex items-center gap-3 px-5 py-3.5 border-b ${isEdit
          ? 'border-amber-200 dark:border-amber-500/20 bg-amber-50/60 dark:bg-amber-500/[0.06]'
          : 'border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]'
        }`}
      >
        <span className={`w-1 h-5 rounded-full flex-shrink-0 ${isEdit ? 'bg-amber-500' : 'bg-blue-500'}`} />
        {isEdit
          ? <Pencil className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          : <Plus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        }
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
          {isEdit ? `Editing: ${editGroup.group_name}` : 'Add New Group'}
        </span>
        {isEdit && (
          <button onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-500/10 text-slate-400 dark:text-slate-500 transition-colors">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          {/* Input */}
          <div className="flex-1 w-full">
            <label className="block text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Group Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Tags className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={e => { setValue(e.target.value); if (error) setError('') }}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                placeholder="e.g. Office Supplies"
                className={`w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                  bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                  placeholder-slate-300 dark:placeholder-slate-600
                  focus:ring-2 ${error
                    ? 'border-rose-400 ring-rose-100 dark:ring-rose-500/20'
                    : isEdit
                    ? 'border-amber-300 dark:border-amber-500/30 focus:border-amber-400 focus:ring-amber-100 dark:focus:ring-amber-500/20'
                    : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)] focus:border-blue-400 focus:ring-blue-100 dark:focus:ring-indigo-500/20'
                  }`}
              />
            </div>
            {error && (
              <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                transition-all active:scale-95 disabled:opacity-70 shadow-md
                ${isEdit
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/25'
                  : 'bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-blue-500/20'
                }`}
            >
              {loading
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isEdit ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />
              }
              {isEdit ? 'Update' : 'Add Group'}
            </button>
            {isEdit && (
              <button
                onClick={onCancel}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <Ban className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ group, idx, onEdit, onDelete, isEditing }) {
  const GROUP_COLORS = [
    { fg: '#1d4ed8', bg: '#dbeafe' },
    { fg: '#7c3aed', bg: '#ede9fe' },
    { fg: '#0891b2', bg: '#cffafe' },
    { fg: '#059669', bg: '#d1fae5' },
    { fg: '#d97706', bg: '#fef3c7' },
    { fg: '#dc2626', bg: '#fee2e2' },
    { fg: '#0369a1', bg: '#e0f2fe' },
  ]
  const color = GROUP_COLORS[group.id % GROUP_COLORS.length]
  const initials = group.group_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
      ${isEditing
        ? 'bg-amber-50/60 dark:bg-amber-500/[0.04]'
        : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'
      }`}
    >
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-14">
        {idx}
      </td>

      {/* Group */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: color.bg, color: color.fg }}
          >
            {initials}
          </span>
          <span className={`text-[13px] font-semibold ${isEditing ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-200'}`}>
            {group.group_name}
          </span>
          {isEditing && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
              Editing
            </span>
          )}
        </div>
      </td>

      {/* Edit */}
      <td className="px-4 py-3 text-center w-24">
        <button
          onClick={() => onEdit(group)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/15
            border border-blue-100 dark:border-blue-500/20 transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </td>

      {/* Delete */}
      <td className="px-4 py-3 text-center w-24">
        <button
          onClick={() => onDelete(group)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/15
            border border-rose-100 dark:border-rose-500/20 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE GROUP CARD ────────────────────────────────────────────────────────
function MobileGroupCard({ group, idx, onMorePress, isEditing }) {
  const GROUP_COLORS = [
    { fg: '#1d4ed8', bg: '#dbeafe' },
    { fg: '#7c3aed', bg: '#ede9fe' },
    { fg: '#0891b2', bg: '#cffafe' },
    { fg: '#059669', bg: '#d1fae5' },
    { fg: '#d97706', bg: '#fef3c7' },
    { fg: '#dc2626', bg: '#fee2e2' },
    { fg: '#0369a1', bg: '#e0f2fe' },
  ]
  const color = GROUP_COLORS[group.id % GROUP_COLORS.length]
  const initials = group.group_name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={`flex items-center gap-3 px-4 py-3.5 rounded-xl border transition-all
      ${isEditing
        ? 'border-amber-200 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-500/[0.06]'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'
      } shadow-sm`}
    >
      {/* Avatar */}
      <span
        className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
        style={{ background: color.bg, color: color.fg }}
      >
        {initials}
      </span>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`text-[14px] font-semibold truncate ${isEditing ? 'text-amber-700 dark:text-amber-400' : 'text-slate-800 dark:text-slate-100'}`}>
          {group.group_name}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
          <span className="tabular-nums">#{String(idx).padStart(2, '0')}</span>
          {isEditing && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400">
              Editing
            </span>
          )}
        </p>
      </div>

      {/* More button */}
      <button
        onClick={() => onMorePress(group)}
        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800
          text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
      >
        <MoreVertical className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ExpenseGroupMaster() {
  const [groups,     setGroups]     = useState(INITIAL_GROUPS)
  const [editGroup,  setEditGroup]  = useState(null)     // group being edited
  const [formLoading, setFormLoading] = useState(false)
  const [search,     setSearch]     = useState('')
  const [toast,      setToast]      = useState(null)
  const [confirmDel, setConfirmDel] = useState(null)    // group to delete
  const [actionSheet, setActionSheet] = useState(null)  // mobile sheet group

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
  }, [])

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return groups
    const q = search.toLowerCase()
    return groups.filter(g => g.group_name.toLowerCase().includes(q))
  }, [groups, search])

  // ── Save (Add or Edit) ────────────────────────────────────────────────────
  const handleSave = useCallback((name) => {
    setFormLoading(true)
    setTimeout(() => {
      if (editGroup) {
        setGroups(prev => prev.map(g => g.id === editGroup.id ? { ...g, group_name: name } : g))
        showToast(`Group "${name}" updated successfully.`)
        setEditGroup(null)
      } else {
        const newGroup = { id: nextId++, group_name: name }
        setGroups(prev => [...prev, newGroup])
        showToast(`Group "${name}" added successfully.`)
      }
      setFormLoading(false)
    }, 500)
  }, [editGroup, showToast])

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((group) => {
    setEditGroup(group)
    // Scroll to top on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Delete confirm ────────────────────────────────────────────────────────
  const handleDeleteRequest = useCallback((group) => {
    setConfirmDel(group)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (!confirmDel) return
    setGroups(prev => prev.filter(g => g.id !== confirmDel.id))
    showToast(`Group "${confirmDel.group_name}" deleted.`, 'error')
    setConfirmDel(null)
  }, [confirmDel, showToast])

  const handleCancelEdit = () => setEditGroup(null)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#13172a] p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
          <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-600 dark:text-slate-300 font-semibold">Expense Group Master</span>
        </nav>

        {/* ── Page Title ────────────────────────────────────────────────────── */}
        <div>
          <h1 className="text-[22px] sm:text-[24px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <Tags className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </span>
            Expense Group Master
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 ml-11">
            Manage expense categories and group classifications.
          </p>
        </div>

        {/* ── Summary Pill ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#1a1f35]
            border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-sm">
            <LayoutList className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">
              {groups.length} Groups Total
            </span>
          </div>
          {editGroup && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 dark:bg-amber-500/10
              border border-amber-200 dark:border-amber-500/25">
              <Pencil className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="text-[12px] font-semibold text-amber-700 dark:text-amber-400">Edit Mode Active</span>
            </div>
          )}
        </div>

        {/* ── Add / Edit Form ───────────────────────────────────────────────── */}
        <GroupForm
          editGroup={editGroup}
          onSave={handleSave}
          onCancel={handleCancelEdit}
          loading={formLoading}
        />

        {/* ── Groups List Card ──────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5
            border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <FolderOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Expense Groups</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full
                bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-52 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search groups…"
                className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Reset */}
            {search && (
              <button onClick={() => setSearch('')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                  bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors flex-shrink-0">
                <RefreshCw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>

          {/* Info bar */}
          <div className="flex items-center gap-2 px-5 py-2
            border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              <span className="hidden sm:inline">Click Edit to modify a group name or Delete to remove it. Changes are applied instantly.</span>
              <span className="sm:hidden">Tap ⋮ on any card to edit or delete.</span>
            </p>
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            {filtered.length === 0 ? (
              <EmptyState search={search} onClearSearch={() => setSearch('')} />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Group Name', 'Edit', 'Delete'].map((h, i) => (
                      <th key={i}
                        className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                          ${i === 0 ? 'w-14 text-center' : i >= 2 ? 'w-24 text-center' : 'text-left'}`}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((group, i) => (
                    <DesktopRow
                      key={group.id}
                      group={group}
                      idx={i + 1}
                      onEdit={handleEdit}
                      onDelete={handleDeleteRequest}
                      isEditing={editGroup?.id === group.id}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="md:hidden p-4 space-y-2.5">
            {filtered.length === 0 ? (
              <EmptyState search={search} onClearSearch={() => setSearch('')} />
            ) : (
              filtered.map((group, i) => (
                <MobileGroupCard
                  key={group.id}
                  group={group}
                  idx={i + 1}
                  onMorePress={setActionSheet}
                  isEditing={editGroup?.id === group.id}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5
            border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              Showing{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>{' '}
              of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{groups.length}</span>{' '}
              groups
            </p>
            {search && (
              <button onClick={() => setSearch('')}
                className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear search
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Modals & Overlays ─────────────────────────────────────────────────── */}
      <MobileActionSheet
        open={!!actionSheet}
        group={actionSheet}
        onEdit={handleEdit}
        onDelete={handleDeleteRequest}
        onClose={() => setActionSheet(null)}
      />

      <ConfirmDialog
        open={!!confirmDel}
        groupName={confirmDel?.group_name}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDel(null)}
      />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search, onClearSearch }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-4 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Tags className="w-7 h-7 opacity-40" />
      </div>
      <div className="text-center">
        {search ? (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No groups match "{search}"</p>
            <p className="text-[12px] mt-1">
              <button onClick={onClearSearch} className="text-blue-600 dark:text-blue-400 hover:underline">Clear search</button>
              {' '}to see all groups.
            </p>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No expense groups yet</p>
            <p className="text-[12px] mt-1">Add your first group using the form above.</p>
          </>
        )}
      </div>
    </div>
  )
}
