import { axios } from "@src/config/axios";
import { QUERY_KEY, SERVER_END_POINTS } from "@src/constant";
import type {
  ApiResponse,
  TBlogListResponse,
  TCreateBlogPayload,
  TUpdateBlogPayload,
  TDeleteBlogPayload,
} from "@src/utils/types";
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
  formData.append("status", payload.status.toLowerCase());
  formData.append("excerpt", payload.excerpt);
  formData.append("content", payload.content);

  if (payload.subheading) {
    formData.append("subheading", payload.subheading);
  }

  if (payload.categoryIds?.length) {
    payload.categoryIds.forEach((rawId) => {
      const numericId = Number(rawId);
      if (!Number.isNaN(numericId)) {
        formData.append("categoryIds", String(numericId));
      }
    });
  }

  // if (payload.tags?.length) {
  //   // Backend expects `tags` as an array field; send a JSON array string
  //   formData.append("tags", JSON.stringify(payload.tags));
  // }

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

  // Append content images with their IDs (1, 2, 3, etc.)
  if (payload.contentImages && payload.contentImages.size > 0) {
    payload.contentImages.forEach((imageFile, imageId) => {
      // Append as "1", "2", "3", etc. with the binary data
      formData.append(String(imageId), imageFile);
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

      return await axios.post(SERVER_END_POINTS.BLOG_CREATE, requestPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.BLOG_LISTING],
      });
    },
  });
};

export const useUpdateBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: TUpdateBlogPayload): Promise<ApiResponse> => {
      const { id, ...rest } = payload;
      const requestPayload = createBlogFormData(rest);

      // assuming backend expects `id` in the form data for updates
      requestPayload.append("id", id);

      return await axios.put(SERVER_END_POINTS.BLOG_UPDATE, requestPayload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.BLOG_LISTING],
      });
    },
  });
};

export const useDeleteBlog = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id }: TDeleteBlogPayload): Promise<ApiResponse> => {
      // assuming backend expects `id` as a query param for delete
      return await axios.delete(SERVER_END_POINTS.BLOG_DELETE, {
        params: { id },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.BLOG_LISTING],
      });
    },
  });
};
