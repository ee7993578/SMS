import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Eye, Search, RotateCcw, Camera, Check,
  X, SlidersHorizontal, ImagePlus,
  CheckCircle2, XCircle, User,
  ChevronLeft, ChevronRight
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const SESSIONS = ['2024-25', '2025-26', '2026-27']
const CLASSES  = ['Nursery','LKG','UKG','Class I','Class II','Class III','Class IV','Class V','Class VI','Class VII','Class VIII','Class IX','Class X','Class XI','Class XII']
const MOCK_STUDENTS = [
  { uid:1,  admNo:'ADM001', name:'Aarav Sharma',   cls:'Class I (A)'         },
  { uid:2,  admNo:'ADM002', name:'Priya Singh',    cls:'Class I (A)'         },
  { uid:3,  admNo:'ADM003', name:'Rohan Gupta',    cls:'Class I (B)'         },
  { uid:4,  admNo:'ADM004', name:'Ananya Verma',   cls:'Class II (A)'        },
  { uid:5,  admNo:'ADM005', name:'Karan Mehta',    cls:'Class II (A)'        },
  { uid:6,  admNo:'ADM006', name:'Diya Patel',     cls:'Class III (A)'       },
  { uid:7,  admNo:'ADM007', name:'Arjun Nair',     cls:'Class III (B)'       },
  { uid:8,  admNo:'ADM008', name:'Sneha Rao',      cls:'Class IV (A)'        },
  { uid:9,  admNo:'ADM009', name:'Vikas Kumar',    cls:'Class IV (A)'        },
  { uid:10, admNo:'ADM010', name:'Pooja Joshi',    cls:'Class V (A)'         },
  { uid:11, admNo:'ADM011', name:'Amit Yadav',     cls:'Class V (B)'         },
  { uid:12, admNo:'ADM012', name:'Neha Singh',     cls:'Class VI (A)'        },
  { uid:13, admNo:'ADM013', name:'Rahul Mishra',   cls:'Class VII (A)'       },
  { uid:14, admNo:'ADM014', name:'Sakshi Dubey',   cls:'Class VII (B)'       },
  { uid:15, admNo:'ADM015', name:'Tarun Kapoor',   cls:'Class VIII (A)'      },
  { uid:16, admNo:'ADM016', name:'Ishaan Bajaj',   cls:'Class IX (A)'        },
  { uid:17, admNo:'ADM017', name:'Kavya Reddy',    cls:'Class X (A)'         },
  { uid:18, admNo:'ADM018', name:'Mohit Soni',     cls:'Class X (B)'         },
  { uid:19, admNo:'ADM019', name:'Divya Saxena',   cls:'Class XI (Science)'  },
  { uid:20, admNo:'ADM020', name:'Harsh Trivedi',  cls:'Class XII (Commerce)'},
]
const PER_PAGE = 8

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function clx(...args) { return args.filter(Boolean).join(' ') }

