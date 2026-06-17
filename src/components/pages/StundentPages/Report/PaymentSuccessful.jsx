/**
 * PaymentSuccessful.jsx
 * Folder: src/pages/Student/Payment/PaymentSuccessful.jsx
 *
 * Converts legacy ASPX PaymentSuccessful to fully-responsive React + Tailwind.
 * Features:
 *  - Success / Failure state based on payment status
 *  - Full receipt details: Student Name, Order ID, Transaction ID,
 *    Payment Mode, Amount, Status, Date, Email
 *  - Print receipt button
 *  - Back to Payment link
 *  - Animated status icon (success/failure)
 *  - Mobile: stacked card layout
 *  - Desktop: centered receipt card
 */

import { useState } from 'react'
import {
  CheckCircle2, XCircle, Receipt, Download,
  ArrowLeft, Printer, Copy, Check,
  User, Hash, CreditCard, BadgeIndianRupee,
  Calendar, Mail, ShieldCheck, Building2,
  AlertCircle, RefreshCw, Phone, BookOpen,
  Clock, Fingerprint
} from 'lucide-react'

// ─── DUMMY RECEIPT DATA ───────────────────────────────────────────────────────
// Replace with actual data passed via route state or API response
// e.g., const receipt = location.state?.receipt
const DUMMY_RECEIPT = {
  status: 'success',           // 'success' | 'failure'
  studentName:   'Rahul Kumar Sharma',
  orderId:       'ORD-2025-084712',
  trackingId:    'TXN8847291034',
  paymentMode:   'UPI',
  amount:        7600,
  statusMessage: 'Payment Successful',
  date:          '17 Jun 2025, 11:42 AM',
  email:         'rahul.sharma@example.com',
  phone:         '9876543210',
  admissionNo:   'SVM/2024/1087',
  class:         'Class IX – A',
  session:       '2025-26',
  bank:          'HDFC Bank',
  feeHeads: [
    { label: 'Tuition Fee',    amount: 4500 },
    { label: 'Annual Charges', amount: 1200 },
    { label: 'Exam Fee',       amount:  800 },
    { label: 'Computer Fee',   amount:  600 },
    { label: 'Sports Fund',    amount:  300 },
    { label: 'Library Fee',    amount:  200 },
  ],
}

// For failure demo — swap DUMMY_RECEIPT.status to 'failure' to preview
// const DUMMY_RECEIPT = { ...DUMMY_RECEIPT, status: 'failure', statusMessage: 'Payment Failed — Card Declined' }

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

// ─── COPY BUTTON ──────────────────────────────────────────────────────────────
function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const handle = () => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      type="button"
      onClick={handle}
      className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
      title="Copy"
    >
      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
    </button>
  )
}

// ─── STATUS BANNER ────────────────────────────────────────────────────────────
function StatusBanner({ status, message, amount }) {
  const isSuccess = status === 'success'
  return (
    <div className={`rounded-2xl px-6 py-6 text-center border-2
      ${isSuccess
        ? 'bg-gradient-to-b from-emerald-50 to-white dark:from-emerald-500/10 dark:to-transparent border-emerald-200 dark:border-emerald-500/25'
        : 'bg-gradient-to-b from-rose-50 to-white dark:from-rose-500/10 dark:to-transparent border-rose-200 dark:border-rose-500/25'}`}
    >
      {/* Animated icon */}
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg
        ${isSuccess
          ? 'bg-emerald-100 dark:bg-emerald-500/20 shadow-emerald-500/20'
          : 'bg-rose-100 dark:bg-rose-500/20 shadow-rose-500/20'}`}
        style={{ animation: 'popIn .4s cubic-bezier(0.34,1.56,0.64,1)' }}
      >
        {isSuccess
          ? <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          : <XCircle     className="w-8 h-8 text-rose-600 dark:text-rose-400" />}
      </div>

      <h2 className={`text-[18px] font-extrabold leading-tight mb-1
        ${isSuccess ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}`}
      >
        {message}
      </h2>

      {isSuccess && (
        <p className="text-[28px] font-black text-slate-800 dark:text-slate-100 tabular-nums mt-2">
          {fmt(amount)}
        </p>
      )}

      {!isSuccess && (
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">
          No amount has been deducted. Please retry or contact support.
        </p>
      )}

      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  )
}

// ─── RECEIPT ROW ──────────────────────────────────────────────────────────────
function ReceiptRow({ icon: Icon, label, value, copyable = false, highlight = false }) {
  return (
    <div className={`flex items-start gap-3 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)] last:border-0
      ${highlight ? 'bg-blue-50/30 dark:bg-blue-500/[0.04] -mx-5 px-5 rounded-lg' : ''}`}
    >
      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
        <p className={`text-[13px] font-bold mt-0.5 break-all
          ${highlight ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}
        >
          {value}
        </p>
      </div>
      {copyable && <CopyBtn text={value} />}
    </div>
  )
}

