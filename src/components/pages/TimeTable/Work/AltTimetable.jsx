import { useState, useMemo, useCallback } from "react";
import {
  Calendar,
  Users,
  ChevronDown,
  CheckCircle,
  RefreshCw,
  Search,
  Clock,
  BookOpen,
  UserCheck,
  AlertCircle,
  X,
  Filter,
  ArrowRight,
  Layers,
} from "lucide-react";

// ─── Static / Dummy Data ────────────────────────────────────────────────────

const TIMETABLES = [
  { value: "TT001", label: "Morning Shift – 2024-25" },
  { value: "TT002", label: "Evening Shift – 2024-25" },
  { value: "TT003", label: "Afternoon Shift – 2024-25" },
];

const FACULTY_LIST = [
  { value: "F001", label: "Dr. Rajesh Kumar Sharma" },
  { value: "F002", label: "Prof. Sunita Devi Gupta" },
  { value: "F003", label: "Mr. Anand Prakash Verma" },
  { value: "F004", label: "Ms. Priya Sinha Agarwal" },
  { value: "F005", label: "Dr. Manoj Kumar Yadav" },
];

const ALT_FACULTY_OPTIONS = [
  { value: "0", label: "-- Select Alternate --" },
  { value: "F006", label: "Mr. Vikas Sharma" },
  { value: "F007", label: "Ms. Neha Joshi" },
  { value: "F008", label: "Dr. Arun Mishra" },
  { value: "F009", label: "Prof. Kavita Singh" },
  { value: "F010", label: "Mr. Deepak Tiwari" },
  { value: "F011", label: "Ms. Ritu Saxena" },
];

const generatePeriods = (facultyId) => {
  const baseData = [
    { id: "1", secId: "SEC-A", period: "1", lectureName: "Mathematics", time: "8:00AM - 8:45AM", className: "Class X (A)", cssClass: "period_1", secClass: "sec_A" },
    { id: "2", secId: "SEC-B", period: "2", lectureName: "Physics", time: "8:45AM - 9:30AM", className: "Class XI (B)", cssClass: "period_2", secClass: "sec_B" },
    { id: "3", secId: "SEC-C", period: "3", lectureName: "Chemistry", time: "9:45AM - 10:30AM", className: "Class XII (C)", cssClass: "period_3", secClass: "sec_C" },
    { id: "4", secId: "SEC-A", period: "4", lectureName: "Biology", time: "10:30AM - 11:15AM", className: "Class IX (A)", cssClass: "period_4", secClass: "sec_A" },
    { id: "5", secId: "SEC-D", period: "5", lectureName: "English", time: "11:30AM - 12:15PM", className: "Class VIII (D)", cssClass: "period_5", secClass: "sec_D" },
  ];
  // Vary slightly by faculty to simulate real data
  return baseData.slice(0, facultyId === "F001" ? 5 : facultyId === "F002" ? 4 : 3);
};

// ─── Sub Components ──────────────────────────────────────────────────────────

const SelectField = ({ label, icon: Icon, value, onChange, options, placeholder }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
      {Icon && <Icon size={13} />}
      {label}
    </label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-700 font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all cursor-pointer hover:border-slate-300"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  </div>
);

const StatusBadge = ({ hasAlt }) =>
  hasAlt ? (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
      <CheckCircle size={11} /> Assigned
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
      <AlertCircle size={11} /> Pending
    </span>
  );

