import { useState, useMemo, useCallback } from "react";
import { Users, BookOpen, ChevronDown, ChevronUp, Save, Eye, CheckSquare, Square, Search, X, Filter, GraduationCap, Layers, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

// ─── Static / Dummy Data ─────────────────────────────────────────────────────

const FACULTIES = [
  { id: "0", name: "Select Faculty" },
  { id: "1", name: "Dr. Anjali Sharma" },
  { id: "2", name: "Prof. Rajesh Kumar" },
  { id: "3", name: "Dr. Meena Verma" },
  { id: "4", name: "Prof. Suresh Patel" },
  { id: "5", name: "Dr. Kavita Singh" },
];

const CLASSES = [
  { id: "0", name: "Select Class" },
  { id: "1", name: "B.Tech CSE - Sem 1" },
  { id: "2", name: "B.Tech CSE - Sem 3" },
  { id: "3", name: "B.Tech ECE - Sem 2" },
  { id: "4", name: "MCA - Sem 1" },
  { id: "5", name: "MBA - Sem 2" },
];

const SECTIONS_DATA = [
  {
    sec_id: "sec_a",
    section: "Section A",
    subjects: [
      { id: "sub1", name: "Data Structures" },
      { id: "sub2", name: "Algorithms" },
      { id: "sub3", name: "DBMS" },
      { id: "sub4", name: "Operating Systems" },
      { id: "sub5", name: "Computer Networks" },
      { id: "sub6", name: "Software Engineering" },
      { id: "sub7", name: "Web Technologies" },
      { id: "sub8", name: "Machine Learning" },
    ],
  },
  {
    sec_id: "sec_b",
    section: "Section B",
    subjects: [
      { id: "sub1", name: "Data Structures" },
      { id: "sub2", name: "Algorithms" },
      { id: "sub3", name: "DBMS" },
      { id: "sub4", name: "Operating Systems" },
      { id: "sub9", name: "Computer Graphics" },
      { id: "sub10", name: "Compiler Design" },
      { id: "sub11", name: "Cloud Computing" },
      { id: "sub12", name: "Cyber Security" },
    ],
  },
  {
    sec_id: "sec_c",
    section: "Section C",
    subjects: [
      { id: "sub1", name: "Data Structures" },
      { id: "sub3", name: "DBMS" },
      { id: "sub5", name: "Computer Networks" },
      { id: "sub13", name: "Artificial Intelligence" },
      { id: "sub14", name: "IoT" },
      { id: "sub15", name: "Blockchain" },
    ],
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Styled select dropdown */
function StyledSelect({ label, icon: Icon, value, onChange, options, error }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
        {Icon && <Icon size={12} className="text-indigo-400" />}
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full appearance-none bg-white border rounded-xl px-4 py-2.5 pr-10 text-sm font-medium text-slate-700 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 cursor-pointer
            ${error ? "border-rose-400 bg-rose-50" : "border-slate-200 hover:border-indigo-300"}`}
        >
          {options.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.name}
            </option>
          ))}
        </select>
        <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>
      {error && (
        <p className="text-xs text-rose-500 flex items-center gap-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
}

/** Subject chip checkbox */
function SubjectChip({ subject, checked, onChange }) {
  return (
    <label
      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer select-none transition-all duration-150
        ${checked
          ? "bg-indigo-50 border-indigo-400 text-indigo-700 shadow-sm"
          : "bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
        }`}
    >
      <span className={`w-3.5 h-3.5 rounded flex-shrink-0 border transition-colors ${checked ? "bg-indigo-500 border-indigo-500" : "border-slate-300"}`}>
        {checked && (
          <svg viewBox="0 0 10 10" className="w-full h-full text-white fill-current">
            <path d="M1.5 5L4 7.5L8.5 2.5" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {subject.name}
    </label>
  );
}

/** Section row — desktop table row */
function SectionRowDesktop({ row, sectionChecked, checkedSubjects, onSectionCheck, onSubjectCheck }) {
  const allChecked = row.subjects.every((s) => checkedSubjects.has(s.id));

  return (
    <tr className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors">
      {/* Checkbox */}
      <td className="w-10 px-4 py-4">
        <input
          type="checkbox"
          checked={sectionChecked}
          onChange={(e) => onSectionCheck(row.sec_id, e.target.checked)}
          className="w-4 h-4 rounded accent-indigo-600 cursor-pointer"
        />
      </td>
      {/* Section */}
      <td className="px-4 py-4 w-36">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold tracking-wide">
          <Layers size={11} />
          {row.section}
        </span>
      </td>
      {/* Subjects */}
      <td className="px-4 py-4">
        <div className="flex flex-col gap-2">
          {/* Select All toggle */}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 cursor-pointer w-fit">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => onSubjectCheck(row.sec_id, "all", e.target.checked, row.subjects)}
              className="w-3.5 h-3.5 rounded accent-indigo-600"
            />
            Select All
          </label>
          <div className="flex flex-wrap gap-2">
            {row.subjects.map((sub) => (
              <SubjectChip
                key={sub.id}
                subject={sub}
                checked={checkedSubjects.has(sub.id)}
                onChange={(checked) => onSubjectCheck(row.sec_id, sub.id, checked, row.subjects)}
              />
            ))}
          </div>
        </div>
      </td>
    </tr>
  );
}

/** Section card — mobile view */
function SectionCardMobile({ row, sectionChecked, checkedSubjects, onSectionCheck, onSubjectCheck }) {
  const [expanded, setExpanded] = useState(true);
  const allChecked = row.subjects.every((s) => checkedSubjects.has(s.id));
  const selectedCount = row.subjects.filter((s) => checkedSubjects.has(s.id)).length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden mb-3">
      {/* Card header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-indigo-50 to-white cursor-pointer"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={sectionChecked}
            onChange={(e) => { e.stopPropagation(); onSectionCheck(row.sec_id, e.target.checked); }}
            onClick={(e) => e.stopPropagation()}
            className="w-4 h-4 rounded accent-indigo-600"
          />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-bold">
            <Layers size={11} />
            {row.section}
          </span>
          <span className="text-xs text-slate-400 font-medium">{selectedCount}/{row.subjects.length} selected</span>
        </div>
        {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
      </div>

      {/* Card body */}
      {expanded && (
        <div className="px-4 py-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-3 cursor-pointer">
            <input
              type="checkbox"
              checked={allChecked}
              onChange={(e) => onSubjectCheck(row.sec_id, "all", e.target.checked, row.subjects)}
              className="w-3.5 h-3.5 rounded accent-indigo-600"
            />
            Select All Subjects
          </label>
          <div className="grid grid-cols-2 gap-2">
            {row.subjects.map((sub) => (
              <SubjectChip
                key={sub.id}
                subject={sub}
                checked={checkedSubjects.has(sub.id)}
                onChange={(checked) => onSubjectCheck(row.sec_id, sub.id, checked, row.subjects)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/** Toast notification */
function Toast({ message, type, onClose }) {
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl text-sm font-semibold transition-all
      ${type === "success" ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}>
      {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {message}
      <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FacultySubjectMapping() {
  const [faculty, setFaculty] = useState("0");
  const [classVal, setClassVal] = useState("0");
  const [errors, setErrors] = useState({});
  const [showGrid, setShowGrid] = useState(false);
  const [saveVisible, setSaveVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Map: sec_id → Set of checked subject ids
  const [subjectMap, setSubjectMap] = useState({});
  // Map: sec_id → bool (row checkbox)
  const [sectionChecked, setSectionChecked] = useState({});

  const [toast, setToast] = useState(null);
  const [searchSubject, setSearchSubject] = useState("");

  // Filtered sections data based on subject search
  const filteredData = useMemo(() => {
    if (!searchSubject.trim()) return SECTIONS_DATA;
    return SECTIONS_DATA.map((row) => ({
      ...row,
      subjects: row.subjects.filter((s) =>
        s.name.toLowerCase().includes(searchSubject.toLowerCase())
      ),
    })).filter((row) => row.subjects.length > 0);
  }, [searchSubject]);

  // Validate and show grid
  const handleShow = useCallback(() => {
    const newErrors = {};
    if (faculty === "0") newErrors.faculty = "Please select a faculty";
    if (classVal === "0") newErrors.classVal = "Please select a class";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    setLoading(true);
    // Simulate API fetch
    setTimeout(() => {
      // Init subjectMap with empty sets
      const initMap = {};
      const initSec = {};
      SECTIONS_DATA.forEach((row) => {
        initMap[row.sec_id] = new Set();
        initSec[row.sec_id] = false;
      });
      setSubjectMap(initMap);
      setSectionChecked(initSec);
      setShowGrid(true);
      setSaveVisible(true);
      setLoading(false);
    }, 600);
  }, [faculty, classVal]);

  const handleReset = () => {
    setFaculty("0");
    setClassVal("0");
    setErrors({});
    setShowGrid(false);
    setSaveVisible(false);
    setSubjectMap({});
    setSectionChecked({});
    setSearchSubject("");
  };

  const handleSectionCheck = useCallback((secId, checked) => {
    setSectionChecked((prev) => ({ ...prev, [secId]: checked }));
  }, []);

  const handleSubjectCheck = useCallback((secId, subId, checked, allSubs) => {
    setSubjectMap((prev) => {
      const set = new Set(prev[secId] || []);
      if (subId === "all") {
        if (checked) allSubs.forEach((s) => set.add(s.id));
        else allSubs.forEach((s) => set.delete(s.id));
      } else {
        checked ? set.add(subId) : set.delete(subId);
      }
      return { ...prev, [secId]: set };
    });
  }, []);

  const handleSave = () => {
    // Count total selections
    let total = 0;
    Object.values(subjectMap).forEach((set) => { total += set.size; });
    setToast({ message: `Mapping saved! ${total} subject(s) assigned.`, type: "success" });
    setTimeout(() => setToast(null), 3500);
  };

  // Summary stats
  const totalSelected = useMemo(() => {
    let n = 0;
    Object.values(subjectMap).forEach((s) => { n += s.size; });
    return n;
  }, [subjectMap]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md">
              <GraduationCap size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-slate-800 leading-tight">Faculty Subject Mapping</h1>
              <p className="text-xs text-slate-400 hidden sm:block">Assign subjects to faculty by section</p>
            </div>
          </div>
          {/* Breadcrumb */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Home</span>
            <ChevronDown size={10} className="rotate-[-90deg]" />
            <span className="text-indigo-600 font-semibold">Faculty Subject Mapping</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* Filter Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <Filter size={15} className="text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-700">Select Faculty & Class</h2>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <StyledSelect
                label="Faculty"
                icon={Users}
                value={faculty}
                onChange={(v) => { setFaculty(v); setErrors((e) => ({ ...e, faculty: "" })); }}
                options={FACULTIES}
                error={errors.faculty}
              />
              <StyledSelect
                label="Class"
                icon={BookOpen}
                value={classVal}
                onChange={(v) => { setClassVal(v); setErrors((e) => ({ ...e, classVal: "" })); }}
                options={CLASSES}
                error={errors.classVal}
              />
              <div className="flex gap-2 sm:col-span-2 lg:col-span-2">
                <button
                  onClick={handleShow}
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-md shadow-indigo-200 transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <RefreshCw size={15} className="animate-spin" />
                  ) : (
                    <Eye size={15} />
                  )}
                  {loading ? "Loading..." : "Show Mapping"}
                </button>
                <button
                  onClick={handleReset}
                  className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-150"
                  title="Reset"
                >
                  <RefreshCw size={15} />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Grid / Results */}
        {showGrid && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <CheckSquare size={16} className="text-indigo-500" />
                <h2 className="text-sm font-bold text-slate-700">Subject Mapping Grid</h2>
                {totalSelected > 0 && (
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2.5 py-0.5 rounded-full">
                    {totalSelected} selected
                  </span>
                )}
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-56">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search subjects…"
                  value={searchSubject}
                  onChange={(e) => setSearchSubject(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 transition"
                />
                {searchSubject && (
                  <button onClick={() => setSearchSubject("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="w-10 px-4 py-3 text-left">
                      <Square size={14} className="text-slate-400" />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-widest">Subjects</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-4 py-12 text-center text-slate-400 text-sm">
                        No subjects found for "{searchSubject}"
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((row) => (
                      <SectionRowDesktop
                        key={row.sec_id}
                        row={row}
                        sectionChecked={sectionChecked[row.sec_id] || false}
                        checkedSubjects={subjectMap[row.sec_id] || new Set()}
                        onSectionCheck={handleSectionCheck}
                        onSubjectCheck={handleSubjectCheck}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden px-4 py-4">
              {filteredData.length === 0 ? (
                <div className="text-center text-slate-400 text-sm py-10">
                  No subjects found for "{searchSubject}"
                </div>
              ) : (
                filteredData.map((row) => (
                  <SectionCardMobile
                    key={row.sec_id}
                    row={row}
                    sectionChecked={sectionChecked[row.sec_id] || false}
                    checkedSubjects={subjectMap[row.sec_id] || new Set()}
                    onSectionCheck={handleSectionCheck}
                    onSubjectCheck={handleSubjectCheck}
                  />
                ))
              )}
            </div>

            {/* Save button */}
            {saveVisible && (
              <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50/60">
                <p className="text-xs text-slate-500">
                  Mapping for <strong>{FACULTIES.find((f) => f.id === faculty)?.name}</strong> · <strong>{CLASSES.find((c) => c.id === classVal)?.name}</strong>
                </p>
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold px-6 py-2.5 rounded-xl shadow-md shadow-emerald-200 transition-all duration-150"
                >
                  <Save size={15} />
                  Save Mapping
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state */}
        {!showGrid && !loading && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-300 shadow-sm flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4">
              <GraduationCap size={26} className="text-indigo-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-600 mb-1">No Mapping Loaded</h3>
            <p className="text-xs text-slate-400 max-w-xs">Select a faculty and class above, then click <strong>Show Mapping</strong> to view and assign subjects.</p>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
