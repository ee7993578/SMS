import { useState } from "react";
import {
  ChevronRight, Phone, CalendarDays, ArrowRight,
  RefreshCw, AlertCircle, CheckCircle2, ExternalLink,
} from "lucide-react";

// ─── Dummy Data ────────────────────────────────────────────────────────────────

const SESSIONS = ["2024-25", "2023-24", "2022-23", "2021-22"];

// Simulated student lookup by mobile
const STUDENT_DB = {
  "9876543210": { name: "Aarav Sharma", admissionNo: "ADM2024001", class: "Class 5", section: "A" },
  "9812345678": { name: "Priya Singh", admissionNo: "ADM2024002", class: "Class 7", section: "B" },
  "9898989898": { name: "Rohan Gupta", admissionNo: "ADM2023015", class: "Class 3", section: "C" },
};

// ─── Main Component ────────────────────────────────────────────────────────────

export default function RegistrationRedirection() {
  const [session, setSession] = useState("2024-25");
  const [mobile, setMobile] = useState("");
  const [mobileError, setMobileError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // null | "found" | "notfound"
  const [foundStudent, setFoundStudent] = useState(null);

  // Validation
  const validate = () => {
    if (!mobile.trim()) {
      setMobileError("Mobile number is required.");
      return false;
    }
    if (!/^\d{10}$/.test(mobile.trim())) {
      setMobileError("Enter a valid 10-digit mobile number.");
      return false;
    }
    setMobileError("");
    return true;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    setLoading(true);
    setResult(null);
    setFoundStudent(null);

    // Simulate API call
    setTimeout(() => {
      const student = STUDENT_DB[mobile.trim()];
      if (student) {
        setFoundStudent(student);
        setResult("found");
      } else {
        setResult("notfound");
      }
      setLoading(false);
    }, 700);
  };

  const handleReset = () => {
    setSession("2024-25");
    setMobile("");
    setMobileError("");
    setResult(null);
    setFoundStudent(null);
  };

  const handleRedirect = () => {
    // Placeholder: navigate to registration page with pre-filled mobile
    alert(`Redirecting to Registration page for mobile: ${mobile}\nSession: ${session}`);
  };

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <nav className="flex items-center gap-1 text-xs text-slate-400 mb-1">
            <span>Home</span>
            <ChevronRight size={11} />
            <span>Reports</span>
            <ChevronRight size={11} />
            <span className="text-blue-600 font-medium">Registration Redirection</span>
          </nav>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center">
              <ArrowRight size={15} className="text-white" />
            </div>
            <h1 className="text-lg font-bold text-slate-800">Registration Redirection</h1>
          </div>
        </div>
      </div>

      {/* ── Main Card ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
            <ExternalLink size={16} className="text-blue-600" />
            <h2 className="text-sm font-semibold text-slate-700">Registration Redirection Page</h2>
          </div>

          {/* Form Body */}
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Session */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  <span className="flex items-center gap-1">
                    <CalendarDays size={12} className="text-slate-400" />
                    Select Session
                  </span>
                </label>
                <select
                  value={session}
                  onChange={(e) => setSession(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl text-sm text-slate-700 px-3 py-2.5 bg-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  {SESSIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                  <span className="flex items-center gap-1">
                    <Phone size={12} className="text-slate-400" />
                    Phone Number
                  </span>
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setMobile(val);
                    if (mobileError) setMobileError("");
                  }}
                  placeholder="Enter 10-digit mobile number"
                  className={`w-full border rounded-xl text-sm text-slate-700 px-3 py-2.5 bg-white outline-none focus:ring-2 transition placeholder:text-slate-300
                    ${mobileError
                      ? "border-rose-400 focus:ring-rose-300 bg-rose-50"
                      : "border-slate-200 focus:ring-blue-500 focus:border-blue-500"}`}
                />
                {mobileError && (
                  <p className="flex items-center gap-1 mt-1.5 text-xs text-rose-600">
                    <AlertCircle size={11} />
                    {mobileError}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition shadow-sm disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
            >
              {loading
                ? <><RefreshCw size={14} className="animate-spin" /> Searching...</>
                : <><ArrowRight size={14} /> Submit</>}
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-5 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium rounded-xl hover:bg-slate-100 active:scale-95 transition w-full sm:w-auto"
            >
              <RefreshCw size={13} /> Reset
            </button>
          </div>
        </div>

        {/* ── Result Card ── */}
        {result === "found" && foundStudent && (
          <div className="mt-4 bg-white rounded-2xl border border-emerald-200 shadow-sm overflow-hidden animate-in fade-in">
            {/* Result header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-emerald-50 border-b border-emerald-100">
              <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Student Found</p>
                <p className="text-xs text-emerald-600">Mobile matched with an existing record</p>
              </div>
            </div>

            {/* Student info grid */}
            <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Student Name", value: foundStudent.name },
                { label: "Admission No", value: foundStudent.admissionNo },
                { label: "Class", value: foundStudent.class },
                { label: "Section", value: foundStudent.section },
              ].map(({ label, value }) => (
                <div key={label} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">{label}</p>
                  <p className="text-sm font-semibold text-slate-800">{value}</p>
                </div>
              ))}
            </div>

            {/* Redirect action */}
            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={handleRedirect}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 active:scale-95 transition shadow-sm"
              >
                <ExternalLink size={14} />
                Proceed to Registration
              </button>
            </div>
          </div>
        )}

        {result === "notfound" && (
          <div className="mt-4 bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
            <div className="flex items-start gap-3 px-5 py-4 bg-amber-50">
              <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <AlertCircle size={18} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">No Record Found</p>
                <p className="text-xs text-amber-600 mt-0.5">
                  No student found with mobile <span className="font-semibold">{mobile}</span> in session <span className="font-semibold">{session}</span>.
                </p>
              </div>
            </div>
            <div className="px-5 py-4 border-t border-amber-100">
              <button
                type="button"
                onClick={handleRedirect}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 active:scale-95 transition shadow-sm"
              >
                <ExternalLink size={14} />
                Go to New Registration
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
