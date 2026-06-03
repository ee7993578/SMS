/**
 * WaveOffFees.jsx
 * School ERP — Fee Management → Wave Off Fees
 *
 * Features:
 *  - Fee Type toggle: Regular / Transport
 *  - Session dropdown + Admission No. autocomplete
 *  - Grouped installment-wise GridView with per-fee-head wave-off amount + remark
 *  - Submit with validation, toast feedback
 *  - Desktop: data-dense ERP table
 *  - Mobile: card-based accordion layout, thumb-friendly
 *  - Fully responsive, no horizontal scroll
 */

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Search, ChevronDown, ChevronRight, RefreshCw, CheckCircle2,
  AlertCircle, X, Loader2, IndianRupee, FileText, User,
  Calendar, BookOpen, Tag, SlidersHorizontal, ArrowLeft,
  CircleDollarSign, MessageSquare, BadgeCheck, AlertTriangle,
  Receipt, Banknote, Coins, ChevronUp, Info, Bus, GraduationCap,
  CheckSquare, Square, Phone, Users
} from "lucide-react";

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const SESSIONS = ["2022-23", "2023-24", "2024-25", "2025-26"];

const STUDENT_DB = [
  { RegistrationNo: "ADM-2024-001", Name: "Arjun Sharma", Class: "Class X - A", FatherName: "Ramesh Sharma", PhoneNo: "9876543210", ImageUrl: "" },
  { RegistrationNo: "ADM-2024-002", Name: "Priya Gupta", Class: "Class IX - B", FatherName: "Suresh Gupta", PhoneNo: "9876543211", ImageUrl: "" },
  { RegistrationNo: "ADM-2024-003", Name: "Rohan Verma", Class: "Class VIII - A", FatherName: "Mahesh Verma", PhoneNo: "9876543212", ImageUrl: "" },
  { RegistrationNo: "ADM-2024-004", Name: "Sneha Patel", Class: "Class VII - A", FatherName: "Dinesh Patel", PhoneNo: "9876543213", ImageUrl: "" },
  { RegistrationNo: "ADM-2024-005", Name: "Amit Singh", Class: "Class VI - B", FatherName: "Rajesh Singh", PhoneNo: "9876543214", ImageUrl: "" },
  { RegistrationNo: "ADM-2023-010", Name: "Kavya Mishra", Class: "Class XI - A", FatherName: "Sunil Mishra", PhoneNo: "9876543215", ImageUrl: "" },
  { RegistrationNo: "ADM-2023-011", Name: "Dev Tiwari", Class: "Class XII - B", FatherName: "Anil Tiwari", PhoneNo: "9876543216", ImageUrl: "" },
];

// Fee due data per student (Regular)
const FEE_DUE_REGULAR = {
  "ADM-2024-001": [
    {
      installment_no: "Installment 1",
      month_name: "April 2024",
      fees: [
        { id: 1, fee_head_id: "fh1", display_fee_head: "Tuition Fee", balance: 2500, status: 0, WaveOffFeeValue: "", Remark: "" },
        { id: 2, fee_head_id: "fh2", display_fee_head: "Development Fee", balance: 800, status: 0, WaveOffFeeValue: "", Remark: "" },
        { id: 3, fee_head_id: "fh3", display_fee_head: "Computer Fee", balance: 500, status: 0, WaveOffFeeValue: "", Remark: "" },
      ],
    },
    {
      installment_no: "Installment 2",
      month_name: "July 2024",
      fees: [
        { id: 4, fee_head_id: "fh1", display_fee_head: "Tuition Fee", balance: 2500, status: 0, WaveOffFeeValue: "", Remark: "" },
        { id: 5, fee_head_id: "fh4", display_fee_head: "Exam Fee", balance: 600, status: 1, WaveOffFeeValue: "600", Remark: "Medical grounds" },
        { id: 6, fee_head_id: "fh5", display_fee_head: "Library Fee", balance: 300, status: 0, WaveOffFeeValue: "", Remark: "" },
      ],
    },
    {
      installment_no: "Installment 3",
      month_name: "October 2024",
      fees: [
        { id: 7, fee_head_id: "fh1", display_fee_head: "Tuition Fee", balance: 2500, status: 0, WaveOffFeeValue: "", Remark: "" },
        { id: 8, fee_head_id: "fh2", display_fee_head: "Development Fee", balance: 800, status: 0, WaveOffFeeValue: "", Remark: "" },
      ],
    },
  ],
  "ADM-2024-002": [
    {
      installment_no: "Installment 1",
      month_name: "April 2024",
      fees: [
        { id: 1, fee_head_id: "fh1", display_fee_head: "Tuition Fee", balance: 2200, status: 0, WaveOffFeeValue: "", Remark: "" },
        { id: 2, fee_head_id: "fh2", display_fee_head: "Sports Fee", balance: 400, status: 0, WaveOffFeeValue: "", Remark: "" },
      ],
    },
    {
      installment_no: "Installment 2",
      month_name: "July 2024",
      fees: [
        { id: 3, fee_head_id: "fh1", display_fee_head: "Tuition Fee", balance: 2200, status: 0, WaveOffFeeValue: "", Remark: "" },
        { id: 4, fee_head_id: "fh3", display_fee_head: "Computer Fee", balance: 500, status: 0, WaveOffFeeValue: "", Remark: "" },
      ],
    },
  ],
};