// ─── FILTER SELECT ────────────────────────────────────────────────────────────
function FilterSel({ label, value, onChange, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{label}</label>
      <select value={value} onChange={onChange}
        className="w-full px-3 py-2 text-[13px] border rounded-lg outline-none transition-all appearance-none cursor-pointer font-medium
          border-slate-200 bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400
          dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          hover:border-slate-300 dark:hover:border-indigo-400/40">
        {children}
      </select>
    </div>
  )
}

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ items, onRemove }) {
  if (!items.length) return null
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2" style={{ maxWidth: 320, width: '90vw' }}>
      {items.map(t => (
        <div key={t.id} className={clx(
          'flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-[12px] font-semibold',
          t.type === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:border-emerald-500/30 dark:text-emerald-300'
            : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-900/30 dark:border-rose-500/30 dark:text-rose-300'
        )}>
          {t.type === 'success'
            ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            : <XCircle className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => onRemove(t.id)} className="opacity-50 hover:opacity-100 transition-opacity flex-shrink-0">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  )
}

// ─── UPLOAD CELL ─────────────────────────────────────────────────────────────
// Completely self-contained — NO conditional useState/useEffect tricks.
// Uses a controlled `photo` prop + local drag state only.
function UploadCell({ uid, photo, uploading, onUpload, size = 64 }) {
  const [drag, setDrag] = useState(false)
  const inputRef        = useRef(null)

  const pick = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    onUpload(uid, file)
  }

  return (
    <div
      onClick={() => !uploading && inputRef.current && inputRef.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]) }}
      style={{ width: size, height: size, flexShrink: 0 }}
      className={clx(
        'relative rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-all cursor-pointer select-none',
        uploading && 'opacity-60 cursor-not-allowed',
        drag      && 'border-blue-400 bg-blue-50 dark:border-indigo-400 dark:bg-indigo-500/10 scale-105',
        !drag && photo  && 'border-emerald-300 dark:border-emerald-500/40',
        !drag && !photo && 'border-slate-200 dark:border-[rgba(99,102,241,0.2)] hover:border-blue-300 dark:hover:border-indigo-400/50 bg-slate-50/60 dark:bg-white/[0.03]'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={uploading}
        onChange={e => pick(e.target.files[0])}
      />

      {/* Photo */}
      {photo && !uploading && (
        <>
          <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover rounded-xl" />
          <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all rounded-xl flex items-center justify-center">
            <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100" />
          </div>
          <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm z-10">
            <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
          </div>
        </>
      )}

      {/* Spinner */}
      {uploading && (
        <span className="w-5 h-5 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
      )}

      {/* Empty */}
      {!photo && !uploading && (
        <div className="flex flex-col items-center gap-1">
          <Camera className="w-5 h-5 text-slate-300 dark:text-slate-600" />
          <span className="text-[9px] font-semibold text-slate-400 dark:text-slate-500">
            {drag ? 'Drop!' : 'Upload'}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── BULK UPLOAD BANNER ───────────────────────────────────────────────────────
function BulkBanner({ onBulkFiles }) {
  const [drag, setDrag] = useState(false)
  const ref = useRef(null)

  const handle = (files) => {
    const imgs = Array.from(files).filter(f => f.type.startsWith('image/'))
    if (imgs.length) onBulkFiles(imgs)
  }

  return (
    <div
      onClick={() => ref.current && ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files) }}
      className={clx(
        'flex items-center gap-3 px-4 py-3 rounded-xl border-2 border-dashed cursor-pointer transition-all',
        drag
          ? 'border-blue-400 bg-blue-50 dark:border-indigo-400 dark:bg-indigo-500/10'
          : 'border-slate-200 bg-slate-50/60 dark:border-[rgba(99,102,241,0.2)] dark:bg-white/[0.03] hover:border-blue-300 dark:hover:border-indigo-400/40 hover:bg-blue-50/30'
      )}
    >
      <input ref={ref} type="file" accept="image/*" multiple className="hidden"
        onChange={e => handle(e.target.files)} />
      <div className={clx(
        'p-2 rounded-lg flex-shrink-0',
        drag ? 'bg-blue-100 dark:bg-indigo-500/20' : 'bg-white dark:bg-white/[0.06] border border-slate-100 dark:border-white/[0.08]'
      )}>
        <ImagePlus className={clx('w-4 h-4', drag ? 'text-blue-600 dark:text-indigo-300' : 'text-slate-400 dark:text-slate-500')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={clx('text-[12px] font-semibold', drag ? 'text-blue-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300')}>
          {drag ? 'Drop images here!' : 'Bulk upload — drag & drop multiple images'}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">
          Filenames should contain admission number (e.g. ADM001.jpg)
        </p>
      </div>
      <span className="hidden sm:block text-[11px] font-semibold text-blue-600 dark:text-indigo-400 flex-shrink-0">Browse</span>
    </div>
  )
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function UploadStudentImage({ title = 'Upload Student Image' }) {
  const [session,     setSession]     = useState('')
  const [cls,         setCls]         = useState('')
  const [loading,     setLoading]     = useState(false)
  const [hasViewed,   setHasViewed]   = useState(false)

  // Master photo map: uid → url string (or null)
  const [photoMap,    setPhotoMap]    = useState({})   // { [uid]: url | null }
  const [students,    setStudents]    = useState([])   // base student list (no photo field)
  const [uploadingId, setUploadingId] = useState(null)

  const [search,  setSearch]  = useState('')
  const [filter,  setFilter]  = useState('all') // all | uploaded | pending
  const [page,    setPage]    = useState(1)
  const [viewMode,setViewMode]= useState('table')
  const [toasts,  setToasts]  = useState([])

  // ── Toast helpers ────────────────────────────────────────────────────────
  const addToast = useCallback((msg, type = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(p => [...p, { id, msg, type }])
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 3500)
  }, [])

  const removeToast = useCallback((id) => setToasts(p => p.filter(t => t.id !== id)), [])

  // ── View ─────────────────────────────────────────────────────────────────
  const handleView = () => {
    setLoading(true)
    setHasViewed(true)
    setSearch('')
    setFilter('all')
    setPage(1)
    setPhotoMap({})
    // simulate fetch
    setTimeout(() => {
      setStudents(MOCK_STUDENTS)
      setPhotoMap(Object.fromEntries(MOCK_STUDENTS.map(s => [s.uid, null])))
      setLoading(false)
    }, 500)
  }

  // ── Clear ────────────────────────────────────────────────────────────────
  const handleClear = () => {
    setSession(''); setCls(''); setStudents([]); setPhotoMap({})
    setHasViewed(false); setSearch(''); setFilter('all'); setPage(1)
  }

  // ── Single upload ────────────────────────────────────────────────────────
  const handleUpload = useCallback((uid, file) => {
    setUploadingId(uid)
    const url = URL.createObjectURL(file)
    // simulate 800ms server save
    setTimeout(() => {
      setPhotoMap(prev => ({ ...prev, [uid]: url }))
      setUploadingId(null)
      setStudents(prev => {
        const s = prev.find(x => x.uid === uid)
        if (s) addToast(`Photo saved for ${s.name}!`)
        return prev // no change to students array itself
      })
    }, 800)
  }, [addToast])

  // ── Bulk upload ───────────────────────────────────────────────────────────
  const handleBulkFiles = useCallback((files) => {
    let matched = 0
    const updates = {}
    files.forEach(file => {
      const name = file.name.toLowerCase().replace(/\.[^.]+$/, '')
      const s = students.find(st => name.includes(st.admNo.toLowerCase()))
      if (s) { updates[s.uid] = URL.createObjectURL(file); matched++ }
    })
    if (!matched) { addToast('No filenames matched any admission number.', 'error'); return }
    setPhotoMap(prev => ({ ...prev, ...updates }))
    addToast(`${matched} photo${matched > 1 ? 's' : ''} matched and uploaded!`)
  }, [students, addToast])

  // ── Derived values ────────────────────────────────────────────────────────
  const uploadedCount = students.filter(s => photoMap[s.uid]).length
  const pendingCount  = students.length - uploadedCount

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchQ = !q || s.name.toLowerCase().includes(q) || s.admNo.toLowerCase().includes(q)
    const matchF = filter === 'all' || (filter === 'uploaded' && photoMap[s.uid]) || (filter === 'pending' && !photoMap[s.uid])
    return matchQ && matchF
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const pageData   = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)

  const progressPct = students.length > 0 ? Math.round((uploadedCount / students.length) * 100) : 0

  return (
    <div className="space-y-4 pb-8">

      {/* Title */}
      <div>
        <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Select session &amp; class, click View, then upload photos by clicking or dragging on each cell.
        </p>
      </div>

      {/* ── Filter card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <SlidersHorizontal className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Select Class</span>
        </div>
        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <FilterSel label="Session" value={session} onChange={e => setSession(e.target.value)}>
              <option value="">— Select Session —</option>
              {SESSIONS.map(s => <option key={s}>{s}</option>)}
            </FilterSel>
            <FilterSel label="Class" value={cls} onChange={e => setCls(e.target.value)}>
              <option value="">— Select Class —</option>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </FilterSel>
            <div className="flex flex-col justify-end">
              <div className="flex gap-2">
                <button onClick={handleView} disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-2 text-[13px] font-semibold text-white rounded-lg transition-all active:scale-95
                    bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                    dark:bg-indigo-600 dark:hover:bg-indigo-700
                    disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Loading...</>
                    : <><Eye className="w-4 h-4" /> View</>
                  }
                </button>
                <button onClick={handleClear} title="Reset"
                  className="px-3 py-2 text-[13px] font-semibold rounded-lg transition-colors
                    bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/[0.06] dark:text-slate-400 dark:hover:bg-white/[0.1]">
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Students section ── */}
      {hasViewed && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Section header */}
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] flex-wrap gap-y-2">
            <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
            <Camera className="w-4 h-4 text-slate-400 dark:text-slate-500" />
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">
              Students
              {students.length > 0 && <span className="ml-2 text-[11px] font-normal text-slate-400">({filtered.length} shown)</span>}
            </span>

            {/* Stats */}
            {students.length > 0 && (
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full
                  bg-emerald-50 text-emerald-700 border border-emerald-100
                  dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20">
                  <Check className="w-3 h-3" /> {uploadedCount} done
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-full
                  bg-amber-50 text-amber-700 border border-amber-100
                  dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20">
                  <Camera className="w-3 h-3" /> {pendingCount} pending
                </span>
              </div>
            )}

            {/* View toggle */}
            {students.length > 0 && (
              <div className="flex rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden">
                {['table', 'grid'].map(m => (
                  <button key={m} onClick={() => setViewMode(m)}
                    className={clx(
                      'px-2.5 py-1.5 text-[11px] font-semibold transition-colors capitalize',
                      viewMode === m
                        ? 'bg-blue-500 text-white dark:bg-indigo-600'
                        : 'bg-white text-slate-500 hover:bg-slate-50 dark:bg-transparent dark:text-slate-400 dark:hover:bg-white/[0.06]'
                    )}>
                    {m}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Search + filter row */}
          {students.length > 0 && (
            <div className="flex items-center gap-3 px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-wrap gap-y-2">
              <div className="relative flex-1" style={{ maxWidth: 280 }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
                  placeholder="Search name or adm. no..."
                  className="w-full pl-9 pr-3 py-1.5 text-[12px] border rounded-lg outline-none transition-all
                    border-slate-200 bg-white text-slate-700 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400" />
              </div>
              <div className="flex gap-1.5">
                {[['all','All'],['pending','Pending'],['uploaded','Uploaded']].map(([id,lbl]) => (
                  <button key={id} onClick={() => { setFilter(id); setPage(1) }}
                    className={clx(
                      'px-3 py-1.5 text-[11px] font-semibold rounded-lg border transition-all',
                      filter === id
                        ? 'bg-blue-500 border-blue-500 text-white dark:bg-indigo-600 dark:border-indigo-600'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 dark:bg-transparent dark:border-[rgba(99,102,241,0.2)] dark:text-slate-400'
                    )}>
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bulk upload */}
          {students.length > 0 && (
            <div className="px-4 sm:px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
              <BulkBanner onBulkFiles={handleBulkFiles} />
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <span className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              <span className="text-[13px] text-slate-400 dark:text-slate-500">Loading students...</span>
            </div>
          )}

          {/* Empty search result */}
          {!loading && students.length > 0 && filtered.length === 0 && (
            <div className="flex flex-col items-center py-14 gap-3">
              <Search className="w-8 h-8 text-slate-300 dark:text-slate-600" />
              <p className="text-[13px] text-slate-500 dark:text-slate-400 font-semibold">No students match</p>
              <button onClick={() => { setSearch(''); setFilter('all') }}
                className="text-[12px] font-semibold text-blue-600 dark:text-indigo-400 hover:underline">
                Clear filters
              </button>
            </div>
          )}

          {/* ── DESKTOP TABLE ── */}
          {!loading && pageData.length > 0 && viewMode === 'table' && (
            <div className="hidden sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/[0.06]">
                    {['#','Adm. No.','Name','Class','Current Photo','Upload','Status'].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pageData.map((s, i) => {
                    const photo     = photoMap[s.uid] || null
                    const uploading = uploadingId === s.uid
                    const rowIdx    = (page - 1) * PER_PAGE + i
                    return (
                      <tr key={s.uid}
                        className={clx(
                          'transition-colors',
                          rowIdx % 2 === 0 ? 'bg-white dark:bg-transparent' : 'bg-slate-50/40 dark:bg-white/[0.015]',
                          photo ? 'hover:bg-emerald-50/20 dark:hover:bg-emerald-500/5' : 'hover:bg-blue-50/20 dark:hover:bg-indigo-500/5'
                        )}>
                        <td className="px-4 py-3 text-[11px] text-slate-400 font-mono">{rowIdx + 1}</td>
                        <td className="px-4 py-3 text-[12px] font-semibold text-slate-600 dark:text-slate-300 font-mono">{s.admNo}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center text-[12px] font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
                              {s.name.charAt(0)}
                            </div>
                            <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 whitespace-nowrap">{s.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[12px] text-slate-500 dark:text-slate-400 whitespace-nowrap">{s.cls}</td>
                        <td className="px-4 py-3">
                          {photo
                            ? <img src={photo} alt={s.name} className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-200 dark:border-emerald-500/30 shadow-sm" />
                            : <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-white/[0.08] flex items-center justify-center border border-slate-200 dark:border-white/[0.08]">
                                <User className="w-5 h-5 text-slate-300 dark:text-slate-600" />
                              </div>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <UploadCell uid={s.uid} photo={photo} uploading={uploading} onUpload={handleUpload} size={56} />
                        </td>
                        <td className="px-4 py-3">
                          {uploading ? (
                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                              <span className="w-3 h-3 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" /> Uploading…
                            </span>
                          ) : photo ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20">
                              <Check className="w-3 h-3" /> Uploaded
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-500 border border-slate-200 dark:bg-white/[0.08] dark:text-slate-400 dark:border-white/[0.08]">
                              <Camera className="w-3 h-3" /> No photo
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* ── MOBILE LIST ── */}
          {!loading && pageData.length > 0 && viewMode === 'table' && (
            <div className="sm:hidden p-3 space-y-2">
              {pageData.map(s => {
                const photo     = photoMap[s.uid] || null
                const uploading = uploadingId === s.uid
                return (
                  <div key={s.uid} className={clx(
                    'flex items-center gap-3 p-3 rounded-xl border transition-all',
                    photo
                      ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                      : 'border-slate-100 bg-white dark:border-[rgba(99,102,241,0.12)] dark:bg-[#1e2238]'
                  )}>
                    <UploadCell uid={s.uid} photo={photo} uploading={uploading} onUpload={handleUpload} size={56} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{s.name}</p>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500">{s.admNo} · {s.cls}</p>
                    </div>
                    {uploading ? (
                      <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
                    ) : photo ? (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                        <Check className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0">Tap</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* ── GRID VIEW ── */}
          {!loading && pageData.length > 0 && viewMode === 'grid' && (
            <div className="p-4 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {pageData.map(s => {
                const photo     = photoMap[s.uid] || null
                const uploading = uploadingId === s.uid
                return (
                  <div key={s.uid} className={clx(
                    'rounded-xl border overflow-hidden shadow-sm transition-all',
                    photo
                      ? 'border-emerald-200 bg-emerald-50/30 dark:border-emerald-500/20 dark:bg-emerald-500/5'
                      : 'border-slate-100 bg-white dark:border-[rgba(99,102,241,0.12)] dark:bg-[#1e2238]'
                  )}>
                    <div className="p-2 flex flex-col items-center gap-1.5">
                      <UploadCell uid={s.uid} photo={photo} uploading={uploading} onUpload={handleUpload} size={64} />
                      {photo && (
                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5" /> Done
                        </span>
                      )}
                    </div>
                    <div className="px-2 pb-2 text-center">
                      <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate leading-tight">{s.name}</p>
                      <p className="text-[9px] text-slate-400 dark:text-slate-500">{s.admNo}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Progress bar */}
          {!loading && students.length > 0 && (
            <div className="px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/60 dark:bg-white/[0.01]">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Upload progress</span>
                <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300">{uploadedCount}/{students.length} ({progressPct}%)</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {uploadedCount === students.length && uploadedCount > 0 && (
                <p className="mt-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All photos uploaded!
                </p>
              )}
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > PER_PAGE && (
            <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-wrap">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                  .map((p, i, arr) => (
                    <span key={p} className="flex items-center">
                      {i > 0 && arr[i - 1] !== p - 1 && <span className="text-slate-300 dark:text-slate-600 px-1 text-[12px]">…</span>}
                      <button onClick={() => setPage(p)}
                        className={clx(
                          'min-w-[32px] h-8 px-2 rounded-lg text-[12px] font-semibold transition-colors',
                          page === p
                            ? 'bg-blue-600 text-white dark:bg-indigo-600 shadow-sm'
                            : 'border border-slate-200 dark:border-white/[0.08] text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                        )}>
                        {p}
                      </button>
                    </span>
                  ))}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/[0.08] text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.06] disabled:opacity-30 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <Toast items={toasts} onRemove={removeToast} />
    </div>
  )
}
