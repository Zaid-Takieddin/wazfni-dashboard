'use client';

import { z as zod } from 'zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { Iconify } from 'src/components/iconify';
import { Form, Field } from 'src/components/hook-form';

import { FormHead } from '../components/form-head';
import { useAuthContext } from '../context/auth-provider';

// ----------------------------------------------------------------------

export const SignInSchema = zod.object({
  email: zod
    .string()
    .min(1, { message: 'Email is required!' })
    .email({ message: 'Email must be a valid email address!' }),
  password: zod
    .string()
    .min(1, { message: 'Password is required!' })
    .min(6, { message: 'Password must be at least 6 characters!' }),
});

export type SignInSchemaType = zod.infer<typeof SignInSchema>;

// ----------------------------------------------------------------------

export function AuthSignInView() {
  const router = useRouter();
  const { login } = useAuthContext();

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const defaultValues: SignInSchemaType = {
    email: 'admin@example.com',
    password: 'password123',
  };

  const methods = useForm<SignInSchemaType>({
    resolver: zodResolver(SignInSchema),
    defaultValues,
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      setErrorMsg('');
      await login(data.email, data.password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong!';
      setErrorMsg(errorMessage);
    }
  });

  const renderForm = () => (
    <Box gap={3} display="flex" flexDirection="column">
      <Field.Text
        name="email"
        label="Email address"
        placeholder="hello@gmail.com"
        InputLabelProps={{ shrink: true }}
      />

      <Field.Text
        name="password"
        label="Password"
        placeholder="6+ characters"
        type={showPassword ? 'text' : 'password'}
        InputLabelProps={{ shrink: true }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        loadingIndicator="Signing in..."
      >
        Sign in
      </LoadingButton>
    </Box>
  );

  return (
    <>
      <FormHead
        title="Sign in to Wazfni Admin"
        description="Only administrators can access this dashboard."
        sx={{ textAlign: { xs: 'center', md: 'left' } }}
      />

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        {renderForm()}
      </Form>

      <Alert severity="info" sx={{ mt: 3 }}>
        <Box component="strong">Admin Access Only:</Box> This dashboard is restricted to users with
        administrator privileges. Please ensure you have the correct credentials.
      </Alert>
    </>
  );
}
