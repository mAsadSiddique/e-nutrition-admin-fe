import Axios, { type AxiosInstance, type AxiosRequestConfig } from "axios";

import storage from "@src/utils/storage";
// import storage from "@src/utils/storage";

const BASE_URL = "https://suborbital-quadricipital-harley.ngrok-free.dev/";

export const axios: AxiosInstance = Axios.create({
  baseURL: BASE_URL,
  headers: {
    Accept: "application/content",
    "ngrok-skip-browser-warning": "true",
  },
});

const authRequestInterceptor: any = (config: AxiosRequestConfig) => {
  const token = storage.getToken();
  const newConfig = { ...config };
  if (!newConfig.headers) {
    newConfig.headers = {};
  }
  if (token) {
    newConfig.headers.Authorization = `${token}`;
  }
  newConfig.headers.accept = "application/json";
  return newConfig;
};

axios.interceptors.request.use(authRequestInterceptor);

axios.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const status = error.response?.status || 200;

    if (status === 401) {
      // createQueryClient().clear();
      // window.location.reload();
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
