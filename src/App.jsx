import { useERP } from './hooks/useERP'
import { useTheme } from './hooks/useTheme'
import { MENU_DATA } from './data/menuData'

import Topbar       from './components/layout/Topbar'
import MenuBar      from './components/layout/MenuBar'
import Sidebar      from './components/layout/Sidebar'
import MobileDrawer from './components/layout/MobileDrawer'
import Breadcrumb   from './components/layout/Breadcrumb'
import Dashboard    from './components/dashboard/Dashboard'
import PageRenderer from './components/pages/PageRenderer'

export default function App() {
  const {
    activeModule, activeGroup, activePage,
    moduleData, currentGroup, currentPage,
    isDrawerOpen, isDashboard,
    setModule, setGroup, setPage, goHome,
    toggleDrawer, closeDrawer,
  } = useERP()

  const { isDark, toggleTheme } = useTheme()

  // Breadcrumb labels
  const moduleLabel = isDashboard ? 'Dashboard' : moduleData?.label
  const groupLabel  = isDashboard ? null : currentGroup?.label
  const pageLabel   = isDashboard ? null : currentPage?.label

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-[#0f1117] transition-colors duration-300">

      {/* ── Top header ── */}
      <Topbar
        isDrawerOpen={isDrawerOpen}
        toggleDrawer={toggleDrawer}
        goHome={goHome}
        isDark={isDark}
        toggleTheme={toggleTheme}
      />

      {/* ── Horizontal menu bar (desktop only) ── */}
      <MenuBar
        activeModule={activeModule}
        onModuleClick={(modId) => setModule(modId)}
      />

      {/* ── Body ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── Desktop sidebar ── */}
        <Sidebar
          moduleData={moduleData}
          activeGroup={activeGroup}
          activePage={activePage}
          onGroupClick={setGroup}
          onPageClick={setPage}
        />

        {/* ── Content area ── */}
        <div className="flex flex-col flex-1 overflow-hidden">

          {/* Breadcrumb */}
          <Breadcrumb
            moduleLabel={moduleLabel}
            groupLabel={groupLabel}
            pageLabel={pageLabel}
            onHome={goHome}
          />

          {/* Scrollable content */}
          <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-100 dark:bg-[#0f1117] p-4 md:p-5 transition-colors duration-300">
            {isDashboard
              ? <Dashboard onPageClick={setPage} />
              : <PageRenderer
                  moduleData={moduleData}
                  currentGroup={currentGroup}
                  currentPage={currentPage}
                />
            }
          </main>
        </div>
      </div>

      {/* ── Mobile drawer (overlay + panel) ── */}
      <MobileDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        activeModule={activeModule}
        activeGroup={activeGroup}
        activePage={activePage}
        onModuleClick={setModule}
        onPageClick={setPage}
      />
    </div>
  )
}
