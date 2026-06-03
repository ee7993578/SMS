/**
 * AssignConGroup.jsx
 * Assign Concession Group — Fee Module
 * Fully responsive React + Tailwind. Mobile: card-based. Desktop: dense ERP table.
 */

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Search, ChevronDown, X, Loader2, Check, AlertCircle,
  Users, Tag, RotateCcw, Eye, Save, RefreshCw,
  ArrowLeft, FileText, SlidersHorizontal, ChevronRight,
  BookOpen, GraduationCap, BadgeCheck, Clock, Info,
  User, Hash, Shield, CheckCircle2, XCircle, Inbox,
  ChevronUp, Filter
} from "lucide-react";

// ─────────────────────────────────────────────────────
// STATIC / DUMMY DATA
// ─────────────────────────────────────────────────────
const SESSIONS = ["2022-23", "2023-24", "2024-25", "2025-26"];

const CLASSES = [
  { id: "0", name: "-- Select Class --" },
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
  { id: "11", name: "Class VIII" },
  { id: "12", name: "Class IX" },
  { id: "13", name: "Class X" },
  { id: "14", name: "Class XI" },
  { id: "15", name: "Class XII" },
];

const CONCESSION_GROUPS = [
  { id: "1", name: "Staff Ward" },
  { id: "2", name: "RTE Concession" },
  { id: "3", name: "Merit Scholarship" },
  { id: "4", name: "Sibling Discount" },
  { id: "5", name: "EWS Category" },
  { id: "6", name: "Sports Excellence" },
  { id: "7", name: "No Concession" },
];

const STUDENTS_BY_CLASS = {
  "1": [
    { stu_id: "101", registration_no: "NUR/2024/001", name: "Aarav Sharma", assigned_group: "7" },
    { stu_id: "102", registration_no: "NUR/2024/002", name: "Priya Singh", assigned_group: "4" },
    { stu_id: "103", registration_no: "NUR/2024/003", name: "Rohan Gupta", assigned_group: "7" },
  ],
  "2": [
    { stu_id: "201", registration_no: "LKG/2024/001", name: "Ananya Patel", assigned_group: "2" },
    { stu_id: "202", registration_no: "LKG/2024/002", name: "Vikram Yadav", assigned_group: "7" },
    { stu_id: "203", registration_no: "LKG/2024/003", name: "Sneha Joshi", assigned_group: "1" },
    { stu_id: "204", registration_no: "LKG/2024/004", name: "Arjun Mehta", assigned_group: "3" },
  ],
  "4": [
    { stu_id: "401", registration_no: "I/2024/001", name: "Kavya Reddy", assigned_group: "5" },
    { stu_id: "402", registration_no: "I/2024/002", name: "Aditya Kumar", assigned_group: "7" },
    { stu_id: "403", registration_no: "I/2024/003", name: "Pooja Verma", assigned_group: "4" },
    { stu_id: "404", registration_no: "I/2024/004", name: "Rahul Nair", assigned_group: "2" },
    { stu_id: "405", registration_no: "I/2024/005", name: "Divya Iyer", assigned_group: "7" },
  ],
  "9": [
    { stu_id: "901", registration_no: "VI/2024/001", name: "Siddharth Mishra", assigned_group: "3" },
    { stu_id: "902", registration_no: "VI/2024/002", name: "Tanvi Bose", assigned_group: "7" },
    { stu_id: "903", registration_no: "VI/2024/003", name: "Kunal Desai", assigned_group: "6" },
    { stu_id: "904", registration_no: "VI/2024/004", name: "Meera Pillai", assigned_group: "1" },
    { stu_id: "905", registration_no: "VI/2024/005", name: "Harsh Chauhan", assigned_group: "2" },
    { stu_id: "906", registration_no: "VI/2024/006", name: "Riya Malhotra", assigned_group: "7" },
  ],
  "12": [
    { stu_id: "1201", registration_no: "IX/2024/001", name: "Vivek Tiwari", assigned_group: "3" },
    { stu_id: "1202", registration_no: "IX/2024/002", name: "Sunita Rao", assigned_group: "7" },
    { stu_id: "1203", registration_no: "IX/2024/003", name: "Abhijit Das", assigned_group: "5" },
  ],
};

