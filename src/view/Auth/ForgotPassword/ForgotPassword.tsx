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
import { useForgotPassword } from '@src/services/profile';

// ----------------------------------------------------------------------

const forgotPasswordValidationSchema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
});

const DEFAULT_FORGOT_PASSWORD_ERROR = 'Unable to process your request. Please try again.';
const DEFAULT_FORGOT_PASSWORD_SUCCESS =
  'If an account with that email exists, you will receive password reset instructions shortly.';

type ForgotPasswordResponse = {
  message?: string;
  data?: {
    message?: string;
  };
};

type ForgotPasswordStatus = {
  severity: 'success' | 'error';
  message: string;
};

const getForgotPasswordSuccessMessage = (
  response: ForgotPasswordResponse | null | undefined
): string | null => {
  if (!response) {
    return null;
  }

  return response.message ?? response.data?.message ?? null;
};

const getForgotPasswordErrorMessage = (error: unknown): string => {
  if (!error) {
    return DEFAULT_FORGOT_PASSWORD_ERROR;
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
      DEFAULT_FORGOT_PASSWORD_ERROR
    );
  }

  return DEFAULT_FORGOT_PASSWORD_ERROR;
};

export function ForgotPasswordView() {
  const forgotPasswordMutation = useForgotPassword();

  const formik = useFormik<{
    email: string;
  }>({
    initialValues: {
      email: '',
    },
    validationSchema: forgotPasswordValidationSchema,
    onSubmit: async (values, helpers) => {
      helpers.setStatus(undefined);
      forgotPasswordMutation.reset();

      try {
        const response = (await forgotPasswordMutation.mutateAsync(values)) as ForgotPasswordResponse;
        const successMessage =
          getForgotPasswordSuccessMessage(response) ?? DEFAULT_FORGOT_PASSWORD_SUCCESS;

        helpers.setStatus({ severity: 'success', message: successMessage });
        helpers.resetForm();
      } catch (error) {
        helpers.setStatus({ severity: 'error', message: getForgotPasswordErrorMessage(error) });
      } finally {
        helpers.setSubmitting(false);
      }
    },
  });

  const { values, touched, errors, handleChange, handleBlur, handleSubmit, isSubmitting, status } = formik;
  const isLoading = isSubmitting || forgotPasswordMutation.isPending;
  const alertStatus = (status as ForgotPasswordStatus | undefined) ?? undefined;

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
            Forgot password?
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Enter your registered email address and we will send you instructions to reset your password.
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

          <Button
            fullWidth
            size="large"
            type="submit"
            color="inherit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress color="inherit" size={20} /> : undefined}
          >
            {isLoading ? 'Sending instructions...' : 'Send reset link'}
          </Button>

          <Box textAlign="center">
            <Link
              component={RouterLink}
              href="/login"
              variant="body2"
              color="inherit"
              sx={{ fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}
            >
              <Typography component="span" variant="body2" fontWeight={500}>
                Back to sign in
              </Typography>
            </Link>
          </Box>
        </Stack>
      </Stack>
    </Card>
  );
}
