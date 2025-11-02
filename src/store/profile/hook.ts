import { useDispatch } from "react-redux";
import { useCallback } from "react";
import type { TUser } from "@src/utils/types";
import { setUserProfile } from "./action";
import type { AppDispatch } from "../store";

export const useUserProfileHandler = () => {
  const dispatch = useDispatch<AppDispatch>();

  const onSetProfile = useCallback(
    (userProfile: TUser) => {
      dispatch(setUserProfile({ userProfile }));
    },
    [dispatch]
  );

  return { onSetProfile };
};
