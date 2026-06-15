/**
 * Roles_Permission.jsx
 * Folder: src/pages/Configuration/Roles_Permission.jsx
 *
 * Converts legacy ASPX "Assign Roles" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Role dropdown → shows Staff + Module dropdowns
 *  - Add New Role: Role Name + Code + Save
 *  - Select Class checkboxes (All + individual)
 *  - Module GridView with nested sub-module permission checkboxes
 *  - Select All per sub-module
 *  - Submit per module row
 *  - Mobile: stacked cards with accordion sub-modules
 *  - Desktop: dense ERP-style nested table
 */

import { useState, useMemo, useCallback, useEffect } from 'react'
import {
  ChevronDown, ChevronRight, AlertCircle, X, Check, Loader2,
  Shield, Users, BookOpen, Settings2, SlidersHorizontal,
  RefreshCw, Save, Plus, CheckSquare, Square, Info,
  ChevronUp, Layout, Search, Building2
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const ROLES = [
  { id: '1', name: 'Admin' },
  { id: '2', name: 'Principal' },
  { id: '3', name: 'Teacher' },
  { id: '4', name: 'Accountant' },
  { id: '5', name: 'Librarian' },
  { id: '6', name: 'Receptionist' },
]

const STAFF_LIST = [
  { id: '101', name: 'Ramesh Kumar' },
  { id: '102', name: 'Sunita Sharma' },
  { id: '103', name: 'Ajay Verma' },
  { id: '104', name: 'Priya Singh' },
  { id: '105', name: 'Mohit Agarwal' },
]

const CLASSES = [
  'Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III',
  'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const MODULES_DATA = [
  {
    module_id: 'M1',
    module_name: 'Student Management',
    status: '1',
    pages: [
      { pageid: 'P1', Page_name: 'Student Registration', module_id: 'M1' },
      { pageid: 'P2', Page_name: 'Student List', module_id: 'M1' },
      { pageid: 'P3', Page_name: 'Student Profile', module_id: 'M1' },
      { pageid: 'P4', Page_name: 'Bulk Import', module_id: 'M1' },
    ],
  },
  {
    module_id: 'M2',
    module_name: 'Attendance',
    status: '1',
    pages: [
      { pageid: 'P5', Page_name: 'Mark Attendance', module_id: 'M2' },
      { pageid: 'P6', Page_name: 'Attendance Report', module_id: 'M2' },
      { pageid: 'P7', Page_name: 'Leave Management', module_id: 'M2' },
    ],
  },
  {
    module_id: 'M3',
    module_name: 'Fee Management',
    status: '0',
    pages: [
      { pageid: 'P8',  Page_name: 'Fee Collection', module_id: 'M3' },
      { pageid: 'P9',  Page_name: 'Fee Structure', module_id: 'M3' },
      { pageid: 'P10', Page_name: 'Due Report', module_id: 'M3' },
      { pageid: 'P11', Page_name: 'Receipt Print', module_id: 'M3' },
    ],
  },
  {
    module_id: 'M4',
    module_name: 'Examination',
    status: '1',
    pages: [
      { pageid: 'P12', Page_name: 'Exam Schedule', module_id: 'M4' },
      { pageid: 'P13', Page_name: 'Result Entry', module_id: 'M4' },
      { pageid: 'P14', Page_name: 'Mark Sheet', module_id: 'M4' },
    ],
  },
  {
    module_id: 'M5',
    module_name: 'Library',
    status: '0',
    pages: [
      { pageid: 'P15', Page_name: 'Book Issue', module_id: 'M5' },
      { pageid: 'P16', Page_name: 'Book Return', module_id: 'M5' },
      { pageid: 'P17', Page_name: 'Catalogue', module_id: 'M5' },
    ],
  },
  {
    module_id: 'M6',
    module_name: 'Transport',
    status: '1',
    pages: [
      { pageid: 'P18', Page_name: 'Route Management', module_id: 'M6' },
      { pageid: 'P19', Page_name: 'Vehicle List', module_id: 'M6' },
      { pageid: 'P20', Page_name: 'Driver Assignment', module_id: 'M6' },
    ],
  },
]

// Permissions available per sub-module page
const PERMISSIONS = ['View', 'Add', 'Edit', 'Delete']

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const MODULE_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const moduleColor = (id) => MODULE_COLORS[(parseInt(id?.replace('M','') || 0) - 1) % MODULE_COLORS.length]

// Build initial permission state: { [module_id]: { enabled: bool, pages: { [pageid]: { [perm]: bool } } } }
const buildInitialPerms = (modules) => {
  const state = {}
  modules.forEach(mod => {
    state[mod.module_id] = {
      enabled: mod.status === '1',
      pages: {},
    }
    mod.pages.forEach(page => {
      state[mod.module_id].pages[page.pageid] = {
        View: false, Add: false, Edit: false, Delete: false,
      }
    })
  })
  return state
}

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
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3
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

// ─── PERMISSION CHECKBOX ROW ──────────────────────────────────────────────────

function PermCheckbox({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-1.5 cursor-pointer select-none group">
      <div
        onClick={onChange}
        className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
          ${checked
            ? 'bg-blue-600 border-blue-600 dark:bg-indigo-500 dark:border-indigo-500'
            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2238] group-hover:border-blue-400'
          }`}
      >
        {checked && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
      </div>
      <span className={`text-[12px] font-medium transition-colors ${checked ? 'text-blue-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-400'}`}>
        {label}
      </span>
    </label>
  )
}

// ─── MODULE PERMISSION ROW — SUB-MODULE PAGE ──────────────────────────────────

function SubModuleRow({ page, perms, onPermChange, onSelectAll }) {
  const allChecked = PERMISSIONS.every(p => perms[p])
  const someChecked = PERMISSIONS.some(p => perms[p])

  return (
    <div className="border border-slate-200 dark:border-[rgba(99,102,241,0.15)] rounded-xl overflow-hidden">
      {/* Page name + Select All */}
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <div className="flex items-center gap-2 min-w-0">
          <BookOpen className="w-3.5 h-3.5 text-blue-500 dark:text-indigo-400 flex-shrink-0" />
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{page.Page_name}</span>
        </div>
        <label className="flex items-center gap-1.5 cursor-pointer select-none flex-shrink-0" onClick={onSelectAll}>
          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
            ${allChecked ? 'bg-blue-600 border-blue-600 dark:bg-indigo-500 dark:border-indigo-500'
              : someChecked ? 'bg-blue-200 border-blue-400 dark:bg-indigo-500/30 dark:border-indigo-400'
              : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2238]'}`}>
            {allChecked && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
            {!allChecked && someChecked && <div className="w-1.5 h-0.5 bg-blue-600 dark:bg-indigo-400 rounded" />}
          </div>
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">All</span>
        </label>
      </div>

      {/* Permission checkboxes */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-4 py-3">
        {PERMISSIONS.map(perm => (
          <PermCheckbox
            key={perm}
            label={perm}
            checked={perms[perm]}
            onChange={() => onPermChange(perm)}
          />
        ))}
      </div>
    </div>
  )
}

// ─── MODULE CARD (Mobile) ─────────────────────────────────────────────────────

function ModuleCard({ mod, perms, onToggleModule, onPermChange, onSelectAllPage, onSubmit, saving }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = moduleColor(mod.module_id)
  const enabledCount = mod.pages.filter(p =>
    PERMISSIONS.some(perm => perms.pages[p.pageid]?.[perm])
  ).length

  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm transition-all
      ${perms.enabled
        ? 'border-blue-200 dark:border-indigo-500/30'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.12)]'}
      bg-white dark:bg-[#1a1f35]`}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        {/* Module toggle */}
        <div
          onClick={() => onToggleModule(mod.module_id)}
          className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center cursor-pointer transition-all
            ${perms.enabled ? '' : 'opacity-40'}`}
          style={{ background: bg, color: fg }}
        >
          <Shield className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0" onClick={() => setExpanded(p => !p)}>
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{mod.module_name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {enabledCount}/{mod.pages.length} pages configured
          </p>
        </div>

        {/* Module enable toggle */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onToggleModule(mod.module_id)}
            className={`relative w-9 h-5 rounded-full transition-all flex-shrink-0 ${perms.enabled ? 'bg-blue-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
          >
            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${perms.enabled ? 'left-[18px]' : 'left-0.5'}`} />
          </button>
          <button onClick={() => setExpanded(p => !p)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Sub-modules */}
      {expanded && perms.enabled && (
        <div className="p-4 space-y-3">
          {mod.pages.map(page => (
            <SubModuleRow
              key={page.pageid}
              page={page}
              perms={perms.pages[page.pageid] || {}}
              onPermChange={(perm) => onPermChange(mod.module_id, page.pageid, perm)}
              onSelectAll={() => onSelectAllPage(mod.module_id, page.pageid)}
            />
          ))}
          <button
            onClick={() => onSubmit(mod.module_id)}
            disabled={saving === mod.module_id}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all active:scale-[0.98] disabled:opacity-70 mt-1"
          >
            {saving === mod.module_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save {mod.module_name} Permissions
          </button>
        </div>
      )}

      {expanded && !perms.enabled && (
        <div className="px-4 py-6 text-center">
          <p className="text-[13px] text-slate-400 dark:text-slate-500">Enable this module to configure permissions.</p>
        </div>
      )}
    </div>
  )
}

// ─── MODULE TABLE ROW (Desktop) ───────────────────────────────────────────────

function ModuleTableRow({ mod, perms, onToggleModule, onPermChange, onSelectAllPage, onSubmit, saving }) {
  const [expanded, setExpanded] = useState(true)
  const { fg, bg } = moduleColor(mod.module_id)

  return (
    <>
      {/* Module header row */}
      <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]
        ${perms.enabled ? 'bg-slate-50/40 dark:bg-white/[0.015]' : 'bg-slate-50/20 dark:bg-transparent opacity-60'}`}>

        {/* S.No */}
        <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 w-10 align-top pt-4">
          {mod.module_id.replace('M','')}
        </td>

        {/* Module name + toggle */}
        <td className="px-3 py-3 align-top w-44">
          <div className="flex items-start gap-2.5">
            <div
              onClick={() => onToggleModule(mod.module_id)}
              className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center cursor-pointer mt-0.5 transition-all"
              style={{ background: bg, color: fg }}
            >
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug">{mod.module_name}</p>
              <button
                onClick={() => onToggleModule(mod.module_id)}
                className={`relative mt-1 w-8 h-4 rounded-full transition-all flex-shrink-0 ${perms.enabled ? 'bg-blue-600 dark:bg-indigo-500' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${perms.enabled ? 'left-[17px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </td>

        {/* Pages + permissions */}
        <td className="px-3 py-3" colSpan={2}>
          {perms.enabled ? (
            <div>
              <button
                onClick={() => setExpanded(p => !p)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-indigo-400 mb-2 hover:underline"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? 'Collapse' : 'Expand'} ({mod.pages.length} sub-modules)
              </button>
              {expanded && (
                <div className="space-y-2">
                  {mod.pages.map(page => (
                    <SubModuleRow
                      key={page.pageid}
                      page={page}
                      perms={perms.pages[page.pageid] || {}}
                      onPermChange={(perm) => onPermChange(mod.module_id, page.pageid, perm)}
                      onSelectAll={() => onSelectAllPage(mod.module_id, page.pageid)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="text-[12px] text-slate-400 dark:text-slate-500 italic">Module disabled</span>
          )}
        </td>

        {/* Submit button */}
        <td className="px-3 py-3 align-top w-28">
          <button
            onClick={() => onSubmit(mod.module_id)}
            disabled={saving === mod.module_id || !perms.enabled}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all active:scale-95 disabled:opacity-50 whitespace-nowrap"
          >
            {saving === mod.module_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            Submit
          </button>
        </td>
      </tr>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function RolesPermission() {
  // ── Filter state ──────────────────────────────────────────────────────────
  const [selectedRole,   setSelectedRole]   = useState('')
  const [selectedStaff,  setSelectedStaff]  = useState('')
  const [selectedModule, setSelectedModule] = useState('')

  // ── Add new role panel ────────────────────────────────────────────────────
  const [showAddRole,  setShowAddRole]  = useState(false)
  const [newRoleName,  setNewRoleName]  = useState('')
  const [newRoleCode,  setNewRoleCode]  = useState('')
  const [roleSaving,   setRoleSaving]   = useState(false)

  // ── Class selection ───────────────────────────────────────────────────────
  const [allClasses,      setAllClasses]      = useState(false)
  const [selectedClasses, setSelectedClasses] = useState([])

  // ── Module permissions ────────────────────────────────────────────────────
  const [perms, setPerms] = useState(() => buildInitialPerms(MODULES_DATA))
  const [saving, setSaving] = useState(null)

  // ── UI state ──────────────────────────────────────────────────────────────
  const [errors,    setErrors]    = useState({})
  const [toast,     setToast]     = useState(null)
  const [mobileTab, setMobileTab] = useState('config') // 'config' | 'modules'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Role change handler ───────────────────────────────────────────────────
  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value)
    setSelectedStaff('')
    setSelectedModule('')
    setShowAddRole(false)
    setErrors({})
    // Reset classes & perms on role change
    setSelectedClasses([])
    setAllClasses(false)
    setPerms(buildInitialPerms(MODULES_DATA))
  }

  // ── Class checkbox logic ──────────────────────────────────────────────────
  const handleAllClasses = () => {
    if (allClasses) {
      setAllClasses(false)
      setSelectedClasses([])
    } else {
      setAllClasses(true)
      setSelectedClasses([...CLASSES])
    }
  }

  const handleClassToggle = (cls) => {
    setSelectedClasses(prev => {
      const next = prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
      setAllClasses(next.length === CLASSES.length)
      return next
    })
  }

  // ── Add new role ──────────────────────────────────────────────────────────
  const handleSaveRole = () => {
    const err = {}
    if (!newRoleName.trim()) err.roleName = 'Role name required'
    if (!newRoleCode.trim()) err.roleCode = 'Code required'
    if (Object.keys(err).length) { setErrors(err); return }
    setRoleSaving(true)
    setTimeout(() => {
      setRoleSaving(false)
      setNewRoleName('')
      setNewRoleCode('')
      setShowAddRole(false)
      setErrors({})
      showToast('Role saved successfully!')
    }, 800)
  }

  // ── Permission handlers ───────────────────────────────────────────────────
  const handleToggleModule = useCallback((moduleId) => {
    setPerms(prev => ({
      ...prev,
      [moduleId]: { ...prev[moduleId], enabled: !prev[moduleId].enabled },
    }))
  }, [])

  const handlePermChange = useCallback((moduleId, pageId, perm) => {
    setPerms(prev => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        pages: {
          ...prev[moduleId].pages,
          [pageId]: {
            ...prev[moduleId].pages[pageId],
            [perm]: !prev[moduleId].pages[pageId][perm],
          },
        },
      },
    }))
  }, [])

  const handleSelectAllPage = useCallback((moduleId, pageId) => {
    setPerms(prev => {
      const current = prev[moduleId].pages[pageId]
      const allOn = PERMISSIONS.every(p => current[p])
      const updated = {}
      PERMISSIONS.forEach(p => { updated[p] = !allOn })
      return {
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          pages: { ...prev[moduleId].pages, [pageId]: updated },
        },
      }
    })
  }, [])

  const handleSubmitModule = useCallback((moduleId) => {
    if (!selectedRole) { showToast('Please select a role first.', 'error'); return }
    setSaving(moduleId)
    setTimeout(() => {
      setSaving(null)
      const mod = MODULES_DATA.find(m => m.module_id === moduleId)
      showToast(`${mod?.module_name} permissions saved!`)
    }, 900)
  }, [selectedRole])

  // ── Global submit ─────────────────────────────────────────────────────────
  const handleGlobalSubmit = () => {
    if (!selectedRole) { showToast('Please select a role first.', 'error'); return }
    if (selectedClasses.length === 0) { showToast('Please select at least one class.', 'error'); return }
    showToast('All permissions submitted successfully!')
  }

  // ── Filtered modules ──────────────────────────────────────────────────────
  const filteredModules = useMemo(() =>
    selectedModule
      ? MODULES_DATA.filter(m => m.module_id === selectedModule)
      : MODULES_DATA
  , [selectedModule])

  const enabledModulesCount = Object.values(perms).filter(p => p.enabled).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Assign Roles
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Configure role-based module &amp; page permissions for staff members.
          </p>
        </div>

        {/* Stats badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[12px] font-semibold text-blue-700 dark:text-blue-400">
            <Layout className="w-3.5 h-3.5" />
            {enabledModulesCount}/{MODULES_DATA.length} Modules Active
          </span>
          {selectedClasses.length > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
              <Building2 className="w-3.5 h-3.5" />
              {selectedClasses.length} Classes
            </span>
          )}
        </div>
      </div>

      {/* ── Mobile Tab Navigation ──────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
        {[
          { key: 'config', label: 'Configuration', icon: Settings2 },
          { key: 'modules', label: 'Permissions', icon: Shield },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setMobileTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-semibold transition-all
              ${mobileTab === key
                ? 'bg-white dark:bg-[#1a1f35] text-blue-700 dark:text-indigo-400 shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Icon className="w-3.5 h-3.5" />{label}
          </button>
        ))}
      </div>

      {/* ── Config Section (Role + Staff + Class) ─────────────────────────── */}
      <div className={`${mobileTab !== 'config' ? 'hidden sm:block' : ''}`}>
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Role Configuration</span>
            <button
              onClick={() => setShowAddRole(p => !p)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Role
            </button>
          </div>

          <div className="p-5 space-y-5">

            {/* Row 1: Role + Staff + Module */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="Role" required error={errors.role}>
                <NativeSelect
                  value={selectedRole}
                  onChange={handleRoleChange}
                  placeholder="-- Select Role --"
                  error={errors.role}
                >
                  {ROLES.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </NativeSelect>
              </Field>

              {selectedRole && (
                <>
                  <Field label="Staff">
                    <NativeSelect
                      value={selectedStaff}
                      onChange={e => setSelectedStaff(e.target.value)}
                      placeholder="-- Select Staff --"
                    >
                      {STAFF_LIST.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </NativeSelect>
                  </Field>

                  <Field label="Module Filter">
                    <NativeSelect
                      value={selectedModule}
                      onChange={e => setSelectedModule(e.target.value)}
                      placeholder="-- All Modules --"
                    >
                      {MODULES_DATA.map(m => <option key={m.module_id} value={m.module_id}>{m.module_name}</option>)}
                    </NativeSelect>
                  </Field>
                </>
              )}
            </div>

            {/* Add New Role Panel */}
            {showAddRole && (
              <div className="rounded-xl border border-dashed border-blue-300 dark:border-indigo-500/40 bg-blue-50/40 dark:bg-indigo-500/[0.05] p-4">
                <p className="text-[12px] font-bold text-blue-700 dark:text-indigo-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Plus className="w-3.5 h-3.5" /> New Role
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <Field label="Role Name" required error={errors.roleName}>
                    <input
                      value={newRoleName}
                      onChange={e => { setNewRoleName(e.target.value); setErrors(p => ({ ...p, roleName: undefined })) }}
                      placeholder="e.g. Lab Assistant"
                      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                        bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                        dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
                        ${errors.roleName ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                    />
                  </Field>
                  <Field label="Code" required error={errors.roleCode}>
                    <input
                      value={newRoleCode}
                      onChange={e => { setNewRoleCode(e.target.value); setErrors(p => ({ ...p, roleCode: undefined })) }}
                      placeholder="e.g. LAB"
                      className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                        bg-white text-slate-800 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                        dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
                        ${errors.roleCode ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                    />
                  </Field>
                  <div className="flex gap-2">
                    <button onClick={handleSaveRole} disabled={roleSaving}
                      className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-semibold text-white
                        bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-70">
                      {roleSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save
                    </button>
                    <button onClick={() => { setShowAddRole(false); setErrors({}) }}
                      className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Class Selection */}
            {selectedRole && (
              <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-500 dark:text-indigo-400" />
                    <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Select Classes</span>
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 font-semibold">
                      {selectedClasses.length}/{CLASSES.length}
                    </span>
                  </div>
                  <label className="flex items-center gap-1.5 cursor-pointer select-none" onClick={handleAllClasses}>
                    <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                      ${allClasses ? 'bg-blue-600 border-blue-600 dark:bg-indigo-500 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-[#1e2238]'}`}>
                      {allClasses && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                    <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">All</span>
                  </label>
                </div>

                {/* Class grid */}
                <div className="p-3 grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2">
                  {CLASSES.map(cls => {
                    const checked = selectedClasses.includes(cls)
                    return (
                      <button
                        key={cls}
                        onClick={() => handleClassToggle(cls)}
                        className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold transition-all text-center leading-tight border
                          ${checked
                            ? 'bg-blue-600 text-white border-blue-600 dark:bg-indigo-600 dark:border-indigo-600 shadow-sm'
                            : 'bg-white dark:bg-[#1e2238] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-[rgba(99,102,241,0.2)] hover:border-blue-300 dark:hover:border-indigo-500/50'
                          }`}
                      >
                        {cls.replace('Class ', 'Cls ')}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modules & Permissions Section ─────────────────────────────────── */}
      {selectedRole && (
        <div className={`${mobileTab !== 'modules' ? 'hidden sm:block' : ''}`}>
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Module Permissions</span>
              <span className="text-[13px] text-slate-400 dark:text-slate-500">
                Role: <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {ROLES.find(r => r.id === selectedRole)?.name}
                </span>
              </span>
            </div>

            {/* Info hint */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Toggle module to enable/disable. Configure page-level permissions. Use "All" to grant full access per sub-module.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['#', 'Module', 'Sub-Module & Permissions', '', 'Action'].map((h, i) => (
                      <th key={i} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredModules.map(mod => (
                    <ModuleTableRow
                      key={mod.module_id}
                      mod={mod}
                      perms={perms[mod.module_id]}
                      onToggleModule={handleToggleModule}
                      onPermChange={handlePermChange}
                      onSelectAllPage={handleSelectAllPage}
                      onSubmit={handleSubmitModule}
                      saving={saving}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filteredModules.map(mod => (
                <ModuleCard
                  key={mod.module_id}
                  mod={mod}
                  perms={perms[mod.module_id]}
                  onToggleModule={handleToggleModule}
                  onPermChange={handlePermChange}
                  onSelectAllPage={handleSelectAllPage}
                  onSubmit={handleSubmitModule}
                  saving={saving}
                />
              ))}
            </div>

            {/* Footer — Global Submit */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                <span className="font-semibold text-slate-700 dark:text-slate-300">{enabledModulesCount}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{MODULES_DATA.length}</span> modules enabled
              </p>
              <button
                onClick={handleGlobalSubmit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  shadow-md shadow-blue-500/20 transition-all active:scale-95"
              >
                <CheckSquare className="w-4 h-4" />
                Submit All Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!selectedRole && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Shield className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No role selected</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>Role</strong> above to configure module &amp; page permissions.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
