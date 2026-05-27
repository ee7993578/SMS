import { useState, useMemo, useCallback } from 'react'
import {
  ArrowRight, ArrowLeft, ArrowLeftRight, Users, GraduationCap,
  Check, X, Search, RefreshCw, ChevronDown, AlertCircle,
  CheckSquare, Square, Layers, Shuffle, CheckCircle2, XCircle,
  Filter, LayoutGrid, List, Info
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2023-24', '2024-25', '2025-26', '2026-27']

const CLASSES = [
  'Nursery','LKG','UKG',
  'Class I','Class II','Class III','Class IV','Class V',
  'Class VI','Class VII','Class VIII','Class IX','Class X','Class XI','Class XII',
]

// Promote mode: each class goes to next
const PROMOTE_MAP = {
  'Nursery':'LKG','LKG':'UKG','UKG':'Class I',
  'Class I':'Class II','Class II':'Class III','Class III':'Class IV',
  'Class IV':'Class V','Class V':'Class VI','Class VI':'Class VII',
  'Class VII':'Class VIII','Class VIII':'Class IX','Class IX':'Class X',
  'Class X':'Class XI','Class XI':'Class XII','Class XII':'Alumni',
}

const STUDENTS_DB = {
  'Class I':   [{id:1,name:'Aarav Sharma',roll:'01',gender:'M'},{id:2,name:'Priya Singh',roll:'02',gender:'F'},{id:3,name:'Rohan Gupta',roll:'03',gender:'M'},{id:4,name:'Ananya Verma',roll:'04',gender:'F'},{id:5,name:'Karan Mehta',roll:'05',gender:'M'}],
  'Class II':  [{id:6,name:'Diya Patel',roll:'01',gender:'F'},{id:7,name:'Arjun Nair',roll:'02',gender:'M'},{id:8,name:'Sneha Rao',roll:'03',gender:'F'},{id:9,name:'Vikas Kumar',roll:'04',gender:'M'}],
  'Class III': [{id:10,name:'Pooja Joshi',roll:'01',gender:'F'},{id:11,name:'Amit Yadav',roll:'02',gender:'M'},{id:12,name:'Neha Singh',roll:'03',gender:'F'},{id:13,name:'Rahul Mishra',roll:'04',gender:'M'},{id:14,name:'Sakshi Dubey',roll:'05',gender:'F'}],
  'Class IV':  [{id:15,name:'Tarun Kapoor',roll:'01',gender:'M'},{id:16,name:'Ishaan Bajaj',roll:'02',gender:'M'},{id:17,name:'Kavya Reddy',roll:'03',gender:'F'}],
  'Class V':   [{id:18,name:'Mohit Soni',roll:'01',gender:'M'},{id:19,name:'Divya Saxena',roll:'02',gender:'F'},{id:20,name:'Harsh Trivedi',roll:'03',gender:'M'},{id:21,name:'Naina Bose',roll:'04',gender:'F'}],
  'Class VI':  [{id:22,name:'Yash Chauhan',roll:'01',gender:'M'},{id:23,name:'Preeti Sharma',roll:'02',gender:'F'},{id:24,name:'Deepak Tiwari',roll:'03',gender:'M'}],
  'Class VII': [{id:25,name:'Aditya Pandey',roll:'01',gender:'M'},{id:26,name:'Roshni Gupta',roll:'02',gender:'F'},{id:27,name:'Nikhil Rawat',roll:'03',gender:'M'},{id:28,name:'Bhavna Jain',roll:'04',gender:'F'}],
  'Class VIII':[{id:29,name:'Chirag Shah',roll:'01',gender:'M'},{id:30,name:'Swati Dixit',roll:'02',gender:'F'},{id:31,name:'Pranav Pillai',roll:'03',gender:'M'}],
  'Class IX':  [{id:32,name:'Shruti Bansal',roll:'01',gender:'F'},{id:33,name:'Akash Thakur',roll:'02',gender:'M'},{id:34,name:'Mansi Goyal',roll:'03',gender:'F'},{id:35,name:'Varun Chopra',roll:'04',gender:'M'}],
  'Class X':   [{id:36,name:'Ankita Rao',roll:'01',gender:'F'},{id:37,name:'Rohit Sinha',roll:'02',gender:'M'},{id:38,name:'Pallavi Menon',roll:'03',gender:'F'},{id:39,name:'Gaurav Khanna',roll:'04',gender:'M'},{id:40,name:'Megha Iyer',roll:'05',gender:'F'}],
  'Class XI':  [{id:41,name:'Siddharth Das',roll:'01',gender:'M'},{id:42,name:'Kriti Ahuja',roll:'02',gender:'F'},{id:43,name:'Parth Desai',roll:'03',gender:'M'}],
  'Class XII': [{id:44,name:'Shreya Kulkarni',roll:'01',gender:'F'},{id:45,name:'Aryan Malhotra',roll:'02',gender:'M'},{id:46,name:'Tanisha Kapoor',roll:'03',gender:'F'}],
  'LKG':       [{id:47,name:'Riya Sharma',roll:'01',gender:'F'},{id:48,name:'Dev Patel',roll:'02',gender:'M'}],
  'UKG':       [{id:49,name:'Siya Gupta',roll:'01',gender:'F'},{id:50,name:'Aryan Singh',roll:'02',gender:'M'},{id:51,name:'Preet Kaur',roll:'03',gender:'F'}],
  'Nursery':   [{id:52,name:'Ahaan Verma',roll:'01',gender:'M'},{id:53,name:'Zara Khan',roll:'02',gender:'F'}],
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function cx(...args) { return args.filter(Boolean).join(' ') }

function getStudents(cls) { return STUDENTS_DB[cls] || [] }

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Sel({ label, value, onChange, options, placeholder = '— Select —', error, disabled }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>}
      <div className="relative">
        <select
          value={value} onChange={onChange} disabled={disabled}
          className={cx(
            'w-full px-3 py-2 text-[13px] border rounded-lg outline-none transition-all appearance-none cursor-pointer font-medium pr-8',
            'bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400',
            'dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20',
            'hover:border-slate-300 dark:hover:border-indigo-400/40 disabled:opacity-40 disabled:cursor-not-allowed',
            error ? 'border-rose-400 bg-rose-50/30 dark:border-rose-500' : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)]'
          )}
        >
          <option value="">{placeholder}</option>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
      </div>
      {error && <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium"><AlertCircle className="w-3 h-3 flex-shrink-0" />{error}</p>}
    </div>
  )
}

