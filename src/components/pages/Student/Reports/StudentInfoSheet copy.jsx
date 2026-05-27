import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Download, RefreshCw, Filter, ChevronDown, ChevronUp,
  X, Eye, FileSpreadsheet, Users, GraduationCap, CheckSquare,
  SlidersHorizontal, Check, ChevronRight, MoreVertical, BookOpen,
  UserCheck, UserX, Baby, School
} from "lucide-react";

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const SESSIONS = ["2024-25", "2023-24", "2022-23", "2021-22"];

const CLASSES = [
  "Nursery", "LKG", "UKG",
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
  "Class 11", "Class 12"
];

const CLASS_TYPES = ["Regular", "Vocational", "Special Education"];
const SECTIONS = ["A", "B", "C", "D", "E"];

const ALL_COLUMNS = [
  "SR No", "Admission No", "Student Name", "Father Name", "Mother Name",
  "Class", "Section", "Roll No", "DOB", "Gender", "Category",
  "Religion", "Caste", "Mobile No", "Address", "Aadhar No",
  "Student Type", "RTE", "Status", "Certificate", "Fee Concession",
  "House", "Blood Group", "Transport Route", "Session"
];

const STUDENT_STATUS = ["All", "Registered", "Withdrawn"];
const CERT_STATUS = ["All", "Yes", "No"];
const STUDENT_TYPE_OPTIONS = ["All", "New Student", "Old Student"];
const STUDENT_CATEGORY = ["All", "RTE Student", "Boys", "Girls"];

const generateStudents = () => {
  const names = [
    "Aarav Sharma", "Priya Singh", "Rohan Gupta", "Ananya Verma", "Karan Patel",
    "Sneha Tiwari", "Dev Mishra", "Ishaan Yadav", "Pooja Rajput", "Arjun Joshi",
    "Nisha Chauhan", "Vivek Kumar", "Meera Agarwal", "Rahul Srivastava", "Kavya Pandey",
    "Amit Dubey", "Ritika Saxena", "Nikhil Bose", "Sonal Mehta", "Tushar Nair",
  ];
  const fathers = [
    "Suresh Sharma", "Rakesh Singh", "Mahesh Gupta", "Dinesh Verma", "Hitesh Patel",
    "Ramesh Tiwari", "Naresh Mishra", "Sunil Yadav", "Anil Rajput", "Vijay Joshi",
    "Ashok Chauhan", "Pramod Kumar", "Sanjay Agarwal", "Deepak Srivastava", "Manoj Pandey",
    "Satish Dubey", "Vinod Saxena", "Arun Bose", "Rajan Mehta", "Kishore Nair",
  ];
  return names.map((name, i) => ({
    id: i + 1,
    srNo: i + 1,
    admissionNo: `ADM${2024000 + i + 1}`,
    studentName: name,
    fatherName: fathers[i],
    motherName: `Mother ${i + 1}`,
    class: CLASSES[i % CLASSES.length],
    section: SECTIONS[i % SECTIONS.length],
    rollNo: String(i + 1).padStart(3, "0"),
    dob: `${String((i % 28) + 1).padStart(2, "0")}/${String((i % 12) + 1).padStart(2, "0")}/201${i % 5}`,
    gender: i % 2 === 0 ? "Male" : "Female",
    category: ["General", "OBC", "SC", "ST"][i % 4],
    religion: ["Hindu", "Muslim", "Christian", "Sikh"][i % 4],
    caste: ["Brahmin", "Kshatriya", "Vaishya", "Shudra"][i % 4],
    mobileNo: `98${String(i).padStart(8, "7")}`,
    address: `House ${i + 1}, Sector ${(i % 10) + 1}, City`,
    aadharNo: `${1234 + i} ${5678 + i} ${9012 + i}`,
    studentType: i % 3 === 0 ? "New Student" : "Old Student",
    rte: i % 5 === 0 ? "Yes" : "No",
    status: i % 7 === 0 ? "Withdrawn" : "Registered",
    certificate: i % 3 === 0 ? "Yes" : "No",
    feeConcession: i % 4 === 0 ? "Yes" : "No",
    house: ["Red", "Blue", "Green", "Yellow"][i % 4],
    bloodGroup: ["A+", "B+", "O+", "AB+", "A-"][i % 5],
    transportRoute: `Route ${(i % 5) + 1}`,
    session: "2024-25",
  }));
};

