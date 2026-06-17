/**
 * LeaveAllocation.jsx
 * Folder: src/pages/Leave/LeaveAllocation.jsx
 *
 * Converts legacy ASPX "Staff Leave Allocation" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Designation + Allocation Status filters
 *  - Leave Period From / To date pickers
 *  - Staff GridView with Select All / individual checkboxes
 *  - "Allocate Leave" → opens modal with leave type + due input grid
 *  - Edit button per row → opens same modal pre-filled
 *  - Submit saves allocation
 *  - Mobile: filter drawer, card-based staff list, bottom-sheet modal
 *  - Desktop: dense ERP table, inline modal popup
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Search,
  Users, Calendar, Edit2, UserCheck, UserX, UserMinus,
  ClipboardList, CheckSquare, Square, CalendarDays,
  BadgeCheck, Clock, Info, Building2, Briefcase,
  FileText, Send, XCircle, ChevronUp
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const DESIGNATIONS = [
  { value: '', label: '-- Select Designation --' },
  { value: '1', label: 'Principal' },
  { value: '2', label: 'Vice Principal' },
  { value: '3', label: 'PGT (Post Graduate Teacher)' },
  { value: '4', label: 'TGT (Trained Graduate Teacher)' },
  { value: '5', label: 'PRT (Primary Teacher)' },
  { value: '6', label: 'NTT (Nursery Teacher)' },
  { value: '7', label: 'Lab Assistant' },
  { value: '8', label: 'Librarian' },
  { value: '9', label: 'Clerk / Administrative Staff' },
  { value: '10', label: 'Peon / Support Staff' },
]

const LEAVE_TYPES = [
  { leavetypeid: 1, leaveType: 'Casual Leave (CL)', leaveDue: 12 },
  { leavetypeid: 2, leaveType: 'Earned Leave (EL)', leaveDue: 15 },
  { leavetypeid: 3, leaveType: 'Medical Leave (ML)', leaveDue: 10 },
  { leavetypeid: 4, leaveType: 'Half Pay Leave (HPL)', leaveDue: 20 },
  { leavetypeid: 5, leaveType: 'Maternity Leave', leaveDue: 180 },
  { leavetypeid: 6, leaveType: 'Paternity Leave', leaveDue: 15 },
  { leavetypeid: 7, leaveType: 'Special Casual Leave', leaveDue: 5 },
]

const STAFF_DATA = [
  { staff_u_id: 'S001', name: 'Rajesh Kumar Sharma', father_name: 'Ramesh Sharma', Design_Name: 'PGT (Post Graduate Teacher)', Department: 'Science', date_Of_joining: '2015-07-01', designation_id: '3', allocated: true, leaves: [{ leaveType: 'CL', leavedue: 12 }, { leaveType: 'EL', leavedue: 15 }, { leaveType: 'ML', leavedue: 10 }] },
  { staff_u_id: 'S002', name: 'Sunita Devi Gupta', father_name: 'Mohan Gupta', Design_Name: 'TGT (Trained Graduate Teacher)', Department: 'Mathematics', date_Of_joining: '2017-04-15', designation_id: '4', allocated: true, leaves: [{ leaveType: 'CL', leavedue: 12 }, { leaveType: 'EL', leavedue: 10 }] },
  { staff_u_id: 'S003', name: 'Amit Singh Rawat', father_name: 'Suresh Singh', Design_Name: 'PRT (Primary Teacher)', Department: 'Primary', date_Of_joining: '2019-06-01', designation_id: '5', allocated: false, leaves: [] },
  { staff_u_id: 'S004', name: 'Priya Verma', father_name: 'Deepak Verma', Design_Name: 'NTT (Nursery Teacher)', Department: 'Nursery', date_Of_joining: '2020-08-10', designation_id: '6', allocated: false, leaves: [] },
  { staff_u_id: 'S005', name: 'Manoj Kumar Tiwari', father_name: 'Dinesh Tiwari', Design_Name: 'Lab Assistant', Department: 'Science', date_Of_joining: '2016-03-20', designation_id: '7', allocated: true, leaves: [{ leaveType: 'CL', leavedue: 12 }, { leaveType: 'ML', leavedue: 8 }] },
  { staff_u_id: 'S006', name: 'Rekha Pandey', father_name: 'Kailash Pandey', Design_Name: 'Librarian', Department: 'Library', date_Of_joining: '2018-01-05', designation_id: '8', allocated: false, leaves: [] },
  { staff_u_id: 'S007', name: 'Suresh Chandra Joshi', father_name: 'Harish Joshi', Design_Name: 'PGT (Post Graduate Teacher)', Department: 'Commerce', date_Of_joining: '2014-07-15', designation_id: '3', allocated: true, leaves: [{ leaveType: 'CL', leavedue: 12 }, { leaveType: 'EL', leavedue: 15 }, { leaveType: 'ML', leavedue: 10 }, { leaveType: 'HPL', leavedue: 20 }] },
  { staff_u_id: 'S008', name: 'Anita Rani Chauhan', father_name: 'Vijay Chauhan', Design_Name: 'TGT (Trained Graduate Teacher)', Department: 'Hindi', date_Of_joining: '2021-06-01', designation_id: '4', allocated: false, leaves: [] },
  { staff_u_id: 'S009', name: 'Deepak Mishra', father_name: 'Ramakant Mishra', Design_Name: 'Clerk / Administrative Staff', Department: 'Administration', date_Of_joining: '2013-11-10', designation_id: '9', allocated: true, leaves: [{ leaveType: 'CL', leavedue: 10 }, { leaveType: 'EL', leavedue: 12 }] },
  { staff_u_id: 'S010', name: 'Kavita Sharma', father_name: 'Hari Sharma', Design_Name: 'PRT (Primary Teacher)', Department: 'Primary', date_Of_joining: '2022-04-01', designation_id: '5', allocated: false, leaves: [] },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const today = () => {
  const d = new Date()
  return d.toISOString().split('T')[0]
}

const formatDate = (d) => {
  if (!d) return '—'
  const [y, m, day] = d.split('-')
  return `${day}/${m}/${y}`
}

const DEPT_COLORS = {
  Science:        { fg: '#0891b2', bg: '#cffafe' },
  Mathematics:    { fg: '#7c3aed', bg: '#ede9fe' },
  Primary:        { fg: '#059669', bg: '#d1fae5' },
  Nursery:        { fg: '#d97706', bg: '#fef3c7' },
  Library:        { fg: '#dc2626', bg: '#fee2e2' },
  Administration: { fg: '#1d4ed8', bg: '#dbeafe' },
  Commerce:       { fg: '#0369a1', bg: '#e0f2fe' },
  Hindi:          { fg: '#c026d3', bg: '#fae8ff' },
}

const deptColor = (dept) => DEPT_COLORS[dept] || { fg: '#475569', bg: '#f1f5f9' }

// ─── PRIMITIVE COMPONENTS ──────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, error, disabled }) {
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
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
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

function DateInput({ value, onChange, error, min, max }) {
  return (
    <input
      type="date"
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      className={`w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
    />
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  )
}

// ─── STATUS BADGE ──────────────────────────────────────────────────────────────

function AllocationBadge({ allocated }) {
  if (allocated) return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
      <BadgeCheck className="w-3 h-3" /> Allocated
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400">
      <XCircle className="w-3 h-3" /> Not Allocated
    </span>
  )
}

// ─── LEAVE PILLS ──────────────────────────────────────────────────────────────

function LeavePills({ leaves }) {
  if (!leaves || leaves.length === 0) return <span className="text-[11px] text-slate-400 dark:text-slate-600">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {leaves.map((l, i) => (
        <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 whitespace-nowrap">
          <span className="font-bold">{l.leaveType}</span>
          <span className="w-px h-2.5 bg-blue-200 dark:bg-blue-500/30 mx-0.5" />
          <span>{l.leavedue}d</span>
        </span>
      ))}
    </div>
  )
}

// ─── LEAVE ALLOCATION MODAL ───────────────────────────────────────────────────

function LeaveModal({ open, onClose, staffName, editMode, existingLeaves, onSubmit, loading }) {
  const [leaves, setLeaves] = useState(() =>
    LEAVE_TYPES.map(lt => ({
      ...lt,
      leaveDue: editMode && existingLeaves
        ? (existingLeaves.find(e => e.leaveType === lt.leaveType.split(' ')[0])?.leavedue ?? lt.leaveDue)
        : lt.leaveDue
    }))
  )
  const [remark, setRemark] = useState('')

  const updateDue = (id, val) => {
    const n = parseInt(val) || 0
    setLeaves(prev => prev.map(l => l.leavetypeid === id ? { ...l, leaveDue: n } : l))
  }

  const handleSubmit = () => {
    onSubmit(leaves, remark)
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Panel */}
      <div
        className="fixed z-50 inset-x-4 sm:inset-auto sm:left-1/2 sm:-translate-x-1/2 bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2
          w-auto sm:w-[520px] max-h-[90vh] flex flex-col
          rounded-t-2xl sm:rounded-2xl bg-white dark:bg-[#1a1f35]
          border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
          shadow-2xl overflow-hidden"
        style={{ animation: 'modalIn .25s ease' }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>

        {/* Modal Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50 dark:bg-white/[0.02] flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
              {editMode ? 'Edit Leave Allocation' : 'Allocate Leaves'}
            </p>
            {staffName && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{staffName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {/* Leave Type table */}
          <div className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] overflow-hidden">
            <div className="grid grid-cols-[1fr_100px] bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Leave Type</div>
              <div className="px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center">Days Due</div>
            </div>
            {leaves.map((lt) => (
              <div
                key={lt.leavetypeid}
                className="grid grid-cols-[1fr_100px] border-b border-slate-50 dark:border-[rgba(99,102,241,0.06)] last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/[0.015] transition-colors"
              >
                <div className="px-4 py-3 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-[12px] font-medium text-slate-700 dark:text-slate-200">{lt.leaveType}</span>
                </div>
                <div className="px-3 py-2 flex items-center justify-center">
                  <input
                    type="number"
                    min="0"
                    max="365"
                    value={lt.leaveDue}
                    onChange={e => updateDue(lt.leavetypeid, e.target.value)}
                    className="w-full text-center text-[13px] font-semibold rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-100
                      px-2 py-1.5 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Remark */}
          <div>
            <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">
              Remark
            </label>
            <textarea
              value={remark}
              onChange={e => setRemark(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
              rows={3}
              placeholder="Enter remark (optional)..."
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238]
                text-slate-800 dark:text-slate-200 outline-none resize-none
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all placeholder-slate-300 dark:placeholder-slate-600"
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015] flex-shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MOBILE FILTER DRAWER ──────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35]
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4 space-y-4">
          <Field label="Designation" error={errors.designation} required>
            <NativeSelect
              value={filters.designation}
              onChange={e => setFilters(p => ({ ...p, designation: e.target.value }))}
              error={errors.designation}
            >
              {DESIGNATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Allocation Status">
            <NativeSelect
              value={filters.status}
              onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
            >
              <option value="1">All</option>
              <option value="2">Allocated</option>
              <option value="3">Not Allocated</option>
            </NativeSelect>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Period From" error={errors.fromDate} required>
              <DateInput
                value={filters.fromDate}
                onChange={e => setFilters(p => ({ ...p, fromDate: e.target.value }))}
                error={errors.fromDate}
              />
            </Field>
            <Field label="Period To" error={errors.toDate} required>
              <DateInput
                value={filters.toDate}
                onChange={e => setFilters(p => ({ ...p, toDate: e.target.value }))}
                min={filters.fromDate}
                error={errors.toDate}
              />
            </Field>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 pb-6 pt-2 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => { onShow(); onClose() }}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 disabled:opacity-70 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MOBILE STAFF CARD ────────────────────────────────────────────────────────

function StaffCard({ staff, selected, onToggle, onEdit, showAllocated }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = deptColor(staff.Department)
  const initials = staff.name.split(' ').slice(0, 2).map(w => w[0]).join('')

  return (
    <div
      className={`rounded-xl border overflow-hidden shadow-sm transition-all
        ${selected
          ? 'border-blue-400 dark:border-indigo-500 bg-blue-50/40 dark:bg-indigo-500/[0.06]'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'
        }`}
    >
      {/* Top row — tap to select */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggle(staff.staff_u_id)}
          className="mt-0.5 flex-shrink-0"
        >
          {selected
            ? <CheckSquare className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            : <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />
          }
        </button>

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{staff.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">{staff.father_name}</p>
            </div>
            <AllocationBadge allocated={staff.allocated} />
          </div>

          {/* Dept + Desg tags */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold"
              style={{ background: bg, color: fg }}
            >
              <Building2 className="w-2.5 h-2.5" />
              {staff.Department}
            </span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <Briefcase className="w-2.5 h-2.5" />
              {staff.Design_Name.split('(')[0].trim()}
            </span>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded(p => !p)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors flex-shrink-0 mt-1"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.08)] px-4 py-3 space-y-3 bg-slate-50/40 dark:bg-white/[0.01]">
          {/* DOJ */}
          <div className="flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Joined: </span>
            <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-200">{formatDate(staff.date_Of_joining)}</span>
          </div>

          {/* Leaves */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5">Leave Allocation</p>
            <LeavePills leaves={staff.leaves} />
          </div>

          {/* Edit button */}
          {showAllocated && staff.allocated && (
            <button
              type="button"
              onClick={() => onEdit(staff)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[12px] font-semibold
                text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit Allocation
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── STATS STRIP ──────────────────────────────────────────────────────────────

function StatsStrip({ data }) {
  const total = data.length
  const allocated = data.filter(s => s.allocated).length
  const notAllocated = total - allocated

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { icon: Users, label: 'Total Staff', value: total, color: 'blue' },
        { icon: UserCheck, label: 'Allocated', value: allocated, color: 'emerald' },
        { icon: UserX, label: 'Not Allocated', value: notAllocated, color: 'rose' },
      ].map(({ icon: Icon, label, value, color }) => {
        const cs = {
          blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
          emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
          rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
        }
        return (
          <div
            key={label}
            className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3
              rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
              bg-white dark:bg-[#1a1f35] px-3 sm:px-4 py-3 shadow-sm"
          >
            <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${cs[color]}`}>
              <Icon className="w-4 h-4" />
            </span>
            <div className="text-center sm:text-left min-w-0">
              <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function LeaveAllocation() {
  const [filters, setFilters] = useState({
    designation: '',
    status: '1',
    fromDate: '',
    toDate: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [staffList, setStaffList] = useState([])
  const [shown, setShown] = useState(false)
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  // Modal state
  const [modal, setModal] = useState({ open: false, editMode: false, staff: null })
  const [modalLoading, setModalLoading] = useState(false)

  // ── Toast helper ──────────────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }, [])

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!filters.designation) err.designation = 'Please select designation'
    if (!filters.fromDate) err.fromDate = 'Please select from date'
    if (!filters.toDate) err.toDate = 'Please select to date'
    if (filters.fromDate && filters.toDate && filters.fromDate > filters.toDate)
      err.toDate = 'To date must be after From date'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Show Staff ────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setSelectedIds(new Set())
    setSearch('')

    setTimeout(() => {
      let data = [...STAFF_DATA]
      // Filter by designation
      if (filters.designation) {
        data = data.filter(s => s.designation_id === filters.designation)
      }
      // Filter by allocation status
      if (filters.status === '2') data = data.filter(s => s.allocated)
      if (filters.status === '3') data = data.filter(s => !s.allocated)

      setStaffList(data)
      setShown(true)
      setLoading(false)
      showToast(`${data.length} staff member${data.length !== 1 ? 's' : ''} found.`)
    }, 700)
  }, [filters, showToast])

  // ── Select All toggle ─────────────────────────────────────────────────────
  const allSelected = staffList.length > 0 && selectedIds.size === staffList.length
  const someSelected = selectedIds.size > 0 && !allSelected

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set())
    else setSelectedIds(new Set(staffList.map(s => s.staff_u_id)))
  }

  const toggleOne = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // ── Open Allocate Modal (bulk) ────────────────────────────────────────────
  const handleAllocate = () => {
    if (selectedIds.size === 0) { showToast('Please select at least one staff member.', 'error'); return }
    setModal({ open: true, editMode: false, staff: null })
  }

  // ── Open Edit Modal (per row) ─────────────────────────────────────────────
  const handleEdit = (staff) => {
    setModal({ open: true, editMode: true, staff })
  }

  // ── Submit Leave Allocation ───────────────────────────────────────────────
  const handleModalSubmit = (leaves, remark) => {
    setModalLoading(true)
    setTimeout(() => {
      // Update staffList with allocated leaves (simulate API save)
      setStaffList(prev => prev.map(s => {
        if (modal.editMode ? s.staff_u_id === modal.staff.staff_u_id : selectedIds.has(s.staff_u_id)) {
          return {
            ...s,
            allocated: true,
            leaves: leaves.map(l => ({ leaveType: l.leaveType.split(' ')[0], leavedue: l.leaveDue }))
          }
        }
        return s
      }))
      setSelectedIds(new Set())
      setModal({ open: false, editMode: false, staff: null })
      setModalLoading(false)
      showToast(
        modal.editMode
          ? `Leave updated for ${modal.staff.name}.`
          : `Leaves allocated to ${selectedIds.size} staff member${selectedIds.size !== 1 ? 's' : ''}.`
      )
    }, 900)
  }

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFilters({ designation: '', status: '1', fromDate: '', toDate: '' })
    setErrors({})
    setStaffList([])
    setSelectedIds(new Set())
    setSearch('')
    setShown(false)
  }

  // ── Filtered by search ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return staffList
    const q = search.toLowerCase()
    return staffList.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.Department.toLowerCase().includes(q) ||
      s.Design_Name.toLowerCase().includes(q) ||
      s.father_name.toLowerCase().includes(q)
    )
  }, [staffList, search])

  const activeFilterCount = [
    filters.designation, filters.fromDate, filters.toDate
  ].filter(Boolean).length + (filters.status !== '1' ? 1 : 0)

  // ── Modal staff name summary ──────────────────────────────────────────────
  const modalStaffName = modal.editMode
    ? modal.staff?.name
    : selectedIds.size === 1
      ? staffList.find(s => selectedIds.has(s.staff_u_id))?.name
      : `${selectedIds.size} staff members`

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Staff Leave Allocation
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Allocate and manage leave entitlements for staff members.
          </p>
        </div>

        {/* Breadcrumb — desktop only */}
        <nav className="hidden sm:flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-shrink-0">
          <span>Home</span>
          <ChevronRight className="w-3 h-3" />
          <span>Leave</span>
          <ChevronRight className="w-3 h-3" />
          <span className="font-semibold text-slate-600 dark:text-slate-300">Staff Leave Allocation</span>
        </nav>
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Designation */}
            <Field label="Designation" error={errors.designation} required>
              <NativeSelect
                value={filters.designation}
                onChange={e => { setFilters(p => ({ ...p, designation: e.target.value })); setErrors(p => ({ ...p, designation: undefined })) }}
                error={errors.designation}
              >
                {DESIGNATIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Allocation Status */}
            <Field label="Allocation Status">
              <NativeSelect
                value={filters.status}
                onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}
              >
                <option value="1">All</option>
                <option value="2">Allocated</option>
                <option value="3">Not Allocated</option>
              </NativeSelect>
            </Field>

            {/* From Date */}
            <Field label="Leave Period From" error={errors.fromDate} required>
              <DateInput
                value={filters.fromDate}
                onChange={e => { setFilters(p => ({ ...p, fromDate: e.target.value })); setErrors(p => ({ ...p, fromDate: undefined })) }}
                error={errors.fromDate}
              />
            </Field>

            {/* To Date */}
            <Field label="Leave Period To" error={errors.toDate} required>
              <DateInput
                value={filters.toDate}
                onChange={e => { setFilters(p => ({ ...p, toDate: e.target.value })); setErrors(p => ({ ...p, toDate: undefined })) }}
                min={filters.fromDate}
                error={errors.toDate}
              />
            </Field>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Reset"
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount > 0 ? `${activeFilterCount} Filter${activeFilterCount > 1 ? 's' : ''} Set` : 'Set Filters'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {shown && (
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {shown && !loading && (
        <>
          {/* Stats */}
          <StatsStrip data={filtered} />

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Staff List</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
                {filters.fromDate && filters.toDate && (
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 hidden sm:flex">
                    <Calendar className="w-3 h-3" />
                    {formatDate(filters.fromDate)} – {formatDate(filters.toDate)}
                  </span>
                )}
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, dept…"
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

            {/* Toolbar: Select All + Allocate button */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] bg-slate-50/30 dark:bg-white/[0.01]">
              {/* Select All */}
              <button
                type="button"
                onClick={toggleAll}
                className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-indigo-400 transition-colors"
              >
                {allSelected
                  ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                  : someSelected
                    ? <CheckSquare className="w-4 h-4 text-slate-400" />
                    : <Square className="w-4 h-4 text-slate-300" />
                }
                Select All
              </button>

              {selectedIds.size > 0 && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedIds.size} selected
                </span>
              )}

              <div className="flex-1" />

              {/* Allocate Leave button — visible only when items are selected */}
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={handleAllocate}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold text-white
                    bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                    shadow-md shadow-blue-500/20 transition-all active:scale-95"
                >
                  <BadgeCheck className="w-4 h-4" />
                  Allocate Leave ({selectedIds.size})
                </button>
              )}
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No staff found matching your criteria.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {[
                        { label: 'Select', w: 'w-12' },
                        { label: 'Name' },
                        { label: 'Father / Husband' },
                        { label: 'Designation' },
                        { label: 'Department' },
                        { label: 'Date of Joining' },
                        { label: 'Leaves Allocated' },
                        { label: 'Status' },
                        { label: 'Action', w: 'w-20' },
                      ].map(({ label, w }) => (
                        <th key={label} className={`px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap ${w || ''}`}>
                          {label === 'Select'
                            ? <button type="button" onClick={toggleAll} className="flex items-center gap-1.5">
                                {allSelected
                                  ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                                  : someSelected
                                    ? <CheckSquare className="w-4 h-4 text-slate-400" />
                                    : <Square className="w-4 h-4 text-slate-300" />
                                }
                                <span className="text-[10px]">All</span>
                              </button>
                            : label
                          }
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s) => {
                      const { fg, bg } = deptColor(s.Department)
                      const initials = s.name.split(' ').slice(0, 2).map(w => w[0]).join('')
                      const isSel = selectedIds.has(s.staff_u_id)
                      return (
                        <tr
                          key={s.staff_u_id}
                          className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] transition-colors
                            ${isSel ? 'bg-blue-50/40 dark:bg-indigo-500/[0.05]' : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.015]'}`}
                        >
                          {/* Checkbox */}
                          <td className="px-4 py-3 text-center">
                            <button type="button" onClick={() => toggleOne(s.staff_u_id)}>
                              {isSel
                                ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                                : <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                              }
                            </button>
                          </td>

                          {/* Name */}
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2.5">
                              <div
                                className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
                                style={{ background: bg, color: fg }}
                              >
                                {initials}
                              </div>
                              <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{s.name}</span>
                            </div>
                          </td>

                          {/* Father */}
                          <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {s.father_name}
                          </td>

                          {/* Designation */}
                          <td className="px-4 py-3">
                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{s.Design_Name}</span>
                          </td>

                          {/* Department */}
                          <td className="px-4 py-3">
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                              style={{ background: bg, color: fg }}
                            >
                              {s.Department}
                            </span>
                          </td>

                          {/* DOJ */}
                          <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
                            {formatDate(s.date_Of_joining)}
                          </td>

                          {/* Leaves */}
                          <td className="px-4 py-3 max-w-[200px]">
                            <LeavePills leaves={s.leaves} />
                          </td>

                          {/* Status */}
                          <td className="px-4 py-3">
                            <AllocationBadge allocated={s.allocated} />
                          </td>

                          {/* Action */}
                          <td className="px-4 py-3 text-center">
                            {s.allocated && (
                              <button
                                type="button"
                                onClick={() => handleEdit(s)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-white
                                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all"
                              >
                                <Edit2 className="w-3 h-3" />
                                Edit
                              </button>
                            )}
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
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No staff found.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap expand to see leave details or edit allocation.
                  </p>
                  {filtered.map((s) => (
                    <StaffCard
                      key={s.staff_u_id}
                      staff={s}
                      selected={selectedIds.has(s.staff_u_id)}
                      onToggle={toggleOne}
                      onEdit={handleEdit}
                      showAllocated
                    />
                  ))}
                </>
              )}
            </div>

            {/* ── Mobile Allocate FAB ── */}
            {selectedIds.size > 0 && (
              <div className="md:hidden px-4 pb-4">
                <button
                  type="button"
                  onClick={handleAllocate}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
                    bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 shadow-lg shadow-blue-500/25 transition-all active:scale-95"
                >
                  <BadgeCheck className="w-5 h-5" />
                  Allocate Leave to {selectedIds.size} Staff
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{staffList.length}</span> records
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <UserMinus className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No results yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select designation, period dates and click <strong>Show</strong> to load staff.
            </p>
          </div>
        </div>
      )}

      {/* ── Leave Allocation Modal ───────────────────────────────────────── */}
      <LeaveModal
        open={modal.open}
        onClose={() => setModal({ open: false, editMode: false, staff: null })}
        staffName={modalStaffName}
        editMode={modal.editMode}
        existingLeaves={modal.staff?.leaves}
        onSubmit={handleModalSubmit}
        loading={modalLoading}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
