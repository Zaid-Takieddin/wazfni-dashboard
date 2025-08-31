'use client';

import type { ReactNode } from 'react';
import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';
import { paths } from 'src/routes/paths';

import { useAuthContext } from '../context/auth-provider';

// ----------------------------------------------------------------------

type AdminGuardProps = {
  children: ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const { user, loading, authenticated, isAdmin } = useAuthContext();

  useEffect(() => {
    if (!loading) {
      if (!authenticated) {
        // Not authenticated, redirect to login
        router.replace(paths.auth.signIn);
      } else if (!isAdmin) {
        // Authenticated but not admin, show access denied
        console.warn('Access denied: Admin privileges required');
      }
    }
  }, [authenticated, isAdmin, loading, router]);

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <Box
        sx={{
          width: 1,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Not authenticated
  if (!authenticated) {
    return (
      <Box
        sx={{
          width: 1,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Alert severity="info">
          <Typography variant="h6">Authentication Required</Typography>
          <Typography variant="body2">Redirecting to login page...</Typography>
        </Alert>
      </Box>
    );
  }

  // Authenticated but not admin
  if (!isAdmin) {
    return (
      <Box
        sx={{
          width: 1,
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 3,
        }}
      >
        <Alert severity="error" sx={{ maxWidth: 400 }}>
          <Typography variant="h6" gutterBottom>
            Access Denied
          </Typography>
          <Typography variant="body2">
            You don't have permission to access this area. Admin privileges are required.
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }}>
            Current user role: {user?.role || 'Unknown'}
          </Typography>
        </Alert>
      </Box>
    );
  }

  // User is authenticated and is admin
  return <>{children}</>;
}
