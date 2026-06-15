/**
 * HostelFees.jsx
 * Folder: src/pages/Hostel/HostelFees.jsx
 *
 * Converts legacy ASPX "Hostel Fees" page to fully-responsive React + Tailwind.
 *
 * Workflow (same as legacy ASPX):
 *  - grdadd: editable grid -> Installment No (auto), Amount (input, auto-postback),
 *    Due Date (read-only/calculated). Footer shows running Total Fee.
 *  - "Save" button persists the installment plan.
 *  - grdrecord: read-only saved records table -> Installment No, Fee Type, Months, Due Date.
 *
 * Features:
 *  - Auto total calculation on amount change (TextChanged equivalent)
 *  - Save action -> pushes installments into saved records grid
 *  - Mobile: collapsible cards for both grids
 *  - Desktop: dense ERP-style tables
 *  - Loading + empty states, toast feedback
 */

import { useState, useMemo, useCallback } from 'react'
import {
  RefreshCw, Check, X, AlertCircle, Loader2,
  Plus, Trash2, Save, Wallet, CalendarDays,
  Receipt, ListChecks, Hash, IndianRupee,
  Layers, ChevronRight, Info, ClipboardList
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

// Pre-loaded installment plan editable in the top grid (grdadd equivalent)
const INITIAL_INSTALLMENTS = [
  { id: 1, installment_no: 1, amount: '', due_date: '15-Apr-2025' },
  { id: 2, installment_no: 2, amount: '', due_date: '15-Jul-2025' },
  { id: 3, installment_no: 3, amount: '', due_date: '15-Oct-2025' },
  { id: 4, installment_no: 4, amount: '', due_date: '15-Jan-2026' },
]

// Already-saved fee records (grdrecord equivalent)
const INITIAL_RECORDS = [
  { id: 101, installment_no: 1, fee_type: 'Hostel Fee', months: 'Apr - Jun 2025', due_date: '15-Apr-2025' },
  { id: 102, installment_no: 2, fee_type: 'Hostel Fee', months: 'Jul - Sep 2025', due_date: '15-Jul-2025' },
]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

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

// Section header bar — reused for both cards
function SectionHeader({ icon: Icon, title, subtitle, accent = 'blue', children }) {
  const accentMap = {
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
  }
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className={`w-1 h-5 rounded-full ${accentMap[accent]} flex-shrink-0`} />
        <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200 truncate">{title}</p>
          {subtitle && <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{subtitle}</p>}
        </div>
      </div>
      {children}
    </div>
  )
}

