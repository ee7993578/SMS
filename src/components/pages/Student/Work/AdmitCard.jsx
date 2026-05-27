import { useState, useRef, useCallback } from 'react'
import {
  AlertCircle, Download, Eye, Printer, ChevronDown,
  GraduationCap, Users, BookOpen, Calendar, FileText,
  Check, X, Search, CheckSquare, Square, Loader2, ClipboardList
} from 'lucide-react'

// ─── STATIC MOCK DATA ─────────────────────────────────────────────────────────
const SESSIONS = ['2024-25', '2025-26', '2026-27']

const CLASSES_DATA = {
  'Nursery': { sections: ['A', 'B'], terms: ['Term 1', 'Term 2'], exams: ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'] },
  'LKG':     { sections: ['A', 'B'], terms: ['Term 1', 'Term 2'], exams: ['Unit Test 1', 'Half Yearly', 'Annual'] },
  'UKG':     { sections: ['A', 'B'], terms: ['Term 1', 'Term 2'], exams: ['Unit Test 1', 'Half Yearly', 'Annual'] },
  'Class I': { sections: ['A', 'B', 'C'], terms: ['Term 1', 'Term 2'], exams: ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'] },
  'Class II':{ sections: ['A', 'B', 'C'], terms: ['Term 1', 'Term 2'], exams: ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'] },
  'Class III':{ sections: ['A', 'B'], terms: ['Term 1', 'Term 2'], exams: ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'] },
  'Class IV': { sections: ['A', 'B'], terms: ['Term 1', 'Term 2'], exams: ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'] },
  'Class V':  { sections: ['A', 'B'], terms: ['Term 1', 'Term 2'], exams: ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'] },
  'Class VI': { sections: ['A', 'B', 'C'], terms: ['Term 1', 'Term 2'], exams: ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'] },
  'Class VII':{ sections: ['A', 'B', 'C'], terms: ['Term 1', 'Term 2'], exams: ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'] },
  'Class VIII':{ sections: ['A', 'B'], terms: ['Term 1', 'Term 2'], exams: ['Unit Test 1', 'Half Yearly', 'Unit Test 2', 'Annual'] },
  'Class IX': { sections: ['A', 'B'], terms: ['Term 1', 'Term 2'], exams: ['Half Yearly', 'Annual'] },
  'Class X':  { sections: ['A', 'B'], terms: ['Term 1', 'Term 2'], exams: ['Half Yearly', 'Annual'] },
  'Class XI': { sections: ['Science', 'Commerce', 'Arts'], terms: ['Term 1', 'Term 2'], exams: ['Half Yearly', 'Annual'] },
  'Class XII':{ sections: ['Science', 'Commerce', 'Arts'], terms: ['Term 1', 'Term 2'], exams: ['Half Yearly', 'Annual'] },
}

const STUDENTS_BY_CLASS_SECTION = {
  'Class I-A':  [
    { id: 1,  admNo: 'ADM001', name: 'Aarav Sharma',    roll: '01', dob: '12 Mar 2018', father: 'Rajesh Sharma',   photo: null },
    { id: 2,  admNo: 'ADM002', name: 'Priya Singh',     roll: '02', dob: '05 Jul 2018', father: 'Suresh Singh',    photo: null },
    { id: 3,  admNo: 'ADM003', name: 'Rohan Gupta',     roll: '03', dob: '22 Jan 2018', father: 'Vinod Gupta',     photo: null },
    { id: 4,  admNo: 'ADM004', name: 'Ananya Verma',    roll: '04', dob: '10 Sep 2018', father: 'Manoj Verma',     photo: null },
    { id: 5,  admNo: 'ADM005', name: 'Karan Mehta',     roll: '05', dob: '18 Feb 2018', father: 'Sanjay Mehta',    photo: null },
    { id: 6,  admNo: 'ADM006', name: 'Diya Patel',      roll: '06', dob: '30 Nov 2018', father: 'Amit Patel',      photo: null },
    { id: 7,  admNo: 'ADM007', name: 'Arjun Nair',      roll: '07', dob: '14 Apr 2018', father: 'Sunil Nair',      photo: null },
    { id: 8,  admNo: 'ADM008', name: 'Sneha Rao',       roll: '08', dob: '07 Aug 2018', father: 'Krishna Rao',     photo: null },
  ],
  'Class I-B':  [
    { id: 9,  admNo: 'ADM009', name: 'Vikas Kumar',     roll: '01', dob: '03 Jun 2018', father: 'Ramesh Kumar',    photo: null },
    { id: 10, admNo: 'ADM010', name: 'Pooja Joshi',     roll: '02', dob: '25 Oct 2018', father: 'Dinesh Joshi',    photo: null },
    { id: 11, admNo: 'ADM011', name: 'Amit Yadav',      roll: '03', dob: '16 Dec 2018', father: 'Rakesh Yadav',    photo: null },
    { id: 12, admNo: 'ADM012', name: 'Neha Singh',      roll: '04', dob: '09 May 2018', father: 'Hemant Singh',    photo: null },
  ],
  'Class X-A':  [
    { id: 20, admNo: 'ADM020', name: 'Rahul Mishra',    roll: '01', dob: '11 Jan 2009', father: 'Anil Mishra',     photo: null },
    { id: 21, admNo: 'ADM021', name: 'Sakshi Dubey',    roll: '02', dob: '23 Mar 2009', father: 'Vivek Dubey',     photo: null },
    { id: 22, admNo: 'ADM022', name: 'Tarun Kapoor',    roll: '03', dob: '07 Aug 2009', father: 'Suresh Kapoor',   photo: null },
    { id: 23, admNo: 'ADM023', name: 'Ishaan Bajaj',    roll: '04', dob: '19 Dec 2009', father: 'Neeraj Bajaj',    photo: null },
    { id: 24, admNo: 'ADM024', name: 'Kavya Reddy',     roll: '05', dob: '02 Apr 2009', father: 'Venkat Reddy',    photo: null },
    { id: 25, admNo: 'ADM025', name: 'Mohit Soni',      roll: '06', dob: '14 Jul 2009', father: 'Deepak Soni',     photo: null },
  ],
  'Class XII-Science': [
    { id: 30, admNo: 'ADM030', name: 'Divya Saxena',    roll: '01', dob: '08 Feb 2007', father: 'Pramod Saxena',   photo: null },
    { id: 31, admNo: 'ADM031', name: 'Harsh Trivedi',   roll: '02', dob: '17 May 2007', father: 'Alok Trivedi',    photo: null },
    { id: 32, admNo: 'ADM032', name: 'Naina Bose',      roll: '03', dob: '29 Sep 2007', father: 'Subhash Bose',    photo: null },
    { id: 33, admNo: 'ADM033', name: 'Yash Chauhan',    roll: '04', dob: '04 Nov 2007', father: 'Girish Chauhan',  photo: null },
  ],
}

const SCHOOL_INFO = {
  name:    'DELHI PUBLIC SCHOOL',
  address: 'Sector 12, Dwarka, New Delhi – 110078',
  phone:   '011-28034567',
  board:   'CBSE',
  logo:    null,
}

const getStudents = (cls, sec) => {
  const key = `${cls}-${sec}`
  if (STUDENTS_BY_CLASS_SECTION[key]) return STUDENTS_BY_CLASS_SECTION[key]
  // Generate generic students for other combos
  return Array.from({ length: 5 }, (_, i) => ({
    id: 100 + i,
    admNo: `ADM${String(100 + i).padStart(3,'0')}`,
    name:  ['Aditya Pandey','Roshni Gupta','Tanvi Aggarwal','Chirag Shah','Swati Dixit'][i],
    roll:  String(i + 1).padStart(2, '0'),
    dob:   '15 Jun 2010',
    father:'Parent Name',
    photo: null,
  }))
}

// ─── PRIMITIVES ───────────────────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500 font-medium">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

function Sel({ value, onChange, disabled, error, children }) {
  return (
    <select value={value} onChange={onChange} disabled={disabled}
      className={`w-full px-3 py-2 text-[13px] border rounded-lg outline-none transition-all appearance-none cursor-pointer font-medium
        bg-white text-slate-800 focus:ring-2 focus:ring-blue-100 focus:border-blue-400
        dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
        disabled:opacity-40 disabled:cursor-not-allowed
        ${error
          ? 'border-rose-400 bg-rose-50/30 dark:border-rose-500'
          : 'border-slate-200 dark:border-[rgba(99,102,241,0.2)] hover:border-slate-300 dark:hover:border-indigo-400/40'
        }`}>
      {children}
    </select>
  )
}

// ─── STUDENT CHECKBOX ROW ─────────────────────────────────────────────────────
function StudentRow({ student, checked, onToggle }) {
  return (
    <div onClick={onToggle}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all select-none
        ${checked
          ? 'bg-blue-50 border border-blue-200 dark:bg-indigo-500/10 dark:border-indigo-500/30'
          : 'bg-white border border-slate-100 dark:bg-[#1e2238] dark:border-[rgba(99,102,241,0.1)] hover:border-slate-200 dark:hover:border-indigo-400/25 hover:bg-slate-50 dark:hover:bg-white/[0.04]'
        }`}>
      <span className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-all
        ${checked ? 'bg-blue-500 border-blue-500 dark:bg-indigo-500 dark:border-indigo-500' : 'border-slate-300 dark:border-slate-600'}`}>
        {checked && (
          <svg viewBox="0 0 10 10" className="w-2.5 h-2.5">
            <polyline points="1.5,5 4,7.5 8.5,2" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </span>
      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0
        ${checked ? 'bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300' : 'bg-slate-100 text-slate-500 dark:bg-white/[0.08] dark:text-slate-400'}`}>
        {student.name.charAt(0)}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-[13px] font-semibold truncate ${checked ? 'text-blue-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-200'}`}>
          {student.name}
        </p>
        <p className="text-[11px] text-slate-400 dark:text-slate-500">Roll: {student.roll} · Adm: {student.admNo}</p>
      </div>
    </div>
  )
}

// ─── ADMIT CARD TEMPLATE (single card, visiting card proportions 3.5×2 inch) ─
function AdmitCardTemplate({ student, filter, index }) {
  // 3.5 × 2 inch at 96dpi → 336 × 192px — scale up 2.5× for print clarity
  return (
    <div
      id={`admit-card-${index}`}
      style={{
        width: '336px', height: '192px',
        border: '1.5px solid #1a56db',
        borderRadius: '8px',
        fontFamily: 'Arial, sans-serif',
        overflow: 'hidden',
        background: '#fff',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        pageBreakInside: 'avoid',
      }}
    >
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1a56db,#1e40af)', padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
        <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <span style={{ fontSize: 10, fontWeight: 800, color: '#1a56db' }}>DPS</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 9, fontWeight: 800, color: '#fff', letterSpacing: '0.04em', lineHeight: 1.2 }}>
            {SCHOOL_INFO.name}
          </p>
          <p style={{ margin: 0, fontSize: 7, color: 'rgba(255,255,255,0.8)', lineHeight: 1.2 }}>{SCHOOL_INFO.address}</p>
        </div>
        <div style={{ flexShrink: 0, textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 8, fontWeight: 800, color: '#fbbf24', letterSpacing: '0.05em' }}>ADMIT CARD</p>
          <p style={{ margin: 0, fontSize: 7, color: 'rgba(255,255,255,0.7)' }}>{filter.session}</p>
        </div>
      </div>

      {/* Exam badge */}
      <div style={{ background: '#eff6ff', borderBottom: '1px solid #bfdbfe', padding: '3px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 7.5, fontWeight: 700, color: '#1e40af', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {filter.exam} · {filter.term}
        </span>
        <span style={{ fontSize: 7.5, color: '#3b82f6', fontWeight: 600 }}>
          {filter.cls} – Sec {filter.section}
        </span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', gap: 8, padding: '6px 10px', overflow: 'hidden' }}>
        {/* Photo box */}
        <div style={{
          width: 44, height: 52, border: '1px solid #d1d5db', borderRadius: 4,
          flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#f9fafb', overflow: 'hidden'
        }}>
          {student.photo
            ? <img src={student.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <span style={{ fontSize: 16, color: '#9ca3af' }}>👤</span>
          }
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: '0 0 2px', fontSize: 9.5, fontWeight: 800, color: '#111827', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {student.name}
          </p>
          {[
            ['Adm. No.',    student.admNo],
            ["Father's Name", student.father],
            ['Roll No.',    student.roll],
            ['Date of Birth', student.dob],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 4, marginBottom: 1 }}>
              <span style={{ fontSize: 7, color: '#6b7280', minWidth: 58, flexShrink: 0 }}>{k}:</span>
              <span style={{ fontSize: 7, color: '#111827', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid #e5e7eb', padding: '4px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fafafa' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: 16, borderBottom: '1px solid #374151', width: 60, marginBottom: 2 }} />
          <span style={{ fontSize: 6.5, color: '#6b7280' }}>Student Signature</span>
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: 6.5, color: '#6b7280' }}>Roll No.</p>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 800, color: '#1a56db' }}>{student.roll}</p>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ height: 16, borderBottom: '1px solid #374151', width: 60, marginBottom: 2 }} />
          <span style={{ fontSize: 6.5, color: '#6b7280' }}>Principal Signature</span>
        </div>
      </div>
    </div>
  )
}

// ─── PDF DOWNLOAD ─────────────────────────────────────────────────────────────
// Uses browser print with custom CSS — 4 cards per A4 page in a 2×2 grid
function downloadAdmitCards(students, filter) {
  const cardsHTML = students.map((student, i) => `
    <div style="
      width:336px; height:192px;
      border:1.5px solid #1a56db; border-radius:8px;
      font-family:Arial,sans-serif; overflow:hidden;
      background:#fff; box-sizing:border-box;
      display:flex; flex-direction:column;
      page-break-inside:avoid;
    ">
      <div style="background:linear-gradient(135deg,#1a56db,#1e40af);padding:6px 10px;display:flex;align-items:center;gap:6px">
        <div style="width:28px;height:28px;border-radius:50%;background:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0">
          <span style="font-size:10px;font-weight:800;color:#1a56db">DPS</span>
        </div>
        <div style="flex:1;min-width:0">
          <p style="margin:0;font-size:9px;font-weight:800;color:#fff;letter-spacing:.04em;line-height:1.2">${SCHOOL_INFO.name}</p>
          <p style="margin:0;font-size:7px;color:rgba(255,255,255,.8);line-height:1.2">${SCHOOL_INFO.address}</p>
        </div>
        <div style="flex-shrink:0;text-align:right">
          <p style="margin:0;font-size:8px;font-weight:800;color:#fbbf24;letter-spacing:.05em">ADMIT CARD</p>
          <p style="margin:0;font-size:7px;color:rgba(255,255,255,.7)">${filter.session}</p>
        </div>
      </div>
      <div style="background:#eff6ff;border-bottom:1px solid #bfdbfe;padding:3px 10px;display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:7.5px;font-weight:700;color:#1e40af;text-transform:uppercase;letter-spacing:.05em">${filter.exam} · ${filter.term}</span>
        <span style="font-size:7.5px;color:#3b82f6;font-weight:600">${filter.cls} – Sec ${filter.section}</span>
      </div>
      <div style="flex:1;display:flex;gap:8px;padding:6px 10px;overflow:hidden">
        <div style="width:44px;height:52px;border:1px solid #d1d5db;border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;background:#f9fafb">
          <span style="font-size:18px;color:#9ca3af">&#128100;</span>
        </div>
        <div style="flex:1;min-width:0">
          <p style="margin:0 0 2px;font-size:9.5px;font-weight:800;color:#111827;line-height:1.2;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${student.name}</p>
          ${[['Adm. No.',student.admNo],["Father's Name",student.father],['Roll No.',student.roll],['Date of Birth',student.dob]].map(([k,v])=>`
          <div style="display:flex;gap:4px;margin-bottom:1px">
            <span style="font-size:7px;color:#6b7280;min-width:58px;flex-shrink:0">${k}:</span>
            <span style="font-size:7px;color:#111827;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${v}</span>
          </div>`).join('')}
        </div>
      </div>
      <div style="border-top:1px solid #e5e7eb;padding:4px 10px;display:flex;justify-content:space-between;align-items:center;background:#fafafa">
        <div style="text-align:center">
          <div style="height:16px;border-bottom:1px solid #374151;width:60px;margin-bottom:2px"></div>
          <span style="font-size:6.5px;color:#6b7280">Student Signature</span>
        </div>
        <div style="text-align:center">
          <p style="margin:0;font-size:6.5px;color:#6b7280">Roll No.</p>
          <p style="margin:0;font-size:11px;font-weight:800;color:#1a56db">${student.roll}</p>
        </div>
        <div style="text-align:center">
          <div style="height:16px;border-bottom:1px solid #374151;width:60px;margin-bottom:2px"></div>
          <span style="font-size:6.5px;color:#6b7280">Principal Signature</span>
        </div>
      </div>
    </div>
  `).join('')

  const printHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>Admit Card – ${filter.cls} ${filter.section} – ${filter.exam}</title>
  <style>
    @page { size: A4; margin: 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #fff; font-family: Arial, sans-serif; }
    .page-title {
      text-align: center; font-size: 11px; font-weight: 700;
      color: #374151; margin-bottom: 10px; padding-bottom: 6px;
      border-bottom: 1px solid #e5e7eb; letter-spacing: .05em; text-transform: uppercase;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 336px);
      gap: 12px;
      justify-content: center;
    }
    @media print {
      body { margin: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="page-title">
    ${SCHOOL_INFO.name} &nbsp;|&nbsp; Admit Card &nbsp;|&nbsp; ${filter.cls} – Sec ${filter.section} &nbsp;|&nbsp; ${filter.exam} &nbsp;|&nbsp; Session ${filter.session}
  </div>
  <div class="grid">
    ${cardsHTML}
  </div>
  <script>
    window.onload = function() {
      window.print();
      setTimeout(function(){ window.close(); }, 1000);
    }
  <\/script>
</body>
</html>`

  const blob = new Blob([printHTML], { type: 'text/html' })
  const url  = URL.createObjectURL(blob)
  const win  = window.open(url, '_blank', 'width=900,height=700')
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function AdmitCard({ title = 'Admit Card' }) {
  const [session,   setSession]   = useState('0')
  const [cls,       setCls]       = useState('0')
  const [section,   setSection]   = useState('0')
  const [term,      setTerm]      = useState('0')
  const [exam,      setExam]      = useState('0')
  const [search,    setSearch]    = useState('')

  const [students,      setStudents]      = useState([])
  const [selectedIds,   setSelectedIds]   = useState(new Set())
  const [showPreview,   setShowPreview]   = useState(false)
  const [loading,       setLoading]       = useState(false)
  const [successMsg,    setSuccessMsg]    = useState('')

  const [errors, setErrors] = useState({})

  // Derived data
  const classInfo   = CLASSES_DATA[cls] || null
  const sections    = classInfo?.sections  || []
  const terms       = classInfo?.terms     || []
  const exams       = classInfo?.exams     || []

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.admNo.toLowerCase().includes(search.toLowerCase()) ||
    s.roll.includes(search)
  )

  const allSelected   = filteredStudents.length > 0 && filteredStudents.every(s => selectedIds.has(s.id))
  const someSelected  = filteredStudents.some(s => selectedIds.has(s.id))
  const selectedCount = [...selectedIds].length
  const selectedStudents = students.filter(s => selectedIds.has(s.id))

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleClassChange = (e) => {
    const v = e.target.value
    setCls(v); setSection('0'); setTerm('0'); setExam('0')
    setStudents([]); setSelectedIds(new Set()); setShowPreview(false); setSuccessMsg('')
    setErrors(p => ({ ...p, cls: '', section: '', term: '', exam: '' }))
  }

  const handleSectionChange = (e) => {
    const v = e.target.value
    setSection(v); setStudents([]); setSelectedIds(new Set()); setShowPreview(false); setSuccessMsg('')
    setErrors(p => ({ ...p, section: '' }))
  }

  const toggleStudent = (id) => setSelectedIds(prev => {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  })
  const selectAll  = () => setSelectedIds(new Set(filteredStudents.map(s => s.id)))
  const clearAll   = () => setSelectedIds(new Set())

  const validate = () => {
    const e = {}
    if (session === '0') e.session = 'Required'
    if (cls     === '0') e.cls     = 'Required'
    if (section === '0') e.section = 'Required'
    if (term    === '0') e.term    = 'Required'
    if (exam    === '0') e.exam    = 'Required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleShow = () => {
    if (!validate()) return
    setLoading(true); setSuccessMsg(''); setShowPreview(false)
    setTimeout(() => {
      const data = getStudents(cls, section)
      setStudents(data)
      setSelectedIds(new Set(data.map(s => s.id))) // select all by default
      setShowPreview(true)
      setLoading(false)
      setSuccessMsg(`${data.length} students loaded. Select students and click Download.`)
    }, 600)
  }

  const currentFilter = { session, cls, section, term, exam }

  const handleDownload = () => {
    if (selectedStudents.length === 0) return
    downloadAdmitCards(selectedStudents, currentFilter)
  }

  const handlePrintPreview = () => {
    if (selectedStudents.length === 0) return
    downloadAdmitCards(selectedStudents, currentFilter)
  }

  return (
    <div className="page-animate space-y-4 pb-8">

      {/* ── Page Title ── */}
      <div>
        <h1 className="font-display text-[20px] font-bold text-slate-800 dark:text-slate-100">{title}</h1>
        <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
          Select filters, load students, choose, and download admit cards as PDF.
        </p>
      </div>

      {/* ── Filters Card ── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden bg-white dark:bg-[#1a1f35] shadow-sm">

        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <ClipboardList className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 tracking-tight">Filter & Search</span>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Row 1: Session, Class, Section */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Session" required error={errors.session}>
              <Sel value={session} onChange={e => { setSession(e.target.value); setErrors(p=>({...p,session:''})); setShowPreview(false) }} error={errors.session}>
                <option value="0">— Select Session —</option>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </Sel>
            </Field>
            <Field label="Class" required error={errors.cls}>
              <Sel value={cls} onChange={handleClassChange} error={errors.cls}>
                <option value="0">— Select Class —</option>
                {Object.keys(CLASSES_DATA).map(c => <option key={c} value={c}>{c}</option>)}
              </Sel>
            </Field>
            <Field label="Section" required error={errors.section}>
              <Sel value={section} onChange={handleSectionChange} disabled={!classInfo} error={errors.section}>
                <option value="0">— Select Section —</option>
                {sections.map(s => <option key={s} value={s}>{s}</option>)}
              </Sel>
            </Field>
          </div>

          {/* Row 2: Term, Exam, Show button */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Term" required error={errors.term}>
              <Sel value={term} onChange={e => { setTerm(e.target.value); setErrors(p=>({...p,term:''})); setShowPreview(false) }} disabled={!classInfo} error={errors.term}>
                <option value="0">— Select Term —</option>
                {terms.map(t => <option key={t} value={t}>{t}</option>)}
              </Sel>
            </Field>
            <Field label="Exam" required error={errors.exam}>
              <Sel value={exam} onChange={e => { setExam(e.target.value); setErrors(p=>({...p,exam:''})); setShowPreview(false) }} disabled={!classInfo} error={errors.exam}>
                <option value="0">— Select Exam —</option>
                {exams.map(ex => <option key={ex} value={ex}>{ex}</option>)}
              </Sel>
            </Field>
            <div className="flex flex-col justify-end">
              <button type="button" onClick={handleShow} disabled={loading}
                className="flex items-center justify-center gap-2 w-full px-6 py-2 text-[13px] font-semibold text-white rounded-lg transition-all active:scale-95
                  bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                  dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20
                  disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Loading...</>
                  : <><Eye className="w-4 h-4" />Show Students</>
                }
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Success bar ── */}
      {successMsg && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl border
          bg-emerald-50 border-emerald-200 text-emerald-700
          dark:bg-emerald-900/20 dark:border-emerald-500/25 dark:text-emerald-300">
          <Check className="w-4 h-4 flex-shrink-0" />
          <p className="text-[13px] font-medium flex-1">{successMsg}</p>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4 opacity-50 hover:opacity-100" /></button>
        </div>
      )}

      {/* ── Student List + Preview ── */}
      {showPreview && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">

          {/* LEFT: Student selection list */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden bg-white dark:bg-[#1a1f35] shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
              <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1 tracking-tight">Select Students</span>
              {selectedCount > 0 && (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                  {selectedCount} selected
                </span>
              )}
            </div>

            <div className="p-4 space-y-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, roll, adm no..."
                  className="w-full pl-9 pr-3 py-2 text-[13px] border rounded-lg outline-none transition-all
                    border-slate-200 bg-white text-slate-800 placeholder-slate-300
                    focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-500 dark:focus:border-indigo-400" />
              </div>

              {/* Select / Clear row */}
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  {filteredStudents.length} students
                </span>
                <div className="flex gap-1">
                  <button type="button" onClick={selectAll}
                    className="text-[11px] font-semibold px-2 py-1 rounded-md text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10 transition-colors">
                    Select all
                  </button>
                  {someSelected && (
                    <button type="button" onClick={clearAll}
                      className="text-[11px] font-semibold px-2 py-1 rounded-md text-slate-500 hover:bg-slate-100 dark:hover:bg-white/[0.06] transition-colors">
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* List */}
              <div className="flex flex-col gap-1.5 max-h-80 overflow-y-auto pr-0.5">
                {filteredStudents.length === 0 && (
                  <div className="py-8 text-center text-[12px] text-slate-400 dark:text-slate-500">No students found</div>
                )}
                {filteredStudents.map(s => (
                  <StudentRow key={s.id} student={s} checked={selectedIds.has(s.id)} onToggle={() => toggleStudent(s.id)} />
                ))}
              </div>
            </div>

            {/* Download footer */}
            <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/60 dark:bg-white/[0.02] flex-wrap">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                {selectedCount} of {students.length} selected for download
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={handlePrintPreview} disabled={selectedCount === 0}
                  className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold rounded-lg transition-all
                    border border-slate-200 bg-white text-slate-600 hover:bg-slate-50
                    dark:border-[rgba(99,102,241,0.2)] dark:bg-transparent dark:text-slate-300 dark:hover:bg-white/[0.05]
                    disabled:opacity-40 disabled:cursor-not-allowed">
                  <Printer className="w-3.5 h-3.5" /> Print
                </button>
                <button type="button" onClick={handleDownload} disabled={selectedCount === 0}
                  className="flex items-center gap-1.5 px-5 py-2 text-[12px] font-semibold rounded-lg text-white transition-all active:scale-95
                    bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
                    dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20
                    disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100">
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT: Card preview */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] overflow-hidden bg-white dark:bg-[#1a1f35] shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
              <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1 tracking-tight">Card Preview</span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Visiting card size · 4 per A4</span>
            </div>

            <div className="p-4">
              {selectedStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-white/[0.06] flex items-center justify-center">
                    <FileText className="w-7 h-7 text-slate-300 dark:text-slate-600" />
                  </div>
                  <p className="text-[12px] text-slate-400 dark:text-slate-500 text-center">Select students to preview admit cards</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Info banner */}
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100 dark:bg-indigo-500/8 dark:border-indigo-500/15">
                    <Eye className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                    <p className="text-[11px] text-blue-700 dark:text-blue-300 font-medium">
                      Showing {Math.min(2, selectedStudents.length)} of {selectedStudents.length} cards · PDF will contain all {selectedStudents.length}
                    </p>
                  </div>
                  {/* Preview max 2 cards */}
                  <div className="overflow-x-auto">
                    <div className="flex flex-col gap-3 items-center py-2">
                      {selectedStudents.slice(0, 2).map((s, i) => (
                        <AdmitCardTemplate key={s.id} student={s} filter={currentFilter} index={i} />
                      ))}
                      {selectedStudents.length > 2 && (
                        <div className="flex items-center justify-center w-[336px] h-10 rounded-lg border-2 border-dashed border-slate-200 dark:border-white/[0.1]">
                          <p className="text-[12px] text-slate-400 dark:text-slate-500 font-medium">
                            +{selectedStudents.length - 2} more cards in PDF
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Download button (repeat for easy access) */}
                  <button type="button" onClick={handleDownload}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-[13px] font-semibold text-white rounded-xl transition-all active:scale-[0.99]
                      bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20
                      dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20">
                    <Download className="w-4 h-4" />
                    Download {selectedStudents.length} Admit Card{selectedStudents.length > 1 ? 's' : ''} as PDF
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  )
}
