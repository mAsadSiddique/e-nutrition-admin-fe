import { axios } from "@src/config/axios";
import { QUERY_KEY, SERVER_END_POINTS } from "@src/constant";
import type {
  ApiResponse,
  TCategory,
  TCategoryListResponse,
  TCreateCategoryPayload,
  TUpdateCategoryPayload,
} from "@src/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

const normalizeCategoryResponse = (payload: unknown): TCategoryListResponse => {
  if (!payload) {
    return { count: 0, categories: [] };
  }

  if (Array.isArray(payload)) {
    return {
      count: payload.length,
      categories: payload as TCategory[],
    };
  }

  if (typeof payload === "object") {
    const typedPayload = payload as Record<string, unknown>;

    if (Array.isArray(typedPayload.categories)) {
      const categories = typedPayload.categories as TCategory[];
      const countValue = typedPayload.count;
      const count =
        typeof countValue === "number" ? countValue : categories.length;
      return {
        count,
        categories,
      };
    }

    return {
      count: 1,
      categories: [typedPayload as unknown as TCategory],
    };
  }

  return { count: 0, categories: [] };
};

export const useCategoryListing = () => {
  return useQuery<ApiResponse, Error, TCategoryListResponse>({
    queryKey: [QUERY_KEY.CATEGORY_LISTING],
    queryFn: async () => {
      return await axios.get(SERVER_END_POINTS.CATEGORIES_LISTING);
    },
    select: (response) => normalizeCategoryResponse(response?.data),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: TCreateCategoryPayload
    ): Promise<ApiResponse> => {
      return await axios.post(SERVER_END_POINTS.ADD_CATEGORY, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.CATEGORY_LISTING],
      });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: TUpdateCategoryPayload
    ): Promise<ApiResponse> => {
      return await axios.put(SERVER_END_POINTS.UPDATE_CATEGORY, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.CATEGORY_LISTING],
      });
    },
  });
};

export const useRemoveCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: { id: number }): Promise<ApiResponse> => {
      return await axios.delete(
        `${SERVER_END_POINTS.CATEGORY_REMOVE}?id=${id.id}`
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.CATEGORY_LISTING],
      });
    },
  });
};
