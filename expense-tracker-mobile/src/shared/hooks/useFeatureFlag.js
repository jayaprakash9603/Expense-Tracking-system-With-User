import { useAppConfig } from "@/shared/hooks/useAppConfig";

export function useFeatureFlag(flagKey) {
  const { featureFlags } = useAppConfig();
  if (!Object.prototype.hasOwnProperty.call(featureFlags, flagKey)) {
    return false;
  }
  return Boolean(featureFlags[flagKey]);
}
