/**
 * Define_ClassSubject.jsx
 * Folder: src/pages/Configuration/Define_ClassSubject.jsx
 *
 * Converts legacy ASPX "Class Subject" configuration page to React + Tailwind.
 *
 * Flow:
 *  1. Select Class → Section dropdown populates
 *  2. Click "Show" → subject grid appears
 *  3. Toggle checkboxes (Selected, Optional, Grade) + set Subject Order
 *  4. Click "Save" → persists
 *
 * Desktop: filter bar + dense table grid
 * Mobile:  filter drawer + subject cards with accordions
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  BookOpen, ChevronDown, AlertCircle, X, Check, Loader2,
  SlidersHorizontal, Eye, Save, RefreshCw, Search,
  CheckSquare, Square, Info, Filter, ChevronRight,
  GraduationCap, Hash, ToggleLeft, ToggleRight,
  BookMarked, Layers, Settings2, Home
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ────────────────────────────────────────────────────

const CLASSES = [
  { id: 1,  name: 'Nursery'    },
  { id: 2,  name: 'LKG'        },
  { id: 3,  name: 'UKG'        },
  { id: 4,  name: 'Class I'    },
  { id: 5,  name: 'Class II'   },
  { id: 6,  name: 'Class III'  },
  { id: 7,  name: 'Class IV'   },
  { id: 8,  name: 'Class V'    },
  { id: 9,  name: 'Class VI'   },
  { id: 10, name: 'Class VII'  },
  { id: 11, name: 'Class VIII' },
  { id: 12, name: 'Class IX'   },
  { id: 13, name: 'Class X'    },
  { id: 14, name: 'Class XI'   },
  { id: 15, name: 'Class XII'  },
]

// Sections per class (some classes have multiple sections)
const SECTIONS_MAP = {
  1:  [{ id: 1, name: 'A' }],
  2:  [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
  3:  [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
  4:  [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
  5:  [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
  6:  [{ id: 1, name: 'A' }],
  7:  [{ id: 1, name: 'A' }],
  8:  [{ id: 1, name: 'A' }],
  9:  [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
  10: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
  11: [{ id: 1, name: 'A' }],
  12: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
  13: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }],
  14: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }],
  15: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }, { id: 3, name: 'C' }],
}

// Master subject list — all possible subjects
const ALL_SUBJECTS = [
  { subject_id: 1,  Subject: 'English',          subject_code: 'ENG' },
  { subject_id: 2,  Subject: 'Hindi',             subject_code: 'HIN' },
  { subject_id: 3,  Subject: 'Mathematics',       subject_code: 'MAT' },
  { subject_id: 4,  Subject: 'Science',           subject_code: 'SCI' },
  { subject_id: 5,  Subject: 'Social Science',    subject_code: 'SST' },
  { subject_id: 6,  Subject: 'Computer Science',  subject_code: 'CS'  },
  { subject_id: 7,  Subject: 'Sanskrit',          subject_code: 'SAN' },
  { subject_id: 8,  Subject: 'Physical Education',subject_code: 'PE'  },
  { subject_id: 9,  Subject: 'Drawing',           subject_code: 'DRW' },
  { subject_id: 10, Subject: 'General Knowledge', subject_code: 'GK'  },
  { subject_id: 11, Subject: 'Physics',           subject_code: 'PHY' },
  { subject_id: 12, Subject: 'Chemistry',         subject_code: 'CHE' },
  { subject_id: 13, Subject: 'Biology',           subject_code: 'BIO' },
  { subject_id: 14, Subject: 'Accountancy',       subject_code: 'ACC' },
  { subject_id: 15, Subject: 'Business Studies',  subject_code: 'BS'  },
  { subject_id: 16, Subject: 'Economics',         subject_code: 'ECO' },
  { subject_id: 17, Subject: 'History',           subject_code: 'HIS' },
  { subject_id: 18, Subject: 'Geography',         subject_code: 'GEO' },
  { subject_id: 19, Subject: 'Civics',            subject_code: 'CIV' },
  { subject_id: 20, Subject: 'Music',             subject_code: 'MUS' },
]

// Simulate class-specific subject assignments (status=1 means already assigned)
const getSubjectsForClass = (classId) => {
  // Lower classes: basic subjects assigned
  if (classId <= 3) {
    return ALL_SUBJECTS.filter(s => [1,2,3,9,10,20].includes(s.subject_id)).map((s, i) => ({
      ...s,
      status:     [1,2,3].includes(s.subject_id) ? '1' : '0',
      isoptional: s.subject_id === 9 ? '1' : '0',
      isgrade:    '0',
      subject_order: String(i + 1),
    }))
  }
  // Middle classes
  if (classId <= 8) {
    return ALL_SUBJECTS.filter(s => [1,2,3,4,5,6,7,8,9,10].includes(s.subject_id)).map((s, i) => ({
      ...s,
      status:     [1,2,3,4,5].includes(s.subject_id) ? '1' : '0',
      isoptional: [7,9].includes(s.subject_id) ? '1' : '0',
      isgrade:    s.subject_id === 8 ? '1' : '0',
      subject_order: String(i + 1),
    }))
  }
  // High school (IX–X)
  if (classId <= 13) {
    return ALL_SUBJECTS.filter(s => [1,2,3,4,5,6,7,8,10,17,18,19].includes(s.subject_id)).map((s, i) => ({
      ...s,
      status:     [1,2,3,4,5].includes(s.subject_id) ? '1' : '0',
      isoptional: [6,7,17,18,19].includes(s.subject_id) ? '1' : '0',
      isgrade:    s.subject_id === 8 ? '1' : '0',
      subject_order: String(i + 1),
    }))
  }
  // Senior secondary (XI–XII)
  return ALL_SUBJECTS.filter(s => [1,2,3,8,11,12,13,14,15,16,17,18,19].includes(s.subject_id)).map((s, i) => ({
    ...s,
    status:     [1,11,12,13].includes(s.subject_id) ? '1' : '0',
    isoptional: [14,15,16,17,18,19].includes(s.subject_id) ? '1' : '0',
    isgrade:    s.subject_id === 8 ? '1' : '0',
    subject_order: String(i + 1),
  }))
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

const SUBJECT_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const subjectColor = (id) => SUBJECT_COLORS[id % SUBJECT_COLORS.length]

// ─── PRIMITIVE COMPONENTS ───────────────────────────────────────────────────

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

// ─── CUSTOM CHECKBOX ────────────────────────────────────────────────────────

function StyledCheckbox({ checked, onChange, colorClass = 'text-blue-600' }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-5 h-5 rounded flex items-center justify-center border transition-all flex-shrink-0
        ${checked
          ? 'bg-blue-600 border-blue-600 dark:bg-indigo-500 dark:border-indigo-500'
          : 'bg-white border-slate-300 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.3)]'
        }`}
      aria-checked={checked}
      role="checkbox"
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </button>
  )
}

// ─── FILTER DRAWER (Mobile) ─────────────────────────────────────────────────

function FilterDrawer({ open, onClose, classId, setClassId, sectionId, setSectionId, sections, onShow, loading, errors, onReset }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Class &amp; Section</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Class" error={errors.classId} required>
            <NativeSelect
              value={classId}
              onChange={e => { setClassId(e.target.value); setSectionId('') }}
              placeholder="-- Select Class --"
              error={errors.classId}
            >
              {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </NativeSelect>
          </Field>
          {sections.length > 0 && (
            <Field label="Section" error={errors.sectionId}>
              <NativeSelect
                value={sectionId}
                onChange={e => setSectionId(e.target.value)}
                placeholder="-- Select Section --"
                error={errors.sectionId}
              >
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </NativeSelect>
            </Field>
          )}
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3">
          <button type="button" onClick={() => { onReset(); onClose() }}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Subjects
          </button>
        </div>
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ──────────────────────────────────────────────────────

function DesktopRow({ subject, idx, onToggle }) {
  const { fg, bg } = subjectColor(subject.subject_id)
  const abbr = subject.subject_code

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Select checkbox */}
      <td className="px-4 py-3 text-center">
        <div className="flex justify-center">
          <StyledCheckbox
            checked={subject.status === '1'}
            onChange={(v) => onToggle(subject.subject_id, 'status', v ? '1' : '0')}
          />
        </div>
      </td>

      {/* Subject Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {abbr}
          </span>
          <div>
            <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{subject.Subject}</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500">{subject.subject_code}</p>
          </div>
        </div>
      </td>

      {/* Is Optional */}
      <td className="px-4 py-3 text-center">
        <div className="flex justify-center">
          <StyledCheckbox
            checked={subject.isoptional === '1'}
            onChange={(v) => onToggle(subject.subject_id, 'isoptional', v ? '1' : '0')}
          />
        </div>
      </td>

      {/* Is Grade */}
      <td className="px-4 py-3 text-center">
        <div className="flex justify-center">
          <StyledCheckbox
            checked={subject.isgrade === '1'}
            onChange={(v) => onToggle(subject.subject_id, 'isgrade', v ? '1' : '0')}
          />
        </div>
      </td>

      {/* Subject Order */}
      <td className="px-4 py-3 text-center">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={subject.subject_order}
          onChange={e => {
            const val = e.target.value.replace(/[^0-9]/g, '')
            onToggle(subject.subject_id, 'subject_order', val)
          }}
          className="w-16 text-center px-2 py-1.5 text-[12px] font-semibold rounded-lg border outline-none transition-all tabular-nums
            bg-white text-slate-700 border-slate-200
            focus:border-blue-400 focus:ring-2 focus:ring-blue-100
            dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:focus:border-indigo-400"
        />
      </td>
    </tr>
  )
}

