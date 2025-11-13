import React, { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

import { Iconify } from '@src/components/iconify';
import { Scrollbar } from '@src/components/scrollbar';
import { DashboardContent } from '@src/layouts/dashboard/main';
import { useCategoryListing, useRemoveCategory } from '@src/services';
import type { TCategory } from '@src/utils/types';
import { AddCategory } from './components/AddCategory';
import { UpdateCategory } from './components/UpdateCategory';
import { ConfirmDialog } from '@src/components/elements';
import { toast } from 'react-toastify';
import { onError } from '@src/utils/error';

// ----------------------------------------------------------------------

type FlattenedCategory = {
    id: string | number;
    name: string;
    depth: number;
    parentName: string | null;
    childrenCount: number;
    category: TCategory;
};

const flattenCategories = (
    categories: TCategory[],
    depth = 0,
    parentName: string | null = null
): FlattenedCategory[] => {
    return categories.flatMap((category) => {
        const current: FlattenedCategory = {
            id: category.id,
            name: category.name,
            depth,
            parentName,
            childrenCount: category.children?.length ?? 0,
            category,
        };

        const childRows = category.children
            ? flattenCategories(category.children, depth + 1, category.name)
            : [];

        return [current, ...childRows];
    });
};

// ----------------------------------------------------------------------

export const Categories = () => {
    const { data: categoryData, isLoading, isError, isFetching, refetch } = useCategoryListing();
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
    const [isRemoveCategoryOpen, setIsRemoveCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(null);
    const { mutateAsync: removeCategory, isPending: isRemoving } = useRemoveCategory();
    const categories = useMemo(() => categoryData?.categories ?? [], [categoryData]);
    const totalCount = categoryData?.count ?? categories.length;
    const tableRows = useMemo(() => flattenCategories(categories), [categories]);
    const isEmpty = !isLoading && !isError && tableRows.length === 0;

    const handleEdit = (category: TCategory) => {
        setSelectedCategory(category);
        setIsEditCategoryOpen(true);
    };

    const handleDelete = (category: TCategory) => {
        setSelectedCategory(category);
        setIsRemoveCategoryOpen(true);
    };

    const handleOpenAddCategory = () => setIsAddCategoryOpen(true);
    const handleCloseAddCategory = () => setIsAddCategoryOpen(false);
    const handleCloseEditCategory = () => {
        setIsEditCategoryOpen(false);
        setSelectedCategory(null);
    };
    const handleCloseRemoveCategory = () => {
        setIsRemoveCategoryOpen(false);
        setSelectedCategory(null);
    };

    const handleConfirmRemove = async () => {
        if (!selectedCategory) {
            return;
        }

        await removeCategory(selectedCategory.id, {
            onSuccess: (data) => {
                toast.success(data.message);
                handleCloseRemoveCategory();
            },
            onError,
        });
    };

    return (
        <DashboardContent>
            <AddCategory open={isAddCategoryOpen} onClose={handleCloseAddCategory} />
            <UpdateCategory open={isEditCategoryOpen} onClose={handleCloseEditCategory} category={selectedCategory} />
            <ConfirmDialog
                title="Remove Category"
                description={`Are you sure you want to remove "${selectedCategory?.name ?? 'this category'}"?`}
                confirmText="Remove"
                confirmColor="error"
                open={isRemoveCategoryOpen}
                onClose={handleCloseRemoveCategory}
                onConfirm={handleConfirmRemove}
                isLoading={isRemoving}
            />
            {/* Header Section */}
            <Box
                sx={{
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <Box>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                        Categories
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Manage your product categories and organize your inventory
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
                        {isFetching ? 'Refreshing categories…' : `Showing ${tableRows.length} of ${totalCount} categories`}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    sx={{ minWidth: 120 }}
                    onClick={handleOpenAddCategory}
                >
                    Add Category
                </Button>
            </Box>

            {/* Table Section */}
            <Card>
                <Scrollbar>
                    <TableContainer sx={{ overflow: 'unset' }}>
                        <Table sx={{ minWidth: 960 }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell width={60}>ID</TableCell>
                                    <TableCell>Category Name</TableCell>
                                    <TableCell width={200}>Parent Category</TableCell>
                                    <TableCell width={160}>Sub Categories</TableCell>
                                    <TableCell align="right" width={120}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {isLoading
                                    ? Array.from({ length: 5 }).map((_, index) => (
                                        <TableRow key={`category-loading-${index}`}>
                                            <TableCell colSpan={5} sx={{ py: 4 }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                                    <CircularProgress size={32} />
                                                </Box>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                    : null}

                                {isError ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Alert
                                                severity="error"
                                                action={
                                                    <Button size="small" onClick={() => refetch()}>
                                                        Retry
                                                    </Button>
                                                }
                                            >
                                                Failed to load categories. Please try again.
                                            </Alert>
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {isEmpty ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <Box
                                                sx={{
                                                    py: 6,
                                                    textAlign: 'center',
                                                }}
                                            >
                                                <Typography variant="subtitle1" gutterBottom>
                                                    No categories found
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                                    Start by creating your first category to organize your items.
                                                </Typography>
                                                <Button variant="outlined" onClick={handleOpenAddCategory}>
                                                    Add Category
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : null}

                                {!isLoading && !isError
                                    ? tableRows.map((row, index) => {
                                        const identifier = `${row.id}-${index}`;
                                        return (
                                            <TableRow key={identifier} hover>
                                                <TableCell>{row.id}</TableCell>
                                                <TableCell>
                                                    <Typography
                                                        variant="subtitle2"
                                                        sx={{
                                                            fontWeight: row.depth === 0 ? 600 : 500,
                                                            pl: row.depth * 2,
                                                        }}
                                                    >
                                                        {row.name}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        {row.parentName || '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        {row.childrenCount}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                        <Tooltip title="Edit">
                                                            <IconButton
                                                                size="small"
                                                                color="default"
                                                                onClick={() => handleEdit(row.category)}
                                                            >
                                                                <Iconify icon="solar:pen-bold" width={20} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Delete">
                                                            <IconButton
                                                                size="small"
                                                                color="error"
                                                                onClick={() => handleDelete(row.category)}
                                                            >
                                                                <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                    : null}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>
            </Card>
        </DashboardContent>
    );
};

