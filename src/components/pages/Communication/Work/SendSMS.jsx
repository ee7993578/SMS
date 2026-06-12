/**
 * SendSMS.jsx
 * Folder: src/pages/Communication/SendSMS.jsx
 *
 * Converts legacy ASPX "Send SMS" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - SMS Type selector (Individual / Student / Faculty)
 *  - Individual: enter mobile number directly
 *  - Student: filter by Student Type (Old/New) + Class (multi-select) + Student list (multi-select)
 *  - Faculty: filter by Faculty list (multi-select)
 *  - Per-recipient SMS templates (radio select template -> editable message segments)
 *  - Confirmation modal showing SMS count, credits, total before sending
 *  - Mobile: drawer-based filters, collapsible sections, stacked forms
 *  - Desktop: dense ERP-style multi-column form
 */

import { useState, useMemo, useCallback } from 'react'
import {
  MessageSquare, Send, RefreshCw, Loader2,
  AlertCircle, X, Check, ChevronDown, ChevronRight,
  Users, UserCheck, UserPlus, GraduationCap,
  SlidersHorizontal, Info, Search,
  CreditCard, Hash, FileText, CheckSquare, Square,
  School2, BookOpen, Megaphone
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SMS_TYPES = [
  { value: '0', label: '-- Select --' },
  { value: '1', label: 'SMS Individual' },
  { value: '3', label: 'SMS Student' },
  { value: '4', label: 'SMS Faculty' },
]

const STUDENT_TYPES = [
  { value: '0', label: '-- Select All --' },
  { value: '1', label: 'Old Student' },
  { value: '3', label: 'New Student' },
]

// Class list (checkbox list equivalent of chkClass)
const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

// Student dummy data (with admission type + class for filtering)
const STUDENTS = [
  { id: 'STU001', name: 'Aarav Sharma',   class: 'Class VI',  section: 'A', mobile: '9876543210', admissionType: '3' },
  { id: 'STU002', name: 'Diya Verma',     class: 'Class VI',  section: 'A', mobile: '9876543211', admissionType: '1' },
  { id: 'STU003', name: 'Rohan Mehta',    class: 'Class VII', section: 'A', mobile: '9876543212', admissionType: '3' },
  { id: 'STU004', name: 'Ananya Singh',   class: 'Class VII', section: 'A', mobile: '9876543213', admissionType: '1' },
  { id: 'STU005', name: 'Kabir Joshi',    class: 'Class VIII',section: 'A', mobile: '9876543214', admissionType: '3' },
  { id: 'STU006', name: 'Ishita Rao',     class: 'Class VIII',section: 'A', mobile: '9876543215', admissionType: '1' },
  { id: 'STU007', name: 'Vivaan Gupta',   class: 'Class IX',  section: 'A', mobile: '9876543216', admissionType: '3' },
  { id: 'STU008', name: 'Saanvi Nair',    class: 'Class IX',  section: 'B', mobile: '9876543217', admissionType: '1' },
  { id: 'STU009', name: 'Aditya Kumar',   class: 'Class X',   section: 'A', mobile: '9876543218', admissionType: '3' },
  { id: 'STU010', name: 'Myra Patel',     class: 'Class X',   section: 'A', mobile: '9876543219', admissionType: '1' },
  { id: 'STU011', name: 'Arjun Reddy',    class: 'Class XI',  section: 'A', mobile: '9876543220', admissionType: '3' },
  { id: 'STU012', name: 'Kiara Bose',     class: 'Class XII', section: 'A', mobile: '9876543221', admissionType: '1' },
]

// Faculty dummy data
const FACULTY = [
  { id: 'FAC001', name: 'Mrs. Sunita Sharma', designation: 'PGT - Mathematics',  mobile: '9123456701' },
  { id: 'FAC002', name: 'Mr. Rakesh Tiwari',  designation: 'PGT - Physics',      mobile: '9123456702' },
  { id: 'FAC003', name: 'Mrs. Pooja Nair',    designation: 'TGT - English',      mobile: '9123456703' },
  { id: 'FAC004', name: 'Mr. Anil Mathur',    designation: 'TGT - Social Studies', mobile: '9123456704' },
  { id: 'FAC005', name: 'Mrs. Geeta Iyer',    designation: 'PRT - Class III',    mobile: '9123456705' },
  { id: 'FAC006', name: 'Mr. Sandeep Yadav',  designation: 'PGT - Computer Sci', mobile: '9123456706' },
]

// SMS Templates - each template has multiple text segments where dynamic
// fields (TextBox) can be filled in. count == number of editable segments.
const SMS_TEMPLATES = [
  {
    id: 'T1',
    title: 'Fee Reminder',
    segments: [
      'Dear Parent, this is a reminder that the fee for ',
      ' is due on ',
      '. Kindly pay at the earliest. - School Admin',
    ],
    placeholders: ['Month/Term', 'Due Date'],
  },
  {
    id: 'T2',
    title: 'Holiday Notice',
    segments: [
      'Dear Parent, school will remain closed on ',
      ' on account of ',
      '. Regular classes will resume the next working day.',
    ],
    placeholders: ['Date', 'Reason'],
  },
  {
    id: 'T3',
    title: 'PTM Notice',
    segments: [
      'Dear Parent, a Parent-Teacher Meeting is scheduled on ',
      ' at ',
      '. Your presence is requested.',
    ],
    placeholders: ['Date', 'Time'],
  },
]

const SMS_COST_PER_MESSAGE = 0.18 // ₹ per SMS (dummy rate for credit calc)
const AVAILABLE_CREDITS = 5000

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

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
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>
      )}
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

