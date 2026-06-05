/**
 * CreateVirtualClass.jsx
 * Folder: src/pages/Configuration/CreateVirtualClass.jsx
 *
 * Converts legacy ASPX "Create Virtual Class" to fully-responsive React + Tailwind.
 *
 * Workflow:
 *  Step 1 → Select Faculty + Subject + Enter Virtual Class Name → Go
 *  Step 2 → Select Class → pick Students (CheckBoxList) → arrow → selected students
 *           Also shows "Already Created Virtual Classes" GridView
 *  Actions: Create Virtual Class | Remove Selected
 *
 * Mobile: Step-based card UI with drawer filters
 * Desktop: Dense ERP-style two-panel layout
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  ChevronDown, AlertCircle, X, Check, Loader2,
  Users, BookOpen, School2, ArrowRight,
  SlidersHorizontal, Trash2, Edit2, Plus,
  ChevronRight, CheckSquare, Square, Search,
  RefreshCw, Eye, UserPlus, Filter, Info,
  GraduationCap, Monitor, Layers, ArrowLeft,
  MoreVertical, Shield, Star
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const FACULTIES = [
  { id: 1, name: 'Dr. Anita Sharma' },
  { id: 2, name: 'Mr. Rajesh Kumar' },
  { id: 3, name: 'Ms. Priya Verma' },
  { id: 4, name: 'Mr. Suresh Gupta' },
  { id: 5, name: 'Mrs. Kavita Singh' },
]

const SUBJECTS_BY_FACULTY = {
  1: [{ id: 101, name: 'Mathematics' }, { id: 102, name: 'Physics' }],
  2: [{ id: 103, name: 'English' }, { id: 104, name: 'Hindi' }],
  3: [{ id: 105, name: 'Chemistry' }, { id: 106, name: 'Biology' }],
  4: [{ id: 107, name: 'Social Science' }, { id: 108, name: 'Geography' }],
  5: [{ id: 109, name: 'Computer Science' }, { id: 110, name: 'EVS' }],
}

const CLASSES = [
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

// Students per class (section A & B combined as dummy)
const STUDENTS_BY_CLASS = {
  'Class I':    [{ id: 1001, name: 'Aarav Sharma', roll: '01A' }, { id: 1002, name: 'Diya Patel', roll: '02A' }, { id: 1003, name: 'Rohan Mehta', roll: '03A' }, { id: 1004, name: 'Sneha Gupta', roll: '04A' }, { id: 1005, name: 'Arjun Singh', roll: '05A' }],
  'Class II':   [{ id: 1011, name: 'Kavya Joshi', roll: '01A' }, { id: 1012, name: 'Vivek Rao', roll: '02A' }, { id: 1013, name: 'Nisha Tiwari', roll: '03A' }, { id: 1014, name: 'Harsh Agarwal', roll: '04A' }],
  'Class III':  [{ id: 1021, name: 'Pooja Mishra', roll: '01A' }, { id: 1022, name: 'Karan Verma', roll: '02A' }, { id: 1023, name: 'Ananya Das', roll: '03A' }],
  'Class IV':   [{ id: 1031, name: 'Siddharth Roy', roll: '01A' }, { id: 1032, name: 'Meera Sinha', roll: '02A' }, { id: 1033, name: 'Rahul Bose', roll: '03A' }, { id: 1034, name: 'Tanvi Shah', roll: '04A' }],
  'Class V':    [{ id: 1041, name: 'Aditya Pandey', roll: '01A' }, { id: 1042, name: 'Riya Dubey', roll: '02A' }, { id: 1043, name: 'Nikhil Jain', roll: '03A' }],
  'Class VI':   [{ id: 1051, name: 'Priya Kapoor', roll: '01A' }, { id: 1052, name: 'Mohit Yadav', roll: '02A' }, { id: 1053, name: 'Simran Gill', roll: '03A' }, { id: 1054, name: 'Ankush Nair', roll: '04A' }, { id: 1055, name: 'Divya Pillai', roll: '05A' }],
  'Class VII':  [{ id: 1061, name: 'Akash Thakur', roll: '01A' }, { id: 1062, name: 'Richa Saxena', roll: '02A' }, { id: 1063, name: 'Saurabh Ojha', roll: '03A' }],
  'Class VIII': [{ id: 1071, name: 'Mansi Chauhan', roll: '01A' }, { id: 1072, name: 'Vishal Shukla', roll: '02A' }, { id: 1073, name: 'Tanya Srivastava', roll: '03A' }, { id: 1074, name: 'Dhruv Pathak', roll: '04A' }],
  'Class IX':   [{ id: 1081, name: 'Ishaan Malhotra', roll: '01A' }, { id: 1082, name: 'Kritika Bansal', roll: '02A' }, { id: 1083, name: 'Sourabh Khanna', roll: '03A' }, { id: 1084, name: 'Pallavi Sharma', roll: '04A' }],
  'Class X':    [{ id: 1091, name: 'Yash Kulkarni', roll: '01A' }, { id: 1092, name: 'Shruti Desai', roll: '02A' }, { id: 1093, name: 'Aman Tripathi', roll: '03A' }],
  'Class XI':   [{ id: 1101, name: 'Rajan Mehrotra', roll: '01A' }, { id: 1102, name: 'Sakshi Rastogi', roll: '02A' }, { id: 1103, name: 'Tarun Bajaj', roll: '03A' }, { id: 1104, name: 'Neha Chaudhary', roll: '04A' }, { id: 1105, name: 'Vikram Dixit', roll: '05A' }],
  'Class XII':  [{ id: 1111, name: 'Shreya Bhatia', roll: '01A' }, { id: 1112, name: 'Gaurav Mathur', roll: '02A' }, { id: 1113, name: 'Anjali Goyal', roll: '03A' }],
}

// Already created virtual classes (initial dummy)
const INITIAL_VIRTUAL_CLASSES = [
  { id: 1, vClassName: 'Math Advanced Batch', subject: 'Mathematics', subjectId: 101, faculty: 'Dr. Anita Sharma', students: 12 },
  { id: 2, vClassName: 'English Remedial', subject: 'English', subjectId: 103, faculty: 'Mr. Rajesh Kumar', students: 8 },
  { id: 3, vClassName: 'Physics Lab Group', subject: 'Physics', subjectId: 102, faculty: 'Dr. Anita Sharma', students: 15 },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
]
const avatarColor = (name = '') => AVATAR_COLORS[(name.charCodeAt(0) ?? 0) % AVATAR_COLORS.length]
const initials = (name = '') => name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}
        {required && <span className="text-rose-500">*</span>}
        {hint && (
          <span className="ml-1 text-[10px] font-normal text-slate-400 normal-case tracking-normal">({hint})</span>
        )}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── STEP INDICATOR (Mobile) ───────────────────────────────────────────────────

function StepIndicator({ currentStep }) {
  const steps = [
    { label: 'Setup', icon: Monitor },
    { label: 'Students', icon: Users },
  ]
  return (
    <div className="flex items-center gap-0 mb-4 sm:hidden">
      {steps.map((s, i) => {
        const Icon = s.icon
        const active = i === currentStep
        const done = i < currentStep
        return (
          <div key={i} className="flex items-center flex-1">
            <div className={`flex flex-col items-center flex-1`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all
                ${done ? 'bg-emerald-500 text-white' : active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span className={`text-[10px] font-bold mt-1 ${active ? 'text-blue-600 dark:text-indigo-400' : done ? 'text-emerald-600' : 'text-slate-400'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 rounded-full mb-4 transition-all ${done ? 'bg-emerald-400' : 'bg-slate-200 dark:bg-slate-700'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── STUDENT CHECKBOX ITEM ────────────────────────────────────────────────────

function StudentItem({ student, checked, onChange }) {
  const { fg, bg } = avatarColor(student.name)
  return (
    <label
      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all select-none
        hover:bg-slate-50 dark:hover:bg-white/[0.03]
        ${checked ? 'bg-blue-50 dark:bg-indigo-500/10 border border-blue-200 dark:border-indigo-500/30' : 'border border-transparent'}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      {/* Custom checkbox */}
      <span className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 border-2 transition-all
        ${checked ? 'bg-blue-600 border-blue-600 dark:bg-indigo-500 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </span>
      {/* Avatar */}
      <span
        className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
        style={{ background: bg, color: fg }}
      >
        {initials(student.name)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{student.name}</p>
        <p className="text-[10px] text-slate-400">Roll: {student.roll}</p>
      </div>
    </label>
  )
}

