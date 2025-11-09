import { axios } from "@src/config/axios";
import { QUERY_KEY, SERVER_END_POINTS } from "@src/constant";
import type { ApiResponse, TBlogListResponse, TCreateBlogPayload } from "@src/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type BlogListParams = {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
};

const createBlogFormData = (payload: TCreateBlogPayload) => {
  const formData = new FormData();

  formData.append("title", payload.title);
  formData.append("slug", payload.slug);
  formData.append("category", payload.category);
  formData.append("status", payload.status);
  formData.append("excerpt", payload.excerpt);
  formData.append("content", payload.content);

  if (payload.subheading) {
    formData.append("subheading", payload.subheading);
  }

  if (payload.tags?.length) {
    payload.tags.forEach((tag) => {
      formData.append("tags[]", tag);
    });
  }

  if (payload.coverImage) {
    formData.append("coverImage", payload.coverImage);
  }

  if (typeof payload.isFeatured === "boolean") {
    formData.append("isFeatured", String(payload.isFeatured));
  }

  if (payload.readingTime !== undefined && payload.readingTime !== null) {
    formData.append("readingTime", String(payload.readingTime));
  }

  if (payload.publishedAt) {
    formData.append("publishedAt", payload.publishedAt);
  }

  if (payload.galleryImages?.length) {
    payload.galleryImages.forEach((image) => {
      formData.append("galleryImages[]", image);
    });
  }

  return formData;
};

export const useBlogListing = (params?: BlogListParams) => {
  return useQuery({
    queryKey: [QUERY_KEY.BLOG_LISTING, params],
    queryFn: async () => {
      return await axios.get(SERVER_END_POINTS.BLOG_LISTING, {
        params,
      });
    },
    select: (data) => {
      return data?.data as TBlogListResponse;
    },
  });
};

export const useCreateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TCreateBlogPayload): Promise<ApiResponse> => {
      const requestPayload = createBlogFormData(payload);

      return await axios.post(SERVER_END_POINTS.BLOG_LISTING, requestPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.BLOG_LISTING],
      });
    },
  });
};

