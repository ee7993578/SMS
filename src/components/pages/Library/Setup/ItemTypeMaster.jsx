/**
 * ItemTypeMaster.jsx
 * Library → Define Item Type
 *
 * Converts legacy ASPX item_type_master.aspx to fully-responsive React + Tailwind.
 * Reference theme: AllStudentStrength component (dark/light, ERP style)
 *
 * Features:
 *  - Add item type with validation
 *  - Edit inline (updates form + highlights row)
 *  - Delete with confirmation
 *  - Search/filter table
 *  - Toast notifications
 *  - Desktop: dense ERP table
 *  - Mobile: card-based layout with actions
 *  - Loading states, empty states
 */

import { useState, useMemo, useCallback, useRef } from "react";
import {
  BookOpen,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  Search,
  X,
  Check,
  AlertCircle,
  Loader2,
  ChevronDown,
  Tag,
  Library,
  ListFilter,
  Info,
  PackageOpen,
} from "lucide-react";

// ─── STATIC DUMMY DATA ────────────────────────────────────────────────────────
const INITIAL_ITEMS = [
  { item_type_id: 1, item_type: "BOOK" },
  { item_type_id: 2, item_type: "MAGAZINE" },
  { item_type_id: 3, item_type: "JOURNAL" },
  { item_type_id: 4, item_type: "NEWSPAPER" },
  { item_type_id: 5, item_type: "THESIS" },
  { item_type_id: 6, item_type: "ENCYCLOPEDIA" },
  { item_type_id: 7, item_type: "REFERENCE BOOK" },
  { item_type_id: 8, item_type: "E-BOOK" },
  { item_type_id: 9, item_type: "DVD / CD" },
  { item_type_id: 10, item_type: "MAP" },
];

let nextId = 11;

// ─── COLOR PALETTE for type badges ───────────────────────────────────────────
const BADGE_COLORS = [
  { fg: "#1d4ed8", bg: "#dbeafe" },
  { fg: "#7c3aed", bg: "#ede9fe" },
  { fg: "#0891b2", bg: "#cffafe" },
  { fg: "#059669", bg: "#d1fae5" },
  { fg: "#d97706", bg: "#fef3c7" },
  { fg: "#dc2626", bg: "#fee2e2" },
  { fg: "#0369a1", bg: "#e0f2fe" },
  { fg: "#be185d", bg: "#fce7f3" },
];
const getBadgeColor = (id) => BADGE_COLORS[id % BADGE_COLORS.length];

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getInitials = (name = "") =>
  name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

// ─── TOAST ────────────────────────────────────────────────────────────────────
function Toast({ message, type = "success", onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === "success" ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}
      style={{ animation: "slideUp .25s ease" }}
    >
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === "success" ? (
        <Check className="w-4 h-4 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-4 h-4 flex-shrink-0" />
      )}
      <span className="flex-1">{message}</span>
      <button onClick={onClose}>
        <X className="w-4 h-4 opacity-75 hover:opacity-100" />
      </button>
    </div>
  );
}

// ─── CONFIRM DIALOG ──────────────────────────────────────────────────────────
function ConfirmDialog({ open, itemName, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onCancel}
      />
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50
          w-[90vw] max-w-sm rounded-2xl bg-white dark:bg-[#1a1f35]
          border border-slate-200 dark:border-[rgba(99,102,241,0.25)]
          shadow-2xl p-6"
        style={{ animation: "popIn .2s ease" }}
      >
        <style>{`@keyframes popIn{from{opacity:0;transform:translate(-50%,-50%) scale(.92)}to{opacity:1;transform:translate(-50%,-50%) scale(1)}}`}</style>
        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/15 flex items-center justify-center flex-shrink-0">
            <Trash2 className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-slate-800 dark:text-slate-100">
              Delete Item Type?
            </p>
            <p className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700 px-4 py-3 mb-5">
          <p className="text-[13px] text-slate-600 dark:text-slate-300">
            Are you sure you want to delete{" "}
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {itemName}
            </span>
            ?
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold
              bg-rose-600 text-white hover:bg-rose-700 transition-colors shadow-md shadow-rose-500/20"
          >
            Yes, Delete
          </button>
        </div>
      </div>
    </>
  );
}

