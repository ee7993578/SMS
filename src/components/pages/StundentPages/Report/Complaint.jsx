/**
 * Complaint.jsx
 * Folder: src/pages/Student/Complaint/Complaint.jsx
 *
 * Converts legacy ASPX "Sent Complaint" page to fully-responsive React + Tailwind.
 * Design system matches StrengthReport.jsx (same ERP theme).
 *
 * Features:
 *  - Submit complaint form (Name + Description)
 *  - View all past complaints in a table (desktop) / cards (mobile)
 *  - Reply status per complaint
 *  - Toast notifications
 *  - Full validation
 *  - Fully responsive: desktop table → mobile accordion cards
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  MessageSquarePlus, Send, RefreshCw, AlertCircle,
  X, Check, Loader2, ChevronDown, ChevronRight,
  Search, Info, ClipboardList, Clock, CheckCircle2,
  MessageSquare, User, Hash, Calendar, Reply,
  Inbox, SlidersHorizontal, Eye, ShieldAlert,
  Megaphone, FileText
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const STUDENT_REG_NO = 'STU-2025-00142'
const STUDENT_NAME_DEFAULT = 'Rahul Sharma'

const DUMMY_COMPLAINTS = [
  {
    id: 1,
    registration_no: 'STU-2025-00142',
    Name: 'Rahul Sharma',
    complaintno: 'CMP-001',
    desc: 'Classroom projector in Room 204 has been malfunctioning for the past two weeks. It severely affects our studies.',
    complaint_date: '2025-06-01',
    reply_msg: 'Issue has been escalated to the maintenance team. Will be resolved by next week.',
    reply_date: '2025-06-03',
  },
  {
    id: 2,
    registration_no: 'STU-2025-00142',
    Name: 'Rahul Sharma',
    complaintno: 'CMP-002',
    desc: 'Library books for Physics Class XI are not available. Many students are unable to study.',
    complaint_date: '2025-06-08',
    reply_msg: 'New books have been ordered and will arrive within 5 days.',
    reply_date: '2025-06-10',
  },
  {
    id: 3,
    registration_no: 'STU-2025-00142',
    Name: 'Rahul Sharma',
    complaintno: 'CMP-003',
    desc: 'Drinking water cooler on the second floor is not working since last Monday.',
    complaint_date: '2025-06-12',
    reply_msg: '',
    reply_date: '',
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
let complaintCounter = DUMMY_COMPLAINTS.length + 1
const formatDate = (d) => {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}
const genComplaintNo = () => `CMP-${String(complaintCounter).padStart(3, '0')}`
const todayStr = () => new Date().toISOString().slice(0, 10)

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Styled text input */
function TextInput({ value, onChange, placeholder, error, disabled, id }) {
  return (
    <input
      id={id}
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="off"
      className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        }`}
    />
  )
}

/** Styled textarea */
function TextArea({ value, onChange, placeholder, error, disabled, rows = 4 }) {
  return (
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      rows={rows}
      className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all resize-none
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
        dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        }`}
    />
  )
}

/** Form field wrapper with label + error */
function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <Info className="w-3 h-3 flex-shrink-0" />{hint}
        </p>
      )}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
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
      <button onClick={onClose} className="opacity-75 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

