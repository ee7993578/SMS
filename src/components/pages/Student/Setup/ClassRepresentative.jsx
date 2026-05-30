/**
 * ClassRepresentative.jsx
 * Folder: src/pages/Configuration/ClassRepresentative.jsx
 *
 * Converts legacy ASPX "Define Class Representative" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Session header display
 *  - GridView showing each class with a dropdown to select class representative
 *  - Submit button to save all selections
 *  - Desktop: clean ERP table layout
 *  - Mobile: card-based layout with dropdowns per class
 *  - Toast feedback, loading states, empty states
 */

import { useState, useCallback, useMemo } from 'react'
import {
  UserCheck, ChevronDown, AlertCircle, X, Check,
  Loader2, RefreshCw, Save, School2, Users,
  BookOpen, BadgeCheck, SlidersHorizontal,
  Info, Building2, Award, ChevronRight
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const CURRENT_SESSION = '2025-26'

// Classes list (mirrors class_id + class_name from DB)
const CLASSES = [
  { class_id: 1,  class_name: 'Nursery'    },
  { class_id: 2,  class_name: 'LKG'        },
  { class_id: 3,  class_name: 'UKG'        },
  { class_id: 4,  class_name: 'Class I'    },
  { class_id: 5,  class_name: 'Class II'   },
  { class_id: 6,  class_name: 'Class III'  },
  { class_id: 7,  class_name: 'Class IV'   },
  { class_id: 8,  class_name: 'Class V'    },
  { class_id: 9,  class_name: 'Class VI'   },
  { class_id: 10, class_name: 'Class VII'  },
  { class_id: 11, class_name: 'Class VIII' },
  { class_id: 12, class_name: 'Class IX'   },
  { class_id: 13, class_name: 'Class X'    },
  { class_id: 14, class_name: 'Class XI'   },
  { class_id: 15, class_name: 'Class XII'  },
]

// Students per class (simulate API response per class_id)
const STUDENTS_BY_CLASS = {
  1:  [{ id: 101, name: 'Aarav Sharma'    }, { id: 102, name: 'Priya Singh'     }, { id: 103, name: 'Riya Gupta'      }],
  2:  [{ id: 201, name: 'Vivaan Verma'    }, { id: 202, name: 'Ananya Patel'    }, { id: 203, name: 'Ishaan Tiwari'   }],
  3:  [{ id: 301, name: 'Aditya Kumar'    }, { id: 302, name: 'Kavya Mishra'    }, { id: 303, name: 'Rohan Joshi'     }],
  4:  [{ id: 401, name: 'Arjun Yadav'     }, { id: 402, name: 'Neha Dubey'      }, { id: 403, name: 'Siddharth Rao'   }],
  5:  [{ id: 501, name: 'Tanvi Mehta'     }, { id: 502, name: 'Dev Kapoor'      }, { id: 503, name: 'Sneha Pandey'    }],
  6:  [{ id: 601, name: 'Manav Srivastava'}, { id: 602, name: 'Pooja Chauhan'   }, { id: 603, name: 'Ayush Agarwal'   }],
  7:  [{ id: 701, name: 'Diya Saxena'     }, { id: 702, name: 'Kabir Bose'      }, { id: 703, name: 'Isha Malhotra'   }],
  8:  [{ id: 801, name: 'Rishi Nair'      }, { id: 802, name: 'Sakshi Jain'     }, { id: 803, name: 'Mohit Pillai'    }],
  9:  [{ id: 901, name: 'Shreya Ghosh'    }, { id: 902, name: 'Arnav Reddy'     }, { id: 903, name: 'Meera Iyer'      }],
  10: [{ id: 1001, name: 'Karan Bajaj'    }, { id: 1002, name: 'Divya Chaudhary'}, { id: 1003, name: 'Varun Thakur'   }],
  11: [{ id: 1101, name: 'Ankit Rawat'    }, { id: 1102, name: 'Ritika Aggarwal' }, { id: 1103, name: 'Piyush Bansal'  }],
  12: [{ id: 1201, name: 'Nidhi Shukla'   }, { id: 1202, name: 'Harsh Bhatt'    }, { id: 1203, name: 'Prachi Tripathi' }],
  13: [{ id: 1301, name: 'Akash Tomar'    }, { id: 1302, name: 'Simran Kaur'    }, { id: 1303, name: 'Vinay Patil'     }],
  14: [{ id: 1401, name: 'Ankita Desai'   }, { id: 1402, name: 'Rahul Shah'     }, { id: 1403, name: 'Pooja Lal'       }],
  15: [{ id: 1501, name: 'Amit Naik'      }, { id: 1502, name: 'Sunita Menon'   }, { id: 1503, name: 'Rajesh Rao'      }],
}

// Existing saved representatives (simulate pre-loaded DB values)
const SAVED_REPS = {
  1: 102, 3: 301, 5: 502, 7: 702, 9: 901, 12: 1202, 14: 1401,
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (id) => CLASS_COLORS[(id ?? 0) % CLASS_COLORS.length]

const formatAbbr = (name = '') =>
  name.replace('Class ', '').slice(0, 3).toUpperCase()

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

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

// Representative dropdown — shared between desktop & mobile
function RepDropdown({ classId, value, onChange, disabled }) {
  const students = STUDENTS_BY_CLASS[classId] || []
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(classId, e.target.value)}
        disabled={disabled}
        className="w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 border-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <option value="">-- Select Representative --</option>
        {students.map(s => (
          <option key={s.id} value={s.id}>{s.name}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, index, repValue, onRepChange, saving }) {
  const { fg, bg } = classColor(row.class_id)
  const hasRep = !!repValue
  const repName = hasRep
    ? (STUDENTS_BY_CLASS[row.class_id] || []).find(s => String(s.id) === String(repValue))?.name
    : null

  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {index}
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {formatAbbr(row.class_name)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {row.class_name}
          </span>
        </div>
      </td>

      {/* Dropdown */}
      <td className="px-4 py-3 min-w-[220px]">
        <RepDropdown
          classId={row.class_id}
          value={repValue}
          onChange={onRepChange}
          disabled={saving}
        />
      </td>

      {/* Status badge */}
      <td className="px-4 py-3 text-center w-36">
        {hasRep ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
            <BadgeCheck className="w-3.5 h-3.5 flex-shrink-0" />
            Assigned
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            Pending
          </span>
        )}
      </td>
    </tr>
  )
}

// ─── MOBILE CLASS CARD ────────────────────────────────────────────────────────
function MobileCard({ row, repValue, onRepChange, saving }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class_id)
  const hasRep = !!repValue
  const repName = hasRep
    ? (STUDENTS_BY_CLASS[row.class_id] || []).find(s => String(s.id) === String(repValue))?.name
    : null

  return (
    <div className={`rounded-xl border bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm transition-all
      ${hasRep
        ? 'border-emerald-200 dark:border-emerald-500/25'
        : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'}`}
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span
          className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {formatAbbr(row.class_name)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">
            {row.class_name}
          </p>
          <p className="text-[11px] mt-0.5 truncate">
            {hasRep
              ? <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 inline" /> {repName}
                </span>
              : <span className="text-amber-500 dark:text-amber-400">No representative assigned</span>
            }
          </p>
        </div>

        {/* Status dot */}
        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${hasRep ? 'bg-emerald-500' : 'bg-amber-400'}`} />
        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded: show dropdown */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Select Class Representative
          </p>
          <RepDropdown
            classId={row.class_id}
            value={repValue}
            onChange={onRepChange}
            disabled={saving}
          />
          {hasRep && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <p className="text-[12px] font-semibold text-emerald-700 dark:text-emerald-300">
                {repName} — assigned as representative
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ClassRepresentative() {
  // representatives state: { class_id -> student_id (string) }
  const [reps, setReps] = useState(() => {
    const init = {}
    Object.entries(SAVED_REPS).forEach(([cid, sid]) => {
      init[Number(cid)] = String(sid)
    })
    return init
  })

  const [saving,  setSaving]  = useState(false)
  const [toast,   setToast]   = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // Change handler
  const handleRepChange = useCallback((classId, studentId) => {
    setReps(prev => ({ ...prev, [classId]: studentId }))
  }, [])

  // Reset all
  const handleReset = () => {
    const init = {}
    Object.entries(SAVED_REPS).forEach(([cid, sid]) => {
      init[Number(cid)] = String(sid)
    })
    setReps(init)
    showToast('Selections reset to saved values.', 'success')
  }

  // Submit
  const handleSubmit = () => {
    const assigned = Object.values(reps).filter(Boolean)
    if (assigned.length === 0) {
      showToast('Please assign at least one class representative.', 'error')
      return
    }
    setSaving(true)
    // Simulate API call
    setTimeout(() => {
      setSaving(false)
      showToast(`Class representatives defined successfully for ${assigned.length} class(es)!`)
    }, 1200)
  }

  // Stats
  const totalClasses   = CLASSES.length
  const assignedCount  = useMemo(() => Object.values(reps).filter(Boolean).length, [reps])
  const pendingCount   = totalClasses - assignedCount

  return (
    <div className="space-y-4 pb-10">

      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
        <span className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors">Home</span>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-600 dark:text-slate-300 font-semibold">Define Class Representative</span>
      </nav>

      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Define Class Representative
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Session:&nbsp;
            <span className="font-semibold text-amber-600 dark:text-amber-400">{CURRENT_SESSION}</span>
            &nbsp;— Assign one representative per class.
          </p>
        </div>

        {/* Desktop action buttons */}
        <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Define Class Representative'}
          </button>
        </div>
      </div>

      {/* ── Summary Cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <SummaryCard icon={School2}   label="Total Classes"  value={totalClasses}  color="blue"    />
        <SummaryCard icon={BadgeCheck} label="Assigned"      value={assignedCount} color="emerald" />
        <SummaryCard icon={AlertCircle} label="Pending"      value={pendingCount}  color="amber"   />
      </div>

      {/* ── Main Card ──────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
              Class Representative Assignment
            </span>
            <span className="text-[13px] text-slate-400 dark:text-slate-500">· {CURRENT_SESSION}</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {totalClasses} classes
            </span>
          </div>
        </div>

        {/* Info hint */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Select one student per class to assign as class representative. Click <strong>Define Class Representative</strong> to save.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                {['S.No.', 'Class', 'Class Representative', 'Status'].map((h, i) => (
                  <th key={i} className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                    ${i === 0 || i === 3 ? 'text-center' : 'text-left'}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CLASSES.map((cls, i) => (
                <DesktopRow
                  key={cls.class_id}
                  row={cls}
                  index={i + 1}
                  repValue={reps[cls.class_id] || ''}
                  onRepChange={handleRepChange}
                  saving={saving}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            Tap a class card to assign its representative.
          </p>
          {CLASSES.map((cls) => (
            <MobileCard
              key={cls.class_id}
              row={cls}
              repValue={reps[cls.class_id] || ''}
              onRepChange={handleRepChange}
              saving={saving}
            />
          ))}
        </div>

        {/* ── Progress Bar ── */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[12px] font-semibold text-slate-600 dark:text-slate-400">
              Assignment Progress
            </p>
            <p className="text-[12px] font-bold text-slate-700 dark:text-slate-300 tabular-nums">
              {assignedCount} / {totalClasses}
              <span className="text-slate-400 font-normal ml-1">
                ({totalClasses ? Math.round((assignedCount / totalClasses) * 100) : 0}%)
              </span>
            </p>
          </div>
          <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
              style={{ width: `${totalClasses ? Math.round((assignedCount / totalClasses) * 100) : 0}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-1.5">
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {assignedCount} Assigned
            </p>
            <p className="text-[11px] text-amber-500 dark:text-amber-400 font-medium">
              {pendingCount} Pending
            </p>
          </div>
        </div>

        {/* ── Card Footer — actions ── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            {assignedCount === totalClasses
              ? <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold"><Check className="w-3.5 h-3.5" /> All classes assigned</span>
              : `${pendingCount} class${pendingCount !== 1 ? 'es' : ''} still need a representative.`
            }
          </p>

          {/* Mobile action buttons */}
          <div className="flex sm:hidden gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white
                bg-emerald-600 hover:bg-emerald-700
                transition-all active:scale-95 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
