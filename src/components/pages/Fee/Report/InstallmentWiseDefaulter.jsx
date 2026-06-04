/**
 * InstallmentWiseDefaulter.jsx
 * Installment Wise Defaulter Report — React + Tailwind CSS
 * Converted from legacy ASPX page
 *
 * Features:
 * - Type selector (Regular / Transport)
 * - Session dropdown
 * - Installment dropdown (dynamic based on type)
 * - Responsive table (desktop) / cards (mobile)
 * - Export to CSV
 * - Toast notifications
 * - Loading states, empty states
 * - Summary stats (Total defaulters, total payable, total installment due)
 */

import { useState, useMemo, useCallback } from "react";
import {
  AlertCircle, X, Check, Loader2, ChevronDown,
  RefreshCw, Search, FileSpreadsheet,
  Eye, SlidersHorizontal, Filter,
  Phone, User, School, Hash, Wallet,
  CreditCard, TrendingDown, Users,
  ChevronRight, Info, Bus, BookOpen,
  Calendar, BarChart3, Receipt
} from "lucide-react";

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SESSIONS = ["2022-23", "2023-24", "2024-25", "2025-26"];

const INSTALLMENTS_REGULAR = [
  { value: "1", label: "Installment 1 (April)" },
  { value: "2", label: "Installment 2 (July)" },
  { value: "3", label: "Installment 3 (October)" },
  { value: "4", label: "Installment 4 (January)" },
];

const INSTALLMENTS_TRANSPORT = [
  { value: "1", label: "Transport Installment 1 (Apr-Jun)" },
  { value: "2", label: "Transport Installment 2 (Jul-Sep)" },
  { value: "3", label: "Transport Installment 3 (Oct-Dec)" },
  { value: "4", label: "Transport Installment 4 (Jan-Mar)" },
];

