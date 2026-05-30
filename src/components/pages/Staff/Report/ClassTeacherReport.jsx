/**
 * ClassTeacherReport.jsx
 * Folder: src/pages/Reports/Registration/ClassTeacherReport.jsx
 *
 * Converts legacy ASPX "Class Teacher Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Class, Name, Faculty Id, Faculty Password
 * Features:
 *  - Session dropdown filter
 *  - Show report button
 *  - Desktop: dense ERP-style table
 *  - Mobile: collapsible cards with expandable details
 *  - Grand total / record count footer
 *  - Toast notifications
 *  - Loading skeleton
 *  - Empty state
 *  - Search/filter
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  SlidersHorizontal, Search, BookOpen,
  Building2, MapPin, ChevronRight,
  GraduationCap, User, Mail, Lock,
  Users, ShieldCheck, Info, KeyRound,
  LayoutGrid, List, EyeOff
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

// Class Teacher dummy data per session
const CLASS_TEACHER_DATA = {
  '2022-23': [
    { class: 'Nursery - A',  name: 'Mrs. Anita Sharma',     user_email: 'anita.sharma@svm.edu',     password: 'Anita@2223'   },
    { class: 'Nursery - B',  name: 'Mrs. Pooja Rani',       user_email: 'pooja.rani@svm.edu',       password: 'Pooja@2223'   },
    { class: 'LKG - A',     name: 'Mrs. Kavita Negi',      user_email: 'kavita.negi@svm.edu',      password: 'Kavita@2223'  },
    { class: 'LKG - B',     name: 'Mrs. Sunita Bisht',     user_email: 'sunita.bisht@svm.edu',     password: 'Sunita@2223'  },
    { class: 'UKG - A',     name: 'Mrs. Rekha Joshi',      user_email: 'rekha.joshi@svm.edu',      password: 'Rekha@2223'   },
    { class: 'UKG - B',     name: 'Mrs. Meena Rawat',      user_email: 'meena.rawat@svm.edu',      password: 'Meena@2223'   },
    { class: 'Class I - A', name: 'Mrs. Geeta Pant',       user_email: 'geeta.pant@svm.edu',       password: 'Geeta@2223'   },
    { class: 'Class I - B', name: 'Mrs. Lata Bhatt',       user_email: 'lata.bhatt@svm.edu',       password: 'Lata@2223'    },
    { class: 'Class II - A',name: 'Mr. Ramesh Dobhal',     user_email: 'ramesh.dobhal@svm.edu',    password: 'Ramesh@2223'  },
    { class: 'Class II - B',name: 'Mrs. Sushma Kukreti',   user_email: 'sushma.kukreti@svm.edu',   password: 'Sushma@2223'  },
    { class: 'Class III - A',name: 'Mr. Vikas Nautiyal',   user_email: 'vikas.nautiyal@svm.edu',   password: 'Vikas@2223'   },
    { class: 'Class IV - A', name: 'Mrs. Nirmala Dimri',   user_email: 'nirmala.dimri@svm.edu',    password: 'Nirmala@2223' },
    { class: 'Class V - A',  name: 'Mr. Suresh Semwal',    user_email: 'suresh.semwal@svm.edu',    password: 'Suresh@2223'  },
    { class: 'Class VI - A', name: 'Mrs. Pushpa Badoni',   user_email: 'pushpa.badoni@svm.edu',    password: 'Pushpa@2223'  },
    { class: 'Class VI - B', name: 'Mr. Dinesh Gairola',   user_email: 'dinesh.gairola@svm.edu',   password: 'Dinesh@2223'  },
    { class: 'Class VII - A',name: 'Mrs. Kamla Ghildiyal', user_email: 'kamla.ghildiyal@svm.edu',  password: 'Kamla@2223'   },
    { class: 'Class VIII - A',name: 'Mr. Harish Panwar',   user_email: 'harish.panwar@svm.edu',    password: 'Harish@2223'  },
    { class: 'Class IX - A', name: 'Mrs. Usha Pokhriyal',  user_email: 'usha.pokhriyal@svm.edu',   password: 'Usha@2223'    },
    { class: 'Class IX - B', name: 'Mr. Deepak Barthwal',  user_email: 'deepak.barthwal@svm.edu',  password: 'Deepak@2223'  },
    { class: 'Class X - A',  name: 'Mrs. Manju Kandwal',   user_email: 'manju.kandwal@svm.edu',    password: 'Manju@2223'   },
    { class: 'Class XI - A', name: 'Mr. Arvind Thapliyal', user_email: 'arvind.thapliyal@svm.edu', password: 'Arvind@2223'  },
    { class: 'Class XI - B', name: 'Mrs. Seema Chamoli',   user_email: 'seema.chamoli@svm.edu',    password: 'Seema@2223'   },
    { class: 'Class XII - A',name: 'Mr. Rajesh Bhandari',  user_email: 'rajesh.bhandari@svm.edu',  password: 'Rajesh@2223'  },
    { class: 'Class XII - B',name: 'Mrs. Neelam Aswal',    user_email: 'neelam.aswal@svm.edu',     password: 'Neelam@2223'  },
  ],
  '2023-24': [
    { class: 'Nursery - A',  name: 'Mrs. Anita Sharma',     user_email: 'anita.sharma@svm.edu',     password: 'Anita@2324'   },
    { class: 'Nursery - B',  name: 'Mrs. Ritu Verma',       user_email: 'ritu.verma@svm.edu',       password: 'Ritu@2324'    },
    { class: 'LKG - A',     name: 'Mrs. Kavita Negi',      user_email: 'kavita.negi@svm.edu',      password: 'Kavita@2324'  },
    { class: 'LKG - B',     name: 'Mrs. Sangeeta Raturi',  user_email: 'sangeeta.raturi@svm.edu',  password: 'Sangeeta@2324'},
    { class: 'UKG - A',     name: 'Mrs. Rekha Joshi',      user_email: 'rekha.joshi@svm.edu',      password: 'Rekha@2324'   },
    { class: 'UKG - B',     name: 'Mrs. Meena Rawat',      user_email: 'meena.rawat@svm.edu',      password: 'Meena@2324'   },
    { class: 'Class I - A', name: 'Mrs. Geeta Pant',       user_email: 'geeta.pant@svm.edu',       password: 'Geeta@2324'   },
    { class: 'Class I - B', name: 'Mr. Mohan Singh',       user_email: 'mohan.singh@svm.edu',      password: 'Mohan@2324'   },
    { class: 'Class II - A',name: 'Mr. Ramesh Dobhal',     user_email: 'ramesh.dobhal@svm.edu',    password: 'Ramesh@2324'  },
    { class: 'Class II - B',name: 'Mrs. Priya Juyal',      user_email: 'priya.juyal@svm.edu',      password: 'Priya@2324'   },
    { class: 'Class III - A',name: 'Mr. Vikas Nautiyal',   user_email: 'vikas.nautiyal@svm.edu',   password: 'Vikas@2324'   },
    { class: 'Class IV - A', name: 'Mrs. Nirmala Dimri',   user_email: 'nirmala.dimri@svm.edu',    password: 'Nirmala@2324' },
    { class: 'Class V - A',  name: 'Mr. Suresh Semwal',    user_email: 'suresh.semwal@svm.edu',    password: 'Suresh@2324'  },
    { class: 'Class VI - A', name: 'Mrs. Pushpa Badoni',   user_email: 'pushpa.badoni@svm.edu',    password: 'Pushpa@2324'  },
    { class: 'Class VI - B', name: 'Mr. Anil Chamoli',     user_email: 'anil.chamoli@svm.edu',     password: 'Anil@2324'    },
    { class: 'Class VII - A',name: 'Mrs. Kamla Ghildiyal', user_email: 'kamla.ghildiyal@svm.edu',  password: 'Kamla@2324'   },
    { class: 'Class VIII - A',name: 'Mr. Harish Panwar',   user_email: 'harish.panwar@svm.edu',    password: 'Harish@2324'  },
    { class: 'Class IX - A', name: 'Mrs. Usha Pokhriyal',  user_email: 'usha.pokhriyal@svm.edu',   password: 'Usha@2324'    },
    { class: 'Class IX - B', name: 'Mr. Kuldeep Rawat',    user_email: 'kuldeep.rawat@svm.edu',    password: 'Kuldeep@2324' },
    { class: 'Class X - A',  name: 'Mrs. Manju Kandwal',   user_email: 'manju.kandwal@svm.edu',    password: 'Manju@2324'   },
    { class: 'Class XI - A', name: 'Mr. Arvind Thapliyal', user_email: 'arvind.thapliyal@svm.edu', password: 'Arvind@2324'  },
    { class: 'Class XI - B', name: 'Mrs. Seema Chamoli',   user_email: 'seema.chamoli@svm.edu',    password: 'Seema@2324'   },
    { class: 'Class XII - A',name: 'Mr. Rajesh Bhandari',  user_email: 'rajesh.bhandari@svm.edu',  password: 'Rajesh@2324'  },
    { class: 'Class XII - B',name: 'Dr. Vinod Uniyal',     user_email: 'vinod.uniyal@svm.edu',     password: 'Vinod@2324'   },
  ],
  '2024-25': [
    { class: 'Nursery - A',  name: 'Mrs. Anita Sharma',     user_email: 'anita.sharma@svm.edu',     password: 'Anita@2425'   },
    { class: 'Nursery - B',  name: 'Mrs. Ritu Verma',       user_email: 'ritu.verma@svm.edu',       password: 'Ritu@2425'    },
    { class: 'LKG - A',     name: 'Mrs. Kavita Negi',      user_email: 'kavita.negi@svm.edu',      password: 'Kavita@2425'  },
    { class: 'LKG - B',     name: 'Mrs. Sangeeta Raturi',  user_email: 'sangeeta.raturi@svm.edu',  password: 'Sangeeta@2425'},
    { class: 'UKG - A',     name: 'Mrs. Rekha Joshi',      user_email: 'rekha.joshi@svm.edu',      password: 'Rekha@2425'   },
    { class: 'UKG - B',     name: 'Mr. Pramod Gusain',     user_email: 'pramod.gusain@svm.edu',    password: 'Pramod@2425'  },
    { class: 'Class I - A', name: 'Mrs. Geeta Pant',       user_email: 'geeta.pant@svm.edu',       password: 'Geeta@2425'   },
    { class: 'Class I - B', name: 'Mr. Mohan Singh',       user_email: 'mohan.singh@svm.edu',      password: 'Mohan@2425'   },
    { class: 'Class II - A',name: 'Mr. Ramesh Dobhal',     user_email: 'ramesh.dobhal@svm.edu',    password: 'Ramesh@2425'  },
    { class: 'Class II - B',name: 'Mrs. Priya Juyal',      user_email: 'priya.juyal@svm.edu',      password: 'Priya@2425'   },
    { class: 'Class III - A',name: 'Mr. Vikas Nautiyal',   user_email: 'vikas.nautiyal@svm.edu',   password: 'Vikas@2425'   },
    { class: 'Class IV - A', name: 'Mrs. Nirmala Dimri',   user_email: 'nirmala.dimri@svm.edu',    password: 'Nirmala@2425' },
    { class: 'Class V - A',  name: 'Mr. Suresh Semwal',    user_email: 'suresh.semwal@svm.edu',    password: 'Suresh@2425'  },
    { class: 'Class VI - A', name: 'Mrs. Pushpa Badoni',   user_email: 'pushpa.badoni@svm.edu',    password: 'Pushpa@2425'  },
    { class: 'Class VI - B', name: 'Mr. Anil Chamoli',     user_email: 'anil.chamoli@svm.edu',     password: 'Anil@2425'    },
    { class: 'Class VII - A',name: 'Mrs. Kamla Ghildiyal', user_email: 'kamla.ghildiyal@svm.edu',  password: 'Kamla@2425'   },
    { class: 'Class VIII - A',name: 'Mr. Harish Panwar',   user_email: 'harish.panwar@svm.edu',    password: 'Harish@2425'  },
    { class: 'Class IX - A', name: 'Mrs. Usha Pokhriyal',  user_email: 'usha.pokhriyal@svm.edu',   password: 'Usha@2425'    },
    { class: 'Class IX - B', name: 'Mr. Kuldeep Rawat',    user_email: 'kuldeep.rawat@svm.edu',    password: 'Kuldeep@2425' },
    { class: 'Class X - A',  name: 'Mrs. Manju Kandwal',   user_email: 'manju.kandwal@svm.edu',    password: 'Manju@2425'   },
    { class: 'Class XI - A', name: 'Mr. Arvind Thapliyal', user_email: 'arvind.thapliyal@svm.edu', password: 'Arvind@2425'  },
    { class: 'Class XI - B', name: 'Mrs. Seema Chamoli',   user_email: 'seema.chamoli@svm.edu',    password: 'Seema@2425'   },
    { class: 'Class XII - A',name: 'Mr. Rajesh Bhandari',  user_email: 'rajesh.bhandari@svm.edu',  password: 'Rajesh@2425'  },
    { class: 'Class XII - B',name: 'Dr. Vinod Uniyal',     user_email: 'vinod.uniyal@svm.edu',     password: 'Vinod@2425'   },
  ],
  '2025-26': [
    { class: 'Nursery - A',  name: 'Mrs. Anita Sharma',     user_email: 'anita.sharma@svm.edu',     password: 'Anita@2526'   },
    { class: 'Nursery - B',  name: 'Mrs. Ritu Verma',       user_email: 'ritu.verma@svm.edu',       password: 'Ritu@2526'    },
    { class: 'LKG - A',     name: 'Mrs. Kavita Negi',      user_email: 'kavita.negi@svm.edu',      password: 'Kavita@2526'  },
    { class: 'LKG - B',     name: 'Mrs. Sangeeta Raturi',  user_email: 'sangeeta.raturi@svm.edu',  password: 'Sangeeta@2526'},
    { class: 'UKG - A',     name: 'Mrs. Rekha Joshi',      user_email: 'rekha.joshi@svm.edu',      password: 'Rekha@2526'   },
    { class: 'UKG - B',     name: 'Mr. Pramod Gusain',     user_email: 'pramod.gusain@svm.edu',    password: 'Pramod@2526'  },
    { class: 'Class I - A', name: 'Mrs. Geeta Pant',       user_email: 'geeta.pant@svm.edu',       password: 'Geeta@2526'   },
    { class: 'Class I - B', name: 'Mr. Mohan Singh',       user_email: 'mohan.singh@svm.edu',      password: 'Mohan@2526'   },
    { class: 'Class II - A',name: 'Mr. Ramesh Dobhal',     user_email: 'ramesh.dobhal@svm.edu',    password: 'Ramesh@2526'  },
    { class: 'Class II - B',name: 'Mrs. Priya Juyal',      user_email: 'priya.juyal@svm.edu',      password: 'Priya@2526'   },
    { class: 'Class III - A',name: 'Mr. Vikas Nautiyal',   user_email: 'vikas.nautiyal@svm.edu',   password: 'Vikas@2526'   },
    { class: 'Class IV - A', name: 'Mrs. Nirmala Dimri',   user_email: 'nirmala.dimri@svm.edu',    password: 'Nirmala@2526' },
    { class: 'Class V - A',  name: 'Mr. Suresh Semwal',    user_email: 'suresh.semwal@svm.edu',    password: 'Suresh@2526'  },
    { class: 'Class VI - A', name: 'Mrs. Pushpa Badoni',   user_email: 'pushpa.badoni@svm.edu',    password: 'Pushpa@2526'  },
    { class: 'Class VI - B', name: 'Mr. Anil Chamoli',     user_email: 'anil.chamoli@svm.edu',     password: 'Anil@2526'    },
    { class: 'Class VII - A',name: 'Mrs. Kamla Ghildiyal', user_email: 'kamla.ghildiyal@svm.edu',  password: 'Kamla@2526'   },
    { class: 'Class VIII - A',name: 'Mr. Harish Panwar',   user_email: 'harish.panwar@svm.edu',    password: 'Harish@2526'  },
    { class: 'Class IX - A', name: 'Mrs. Usha Pokhriyal',  user_email: 'usha.pokhriyal@svm.edu',   password: 'Usha@2526'    },
    { class: 'Class IX - B', name: 'Mr. Kuldeep Rawat',    user_email: 'kuldeep.rawat@svm.edu',    password: 'Kuldeep@2526' },
    { class: 'Class X - A',  name: 'Mrs. Manju Kandwal',   user_email: 'manju.kandwal@svm.edu',    password: 'Manju@2526'   },
    { class: 'Class XI - A', name: 'Mr. Arvind Thapliyal', user_email: 'arvind.thapliyal@svm.edu', password: 'Arvind@2526'  },
    { class: 'Class XI - B', name: 'Mrs. Seema Chamoli',   user_email: 'seema.chamoli@svm.edu',    password: 'Seema@2526'   },
    { class: 'Class XII - A',name: 'Mr. Rajesh Bhandari',  user_email: 'rajesh.bhandari@svm.edu',  password: 'Rajesh@2526'  },
    { class: 'Class XII - B',name: 'Dr. Vinod Uniyal',     user_email: 'vinod.uniyal@svm.edu',     password: 'Vinod@2526'   },
  ],
}

// ─── COLOR HELPERS ─────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
  { fg: '#7e22ce', bg: '#f3e8ff' },
]

const avatarColor = (name = '') =>
  AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]

const getInitials = (name = '') =>
  name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

// ─── PRIMITIVE COMPONENTS ──────────────────────────────────────────────────────

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

// ─── SCHOOL HEADER BANNER ──────────────────────────────────────────────────────
function SchoolHeader({ session }) {
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
      <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
        <span className="text-[12px] font-bold text-amber-700 dark:text-amber-400">Session: {session}</span>
      </div>
      <p className="mt-2 text-[13px] font-bold uppercase tracking-widest text-blue-700 dark:text-indigo-400">
        Class Teacher Report
      </p>
    </div>
  )
}

// ─── SUMMARY STAT CARD ─────────────────────────────────────────────────────────
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

// ─── PASSWORD CELL (masked by default, reveal on hover/tap) ───────────────────
function PasswordCell({ password }) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="flex items-center gap-1.5 justify-center">
      <span className={`text-[12px] font-mono tabular-nums transition-all
        ${visible ? 'text-slate-700 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600 tracking-[3px]'}`}>
        {visible ? password : '••••••••'}
      </span>
      <button
        onClick={() => setVisible(v => !v)}
        title={visible ? 'Hide password' : 'Show password'}
        className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        {visible
          ? <EyeOff className="w-3.5 h-3.5" />
          : <Eye className="w-3.5 h-3.5" />}
      </button>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ─────────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = avatarColor(row.name)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-12">
        {idx}
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-bold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 whitespace-nowrap">
          <GraduationCap className="w-3.5 h-3.5 flex-shrink-0" />
          {row.class}
        </span>
      </td>

      {/* Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold select-none"
            style={{ background: bg, color: fg }}
          >
            {getInitials(row.name)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
            {row.name}
          </span>
        </div>
      </td>

      {/* Faculty ID */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span className="text-[12px] text-slate-600 dark:text-slate-300 font-mono">{row.user_email}</span>
        </div>
      </td>

      {/* Password */}
      <td className="px-4 py-3">
        <PasswordCell password={row.password} />
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ───────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = avatarColor(row.name)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold select-none"
          style={{ background: bg, color: fg }}
        >
          {getInitials(row.name)}
        </span>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.name}</p>
          <span className="inline-flex items-center gap-1 mt-0.5 px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
            <GraduationCap className="w-3 h-3" />
            {row.class}
          </span>
        </div>

        {/* S.No badge */}
        <div className="flex flex-col items-end flex-shrink-0">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">#{idx}</span>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">

          {/* Faculty ID */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
            <div className="flex items-center gap-2 mb-1">
              <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Faculty ID</span>
            </div>
            <p className="text-[13px] font-mono text-slate-700 dark:text-slate-200 break-all">{row.user_email}</p>
          </div>

          {/* Password */}
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-[rgba(99,102,241,0.1)] p-3">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">Password</span>
            </div>
            <PasswordCell password={row.password} />
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ──────────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, onShow, loading, errors }) {
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
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Select Session</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5">
          <Field label="Academic Session" error={errors.session} required>
            <NativeSelect
              value={session}
              onChange={e => setSession(e.target.value)}
              placeholder="-- Select Session --"
              error={errors.session}
            >
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
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

// ─── LOADING SKELETON ──────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
      <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
          style={{ opacity: 1 - i * 0.12 }} />
      ))}
    </div>
  )
}

