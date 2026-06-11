/**
 * DefineIndicatorGrade.jsx
 * Page: Define Indicator Grade for Learner Profile
 * Converted from: define_Learnerprofile_indicatorgrade.aspx
 *
 * Features:
 *  - Class / Indicator / Term dropdowns with validation
 *  - Show button loads student list with checkbox attribute values
 *  - Per-student remark textarea + Save button
 *  - Mobile: stacked cards with expandable details
 *  - Desktop: full-width table with inline controls
 *  - Toast notifications, loading states, empty states
 */

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, SlidersHorizontal, Search, BookOpen, School2,
  Save, Users, ClipboardList, ChevronRight, Info, Tag,
  CheckSquare, FileText, GraduationCap, ListChecks
} from "lucide-react";

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const CLASSES = [
  { id: "1", name: "Nursery" },
  { id: "2", name: "LKG" },
  { id: "3", name: "UKG" },
  { id: "4", name: "Class I" },
  { id: "5", name: "Class II" },
  { id: "6", name: "Class III" },
  { id: "7", name: "Class IV" },
  { id: "8", name: "Class V" },
  { id: "9", name: "Class VI" },
  { id: "10", name: "Class VII" },
];

const INDICATORS_BY_CLASS = {
  "1": [
    { id: "ind1", name: "Social Skills" },
    { id: "ind2", name: "Physical Development" },
    { id: "ind3", name: "Communication" },
  ],
  "2": [
    { id: "ind1", name: "Social Skills" },
    { id: "ind4", name: "Pre-Reading Skills" },
    { id: "ind5", name: "Motor Skills" },
  ],
  "3": [
    { id: "ind6", name: "Language Development" },
    { id: "ind7", name: "Numeracy Skills" },
    { id: "ind5", name: "Motor Skills" },
  ],
  "4": [
    { id: "ind8", name: "Reading" },
    { id: "ind9", name: "Writing" },
    { id: "ind10", name: "Arithmetic" },
    { id: "ind1", name: "Social Skills" },
  ],
  "5": [
    { id: "ind8", name: "Reading" },
    { id: "ind9", name: "Writing" },
    { id: "ind10", name: "Arithmetic" },
    { id: "ind11", name: "Science Curiosity" },
  ],
  "6": [
    { id: "ind12", name: "Critical Thinking" },
    { id: "ind13", name: "Creativity" },
    { id: "ind10", name: "Arithmetic" },
  ],
  "7": [
    { id: "ind12", name: "Critical Thinking" },
    { id: "ind14", name: "Leadership" },
    { id: "ind15", name: "Teamwork" },
  ],
  "8": [
    { id: "ind12", name: "Critical Thinking" },
    { id: "ind14", name: "Leadership" },
    { id: "ind16", name: "Environmental Awareness" },
  ],
  "9": [
    { id: "ind17", name: "Analytical Skills" },
    { id: "ind18", name: "Problem Solving" },
    { id: "ind19", name: "Communication Skills" },
  ],
  "10": [
    { id: "ind17", name: "Analytical Skills" },
    { id: "ind20", name: "Research Skills" },
    { id: "ind21", name: "Presentation Skills" },
  ],
};

const TERMS = [
  { id: "t1", name: "Term 1" },
  { id: "t2", name: "Term 2" },
  { id: "t3", name: "Term 3" },
  { id: "t4", name: "Annual" },
];

// Attribute values (checkboxes) per indicator
const ATTRIBUTE_VALUES = {
  ind1: ["Excellent", "Good", "Average", "Needs Improvement"],
  ind2: ["Very Active", "Active", "Moderate", "Inactive"],
  ind3: ["Fluent", "Good", "Developing", "Needs Support"],
  ind4: ["Advanced", "On Track", "Developing", "Early Stage"],
  ind5: ["Excellent", "Good", "Fair", "Needs Practice"],
  ind6: ["Proficient", "Developing", "Beginning"],
  ind7: ["Strong", "Developing", "Emerging"],
  ind8: ["Reads Fluently", "Reads with Help", "Pre-Reading"],
  ind9: ["Writes Independently", "Writes with Help", "Pre-Writing"],
  ind10: ["Excellent", "Good", "Average", "Below Average"],
  ind11: ["Very Curious", "Curious", "Moderate", "Low Interest"],
  ind12: ["Outstanding", "Proficient", "Developing", "Beginning"],
  ind13: ["Highly Creative", "Creative", "Somewhat Creative"],
  ind14: ["Strong Leader", "Emerging Leader", "Follower", "Needs Guidance"],
  ind15: ["Excellent Team Player", "Good", "Average", "Works Alone"],
  ind16: ["Very Aware", "Aware", "Developing", "Unaware"],
  ind17: ["Advanced", "Proficient", "Developing", "Emerging"],
  ind18: ["Exceptional", "Good", "Average", "Needs Help"],
  ind19: ["Excellent", "Good", "Fair", "Poor"],
  ind20: ["Independent", "Guided", "Beginning"],
  ind21: ["Confident", "Developing", "Shy"],
};

