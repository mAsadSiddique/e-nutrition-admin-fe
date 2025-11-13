import React from 'react';

import SaveIcon from '@mui/icons-material/Save';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useCreateCategory } from '@src/services';
import { onError } from '@src/utils/error';
import type { TCreateCategoryPayload } from '@src/utils/types';
import { toast } from 'react-toastify';

type AddCategoryProps = {
    open: boolean;
    onClose: () => void;
};

type CategoryFormValues = TCreateCategoryPayload;

const validationSchema = Yup.object({
    name: Yup.string().required('Category name is required').max(120, 'Maximum 120 characters allowed'),
});

export const AddCategory: React.FC<AddCategoryProps> = ({ open, onClose }) => {
    const { mutateAsync: createCategory, isPending } = useCreateCategory();

    const formik = useFormik<CategoryFormValues>({
        initialValues: {
            name: '',
        },
        enableReinitialize: true,
        validationSchema,
        onSubmit: async (values, { resetForm }) => {
            await createCategory(values, {
                onSuccess: (data) => {
                    toast.success(data.message);
                    resetForm();
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
                    Add Category
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Provide the details below to create a new category.
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
                    <Button
                        disabled={isPending}
                        startIcon={<SaveIcon />}
                        type="submit"
                        variant="contained"
                    >
                        Add Category
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