// ─── PAGE HEADER ──────────────────────────────────────────────────────────────
function PageHeader({ countLabel }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 shadow-sm flex items-center justify-between gap-3 flex-wrap">
      <div className="flex items-center gap-2.5">
        <span className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-indigo-600 flex items-center justify-center flex-shrink-0">
          <Megaphone className="w-5 h-5 text-white" />
        </span>
        <div>
          <h1 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
            Send SMS
          </h1>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            Notify individuals, students, or faculty members instantly
          </p>
        </div>
      </div>
      {countLabel && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          <Hash className="w-3.5 h-3.5" /> {countLabel}
        </span>
      )}
    </div>
  )
}

// ─── MULTI-SELECT CHECKBOX GROUP (used for Class / Faculty selectors) ─────────
function CheckboxGroup({ items, selected, onToggle, onToggleAll, allLabel = 'Select All', columns = 2, renderLabel }) {
  const allSelected = items.length > 0 && selected.length === items.length

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggleAll}
        className="flex items-center gap-2 text-[12px] font-bold text-blue-700 dark:text-blue-400 hover:underline"
      >
        {allSelected
          ? <CheckSquare className="w-4 h-4" />
          : <Square className="w-4 h-4" />}
        {allLabel}
      </button>
      <div className={`grid gap-2 grid-cols-1 sm:grid-cols-2 ${columns === 4 ? 'lg:grid-cols-4' : columns === 3 ? 'lg:grid-cols-3' : ''}`}>
        {items.map(item => {
          const id = item.id ?? item
          const checked = selected.includes(id)
          return (
            <label
              key={id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[13px] cursor-pointer transition-colors
                ${checked
                  ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-[rgba(99,102,241,0.15)] dark:bg-[#1a1f35] dark:text-slate-300 dark:hover:bg-white/[0.03]'
                }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(id)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400 dark:border-slate-600"
              />
              <span className="truncate">{renderLabel ? renderLabel(item) : item}</span>
            </label>
          )
        })}
      </div>
    </div>
  )
}

