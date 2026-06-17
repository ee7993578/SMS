import { useState, useMemo, useCallback } from "react";
import {
  ChevronRight,
  Home,
  Users,
  CheckCircle,
  AlertCircle,
  Save,
  RefreshCw,
  ClipboardList,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

// ─── Static / Dummy Data ────────────────────────────────────────────────────

const FACULTY_LIST = [
  { id: "", name: "-- Select Faculty --" },
  { id: "F001", name: "Dr. Anjali Sharma" },
  { id: "F002", name: "Prof. Rajan Mehta" },
  { id: "F003", name: "Dr. Priya Nair" },
  { id: "F004", name: "Mr. Suresh Verma" },
  { id: "F005", name: "Ms. Kavita Singh" },
  { id: "F006", name: "Dr. Arun Patel" },
];

// Simulated API data per faculty (future: replace with real fetch)
const LEAVE_DATA = {
  F001: [
    { leavetypeid: "LT01", leaveType: "Casual Leave",       leaveDue: 12 },
    { leavetypeid: "LT02", leaveType: "Earned Leave",        leaveDue: 20 },
    { leavetypeid: "LT03", leaveType: "Medical Leave",       leaveDue: 8  },
    { leavetypeid: "LT04", leaveType: "Half Pay Leave",      leaveDue: 5  },
    { leavetypeid: "LT05", leaveType: "Compensatory Leave",  leaveDue: 3  },
  ],
  F002: [
    { leavetypeid: "LT01", leaveType: "Casual Leave",       leaveDue: 10 },
    { leavetypeid: "LT02", leaveType: "Earned Leave",        leaveDue: 15 },
    { leavetypeid: "LT03", leaveType: "Medical Leave",       leaveDue: 6  },
    { leavetypeid: "LT04", leaveType: "Half Pay Leave",      leaveDue: 4  },
    { leavetypeid: "LT05", leaveType: "Compensatory Leave",  leaveDue: 2  },
  ],
  F003: [
    { leavetypeid: "LT01", leaveType: "Casual Leave",       leaveDue: 14 },
    { leavetypeid: "LT02", leaveType: "Earned Leave",        leaveDue: 18 },
    { leavetypeid: "LT03", leaveType: "Medical Leave",       leaveDue: 10 },
    { leavetypeid: "LT04", leaveType: "Half Pay Leave",      leaveDue: 7  },
    { leavetypeid: "LT05", leaveType: "Compensatory Leave",  leaveDue: 5  },
  ],
  F004: [
    { leavetypeid: "LT01", leaveType: "Casual Leave",       leaveDue: 8  },
    { leavetypeid: "LT02", leaveType: "Earned Leave",        leaveDue: 12 },
    { leavetypeid: "LT03", leaveType: "Medical Leave",       leaveDue: 5  },
    { leavetypeid: "LT04", leaveType: "Half Pay Leave",      leaveDue: 3  },
    { leavetypeid: "LT05", leaveType: "Compensatory Leave",  leaveDue: 1  },
  ],
  F005: [
    { leavetypeid: "LT01", leaveType: "Casual Leave",       leaveDue: 11 },
    { leavetypeid: "LT02", leaveType: "Earned Leave",        leaveDue: 22 },
    { leavetypeid: "LT03", leaveType: "Medical Leave",       leaveDue: 9  },
    { leavetypeid: "LT04", leaveType: "Half Pay Leave",      leaveDue: 6  },
    { leavetypeid: "LT05", leaveType: "Compensatory Leave",  leaveDue: 4  },
  ],
  F006: [
    { leavetypeid: "LT01", leaveType: "Casual Leave",       leaveDue: 13 },
    { leavetypeid: "LT02", leaveType: "Earned Leave",        leaveDue: 17 },
    { leavetypeid: "LT03", leaveType: "Medical Leave",       leaveDue: 7  },
    { leavetypeid: "LT04", leaveType: "Half Pay Leave",      leaveDue: 5  },
    { leavetypeid: "LT05", leaveType: "Compensatory Leave",  leaveDue: 3  },
  ],
};

// ─── Sub-Components ──────────────────────────────────────────────────────────

/** Breadcrumb bar */
function Breadcrumb() {
  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6 flex-wrap">
      <a href="#" className="flex items-center gap-1 hover:text-green-700 transition-colors">
        <Home size={14} />
        <span>Home</span>
      </a>
      <ChevronRight size={13} className="text-gray-400" />
      <span className="hover:text-green-700 cursor-pointer transition-colors">Leave</span>
      <ChevronRight size={13} className="text-gray-400" />
      <span className="text-gray-800 font-medium">Faculty Leave List</span>
    </nav>
  );
}

