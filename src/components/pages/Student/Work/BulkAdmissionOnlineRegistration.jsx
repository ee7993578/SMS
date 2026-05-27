import { useState, useRef, useCallback } from 'react'
import {
  Upload, FileSpreadsheet, Download, Eye, Trash2, Search,
  RefreshCw, X, Check, ChevronDown, AlertCircle, FileText,
  CheckCircle2, XCircle, Table2, ClipboardList, Hash, Calendar,
  SlidersHorizontal, ChevronLeft, ChevronRight, Plus, File
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2023-24', '2024-25', '2025-26', '2026-27']

const ALL_CLASSES = [
  'Nursery','LKG','UKG',
  'Class I','Class II','Class III','Class IV','Class V',
  'Class VI','Class VII','Class VIII','Class IX','Class X','Class XI','Class XII',
]

// Dummy upload history
const INITIAL_HISTORY = [
  { id: 1, uploadCount: 45, failedCount: 2,  postedDate: '12 Jan 2025, 10:30 AM', fileName: 'Class_I_batch1.xlsx',   session: '2025-26' },
  { id: 2, uploadCount: 38, failedCount: 0,  postedDate: '15 Jan 2025, 02:15 PM', fileName: 'Class_II_Jan.xlsx',     session: '2025-26' },
  { id: 3, uploadCount: 52, failedCount: 5,  postedDate: '18 Jan 2025, 09:45 AM', fileName: 'Primary_batch.xlsx',    session: '2025-26' },
  { id: 4, uploadCount: 30, failedCount: 1,  postedDate: '20 Jan 2025, 04:00 PM', fileName: 'Senior_Section.xlsx',   session: '2024-25' },
  { id: 5, uploadCount: 61, failedCount: 0,  postedDate: '22 Jan 2025, 11:00 AM', fileName: 'NewBatch_2025.xlsx',    session: '2025-26' },
]

// Dummy registered students for "Report" view
const DUMMY_STUDENTS = [
  { regNo:'ONL001', name:'Aarav Sharma',    class:'Class I',   father:'Rajesh Sharma',   mobile:'9876543210', email:'rajesh@gmail.com',    status:'Pending'  },
  { regNo:'ONL002', name:'Priya Singh',     class:'Class II',  father:'Suresh Singh',    mobile:'9812345678', email:'suresh@yahoo.com',    status:'Approved' },
  { regNo:'ONL003', name:'Rohan Gupta',     class:'Class III', father:'Vinod Gupta',     mobile:'9898989898', email:'vinod@gmail.com',     status:'Pending'  },
  { regNo:'ONL004', name:'Ananya Verma',    class:'Class I',   father:'Manoj Verma',     mobile:'9023456789', email:'manoj@gmail.com',     status:'Rejected' },
  { regNo:'ONL005', name:'Karan Mehta',     class:'Class IV',  father:'Sanjay Mehta',    mobile:'9711223344', email:'sanjay@gmail.com',    status:'Approved' },
  { regNo:'ONL006', name:'Diya Patel',      class:'Class II',  father:'Amit Patel',      mobile:'9654321098', email:'amit@yahoo.com',      status:'Pending'  },
  { regNo:'ONL007', name:'Arjun Nair',      class:'Class V',   father:'Sunil Nair',      mobile:'9445566778', email:'sunil@gmail.com',     status:'Approved' },
  { regNo:'ONL008', name:'Sneha Rao',       class:'Class III', father:'Krishna Rao',     mobile:'9332211009', email:'krishna@gmail.com',   status:'Pending'  },
  { regNo:'ONL009', name:'Vikas Kumar',     class:'Class VI',  father:'Ramesh Kumar',    mobile:'9001122334', email:'ramesh@gmail.com',    status:'Approved' },
  { regNo:'ONL010', name:'Pooja Joshi',     class:'Class I',   father:'Dinesh Joshi',    mobile:'9887766554', email:'dinesh@gmail.com',    status:'Pending'  },
  { regNo:'ONL011', name:'Amit Yadav',      class:'Class VII', father:'Rakesh Yadav',    mobile:'9765432109', email:'rakesh@gmail.com',    status:'Approved' },
  { regNo:'ONL012', name:'Neha Singh',      class:'Class II',  father:'Hemant Singh',    mobile:'9543219876', email:'hemant@gmail.com',    status:'Pending'  },
]

const PER_PAGE = 8

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function cx(...a) { return a.filter(Boolean).join(' ') }

// ─── ATOMS ────────────────────────────────────────────────────────────────────
function FieldLabel({ children }) {
  return <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{children}</label>
}

function Sel({ value, onChange, children, disabled }) {
  return (
    <select value={value} onChange={onChange} disabled={disabled}
      className="w-full px-3 py-2 text-[13px] border rounded-lg outline-none transition-all appearance-none cursor-pointer font-medium
        border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400
        dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
        hover:border-slate-300 dark:hover:border-indigo-400/40
        disabled:opacity-40 disabled:cursor-not-allowed">
      {children}
    </select>
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
          t.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500/30 dark:text-emerald-300'
            : t.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-500/30 dark:text-rose-300'
            : 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/30 dark:border-amber-500/30 dark:text-amber-300'
        )}>
          {t.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : t.type === 'error' ? <XCircle className="w-4 h-4 flex-shrink-0" />
            : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-50 hover:opacity-100 flex-shrink-0"><X className="w-3.5 h-3.5" /></button>
        </div>
      ))}
    </div>
  )
}

