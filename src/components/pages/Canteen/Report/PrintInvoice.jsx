/**
 * PrintInvoice.jsx
 * Folder: src/pages/Reports/Tuckshop/PrintInvoice.jsx
 *
 * Converts legacy ASPX "Print Invoice" (Tuckshop) to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session / Class / Section / Student cascading dropdowns
 *  - Show report button with validation
 *  - Invoice preview panel (mimics RDLC report)
 *  - Mobile: stacked filters + card-style invoice
 *  - Desktop: horizontal filter bar + full invoice table
 *  - Print button, loading states, toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  ChevronDown, AlertCircle, X, Check, Loader2,
  Printer, RefreshCw, Eye, Filter,
  SlidersHorizontal, ShoppingCart, Receipt,
  User, BookOpen, School2, Building2,
  MapPin, Calendar, Hash, Package,
  ChevronRight, FileText, Utensils,
  TrendingUp, IndianRupee, Download
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
  phone: '+91-135-2710XXX',
}

const CLASSES = ['Nursery', 'LKG', 'UKG', 'Class I', 'Class II', 'Class III',
  'Class IV', 'Class V', 'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII']

const SECTIONS_MAP = {
  'Nursery': ['A', 'B'], 'LKG': ['A', 'B'], 'UKG': ['A', 'B'],
  'Class I': ['A', 'B'], 'Class II': ['A', 'B'], 'Class III': ['A'],
  'Class IV': ['A'], 'Class V': ['A'], 'Class VI': ['A', 'B'],
  'Class VII': ['A'], 'Class VIII': ['A'], 'Class IX': ['A', 'B'],
  'Class X': ['A'], 'Class XI': ['A', 'B'], 'Class XII': ['A', 'B'],
}

const STUDENTS_MAP = {
  'Nursery-A': [
    { id: '1001', name: 'Aarav Sharma' }, { id: '1002', name: 'Priya Singh' },
    { id: '1003', name: 'Rohan Gupta' }, { id: '1004', name: 'Ananya Verma' },
  ],
  'Nursery-B': [
    { id: '1005', name: 'Kavya Patel' }, { id: '1006', name: 'Dev Joshi' },
  ],
  'Class VI-A': [
    { id: '2001', name: 'Arjun Mehta' }, { id: '2002', name: 'Sneha Rawat' },
    { id: '2003', name: 'Vikram Negi' }, { id: '2004', name: 'Pooja Bisht' },
    { id: '2005', name: 'Rahul Thakur' },
  ],
  'Class IX-A': [
    { id: '3001', name: 'Aditya Kumar' }, { id: '3002', name: 'Riya Chauhan' },
    { id: '3003', name: 'Siddharth Jain' },
  ],
  'Class XI-A': [
    { id: '4001', name: 'Harsh Vardhan' }, { id: '4002', name: 'Swati Pandey' },
    { id: '4003', name: 'Nikhil Rana' },
  ],
}

// Dummy invoice data generator
const generateInvoice = (studentId, studentName, cls, section, session) => {
  const items = [
    { sno: 1, item: 'Sandwich (Veg)', qty: 5, rate: 25, amount: 125 },
    { sno: 2, item: 'Milk (200ml)', qty: 10, rate: 15, amount: 150 },
    { sno: 3, item: 'Fruit Bowl', qty: 3, rate: 40, amount: 120 },
    { sno: 4, item: 'Juice (Apple)', qty: 4, rate: 30, amount: 120 },
    { sno: 5, item: 'Biscuits Pack', qty: 6, rate: 20, amount: 120 },
  ]
  const total = items.reduce((s, i) => s + i.amount, 0)
  const invoiceNo = `TK-${session.replace('-', '')}-${studentId}`
  const date = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  return { invoiceNo, date, studentId, studentName, cls, section, session, items, total }
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
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
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
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

// ─── SCHOOL INVOICE HEADER ────────────────────────────────────────────────────
function InvoiceHeader({ invoice }) {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)]
      bg-gradient-to-r from-blue-50 via-white to-indigo-50
      dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35]
      px-5 py-5 text-center shadow-sm mb-4">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-100 dark:bg-orange-500/15 border border-orange-200 dark:border-orange-500/25 mt-1">
        <Utensils className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
        <span className="text-[12px] font-bold text-orange-700 dark:text-orange-400">Tuckshop Invoice</span>
      </div>
    </div>
  )
}

// ─── INVOICE META CARD ────────────────────────────────────────────────────────
function InvoiceMetaGrid({ invoice }) {
  const fields = [
    { icon: Hash,     label: 'Invoice No.',   value: invoice.invoiceNo,    color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { icon: Calendar, label: 'Date',          value: invoice.date,         color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800' },
    { icon: User,     label: 'Student Name',  value: invoice.studentName,  color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: Hash,     label: 'Student ID',    value: invoice.studentId,    color: 'text-slate-600 dark:text-slate-300', bg: 'bg-slate-50 dark:bg-slate-800' },
    { icon: BookOpen, label: 'Class',         value: invoice.cls,          color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { icon: School2,  label: 'Section',       value: `Section ${invoice.section}`, color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { icon: Calendar, label: 'Session',       value: invoice.session,      color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-50 dark:bg-amber-500/10' },
  ]
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
      {fields.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className={`rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] ${bg} px-3 py-2.5 flex items-start gap-2`}>
          <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${color}`} />
          <div className="min-w-0">
            <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide truncate">{label}</p>
            <p className={`text-[13px] font-bold truncate ${color}`}>{value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── INVOICE ITEMS TABLE (DESKTOP) ───────────────────────────────────────────
function InvoiceDesktopTable({ items, total }) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] mb-4">
      <table className="w-full">
        <thead>
          <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-200 dark:border-[rgba(99,102,241,0.1)]">
            {['S.No.', 'Item Name', 'Qty', 'Rate (₹)', 'Amount (₹)'].map((h, i) => (
              <th key={i}
                className="px-4 py-3 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                  first:text-center last:text-right"
                style={{ textAlign: i === 0 ? 'center' : i >= 2 ? 'right' : 'left' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.sno}
              className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
              <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
                {item.sno}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <Package className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                  </span>
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{item.item}</span>
                </div>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[12px] font-semibold
                  bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 tabular-nums">
                  {item.qty}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="text-[13px] font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                  ₹{item.rate.toFixed(2)}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold
                  bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
                  ₹{item.amount.toFixed(2)}
                </span>
              </td>
            </tr>
          ))}
          {/* Total row */}
          <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
            <td colSpan={3} />
            <td className="px-4 py-3 text-right">
              <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center justify-end gap-1.5">
                <TrendingUp className="w-4 h-4" /> Grand Total
              </span>
            </td>
            <td className="px-4 py-3 text-right">
              <span className="inline-flex items-center justify-center px-3 py-1.5 rounded-xl text-[15px] font-bold
                bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
                ₹{total.toFixed(2)}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// ─── INVOICE ITEMS CARDS (MOBILE) ────────────────────────────────────────────
