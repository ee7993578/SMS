import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  User,
  FileText,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";

// ─── Static / Dummy Data ────────────────────────────────────────────────────

const SESSIONS = [
  { value: "", label: "Select Session" },
  { value: "2024-25", label: "2024-25" },
  { value: "2023-24", label: "2023-24" },
  { value: "2022-23", label: "2022-23" },
];

const FACULTIES = [
  { value: "", label: "Select Faculty" },
  { value: "1", label: "Dr. Anjali Sharma" },
  { value: "2", label: "Prof. Rakesh Verma" },
  { value: "3", label: "Dr. Priya Mehta" },
  { value: "4", label: "Mr. Suresh Gupta" },
  { value: "5", label: "Ms. Neha Singh" },
];

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "approved", label: "Approved" },
  { value: "not_approved", label: "Not Approved" },
  { value: "pending", label: "Pending" },
];

const DUMMY_LEAVES = [
  {
    id: "APP001",
    staffId: "STF101",
    name: "Dr. Anjali Sharma",
    reason: "Medical emergency - hospitalization",
    fromDate: "2024-12-01",
    toDate: "2024-12-05",
    appliedOn: "2024-11-28",
    wingInchargeStatus: "Approved",
    principalStatus: "Approved",
    session: "2024-25",
    facultyId: "1",
  },
  {
    id: "APP002",
    staffId: "STF102",
    name: "Prof. Rakesh Verma",
    reason: "Personal work - family function",
    fromDate: "2024-12-10",
    toDate: "2024-12-12",
    appliedOn: "2024-12-03",
    wingInchargeStatus: "Approved",
    principalStatus: "Not Approved",
    session: "2024-25",
    facultyId: "2",
  },
  {
    id: "APP003",
    staffId: "STF103",
    name: "Dr. Priya Mehta",
    reason: "Conference attendance - IIT Delhi",
    fromDate: "2024-12-15",
    toDate: "2024-12-17",
    appliedOn: "2024-12-05",
    wingInchargeStatus: "Not Approved",
    principalStatus: "Not Approved",
    session: "2024-25",
    facultyId: "3",
  },
  {
    id: "APP004",
    staffId: "STF104",
    name: "Mr. Suresh Gupta",
    reason: "Casual leave - personal reasons",
    fromDate: "2024-12-20",
    toDate: "2024-12-20",
    appliedOn: "2024-12-18",
    wingInchargeStatus: "Approved",
    principalStatus: "Approved",
    session: "2024-25",
    facultyId: "4",
  },
  {
    id: "APP005",
    staffId: "STF105",
    name: "Ms. Neha Singh",
    reason: "Sick leave - fever and cold",
    fromDate: "2024-12-22",
    toDate: "2024-12-23",
    appliedOn: "2024-12-21",
    wingInchargeStatus: "Pending",
    principalStatus: "Pending",
    session: "2024-25",
    facultyId: "5",
  },
  {
    id: "APP006",
    staffId: "STF101",
    name: "Dr. Anjali Sharma",
    reason: "Research work - paper submission",
    fromDate: "2024-11-10",
    toDate: "2024-11-11",
    appliedOn: "2024-11-08",
    wingInchargeStatus: "Approved",
    principalStatus: "Approved",
    session: "2023-24",
    facultyId: "1",
  },
];

// ─── Helper Components ───────────────────────────────────────────────────────

const StatusBadge = ({ status }) => {
  const config = {
    Approved: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      icon: <CheckCircle size={12} />,
    },
    "Not Approved": {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      icon: <XCircle size={12} />,
    },
    Pending: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      icon: <Clock size={12} />,
    },
  };
  const c = config[status] || config["Pending"];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}
    >
      {c.icon}
      {status}
    </span>
  );
};

