/**
 * DefineStaffRole.jsx
 * Converts legacy ASPX "desig_permision.aspx" → fully-responsive React + Tailwind
 *
 * Features:
 *  - Staff dropdown → checkboxes for designations/roles
 *  - Submit / Reset
 *  - GridView: Staff Name, Department, Designation, Role Name, Add More Links / View Link
 *  - "View Link" → modal showing module pages (like ModalPopupExtender)
 *  - "Add More Links" → modal to add extra page links
 *  - Desktop: dense ERP table
 *  - Mobile: cards with expandable sections, drawer filters
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Users, ChevronDown, RefreshCw, Save, X, Check,
  AlertCircle, Loader2, Plus, Eye, Link2,
  BookOpen, Building2, ShieldCheck, Layers,
  Search, Info, ChevronRight, ChevronUp,
  Settings, Tag, Grid3X3, LayoutGrid,
  UserCheck, Briefcase
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const STAFF_LIST = [
  { f_id: 1, staff_u_id: 'U001', name: 'Ramesh Kumar Sharma',   department: 'Science',    designation: 'Teacher' },
  { f_id: 2, staff_u_id: 'U002', name: 'Sunita Devi Yadav',     department: 'Commerce',   designation: 'Sr. Teacher' },
  { f_id: 3, staff_u_id: 'U003', name: 'Anil Prakash Mishra',   department: 'Maths',      designation: 'HOD' },
  { f_id: 4, staff_u_id: 'U004', name: 'Priya Singh Chauhan',   department: 'English',    designation: 'Teacher' },
  { f_id: 5, staff_u_id: 'U005', name: 'Vijay Narayan Tiwari',  department: 'Admin',      designation: 'Principal' },
  { f_id: 6, staff_u_id: 'U006', name: 'Meena Kumari Joshi',    department: 'Hindi',      designation: 'Teacher' },
  { f_id: 7, staff_u_id: 'U007', name: 'Deepak Raj Verma',      department: 'Physics',    designation: 'Lab Incharge' },
  { f_id: 8, staff_u_id: 'U008', name: 'Kavita Pandey',         department: 'Social Sc.', designation: 'Teacher' },
]

const DESIGNATIONS = [
  { id: 'D1',  label: 'Attendance Manager' },
  { id: 'D2',  label: 'Fee Manager' },
  { id: 'D3',  label: 'Exam Controller' },
  { id: 'D4',  label: 'Library Manager' },
  { id: 'D5',  label: 'Transport Manager' },
  { id: 'D6',  label: 'Hostel Manager' },
  { id: 'D7',  label: 'Sports Incharge' },
  { id: 'D8',  label: 'Lab Incharge' },
  { id: 'D9',  label: 'Result Manager' },
  { id: 'D10', label: 'Timetable Manager' },
  { id: 'D11', label: 'Circular Manager' },
  { id: 'D12', label: 'Gallery Manager' },
  { id: 'D13', label: 'Event Manager' },
  { id: 'D14', label: 'Noticeboard Manager' },
  { id: 'D15', label: 'Report Manager' },
]

// Pre-assigned roles for grid display
const STAFF_ROLES = [
  { f_id: 1, staff_u_id: 'U001', faculty: 'Ramesh Kumar Sharma', departmentname: 'Science',    DesignationName: 'Teacher',     rolename: 'Attendance Manager, Exam Controller' },
  { f_id: 2, staff_u_id: 'U002', faculty: 'Sunita Devi Yadav',   departmentname: 'Commerce',   DesignationName: 'Sr. Teacher', rolename: 'Fee Manager, Result Manager' },
  { f_id: 3, staff_u_id: 'U003', faculty: 'Anil Prakash Mishra', departmentname: 'Maths',      DesignationName: 'HOD',         rolename: 'Timetable Manager, Report Manager' },
  { f_id: 4, staff_u_id: 'U004', faculty: 'Priya Singh Chauhan', departmentname: 'English',    DesignationName: 'Teacher',     rolename: 'Circular Manager, Event Manager' },
  { f_id: 5, staff_u_id: 'U005', faculty: 'Vijay Narayan Tiwari',departmentname: 'Admin',      DesignationName: 'Principal',   rolename: 'All Modules' },
  { f_id: 6, staff_u_id: 'U006', faculty: 'Meena Kumari Joshi',  departmentname: 'Hindi',      DesignationName: 'Teacher',     rolename: 'Gallery Manager' },
  { f_id: 7, staff_u_id: 'U007', faculty: 'Deepak Raj Verma',    departmentname: 'Physics',    DesignationName: 'Lab Incharge',rolename: 'Lab Incharge, Report Manager' },
  { f_id: 8, staff_u_id: 'U008', faculty: 'Kavita Pandey',       departmentname: 'Social Sc.', DesignationName: 'Teacher',     rolename: 'Noticeboard Manager' },
]

// Module → pages data (for View Link modal)
const MODULE_PAGES = {
  1: { module_name: 'Student Management', pages: ['Student List', 'Add Student', 'Student Profile', 'TC Issue'] },
  2: { module_name: 'Fee Management',     pages: ['Fee Collection', 'Fee Report', 'Fee Structure', 'Pending Dues'] },
  3: { module_name: 'Attendance',         pages: ['Daily Attendance', 'Attendance Report', 'Monthly Summary', 'Bulk Mark'] },
  4: { module_name: 'Examination',        pages: ['Exam Schedule', 'Marks Entry', 'Result Sheet', 'Report Card'] },
  5: { module_name: 'Library',            pages: ['Book Catalog', 'Issue Book', 'Return Book', 'Fine Collection'] },
  6: { module_name: 'Transport',          pages: ['Route List', 'Vehicle List', 'Student Route', 'Driver Info'] },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const DEPT_COLORS = {
  'Science':    { fg: '#1d4ed8', bg: '#dbeafe' },
  'Commerce':   { fg: '#7c3aed', bg: '#ede9fe' },
  'Maths':      { fg: '#0891b2', bg: '#cffafe' },
  'English':    { fg: '#059669', bg: '#d1fae5' },
  'Admin':      { fg: '#dc2626', bg: '#fee2e2' },
  'Hindi':      { fg: '#d97706', bg: '#fef3c7' },
  'Physics':    { fg: '#0369a1', bg: '#e0f2fe' },
  'Social Sc.': { fg: '#7c3aed', bg: '#ede9fe' },
}
const deptColor = (dept) => DEPT_COLORS[dept] || { fg: '#374151', bg: '#f3f4f6' }

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 font-medium
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[999] flex items-center gap-3 px-5 py-3
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

// ─── CHECKBOX PILL ────────────────────────────────────────────────────────────
function CheckPill({ label, checked, onChange }) {
  return (
    <label
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer select-none transition-all duration-150
        ${checked
          ? 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20'
          : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.25)] dark:text-slate-200 dark:hover:border-indigo-400'
        }`}
    >
      <div className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all
        ${checked ? 'bg-white/25' : 'border border-slate-300 dark:border-slate-600'}`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </div>
      <span className="text-[12px] font-semibold whitespace-nowrap">{label}</span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
    </label>
  )
}

// ─── VIEW LINK MODAL ─────────────────────────────────────────────────────────
function ViewLinkModal({ staff, onClose }) {
  if (!staff) return null
  const { fg, bg } = deptColor(staff.departmentname)
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-[#1a1f35] rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
          onClick={e => e.stopPropagation()}
          style={{ animation: 'modalIn .2s ease' }}
        >
          <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>

          {/* Modal Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] flex-shrink-0">
            <span className="w-10 h-10 rounded-xl flex items-center justify-center text-[13px] font-bold flex-shrink-0"
              style={{ background: bg, color: fg }}>
              {initials(staff.faculty)}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{staff.faculty}</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">{staff.departmentname} · {staff.DesignationName}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Module List */}
          <div className="overflow-y-auto flex-1 p-5 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <Link2 className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Assigned Module Pages</span>
            </div>
            {Object.entries(MODULE_PAGES).map(([modId, mod], idx) => (
              <div key={modId} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
                  <span className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{mod.module_name}</span>
                </div>
                <div className="px-4 py-3 flex flex-wrap gap-2">
                  {mod.pages.map(pg => (
                    <span key={pg}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                        bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-700 dark:text-slate-300">
                      <BookOpen className="w-3 h-3 text-blue-500 flex-shrink-0" />
                      {pg}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] flex-shrink-0">
            <button onClick={onClose}
              className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── ADD MORE LINKS MODAL ─────────────────────────────────────────────────────
function AddLinkModal({ staff, onClose, onSave }) {
  const [selected, setSelected] = useState({})
  const [saving, setSaving] = useState(false)

  const toggle = (modId, page) => {
    const key = `${modId}__${page}`
    setSelected(p => ({ ...p, [key]: !p[key] }))
  }

  const handleSave = () => {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      onSave()
    }, 800)
  }

  const selectedCount = Object.values(selected).filter(Boolean).length

  if (!staff) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div
          className="bg-white dark:bg-[#1a1f35] rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
          onClick={e => e.stopPropagation()}
          style={{ animation: 'modalIn .2s ease' }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Add More Links</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate">{staff.faculty}</p>
            </div>
            {selectedCount > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                {selectedCount} selected
              </span>
            )}
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Module/Pages */}
          <div className="overflow-y-auto flex-1 p-5 space-y-4">
            <p className="text-[12px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" />
              Select pages to grant access to this staff member.
            </p>
            {Object.entries(MODULE_PAGES).map(([modId, mod], idx) => (
              <div key={modId} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
                  <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">{mod.module_name}</span>
                </div>
                <div className="px-4 py-3 flex flex-wrap gap-2">
                  {mod.pages.map(pg => {
                    const key = `${modId}__${pg}`
                    const isChecked = !!selected[key]
                    return (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => toggle(modId, pg)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all
                          ${isChecked
                            ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                            : 'bg-white dark:bg-[#1e2238] border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-700 dark:text-slate-300 hover:border-blue-300'
                          }`}
                      >
                        {isChecked
                          ? <Check className="w-3 h-3" />
                          : <Plus className="w-3 h-3" />}
                        {pg}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] flex gap-3 flex-shrink-0">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || selectedCount === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-60 transition-all">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Links
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MOBILE STAFF ROLE CARD ───────────────────────────────────────────────────
function MobileRoleCard({ row, onViewLink, onAddLink }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = deptColor(row.departmentname)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-[12px] font-bold flex-shrink-0"
          style={{ background: bg, color: fg }}>
          {initials(row.faculty)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.faculty}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
            <Building2 className="w-3 h-3 flex-shrink-0" />
            {row.departmentname}
          </p>
        </div>
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {/* Quick badges */}
      <div className="px-4 pb-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <Tag className="w-3 h-3" />{row.DesignationName}
        </span>
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
          <ShieldCheck className="w-3 h-3" />{row.rolename.split(',')[0].trim()}{row.rolename.includes(',') ? ' +more' : ''}
        </span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                <Briefcase className="w-3 h-3" />Designation
              </p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.DesignationName}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                <Building2 className="w-3 h-3" />Department
              </p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.departmentname}</p>
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />Assigned Roles
            </p>
            <div className="flex flex-wrap gap-1.5">
              {row.rolename.split(',').map(r => (
                <span key={r} className="px-2 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
                  {r.trim()}
                </span>
              ))}
            </div>
          </div>
          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onAddLink(row)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold
                bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100
                dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />Add More Links
            </button>
            <button
              type="button"
              onClick={() => onViewLink(row)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[12px] font-semibold
                bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100
                dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />View Links
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, onViewLink, onAddLink }) {
  const { fg, bg } = deptColor(row.departmentname)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 w-12 tabular-nums">{idx}</td>

      {/* Staff Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}>
            {initials(row.faculty)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.faculty}</span>
        </div>
      </td>

      {/* Department */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold"
          style={{ background: bg, color: fg }}>
          <Building2 className="w-3 h-3" />{row.departmentname}
        </span>
      </td>

      {/* Designation */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
          <Tag className="w-3 h-3" />{row.DesignationName}
        </span>
      </td>

      {/* Role Name */}
      <td className="px-4 py-3 max-w-[200px]">
        <div className="flex flex-wrap gap-1">
          {row.rolename.split(',').map(r => (
            <span key={r} className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
              {r.trim()}
            </span>
          ))}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onAddLink(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
              bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100
              dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 transition-colors whitespace-nowrap"
          >
            <Plus className="w-3 h-3" />Add Links
          </button>
          <button
            type="button"
            onClick={() => onViewLink(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
              bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100
              dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20 transition-colors whitespace-nowrap"
          >
            <Eye className="w-3 h-3" />View
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineStaffRole() {
  // ── Form state ──
  const [selectedStaff, setSelectedStaff] = useState('')
  const [checkedDesig,  setCheckedDesig]  = useState({})
  const [submitting,    setSubmitting]    = useState(false)
  const [errors,        setErrors]        = useState({})

  // ── Grid state ──
  const [gridRows, setGridRows] = useState(STAFF_ROLES)
  const [search,   setSearch]   = useState('')

  // ── Modal state ──
  const [viewModal,    setViewModal]    = useState(null) // staff row
  const [addModal,     setAddModal]     = useState(null) // staff row

  // ── Toast ──
  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3200)
  }

  // ── Checkbox toggle ──
  const toggleDesig = useCallback((id) => {
    setCheckedDesig(p => ({ ...p, [id]: !p[id] }))
  }, [])

  const checkedCount = Object.values(checkedDesig).filter(Boolean).length

  // ── Submit ──
  const handleSubmit = () => {
    const err = {}
    if (!selectedStaff)    err.staff = 'Please select a staff member'
    if (checkedCount === 0) err.desig = 'Please select at least one role'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      showToast('Staff roles assigned successfully!')
    }, 900)
  }

  // ── Reset ──
  const handleReset = () => {
    setSelectedStaff('')
    setCheckedDesig({})
    setErrors({})
  }

  // ── Select All / Clear ──
  const allChecked = DESIGNATIONS.every(d => checkedDesig[d.id])
  const toggleAll  = () => {
    if (allChecked) setCheckedDesig({})
    else setCheckedDesig(Object.fromEntries(DESIGNATIONS.map(d => [d.id, true])))
  }

  // ── Filtered grid ──
  const filtered = useMemo(() => {
    if (!search) return gridRows
    const q = search.toLowerCase()
    return gridRows.filter(r =>
      r.faculty.toLowerCase().includes(q) ||
      r.departmentname.toLowerCase().includes(q) ||
      r.DesignationName.toLowerCase().includes(q) ||
      r.rolename.toLowerCase().includes(q)
    )
  }, [gridRows, search])

  return (
    <div className="space-y-5 pb-10">
      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 mb-1">
            <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Define Staff Role</span>
          </div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600 dark:text-indigo-400 flex-shrink-0" />
            Define Staff Role
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Assign module permissions and roles to staff members.
          </p>
        </div>
      </div>

      {/* ── Form Card ───────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Settings className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Assign Role to Staff</span>
        </div>

        <div className="p-5 space-y-5">
          {/* Staff Dropdown */}
          <div className="max-w-md">
            <label className="block text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5">
              Select Staff <span className="text-rose-500">*</span>
            </label>
            <NativeSelect
              value={selectedStaff}
              onChange={e => { setSelectedStaff(e.target.value); setErrors(p => ({ ...p, staff: undefined })) }}
              placeholder="-- Select Staff Member --"
              error={errors.staff}
            >
              {STAFF_LIST.map(s => (
                <option key={s.f_id} value={s.f_id}>
                  {s.name} — {s.department} ({s.designation})
                </option>
              ))}
            </NativeSelect>
            {errors.staff && (
              <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-1">
                <AlertCircle className="w-3 h-3" />{errors.staff}
              </p>
            )}
          </div>

          {/* Designations / Roles */}
          <div>
            <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
              <div>
                <label className="text-[12px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Assign Roles <span className="text-rose-500">*</span>
                </label>
                {checkedCount > 0 && (
                  <span className="ml-2 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                    {checkedCount} selected
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={toggleAll}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors flex items-center gap-1"
              >
                <Grid3X3 className="w-3 h-3" />
                {allChecked ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {errors.desig && (
              <p className="flex items-center gap-1 text-[11px] text-rose-500 mb-2">
                <AlertCircle className="w-3 h-3" />{errors.desig}
              </p>
            )}

            {/* Pill checkboxes — responsive grid */}
            <div className="flex flex-wrap gap-2">
              {DESIGNATIONS.map(d => (
                <CheckPill
                  key={d.id}
                  label={d.label}
                  checked={!!checkedDesig[d.id]}
                  onChange={() => toggleDesig(d.id)}
                />
              ))}
            </div>
          </div>

          {/* Footer buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-md shadow-blue-500/20 disabled:opacity-70 transition-all active:scale-95"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Submit
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── Staff Roles Grid ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Staff Role Records</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} records
            </span>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search staff, dept, role…"
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

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No records match your search.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Staff Name', 'Department', 'Designation', 'Assigned Roles', 'Actions'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow
                    key={row.staff_u_id}
                    row={row}
                    idx={i + 1}
                    onViewLink={setViewModal}
                    onAddLink={setAddModal}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No records match your search.</span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to expand details and manage links.
              </p>
              {filtered.map(row => (
                <MobileRoleCard
                  key={row.staff_u_id}
                  row={row}
                  onViewLink={setViewModal}
                  onAddLink={setAddModal}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{gridRows.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {viewModal && (
        <ViewLinkModal staff={viewModal} onClose={() => setViewModal(null)} />
      )}
      {addModal && (
        <AddLinkModal
          staff={addModal}
          onClose={() => setAddModal(null)}
          onSave={() => {
            setAddModal(null)
            showToast('Links added successfully!')
          }}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
