import React, { useMemo } from 'react';

import SaveIcon from '@mui/icons-material/Save';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField, Typography, Box, Chip } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';

import { useCreateCategory, useCategoryListing } from '@src/services';
import { onError } from '@src/utils/error';
import type { TCreateCategoryPayload, TCategory } from '@src/utils/types';
import { toast } from 'react-toastify';
import { Iconify } from '@src/components/iconify';

type AddCategoryProps = {
    open: boolean;
    onClose: () => void;
    parentCategory?: TCategory | null;
};

type CategoryFormValues = TCreateCategoryPayload;

const validationSchema = Yup.object({
    name: Yup.string().required('Category name is required').max(120, 'Maximum 120 characters allowed'),
});

export const AddCategory: React.FC<AddCategoryProps> = ({ open, onClose, parentCategory = null }) => {
    const { mutateAsync: createCategory, isPending } = useCreateCategory();
    const { data: categoryData } = useCategoryListing();

    // Build the full path/breadcrumb for the parent category
    const parentPath = useMemo(() => {
        if (!parentCategory || !categoryData?.categories) return [];
        
        const findPath = (categories: TCategory[], targetId: string | number, path: TCategory[] = []): TCategory[] | null => {
            for (const cat of categories) {
                const currentPath = [...path, cat];
                if (cat.id === targetId) {
                    return currentPath;
                }
                if (cat.children) {
                    const found = findPath(cat.children, targetId, currentPath);
                    if (found) return found;
                }
            }
            return null;
        };
        
        return findPath(categoryData.categories, parentCategory.id) || [];
    }, [parentCategory, categoryData]);

    const formik = useFormik<CategoryFormValues>({
        initialValues: {
            name: '',
            parentId: parentCategory?.id ?? null,
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
        formik.resetForm({
            values: {
                name: '',
                parentId: parentCategory?.id ?? null,
            },
        });
        onClose();
    };

    const isSubcategory = Boolean(parentCategory);
    const depthLevel = parentPath.length;

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Typography variant="h5" fontWeight={600}>
                    {isSubcategory 
                        ? `Add ${depthLevel === 1 ? 'Subcategory' : depthLevel === 2 ? 'Sub-subcategory' : 'Nested Category'}` 
                        : 'Add Category'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {isSubcategory
                        ? `Add a new category under the selected parent.`
                        : 'Provide the details below to create a new top-level category.'}
                </Typography>
                {isSubcategory && parentPath.length > 0 && (
                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ mr: 0.5 }}>
                            Parent Path:
                        </Typography>
                        {parentPath.map((cat, index) => (
                            <React.Fragment key={cat.id}>
                                <Chip
                                    label={cat.name}
                                    size="small"
                                    sx={{
                                        height: 24,
                                        fontSize: '0.75rem',
                                        backgroundColor: index === parentPath.length - 1 ? 'primary.main' : 'action.selected',
                                        color: index === parentPath.length - 1 ? 'primary.contrastText' : 'text.primary',
                                        fontWeight: index === parentPath.length - 1 ? 600 : 400,
                                    }}
                                />
                                {index < parentPath.length - 1 && (
                                    <Iconify icon="eva:arrow-ios-forward-fill" width={16} sx={{ color: 'text.disabled' }} />
                                )}
                            </React.Fragment>
                        ))}
                    </Box>
                )}
            </DialogTitle>

            <form onSubmit={formik.handleSubmit} noValidate>
                <DialogContent>
                    <Grid container spacing={2}>
                        {isSubcategory && (
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    variant="outlined"
                                    label="Parent Category"
                                    value={parentCategory?.name ?? ''}
                                    disabled
                                    helperText={`This category will be added at level ${depthLevel + 1} in the hierarchy`}
                                    sx={{
                                        '& .MuiInputBase-input': {
                                            backgroundColor: 'action.disabledBackground',
                                        },
                                    }}
                                />
                            </Grid>
                        )}
                        <Grid item xs={12}>
                            <TextField
                                required
                                fullWidth
                                variant="outlined"
                                label={isSubcategory 
                                    ? depthLevel === 1 
                                        ? 'Subcategory Name' 
                                        : depthLevel === 2 
                                            ? 'Sub-subcategory Name'
                                            : 'Nested Category Name'
                                    : 'Category Name'}
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
                        {isSubcategory 
                            ? depthLevel === 1 
                                ? 'Add Subcategory' 
                                : depthLevel === 2 
                                    ? 'Add Sub-subcategory'
                                    : 'Add Nested Category'
                            : 'Add Category'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

