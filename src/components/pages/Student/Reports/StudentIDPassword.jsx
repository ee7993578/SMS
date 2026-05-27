/**
 * StudentIDPassword.jsx
 * Folder: src/pages/Student/Reports/StudentIDPassword.jsx
 *
 * Converts the legacy ASPX "Student ID Password Report" page to a
 * fully-responsive React + Tailwind component.
 *
 * Features
 *  • Session + Class filter panel (desktop inline, mobile drawer)
 *  • GridView → desktop sticky-header table + mobile cards
 *  • Inline per-row password edit (student pwd + parent pwd)
 *  • Save-per-row with loading spinner
 *  • Search / tab-filter (All / Active / Edited)
 *  • Toast notifications
 *  • Zero horizontal scroll on mobile
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Search, Filter, RefreshCw, Eye, Save,
  AlertCircle, X, Check, Loader2, ChevronDown,
  KeyRound, Users, User, Lock, Pencil,
  FileText, SlidersHorizontal, ChevronRight,
  ShieldCheck, Info, Hash
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const STATIC_STUDENTS = [
  { id: 1,  adm: '2024/NUR/001', name: 'Aarav Sharma',      cls: 'Nursery',   studentId: 'STU001', studentPwd: 'aarav@123',  fatherName: 'Rajesh Sharma',    parentId: 'PAR001', parentPwd: 'raj@2024'  },
  { id: 2,  adm: '2024/NUR/002', name: 'Ananya Singh',       cls: 'Nursery',   studentId: 'STU002', studentPwd: 'ananya@456', fatherName: 'Amit Singh',       parentId: 'PAR002', parentPwd: 'amit@2024' },
  { id: 3,  adm: '2024/LKG/001', name: 'Arjun Verma',        cls: 'LKG',       studentId: 'STU003', studentPwd: 'arjun@789',  fatherName: 'Suresh Verma',     parentId: 'PAR003', parentPwd: 'sur@2024'  },
  { id: 4,  adm: '2024/LKG/002', name: 'Diya Gupta',         cls: 'LKG',       studentId: 'STU004', studentPwd: 'diya@012',   fatherName: 'Manoj Gupta',      parentId: 'PAR004', parentPwd: 'man@2024'  },
  { id: 5,  adm: '2024/UKG/001', name: 'Ishaan Tiwari',      cls: 'UKG',       studentId: 'STU005', studentPwd: 'ishaan@345', fatherName: 'Pankaj Tiwari',    parentId: 'PAR005', parentPwd: 'pank@2024' },
  { id: 6,  adm: '2024/UKG/002', name: 'Kavya Yadav',        cls: 'UKG',       studentId: 'STU006', studentPwd: 'kavya@678',  fatherName: 'Sanjay Yadav',     parentId: 'PAR006', parentPwd: 'san@2024'  },
  { id: 7,  adm: '2024/I/001',   name: 'Mohit Rastogi',      cls: 'Class I',   studentId: 'STU007', studentPwd: 'mohit@901',  fatherName: 'Deepak Rastogi',   parentId: 'PAR007', parentPwd: 'deep@2024' },
  { id: 8,  adm: '2024/I/002',   name: 'Neha Agarwal',       cls: 'Class I',   studentId: 'STU008', studentPwd: 'neha@234',   fatherName: 'Vinod Agarwal',    parentId: 'PAR008', parentPwd: 'vin@2024'  },
  { id: 9,  adm: '2024/I/003',   name: 'Priya Mishra',       cls: 'Class I',   studentId: 'STU009', studentPwd: 'priya@567',  fatherName: 'Ramesh Mishra',    parentId: 'PAR009', parentPwd: 'ram@2024'  },
  { id: 10, adm: '2024/V/001',   name: 'Rahul Joshi',        cls: 'Class V',   studentId: 'STU010', studentPwd: 'rahul@890',  fatherName: 'Anil Joshi',       parentId: 'PAR010', parentPwd: 'anil@2024' },
  { id: 11, adm: '2024/V/002',   name: 'Rohan Dubey',        cls: 'Class V',   studentId: 'STU011', studentPwd: 'rohan@111',  fatherName: 'Vikram Dubey',     parentId: 'PAR011', parentPwd: 'vik@2024'  },
  { id: 12, adm: '2024/V/003',   name: 'Sneha Pandey',       cls: 'Class V',   studentId: 'STU012', studentPwd: 'sneha@222',  fatherName: 'Girish Pandey',    parentId: 'PAR012', parentPwd: 'gir@2024'  },
  { id: 13, adm: '2024/X/001',   name: 'Tanvi Srivastava',   cls: 'Class X',   studentId: 'STU013', studentPwd: 'tanvi@333',  fatherName: 'Alok Srivastava',  parentId: 'PAR013', parentPwd: 'alok@2024' },
  { id: 14, adm: '2024/X/002',   name: 'Vikas Chauhan',      cls: 'Class X',   studentId: 'STU014', studentPwd: 'vikas@444',  fatherName: 'Naresh Chauhan',   parentId: 'PAR014', parentPwd: 'nar@2024'  },
  { id: 15, adm: '2024/X/003',   name: 'Yash Kumar',         cls: 'Class X',   studentId: 'STU015', studentPwd: 'yash@555',   fatherName: 'Sunil Kumar',      parentId: 'PAR015', parentPwd: 'sun@2024'  },
  { id: 16, adm: '2024/XII/001', name: 'Zara Khan',          cls: 'Class XII', studentId: 'STU016', studentPwd: 'zara@666',   fatherName: 'Farrukh Khan',     parentId: 'PAR016', parentPwd: 'far@2024'  },
  { id: 17, adm: '2024/XII/002', name: 'Aditya Tripathi',    cls: 'Class XII', studentId: 'STU017', studentPwd: 'aditya@777', fatherName: 'Suresh Tripathi',  parentId: 'PAR017', parentPwd: 'sut@2024'  },
  { id: 18, adm: '2024/XII/003', name: 'Bhavna Singh',       cls: 'Class XII', studentId: 'STU018', studentPwd: 'bhavna@888', fatherName: 'Harish Singh',     parentId: 'PAR018', parentPwd: 'har@2024'  },
]

// ─── AVATAR COLORS ────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  ['#1d4ed8','#dbeafe'], ['#7c3aed','#ede9fe'], ['#0891b2','#cffafe'],
  ['#059669','#d1fae5'], ['#d97706','#fef3c7'], ['#dc2626','#fee2e2'],
]
const avatarColor = (name) =>
  AVATAR_COLORS[(name?.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────

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
          ${error ? 'border-rose-400' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
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

// Inline editable password field
function PwdCell({ value, editing, onChange, placeholder }) {
  return editing ? (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full min-w-[110px] px-2.5 py-1.5 text-[12px] rounded-lg border border-blue-300 bg-blue-50
        text-blue-900 placeholder-blue-300 outline-none focus:ring-2 focus:ring-blue-100
        dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200"
    />
  ) : (
    <span className="font-mono text-[12px] text-slate-600 dark:text-slate-300 tracking-wide">{value || '—'}</span>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, cls, setCls, onShow, loading, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class">
            <NativeSelect value={cls} onChange={e => setCls(e.target.value)} placeholder="-- All Classes --">
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Students
          </button>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, onEdit, onCancel, onUpdate, onFieldChange, saving }) {
  const [fg, bg] = avatarColor(row.name)
  const isEditing = row._editing

  return (
    <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
      ${isEditing ? 'bg-blue-50/40 dark:bg-indigo-500/[0.04]' : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}>

      {/* S.No */}
      <td className="px-3 py-3 text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10 text-center">{row._idx}</td>

      {/* Adm No */}
      <td className="px-3 py-3">
        <span className="text-[12px] font-mono font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">{row.adm}</span>
      </td>

      {/* Class */}
      <td className="px-3 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.cls}</span>
      </td>

      {/* Name */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}>
            {row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* Student ID */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5">
          <Hash className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="font-mono text-[12px] text-slate-700 dark:text-slate-300">{row.studentId}</span>
        </div>
      </td>

      {/* Student Pwd */}
      <td className="px-3 py-3 min-w-[130px]">
        <PwdCell
          value={row.studentPwd}
          editing={isEditing}
          onChange={v => onFieldChange(row.id, 'studentPwd', v)}
          placeholder="Student password"
        />
      </td>

      {/* Parent Name */}
      <td className="px-3 py-3">
        <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.fatherName}</span>
      </td>

      {/* Parent ID */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-1.5">
          <Hash className="w-3 h-3 text-slate-400 flex-shrink-0" />
          <span className="font-mono text-[12px] text-slate-700 dark:text-slate-300">{row.parentId}</span>
        </div>
      </td>

      {/* Parent Pwd */}
      <td className="px-3 py-3 min-w-[130px]">
        <PwdCell
          value={row.parentPwd}
          editing={isEditing}
          onChange={v => onFieldChange(row.id, 'parentPwd', v)}
          placeholder="Parent password"
        />
      </td>

      {/* Actions */}
      <td className="px-3 py-3 w-28">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onUpdate(row.id)}
              disabled={saving === row.id}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-white
                bg-blue-500 hover:bg-blue-600 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70"
            >
              {saving === row.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
              Update
            </button>
            <button
              type="button"
              onClick={() => onCancel(row.id)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold
                bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 transition-all"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onEdit(row.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
              bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100
              dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 dark:hover:bg-amber-500/20
              transition-all active:scale-95"
          >
            <Pencil className="w-3 h-3" />
            Edit
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, onEdit, onCancel, onUpdate, onFieldChange, saving }) {
  const [expanded, setExpanded] = useState(false)
  const [fg, bg] = avatarColor(row.name)
  const isEditing = row._editing

  return (
    <div className={`rounded-xl border overflow-hidden transition-all
      ${isEditing
        ? 'border-blue-300 dark:border-indigo-500/40 shadow-sm shadow-blue-100 dark:shadow-indigo-500/10'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'
      } bg-white dark:bg-[#1a1f35]`}>

      {/* Card header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}>
          {row.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
            {isEditing && (
              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 animate-pulse" />
            )}
          </div>
          <p className="text-[11px] font-mono text-blue-600 dark:text-blue-400">{row.adm} · {row.cls}</p>
        </div>

        {/* Key icon for status */}
        <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold flex-shrink-0
          ${isEditing
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
          }`}>
          <KeyRound className="w-3 h-3" />
          {isEditing ? 'Editing' : 'View'}
        </span>

        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 ml-1 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pb-4 pt-3 space-y-4">

          {/* Student credentials block */}
          <div className="rounded-xl bg-slate-50 dark:bg-[#1e2238] border border-slate-100 dark:border-[rgba(99,102,241,0.12)] p-3 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <User className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Student Credentials</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">Student ID</p>
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400" />
                  <span className="font-mono text-[12px] text-slate-700 dark:text-slate-300 font-semibold">{row.studentId}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">Password</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={row.studentPwd}
                    onChange={e => onFieldChange(row.id, 'studentPwd', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-blue-300 bg-blue-50
                      text-blue-900 outline-none focus:ring-2 focus:ring-blue-100
                      dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-200"
                  />
                ) : (
                  <span className="font-mono text-[12px] text-slate-700 dark:text-slate-300">{row.studentPwd}</span>
                )}
              </div>
            </div>
          </div>

          {/* Parent credentials block */}
          <div className="rounded-xl bg-slate-50 dark:bg-[#1e2238] border border-slate-100 dark:border-[rgba(99,102,241,0.12)] p-3 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-3.5 h-3.5 text-violet-500" />
              <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Parent Credentials</span>
            </div>
            <div className="mb-2">
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-0.5">Parent Name</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.fatherName}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">Parent ID</p>
                <div className="flex items-center gap-1">
                  <Hash className="w-3 h-3 text-slate-400" />
                  <span className="font-mono text-[12px] text-slate-700 dark:text-slate-300 font-semibold">{row.parentId}</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mb-1">Password</p>
                {isEditing ? (
                  <input
                    type="text"
                    value={row.parentPwd}
                    onChange={e => onFieldChange(row.id, 'parentPwd', e.target.value)}
                    className="w-full px-2.5 py-1.5 text-[12px] rounded-lg border border-violet-300 bg-violet-50
                      text-violet-900 outline-none focus:ring-2 focus:ring-violet-100
                      dark:border-violet-500/40 dark:bg-violet-500/10 dark:text-violet-200"
                  />
                ) : (
                  <span className="font-mono text-[12px] text-slate-700 dark:text-slate-300">{row.parentPwd}</span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {isEditing ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onCancel(row.id)}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                Cancel
              </button>
              <button
                type="button"
                onClick={() => onUpdate(row.id)}
                disabled={saving === row.id}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70">
                {saving === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Update
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onEdit(row.id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100
                dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 transition-colors">
              <Pencil className="w-4 h-4" />
              Change Password
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    emerald:'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StudentIDPassword() {
  // Filter state
  const [session, setSession] = useState('')
  const [cls,     setCls]     = useState('')

  // Data state
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(false)
  const [savingId,setSavingId]= useState(null)

  // Snapshots for cancel
  const [snapshots, setSnapshots] = useState({})

  // UI state
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [errors,     setErrors]     = useState({})
  const [toast,      setToast]      = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let result = [...STATIC_STUDENTS]
      if (cls) result = result.filter(r => r.cls === cls)
      setRows(result.map((r, i) => ({ ...r, _idx: i + 1, _editing: false })))
      setSnapshots({})
      setLoading(false)
    }, 650)
  }, [session, cls])

  const handleReset = () => {
    setSession(''); setCls('')
    setRows([]); setSearch(''); setErrors({})
    setSnapshots({})
  }

  // ── Row edit lifecycle ─────────────────────────────────────────────────────
  const onEdit = useCallback((id) => {
    // Save snapshot for cancel
    setSnapshots(p => {
      const row = rows.find(r => r.id === id)
      return { ...p, [id]: { studentPwd: row.studentPwd, parentPwd: row.parentPwd } }
    })
    setRows(p => p.map(r => r.id === id ? { ...r, _editing: true } : r))
  }, [rows])

  const onCancel = useCallback((id) => {
    setRows(p => p.map(r => r.id === id
      ? { ...r, _editing: false, ...(snapshots[id] ?? {}) }
      : r
    ))
  }, [snapshots])

  const onFieldChange = useCallback((id, field, value) => {
    setRows(p => p.map(r => r.id === id ? { ...r, [field]: value } : r))
  }, [])

  const onUpdate = useCallback((id) => {
    const row = rows.find(r => r.id === id)
    if (!row) return
    if (!row.studentPwd.trim()) { showToast('Student password cannot be empty.', 'error'); return }
    if (!row.parentPwd.trim())  { showToast('Parent password cannot be empty.', 'error'); return }

    setSavingId(id)
    setTimeout(() => {
      setRows(p => p.map(r => r.id === id ? { ...r, _editing: false } : r))
      setSnapshots(p => { const n = { ...p }; delete n[id]; return n })
      setSavingId(null)
      showToast(`${row.name}'s passwords updated successfully.`)
    }, 700)
  }, [rows])

  // ── Filtered view ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.adm.toLowerCase().includes(q)  ||
      r.fatherName.toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults = rows.length > 0
  const editingCount = rows.filter(r => r._editing).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Student ID &amp; Password Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and manage student &amp; parent login credentials by session and class.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────────── */}
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
            <Field label="Class">
              <NativeSelect value={cls} onChange={e => setCls(e.target.value)} placeholder="-- All Classes --">
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <div /> {/* spacer */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white transition-all active:scale-95 disabled:opacity-70
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[13px] font-semibold transition-colors
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" /> Filters
          {(session || cls) && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {[session, cls].filter(Boolean).length}
            </span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        session={session} setSession={setSession}
        cls={cls} setCls={setCls}
        onShow={handleShow} loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Results Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Results</span>
              {cls     && <span className="text-[13px] text-slate-400 dark:text-slate-500">· {cls}</span>}
              {session && <span className="text-[13px] text-slate-400 dark:text-slate-500">· {session}</span>}
              {editingCount > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {editingCount} editing
                </span>
              )}
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-56 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name / adm no…"
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

          {/* Stats row (desktop) */}
          <div className="hidden sm:flex gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
            <StatCard icon={Users}    label="Total Students" value={rows.length}       color="blue"   />
            <StatCard icon={User}     label="Parent Records" value={rows.length}       color="violet" />
            <StatCard icon={KeyRound} label="Credentials"    value={rows.length * 2}   color="emerald"/>
            <StatCard icon={Lock}     label="Currently Editing" value={editingCount}   color="amber"  />
          </div>

          {/* Info hint */}
          <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-amber-50/30 dark:bg-amber-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <p className="text-[12px] text-amber-700 dark:text-amber-400">
              Click <strong>Edit</strong> on a row to change the student or parent password, then click <strong>Update</strong> to save.
            </p>
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <Search className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No students match your search.</span>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['#', 'Adm No.', 'Class', 'Student Name', 'Student ID', 'Student Pwd', 'Parent Name', 'Parent ID', 'Parent Pwd', 'Change Pwd'].map((h, i) => (
                      <th key={i} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(row => (
                    <DesktopRow
                      key={row.id}
                      row={row}
                      onEdit={onEdit}
                      onCancel={onCancel}
                      onUpdate={onUpdate}
                      onFieldChange={onFieldChange}
                      saving={savingId}
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
                <span className="text-[13px]">No students match your search.</span>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap a card to expand and edit credentials.
                </p>
                {filtered.map(row => (
                  <MobileCard
                    key={row.id}
                    row={row}
                    onEdit={onEdit}
                    onCancel={onCancel}
                    onUpdate={onUpdate}
                    onFieldChange={onFieldChange}
                    saving={savingId}
                  />
                ))}
              </>
            )}
          </div>

          {/* Table footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> students
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

      {/* ── Empty State ──────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <KeyRound className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No results yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session and click <strong>Show</strong> to load student credentials.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
