/**
 * StudentAcademicPerformance.jsx
 * Folder: src/pages/Student/Reports/StudentAcademicPerformance.jsx
 *
 * Converts legacy ASPX "Studentwise Academic Performance" to fully-responsive
 * React + Tailwind — matching the StrengthReport design system.
 *
 * Features:
 *  - Session → Class → Student cascading dropdowns
 *  - Show report (Highcharts-style bar chart rendered in SVG)
 *  - Graph type selector (bar, column, line, area, pie)
 *  - Export button
 *  - Desktop: dense ERP-style layout with performance table + chart
 *  - Mobile: stacked cards with expandable details + bottom-drawer filters
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Search,
  BarChart3, BarChart2, TrendingUp, FileSpreadsheet, BookOpen,
  School2, User, GraduationCap, Award, Target, Star,
  Building2, MapPin, Info, Download, Layers
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const CLASSES_BY_SESSION = {
  '2022-23': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
    'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2023-24': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
    'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2024-25': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
    'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
  '2025-26': ['Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
    'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X', 'Class XI', 'Class XII'],
}

// Students per class (all sessions share same students for demo)
const STUDENTS_BY_CLASS = {
  'Class I':    ['Aarav Sharma (Roll: 101)', 'Priya Singh (Roll: 102)', 'Rohan Gupta (Roll: 103)', 'Ananya Verma (Roll: 104)'],
  'Class II':   ['Kabir Mehta (Roll: 201)', 'Riya Joshi (Roll: 202)', 'Dev Patel (Roll: 203)', 'Meera Nair (Roll: 204)'],
  'Class III':  ['Arjun Kumar (Roll: 301)', 'Sia Agarwal (Roll: 302)', 'Vivek Rao (Roll: 303)', 'Pooja Mishra (Roll: 304)'],
  'Class IV':   ['Ishaan Tiwari (Roll: 401)', 'Nisha Pandey (Roll: 402)', 'Karan Saxena (Roll: 403)', 'Aditi Sharma (Roll: 404)'],
  'Class V':    ['Siddharth Roy (Roll: 501)', 'Tanvi Gupta (Roll: 502)', 'Aditya Singh (Roll: 503)', 'Kavya Reddy (Roll: 504)'],
  'Class VI':   ['Raj Malhotra (Roll: 601)', 'Neha Kapoor (Roll: 602)', 'Arnav Das (Roll: 603)', 'Divya Jain (Roll: 604)'],
  'Class VII':  ['Vedant Chaudhary (Roll: 701)', 'Shruti Bose (Roll: 702)', 'Harsh Yadav (Roll: 703)', 'Pallavi Menon (Roll: 704)'],
  'Class VIII': ['Nikhil Bajaj (Roll: 801)', 'Ritika Sood (Roll: 802)', 'Gaurav Tripathi (Roll: 803)', 'Sneha Iyer (Roll: 804)'],
  'Class IX':   ['Akash Kulkarni (Roll: 901)', 'Swati Dubey (Roll: 902)', 'Mohit Goel (Roll: 903)', 'Anjali Srivastava (Roll: 904)'],
  'Class X':    ['Shubham Bansal (Roll: 1001)', 'Kritika Sharma (Roll: 1002)', 'Varun Choudhary (Roll: 1003)', 'Isha Rawat (Roll: 1004)'],
  'Class XI':   ['Rahul Saxena (Roll: 1101)', 'Deepika Negi (Roll: 1102)', 'Yash Chauhan (Roll: 1103)', 'Prerna Bisht (Roll: 1104)'],
  'Class XII':  ['Abhishek Thakur (Roll: 1201)', 'Simran Arora (Roll: 1202)', 'Manish Rawat (Roll: 1203)', 'Tanisha Garg (Roll: 1204)'],
}

// Performance data generator per student
const generatePerformance = (studentName, session) => {
  const seed = (studentName.charCodeAt(0) + studentName.charCodeAt(1) + parseInt(session.slice(0, 4))) % 30
  const exams = ['Unit Test 1', 'Mid Term', 'Unit Test 2', 'Annual Exam']
  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Social Studies', 'Computer']

  return exams.map((exam, ei) => ({
    exam,
    subjects: subjects.map((subject, si) => {
      const base = 55 + ((seed + ei * 7 + si * 11) % 40)
      const obtained = Math.min(100, base)
      const total = 100
      return { subject, obtained, total, grade: gradeFromPct(obtained / total * 100) }
    }),
    get totalObtained() { return this.subjects.reduce((s, r) => s + r.obtained, 0) },
    get totalMax() { return this.subjects.reduce((s, r) => s + r.total, 0) },
    get percentage() { return Math.round((this.totalObtained / this.totalMax) * 100) },
  }))
}

function gradeFromPct(pct) {
  if (pct >= 90) return { label: 'A+', color: 'emerald' }
  if (pct >= 80) return { label: 'A',  color: 'blue'    }
  if (pct >= 70) return { label: 'B+', color: 'cyan'    }
  if (pct >= 60) return { label: 'B',  color: 'violet'  }
  if (pct >= 50) return { label: 'C',  color: 'amber'   }
  return              { label: 'D',  color: 'rose'    }
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const GRADE_COLORS = {
  emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  blue:    'bg-blue-50    text-blue-700    dark:bg-blue-500/15    dark:text-blue-400',
  cyan:    'bg-cyan-50    text-cyan-700    dark:bg-cyan-500/15    dark:text-cyan-400',
  violet:  'bg-violet-50  text-violet-700  dark:bg-violet-500/15  dark:text-violet-400',
  amber:   'bg-amber-50   text-amber-700   dark:bg-amber-500/15   dark:text-amber-400',
  rose:    'bg-rose-50    text-rose-700    dark:bg-rose-500/15    dark:text-rose-400',
}

const BAR_FILL_COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

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

// ─── SCHOOL HEADER ────────────────────────────────────────────────────────────

function SchoolHeader({ session, studentName, className }) {
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
      <div className="flex flex-wrap items-center justify-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25 text-[12px] font-bold text-amber-700 dark:text-amber-400">
          Session: {session}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 border border-blue-200 dark:border-blue-500/25 text-[12px] font-bold text-blue-700 dark:text-blue-400">
          <GraduationCap className="w-3.5 h-3.5" /> {className}
        </span>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 border border-violet-200 dark:border-violet-500/25 text-[12px] font-bold text-violet-700 dark:text-violet-400">
          <User className="w-3.5 h-3.5" /> {studentName.split(' (Roll:')[0]}
        </span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Academic Performance Report
      </p>
    </div>
  )
}

// ─── SUMMARY CARDS ────────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, sub, color }) {
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
        {sub && <p className="text-[10px] text-slate-400 dark:text-slate-500">{sub}</p>}
      </div>
    </div>
  )
}

// ─── GRAPH TYPE TABS ──────────────────────────────────────────────────────────

const GRAPH_TYPES = ['bar', 'column', 'line', 'area', 'pie']

function GraphTypeTabs({ value, onChange }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {GRAPH_TYPES.map(t => (
        <button
          key={t}
          type="button"
          onClick={() => onChange(t)}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-semibold capitalize transition-all
            ${value === t
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
        >
          {t}
        </button>
      ))}
    </div>
  )
}

// ─── SVG CHART ────────────────────────────────────────────────────────────────

function PerformanceChart({ examData, graphType }) {
  const W = 680, H = 300, PAD = { top: 30, right: 20, bottom: 60, left: 50 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const labels = examData.map(e => e.exam)
  const values = examData.map(e => e.percentage)
  const maxVal = 100
  const yTicks = [0, 25, 50, 75, 100]

  const xStep = chartW / labels.length
  const barW = Math.min(xStep * 0.55, 60)

  const yScale = v => chartH - (v / maxVal) * chartH

  // Point coords for line/area
  const points = values.map((v, i) => ({
    x: PAD.left + i * xStep + xStep / 2,
    y: PAD.top + yScale(v),
  }))
  const polyline = points.map(p => `${p.x},${p.y}`).join(' ')
  const areaPath = `M${points.map(p => `${p.x},${p.y}`).join(' L')} L${points[points.length - 1].x},${PAD.top + chartH} L${points[0].x},${PAD.top + chartH} Z`

  // Pie
  const pieCX = W / 2, pieCY = H / 2, pieR = Math.min(chartW, chartH) / 2 - 10
  const total = values.reduce((s, v) => s + v, 0)
  let cumAngle = -Math.PI / 2
  const slices = values.map((v, i) => {
    const angle = (v / total) * 2 * Math.PI
    const x1 = pieCX + pieR * Math.cos(cumAngle)
    const y1 = pieCY + pieR * Math.sin(cumAngle)
    cumAngle += angle
    const x2 = pieCX + pieR * Math.cos(cumAngle)
    const y2 = pieCY + pieR * Math.sin(cumAngle)
    const largeArc = angle > Math.PI ? 1 : 0
    return { d: `M${pieCX},${pieCY} L${x1},${y1} A${pieR},${pieR} 0 ${largeArc} 1 ${x2},${y2} Z`, color: BAR_FILL_COLORS[i % BAR_FILL_COLORS.length], label: labels[i], pct: Math.round((v / total) * 100) }
  })

  if (graphType === 'pie') {
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 300 }}>
        {slices.map((s, i) => (
          <path key={i} d={s.d} fill={s.color} opacity={0.85} stroke="white" strokeWidth={2} />
        ))}
        {/* Pie legend */}
        {slices.map((s, i) => (
          <g key={i} transform={`translate(${W - 160}, ${H / 2 - slices.length * 10 + i * 22})`}>
            <rect width={12} height={12} fill={s.color} rx={3} />
            <text x={17} y={10} fontSize={11} fill="#64748b">{s.label} ({s.pct}%)</text>
          </g>
        ))}
      </svg>
    )
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" style={{ maxHeight: 300 }}>
      {/* Y grid */}
      {yTicks.map(tick => (
        <g key={tick}>
          <line
            x1={PAD.left} y1={PAD.top + yScale(tick)}
            x2={PAD.left + chartW} y2={PAD.top + yScale(tick)}
            stroke="#e2e8f0" strokeWidth={1} strokeDasharray={tick === 0 ? '0' : '4,4'}
          />
          <text x={PAD.left - 8} y={PAD.top + yScale(tick) + 4} textAnchor="end" fontSize={11} fill="#94a3b8">{tick}</text>
        </g>
      ))}

      {/* Area fill */}
      {(graphType === 'area') && (
        <path d={areaPath} fill={BAR_FILL_COLORS[0]} opacity={0.18} />
      )}

      {/* Bars */}
      {(graphType === 'bar' || graphType === 'column') && values.map((v, i) => {
        const bh = (v / maxVal) * chartH
        const bx = PAD.left + i * xStep + (xStep - barW) / 2
        const by = PAD.top + chartH - bh
        if (graphType === 'bar') {
          const bw2 = (v / maxVal) * chartW
          const by2 = PAD.top + i * (chartH / values.length) + (chartH / values.length - 24) / 2
          return (
            <g key={i}>
              <rect x={PAD.left} y={by2} width={bw2} height={24} rx={6}
                fill={BAR_FILL_COLORS[i % BAR_FILL_COLORS.length]} opacity={0.85} />
              <text x={PAD.left + bw2 + 6} y={by2 + 16} fontSize={12} fontWeight="600" fill="#475569">{v}%</text>
            </g>
          )
        }
        return (
          <g key={i}>
            <rect x={bx} y={by} width={barW} height={bh} rx={6}
              fill={BAR_FILL_COLORS[i % BAR_FILL_COLORS.length]} opacity={0.85} />
            <text x={bx + barW / 2} y={by - 6} textAnchor="middle" fontSize={12} fontWeight="600" fill="#475569">{v}%</text>
          </g>
        )
      })}

      {/* Line */}
      {(graphType === 'line' || graphType === 'area') && (
        <>
          <polyline points={polyline} fill="none" stroke={BAR_FILL_COLORS[0]} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
          {points.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={5} fill="white" stroke={BAR_FILL_COLORS[0]} strokeWidth={2.5} />
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize={12} fontWeight="600" fill="#475569">{values[i]}%</text>
            </g>
          ))}
        </>
      )}

      {/* X axis labels (column / line / area) */}
      {graphType !== 'bar' && labels.map((label, i) => (
        <text key={i}
          x={PAD.left + i * xStep + xStep / 2}
          y={PAD.top + chartH + 18}
          textAnchor="middle" fontSize={11} fill="#94a3b8"
        >
          {label.replace('Unit Test ', 'UT ')}
        </text>
      ))}

      {/* Bar Y labels */}
      {graphType === 'bar' && labels.map((label, i) => (
        <text key={i}
          x={PAD.left - 8}
          y={PAD.top + i * (chartH / values.length) + (chartH / values.length) / 2 + 4}
          textAnchor="end" fontSize={11} fill="#94a3b8"
        >
          {label.replace('Unit Test ', 'UT ')}
        </text>
      ))}
    </svg>
  )
}

