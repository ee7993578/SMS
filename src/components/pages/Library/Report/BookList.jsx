/**
 * BookList.jsx
 * Folder: src/pages/Reports/Library/BookList.jsx
 *
 * Converts legacy ASPX "Book List" report to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Acc No, Book Name, Category, Author, Publisher
 * Features:
 *  - Category / Author / Publisher dropdown filters
 *  - Show report + Export buttons
 *  - School name header in report area
 *  - Mobile: expandable cards
 *  - Desktop: dense ERP-style table
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Info, Search,
  BookOpen, FileSpreadsheet, Library,
  Building2, MapPin, ChevronRight,
  Tag, User, Printer, Hash, TrendingUp,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const CATEGORIES = ['All', 'Science', 'Mathematics', 'History', 'Literature', 'Geography', 'Computer Science', 'Art', 'Sports']
const AUTHORS    = ['All', 'R.D. Sharma', 'S.L. Arora', 'NCERT', 'H.C. Verma', 'R.S. Aggarwal', 'Arihant', 'Oswaal', 'S. Chand']
const PUBLISHERS = ['All', 'NCERT Publications', 'S. Chand & Co.', 'Arihant Publishers', 'Oswaal Books', 'Laxmi Publications', 'Pearson India', 'Oxford Press']

const BOOKS_DATA = [
  { item_acc_no: 'ACC001', title: 'Mathematics Part I', category: 'Mathematics', author: 'R.D. Sharma',      publisher: 'S. Chand & Co.'      },
  { item_acc_no: 'ACC002', title: 'Physics Concepts',   category: 'Science',     author: 'H.C. Verma',      publisher: 'Arihant Publishers'  },
  { item_acc_no: 'ACC003', title: 'India: A History',   category: 'History',     author: 'NCERT',           publisher: 'NCERT Publications'  },
  { item_acc_no: 'ACC004', title: 'English Literature', category: 'Literature',  author: 'S. Chand',        publisher: 'S. Chand & Co.'      },
  { item_acc_no: 'ACC005', title: 'World Geography',    category: 'Geography',   author: 'NCERT',           publisher: 'NCERT Publications'  },
  { item_acc_no: 'ACC006', title: 'Computer Fundamentals', category: 'Computer Science', author: 'Arihant', publisher: 'Arihant Publishers' },
  { item_acc_no: 'ACC007', title: 'Mathematics Part II', category: 'Mathematics', author: 'R.S. Aggarwal',  publisher: 'S. Chand & Co.'      },
  { item_acc_no: 'ACC008', title: 'Chemistry Class XII', category: 'Science',    author: 'S.L. Arora',      publisher: 'Laxmi Publications'  },
  { item_acc_no: 'ACC009', title: 'Indian History Vol 2', category: 'History',   author: 'NCERT',           publisher: 'NCERT Publications'  },
  { item_acc_no: 'ACC010', title: 'Stories & Poems',    category: 'Literature',  author: 'Oswaal',          publisher: 'Oswaal Books'        },
  { item_acc_no: 'ACC011', title: 'Physical Geography', category: 'Geography',   author: 'NCERT',           publisher: 'NCERT Publications'  },
  { item_acc_no: 'ACC012', title: 'Programming in C++', category: 'Computer Science', author: 'Arihant',   publisher: 'Pearson India'       },
  { item_acc_no: 'ACC013', title: 'Calculus Essentials', category: 'Mathematics', author: 'R.D. Sharma',   publisher: 'S. Chand & Co.'      },
  { item_acc_no: 'ACC014', title: 'Biology Class XI',   category: 'Science',     author: 'NCERT',           publisher: 'NCERT Publications'  },
  { item_acc_no: 'ACC015', title: 'Medieval India',     category: 'History',     author: 'S. Chand',        publisher: 'Oxford Press'        },
  { item_acc_no: 'ACC016', title: 'Short Stories Vol 3', category: 'Literature', author: 'Arihant',         publisher: 'Arihant Publishers'  },
  { item_acc_no: 'ACC017', title: 'Human Geography',    category: 'Geography',   author: 'NCERT',           publisher: 'NCERT Publications'  },
  { item_acc_no: 'ACC018', title: 'Data Structures',    category: 'Computer Science', author: 'Arihant',   publisher: 'Laxmi Publications'  },
  { item_acc_no: 'ACC019', title: 'Algebra & Geometry', category: 'Mathematics', author: 'H.C. Verma',     publisher: 'Pearson India'       },
  { item_acc_no: 'ACC020', title: 'Physics Class XII',  category: 'Science',     author: 'S.L. Arora',      publisher: 'Laxmi Publications'  },
  { item_acc_no: 'ACC021', title: 'Ancient Civilizations', category: 'History',  author: 'Oswaal',          publisher: 'Oswaal Books'        },
  { item_acc_no: 'ACC022', title: 'Poetry Anthology',   category: 'Literature',  author: 'S. Chand',        publisher: 'S. Chand & Co.'      },
  { item_acc_no: 'ACC023', title: 'Economic Geography', category: 'Geography',   author: 'R.S. Aggarwal',   publisher: 'Arihant Publishers'  },
  { item_acc_no: 'ACC024', title: 'Web Technologies',   category: 'Computer Science', author: 'Arihant',   publisher: 'Pearson India'       },
  { item_acc_no: 'ACC025', title: 'Statistics & Prob.', category: 'Mathematics', author: 'R.S. Aggarwal',  publisher: 'S. Chand & Co.'      },
  { item_acc_no: 'ACC026', title: 'Organic Chemistry',  category: 'Science',     author: 'NCERT',           publisher: 'NCERT Publications'  },
  { item_acc_no: 'ACC027', title: 'Modern History',     category: 'History',     author: 'NCERT',           publisher: 'NCERT Publications'  },
  { item_acc_no: 'ACC028', title: 'Drama & Theatre',    category: 'Literature',  author: 'Oxford',          publisher: 'Oxford Press'        },
  { item_acc_no: 'ACC029', title: 'Climate & Weather',  category: 'Geography',   author: 'NCERT',           publisher: 'NCERT Publications'  },
  { item_acc_no: 'ACC030', title: 'Python Programming', category: 'Computer Science', author: 'Arihant',   publisher: 'Arihant Publishers'  },
]

// ─── COLOR HELPERS ─────────────────────────────────────────────────────────────
const CATEGORY_COLORS = {
  'Science':          { fg: '#0891b2', bg: '#cffafe', dot: 'bg-cyan-500'    },
  'Mathematics':      { fg: '#7c3aed', bg: '#ede9fe', dot: 'bg-violet-500'  },
  'History':          { fg: '#d97706', bg: '#fef3c7', dot: 'bg-amber-500'   },
  'Literature':       { fg: '#059669', bg: '#d1fae5', dot: 'bg-emerald-500' },
  'Geography':        { fg: '#0369a1', bg: '#e0f2fe', dot: 'bg-sky-500'     },
  'Computer Science': { fg: '#4f46e5', bg: '#e0e7ff', dot: 'bg-indigo-500'  },
  'Art':              { fg: '#db2777', bg: '#fce7f3', dot: 'bg-pink-500'     },
  'Sports':           { fg: '#16a34a', bg: '#dcfce7', dot: 'bg-green-500'   },
}
const DEFAULT_CAT_COLOR = { fg: '#64748b', bg: '#f1f5f9', dot: 'bg-slate-400' }
const getCatColor = (cat) => CATEGORY_COLORS[cat] || DEFAULT_CAT_COLOR

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

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value.toLocaleString()}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader({ category, author, publisher }) {
  const activeFilters = [
    category !== 'All' && category ? `Category: ${category}` : null,
    author !== 'All' && author ? `Author: ${author}` : null,
    publisher !== 'All' && publisher ? `Publisher: ${publisher}` : null,
  ].filter(Boolean)

  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-3">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          {activeFilters.map((f) => (
            <span key={f} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-semibold text-blue-700 dark:text-blue-400">
              <Tag className="w-3 h-3" />{f}
            </span>
          ))}
        </div>
      )}
      <p className="mt-1 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Library Book List
      </p>
    </div>
  )
}

// ─── CATEGORY BADGE ───────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const { fg, bg } = getCatColor(category)
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap"
      style={{ background: bg, color: fg }}
    >
      <Tag className="w-3 h-3 flex-shrink-0" />
      {category}
    </span>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Acc No */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
          <Hash className="w-3 h-3 opacity-60" />{row.item_acc_no}
        </span>
      </td>

      {/* Book Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10">
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 leading-snug">{row.title}</span>
        </div>
      </td>

      {/* Category */}
      <td className="px-4 py-3">
        <CategoryBadge category={row.category} />
      </td>

      {/* Author */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-[12px] text-slate-600 dark:text-slate-300">
          <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="font-medium truncate max-w-[140px]">{row.author}</span>
        </div>
      </td>

      {/* Publisher */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400">
          <Printer className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
          <span className="truncate max-w-[150px]">{row.publisher}</span>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = getCatColor(row.category)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Book icon badge */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
          style={{ background: bg }}
        >
          <BookOpen className="w-5 h-5" style={{ color: fg }} />
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-1">{row.title}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-mono">{row.item_acc_no}</p>
        </div>

        {/* Category badge */}
        <CategoryBadge category={row.category} />

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-2.5">
          <DetailRow icon={Hash}    label="Acc. No"    value={row.item_acc_no} mono />
          <DetailRow icon={BookOpen} label="Book Title" value={row.title} />
          <DetailRow icon={Tag}     label="Category"   value={row.category} />
          <DetailRow icon={User}    label="Author"     value={row.author} />
          <DetailRow icon={Printer} label="Publisher"  value={row.publisher} />
        </div>
      )}
    </div>
  )
}

