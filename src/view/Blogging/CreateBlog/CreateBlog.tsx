import React, { useState } from "react";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

import { DashboardContent } from "@src/layouts/dashboard/main";

import { CreateBlogForm, BlogPreviewDialog } from "../components";
import type { BlogPreviewData } from "../components";

export const BlogCreateView = () => {
  const navigate = useNavigate();
  const [previewData, setPreviewData] = useState<BlogPreviewData | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  console.log('previewData: ', previewData?.content)
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
            Create Blog Post
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 680 }}>
            Craft a new story for your audience. Add detailed content, choose a category, and optionally schedule or feature it.
          </Typography>
        </Box>
      </Stack>

      <CreateBlogForm onCancel={handleCancel} onSuccess={handleSuccess} onPreview={handlePreview} />

      <BlogPreviewDialog open={isPreviewOpen} data={previewData} onClose={handleClosePreview} />
    </DashboardContent>
  );
};

