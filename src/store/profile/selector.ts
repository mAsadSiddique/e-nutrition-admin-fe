import { useSelector } from "react-redux";
import { AppState } from "../store";

export function useProfileSelector() {
  return useSelector<AppState, AppState["profile"]>((s) => s.profile);
}
