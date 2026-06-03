/**
 * ReconFee.jsx
 * Approval / Reconcile Fee Page
 * Converted from legacy ASPX to React + Tailwind CSS
 *
 * Features:
 *  - Fee type tabs: Regular / Transport / Hostel
 *  - Session, Adm No., Class, Name, Date range filters
 *  - GridView → dense desktop table + mobile cards
 *  - Select All / individual checkbox
 *  - Approve / Clear bulk action
 *  - Not Approve / Bounce per-row with modal
 *  - Bounce modal: charges + reason input
 *  - Loading states, empty states, toast notifications
 *  - Fully responsive — no horizontal scroll on mobile
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  CheckCircle2, XCircle, Search, RefreshCw, Filter,
  ChevronDown, X, AlertCircle, Check, Loader2, Info,
  CreditCard, Bus, Building2, Calendar, Hash,
  User, BookOpen, SlidersHorizontal, ChevronRight,
  Banknote, Clock, FileCheck2, AlertTriangle,
  ArrowLeft, Eye, IndianRupee, Receipt, Layers3,
} from "lucide-react";

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ["2022-23", "2023-24", "2024-25", "2025-26"];

const CLASSES = [
  "Nursery", "LKG", "UKG",
  "Class I", "Class II", "Class III", "Class IV", "Class V",
  "Class VI", "Class VII", "Class VIII",
  "Class IX", "Class X", "Class XI", "Class XII",
];

const STUDENTS_BY_CLASS = {
  "Class IX": [
    { value: "STU001", label: "Aarav Sharma" },
    { value: "STU002", label: "Priya Singh" },
    { value: "STU003", label: "Rohan Gupta" },
  ],
  "Class X": [
    { value: "STU004", label: "Sneha Verma" },
    { value: "STU005", label: "Karan Mehta" },
  ],
  "Class XI": [
    { value: "STU006", label: "Ananya Joshi" },
    { value: "STU007", label: "Vikram Patel" },
    { value: "STU008", label: "Ritika Yadav" },
  ],
  "Class XII": [
    { value: "STU009", label: "Arjun Tiwari" },
    { value: "STU010", label: "Pooja Mishra" },
  ],
};

const MOP_LABELS = {
  Cash: { color: "emerald", icon: Banknote },
  Cheque: { color: "amber",   icon: Receipt  },
  Online: { color: "blue",    icon: CreditCard },
  NEFT:   { color: "violet",  icon: Layers3   },
};

// Status: "pending" | "approved" | "bounced"
const generateFeeData = (feeType) => {
  const base = [
    { id: 1,  admno: "ADM2401", feeBookNo: "FB-001", name: "Aarav Sharma",   classname: "Class IX-A",  paymentdate: "12 Apr 2025", amount: 4500,  mop: "Cheque", financial_year: "2025-26", receiptno: "REC-1001", transaction_no: "CHQ-334421", status: "pending" },
    { id: 2,  admno: "ADM2402", feeBookNo: "FB-002", name: "Priya Singh",    classname: "Class IX-B",  paymentdate: "13 Apr 2025", amount: 4500,  mop: "Online", financial_year: "2025-26", receiptno: "REC-1002", transaction_no: "TXN-887654", status: "pending" },
    { id: 3,  admno: "ADM2403", feeBookNo: "FB-003", name: "Rohan Gupta",    classname: "Class X-A",   paymentdate: "14 Apr 2025", amount: 5200,  mop: "Cash",   financial_year: "2025-26", receiptno: "REC-1003", transaction_no: "CASH",       status: "approved" },
    { id: 4,  admno: "ADM2404", feeBookNo: "FB-004", name: "Sneha Verma",    classname: "Class X-B",   paymentdate: "15 Apr 2025", amount: 5200,  mop: "NEFT",   financial_year: "2025-26", receiptno: "REC-1004", transaction_no: "NEFT-221190", status: "pending" },
    { id: 5,  admno: "ADM2405", feeBookNo: "FB-005", name: "Karan Mehta",    classname: "Class XI-A",  paymentdate: "16 Apr 2025", amount: 6800,  mop: "Cheque", financial_year: "2025-26", receiptno: "REC-1005", transaction_no: "CHQ-551032", status: "bounced" },
    { id: 6,  admno: "ADM2406", feeBookNo: "FB-006", name: "Ananya Joshi",   classname: "Class XI-B",  paymentdate: "17 Apr 2025", amount: 6800,  mop: "Online", financial_year: "2025-26", receiptno: "REC-1006", transaction_no: "TXN-990011", status: "pending" },
    { id: 7,  admno: "ADM2407", feeBookNo: "FB-007", name: "Vikram Patel",   classname: "Class XII-A", paymentdate: "18 Apr 2025", amount: 7200,  mop: "Cheque", financial_year: "2025-26", receiptno: "REC-1007", transaction_no: "CHQ-112233", status: "pending" },
    { id: 8,  admno: "ADM2408", feeBookNo: "FB-008", name: "Ritika Yadav",   classname: "Class XII-B", paymentdate: "19 Apr 2025", amount: 7200,  mop: "NEFT",   financial_year: "2025-26", receiptno: "REC-1008", transaction_no: "NEFT-445566", status: "approved" },
    { id: 9,  admno: "ADM2409", feeBookNo: "FB-009", name: "Arjun Tiwari",   classname: "Class IX-A",  paymentdate: "20 Apr 2025", amount: 4500,  mop: "Cash",   financial_year: "2025-26", receiptno: "REC-1009", transaction_no: "CASH",       status: "pending" },
    { id: 10, admno: "ADM2410", feeBookNo: "FB-010", name: "Pooja Mishra",   classname: "Class IX-B",  paymentdate: "21 Apr 2025", amount: 4500,  mop: "Online", financial_year: "2025-26", receiptno: "REC-1010", transaction_no: "TXN-773344", status: "pending" },
    { id: 11, admno: "ADM2411", feeBookNo: "FB-011", name: "Deepak Kumar",   classname: "Class X-A",   paymentdate: "22 Apr 2025", amount: 5200,  mop: "Cheque", financial_year: "2025-26", receiptno: "REC-1011", transaction_no: "CHQ-998877", status: "pending" },
    { id: 12, admno: "ADM2412", feeBookNo: "FB-012", name: "Meena Rawat",    classname: "Class XI-A",  paymentdate: "23 Apr 2025", amount: 6800,  mop: "NEFT",   financial_year: "2025-26", receiptno: "REC-1012", transaction_no: "NEFT-664422", status: "bounced" },
  ];

  if (feeType === "Transport") {
    return base.slice(0, 7).map(r => ({ ...r, amount: 1800, feeBookNo: `TB-${r.id.toString().padStart(3,"0")}`, receiptno: `TREC-${1000+r.id}` }));
  }
  if (feeType === "Hostel") {
    return base.slice(0, 5).map(r => ({ ...r, amount: 8500, feeBookNo: `HB-${r.id.toString().padStart(3,"0")}`, receiptno: `HREC-${1000+r.id}` }));
  }
  return base;
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const fmt = (n) => new Intl.NumberFormat("en-IN").format(n);

const STATUS_CONFIG = {
  pending:  { label: "Pending",  bg: "bg-amber-50",   text: "text-amber-700",  border: "border-amber-200",  dark: "dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"  },
  approved: { label: "Approved", bg: "bg-emerald-50", text: "text-emerald-700",border: "border-emerald-200",dark: "dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" },
  bounced:  { label: "Bounced",  bg: "bg-rose-50",    text: "text-rose-700",   border: "border-rose-200",   dark: "dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20"    },
};

const MOP_CONFIG = {
  Cash:   { bg: "bg-emerald-100 dark:bg-emerald-500/15", text: "text-emerald-700 dark:text-emerald-400" },
  Cheque: { bg: "bg-amber-100 dark:bg-amber-500/15",     text: "text-amber-700 dark:text-amber-400"     },
  Online: { bg: "bg-blue-100 dark:bg-blue-500/15",       text: "text-blue-700 dark:text-blue-400"       },
  NEFT:   { bg: "bg-violet-100 dark:bg-violet-500/15",   text: "text-violet-700 dark:text-violet-400"   },
};

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3
      rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[260px] max-w-[90vw] animate-slide-up
      ${type === "success" ? "bg-emerald-600 text-white" : type === "error" ? "bg-rose-600 text-white" : "bg-blue-600 text-white"}`}>
      {type === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

function StatusBadge({ status }) {
  const c = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border
      ${c.bg} ${c.text} ${c.border} ${c.dark}`}>
      {status === "approved" && <Check className="w-3 h-3" />}
      {status === "bounced"  && <XCircle className="w-3 h-3" />}
      {status === "pending"  && <Clock className="w-3 h-3" />}
      {c.label}
    </span>
  );
}

function MopBadge({ mop }) {
  const c = MOP_CONFIG[mop] || MOP_CONFIG.Cash;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold ${c.bg} ${c.text}`}>
      {mop}
    </span>
  );
}

function SummaryCard({ icon: Icon, label, value, color, sub }) {
  const cols = {
    blue:    "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    amber:   "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400",
    rose:    "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]
      bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${cols[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  );
}

// ─── BOUNCE MODAL ─────────────────────────────────────────────────────────────

function BounceModal({ row, onConfirm, onCancel }) {
  const [charge, setCharge] = useState("");
  const [reason, setReason] = useState("");
  const [err, setErr] = useState({});

  const handleConfirm = () => {
    const e = {};
    if (!charge || isNaN(charge) || Number(charge) < 0) e.charge = "Enter valid bounce charges";
    if (!reason.trim()) e.reason = "Bounce reason is required";
    if (Object.keys(e).length) { setErr(e); return; }
    onConfirm({ charge: Number(charge), reason });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <span className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </span>
          <div>
            <h3 className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Not Approve / Bounce</h3>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">Receipt: {row?.receiptno}</p>
          </div>
          <button onClick={onCancel} className="ml-auto p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Student info */}
        <div className="px-5 py-3 bg-rose-50/50 dark:bg-rose-500/5 border-b border-rose-100 dark:border-rose-500/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center text-[12px] font-bold text-rose-600 dark:text-rose-400 flex-shrink-0">
              {row?.name?.charAt(0)}
            </div>
            <div>
              <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-200">{row?.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{row?.admno} · {row?.classname}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[14px] font-bold text-rose-700 dark:text-rose-400">₹{fmt(row?.amount)}</p>
              <p className="text-[10px] text-slate-400">{row?.mop}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-5 py-4 space-y-4">
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
              Bounce Charges (₹) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              value={charge}
              onChange={e => { setCharge(e.target.value); setErr(p => ({ ...p, charge: "" })); }}
              placeholder="Enter bounce charges"
              className={`w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none transition-all
                bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20 focus:border-rose-400
                ${err.charge ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200 dark:border-[rgba(99,102,241,0.25)]"}`}
            />
            {err.charge && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err.charge}</p>}
          </div>
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1.5 block">
              Bounce Reason <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reason}
              onChange={e => { setReason(e.target.value); setErr(p => ({ ...p, reason: "" })); }}
              placeholder="e.g. Insufficient funds, Signature mismatch"
              className={`w-full px-3 py-2.5 rounded-xl border text-[13px] outline-none transition-all
                bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-500/20 focus:border-rose-400
                ${err.reason ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200 dark:border-[rgba(99,102,241,0.25)]"}`}
            />
            {err.reason && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{err.reason}</p>}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <button onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center justify-center gap-2">
            <XCircle className="w-4 h-4" />
            Confirm Bounce
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilter, classes, students, onShow, loading, errors }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35]
        border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
              <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          <FilterField label="Session" error={errors.session} required>
            <Select value={filters.session} onChange={v => setFilter("session", v)} placeholder="Select Session" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </FilterField>
          <FilterField label="Adm. No.">
            <input value={filters.admno} onChange={e => setFilter("admno", e.target.value)}
              placeholder="Enter admission number"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-[13px] outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20 transition-all" />
          </FilterField>
          <FilterField label="Class">
            <Select value={filters.classname} onChange={v => setFilter("classname", v)} placeholder="All Classes">
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
          </FilterField>
          <FilterField label="Student Name">
            <Select value={filters.student} onChange={v => setFilter("student", v)} placeholder="All Students" disabled={!filters.classname}>
              {students.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </Select>
          </FilterField>
          <div className="grid grid-cols-2 gap-3">
            <FilterField label="From Date">
              <input type="date" value={filters.fromdate} onChange={e => setFilter("fromdate", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-[13px] outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </FilterField>
            <FilterField label="To Date">
              <input type="date" value={filters.todate} onChange={e => setFilter("todate", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-[13px] outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </FilterField>
          </div>
        </div>

        <div className="sticky bottom-0 bg-white dark:bg-[#1a1f35] border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-5 py-4 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            Cancel
          </button>
          <button onClick={() => { onShow(); onClose(); }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show
          </button>
        </div>
      </div>
    </>
  );
}

function FilterField({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

function Select({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)} disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 dark:bg-[#1e2238] dark:text-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200 dark:border-[rgba(99,102,241,0.25)]"}`}>
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

// ─── MOBILE FEE CARD ──────────────────────────────────────────────────────────

function MobileFeeCard({ row, checked, onCheck, onBounce, disabled }) {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CONFIG[row.status] || STATUS_CONFIG.pending;
  const canBounce = row.status === "pending";
  const isApproved = row.status === "approved";
  const isBounced  = row.status === "bounced";

  return (
    <div className={`rounded-2xl border overflow-hidden shadow-sm transition-all
      ${checked ? "border-blue-300 dark:border-blue-500/40 bg-blue-50/50 dark:bg-blue-500/5" : "border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]"}
      ${isBounced ? "opacity-70" : ""}`}>

      {/* Card Header */}
      <div className="flex items-start gap-3 px-4 pt-4 pb-3">
        {/* Checkbox */}
        <div className="mt-0.5 flex-shrink-0">
          <input type="checkbox" checked={checked} onChange={onCheck} disabled={disabled}
            className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer disabled:opacity-40" />
        </div>

        {/* Avatar + Name */}
        <div
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[13px] font-bold
            bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20
            text-blue-700 dark:text-blue-400 cursor-pointer"
          onClick={() => setExpanded(p => !p)}
        >
          {row.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setExpanded(p => !p)}>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{row.admno} · {row.classname}</p>
            </div>
            <div className="flex flex-col items-end flex-shrink-0 gap-1">
              <span className="text-[16px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">₹{fmt(row.amount)}</span>
              <StatusBadge status={row.status} />
            </div>
          </div>
        </div>

        <button onClick={() => setExpanded(p => !p)} className="flex-shrink-0 mt-1 text-slate-400">
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expanded ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Quick info row */}
      <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
        <MopBadge mop={row.mop} />
        <span className="text-[11px] text-slate-400 dark:text-slate-500">Rec: {row.receiptno}</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500">·</span>
        <span className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Calendar className="w-3 h-3" />{row.paymentdate}
        </span>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 space-y-2 bg-slate-50/50 dark:bg-white/[0.02]">
          <DetailRow icon={Hash}     label="Fee Book No"    value={row.feeBookNo} />
          <DetailRow icon={Receipt}  label="Receipt No"     value={row.receiptno} />
          <DetailRow icon={CreditCard} label="Txn / Chq No" value={row.transaction_no} />
          <DetailRow icon={Calendar} label="Payment Date"   value={row.paymentdate} />
          <DetailRow icon={Banknote} label="Financial Year" value={row.financial_year} />
          {(row.bounceCharge || row.bounceReason) && (
            <div className="mt-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 space-y-1">
              {row.bounceCharge && <p className="text-[11px] text-rose-700 dark:text-rose-400">Bounce Charges: ₹{fmt(row.bounceCharge)}</p>}
              {row.bounceReason && <p className="text-[11px] text-rose-700 dark:text-rose-400">Reason: {row.bounceReason}</p>}
            </div>
          )}
        </div>
      )}

      {/* Action */}
      {canBounce && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3">
          <button onClick={() => onBounce(row)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20
              hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors active:scale-95">
            <XCircle className="w-4 h-4" />
            Not Approve / Bounce
          </button>
        </div>
      )}
      {isApproved && (
        <div className="px-4 py-3 border-t border-emerald-100 dark:border-emerald-500/20">
          <p className="text-[12px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" /> Payment Approved & Cleared
          </p>
        </div>
      )}
      {isBounced && (
        <div className="px-4 py-3 border-t border-rose-100 dark:border-rose-500/20">
          <p className="text-[12px] text-rose-700 dark:text-rose-400 font-semibold flex items-center gap-1.5">
            <XCircle className="w-4 h-4" /> Payment Bounced
          </p>
        </div>
      )}
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
      <span className="text-[11px] text-slate-500 dark:text-slate-400 w-24 flex-shrink-0">{label}</span>
      <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">{value}</span>
    </div>
  );
}

// ─── FEE TYPE TAB ─────────────────────────────────────────────────────────────

const FEE_TYPES = [
  { key: "Regular",   label: "Regular Fee",   icon: BookOpen,   color: "blue"    },
  { key: "Transport", label: "Transport Fee",  icon: Bus,        color: "amber"   },
  { key: "Hostel",    label: "Hostel Fee",     icon: Building2,  color: "violet"  },
];

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ReconFee() {
  // Fee type
  const [feeType, setFeeType] = useState("Regular");

  // Filters
  const [filters, setFiltersState] = useState({
    session: "", admno: "", classname: "", student: "", fromdate: "", todate: "",
  });
  const setFilter = useCallback((key, val) => {
    setFiltersState(p => {
      const next = { ...p, [key]: val };
      if (key === "classname") next.student = ""; // reset student on class change
      return next;
    });
  }, []);

  // Data state
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [shown,      setShown]      = useState(false);
  const [errors,     setErrors]     = useState({});
  const [toast,      setToast]      = useState(null);
  const [filterOpen, setFilterOpen] = useState(false);

  // Selection
  const [selected, setSelected] = useState(new Set());

  // Bounce modal
  const [bounceRow, setBounceRow] = useState(null);

  const students = useMemo(() =>
    filters.classname ? (STUDENTS_BY_CLASS[filters.classname] || []) : [],
    [filters.classname]
  );

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  // ── Show Report ────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {};
    if (!filters.session) err.session = "Please select a session";
    if (Object.keys(err).length) { setErrors(err); return; }
    setErrors({});
    setLoading(true);
    setSelected(new Set());
    setTimeout(() => {
      const data = generateFeeData(feeType);
      setRows(data);
      setShown(true);
      setLoading(false);
      showToast(`Loaded ${data.length} fee records for session ${filters.session}.`);
    }, 700);
  }, [filters, feeType, showToast]);

  const handleReset = () => {
    setFiltersState({ session: "", admno: "", classname: "", student: "", fromdate: "", todate: "" });
    setRows([]); setShown(false); setSelected(new Set()); setErrors({});
  };

  // ── Bulk Approve ───────────────────────────────────────────────────────────
  const handleApprove = () => {
    if (selected.size === 0) { showToast("Please select at least one record.", "error"); return; }
    setRows(prev => prev.map(r => selected.has(r.id) && r.status === "pending" ? { ...r, status: "approved" } : r));
    const count = selected.size;
    setSelected(new Set());
    showToast(`${count} record(s) approved & cleared successfully!`);
  };

  // ── Select All ─────────────────────────────────────────────────────────────
  const pendingRows = useMemo(() => rows.filter(r => r.status === "pending"), [rows]);
  const allPendingSelected = pendingRows.length > 0 && pendingRows.every(r => selected.has(r.id));

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelected(new Set(pendingRows.map(r => r.id)));
    } else {
      setSelected(new Set());
    }
  };

  const handleToggle = (id) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  // ── Bounce ─────────────────────────────────────────────────────────────────
  const handleBounceConfirm = ({ charge, reason }) => {
    setRows(prev => prev.map(r =>
      r.id === bounceRow.id
        ? { ...r, status: "bounced", bounceCharge: charge, bounceReason: reason }
        : r
    ));
    setSelected(prev => { const next = new Set(prev); next.delete(bounceRow.id); return next; });
    setBounceRow(null);
    showToast(`Receipt ${bounceRow.receiptno} marked as Bounced.`, "error");
  };

  // ── Summary ────────────────────────────────────────────────────────────────
  const summary = useMemo(() => ({
    total:    rows.length,
    pending:  rows.filter(r => r.status === "pending").length,
    approved: rows.filter(r => r.status === "approved").length,
    bounced:  rows.filter(r => r.status === "bounced").length,
    amount:   rows.filter(r => r.status === "approved").reduce((s, r) => s + r.amount, 0),
  }), [rows]);

  const hasResults = shown && rows.length > 0;
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="space-y-4 pb-12">
      <style>{`
        @keyframes slide-up { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        .animate-slide-up { animation: slide-up 0.25s ease; }
      `}</style>

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 flex-shrink-0">
            <FileCheck2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-[20px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight">
              Approval / Reconcile Fee
            </h1>
            <p className="text-[12px] text-slate-500 dark:text-slate-400">
              Approve, clear or bounce fee deposits. Select records to bulk approve.
            </p>
          </div>
        </div>

        {/* Back to Deposit Page */}
        {shown && (
          <button onClick={handleReset}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
              text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transition-all flex-shrink-0">
            <ArrowLeft className="w-4 h-4" /> Back to Deposit Page
          </button>
        )}
      </div>

      {/* ── Fee Type Tabs ─────────────────────────────────────────────────── */}
      <div className="flex gap-2 p-1 rounded-2xl bg-slate-100 dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)]">
        {FEE_TYPES.map(ft => {
          const active = feeType === ft.key;
          const Icon = ft.icon;
          const colMap = {
            blue:   active ? "bg-white dark:bg-[#1e2238] text-blue-700 dark:text-blue-400 shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
            amber:  active ? "bg-white dark:bg-[#1e2238] text-amber-700 dark:text-amber-400 shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
            violet: active ? "bg-white dark:bg-[#1e2238] text-violet-700 dark:text-violet-400 shadow-md" : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200",
          };
          return (
            <button key={ft.key} onClick={() => { setFeeType(ft.key); setShown(false); setRows([]); setSelected(new Set()); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-[13px] font-semibold transition-all
                ${colMap[ft.color]}`}>
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{ft.label}</span>
              <span className="sm:hidden">{ft.key}</span>
            </button>
          );
        })}
      </div>

      {/* ── DESKTOP Filter Card ───────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/60 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-end">
            <FilterField label="Session" error={errors.session} required>
              <Select value={filters.session} onChange={v => { setFilter("session", v); setErrors(p => ({ ...p, session: "" })); }}
                placeholder="Select Session" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </Select>
            </FilterField>
            <FilterField label="Adm. No.">
              <input value={filters.admno} onChange={e => setFilter("admno", e.target.value)}
                placeholder="e.g. ADM2401"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-[13px] outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:ring-indigo-500/20 transition-all" />
            </FilterField>
            <FilterField label="Class">
              <Select value={filters.classname} onChange={v => setFilter("classname", v)} placeholder="All Classes">
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
            </FilterField>
            <FilterField label="Student Name">
              <Select value={filters.student} onChange={v => setFilter("student", v)} placeholder="All Students" disabled={!filters.classname}>
                {students.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </FilterField>
            <FilterField label="From Date">
              <input type="date" value={filters.fromdate} onChange={e => setFilter("fromdate", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-[13px] outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </FilterField>
            <FilterField label="To Date">
              <input type="date" value={filters.todate} onChange={e => setFilter("todate", e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] text-[13px] outline-none bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
            </FilterField>
          </div>
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <button onClick={handleShow} disabled={loading}
              className="flex items-center gap-2 px-6 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Records
            </button>
            <button onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            {shown && (
              <p className="text-[12px] text-slate-400 dark:text-slate-500 ml-auto flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" />
                Select pending records and click <strong>Approve / Clear</strong> to process.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20 active:scale-95 transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          {filters.session ? `Session: ${filters.session}` : "Set Filters"}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {shown && (
          <button onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-600 dark:text-slate-400">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} setFilter={setFilter}
        classes={CLASSES} students={students}
        onShow={handleShow} loading={loading} errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-5 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <SummaryCard icon={Layers3}      label="Total Records"   value={summary.total}    color="blue"    />
            <SummaryCard icon={Clock}        label="Pending"         value={summary.pending}  color="amber"   />
            <SummaryCard icon={CheckCircle2} label="Approved"        value={summary.approved} color="emerald" />
            <SummaryCard icon={XCircle}      label="Bounced"         value={summary.bounced}  color="rose"    sub={summary.approved > 0 ? `₹${fmt(summary.amount)} cleared` : undefined} />
          </div>

          {/* ── DESKTOP TABLE ────────────────────────────────────────────── */}
          <div className="hidden md:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            {/* Table Header Bar */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/60 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
                Fee Records — {feeType}
              </span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400">
                {rows.length} records
              </span>
              {/* Approve Button */}
              <button onClick={handleApprove}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[12px] font-bold text-white
                  bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition-all active:scale-95
                  disabled:opacity-50"
                disabled={selected.size === 0}>
                <CheckCircle2 className="w-4 h-4" />
                Approve / Clear {selected.size > 0 ? `(${selected.size})` : ""}
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    <th className="px-4 py-2.5 text-center w-10">
                      <input type="checkbox"
                        checked={allPendingSelected}
                        onChange={e => handleSelectAll(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                        title="Select all pending"
                      />
                    </th>
                    {["S.No.", "Adm. No.", "Fee Book No", "Name", "Class", "Dep. Date", "Amount", "Mode", "Fin. Year", "Rec. No.", "Chq/Txn No.", "Status", "Action"].map((h, i) => (
                      <th key={i} className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const isBounced  = row.status === "bounced";
                    const isApproved = row.status === "approved";
                    const isPending  = row.status === "pending";
                    const isChecked  = selected.has(row.id);
                    return (
                      <tr key={row.id}
                        className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
                          ${isChecked ? "bg-blue-50/60 dark:bg-blue-500/5" : "hover:bg-slate-50/50 dark:hover:bg-white/[0.015]"}
                          ${isBounced ? "opacity-60" : ""}`}>
                        <td className="px-4 py-2.5 text-center">
                          <input type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggle(row.id)}
                            disabled={!isPending}
                            className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer disabled:opacity-40"
                          />
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{i + 1}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-[12px] font-semibold text-blue-700 dark:text-blue-400">{row.admno}</span>
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300">{row.feeBookNo}</td>
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-500/20 dark:to-indigo-500/20 flex items-center justify-center text-[10px] font-bold text-blue-700 dark:text-blue-400 flex-shrink-0">
                              {row.name.charAt(0)}
                            </div>
                            <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
                          </div>
                        </td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.classname}</td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.paymentdate}</td>
                        <td className="px-3 py-2.5">
                          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100 tabular-nums">₹{fmt(row.amount)}</span>
                        </td>
                        <td className="px-3 py-2.5"><MopBadge mop={row.mop} /></td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400">{row.financial_year}</td>
                        <td className="px-3 py-2.5 text-[12px] font-semibold text-slate-700 dark:text-slate-300">{row.receiptno}</td>
                        <td className="px-3 py-2.5 text-[12px] text-slate-500 dark:text-slate-400 max-w-[120px] truncate" title={row.transaction_no}>{row.transaction_no}</td>
                        <td className="px-3 py-2.5"><StatusBadge status={row.status} /></td>
                        <td className="px-3 py-2.5">
                          {isPending && (
                            <button onClick={() => setBounceRow(row)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                                text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20
                                hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors whitespace-nowrap">
                              <XCircle className="w-3.5 h-3.5" />
                              Bounce
                            </button>
                          )}
                          {isApproved && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5" /> Cleared
                            </span>
                          )}
                          {isBounced && (
                            <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Bounced
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/30 dark:bg-white/[0.01]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records ·
                {selected.size > 0 && <span className="text-blue-600 dark:text-blue-400 font-semibold"> {selected.size} selected</span>}
              </p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Approved: <span className="font-bold text-emerald-700 dark:text-emerald-400">₹{fmt(summary.amount)}</span>
              </p>
            </div>
          </div>

          {/* ── MOBILE CARDS ─────────────────────────────────────────────── */}
          <div className="md:hidden space-y-3">
            {/* Mobile Bulk Action Bar */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-sm">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input type="checkbox"
                  checked={allPendingSelected}
                  onChange={e => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                />
                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-300">
                  {allPendingSelected ? "Deselect All" : "Select All Pending"}
                </span>
                {selected.size > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-500/15 text-blue-700 dark:text-blue-400 text-[11px] font-bold">
                    {selected.size}
                  </span>
                )}
              </label>
              <button onClick={handleApprove} disabled={selected.size === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold text-white
                  bg-emerald-600 hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-40 flex-shrink-0">
                <CheckCircle2 className="w-4 h-4" />
                Approve
              </button>
            </div>

            {/* Cards */}
            {rows.map(row => (
              <MobileFeeCard
                key={row.id}
                row={row}
                checked={selected.has(row.id)}
                onCheck={() => handleToggle(row.id)}
                onBounce={setBounceRow}
                disabled={row.status !== "pending"}
              />
            ))}

            {/* Mobile approved amount footer */}
            {summary.approved > 0 && (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50 dark:bg-emerald-500/5 p-4 text-center">
                <p className="text-[12px] text-emerald-700 dark:text-emerald-400 font-semibold">Total Approved Amount</p>
                <p className="text-[24px] font-extrabold text-emerald-700 dark:text-emerald-400 tabular-nums">₹{fmt(summary.amount)}</p>
                <p className="text-[11px] text-emerald-600 dark:text-emerald-500">{summary.approved} records cleared</p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.15)] flex items-center justify-center">
            <IndianRupee className="w-8 h-8 text-slate-300 dark:text-slate-600" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400">No records to show</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs">
              Select a <strong>fee type</strong>, set your filters and click <strong>Show Records</strong> to load fee deposits for approval.
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              Session is required · Other filters are optional
            </p>
          </div>
        </div>
      )}

      {/* ── Bounce Modal ─────────────────────────────────────────────────── */}
      {bounceRow && (
        <BounceModal
          row={bounceRow}
          onConfirm={handleBounceConfirm}
          onCancel={() => setBounceRow(null)}
        />
      )}

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={dismissToast} />}
    </div>
  );
}