// ─── CONFIRM DIALOG ───────────────────────────────────────────────────────────
function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-[#1a1f35] rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6 max-w-sm w-full">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 mb-1">Confirm Delete</p>
            <p className="text-[13px] text-slate-500 dark:text-slate-400">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel}
            className="flex-1 py-2 text-[13px] font-semibold rounded-xl border border-slate-200 dark:border-white/[0.1] bg-white dark:bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/[0.05] transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2 text-[13px] font-semibold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-md shadow-rose-500/20">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── DRAG DROP FILE ZONE ─────────────────────────────────────────────────────
function FileDropZone({ onFile, accept = '.xlsx,.xls,.csv', label = 'Drop Excel file here' }) {
  const [drag, setDrag] = useState(false)
  const [file, setFile] = useState(null)
  const ref = useRef(null)

  const handle = (f) => {
    if (!f) return
    setFile(f)
    onFile(f)
  }

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files[0]) }}
      onClick={() => !file && ref.current?.click()}
      className={cx(
        'relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed transition-all cursor-pointer p-6',
        drag ? 'border-blue-400 bg-blue-50 dark:border-indigo-400 dark:bg-indigo-500/10 scale-[1.01]'
          : file ? 'border-emerald-300 bg-emerald-50/40 dark:border-emerald-500/40 dark:bg-emerald-500/5 cursor-default'
          : 'border-slate-200 bg-slate-50/60 dark:border-[rgba(99,102,241,0.2)] dark:bg-white/[0.03] hover:border-blue-300 dark:hover:border-indigo-400/50 hover:bg-blue-50/20'
      )}>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={e => handle(e.target.files[0])} />

      {file ? (
        <>
          <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-500/15 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-center">
            <p className="text-[13px] font-bold text-emerald-700 dark:text-emerald-300">{file.name}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">{(file.size / 1024).toFixed(1)} KB · Ready to upload</p>
          </div>
          <button type="button" onClick={e => { e.stopPropagation(); setFile(null); onFile(null) }}
            className="absolute top-2 right-2 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </>
      ) : (
        <>
          <div className={cx('w-12 h-12 rounded-xl flex items-center justify-center transition-colors',
            drag ? 'bg-blue-100 dark:bg-indigo-500/20' : 'bg-slate-100 dark:bg-white/[0.08]')}>
            <Upload className={cx('w-6 h-6 transition-colors', drag ? 'text-blue-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500')} />
          </div>
          <div className="text-center">
            <p className={cx('text-[13px] font-semibold', drag ? 'text-blue-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300')}>
              {drag ? 'Drop the file!' : label}
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Click to browse or drag &amp; drop · .xlsx, .xls, .csv
            </p>
          </div>
        </>
      )}
    </div>
  )
}

