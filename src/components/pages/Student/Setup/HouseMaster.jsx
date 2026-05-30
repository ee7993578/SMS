/**
 * HouseMaster.jsx
 * Folder: src/pages/ExamMaster/HouseMaster.jsx
 *
 * Converts legacy ASPX "House Master" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Add / Edit / Delete house records
 *  - House Name, House Incharge (dropdown), Captain, Vice Captain, House Prefect
 *  - Desktop: dense ERP table with inline actions
 *  - Mobile: card-based layout with expandable details
 *  - Validation, toast notifications, loading states
 *  - Empty state, search/filter, confirmation modal for delete
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Home, Users, ChevronDown, AlertCircle, Check, X,
  Loader2, Edit2, Trash2, Plus, RefreshCw, Search,
  Shield, Star, Crown, User2, ChevronRight,
  SlidersHorizontal, Info, BookOpen, BarChart3,
  Building2, UserCheck, Award, Sword
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const INCHARGE_OPTIONS = [
  { id: 1,  name: 'Mr. Rajesh Kumar Sharma'   },
  { id: 2,  name: 'Mrs. Sunita Devi Pant'     },
  { id: 3,  name: 'Mr. Vinod Chandra Negi'    },
  { id: 4,  name: 'Mrs. Kavita Singh Rawat'   },
  { id: 5,  name: 'Mr. Deepak Joshi'          },
  { id: 6,  name: 'Mrs. Priya Mehta'          },
  { id: 7,  name: 'Mr. Anil Kumar Bisht'      },
  { id: 8,  name: 'Mrs. Rekha Verma'          },
]

const INITIAL_HOUSES = [
  { id: 1, houseName: 'Himalaya House', inchargeId: 1, inchargeName: 'Mr. Rajesh Kumar Sharma', captain: 'Aryan Thakur',    viceCaptain: 'Priya Rawat',   prefect: 'Rohan Singh'   },
  { id: 2, houseName: 'Ganga House',    inchargeId: 2, inchargeName: 'Mrs. Sunita Devi Pant',   captain: 'Sneha Bisht',    viceCaptain: 'Mohit Negi',    prefect: 'Anika Joshi'   },
  { id: 3, houseName: 'Yamuna House',   inchargeId: 3, inchargeName: 'Mr. Vinod Chandra Negi',  captain: 'Kartik Pandey',  viceCaptain: 'Simran Kaur',   prefect: 'Dev Chauhan'   },
  { id: 4, houseName: 'Saraswati House',inchargeId: 4, inchargeName: 'Mrs. Kavita Singh Rawat', captain: 'Riya Verma',     viceCaptain: 'Rahul Sharma',  prefect: 'Pooja Gupta'   },
]

// House accent colours (cycling)
const HOUSE_COLORS = [
  { ring: 'ring-blue-400',   bg: 'bg-blue-50 dark:bg-blue-500/10',   text: 'text-blue-700 dark:text-blue-300',   icon: 'text-blue-500',  dot: 'bg-blue-500'  },
  { ring: 'ring-emerald-400',bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', icon: 'text-emerald-500', dot: 'bg-emerald-500' },
  { ring: 'ring-amber-400',  bg: 'bg-amber-50 dark:bg-amber-500/10',  text: 'text-amber-700 dark:text-amber-300',  icon: 'text-amber-500', dot: 'bg-amber-500'  },
  { ring: 'ring-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10',text: 'text-violet-700 dark:text-violet-300',icon: 'text-violet-500',dot: 'bg-violet-500' },
  { ring: 'ring-rose-400',   bg: 'bg-rose-50 dark:bg-rose-500/10',    text: 'text-rose-700 dark:text-rose-300',    icon: 'text-rose-500',  dot: 'bg-rose-500'   },
  { ring: 'ring-cyan-400',   bg: 'bg-cyan-50 dark:bg-cyan-500/10',    text: 'text-cyan-700 dark:text-cyan-300',    icon: 'text-cyan-500',  dot: 'bg-cyan-500'   },
]
const houseColor = (id) => HOUSE_COLORS[(id - 1) % HOUSE_COLORS.length]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Styled native select */
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

/** Labeled field with optional error */
function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}{required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="ml-auto text-[10px] font-normal normal-case tracking-normal text-slate-400 dark:text-slate-500">{hint}</span>
        )}
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

