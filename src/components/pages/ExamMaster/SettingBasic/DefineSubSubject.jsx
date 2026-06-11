/**
 * DefineSubSubject.jsx
 * Folder: src/pages/ExamMaster/DefineSubSubject.jsx
 *
 * Converts legacy ASPX "Define Sub-Subject" page to fully-responsive React + Tailwind.
 *
 * Features:
 *  - Class dropdown → Subject dropdown (dependent/cascading)
 *  - Checkbox list of sub-subjects (horizontal on desktop, grid on mobile)
 *  - Submit button with validation & toast feedback
 *  - Mobile: full-width stacked form in card layout
 *  - Desktop: ERP-style clean form with side-by-side dropdowns
 */

import { useState, useCallback, useMemo } from 'react'
import {
  BookOpen, ChevronDown, AlertCircle, Check, X,
  Loader2, RefreshCw, Save, BookMarked,
  GraduationCap, ListChecks, Filter, Info,
  School2, ChevronRight, CheckSquare, Square,
  Layers, Tag
} from 'lucide-react'

// ─── STATIC / DUMMY DATA ──────────────────────────────────────────────────────
const CLASSES = [
  { id: '1',  name: 'Nursery'    },
  { id: '2',  name: 'LKG'        },
  { id: '3',  name: 'UKG'        },
  { id: '4',  name: 'Class I'    },
  { id: '5',  name: 'Class II'   },
  { id: '6',  name: 'Class III'  },
  { id: '7',  name: 'Class IV'   },
  { id: '8',  name: 'Class V'    },
  { id: '9',  name: 'Class VI'   },
  { id: '10', name: 'Class VII'  },
  { id: '11', name: 'Class VIII' },
  { id: '12', name: 'Class IX'   },
  { id: '13', name: 'Class X'    },
  { id: '14', name: 'Class XI'   },
  { id: '15', name: 'Class XII'  },
]

// Subjects available per class (simulates API response)
const SUBJECTS_BY_CLASS = {
  '1':  [{ id: 's1', name: 'Drawing' }, { id: 's2', name: 'Rhymes' }],
  '2':  [{ id: 's1', name: 'Drawing' }, { id: 's2', name: 'Rhymes' }, { id: 's3', name: 'EVS' }],
  '3':  [{ id: 's1', name: 'Drawing' }, { id: 's2', name: 'EVS' }, { id: 's3', name: 'English' }],
  '4':  [{ id: 's1', name: 'Hindi' }, { id: 's2', name: 'English' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'EVS' }],
  '5':  [{ id: 's1', name: 'Hindi' }, { id: 's2', name: 'English' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'EVS' }],
  '6':  [{ id: 's1', name: 'Hindi' }, { id: 's2', name: 'English' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'EVS' }],
  '7':  [{ id: 's1', name: 'Hindi' }, { id: 's2', name: 'English' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'Science' }, { id: 's5', name: 'Social Science' }],
  '8':  [{ id: 's1', name: 'Hindi' }, { id: 's2', name: 'English' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'Science' }, { id: 's5', name: 'Social Science' }],
  '9':  [{ id: 's1', name: 'Hindi' }, { id: 's2', name: 'English' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'Science' }, { id: 's5', name: 'Social Science' }],
  '10': [{ id: 's1', name: 'Hindi' }, { id: 's2', name: 'English' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'Science' }, { id: 's5', name: 'Social Science' }],
  '11': [{ id: 's1', name: 'Hindi' }, { id: 's2', name: 'English' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'Science' }, { id: 's5', name: 'Social Science' }],
  '12': [{ id: 's1', name: 'Hindi' }, { id: 's2', name: 'English' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'Science' }, { id: 's5', name: 'Social Science' }, { id: 's6', name: 'Sanskrit' }],
  '13': [{ id: 's1', name: 'Hindi' }, { id: 's2', name: 'English' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'Science' }, { id: 's5', name: 'Social Science' }, { id: 's6', name: 'Sanskrit' }],
  '14': [{ id: 's1', name: 'Physics' }, { id: 's2', name: 'Chemistry' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'Biology' }, { id: 's5', name: 'English' }, { id: 's6', name: 'Hindi' }, { id: 's7', name: 'Computer Science' }, { id: 's8', name: 'Physical Education' }],
  '15': [{ id: 's1', name: 'Physics' }, { id: 's2', name: 'Chemistry' }, { id: 's3', name: 'Maths' }, { id: 's4', name: 'Biology' }, { id: 's5', name: 'English' }, { id: 's6', name: 'Hindi' }, { id: 's7', name: 'Computer Science' }, { id: 's8', name: 'Physical Education' }],
}