// ─── CLASS MULTI SELECT ───────────────────────────────────────────────────────
function ClassMultiSelect({ selected, onToggle, onSelectAll, onClearAll }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <FieldLabel>Select Classes</FieldLabel>
        <div className="flex gap-2">
          <button type="button" onClick={onSelectAll} className="text-[10px] font-semibold text-blue-600 dark:text-indigo-400 hover:underline">All</button>
          <span className="text-slate-300 dark:text-slate-600">·</span>
          <button type="button" onClick={onClearAll} className="text-[10px] font-semibold text-slate-400 hover:underline">Clear</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 p-2.5 border border-slate-200 dark:border-[rgba(99,102,241,0.2)] rounded-lg bg-slate-50/60 dark:bg-white/[0.03] min-h-[48px]">
        {ALL_CLASSES.map(cls => (
          <button key={cls} type="button" onClick={() => onToggle(cls)}
            className={cx(
              'px-2.5 py-1 text-[11px] font-semibold rounded-md border transition-all',
              selected.has(cls)
                ? 'bg-blue-500 border-blue-500 text-white dark:bg-indigo-600 dark:border-indigo-600'
                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600 dark:bg-[#1e2238] dark:border-white/[0.1] dark:text-slate-400 dark:hover:border-indigo-400/50'
            )}>
            {cls}
          </button>
        ))}
      </div>
      {selected.size > 0 && (
        <p className="text-[11px] text-slate-400 dark:text-slate-500">{selected.size} class{selected.size > 1 ? 'es' : ''} selected</p>
      )}
    </div>
  )
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    Pending:  'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20',
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20',
    Rejected: 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/20',
  }
  return (
    <span className={cx('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border', map[status] || map.Pending)}>
      <span className={cx('w-1.5 h-1.5 rounded-full', status === 'Approved' ? 'bg-emerald-500' : status === 'Rejected' ? 'bg-rose-500' : 'bg-amber-500')} />
      {status}
    </span>
  )
}