// ─── COLLAPSIBLE SECTION (mobile-friendly accordion) ──────────────────────────
function CollapsibleSection({ title, icon: Icon, badge, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          {Icon && <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 truncate">{title}</span>
          {badge != null && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {badge}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="p-5">{children}</div>}
    </div>
  )
}

// ─── RECIPIENT TEMPLATE PICKER ─────────────────────────────────────────────────
// Renders for one recipient: radio buttons to select an SMS template,
// plus editable text inputs for the dynamic placeholder fields.
function RecipientTemplateCard({ recipient, subtitle, selectedTemplateId, onSelectTemplate, fieldValues, onFieldChange }) {
  const template = SMS_TEMPLATES.find(t => t.id === selectedTemplateId)

  // Build preview text by interleaving segments + field values
  const previewText = useMemo(() => {
    if (!template) return ''
    let out = ''
    template.segments.forEach((seg, i) => {
      out += seg
      if (i < template.segments.length - 1) {
        out += (fieldValues?.[i] && fieldValues[i].trim() !== '') ? fieldValues[i] : `[${template.placeholders[i]}]`
      }
    })
    return out
  }, [template, fieldValues])

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 space-y-3">
      {/* Recipient identity */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{recipient.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{subtitle} · {recipient.mobile}</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 flex-shrink-0">
          {recipient.id}
        </span>
      </div>

      {/* Template radio options */}
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Choose Template</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {SMS_TEMPLATES.map(t => (
            <label
              key={t.id}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[12px] font-medium cursor-pointer transition-colors
                ${selectedTemplateId === t.id
                  ? 'border-blue-300 bg-blue-50 text-blue-700 dark:border-indigo-500/40 dark:bg-indigo-500/10 dark:text-indigo-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-[rgba(99,102,241,0.15)] dark:bg-[#1a1f35] dark:text-slate-300 dark:hover:bg-white/[0.03]'
                }`}
            >
              <input
                type="radio"
                name={`tpl-${recipient.id}`}
                id={`Radio${recipient.id}-${t.id}`}
                checked={selectedTemplateId === t.id}
                onChange={() => onSelectTemplate(t.id)}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-400"
              />
              <span className="truncate">{t.title}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Dynamic placeholder inputs */}
      {template && (
        <div className="space-y-2 pt-1">
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Fill Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {template.placeholders.map((ph, i) => (
              <input
                key={i}
                id={`TextBox${recipient.id}C${i}`}
                type="text"
                value={fieldValues?.[i] ?? ''}
                onChange={e => onFieldChange(i, e.target.value)}
                placeholder={ph}
                className="w-full px-3 py-2 text-[12px] rounded-lg border outline-none transition-all
                  bg-white text-slate-700 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600 dark:focus:border-indigo-400"
              />
            ))}
          </div>

          {/* Hidden spans matching legacy markup pattern (span{id}s{i}) for parity */}
          <div className="hidden">
            <span id={`Labelcount${recipient.id}`}>{template.segments.length}</span>
            {template.segments.map((seg, i) => (
              <span key={i} id={`span${recipient.id}s${i}`}>{seg}</span>
            ))}
          </div>

          {/* Live preview */}
          <div className="rounded-lg bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-3 py-2">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3" /> Preview
            </p>
            <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed">{previewText}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── CONFIRMATION MODAL ─────────────────────────────────────────────────────────
function ConfirmSendModal({ open, onClose, onConfirm, sending, smsCount, credits, totalCost }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-hidden"
          style={{ animation: 'popIn .2s ease' }}
        >
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>

          <div className="px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
              <Send className="w-4.5 h-4.5 text-blue-600 dark:text-indigo-400" />
            </span>
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Confirm SMS Send</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Review before sending</p>
            </div>
          </div>

          <div className="px-5 py-5 space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-4 py-3">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-blue-700 dark:text-blue-400">
                <MessageSquare className="w-4 h-4" /> Messages to Send
              </span>
              <span className="text-[18px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{smsCount}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 px-4 py-3">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-emerald-700 dark:text-emerald-400">
                <CreditCard className="w-4 h-4" /> Available Credits
              </span>
              <span className="text-[18px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{credits.toLocaleString()}</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 px-4 py-3">
              <span className="flex items-center gap-2 text-[13px] font-semibold text-amber-700 dark:text-amber-400">
                <Hash className="w-4 h-4" /> Estimated Cost
              </span>
              <span className="text-[18px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">₹{totalCost.toFixed(2)}</span>
            </div>

            {smsCount === 0 && (
              <p className="flex items-center gap-2 text-[12px] text-rose-500">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> No recipient selected. Please go back and choose at least one template.
              </p>
            )}
          </div>

          <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={sending || smsCount === 0}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-50 transition-all"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SendSMS() {
  // SMS Type ('1' Individual, '3' Student, '4' Faculty)
  const [smsType, setSmsType] = useState('0')

  // Individual
  const [individualNumber, setIndividualNumber] = useState('')

  // Student filters
  const [studentType, setStudentType] = useState('0')
  const [selectedClasses, setSelectedClasses] = useState([])

  // Selected recipient ids (students or faculty depending on smsType)
  const [selectedStudentIds, setSelectedStudentIds] = useState([])
  const [selectedFacultyIds, setSelectedFacultyIds] = useState([])

  // Per-recipient template selection + field values
  // shape: { [recipientId]: { templateId, fields: {0: '', 1: ''} } }
  const [recipientTemplates, setRecipientTemplates] = useState({})

  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Derived: Students filtered by type + class ───────────────────────────
  const filteredStudents = useMemo(() => {
    let list = STUDENTS
    if (studentType !== '0') {
      list = list.filter(s => s.admissionType === studentType)
    }
    if (selectedClasses.length > 0) {
      list = list.filter(s => selectedClasses.includes(s.class))
    }
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.class.toLowerCase().includes(q)
      )
    }
    return list
  }, [studentType, selectedClasses, search])

  // ── Derived: Faculty filtered by search ───────────────────────────────────
  const filteredFaculty = useMemo(() => {
    if (!search) return FACULTY
    const q = search.toLowerCase()
    return FACULTY.filter(f =>
      f.name.toLowerCase().includes(q) ||
      f.designation.toLowerCase().includes(q) ||
      f.id.toLowerCase().includes(q)
    )
  }, [search])

  // ── Toggle handlers ────────────────────────────────────────────────────────
  const toggleClass = useCallback((cls) => {
    setSelectedClasses(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    )
  }, [])

  const toggleAllClasses = useCallback(() => {
    setSelectedClasses(prev => prev.length === CLASSES.length ? [] : [...CLASSES])
  }, [])

  const toggleStudent = useCallback((id) => {
    setSelectedStudentIds(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }, [])

  const toggleAllStudents = useCallback(() => {
    setSelectedStudentIds(prev =>
      prev.length === filteredStudents.length ? [] : filteredStudents.map(s => s.id)
    )
  }, [filteredStudents])

  const toggleFaculty = useCallback((id) => {
    setSelectedFacultyIds(prev =>
      prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]
    )
  }, [])

  const toggleAllFaculty = useCallback(() => {
    setSelectedFacultyIds(prev =>
      prev.length === filteredFaculty.length ? [] : filteredFaculty.map(f => f.id)
    )
  }, [filteredFaculty])

  // ── Recipient template handlers ───────────────────────────────────────────
  const setRecipientTemplate = useCallback((recipientId, templateId) => {
    setRecipientTemplates(prev => ({
      ...prev,
      [recipientId]: { templateId, fields: prev[recipientId]?.fields ?? {} }
    }))
  }, [])

  const setRecipientField = useCallback((recipientId, fieldIndex, value) => {
    setRecipientTemplates(prev => ({
      ...prev,
      [recipientId]: {
        templateId: prev[recipientId]?.templateId ?? null,
        fields: { ...(prev[recipientId]?.fields ?? {}), [fieldIndex]: value }
      }
    }))
  }, [])

  // ── Reset all ──────────────────────────────────────────────────────────────
  const handleReset = () => {
    setSmsType('0')
    setIndividualNumber('')
    setStudentType('0')
    setSelectedClasses([])
    setSelectedStudentIds([])
    setSelectedFacultyIds([])
    setRecipientTemplates({})
    setErrors({})
    setSearch('')
  }

  // When SMS type changes, reset dependent selections (mirrors ddlType_SelectedIndexChanged1)
  const handleTypeChange = (val) => {
    setSmsType(val)
    setIndividualNumber('')
    setStudentType('0')
    setSelectedClasses([])
    setSelectedStudentIds([])
    setSelectedFacultyIds([])
    setRecipientTemplates({})
    setErrors({})
    setSearch('')
  }

  // ── Validation + open confirm modal (mirrors execute() + button4_Click) ───
  const handleSendClick = () => {
    const err = {}
    if (smsType === '0') err.type = 'Please select an SMS type'
    if (smsType === '1' && !individualNumber.trim()) err.individual = 'Please enter a mobile number'
    if (smsType === '3' && selectedStudentIds.length === 0) err.students = 'Please select at least one student'
    if (smsType === '4' && selectedFacultyIds.length === 0) err.faculty = 'Please select at least one faculty member'

    if (Object.keys(err).length) {
      setErrors(err)
      showToast('Please fix the highlighted fields.', 'error')
      return
    }
    setErrors({})
    setConfirmOpen(true)
  }

  // ── Recipients with a chosen template (used for count + send) ─────────────
  const activeRecipients = useMemo(() => {
    let ids = []
    let source = []
    if (smsType === '3') { ids = selectedStudentIds; source = STUDENTS }
    if (smsType === '4') { ids = selectedFacultyIds; source = FACULTY }

    if (smsType === '1') {
      // Individual always counts as 1 if a template chosen, else still counts the message
      return individualNumber.trim() ? [{ id: 'IND', name: 'Individual', mobile: individualNumber }] : []
    }

    return ids
      .map(id => source.find(s => s.id === id))
      .filter(Boolean)
      .filter(r => recipientTemplates[r.id]?.templateId)
  }, [smsType, selectedStudentIds, selectedFacultyIds, individualNumber, recipientTemplates])

  const smsCount = smsType === '1' ? (individualNumber.trim() ? 1 : 0) : activeRecipients.length
  const totalCost = smsCount * SMS_COST_PER_MESSAGE

  // ── Final send (mirrors Button2button_Click) ───────────────────────────────
  const handleConfirmSend = () => {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setConfirmOpen(false)
      showToast(`SMS sent successfully to ${smsCount} recipient${smsCount !== 1 ? 's' : ''}!`)
    }, 1200)
  }

  // ── Recipient count badge for header ────────────────────────────────────────
  const countLabel = useMemo(() => {
    if (smsType === '1') return individualNumber.trim() ? '1 recipient' : null
    if (smsType === '3') return `${selectedStudentIds.length} student${selectedStudentIds.length !== 1 ? 's' : ''} selected`
    if (smsType === '4') return `${selectedFacultyIds.length} faculty selected`
    return null
  }, [smsType, individualNumber, selectedStudentIds, selectedFacultyIds])

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <PageHeader countLabel={countLabel} />

      {/* ── SMS Type Selector Card ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Recipient Type</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="SMS Type" error={errors.type} required>
              <NativeSelect
                value={smsType}
                onChange={e => handleTypeChange(e.target.value)}
                error={errors.type}
              >
                {SMS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Individual number input */}
            {smsType === '1' && (
              <Field label="Enter No." error={errors.individual} required>
                <input
                  type="tel"
                  value={individualNumber}
                  onChange={e => setIndividualNumber(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className={`w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
                    ${errors.individual ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                />
              </Field>
            )}

            {/* Student type filter */}
            {smsType === '3' && (
              <Field label="Student Type">
                <NativeSelect
                  value={studentType}
                  onChange={e => setStudentType(e.target.value)}
                >
                  {STUDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </NativeSelect>
              </Field>
            )}

            {/* Reset button */}
            <div className="flex gap-2 sm:col-start-auto lg:col-start-4">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── STUDENT TYPE: Class selector ─────────────────────────────────────── */}
      {smsType === '3' && (
        <CollapsibleSection
          title="Select Class"
          icon={School2}
          badge={selectedClasses.length > 0 ? `${selectedClasses.length} selected` : 'All classes'}
        >
          <CheckboxGroup
            items={CLASSES}
            selected={selectedClasses}
            onToggle={toggleClass}
            onToggleAll={toggleAllClasses}
            allLabel="Select All Classes"
            columns={4}
          />
        </CollapsibleSection>
      )}

      {/* ── STUDENT TYPE: Student selector ───────────────────────────────────── */}
      {smsType === '3' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Select Student</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                {filteredStudents.length} found
              </span>
              {errors.students && (
                <span className="flex items-center gap-1 text-[11px] text-rose-500">
                  <AlertCircle className="w-3 h-3" /> {errors.students}
                </span>
              )}
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-52 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, ID, class…"
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

          <div className="p-5 space-y-3">
            {filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <Search className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No students match your filters.</span>
              </div>
            ) : (
              <>
                <CheckboxGroup
                  items={filteredStudents}
                  selected={selectedStudentIds}
                  onToggle={toggleStudent}
                  onToggleAll={toggleAllStudents}
                  allLabel="Select All Students"
                  columns={2}
                  renderLabel={(s) => `${s.name} — ${s.class} (${s.section}) · ${s.mobile}`}
                />

                {/* Per-recipient template selectors */}
                {selectedStudentIds.length > 0 && (
                  <div className="pt-3 space-y-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                    <p className="text-[12px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-blue-500" /> Choose SMS template per student
                    </p>
                    {selectedStudentIds.map(id => {
                      const student = STUDENTS.find(s => s.id === id)
                      if (!student) return null
                      return (
                        <RecipientTemplateCard
                          key={id}
                          recipient={student}
                          subtitle={`${student.class} (${student.section})`}
                          selectedTemplateId={recipientTemplates[id]?.templateId ?? null}
                          onSelectTemplate={(tid) => setRecipientTemplate(id, tid)}
                          fieldValues={recipientTemplates[id]?.fields ?? {}}
                          onFieldChange={(i, val) => setRecipientField(id, i, val)}
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── FACULTY TYPE: Faculty selector ───────────────────────────────────── */}
      {smsType === '4' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Select Faculty</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                {filteredFaculty.length} found
              </span>
              {errors.faculty && (
                <span className="flex items-center gap-1 text-[11px] text-rose-500">
                  <AlertCircle className="w-3 h-3" /> {errors.faculty}
                </span>
              )}
            </div>
            {/* Search */}
            <div className="relative w-full sm:w-52 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search name, designation…"
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

          <div className="p-5 space-y-3">
            {filteredFaculty.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <Search className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No faculty match your search.</span>
              </div>
            ) : (
              <>
                <CheckboxGroup
                  items={filteredFaculty}
                  selected={selectedFacultyIds}
                  onToggle={toggleFaculty}
                  onToggleAll={toggleAllFaculty}
                  allLabel="Select All Faculty"
                  columns={3}
                  renderLabel={(f) => `${f.name} — ${f.designation}`}
                />

                {/* Per-recipient template selectors */}
                {selectedFacultyIds.length > 0 && (
                  <div className="pt-3 space-y-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                    <p className="text-[12px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> Choose SMS template per faculty member
                    </p>
                    {selectedFacultyIds.map(id => {
                      const faculty = FACULTY.find(f => f.id === id)
                      if (!faculty) return null
                      return (
                        <RecipientTemplateCard
                          key={id}
                          recipient={faculty}
                          subtitle={faculty.designation}
                          selectedTemplateId={recipientTemplates[id]?.templateId ?? null}
                          onSelectTemplate={(tid) => setRecipientTemplate(id, tid)}
                          fieldValues={recipientTemplates[id]?.fields ?? {}}
                          onFieldChange={(i, val) => setRecipientField(id, i, val)}
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── INDIVIDUAL TYPE: Template picker for the single number ──────────── */}
      {smsType === '1' && individualNumber.trim() && (
        <CollapsibleSection title="Choose SMS Template" icon={MessageSquare}>
          <RecipientTemplateCard
            recipient={{ id: 'IND', name: 'Individual Recipient', mobile: individualNumber }}
            subtitle="Direct Number"
            selectedTemplateId={recipientTemplates['IND']?.templateId ?? null}
            onSelectTemplate={(tid) => setRecipientTemplate('IND', tid)}
            fieldValues={recipientTemplates['IND']?.fields ?? {}}
            onFieldChange={(i, val) => setRecipientField('IND', i, val)}
          />
        </CollapsibleSection>
      )}

      {/* ── Info hint ─────────────────────────────────────────────────────── */}
      {smsType !== '0' && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50/60 dark:bg-blue-500/[0.05] border border-blue-100 dark:border-blue-500/15">
          <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Select a template for each recipient and fill in the required details. The preview shows exactly what will be sent.
          </p>
        </div>
      )}

      {/* ── Sticky-ish Send Bar ───────────────────────────────────────────── */}
      {smsType !== '0' && (
        <div className="sticky bottom-3 z-30 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white/95 dark:bg-[#1a1f35]/95 backdrop-blur shadow-lg px-5 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </span>
            <div>
              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{smsCount} message{smsCount !== 1 ? 's' : ''} ready</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500">Est. cost ₹{totalCost.toFixed(2)} · Credits left {AVAILABLE_CREDITS.toLocaleString()}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSendClick}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-md shadow-blue-500/20
              transition-all active:scale-95"
          >
            <Send className="w-4 h-4" /> Send SMS
          </button>
        </div>
      )}

      {/* ── Empty state when no type selected ───────────────────────────────── */}
      {smsType === '0' && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Megaphone className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No recipient type selected</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Choose <strong>SMS Type</strong> above to begin sending messages.
            </p>
          </div>
        </div>
      )}

      {/* Confirm Send Modal */}
      <ConfirmSendModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmSend}
        sending={sending}
        smsCount={smsCount}
        credits={AVAILABLE_CREDITS}
        totalCost={totalCost}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
