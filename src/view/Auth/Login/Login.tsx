import { useState } from 'react';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import storage from '@src/utils/storage';
import { useLoginProfile } from '@src/services/profile';
import { RouterLink } from '@src/routes/components';

import { Iconify } from '@src/components/iconify';
import { useUserProfileHandler } from '@src/store/profile/hook';
import { toast } from 'react-toastify';
import { StaticRoutes } from '@src/utils/enums';
import { useRouter } from '@src/routes/hooks';
import { onError } from '@src/utils/error';

// ----------------------------------------------------------------------

const loginValidationSchema = Yup.object({
    email: Yup.string().email('Enter a valid email address').required('Email is required'),
    password: Yup.string().required('Password is required'),
});

export function SignInView() {
    const router = useRouter();
    const { onSetProfile } = useUserProfileHandler()

    const [showPassword, setShowPassword] = useState(false);
    const { mutateAsync: loginAdmin, isPending } = useLoginProfile();

    const formik = useFormik<{
        email: string;
        password: string;
    }>({
        initialValues: {
            email: '',
            password: '',
        },
        validationSchema: loginValidationSchema,
        onSubmit: async (values, { resetForm }) => {
            await loginAdmin(values, {
                onSuccess: (data) => {
                    storage.setToken(data?.data?.jwtToken)
                    onSetProfile(data?.data?.user)
                    toast.success('Logged in successfully')
                    router.push(StaticRoutes.ADMIN_LISTING)
                    resetForm()
                },
                onError
            });

        },
    });

    const { values, touched, errors, handleChange, handleBlur, handleSubmit, status } = formik;

    const formStatus = (typeof status === 'string' && status) || undefined;

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
                {/* Header Section */}
                <Stack spacing={1.5} alignItems="center">
                    <Typography variant="h4" fontWeight={600}>
                        Sign in
                    </Typography>
                </Stack>

                {formStatus ? (
                    <Alert severity="error" variant="outlined">
                        {formStatus}
                    </Alert>
                ) : null}

                {/* Form Section */}
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
                        name="password"
                        label="Password"
                        autoComplete="current-password"
                        type={showPassword ? 'text' : 'password'}
                        value={values.password}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.password && errors.password)}
                        helperText={touched.password && errors.password}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowPassword((prev) => !prev)} edge="end">
                                        <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Box display="flex" justifyContent="flex-end">
                        <Link
                            component={RouterLink}
                            href="/forgot-password"
                            variant="body2"
                            color="inherit"
                            sx={{ cursor: 'pointer', fontWeight: 600 }}
                        >
                            Forgot password?
                        </Link>
                    </Box>

                    <Button
                        fullWidth
                        size="large"
                        type="submit"
                        color="inherit"
                        variant="contained"
                        disabled={isPending}
                        startIcon={isPending ? <CircularProgress color="inherit" size={20} /> : undefined}
                    >
                        {isPending ? 'Signing in...' : 'Sign in'}
                    </Button>
                </Stack>
            </Stack>
        </Card>
    );
}