// ─── HISTORY TABLE ROW ────────────────────────────────────────────────────────
function HistoryRow({ row, idx, onShow, onDelete }) {
  return (
    <tr className={cx('transition-colors hover:bg-blue-50/20 dark:hover:bg-indigo-500/5',
      idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/40 dark:bg-white/[0.015]')}>
      <td className="px-4 py-3 text-[11px] text-slate-400 font-mono">{idx + 1}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[160px]">{row.fileName}</span>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-300">
          <Check className="w-3 h-3" /> {row.uploadCount}
        </span>
      </td>
      <td className="px-4 py-3">
        {row.failedCount > 0
          ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
              <X className="w-3 h-3" /> {row.failedCount}
            </span>
          : <span className="text-slate-300 dark:text-slate-600 text-[12px]">—</span>
        }
      </td>
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{row.postedDate}</td>
      <td className="px-4 py-3 text-[11px] font-mono text-slate-400">{row.session}</td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <button onClick={() => onShow(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors
              bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-indigo-500/10 dark:text-indigo-300 dark:hover:bg-indigo-500/20">
            <Eye className="w-3 h-3" /> Show
          </button>
          <button onClick={() => onDelete(row)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-lg transition-colors
              bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-300 dark:hover:bg-rose-500/20">
            <Trash2 className="w-3 h-3" /> Delete
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE HISTORY CARD ──────────────────────────────────────────────────────
function HistoryCard({ row, onShow, onDelete }) {
  return (
    <div className="bg-white dark:bg-[#1e2238] rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
          <FileSpreadsheet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.fileName}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.postedDate} · {row.session}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 px-4 pb-3">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 dark:bg-indigo-500/15 dark:text-indigo-300">
          <Check className="w-3 h-3" /> {row.uploadCount} uploaded
        </span>
        {row.failedCount > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
            <X className="w-3 h-3" /> {row.failedCount} failed
          </span>
        )}
      </div>
      <div className="flex border-t border-slate-100 dark:border-white/[0.05]">
        <button onClick={() => onShow(row)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold text-blue-600 dark:text-indigo-300 hover:bg-blue-50 dark:hover:bg-indigo-500/10 transition-colors">
          <Eye className="w-3.5 h-3.5" /> Show
        </button>
        <div className="w-px bg-slate-100 dark:bg-white/[0.05]" />
        <button onClick={() => onDelete(row)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[12px] font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors">
          <Trash2 className="w-3.5 h-3.5" /> Delete
        </button>
      </div>
    </div>
  )
}

// ─── STUDENT TABLE ROW ────────────────────────────────────────────────────────
function StudentRow({ student, idx }) {
  return (
    <tr className={cx('transition-colors hover:bg-blue-50/20 dark:hover:bg-indigo-500/5',
      idx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/40 dark:bg-white/[0.015]')}>
      <td className="px-4 py-3 text-[11px] text-slate-400 font-mono">{idx + 1}</td>
      <td className="px-4 py-3 text-[12px] font-semibold text-slate-600 dark:text-slate-300 font-mono">{student.regNo}</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-[11px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
            {student.name.charAt(0)}
          </div>
          <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100">{student.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400">{student.class}</td>
      <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400">{student.father}</td>
      <td className="px-4 py-3 text-[12px] font-mono text-slate-500 dark:text-slate-400">{student.mobile}</td>
      <td className="px-4 py-3"><StatusBadge status={student.status} /></td>
    </tr>
  )
}

// ─── MOBILE STUDENT CARD ──────────────────────────────────────────────────────
function StudentCard({ student }) {
  return (
    <div className="bg-white dark:bg-[#1e2238] rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] overflow-hidden shadow-sm">
      <div className="flex items-center gap-3 p-3.5">
        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-[14px] font-bold text-slate-500 flex-shrink-0">
          {student.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
            <StatusBadge status={student.status} />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{student.regNo} · {student.class}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 px-3.5 pb-3">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">👤 {student.father}</span>
        <span className="text-[11px] text-slate-400">·</span>
        <a href={`tel:${student.mobile}`} className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-blue-600 transition-colors">📞 {student.mobile}</a>
      </div>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function BulkAdmission({ title = 'Bulk Admission — Online Student Registration' }) {
  // Mode: 'excel' | 'report'
  const [mode,        setMode]        = useState('excel')
  const [session,     setSession]     = useState('2025-26')

  // Excel mode
  const [file,        setFile]        = useState(null)
  const [uploading,   setUploading]   = useState(false)
  const [history,     setHistory]     = useState(INITIAL_HISTORY)

  // Report mode
  const [selClasses,  setSelClasses]  = useState(new Set())
  const [regNo,       setRegNo]       = useState('')
  const [students,    setStudents]    = useState([])
  const [loadingRpt,  setLoadingRpt]  = useState(false)
  const [hasReport,   setHasReport]   = useState(false)

  // Table state
  const [search,      setSearch]      = useState('')
  const [page,        setPage]        = useState(1)

  // Confirm delete
  const [confirmRow,  setConfirmRow]  = useState(null)

  // Show modal (expanded history row detail)
  const [showRow,     setShowRow]     = useState(null)

  // Toasts
  const [toasts,      setToasts]      = useState([])

  // ── Toast helpers ─────────────────────────────────────────────────────────
  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])
  const removeToast = useCallback(id => setToasts(p => p.filter(t => t.id !== id)), [])

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = () => {
    if (!file) { addToast('Please select a file first.', 'error'); return }
    setUploading(true)
    setTimeout(() => {
      const newRow = {
        id: Date.now(),
        uploadCount: Math.floor(Math.random() * 50) + 10,
        failedCount: Math.floor(Math.random() * 3),
        postedDate: new Date().toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }),
        fileName: file.name,
        session,
      }
      setHistory(p => [newRow, ...p])
      setFile(null)
      setUploading(false)
      addToast(`${newRow.uploadCount} records uploaded from ${file.name}!`)
    }, 1500)
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = (row) => {
    setHistory(p => p.filter(r => r.id !== row.id))
    setConfirmRow(null)
    addToast(`Upload record deleted.`, 'warning')
  }

  // ── Download blank template ───────────────────────────────────────────────
  const downloadTemplate = () => {
    const csv = 'First Name,Middle Name,Last Name,DOB,Gender,Father Name,Mother Name,Mobile,Address,Category,Blood Group,Class\n,,,,,,,,,,,\n'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a'); a.href = url; a.download = 'BlankAdmissionExcel.csv'; a.click()
    URL.revokeObjectURL(url)
    addToast('Blank template downloaded!')
  }

  // ── View Report ───────────────────────────────────────────────────────────
  const handleViewReport = () => {
    setLoadingRpt(true)
    setHasReport(true)
    setPage(1)
    setTimeout(() => {
      let data = [...DUMMY_STUDENTS]
      if (selClasses.size > 0) data = data.filter(s => selClasses.has(s.class))
      if (regNo.trim()) data = data.filter(s => s.regNo.toLowerCase().includes(regNo.toLowerCase()) || s.name.toLowerCase().includes(regNo.toLowerCase()))
      setStudents(data)
      setLoadingRpt(false)
      addToast(`${data.length} online registrations found`)
    }, 600)
  }

  // ── Class toggle ──────────────────────────────────────────────────────────
  const toggleClass = c => setSelClasses(p => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n })

  // ── Paginate history ──────────────────────────────────────────────────────
  const filteredHistory = history.filter(r => r.session === session || !session)
  const totalHPages     = Math.max(1, Math.ceil(filteredHistory.length / PER_PAGE))
  const pageHistory     = filteredHistory.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  // ── Paginate students ─────────────────────────────────────────────────────
  const filteredStudents = students.filter(s => {
    const q = search.toLowerCase()
    return !q || s.name.toLowerCase().includes(q) || s.regNo.toLowerCase().includes(q)
  })
  const totalSPages = Math.max(1, Math.ceil(filteredStudents.length / PER_PAGE))
  const pageStudents = filteredStudents.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  return (
    <div className="space-y-4 pb-8">

      {/* ── Page Title ── */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Upload Excel for bulk admission or view online registration reports.
        </p>
      </div>

      {/* ── Top Control Card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <SlidersHorizontal className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Configuration</span>
        </div>

        <div className="p-4 sm:p-5 space-y-5">
          {/* Mode + Session */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Admission Type */}
            <div className="flex flex-col gap-2">
              <FieldLabel>Admission Type</FieldLabel>
              <div className="flex rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden">
                {[['excel','Excel Upload'],['report','View Report']].map(([v, lbl]) => (
                  <button key={v} type="button" onClick={() => { setMode(v); setHasReport(false); setStudents([]) }}
                    className={cx(
                      'flex-1 flex items-center justify-center gap-2 py-2.5 px-4 text-[12px] font-semibold transition-colors',
                      mode === v
                        ? 'bg-blue-500 text-white dark:bg-indigo-600'
                        : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/[0.05]'
                    )}>
                    {v === 'excel' ? <FileSpreadsheet className="w-3.5 h-3.5" /> : <Table2 className="w-3.5 h-3.5" />}
                    {lbl}
                  </button>
                ))}
              </div>
            </div>

            {/* Session */}
            <div className="flex flex-col gap-1.5 flex-1 max-w-xs">
              <FieldLabel>Session</FieldLabel>
              <Sel value={session} onChange={e => setSession(e.target.value)}>
                {SESSIONS.map(s => <option key={s}>{s}</option>)}
              </Sel>
            </div>
          </div>

          {/* ── EXCEL MODE ── */}
          {mode === 'excel' && (
            <div className="space-y-4">
              {/* File drop */}
              <FileDropZone onFile={setFile} label="Drop your admission Excel file here" />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleUpload} disabled={!file || uploading}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white rounded-xl transition-all active:scale-[0.98]
                    bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                    dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20
                    disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100">
                  {uploading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Uploading...</>
                    : <><Upload className="w-4 h-4" /> Upload File</>
                  }
                </button>
                <button onClick={downloadTemplate}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 py-2.5 px-5 text-[13px] font-semibold rounded-xl transition-colors border
                    border-slate-200 bg-white text-slate-700 hover:bg-slate-50
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/[0.05]">
                  <Download className="w-4 h-4" /> Blank Template
                </button>
              </div>

              {/* Info tip */}
              <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-blue-50 border border-blue-100 dark:bg-indigo-500/8 dark:border-indigo-500/15">
                <AlertCircle className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium leading-relaxed">
                  Download the blank template, fill in student data, and upload. Ensure all required columns are present. Failed rows will be reported after upload.
                </p>
              </div>
            </div>
          )}

          {/* ── REPORT MODE ── */}
          {mode === 'report' && (
            <div className="space-y-4">
              {/* Classes */}
              <ClassMultiSelect
                selected={selClasses}
                onToggle={toggleClass}
                onSelectAll={() => setSelClasses(new Set(ALL_CLASSES))}
                onClearAll={() => setSelClasses(new Set())}
              />

              {/* Reg No search */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col gap-1.5 flex-1">
                  <FieldLabel>Online Registration No.</FieldLabel>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    <input value={regNo} onChange={e => setRegNo(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleViewReport()}
                      placeholder="e.g. ONL001 or student name..."
                      className="w-full pl-9 pr-3 py-2 text-[13px] border rounded-lg outline-none transition-all font-medium
                        border-slate-200 bg-white text-slate-800 placeholder-slate-300
                        focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                        dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400" />
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <button onClick={handleViewReport} disabled={loadingRpt}
                    className="flex items-center justify-center gap-2 px-6 py-2 text-[13px] font-semibold text-white rounded-lg transition-all active:scale-95
                      bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                      dark:bg-indigo-600 dark:hover:bg-indigo-700
                      disabled:opacity-60 disabled:cursor-not-allowed">
                    {loadingRpt
                      ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading...</>
                      : <><Eye className="w-4 h-4" /> View Record</>
                    }
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── EXCEL UPLOAD HISTORY ── */}
      {mode === 'excel' && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
            <ClipboardList className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">Upload History</span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{filteredHistory.length} records</span>
          </div>

          {filteredHistory.length === 0 ? (
            <div className="flex flex-col items-center py-14 gap-3">
              <FileSpreadsheet className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-[13px] text-slate-500 dark:text-slate-400 font-semibold">No uploads yet</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">Upload an Excel file to see history here</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                      {['#','File Name','Uploaded','Failed','Posted Date','Session','Actions'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageHistory.map((row, i) => (
                      <HistoryRow key={row.id} row={row} idx={(page - 1) * PER_PAGE + i}
                        onShow={setShowRow} onDelete={setConfirmRow} />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden p-3 space-y-2">
                {pageHistory.map(row => (
                  <HistoryCard key={row.id} row={row} onShow={setShowRow} onDelete={setConfirmRow} />
                ))}
              </div>

              {/* Pagination */}
              {filteredHistory.length > PER_PAGE && (
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-wrap">
                  <p className="text-[12px] text-slate-400">{(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filteredHistory.length)} of {filteredHistory.length}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    {Array.from({length:totalHPages},(_,i)=>i+1).filter(p=>p===1||p===totalHPages||Math.abs(p-page)<=1).map((p,i,arr)=>(
                      <span key={p} className="flex items-center">
                        {i>0&&arr[i-1]!==p-1&&<span className="text-slate-300 px-1 text-[12px]">…</span>}
                        <button onClick={()=>setPage(p)} className={cx('min-w-[32px] h-8 px-2 rounded-lg text-[12px] font-semibold transition-colors', page===p ? 'bg-blue-600 text-white dark:bg-indigo-600' : 'border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]')}>{p}</button>
                      </span>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalHPages,p+1))} disabled={page===totalHPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── REPORT RESULTS ── */}
      {mode === 'report' && hasReport && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] flex-wrap gap-y-2">
            <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
            <ClipboardList className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">
              Online Registrations
              {students.length > 0 && <span className="ml-2 text-[11px] font-normal text-slate-400">({filteredStudents.length})</span>}
            </span>
            {students.length > 0 && (
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400 pointer-events-none" />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }} placeholder="Search..."
                  className="pl-7 pr-3 py-1.5 text-[12px] border rounded-lg outline-none w-36 transition-all
                    border-slate-200 bg-white text-slate-700 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400" />
              </div>
            )}
          </div>

          {loadingRpt && (
            <div className="flex items-center justify-center py-14 gap-3">
              <span className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-[13px] text-slate-400">Loading...</span>
            </div>
          )}

          {!loadingRpt && students.length === 0 && (
            <div className="flex flex-col items-center py-14 gap-3">
              <ClipboardList className="w-10 h-10 text-slate-300 dark:text-slate-600" />
              <p className="text-[13px] text-slate-500 dark:text-slate-400 font-semibold">No registrations found</p>
              <p className="text-[12px] text-slate-400 dark:text-slate-500">Try changing the filters</p>
            </div>
          )}

          {!loadingRpt && pageStudents.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                      {['#','Reg. No.','Student Name','Class','Father','Mobile','Status'].map(h => (
                        <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pageStudents.map((s, i) => <StudentRow key={s.regNo} student={s} idx={(page-1)*PER_PAGE+i} />)}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden p-3 space-y-2">
                {pageStudents.map(s => <StudentCard key={s.regNo} student={s} />)}
              </div>

              {/* Pagination */}
              {filteredStudents.length > PER_PAGE && (
                <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-wrap">
                  <p className="text-[12px] text-slate-400">{(page-1)*PER_PAGE+1}–{Math.min(page*PER_PAGE, filteredStudents.length)} of {filteredStudents.length}</p>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setPage(p => Math.max(1,p-1))} disabled={page===1} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                    {Array.from({length:totalSPages},(_,i)=>i+1).filter(p=>p===1||p===totalSPages||Math.abs(p-page)<=1).map((p,i,arr)=>(
                      <span key={p} className="flex items-center">
                        {i>0&&arr[i-1]!==p-1&&<span className="text-slate-300 px-1 text-[12px]">…</span>}
                        <button onClick={()=>setPage(p)} className={cx('min-w-[32px] h-8 px-2 rounded-lg text-[12px] font-semibold transition-colors', page===p ? 'bg-blue-600 text-white dark:bg-indigo-600' : 'border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]')}>{p}</button>
                      </span>
                    ))}
                    <button onClick={() => setPage(p => Math.min(totalSPages,p+1))} disabled={page===totalSPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 transition-colors"><ChevronRight className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── CONFIRM DELETE ── */}
      {confirmRow && (
        <ConfirmDialog
          message={`Delete upload record "${confirmRow.fileName}"? This cannot be undone.`}
          onConfirm={() => handleDelete(confirmRow)}
          onCancel={() => setConfirmRow(null)}
        />
      )}

      {/* ── SHOW DETAIL MODAL ── */}
      {showRow && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowRow(null)} />
          <div className="relative bg-white dark:bg-[#1a1f35] rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl p-6 max-w-sm w-full">
            <div className="flex items-start justify-between gap-4 mb-5">
              <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">Upload Details</p>
              <button onClick={() => setShowRow(null)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.08] transition-colors"><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              {[
                ['File Name', showRow.fileName, FileText],
                ['Session', showRow.session, Calendar],
                ['Uploaded', `${showRow.uploadCount} records`, Check],
                ['Failed', `${showRow.failedCount} records`, X],
                ['Posted Date', showRow.postedDate, Calendar],
              ].map(([lbl, val, Icon]) => (
                <div key={lbl} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.04] border border-slate-100 dark:border-white/[0.06]">
                  <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/[0.08] border border-slate-200 dark:border-white/[0.1] flex items-center justify-center flex-shrink-0">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{lbl}</p>
                    <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Toast items={toasts} onRemove={removeToast} />
    </div>
  )
}
