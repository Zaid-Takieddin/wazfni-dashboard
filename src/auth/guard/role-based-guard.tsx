'use client';

import type { ReactNode } from 'react';

import { Box, Container, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';

import { useAuthContext } from '../hooks';

// ----------------------------------------------------------------------

type Props = {
  children: ReactNode;
  requiredRoles?: ('USER' | 'ADMIN' | 'COMPANY')[];
  requiredPermissions?: string[];
  fallback?: ReactNode;
};

export function RoleBasedGuard({
  children,
  requiredRoles = [],
  requiredPermissions = [],
  fallback,
}: Props) {
  const { user, authenticated, permissions } = useAuthContext();

  // If not authenticated, show access denied
  if (!authenticated || !user) {
    return (
      fallback || (
        <Container>
          <Box
            sx={{
              height: '50vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              flexDirection: 'column',
            }}
          >
            <Iconify
              icon="solar:shield-cross-bold-duotone"
              width={64}
              sx={{ color: 'error.main', mb: 2 }}
            />
            <Typography variant="h6" color="error" gutterBottom>
              Authentication Required
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please sign in to access this resource
            </Typography>
          </Box>
        </Container>
      )
    );
  }

  // Check role-based access
  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role as any)) {
    return (
      fallback || (
        <Container>
          <Box
            sx={{
              height: '50vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              flexDirection: 'column',
            }}
          >
            <Iconify
              icon="solar:shield-cross-bold-duotone"
              width={64}
              sx={{ color: 'error.main', mb: 2 }}
            />
            <Typography variant="h6" color="error" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You don&apos;t have the required role to access this resource
            </Typography>
            <Typography variant="caption" color="text.disabled" sx={{ mt: 1 }}>
              Required roles: {requiredRoles.join(', ')}
            </Typography>
          </Box>
        </Container>
      )
    );
  }

  // Check permission-based access
  if (requiredPermissions.length > 0) {
    const hasAllPermissions = requiredPermissions.every(
      (permission) => permissions[permission as keyof typeof permissions]
    );

    if (!hasAllPermissions) {
      return (
        fallback || (
          <Container>
            <Box
              sx={{
                height: '50vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                flexDirection: 'column',
              }}
            >
              <Iconify
                icon="solar:shield-cross-bold-duotone"
                width={64}
                sx={{ color: 'error.main', mb: 2 }}
              />
              <Typography variant="h6" color="error" gutterBottom>
                Insufficient Permissions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                You don&apos;t have the required permissions to access this resource
              </Typography>
            </Box>
          </Container>
        )
      );
    }
  }

  return <>{children}</>;
}
