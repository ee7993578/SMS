/**
 * DefineReportcardCategoryRemark.jsx
 * Folder: src/pages/ExamMaster/DefineReportcardCategoryRemark.jsx
 *
 * Converts legacy ASPX "Define ReportCard Category Remark" to
 * fully-responsive React + Tailwind CSS.
 *
 * Features:
 *  - Class, Category, Sub Category, Term dropdowns with validation
 *  - Show button loads student grid
 *  - Per-student remark via TextBox + DropDownList (predefined remarks)
 *  - Row-level Save with success/error feedback
 *  - Mobile: stacked cards with inline save
 *  - Desktop: dense ERP table
 *  - Loading skeleton, empty state, toast notifications
 */

import { useState, useMemo, useCallback } from "react";
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, Save, BookOpen, School2, SlidersHorizontal,
  Search, Info, Users, FileText, ClipboardList,
  ChevronRight, CheckCircle2, MessageSquare,
} from "lucide-react";

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const CLASSES = [
  { id: "1", name: "Class I" },
  { id: "2", name: "Class II" },
  { id: "3", name: "Class III" },
  { id: "4", name: "Class IV" },
  { id: "5", name: "Class V" },
  { id: "6", name: "Class VI" },
  { id: "7", name: "Class VII" },
  { id: "8", name: "Class VIII" },
  { id: "9", name: "Class IX" },
  { id: "10", name: "Class X" },
];

const CATEGORIES = [
  { id: "1", name: "Co-Curricular Activities" },
  { id: "2", name: "Life Skills" },
  { id: "3", name: "Attitude & Values" },
  { id: "4", name: "Health & Physical Education" },
];

const SUBCATEGORIES = {
  "1": [
    { id: "101", name: "Literary Activities" },
    { id: "102", name: "Scientific Activities" },
    { id: "103", name: "Performing Arts" },
    { id: "104", name: "Visual Arts" },
  ],
  "2": [
    { id: "201", name: "Self-Management" },
    { id: "202", name: "Social Skills" },
    { id: "203", name: "Communication Skills" },
  ],
  "3": [
    { id: "301", name: "Attitude Towards Teachers" },
    { id: "302", name: "Attitude Towards Peers" },
    { id: "303", name: "Value System" },
  ],
  "4": [
    { id: "401", name: "Games & Sports" },
    { id: "402", name: "Yoga & Fitness" },
    { id: "403", name: "Outdoor Activities" },
  ],
};

const TERMS = [
  { id: "1", name: "Term I" },
  { id: "2", name: "Term II" },
  { id: "3", name: "Annual" },
];

const PREDEFINED_REMARKS = [
  { value: "", label: "-- Select Remark --" },
  { value: "Excellent", label: "Excellent" },
  { value: "Very Good", label: "Very Good" },
  { value: "Good", label: "Good" },
  { value: "Satisfactory", label: "Satisfactory" },
  { value: "Needs Improvement", label: "Needs Improvement" },
  { value: "Outstanding", label: "Outstanding" },
  { value: "Participates Actively", label: "Participates Actively" },
  { value: "Shows Interest", label: "Shows Interest" },
  { value: "Requires Attention", label: "Requires Attention" },
];

// Generate dummy students based on class
const generateStudents = (classId) => {
  const names = [
    ["Aarav Sharma", "A001"],
    ["Priya Gupta", "A002"],
    ["Rahul Verma", "A003"],
    ["Sneha Joshi", "A004"],
    ["Amit Mishra", "A005"],
    ["Kavya Singh", "A006"],
    ["Rohan Patel", "A007"],
    ["Ananya Rao", "A008"],
    ["Vivek Tiwari", "A009"],
    ["Pooja Dixit", "A010"],
    ["Arjun Srivastava", "A011"],
    ["Riya Pandey", "A012"],
    ["Mohit Kumar", "A013"],
    ["Nisha Yadav", "A014"],
    ["Saurabh Malhotra", "A015"],
  ];
  return names.map(([name, regNo], i) => ({
    stu_id: `${classId}${i + 1}`,
    registration_no: `${regNo}${classId}`,
    studentname: name,
    Remark: "",
    savedRemark: "",
    saved: false,
  }));
};

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
          focus:border-teal-400 focus:ring-2 focus:ring-teal-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-teal-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? "border-rose-400 ring-2 ring-rose-100"
            : "border-slate-200 dark:border-[rgba(20,184,166,0.25)]"
          }`}
      >
        {placeholder && <option value="0">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function Toast({ message, type = "success", onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === "success" ? "bg-teal-600 text-white" : "bg-rose-600 text-white"}`}
      style={{ animation: "slideUp .25s ease" }}
    >
      {type === "success"
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  );
}

