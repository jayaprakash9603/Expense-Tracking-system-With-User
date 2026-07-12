import React, { useMemo } from "react";

export function Sparkline({
  data = [],
  color = "currentColor",
  width = 60,
  height = 24,
  strokeWidth = 2,
  className,
}) {
  const points = useMemo(() => {
    if (!data.length) return "";
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const step = width / (data.length - 1 || 1);

    return data
      .map((val, i) => `${i * step},${height - ((val - min) / range) * height}`)
      .join(" ");
  }, [data, width, height]);

  if (!data.length) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 -2 ${width} ${height + 4}`}
      className={className}
      aria-hidden="true"
    >
      <polyline
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default Sparkline;
