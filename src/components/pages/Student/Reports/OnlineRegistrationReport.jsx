/**
 * OnlineRegistrationReport.jsx
 * Folder: src/pages/Reports/Registration/OnlineRegistrationReport.jsx
 *
 * Converts legacy ASPX "Online Registration Report" to fully-responsive
 * React + Tailwind. Same design system as OnlineRegistrationReportStatus.jsx.
 *
 * Filters: Session, Application Status, Class, Payment Status, Month,
 *          Registration Status, Student Type
 *
 * Actions per row:
 *   - "Go to Form"       — always visible
 *   - "Confirm"          — hidden when AdmissionStatus === "1"
 *   - "Update Payment"   — hidden when paymentStatus === "Success"
 *   - "Download" (form)  — always visible
 *
 * Modals:
 *   1. Confirm Registration  → Admission No, Concession Group, Section, Admission Date
 *   2. Update Payment Status → Order Id, Receipt No, Payment Date, Amount, PayMode
 *
 * Columns: S.No, actions, Form Download, Reg No, Reg Phone, Applied Class,
 *          Name, DOB, Email, Gender, Father Name, Father Phone, Mother Name,
 *          Mother Phone, Address, Contact Person, Contact Phone, Stream,
 *          Student Type, Form Status, Reg Date, Order Id, Payment Status,
 *          Amount, Payment Date, Settlement Date, Session, Alloted Admno
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, AlertCircle, X, Check, Loader2,
  ChevronDown, ChevronRight, SlidersHorizontal, Search,
  FileSpreadsheet, Download, Phone, Mail, Calendar,
  MapPin, BookOpen, Users, CreditCard, Clock, Hash,
  User, Info, ClipboardList, CheckCircle2, XCircle,
  BarChart3, Layers, ExternalLink, BadgeCheck,
  ReceiptText, ArrowRightCircle, Building2, ShieldAlert,
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const MONTHS = [
  { value: '', label: '--All Months--' },
  ...['January','February','March','April','May','June',
      'July','August','September','October','November','December']
    .map((m, i) => ({ value: String(i + 1), label: m })),
]

const CLASSES = [
  '--All Classes--','Nursery','LKG','UKG',
  'Class I','Class II','Class III','Class IV','Class V',
  'Class VI','Class VII','Class VIII','Class IX','Class X',
  'Class XI','Class XII',
]

const REG_STATUS_OPTIONS = [
  { value: 'Accept',     label: 'Accept'      },
  { value: 'Confirm',    label: 'Confirm'     },
  { value: 'Reject',     label: 'Reject'      },
  { value: 'All',        label: 'All'         },
  { value: 'Not Select', label: 'Not Select'  },
]

// All toggleable columns
const ALL_COLUMNS = [
  { key: 'registrationNO',  label: 'Reg No'           },
  { key: 'regPhone',        label: 'Reg Phone'        },
  { key: 'class',           label: 'Applied Class'    },
  { key: 'Name',            label: 'Name'             },
  { key: 'dob',             label: 'DOB'              },
  { key: 'studentEmail',    label: 'Email'            },
  { key: 'gender',          label: 'Gender'           },
  { key: 'FatherName',      label: 'Father Name'      },
  { key: 'fatherMobile',    label: 'Father Phone'     },
  { key: 'motherName',      label: 'Mother Name'      },
  { key: 'motherPhone',     label: 'Mother Phone'     },
  { key: 'residentialAddr', label: 'Address'          },
  { key: 'contactPerName',  label: 'Contact Person'   },
  { key: 'contactPhone',    label: 'Contact Phone'    },
  { key: 'stream',          label: 'Stream'           },
  { key: 'studentType',     label: 'Student Type'     },
  { key: 'formStatus',      label: 'Form Status'      },
  { key: 'applicationDate', label: 'Reg Date'         },
  { key: 'paymentOrderId',  label: 'Order Id'         },
  { key: 'paymentStatus',   label: 'Payment Status'   },
  { key: 'paymentAmount',   label: 'Amount'           },
  { key: 'paymentDate',     label: 'Payment Date'     },
  { key: 'settlementDate',  label: 'Settlement Date'  },
  { key: 'session',         label: 'Session'          },
  { key: 'allotedadmno',    label: 'Alloted Adm No'   },
]

const DEFAULT_VISIBLE = new Set([
  'registrationNO','regPhone','class','Name','gender',
  'formStatus','applicationDate','paymentStatus','paymentAmount','allotedadmno',
])

// ─── DUMMY DATA ───────────────────────────────────────────────────────────────

const DUMMY_ROWS = [
  {
    registrationNO: 'REG2025001', classID: 'cls9',   regPhone: '9876543210',
    class: 'Class IX',   Name: 'Aarav Sharma',  dob: '15-Mar-2010',
    studentEmail: 'aarav@email.com',  gender: 'Male',
    FatherName: 'Ramesh Sharma',      fatherMobile: '9812345678',
    motherName: 'Sunita Sharma',      motherPhone: '9823456789',
    residentialAddr: '12, Rajpur Road, Dehradun',
    contactPerName: 'Ramesh Sharma',  contactPhone: '9812345678',
    stream: 'Science',    studentType: 'External',
    formStatus: 'Completed',          applicationDate: '05-Apr-2025',
    paymentOrderId: 'ORD20250001',    paymentStatus: 'Success',
    paymentDate: '05-Apr-2025',       settlementDate: '06-Apr-2025',
    paymentAmount: '500',             session: '2025-26',
    AdmissionStatus: '0',             admissionNo: '',
    allotedadmno: '',                 registrationStatus: 'Accept',
  },
  {
    registrationNO: 'REG2025002', classID: 'cls10',  regPhone: '9765432109',
    class: 'Class X',    Name: 'Priya Verma',   dob: '22-Jul-2009',
    studentEmail: 'priya.v@email.com', gender: 'Female',
    FatherName: 'Suresh Verma',       fatherMobile: '9734567890',
    motherName: 'Kavita Verma',       motherPhone: '9745678901',
    residentialAddr: '45, Gandhi Nagar, Dehradun',
    contactPerName: 'Suresh Verma',   contactPhone: '9734567890',
    stream: 'Commerce',   studentType: 'Internal',
    formStatus: 'Completed',          applicationDate: '06-Apr-2025',
    paymentOrderId: 'ORD20250002',    paymentStatus: 'Success',
    paymentDate: '06-Apr-2025',       settlementDate: '07-Apr-2025',
    paymentAmount: '500',             session: '2025-26',
    AdmissionStatus: '1',             admissionNo: 'ADM2025002',
    allotedadmno: 'ADM2025002',       registrationStatus: 'Confirm',
  },
  {
    registrationNO: 'REG2025003', classID: 'cls1',   regPhone: '9654321098',
    class: 'Class I',    Name: 'Rohan Gupta',   dob: '10-Jan-2018',
    studentEmail: '',                  gender: 'Male',
    FatherName: 'Ajay Gupta',         fatherMobile: '9623456789',
    motherName: 'Meena Gupta',        motherPhone: '9634567890',
    residentialAddr: '7, Patel Nagar, Dehradun',
    contactPerName: 'Ajay Gupta',     contactPhone: '9623456789',
    stream: '',           studentType: 'External',
    formStatus: 'Started',            applicationDate: '07-Apr-2025',
    paymentOrderId: '',               paymentStatus: 'Pending',
    paymentDate: '',                  settlementDate: '',
    paymentAmount: '0',               session: '2025-26',
    AdmissionStatus: '0',             admissionNo: '',
    allotedadmno: '',                 registrationStatus: 'Not Select',
  },
  {
    registrationNO: 'REG2025004', classID: 'cls11',  regPhone: '9543210987',
    class: 'Class XI',   Name: 'Ananya Singh',  dob: '30-Sep-2008',
    studentEmail: 'ananya@email.com',  gender: 'Female',
    FatherName: 'Vikram Singh',       fatherMobile: '9512345678',
    motherName: 'Rekha Singh',        motherPhone: '9523456789',
    residentialAddr: '88, Vasant Vihar, Dehradun',
    contactPerName: 'Vikram Singh',   contactPhone: '9512345678',
    stream: 'Science',    studentType: 'External',
    formStatus: 'Completed',          applicationDate: '08-Apr-2025',
    paymentOrderId: 'ORD20250004',    paymentStatus: 'Success',
    paymentDate: '08-Apr-2025',       settlementDate: '09-Apr-2025',
    paymentAmount: '750',             session: '2025-26',
    AdmissionStatus: '0',             admissionNo: '',
    allotedadmno: '',                 registrationStatus: 'Reject',
  },
  {
    registrationNO: 'REG2025005', classID: 'clsNur', regPhone: '9432109876',
    class: 'Nursery',    Name: 'Kabir Joshi',   dob: '18-May-2021',
    studentEmail: '',                  gender: 'Male',
    FatherName: 'Nitin Joshi',        fatherMobile: '9412345678',
    motherName: 'Pooja Joshi',        motherPhone: '9423456789',
    residentialAddr: '3, Indira Nagar, Dehradun',
    contactPerName: 'Nitin Joshi',    contactPhone: '9412345678',
    stream: '',           studentType: 'External',
    formStatus: 'Completed',          applicationDate: '09-Apr-2025',
    paymentOrderId: 'ORD20250005',    paymentStatus: 'Success',
    paymentDate: '09-Apr-2025',       settlementDate: '10-Apr-2025',
    paymentAmount: '300',             session: '2025-26',
    AdmissionStatus: '0',             admissionNo: '',
    allotedadmno: '',                 registrationStatus: 'Accept',
  },
  {
    registrationNO: 'REG2025006', classID: 'cls6',   regPhone: '9321098765',
    class: 'Class VI',   Name: 'Diya Rawat',    dob: '14-Dec-2013',
    studentEmail: 'diya.r@email.com',  gender: 'Female',
    FatherName: 'Mohan Rawat',        fatherMobile: '9312345678',
    motherName: 'Lata Rawat',         motherPhone: '9323456789',
    residentialAddr: '56, Race Course, Dehradun',
    contactPerName: 'Mohan Rawat',    contactPhone: '9312345678',
    stream: '',           studentType: 'Internal',
    formStatus: 'Completed',          applicationDate: '10-Apr-2025',
    paymentOrderId: 'ORD20250006',    paymentStatus: 'Success',
    paymentDate: '10-Apr-2025',       settlementDate: '11-Apr-2025',
    paymentAmount: '500',             session: '2025-26',
    AdmissionStatus: '0',             admissionNo: '',
    allotedadmno: '',                 registrationStatus: 'Accept',
  },
  {
    registrationNO: 'REG2025007', classID: 'cls12',  regPhone: '9210987654',
    class: 'Class XII',  Name: 'Arjun Negi',    dob: '02-Feb-2007',
    studentEmail: 'arjun.n@email.com', gender: 'Male',
    FatherName: 'Harin Negi',         fatherMobile: '9212345678',
    motherName: 'Seema Negi',         motherPhone: '9223456789',
    residentialAddr: '21, Chakrata Road, Dehradun',
    contactPerName: 'Harin Negi',     contactPhone: '9212345678',
    stream: 'Arts',       studentType: 'External',
    formStatus: 'Started',            applicationDate: '11-Apr-2025',
    paymentOrderId: '',               paymentStatus: 'Pending',
    paymentDate: '',                  settlementDate: '',
    paymentAmount: '0',               session: '2025-26',
    AdmissionStatus: '0',             admissionNo: '',
    allotedadmno: '',                 registrationStatus: 'Not Select',
  },
  {
    registrationNO: 'REG2025008', classID: 'clsLKG', regPhone: '9109876543',
    class: 'LKG',        Name: 'Mira Bisht',    dob: '25-Aug-2020',
    studentEmail: '',                  gender: 'Female',
    FatherName: 'Deepak Bisht',       fatherMobile: '9112345678',
    motherName: 'Neha Bisht',         motherPhone: '9123456789',
    residentialAddr: '9, Sahastradhara Road, Dehradun',
    contactPerName: 'Deepak Bisht',   contactPhone: '9112345678',
    stream: '',           studentType: 'External',
    formStatus: 'Completed',          applicationDate: '12-Apr-2025',
    paymentOrderId: 'ORD20250008',    paymentStatus: 'Success',
    paymentDate: '12-Apr-2025',       settlementDate: '13-Apr-2025',
    paymentAmount: '300',             session: '2025-26',
    AdmissionStatus: '0',             admissionNo: '',
    allotedadmno: '',                 registrationStatus: 'Accept',
  },
]

// ─── BADGE / STATUS CONFIG ────────────────────────────────────────────────────

const PAYMENT_CONFIG = {
  Success: { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400' },
  Pending: { bg: 'bg-amber-100 dark:bg-amber-500/20',     text: 'text-amber-700 dark:text-amber-400'     },
}

const FORM_CONFIG = {
  Completed: { bg: 'bg-blue-100 dark:bg-blue-500/20',   text: 'text-blue-700 dark:text-blue-400'   },
  Started:   { bg: 'bg-slate-100 dark:bg-slate-700',    text: 'text-slate-600 dark:text-slate-400' },
}

const REG_STATUS_CONFIG = {
  Accept:      { bg: 'bg-emerald-100 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-400', icon: CheckCircle2  },
  Confirm:     { bg: 'bg-blue-100 dark:bg-blue-500/20',       text: 'text-blue-700 dark:text-blue-400',       icon: BadgeCheck    },
  Reject:      { bg: 'bg-rose-100 dark:bg-rose-500/20',       text: 'text-rose-700 dark:text-rose-400',       icon: XCircle       },
  'All':       { bg: 'bg-slate-100 dark:bg-slate-700',        text: 'text-slate-600 dark:text-slate-400',     icon: Users         },
  'Not Select':{ bg: 'bg-amber-100 dark:bg-amber-500/15',     text: 'text-amber-700 dark:text-amber-400',     icon: Clock         },
}

function StatusBadge({ value, map }) {
  const cfg  = map[value] || { bg: 'bg-slate-100', text: 'text-slate-500' }
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      {value || '—'}
    </span>
  )
}

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled }) {
  return (
    <div className="relative">
      <select
        value={value} onChange={onChange} disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
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
      <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
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

function TextInput({ value, onChange, type = 'text', disabled, placeholder, maxLength }) {
  return (
    <input
      type={type} value={value} onChange={onChange} disabled={disabled}
      placeholder={placeholder} maxLength={maxLength}
      className="w-full px-3 py-2 text-[13px] rounded-lg border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
        bg-white dark:bg-[#1e2238] text-slate-800 dark:text-slate-200 outline-none
        focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:focus:border-indigo-400
        disabled:opacity-50 disabled:cursor-not-allowed transition-all"
    />
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  )
}

// ─── CONFIRM REGISTRATION MODAL ───────────────────────────────────────────────

function ConfirmRegModal({ open, regNo, onConfirm, onClose }) {
  const [admNo,    setAdmNo]    = useState('')
  const [concGrp,  setConcGrp]  = useState('')
  const [section,  setSection]  = useState('')
  const [admDate,  setAdmDate]  = useState('')

  const handleConfirm = () => {
    onConfirm({ regNo, admNo, concGrp, section, admDate })
    setAdmNo(''); setConcGrp(''); setSection(''); setAdmDate('')
    onClose()
  }

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn .2s ease' }}>
        <style>{`@keyframes fadeIn{from{opacity:0;transform:scale(.97)}to{opacity:1;transform:scale(1)}}`}</style>
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-[#1e2238] dark:to-[#1a1f35] border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                <BadgeCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </span>
              <div>
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Confirm Registration</p>
                <p className="text-[11px] text-slate-400">Reg No: {regNo}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Body */}
          <div className="px-5 py-4 space-y-3">
            <Field label="Admission No">
              <TextInput value={admNo} onChange={e => setAdmNo(e.target.value)} />
            </Field>
            <Field label="Concession Group">
              <NativeSelect value={concGrp} onChange={e => setConcGrp(e.target.value)} placeholder="Select">
                {['None','Staff Ward','RTE','Defence','SC/ST'].map(g => <option key={g} value={g}>{g}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Section">
              <NativeSelect value={section} onChange={e => setSection(e.target.value)} placeholder="Select">
                {['A','B','C','D'].map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Admission Date">
              <TextInput type="date" value={admDate} onChange={e => setAdmDate(e.target.value)} />
            </Field>
          </div>
          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95">
              <Check className="w-4 h-4" />Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── UPDATE PAYMENT STATUS MODAL ──────────────────────────────────────────────

function UpdatePaymentModal({ open, regNo, onUpdate, onClose }) {
  const [orderId,  setOrderId]  = useState('')
  const [receipt,  setReceipt]  = useState('')
  const [payDate,  setPayDate]  = useState('')
  const [amount,   setAmount]   = useState('')
  const [payMode,  setPayMode]  = useState('')

  const handleUpdate = () => {
    onUpdate({ regNo, orderId, receipt, payDate, amount, payMode })
    setOrderId(''); setReceipt(''); setPayDate(''); setAmount(''); setPayMode('')
    onClose()
  }

  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ animation: 'fadeIn .2s ease' }}>
        <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-[#1e2238] dark:to-[#1a1f35] border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </span>
              <div>
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Update Payment Status</p>
                <p className="text-[11px] text-slate-400">Reg No: {regNo}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>
          {/* Body */}
          <div className="px-5 py-4 space-y-3">
            <Field label="Order Id">
              <TextInput value={orderId} onChange={e => setOrderId(e.target.value)} maxLength={20} />
            </Field>
            <Field label="Receipt No">
              <TextInput value={receipt} onChange={e => setReceipt(e.target.value)} maxLength={20} />
            </Field>
            <Field label="Payment Date">
              <TextInput type="date" value={payDate} onChange={e => setPayDate(e.target.value)} />
            </Field>
            <Field label="Payment Amount">
              <TextInput
                value={amount}
                onChange={e => { if (/^\d*\.?\d*$/.test(e.target.value)) setAmount(e.target.value) }}
                maxLength={4}
                placeholder="0"
              />
            </Field>
            <Field label="Pay Mode">
              <NativeSelect value={payMode} onChange={e => setPayMode(e.target.value)} placeholder="Select">
                {['Cash','Cheque','Online','DD','NEFT','UPI'].map(m => <option key={m} value={m}>{m}</option>)}
              </NativeSelect>
            </Field>
          </div>
          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={handleUpdate}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-amber-500 hover:bg-amber-600 transition-all active:scale-95">
              <Check className="w-4 h-4" />Update
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── COLUMN TOGGLE PANEL ──────────────────────────────────────────────────────

function ColumnToggle({ visible, setVisible }) {
  const allOn = ALL_COLUMNS.every(c => visible.has(c.key))

  const toggleAll = () => {
    if (allOn) setVisible(new Set())
    else setVisible(new Set(ALL_COLUMNS.map(c => c.key)))
  }

  const toggle = key => {
    setVisible(prev => {
      const s = new Set(prev)
      s.has(key) ? s.delete(key) : s.add(key)
      return s
    })
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-violet-500 flex-shrink-0" />
        <Layers className="w-4 h-4 text-violet-600 dark:text-violet-400 flex-shrink-0" />
        <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200 flex-1">Column Visibility</span>
        <label className="flex items-center gap-2 cursor-pointer">
          <div onClick={toggleAll}
            className={`w-9 h-5 rounded-full transition-all flex items-center px-0.5 ${allOn ? 'bg-violet-500' : 'bg-slate-300 dark:bg-slate-600'}`}>
            <span className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${allOn ? 'translate-x-4' : ''}`} />
          </div>
          <span className="text-[12px] font-semibold text-slate-500 dark:text-slate-400">Select All</span>
        </label>
      </div>
      <div className="px-5 py-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-2">
          {ALL_COLUMNS.map(col => (
            <label key={col.key} className="flex items-center gap-2 cursor-pointer select-none">
              <div onClick={() => toggle(col.key)}
                className={`w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border transition-all ${
                  visible.has(col.key)
                    ? 'bg-blue-500 border-blue-500'
                    : 'bg-white dark:bg-[#1e2238] border-slate-300 dark:border-slate-600'
                }`}>
                {visible.has(col.key) && <Check className="w-2.5 h-2.5 text-white" />}
              </div>
              <span className="text-[12px] text-slate-600 dark:text-slate-400 truncate">{col.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function MobileFilterDrawer({ open, onClose, filters, setFilters, onShow, loading, errors }) {
  if (!open) return null
  const set = (k, v) => setFilters(p => ({ ...p, [k]: v }))

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl max-h-[88vh] flex flex-col"
        style={{ animation: 'drawerUp .25s ease' }}>
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex-shrink-0">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 space-y-4 overflow-y-auto flex-1">
          <Field label="Session" error={errors.session} required>
            <NativeSelect value={filters.session} onChange={e => set('session', e.target.value)} placeholder="-- Select Session --" error={errors.session}>
              {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Application Status">
            <NativeSelect value={filters.appStatus} onChange={e => set('appStatus', e.target.value)}>
              <option value="">--Select All--</option>
              <option value="Completed">Completed</option>
              <option value="Started">Started</option>
            </NativeSelect>
          </Field>
          <Field label="Class">
            <NativeSelect value={filters.class} onChange={e => set('class', e.target.value)}>
              {CLASSES.map(c => <option key={c} value={c === '--All Classes--' ? '' : c}>{c}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Payment Status">
            <NativeSelect value={filters.payStatus} onChange={e => set('payStatus', e.target.value)}>
              <option value="">--Select All--</option>
              <option value="Success">Success</option>
              <option value="Pending">Pending</option>
            </NativeSelect>
          </Field>
          <Field label="Month">
            <NativeSelect value={filters.month} onChange={e => set('month', e.target.value)}>
              {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Registration Status">
            <NativeSelect value={filters.regStatus} onChange={e => set('regStatus', e.target.value)}>
              {REG_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </NativeSelect>
          </Field>
          <Field label="Student Type">
            <NativeSelect value={filters.studentType} onChange={e => set('studentType', e.target.value)}>
              <option value="">Select All</option>
              <option value="External">External</option>
              <option value="Internal">Internal</option>
            </NativeSelect>
          </Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 flex-shrink-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── SUMMARY CARD ─────────────────────────────────────────────────────────────

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
        <p className="text-[20px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">{value.toLocaleString()}</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{label}</p>
      </div>
    </div>
  )
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────

function MobileCard({ row, onConfirm, onUpdatePayment }) {
  const [expanded, setExpanded] = useState(false)
  const regStatusCfg = REG_STATUS_CONFIG[row.registrationStatus] || REG_STATUS_CONFIG['Not Select']
  const RSIcon       = regStatusCfg.icon
  const showConfirm  = row.AdmissionStatus !== '1'
  const showUpdatePay= row.paymentStatus   !== 'Success'

  const Detail = ({ icon: Icon, label, value }) => {
    if (!value) return null
    return (
      <div className="flex items-start gap-2">
        <Icon className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{label}</p>
          <p className="text-[12px] text-slate-700 dark:text-slate-200 break-all">{value}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button type="button" onClick={() => setExpanded(p => !p)}
        className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 truncate">{row.Name}</p>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold flex-shrink-0 ${regStatusCfg.bg} ${regStatusCfg.text}`}>
              <RSIcon className="w-3 h-3" />{row.registrationStatus}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[11px] text-slate-400">{row.registrationNO}</span>
            <span className="text-[11px] text-slate-300 dark:text-slate-600">·</span>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">{row.class}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <StatusBadge value={row.formStatus}    map={FORM_CONFIG}    />
            <StatusBadge value={row.paymentStatus} map={PAYMENT_CONFIG} />
            {row.paymentAmount && row.paymentAmount !== '0' && (
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">₹{row.paymentAmount}</span>
            )}
            {row.allotedadmno && (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Adm: {row.allotedadmno}</span>
            )}
          </div>
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 mt-1 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Action Row */}
      <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
        {/* Go to Form — always */}
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-500/20 active:scale-95 transition-all border border-blue-200 dark:border-blue-500/25">
          <ExternalLink className="w-3.5 h-3.5" />Go to Form
        </button>

        {/* Confirm — hidden when AdmissionStatus === "1" */}
        {showConfirm && (
          <button onClick={() => onConfirm(row.registrationNO)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 hover:bg-emerald-100 active:scale-95 transition-all border border-emerald-200 dark:border-emerald-500/25">
            <BadgeCheck className="w-3.5 h-3.5" />Confirm
          </button>
        )}

        {/* Update Payment — hidden when paymentStatus === "Success" */}
        {showUpdatePay && (
          <button onClick={() => onUpdatePayment(row.registrationNO)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 hover:bg-amber-100 active:scale-95 transition-all border border-amber-200 dark:border-amber-500/25">
            <CreditCard className="w-3.5 h-3.5" />Update Pay
          </button>
        )}

        {/* Download Form — always */}
        <button
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all">
          <Download className="w-3.5 h-3.5" />Form
        </button>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4">
          <div className="grid grid-cols-2 gap-3">
            <Detail icon={Phone}      label="Phone"          value={row.regPhone}        />
            <Detail icon={Calendar}   label="DOB"            value={row.dob}             />
            <Detail icon={Mail}       label="Email"          value={row.studentEmail}    />
            <Detail icon={User}       label="Gender"         value={row.gender}          />
            <Detail icon={User}       label="Father"         value={row.FatherName}      />
            <Detail icon={Phone}      label="Father Ph."     value={row.fatherMobile}    />
            <Detail icon={User}       label="Mother"         value={row.motherName}      />
            <Detail icon={Phone}      label="Mother Ph."     value={row.motherPhone}     />
            <Detail icon={BookOpen}   label="Stream"         value={row.stream}          />
            <Detail icon={Calendar}   label="Reg Date"       value={row.applicationDate} />
            <Detail icon={Hash}       label="Order Id"       value={row.paymentOrderId}  />
            <Detail icon={CreditCard} label="Pay Date"       value={row.paymentDate}     />
            <Detail icon={Calendar}   label="Settlement"     value={row.settlementDate}  />
            <Detail icon={Hash}       label="Session"        value={row.session}         />
          </div>
          {row.residentialAddr && (
            <div className="mt-3 flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Address</p>
                <p className="text-[12px] text-slate-700 dark:text-slate-200">{row.residentialAddr}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── DESKTOP TABLE ────────────────────────────────────────────────────────────

function DesktopTable({ rows, visibleCols, onConfirm, onUpdatePayment }) {
  const colDefs = ALL_COLUMNS.filter(c => visibleCols.has(c.key))

  const CellValue = ({ col, row }) => {
    switch (col.key) {
      case 'paymentStatus':
        return <StatusBadge value={row.paymentStatus} map={PAYMENT_CONFIG} />
      case 'formStatus':
        return <StatusBadge value={row.formStatus} map={FORM_CONFIG} />
      case 'registrationStatus':
        return <StatusBadge value={row.registrationStatus} map={REG_STATUS_CONFIG} />
      case 'paymentAmount':
        return <span className="font-semibold text-slate-700 dark:text-slate-200">
          {row.paymentAmount && row.paymentAmount !== '0' ? `₹${row.paymentAmount}` : '—'}
        </span>
      case 'studentEmail':
        return <span className="text-blue-600 dark:text-blue-400 text-[12px]">{row.studentEmail || '—'}</span>
      case 'allotedadmno':
        return row.allotedadmno
          ? <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-[12px]">{row.allotedadmno}</span>
          : <span className="text-slate-300 dark:text-slate-600">—</span>
      default:
        return <span className="text-[12px] text-slate-700 dark:text-slate-300">{row[col.key] || '—'}</span>
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max">
        <thead className="sticky top-0 z-10">
          <tr className="border-b border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-slate-50 dark:bg-[#1e2238]">
            <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap w-10">S.No.</th>
            <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Actions</th>
            <th className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">Form</th>
            {colDefs.map(c => (
              <th key={c.key} className="px-4 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const showConfirm   = row.AdmissionStatus !== '1'
            const showUpdatePay = row.paymentStatus   !== 'Success'
            return (
              <tr key={row.registrationNO}
                className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                {/* S.No */}
                <td className="px-4 py-2.5 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums">{idx + 1}</td>

                {/* Actions */}
                <td className="px-3 py-2.5 text-center">
                  <div className="flex items-center gap-1 justify-center flex-wrap">
                    {/* Go to Form */}
                    <button
                      className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20 transition-colors border border-blue-200 dark:border-blue-500/25 whitespace-nowrap">
                      <ExternalLink className="w-3 h-3" />Go to Form
                    </button>
                    {/* Confirm */}
                    {showConfirm && (
                      <button onClick={() => onConfirm(row.registrationNO)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500/20 transition-colors border border-emerald-200 dark:border-emerald-500/25 whitespace-nowrap">
                        <BadgeCheck className="w-3 h-3" />Confirm
                      </button>
                    )}
                    {/* Update Payment */}
                    {showUpdatePay && (
                      <button onClick={() => onUpdatePayment(row.registrationNO)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 transition-colors border border-amber-200 dark:border-amber-500/25 whitespace-nowrap">
                        <CreditCard className="w-3 h-3" />Update Pay
                      </button>
                    )}
                  </div>
                </td>

                {/* Form Download */}
                <td className="px-4 py-2.5 text-center">
                  <button className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors border border-slate-200 dark:border-slate-600 mx-auto">
                    <Download className="w-3 h-3" />Download
                  </button>
                </td>

                {/* Dynamic columns */}
                {colDefs.map(c => (
                  <td key={c.key} className="px-4 py-2.5 text-center max-w-[180px] truncate">
                    <CellValue col={c} row={row} />
                  </td>
                ))}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function OnlineRegistrationReport() {
  // Filters
  const [filters, setFilters] = useState({
    session: '', appStatus: 'Completed', class: '', payStatus: 'Success',
    month: '', regStatus: 'Accept', studentType: '',
  })
  const [errors,      setErrors]      = useState({})
  const [search,      setSearch]      = useState('')
  const [filterOpen,  setFilterOpen]  = useState(false)

  // Data
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [shown,       setShown]       = useState(false)
  const [toast,       setToast]       = useState(null)

  // Column visibility
  const [visibleCols, setVisibleCols] = useState(new Set(DEFAULT_VISIBLE))

  // Modals
  const [confirmModal,  setConfirmModal]  = useState({ open: false, regNo: null })
  const [paymentModal,  setPaymentModal]  = useState({ open: false, regNo: null })

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Show Report ────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    const err = {}
    if (!filters.session) err.session = 'Please select a session'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)
    setSearch('')
    setTimeout(() => {
      let data = [...DUMMY_ROWS]
      if (filters.appStatus)   data = data.filter(r => r.formStatus           === filters.appStatus)
      if (filters.class)       data = data.filter(r => r.class                === filters.class)
      if (filters.payStatus)   data = data.filter(r => r.paymentStatus        === filters.payStatus)
      if (filters.studentType) data = data.filter(r => r.studentType          === filters.studentType)
      if (filters.regStatus && filters.regStatus !== 'All')
                               data = data.filter(r => r.registrationStatus   === filters.regStatus)
      setRows(data)
      setShown(true)
      setLoading(false)
      showToast(`${data.length} registration(s) loaded for ${filters.session}.`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', appStatus: 'Completed', class: '', payStatus: 'Success', month: '', regStatus: 'Accept', studentType: '' })
    setRows([]); setSearch(''); setErrors({}); setShown(false)
  }

  // ── Excel ──────────────────────────────────────────────────────────────────
  const handleExcel = () => {
    if (!rows.length) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Confirm ────────────────────────────────────────────────────────────────
  const handleConfirmAction = ({ regNo, admNo }) => {
    setRows(prev => prev.map(r =>
      r.registrationNO === regNo
        ? { ...r, AdmissionStatus: '1', allotedadmno: admNo || r.allotedadmno, registrationStatus: 'Confirm' }
        : r
    ))
    showToast(`Registration ${regNo} confirmed successfully.`)
  }

  // ── Update Payment ─────────────────────────────────────────────────────────
  const handlePaymentUpdate = ({ regNo, orderId, payDate, amount }) => {
    setRows(prev => prev.map(r =>
      r.registrationNO === regNo
        ? { ...r, paymentStatus: 'Success', paymentOrderId: orderId, paymentDate: payDate, paymentAmount: amount || r.paymentAmount }
        : r
    ))
    showToast(`Payment updated for ${regNo}.`)
  }

  // ── Search filter ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.Name?.toLowerCase().includes(q) ||
      r.registrationNO?.toLowerCase().includes(q) ||
      r.class?.toLowerCase().includes(q) ||
      r.regPhone?.includes(q) ||
      r.studentEmail?.toLowerCase().includes(q) ||
      r.allotedadmno?.toLowerCase().includes(q)
    )
  }, [rows, search])

  // ── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     filtered.length,
    confirmed: filtered.filter(r => r.registrationStatus === 'Confirm').length,
    pending:   filtered.filter(r => r.paymentStatus      !== 'Success').length,
    accepted:  filtered.filter(r => r.registrationStatus === 'Accept').length,
  }), [filtered])

  const activeFilterCount = Object.entries(filters)
    .filter(([k, v]) => v && !['appStatus','payStatus','regStatus'].includes(k)).length
  const hasResults = shown && rows.length > 0

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Online Registration Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View and manage registration applications — confirm, update payment, download forms.
          </p>
        </div>
        {hasResults && (
          <button onClick={handleExcel} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        )}
      </div>

      {/* ── DESKTOP Filters ─────────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">Search Filters</span>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
            <Field label="Session" error={errors.session} required>
              <NativeSelect value={filters.session}
                onChange={e => { setFilters(p => ({...p, session: e.target.value})); setErrors(p=>({...p,session:undefined})) }}
                placeholder="-- Select --" error={errors.session}>
                {SESSIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="App. Status">
              <NativeSelect value={filters.appStatus} onChange={e => setFilters(p=>({...p,appStatus:e.target.value}))}>
                <option value="">--All--</option>
                <option value="Completed">Completed</option>
                <option value="Started">Started</option>
              </NativeSelect>
            </Field>
            <Field label="Class">
              <NativeSelect value={filters.class} onChange={e => setFilters(p=>({...p,class:e.target.value}))}>
                {CLASSES.map(c => <option key={c} value={c==='--All Classes--'?'':c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Payment Status">
              <NativeSelect value={filters.payStatus} onChange={e => setFilters(p=>({...p,payStatus:e.target.value}))}>
                <option value="">--All--</option>
                <option value="Success">Success</option>
                <option value="Pending">Pending</option>
              </NativeSelect>
            </Field>
            <Field label="Month">
              <NativeSelect value={filters.month} onChange={e => setFilters(p=>({...p,month:e.target.value}))}>
                {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Reg. Status">
              <NativeSelect value={filters.regStatus} onChange={e => setFilters(p=>({...p,regStatus:e.target.value}))}>
                {REG_STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Student Type">
              <NativeSelect value={filters.studentType} onChange={e => setFilters(p=>({...p,studentType:e.target.value}))}>
                <option value="">All</option>
                <option value="External">External</option>
                <option value="Internal">Internal</option>
              </NativeSelect>
            </Field>
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={handleShow} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show Report
            </button>
            <button onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />Reset
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ──────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          {filters.session ? `Session: ${filters.session}` : 'Set Filters'}
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {hasResults && (
          <>
            <button onClick={handleExcel} disabled={exporting}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white disabled:opacity-70">
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            </button>
            <button onClick={handleReset}
              className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <RefreshCw className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      <MobileFilterDrawer
        open={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} setFilters={setFilters}
        onShow={handleShow} loading={loading} errors={errors}
      />

      {/* ── Loading Skeleton ───────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ────────────────────────────────────────────────────────── */}
      {hasResults && !loading && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <SummaryCard icon={Users}      label="Total Applications" value={stats.total}     color="blue"    />
            <SummaryCard icon={BadgeCheck} label="Confirmed"          value={stats.confirmed} color="emerald" />
            <SummaryCard icon={Clock}      label="Payment Pending"    value={stats.pending}   color="amber"   />
            <SummaryCard icon={ArrowRightCircle} label="Accepted"     value={stats.accepted}  color="violet"  />
          </div>

          {/* Column Toggle */}
          <ColumnToggle visible={visibleCols} setVisible={setVisibleCols} />

          {/* Results Card */}
          <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
              <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
                <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
                <ReceiptText className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Registration List</span>
                <span className="text-[13px] text-slate-400 dark:text-slate-500">· {filters.session}</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                  {filtered.length} record{filtered.length !== 1 ? 's' : ''}
                </span>
              </div>
              {/* Search */}
              <div className="relative w-full sm:w-64 flex-shrink-0">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Name, Reg No, Phone, Adm No…"
                  className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all bg-white text-slate-700 border-slate-200 placeholder-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:placeholder-slate-600 dark:focus:border-indigo-400"
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
                "Confirm" is hidden once a registration is confirmed (AdmissionStatus=1). "Update Payment" is hidden when payment is Success.
              </p>
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden md:block">
              {filtered.length === 0
                ? <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600"><Search className="w-6 h-6 opacity-40" /><span className="text-[13px]">No records match your search.</span></div>
                : <DesktopTable rows={filtered} visibleCols={visibleCols} onConfirm={r => setConfirmModal({ open: true, regNo: r })} onUpdatePayment={r => setPaymentModal({ open: true, regNo: r })} />
              }
            </div>

            {/* MOBILE CARDS */}
            <div className="md:hidden p-4 space-y-3">
              {filtered.length === 0
                ? <div className="flex flex-col items-center justify-center h-24 gap-2 text-slate-400 dark:text-slate-600"><Search className="w-6 h-6 opacity-40" /><span className="text-[13px]">No records match your search.</span></div>
                : (
                  <>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1.5 pb-1">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />Tap a card to see full student details.
                    </p>
                    {filtered.map(row => (
                      <MobileCard
                        key={row.registrationNO} row={row}
                        onConfirm={r => setConfirmModal({ open: true, regNo: r })}
                        onUpdatePayment={r => setPaymentModal({ open: true, regNo: r })}
                      />
                    ))}
                  </>
                )
              }
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
              <p className="text-[12px] text-slate-400 dark:text-slate-500">
                Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
                <span className="font-semibold text-slate-700 dark:text-slate-300">{rows.length}</span> records
              </p>
              {search && (
                <button onClick={() => setSearch('')} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" />Clear search
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ── Empty State ─────────────────────────────────────────────────────── */}
      {!hasResults && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <BarChart3 className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Select filters and click <strong>Show Report</strong> to load registrations.
            </p>
          </div>
        </div>
      )}

      {/* Modals */}
      <ConfirmRegModal
        open={confirmModal.open} regNo={confirmModal.regNo}
        onConfirm={handleConfirmAction}
        onClose={() => setConfirmModal({ open: false, regNo: null })}
      />
      <UpdatePaymentModal
        open={paymentModal.open} regNo={paymentModal.regNo}
        onUpdate={handlePaymentUpdate}
        onClose={() => setPaymentModal({ open: false, regNo: null })}
      />

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