const STUDENTS_DATA = generateStudents();

// ─── Sub-components ────────────────────────────────────────────────────────────

// Multi-select ListBox
function MultiSelectBox({ options, selected, onChange, label }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white">
        <select
          multiple
          value={selected}
          onChange={(e) => {
            const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
            onChange(vals);
          }}
          className="w-full text-sm text-slate-700 p-1 outline-none cursor-pointer"
          style={{ minHeight: "80px" }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt} className="px-2 py-1 hover:bg-blue-50">
              {opt}
            </option>
          ))}
        </select>
      </div>
      {selected.length > 0 && (
        <p className="text-xs text-blue-600 mt-1">{selected.length} selected</p>
      )}
    </div>
  );
}

// Select Dropdown
function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-slate-200 rounded-lg text-sm text-slate-700 px-3 py-2 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
      >
        {options.map((opt) => (
          <option key={typeof opt === "object" ? opt.value : opt}
            value={typeof opt === "object" ? opt.value : opt}>
            {typeof opt === "object" ? opt.label : opt}
          </option>
        ))}
      </select>
    </div>
  );
}

// Column Manager Dropdown
function ColumnManager({ allCols, selected, onToggle, onSelectAll }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = allCols.filter((c) => c.toLowerCase().includes(search.toLowerCase()));
  const allSelected = selected.length === allCols.length;

  const label = allSelected ? "All Columns" :
    selected.length === 0 ? "Select Columns" :
    selected.length <= 2 ? selected.join(", ") :
    `${selected.length} columns selected`;

  return (
    <div ref={ref} className="relative">
      <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
        Manage Columns
      </label>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between border border-slate-200 rounded-lg px-3 py-2 bg-white text-sm text-slate-700 hover:border-blue-400 transition"
      >
        <span className="truncate">{label}</span>
        <ChevronDown size={14} className={`ml-2 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden">
          <div className="p-2 border-b border-slate-100 sticky top-0 bg-white">
            <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 rounded-lg border border-slate-200">
              <Search size={13} className="text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search columns..."
                className="flex-1 text-xs bg-transparent outline-none text-slate-700"
              />
            </div>
          </div>
          <div className="p-2 border-b border-slate-100">
            <label className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 cursor-pointer">
              <div onClick={onSelectAll}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition ${allSelected ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                {allSelected && <Check size={10} className="text-white" />}
              </div>
              <span className="text-xs font-semibold text-slate-700">Select All</span>
            </label>
          </div>
          <div className="overflow-y-auto max-h-48 p-2 grid grid-cols-2 gap-0.5">
            {filtered.map((col) => {
              const checked = selected.includes(col);
              return (
                <label key={col} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-blue-50 cursor-pointer">
                  <div onClick={() => onToggle(col)}
                    className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer transition ${checked ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
                    {checked && <Check size={10} className="text-white" />}
                  </div>
                  <span className="text-xs text-slate-600 truncate">{col}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Stats bar
function StatsBar({ total, registered, withdrawn }) {
  return (
    <div className="grid grid-cols-3 gap-3 mb-4">
      {[
        { label: "Total Students", value: total, icon: Users, color: "blue" },
        { label: "Registered", value: registered, icon: UserCheck, color: "emerald" },
        { label: "Withdrawn", value: withdrawn, icon: UserX, color: "rose" },
      ].map(({ label, value, icon: Icon, color }) => (
        <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-xl p-3 flex items-center gap-3`}>
          <div className={`w-8 h-8 rounded-lg bg-${color}-100 flex items-center justify-center flex-shrink-0`}>
            <Icon size={16} className={`text-${color}-600`} />
          </div>
          <div>
            <p className="text-lg font-bold text-slate-800 leading-none">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Mobile Student Card
function StudentCard({ student, visibleCols }) {
  const [expanded, setExpanded] = useState(false);

  const primaryFields = ["admissionNo", "studentName", "fatherName", "class", "section", "status"];
  const fieldMap = {
    "SR No": student.srNo, "Admission No": student.admissionNo,
    "Student Name": student.studentName, "Father Name": student.fatherName,
    "Mother Name": student.motherName, "Class": student.class,
    "Section": student.section, "Roll No": student.rollNo,
    "DOB": student.dob, "Gender": student.gender,
    "Category": student.category, "Religion": student.religion,
    "Caste": student.caste, "Mobile No": student.mobileNo,
    "Address": student.address, "Aadhar No": student.aadharNo,
    "Student Type": student.studentType, "RTE": student.rte,
    "Status": student.status, "Certificate": student.certificate,
    "Fee Concession": student.feeConcession, "House": student.house,
    "Blood Group": student.bloodGroup, "Transport Route": student.transportRoute,
    "Session": student.session,
  };

  const shownCols = visibleCols.length > 0 ? visibleCols : ALL_COLUMNS;
  const primaryCols = shownCols.slice(0, 5);
  const secondaryCols = shownCols.slice(5);

  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-sm overflow-hidden mb-3">
      {/* Card header */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-bold text-blue-700">
            {student.studentName.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-slate-800 text-sm truncate">{student.studentName}</p>
          <p className="text-xs text-slate-500">{student.admissionNo} · {student.class} {student.section}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${student.status === "Registered"
          ? "bg-emerald-100 text-emerald-700"
          : "bg-rose-100 text-rose-700"}`}>
          {student.status}
        </span>
      </div>

      {/* Primary info grid */}
      <div className="grid grid-cols-2 gap-0 border-b border-slate-100">
        {primaryCols.map((col) => (
          <div key={col} className="px-3 py-2 border-r border-b border-slate-100 last:border-r-0">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">{col}</p>
            <p className="text-xs font-medium text-slate-700 mt-0.5 truncate">{fieldMap[col] ?? "—"}</p>
          </div>
        ))}
      </div>

      {/* Expanded details */}
      {expanded && secondaryCols.length > 0 && (
        <div className="grid grid-cols-2 gap-0 border-b border-slate-100">
          {secondaryCols.map((col) => (
            <div key={col} className="px-3 py-2 border-r border-b border-slate-100 last:border-r-0">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide">{col}</p>
              <p className="text-xs font-medium text-slate-700 mt-0.5 truncate">{fieldMap[col] ?? "—"}</p>
            </div>
          ))}
        </div>
      )}

      {secondaryCols.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-2 text-xs text-blue-600 font-medium hover:bg-blue-50 transition"
        >
          {expanded ? <><ChevronUp size={13} /> Show Less</> : <><ChevronDown size={13} /> Show More ({secondaryCols.length} more fields)</>}
        </button>
      )}
    </div>
  );
}

// Desktop Table Row
function TableRow({ student, visibleCols }) {
  const fieldMap = {
    "SR No": student.srNo, "Admission No": student.admissionNo,
    "Student Name": student.studentName, "Father Name": student.fatherName,
    "Mother Name": student.motherName, "Class": student.class,
    "Section": student.section, "Roll No": student.rollNo,
    "DOB": student.dob, "Gender": student.gender,
    "Category": student.category, "Religion": student.religion,
    "Caste": student.caste, "Mobile No": student.mobileNo,
    "Address": student.address, "Aadhar No": student.aadharNo,
    "Student Type": student.studentType, "RTE": student.rte,
    "Status": student.status, "Certificate": student.certificate,
    "Fee Concession": student.feeConcession, "House": student.house,
    "Blood Group": student.bloodGroup, "Transport Route": student.transportRoute,
    "Session": student.session,
  };

  const cols = visibleCols.length > 0 ? visibleCols : ALL_COLUMNS;

  return (
    <tr className="hover:bg-blue-50/30 transition group">
      {cols.map((col) => (
        <td key={col} className="px-3 py-2.5 text-xs text-slate-600 border-b border-slate-100 whitespace-nowrap">
          {col === "Status" ? (
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${fieldMap[col] === "Registered"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-rose-100 text-rose-700"}`}>
              {fieldMap[col]}
            </span>
          ) : col === "Student Name" ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-[9px] font-bold text-blue-700">{student.studentName.charAt(0)}</span>
              </div>
              <span className="font-medium text-slate-700">{fieldMap[col]}</span>
            </div>
          ) : (
            <span>{fieldMap[col] ?? "—"}</span>
          )}
        </td>
      ))}
    </tr>
  );
}

