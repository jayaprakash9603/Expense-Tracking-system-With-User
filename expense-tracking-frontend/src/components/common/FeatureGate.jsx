import React from "react";
import useFeature from "../../hooks/useFeature";

const FeatureGate = ({ feature, children, fallback = null }) => {
  const enabled = useFeature(feature);

  if (!enabled) {
    return fallback;
  }

  return children;
};

export default FeatureGate;
