/**
 * PaymentGateway.jsx
 * Folder: src/pages/Student/Payment/PaymentGateway.jsx
 *
 * Converts legacy ASPX PaymentGateway to fully-responsive React + Tailwind.
 * Features:
 *  - Student info summary card
 *  - Fee breakdown table (collapsible on mobile)
 *  - Payment method selector (UPI / Card / Net Banking / Wallet)
 *  - Pay Now button with loading state
 *  - Mobile: stacked card layout, no horizontal scroll
 *  - Desktop: two-column layout (fee details + payment panel)
 */

import { useState, useMemo, useCallback } from 'react'
import {
  CreditCard, Smartphone, Building2, Wallet,
  ChevronDown, ChevronRight, ShieldCheck, Lock,
  AlertCircle, Check, Loader2, X, Info,
  GraduationCap, BookOpen, Receipt, BadgeIndianRupee,
  ArrowRight, Eye, EyeOff, RefreshCw, MapPin,
  CheckCircle2, School2, User, Hash, Calendar
} from 'lucide-react'

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────
const STUDENT_INFO = {
  name: 'Rahul Kumar Sharma',
  admissionNo: 'SVM/2024/1087',
  class: 'Class IX',
  section: 'A',
  rollNo: '23',
  fatherName: 'Rajesh Kumar Sharma',
  session: '2025-26',
  email: 'rahul.sharma@example.com',
  phone: '9876543210',
}

const FEE_ITEMS = [
  { id: 1, label: 'Tuition Fee',      amount: 4500,  mandatory: true  },
  { id: 2, label: 'Annual Charges',   amount: 1200,  mandatory: true  },
  { id: 3, label: 'Exam Fee',         amount: 800,   mandatory: true  },
  { id: 4, label: 'Computer Fee',     amount: 600,   mandatory: false },
  { id: 5, label: 'Sports Fund',      amount: 300,   mandatory: false },
  { id: 6, label: 'Library Fee',      amount: 200,   mandatory: false },
]

