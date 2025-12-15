import React, { useMemo, useState, useEffect } from 'react';

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
    const [isAddSubcategoryOpen, setIsAddSubcategoryOpen] = useState(false);
    const [isEditCategoryOpen, setIsEditCategoryOpen] = useState(false);
    const [isRemoveCategoryOpen, setIsRemoveCategoryOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<TCategory | null>(null);
    const [parentCategoryForSubcategory, setParentCategoryForSubcategory] = useState<TCategory | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Set<string | number>>(new Set());
    const { mutateAsync: removeCategory, isPending: isRemoving } = useRemoveCategory();
    const categories = useMemo(() => categoryData?.categories ?? [], [categoryData]);
    const totalCount = categoryData?.count ?? categories.length;
    const tableRows = useMemo(() => flattenCategories(categories), [categories]);
    const isEmpty = !isLoading && !isError && tableRows.length === 0;

    // Expand all parent categories by default when data loads
    useEffect(() => {
        if (categories.length > 0 && expandedCategories.size === 0) {
            const initialExpanded = new Set<string | number>();
            const expandAllParents = (cats: TCategory[]) => {
                cats.forEach((cat) => {
                    if (cat.children && cat.children.length > 0) {
                        initialExpanded.add(cat.id);
                        expandAllParents(cat.children);
                    }
                });
            };
            expandAllParents(categories);
            setExpandedCategories(initialExpanded);
        }
    }, [categories, expandedCategories.size]);

    const handleEdit = (category: TCategory) => {
        setSelectedCategory(category);
        setIsEditCategoryOpen(true);
    };

    const handleDelete = (category: TCategory) => {
        setSelectedCategory(category);
        setIsRemoveCategoryOpen(true);
    };

    const handleOpenAddCategory = () => {
        setParentCategoryForSubcategory(null);
        setIsAddCategoryOpen(true);
    };
    const handleCloseAddCategory = () => {
        setIsAddCategoryOpen(false);
        setParentCategoryForSubcategory(null);
    };
    const handleOpenAddSubcategory = (category: TCategory) => {
        setParentCategoryForSubcategory(category);
        setIsAddSubcategoryOpen(true);
    };
    const handleCloseAddSubcategory = () => {
        setIsAddSubcategoryOpen(false);
        setParentCategoryForSubcategory(null);
    };
    const handleCloseEditCategory = () => {
        setIsEditCategoryOpen(false);
        setSelectedCategory(null);
    };
    const handleCloseRemoveCategory = () => {
        setIsRemoveCategoryOpen(false);
        setSelectedCategory(null);
    };
    const toggleCategoryExpansion = (categoryId: string | number) => {
        setExpandedCategories((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(categoryId)) {
                newSet.delete(categoryId);
            } else {
                newSet.add(categoryId);
            }
            return newSet;
        });
    };

    const handleConfirmRemove = async () => {
        if (!selectedCategory) {
            return;
        }

        await removeCategory({ id: +selectedCategory.id }, {
            onSuccess: (data) => {
                toast.success(data.message);
                handleCloseRemoveCategory();
            },
            onError,
        });
    };

    // Filter rows based on parent expansion state
    const visibleRows = useMemo(() => {
        return tableRows.filter((row) => {
            // Always show top-level categories
            if (row.depth === 0) return true;

            // For child categories, check if all parent levels are expanded
            let currentDepth = row.depth;
            let currentParentName = row.parentName;

            while (currentDepth > 0) {
                const parentRow = tableRows.find(
                    (r) => r.depth === currentDepth - 1 && r.name === currentParentName
                );

                if (!parentRow) return true; // If parent not found, show it (shouldn't happen)
                if (!expandedCategories.has(parentRow.id)) return false; // If parent is collapsed, hide child

                // Move up one level
                currentDepth = parentRow.depth;
                currentParentName = parentRow.parentName;
            }

            return true;
        });
    }, [tableRows, expandedCategories]);

    return (
        <DashboardContent>
            <AddCategory open={isAddCategoryOpen} onClose={handleCloseAddCategory} parentCategory={null} />
            <AddCategory
                open={isAddSubcategoryOpen}
                onClose={handleCloseAddSubcategory}
                parentCategory={parentCategoryForSubcategory}
            />
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
                        {isFetching
                            ? 'Refreshing categories…'
                            : `Showing ${visibleRows.length} of ${totalCount} categories${expandedCategories.size > 0 ? ' (some collapsed)' : ''}`}
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
                                    ? visibleRows.map((row, index) => {
                                        const identifier = `${row.id}-${index}`;
                                        const isExpanded = expandedCategories.has(row.id);
                                        const hasChildren = row.childrenCount > 0;
                                        const depthLevel = row.depth;
                                        const isTopLevel = depthLevel === 0;

                                        return (
                                            <TableRow
                                                key={identifier}
                                                hover
                                                sx={{
                                                    backgroundColor:
                                                        depthLevel === 0
                                                            ? 'transparent'
                                                            : depthLevel === 1
                                                                ? 'action.hover'
                                                                : depthLevel === 2
                                                                    ? 'action.selected'
                                                                    : 'grey.50',
                                                    '&:hover': {
                                                        backgroundColor: 'action.selected',
                                                    },
                                                }}
                                            >
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        {hasChildren && (
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => toggleCategoryExpansion(row.id)}
                                                                sx={{ p: 0.5 }}
                                                            >
                                                                <Iconify
                                                                    icon={isExpanded ? 'eva:arrow-ios-downward-fill' : 'eva:arrow-ios-forward-fill'}
                                                                    width={18}
                                                                />
                                                            </IconButton>
                                                        )}
                                                        {!hasChildren && <Box sx={{ width: 26 }} />}
                                                        <Typography variant="body2">{row.id}</Typography>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box
                                                            sx={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                pl: depthLevel * 2.5,
                                                                position: 'relative',
                                                                width: '100%',
                                                            }}
                                                        >
                                                            {depthLevel > 0 && (
                                                                <Box
                                                                    sx={{
                                                                        position: 'absolute',
                                                                        left: 0,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: 0.25,
                                                                    }}
                                                                >
                                                                    {Array.from({ length: depthLevel }).map((_, idx) => (
                                                                        <Box
                                                                            key={idx}
                                                                            sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                width: 20,
                                                                                justifyContent: 'center',
                                                                            }}
                                                                        >
                                                                            {idx === depthLevel - 1 ? (
                                                                                <Iconify
                                                                                    icon="eva:corner-down-right-fill"
                                                                                    width={16}
                                                                                    sx={{
                                                                                        color: 'primary.main',
                                                                                    }}
                                                                                />
                                                                            ) : (
                                                                                <Box
                                                                                    sx={{
                                                                                        width: 1,
                                                                                        height: 20,
                                                                                        backgroundColor: 'divider',
                                                                                    }}
                                                                                />
                                                                            )}
                                                                        </Box>
                                                                    ))}
                                                                </Box>
                                                            )}
                                                            <Typography
                                                                variant="subtitle2"
                                                                sx={{
                                                                    fontWeight: isTopLevel ? 600 : depthLevel === 1 ? 500 : depthLevel === 2 ? 400 : 300,
                                                                    color: isTopLevel
                                                                        ? 'text.primary'
                                                                        : depthLevel === 1
                                                                            ? 'text.secondary'
                                                                            : 'text.disabled',
                                                                    fontSize: isTopLevel
                                                                        ? '0.875rem'
                                                                        : depthLevel === 1
                                                                            ? '0.875rem'
                                                                            : '0.8125rem',
                                                                }}
                                                            >
                                                                {row.name}
                                                            </Typography>
                                                        </Box>
                                                    </Box>
                                                </TableCell>
                                                <TableCell>
                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                        {row.parentName || '—'}
                                                    </Typography>
                                                </TableCell>
                                                <TableCell>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                            {row.childrenCount}
                                                        </Typography>
                                                        {hasChildren && (
                                                            <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                                                                {isExpanded ? 'expanded' : 'collapsed'}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </TableCell>
                                                <TableCell align="right">
                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                        <Tooltip title={depthLevel === 0 ? 'Add Subcategory' : `Add ${depthLevel === 1 ? 'Sub-subcategory' : 'Nested Category'}`}>
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => handleOpenAddSubcategory(row.category)}
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: 'primary.lighter',
                                                                    },
                                                                }}
                                                            >
                                                                <Iconify icon="mingcute:add-line" width={20} />
                                                            </IconButton>
                                                        </Tooltip>
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

