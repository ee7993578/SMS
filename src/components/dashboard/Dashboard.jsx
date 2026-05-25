import { Users, UserCheck, DollarSign, CheckSquare } from 'lucide-react'
import StatCard from '../ui/StatCard'
import { Card, CardHeader, CardTitle, CardBody } from '../ui/Card'
import Button from '../ui/Button'

const STATS = [
  { icon: Users,      value: '1,284', label: 'Total Students',        color: 'blue' },
  { icon: UserCheck,  value: '86',    label: 'Teaching Staff',         color: 'green' },
  { icon: DollarSign, value: '₹4.2L', label: 'Fee Collected Today',    color: 'orange' },
  { icon: CheckSquare,value: '94.2%', label: 'Avg Attendance',         color: 'purple' },
]

const QUICK_LINKS = [
  { label: 'Marks Entry',   mod: 'exam-master',    grp: 'marks-entry',       page: 'define-marks-new' },
  { label: 'Fee Collection',mod: 'fee',             grp: 'fee-collection',    page: 'collect-fee' },
  { label: 'Attendance',    mod: 'reports',         grp: 'attendance-reports',page: 'daily-attendance' },
  { label: 'Send SMS',      mod: 'communication',   grp: 'messaging',         page: 'send-sms' },
  { label: 'Report Cards',  mod: 'reports',         grp: 'academic-reports',  page: 'report-card-prim' },
  { label: 'Certificates',  mod: 'certificates',    grp: 'gen-certs',         page: 'bonafide' },
]

const ACTIVITY = [
  { color: '#3b82f6', text: 'Fee collected for Class X-A — ₹12,400',    time: '2 min ago' },
  { color: '#10b981', text: 'Attendance marked for Class IX-B',           time: '15 min ago' },
  { color: '#f59e0b', text: 'New admission registered: Aryan Kumar',      time: '42 min ago' },
  { color: '#8b5cf6', text: 'Report card generated for Class VIII',       time: '1 hr ago' },
  { color: '#ef4444', text: 'Pending fee reminder sent to 24 parents',    time: '2 hrs ago' },
]

export default function Dashboard({ onPageClick }) {
  return (
    <div className="page-animate space-y-4">
      {/* Welcome banner */}
      <div className="relative rounded-[14px] p-6 text-white overflow-hidden welcome-card"
        style={{
          background: 'linear-gradient(135deg, #1e3a8a 0%, #312e81 40%, #1e40af 70%, #1d4ed8 100%)',
          boxShadow: '0 8px 32px rgba(30,58,138,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute right-[-40px] top-[-40px] w-48 h-48 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.25), transparent 70%)' }}
        />
        <div className="absolute right-[60px] bottom-[-60px] w-36 h-36 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent 70%)' }}
        />
        <div className="absolute left-[-20px] bottom-[-20px] w-32 h-32 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15), transparent 70%)' }}
        />
        <div className="relative z-10">
          <h2 className="font-display text-[20px] font-bold mb-1">Welcome back, Sudheer Babu! 👋</h2>
          <p className="text-[13px] text-white/80">APS International School — Manage your school effortlessly.</p>
          <p className="mt-3 text-[12px] text-white/60">📅 Academic Session: 2026–2027 &nbsp;|&nbsp; Last Login: 13 May 2026, 1:29 PM</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {STATS.map(s => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Quick links + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick links */}
        <Card>
          <CardHeader><CardTitle>Quick Access</CardTitle></CardHeader>
          <CardBody>
            <div className="grid grid-cols-3 gap-2.5">
              {QUICK_LINKS.map(link => (
                <button
                  key={link.label}
                  onClick={() => onPageClick(link.mod, link.grp, link.page)}
                  className="flex flex-col items-center gap-2 py-3.5 px-2 bg-slate-50 dark:bg-white/[0.03] hover:bg-blue-50 dark:hover:bg-indigo-500/[0.08] border border-slate-200 dark:border-[rgba(99,102,241,0.1)] hover:border-blue-200 dark:hover:border-indigo-500/30 rounded-[10px] transition-all duration-200 hover:-translate-y-0.5 group"
                  style={{
                    boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  <div className="w-9 h-9 rounded-[9px] flex items-center justify-center group-hover:scale-110 transition-transform duration-200"
                    style={{
                      background: 'linear-gradient(135deg, #1e3a8a, #4f46e5)',
                      boxShadow: '0 3px 8px rgba(30,58,138,0.3)',
                    }}
                  >
                    <span className="text-white text-[11px] font-bold">
                      {link.label.charAt(0)}
                    </span>
                  </div>
                  <span className="text-[11.5px] font-medium text-slate-600 dark:text-slate-300 text-center leading-tight">{link.label}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <span className="text-[12px] text-slate-400 dark:text-slate-500">Today</span>
          </CardHeader>
          <CardBody className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-[rgba(99,102,241,0.06)]">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                  <div className="w-2 h-2 rounded-full mt-[5px] flex-shrink-0"
                    style={{ background: a.color, boxShadow: `0 0 6px ${a.color}80` }}
                  />
                  <div>
                    <p className="text-[13px] text-slate-800 dark:text-slate-200">{a.text}</p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