function DetailRow({ icon: Icon, label, value, mono }) {
  return (
    <div className="flex items-start gap-3 py-1.5 border-b border-slate-50 dark:border-[rgba(99,102,241,0.05)] last:border-0">
      <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
        <p className={`text-[13px] font-semibold text-slate-700 dark:text-slate-200 mt-0.5 ${mono ? 'font-mono' : ''}`}>{value}</p>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, category, setCategory, author, setAuthor, publisher, setPublisher, onShow, loading }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Category">
            <NativeSelect value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Author">
            <NativeSelect value={author} onChange={e => setAuthor(e.target.value)}>
              {AUTHORS.map(a => <option key={a} value={a}>{a}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Publisher">
            <NativeSelect value={publisher} onChange={e => setPublisher(e.target.value)}>
              {PUBLISHERS.map(p => <option key={p} value={p}>{p}</option>)}
            </NativeSelect>
          </Field>
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
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BookList() {
  const [category,   setCategory]   = useState('All')
  const [author,     setAuthor]     = useState('All')
  const [publisher,  setPublisher]  = useState('All')

  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(false)
  const [exporting,  setExporting]  = useState(false)
  const [filterOpen, setFilterOpen] = useState(false)
  const [search,     setSearch]     = useState('')
  const [toast,      setToast]      = useState(null)
  const [shown,      setShown]      = useState(false)

  // Saved filter state for report header
  const [shownFilters, setShownFilters] = useState({ category: 'All', author: 'All', publisher: 'All' })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = [...BOOKS_DATA]
      if (category  && category  !== 'All') data = data.filter(b => b.category  === category)
      if (author    && author    !== 'All') data = data.filter(b => b.author    === author)
      if (publisher && publisher !== 'All') data = data.filter(b => b.publisher === publisher)

      setRows(data)
      setShownFilters({ category, author, publisher })
      setShown(true)
      setLoading(false)
      showToast(data.length > 0 ? `Loaded ${data.length} books.` : 'No books found for selected filters.')
    }, 650)
  }, [category, author, publisher])

  const handleReset = () => {
    setCategory('All'); setAuthor('All'); setPublisher('All')
    setRows([]); setSearch(''); setShown(false)
    setShownFilters({ category: 'All', author: 'All', publisher: 'All' })
  }

  // ── Excel Export placeholder ──────────────────────────────────────────────
  const handleExport = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.title.toLowerCase().includes(q) ||
      r.item_acc_no.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.author.toLowerCase().includes(q) ||
      r.publisher.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Summary counts ────────────────────────────────────────────────────────
  const summary = useMemo(() => {
    const cats = new Set(filtered.map(r => r.category)).size
    const auths = new Set(filtered.map(r => r.author)).size
    const pubs  = new Set(filtered.map(r => r.publisher)).size
    return { total: filtered.length, cats, auths, pubs }
  }, [filtered])

  const hasResults   = shown && rows.length > 0
  const activeFilters = [category !== 'All', author !== 'All', publisher !== 'All'].filter(Boolean).length

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Library className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Book List
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Library catalogue — filter by category, author, or publisher.
          </p>
        </div>
        {hasResults && (
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
          {activeFilters > 0 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {activeFilters} active
            </span>
          )}
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Category">
              <NativeSelect value={category} onChange={e => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Author">
              <NativeSelect value={author} onChange={e => setAuthor(e.target.value)}>
                {AUTHORS.map(a => <option key={a} value={a}>{a}</option>)}
              </NativeSelect>
            </Field>

            <Field label="Publisher">
              <NativeSelect value={publisher} onChange={e => setPublisher(e.target.value)}>
                {PUBLISHERS.map(p => <option key={p} value={p}>{p}</option>)}
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
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset Filters"
              >
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
          {activeFilters > 0 ? `Filters (${activeFilters} active)` : 'Filters'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
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
        category={category}   setCategory={setCategory}
        author={author}       setAuthor={setAuthor}
        publisher={publisher} setPublisher={setPublisher}
        onShow={handleShow}
        loading={loading}
      />

      {/* ── Loading Skeleton ────────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader
            category={shownFilters.category}
            author={shownFilters.author}
            publisher={shownFilters.publisher}
          />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={BookOpen}  label="Total Books"     value={summary.total} color="blue"    />
            <SummaryCard icon={Tag}       label="Categories"      value={summary.cats}  color="violet"  />
            <SummaryCard icon={User}      label="Authors"         value={summary.auths} color="emerald" />
            <SummaryCard icon={Printer}   label="Publishers"      value={summary.pubs}  color="amber"   />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <Library className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Book Catalogue</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} book{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search title, author, publisher…"
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
                Showing books filtered by selected criteria. Use search to find specific titles, authors, or publishers.
              </p>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden md:block overflow-x-auto">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No books match your search.</span>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                      {['S.No', 'Acc. No', 'Book Name', 'Category', 'Author', 'Publisher'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.item_acc_no} row={row} idx={i + 1} />
                    ))}
                    {/* Grand Total row */}
                    <tr className="bg-blue-50 dark:bg-indigo-500/[0.07] border-t-2 border-blue-200 dark:border-indigo-500/30">
                      <td className="px-4 py-3 text-center text-[12px] text-blue-500 dark:text-blue-400">—</td>
                      <td className="px-4 py-3" colSpan={5}>
                        <span className="text-[13px] font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Total: <span className="ml-1">{filtered.length} Books</span>
                          <span className="ml-2 text-[12px] font-medium text-blue-500 dark:text-blue-400">
                            across {summary.cats} categor{summary.cats === 1 ? 'y' : 'ies'}, {summary.auths} author{summary.auths !== 1 ? 's' : ''}, {summary.pubs} publisher{summary.pubs !== 1 ? 's' : ''}
                          </span>
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>

            {/* ── MOBILE CARDS ── */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600">
                  <Search className="w-6 h-6 opacity-40" />
                  <span className="text-[13px]">No books match your search.</span>
                </div>
              ) : (
                <>
                  <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                    <Info className="w-3.5 h-3.5 flex-shrink-0" />
                    Tap a card to see full book details.
                  </p>

                  {filtered.map((row, i) => (
                    <MobileCard key={row.item_acc_no} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{summary.total}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Books</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{summary.cats}</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Categories</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">{summary.auths}</p>
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">Authors</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-amber-700 dark:text-amber-300 tabular-nums">{summary.pubs}</p>
                        <p className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">Publishers</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> books
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
            <Library className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select filters and click <strong>Show</strong> to view the book list.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
