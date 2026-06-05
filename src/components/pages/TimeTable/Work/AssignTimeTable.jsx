import { useState, useCallback, useMemo } from "react";
import {
  Clock, BookOpen, Users, ChevronDown, ChevronUp,
  RefreshCw, CheckSquare, Square, Save, Calendar,
  GraduationCap, User, AlertCircle, CheckCircle2,
  BookMarked, X, ChevronRight
} from "lucide-react";

// ─── DUMMY DATA ────────────────────────────────────────────────────────────────
const CLASSES = [
  { value: "0", label: "— Select Class —" },
  { value: "c1", label: "Class 10 - A" },
  { value: "c2", label: "Class 10 - B" },
  { value: "c3", label: "Class 11 - Science" },
  { value: "c4", label: "Class 11 - Commerce" },
  { value: "c5", label: "Class 12 - Science" },
];

const FACULTIES = [
  { value: "0", label: "— Select Faculty —" },
  { value: "f1", label: "Dr. Ramesh Kumar" },
  { value: "f2", label: "Mrs. Priya Sharma" },
  { value: "f3", label: "Mr. Anil Verma" },
  { value: "f4", label: "Ms. Sunita Patel" },
];

const TIMETABLES = [
  { value: "0", label: "— Select Time Table —" },
  { value: "tt1", label: "Morning Shift (8:00 AM – 2:00 PM)" },
  { value: "tt2", label: "Afternoon Shift (12:00 PM – 6:00 PM)" },
  { value: "tt3", label: "Full Day (8:00 AM – 4:00 PM)" },
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const SUBJECTS = [
  { value: "0", label: "— Subject —" },
  { value: "s1", label: "Mathematics" },
  { value: "s2", label: "Physics" },
  { value: "s3", label: "Chemistry" },
  { value: "s4", label: "English" },
  { value: "s5", label: "Hindi" },
  { value: "s6", label: "Biology" },
  { value: "s7", label: "Computer Sc." },
];

const FACULTY_OPTS = [
  { value: "0", label: "— Faculty —" },
  { value: "f1", label: "Dr. R. Kumar" },
  { value: "f2", label: "Mrs. P. Sharma" },
  { value: "f3", label: "Mr. A. Verma" },
  { value: "f4", label: "Ms. S. Patel" },
];

// Timetable periods data
const PERIODS = [
  { id: "p1", lecture_name: "Period 1", Tim: "8:00 AM – 8:45 AM", Break_Time: "", TT_ID: "tt1" },
  { id: "p2", lecture_name: "Period 2", Tim: "8:45 AM – 9:30 AM", Break_Time: "", TT_ID: "tt1" },
  { id: "p3", lecture_name: "Break", Tim: "9:30 AM – 9:45 AM", Break_Time: "Short Break (15 min)", TT_ID: "tt1" },
  { id: "p4", lecture_name: "Period 3", Tim: "9:45 AM – 10:30 AM", Break_Time: "", TT_ID: "tt1" },
  { id: "p5", lecture_name: "Period 4", Tim: "10:30 AM – 11:15 AM", Break_Time: "", TT_ID: "tt1" },
  { id: "p6", lecture_name: "Lunch", Tim: "11:15 AM – 12:00 PM", Break_Time: "Lunch Break (45 min)", TT_ID: "tt1" },
  { id: "p7", lecture_name: "Period 5", Tim: "12:00 PM – 12:45 PM", Break_Time: "", TT_ID: "tt1" },
  { id: "p8", lecture_name: "Period 6", Tim: "12:45 PM – 1:30 PM", Break_Time: "", TT_ID: "tt1" },
];

// ─── SMALL REUSABLE COMPONENTS ─────────────────────────────────────────────────

const SelectField = ({ label, value, onChange, options, icon: Icon, error }) => (
  <div className="flex flex-col gap-1">
    {label && (
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
        {Icon && <Icon size={12} />}
        {label}
      </label>
    )}
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full appearance-none bg-white border rounded-lg px-3 py-2.5 pr-9 text-sm font-medium text-slate-700 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 cursor-pointer
          ${error ? "border-red-400 ring-1 ring-red-300" : "border-slate-200 hover:border-slate-300"}`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
    {error && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={11} />{error}</p>}
  </div>
);

const Toast = ({ msg, type, onClose }) => (
  <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium transition-all
    ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-500 text-white"}`}>
    {type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
    <span>{msg}</span>
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100"><X size={14} /></button>
  </div>
);

const ConfirmModal = ({ msg, onYes, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-slate-100">
      <div className="flex items-start gap-3 mb-5">
        <div className="bg-amber-100 rounded-full p-2 mt-0.5">
          <AlertCircle size={20} className="text-amber-600" />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 text-base">Confirm Action</h3>
          <p className="text-slate-500 text-sm mt-1">{msg}</p>
        </div>
      </div>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
          Cancel
        </button>
        <button onClick={onYes}
          className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 transition-colors">
          Yes, Proceed
        </button>
      </div>
    </div>
  </div>
);

// ─── PERIOD ROW (Class-wise) ────────────────────────────────────────────────────
const PeriodRowClassWise = ({ period, assignments, onSubjectChange, onFacultyChange, onReset }) => {
  const isBreak = !!period.Break_Time;
  const assign = assignments[period.id] || { subject: "0", faculty: "0" };

  if (isBreak) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl mb-2">
        <div className="bg-amber-200 rounded-full p-1.5">
          <Clock size={14} className="text-amber-700" />
        </div>
        <div>
          <span className="font-bold text-amber-800 text-sm">{period.Break_Time}</span>
          <span className="text-amber-600 text-xs ml-2">({period.Tim})</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl mb-2 shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-100 rounded-lg p-1.5">
            <BookOpen size={14} className="text-emerald-700" />
          </div>
          <span className="font-bold text-slate-700 text-sm">{period.lecture_name}</span>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          {period.Tim}
        </span>
      </div>
      {/* Body */}
      <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <SelectField
          label="Subject"
          value={assign.subject}
          onChange={(v) => onSubjectChange(period.id, v)}
          options={SUBJECTS}
          icon={BookMarked}
        />
        <SelectField
          label="Faculty"
          value={assign.faculty}
          onChange={(v) => onFacultyChange(period.id, v)}
          options={FACULTY_OPTS}
          icon={User}
        />
        <div className="flex items-end">
          <button
            onClick={() => onReset(period.id)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-500 text-sm font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors w-full sm:w-auto justify-center"
          >
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── PERIOD ROW (Faculty-wise) ──────────────────────────────────────────────────
const PeriodRowFacultyWise = ({ period, assignments, onClassChange, onSubjectChange, onReset }) => {
  const isBreak = !!period.Break_Time;
  const assign = assignments[period.id] || { classVal: "0", subject: "0" };

  if (isBreak) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl mb-2">
        <Clock size={14} className="text-amber-700" />
        <span className="font-bold text-amber-800 text-sm">{period.Break_Time}</span>
        <span className="text-amber-600 text-xs">({period.Tim})</span>
      </div>
    );
  }

  const classOptions = [
    { value: "0", label: "— Class —" },
    ...CLASSES.slice(1),
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl mb-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="bg-blue-100 rounded-lg p-1.5">
            <BookOpen size={14} className="text-blue-700" />
          </div>
          <span className="font-bold text-slate-700 text-sm">{period.lecture_name}</span>
        </div>
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">{period.Tim}</span>
      </div>
      <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
        <SelectField label="Class" value={assign.classVal} onChange={(v) => onClassChange(period.id, v)} options={classOptions} icon={GraduationCap} />
        <SelectField label="Subject" value={assign.subject} onChange={(v) => onSubjectChange(period.id, v)} options={SUBJECTS} icon={BookMarked} />
        <div className="flex items-end">
          <button onClick={() => onReset(period.id)}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-slate-200 text-slate-500 text-sm font-medium hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors w-full sm:w-auto justify-center">
            <RefreshCw size={13} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── DAY ACCORDION (for Class-wise multi-day) ──────────────────────────────────
const DayAccordion = ({ day, assignments, onSubjectChange, onFacultyChange, onReset, periods }) => {
  const [open, setOpen] = useState(true);
  const filledCount = useMemo(() =>
    periods.filter(p => !p.Break_Time && assignments[`${day}_${p.id}`]?.subject !== "0").length,
    [assignments, day, periods]
  );
  const totalPeriods = periods.filter(p => !p.Break_Time).length;

  return (
    <div className="mb-3 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white"
      >
        <div className="flex items-center gap-2.5">
          <Calendar size={16} />
          <span className="font-bold text-sm">{day}</span>
          <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
            {filledCount}/{totalPeriods} assigned
          </span>
        </div>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="p-3 bg-slate-50">
          {periods.map(p => (
            <PeriodRowClassWise
              key={p.id}
              period={p}
              assignments={Object.fromEntries(
                Object.entries(assignments)
                  .filter(([k]) => k.startsWith(`${day}_`))
                  .map(([k, v]) => [k.replace(`${day}_`, ""), v])
              )}
              onSubjectChange={(pid, v) => onSubjectChange(`${day}_${pid}`, v)}
              onFacultyChange={(pid, v) => onFacultyChange(`${day}_${pid}`, v)}
              onReset={(pid) => onReset(`${day}_${pid}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────
export default function AssignTimeTable() {
  const [type, setType] = useState("Class Wise");
  const [selectedClass, setSelectedClass] = useState("0");
  const [selectedFaculty, setSelectedFaculty] = useState("0");
  const [selectedTimetable, setSelectedTimetable] = useState("0");
  const [selectedDays, setSelectedDays] = useState([]);
  const [facultyDay, setFacultyDay] = useState("0");
  const [showGrid, setShowGrid] = useState(false);
  const [assignments, setAssignments] = useState({});
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Validate show form
  const validate = () => {
    const errs = {};
    if (type === "Class Wise" && selectedClass === "0") errs.class = "Please select a class";
    if (type === "Faculty Wise" && selectedFaculty === "0") errs.faculty = "Please select a faculty";
    if (selectedTimetable === "0") errs.timetable = "Please select a time table";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleShow = () => {
    if (!validate()) return;
    setShowGrid(true);
    setAssignments({});
    setSubmitted(false);
  };

  const toggleDay = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const toggleAllDays = () => {
    setSelectedDays(prev => prev.length === DAYS.length ? [] : [...DAYS]);
  };

  const handleSubjectChange = useCallback((key, val) => {
    setAssignments(prev => ({
      ...prev,
      [key]: { ...prev[key], subject: val }
    }));
  }, []);

  const handleFacultyChange = useCallback((key, val) => {
    setAssignments(prev => ({
      ...prev,
      [key]: { ...prev[key], faculty: val }
    }));
  }, []);

  const handleClassChange = useCallback((key, val) => {
    setAssignments(prev => ({
      ...prev,
      [key]: { ...prev[key], classVal: val }
    }));
  }, []);

  const handleReset = useCallback((key) => {
    setAssignments(prev => {
      const n = { ...prev };
      delete n[key];
      return n;
    });
  }, []);

  const handleSubmit = () => {
    setConfirmModal({
      msg: "Are you sure you want to save this timetable assignment? This will overwrite any existing assignment.",
      onYes: () => {
        setConfirmModal(null);
        setSubmitted(true);
        showToast("Timetable assigned successfully!", "success");
      },
      onCancel: () => setConfirmModal(null)
    });
  };

  // Which days/periods to show
  const activeDays = type === "Class Wise"
    ? (selectedDays.length ? selectedDays : [])
    : (facultyDay !== "0" ? [facultyDay] : []);

  const FACULTY_DAY_OPTIONS = [
    { value: "0", label: "— Select Day —" },
    ...DAYS.map(d => ({ value: d, label: d }))
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-emerald-50 font-[system-ui]">
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirmModal && <ConfirmModal msg={confirmModal.msg} onYes={confirmModal.onYes} onCancel={confirmModal.onCancel} />}

      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="bg-emerald-600 rounded-xl p-2">
            <Calendar size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-800 text-base leading-tight">Define Time Table</h1>
            <nav className="flex items-center gap-1 text-xs text-slate-400">
              <span>Home</span>
              <ChevronRight size={12} />
              <span className="text-emerald-600 font-medium">Define Time Table</span>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-5 space-y-5">

        {/* ── Filter Card ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
            <div className="bg-emerald-100 rounded-lg p-1.5">
              <Calendar size={16} className="text-emerald-700" />
            </div>
            <h2 className="font-bold text-slate-700 text-sm">Configuration</h2>
          </div>

          <div className="p-5 space-y-5">
            {/* Type Toggle */}
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Users size={12} /> Type
              </p>
              <div className="flex gap-2 flex-wrap">
                {["Class Wise", "Faculty Wise"].map(t => (
                  <button
                    key={t}
                    onClick={() => { setType(t); setShowGrid(false); setErrors({}); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold border transition-all
                      ${type === t
                        ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200"
                        : "bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-600"
                      }`}
                  >
                    {t === "Class Wise" ? <GraduationCap size={15} /> : <User size={15} />}
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Class / Faculty + TimeTable row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {type === "Class Wise" ? (
                <SelectField
                  label="Class"
                  value={selectedClass}
                  onChange={v => { setSelectedClass(v); setShowGrid(false); }}
                  options={CLASSES}
                  icon={GraduationCap}
                  error={errors.class}
                />
              ) : (
                <SelectField
                  label="Faculty"
                  value={selectedFaculty}
                  onChange={v => { setSelectedFaculty(v); setShowGrid(false); }}
                  options={FACULTIES}
                  icon={User}
                  error={errors.faculty}
                />
              )}
              <SelectField
                label="Time Table"
                value={selectedTimetable}
                onChange={v => { setSelectedTimetable(v); setShowGrid(false); }}
                options={TIMETABLES}
                icon={Clock}
                error={errors.timetable}
              />
            </div>

            {/* Days Section — Class Wise */}
            {type === "Class Wise" && (
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar size={12} /> For Days
                  </p>
                  <button
                    onClick={toggleAllDays}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    {selectedDays.length === DAYS.length ? <CheckSquare size={14} /> : <Square size={14} />}
                    {selectedDays.length === DAYS.length ? "Deselect All" : "Select All"}
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {DAYS.map(day => {
                    const active = selectedDays.includes(day);
                    return (
                      <button
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold border transition-all
                          ${active
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-slate-50 text-slate-500 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                      >
                        {active ? <CheckSquare size={12} /> : <Square size={12} />}
                        {day.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Day dropdown — Faculty Wise */}
            {type === "Faculty Wise" && (
              <div className="sm:w-48">
                <SelectField
                  label="Day"
                  value={facultyDay}
                  onChange={v => { setFacultyDay(v); setShowGrid(false); }}
                  options={FACULTY_DAY_OPTIONS}
                  icon={Calendar}
                />
              </div>
            )}

            {/* Show Button */}
            <div className="pt-1">
              <button
                onClick={handleShow}
                className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all"
              >
                <BookOpen size={15} />
                Show Timetable
              </button>
            </div>
          </div>
        </div>

        {/* ── Timetable Grid ── */}
        {showGrid && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-teal-100 rounded-lg p-1.5">
                  <Clock size={16} className="text-teal-700" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-700 text-sm">Timetable Assignment</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {type === "Class Wise"
                      ? `${CLASSES.find(c => c.value === selectedClass)?.label} • ${TIMETABLES.find(t => t.value === selectedTimetable)?.label}`
                      : `${FACULTIES.find(f => f.value === selectedFaculty)?.label} • ${TIMETABLES.find(t => t.value === selectedTimetable)?.label}`
                    }
                  </p>
                </div>
              </div>
              {submitted && (
                <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-semibold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                  <CheckCircle2 size={13} /> Saved
                </span>
              )}
            </div>

            <div className="p-4">
              {/* Class Wise: Show per selected day with accordion */}
              {type === "Class Wise" ? (
                activeDays.length === 0 ? (
                  <div className="text-center py-12 text-slate-400">
                    <Calendar size={36} className="mx-auto mb-3 opacity-40" />
                    <p className="font-semibold text-sm">No days selected</p>
                    <p className="text-xs mt-1">Please select at least one day above</p>
                  </div>
                ) : (
                  activeDays.map(day => (
                    <DayAccordion
                      key={day}
                      day={day}
                      periods={PERIODS}
                      assignments={assignments}
                      onSubjectChange={handleSubjectChange}
                      onFacultyChange={handleFacultyChange}
                      onReset={handleReset}
                    />
                  ))
                )
              ) : (
                /* Faculty Wise: single day */
                facultyDay === "0" ? (
                  <div className="text-center py-12 text-slate-400">
                    <Calendar size={36} className="mx-auto mb-3 opacity-40" />
                    <p className="font-semibold text-sm">No day selected</p>
                    <p className="text-xs mt-1">Please select a day to view periods</p>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2.5 mb-4 px-1">
                      <div className="bg-blue-100 rounded-lg p-1.5">
                        <Calendar size={14} className="text-blue-700" />
                      </div>
                      <span className="font-bold text-slate-700 text-sm">{facultyDay}</span>
                    </div>
                    {PERIODS.map(p => (
                      <PeriodRowFacultyWise
                        key={p.id}
                        period={p}
                        assignments={assignments}
                        onClassChange={handleClassChange}
                        onSubjectChange={handleSubjectChange}
                        onReset={handleReset}
                      />
                    ))}
                  </div>
                )
              )}
            </div>

            {/* Submit Footer */}
            {(type === "Class Wise" ? activeDays.length > 0 : facultyDay !== "0") && (
              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 flex-wrap">
                <p className="text-xs text-slate-500">Review all assignments before saving.</p>
                <button
                  onClick={handleSubmit}
                  className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all"
                >
                  <Save size={15} />
                  Submit Timetable
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty state before Show is clicked */}
        {!showGrid && (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 py-16 text-center text-slate-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold text-sm">Configure and click <strong className="text-emerald-600">Show Timetable</strong></p>
            <p className="text-xs mt-1">Select type, class/faculty, timetable and days to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}
