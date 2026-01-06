import { useFormik } from 'formik';
import * as Yup from 'yup';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CircularProgress from '@mui/material/CircularProgress';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { RouterLink } from '@src/routes/components';
import { useResetPassword } from '@src/services/profile';
import { useRouter } from '@src/routes/hooks';

// ----------------------------------------------------------------------

const setPasswordValidationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
  code: Yup.string().required('Reset code is required'),
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

const DEFAULT_SET_PASSWORD_ERROR = 'Unable to set your password. Please try again.';
const DEFAULT_SET_PASSWORD_SUCCESS = 'Your password has been updated successfully. You can now sign in.';

type ResetPasswordResponse = {
  message?: string;
  data?: {
    message?: string;
  };
};

type SetPasswordStatus = {
  severity: 'success' | 'error';
  message: string;
};

const getSetPasswordSuccessMessage = (response: ResetPasswordResponse | null | undefined): string | null => {
  if (!response) {
    return null;
  }

  return response.message ?? response.data?.message ?? null;
};

const getSetPasswordErrorMessage = (error: unknown): string => {
  if (!error) {
    return DEFAULT_SET_PASSWORD_ERROR;
  }

  if (typeof error === 'string') {
    return error;
  }

  if (typeof error === 'object') {
    const maybeAxiosError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };

    return (
      maybeAxiosError.response?.data?.message ??
      maybeAxiosError.message ??
      DEFAULT_SET_PASSWORD_ERROR
    );
  }

  return DEFAULT_SET_PASSWORD_ERROR;
};

export function SetPasswordView() {
  const router = useRouter();
  const { mutateAsync: resetPassword, isPending, reset } = useResetPassword();

  const formik = useFormik<{
    email: string;
    code: string;
    password: string;
    confirmPassword: string;
  }>({
    initialValues: {
      email: '',
      code: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: setPasswordValidationSchema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      reset();

      try {
        const response = (await resetPassword(values)) as ResetPasswordResponse;
        const successMessage = getSetPasswordSuccessMessage(response) ?? DEFAULT_SET_PASSWORD_SUCCESS;

        helpers.setStatus({ severity: 'success', message: successMessage });
        helpers.resetForm();
        

          router.replace('/login');

      } catch (error) {
        helpers.setStatus({ severity: 'error', message: getSetPasswordErrorMessage(error) });
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const {
    values,
    touched,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    status,
  } = formik;

  const isLoading = isSubmitting || isPending;
  const alertStatus = (status as SetPasswordStatus | undefined) ?? undefined;

  return (
    <Card
      sx={{
        p: 4,
        width: '100%',
        maxWidth: 450,
        minWidth: { md: 450 },
        borderRadius: '30px',
        mx: 'auto',
      }}
    >
      <Stack component="form" noValidate spacing={4} onSubmit={handleSubmit}>
        <Stack spacing={1.5} alignItems="center">
          <Typography variant="h4" fontWeight={600}>
            Set new password
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Enter the verification code sent to your email, then choose a new password for your account.
          </Typography>
        </Stack>

        {alertStatus ? (
          <Alert severity={alertStatus.severity} variant="outlined">
            {alertStatus.message}
          </Alert>
        ) : null}

        <Stack spacing={3}>
          <TextField
            fullWidth
            name="email"
            label="Email address"
            autoComplete="email"
            value={values.email}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(touched.email && errors.email)}
            helperText={touched.email && errors.email}
          />

          <TextField
            fullWidth
            name="code"
            label="Reset code"
            value={values.code}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(touched.code && errors.code)}
            helperText={touched.code && errors.code}
          />

          <TextField
            fullWidth
            name="password"
            label="New password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(touched.password && errors.password)}
            helperText={touched.password && errors.password}
          />

          <TextField
            fullWidth
            name="confirmPassword"
            label="Confirm new password"
            type="password"
            value={values.confirmPassword}
            onChange={handleChange}
            onBlur={handleBlur}
            error={Boolean(touched.confirmPassword && errors.confirmPassword)}
            helperText={touched.confirmPassword && errors.confirmPassword}
          />

          <Button
            fullWidth
            size="large"
            type="submit"
            color="inherit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress color="inherit" size={20} /> : undefined}
          >
            {isLoading ? 'Updating password...' : 'Update password'}
          </Button>

          <Box textAlign="center">
            <Link
              component={RouterLink}
              href="/login"
              variant="body2"
              color="inherit"
              sx={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
            >
              Back to sign in
            </Link>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}
