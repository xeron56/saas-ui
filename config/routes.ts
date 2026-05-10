export default function getRoutes() {
  const extra = JSON.parse(process.env.EXTRA_ROUTES || '{}').routes || [];
  return [
    {
      path: '/school/public/exam-results',
      layout: false,
      component: './School/Public/ExamResults',
    },
    {
      path: '/user',
      layout: false,
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './User/Login',
        },
        {
          name: 'register',
          path: '/user/register',
          component: './User/Register',
        },
        {
          name: 'consent',
          path: '/user/consent',
          component: './User/Consent',
        },
        {
          name: 'logout',
          path: '/user/logout',
          component: './User/Logout',
        },
        {
          component: './404',
        },
      ],
    },
    {
      path: '/admin',
      locale: 'admin.title',
      name: 'admin',
      icon: 'smile',
      routes: [
        {
          name: 'user',
          path: '/admin/users',
          component: './Admin/User',
        },
      ],
    },
    {
      path: '/sys',
      locale: 'sys.title',
      name: 'sys',
      icon: 'smile',
      routes: [
        {
          name: 'user',
          path: '/sys/users',
          component: './Sys/User',
        },
        {
          name: 'role',
          path: '/sys/roles',
          component: './Sys/Role',
        },
        {
          name: 'role-detail',
          path: '/sys/role/:id',
          component: './Sys/RoleDetail',
          hideInMenu: true,
        },
        {
          name: 'menu',
          path: '/sys/menus',
          component: './Sys/Menu',
        },
      ],
    },
    {
      path: '/oidc',
      icon: 'smile',
      routes: [
        {
          path: '/oidc/clients',
          component: './Oidc/Client',
        },
      ],
    },
    {
      path: '/saas',
      name: 'saas',
      icon: 'smile',
      routes: [
        {
          name: 'tenant',
          path: '/saas/tenants',
          component: './Saas/Tenant',
        },
        {
          name: 'plan',
          path: '/saas/plans',
          component: './Saas/Plan',
        },
      ],
    },
    {
      path: '/payment',
      name: 'payment',
      icon: 'smile',
      routes: [
        {
          name: 'payment.orders',
          path: '/payment/orders',
          component: './Order/Order',
        },
        {
          name: 'payment.subscriptions',
          path: '/payment/subscriptions',
          component: './Order/Order',
        },
      ],
    },
    {
      path: '/product',
      name: 'product',
      routes: [
        {
          name: 'product.products',
          path: '/product/products',
          component: './Product/Product',
        },
      ],
    },
    {
      path: '/school',
      name: 'school',
      routes: [
        {
          name: 'school.academic.sessions',
          path: '/school/academic/sessions',
          component: './School/Academic/Sessions',
        },
        {
          name: 'school.academic.classes',
          path: '/school/academic/classes',
          component: './School/Academic/Classes',
        },
        {
          name: 'school.academic.sections',
          path: '/school/academic/sections',
          component: './School/Academic/Sections',
        },
        {
          name: 'school.academic.classSections',
          path: '/school/academic/class-sections',
          component: './School/Academic/ClassSections',
        },
        {
          name: 'school.academic.subjects',
          path: '/school/academic/subjects',
          component: './School/Academic/Subjects',
        },
        {
          name: 'school.academic.subjectGroups',
          path: '/school/academic/subject-groups',
          component: './School/Academic/SubjectGroups',
        },
        {
          name: 'school.academic.timetable',
          path: '/school/academic/timetable',
          component: './School/Academic/Timetable',
        },
        {
          name: 'school.academic.homework',
          path: '/school/academic/homework',
          component: './School/Academic/Homework',
        },
        {
          name: 'school.academic.homeworkSubmissions',
          path: '/school/academic/homework/:homeworkId/submissions',
          component: './School/Academic/Homework/Submissions',
          hideInMenu: true,
        },
        {
          name: 'school.academic.dailyAssignments',
          path: '/school/academic/daily-assignments',
          component: './School/Academic/DailyAssignments',
        },
        {
          name: 'school.academic.holidayTypes',
          path: '/school/academic/holiday-types',
          component: './School/Academic/HolidayTypes',
        },
        {
          name: 'school.academic.holidays',
          path: '/school/academic/holidays',
          component: './School/Academic/Holidays',
        },
        {
          name: 'school.academic.examGroups',
          path: '/school/academic/exam-groups',
          component: './School/Academic/ExamGroups',
        },
        {
          name: 'school.academic.examGrades',
          path: '/school/academic/exam-grades',
          component: './School/Academic/ExamGrades',
        },
        {
          name: 'school.academic.markDivisions',
          path: '/school/academic/mark-divisions',
          component: './School/Academic/MarkDivisions',
        },
        {
          name: 'school.academic.examAdmitCardTemplates',
          path: '/school/academic/exam-admit-card-templates',
          component: './School/Academic/ExamAdmitCardTemplates',
        },
        {
          name: 'school.academic.examMarksheetTemplates',
          path: '/school/academic/exam-marksheet-templates',
          component: './School/Academic/ExamMarksheetTemplates',
        },
        {
          name: 'school.academic.exams',
          path: '/school/academic/exam-groups/:examGroupId/exams',
          component: './School/Academic/Exams',
          hideInMenu: true,
        },
        {
          name: 'school.academic.examConnections',
          path: '/school/academic/exam-groups/:examGroupId/connections',
          component: './School/Academic/ExamConnections',
          hideInMenu: true,
        },
        {
          name: 'school.academic.examSubjects',
          path: '/school/academic/exam-groups/:examGroupId/exams/:examId/subjects',
          component: './School/Academic/ExamSubjects',
          hideInMenu: true,
        },
        {
          name: 'school.academic.examStudents',
          path: '/school/academic/exam-groups/:examGroupId/exams/:examId/students',
          component: './School/Academic/ExamStudents',
          hideInMenu: true,
        },
        {
          name: 'school.academic.examMarks',
          path: '/school/academic/exam-groups/:examGroupId/exams/:examId/marks',
          component: './School/Academic/ExamMarks',
          hideInMenu: true,
        },
        {
          name: 'school.fee.groups',
          path: '/school/fee/groups',
          component: './School/Fee/Groups',
        },
        {
          name: 'school.fee.types',
          path: '/school/fee/types',
          component: './School/Fee/Types',
        },
        {
          name: 'school.fee.feeMasters',
          path: '/school/fee/fee-masters',
          component: './School/Fee/FeeMasters',
        },
        {
          name: 'school.fee.studentFees',
          path: '/school/fee/student-fees',
          component: './School/Fee/StudentFees',
        },
        {
          name: 'school.fee.studentDues',
          path: '/school/fee/student-dues',
          component: './School/Fee/StudentDues',
        },
        {
          name: 'school.transport.routes',
          path: '/school/transport/routes',
          component: './School/Transport/Routes',
        },
        {
          name: 'school.transport.pickupPoints',
          path: '/school/transport/pickup-points',
          component: './School/Transport/PickupPoints',
        },
        {
          name: 'school.transport.routePickupPoints',
          path: '/school/transport/route-pickup-points',
          component: './School/Transport/RoutePickupPoints',
        },
        {
          name: 'school.transport.vehicles',
          path: '/school/transport/vehicles',
          component: './School/Transport/Vehicles',
        },
        {
          name: 'school.transport.vehicleRoutes',
          path: '/school/transport/vehicle-routes',
          component: './School/Transport/VehicleRoutes',
        },
        {
          name: 'school.transport.feeMasters',
          path: '/school/transport/fee-masters',
          component: './School/Transport/FeeMasters',
        },
        {
          name: 'school.transport.studentFees',
          path: '/school/transport/student-fees',
          component: './School/Transport/StudentFees',
        },
        {
          name: 'school.transport.studentDues',
          path: '/school/transport/student-dues',
          component: './School/Transport/StudentDues',
        },
        {
          name: 'school.reports.finance',
          path: '/school/reports/finance',
          component: './School/Reports/Finance',
        },
        {
          name: 'school.reports.studentAttendance',
          path: '/school/reports/student-attendance',
          component: './School/Reports/StudentAttendance',
        },
        {
          name: 'school.reports.subjectAttendance',
          path: '/school/reports/subject-attendance',
          component: './School/Reports/SubjectAttendance',
        },
        {
          name: 'school.reports.staffAttendance',
          path: '/school/reports/staff-attendance',
          component: './School/Reports/StaffAttendance',
        },
        {
          name: 'school.reports.examRank',
          path: '/school/reports/exam-rank',
          component: './School/Reports/ExamRank',
        },
        {
          name: 'school.reports.examMarksheet',
          path: '/school/reports/exam-marksheet',
          component: './School/Reports/ExamMarksheet',
        },
        {
          name: 'school.reports.examAdmitCard',
          path: '/school/reports/exam-admit-card',
          component: './School/Reports/ExamAdmitCard',
        },
        {
          name: 'school.hostel.hostels',
          path: '/school/hostel/hostels',
          component: './School/Hostel/Hostels',
        },
        {
          name: 'school.hostel.roomTypes',
          path: '/school/hostel/room-types',
          component: './School/Hostel/RoomTypes',
        },
        {
          name: 'school.hostel.rooms',
          path: '/school/hostel/rooms',
          component: './School/Hostel/Rooms',
        },
        {
          name: 'school.staff.directory',
          path: '/school/staff/directory',
          component: './School/Staff/Directory',
        },
        {
          name: 'school.staff.attendance',
          path: '/school/staff/attendance',
          component: './School/Staff/Attendance',
        },
        {
          name: 'school.staff.leaveTypes',
          path: '/school/staff/leave-types',
          component: './School/Staff/LeaveTypes',
        },
        {
          name: 'school.staff.leaveAllocations',
          path: '/school/staff/leave-allocations',
          component: './School/Staff/LeaveAllocations',
        },
        {
          name: 'school.staff.leaves',
          path: '/school/staff/leaves',
          component: './School/Staff/Leaves',
        },
        {
          name: 'school.student.registry',
          path: '/school/student/registry',
          component: './School/Student/Registry',
        },
        {
          name: 'school.student.attendance',
          path: '/school/student/attendance',
          component: './School/Student/Attendance',
        },
        {
          name: 'school.student.subjectAttendance',
          path: '/school/student/subject-attendance',
          component: './School/Student/SubjectAttendance',
        },
        {
          name: 'school.student.documents',
          path: '/school/student/documents',
          component: './School/Student/Documents',
        },
        {
          name: 'school.student.timelines',
          path: '/school/student/timelines',
          component: './School/Student/Timelines',
        },
        {
          name: 'school.student.leaves',
          path: '/school/student/leaves',
          component: './School/Student/Leaves',
        },
        {
          name: 'school.student.myExamResults',
          path: '/school/student/my-exam-results',
          component: './School/Student/MyExamResults',
        },
        {
          name: 'school.student.myAdmitCards',
          path: '/school/student/my-admit-cards',
          component: './School/Student/MyAdmitCards',
        },
        {
          name: 'school.student.myAssignments',
          path: '/school/student/my-assignments',
          component: './School/Student/MyAssignments',
        },
        {
          name: 'school.student.myRecords',
          path: '/school/student/my-records',
          component: './School/Student/MyRecords',
        },
        {
          name: 'school.student.myFees',
          path: '/school/student/my-fees',
          component: './School/Student/MyFees',
        },
        {
          name: 'school.student.categories',
          path: '/school/student/categories',
          component: './School/Student/Categories',
        },
        {
          name: 'school.student.houses',
          path: '/school/student/houses',
          component: './School/Student/Houses',
        },
        {
          name: 'school.student.disableReasons',
          path: '/school/student/disable-reasons',
          component: './School/Student/DisableReasons',
        },
        {
          name: 'school.student.settings',
          path: '/school/student/settings',
          component: './School/Student/Settings',
        },
      ],
    },
    {
      name: 'dashboard',
      icon: 'table',
      routes: [
        {
          name: 'workbench',
          path: '/dashboard/workbench',
          component: './Welcome',
        },
      ],
    },
    ...extra,
    {
      path: '/',
      redirect: '/dashboard/workbench',
    },
    {
      path: '*',
      component: './404',
    },
  ];
}
