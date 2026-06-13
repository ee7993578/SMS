/**
 * Change_Section_Name.jsx
 * Folder: src/pages/Configuration/Change_Section_Name.jsx
 *
 * Converts legacy ASPX "Change Section Name" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Inline GridView-style edit → Update / Cancel flow
 *  - Desktop: dense ERP-style table with inline edit
 *  - Mobile: card-based layout with tap-to-edit
 *  - Search / filter by class or section
 *  - Toast notifications for success / error
 *  - Loading skeleton
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Pencil, Check, X, AlertCircle, Loader2,
  Search, RefreshCw, Settings2, ChevronRight,
  BookOpen, Building2, LayoutGrid, Info,
  SlidersHorizontal, ChevronDown, Tag
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const INITIAL_SECTIONS = [
  { Sec_id: 1,  Class: 'Nursery',    Section: 'A' },
  { Sec_id: 2,  Class: 'Nursery',    Section: 'B' },
  { Sec_id: 3,  Class: 'LKG',        Section: 'A' },
  { Sec_id: 4,  Class: 'LKG',        Section: 'B' },
  { Sec_id: 5,  Class: 'UKG',        Section: 'A' },
  { Sec_id: 6,  Class: 'UKG',        Section: 'B' },
  { Sec_id: 7,  Class: 'Class I',    Section: 'A' },
  { Sec_id: 8,  Class: 'Class I',    Section: 'B' },
  { Sec_id: 9,  Class: 'Class II',   Section: 'A' },
  { Sec_id: 10, Class: 'Class II',   Section: 'B' },
  { Sec_id: 11, Class: 'Class III',  Section: 'A' },
  { Sec_id: 12, Class: 'Class IV',   Section: 'A' },
  { Sec_id: 13, Class: 'Class V',    Section: 'A' },
  { Sec_id: 14, Class: 'Class VI',   Section: 'A' },
  { Sec_id: 15, Class: 'Class VI',   Section: 'B' },
  { Sec_id: 16, Class: 'Class VII',  Section: 'A' },
  { Sec_id: 17, Class: 'Class VIII', Section: 'A' },
  { Sec_id: 18, Class: 'Class IX',   Section: 'A' },
  { Sec_id: 19, Class: 'Class IX',   Section: 'B' },
  { Sec_id: 20, Class: 'Class X',    Section: 'A' },
  { Sec_id: 21, Class: 'Class XI',   Section: 'A' },
  { Sec_id: 22, Class: 'Class XI',   Section: 'B' },
  { Sec_id: 23, Class: 'Class XII',  Section: 'A' },
  { Sec_id: 24, Class: 'Class XII',  Section: 'B' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') =>
  CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

const formatAbbr = (name = '') =>
  name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3200)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div
      className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{
        transform: 'translateX(-50%)',
        animation: 'toastSlide .25s ease',
      }}
    >
      <style>{`@keyframes toastSlide{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, editingId, editValue, onEdit, onUpdate, onCancel, onChange, saving }) {
  const isEditing = editingId === row.Sec_id
  const { fg, bg } = classColor(row.Class)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus()
  }, [isEditing])

  return (
    <tr
      className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
        ${isEditing
          ? 'bg-blue-50/60 dark:bg-indigo-500/[0.06]'
          : 'hover:bg-slate-50/70 dark:hover:bg-white/[0.02]'
        }`}
    >
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.Class)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {row.Class}
          </span>
        </div>
      </td>

      {/* Section */}
      <td className="px-4 py-3 text-center">
        {isEditing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => onChange(e.target.value)}
            maxLength={10}
            className="w-20 text-center px-2 py-1.5 text-[13px] font-semibold rounded-lg border-2 border-blue-400
              outline-none ring-2 ring-blue-100 dark:ring-indigo-500/20
              bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-100
              dark:border-indigo-400 transition-all"
          />
        ) : (
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {row.Section}
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => onUpdate(row.Sec_id)}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-500/20
                transition-all active:scale-95 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Update
            </button>
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
                dark:hover:bg-slate-700 transition-all active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => onEdit(row.Sec_id, row.Section)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100
              dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20 dark:hover:bg-indigo-500/20
              transition-all active:scale-95"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, editingId, editValue, onEdit, onUpdate, onCancel, onChange, saving }) {
  const isEditing = editingId === row.Sec_id
  const { fg, bg } = classColor(row.Class)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing && inputRef.current) inputRef.current.focus()
  }, [isEditing])

  return (
    <div
      className={`rounded-2xl border transition-all overflow-hidden shadow-sm
        ${isEditing
          ? 'border-blue-300 dark:border-indigo-400/40 bg-blue-50/50 dark:bg-indigo-500/[0.05] shadow-blue-100 dark:shadow-indigo-500/10'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'
        }`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Index */}
        <span className="text-[11px] font-bold text-slate-400 dark:text-slate-600 w-5 flex-shrink-0 text-center">
          {idx}
        </span>

        {/* Class badge */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {formatAbbr(row.Class)}
        </span>

        {/* Class name */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {row.Class}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Tag className="w-3 h-3 text-slate-400" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Section</span>
            {!isEditing && (
              <span className="ml-1 inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {row.Section}
              </span>
            )}
          </div>
        </div>

        {/* Edit button (non-editing) */}
        {!isEditing && (
          <button
            onClick={() => onEdit(row.Sec_id, row.Section)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100
              dark:bg-indigo-500/10 dark:text-indigo-300 dark:border-indigo-500/20
              transition-all active:scale-95 flex-shrink-0"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </div>

      {/* Edit panel */}
      {isEditing && (
        <div className="px-4 pb-4 pt-0">
          <div className="rounded-xl bg-white dark:bg-[#1e2238] border border-blue-100 dark:border-indigo-500/20 p-4">
            <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
              New Section Name
            </label>
            <input
              ref={inputRef}
              value={editValue}
              onChange={e => onChange(e.target.value)}
              maxLength={10}
              placeholder="e.g. A, B, C …"
              className="w-full px-3 py-2.5 text-[14px] font-semibold rounded-xl border-2 border-blue-400
                outline-none ring-2 ring-blue-100 dark:ring-indigo-500/20 mb-3
                bg-white dark:bg-[#1a1f35] text-slate-800 dark:text-slate-100
                dark:border-indigo-400 placeholder-slate-300 dark:placeholder-slate-600 transition-all"
            />
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate(row.Sec_id)}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Update Section
              </button>
              <button
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200
                  dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-all active:scale-95"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ChangeSectionName() {
  const [sections,  setSections]  = useState(INITIAL_SECTIONS)
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saving,    setSaving]    = useState(false)
  const [search,    setSearch]    = useState('')
  const [toast,     setToast]     = useState(null)
  const [loading,   setLoading]   = useState(false) // Simulated page load

  const showToast = (msg, type = 'success') => setToast({ msg, type })

  // ── Simulated initial load ──────────────────────────────────────────────
  useEffect(() => {
    setLoading(true)
    const t = setTimeout(() => setLoading(false), 700)
    return () => clearTimeout(t)
  }, [])

  // ── Edit handlers ──────────────────────────────────────────────────────
  const handleEdit = useCallback((secId, currentSection) => {
    setEditingId(secId)
    setEditValue(currentSection)
  }, [])

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setEditValue('')
  }, [])

  const handleUpdate = useCallback((secId) => {
    const trimmed = editValue.trim()
    if (!trimmed) {
      showToast('Section name cannot be empty.', 'error')
      return
    }

    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSections(prev =>
        prev.map(s => s.Sec_id === secId ? { ...s, Section: trimmed } : s)
      )
      setSaving(false)
      setEditingId(null)
      setEditValue('')
      showToast('Section name updated successfully!')
    }, 700)
  }, [editValue])

  const handleReset = () => {
    setSearch('')
    setEditingId(null)
    setEditValue('')
  }

  // ── Search filter ──────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return sections
    const q = search.toLowerCase()
    return sections.filter(s =>
      s.Class.toLowerCase().includes(q) ||
      s.Section.toLowerCase().includes(q)
    )
  }, [sections, search])

  // ── Stats ──────────────────────────────────────────────────────────────
  const uniqueClasses = useMemo(() =>
    new Set(sections.map(s => s.Class)).size
  , [sections])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1221] p-3 sm:p-5 lg:p-6">
      <div className="max-w-4xl mx-auto space-y-4">

        {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
        <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="text-slate-600 dark:text-slate-300 font-medium">Change Section</span>
        </nav>

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5 leading-tight">
              <span className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-blue-500/20">
                <Settings2 className="w-5 h-5 text-white" />
              </span>
              Change Section
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 ml-0.5">
              Edit and update section names for any class.
            </p>
          </div>

          {/* Quick stats */}
          <div className="flex gap-2 flex-shrink-0">
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-sm">
              <Building2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <div>
                <p className="text-[16px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-none">{uniqueClasses}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Classes</p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-sm">
              <LayoutGrid className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <div>
                <p className="text-[16px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-none">{sections.length}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Sections</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Main Card ──────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">All Sections</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Search + Reset */}
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search class or section…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <button
                onClick={handleReset}
                title="Reset"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-600
                  hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors flex-shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Info hint */}
          <div className="flex items-center gap-2 px-4 sm:px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-amber-50/40 dark:bg-amber-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-[12px] text-amber-700 dark:text-amber-400">
              Click <strong>Edit</strong> on any row to rename that section. Changes take effect immediately.
            </p>
          </div>

          {/* ── Loading Skeleton ───────────────────────────────────────────── */}
          {loading && (
            <div className="p-4 space-y-3">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
                  style={{ opacity: 1 - i * 0.1 }}
                />
              ))}
            </div>
          )}

          {/* ── DESKTOP TABLE ──────────────────────────────────────────────── */}
          {!loading && (
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <EmptyState search={search} onClear={() => setSearch('')} />
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Class', 'Section', 'Action'].map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-14"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow
                        key={row.Sec_id}
                        row={row}
                        idx={i + 1}
                        editingId={editingId}
                        editValue={editValue}
                        onEdit={handleEdit}
                        onUpdate={handleUpdate}
                        onCancel={handleCancel}
                        onChange={setEditValue}
                        saving={saving}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── MOBILE CARDS ────────────────────────────────────────────────── */}
          {!loading && (
            <div className="md:hidden p-3 space-y-2.5">
              {filtered.length === 0 ? (
                <EmptyState search={search} onClear={() => setSearch('')} />
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1 px-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap <strong>Edit</strong> on any card to rename that section.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard
                      key={row.Sec_id}
                      row={row}
                      idx={i + 1}
                      editingId={editingId}
                      editValue={editValue}
                      onEdit={handleEdit}
                      onUpdate={handleUpdate}
                      onCancel={handleCancel}
                      onChange={setEditValue}
                      saving={saving}
                    />
                  ))}
                </>
              )}
            </div>
          )}

          {/* Table Footer */}
          {!loading && filtered.length > 0 && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>
                {' '}of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{sections.length}</span>
                {' '}sections
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>

      </div>

      {/* Toast */}
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

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-3 text-slate-400 dark:text-slate-600">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Search className="w-6 h-6 opacity-50" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No sections found</p>
        {search && (
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
            No results for{' '}
            <span className="font-semibold text-slate-600 dark:text-slate-300">"{search}"</span>
          </p>
        )}
      </div>
      {search && (
        <button
          onClick={onClear}
          className="text-[13px] text-blue-600 dark:text-blue-400 hover:underline font-medium"
        >
          Clear search
        </button>
      )}
    </div>
  )
}
