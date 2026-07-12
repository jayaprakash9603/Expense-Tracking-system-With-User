export function createPieDataPoint(name, value, fill = undefined) {
  return { name, value: Number(value || 0), ...(fill ? { fill } : {}) };
}

export function createTimeSeriesPoint(date, values = {}) {
  return { date, ...values };
}

export function createBarDataPoint(label, values = {}) {
  return { label, ...values };
}

export function createRadialDataPoint(name, value, max, fill = undefined) {
  return {
    name,
    value: Number(value || 0),
    max: Number(max || 100),
    percentage: max ? Math.round((Number(value || 0) / Number(max)) * 100) : 0,
    ...(fill ? { fill } : {}),
  };
}

export function createStackedBarPoint(label, segments = {}) {
  return { label, ...segments };
}
