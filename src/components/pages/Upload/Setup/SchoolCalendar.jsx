/**
 * SchoolCalendar.jsx
 * Folder: src/pages/Admin/SchoolCalendar/SchoolCalendar.jsx
 *
 * Converts legacy ASPX "School Calendar" page to fully-responsive React + Tailwind.
 *
 * Fields: From Date, To Date, Title (event name)
 * Features:
 *  - Add / Edit / Reset form
 *  - List of events in desktop table / mobile cards
 *  - Edit & Delete actions
 *  - Validation, loading & empty states, toast feedback
 *  - Mobile: stacked form + card list with swipe-friendly actions
 *  - Desktop: dense ERP-style table with sticky header
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  CalendarDays, CalendarPlus, RefreshCw, Pencil, Trash2,
  AlertCircle, X, Check, Loader2, Search,
  Info, ListChecks, CalendarRange, Type, Save,
  ChevronRight, Clock3
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const INITIAL_EVENTS = [
  { id: 1, event_date: '15 Jun 2026', event_to_date: '15 Jun 2026', event_name: 'Summer Vacation Begins' },
  { id: 2, event_date: '20 Jun 2026', event_to_date: '30 Jun 2026', event_name: 'Annual Sports Week' },
  { id: 3, event_date: '01 Jul 2026', event_to_date: '01 Jul 2026', event_name: 'School Reopens for New Session' },
  { id: 4, event_date: '15 Aug 2026', event_to_date: '15 Aug 2026', event_name: 'Independence Day Celebration' },
  { id: 5, event_date: '02 Oct 2026', event_to_date: '03 Oct 2026', event_name: 'Gandhi Jayanti & Holiday' },
  { id: 6, event_date: '12 Nov 2026', event_to_date: '14 Nov 2026', event_name: 'Diwali Break' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Convert "DD Mon YYYY" -> "YYYY-MM-DD" for <input type="date">
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function toInputDate(displayDate) {
  if (!displayDate) return ''
  const parts = displayDate.split(' ')
  if (parts.length !== 3) return ''
  const [day, mon, year] = parts
  const monthIdx = MONTHS.indexOf(mon)
  if (monthIdx === -1) return ''
  return `${year}-${String(monthIdx + 1).padStart(2, '0')}-${day.padStart(2, '0')}`
}

// Convert "YYYY-MM-DD" -> "DD Mon YYYY" for display
function toDisplayDate(inputDate) {
  if (!inputDate) return ''
  const [year, month, day] = inputDate.split('-')
  const monthIdx = parseInt(month, 10) - 1
  return `${day} ${MONTHS[monthIdx]} ${year}`
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function TextInput({ value, onChange, placeholder, error, type = 'text', icon: Icon, rows, ...rest }) {
  const Tag = rows ? 'textarea' : 'input'
  return (
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      )}
      <Tag
        type={rows ? undefined : type}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 placeholder-slate-400
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${rows ? 'resize-none' : ''}
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
        {...rest}
      />
    </div>
  )
}

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── CONFIRM DELETE MODAL ──────────────────────────────────────────────────────
function ConfirmDeleteModal({ open, event, onCancel, onConfirm, loading }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-5"
          style={{ animation: 'popIn .2s ease' }}
        >
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="flex items-center gap-3 mb-3">
            <span className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-5 h-5" />
            </span>
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Delete event?</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">This action cannot be undone.</p>
            </div>
          </div>
          {event && (
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-3 py-2.5 mb-4">
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 line-clamp-2">{event.event_name}</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {event.event_date} {event.event_date !== event.event_to_date && `– ${event.event_to_date}`}
              </p>
            </div>
          )}
          <div className="flex gap-3">
            <button type="button" onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button type="button" onClick={onConfirm} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-rose-600 hover:bg-rose-700 disabled:opacity-70 transition-all">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit, onDelete, editingId }) {
  const isEditing = editingId === row.id
  const isSingleDay = row.event_date === row.event_to_date

  return (
    <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
      ${isEditing ? 'bg-blue-50/60 dark:bg-indigo-500/[0.06]' : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}>
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* From Date */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
          <CalendarDays className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
          {row.event_date}
        </span>
      </td>

      {/* To Date */}
      <td className="px-4 py-3">
        {isSingleDay ? (
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            Same day
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            <CalendarDays className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400 flex-shrink-0" />
            {row.event_to_date}
          </span>
        )}
      </td>

      {/* Title */}
      <td className="px-4 py-3">
        <span className="text-[13px] text-slate-700 dark:text-slate-200">{row.event_name}</span>
      </td>

      {/* Edit */}
      <td className="px-4 py-3 text-center">
        <button type="button" onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            transition-colors active:scale-95">
          <Pencil className="w-3.5 h-3.5" /> Edit
        </button>
      </td>

      {/* Delete */}
      <td className="px-4 py-3 text-center">
        <button type="button" onClick={() => onDelete(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            transition-colors active:scale-95">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onEdit, onDelete, editingId }) {
  const [expanded, setExpanded] = useState(false)
  const isEditing = editingId === row.id
  const isSingleDay = row.event_date === row.event_to_date

  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm transition-colors
      ${isEditing
        ? 'border-blue-300 dark:border-indigo-500/40 bg-blue-50/60 dark:bg-indigo-500/[0.06]'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'}`}>

      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Index badge */}
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
            {row.event_name}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 flex items-center gap-1">
            <Clock3 className="w-3 h-3 flex-shrink-0" />
            {isSingleDay ? row.event_date : `${row.event_date} – ${row.event_to_date}`}
          </p>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">From Date</p>
              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> {row.event_date}
              </p>
            </div>
            <div className="rounded-xl bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400 mb-1">To Date</p>
              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <CalendarDays className="w-3.5 h-3.5 text-violet-500" /> {row.event_to_date}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => onEdit(row)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 transition-colors active:scale-95">
              <Pencil className="w-4 h-4" /> Edit
            </button>
            <button type="button" onClick={() => onDelete(row)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 transition-colors active:scale-95">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SchoolCalendar() {
  const [events,    setEvents]    = useState(INITIAL_EVENTS)
  const [fromDate,  setFromDate]  = useState('')
  const [toDate,    setToDate]    = useState('')
  const [title,     setTitle]     = useState('')
  const [errors,    setErrors]    = useState({})
  const [editingId, setEditingId] = useState(null)
  const [saving,    setSaving]    = useState(false)
  const [deleting,  setDeleting]  = useState(false)
  const [search,    setSearch]    = useState('')
  const [toast,     setToast]     = useState(null)
  const [confirmTarget, setConfirmTarget] = useState(null)

  const formRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!fromDate) err.fromDate = 'From date is required'
    if (!toDate) err.toDate = 'To date is required'
    if (fromDate && toDate && toDate < fromDate) err.toDate = 'To date cannot be before from date'
    if (!title.trim()) err.title = 'Title is required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Submit (Add / Update) — simulate API call ──────────────────────────────
  const handleSubmit = useCallback((e) => {
    e?.preventDefault?.()
    if (!validate()) return
    setSaving(true)

    setTimeout(() => {
      if (editingId) {
        setEvents(prev => prev.map(ev => ev.id === editingId
          ? { ...ev, event_date: toDisplayDate(fromDate), event_to_date: toDisplayDate(toDate), event_name: title.trim() }
          : ev
        ))
        showToast('Event updated successfully.')
      } else {
        const newEvent = {
          id: Date.now(),
          event_date: toDisplayDate(fromDate),
          event_to_date: toDisplayDate(toDate),
          event_name: title.trim(),
        }
        setEvents(prev => [newEvent, ...prev])
        showToast('Event added to calendar.')
      }
      setSaving(false)
      handleReset()
    }, 600)
  }, [fromDate, toDate, title, editingId])

  // ── Reset form ───────────────────────────────────────────────────────────
  const handleReset = () => {
    setFromDate(''); setToDate(''); setTitle('')
    setErrors({}); setEditingId(null)
  }

  // ── Edit ─────────────────────────────────────────────────────────────────
  const handleEdit = (row) => {
    setEditingId(row.id)
    setFromDate(toInputDate(row.event_date))
    setToDate(toInputDate(row.event_to_date))
    setTitle(row.event_name)
    setErrors({})
    // Scroll form into view (handy on mobile)
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteClick = (row) => setConfirmTarget(row)

  const handleDeleteConfirm = () => {
    if (!confirmTarget) return
    setDeleting(true)
    setTimeout(() => {
      setEvents(prev => prev.filter(ev => ev.id !== confirmTarget.id))
      if (editingId === confirmTarget.id) handleReset()
      showToast('Event removed from calendar.')
      setDeleting(false)
      setConfirmTarget(null)
    }, 500)
  }

  // ── Search filter ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return events
    const q = search.toLowerCase()
    return events.filter(ev =>
      ev.event_name.toLowerCase().includes(q) ||
      ev.event_date.toLowerCase().includes(q) ||
      ev.event_to_date.toLowerCase().includes(q)
    )
  }, [events, search])

  const isEditing = !!editingId

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          School Calendar
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Add holidays, events, and important dates to the academic calendar.
        </p>
      </div>

      {/* ── Form Card ────────────────────────────────────────────────────── */}
      <div ref={formRef} className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <CalendarPlus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            {isEditing ? 'Edit Event' : 'Add New Event'}
          </span>
          {isEditing && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              Editing
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-5">
          {/* Mobile-first stacked layout, desktop grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="From Date" error={errors.fromDate} required>
              <TextInput
                type="date"
                icon={CalendarRange}
                value={fromDate}
                onChange={e => { setFromDate(e.target.value); setErrors(p => ({ ...p, fromDate: undefined })) }}
                error={errors.fromDate}
              />
            </Field>

            <Field label="To Date" error={errors.toDate} required>
              <TextInput
                type="date"
                icon={CalendarRange}
                value={toDate}
                onChange={e => { setToDate(e.target.value); setErrors(p => ({ ...p, toDate: undefined })) }}
                error={errors.toDate}
                min={fromDate || undefined}
              />
            </Field>

            <div className="sm:col-span-2 lg:col-span-2">
              <Field label="Title" error={errors.title} required>
                <TextInput
                  rows={1}
                  icon={Type}
                  value={title}
                  onChange={e => { setTitle(e.target.value); setErrors(p => ({ ...p, title: undefined })) }}
                  placeholder="e.g. Summer Vacation Begins"
                  error={errors.title}
                />
              </Field>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button type="submit" disabled={saving}
              className="flex-1 sm:flex-none sm:px-6 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {saving
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isEditing ? <Save className="w-4 h-4" /> : <CalendarPlus className="w-4 h-4" />}
              {isEditing ? 'Update Event' : 'Add Event'}
            </button>

            <button type="button" onClick={handleReset}
              className="flex-1 sm:flex-none sm:px-6 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                transition-colors active:scale-95">
              <RefreshCw className="w-3.5 h-3.5" />
              {isEditing ? 'Cancel Edit' : 'Reset'}
            </button>
          </div>
        </form>
      </div>

      {/* ── Events List Card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <ListChecks className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Calendar Events</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} event{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search events…"
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
            Click Edit to update an event, or Delete to remove it from the calendar.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No events match your search.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'From Date', 'To Date', 'Title', 'Edit', 'Delete'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
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
                    onDelete={handleDeleteClick}
                    editingId={editingId}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No events match your search.</span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to see actions.
              </p>
              {filtered.map((row, i) => (
                <MobileCard
                  key={row.id}
                  row={row}
                  idx={i + 1}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  editingId={editingId}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{events.length}</span> events
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={!!confirmTarget}
        event={confirmTarget}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleting}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
