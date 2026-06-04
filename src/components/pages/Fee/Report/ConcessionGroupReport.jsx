/**
 * ConcessionGroupReport.jsx
 * Folder: src/pages/Student/Reports/ConcessionGroupReport.jsx
 *
 * Converts legacy ASPX "Concession Group Report" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session dropdown
 *  - Group Type: Main Group / Sub Group (radio)
 *  - Category dropdown (dynamic based on group type)
 *  - Report Type: Installment Wise / Head Wise (radio)
 *  - Show + Excel Export buttons
 *  - Desktop: ERP-style dense table with sticky header
 *  - Mobile: Smart card layout with tabs/accordions — zero horizontal scroll
 *  - Summary stat cards
 *  - School header banner
 *  - Loading skeleton, empty state, toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, Users, FileSpreadsheet, SlidersHorizontal,
  Info, Search, BarChart3, Building2, MapPin, TrendingUp,
  Tag, Layers, CreditCard, BookOpen, ChevronRight,
  IndianRupee, Percent, Receipt, BadgePercent, ArrowDownToLine,
  ChevronUp, List, LayoutGrid, GraduationCap
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const MAIN_GROUPS = [
  { value: 'staff',     label: 'Staff Children' },
  { value: 'mgmt',      label: 'Management Quota' },
  { value: 'sibling',   label: 'Sibling Concession' },
  { value: 'merit',     label: 'Merit Students' },
  { value: 'sc_st',     label: 'SC/ST Students' },
  { value: 'minority',  label: 'Minority Group' },
]

const SUB_GROUPS = [
  { value: 'sub_a',   label: 'Sub Group A' },
  { value: 'sub_b',   label: 'Sub Group B' },
  { value: 'sub_c',   label: 'Sub Group C' },
  { value: 'sub_d',   label: 'Sub Group D' },
  { value: 'sub_e',   label: 'Sub Group E' },
]

// Fee heads for Installment Wise report
const INSTALLMENTS = ['1st Installment', '2nd Installment', '3rd Installment', 'Annual']

// Fee heads for Head Wise report
const FEE_HEADS = ['Tuition Fee', 'Dev. Fee', 'Exam Fee', 'Library', 'Sports', 'Annual Charge', 'Misc']

// ── dummy data generators ──────────────────────────────────────────────────────

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III', 'Class IV',
  'Class V', 'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII']

function seedRand(base, offset) {
  return ((base * 31 + offset * 17) % 900) + 100
}

function generateInstallmentData(session, category) {
  const sessionIdx = SESSIONS.indexOf(session) + 1
  const catIdx = [...MAIN_GROUPS, ...SUB_GROUPS].findIndex(g => g.value === category) + 1
  return CLASSES.map((cls, i) => {
    const students = seedRand(catIdx + sessionIdx, i + 1) % 60 + 5
    const inst = INSTALLMENTS.reduce((acc, ins, j) => {
      const gross = seedRand(i + j + sessionIdx, catIdx) * 10
      const conc  = Math.floor(gross * (0.1 + (catIdx % 4) * 0.05))
      const net   = gross - conc
      acc[ins] = { gross, concession: conc, net }
      return acc
    }, {})
    const totalGross = Object.values(inst).reduce((s, v) => s + v.gross, 0)
    const totalConc  = Object.values(inst).reduce((s, v) => s + v.concession, 0)
    const totalNet   = Object.values(inst).reduce((s, v) => s + v.net, 0)
    return { class: cls, students, installments: inst, totalGross, totalConc, totalNet }
  })
}

function generateHeadWiseData(session, category) {
  const sessionIdx = SESSIONS.indexOf(session) + 1
  const catIdx = [...MAIN_GROUPS, ...SUB_GROUPS].findIndex(g => g.value === category) + 1
  return CLASSES.map((cls, i) => {
    const students = seedRand(catIdx + sessionIdx, i + 1) % 60 + 5
    const heads = FEE_HEADS.reduce((acc, head, j) => {
      const gross = seedRand(i + j + sessionIdx, catIdx + 3) * 8
      const conc  = Math.floor(gross * (0.08 + (catIdx % 5) * 0.04))
      const net   = gross - conc
      acc[head] = { gross, concession: conc, net }
      return acc
    }, {})
    const totalGross = Object.values(heads).reduce((s, v) => s + v.gross, 0)
    const totalConc  = Object.values(heads).reduce((s, v) => s + v.concession, 0)
    const totalNet   = Object.values(heads).reduce((s, v) => s + v.net, 0)
    return { class: cls, students, heads, totalGross, totalConc, totalNet }
  })
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) => n?.toLocaleString('en-IN') ?? '0'
const fmtCurr = (n) => `₹${fmt(n)}`

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name) => CLASS_COLORS[(name?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const classAbbr  = (name) => name.replace('Class ', '').slice(0, 3).toUpperCase()

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
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

function RadioGroup({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{label}</span>
      <div className="flex gap-2 flex-wrap">
        {options.map(opt => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all
              ${value === opt.value
                ? 'bg-blue-600 text-white border-blue-600 dark:bg-indigo-600 dark:border-indigo-600 shadow-sm shadow-blue-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300 hover:bg-blue-50 dark:bg-[#1e2238] dark:text-slate-300 dark:border-[rgba(99,102,241,0.25)] dark:hover:border-indigo-400'
              }`}
          >
            <span className={`w-2 h-2 rounded-full border flex-shrink-0 transition-colors
              ${value === opt.value ? 'bg-white border-white' : 'border-slate-400 dark:border-slate-500'}`} />
            {opt.label}
          </button>
        ))}
      </div>
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
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── SUMMARY CARD ──────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight truncate">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{sub}</p>}
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER ─────────────────────────────────────────────────────────────

function SchoolHeader({ session, groupLabel, reportType, categoryLabel }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 shadow-sm">
      <div className="text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <h2 className="text-[15px] sm:text-[17px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
            {SCHOOL_INFO.name}
          </h2>
        </div>
        <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{SCHOOL_INFO.address}</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[11px] font-bold text-amber-700 dark:text-amber-400">
            Session: {session}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[11px] font-bold text-blue-700 dark:text-blue-400">
            <Tag className="w-3 h-3" />{categoryLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 text-[11px] font-bold text-violet-700 dark:text-violet-400">
            {reportType === '1' ? 'Installment Wise' : 'Head Wise'}
          </span>
        </div>
        <p className="mt-2 text-[12px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
          Concession Group Report
        </p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE — INSTALLMENT WISE ─────────────────────────────────────────

function InstallmentTable({ data }) {
  const grandTotals = useMemo(() => ({
    students:    data.reduce((s, r) => s + r.students, 0),
    totalGross:  data.reduce((s, r) => s + r.totalGross, 0),
    totalConc:   data.reduce((s, r) => s + r.totalConc, 0),
    totalNet:    data.reduce((s, r) => s + r.totalNet, 0),
    byInst: INSTALLMENTS.reduce((acc, ins) => {
      acc[ins] = {
        gross:      data.reduce((s, r) => s + r.installments[ins].gross, 0),
        concession: data.reduce((s, r) => s + r.installments[ins].concession, 0),
        net:        data.reduce((s, r) => s + r.installments[ins].net, 0),
      }
      return acc
    }, {}),
  }), [data])

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] text-[12px]">
        <thead>
          {/* Top header: Installment groups */}
          <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
            <th rowSpan={2} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-[rgba(99,102,241,0.1)] w-10">S.No</th>
            <th rowSpan={2} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-[rgba(99,102,241,0.1)] min-w-[120px]">Class</th>
            <th rowSpan={2} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-[rgba(99,102,241,0.1)]">Students</th>
            {INSTALLMENTS.map(ins => (
              <th key={ins} colSpan={3} className="px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 border-r border-b border-slate-200 dark:border-[rgba(99,102,241,0.1)] bg-blue-50/60 dark:bg-blue-500/5">
                {ins}
              </th>
            ))}
            <th colSpan={3} className="px-3 py-2 text-center text-[11px] font-bold uppercase tracking-wide text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-500/5 border-b border-slate-200 dark:border-[rgba(99,102,241,0.1)]">Total</th>
          </tr>
          <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
            {[...INSTALLMENTS, 'TOTAL'].map(ins => (
              ['Gross', 'Conc.', 'Net'].map((sub, j) => (
                <th key={`${ins}-${sub}`} className={`px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide whitespace-nowrap
                  ${j === 2 ? 'border-r border-slate-200 dark:border-[rgba(99,102,241,0.1)]' : ''}
                  ${ins === 'TOTAL'
                    ? sub === 'Gross' ? 'text-slate-500' : sub === 'Conc.' ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'
                    : sub === 'Gross' ? 'text-slate-500' : sub === 'Conc.' ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {sub}
                </th>
              ))
            )).flat()}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const { fg, bg } = classColor(row.class)
            return (
              <tr key={row.class} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-2.5 text-center text-[11px] text-slate-400 dark:text-slate-500 tabular-nums border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)]">{i + 1}</td>
                <td className="px-3 py-2.5 border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: bg, color: fg }}>{classAbbr(row.class)}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-300 tabular-nums border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)]">{row.students}</td>
                {INSTALLMENTS.map(ins => (
                  ['gross', 'concession', 'net'].map((key, j) => (
                    <td key={`${ins}-${key}`} className={`px-2 py-2.5 text-right tabular-nums text-[12px]
                      ${j === 2 ? 'border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)]' : ''}
                      ${key === 'concession' ? 'text-rose-600 dark:text-rose-400' : key === 'net' ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
                      {fmt(row.installments[ins][key])}
                    </td>
                  ))
                )).flat()}
                <td className="px-2 py-2.5 text-right tabular-nums text-[12px] text-slate-500 dark:text-slate-400">{fmt(row.totalGross)}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-[12px] text-rose-600 dark:text-rose-400">{fmt(row.totalConc)}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-[13px] font-bold text-emerald-700 dark:text-emerald-400">{fmt(row.totalNet)}</td>
              </tr>
            )
          })}
          {/* Grand Total */}
          <tr className="border-t-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07]">
            <td className="px-3 py-3 text-center text-[11px] text-blue-500 border-r border-blue-200 dark:border-indigo-500/20">—</td>
            <td className="px-3 py-3 border-r border-blue-200 dark:border-indigo-500/20">
              <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Grand Total
              </span>
            </td>
            <td className="px-3 py-3 text-center font-bold text-blue-700 dark:text-blue-300 tabular-nums border-r border-blue-200 dark:border-indigo-500/20">{grandTotals.students}</td>
            {INSTALLMENTS.map(ins => (
              ['gross', 'concession', 'net'].map((key, j) => (
                <td key={`gt-${ins}-${key}`} className={`px-2 py-3 text-right tabular-nums font-bold text-[12px]
                  ${j === 2 ? 'border-r border-blue-200 dark:border-indigo-500/20' : ''}
                  ${key === 'concession' ? 'text-rose-600 dark:text-rose-400' : key === 'net' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {fmt(grandTotals.byInst[ins][key])}
                </td>
              ))
            )).flat()}
            <td className="px-2 py-3 text-right tabular-nums font-bold text-[12px] text-slate-600 dark:text-slate-300">{fmt(grandTotals.totalGross)}</td>
            <td className="px-2 py-3 text-right tabular-nums font-bold text-[12px] text-rose-600 dark:text-rose-400">{fmt(grandTotals.totalConc)}</td>
            <td className="px-2 py-3 text-right tabular-nums font-bold text-[13px] text-emerald-700 dark:text-emerald-300">{fmt(grandTotals.totalNet)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── DESKTOP TABLE — HEAD WISE ─────────────────────────────────────────────────

function HeadWiseTable({ data }) {
  const grandTotals = useMemo(() => ({
    students:   data.reduce((s, r) => s + r.students, 0),
    totalGross: data.reduce((s, r) => s + r.totalGross, 0),
    totalConc:  data.reduce((s, r) => s + r.totalConc, 0),
    totalNet:   data.reduce((s, r) => s + r.totalNet, 0),
    byHead: FEE_HEADS.reduce((acc, h) => {
      acc[h] = {
        gross:      data.reduce((s, r) => s + r.heads[h].gross, 0),
        concession: data.reduce((s, r) => s + r.heads[h].concession, 0),
        net:        data.reduce((s, r) => s + r.heads[h].net, 0),
      }
      return acc
    }, {}),
  }), [data])

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1000px] text-[12px]">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
            <th rowSpan={2} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-[rgba(99,102,241,0.1)] w-10">S.No</th>
            <th rowSpan={2} className="px-3 py-2.5 text-left text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-[rgba(99,102,241,0.1)] min-w-[110px]">Class</th>
            <th rowSpan={2} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-[rgba(99,102,241,0.1)]">Students</th>
            {FEE_HEADS.map(h => (
              <th key={h} colSpan={3} className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-wide text-indigo-700 dark:text-indigo-400 border-r border-b border-slate-200 dark:border-[rgba(99,102,241,0.1)] bg-indigo-50/60 dark:bg-indigo-500/5">
                {h}
              </th>
            ))}
            <th colSpan={3} className="px-2 py-2 text-center text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400 bg-emerald-50/60 dark:bg-emerald-500/5 border-b border-slate-200">Total</th>
          </tr>
          <tr className="bg-slate-50 dark:bg-white/[0.02] border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)]">
            {[...FEE_HEADS, 'TOTAL'].map(h => (
              ['Gross', 'Conc.', 'Net'].map((sub, j) => (
                <th key={`${h}-${sub}`} className={`px-2 py-2 text-center text-[10px] font-bold uppercase whitespace-nowrap
                  ${j === 2 ? 'border-r border-slate-200 dark:border-[rgba(99,102,241,0.1)]' : ''}
                  ${sub === 'Conc.' ? 'text-rose-500' : sub === 'Net' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                  {sub}
                </th>
              ))
            )).flat()}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const { fg, bg } = classColor(row.class)
            return (
              <tr key={row.class} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-3 py-2.5 text-center text-[11px] text-slate-400 border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)]">{i + 1}</td>
                <td className="px-3 py-2.5 border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)]">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-bold flex-shrink-0" style={{ background: bg, color: fg }}>{classAbbr(row.class)}</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.class}</span>
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center font-semibold text-slate-600 dark:text-slate-300 border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)]">{row.students}</td>
                {FEE_HEADS.map(h => (
                  ['gross', 'concession', 'net'].map((key, j) => (
                    <td key={`${h}-${key}`} className={`px-2 py-2.5 text-right tabular-nums text-[12px]
                      ${j === 2 ? 'border-r border-slate-100 dark:border-[rgba(99,102,241,0.07)]' : ''}
                      ${key === 'concession' ? 'text-rose-600 dark:text-rose-400' : key === 'net' ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      {fmt(row.heads[h][key])}
                    </td>
                  ))
                )).flat()}
                <td className="px-2 py-2.5 text-right tabular-nums text-[12px] text-slate-500">{fmt(row.totalGross)}</td>
                <td className="px-2 py-2.5 text-right tabular-nums text-[12px] text-rose-600 dark:text-rose-400">{fmt(row.totalConc)}</td>
                <td className="px-2 py-2.5 text-right tabular-nums font-bold text-[13px] text-emerald-700 dark:text-emerald-400">{fmt(row.totalNet)}</td>
              </tr>
            )
          })}
          {/* Grand Total */}
          <tr className="border-t-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07]">
            <td className="px-3 py-3 text-center text-[11px] text-blue-500 border-r border-blue-200 dark:border-indigo-500/20">—</td>
            <td className="px-3 py-3 border-r border-blue-200 dark:border-indigo-500/20">
              <span className="text-[12px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" /> Grand Total
              </span>
            </td>
            <td className="px-3 py-3 text-center font-bold text-blue-700 dark:text-blue-300 border-r border-blue-200 dark:border-indigo-500/20">{grandTotals.students}</td>
            {FEE_HEADS.map(h => (
              ['gross', 'concession', 'net'].map((key, j) => (
                <td key={`gt-${h}-${key}`} className={`px-2 py-3 text-right tabular-nums font-bold text-[12px]
                  ${j === 2 ? 'border-r border-blue-200 dark:border-indigo-500/20' : ''}
                  ${key === 'concession' ? 'text-rose-600 dark:text-rose-400' : key === 'net' ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300'}`}>
                  {fmt(grandTotals.byHead[h][key])}
                </td>
              ))
            )).flat()}
            <td className="px-2 py-3 text-right tabular-nums font-bold text-[12px] text-slate-600 dark:text-slate-300">{fmt(grandTotals.totalGross)}</td>
            <td className="px-2 py-3 text-right tabular-nums font-bold text-[12px] text-rose-600 dark:text-rose-400">{fmt(grandTotals.totalConc)}</td>
            <td className="px-2 py-3 text-right tabular-nums font-bold text-[13px] text-emerald-700 dark:text-emerald-300">{fmt(grandTotals.totalNet)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE CARD — INSTALLMENT WISE ───────────────────────────────────────────

function MobileInstallmentCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  const concPct = row.totalGross ? Math.round((row.totalConc / row.totalGross) * 100) : 0

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button type="button" onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: bg, color: fg }}>
          {classAbbr(row.class)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.class}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {row.students} students · Conc: <span className="text-rose-500 font-semibold">{fmtCurr(row.totalConc)}</span>
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[16px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{fmtCurr(row.totalNet)}</p>
          <p className="text-[10px] text-slate-400">net amount</p>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {/* Concession progress */}
      <div className="px-4 pb-3">
        <div className="flex text-[10px] font-semibold justify-between mb-1">
          <span className="text-rose-500">Concession {concPct}%</span>
          <span className="text-emerald-600 dark:text-emerald-400">Gross: {fmtCurr(row.totalGross)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-rose-400 transition-all duration-500" style={{ width: `${concPct}%` }} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {INSTALLMENTS.map(ins => {
            const d = row.installments[ins]
            return (
              <div key={ins} className="rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
                <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-2">{ins}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[13px] font-bold text-slate-600 dark:text-slate-300 tabular-nums">{fmtCurr(d.gross)}</p>
                    <p className="text-[10px] text-slate-400">Gross</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">{fmtCurr(d.concession)}</p>
                    <p className="text-[10px] text-slate-400">Conc.</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{fmtCurr(d.net)}</p>
                    <p className="text-[10px] text-slate-400">Net</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── MOBILE CARD — HEAD WISE ───────────────────────────────────────────────────

function MobileHeadWiseCard({ row }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  const concPct = row.totalGross ? Math.round((row.totalConc / row.totalGross) * 100) : 0

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button type="button" onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: bg, color: fg }}>
          {classAbbr(row.class)}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.class}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {row.students} students · Conc: <span className="text-rose-500 font-semibold">{fmtCurr(row.totalConc)}</span>
          </p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-[16px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{fmtCurr(row.totalNet)}</p>
          <p className="text-[10px] text-slate-400">net amount</p>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      <div className="px-4 pb-3">
        <div className="flex text-[10px] font-semibold justify-between mb-1">
          <span className="text-rose-500">Concession {concPct}%</span>
          <span className="text-emerald-600 dark:text-emerald-400">Gross: {fmtCurr(row.totalGross)}</span>
        </div>
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div className="h-full rounded-full bg-rose-400 transition-all duration-500" style={{ width: `${concPct}%` }} />
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-1 gap-2">
            {FEE_HEADS.map(h => {
              const d = row.heads[h]
              return (
                <div key={h} className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-3 py-2.5">
                  <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 min-w-[90px]">{h}</span>
                  <div className="flex gap-4 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">{fmtCurr(d.gross)}</p>
                      <p className="text-[9px] text-slate-400">Gross</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-semibold text-rose-600 dark:text-rose-400 tabular-nums">{fmtCurr(d.concession)}</p>
                      <p className="text-[9px] text-slate-400">Conc.</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">{fmtCurr(d.net)}</p>
                      <p className="text-[9px] text-slate-400">Net</p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE GRAND TOTAL ────────────────────────────────────────────────────────

function MobileGrandTotal({ data, reportType }) {
  const totals = useMemo(() => ({
    students:   data.reduce((s, r) => s + r.students, 0),
    totalGross: data.reduce((s, r) => s + r.totalGross, 0),
    totalConc:  data.reduce((s, r) => s + r.totalConc, 0),
    totalNet:   data.reduce((s, r) => s + r.totalNet, 0),
  }), [data])

  const concPct = totals.totalGross ? Math.round((totals.totalConc / totals.totalGross) * 100) : 0

  return (
    <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" /> Grand Total — {data.length} Classes
      </p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
          <p className="text-[20px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{totals.students}</p>
          <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Students</p>
        </div>
        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
          <p className="text-[20px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">{fmtCurr(totals.totalGross)}</p>
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Gross Amount</p>
        </div>
        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
          <p className="text-[20px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">{fmtCurr(totals.totalConc)}</p>
          <p className="text-[10px] font-semibold text-rose-500 dark:text-rose-400">Total Concession</p>
        </div>
        <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
          <p className="text-[20px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{fmtCurr(totals.totalNet)}</p>
          <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Net Payable</p>
        </div>
      </div>
      <div>
        <div className="flex text-[10px] font-semibold justify-between mb-1">
          <span className="text-rose-500">Concession {concPct}%</span>
          <span className="text-emerald-600 dark:text-emerald-400">Net {100 - concPct}%</span>
        </div>
        <div className="h-2 rounded-full bg-emerald-200 dark:bg-emerald-500/20 overflow-hidden">
          <div className="h-full rounded-full bg-rose-400 transition-all duration-500" style={{ width: `${concPct}%` }} />
        </div>
      </div>
    </div>
  )
}

// ─── FILTER DRAWER (MOBILE) ────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors }) {
  if (!open) return null
  const groupOptions = [{ value: '1', label: 'Main Group' }, { value: '2', label: 'Sub Group' }]
  const reportOptions = [{ value: '1', label: 'Installment Wise' }, { value: '2', label: 'Head Wise' }]
  const categories = filters.groupType === '2' ? SUB_GROUPS : MAIN_GROUPS

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}>
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Report Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => setFilters(p => ({ ...p, session: e.target.value }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <RadioGroup label="Group Type" options={groupOptions} value={filters.groupType}
            onChange={v => setFilters(p => ({ ...p, groupType: v, category: '' }))} />
          <Field label="Select Category" error={errors.category} required>
            <NativeSelect value={filters.category} onChange={e => setFilters(p => ({ ...p, category: e.target.value }))} placeholder="-- Select Category --" error={errors.category}>
              {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </NativeSelect>
          </Field>
          <RadioGroup label="Report Type" options={reportOptions} value={filters.reportType}
            onChange={v => setFilters(p => ({ ...p, reportType: v }))} />
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function ConcessionGroupReport() {
  const [filters, setFilters] = useState({ session: '', groupType: '1', category: '', reportType: '1' })
  const [applied, setApplied] = useState(null)     // what was shown (frozen copy)
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,  setSearch]  = useState('')
  const [errors,  setErrors]  = useState({})
  const [toast,   setToast]   = useState(null)
  const [shown,   setShown]   = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const groupOptions   = [{ value: '1', label: 'Main Group' }, { value: '2', label: 'Sub Group' }]
  const reportOptions  = [{ value: '1', label: 'Installment Wise' }, { value: '2', label: 'Head Wise' }]
  const categories     = filters.groupType === '2' ? SUB_GROUPS : MAIN_GROUPS

  // ── Validate + Fetch ─────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session)  err.session  = 'Please select a session'
    if (!filters.category) err.category = 'Please select a category'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = filters.reportType === '1'
        ? generateInstallmentData(filters.session, filters.category)
        : generateHeadWiseData(filters.session, filters.category)
      setRows(data)
      setApplied({ ...filters })
      setShown(true)
      setLoading(false)
      const catLabel = [...MAIN_GROUPS, ...SUB_GROUPS].find(g => g.value === filters.category)?.label
      showToast(`Loaded ${data.length} class records — ${catLabel}.`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', groupType: '1', category: '', reportType: '1' })
    setRows([]); setSearch(''); setErrors({}); setShown(false); setApplied(null)
  }

  const handleExcel = () => {
    if (!shown || rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r => r.class.toLowerCase().includes(q))
  }, [rows, search])

  // ── Summary totals ────────────────────────────────────────────────────────────
  const totals = useMemo(() => ({
    students:   filtered.reduce((s, r) => s + r.students, 0),
    totalGross: filtered.reduce((s, r) => s + r.totalGross, 0),
    totalConc:  filtered.reduce((s, r) => s + r.totalConc, 0),
    totalNet:   filtered.reduce((s, r) => s + r.totalNet, 0),
  }), [filtered])

  const hasResults   = shown && rows.length > 0
  const categoryLabel = applied
    ? ([...MAIN_GROUPS, ...SUB_GROUPS].find(g => g.value === applied.category)?.label ?? '—')
    : '—'

  const activeFilterCount = [filters.session, filters.category].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BadgePercent className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Concession Group Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Class-wise concession breakdown — installment or head wise.
          </p>
        </div>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ───────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-x-5 gap-y-4 items-start">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Group Type */}
            <RadioGroup label="Group Type" options={groupOptions} value={filters.groupType}
              onChange={v => setFilters(p => ({ ...p, groupType: v, category: '' }))} />

            {/* Category */}
            <Field label="Select Category" error={errors.category} required>
              <NativeSelect value={filters.category}
                onChange={e => { setFilters(p => ({ ...p, category: e.target.value })); setErrors(p => ({ ...p, category: undefined })) }}
                placeholder="-- Select Category --" error={errors.category}>
                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Report Type */}
            <RadioGroup label="Report Type" options={reportOptions} value={filters.reportType}
              onChange={v => setFilters(p => ({ ...p, reportType: v }))} />
          </div>

          {/* Action row */}
          <div className="flex items-center gap-3 mt-5 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button type="button" onClick={handleShow} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report
            </button>
            <button type="button" onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {filters.session ? `${filters.session}` : 'Select Filters'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {hasResults && (
          <>
            <button type="button" onClick={handleExcel} disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
            <button type="button" onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} setFilters={setFilters}
        onShow={handleShow} loading={loading} errors={errors} />

      {/* ── Loading Skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}
          </div>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.1 }} />
          ))}
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={applied.session} categoryLabel={categoryLabel}
            groupLabel={applied.groupType === '1' ? 'Main Group' : 'Sub Group'}
            reportType={applied.reportType} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}       label="Total Students"    value={totals.students.toLocaleString()}    color="blue"    />
            <SummaryCard icon={IndianRupee} label="Gross Amount"      value={fmtCurr(totals.totalGross)}          color="amber"   />
            <SummaryCard icon={Percent}     label="Total Concession"  value={fmtCurr(totals.totalConc)}           color="rose"    />
            <SummaryCard icon={Receipt}     label="Net Payable"       value={fmtCurr(totals.totalNet)}            color="emerald" />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                  {applied.reportType === '1' ? 'Installment Wise' : 'Head Wise'} Concession
                </span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {categoryLabel}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} class{filtered.length !== 1 ? 'es' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-48 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search class…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400" />
                {search && (
                  <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info strip */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                <span className="text-slate-500 dark:text-slate-400">Conc.</span> = Concession Amount &nbsp;|&nbsp;
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Net</span> = Gross − Concession &nbsp;|&nbsp;
                Scroll right for all {applied.reportType === '1' ? 'installments' : 'fee heads'}
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : applied.reportType === '1' ? (
                <InstallmentTable data={filtered} />
              ) : (
                <HeadWiseTable data={filtered} />
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
                    Tap a card to see {applied.reportType === '1' ? 'installment' : 'head-wise'} breakdown.
                  </p>
                  {filtered.map(row =>
                    applied.reportType === '1'
                      ? <MobileInstallmentCard key={row.class} row={row} />
                      : <MobileHeadWiseCard    key={row.class} row={row} />
                  )}
                  <MobileGrandTotal data={filtered} reportType={applied.reportType} />
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> classes
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

      {/* ── Empty State ────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BadgePercent className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select session, group type, category &amp; report type, then click <strong>Show Report</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
