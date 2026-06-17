/**
 * HolidayHomework.jsx
 * Folder: src/pages/Student/HolidayHomework/HolidayHomework.jsx
 *
 * Converts legacy ASPX "Holiday Homework" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session-wise holiday homework list (S.No, Title, File/View action)
 *  - Inline file/content preview panel (replaces ASPX LinkButton show)
 *  - Search/filter bar
 *  - Desktop: ERP-style dense table
 *  - Mobile: card-based layout, no horizontal scroll
 *  - Toast notifications, loading skeletons, empty states
 */

import { useState, useMemo, useCallback } from 'react'
import {
  BookOpen, FileText, Eye, X, Search,
  Download, AlertCircle, Check, Loader2,
  BookMarked, GraduationCap, ChevronDown,
  Filter, RefreshCw, SlidersHorizontal,
  Info, FolderOpen, Clock, Tag,
  ChevronRight, ChevronUp, ExternalLink,
  FileImage, FileArchive, FileCode, File
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'All Classes', 'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII'
]

// file_path doubles as a CSS class name in the legacy ASPX — repurposed as file type/category
const HOMEWORK_DATA = {
  '2022-23': [
    { id: 1,  title: 'Summer Holiday Homework - Mathematics',           class: 'Class V',   subject: 'Mathematics', file_path: 'pdf',  uploaded: '2022-05-12', content: 'Complete Chapter 5 exercises 1–20. Draw 5 geometric shapes and label them. Learn multiplication tables 12–20.' },
    { id: 2,  title: 'Summer Holiday Homework - English Grammar',       class: 'Class V',   subject: 'English',     file_path: 'doc',  uploaded: '2022-05-12', content: 'Write a 200-word essay on "My Best Summer Memory". Learn 30 new vocabulary words from the provided list.' },
    { id: 3,  title: 'Summer Holiday Homework - Science Project',       class: 'Class VI',  subject: 'Science',     file_path: 'pdf',  uploaded: '2022-05-14', content: 'Make a working model of the solar system using chart paper and thermocol balls. Label all planets.' },
    { id: 4,  title: 'Holiday Homework - Social Studies Map Work',      class: 'Class VI',  subject: 'Social',      file_path: 'img',  uploaded: '2022-05-14', content: 'Draw and label the physical map of India. Mark major rivers, mountains, and capitals.' },
    { id: 5,  title: 'Winter Holiday Homework - Hindi Essay',           class: 'Class VII', subject: 'Hindi',       file_path: 'doc',  uploaded: '2022-10-10', content: 'मेरे प्रिय त्योहार पर 300 शब्दों का निबंध लिखें। 10 मुहावरों के अर्थ और वाक्य लिखें।' },
    { id: 6,  title: 'Winter Holiday Homework - Computer Science',      class: 'Class VIII',subject: 'Computer',    file_path: 'pdf',  uploaded: '2022-10-10', content: 'Create a flowchart for a simple calculator program. Write pseudo-code for sorting 5 numbers.' },
    { id: 7,  title: 'Summer Holiday Homework - Drawing & Art',         class: 'Class III', subject: 'Art',         file_path: 'img',  uploaded: '2022-05-13', content: 'Draw and colour any 3 national symbols of India. Use A3 size chart paper.' },
    { id: 8,  title: 'Summer Holiday Homework - EVS Activity',          class: 'Class III', subject: 'EVS',         file_path: 'pdf',  uploaded: '2022-05-13', content: 'Paste 5 leaves from different plants. Label them and write 2 uses of each plant.' },
  ],
  '2023-24': [
    { id: 1,  title: 'Summer Holiday Homework - Mathematics',           class: 'Class VI',  subject: 'Mathematics', file_path: 'pdf',  uploaded: '2023-05-15', content: 'Complete exercise set A from Chapter 3 (Integers). Solve 15 word problems on fractions. Prepare a math chart on prime numbers up to 100.' },
    { id: 2,  title: 'Summer Holiday Homework - English Literature',    class: 'Class VI',  subject: 'English',     file_path: 'doc',  uploaded: '2023-05-15', content: 'Read "The Happy Prince" by Oscar Wilde and write a summary. Write a book review (150 words). Learn 20 new words with meanings.' },
    { id: 3,  title: 'Holiday Homework - Science Experiments',          class: 'Class VII', subject: 'Science',     file_path: 'pdf',  uploaded: '2023-05-16', content: 'Perform 3 simple science experiments at home. Document with photos: (1) Seed germination (2) Vinegar + baking soda reaction (3) Shadow formation.' },
    { id: 4,  title: 'Holiday Homework - History Timeline',             class: 'Class VII', subject: 'History',     file_path: 'img',  uploaded: '2023-05-17', content: 'Create a colourful timeline poster of major events of the Indian Freedom Struggle (1857–1947).' },
    { id: 5,  title: 'Summer Holiday Homework - Geography Project',     class: 'Class IX',  subject: 'Geography',   file_path: 'pdf',  uploaded: '2023-05-18', content: 'Prepare a project on Climate Zones of India. Include maps, charts, and photographs. Minimum 10 pages.' },
    { id: 6,  title: 'Holiday Homework - Physics Numericals',           class: 'Class IX',  subject: 'Physics',     file_path: 'doc',  uploaded: '2023-05-18', content: 'Solve all 25 numericals from Chapter 1 (Motion). Show all formulas and units. Draw velocity-time graphs.' },
    { id: 7,  title: 'Winter Holiday Homework - Chemistry Lab Notes',   class: 'Class X',   subject: 'Chemistry',   file_path: 'pdf',  uploaded: '2023-10-12', content: 'Write detailed notes on all 5 practicals performed this term. Include observations, results, and conclusions.' },
    { id: 8,  title: 'Winter Holiday Homework - Mathematics Practice',  class: 'Class X',   subject: 'Mathematics', file_path: 'pdf',  uploaded: '2023-10-12', content: 'Complete NCERT exercises: Chapter 3 (Pair of Linear Equations), Chapter 4 (Quadratic Equations). All steps mandatory.' },
    { id: 9,  title: 'Summer Holiday Homework - Nursery Activity Book', class: 'Nursery',   subject: 'Activity',    file_path: 'img',  uploaded: '2023-05-12', content: 'Complete pages 1–30 in the activity book. Practice writing A–Z (capital and small). Colour the given pictures neatly.' },
    { id: 10, title: 'Summer Holiday Homework - LKG Drawing',           class: 'LKG',       subject: 'Drawing',     file_path: 'img',  uploaded: '2023-05-12', content: 'Draw and colour 5 animals and 5 fruits. Practice number writing 1–50.' },
  ],
  '2024-25': [
    { id: 1,  title: 'Summer Holiday Homework - Mathematics (Algebra)', class: 'Class VIII',subject: 'Mathematics', file_path: 'pdf',  uploaded: '2024-05-14', content: 'Complete all exercises in Chapter 2 (Linear Equations in One Variable) and Chapter 6 (Squares and Square Roots). Solve 30 practice problems.' },
    { id: 2,  title: 'Summer Holiday Homework - English Writing Skills', class: 'Class VIII',subject: 'English',     file_path: 'doc',  uploaded: '2024-05-14', content: 'Write 3 formal letters (complaint, request, application). Write 2 paragraphs on given topics. Prepare a poster on "Save Water".' },
    { id: 3,  title: 'Holiday Homework - Biology Chapter Notes',        class: 'Class IX',  subject: 'Biology',     file_path: 'pdf',  uploaded: '2024-05-16', content: 'Make detailed notes with diagrams for Chapters 1–3 (Cell, Tissues, Diversity in Living Organisms). Draw and label all diagrams.' },
    { id: 4,  title: 'Holiday Homework - Chemistry Activity',           class: 'Class IX',  subject: 'Chemistry',   file_path: 'pdf',  uploaded: '2024-05-16', content: 'Collect samples of 5 acids and 5 bases found at home. Test with litmus paper. Record results in a table. Write observations.' },
    { id: 5,  title: 'Summer Holiday Homework - Social Science Project', class: 'Class X',   subject: 'Social',      file_path: 'doc',  uploaded: '2024-05-15', content: 'Prepare a comprehensive project on "Democratic Politics in India". Include case studies, newspaper clippings, and charts. Minimum 15 pages.' },
    { id: 6,  title: 'Summer Holiday Homework - Physics Practicals',    class: 'Class X',   subject: 'Physics',     file_path: 'pdf',  uploaded: '2024-05-15', content: 'Record all 10 practicals in the lab manual with neat diagrams. Complete all calculations and error analysis.' },
    { id: 7,  title: 'Holiday Homework - Class XI Mathematics',         class: 'Class XI',  subject: 'Mathematics', file_path: 'pdf',  uploaded: '2024-05-17', content: 'Solve all miscellaneous exercises from Chapters 1–5. Attempt previous year questions from the given booklet (Sets, Relations, Trigonometry, Complex Numbers, Linear Inequalities).' },
    { id: 8,  title: 'Holiday Homework - Class XII Physics Revision',   class: 'Class XII', subject: 'Physics',     file_path: 'pdf',  uploaded: '2024-05-17', content: 'Revise all derivations from Chapters 1–4. Solve 50 numericals from the practice sheet. Prepare chapter-wise formula cards.' },
    { id: 9,  title: 'Summer Holiday Homework - UKG Activity',         class: 'UKG',       subject: 'Activity',    file_path: 'img',  uploaded: '2024-05-13', content: 'Complete the activity worksheet. Practice writing 1–100. Draw your family and colour it. Learn days of the week and months of the year.' },
    { id: 10, title: 'Holiday Homework - Class I Hindi Practice',       class: 'Class I',   subject: 'Hindi',       file_path: 'doc',  uploaded: '2024-05-13', content: 'स्वर और व्यंजन लिखने का अभ्यास करें। 10 चित्रों के नाम हिंदी में लिखें। मेरा परिवार पर 5 वाक्य लिखें।' },
    { id: 11, title: 'Holiday Homework - Class IV Science Model',       class: 'Class IV',  subject: 'Science',     file_path: 'pdf',  uploaded: '2024-05-14', content: 'Make a model of the water cycle using a plastic box, sand, and water. Click photographs at each step. Write 10 lines about the water cycle.' },
    { id: 12, title: 'Winter Holiday Homework - Class XII Chemistry',   class: 'Class XII', subject: 'Chemistry',   file_path: 'pdf',  uploaded: '2024-10-14', content: 'Revise all reactions from Chapters 1–6. Write complete mechanisms for named reactions. Solve PYQs from 2019–2023.' },
  ],
  '2025-26': [
    { id: 1,  title: 'Summer Holiday Homework - Class VI Science',      class: 'Class VI',  subject: 'Science',     file_path: 'pdf',  uploaded: '2025-05-12', content: 'Prepare a scrapbook on "Components of Food". Include pictures, nutrient charts, and balanced diet plan. Label all diagrams.' },
    { id: 2,  title: 'Summer Holiday Homework - Class VI Maths',        class: 'Class VI',  subject: 'Mathematics', file_path: 'pdf',  uploaded: '2025-05-12', content: 'Solve Chapter 1 (Knowing Our Numbers) and Chapter 2 (Whole Numbers) complete exercises. Prepare a number chart.' },
    { id: 3,  title: 'Holiday Homework - Class VII History Project',    class: 'Class VII', subject: 'History',     file_path: 'doc',  uploaded: '2025-05-13', content: 'Make a detailed project on the Mughal Empire: rulers, art, architecture, and administration. Include map work. Minimum 12 pages.' },
    { id: 4,  title: 'Holiday Homework - Class VIII Computer Project',  class: 'Class VIII',subject: 'Computer',    file_path: 'pdf',  uploaded: '2025-05-13', content: 'Create a PowerPoint presentation (min 15 slides) on "Cybersecurity in Daily Life". Include real examples, stats, and safety tips.' },
    { id: 5,  title: 'Summer Holiday Homework - Class X Board Prep',    class: 'Class X',   subject: 'All Subjects',file_path: 'pdf',  uploaded: '2025-05-14', content: 'Complete the revision worksheet for all 5 subjects. Solve 2 sample papers each for Maths, Science, English, Social, and Hindi.' },
    { id: 6,  title: 'Holiday Homework - Class XI Biology',             class: 'Class XI',  subject: 'Biology',     file_path: 'pdf',  uploaded: '2025-05-14', content: 'Draw and label all diagrams from Unit 1 (Diversity of Living World). Write detailed notes on classification systems. Solve NCERT exercises.' },
    { id: 7,  title: 'Holiday Homework - Class XI Accounts Project',    class: 'Class XI',  subject: 'Accounts',    file_path: 'doc',  uploaded: '2025-05-15', content: 'Prepare a complete set of final accounts for a given trial balance. Include Trading A/c, P&L A/c, and Balance Sheet.' },
    { id: 8,  title: 'Holiday Homework - Class XII English Core',       class: 'Class XII', subject: 'English',     file_path: 'doc',  uploaded: '2025-05-15', content: 'Read "The Last Lesson" and "Lost Spring" (Flamingo). Write character sketches, summary, and theme analysis for each. Prepare question-answer notes.' },
    { id: 9,  title: 'Summer Holiday Homework - Class I Activity',      class: 'Class I',   subject: 'Activity',    file_path: 'img',  uploaded: '2025-05-11', content: 'Complete the holiday activity booklet (pages 1–40). Practice writing numbers 1–100. Draw and colour 10 vegetables.' },
    { id: 10, title: 'Summer Holiday Homework - Class II English',      class: 'Class II',  subject: 'English',     file_path: 'doc',  uploaded: '2025-05-11', content: 'Learn and write 3-letter and 4-letter words (20 each). Write 5 sentences about your summer vacation. Draw and label any 5 fruits.' },
    { id: 11, title: 'Holiday Homework - Nursery Play Activity',        class: 'Nursery',   subject: 'Activity',    file_path: 'img',  uploaded: '2025-05-10', content: 'Tear and paste activity (provided sheets). Colour the given worksheet. Practice A–E tracing.' },
    { id: 12, title: 'Holiday Homework - Class III EVS Project',        class: 'Class III', subject: 'EVS',         file_path: 'pdf',  uploaded: '2025-05-12', content: 'Make a chart on "Our Environment". Show land, water, air, and living things. Write 5 ways to protect the environment.' },
  ]
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const FILE_TYPE_CONFIG = {
  pdf:  { icon: FileText,    color: 'text-rose-600 dark:text-rose-400',   bg: 'bg-rose-50 dark:bg-rose-500/10',   border: 'border-rose-100 dark:border-rose-500/20',   label: 'PDF'  },
  doc:  { icon: FileCode,    color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-500/10',   border: 'border-blue-100 dark:border-blue-500/20',   label: 'DOC'  },
  img:  { icon: FileImage,   color: 'text-violet-600 dark:text-violet-400', bg: 'bg-violet-50 dark:bg-violet-500/10', border: 'border-violet-100 dark:border-violet-500/20', label: 'IMG' },
  zip:  { icon: FileArchive, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-100 dark:border-amber-500/20', label: 'ZIP' },
}

const SUBJECT_COLORS = {
  Mathematics: { fg: '#1d4ed8', bg: '#dbeafe' },
  English:     { fg: '#0891b2', bg: '#cffafe' },
  Science:     { fg: '#059669', bg: '#d1fae5' },
  Hindi:       { fg: '#dc2626', bg: '#fee2e2' },
  Social:      { fg: '#7c3aed', bg: '#ede9fe' },
  History:     { fg: '#d97706', bg: '#fef3c7' },
  Geography:   { fg: '#0369a1', bg: '#e0f2fe' },
  Physics:     { fg: '#6d28d9', bg: '#f5f3ff' },
  Chemistry:   { fg: '#c026d3', bg: '#fdf4ff' },
  Biology:     { fg: '#16a34a', bg: '#f0fdf4' },
  Computer:    { fg: '#0f766e', bg: '#f0fdfa' },
  Accounts:    { fg: '#92400e', bg: '#fef3c7' },
  Art:         { fg: '#db2777', bg: '#fdf2f8' },
  Drawing:     { fg: '#ec4899', bg: '#fce7f3' },
  EVS:         { fg: '#15803d', bg: '#dcfce7' },
  Activity:    { fg: '#9333ea', bg: '#f3e8ff' },
  default:     { fg: '#475569', bg: '#f1f5f9' },
}

const getSubjectColor = (sub) => SUBJECT_COLORS[sub] || SUBJECT_COLORS.default
const getFileConfig = (type) => FILE_TYPE_CONFIG[type] || { icon: File, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200', label: 'FILE' }

const formatDate = (d) => {
  const [y, m, day] = d.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${parseInt(day)} ${months[parseInt(m) - 1]} ${y}`
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
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
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

// ─── CONTENT PREVIEW PANEL ────────────────────────────────────────────────────

function PreviewPanel({ item, onClose }) {
  if (!item) return null
  const fileCfg = getFileConfig(item.file_path)
  const subjColor = getSubjectColor(item.subject)
  const FileIcon = fileCfg.icon

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Panel — bottom sheet on mobile, right drawer on desktop */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 md:inset-y-0 md:right-0 md:inset-x-auto md:w-[420px]
          bg-white dark:bg-[#1a1f35] shadow-2xl flex flex-col
          rounded-t-2xl md:rounded-none md:border-l border-slate-200 dark:border-[rgba(99,102,241,0.2)]"
        style={{ maxHeight: '90vh', animation: 'panelIn .25s ease' }}
      >
        <style>{`
          @keyframes panelIn {
            from { opacity: 0; transform: translateY(30px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @media (min-width: 768px) {
            @keyframes panelIn {
              from { opacity: 0; transform: translateX(30px); }
              to   { opacity: 1; transform: translateX(0); }
            }
          }
        `}</style>

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>

        {/* Header */}
        <div className="flex items-start gap-3 px-5 py-4 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${fileCfg.bg} ${fileCfg.border} border`}>
            <FileIcon className={`w-5 h-5 ${fileCfg.color}`} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
              {item.title}
            </p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span
                className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: subjColor.bg, color: subjColor.fg }}
              >
                {item.subject}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">{item.class}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex-shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meta info */}
        <div className="px-5 py-3 flex items-center gap-4 bg-slate-50/60 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>Uploaded: <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(item.uploaded)}</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
            <Tag className="w-3.5 h-3.5 flex-shrink-0" />
            <span className={`font-bold ${fileCfg.color}`}>{fileCfg.label}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <p className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Instructions / Content</p>
          </div>
          <div className="rounded-xl bg-blue-50/60 dark:bg-blue-500/[0.05] border border-blue-100 dark:border-blue-500/15 p-4">
            <p className="text-[13px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
              {item.content}
            </p>
          </div>

          {/* Simulated download button */}
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-3">Actions</p>
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Eye className="w-4 h-4" />
              View File (API Integration Pending)
            </button>
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              Download File
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx, onShow }) {
  const fileCfg = getFileConfig(row.file_path)
  const subjColor = getSubjectColor(row.subject)
  const FileIcon = fileCfg.icon

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-blue-50/30 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12 flex-shrink-0">
        {idx}
      </td>

      {/* File Type Icon */}
      <td className="px-4 py-3 w-12">
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${fileCfg.bg} ${fileCfg.border} border`}>
          <FileIcon className={`w-4 h-4 ${fileCfg.color}`} />
        </span>
      </td>

      {/* Title */}
      <td className="px-4 py-3 min-w-0">
        <p className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 leading-snug">
          {row.title}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center gap-1">
          <Clock className="w-3 h-3 flex-shrink-0" /> {formatDate(row.uploaded)}
        </p>
      </td>

      {/* Class */}
      <td className="px-4 py-3 whitespace-nowrap">
        <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">{row.class}</span>
      </td>

      {/* Subject */}
      <td className="px-4 py-3">
        <span
          className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap"
          style={{ background: subjColor.bg, color: subjColor.fg }}
        >
          {row.subject}
        </span>
      </td>

      {/* File Type Badge */}
      <td className="px-4 py-3 text-center">
        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${fileCfg.bg} ${fileCfg.color} border ${fileCfg.border}`}>
          {fileCfg.label}
        </span>
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-center">
        <button
          onClick={() => onShow(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/20
            transition-all active:scale-95 group-hover:shadow-blue-500/30"
        >
          <Eye className="w-3.5 h-3.5" />
          Show
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────

function MobileCard({ row, idx, onShow }) {
  const [expanded, setExpanded] = useState(false)
  const fileCfg = getFileConfig(row.file_path)
  const subjColor = getSubjectColor(row.subject)
  const FileIcon = fileCfg.icon

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Card header — always visible */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* File type icon */}
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${fileCfg.bg} border ${fileCfg.border}`}>
          <FileIcon className={`w-5 h-5 ${fileCfg.color}`} />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 leading-snug line-clamp-2">
            {row.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: subjColor.bg, color: subjColor.fg }}
            >
              {row.subject}
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{row.class}</span>
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${fileCfg.bg} ${fileCfg.color}`}>
              {fileCfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2 px-4 pb-3.5">
        <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 flex-1">
          <Clock className="w-3 h-3 flex-shrink-0" />
          {formatDate(row.uploaded)}
        </p>

        <button
          onClick={() => setExpanded(p => !p)}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold
            bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
        >
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          {expanded ? 'Less' : 'Details'}
        </button>

        <button
          onClick={() => onShow(row)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-600 text-white shadow-sm shadow-blue-500/20 transition-all active:scale-95"
        >
          <Eye className="w-3.5 h-3.5" />
          Show
        </button>
      </div>

      {/* Expanded content preview */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-3 bg-blue-50/40 dark:bg-blue-500/[0.04]">
          <p className="text-[11px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-2 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5" /> Instructions
          </p>
          <p className="text-[12px] text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-4">
            {row.content}
          </p>
          <button
            onClick={() => onShow(row)}
            className="mt-2 text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-1 hover:underline"
          >
            Read more <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}

// ─── FILTER DRAWER (MOBILE) ───────────────────────────────────────────────────

function FilterDrawer({ open, onClose, session, setSession, classFilter, setClassFilter, errors, onLoad, loading }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35]
          border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class (Optional)">
            <NativeSelect value={classFilter} onChange={e => setClassFilter(e.target.value)}>
              {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button type="button" onClick={() => { onLoad(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Load Homework
          </button>
        </div>
      </div>
    </>
  )
}

// ─── STATS ROW ────────────────────────────────────────────────────────────────

function StatChip({ icon: Icon, label, value, color }) {
  const colors = {
    blue:   'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 border-blue-100 dark:border-blue-500/20',
    emerald:'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-100 dark:border-emerald-500/20',
    violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 border-violet-100 dark:border-violet-500/20',
    amber:  'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border-amber-100 dark:border-amber-500/20',
  }
  return (
    <div className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border flex-1 min-w-0 ${colors[color]}`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-[18px] font-bold tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] opacity-75 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function HolidayHomework() {
  const [session,      setSession]      = useState('')
  const [classFilter,  setClassFilter]  = useState('All Classes')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')
  const [preview,      setPreview]      = useState(null) // currently previewed item

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Load data (simulate API) ───────────────────────────────────────────────
  const handleLoad = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = STRENGTH_DATA_MAP[session] || []
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} homework records for session ${session}.`)
    }, 650)
  }, [session])

  const handleReset = () => {
    setSession(''); setClassFilter('All Classes')
    setRows([]); setSearch(''); setErrors({})
    setShown(false); setShownSession(''); setPreview(null)
  }

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let data = rows
    if (classFilter && classFilter !== 'All Classes') {
      data = data.filter(r => r.class === classFilter)
    }
    if (search) {
      const q = search.toLowerCase()
      data = data.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.subject.toLowerCase().includes(q) ||
        r.class.toLowerCase().includes(q)
      )
    }
    return data
  }, [rows, classFilter, search])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    filtered.length,
    subjects: [...new Set(filtered.map(r => r.subject))].length,
    classes:  [...new Set(filtered.map(r => r.class))].length,
    pdfs:     filtered.filter(r => r.file_path === 'pdf').length,
  }), [filtered])

  const hasResults = shown && rows.length > 0
  const activeFilters = (session ? 1 : 0) + (classFilter !== 'All Classes' ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookMarked className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Holiday Homework
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and download holiday homework files by session and class.
          </p>
        </div>
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Class">
              <NativeSelect value={classFilter} onChange={e => setClassFilter(e.target.value)}>
                {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <div />

            <div className="flex gap-2">
              <button type="button" onClick={handleLoad} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Session & Class'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        classFilter={classFilter}
        setClassFilter={setClassFilter}
        errors={errors}
        onLoad={handleLoad}
        loading={loading}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatChip icon={BookOpen}      label="Total Entries"  value={stats.total}    color="blue"    />
            <StatChip icon={GraduationCap} label="Subjects"       value={stats.subjects} color="emerald" />
            <StatChip icon={FolderOpen}    label="Classes"        value={stats.classes}  color="violet"  />
            <StatChip icon={FileText}      label="PDF Files"      value={stats.pdfs}     color="amber"   />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Holiday Homework List</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
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
                  placeholder="Search title, subject, class…"
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
                Click <strong>Show</strong> on any row to view the file content and download options.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No.', 'Type', 'Holiday Homework Title', 'Class', 'Subject', 'Format', 'File'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.id} row={row} idx={i + 1} onShow={setPreview} />
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
                  <span className="text-[13px]">No records match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap <strong>Show</strong> to view full instructions &amp; download.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={row.id} row={row} idx={i + 1} onShow={setPreview} />
                  ))}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookMarked className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No homework loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to load holiday homework.
            </p>
          </div>
        </div>
      )}

      {/* ── Preview Panel ─────────────────────────────────────────────────── */}
      {preview && <PreviewPanel item={preview} onClose={() => setPreview(null)} />}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── DATA MAP (alias — connects HOMEWORK_DATA to the component variable name used above) ──
const STRENGTH_DATA_MAP = HOMEWORK_DATA