function InvoiceMobileItems({ items, total }) {
  return (
    <div className="md:hidden space-y-2 mb-4">
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-2 flex items-center gap-1.5">
        <ShoppingCart className="w-3.5 h-3.5" /> Items Purchased
      </p>
      {items.map((item) => (
        <div key={item.sno}
          className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] px-4 py-3 flex items-center gap-3 shadow-sm">
          <span className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <Package className="w-4 h-4 text-orange-500 dark:text-orange-400" />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{item.item}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {item.qty} × ₹{item.rate}
            </p>
          </div>
          <span className="text-[15px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums flex-shrink-0">
            ₹{item.amount}
          </span>
        </div>
      ))}
      {/* Mobile Total */}
      <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] px-4 py-3 flex items-center justify-between">
        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" /> Grand Total
        </span>
        <span className="text-[18px] font-extrabold text-blue-800 dark:text-blue-200 tabular-nums">
          ₹{total.toFixed(2)}
        </span>
      </div>
    </div>
  )
}

// ─── INVOICE PANEL ────────────────────────────────────────────────────────────
function InvoicePanel({ invoice, onPrint }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Panel header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5
        border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]
        bg-slate-50/70 dark:bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <span className="w-1 h-5 rounded-full bg-orange-500 flex-shrink-0" />
          <Receipt className="w-4 h-4 text-orange-600 dark:text-orange-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Invoice Preview</span>
          <span className="hidden sm:inline text-[12px] text-slate-400 dark:text-slate-500">· {invoice.invoiceNo}</span>
        </div>
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
            bg-orange-500 hover:bg-orange-600 text-white shadow-md shadow-orange-500/20 transition-all active:scale-95">
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Print Invoice</span>
          <span className="sm:hidden">Print</span>
        </button>
      </div>

      <div className="p-4 sm:p-5">
        {/* School header */}
        <InvoiceHeader invoice={invoice} />
        {/* Meta info */}
        <InvoiceMetaGrid invoice={invoice} />
        {/* Items table — desktop */}
        <InvoiceDesktopTable items={invoice.items} total={invoice.total} />
        {/* Items cards — mobile */}
        <InvoiceMobileItems items={invoice.items} total={invoice.total} />
        {/* Footer note */}
        <div className="flex items-start gap-2 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-4 py-3">
          <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-amber-700 dark:text-amber-300">
            This is a computer-generated invoice. No signature required.
            For queries, contact the school tuckshop office.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors, students }) {
  if (!open) return null
  const { session, cls, section, studentId } = filters
  const sections = cls ? (SECTIONS_MAP[cls] || []) : []

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35]
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}>
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-orange-500" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setFilters(p => ({ ...p, session: e.target.value, cls: '', section: '', studentId: '' }))} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.cls} required>
            <NativeSelect value={cls} onChange={e => setFilters(p => ({ ...p, cls: e.target.value, section: '', studentId: '' }))} placeholder="-- Select Class --" error={errors.cls}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Section" error={errors.section} required>
            <NativeSelect value={section} onChange={e => setFilters(p => ({ ...p, section: e.target.value, studentId: '' }))} placeholder="-- Select Section --" error={errors.section} disabled={!cls}>
              {sections.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Student" error={errors.studentId} required>
            <NativeSelect value={studentId} onChange={e => setFilters(p => ({ ...p, studentId: e.target.value }))} placeholder="-- Select Student --" error={errors.studentId} disabled={!section}>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700
              hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-orange-500 hover:bg-orange-600 disabled:opacity-70 transition-all shadow-md shadow-orange-500/20">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Invoice
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PrintInvoice() {
  const [filters, setFilters] = useState({ session: '', cls: '', section: '', studentId: '' })
  const [invoice, setInvoice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [toast, setToast] = useState(null)
  const [shown, setShown] = useState(false)

  const { session, cls, section, studentId } = filters

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Cascaded students list
  const students = useMemo(() => {
    const key = `${cls}-${section}`
    return STUDENTS_MAP[key] || []
  }, [cls, section])

  const sections = useMemo(() => cls ? (SECTIONS_MAP[cls] || []) : [], [cls])

  // Validation
  const validate = () => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (!cls) err.cls = 'Please select a class'
    if (!section) err.section = 'Please select a section'
    if (!studentId) err.studentId = 'Please select a student'
    setErrors(err)
    return Object.keys(err).length === 0
  }

  const handleShow = useCallback(() => {
    if (!validate()) return
    setLoading(true)
    setTimeout(() => {
      const student = students.find(s => s.id === studentId)
      if (!student) {
        showToast('Student not found.', 'error')
        setLoading(false)
        return
      }
      const inv = generateInvoice(student.id, student.name, cls, section, session)
      setInvoice(inv)
      setShown(true)
      setLoading(false)
      showToast(`Invoice generated for ${student.name}.`)
    }, 700)
  }, [filters, students])

  const handleReset = () => {
    setFilters({ session: '', cls: '', section: '', studentId: '' })
    setInvoice(null)
    setShown(false)
    setErrors({})
  }

  const handlePrint = () => {
    showToast('Sending to printer…')
    setTimeout(() => window.print?.(), 300)
  }

  // Count active filters for mobile badge
  const activeCount = [session, cls, section, studentId].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-orange-500" />
            Print Invoice
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Generate &amp; print tuckshop invoices for individual students.
          </p>
        </div>
        {/* Breadcrumb */}
        <nav className="hidden sm:flex items-center gap-1 text-[12px] text-slate-400 dark:text-slate-500 flex-shrink-0 mt-1">
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3 h-3" />
          <span className="hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer transition-colors">Tuckshop</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-orange-500 dark:text-orange-400 font-semibold">Print Invoice</span>
        </nav>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-orange-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-orange-500 dark:text-orange-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setFilters(p => ({ ...p, session: e.target.value, cls: '', section: '', studentId: '' })); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select --"
                error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.cls} required>
              <NativeSelect
                value={cls}
                onChange={e => { setFilters(p => ({ ...p, cls: e.target.value, section: '', studentId: '' })); setErrors(p => ({ ...p, cls: undefined })) }}
                placeholder="-- Select --"
                error={errors.cls}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Section */}
            <Field label="Section" error={errors.section} required>
              <NativeSelect
                value={section}
                onChange={e => { setFilters(p => ({ ...p, section: e.target.value, studentId: '' })); setErrors(p => ({ ...p, section: undefined })) }}
                placeholder="-- Select --"
                error={errors.section}
                disabled={!cls}>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Student */}
            <Field label="Student" error={errors.studentId} required>
              <NativeSelect
                value={studentId}
                onChange={e => { setFilters(p => ({ ...p, studentId: e.target.value })); setErrors(p => ({ ...p, studentId: undefined })) }}
                placeholder="-- Select --"
                error={errors.studentId}
                disabled={!section}>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Actions */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
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
            bg-orange-500 text-white shadow-md shadow-orange-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeCount > 0 ? `${activeCount} filter${activeCount > 1 ? 's' : ''} selected` : 'Select Filters'}
          {activeCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeCount}</span>
          )}
        </button>
        {shown && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile show button — appears below filter bar if filters selected */}
      {activeCount === 4 && !shown && !loading && (
        <button type="button" onClick={handleShow}
          className="sm:hidden w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-semibold
            text-white bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/20 transition-all">
          <Eye className="w-4 h-4" />
          Show Invoice
        </button>
      )}

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilters={setFilters}
        onShow={handleShow}
        loading={loading}
        errors={errors}
        students={students}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ))}
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
              style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Invoice Panel ──────────────────────────────────────────────────── */}
      {shown && invoice && !loading && (
        <InvoicePanel invoice={invoice} onPrint={handlePrint} />
      )}

      {/* ── Empty State ────────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-orange-400 dark:text-orange-500 opacity-70" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No invoice generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Select a <strong>session</strong>, <strong>class</strong>, <strong>section</strong> and <strong>student</strong>, then click <strong>Show</strong> to preview the invoice.
            </p>
          </div>
          {/* Quick hint steps */}
          <div className="flex flex-col sm:flex-row items-center gap-2 mt-2">
            {['Session', 'Class', 'Section', 'Student'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a1f35]
                  border border-slate-200 dark:border-[rgba(99,102,241,0.15)] shadow-sm">
                  <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-500/15 text-orange-600 dark:text-orange-400
                    text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{step}</span>
                </div>
                {i < 3 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:block" />}
              </div>
            ))}
            <div className="flex items-center gap-2">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 hidden sm:block" />
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10
                border border-orange-200 dark:border-orange-500/25 shadow-sm">
                <Eye className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400" />
                <span className="text-[12px] font-semibold text-orange-600 dark:text-orange-400">Show</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
