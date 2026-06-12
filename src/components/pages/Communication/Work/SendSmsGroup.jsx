/**
 * SendSmsGroup.jsx
 * Folder: src/pages/Communication/SendSmsGroup.jsx
 *
 * Converts legacy ASPX "Send SMS (Group)" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - SMS Group dropdown
 *  - Member picker (popup checklist on desktop, drawer on mobile)
 *  - Select All members toggle
 *  - SMS template cards with editable blanks (per-template inputs)
 *  - Live character / SMS-part counter
 *  - Confirmation modal before sending
 *  - Mobile: drawer-based member picker + stacked template cards
 *  - Desktop: dense ERP-style two-column layout
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Send, Users, UserCheck,
  AlertCircle, X, Check, Loader2, ChevronDown,
  MessageSquare, Search, Info, ChevronRight,
  Smartphone, ListChecks, FileText, MailCheck
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SMS_GROUPS = [
  { id: 'G1', name: 'All Class X Parents' },
  { id: 'G2', name: 'All Class XII Parents' },
  { id: 'G3', name: 'Staff Members' },
  { id: 'G4', name: 'Fee Due Parents' },
  { id: 'G5', name: 'Bus Route - Civil Lines' },
]

// Members per group (id, name, phone)
const GROUP_MEMBERS = {
  G1: [
    { id: 'M101', name: 'Rohit Sharma', phone: '98765 43210' },
    { id: 'M102', name: 'Priya Verma', phone: '98765 43211' },
    { id: 'M103', name: 'Anil Kumar', phone: '98765 43212' },
    { id: 'M104', name: 'Sunita Devi', phone: '98765 43213' },
    { id: 'M105', name: 'Vikas Gupta', phone: '98765 43214' },
    { id: 'M106', name: 'Meena Joshi', phone: '98765 43215' },
  ],
  G2: [
    { id: 'M201', name: 'Rajesh Singh', phone: '98765 43220' },
    { id: 'M202', name: 'Kavita Rana', phone: '98765 43221' },
    { id: 'M203', name: 'Deepak Negi', phone: '98765 43222' },
    { id: 'M204', name: 'Anjali Mehta', phone: '98765 43223' },
  ],
  G3: [
    { id: 'M301', name: 'Mr. S.K. Bhatt (Principal)', phone: '98765 43230' },
    { id: 'M302', name: 'Mrs. R. Pant (Vice Principal)', phone: '98765 43231' },
    { id: 'M303', name: 'Mr. A. Thapa (Accountant)', phone: '98765 43232' },
    { id: 'M304', name: 'Ms. D. Bisht (Librarian)', phone: '98765 43233' },
    { id: 'M305', name: 'Mr. P. Rawat (Sports)', phone: '98765 43234' },
  ],
  G4: [
    { id: 'M401', name: 'Suresh Chand', phone: '98765 43240' },
    { id: 'M402', name: 'Geeta Rani', phone: '98765 43241' },
    { id: 'M403', name: 'Manoj Tiwari', phone: '98765 43242' },
  ],
  G5: [
    { id: 'M501', name: 'Naresh Bisht', phone: '98765 43250' },
    { id: 'M502', name: 'Pooja Rawat', phone: '98765 43251' },
    { id: 'M503', name: 'Tarun Joshi', phone: '98765 43252' },
    { id: 'M504', name: 'Seema Negi', phone: '98765 43253' },
    { id: 'M505', name: 'Harish Bhatt', phone: '98765 43254' },
  ],
}

// SMS templates — text contains {{blank}} placeholders that become editable inputs
const SMS_TEMPLATES = [
  {
    id: 'T1',
    title: 'Fee Reminder',
    text: 'Dear Parent, fee of Rs. {{amount}} for {{month}} is pending. Kindly pay before {{date}} to avoid late fine. - School Admin',
    blanks: { amount: '5000', month: 'June', date: '15-06-2026' },
  },
  {
    id: 'T2',
    title: 'Holiday Notice',
    text: 'School will remain closed on {{date}} on account of {{reason}}. Classes will resume on {{resumeDate}}. - School Admin',
    blanks: { date: '17-06-2026', reason: 'local festival', resumeDate: '18-06-2026' },
  },
  {
    id: 'T3',
    title: 'PTM Reminder',
    text: 'Parent-Teacher Meeting is scheduled on {{date}} at {{time}}. Your presence is requested. - School Admin',
    blanks: { date: '20-06-2026', time: '10:00 AM' },
  },
  {
    id: 'T4',
    title: 'Custom Message',
    text: '',
    blanks: {},
  },
]

const SMS_PART_LENGTH = 160

// ─── HELPERS ──────────────────────────────────────────────────────────────────
// Build final SMS text by replacing {{key}} with the current blank value
const buildMessage = (template, blankValues) => {
  if (!template) return ''
  if (template.id === 'T4') return blankValues.custom || ''
  return template.text.replace(/{{(.*?)}}/g, (_, key) => {
    const val = blankValues[key]
    return val !== undefined && val !== '' ? val : `___`
  })
}

// Split template text into static segments + blank keys, preserving order
const parseTemplate = (text) => {
  const parts = []
  let lastIndex = 0
  const regex = /{{(.*?)}}/g
  let match
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) parts.push({ type: 'text', value: text.slice(lastIndex, match.index) })
    parts.push({ type: 'blank', key: match[1] })
    lastIndex = match.index + match[0].length
  }
  if (lastIndex < text.length) parts.push({ type: 'text', value: text.slice(lastIndex) })
  return parts
}

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

// ─── MEMBER ROW (shared between desktop popup & mobile drawer) ────────────────
function MemberRow({ member, checked, onToggle }) {
  return (
    <label
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all
        ${checked
          ? 'border-blue-300 bg-blue-50 dark:border-indigo-500/40 dark:bg-indigo-500/10'
          : 'border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-white dark:bg-[#1a1f35] hover:bg-slate-50 dark:hover:bg-white/[0.02]'
        }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(member.id)}
        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.4)] flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{member.name}</p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">{member.phone}</p>
      </div>
      {checked && <Check className="w-4 h-4 text-blue-600 dark:text-indigo-400 flex-shrink-0" />}
    </label>
  )
}

// ─── MEMBER PICKER PANEL (used inside both desktop popover & mobile drawer) ───
function MemberPickerPanel({ members, selectedIds, onToggle, search, setSearch, onSelectAll, allSelected }) {
  const filtered = useMemo(() => {
    if (!search) return members
    const q = search.toLowerCase()
    return members.filter(m => m.name.toLowerCase().includes(q) || m.phone.includes(q))
  }, [members, search])

  return (
    <div className="flex flex-col">
      {/* Search + Select All */}
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search member or phone…"
            className="w-full pl-8 pr-3 py-2 text-[12px] rounded-lg border outline-none transition-all
              bg-white text-slate-700 border-slate-200 placeholder-slate-300
              focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
              dark:placeholder-slate-600 dark:focus:border-indigo-400"
          />
        </div>
        <button
          type="button"
          onClick={onSelectAll}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-colors flex-shrink-0
            ${allSelected
              ? 'bg-blue-600 text-white dark:bg-indigo-600'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300'}`}
        >
          <ListChecks className="w-3.5 h-3.5" />
          {allSelected ? 'Unselect All' : 'Select All'}
        </button>
      </div>

      {/* Member list */}
      <div className="px-3 pb-3 max-h-72 overflow-y-auto space-y-1.5">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-2 text-slate-400 dark:text-slate-600">
            <Search className="w-5 h-5 opacity-40" />
            <span className="text-[12px]">No members found.</span>
          </div>
        ) : (
          filtered.map(m => (
            <MemberRow key={m.id} member={m} checked={selectedIds.includes(m.id)} onToggle={onToggle} />
          ))
        )}
      </div>
    </div>
  )
}