// ─── VIRTUAL CLASS CARD (already created) ────────────────────────────────────

function VirtualClassCard({ vc, onEdit, onDelete }) {
  return (
    <div className="flex items-center gap-3 px-3 py-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] hover:border-blue-200 dark:hover:border-indigo-500/30 transition-all group">
      <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
        <Monitor className="w-5 h-5 text-blue-600 dark:text-blue-400" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{vc.vClassName}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{vc.subject}</p>
        <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold mt-0.5">{vc.students} students</p>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onEdit(vc)}
          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(vc.id)}
          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── SELECTED STUDENT CHIP ────────────────────────────────────────────────────

function SelectedStudentChip({ student, onRemove }) {
  const { fg, bg } = avatarColor(student.name)
  return (
    <div className="flex items-center gap-2 px-2.5 py-2 rounded-xl border border-emerald-100 dark:border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10">
      <span
        className="w-6 h-6 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
        style={{ background: bg, color: fg }}
      >
        {initials(student.name)}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">{student.name}</p>
        <p className="text-[10px] text-slate-400">Roll: {student.roll}</p>
      </div>
      <button
        onClick={() => onRemove(student.id)}
        className="w-5 h-5 rounded-md flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-500/20 text-slate-400 hover:text-rose-500 transition-colors flex-shrink-0"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  )
}

// ─── MOBILE STEP 1 ────────────────────────────────────────────────────────────

function MobileStep1({ faculty, setFaculty, subject, setSubject, vClassName, setVClassName, errors, loading, onGo }) {
  const subjects = faculty ? (SUBJECTS_BY_FACULTY[faculty] || []) : []

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Virtual Class Setup</span>
        </div>
        <div className="p-4 space-y-4">
          <Field label="Faculty" required error={errors.faculty}>
            <NativeSelect
              value={faculty}
              onChange={e => { setFaculty(e.target.value); setSubject('') }}
              placeholder="-- Select Faculty --"
              error={errors.faculty}
            >
              {FACULTIES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Subject" required error={errors.subject}>
            <NativeSelect
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder={faculty ? '-- Select Subject --' : '-- Select Faculty First --'}
              error={errors.subject}
              disabled={!faculty}
            >
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Virtual Class Name" required error={errors.vClassName}>
            <input
              value={vClassName}
              onChange={e => setVClassName(e.target.value)}
              placeholder="Enter virtual class name…"
              className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                bg-white text-slate-800 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
                ${errors.vClassName ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
            />
          </Field>
        </div>

        <div className="px-4 pb-4">
          <button
            type="button"
            onClick={onGo}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold
              bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/25
              dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
            Proceed to Add Students
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE STEP 2 ────────────────────────────────────────────────────────────

function MobileStep2({
  selectedClass, setSelectedClass,
  availableStudents, selectedStudents,
  onCheckStudent, onMoveToSelected, onRemoveSelected,
  onCreateClass, onGoBack, creating, virtualClasses, onEditVc, onDeleteVc,
  vClassName, subjectName, facultyName,
}) {
  const [tab, setTab] = useState('add') // 'add' | 'selected' | 'existing'
  const [search, setSearch] = useState('')

  const filteredAvailable = useMemo(() => {
    if (!search) return availableStudents
    const q = search.toLowerCase()
    return availableStudents.filter(s => s.name.toLowerCase().includes(q) || s.roll.toLowerCase().includes(q))
  }, [availableStudents, search])

  const tabs = [
    { key: 'add', label: 'Add Students', count: availableStudents.length },
    { key: 'selected', label: 'Selected', count: selectedStudents.length },
    { key: 'existing', label: 'Existing', count: virtualClasses.length },
  ]

  return (
    <div className="space-y-4">
      {/* Class info banner */}
      <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1a1f35] dark:to-[#1e2238] px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[15px] font-extrabold text-slate-800 dark:text-slate-100">{vClassName}</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">{subjectName} · {facultyName}</p>
          </div>
          <button
            onClick={onGoBack}
            className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Edit
          </button>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/70 dark:bg-white/10 border border-white/50 dark:border-white/10 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
            <Users className="w-3 h-3" />{selectedStudents.length} selected
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-50 dark:bg-[#1e2238] p-1 gap-1">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[11px] font-bold transition-all
              ${tab === t.key
                ? 'bg-white dark:bg-[#1a1f35] text-blue-700 dark:text-indigo-300 shadow-sm border border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
                : 'text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-400'}`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold
                ${tab === t.key ? 'bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'}`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab: Add Students */}
      {tab === 'add' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] space-y-3">
            <Field label="Select Class">
              <NativeSelect value={selectedClass} onChange={e => setSelectedClass(e.target.value)} placeholder="-- Select Class --">
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            {selectedClass && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search student…"
                  className="w-full pl-8 pr-3 py-2 text-[12px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 focus:border-blue-400"
                />
              </div>
            )}
          </div>
          <div className="p-3 space-y-1 max-h-72 overflow-y-auto">
            {!selectedClass ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <GraduationCap className="w-8 h-8 opacity-30 mb-2" />
                <span className="text-[12px]">Select a class to see students</span>
              </div>
            ) : filteredAvailable.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Search className="w-8 h-8 opacity-30 mb-2" />
                <span className="text-[12px]">No students found</span>
              </div>
            ) : (
              filteredAvailable.map(s => (
                <StudentItem
                  key={s.id}
                  student={s}
                  checked={availableStudents.find(a => a.id === s.id)?._checked || false}
                  onChange={() => onCheckStudent(s.id)}
                />
              ))
            )}
          </div>
          {selectedClass && availableStudents.some(s => s._checked) && (
            <div className="p-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              <button
                onClick={onMoveToSelected}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold
                  bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-[0.98]"
              >
                <ArrowRight className="w-4 h-4" />
                Add {availableStudents.filter(s => s._checked).length} Student(s) to Class
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Selected Students */}
      {tab === 'selected' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <Users className="w-4 h-4 text-emerald-600" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Selected Students</span>
            <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400">
              {selectedStudents.length}
            </span>
          </div>
          <div className="p-3 space-y-2 max-h-72 overflow-y-auto">
            {selectedStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <UserPlus className="w-8 h-8 opacity-30 mb-2" />
                <span className="text-[12px]">No students added yet</span>
              </div>
            ) : (
              selectedStudents.map(s => (
                <SelectedStudentChip key={s.id} student={s} onRemove={onRemoveSelected} />
              ))
            )}
          </div>
          {selectedStudents.length > 0 && (
            <div className="p-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              <button
                onClick={onCreateClass}
                disabled={creating}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold
                  bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-500/20 disabled:opacity-70 transition-all active:scale-[0.98]"
              >
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                Create Virtual Class
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Existing Classes */}
      {tab === 'existing' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Existing Virtual Classes</span>
          </div>
          <div className="p-3 space-y-2 max-h-80 overflow-y-auto">
            {virtualClasses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                <Monitor className="w-8 h-8 opacity-30 mb-2" />
                <span className="text-[12px]">No virtual classes created yet</span>
              </div>
            ) : (
              virtualClasses.map(vc => (
                <VirtualClassCard key={vc.id} vc={vc} onEdit={onEditVc} onDelete={onDeleteVc} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CreateVirtualClass() {
  // ── Step 1 state ──────────────────────────────────────────────────────────
  const [faculty,    setFaculty]    = useState('')
  const [subject,    setSubject]    = useState('')
  const [vClassName, setVClassName] = useState('')
  const [errors,     setErrors]     = useState({})
  const [loading,    setLoading]    = useState(false)

  // ── Step 2 state ──────────────────────────────────────────────────────────
  const [step,          setStep]         = useState(0)  // 0 = setup, 1 = students
  const [selectedClass, setSelectedClass] = useState('')
  const [classStudents, setClassStudents] = useState([])  // with _checked flag
  const [selectedStudents, setSelectedStudents] = useState([])
  const [creating,       setCreating]     = useState(false)
  const [virtualClasses, setVirtualClasses] = useState(INITIAL_VIRTUAL_CLASSES)

  // ── Global ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Derived labels
  const facultyName = useMemo(() => FACULTIES.find(f => String(f.id) === String(faculty))?.name || '', [faculty])
  const subjectName = useMemo(() => {
    const subs = SUBJECTS_BY_FACULTY[faculty] || []
    return subs.find(s => String(s.id) === String(subject))?.name || ''
  }, [faculty, subject])

  // ── Step 1: Go ─────────────────────────────────────────────────────────────
  const handleGo = useCallback(() => {
    const err = {}
    if (!faculty)    err.faculty    = 'Please select a faculty'
    if (!subject)    err.subject    = 'Please select a subject'
    if (!vClassName.trim()) err.vClassName = 'Please enter virtual class name'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setStep(1)
      showToast('Setup done! Now add students to your virtual class.')
    }, 600)
  }, [faculty, subject, vClassName])

  // ── Class selection (desktop and mobile) ──────────────────────────────────
  const handleClassChange = useCallback((cls) => {
    setSelectedClass(cls)
    const students = (STUDENTS_BY_CLASS[cls] || []).map(s => ({ ...s, _checked: false }))
    // Remove already selected from available
    const alreadyIds = new Set(selectedStudents.map(s => s.id))
    setClassStudents(students.filter(s => !alreadyIds.has(s.id)))
  }, [selectedStudents])

  const handleCheckStudent = useCallback((id) => {
    setClassStudents(prev => prev.map(s => s.id === id ? { ...s, _checked: !s._checked } : s))
  }, [])

  const handleMoveToSelected = useCallback(() => {
    const checked = classStudents.filter(s => s._checked)
    if (!checked.length) return
    setSelectedStudents(prev => [...prev, ...checked.map(s => ({ ...s, _checked: false }))])
    setClassStudents(prev => prev.filter(s => !s._checked))
  }, [classStudents])

  const handleRemoveSelected = useCallback((id) => {
    setSelectedStudents(prev => prev.filter(s => s.id !== id))
  }, [])

  // ── Create virtual class ──────────────────────────────────────────────────
  const handleCreate = useCallback(() => {
    if (selectedStudents.length === 0) {
      showToast('Please add at least one student.', 'error')
      return
    }
    setCreating(true)
    setTimeout(() => {
      const newVc = {
        id: Date.now(),
        vClassName,
        subject: subjectName,
        subjectId: parseInt(subject),
        faculty: facultyName,
        students: selectedStudents.length,
      }
      setVirtualClasses(prev => [newVc, ...prev])
      // Reset step 2
      setSelectedStudents([])
      setClassStudents([])
      setSelectedClass('')
      setStep(0)
      setFaculty('')
      setSubject('')
      setVClassName('')
      setCreating(false)
      showToast(`Virtual class "${newVc.vClassName}" created successfully!`)
    }, 1000)
  }, [selectedStudents, vClassName, subjectName, subject, facultyName])

  // ── Edit/Delete virtual class ─────────────────────────────────────────────
  const handleEditVc = (vc) => {
    showToast(`Editing "${vc.vClassName}" (API integration pending)`)
  }
  const handleDeleteVc = (id) => {
    setVirtualClasses(prev => prev.filter(v => v.id !== id))
    showToast('Virtual class removed.', 'error')
  }

  // Desktop check all
  const allChecked = classStudents.length > 0 && classStudents.every(s => s._checked)
  const someChecked = classStudents.some(s => s._checked)
  const handleToggleAll = () => {
    setClassStudents(prev => prev.map(s => ({ ...s, _checked: !allChecked })))
  }

  return (
    <div className="space-y-4 pb-12">
      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Create Virtual Class
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Assign faculty, subject &amp; students to create a custom virtual class.
          </p>
        </div>
        {step === 1 && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-bold text-blue-700 dark:text-blue-400">{vClassName}</span>
            <span className="text-[11px] text-slate-400">· {subjectName}</span>
          </div>
        )}
      </div>

      {/* ── MOBILE LAYOUT ───────────────────────────────────────────────────── */}
      <div className="sm:hidden">
        <StepIndicator currentStep={step} />
        {step === 0 && (
          <MobileStep1
            faculty={faculty} setFaculty={v => { setFaculty(v); setSubject('') }}
            subject={subject} setSubject={setSubject}
            vClassName={vClassName} setVClassName={setVClassName}
            errors={errors} loading={loading} onGo={handleGo}
          />
        )}
        {step === 1 && (
          <MobileStep2
            selectedClass={selectedClass}
            setSelectedClass={handleClassChange}
            availableStudents={classStudents}
            selectedStudents={selectedStudents}
            onCheckStudent={handleCheckStudent}
            onMoveToSelected={handleMoveToSelected}
            onRemoveSelected={handleRemoveSelected}
            onCreateClass={handleCreate}
            onGoBack={() => setStep(0)}
            creating={creating}
            virtualClasses={virtualClasses}
            onEditVc={handleEditVc}
            onDeleteVc={handleDeleteVc}
            vClassName={vClassName}
            subjectName={subjectName}
            facultyName={facultyName}
          />
        )}
      </div>

      {/* ── DESKTOP LAYOUT ──────────────────────────────────────────────────── */}
      <div className="hidden sm:block space-y-4">

        {/* ── Step 1: Setup Card ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Monitor className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Virtual Class Setup</span>
            {step === 1 && (
              <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                <Check className="w-3 h-3" /> Configured
              </span>
            )}
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              <Field label="Faculty" required error={errors.faculty}>
                <NativeSelect
                  value={faculty}
                  onChange={e => { setFaculty(e.target.value); setSubject(''); setErrors(p => ({ ...p, faculty: undefined })) }}
                  placeholder="-- Select Faculty --"
                  error={errors.faculty}
                  disabled={step === 1}
                >
                  {FACULTIES.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </NativeSelect>
              </Field>

              <Field label="Select Subject" required error={errors.subject}>
                <NativeSelect
                  value={subject}
                  onChange={e => { setSubject(e.target.value); setErrors(p => ({ ...p, subject: undefined })) }}
                  placeholder={faculty ? '-- Select Subject --' : '-- Select Faculty First --'}
                  error={errors.subject}
                  disabled={!faculty || step === 1}
                >
                  {(SUBJECTS_BY_FACULTY[faculty] || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </NativeSelect>
              </Field>

              <Field label="Virtual Class Name" required error={errors.vClassName}>
                <input
                  value={vClassName}
                  onChange={e => { setVClassName(e.target.value); setErrors(p => ({ ...p, vClassName: undefined })) }}
                  placeholder="Enter name…"
                  disabled={step === 1}
                  className={`w-full px-3 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                    bg-white text-slate-800 placeholder-slate-300 disabled:opacity-60 disabled:cursor-not-allowed
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
                    ${errors.vClassName ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
                />
              </Field>

              <div className="flex gap-2">
                {step === 0 ? (
                  <button
                    type="button"
                    onClick={handleGo}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white
                      bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                      transition-all active:scale-95 disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                    Go
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => { setStep(0); setSelectedStudents([]); setClassStudents([]); setSelectedClass('') }}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold
                      bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Step 2: Students + Already Created ─────────────────────────────── */}
        {step === 1 && (
          <div className="grid grid-cols-12 gap-4">

            {/* LEFT: Class selector + Available students checkboxlist */}
            <div className="col-span-12 lg:col-span-4 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
                <GraduationCap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Select Class</span>
              </div>
              <div className="p-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                <NativeSelect value={selectedClass} onChange={e => handleClassChange(e.target.value)} placeholder="-- Select Class --">
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </NativeSelect>
              </div>

              {/* Check all row */}
              {selectedClass && classStudents.length > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-slate-50/40 dark:bg-white/[0.01]">
                  <button
                    onClick={handleToggleAll}
                    className={`w-5 h-5 rounded-md flex items-center justify-center border-2 flex-shrink-0 transition-all
                      ${allChecked ? 'bg-blue-600 border-blue-600' : someChecked ? 'bg-blue-200 border-blue-400' : 'border-slate-300 dark:border-slate-600'}`}
                  >
                    {allChecked && <Check className="w-3 h-3 text-white" />}
                    {someChecked && !allChecked && <span className="w-2 h-0.5 bg-blue-600 rounded" />}
                  </button>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                    Select All ({classStudents.length})
                  </span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto p-3 space-y-1 min-h-[220px] max-h-[320px]">
                {!selectedClass ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                    <GraduationCap className="w-8 h-8 opacity-30" />
                    <span className="text-[12px]">Select a class to see students</span>
                  </div>
                ) : classStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                    <Check className="w-8 h-8 opacity-30" />
                    <span className="text-[12px]">All students added</span>
                  </div>
                ) : (
                  classStudents.map(s => (
                    <StudentItem key={s.id} student={s} checked={s._checked} onChange={() => handleCheckStudent(s.id)} />
                  ))
                )}
              </div>

              {/* Move arrow button */}
              <div className="p-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
                <button
                  onClick={handleMoveToSelected}
                  disabled={!someChecked}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold text-white
                    bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
                    disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98] shadow-md shadow-blue-500/20"
                >
                  <ArrowRight className="w-4 h-4" />
                  Add Selected ({classStudents.filter(s => s._checked).length})
                </button>
              </div>
            </div>

            {/* MIDDLE: Selected Students */}
            <div className="col-span-12 lg:col-span-4 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
                <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Selected Students</span>
                <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  {selectedStudents.length}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[220px] max-h-[320px]">
                {selectedStudents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                    <UserPlus className="w-8 h-8 opacity-30" />
                    <span className="text-[12px]">No students added yet</span>
                    <span className="text-[11px] text-slate-300 dark:text-slate-600">Select from left panel</span>
                  </div>
                ) : (
                  selectedStudents.map(s => (
                    <SelectedStudentChip key={s.id} student={s} onRemove={handleRemoveSelected} />
                  ))
                )}
              </div>

              {/* Create button */}
              <div className="p-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] space-y-2">
                <button
                  onClick={handleCreate}
                  disabled={creating || selectedStudents.length === 0}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[14px] font-bold text-white
                    bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20
                    disabled:opacity-40 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                >
                  {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  Create Virtual Class
                </button>
                {selectedStudents.length > 0 && (
                  <button
                    onClick={() => setSelectedStudents([])}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-[12px] font-semibold
                      text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove All Selected
                  </button>
                )}
              </div>
            </div>

            {/* RIGHT: Already created virtual classes */}
            <div className="col-span-12 lg:col-span-4 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
                <span className="w-1 h-5 rounded-full bg-amber-500 flex-shrink-0" />
                <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Already Created</span>
                <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
                  {virtualClasses.length}
                </span>
              </div>

              {/* Table header */}
              <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-slate-50/50 dark:bg-white/[0.01]">
                <span className="col-span-6 text-[10px] font-bold uppercase tracking-wide text-slate-400">V.Class Name</span>
                <span className="col-span-4 text-[10px] font-bold uppercase tracking-wide text-slate-400">Subject</span>
                <span className="col-span-2 text-[10px] font-bold uppercase tracking-wide text-slate-400 text-right">Actions</span>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-[220px] max-h-[340px]">
                {virtualClasses.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 gap-2 text-slate-400">
                    <Monitor className="w-8 h-8 opacity-30" />
                    <span className="text-[12px]">No virtual classes yet</span>
                  </div>
                ) : (
                  virtualClasses.map(vc => (
                    <div key={vc.id} className="grid grid-cols-12 gap-2 items-center px-3 py-2.5 rounded-xl border border-transparent hover:border-slate-100 dark:hover:border-[rgba(99,102,241,0.12)] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-all group">
                      <div className="col-span-6 min-w-0">
                        <p className="text-[12px] font-bold text-slate-800 dark:text-slate-100 truncate">{vc.vClassName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{vc.students} students</p>
                      </div>
                      <div className="col-span-4 min-w-0">
                        <p className="text-[12px] text-slate-600 dark:text-slate-300 truncate">{vc.subject}</p>
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEditVc(vc)}
                          className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteVc(vc.id)}
                          className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Info */}
              <div className="flex items-center gap-2 px-4 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-amber-50/40 dark:bg-amber-500/[0.03]">
                <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                <p className="text-[11px] text-amber-700 dark:text-amber-400">
                  Hover over a row to see Edit / Remove actions.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Empty state (desktop, step 0) */}
        {step === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              <Monitor className="w-7 h-7 opacity-50" />
            </div>
            <div className="text-center">
              <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No virtual class started</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
                Select Faculty, Subject, enter a class name and click <strong>Go</strong> to begin.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
