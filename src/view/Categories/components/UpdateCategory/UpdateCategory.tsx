import React, { useMemo } from 'react';

import SaveIcon from '@mui/icons-material/Save';
import {
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    TextField,
    Typography,
} from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useUpdateCategory } from '@src/services';
import { onError } from '@src/utils/error';
import type { TCategory, TUpdateCategoryPayload } from '@src/utils/types';
import { toast } from 'react-toastify';

type UpdateCategoryProps = {
    open: boolean;
    onClose: () => void;
    category: TCategory | null;
};

const validationSchema = Yup.object({
    name: Yup.string().required('Category name is required').max(120, 'Maximum 120 characters allowed'),
});

export const UpdateCategory: React.FC<UpdateCategoryProps> = ({ open, onClose, category }) => {
    const { mutateAsync: updateCategory, isPending } = useUpdateCategory();

    const initialValues = useMemo<TUpdateCategoryPayload>(
        () => ({
            id: category?.id ?? '',
            name: category?.name ?? '',
        }),
        [category]
    );

    const formik = useFormik<TUpdateCategoryPayload>({
        initialValues,
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values) => {
            await updateCategory(values, {
                onSuccess: (data) => {
                    toast.success(data.message);
                    onClose();
                },
                onError,
            });
        },
    });

    const handleClose = () => {
        formik.resetForm();
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Typography variant="h5" fontWeight={600}>
                    Update Category
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Modify the category name below and save your changes.
                </Typography>
            </DialogTitle>

            <form onSubmit={formik.handleSubmit} noValidate>
                <DialogContent>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                variant="outlined"
                                label="Category Name"
                                name="name"
                                value={formik.values.name}
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                error={formik.touched.name && Boolean(formik.errors.name)}
                                helperText={formik.touched.name && formik.errors.name}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={handleClose} variant="outlined" color="secondary">
                        Cancel
                    </Button>
                    <Button disabled={isPending} startIcon={<SaveIcon />} type="submit" variant="contained">
                        Update Category
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

