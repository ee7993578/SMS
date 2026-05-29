/**
 * OnlineRegistrationReportStatus.jsx
 * Folder: src/pages/Student/Reports/OnlineRegistrationReportStatus.jsx
 *
 * Converts legacy ASPX "Online Registration Report Status" to fully-responsive
 * React + Tailwind.
 *
 * Features:
 *  - 6 filters: Session, App Status, Class, Payment Status, Month, Student Type
 *  - Column visibility toggle (Select All + individual checkboxes)
 *  - Accept modal: Admission No, Section, Admission Date, Deposit Date,
 *    Deposit Amount, Transfer to Advance, PayMode, Bank, Transaction No
 *  - Reject with confirmation toast
 *  - Form download per row
 *  - Excel export
 *  - Desktop: wide scrollable table
 *  - Mobile: card layout, no horizontal scroll
 */

import { useState, useMemo, useCallback } from 'react'
import {
  Filter, RefreshCw, Eye, X, Check, Loader2, ChevronDown,
  FileSpreadsheet, SlidersHorizontal, Search, Info,
  AlertCircle, Download, CheckCircle2, XCircle,
  School2, Users, CreditCard, ClipboardList,
  Calendar, Phone, Mail, MapPin, User2, BookOpen,
  ToggleLeft, ToggleRight, ChevronRight, Columns3,
  BadgeCheck, Clock, Building2, Banknote, Hash,
} from 'lucide-react'

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const SESSIONS = ['2022-23', '2023-24', '2024-25', '2025-26']

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const CLASSES = [
  'All Classes', 'Nursery', 'LKG', 'UKG',
  'Class I', 'Class II', 'Class III', 'Class IV', 'Class V',
  'Class VI', 'Class VII', 'Class VIII', 'Class IX', 'Class X',
  'Class XI', 'Class XII',
]

const SECTIONS   = ['A', 'B', 'C', 'D']
const PAY_MODES  = ['Cash', 'Cheque', 'Online', 'DD']
const BANKS      = ['SBI', 'HDFC', 'ICICI', 'PNB', 'Axis', 'BOB']

// All possible columns — matches ASPX GridView fields
const ALL_COLUMNS = [
  { key: 'sno',           label: 'S.No.'            },
  { key: 'action',        label: 'Action'           },
  { key: 'form',          label: 'Form'             },
  { key: 'currentStatus', label: 'Current Status'   },
  { key: 'registrationNO',label: 'Reg. No.'         },
  { key: 'regPhone',      label: 'Reg. Phone'       },
  { key: 'class',         label: 'Applied Class'    },
  { key: 'Name',          label: 'Name'             },
  { key: 'dob',           label: 'DOB'              },
  { key: 'studentEmail',  label: 'Email'            },
  { key: 'gender',        label: 'Gender'           },
  { key: 'FatherName',    label: 'Father Name'      },
  { key: 'fatherMobile',  label: 'Father Phone'     },
  { key: 'motherName',    label: 'Mother Name'      },
  { key: 'motherPhone',   label: 'Mother Phone'     },
  { key: 'residentialAddr',label: 'Address'         },
  { key: 'contactPerName',label: 'Contact Person'   },
  { key: 'contactPhone',  label: 'Contact Phone'    },
  { key: 'stream',        label: 'Stream'           },
  { key: 'studentType',   label: 'Student Type'     },
  { key: 'formStatus',    label: 'Form Status'      },
  { key: 'applicationDate',label: 'Reg. Date'       },
  { key: 'paymentStatus', label: 'Payment Status'   },
  { key: 'paymentDate',   label: 'Payment Date'     },
  { key: 'paymentAmount', label: 'Amount'           },
  { key: 'session',       label: 'Session'          },
]

// Default visible columns (core set, mirrors what ASPX shows first)
const DEFAULT_VISIBLE = [
  'sno', 'action', 'form', 'currentStatus',
  'registrationNO', 'class', 'Name', 'dob',
  'gender', 'formStatus', 'paymentStatus', 'paymentAmount',
]