// ─── MOBILE SUBJECT CARD ────────────────────────────────────────────────────

function MobileCard({ subject, idx, onToggle }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = subjectColor(subject.subject_id)
  const isSelected = subject.status === '1'

  return (
    <div className={`rounded-xl border overflow-hidden shadow-sm transition-all
      ${isSelected
        ? 'border-blue-200 dark:border-indigo-500/30 bg-white dark:bg-[#1a1f35]'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] opacity-80'
      }`}>

      {/* Card Header — always visible */}
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Select checkbox */}
        <div onClick={e => e.stopPropagation()}>
          <StyledCheckbox
            checked={isSelected}
            onChange={(v) => onToggle(subject.subject_id, 'status', v ? '1' : '0')}
          />
        </div>

        {/* Subject badge */}
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[9px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {subject.subject_code}
        </span>

        {/* Name */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">
            {subject.Subject}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            Code: <span className="font-semibold">{subject.subject_code}</span>
            &nbsp;·&nbsp;
            {isSelected
              ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Selected</span>
              : <span className="text-slate-400">Not selected</span>
            }
          </p>
        </div>

        {/* Expand button */}
        <button
          type="button"
          onClick={() => setExpanded(p => !p)}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 flex-shrink-0"
        >
          <ChevronRight className={`w-4 h-4 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`} />
        </button>
      </div>

      {/* Expanded options */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Is Optional */}
            <div className={`rounded-xl border p-3 flex items-center gap-2.5 cursor-pointer transition-all
              ${subject.isoptional === '1'
                ? 'bg-violet-50 border-violet-200 dark:bg-violet-500/10 dark:border-violet-500/25'
                : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-[rgba(99,102,241,0.15)]'
              }`}
              onClick={() => onToggle(subject.subject_id, 'isoptional', subject.isoptional === '1' ? '0' : '1')}
            >
              <div onClick={e => e.stopPropagation()}>
                <StyledCheckbox
                  checked={subject.isoptional === '1'}
                  onChange={(v) => onToggle(subject.subject_id, 'isoptional', v ? '1' : '0')}
                />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Optional</p>
                <p className="text-[10px] text-slate-400">Is elective?</p>
              </div>
            </div>

            {/* Is Grade */}
            <div className={`rounded-xl border p-3 flex items-center gap-2.5 cursor-pointer transition-all
              ${subject.isgrade === '1'
                ? 'bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/25'
                : 'bg-slate-50 border-slate-200 dark:bg-slate-800/50 dark:border-[rgba(99,102,241,0.15)]'
              }`}
              onClick={() => onToggle(subject.subject_id, 'isgrade', subject.isgrade === '1' ? '0' : '1')}
            >
              <div onClick={e => e.stopPropagation()}>
                <StyledCheckbox
                  checked={subject.isgrade === '1'}
                  onChange={(v) => onToggle(subject.subject_id, 'isgrade', v ? '1' : '0')}
                />
              </div>
              <div>
                <p className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Grade</p>
                <p className="text-[10px] text-slate-400">Grade based?</p>
              </div>
            </div>
          </div>

          {/* Subject Order */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-[rgba(99,102,241,0.15)] px-3 py-2.5">
            <Hash className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300 flex-1">Subject Order</span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={subject.subject_order}
              onChange={e => {
                const val = e.target.value.replace(/[^0-9]/g, '')
                onToggle(subject.subject_id, 'subject_order', val)
              }}
              className="w-14 text-center px-2 py-1 text-[13px] font-bold rounded-lg border outline-none transition-all
                bg-white text-slate-700 border-slate-200
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]"
            />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── SELECT ALL HEADER ──────────────────────────────────────────────────────

function SelectAllBar({ subjects, onToggleAll, onToggleAllOptional, onToggleAllGrade }) {
  const allSelected   = subjects.length > 0 && subjects.every(s => s.status === '1')
  const someSelected  = subjects.some(s => s.status === '1')
  const selectedCount = subjects.filter(s => s.status === '1').length

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-2.5 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
      <button
        type="button"
        onClick={() => onToggleAll(!allSelected)}
        className="flex items-center gap-2 text-[12px] font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-indigo-400 transition-colors"
      >
        {allSelected
          ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
          : someSelected
            ? <CheckSquare className="w-4 h-4 text-slate-400" />
            : <Square className="w-4 h-4 text-slate-400" />
        }
        {allSelected ? 'Deselect All' : 'Select All'}
      </button>
      <span className="text-[11px] text-slate-400 dark:text-slate-500">
        {selectedCount} / {subjects.length} selected
      </span>
      <span className="flex-1" />
      <button
        type="button"
        onClick={onToggleAllOptional}
        className="text-[11px] font-semibold text-violet-600 dark:text-violet-400 hover:underline"
      >
        Toggle All Optional
      </button>
      <button
        type="button"
        onClick={onToggleAllGrade}
        className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:underline"
      >
        Toggle All Grade
      </button>
    </div>
  )
}

// ─── MAIN COMPONENT ─────────────────────────────────────────────────────────

export default function DefineClassSubject() {
  const [classId,     setClassId]     = useState('')
  const [sectionId,   setSectionId]   = useState('')
  const [subjects,    setSubjects]    = useState([])
  const [loading,     setLoading]     = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [shown,       setShown]       = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [search,      setSearch]      = useState('')
  const [errors,      setErrors]      = useState({})
  const [toast,       setToast]       = useState(null)

  // Labels for shown state
  const [shownClass,   setShownClass]   = useState('')
  const [shownSection, setShownSection] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Sections for selected class
  const sections = useMemo(() => {
    if (!classId) return []
    return SECTIONS_MAP[Number(classId)] || []
  }, [classId])

  // Show subjects for selected class/section
  const handleShow = useCallback(() => {
    const err = {}
    if (!classId)   err.classId   = 'Please select a class'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      const data = getSubjectsForClass(Number(classId))
      setSubjects(data)
      const cls = CLASSES.find(c => c.id === Number(classId))
      const sec = sections.find(s => s.id === Number(sectionId))
      setShownClass(cls?.name || '')
      setShownSection(sec?.name || '')
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} subjects for ${cls?.name}${sec ? ' – Sec ' + sec.name : ''}.`)
    }, 600)
  }, [classId, sectionId, sections])

  const handleReset = () => {
    setClassId(''); setSectionId(''); setSubjects([])
    setSearch(''); setErrors({}); setShown(false)
    setShownClass(''); setShownSection('')
  }

  // Toggle single field on a subject row
  const handleToggle = useCallback((subjectId, field, value) => {
    setSubjects(prev => prev.map(s =>
      s.subject_id === subjectId ? { ...s, [field]: value } : s
    ))
  }, [])

  // Select all / deselect all
  const handleToggleAll = useCallback((select) => {
    setSubjects(prev => prev.map(s => ({ ...s, status: select ? '1' : '0' })))
  }, [])

  // Toggle all optional
  const handleToggleAllOptional = useCallback(() => {
    const allOpt = subjects.every(s => s.isoptional === '1')
    setSubjects(prev => prev.map(s => ({ ...s, isoptional: allOpt ? '0' : '1' })))
  }, [subjects])

  // Toggle all grade
  const handleToggleAllGrade = useCallback(() => {
    const allGrd = subjects.every(s => s.isgrade === '1')
    setSubjects(prev => prev.map(s => ({ ...s, isgrade: allGrd ? '0' : '1' })))
  }, [subjects])

  // Save handler
  const handleSave = () => {
    const selected = subjects.filter(s => s.status === '1')
    if (selected.length === 0) { showToast('Please select at least one subject.', 'error'); return }
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      showToast(`Saved ${selected.length} subjects for ${shownClass}${shownSection ? ' – Sec ' + shownSection : ''}.`)
    }, 900)
  }

  // Filtered subjects by search
  const filtered = useMemo(() => {
    if (!search) return subjects
    const q = search.toLowerCase()
    return subjects.filter(s =>
      s.Subject.toLowerCase().includes(q) ||
      s.subject_code.toLowerCase().includes(q)
    )
  }, [subjects, search])

  const selectedCount = useMemo(() => subjects.filter(s => s.status === '1').length, [subjects])
  const hasResults    = shown && subjects.length > 0
  const activeFilters = [classId, sectionId].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
        <Home className="w-3.5 h-3.5" />
        <span>Home</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600 dark:text-slate-300 font-semibold">Class Subject</span>
      </nav>

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Class Subject
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Assign subjects to classes — set optional, grade, and ordering.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Changes
          </button>
        )}
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
            {/* Class */}
            <Field label="Class" error={errors.classId} required>
              <NativeSelect
                value={classId}
                onChange={e => {
                  setClassId(e.target.value)
                  setSectionId('')
                  setErrors(p => ({ ...p, classId: undefined }))
                }}
                placeholder="-- Select Class --"
                error={errors.classId}
              >
                {CLASSES.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </NativeSelect>
            </Field>

            {/* Section — only if class has multiple sections */}
            {sections.length > 1 ? (
              <Field label="Section" error={errors.sectionId}>
                <NativeSelect
                  value={sectionId}
                  onChange={e => setSectionId(e.target.value)}
                  placeholder="-- Select Section --"
                  disabled={!classId}
                  error={errors.sectionId}
                >
                  {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </NativeSelect>
              </Field>
            ) : <div />}

            {/* Spacer */}
            <div />

            {/* Actions */}
            <div className="flex gap-2">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button type="button" onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {classId
            ? `${CLASSES.find(c => c.id === Number(classId))?.name}${sectionId ? ' – Sec ' + sections.find(s => s.id === Number(sectionId))?.name : ''}`
            : 'Select Class'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleSave} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          </button>
        )}
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
        classId={classId}
        setClassId={setClassId}
        sectionId={sectionId}
        setSectionId={setSectionId}
        sections={sections}
        onShow={handleShow}
        loading={loading}
        errors={errors}
        onReset={handleReset}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Select Subject</span>
              <span className="text-[13px] text-slate-400 dark:text-slate-500">
                · {shownClass}{shownSection ? ` – Sec ${shownSection}` : ''}
              </span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                {selectedCount} / {subjects.length} selected
              </span>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-52 flex-shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search subject…"
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
          <div className="flex items-start gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              Check subjects to assign them to this class. Set <strong>Optional</strong> for elective subjects, <strong>Grade</strong> for grade-based evaluation, and <strong>Order</strong> for display sequence.
            </p>
          </div>

          {/* Select All Bar */}
          <SelectAllBar
            subjects={filtered}
            onToggleAll={handleToggleAll}
            onToggleAllOptional={handleToggleAllOptional}
            onToggleAllGrade={handleToggleAllGrade}
          />

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                <Search className="w-6 h-6 opacity-40" />
                <span className="text-[13px]">No subjects match your search.</span>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {[
                      { label: 'S.No.',          align: 'center', w: 'w-12'  },
                      { label: 'Select',          align: 'center', w: 'w-16'  },
                      { label: 'Subject',         align: 'left'               },
                      { label: 'Is Optional',     align: 'center'             },
                      { label: 'Is Grade',        align: 'center'             },
                      { label: 'Subject Order',   align: 'center'             },
                    ].map((h, i) => (
                      <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap ${h.w || ''} text-${h.align}`}>
                        {h.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, i) => (
                    <DesktopRow
                      key={s.subject_id}
                      subject={s}
                      idx={i + 1}
                      onToggle={handleToggle}
                    />
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
                <span className="text-[13px]">No subjects match your search.</span>
              </div>
            ) : (
              <>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap the arrow on each card to set Optional, Grade &amp; Order.
                </p>
                {filtered.map((s, i) => (
                  <MobileCard
                    key={s.subject_id}
                    subject={s}
                    idx={i + 1}
                    onToggle={handleToggle}
                  />
                ))}
              </>
            )}
          </div>

          {/* Table Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{subjects.length}</span> subjects
              &nbsp;·&nbsp;
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{selectedCount} selected</span>
            </p>
            <div className="flex gap-2">
              {search && (
                <button onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
              {/* Save button in footer too */}
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[12px] font-semibold text-white
                  bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all active:scale-95 disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BookMarked className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No subjects loaded yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a class and click <strong>Show</strong> to manage its subject assignments.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
