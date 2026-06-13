/**
 * UploadAssignment.jsx
 * Folder: src/pages/Uploads/UploadAssignment.jsx
 *
 * Converts legacy ASPX "Upload Assignment" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class dropdown → auto-loads subjects
 *  - Posted Date & Submission Date pickers
 *  - Subject dropdown
 *  - All Students / Individual radio toggle (shows student dropdown on Individual)
 *  - File upload
 *  - Message textarea
 *  - Save with client-side validation + toast feedback
 *  - Assignment grid with delete (isDeletable flag)
 *  - Desktop: ERP-style table
 *  - Mobile: collapsible cards
 *  - Mobile: filter/form in slide-up drawer
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Upload, Trash2, Eye, RefreshCw, AlertCircle,
  Check, X, Loader2, ChevronDown, ChevronRight,
  FileText, Calendar, BookOpen, Users, User,
  ClipboardList, PlusCircle, Search, Info,
  School2, SlidersHorizontal, Download,
  TrendingUp, Building2
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const CLASSES = [
  { id: '1',  label: 'Class I'   },
  { id: '2',  label: 'Class II'  },
  { id: '3',  label: 'Class III' },
  { id: '4',  label: 'Class IV'  },
  { id: '5',  label: 'Class V'   },
  { id: '6',  label: 'Class VI'  },
  { id: '7',  label: 'Class VII' },
  { id: '8',  label: 'Class VIII'},
  { id: '9',  label: 'Class IX'  },
  { id: '10', label: 'Class X'   },
  { id: '11', label: 'Class XI'  },
  { id: '12', label: 'Class XII' },
]

const SUBJECTS_BY_CLASS = {
  '1':  ['English', 'Hindi', 'Mathematics', 'EVS'],
  '2':  ['English', 'Hindi', 'Mathematics', 'EVS'],
  '3':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
  '4':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
  '5':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Studies'],
  '6':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  '7':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  '8':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science', 'Sanskrit'],
  '9':  ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  '10': ['English', 'Hindi', 'Mathematics', 'Science', 'Social Science'],
  '11': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
  '12': ['English', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Computer Science'],
}

const STUDENTS_BY_CLASS = {
  '1':  ['Aarav Sharma', 'Priya Singh', 'Rohan Gupta', 'Anjali Verma'],
  '2':  ['Vikram Patel', 'Sneha Joshi', 'Arjun Mehta', 'Kavya Nair'],
  '3':  ['Rahul Kumar', 'Divya Rao', 'Amit Tiwari', 'Pooja Mishra'],
  '4':  ['Suresh Yadav', 'Neha Dubey', 'Karan Aggarwal', 'Ritu Pandey'],
  '5':  ['Manish Jain', 'Sonia Malhotra', 'Deepak Chaudhary', 'Anita Saxena'],
  '6':  ['Rajesh Kumar', 'Sunita Sharma', 'Anil Verma', 'Meena Singh'],
  '7':  ['Sanjay Gupta', 'Rekha Patel', 'Vinod Joshi', 'Usha Mehta'],
  '8':  ['Ramesh Rao', 'Geeta Nair', 'Sunil Kumar', 'Kavitha Reddy'],
  '9':  ['Aakash Yadav', 'Priyanka Dubey', 'Mohit Aggarwal', 'Simran Pandey'],
  '10': ['Gaurav Jain', 'Tanvi Malhotra', 'Rohit Chaudhary', 'Sakshi Saxena'],
  '11': ['Nitin Kumar', 'Shruti Sharma', 'Vishal Verma', 'Nidhi Singh'],
  '12': ['Ankit Gupta', 'Pallavi Patel', 'Saurabh Joshi', 'Riya Mehta'],
}

// Seed assignment records
const INITIAL_ASSIGNMENTS = [
  {
    Assign_id: 1, Message: 'Complete Chapter 3 exercises', PostedDate: '01 Jun 2025',
    SubDate: '08 Jun 2025', Class: 'Class VI', Subject: 'Mathematics',
    LName: 'chapter3_exercises.pdf', FilePath: '#', isDeletable: 1, Type: 'All',
  },
  {
    Assign_id: 2, Message: 'Write an essay on Environment', PostedDate: '03 Jun 2025',
    SubDate: '10 Jun 2025', Class: 'Class IX', Subject: 'English',
    LName: 'essay_environment.docx', FilePath: '#', isDeletable: 1, Type: 'Individual',
  },
  {
    Assign_id: 3, Message: 'Solve trigonometry problems', PostedDate: '05 Jun 2025',
    SubDate: '12 Jun 2025', Class: 'Class X', Subject: 'Mathematics',
    LName: 'trig_problems.pdf', FilePath: '#', isDeletable: 0, Type: 'All',
  },
  {
    Assign_id: 4, Message: 'Draw diagrams of human digestive system', PostedDate: '07 Jun 2025',
    SubDate: '14 Jun 2025', Class: 'Class VIII', Subject: 'Science',
    LName: 'digestive_diagrams.pdf', FilePath: '#', isDeletable: 1, Type: 'All',
  },
  {
    Assign_id: 5, Message: 'Learn Chapter 5 vocabulary', PostedDate: '09 Jun 2025',
    SubDate: '16 Jun 2025', Class: 'Class IV', Subject: 'English',
    LName: 'vocab_ch5.pdf', FilePath: '#', isDeletable: 0, Type: 'Individual',
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const today = () => {
  const d = new Date()
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

const FILE_ICONS = { pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊', ppt: '📑', pptx: '📑' }
const fileIcon = (name = '') => {
  const ext = name.split('.').pop().toLowerCase()
  return FILE_ICONS[ext] || '📎'
}

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
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
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

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11px] text-slate-400 mt-0.5">{hint}</p>}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Input({ value, onChange, placeholder, error, type = 'text', readOnly }) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      readOnly={readOnly}
      className={`w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
        bg-white text-slate-800 placeholder-slate-300
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
        dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
        ${error
          ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'
        }`}
    />
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
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

// ─── STAT BADGE ───────────────────────────────────────────────────────────────

function StatBadge({ icon: Icon, label, value, color }) {
  const map = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${map[color]}`}>
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[18px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── FILE UPLOAD ZONE ─────────────────────────────────────────────────────────

function FileUploadZone({ file, onFile, error }) {
  const ref = useRef()
  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) onFile(f)
  }
  return (
    <div
      onDrop={handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={() => ref.current.click()}
      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed
        cursor-pointer min-h-[90px] transition-all px-4 py-4 text-center
        ${error
          ? 'border-rose-300 bg-rose-50/50 dark:border-rose-500/40 dark:bg-rose-500/5'
          : file
            ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-500/40 dark:bg-emerald-500/5'
            : 'border-slate-200 bg-slate-50/50 hover:border-blue-300 hover:bg-blue-50/50 dark:border-[rgba(99,102,241,0.25)] dark:bg-white/[0.02] dark:hover:border-indigo-400/50'
        }`}
    >
      <input ref={ref} type="file" className="hidden" onChange={e => onFile(e.target.files[0])} />
      {file ? (
        <>
          <span className="text-2xl">{fileIcon(file.name)}</span>
          <p className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400 break-all leading-tight">{file.name}</p>
          <p className="text-[11px] text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
          <button
            type="button"
            onClick={e => { e.stopPropagation(); onFile(null) }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white dark:bg-slate-800 shadow flex items-center justify-center text-rose-500 hover:bg-rose-50"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </>
      ) : (
        <>
          <Upload className="w-5 h-5 text-slate-400 dark:text-slate-500" />
          <p className="text-[12px] text-slate-500 dark:text-slate-400">
            <span className="font-semibold text-blue-600 dark:text-indigo-400">Click to upload</span> or drag & drop
          </p>
          <p className="text-[11px] text-slate-400">PDF, DOC, DOCX, XLSX, PPT</p>
        </>
      )}
    </div>
  )
}

// ─── ASSIGNMENT FORM (DESKTOP) ────────────────────────────────────────────────

function AssignmentForm({ onSave, loading }) {
  const [classId,     setClassId]     = useState('')
  const [postedDate,  setPostedDate]  = useState('')
  const [subDate,     setSubDate]     = useState('')
  const [subjectId,   setSubjectId]   = useState('')
  const [type,        setType]        = useState('1') // 1=All, 2=Individual
  const [studentId,   setStudentId]   = useState('')
  const [message,     setMessage]     = useState('')
  const [file,        setFile]        = useState(null)
  const [errors,      setErrors]      = useState({})

  const subjects = classId ? (SUBJECTS_BY_CLASS[classId] || []) : []
  const students = classId ? (STUDENTS_BY_CLASS[classId] || []) : []

  const handleClassChange = (e) => {
    setClassId(e.target.value)
    setSubjectId('')
    setStudentId('')
    setErrors(p => ({ ...p, class: undefined, subject: undefined }))
  }

  const validate = () => {
    const err = {}
    if (!postedDate) err.postedDate = 'Required'
    if (!subDate)    err.subDate    = 'Required'
    if (!classId)    err.class      = 'Required'
    if (!subjectId)  err.subject    = 'Required'
    if (type === '2' && !studentId) err.student = 'Select a student'
    return err
  }

  const handleSave = () => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    const className = CLASSES.find(c => c.id === classId)?.label || ''
    const studentName = type === '2' ? (students[parseInt(studentId)] || '') : 'All Students'
    onSave({
      Message:    message || '(No message)',
      PostedDate: postedDate,
      SubDate:    subDate,
      Class:      className,
      Subject:    subjects[parseInt(subjectId)] || '',
      LName:      file?.name || 'No file',
      FilePath:   '#',
      isDeletable: 1,
      Type:       type === '1' ? 'All' : studentName,
    })
    // Reset form
    setPostedDate(''); setSubDate(''); setClassId(''); setSubjectId('')
    setStudentId(''); setMessage(''); setFile(null); setType('1')
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <PlusCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Upload Assignment</span>
      </div>

      <div className="p-5 space-y-4">
        {/* Row 1: Class | Posted Date | Submission Date | Subject */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Field label="Class" error={errors.class} required>
            <NativeSelect
              value={classId}
              onChange={handleClassChange}
              placeholder="-- Select Class --"
              error={errors.class}
            >
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Posted Date" error={errors.postedDate} required>
            <div className="relative">
              <Input
                type="date"
                value={postedDate}
                onChange={e => { setPostedDate(e.target.value); setErrors(p => ({ ...p, postedDate: undefined })) }}
                error={errors.postedDate}
              />
            </div>
          </Field>

          <Field label="Submission Date" error={errors.subDate} required>
            <Input
              type="date"
              value={subDate}
              onChange={e => { setSubDate(e.target.value); setErrors(p => ({ ...p, subDate: undefined })) }}
              error={errors.subDate}
            />
          </Field>

          <Field label="Subject" error={errors.subject} required>
            <NativeSelect
              value={subjectId}
              onChange={e => { setSubjectId(e.target.value); setErrors(p => ({ ...p, subject: undefined })) }}
              placeholder={classId ? '-- Select Subject --' : '-- Select Class First --'}
              error={errors.subject}
              disabled={!classId}
            >
              {subjects.map((s, i) => <option key={s} value={i}>{s}</option>)}
            </NativeSelect>
          </Field>
        </div>

        {/* Row 2: Type radio | File | Student (conditional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Assignment Type */}
          <Field label="Assignment For">
            <div className="flex gap-3 items-center h-[38px]">
              {[{ v: '1', l: 'All Students' }, { v: '2', l: 'Individual' }].map(opt => (
                <label key={opt.v} className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => { setType(opt.v); setStudentId('') }}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                      ${type === opt.v
                        ? 'border-blue-600 dark:border-indigo-400'
                        : 'border-slate-300 dark:border-slate-600'
                      }`}
                  >
                    {type === opt.v && <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-indigo-400" />}
                  </div>
                  <span className="text-[12px] font-medium text-slate-700 dark:text-slate-300">{opt.l}</span>
                </label>
              ))}
            </div>
          </Field>

          {/* File Upload */}
          <div className="lg:col-span-2">
            <Field label="Attachment" error={errors.file}>
              <FileUploadZone file={file} onFile={setFile} error={errors.file} />
            </Field>
          </div>

          {/* Student (Individual only) */}
          {type === '2' && (
            <Field label="Student" error={errors.student} required>
              <NativeSelect
                value={studentId}
                onChange={e => { setStudentId(e.target.value); setErrors(p => ({ ...p, student: undefined })) }}
                placeholder={classId ? '-- Select Student --' : '-- Select Class First --'}
                error={errors.student}
                disabled={!classId}
              >
                {students.map((s, i) => <option key={s} value={i}>{s}</option>)}
              </NativeSelect>
            </Field>
          )}
        </div>

        {/* Row 3: Message */}
        <Field label="Message">
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Enter assignment instructions or notes…"
            rows={3}
            className="w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
              bg-white text-slate-800 placeholder-slate-300
              border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
              dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
              dark:placeholder-slate-600 dark:focus:border-indigo-400"
          />
        </Field>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
            bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700
            shadow-md shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-70"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Save Assignment
        </button>
      </div>
    </div>
  )
}

// ─── MOBILE FORM DRAWER ────────────────────────────────────────────────────────

function MobileFormDrawer({ open, onClose, onSave, loading }) {
  const [classId,    setClassId]    = useState('')
  const [postedDate, setPostedDate] = useState('')
  const [subDate,    setSubDate]    = useState('')
  const [subjectId,  setSubjectId]  = useState('')
  const [type,       setType]       = useState('1')
  const [studentId,  setStudentId]  = useState('')
  const [message,    setMessage]    = useState('')
  const [file,       setFile]       = useState(null)
  const [errors,     setErrors]     = useState({})

  const subjects = classId ? (SUBJECTS_BY_CLASS[classId] || []) : []
  const students = classId ? (STUDENTS_BY_CLASS[classId] || []) : []

  const validate = () => {
    const err = {}
    if (!postedDate) err.postedDate = 'Required'
    if (!subDate)    err.subDate    = 'Required'
    if (!classId)    err.class      = 'Required'
    if (!subjectId)  err.subject    = 'Required'
    if (type === '2' && !studentId) err.student = 'Select a student'
    return err
  }

  const handleSave = () => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    const className = CLASSES.find(c => c.id === classId)?.label || ''
    const studentName = type === '2' ? (students[parseInt(studentId)] || '') : 'All Students'
    onSave({
      Message:    message || '(No message)',
      PostedDate: postedDate,
      SubDate:    subDate,
      Class:      className,
      Subject:    subjects[parseInt(subjectId)] || '',
      LName:      file?.name || 'No file',
      FilePath:   '#',
      isDeletable: 1,
      Type:       type === '1' ? 'All' : studentName,
    })
    setPostedDate(''); setSubDate(''); setClassId(''); setSubjectId('')
    setStudentId(''); setMessage(''); setFile(null); setType('1')
    onClose()
  }

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[92dvh] flex flex-col"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>

        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Upload Assignment</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <Field label="Class" error={errors.class} required>
            <NativeSelect
              value={classId}
              onChange={e => { setClassId(e.target.value); setSubjectId(''); setStudentId(''); setErrors(p => ({ ...p, class: undefined })) }}
              placeholder="-- Select Class --"
              error={errors.class}
            >
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </NativeSelect>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Posted Date" error={errors.postedDate} required>
              <Input type="date" value={postedDate}
                onChange={e => { setPostedDate(e.target.value); setErrors(p => ({ ...p, postedDate: undefined })) }}
                error={errors.postedDate} />
            </Field>
            <Field label="Submission Date" error={errors.subDate} required>
              <Input type="date" value={subDate}
                onChange={e => { setSubDate(e.target.value); setErrors(p => ({ ...p, subDate: undefined })) }}
                error={errors.subDate} />
            </Field>
          </div>

          <Field label="Subject" error={errors.subject} required>
            <NativeSelect
              value={subjectId}
              onChange={e => { setSubjectId(e.target.value); setErrors(p => ({ ...p, subject: undefined })) }}
              placeholder={classId ? '-- Select Subject --' : '-- Select Class First --'}
              error={errors.subject}
              disabled={!classId}
            >
              {subjects.map((s, i) => <option key={s} value={i}>{s}</option>)}
            </NativeSelect>
          </Field>

          <Field label="Assignment For">
            <div className="flex gap-4 h-[38px] items-center">
              {[{ v: '1', l: 'All Students' }, { v: '2', l: 'Individual' }].map(opt => (
                <label key={opt.v} className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    onClick={() => { setType(opt.v); setStudentId('') }}
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0
                      ${type === opt.v ? 'border-blue-600 dark:border-indigo-400' : 'border-slate-300 dark:border-slate-600'}`}
                  >
                    {type === opt.v && <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-indigo-400" />}
                  </div>
                  <span className="text-[13px] font-medium text-slate-700 dark:text-slate-300">{opt.l}</span>
                </label>
              ))}
            </div>
          </Field>

          {type === '2' && (
            <Field label="Student" error={errors.student} required>
              <NativeSelect
                value={studentId}
                onChange={e => { setStudentId(e.target.value); setErrors(p => ({ ...p, student: undefined })) }}
                placeholder={classId ? '-- Select Student --' : '-- Select Class First --'}
                error={errors.student}
                disabled={!classId}
              >
                {students.map((s, i) => <option key={s} value={i}>{s}</option>)}
              </NativeSelect>
            </Field>
          )}

          <Field label="Attachment">
            <FileUploadZone file={file} onFile={setFile} />
          </Field>

          <Field label="Message">
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Assignment instructions or notes…"
              rows={3}
              className="w-full pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all resize-none
                bg-white text-slate-800 placeholder-slate-300 border-slate-200
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400"
            />
          </Field>
        </div>

        {/* Footer Buttons */}
        <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-shrink-0">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            Save
          </button>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ─────────────────────────────────────────────────────────