// Concession request history (per student)
const REQUEST_HISTORY = {
  "101": [
    { requestDate: "10-Jan-2024", groupName: "No Concession", session: "2023-24", ApprovalStatus: "Approved", ApprovedAt: "12-Jan-2024", activeStatus: "Active" },
  ],
  "201": [
    { requestDate: "05-Apr-2024", groupName: "RTE Concession", session: "2024-25", ApprovalStatus: "Approved", ApprovedAt: "07-Apr-2024", activeStatus: "Active" },
    { requestDate: "02-Apr-2023", groupName: "EWS Category", session: "2023-24", ApprovalStatus: "Approved", ApprovedAt: "04-Apr-2023", activeStatus: "Inactive" },
  ],
  "401": [
    { requestDate: "01-Apr-2024", groupName: "EWS Category", session: "2024-25", ApprovalStatus: "Pending", ApprovedAt: "-", activeStatus: "Pending" },
  ],
};

// ─────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────
const GROUP_COLORS = {
  "1": { bg: "bg-blue-100 dark:bg-blue-500/20", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
  "2": { bg: "bg-violet-100 dark:bg-violet-500/20", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  "3": { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  "4": { bg: "bg-emerald-100 dark:bg-emerald-500/20", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  "5": { bg: "bg-rose-100 dark:bg-rose-500/20", text: "text-rose-700 dark:text-rose-300", dot: "bg-rose-500" },
  "6": { bg: "bg-cyan-100 dark:bg-cyan-500/20", text: "text-cyan-700 dark:text-cyan-300", dot: "bg-cyan-500" },
  "7": { bg: "bg-slate-100 dark:bg-slate-700", text: "text-slate-600 dark:text-slate-300", dot: "bg-slate-400" },
};

const getGroupInfo = (id) => {
  const g = CONCESSION_GROUPS.find((x) => x.id === id);
  return g ? { name: g.name, color: GROUP_COLORS[id] || GROUP_COLORS["7"] } : { name: "Not Assigned", color: GROUP_COLORS["7"] };
};

// Fetch students — simulates API
function fetchStudents(classId, admNo, session) {
  let list = STUDENTS_BY_CLASS[classId] || [];
  if (admNo.trim()) {
    list = list.filter((s) =>
      s.registration_no.toLowerCase().includes(admNo.toLowerCase()) ||
      s.name.toLowerCase().includes(admNo.toLowerCase())
    );
  }
  return list;
}

// ─────────────────────────────────────────────────────
// PRIMITIVE COMPONENTS
// ─────────────────────────────────────────────────────
function Select({ value, onChange, children, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800 font-medium
          focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          dark:bg-[#1e2238] dark:text-slate-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? "border-rose-400 ring-2 ring-rose-100" : "border-slate-200 dark:border-[rgba(99,102,241,0.25)]"}`}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  );
}

function InputField({ value, onChange, placeholder, icon: Icon, error }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full ${Icon ? "pl-9" : "pl-3"} pr-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
          bg-white text-slate-800 font-medium placeholder-slate-400
          focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500
          ${error ? "border-rose-400" : "border-slate-200 dark:border-[rgba(99,102,241,0.25)]"}`}
      />
    </div>
  );
}

function FieldLabel({ label, required }) {
  return (
    <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
      {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
    </label>
  );
}

function Toast({ message, type = "success", onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3.5
        rounded-2xl shadow-2xl text-[13px] font-semibold min-w-[280px] max-w-[90vw]
        ${type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
      style={{ animation: "slideUp .25s ease" }}
    >
      {type === "success" ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-80 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// APPROVAL STATUS BADGE
// ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    Pending:  "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
    Rejected: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-300",
    Active:   "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    Inactive: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold ${map[status] || map.Pending}`}>
      {status}
    </span>
  );
}

// ─────────────────────────────────────────────────────
// CONCESSION REQUEST HISTORY MODAL
// ─────────────────────────────────────────────────────
function RequestHistoryModal({ student, onClose }) {
  const history = REQUEST_HISTORY[student.stu_id] || [];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#1a1f35] rounded-2xl shadow-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] overflow-hidden"
        style={{ animation: "modalIn .2s ease" }}
      >
        <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.96)}to{opacity:1;transform:scale(1)}}`}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-gradient-to-r from-indigo-50 to-white dark:from-[#1e2238] dark:to-[#1a1f35]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Clock className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Fee Concession Request History</p>
              <p className="text-[12px] text-slate-500 dark:text-slate-400">{student.name} · {student.registration_no}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400">
              <Inbox className="w-10 h-10 opacity-40" />
              <p className="text-[13px] font-medium">No concession request history found.</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)]">
                <table className="w-full text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-white/[0.03] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                      {["Request Date", "Group Name", "Session", "Approval Status", "Approved Date", "Status"].map((h) => (
                        <th key={h} className="px-4 py-2.5 text-left font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((r, i) => (
                      <tr key={i} className="border-b last:border-0 border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/50 dark:hover:bg-white/[0.02]">
                        <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-medium">{r.requestDate}</td>
                        <td className="px-4 py-3">
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{r.groupName}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{r.session}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.ApprovalStatus} /></td>
                        <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{r.ApprovedAt}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.activeStatus} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden space-y-3">
                {history.map((r, i) => (
                  <div key={i} className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] p-4 bg-slate-50 dark:bg-[#1e2238] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-slate-800 dark:text-slate-100">{r.groupName}</span>
                      <StatusBadge status={r.ApprovalStatus} />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[12px]">
                      <div><span className="text-slate-400">Session:</span> <span className="font-semibold text-slate-700 dark:text-slate-200">{r.session}</span></div>
                      <div><span className="text-slate-400">Requested:</span> <span className="font-semibold text-slate-700 dark:text-slate-200">{r.requestDate}</span></div>
                      <div><span className="text-slate-400">Approved:</span> <span className="font-semibold text-slate-700 dark:text-slate-200">{r.ApprovedAt}</span></div>
                      <div className="flex items-center gap-1.5"><span className="text-slate-400">Status:</span> <StatusBadge status={r.activeStatus} /></div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex justify-end">
          <button onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────
// DESKTOP TABLE ROW
// ─────────────────────────────────────────────────────
function DesktopRow({ student, idx, onGroupSelect, selectedGroup, onSave, onReset, saving, onViewHistory }) {
  const currentGroup = getGroupInfo(student.assigned_group);
  const selectedGroupInfo = selectedGroup ? getGroupInfo(selectedGroup) : null;
  const isDirty = selectedGroup && selectedGroup !== student.assigned_group;

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Admission No */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <Hash className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />
          <span className="text-[13px] font-mono font-semibold text-slate-700 dark:text-slate-200">{student.registration_no}</span>
        </div>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
            {student.name.charAt(0)}
          </div>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{student.name}</span>
        </div>
      </td>

      {/* Current Group */}
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold ${currentGroup.color.bg} ${currentGroup.color.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${currentGroup.color.dot}`} />
          {currentGroup.name}
        </span>
      </td>

      {/* Assign Group — Radio Buttons */}
      <td className="px-4 py-3 min-w-[340px]">
        <div className="flex flex-wrap gap-1.5">
          {CONCESSION_GROUPS.map((g) => {
            const isSelected = selectedGroup === g.id;
            const color = GROUP_COLORS[g.id] || GROUP_COLORS["7"];
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => onGroupSelect(student.stu_id, g.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all
                  ${isSelected
                    ? `${color.bg} ${color.text} border-transparent ring-2 ring-indigo-400 scale-105`
                    : "bg-white dark:bg-[#1e2238] text-slate-500 dark:text-slate-400 border-slate-200 dark:border-[rgba(99,102,241,0.2)] hover:border-indigo-300"
                  }`}
              >
                {isSelected && <Check className="w-3 h-3" />}
                {g.name}
              </button>
            );
          })}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewHistory(student)}
            className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
            title="View Request History"
          >
            <Clock className="w-4 h-4" />
          </button>
          {isDirty && (
            <>
              <button
                onClick={() => onSave(student.stu_id)}
                disabled={saving === student.stu_id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                  bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70 transition-all"
              >
                {saving === student.stu_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
              <button
                onClick={() => onReset(student.stu_id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────
// MOBILE STUDENT CARD
// ─────────────────────────────────────────────────────
function MobileStudentCard({ student, idx, onGroupSelect, selectedGroup, onSave, onReset, saving, onViewHistory }) {
  const [expanded, setExpanded] = useState(false);
  const currentGroup = getGroupInfo(student.assigned_group);
  const isDirty = selectedGroup && selectedGroup !== student.assigned_group;

  return (
    <div className={`rounded-2xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm transition-all
      ${isDirty ? "border-indigo-300 dark:border-indigo-500/50 ring-2 ring-indigo-100 dark:ring-indigo-500/10" : "border-slate-200 dark:border-[rgba(99,102,241,0.15)]"}`}>

      {/* Card Header */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
          {student.name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">{student.registration_no}</p>
        </div>

        {/* Current group badge */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold ${currentGroup.color.bg} ${currentGroup.color.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${currentGroup.color.dot}`} />
            {currentGroup.name}
          </span>
          {isDirty && (
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 animate-pulse">● Unsaved</span>
          )}
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ml-1 flex-shrink-0 ${expanded ? "rotate-180" : ""}`}>
          <ChevronDown className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-4 pb-5 space-y-4">

          {/* Assign Group Label */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2.5">
              Assign Concession Group
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CONCESSION_GROUPS.map((g) => {
                const isSelected = selectedGroup === g.id;
                const color = GROUP_COLORS[g.id] || GROUP_COLORS["7"];
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => onGroupSelect(student.stu_id, g.id)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[12px] font-semibold border transition-all text-left
                      ${isSelected
                        ? `${color.bg} ${color.text} border-transparent ring-2 ring-indigo-400`
                        : "bg-slate-50 dark:bg-[#1e2238] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-[rgba(99,102,241,0.2)]"
                      }`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${isSelected ? color.dot : "bg-slate-300 dark:bg-slate-600"}`} />
                    {g.name}
                    {isSelected && <Check className="w-3.5 h-3.5 ml-auto flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onViewHistory(student)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex-1 justify-center"
            >
              <Clock className="w-4 h-4" />
              View History
            </button>

            {isDirty && (
              <>
                <button
                  onClick={() => onSave(student.stu_id)}
                  disabled={saving === student.stu_id}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
                    bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-70 transition-all flex-1 justify-center"
                >
                  {saving === student.stu_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
                <button
                  onClick={() => onReset(student.stu_id)}
                  className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// FILTER DRAWER (Mobile)
// ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, selectedClass, setSelectedClass, admNo, setAdmNo, onShow, loading, errors }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: "drawerUp .25s ease" }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          <div>
            <FieldLabel label="Session" required />
            <Select value={session} onChange={(e) => setSession(e.target.value)} error={errors.session}>
              <option value="">-- Select Session --</option>
              {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
            {errors.session && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.session}</p>}
          </div>
          <div>
            <FieldLabel label="Admission No." />
            <InputField value={admNo} onChange={(e) => setAdmNo(e.target.value)} placeholder="Enter admission number…" icon={Hash} />
          </div>
          <div>
            <FieldLabel label="Class" required />
            <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} error={errors.cls}>
              {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
            {errors.cls && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cls}</p>}
          </div>
        </div>

        <div className="px-5 pb-8 pt-2 flex gap-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-2xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose(); }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold text-white
              bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Students
          </button>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────
// SUMMARY STRIP
// ─────────────────────────────────────────────────────
function SummaryStrip({ students, selectedGroups }) {
  const assigned = students.filter((s) => selectedGroups[s.stu_id] && selectedGroups[s.stu_id] !== "7").length;
  const unassigned = students.filter((s) => !selectedGroups[s.stu_id] || selectedGroups[s.stu_id] === "7").length;
  const dirty = students.filter((s) => selectedGroups[s.stu_id] && selectedGroups[s.stu_id] !== s.assigned_group).length;

  return (
    <div className="grid grid-cols-3 gap-3">
      {[
        { label: "Total Students", value: students.length, color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", icon: Users },
        { label: "With Concession", value: assigned, color: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", icon: BadgeCheck },
        { label: "Unsaved Changes", value: dirty, color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", icon: FileText },
      ].map(({ label, value, color, bg, icon: Icon }) => (
        <div key={label} className={`rounded-2xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] ${bg} px-3 py-3 sm:px-4 flex items-center gap-3`}>
          <Icon className={`w-5 h-5 flex-shrink-0 ${color}`} />
          <div className="min-w-0">
            <p className={`text-[20px] sm:text-[22px] font-bold tabular-nums leading-tight ${color}`}>{value}</p>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────
export default function AssignConcessionGroup() {
  const [session, setSession]           = useState("");
  const [admNo, setAdmNo]               = useState("");
  const [selectedClass, setSelectedClass] = useState("0");
  const [students, setStudents]         = useState([]);
  const [selectedGroups, setSelectedGroups] = useState({});  // { stu_id: group_id }
  const [loading, setLoading]           = useState(false);
  const [saving, setSaving]             = useState(null);
  const [shown, setShown]               = useState(false);
  const [errors, setErrors]             = useState({});
  const [toast, setToast]               = useState(null);
  const [filterOpen, setFilterOpen]     = useState(false);
  const [historyStudent, setHistoryStudent] = useState(null);
  const [search, setSearch]             = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Validate & Show ──────────────────────────────
  const handleShow = useCallback(() => {
    const err = {};
    if (!session) err.session = "Select a session";
    if (selectedClass === "0") err.cls = "Select a class";
    if (Object.keys(err).length) { setErrors(err); return; }
    setErrors({});
    setLoading(true);

    setTimeout(() => {
      const list = fetchStudents(selectedClass, admNo, session);
      setStudents(list);
      // Pre-fill selectedGroups with current assigned values
      const initGroups = {};
      list.forEach((s) => { initGroups[s.stu_id] = s.assigned_group; });
      setSelectedGroups(initGroups);
      setShown(true);
      setLoading(false);
      setSearch("");
      if (list.length === 0) showToast("No students found for selected criteria.", "error");
      else showToast(`${list.length} students loaded successfully.`);
    }, 700);
  }, [session, selectedClass, admNo]);

  const handleReset = () => {
    setSession(""); setAdmNo(""); setSelectedClass("0");
    setStudents([]); setSelectedGroups({});
    setShown(false); setErrors({}); setSearch("");
  };

  const handleGroupSelect = (stuId, groupId) => {
    setSelectedGroups((prev) => ({ ...prev, [stuId]: groupId }));
  };

  const handleResetRow = (stuId) => {
    const student = students.find((s) => s.stu_id === stuId);
    if (student) setSelectedGroups((prev) => ({ ...prev, [stuId]: student.assigned_group }));
  };

  const handleSave = (stuId) => {
    setSaving(stuId);
    setTimeout(() => {
      // Update local data (API call placeholder)
      setStudents((prev) =>
        prev.map((s) => s.stu_id === stuId ? { ...s, assigned_group: selectedGroups[stuId] } : s)
      );
      setSaving(null);
      const gName = getGroupInfo(selectedGroups[stuId]).name;
      showToast(`Concession group "${gName}" saved successfully.`);
    }, 800);
  };

  // Save All dirty
  const handleSaveAll = () => {
    const dirty = students.filter((s) => selectedGroups[s.stu_id] && selectedGroups[s.stu_id] !== s.assigned_group);
    if (!dirty.length) { showToast("No unsaved changes.", "error"); return; }
    setSaving("all");
    setTimeout(() => {
      setStudents((prev) =>
        prev.map((s) => ({ ...s, assigned_group: selectedGroups[s.stu_id] || s.assigned_group }))
      );
      setSaving(null);
      showToast(`${dirty.length} student(s) updated successfully.`);
    }, 1000);
  };

  // Filtered list
  const filtered = useMemo(() => {
    if (!search) return students;
    const q = search.toLowerCase();
    return students.filter((s) =>
      s.name.toLowerCase().includes(q) ||
      s.registration_no.toLowerCase().includes(q)
    );
  }, [students, search]);

  const hasResults = shown && students.length > 0;
  const dirtyCount = students.filter((s) => selectedGroups[s.stu_id] && selectedGroups[s.stu_id] !== s.assigned_group).length;
  const className = CLASSES.find((c) => c.id === selectedClass)?.name || "";

  return (
    <div className="space-y-4 pb-10 max-w-full">
      <style>{`
        .fee-module * { box-sizing: border-box; }
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
      `}</style>

      <div className="fee-module">

        {/* ── Page Header ─────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/25">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-[18px] sm:text-[20px] font-extrabold text-slate-800 dark:text-slate-100 leading-tight tracking-tight">
                Assign Concession Group
              </h1>
              <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
                Fee Module · Assign fee concession groups to students
              </p>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center gap-1.5 text-[12px] text-slate-400">
            <span className="hover:text-indigo-600 cursor-pointer">Home</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-600 dark:text-slate-300 font-medium">Assign Concession Group</span>
          </div>
        </div>

        {/* ── DESKTOP Filter Card ─────────────────────── */}
        <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden mb-4">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
            <Filter className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              {/* Session */}
              <div>
                <FieldLabel label="Session" required />
                <Select value={session} onChange={(e) => { setSession(e.target.value); setErrors((p) => ({ ...p, session: undefined })); }} error={errors.session}>
                  <option value="">-- Select Session --</option>
                  {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </Select>
                {errors.session && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.session}</p>}
              </div>

              {/* Admission No */}
              <div>
                <FieldLabel label="Admission No." />
                <InputField value={admNo} onChange={(e) => setAdmNo(e.target.value)} placeholder="Enter adm. no…" icon={Hash} />
              </div>

              {/* Class */}
              <div>
                <FieldLabel label="Select Class" required />
                <Select value={selectedClass} onChange={(e) => { setSelectedClass(e.target.value); setErrors((p) => ({ ...p, cls: undefined })); }} error={errors.cls}>
                  {CLASSES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
                {errors.cls && <p className="text-[11px] text-rose-500 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.cls}</p>}
              </div>

              {/* Spacer */}
              <div />

              {/* Buttons */}
              <div className="flex gap-2">
                <button type="button" onClick={handleShow} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                    bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-70">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Show
                </button>
                <button type="button" onClick={handleReset}
                  className="px-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── MOBILE Filter Bar ──────────────────────── */}
        <div className="flex sm:hidden gap-2 mb-4">
          <button type="button" onClick={() => setFilterOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[13px] font-semibold
              bg-indigo-600 text-white shadow-md shadow-indigo-500/25">
            <SlidersHorizontal className="w-4 h-4" />
            {session && selectedClass !== "0" ? `${session} · ${className}` : "Set Filters"}
          </button>
          {shown && (
            <button type="button" onClick={handleReset}
              className="px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>

        <FilterDrawer
          open={filterOpen}
          onClose={() => setFilterOpen(false)}
          session={session} setSession={setSession}
          selectedClass={selectedClass} setSelectedClass={setSelectedClass}
          admNo={admNo} setAdmNo={setAdmNo}
          onShow={handleShow}
          loading={loading}
          errors={errors}
        />

        {/* ── Loading Skeleton ───────────────────────── */}
        {loading && (
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
            ))}
          </div>
        )}

        {/* ── RESULTS ─────────────────────────────────── */}
        {hasResults && !loading && (
          <>
            {/* Summary */}
            <SummaryStrip students={students} selectedGroups={selectedGroups} />

            {/* Results Card */}
            <div className="mt-4 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

              {/* Card Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <div className="flex items-center gap-2.5 flex-1 min-w-0 flex-wrap">
                  <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
                  <GraduationCap className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{className}</span>
                  <span className="text-[12px] text-slate-400">· {session}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400">
                    {filtered.length} student{filtered.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {/* Search */}
                  <div className="relative flex-1 sm:w-48">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search name / adm…"
                      className="w-full pl-8 pr-7 py-2 text-[12px] rounded-xl border outline-none transition-all
                        bg-white text-slate-700 border-slate-200 placeholder-slate-300
                        focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100
                        dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                        dark:placeholder-slate-600"
                    />
                    {search && (
                      <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Save All */}
                  {dirtyCount > 0 && (
                    <button onClick={handleSaveAll} disabled={saving === "all"}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[12px] font-semibold
                        bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70 transition-all whitespace-nowrap">
                      {saving === "all" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      Save All ({dirtyCount})
                    </button>
                  )}
                </div>
              </div>

              {/* Hint bar */}
              <div className="flex items-start gap-2 px-5 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-indigo-50/30 dark:bg-indigo-500/[0.03]">
                <Info className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-indigo-700 dark:text-indigo-400">
                  Click on a group button to assign. Use <strong>Save</strong> per row or <strong>Save All</strong> to batch-update.
                  <span className="hidden sm:inline"> View request history via the clock icon.</span>
                </p>
              </div>

              {/* ── DESKTOP TABLE ── */}
              <div className="hidden lg:block overflow-x-auto">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                    <Search className="w-8 h-8 opacity-40" />
                    <p className="text-[13px]">No students match your search.</p>
                  </div>
                ) : (
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                        {["#", "Admission No.", "Student Name", "Current Group", "Assign Group", "Actions"].map((h) => (
                          <th key={h} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center">
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
                          onGroupSelect={handleGroupSelect}
                          selectedGroup={selectedGroups[student.stu_id]}
                          onSave={handleSave}
                          onReset={handleResetRow}
                          saving={saving}
                          onViewHistory={setHistoryStudent}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* ── TABLET/MOBILE CARDS ── */}
              <div className="lg:hidden p-4 space-y-3">
                {filtered.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3 text-slate-400">
                    <Search className="w-8 h-8 opacity-40" />
                    <p className="text-[13px]">No students match your search.</p>
                  </div>
                ) : (
                  filtered.map((student, i) => (
                    <MobileStudentCard
                      key={student.stu_id}
                      student={student}
                      idx={i + 1}
                      onGroupSelect={handleGroupSelect}
                      selectedGroup={selectedGroups[student.stu_id]}
                      onSave={handleSave}
                      onReset={handleResetRow}
                      saving={saving}
                      onViewHistory={setHistoryStudent}
                    />
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.015]">
                <p className="text-[12px] text-slate-400 dark:text-slate-500">
                  Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{filtered.length}</span> of{" "}
                  <span className="font-semibold text-slate-600 dark:text-slate-300">{students.length}</span> students
                </p>
                {dirtyCount > 0 && (
                  <p className="text-[12px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5" /> {dirtyCount} unsaved change{dirtyCount > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>

            {/* Mobile sticky save all */}
            {dirtyCount > 0 && (
              <div className="fixed bottom-6 inset-x-4 lg:hidden z-30 flex justify-center">
                <button onClick={handleSaveAll} disabled={saving === "all"}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-[14px] font-bold
                    bg-emerald-600 text-white shadow-2xl shadow-emerald-500/30 hover:bg-emerald-700 disabled:opacity-70 transition-all">
                  {saving === "all" ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                  Save All Changes ({dirtyCount})
                </button>
              </div>
            )}
          </>
        )}

        {/* ── Empty State ──────────────────────────────── */}
        {!hasResults && !loading && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <Tag className="w-7 h-7 text-indigo-400 opacity-60" />
            </div>
            <div className="text-center">
              <p className="text-[15px] font-bold text-slate-500 dark:text-slate-400">No students loaded yet</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1 max-w-xs leading-relaxed">
                Select a session and class, then click <strong>Show</strong> to load students and assign concession groups.
              </p>
            </div>
            <button onClick={() => setFilterOpen(true)}
              className="sm:hidden flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[13px] font-semibold bg-indigo-600 text-white">
              <SlidersHorizontal className="w-4 h-4" />
              Set Filters
            </button>
          </div>
        )}

        {/* ── History Modal ─────────────────────────────── */}
        {historyStudent && (
          <RequestHistoryModal student={historyStudent} onClose={() => setHistoryStudent(null)} />
        )}

        {/* Toast */}
        {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </div>
  );
}
