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
import StudentICard from './Student/Work/StudentICard'
import AdmitCard from './Student/Work/AdmitCard'
import SearchStudent from './Student/Work/SearchStudent'
import RegistrationRedirection from './Student/Work/RegistrationRedirection'
import BulkAdmissionOnlineRegistration from './Student/Work/BulkAdmissionOnlineRegistration'
import UpdateStudentInfo from './Student/Update/UpdateStudentInfo'
import ChangeAdmNo from './Student/Update/ChangeAdmNo'
import UploadStudentImage from './Student/Update/UploadStudentImage'
import StudentWithdrawn from './Student/Update/StudentWithdrawn'
import UpdateStudentInfosheet from './Student/Update/UpdateStudentInfosheet'
import PromoteDemote from './Student/Update/PromoteDemote'
import StudentIDPassword from './Student/Reports/StudentIDPassword'
import StrengthReport from './Student/Reports/StrengthReport'
import ClasswiseStrengthReport from './Student/Reports/ClasswiseStrengthReport'
import AllStudentStrength from './Student/Reports/AllStudentStrength'
import HouseReport from './Student/Reports/HouseReport'
import StudentTypeReport from './Student/Reports/StudentTypeReport'
import BirthdayReport from './Student/Reports/BirthdayReport'
import SiblingReport from './Student/Reports/SiblingReport'
import StudentInfoSheet from './Student/Reports/StudentInfoSheet'



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
   if (pageId === 'StudentICard') return <StudentICard />
   if (pageId === 'AdmitCard') return <AdmitCard />
   if (pageId === 'SearchStudent') return <SearchStudent />
   if (pageId === 'UpdateStudentInfo') return <UpdateStudentInfo />
   if (pageId === 'ChangeAdmNo') return <ChangeAdmNo />
   if (pageId === 'UploadStudentImage') return <UploadStudentImage />
   if (pageId === 'StudentWithdrawn') return <StudentWithdrawn />
   if (pageId === 'UpdateStudentInfosheet') return <UpdateStudentInfosheet />
   if (pageId === 'PromoteDemote') return <PromoteDemote />
   if (pageId === 'StudentIDPassword') return <StudentIDPassword />
   if (pageId === 'StrengthReport') return <StrengthReport />
   if (pageId === 'ClasswiseStrengthReport') return <ClasswiseStrengthReport />
   if (pageId === 'AllStudentStrength') return <AllStudentStrength />
   if (pageId === 'HouseReport') return <HouseReport />
   if (pageId === 'StudentTypeReport') return <StudentTypeReport />
   if (pageId === 'BirthdayReport') return <BirthdayReport />
   if (pageId === 'SiblingReport') return <SiblingReport />
   if (pageId === 'StudentInfoSheet') return <StudentInfoSheet />
   if (pageId === 'RegistrationRedirection') return <RegistrationRedirection />
   if (pageId === 'BulkAdmissionOnlineRegistration') return <BulkAdmissionOnlineRegistration />
  
  return (
    <GenericPage
      key={pageId}             // re-mount on page change
      moduleLabel={moduleLabel}
      groupLabel={groupLabel}
      pageLabel={pageLabel}
    />
  )
}