// ── Dummy registrations ───────────────────────────────────────────────────────
const DUMMY_STUDENTS = [
  {
    id: 1, registrationNO: 'OREG-2501', regPhone: '9876543210',
    class: 'Class VI', classID: 'cls6', Name: 'Aarav Sharma',
    dob: '12-Mar-2013', studentEmail: 'aarav@email.com', gender: 'Male',
    FatherName: 'Rakesh Sharma', fatherMobile: '9823456789',
    motherName: 'Sunita Sharma', motherPhone: '9898989898',
    residentialAddr: '12, MG Road, Dehradun', contactPerName: 'Rakesh Sharma',
    contactPhone: '9823456789', stream: 'N/A', studentType: 'External',
    formStatus: 'Completed', applicationDate: '05-Jan-2025',
    paymentStatus: 'Success', paymentDate: '05-Jan-2025',
    paymentAmount: '₹500', session: '2025-26', AdmissionStatus: 'Pending',
  },
  {
    id: 2, registrationNO: 'OREG-2502', regPhone: '9765432109',
    class: 'Class IX', classID: 'cls9', Name: 'Priya Gupta',
    dob: '22-Jul-2010', studentEmail: 'priya@email.com', gender: 'Female',
    FatherName: 'Sunil Gupta', fatherMobile: '9711234567',
    motherName: 'Meena Gupta', motherPhone: '9700000000',
    residentialAddr: '7, Civil Lines, Dehradun', contactPerName: 'Sunil Gupta',
    contactPhone: '9711234567', stream: 'Science', studentType: 'Internal',
    formStatus: 'Completed', applicationDate: '07-Jan-2025',
    paymentStatus: 'Success', paymentDate: '07-Jan-2025',
    paymentAmount: '₹500', session: '2025-26', AdmissionStatus: 'Accepted',
  },
  {
    id: 3, registrationNO: 'OREG-2503', regPhone: '9654321098',
    class: 'Class I', classID: 'cls1', Name: 'Rohit Verma',
    dob: '14-Sep-2018', studentEmail: 'rohit@email.com', gender: 'Male',
    FatherName: 'Anil Verma', fatherMobile: '9654000000',
    motherName: 'Kavita Verma', motherPhone: '9654111111',
    residentialAddr: '33, Rajpur Road, Dehradun', contactPerName: 'Anil Verma',
    contactPhone: '9654000000', stream: 'N/A', studentType: 'External',
    formStatus: 'Started', applicationDate: '10-Jan-2025',
    paymentStatus: 'Pending', paymentDate: '—', paymentAmount: '—',
    session: '2025-26', AdmissionStatus: 'Pending',
  },
  {
    id: 4, registrationNO: 'OREG-2504', regPhone: '9543210987',
    class: 'Class XI', classID: 'cls11', Name: 'Sneha Patel',
    dob: '30-Nov-2008', studentEmail: 'sneha@email.com', gender: 'Female',
    FatherName: 'Dinesh Patel', fatherMobile: '9543000000',
    motherName: 'Geeta Patel', motherPhone: '9543111111',
    residentialAddr: '5, Saharanpur Road, Dehradun', contactPerName: 'Dinesh Patel',
    contactPhone: '9543000000', stream: 'Commerce', studentType: 'External',
    formStatus: 'Completed', applicationDate: '12-Jan-2025',
    paymentStatus: 'Success', paymentDate: '12-Jan-2025',
    paymentAmount: '₹500', session: '2025-26', AdmissionStatus: 'Rejected',
  },
  {
    id: 5, registrationNO: 'OREG-2505', regPhone: '9432109876',
    class: 'Class III', classID: 'cls3', Name: 'Mohit Singh',
    dob: '19-Apr-2016', studentEmail: 'mohit@email.com', gender: 'Male',
    FatherName: 'Vikram Singh', fatherMobile: '9432000000',
    motherName: 'Pooja Singh', motherPhone: '9432111111',
    residentialAddr: '8, Haridwar Road, Dehradun', contactPerName: 'Vikram Singh',
    contactPhone: '9432000000', stream: 'N/A', studentType: 'Internal',
    formStatus: 'Completed', applicationDate: '14-Jan-2025',
    paymentStatus: 'Success', paymentDate: '14-Jan-2025',
    paymentAmount: '₹500', session: '2025-26', AdmissionStatus: 'Pending',
  },
  {
    id: 6, registrationNO: 'OREG-2506', regPhone: '9321098765',
    class: 'Class XII', classID: 'cls12', Name: 'Divya Rao',
    dob: '05-Jun-2007', studentEmail: 'divya@email.com', gender: 'Female',
    FatherName: 'Ramesh Rao', fatherMobile: '9321000000',
    motherName: 'Leela Rao', motherPhone: '9321111111',
    residentialAddr: '21, EC Road, Dehradun', contactPerName: 'Ramesh Rao',
    contactPhone: '9321000000', stream: 'Arts', studentType: 'External',
    formStatus: 'Completed', applicationDate: '16-Jan-2025',
    paymentStatus: 'Success', paymentDate: '16-Jan-2025',
    paymentAmount: '₹500', session: '2025-26', AdmissionStatus: 'Pending',
  },
  {
    id: 7, registrationNO: 'OREG-2507', regPhone: '9210987654',
    class: 'Class VIII', classID: 'cls8', Name: 'Ankur Mishra',
    dob: '28-Feb-2012', studentEmail: 'ankur@email.com', gender: 'Male',
    FatherName: 'Rajiv Mishra', fatherMobile: '9210000000',
    motherName: 'Nidhi Mishra', motherPhone: '9210111111',
    residentialAddr: '14, Patel Nagar, Dehradun', contactPerName: 'Rajiv Mishra',
    contactPhone: '9210000000', stream: 'N/A', studentType: 'External',
    formStatus: 'Started', applicationDate: '18-Jan-2025',
    paymentStatus: 'Pending', paymentDate: '—', paymentAmount: '—',
    session: '2025-26', AdmissionStatus: 'Pending',
  },
  {
    id: 8, registrationNO: 'OREG-2508', regPhone: '9109876543',
    class: 'Class X', classID: 'cls10', Name: 'Kavya Joshi',
    dob: '11-Oct-2009', studentEmail: 'kavya@email.com', gender: 'Female',
    FatherName: 'Hemant Joshi', fatherMobile: '9109000000',
    motherName: 'Asha Joshi', motherPhone: '9109111111',
    residentialAddr: '9, Race Course, Dehradun', contactPerName: 'Hemant Joshi',
    contactPhone: '9109000000', stream: 'N/A', studentType: 'Internal',
    formStatus: 'Completed', applicationDate: '20-Jan-2025',
    paymentStatus: 'Success', paymentDate: '20-Jan-2025',
    paymentAmount: '₹500', session: '2025-26', AdmissionStatus: 'Accepted',
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const STATUS_META = {
  Accepted: { color: 'emerald', label: 'Accepted' },
  Rejected: { color: 'rose',    label: 'Rejected'  },
  Pending:  { color: 'amber',   label: 'Pending'   },
}

const PAY_META = {
  Success: { color: 'emerald', label: 'Success' },
  Pending: { color: 'amber',   label: 'Pending' },
}

const FORM_META = {
  Completed: { color: 'blue',   label: 'Completed' },
  Started:   { color: 'violet', label: 'Started'   },
}

function statusBadge(val, metaMap) {
  const m = metaMap[val] || { color: 'slate', label: val || '—' }
  const map = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20',
    rose:    'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20',
    amber:   'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20',
    blue:    'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20',
    violet:  'bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500/20',
    slate:   'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
  }
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${map[m.color]}`}>
      {m.label}
    </span>
  )
}

const CLASS_COLORS = [
  { fg: '#1d4ed8', bg: '#dbeafe' }, { fg: '#7c3aed', bg: '#ede9fe' },
  { fg: '#0891b2', bg: '#cffafe' }, { fg: '#059669', bg: '#d1fae5' },
  { fg: '#d97706', bg: '#fef3c7' }, { fg: '#dc2626', bg: '#fee2e2' },
  { fg: '#0369a1', bg: '#e0f2fe' },
]
const classColor = (n = '') => CLASS_COLORS[(n?.charCodeAt(0) ?? 0) % CLASS_COLORS.length]

// ─── REUSABLE PRIMITIVES ──────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, disabled }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none pl-3 pr-8 py-2 text-[13px] rounded-lg border outline-none transition-all cursor-pointer
          bg-white text-slate-800 border-slate-200
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
          dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
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
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : type === 'error' ? 'bg-rose-600 text-white' : 'bg-amber-500 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

// ─── ACCEPT MODAL ─────────────────────────────────────────────────────────────

function AcceptModal({ student, onClose, onConfirm }) {
  const [form, setForm] = useState({
    admissionNo: student?.registrationNO || '',
    section: '', admissionDate: '', depositDate: '',
    depositAmount: '', transferToAdvance: false,
    payMode: '', bank: '', transactionNo: '',
  })
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const validate = () => {
    const e = {}
    if (!form.admissionNo)   e.admissionNo   = 'Required'
    if (!form.section)        e.section        = 'Required'
    if (!form.admissionDate)  e.admissionDate  = 'Required'
    if (!form.depositDate)    e.depositDate    = 'Required'
    if (!form.depositAmount)  e.depositAmount  = 'Required'
    if (!form.payMode)        e.payMode        = 'Required'
    return e
  }

  const handleConfirm = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    onConfirm(form)
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-[100] backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] rounded-2xl bg-white dark:bg-[#1a1f35] border border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl overflow-hidden"
          style={{ animation: 'modalIn .2s ease' }}>
          <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 bg-blue-50 dark:bg-blue-500/10 border-b border-blue-100 dark:border-blue-500/20">
            <div className="flex items-center gap-2.5">
              <BadgeCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <div>
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Confirm Registration</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{student?.Name} · {student?.registrationNO}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 text-slate-400">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-3 max-h-[65vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Admission No" error={errors.admissionNo} required>
                <input value={form.admissionNo} onChange={e => set('admissionNo', e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:focus:border-indigo-400" />
              </Field>
              <Field label="Section" error={errors.section} required>
                <NativeSelect value={form.section} onChange={e => set('section', e.target.value)}>
                  <option value="">-- Select --</option>
                  {SECTIONS.map(s => <option key={s}>{s}</option>)}
                </NativeSelect>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Admission Date" error={errors.admissionDate} required>
                <input type="date" value={form.admissionDate} onChange={e => set('admissionDate', e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:focus:border-indigo-400" />
              </Field>
              <Field label="Deposit Date" error={errors.depositDate} required>
                <input type="date" value={form.depositDate} onChange={e => set('depositDate', e.target.value)}
                  className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                    bg-white text-slate-800 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                    dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:focus:border-indigo-400" />
              </Field>
            </div>

            <Field label="Deposit Amount" error={errors.depositAmount} required>
              <input type="number" value={form.depositAmount} onChange={e => set('depositAmount', e.target.value)}
                placeholder="Enter amount"
                className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:focus:border-indigo-400" />
            </Field>

            {/* Transfer to Advance checkbox */}
            <div className="flex items-center gap-3 py-1">
              <button
                type="button"
                onClick={() => set('transferToAdvance', !form.transferToAdvance)}
                className={`w-10 h-5 rounded-full transition-all flex-shrink-0 relative
                  ${form.transferToAdvance ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200
                  ${form.transferToAdvance ? 'left-5' : 'left-0.5'}`} />
              </button>
              <label className="text-[13px] font-semibold text-slate-700 dark:text-slate-300 cursor-pointer select-none"
                onClick={() => set('transferToAdvance', !form.transferToAdvance)}>
                Transfer to Advance
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Field label="Pay Mode" error={errors.payMode} required>
                <NativeSelect value={form.payMode} onChange={e => set('payMode', e.target.value)}>
                  <option value="">-- Select --</option>
                  {PAY_MODES.map(m => <option key={m}>{m}</option>)}
                </NativeSelect>
              </Field>
              <Field label="Bank Name">
                <NativeSelect value={form.bank} onChange={e => set('bank', e.target.value)}>
                  <option value="">-- Select --</option>
                  {BANKS.map(b => <option key={b}>{b}</option>)}
                </NativeSelect>
              </Field>
            </div>

            <Field label="Transaction No">
              <input value={form.transactionNo} onChange={e => set('transactionNo', e.target.value)}
                placeholder="Enter transaction number"
                className="w-full px-3 py-2 text-[13px] rounded-lg border outline-none transition-all
                  bg-white text-slate-800 border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)] dark:focus:border-indigo-400" />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex gap-3 px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.015]">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              Cancel
            </button>
            <button onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
                text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all active:scale-95">
              <CheckCircle2 className="w-4 h-4" />
              Confirm
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

// ─── COLUMN TOGGLE PANEL ──────────────────────────────────────────────────────

function ColumnToggle({ visible, onChange }) {
  const [open, setOpen] = useState(false)
  const allSelected = ALL_COLUMNS.every(c => visible.includes(c.key))

  const toggleAll = () => {
    if (allSelected) onChange(ALL_COLUMNS.slice(0, 6).map(c => c.key)) // keep min columns
    else onChange(ALL_COLUMNS.map(c => c.key))
  }

  const toggle = (key) => {
    if (visible.includes(key)) {
      if (visible.length <= 3) return // minimum 3 columns
      onChange(visible.filter(k => k !== key))
    } else {
      onChange([...visible, key])
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(p => !p)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-semibold
          border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
          bg-white dark:bg-[#1e2238] text-slate-700 dark:text-slate-300
          hover:bg-slate-50 dark:hover:bg-white/5 transition-colors"
      >
        <Columns3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        Columns
        <span className="bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
          {visible.length}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-30 w-72 rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)]
            bg-white dark:bg-[#1a1f35] shadow-2xl overflow-hidden"
            style={{ animation: 'modalIn .15s ease' }}>
            <style>{`@keyframes modalIn{from{opacity:0;transform:scale(.97) translateY(-4px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>

            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/70 dark:bg-white/[0.02]">
              <span className="text-[13px] font-bold text-slate-700 dark:text-slate-200">Toggle Columns</span>
              <button
                type="button"
                onClick={toggleAll}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline"
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="p-3 max-h-72 overflow-y-auto grid grid-cols-2 gap-1">
              {ALL_COLUMNS.map(col => {
                const checked = visible.includes(col.key)
                return (
                  <button
                    key={col.key}
                    type="button"
                    onClick={() => toggle(col.key)}
                    className={`flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12px] font-medium text-left transition-colors
                      ${checked
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400'
                        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'}`}
                  >
                    <span className={`w-3.5 h-3.5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors
                      ${checked ? 'bg-blue-600 border-blue-600' : 'border-slate-300 dark:border-slate-600'}`}>
                      {checked && <Check className="w-2.5 h-2.5 text-white" />}
                    </span>
                    {col.label}
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

// ─── MOBILE FILTER DRAWER ─────────────────────────────────────────────────────

function FilterDrawer({ open, onClose, filters, setFilters, onShow, loading }) {
  if (!open) return null
  const set = (k, v) => setFilters(p => ({ ...p, [k]: v }))
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .25s ease', maxHeight: '85vh', overflowY: 'auto' }}>
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35]">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35]">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-indigo-400" />
            <span className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Search Filters</span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"><X className="w-4 h-4" /></button>
        </div>
        <div className="px-5 py-5 space-y-4">
          <Field label="Session"><NativeSelect value={filters.session} onChange={e => set('session', e.target.value)}><option value="">-- Select Session --</option>{SESSIONS.map(s => <option key={s}>{s}</option>)}</NativeSelect></Field>
          <Field label="Application Status"><NativeSelect value={filters.appStatus} onChange={e => set('appStatus', e.target.value)}><option value="">-- Select All --</option><option>Completed</option><option>Started</option></NativeSelect></Field>
          <Field label="Class"><NativeSelect value={filters.cls} onChange={e => set('cls', e.target.value)}>{CLASSES.map(c => <option key={c}>{c}</option>)}</NativeSelect></Field>
          <Field label="Payment Status"><NativeSelect value={filters.payStatus} onChange={e => set('payStatus', e.target.value)}><option value="">-- Select All --</option><option>Success</option><option>Pending</option></NativeSelect></Field>
          <Field label="Month"><NativeSelect value={filters.month} onChange={e => set('month', e.target.value)}><option value="">-- Select Month --</option>{MONTHS.map(m => <option key={m}>{m}</option>)}</NativeSelect></Field>
          <Field label="Student Type"><NativeSelect value={filters.studentType} onChange={e => set('studentType', e.target.value)}><option value="">Select All</option><option>External</option><option>Internal</option></NativeSelect></Field>
        </div>
        <div className="px-5 py-4 border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] flex gap-3 sticky bottom-0 bg-white dark:bg-[#1a1f35]">
          <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">Cancel</button>
          <button type="button" onClick={() => { onShow(); onClose() }} disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 disabled:opacity-70 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
            Show Report
          </button>
        </div>
      </div>
    </>
  )
}

// ─── MOBILE ROW CARD ──────────────────────────────────────────────────────────

function MobileCard({ row, idx, onAccept, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = classColor(row.class)
  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button type="button" onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold uppercase"
          style={{ background: bg, color: fg }}>{row.Name.slice(0, 2).toUpperCase()}</span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.Name}</p>
          <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            <Hash className="w-3 h-3" /><span className="font-mono font-semibold text-blue-600 dark:text-blue-400">{row.registrationNO}</span>
            <span className="mx-1">·</span>{row.class}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {statusBadge(row.AdmissionStatus, STATUS_META)}
          <span className={`w-5 h-5 flex items-center justify-center text-slate-400 transition-transform duration-200 ${expanded ? 'rotate-90' : ''}`}>
            <ChevronRight className="w-4 h-4" />
          </span>
        </div>
      </button>

      {/* Quick status bar */}
      <div className="flex items-center gap-2 px-4 pb-3 flex-wrap">
        {statusBadge(row.formStatus, FORM_META)}
        {statusBadge(row.paymentStatus, PAY_META)}
        <span className="text-[11px] text-slate-400 dark:text-slate-500">{row.applicationDate}</span>
      </div>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 py-4 space-y-3">
          {/* Detail grid */}
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            {[
              ['Phone', row.regPhone, Phone],
              ['DOB', row.dob, Calendar],
              ['Gender', row.gender, User2],
              ['Email', row.studentEmail, Mail],
              ['Father', row.FatherName, User2],
              ['Father Ph.', row.fatherMobile, Phone],
              ['Mother', row.motherName, User2],
              ['Mother Ph.', row.motherPhone, Phone],
              ['Stream', row.stream, BookOpen],
              ['Type', row.studentType, Users],
              ['Amount', row.paymentAmount, Banknote],
              ['Pay Date', row.paymentDate, Calendar],
              ['Session', row.session, Clock],
              ['Reg. Date', row.applicationDate, Calendar],
            ].map(([label, val, Icon]) => (
              <div key={label} className="flex items-start gap-1.5">
                <Icon className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                  <p className="text-slate-700 dark:text-slate-300 font-medium truncate">{val || '—'}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Address */}
          <div className="flex items-start gap-1.5 text-[12px]">
            <MapPin className="w-3 h-3 text-slate-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Address</p>
              <p className="text-slate-700 dark:text-slate-300 font-medium">{row.residentialAddr}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-1">
            <button onClick={() => window.alert(`Download form: ${row.registrationNO}`)}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 transition-colors">
              <Download className="w-3.5 h-3.5" /> Form
            </button>
            {row.AdmissionStatus === 'Pending' && (
              <>
                <button onClick={() => onAccept(row)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold
                    bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                </button>
                <button onClick={() => onReject(row)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-[12px] font-semibold
                    bg-rose-600 text-white hover:bg-rose-700 transition-all active:scale-95">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function OnlineRegistrationReportStatus() {
  // Filters
  const [filters, setFilters] = useState({
    session: '', appStatus: 'Completed', cls: 'All Classes',
    payStatus: 'Success', month: '', studentType: '',
  })
  // Data
  const [rows,        setRows]        = useState([])
  const [loading,     setLoading]     = useState(false)
  const [exporting,   setExporting]   = useState(false)
  const [shown,       setShown]       = useState(false)
  // UI state
  const [search,      setSearch]      = useState('')
  const [filterOpen,  setFilterOpen]  = useState(false)
  const [visibleCols, setVisibleCols] = useState(DEFAULT_VISIBLE)
  const [toast,       setToast]       = useState(null)
  // Modal
  const [acceptRow,   setAcceptRow]   = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Show ────────────────────────────────────────────────────────────────────
  const handleShow = useCallback(() => {
    setLoading(true)
    setSearch('')
    setTimeout(() => {
      // Simulate filter — in real app: API call with filters
      let data = [...DUMMY_STUDENTS]
      if (filters.appStatus) data = data.filter(r => r.formStatus === filters.appStatus)
      if (filters.payStatus)  data = data.filter(r => r.paymentStatus === filters.payStatus)
      if (filters.cls && filters.cls !== 'All Classes') data = data.filter(r => r.class === filters.cls)
      if (filters.studentType) data = data.filter(r => r.studentType === filters.studentType)
      setRows(data)
      setShown(true)
      setLoading(false)
      showToast(`Loaded ${data.length} registration${data.length !== 1 ? 's' : ''}.`)
    }, 700)
  }, [filters])

  const handleReset = () => {
    setFilters({ session: '', appStatus: 'Completed', cls: 'All Classes', payStatus: 'Success', month: '', studentType: '' })
    setRows([]); setSearch(''); setShown(false)
  }

  const handleExcel = () => {
    if (!rows.length) { showToast('No data to export.', 'error'); return }
    setExporting(true)
    setTimeout(() => { setExporting(false); showToast('Excel export ready! (API integration pending)') }, 1200)
  }

  // ── Accept ───────────────────────────────────────────────────────────────────
  const handleAccept = (student) => setAcceptRow(student)

  const handleConfirmAccept = (form) => {
    setRows(prev => prev.map(r => r.id === acceptRow.id ? { ...r, AdmissionStatus: 'Accepted' } : r))
    setAcceptRow(null)
    showToast(`${acceptRow.Name} accepted successfully.`)
  }

  // ── Reject ───────────────────────────────────────────────────────────────────
  const handleReject = (student) => {
    if (!window.confirm(`Reject registration of ${student.Name}?`)) return
    setRows(prev => prev.map(r => r.id === student.id ? { ...r, AdmissionStatus: 'Rejected' } : r))
    showToast(`${student.Name} rejected.`, 'error')
  }

  // ── Search filter ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return rows
    const q = search.toLowerCase()
    return rows.filter(r =>
      r.Name.toLowerCase().includes(q) ||
      r.registrationNO.toLowerCase().includes(q) ||
      r.class.toLowerCase().includes(q) ||
      r.FatherName.toLowerCase().includes(q) ||
      r.studentEmail.toLowerCase().includes(q)
    )
  }, [rows, search])

  // Columns to render (ordered by ALL_COLUMNS order)
  const cols = useMemo(
    () => ALL_COLUMNS.filter(c => visibleCols.includes(c.key)),
    [visibleCols]
  )

  const activeFilterCount = [filters.session, filters.appStatus, filters.cls !== 'All Classes' ? filters.cls : '', filters.payStatus, filters.month, filters.studentType].filter(Boolean).length

  // ── Cell renderer ────────────────────────────────────────────────────────────
  const renderCell = (col, row, idx) => {
    switch (col.key) {
      case 'sno': return <span className="text-[12px] text-slate-400 tabular-nums">{idx + 1}</span>
      case 'action':
        return (
          <div className="flex gap-1.5 min-w-[110px]">
            {row.AdmissionStatus === 'Pending' ? (
              <>
                <button onClick={() => handleAccept(row)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 whitespace-nowrap">
                  <CheckCircle2 className="w-3 h-3" />Accept
                </button>
                <button onClick={() => handleReject(row)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold bg-rose-600 text-white hover:bg-rose-700 transition-all active:scale-95 whitespace-nowrap">
                  <XCircle className="w-3 h-3" />Reject
                </button>
              </>
            ) : (
              <span className="text-[11px] text-slate-400 italic">{row.AdmissionStatus}</span>
            )}
          </div>
        )
      case 'form':
        return (
          <button onClick={() => window.alert(`Download form: ${row.registrationNO}`)}
            className="flex items-center gap-1 text-[12px] font-semibold text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap">
            <Download className="w-3.5 h-3.5" />Download
          </button>
        )
      case 'currentStatus': return statusBadge(row.AdmissionStatus, STATUS_META)
      case 'registrationNO': return <span className="font-mono text-[12px] font-semibold text-blue-700 dark:text-blue-400">{row.registrationNO}</span>
      case 'class': return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-semibold border"
          style={{ background: classColor(row.class).bg, color: classColor(row.class).fg, borderColor: `${classColor(row.class).fg}33` }}>
          {row.class}
        </span>
      )
      case 'Name': return (
        <div className="flex items-center gap-2 min-w-[120px]">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold uppercase"
            style={{ background: classColor(row.class).bg, color: classColor(row.class).fg }}>
            {row.Name.slice(0, 2).toUpperCase()}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.Name}</span>
        </div>
      )
      case 'formStatus': return statusBadge(row.formStatus, FORM_META)
      case 'paymentStatus': return statusBadge(row.paymentStatus, PAY_META)
      default: return <span className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row[col.key] || '—'}</span>
    }
  }

  return (
    <div className="space-y-4 pb-10">

      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Online Registration Report
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            View, accept, or reject online registration applications.
          </p>
        </div>
        {shown && rows.length > 0 && (
          <button onClick={handleExcel} disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20
              transition-all active:scale-95 disabled:opacity-70 flex-shrink-0">
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
        </div>
        <div className="p-5">
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-4 items-end">
            <Field label="Session">
              <NativeSelect value={filters.session} onChange={e => setFilters(p => ({ ...p, session: e.target.value }))}>
                <option value="">-- Session --</option>
                {SESSIONS.map(s => <option key={s}>{s}</option>)}
              </NativeSelect>
            </Field>
            <Field label="App. Status">
              <NativeSelect value={filters.appStatus} onChange={e => setFilters(p => ({ ...p, appStatus: e.target.value }))}>
                <option value="">-- All --</option>
                <option>Completed</option><option>Started</option>
              </NativeSelect>
            </Field>
            <Field label="Class">
              <NativeSelect value={filters.cls} onChange={e => setFilters(p => ({ ...p, cls: e.target.value }))}>
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Payment Status">
              <NativeSelect value={filters.payStatus} onChange={e => setFilters(p => ({ ...p, payStatus: e.target.value }))}>
                <option value="">-- All --</option>
                <option>Success</option><option>Pending</option>
              </NativeSelect>
            </Field>
            <Field label="Month">
              <NativeSelect value={filters.month} onChange={e => setFilters(p => ({ ...p, month: e.target.value }))}>
                <option value="">-- Month --</option>
                {MONTHS.map(m => <option key={m}>{m}</option>)}
              </NativeSelect>
            </Field>
            <Field label="Student Type">
              <NativeSelect value={filters.studentType} onChange={e => setFilters(p => ({ ...p, studentType: e.target.value }))}>
                <option value="">Select All</option>
                <option>External</option><option>Internal</option>
              </NativeSelect>
            </Field>
          </div>
          <div className="flex gap-2 mt-4 justify-end">
            <button onClick={handleShow} disabled={loading}
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
                bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700
                transition-all active:scale-95 disabled:opacity-70">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
              Show
            </button>
            <button onClick={handleReset}
              className="flex items-center justify-center px-3 py-2 rounded-xl text-[13px] font-semibold
                bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── MOBILE Filter Bar ─────────────────────────────────────────────── */}
      <div className="flex sm:hidden gap-2">
        <button type="button" onClick={() => setFilterOpen(true)}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
            bg-blue-600 text-white dark:bg-indigo-600 shadow-md shadow-blue-500/20">
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-white/25 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeFilterCount}</span>
          )}
        </button>
        {shown && rows.length > 0 && (
          <button onClick={handleExcel} disabled={exporting}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm disabled:opacity-70">
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          </button>
        )}
        {shown && (
          <button onClick={handleReset} className="px-3.5 py-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300">
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Mobile Drawer */}
      <FilterDrawer open={filterOpen} onClose={() => setFilterOpen(false)}
        filters={filters} setFilters={setFilters} onShow={handleShow} loading={loading} />

      {/* ── Loading Skeleton ─────────────────────────────────────────────── */}
      {loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] p-6 space-y-3">
          <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse" style={{ opacity: 1 - i * 0.15 }} />
          ))}
        </div>
      )}

      {/* ── Results ──────────────────────────────────────────────────────── */}
      {shown && !loading && (
        <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

          {/* Card Header */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
            <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
              <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
              <ClipboardList className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
              <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Registration List</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
                {filtered.length} record{filtered.length !== 1 ? 's' : ''}
              </span>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Column toggle — desktop only */}
              <div className="hidden md:block">
                <ColumnToggle visible={visibleCols} onChange={setVisibleCols} />
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-52">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name, reg, class…"
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
          </div>

          {/* Info hint */}
          <div className="hidden sm:flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
            <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
            <p className="text-[12px] text-blue-700 dark:text-blue-400">
              Use <strong>Columns</strong> toggle to show/hide fields. Accept opens a confirmation dialog. Reject requires confirmation.
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
                    {cols.map(col => (
                      <th key={col.key}
                        className="px-3 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, i) => (
                    <tr key={row.id} className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors">
                      {cols.map(col => (
                        <td key={col.key} className="px-3 py-2.5">{renderCell(col, row, i)}</td>
                      ))}
                    </tr>
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
                  Tap a card to expand details and take actions.
                </p>
                {filtered.map((row, i) => (
                  <MobileCard key={row.id} row={row} idx={i} onAccept={handleAccept} onReject={handleReject} />
                ))}
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
              <button onClick={() => setSearch('')} className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear search
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Empty State ───────────────────────────────────────────────────── */}
      {!shown && !loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-slate-400 dark:text-slate-600">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <ClipboardList className="w-7 h-7 opacity-50" />
          </div>
          <div className="text-center">
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">No report generated yet</p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Set your filters and click <strong>Show</strong> to load registrations.
            </p>
          </div>
        </div>
      )}

      {/* ── Accept Modal ──────────────────────────────────────────────────── */}
      {acceptRow && (
        <AcceptModal
          student={acceptRow}
          onClose={() => setAcceptRow(null)}
          onConfirm={handleConfirmAccept}
        />
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