// Mobile Filter Drawer
function FilterDrawer({ open, onClose, filters, setFilters, onSubmit }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-sm bg-white h-full flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-slate-100 bg-gradient-to-r from-blue-600 to-blue-700">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={16} className="text-white" />
            <span className="font-semibold text-white">Filters</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
            <X size={16} className="text-white" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <SelectField label="Select Session" value={filters.session}
            onChange={(v) => setFilters({ ...filters, session: v })}
            options={SESSIONS} />

          <MultiSelectBox label="Select Class" options={CLASSES}
            selected={filters.classes} onChange={(v) => setFilters({ ...filters, classes: v })} />

          <SelectField label="Class Type" value={filters.classType}
            onChange={(v) => setFilters({ ...filters, classType: v })}
            options={["All", ...CLASS_TYPES]} />

          <MultiSelectBox label="Select Section" options={SECTIONS}
            selected={filters.sections} onChange={(v) => setFilters({ ...filters, sections: v })} />

          <SelectField label="Student Type (New/Old)" value={filters.studentType}
            onChange={(v) => setFilters({ ...filters, studentType: v })}
            options={STUDENT_TYPE_OPTIONS} />

          <SelectField label="Student Category" value={filters.studentCategory}
            onChange={(v) => setFilters({ ...filters, studentCategory: v })}
            options={STUDENT_CATEGORY} />

          <SelectField label="Student Status" value={filters.status}
            onChange={(v) => setFilters({ ...filters, status: v })}
            options={STUDENT_STATUS} />

          <SelectField label="Certificate Status" value={filters.certificate}
            onChange={(v) => setFilters({ ...filters, certificate: v })}
            options={CERT_STATUS} />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex gap-3">
          <button type="button"
            onClick={() => setFilters({ session: "2024-25", classes: [], classType: "All", sections: [], studentType: "All", studentCategory: "All", status: "All", certificate: "All" })}
            className="flex-1 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 font-medium hover:bg-slate-50 transition">
            Reset
          </button>
          <button type="button" onClick={() => { onSubmit(); onClose(); }}
            className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm text-white font-semibold hover:bg-blue-700 transition">
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function StudentInfoSheet() {
  const [filters, setFilters] = useState({
    session: "2024-25",
    classes: [],
    classType: "All",
    sections: [],
    studentType: "All",
    studentCategory: "All",
    status: "All",
    certificate: "All",
  });

  const [selectedCols, setSelectedCols] = useState(ALL_COLUMNS.slice(0, 10));
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true); // desktop

  // Filtered students
  const filteredStudents = useMemo(() => {
    if (!submitted) return [];
    return STUDENTS_DATA.filter((s) => {
      if (filters.classes.length > 0 && !filters.classes.includes(s.class)) return false;
      if (filters.sections.length > 0 && !filters.sections.includes(s.section)) return false;
      if (filters.studentType !== "All" && s.studentType !== filters.studentType) return false;
      if (filters.status !== "All" && s.status !== filters.status) return false;
      if (filters.certificate !== "All" && s.certificate !== filters.certificate) return false;
      if (filters.studentCategory === "RTE Student" && s.rte !== "Yes") return false;
      if (filters.studentCategory === "Boys" && s.gender !== "Male") return false;
      if (filters.studentCategory === "Girls" && s.gender !== "Female") return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          s.studentName.toLowerCase().includes(q) ||
          s.admissionNo.toLowerCase().includes(q) ||
          s.fatherName.toLowerCase().includes(q) ||
          s.class.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [submitted, filters, searchQuery]);

  const stats = useMemo(() => ({
    total: filteredStudents.length,
    registered: filteredStudents.filter((s) => s.status === "Registered").length,
    withdrawn: filteredStudents.filter((s) => s.status === "Withdrawn").length,
  }), [filteredStudents]);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => { setSubmitted(true); setLoading(false); }, 600);
  };

  const handleReset = () => {
    setFilters({ session: "2024-25", classes: [], classType: "All", sections: [], studentType: "All", studentCategory: "All", status: "All", certificate: "All" });
    setSubmitted(false);
    setSearchQuery("");
  };

  const handleColToggle = (col) => {
    setSelectedCols((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col]
    );
  };

  const handleSelectAllCols = () => {
    setSelectedCols(selectedCols.length === ALL_COLUMNS.length ? [] : [...ALL_COLUMNS]);
  };

  const handleExcel = () => {
    alert("Excel export triggered — connect to backend API.");
  };

  const visibleCols = selectedCols.length > 0 ? selectedCols : ALL_COLUMNS;

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-3">
          {/* Breadcrumb + Title */}
          <div>
            <nav className="flex items-center gap-1 text-xs text-slate-400 mb-1">
              <span>Home</span>
              <ChevronRight size={11} />
              <span>Reports</span>
              <ChevronRight size={11} />
              <span className="text-blue-600 font-medium">Student Info Sheet</span>
            </nav>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
                <GraduationCap size={15} className="text-white" />
              </div>
              <h1 className="text-lg font-bold text-slate-800">Student Info Sheet</h1>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden sm:flex items-center gap-2">
            <button onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
              <RefreshCw size={13} /> Reset
            </button>
            <button onClick={handleExcel}
              className="flex items-center gap-1.5 px-3 py-2 text-xs text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">
              <FileSpreadsheet size={13} /> Export Excel
            </button>
          </div>

          {/* Mobile filter button */}
          <button onClick={() => setFilterDrawerOpen(true)}
            className="sm:hidden flex items-center gap-1.5 px-3 py-2 text-xs text-white bg-blue-600 rounded-lg">
            <Filter size={13} /> Filters
          </button>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-4">

        {/* ── Desktop Filter Panel ── */}
        <div className="hidden sm:block bg-white rounded-2xl border border-slate-200 shadow-sm mb-4 overflow-hidden">
          <button type="button"
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition border-b border-slate-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={15} className="text-blue-600" />
              Search & Filter
            </div>
            {filtersOpen ? <ChevronUp size={15} className="text-slate-400" /> : <ChevronDown size={15} className="text-slate-400" />}
          </button>

          {filtersOpen && (
            <div className="p-5">
              {/* Row 1 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <SelectField label="Session" value={filters.session}
                  onChange={(v) => setFilters({ ...filters, session: v })}
                  options={SESSIONS} />

                <MultiSelectBox label="Class (Multi-select)" options={CLASSES}
                  selected={filters.classes} onChange={(v) => setFilters({ ...filters, classes: v })} />

                <SelectField label="Class Type" value={filters.classType}
                  onChange={(v) => setFilters({ ...filters, classType: v })}
                  options={["All", ...CLASS_TYPES]} />

                <MultiSelectBox label="Section (Multi-select)" options={SECTIONS}
                  selected={filters.sections} onChange={(v) => setFilters({ ...filters, sections: v })} />
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <SelectField label="Student Type (New/Old)" value={filters.studentType}
                  onChange={(v) => setFilters({ ...filters, studentType: v })}
                  options={STUDENT_TYPE_OPTIONS} />

                <SelectField label="Student Category" value={filters.studentCategory}
                  onChange={(v) => setFilters({ ...filters, studentCategory: v })}
                  options={STUDENT_CATEGORY} />

                <SelectField label="Student Status" value={filters.status}
                  onChange={(v) => setFilters({ ...filters, status: v })}
                  options={STUDENT_STATUS} />

                <SelectField label="Certificate Status" value={filters.certificate}
                  onChange={(v) => setFilters({ ...filters, certificate: v })}
                  options={CERT_STATUS} />
              </div>

              {/* Row 3 — Column Manager + Actions */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                <div className="w-full sm:w-72">
                  <ColumnManager allCols={ALL_COLUMNS} selected={selectedCols}
                    onToggle={handleColToggle} onSelectAll={handleSelectAllCols} />
                </div>
                <div className="flex items-center gap-2 ml-auto">
                  <button onClick={handleReset}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                    <RefreshCw size={13} /> Reset
                  </button>
                  <button onClick={handleSubmit}
                    className="flex items-center gap-1.5 px-5 py-2 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition font-semibold shadow-sm">
                    {loading ? <><RefreshCw size={13} className="animate-spin" /> Loading...</> : <><Search size={13} /> Search</>}
                  </button>
                  <button onClick={handleExcel}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition">
                    <FileSpreadsheet size={13} /> Excel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Mobile Filter Drawer ── */}
        <FilterDrawer open={filterDrawerOpen} onClose={() => setFilterDrawerOpen(false)}
          filters={filters} setFilters={setFilters} onSubmit={handleSubmit} />

        {/* ── Mobile: Column Manager + Search + Submit ── */}
        <div className="sm:hidden mb-4 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 p-3">
            <ColumnManager allCols={ALL_COLUMNS} selected={selectedCols}
              onToggle={handleColToggle} onSelectAll={handleSelectAllCols} />
          </div>
          <div className="flex gap-2">
            <button onClick={handleSubmit}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm text-white bg-blue-600 rounded-xl font-semibold">
              {loading ? <><RefreshCw size={13} className="animate-spin" /> Loading...</> : <><Search size={13} /> Search</>}
            </button>
            <button onClick={handleExcel}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm text-white bg-emerald-600 rounded-xl">
              <FileSpreadsheet size={13} /> Excel
            </button>
          </div>
        </div>

        {/* ── Results Section ── */}
        {submitted && (
          <div>
            {/* Stats */}
            <StatsBar {...stats} />

            {/* Search bar */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2.5 shadow-sm focus-within:ring-2 focus-within:ring-blue-400 transition">
                <Search size={14} className="text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, admission no, class..."
                  className="flex-1 text-sm text-slate-700 bg-transparent outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")}><X size={13} className="text-slate-400" /></button>
                )}
              </div>
              <div className="bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-600 shadow-sm whitespace-nowrap">
                {filteredStudents.length} records
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gradient-to-r from-slate-700 to-slate-800">
                      {visibleCols.map((col) => (
                        <th key={col} className="px-3 py-3 text-left text-[11px] font-semibold text-slate-200 uppercase tracking-wider whitespace-nowrap border-r border-slate-600 last:border-r-0">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length === 0 ? (
                      <tr>
                        <td colSpan={visibleCols.length} className="text-center py-16">
                          <div className="flex flex-col items-center gap-2">
                            <Users size={32} className="text-slate-300" />
                            <p className="text-slate-400 text-sm font-medium">No students found</p>
                            <p className="text-slate-400 text-xs">Try adjusting your filters</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredStudents.map((s) => (
                        <TableRow key={s.id} student={s} visibleCols={visibleCols} />
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Table footer */}
              {filteredStudents.length > 0 && (
                <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between">
                  <p className="text-xs text-slate-500">
                    Showing <span className="font-semibold text-slate-700">{filteredStudents.length}</span> students
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    <span>Session:</span>
                    <span className="font-semibold text-blue-600">{filters.session}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden">
              {filteredStudents.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 py-16 flex flex-col items-center gap-2">
                  <Users size={32} className="text-slate-300" />
                  <p className="text-slate-400 text-sm font-medium">No students found</p>
                  <p className="text-slate-400 text-xs">Try adjusting your filters</p>
                </div>
              ) : (
                <>
                  {filteredStudents.map((s) => (
                    <StudentCard key={s.id} student={s} visibleCols={visibleCols} />
                  ))}
                  <p className="text-center text-xs text-slate-400 mt-2 pb-6">
                    {filteredStudents.length} students shown
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Empty initial state */}
        {!submitted && !loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-16 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center">
              <BookOpen size={26} className="text-blue-400" />
            </div>
            <p className="text-slate-600 font-semibold text-base">Select filters and click Search</p>
            <p className="text-slate-400 text-sm text-center max-w-xs">
              Choose your session, class, section, and other filters, then press Search to load the student info sheet.
            </p>
            <button onClick={handleSubmit}
              className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition shadow-sm">
              <Search size={14} /> Load All Students
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm py-20 flex flex-col items-center gap-3">
            <RefreshCw size={28} className="text-blue-500 animate-spin" />
            <p className="text-slate-600 font-medium">Loading student data...</p>
          </div>
        )}

      </div>
    </div>
  );
}
