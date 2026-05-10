const routes = [
  {
    path: '/',
    component: () => import('layouts/BlankLayout.vue'),
    children: [{ path: '', component: () => import('pages/SplashPage.vue') }],
  },
  {
    path: '/onboarding',
    component: () => import('layouts/BlankLayout.vue'),
    children: [{ path: '', component: () => import('pages/OnboardingPage.vue') }],
  },
  {
    path: '/login',
    component: () => import('layouts/BlankLayout.vue'),
    children: [{ path: '', component: () => import('pages/LoginPage.vue') }],
  },
  {
    path: '/signup',
    component: () => import('layouts/BlankLayout.vue'),
    children: [{ path: '', component: () => import('pages/SignUpPage.vue') }],
  },
  {
    path: '/role-selection',
    component: () => import('layouts/BlankLayout.vue'),
    children: [{ path: '', component: () => import('pages/RoleSelectionPage.vue') }],
  },
  {
    path: '/home',
    component: () => import('layouts/MobileLayout.vue'),
    children: [
      { path: '', component: () => import('pages/HomePage.vue'), meta: { title: 'Home' } },
      { path: 'applications', component: () => import('pages/ApplicationsPage.vue'), meta: { title: 'Applications' } },
    ],
  },
  {
    path: '/circle',
    component: () => import('layouts/MobileLayout.vue'),
    children: [{ path: '', component: () => import('pages/MyCirclePage.vue') }],
  },
  {
    path: '/notifications',
    component: () => import('layouts/MobileLayout.vue'),
    children: [{ path: '', component: () => import('pages/NotificationsPage.vue') }],
  },
  {
    path: '/messages',
    component: () => import('layouts/MobileLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MessagesPage.vue'), meta: { title: 'Messages' } },
      {
        path: 'chat/:peerId',
        component: () => import('pages/ChatConversationPage.vue'),
        meta: { hideFooter: true },
      },
    ],
  },
  {
    path: '/profile',
    component: () => import('layouts/MobileLayout.vue'),
    children: [{ path: '', component: () => import('pages/ProfilePage.vue'), meta: { title: 'Profile' } }],
  },
  {
    path: '/peer',
    component: () => import('layouts/MobileLayout.vue'),
    children: [{ path: ':userId', component: () => import('pages/PeerProfilePage.vue') }],
  },
  {
    path: '/job-seeker',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/job-seeker/register'
      },
      {
        path: 'register',
        component: () => import('pages/JobSeekerRegistrationPage.vue')
      },
      {
        path: 'iq-intro',
        component: () => import('pages/IQTestIntroPage.vue')
      },
      {
        path: 'iq-test/:id',
        component: () => import('pages/IQTestQuestionPage.vue')
      },
      {
        path: 'iq-result',
        component: () => import('pages/IqResultPage.vue')
      },
    ],
  },
  {
    path: '/jobseeker',
    component: () => import('layouts/JobSeekerShellLayout.vue'),
    children: [
      { path: '', redirect: '/jobseeker/dashboard' },
      { path: 'dashboard', component: () => import('pages/HomePage.vue'), meta: { title: 'Dashboard' } },
      { path: 'profile', component: () => import('pages/ProfilePage.vue'), meta: { title: 'Profile' } },
      { path: 'iq-test', component: () => import('pages/IQTestIntroPage.vue') },
      { path: 'upgrade', component: () => import('pages/JobSeekerUpgradePage.vue') },
      { path: 'browse-jobs', component: () => import('pages/BrowseJobsPage.vue') },
      {
        path: 'job/:id/apply',
        component: () => import('pages/JobApplyPage.vue'),
        meta: {
          title: 'Apply',
          jobSeekerNavBack: true,
          jobSeekerBackFallback: '/jobseeker/browse-jobs',
        },
      },
      {
        path: 'job/:id',
        component: () => import('pages/JobDetailsPage.vue'),
        meta: {
          title: 'Job',
          jobSeekerNavBack: true,
          jobSeekerBackFallback: '/jobseeker/browse-jobs',
        },
      },
      { path: 'applications', redirect: '/home/applications' },
    ],
  },
  {
    path: '/employer/company-profile',
    component: () => import('layouts/BlankLayout.vue'),
    children: [{ path: '', component: () => import('pages/EmployerCompanyProfilePage.vue') }],
  },
  {
    path: '/employer',
    component: () => import('layouts/EmployerLayout.vue'),
    children: [
      { path: '', redirect: '/employer/dashboard' },
      { path: 'dashboard', component: () => import('pages/EmployerDashboardPage.vue'), meta: { title: 'Employer Dashboard' } },
      { path: 'applicants', component: () => import('pages/EmployerApplicantsPage.vue'), meta: { title: 'Applicants' } },
      { path: 'applicant/:id', component: () => import('pages/EmployerApplicantProfilePage.vue') },
      { path: 'post-job', component: () => import('pages/EmployerJobPostingsPage.vue') },
      { path: 'post-job/new', component: () => import('pages/EmployerPostJobFormPage.vue') },
      { path: 'post-job/edit/:jobId', component: () => import('pages/EmployerPostJobFormPage.vue') },
      { path: 'messages', component: () => import('pages/EmployerMessagesPage.vue'), meta: { title: 'Employer Messages' } },
      {
        path: 'messages/chat/:peerId',
        component: () => import('pages/ChatConversationPage.vue'),
        meta: { hideFooter: true },
      },
      {
        path: 'user/:userId',
        component: () => import('pages/PeerProfilePage.vue'),
      },
      { path: 'profile', component: () => import('pages/EmployerProfilePage.vue'), meta: { title: 'Employer Profile' } },
    ],
  },
  {
    path: '/payment/checkout',
    component: () => import('layouts/BlankLayout.vue'),
    children: [{ path: '', component: () => import('pages/PaymentCheckoutPage.vue') }],
  },
  {
    path: '/upgrade',
    redirect: '/jobseeker/upgrade',
  },
  {
    path: '/shared',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      { path: 'chat', component: () => import('pages/MessagesPage.vue') },
      { path: 'notifications', component: () => import('pages/NotificationsPage.vue') },
      { path: 'friend-requests', component: () => import('pages/FriendRequestsPage.vue') },
      { path: 'ratings', component: () => import('pages/RatingsPage.vue') },
      { path: 'profile-edit', component: () => import('pages/ProfileEditPage.vue') },
    ],
  },
  // Always leave this as last one
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