function Badge({ children, variant = 'blue' }) {
  const v = {
    blue:    'bg-blue-50 text-blue-700 border-blue-100 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/20',
    green:   'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20',
    amber:   'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20',
    slate:   'bg-slate-100 text-slate-600 border-slate-200 dark:bg-white/[0.08] dark:text-slate-400 dark:border-white/[0.1]',
    pink:    'bg-pink-50 text-pink-700 border-pink-100 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/20',
  }
  return (
    <span className={cx('inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border', v[variant])}>
      {children}
    </span>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ items, onRemove }) {
  if (!items.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2" style={{ maxWidth: 320, width: '90vw' }}>
      {items.map(t => (
        <div key={t.id} className={cx(
          'flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-[12px] font-semibold',
          t.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500/30 dark:text-emerald-300'
            : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-500/30 dark:text-rose-300'
        )}>
          {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <XCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  )
}

// ─── STUDENT CHECK ITEM ───────────────────────────────────────────────────────
function StudentCheckItem({ student, checked, onToggle, compact = false }) {
  return (
    <div
      onClick={onToggle}
      className={cx(
        'flex items-center gap-3 px-3 rounded-lg cursor-pointer transition-all select-none',
        compact ? 'py-2' : 'py-2.5',
        checked
          ? 'bg-blue-50 border border-blue-200 dark:bg-indigo-500/10 dark:border-indigo-500/30'
          : 'bg-white border border-slate-100 dark:bg-transparent dark:border-[rgba(99,102,241,0.1)] hover:border-slate-200 dark:hover:border-indigo-400/25 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
      )}
    >
      <span className={cx(
        'flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all',
        checked ? 'bg-blue-500 border-blue-500 dark:bg-indigo-500 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-600'
      )}>
        {checked && <svg viewBox="0 0 10 10" className="w-2.5 h-2.5"><polyline points="1.5,5 4,7.5 8.5,2" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </span>
      <span className={cx(
        'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0 transition-colors',
        checked ? 'bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-slate-400'
      )}>
        {student.name.charAt(0)}
      </span>
      <div className="flex-1 min-w-0">
        <p className={cx('text-[13px] font-semibold truncate', checked ? 'text-blue-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200')}>
          {student.name}
        </p>
        {!compact && <p className="text-[10px] text-slate-400 dark:text-slate-500">Roll: {student.roll} · {student.gender === 'M' ? 'Male' : 'Female'}</p>}
      </div>
      {compact && <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">{student.roll}</span>}
    </div>
  )
}

// ─── STUDENT PANEL ────────────────────────────────────────────────────────────
function StudentPanel({ title, accent, session, onSessionChange, sessions, cls, onClassChange, classes, students, selectedIds, onToggle, onSelectAll, onClearAll, sessionError, classError, emptyMsg, showSessionDrop = true }) {
  const [search, setSearch] = useState('')

  const visibleStudents = useMemo(() => {
    if (!search.trim()) return students
    const q = search.toLowerCase()
    return students.filter(s => s.name.toLowerCase().includes(q) || s.roll.includes(q))
  }, [students, search])

  const allSelected   = visibleStudents.length > 0 && visibleStudents.every(s => selectedIds.has(s.id))
  const someSelected  = visibleStudents.some(s => selectedIds.has(s.id))
  const selectedCount = students.filter(s => selectedIds.has(s.id)).length

  const accentMap = {
    blue: { bar: 'bg-blue-500', hdr: 'bg-blue-50/70 dark:bg-blue-900/10 border-blue-100 dark:border-blue-500/15', badge: 'blue' },
    rose: { bar: 'bg-rose-500', hdr: 'bg-rose-50/70 dark:bg-rose-900/10 border-rose-100 dark:border-rose-500/15', badge: 'pink' },
  }
  const a = accentMap[accent] || accentMap.blue

  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className={cx('flex items-center gap-3 px-4 py-3 border-b', a.hdr)}>
        <span className={cx('w-1 h-5 rounded-full flex-shrink-0', a.bar)} />
        <GraduationCap className="w-4 h-4 text-slate-500 dark:text-slate-400 flex-shrink-0" />
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1 tracking-tight">{title}</span>
        {selectedCount > 0 && <Badge variant={accent === 'blue' ? 'blue' : 'pink'}>{selectedCount} selected</Badge>}
      </div>

      <div className="p-4 space-y-3 flex-1 flex flex-col">
        {/* Session */}
        {showSessionDrop && (
          <Sel label="Session" value={session} onChange={e => onSessionChange(e.target.value)} options={sessions} error={sessionError} />
        )}
        {/* Class */}
        <Sel label="Class" value={cls} onChange={e => onClassChange(e.target.value)} options={classes} error={classError} />

        {/* Students list */}
        {cls && students.length > 0 && (
          <>
            {/* Search within list */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..."
                className="w-full pl-8 pr-3 py-1.5 text-[12px] border rounded-lg outline-none transition-all
                  border-slate-200 bg-white text-slate-700 placeholder-slate-300
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400" />
            </div>

            {/* Select / clear */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                {visibleStudents.length} students
              </span>
              <div className="flex gap-1">
                <button onClick={() => onSelectAll(visibleStudents.map(s => s.id))}
                  className={cx('text-[11px] font-semibold px-2 py-1 rounded-md transition-colors', accent === 'blue' ? 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10' : 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10')}>
                  All
                </button>
                {someSelected && (
                  <button onClick={onClearAll} className="text-[11px] font-semibold px-2 py-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* List */}
            <div className="flex flex-col gap-1.5 overflow-y-auto flex-1" style={{ maxHeight: 280 }}>
              {visibleStudents.map(s => (
                <StudentCheckItem key={s.id} student={s} checked={selectedIds.has(s.id)} onToggle={() => onToggle(s.id)} />
              ))}
            </div>
          </>
        )}

        {/* Empty */}
        {cls && students.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 flex-1">
            <Users className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <p className="text-[12px] text-slate-400 dark:text-slate-500">{emptyMsg || 'No students found'}</p>
          </div>
        )}

        {!cls && (
          <div className="flex flex-col items-center justify-center py-8 gap-2 flex-1">
            <GraduationCap className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <p className="text-[12px] text-slate-400 dark:text-slate-500">Select a class to view students</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── TRANSFER BUTTONS ─────────────────────────────────────────────────────────
function TransferButtons({ onRight, onLeft, canRight, canLeft, mode }) {
  return (
    <div className="flex sm:flex-col items-center justify-center gap-3">
      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center flex-shrink-0">
        <ArrowLeftRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
      </div>

      <button onClick={onRight} disabled={!canRight} title={`Move to ${mode === 'promote' ? 'next class' : 'right'}`}
        className={cx(
          'flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all flex-shrink-0',
          canRight
            ? 'border-blue-200 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:border-blue-500 hover:text-white active:scale-95 dark:border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:hover:bg-indigo-500 dark:hover:border-indigo-500 dark:hover:text-white shadow-sm'
            : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/20'
        )}>
        <ArrowRight className="w-4 h-4" />
      </button>

      <button onClick={onLeft} disabled={!canLeft} title="Move back"
        className={cx(
          'flex items-center justify-center w-10 h-10 rounded-xl border-2 transition-all flex-shrink-0',
          canLeft
            ? 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:border-rose-500 hover:text-white active:scale-95 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:border-rose-500 dark:hover:text-white shadow-sm'
            : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white/20'
        )}>
        <ArrowLeft className="w-4 h-4" />
      </button>
    </div>
  )
}

// ─── MOBILE TRANSFER PANEL (stacked) ──────────────────────────────────────────
function MobileTransferView({ mode, leftPanel, rightPanel, onRight, onLeft, canRight, canLeft }) {
  const [activeTab, setActiveTab] = useState('left')

  return (
    <div className="space-y-3">
      {/* Tab switcher */}
      <div className="flex rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden">
        <button onClick={() => setActiveTab('left')}
          className={cx('flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold transition-colors',
            activeTab === 'left'
              ? 'bg-blue-500 text-white dark:bg-indigo-600'
              : 'bg-white text-slate-500 dark:bg-transparent dark:text-slate-400')}>
          <GraduationCap className="w-3.5 h-3.5" /> Source
        </button>
        <button onClick={() => setActiveTab('right')}
          className={cx('flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold transition-colors',
            activeTab === 'right'
              ? 'bg-rose-500 text-white dark:bg-rose-600'
              : 'bg-white text-slate-500 dark:bg-transparent dark:text-slate-400')}>
          <GraduationCap className="w-3.5 h-3.5" /> Destination
        </button>
      </div>

      {/* Active panel */}
      {activeTab === 'left' ? leftPanel : rightPanel}

      {/* Transfer action bar */}
      <div className="flex gap-3 sticky bottom-0">
        <button onClick={onLeft} disabled={!canLeft}
          className={cx(
            'flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold rounded-xl border-2 transition-all',
            canLeft
              ? 'border-rose-500 bg-rose-500 text-white hover:bg-rose-600 shadow-md shadow-rose-400/20 active:scale-[0.98]'
              : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed dark:border-white/[0.08] dark:bg-white/[0.03]'
          )}>
          <ArrowLeft className="w-4 h-4" /> Move Left
        </button>
        <button onClick={onRight} disabled={!canRight}
          className={cx(
            'flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold rounded-xl border-2 transition-all',
            canRight
              ? 'border-blue-500 bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-400/20 active:scale-[0.98] dark:bg-indigo-600 dark:border-indigo-600'
              : 'border-slate-200 bg-slate-50 text-slate-300 cursor-not-allowed dark:border-white/[0.08] dark:bg-white/[0.03]'
          )}>
          Move Right <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function PromoteDemote({ title = 'Promote / Change Section' }) {
  // Mode: 'promote' | 'section'
  const [mode, setMode]   = useState('section')
  const [saving, setSaving] = useState(false)
  const [toasts, setToasts] = useState([])

  // Left panel
  const [leftSession,  setLeftSession]  = useState('2024-25')
  const [leftClass,    setLeftClass]    = useState('')
  const [leftStudents, setLeftStudents] = useState([])
  const [leftSelected, setLeftSelected] = useState(new Set())
  const [leftSessErr,  setLeftSessErr]  = useState('')
  const [leftClsErr,   setLeftClsErr]   = useState('')

  // Right panel
  const [rightSession,  setRightSession]  = useState('2025-26')
  const [rightClass,    setRightClass]    = useState('')
  const [rightStudents, setRightStudents] = useState([])
  const [rightSelected, setRightSelected] = useState(new Set())
  const [rightSessErr,  setRightSessErr]  = useState('')
  const [rightClsErr,   setRightClsErr]   = useState('')

  // ── Toast ──────────────────────────────────────────────────────────────────
  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000)
  }, [])
  const removeToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), [])

  // ── Mode change ────────────────────────────────────────────────────────────
  const handleModeChange = (m) => {
    setMode(m)
    setLeftClass(''); setRightClass('')
    setLeftStudents([]); setRightStudents([])
    setLeftSelected(new Set()); setRightSelected(new Set())
  }

  // ── Left class change ──────────────────────────────────────────────────────
  const handleLeftClass = (cls) => {
    setLeftClass(cls)
    setLeftClsErr('')
    setLeftSelected(new Set())
    if (cls) {
      const students = getStudents(cls)
      setLeftStudents(students)
      // In promote mode, auto-set right class to next class
      if (mode === 'promote' && PROMOTE_MAP[cls]) {
        const nextCls = PROMOTE_MAP[cls]
        setRightClass(nextCls)
        setRightStudents(getStudents(nextCls))
        setRightSelected(new Set())
      }
    } else {
      setLeftStudents([])
    }
  }

  // ── Right class change ─────────────────────────────────────────────────────
  const handleRightClass = (cls) => {
    setRightClass(cls)
    setRightClsErr('')
    setRightSelected(new Set())
    setRightStudents(cls ? getStudents(cls) : [])
  }

  // ── Toggles ────────────────────────────────────────────────────────────────
  const toggleLeft  = useCallback((id) => setLeftSelected(p  => { const n = new Set(p);  n.has(id) ? n.delete(id) : n.add(id);  return n }), [])
  const toggleRight = useCallback((id) => setRightSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n }), [])

  const selectAllLeft  = useCallback((ids) => setLeftSelected(new Set(ids)),  [])
  const clearAllLeft   = useCallback(() => setLeftSelected(new Set()),         [])
  const selectAllRight = useCallback((ids) => setRightSelected(new Set(ids)), [])
  const clearAllRight  = useCallback(() => setRightSelected(new Set()),        [])

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    let ok = true
    if (!leftClass)  { setLeftClsErr('Required');  ok = false }
    if (!rightClass) { setRightClsErr('Required'); ok = false }
    return ok
  }

  // ── Move Right → ───────────────────────────────────────────────────────────
  const moveRight = () => {
    if (!validate()) return
    if (leftSelected.size === 0) { addToast('Select at least one student from source.', 'error'); return }
    const moving = leftStudents.filter(s => leftSelected.has(s.id))
    setLeftStudents(p => p.filter(s => !leftSelected.has(s.id)))
    setLeftSelected(new Set())
    setRightStudents(p => {
      const existIds = new Set(p.map(s => s.id))
      return [...p, ...moving.filter(s => !existIds.has(s.id))]
    })
  }

  // ── Move Left ← ─────────────────────────────────────────────────────────────
  const moveLeft = () => {
    if (!validate()) return
    if (rightSelected.size === 0) { addToast('Select at least one student from destination.', 'error'); return }
    const moving = rightStudents.filter(s => rightSelected.has(s.id))
    setRightStudents(p => p.filter(s => !rightSelected.has(s.id)))
    setRightSelected(new Set())
    setLeftStudents(p => {
      const existIds = new Set(p.map(s => s.id))
      return [...p, ...moving.filter(s => !existIds.has(s.id))]
    })
  }

  // ── Save / Change ──────────────────────────────────────────────────────────
  const handleChange = () => {
    if (!validate()) return
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      const label = mode === 'promote' ? 'Promotion' : 'Section change'
      addToast(`${label} saved! ${leftClass} → ${rightClass}`)
    }, 900)
  }

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setLeftClass(''); setRightClass('')
    setLeftStudents([]); setRightStudents([])
    setLeftSelected(new Set()); setRightSelected(new Set())
    setLeftClsErr(''); setRightClsErr('')
    setLeftSessErr(''); setRightSessErr('')
  }

  const canMoveRight = leftSelected.size  > 0
  const canMoveLeft  = rightSelected.size > 0

  // ── Panels (reusable for both desktop + mobile) ────────────────────────────
  const leftPanelNode = (
    <StudentPanel
      title="Source Class"
      accent="blue"
      session={leftSession}
      onSessionChange={s => { setLeftSession(s); setLeftSessErr('') }}
      sessions={SESSIONS}
      cls={leftClass}
      onClassChange={handleLeftClass}
      classes={CLASSES}
      students={leftStudents}
      selectedIds={leftSelected}
      onToggle={toggleLeft}
      onSelectAll={selectAllLeft}
      onClearAll={clearAllLeft}
      sessionError={leftSessErr}
      classError={leftClsErr}
      showSessionDrop={true}
    />
  )

  const rightPanelNode = (
    <StudentPanel
      title="Destination Class"
      accent="rose"
      session={rightSession}
      onSessionChange={s => { setRightSession(s); setRightSessErr('') }}
      sessions={SESSIONS}
      cls={rightClass}
      onClassChange={handleRightClass}
      classes={mode === 'promote' && leftClass ? [PROMOTE_MAP[leftClass] || ''].filter(Boolean) : CLASSES}
      students={rightStudents}
      selectedIds={rightSelected}
      onToggle={toggleRight}
      onSelectAll={selectAllRight}
      onClearAll={clearAllRight}
      sessionError={rightSessErr}
      classError={rightClsErr}
      showSessionDrop={true}
    />
  )

  return (
    <div className="space-y-4 pb-8">

      {/* ── Page Title ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100">{title}</h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Select mode, pick students from source, then move to destination class.
          </p>
        </div>
        <button onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-[12px] font-semibold rounded-xl transition-colors
            bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-white/[0.1]">
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* ── Mode selector ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-indigo-500 flex-shrink-0" />
          <Layers className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Operation Mode</span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                id: 'promote',
                icon: GraduationCap,
                label: 'Promote / Demote',
                desc: 'Move students to next or previous academic class. Source and destination can span different sessions.',
                color: 'blue',
              },
              {
                id: 'section',
                icon: Shuffle,
                label: 'Change Section',
                desc: 'Transfer students between sections within the same or different class. Both panels use the same session.',
                color: 'violet',
              },
            ].map(opt => (
              <button key={opt.id} type="button" onClick={() => handleModeChange(opt.id)}
                className={cx(
                  'flex items-start gap-4 p-4 rounded-xl border-2 transition-all text-left',
                  mode === opt.id
                    ? opt.color === 'blue'
                      ? 'border-blue-400 bg-blue-50 dark:border-indigo-500 dark:bg-indigo-500/10'
                      : 'border-violet-400 bg-violet-50 dark:border-violet-500 dark:bg-violet-500/10'
                    : 'border-slate-200 bg-white hover:border-slate-300 dark:border-[rgba(99,102,241,0.2)] dark:bg-transparent dark:hover:border-indigo-400/40'
                )}>
                <div className={cx(
                  'p-2 rounded-lg flex-shrink-0 mt-0.5',
                  mode === opt.id
                    ? opt.color === 'blue' ? 'bg-blue-100 text-blue-600 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-slate-400'
                )}>
                  <opt.icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cx('text-[13px] font-bold', mode === opt.id ? (opt.color === 'blue' ? 'text-blue-700 dark:text-indigo-300' : 'text-violet-700 dark:text-violet-300') : 'text-slate-700 dark:text-slate-200')}>
                    {opt.label}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 leading-relaxed">{opt.desc}</p>
                </div>
                <div className={cx(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all',
                  mode === opt.id
                    ? opt.color === 'blue' ? 'border-blue-500 bg-blue-500 dark:border-indigo-500 dark:bg-indigo-500' : 'border-violet-500 bg-violet-500'
                    : 'border-slate-300 dark:border-slate-600'
                )}>
                  {mode === opt.id && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                </div>
              </button>
            ))}
          </div>

          {/* Promote hint */}
          {mode === 'promote' && (
            <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100 dark:bg-indigo-500/8 dark:border-indigo-500/20">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                In promote mode, selecting a source class automatically suggests the next class on the right. You can override it.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Transfer Panel ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Card header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <ArrowLeftRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            {mode === 'promote' ? 'Promote / Demote Students' : 'Change Section'}
          </span>
          {/* Stats */}
          {(leftStudents.length > 0 || rightStudents.length > 0) && (
            <div className="hidden sm:flex items-center gap-2">
              <Badge variant="blue">{leftStudents.length} source</Badge>
              <Badge variant="pink">{rightStudents.length} dest.</Badge>
            </div>
          )}
        </div>

        {/* ── DESKTOP layout (3-col) ── */}
        <div className="hidden sm:flex gap-4 p-4 sm:p-5 items-start">
          <div className="flex-1 min-w-0">{leftPanelNode}</div>
          <div className="flex flex-col items-center justify-center pt-20 gap-2 flex-shrink-0">
            <TransferButtons
              onRight={moveRight} onLeft={moveLeft}
              canRight={canMoveRight} canLeft={canMoveLeft}
              mode={mode}
            />
          </div>
          <div className="flex-1 min-w-0">{rightPanelNode}</div>
        </div>

        {/* ── MOBILE layout (tabs + stacked) ── */}
        <div className="sm:hidden p-4">
          <MobileTransferView
            mode={mode}
            leftPanel={leftPanelNode}
            rightPanel={rightPanelNode}
            onRight={moveRight} onLeft={moveLeft}
            canRight={canMoveRight} canLeft={canMoveLeft}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-4
          border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/60 dark:bg-white/[0.02] flex-wrap">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Both source &amp; destination class are required · Select students then click <strong>Save</strong>
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={handleReset}
              className="flex-1 sm:flex-none px-5 py-2 text-[13px] font-semibold rounded-xl transition-colors
                bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
              Reset
            </button>
            <button onClick={handleChange} disabled={saving}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-7 py-2 text-[13px] font-semibold text-white rounded-xl transition-all active:scale-95
                bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20
                dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20
                disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
              {saving
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</>
                : <><Check className="w-4 h-4" /> Save Changes</>
              }
            </button>
          </div>
        </div>
      </div>

      <Toast items={toasts} onRemove={removeToast} />
    </div>
  )
}
