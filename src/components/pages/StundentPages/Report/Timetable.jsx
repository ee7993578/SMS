import { useState, useMemo, useCallback } from "react";
import {
  Clock,
  Calendar,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  BookOpen,
  User,
  MapPin,
  RefreshCw,
  X,
  GraduationCap,
  AlignJustify,
  LayoutGrid,
} from "lucide-react";

// ─── Static / Dummy Data ────────────────────────────────────────────────────

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const TIME_SLOTS = [
  "8:00 AM - 9:00 AM",
  "9:00 AM - 10:00 AM",
  "10:00 AM - 11:00 AM",
  "11:00 AM - 12:00 PM",
  "12:00 PM - 1:00 PM",
  "1:00 PM - 2:00 PM",
  "2:00 PM - 3:00 PM",
  "3:00 PM - 4:00 PM",
];

const SUBJECT_COLORS = {
  Mathematics:    { bg: "bg-blue-50",   border: "border-blue-300",   text: "text-blue-700",   badge: "bg-blue-100 text-blue-700"   },
  Physics:        { bg: "bg-purple-50", border: "border-purple-300", text: "text-purple-700", badge: "bg-purple-100 text-purple-700" },
  Chemistry:      { bg: "bg-green-50",  border: "border-green-300",  text: "text-green-700",  badge: "bg-green-100 text-green-700"  },
  English:        { bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", badge: "bg-yellow-100 text-yellow-700" },
  "Computer Sc.": { bg: "bg-cyan-50",   border: "border-cyan-300",   text: "text-cyan-700",   badge: "bg-cyan-100 text-cyan-700"   },
  Biology:        { bg: "bg-rose-50",   border: "border-rose-300",   text: "text-rose-700",   badge: "bg-rose-100 text-rose-700"   },
  History:        { bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", badge: "bg-orange-100 text-orange-700"},
  Break:          { bg: "bg-gray-50",   border: "border-gray-200",   text: "text-gray-400",   badge: "bg-gray-100 text-gray-400"   },
};

const TIMETABLE_DATA = [
  // Monday
  { day: "Monday",    slot: "8:00 AM - 9:00 AM",   subject: "Mathematics",    teacher: "Mr. Sharma",    room: "Room 101" },
  { day: "Monday",    slot: "9:00 AM - 10:00 AM",  subject: "Physics",        teacher: "Ms. Verma",     room: "Lab 201"  },
  { day: "Monday",    slot: "10:00 AM - 11:00 AM", subject: "English",        teacher: "Mrs. Gupta",    room: "Room 103" },
  { day: "Monday",    slot: "11:00 AM - 12:00 PM", subject: "Break",          teacher: "-",             room: "-"        },
  { day: "Monday",    slot: "12:00 PM - 1:00 PM",  subject: "Chemistry",      teacher: "Mr. Yadav",     room: "Lab 202"  },
  { day: "Monday",    slot: "1:00 PM - 2:00 PM",   subject: "Computer Sc.",   teacher: "Ms. Singh",     room: "Lab 301"  },
  { day: "Monday",    slot: "2:00 PM - 3:00 PM",   subject: "Biology",        teacher: "Mr. Joshi",     room: "Room 105" },
  { day: "Monday",    slot: "3:00 PM - 4:00 PM",   subject: "History",        teacher: "Mrs. Tiwari",   room: "Room 106" },
  // Tuesday
  { day: "Tuesday",   slot: "8:00 AM - 9:00 AM",   subject: "Physics",        teacher: "Ms. Verma",     room: "Lab 201"  },
  { day: "Tuesday",   slot: "9:00 AM - 10:00 AM",  subject: "Mathematics",    teacher: "Mr. Sharma",    room: "Room 101" },
  { day: "Tuesday",   slot: "10:00 AM - 11:00 AM", subject: "Chemistry",      teacher: "Mr. Yadav",     room: "Lab 202"  },
  { day: "Tuesday",   slot: "11:00 AM - 12:00 PM", subject: "Break",          teacher: "-",             room: "-"        },
  { day: "Tuesday",   slot: "12:00 PM - 1:00 PM",  subject: "Biology",        teacher: "Mr. Joshi",     room: "Room 105" },
  { day: "Tuesday",   slot: "1:00 PM - 2:00 PM",   subject: "English",        teacher: "Mrs. Gupta",    room: "Room 103" },
  { day: "Tuesday",   slot: "2:00 PM - 3:00 PM",   subject: "History",        teacher: "Mrs. Tiwari",   room: "Room 106" },
  { day: "Tuesday",   slot: "3:00 PM - 4:00 PM",   subject: "Computer Sc.",   teacher: "Ms. Singh",     room: "Lab 301"  },
  // Wednesday
  { day: "Wednesday", slot: "8:00 AM - 9:00 AM",   subject: "English",        teacher: "Mrs. Gupta",    room: "Room 103" },
  { day: "Wednesday", slot: "9:00 AM - 10:00 AM",  subject: "Chemistry",      teacher: "Mr. Yadav",     room: "Lab 202"  },
  { day: "Wednesday", slot: "10:00 AM - 11:00 AM", subject: "Mathematics",    teacher: "Mr. Sharma",    room: "Room 101" },
  { day: "Wednesday", slot: "11:00 AM - 12:00 PM", subject: "Break",          teacher: "-",             room: "-"        },
  { day: "Wednesday", slot: "12:00 PM - 1:00 PM",  subject: "Computer Sc.",   teacher: "Ms. Singh",     room: "Lab 301"  },
  { day: "Wednesday", slot: "1:00 PM - 2:00 PM",   subject: "History",        teacher: "Mrs. Tiwari",   room: "Room 106" },
  { day: "Wednesday", slot: "2:00 PM - 3:00 PM",   subject: "Physics",        teacher: "Ms. Verma",     room: "Lab 201"  },
  { day: "Wednesday", slot: "3:00 PM - 4:00 PM",   subject: "Biology",        teacher: "Mr. Joshi",     room: "Room 105" },
  // Thursday
  { day: "Thursday",  slot: "8:00 AM - 9:00 AM",   subject: "Biology",        teacher: "Mr. Joshi",     room: "Room 105" },
  { day: "Thursday",  slot: "9:00 AM - 10:00 AM",  subject: "History",        teacher: "Mrs. Tiwari",   room: "Room 106" },
  { day: "Thursday",  slot: "10:00 AM - 11:00 AM", subject: "Physics",        teacher: "Ms. Verma",     room: "Lab 201"  },
  { day: "Thursday",  slot: "11:00 AM - 12:00 PM", subject: "Break",          teacher: "-",             room: "-"        },
  { day: "Thursday",  slot: "12:00 PM - 1:00 PM",  subject: "Mathematics",    teacher: "Mr. Sharma",    room: "Room 101" },
  { day: "Thursday",  slot: "1:00 PM - 2:00 PM",   subject: "Chemistry",      teacher: "Mr. Yadav",     room: "Lab 202"  },
  { day: "Thursday",  slot: "2:00 PM - 3:00 PM",   subject: "English",        teacher: "Mrs. Gupta",    room: "Room 103" },
  { day: "Thursday",  slot: "3:00 PM - 4:00 PM",   subject: "Computer Sc.",   teacher: "Ms. Singh",     room: "Lab 301"  },
  // Friday
  { day: "Friday",    slot: "8:00 AM - 9:00 AM",   subject: "Computer Sc.",   teacher: "Ms. Singh",     room: "Lab 301"  },
  { day: "Friday",    slot: "9:00 AM - 10:00 AM",  subject: "Biology",        teacher: "Mr. Joshi",     room: "Room 105" },
  { day: "Friday",    slot: "10:00 AM - 11:00 AM", subject: "History",        teacher: "Mrs. Tiwari",   room: "Room 106" },
  { day: "Friday",    slot: "11:00 AM - 12:00 PM", subject: "Break",          teacher: "-",             room: "-"        },
  { day: "Friday",    slot: "12:00 PM - 1:00 PM",  subject: "English",        teacher: "Mrs. Gupta",    room: "Room 103" },
  { day: "Friday",    slot: "1:00 PM - 2:00 PM",   subject: "Physics",        teacher: "Ms. Verma",     room: "Lab 201"  },
  { day: "Friday",    slot: "2:00 PM - 3:00 PM",   subject: "Mathematics",    teacher: "Mr. Sharma",    room: "Room 101" },
  { day: "Friday",    slot: "3:00 PM - 4:00 PM",   subject: "Chemistry",      teacher: "Mr. Yadav",     room: "Lab 202"  },
  // Saturday
  { day: "Saturday",  slot: "8:00 AM - 9:00 AM",   subject: "Mathematics",    teacher: "Mr. Sharma",    room: "Room 101" },
  { day: "Saturday",  slot: "9:00 AM - 10:00 AM",  subject: "English",        teacher: "Mrs. Gupta",    room: "Room 103" },
  { day: "Saturday",  slot: "10:00 AM - 11:00 AM", subject: "Computer Sc.",   teacher: "Ms. Singh",     room: "Lab 301"  },
  { day: "Saturday",  slot: "11:00 AM - 12:00 PM", subject: "Break",          teacher: "-",             room: "-"        },
  { day: "Saturday",  slot: "12:00 PM - 1:00 PM",  subject: "Physics",        teacher: "Ms. Verma",     room: "Lab 201"  },
  { day: "Saturday",  slot: "1:00 PM - 2:00 PM",   subject: "Chemistry",      teacher: "Mr. Yadav",     room: "Lab 202"  },
  { day: "Saturday",  slot: "2:00 PM - 3:00 PM",   subject: "Biology",        teacher: "Mr. Joshi",     room: "Room 105" },
  { day: "Saturday",  slot: "3:00 PM - 4:00 PM",   subject: "History",        teacher: "Mrs. Tiwari",   room: "Room 106" },
];

const CLASS_OPTIONS   = ["Class 10-A", "Class 10-B", "Class 11-A", "Class 11-B", "Class 12-A", "Class 12-B"];
const SECTION_OPTIONS = ["Section A", "Section B", "Section C"];

// ─── Helper: get cell data for a given day+slot ─────────────────────────────
function getCell(data, day, slot) {
  return data.find((r) => r.day === day && r.slot === slot) || null;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Badge pill */
function Badge({ label, colorClass }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {label}
    </span>
  );
}

/** Stats card at the top */
function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${accent}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

/** Desktop grid cell */
function DesktopCell({ entry }) {
  if (!entry) return <td className="border border-gray-100 p-2 bg-gray-50/40" />;

  const isBreak = entry.subject === "Break";
  const colors  = SUBJECT_COLORS[entry.subject] || SUBJECT_COLORS["Break"];

  if (isBreak) {
    return (
      <td className="border border-gray-100 p-2 text-center align-middle">
        <span className="text-xs text-gray-400 italic font-medium">Break</span>
      </td>
    );
  }

  return (
    <td className={`border border-gray-100 p-2 align-top ${colors.bg}`}>
      <div className={`border-l-2 ${colors.border} pl-2`}>
        <p className={`text-xs font-semibold ${colors.text} leading-tight`}>{entry.subject}</p>
        <p className="text-[10px] text-gray-500 mt-0.5 flex items-center gap-1">
          <User size={9} /> {entry.teacher}
        </p>
        <p className="text-[10px] text-gray-500 flex items-center gap-1">
          <MapPin size={9} /> {entry.room}
        </p>
      </div>
    </td>
  );
}

/** Mobile card for a single period */
function MobilePeriodCard({ entry, slot }) {
  if (!entry) return null;
  const isBreak = entry.subject === "Break";
  const colors  = SUBJECT_COLORS[entry.subject] || SUBJECT_COLORS["Break"];

  return (
    <div className={`rounded-xl border p-3 ${colors.bg} ${colors.border} ${isBreak ? "opacity-60" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${colors.text} truncate`}>{entry.subject}</p>
          {!isBreak && (
            <>
              <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
                <User size={11} className="shrink-0" /> {entry.teacher}
              </p>
              <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                <MapPin size={11} className="shrink-0" /> {entry.room}
              </p>
            </>
          )}
        </div>
        <Badge label={slot.split(" - ")[0]} colorClass={colors.badge} />
      </div>
    </div>
  );
}

/** Accordion for a single day (mobile view) */
function DayAccordion({ day, entries, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  const subjectCount = entries.filter((e) => e && e.subject !== "Break").length;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
            <Calendar size={15} className="text-emerald-600" />
          </div>
          <div>
            <p className="font-semibold text-gray-800 text-sm">{day}</p>
            <p className="text-xs text-gray-500">{subjectCount} classes</p>
          </div>
        </div>
        {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-2 border-t border-gray-50 pt-3">
          {TIME_SLOTS.map((slot) => {
            const entry = entries.find((e) => e.slot === slot);
            return <MobilePeriodCard key={slot} entry={entry || { subject: "Break", teacher: "-", room: "-", slot }} slot={slot} />;
          })}
        </div>
      )}
    </div>
  );
}

// ─── Filters Bar ─────────────────────────────────────────────────────────────

function FiltersBar({ selectedClass, setSelectedClass, selectedSection, setSelectedSection, searchQuery, setSearchQuery, onReset, mobileOpen, setMobileOpen }) {
  return (
    <>
      {/* Mobile filter toggle */}
      <div className="flex items-center gap-2 md:hidden mb-3">
        <div className="flex-1 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search subject, teacher…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={14} />
            </button>
          )}
        </div>
        <button
          onClick={() => setMobileOpen((p) => !p)}
          className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm text-sm font-medium text-gray-700"
        >
          <Filter size={14} /> Filters
        </button>
      </div>

      {/* Mobile filter drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-white rounded-2xl border border-gray-200 shadow-md p-4 mb-3 space-y-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-semibold text-gray-700">Filters</span>
            <button onClick={() => setMobileOpen(false)} className="text-gray-400"><X size={16} /></button>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
              <option value="">All Classes</option>
              {CLASS_OPTIONS.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 font-medium mb-1 block">Section</label>
            <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white">
              <option value="">All Sections</option>
              {SECTION_OPTIONS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={onReset} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
              <RefreshCw size={13} /> Reset
            </button>
            <button onClick={() => setMobileOpen(false)} className="flex-1 px-3 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600">
              Apply
            </button>
          </div>
        </div>
      )}

      {/* Desktop filters */}
      <div className="hidden md:flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search subject, teacher, room…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white shadow-sm"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              <X size={14} />
            </button>
          )}
        </div>

        <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white shadow-sm min-w-[130px]">
          <option value="">All Classes</option>
          {CLASS_OPTIONS.map((c) => <option key={c}>{c}</option>)}
        </select>

        <select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)}
          className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white shadow-sm min-w-[130px]">
          <option value="">All Sections</option>
          {SECTION_OPTIONS.map((s) => <option key={s}>{s}</option>)}
        </select>

        <button onClick={onReset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
          <RefreshCw size={13} /> Reset
        </button>
      </div>
    </>
  );
}

