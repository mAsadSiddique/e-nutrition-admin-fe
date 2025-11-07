import { AxiosError } from "axios";
import { toast } from "react-toastify";

// Axios error message extractor
export const errorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const err = error.response?.data?.message;
    if (typeof err === "string") return err;
    if (Array.isArray(err)) return err[0];
  }
  return error instanceof Error ? error.message : "Something went wrong";
};

// Axios toast wrapper
export const onError = (error: unknown) => {
  toast.error(errorMessage(error));
};