/** Status badge for reply */
function ReplyBadge({ replied }) {
  if (replied) {
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
        <CheckCircle2 className="w-3 h-3" /> Replied
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
      <Clock className="w-3 h-3" /> Pending
    </span>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
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

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const replied = Boolean(row.reply_msg)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Reg No */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg whitespace-nowrap">
          <Hash className="w-3 h-3" />{row.registration_no}
        </span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center text-[11px] font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
            {row.Name.charAt(0)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.Name}</span>
        </div>
      </td>

      {/* Complaint No */}
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] font-bold text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10 px-2.5 py-1 rounded-lg inline-block">
          {row.complaintno}
        </span>
      </td>

      {/* Description */}
      <td className="px-4 py-3 max-w-[200px]">
        <p className="text-[12px] text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">{row.desc}</p>
      </td>

      {/* Complaint Date */}
      <td className="px-4 py-3 text-center">
        <span className="text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
          {formatDate(row.complaint_date)}
        </span>
      </td>

      {/* Reply Msg */}
      <td className="px-4 py-3 max-w-[180px]">
        {row.reply_msg
          ? <p className="text-[12px] text-emerald-700 dark:text-emerald-400 line-clamp-2 leading-relaxed">{row.reply_msg}</p>
          : <span className="text-[12px] text-slate-300 dark:text-slate-600 italic">No reply yet</span>
        }
      </td>

      {/* Reply Date + Status */}
      <td className="px-4 py-3 text-center">
        <div className="flex flex-col items-center gap-1.5">
          <ReplyBadge replied={replied} />
          {row.reply_date && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
              {formatDate(row.reply_date)}
            </span>
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE COMPLAINT CARD ────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const replied = Boolean(row.reply_msg)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/15 flex items-center justify-center text-[13px] font-bold text-indigo-600 dark:text-indigo-400 flex-shrink-0">
          {row.Name.charAt(0)}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{row.complaintno}</span>
            <ReplyBadge replied={replied} />
          </div>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">{row.desc}</p>
        </div>

        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 whitespace-nowrap">
            {formatDate(row.complaint_date)}
          </span>
          <span className={`w-5 h-5 flex items-center justify-center mt-1 text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.08)]">

          {/* Reg + Name */}
          <div className="px-4 py-3 grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                <Hash className="w-3 h-3" /> Reg No
              </p>
              <p className="text-[12px] font-semibold text-blue-700 dark:text-blue-400">{row.registration_no}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
                <User className="w-3 h-3" /> Name
              </p>
              <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200">{row.Name}</p>
            </div>
          </div>

          {/* Description */}
          <div className="px-4 py-3">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1.5 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Complaint Description
            </p>
            <p className="text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">{row.desc}</p>
          </div>

          {/* Reply Section */}
          <div className={`px-4 py-3 ${replied ? 'bg-emerald-50/50 dark:bg-emerald-500/[0.04]' : 'bg-amber-50/50 dark:bg-amber-500/[0.04]'}`}>
            <p className={`text-[10px] font-bold uppercase tracking-wide mb-1.5 flex items-center gap-1 ${replied ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              <Reply className="w-3 h-3" /> Reply
            </p>
            {replied ? (
              <>
                <p className="text-[13px] text-emerald-800 dark:text-emerald-300 leading-relaxed">{row.reply_msg}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-500 mt-1.5 flex items-center gap-1">
                  <Calendar className="w-3 h-3" /> {formatDate(row.reply_date)}
                </p>
              </>
            ) : (
              <p className="text-[12px] text-amber-600 dark:text-amber-400 italic flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Awaiting response from admin
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function Complaint() {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [name,      setName]      = useState(STUDENT_NAME_DEFAULT)
  const [complaint, setComplaint] = useState('')
  const [errors,    setErrors]    = useState({})
  const [submitting,setSubmitting]= useState(false)

  // ── List state ─────────────────────────────────────────────────────────────
  const [complaints, setComplaints] = useState(DUMMY_COMPLAINTS)
  const [search,     setSearch]     = useState('')

  // ── UI state ───────────────────────────────────────────────────────────────
  const [toast, setToast]   = useState(null)
  const formRef             = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!name.trim())      err.name      = 'Name is required'
    if (!complaint.trim()) err.complaint = 'Complaint description is required'
    else if (complaint.trim().length < 10) err.complaint = 'Please provide more detail (min 10 chars)'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    if (!validate()) return
    setSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      const newEntry = {
        id: Date.now(),
        registration_no: STUDENT_REG_NO,
        Name: name.trim(),
        complaintno: genComplaintNo(),
        desc: complaint.trim(),
        complaint_date: todayStr(),
        reply_msg: '',
        reply_date: '',
      }
      complaintCounter++
      setComplaints(prev => [newEntry, ...prev])
      setName(STUDENT_NAME_DEFAULT)
      setComplaint('')
      setErrors({})
      setSubmitting(false)
      showToast('Complaint submitted successfully!')
      // Scroll to list section
      setTimeout(() => {
        document.getElementById('complaint-list')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 300)
    }, 800)
  }, [name, complaint])

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setName(STUDENT_NAME_DEFAULT)
    setComplaint('')
    setErrors({})
  }

  // ── Filtered complaints ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return complaints
    const q = search.toLowerCase()
    return complaints.filter(c =>
      c.Name.toLowerCase().includes(q) ||
      c.complaintno.toLowerCase().includes(q) ||
      c.desc.toLowerCase().includes(q) ||
      c.registration_no.toLowerCase().includes(q)
    )
  }, [complaints, search])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:   complaints.length,
    replied: complaints.filter(c => c.reply_msg).length,
    pending: complaints.filter(c => !c.reply_msg).length,
  }), [complaints])

  return (
    <div className="space-y-5 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Megaphone className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Complaint Portal
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Submit a new complaint or track the status of your previous complaints.
        </p>
      </div>

      {/* ── FORM CARD ───────────────────────────────────────────────────────── */}
      <div
        ref={formRef}
        className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden"
      >
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <MessageSquarePlus className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Submit New Complaint</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full">
            <ShieldAlert className="w-3 h-3" /> Reg: {STUDENT_REG_NO}
          </span>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          {/* Mobile reg no hint */}
          <div className="sm:hidden flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400">Reg No: {STUDENT_REG_NO}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <Field label="Your Name" required error={errors.name}>
              <TextInput
                value={name}
                onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: undefined })) }}
                placeholder="Enter your full name"
                error={errors.name}
                disabled={submitting}
              />
            </Field>

            {/* Placeholder col on desktop */}
            <div className="hidden sm:block" />
          </div>

          {/* Complaint */}
          <Field
            label="Complaint Description"
            required
            error={errors.complaint}
            hint="Describe your issue clearly. Be specific about location, date, and what happened."
          >
            <TextArea
              value={complaint}
              onChange={e => { setComplaint(e.target.value); setErrors(p => ({ ...p, complaint: undefined })) }}
              placeholder="Describe your complaint in detail…"
              error={errors.complaint}
              disabled={submitting}
              rows={4}
            />
            <div className="flex justify-end">
              <span className={`text-[11px] tabular-nums ${complaint.length < 10 && complaint.length > 0 ? 'text-rose-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {complaint.length} chars
              </span>
            </div>
          </Field>
        </div>

        {/* Form Footer */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/40 dark:bg-white/[0.01] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl
              text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 dark:shadow-indigo-500/20
              transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {submitting
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
              : <><Send className="w-4 h-4" /> Submit Complaint</>
            }
          </button>

          <button
            type="button"
            onClick={handleReset}
            disabled={submitting}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
              text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
              transition-colors disabled:opacity-50"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>

          <p className="text-[12px] text-slate-400 dark:text-slate-500 sm:ml-auto text-center sm:text-right">
            Your complaint will be reviewed by the administration.
          </p>
        </div>
      </div>

      {/* ── STATS SUMMARY ───────────────────────────────────────────────────── */}
      {complaints.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <SummaryCard icon={ClipboardList} label="Total Complaints"   value={stats.total}   color="blue"    />
          <SummaryCard icon={CheckCircle2} label="Replied"            value={stats.replied} color="emerald" />
          <SummaryCard icon={Clock}        label="Pending Reply"      value={stats.pending} color="amber"   />
        </div>
      )}

      {/* ── COMPLAINTS LIST ─────────────────────────────────────────────────── */}
      <div
        id="complaint-list"
        className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden"
      >
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
            <MessageSquare className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Complaint History</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search complaints…"
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
        <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-violet-50/20 dark:bg-violet-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-violet-500 flex-shrink-0" />
          <p className="text-[12px] text-violet-700 dark:text-violet-400">
            All complaints linked to your registration number. Replies from administration appear in the Reply column.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState search={search} onClear={() => setSearch('')} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['S.No.', 'Reg. No', 'Name', 'Complaint No', 'Description', 'Date', 'Reply', 'Status'].map((h, i) => (
                    <th
                      key={i}
                      className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.id} row={row} idx={i + 1} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState search={search} onClear={() => setSearch('')} />
          ) : (
            <>
              <p className="text-[11px] text-violet-600 dark:text-violet-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a complaint card to see full details and reply.
              </p>
              {filtered.map((row, i) => (
                <MobileCard key={row.id} row={row} idx={i + 1} />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{complaints.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
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

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Inbox className="w-7 h-7 opacity-50" />
      </div>
      <div className="text-center">
        {search ? (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No results found</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              No complaints match <strong>"{search}"</strong>.
            </p>
            <button onClick={onClear} className="mt-3 text-[12px] text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Clear search
            </button>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No complaints yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Use the form above to submit your first complaint.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