// Sub-subjects available per subject (simulates second API call)
const SUB_SUBJECTS_BY_SUBJECT = {
  's1': [ // Hindi
    { id: 'ss1', name: 'Vyakaran (Grammar)'    },
    { id: 'ss2', name: 'Gadya (Prose)'         },
    { id: 'ss3', name: 'Padya (Poetry)'        },
    { id: 'ss4', name: 'Lekhan (Writing)'      },
    { id: 'ss5', name: 'Patra Lekhan'          },
    { id: 'ss6', name: 'Nibandh (Essay)'       },
    { id: 'ss7', name: 'Kahani (Story)'        },
    { id: 'ss8', name: 'Anuchhed Lekhan'       },
    { id: 'ss9', name: 'Apadhit Gadyansh'      },
    { id: 'ss10', name: 'Muhavare'             },
  ],
  's2': [ // English
    { id: 'ss1', name: 'Grammar'               },
    { id: 'ss2', name: 'Reading Comprehension' },
    { id: 'ss3', name: 'Writing Skills'        },
    { id: 'ss4', name: 'Literature'            },
    { id: 'ss5', name: 'Vocabulary'            },
    { id: 'ss6', name: 'Composition'           },
    { id: 'ss7', name: 'Oral Communication'    },
    { id: 'ss8', name: 'Listening Skills'      },
  ],
  's3': [ // Maths
    { id: 'ss1', name: 'Algebra'               },
    { id: 'ss2', name: 'Geometry'              },
    { id: 'ss3', name: 'Arithmetic'            },
    { id: 'ss4', name: 'Trigonometry'          },
    { id: 'ss5', name: 'Statistics'            },
    { id: 'ss6', name: 'Probability'           },
    { id: 'ss7', name: 'Calculus'              },
    { id: 'ss8', name: 'Coordinate Geometry'   },
    { id: 'ss9', name: 'Number System'         },
    { id: 'ss10', name: 'Mensuration'          },
  ],
  's4': [ // Science / Biology
    { id: 'ss1', name: 'Physics'               },
    { id: 'ss2', name: 'Chemistry'             },
    { id: 'ss3', name: 'Biology'               },
    { id: 'ss4', name: 'Practical'             },
    { id: 'ss5', name: 'Project Work'          },
  ],
  's5': [ // Social Science / EVS
    { id: 'ss1', name: 'History'               },
    { id: 'ss2', name: 'Geography'             },
    { id: 'ss3', name: 'Civics'                },
    { id: 'ss4', name: 'Economics'             },
    { id: 'ss5', name: 'Map Work'              },
  ],
  's6': [ // Sanskrit / Computer
    { id: 'ss1', name: 'Vyakaran'              },
    { id: 'ss2', name: 'Gadyansh'              },
    { id: 'ss3', name: 'Padyansh'              },
    { id: 'ss4', name: 'Anuvad'                },
    { id: 'ss5', name: 'Rachna'                },
  ],
  's7': [ // Computer Science
    { id: 'ss1', name: 'Theory'                },
    { id: 'ss2', name: 'Practical'             },
    { id: 'ss3', name: 'Project'               },
    { id: 'ss4', name: 'Python Programming'    },
    { id: 'ss5', name: 'Database Management'   },
    { id: 'ss6', name: 'Networking'            },
  ],
  's8': [ // Physical Education
    { id: 'ss1', name: 'Theory'                },
    { id: 'ss2', name: 'Practical'             },
    { id: 'ss3', name: 'Athletics'             },
    { id: 'ss4', name: 'Games'                 },
  ],
}

// Breadcrumb items
const BREADCRUMB = [
  { label: 'Home',          href: '#' },
  { label: 'Exam Master',   href: '#' },
  { label: 'Define Sub-Subject' },
]

