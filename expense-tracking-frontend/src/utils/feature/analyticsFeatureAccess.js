import {
  FEATURE_KEYS,
  SUB_FEATURE_KEYS,
  isFeatureEnabledInState,
} from "../../config/featureCatalog";

const ENTITY_ANALYTICS_FEATURE = {
  category: SUB_FEATURE_KEYS.CATEGORIES_ANALYTICS,
  paymentMethod: SUB_FEATURE_KEYS.PAYMENT_METHODS_ANALYTICS,
  CATEGORY: SUB_FEATURE_KEYS.CATEGORIES_ANALYTICS,
  PAYMENT_METHOD: SUB_FEATURE_KEYS.PAYMENT_METHODS_ANALYTICS,
};

/**
 * Entity analytics may only run when dormancy flags are loaded and both the
 * analytics module and the entity-specific analytics sub-feature are enabled.
 * Until flags load, treat as blocked so dormant features never fire early.
 */
export const canFetchEntityAnalytics = (featureFlagsState, entityType) => {
  if (!featureFlagsState?.loaded) {
    return false;
  }

  if (!isFeatureEnabledInState(featureFlagsState, FEATURE_KEYS.ANALYTICS)) {
    return false;
  }

  const entityFeature = ENTITY_ANALYTICS_FEATURE[entityType];
  if (!entityFeature) {
    return isFeatureEnabledInState(featureFlagsState, FEATURE_KEYS.ANALYTICS);
  }

  return isFeatureEnabledInState(featureFlagsState, entityFeature);
};

export const isBrowserTabActive = () =>
  typeof document === "undefined" || document.visibilityState === "visible";