const SelectField = ({ label, value, onChange, options, icon: Icon }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <Icon
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
        />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full h-9 ${Icon ? "pl-8" : "pl-3"} pr-8 text-sm bg-white border border-slate-200 rounded-lg text-slate-700 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition`}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
    </div>
  </div>
);

// ─── Delete Confirmation Modal ───────────────────────────────────────────────

const DeleteModal = ({ record, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onCancel}
    />
    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 z-10">
      <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-full mx-auto mb-4">
        <AlertTriangle size={28} className="text-red-500" />
      </div>
      <h2 className="text-lg font-semibold text-slate-800 text-center mb-1">
        Delete Leave Record
      </h2>
      <p className="text-sm text-slate-500 text-center mb-5">
        Are you sure you want to delete{" "}
        <span className="font-medium text-slate-700">{record?.name}</span>'s
        leave application? This action cannot be undone.
      </p>
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="flex-1 h-10 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 h-10 rounded-lg bg-red-500 text-sm font-medium text-white hover:bg-red-600 transition"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
);

// ─── Detail Drawer (Mobile + Desktop) ───────────────────────────────────────

const DetailDrawer = ({ record, onClose }) => {
  if (!record) return null;
  const fields = [
    { label: "Application ID", value: record.id, icon: FileText },
    { label: "Staff ID", value: record.staffId, icon: User },
    { label: "Reason", value: record.reason, icon: FileText },
    { label: "From Date", value: record.fromDate, icon: Calendar },
    { label: "To Date", value: record.toDate, icon: Calendar },
    { label: "Applied On", value: record.appliedOn, icon: Calendar },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl z-10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-sm">
              {record.name
                .split(" ")
                .slice(0, 2)
                .map((n) => n[0])
                .join("")}
            </div>
            <div>
              <p className="font-semibold text-slate-800 text-sm">
                {record.name}
              </p>
              <p className="text-xs text-slate-400">{record.session}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition"
          >
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        {/* Body */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {fields.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-start gap-3">
              <Icon size={15} className="text-slate-400 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-400 mb-0.5">{label}</p>
                <p className="text-sm text-slate-700 break-words">{value}</p>
              </div>
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1.5">Wing Incharge</p>
              <StatusBadge status={record.wingInchargeStatus} />
            </div>
            <div className="bg-slate-50 rounded-xl p-3">
              <p className="text-xs text-slate-400 mb-1.5">Principal</p>
              <StatusBadge status={record.principalStatus} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Mobile Leave Card ───────────────────────────────────────────────────────

const MobileLeaveCard = ({ record, index, onView, onDelete }) => {
  const [expanded, setExpanded] = useState(false);
  const overallApproved =
    record.wingInchargeStatus === "Approved" &&
    record.principalStatus === "Approved";
  const overallPending =
    record.wingInchargeStatus === "Pending" ||
    record.principalStatus === "Pending";

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer"
        onClick={() => setExpanded((p) => !p)}
      >
        <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
          {index}
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">
            {record.name}
          </p>
          <p className="text-xs text-slate-400 truncate mt-0.5">
            {record.reason}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <StatusBadge
            status={
              overallApproved
                ? "Approved"
                : overallPending
                ? "Pending"
                : "Not Approved"
            }
          />
          {expanded ? (
            <ChevronUp size={14} className="text-slate-400" />
          ) : (
            <ChevronDown size={14} className="text-slate-400" />
          )}
        </div>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 mt-3">
            {[
              { label: "From", value: record.fromDate },
              { label: "To", value: record.toDate },
              { label: "Applied On", value: record.appliedOn },
              { label: "Session", value: record.session },
            ].map(({ label, value }) => (
              <div key={label} className="bg-slate-50 rounded-xl p-2.5">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-xs font-medium text-slate-700 mt-0.5">
                  {value}
                </p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-xs text-slate-400 mb-1">Wing Incharge</p>
              <StatusBadge status={record.wingInchargeStatus} />
            </div>
            <div className="bg-slate-50 rounded-xl p-2.5">
              <p className="text-xs text-slate-400 mb-1">Principal</p>
              <StatusBadge status={record.principalStatus} />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => onView(record)}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition"
            >
              <Eye size={14} />
              View Detail
            </button>
            <button
              onClick={() => onDelete(record)}
              className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Summary Stats Bar ───────────────────────────────────────────────────────

const StatsBar = ({ data }) => {
  const total = data.length;
  const approved = data.filter(
    (d) =>
      d.wingInchargeStatus === "Approved" && d.principalStatus === "Approved"
  ).length;
  const notApproved = data.filter(
    (d) =>
      d.wingInchargeStatus === "Not Approved" ||
      d.principalStatus === "Not Approved"
  ).length;
  const pending = data.filter(
    (d) =>
      d.wingInchargeStatus === "Pending" || d.principalStatus === "Pending"
  ).length;

  const stats = [
    { label: "Total", value: total, color: "text-slate-700", bg: "bg-slate-50" },
    { label: "Approved", value: approved, color: "text-emerald-700", bg: "bg-emerald-50" },
    { label: "Not Approved", value: notApproved, color: "text-red-600", bg: "bg-red-50" },
    { label: "Pending", value: pending, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
      {stats.map(({ label, value, color, bg }) => (
        <div key={label} className={`${bg} rounded-xl p-3`}>
          <p className="text-xs text-slate-500 font-medium">{label}</p>
          <p className={`text-2xl font-bold mt-0.5 ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function FacultyLeaveList() {
  // Filter state
  const [session, setSession] = useState("");
  const [faculty, setFaculty] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Applied filters (only updated on "Show" click on desktop; live on mobile)
  const [appliedFilters, setAppliedFilters] = useState({
    session: "",
    faculty: "",
    status: "",
    search: "",
  });

  // Modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);
  const [records, setRecords] = useState(DUMMY_LEAVES);

  // Sort state
  const [sortKey, setSortKey] = useState("appliedOn");
  const [sortDir, setSortDir] = useState("desc");

  const handleShow = useCallback(() => {
    setAppliedFilters({ session, faculty, status, search });
    setFiltersOpen(false);
  }, [session, faculty, status, search]);

  const handleReset = useCallback(() => {
    setSession("");
    setFaculty("");
    setStatus("");
    setSearch("");
    setAppliedFilters({ session: "", faculty: "", status: "", search: "" });
  }, []);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    // Use appliedFilters for desktop; live search always applied
    let data = records;
    const f = appliedFilters;

    if (f.session) data = data.filter((d) => d.session === f.session);
    if (f.faculty) data = data.filter((d) => d.facultyId === f.faculty);
    if (f.status === "approved")
      data = data.filter(
        (d) => d.wingInchargeStatus === "Approved" && d.principalStatus === "Approved"
      );
    if (f.status === "not_approved")
      data = data.filter(
        (d) => d.wingInchargeStatus === "Not Approved" || d.principalStatus === "Not Approved"
      );
    if (f.status === "pending")
      data = data.filter(
        (d) => d.wingInchargeStatus === "Pending" || d.principalStatus === "Pending"
      );
    if (f.search)
      data = data.filter(
        (d) =>
          d.name.toLowerCase().includes(f.search.toLowerCase()) ||
          d.reason.toLowerCase().includes(f.search.toLowerCase()) ||
          d.id.toLowerCase().includes(f.search.toLowerCase())
      );

    // Sort
    data = [...data].sort((a, b) => {
      const va = a[sortKey] || "";
      const vb = b[sortKey] || "";
      return sortDir === "asc" ? va.localeCompare(vb) : vb.localeCompare(va);
    });

    return data;
  }, [records, appliedFilters, sortKey, sortDir]);

  const handleDelete = useCallback(() => {
    setRecords((prev) => prev.filter((r) => r.id !== deleteTarget.id));
    setDeleteTarget(null);
  }, [deleteTarget]);

  const SortIcon = ({ col }) =>
    sortKey === col ? (
      sortDir === "asc" ? (
        <ChevronUp size={13} className="text-emerald-600" />
      ) : (
        <ChevronDown size={13} className="text-emerald-600" />
      )
    ) : (
      <ChevronDown size={13} className="text-slate-300" />
    );

  const tableHeaders = [
    { key: "sno", label: "S.No." },
    { key: "name", label: "Faculty Name", sortable: true },
    { key: "reason", label: "Reason" },
    { key: "fromDate", label: "From Date", sortable: true },
    { key: "toDate", label: "To Date", sortable: true },
    { key: "appliedOn", label: "Applied On", sortable: true },
    { key: "wingInchargeStatus", label: "Wing Incharge", sortable: true },
    { key: "principalStatus", label: "Principal", sortable: true },
    { key: "actions", label: "Actions" },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Modals */}
      {deleteTarget && (
        <DeleteModal
          record={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      {viewTarget && (
        <DetailDrawer record={viewTarget} onClose={() => setViewTarget(null)} />
      )}

      {/* Page Header */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Home</span>
            <ChevronRight size={12} />
            <span>Leave</span>
            <ChevronRight size={12} />
            <span className="text-slate-700 font-medium">Faculty Leave List</span>
          </div>
          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search name, reason, ID…"
              value={appliedFilters.search}
              onChange={(e) =>
                setAppliedFilters((p) => ({ ...p, search: e.target.value }))
              }
              className="w-full h-9 pl-9 pr-3 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 space-y-4">
        {/* Page Title */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Faculty Leave List</h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage and review faculty leave applications
            </p>
          </div>
          {/* Mobile filter toggle */}
          <button
            onClick={() => setFiltersOpen((p) => !p)}
            className="sm:hidden flex items-center gap-1.5 h-9 px-3 rounded-xl border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <SlidersHorizontal size={15} />
            Filters
            {(session || faculty || status) && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 ml-0.5" />
            )}
          </button>
        </div>

        {/* ─── Desktop Filters ────────────────────────────────────────────── */}
        <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            <SelectField
              label="Session"
              value={session}
              onChange={setSession}
              options={SESSIONS}
              icon={Calendar}
            />
            <SelectField
              label="Faculty"
              value={faculty}
              onChange={setFaculty}
              options={FACULTIES}
              icon={User}
            />
            <SelectField
              label="Status"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
              icon={Filter}
            />
            <button
              onClick={handleShow}
              className="h-9 px-5 rounded-lg bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition flex items-center justify-center gap-2"
            >
              <Search size={15} />
              Show Results
            </button>
            <button
              onClick={handleReset}
              className="h-9 px-4 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} />
              Reset
            </button>
          </div>
        </div>

        {/* ─── Mobile Filter Drawer ────────────────────────────────────────── */}
        {filtersOpen && (
          <div className="sm:hidden bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="font-semibold text-slate-700 text-sm">Filters</p>
              <button onClick={() => setFiltersOpen(false)}>
                <X size={18} className="text-slate-400" />
              </button>
            </div>
            <SelectField
              label="Session"
              value={session}
              onChange={setSession}
              options={SESSIONS}
              icon={Calendar}
            />
            <SelectField
              label="Faculty"
              value={faculty}
              onChange={setFaculty}
              options={FACULTIES}
              icon={User}
            />
            <SelectField
              label="Status"
              value={status}
              onChange={setStatus}
              options={STATUS_OPTIONS}
              icon={Filter}
            />
            <div className="flex gap-2 pt-1">
              <button
                onClick={handleShow}
                className="flex-1 h-10 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition"
              >
                Apply Filters
              </button>
              <button
                onClick={handleReset}
                className="flex-1 h-10 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition"
              >
                Reset
              </button>
            </div>
          </div>
        )}

        {/* ─── Stats ──────────────────────────────────────────────────────── */}
        <StatsBar data={filtered} />

        {/* ─── Desktop Table ───────────────────────────────────────────────── */}
        <div className="hidden sm:block bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <FileText size={40} className="text-slate-200 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  No leave records found for the selected filters.
                </p>
                <button
                  onClick={handleReset}
                  className="mt-3 text-emerald-600 text-sm hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {tableHeaders.map(({ key, label, sortable }) => (
                      <th
                        key={key}
                        onClick={() => sortable && handleSort(key)}
                        className={`px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap ${
                          sortable
                            ? "cursor-pointer hover:text-slate-700 select-none"
                            : ""
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          {label}
                          {sortable && <SortIcon col={key} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((row, i) => (
                    <tr
                      key={row.id}
                      className="hover:bg-slate-50/60 transition-colors group"
                    >
                      <td className="px-4 py-3 text-slate-400 font-medium">
                        {i + 1}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-semibold text-xs shrink-0">
                            {row.name
                              .split(" ")
                              .slice(0, 2)
                              .map((n) => n[0])
                              .join("")}
                          </div>
                          <div>
                            <p className="font-medium text-slate-800">
                              {row.name}
                            </p>
                            <p className="text-xs text-slate-400">{row.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 max-w-[180px]">
                        <p className="truncate">{row.reason}</p>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {row.fromDate}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {row.toDate}
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">
                        {row.appliedOn}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.wingInchargeStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={row.principalStatus} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewTarget(row)}
                            className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition"
                          >
                            <Eye size={12} />
                            View
                          </button>
                          <button
                            onClick={() => setDeleteTarget(row)}
                            className="flex items-center gap-1 h-7 px-2.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition"
                          >
                            <Trash2 size={12} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          {/* Table footer */}
          {filtered.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Showing{" "}
                <span className="font-medium text-slate-600">
                  {filtered.length}
                </span>{" "}
                records
              </p>
            </div>
          )}
        </div>

        {/* ─── Mobile Cards ────────────────────────────────────────────────── */}
        <div className="sm:hidden space-y-3">
          {filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-100 py-14 text-center">
              <FileText size={36} className="text-slate-200 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">
                No records match your filters.
              </p>
              <button
                onClick={handleReset}
                className="mt-2 text-emerald-600 text-sm hover:underline"
              >
                Clear filters
              </button>
            </div>
          ) : (
            filtered.map((row, i) => (
              <MobileLeaveCard
                key={row.id}
                record={row}
                index={i + 1}
                onView={setViewTarget}
                onDelete={setDeleteTarget}
              />
            ))
          )}
          {filtered.length > 0 && (
            <p className="text-xs text-center text-slate-400 pb-2">
              {filtered.length} records
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