function Badge({ children, color = "slate" }) {
  const colors = {
    teal:   "bg-teal-50 text-teal-700 border-teal-100 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20",
    slate:  "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
    amber:  "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20",
    emerald:"bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${colors[color]}`}>
      {children}
    </span>
  );
}

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(20,184,166,0.15)] bg-white dark:bg-[#1a1f35] p-5 space-y-3">
      <div className="h-10 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4 w-1/2" />
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          style={{ opacity: 1 - i * 0.12 }}
        />
      ))}
    </div>
  );
}

// ─── SUMMARY STATS ────────────────────────────────────────────────────────────

function SummaryBar({ total, saved, pending }) {
  const pct = total ? Math.round((saved / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(20,184,166,0.15)] bg-white dark:bg-[#1a1f35] px-5 py-4 flex flex-wrap items-center gap-4 shadow-sm">
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-500/10 flex items-center justify-center">
          <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        </span>
        <div>
          <p className="text-[19px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{total}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Total Students</p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
        </span>
        <div>
          <p className="text-[19px] font-bold text-emerald-700 dark:text-emerald-400 tabular-nums leading-tight">{saved}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Saved</p>
        </div>
      </div>
      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
          <ClipboardList className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        </span>
        <div>
          <p className="text-[19px] font-bold text-amber-700 dark:text-amber-400 tabular-nums leading-tight">{pending}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Pending</p>
        </div>
      </div>
      {/* Progress bar */}
      <div className="flex-1 min-w-[120px]">
        <div className="flex justify-between text-[11px] font-semibold mb-1">
          <span className="text-teal-600 dark:text-teal-400">Progress</span>
          <span className="text-slate-500 dark:text-slate-400">{pct}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
          <div
            className="h-full rounded-full bg-teal-500 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────

function MobileStudentCard({ student, onUpdate, onSave, savingId }) {
  const [expanded, setExpanded] = useState(false);
  const isSaving = savingId === student.stu_id;

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm transition-all
      ${student.saved
        ? "border-emerald-200 dark:border-emerald-500/25"
        : "border-slate-200 dark:border-[rgba(20,184,166,0.15)]"
      }`}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-500/15 flex items-center justify-center flex-shrink-0">
          <span className="text-[12px] font-bold text-teal-700 dark:text-teal-400">
            {student.studentname.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">
            {student.studentname}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Reg: <span className="font-semibold text-slate-600 dark:text-slate-300">{student.registration_no}</span>
          </p>
        </div>

        {student.saved ? (
          <Badge color="emerald">Saved</Badge>
        ) : (
          <Badge color="amber">Pending</Badge>
        )}

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? "rotate-90" : ""}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Saved remark preview */}
      {student.saved && !expanded && (
        <div className="px-4 pb-3">
          <div className="flex items-center gap-1.5 text-[12px] text-emerald-600 dark:text-emerald-400">
            <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="font-medium italic truncate">&ldquo;{student.savedRemark}&rdquo;</span>
          </div>
        </div>
      )}

      {/* Expanded form */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(20,184,166,0.1)] px-4 pt-4 pb-4 space-y-3">
          {/* Predefined remark dropdown */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Select Remark
            </label>
            <NativeSelect
              value={student.Remark}
              onChange={(e) => onUpdate(student.stu_id, "Remark", e.target.value)}
              placeholder="-- Select Remark --"
            >
              {PREDEFINED_REMARKS.filter((r) => r.value).map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </NativeSelect>
          </div>

          {/* Custom remark textarea */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
              Custom Remark
            </label>
            <textarea
              value={student.customRemark || ""}
              onChange={(e) => onUpdate(student.stu_id, "customRemark", e.target.value)}
              placeholder="Type custom remark here..."
              rows={2}
              className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(20,184,166,0.25)]
                bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
                placeholder-slate-300 dark:placeholder-slate-600
                outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100
                resize-none transition-all"
            />
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={() => onSave(student.stu_id)}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold
              bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-500/20
              disabled:opacity-70 transition-all active:scale-[0.98]"
          >
            {isSaving
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Save className="w-4 h-4" />}
            {isSaving ? "Saving..." : "Save Remark"}
          </button>

          {student.saved && (
            <p className="flex items-center justify-center gap-1.5 text-[12px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" /> Remark saved successfully!
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ student, idx, onUpdate, onSave, savingId }) {
  const isSaving = savingId === student.stu_id;

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(20,184,166,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Admission No. */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 tabular-nums">
          {student.registration_no}
        </span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-500/15 flex items-center justify-center flex-shrink-0">
            <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">
              {student.studentname.charAt(0)}
            </span>
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {student.studentname}
          </span>
        </div>
      </td>

      {/* Predefined Remark Dropdown */}
      <td className="px-4 py-3 min-w-[180px]">
        <NativeSelect
          value={student.Remark}
          onChange={(e) => onUpdate(student.stu_id, "Remark", e.target.value)}
          placeholder="-- Select --"
        >
          {PREDEFINED_REMARKS.filter((r) => r.value).map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </NativeSelect>
      </td>

      {/* Custom Remark Textarea */}
      <td className="px-4 py-3 min-w-[200px]">
        <textarea
          value={student.customRemark || ""}
          onChange={(e) => onUpdate(student.stu_id, "customRemark", e.target.value)}
          placeholder="Custom remark..."
          rows={2}
          className="w-full px-3 py-2 text-[12px] rounded-lg border border-slate-200 dark:border-[rgba(20,184,166,0.2)]
            bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200
            placeholder-slate-300 dark:placeholder-slate-600
            outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100
            resize-none transition-all"
        />
      </td>

      {/* Save + Status */}
      <td className="px-4 py-3 text-center w-28">
        <div className="flex flex-col items-center gap-1.5">
          <button
            type="button"
            onClick={() => onSave(student.stu_id)}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold
              bg-teal-600 hover:bg-teal-700 text-white shadow-sm shadow-teal-500/20
              disabled:opacity-70 transition-all active:scale-95 whitespace-nowrap"
          >
            {isSaving
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <Save className="w-3.5 h-3.5" />}
            {isSaving ? "Saving" : "Save"}
          </button>
          {student.saved && (
            <span className="flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Saved
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─── FILTER DRAWER (mobile) ────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilter, onShow, loading, errors, subcategoryOptions }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(20,184,166,0.2)] shadow-2xl"
        style={{ animation: "drawerUp .25s ease", maxHeight: "90vh", overflowY: "auto" }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(20,184,166,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Fields */}
        <div className="px-5 py-5 space-y-4">
          <Field label="Class" error={errors.classId} required>
            <NativeSelect value={filters.classId} onChange={(e) => setFilter("classId", e.target.value)} placeholder="-- Select Class --" error={errors.classId}>
              {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Category" error={errors.categoryId} required>
            <NativeSelect value={filters.categoryId} onChange={(e) => setFilter("categoryId", e.target.value)} placeholder="-- Select Category --" error={errors.categoryId}>
              {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Sub Category" error={errors.subcategoryId} required>
            <NativeSelect value={filters.subcategoryId} onChange={(e) => setFilter("subcategoryId", e.target.value)} placeholder="-- Select Sub Category --" error={errors.subcategoryId} disabled={!filters.categoryId}>
              {subcategoryOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.termId} required>
            <NativeSelect value={filters.termId} onChange={(e) => setFilter("termId", e.target.value)} placeholder="-- Select Term --" error={errors.termId}>
              {TERMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </NativeSelect>
          </Field>
        </div>
        {/* Footer buttons */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(20,184,166,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose(); }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white
              bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function DefineReportcardCategoryRemark() {
  // Filter state
  const [filters, setFiltersState] = useState({
    classId: "0",
    categoryId: "0",
    subcategoryId: "0",
    termId: "0",
  });
  const setFilter = (key, val) => {
    setFiltersState((prev) => {
      const next = { ...prev, [key]: val };
      // Reset subcategory when category changes
      if (key === "categoryId") next.subcategoryId = "0";
      return next;
    });
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  // Data state
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [shown, setShown] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Derived subcategory list
  const subcategoryOptions = useMemo(
    () => SUBCATEGORIES[filters.categoryId] || [],
    [filters.categoryId]
  );

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Validate ────────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {};
    if (filters.termId === "0")        err.termId        = "Select a term";
    if (filters.classId === "0")       err.classId       = "Select a class";
    if (filters.categoryId === "0")    err.categoryId    = "Select a category";
    if (filters.subcategoryId === "0") err.subcategoryId = "Select a sub category";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  // ── Show students ────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    if (!validate()) return;
    setLoading(true);
    setSearch("");
    setTimeout(() => {
      const data = generateStudents(filters.classId).map((s) => ({
        ...s,
        customRemark: "",
        saved: false,
      }));
      setStudents(data);
      setShown(true);
      setLoading(false);
      showToast(`Loaded ${data.length} students.`);
    }, 700);
  }, [filters]);

  // ── Reset ────────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setFiltersState({ classId: "0", categoryId: "0", subcategoryId: "0", termId: "0" });
    setStudents([]);
    setErrors({});
    setShown(false);
    setSearch("");
  };

  // ── Update student remark field ──────────────────────────────────────────────
  const handleUpdate = useCallback((stuId, field, value) => {
    setStudents((prev) =>
      prev.map((s) => s.stu_id === stuId ? { ...s, [field]: value } : s)
    );
  }, []);

  // ── Save single student remark ───────────────────────────────────────────────
  const handleSave = useCallback((stuId) => {
    setSavingId(stuId);
    setTimeout(() => {
      setStudents((prev) =>
        prev.map((s) =>
          s.stu_id === stuId
            ? {
                ...s,
                saved: true,
                savedRemark: s.customRemark || s.Remark || "(no remark)",
              }
            : s
        )
      );
      setSavingId(null);
      showToast("Remark saved successfully!");
    }, 600);
  }, []);

  // ── Search filter ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter(
      (s) =>
        s.studentname.toLowerCase().includes(q) ||
        s.registration_no.toLowerCase().includes(q)
    );
  }, [students, search]);

  // ── Summary counts ───────────────────────────────────────────────────────────
  const savedCount   = useMemo(() => students.filter((s) => s.saved).length, [students]);
  const pendingCount = students.length - savedCount;

  // ── Active filter count (for mobile badge) ───────────────────────────────────
  const activeFilters = Object.values(filters).filter((v) => v !== "0").length;

  const hasResults = shown && students.length > 0;

  // ── Label helpers ────────────────────────────────────────────────────────────
  const getLabel = (list, id, key = "name") =>
    list.find((i) => i.id === id)?.[key] || "";

  return (
    <div className="space-y-4 pb-10">
      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            Define Reportcard Category Remark
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Assign category-wise remarks for students in a selected class, term and category.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(20,184,166,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(20,184,166,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-teal-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 items-end">
            {/* Class */}
            <Field label="Class" error={errors.classId} required>
              <NativeSelect
                value={filters.classId}
                onChange={(e) => setFilter("classId", e.target.value)}
                placeholder="-- Select Class --"
                error={errors.classId}
              >
                {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Category */}
            <Field label="Category" error={errors.categoryId} required>
              <NativeSelect
                value={filters.categoryId}
                onChange={(e) => setFilter("categoryId", e.target.value)}
                placeholder="-- Select Category --"
                error={errors.categoryId}
              >
                {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Sub Category */}
            <Field label="Sub Category" error={errors.subcategoryId} required>
              <NativeSelect
                value={filters.subcategoryId}
                onChange={(e) => setFilter("subcategoryId", e.target.value)}
                placeholder="-- Select Sub Category --"
                error={errors.subcategoryId}
                disabled={!filters.categoryId || filters.categoryId === "0"}
              >
                {subcategoryOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Term */}
            <Field label="Term" error={errors.termId} required>
              <NativeSelect
                value={filters.termId}
                onChange={(e) => setFilter("termId", e.target.value)}
                placeholder="-- Select Term --"
                error={errors.termId}
              >
                {TERMS.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-bold text-white
                  bg-teal-600 hover:bg-teal-700 shadow-md shadow-teal-500/20
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold
            bg-teal-600 text-white shadow-md shadow-teal-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilters}
            </span>
          )}
        </button>
        {shown && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        setFilter={setFilter}
        onShow={handleShow}
        loading={loading}
        errors={errors}
        subcategoryOptions={subcategoryOptions}
      />

      {/* ── Loading ──────────────────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Context banner */}
          <div className="rounded-2xl border border-teal-100 dark:border-[rgba(20,184,166,0.2)] bg-gradient-to-r from-teal-50 via-white to-cyan-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 flex flex-wrap items-center gap-3 shadow-sm">
            <School2 className="w-5 h-5 text-teal-600 dark:text-teal-400 flex-shrink-0" />
            <div className="flex flex-wrap gap-2">
              <Badge color="teal">{getLabel(CLASSES, filters.classId)}</Badge>
              <Badge color="teal">{getLabel(CATEGORIES, filters.categoryId)}</Badge>
              <Badge color="teal">{getLabel(subcategoryOptions, filters.subcategoryId)}</Badge>
              <Badge color="teal">{getLabel(TERMS, filters.termId)}</Badge>
            </div>
            <p className="ml-auto text-[12px] text-teal-600 dark:text-teal-400 font-semibold hidden sm:block">
              Define Reportcard Category Remarks
            </p>
          </div>

          {/* Summary Bar */}
          <SummaryBar total={students.length} saved={savedCount} pending={pendingCount} />

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(20,184,166,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(20,184,166,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-teal-500 flex-shrink-0" />
                <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student List</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-400 flex-shrink-0">
                  {filtered.length} student{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search student or reg no…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-teal-400 focus:ring-2 focus:ring-teal-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(20,184,166,0.25)]
                    dark:placeholder-slate-600"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(20,184,166,0.07)] bg-teal-50/20 dark:bg-teal-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-teal-500 flex-shrink-0" />
              <p className="text-[12px] text-teal-700 dark:text-teal-400">
                Select a predefined remark or type a custom one, then click <strong>Save</strong> per student.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(20,184,166,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {["S.No.", "Adm. No.", "Name", "Select Remark", "Custom Remark", "Save"].map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((stu, i) => (
                      <DesktopRow
                        key={stu.stu_id}
                        student={stu}
                        idx={i + 1}
                        onUpdate={handleUpdate}
                        onSave={handleSave}
                        savingId={savingId}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to expand and enter a remark.
                  </p>
                  {filtered.map((stu) => (
                    <MobileStudentCard
                      key={stu.stu_id}
                      student={stu}
                      onUpdate={handleUpdate}
                      onSave={handleSave}
                      savingId={savingId}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(20,184,166,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span>{" "}
                students
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-[12px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No records yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select class, category, sub category and term, then click{" "}
              <strong>Show</strong> to load students.
            </p>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────────── */}
      {toast && (
        <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
