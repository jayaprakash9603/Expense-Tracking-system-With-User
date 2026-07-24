import { useSelector } from "react-redux";
import { isFeatureEnabledInState } from "../config/featureCatalog";

export const useFeature = (featureKey) => {
  const featureFlags = useSelector((state) => state.featureFlags);
  return isFeatureEnabledInState(featureFlags, featureKey);
};

export default useFeature;
