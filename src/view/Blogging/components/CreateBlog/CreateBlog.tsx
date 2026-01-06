import React, { useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  FormHelperText,
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
import { useCategoryListing, useCreateBlog } from "@src/services";
import { onError } from "@src/utils/error";
import type { TBlogStatus, TCategory } from "@src/utils/types";
import { extractAndProcessImages } from "@src/utils/blog-content";

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
  isFeatured: boolean;
  readingTime: string;
  publishedAt: string;
};

const statusOptions: TBlogStatus[] = ["draft", "published", "scheduled"];

// Helper to format status for display (capitalize first letter)
const formatStatusForDisplay = (status: TBlogStatus): string => {
  return status.charAt(0).toUpperCase() + status.slice(1);
};

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
  isFeatured: Yup.boolean(),
  readingTime: Yup.number()
    .nullable()
    .transform((_, originalValue) => {
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
      is: (status: TBlogStatus) => status === "scheduled",
      then: (schema) => schema.required("Publish date is required for scheduled posts"),
    }),
});

export const CreateBlogForm: React.FC<CreateBlogFormProps> = ({ onCancel, onSuccess, onPreview }) => {
  const [isSlugDirty, setIsSlugDirty] = useState(false);

  const { data: categoriesData, isLoading: isLoadingCategories } = useCategoryListing();
  const categoryOptions: TCategory[] = categoriesData?.categories ?? [];

  const { mutateAsync: createBlog, isPending } = useCreateBlog();

  const formik = useFormik<BlogFormValues>({
    initialValues: {
      title: "",
      subheading: "",
      slug: "",
      category: "",
      status: "draft",
      excerpt: "",
      content: "",
      tagsInput: "",
      isFeatured: false,
      readingTime: "",
      publishedAt: "",
    },
    validationSchema,
    enableReinitialize: false,
    onSubmit: async (values, { resetForm }) => {
      // Process tags: split by comma, trim, and filter empty strings to ensure array<string> format
      const tags: string[] = values.tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      const selectedCategory = categoryOptions.find((cat) => String(cat.id) === values.category);
      const categoryName = selectedCategory?.name ?? values.category.trim();
      const categoryIds = selectedCategory ? [Number(selectedCategory.id)] : [];

      // Extract and process images from content
      const { processedContent, images } = extractAndProcessImages(values.content);

      const payload = {
        title: values.title.trim(),
        subheading: values.subheading.trim() || undefined,
        slug: values.slug.trim(),
        category: categoryName,
        categoryIds,
        status: values.status,
        excerpt: values.excerpt.trim(),
        content: processedContent, // Use processed content with image placeholders
        tags, // Send as array<string>
        contentImages: images.size > 0 ? images : undefined, // Include images map if any images found
        isFeatured: values.isFeatured,
        readingTime: values.readingTime ? Number(values.readingTime) : null,
        publishedAt: values.publishedAt || null,
      };

      await createBlog(payload, {
        onSuccess: (response) => {
          toast.success(response?.message ?? "Blog post created successfully");
          resetForm();
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

  const handleCancel = () => {
    formik.resetForm();
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

    const selectedCategory = categoryOptions.find((cat) => String(cat.id) === formik.values.category);
    const categoryName = selectedCategory?.name ?? formik.values.category.trim();

    onPreview?.({
      title: formik.values.title.trim(),
      subheading: formik.values.subheading.trim() || undefined,
      slug: formik.values.slug.trim(),
      category: categoryName,
      status: formik.values.status,
      excerpt: formik.values.excerpt.trim(),
      content: formik.values.content,
      tags,
      coverImageUrl: null,
      galleryImageUrls: [],
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
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
              >
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
                  select
                  label="Category"
                  name="category"
                  value={formik.values.category}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.category && Boolean(formik.errors.category)}
                  helperText={
                    formik.touched.category && formik.errors.category
                      ? formik.errors.category
                      : isLoadingCategories
                        ? "Loading categories..."
                        : "Choose a category from your categories module."
                  }
                  fullWidth
                  required
                  disabled={isLoadingCategories || categoryOptions.length === 0}
                >
                  {categoryOptions.map((category) => (
                    <MenuItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={2}
              >
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
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
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
                      {formatStatusForDisplay(status)}
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
              </Stack>

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

              <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
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
              </Stack>

              <FormControlLabel
                control={
                  <Switch
                    checked={formik.values.isFeatured}
                    onChange={(_, checked) => formik.setFieldValue("isFeatured", checked)}
                    name="isFeatured"
                  />
                }
                label="Feature this post on the homepage"
              />
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

