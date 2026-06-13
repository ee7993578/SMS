/**
 * DefineActivity.jsx
 * Folder: src/pages/ExamMaster/DefineActivity.jsx
 *
 * Converts legacy ASPX "Define School Activity" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Date picker (calendar) + Activity textarea form
 *  - Client-side validation (red border on empty required fields)
 *  - Save / Reset actions with toast feedback
 *  - List of defined activities (Date, Activity Name, Edit action)
 *  - Desktop: dense ERP-style table
 *  - Mobile: collapsible cards, full-width stacked form, thumb-friendly buttons
 */

import { useState, useMemo, useCallback } from 'react'
import {
  AlertCircle, X, Check, Loader2, Calendar as CalendarIcon,
  Pencil, RefreshCw, Save, Info, Search,
  ClipboardList, ListChecks, CalendarDays
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const INITIAL_ACTIVITIES = [
  { id: 1, activity_date: '15 Jun', activity: 'Annual Sports Day - Inter House Competition' },
  { id: 2, activity_date: '18 Jun', activity: 'Parent Teacher Meeting for Classes I-V' },
  { id: 3, activity_date: '22 Jun', activity: 'Science Exhibition & Project Display' },
  { id: 4, activity_date: '25 Jun', activity: 'Yoga & Wellness Awareness Camp' },
  { id: 5, activity_date: '30 Jun', activity: 'Inter-School Debate Competition' },
  { id: 6, activity_date: '03 Jul', activity: 'Cultural Fest - Dance & Music Showcase' },
  { id: 7, activity_date: '08 Jul', activity: 'Career Counselling Session for Senior Students' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Formats a Date object to "dd MMM" matching the original CalendarExtender format
const formatDateDDMMM = (date) => {
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const dd = String(date.getDate()).padStart(2, '0')
  return `${dd} ${months[date.getMonth()]}`
}

const todayStr = formatDateDDMMM(new Date())

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

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

// ─── INLINE DATE PICKER (replacement for ajaxToolkit:CalendarExtender) ────────
function DatePickerInput({ value, onChange, error }) {
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(new Date())

  const months = ['January','February','March','April','May','June','July','August','September','October','November','December']
  const monthsShort = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const weekDays = ['Su','Mo','Tu','We','Th','Fr','Sa']

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayOfWeek = new Date(year, month, 1).getDay()

  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1))
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1))

  const handleSelectDay = (day) => {
    const selected = new Date(year, month, day)
    const dd = String(day).padStart(2, '0')
    onChange(`${dd} ${monthsShort[month]}`)
    setOpen(false)
  }

  const today = new Date()
  const isToday = (day) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  return (
    <div className="relative">
      <div className="relative">
        <input
          readOnly
          value={value}
          onClick={() => setOpen(p => !p)}
          placeholder="Select date"
          className={`w-full pl-3 pr-9 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
            bg-white text-slate-800
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
            ${error
              ? 'border-rose-400 ring-2 ring-rose-100'
              : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
            }`}
        />
        <CalendarIcon
          onClick={() => setOpen(p => !p)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 cursor-pointer"
        />
      </div>

      {open && (
        <>
          {/* backdrop for mobile-friendly close */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute z-50 mt-1.5 w-64 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
            bg-white dark:bg-[#1a1f35] shadow-xl p-3 left-0">
            {/* Month/Year nav */}
            <div className="flex items-center justify-between mb-2">
              <button type="button" onClick={handlePrevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                ‹
              </button>
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                {months[month]} {year}
              </span>
              <button type="button" onClick={handleNextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                ›
              </button>
            </div>

            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-1">
              {weekDays.map(d => (
                <div key={d} className="text-center text-[10px] font-semibold text-slate-400 py-1">{d}</div>
              ))}
            </div>

            {/* Days grid */}
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1
                const dd = String(day).padStart(2, '0')
                const label = `${dd} ${monthsShort[month]}`
                const isSelected = value === label
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleSelectDay(day)}
                    className={`h-8 rounded-lg text-[12px] font-medium transition-colors
                      ${isSelected
                        ? 'bg-blue-600 text-white dark:bg-indigo-600'
                        : isToday(day)
                          ? 'bg-blue-50 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-300 font-bold'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                  >
                    {day}
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onEdit }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold
          bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          <CalendarDays className="w-3.5 h-3.5" />
          {row.activity_date}
        </span>
      </td>

      <td className="px-4 py-3">
        <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{row.activity}</span>
      </td>

      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20
            transition-colors"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, onEdit }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* S.No badge */}
        <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold
          bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-300">
          {idx}
        </span>

        <div className="flex-1 min-w-0">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold
            bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 mb-1.5">
            <CalendarDays className="w-3 h-3" />
            {row.activity_date}
          </span>
          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">
            {row.activity}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onEdit(row)}
          className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400
            active:scale-95 transition-all"
        >
          <Pencil className="w-3.5 h-3.5" />
          Edit
        </button>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineActivity() {
  const [activityDate, setActivityDate] = useState(todayStr)
  const [activityText, setActivityText] = useState('')
  const [activities,   setActivities]   = useState(INITIAL_ACTIVITIES)
  const [editingId,    setEditingId]    = useState(null)
  const [saving,       setSaving]       = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation (mirrors original validate() JS function) ──────────────────
  const validate = () => {
    const err = {}
    if (!activityDate.trim()) err.date = 'Date is required'
    if (!activityText.trim()) err.activity = 'Activity is required'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Save (Button1_Click) ───────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!validate()) return
    setSaving(true)

    // TODO: API integration placeholder
    // await fetch('/api/exam-master/define-activity', { method: 'POST', body: ... })
    setTimeout(() => {
      if (editingId) {
        setActivities(prev =>
          prev.map(a => a.id === editingId
            ? { ...a, activity_date: activityDate, activity: activityText }
            : a)
        )
        showToast('Activity updated successfully.')
      } else {
        const newActivity = {
          id: Date.now(),
          activity_date: activityDate,
          activity: activityText,
        }
        setActivities(prev => [newActivity, ...prev])
        showToast('Activity saved successfully.')
      }
      setSaving(false)
      handleReset()
    }, 600)
  }, [activityDate, activityText, editingId])

  // ── Reset (btnSubmit_Click) ────────────────────────────────────────────────
  const handleReset = () => {
    setActivityDate(todayStr)
    setActivityText('')
    setEditingId(null)
    setErrors({})
  }

  // ── Edit (Button2_Click) ───────────────────────────────────────────────────
  const handleEdit = (row) => {
    setActivityDate(row.activity_date)
    setActivityText(row.activity)
    setEditingId(row.id)
    setErrors({})
    // Scroll form into view on mobile for convenience
    document.getElementById('activity-form-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // ── Search filter ───────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return activities
    const q = search.toLowerCase()
    return activities.filter(a =>
      a.activity.toLowerCase().includes(q) ||
      a.activity_date.toLowerCase().includes(q)
    )
  }, [activities, search])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Define School Activity
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Add a date-wise activity and manage the list of defined school activities.
        </p>
      </div>

      {/* ── Form Card ────────────────────────────────────────────────────── */}
      <div id="activity-form-card" className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            {editingId ? 'Edit Activity' : 'Add New Activity'}
          </span>
          {editingId && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              Editing
            </span>
          )}
        </div>

        <div className="p-5">
          {/* Mobile-first stacked grid; widens on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Date" error={errors.date} required>
              <DatePickerInput value={activityDate} onChange={setActivityDate} error={errors.date} />
            </Field>

            <Field label="Enter Activity" error={errors.activity} required>
              <textarea
                value={activityText}
                onChange={e => { setActivityText(e.target.value); setErrors(p => ({ ...p, activity: undefined })) }}
                rows={3}
                placeholder="Describe the school activity..."
                className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
                  bg-white text-slate-800 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                  ${errors.activity
                    ? 'border-rose-400 ring-2 ring-rose-100'
                    : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
                  }`}
              />
            </Field>

            {/* Spacer column on desktop to keep buttons aligned to left, full width on mobile */}
            <div className="hidden sm:block" />
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mt-5">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70 w-full sm:w-auto"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {editingId ? 'Update' : 'Save'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                transition-colors active:scale-95 w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── List Card ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <ListChecks className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Defined Activities</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search activity or date…"
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
            Click Edit to load an activity into the form above for editing.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No activities match your search.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No', 'Date', 'Activity Name', 'Action'].map((h, i) => (
                    <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                      ${i === 0 || i === 3 ? 'text-center' : 'text-left'} ${i === 0 ? 'w-12' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.id} row={row} idx={i + 1} onEdit={handleEdit} />
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
              <span className="text-[13px]">No activities match your search.</span>
            </div>
          ) : (
            filtered.map((row, i) => (
              <MobileCard key={row.id} row={row} idx={i + 1} onEdit={handleEdit} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{activities.length}</span> activities
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
