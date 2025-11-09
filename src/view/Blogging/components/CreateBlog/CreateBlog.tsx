import React, { useEffect, useMemo, useState } from "react";

import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormHelperText,
  IconButton,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import { RichTextEditor } from "@src/components/editor";
import { useCreateBlog } from "@src/services";
import { onError } from "@src/utils/error";
import type { TBlogStatus } from "@src/utils/types";

export type BlogPreviewData = {
  title: string;
  subheading?: string;
  slug: string;
  category: string;
  status: TBlogStatus;
  excerpt: string;
  content: string;
  tags: string[];
  coverImageUrl: string | null;
  galleryImageUrls: string[];
  isFeatured: boolean;
  readingTime: number | null;
  publishedAt: string | null;
};

type CreateBlogFormProps = {
  onCancel?: () => void;
  onSuccess?: () => void;
  onPreview?: (payload: BlogPreviewData) => void;
};

type BlogFormValues = {
  title: string;
  subheading: string;
  slug: string;
  category: string;
  status: TBlogStatus;
  excerpt: string;
  content: string;
  tagsInput: string;
  coverImage: File | null;
  galleryImages: File[];
  isFeatured: boolean;
  readingTime: string;
  publishedAt: string;
};

const SUPPORTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const statusOptions: TBlogStatus[] = ["Draft", "Published", "Scheduled"];

const generateSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

const validationSchema = Yup.object<BlogFormValues>({
  title: Yup.string().trim().required("Title is required").max(120, "Title should not exceed 120 characters"),
  subheading: Yup.string().trim().max(180, "Subheading should not exceed 180 characters"),
  slug: Yup.string()
    .trim()
    .required("Slug is required")
    .matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only"),
  category: Yup.string().trim().required("Category is required").max(60, "Category should not exceed 60 characters"),
  status: Yup.mixed<TBlogStatus>().oneOf(statusOptions).required("Status is required"),
  excerpt: Yup.string().trim().required("Excerpt is required").max(260, "Keep the excerpt within 260 characters"),
  content: Yup.string()
    .test("content-not-empty", "Content is required", (value) => {
      if (!value) return false;
      const stripped = value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, "").trim();
      return stripped.length > 0;
    })
    .required("Content is required"),
  tagsInput: Yup.string()
    .trim()
    .test("tag-count", "Maximum of 10 tags allowed", (value) => {
      if (!value) return true;
      const tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      return tags.length <= 10;
    })
    .test("tag-length", "Each tag should be 24 characters or less", (value) => {
      if (!value) return true;
      const tags = value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);
      return tags.every((tag) => tag.length <= 24);
    }),
  coverImage: Yup.mixed<File>()
    .nullable()
    .test("fileSize", "Image should be less than 4MB", (file) => {
      if (!file) return true;
      return file.size <= 4 * 1024 * 1024;
    })
    .test("fileFormat", "Unsupported file format", (file) => {
      if (!file) return true;
      return SUPPORTED_IMAGE_TYPES.includes(file.type);
    }),
  galleryImages: Yup.array<File>()
    .test("galleryFileSize", "Each gallery image should be less than 4MB", (files) => {
      if (!files) return true;
      return files.every((file) => !file || file.size <= 4 * 1024 * 1024);
    })
    .test("galleryFileFormat", "Unsupported file format in gallery", (files) => {
      if (!files) return true;
      return files.every((file) => !file || SUPPORTED_IMAGE_TYPES.includes(file.type));
    })
    .max(10, "You can upload up to 10 gallery images"),
  isFeatured: Yup.boolean(),
  readingTime: Yup.number()
    .nullable()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue === null || Number.isNaN(Number(originalValue))) {
        return null;
      }
      return Number(originalValue);
    })
    .min(0, "Reading time cannot be negative")
    .max(240, "Reading time looks too high")
    .typeError("Use numbers only"),
  publishedAt: Yup.string()
    .nullable()
    .when("status", {
      is: (status: TBlogStatus) => status === "Scheduled",
      then: (schema) => schema.required("Publish date is required for scheduled posts"),
    }),
});

