/**
 * MENU_DATA — Static config. Future: swap with API call GET /api/menu
 * Shape: TopModule → groups[] → pages[]
 */

export const MENU_DATA = [
  {
    id: 'configuration', label: 'Configuration',
    groups: [
      {
        id: 'school-setup', label: 'School Setup', icon: 'Home',
        pages: [
          { id: 'school-info',      label: 'School Information' },
          { id: 'academic-year',    label: 'Academic Year' },
          { id: 'class-section',    label: 'Class & Section' },
          { id: 'subjects',         label: 'Subjects' },
          { id: 'timetable',        label: 'Timetable Setup' },
          { id: 'holiday-calendar', label: 'Holiday Calendar' },
        ],
      },
      {
        id: 'user-mgmt', label: 'User Management', icon: 'Users',
        pages: [
          { id: 'add-user',     label: 'Add User' },
          { id: 'user-roles',   label: 'User Roles' },
          { id: 'permissions',  label: 'Assign Permissions' },
          { id: 'reset-pass',   label: 'Reset Password' },
          { id: 'activity-log', label: 'User Activity Log' },
        ],
      },
      {
        id: 'system-settings', label: 'System Settings', icon: 'Monitor',
        pages: [
          { id: 'general-settings', label: 'General Settings' },
          { id: 'sms-config',       label: 'SMS Configuration' },
          { id: 'email-config',     label: 'Email Configuration' },
          { id: 'notif-cfg',        label: 'Notification Settings' },
          { id: 'backup-restore',   label: 'Backup & Restore' },
        ],
      },
    ],
  },
  {
    id: 'exam-master', label: 'Exam Master',
    groups: [
      {
        id: 'marks-entry', label: 'Marks Entry', icon: 'PenLine',
        pages: [
          { id: 'define-indicator-grade',  label: 'Define Indicator Grade' },
          { id: 'define-marks-preprimary', label: 'Define Marks (PrePrimary/Primary)' },
          { id: 'define-marks-new',        label: 'Define Marks New' },
          { id: 'delete-indicator-grade',  label: 'Delete Indicator Grade' },
          { id: 'delete-marks',            label: 'Delete Marks' },
        ],
      },
      {
        id: 'remarks', label: 'Remarks', icon: 'MessageCircle',
        pages: [
          { id: 'class-remark',   label: 'Class Remark' },
          { id: 'student-remark', label: 'Student Remark' },
        ],
      },
      {
        id: 'exam-settings', label: 'Settings', icon: 'SlidersHorizontal',
        pages: [
          { id: 'define-weightage',    label: 'Define Weightage' },
          { id: 'define-max-min',      label: 'Define Max Min' },
          { id: 'define-max-min-prim', label: 'Define Max Min (Primary)' },
          { id: 'define-header',       label: 'Define Header' },
          { id: 'define-category',     label: 'Define Category' },
          { id: 'define-attribute',    label: 'Define Attribute' },
          { id: 'define-ind-cat',      label: 'Define Indicator Category' },
          { id: 'define-indicator',    label: 'Define Indicator' },
          { id: 'define-grade',        label: 'Define Grade' },
          { id: 'exam-schedule',       label: 'Exam Schedule' },
        ],
      },
    ],
  },
  {
    id: 'fee', label: 'Fee',
    groups: [
      {
        id: 'fee-structure', label: 'Fee Structure', icon: 'Layout',
        pages: [
          { id: 'fee-heads',   label: 'Define Fee Heads' },
          { id: 'fee-setup',   label: 'Fee Structure Setup' },
          { id: 'concession',  label: 'Concession & Scholarships' },
          { id: 'late-fee',    label: 'Late Fee Configuration' },
          { id: 'installment', label: 'Fee Installment Plan' },
        ],
      },
      {
        id: 'fee-collection', label: 'Fee Collection', icon: 'CreditCard',
        pages: [
          { id: 'collect-fee',     label: 'Collect Fee' },
          { id: 'online-payment',  label: 'Online Payment' },
          { id: 'fee-receipt',     label: 'Fee Receipt' },
          { id: 'bulk-collection', label: 'Bulk Fee Collection' },
          { id: 'pending-fees',    label: 'Pending Fees' },
        ],
      },
      {
        id: 'fee-reports', label: 'Fee Reports', icon: 'TrendingUp',
        pages: [
          { id: 'daily-collection',  label: 'Daily Collection Report' },
          { id: 'classwise-fee',     label: 'Class-wise Fee Report' },
          { id: 'defaulters',        label: 'Defaulters List' },
          { id: 'fee-summary',       label: 'Fee Summary' },
          { id: 'annual-fee-report', label: 'Annual Fee Report' },
        ],
      },
    ],
  },
  {
    id: 'transport', label: 'Transport',
    groups: [
      {
        id: 'route-mgmt', label: 'Route Management', icon: 'MapPin',
        pages: [
          { id: 'add-route',     label: 'Add Route' },
          { id: 'route-stops',   label: 'Route Stops' },
          { id: 'driver-assign', label: 'Driver Assignment' },
          { id: 'vehicle-mgmt',  label: 'Vehicle Management' },
          { id: 'route-map',     label: 'Route Map View' },
        ],
      },
      {
        id: 'student-alloc', label: 'Student Allocation', icon: 'UserCheck',
        pages: [
          { id: 'assign-students',   label: 'Assign Students' },
          { id: 'transport-card',    label: 'Student Transport Card' },
          { id: 'change-route',      label: 'Change Route' },
          { id: 'remove-allocation', label: 'Remove Allocation' },
        ],
      },
    ],
  },
  {
    id: 'reports', label: 'Reports',
    groups: [
      {
        id: 'academic-reports', label: 'Academic Reports', icon: 'BookOpen',
        pages: [
          { id: 'progress-report',  label: 'Progress Report' },
          { id: 'report-card-prim', label: 'Report Card (Primary)' },
          { id: 'report-card-sec',  label: 'Report Card (Secondary)' },
          { id: 'consolidated',     label: 'Consolidated Report' },
          { id: 'toppers',          label: 'Toppers List' },
        ],
      },
      {
        id: 'attendance-reports', label: 'Attendance Reports', icon: 'ClipboardList',
        pages: [
          { id: 'daily-attendance',   label: 'Daily Attendance' },
          { id: 'monthly-attendance', label: 'Monthly Attendance' },
          { id: 'subject-att',        label: 'Subject-wise Attendance' },
          { id: 'att-defaulters',     label: 'Defaulters Report' },
          { id: 'att-summary',        label: 'Attendance Summary' },
        ],
      },
      {
        id: 'mis-reports', label: 'MIS Reports', icon: 'BarChart2',
        pages: [
          { id: 'strength-report', label: 'Student Strength Report' },
          { id: 'gender-report',   label: 'Gender-wise Report' },
          { id: 'category-report', label: 'Category-wise Report' },
          { id: 'staff-report',    label: 'Staff Report' },
          { id: 'school-overview', label: 'School Overview' },
        ],
      },
    ],
  },
  {
    id: 'student', label: 'Student',
    groups: [
      {
        id: 'stu_work', label: 'Work', icon: 'FilePlus',
        pages: [
          { id: 'studentRegistration', label: 'Student Registration' },
          { id: 'AdmNoAllotment', label: 'Registration No' },
          { id: 'newClassAllotment', label: 'Allotment Section' },
        ],
      },
      {
        id: 'stu_update', label: 'Updates', icon: 'CheckSquare',
        pages: [
          { id: 'class-assign',    label: 'Student Updates' },
        ],
      },
      {
        id: 'stu_report', label: 'Reports', icon: 'FilePlus',
        pages: [
          { id: 'class-assign',    label: 'Strength Report' },
        ],
      },
      {
        id: 'stu_setup', label: 'Setup', icon: 'CheckSquare',
        pages: [
          { id: 'class-assign',    label: 'Promote ' },
        ],
      },
    ],
  },
  {
    id: 'uploads', label: 'Uploads',
    groups: [
      {
        id: 'data-upload', label: 'Data Upload', icon: 'Upload',
        pages: [
          { id: 'upload-students',   label: 'Upload Students' },
          { id: 'upload-marks',      label: 'Upload Marks' },
          { id: 'upload-attendance', label: 'Upload Attendance' },
          { id: 'upload-fee',        label: 'Upload Fee Data' },
          { id: 'upload-staff',      label: 'Upload Staff Data' },
        ],
      },
      {
        id: 'bulk-ops', label: 'Bulk Operations', icon: 'Archive',
        pages: [
          { id: 'bulk-photo',     label: 'Bulk Photo Upload' },
          { id: 'bulk-docs',      label: 'Bulk Document Upload' },
          { id: 'template-dl',    label: 'Template Download' },
          { id: 'upload-history', label: 'Upload History' },
          { id: 'error-logs',     label: 'Error Logs' },
        ],
      },
    ],
  },
  {
    id: 'certificates', label: 'Certificates',
    groups: [
      {
        id: 'gen-certs', label: 'Generate Certificates', icon: 'Award',
        pages: [
          { id: 'bonafide',  label: 'Bonafide Certificate' },
          { id: 'character', label: 'Character Certificate' },
          { id: 'tc-cert',   label: 'Transfer Certificate' },
          { id: 'migration', label: 'Migration Certificate' },
          { id: 'sports',    label: 'Sports Certificate' },
        ],
      },
      {
        id: 'cert-settings', label: 'Certificate Settings', icon: 'SlidersHorizontal',
        pages: [
          { id: 'cert-templates', label: 'Certificate Templates' },
          { id: 'digital-sign',   label: 'Digital Signature' },
          { id: 'letterhead',     label: 'Letterhead Setup' },
          { id: 'cert-numbering', label: 'Certificate Numbering' },
          { id: 'issued-log',     label: 'Issued Certificates Log' },
        ],
      },
    ],
  },
  {
    id: 'communication', label: 'Communication',
    groups: [
      {
        id: 'messaging', label: 'Messaging', icon: 'BellRing',
        pages: [
          { id: 'send-sms',      label: 'Send SMS' },
          { id: 'send-email',    label: 'Send Email' },
          { id: 'whatsapp',      label: 'WhatsApp Messages' },
          { id: 'bulk-notifs',   label: 'Bulk Notifications' },
          { id: 'msg-templates', label: 'Message Templates' },
        ],
      },
      {
        id: 'circular', label: 'Circular & Notice', icon: 'AlignLeft',
        pages: [
          { id: 'create-circular', label: 'Create Circular' },
          { id: 'notice-board',    label: 'Notice Board' },
          { id: 'event-announce',  label: 'Event Announcements' },
          { id: 'parent-comm',     label: 'Parent Communication' },
          { id: 'archive',         label: 'Archive' },
        ],
      },
    ],
  },
  {
    id: 'leave', label: 'Leave',
    groups: [
      {
        id: 'leave-mgmt', label: 'Leave Management', icon: 'Calendar',
        pages: [
          { id: 'leave-types',    label: 'Leave Types' },
          { id: 'leave-policy',   label: 'Leave Policy' },
          { id: 'apply-leave',    label: 'Apply Leave' },
          { id: 'leave-approval', label: 'Leave Approval' },
          { id: 'leave-balance',  label: 'Leave Balance' },
          { id: 'leave-calendar', label: 'Leave Calendar' },
        ],
      },
      {
        id: 'attendance', label: 'Attendance', icon: 'CheckSquare',
        pages: [
          { id: 'mark-attendance',  label: 'Mark Attendance' },
          { id: 'att-register',     label: 'Attendance Register' },
          { id: 'biometric',        label: 'Biometric Integration' },
          { id: 'late-arrivals',    label: 'Late Arrivals' },
          { id: 'early-departures', label: 'Early Departures' },
        ],
      },
    ],
  },
  {
    id: 'indent', label: 'Indent',
    groups: [
      {
        id: 'purchase-indent', label: 'Purchase Indent', icon: 'Package',
        pages: [
          { id: 'create-indent',   label: 'Create Indent' },
          { id: 'indent-approval', label: 'Indent Approval' },
          { id: 'purchase-order',  label: 'Purchase Order' },
          { id: 'vendor-mgmt',     label: 'Vendor Management' },
          { id: 'goods-receipt',   label: 'Goods Receipt' },
        ],
      },
      {
        id: 'inventory', label: 'Inventory', icon: 'Warehouse',
        pages: [
          { id: 'stock-register', label: 'Stock Register' },
          { id: 'issue-items',    label: 'Issue Items' },
          { id: 'return-items',   label: 'Return Items' },
          { id: 'stock-report',   label: 'Stock Report' },
          { id: 'low-stock',      label: 'Low Stock Alert' },
        ],
      },
    ],
  },
]
