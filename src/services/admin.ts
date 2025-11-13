import { axios } from "@src/config/axios";
import { QUERY_KEY, SERVER_END_POINTS } from "@src/constant";
import storage from "@src/utils/storage";
import type { ApiResponse, TAddAdminDetails, TUser } from "@src/utils/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// admin dashboard...
export const useAdminListing = () => {
  return useQuery({
    queryKey: [QUERY_KEY.ADMIN_LISTING],
    queryFn: async () => {
      return await axios.get(SERVER_END_POINTS.ADMIN_LISTING);
    },
    select: (data) => {
      return data?.data as { count: number; admins: TUser[] };
    },
  });
};

// add admin...
export const useAddAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: TAddAdminDetails): Promise<ApiResponse> => {
      return await axios.post(SERVER_END_POINTS.ADD_ADMIN, payload);
    },
    onSuccess: () => {
      // Refresh the admin listing after adding a new admin
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ADMIN_LISTING],
      });
    },
  });
};

// block and unblock admin toggle...
export const useBlockUnblockAdminToggle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any): Promise<ApiResponse> => {
      return await axios.put(SERVER_END_POINTS.BLOCK_UNBLOCK_ADMIN, payload);
    },
    onSuccess: () => {
      // Refresh the admin listing after blocking/unblocking an admin
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ADMIN_LISTING],
      });
    },
  });
};

// update admin role...
export const useUpdateAdminRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      role: string;
      id: string;
    }): Promise<ApiResponse> => {
      return await axios.put(SERVER_END_POINTS.UPDATE_ADMIN_ROLE, payload);
    },
    onSuccess: () => {
      // Refresh the admin listing after updating admin role
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEY.ADMIN_LISTING],
      });
    },
  });
};

export const useGetAdminProfile = () => {
  const jwt = storage.getToken();
  return useQuery({
    queryKey: [QUERY_KEY.ADMIN_PROFILE],
    queryFn: async () => {
      return await axios.get(SERVER_END_POINTS.ADMIN_PROFILE);
    },
    select: (data) => {
      return data?.data as TAddAdminDetails;
    },
    enabled: !!jwt,
  });
};

// update admin profile...
export const useUpdateAdminProfile = () => {
  return useMutation({
    mutationFn: async (userUpdateDetails: any) => {
      return await axios.put(
        SERVER_END_POINTS.ADMIN_PROFILE,
        userUpdateDetails
      );
    },
  });
};