// Students data (simulated)
const STUDENTS_DATA = [
  { stu_id: "101", registration_no: "ADM-2024-001", studentname: "Aarav Sharma", ATTRIBUTE_REMARK: "", ATTRIBUTE_VALUE_Id: "" },
  { stu_id: "102", registration_no: "ADM-2024-002", studentname: "Priya Verma", ATTRIBUTE_REMARK: "", ATTRIBUTE_VALUE_Id: "" },
  { stu_id: "103", registration_no: "ADM-2024-003", studentname: "Rohan Singh", ATTRIBUTE_REMARK: "", ATTRIBUTE_VALUE_Id: "" },
  { stu_id: "104", registration_no: "ADM-2024-004", studentname: "Ananya Gupta", ATTRIBUTE_REMARK: "", ATTRIBUTE_VALUE_Id: "Excellent" },
  { stu_id: "105", registration_no: "ADM-2024-005", studentname: "Karan Mehta", ATTRIBUTE_REMARK: "Good progress", ATTRIBUTE_VALUE_Id: "Good" },
  { stu_id: "106", registration_no: "ADM-2024-006", studentname: "Sneha Patel", ATTRIBUTE_REMARK: "", ATTRIBUTE_VALUE_Id: "" },
  { stu_id: "107", registration_no: "ADM-2024-007", studentname: "Arjun Yadav", ATTRIBUTE_REMARK: "Needs attention", ATTRIBUTE_VALUE_Id: "Average" },
  { stu_id: "108", registration_no: "ADM-2024-008", studentname: "Divya Nair", ATTRIBUTE_REMARK: "", ATTRIBUTE_VALUE_Id: "" },
  { stu_id: "109", registration_no: "ADM-2024-009", studentname: "Vikas Kumar", ATTRIBUTE_REMARK: "", ATTRIBUTE_VALUE_Id: "Good" },
  { stu_id: "110", registration_no: "ADM-2024-010", studentname: "Pooja Jain", ATTRIBUTE_REMARK: "Excellent performance", ATTRIBUTE_VALUE_Id: "Excellent" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase();
}

const AVATAR_COLORS = [
  { bg: "#dbeafe", fg: "#1d4ed8" },
  { fg: "#7c3aed", bg: "#ede9fe" },
  { fg: "#0891b2", bg: "#cffafe" },
  { fg: "#059669", bg: "#d1fae5" },
  { fg: "#d97706", bg: "#fef3c7" },
  { fg: "#dc2626", bg: "#fee2e2" },
];
const avatarColor = (id) => AVATAR_COLORS[parseInt(id, 10) % AVATAR_COLORS.length];

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, id }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? "border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20"
            : "border-slate-200 dark:border-[rgba(99,102,241,0.25)]"
          }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