// ─── FEE BREAKDOWN SECTION ────────────────────────────────────────────────────
function FeeBreakdownMini({ items, total }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100/50 dark:hover:bg-white/[0.04] transition-colors"
      >
        <span className="text-[12px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          Fee Breakdown
        </span>
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300">{fmt(total)}</span>
          <BookOpen className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </div>
      </button>
      {open && (
        <div className="px-4 py-3 space-y-2">
          {items.map(({ label, amount }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-[12px] text-slate-500 dark:text-slate-400">{label}</span>
              <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-300 tabular-nums">{fmt(amount)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[rgba(99,102,241,0.1)]">
            <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Total Paid</span>
            <span className="text-[14px] font-extrabold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(total)}</span>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PaymentSuccessful() {
  // In real usage: const receipt = useLocation().state?.receipt || DUMMY_RECEIPT
  const receipt = DUMMY_RECEIPT
  const isSuccess = receipt.status === 'success'

  const handlePrint = () => window.print()

  // Back to payment — replace with useNavigate('/payment') in real app
  const handleBack = () => { window.history.back() }

  return (
    <div className="space-y-4 pb-10">

      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Payment Receipt
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            {isSuccess ? 'Transaction completed. Save this receipt for your records.' : 'Transaction could not be processed.'}
          </p>
        </div>

        {/* Print — hidden on mobile, shown on desktop */}
        {isSuccess && (
          <button
            type="button"
            onClick={handlePrint}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300
              dark:hover:bg-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" /> Print Receipt
          </button>
        )}
      </div>

      {/* Receipt card — max-width centered */}
      <div className="max-w-2xl mx-auto space-y-4">

        {/* Status banner */}
        <StatusBanner status={receipt.status} message={receipt.statusMessage} amount={receipt.amount} />

        {/* Main receipt details */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Receipt header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Transaction Details</span>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full
              ${isSuccess
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
                : 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400'}`}
            >
              {isSuccess ? '✓ Success' : '✗ Failed'}
            </span>
          </div>

          <div className="px-5 py-2">
            {/* Student info rows */}
            <ReceiptRow icon={User}           label="Student Name"    value={receipt.studentName}   />
            <ReceiptRow icon={Hash}           label="Admission No."   value={receipt.admissionNo}   copyable />
            <ReceiptRow icon={BookOpen}       label="Class / Section" value={receipt.class}          />
            <ReceiptRow icon={Calendar}       label="Session"         value={receipt.session}        />

            {/* Transaction rows */}
            <ReceiptRow icon={Fingerprint}    label="Order ID"        value={receipt.orderId}        copyable highlight />
            <ReceiptRow icon={Hash}           label="Transaction ID"  value={receipt.trackingId}     copyable highlight />
            <ReceiptRow icon={CreditCard}     label="Payment Mode"    value={receipt.paymentMode}    />
            <ReceiptRow icon={Building2}      label="Bank / Issuer"   value={receipt.bank}           />
            <ReceiptRow icon={BadgeIndianRupee} label="Amount Paid"   value={isSuccess ? fmt(receipt.amount) : '—'} />
            <ReceiptRow icon={Clock}          label="Date & Time"     value={receipt.date}           />
            <ReceiptRow icon={Mail}           label="Email"           value={receipt.email}          copyable />
            <ReceiptRow icon={Phone}          label="Mobile"          value={receipt.phone}          />
          </div>
        </div>

        {/* Fee breakdown collapsible */}
        {isSuccess && receipt.feeHeads?.length > 0 && (
          <FeeBreakdownMini items={receipt.feeHeads} total={receipt.amount} />
        )}

        {/* Security note */}
        <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50/50 dark:bg-blue-500/[0.05] border border-blue-100 dark:border-blue-500/15">
          <ShieldCheck className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            This is a computer-generated receipt and does not require a signature. Keep Transaction ID <strong>{receipt.trackingId}</strong> for future reference.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={handleBack}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Payment
          </button>

          {isSuccess ? (
            <button
              type="button"
              onClick={handlePrint}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              Print / Download Receipt
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
                bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-500/20 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Payment
            </button>
          )}
        </div>

        {/* Failure help */}
        {!isSuccess && (
          <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-amber-50 dark:bg-amber-500/[0.07] border border-amber-200 dark:border-amber-500/20">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-bold text-amber-700 dark:text-amber-400 mb-1">Payment not processed</p>
              <p className="text-[11px] text-amber-600 dark:text-amber-500">
                If amount was deducted from your account, it will be refunded within 5–7 working days.
                Contact school administration with your Order ID <strong>{receipt.orderId}</strong> for assistance.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