// ─── AMOUNT INPUT (replaces txtAmount TextBox with AutoPostBack) ──────────────
function AmountInput({ value, onChange, error }) {
  return (
    <div className="relative">
      <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      <input
        type="number"
        inputMode="decimal"
        min="0"
        value={value}
        onChange={onChange}
        placeholder="0.00"
        className={`w-full pl-7 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 tabular-nums
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      />
    </div>
  )
}

// ─── DESKTOP ROW — Installment Plan Grid (grdadd) ─────────────────────────────
function InstallmentDesktopRow({ row, onAmountChange, error }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[12px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
          {row.installment_no}
        </span>
      </td>
      <td className="px-4 py-3">
        <AmountInput
          value={row.amount}
          onChange={e => onAmountChange(row.id, e.target.value)}
          error={error}
        />
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.2)]">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[13px] text-slate-600 dark:text-slate-300">{row.due_date}</span>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD — Installment Plan Grid (grdadd) ─────────────────────────────
function InstallmentMobileCard({ row, onAmountChange, error }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-700 dark:text-slate-200">
          <span className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 tabular-nums">
            {row.installment_no}
          </span>
          Installment {row.installment_no}
        </span>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <CalendarDays className="w-3.5 h-3.5" />
          {row.due_date}
        </div>
      </div>
      <div>
        <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1 block">
          Amount
        </label>
        <AmountInput
          value={row.amount}
          onChange={e => onAmountChange(row.id, e.target.value)}
          error={error}
        />
      </div>
    </div>
  )
}

// ─── DESKTOP ROW — Saved Records Grid (grdrecord) ─────────────────────────────
function RecordDesktopRow({ row }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[12px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
          {row.installment_no}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.fee_type}</span>
      </td>
      <td className="px-4 py-3">
        <span className="text-[13px] text-slate-600 dark:text-slate-300">{row.months}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[13px] text-slate-600 dark:text-slate-300">{row.due_date}</span>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD — Saved Records Grid (grdrecord) ─────────────────────────────
function RecordMobileCard({ row }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[12px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 tabular-nums">
          {row.installment_no}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{row.fee_type}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{row.months}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">
          <CalendarDays className="w-3.5 h-3.5" />
          {row.due_date}
        </div>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function HostelFees() {
  const [installments, setInstallments] = useState(INITIAL_INSTALLMENTS)
  const [records,      setRecords]      = useState(INITIAL_RECORDS)
  const [saving,       setSaving]       = useState(false)
  const [toast,        setToast]        = useState(null)
  const [errors,       setErrors]       = useState({})

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Amount change handler (txtAmount_TextChanged equivalent) ──────────────
  const handleAmountChange = useCallback((id, value) => {
    setInstallments(prev =>
      prev.map(row => (row.id === id ? { ...row, amount: value } : row))
    )
    setErrors(prev => ({ ...prev, [id]: undefined }))
  }, [])

  // ── Total Fee (lbltotal equivalent) ────────────────────────────────────────
  const totalFee = useMemo(
    () => installments.reduce((sum, r) => sum + (parseFloat(r.amount) || 0), 0),
    [installments]
  )

  const filledCount = useMemo(
    () => installments.filter(r => r.amount !== '' && !isNaN(parseFloat(r.amount))).length,
    [installments]
  )

  // ── Save handler (btnsave_Click equivalent) ───────────────────────────────
  const handleSave = useCallback(() => {
    const newErrors = {}
    installments.forEach(row => {
      if (row.amount === '' || isNaN(parseFloat(row.amount)) || parseFloat(row.amount) <= 0) {
        newErrors[row.id] = 'Required'
      }
    })

    if (Object.keys(newErrors).length) {
      setErrors(newErrors)
      showToast('Please enter valid amount for all installments.', 'error')
      return
    }

    setErrors({})
    setSaving(true)

    // Simulate API call (placeholder for future binding)
    setTimeout(() => {
      const newRecords = installments.map(row => ({
        id: Date.now() + row.id,
        installment_no: row.installment_no,
        fee_type: 'Hostel Fee',
        months: `Installment ${row.installment_no}`,
        due_date: row.due_date,
      }))
      setRecords(newRecords)
      setSaving(false)
      showToast(`Hostel fee plan saved successfully. Total: ₹${totalFee.toLocaleString()}`)
    }, 700)
  }, [installments, totalFee])

  // ── Reset handler ──────────────────────────────────────────────────────────
  const handleReset = () => {
    setInstallments(INITIAL_INSTALLMENTS)
    setErrors({})
  }

  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumb / Page Title ─────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Hostel Fees
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Configure installment amounts and due dates, then save the fee plan.
          </p>
        </div>
      </div>

      {/* ── INSTALLMENT PLAN CARD (grdadd) ──────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <SectionHeader
          icon={ListChecks}
          title="Installment Plan"
          subtitle={`${filledCount} of ${installments.length} amounts entered`}
          accent="blue"
        >
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0 self-start sm:self-auto">
            {installments.length} Installments
          </span>
        </SectionHeader>

        {/* Info hint */}
        <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Enter the amount for each installment. The total fee updates automatically below.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                {['Installment No', 'Amount', 'Due Date'].map((h, i) => (
                  <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-32">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {installments.map(row => (
                <InstallmentDesktopRow
                  key={row.id}
                  row={row}
                  onAmountChange={handleAmountChange}
                  error={errors[row.id]}
                />
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                <td className="px-4 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                <td className="px-4 py-3" colSpan={2}>
                  <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                    <Receipt className="w-4 h-4" /> Total Fee:
                    <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[14px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 tabular-nums">
                      ₹{totalFee.toLocaleString()}
                    </span>
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {installments.map(row => (
            <InstallmentMobileCard
              key={row.id}
              row={row}
              onAmountChange={handleAmountChange}
              error={errors[row.id]}
            />
          ))}

          {/* Mobile Total */}
          <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4 flex items-center justify-between">
            <span className="text-[13px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 flex items-center gap-2">
              <Receipt className="w-4 h-4" /> Total Fee
            </span>
            <span className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">
              ₹{totalFee.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Footer actions (btnsave / btnsubmit equivalent) */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
              transition-all active:scale-95 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>

      {/* ── SAVED RECORDS CARD (grdrecord) ──────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <SectionHeader
          icon={ClipboardList}
          title="Saved Fee Records"
          subtitle="Installment-wise fee plan currently active"
          accent="emerald"
        >
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex-shrink-0 self-start sm:self-auto">
            {records.length} record{records.length !== 1 ? 's' : ''}
          </span>
        </SectionHeader>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <Layers className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No fee records saved yet.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['Installment No', 'Fee Type', 'Months', 'Due Date'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-32">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map(row => (
                  <RecordDesktopRow key={row.id} row={row} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {records.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <Layers className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No fee records saved yet.</span>
            </div>
          ) : (
            records.map(row => <RecordMobileCard key={row.id} row={row} />)
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
