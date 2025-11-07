import { axios } from "@src/config/axios";
import { SERVER_END_POINTS } from "@src/constant";
import type {
  TLoginDetails,
  TForgotPasswordRequest,
  TResetPassword,
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
      return await axios.post(SERVER_END_POINTS.ADMIN_RESET_PASSWORD, payload);
    },
  });
};
