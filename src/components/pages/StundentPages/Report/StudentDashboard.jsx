import { useState } from "react";
import {
  User,
  Phone,
  BookOpen,
  Award,
  Home,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Users,
  Calendar,
  CreditCard,
  Droplets,
  Mail,
  Smartphone,
  MapPin,
  Shield,
  GraduationCap,
  BarChart2,
  Star,
} from "lucide-react";

// ─── Static / Dummy Data ──────────────────────────────────────────────────────
const studentData = {
  id: "STU-2024-0042",
  name: "Aryan Sharma",
  admissionNo: "ADM/2021/1089",
  dateOfAdmission: "12 Apr 2021",
  classTeacher: "Mrs. Priya Mehta",
  parentId: "PAR-2024-0042",
  class: "10 - A",
  fatherName: "Rajesh Sharma",
  motherName: "Sunita Sharma",
  activity: "Cricket, Debate Club",
  email: "aryan.sharma@school.edu",
  mobile: "+91 98765 43210",
  house: "Tagore House",
  address: "42, Sector 15, Meerut, Uttar Pradesh - 250001",
  bloodGroup: "B+",
  dob: "15 Aug 2009",
  aadharCard: "XXXX-XXXX-4321",
  bankAcc: "XXXX-XXXX-6789",
  ifscCode: "SBI0001234",
  optionalSubjects: "Computer Science, Physical Education",
  overallClassRank: 3,
  overallSectionRank: 1,
  photo: null, // placeholder
};

