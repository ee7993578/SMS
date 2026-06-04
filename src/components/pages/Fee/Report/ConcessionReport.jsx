/**
 * ConcessionReport.jsx
 * Folder: src/pages/Fee/Reports/ConcessionReport.jsx
 *
 * Converts legacy ASPX "Concession Report" to fully-responsive React + Tailwind.
 *
 * Filters  : Session, Type (Detailed / Summary), Class (multi-select), Admission No.
 * Detailed : S.No · Adm No · Name · Class · Father Name · Concession Details (nested)
 * Summary  : Class-wise concession totals (RDLC-style)
 * Features :
 *  - Mobile bottom-drawer for filters
 *  - Desktop always-visible filter panel
 *  - Expandable concession detail cards on mobile
 *  - Nested installment + fee-head breakdown (accordion)
 *  - Grand total footer
 *  - Excel export (placeholder)
 *  - Loading skeletons · empty state · toast notifications
 *  - Dark-mode ready
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, ChevronUp,
  Users, FileSpreadsheet, Search, SlidersHorizontal,
  Info, BarChart3, Receipt, BadgePercent, BookOpen,
  School2, TrendingUp, MapPin, Building2, Tag,
  CreditCard, UserCircle, Hash, Layers, IndianRupee,
  GraduationCap, ListFilter
} from 'lucide-react'

// ─────────────────────────────────────────────────────────────────────────────
// STATIC DATA
// ─────────────────────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']
const REPORT_TYPES = [
  { value: '1', label: 'Detailed' },
  { value: '2', label: 'Summary' },
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

// Dummy detailed concession records
const DETAILED_DATA = {
  '2024-25': [
    {
      adm_no: 'ADM-1042', name: 'Aarav Sharma', class: 'Class V', father_name: 'Rajesh Sharma', stu_id: 's1',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'Sibling', con_value: '10%' }, { fee_head: 'Activity Fee', con_type: 'Sibling', con_value: '10%' }] },
        { inst_no: 2, heads: [{ fee_head: 'Tuition Fee', con_type: 'Sibling', con_value: '10%' }] },
      ],
    },
    {
      adm_no: 'ADM-1078', name: 'Priya Negi', class: 'Class V', father_name: 'Suresh Negi', stu_id: 's2',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'RTE', con_value: '100%' }, { fee_head: 'Exam Fee', con_type: 'RTE', con_value: '100%' }] },
      ],
    },
    {
      adm_no: 'ADM-1122', name: 'Rohan Bisht', class: 'Class IX', father_name: 'Mohan Bisht', stu_id: 's3',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'Merit', con_value: '₹500' }] },
        { inst_no: 2, heads: [{ fee_head: 'Tuition Fee', con_type: 'Merit', con_value: '₹500' }] },
        { inst_no: 3, heads: [{ fee_head: 'Tuition Fee', con_type: 'Merit', con_value: '₹500' }] },
      ],
    },
    {
      adm_no: 'ADM-1205', name: 'Simran Kaur', class: 'Class IX', father_name: 'Harpreet Kaur', stu_id: 's4',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'Staff Ward', con_value: '50%' }, { fee_head: 'Lab Fee', con_type: 'Staff Ward', con_value: '50%' }] },
        { inst_no: 2, heads: [{ fee_head: 'Tuition Fee', con_type: 'Staff Ward', con_value: '50%' }] },
      ],
    },
    {
      adm_no: 'ADM-1310', name: 'Vikram Rawat', class: 'Class XII', father_name: 'Dinesh Rawat', stu_id: 's5',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'Sibling', con_value: '15%' }, { fee_head: 'Sports Fee', con_type: 'Sibling', con_value: '15%' }] },
        { inst_no: 2, heads: [{ fee_head: 'Tuition Fee', con_type: 'Sibling', con_value: '15%' }] },
      ],
    },
    {
      adm_no: 'ADM-1089', name: 'Ananya Joshi', class: 'Class XII', father_name: 'Anil Joshi', stu_id: 's6',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'RTE', con_value: '100%' }] },
        { inst_no: 2, heads: [{ fee_head: 'Tuition Fee', con_type: 'RTE', con_value: '100%' }, { fee_head: 'Exam Fee', con_type: 'RTE', con_value: '100%' }] },
      ],
    },
    {
      adm_no: 'ADM-1401', name: 'Karan Mehta', class: 'LKG', father_name: 'Vivek Mehta', stu_id: 's7',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'Sibling', con_value: '10%' }] },
      ],
    },
    {
      adm_no: 'ADM-1456', name: 'Divya Thakur', class: 'Class II', father_name: 'Ramesh Thakur', stu_id: 's8',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'Merit', con_value: '₹300' }, { fee_head: 'Activity Fee', con_type: 'Merit', con_value: '₹100' }] },
        { inst_no: 2, heads: [{ fee_head: 'Tuition Fee', con_type: 'Merit', con_value: '₹300' }] },
      ],
    },
  ],
  '2025-26': [
    {
      adm_no: 'ADM-1501', name: 'Ishaan Verma', class: 'Class VI', father_name: 'Sanjay Verma', stu_id: 's9',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'Sibling', con_value: '10%' }] },
        { inst_no: 2, heads: [{ fee_head: 'Tuition Fee', con_type: 'Sibling', con_value: '10%' }] },
      ],
    },
    {
      adm_no: 'ADM-1602', name: 'Tanvi Pant', class: 'Class X', father_name: 'Manoj Pant', stu_id: 's10',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'Staff Ward', con_value: '50%' }, { fee_head: 'Lab Fee', con_type: 'Staff Ward', con_value: '50%' }, { fee_head: 'Exam Fee', con_type: 'Staff Ward', con_value: '25%' }] },
      ],
    },
    {
      adm_no: 'ADM-1703', name: 'Arjun Singh', class: 'Class X', father_name: 'Gurpreet Singh', stu_id: 's11',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'RTE', con_value: '100%' }] },
        { inst_no: 2, heads: [{ fee_head: 'Tuition Fee', con_type: 'RTE', con_value: '100%' }, { fee_head: 'Stationery', con_type: 'RTE', con_value: '100%' }] },
      ],
    },
    {
      adm_no: 'ADM-1804', name: 'Nisha Chauhan', class: 'Nursery', father_name: 'Deepak Chauhan', stu_id: 's12',
      installments: [
        { inst_no: 1, heads: [{ fee_head: 'Tuition Fee', con_type: 'Merit', con_value: '₹200' }] },
      ],
    },
  ],
}

// Dummy summary data
const SUMMARY_DATA = {
  '2024-25': [
    { class: 'LKG',       students: 1, total_concession: '₹1,200',  con_types: 'Sibling' },
    { class: 'Class II',  students: 1, total_concession: '₹1,600',  con_types: 'Merit' },
    { class: 'Class V',   students: 2, total_concession: '₹18,400', con_types: 'Sibling, RTE' },
    { class: 'Class IX',  students: 2, total_concession: '₹22,500', con_types: 'Merit, Staff Ward' },
    { class: 'Class XII', students: 2, total_concession: '₹28,800', con_types: 'Sibling, RTE' },
  ],
  '2025-26': [
    { class: 'Nursery',   students: 1, total_concession: '₹800',   con_types: 'Merit' },
    { class: 'Class VI',  students: 1, total_concession: '₹3,200',  con_types: 'Sibling' },
    { class: 'Class X',   students: 2, total_concession: '₹34,600', con_types: 'Staff Ward, RTE' },
  ],
}

// Concession type color map
const CON_TYPE_COLORS = {
  'Sibling':    { bg: 'bg-sky-50 dark:bg-sky-500/10',    text: 'text-sky-700 dark:text-sky-400',    border: 'border-sky-200 dark:border-sky-500/30' },
  'RTE':        { bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-400', border: 'border-violet-200 dark:border-violet-500/30' },
  'Merit':      { bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-500/30' },
  'Staff Ward': { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-500/30' },
}
const getConColor = (type) =>
  CON_TYPE_COLORS[type] || { bg: 'bg-slate-50 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-700' }

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name) => CLASS_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─────────────────────────────────────────────────────────────────────────────
// PRIMITIVE COMPONENTS (same design system as StrengthReport)
// ─────────────────────────────────────────────────────────────────────────────

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

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{hint}</p>}
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
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

function SummaryCard({ icon: Icon, label, value, color, sub }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    sky:     'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

function SchoolHeader({ session, reportType }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
          <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25">
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">
            {reportType === '1' ? 'Detailed' : 'Summary'} Concession Report
          </span>
        </div>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Fee Concession Report
      </p>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CONCESSION TYPE BADGE
// ─────────────────────────────────────────────────────────────────────────────
function ConBadge({ type }) {
  const c = getConColor(type)
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border ${c.bg} ${c.text} ${c.border}`}>
      <Tag className="w-2.5 h-2.5" />{type}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// INSTALLMENT ACCORDION (inside detailed card/row)
// ─────────────────────────────────────────────────────────────────────────────
function InstallmentAccordion({ installments }) {
  const [openInst, setOpenInst] = useState(null)
  return (
    <div className="space-y-1.5">
      {installments.map((inst) => (
        <div key={inst.inst_no} className="rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.15)] overflow-hidden">
          <button
            type="button"
            onClick={() => setOpenInst(openInst === inst.inst_no ? null : inst.inst_no)}
            className="w-full flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-white/[0.03] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors text-left"
          >
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">
                Installment {inst.inst_no}
              </span>
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">
                {inst.heads.length} head{inst.heads.length !== 1 ? 's' : ''}
              </span>
            </div>
            {openInst === inst.inst_no
              ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
          </button>
          {openInst === inst.inst_no && (
            <div className="px-3 py-2 bg-white dark:bg-[#1a1f35]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                    {['Fee Head', 'Concession Type', 'Value'].map((h, i) => (
                      <th key={i} className="pb-1.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 pr-3">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {inst.heads.map((head, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] last:border-0">
                      <td className="py-1.5 text-[12px] text-slate-700 dark:text-slate-300 font-medium pr-3">{head.fee_head}</td>
                      <td className="py-1.5 pr-3"><ConBadge type={head.con_type} /></td>
                      <td className="py-1.5">
                        <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                          {head.con_value}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE DETAILED CARD
// ─────────────────────────────────────────────────────────────────────────────
function MobileDetailCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  const allConTypes = [...new Set(row.installments.flatMap(i => i.heads.map(h => h.con_type)))]

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold mt-0.5"
          style={{ background: bg, color: fg }}
        >
          {formatAbbr(row.class)}
        </span>

        <div className="flex-1 min-w-0">
          {/* Name + Adm */}
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.name}</p>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">{row.adm_no}</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {row.class} &nbsp;·&nbsp; Father: {row.father_name}
          </p>
          {/* Con type badges */}
          <div className="flex flex-wrap gap-1 mt-1.5">
            {allConTypes.map(t => <ConBadge key={t} type={t} />)}
          </div>
        </div>

        {/* Installment count */}
        <div className="flex flex-col items-end flex-shrink-0 gap-1">
          <span className="text-[18px] font-bold text-blue-700 dark:text-blue-400 tabular-nums leading-tight">{row.installments.length}</span>
          <span className="text-[10px] text-slate-400">inst.</span>
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </span>
        </div>
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> Concession Details
          </p>
          <InstallmentAccordion installments={row.installments} />
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP DETAILED TABLE ROW
// ─────────────────────────────────────────────────────────────────────────────
function DesktopDetailRow({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  const allConTypes = [...new Set(row.installments.flatMap(i => i.heads.map(h => h.con_type)))]

  return (
    <>
      <tr
        className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors cursor-pointer"
        onClick={() => setExpanded(p => !p)}
      >
        {/* S.No */}
        <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>
        {/* Adm No */}
        <td className="px-4 py-3">
          <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{row.adm_no}</span>
        </td>
        {/* Name */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold" style={{ background: bg, color: fg }}>
              {row.name.charAt(0)}
            </span>
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
          </div>
        </td>
        {/* Class */}
        <td className="px-4 py-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold" style={{ background: bg, color: fg }}>
            {row.class}
          </span>
        </td>
        {/* Father */}
        <td className="px-4 py-3 text-[12px] text-slate-600 dark:text-slate-400 whitespace-nowrap">{row.father_name}</td>
        {/* Con Types */}
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {allConTypes.map(t => <ConBadge key={t} type={t} />)}
          </div>
        </td>
        {/* Expand toggle */}
        <td className="px-4 py-3 text-center">
          <button type="button" className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            {row.installments.length} Inst.
          </button>
        </td>
      </tr>

      {/* Expanded detail row */}
      {expanded && (
        <tr className="bg-slate-50/50 dark:bg-white/[0.015]">
          <td colSpan={7} className="px-6 py-4">
            <div className="flex items-start gap-2 mb-3">
              <Layers className="w-4 h-4 text-blue-500 mt-0.5" />
              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-300">
                Concession Details — {row.name} ({row.adm_no})
              </span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {row.installments.map(inst => (
                <div key={inst.inst_no} className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50/60 dark:bg-blue-500/[0.05] border-b border-blue-100 dark:border-blue-500/15">
                    <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">Installment {inst.inst_no}</span>
                  </div>
                  <div className="p-3 space-y-2">
                    {inst.heads.map((head, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 py-1.5 border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] last:border-0">
                        <span className="text-[12px] text-slate-700 dark:text-slate-300 font-medium flex-1 min-w-0 truncate">{head.fee_head}</span>
                        <ConBadge type={head.con_type} />
                        <span className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums flex-shrink-0">{head.con_value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY TABLE
// ─────────────────────────────────────────────────────────────────────────────
function SummaryTable({ rows }) {
  if (!rows.length) return (
    <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
      <Search className="w-6 h-6 opacity-40" />
      <span className="text-[13px]">No summary records found.</span>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              {['S.No.', 'Class', 'Students', 'Total Concession', 'Concession Types'].map((h, i) => (
                <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const { fg, bg } = classColor(row.class)
              return (
                <tr key={i} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums w-10">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold" style={{ background: bg, color: fg }}>
                        {formatAbbr(row.class)}
                      </span>
                      <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.class}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl text-[13px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
                      {row.students}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{row.total_concession}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {row.con_types.split(', ').map(t => <ConBadge key={t} type={t} />)}
                    </div>
                  </td>
                </tr>
              )
            })}
            {/* Grand Total */}
            <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
              <td className="px-4 py-3 text-center text-[12px] text-blue-500">—</td>
              <td className="px-4 py-3 font-bold text-blue-700 dark:text-blue-300 text-[13px]" colSpan={2}>
                <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Grand Total ({rows.length} Classes)</div>
              </td>
              <td className="px-4 py-3">
                <span className="text-[14px] font-extrabold text-emerald-700 dark:text-emerald-400">
                  ₹{rows.reduce((s, r) => s + parseInt(r.total_concession.replace(/[₹,]/g, '') || 0), 0).toLocaleString()}
                </span>
              </td>
              <td className="px-4 py-3">
                <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-400">
                  {rows.reduce((s, r) => s + r.students, 0)} students
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden p-4 space-y-3">
        {rows.map((row, i) => {
          const { fg, bg } = classColor(row.class)
          return (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold" style={{ background: bg, color: fg }}>
                  {formatAbbr(row.class)}
                </span>
                <div>
                  <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{row.class}</p>
                  <p className="text-[11px] text-slate-400">{row.students} student{row.students !== 1 ? 's' : ''} with concession</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-[16px] font-extrabold text-emerald-700 dark:text-emerald-400">{row.total_concession}</p>
                  <p className="text-[10px] text-slate-400">total concession</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1">
                {row.con_types.split(', ').map(t => <ConBadge key={t} type={t} />)}
              </div>
            </div>
          )
        })}
        {/* Mobile Grand Total */}
        <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-blue-700 dark:text-blue-400" />
            <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400">Grand Total</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
              <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300">{rows.length}</p>
              <p className="text-[10px] font-semibold text-blue-600">Classes</p>
            </div>
            <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
              <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300">{rows.reduce((s, r) => s + r.students, 0)}</p>
              <p className="text-[10px] font-semibold text-blue-600">Students</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-SELECT CLASS PICKER (mobile-friendly)
// ─────────────────────────────────────────────────────────────────────────────
function ClassMultiSelect({ selected, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const toggle = (cls) => {
    onChange(prev =>
      prev.includes(cls) ? prev.filter(c => c !== cls) : [...prev, cls]
    )
  }
  const selectAll = () => onChange([...CLASSES])
  const clearAll = () => onChange([])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className={`w-full flex items-center justify-between pl-3 pr-2.5 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          border-slate-200 dark:border-[rgba(99,102,241,0.25)]`}
      >
        <span className="truncate text-left">
          {selected.length === 0
            ? <span className="text-slate-400 dark:text-slate-500">-- All Classes --</span>
            : selected.length === CLASSES.length
              ? 'All Classes Selected'
              : selected.length === 1
                ? selected[0]
                : `${selected.length} classes selected`}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 ml-2 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute z-30 top-full mt-1 left-0 right-0 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1e2238] shadow-xl overflow-hidden"
          style={{ maxHeight: 260, overflowY: 'auto' }}>
          {/* Controls */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-0 bg-white dark:bg-[#1e2238] z-10">
            <button type="button" onClick={selectAll}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors">
              All
            </button>
            <button type="button" onClick={clearAll}
              className="text-[11px] font-bold text-slate-500 dark:text-slate-400 hover:text-slate-700 px-2 py-1 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
              Clear
            </button>
            <span className="ml-auto text-[10px] text-slate-400">{selected.length} selected</span>
          </div>
          {CLASSES.map(cls => {
            const { fg, bg } = classColor(cls)
            const checked = selected.includes(cls)
            return (
              <button
                key={cls}
                type="button"
                onClick={() => toggle(cls)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors
                  ${checked ? 'bg-blue-50/50 dark:bg-blue-500/[0.05]' : ''}`}
              >
                <span className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: bg, color: fg }}>
                  {formatAbbr(cls)}
                </span>
                <span className={`text-[13px] flex-1 ${checked ? 'font-semibold text-slate-800 dark:text-slate-100' : 'text-slate-600 dark:text-slate-400'}`}>
                  {cls}
                </span>
                {checked && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE FILTER DRAWER
// ─────────────────────────────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease', maxHeight: '90vh', overflowY: 'auto' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-4 bg-white dark:bg-[#1a1f35] z-10">
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
            <NativeSelect value={filters.session} onChange={e => setFilters(p => ({ ...p, session: e.target.value }))}
              placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Report Type" error={errors.type} required>
            <NativeSelect value={filters.type} onChange={e => setFilters(p => ({ ...p, type: e.target.value }))}
              placeholder="-- Select Type --" error={errors.type}>
              {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Select Class" hint="Leave empty to show all classes">
            <ClassMultiSelect selected={filters.classes} onChange={v => setFilters(p => ({ ...p, classes: typeof v === 'function' ? v(p.classes) : v }))} />
          </Field>

          <Field label="Admission No.">
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={filters.admNo}
                onChange={e => setFilters(p => ({ ...p, admNo: e.target.value }))}
                placeholder="e.g. ADM-1042"
                className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 border-slate-200 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:placeholder-slate-600"
              />
            </div>
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SKELETON
// ─────────────────────────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
      <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
      </div>
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.14 }} />
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ConcessionReport() {
  // Filter state
  const [filters, setFilters] = useState({ session: '', type: '', classes: [], admNo: '' })
  const [errors, setErrors] = useState({})

  // Data state
  const [rows, setRows] = useState([])
  const [reportMeta, setReportMeta] = useState({ session: '', type: '' })
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [shown, setShown] = useState(false)

  // UI state
  const [filterOpen, setFilterOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate & fetch ─────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Please select a session'
    if (!filters.type) err.type = 'Please select report type'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = []
      if (filters.type === '1') {
        // Detailed
        data = DETAILED_DATA[filters.session] || []
        // Filter by selected classes
        if (filters.classes.length > 0) {
          data = data.filter(r => filters.classes.includes(r.class))
        }
        // Filter by admission no
        if (filters.admNo.trim()) {
          const q = filters.admNo.trim().toLowerCase()
          data = data.filter(r => r.adm_no.toLowerCase().includes(q))
        }
      } else {
        // Summary
        data = SUMMARY_DATA[filters.session] || []
        if (filters.classes.length > 0) {
          data = data.filter(r => filters.classes.includes(r.class))
        }
      }
      setRows(data)
      setReportMeta({ session: filters.session, type: filters.type })
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} record${data.length !== 1 ? 's' : ''} · Session ${filters.session}`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', type: '', classes: [], admNo: '' })
    setRows([]); setSearch(''); setErrors({}); setShown(false); setReportMeta({ session: '', type: '' })
  }

  const handleExcel = () => {
    if (!rows.length) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search filter (detailed only) ─────────────────────────────────────────
  const filtered = useMemo(() => {
    if (reportMeta.type !== '1' || !search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.adm_no.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.father_name.toLowerCase().includes(q)
    )
  }, [rows, search, reportMeta.type])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!shown) return {}
    if (reportMeta.type === '1') {
      const allConTypes = [...new Set(filtered.flatMap(r => r.installments.flatMap(i => i.heads.map(h => h.con_type))))]
      const totalInst = filtered.reduce((s, r) => s + r.installments.length, 0)
      return {
        students: filtered.length,
        installments: totalInst,
        conTypes: allConTypes.length,
        types: allConTypes,
      }
    } else {
      return {
        classes: filtered.length,
        students: filtered.reduce((s, r) => s + r.students, 0),
      }
    }
  }, [filtered, shown, reportMeta.type])

  const hasResults = shown && rows.length > 0
  const activeFilterCount = [filters.session, filters.type, filters.classes.length > 0, filters.admNo.trim()].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Concession Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Student-wise fee concession details — detailed &amp; summary view.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExcel}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Panel ────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-visible">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          {activeFilterCount > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {activeFilterCount} active
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --" error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Type */}
            <Field label="Report Type" error={errors.type} required>
              <NativeSelect
                value={filters.type}
                onChange={e => { setFilters(p => ({ ...p, type: e.target.value })); setErrors(p => ({ ...p, type: undefined })) }}
                placeholder="-- Select Type --" error={errors.type}
              >
                {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Class multi-select */}
            <Field label="Class" hint="Leave empty for all">
              <ClassMultiSelect
                selected={filters.classes}
                onChange={v => setFilters(p => ({ ...p, classes: typeof v === 'function' ? v(p.classes) : v }))}
              />
            </Field>

            {/* Admission No */}
            <Field label="Admission No.">
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={filters.admNo}
                  onChange={e => setFilters(p => ({ ...p, admNo: e.target.value }))}
                  placeholder="e.g. ADM-1042"
                  className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:placeholder-slate-600"
                />
              </div>
            </Field>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button
              type="button"
              onClick={handleShow}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report
            </button>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            {hasResults && (
              <button type="button" onClick={handleExcel} disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                  bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70 ml-auto transition-all">
                {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                Export Excel
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {filters.session
            ? `${filters.session} · ${filters.type === '1' ? 'Detailed' : filters.type === '2' ? 'Summary' : 'Select Type'}`
            : 'Set Filters'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
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
        setFilters={setFilters}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading ─────────────────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={reportMeta.session} reportType={reportMeta.type} />

          {/* Summary Cards */}
          {reportMeta.type === '1' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <SummaryCard icon={Users} label="Students with Concession" value={stats.students} color="blue" />
              <SummaryCard icon={CreditCard} label="Total Installments" value={stats.installments} color="emerald" />
              <SummaryCard icon={Tag} label="Concession Types" value={stats.conTypes} color="violet"
                sub={stats.types?.slice(0, 2).join(', ') + (stats.types?.length > 2 ? '…' : '')} />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <SummaryCard icon={GraduationCap} label="Classes with Concession" value={stats.classes} color="blue" />
              <SummaryCard icon={Users} label="Total Students" value={stats.students} color="violet" />
            </div>
          )}

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-visible">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                  {reportMeta.type === '1' ? 'Detailed Concession' : 'Summary Concession'}
                </span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {reportMeta.session}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search (detailed only) */}
              {reportMeta.type === '1' && (
                <div className="relative w-full sm:w-56 flex-shrink-0">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
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
              )}
            </div>

            {/* Info hint */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                {reportMeta.type === '1'
                  ? 'Click any row or card to expand installment-wise concession details.'
                  : 'Class-wise concession summary. Switch to Detailed for student-level breakdown.'}
              </p>
            </div>

            {/* ── DETAILED REPORT ── */}
            {reportMeta.type === '1' && (
              <>
                {/* Desktop Table */}
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
                          {['S.No.', 'Adm. No.', 'Student Name', 'Class', 'Father Name', 'Concession Types', 'Details'].map((h, i) => (
                            <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filtered.map((row, i) => (
                          <DesktopDetailRow key={row.stu_id} row={row} idx={i + 1} />
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>

                {/* Mobile Cards */}
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
                        Tap a card to expand concession details.
                      </p>
                      {filtered.map((row, i) => (
                        <MobileDetailCard key={row.stu_id} row={row} idx={i + 1} />
                      ))}
                    </>
                  )}
                </div>
              </>
            )}

            {/* ── SUMMARY REPORT ── */}
            {reportMeta.type === '2' && <SummaryTable rows={filtered} />}

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BadgePercent className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a <strong>session</strong> &amp; <strong>type</strong>, then click <strong>Show Report</strong>.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400">
                <Tag className="w-3 h-3" /> Sibling
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400">
                <Tag className="w-3 h-3" /> RTE
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                <Tag className="w-3 h-3" /> Merit
              </span>
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                <Tag className="w-3 h-3" /> Staff Ward
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
