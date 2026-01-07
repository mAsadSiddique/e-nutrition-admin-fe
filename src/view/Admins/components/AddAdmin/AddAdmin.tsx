import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    MenuItem,
    Box,
    Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import SaveIcon from '@mui/icons-material/Save';

import { onError } from '@src/utils/error';
import { toast } from 'react-toastify';
import { useAddAdmin } from '@src/services';

interface AddAdminModalProps {
    open: boolean;
    onClose: () => void;
}

interface AdminFormValues {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
}

const roles = [
    { value: 'Super', label: 'Super Admin' },
    { value: 'Sub', label: 'Sub Admin' },
];

const validationSchema = Yup.object({
    firstName: Yup.string().required('First name is required').max(50),
    lastName: Yup.string().required('Last name is required').max(50),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().required('Role is required'),
});

export const AddAdmin: React.FC<AddAdminModalProps> = ({ open, onClose }) => {
    const { mutateAsync: addAdmin, isPending } = useAddAdmin()

    const formik = useFormik<AdminFormValues>({
        initialValues: {
            firstName: '',
            lastName: '',
            email: '',
            role: 'Sub',
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            await addAdmin(values, {
                onSuccess: (data) => {
                    toast.success(data.message)
                    resetForm();
                    onClose();
                },
                onError
            })
        },
    });


    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Typography variant="h5" fontWeight={600}>
                    Add Admin
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Fill in the details below to add a new admin to the system.
                </Typography>
            </DialogTitle>

            <form onSubmit={formik.handleSubmit} noValidate>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="First Name"
                                name="firstName"
                                value={formik.values.firstName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.firstName && Boolean(formik.errors.firstName)}
                                helperText={formik.touched.firstName && formik.errors.firstName}
                            />

                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Last Name"
                                name="lastName"
                                value={formik.values.lastName}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.lastName && Boolean(formik.errors.lastName)}
                                helperText={formik.touched.lastName && formik.errors.lastName}
                            />
                        </Box>

                        <TextField
                            fullWidth
                            variant="outlined"
                            label="Email Address"
                            name="email"
                            type="email"
                            value={formik.values.email}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.email && Boolean(formik.errors.email)}
                            helperText={formik.touched.email && formik.errors.email}
                        />

                        <TextField
                            select
                            fullWidth
                            variant="outlined"
                            label="Select Role"
                            name="role"
                            value={formik.values.role}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            error={formik.touched.role && Boolean(formik.errors.role)}
                            helperText={formik.touched.role && formik.errors.role}
                            InputProps={{
                                startAdornment: <WorkOutlineIcon color="action" sx={{ mr: 1 }} />,
                            }}
                        >
                            {roles.map((role) => (
                                <MenuItem key={role.value} value={role.value}>
                                    {role.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                    <Button
                        disabled={isPending}
                        startIcon={<SaveIcon />}
                        type="submit"
                        variant="contained"
                        sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#125ca1' } }}
                    >
                        Add Admin
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

