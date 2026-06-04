/**
 * DriverVehicleMaster.jsx
 * Folder: src/pages/Transport/DriverVehicleMaster.jsx
 *
 * Converts legacy ASPX "Driver Vehicle Details" to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Transport Type dropdown (with auto-load vehicles)
 *  - Vehicle No dropdown
 *  - Driver Name, Helper Name text inputs
 *  - Route Name dropdown
 *  - Licence Expiry Date (day/month/year selectors)
 *  - Insurance Expiry Date (day/month/year selectors)
 *  - Document upload
 *  - Driver Mobile Number
 *  - Submit / Edit / Export Excel
 *  - Desktop: dense ERP table with edit action
 *  - Mobile: collapsible cards, bottom-sheet form, drawer filters
 */

import { useState, useMemo, useCallback, useRef } from 'react'
import {
  Bus, Truck, User, UserCheck, MapPin, Calendar, Shield,
  Upload, Phone, Edit2, FileSpreadsheet, Plus, RefreshCw,
  AlertCircle, X, Check, Loader2, ChevronDown, ChevronRight,
  ChevronUp, Search, SlidersHorizontal, Info, Eye,
  Building2, Filter, MoreVertical, Pencil, Trash2,
  CheckCircle2, Clock, AlertTriangle, Navigation
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ───────────────────────────────────────────────────────

const TRANSPORT_TYPES = [
  { value: '0', label: '-- Select Transport Type --' },
  { value: 'school_bus', label: 'School Bus' },
  { value: 'mini_bus', label: 'Mini Bus' },
  { value: 'van', label: 'Van' },
  { value: 'tempo', label: 'Tempo' },
]

const VEHICLES_BY_TYPE = {
  school_bus: ['UP-07-AB-1234', 'UP-07-AB-5678', 'UP-07-CD-9012'],
  mini_bus:   ['UP-07-EF-3456', 'UP-07-EF-7890'],
  van:        ['UP-07-GH-1111', 'UP-07-GH-2222', 'UP-07-GH-3333'],
  tempo:      ['UP-07-IJ-4444', 'UP-07-IJ-5555'],
}

const ROUTES = [
  { value: '0', label: '-- Select Route --' },
  { value: 'r1', label: 'Route 1 – Civil Lines' },
  { value: 'r2', label: 'Route 2 – Rajpur Road' },
  { value: 'r3', label: 'Route 3 – Dehradun Cantt' },
  { value: 'r4', label: 'Route 4 – Patel Nagar' },
  { value: 'r5', label: 'Route 5 – Haridwar Road' },
]

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
]

const YEARS = Array.from({ length: 20 }, (_, i) => String(2020 + i))

// Pre-loaded dummy records
const DUMMY_RECORDS = [
  {
    id: 1,
    transport_type: 'School Bus',
    vehicle_no: 'UP-07-AB-1234',
    drivername: 'Ramesh Kumar',
    helpername: 'Suresh Singh',
    route_name: 'Route 1 – Civil Lines',
    driver_expiry_date: '15 June 2026',
    insurance_expiry_date: '01 March 2026',
    mobileno: '9876543210',
    doc: 'licence_ramesh.pdf',
    licStatus: 'valid',
    insStatus: 'expiring',
  },
  {
    id: 2,
    transport_type: 'Mini Bus',
    vehicle_no: 'UP-07-EF-3456',
    drivername: 'Mahesh Yadav',
    helpername: 'Dinesh Verma',
    route_name: 'Route 2 – Rajpur Road',
    driver_expiry_date: '20 December 2027',
    insurance_expiry_date: '10 October 2027',
    mobileno: '9123456780',
    doc: 'licence_mahesh.pdf',
    licStatus: 'valid',
    insStatus: 'valid',
  },
  {
    id: 3,
    transport_type: 'Van',
    vehicle_no: 'UP-07-GH-1111',
    drivername: 'Vijay Sharma',
    helpername: 'Ajay Tiwari',
    route_name: 'Route 3 – Dehradun Cantt',
    driver_expiry_date: '05 January 2025',
    insurance_expiry_date: '22 February 2025',
    mobileno: '9988776655',
    doc: null,
    licStatus: 'expired',
    insStatus: 'expired',
  },
  {
    id: 4,
    transport_type: 'School Bus',
    vehicle_no: 'UP-07-AB-5678',
    drivername: 'Prakash Joshi',
    helpername: 'Naresh Bisht',
    route_name: 'Route 4 – Patel Nagar',
    driver_expiry_date: '30 August 2028',
    insurance_expiry_date: '15 September 2028',
    mobileno: '9011223344',
    doc: 'licence_prakash.pdf',
    licStatus: 'valid',
    insStatus: 'valid',
  },
  {
    id: 5,
    transport_type: 'Tempo',
    vehicle_no: 'UP-07-IJ-4444',
    drivername: 'Sanjay Rawat',
    helpername: 'Pankaj Negi',
    route_name: 'Route 5 – Haridwar Road',
    driver_expiry_date: '10 April 2026',
    insurance_expiry_date: '18 May 2026',
    mobileno: '9765432109',
    doc: 'licence_sanjay.pdf',
    licStatus: 'valid',
    insStatus: 'valid',
  },
]

