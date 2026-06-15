/**
 * AssignHostel.jsx
 * Folder: src/pages/Hostel/AssignHostel.jsx
 *
 * Converts legacy ASPX "Assign Hostel" page to fully-responsive React + Tailwind.
 *
 * Workflow (preserved from ASPX):
 *  1. Operator selects Session (required), Class (optional filter, triggers fetch),
 *     and optionally Adm No. -> clicks Submit to load matching students.
 *  2. Each student row shows: Adm No, Name, Father Name, Class.
 *  3. Operator picks a Hostel Type (dropdown) for the student -> auto-loads
 *     installment checkboxes for that hostel type (cblinstallment).
 *  4. "Select All" checkbox toggles all installments for that row.
 *  5. "Save" button per row -> opens confirm modal -> on Confirm, saves
 *     hostel + installment assignment for that student (Button2_Click / btnconfirm_Click).
 *
 * Mobile: table -> stacked cards with inline hostel-type + installment controls.
 * Desktop: dense ERP table.
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Search as SearchIcon,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, BedDouble, ListChecks, SlidersHorizontal,
  Info, Save, ChevronRight, Building2, CheckSquare,
  Square, Hash, GraduationCap, User
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV', 'Class V', 'Class VI', 'Class VII']

// Hostel types (fee heads) — driven dynamically per-row via dropdown
const HOSTEL_TYPES = [
  { id: 'h1', name: 'Day Boarding' },
  { id: 'h2', name: 'Weekly Hostel' },
  { id: 'h3', name: 'Full Boarding (AC)' },
  { id: 'h4', name: 'Full Boarding (Non-AC)' },
]

// Installments mapped per hostel type
const INSTALLMENTS_BY_HOSTEL = {
  h1: [
    { id: 'i1', label: 'April 2026', amount: 4500 },
    { id: 'i2', label: 'May 2026', amount: 4500 },
    { id: 'i3', label: 'June 2026', amount: 4500 },
  ],
  h2: [
    { id: 'i1', label: 'Term 1 (Apr-Jun)', amount: 12000 },
    { id: 'i2', label: 'Term 2 (Jul-Sep)', amount: 12000 },
    { id: 'i3', label: 'Term 3 (Oct-Dec)', amount: 12000 },
    { id: 'i4', label: 'Term 4 (Jan-Mar)', amount: 12000 },
  ],
  h3: [
    { id: 'i1', label: 'Quarter 1', amount: 28000 },
    { id: 'i2', label: 'Quarter 2', amount: 28000 },
    { id: 'i3', label: 'Quarter 3', amount: 28000 },
    { id: 'i4', label: 'Quarter 4', amount: 28000 },
  ],
  h4: [
    { id: 'i1', label: 'Quarter 1', amount: 20000 },
    { id: 'i2', label: 'Quarter 2', amount: 20000 },
    { id: 'i3', label: 'Quarter 3', amount: 20000 },
    { id: 'i4', label: 'Quarter 4', amount: 20000 },
  ],
}

// Student records — keyed by class for the dummy "fetch by class" workflow
const STUDENTS_BY_CLASS = {
  'Nursery': [
    { stu_id: 101, Registration_NO: 'REG-2026-101', name: 'Aarav Sharma', Father_name: 'Rajesh Sharma', class: 'Nursery', status: 'Not Assigned' },
    { stu_id: 102, Registration_NO: 'REG-2026-102', name: 'Diya Verma', Father_name: 'Sanjay Verma', class: 'Nursery', status: 'Not Assigned' },
  ],
  'LKG': [
    { stu_id: 103, Registration_NO: 'REG-2026-103', name: 'Ishaan Gupta', Father_name: 'Manoj Gupta', class: 'LKG', status: 'Not Assigned' },
    { stu_id: 104, Registration_NO: 'REG-2026-104', name: 'Ananya Singh', Father_name: 'Vikram Singh', class: 'LKG', status: 'Assigned' },
  ],
  'UKG': [
    { stu_id: 105, Registration_NO: 'REG-2026-105', name: 'Vivaan Joshi', Father_name: 'Pankaj Joshi', class: 'UKG', status: 'Not Assigned' },
  ],
  'Class I': [
    { stu_id: 106, Registration_NO: 'REG-2026-106', name: 'Sara Khan', Father_name: 'Imran Khan', class: 'Class I', status: 'Not Assigned' },
    { stu_id: 107, Registration_NO: 'REG-2026-107', name: 'Aditya Mehta', Father_name: 'Suresh Mehta', class: 'Class I', status: 'Not Assigned' },
    { stu_id: 108, Registration_NO: 'REG-2026-108', name: 'Riya Kapoor', Father_name: 'Anil Kapoor', class: 'Class I', status: 'Assigned' },
  ],
  'Class II': [
    { stu_id: 109, Registration_NO: 'REG-2026-109', name: 'Kabir Malhotra', Father_name: 'Deepak Malhotra', class: 'Class II', status: 'Not Assigned' },
  ],
  'Class III': [
    { stu_id: 110, Registration_NO: 'REG-2026-110', name: 'Myra Reddy', Father_name: 'Srinivas Reddy', class: 'Class III', status: 'Not Assigned' },
    { stu_id: 111, Registration_NO: 'REG-2026-111', name: 'Arjun Nair', Father_name: 'Suresh Nair', class: 'Class III', status: 'Not Assigned' },
  ],
  'Class IV': [
    { stu_id: 112, Registration_NO: 'REG-2026-112', name: 'Tara Iyer', Father_name: 'Ramesh Iyer', class: 'Class IV', status: 'Not Assigned' },
  ],
  'Class V': [
    { stu_id: 113, Registration_NO: 'REG-2026-113', name: 'Yuvaan Bose', Father_name: 'Arnab Bose', class: 'Class V', status: 'Not Assigned' },
  ],
  'Class VI': [
    { stu_id: 114, Registration_NO: 'REG-2026-114', name: 'Aisha Pillai', Father_name: 'Vinod Pillai', class: 'Class VI', status: 'Not Assigned' },
    { stu_id: 115, Registration_NO: 'REG-2026-115', name: 'Reyansh Chatterjee', Father_name: 'Anand Chatterjee', class: 'Class VI', status: 'Assigned' },
  ],
  'Class VII': [
    { stu_id: 116, Registration_NO: 'REG-2026-116', name: 'Navya Desai', Father_name: 'Kiran Desai', class: 'Class VII', status: 'Not Assigned' },
  ],
}

// All students flattened (used when no class filter is applied)
const ALL_STUDENTS = Object.values(STUDENTS_BY_CLASS).flat()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, small }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 ${small ? 'py-1.5 text-[12px]' : 'py-2 text-[13px]'} rounded-lg border outline-none transition-all cursor-pointer
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

// ─── CONFIRM MODAL (replaces ModalPopupExtender / panel1) ─────────────────────
function ConfirmModal({ open, student, onCancel, onConfirm, saving }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6 text-center"
        style={{ animation: 'popIn .2s ease' }}
      >
        <style>{`@keyframes popIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>
        <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6 text-amber-500" />
        </div>
        <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Are you sure?</h3>
        {student && (
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-1.5">
            Save hostel assignment for <span className="font-semibold text-slate-700 dark:text-slate-200">{student.name}</span>
            {' '}({student.Registration_NO})?
          </p>
        )}
        <div className="flex gap-3 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── STATUS BADGE ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const isAssigned = status === 'Assigned'
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold
      ${isAssigned
        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${isAssigned ? 'bg-emerald-500' : 'bg-slate-400'}`} />
      {isAssigned ? 'Assigned' : 'Not Assigned'}
    </span>
  )
}

// ─── INSTALLMENT CHECKBOX LIST (cblinstallment + Select All) ──────────────────
function InstallmentList({ installments, selected, onToggle, onToggleAll, allSelected, columns = 3, disabled }) {
  if (!installments || installments.length === 0) {
    return (
      <p className="text-[12px] text-slate-400 dark:text-slate-500 italic flex items-center gap-1.5">
        <Info className="w-3.5 h-3.5" /> Select a hostel type to view installments
      </p>
    )
  }

  return (
    <div className="space-y-2">
      {/* Select All */}
      <label className={`flex items-center gap-2 cursor-pointer select-none ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <button
          type="button"
          onClick={() => onToggleAll(!allSelected)}
          className="flex-shrink-0"
        >
          {allSelected
            ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            : <Square className="w-4 h-4 text-slate-400" />}
        </button>
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Select All Installments</span>
      </label>

      {/* Grid of installments */}
      <div className={`grid gap-2 ${columns === 1 ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
        {installments.map(inst => {
          const checked = selected.includes(inst.id)
          return (
            <label
              key={inst.id}
              className={`flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-[12px] cursor-pointer transition-colors
                ${checked
                  ? 'border-blue-300 bg-blue-50 dark:border-indigo-500/40 dark:bg-indigo-500/10'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-[rgba(99,102,241,0.15)] dark:bg-[#1e2238] dark:hover:bg-white/[0.03]'}
                ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <span className="flex items-center gap-2">
                <button type="button" onClick={() => onToggle(inst.id)} className="flex-shrink-0">
                  {checked
                    ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                    : <Square className="w-4 h-4 text-slate-400" />}
                </button>
                <span className="font-medium text-slate-700 dark:text-slate-200">{inst.label}</span>
              </span>
              <span className="font-bold text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                ₹{inst.amount.toLocaleString()}
              </span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ─────────────────────────────────────────────────────────
function DesktopRow({ student, idx, rowState, onHostelChange, onToggleInstallment, onToggleAll, onSave }) {
  const installments = rowState.hostelId ? INSTALLMENTS_BY_HOSTEL[rowState.hostelId] || [] : []
  const allSelected = installments.length > 0 && installments.every(i => rowState.installments.includes(i.id))

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors align-top">
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Adm No */}
      <td className="px-4 py-3">
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{student.Registration_NO}</span>
      </td>

      {/* Student Name */}
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 whitespace-nowrap">{student.name}</span>
          <StatusBadge status={student.status} />
        </div>
      </td>

      {/* Father Name */}
      <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{student.Father_name}</td>

      {/* Class */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 whitespace-nowrap">
          {student.class}
        </span>
      </td>

      {/* Hostel Type */}
      <td className="px-4 py-3 w-44">
        <NativeSelect
          value={rowState.hostelId}
          onChange={e => onHostelChange(student.stu_id, e.target.value)}
          placeholder="-- Select --"
          small
        >
          {HOSTEL_TYPES.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
        </NativeSelect>
      </td>

      {/* Installments */}
      <td className="px-4 py-3 min-w-[320px]">
        <InstallmentList
          installments={installments}
          selected={rowState.installments}
          onToggle={(instId) => onToggleInstallment(student.stu_id, instId)}
          onToggleAll={(val) => onToggleAll(student.stu_id, val)}
          allSelected={allSelected}
          columns={3}
        />
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-center">
        <button
          type="button"
          onClick={() => onSave(student)}
          disabled={!rowState.hostelId || rowState.installments.length === 0}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold text-white
            bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20
            transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
        >
          <Save className="w-3.5 h-3.5" /> Save
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ────────────────────────────────────────────────────────────────
function MobileCard({ student, idx, rowState, onHostelChange, onToggleInstallment, onToggleAll, onSave }) {
  const [expanded, setExpanded] = useState(false)
  const installments = rowState.hostelId ? INSTALLMENTS_BY_HOSTEL[rowState.hostelId] || [] : []
  const allSelected = installments.length > 0 && installments.every(i => rowState.installments.includes(i.id))
  const canSave = !!rowState.hostelId && rowState.installments.length > 0

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
          <User className="w-4.5 h-4.5" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{student.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Hash className="w-3 h-3" /> {student.Registration_NO}
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <GraduationCap className="w-3 h-3" /> {student.class}
          </p>
        </div>

        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge status={student.status} />
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Father name */}
          <div className="flex items-center justify-between text-[12px]">
            <span className="text-slate-400 dark:text-slate-500">Father Name</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{student.Father_name}</span>
          </div>

          {/* Hostel type select */}
          <Field label="Hostel Type">
            <NativeSelect
              value={rowState.hostelId}
              onChange={e => onHostelChange(student.stu_id, e.target.value)}
              placeholder="-- Select Hostel Type --"
            >
              {HOSTEL_TYPES.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
            </NativeSelect>
          </Field>

          {/* Installments */}
          <div>
            <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Installments</p>
            <InstallmentList
              installments={installments}
              selected={rowState.installments}
              onToggle={(instId) => onToggleInstallment(student.stu_id, instId)}
              onToggleAll={(val) => onToggleAll(student.stu_id, val)}
              allSelected={allSelected}
              columns={2}
            />
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={() => onSave(student)}
            disabled={!canSave}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" /> Save Assignment
          </button>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ───────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, cls, setCls, admNo, setAdmNo, onSubmit, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Select Class">
            <NativeSelect
              value={cls}
              onChange={e => setCls(e.target.value)}
              placeholder="-- All Classes --"
            >
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Adm No.">
            <input
              value={admNo}
              onChange={e => setAdmNo(e.target.value)}
              placeholder="Enter admission number"
              className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                bg-white text-slate-800 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:placeholder-slate-600"
            />
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
            Submit
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function AssignHostel() {
  // ── Filter state (mirrors ddlsession, ddlclass, txtAdmno) ─────────────────
  const [session, setSession] = useState('')
  const [cls, setCls]         = useState('')
  const [admNo, setAdmNo]     = useState('')
  const [errors, setErrors]   = useState({})

  // ── Result state ───────────────────────────────────────────────────────────
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(false)
  const [shown, setShown]       = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch]     = useState('')

  // ── Per-row state: hostel type + selected installments ────────────────────
  // shape: { [stu_id]: { hostelId: '', installments: [] } }
  const [rowStates, setRowStates] = useState({})

  // ── Confirm modal state ─────────────────────────────────────────────────
  const [confirmTarget, setConfirmTarget] = useState(null)
  const [saving, setSaving] = useState(false)

  // ── Toast ────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null)
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Submit handler (btnsubmit_Click) ───────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data
      if (cls) {
        data = STUDENTS_BY_CLASS[cls] || []
      } else {
        data = ALL_STUDENTS
      }
      if (admNo.trim()) {
        const q = admNo.trim().toLowerCase()
        data = data.filter(s => s.Registration_NO.toLowerCase().includes(q))
      }

      setStudents(data)
      // Initialize per-row state for any new students
      setRowStates(prev => {
        const next = { ...prev }
        data.forEach(s => {
          if (!next[s.stu_id]) next[s.stu_id] = { hostelId: '', installments: [] }
        })
        return next
      })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} student${data.length !== 1 ? 's' : ''} for assignment.`)
    }, 600)
  }, [session, cls, admNo])

  const handleReset = () => {
    setSession(''); setCls(''); setAdmNo('')
    setStudents([]); setRowStates({}); setSearch('')
    setErrors({}); setShown(false)
  }

  // ── Hostel type change (ddlHead_SelectedIndexChanged) ──────────────────────
  const handleHostelChange = useCallback((stuId, hostelId) => {
    setRowStates(prev => ({
      ...prev,
      [stuId]: { hostelId, installments: [] } // reset installments when hostel type changes
    }))
  }, [])

  // ── Toggle single installment (cblinstallment_SelectedIndexChanged) ───────
  const handleToggleInstallment = useCallback((stuId, instId) => {
    setRowStates(prev => {
      const row = prev[stuId] || { hostelId: '', installments: [] }
      const exists = row.installments.includes(instId)
      const installments = exists
        ? row.installments.filter(i => i !== instId)
        : [...row.installments, instId]
      return { ...prev, [stuId]: { ...row, installments } }
    })
  }, [])

  // ── Toggle "Select All" (CheckBox1_CheckedChanged) ─────────────────────────
  const handleToggleAll = useCallback((stuId, selectAll) => {
    setRowStates(prev => {
      const row = prev[stuId] || { hostelId: '', installments: [] }
      const allInstallments = row.hostelId ? (INSTALLMENTS_BY_HOSTEL[row.hostelId] || []).map(i => i.id) : []
      return {
        ...prev,
        [stuId]: { ...row, installments: selectAll ? allInstallments : [] }
      }
    })
  }, [])

  // ── Save row (Button2_Click -> opens modal) ────────────────────────────────
  const handleSaveClick = useCallback((student) => {
    setConfirmTarget(student)
  }, [])

  // ── Confirm save (btnconfirm_Click) ─────────────────────────────────────────
  const handleConfirmSave = useCallback(() => {
    if (!confirmTarget) return
    setSaving(true)
    setTimeout(() => {
      setStudents(prev => prev.map(s =>
        s.stu_id === confirmTarget.stu_id ? { ...s, status: 'Assigned' } : s
      ))
      setSaving(false)
      setConfirmTarget(null)
      showToast(`Hostel assigned successfully for ${confirmTarget.name}.`)
    }, 700)
  }, [confirmTarget])

  // ── Search filter (applies to already loaded students) ─────────────────────
  const filtered = useMemo(() => {
    if (!search) return students
    const q = search.toLowerCase()
    return students.filter(s =>
      s.name.toLowerCase().includes(q) ||
      s.Registration_NO.toLowerCase().includes(q) ||
      s.Father_name.toLowerCase().includes(q) ||
      s.class.toLowerCase().includes(q)
    )
  }, [students, search])

  const hasResults = shown && students.length > 0
  const activeFilters = (session ? 1 : 0) + (cls ? 1 : 0) + (admNo ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BedDouble className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Assign Hostel
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Select students, assign a hostel type, choose installments and save.
        </p>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
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

            <Field label="Select Class">
              <NativeSelect
                value={cls}
                onChange={e => setCls(e.target.value)}
                placeholder="-- All Classes --"
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Adm No.">
              <input
                value={admNo}
                onChange={e => setAdmNo(e.target.value)}
                placeholder="Enter admission number"
                className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:placeholder-slate-600"
              />
            </Field>

            <div className="flex gap-2">
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
                Submit
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Set Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        admNo={admNo} setAdmNo={setAdmNo}
        onSubmit={handleSubmit}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Students</span>
              {cls && <span className="text-[13px] text-slate-400 dark:text-slate-500">· {cls}</span>}
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56 flex-shrink-0">
              <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, adm no, class…"
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
              Pick a Hostel Type for each student, select applicable installments, then click Save to confirm assignment.
            </p>
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden lg:block overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <SearchIcon className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No records match your search.</span>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Adm No', 'Student Name', 'Father Name', 'Class', 'Hostel Type', 'Installments', 'Action'].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12 first:text-center">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((student, i) => (
                    <DesktopRow
                      key={student.stu_id}
                      student={student}
                      idx={i + 1}
                      rowState={rowStates[student.stu_id] || { hostelId: '', installments: [] }}
                      onHostelChange={handleHostelChange}
                      onToggleInstallment={handleToggleInstallment}
                      onToggleAll={handleToggleAll}
                      onSave={handleSaveClick}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── MOBILE / TABLET CARDS ── */}
          <div className="lg:hidden p-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <SearchIcon className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No records match your search.</span>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap a card to assign hostel type and installments.
                </p>
                {filtered.map((student, i) => (
                  <MobileCard
                    key={student.stu_id}
                    student={student}
                    idx={i + 1}
                    rowState={rowStates[student.stu_id] || { hostelId: '', installments: [] }}
                    onHostelChange={handleHostelChange}
                    onToggleInstallment={handleToggleInstallment}
                    onToggleAll={handleToggleAll}
                    onSave={handleSaveClick}
                  />
                ))}
              </>
            )}
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span> records
            </p>
            {search && (
              <button onClick={() => setSearch('')}
                className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear search
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ListChecks className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
              {shown ? 'No students found' : 'No students loaded yet'}
            </p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              {shown
                ? 'Try changing the class filter or admission number and submit again.'
                : <>Select a session, optionally a class or Adm No., and click <strong>Submit</strong> to load students.</>}
            </p>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={!!confirmTarget}
        student={confirmTarget}
        onCancel={() => setConfirmTarget(null)}
        onConfirm={handleConfirmSave}
        saving={saving}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
