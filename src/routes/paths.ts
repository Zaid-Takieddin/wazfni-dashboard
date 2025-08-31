// ----------------------------------------------------------------------

const ROOTS = {
  AUTH: '/auth',
  AUTH_DEMO: '/auth-demo',
  DASHBOARD: '/dashboard',
};

// ----------------------------------------------------------------------

export const paths = {
  page403: '/error/403',
  page404: '/error/404',
  page500: '/error/500',

  // AUTH
  auth: {
    signIn: `${ROOTS.AUTH}/sign-in`,
    signUp: `${ROOTS.AUTH}/sign-up`,
    changePassword: `${ROOTS.AUTH}/change-password`,
    // Legacy auth providers (keeping for backward compatibility)
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    jwt: { signIn: `${ROOTS.AUTH}/jwt/sign-in`, signUp: `${ROOTS.AUTH}/jwt/sign-up` },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    auth0: { signIn: `${ROOTS.AUTH}/auth0/sign-in` },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  authDemo: {
    split: {
      signIn: `${ROOTS.AUTH_DEMO}/split/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/split/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/split/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/split/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/split/verify`,
    },
    centered: {
      signIn: `${ROOTS.AUTH_DEMO}/centered/sign-in`,
      signUp: `${ROOTS.AUTH_DEMO}/centered/sign-up`,
      resetPassword: `${ROOTS.AUTH_DEMO}/centered/reset-password`,
      updatePassword: `${ROOTS.AUTH_DEMO}/centered/update-password`,
      verify: `${ROOTS.AUTH_DEMO}/centered/verify`,
    },
  },

  // DASHBOARD
  dashboard: {
    root: ROOTS.DASHBOARD,
    categories: `${ROOTS.DASHBOARD}/categories`,
    users: `${ROOTS.DASHBOARD}/users`,
    approvals: {
      root: `${ROOTS.DASHBOARD}/approvals`,
      companies: {
        root: `${ROOTS.DASHBOARD}/approvals/companies`,
        pending: `${ROOTS.DASHBOARD}/approvals/companies/pending`,
        all: `${ROOTS.DASHBOARD}/approvals/companies/all`,
        details: (id: string) => `${ROOTS.DASHBOARD}/approvals/companies/${id}`,
      },
      jobs: {
        root: `${ROOTS.DASHBOARD}/approvals/jobs`,
        pending: `${ROOTS.DASHBOARD}/approvals/jobs/pending`,
        all: `${ROOTS.DASHBOARD}/approvals/jobs/all`,
        details: (id: string) => `${ROOTS.DASHBOARD}/approvals/jobs/${id}`,
      },
    },
  },
};
