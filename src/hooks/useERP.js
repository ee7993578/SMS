import { useState, useCallback } from 'react'
import { MENU_DATA } from '../data/menuData'

const DEFAULT_MODULE = 'exam-master'
const DEFAULT_GROUP  = 'marks-entry'

export function useERP() {
  const [activeModule, setActiveModuleState] = useState(DEFAULT_MODULE)
  const [activeGroup,  setActiveGroupState]  = useState(DEFAULT_GROUP)
  const [activePage,   setActivePageState]   = useState(null)
  const [isDrawerOpen, setDrawerOpen]        = useState(false)
  const [isDashboard,  setIsDashboard]       = useState(true)

  const moduleData = MENU_DATA.find(m => m.id === activeModule) || MENU_DATA[0]

  const setModule = useCallback((moduleId) => {
    const mod = MENU_DATA.find(m => m.id === moduleId)
    if (!mod) return
    setActiveModuleState(moduleId)
    setActiveGroupState(mod.groups[0]?.id || '')
    setActivePageState(null)
    setIsDashboard(false)
  }, [])

  const setGroup = useCallback((groupId) => {
    setActiveGroupState(groupId)
    setActivePageState(null)
  }, [])

  const setPage = useCallback((moduleId, groupId, pageId) => {
    setActiveModuleState(moduleId)
    setActiveGroupState(groupId)
    setActivePageState(pageId)
    setIsDashboard(false)
    setDrawerOpen(false)
  }, [])

  const goHome = useCallback(() => {
    setIsDashboard(true)
    setActivePageState(null)
    setDrawerOpen(false)
  }, [])

  const toggleDrawer = useCallback(() => setDrawerOpen(p => !p), [])
  const closeDrawer  = useCallback(() => setDrawerOpen(false), [])

  // Derived: current group's pages
  const currentGroup = moduleData.groups.find(g => g.id === activeGroup)
  const currentPage  = currentGroup?.pages.find(p => p.id === activePage) || null

  return {
    activeModule, activeGroup, activePage,
    moduleData, currentGroup, currentPage,
    isDrawerOpen, isDashboard,
    setModule, setGroup, setPage, goHome,
    toggleDrawer, closeDrawer,
  }
}