// ─── HELPERS ──────────────────────────────────────────────────────────────────

const getDays = (month, year) => {
  if (!month || !year) return Array.from({ length: 31 }, (_, i) => String(i + 1).padStart(2, '0'))
  const m = MONTHS.indexOf(month) + 1
  const days = new Date(Number(year), m, 0).getDate()
  return Array.from({ length: days }, (_, i) => String(i + 1).padStart(2, '0'))
}

const STATUS_CONFIG = {
  valid:    { label: 'Valid',    icon: CheckCircle2, cls: 'text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20' },
  expiring: { label: 'Expiring', icon: Clock,        cls: 'text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20' },
  expired:  { label: 'Expired',  icon: AlertTriangle, cls: 'text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/20' },
}

const TRANSPORT_COLORS = {
  'School Bus': { fg: '#1d4ed8', bg: '#dbeafe' },
  'Mini Bus':   { fg: '#7c3aed', bg: '#ede9fe' },
  'Van':        { fg: '#059669', bg: '#d1fae5' },
  'Tempo':      { fg: '#d97706', bg: '#fef3c7' },
}
const transportColor = (type) =>
  TRANSPORT_COLORS[type] ?? { fg: '#0891b2', bg: '#cffafe' }

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

function NativeSelect({ value, onChange, children, placeholder, error, disabled, className = '' }) {
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
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}
          ${className}`}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {children}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
    </div>
  )
}

function Field({ label, error, required, children, hint }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-1">
        {label}{required && <span className="text-rose-500">*</span>}
        {hint && <span className="text-[10px] normal-case font-normal text-slate-400 ml-1">{hint}</span>}
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

function TextInput({ value, onChange, placeholder, error, disabled, icon: Icon }) {
  return (
    <div className="relative">
      {Icon && <Icon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />}
      <input
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${Icon ? 'pl-8' : 'pl-3'} pr-3 py-2 text-[13px] rounded-lg border outline-none transition-all
          bg-white text-slate-800 placeholder-slate-300
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600 dark:focus:border-indigo-400
          disabled:opacity-50
          ${error ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200 dark:border-[rgba(99,102,241,0.25)]'}`}
      />
    </div>
  )
}

