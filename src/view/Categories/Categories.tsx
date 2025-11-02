import React, { useState } from 'react';

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

import { Iconify } from '@src/components/iconify';
import { Scrollbar } from '@src/components/scrollbar';
import { DashboardContent } from '@src/layouts/dashboard/main';

// ----------------------------------------------------------------------

// Mock data - Replace with actual API data
const CATEGORIES_DATA = [
    {
        id: 1,
        name: 'Fruits',
        description: 'Fresh and organic fruits',
        status: 'Active',
        createdAt: '2024-01-15',
        itemCount: 25,
    },
    {
        id: 2,
        name: 'Vegetables',
        description: 'Fresh seasonal vegetables',
        status: 'Active',
        createdAt: '2024-01-16',
        itemCount: 42,
    },
    {
        id: 3,
        name: 'Dairy Products',
        description: 'Milk, cheese, and dairy items',
        status: 'Active',
        createdAt: '2024-01-17',
        itemCount: 18,
    },
    {
        id: 4,
        name: 'Grains',
        description: 'Rice, wheat, and other grains',
        status: 'Inactive',
        createdAt: '2024-01-18',
        itemCount: 15,
    },
    {
        id: 5,
        name: 'Protein',
        description: 'Meat, fish, and plant-based proteins',
        status: 'Active',
        createdAt: '2024-01-19',
        itemCount: 30,
    },
];

// ----------------------------------------------------------------------

export const Categories = () => {
    const [categories] = useState(CATEGORIES_DATA);

    const handleEdit = (id: number) => {
        console.log('Edit category:', id);
        // TODO: Implement edit functionality
    };

    const handleDelete = (id: number) => {
        console.log('Delete category:', id);
        // TODO: Implement delete functionality
    };

    return (
        <DashboardContent>
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
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Iconify icon="mingcute:add-line" />}
                    sx={{ minWidth: 120 }}
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
                                    <TableCell>Description</TableCell>
                                    <TableCell width={120}>Status</TableCell>
                                    <TableCell width={120}>Items</TableCell>
                                    <TableCell width={140}>Created Date</TableCell>
                                    <TableCell align="right" width={120}>
                                        Actions
                                    </TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {categories.map((category) => (
                                    <TableRow key={category.id} hover>
                                        <TableCell>{category.id}</TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                                {category.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'text.secondary',
                                                    maxWidth: 300,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                {category.description}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box
                                                sx={(theme) => ({
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    px: 1.5,
                                                    py: 0.5,
                                                    borderRadius: 1,
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600,
                                                    bgcolor:
                                                        category.status === 'Active'
                                                            ? theme.vars.palette.success.lightChannel
                                                            : theme.vars.palette.error.lightChannel,
                                                    color:
                                                        category.status === 'Active'
                                                            ? theme.vars.palette.success.darkChannel
                                                            : theme.vars.palette.error.darkChannel,
                                                })}
                                            >
                                                {category.status}
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {category.itemCount}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                                {category.createdAt}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                                                <Tooltip title="Edit">
                                                    <IconButton
                                                        size="small"
                                                        color="default"
                                                        onClick={() => handleEdit(category.id)}
                                                    >
                                                        <Iconify icon="solar:pen-bold" width={20} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => handleDelete(category.id)}
                                                    >
                                                        <Iconify icon="solar:trash-bin-trash-bold" width={20} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Scrollbar>
            </Card>
        </DashboardContent>
    );
};