// ─── Desktop Grid Table ───────────────────────────────────────────────────────

function DesktopTable({ data, visibleDays }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="w-full text-sm border-collapse bg-white min-w-[700px]">
        <thead>
          <tr className="bg-gradient-to-r from-emerald-600 to-teal-600">
            <th className="py-3 px-3 text-left text-white font-semibold text-xs w-36 rounded-tl-2xl">
              <div className="flex items-center gap-1.5"><Clock size={13} /> Time Slot</div>
            </th>
            {visibleDays.map((day, i) => (
              <th key={day} className={`py-3 px-3 text-center text-white font-semibold text-xs ${i === visibleDays.length - 1 ? "rounded-tr-2xl" : ""}`}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TIME_SLOTS.map((slot, si) => (
            <tr key={slot} className={si % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
              <td className="border border-gray-100 px-3 py-2.5">
                <div className="flex items-center gap-1.5">
                  <Clock size={11} className="text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-medium text-gray-600 leading-tight">{slot}</span>
                </div>
              </td>
              {visibleDays.map((day) => (
                <DesktopCell key={day} entry={getCell(data, day, slot)} />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Day Tab selector (mobile) ────────────────────────────────────────────────

function DayTabs({ selectedDay, setSelectedDay, days }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
      {["All", ...days].map((day) => (
        <button
          key={day}
          onClick={() => setSelectedDay(day)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            selectedDay === day
              ? "bg-emerald-500 text-white shadow-sm"
              : "bg-white border border-gray-200 text-gray-600 hover:border-emerald-300"
          }`}
        >
          {day === "All" ? "All Days" : day.slice(0, 3)}
        </button>
      ))}
    </div>
  );
}

// ─── Legend ──────────────────────────────────────────────────────────────────

function Legend() {
  const subjects = Object.entries(SUBJECT_COLORS).filter(([k]) => k !== "Break");
  return (
    <div className="flex flex-wrap gap-2">
      {subjects.map(([subj, colors]) => (
        <span key={subj} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${colors.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${colors.border.replace("border-", "bg-")}`} />
          {subj}
        </span>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Timetable() {
  const [selectedClass,   setSelectedClass]   = useState("Class 10-A");
  const [selectedSection, setSelectedSection] = useState("Section A");
  const [searchQuery,     setSearchQuery]     = useState("");
  const [viewMode,        setViewMode]        = useState("grid"); // "grid" | "list"
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [mobileDay,       setMobileDay]       = useState("All");

  /* Filter timetable data */
  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return TIMETABLE_DATA.filter((row) => {
      if (!q) return true;
      return (
        row.subject.toLowerCase().includes(q) ||
        row.teacher.toLowerCase().includes(q) ||
        row.room.toLowerCase().includes(q) ||
        row.day.toLowerCase().includes(q)
      );
    });
  }, [searchQuery]);

  /* Days that still have data after search */
  const visibleDays = useMemo(() => {
    if (!searchQuery) return DAYS;
    return DAYS.filter((day) => filteredData.some((r) => r.day === day));
  }, [filteredData, searchQuery]);

  /* Mobile: days to show */
  const mobileDays = mobileDay === "All" ? visibleDays : visibleDays.filter((d) => d === mobileDay);

  const handleReset = useCallback(() => {
    setSelectedClass("Class 10-A");
    setSelectedSection("Section A");
    setSearchQuery("");
    setMobileDay("All");
  }, []);

  const totalPeriods  = filteredData.filter((r) => r.subject !== "Break").length;
  const uniqueSubjects = [...new Set(filteredData.filter((r) => r.subject !== "Break").map((r) => r.subject))].length;
  const uniqueTeachers = [...new Set(filteredData.filter((r) => r.teacher !== "-").map((r) => r.teacher))].length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-10">
        <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md">
              <Clock size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-gray-800 leading-tight">Time Table</h1>
              <p className="text-xs text-gray-500 hidden sm:block">
                {selectedClass} &bull; {selectedSection}
              </p>
            </div>
          </div>

          {/* View toggle — desktop */}
          <div className="hidden md:flex items-center gap-1.5 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "grid" ? "bg-white shadow-sm text-emerald-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <LayoutGrid size={14} /> Grid
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === "list" ? "bg-white shadow-sm text-emerald-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <AlignJustify size={14} /> List
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-5 space-y-5">

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={GraduationCap}  label="Class"     value={selectedClass}   accent="bg-emerald-500" />
          <StatCard icon={BookOpen}        label="Subjects"  value={`${uniqueSubjects} Subjects`} accent="bg-blue-500" />
          <StatCard icon={User}            label="Teachers"  value={`${uniqueTeachers} Teachers`} accent="bg-purple-500" />
          <StatCard icon={Clock}           label="Periods"   value={`${totalPeriods} Periods`}    accent="bg-orange-500" />
        </div>

        {/* ── Filters ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <FiltersBar
            selectedClass={selectedClass}     setSelectedClass={setSelectedClass}
            selectedSection={selectedSection} setSelectedSection={setSelectedSection}
            searchQuery={searchQuery}         setSearchQuery={setSearchQuery}
            onReset={handleReset}
            mobileOpen={mobileFilterOpen}     setMobileOpen={setMobileFilterOpen}
          />
        </div>

        {/* ── Legend ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3">
          <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Subject Legend</p>
          <Legend />
        </div>

        {/* ── DESKTOP: Grid / List view ── */}
        <div className="hidden md:block">
          {filteredData.length === 0 ? (
            <EmptyState onReset={handleReset} />
          ) : viewMode === "grid" ? (
            <DesktopTable data={filteredData} visibleDays={visibleDays} />
          ) : (
            <ListView data={filteredData} visibleDays={visibleDays} />
          )}
        </div>

        {/* ── MOBILE: Day tabs + Accordion ── */}
        <div className="md:hidden space-y-3">
          <DayTabs selectedDay={mobileDay} setSelectedDay={setMobileDay} days={visibleDays} />

          {filteredData.length === 0 ? (
            <EmptyState onReset={handleReset} />
          ) : (
            mobileDays.map((day, i) => {
              const dayEntries = filteredData.filter((r) => r.day === day);
              return (
                <DayAccordion
                  key={day}
                  day={day}
                  entries={dayEntries}
                  defaultOpen={i === 0}
                />
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

// ─── List View (desktop alternate) ───────────────────────────────────────────

function ListView({ data }) {
  const sorted = [...data].sort((a, b) => {
    const di = DAYS.indexOf(a.day) - DAYS.indexOf(b.day);
    if (di !== 0) return di;
    return TIME_SLOTS.indexOf(a.slot) - TIME_SLOTS.indexOf(b.slot);
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
            <th className="px-4 py-3 text-left text-xs font-semibold rounded-tl-2xl">Day</th>
            <th className="px-4 py-3 text-left text-xs font-semibold">Time</th>
            <th className="px-4 py-3 text-left text-xs font-semibold">Subject</th>
            <th className="px-4 py-3 text-left text-xs font-semibold">Teacher</th>
            <th className="px-4 py-3 text-left text-xs font-semibold rounded-tr-2xl">Room</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => {
            const isBreak = row.subject === "Break";
            const colors  = SUBJECT_COLORS[row.subject] || SUBJECT_COLORS["Break"];
            return (
              <tr key={i} className={`border-t border-gray-50 hover:bg-gray-50/70 transition-colors ${isBreak ? "opacity-50" : ""}`}>
                <td className="px-4 py-2.5 text-xs font-semibold text-gray-700">{row.day}</td>
                <td className="px-4 py-2.5 text-xs text-gray-500">{row.slot}</td>
                <td className="px-4 py-2.5">
                  <Badge label={row.subject} colorClass={colors.badge} />
                </td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{row.teacher}</td>
                <td className="px-4 py-2.5 text-xs text-gray-600">{row.room}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onReset }) {
  return (
    <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
        <Search size={24} className="text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-700 mb-1">No results found</h3>
      <p className="text-sm text-gray-500 mb-4">No timetable entries match your search. Try different keywords.</p>
      <button onClick={onReset} className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 transition-colors">
        <RefreshCw size={14} /> Reset Filters
      </button>
    </div>
  );
}