function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'slideUp .25s ease' }}
    >
      {type === 'success' ? <Check className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.valid
  const Icon = cfg.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${cfg.cls}`}>
      <Icon className="w-3 h-3" />{cfg.label}
    </span>
  )
}

// ─── DATE PICKER TRIPLE (Day / Month / Year) ──────────────────────────────────

function DateTriplePicker({ label, day, month, year, onDay, onMonth, onYear, errors = {} }) {
  const days = getDays(month, year)
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
        {label}
      </label>
      <div className="grid grid-cols-3 gap-1.5">
        {/* Day */}
        <NativeSelect value={day} onChange={e => onDay(e.target.value)} error={errors.day}>
          <option value="">DD</option>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </NativeSelect>
        {/* Month */}
        <NativeSelect value={month} onChange={e => onMonth(e.target.value)} error={errors.month}>
          <option value="">MM</option>
          {MONTHS.map(m => <option key={m} value={m}>{m.slice(0, 3)}</option>)}
        </NativeSelect>
        {/* Year */}
        <NativeSelect value={year} onChange={e => onYear(e.target.value)} error={errors.year}>
          <option value="">YYYY</option>
          {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
        </NativeSelect>
      </div>
      {(errors.day || errors.month || errors.year) && (
        <p className="flex items-center gap-1 text-[11px] text-rose-500">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />Select complete date
        </p>
      )}
    </div>
  )
}

// ─── SUMMARY STAT CARD ────────────────────────────────────────────────────────

function SummaryCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue:    'bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400',
    amber:   'bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400',
    rose:    'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400',
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

// ─── ENTRY FORM (shared between desktop card + mobile sheet) ─────────────────

function DriverForm({ form, setForm, errors, loading, onSubmit, onReset, editMode, fileRef }) {
  // Vehicles based on transport type
  const vehicles = VEHICLES_BY_TYPE[form.transport_type] ?? []

  const set = (key) => (e) => {
    const val = e.target ? e.target.value : e
    setForm(prev => ({
      ...prev,
      [key]: val,
      // Reset vehicle when transport changes
      ...(key === 'transport_type' ? { vehicle_no: '' } : {}),
    }))
  }

  return (
    <div className="p-5 space-y-4">
      {/* Row 1: Transport Type + Vehicle No */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Transport Type" error={errors.transport_type} required>
          <NativeSelect value={form.transport_type} onChange={set('transport_type')} error={errors.transport_type}>
            {TRANSPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </NativeSelect>
        </Field>

        <Field label="Vehicle No." error={errors.vehicle_no} required>
          <NativeSelect
            value={form.vehicle_no}
            onChange={set('vehicle_no')}
            error={errors.vehicle_no}
            disabled={!form.transport_type || form.transport_type === '0'}
          >
            <option value="">-- Select Vehicle --</option>
            {vehicles.map(v => <option key={v} value={v}>{v}</option>)}
          </NativeSelect>
        </Field>

        <Field label="Driver Name" error={errors.drivername} required>
          <TextInput
            value={form.drivername}
            onChange={set('drivername')}
            placeholder="Enter driver name"
            error={errors.drivername}
            icon={User}
          />
        </Field>

        <Field label="Helper Name" error={errors.helpername}>
          <TextInput
            value={form.helpername}
            onChange={set('helpername')}
            placeholder="Enter helper name"
            icon={UserCheck}
          />
        </Field>
      </div>

      {/* Row 2: Route + Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Route Name" error={errors.route_name} required>
          <NativeSelect value={form.route_name} onChange={set('route_name')} error={errors.route_name}>
            {ROUTES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </NativeSelect>
        </Field>

        {/* Licence Expiry */}
        <DateTriplePicker
          label="Licence Expiry Date"
          day={form.lic_day} month={form.lic_month} year={form.lic_year}
          onDay={val => setForm(p => ({ ...p, lic_day: val }))}
          onMonth={val => setForm(p => ({ ...p, lic_month: val }))}
          onYear={val => setForm(p => ({ ...p, lic_year: val }))}
          errors={{ day: errors.lic_day, month: errors.lic_month, year: errors.lic_year }}
        />

        {/* Insurance Expiry */}
        <DateTriplePicker
          label="Insurance Expiry Date"
          day={form.ins_day} month={form.ins_month} year={form.ins_year}
          onDay={val => setForm(p => ({ ...p, ins_day: val }))}
          onMonth={val => setForm(p => ({ ...p, ins_month: val }))}
          onYear={val => setForm(p => ({ ...p, ins_year: val }))}
          errors={{ day: errors.ins_day, month: errors.ins_month, year: errors.ins_year }}
        />

        <Field label="Driver Mobile No." error={errors.mobileno} required>
          <TextInput
            value={form.mobileno}
            onChange={set('mobileno')}
            placeholder="Enter mobile number"
            error={errors.mobileno}
            icon={Phone}
          />
        </Field>
      </div>

      {/* Row 3: Upload Document */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Field label="Upload Document" hint="(licence / RC / insurance)">
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-slate-300 dark:border-[rgba(99,102,241,0.3)] bg-slate-50 dark:bg-[#1e2238] cursor-pointer hover:border-blue-400 dark:hover:border-indigo-400 transition-colors group">
            <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-500 dark:group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
            <span className="text-[12px] text-slate-500 dark:text-slate-400 truncate">
              {form.doc_name ? form.doc_name : 'Choose file…'}
            </span>
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={e => setForm(p => ({ ...p, doc_name: e.target.files[0]?.name ?? '' }))}
            />
          </label>
        </Field>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]" />

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <p className="text-[12px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 flex-shrink-0" />
          Fields marked <span className="text-rose-500 font-semibold">*</span> are required.
        </p>
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2 rounded-xl text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20
              dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:shadow-indigo-500/20
              transition-all active:scale-95 disabled:opacity-70"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (editMode ? <Edit2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
            {editMode ? 'Update' : 'Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── MOBILE FORM SHEET ───────────────────────────────────────────────────────

function MobileFormSheet({ open, onClose, form, setForm, errors, loading, onSubmit, onReset, editMode, fileRef }) {
  if (!open) return null
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={onClose} />
      <div
        className="fixed inset-x-0 bottom-0 z-50 max-h-[92vh] overflow-y-auto rounded-t-2xl bg-white dark:bg-[#1a1f35] border-t border-slate-200 dark:border-[rgba(99,102,241,0.2)] shadow-2xl"
        style={{ animation: 'drawerUp .3s ease' }}
      >
        <style>{`@keyframes drawerUp{from{transform:translateY(100%)}to{transform:translateY(0)}}`}</style>
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sticky top-0 bg-white dark:bg-[#1a1f35] z-10">
          <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
        </div>
        {/* Sheet Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] sticky top-5 bg-white dark:bg-[#1a1f35] z-10">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-indigo-500/20 flex items-center justify-center">
              {editMode ? <Edit2 className="w-4 h-4 text-blue-600 dark:text-indigo-400" /> : <Plus className="w-4 h-4 text-blue-600 dark:text-indigo-400" />}
            </span>
            <span className="text-[15px] font-bold text-slate-800 dark:text-slate-100">
              {editMode ? 'Edit Record' : 'Add Driver / Vehicle'}
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        <DriverForm
          form={form} setForm={setForm} errors={errors}
          loading={loading} onSubmit={() => { onSubmit(); if (!Object.keys(errors).length) onClose() }}
          onReset={onReset} editMode={editMode} fileRef={fileRef}
        />
      </div>
    </>
  )
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────

function DesktopRow({ row, idx, onEdit }) {
  const { fg, bg } = transportColor(row.transport_type)
  return (
    <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors group">
      <td className="px-3 py-2.5 text-center text-[12px] text-slate-400 tabular-nums w-10">{idx}</td>

      {/* Transport Type */}
      <td className="px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ background: bg }}>
            <Bus className="w-3.5 h-3.5" style={{ color: fg }} />
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.transport_type}</span>
        </div>
      </td>

      {/* Vehicle No */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] font-mono font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md whitespace-nowrap">
          {row.vehicle_no}
        </span>
      </td>

      {/* Driver */}
      <td className="px-3 py-2.5">
        <div>
          <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">{row.drivername}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">{row.mobileno}</p>
        </div>
      </td>

      {/* Helper */}
      <td className="px-3 py-2.5 text-[13px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.helpername}</td>

      {/* Route */}
      <td className="px-3 py-2.5">
        <span className="text-[12px] text-slate-600 dark:text-slate-400 flex items-center gap-1">
          <Navigation className="w-3 h-3 text-slate-400 flex-shrink-0" />
          {row.route_name}
        </span>
      </td>

      {/* Licence Expiry */}
      <td className="px-3 py-2.5">
        <div className="space-y-1">
          <p className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.driver_expiry_date}</p>
          <StatusBadge status={row.licStatus} />
        </div>
      </td>

      {/* Insurance Expiry */}
      <td className="px-3 py-2.5">
        <div className="space-y-1">
          <p className="text-[12px] text-slate-600 dark:text-slate-300 whitespace-nowrap">{row.insurance_expiry_date}</p>
          <StatusBadge status={row.insStatus} />
        </div>
      </td>

      {/* Action */}
      <td className="px-3 py-2.5 text-center">
        <button
          onClick={() => onEdit(row)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
            bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20
            border border-blue-200 dark:border-blue-500/20 transition-colors"
        >
          <Pencil className="w-3 h-3" />Edit
        </button>
      </td>
    </tr>
  )
}

// ─── MOBILE RECORD CARD ───────────────────────────────────────────────────────

function MobileRecordCard({ row, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const { fg, bg } = transportColor(row.transport_type)

  return (
    <div className="rounded-xl border border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35] overflow-hidden shadow-sm">
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(p => !p)}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left hover:bg-slate-50/60 dark:hover:bg-white/[0.02] transition-colors"
      >
        <span className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center" style={{ background: bg }}>
          <Bus className="w-4 h-4" style={{ color: fg }} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100 leading-tight truncate">{row.drivername}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 truncate">
            {row.vehicle_no} · {row.transport_type}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <StatusBadge status={row.licStatus} />
        </div>
        <span className={`w-5 h-5 flex items-center justify-center ml-1 text-slate-400 transition-transform duration-200 flex-shrink-0 ${expanded ? 'rotate-90' : ''}`}>
          <ChevronRight className="w-4 h-4" />
        </span>
      </button>

      {/* Quick info bar */}
      <div className="px-4 pb-3 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1"><Navigation className="w-3 h-3" />{row.route_name.split('–')[0].trim()}</span>
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{row.mobileno}</span>
      </div>

      {/* Expanded Detail */}
      {expanded && (
        <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)] px-4 pt-3 pb-4 space-y-3">
          {/* Grid details */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Helper Name</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">{row.helpername}</p>
            </div>
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500 mb-1">Route</p>
              <p className="text-[13px] font-semibold text-slate-700 dark:text-slate-200 truncate">{row.route_name}</p>
            </div>
            <div className="rounded-xl bg-amber-50 dark:bg-amber-500/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400 mb-1">Licence Expiry</p>
              <p className="text-[12px] font-semibold text-amber-700 dark:text-amber-300">{row.driver_expiry_date}</p>
              <div className="mt-1"><StatusBadge status={row.licStatus} /></div>
            </div>
            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400 mb-1">Insurance Expiry</p>
              <p className="text-[12px] font-semibold text-blue-700 dark:text-blue-300">{row.insurance_expiry_date}</p>
              <div className="mt-1"><StatusBadge status={row.insStatus} /></div>
            </div>
          </div>

          {/* Document chip */}
          {row.doc && (
            <div className="flex items-center gap-2 text-[12px] text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-200 dark:border-emerald-500/20">
              <Upload className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{row.doc}</span>
            </div>
          )}

          {/* Edit button */}
          <button
            onClick={() => onEdit(row)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold
              bg-blue-600 text-white hover:bg-blue-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-colors"
          >
            <Pencil className="w-4 h-4" />Edit Record
          </button>
        </div>
      )}
    </div>
  )
}

// ─── EMPTY FORM STATE ─────────────────────────────────────────────────────────

const EMPTY_FORM = {
  editId: null,
  transport_type: '',
  vehicle_no: '',
  drivername: '',
  helpername: '',
  route_name: '',
  lic_day: '', lic_month: '', lic_year: '',
  ins_day: '', ins_month: '', ins_year: '',
  mobileno: '',
  doc_name: '',
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function DriverVehicleMaster() {
  const [records,      setRecords]      = useState(DUMMY_RECORDS)
  const [form,         setForm]         = useState(EMPTY_FORM)
  const [errors,       setErrors]       = useState({})
  const [loading,      setLoading]      = useState(false)
  const [exporting,    setExporting]    = useState(false)
  const [toast,        setToast]        = useState(null)
  const [search,       setSearch]       = useState('')
  const [mobileForm,   setMobileForm]   = useState(false)
  const [formExpanded, setFormExpanded] = useState(true) // desktop form toggle
  const fileRef = useRef(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Validate ────────────────────────────────────────────────────────────
  const validate = () => {
    const err = {}
    if (!form.transport_type || form.transport_type === '0') err.transport_type = 'Required'
    if (!form.vehicle_no)    err.vehicle_no  = 'Required'
    if (!form.drivername.trim()) err.drivername = 'Required'
    if (!form.route_name || form.route_name === '0') err.route_name = 'Required'
    if (!form.mobileno.trim()) err.mobileno  = 'Required'
    else if (!/^\d{10}$/.test(form.mobileno.trim())) err.mobileno = 'Enter 10-digit number'
    return err
  }

  // ── Submit ──────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(() => {
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    const licDate = [form.lic_day, form.lic_month, form.lic_year].filter(Boolean).join(' ') || '—'
    const insDate = [form.ins_day, form.ins_month, form.ins_year].filter(Boolean).join(' ') || '—'
    const transportLabel = TRANSPORT_TYPES.find(t => t.value === form.transport_type)?.label ?? form.transport_type
    const routeLabel = ROUTES.find(r => r.value === form.route_name)?.label ?? form.route_name

    setTimeout(() => {
      const newRec = {
        id: form.editId ?? Date.now(),
        transport_type: transportLabel,
        vehicle_no: form.vehicle_no,
        drivername: form.drivername.trim(),
        helpername: form.helpername.trim(),
        route_name: routeLabel,
        driver_expiry_date: licDate,
        insurance_expiry_date: insDate,
        mobileno: form.mobileno.trim(),
        doc: form.doc_name || null,
        licStatus: 'valid',
        insStatus: 'valid',
      }

      if (form.editId) {
        setRecords(prev => prev.map(r => r.id === form.editId ? newRec : r))
        showToast('Record updated successfully.')
      } else {
        setRecords(prev => [newRec, ...prev])
        showToast('Driver/Vehicle record added successfully.')
      }
      setForm(EMPTY_FORM)
      if (fileRef.current) fileRef.current.value = ''
      setLoading(false)
    }, 700)
  }, [form])

  // ── Edit ────────────────────────────────────────────────────────────────
  const handleEdit = useCallback((row) => {
    const transportValue = TRANSPORT_TYPES.find(t => t.label === row.transport_type)?.value ?? ''
    const routeValue     = ROUTES.find(r => r.label === row.route_name)?.value ?? ''

    const parts = row.driver_expiry_date !== '—' ? row.driver_expiry_date.split(' ') : ['', '', '']
    const iparts = row.insurance_expiry_date !== '—' ? row.insurance_expiry_date.split(' ') : ['', '', '']

    setForm({
      editId: row.id,
      transport_type: transportValue,
      vehicle_no: row.vehicle_no,
      drivername: row.drivername,
      helpername: row.helpername,
      route_name: routeValue,
      lic_day:   parts[0] ?? '',
      lic_month: parts[1] ?? '',
      lic_year:  parts[2] ?? '',
      ins_day:   iparts[0] ?? '',
      ins_month: iparts[1] ?? '',
      ins_year:  iparts[2] ?? '',
      mobileno: row.mobileno,
      doc_name: row.doc ?? '',
    })
    setErrors({})
    setFormExpanded(true)
    setMobileForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  // ── Reset ───────────────────────────────────────────────────────────────
  const handleReset = () => {
    setForm(EMPTY_FORM)
    setErrors({})
    if (fileRef.current) fileRef.current.value = ''
  }

  // ── Export ──────────────────────────────────────────────────────────────
  const handleExport = () => {
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      showToast('Excel export ready! (API integration pending)')
    }, 1200)
  }

  // ── Search Filter ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search) return records
    const q = search.toLowerCase()
    return records.filter(r =>
      r.drivername.toLowerCase().includes(q) ||
      r.vehicle_no.toLowerCase().includes(q) ||
      r.transport_type.toLowerCase().includes(q) ||
      r.route_name.toLowerCase().includes(q) ||
      r.mobileno.includes(q)
    )
  }, [records, search])

  // ── Summary Stats ───────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:    records.length,
    valid:    records.filter(r => r.licStatus === 'valid').length,
    expiring: records.filter(r => r.licStatus === 'expiring' || r.insStatus === 'expiring').length,
    expired:  records.filter(r => r.licStatus === 'expired' || r.insStatus === 'expired').length,
  }), [records])

  const editMode = !!form.editId

  return (
    <div className="space-y-4 pb-16">

      {/* ── Page Title ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Bus className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Driver Vehicle Master
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage transport vehicles, drivers, routes &amp; compliance dates.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-semibold
              bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-all active:scale-95 disabled:opacity-70"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
            Export Excel
          </button>
        </div>
      </div>

      {/* ── Summary Cards ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <SummaryCard icon={Bus}           label="Total Vehicles"       value={stats.total}    color="blue"    />
        <SummaryCard icon={CheckCircle2}  label="Licences Valid"       value={stats.valid}    color="emerald" />
        <SummaryCard icon={Clock}         label="Expiring Soon"        value={stats.expiring} color="amber"   />
        <SummaryCard icon={AlertTriangle} label="Expired / Attention"  value={stats.expired}  color="rose"    />
      </div>

      {/* ── DESKTOP FORM CARD ─────────────────────────────────────────────── */}
      <div className="hidden sm:block rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
        {/* Form Header (collapsible) */}
        <button
          type="button"
          onClick={() => setFormExpanded(p => !p)}
          className="w-full flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100/70 dark:hover:bg-white/[0.04] transition-colors"
        >
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <span className="w-7 h-7 rounded-xl bg-blue-100 dark:bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            {editMode ? <Edit2 className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" /> : <Plus className="w-3.5 h-3.5 text-blue-600 dark:text-indigo-400" />}
          </span>
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1 text-left">
            {editMode ? `Edit Record — ${form.drivername}` : 'Driver Vehicle Master'}
          </span>
          {editMode && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400">
              Edit Mode
            </span>
          )}
          <span className={`transition-transform duration-200 text-slate-400 ${formExpanded ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </span>
        </button>

        {/* Collapsible Form */}
        {formExpanded && (
          <DriverForm
            form={form} setForm={setForm} errors={errors}
            loading={loading} onSubmit={handleSubmit}
            onReset={handleReset} editMode={editMode} fileRef={fileRef}
          />
        )}
      </div>

      {/* ── MOBILE FAB ───────────────────────────────────────────────────── */}
      <div className="fixed bottom-5 right-5 z-30 flex flex-col gap-2 sm:hidden">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="w-12 h-12 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 flex items-center justify-center"
        >
          {exporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
        </button>
        <button
          onClick={() => { handleReset(); setMobileForm(true) }}
          className="w-14 h-14 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center dark:bg-indigo-600 dark:shadow-indigo-500/30"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Form Sheet */}
      <MobileFormSheet
        open={mobileForm}
        onClose={() => setMobileForm(false)}
        form={form} setForm={setForm} errors={errors}
        loading={loading} onSubmit={handleSubmit}
        onReset={handleReset} editMode={editMode} fileRef={fileRef}
      />

      {/* ── RECORDS TABLE / CARDS ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Table Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0 flex-wrap">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Truck className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">Registered Vehicles</span>
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
              placeholder="Search driver, vehicle, route…"
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

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-28 gap-2 text-slate-400 dark:text-slate-600">
              <Search className="w-6 h-6 opacity-40" />
              <span className="text-[13px]">No records match your search.</span>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {['Sr.No.','Transport Type','Vehicle No.','Driver','Helper','Route','Licence Expiry','Insurance Expiry','Action'].map((h, i) => (
                    <th key={i} className="px-3 py-2.5 text-center text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap first:w-10">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow key={row.id} row={row} idx={i + 1} onEdit={handleEdit} />
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
                Tap a card to see details &amp; edit.
              </p>
              {filtered.map(row => (
                <MobileRecordCard key={row.id} row={row} onEdit={handleEdit} />
              ))}
            </>
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing <span className="font-semibold text-slate-700 dark:text-slate-300">{filtered.length}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-300">{records.length}</span> records
          </p>
          {search && (
            <button onClick={() => setSearch('')}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* ── Mobile hint for FAB ─────────────────────────────────────────── */}
      <div className="flex sm:hidden items-center gap-2 px-4 py-3 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <p className="text-[12px] text-blue-700 dark:text-blue-300">
          Tap the <strong>+</strong> button (bottom-right) to add a new driver/vehicle record.
        </p>
      </div>

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