// Dummy defaulter data generator
const generateDefaulters = (type, session, installment) => {
  const regularNames = [
    { name: "Rahul Kumar Sharma", father: "Ramesh Sharma", class: "Class X-A" },
    { name: "Priya Singh", father: "Rajendra Singh", class: "Class IX-B" },
    { name: "Amit Verma", father: "Suresh Verma", class: "Class VIII-A" },
    { name: "Sneha Gupta", father: "Mukesh Gupta", class: "Class VII-B" },
    { name: "Ravi Pandey", father: "Vinod Pandey", class: "Class XI-A" },
    { name: "Kavya Mishra", father: "Dinesh Mishra", class: "Class VI-A" },
    { name: "Arjun Tiwari", father: "Santosh Tiwari", class: "Class XII-B" },
    { name: "Neha Yadav", father: "Mahendra Yadav", class: "Class X-B" },
    { name: "Shubham Saxena", father: "Pramod Saxena", class: "Class IX-A" },
    { name: "Divya Chauhan", father: "Naresh Chauhan", class: "Class VII-A" },
    { name: "Vikas Rawat", father: "Deepak Rawat", class: "Class VIII-B" },
    { name: "Pooja Negi", father: "Hemant Negi", class: "Class XI-B" },
    { name: "Ankur Bisht", father: "Girish Bisht", class: "Class VI-B" },
    { name: "Ritu Joshi", father: "Ramesh Joshi", class: "Class XII-A" },
    { name: "Gaurav Pant", father: "Manoj Pant", class: "Class X-A" },
  ];
  const transportNames = [
    { name: "Mohit Dhawan", father: "Rajiv Dhawan", class: "Class IX-A" },
    { name: "Aarti Bhatt", father: "Sanjay Bhatt", class: "Class X-B" },
    { name: "Kiran Lohani", father: "Vinay Lohani", class: "Class VIII-A" },
    { name: "Sumit Arya", father: "Anil Arya", class: "Class XI-A" },
    { name: "Preeti Kandpal", father: "Sunil Kandpal", class: "Class VII-B" },
    { name: "Deepak Bora", father: "Trilok Bora", class: "Class VI-A" },
    { name: "Anita Mehta", father: "Rakesh Mehta", class: "Class XII-A" },
    { name: "Rohit Bhatt", father: "Mohan Bhatt", class: "Class IX-B" },
    { name: "Swati Kapoor", father: "Girish Kapoor", class: "Class X-A" },
    { name: "Nitin Jain", father: "Harish Jain", class: "Class VIII-B" },
  ];

  const pool = type === "Transport" ? transportNames : regularNames;
  const seed = parseInt(session.replace(/\D/g, "").slice(0, 2)) + parseInt(installment);
  const count = 5 + (seed % 8);
  const admBase = type === "Transport" ? 3000 : 1000;
  const payableBase = type === "Transport" ? [1200, 1500, 1800, 2000] : [3500, 4200, 5000, 6500, 7200];
  const insBase = type === "Transport" ? [1200, 1500, 1800, 2000] : [3500, 4200, 5000, 6500];

  return pool.slice(0, count).map((s, i) => ({
    adm_no: `${admBase + (seed * 10) + i + 1}`,
    name: s.name,
    class: s.class,
    father_name: s.father,
    mobile_no: `98${String(70000000 + seed * 1000 + i).slice(0, 8)}`,
    payable: payableBase[i % payableBase.length],
    ins: insBase[i % insBase.length],
  }));
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CLASS_TAG_COLORS = [
  "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
  "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
];
const classTagColor = (cls = "") =>
  CLASS_TAG_COLORS[cls.charCodeAt(6) % CLASS_TAG_COLORS.length];

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// Export to CSV
const exportCSV = (rows, session, installment, type) => {
  const headers = ["S.No.", "Adm No.", "Name", "Class", "Father Name", "Mobile No.", "Payable (₹)", "Installment (₹)"];
  const csvRows = [
    [`Installment Wise Defaulter Report — ${type} | Session: ${session} | ${installment}`],
    headers,
    ...rows.map((r, i) => [i + 1, r.adm_no, r.name, r.class, r.father_name, r.mobile_no, r.payable, r.ins]),
  ];
  const csv = csvRows.map((r) => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Defaulter_${type}_${session}_Inst${installment}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer font-medium
          bg-white text-slate-800
          focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200 hover:border-slate-300"}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

function Field({ label, error, required, children, icon: Icon }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 text-[11.5px] font-bold text-slate-500 uppercase tracking-wider">
        {Icon && <Icon className="w-3 h-3" />}
        {label}
        {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  );
}

function Toast({ message, type = "success", onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
        ${type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
      style={{ animation: "slideUp .3s ease" }}
    >
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-75 hover:opacity-100"><X className="w-4 h-4" /></button>
    </div>
  );
}

// ─── TYPE TOGGLE ──────────────────────────────────────────────────────────────

function TypeToggle({ value, onChange }) {
  return (
    <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 gap-1 w-full sm:w-auto">
      {["Regular", "Transport"].map((t) => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-[13px] font-bold transition-all duration-200
            ${value === t
              ? t === "Regular"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                : "bg-amber-500 text-white shadow-md shadow-amber-200"
              : "text-slate-500 hover:text-slate-700 hover:bg-white"
            }`}
        >
          {t === "Regular" ? <BookOpen className="w-3.5 h-3.5" /> : <Bus className="w-3.5 h-3.5" />}
          {t}
        </button>
      ))}
    </div>
  );
}

// ─── SUMMARY CARDS ────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, sub, color }) {
  const configs = {
    rose:    { wrap: "bg-rose-50 border-rose-100",    icon: "bg-rose-100 text-rose-600",    val: "text-rose-700",    sub: "text-rose-500"    },
    indigo:  { wrap: "bg-indigo-50 border-indigo-100",icon: "bg-indigo-100 text-indigo-600",val: "text-indigo-700",  sub: "text-indigo-500"  },
    amber:   { wrap: "bg-amber-50 border-amber-100",  icon: "bg-amber-100 text-amber-600",  val: "text-amber-700",   sub: "text-amber-500"   },
    emerald: { wrap: "bg-emerald-50 border-emerald-100", icon: "bg-emerald-100 text-emerald-600", val: "text-emerald-700", sub: "text-emerald-500" },
  };
  const c = configs[color];
  return (
    <div className={`flex items-center gap-3.5 rounded-2xl border ${c.wrap} px-4 py-3.5 shadow-sm flex-1 min-w-0`}>
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${c.icon}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className={`text-[22px] font-extrabold tabular-nums leading-tight ${c.val}`}>{value}</p>
        <p className="text-[11px] text-slate-500 font-medium truncate">{label}</p>
        {sub && <p className={`text-[10px] font-semibold truncate ${c.sub}`}>{sub}</p>}
      </div>
    </div>
  );
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx }) {
  return (
    <tr className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors group">
      <td className="px-4 py-3 text-center">
        <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-600 text-[12px] font-bold inline-flex items-center justify-center transition-colors">
          {idx}
        </span>
      </td>
      <td className="px-4 py-3">
        <span className="text-[12px] font-bold text-slate-600 font-mono tracking-wide">{row.adm_no}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
            {row.name.charAt(0)}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-800 whitespace-nowrap">{row.name}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-bold ${classTagColor(row.class)}`}>
          {row.class}
        </span>
      </td>
      <td className="px-4 py-3">
        <p className="text-[13px] text-slate-600 font-medium whitespace-nowrap">{row.father_name}</p>
      </td>
      <td className="px-4 py-3">
        <a href={`tel:${row.mobile_no}`} className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-600 hover:text-indigo-600 transition-colors group/phone">
          <Phone className="w-3.5 h-3.5 text-slate-400 group-hover/phone:text-indigo-500" />
          {row.mobile_no}
        </a>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-[13px] font-bold text-rose-600 tabular-nums">{fmt(row.payable)}</span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[13px] font-bold bg-rose-50 text-rose-700 border border-rose-100 tabular-nums">
          {fmt(row.ins)}
        </span>
      </td>
    </tr>
  );
}

// ─── MOBILE DEFAULTER CARD ────────────────────────────────────────────────────

function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-2xl border bg-white overflow-hidden shadow-sm transition-all duration-200
      ${expanded ? "border-rose-200 shadow-rose-100" : "border-slate-200"}`}>
      
      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-slate-50 transition-colors"
      >
        {/* Avatar */}
        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 text-white text-[13px] font-extrabold flex items-center justify-center flex-shrink-0 shadow-sm">
          {row.name.charAt(0)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 truncate">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${classTagColor(row.class)}`}>
              {row.class}
            </span>
            <span className="text-[11px] text-slate-400 font-mono"># {row.adm_no}</span>
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 gap-0.5">
          <span className="text-[16px] font-extrabold text-rose-600 tabular-nums">{fmt(row.ins)}</span>
          <span className="text-[10px] text-slate-400 font-medium">due</span>
        </div>

        <ChevronRight className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200 ml-1 ${expanded ? "rotate-90" : ""}`} />
      </button>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50/50 px-4 pt-3 pb-4 space-y-3">
          
          {/* Info rows */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <User className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-[12px] text-slate-500 w-20 flex-shrink-0">Father</span>
              <span className="text-[13px] font-semibold text-slate-700">{row.father_name}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-[12px] text-slate-500 w-20 flex-shrink-0">Mobile</span>
              <a href={`tel:${row.mobile_no}`} className="text-[13px] font-semibold text-indigo-600">{row.mobile_no}</a>
            </div>
          </div>

          {/* Fee cards */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="rounded-xl bg-white border border-slate-200 p-3 text-center shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-1">Total Payable</p>
              <p className="text-[18px] font-extrabold text-slate-700 tabular-nums">{fmt(row.payable)}</p>
            </div>
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-center shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wide text-rose-500 mb-1">Installment Due</p>
              <p className="text-[18px] font-extrabold text-rose-700 tabular-nums">{fmt(row.ins)}</p>
            </div>
          </div>

          {/* Call to action */}
          <a
            href={`tel:${row.mobile_no}`}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 text-white text-[13px] font-bold shadow-md shadow-indigo-200 active:scale-95 transition-transform"
          >
            <Phone className="w-4 h-4" />
            Call Parent Now
          </a>
        </div>
      )}
    </div>
  );
}

// ─── FILTER DRAWER (Mobile) ───────────────────────────────────────────────────

function FilterDrawer({ open, onClose, type, setType, session, setSession, installment, setInstallment, onShow, loading, errors, installments }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white border-t border-slate-200 shadow-2xl"
        style={{ animation: "drawerUp .3s ease" }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            <span className="text-[14px] font-bold text-slate-800">Report Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <Field label="Type" icon={Receipt}>
            <TypeToggle value={type} onChange={setType} />
          </Field>

          <Field label="Session" error={errors.session} required icon={Calendar}>
            <NativeSelect value={session} onChange={(e) => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Installment" error={errors.installment} required icon={CreditCard}>
            <NativeSelect value={installment} onChange={(e) => setInstallment(e.target.value)} placeholder="-- Select Installment --" error={errors.installment}>
              {installments.map((inst) => <option key={inst.value} value={inst.value}>{inst.label}</option>)}
            </NativeSelect>
          </Field>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose(); }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 shadow-md shadow-indigo-200 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function InstallmentWiseDefaulter() {
  const [type,        setType]        = useState("Regular");
  const [session,     setSession]     = useState("");
  const [installment, setInstallment] = useState("");
  const [rows,        setRows]        = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [exporting,   setExporting]   = useState(false);
  const [filterOpen,  setFilterOpen]  = useState(false);
  const [search,      setSearch]      = useState("");
  const [errors,      setErrors]      = useState({});
  const [toast,       setToast]       = useState(null);
  const [shown,       setShown]       = useState(false);
  const [shownMeta,   setShownMeta]   = useState({ type: "", session: "", installment: "" });

  const installments = type === "Transport" ? INSTALLMENTS_TRANSPORT : INSTALLMENTS_REGULAR;

  const showToast = (msg, type_ = "success") => {
    setToast({ msg, type: type_ });
    setTimeout(() => setToast(null), 3500);
  };

  // Handle type change — reset installment
  const handleTypeChange = useCallback((t) => {
    setType(t);
    setInstallment("");
    setRows([]);
    setShown(false);
    setSearch("");
  }, []);

  // Validate & fetch
  const handleShow = useCallback(() => {
    const err = {};
    if (!session)     err.session     = "Please select a session";
    if (!installment) err.installment = "Please select an installment";
    if (Object.keys(err).length) { setErrors(err); return; }
    setErrors({});
    setLoading(true);
    setSearch("");

    setTimeout(() => {
      const data = generateDefaulters(type, session, installment);
      setRows(data);
      setShown(true);
      setShownMeta({ type, session, installment });
      setLoading(false);
      if (data.length === 0) {
        showToast("No defaulters found for selected criteria.", "success");
      } else {
        showToast(`Found ${data.length} defaulter${data.length > 1 ? "s" : ""} for ${session}.`);
      }
    }, 750);
  }, [type, session, installment]);

  const handleReset = () => {
    setSession(""); setInstallment(""); setRows([]);
    setErrors({}); setShown(false); setSearch(""); setShownMeta({ type: "", session: "", installment: "" });
  };

  // Export
  const handleExport = () => {
    if (rows.length === 0) { showToast("No data to export.", "error"); return; }
    setExporting(true);
    const instLabel = installments.find((i) => i.value === shownMeta.installment)?.label || shownMeta.installment;
    setTimeout(() => {
      exportCSV(filteredRows, shownMeta.session, instLabel, shownMeta.type);
      setExporting(false);
      showToast("Exported successfully!");
    }, 600);
  };

  // Search filter
  const filteredRows = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter((r) =>
      r.name.toLowerCase().includes(q) ||
      r.adm_no.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.father_name.toLowerCase().includes(q) ||
      r.mobile_no.includes(q)
    );
  }, [rows, search]);

  // Totals
  const totals = useMemo(() => ({
    count:   filteredRows.length,
    payable: filteredRows.reduce((s, r) => s + r.payable, 0),
    ins:     filteredRows.reduce((s, r) => s + r.ins, 0),
  }), [filteredRows]);

  const hasResults = shown && rows.length > 0;
  const instLabel  = installments.find((i) => i.value === shownMeta.installment)?.label || "";

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-5 pb-12 font-sans">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
              <TrendingDown className="w-5 h-5 text-rose-600" />
            </span>
            <h1 className="text-[20px] sm:text-[22px] font-extrabold text-slate-900 tracking-tight">
              Installment Wise Defaulter
            </h1>
          </div>
          <p className="text-[13px] text-slate-500 pl-0 sm:pl-11.5">
            Track students who have not paid their installment on time.
          </p>
        </div>

        {/* Export button — desktop */}
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-bold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-200
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export CSV
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
          <Filter className="w-4 h-4 text-indigo-500 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 flex-1">Search Filters</span>
        </div>

        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Type */}
            <Field label="Select Type" icon={Receipt}>
              <TypeToggle value={type} onChange={handleTypeChange} />
            </Field>

            {/* Session */}
            <Field label="Session" error={errors.session} required icon={Calendar}>
              <NativeSelect
                value={session}
                onChange={(e) => { setSession(e.target.value); setErrors((p) => ({ ...p, session: undefined })); }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Installment */}
            <Field label="Installment" error={errors.installment} required icon={CreditCard}>
              <NativeSelect
                value={installment}
                onChange={(e) => { setInstallment(e.target.value); setErrors((p) => ({ ...p, installment: undefined })); }}
                placeholder="-- Select Installment --"
                error={errors.installment}
              >
                {installments.map((inst) => <option key={inst.value} value={inst.value}>{inst.label}</option>)}
              </NativeSelect>
            </Field>

            {/* Actions */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white
                  bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Submit
              </button>
              <button type="button" onClick={handleReset}
                className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                title="Reset">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold
            bg-indigo-600 text-white shadow-md shadow-indigo-200 active:scale-95 transition-all">
          <SlidersHorizontal className="w-4 h-4" />
          {session && installment ? `${session} · Inst ${installment}` : "Set Filters"}
          {(session || installment) && (
            <span className="bg-white/25 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
              {[session, installment].filter(Boolean).length}
            </span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="px-4 py-3 rounded-xl bg-emerald-600 text-white shadow-sm disabled:opacity-70 active:scale-95 transition-all">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-3 rounded-xl bg-slate-200 text-slate-600 active:scale-95 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        type={type}
        setType={handleTypeChange}
        session={session}
        setSession={setSession}
        installment={installment}
        setInstallment={setInstallment}
        onShow={handleShow}
        loading={loading}
        errors={errors}
        installments={installments}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-sm">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
          <p className="text-center text-[12px] text-slate-400 font-medium mt-4">Fetching defaulters…</p>
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Context Banner */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 rounded-xl bg-rose-50 border border-rose-100">
            <TrendingDown className="w-4 h-4 text-rose-500 flex-shrink-0" />
            <span className="text-[13px] font-bold text-rose-700">
              {shownMeta.type} Defaulters
            </span>
            <span className="text-[12px] text-rose-500">·</span>
            <span className="text-[12px] text-rose-600 font-medium">Session {shownMeta.session}</span>
            <span className="text-[12px] text-rose-500">·</span>
            <span className="text-[12px] text-rose-600 font-medium">{instLabel}</span>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SummaryCard icon={Users}      label="Total Defaulters" value={totals.count}                          color="rose"    />
            <SummaryCard icon={Wallet}     label="Total Payable"    value={fmt(totals.payable)}                   color="indigo"  />
            <SummaryCard icon={CreditCard} label="Amount Due"       value={fmt(totals.ins)} sub="Installment Pending" color="amber"   />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-slate-50/80">
              <div className="flex items-center gap-2.5 flex-1 flex-wrap gap-y-1.5">
                <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
                <Hash className="w-4 h-4 text-rose-500 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700">Defaulter List</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex-shrink-0">
                  {filteredRows.length} student{filteredRows.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Search bar */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, class, adm…"
                  className="w-full pl-9 pr-8 py-2 text-[12px] rounded-xl border border-slate-200 outline-none
                    bg-white text-slate-700 placeholder-slate-300
                    focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info strip */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 bg-amber-50/40">
              <Info className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
              <p className="text-[12px] text-amber-700 font-medium">
                Tap a student card to see full details and contact parent directly.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filteredRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                  <Search className="w-8 h-8 opacity-30" />
                  <p className="text-[13px]">No records match your search.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      {["S.No.", "Adm No.", "Student Name", "Class", "Father Name", "Mobile No.", "Payable", "Installment"].map((h, i) => (
                        <th key={i}
                          className={`px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 whitespace-nowrap
                            ${i === 0 ? "text-center w-14" : i >= 6 ? "text-right" : "text-left"}`}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row, i) => (
                      <DesktopRow key={row.adm_no} row={row} idx={i + 1} />
                    ))}
                    {/* Total row */}
                    <tr className="border-t-2 border-rose-200 bg-rose-50/60">
                      <td colSpan={6} className="px-4 py-3">
                        <span className="flex items-center gap-2 text-[13px] font-extrabold text-rose-700">
                          <TrendingDown className="w-4 h-4" />
                          Total ({filteredRows.length} defaulters)
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-[14px] font-extrabold text-rose-700 tabular-nums">{fmt(totals.payable)}</span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[14px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 tabular-nums">
                          {fmt(totals.ins)}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filteredRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                  <Search className="w-8 h-8 opacity-30" />
                  <p className="text-[13px]">No records match your search.</p>
                </div>
              ) : (
                <>
                  {filteredRows.map((row, i) => (
                    <MobileCard key={row.adm_no} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Total Card */}
                  <div className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-4">
                    <p className="text-[12px] font-extrabold uppercase tracking-wide text-rose-700 mb-3 flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Summary — {filteredRows.length} Defaulters
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-xl bg-white border border-rose-100 p-3 text-center">
                        <p className="text-[22px] font-extrabold text-slate-700 tabular-nums">{filteredRows.length}</p>
                        <p className="text-[10px] font-bold text-slate-500">Total Students</p>
                      </div>
                      <div className="rounded-xl bg-white border border-rose-200 p-3 text-center">
                        <p className="text-[18px] font-extrabold text-rose-700 tabular-nums">{fmt(totals.ins)}</p>
                        <p className="text-[10px] font-bold text-rose-500">Total Due</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 bg-slate-50/50">
              <p className="text-[12px] text-slate-400">
                Showing{" "}
                <span className="font-bold text-slate-700">{filteredRows.length}</span>
                {" "}of{" "}
                <span className="font-bold text-slate-700">{rows.length}</span>
                {" "}records
              </p>
              {search && (
                <button onClick={() => setSearch("")}
                  className="text-[12px] text-indigo-600 hover:underline flex items-center gap-1 font-semibold">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── No Data (zero defaulters) ─────────────────────────────────────── */}
      {shown && rows.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
            <Check className="w-8 h-8 text-emerald-500" />
          </div>
          <div className="text-center">
            <p className="text-[16px] font-bold text-slate-700">No Defaulters Found!</p>
            <p className="text-[13px] text-slate-500 mt-1">All students have paid their installment for this session.</p>
          </div>
        </div>
      )}

      {/* ── Empty State (not submitted yet) ──────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-indigo-400 opacity-60" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-bold text-slate-600">No Report Generated</p>
            <p className="text-[13px] text-slate-400 mt-1">
              Select type, session and installment, then click <strong>Submit</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