/** Summary stat card for mobile/desktop */
function StatCard({ label, value, color }) {
  const colorMap = {
    green:  "bg-green-50  border-green-200  text-green-700",
    blue:   "bg-blue-50   border-blue-200   text-blue-700",
    amber:  "bg-amber-50  border-amber-200  text-amber-700",
    purple: "bg-purple-50 border-purple-200 text-purple-700",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 flex flex-col gap-0.5 ${colorMap[color] || colorMap.green}`}>
      <span className="text-xs font-medium opacity-70 uppercase tracking-wide">{label}</span>
      <span className="text-2xl font-bold">{value}</span>
    </div>
  );
}

/** Toast / Alert message */
function Alert({ type, message, onClose }) {
  if (!message) return null;
  const styles = {
    success: "bg-green-50 border-green-300 text-green-800",
    error:   "bg-red-50   border-red-300   text-red-800",
    info:    "bg-blue-50  border-blue-300  text-blue-800",
  };
  const Icon = type === "success" ? CheckCircle : type === "error" ? AlertCircle : Info;
  return (
    <div className={`flex items-start gap-3 rounded-xl border px-4 py-3 mb-4 ${styles[type]}`}>
      <Icon size={18} className="mt-0.5 flex-shrink-0" />
      <p className="text-sm flex-1">{message}</p>
      {onClose && (
        <button onClick={onClose} className="text-current opacity-50 hover:opacity-100 text-lg leading-none">×</button>
      )}
    </div>
  );
}

/** Desktop table row for leave type */
function LeaveTableRow({ row, index, value, onChange, error }) {
  return (
    <tr className={`border-b border-gray-100 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50/60"} hover:bg-green-50/40`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-800">{row.leaveType}</span>
        </div>
      </td>
      <td className="px-4 py-3 w-44">
        <div className="relative">
          <input
            type="number"
            min="0"
            max="999"
            value={value}
            onChange={(e) => onChange(row.leavetypeid, e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm font-medium text-center
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all
              ${error ? "border-red-400 bg-red-50 text-red-700" : "border-gray-300 bg-white text-gray-800 hover:border-green-400"}`}
            placeholder="0"
          />
          {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
        </div>
      </td>
    </tr>
  );
}

/** Mobile card for a leave type row */
function LeaveCard({ row, index, value, onChange, error, expanded, onToggle }) {
  return (
    <div className={`rounded-xl border transition-all ${error ? "border-red-300 bg-red-50" : "border-gray-200 bg-white"} shadow-sm overflow-hidden`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-xs font-bold flex-shrink-0">
            {index + 1}
          </span>
          <div>
            <p className="text-sm font-semibold text-gray-800">{row.leaveType}</p>
            <p className="text-xs text-gray-500 mt-0.5">
              Current due: <span className="font-medium text-green-700">{value || 0} days</span>
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-100 pt-3">
          <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
            Leave Due (days)
          </label>
          <input
            type="number"
            min="0"
            max="999"
            value={value}
            onChange={(e) => onChange(row.leavetypeid, e.target.value)}
            className={`w-full rounded-lg border px-4 py-2.5 text-base font-medium text-center
              focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all
              ${error ? "border-red-400 bg-red-50 text-red-700" : "border-gray-300 bg-gray-50 text-gray-800"}`}
            placeholder="Enter days"
          />
          {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
        </div>
      )}
    </div>
  );
}

/** Empty state */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <ClipboardList size={28} className="text-gray-400" />
      </div>
      <p className="text-gray-600 font-medium text-base">No leave data to display</p>
      <p className="text-gray-400 text-sm mt-1">Select a faculty member and click Show</p>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FacultyTotalLeave() {
  const [selectedFaculty, setSelectedFaculty]   = useState("");
  const [leaveRows, setLeaveRows]               = useState([]);
  const [leaveDueMap, setLeaveDueMap]           = useState({});   // { leavetypeid: value }
  const [errors, setErrors]                     = useState({});   // { leavetypeid: msg }
  const [alert, setAlert]                       = useState(null); // { type, message }
  const [loading, setLoading]                   = useState(false);
  const [submitting, setSubmitting]             = useState(false);
  const [expandedCard, setExpandedCard]         = useState(null); // for mobile accordion

  /* ── Derived ── */
  const totalLeave = useMemo(
    () => Object.values(leaveDueMap).reduce((sum, v) => sum + (parseInt(v, 10) || 0), 0),
    [leaveDueMap]
  );

  const selectedFacultyName = useMemo(
    () => FACULTY_LIST.find((f) => f.id === selectedFaculty)?.name || "",
    [selectedFaculty]
  );

  /* ── Handlers ── */
  const handleFacultyChange = useCallback((e) => {
    setSelectedFaculty(e.target.value);
    setLeaveRows([]);
    setLeaveDueMap({});
    setErrors({});
    setAlert(null);
    setExpandedCard(null);
  }, []);

  const handleShow = useCallback(() => {
    if (!selectedFaculty) {
      setAlert({ type: "error", message: "Please select a faculty member first." });
      return;
    }
    setLoading(true);
    setAlert(null);
    setErrors({});

    // Simulate API call delay
    setTimeout(() => {
      const data = LEAVE_DATA[selectedFaculty] || [];
      setLeaveRows(data);
      const map = {};
      data.forEach((row) => { map[row.leavetypeid] = String(row.leaveDue); });
      setLeaveDueMap(map);
      setExpandedCard(data[0]?.leavetypeid || null); // open first card on mobile
      setLoading(false);
      if (!data.length) {
        setAlert({ type: "info", message: "No leave records found for this faculty." });
      }
    }, 600);
  }, [selectedFaculty]);

  const handleDueChange = useCallback((id, val) => {
    // Only allow whole numbers (matches FilteredTextBoxExtender ValidChars="0123456789")
    if (val !== "" && !/^\d+$/.test(val)) return;
    setLeaveDueMap((prev) => ({ ...prev, [id]: val }));
    setErrors((prev) => ({ ...prev, [id]: undefined }));
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};
    leaveRows.forEach((row) => {
      const v = leaveDueMap[row.leavetypeid];
      if (v === "" || v === undefined) {
        newErrors[row.leavetypeid] = "Required";
      } else if (parseInt(v, 10) < 0) {
        newErrors[row.leavetypeid] = "Must be ≥ 0";
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [leaveRows, leaveDueMap]);

  const handleSubmit = useCallback(() => {
    if (!leaveRows.length) {
      setAlert({ type: "error", message: "No leave data to submit. Please select faculty and click Show." });
      return;
    }
    if (!validate()) {
      setAlert({ type: "error", message: "Please fix validation errors before submitting." });
      return;
    }
    setSubmitting(true);
    setAlert(null);

    // Simulate API save
    const payload = leaveRows.map((row) => ({
      facultyId:    selectedFaculty,
      leavetypeid:  row.leavetypeid,
      leaveType:    row.leaveType,
      leaveDue:     parseInt(leaveDueMap[row.leavetypeid], 10),
    }));
    console.log("Submitting payload:", payload); // API integration point

    setTimeout(() => {
      setSubmitting(false);
      setAlert({ type: "success", message: `Leave data for ${selectedFacultyName} saved successfully!` });
    }, 800);
  }, [leaveRows, leaveDueMap, validate, selectedFaculty, selectedFacultyName]);

  const handleReset = useCallback(() => {
    setSelectedFaculty("");
    setLeaveRows([]);
    setLeaveDueMap({});
    setErrors({});
    setAlert(null);
    setExpandedCard(null);
  }, []);

  const toggleCard = useCallback((id) => {
    setExpandedCard((prev) => (prev === id ? null : id));
  }, []);

  /* ── Render ── */
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center flex-shrink-0">
              <Users size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Faculty Leave List</h1>
              <p className="text-sm text-gray-500 mt-0.5">Manage and update leave balances per faculty</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 transition-all self-start sm:self-auto"
          >
            <RefreshCw size={14} />
            Reset
          </button>
        </div>

        {/* Alert */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        {/* Filter / Selection Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm mb-5 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-green-50">
            <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide">Select Faculty</h2>
          </div>
          <div className="p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Faculty Dropdown */}
              <div className="flex-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">
                  Faculty Member
                </label>
                <select
                  value={selectedFaculty}
                  onChange={handleFacultyChange}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-800
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent
                    hover:border-green-400 transition-all cursor-pointer"
                >
                  {FACULTY_LIST.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Show Button */}
              <div className="flex items-end">
                <button
                  onClick={handleShow}
                  disabled={loading || !selectedFaculty}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg
                    bg-green-600 hover:bg-green-700 active:bg-green-800
                    text-white font-semibold text-sm transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Loading…
                    </>
                  ) : (
                    <>
                      <ClipboardList size={15} />
                      Show
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Stats — visible only when data loaded */}
        {leaveRows.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            <StatCard label="Faculty"         value={selectedFacultyName.split(" ")[0] + "…"} color="green"  />
            <StatCard label="Leave Types"     value={leaveRows.length}                         color="blue"   />
            <StatCard label="Total Days"      value={totalLeave}                               color="amber"  />
            <StatCard label="Avg per Type"    value={leaveRows.length ? Math.round(totalLeave / leaveRows.length) : 0} color="purple" />
          </div>
        )}

        {/* Leave Data Panel */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* Panel Header */}
          {leaveRows.length > 0 && (
            <div className="px-5 py-4 border-b border-gray-100 bg-green-50 flex items-center justify-between flex-wrap gap-2">
              <div>
                <h2 className="text-sm font-semibold text-green-800 uppercase tracking-wide">Leave Due Details</h2>
                <p className="text-xs text-green-600 mt-0.5">{selectedFacultyName}</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium border border-green-200">
                {leaveRows.length} types · {totalLeave} days total
              </span>
            </div>
          )}

          {/* ── Desktop Table (md+) ── */}
          {loading ? (
            <div className="hidden md:flex items-center justify-center py-20 gap-3 text-gray-400">
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-sm">Loading leave data…</span>
            </div>
          ) : leaveRows.length > 0 ? (
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-auto">Leave Type</th>
                    <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide w-44 text-center">Leave Due (days)</th>
                  </tr>
                </thead>
                <tbody>
                  {leaveRows.map((row, i) => (
                    <LeaveTableRow
                      key={row.leavetypeid}
                      row={row}
                      index={i}
                      value={leaveDueMap[row.leavetypeid] ?? ""}
                      onChange={handleDueChange}
                      error={errors[row.leavetypeid]}
                    />
                  ))}
                </tbody>
                {/* Footer total */}
                <tfoot>
                  <tr className="bg-green-50 border-t-2 border-green-200">
                    <td className="px-4 py-3 text-sm font-bold text-green-800">Total Leave Due</td>
                    <td className="px-4 py-3 text-center">
                      <span className="inline-block bg-green-100 text-green-800 font-bold text-sm px-4 py-1 rounded-full border border-green-200">
                        {totalLeave} days
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : !loading ? (
            <div className="hidden md:block">
              <EmptyState />
            </div>
          ) : null}

          {/* ── Mobile Cards (< md) ── */}
          {loading ? (
            <div className="flex md:hidden items-center justify-center py-16 gap-3 text-gray-400">
              <RefreshCw size={18} className="animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          ) : leaveRows.length > 0 ? (
            <div className="flex flex-col gap-3 p-4 md:hidden">
              {leaveRows.map((row, i) => (
                <LeaveCard
                  key={row.leavetypeid}
                  row={row}
                  index={i}
                  value={leaveDueMap[row.leavetypeid] ?? ""}
                  onChange={handleDueChange}
                  error={errors[row.leavetypeid]}
                  expanded={expandedCard === row.leavetypeid}
                  onToggle={() => toggleCard(row.leavetypeid)}
                />
              ))}

              {/* Mobile total pill */}
              <div className="flex items-center justify-between mt-1 bg-green-50 rounded-xl border border-green-200 px-4 py-3">
                <span className="text-sm font-bold text-green-800">Total Leave Due</span>
                <span className="bg-green-600 text-white text-sm font-bold px-4 py-1 rounded-full">{totalLeave} days</span>
              </div>
            </div>
          ) : !loading ? (
            <div className="flex md:hidden">
              <EmptyState />
            </div>
          ) : null}

          {/* Submit / Action Row — shown when data loaded */}
          {leaveRows.length > 0 && (
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-between items-center">
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <Info size={12} />
                Only numeric values are allowed for leave due days
              </p>
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  onClick={handleReset}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg
                    border border-gray-300 text-gray-700 text-sm font-medium
                    hover:bg-gray-100 active:bg-gray-200 transition-all"
                >
                  <RefreshCw size={14} />
                  Reset
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg
                    bg-green-600 hover:bg-green-700 active:bg-green-800
                    text-white font-semibold text-sm transition-all
                    disabled:opacity-60 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  {submitting ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      Saving…
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-xs text-center text-gray-400 mt-6">
          Faculty Leave Management · Changes take effect immediately after submission
        </p>
      </div>
    </div>
  );
}
