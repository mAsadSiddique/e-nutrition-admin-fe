import { useMemo } from "react";

import dayjs from "dayjs";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import { useNavigate } from "react-router-dom";

import { Iconify } from "@src/components/iconify";
import { Scrollbar } from "@src/components/scrollbar";
import { DashboardContent } from "@src/layouts/dashboard/main";
import { useBlogListing, useDeleteBlog } from "@src/services";
import type { TBlog, TBlogStatus } from "@src/utils/types";

// ----------------------------------------------------------------------

// Helper to format status for display (capitalize first letter)
const formatStatusForDisplay = (status: TBlogStatus | string): string => {
  if (!status) return "—";
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
};

const getStatusColor = (status: TBlogStatus | string) => {
  const normalizedStatus = status?.toLowerCase();
  switch (normalizedStatus) {
    case "published":
      return "success";
    case "scheduled":
      return "info";
    case "draft":
      return "default";
    default:
      return "warning";
  }
};

const formatDate = (value?: string | null) => {
  if (!value) {
    return "—";
  }
  return dayjs(value).format("MMM DD, YYYY");
};

export const Blogging = () => {
  const navigate = useNavigate();

  const { data, isLoading, isError, refetch, isFetching } = useBlogListing({
    limit: 50,
    page: 1,
  });

  const { mutateAsync: deleteBlog, isPending: isDeleting } = useDeleteBlog();

  const blogs = useMemo(() => data?.blogs ?? [], [data]);
  const totalCount = data?.count ?? blogs.length;
  const isEmpty = !isLoading && !isError && blogs.length === 0;

  const handleEdit = (blog: TBlog) => {
    navigate("/dashboard/blogging/edit", { state: { blog } });
  };

  const handleDelete = (blog: TBlog) => {
    if (!blog.id) return;

    const confirmed = window.confirm("Are you sure you want to delete this blog post?");
    if (!confirmed) return;

    void deleteBlog(
      { id: blog.id },
      {
        onError: () => {
          // eslint-disable-next-line no-console
          console.error("Failed to delete blog", blog.id);
        },
      }
    );
  };

  const handleView = (blog: TBlog) => {
    console.log("View blog:", blog.id);
    // TODO: Implement view functionality
  };

  return (
    <DashboardContent>
      <Box
        sx={{
          mb: 4,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Blog Posts
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Create, manage, and publish engaging blog content for your audience
          </Typography>
          <Typography variant="caption" sx={{ color: "text.disabled", display: "block", mt: 1 }}>
            {isFetching || isDeleting
              ? "Refreshing data…"
              : `Showing ${blogs.length} of ${totalCount} posts`}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          sx={{ minWidth: 160 }}
          onClick={() => navigate("/dashboard/blogging/create")}
        >
          Create New Post
        </Button>
      </Box>

      <Card>
        <Scrollbar>
          <TableContainer sx={{ overflow: "unset" }}>
            <Table sx={{ minWidth: 1200 }}>
              <TableHead>
                <TableRow>
                  <TableCell width={80}>#</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell width={200}>Author</TableCell>
                  <TableCell width={160}>Category</TableCell>
                  <TableCell width={140}>Status</TableCell>
                  <TableCell width={110} align="center">
                    Views
                  </TableCell>
                  <TableCell width={120} align="center">
                    Comments
                  </TableCell>
                  <TableCell width={160}>Timeline</TableCell>
                  <TableCell align="right" width={160}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, index) => (
                      <TableRow key={index}>
                        <TableCell colSpan={9} sx={{ py: 4 }}>
                          <Box sx={{ display: "flex", justifyContent: "center" }}>
                            <CircularProgress size={32} />
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  : null}

                {isError ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Alert
                        severity="error"
                        action={
                          <Button size="small" onClick={() => refetch()}>
                            Retry
                          </Button>
                        }
                      >
                        Failed to load blog posts. Please try again.
                      </Alert>
                    </TableCell>
                  </TableRow>
                ) : null}

                {isEmpty ? (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Box
                        sx={{
                          py: 6,
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="subtitle1" gutterBottom>
                          No blog posts yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                          Start by creating your first blog post to engage your community.
                        </Typography>
                        <Button variant="outlined" onClick={() => navigate("/dashboard/blogging/create")}>
                          Create Post
                        </Button>
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : null}

                {!isLoading && !isError
                  ? blogs.map((blog, index) => {
                      const authorName = blog.author ?? "—";
                      const avatarLabel = authorName.charAt(0).toUpperCase();

                      return (
                        <TableRow key={blog.id} hover>
                          <TableCell>{blog.id ?? index + 1}</TableCell>
                          <TableCell>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, maxWidth: 360 }}>
                              {blog.title}
                            </Typography>
                            {blog.excerpt ? (
                              <Typography
                                variant="body2"
                                sx={{
                                  color: "text.secondary",
                                  maxWidth: 420,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {blog.excerpt}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                              <Avatar
                                src={blog.coverImageUrl ?? undefined}
                                sx={{
                                  width: 36,
                                  height: 36,
                                  bgcolor: "primary.main",
                                  textTransform: "uppercase",
                                }}
                              >
                                {avatarLabel || "?"}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                  {authorName}
                                </Typography>
                                {blog.readingTime ? (
                                  <Typography variant="caption" sx={{ color: "text.disabled" }}>
                                    {blog.readingTime} min read
                                  </Typography>
                                ) : null}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={blog.categories?.length ? `Category ${blog.categories[0]}` : "Uncategorized"}
                              size="small"
                              sx={{
                                bgcolor: "background.neutral",
                                color: "text.secondary",
                                fontWeight: 500,
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={formatStatusForDisplay(blog.status ?? "draft")}
                              size="small"
                              color={
                                getStatusColor(blog.status ?? "draft") as
                                  | "success"
                                  | "warning"
                                  | "default"
                                  | "primary"
                                  | "secondary"
                                  | "error"
                                  | "info"
                              }
                              sx={{ fontWeight: 600 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                              <Iconify icon="solar:eye-bold" width={16} sx={{ color: "text.secondary" }} />
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                {(blog.views ?? 0).toLocaleString()}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5 }}>
                              <Iconify icon="solar:chat-round-bold" width={16} sx={{ color: "text.secondary" }} />
                              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                {blog.comments ?? 0}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                              {formatDate(blog.createdAt)}
                            </Typography>
                            {blog.publishedAt ? (
                              <Typography variant="caption" sx={{ color: "text.disabled", display: "block" }}>
                                Published: {formatDate(blog.publishedAt)}
                              </Typography>
                            ) : null}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
                              <Tooltip title="View">
                                <IconButton size="small" color="default" onClick={() => handleView(blog)}>
                                  <Iconify icon="solar:eye-bold" width={20} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton size="small" color="default" onClick={() => handleEdit(blog)}>
                                  <Iconify icon="solar:pen-bold" width={20} />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton size="small" color="error" onClick={() => handleDelete(blog)}>
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

