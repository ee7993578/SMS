import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Calendar,
  ChevronDown,
  Filter,
  RefreshCw,
  Eye,
  LogIn,
  LogOut,
  Edit2,
  Plus,
  Trash2,
  User,
  FileText,
  Activity,
  X,
  ChevronRight,
  Clock,
  AlertCircle,
} from "lucide-react";

// ─── Static / Dummy Data ───────────────────────────────────────────────────────

const USERS = [
  { value: "0", label: "All Users" },
  { value: "USR001", label: "Rajesh Kumar (USR001)" },
  { value: "USR002", label: "Priya Sharma (USR002)" },
  { value: "USR003", label: "Amit Singh (USR003)" },
  { value: "USR004", label: "Sunita Verma (USR004)" },
  { value: "USR005", label: "Mohit Agarwal (USR005)" },
];

const PAGES = [
  { value: "0", label: "All Pages" },
  { value: "Dashboard", label: "Dashboard" },
  { value: "StudentReg", label: "Student Registration" },
  { value: "FeeCollection", label: "Fee Collection" },
  { value: "Attendance", label: "Attendance" },
  { value: "ExamResult", label: "Exam Result" },
  { value: "Reports", label: "Reports" },
  { value: "Settings", label: "Settings" },
];

const ACTIVITY_TYPES = [
  { value: "0", label: "All Activities" },
  { value: "Login", label: "Login" },
  { value: "Logout", label: "Logout" },
  { value: "Insert", label: "Insert" },
  { value: "Update", label: "Update" },
  { value: "View", label: "View" },
  { value: "Delete", label: "Delete" },
];