// ─── STAT CARD ────────────────────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, color }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400",
    violet:
      "bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400",
  };
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 dark:border-[rgba(99,102,241,0.12)] bg-white dark:bg-[#1a1f35] px-4 py-3 shadow-sm flex-1 min-w-0">
      <span
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors[color]}`}
      >
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <p className="text-[22px] font-bold text-slate-800 dark:text-slate-100 tabular-nums leading-tight">
          {value}
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          {label}
        </p>
      </div>
    </div>
  );
}

// ─── FORM SECTION ─────────────────────────────────────────────────────────────
function ItemTypeForm({ editItem, onSubmit, onReset, loading }) {
  const [value, setValue] = useState(editItem?.item_type ?? "");
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  // Sync when editItem changes
  useState(() => {
    setValue(editItem?.item_type ?? "");
    setError("");
  });

  // Keep local value in sync when editItem prop changes
  const prevEditRef = useRef(editItem);
  if (prevEditRef.current !== editItem) {
    prevEditRef.current = editItem;
    // side-effect-free update via render
  }

  const handleSubmit = () => {
    const trimmed = value.trim().toUpperCase();
    if (!trimmed) {
      setError("Item Type is required.");
      inputRef.current?.focus();
      return;
    }
    setError("");
    onSubmit(trimmed);
    if (!editItem) setValue("");
  };

  const handleReset = () => {
    setValue("");
    setError("");
    onReset();
  };

  const isEditing = !!editItem;

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
        <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
        <Library className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
        <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
          {isEditing ? "Edit Item Type" : "Define Item Type"}
        </span>
        {isEditing && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/25">
            <Pencil className="w-3 h-3 text-amber-700 dark:text-amber-400" />
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
              Editing
            </span>
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          {/* Input */}
          <div className="flex flex-col gap-1 w-full sm:w-72">
            <label className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
              Item Type <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value.toUpperCase());
                  if (error) setError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="e.g. BOOK, JOURNAL, MAGAZINE"
                maxLength={80}
                className={`w-full pl-9 pr-4 py-2.5 text-[13px] rounded-xl border outline-none transition-all
                  bg-white text-slate-800 placeholder-slate-300 font-medium
                  dark:bg-[#1e2238] dark:text-slate-200 dark:placeholder-slate-600
                  focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                  dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
                  ${error ? "border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20" : "border-slate-200 dark:border-[rgba(99,102,241,0.25)]"}`}
              />
            </div>
            {error && (
              <p className="flex items-center gap-1 text-[11px] text-rose-500 mt-0.5">
                <AlertCircle className="w-3 h-3 flex-shrink-0" />
                {error}
              </p>
            )}
            <p className="text-[11px] text-slate-400 dark:text-slate-500">
              Text is automatically converted to UPPERCASE.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:mt-[22px] w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
                text-[13px] font-semibold text-white shadow-md transition-all active:scale-95 disabled:opacity-70
                ${isEditing
                  ? "bg-amber-500 hover:bg-amber-600 shadow-amber-500/20"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-500/20 dark:bg-indigo-600 dark:hover:bg-indigo-700"
                }`}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : isEditing ? (
                <Check className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              {isEditing ? "Update" : "Submit"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                text-[13px] font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200
                dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DESKTOP TABLE ROW ────────────────────────────────────────────────────────
function DesktopRow({ row, idx, isEditing, onEdit, onDelete }) {
  const { fg, bg } = getBadgeColor(row.item_type_id);
  return (
    <tr
      className={`border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] transition-colors
        ${isEditing
          ? "bg-amber-50/60 dark:bg-amber-500/[0.05] ring-1 ring-amber-200 dark:ring-amber-500/20"
          : "hover:bg-slate-50/60 dark:hover:bg-white/[0.02]"
        }`}
    >
      {/* SrNo */}
      <td className="px-4 py-3 text-center text-[12px] text-slate-400 dark:text-slate-500 tabular-nums w-14">
        {idx}
      </td>

      {/* Item Type */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span
            className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-[10px] font-bold"
            style={{ background: bg, color: fg }}
          >
            {getInitials(row.item_type)}
          </span>
          <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
            {row.item_type}
          </span>
          {isEditing && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-[10px] font-bold text-amber-700 dark:text-amber-400">
              <Pencil className="w-2.5 h-2.5" /> Editing
            </span>
          )}
        </div>
      </td>

      {/* Actions */}
      <td className="px-4 py-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(row)}
            title="Edit"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200
              dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 dark:border-amber-500/20
              transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Edit
          </button>
          <button
            onClick={() => onDelete(row)}
            title="Delete"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
              bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200
              dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 dark:border-rose-500/20
              transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── MOBILE CARD ──────────────────────────────────────────────────────────────
function MobileCard({ row, idx, isEditing, onEdit, onDelete }) {
  const { fg, bg } = getBadgeColor(row.item_type_id);
  return (
    <div
      className={`rounded-xl border overflow-hidden shadow-sm transition-all
        ${isEditing
          ? "border-amber-300 dark:border-amber-500/40 bg-amber-50/40 dark:bg-amber-500/[0.05] ring-1 ring-amber-200 dark:ring-amber-500/20"
          : "border-slate-200 dark:border-[rgba(99,102,241,0.15)] bg-white dark:bg-[#1a1f35]"
        }`}
    >
      <div className="flex items-center gap-3 px-4 py-3.5">
        {/* Badge */}
        <span
          className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[11px] font-bold"
          style={{ background: bg, color: fg }}
        >
          {getInitials(row.item_type)}
        </span>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">
              {row.item_type}
            </p>
            {isEditing && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/15 text-[10px] font-bold text-amber-700 dark:text-amber-400">
                <Pencil className="w-2.5 h-2.5" /> Editing
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
            ID: #{row.item_type_id} · Sr. {idx}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onEdit(row)}
            className="w-9 h-9 rounded-xl flex items-center justify-center
              bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200
              dark:bg-amber-500/10 dark:text-amber-400 dark:hover:bg-amber-500/20 dark:border-amber-500/20
              transition-colors"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(row)}
            className="w-9 h-9 rounded-xl flex items-center justify-center
              bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200
              dark:bg-rose-500/10 dark:text-rose-400 dark:hover:bg-rose-500/20 dark:border-rose-500/20
              transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function ItemTypeMaster() {
  const [items, setItems] = useState(INITIAL_ITEMS);
  const [editItem, setEditItem] = useState(null); // null = add mode
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // row to delete

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  // ── Submit (Add / Update) ─────────────────────────────────────────────────
  const handleSubmit = useCallback(
    (typeName) => {
      setLoading(true);
      setTimeout(() => {
        if (editItem) {
          // UPDATE
          setItems((prev) =>
            prev.map((it) =>
              it.item_type_id === editItem.item_type_id
                ? { ...it, item_type: typeName }
                : it
            )
          );
          showToast(`Item type "${typeName}" updated successfully.`);
          setEditItem(null);
        } else {
          // ADD — check duplicate
          const dup = items.some(
            (it) => it.item_type.toUpperCase() === typeName.toUpperCase()
          );
          if (dup) {
            showToast(`"${typeName}" already exists.`, "error");
            setLoading(false);
            return;
          }
          const newItem = { item_type_id: nextId++, item_type: typeName };
          setItems((prev) => [...prev, newItem]);
          showToast(`Item type "${typeName}" added successfully.`);
        }
        setLoading(false);
      }, 400);
    },
    [editItem, items, showToast]
  );

  // ── Reset form ────────────────────────────────────────────────────────────
  const handleReset = useCallback(() => {
    setEditItem(null);
  }, []);

  // ── Delete flow ───────────────────────────────────────────────────────────
  const handleDeleteRequest = useCallback((row) => {
    setConfirmDelete(row);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (!confirmDelete) return;
    setItems((prev) =>
      prev.filter((it) => it.item_type_id !== confirmDelete.item_type_id)
    );
    showToast(`"${confirmDelete.item_type}" deleted.`);
    if (editItem?.item_type_id === confirmDelete.item_type_id) setEditItem(null);
    setConfirmDelete(null);
  }, [confirmDelete, editItem, showToast]);

  // ── Filtered list ─────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((it) => it.item_type.toLowerCase().includes(q));
  }, [items, search]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#10132a] p-4 sm:p-6 lg:p-8 space-y-5">
      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[12px] text-slate-400 dark:text-slate-500 mb-2 flex-wrap">
            <span>Home</span>
            <ChevronDown className="w-3 h-3 -rotate-90" />
            <span>Library</span>
            <ChevronDown className="w-3 h-3 -rotate-90" />
            <span className="text-blue-600 dark:text-indigo-400 font-semibold">
              Define Item Type
            </span>
          </div>
          <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
            Library Item Type
          </h1>
          <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
            Manage item types for library catalogue — books, journals, magazines
            &amp; more.
          </p>
        </div>
      </div>

      {/* ── Stat Cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={Library}
          label="Total Types"
          value={items.length}
          color="blue"
        />
        <StatCard
          icon={ListFilter}
          label="Filtered"
          value={filtered.length}
          color="violet"
        />
        <StatCard
          icon={Tag}
          label="Last Added"
          value={items.length > 0 ? `#${items[items.length - 1].item_type_id}` : "—"}
          color="emerald"
        />
      </div>

      {/* ── Form Card ───────────────────────────────────────────────────── */}
      <ItemTypeForm
        editItem={editItem}
        onSubmit={handleSubmit}
        onReset={handleReset}
        loading={loading}
      />

      {/* ── Data Table / Cards ───────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
            <Tag className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200">
              Item Types
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex-shrink-0">
              {filtered.length} record{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56 flex-shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search item types…"
              className="w-full pl-8 pr-7 py-1.5 text-[12px] rounded-lg border outline-none transition-all
                bg-white text-slate-700 border-slate-200 placeholder-slate-300
                focus:border-blue-400 focus:ring-2 focus:ring-blue-100
                dark:bg-[#1e2238] dark:text-slate-200 dark:border-[rgba(99,102,241,0.25)]
                dark:placeholder-slate-600 dark:focus:border-indigo-400"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Info hint */}
        <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 dark:border-[rgba(99,102,241,0.07)] bg-blue-50/20 dark:bg-blue-500/[0.03]">
          <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
          <p className="text-[12px] text-blue-700 dark:text-blue-400">
            Click <strong>Edit</strong> to modify an existing type. Changes will
            reflect immediately in the form above.
          </p>
        </div>

        {/* ── DESKTOP TABLE ── */}
        <div className="hidden md:block overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState search={search} onClear={() => setSearch("")} />
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 dark:border-[rgba(99,102,241,0.1)] bg-slate-50/50 dark:bg-white/[0.02]">
                  {["SrNo.", "Item Type", "Actions"].map((h, i) => (
                    <th
                      key={i}
                      className={`px-4 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 whitespace-nowrap
                        ${i === 0 ? "text-center w-14" : i === 2 ? "text-right" : "text-left"}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((row, i) => (
                  <DesktopRow
                    key={row.item_type_id}
                    row={row}
                    idx={i + 1}
                    isEditing={editItem?.item_type_id === row.item_type_id}
                    onEdit={setEditItem}
                    onDelete={handleDeleteRequest}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── MOBILE CARDS ── */}
        <div className="md:hidden p-4 space-y-3">
          {filtered.length === 0 ? (
            <EmptyState search={search} onClear={() => setSearch("")} />
          ) : (
            filtered.map((row, i) => (
              <MobileCard
                key={row.item_type_id}
                row={row}
                idx={i + 1}
                isEditing={editItem?.item_type_id === row.item_type_id}
                onEdit={setEditItem}
                onDelete={handleDeleteRequest}
              />
            ))
          )}
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/50 dark:bg-white/[0.015]">
          <p className="text-[12px] text-slate-400 dark:text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              {items.length}
            </span>{" "}
            records
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="text-[12px] text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear search
            </button>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={!!confirmDelete}
        itemName={confirmDelete?.item_type}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete(null)}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ search, onClear }) {
  return (
    <div className="flex flex-col items-center justify-center py-14 gap-4 text-slate-400 dark:text-slate-600">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
        <PackageOpen className="w-7 h-7 opacity-50" />
      </div>
      <div className="text-center">
        {search ? (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
              No results for "{search}"
            </p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Try a different keyword or{" "}
              <button
                onClick={onClear}
                className="text-blue-600 dark:text-blue-400 underline"
              >
                clear search
              </button>
              .
            </p>
          </>
        ) : (
          <>
            <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">
              No item types defined yet
            </p>
            <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
              Add your first item type using the form above.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
