/**
 * DeleteMarks.jsx
 * Folder: src/pages/ExamMaster/DeleteMarks.jsx
 *
 * Converts legacy ASPX "Delete Marks" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Student Wise / Class Wise toggle
 *  - Class Wise: Class → Term → Exam Type → Subject → Show grid with checkboxes
 *  - Student Wise: Registration No autocomplete → Show student's marks grid
 *  - Select All checkbox in header
 *  - Per-row Delete button + bulk Delete button
 *  - Confirmation modal before final delete
 *  - Mobile: cards with checkbox selection
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import {
  Trash2, Search, RefreshCw, Eye, AlertCircle, X, Check,
  Loader2, ChevronDown, SlidersHorizontal, Info, User,
  BookOpen, FileText, Filter, School2, CheckSquare,
  Square, AlertTriangle, ChevronRight, UserCheck, Tag,
  ClipboardList, BarChart3, ShieldAlert
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const CLASSES = [
  { id: '1', name: 'Class I' }, { id: '2', name: 'Class II' },
  { id: '3', name: 'Class III' }, { id: '4', name: 'Class IV' },
  { id: '5', name: 'Class V' }, { id: '6', name: 'Class VI' },
  { id: '7', name: 'Class VII' }, { id: '8', name: 'Class VIII' },
  { id: '9', name: 'Class IX' }, { id: '10', name: 'Class X' },
  { id: '11', name: 'Class XI' }, { id: '12', name: 'Class XII' },
]

const TERMS = [
  { id: '1', name: 'Term 1' }, { id: '2', name: 'Term 2' },
  { id: '3', name: 'Half Yearly' }, { id: '4', name: 'Annual' },
]

const EXAM_TYPES = [
  { id: '1', name: 'Unit Test' }, { id: '2', name: 'Mid Term' },
  { id: '3', name: 'Final Exam' }, { id: '4', name: 'Pre-Board' },
]

const SUBJECTS = {
  '1': [{ id: 's1', name: 'English' }, { id: 's2', name: 'Maths' }, { id: 's3', name: 'EVS' }],
  '2': [{ id: 's1', name: 'English' }, { id: 's2', name: 'Maths' }, { id: 's3', name: 'Science' }],
  '3': [{ id: 's1', name: 'English' }, { id: 's2', name: 'Maths' }, { id: 's3', name: 'Science' }, { id: 's4', name: 'Social Science' }],
  '6': [{ id: 's1', name: 'English' }, { id: 's2', name: 'Maths' }, { id: 's3', name: 'Science' }, { id: 's4', name: 'Social Science' }, { id: 's5', name: 'Hindi' }],
  '9': [{ id: 's1', name: 'English' }, { id: 's2', name: 'Maths' }, { id: 's3', name: 'Science' }, { id: 's4', name: 'Social Science' }, { id: 's5', name: 'Hindi' }, { id: 's6', name: 'Computer' }],
  '10': [{ id: 's1', name: 'English' }, { id: 's2', name: 'Maths' }, { id: 's3', name: 'Science' }, { id: 's4', name: 'Social Science' }, { id: 's5', name: 'Hindi' }, { id: 's6', name: 'Computer' }],
  '11': [{ id: 's1', name: 'English' }, { id: 's2', name: 'Physics' }, { id: 's3', name: 'Chemistry' }, { id: 's4', name: 'Maths' }, { id: 's5', name: 'Biology' }],
  '12': [{ id: 's1', name: 'English' }, { id: 's2', name: 'Physics' }, { id: 's3', name: 'Chemistry' }, { id: 's4', name: 'Maths' }, { id: 's5', name: 'Biology' }],
}
const defaultSubjects = [{ id: 's1', name: 'English' }, { id: 's2', name: 'Maths' }, { id: 's3', name: 'Science' }]

// Classwise marks data
const CLASSWISE_MARKS = {
  '1_1_1_s1': [
    { stu_id: 'ST001', registration_no: 'REG001', name: 'Aarav Sharma', marks: 85, max_marks: 100 },
    { stu_id: 'ST002', registration_no: 'REG002', name: 'Priya Verma', marks: 92, max_marks: 100 },
    { stu_id: 'ST003', registration_no: 'REG003', name: 'Rohan Gupta', marks: 78, max_marks: 100 },
    { stu_id: 'ST004', registration_no: 'REG004', name: 'Sneha Patel', marks: 88, max_marks: 100 },
    { stu_id: 'ST005', registration_no: 'REG005', name: 'Arjun Singh', marks: 75, max_marks: 100 },
    { stu_id: 'ST006', registration_no: 'REG006', name: 'Kavya Nair', marks: 91, max_marks: 100 },
  ],
  '6_2_2_s3': [
    { stu_id: 'ST101', registration_no: 'REG101', name: 'Ishaan Kumar', marks: 72, max_marks: 80 },
    { stu_id: 'ST102', registration_no: 'REG102', name: 'Ananya Joshi', marks: 68, max_marks: 80 },
    { stu_id: 'ST103', registration_no: 'REG103', name: 'Vivaan Mehta', marks: 75, max_marks: 80 },
    { stu_id: 'ST104', registration_no: 'REG104', name: 'Diya Kapoor', marks: 80, max_marks: 80 },
  ],
}

const defaultClassMarks = [
  { stu_id: 'ST201', registration_no: 'REG201', name: 'Aditya Rao', marks: 82, max_marks: 100 },
  { stu_id: 'ST202', registration_no: 'REG202', name: 'Mira Tiwari', marks: 76, max_marks: 100 },
  { stu_id: 'ST203', registration_no: 'REG203', name: 'Kabir Malhotra', marks: 89, max_marks: 100 },
  { stu_id: 'ST204', registration_no: 'REG204', name: 'Tanvi Desai', marks: 93, max_marks: 100 },
  { stu_id: 'ST205', registration_no: 'REG205', name: 'Rishi Pandey', marks: 71, max_marks: 100 },
]

// Student search autocomplete data
const STUDENTS = [
  { stu_id: 'ST001', registration_no: 'REG001', name: 'Aarav Sharma', class_section: 'Class I - A', father_name: 'Rajesh Sharma', phone_no: '9876543210', photo_url: null },
  { stu_id: 'ST002', registration_no: 'REG002', name: 'Priya Verma', class_section: 'Class II - B', father_name: 'Suresh Verma', phone_no: '9876543211', photo_url: null },
  { stu_id: 'ST003', registration_no: 'REG003', name: 'Rohan Gupta', class_section: 'Class III - A', father_name: 'Amit Gupta', phone_no: '9876543212', photo_url: null },
  { stu_id: 'ST101', registration_no: 'REG101', name: 'Ishaan Kumar', class_section: 'Class VI - A', father_name: 'Vinod Kumar', phone_no: '9876543213', photo_url: null },
  { stu_id: 'ST102', registration_no: 'REG102', name: 'Ananya Joshi', class_section: 'Class VI - B', father_name: 'Deepak Joshi', phone_no: '9876543214', photo_url: null },
  { stu_id: 'ST201', registration_no: 'REG201', name: 'Aditya Rao', class_section: 'Class IX - A', father_name: 'Mahesh Rao', phone_no: '9876543215', photo_url: null },
  { stu_id: 'ST202', registration_no: 'REG202', name: 'Mira Tiwari', class_section: 'Class X - A', father_name: 'Sanjay Tiwari', phone_no: '9876543216', photo_url: null },
]

// Student wise marks data
const STUDENT_MARKS = {
  'REG001': [
    { stu_id: 'ST001', sec_id: 'SEC1', Subject: 'English', Subject_id: 's1', Term_id: 'Term 1', exam_type: 'Unit Test', Exam_type_id: 'et1', marks: 85, max_marks: 100, facultyname: 'Mrs. Sharma' },
    { stu_id: 'ST001', sec_id: 'SEC1', Subject: 'Maths', Subject_id: 's2', Term_id: 'Term 1', exam_type: 'Unit Test', Exam_type_id: 'et1', marks: 90, max_marks: 100, facultyname: 'Mr. Verma' },
    { stu_id: 'ST001', sec_id: 'SEC1', Subject: 'EVS', Subject_id: 's3', Term_id: 'Term 1', exam_type: 'Unit Test', Exam_type_id: 'et1', marks: 88, max_marks: 100, facultyname: 'Mrs. Patel' },
    { stu_id: 'ST001', sec_id: 'SEC1', Subject: 'English', Subject_id: 's1', Term_id: 'Term 2', exam_type: 'Mid Term', Exam_type_id: 'et2', marks: 78, max_marks: 100, facultyname: 'Mrs. Sharma' },
    { stu_id: 'ST001', sec_id: 'SEC1', Subject: 'Maths', Subject_id: 's2', Term_id: 'Term 2', exam_type: 'Mid Term', Exam_type_id: 'et2', marks: 94, max_marks: 100, facultyname: 'Mr. Verma' },
  ],
  'REG101': [
    { stu_id: 'ST101', sec_id: 'SEC6', Subject: 'Science', Subject_id: 's3', Term_id: 'Term 1', exam_type: 'Unit Test', Exam_type_id: 'et1', marks: 72, max_marks: 80, facultyname: 'Mr. Singh' },
    { stu_id: 'ST101', sec_id: 'SEC6', Subject: 'Maths', Subject_id: 's2', Term_id: 'Term 1', exam_type: 'Unit Test', Exam_type_id: 'et1', marks: 65, max_marks: 80, facultyname: 'Mrs. Gupta' },
    { stu_id: 'ST101', sec_id: 'SEC6', Subject: 'Hindi', Subject_id: 's5', Term_id: 'Term 2', exam_type: 'Mid Term', Exam_type_id: 'et2', marks: 70, max_marks: 80, facultyname: 'Mrs. Mishra' },
  ],
}

const defaultStudentMarks = [
  { stu_id: 'STX', sec_id: 'SECX', Subject: 'English', Subject_id: 's1', Term_id: 'Term 1', exam_type: 'Unit Test', Exam_type_id: 'et1', marks: 80, max_marks: 100, facultyname: 'Mrs. Khan' },
  { stu_id: 'STX', sec_id: 'SECX', Subject: 'Maths', Subject_id: 's2', Term_id: 'Term 1', exam_type: 'Unit Test', Exam_type_id: 'et1', marks: 75, max_marks: 100, facultyname: 'Mr. Iyer' },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getSubjects = (classId) => SUBJECTS[classId] || defaultSubjects

const getClassMarks = (classId, termId, examTypeId, subjectId) => {
  const key = `${classId}_${termId}_${examTypeId}_${subjectId}`
  return CLASSWISE_MARKS[key] || defaultClassMarks
}

const getStudentMarks = (regNo) => STUDENT_MARKS[regNo] || defaultStudentMarks

const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100'
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
          }`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-800 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── CONFIRMATION MODAL ────────────────────────────────────────────────────────
function ConfirmModal({ open, onConfirm, onCancel, count }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div
        className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-hidden"
        style={{ animation: 'modalPop .2s ease' }}
      >
        <style>{`@keyframes modalPop{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-rose-50 dark:bg-rose-500/10">
          <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Confirm Deletion</p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">This action cannot be undone</p>
          </div>
        </div>
        {/* Body */}
        <div className="px-5 py-5">
          <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
            Are you sure you want to delete marks for{' '}
            <span className="font-bold text-slate-800 dark:text-slate-100">{count} record{count !== 1 ? 's' : ''}</span>?
            Once deleted, this data cannot be recovered.
          </p>
        </div>
        {/* Actions */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-all active:scale-95 shadow-md shadow-rose-500/20"
          >
            <Trash2 className="w-4 h-4" />
            Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── STUDENT AUTOCOMPLETE ─────────────────────────────────────────────────────
function StudentSearch({ value, onSelect, onRegNoChange }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const wrapRef = useRef(null)

  const filtered = useMemo(() => {
    if (!query || query.length < 1) return []
    const q = query.toLowerCase()
    return STUDENTS.filter(s =>
      s.registration_no.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q)
    ).slice(0, 6)
  }, [query])

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSelect = (student) => {
    setQuery(student.registration_no)
    onRegNoChange(student.registration_no)
    onSelect(student)
    setOpen(false)
  }

  const handleChange = (e) => {
    setQuery(e.target.value)
    onRegNoChange(e.target.value)
    setOpen(true)
    if (!e.target.value) onSelect(null)
  }

  return (
    <div ref={wrapRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => { setFocused(true); if (query.length >= 1) setOpen(true) }}
          onBlur={() => setFocused(false)}
          placeholder="Search by Reg No or Name..."
          className="w-full pl-9 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
            bg-white text-slate-800 border-slate-200 placeholder-slate-300
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
            dark:placeholder-slate-600 dark:focus:border-indigo-400"
        />
        {query && (
          <button
            type="button"
            onClick={() => { setQuery(''); onRegNoChange(''); onSelect(null); setOpen(false) }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-40 mt-1 rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] bg-white dark:bg-[#1a1f35] shadow-xl overflow-hidden max-h-72 overflow-y-auto">
          {filtered.map(student => (
            <button
              key={student.stu_id}
              type="button"
              onMouseDown={() => handleSelect(student)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] last:border-0 text-left"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-blue-700 dark:text-blue-400">
                {getInitials(student.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">{student.registration_no}</span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">{student.class_section}</span>
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">Father: {student.father_name}</p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── STUDENT INFO CARD ─────────────────────────────────────────────────────────
function StudentInfoCard({ student }) {
  if (!student) return null
  return (
    <div className="rounded-xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-blue-50/60 dark:bg-blue-500/[0.06] p-4">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-blue-100 dark:bg-blue-500/25 flex items-center justify-center flex-shrink-0 text-[13px] font-bold text-blue-700 dark:text-blue-400">
          {getInitials(student.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{student.name}</p>
          <div className="flex items-center gap-3 mt-0.5 flex-wrap">
            <span className="text-[11px] font-medium text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-500/20 px-2 py-0.5 rounded-md">{student.registration_no}</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{student.class_section}</span>
          </div>
        </div>
        <UserCheck className="w-5 h-5 text-emerald-500 flex-shrink-0" />
      </div>
    </div>
  )
}

// ─── CLASSWISE MARKS TABLE (Desktop) ─────────────────────────────────────────
function ClasswiseTable({ rows, selected, onToggle, onToggleAll, onDeleteRow, allSelected }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
            <th className="px-4 py-3 text-center w-10">
              <button type="button" onClick={onToggleAll} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
                {allSelected ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Square className="w-4 h-4" />}
              </button>
            </th>
            {['S.No.', 'Adm No.', 'Student Name', 'Marks', 'Action'].map((h, i) => (
              <th key={i} className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const isSelected = selected.includes(row.stu_id)
            return (
              <tr key={row.stu_id} className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
                ${isSelected ? 'bg-rose-50/60 dark:bg-rose-500/[0.04]' : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}>
                <td className="px-4 py-3 text-center">
                  <button type="button" onClick={() => onToggle(row.stu_id)} className="text-slate-400 hover:text-blue-600 transition-colors">
                    {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Square className="w-4 h-4" />}
                  </button>
                </td>
                <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums">{i + 1}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400">
                    {row.registration_no}
                  </span>
                </td>
                <td className="px-4 py-3 text-left">
                  <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.name}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg text-[12px] font-bold
                    bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {row.marks} / {row.max_marks}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    type="button"
                    onClick={() => onDeleteRow(row.stu_id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold
                      bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400
                      hover:bg-rose-100 dark:hover:bg-rose-500/20 border border-rose-100 dark:border-rose-500/20 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── CLASSWISE MARKS CARD (Mobile) ────────────────────────────────────────────
function ClasswiseMobileCard({ row, isSelected, onToggle, onDeleteRow }) {
  return (
    <div className={`rounded-xl border transition-all overflow-hidden
      ${isSelected ? 'border-blue-300 dark:border-blue-500/40 bg-blue-50/40 dark:bg-blue-500/[0.05]' : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'}`}>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <button type="button" onClick={() => onToggle(row.stu_id)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0">
          {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Square className="w-5 h-5" />}
        </button>
        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0 text-[11px] font-bold text-blue-700 dark:text-blue-400">
          {getInitials(row.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-slate-400">{row.registration_no}</span>
            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{row.marks}/{row.max_marks}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDeleteRow(row.stu_id)}
          className="p-2 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors flex-shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── STUDENTWISE MARKS TABLE (Desktop) ────────────────────────────────────────
function StudentwiseTable({ rows, selected, onToggle, onToggleAll, allSelected }) {
  return (
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
            <th className="px-4 py-3 text-center w-10">
              <button type="button" onClick={onToggleAll} className="text-slate-500 hover:text-blue-600 dark:text-slate-400 transition-colors">
                {allSelected ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Square className="w-4 h-4" />}
              </button>
            </th>
            {['S.No.', 'Subject', 'Term', 'Exam Name', 'Marks', 'Max Marks', 'Faculty'].map((h, i) => (
              <th key={i} className="px-4 py-3 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const rowKey = `${row.Subject_id}_${row.Term_id}_${row.Exam_type_id}`
            const isSelected = selected.includes(rowKey)
            return (
              <tr key={rowKey} className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
                ${isSelected ? 'bg-rose-50/60 dark:bg-rose-500/[0.04]' : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}>
                <td className="px-4 py-3 text-center">
                  <button type="button" onClick={() => onToggle(rowKey)} className="text-slate-400 hover:text-blue-600 transition-colors">
                    {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" /> : <Square className="w-4 h-4" />}
                  </button>
                </td>
                <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums">{i + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.Subject}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 whitespace-nowrap">
                    {row.Term_id}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 whitespace-nowrap">
                    {row.exam_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl text-[14px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {row.marks}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 tabular-nums">{row.max_marks}</span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.facultyname}</span>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── STUDENTWISE MARKS CARD (Mobile) ──────────────────────────────────────────
function StudentwiseMobileCard({ row, isSelected, onToggle }) {
  const rowKey = `${row.Subject_id}_${row.Term_id}_${row.Exam_type_id}`
  const pct = Math.round((row.marks / row.max_marks) * 100)
  const scoreColor = pct >= 80 ? 'text-emerald-600 dark:text-emerald-400' : pct >= 60 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'

  return (
    <div className={`rounded-xl border transition-all overflow-hidden
      ${isSelected ? 'border-blue-300 dark:border-blue-500/40 bg-blue-50/40 dark:bg-blue-500/[0.05]' : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]'}`}>
      <div className="flex items-start gap-3 px-4 pt-3.5 pb-2">
        <button type="button" onClick={() => onToggle(rowKey)} className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex-shrink-0 mt-0.5">
          {isSelected ? <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <Square className="w-5 h-5" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">{row.Subject}</p>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400">{row.Term_id}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400">{row.exam_type}</span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-[20px] font-bold tabular-nums leading-tight ${scoreColor}`}>{row.marks}</p>
              <p className="text-[10px] text-slate-400">/{row.max_marks}</p>
            </div>
          </div>
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
              <div className={`h-full rounded-full transition-all ${pct >= 80 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1.5 px-4 pb-3 mt-1">
        <User className="w-3 h-3 text-slate-400" />
        <span className="text-[11px] text-slate-400 dark:text-slate-500">{row.facultyname}</span>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, mode, filters, onChange, onShow, loading, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[90vh] overflow-y-auto"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4">
          {mode === 'ClassWise' ? (
            <>
              <Field label="Class" error={errors.class} required>
                <NativeSelect value={filters.class} onChange={e => onChange('class', e.target.value)} placeholder="-- Select Class --" error={errors.class}>
                  {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Term" error={errors.term} required>
                <NativeSelect value={filters.term} onChange={e => onChange('term', e.target.value)} placeholder="-- Select Term --" error={errors.term}>
                  {TERMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Exam Type" error={errors.examType} required>
                <NativeSelect value={filters.examType} onChange={e => onChange('examType', e.target.value)} placeholder="-- Select Exam Type --" error={errors.examType}>
                  {EXAM_TYPES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Subject" error={errors.subject} required>
                <NativeSelect value={filters.subject} onChange={e => onChange('subject', e.target.value)} placeholder="-- Select Subject --" error={errors.subject}>
                  {getSubjects(filters.class).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </NativeSelect>
              </Field>
            </>
          ) : (
            <Field label="Registration No / Student Name" error={errors.student} required>
              <StudentSearch value={filters.regNo} onRegNoChange={v => onChange('regNo', v)} onSelect={s => onChange('selectedStudent', s)} />
            </Field>
          )}
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DeleteMarks() {
  const [mode, setMode] = useState('StudentWise') // 'StudentWise' | 'ClassWise'

  // Classwise filters
  const [cwFilters, setCwFilters] = useState({ class: '', term: '', examType: '', subject: '' })

  // Studentwise filters
  const [swFilters, setSwFilters] = useState({ regNo: '', selectedStudent: null })

  // Table data
  const [cwRows, setCwRows]   = useState([])
  const [swRows, setSwRows]   = useState([])

  // Selection
  const [cwSelected, setCwSelected] = useState([])
  const [swSelected, setSwSelected] = useState([])

  // UI state
  const [loading,     setLoading]     = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)
  const [showTable,   setShowTable]   = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDeleteIds, setPendingDeleteIds] = useState([]) // for row-level delete
  const [deleteMode,  setDeleteMode]  = useState('bulk') // 'bulk' | 'row'

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Mode switch ──────────────────────────────────────────────────────────
  const handleModeChange = (newMode) => {
    setMode(newMode)
    setShowTable(false)
    setCwRows([]); setSwRows([])
    setCwSelected([]); setSwSelected([])
    setErrors({})
  }

  // ── CW filter change ─────────────────────────────────────────────────────
  const handleCwChange = (key, val) => {
    setCwFilters(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, [key]: undefined }))
    // Reset downstream filters
    if (key === 'class') setCwFilters(p => ({ ...p, class: val, subject: '' }))
  }

  // ── SW filter change ─────────────────────────────────────────────────────
  const handleSwChange = (key, val) => {
    setSwFilters(p => ({ ...p, [key]: val }))
    setErrors(p => ({ ...p, student: undefined }))
  }

  // ── Show ─────────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}

    if (mode === 'ClassWise') {
      if (!cwFilters.class)    err.class    = 'Select a class'
      if (!cwFilters.term)     err.term     = 'Select a term'
      if (!cwFilters.examType) err.examType = 'Select exam type'
      if (!cwFilters.subject)  err.subject  = 'Select a subject'
    } else {
      if (!swFilters.regNo) err.student = 'Enter a registration no or student name'
    }

    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setCwSelected([]); setSwSelected([])

    setTimeout(() => {
      if (mode === 'ClassWise') {
        const rows = getClassMarks(cwFilters.class, cwFilters.term, cwFilters.examType, cwFilters.subject)
        setCwRows(rows)
      } else {
        const rows = getStudentMarks(swFilters.regNo)
        setSwRows(rows)
      }
      setShowTable(true)
      setLoading(false)
      showToast('Records loaded successfully.')
    }, 600)
  }, [mode, cwFilters, swFilters])

  // ── Reset ────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setCwFilters({ class: '', term: '', examType: '', subject: '' })
    setSwFilters({ regNo: '', selectedStudent: null })
    setCwRows([]); setSwRows([])
    setCwSelected([]); setSwSelected([])
    setErrors({}); setShowTable(false)
  }

  // ── CW Selection ─────────────────────────────────────────────────────────
  const cwAllSelected = cwRows.length > 0 && cwSelected.length === cwRows.length
  const toggleCw = (id) => setCwSelected(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])
  const toggleAllCw = () => setCwSelected(cwAllSelected ? [] : cwRows.map(r => r.stu_id))

  // ── SW Selection ─────────────────────────────────────────────────────────
  const swAllSelected = swRows.length > 0 && swSelected.length === swRows.length
  const toggleSw = (key) => setSwSelected(p => p.includes(key) ? p.filter(x => x !== key) : [...p, key])
  const toggleAllSw = () => setSwSelected(swAllSelected ? [] : swRows.map(r => `${r.Subject_id}_${r.Term_id}_${r.Exam_type_id}`))

  // ── Delete: per-row (classwise) ───────────────────────────────────────────
  const handleDeleteRow = (stuId) => {
    setDeleteMode('row')
    setPendingDeleteIds([stuId])
    setConfirmOpen(true)
  }

  // ── Delete: bulk ─────────────────────────────────────────────────────────
  const handleBulkDelete = () => {
    const sel = mode === 'ClassWise' ? cwSelected : swSelected
    if (sel.length === 0) { showToast('Please select at least one record.', 'error'); return }
    setDeleteMode('bulk')
    setPendingDeleteIds(sel)
    setConfirmOpen(true)
  }

  // ── Confirm delete ────────────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    setConfirmOpen(false)
    if (mode === 'ClassWise') {
      const idsToDelete = deleteMode === 'row' ? pendingDeleteIds : cwSelected
      setCwRows(p => p.filter(r => !idsToDelete.includes(r.stu_id)))
      setCwSelected([])
    } else {
      const keysToDelete = deleteMode === 'row' ? pendingDeleteIds : swSelected
      setSwRows(p => p.filter(r => !keysToDelete.includes(`${r.Subject_id}_${r.Term_id}_${r.Exam_type_id}`)))
      setSwSelected([])
    }
    showToast(`${pendingDeleteIds.length} record(s) deleted successfully.`)
    setPendingDeleteIds([])
    if ((mode === 'ClassWise' ? cwRows : swRows).length - pendingDeleteIds.length === 0) setShowTable(false)
  }

  const handleCancelDelete = () => { setConfirmOpen(false); setPendingDeleteIds([]) }

  // ── Active filter count ───────────────────────────────────────────────────
  const activeFilterCount = mode === 'ClassWise'
    ? Object.values(cwFilters).filter(Boolean).length
    : (swFilters.regNo ? 1 : 0)

  const currentRows = mode === 'ClassWise' ? cwRows : swRows
  const currentSelected = mode === 'ClassWise' ? cwSelected : swSelected

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center flex-shrink-0">
              <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            Delete Marks
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Remove student marks by class or individual student.
          </p>
        </div>
      </div>

      {/* ── Mode Toggle ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Select Mode</span>
        </div>
        <div className="px-5 py-4">
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
            {['StudentWise', 'ClassWise'].map(m => (
              <button
                key={m}
                type="button"
                onClick={() => handleModeChange(m)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold transition-all
                  ${mode === m
                    ? 'bg-white dark:bg-[#1e2238] text-blue-600 dark:text-indigo-400 shadow-sm border border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
              >
                {m === 'StudentWise' ? <User className="w-3.5 h-3.5" /> : <School2 className="w-3.5 h-3.5" />}
                {m === 'StudentWise' ? 'Student Wise' : 'Class Wise'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          {showTable && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {currentRows.length} record{currentRows.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="p-5">
          {mode === 'ClassWise' ? (
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 items-end">
              <Field label="Class" error={errors.class} required>
                <NativeSelect value={cwFilters.class} onChange={e => handleCwChange('class', e.target.value)} placeholder="-- Class --" error={errors.class}>
                  {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Term" error={errors.term} required>
                <NativeSelect value={cwFilters.term} onChange={e => handleCwChange('term', e.target.value)} placeholder="-- Term --" error={errors.term}>
                  {TERMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Exam Type" error={errors.examType} required>
                <NativeSelect value={cwFilters.examType} onChange={e => handleCwChange('examType', e.target.value)} placeholder="-- Exam Type --" error={errors.examType}>
                  {EXAM_TYPES.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Subject" error={errors.subject} required>
                <NativeSelect value={cwFilters.subject} onChange={e => handleCwChange('subject', e.target.value)} placeholder="-- Subject --" error={errors.subject}>
                  {getSubjects(cwFilters.class).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </NativeSelect>
              </Field>
              <div className="flex gap-2">
                <button type="button" onClick={handleShow} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                    bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                    transition-all active:scale-95 disabled:opacity-70">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Show
                </button>
                <button type="button" onClick={handleReset}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div className="col-span-2 lg:col-span-1">
                <Field label="Registration No" error={errors.student} required>
                  <StudentSearch value={swFilters.regNo} onRegNoChange={v => handleSwChange('regNo', v)} onSelect={s => handleSwChange('selectedStudent', s)} />
                </Field>
              </div>
              {swFilters.selectedStudent && (
                <div className="col-span-2 lg:col-span-1">
                  <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Student</label>
                  <StudentInfoCard student={swFilters.selectedStudent} />
                </div>
              )}
              <div className="flex gap-2 items-end">
                <button type="button" onClick={handleShow} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                    bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                    transition-all active:scale-95 disabled:opacity-70">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Show
                </button>
                <button type="button" onClick={handleReset}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE Filter Bar ── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        <button type="button" onClick={handleReset}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        mode={mode}
        filters={mode === 'ClassWise' ? cwFilters : swFilters}
        onChange={mode === 'ClassWise' ? handleCwChange : handleSwChange}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ── */}
      {showTable && !loading && currentRows.length > 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-rose-500 flex-shrink-0" />
              <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
                {mode === 'ClassWise' ? 'Class Marks' : 'Student Marks'}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {currentRows.length} record{currentRows.length !== 1 ? 's' : ''}
              </span>
              {currentSelected.length > 0 && (
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                  {currentSelected.length} selected
                </span>
              )}
            </div>
          </div>

          {/* Info hint */}
          <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-amber-50/20 dark:bg-amber-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-[12px] text-amber-700 dark:text-amber-400">
              Select records using checkboxes and click Delete below, or use the row delete button.
            </p>
          </div>

          {/* Student info for studentwise */}
          {mode === 'StudentWise' && swFilters.selectedStudent && (
            <div className="px-5 pt-4 pb-2">
              <StudentInfoCard student={swFilters.selectedStudent} />
            </div>
          )}

          {/* Desktop Table */}
          {mode === 'ClassWise' ? (
            <ClasswiseTable
              rows={cwRows}
              selected={cwSelected}
              onToggle={toggleCw}
              onToggleAll={toggleAllCw}
              onDeleteRow={handleDeleteRow}
              allSelected={cwAllSelected}
            />
          ) : (
            <StudentwiseTable
              rows={swRows}
              selected={swSelected}
              onToggle={toggleSw}
              onToggleAll={toggleAllSw}
              allSelected={swAllSelected}
            />
          )}

          {/* Mobile Cards */}
          <div className="md:hidden p-4 space-y-3">
            {/* Select all for mobile */}
            <div className="flex items-center gap-3 px-1">
              <button
                type="button"
                onClick={mode === 'ClassWise' ? toggleAllCw : toggleAllSw}
                className="flex items-center gap-2 text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {(mode === 'ClassWise' ? cwAllSelected : swAllSelected) ? (
                  <CheckSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                Select All ({currentRows.length})
              </button>
            </div>

            {mode === 'ClassWise'
              ? cwRows.map(row => (
                <ClasswiseMobileCard
                  key={row.stu_id}
                  row={row}
                  isSelected={cwSelected.includes(row.stu_id)}
                  onToggle={toggleCw}
                  onDeleteRow={handleDeleteRow}
                />
              ))
              : swRows.map(row => {
                const rowKey = `${row.Subject_id}_${row.Term_id}_${row.Exam_type_id}`
                return (
                  <StudentwiseMobileCard
                    key={rowKey}
                    row={row}
                    isSelected={swSelected.includes(rowKey)}
                    onToggle={toggleSw}
                  />
                )
              })
            }
          </div>

          {/* Footer with bulk delete */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              {currentSelected.length > 0 ? (
                <span className="font-semibold text-blue-600 dark:text-blue-400">{currentSelected.length} selected</span>
              ) : (
                'Select records to delete'
              )}
            </p>
            <button
              type="button"
              onClick={handleBulkDelete}
              disabled={currentSelected.length === 0}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-500/20
                transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 w-full sm:w-auto justify-center"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
              {currentSelected.length > 0 && ` (${currentSelected.length})`}
            </button>
          </div>
        </div>
      )}

      {/* ── Empty State ── */}
      {!showTable && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No data to display</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              {mode === 'ClassWise'
                ? 'Select class, term, exam type & subject, then click Show.'
                : 'Enter a registration number or student name, then click Show.'
              }
            </p>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        open={confirmOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        count={pendingDeleteIds.length}
      />

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
