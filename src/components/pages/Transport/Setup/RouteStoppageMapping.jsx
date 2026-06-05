/**
 * RouteStoppageMapping.jsx
 * Folder: src/pages/Transport/RouteStoppageMapping.jsx
 *
 * Converts legacy ASPX "Define Transport Stoppage" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session + Route dropdowns
 *  - Autocomplete search for routes
 *  - Checkbox list for stoppages (multi-select, 4-col desktop / 2-col mobile)
 *  - Submit assigns stoppages to route
 *  - GridView with delete action
 *  - Mobile: filter drawer, card-based records
 *  - Desktop: ERP-style dense table
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, MapPin, Bus, Search, Trash2,
  SlidersHorizontal, Navigation, Route,
  Building2, ChevronRight, Plus, CheckSquare,
  Square, Info, LayoutList, Map
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const ROUTES = {
  '2022-23': [
    { id: 1, name: 'Route A - Civil Lines' },
    { id: 2, name: 'Route B - Rajpur Road' },
    { id: 3, name: 'Route C - Saharanpur Road' },
    { id: 4, name: 'Route D - Haridwar Road' },
  ],
  '2023-24': [
    { id: 1, name: 'Route A - Civil Lines' },
    { id: 2, name: 'Route B - Rajpur Road' },
    { id: 3, name: 'Route C - Saharanpur Road' },
    { id: 4, name: 'Route D - Haridwar Road' },
    { id: 5, name: 'Route E - Rishikesh Road' },
  ],
  '2024-25': [
    { id: 1, name: 'Route A - Civil Lines' },
    { id: 2, name: 'Route B - Rajpur Road' },
    { id: 3, name: 'Route C - Saharanpur Road' },
    { id: 4, name: 'Route D - Haridwar Road' },
    { id: 5, name: 'Route E - Rishikesh Road' },
    { id: 6, name: 'Route F - Mussoorie Bypass' },
  ],
  '2025-26': [
    { id: 1, name: 'Route A - Civil Lines' },
    { id: 2, name: 'Route B - Rajpur Road' },
    { id: 3, name: 'Route C - Saharanpur Road' },
    { id: 4, name: 'Route D - Haridwar Road' },
    { id: 5, name: 'Route E - Rishikesh Road' },
    { id: 6, name: 'Route F - Mussoorie Bypass' },
    { id: 7, name: 'Route G - Dehradun Cantt' },
  ],
}

// All possible stoppages
const ALL_STOPPAGES = [
  { id: 101, name: 'Clock Tower' },
  { id: 102, name: 'Paltan Bazaar' },
  { id: 103, name: 'ISBT Dehradun' },
  { id: 104, name: 'Prem Nagar' },
  { id: 105, name: 'Balliwala Chowk' },
  { id: 106, name: 'GMS Road' },
  { id: 107, name: 'Clement Town' },
  { id: 108, name: 'Rajpur Road Turn' },
  { id: 109, name: 'Survey Chowk' },
  { id: 110, name: 'Race Course' },
  { id: 111, name: 'Nehru Colony' },
  { id: 112, name: 'Karanpur' },
  { id: 113, name: 'Saharanpur Road Chowk' },
  { id: 114, name: 'Haridwar Bypass' },
  { id: 115, name: 'Doiwala' },
  { id: 116, name: 'Rishikesh Chowk' },
]

// Pre-mapped stoppages for routes (simulating DB data)
const PRE_MAPPED = {
  1: [101, 102, 103, 109, 110],
  2: [108, 111, 112],
  3: [113, 103, 104],
  4: [114, 115, 103],
  5: [116, 115, 104],
  6: [108, 109],
  7: [102, 110, 111],
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const ROUTE_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const routeColor = (id) => ROUTE_COLORS[(id ?? 0) % ROUTE_COLORS.length]

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
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
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
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
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
        {hint && <span className="text-[10px] normal-case tracking-normal text-slate-400 font-normal ml-1">({hint})</span>}
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

// ─── AUTOCOMPLETE SEARCH ─────────────────────────────────────────────────────
function AutocompleteSearch({ routes, onSelect, value, onChange, disabled }) {
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const ref = useRef(null)

  const suggestions = useMemo(() => {
    if (!value || value.length < 1) return []
    const q = value.toLowerCase()
    return routes.filter(r => r.name.toLowerCase().includes(q)).slice(0, 8)
  }, [value, routes])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={e => { onChange(e.target.value); setOpen(true) }}
          onFocus={() => { setFocused(true); if (value) setOpen(true) }}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          placeholder="Type to search route…"
          className={`w-full pl-8 pr-7 py-2 text-[13px] rounded-lg border outline-none transition-all
            bg-white text-slate-700 placeholder-slate-300
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
            dark:placeholder-slate-600 dark:focus:border-indigo-400
            disabled:opacity-50 disabled:cursor-not-allowed
            border-slate-200`}
        />
        {value && (
          <button
            onClick={() => { onChange(''); setOpen(false) }}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 z-30 bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.25)] rounded-xl shadow-lg overflow-hidden">
          {suggestions.map(r => (
            <button
              key={r.id}
              type="button"
              onMouseDown={() => { onSelect(r); setOpen(false) }}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="text-[13px] text-slate-700 dark:text-slate-200">{r.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── STOPPAGE CHECKBOX LIST ───────────────────────────────────────────────────
function StoppageCheckboxList({ stoppages, selected, onChange, loading }) {
  const toggleAll = () => {
    if (selected.length === stoppages.length) onChange([])
    else onChange(stoppages.map(s => s.id))
  }

  const toggle = (id) => {
    if (selected.includes(id)) onChange(selected.filter(s => s !== id))
    else onChange([...selected, id])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-24 gap-2 text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-[13px]">Loading stoppages…</span>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {/* Select All */}
      <div className="flex items-center justify-between px-1">
        <button
          type="button"
          onClick={toggleAll}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 transition-colors"
        >
          {selected.length === stoppages.length
            ? <CheckSquare className="w-3.5 h-3.5" />
            : <Square className="w-3.5 h-3.5" />}
          {selected.length === stoppages.length ? 'Deselect All' : 'Select All'}
        </button>
        <span className="text-[11px] text-slate-400">
          {selected.length} / {stoppages.length} selected
        </span>
      </div>

      {/* Grid */}
      <div className="border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-xl bg-slate-50 dark:bg-[#1e2238]/50 overflow-hidden">
        <div className="max-h-[180px] overflow-y-auto p-3">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {stoppages.map(s => {
              const checked = selected.includes(s.id)
              return (
                <label
                  key={s.id}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer border transition-all select-none
                    ${checked
                      ? 'bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30'
                      : 'bg-white border-slate-200 dark:bg-[#1a1f35] dark:border-[rgba(99,102,241,0.12)] hover:border-blue-200 dark:hover:border-blue-500/20'
                    }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(s.id)}
                    className="sr-only"
                  />
                  <span className={`w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-all
                    ${checked
                      ? 'bg-blue-600 border-blue-600 dark:bg-indigo-500 dark:border-indigo-500'
                      : 'border-slate-300 dark:border-slate-600'
                    }`}>
                    {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  <span className={`text-[12px] font-medium leading-tight truncate
                    ${checked
                      ? 'text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-400'
                    }`}>
                    {s.name}
                  </span>
                </label>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onDelete }) {
  const { fg, bg } = routeColor(row.route_id)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            <MapPin className="w-3.5 h-3.5" />
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.stoppage_name}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          <Navigation className="w-3 h-3" />
          {row.route_name}
        </span>
      </td>
      <td className="px-4 py-3 text-center text-[12px] text-slate-500 dark:text-slate-400">{row.session}</td>
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onDelete(row.id)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
            border border-rose-200 dark:border-rose-500/20 transition-all active:scale-95"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE RECORD CARD ───────────────────────────────────────────────────────
function MobileRecordCard({ row, onDelete }) {
  const { fg, bg } = routeColor(row.route_id)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 px-4 py-3.5">
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: bg, color: fg }}
        >
          <MapPin className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.stoppage_name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Navigation className="w-3 h-3 text-blue-500" />
            <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{row.route_name}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
            {row.session}
          </span>
          <button
            onClick={() => onDelete(row.id)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
              bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400
              border border-rose-200 dark:border-rose-500/20 transition-all"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, route, setRoute, routes, routeSearch, setRouteSearch, onSelectRoute, errors, setErrors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[80vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35]">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Route</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Route Name" error={errors.route} required>
            <NativeSelect
              value={route}
              onChange={e => { setRoute(e.target.value); setErrors(p => ({ ...p, route: undefined })) }}
              placeholder="-- Select Route --"
              error={errors.route}
              disabled={!session}
            >
              {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Search Route" hint="type to filter">
            <AutocompleteSearch
              routes={routes}
              value={routeSearch}
              onChange={setRouteSearch}
              onSelect={(r) => { setRoute(String(r.id)); setRouteSearch(r.name); onClose() }}
              disabled={!session}
            />
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <button type="button" onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 transition-colors">
            Done
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function RouteStoppageMapping() {
  const [session,       setSession]       = useState('')
  const [route,         setRoute]         = useState('')
  const [routeSearch,   setRouteSearch]   = useState('')
  const [selectedStops, setSelectedStops] = useState([])
  const [submitting,    setSubmitting]    = useState(false)
  const [loadingStops,  setLoadingStops]  = useState(false)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [errors,        setErrors]        = useState({})
  const [toast,         setToast]         = useState(null)
  const [records,       setRecords]       = useState([])   // GridView records
  const [searchRec,     setSearchRec]     = useState('')
  const [mobileTab,     setMobileTab]     = useState('form') // 'form' | 'records'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Routes available for selected session
  const availableRoutes = useMemo(() => ROUTES[session] || [], [session])

  // Selected route object
  const selectedRoute = useMemo(
    () => availableRoutes.find(r => String(r.id) === String(route)),
    [availableRoutes, route]
  )

  // Load stoppages when route changes (simulate API)
  useEffect(() => {
    if (!route) { setSelectedStops([]); return }
    setLoadingStops(true)
    setTimeout(() => {
      const pre = PRE_MAPPED[Number(route)] || []
      setSelectedStops(pre)
      setLoadingStops(false)
    }, 500)
  }, [route])

  // Load existing records when session + route selected
  useEffect(() => {
    if (!session || !route) return
    // Simulate loading mapped records for the GridView
    const pre = PRE_MAPPED[Number(route)] || []
    const routeObj = availableRoutes.find(r => String(r.id) === String(route))
    const mapped = pre.map((sid, i) => {
      const stop = ALL_STOPPAGES.find(s => s.id === sid)
      return {
        id: `${route}-${sid}`,
        stoppage_name: stop?.name || `Stoppage ${sid}`,
        route_id: Number(route),
        route_name: routeObj?.name || '',
        session,
      }
    })
    setRecords(mapped)
  }, [session, route])

  // Submit handler
  const handleSubmit = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!route)   err.route   = 'Please select a route'
    if (selectedStops.length === 0) err.stops = 'Please select at least one stoppage'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setSubmitting(true)

    setTimeout(() => {
      // Build new records from selected stoppages
      const routeObj = availableRoutes.find(r => String(r.id) === String(route))
      const newRecords = selectedStops.map(sid => {
        const stop = ALL_STOPPAGES.find(s => s.id === sid)
        return {
          id: `${route}-${sid}`,
          stoppage_name: stop?.name || `Stoppage ${sid}`,
          route_id: Number(route),
          route_name: routeObj?.name || '',
          session,
        }
      })
      setRecords(newRecords)
      setSubmitting(false)
      setMobileTab('records')
      showToast(`${selectedStops.length} stoppages mapped to ${routeObj?.name}!`)
    }, 800)
  }, [session, route, selectedStops, availableRoutes])

  const handleReset = () => {
    setSession(''); setRoute(''); setRouteSearch('')
    setSelectedStops([]); setErrors({}); setRecords([])
    setMobileTab('form')
  }

  const handleDelete = (id) => {
    setRecords(prev => prev.filter(r => r.id !== id))
    showToast('Stoppage removed from route.', 'success')
  }

  // Filtered records for search
  const filteredRecords = useMemo(() => {
    if (!searchRec) return records
    const q = searchRec.toLowerCase()
    return records.filter(r =>
      r.stoppage_name.toLowerCase().includes(q) ||
      r.route_name.toLowerCase().includes(q)
    )
  }, [records, searchRec])

  return (
    <div className="space-y-4 pb-10">
      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Transport Stoppage
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Map stoppages to transport routes for each session.
          </p>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
            bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
            transition-all active:scale-95 flex-shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      {/* ── MOBILE TAB SWITCHER ─────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/60">
        {[
          { key: 'form', label: 'Map Stoppages', icon: Map },
          { key: 'records', label: `Records${records.length ? ` (${records.length})` : ''}`, icon: LayoutList },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            type="button"
            onClick={() => setMobileTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all
              ${mobileTab === key
                ? 'bg-white dark:bg-[#1a1f35] text-blue-600 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'
              }`}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────── */}
      <div className={`flex sm:hidden gap-2 ${mobileTab !== 'form' ? 'hidden' : ''}`}>
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {session && route
            ? `${session} · ${selectedRoute?.name?.split(' - ')[0] ?? ''}`
            : session ? `${session} — Select Route` : 'Select Session & Route'}
          {(session || route) && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {[session, route].filter(Boolean).length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={(v) => { setSession(v); setRoute(''); setSelectedStops([]) }}
        route={route}
        setRoute={setRoute}
        routes={availableRoutes}
        routeSearch={routeSearch}
        setRouteSearch={setRouteSearch}
        onSelectRoute={(r) => { setRoute(String(r.id)) }}
        errors={errors}
        setErrors={setErrors}
      />

      {/* ── DESKTOP Filter + Form Card ─────────────────────────────────── */}
      <div className={`hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Route className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Route Stoppage Mapping</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Row 1: Session + Route + Search */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => {
                  setSession(e.target.value)
                  setRoute('')
                  setSelectedStops([])
                  setErrors(p => ({ ...p, session: undefined }))
                }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Route Name" error={errors.route} required>
              <NativeSelect
                value={route}
                onChange={e => { setRoute(e.target.value); setErrors(p => ({ ...p, route: undefined })) }}
                placeholder="-- Select Route --"
                error={errors.route}
                disabled={!session}
              >
                {availableRoutes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Search Route" hint="autocomplete">
              <AutocompleteSearch
                routes={availableRoutes}
                value={routeSearch}
                onChange={setRouteSearch}
                onSelect={(r) => { setRoute(String(r.id)); setRouteSearch(r.name) }}
                disabled={!session}
              />
            </Field>

            {/* Submit + Reset */}
            <div className="flex gap-2 items-end">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Submit
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Stoppage Checkbox List */}
          {route && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">
                  Available Stoppages
                  {selectedRoute && (
                    <span className="ml-2 text-[12px] font-normal text-blue-600 dark:text-blue-400">
                      for {selectedRoute.name}
                    </span>
                  )}
                </span>
              </div>
              {errors.stops && (
                <p className="flex items-center gap-1 text-[11px] text-rose-500">
                  <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.stops}
                </p>
              )}
              <StoppageCheckboxList
                stoppages={ALL_STOPPAGES}
                selected={selectedStops}
                onChange={(v) => { setSelectedStops(v); setErrors(p => ({ ...p, stops: undefined })) }}
                loading={loadingStops}
              />
            </div>
          )}

          {!route && (
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Select a session and route to view and manage stoppages.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE FORM TAB ─────────────────────────────────────────────── */}
      {mobileTab === 'form' && (
        <div className="sm:hidden rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Route className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Map Stoppages</span>
          </div>

          <div className="p-4 space-y-4">
            {/* Show selected context */}
            {session && route && selectedRoute && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
                <Navigation className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-blue-700 dark:text-blue-300 truncate">{selectedRoute.name}</p>
                  <p className="text-[11px] text-blue-500 dark:text-blue-400">Session: {session}</p>
                </div>
              </div>
            )}

            {!session && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20">
                <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <p className="text-[12px] text-amber-700 dark:text-amber-400">
                  Tap <strong>Select Session &amp; Route</strong> button above to begin.
                </p>
              </div>
            )}

            {/* Stoppages */}
            {route && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-1 h-4 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Select Stoppages</span>
                </div>
                {errors.stops && (
                  <p className="flex items-center gap-1 text-[11px] text-rose-500">
                    <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.stops}
                  </p>
                )}
                <StoppageCheckboxList
                  stoppages={ALL_STOPPAGES}
                  selected={selectedStops}
                  onChange={(v) => { setSelectedStops(v); setErrors(p => ({ ...p, stops: undefined })) }}
                  loading={loadingStops}
                />
              </div>
            )}

            {/* Submit */}
            {route && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {submitting ? 'Saving…' : 'Submit Mapping'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── RECORDS TABLE ────────────────────────────────────────────────── */}
      <div className={`${mobileTab === 'form' ? 'hidden sm:block' : 'block'} rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden`}>
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
            <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Mapped Stoppages</span>
            {selectedRoute && (
              <span className="text-[13px] text-slate-400 dark:text-slate-500 truncate">· {selectedRoute.name}</span>
            )}
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0">
              {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-52 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={searchRec}
              onChange={e => setSearchRec(e.target.value)}
              placeholder="Search stoppage / route…"
              className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400"
            />
            {searchRec && (
              <button onClick={() => setSearchRec('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              <MapPin className="w-7 h-7 opacity-30" />
              <span className="text-[13px]">
                {records.length === 0
                  ? 'No stoppages mapped yet. Select a route and submit.'
                  : 'No records match your search.'}
              </span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['Sr No.', 'Stoppage Name', 'Route', 'Session', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((row, i) => (
                  <DesktopRow key={row.id} row={row} idx={i + 1} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden p-4 space-y-3">
          {filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-400 dark:text-slate-600">
              <MapPin className="w-7 h-7 opacity-30" />
              <span className="text-[13px] text-center">
                {records.length === 0
                  ? 'No stoppages mapped yet.\nSelect route in "Map Stoppages" tab.'
                  : 'No records match your search.'}
              </span>
            </div>
          ) : (
            filteredRecords.map(row => (
              <MobileRecordCard key={row.id} row={row} onDelete={handleDelete} />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filteredRecords.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span> records
          </p>
          {searchRec && (
            <button onClick={() => setSearchRec('')}
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