// ─── EXAM PERFORMANCE CARD (MOBILE) ──────────────────────────────────────────

function ExamCard({ examData }) {
  const [expanded, setExpanded] = useState(false)
  const grade = gradeFromPct(examData.percentage)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
          <Award className="w-4 h-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight">{examData.exam}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            {examData.totalObtained}/{examData.totalMax} marks
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={`px-2.5 py-1 rounded-lg text-[12px] font-bold ${GRADE_COLORS[grade.color]}`}>
            {grade.label}
          </span>
          <span className="text-[18px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{examData.percentage}%</span>
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: `${examData.percentage}%` }}
          />
        </div>
      </div>

      {/* Subject breakdown */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-2">
          {examData.subjects.map((sub, si) => (
            <div key={si} className="flex items-center gap-3">
              <span className="text-[12px] text-slate-600 dark:text-slate-300 w-28 flex-shrink-0 truncate">{sub.subject}</span>
              <div className="flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-indigo-400 transition-all duration-500"
                  style={{ width: `${sub.obtained}%` }}
                />
              </div>
              <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 tabular-nums w-8 text-right">{sub.obtained}</span>
              <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-md ${GRADE_COLORS[sub.grade.color]}`}>
                {sub.grade.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── DESKTOP PERFORMANCE TABLE ────────────────────────────────────────────────

function DesktopTable({ performanceData }) {
  const subjects = performanceData[0]?.subjects.map(s => s.subject) ?? []

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap w-12">S.No.</th>
            <th className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Exam</th>
            {subjects.map(s => (
              <th key={s} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">{s}</th>
            ))}
            <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Total</th>
            <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">%</th>
            <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Grade</th>
          </tr>
        </thead>
        <tbody>
          {performanceData.map((exam, ei) => {
            const grade = gradeFromPct(exam.percentage)
            return (
              <tr key={ei} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 text-center text-[12px] text-slate-400 tabular-nums">{ei + 1}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <Award className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </span>
                    <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{exam.exam}</span>
                  </div>
                </td>
                {exam.subjects.map((sub, si) => (
                  <td key={si} className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-md text-[12px] font-semibold ${GRADE_COLORS[sub.grade.color]} tabular-nums`}>
                      {sub.obtained}
                    </span>
                  </td>
                ))}
                <td className="px-4 py-3 text-center">
                  <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tabular-nums">
                    {exam.totalObtained}/{exam.totalMax}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className="text-[13px] font-bold text-blue-700 dark:text-blue-400 tabular-nums">{exam.percentage}%</span>
                    <div className="w-16 h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: `${exam.percentage}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className={`px-2.5 py-1 rounded-lg text-[12px] font-bold ${GRADE_COLORS[grade.color]}`}>
                    {grade.label}
                  </span>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, session, setSession, selClass, setSelClass, student, setStudent, onShow, loading, errors }) {
  const classes = session ? (CLASSES_BY_SESSION[session] || []) : []
  const students = selClass ? (STUDENTS_BY_CLASS[selClass] || []) : []

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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => { setSession(e.target.value); setSelClass(''); setStudent('') }} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Class" error={errors.selClass} required>
            <NativeSelect value={selClass} onChange={e => { setSelClass(e.target.value); setStudent('') }} placeholder="-- Select Class --" error={errors.selClass} disabled={!session}>
              {classes.map(c => <option key={c} value={c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Student" error={errors.student} required>
            <NativeSelect value={student} onChange={e => setStudent(e.target.value)} placeholder="-- Select Student --" error={errors.student} disabled={!selClass}>
              {students.map(s => <option key={s} value={s}>{s}</option>)}
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

export default function StudentAcademicPerformance() {
  const [session,      setSession]      = useState('')
  const [selClass,     setSelClass]     = useState('')
  const [student,      setStudent]      = useState('')
  const [performanceData, setPerformanceData] = useState([])
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [graphType,    setGraphType]    = useState('column')

  // Snapshot of what was shown
  const [shownMeta, setShownMeta] = useState({ session: '', selClass: '', student: '' })

  const classes  = session  ? (CLASSES_BY_SESSION[session]   || []) : []
  const students = selClass ? (STUDENTS_BY_CLASS[selClass]   || []) : []

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validation & Show ─────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session)  err.session  = 'Please select a session'
    if (!selClass) err.selClass = 'Please select a class'
    if (!student)  err.student  = 'Please select a student'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    setTimeout(() => {
      const data = generatePerformance(student, session)
      setPerformanceData(data)
      setShownMeta({ session, selClass, student })
      setShown(true)
      setLoading(false)
      showToast(`Report loaded for ${student.split(' (Roll:')[0]}`)
    }, 700)
  }, [session, selClass, student])

  const handleReset = () => {
    setSession(''); setSelClass(''); setStudent('')
    setPerformanceData([]); setErrors({}); setShown(false)
    setShownMeta({ session: '', selClass: '', student: '' })
  }

  const handleExport = () => {
    if (!shown) { showToast('Show the report first before exporting.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Export ready! (API integration pending)') }, 1200)
  }

  // ── Summary stats ────────────────────────────────────────────────────────
  const overallPct = useMemo(() => {
    if (!performanceData.length) return 0
    const sum = performanceData.reduce((s, e) => s + e.percentage, 0)
    return Math.round(sum / performanceData.length)
  }, [performanceData])

  const bestExam = useMemo(() => {
    if (!performanceData.length) return null
    return performanceData.reduce((best, e) => e.percentage > best.percentage ? e : best, performanceData[0])
  }, [performanceData])

  const bestSubject = useMemo(() => {
    if (!performanceData.length) return null
    const subTotals = {}
    performanceData.forEach(exam => {
      exam.subjects.forEach(sub => {
        subTotals[sub.subject] = (subTotals[sub.subject] || 0) + sub.obtained
      })
    })
    const best = Object.entries(subTotals).sort((a, b) => b[1] - a[1])[0]
    return best ? best[0] : null
  }, [performanceData])

  const overallGrade = gradeFromPct(overallPct)
  const hasResults = shown && performanceData.length > 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Academic Performance
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Student-wise exam results across all subjects and terms.
          </p>
        </div>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ─────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            {/* Session */}
            <Field label="Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setSelClass(''); setStudent(''); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class */}
            <Field label="Class" error={errors.selClass} required>
              <NativeSelect
                value={selClass}
                onChange={e => { setSelClass(e.target.value); setStudent(''); setErrors(p => ({ ...p, selClass: undefined })) }}
                placeholder="-- Select Class --"
                error={errors.selClass}
                disabled={!session}
              >
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </NativeSelect>
            </Field>

            {/* Student */}
            <Field label="Student" error={errors.student} required>
              <NativeSelect
                value={student}
                onChange={e => { setStudent(e.target.value); setErrors(p => ({ ...p, student: undefined })) }}
                placeholder="-- Select Student --"
                error={errors.student}
                disabled={!selClass}
              >
                {students.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Action buttons */}
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
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ───────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {student ? student.split(' (Roll:')[0] : session ? `Session: ${session}` : 'Select Filters'}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExport} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
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
        session={session} setSession={setSession}
        selClass={selClass} setSelClass={setSelClass}
        student={student} setStudent={setStudent}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-24 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownMeta.session} studentName={shownMeta.student} className={shownMeta.selClass} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Target}       label="Overall Avg"     value={`${overallPct}%`}      color="blue"    />
            <SummaryCard icon={Star}         label="Overall Grade"   value={overallGrade.label}    color="emerald" />
            <SummaryCard icon={TrendingUp}   label="Best Exam"       value={bestExam?.exam?.split(' ')[0] ?? '—'} sub={`${bestExam?.percentage}%`} color="amber"   />
            <SummaryCard icon={BookOpen}     label="Top Subject"     value={bestSubject ?? '—'}    color="violet"  />
          </div>

          {/* ── Chart Card ─────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1">
                <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
                <BarChart3 className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Performance Chart</span>
              </div>
              {/* Graph type selector */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide hidden sm:inline">Graph:</span>
                <GraphTypeTabs value={graphType} onChange={setGraphType} />
              </div>
            </div>

            {/* Mobile graph type scroll */}
            <div className="flex sm:hidden items-center gap-2 px-4 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] overflow-x-auto">
              <Layers className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide flex-shrink-0">Graph:</span>
              <div className="flex gap-1.5">
                {GRAPH_TYPES.map(t => (
                  <button key={t} type="button" onClick={() => setGraphType(t)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold capitalize transition-all whitespace-nowrap flex-shrink-0
                      ${graphType === t
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6">
              <PerformanceChart examData={performanceData} graphType={graphType} />
            </div>
          </div>

          {/* ── Table Card ──────────────────────────────────────────────── */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Exam-wise Marks</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
                {performanceData.length} exams
              </span>
            </div>

            {/* Info */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Marks out of 100 per subject. Grade scale: A+ ≥90, A ≥80, B+ ≥70, B ≥60, C ≥50, D &lt;50.
              </p>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <DesktopTable performanceData={performanceData} />
            </div>

            {/* Mobile cards */}
            <div className="md:hidden p-4 space-y-3">
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                <Info className="w-3.5 h-3.5 flex-shrink-0" />
                Tap a card to see subject-wise breakdown.
              </p>
              {performanceData.map((exam, i) => (
                <ExamCard key={i} examData={exam} />
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Overall performance: <span className="font-bold text-slate-700 dark:text-slate-300">{overallPct}%</span>
                &nbsp;·&nbsp;Grade: <span className={`font-bold px-1.5 py-0.5 rounded-md text-[11px] ${GRADE_COLORS[overallGrade.color]}`}>{overallGrade.label}</span>
              </p>
              <button type="button" onClick={handleExport} disabled={exporting}
                className="hidden sm:flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Export
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session, class, and student, then click <strong>Show</strong> to view the academic performance report.
            </p>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
