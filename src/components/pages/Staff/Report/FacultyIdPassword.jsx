/**
 * FacultyIdPassword.jsx
 * Folder: src/pages/Faculty/Reports/FacultyIdPassword.jsx
 *
 * Converts legacy ASPX "Faculty User Id Password" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Faculty Name, User Id, Faculty Password, Class Teacher, Actions
 * Features:
 *  - Inline edit for User Id & Password per row (Edit / Update / Cancel)
 *  - Search / filter by name, user id, class
 *  - Toast feedback on update
 *  - Mobile: card-based layout with expandable edit form
 *  - Desktop: dense ERP-style table with inline edit
 *  - Loading skeleton & empty state
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Users, Search, X, Check, AlertCircle, Loader2,
  ChevronDown, Edit2, RefreshCw, Eye, EyeOff,
  ShieldCheck, BookOpen, Building2, ChevronRight,
  UserCog, KeyRound, GraduationCap, Info,
  SlidersHorizontal, Save, XCircle
} from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const INITIAL_FACULTY = [
  { id: 1,  name: 'Ramesh Kumar Sharma',    user_email: 'ramesh.sharma@school.in',    password: 'Ram@1234',   class_teacher: 'Class VI-A'   },
  { id: 2,  name: 'Sunita Devi Verma',      user_email: 'sunita.verma@school.in',     password: 'Sun@5678',   class_teacher: 'Class VII-A'  },
  { id: 3,  name: 'Anil Prakash Gupta',     user_email: 'anil.gupta@school.in',       password: 'Anil#9012',  class_teacher: 'Class VIII-A' },
  { id: 4,  name: 'Meena Singh Chauhan',    user_email: 'meena.singh@school.in',      password: 'Meen$3456',  class_teacher: 'Class IX-A'   },
  { id: 5,  name: 'Vijay Prasad Mishra',    user_email: 'vijay.mishra@school.in',     password: 'Vijay!7890', class_teacher: 'Class X-A'    },
  { id: 6,  name: 'Kavita Rani Srivastava', user_email: 'kavita.sri@school.in',       password: 'Kav@2345',   class_teacher: 'Class I-A'    },
  { id: 7,  name: 'Deepak Nath Tiwari',     user_email: 'deepak.tiwari@school.in',    password: 'Deep#6789',  class_teacher: 'Class II-A'   },
  { id: 8,  name: 'Priya Lakshmi Yadav',    user_email: 'priya.yadav@school.in',      password: 'Priy$0123',  class_teacher: 'Class III-A'  },
  { id: 9,  name: 'Suresh Chandra Pandey',  user_email: 'suresh.pandey@school.in',    password: 'Sur!4567',   class_teacher: 'Class IV-A'   },
  { id: 10, name: 'Rekha Devi Joshi',       user_email: 'rekha.joshi@school.in',      password: 'Rekh@8901',  class_teacher: 'Class V-A'    },
  { id: 11, name: 'Manoj Kumar Tripathi',   user_email: 'manoj.tripathi@school.in',   password: 'Man#2345',   class_teacher: 'Class XI-A'   },
  { id: 12, name: 'Anita Kumari Saxena',    user_email: 'anita.saxena@school.in',     password: 'Anit$6789',  class_teacher: 'Class XII-A'  },
  { id: 13, name: 'Rajendra Singh Rawat',   user_email: 'rajendra.rawat@school.in',   password: 'Raj!0123',   class_teacher: 'Nursery-A'    },
  { id: 14, name: 'Shalini Kumari Bajpai',  user_email: 'shalini.bajpai@school.in',   password: 'Shal@4567',  class_teacher: 'LKG-A'        },
  { id: 15, name: 'Harish Nath Pathak',     user_email: 'harish.pathak@school.in',    password: 'Har#8901',   class_teacher: 'UKG-A'        },
]

// Avatar color palette per faculty
const AVATAR_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
  { fg: '#be185d', bg: '#fce7f3' },
]
const avatarColor = (id) => AVATAR_COLORS[(id - 1) % AVATAR_COLORS.length]

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

// Mask password like ●●●●●●
const maskPassword = (pwd = '') => '●'.repeat(Math.min(pwd.length, 8))

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Inline text input for table edit */
function EditInput({ value, onChange, type = 'text', placeholder, error }) {
  return (
    <div className="flex flex-col gap-0.5">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete="off"
        className={`w-full px-2.5 py-1.5 text-[12px] rounded-lg border outline-none transition-all
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      />
      {error && (
        <p className="flex items-center gap-1 text-[10px] text-rose-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

/** Toast notification */
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

/** Summary stat card — same pattern as StrengthReport */
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── PASSWORD CELL — toggle visibility ────────────────────────────────────────
function PasswordCell({ value }) {
  const [show, setShow] = useState(false)
  return (
    <div className="flex items-center gap-1.5 justify-center">
      <span className="text-[12px] font-mono text-slate-700 dark:text-slate-300 tabular-nums">
        {show ? value : maskPassword(value)}
      </span>
      <button
        type="button"
        onClick={() => setShow(p => !p)}
        className="text-slate-400 hover:text-blue-500 transition-colors"
        title={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, editingId, editDraft, editErrors, onEdit, onUpdate, onCancel, onDraftChange, updatingId }) {
  const isEditing = editingId === row.id
  const isUpdating = updatingId === row.id
  const { fg, bg } = avatarColor(row.id)

  return (
    <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
      ${isEditing
        ? 'bg-blue-50/40 dark:bg-indigo-500/[0.05]'
        : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}>

      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Faculty Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {initials(row.name)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
        </div>
      </td>

      {/* User Id */}
      <td className="px-4 py-3 min-w-[190px]">
        {isEditing ? (
          <EditInput
            value={editDraft.user_email}
            onChange={e => onDraftChange('user_email', e.target.value)}
            placeholder="Enter user id / email"
            error={editErrors.user_email}
          />
        ) : (
          <span className="text-[12px] text-slate-600 dark:text-slate-300 font-mono">{row.user_email}</span>
        )}
      </td>

      {/* Password */}
      <td className="px-4 py-3 min-w-[160px]">
        {isEditing ? (
          <EditInput
            value={editDraft.password}
            onChange={e => onDraftChange('password', e.target.value)}
            placeholder="Enter password"
            error={editErrors.password}
          />
        ) : (
          <PasswordCell value={row.password} />
        )}
      </td>

      {/* Class Teacher */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold
          bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 whitespace-nowrap">
          <GraduationCap className="w-3 h-3" />
          {row.class_teacher}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-center">
        {isEditing ? (
          <div className="flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => onUpdate(row.id)}
              disabled={isUpdating}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70 transition-all active:scale-95"
            >
              {isUpdating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Update
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onEdit(row)}
            disabled={editingId !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400
              dark:hover:bg-blue-500/20 disabled:opacity-40 transition-colors active:scale-95"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit
          </button>
        )}
      </td>
    </tr>
  )
}

// ─── MOBILE FACULTY CARD ──────────────────────────────────────────────────────
function MobileCard({ row, editingId, editDraft, editErrors, onEdit, onUpdate, onCancel, onDraftChange, updatingId }) {
  const [expanded, setExpanded] = useState(false)
  const [showPwd, setShowPwd] = useState(false)
  const isEditing = editingId === row.id
  const isUpdating = updatingId === row.id
  const { fg, bg } = avatarColor(row.id)

  // Auto-expand when entering edit mode
  const prevEditing = useRef(false)
  if (isEditing && !prevEditing.current) { setExpanded(true) }
  prevEditing.current = isEditing

  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm transition-all
      ${isEditing
        ? 'border-blue-300 dark:border-indigo-500/40 bg-blue-50/30 dark:bg-indigo-500/[0.05]'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'}`}>

      {/* Header */}
      <button
        type="button"
        onClick={() => !isEditing && setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {initials(row.name)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate font-mono">{row.user_email}</p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!isEditing && (
            <button
              type="button"
              onClick={e => { e.stopPropagation(); onEdit(row) }}
              disabled={editingId !== null}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
                bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400
                disabled:opacity-40 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              Edit
            </button>
          )}
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {/* Class teacher badge strip */}
      <div className="px-4 pb-3 flex items-center gap-2">
        <GraduationCap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">Class Teacher: {row.class_teacher}</span>
      </div>

      {/* Expanded: view or edit */}
      {(expanded || isEditing) && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-4 space-y-4">

          {isEditing ? (
            /* ── EDIT FORM ── */
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Edit2 className="w-3.5 h-3.5" /> Editing credentials
              </p>

              {/* User ID field */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  User ID / Email <span className="text-rose-500">*</span>
                </label>
                <EditInput
                  value={editDraft.user_email}
                  onChange={e => onDraftChange('user_email', e.target.value)}
                  placeholder="Enter user id / email"
                  error={editErrors.user_email}
                />
              </div>

              {/* Password field */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Password <span className="text-rose-500">*</span>
                </label>
                <EditInput
                  value={editDraft.password}
                  onChange={e => onDraftChange('password', e.target.value)}
                  placeholder="Enter password"
                  error={editErrors.password}
                />
              </div>

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onUpdate(row.id)}
                  disabled={isUpdating}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                    bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70 transition-all active:scale-95"
                >
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Update
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                    bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* ── VIEW DETAIL ── */
            <div className="grid grid-cols-1 gap-3">
              {/* User ID */}
              <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <UserCog className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">User ID</p>
                </div>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 font-mono break-all">{row.user_email}</p>
              </div>

              {/* Password */}
              <div className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-violet-500" />
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">Password</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPwd(p => !p)}
                    className="flex items-center gap-1 text-[10px] font-semibold text-blue-500 hover:text-blue-600"
                  >
                    {showPwd ? <><EyeOff className="w-3 h-3" /> Hide</> : <><Eye className="w-3 h-3" /> Show</>}
                  </button>
                </div>
                <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 font-mono">
                  {showPwd ? row.password : maskPassword(row.password)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE SEARCH DRAWER ─────────────────────────────────────────────────────
function SearchDrawer({ open, onClose, search, setSearch }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Faculty</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, user id, class…"
              className="w-full pl-9 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function FacultyIdPassword() {
  const [faculty,     setFaculty]     = useState(INITIAL_FACULTY)
  const [search,      setSearch]      = useState('')
  const [editingId,   setEditingId]   = useState(null)
  const [editDraft,   setEditDraft]   = useState({ user_email: '', password: '' })
  const [editErrors,  setEditErrors]  = useState({})
  const [updatingId,  setUpdatingId]  = useState(null)
  const [toast,       setToast]       = useState(null)
  const [drawerOpen,  setDrawerOpen]  = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return faculty
    const q = search.toLowerCase()
    return faculty.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.user_email.toLowerCase().includes(q) ||
      f.class_teacher.toLowerCase().includes(q)
    )
  }, [faculty, search])

  // ── Edit actions ──────────────────────────────────────────────────────────
  const handleEdit = useCallback((row) => {
    setEditingId(row.id)
    setEditDraft({ user_email: row.user_email, password: row.password })
    setEditErrors({})
  }, [])

  const handleCancel = useCallback(() => {
    setEditingId(null)
    setEditDraft({ user_email: '', password: '' })
    setEditErrors({})
  }, [])

  const handleDraftChange = useCallback((field, value) => {
    setEditDraft(p => ({ ...p, [field]: value }))
    setEditErrors(p => ({ ...p, [field]: undefined }))
  }, [])

  const handleUpdate = useCallback((id) => {
    // Validate
    const errs = {}
    if (!editDraft.user_email.trim()) errs.user_email = 'User ID is required'
    else if (!editDraft.user_email.includes('@')) errs.user_email = 'Enter a valid email'
    if (!editDraft.password.trim()) errs.password = 'Password is required'
    else if (editDraft.password.length < 6) errs.password = 'Min 6 characters required'
    if (Object.keys(errs).length) { setEditErrors(errs); return }

    setUpdatingId(id)

    // Simulate API call
    setTimeout(() => {
      setFaculty(prev =>
        prev.map(f =>
          f.id === id ? { ...f, user_email: editDraft.user_email.trim(), password: editDraft.password.trim() } : f
        )
      )
      setEditingId(null)
      setUpdatingId(null)
      setEditDraft({ user_email: '', password: '' })
      setEditErrors({})
      showToast('Faculty credentials updated successfully!')
    }, 800)
  }, [editDraft])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const classTeachers = useMemo(() => new Set(faculty.map(f => f.class_teacher)).size, [faculty])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Faculty User Id &amp; Password
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and update faculty login credentials and class teacher assignments.
          </p>
        </div>
      </div>

      {/* ── Summary Cards ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={Users}          label="Total Faculty"    value={faculty.length}  color="blue"    />
        <SummaryCard icon={GraduationCap}  label="Class Teachers"   value={classTeachers}   color="amber"   />
        <SummaryCard icon={ShieldCheck}    label="Active Accounts"  value={faculty.length}  color="emerald" />
        <SummaryCard icon={KeyRound}       label="Credentials Set"  value={faculty.length}  color="violet"  />
      </div>

      {/* ── DESKTOP Search Bar ───────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Search className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search &amp; Filter</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Search input */}
            <div className="lg:col-span-3">
              <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">
                Search Faculty
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search by name, user id, or class teacher…"
                  className="w-full pl-9 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Reset */}
            <div>
              <button
                type="button"
                onClick={() => { setSearch(''); handleCancel() }}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Toolbar ───────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <Search className="w-4 h-4" />
          {search ? `"${search}"` : 'Search Faculty'}
          {search && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">1</span>
          )}
        </button>
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <SearchDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        search={search}
        setSearch={setSearch}
      />

      {/* ── Results Panel ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Panel Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Faculty Credentials</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Info hint */}
        <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Click <strong>Edit</strong> on any row to update User ID or Password. Only one record can be edited at a time.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No records match your search.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Faculty Name', 'User Id', 'Faculty Password', 'Class Teacher', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow
                    key={row.id}
                    row={row}
                    idx={i + 1}
                    editingId={editingId}
                    editDraft={editDraft}
                    editErrors={editErrors}
                    onEdit={handleEdit}
                    onUpdate={handleUpdate}
                    onCancel={handleCancel}
                    onDraftChange={handleDraftChange}
                    updatingId={updatingId}
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
              <span className="text-[13px]">No records match your search.</span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to view details. Tap <strong>Edit</strong> to update credentials.
              </p>
              {filtered.map(row => (
                <MobileCard
                  key={row.id}
                  row={row}
                  editingId={editingId}
                  editDraft={editDraft}
                  editErrors={editErrors}
                  onEdit={handleEdit}
                  onUpdate={handleUpdate}
                  onCancel={handleCancel}
                  onDraftChange={handleDraftChange}
                  updatingId={updatingId}
                />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{faculty.length}</span> faculty records
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

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
