import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    IconButton,
    InputAdornment,
    Divider,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Iconify } from '@src/components/iconify';
// import { PasswordStrength } from '@src/components/PasswordStrength';
import { toast } from 'react-toastify';
import { onError } from '@src/utils/error';
import { useChangePassword } from '@src/services';
import { useRouter } from '@src/routes/hooks';

const validationSchema = Yup.object({
    oldPassword: Yup.string()
        .required('Current password is required'),
    password: Yup.string()
        .required('New password is required')
        .min(8, 'Password must be at least 8 characters')
        .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
        .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .matches(/\d/, 'Password must contain at least one number')
        .matches(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)')
        .test('different-from-current', 'New password must be different from current password', function (value) {
            const { oldPassword } = this.parent;
            return value !== oldPassword;
        }),
    confirmPassword: Yup.string()
        .required('Please confirm your new password')
        .oneOf([Yup.ref('password')], 'Passwords must match'),
});

export const ChangePassword = () => {
    const router = useRouter()
    const [showPasswords, setShowPasswords] = useState({
        current: false,
        new: false,
        confirm: false,
    });

    const { mutateAsync: changePassword, isPending } = useChangePassword();

    const formik = useFormik({
        initialValues: {
            oldPassword: '',
            password: '',
            confirmPassword: '',
        },
        validationSchema: validationSchema,
        onSubmit: async (values) => {
            await changePassword(values, {
                onSuccess: () => {
                    toast.success('Password changed successfully!');
                    formik.resetForm();
                    setShowPasswords({
                        current: false,
                        new: false,
                        confirm: false,
                    });
                    router.back()
                },
                onError,
            }
            );
        },
    });

    const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
        setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const handleCancel = () => {
        formik.resetForm();
        setShowPasswords({
            current: false,
            new: false,
            confirm: false,
        });
    };

    return (
        <Paper sx={{ p: 3, maxWidth: 600 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Iconify
                    icon="solar:lock-password-bold-duotone"
                    width={24}
                    sx={{ mr: 2, color: 'primary.main' }}
                />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Change Password
                </Typography>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Box component="form" onSubmit={formik.handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                    fullWidth
                    name="oldPassword"
                    label="Current Password"
                    type={showPasswords.current ? 'text' : 'password'}
                    value={formik.values.oldPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.oldPassword && Boolean(formik.errors.oldPassword)}
                    helperText={formik.touched.oldPassword && formik.errors.oldPassword}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => togglePasswordVisibility('current')}
                                    edge="end"
                                >
                                    <Iconify
                                        icon={showPasswords.current ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                                        width={20}
                                    />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <TextField
                    fullWidth
                    name="password"
                    label="New Password"
                    type={showPasswords.new ? 'text' : 'password'}
                    value={formik.values.password}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.password && Boolean(formik.errors.password)}
                    helperText={
                        (formik.touched.password && formik.errors.password) ||
                        'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
                    }
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => togglePasswordVisibility('new')}
                                    edge="end"
                                >
                                    <Iconify
                                        icon={showPasswords.new ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                                        width={20}
                                    />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                {/* {formik.values.password && (
                    <PasswordStrength password={formik.values.password} />
                )} */}

                <TextField
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={formik.values.confirmPassword}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                    helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    edge="end"
                                >
                                    <Iconify
                                        icon={showPasswords.confirm ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                                        width={20}
                                    />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 1 }}>
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={handleCancel}
                        disabled={isPending}
                        sx={{
                            minWidth: 120,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending || !formik.isValid}
                        startIcon={
                            <Iconify icon="solar:check-circle-bold-duotone" width={20} />
                        }
                        sx={{
                            minWidth: 160,
                        }}
                    >
                        {isPending ? 'Changing Password...' : 'Change Password'}
                    </Button>
                </Box>
            </Box>
        </Paper>
    );
}; 