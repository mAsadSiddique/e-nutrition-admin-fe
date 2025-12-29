import React, { useMemo } from "react";

import dayjs from "dayjs";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import {
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Stack,
  Typography,
  Button,
} from "@mui/material";

import type { BlogPreviewData } from "./CreateBlog";
import { replaceImagePlaceholdersWithUrls } from "@src/utils/blog-content";
import type { TBlogMedia } from "@src/utils/types";

type BlogPreviewDialogProps = {
  open: boolean;
  data: BlogPreviewData | null;
  onClose: () => void;
  media?: TBlogMedia;
};

const getStatusColor = (status: BlogPreviewData["status"]) => {
  switch (status) {
    case "Published":
      return "success";
    case "Scheduled":
      return "info";
    case "Draft":
    default:
      return "default";
  }
};

export const BlogPreviewDialog: React.FC<BlogPreviewDialogProps> = ({ open, data, onClose, media }) => {
  if (!data) {
    return null;
  }

  const formattedPublishedAt = data.publishedAt ? dayjs(data.publishedAt).format("MMM DD, YYYY") : null;

  // Process content to replace image placeholders with URLs from media
  const processedContent = useMemo(() => {
    if (!data.content) return "";
    return replaceImagePlaceholdersWithUrls(data.content, media);
  }, [data.content, media]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" aria-labelledby="blog-preview-dialog-title">
      <DialogTitle
        id="blog-preview-dialog-title"
        sx={{ pr: 6, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
      >
        <Box>
          <Typography variant="h5" component="span" sx={{ mr: 2 }}>
            Preview
          </Typography>
          <Chip
            label={data.status}
            color={getStatusColor(data.status) as "success" | "info" | "default"}
            size="small"
            sx={{ fontWeight: 600 }}
          />
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ bgcolor: "background.default" }}>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography variant="h3">{data.title}</Typography>
            {data.subheading ? (
              <Typography variant="h5" color="text.secondary">
                {data.subheading}
              </Typography>
            ) : null}
            <Typography variant="subtitle1" color="text.secondary">
              {data.excerpt}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Chip label={data.category || "Uncategorized"} size="small" />
              {data.isFeatured ? (
                <Chip label="Featured" size="small" color="secondary" variant="outlined" sx={{ fontWeight: 600 }} />
              ) : null}
              {data.readingTime ? (
                <Typography variant="caption" color="text.disabled">
                  {data.readingTime} min read
                </Typography>
              ) : null}
              {formattedPublishedAt ? (
                <Typography variant="caption" color="text.disabled">
                  Scheduled: {formattedPublishedAt}
                </Typography>
              ) : null}
            </Stack>
          </Stack>

          {data.coverImageUrl ? (
            <Box
              component="img"
              src={data.coverImageUrl}
              alt={data.title}
              sx={{
                width: "100%",
                maxHeight: 360,
                borderRadius: 2,
                objectFit: "cover",
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            />
          ) : null}

          {data.galleryImageUrls.length > 0 ? (
            <Stack spacing={1}>
              <Typography variant="subtitle2">Gallery</Typography>
              <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                {data.galleryImageUrls.map((url, index) => (
                  <Box
                    key={`${url}-${index}`}
                    sx={{
                      width: 140,
                      height: 100,
                      borderRadius: 2,
                      overflow: "hidden",
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box
                      component="img"
                      src={url}
                      alt={`Gallery image ${index + 1}`}
                      sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  </Box>
                ))}
              </Stack>
            </Stack>
          ) : null}

          {data.tags.length > 0 ? (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {data.tags.map((tag) => (
                <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
              ))}
            </Stack>
          ) : null}

          <Divider />

          <Box
            sx={{
              color: "text.primary",
              lineHeight: 1.8,
              "& h1": { fontSize: "2rem", marginTop: 3, marginBottom: 1 },
              "& h2": { fontSize: "1.6rem", marginTop: 3, marginBottom: 1 },
              "& h3": { fontSize: "1.3rem", marginTop: 2.5, marginBottom: 1 },
              "& ul, & ol": { paddingLeft: 3, marginY: 2 },
              "& blockquote": {
                marginY: 2,
                paddingLeft: 2,
                borderLeft: (theme) => `4px solid ${theme.palette.primary.main}`,
                color: "text.secondary",
                fontStyle: "italic",
              },
              "& pre": {
                backgroundColor: (theme) => theme.palette.background.neutral,
                padding: 2,
                borderRadius: 1,
                overflowX: "auto",
              },
              "& iframe": {
                width: "100%",
                minHeight: 320,
                border: 0,
                borderRadius: 8,
              },
              "& img": {
                maxWidth: "100%",
                borderRadius: 8,
              },
            }}
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained">
          Close Preview
        </Button>
      </DialogActions>
    </Dialog>
  );
};

