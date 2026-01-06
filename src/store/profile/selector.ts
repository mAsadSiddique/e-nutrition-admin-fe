import { useSelector } from "react-redux";
import type { AppState } from "../store";

export function useProfileSelector() {
  return useSelector<AppState, AppState["profile"]>((s) => s.profile);
}
