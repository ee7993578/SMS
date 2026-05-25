import { MENU_DATA } from '../../data/menuData'
import { cn } from '../../lib/utils'

// sidebar width = 230px, so we pad left to align content
export default function MenuBar({ activeModule, onModuleClick }) {
  return (
    <nav className="flex-shrink-0 h-[44px] bg-white dark:bg-[#13172a] border-b border-slate-200 dark:border-[rgba(99,102,241,0.12)] hidden md:flex items-center sticky top-[58px] z-[100] overflow-x-auto transition-colors duration-300"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
    >
      {/* Spacer to match sidebar width */}
      <div className="w-[230px] flex-shrink-0" />

      <ul className="flex items-center gap-0.5 px-2 whitespace-nowrap">
        {MENU_DATA.map((mod) => {
          const isActive = mod.id === activeModule
          return (
            <li
              key={mod.id}
              onClick={() => onModuleClick(mod.id)}
              className={cn(
                'px-3.5 py-1.5 text-[13px] font-medium rounded-md cursor-pointer transition-all duration-200 select-none relative whitespace-nowrap',
                isActive
                  ? 'text-white font-semibold menu-active-tab after:absolute after:bottom-[-1px] after:left-1/2 after:-translate-x-1/2 after:border-l-[6px] after:border-r-[6px] after:border-t-[6px] after:border-l-transparent after:border-r-transparent after:border-t-primary-900 dark:after:border-t-indigo-500'
                  : 'text-slate-500 dark:text-slate-400 hover:text-primary-900 dark:hover:text-indigo-300 hover:bg-primary-50 dark:hover:bg-indigo-500/10'
              )}
              style={isActive ? {
                background: 'linear-gradient(135deg, #1e3a8a, #312e81)',
                boxShadow: '0 2px 12px rgba(30,58,138,0.35), inset 0 1px 0 rgba(255,255,255,0.1)',
              } : {}}
            >
              {mod.label}
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