const FEE_DUE_TRANSPORT = {
  "ADM-2024-001": [
    {
      installment_no: "Installment 1",
      month_name: "April 2024",
      fees: [
        { id: 1, fee_head_id: "tr1", display_fee_head: "Transport Fee", balance: 1200, status: 0, WaveOffFeeValue: "", Remark: "" },
        { id: 2, fee_head_id: "tr2", display_fee_head: "Bus Maintenance", balance: 200, status: 0, WaveOffFeeValue: "", Remark: "" },
      ],
    },
    {
      installment_no: "Installment 2",
      month_name: "July 2024",
      fees: [
        { id: 3, fee_head_id: "tr1", display_fee_head: "Transport Fee", balance: 1200, status: 0, WaveOffFeeValue: "", Remark: "" },
      ],
    },
  ],
  "ADM-2024-002": [
    {
      installment_no: "Installment 1",
      month_name: "April 2024",
      fees: [
        { id: 1, fee_head_id: "tr1", display_fee_head: "Transport Fee", balance: 1000, status: 0, WaveOffFeeValue: "", Remark: "" },
      ],
    },
  ],
};

// ─── HELPER COMPONENTS ────────────────────────────────────────────────────────

function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);
  return (
    <div className={`fixed bottom-6 left-1/2 z-50 flex items-center gap-3 px-5 py-3.5
      rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
      transition-all duration-300
      ${type === "success" ? "bg-emerald-600 text-white" : type === "error" ? "bg-rose-600 text-white" : "bg-amber-500 text-white"}`}
      style={{ transform: "translateX(-50%)", animation: "toastIn .3s cubic-bezier(.34,1.56,.64,1)" }}>
      <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(16px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === "success" ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : type === "error" ? <AlertCircle className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-70 hover:opacity-100" /></button>
    </div>
  );
}

