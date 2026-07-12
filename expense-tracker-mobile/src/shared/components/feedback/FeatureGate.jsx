import React from "react";
import { isFeatureEnabled } from "@/config/runtime/parseAppConfig";

export function FeatureGate({ flagKey, children }) {
  if (flagKey == null || flagKey === "") {
    return children;
  }
  return isFeatureEnabled(flagKey) ? children : null;
}
