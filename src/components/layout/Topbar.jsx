import { LayoutDashboard, Settings, Menu, X, Sun, Moon } from 'lucide-react'
import { cn } from '../../lib/utils'

export default function Topbar({ isDrawerOpen, toggleDrawer, goHome, isDark, toggleTheme }) {
  return (
    <header className="relative flex-shrink-0 h-[58px] bg-gradient-to-r from-primary-950 via-primary-900 to-[#1e2d6b] dark:from-[#0d1117] dark:via-[#151929] dark:to-[#0d1117] flex items-center justify-between pl-0 pr-3 sticky top-0 z-[200] topbar-shimmer"
      style={{ boxShadow: isDark ? '0 2px 20px rgba(0,0,0,0.6), inset 0 -1px 0 rgba(99,102,241,0.2)' : '0 2px 12px rgba(30,58,138,0.3), inset 0 -1px 0 rgba(255,255,255,0.06)' }}
    >

      {/* Left — Logo */}
      <div className="flex items-center h-full">
        <div className="flex items-center gap-2.5 px-4 h-full bg-white/[0.08] border-r border-white/[0.12] dark:border-white/[0.06]">
          <div
            className="w-9 h-9 bg-white dark:bg-gradient-to-br dark:from-indigo-400 dark:to-blue-500 rounded-lg flex items-center justify-center font-display text-[13px] font-bold text-primary-900 dark:text-white flex-shrink-0 cursor-pointer select-none"
            style={{ boxShadow: isDark ? '0 0 12px rgba(99,102,241,0.5), 0 2px 4px rgba(0,0,0,0.3)' : '0 2px 8px rgba(30,58,138,0.2)' }}
            onClick={goHome}
          >
            APS
          </div>
          <span className="font-display text-[14.5px] font-bold text-white whitespace-nowrap hidden sm:block">
            APS INTERNATIONAL SCHOOL
          </span>
          <span className="font-display text-[13px] font-bold text-white whitespace-nowrap sm:hidden">
            APS International
          </span>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Session — desktop */}
        <span className="hidden md:block text-[12px] text-white/75 px-2.5 py-1 bg-white/10 dark:bg-white/[0.06] rounded-full font-medium whitespace-nowrap border border-white/[0.08]">
          SESSION: 2026–2027
        </span>

        {/* Last login — desktop */}
        <span className="hidden lg:block text-[11px] text-white/55 whitespace-nowrap">
          Last Login: 13 May 2026 | 1:29PM
        </span>

        {/* User badge */}
        <div className="flex items-center gap-2 px-2 py-1 bg-white/10 dark:bg-white/[0.06] rounded-full cursor-pointer hover:bg-white/[0.18] dark:hover:bg-white/[0.12] transition-colors border border-white/[0.08]">
          <div
            className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-[12px] font-bold text-white flex-shrink-0"
            style={{ boxShadow: isDark ? '0 0 8px rgba(99,102,241,0.5)' : '0 2px 6px rgba(30,58,138,0.25)' }}
          >
            SB
          </div>
          <div className="leading-tight hidden sm:block">
            <div className="text-[12.5px] font-semibold text-white">SUDHEER BABU</div>
            <div className="text-[11px] text-white/65">Administrator</div>
          </div>
        </div>

        {/* Dashboard icon — desktop */}
        <button
          onClick={goHome}
          className="hidden md:flex w-[34px] h-[34px] rounded-lg items-center justify-center bg-white/10 dark:bg-white/[0.06] text-white hover:bg-white/20 dark:hover:bg-white/[0.12] transition-colors border border-white/[0.08]"
          title="Dashboard"
        >
          <LayoutDashboard size={17} />
        </button>

        {/* Settings icon — desktop */}
        <button className="hidden md:flex w-[34px] h-[34px] rounded-lg items-center justify-center bg-white/10 dark:bg-white/[0.06] text-white hover:bg-white/20 dark:hover:bg-white/[0.12] transition-colors border border-white/[0.08]">
          <Settings size={17} />
        </button>

        {/* ── Theme Toggle ── */}
        <button
          onClick={toggleTheme}
          className="theme-toggle flex items-center"
          style={{
            background: isDark
              ? 'linear-gradient(135deg, #1e1b4b, #312e81)'
              : 'linear-gradient(135deg, #bfdbfe, #93c5fd)',
            boxShadow: isDark
              ? '0 2px 8px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.08)'
              : '0 2px 8px rgba(59,130,246,0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
          }}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          <div className={cn('theme-toggle-thumb', isDark ? 'theme-toggle-dark' : 'theme-toggle-light')}>
            {isDark
              ? <Moon size={12} className="text-indigo-100" />
              : <Sun size={12} className="text-amber-900" />
            }
          </div>
        </button>

        {/* Hamburger — mobile only */}
        <button
          onClick={toggleDrawer}
          className="md:hidden flex w-[38px] h-[38px] rounded-lg items-center justify-center bg-white/10 dark:bg-white/[0.06] text-white hover:bg-white/20 transition-colors"
          aria-label="Toggle menu"
        >
          {isDrawerOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
    </header>
  )
}
