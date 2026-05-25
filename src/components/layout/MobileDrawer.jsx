import { useState } from 'react'
import { X, ChevronRight, ChevronDown } from 'lucide-react'
import { MENU_DATA } from '../../data/menuData'
import { ICON_MAP } from './iconMap'
import { cn } from '../../lib/utils'

export default function MobileDrawer({
  isOpen, onClose,
  activeModule, activeGroup, activePage,
  onModuleClick, onPageClick,
}) {
  // Track which top-level module is expanded in drawer
  const [expandedModule, setExpandedModule] = useState(activeModule)
  // Track which group is expanded inside that module
  const [expandedGroup, setExpandedGroup] = useState(activeGroup)

  const toggleModule = (modId) => {
    setExpandedModule(prev => prev === modId ? '' : modId)
    setExpandedGroup('')
  }

  const toggleGroup = (grpId) => {
    setExpandedGroup(prev => prev === grpId ? '' : grpId)
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={cn(
          'md:hidden fixed inset-0 bg-black/60 backdrop-blur-[3px] z-[300] transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
      />

      {/* Drawer panel */}
      <div
        className={cn(
          'md:hidden drawer-panel fixed top-0 left-0 h-full w-[300px] max-w-[88vw] z-[400] flex flex-col overflow-hidden',
          isOpen && 'open'
        )}
        style={{
          background: 'linear-gradient(180deg, #1a2040 0%, #111827 100%)',
          borderRight: '1px solid rgba(99,102,241,0.15)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
        }}
      >
        {/* Drawer header */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-white/[0.06] flex-shrink-0"
          style={{ background: 'rgba(0,0,0,0.2)' }}
        >
          <div className="w-8 h-8 rounded-[7px] flex items-center justify-center font-display text-[12px] font-bold text-white flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #3b82f6)',
              boxShadow: '0 0 12px rgba(99,102,241,0.5)',
            }}
          >
            APS
          </div>
          <span className="font-display text-[13.5px] font-bold text-white flex-1">
            APS International
          </span>
          <button
            onClick={onClose}
            className="w-[30px] h-[30px] flex items-center justify-center rounded-md bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav — scrollable */}
        <div className="flex-1 overflow-y-auto sidebar-scroll pb-6">
          <div className="pt-2">
            <p className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-[1.2px] text-indigo-300/40">
              Navigation
            </p>

            {MENU_DATA.map((mod) => {
              const isModOpen    = expandedModule === mod.id
              const isModActive  = activeModule   === mod.id

              return (
                <div key={mod.id}>
                  {/* Top module row */}
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-4 py-2.5 border-l-[3px] transition-all duration-200 select-none',
                      isModActive
                        ? 'bg-indigo-500/[0.15] border-l-indigo-400 text-white font-semibold'
                        : 'border-l-transparent text-[#c7d7f7] hover:bg-white/[0.06] hover:text-white'
                    )}
                  >
                    <span className="flex-1 text-[13.5px] font-medium text-left">{mod.label}</span>
                    <ChevronRight
                      size={15}
                      className={cn(
                        'text-white/40 transition-transform duration-250',
                        isModOpen && 'rotate-90'
                      )}
                    />
                  </button>

                  {/* Groups inside this module */}
                  <div className={cn('submenu-wrap', isModOpen && 'open')}>
                    <div className="submenu-inner">
                      {mod.groups.map((group) => {
                        const isGrpOpen   = expandedGroup === group.id
                        const isGrpActive = activeGroup   === group.id && isModActive
                        const GrpIcon     = ICON_MAP[group.icon] || ICON_MAP['Folder']

                        return (
                          <div key={group.id}>
                            {/* Group row */}
                            <button
                              onClick={() => toggleGroup(group.id)}
                              className={cn(
                                'w-full flex items-center gap-2 pl-7 pr-4 py-2 transition-all duration-200 select-none',
                                isGrpActive ? 'text-white bg-white/[0.08]' : 'text-[#a8c0f0] hover:bg-white/[0.06] hover:text-white'
                              )}
                            >
                              <div className="w-[22px] h-[22px] rounded-[5px] flex items-center justify-center flex-shrink-0"
                                style={{ background: 'rgba(99,102,241,0.12)' }}
                              >
                                <GrpIcon size={12} className="text-indigo-300" />
                              </div>
                              <span className="flex-1 text-[12.5px] font-semibold text-left">{group.label}</span>
                              <ChevronDown
                                size={12}
                                className={cn(
                                  'text-white/30 transition-transform duration-250',
                                  isGrpOpen && 'rotate-180'
                                )}
                              />
                            </button>

                            {/* Pages inside group */}
                            <div className={cn('submenu-wrap', isGrpOpen && 'open')}>
                              <div className="submenu-inner">
                                {group.pages.map((page) => {
                                  const isPageActive = activePage === page.id && isGrpActive
                                  return (
                                    <button
                                      key={page.id}
                                      onClick={() => onPageClick(mod.id, group.id, page.id)}
                                      className={cn(
                                        'w-full flex items-center gap-2 pl-[46px] pr-4 py-2 border-l-[3px] transition-all duration-200 select-none text-left',
                                        isPageActive
                                          ? 'bg-indigo-500/[0.12] border-l-indigo-400 text-white font-semibold'
                                          : 'border-l-transparent text-[#8aacdf] hover:bg-white/[0.07] hover:text-white hover:border-l-indigo-400/30'
                                      )}
                                    >
                                      <span className={cn(
                                        'w-1 h-1 rounded-full flex-shrink-0',
                                        isPageActive ? 'bg-indigo-400' : 'bg-white/25'
                                      )}
                                        style={isPageActive ? { boxShadow: '0 0 4px rgba(99,102,241,0.8)' } : {}}
                                      />
                                      <span className="text-[12px] leading-snug">{page.label}</span>
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