const PAYMENT_METHODS = [
  { id: 'upi',         label: 'UPI',          icon: Smartphone,  desc: 'GPay, PhonePe, Paytm UPI'  },
  { id: 'card',        label: 'Debit / Credit Card', icon: CreditCard, desc: 'Visa, Mastercard, RuPay' },
  { id: 'netbanking',  label: 'Net Banking',  icon: Building2,   desc: 'All major Indian banks'     },
  { id: 'wallet',      label: 'Wallet',       icon: Wallet,      desc: 'Paytm, MobiKwik, Amazon Pay'},
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${n.toLocaleString('en-IN')}`

// ─── TOAST ────────────────────────────────────────────────────────────────────
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

// ─── STUDENT INFO CARD ────────────────────────────────────────────────────────
function StudentCard({ info }) {
  const [open, setOpen] = useState(true)
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-5 py-4"
      >
        <span className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </span>
        <div className="flex-1 text-left">
          <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{info.name}</p>
          <p className="text-[12px] text-slate-500 dark:text-slate-400">{info.admissionNo} · {info.class} – Sec {info.section}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Details grid */}
      {open && (
        <div className="border-t border-blue-100 dark:border-[rgba(99,102,241,0.1)] px-5 py-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { icon: User,     label: 'Father',  val: info.fatherName  },
              { icon: Hash,     label: 'Roll No', val: info.rollNo       },
              { icon: Calendar, label: 'Session', val: info.session      },
              { icon: BookOpen, label: 'Class',   val: `${info.class} – ${info.section}` },
            ].map(({ icon: Icon, label, val }) => (
              <div key={label} className="rounded-xl bg-white/60 dark:bg-white/[0.04] border border-blue-100 dark:border-[rgba(99,102,241,0.12)] px-3 py-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
                </div>
                <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200 truncate">{val}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── FEE BREAKDOWN TABLE ──────────────────────────────────────────────────────
function FeeBreakdown({ items, selected, onToggle }) {
  const total = useMemo(() => items.filter(i => selected.has(i.id)).reduce((s, i) => s + i.amount, 0), [items, selected])
  const mandatory = useMemo(() => items.filter(i => i.mandatory).reduce((s, i) => s + i.amount, 0), [items])

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <Receipt className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Fee Breakdown</span>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
          Session {STUDENT_INFO.session}
        </span>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 w-10">Pay</th>
              <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Fee Head</th>
              <th className="px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Type</th>
              <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr
                key={item.id}
                onClick={() => !item.mandatory && onToggle(item.id)}
                className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
                  ${item.mandatory ? 'opacity-100' : 'cursor-pointer hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}
                  ${selected.has(item.id) ? 'bg-blue-50/30 dark:bg-blue-500/[0.04]' : ''}`}
              >
                <td className="px-5 py-3">
                  <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                    ${selected.has(item.id)
                      ? 'bg-blue-600 border-blue-600'
                      : 'border-slate-300 dark:border-slate-600'}
                    ${item.mandatory ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {selected.has(item.id) && <Check className="w-3 h-3 text-white" />}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full
                    ${item.mandatory
                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}
                  >
                    {item.mandatory ? 'Mandatory' : 'Optional'}
                  </span>
                </td>
                <td className="px-5 py-3 text-right">
                  <span className={`text-[14px] font-bold tabular-nums
                    ${selected.has(item.id) ? 'text-blue-700 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`}
                  >
                    {fmt(item.amount)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile fee cards */}
      <div className="sm:hidden p-4 space-y-2">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => !item.mandatory && onToggle(item.id)}
            disabled={item.mandatory}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left
              ${selected.has(item.id)
                ? 'border-blue-200 dark:border-blue-500/30 bg-blue-50/50 dark:bg-blue-500/[0.07]'
                : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1e2238]'}`}
          >
            <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all
              ${selected.has(item.id) ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'}
              ${item.mandatory ? 'opacity-60' : ''}`}
            >
              {selected.has(item.id) && <Check className="w-3 h-3 text-white" />}
            </span>
            <span className="flex-1 text-[13px] font-semibold text-slate-700 dark:text-slate-200">{item.label}</span>
            <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 mr-2
              ${item.mandatory ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}
            >
              {item.mandatory ? 'Mandatory' : 'Optional'}
            </span>
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 tabular-nums flex-shrink-0">{fmt(item.amount)}</span>
          </button>
        ))}
      </div>

      {/* Total footer */}
      <div className="flex items-center justify-between gap-4 px-5 py-4 border-t-2 border-blue-100 dark:border-indigo-500/20 bg-blue-50/40 dark:bg-blue-500/[0.05]">
        <div>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Mandatory</p>
          <p className="text-[15px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">{fmt(mandatory)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">Amount Payable</p>
          <p className="text-[22px] font-extrabold text-blue-700 dark:text-blue-300 tabular-nums">{fmt(total)}</p>
        </div>
      </div>
    </div>
  )
}

// ─── PAYMENT METHOD SELECTOR ──────────────────────────────────────────────────
function PaymentMethodSelector({ selected, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {PAYMENT_METHODS.map(({ id, label, icon: Icon, desc }) => (
        <button
          key={id}
          type="button"
          onClick={() => onChange(id)}
          className={`flex flex-col items-start gap-2 px-4 py-3.5 rounded-xl border-2 transition-all text-left
            ${selected === id
              ? 'border-blue-500 dark:border-indigo-400 bg-blue-50/60 dark:bg-indigo-500/[0.08]'
              : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] hover:border-blue-300 dark:hover:border-indigo-500/40'}`}
        >
          <div className="flex items-center justify-between w-full">
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
              ${selected === id
                ? 'bg-blue-100 dark:bg-blue-500/20'
                : 'bg-slate-100 dark:bg-slate-800'}`}
            >
              <Icon className={`w-4 h-4 ${selected === id ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
            </span>
            <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all
              ${selected === id ? 'border-blue-500 dark:border-indigo-400' : 'border-slate-300 dark:border-slate-600'}`}
            >
              {selected === id && <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-indigo-400" />}
            </span>
          </div>
          <div>
            <p className={`text-[12px] font-bold leading-tight ${selected === id ? 'text-blue-700 dark:text-blue-300' : 'text-slate-700 dark:text-slate-200'}`}>
              {label}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 leading-tight">{desc}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

// ─── UPI INPUT ────────────────────────────────────────────────────────────────
function UpiInput({ value, onChange }) {
  return (
    <div className="mt-3">
      <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block">
        UPI ID <span className="text-rose-500">*</span>
      </label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder="yourname@upi"
        className="w-full px-4 py-2.5 text-[13px] rounded-xl border outline-none transition-all
          bg-white text-slate-800 border-slate-200 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
          dark:placeholder-slate-600 dark:focus:border-indigo-400"
      />
    </div>
  )
}

// ─── CARD INPUT ───────────────────────────────────────────────────────────────
function CardInput({ card, onChange }) {
  const [showCvv, setShowCvv] = useState(false)
  const inputClass = "w-full px-4 py-2.5 text-[13px] rounded-xl border outline-none transition-all bg-white text-slate-800 border-slate-200 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:placeholder-slate-600 dark:focus:border-indigo-400"
  const label = "text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block"

  return (
    <div className="mt-3 space-y-3">
      <div>
        <label className={label}>Card Number <span className="text-rose-500">*</span></label>
        <input type="text" value={card.number} onChange={e => onChange('number', e.target.value)}
          placeholder="XXXX XXXX XXXX XXXX" maxLength={19} className={inputClass} />
      </div>
      <div>
        <label className={label}>Cardholder Name <span className="text-rose-500">*</span></label>
        <input type="text" value={card.name} onChange={e => onChange('name', e.target.value)}
          placeholder="Name on card" className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Expiry <span className="text-rose-500">*</span></label>
          <input type="text" value={card.expiry} onChange={e => onChange('expiry', e.target.value)}
            placeholder="MM/YY" maxLength={5} className={inputClass} />
        </div>
        <div>
          <label className={label}>CVV <span className="text-rose-500">*</span></label>
          <div className="relative">
            <input type={showCvv ? 'text' : 'password'} value={card.cvv}
              onChange={e => onChange('cvv', e.target.value)}
              placeholder="•••" maxLength={4} className={`${inputClass} pr-10`} />
            <button type="button" onClick={() => setShowCvv(p => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {showCvv ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── NET BANKING SELECT ───────────────────────────────────────────────────────
const BANKS = ['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Punjab National Bank', 'Bank of Baroda', 'Kotak Mahindra Bank', 'Union Bank of India']

function NetBankingInput({ value, onChange }) {
  return (
    <div className="mt-3">
      <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block">
        Select Bank <span className="text-rose-500">*</span>
      </label>
      <div className="relative">
        <select value={value} onChange={e => onChange(e.target.value)}
          className="w-full appearance-none pl-4 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all
            bg-white text-slate-800 border-slate-200
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:focus:border-indigo-400">
          <option value="">-- Select Bank --</option>
          {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
      </div>
    </div>
  )
}

// ─── WALLET SELECT ────────────────────────────────────────────────────────────
const WALLETS = ['Paytm', 'PhonePe', 'Amazon Pay', 'MobiKwik', 'Freecharge']

function WalletInput({ value, onChange }) {
  return (
    <div className="mt-3">
      <label className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-1.5 block">
        Select Wallet <span className="text-rose-500">*</span>
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {WALLETS.map(w => (
          <button key={w} type="button" onClick={() => onChange(w)}
            className={`px-3 py-2 rounded-xl text-[12px] font-semibold border-2 transition-all
              ${value === w
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300'
                : 'border-slate-200 bg-white text-slate-600 dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-400'}`}>
            {w}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── PAYMENT PANEL ────────────────────────────────────────────────────────────
function PaymentPanel({ total, onPay, paying }) {
  const [method, setMethod]   = useState('upi')
  const [upiId,  setUpiId]    = useState('')
  const [bank,   setBank]     = useState('')
  const [wallet, setWallet]   = useState('')
  const [card,   setCard]     = useState({ number: '', name: '', expiry: '', cvv: '' })

  const handleCardChange = useCallback((field, val) => setCard(p => ({ ...p, [field]: val })), [])

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
        <CreditCard className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Payment Method</span>
        <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
          <Lock className="w-3 h-3" /> Secure
        </span>
      </div>

      <div className="p-5 space-y-4">
        {/* Method selector */}
        <PaymentMethodSelector selected={method} onChange={setMethod} />

        {/* Dynamic input based on method */}
        {method === 'upi'        && <UpiInput value={upiId} onChange={setUpiId} />}
        {method === 'card'       && <CardInput card={card} onChange={handleCardChange} />}
        {method === 'netbanking' && <NetBankingInput value={bank} onChange={setBank} />}
        {method === 'wallet'     && <WalletInput value={wallet} onChange={setWallet} />}

        {/* Security badges */}
        <div className="flex flex-wrap gap-2 pt-1">
          {['256-bit SSL', 'PCI DSS', 'RBI Compliant'].map(badge => (
            <span key={badge} className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3" />{badge}
            </span>
          ))}
        </div>

        {/* Pay button */}
        <button
          type="button"
          onClick={() => onPay({ method, upiId, card, bank, wallet })}
          disabled={paying || total === 0}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-[14px] font-bold
            bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25
            dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/25
            transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {paying
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Processing Payment…</>
            : <><BadgeIndianRupee className="w-4 h-4" /> Pay {fmt(total)} <ArrowRight className="w-4 h-4" /></>
          }
        </button>

        {/* Info note */}
        <p className="flex items-start gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
          <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
          After payment you will be redirected to payment confirmation page. Keep receipt for records.
        </p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function PaymentGateway() {
  // All fee items are selected by default (mandatory always selected)
  const [selected, setSelected] = useState(() => new Set(FEE_ITEMS.map(i => i.id)))
  const [paying,   setPaying]   = useState(false)
  const [toast,    setToast]    = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 4000)
  }

  const handleToggle = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }, [])

  const total = useMemo(
    () => FEE_ITEMS.filter(i => selected.has(i.id)).reduce((s, i) => s + i.amount, 0),
    [selected]
  )

  const handlePay = useCallback((paymentData) => {
    if (total === 0) { showToast('Please select at least one fee to pay.', 'error'); return }
    setPaying(true)
    // TODO: API integration — POST to payment gateway endpoint
    // Replace with actual CCAvenue / Razorpay / PayU integration
    setTimeout(() => {
      setPaying(false)
      showToast('Redirecting to payment gateway…')
      // navigate('/payment-successful', { state: { ...paymentData, amount: total } })
    }, 2000)
  }, [total])

  return (
    <div className="space-y-4 pb-10">

      {/* Page title */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <BadgeIndianRupee className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
          Fee Payment
        </h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Review fee details and complete payment securely.
        </p>
      </div>

      {/* Student card */}
      <StudentCard info={STUDENT_INFO} />

      {/* Main two-column layout (desktop) / stacked (mobile) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4 items-start">
        {/* Left: fee breakdown */}
        <FeeBreakdown items={FEE_ITEMS} selected={selected} onToggle={handleToggle} />

        {/* Right: payment panel */}
        <div className="lg:sticky lg:top-4">
          <PaymentPanel total={total} onPay={handlePay} paying={paying} />
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
