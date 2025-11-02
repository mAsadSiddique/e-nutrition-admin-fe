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
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';

import { Iconify } from '@src/components/iconify';
import { Scrollbar } from '@src/components/scrollbar';
import { DashboardContent } from '@src/layouts/dashboard/main';

// ----------------------------------------------------------------------

// Mock data - Replace with actual API data
const BLOGS_DATA = [
  {
    id: 1,
    title: '10 Essential Nutrients for a Healthy Lifestyle',
    author: 'Dr. Sarah Johnson',
    authorAvatar: '',
    category: 'Nutrition',
    status: 'Published',
    views: 1250,
    comments: 24,
    createdAt: '2024-01-15',
    publishedAt: '2024-01-16',
  },
  {
    id: 2,
    title: 'The Ultimate Guide to Meal Planning',
    author: 'Chef Michael Chen',
    authorAvatar: '',
    category: 'Meal Planning',
    status: 'Published',
    views: 892,
    comments: 15,
    createdAt: '2024-01-14',
    publishedAt: '2024-01-15',
  },
  {
    id: 3,
    title: 'Understanding Macronutrients: A Deep Dive',
    author: 'Dr. Sarah Johnson',
    authorAvatar: '',
    category: 'Education',
    status: 'Draft',
    views: 0,
    comments: 0,
    createdAt: '2024-01-18',
    publishedAt: null,
  },
  {
    id: 4,
    title: 'Plant-Based Protein Sources Explained',
    author: 'Nutritionist Emma Davis',
    authorAvatar: '',
    category: 'Vegetarian',
    status: 'Published',
    views: 654,
    comments: 8,
    createdAt: '2024-01-12',
    publishedAt: '2024-01-13',
  },
  {
    id: 5,
    title: 'The Science Behind Intermittent Fasting',
    author: 'Dr. Robert Martinez',
    authorAvatar: '',
    category: 'Health',
    status: 'Pending Review',
    views: 0,
    comments: 0,
    createdAt: '2024-01-17',
    publishedAt: null,
  },
  {
    id: 6,
    title: 'Healthy Snacks for Busy Professionals',
    author: 'Chef Michael Chen',
    authorAvatar: '',
    category: 'Lifestyle',
    status: 'Published',
    views: 1345,
    comments: 31,
    createdAt: '2024-01-10',
    publishedAt: '2024-01-11',
  },
];

// ----------------------------------------------------------------------

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Published':
      return 'success';
    case 'Draft':
      return 'default';
    case 'Pending Review':
      return 'warning';
    default:
      return 'default';
  }
};

export const Blogging = () => {
  const [blogs] = useState(BLOGS_DATA);

  const handleEdit = (id: number) => {
    console.log('Edit blog:', id);
    // TODO: Implement edit functionality
  };

  const handleDelete = (id: number) => {
    console.log('Delete blog:', id);
    // TODO: Implement delete functionality
  };

  const handleView = (id: number) => {
    console.log('View blog:', id);
    // TODO: Implement view functionality
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
            Blog Posts
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Create, manage, and publish engaging blog content for your audience
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          sx={{ minWidth: 140 }}
        >
          Create New Post
        </Button>
      </Box>

      {/* Table Section */}
      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell width={60}>ID</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell width={180}>Author</TableCell>
                  <TableCell width={140}>Category</TableCell>
                  <TableCell width={140}>Status</TableCell>
                  <TableCell width={100} align="center">
                    Views
                  </TableCell>
                  <TableCell width={100} align="center">
                    Comments
                  </TableCell>
                  <TableCell width={140}>Created</TableCell>
                  <TableCell align="right" width={140}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {blogs.map((blog) => (
                  <TableRow key={blog.id} hover>
                    <TableCell>{blog.id}</TableCell>
                    <TableCell>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, maxWidth: 350 }}>
                        {blog.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            bgcolor: 'primary.main',
                          }}
                        >
                          {blog.author.charAt(0)}
                        </Avatar>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {blog.author}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={blog.category}
                        size="small"
                        sx={{
                          bgcolor: 'background.neutral',
                          color: 'text.secondary',
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={blog.status}
                        size="small"
                        color={
                          getStatusColor(blog.status) as
                            | 'success'
                            | 'warning'
                            | 'default'
                            | 'primary'
                            | 'secondary'
                            | 'error'
                            | 'info'
                        }
                        sx={{
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Iconify icon="solar:eye-bold" width={16} sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {blog.views.toLocaleString()}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <Iconify icon="solar:chat-round-bold" width={16} sx={{ color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {blog.comments}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {blog.createdAt}
                      </Typography>
                      {blog.publishedAt && (
                        <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block' }}>
                          Published: {blog.publishedAt}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => handleView(blog.id)}
                          >
                            <Iconify icon="solar:eye-bold" width={20} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            color="default"
                            onClick={() => handleEdit(blog.id)}
                          >
                            <Iconify icon="solar:pen-bold" width={20} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(blog.id)}
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

