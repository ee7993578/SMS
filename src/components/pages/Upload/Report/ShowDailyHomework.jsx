/**
 * ShowDailyHomework.jsx
 * Folder: src/pages/Student/Homework/ShowDailyHomework.jsx
 *
 * Converts legacy ASPX "Show Daily Homework" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class dropdown filter with auto-load
 *  - Date-grouped homework cards (accordion expand/collapse)
 *  - Subject-wise homework table per date
 *  - Mobile: stacked cards with smooth accordions
 *  - Desktop: clean ERP-style grouped table
 *  - Empty state, loading skeleton, toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BookOpen, ChevronDown, ChevronRight, ChevronUp,
  AlertCircle, X, Check, Loader2, RefreshCw,
  CalendarDays, FileText, GraduationCap,
  Search, Filter, SlidersHorizontal,
  ClipboardList, BookMarked, Eye, Info,
  School2, Layers, LayoutList, Inbox
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

// Homework data keyed by class → array of { homework_date, subjects: [{subject_code, homework_desc}] }
const HOMEWORK_DATA = {
  'Nursery': [
    {
      homework_date: '10 Jun 2025',
      subjects: [
        { subject_code: 'English', homework_desc: 'Write capital letters A to E in notebook. Practise 3 times each.' },
        { subject_code: 'Drawing', homework_desc: 'Draw a sun and colour it with yellow/orange crayons.' },
      ],
    },
    {
      homework_date: '09 Jun 2025',
      subjects: [
        { subject_code: 'English', homework_desc: 'Recite poem "Twinkle Twinkle" and write it once.' },
        { subject_code: 'Maths', homework_desc: 'Count objects at home and write numbers 1-5.' },
      ],
    },
  ],
  'Class I': [
    {
      homework_date: '11 Jun 2025',
      subjects: [
        { subject_code: 'English', homework_desc: 'Write 5 sentences about "My Family". Underline the naming words.' },
        { subject_code: 'Mathematics', homework_desc: 'Solve addition sums from page 34, Q1 to Q10.' },
        { subject_code: 'EVS', homework_desc: 'Draw and label any 3 domestic animals.' },
      ],
    },
    {
      homework_date: '10 Jun 2025',
      subjects: [
        { subject_code: 'Hindi', homework_desc: 'Write "aa ki matra" words – 10 words from textbook page 28.' },
        { subject_code: 'Mathematics', homework_desc: 'Learn tables of 2 and 3. Write each table 3 times.' },
      ],
    },
    {
      homework_date: '09 Jun 2025',
      subjects: [
        { subject_code: 'English', homework_desc: 'Write 10 action words (verbs) and use any 5 in sentences.' },
        { subject_code: 'EVS', homework_desc: 'Paste pictures of 5 fruits in scrapbook and write their names.' },
        { subject_code: 'Art', homework_desc: 'Colour the worksheet given in class – rainbow colours in order.' },
      ],
    },
  ],
  'Class V': [
    {
      homework_date: '11 Jun 2025',
      subjects: [
        { subject_code: 'English', homework_desc: 'Write a paragraph on "My Favourite Season" (80-100 words). Check grammar.' },
        { subject_code: 'Mathematics', homework_desc: 'Exercise 5.3, all questions from NCERT. Show all steps.' },
        { subject_code: 'Science', homework_desc: 'Read Chapter 3 (Animals and Their Adaptations). Make a chart for 5 animals.' },
        { subject_code: 'Social Studies', homework_desc: 'Mark the rivers of India on an outline map. Label at least 8 rivers.' },
      ],
    },
    {
      homework_date: '10 Jun 2025',
      subjects: [
        { subject_code: 'Hindi', homework_desc: 'अपठित गद्यांश पढ़कर प्रश्नों के उत्तर लिखिए – पृष्ठ 45.' },
        { subject_code: 'Mathematics', homework_desc: 'Solve word problems on fractions – page 78, Q5 to Q12.' },
        { subject_code: 'English', homework_desc: 'Learn and write meanings of 15 new vocabulary words from Unit 4.' },
      ],
    },
  ],
  'Class IX': [
    {
      homework_date: '11 Jun 2025',
      subjects: [
        { subject_code: 'Mathematics', homework_desc: 'NCERT Exercise 8.2 – all 6 questions on quadrilaterals. Prove theorems with diagrams.' },
        { subject_code: 'Science (Physics)', homework_desc: 'Numerical problems on Motion – Ch. 8, page 112, Q1 to Q8. Show all formulae.' },
        { subject_code: 'English', homework_desc: 'Write a formal letter of complaint to the municipality about water shortage (200 words).' },
        { subject_code: 'Social Science', homework_desc: 'Draw a map of France and mark major cities. Note French Revolution key events timeline.' },
        { subject_code: 'Hindi', homework_desc: 'काव्यांश की सप्रसंग व्याख्या कीजिए – "सखी री" (3 stanzas from textbook).' },
      ],
    },
    {
      homework_date: '10 Jun 2025',
      subjects: [
        { subject_code: 'Science (Chemistry)', homework_desc: 'Differentiate between physical and chemical changes. Give 5 examples each.' },
        { subject_code: 'Mathematics', homework_desc: 'Exercise 8.1 – Q1 to Q7. Also revise mid-point theorem proof.' },
        { subject_code: 'Computer', homework_desc: 'Write a Python program to check if a number is prime. Test with 5 inputs.' },
      ],
    },
    {
      homework_date: '09 Jun 2025',
      subjects: [
        { subject_code: 'English', homework_desc: 'Read "The Road Not Taken" by Robert Frost. Answer comprehension Q1-Q6 from workbook.' },
        { subject_code: 'Science (Biology)', homework_desc: 'Draw and label the structure of a plant cell vs animal cell. Note 5 differences.' },
        { subject_code: 'Social Science', homework_desc: 'Read Chapter 2 – Socialism in Europe. Make notes under headings: Causes, Events, Impact.' },
      ],
    },
  ],
  'Class XII': [
    {
      homework_date: '11 Jun 2025',
      subjects: [
        { subject_code: 'Mathematics', homework_desc: 'NCERT Ch. 7 Integrals – Miscellaneous Exercise, Q1-Q15. Use substitution and by-parts.' },
        { subject_code: 'Physics', homework_desc: 'Solve problems from Ch. 9 Ray Optics – page 341, Q1 to Q10. Draw ray diagrams.' },
        { subject_code: 'Chemistry', homework_desc: 'Balance redox reactions from Ch. 3. Solve 8 problems using oxidation number method.' },
        { subject_code: 'English', homework_desc: 'Write a speech on "Impact of Social Media on Youth" – 250 words. Practise delivery.' },
      ],
    },
    {
      homework_date: '10 Jun 2025',
      subjects: [
        { subject_code: 'Biology', homework_desc: 'Draw and explain the process of DNA replication. Label all enzymes involved.' },
        { subject_code: 'Mathematics', homework_desc: 'Revision of Chapter 6 – Application of Derivatives. Solve past year questions (2018-22).' },
        { subject_code: 'Chemistry', homework_desc: 'Name and write structures of first 10 organic compounds from Ch. 12 Organic Chemistry.' },
      ],
    },
  ],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const SUBJECT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe' },
  { fg: '#7c3aed', bg: '#ede9fe', border: '#ddd6fe' },
  { fg: '#0891b2', bg: '#cffafe', border: '#a5f3fc' },
  { fg: '#059669', bg: '#d1fae5', border: '#a7f3d0' },
  { fg: '#d97706', bg: '#fef3c7', border: '#fde68a' },
  { fg: '#dc2626', bg: '#fee2e2', border: '#fecaca' },
  { fg: '#0369a1', bg: '#e0f2fe', border: '#bae6fd' },
  { fg: '#9333ea', bg: '#f3e8ff', border: '#e9d5ff' },
]

const getSubjectColor = (name = '') =>
  SUBJECT_COLORS[(name.charCodeAt(0) ?? 0) % SUBJECT_COLORS.length]

const getSubjectAbbr = (name = '') =>
  name.replace(/[()]/g, '').split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase()

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
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

// ─── LOADING SKELETON ─────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="space-y-3">
      <div className="h-16 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-xl border border-slate-100 dark:border-slate-800 overflow-hidden">
          <div className="h-14 bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.2 }} />
          <div className="p-4 space-y-2">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="h-10 rounded-lg bg-slate-50 dark:bg-slate-800/60 animate-pulse" style={{ opacity: 1 - j * 0.3 }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── SUBJECT BADGE ────────────────────────────────────────────────────────────

function SubjectBadge({ name }) {
  const { fg, bg } = getSubjectColor(name)
  return (
    <span
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-[9px] font-bold flex-shrink-0"
      style={{ background: bg, color: fg }}
    >
      {getSubjectAbbr(name)}
    </span>
  )
}

// ─── DESKTOP: DATE GROUP ROW ──────────────────────────────────────────────────

function DesktopDateGroup({ group, groupIdx, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <>
      {/* Date header row */}
      <tr
        className="cursor-pointer select-none border-b border-slate-200 dark:border-[rgba(99,102,241,0.12)]
          bg-gradient-to-r from-blue-50/80 via-slate-50/60 to-transparent
          dark:from-indigo-500/[0.08] dark:via-transparent dark:to-transparent
          hover:from-blue-100/80 dark:hover:from-indigo-500/[0.12] transition-colors"
        onClick={() => setOpen(p => !p)}
      >
        <td className="px-4 py-3.5 text-center w-12">
          <span className="text-[12px] font-bold text-blue-600 dark:text-blue-400 tabular-nums">
            {String(groupIdx + 1).padStart(2, '0')}
          </span>
        </td>
        <td className="px-4 py-3.5" colSpan={2}>
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
              <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </span>
            <div>
              <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100">
                Issue Date: {group.homework_date}
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                {group.subjects.length} subject{group.subjects.length !== 1 ? 's' : ''} assigned
              </p>
            </div>
          </div>
        </td>
        <td className="px-4 py-3.5 text-right pr-6">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-colors
            ${open
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
              : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {open
              ? <><ChevronUp className="w-3 h-3" /> Hide</>
              : <><ChevronDown className="w-3 h-3" /> Show</>
            }
          </span>
        </td>
      </tr>

      {/* Expanded subject rows */}
      {open && group.subjects.map((subj, si) => {
        const { fg, bg } = getSubjectColor(subj.subject_code)
        return (
          <tr
            key={si}
            className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.06)] bg-white dark:bg-[#1a1f35]
              hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
          >
            <td className="px-4 py-3 text-center">
              <span className="text-[11px] text-slate-400 dark:text-slate-600 tabular-nums">{si + 1}</span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5 pl-4 border-l-2 border-blue-100 dark:border-blue-500/20">
                <SubjectBadge name={subj.subject_code} />
                <span
                  className="text-[12px] font-bold px-2.5 py-1 rounded-lg"
                  style={{ background: bg, color: fg }}
                >
                  {subj.subject_code}
                </span>
              </div>
            </td>
            <td className="px-4 py-3" colSpan={2}>
              <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed">
                {subj.homework_desc}
              </p>
            </td>
          </tr>
        )
      })}
    </>
  )
}

