import DefineIndicatorGrade from './DefineIndicatorGrade'
import DefineMarks from './DefineMarks'
import CollectFee from './CollectFee'
import DailyAttendance from './DailyAttendance'
import SendSMS from './SendSMS'
import SchoolInfo from './SchoolInfo'
import GenericPage from './GenericPage'
import StudentRegistration from './Student/Work/StudentRegistration'
import AdmNoAllotment from './Student/Work/AdmNoAllotment'
import NewClassAllotment from './Student/Work/newClassAllotment'

/**
 * Maps specific page IDs to dedicated components.
 * Everything else falls through to GenericPage.
 * Future: add more dedicated pages here as you build them.
 */
export default function PageRenderer({ moduleData, currentGroup, currentPage }) {
  if (!currentPage || !currentGroup || !moduleData) return null

  const pageId      = currentPage.id
  const pageLabel   = currentPage.label
  const groupLabel  = currentGroup.label
  const moduleLabel = moduleData.label

  // ── Dedicated pages ──────────────────────────────────────
  if (pageId === 'define-indicator-grade') return <DefineIndicatorGrade />
  if (pageId === 'define-marks-new')        return <DefineMarks title="Define Marks New" />
  if (pageId === 'define-marks-preprimary') return <DefineMarks title="Define Marks (PrePrimary/Primary)" />
  if (pageId === 'collect-fee')             return <CollectFee />
  if (pageId === 'daily-attendance')        return <DailyAttendance />
  if (pageId === 'send-sms')               return <SendSMS />
  if (pageId === 'school-info')             return <SchoolInfo />
  if (pageId === 'studentRegistration') return <StudentRegistration />
  if (pageId === 'AdmNoAllotment') return <AdmNoAllotment />
  if (pageId === 'newClassAllotment') return <NewClassAllotment />
  return (
    <GenericPage
      key={pageId}             // re-mount on page change
      moduleLabel={moduleLabel}
      groupLabel={groupLabel}
      pageLabel={pageLabel}
    />
  )
}
