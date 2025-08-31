import { AdminGuard } from 'src/auth/guard/admin-guard';
import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: DashboardLayoutProps) {
  return (
    <AdminGuard>
      <DashboardLayout>{children}</DashboardLayout>
    </AdminGuard>
  );
}
