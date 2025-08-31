import { AuthSplitLayout } from 'src/layouts/auth-split';
import { AuthSignInView } from 'src/auth/view/auth-sign-in-view';

// ----------------------------------------------------------------------

export const metadata = { title: `Sign in | Wazfni Admin` };

export default function Page() {
  return (
    <AuthSplitLayout
      slotProps={{
        section: { title: 'Admin Dashboard Access' },
      }}
    >
      <AuthSignInView />
    </AuthSplitLayout>
  );
}