/** Styled text input */
function TextInput({ value, onChange, placeholder, error, disabled, icon: Icon }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />}
      <input
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`w-full py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${Icon ? 'pl-8 pr-3' : 'px-3'}
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      />
    </div>
  )
}

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

/** Delete confirmation modal */
function ConfirmModal({ house, onConfirm, onCancel }) {
  if (!house) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm" onClick={onCancel} />
      <div
        className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[60] max-w-sm mx-auto
          rounded-2xl bg-white dark:bg-[#1a1f35] border border-rose-200 dark:border-rose-500/30
          shadow-2xl p-6"
        style={{ animation: 'popIn .2s ease' }}
      >
        <style>{`@keyframes popIn{from{opacity:0;transform:translateY(-50%) scale(.95)}to{opacity:1;transform:translateY(-50%) scale(1)}}`}</style>
        <div className="flex items-start gap-4 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Delete House?</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Are you sure you want to delete <span className="font-semibold text-rose-600 dark:text-rose-400">{house.houseName}</span>? This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 text-white
              hover:bg-rose-700 transition-colors shadow-md shadow-rose-500/20">
            Yes, Delete
          </button>
        </div>
      </div>
    </>
  )
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    violet: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    amber:  'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    emerald:'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[22px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ house, idx, onEdit, onDelete }) {
  const c = houseColor(house.id)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* House Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className={`w-2 h-8 rounded-full flex-shrink-0 ${c.dot}`} />
          <div>
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{house.houseName}</p>
          </div>
        </div>
      </td>

      {/* Incharge */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{house.inchargeName}</span>
        </div>
      </td>

      {/* Captain */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Crown className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
          <span className="text-[12px] text-slate-600 dark:text-slate-300">{house.captain || <span className="text-slate-300 dark:text-slate-600">—</span>}</span>
        </div>
      </td>

      {/* Vice Captain */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
          <span className="text-[12px] text-slate-600 dark:text-slate-300">{house.viceCaptain || <span className="text-slate-300 dark:text-slate-600">—</span>}</span>
        </div>
      </td>

      {/* House Prefect */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
          <span className="text-[12px] text-slate-600 dark:text-slate-300">{house.prefect || <span className="text-slate-300 dark:text-slate-600">—</span>}</span>
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 justify-center">
          <button
            onClick={() => onEdit(house)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
              bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
              transition-colors border border-blue-100 dark:border-blue-500/20"
          >
            <Edit2 className="w-3 h-3" /> Edit
          </button>
          <button
            onClick={() => onDelete(house)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
              bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
              transition-colors border border-rose-100 dark:border-rose-500/20"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ house, idx, onEdit, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const c = houseColor(house.id)

  return (
    <div className={`rounded-2xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm ring-1 ring-transparent transition-all
      ${expanded ? `${c.ring} shadow-md` : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'}`}>

      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Colour dot + index */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center`}>
            <Home className={`w-4 h-4 ${c.icon}`} />
          </span>
          <span className="text-[9px] font-bold text-slate-400">#{idx}</span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight truncate">{house.houseName}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <UserCheck className="w-3 h-3 text-slate-400 flex-shrink-0" />
            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{house.inchargeName}</p>
          </div>
        </div>

        {/* Quick preview */}
        <div className="flex flex-col items-end gap-0.5 flex-shrink-0 mr-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.bg} ${c.text}`}>
            Active
          </span>
        </div>

        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-4 space-y-4">

          {/* Role chips */}
          <div className="grid grid-cols-1 gap-2.5">
            {/* Captain */}
            <div className="flex items-center gap-3 rounded-xl border border-amber-100 dark:border-amber-500/20 bg-amber-50 dark:bg-amber-500/[0.07] px-3.5 py-2.5">
              <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">Captain</p>
                <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">{house.captain || '—'}</p>
              </div>
            </div>

            {/* Vice Captain */}
            <div className="flex items-center gap-3 rounded-xl border border-violet-100 dark:border-violet-500/20 bg-violet-50 dark:bg-violet-500/[0.07] px-3.5 py-2.5">
              <Star className="w-4 h-4 text-violet-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">Vice Captain</p>
                <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">{house.viceCaptain || '—'}</p>
              </div>
            </div>

            {/* House Prefect */}
            <div className="flex items-center gap-3 rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/[0.07] px-3.5 py-2.5">
              <Shield className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">House Prefect</p>
                <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">{house.prefect || '—'}</p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onEdit(house)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 shadow-sm"
            >
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button
              onClick={() => onDelete(house)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-rose-600 text-white hover:bg-rose-700
                transition-all active:scale-95 shadow-sm"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HouseMaster() {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    houseName:  '',
    inchargeId: '',
    captain:    '',
    viceCaptain:'',
    prefect:    '',
  })
  const [errors,    setErrors]    = useState({})
  const [editingId, setEditingId] = useState(null)   // null = Add mode
  const [submitting,setSubmitting]= useState(false)

  // ── Records ────────────────────────────────────────────────────────────────
  const [houses, setHouses] = useState(INITIAL_HOUSES)
  const nextId = useRef(INITIAL_HOUSES.length + 1)

  // ── UI state ───────────────────────────────────────────────────────────────
  const [search,       setSearch]       = useState('')
  const [toast,        setToast]        = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const formRef = useRef(null)

  // ── Toast helper ───────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  // ── Field change ───────────────────────────────────────────────────────────
  const handleChange = (field) => (e) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
    setErrors(prev => ({ ...prev, [field]: undefined }))
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!formData.houseName.trim())  err.houseName  = 'House name is required'
    if (!formData.inchargeId)        err.inchargeId = 'Please select a house incharge'
    if (Object.keys(err).length) { setErrors(err); return false }
    return true
  }

  // ── Reset form ─────────────────────────────────────────────────────────────
  const resetForm = useCallback(() => {
    setFormData({ houseName: '', inchargeId: '', captain: '', viceCaptain: '', prefect: '' })
    setErrors({})
    setEditingId(null)
  }, [])

  // ── Submit (Add / Update) ──────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!validate()) return
    setSubmitting(true)

    const incharge = INCHARGE_OPTIONS.find(o => String(o.id) === String(formData.inchargeId))

    setTimeout(() => {
      if (editingId !== null) {
        // Update
        setHouses(prev => prev.map(h =>
          h.id === editingId
            ? { ...h, houseName: formData.houseName.trim(), inchargeId: Number(formData.inchargeId),
                inchargeName: incharge?.name || '', captain: formData.captain.trim(),
                viceCaptain: formData.viceCaptain.trim(), prefect: formData.prefect.trim() }
            : h
        ))
        showToast('House updated successfully!')
      } else {
        // Add
        const newHouse = {
          id:           nextId.current++,
          houseName:    formData.houseName.trim(),
          inchargeId:   Number(formData.inchargeId),
          inchargeName: incharge?.name || '',
          captain:      formData.captain.trim(),
          viceCaptain:  formData.viceCaptain.trim(),
          prefect:      formData.prefect.trim(),
        }
        setHouses(prev => [...prev, newHouse])
        showToast('House added successfully!')
      }
      resetForm()
      setSubmitting(false)
      // Scroll to list on mobile
      setTimeout(() => document.getElementById('house-list')?.scrollIntoView({ behavior: 'smooth' }), 100)
    }, 550)
  }, [formData, editingId, resetForm])

  // ── Edit ───────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((house) => {
    setFormData({
      houseName:   house.houseName,
      inchargeId:  String(house.inchargeId),
      captain:     house.captain,
      viceCaptain: house.viceCaptain,
      prefect:     house.prefect,
    })
    setErrors({})
    setEditingId(house.id)
    formRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteConfirm = useCallback(() => {
    setHouses(prev => prev.filter(h => h.id !== deleteTarget.id))
    showToast(`"${deleteTarget.houseName}" deleted.`, 'error')
    setDeleteTarget(null)
    if (editingId === deleteTarget?.id) resetForm()
  }, [deleteTarget, editingId, resetForm])

  // ── Filtered list ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return houses
    const q = search.toLowerCase()
    return houses.filter(h =>
      h.houseName.toLowerCase().includes(q) ||
      h.inchargeName.toLowerCase().includes(q) ||
      h.captain.toLowerCase().includes(q) ||
      h.viceCaptain.toLowerCase().includes(q) ||
      h.prefect.toLowerCase().includes(q)
    )
  }, [houses, search])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     houses.length,
    captains:  houses.filter(h => h.captain).length,
    incharges: new Set(houses.map(h => h.inchargeId)).size,
    prefects:  houses.filter(h => h.prefect).length,
  }), [houses])

  const isEditing = editingId !== null

  return (
    <div className="space-y-5 pb-12">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
            House Master
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 ml-10 sm:ml-0">
            Manage school houses — assign incharge, captain, vice captain &amp; prefect.
          </p>
        </div>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard icon={Home}      label="Total Houses"    value={stats.total}     color="blue"    />
        <StatCard icon={UserCheck} label="Incharges"       value={stats.incharges} color="violet"  />
        <StatCard icon={Crown}     label="Captains Assigned" value={stats.captains} color="amber"  />
        <StatCard icon={Shield}    label="Prefects Assigned" value={stats.prefects} color="emerald"/>
      </div>

      {/* ── Form Card ─────────────────────────────────────────────────────── */}
      <div
        ref={formRef}
        className={`rounded-2xl border shadow-sm overflow-hidden transition-all
          ${isEditing
            ? 'border-amber-200 dark:border-amber-500/30 ring-2 ring-amber-100 dark:ring-amber-500/10'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)]'}
          bg-white dark:bg-[#1a1f35]`}
      >
        {/* Card header */}
        <div className={`flex items-center gap-3 px-5 py-3.5 border-b
          ${isEditing
            ? 'border-amber-100 dark:border-amber-500/20 bg-amber-50/70 dark:bg-amber-500/[0.04]'
            : 'border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]'}`}>
          <span className={`w-1 h-5 rounded-full flex-shrink-0 ${isEditing ? 'bg-amber-500' : 'bg-blue-500'}`} />
          <Home className={`w-4 h-4 flex-shrink-0 ${isEditing ? 'text-amber-600 dark:text-amber-400' : 'text-blue-600 dark:text-blue-400'}`} />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            {isEditing ? 'Edit House' : 'Add New House'}
          </span>
          {isEditing && (
            <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/25">
              Editing Mode
            </span>
          )}
        </div>

        {/* Form body */}
        <div className="p-5">
          {/* Row 1 — House Name + Incharge */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Field label="Name of the House" error={errors.houseName} required>
              <TextInput
                value={formData.houseName}
                onChange={handleChange('houseName')}
                placeholder="e.g. Himalaya House"
                error={errors.houseName}
                icon={Home}
              />
            </Field>

            <Field label="House Incharge" error={errors.inchargeId} required>
              <NativeSelect
                value={formData.inchargeId}
                onChange={handleChange('inchargeId')}
                placeholder="-- Select Incharge --"
                error={errors.inchargeId}
              >
                {INCHARGE_OPTIONS.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </NativeSelect>
            </Field>
          </div>

          {/* Row 2 — Captain + Vice Captain + Prefect */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
            <Field label="Captain" hint="Optional">
              <TextInput
                value={formData.captain}
                onChange={handleChange('captain')}
                placeholder="Captain name"
                icon={Crown}
              />
            </Field>

            <Field label="Vice Captain" hint="Optional">
              <TextInput
                value={formData.viceCaptain}
                onChange={handleChange('viceCaptain')}
                placeholder="Vice captain name"
                icon={Star}
              />
            </Field>

            <Field label="House Prefect" hint="Optional">
              <TextInput
                value={formData.prefect}
                onChange={handleChange('prefect')}
                placeholder="Prefect name"
                icon={Shield}
              />
            </Field>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className={`flex-1 sm:flex-none sm:min-w-[160px] flex items-center justify-center gap-2
                py-2.5 px-5 rounded-xl text-[13px] font-bold text-white
                transition-all active:scale-95 disabled:opacity-70 shadow-md
                ${isEditing
                  ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20'
                }`}
            >
              {submitting
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : isEditing
                  ? <><Edit2 className="w-4 h-4" /> Update House</>
                  : <><Plus className="w-4 h-4" /> Add House</>
              }
            </button>

            <button
              type="button"
              onClick={resetForm}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
                dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {isEditing ? 'Cancel Edit' : 'Reset'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Records Card ──────────────────────────────────────────────────── */}
      <div
        id="house-list"
        className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden"
      >
        {/* Card header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Houses List</span>
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
              placeholder="Search house, incharge…"
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
        <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[11px] text-blue-700 dark:text-blue-400">
            <span className="hidden sm:inline">Click <strong>Edit</strong> to modify a house record. </span>
            <span className="sm:hidden">Tap a card to expand and edit/delete. </span>
            Deleted records cannot be recovered.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 gap-3 text-slate-400 dark:text-slate-600">
              <BarChart3 className="w-7 h-7 opacity-40" />
              <span className="text-[13px]">
                {houses.length === 0 ? 'No houses added yet. Use the form above.' : 'No records match your search.'}
              </span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'House Name', 'House Incharge', 'Captain', 'Vice Captain', 'House Prefect', 'Actions'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((house, i) => (
                  <DesktopRow
                    key={house.id}
                    house={house}
                    idx={i + 1}
                    onEdit={handleEdit}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400 dark:text-slate-600">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Home className="w-6 h-6 opacity-40" />
              </div>
              <span className="text-[13px] font-medium">
                {houses.length === 0 ? 'No houses yet. Add one above!' : 'No records match your search.'}
              </span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to view details, edit or delete.
              </p>
              {filtered.map((house, i) => (
                <MobileCard
                  key={house.id}
                  house={house}
                  idx={i + 1}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                />
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{houses.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* ── Empty State (no records at all & form untouched) ─────────────── */}
      {houses.length === 0 && (
        <div className="flex flex-col items-center justify-center py-10 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Home className="w-7 h-7 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No houses yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Fill in the form above and click <strong>Add House</strong> to get started.
            </p>
          </div>
        </div>
      )}

      {/* ── Modals & Toasts ──────────────────────────────────────────────── */}
      <ConfirmModal
        house={deleteTarget}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