// ─── MOBILE: DATE GROUP CARD ──────────────────────────────────────────────────

function MobileDateCard({ group, groupIdx, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">

      {/* Card Header */}
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-4 text-left
          hover:bg-slate-50/70 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Calendar icon */}
        <span className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 border border-blue-100 dark:border-blue-500/20">
          <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {group.homework_date}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {group.subjects.length} subject{group.subjects.length !== 1 ? 's' : ''} assigned
          </p>
        </div>

        {/* Subject count pill */}
        <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-100 dark:border-blue-500/20">
          {group.subjects.length}
        </span>

        {/* Chevron */}
        <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200 ml-1
          ${open
            ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 rotate-0'
            : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
          }`}
        >
          {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {/* Subject list — expanded */}
      {open && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.08)] divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.06)]">
          {group.subjects.map((subj, si) => {
            const { fg, bg, border } = getSubjectColor(subj.subject_code)
            return (
              <div key={si} className="px-4 py-3.5">
                {/* Subject header */}
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-600 w-4 flex-shrink-0 tabular-nums">
                    {si + 1}.
                  </span>
                  <SubjectBadge name={subj.subject_code} />
                  <span
                    className="text-[11px] font-bold px-2.5 py-1 rounded-lg flex-1"
                    style={{ background: bg, color: fg, border: `1px solid ${border}` }}
                  >
                    {subj.subject_code}
                  </span>
                </div>
                {/* Homework description */}
                <div className="ml-9 pl-3 border-l-2 border-slate-100 dark:border-slate-700">
                  <p className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                    {subj.homework_desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── SUMMARY STRIP ────────────────────────────────────────────────────────────

function SummaryStrip({ className: cls, groups }) {
  const totalSubjects = groups.reduce((s, g) => s + g.subjects.length, 0)
  const stats = [
    { icon: CalendarDays, label: 'Dates',    value: groups.length,  color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { icon: BookOpen,     label: 'Subjects', value: totalSubjects,  color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10' },
    { icon: GraduationCap, label: 'Class',   value: cls,            color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
  ]
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map(({ icon: Icon, label, value, color, bg }) => (
        <div key={label} className="rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-3 py-3 flex items-center gap-2.5 shadow-sm">
          <span className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg}`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </span>
          <div className="min-w-0">
            <p className={`text-[18px] font-bold tabular-nums leading-tight truncate ${color}`}>{value}</p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, selectedClass, setSelectedClass, errors }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Class</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <Field label="Class" error={errors.class} required>
            <NativeSelect
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              placeholder="-- Select Class --"
              error={errors.class}
            >
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all"
          >
            <Check className="w-4 h-4" />
            Apply Filter
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function ShowDailyHomework() {
  const [selectedClass, setSelectedClass] = useState('')
  const [groups,        setGroups]        = useState([])
  const [loading,       setLoading]       = useState(false)
  const [filterOpen,    setFilterOpen]    = useState(false)
  const [errors,        setErrors]        = useState({})
  const [toast,         setToast]         = useState(null)
  const [shown,         setShown]         = useState(false)
  const [shownClass,    setShownClass]    = useState('')
  const [expandAll,     setExpandAll]     = useState(false)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Load homework for selected class ─────────────────────────────────────
  const handleLoad = useCallback(() => {
    const err = {}
    if (!selectedClass) err.class = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setGroups([])
    setShown(false)

    // Simulate API delay
    setTimeout(() => {
      const data = HOMEWORK_DATA[selectedClass] || []
      setGroups(data)
      setShownClass(selectedClass)
      setShown(true)
      setLoading(false)
      setExpandAll(false)
      if (data.length === 0) {
        showToast(`No homework found for ${selectedClass}.`, 'error')
      } else {
        showToast(`Loaded ${data.length} date(s) of homework for ${selectedClass}.`)
      }
    }, 700)
  }, [selectedClass])

  const handleReset = () => {
    setSelectedClass('')
    setGroups([])
    setErrors({})
    setShown(false)
    setShownClass('')
    setExpandAll(false)
  }

  // Auto-load when class is changed on desktop
  const handleClassChange = (e) => {
    const val = e.target.value
    setSelectedClass(val)
    setErrors(p => ({ ...p, class: undefined }))
    if (val) {
      setLoading(true)
      setGroups([])
      setShown(false)
      setTimeout(() => {
        const data = HOMEWORK_DATA[val] || []
        setGroups(data)
        setShownClass(val)
        setShown(true)
        setLoading(false)
        setExpandAll(false)
        if (data.length === 0) {
          showToast(`No homework found for ${val}.`, 'error')
        } else {
          showToast(`Loaded ${data.length} date(s) of homework for ${val}.`)
        }
      }, 500)
    }
  }

  const hasResults = shown && groups.length > 0
  const totalSubjects = groups.reduce((s, g) => s + g.subjects.length, 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Daily Homework
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View class-wise homework assigned by teachers.
          </p>
        </div>
        {hasResults && (
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
            <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-400">
              {totalSubjects} task{totalSubjects !== 1 ? 's' : ''} across {groups.length} date{groups.length !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>

      {/* ── DESKTOP Filter Card ───────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Select Class" error={errors.class} required>
              <NativeSelect
                value={selectedClass}
                onChange={handleClassChange}
                placeholder="-- Select Class --"
                error={errors.class}
              >
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacers */}
            <div />
            <div />

            {/* Reset */}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {selectedClass ? `Class: ${selectedClass}` : 'Select Class'}
        </button>

        {selectedClass && (
          <button
            type="button"
            onClick={handleLoad}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70 transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
          </button>
        )}

        {hasResults && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile filter drawer */}
      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        selectedClass={selectedClass}
        setSelectedClass={(val) => {
          setSelectedClass(val)
          setErrors(p => ({ ...p, class: undefined }))
        }}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && <Skeleton />}

      {/* ── Results ───────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary strip */}
          <SummaryStrip className={shownClass} groups={groups} />

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Homework</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownClass}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {groups.length} date{groups.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Expand/Collapse all */}
              <button
                type="button"
                onClick={() => setExpandAll(p => !p)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                  bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
              >
                <LayoutList className="w-3.5 h-3.5" />
                {expandAll ? 'Collapse All' : 'Expand All'}
              </button>
            </div>

            {/* Info hint */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                {window.innerWidth < 640
                  ? 'Tap a date card to view subjects and homework.'
                  : 'Click a date row to expand and view subject-wise homework details.'}
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Issue Date / Subject', 'Homework Description', ''].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12 last:w-24">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group, gi) => (
                    <DesktopDateGroup
                      key={group.homework_date}
                      group={group}
                      groupIdx={gi}
                      defaultOpen={expandAll || gi === 0}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to see subject-wise homework.
              </p>
              {groups.map((group, gi) => (
                <MobileDateCard
                  key={group.homework_date}
                  group={group}
                  groupIdx={gi}
                  defaultOpen={gi === 0}
                />
              ))}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{groups.length}</span> date{groups.length !== 1 ? 's' : ''} ·{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{totalSubjects}</span> homework task{totalSubjects !== 1 ? 's' : ''} for{' '}
                <span className="font-semibold text-blue-600 dark:text-blue-400">{shownClass}</span>
              </p>
            </div>
          </div>
        </>
      )}

      {/* ── Empty / No homework ───────────────────────────────────────────── */}
      {shown && !loading && groups.length === 0 && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] p-12 flex flex-col items-center justify-center gap-4 text-center shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Inbox className="w-7 h-7 text-amber-500 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-slate-700 dark:text-slate-300">No Homework Found</p>
            <p className="text-[13px] text-slate-400 dark:text-slate-500 mt-1">
              No homework has been uploaded for <strong>{shownClass}</strong> yet.
            </p>
          </div>
          <button
            type="button"
            onClick={handleReset}
            className="mt-2 flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Try Another Class
          </button>
        </div>
      )}

      {/* ── Initial Empty State ────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No class selected</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a class above to view the daily homework.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
