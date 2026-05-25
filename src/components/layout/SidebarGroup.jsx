import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '../../lib/utils'
import { ICON_MAP } from './iconMap'

export default function SidebarGroup({
  group, moduleId,
  activeGroup, activePage,
  onGroupClick, onPageClick,
}) {
  const isOpen   = group.id === activeGroup
  const Icon     = ICON_MAP[group.icon] || ICON_MAP['Folder']

  return (
    <div className="mb-0.5">
      {/* Group header */}
      <button
        onClick={() => onGroupClick(group.id)}
        className={cn(
          'w-full flex items-center gap-2.5 px-4 py-2.5 transition-all duration-200 select-none',
          isOpen ? 'bg-indigo-500/[0.15]' : 'hover:bg-white/[0.06]'
        )}
        style={isOpen ? { borderLeft: '2px solid rgba(99,102,241,0.5)' } : { borderLeft: '2px solid transparent' }}
      >
        {/* Icon box */}
        <div className="w-[30px] h-[30px] rounded-[7px] flex items-center justify-center flex-shrink-0 transition-all duration-200"
          style={{
            background: isOpen
              ? 'linear-gradient(135deg, rgba(99,102,241,0.35), rgba(59,130,246,0.25))'
              : 'rgba(255,255,255,0.08)',
            boxShadow: isOpen ? '0 2px 8px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.1)' : 'none',
          }}
        >
          <Icon size={15} className={isOpen ? 'text-indigo-300' : 'text-blue-200'} />
        </div>

        <span className="flex-1 text-[13px] font-semibold text-[#e0eaff] text-left leading-tight">
          {group.label}
        </span>

        <ChevronDown
          size={14}
          className={cn(
            'text-white/40 transition-transform duration-300 flex-shrink-0',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Submenu — CSS grid trick for smooth animation */}
      <div className={cn('submenu-wrap', isOpen && 'open')}>
        <div className="submenu-inner">
          {group.pages.map((page) => {
            const isPageActive = page.id === activePage && isOpen
            return (
              <button
                key={page.id}
                onClick={() => onPageClick(moduleId, group.id, page.id)}
                className={cn(
                  'w-full flex items-center gap-2 pl-[42px] pr-4 py-2 text-left transition-all duration-200 border-l-[3px] select-none',
                  isPageActive
                    ? 'bg-indigo-500/[0.18] border-l-indigo-400 text-white font-semibold'
                    : 'border-l-transparent text-[#c7d7f7] hover:bg-white/[0.06] hover:text-white hover:border-l-indigo-400/40'
                )}
                style={isPageActive ? {
                  background: 'linear-gradient(90deg, rgba(99,102,241,0.15), transparent)',
                  boxShadow: 'inset 0 0 0 1px rgba(99,102,241,0.08)',
                } : {}}
              >
                {/* Dot */}
                <span className={cn(
                  'w-[5px] h-[5px] rounded-full flex-shrink-0 transition-all duration-200',
                  isPageActive ? 'bg-indigo-400' : 'bg-white/30'
                )}
                  style={isPageActive ? { boxShadow: '0 0 6px rgba(99,102,241,0.8)' } : {}}
                />
                <span className="text-[12.5px] leading-tight">{page.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
