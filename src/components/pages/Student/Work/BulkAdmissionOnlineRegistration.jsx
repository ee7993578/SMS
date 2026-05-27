import { useState, useRef, useMemo } from "react";
import {
  ChevronRight, Upload, FileSpreadsheet, RefreshCw, Eye,
  Trash2, Download, Users, CheckCircle2, XCircle, AlertCircle,
  CalendarDays, Hash, BookOpen, ToggleLeft, ToggleRight,
  FileUp, ClipboardList, Search, X
} from "lucide-react";

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const SESSIONS = ["2024-25", "2023-24", "2022-23", "2021-22"];

const CLASSES = [
  "Nursery", "LKG", "UKG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12",
];

// Dummy upload history records
const DUMMY_UPLOAD_RECORDS = [
  { id: 1, excelId: "EXC-001", uploadCount: 45, failedCount: 2, postedDate: "12-May-2024 10:32 AM" },
  { id: 2, excelId: "EXC-002", uploadCount: 30, failedCount: 0, postedDate: "14-May-2024 02:15 PM" },
  { id: 3, excelId: "EXC-003", uploadCount: 60, failedCount: 5, postedDate: "18-May-2024 09:45 AM" },
  { id: 4, excelId: "EXC-004", uploadCount: 22, failedCount: 1, postedDate: "20-May-2024 11:00 AM" },
];

// Dummy report records (for Report mode)
const DUMMY_REPORT_RECORDS = [
  { id: 1, regNo: "REG-1001", name: "Aarav Sharma", class: "Class 5", section: "A", status: "Pending" },
  { id: 2, regNo: "REG-1002", name: "Priya Singh", class: "Class 7", section: "B", status: "Approved" },
  { id: 3, regNo: "REG-1003", name: "Rohan Gupta", class: "Class 3", section: "C", status: "Pending" },
  { id: 4, regNo: "REG-1004", name: "Ananya Verma", class: "Class 9", section: "A", status: "Rejected" },
  { id: 5, regNo: "REG-1005", name: "Karan Patel", class: "Class 6", section: "D", status: "Approved" },
];

// ─── Sub-components ────────────────────────────────────────────────────────────