// Desktop table row
const PeriodTableRow = ({ row, index, altValue, onAltChange }) => {
  const hasAlt = altValue && altValue !== "0";
  return (
    <tr className={`border-b border-slate-100 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-slate-50/60"} hover:bg-indigo-50/40`}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 text-xs font-bold flex items-center justify-center">{row.period}</span>
          <div>
            <p className="text-sm font-semibold text-slate-700">{row.lectureName}</p>
            <p className="text-xs text-slate-400">{row.className}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 hidden sm:table-cell">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <Clock size={12} className="text-indigo-400" />
          {row.time}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <StatusBadge hasAlt={hasAlt} />
      </td>
      <td className="px-4 py-3">
        <div className="relative min-w-[160px]">
          <select
            value={altValue}
            onChange={(e) => onAltChange(row.cssClass, e.target.value)}
            className={`w-full appearance-none text-sm rounded-lg px-3 py-2 pr-8 border font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all cursor-pointer
              ${hasAlt
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-white border-slate-200 text-slate-600 hover:border-slate-300"
              }`}
          >
            {ALT_FACULTY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
        </div>
      </td>
    </tr>
  );
};

// Mobile card
const PeriodCard = ({ row, altValue, onAltChange }) => {
  const hasAlt = altValue && altValue !== "0";
  return (
    <div className={`rounded-2xl border p-4 transition-all ${hasAlt ? "bg-emerald-50/50 border-emerald-200" : "bg-white border-slate-200"} shadow-sm`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shadow-inner">
            P{row.period}
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">{row.lectureName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{row.className}</p>
          </div>
        </div>
        <StatusBadge hasAlt={hasAlt} />
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-3 bg-slate-100 rounded-lg px-3 py-1.5 w-fit">
        <Clock size={12} className="text-indigo-400" />
        {row.time}
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          <UserCheck size={12} />
          Alternate Faculty
        </label>
        <div className="relative">
          <select
            value={altValue}
            onChange={(e) => onAltChange(row.cssClass, e.target.value)}
            className={`w-full appearance-none text-sm rounded-xl px-4 py-2.5 pr-9 border font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400 transition-all cursor-pointer
              ${hasAlt
                ? "bg-emerald-100 border-emerald-300 text-emerald-800"
                : "bg-white border-slate-200 text-slate-700"
              }`}
          >
            {ALT_FACULTY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
        </div>
      </div>
    </div>
  );
};

// Summary strip
const SummaryStrip = ({ total, assigned }) => (
  <div className="grid grid-cols-3 gap-3 mb-5">
    {[
      { label: "Total Periods", value: total, color: "bg-indigo-50 text-indigo-700 border-indigo-200" },
      { label: "Assigned", value: assigned, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      { label: "Pending", value: total - assigned, color: "bg-amber-50 text-amber-700 border-amber-200" },
    ].map((s) => (
      <div key={s.label} className={`rounded-xl border px-3 py-2.5 text-center ${s.color}`}>
        <p className="text-xl font-bold leading-tight">{s.value}</p>
        <p className="text-xs font-medium opacity-80 mt-0.5">{s.label}</p>
      </div>
    ))}
  </div>
);

// ─── Toast Notification ──────────────────────────────────────────────────────

const Toast = ({ message, onClose }) => (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-slate-800 text-white px-5 py-3.5 rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-300 max-w-sm w-[calc(100%-2rem)]">
    <CheckCircle size={18} className="text-emerald-400 shrink-0" />
    <p className="text-sm font-medium flex-1">{message}</p>
    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
      <X size={16} />
    </button>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function AltTimetable() {
  const [selectedTimetable, setSelectedTimetable] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("");
  const [periods, setPeriods] = useState([]);
  const [altAssignments, setAltAssignments] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showGrid, setShowGrid] = useState(false);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

  // Simulated data fetch
  const handleShow = useCallback(() => {
    if (!selectedTimetable || !selectedFaculty) return;
    setIsLoading(true);
    setShowGrid(false);
    setTimeout(() => {
      const data = generatePeriods(selectedFaculty);
      setPeriods(data);
      // Pre-populate if some already assigned (simulate)
      const preloaded = {};
      data.forEach((p, i) => {
        if (i === 0) preloaded[p.cssClass] = "F006"; // simulate one pre-assigned
      });
      setAltAssignments(preloaded);
      setShowGrid(true);
      setIsLoading(false);
    }, 700);
  }, [selectedTimetable, selectedFaculty]);

  const handleAltChange = useCallback((cssClass, value) => {
    setAltAssignments((prev) => ({ ...prev, [cssClass]: value }));
  }, []);

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showToast("Alternate Faculty Assigned Successfully!");
    }, 600);
  };

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  const handleReset = () => {
    setSelectedTimetable("");
    setSelectedFaculty("");
    setPeriods([]);
    setAltAssignments({});
    setShowGrid(false);
    setSearchQuery("");
  };

  const assignedCount = useMemo(
    () => Object.values(altAssignments).filter((v) => v && v !== "0").length,
    [altAssignments]
  );

  const filteredPeriods = useMemo(
    () =>
      periods.filter(
        (p) =>
          p.lectureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.className.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.time.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [periods, searchQuery]
  );

  const canShow = selectedTimetable && selectedFaculty;
  const canSubmit = showGrid && assignedCount > 0;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <Layers size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">Alternate Timetable</h1>
              <p className="text-xs text-slate-400 hidden sm:block">{today}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showGrid && (
              <div className="hidden sm:flex items-center gap-1.5 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                <BookOpen size={12} />
                {periods.length} Periods
              </div>
            )}
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-all"
            >
              <RefreshCw size={13} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-5">
        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={15} className="text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Select Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <SelectField
              label="Timetable"
              icon={Calendar}
              value={selectedTimetable}
              onChange={setSelectedTimetable}
              options={TIMETABLES}
              placeholder="-- Select Timetable --"
            />
            <SelectField
              label="Faculty"
              icon={Users}
              value={selectedFaculty}
              onChange={setSelectedFaculty}
              options={FACULTY_LIST}
              placeholder="-- Select Faculty --"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleShow}
              disabled={!canShow || isLoading}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              {isLoading && !showGrid ? (
                <RefreshCw size={15} className="animate-spin" />
              ) : (
                <Search size={15} />
              )}
              Show Schedule
              <ArrowRight size={14} />
            </button>

            {canSubmit && (
              <button
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
              >
                {isLoading && showGrid ? (
                  <RefreshCw size={15} className="animate-spin" />
                ) : (
                  <CheckCircle size={15} />
                )}
                Save Assignments
              </button>
            )}
          </div>
        </div>

        {/* Loading skeleton */}
        {isLoading && !showGrid && (
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 rounded-xl" />
            ))}
          </div>
        )}

        {/* Results Panel */}
        {showGrid && periods.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Panel Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-800">
                  {FACULTY_LIST.find((f) => f.value === selectedFaculty)?.label || "Faculty"}
                  <span className="ml-2 text-xs font-normal text-slate-400">— Today's Schedule</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {TIMETABLES.find((t) => t.value === selectedTimetable)?.label}
                </p>
              </div>
              {/* Search */}
              <div className="relative sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search periods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-sm pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={13} />
                  </button>
                )}
              </div>
            </div>

            {/* Summary Strip */}
            <div className="px-5 pt-4">
              <SummaryStrip total={periods.length} assigned={assignedCount} />
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">Period / Subject</th>
                    <th className="px-4 py-3 text-left">Timing</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Alternate Faculty</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPeriods.length > 0 ? (
                    filteredPeriods.map((row, i) => (
                      <PeriodTableRow
                        key={row.cssClass}
                        row={row}
                        index={i}
                        altValue={altAssignments[row.cssClass] || "0"}
                        onAltChange={handleAltChange}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-4 py-10 text-center text-sm text-slate-400">
                        No periods match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden px-4 pb-4 space-y-3">
              {filteredPeriods.length > 0 ? (
                filteredPeriods.map((row) => (
                  <PeriodCard
                    key={row.cssClass}
                    row={row}
                    altValue={altAssignments[row.cssClass] || "0"}
                    onAltChange={handleAltChange}
                  />
                ))
              ) : (
                <div className="text-center py-10 text-sm text-slate-400">
                  No periods match your search.
                </div>
              )}
            </div>

            {/* Bottom Action Bar (mobile sticky) */}
            {canSubmit && (
              <div className="md:hidden sticky bottom-0 bg-white border-t border-slate-200 p-4">
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold text-sm px-5 py-3 rounded-xl transition-all shadow-md"
                >
                  {isLoading ? <RefreshCw size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                  Save {assignedCount} Assignment{assignedCount !== 1 ? "s" : ""}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !showGrid && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <Calendar size={26} className="text-indigo-400" />
            </div>
            <p className="text-slate-700 font-semibold text-sm">No Schedule Loaded</p>
            <p className="text-slate-400 text-xs max-w-xs">
              Select a timetable and faculty above, then click <strong>Show Schedule</strong> to view today's periods.
            </p>
          </div>
        )}

        {/* No results after fetch */}
        {showGrid && periods.length === 0 && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
              <AlertCircle size={26} className="text-amber-400" />
            </div>
            <p className="text-slate-700 font-semibold text-sm">No Periods Found</p>
            <p className="text-slate-400 text-xs max-w-xs">
              The selected faculty has no periods scheduled for today.
            </p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  );
}