// ─── EMPTY STATE ───────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <Users className="w-7 h-7 opacity-50" />
      </div>
      <div className="text-center">
        <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
        <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
          Select an academic session and click <strong>Show</strong> to generate the class teacher report.
        </p>
      </div>
    </div>
  )
}

// ─── MAIN COMPONENT ────────────────────────────────────────────────────────────
export default function ClassTeacherReport() {
  const [session,      setSession]      = useState('')
  const [rows,         setRows]         = useState([])
  const [loading,      setLoading]      = useState(false)
  const [filterOpen,   setFilterOpen]   = useState(false)
  const [search,       setSearch]       = useState('')
  const [errors,       setErrors]       = useState({})
  const [toast,        setToast]        = useState(null)
  const [shown,        setShown]        = useState(false)
  const [shownSession, setShownSession] = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Fetch report (simulated API call) ──────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    // Simulate API latency
    setTimeout(() => {
      const data = CLASS_TEACHER_DATA[session] || []
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} class teacher records for session ${session}.`)
    }, 650)
  }, [session])

  const handleReset = () => {
    setSession('')
    setRows([])
    setSearch('')
    setErrors({})
    setShown(false)
    setShownSession('')
  }

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.class.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.user_email.toLowerCase().includes(q)
    )
  }, [rows, search])

  const hasResults   = shown && rows.length > 0
  const activeFilters = session ? 1 : 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Class Teacher Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Class-wise assigned teachers with login credentials.
          </p>
        </div>

        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500">
          <span className="hover:text-blue-600 cursor-pointer transition-colors">Home</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-slate-600 dark:text-slate-300 font-semibold">Class Teacher Report</span>
        </nav>
      </div>

      {/* ── DESKTOP Filter Card ───────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 items-end">
            <Field label="Academic Session" error={errors.session} required>
              <NativeSelect
                value={session}
                onChange={e => { setSession(e.target.value); setErrors(p => ({ ...p, session: undefined })) }}
                placeholder="-- Select Session --"
                error={errors.session}
              >
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Spacers */}
            <div />
            <div />

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleShow}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[13px] font-semibold text-white
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                  transition-all active:scale-95 disabled:opacity-70"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                Show
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                  bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                title="Reset"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button
          type="button"
          onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20"
        >
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `Session: ${session}` : 'Select Session'}
          {activeFilters > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {activeFilters}
            </span>
          )}
        </button>
        {hasResults && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
            title="Reset"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      <FilterDrawer
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        session={session}
        setSession={setSession}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ───────────────────────────────────────────────────── */}
      {loading && <LoadingSkeleton />}

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header Banner */}
          <SchoolHeader session={shownSession} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            <SummaryCard icon={Users}       label="Total Teachers"   value={filtered.length} color="blue"    />
            <SummaryCard icon={GraduationCap} label="Classes Assigned" value={filtered.length} color="emerald" />
          </div>

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Class Teacher Assignments</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {shownSession}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-60 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search class, name or email…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                    bg-white text-slate-700 border-slate-200 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                    dark:placeholder-slate-600 dark:focus:border-indigo-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Info hint */}
            <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
              <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <p className="text-[12px] text-blue-700 dark:text-blue-400">
                Click the <EyeOff className="w-3 h-3 inline mx-0.5" /> eye icon to reveal/hide faculty passwords.
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
                      {['S.No.', 'Class', 'Name', 'Faculty Id', 'Faculty Password'].map((h, i) => (
                        <th
                          key={i}
                          className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-12"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={`${row.class}-${row.user_email}`} row={row} idx={i + 1} />
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
                    Tap a card to see faculty ID and password.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={`${row.class}-${row.user_email}`} row={row} idx={i + 1} />
                  ))}
                </>
              )}
            </div>

            {/* Table Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────────── */}
      {!hasResults && !loading && <EmptyState />}

      {/* Toast notification */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
