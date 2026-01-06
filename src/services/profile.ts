import { axios } from "@src/config/axios";
import { SERVER_END_POINTS } from "@src/constant";
import type { ApiResponse } from "@src/utils/types";
import type {
  TLoginDetails,
  TForgotPasswordRequest,
  TResetPassword,
  TChangePassword,
} from "@src/utils/types/profile";
import { useMutation } from "@tanstack/react-query";

export const useLoginProfile = () => {
  return useMutation({
    mutationFn: async (loginDetail: TLoginDetails) => {
      return await axios.post(SERVER_END_POINTS.ADMIN_LOGIN, loginDetail);
    },
  });
};

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: async (payload: TForgotPasswordRequest) => {
      return await axios.post(SERVER_END_POINTS.ADMIN_FORGOT_PASSWORD, payload);
    },
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (payload: TResetPassword) => {
      return await axios.put(SERVER_END_POINTS.ADMIN_RESET_PASSWORD, payload);
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (payload: TChangePassword): Promise<ApiResponse> => {
      return await axios.put(SERVER_END_POINTS.CHANGE_PASSWORD, payload);
    },
  });
};