const academicData = [
  { subject: "Mathematics", marks: 92, max: 100, grade: "A+" },
  { subject: "Science", marks: 88, max: 100, grade: "A" },
  { subject: "English", marks: 85, max: 100, grade: "A" },
  { subject: "Social Studies", marks: 78, max: 100, grade: "B+" },
  { subject: "Computer Science", marks: 95, max: 100, grade: "A+" },
  { subject: "Physical Education", marks: 90, max: 100, grade: "A+" },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Coloured progress bar for academic subjects */
function SubjectBar({ subject, marks, max, grade }) {
  const pct = Math.round((marks / max) * 100);
  const color =
    pct >= 90
      ? "bg-emerald-500"
      : pct >= 75
      ? "bg-blue-500"
      : pct >= 60
      ? "bg-amber-500"
      : "bg-red-500";

  return (
    <div className="py-3 border-b border-slate-100 last:border-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-slate-700">{subject}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            {marks}/{max}
          </span>
          <span
            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              pct >= 90
                ? "bg-emerald-100 text-emerald-700"
                : pct >= 75
                ? "bg-blue-100 text-blue-700"
                : pct >= 60
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {grade}
          </span>
        </div>
      </div>
      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

/** Single info row used inside profile cards */
function InfoRow({ icon: Icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className="mt-0.5 flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
        <Icon size={14} className="text-indigo-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide leading-none mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm font-semibold truncate ${
            highlight ? "text-indigo-600" : "text-slate-800"
          }`}
        >
          {value || "—"}
        </p>
      </div>
    </div>
  );
}

/** Collapsible card used on mobile */
function AccordionCard({ title, icon: Icon, iconColor = "text-indigo-500", children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center`}>
            <Icon size={16} className={iconColor} />
          </div>
          <span className="font-semibold text-slate-800 text-sm">{title}</span>
        </div>
        {open ? (
          <ChevronUp size={16} className="text-slate-400" />
        ) : (
          <ChevronDown size={16} className="text-slate-400" />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

/** Rank badge pill */
function RankBadge({ label, rank }) {
  return (
    <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow-sm border border-slate-100">
      <Star size={14} className="text-amber-400 fill-amber-400" />
      <span className="text-xs text-slate-500 font-medium">{label}</span>
      <span className="text-sm font-bold text-slate-800">#{rank}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentDashboard() {
  const s = studentData;
  const avgMarks = Math.round(
    academicData.reduce((a, b) => a + b.marks, 0) / academicData.length
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Top Header ── */}
      <div className="bg-gradient-to-r from-indigo-700 to-indigo-500 px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <GraduationCap size={18} className="text-indigo-200" />
            <span className="text-indigo-200 text-xs font-medium uppercase tracking-widest">
              Student Portal
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Student Dashboard
          </h1>
          <p className="text-indigo-200 text-sm mt-0.5">Academic Year 2024–25</p>
        </div>
      </div>

      {/* ── Profile Hero Card (overlaps header) ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {s.photo ? (
              <img
                src={s.photo}
                alt={s.name}
                className="w-20 h-20 rounded-2xl object-cover border-4 border-indigo-100"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-indigo-100 flex items-center justify-center">
                <User size={36} className="text-indigo-400" />
              </div>
            )}
          </div>

          {/* Name + Meta */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-bold text-slate-900">{s.name}</h2>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-1.5">
              <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2.5 py-1 rounded-lg">
                {s.class}
              </span>
              <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2.5 py-1 rounded-lg">
                ID: {s.id}
              </span>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-1 rounded-lg">
                {s.house}
              </span>
            </div>
          </div>

          {/* Rank Badges */}
          <div className="flex sm:flex-col gap-2 flex-wrap justify-center">
            <RankBadge label="Class Rank" rank={s.overallClassRank} />
            <RankBadge label="Section Rank" rank={s.overallSectionRank} />
          </div>
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Avg. Marks", value: `${avgMarks}%`, icon: BarChart2, color: "text-blue-500", bg: "bg-blue-50" },
          { label: "Subjects", value: academicData.length, icon: BookOpen, color: "text-indigo-500", bg: "bg-indigo-50" },
          { label: "Top Grade", value: "A+", icon: Award, color: "text-amber-500", bg: "bg-amber-50" },
          { label: "Attendance", value: "94%", icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3"
          >
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">{label}</p>
              <p className="text-lg font-bold text-slate-800 leading-tight">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-5 pb-10">

        {/* DESKTOP: 3-column grid | MOBILE: stacked accordions */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-5">

          {/* Col 1 – Student + Guardian Info */}
          <div className="space-y-5">
            {/* Student Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <User size={16} className="text-indigo-500" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Student Info</h3>
              </div>
              <InfoRow icon={Shield} label="Student ID" value={s.id} highlight />
              <InfoRow icon={User} label="Student Name" value={s.name} />
              <InfoRow icon={CreditCard} label="Admission No" value={s.admissionNo} />
              <InfoRow icon={Calendar} label="Date of Admission" value={s.dateOfAdmission} />
              <InfoRow icon={Users} label="Class Teacher" value={s.classTeacher} />
            </div>

            {/* Guardian Info Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users size={16} className="text-emerald-500" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Guardian Info</h3>
              </div>
              <InfoRow icon={Shield} label="Parent ID" value={s.parentId} highlight />
              <InfoRow icon={BookOpen} label="Class" value={s.class} />
              <InfoRow icon={User} label="Father Name" value={s.fatherName} />
              <InfoRow icon={User} label="Mother Name" value={s.motherName} />
              <InfoRow icon={Star} label="Activity" value={s.activity} />
            </div>
          </div>

          {/* Col 2 – Contact + Personal Info */}
          <div className="space-y-5">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Phone size={16} className="text-blue-500" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Contact Info</h3>
              </div>
              <InfoRow icon={Mail} label="Email ID" value={s.email} />
              <InfoRow icon={Smartphone} label="Mobile" value={s.mobile} />
              <InfoRow icon={Home} label="House" value={s.house} />
              <InfoRow icon={MapPin} label="Address" value={s.address} />
            </div>

            {/* Personal / Medical Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Droplets size={16} className="text-rose-500" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Personal Info</h3>
              </div>
              <InfoRow icon={Droplets} label="Blood Group" value={s.bloodGroup} highlight />
              <InfoRow icon={Calendar} label="Date of Birth" value={s.dob} />
              <InfoRow icon={CreditCard} label="Aadhar Card" value={s.aadharCard} />
              <InfoRow icon={CreditCard} label="Bank Account" value={s.bankAcc} />
              <InfoRow icon={Shield} label="IFSC Code" value={s.ifscCode} />
              <InfoRow icon={BookOpen} label="Optional Subjects" value={s.optionalSubjects} />
            </div>
          </div>

          {/* Col 3 – Academic Performance */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart2 size={16} className="text-indigo-500" />
                <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Academic Performance</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">Term 2 · 2024-25</span>
            </div>
            {academicData.map((row) => (
              <SubjectBar key={row.subject} {...row} />
            ))}
            {/* Summary footer */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-500 font-medium">Overall Average</span>
              <span className="text-base font-bold text-indigo-600">{avgMarks}%</span>
            </div>
          </div>
        </div>

        {/* ── MOBILE / TABLET: Accordion cards ── */}
        <div className="lg:hidden space-y-3">

          {/* Academic Performance – open by default */}
          <AccordionCard title="Academic Performance" icon={BarChart2} iconColor="text-indigo-500" defaultOpen>
            <div className="mt-2">
              {academicData.map((row) => (
                <SubjectBar key={row.subject} {...row} />
              ))}
              <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">Overall Average</span>
                <span className="text-base font-bold text-indigo-600">{avgMarks}%</span>
              </div>
            </div>
          </AccordionCard>

          <AccordionCard title="Student Info" icon={User} iconColor="text-indigo-500">
            <InfoRow icon={Shield} label="Student ID" value={s.id} highlight />
            <InfoRow icon={User} label="Student Name" value={s.name} />
            <InfoRow icon={CreditCard} label="Admission No" value={s.admissionNo} />
            <InfoRow icon={Calendar} label="Date of Admission" value={s.dateOfAdmission} />
            <InfoRow icon={Users} label="Class Teacher" value={s.classTeacher} />
          </AccordionCard>

          <AccordionCard title="Guardian Info" icon={Users} iconColor="text-emerald-500">
            <InfoRow icon={Shield} label="Parent ID" value={s.parentId} highlight />
            <InfoRow icon={BookOpen} label="Class" value={s.class} />
            <InfoRow icon={User} label="Father Name" value={s.fatherName} />
            <InfoRow icon={User} label="Mother Name" value={s.motherName} />
            <InfoRow icon={Star} label="Activity" value={s.activity} />
          </AccordionCard>

          <AccordionCard title="Contact Info" icon={Phone} iconColor="text-blue-500">
            <InfoRow icon={Mail} label="Email ID" value={s.email} />
            <InfoRow icon={Smartphone} label="Mobile" value={s.mobile} />
            <InfoRow icon={Home} label="House" value={s.house} />
            <InfoRow icon={MapPin} label="Address" value={s.address} />
          </AccordionCard>

          <AccordionCard title="Personal & Bank Info" icon={Droplets} iconColor="text-rose-500">
            <InfoRow icon={Droplets} label="Blood Group" value={s.bloodGroup} highlight />
            <InfoRow icon={Calendar} label="Date of Birth" value={s.dob} />
            <InfoRow icon={CreditCard} label="Aadhar Card" value={s.aadharCard} />
            <InfoRow icon={CreditCard} label="Bank Account" value={s.bankAcc} />
            <InfoRow icon={Shield} label="IFSC Code" value={s.ifscCode} />
            <InfoRow icon={BookOpen} label="Optional Subjects" value={s.optionalSubjects} />
          </AccordionCard>

        </div>
      </div>
    </div>
  );
}
