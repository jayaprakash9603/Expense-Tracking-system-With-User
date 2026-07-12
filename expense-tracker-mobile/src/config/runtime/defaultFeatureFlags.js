import { getLiveFeatureFlagsSnapshot } from "@/config/runtime/loadFeatureMatrix";

export const DEFAULT_FEATURE_FLAGS = getLiveFeatureFlagsSnapshot();
