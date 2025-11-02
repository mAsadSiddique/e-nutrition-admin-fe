import { createAction } from "@reduxjs/toolkit";
import type { TUser } from "@src/utils/types";

export const setUserProfile = createAction<{ userProfile: TUser }>(
  "profile/setUserProfile"
);