// Color palette for subject checkboxes
const CHIP_COLORS = [
  { ring: 'ring-blue-300 dark:ring-blue-500/50',   bg: 'bg-blue-50 dark:bg-blue-500/10',   text: 'text-blue-700 dark:text-blue-300',   check: 'bg-blue-600 dark:bg-blue-500'   },
  { ring: 'ring-violet-300 dark:ring-violet-500/50', bg: 'bg-violet-50 dark:bg-violet-500/10', text: 'text-violet-700 dark:text-violet-300', check: 'bg-violet-600 dark:bg-violet-500' },
  { ring: 'ring-emerald-300 dark:ring-emerald-500/50', bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-700 dark:text-emerald-300', check: 'bg-emerald-600 dark:bg-emerald-500' },
  { ring: 'ring-amber-300 dark:ring-amber-500/50', bg: 'bg-amber-50 dark:bg-amber-500/10', text: 'text-amber-700 dark:text-amber-300', check: 'bg-amber-600 dark:bg-amber-500' },
  { ring: 'ring-cyan-300 dark:ring-cyan-500/50', bg: 'bg-cyan-50 dark:bg-cyan-500/10', text: 'text-cyan-700 dark:text-cyan-300', check: 'bg-cyan-600 dark:bg-cyan-500' },
  { ring: 'ring-rose-300 dark:ring-rose-500/50', bg: 'bg-rose-50 dark:bg-rose-500/10', text: 'text-rose-700 dark:text-rose-300', check: 'bg-rose-600 dark:bg-rose-500' },
  { ring: 'ring-indigo-300 dark:ring-indigo-500/50', bg: 'bg-indigo-50 dark:bg-indigo-500/10', text: 'text-indigo-700 dark:text-indigo-300', check: 'bg-indigo-600 dark:bg-indigo-500' },
  { ring: 'ring-teal-300 dark:ring-teal-500/50', bg: 'bg-teal-50 dark:bg-teal-500/10', text: 'text-teal-700 dark:text-teal-300', check: 'bg-teal-600 dark:bg-teal-500' },
  { ring: 'ring-orange-300 dark:ring-orange-500/50', bg: 'bg-orange-50 dark:bg-orange-500/10', text: 'text-orange-700 dark:text-orange-300', check: 'bg-orange-600 dark:bg-orange-500' },
  { ring: 'ring-pink-300 dark:ring-pink-500/50', bg: 'bg-pink-50 dark:bg-pink-500/10', text: 'text-pink-700 dark:text-pink-300', check: 'bg-pink-600 dark:bg-pink-500' },
]

const chipColor = (idx) => CHIP_COLORS[idx % CHIP_COLORS.length]

// ─── PRIMITIVE COMPONENTS ─────────────────────────────────────────────────────

/** Native select with chevron icon and error state */
function NativeSelect({ value, onChange, children, placeholder, error, disabled, id }) {
  return (
    <div className="relative">
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full appearance-none pl-3 pr-8 py-2.5 text-[13px] rounded-xl border outline-none transition-all cursor-pointer
          bg-white text-slate-800
          focus:border-blue-400 focus:ring-2 focus:ring-blue-100
          dark:bg-[#1e2238] dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/20
          disabled:opacity-50 disabled:cursor-not-allowed
          ${error
            ? 'border-rose-400 ring-2 ring-rose-100 dark:ring-rose-500/20'
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

/** Form field wrapper with label + error */
function Field({ label, error, required, children, htmlFor }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide"
      >
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-[11px] text-rose-500 mt-0.5">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

/** Toast notification */
function Toast({ message, type = 'success', onClose }) {
  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3
        rounded-2xl shadow-xl text-[13px] font-semibold min-w-[260px] max-w-[90vw]
        ${type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
      style={{ animation: 'toastUp .25s ease' }}
    >
      <style>{`@keyframes toastUp{from{opacity:0;transform:translateX(-50%) translateY(10px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}`}</style>
      {type === 'success'
        ? <Check className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} aria-label="Close"><X className="w-4 h-4 opacity-75 hover:opacity-100" /></button>
    </div>
  )
}

/** Breadcrumb */
function Breadcrumb({ items }) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 flex-wrap">
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" />}
          {item.href ? (
            <a href={item.href} className="text-[12px] text-blue-600 dark:text-indigo-400 hover:underline">
              {item.label}
            </a>
          ) : (
            <span className="text-[12px] text-slate-500 dark:text-slate-400">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

/** Single sub-subject checkbox chip */
function SubjectChip({ subject, checked, onChange, colorIdx }) {
  const c = chipColor(colorIdx)
  return (
    <label
      className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border-2 cursor-pointer
        select-none transition-all duration-150 group
        ${checked
          ? `${c.bg} ${c.ring} ring-2 border-transparent`
          : 'bg-white dark:bg-[#1e2238] border-slate-200 dark:border-[rgba(99,102,241,0.2)] hover:border-slate-300 dark:hover:border-[rgba(99,102,241,0.35)]'
        }`}
    >
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
        aria-label={subject.name}
      />
      {/* Custom checkbox */}
      <span className={`w-4 h-4 rounded-md flex-shrink-0 flex items-center justify-center border-2 transition-all
        ${checked
          ? `${c.check} border-transparent`
          : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 group-hover:border-slate-400'
        }`}
      >
        {checked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
      </span>
      <span className={`text-[12px] font-semibold leading-tight ${checked ? c.text : 'text-slate-600 dark:text-slate-300'}`}>
        {subject.name}
      </span>
    </label>
  )
}

/** Summary pill — shows count of selected sub-subjects */
function SelectionPill({ count, total }) {
  if (total === 0) return null
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold
      ${count > 0
        ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
      }`}
    >
      <ListChecks className="w-3 h-3" />
      {count}/{total} selected
    </span>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function DefineSubSubject() {
  const [selectedClass,   setSelectedClass]   = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const [checkedSubs,     setCheckedSubs]     = useState({}) // { subjectId_subSubId: bool }
  const [errors,          setErrors]          = useState({})
  const [loading,         setLoading]         = useState(false)
  const [subLoading,      setSubLoading]      = useState(false)
  const [toast,           setToast]           = useState(null)

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  // ── Subjects for chosen class ────────────────────────────────────────────
  const subjects = useMemo(() => {
    if (!selectedClass) return []
    return SUBJECTS_BY_CLASS[selectedClass] || []
  }, [selectedClass])

  // ── Sub-subjects for chosen subject ─────────────────────────────────────
  const subSubjects = useMemo(() => {
    if (!selectedSubject) return []
    return SUB_SUBJECTS_BY_SUBJECT[selectedSubject] || []
  }, [selectedSubject])

  // ── Class change → reset downstream ──────────────────────────────────────
  const handleClassChange = useCallback((e) => {
    const val = e.target.value
    setSelectedClass(val)
    setSelectedSubject('')
    setCheckedSubs({})
    setErrors(p => ({ ...p, class: undefined, subject: undefined }))
  }, [])

  // ── Subject change → simulate loading sub-subjects ────────────────────
  const handleSubjectChange = useCallback((e) => {
    const val = e.target.value
    setSelectedSubject(val)
    setCheckedSubs({})
    setErrors(p => ({ ...p, subject: undefined }))
    if (val) {
      setSubLoading(true)
      setTimeout(() => setSubLoading(false), 400) // simulate API fetch
    }
  }, [])

  // ── Toggle sub-subject checkbox ───────────────────────────────────────
  const toggleSub = useCallback((subId) => {
    setCheckedSubs(p => ({ ...p, [subId]: !p[subId] }))
    setErrors(p => ({ ...p, subs: undefined }))
  }, [])

  // ── Select / Deselect all ────────────────────────────────────────────
  const allSelected = subSubjects.length > 0 && subSubjects.every(s => checkedSubs[s.id])
  const toggleAll = () => {
    if (allSelected) {
      setCheckedSubs({})
    } else {
      const all = {}
      subSubjects.forEach(s => { all[s.id] = true })
      setCheckedSubs(all)
    }
  }

  const selectedCount = subSubjects.filter(s => checkedSubs[s.id]).length

  // ── Validate + Submit ────────────────────────────────────────────────
  const handleSubmit = () => {
    const err = {}
    if (!selectedClass)   err.class   = 'Please select a class'
    if (!selectedSubject) err.subject = 'Please select a subject'
    if (selectedCount === 0) err.subs = 'Please select at least one sub-subject'
    if (Object.keys(err).length) { setErrors(err); return }
    setErrors({})
    setLoading(true)

    // Simulate API call
    const className   = CLASSES.find(c => c.id === selectedClass)?.name
    const subjectName = subjects.find(s => s.id === selectedSubject)?.name
    const selected    = subSubjects.filter(s => checkedSubs[s.id]).map(s => s.name)

    setTimeout(() => {
      setLoading(false)
      showToast(`Sub-subjects defined for ${className} → ${subjectName} (${selected.length} selected)`)
      console.log('API Payload:', { classId: selectedClass, subjectId: selectedSubject, subSubjectIds: selected })
    }, 900)
  }

  // ── Reset ──────────────────────────────────────────────────────────
  const handleReset = () => {
    setSelectedClass('')
    setSelectedSubject('')
    setCheckedSubs({})
    setErrors({})
  }

  const className   = CLASSES.find(c => c.id === selectedClass)?.name
  const subjectName = subjects.find(s => s.id === selectedSubject)?.name

  return (
    <div className="space-y-4 pb-10 min-h-screen">

      {/* ── Breadcrumb + Page Title ───────────────────────────────────────── */}
      <div className="space-y-1">
        <Breadcrumb items={BREADCRUMB} />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1">
          <div>
            <h1 className="text-[20px] font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-indigo-400" />
              Define Sub-Subject
            </h1>
            <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-0.5">
              Assign sub-subjects to a class &amp; subject combination.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Form Card ────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 dark:border-[rgba(99,102,241,0.2)] bg-white dark:bg-[#1a1f35] shadow-sm overflow-hidden">

        {/* Card Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 dark:border-[rgba(99,102,241,0.15)] bg-slate-50/70 dark:bg-white/[0.02]">
          <span className="w-1 h-5 rounded-full bg-blue-500 flex-shrink-0" />
          <BookMarked className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
            Define Sub-Subject
          </span>
        </div>

        <div className="p-5 space-y-6">

          {/* ── Step 1: Select Class & Subject ─────────────────────────── */}
          <div>
            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-4">
              <span className="w-6 h-6 rounded-full bg-blue-600 dark:bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">1</span>
              <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">Select Class &amp; Subject</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Class Dropdown */}
              <Field label="Class" error={errors.class} required htmlFor="ddlclass">
                <NativeSelect
                  id="ddlclass"
                  value={selectedClass}
                  onChange={handleClassChange}
                  placeholder="-- Select Class --"
                  error={errors.class}
                >
                  {CLASSES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </NativeSelect>
              </Field>

              {/* Subject Dropdown */}
              <Field label="Subject" error={errors.subject} required htmlFor="ddlsubject">
                <NativeSelect
                  id="ddlsubject"
                  value={selectedSubject}
                  onChange={handleSubjectChange}
                  placeholder={selectedClass ? '-- Select Subject --' : '-- Select class first --'}
                  error={errors.subject}
                  disabled={!selectedClass}
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </NativeSelect>
              </Field>
            </div>

            {/* Context breadcrumb — shows when both selected */}
            {selectedClass && selectedSubject && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 text-[12px] font-semibold text-blue-700 dark:text-blue-300">
                  <GraduationCap className="w-3.5 h-3.5" />
                  {className}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-[12px] font-semibold text-violet-700 dark:text-violet-300">
                  <BookOpen className="w-3.5 h-3.5" />
                  {subjectName}
                </span>
              </div>
            )}
          </div>

          {/* ── Divider ──────────────────────────────────────────────────── */}
          {(selectedSubject || subSubjects.length > 0) && (
            <div className="border-t border-slate-100 dark:border-[rgba(99,102,241,0.1)]" />
          )}

          {/* ── Step 2: Select Sub-Subjects ──────────────────────────────── */}
          {selectedSubject && (
            <div>
              {/* Step indicator */}
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-blue-600 dark:bg-indigo-600 text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">2</span>
                <span className="text-[13px] font-semibold text-slate-700 dark:text-slate-200">
                  Add Sub-Subject
                </span>
              </div>

              {/* Loading state */}
              {subLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-blue-600 dark:text-indigo-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-[13px] font-medium">Loading sub-subjects…</span>
                </div>
              ) : subSubjects.length === 0 ? (
                /* No sub-subjects found */
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400 dark:text-slate-600">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <Tag className="w-6 h-6 opacity-50" />
                  </div>
                  <p className="text-[13px] text-slate-400 dark:text-slate-500 text-center">
                    No sub-subjects available for this subject.<br />
                    <span className="text-[12px]">Please contact the administrator.</span>
                  </p>
                </div>
              ) : (
                <>
                  {/* Select All + Count row */}
                  <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={toggleAll}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold
                          bg-slate-100 text-slate-700 hover:bg-slate-200
                          dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
                          transition-colors"
                      >
                        {allSelected
                          ? <><CheckSquare className="w-3.5 h-3.5 text-blue-600" /> Deselect All</>
                          : <><Square className="w-3.5 h-3.5" /> Select All</>
                        }
                      </button>
                      <SelectionPill count={selectedCount} total={subSubjects.length} />
                    </div>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500">
                      {subSubjects.length} sub-subject{subSubjects.length !== 1 ? 's' : ''} available
                    </span>
                  </div>

                  {/* Error */}
                  {errors.subs && (
                    <p className="flex items-center gap-1.5 text-[11px] text-rose-500 mb-3">
                      <AlertCircle className="w-3 h-3 flex-shrink-0" />{errors.subs}
                    </p>
                  )}

                  {/* Checkbox Grid */}
                  {/* Desktop: up to 5 per row | Tablet: 3 | Mobile: 2 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2.5">
                    {subSubjects.map((sub, idx) => (
                      <SubjectChip
                        key={sub.id}
                        subject={sub}
                        checked={!!checkedSubs[sub.id]}
                        onChange={() => toggleSub(sub.id)}
                        colorIdx={idx}
                      />
                    ))}
                  </div>

                  {/* Info hint */}
                  <div className="flex items-start gap-2 mt-4 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-500/[0.05] border border-blue-100 dark:border-blue-500/15">
                    <Info className="w-3.5 h-3.5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-700 dark:text-blue-400 leading-relaxed">
                      Select all sub-subjects you want to assign under <strong>{subjectName}</strong> for <strong>{className}</strong>.
                      Previously defined sub-subjects (if any) are pre-selected.
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* ── Empty state when nothing selected ────────────────────────── */}
          {!selectedClass && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-slate-400 dark:text-slate-600">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <School2 className="w-7 h-7 opacity-40" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-slate-500 dark:text-slate-400">Start by selecting a Class</p>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 mt-1">
                  Choose a class, then a subject to see available sub-subjects.
                </p>
              </div>
            </div>
          )}

          {selectedClass && !selectedSubject && (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-slate-400 dark:text-slate-600">
              <BookOpen className="w-8 h-8 opacity-30" />
              <p className="text-[13px] text-slate-400 dark:text-slate-500">
                Now select a <strong className="text-slate-500 dark:text-slate-400">Subject</strong> above.
              </p>
            </div>
          )}

        </div>

        {/* ── Card Footer: Action Buttons ──────────────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 px-5 py-4
          border-t border-slate-100 dark:border-[rgba(99,102,241,0.15)]
          bg-slate-50/50 dark:bg-white/[0.015]">

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl
              text-[13px] font-semibold
              bg-slate-100 text-slate-700 hover:bg-slate-200
              dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700
              transition-all active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reset
          </button>

          {/* Submit */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl
              text-[13px] font-semibold text-white
              bg-blue-600 hover:bg-blue-700
              dark:bg-indigo-600 dark:hover:bg-indigo-700
              shadow-md shadow-blue-500/20 dark:shadow-indigo-500/20
              transition-all active:scale-95 disabled:opacity-70"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              : <><Save className="w-4 h-4" /> Define Sub-Subject</>
            }
          </button>
        </div>
      </div>

      {/* ── Preview Card (shows after selection) ────────────────────────── */}
      {selectedCount > 0 && (
        <div className="rounded-2xl border border-emerald-200 dark:border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-500/[0.05] shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-emerald-100 dark:border-emerald-500/15">
            <span className="w-1 h-5 rounded-full bg-emerald-500 flex-shrink-0" />
            <ListChecks className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <span className="text-[14px] font-bold text-slate-700 dark:text-slate-200 flex-1">
              Selection Preview
            </span>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
              {selectedCount} selected
            </span>
          </div>
          <div className="p-5">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-500/15 text-[12px] font-semibold text-blue-700 dark:text-blue-300">
                <GraduationCap className="w-3.5 h-3.5" />{className}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 dark:bg-violet-500/15 text-[12px] font-semibold text-violet-700 dark:text-violet-300">
                <BookOpen className="w-3.5 h-3.5" />{subjectName}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {subSubjects.filter(s => checkedSubs[s.id]).map((s, idx) => {
                const c = chipColor(idx)
                return (
                  <span
                    key={s.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold ${c.bg} ${c.text}`}
                  >
                    <Check className="w-3 h-3" strokeWidth={3} />
                    {s.name}
                  </span>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
