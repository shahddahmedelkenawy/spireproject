const routes = [
  {
    path: '/',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LandingPage.vue'),
        meta: {
          title: 'SPIRE — See ability, not disability',
          description:
            'SPIRE is an accessible hiring platform connecting employers and job seekers with clarity, dignity, and modern workflows.',
          blankLight: true,
          publicNavLight: true,
          hideSiteFooter: true,
        },
      },
    ],
  },
  {
    path: '/splash',
    component: () => import('layouts/SplashOnlyLayout.vue'),
    children: [{ path: '', component: () => import('pages/SplashPage.vue'), meta: { title: 'Welcome' } }],
  },
  {
    path: '/jobs',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/JobsPage.vue'),
        meta: {
          title: 'Jobs',
          description: 'Browse open roles from employers hiring on SPIRE.',
        },
      },
    ],
  },
  {
    path: '/companies',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/CompaniesPage.vue'),
        meta: {
          title: 'Companies',
          description: 'Explore organizations hiring through SPIRE.',
        },
      },
    ],
  },
  {
    path: '/about',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/AboutPage.vue'),
        meta: {
          title: 'About',
          description: 'Learn about SPIRE’s mission to make hiring more accessible and candidate-centered.',
        },
      },
    ],
  },
  {
    path: '/contact',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/ContactPage.vue'),
        meta: {
          title: 'Contact',
          description: 'Contact the SPIRE team for support, partnerships, and accessibility questions.',
        },
      },
    ],
  },
  {
    path: '/legal/privacy',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LegalPrivacyPage.vue'),
        meta: {
          title: 'Privacy Policy',
          description: 'SPIRE privacy policy: how we collect, use, and protect information.',
        },
      },
    ],
  },
  {
    path: '/legal/terms',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LegalTermsPage.vue'),
        meta: {
          title: 'Terms of Service',
          description: 'SPIRE terms of service for using the hiring platform.',
        },
      },
    ],
  },
  {
    path: '/onboarding',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LandingPage.vue'),
        meta: {
          title: 'SPIRE — See ability, not disability',
          blankLight: true,
          publicNavLight: true,
          hideSiteFooter: true,
        },
      },
    ],
  },
  {
    path: '/login',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/LoginPage.vue'),
        meta: { hidePublicChrome: true, hideSiteFooter: true, title: 'Login' },
      },
    ],
  },
  {
    path: '/signup',
    component: () => import('layouts/BlankLayout.vue'),
    children: [
      {
        path: '',
        component: () => import('pages/SignUpPage.vue'),
        meta: { hidePublicChrome: true, hideSiteFooter: true, title: 'Sign up' },
      },
    ],
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
      {
        path: '',
        component: () => import('pages/MessagesPage.vue'),
        meta: { title: 'Messages' },
      },
      {
        path: 'chat/:peerId',
        redirect: (to) => ({
          path: '/messages',
          query: { peer: to.params.peerId },
        }),
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
          /** Match SPIRE app: full-screen apply uses in-page sticky header only (no main nav bar). */
          hideJobSeekerMainNav: true,
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
    component: () => import('layouts/MinimalLayout.vue'),
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
