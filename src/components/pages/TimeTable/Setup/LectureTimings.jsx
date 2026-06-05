/**
 * LectureTimings.jsx
 * Folder: src/pages/Configuration/LectureTimings.jsx
 *
 * Converts legacy ASPX "Timetable Configuration" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session dropdown + Configuration Title input
 *  - Dynamic period rows (Add More / Remove)
 *  - Start Time (Hour:Min AM/PM), Duration, End Time (auto-calc), Break Time
 *  - Save configuration → appears in saved configs list below
 *  - Saved configs: expandable accordion showing period-time breakdown
 *  - Edit config title inline
 *  - Mobile: full-width stacked cards per period, drawer-based controls
 *  - Desktop: dense ERP-style grid table
 */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import {
  Clock, Plus, Trash2, Save, RefreshCw, Edit3, Check, X,
  ChevronDown, ChevronUp, AlertCircle, Loader2, Calendar,
  Settings2, BookOpen, SlidersHorizontal, Info, Eye,
  ClockIcon, ArrowRight, Layers, MoreVertical, Timer,
  Building2, CheckCircle2, PlusCircle, ChevronRight
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const HOURS = Array.from({ length: 13 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const BREAK_OPTS = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55']
const MODES = ['AM', 'PM']

// Dummy saved configurations
const DUMMY_SAVED = [
  {
    id: 1,
    session: '2024-25',
    title: 'Regular School Schedule',
    status: 'Active',
    periods: [
      { lecture: 'Period 1', start: '08:00 AM', duration: '45', end: '08:45 AM', breakTime: '05' },
      { lecture: 'Period 2', start: '08:50 AM', duration: '45', end: '09:35 AM', breakTime: '05' },
      { lecture: 'Recess',   start: '09:40 AM', duration: '20', end: '10:00 AM', breakTime: '00' },
      { lecture: 'Period 3', start: '10:00 AM', duration: '45', end: '10:45 AM', breakTime: '05' },
      { lecture: 'Period 4', start: '10:50 AM', duration: '45', end: '11:35 AM', breakTime: '05' },
      { lecture: 'Lunch',    start: '11:40 AM', duration: '30', end: '12:10 PM', breakTime: '00' },
      { lecture: 'Period 5', start: '12:10 PM', duration: '45', end: '12:55 PM', breakTime: '05' },
      { lecture: 'Period 6', start: '01:00 PM', duration: '45', end: '01:45 PM', breakTime: '00' },
    ],
  },
  {
    id: 2,
    session: '2024-25',
    title: 'Saturday Short Schedule',
    status: 'Active',
    periods: [
      { lecture: 'Period 1', start: '08:00 AM', duration: '40', end: '08:40 AM', breakTime: '05' },
      { lecture: 'Period 2', start: '08:45 AM', duration: '40', end: '09:25 AM', breakTime: '05' },
      { lecture: 'Recess',   start: '09:30 AM', duration: '15', end: '09:45 AM', breakTime: '00' },
      { lecture: 'Period 3', start: '09:45 AM', duration: '40', end: '10:25 AM', breakTime: '05' },
      { lecture: 'Period 4', start: '10:30 AM', duration: '40', end: '11:10 AM', breakTime: '00' },
    ],
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let _idCounter = 100
const uid = () => ++_idCounter

/** Convert h, m, mode → total minutes from midnight */
function toMinutes(h, m, mode) {
  let hr = parseInt(h, 10)
  const mn = parseInt(m, 10)
  if (mode === 'PM' && hr !== 12) hr += 12
  if (mode === 'AM' && hr === 12) hr = 0
  return hr * 60 + mn
}

/** Convert total minutes → { h, m, mode } */
function fromMinutes(totalMin) {
  let h = Math.floor(totalMin / 60) % 24
  const m = totalMin % 60
  const mode = h >= 12 ? 'PM' : 'AM'
  if (h > 12) h -= 12
  if (h === 0) h = 12
  return {
    h: String(h).padStart(2, '0'),
    m: String(m).padStart(2, '0'),
    mode,
  }
}

/** Format a period row's time nicely */
function formatTime(h, m, mode) {
  return `${h}:${m} ${mode}`
}

function createEmptyPeriod(index) {
  return {
    id: uid(),
    lecture: `Period ${index + 1}`,
    startHour: '08',
    startMin: '00',
    startMode: 'AM',
    duration: '45',
    endHour: '08',
    endMin: '45',
    endMode: 'AM',
    breakTime: '05',
  }
}

/** Recalculate end time based on start + duration */
function calcEnd(startH, startM, startMode, durationMin) {
  const startTotal = toMinutes(startH, startM, startMode)
  const endTotal = startTotal + parseInt(durationMin || '0', 10)
  return fromMinutes(endTotal)
}

// ─── PRIMITIVE UI COMPONENTS ──────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, disabled, className = '' }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-2.5 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 border-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, required, error, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── TIME SELECTOR GROUP ──────────────────────────────────────────────────────
function TimeSelector({ hour, min, mode, onHourChange, onMinChange, onModeChange, disabled = false }) {
  return (
    <div className="flex items-center gap-1">
      <NativeSelect value={hour} onChange={e => onHourChange(e.target.value)} disabled={disabled} className="w-14">
        {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
      </NativeSelect>
      <span className="text-slate-400 font-bold text-[12px]">:</span>
      <NativeSelect value={min} onChange={e => onMinChange(e.target.value)} disabled={disabled} className="w-14">
        {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
      </NativeSelect>
      <NativeSelect value={mode} onChange={e => onModeChange(e.target.value)} disabled={disabled} className="w-16">
        {MODES.map(mo => <option key={mo} value={mo}>{mo}</option>)}
      </NativeSelect>
    </div>
  )
}

// ─── PERIOD ROW — DESKTOP TABLE ───────────────────────────────────────────────
function DesktopPeriodRow({ period, index, onUpdate, onRemove, totalPeriods }) {
  const handleStartChange = useCallback((field, val) => {
    const updated = { ...period, [field]: val }
    // Recalculate end time
    const end = calcEnd(updated.startHour, updated.startMin, updated.startMode, updated.duration)
    onUpdate({ ...updated, endHour: end.h, endMin: end.m, endMode: end.mode })
  }, [period, onUpdate])

  const handleDurationChange = useCallback((val) => {
    const end = calcEnd(period.startHour, period.startMin, period.startMode, val)
    onUpdate({ ...period, duration: val, endHour: end.h, endMin: end.m, endMode: end.mode })
  }, [period, onUpdate])

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* Period */}
      <td className="px-3 py-2.5 text-center">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[11px] font-bold">
          {index + 1}
        </span>
      </td>

      {/* Period Name */}
      <td className="px-3 py-2.5">
        <input
          value={period.lecture}
          onChange={e => onUpdate({ ...period, lecture: e.target.value })}
          className="w-28 px-2 py-1 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
            bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 outline-none transition-all"
          placeholder="Period name"
        />
      </td>

      {/* Start Time */}
      <td className="px-3 py-2.5">
        <TimeSelector
          hour={period.startHour} min={period.startMin} mode={period.startMode}
          onHourChange={v => handleStartChange('startHour', v)}
          onMinChange={v => handleStartChange('startMin', v)}
          onModeChange={v => handleStartChange('startMode', v)}
        />
      </td>

      {/* Duration */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1">
          <NativeSelect value={period.duration} onChange={e => handleDurationChange(e.target.value)} className="w-16">
            {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
          </NativeSelect>
          <span className="text-[10px] text-slate-400 whitespace-nowrap">min</span>
        </div>
      </td>

      {/* End Time — read only display */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 whitespace-nowrap tabular-nums">
            <ClockIcon className="w-3 h-3" />
            {formatTime(period.endHour, period.endMin, period.endMode)}
          </span>
        </div>
      </td>

      {/* Break */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-1">
          <NativeSelect value={period.breakTime} onChange={e => onUpdate({ ...period, breakTime: e.target.value })} className="w-16">
            {BREAK_OPTS.map(b => <option key={b} value={b}>{b}</option>)}
          </NativeSelect>
          <span className="text-[10px] text-slate-400">min</span>
        </div>
      </td>

      {/* Remove */}
      <td className="px-3 py-2.5 text-center">
        <button
          onClick={() => onRemove(period.id)}
          disabled={totalPeriods <= 1}
          className="p-1.5 rounded-lg text-slate-300 dark:text-slate-700 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
            dark:hover:text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed opacity-0 group-hover:opacity-100"
          title="Remove period"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  )
}

// ─── PERIOD CARD — MOBILE ─────────────────────────────────────────────────────
function MobilePeriodCard({ period, index, onUpdate, onRemove, totalPeriods }) {
  const [expanded, setExpanded] = useState(true)

  const handleStartChange = useCallback((field, val) => {
    const updated = { ...period, [field]: val }
    const end = calcEnd(updated.startHour, updated.startMin, updated.startMode, updated.duration)
    onUpdate({ ...updated, endHour: end.h, endMin: end.m, endMode: end.mode })
  }, [period, onUpdate])

  const handleDurationChange = useCallback((val) => {
    const end = calcEnd(period.startHour, period.startMin, period.startMode, val)
    onUpdate({ ...period, duration: val, endHour: end.h, endMin: end.m, endMode: end.mode })
  }, [period, onUpdate])

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <span className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </span>
        <div className="flex-1 min-w-0">
          <input
            value={period.lecture}
            onChange={e => onUpdate({ ...period, lecture: e.target.value })}
            className="w-full px-2 py-1 text-[13px] font-semibold rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
              bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 outline-none transition-all"
            placeholder="Period name"
          />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Time summary badge */}
          <span className="hidden xs:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20">
            <ClockIcon className="w-2.5 h-2.5" />
            {formatTime(period.endHour, period.endMin, period.endMode)}
          </span>
          <button
            onClick={() => onRemove(period.id)}
            disabled={totalPeriods <= 1}
            className="p-1.5 rounded-lg text-slate-300 dark:text-slate-700 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10
              dark:hover:text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setExpanded(p => !p)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Card Body */}
      {expanded && (
        <div className="p-4 space-y-4">
          {/* Start Time */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
              Start Time
            </label>
            <div className="flex items-center gap-2">
              <NativeSelect value={period.startHour} onChange={e => handleStartChange('startHour', e.target.value)} className="flex-1">
                {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
              </NativeSelect>
              <span className="text-slate-400 font-bold">:</span>
              <NativeSelect value={period.startMin} onChange={e => handleStartChange('startMin', e.target.value)} className="flex-1">
                {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
              </NativeSelect>
              <NativeSelect value={period.startMode} onChange={e => handleStartChange('startMode', e.target.value)} className="w-20">
                {MODES.map(mo => <option key={mo} value={mo}>{mo}</option>)}
              </NativeSelect>
            </div>
          </div>

          {/* Duration + Break row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
                Duration (min)
              </label>
              <NativeSelect value={period.duration} onChange={e => handleDurationChange(e.target.value)} className="w-full">
                {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
              </NativeSelect>
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
                Break (min)
              </label>
              <NativeSelect value={period.breakTime} onChange={e => onUpdate({ ...period, breakTime: e.target.value })} className="w-full">
                {BREAK_OPTS.map(b => <option key={b} value={b}>{b}</option>)}
              </NativeSelect>
            </div>
          </div>

          {/* End Time display */}
          <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-500/[0.07] border border-emerald-100 dark:border-emerald-500/20 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">End Time</span>
            </div>
            <span className="text-[15px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
              {formatTime(period.endHour, period.endMin, period.endMode)}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SAVED CONFIG CARD ────────────────────────────────────────────────────────
function SavedConfigCard({ config, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const [editTitle, setEditTitle] = useState(false)
  const [title, setTitle] = useState(config.title)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>

        <div className="flex-1 min-w-0">
          {editTitle ? (
            <div className="flex items-center gap-2">
              <input
                autoFocus
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="flex-1 px-2 py-1 text-[13px] font-semibold rounded-lg border border-blue-400 ring-2 ring-blue-100
                  dark:border-indigo-400 dark:ring-indigo-500/20 outline-none
                  bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200"
              />
              <button onClick={() => { onEdit(config.id, title); setEditTitle(false) }}
                className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-200 transition-colors">
                <Check className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => { setTitle(config.title); setEditTitle(false) }}
                className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{title}</span>
              <button onClick={() => setEditTitle(true)}
                className="p-1 rounded-lg text-slate-300 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 dark:hover:text-blue-400 transition-colors">
                <Edit3 className="w-3 h-3" />
              </button>
            </div>
          )}
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Session: {config.session}</span>
            <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{config.periods.length} periods</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              config.status === 'Active'
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>{config.status}</span>
          </div>
        </div>

        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold
            bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400
            hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-500/10 dark:hover:text-blue-400
            transition-colors flex-shrink-0"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">{expanded ? 'Hide' : 'View'}</span>
        </button>
      </div>

      {/* Expanded periods */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-4">
          {/* Desktop table view */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                  {['Sr.', 'Period', 'Start Time', 'Duration', 'End Time', 'Break'].map((h, i) => (
                    <th key={i} className="px-3 py-2 text-left font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[10px]">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {config.periods.map((p, i) => (
                  <tr key={i} className="border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                    <td className="px-3 py-2 text-slate-400 dark:text-slate-600 tabular-nums">{i + 1}</td>
                    <td className="px-3 py-2 font-medium text-slate-700 dark:text-slate-300">{p.lecture}</td>
                    <td className="px-3 py-2 tabular-nums text-slate-600 dark:text-slate-400">{p.start}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold tabular-nums">
                        {p.duration} min
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold tabular-nums">
                        {p.end}
                      </span>
                    </td>
                    <td className="px-3 py-2 tabular-nums text-slate-400 dark:text-slate-600">{p.breakTime} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card view */}
          <div className="sm:hidden space-y-2">
            {config.periods.map((p, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-[rgba(99,102,241,0.08)] px-3 py-2.5">
                <span className="w-5 h-5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 truncate">{p.lecture}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">{p.start} → {p.end}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 tabular-nums block">{p.duration}min</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-600">Brk: {p.breakTime}m</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function LectureTimings() {
  const [session, setSession] = useState('')
  const [configTitle, setConfigTitle] = useState('')
  const [periods, setPeriods] = useState([createEmptyPeriod(0)])
  const [savedConfigs, setSavedConfigs] = useState(DUMMY_SAVED)
  const [loading, setSaving] = useState(false)
  const [toast, setToast] = useState(null)
  const [errors, setErrors] = useState({})
  const [mobileDrawer, setMobileDrawer] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Period CRUD ──────────────────────────────────────────────────────────
  const addPeriod = useCallback(() => {
    setPeriods(prev => [...prev, createEmptyPeriod(prev.length)])
  }, [])

  const removePeriod = useCallback((id) => {
    setPeriods(prev => prev.filter(p => p.id !== id))
  }, [])

  const updatePeriod = useCallback((updated) => {
    setPeriods(prev => prev.map(p => p.id === updated.id ? updated : p))
  }, [])

  // ── Validate & Save ──────────────────────────────────────────────────────
  const handleSave = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!configTitle.trim()) err.configTitle = 'Configuration title is required'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setSaving(true)

    setTimeout(() => {
      const newConfig = {
        id: uid(),
        session,
        title: configTitle.trim(),
        status: 'Active',
        periods: periods.map(p => ({
          lecture: p.lecture,
          start: formatTime(p.startHour, p.startMin, p.startMode),
          duration: p.duration,
          end: formatTime(p.endHour, p.endMin, p.endMode),
          breakTime: p.breakTime,
        })),
      }
      setSavedConfigs(prev => [newConfig, ...prev])
      setSaving(false)
      showToast(`Configuration "${newConfig.title}" saved successfully!`)
      handleClear()
    }, 800)
  }, [session, configTitle, periods])

  const handleClear = () => {
    setSession('')
    setConfigTitle('')
    setPeriods([createEmptyPeriod(0)])
    setErrors({})
  }

  const handleEditTitle = (id, newTitle) => {
    setSavedConfigs(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c))
    showToast('Configuration title updated.')
  }

  // ─── Stats bar ──────────────────────────────────────────────────────────
  const totalDuration = useMemo(
    () => periods.reduce((s, p) => s + parseInt(p.duration || '0', 10), 0),
    [periods]
  )
  const totalBreak = useMemo(
    () => periods.reduce((s, p) => s + parseInt(p.breakTime || '0', 10), 0),
    [periods]
  )

  return (
    <div className="space-y-5 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Timetable Configuration
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Configure period timings, durations, and break schedules for each session.
          </p>
        </div>
        {/* Desktop Save/Clear buttons in header */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <button onClick={handleClear}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Configuration
          </button>
        </div>
      </div>

      {/* ── CONFIGURATION FORM CARD ────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">New Configuration</span>
        </div>

        {/* Session + Title Filters */}
        <div className="p-5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Session" required error={errors.session}>
              <div className="relative">
                <select
                  value={session}
                  onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                  className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
                    bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                    ${errors.session ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                >
                  <option value="">-- Select Session --</option>
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </Field>

            <Field label="Configuration Title" required error={errors.configTitle}>
              <input
                value={configTitle}
                onChange={e => { setConfigTitle(e.target.value); setErrors(p => ({ ...p, configTitle: undefined })) }}
                placeholder="e.g. Regular School Schedule"
                className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                  bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                  placeholder:text-slate-300 dark:placeholder:text-slate-600
                  ${errors.configTitle ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
              />
            </Field>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="flex items-center gap-4 px-5 py-2.5 bg-blue-50/30 dark:bg-blue-500/[0.03] border-b border-blue-100 dark:border-[rgba(99,102,241,0.08)] flex-wrap">
          <div className="flex items-center gap-1.5 text-[12px]">
            <Layers className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
            <span className="text-slate-500 dark:text-slate-400">Periods:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">{periods.length}</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <Timer className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-slate-500 dark:text-slate-400">Teaching Time:</span>
            <span className="font-bold text-emerald-700 dark:text-emerald-400">{totalDuration} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px]">
            <ClockIcon className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-slate-500 dark:text-slate-400">Total Break:</span>
            <span className="font-bold text-amber-700 dark:text-amber-400">{totalBreak} min</span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] ml-auto">
            <Info className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
            <span className="text-blue-600 dark:text-blue-400">End time auto-calculates from start + duration</span>
          </div>
        </div>

        {/* ── DESKTOP PERIOD TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                {['#', 'Period Name', 'Start Time', 'Duration', 'End Time', 'Break Time', ''].map((h, i) => (
                  <th key={i} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period, i) => (
                <DesktopPeriodRow
                  key={period.id}
                  period={period}
                  index={i}
                  onUpdate={updatePeriod}
                  onRemove={removePeriod}
                  totalPeriods={periods.length}
                />
              ))}
            </tbody>
          </table>

          {/* Add More row */}
          <div className="px-4 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
            <button
              onClick={addPeriod}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-semibold
                border border-dashed border-blue-300 dark:border-indigo-500/40 text-blue-600 dark:text-indigo-400
                hover:bg-blue-50 dark:hover:bg-indigo-500/[0.07] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add More Period
            </button>
          </div>
        </div>

        {/* ── MOBILE PERIOD CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {periods.map((period, i) => (
            <MobilePeriodCard
              key={period.id}
              period={period}
              index={i}
              onUpdate={updatePeriod}
              onRemove={removePeriod}
              totalPeriods={periods.length}
            />
          ))}
          <button
            onClick={addPeriod}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
              border-2 border-dashed border-blue-200 dark:border-indigo-500/30 text-blue-600 dark:text-indigo-400
              hover:bg-blue-50 dark:hover:bg-indigo-500/[0.05] transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Add More Period
          </button>
        </div>

        {/* ── FORM FOOTER ── */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          {/* Mobile action buttons */}
          <div className="flex gap-2 w-full sm:hidden">
            <button onClick={handleClear}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Config
            </button>
          </div>

          {/* Desktop info note */}
          <div className="hidden sm:flex items-center gap-2 text-[12px] text-slate-400 dark:text-slate-600">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            End times are automatically calculated from start time + duration.
          </div>
          <div className="hidden sm:flex items-center gap-2 ml-auto">
            <button onClick={handleClear}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button onClick={handleSave} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* ── SAVED CONFIGURATIONS ─────────────────────────────────────────────── */}
      {savedConfigs.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Section Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Saved Configurations</span>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
              {savedConfigs.length} total
            </span>
          </div>

          {/* Config list */}
          <div className="p-4 space-y-3">
            {savedConfigs.map(config => (
              <SavedConfigCard
                key={config.id}
                config={config}
                onEdit={handleEditTitle}
              />
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.01]">
            <p className="text-[12px] text-slate-400 dark:text-slate-600 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 flex-shrink-0" />
              Click "View" on any config to expand period details. Click the edit icon to rename.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
