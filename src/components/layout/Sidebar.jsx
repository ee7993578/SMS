import { cn } from '../../lib/utils'
import SidebarGroup from './SidebarGroup'

export default function Sidebar({
  moduleData, activeGroup, activePage,
  onGroupClick, onPageClick,
}) {
  return (
    <aside className="hidden md:flex flex-col w-[230px] flex-shrink-0 overflow-y-auto sidebar-scroll h-full transition-colors duration-300"
      style={{
        background: 'linear-gradient(180deg, #1a2040 0%, #111827 100%)',
        borderRight: '1px solid rgba(99,102,241,0.1)',
        boxShadow: '2px 0 12px rgba(0,0,0,0.15)',
      }}
    >
      {/* Context label */}
      <div className="px-4 py-3 border-b border-white/[0.06] flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.15)' }}
      >
        <p className="text-[10.5px] font-bold uppercase tracking-[1.2px] text-indigo-300/60">
          {moduleData.label}
        </p>
      </div>

      {/* Groups */}
      <nav className="py-2 flex-1">
        {moduleData.groups.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            moduleId={moduleData.id}
            activeGroup={activeGroup}
            activePage={activePage}
            onGroupClick={onGroupClick}
            onPageClick={onPageClick}
          />
        ))}
      </nav>
    </aside>
  )
}
