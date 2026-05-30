/**
 * ExamConfiguration.jsx
 * Converts ASPX "Entrance Exam Configuration" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session & Class dropdowns
 *  - Exam Date picker
 *  - Entry Gate No input
 *  - Reporting / Start / End time selectors (HH:MM AM/PM)
 *  - Student Type (conditional on class selection)
 *  - Add / Edit / Delete rows
 *  - Session filter on grid
 *  - Mobile: form in bottom drawer, grid as cards
 *  - Desktop: full form panel + dense ERP grid
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Plus, X, Check, AlertCircle, Loader2, ChevronDown,
  Calendar, Clock, DoorOpen, BookOpen, Users,
  Pencil, Trash2, Filter, RefreshCw, School2,
  SlidersHorizontal, ChevronRight, ChevronUp,
  Search, Info, ArrowLeft, Save
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  { id: '1',  name: 'Nursery' },
  { id: '2',  name: 'LKG' },
  { id: '3',  name: 'UKG' },
  { id: '4',  name: 'Class I' },
  { id: '5',  name: 'Class II' },
  { id: '6',  name: 'Class III' },
  { id: '7',  name: 'Class IV' },
  { id: '8',  name: 'Class V' },
  { id: '9',  name: 'Class VI' },
  { id: '10', name: 'Class VII' },
  { id: '11', name: 'Class VIII' },
  { id: '12', name: 'Class IX' },
  { id: '13', name: 'Class X' },
  { id: '14', name: 'Class XI' },
  { id: '15', name: 'Class XII' },
]

// Classes that require student type selection (XI, XII = only new admissions)
const CLASSES_WITH_STUDENT_TYPE = ['14', '15']

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
const MINUTES = ['00', '15', '30', '45']
const MERIDIEM = ['AM', 'PM']

// ── Seed dummy data ───────────────────────────────────────────────────────────
const SEED_DATA = [
  {
    id: 1,
    classId: '4', className: 'Class I', examSession: '2025-26',
    examDate: '2025-07-15', examReportingTime: '08:30 AM',
    examStartTime: '09:00 AM', examEndTime: '11:00 AM',
    examEntryGateNO: 'Gate 1', studentType: 'Internal',
  },
  {
    id: 2,
    classId: '9', className: 'Class VI', examSession: '2025-26',
    examDate: '2025-07-16', examReportingTime: '07:45 AM',
    examStartTime: '08:15 AM', examEndTime: '10:15 AM',
    examEntryGateNO: 'Gate 2', studentType: '',
  },
  {
    id: 3,
    classId: '14', className: 'Class XI', examSession: '2024-25',
    examDate: '2024-06-10', examReportingTime: '09:00 AM',
    examStartTime: '09:30 AM', examEndTime: '12:30 PM',
    examEntryGateNO: 'Gate A', studentType: 'External',
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let nextId = 10
const genId = () => ++nextId

const fmtDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const timeStr = (h, m, mer) => `${h}:${m} ${mer}`

const emptyForm = () => ({
  classId: '0',
  examSession: '0',
  examDate: '',
  entryGateNo: '',
  reportingHour: '08', reportingMinute: '00', reportingMeridiem: 'AM',
  startHour: '09',     startMinute: '00',     startMeridiem: 'AM',
  endHour: '11',       endMinute: '00',       endMeridiem: 'AM',
  studentType: '',
})

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}
          ${className}`}
      >
        {placeholder && <option value="0">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
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
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'toastUp .25s ease' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  )
}

// ── Inline time picker: HH : MM AM/PM ────────────────────────────────────────
function TimePicker({ label, hour, minute, meridiem, onHour, onMinute, onMeridiem }) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <select
            value={hour}
            onChange={e => onHour(e.target.value)}
            className="w-full appearance-none pl-2 pr-6 py-2.5 text-[13px] rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
        <span className="text-slate-400 font-bold text-[14px] flex-shrink-0">:</span>
        <div className="relative flex-1">
          <select
            value={minute}
            onChange={e => onMinute(e.target.value)}
            className="w-full appearance-none pl-2 pr-6 py-2.5 text-[13px] rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
        <div className="relative">
          <select
            value={meridiem}
            onChange={e => onMeridiem(e.target.value)}
            className="appearance-none pl-2 pr-6 py-2.5 text-[13px] rounded-xl border border-slate-200 bg-white text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 cursor-pointer"
          >
            {MERIDIEM.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </Field>
  )
}

// ─── BADGE ────────────────────────────────────────────────────────────────────
const CLASS_PALETTE = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_PALETTE[(name.charCodeAt(0) ?? 0) % CLASS_PALETTE.length]
const classAbbr  = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-[9990] backdrop-blur-sm" onClick={onCancel} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[9991] w-[92vw] max-w-sm bg-white rounded-2xl shadow-2xl p-6 border border-slate-100">
        <div className="flex items-start gap-3 mb-5">
          <span className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600" />
          </span>
          <div>
            <p className="text-[14px] font-bold text-slate-800">Delete Record</p>
            <p className="text-[13px] text-slate-500 mt-0.5">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
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

// ─── FORM COMPONENT (shared between desktop panel + mobile drawer) ─────────────
function ExamForm({ form, setForm, errors, onSave, onCancel, saving, editId }) {
  const showStudentType = CLASSES_WITH_STUDENT_TYPE.includes(form.classId)

  const set = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }))

  return (
    <div className="space-y-5">
      {/* Row 1: Session + Class */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Session" error={errors.examSession} required>
          <NativeSelect value={form.examSession} onChange={set('examSession')} placeholder="-- Select Session --" error={errors.examSession}>
            {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
          </NativeSelect>
        </Field>
        <Field label="Class" error={errors.classId} required>
          <NativeSelect value={form.classId} onChange={set('classId')} placeholder="-- Select Class --" error={errors.classId}>
            {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </NativeSelect>
        </Field>
      </div>

      {/* Row 2: Exam Date + Entry Gate */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Exam Date" error={errors.examDate} required>
          <div className="relative">
            <input
              type="date"
              value={form.examDate}
              onChange={set('examDate')}
              className={`w-full pl-3 pr-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                ${errors.examDate ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
            />
          </div>
        </Field>
        <Field label="Entry Gate No" error={errors.entryGateNo} required>
          <input
            type="text"
            value={form.entryGateNo}
            onChange={set('entryGateNo')}
            placeholder="e.g. Gate 1"
            className={`w-full pl-3 pr-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
              bg-white text-slate-800 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              ${errors.entryGateNo ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'}`}
          />
        </Field>
      </div>

      {/* Row 3: Time pickers */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <TimePicker
          label="Reporting Time"
          hour={form.reportingHour} minute={form.reportingMinute} meridiem={form.reportingMeridiem}
          onHour={v => setForm(p => ({ ...p, reportingHour: v }))}
          onMinute={v => setForm(p => ({ ...p, reportingMinute: v }))}
          onMeridiem={v => setForm(p => ({ ...p, reportingMeridiem: v }))}
        />
        <TimePicker
          label="Start Time"
          hour={form.startHour} minute={form.startMinute} meridiem={form.startMeridiem}
          onHour={v => setForm(p => ({ ...p, startHour: v }))}
          onMinute={v => setForm(p => ({ ...p, startMinute: v }))}
          onMeridiem={v => setForm(p => ({ ...p, startMeridiem: v }))}
        />
        <TimePicker
          label="End Time"
          hour={form.endHour} minute={form.endMinute} meridiem={form.endMeridiem}
          onHour={v => setForm(p => ({ ...p, endHour: v }))}
          onMinute={v => setForm(p => ({ ...p, endMinute: v }))}
          onMeridiem={v => setForm(p => ({ ...p, endMeridiem: v }))}
        />
      </div>

      {/* Conditional: Student Type */}
      {showStudentType && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Student Type">
            <NativeSelect value={form.studentType} onChange={set('studentType')} placeholder="-- Select Type --">
              <option value="External">External</option>
              <option value="Internal">Internal</option>
            </NativeSelect>
          </Field>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-bold text-white
            bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
            transition-all active:scale-95 disabled:opacity-70"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {editId ? 'Update' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold
            bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <X className="w-4 h-4" /> Cancel
        </button>
      </div>
    </div>
  )
}

// ─── MOBILE DRAWER FORM ───────────────────────────────────────────────────────
function FormDrawer({ open, onClose, children, editId }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl border-t border-slate-200 max-h-[92vh] overflow-y-auto"
        style={{ animation: 'drawerUp .3s cubic-bezier(.32,1,.23,1)' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 sticky top-6 bg-white z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              {editId ? <Pencil className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-blue-600" />}
            </span>
            <span className="text-[15px] font-bold text-slate-800">
              {editId ? 'Edit Exam Config' : 'New Exam Config'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="px-5 py-5">{children}</div>
      </div>
    </>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileExamCard({ row, onEdit, onDelete, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.className)

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-50/60 transition-colors"
      >
        <span className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold" style={{ background: bg, color: fg }}>
          {classAbbr(row.className)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 leading-tight">{row.className}</p>
          <p className="text-[12px] text-slate-400 mt-0.5">
            {fmtDate(row.examDate)} · Gate: <span className="text-slate-600 font-semibold">{row.examEntryGateNO}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">{row.examSession}</span>
          {row.studentType && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${row.studentType === 'External' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {row.studentType}
            </span>
          )}
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pt-3 pb-4 space-y-3" style={{ animation: 'fadeIn .15s ease' }}>
          <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(-4px)}to{opacity:1;transform:translateY(0)}}`}</style>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Reporting', value: row.examReportingTime, color: 'blue' },
              { label: 'Start', value: row.examStartTime, color: 'emerald' },
              { label: 'End', value: row.examEndTime, color: 'rose' },
            ].map(t => (
              <div key={t.label} className={`rounded-xl p-2.5 text-center bg-${t.color}-50 border border-${t.color}-100`}>
                <Clock className={`w-3.5 h-3.5 text-${t.color}-500 mx-auto mb-1`} />
                <p className={`text-[13px] font-bold text-${t.color}-700 tabular-nums`}>{t.value}</p>
                <p className={`text-[10px] font-semibold uppercase tracking-wide text-${t.color}-500 mt-0.5`}>{t.label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" /> Edit
            </button>
            <button
              onClick={() => onDelete(row)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ExamConfiguration() {
  const [records, setRecords]         = useState(SEED_DATA)
  const [form, setForm]               = useState(emptyForm())
  const [errors, setErrors]           = useState({})
  const [showForm, setShowForm]       = useState(false)   // desktop panel
  const [drawerOpen, setDrawerOpen]   = useState(false)   // mobile drawer
  const [editId, setEditId]           = useState(null)
  const [saving, setSaving]           = useState(false)
  const [gridSession, setGridSession] = useState('')
  const [search, setSearch]           = useState('')
  const [toast, setToast]             = useState(null)
  const [confirm, setConfirm]         = useState(null)    // { row }

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate form ────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (form.examSession === '0') err.examSession = 'Select a session'
    if (form.classId === '0')      err.classId     = 'Select a class'
    if (!form.examDate)            err.examDate    = 'Select exam date'
    if (!form.entryGateNo.trim())  err.entryGateNo = 'Enter entry gate no'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Open form for new ────────────────────────────────────────────────────
  const openNew = () => {
    setForm(emptyForm())
    setErrors({})
    setEditId(null)
    setShowForm(true)
    setDrawerOpen(true)
  }

  // ── Open form for edit ───────────────────────────────────────────────────
  const openEdit = (row) => {
    const [rh, rm, rmer] = row.examReportingTime.split(/[: ]/)
    const [sh, sm, smer] = row.examStartTime.split(/[: ]/)
    const [eh, em, emer] = row.examEndTime.split(/[: ]/)
    setForm({
      classId: row.classId,
      examSession: row.examSession,
      examDate: row.examDate,
      entryGateNo: row.examEntryGateNO,
      reportingHour: rh, reportingMinute: rm, reportingMeridiem: rmer,
      startHour: sh, startMinute: sm, startMeridiem: smer,
      endHour: eh, endMinute: em, endMeridiem: emer,
      studentType: row.studentType || '',
    })
    setErrors({})
    setEditId(row.id)
    setShowForm(true)
    setDrawerOpen(true)
  }

  const closeForm = () => {
    setShowForm(false)
    setDrawerOpen(false)
    setEditId(null)
    setErrors({})
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!validate()) return
    setSaving(true)
    const className = CLASSES.find(c => c.id === form.classId)?.name || ''
    const newRecord = {
      id: editId || genId(),
      classId: form.classId,
      className,
      examSession: form.examSession,
      examDate: form.examDate,
      examReportingTime: timeStr(form.reportingHour, form.reportingMinute, form.reportingMeridiem),
      examStartTime: timeStr(form.startHour, form.startMinute, form.startMeridiem),
      examEndTime: timeStr(form.endHour, form.endMinute, form.endMeridiem),
      examEntryGateNO: form.entryGateNo,
      studentType: CLASSES_WITH_STUDENT_TYPE.includes(form.classId) ? form.studentType : '',
    }
    setTimeout(() => {
      if (editId) {
        setRecords(p => p.map(r => r.id === editId ? newRecord : r))
        showToast('Record updated successfully.')
      } else {
        setRecords(p => [...p, newRecord])
        showToast('Exam configuration saved.')
      }
      setSaving(false)
      closeForm()
    }, 600)
  }, [form, editId])

  // ── Delete ───────────────────────────────────────────────────────────────
  const handleDeleteConfirm = (row) => setConfirm({ row })
  const doDelete = () => {
    setRecords(p => p.filter(r => r.id !== confirm.row.id))
    setConfirm(null)
    showToast('Record deleted.', 'error')
  }

  // ── Grid filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = records
    if (gridSession) r = r.filter(x => x.examSession === gridSession)
    if (search) {
      const q = search.toLowerCase()
      r = r.filter(x => x.className.toLowerCase().includes(q) || x.examEntryGateNO.toLowerCase().includes(q) || x.examSession.includes(q))
    }
    return r
  }, [records, gridSession, search])

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-6 space-y-5 pb-24 sm:pb-10">

        {/* ── Page Header ───────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <nav className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-2">
              <span>Home</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600 font-semibold">Entrance Exam Configuration</span>
            </nav>
            <h1 className="text-[22px] font-extrabold text-slate-800 flex items-center gap-2.5 tracking-tight">
              <span className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-blue-600" />
              </span>
              Entrance Exam Configuration
            </h1>
            <p className="text-[13px] text-slate-500 mt-0.5 ml-11">Manage exam schedules, timings & gate assignments.</p>
          </div>
          {/* Desktop Add button */}
          <button
            onClick={openNew}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white
              bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 flex-shrink-0 self-start mt-6"
          >
            <Plus className="w-4 h-4" /> Add New
          </button>
        </div>

        {/* ── Desktop Form Panel ─────────────────────────────────────────── */}
        {showForm && (
          <div className="hidden sm:block rounded-2xl border border-blue-200 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
                {editId ? <Pencil className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-blue-600" />}
              </span>
              <span className="text-[15px] font-bold text-slate-800">
                {editId ? 'Edit Exam Configuration' : 'New Exam Configuration'}
              </span>
              <button onClick={closeForm} className="ml-auto p-1.5 rounded-xl hover:bg-blue-100 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-6">
              <ExamForm
                form={form} setForm={setForm} errors={errors}
                onSave={handleSave} onCancel={closeForm}
                saving={saving} editId={editId}
              />
            </div>
          </div>
        )}

        {/* ── Grid Card ──────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 border-b border-slate-100 bg-slate-50/70">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <School2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700">Exam Configurations</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 flex-shrink-0">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Session filter */}
              <div className="relative">
                <select
                  value={gridSession}
                  onChange={e => setGridSession(e.target.value)}
                  className="appearance-none pl-3 pr-8 py-2 text-[12px] rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-400 cursor-pointer"
                >
                  <option value="">All Sessions</option>
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              </div>
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="pl-8 pr-7 py-2 text-[12px] rounded-xl border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-400 w-36 sm:w-44 placeholder-slate-300"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              {/* Reset */}
              <button onClick={() => { setGridSession(''); setSearch('') }}
                className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400">
                <Search className="w-7 h-7 opacity-30" />
                <span className="text-[13px]">No records found. {!records.length ? 'Add a new configuration.' : 'Try adjusting filters.'}</span>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    {['S.No.', 'Class', 'Exam Date', 'Reporting Time', 'Start Time', 'End Time', 'Gate No', 'Session', 'Student Type', 'Actions'].map((h, i) => (
                      <th key={i} className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => {
                    const { fg, bg } = classColor(row.className)
                    return (
                      <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
                        <td className="px-4 py-3 text-[12px] text-slate-400 tabular-nums w-10">{i + 1}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background: bg, color: fg }}>
                              {classAbbr(row.className)}
                            </span>
                            <span className="text-[13px] font-semibold text-slate-700 whitespace-nowrap">{row.className}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-600 whitespace-nowrap">{fmtDate(row.examDate)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[12px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg font-medium">
                            <Clock className="w-3 h-3" />{row.examReportingTime}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[12px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg font-medium">
                            <Clock className="w-3 h-3" />{row.examStartTime}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[12px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded-lg font-medium">
                            <Clock className="w-3 h-3" />{row.examEndTime}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-[12px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-lg font-medium">
                            <DoorOpen className="w-3 h-3" />{row.examEntryGateNO}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">{row.examSession}</span>
                        </td>
                        <td className="px-4 py-3">
                          {row.studentType ? (
                            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${row.studentType === 'External' ? 'bg-violet-100 text-violet-700' : 'bg-teal-100 text-teal-700'}`}>
                              {row.studentType}
                            </span>
                          ) : <span className="text-slate-300 text-[12px]">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => openEdit(row)}
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteConfirm(row)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* ── MOBILE CARDS ── */}
          <div className="md:hidden p-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                <Search className="w-6 h-6 opacity-30" />
                <span className="text-[13px]">{!records.length ? 'No configurations yet.' : 'No records match filters.'}</span>
              </div>
            ) : (
              filtered.map((row, i) => (
                <MobileExamCard
                  key={row.id}
                  row={row}
                  idx={i + 1}
                  onEdit={openEdit}
                  onDelete={handleDeleteConfirm}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
            <p className="text-[12px] text-slate-400">
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{records.length}</span> records
            </p>
            {(gridSession || search) && (
              <button onClick={() => { setGridSession(''); setSearch('') }}
                className="text-[12px] text-blue-600 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── MOBILE FAB (Add New) ──────────────────────────────────────────── */}
      <button
        onClick={openNew}
        className="fixed bottom-6 right-5 sm:hidden z-30 flex items-center gap-2 px-5 py-3.5 rounded-2xl
          bg-blue-600 text-white shadow-xl shadow-blue-500/30 text-[14px] font-bold
          active:scale-95 transition-transform"
      >
        <Plus className="w-5 h-5" /> Add New
      </button>

      {/* ── MOBILE FORM DRAWER ──────────────────────────────────────────────── */}
      <FormDrawer open={drawerOpen} onClose={closeForm} editId={editId}>
        <ExamForm
          form={form} setForm={setForm} errors={errors}
          onSave={handleSave} onCancel={closeForm}
          saving={saving} editId={editId}
        />
      </FormDrawer>

      {/* Confirm Delete */}
      <ConfirmDialog
        open={!!confirm}
        message={confirm ? `Delete config for ${confirm.row.className} (${confirm.row.examSession})?` : ''}
        onConfirm={doDelete}
        onCancel={() => setConfirm(null)}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