// ─── DESKTOP MEMBER POPOVER (PopupControlExtender equivalent) ─────────────────
function DesktopMemberPicker({ open, setOpen, ...panelProps }) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left text-[13px]
          bg-white text-slate-700 border-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] transition-all"
      >
        <span className="truncate">
          {panelProps.selectedIds.length > 0
            ? `${panelProps.selectedIds.length} member${panelProps.selectedIds.length !== 1 ? 's' : ''} selected`
            : 'Click to select members'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div
            className="absolute left-0 right-0 mt-2 z-40 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
              bg-white dark:bg-[#1a1f35] shadow-2xl overflow-hidden"
            style={{ animation: 'popDown .18s ease' }}
          >
            <style>{`@keyframes popDown{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
            <MemberPickerPanel {...panelProps} />
          </div>
        </>
      )}
    </div>
  )
}

// ─── MOBILE MEMBER DRAWER ──────────────────────────────────────────────────────
function MemberDrawer({ open, onClose, ...panelProps }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[85vh] flex flex-col"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Members</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <MemberPickerPanel {...panelProps} />
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all"
          >
            <Check className="w-4 h-4" />
            Done — {panelProps.selectedIds.length} selected
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SMS PREVIEW BOX ────────────────────────────────────────────────────────────
function SmsPreview({ text }) {
  const len = text.length
  const parts = len === 0 ? 0 : Math.ceil(len / SMS_PART_LENGTH)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-slate-50 dark:bg-white/[0.02] p-3">
      <div className="flex items-center gap-2 mb-2">
        <Smartphone className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
        <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Preview</span>
      </div>
      <p className="text-[13px] text-slate-700 dark:text-slate-200 whitespace-pre-wrap leading-relaxed min-h-[40px]">
        {text || <span className="text-slate-400 dark:text-slate-600 italic">Message preview will appear here…</span>}
      </p>
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200 dark:border-[rgba(99,102,241,0.1)]">
        <span className="text-[11px] text-slate-400 dark:text-slate-500 tabular-nums">{len} characters</span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
          {parts} SMS part{parts !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  )
}

// ─── TEMPLATE CARD ──────────────────────────────────────────────────────────────
function TemplateCard({ template, selected, onSelect, blankValues, onBlankChange, customValue, onCustomChange }) {
  const isCustom = template.id === 'T4'
  const parts = parseTemplate(template.text)
  const message = isCustom ? customValue : buildMessage(template, blankValues)

  return (
    <div
      className={`rounded-2xl border-2 transition-all overflow-hidden
        ${selected
          ? 'border-blue-400 dark:border-indigo-500 shadow-md shadow-blue-500/10'
          : 'border-slate-150 dark:border-[rgba(99,102,241,0.12)]'
        } bg-white dark:bg-[#1a1f35]`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
            ${selected ? 'border-blue-600 bg-blue-600 dark:border-indigo-500 dark:bg-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}
        >
          {selected && <Check className="w-3 h-3 text-white" />}
        </span>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <FileText className="w-4 h-4 text-blue-500 dark:text-indigo-400 flex-shrink-0" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 truncate">{template.title}</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${selected ? 'rotate-90' : ''}`} />
      </button>

      {/* Body — only when selected */}
      {selected && (
        <div className="px-4 pb-4 pt-1 space-y-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.08)]">
          {isCustom ? (
            <Field label="Message Text" required>
              <textarea
                value={customValue}
                onChange={e => onCustomChange(e.target.value)}
                rows={4}
                placeholder="Type your custom SMS message here…"
                className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
                  bg-white text-slate-800 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                  dark:placeholder-slate-600 dark:focus:border-indigo-400"
              />
            </Field>
          ) : (
            <>
              {/* Editable blanks */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {Object.keys(template.blanks).map(key => (
                  <Field key={key} label={key.replace(/([A-Z])/g, ' $1')}>
                    <input
                      value={blankValues[key] ?? ''}
                      onChange={e => onBlankChange(key, e.target.value)}
                      className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                        bg-white text-slate-800 border-slate-200
                        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                        dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                        dark:focus:border-indigo-400"
                    />
                  </Field>
                ))}
              </div>

              {/* Template body with highlighted blanks (visual reference) */}
              <div className="rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-[rgba(99,102,241,0.08)] p-3 text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                {parts.map((p, i) =>
                  p.type === 'text'
                    ? <span key={i}>{p.value}</span>
                    : (
                      <span key={i} className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded bg-amber-100 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 font-semibold text-[11px]">
                        {blankValues[p.key] || `{${p.key}}`}
                      </span>
                    )
                )}
              </div>
            </>
          )}

          <SmsPreview text={message} />
        </div>
      )}
    </div>
  )
}

// ─── CONFIRMATION MODAL (ModalPopupExtender equivalent) ────────────────────────
function ConfirmSendModal({ open, onClose, onConfirm, sending, totalRecipients, smsPartsCount }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={!sending ? onClose : undefined} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6 text-center"
          style={{ animation: 'popIn .2s ease' }}
        >
          <style>{`@keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-indigo-500/10 flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-7 h-7 text-blue-600 dark:text-indigo-400" />
          </div>
          <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100 mb-1">Confirm Send</h3>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mb-4">
            This message will be sent to{' '}
            <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">{totalRecipients}</span> recipient{totalRecipients !== 1 ? 's' : ''},
            using <span className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">{smsPartsCount}</span> SMS part{smsPartsCount !== 1 ? 's' : ''} each.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={sending}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={sending}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all"
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function SendSmsGroup() {
  const [groupId, setGroupId] = useState('')
  const [selectedIds, setSelectedIds] = useState([])
  const [memberSearch, setMemberSearch] = useState('')
  const [desktopPickerOpen, setDesktopPickerOpen] = useState(false)
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const [templateId, setTemplateId] = useState('')
  const [blankValuesByTemplate, setBlankValuesByTemplate] = useState(
    SMS_TEMPLATES.reduce((acc, t) => ({ ...acc, [t.id]: { ...t.blanks } }), {})
  )
  const [customMessage, setCustomMessage] = useState('')

  const [errors, setErrors] = useState({})
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Group change ──────────────────────────────────────────────────────────
  const handleGroupChange = (e) => {
    const val = e.target.value
    setGroupId(val)
    setSelectedIds([])
    setMemberSearch('')
    setErrors(p => ({ ...p, group: undefined }))
  }

  const members = useMemo(() => GROUP_MEMBERS[groupId] || [], [groupId])
  const allSelected = members.length > 0 && selectedIds.length === members.length

  const handleToggleMember = useCallback((id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setErrors(p => ({ ...p, members: undefined }))
  }, [])

  const handleSelectAll = useCallback(() => {
    setSelectedIds(prev => prev.length === members.length ? [] : members.map(m => m.id))
    setErrors(p => ({ ...p, members: undefined }))
  }, [members])

  // ── Template selection ────────────────────────────────────────────────────
  const handleSelectTemplate = (id) => {
    setTemplateId(prev => prev === id ? '' : id)
    setErrors(p => ({ ...p, template: undefined, message: undefined }))
  }

  const handleBlankChange = (templateId, key, value) => {
    setBlankValuesByTemplate(prev => ({
      ...prev,
      [templateId]: { ...prev[templateId], [key]: value }
    }))
  }

  const activeTemplate = SMS_TEMPLATES.find(t => t.id === templateId)
  const finalMessage = useMemo(() => {
    if (!activeTemplate) return ''
    if (activeTemplate.id === 'T4') return customMessage
    return buildMessage(activeTemplate, blankValuesByTemplate[activeTemplate.id] || {})
  }, [activeTemplate, blankValuesByTemplate, customMessage])

  const smsPartsCount = finalMessage.length === 0 ? 0 : Math.ceil(finalMessage.length / SMS_PART_LENGTH)

  // ── Reset ─────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setGroupId(''); setSelectedIds([]); setMemberSearch('')
    setTemplateId(''); setCustomMessage('')
    setBlankValuesByTemplate(SMS_TEMPLATES.reduce((acc, t) => ({ ...acc, [t.id]: { ...t.blanks } }), {}))
    setErrors({})
  }

  // ── Validate & open confirm (Button3 -> ModalPopupExtender) ────────────────
  const handleOpenConfirm = useCallback(() => {
    const err = {}
    if (!groupId) err.group = 'Please select an SMS group'
    if (selectedIds.length === 0) err.members = 'Please select at least one member'
    if (!templateId) err.template = 'Please select a message template'
    if (finalMessage.trim().length === 0) err.message = 'Message text cannot be empty'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setConfirmOpen(true)
  }, [groupId, selectedIds, templateId, finalMessage])

  // ── Confirm send (Button1_Click -> execute()) ───────────────────────────────
  const handleConfirmSend = () => {
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setConfirmOpen(false)
      showToast(`SMS sent successfully to ${selectedIds.length} recipient${selectedIds.length !== 1 ? 's' : ''}.`)
    }, 1200)
  }

  const groupName = SMS_GROUPS.find(g => g.id === groupId)?.name || ''

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Send SMS
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Select a group, choose recipients and send a templated SMS message.
        </p>
      </div>

      {/* ── Selection Card ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Recipients</span>
          {selectedIds.length > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0">
              {selectedIds.length} selected
            </span>
          )}
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* SMS Group */}
            <Field label="SMS Group" error={errors.group} required>
              <NativeSelect
                value={groupId}
                onChange={handleGroupChange}
                placeholder="-- Select Group --"
                error={errors.group}
              >
                {SMS_GROUPS.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Select Member */}
            <Field label="Select Member" error={errors.members} required>
              {!groupId ? (
                <div className="px-3 py-2 text-[13px] rounded-lg border border-dashed border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-white/[0.02]">
                  Select a group first
                </div>
              ) : (
                <>
                  {/* Desktop popover */}
                  <div className="hidden sm:block">
                    <DesktopMemberPicker
                      open={desktopPickerOpen}
                      setOpen={setDesktopPickerOpen}
                      members={members}
                      selectedIds={selectedIds}
                      onToggle={handleToggleMember}
                      search={memberSearch}
                      setSearch={setMemberSearch}
                      onSelectAll={handleSelectAll}
                      allSelected={allSelected}
                    />
                  </div>
                  {/* Mobile trigger */}
                  <button
                    type="button"
                    onClick={() => setMobileDrawerOpen(true)}
                    className="sm:hidden w-full flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-left text-[13px]
                      bg-white text-slate-700 border-slate-200
                      dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] transition-all"
                  >
                    <span className="truncate">
                      {selectedIds.length > 0
                        ? `${selectedIds.length} member${selectedIds.length !== 1 ? 's' : ''} selected`
                        : 'Tap to select members'}
                    </span>
                    <Users className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                  </button>
                </>
              )}
            </Field>
          </div>

          {/* Selected member chips */}
          {selectedIds.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide mb-1.5">
                Selected ({selectedIds.length})
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto">
                {selectedIds.map(id => {
                  const m = members.find(x => x.id === id)
                  if (!m) return null
                  return (
                    <span key={id} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-indigo-500/10 dark:text-indigo-300 border border-blue-100 dark:border-indigo-500/20">
                      {m.name}
                      <button onClick={() => handleToggleMember(id)} className="p-0.5 rounded-full hover:bg-blue-100 dark:hover:bg-indigo-500/20">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <MemberDrawer
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        members={members}
        selectedIds={selectedIds}
        onToggle={handleToggleMember}
        search={memberSearch}
        setSearch={setMemberSearch}
        onSelectAll={handleSelectAll}
        allSelected={allSelected}
      />

      {/* ── Templates Card ───────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Message Template</span>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Choose a template, fill in the highlighted fields, then review the preview before sending.
          </p>
        </div>

        {errors.template && (
          <p className="flex items-center gap-1 text-[11px] text-rose-500 px-5 pt-3">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.template}
          </p>
        )}
        {errors.message && (
          <p className="flex items-center gap-1 text-[11px] text-rose-500 px-5 pt-3">
            <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.message}
          </p>
        )}

        <div className="p-5 space-y-3">
          {SMS_TEMPLATES.map(t => (
            <TemplateCard
              key={t.id}
              template={t}
              selected={templateId === t.id}
              onSelect={() => handleSelectTemplate(t.id)}
              blankValues={blankValuesByTemplate[t.id] || {}}
              onBlankChange={(key, val) => handleBlankChange(t.id, key, val)}
              customValue={customMessage}
              onCustomChange={setCustomMessage}
            />
          ))}
        </div>
      </div>

      {/* ── Sticky Action Bar ────────────────────────────────────────────── */}
      <div className="sticky bottom-0 left-0 right-0 -mx-1 px-1 pt-2 pb-1 sm:static sm:pt-0">
        <div className="flex gap-2 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white/95 dark:bg-[#1a1f35]/95 backdrop-blur shadow-lg sm:shadow-sm p-3">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button
            type="button"
            onClick={handleOpenConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-95"
          >
            <Send className="w-4 h-4" />
            Send SMS{selectedIds.length > 0 ? ` (${selectedIds.length})` : ''}
          </button>
        </div>
      </div>

      {/* ── Confirm Modal ─────────────────────────────────────────────────── */}
      <ConfirmSendModal
        open={confirmOpen}
        onClose={() => !sending && setConfirmOpen(false)}
        onConfirm={handleConfirmSend}
        sending={sending}
        totalRecipients={selectedIds.length}
        smsPartsCount={Math.max(smsPartsCount, 1)}
      />

      {/* Hidden context info (kept for parity with legacy hidden fields) */}
      <div className="hidden">
        <span data-group={groupName} />
        <span data-message={finalMessage} />
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
