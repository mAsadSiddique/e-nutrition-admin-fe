import { createReducer } from "@reduxjs/toolkit";
import { TProfileState } from "./type";
import { setUserProfile } from "./action";
import type { TUser } from "@src/utils/types";

const initialState: TProfileState = { userProfile: {} as TUser };

export const profile = createReducer(initialState, (builder) => {
  builder.addCase(setUserProfile, (state, { payload: { userProfile } }) => {
    return {
      ...state,
      userProfile,
    };
  });
});