function DesktopRow({ row, idx, onDelete }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Message */}
      <td className="px-4 py-3">
        <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-snug line-clamp-2 max-w-[200px]">{row.Message}</p>
      </td>

      {/* Posted Date */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          {row.PostedDate}
        </span>
      </td>

      {/* Sub Date */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center gap-1 text-[12px] text-amber-600 dark:text-amber-400 whitespace-nowrap font-semibold">
          <Calendar className="w-3 h-3 flex-shrink-0" />
          {row.SubDate}
        </span>
      </td>

      {/* Class */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 whitespace-nowrap">
          {row.Class}
        </span>
      </td>

      {/* Subject */}
      <td className="px-4 py-3 text-center">
        <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-[11px] font-semibold bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 whitespace-nowrap">
          {row.Subject}
        </span>
      </td>

      {/* For */}
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-lg whitespace-nowrap
          ${row.Type === 'All'
            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
            : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
          }`}>
          {row.Type === 'All' ? <Users className="w-3 h-3" /> : <User className="w-3 h-3" />}
          {row.Type === 'All' ? 'All' : 'Indiv.'}
        </span>
      </td>

      {/* File */}
      <td className="px-4 py-3 text-center">
        <a href={row.FilePath}
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 dark:text-indigo-400 hover:underline"
          onClick={e => e.preventDefault()}
        >
          <span>{fileIcon(row.LName)}</span>
          <span className="max-w-[100px] truncate">{row.LName}</span>
          <Download className="w-3 h-3 flex-shrink-0" />
        </a>
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-center">
        {row.isDeletable === 1 ? (
          <button
            type="button"
            onClick={() => onDelete(row.Assign_id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold
              bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20
              transition-colors"
          >
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        ) : (
          <span className="text-[11px] text-slate-300 dark:text-slate-600">—</span>
        )}
      </td>
    </tr>
  )
}

// ─── MOBILE ASSIGNMENT CARD ───────────────────────────────────────────────────

function MobileAssignmentCard({ row, onDelete }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Icon */}
        <span className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 text-lg mt-0.5">
          {fileIcon(row.LName)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">{row.Message}</p>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">{row.Class}</span>
            {row.Subject && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400">{row.Subject}</span>
            )}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full
              ${row.Type === 'All'
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
              }`}>
              {row.Type === 'All' ? 'All Students' : row.Type}
            </span>
          </div>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 mt-1 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Date strip */}
      <div className="flex items-center gap-3 px-4 pb-3">
        <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500">
          <Calendar className="w-3 h-3" />
          <span>Posted: <strong className="text-slate-600 dark:text-slate-300">{row.PostedDate}</strong></span>
        </div>
        <span className="text-slate-200 dark:text-slate-700">·</span>
        <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400">
          <Calendar className="w-3 h-3" />
          <span>Due: <strong>{row.SubDate}</strong></span>
        </div>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* File */}
          <div className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-3 py-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
              <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate">{row.LName}</span>
            </div>
            <a href={row.FilePath} onClick={e => e.preventDefault()}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-indigo-400 flex-shrink-0">
              <Download className="w-3 h-3" /> Download
            </a>
          </div>

          {/* Delete */}
          {row.isDeletable === 1 && (
            <button
              type="button"
              onClick={() => onDelete(row.Assign_id)}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-bold
                bg-rose-50 text-rose-600 border border-rose-100 hover:bg-rose-100
                dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 dark:hover:bg-rose-500/20 transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Delete Assignment
            </button>
          )}
          {row.isDeletable === 0 && (
            <p className="text-center text-[11px] text-slate-400 dark:text-slate-600 flex items-center justify-center gap-1">
              <Info className="w-3 h-3" /> This assignment cannot be deleted.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────────

export default function UploadAssignment() {
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS)
  const [saving,      setSaving]      = useState(false)
  const [toast,       setToast]       = useState(null)
  const [search,      setSearch]      = useState('')
  const [drawerOpen,  setDrawerOpen]  = useState(false)
  const [confirmId,   setConfirmId]   = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Save assignment
  const handleSave = useCallback((data) => {
    setSaving(true)
    setTimeout(() => {
      const newId = Math.max(...assignments.map(a => a.Assign_id), 0) + 1
      setAssignments(prev => [{ ...data, Assign_id: newId }, ...prev])
      setSaving(false)
      showToast('Assignment uploaded successfully!')
    }, 700)
  }, [assignments])

  // Delete assignment
  const handleDelete = useCallback((id) => {
    setConfirmId(id)
  }, [])

  const confirmDelete = () => {
    setAssignments(prev => prev.filter(a => a.Assign_id !== confirmId))
    setConfirmId(null)
    showToast('Assignment deleted.', 'error')
  }

  // Search filter
  const filtered = useMemo(() => {
    if (!search) return assignments
    const q = search.toLowerCase()
    return assignments.filter(a =>
      a.Message.toLowerCase().includes(q) ||
      a.Class.toLowerCase().includes(q) ||
      (a.Subject || '').toLowerCase().includes(q) ||
      (a.LName || '').toLowerCase().includes(q)
    )
  }, [assignments, search])

  // Stats
  const totalAll        = assignments.filter(a => a.Type === 'All').length
  const totalIndividual = assignments.filter(a => a.Type !== 'All').length
  const deletable       = assignments.filter(a => a.isDeletable === 1).length

  return (
    <div className="space-y-4 pb-16">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Upload Assignment
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Post class assignments with files, deadlines &amp; targeted recipients.
          </p>
        </div>

        {/* Mobile: FAB to open drawer */}
        <button
          type="button"
          onClick={() => setDrawerOpen(true)}
          className="sm:hidden fixed bottom-6 right-5 z-30 w-14 h-14 rounded-full
            bg-blue-600 dark:bg-indigo-600 text-white shadow-xl shadow-blue-500/30
            flex items-center justify-center transition-all active:scale-95"
        >
          <PlusCircle className="w-6 h-6" />
        </button>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatBadge icon={ClipboardList} label="Total Assignments" value={assignments.length} color="blue"    />
        <StatBadge icon={Users}         label="For All Students"  value={totalAll}           color="emerald" />
        <StatBadge icon={User}          label="Individual"        value={totalIndividual}    color="amber"   />
        <StatBadge icon={Trash2}        label="Can Delete"        value={deletable}          color="violet"  />
      </div>

      {/* ── DESKTOP FORM ──────────────────────────────────────────────────────── */}
      <div className="hidden sm:block">
        <AssignmentForm onSave={handleSave} loading={saving} />
      </div>

      {/* ── MOBILE DRAWER ─────────────────────────────────────────────────────── */}
      <MobileFormDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSave={handleSave}
        loading={saving}
      />

      {/* ── ASSIGNMENT LIST ────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* List Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Posted Assignments</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>
          {/* Search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search assignments…"
              className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Info hint */}
        <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Assignments with the Delete button can be removed. Protected records are locked.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No assignments found.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['#', 'Message', 'Posted', 'Due', 'Class', 'Subject', 'For', 'File', 'Action'].map((h, i) => (
                    <th key={i} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.Assign_id} row={row} idx={i + 1} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No assignments found.</span>
            </div>
          ) : (
            <>
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to view details and actions.
              </p>
              {filtered.map(row => (
                <MobileAssignmentCard key={row.Assign_id} row={row} onDelete={handleDelete} />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{assignments.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── DELETE CONFIRM MODAL ──────────────────────────────────────────────── */}
      {confirmId !== null && (
        <>
          <div className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" onClick={() => setConfirmId(null)} />
          <div
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
              w-[min(90vw,380px)] rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6"
            style={{ animation: 'fadeIn .2s ease' }}
          >
            <style>{`@keyframes fadeIn{from{opacity:0;transform:translate(-50%,-48%)}to{opacity:1;transform:translate(-50%,-50%)}}`}</style>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Delete Assignment?</p>
                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1">This action cannot be undone.</p>
              </div>
              <div className="flex gap-3 w-full">
                <button onClick={() => setConfirmId(null)}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  Cancel
                </button>
                <button onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-rose-600 hover:bg-rose-700 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── TOAST ─────────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