// Multi-select class listbox
function ClassMultiSelect({ selected, onChange }) {
  const [search, setSearch] = useState("");
  const filtered = CLASSES.filter((c) => c.toLowerCase().includes(search.toLowerCase()));

  const toggleAll = () => {
    onChange(selected.length === CLASSES.length ? [] : [...CLASSES]);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-200">
        <Search size={12} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search class..."
          className="flex-1 text-xs bg-transparent outline-none text-slate-600"
        />
        {search && (
          <button onClick={() => setSearch("")}>
            <X size={11} className="text-slate-400" />
          </button>
        )}
      </div>
      <div className="overflow-y-auto" style={{ maxHeight: "160px" }}>
        {filtered.map((cls) => {
          const checked = selected.includes(cls);
          return (
            <label key={cls}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer text-xs transition border-b border-slate-50 last:border-b-0
                ${checked ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
              <input type="checkbox" checked={checked}
                onChange={() => onChange(checked ? selected.filter((c) => c !== cls) : [...selected, cls])}
                className="w-3.5 h-3.5 accent-blue-600" />
              {cls}
            </label>
          );
        })}
      </div>
      <div className="px-3 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{selected.length} selected</span>
        <button onClick={toggleAll}
          className="text-[10px] text-blue-600 font-medium hover:underline">
          {selected.length === CLASSES.length ? "Deselect All" : "Select All"}
        </button>
      </div>
    </div>
  );
}

// Upload Record Row (desktop)
function UploadRow({ record, onDelete, onShow }) {
  return (
    <tr className="hover:bg-blue-50/30 transition border-b border-slate-100">
      <td className="px-4 py-3 text-xs text-slate-500 font-medium">{record.id}</td>
      <td className="px-4 py-3">
        <span className="text-xs font-semibold text-slate-700">{record.uploadCount}</span>
        <span className="text-[10px] text-slate-400 ml-1">records</span>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full
          ${record.failedCount > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
          {record.failedCount > 0 ? <XCircle size={10} /> : <CheckCircle2 size={10} />}
          {record.failedCount}
        </span>
      </td>
      <td className="px-4 py-3 text-xs text-slate-600">{record.postedDate}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <button onClick={() => onShow(record)}
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            <Eye size={11} /> Show
          </button>
          <button onClick={() => onDelete(record.id)}
            className="flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition">
            <Trash2 size={11} /> Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

// Upload Record Card (mobile)
function UploadCard({ record, onDelete, onShow }) {
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 mb-3">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-slate-400">Upload #{record.id}</p>
          <p className="text-sm font-semibold text-slate-700 mt-0.5">{record.excelId}</p>
        </div>
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full
          ${record.failedCount > 0 ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
          {record.failedCount > 0 ? <XCircle size={9} /> : <CheckCircle2 size={9} />}
          {record.failedCount > 0 ? `${record.failedCount} failed` : "All OK"}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-[10px] text-slate-400 uppercase">Uploaded</p>
          <p className="text-sm font-bold text-slate-700">{record.uploadCount}</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-2">
          <p className="text-[10px] text-slate-400 uppercase">Date</p>
          <p className="text-xs font-medium text-slate-600">{record.postedDate}</p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => onShow(record)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition">
          <Eye size={12} /> Show
        </button>
        <button onClick={() => onDelete(record.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold text-white bg-rose-500 rounded-lg hover:bg-rose-600 transition">
          <Trash2 size={12} /> Delete
        </button>
      </div>
    </div>
  );
}

// Report Record Card (mobile)
function ReportCard({ rec }) {
  const statusColor = rec.status === "Approved"
    ? "bg-emerald-100 text-emerald-700"
    : rec.status === "Rejected"
    ? "bg-rose-100 text-rose-700"
    : "bg-amber-100 text-amber-700";

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm p-4 mb-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-slate-800">{rec.name}</p>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
          {rec.status}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Reg No", value: rec.regNo },
          { label: "Class", value: rec.class },
          { label: "Section", value: rec.section },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-50 rounded-lg p-2">
            <p className="text-[10px] text-slate-400 uppercase">{label}</p>
            <p className="text-xs font-semibold text-slate-700">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Confirm Delete Modal
function DeleteModal({ open, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
            <Trash2 size={22} className="text-rose-600" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Delete Record?</h3>
          <p className="text-sm text-slate-500">This action cannot be undone. All uploaded data in this batch will be removed.</p>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 bg-rose-600 rounded-xl text-sm text-white font-semibold hover:bg-rose-700 transition">
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function BulkAdmissionOnlineRegistration() {
  // Mode: "Excel" | "Report"
  const [admissionType, setAdmissionType] = useState("Excel");

  // Common
  const [session, setSession] = useState("2024-25");
  const [loading, setLoading] = useState(false);

  // Excel mode
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadRecords, setUploadRecords] = useState(DUMMY_UPLOAD_RECORDS);
  const [showUploadTable, setShowUploadTable] = useState(true);
  const fileInputRef = useRef(null);

  // Delete modal
  const [deleteId, setDeleteId] = useState(null);

  // Report mode
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [regNo, setRegNo] = useState("");
  const [reportRecords, setReportRecords] = useState([]);
  const [reportSearched, setReportSearched] = useState(false);

  // ── Handlers ──

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = () => {
    if (!selectedFile) {
      alert("Please select an Excel file to upload.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const newRecord = {
        id: uploadRecords.length + 1,
        excelId: `EXC-00${uploadRecords.length + 1}`,
        uploadCount: Math.floor(Math.random() * 50) + 10,
        failedCount: Math.floor(Math.random() * 3),
        postedDate: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      };
      setUploadRecords((prev) => [newRecord, ...prev]);
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      setLoading(false);
      setShowUploadTable(true);
    }, 800);
  };

  const handleDeleteRequest = (id) => setDeleteId(id);

  const handleDeleteConfirm = () => {
    setUploadRecords((prev) => prev.filter((r) => r.id !== deleteId));
    setDeleteId(null);
  };

  const handleShow = (record) => {
    alert(`Showing details for Upload ID: ${record.excelId}\nUploaded: ${record.uploadCount} records\nFailed: ${record.failedCount}`);
  };

  const handleViewReport = () => {
    setLoading(true);
    setReportSearched(false);
    setTimeout(() => {
      let results = [...DUMMY_REPORT_RECORDS];
      if (selectedClasses.length > 0)
        results = results.filter((r) => selectedClasses.includes(r.class));
      if (regNo.trim())
        results = results.filter((r) => r.regNo.toLowerCase().includes(regNo.trim().toLowerCase()));
      setReportRecords(results);
      setReportSearched(true);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setSelectedFile(null);
    setSelectedClasses([]);
    setRegNo("");
    setReportRecords([]);
    setReportSearched(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Stats for Excel mode
  const totalUploaded = useMemo(() =>
    uploadRecords.reduce((s, r) => s + r.uploadCount, 0), [uploadRecords]);
  const totalFailed = useMemo(() =>
    uploadRecords.reduce((s, r) => s + r.failedCount, 0), [uploadRecords]);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-screen-xl mx-auto">
          <nav className="flex items-center gap-1 text-xs text-slate-400 mb-1">
            <span>Home</span>
            <ChevronRight size={11} />
            <span>Registration</span>
            <ChevronRight size={11} />
            <span className="text-blue-600 font-medium">Bulk Admission</span>
          </nav>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <Users size={15} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Bulk Admission — Online Student Registration</h1>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 space-y-4">

        {/* ── Filter / Control Panel ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
            <h2 className="text-sm font-semibold text-slate-700">Configuration</h2>
          </div>

          <div className="p-5">
            {/* Row 1: Type toggle + Session */}
            <div className="flex flex-col sm:flex-row gap-4 sm:items-start mb-5">

              {/* Admission Type Toggle */}
              <div className="flex-shrink-0">
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  Select Admission Type
                </label>
                <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit">
                  {["Excel", "Report"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => { setAdmissionType(type); handleReset(); }}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold transition
                        ${admissionType === type
                          ? "bg-white text-blue-700 shadow-sm border border-blue-100"
                          : "text-slate-500 hover:text-slate-700"}`}
                    >
                      {type === "Excel" ? <FileSpreadsheet size={13} /> : <ClipboardList size={13} />}
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Session */}
              <div className="w-full sm:w-48">
                <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                  <span className="flex items-center gap-1"><CalendarDays size={12} /> Session</span>
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl text-sm text-slate-700 px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                >
                  {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* ── Excel Mode ── */}
            {admissionType === "Excel" && (
              <div className="flex flex-col sm:flex-row gap-4 sm:items-end flex-wrap">
                {/* File picker */}
                <div className="flex-1 min-w-0">
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    Select File To Import
                  </label>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 cursor-pointer transition
                      ${selectedFile ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/40"}`}
                  >
                    <FileUp size={18} className={selectedFile ? "text-blue-500" : "text-slate-400"} />
                    <span className={`text-sm truncate ${selectedFile ? "text-blue-700 font-medium" : "text-slate-400"}`}>
                      {selectedFile ? selectedFile.name : "Click to choose Excel file (.xlsx)"}
                    </span>
                    {selectedFile && (
                      <button onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                        className="ml-auto flex-shrink-0">
                        <X size={14} className="text-slate-400" />
                      </button>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileChange} className="hidden" />
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-2 flex-shrink-0">
                  <button
                    type="button"
                    onClick={handleUpload}
                    disabled={loading || !selectedFile}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-sm w-full sm:w-auto"
                  >
                    {loading ? <RefreshCw size={14} className="animate-spin" /> : <Upload size={14} />}
                    Upload
                  </button>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); alert("Downloading blank Excel template..."); }}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition w-full sm:w-auto"
                  >
                    <Download size={14} />
                    Blank Excel
                  </a>
                </div>
              </div>
            )}

            {/* ── Report Mode ── */}
            {admissionType === "Report" && (
              <div className="flex flex-col sm:flex-row gap-4 sm:items-end flex-wrap">
                {/* Class multi-select */}
                <div className="w-full sm:w-56">
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    <span className="flex items-center gap-1"><BookOpen size={12} /> Select Class</span>
                  </label>
                  <ClassMultiSelect selected={selectedClasses} onChange={setSelectedClasses} />
                </div>

                {/* Reg No */}
                <div className="flex-1 min-w-0 sm:max-w-xs">
                  <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase tracking-wide">
                    <span className="flex items-center gap-1"><Hash size={12} /> Online Registration No.</span>
                  </label>
                  <input
                    value={regNo}
                    onChange={(e) => setRegNo(e.target.value)}
                    placeholder="e.g. REG-1001"
                    className="w-full border border-slate-200 rounded-xl text-sm text-slate-700 px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* View Record Button */}
                <button
                  type="button"
                  onClick={handleViewReport}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-sm w-full sm:w-auto"
                >
                  {loading ? <RefreshCw size={14} className="animate-spin" /> : <Eye size={14} />}
                  View Record
                </button>

                <button type="button" onClick={handleReset}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-50 transition w-full sm:w-auto">
                  <RefreshCw size={13} /> Reset
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Excel Mode: Stats + Upload Table ── */}
        {admissionType === "Excel" && showUploadTable && (
          <div>
            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { label: "Total Batches", value: uploadRecords.length, color: "blue", icon: FileSpreadsheet },
                { label: "Total Uploaded", value: totalUploaded, color: "emerald", icon: CheckCircle2 },
                { label: "Total Failed", value: totalFailed, color: "rose", icon: XCircle },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-3 flex items-center gap-3`}>
                  <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
                    <Icon size={15} className={`text-${color}-600`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-slate-800 leading-none">{value}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Upload History</h3>
                <span className="text-xs text-slate-400">{uploadRecords.length} batches</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-700 to-slate-800">
                      {["S.No.", "Upload Count", "Failed Count", "Posted Date", "Action"].map((h) => (
                        <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {uploadRecords.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-12">
                          <div className="flex flex-col items-center gap-2">
                            <FileSpreadsheet size={28} className="text-slate-300" />
                            <p className="text-sm text-slate-400">No uploads yet</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      uploadRecords.map((r) => (
                        <UploadRow key={r.id} record={r}
                          onDelete={handleDeleteRequest} onShow={handleShow} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {uploadRecords.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-12 flex flex-col items-center gap-2">
                  <FileSpreadsheet size={28} className="text-slate-300" />
                  <p className="text-sm text-slate-400">No uploads yet</p>
                </div>
              ) : (
                uploadRecords.map((r) => (
                  <UploadCard key={r.id} record={r}
                    onDelete={handleDeleteRequest} onShow={handleShow} />
                ))
              )}
            </div>
          </div>
        )}

        {/* ── Report Mode: Results ── */}
        {admissionType === "Report" && reportSearched && (
          <div>
            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">Online Registration Records</h3>
                <span className="text-xs text-slate-400">{reportRecords.length} records</span>
              </div>
              {reportRecords.length === 0 ? (
                <div className="py-14 flex flex-col items-center gap-2">
                  <AlertCircle size={28} className="text-slate-300" />
                  <p className="text-sm text-slate-400">No records found for selected filters</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gradient-to-r from-slate-700 to-slate-800">
                        {["S.No.", "Reg No.", "Student Name", "Class", "Section", "Status"].map((h) => (
                          <th key={h} className="px-4 py-3 text-left text-[11px] font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {reportRecords.map((r, i) => {
                        const statusColor = r.status === "Approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : r.status === "Rejected"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-amber-100 text-amber-700";
                        return (
                          <tr key={r.id} className="hover:bg-blue-50/30 transition border-b border-slate-100">
                            <td className="px-4 py-3 text-xs text-slate-500">{i + 1}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-blue-600">{r.regNo}</td>
                            <td className="px-4 py-3 text-xs font-medium text-slate-700">{r.name}</td>
                            <td className="px-4 py-3 text-xs text-slate-600">{r.class}</td>
                            <td className="px-4 py-3 text-xs text-slate-600">{r.section}</td>
                            <td className="px-4 py-3">
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusColor}`}>
                                {r.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {reportRecords.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-12 flex flex-col items-center gap-2">
                  <AlertCircle size={28} className="text-slate-300" />
                  <p className="text-sm text-slate-400">No records found</p>
                </div>
              ) : (
                reportRecords.map((r) => <ReportCard key={r.id} rec={r} />)
              )}
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 flex flex-col items-center gap-3">
            <RefreshCw size={26} className="text-blue-500 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Processing...</p>
          </div>
        )}
      </div>

      {/* ── Delete Confirmation Modal ── */}
      <DeleteModal
        open={deleteId !== null}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
