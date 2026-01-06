import { createReducer } from "@reduxjs/toolkit";
import { setUserProfile } from "./action";
import type { TUser } from "@src/utils/types";
import type { TProfileState } from "./type";

const initialState: TProfileState = { userProfile: {} as TUser };

export const profile = createReducer(initialState, (builder) => {
  builder.addCase(setUserProfile, (state, { payload: { userProfile } }) => {
    return {
      ...state,
      userProfile,
    };
  });
});
