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

const normalizeSearchTerm = (value) => {
  if (value === undefined || value === null) {
    return null;
  }
  const trimmed = String(value).trim();
  return trimmed.length ? trimmed : null;
};

export const getCashflowCacheDescriptor = (params = {}) => ({
  range: params.range || null,
  offset: normalizeOffset(params.offset),
  flowType: normalizeFlowType(params.flowType),
  category: params.category || null,
  type: params.type || null,
  startDate: params.startDate || null,
  endDate: params.endDate || null,
  groupBy: Boolean(params.groupBy),
  targetId: normalizeTargetId(params.targetId),
  ownerId: normalizeTargetId(params.ownerId),
  search: normalizeSearchTerm(params.search),
});

export const getCashflowCacheKeyFromDescriptor = (descriptor = {}) =>
  JSON.stringify(descriptor);

export const getCashflowCacheKey = (params = {}) =>
  getCashflowCacheKeyFromDescriptor(getCashflowCacheDescriptor(params));
