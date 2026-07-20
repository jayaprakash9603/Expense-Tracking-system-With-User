const VALID_RANGES = new Set(["week", "month", "year"]);

const normalizeRangeType = (value) => {
  if (!value) {
    return null;
  }
  return VALID_RANGES.has(value) ? value : null;
};

const normalizeFlowType = (value) => {
  if (!value || value === "all") {
    return null;
  }
  return value;
};

const normalizeTargetId = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }
  return String(value);
};

const normalizeOffset = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const getCategoryFlowCacheDescriptor = (params = {}) => ({
  rangeType: normalizeRangeType(params.rangeType) || "month",
  offset: normalizeOffset(params.offset),
  flowType: normalizeFlowType(params.flowType),
  targetId: normalizeTargetId(params.targetId),
  ownerId: normalizeTargetId(params.ownerId),
});

export const getCategoryFlowCacheKeyFromDescriptor = (descriptor = {}) =>
  JSON.stringify(descriptor);

export const getCategoryFlowCacheKey = (params = {}) =>
  getCategoryFlowCacheKeyFromDescriptor(getCategoryFlowCacheDescriptor(params));
