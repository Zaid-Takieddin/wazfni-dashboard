'use client';

import { useEffect } from 'react';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useAuthContext } from 'src/auth/context/auth-provider';

// ----------------------------------------------------------------------

export default function HomePage() {
  const router = useRouter();
  const { authenticated, loading } = useAuthContext();

  useEffect(() => {
    if (!loading) {
      if (authenticated) {
        // User is authenticated, redirect to dashboard
        router.replace(paths.dashboard.root);
      } else {
        // User is not authenticated, redirect to login
        router.replace(paths.auth.signIn);
      }
    }
  }, [authenticated, loading, router]);

  return null;
}
