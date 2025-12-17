import React, { useState } from "react";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate, useLocation } from "react-router-dom";

import { DashboardContent } from "@src/layouts/dashboard/main";
import { EditBlogForm } from "../components/EditBlog";
import { BlogPreviewDialog } from "../components/CreateBlog";
import type { BlogPreviewData } from "../components/CreateBlog";
import type { TBlog } from "@src/utils/types";

export const BlogEditView = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [previewData, setPreviewData] = useState<BlogPreviewData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Get blog data from location state
  const blog = location.state?.blog as TBlog | undefined;

  if (!blog) {
    return (
      <DashboardContent>
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Blog not found
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 3 }}>
            Unable to load blog data. Please go back and try again.
          </Typography>
          <Button variant="contained" onClick={() => navigate("/dashboard/blogging")}>
            Back to Blog Posts
          </Button>
        </Box>
      </DashboardContent>
    );
  }

  const handleCancel = () => {
    navigate(-1);
  };

  const handleSuccess = () => {
    navigate("/dashboard/blogging");
  };

  const handlePreview = (data: BlogPreviewData) => {
    setPreviewData(data);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
  };

  return (
    <DashboardContent>
      <Stack spacing={1.5} sx={{ mb: 4 }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            variant="text"
            startIcon={<ArrowBackRoundedIcon />}
            onClick={() => navigate("/dashboard/blogging")}
            sx={{ alignSelf: "flex-start" }}
          >
            Back to Blog Posts
          </Button>
        </Stack>
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Edit Blog Post
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 680 }}>
            Update your blog post content, category, and publishing settings.
          </Typography>
        </Box>
      </Stack>

      <EditBlogForm blog={blog} onCancel={handleCancel} onSuccess={handleSuccess} onPreview={handlePreview} />

      <BlogPreviewDialog open={isPreviewOpen} data={previewData} onClose={handleClosePreview} />
    </DashboardContent>
  );
};

