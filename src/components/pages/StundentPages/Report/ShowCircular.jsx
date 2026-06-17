/**
 * ShowCircular.jsx
 * Folder: src/pages/Student/Circular/ShowCircular.jsx
 *
 * Converts legacy ASPX "show_circular.aspx" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Circular Title, File (Show button → inline preview)
 * Features:
 *  - Search / filter bar
 *  - Inline circular preview (like ASPX LinkButton1_Click)
 *  - Mobile: card-based list with tap-to-preview
 *  - Desktop: dense ERP table with inline preview panel
 *  - Toast notifications
 *  - Loading skeleton
 *  - Empty state
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Bell, Search, X, Eye, EyeOff, FileText,
  ChevronDown, ChevronRight, AlertCircle, Check,
  Loader2, RefreshCw, Filter, SlidersHorizontal,
  BookOpen, Info, Building2, MapPin,
  Download, ExternalLink, Tag, Calendar,
  ClipboardList, LayoutList, Megaphone
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// cir_files holds the CSS class in legacy ASPX (used as identifier/path here for preview)
const CIRCULARS = [
  {
    id: 1,
    cir_title: 'Annual Day Celebration – 2025',
    cir_files: 'circular-annual-day-2025',
    category: 'Event',
    date: '2025-06-10',
    content: `
      <div style="font-family:sans-serif;line-height:1.7;color:#1e293b;">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#1d4ed8;">Annual Day Celebration – 2025</h2>
        <p>Dear Parents / Guardians,</p>
        <p>We are delighted to inform you that the <strong>Annual Day Celebration 2025</strong> of our school will be held on <strong>28th June 2025 (Saturday)</strong> at the School Auditorium, starting at <strong>5:00 PM</strong>.</p>
        <p>All students are requested to report by <strong>4:00 PM</strong> in their respective costumes. Parents are cordially invited to grace the occasion.</p>
        <p>Kindly ensure timely attendance. Entry will be based on the admission cards issued separately.</p>
        <br/>
        <p>Warm regards,</p>
        <p><strong>Principal</strong><br/>Saraswati Vidya Mandir Sr. Sec. School</p>
      </div>`,
  },
  {
    id: 2,
    cir_title: 'Summer Vacation Schedule 2025',
    cir_files: 'circular-summer-vacation-2025',
    category: 'Holiday',
    date: '2025-05-20',
    content: `
      <div style="font-family:sans-serif;line-height:1.7;color:#1e293b;">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#d97706;">Summer Vacation Notice – 2025</h2>
        <p>This is to inform all students and parents that the school will remain closed for <strong>Summer Vacations</strong> from <strong>15th May 2025 to 30th June 2025</strong>.</p>
        <ul style="margin:8px 0 8px 18px;">
          <li>School reopens on <strong>1st July 2025 (Tuesday)</strong></li>
          <li>Students must carry their summer holiday homework on the day of reopening</li>
          <li>Library books must be returned before 14th May 2025</li>
        </ul>
        <p>We wish all students a joyful and productive vacation!</p>
        <br/>
        <p><strong>Vice Principal</strong></p>
      </div>`,
  },
  {
    id: 3,
    cir_title: 'Fee Submission Last Date – Term I',
    cir_files: 'circular-fee-submission-term1',
    category: 'Finance',
    date: '2025-04-05',
    content: `
      <div style="font-family:sans-serif;line-height:1.7;color:#1e293b;">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#dc2626;">Fee Submission – Term I (2025–26)</h2>
        <p>All parents are requested to submit the Term I fee on or before <strong>20th April 2025</strong> to avoid a late fine of ₹50 per day.</p>
        <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;">
          <tr style="background:#fee2e2;">
            <th style="border:1px solid #fca5a5;padding:6px 10px;text-align:left;">Class</th>
            <th style="border:1px solid #fca5a5;padding:6px 10px;text-align:left;">Tuition Fee</th>
            <th style="border:1px solid #fca5a5;padding:6px 10px;text-align:left;">Activity Fee</th>
          </tr>
          <tr>
            <td style="border:1px solid #fca5a5;padding:6px 10px;">Nursery – UKG</td>
            <td style="border:1px solid #fca5a5;padding:6px 10px;">₹3,500</td>
            <td style="border:1px solid #fca5a5;padding:6px 10px;">₹500</td>
          </tr>
          <tr style="background:#fff5f5;">
            <td style="border:1px solid #fca5a5;padding:6px 10px;">Class I – V</td>
            <td style="border:1px solid #fca5a5;padding:6px 10px;">₹4,200</td>
            <td style="border:1px solid #fca5a5;padding:6px 10px;">₹600</td>
          </tr>
          <tr>
            <td style="border:1px solid #fca5a5;padding:6px 10px;">Class VI – X</td>
            <td style="border:1px solid #fca5a5;padding:6px 10px;">₹5,000</td>
            <td style="border:1px solid #fca5a5;padding:6px 10px;">₹700</td>
          </tr>
          <tr style="background:#fff5f5;">
            <td style="border:1px solid #fca5a5;padding:6px 10px;">Class XI – XII</td>
            <td style="border:1px solid #fca5a5;padding:6px 10px;">₹6,000</td>
            <td style="border:1px solid #fca5a5;padding:6px 10px;">₹800</td>
          </tr>
        </table>
        <p>Payments accepted via Cash / DD / Online (portal: schoolpay.svm.edu.in)</p>
      </div>`,
  },
  {
    id: 4,
    cir_title: 'PTM – Parent Teacher Meeting (June 2025)',
    cir_files: 'circular-ptm-june-2025',
    category: 'Meeting',
    date: '2025-06-01',
    content: `
      <div style="font-family:sans-serif;line-height:1.7;color:#1e293b;">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#059669;">Parent Teacher Meeting – June 2025</h2>
        <p>A Parent Teacher Meeting (PTM) is scheduled for <strong>7th June 2025 (Saturday)</strong> from <strong>9:00 AM to 1:00 PM</strong>.</p>
        <p>Parents of all classes are requested to be present to discuss their ward's academic performance and conduct.</p>
        <ul style="margin:8px 0 8px 18px;">
          <li>Nursery – Class V : <strong>9:00 AM – 10:30 AM</strong></li>
          <li>Class VI – X : <strong>10:30 AM – 12:00 PM</strong></li>
          <li>Class XI – XII : <strong>12:00 PM – 1:00 PM</strong></li>
        </ul>
        <p>Report cards will be distributed during the PTM. Kindly carry your ward's previous report card.</p>
      </div>`,
  },
  {
    id: 5,
    cir_title: 'Sports Day – Registration Open',
    cir_files: 'circular-sports-day-reg',
    category: 'Event',
    date: '2025-05-10',
    content: `
      <div style="font-family:sans-serif;line-height:1.7;color:#1e293b;">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#7c3aed;">Sports Day 2025 – Registrations Open</h2>
        <p>Annual Sports Day will be held on <strong>20th June 2025</strong>. All students who wish to participate in sports events must register through their class teacher by <strong>12th June 2025</strong>.</p>
        <p><strong>Events Available:</strong></p>
        <ul style="margin:8px 0 8px 18px;">
          <li>100m, 200m, 400m Sprint</li>
          <li>Long Jump & High Jump</li>
          <li>Relay Race (4×100m)</li>
          <li>Shot Put & Discus Throw</li>
          <li>Cricket (Inter-House)</li>
          <li>Badminton (Singles & Doubles)</li>
        </ul>
        <p>Winners will be awarded trophies and certificates. Participation certificates for all participants.</p>
      </div>`,
  },
  {
    id: 6,
    cir_title: 'Uniform & Dress Code Reminder',
    cir_files: 'circular-uniform-reminder',
    category: 'General',
    date: '2025-04-15',
    content: `
      <div style="font-family:sans-serif;line-height:1.7;color:#1e293b;">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#0891b2;">Uniform & Dress Code – Reminder</h2>
        <p>This is a reminder to all students that proper school uniform is mandatory on all working days. Non-compliance will result in disciplinary action.</p>
        <p><strong>Uniform Guidelines:</strong></p>
        <ul style="margin:8px 0 8px 18px;">
          <li>White shirt / sky-blue shirt (as per class)</li>
          <li>Grey trousers / skirt</li>
          <li>Black shoes with white socks</li>
          <li>School tie and belt mandatory for Classes VI and above</li>
          <li>Hair neatly combed; no coloring or fancy haircuts</li>
        </ul>
        <p>Saturday: House T-shirt and track pants are allowed.</p>
      </div>`,
  },
  {
    id: 7,
    cir_title: 'Mid-Term Exam Schedule – 2025',
    cir_files: 'circular-midterm-schedule-2025',
    category: 'Exam',
    date: '2025-06-05',
    content: `
      <div style="font-family:sans-serif;line-height:1.7;color:#1e293b;">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#d97706;">Mid-Term Examination Schedule – 2025</h2>
        <p>Mid-term examinations for all classes (I – XII) will commence from <strong>1st July 2025</strong> as per the schedule below:</p>
        <table style="width:100%;border-collapse:collapse;margin:12px 0;font-size:13px;">
          <tr style="background:#fef3c7;">
            <th style="border:1px solid #fcd34d;padding:6px 10px;text-align:left;">Date</th>
            <th style="border:1px solid #fcd34d;padding:6px 10px;text-align:left;">Class I–V</th>
            <th style="border:1px solid #fcd34d;padding:6px 10px;text-align:left;">Class VI–X</th>
          </tr>
          <tr>
            <td style="border:1px solid #fcd34d;padding:6px 10px;">1st July</td>
            <td style="border:1px solid #fcd34d;padding:6px 10px;">Hindi</td>
            <td style="border:1px solid #fcd34d;padding:6px 10px;">Mathematics</td>
          </tr>
          <tr style="background:#fffbeb;">
            <td style="border:1px solid #fcd34d;padding:6px 10px;">2nd July</td>
            <td style="border:1px solid #fcd34d;padding:6px 10px;">Mathematics</td>
            <td style="border:1px solid #fcd34d;padding:6px 10px;">Science</td>
          </tr>
          <tr>
            <td style="border:1px solid #fcd34d;padding:6px 10px;">3rd July</td>
            <td style="border:1px solid #fcd34d;padding:6px 10px;">English</td>
            <td style="border:1px solid #fcd34d;padding:6px 10px;">Social Studies</td>
          </tr>
          <tr style="background:#fffbeb;">
            <td style="border:1px solid #fcd34d;padding:6px 10px;">4th July</td>
            <td style="border:1px solid #fcd34d;padding:6px 10px;">EVS / Science</td>
            <td style="border:1px solid #fcd34d;padding:6px 10px;">English</td>
          </tr>
        </table>
        <p>Students must bring their admit cards issued by the class teacher.</p>
      </div>`,
  },
  {
    id: 8,
    cir_title: 'Holiday Notice – Eid ul-Adha',
    cir_files: 'circular-holiday-eid-2025',
    category: 'Holiday',
    date: '2025-06-06',
    content: `
      <div style="font-family:sans-serif;line-height:1.7;color:#1e293b;">
        <h2 style="font-size:18px;font-weight:700;margin-bottom:8px;color:#059669;">Public Holiday – Eid ul-Adha 2025</h2>
        <p>The school will remain closed on <strong>7th June 2025 (Saturday)</strong> on account of <strong>Eid ul-Adha</strong>.</p>
        <p>Classes will resume normally from <strong>9th June 2025 (Monday)</strong>.</p>
        <p>Wishing everyone Eid Mubarak! 🌙</p>
      </div>`,
  },
]

// Category color mapping
const CATEGORY_COLORS = {
  Event:   { fg: '#7c3aed', bg: '#ede9fe', dot: 'bg-violet-500' },
  Holiday: { fg: '#059669', bg: '#d1fae5', dot: 'bg-emerald-500' },
  Finance: { fg: '#dc2626', bg: '#fee2e2', dot: 'bg-red-500' },
  Meeting: { fg: '#0891b2', bg: '#cffafe', dot: 'bg-cyan-500' },
  Exam:    { fg: '#d97706', bg: '#fef3c7', dot: 'bg-amber-500' },
  General: { fg: '#1d4ed8', bg: '#dbeafe', dot: 'bg-blue-500' },
}
const catColor = (cat) => CATEGORY_COLORS[cat] || CATEGORY_COLORS.General

const ALL_CATEGORIES = ['All', ...Object.keys(CATEGORY_COLORS)]

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

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

// ─── SCHOOL HEADER BANNER ─────────────────────────────────────────────────────
function SchoolHeader() {
  return (
    <div className="rounded-2xl border border-blue-100 dark:border-[rgba(99,102,241,0.2)] bg-gradient-to-r from-blue-50 via-white to-indigo-50 dark:from-[#1a1f35] dark:via-[#1e2238] dark:to-[#1a1f35] px-6 py-5 text-center shadow-sm">
      <div className="flex items-center justify-center gap-2 mb-1">
        <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <h2 className="text-[16px] sm:text-[18px] font-extrabold text-slate-800 dark:text-slate-100 tracking-tight leading-snug">
          {SCHOOL_INFO.name}
        </h2>
      </div>
      <div className="flex items-center justify-center gap-1.5 text-[12px] text-slate-500 dark:text-slate-400 mb-2">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{SCHOOL_INFO.address}</span>
      </div>
      <p className="mt-1 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400 flex items-center justify-center gap-2">
        <Megaphone className="w-4 h-4" /> Circular Board
      </p>
    </div>
  )
}

// ─── CATEGORY BADGE ───────────────────────────────────────────────────────────
function CategoryBadge({ category }) {
  const { fg, bg } = catColor(category)
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
      style={{ color: fg, background: bg }}
    >
      <Tag className="w-2.5 h-2.5" />
      {category}
    </span>
  )
}

// ─── INLINE PREVIEW PANEL ─────────────────────────────────────────────────────
function PreviewPanel({ circular, onClose }) {
  if (!circular) return null
  return (
    <div className="rounded-2xl border-2 border-blue-200 dark:border-indigo-500/30 bg-white dark:bg-[#1a1f35] shadow-lg overflow-hidden"
      style={{ animation: 'fadeSlide .2s ease' }}>
      <style>{`@keyframes fadeSlide{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Preview Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-blue-50/60 dark:bg-indigo-500/[0.06]">
        <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/15 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 dark:text-slate-100 truncate">{circular.cir_title}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <CategoryBadge category={circular.category} />
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formatDate(circular.date)}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Content */}
      <div
        className="px-5 py-5 text-[13px] overflow-auto max-h-[400px]"
        dangerouslySetInnerHTML={{ __html: circular.content }}
      />

      {/* Footer */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.01]">
        <span className="text-[11px] text-slate-400 dark:text-slate-500">
          Reference: <span className="font-mono font-semibold text-slate-600 dark:text-slate-300">{circular.cir_files}</span>
        </span>
        <button className="flex items-center gap-1.5 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline">
          <Download className="w-3.5 h-3.5" /> Download PDF
        </button>
      </div>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ circular, idx, isActive, onShow }) {
  return (
    <tr
      className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
        ${isActive
          ? 'bg-blue-50/70 dark:bg-indigo-500/[0.07]'
          : 'hover:bg-slate-50/60 dark:hover:bg-white/[0.02]'}`}
    >
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">{idx}</td>

      {/* Circular Title */}
      <td className="px-4 py-3">
        <div className="flex flex-col gap-1">
          <span className={`text-[13px] font-semibold leading-snug ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
            {circular.cir_title}
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <CategoryBadge category={circular.category} />
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formatDate(circular.date)}
            </span>
          </div>
        </div>
      </td>

      {/* Action */}
      <td className="px-4 py-3 text-center w-28">
        <button
          onClick={() => onShow(circular)}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold transition-all active:scale-95
            ${isActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-100 text-slate-700 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-600 dark:hover:text-white'
            }`}
        >
          {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {isActive ? 'Hide' : 'Show'}
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ circular, idx, isActive, onShow }) {
  const { fg, bg, dot } = catColor(circular.category)
  return (
    <div
      className={`rounded-xl border overflow-hidden shadow-sm transition-all
        ${isActive
          ? 'border-blue-300 dark:border-indigo-500/40 ring-2 ring-blue-100 dark:ring-indigo-500/20'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.15)]'
        } bg-white dark:bg-[#1a1f35]`}
    >
      {/* Card header */}
      <div className="flex items-start gap-3 px-4 py-3.5">
        {/* Icon */}
        <div
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: bg }}
        >
          <Bell className="w-5 h-5" style={{ color: fg }} />
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[14px] font-bold leading-snug ${isActive ? 'text-blue-700 dark:text-blue-400' : 'text-slate-800 dark:text-slate-100'}`}>
            {circular.cir_title}
          </p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <CategoryBadge category={circular.category} />
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> {formatDate(circular.date)}
            </span>
          </div>
        </div>

        {/* Show / Hide toggle */}
        <button
          onClick={() => onShow(circular)}
          className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold transition-all active:scale-95
            ${isActive
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
            }`}
        >
          {isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          {isActive ? 'Hide' : 'Show'}
        </button>
      </div>

      {/* Active indicator stripe */}
      {isActive && (
        <div className="h-0.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />
      )}

      {/* Inline preview on mobile */}
      {isActive && (
        <div
          className="border-t border-blue-100 dark:border-indigo-500/20 px-4 py-4 text-[13px] overflow-auto max-h-[360px] bg-blue-50/30 dark:bg-indigo-500/[0.04]"
          dangerouslySetInnerHTML={{ __html: circular.content }}
          style={{ animation: 'fadeSlide .2s ease' }}
        />
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, search, setSearch, category, setCategory }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filter Circulars</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-5">
          {/* Search */}
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search circulars…"
                className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Category filter */}
          <div>
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1.5">Category</label>
            <div className="flex flex-wrap gap-2">
              {ALL_CATEGORIES.map(cat => {
                const active = category === cat
                const { fg, bg } = cat === 'All' ? { fg: '#1d4ed8', bg: '#dbeafe' } : catColor(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="px-3 py-1.5 rounded-full text-[12px] font-semibold border transition-all"
                    style={active
                      ? { background: bg, color: fg, borderColor: fg }
                      : { background: 'transparent', color: '#94a3b8', borderColor: '#e2e8f0' }
                    }
                  >
                    {cat}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]">
          <button onClick={onClose}
            className="w-full py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors">
            Apply Filters
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────
function StatChip({ label, value, color }) {
  const colors = {
    blue:   'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
    green:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
    amber:  'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
    violet: 'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400',
  }
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold ${colors[color]}`}>
      <span className="text-[15px] tabular-nums">{value}</span>
      <span className="font-medium">{label}</span>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ShowCircular() {
  const [search,      setSearch]      = useState('')
  const [category,    setCategory]    = useState('All')
  const [loading,     setLoading]     = useState(false)
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [activeCirc,  setActiveCirc]  = useState(null)  // currently previewed circular
  const [toast,       setToast]       = useState(null)
  const previewRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Show / hide circular (mirrors ASPX LinkButton1_Click) ─────────────────
  const handleShow = useCallback((circular) => {
    if (activeCirc?.id === circular.id) {
      setActiveCirc(null)
      return
    }
    setLoading(true)
    setTimeout(() => {
      setActiveCirc(circular)
      setLoading(false)
      // Smooth scroll to preview on desktop
      if (previewRef.current) {
        previewRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
      showToast(`Showing: ${circular.cir_title}`)
    }, 400)
  }, [activeCirc])

  const handleReset = () => {
    setSearch(''); setCategory('All'); setActiveCirc(null)
  }

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return CIRCULARS.filter(c =>
      (category === 'All' || c.category === category) &&
      (c.cir_title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q))
    )
  }, [search, category])

  // Category counts for chips
  const catCounts = useMemo(() => {
    const counts = {}
    CIRCULARS.forEach(c => { counts[c.category] = (counts[c.category] || 0) + 1 })
    return counts
  }, [])

  const activeFilters = (category !== 'All' ? 1 : 0) + (search ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Circular
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and read all school circulars issued to students and parents.
          </p>
        </div>

        {/* Stat chips — desktop only */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap">
          <StatChip label="Total"   value={CIRCULARS.length}         color="blue"   />
          <StatChip label="Events"  value={catCounts.Event   || 0}   color="violet" />
          <StatChip label="Exams"   value={catCounts.Exam    || 0}   color="amber"  />
          <StatChip label="Holiday" value={catCounts.Holiday || 0}   color="green"  />
        </div>
      </div>

      {/* ── School Header ─────────────────────────────────────────────────── */}
      <SchoolHeader />

      {/* ── DESKTOP Filter Card ──────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search &amp; Filter</span>
          {activeFilters > 0 && (
            <button onClick={handleReset}
              className="flex items-center gap-1.5 text-[12px] text-slate-400 hover:text-rose-500 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>

        <div className="p-5 flex flex-col lg:flex-row gap-4 items-start lg:items-end">
          {/* Search */}
          <div className="flex-1 min-w-0">
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Search Circular</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search by title or category…"
                className="w-full pl-9 pr-8 py-2 text-[13px] rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.25)] outline-none
                  bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-200
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Category pills */}
          <div className="flex-1 min-w-0">
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide block mb-1">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {ALL_CATEGORIES.map(cat => {
                const active = category === cat
                const { fg, bg } = cat === 'All' ? { fg: '#1d4ed8', bg: '#dbeafe' } : catColor(cat)
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all"
                    style={active
                      ? { background: bg, color: fg, borderColor: fg }
                      : { background: 'transparent', color: '#94a3b8', borderColor: '#e2e8f0' }
                    }
                  >
                    {cat} {cat !== 'All' && catCounts[cat] ? `(${catCounts[cat]})` : ''}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {activeFilters > 0 ? `Filters (${activeFilters})` : 'Search & Filter'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilters}</span>
          )}
        </button>
        {activeFilters > 0 && (
          <button onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        search={search}
        setSearch={setSearch}
        category={category}
        setCategory={setCategory}
      />

      {/* ── Loading ──────────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center gap-3 py-10 text-blue-600 dark:text-indigo-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-[14px] font-semibold">Loading circular…</span>
        </div>
      )}

      {/* ── Main Content Card ────────────────────────────────────────────── */}
      {!loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Circular List</span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400">
              {filtered.length} record{filtered.length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Info hint — desktop */}
          <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              Click <strong>Show</strong> on any circular to read it inline. Click again to hide.
            </p>
          </div>

          {/* ── DESKTOP TABLE ── */}
          <div className="hidden md:block overflow-x-auto">
            {filtered.length === 0 ? (
              <EmptyState query={search} />
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                    {['S.No.', 'Circular Title', 'File'].map((h, i) => (
                      <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-12 last:text-center last:w-28">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((circ, i) => (
                    <DesktopRow
                      key={circ.id}
                      circular={circ}
                      idx={i + 1}
                      isActive={activeCirc?.id === circ.id}
                      onShow={handleShow}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* ── DESKTOP INLINE PREVIEW (below table) ── */}
          {activeCirc && (
            <div ref={previewRef} className="hidden md:block px-5 py-5 border-t border-blue-100 dark:border-indigo-500/20 bg-blue-50/20 dark:bg-indigo-500/[0.03]">
              <PreviewPanel circular={activeCirc} onClose={() => setActiveCirc(null)} />
            </div>
          )}

          {/* ── MOBILE CARDS ── */}
          <div className="md:hidden p-4 space-y-3">
            {filtered.length === 0 ? (
              <EmptyState query={search} />
            ) : (
              <>
                <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                  Tap <strong>Show</strong> on a card to read the circular.
                </p>
                {filtered.map((circ, i) => (
                  <MobileCard
                    key={circ.id}
                    circular={circ}
                    idx={i + 1}
                    isActive={activeCirc?.id === circ.id}
                    onShow={handleShow}
                  />
                ))}
              </>
            )}
          </div>

          {/* Table Footer */}
          <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
            <p className="text-[12px] text-slate-400 dark:text-slate-500">
              Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
              <span className="font-semibold text-slate-700 dark:text-slate-300">{CIRCULARS.length}</span> circulars
            </p>
            {(search || category !== 'All') && (
              <button onClick={handleReset}
                className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ query }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <LayoutList className="w-7 h-7 opacity-50" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No circulars found</p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
          {query
            ? <>No results for "<strong>{query}</strong>". Try different keywords.</>
            : 'No circulars match the selected category.'}
        </p>
      </div>
    </div>
  )
}