function Field({ label, error, required, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
      >
        {label}
        {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
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
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
        ${type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
      style={{ animation: "toastUp .25s ease" }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === "success"
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── CHECKBOX VALUE SELECTOR ───────────────────────────────────────────────────

function AttributeCheckboxes({ values, selected, onChange }) {
  const toggle = (v) => {
    const isSelected = selected.includes(v);
    if (isSelected) onChange(selected.filter(s => s !== v));
    else onChange([...selected, v]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {values.map(v => {
        const checked = selected.includes(v);
        return (
          <button
            key={v}
            type="button"
            onClick={() => toggle(v)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all select-none
              ${checked
                ? "bg-indigo-600 text-white border-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30"
                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 dark:bg-[#1e2238] dark:text-slate-300 dark:border-[rgba(99,102,241,0.2)] dark:hover:border-indigo-500 dark:hover:bg-indigo-500/10"
              }`}
          >
            {checked
              ? <Check className="w-3 h-3 flex-shrink-0" />
              : <div className="w-3 h-3 rounded border border-current opacity-40 flex-shrink-0" />}
            {v}
          </button>
        );
      })}
    </div>
  );
}

// ─── DESKTOP TABLE ROW ─────────────────────────────────────────────────────────

function DesktopRow({ student, idx, attributeValues, onSave, saving }) {
  const { bg, fg } = avatarColor(student.stu_id);
  const isSaved = !!student._saved;

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors align-top">
      {/* S.No */}
      <td className="px-4 py-3.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10 pt-4">
        {idx}
      </td>

      {/* Admission No */}
      <td className="px-4 py-3.5 whitespace-nowrap pt-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {getInitials(student.studentname)}
          </div>
          <div>
            <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{student.registration_no}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{student.stu_id}</p>
          </div>
        </div>
      </td>

      {/* Name */}
      <td className="px-4 py-3.5 whitespace-nowrap pt-4">
        <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{student.studentname}</span>
      </td>

      {/* Remark */}
      <td className="px-4 py-3.5 w-56">
        <textarea
          value={student.ATTRIBUTE_REMARK}
          onChange={e => onSave(student.stu_id, { remark: e.target.value })}
          placeholder="Add remark…"
          rows={3}
          className="w-full text-[12px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200
            px-3 py-2 outline-none resize-none
            focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
            placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all"
        />
      </td>

      {/* Select Value */}
      <td className="px-4 py-3.5 pt-4">
        <AttributeCheckboxes
          values={attributeValues}
          selected={student._selectedValues || []}
          onChange={(vals) => onSave(student.stu_id, { selectedValues: vals })}
        />
      </td>

      {/* Save */}
      <td className="px-4 py-3.5 text-center pt-4">
        <button
          type="button"
          onClick={() => onSave(student.stu_id, { doSave: true })}
          disabled={saving === student.stu_id}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all active:scale-95
            ${isSaved
              ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200 dark:shadow-emerald-900/30"
              : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200 dark:shadow-indigo-900/30"
            } disabled:opacity-60`}
        >
          {saving === student.stu_id
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : isSaved
              ? <Check className="w-3.5 h-3.5" />
              : <Save className="w-3.5 h-3.5" />}
          {saving === student.stu_id ? "Saving…" : isSaved ? "Saved" : "Save"}
        </button>
      </td>
    </tr>
  );
}

// ─── MOBILE STUDENT CARD ───────────────────────────────────────────────────────

function MobileCard({ student, idx, attributeValues, onSave, saving }) {
  const [expanded, setExpanded] = useState(false);
  const { bg, fg } = avatarColor(student.stu_id);
  const isSaved = !!student._saved;
  const selectedCount = (student._selectedValues || []).length;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {getInitials(student.studentname)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {student.studentname}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1.5">
            <span>{student.registration_no}</span>
            {selectedCount > 0 && (
              <>
                <span>·</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                  {selectedCount} value{selectedCount > 1 ? "s" : ""} selected
                </span>
              </>
            )}
          </p>
        </div>

        {/* Status badge */}
        {isSaved && (
          <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
            <Check className="w-3 h-3" /> Saved
          </span>
        )}

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? "rotate-90" : ""}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-5 space-y-4">

          {/* Remark */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Remark
            </label>
            <textarea
              value={student.ATTRIBUTE_REMARK}
              onChange={e => onSave(student.stu_id, { remark: e.target.value })}
              placeholder="Add remark for this student…"
              rows={3}
              className="w-full text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-50 dark:bg-[#1e2238] text-slate-700 dark:text-slate-200
                px-3 py-2.5 outline-none resize-none
                focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:focus:ring-indigo-500/20
                placeholder:text-slate-300 dark:placeholder:text-slate-600 transition-all"
            />
          </div>

          {/* Select Values */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5" />
              Select Value
            </label>
            <AttributeCheckboxes
              values={attributeValues}
              selected={student._selectedValues || []}
              onChange={(vals) => onSave(student.stu_id, { selectedValues: vals })}
            />
          </div>

          {/* Save button */}
          <button
            type="button"
            onClick={() => onSave(student.stu_id, { doSave: true })}
            disabled={saving === student.stu_id}
            className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98]
              ${isSaved
                ? "bg-emerald-500 text-white"
                : "bg-indigo-600 text-white hover:bg-indigo-700"
              } disabled:opacity-60 shadow-sm`}
          >
            {saving === student.stu_id
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : isSaved
                ? <Check className="w-4 h-4" />
                : <Save className="w-4 h-4" />}
            {saving === student.stu_id ? "Saving…" : isSaved ? "Saved Successfully" : "Save Student"}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MOBILE FILTER DRAWER ──────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, fields, errors, onShow, loading }) {
  if (!open) return null;
  const { classId, setClassId, indicatorId, setIndicatorId, termId, setTermId, indicators } = fields;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: "drawerUp .3s ease" }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Class" error={errors.classId} required>
            <NativeSelect value={classId} onChange={e => setClassId(e.target.value)} placeholder="-- Select Class --" error={errors.classId}>
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Indicator" error={errors.indicatorId} required>
            <NativeSelect value={indicatorId} onChange={e => setIndicatorId(e.target.value)} placeholder={classId ? "-- Select Indicator --" : "-- Select Class First --"} error={errors.indicatorId} disabled={!classId}>
              {(indicators || []).map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Term" error={errors.termId} required>
            <NativeSelect value={termId} onChange={e => setTermId(e.target.value)} placeholder="-- Select Term --" error={errors.termId}>
              {TERMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 pb-safe">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose(); }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
              bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-70 shadow-md shadow-indigo-500/25">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  );
}

// ─── SUMMARY STAT CARD ─────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, colorClass }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────

export default function DefineIndicatorGrade() {
  // Filter state
  const [classId, setClassId] = useState("");
  const [indicatorId, setIndicatorId] = useState("");
  const [termId, setTermId] = useState("");
  const [errors, setErrors] = useState({});

  // UI state
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null); // stu_id being saved
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [shown, setShown] = useState(false);

  // Data state
  const [students, setStudents] = useState([]);
  const [currentConfig, setCurrentConfig] = useState(null);

  // Derived
  const indicators = useMemo(() => INDICATORS_BY_CLASS[classId] || [], [classId]);
  const currentAttrValues = useMemo(() => {
    if (!indicatorId) return [];
    return ATTRIBUTE_VALUES[indicatorId] || [];
  }, [indicatorId]);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleClassChange = (val) => {
    setClassId(val);
    setIndicatorId(""); // reset indicator on class change
    setErrors(p => ({ ...p, classId: undefined, indicatorId: undefined }));
  };

  const handleShow = useCallback(() => {
    const err = {};
    if (!classId) err.classId = "Please select a class";
    if (!indicatorId) err.indicatorId = "Please select an indicator";
    if (!termId) err.termId = "Please select a term";
    if (Object.keys(err).length) { setErrors(err); return; }
    setErrors({});
    setLoading(true);
    setSearch("");

    // Simulate API call
    setTimeout(() => {
      const data = STUDENTS_DATA.map(s => ({
        ...s,
        ATTRIBUTE_REMARK: s.ATTRIBUTE_REMARK || "",
        _selectedValues: s.ATTRIBUTE_VALUE_Id
          ? s.ATTRIBUTE_VALUE_Id.split(",").map(v => v.trim()).filter(Boolean)
          : [],
        _saved: false,
      }));
      setStudents(data);
      const cls = CLASSES.find(c => c.id === classId);
      const ind = indicators.find(i => i.id === indicatorId);
      const trm = TERMS.find(t => t.id === termId);
      setCurrentConfig({ cls: cls?.name, ind: ind?.name, trm: trm?.name });
      setShown(true);
      setLoading(false);
      showToast(`Loaded ${data.length} students.`);
    }, 700);
  }, [classId, indicatorId, termId, indicators, showToast]);

  const handleReset = () => {
    setClassId(""); setIndicatorId(""); setTermId("");
    setStudents([]); setSearch(""); setErrors({});
    setShown(false); setCurrentConfig(null);
  };

  // Per-student update (remark/selectedValues/save)
  const handleStudentSave = useCallback((stuId, payload) => {
    if (payload.doSave) {
      // Trigger save
      setSaving(stuId);
      setTimeout(() => {
        setStudents(prev => prev.map(s =>
          s.stu_id === stuId ? { ...s, _saved: true } : s
        ));
        setSaving(null);
        showToast("Saved successfully!");
      }, 600);
      return;
    }
    if (payload.remark !== undefined) {
      setStudents(prev => prev.map(s =>
        s.stu_id === stuId ? { ...s, ATTRIBUTE_REMARK: payload.remark, _saved: false } : s
      ));
    }
    if (payload.selectedValues !== undefined) {
      setStudents(prev => prev.map(s =>
        s.stu_id === stuId ? { ...s, _selectedValues: payload.selectedValues, _saved: false } : s
      ));
    }
  }, [showToast]);

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    if (!search.trim()) return students;
    const q = search.toLowerCase();
    return students.filter(s =>
      s.studentname.toLowerCase().includes(q) ||
      s.registration_no.toLowerCase().includes(q)
    );
  }, [students, search]);

  const savedCount = useMemo(() => students.filter(s => s._saved).length, [students]);
  const pendingCount = students.length - savedCount;

  const hasResults = shown && students.length > 0;
  const activeFilterCount = [classId, indicatorId, termId].filter(Boolean).length;

  return (
    <div className="space-y-4 pb-12">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            Define Indicator Grade
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5 ml-[42px]">
            Learner Profile — assign attribute values &amp; remarks per student.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ───────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Class */}
            <Field label="Class" error={errors.classId} required htmlFor="ddlclass">
              <NativeSelect
                id="ddlclass"
                value={classId}
                onChange={e => handleClassChange(e.target.value)}
                placeholder="-- Select Class --"
                error={errors.classId}
              >
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Indicator */}
            <Field label="Indicator" error={errors.indicatorId} required htmlFor="ddlindicator">
              <NativeSelect
                id="ddlindicator"
                value={indicatorId}
                onChange={e => { setIndicatorId(e.target.value); setErrors(p => ({ ...p, indicatorId: undefined })); }}
                placeholder={classId ? "-- Select Indicator --" : "-- Select Class First --"}
                error={errors.indicatorId}
                disabled={!classId}
              >
                {indicators.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Term */}
            <Field label="Term" error={errors.termId} required htmlFor="ddlterm">
              <NativeSelect
                id="ddlterm"
                value={termId}
                onChange={e => { setTermId(e.target.value); setErrors(p => ({ ...p, termId: undefined })); }}
                placeholder="-- Select Term --"
                error={errors.termId}
              >
                {TERMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20
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
                title="Reset"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold
            bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilterCount === 3 && currentConfig
            ? `${currentConfig.cls} · ${currentConfig.ind}`
            : "Set Filters"}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>
        {hasResults && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        fields={{ classId, setClassId: handleClassChange, indicatorId, setIndicatorId, termId, setTermId, indicators }}
        errors={errors}
        onShow={handleShow}
        loading={loading}
      />

      {/* ── Loading Skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
              style={{ opacity: 1 - i * 0.15 }}
            />
          ))}
        </div>
      )}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Context Banner */}
          <div className="rounded-2xl border border-indigo-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-indigo-50 via-white to-purple-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-5 py-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap gap-y-1">
              <School2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">{currentConfig?.cls}</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 text-[12px] font-bold text-indigo-700 dark:text-indigo-300">
                <Tag className="w-3 h-3" />
                {currentConfig?.ind}
              </span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-[12px] font-bold text-amber-700 dark:text-amber-300">
                {currentConfig?.trm}
              </span>
            </div>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-3 gap-3">
            <StatCard icon={Users} label="Total Students" value={students.length} colorClass="bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400" />
            <StatCard icon={Check} label="Saved" value={savedCount} colorClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" />
            <StatCard icon={ListChecks} label="Pending" value={pendingCount} colorClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400" />
          </div>

          {/* Main results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Student List</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                  {filtered.length} student{filtered.length !== 1 ? "s" : ""}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search student or adm. no…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-xl border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-indigo-50/20 dark:bg-indigo-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <p className="text-[12px] text-indigo-700 dark:text-indigo-400">
                Select one or more values per student, add remarks, then click Save for each student.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {["S.No.", "Admission No.", "Student Name", "Remark", "Select Value", "Action"].map((h, i) => (
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
                    {filtered.map((student, i) => (
                      <DesktopRow
                        key={student.stu_id}
                        student={student}
                        idx={i + 1}
                        attributeValues={currentAttrValues}
                        onSave={handleStudentSave}
                        saving={saving}
                      />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No students match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a student card to expand and fill details.
                  </p>
                  {filtered.map((student, i) => (
                    <MobileCard
                      key={student.stu_id}
                      student={student}
                      idx={i + 1}
                      attributeValues={currentAttrValues}
                      onSave={handleStudentSave}
                      saving={saving}
                    />
                  ))}
                </>
              )}
            </div>

            {/* Table footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{students.length}</span> students
                {savedCount > 0 && (
                  <span className="ml-2 text-emerald-600 dark:text-emerald-400 font-semibold">
                    · {savedCount} saved
                  </span>
                )}
              </p>
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-[12px] text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-8 h-8 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-[15px] font-semibold text-slate-500 dark:text-slate-400">No data loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1.5 max-w-xs">
              Select a <strong>Class</strong>, <strong>Indicator</strong>, and <strong>Term</strong>, then click <strong>Show</strong> to load students.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