export const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ onCancel, onSuccess, onPreview }) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [galleryPreviewUrls, setGalleryPreviewUrls] = useState<string[]>([]);
  const [isSlugDirty, setIsSlugDirty] = useState(false);

  const { mutateAsync: createBlog, isPending } = useCreateBlog();

  const formik = useFormik<BlogFormValues>({
    initialValues: {
      title: "",
      subheading: "",
      slug: "",
      category: "",
      status: "Draft",
      excerpt: "",
      content: "",
      tagsInput: "",
      coverImage: null,
      galleryImages: [],
      isFeatured: false,
      readingTime: "",
      publishedAt: "",
    },
    validationSchema,
    enableReinitialize: false,
    onSubmit: async (values, { resetForm }) => {
      const tags = values.tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const payload = {
        title: values.title.trim(),
      subheading: values.subheading.trim() || undefined,
        slug: values.slug.trim(),
        category: values.category.trim(),
        status: values.status,
        excerpt: values.excerpt.trim(),
      content: values.content,
        tags,
        coverImage: values.coverImage,
      galleryImages: values.galleryImages,
        isFeatured: values.isFeatured,
        readingTime: values.readingTime ? Number(values.readingTime) : null,
        publishedAt: values.publishedAt || null,
      };

      await createBlog(payload, {
        onSuccess: (response) => {
          toast.success(response?.message ?? "Blog post created successfully");
          resetForm();
          setPreviewUrl(null);
          galleryPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
          setGalleryPreviewUrls([]);
          setIsSlugDirty(false);
          onSuccess?.();
        },
        onError,
      });
    },
  });

  const tagsPreview = useMemo(() => {
    return formik.values.tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }, [formik.values.tagsInput]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  useEffect(() => {
    return () => {
      galleryPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [galleryPreviewUrls]);

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(event);

    if (!isSlugDirty) {
      const autoSlug = generateSlug(event.target.value);
      formik.setFieldValue("slug", autoSlug);
    }
  };

  const handleSlugChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    formik.handleChange(event);
    setIsSlugDirty(value.trim().length > 0);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0] ?? null;
    formik.setFieldValue("coverImage", file);
    formik.setFieldTouched("coverImage", true, false);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleGalleryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.currentTarget.files ?? []);
    if (!files.length) {
      return;
    }

    const updatedFiles = [...formik.values.galleryImages, ...files];
    formik.setFieldValue("galleryImages", updatedFiles);
    formik.setFieldTouched("galleryImages", true, false);

    const newUrls = files.map((file) => URL.createObjectURL(file));
    setGalleryPreviewUrls((prev) => [...prev, ...newUrls]);

    // reset input to allow re-uploading the same files
    event.currentTarget.value = "";
  };

  const handleRemoveImage = () => {
    formik.setFieldValue("coverImage", null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleRemoveGalleryImage = (index: number) => {
    const nextFiles = [...formik.values.galleryImages];
    nextFiles.splice(index, 1);
    formik.setFieldValue("galleryImages", nextFiles);

    setGalleryPreviewUrls((prev) => {
      const next = [...prev];
      const [removedUrl] = next.splice(index, 1);
      if (removedUrl) {
        URL.revokeObjectURL(removedUrl);
      }
      return next;
    });
  };

  const handleCancel = () => {
    formik.resetForm();
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    galleryPreviewUrls.forEach((url) => URL.revokeObjectURL(url));
    setGalleryPreviewUrls([]);
    setIsSlugDirty(false);
    onCancel?.();
  };

  const handlePreview = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched(
        Object.keys(formik.values).reduce<Record<string, boolean>>((acc, key) => {
          acc[key] = true;
          return acc;
        }, {}),
        false
      );
      toast.info("Please resolve the highlighted fields before previewing.");
      return;
    }

    const tags = formik.values.tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onPreview?.({
      title: formik.values.title.trim(),
      subheading: formik.values.subheading.trim() || undefined,
      slug: formik.values.slug.trim(),
      category: formik.values.category.trim(),
      status: formik.values.status,
      excerpt: formik.values.excerpt.trim(),
      content: formik.values.content,
      tags,
      coverImageUrl: previewUrl,
      galleryImageUrls: [...galleryPreviewUrls],
      isFeatured: formik.values.isFeatured,
      readingTime: formik.values.readingTime ? Number(formik.values.readingTime) : null,
      publishedAt: formik.values.publishedAt || null,
    });
  };

  return (
    <Card sx={{ p: { xs: 2.5, md: 4 } }}>
      <Box component="form" onSubmit={formik.handleSubmit} noValidate>
        <Stack spacing={5}>
          <Stack spacing={2}>
            <Typography variant="h6">Primary Details</Typography>
            <Stack spacing={3}>
              <TextField
                label="Title"
                name="title"
                value={formik.values.title}
                onChange={handleTitleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.title && Boolean(formik.errors.title)}
                helperText={formik.touched.title && formik.errors.title}
                fullWidth
                required
              />

              <TextField
                label="Subheading"
                name="subheading"
                value={formik.values.subheading}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.subheading && Boolean(formik.errors.subheading)}
                helperText={
                  formik.touched.subheading && formik.errors.subheading
                    ? formik.errors.subheading
                    : "Optional: provide an engaging secondary heading."
                }
                fullWidth
              />

              <TextField
                label="Slug"
                name="slug"
                value={formik.values.slug}
                onChange={handleSlugChange}
                onBlur={formik.handleBlur}
                error={formik.touched.slug && Boolean(formik.errors.slug)}
                helperText={
                  formik.touched.slug && formik.errors.slug
                    ? formik.errors.slug
                    : "Used in URLs, e.g., /blog/" + (formik.values.slug || "your-slug")
                }
                fullWidth
                required
              />
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="h6">Summary & Content</Typography>
            <TextField
              label="Excerpt"
              name="excerpt"
              value={formik.values.excerpt}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.excerpt && Boolean(formik.errors.excerpt)}
              helperText={
                formik.touched.excerpt && formik.errors.excerpt ? formik.errors.excerpt : "Short summary for cards and SEO."
              }
              fullWidth
              multiline
              minRows={3}
              required
            />

            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Body Content
              </Typography>
              <RichTextEditor
                value={formik.values.content}
                onChange={(value) => formik.setFieldValue("content", value)}
                onBlur={() => formik.setFieldTouched("content", true)}
                placeholder="Share your insights, add headings, lists, or quotes..."
              />
              {formik.touched.content && formik.errors.content ? (
                <FormHelperText error>{formik.errors.content}</FormHelperText>
              ) : (
                <FormHelperText>
                  Use the toolbar to add headings, lists, quotes, code blocks, and inline styling.
                </FormHelperText>
              )}
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="h6">Categorization & Publishing</Typography>
            <Stack spacing={3}>
              <TextField
                label="Category"
                name="category"
                value={formik.values.category}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.category && Boolean(formik.errors.category)}
                helperText={formik.touched.category && formik.errors.category}
                fullWidth
                required
              />

              <TextField
                select
                label="Status"
                name="status"
                value={formik.values.status}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.status && Boolean(formik.errors.status)}
                helperText={formik.touched.status && formik.errors.status}
                fullWidth
                required
              >
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Tags"
                name="tagsInput"
                value={formik.values.tagsInput}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.tagsInput && Boolean(formik.errors.tagsInput)}
                helperText={
                  formik.touched.tagsInput && formik.errors.tagsInput
                    ? formik.errors.tagsInput
                    : "Separate tags with commas (e.g., nutrition, wellness)."
                }
                fullWidth
              />

              {tagsPreview.length > 0 && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Tags preview
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {tagsPreview.map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                </Box>
              )}

              <TextField
                label="Estimated Reading Time (minutes)"
                name="readingTime"
                value={formik.values.readingTime}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.readingTime && Boolean(formik.errors.readingTime)}
                helperText={
                  formik.touched.readingTime && formik.errors.readingTime
                    ? formik.errors.readingTime
                    : "Optional: helps readers gauge the length."
                }
                type="number"
                inputProps={{ min: 0, max: 240 }}
                fullWidth
              />

              <TextField
                label="Publish Date"
                name="publishedAt"
                type="date"
                value={formik.values.publishedAt}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.publishedAt && Boolean(formik.errors.publishedAt)}
                helperText={
                  formik.touched.publishedAt && formik.errors.publishedAt
                    ? formik.errors.publishedAt
                    : "For scheduling or documenting published posts."
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isFeatured}
                    onChange={(event, checked) => formik.setFieldValue("isFeatured", checked)}
                    name="isFeatured"
                  />
                }
                label="Feature this post on the homepage"
              />
            </Stack>
          </Stack>

          <Divider />

          <Stack spacing={2}>
            <Typography variant="h6">Media</Typography>

            <Stack spacing={1.5}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                sx={{ justifyContent: "flex-start", alignSelf: { xs: "stretch", sm: "flex-start" } }}
              >
                {formik.values.coverImage ? "Replace Cover Image" : "Upload Cover Image"}
                <input
                  hidden
                  type="file"
                  accept={SUPPORTED_IMAGE_TYPES.join(",")}
                  name="coverImage"
                  onChange={handleFileChange}
                />
              </Button>
              {formik.touched.coverImage && formik.errors.coverImage && (
                <FormHelperText error>{formik.errors.coverImage}</FormHelperText>
              )}
              {previewUrl ? (
                <Box
                  sx={{
                    position: "relative",
                    width: "100%",
                    maxWidth: 420,
                    height: 220,
                    borderRadius: 2,
                    overflow: "hidden",
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Box
                    component="img"
                    src={previewUrl}
                    alt="Cover preview"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={handleRemoveImage}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      bgcolor: "rgba(0,0,0,0.55)",
                      color: "common.white",
                      "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                    }}
                  >
                    <DeleteOutlinedIcon fontSize="small" />
                  </IconButton>
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Add a featured image that represents the article.
                </Typography>
              )}
            </Stack>

            <Stack spacing={1.5}>
              <Button
                component="label"
                variant="outlined"
                startIcon={<PhotoCameraIcon />}
                sx={{ justifyContent: "flex-start", alignSelf: { xs: "stretch", sm: "flex-start" } }}
              >
                Add Gallery Images
                <input
                  hidden
                  type="file"
                  accept={SUPPORTED_IMAGE_TYPES.join(",")}
                  multiple
                  name="galleryImages"
                  onChange={handleGalleryChange}
                />
              </Button>
              {formik.touched.galleryImages && typeof formik.errors.galleryImages === "string" && (
                <FormHelperText error>{formik.errors.galleryImages}</FormHelperText>
              )}
              {galleryPreviewUrls.length > 0 ? (
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  {galleryPreviewUrls.map((url, index) => (
                    <Box
                      key={`${url}-${index}`}
                      sx={{
                        position: "relative",
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
                      <IconButton
                        size="small"
                        onClick={() => handleRemoveGalleryImage(index)}
                        sx={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          bgcolor: "rgba(0,0,0,0.55)",
                          color: "common.white",
                          "&:hover": { bgcolor: "rgba(0,0,0,0.75)" },
                        }}
                      >
                        <DeleteOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Optionally upload supporting images to showcase recipes, steps, or infographics.
                </Typography>
              )}
            </Stack>
          </Stack>
        </Stack>

        <Divider sx={{ my: { xs: 3, md: 4 } }} />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="flex-end">
          <Button onClick={handleCancel} color="secondary" variant="outlined">
            Cancel
          </Button>
          <Button onClick={handlePreview} variant="outlined" color="primary" disabled={isPending}>
            Preview
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isPending}
            startIcon={isPending ? <CircularProgress size={18} color="inherit" /> : null}
            sx={{ minWidth: 160 }}
          >
            {isPending ? "Creating..." : "Create Post"}
          </Button>
        </Stack>
      </Box>
    </Card>
  );
};

