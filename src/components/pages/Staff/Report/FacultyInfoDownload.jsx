/**
 * FacultyInfoDownload.jsx
 * Converts legacy ASPX "Faculty Info Sheet (Download)" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Column selector (CheckboxList equivalent) with "Select All"
 *  - Show report button
 *  - Faculty data table with dynamic columns
 *  - Excel-style export
 *  - Mobile: cards layout with expandable details
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback, useRef } from "react";
import {
  Download, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, Users, Search, SlidersHorizontal,
  FileSpreadsheet, BookOpen, Building2, MapPin, TrendingUp,
  Info, Phone, Mail, GraduationCap, Briefcase, Calendar,
  UserCheck, Hash, Filter, CheckSquare, Square, LayoutGrid
} from "lucide-react";

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: "Saraswati Vidya Mandir Senior Secondary School",
  address: "Civil Lines, Dehradun, Uttarakhand – 248001",
};

// All possible columns that can be selected (mirrors CheckBoxList)
const ALL_COLUMNS = [
  { key: "sno",          label: "S.No.",         icon: Hash },
  { key: "empCode",      label: "Emp. Code",      icon: Hash },
  { key: "name",         label: "Name",           icon: Users },
  { key: "designation",  label: "Designation",    icon: Briefcase },
  { key: "department",   label: "Department",     icon: Building2 },
  { key: "qualification",label: "Qualification",  icon: GraduationCap },
  { key: "subject",      label: "Subject",        icon: BookOpen },
  { key: "dob",          label: "Date of Birth",  icon: Calendar },
  { key: "doj",          label: "Date of Joining",icon: Calendar },
  { key: "mobile",       label: "Mobile",         icon: Phone },
  { key: "email",        label: "Email",          icon: Mail },
  { key: "status",       label: "Status",         icon: UserCheck },
];

const FACULTY_DATA = [
  { empCode:"FAC001", name:"Dr. Anita Sharma",     designation:"Principal",        department:"Administration", qualification:"Ph.D. Education",   subject:"Administration",  dob:"15-Mar-1972", doj:"01-Jun-2005", mobile:"9876543210", email:"anita.sharma@svm.edu",    status:"Active"   },
  { empCode:"FAC002", name:"Mr. Rajesh Kumar",     designation:"Vice Principal",   department:"Science",        qualification:"M.Sc, B.Ed",        subject:"Physics",         dob:"22-Jul-1975", doj:"15-Aug-2007", mobile:"9823456789", email:"rajesh.kumar@svm.edu",    status:"Active"   },
  { empCode:"FAC003", name:"Mrs. Priya Verma",     designation:"Senior Teacher",   department:"Mathematics",    qualification:"M.Sc Mathematics",  subject:"Mathematics",     dob:"10-Jan-1980", doj:"01-Apr-2010", mobile:"9812345678", email:"priya.verma@svm.edu",     status:"Active"   },
  { empCode:"FAC004", name:"Mr. Suresh Tiwari",    designation:"TGT",              department:"Social Science", qualification:"M.A History, B.Ed",  subject:"History",         dob:"05-Sep-1982", doj:"10-Jul-2012", mobile:"9801234567", email:"suresh.tiwari@svm.edu",   status:"Active"   },
  { empCode:"FAC005", name:"Ms. Kavita Singh",     designation:"PGT",              department:"English",        qualification:"M.A English, B.Ed",  subject:"English",         dob:"18-Feb-1985", doj:"20-Jun-2013", mobile:"9790123456", email:"kavita.singh@svm.edu",    status:"Active"   },
  { empCode:"FAC006", name:"Mr. Anil Gupta",       designation:"TGT",              department:"Science",        qualification:"M.Sc Chemistry",    subject:"Chemistry",       dob:"30-Oct-1983", doj:"01-Aug-2011", mobile:"9779012345", email:"anil.gupta@svm.edu",      status:"Active"   },
  { empCode:"FAC007", name:"Mrs. Sunita Rawat",    designation:"PRT",              department:"Primary",        qualification:"B.Ed",              subject:"General",         dob:"14-Jun-1988", doj:"15-Jan-2015", mobile:"9768901234", email:"sunita.rawat@svm.edu",    status:"Active"   },
  { empCode:"FAC008", name:"Mr. Deepak Joshi",     designation:"TGT",              department:"Mathematics",    qualification:"M.Sc, B.Ed",        subject:"Mathematics",     dob:"25-Dec-1981", doj:"01-Mar-2009", mobile:"9757890123", email:"deepak.joshi@svm.edu",    status:"Active"   },
  { empCode:"FAC009", name:"Ms. Neha Bisht",       designation:"PGT",              department:"Commerce",       qualification:"M.Com, B.Ed",       subject:"Accountancy",     dob:"07-Apr-1987", doj:"10-Aug-2014", mobile:"9746789012", email:"neha.bisht@svm.edu",      status:"Active"   },
  { empCode:"FAC010", name:"Mr. Vikas Negi",       designation:"PRT",              department:"Primary",        qualification:"D.El.Ed",           subject:"EVS",             dob:"19-Nov-1990", doj:"01-Jun-2017", mobile:"9735678901", email:"vikas.negi@svm.edu",      status:"Active"   },
  { empCode:"FAC011", name:"Mrs. Rekha Pandey",    designation:"Senior Teacher",   department:"Hindi",          qualification:"M.A Hindi, B.Ed",   subject:"Hindi",           dob:"03-Mar-1979", doj:"20-Jul-2008", mobile:"9724567890", email:"rekha.pandey@svm.edu",    status:"Active"   },
  { empCode:"FAC012", name:"Mr. Rohit Arora",      designation:"TGT",              department:"Computer Sc.",   qualification:"MCA, B.Ed",         subject:"Computer Sc.",    dob:"12-Aug-1986", doj:"01-Jan-2016", mobile:"9713456789", email:"rohit.arora@svm.edu",     status:"Active"   },
  { empCode:"FAC013", name:"Ms. Pooja Dimri",      designation:"PGT",              department:"Biology",        qualification:"M.Sc Biology",      subject:"Biology",         dob:"27-May-1984", doj:"15-Jun-2012", mobile:"9702345678", email:"pooja.dimri@svm.edu",     status:"Active"   },
  { empCode:"FAC014", name:"Mr. Aakash Rana",      designation:"PRT",              department:"Primary",        qualification:"B.El.Ed",           subject:"General",         dob:"09-Feb-1993", doj:"01-Apr-2019", mobile:"9691234567", email:"aakash.rana@svm.edu",     status:"Active"   },
  { empCode:"FAC015", name:"Mrs. Manisha Chauhan", designation:"TGT",              department:"Social Science", qualification:"M.A Geography",     subject:"Geography",       dob:"21-Jul-1983", doj:"10-Sep-2010", mobile:"9680123456", email:"manisha.chauhan@svm.edu", status:"On Leave" },
  { empCode:"FAC016", name:"Mr. Pankaj Bhatt",     designation:"PGT",              department:"Economics",      qualification:"M.A Economics",     subject:"Economics",       dob:"16-Jan-1980", doj:"01-Jun-2006", mobile:"9669012345", email:"pankaj.bhatt@svm.edu",    status:"Active"   },
  { empCode:"FAC017", name:"Ms. Aarti Lohani",     designation:"TGT",              department:"Sanskrit",       qualification:"M.A Sanskrit, B.Ed",subject:"Sanskrit",        dob:"04-Sep-1989", doj:"15-Aug-2016", mobile:"9658901234", email:"aarti.lohani@svm.edu",    status:"Active"   },
  { empCode:"FAC018", name:"Mr. Sanjay Mehra",     designation:"Physical Ed.",     department:"Sports",         qualification:"M.P.Ed",            subject:"Physical Ed.",    dob:"11-Jun-1978", doj:"01-Jul-2004", mobile:"9647890123", email:"sanjay.mehra@svm.edu",    status:"Active"   },
  { empCode:"FAC019", name:"Mrs. Geeta Thakur",    designation:"PRT",              department:"Primary",        qualification:"NTT, B.Ed",         subject:"Nursery",         dob:"29-Oct-1991", doj:"01-Jan-2018", mobile:"9636789012", email:"geeta.thakur@svm.edu",    status:"Active"   },
  { empCode:"FAC020", name:"Mr. Harish Dobhal",    designation:"Lab Assistant",    department:"Science Lab",    qualification:"B.Sc",              subject:"Lab Work",        dob:"17-Mar-1987", doj:"15-Mar-2015", mobile:"9625678901", email:"harish.dobhal@svm.edu",   status:"Inactive" },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const DEPT_COLORS = [
  { fg: "#1d4ed8", bg: "#dbeafe" }, { fg: "#7c3aed", bg: "#ede9fe" },
  { fg: "#0891b2", bg: "#cffafe" }, { fg: "#059669", bg: "#d1fae5" },
  { fg: "#d97706", bg: "#fef3c7" }, { fg: "#dc2626", bg: "#fee2e2" },
  { fg: "#0369a1", bg: "#e0f2fe" }, { fg: "#7e22ce", bg: "#f3e8ff" },
];
const deptColor = (s = "") => DEPT_COLORS[s.charCodeAt(0) % DEPT_COLORS.length];

const statusStyle = (s) => {
  if (s === "Active")   return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400";
  if (s === "On Leave") return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400";
  return "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400";
};

// Convert table to CSV and trigger download
const exportToExcel = (rows, selectedCols) => {
  const cols = ALL_COLUMNS.filter(c => selectedCols.includes(c.key) && c.key !== "sno");
  const headers = ["S.No.", ...cols.map(c => c.label)];
  const csvRows = [headers.join(",")];
  rows.forEach((r, i) => {
    const row = [i + 1, ...cols.map(c => `"${r[c.key] ?? ""}"`),];
    csvRows.push(row.join(","));
  });
  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "FacultyInfoSheet.csv"; a.click();
  URL.revokeObjectURL(url);
};

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function Toast({ message, type = "success", onClose }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
      rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
      ${type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
      style={{ animation: "toastUp .25s ease" }}>
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === "success" ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
    amber:   "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400",
    violet:  "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  );
}

function SchoolHeader() {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <p className="text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Faculty Info Sheet (Download)
      </p>
    </div>
  );
}

// ─── COLUMN SELECTOR PANEL ────────────────────────────────────────────────────

function ColumnSelector({ selected, onChange, selectAll, onSelectAll }) {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Select Columns to Display</span>
        <span className="text-[12px] text-slate-400 dark:text-slate-500">{selected.length}/{ALL_COLUMNS.length} selected</span>
      </div>
      <div className="p-5">
        {/* Select All */}
        <button
          type="button"
          onClick={onSelectAll}
          className={`flex items-center gap-2.5 mb-4 px-4 py-2.5 rounded-xl border transition-all text-[13px] font-semibold
            ${selectAll
              ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
              : "bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[rgba(99,102,241,0.25)] hover:border-blue-400"
            }`}
        >
          {selectAll ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          Select All
        </button>

        {/* Column Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {ALL_COLUMNS.map((col) => {
            const isChecked = selected.includes(col.key);
            const Icon = col.icon;
            return (
              <button
                key={col.key}
                type="button"
                onClick={() => onChange(col.key)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-left transition-all text-[12px] font-semibold
                  ${isChecked
                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300"
                    : "bg-white dark:bg-[#1e2238] border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-[rgba(99,102,241,0.4)]"
                  }`}
              >
                <span className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 transition-all
                  ${isChecked ? "text-blue-600 dark:text-blue-400" : "text-slate-300 dark:text-slate-600"}`}>
                  {isChecked
                    ? <CheckSquare className="w-4 h-4" />
                    : <Square className="w-4 h-4" />
                  }
                </span>
                <span className="truncate">{col.label}</span>
              </button>
            );
          })}
        </div>

        {selected.length === 0 && (
          <p className="flex items-center gap-1.5 mt-3 text-[12px] text-rose-500">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Please select at least one column to display.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── MOBILE COLUMN DRAWER ─────────────────────────────────────────────────────

function ColumnDrawer({ open, onClose, selected, onChange, selectAll, onSelectAll, onSubmit, loading }) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[85vh] flex flex-col"
        style={{ animation: "drawerUp .25s ease" }}>
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Columns</span>
            <span className="text-[11px] text-slate-400">{selected.length}/{ALL_COLUMNS.length}</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {/* Select All */}
          <button type="button" onClick={onSelectAll}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-[13px] font-bold
              ${selectAll
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-[rgba(99,102,241,0.25)]"}`}>
            {selectAll ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            Select All Columns
          </button>

          {ALL_COLUMNS.map((col) => {
            const isChecked = selected.includes(col.key);
            const Icon = col.icon;
            return (
              <button key={col.key} type="button" onClick={() => onChange(col.key)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-[13px] font-semibold text-left
                  ${isChecked
                    ? "bg-blue-50 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/40 text-blue-700 dark:text-blue-300"
                    : "bg-white dark:bg-[#1e2238] border-slate-200 dark:border-[rgba(99,102,241,0.2)] text-slate-600 dark:text-slate-300"}`}>
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{col.label}</span>
                {isChecked ? <CheckSquare className="w-4 h-4 flex-shrink-0 text-blue-500" /> : <Square className="w-4 h-4 flex-shrink-0 text-slate-300" />}
              </button>
            );
          })}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-3 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            Cancel
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose(); }} disabled={loading || selected.length === 0}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  );
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx, visibleCols }) {
  const { fg, bg } = deptColor(row.department);
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {visibleCols.includes("sno") && (
        <td className="px-3 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>
      )}
      {visibleCols.includes("empCode") && (
        <td className="px-3 py-3 text-center text-[12px] font-mono font-semibold text-slate-600 dark:text-slate-300">{row.empCode}</td>
      )}
      {visibleCols.includes("name") && (
        <td className="px-3 py-3">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: bg, color: fg }}>
              {row.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
            </span>
            <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.name}</span>
          </div>
        </td>
      )}
      {visibleCols.includes("designation") && (
        <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.designation}</td>
      )}
      {visibleCols.includes("department") && (
        <td className="px-3 py-3">
          <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold" style={{ background: bg, color: fg }}>
            {row.department}
          </span>
        </td>
      )}
      {visibleCols.includes("qualification") && (
        <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400 max-w-[140px] truncate" title={row.qualification}>{row.qualification}</td>
      )}
      {visibleCols.includes("subject") && (
        <td className="px-3 py-3 text-[12px] text-slate-600 dark:text-slate-300">{row.subject}</td>
      )}
      {visibleCols.includes("dob") && (
        <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">{row.dob}</td>
      )}
      {visibleCols.includes("doj") && (
        <td className="px-3 py-3 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap tabular-nums">{row.doj}</td>
      )}
      {visibleCols.includes("mobile") && (
        <td className="px-3 py-3 text-[12px] font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.mobile}</td>
      )}
      {visibleCols.includes("email") && (
        <td className="px-3 py-3 text-[12px] text-blue-600 dark:text-blue-400 max-w-[180px] truncate" title={row.email}>{row.email}</td>
      )}
      {visibleCols.includes("status") && (
        <td className="px-3 py-3 text-center">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-[11px] font-bold ${statusStyle(row.status)}`}>
            {row.status}
          </span>
        </td>
      )}
    </tr>
  );
}

// ─── MOBILE FACULTY CARD ──────────────────────────────────────────────────────

function MobileCard({ row, idx, visibleCols }) {
  const [expanded, setExpanded] = useState(false);
  const { fg, bg } = deptColor(row.department);

  const detailCols = visibleCols.filter(k => !["sno","name","designation","status"].includes(k));

  const colLabel = (key) => ALL_COLUMNS.find(c => c.key === key)?.label ?? key;

  const cellValue = (key) => {
    if (key === "department") return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[11px] font-semibold" style={{ background: bg, color: fg }}>
        {row[key]}
      </span>
    );
    return <span className="text-slate-700 dark:text-slate-200">{row[key] ?? "—"}</span>;
  };

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button type="button" onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        <span className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold" style={{ background: bg, color: fg }}>
          {row.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
        </span>
        <div className="flex-1 min-w-0">
          {visibleCols.includes("name") && (
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
          )}
          <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
            {visibleCols.includes("designation") && <span>{row.designation}</span>}
            {visibleCols.includes("department") && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold" style={{ background: bg, color: fg }}>
                {row.department}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {visibleCols.includes("status") && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${statusStyle(row.status)}`}>{row.status}</span>
          )}
          {visibleCols.includes("sno") && (
            <span className="text-[10px] text-slate-400">#{idx}</span>
          )}
        </div>
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? "rotate-90" : ""}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {expanded && detailCols.length > 0 && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-2">
            {detailCols.map(key => (
              <div key={key} className="rounded-xl bg-slate-50 dark:bg-[#1e2238] border border-slate-100 dark:border-[rgba(99,102,241,0.12)] p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">{colLabel(key)}</p>
                <p className="text-[12px] font-semibold truncate">{cellValue(key)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function FacultyInfoDownload() {
  const [selectedCols, setSelectedCols]   = useState(["sno", "name", "designation", "department", "subject", "mobile", "status"]);
  const [rows,          setRows]           = useState([]);
  const [loading,       setLoading]        = useState(false);
  const [exporting,     setExporting]      = useState(false);
  const [drawerOpen,    setDrawerOpen]     = useState(false);
  const [search,        setSearch]         = useState("");
  const [toast,         setToast]          = useState(null);
  const [shown,         setShown]          = useState(false);
  const [colError,      setColError]       = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Toggle single column
  const toggleCol = useCallback((key) => {
    setSelectedCols(prev =>
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
    setColError(false);
  }, []);

  // Select all / deselect all
  const allSelected = selectedCols.length === ALL_COLUMNS.length;
  const toggleAll = useCallback(() => {
    setSelectedCols(allSelected ? [] : ALL_COLUMNS.map(c => c.key));
    setColError(false);
  }, [allSelected]);

  // Show report
  const handleSubmit = useCallback(() => {
    if (selectedCols.length === 0) {
      setColError(true);
      showToast("Please select at least one column.", "error");
      return;
    }
    setColError(false);
    setLoading(true);
    setSearch("");

    // Simulate API call
    setTimeout(() => {
      setRows(FACULTY_DATA);
      setShown(true);
      setLoading(false);
      showToast(`Faculty info loaded — ${FACULTY_DATA.length} records found.`);
    }, 700);
  }, [selectedCols]);

  const handleReset = () => {
    setSelectedCols(["sno","name","designation","department","subject","mobile","status"]);
    setRows([]); setSearch(""); setShown(false); setColError(false);
  };

  const handleExport = () => {
    if (rows.length === 0) { showToast("No data to export. Show report first.", "error"); return; }
    setExporting(true);
    setTimeout(() => {
      exportToExcel(filtered, selectedCols);
      setExporting(false);
      showToast("Faculty Info Sheet downloaded successfully!");
    }, 500);
  };

  // Search filter
  const filtered = useMemo(() => {
    if (!search) return rows;
    const q = search.toLowerCase();
    return rows.filter(r =>
      r.name.toLowerCase().includes(q) ||
      r.designation.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.subject.toLowerCase().includes(q) ||
      r.empCode.toLowerCase().includes(q)
    );
  }, [rows, search]);

  // Summary stats
  const stats = useMemo(() => ({
    total:    filtered.length,
    active:   filtered.filter(r => r.status === "Active").length,
    onLeave:  filtered.filter(r => r.status === "On Leave").length,
    inactive: filtered.filter(r => r.status === "Inactive").length,
  }), [filtered]);

  const hasResults = shown && rows.length > 0;

  // Ordered visible cols (preserve column order)
  const visibleCols = ALL_COLUMNS.filter(c => selectedCols.includes(c.key)).map(c => c.key);

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Faculty Info Sheet
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Select columns, generate and download faculty information report.
          </p>
        </div>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Download Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP: Column Selector ── */}
      <div className="hidden sm:block">
        <ColumnSelector
          selected={selectedCols}
          onChange={toggleCol}
          selectAll={allSelected}
          onSelectAll={toggleAll}
        />
        {colError && (
          <p className="flex items-center gap-1.5 mt-2 text-[12px] text-rose-500">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Please select at least one column.
          </p>
        )}
        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button type="button" onClick={handleSubmit} disabled={loading || selectedCols.length === 0}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-60">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Submit / Show Report
          </button>
          <button type="button" onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* ── MOBILE: Action Bar ── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setDrawerOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          Columns ({selectedCols.length})
        </button>
        <button type="button" onClick={handleSubmit} disabled={loading || selectedCols.length === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-sm disabled:opacity-60">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          Show
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {shown && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Column Drawer (Mobile) */}
      <ColumnDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        selected={selectedCols}
        onChange={toggleCol}
        selectAll={allSelected}
        onSelectAll={toggleAll}
        onSubmit={handleSubmit}
        loading={loading}
      />

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}     label="Total Faculty"  value={stats.total}    color="blue"    />
            <SummaryCard icon={UserCheck} label="Active"         value={stats.active}   color="emerald" />
            <SummaryCard icon={Calendar}  label="On Leave"       value={stats.onLeave}  color="amber"   />
            <SummaryCard icon={AlertCircle} label="Inactive"     value={stats.inactive} color="violet"  />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Faculty Information</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? "s" : ""}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 flex-shrink-0">
                  {visibleCols.length} cols
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-56 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, dept, subject…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
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
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Showing {visibleCols.length} selected column{visibleCols.length !== 1 ? "s" : ""}. Use Download Excel to export the full report.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {visibleCols.map(key => (
                        <th key={key} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                          {ALL_COLUMNS.find(c => c.key === key)?.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.empCode} row={row} idx={i + 1} visibleCols={visibleCols} />
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see all selected details.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={row.empCode} row={row} idx={i + 1} visibleCols={visibleCols} />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{" "}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              <div className="flex items-center gap-3">
                {search && (
                  <button onClick={() => setSearch("")}
                    className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    <X className="w-3 h-3" /> Clear search
                  </button>
                )}
                {/* Desktop download button in footer */}
                <button type="button" onClick={handleExport} disabled={exporting}
                  className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline disabled:opacity-60">
                  {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
                  Download
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Download className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select columns above and click <strong>Submit / Show Report</strong> to generate the faculty info sheet.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
