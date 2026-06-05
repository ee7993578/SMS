/**
 * TransportPrivateStudentsReport.jsx
 * Folder: src/pages/Reports/FEE/TransportPrivateStudentsReport.jsx
 *
 * Converts legacy ASPX "Private Students Report" to fully-responsive React + Tailwind.
 *
 * Columns: S.No, Adm No., Student Name, Father Name, Class Name, Mobile No., Address
 * Features:
 *  - Session dropdown
 *  - Multi-select class filter (checkbox list, mobile drawer)
 *  - Show report button + Excel export
 *  - School name / address / session header in report
 *  - Mobile: collapsible cards with expandable details
 *  - Desktop: dense ERP-style table
 *  - Search by name / adm no / class
 *  - Loading skeleton + empty state
 *  - Toast notifications
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye,
  AlertCircle, X, Check, Loader2, ChevronDown,
  Users, Search, SlidersHorizontal,
  FileSpreadsheet, BookOpen,
  Building2, MapPin, Phone, Home,
  UserSquare2, ChevronRight, GraduationCap,
  Bus, BadgeCheck, Info, TrendingUp,
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ─────────────────────────────────────────────────────
const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII',
  'Class IX', 'Class X', 'Class XI', 'Class XII',
]

const SCHOOL_INFO = {
  name: 'Saraswati Vidya Mandir Senior Secondary School',
  address: 'Civil Lines, Dehradun, Uttarakhand – 248001',
}

const PRIVATE_STUDENTS_DATA = {
  '2022-23': [
    { registration_no: 'ADM-22001', stu_name: 'Aarav Sharma',      father_name: 'Ramesh Sharma',      class_name: 'Class I',    mobile: '9876543210', address: '12, Rajpur Road, Dehradun' },
    { registration_no: 'ADM-22002', stu_name: 'Priya Negi',         father_name: 'Suresh Negi',         class_name: 'Class I',    mobile: '9812345678', address: '45, Saharanpur Road, Dehradun' },
    { registration_no: 'ADM-22003', stu_name: 'Rohit Bisht',        father_name: 'Mohan Bisht',         class_name: 'Class II',   mobile: '9988776655', address: '7, Gandhi Nagar, Dehradun' },
    { registration_no: 'ADM-22004', stu_name: 'Kavya Rawat',        father_name: 'Dinesh Rawat',        class_name: 'Class III',  mobile: '9123456789', address: '89, Jakhan, Dehradun' },
    { registration_no: 'ADM-22005', stu_name: 'Vivek Joshi',        father_name: 'Anil Joshi',          class_name: 'Class IV',   mobile: '9654321098', address: '3, Ballupur, Dehradun' },
    { registration_no: 'ADM-22006', stu_name: 'Sneha Thapa',        father_name: 'Krishna Thapa',       class_name: 'Class V',    mobile: '9765432109', address: '56, Haridwar Road, Dehradun' },
    { registration_no: 'ADM-22007', stu_name: 'Arjun Pant',         father_name: 'Vijay Pant',          class_name: 'Class VI',   mobile: '9845671234', address: '22, Patel Nagar, Dehradun' },
    { registration_no: 'ADM-22008', stu_name: 'Mansi Bora',         father_name: 'Harish Bora',         class_name: 'Class VI',   mobile: '9901234567', address: '11, Race Course, Dehradun' },
    { registration_no: 'ADM-22009', stu_name: 'Siddharth Chauhan',  father_name: 'Rakesh Chauhan',      class_name: 'Class VII',  mobile: '9771234567', address: '34, EC Road, Dehradun' },
    { registration_no: 'ADM-22010', stu_name: 'Ananya Singh',       father_name: 'Sanjay Singh',        class_name: 'Class VIII', mobile: '9567891234', address: '67, Karanpur, Dehradun' },
    { registration_no: 'ADM-22011', stu_name: 'Karan Mehta',        father_name: 'Sunil Mehta',         class_name: 'Class IX',   mobile: '9012345678', address: '90, Niranjanpur, Dehradun' },
    { registration_no: 'ADM-22012', stu_name: 'Riya Verma',         father_name: 'Manoj Verma',         class_name: 'Class IX',   mobile: '9234567890', address: '14, Indira Nagar, Dehradun' },
    { registration_no: 'ADM-22013', stu_name: 'Tanuj Kapoor',       father_name: 'Deepak Kapoor',       class_name: 'Class X',    mobile: '9345678901', address: '28, Raipur Road, Dehradun' },
    { registration_no: 'ADM-22014', stu_name: 'Pooja Arora',        father_name: 'Arun Arora',          class_name: 'Class XI',   mobile: '9456789012', address: '55, Kedarpur, Dehradun' },
    { registration_no: 'ADM-22015', stu_name: 'Nikhil Upadhyay',   father_name: 'Govind Upadhyay',    class_name: 'Class XII',  mobile: '9567890123', address: '18, Shimla Bypass, Dehradun' },
  ],
  '2023-24': [
    { registration_no: 'ADM-23001', stu_name: 'Ishaan Dobhal',      father_name: 'Pradeep Dobhal',      class_name: 'Nursery',    mobile: '9670123456', address: '5, Turner Road, Dehradun' },
    { registration_no: 'ADM-23002', stu_name: 'Diya Mathur',        father_name: 'Ajay Mathur',         class_name: 'LKG',        mobile: '9781234567', address: '38, Convent Road, Dehradun' },
    { registration_no: 'ADM-23003', stu_name: 'Krish Goyal',        father_name: 'Vinod Goyal',         class_name: 'UKG',        mobile: '9892345678', address: '72, Dalanwala, Dehradun' },
    { registration_no: 'ADM-23004', stu_name: 'Naina Saxena',       father_name: 'Rajiv Saxena',        class_name: 'Class II',   mobile: '9003456789', address: '29, Araghar, Dehradun' },
    { registration_no: 'ADM-23005', stu_name: 'Rehan Ansari',       father_name: 'Salim Ansari',        class_name: 'Class III',  mobile: '9114567890', address: '44, Prempur, Dehradun' },
    { registration_no: 'ADM-23006', stu_name: 'Shreya Garg',        father_name: 'Ramesh Garg',         class_name: 'Class IV',   mobile: '9225678901', address: '61, Dharampur, Dehradun' },
    { registration_no: 'ADM-23007', stu_name: 'Aditya Bhatt',       father_name: 'Umesh Bhatt',         class_name: 'Class V',    mobile: '9336789012', address: '16, Vasant Vihar, Dehradun' },
    { registration_no: 'ADM-23008', stu_name: 'Pallavi Rana',       father_name: 'Narendra Rana',       class_name: 'Class VII',  mobile: '9447890123', address: '83, Canal Road, Dehradun' },
    { registration_no: 'ADM-23009', stu_name: 'Gaurav Tiwari',      father_name: 'Alok Tiwari',         class_name: 'Class VIII', mobile: '9558901234', address: '21, Sewla Kalan, Dehradun' },
    { registration_no: 'ADM-23010', stu_name: 'Simran Kaur',        father_name: 'Gurpreet Singh',      class_name: 'Class X',    mobile: '9669012345', address: '9, Kishanpur, Dehradun' },
    { registration_no: 'ADM-23011', stu_name: 'Varun Aggarwal',     father_name: 'Pawan Aggarwal',      class_name: 'Class XI',   mobile: '9770123456', address: '47, Nathanpur, Dehradun' },
    { registration_no: 'ADM-23012', stu_name: 'Megha Pilkhan',      father_name: 'Satish Pilkhan',      class_name: 'Class XII',  mobile: '9881234567', address: '33, Saketpuri, Dehradun' },
  ],
  '2024-25': [
    { registration_no: 'ADM-24001', stu_name: 'Aadhya Trivedi',     father_name: 'Ashish Trivedi',      class_name: 'Nursery',    mobile: '9992345678', address: '6, Bakralwala, Dehradun' },
    { registration_no: 'ADM-24002', stu_name: 'Yash Khanduri',      father_name: 'Lalit Khanduri',      class_name: 'LKG',        mobile: '9003456780', address: '53, Hathibarkala, Dehradun' },
    { registration_no: 'ADM-24003', stu_name: 'Trisha Bansal',      father_name: 'Sanjiv Bansal',       class_name: 'UKG',        mobile: '9114567891', address: '77, Jakhan Estate, Dehradun' },
    { registration_no: 'ADM-24004', stu_name: 'Arnav Purohit',      father_name: 'Mahesh Purohit',      class_name: 'Class I',    mobile: '9225678902', address: '24, Shimla Road, Dehradun' },
    { registration_no: 'ADM-24005', stu_name: 'Lakshmi Nautiyal',   father_name: 'Dhan Nautiyal',       class_name: 'Class III',  mobile: '9336789013', address: '39, Dharampur Danda, Dehradun' },
    { registration_no: 'ADM-24006', stu_name: 'Devansh Bhardwaj',   father_name: 'Kamal Bhardwaj',      class_name: 'Class IV',   mobile: '9447890124', address: '15, Old Survey Road, Dehradun' },
    { registration_no: 'ADM-24007', stu_name: 'Harshita Semwal',    father_name: 'Yogesh Semwal',       class_name: 'Class V',    mobile: '9558901235', address: '88, Majra, Dehradun' },
    { registration_no: 'ADM-24008', stu_name: 'Rishab Gusain',      father_name: 'Bhupesh Gusain',      class_name: 'Class VI',   mobile: '9669012346', address: '42, Mothrowala Road, Dehradun' },
    { registration_no: 'ADM-24009', stu_name: 'Sakshi Mamgain',     father_name: 'Praveen Mamgain',     class_name: 'Class VIII', mobile: '9770123457', address: '11, Chander Nagar, Dehradun' },
    { registration_no: 'ADM-24010', stu_name: 'Amanpreet Dhaliwal', father_name: 'Jaswant Dhaliwal',    class_name: 'Class IX',   mobile: '9881234568', address: '65, Rajpur Road Upper, Dehradun' },
    { registration_no: 'ADM-24011', stu_name: 'Nilufar Rashid',     father_name: 'Abdul Rashid',        class_name: 'Class X',    mobile: '9992345679', address: '30, Aamwala Tarla, Dehradun' },
    { registration_no: 'ADM-24012', stu_name: 'Sumit Lohani',       father_name: 'Prem Lohani',         class_name: 'Class XI',   mobile: '9003456781', address: '57, Badripur, Dehradun' },
    { registration_no: 'ADM-24013', stu_name: 'Roshni Chamoli',     father_name: 'Girish Chamoli',      class_name: 'Class XII',  mobile: '9114567892', address: '19, Pondha, Dehradun' },
  ],
  '2025-26': [
    { registration_no: 'ADM-25001', stu_name: 'Vivaan Malhotra',    father_name: 'Vikas Malhotra',      class_name: 'Nursery',    mobile: '9225678903', address: '8, Doon Vihar, Dehradun' },
    { registration_no: 'ADM-25002', stu_name: 'Kyara Pandey',       father_name: 'Neeraj Pandey',       class_name: 'LKG',        mobile: '9336789014', address: '46, Vijay Colony, Dehradun' },
    { registration_no: 'ADM-25003', stu_name: 'Aayan Khan',         father_name: 'Irshad Khan',         class_name: 'UKG',        mobile: '9447890125', address: '73, Subhash Nagar, Dehradun' },
    { registration_no: 'ADM-25004', stu_name: 'Tanishka Riyal',     father_name: 'Bipin Riyal',         class_name: 'Class II',   mobile: '9558901236', address: '31, Kaulagarh Road, Dehradun' },
    { registration_no: 'ADM-25005', stu_name: 'Parth Dimri',        father_name: 'Vinay Dimri',         class_name: 'Class IV',   mobile: '9669012347', address: '64, Chakrata Road, Dehradun' },
    { registration_no: 'ADM-25006', stu_name: 'Manya Kala',         father_name: 'Suresh Kala',         class_name: 'Class V',    mobile: '9770123458', address: '20, Govindgarh, Dehradun' },
    { registration_no: 'ADM-25007', stu_name: 'Priyanshu Juyal',    father_name: 'Devendra Juyal',      class_name: 'Class VI',   mobile: '9881234569', address: '85, Tarla Nagal, Dehradun' },
    { registration_no: 'ADM-25008', stu_name: 'Anushka Butola',     father_name: 'Charan Butola',       class_name: 'Class VII',  mobile: '9992345680', address: '37, Sewla Khurd, Dehradun' },
    { registration_no: 'ADM-25009', stu_name: 'Ritesh Kandwal',     father_name: 'Gopal Kandwal',       class_name: 'Class VIII', mobile: '9003456782', address: '52, Ajabpur, Dehradun' },
    { registration_no: 'ADM-25010', stu_name: 'Harini Bhandari',    father_name: 'Shyam Bhandari',      class_name: 'Class IX',   mobile: '9114567893', address: '14, Bhagirathipuram, Dehradun' },
    { registration_no: 'ADM-25011', stu_name: 'Omkar Sati',         father_name: 'Ramendra Sati',       class_name: 'Class X',    mobile: '9225678904', address: '68, Kanwali, Dehradun' },
    { registration_no: 'ADM-25012', stu_name: 'Zara Hussain',       father_name: 'Mohsin Hussain',      class_name: 'Class XI',   mobile: '9336789015', address: '41, Balliwala, Dehradun' },
    { registration_no: 'ADM-25013', stu_name: 'Advait Sharma',      father_name: 'Lalit Sharma',        class_name: 'Class XII',  mobile: '9447890126', address: '27, Raipur Khal, Dehradun' },
    { registration_no: 'ADM-25014', stu_name: 'Ruchika Belwal',     father_name: 'Mukesh Belwal',       class_name: 'Class XII',  mobile: '9558901237', address: '93, Rajpur Village, Dehradun' },
  ],
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────
const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' },
  { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' },
  { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' },
  { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (name = '') => CLASS_COLORS[(name.charCodeAt(0) ?? 0) % CLASS_COLORS.length]
const formatAbbr = (name = '') => name.replace('Class ', '').slice(0, 3).toUpperCase()

// Get unique classes from data for a session
const getSessionClasses = (session) => {
  if (!session || !PRIVATE_STUDENTS_DATA[session]) return []
  return [...new Set(PRIVATE_STUDENTS_DATA[session].map(r => r.class_name))]
}

// ─── PRIMITIVE COMPONENTS ────────────────────────────────────────────────────
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
            : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
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

// ─── MULTI-SELECT CLASS DROPDOWN (Desktop) ───────────────────────────────────
function ClassMultiSelect({ availableClasses, selected, onChange, error }) {
  const [open, setOpen] = useState(false)
  const allSelected = selected.length === availableClasses.length && availableClasses.length > 0

  const toggleClass = (cls) => {
    if (selected.includes(cls)) {
      onChange(selected.filter(c => c !== cls))
    } else {
      onChange([...selected, cls])
    }
  }
  const toggleAll = () => {
    if (allSelected) onChange([])
    else onChange([...availableClasses])
  }

  const displayText = selected.length === 0
    ? 'All Classes'
    : selected.length === availableClasses.length
      ? 'All Classes Selected'
      : selected.length === 1
        ? selected[0]
        : `${selected.length} Classes Selected`

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        disabled={availableClasses.length === 0}
        className={`w-full flex items-center justify-between pl-3 pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer text-left
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${open ? 'border-blue-400 ring-2 ring-blue-100 dark:border-indigo-400' : ''}`}
      >
        <span className={selected.length > 0 ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-400 dark:text-slate-500'}>
          {displayText}
        </span>
        {selected.length > 0 && (
          <span className="bg-blue-100 dark:bg-indigo-500/20 text-blue-700 dark:text-indigo-300 text-[10px] font-bold px-1.5 py-0.5 rounded-full mr-1 flex-shrink-0">
            {selected.length}
          </span>
        )}
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && availableClasses.length > 0 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full mt-1 z-20 bg-white dark:bg-[#1e2238] border border-slate-200 dark:border-[rgba(99,102,241,0.25)] rounded-xl shadow-xl overflow-hidden max-h-60 flex flex-col">
            {/* Select All */}
            <button
              type="button"
              onClick={toggleAll}
              className="flex items-center gap-2.5 px-3 py-2.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors sticky top-0 bg-white dark:bg-[#1e2238]"
            >
              <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                ${allSelected ? 'bg-blue-600 dark:bg-indigo-600 border-blue-600 dark:border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}>
                {allSelected && <Check className="w-2.5 h-2.5 text-white" />}
              </span>
              <span className="text-[12px] font-bold text-slate-700 dark:text-slate-200">Select All</span>
            </button>
            {/* Class list */}
            <div className="overflow-y-auto flex-1">
              {availableClasses.map(cls => {
                const checked = selected.includes(cls)
                const { fg, bg } = classColor(cls)
                return (
                  <button
                    type="button"
                    key={cls}
                    onClick={() => toggleClass(cls)}
                    className="flex items-center gap-2.5 w-full px-3 py-2 hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors text-left"
                  >
                    <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors
                      ${checked ? 'bg-blue-600 dark:bg-indigo-600 border-blue-600 dark:border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}>
                      {checked && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    <span className="w-6 h-6 rounded-md flex-shrink-0 flex items-center justify-center text-[9px] font-bold" style={{ background: bg, color: fg }}>
                      {formatAbbr(cls)}
                    </span>
                    <span className="text-[12px] text-slate-700 dark:text-slate-200">{cls}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ─── SUMMARY STAT CARD ───────────────────────────────────────────────────────
function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    violet:  'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400',
    cyan:    'bg-cyan-50 text-cyan-600 dark:bg-cyan-500/10 dark:text-cyan-400',
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── SCHOOL HEADER BANNER ────────────────────────────────────────────────────
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
        Private Students Report
      </p>
    </div>
  )
}

// ─── DESKTOP TABLE ROW ───────────────────────────────────────────────────────
function DesktopRow({ row, idx }) {
  const { fg, bg } = classColor(row.class_name)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      {/* S.No */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-10">{idx}</td>

      {/* Adm No */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-lg tabular-nums whitespace-nowrap">
          <BadgeCheck className="w-3 h-3 flex-shrink-0" />
          {row.registration_no}
        </span>
      </td>

      {/* Student Name */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 dark:from-indigo-500 dark:to-violet-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
            {row.stu_name.charAt(0)}
          </div>
          <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{row.stu_name}</span>
        </div>
      </td>

      {/* Father Name */}
      <td className="px-4 py-3">
        <span className="text-[13px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.father_name}</span>
      </td>

      {/* Class */}
      <td className="px-4 py-3">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[12px] font-semibold whitespace-nowrap" style={{ background: bg, color: fg }}>
          <GraduationCap className="w-3 h-3 flex-shrink-0" />
          {row.class_name}
        </span>
      </td>

      {/* Mobile */}
      <td className="px-4 py-3">
        <a href={`tel:${row.mobile}`}
          className="inline-flex items-center gap-1.5 text-[12px] font-medium text-emerald-700 dark:text-emerald-400 hover:underline tabular-nums whitespace-nowrap">
          <Phone className="w-3 h-3 flex-shrink-0" />
          {row.mobile}
        </a>
      </td>

      {/* Address */}
      <td className="px-4 py-3">
        <div className="flex items-start gap-1.5 max-w-[200px]">
          <Home className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0 mt-0.5" />
          <span className="text-[12px] text-slate-500 dark:text-slate-400 leading-snug">{row.address}</span>
        </div>
      </td>
    </tr>
  )
}

// ─── MOBILE CARD ─────────────────────────────────────────────────────────────
function MobileCard({ row, idx }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class_name)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-400 to-indigo-600 dark:from-indigo-500 dark:to-violet-600 flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0">
          {row.stu_name.charAt(0)}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.stu_name}</p>
          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tabular-nums">{row.registration_no}</span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-1.5 py-0.5 rounded" style={{ background: bg, color: fg }}>
              {row.class_name}
            </span>
          </div>
        </div>

        <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-2.5">
          <DetailRow icon={UserSquare2} label="Father" value={row.father_name} color="violet" />
          <DetailRow icon={Phone}      label="Mobile" value={row.mobile}       color="emerald" isPhone />
          <DetailRow icon={Home}       label="Address" value={row.address}     color="amber" />
          <DetailRow icon={GraduationCap} label="Class" value={row.class_name} color="blue" />
        </div>
      )}
    </div>
  )
}

function DetailRow({ icon: Icon, label, value, color, isPhone }) {
  const colors = {
    blue:    'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10',
    violet:  'text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-500/10',
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10',
    amber:   'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10',
  }
  return (
    <div className="flex items-start gap-2.5">
      <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[color]}`}>
        <Icon className="w-3.5 h-3.5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{label}</p>
        {isPhone ? (
          <a href={`tel:${value}`} className="text-[13px] font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">{value}</a>
        ) : (
          <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 leading-snug">{value}</p>
        )}
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ───────────────────────────────────────────────────
function FilterDrawer({ open, onClose, session, setSession, selectedClasses, setSelectedClasses, onShow, loading, errors }) {
  const availableClasses = getSessionClasses(session)
  const allSelected = selectedClasses.length === availableClasses.length && availableClasses.length > 0

  const toggleClass = (cls) => {
    if (selectedClasses.includes(cls)) setSelectedClasses(selectedClasses.filter(c => c !== cls))
    else setSelectedClasses([...selectedClasses, cls])
  }
  const toggleAll = () => {
    if (allSelected) setSelectedClasses([])
    else setSelectedClasses([...availableClasses])
  }

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl flex flex-col max-h-[85vh]"
        style={{ animation: 'drawerUp .25s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Title */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Session */}
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={session} onChange={e => setSession(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>

          {/* Class multi-select (mobile checkbox list) */}
          {availableClasses.length > 0 && (
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                  Select Class
                </label>
                <button type="button" onClick={toggleAll} className="text-[11px] font-semibold text-blue-600 dark:text-indigo-400 hover:underline">
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-slate-50 dark:bg-[#1e2238] overflow-hidden">
                {availableClasses.map((cls, i) => {
                  const checked = selectedClasses.includes(cls)
                  const { fg, bg } = classColor(cls)
                  return (
                    <button
                      type="button"
                      key={cls}
                      onClick={() => toggleClass(cls)}
                      className={`flex items-center gap-3 w-full px-4 py-3 text-left transition-colors
                        ${i !== availableClasses.length - 1 ? 'border-b border-slate-100 dark:border-[rgba(99,102,241,0.08)]' : ''}
                        ${checked ? 'bg-blue-50/50 dark:bg-indigo-500/[0.06]' : 'hover:bg-white dark:hover:bg-white/[0.02]'}`}
                    >
                      <span className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors
                        ${checked ? 'bg-blue-600 dark:bg-indigo-600 border-blue-600 dark:border-indigo-600' : 'border-slate-300 dark:border-slate-600'}`}>
                        {checked && <Check className="w-3 h-3 text-white" />}
                      </span>
                      <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold" style={{ background: bg, color: fg }}>
                        {formatAbbr(cls)}
                      </span>
                      <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{cls}</span>
                      {checked && <span className="ml-auto w-2 h-2 rounded-full bg-blue-500 dark:bg-indigo-400 flex-shrink-0" />}
                    </button>
                  )
                })}
              </div>
              {selectedClasses.length > 0 && (
                <p className="text-[11px] text-blue-600 dark:text-indigo-400 font-medium mt-1">
                  {selectedClasses.length} class{selectedClasses.length > 1 ? 'es' : ''} selected
                </p>
              )}
            </div>
          )}
        </div>
        {/* Footer actions */}
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 flex-shrink-0">
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function TransportPrivateStudentsReport() {
  const [session,         setSession]         = useState('')
  const [selectedClasses, setSelectedClasses] = useState([])
  const [rows,            setRows]            = useState([])
  const [loading,         setLoading]         = useState(false)
  const [exporting,       setExporting]       = useState(false)
  const [filterOpen,      setFilterOpen]      = useState(false)
  const [search,          setSearch]          = useState('')
  const [errors,          setErrors]          = useState({})
  const [toast,           setToast]           = useState(null)
  const [shown,           setShown]           = useState(false)
  const [shownSession,    setShownSession]    = useState('')

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const availableClasses = useMemo(() => getSessionClasses(session), [session])

  // Reset selected classes when session changes
  const handleSessionChange = (val) => {
    setSession(val)
    setSelectedClasses([])
    setErrors(p => ({ ...p, session: undefined }))
  }

  // ── Fetch (simulate API) ──────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')

    setTimeout(() => {
      let data = PRIVATE_STUDENTS_DATA[session] || []
      // Filter by selected classes (if none selected, show all)
      if (selectedClasses.length > 0) {
        data = data.filter(r => selectedClasses.includes(r.class_name))
      }
      setRows(data)
      setShownSession(session)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} private student${data.length !== 1 ? 's' : ''} for session ${session}.`)
    }, 650)
  }, [session, selectedClasses])

  const handleReset = () => {
    setSession(''); setSelectedClasses([]); setRows([])
    setSearch(''); setErrors({}); setShown(false); setShownSession('')
  }

  // ── Excel Export ──────────────────────────────────────────────────────────
  const handleExcel = () => {
    if (rows.length === 0) { showToast('No data to export. Show report first.', 'error'); return }
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search filter ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.stu_name.toLowerCase().includes(q) ||
      r.registration_no.toLowerCase().includes(q) ||
      r.father_name.toLowerCase().includes(q) ||
      r.class_name.toLowerCase().includes(q) ||
      r.mobile.includes(q)
    )
  }, [rows, search])

  // ── Summary stats ─────────────────────────────────────────────────────────
  const uniqueClasses = useMemo(() => [...new Set(filtered.map(r => r.class_name))].length, [filtered])

  const hasResults  = shown && rows.length > 0
  const filterCount = (session ? 1 : 0) + (selectedClasses.length > 0 ? 1 : 0)

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Private Students Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Students not availing school transport — session &amp; class-wise listing.
          </p>
        </div>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filter Card ────────────────────────────────────────────── */}
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
              <NativeSelect value={session} onChange={e => handleSessionChange(e.target.value)} placeholder="-- Select Session --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>

            {/* Class multi-select */}
            <Field label="Select Class">
              <ClassMultiSelect
                availableClasses={availableClasses}
                selected={selectedClasses}
                onChange={setSelectedClasses}
              />
            </Field>

            {/* Spacer */}
            <div />

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

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {session ? `${session}${selectedClasses.length > 0 ? ` · ${selectedClasses.length} class` : ''}` : 'Set Filters'}
          {filterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{filterCount}</span>
          )}
        </button>
        {hasResults && (
          <button type="button" onClick={handleExcel} disabled={exporting}
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
        session={session}
        setSession={handleSessionChange}
        selectedClasses={selectedClasses}
        setSelectedClasses={setSelectedClasses}
        onShow={handleShow}
        loading={loading}
        errors={errors}
      />

      {/* ── Loading Skeleton ──────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-20 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.12 }} />
          ))}
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* School Header */}
          <SchoolHeader session={shownSession} />

          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <SummaryCard icon={Users}        label="Total Students"    value={filtered.length}  color="blue"    />
            <SummaryCard icon={GraduationCap} label="Classes Covered"  value={uniqueClasses}    color="violet"  />
            <SummaryCard icon={Bus}           label="No Transport"     value={filtered.length}  color="amber"   />
          </div>

          {/* Results card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Private Students</span>
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
                  placeholder="Search name, adm no, class…"
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
                Showing private students (not using school transport). Click mobile number to call directly.
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
                      {['S.No.', 'Adm No.', 'Student Name', 'Father Name', 'Class', 'Mobile No.', 'Address'].map((h, i) => (
                        <th key={i} className="px-4 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:text-center first:w-10">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row, i) => (
                      <DesktopRow key={row.registration_no} row={row} idx={i + 1} />
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
                    Tap a card to see full details.
                  </p>
                  {filtered.map((row, i) => (
                    <MobileCard key={row.registration_no} row={row} idx={i + 1} />
                  ))}

                  {/* Mobile Grand Total */}
                  <div className="rounded-xl border-2 border-blue-200 dark:border-indigo-500/30 bg-blue-50 dark:bg-indigo-500/[0.07] p-4">
                    <p className="text-[12px] font-bold uppercase tracking-wide text-blue-700 dark:text-blue-400 mb-3 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Summary — {filtered.length} Students
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-blue-700 dark:text-blue-300 tabular-nums">{filtered.length}</p>
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Total Private Students</p>
                      </div>
                      <div className="rounded-lg bg-white/70 dark:bg-white/5 p-2.5 text-center">
                        <p className="text-[22px] font-bold text-violet-700 dark:text-violet-300 tabular-nums">{uniqueClasses}</p>
                        <p className="text-[10px] font-semibold text-violet-600 dark:text-violet-400">Classes Covered</p>
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

      {/* ── Empty State ────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Bus className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select a session and click <strong>Show</strong> to generate the private students report.
            </p>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
