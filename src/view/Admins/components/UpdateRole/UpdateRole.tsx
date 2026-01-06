import { type FC } from 'react'
import { Button, Dialog, DialogContent, DialogTitle, MenuItem, TextField, Typography, DialogActions, Box, InputAdornment } from '@mui/material'
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import type { TUser } from '@src/utils/types';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useUpdateAdminRole } from '@src/services';
import { onError } from '@src/utils/error';
import { toast } from 'react-toastify';
import { ADMIN_ROLE } from '@src/constant/admin-role';

interface UpdateRole {
    open: boolean;
    onClose: () => void;
    editAdminDetails: TUser
}

const validationSchema = Yup.object({
    role: Yup.string().required('Role is required'),
});

export const UpdateRole: FC<UpdateRole> = ({ editAdminDetails, onClose, open }) => {

    const { mutateAsync: updateAdminRole, isPending } = useUpdateAdminRole()
    const isEditAdmin = !!editAdminDetails?.id

    const formik = useFormik<{ role: string }>({
        initialValues: {
            role: editAdminDetails?.role || '',
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            await updateAdminRole({ ...values, id: editAdminDetails.id }, {
                onSuccess: (data) => {
                    toast.success(data?.message)
                    onClose()
                    resetForm()
                },
                onError
            })
        },
    });

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Typography variant="h5" fontWeight={600}>{isEditAdmin ? 'Update Admin Role' : 'Add Admin'}</Typography>
                <Typography variant="body2" color="text.secondary">Fill in the details below to {isEditAdmin ? 'update admin' : 'add a new admin'} role.</Typography>
            </DialogTitle>

            <form onSubmit={formik.handleSubmit} noValidate>
                <DialogContent>
                    <Box sx={{ pt: 1 }}>
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
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <WorkOutlineIcon color="action" />
                                    </InputAdornment>
                                ),
                            }}
                        >
                            <MenuItem value={editAdminDetails?.role} disabled>
                                {editAdminDetails?.role ? `Current: ${editAdminDetails.role}` : 'Select'}
                            </MenuItem>
                            {ADMIN_ROLE.map((role) =>
                                role.value !== editAdminDetails?.role && (
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.label}
                                    </MenuItem>
                                )
                            )}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={onClose} variant="outlined" color="secondary">Cancel</Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isPending || formik.values.role === editAdminDetails.role}
                        sx={{ backgroundColor: '#1976d2', '&:hover': { backgroundColor: '#125ca1' } }}
                    >
                        {isEditAdmin ? 'Update Role' : 'Add Admin'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    )
}
