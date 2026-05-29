/**
 * EntranceExamAdmitCard.jsx
 * Folder: src/pages/Reports/Registration/EntranceExamAdmitCard.jsx
 *
 * Converts legacy ASPX "Entrance Exam Admit Card" to fully-responsive React + Tailwind.
 *
 * Filters  : Session, Class, Student Type (All / External / Internal)
 * Features :
 *  - Filter + Download flow (same as ASPX)
 *  - Admit card preview panel (replaces ReportViewer RDLC)
 *  - Individual card print / bulk download-all
 *  - Student list table on desktop, card-grid on mobile
 *  - Select individual students for targeted download
 *  - Print-ready CSS injected via <style> so browser Print gives clean A5 cards
 *  - Toast, loading skeleton, empty state
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check,
  Loader2, ChevronDown, ChevronRight, Users,
  SlidersHorizontal, Info, Search, Download,
  BookOpen, Building2, MapPin, GraduationCap,
  Printer, FileDown, UserCircle, Calendar,
  Hash, ClipboardCheck, CheckSquare, Square,
  BadgeCheck, Clock, School, ChevronLeft,
  ChevronUp, ExternalLink
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const STUDENT_TYPES = [
  { value: '', label: 'Select All' },
  { value: 'External', label: 'External' },
  { value: 'Internal', label: 'Internal' },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  shortName: 'SVM Sr. Sec. School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  phone: '0135-2711234',
  email: 'info@svmdehradun.edu.in',
  affiliation: 'CBSE Affiliation No. 2500123',
}

const FIRST_NAMES = ['Aarav','Ananya','Arjun','Diya','Ishaan','Kavya','Rohan','Priya','Vivaan','Sneha','Karan','Pooja','Riya','Aditya','Neha','Sahil','Shreya','Mohit','Tanvi','Amit']
const LAST_NAMES  = ['Sharma','Verma','Singh','Gupta','Joshi','Patel','Yadav','Kumar','Mishra','Tiwari','Chauhan','Rana','Negi','Rawat']

// Seeded pseudo-random
const sr = (seed) => {
  let s = seed
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }
}

const EXAM_CENTERS = [
  'Room No. 101, Main Block',
  'Room No. 205, Science Block',
  'Room No. 301, Commerce Block',
  'Hall A, Ground Floor',
  'Hall B, First Floor',
]

const EXAM_TIMES = ['9:00 AM – 11:00 AM', '11:30 AM – 1:30 PM', '2:00 PM – 4:00 PM']

const generateStudents = (session, cls, type) => {
  const rand = sr(session.charCodeAt(0) * 17 + cls.charCodeAt(0) * 7)
  const count = 10 + Math.floor(rand() * 15)
  const yearStart = parseInt(session.split('-')[0])
  const pad = (n) => String(n).padStart(2, '0')

  return Array.from({ length: count }, (_, i) => {
    const fn = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)]
    const ln = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]
    const sType = type || (rand() > 0.5 ? 'External' : 'Internal')
    const birthYear = yearStart - 4 - Math.floor(rand() * 12)
    const examDay = 15 + Math.floor(rand() * 10)
    const examMonth = 3 + Math.floor(rand() * 2) // March or April

    return {
      id: i + 1,
      admit_no:   `ADM${yearStart}${cls.replace(/\s/g,'').slice(0,3).toUpperCase()}${String(100 + i).slice(1)}`,
      roll_no:    String(1001 + i),
      name:       `${fn} ${ln}`,
      father:     `${LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)]} ${ln}`,
      dob:        `${pad(Math.floor(rand() * 27) + 1)}-${pad(Math.floor(rand() * 11) + 1)}-${birthYear}`,
      class_name: cls,
      session,
      student_type: sType,
      exam_center:  EXAM_CENTERS[Math.floor(rand() * EXAM_CENTERS.length)],
      exam_date:    `${pad(examDay)}-${pad(examMonth)}-${yearStart}`,
      exam_time:    EXAM_TIMES[Math.floor(rand() * EXAM_TIMES.length)],
      subject:     cls.includes('XI') || cls.includes('XII')
                     ? (rand() > 0.5 ? 'Science Stream' : 'Commerce Stream')
                     : 'General',
      photo_placeholder: fn.slice(0, 1).toUpperCase() + ln.slice(0, 1).toUpperCase(),
    }
  })
}

// ─── COLOR HELPERS ────────────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

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
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
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
      style={{ animation: 'toastUp .25s ease' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  )
}

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

// ─── ADMIT CARD (printable) ───────────────────────────────────────────────────
// This renders an actual admit card — both for preview and for print
function AdmitCardPrint({ student }) {
  return (
    <div
      className="admit-card-print bg-white"
      style={{
        width: '148mm',
        minHeight: '105mm',
        border: '2px solid #1e3a8a',
        borderRadius: '6px',
        fontFamily: 'Georgia, serif',
        overflow: 'hidden',
        pageBreakInside: 'avoid',
        pageBreakAfter: 'always',
      }}
    >
      {/* Header band */}
      <div style={{ background: '#1e3a8a', padding: '8px 14px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{
          width: 36, height: 36, borderRadius: '50%', background: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 'bold', fontSize: 14, color: '#1e3a8a', flexShrink: 0
        }}>
          SVM
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: 11, letterSpacing: 0.5 }}>{SCHOOL_INFO.name}</div>
          <div style={{ color: '#93c5fd', fontSize: 9, marginTop: 1 }}>{SCHOOL_INFO.affiliation} · {SCHOOL_INFO.address}</div>
        </div>
      </div>

      {/* Title strip */}
      <div style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe', textAlign: 'center', padding: '4px 0' }}>
        <span style={{ fontWeight: 'bold', fontSize: 10, color: '#1e3a8a', textTransform: 'uppercase', letterSpacing: 2 }}>
          Entrance Examination Admit Card
        </span>
      </div>

      {/* Body */}
      <div style={{ display: 'flex', gap: 10, padding: '8px 14px' }}>
        {/* Photo box */}
        <div style={{
          width: 64, height: 74, border: '1.5px solid #1e3a8a',
          flexShrink: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#eff6ff', borderRadius: 4
        }}>
          <span style={{ fontSize: 22, fontWeight: 'bold', color: '#1e3a8a' }}>{student.photo_placeholder}</span>
          <span style={{ fontSize: 7, color: '#6b7280', marginTop: 2 }}>Photo</span>
        </div>

        {/* Details grid */}
        <div style={{ flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 9 }}>
            <tbody>
              {[
                ['Admit No.',      student.admit_no],
                ['Roll No.',       student.roll_no],
                ["Candidate's Name", student.name],
                ["Father's Name",  student.father],
                ['Date of Birth',  student.dob],
                ['Class Applied',  student.class_name],
                ['Student Type',   student.student_type],
              ].map(([label, val]) => (
                <tr key={label}>
                  <td style={{ padding: '2px 6px 2px 0', color: '#374151', fontWeight: 600, whiteSpace: 'nowrap', width: '38%' }}>{label}</td>
                  <td style={{ padding: '2px 0', color: '#111827' }}>: {val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Exam details band */}
      <div style={{ background: '#f0fdf4', borderTop: '1px solid #bbf7d0', borderBottom: '1px solid #bbf7d0', padding: '5px 14px' }}>
        <table style={{ width: '100%', fontSize: 9, borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ width: '33%', color: '#166534', fontWeight: 700 }}>Exam Date</td>
              <td style={{ width: '33%', color: '#166534', fontWeight: 700 }}>Exam Time</td>
              <td style={{ color: '#166534', fontWeight: 700 }}>Exam Center</td>
            </tr>
            <tr>
              <td style={{ color: '#111827', fontWeight: 600, fontSize: 10 }}>{student.exam_date}</td>
              <td style={{ color: '#111827', fontWeight: 600, fontSize: 10 }}>{student.exam_time}</td>
              <td style={{ color: '#111827' }}>{student.exam_center}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Instructions + Signature */}
      <div style={{ padding: '5px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ fontSize: 7.5, color: '#6b7280', maxWidth: '65%' }}>
          <div style={{ fontWeight: 700, color: '#374151', marginBottom: 2 }}>Instructions:</div>
          <ul style={{ margin: 0, paddingLeft: 10 }}>
            <li>Bring this card to the exam centre.</li>
            <li>Reach 30 minutes before exam time.</li>
            <li>No electronic device allowed.</li>
            <li>Original ID proof required.</li>
          </ul>
        </div>
        <div style={{ textAlign: 'center', fontSize: 7.5, color: '#374151' }}>
          <div style={{ width: 70, borderBottom: '1px solid #374151', marginBottom: 2 }}></div>
          <div>Principal's Signature</div>
          <div style={{ marginTop: 4, fontWeight: 700, color: '#1e3a8a', fontSize: 8 }}>{SCHOOL_INFO.shortName}</div>
        </div>
      </div>
    </div>
  )
}

// ─── ADMIT CARD PREVIEW CARD (UI card in results list) ───────────────────────
function StudentListCard({ student, selected, onToggle, onPreview }) {
  const { fg, bg } = classColor(student.class_name)
  return (
    <div
      className={`rounded-xl border transition-all overflow-hidden shadow-sm cursor-pointer
        ${selected
          ? 'border-blue-400 dark:border-indigo-400 ring-2 ring-blue-200 dark:ring-indigo-500/30 bg-blue-50/30 dark:bg-indigo-500/5'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] hover:border-slate-300'}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {/* Checkbox */}
        <button type="button" onClick={() => onToggle(student.id)}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center text-blue-600 dark:text-indigo-400">
          {selected
            ? <CheckSquare className="w-5 h-5" />
            : <Square className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
        </button>

        {/* Avatar */}
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}>
          {student.photo_placeholder}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 flex-wrap mt-0.5">
            <span className="font-mono font-semibold text-blue-500 dark:text-blue-400">{student.admit_no}</span>
            <span>·</span>
            <span>Roll: {student.roll_no}</span>
            <span>·</span>
            <span className={`px-1.5 py-0 rounded text-[10px] font-bold
              ${student.student_type === 'External'
                ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400'
                : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400'}`}>
              {student.student_type}
            </span>
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <div className="text-[11px] text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />{student.exam_date}
          </div>
          <button type="button" onClick={() => onPreview(student)}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            <Eye className="w-3.5 h-3.5" />Preview
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ student, selected, onToggle, onPreview, idx }) {
  const { fg, bg } = classColor(student.class_name)
  return (
    <tr className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
      ${selected ? 'bg-blue-50/40 dark:bg-indigo-500/[0.05]' : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}>
      {/* Checkbox */}
      <td className="px-3 py-2.5 text-center w-10">
        <button type="button" onClick={() => onToggle(student.id)}
          className="text-blue-600 dark:text-indigo-400">
          {selected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4 text-slate-300 dark:text-slate-600" />}
        </button>
      </td>
      {/* S.No */}
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 tabular-nums">{idx}</td>
      {/* Admit No */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono font-semibold text-blue-600 dark:text-blue-400">{student.admit_no}</span>
      </td>
      {/* Roll No */}
      <td className="px-3 py-2.5 text-center">
        <span className="text-[12px] font-mono text-slate-600 dark:text-slate-300">{student.roll_no}</span>
      </td>
      {/* Name */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}>
            {student.photo_placeholder}
          </span>
          <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{student.name}</span>
        </div>
      </td>
      {/* Father */}
      <td className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{student.father}</td>
      {/* Type */}
      <td className="px-3 py-2.5 text-center">
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border
          ${student.student_type === 'External'
            ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/25'
            : 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/25'}`}>
          {student.student_type}
        </span>
      </td>
      {/* Exam Date */}
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">{student.exam_date}</td>
      {/* Exam Time */}
      <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{student.exam_time}</td>
      {/* Center */}
      <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400">{student.exam_center}</td>
      {/* Actions */}
      <td className="px-3 py-2.5 text-center">
        <button type="button" onClick={() => onPreview(student)}
          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors">
          <Eye className="w-3.5 h-3.5" />View
        </button>
      </td>
    </tr>
  )
}

// ─── ADMIT CARD PREVIEW MODAL ─────────────────────────────────────────────────
function AdmitCardModal({ student, onClose, onPrint }) {
  if (!student) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}>
        <div
          className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
          style={{ animation: 'modalIn .2s ease' }}
        >
          <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>
          {/* Modal header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Admit Card Preview</span>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => onPrint([student])}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold
                  bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors">
                <Printer className="w-3.5 h-3.5" />Print / Download
              </button>
              <button onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Admit card preview */}
          <div className="p-6 flex justify-center">
            <div style={{ transform: 'scale(1)', transformOrigin: 'top center' }}>
              <AdmitCardPrint student={student} />
            </div>
          </div>

          {/* Student quick info */}
          <div className="px-6 pb-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[12px]">
              {[
                ['Admit No.',   student.admit_no],
                ['Roll No.',    student.roll_no],
                ['Exam Date',   student.exam_date],
                ['Exam Time',   student.exam_time],
                ['Center',      student.exam_center],
                ['Type',        student.student_type],
              ].map(([l, v]) => (
                <div key={l} className="rounded-lg bg-slate-50 dark:bg-slate-800/50 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase text-slate-400 mb-0.5">{l}</p>
                  <p className="font-semibold text-slate-700 dark:text-slate-200 truncate">{v}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── FILTER DRAWER (mobile) ───────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilter, onDownload, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUpE .25s ease' }}
      >
        <style>{`@keyframes drawerUpE{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-4 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)}
              placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={filters.cls} onChange={e => setFilter('cls', e.target.value)}
              placeholder="-- Select Class --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Student Type">
            <NativeSelect value={filters.studentType} onChange={e => setFilter('studentType', e.target.value)}>
              {STUDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Cancel
          </button>
          <button type="button" onClick={() => { onDownload(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Load Cards
          </button>
        </div>
      </div>
    </>
  )
}

// ─── PRINT HELPER ─────────────────────────────────────────────────────────────
// Injects a hidden print div and triggers window.print()
const triggerPrint = (students) => {
  const existing = document.getElementById('__admit_print_root')
  if (existing) existing.remove()

  const printRoot = document.createElement('div')
  printRoot.id = '__admit_print_root'
  printRoot.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#fff;overflow:auto;'

  // Build HTML for each card
  const cardsHtml = students.map(s => `
    <div style="
      width:148mm; min-height:105mm; border:2px solid #1e3a8a; border-radius:6px;
      font-family:Georgia,serif; overflow:hidden; page-break-inside:avoid;
      page-break-after:always; margin-bottom:10mm; background:#fff;
    ">
      <div style="background:#1e3a8a;padding:8px 14px;display:flex;align-items:center;gap:10px;">
        <div style="width:36px;height:36px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:14px;color:#1e3a8a;flex-shrink:0;">SVM</div>
        <div>
          <div style="color:#fff;font-weight:bold;font-size:11px;">${SCHOOL_INFO.name}</div>
          <div style="color:#93c5fd;font-size:9px;">${SCHOOL_INFO.affiliation} · ${SCHOOL_INFO.address}</div>
        </div>
      </div>
      <div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;text-align:center;padding:4px 0;">
        <span style="font-weight:bold;font-size:10px;color:#1e3a8a;text-transform:uppercase;letter-spacing:2px;">Entrance Examination Admit Card</span>
      </div>
      <div style="display:flex;gap:10px;padding:8px 14px;">
        <div style="width:64px;height:74px;border:1.5px solid #1e3a8a;flex-shrink:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#eff6ff;border-radius:4px;">
          <span style="font-size:22px;font-weight:bold;color:#1e3a8a;">${s.photo_placeholder}</span>
          <span style="font-size:7px;color:#6b7280;margin-top:2px;">Photo</span>
        </div>
        <div style="flex:1;">
          <table style="width:100%;border-collapse:collapse;font-size:9px;">
            <tr><td style="padding:2px 6px 2px 0;color:#374151;font-weight:600;white-space:nowrap;width:38%;">Admit No.</td><td>: ${s.admit_no}</td></tr>
            <tr><td style="padding:2px 6px 2px 0;color:#374151;font-weight:600;">Roll No.</td><td>: ${s.roll_no}</td></tr>
            <tr><td style="padding:2px 6px 2px 0;color:#374151;font-weight:600;">Candidate's Name</td><td>: ${s.name}</td></tr>
            <tr><td style="padding:2px 6px 2px 0;color:#374151;font-weight:600;">Father's Name</td><td>: ${s.father}</td></tr>
            <tr><td style="padding:2px 6px 2px 0;color:#374151;font-weight:600;">Date of Birth</td><td>: ${s.dob}</td></tr>
            <tr><td style="padding:2px 6px 2px 0;color:#374151;font-weight:600;">Class Applied</td><td>: ${s.class_name}</td></tr>
            <tr><td style="padding:2px 6px 2px 0;color:#374151;font-weight:600;">Student Type</td><td>: ${s.student_type}</td></tr>
          </table>
        </div>
      </div>
      <div style="background:#f0fdf4;border-top:1px solid #bbf7d0;border-bottom:1px solid #bbf7d0;padding:5px 14px;">
        <table style="width:100%;font-size:9px;border-collapse:collapse;">
          <tr>
            <td style="width:33%;color:#166534;font-weight:700;">Exam Date</td>
            <td style="width:33%;color:#166534;font-weight:700;">Exam Time</td>
            <td style="color:#166534;font-weight:700;">Exam Center</td>
          </tr>
          <tr>
            <td style="color:#111827;font-weight:600;font-size:10px;">${s.exam_date}</td>
            <td style="color:#111827;font-weight:600;font-size:10px;">${s.exam_time}</td>
            <td style="color:#111827;">${s.exam_center}</td>
          </tr>
        </table>
      </div>
      <div style="padding:5px 14px;display:flex;justify-content:space-between;align-items:flex-end;">
        <div style="font-size:7.5px;color:#6b7280;max-width:65%;">
          <div style="font-weight:700;color:#374151;margin-bottom:2px;">Instructions:</div>
          <ul style="margin:0;padding-left:10px;">
            <li>Bring this card to the exam centre.</li>
            <li>Reach 30 minutes before exam time.</li>
            <li>No electronic device allowed.</li>
            <li>Original ID proof required.</li>
          </ul>
        </div>
        <div style="text-align:center;font-size:7.5px;color:#374151;">
          <div style="width:70px;border-bottom:1px solid #374151;margin-bottom:2px;"></div>
          <div>Principal's Signature</div>
          <div style="margin-top:4px;font-weight:700;color:#1e3a8a;font-size:8px;">${SCHOOL_INFO.shortName}</div>
        </div>
      </div>
    </div>
  `).join('')

  printRoot.innerHTML = `
    <style>
      @media print {
        body > *:not(#__admit_print_root) { display: none !important; }
        #__admit_print_root { position: static !important; }
        @page { size: A5 landscape; margin: 5mm; }
      }
      #__admit_print_root { padding: 20px; display: flex; flex-wrap: wrap; gap: 16px; justify-content: center; }
    </style>
    <div style="position:fixed;top:10px;right:10px;z-index:100;display:flex;gap:8px;">
      <button onclick="window.print()" style="padding:8px 16px;background:#1d4ed8;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">🖨 Print / Save PDF</button>
      <button onclick="document.getElementById('__admit_print_root').remove()" style="padding:8px 16px;background:#6b7280;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">✕ Close</button>
    </div>
    ${cardsHtml}
  `
  document.body.appendChild(printRoot)
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
      <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        ))}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          style={{ opacity: 1 - i * 0.15 }} />
      ))}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function EntranceExamAdmitCard() {
  const [filters, setFilters] = useState({ session: '', cls: '', studentType: '' })
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [shown,       setShown]       = useState(false)
  const [shownMeta,   setShownMeta]   = useState({})
  const [selected,    setSelected]    = useState(new Set())
  const [previewStu,  setPreviewStu]  = useState(null)
  const [page,        setPage]        = useState(1)
  const PAGE_SIZE = 15

  const setFilter = useCallback((k, v) => {
    setFilters(p => ({ ...p, [k]: v }))
    setErrors(p => ({ ...p, [k]: undefined }))
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type }); setTimeout(() => setToast(null), 3500)
  }

  // ── Load cards ────────────────────────────────────────────────────────────
  const handleDownload = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Please select a session'
    if (!filters.cls)     err.cls     = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setSelected(new Set())
    setPage(1)

    setTimeout(() => {
      const data = generateStudents(filters.session, filters.cls, filters.studentType)
      setRows(data)
      setShownMeta({ ...filters })
      setShown(true)
      setLoading(false)
      showToast(`${data.length} admit cards loaded for ${filters.cls}, ${filters.session}.`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', cls: '', studentType: '' })
    setRows([]); setSearch(''); setErrors({}); setShown(false)
    setShownMeta({}); setSelected(new Set()); setPage(1)
  }

  // ── Selection helpers ─────────────────────────────────────────────────────
  const toggleSelect = (id) =>
    setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n })

  const toggleAll = () => {
    if (selected.size === filtered.length)
      setSelected(new Set())
    else
      setSelected(new Set(filtered.map(r => r.id)))
  }

  // ── Print helpers ─────────────────────────────────────────────────────────
  const handlePrintSelected = () => {
    const toPrint = rows.filter(r => selected.has(r.id))
    if (toPrint.length === 0) { showToast('Select at least one student first.', 'error'); return }
    triggerPrint(toPrint)
    showToast(`Opening ${toPrint.length} admit card(s) for print/download.`)
  }

  const handlePrintAll = () => {
    if (rows.length === 0) { showToast('Load cards first.', 'error'); return }
    triggerPrint(filtered)
    showToast(`Opening all ${filtered.length} admit card(s).`)
  }

  const handlePrintOne = (students) => triggerPrint(Array.isArray(students) ? students : [students])

  // ── Filter + paginate ─────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.admit_no.toLowerCase().includes(q) ||
      r.roll_no.includes(q) ||
      r.father.toLowerCase().includes(q)
    )
  }, [rows, search])

  const paginated = useMemo(() => {
    const s = (page - 1) * PAGE_SIZE
    return filtered.slice(s, s + PAGE_SIZE)
  }, [filtered, page])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  const counts = useMemo(() => ({
    total:    rows.length,
    external: rows.filter(r => r.student_type === 'External').length,
    internal: rows.filter(r => r.student_type === 'Internal').length,
    selected: selected.size,
  }), [rows, selected])

  const hasResults = shown && rows.length > 0
  const activeFilters = [filters.session, filters.cls].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 flex-wrap">
        {['Home', 'Reports', 'Registration', 'Entrance Exam Admit Card'].map((c, i, arr) => (
          <span key={c} className="flex items-center gap-1.5">
            <span className={i === arr.length - 1 ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'hover:text-slate-600 cursor-pointer'}>{c}</span>
            {i < arr.length - 1 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          </span>
        ))}
      </nav>

      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Entrance Exam Admit Card
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Generate, preview &amp; download admit cards for entrance examination candidates.
          </p>
        </div>
        {hasResults && (
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            {counts.selected > 0 && (
              <button type="button" onClick={handlePrintSelected}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                  bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all active:scale-95">
                <Download className="w-4 h-4" />
                Download Selected ({counts.selected})
              </button>
            )}
            <button type="button" onClick={handlePrintAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all active:scale-95">
              <Printer className="w-4 h-4" />
              Download All ({filtered.length})
            </button>
          </div>
        )}
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Filters</span>
          {activeFilters > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {activeFilters} active
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session} onChange={e => setFilter('session', e.target.value)}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Class" error={errors.cls} required>
              <NativeSelect value={filters.cls} onChange={e => setFilter('cls', e.target.value)}
                placeholder="-- Select Class --" error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Student Type">
              <NativeSelect value={filters.studentType} onChange={e => setFilter('studentType', e.target.value)}>
                {STUDENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </NativeSelect>
            </Field>

            <div />{/* spacer */}

            <div className="flex gap-2">
              <button type="button" onClick={handleDownload} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                Load Cards
              </button>
              <button type="button" onClick={handleReset}
                className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span>{filters.session && filters.cls ? `${filters.cls} · ${filters.session}` : 'Set Filters'}</span>
          </div>
          {activeFilters > 0 && (
            <span className="bg-white/25 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handlePrintAll}
            className="px-3.5 py-2.5 rounded-xl bg-emerald-600 text-white shadow-sm">
            <Printer className="w-4 h-4" />
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        onDownload={handleDownload}
        loading={loading}
        errors={errors}
      />

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}       label="Total Candidates" value={counts.total}    color="blue"    />
            <SummaryCard icon={GraduationCap} label="External"       value={counts.external} color="amber"   />
            <SummaryCard icon={BadgeCheck}  label="Internal"          value={counts.internal} color="emerald" />
            <SummaryCard icon={ClipboardCheck} label="Selected"       value={counts.selected} color="violet"  />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                  {shownMeta.cls} — {shownMeta.session}
                </span>
                {shownMeta.studentType && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                    {shownMeta.studentType}
                  </span>
                )}
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {filtered.length} cards
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Name, admit no, roll…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:placeholder-slate-600"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Bulk action bar */}
            <div className="flex items-center justify-between gap-3 px-5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/30 dark:bg-white/[0.01]">
              <div className="flex items-center gap-3">
                <button type="button" onClick={toggleAll}
                  className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {selected.size === filtered.length && filtered.length > 0
                    ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
                    : <Square className="w-4 h-4 text-slate-400" />}
                  {selected.size === filtered.length && filtered.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
                {counts.selected > 0 && (
                  <span className="text-[12px] text-slate-500 dark:text-slate-400">
                    {counts.selected} selected
                  </span>
                )}
              </div>
              {counts.selected > 0 && (
                <button type="button" onClick={handlePrintSelected}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold
                    bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  Download Selected ({counts.selected})
                </button>
              )}
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full min-w-[900px]">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      <th className="px-3 py-2.5 w-10"></th>
                      {['S.No.','Admit No.','Roll No.','Candidate Name','Father Name','Type','Exam Date','Exam Time','Center','Action'].map((h, i) => (
                        <th key={i} className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap text-left">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((row, i) => (
                      <DesktopRow
                        key={row.id}
                        student={row}
                        idx={(page - 1) * PAGE_SIZE + i + 1}
                        selected={selected.has(row.id)}
                        onToggle={toggleSelect}
                        onPreview={setPreviewStu}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records found.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5" />
                    Tap Preview to see &amp; download individual admit card.
                  </p>
                  {paginated.map(row => (
                    <StudentListCard
                      key={row.id}
                      student={row}
                      selected={selected.has(row.id)}
                      onToggle={toggleSelect}
                      onPreview={setPreviewStu}
                    />
                  ))}
                  {/* Mobile download selected */}
                  {counts.selected > 0 && (
                    <button type="button" onClick={handlePrintSelected}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                        bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md">
                      <Download className="w-4 h-4" />
                      Download Selected ({counts.selected})
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
                <p className="text-[12px] text-slate-400">
                  Page <span className="font-semibold text-slate-700 dark:text-slate-300">{page}</span> of{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{totalPages}</span>
                  {' '}· <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> records
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = page <= 3 ? i + 1 : page - 2 + i
                    if (p < 1 || p > totalPages) return null
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-7 h-7 rounded-lg text-[12px] font-semibold transition-colors
                          ${page === p ? 'bg-blue-600 text-white dark:bg-indigo-600' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {p}
                      </button>
                    )
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Empty State */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardCheck className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No admit cards loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select Session &amp; Class, then click <strong>Load Cards</strong> to generate admit cards.
            </p>
          </div>
        </div>
      )}

      {/* Admit Card Preview Modal */}
      <AdmitCardModal student={previewStu} onClose={() => setPreviewStu(null)} onPrint={handlePrintOne} />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
