import { useAppConfig } from "@/shared/hooks/useAppConfig";

export function useFeatureFlag(flagKey) {
  const { featureFlags } = useAppConfig();
  if (Object.prototype.hasOwnProperty.call(featureFlags, flagKey)) {
    return Boolean(featureFlags[flagKey]);
  }
  return true;
}