const DUMMY_LOGS = [
  { id: 1, userId: "USR001", userName: "Rajesh Kumar", page: "Dashboard", activity: "Login", ipAddress: "192.168.1.10", dateTime: "05 Jun 2025 09:01 AM", remarks: "Successful login" },
  { id: 2, userId: "USR002", userName: "Priya Sharma", page: "StudentReg", activity: "Insert", ipAddress: "192.168.1.12", dateTime: "05 Jun 2025 09:15 AM", remarks: "New student added: Rahul Gupta" },
  { id: 3, userId: "USR001", userName: "Rajesh Kumar", page: "FeeCollection", activity: "Update", ipAddress: "192.168.1.10", dateTime: "05 Jun 2025 10:30 AM", remarks: "Fee record updated" },
  { id: 4, userId: "USR003", userName: "Amit Singh", page: "Attendance", activity: "View", ipAddress: "192.168.1.15", dateTime: "05 Jun 2025 11:00 AM", remarks: "Viewed attendance report" },
  { id: 5, userId: "USR004", userName: "Sunita Verma", page: "ExamResult", activity: "Insert", ipAddress: "192.168.1.20", dateTime: "05 Jun 2025 11:45 AM", remarks: "Marks entered for Class 10" },
  { id: 6, userId: "USR002", userName: "Priya Sharma", page: "StudentReg", activity: "Delete", ipAddress: "192.168.1.12", dateTime: "05 Jun 2025 12:10 PM", remarks: "Student record deleted: TC issued" },
  { id: 7, userId: "USR005", userName: "Mohit Agarwal", page: "Reports", activity: "View", ipAddress: "192.168.1.25", dateTime: "05 Jun 2025 01:00 PM", remarks: "Viewed fee report" },
  { id: 8, userId: "USR001", userName: "Rajesh Kumar", page: "Settings", activity: "Update", ipAddress: "192.168.1.10", dateTime: "05 Jun 2025 02:15 PM", remarks: "Password changed" },
  { id: 9, userId: "USR003", userName: "Amit Singh", page: "Dashboard", activity: "Logout", ipAddress: "192.168.1.15", dateTime: "05 Jun 2025 03:00 PM", remarks: "Session ended" },
  { id: 10, userId: "USR004", userName: "Sunita Verma", page: "FeeCollection", activity: "View", ipAddress: "192.168.1.20", dateTime: "06 Jun 2025 09:10 AM", remarks: "Viewed pending fees" },
  { id: 11, userId: "USR002", userName: "Priya Sharma", page: "Dashboard", activity: "Login", ipAddress: "192.168.1.12", dateTime: "06 Jun 2025 09:30 AM", remarks: "Successful login" },
  { id: 12, userId: "USR005", userName: "Mohit Agarwal", page: "Attendance", activity: "Insert", ipAddress: "192.168.1.25", dateTime: "06 Jun 2025 10:00 AM", remarks: "Attendance marked for Class 9" },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────

const ACTIVITY_CONFIG = {
  Login:   { icon: LogIn,   color: "text-emerald-600", bg: "bg-emerald-50",  badge: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  Logout:  { icon: LogOut,  color: "text-slate-500",   bg: "bg-slate-50",    badge: "bg-slate-100 text-slate-600 border-slate-200" },
  Insert:  { icon: Plus,    color: "text-blue-600",    bg: "bg-blue-50",     badge: "bg-blue-100 text-blue-700 border-blue-200" },
  Update:  { icon: Edit2,   color: "text-amber-600",   bg: "bg-amber-50",    badge: "bg-amber-100 text-amber-700 border-amber-200" },
  View:    { icon: Eye,     color: "text-purple-600",  bg: "bg-purple-50",   badge: "bg-purple-100 text-purple-700 border-purple-200" },
  Delete:  { icon: Trash2,  color: "text-red-500",     bg: "bg-red-50",      badge: "bg-red-100 text-red-700 border-red-200" },
};

function ActivityBadge({ type }) {
  const cfg = ACTIVITY_CONFIG[type] || ACTIVITY_CONFIG.View;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${cfg.badge}`}>
      <Icon size={10} /> {type}
    </span>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── Filter Panel ──────────────────────────────────────────────────────────────

function FilterPanel({ filters, onChange, onSearch, onReset, loading }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* From Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">From Date</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={filters.fromDate}
              onChange={(e) => onChange("fromDate", e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-slate-50 text-slate-700"
            />
          </div>
        </div>

        {/* To Date */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">To Date</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="date"
              value={filters.toDate}
              min={filters.fromDate}
              disabled={!filters.fromDate}
              onChange={(e) => onChange("toDate", e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-slate-50 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        </div>

        {/* User */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">User ID</label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filters.userId}
              onChange={(e) => onChange("userId", e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-slate-50 text-slate-700 appearance-none"
            >
              {USERS.map((u) => <option key={u.value} value={u.value}>{u.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Page */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Page</label>
          <div className="relative">
            <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filters.page}
              onChange={(e) => onChange("page", e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-slate-50 text-slate-700 appearance-none"
            >
              {PAGES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Activity */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Activity Type</label>
          <div className="relative">
            <Activity size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <select
              value={filters.activity}
              onChange={(e) => onChange("activity", e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-slate-50 text-slate-700 appearance-none"
            >
              {ACTIVITY_TYPES.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
            </select>
            <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-2 mt-4 pt-4 border-t border-slate-100">
        <button
          onClick={onSearch}
          disabled={!filters.fromDate || !filters.toDate || loading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
        >
          {loading ? <RefreshCw size={14} className="animate-spin" /> : <Search size={14} />}
          {loading ? "Loading..." : "Show Report"}
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 text-sm font-semibold rounded-lg transition-colors"
        >
          <RefreshCw size={14} />
          Reset
        </button>
      </div>
    </div>
  );
}

// ─── Desktop Table ─────────────────────────────────────────────────────────────

function DesktopTable({ logs }) {
  return (
    <div className="hidden md:block overflow-x-auto rounded-xl border border-slate-200 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800 text-white">
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider w-10">#</th>
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Date & Time</th>
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">User</th>
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Page</th>
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Activity</th>
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">IP Address</th>
            <th className="text-left px-4 py-3 font-semibold text-xs uppercase tracking-wider">Remarks</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {logs.map((log, idx) => {
            const cfg = ACTIVITY_CONFIG[log.activity] || ACTIVITY_CONFIG.View;
            return (
              <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-3 text-slate-400 text-xs font-mono">{idx + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5 text-slate-700">
                    <Clock size={12} className="text-slate-400 shrink-0" />
                    <span className="font-medium text-xs">{log.dateTime}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <span className="text-green-700 font-bold text-xs">{log.userName[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800 text-xs leading-tight">{log.userName}</p>
                      <p className="text-slate-400 text-xs font-mono">{log.userId}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="text-slate-700 text-xs font-medium bg-slate-100 px-2 py-1 rounded-md">{log.page}</span>
                </td>
                <td className="px-4 py-3">
                  <ActivityBadge type={log.activity} />
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{log.ipAddress}</td>
                <td className="px-4 py-3 text-slate-600 text-xs max-w-xs truncate">{log.remarks}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Mobile Card ───────────────────────────────────────────────────────────────

function MobileLogCard({ log, idx }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = ACTIVITY_CONFIG[log.activity] || ACTIVITY_CONFIG.View;
  const Icon = cfg.icon;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setExpanded((v) => !v)}
      >
        {/* Activity icon */}
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
          <Icon size={16} className={cfg.color} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-slate-800 text-sm truncate">{log.userName}</p>
            <ActivityBadge type={log.activity} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
            <Clock size={10} className="shrink-0" /> {log.dateTime}
          </p>
          <p className="text-xs text-slate-400 mt-0.5 truncate">{log.remarks}</p>
        </div>

        <ChevronRight
          size={16}
          className={`text-slate-400 shrink-0 mt-1 transition-transform ${expanded ? "rotate-90" : ""}`}
        />
      </button>

      {expanded && (
        <div className="border-t border-slate-100 bg-slate-50 px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">User ID</p>
            <p className="text-xs text-slate-700 font-mono mt-0.5">{log.userId}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Page</p>
            <p className="text-xs text-slate-700 mt-0.5">{log.page}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">IP Address</p>
            <p className="text-xs text-slate-700 font-mono mt-0.5">{log.ipAddress}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Sr. No</p>
            <p className="text-xs text-slate-700 mt-0.5">#{idx + 1}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Remarks</p>
            <p className="text-xs text-slate-700 mt-0.5">{log.remarks}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty / No-Search State ───────────────────────────────────────────────────

function EmptyState({ searched }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {searched ? (
        <>
          <AlertCircle size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-semibold text-sm">No logs found</p>
          <p className="text-slate-400 text-xs mt-1">Try changing your filter criteria</p>
        </>
      ) : (
        <>
          <Filter size={40} className="text-slate-300 mb-3" />
          <p className="text-slate-500 font-semibold text-sm">Select filters and click Show Report</p>
          <p className="text-slate-400 text-xs mt-1">Choose a date range to get started</p>
        </>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function LogReportDateWise() {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    userId: "0",
    page: "0",
    activity: "0",
  });
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);

  const handleFilterChange = useCallback((key, val) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: val };
      // If fromDate changes, reset toDate
      if (key === "fromDate") next.toDate = "";
      return next;
    });
  }, []);

  // Simulate API call with filtering on dummy data
  const handleSearch = useCallback(() => {
    if (!filters.fromDate || !filters.toDate) return;
    setLoading(true);
    setTimeout(() => {
      const result = DUMMY_LOGS.filter((log) => {
        if (filters.userId !== "0" && log.userId !== filters.userId) return false;
        if (filters.page !== "0" && log.page !== filters.page) return false;
        if (filters.activity !== "0" && log.activity !== filters.activity) return false;
        return true;
      });
      setLogs(result);
      setSearched(true);
      setLoading(false);
    }, 700);
  }, [filters]);

  const handleReset = useCallback(() => {
    setFilters({ fromDate: "", toDate: "", userId: "0", page: "0", activity: "0" });
    setLogs([]);
    setSearched(false);
  }, []);

  // Summary stats
  const stats = useMemo(() => {
    const counts = {};
    logs.forEach((l) => { counts[l.activity] = (counts[l.activity] || 0) + 1; });
    return [
      { label: "Total Events", value: logs.length, icon: Activity, color: "bg-slate-700" },
      { label: "Logins", value: counts.Login || 0, icon: LogIn, color: "bg-emerald-500" },
      { label: "Inserts", value: counts.Insert || 0, icon: Plus, color: "bg-blue-500" },
      { label: "Updates", value: counts.Update || 0, icon: Edit2, color: "bg-amber-500" },
      { label: "Deletes", value: counts.Delete || 0, icon: Trash2, color: "bg-red-500" },
    ];
  }, [logs]);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Page Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-3 flex items-center gap-2 text-sm text-slate-500">
          <span className="text-slate-400">Reports</span>
          <ChevronRight size={14} className="text-slate-300" />
          <span className="font-semibold text-slate-700">Log Report Date Wise</span>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-5 space-y-4">

        {/* Title */}
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Log Report</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track all user activity across the system by date range</p>
        </div>

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />

        {/* Stats (only when results exist) */}
        {searched && !loading && logs.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 flex flex-col items-center gap-3">
            <RefreshCw size={28} className="text-green-500 animate-spin" />
            <p className="text-sm text-slate-500 font-medium">Fetching log records…</p>
          </div>
        ) : (searched || logs.length > 0) ? (
          logs.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
              <EmptyState searched={searched} />
            </div>
          ) : (
            <>
              {/* Result count bar */}
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-500 font-medium">
                  Showing <span className="font-bold text-slate-700">{logs.length}</span> record{logs.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Desktop Table */}
              <DesktopTable logs={logs} />

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {logs.map((log, idx) => (
                  <MobileLogCard key={log.id} log={log} idx={idx} />
                ))}
              </div>
            </>
          )
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <EmptyState searched={false} />
          </div>
        )}
      </div>
    </div>
  );
}