function Badge({ children, color = "blue" }) {
  const map = {
    blue: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    green: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    amber: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    rose: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    violet: "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
    slate: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  };
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${map[color]}`}>{children}</span>;
}

// Student Info Bar
function StudentInfoBar({ student, onClear }) {
  const initials = student.Name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3 sm:p-4 rounded-xl
      bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1a203a] dark:to-[#1c1f38]
      border border-blue-100 dark:border-[rgba(99,102,241,0.2)]">
      {/* Avatar */}
      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-[13px] font-extrabold flex-shrink-0">
        {initials}
      </div>
      {/* Info grid */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-x-5 gap-y-1 flex-1 min-w-0">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Name</span>
          <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{student.Name}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Adm No.</span>
          <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400">{student.RegistrationNo}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Class</span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{student.Class}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Father</span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{student.FatherName}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Phone</span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{student.PhoneNo}</span>
        </div>
      </div>
      <button onClick={onClear}
        className="self-start sm:self-center p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-300 transition-all">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// Autocomplete dropdown item
function SuggestionItem({ item, onSelect }) {
  const initials = item.Name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <button type="button" onClick={() => onSelect(item)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 dark:hover:bg-white/5 transition-colors text-left">
      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-[11px] font-extrabold flex-shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{item.Name}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 flex-wrap">
          <span className="text-blue-600 dark:text-blue-400 font-semibold">{item.RegistrationNo}</span>
          <span>·</span>
          <span>{item.Class}</span>
        </p>
        <p className="text-[11px] text-slate-400 flex items-center gap-2 flex-wrap">
          <Users className="w-3 h-3" /> {item.FatherName}
          <span>·</span>
          <Phone className="w-3 h-3" /> {item.PhoneNo}
        </p>
      </div>
    </button>
  );
}

// Wave-off summary strip
function WaveOffSummary({ installments }) {
  const totalBalance = installments.reduce((s, inst) => s + inst.fees.reduce((fs, f) => fs + f.balance, 0), 0);
  const totalWaveOff = installments.reduce((s, inst) =>
    s + inst.fees.reduce((fs, f) => fs + (parseFloat(f.WaveOffFeeValue) || 0), 0), 0);
  const waivedCount = installments.reduce((s, inst) =>
    s + inst.fees.filter(f => f.status === 1 || (parseFloat(f.WaveOffFeeValue) > 0)).length, 0);

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-3">
      {[
        { label: "Total Balance", value: `₹${totalBalance.toLocaleString("en-IN")}`, icon: IndianRupee, color: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400", border: "border-blue-100 dark:border-blue-500/20" },
        { label: "Wave Off Amount", value: `₹${totalWaveOff.toLocaleString("en-IN")}`, icon: Coins, color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400", border: "border-emerald-100 dark:border-emerald-500/20" },
        { label: "Waived Heads", value: waivedCount, icon: BadgeCheck, color: "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400", border: "border-violet-100 dark:border-violet-500/20" },
      ].map(({ label, value, icon: Icon, color, border }) => (
        <div key={label} className={`flex items-center gap-2 sm:gap-3 p-2.5 sm:p-3 rounded-xl border ${border} bg-white dark:bg-[#1a1f35]`}>
          <span className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
            <Icon className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── INSTALLMENT CARD (Mobile) ────────────────────────────────────────────────
function MobileInstallmentCard({ installment, instIdx, onChange, onChecked }) {
  const [open, setOpen] = useState(true);
  const waveTotal = installment.fees.reduce((s, f) => s + (parseFloat(f.WaveOffFeeValue) || 0), 0);
  const balance = installment.fees.reduce((s, f) => s + f.balance, 0);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 bg-gradient-to-r from-slate-50 to-white dark:from-[#1e2238] dark:to-[#1a1f35] text-left hover:from-blue-50 hover:to-indigo-50 dark:hover:from-[#1a203a] transition-colors">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Receipt className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-extrabold text-slate-800 dark:text-slate-100">{installment.installment_no}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{installment.month_name}</p>
        </div>
        <div className="text-right flex-shrink-0 mr-1">
          <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">₹{balance.toLocaleString("en-IN")}</p>
          {waveTotal > 0 && <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">-₹{waveTotal.toLocaleString("en-IN")}</p>}
        </div>
        <span className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {/* Fee Rows */}
      {open && (
        <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.07)]">
          {installment.fees.map((fee, fIdx) => (
            <div key={fee.id} className={`px-4 py-3 ${fee.status === 1 ? "bg-emerald-50/50 dark:bg-emerald-500/5" : ""}`}>
              {/* Fee head row */}
              <div className="flex items-start gap-3 mb-2.5">
                <button type="button"
                  onClick={() => onChecked(instIdx, fIdx, fee.status === 1 ? 0 : 1)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all
                    ${fee.status === 1 ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent"}`}>
                  {fee.status === 1 && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{fee.display_fee_head}</p>
                  <p className="text-[11px] text-slate-400">Balance: <span className="font-bold text-rose-600 dark:text-rose-400">₹{fee.balance.toLocaleString("en-IN")}</span></p>
                </div>
                {fee.status === 1 && <Badge color="green">Waived</Badge>}
              </div>
              {/* Wave-off input */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Wave Off (₹)</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[12px]">₹</span>
                    <input
                      type="number"
                      value={fee.WaveOffFeeValue}
                      onChange={e => onChange(instIdx, fIdx, "WaveOffFeeValue", e.target.value)}
                      placeholder="0"
                      min="0"
                      max={fee.balance}
                      className="w-full pl-6 pr-2 py-2 text-[13px] font-semibold rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                        bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-100
                        focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
                    />
                  </div>
                  {parseFloat(fee.WaveOffFeeValue) > fee.balance && (
                    <p className="text-[10px] text-rose-500 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Exceeds balance</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Remark</label>
                  <input
                    type="text"
                    value={fee.Remark}
                    onChange={e => onChange(instIdx, fIdx, "Remark", e.target.value)}
                    placeholder="Enter remark"
                    className="w-full px-2.5 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                      bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-100 placeholder-slate-300
                      focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── INSTALLMENT TABLE (Desktop) ──────────────────────────────────────────────
function DesktopInstallmentTable({ installment, instIdx, onChange, onChecked }) {
  const [open, setOpen] = useState(true);
  const waveTotal = installment.fees.reduce((s, f) => s + (parseFloat(f.WaveOffFeeValue) || 0), 0);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button type="button" onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-4 px-5 py-3.5 bg-gradient-to-r from-slate-50 to-white dark:from-[#1e2238] dark:to-[#1a1f35] hover:from-blue-50 hover:to-indigo-50 dark:hover:from-[#1a203a] transition-colors border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
        <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Receipt className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 flex items-center gap-4 flex-wrap">
          <span className="text-[14px] font-extrabold text-slate-800 dark:text-slate-100">{installment.installment_no}</span>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{installment.month_name}</span>
          </div>
          {waveTotal > 0 && (
            <Badge color="green">Wave Off: ₹{waveTotal.toLocaleString("en-IN")}</Badge>
          )}
        </div>
        <span className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {/* Table */}
      {open && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                <th className="w-10 px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400"></th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">Fee Head</th>
                <th className="px-4 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400 w-28">Balance (₹)</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400 w-44">Wave Off Amount (₹)</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">Remark</th>
                <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-400 w-24">Status</th>
              </tr>
            </thead>
            <tbody>
              {installment.fees.map((fee, fIdx) => {
                const hasError = parseFloat(fee.WaveOffFeeValue) > fee.balance;
                return (
                  <tr key={fee.id}
                    className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
                      ${fee.status === 1 ? "bg-emerald-50/40 dark:bg-emerald-500/[0.04]" : "hover:bg-slate-50/50 dark:hover:bg-white/[0.02]"}`}>
                    {/* Checkbox */}
                    <td className="px-4 py-3 text-center">
                      <button type="button"
                        onClick={() => onChecked(instIdx, fIdx, fee.status === 1 ? 0 : 1)}
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center mx-auto transition-all
                          ${fee.status === 1 ? "bg-emerald-500 border-emerald-500" : "border-slate-300 dark:border-slate-600 bg-white dark:bg-transparent"}`}>
                        {fee.status === 1 && <CheckCircle2 className="w-3 h-3 text-white" />}
                      </button>
                    </td>
                    {/* Fee Head */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{fee.display_fee_head}</span>
                      </div>
                    </td>
                    {/* Balance */}
                    <td className="px-4 py-3 text-right">
                      <span className="text-[13px] font-bold text-rose-600 dark:text-rose-400 tabular-nums">
                        ₹{fee.balance.toLocaleString("en-IN")}
                      </span>
                    </td>
                    {/* Wave Off Input */}
                    <td className="px-4 py-3">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[12px]">₹</span>
                        <input
                          type="number"
                          value={fee.WaveOffFeeValue}
                          onChange={e => onChange(instIdx, fIdx, "WaveOffFeeValue", e.target.value)}
                          placeholder="0"
                          min="0"
                          max={fee.balance}
                          className={`w-full pl-6 pr-2 py-1.5 text-[13px] font-semibold rounded-lg border
                            bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-100
                            focus:outline-none focus:ring-2 transition-all
                            ${hasError
                              ? "border-rose-400 focus:border-rose-400 focus:ring-rose-100 dark:focus:ring-rose-500/20"
                              : "border-slate-200 dark:border-[rgba(99,102,241,0.25)] focus:border-blue-400 focus:ring-blue-100 dark:focus:border-indigo-400"}`}
                        />
                        {hasError && (
                          <p className="absolute -bottom-4 left-0 text-[10px] text-rose-500 flex items-center gap-0.5 whitespace-nowrap">
                            <AlertCircle className="w-3 h-3" /> Exceeds balance
                          </p>
                        )}
                      </div>
                    </td>
                    {/* Remark */}
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={fee.Remark}
                        onChange={e => onChange(instIdx, fIdx, "Remark", e.target.value)}
                        placeholder="Optional remark"
                        className="w-full px-3 py-1.5 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
                          bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-100 placeholder-slate-300
                          focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400 transition-all"
                      />
                    </td>
                    {/* Status */}
                    <td className="px-4 py-3 text-center">
                      {fee.status === 1
                        ? <Badge color="green">Waived</Badge>
                        : parseFloat(fee.WaveOffFeeValue) > 0
                          ? <Badge color="amber">Pending</Badge>
                          : <Badge color="slate">Due</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function WaveOffFees() {
  // Filters
  const [feeType, setFeeType] = useState("regular"); // regular | transport
  const [session, setSession] = useState("2024-25");
  const [admNo, setAdmNo] = useState("");
  const [admInput, setAdmInput] = useState("");

  // Student
  const [student, setStudent] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const admInputRef = useRef(null);
  const suggestRef = useRef(null);

  // Data
  const [installments, setInstallments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [shown, setShown] = useState(false);

  // UI
  const [toast, setToast] = useState(null);
  const [errors, setErrors] = useState({});
  const [activeTab, setActiveTab] = useState(0); // for mobile tab view

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
  }, []);

  // ── Autocomplete ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (admInput.length < 1) { setSuggestions([]); return; }
    const q = admInput.toLowerCase();
    const filtered = STUDENT_DB.filter(s =>
      s.RegistrationNo.toLowerCase().includes(q) ||
      s.Name.toLowerCase().includes(q)
    );
    setSuggestions(filtered.slice(0, 5));
    setShowSuggestions(true);
  }, [admInput]);

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e) => {
      if (!admInputRef.current?.contains(e.target) && !suggestRef.current?.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelectStudent = (s) => {
    setStudent(s);
    setAdmNo(s.RegistrationNo);
    setAdmInput(s.RegistrationNo);
    setShowSuggestions(false);
    setErrors(p => ({ ...p, admNo: undefined }));
  };

  const clearStudent = () => {
    setStudent(null);
    setAdmNo("");
    setAdmInput("");
    setInstallments([]);
    setShown(false);
  };

  // ── Show Data ─────────────────────────────────────────────────────────────
  const handleShow = () => {
    const err = {};
    if (!session) err.session = "Select session";
    if (!admNo) err.admNo = "Enter admission number";
    if (Object.keys(err).length) { setErrors(err); showToast("Please fill required fields", "error"); return; }
    setErrors({});
    setLoading(true);
    setShown(false);

    setTimeout(() => {
      const db = feeType === "regular" ? FEE_DUE_REGULAR : FEE_DUE_TRANSPORT;
      const data = db[admNo];
      if (!data || data.length === 0) {
        showToast("No fee dues found for this student", "warning");
        setInstallments([]);
        setShown(false);
      } else {
        // Deep clone so edits don't mutate source
        setInstallments(JSON.parse(JSON.stringify(data)));
        setShown(true);
        showToast(`Loaded ${data.length} installment(s) for ${feeType} fee`);
      }
      setLoading(false);
    }, 700);
  };

  const handleReset = () => {
    clearStudent();
    setErrors({});
    setShown(false);
    setInstallments([]);
  };

  // ── Field change ──────────────────────────────────────────────────────────
  const handleFieldChange = useCallback((instIdx, feeIdx, field, value) => {
    setInstallments(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[instIdx].fees[feeIdx][field] = value;
      // Auto-check if wave-off amount entered
      if (field === "WaveOffFeeValue" && parseFloat(value) > 0) {
        updated[instIdx].fees[feeIdx].status = 1;
      } else if (field === "WaveOffFeeValue" && (!value || parseFloat(value) === 0)) {
        updated[instIdx].fees[feeIdx].status = 0;
      }
      return updated;
    });
  }, []);

  const handleChecked = useCallback((instIdx, feeIdx, newStatus) => {
    setInstallments(prev => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated[instIdx].fees[feeIdx].status = newStatus;
      if (newStatus === 0) {
        updated[instIdx].fees[feeIdx].WaveOffFeeValue = "";
      }
      return updated;
    });
  }, []);

  // ── Validate & Submit ─────────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate no wave-off exceeds balance
    let hasError = false;
    for (const inst of installments) {
      for (const fee of inst.fees) {
        if (parseFloat(fee.WaveOffFeeValue) > fee.balance) { hasError = true; break; }
      }
    }
    if (hasError) { showToast("Wave off amount cannot exceed balance for any fee head", "error"); return; }

    const waivedRows = installments.flatMap(inst =>
      inst.fees.filter(f => f.status === 1 || parseFloat(f.WaveOffFeeValue) > 0)
    );
    if (waivedRows.length === 0) { showToast("Please enter wave off amount for at least one fee head", "warning"); return; }

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast(`Wave off saved successfully for ${waivedRows.length} fee head(s)!`);
    }, 1200);
  };

  // ── Stats ─────────────────────────────────────────────────────────────────
  const totalWaveOff = useMemo(() =>
    installments.reduce((s, inst) =>
      s + inst.fees.reduce((fs, f) => fs + (parseFloat(f.WaveOffFeeValue) || 0), 0), 0),
    [installments]);

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#11142b] p-3 sm:p-5 space-y-4 pb-20">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[12px] text-slate-400 dark:text-slate-500 mb-1">
            <span>Home</span>
            <ChevronRight className="w-3 h-3" />
            <span>Fee Management</span>
            <ChevronRight className="w-3 h-3" />
            <span className="text-blue-600 dark:text-blue-400 font-semibold">Wave Off Fees</span>
          </div>
          <h1 className="text-[20px] sm:text-[22px] font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center flex-shrink-0">
              <Coins className="w-4 h-4 text-white" />
            </div>
            Wave Off Fees
          </h1>
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
            Waive fee dues for students — installment-wise, fee head-wise
          </p>
        </div>
      </div>

      {/* ── Filter Card ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500" />
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Search Filters</span>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Fee Type Toggle */}
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 block mb-2">
              Fee Type
            </label>
            <div className="inline-flex rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] overflow-hidden p-1 gap-1 bg-slate-50 dark:bg-[#1e2238]">
              {[
                { value: "regular", label: "Regular", icon: BookOpen },
                { value: "transport", label: "Transport", icon: Bus },
              ].map(({ value, label, icon: Icon }) => (
                <button key={value} type="button" onClick={() => { setFeeType(value); setShown(false); setInstallments([]); }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all
                    ${feeType === value
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Session + AdmNo row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Session */}
            <div>
              <label className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 block mb-1.5">
                Session <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select value={session}
                  onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })); }}
                  className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 cursor-pointer
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                    ${errors.session ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200 dark:border-[rgba(99,102,241,0.25)]"}`}>
                  <option value="">-- Select Session --</option>
                  {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              </div>
              {errors.session && <p className="text-[11px] text-rose-500 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.session}</p>}
            </div>

            {/* Admission No with Autocomplete */}
            <div className="sm:col-span-1 lg:col-span-2 relative">
              <label className="text-[12px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 block mb-1.5">
                Admission No. <span className="text-rose-500">*</span>
              </label>
              <div className="relative" ref={admInputRef}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={admInput}
                  onChange={e => { setAdmInput(e.target.value); setAdmNo(e.target.value); setErrors(p => ({ ...p, admNo: undefined })); }}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  placeholder="Type Admission No. or Name to search..."
                  autoComplete="off"
                  className={`w-full pl-9 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                    bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 placeholder-slate-300 dark:placeholder-slate-600
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
                    ${errors.admNo ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200 dark:border-[rgba(99,102,241,0.25)]"}`}
                />
                {admInput && (
                  <button type="button" onClick={clearStudent}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {errors.admNo && <p className="text-[11px] text-rose-500 mt-0.5 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.admNo}</p>}

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestRef}
                  className="absolute top-full left-0 right-0 z-30 mt-1 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1a1f35] shadow-2xl overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50 dark:bg-white/[0.02]">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">{suggestions.length} result(s)</span>
                  </div>
                  {suggestions.map(s => (
                    <SuggestionItem key={s.RegistrationNo} item={s} onSelect={handleSelectStudent} />
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white
                  bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300
                  hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Student Info ─────────────────────────────────────────────────── */}
      {student && <StudentInfoBar student={student} onClear={clearStudent} />}

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-8 flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-[13px] text-slate-500 dark:text-slate-400">Fetching fee dues…</p>
          <div className="w-full space-y-2 max-w-md">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Fee Data ─────────────────────────────────────────────────────── */}
      {shown && !loading && installments.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Summary Strip */}
          <WaveOffSummary installments={installments} />

          {/* Info hint */}
          <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-blue-700 dark:text-blue-300">
              Enter wave off amount for each fee head. Check the checkbox or enter an amount to mark a fee as waived. Amount cannot exceed the balance due.
            </p>
          </div>

          {/* ── DESKTOP TABLE VIEW ── */}
          <div className="hidden md:flex flex-col gap-4">
            {installments.map((inst, instIdx) => (
              <DesktopInstallmentTable
                key={instIdx}
                installment={inst}
                instIdx={instIdx}
                onChange={handleFieldChange}
                onChecked={handleChecked}
              />
            ))}
          </div>

          {/* ── MOBILE: Tab navigation for installments ── */}
          <div className="md:hidden space-y-3">
            {/* Installment Tabs */}
            {installments.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                {installments.map((inst, idx) => (
                  <button key={idx} type="button"
                    onClick={() => setActiveTab(idx)}
                    className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all
                      ${activeTab === idx
                        ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                        : "bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-600 dark:text-slate-400"}`}>
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Inst {idx + 1}</span>
                  </button>
                ))}
                <button type="button"
                  onClick={() => setActiveTab(-1)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[12px] font-bold transition-all
                    ${activeTab === -1
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-600 dark:text-slate-400"}`}>
                  All
                </button>
              </div>
            )}

            {/* Show active tab or all */}
            {installments.map((inst, instIdx) => (
              (activeTab === -1 || activeTab === instIdx || installments.length === 1) && (
                <MobileInstallmentCard
                  key={instIdx}
                  installment={inst}
                  instIdx={instIdx}
                  onChange={handleFieldChange}
                  onChecked={handleChecked}
                />
              )
            ))}
          </div>

          {/* ── Submit Button ── */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
            <button type="submit" disabled={submitting}
              className="flex-1 sm:flex-initial sm:min-w-[180px] flex items-center justify-center gap-2 py-3 px-6 rounded-xl text-[14px] font-extrabold
                text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                shadow-lg shadow-blue-500/25 transition-all active:scale-95 disabled:opacity-70">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <BadgeCheck className="w-4 h-4" />}
              {submitting ? "Saving…" : "Submit Wave Off"}
            </button>
            {totalWaveOff > 0 && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                <Coins className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[13px] font-bold text-emerald-700 dark:text-emerald-400">
                  Total Wave Off: ₹{totalWaveOff.toLocaleString("en-IN")}
                </span>
              </div>
            )}
          </div>
        </form>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {!loading && !shown && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <CircleDollarSign className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400">No data loaded</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
              Select fee type, session and enter admission number, then click <strong>Show</strong>.
            </p>
          </div>
          {/* Quick guide */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2 max-w-lg w-full">
            {[
              { icon: SlidersHorizontal, label: "1. Select Fee Type", desc: "Regular or Transport" },
              { icon: Calendar, label: "2. Pick Session", desc: "Academic year" },
              { icon: User, label: "3. Enter Adm. No.", desc: "Student admission number" },
            ].map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.15)] shadow-sm text-center">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300">{label}</p>
                <p className="text-[11px] text-slate-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* No-scrollbar utility */}
      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
}
