import React from "react";
import { ChartTooltipContent } from "@/components/ui/chart";
import { useMoneyFormatter } from "@/shared/hooks/settings/useMoneyFormatter";

export function MaskedChartTooltipContent(props) {
  const { format, isMasked } = useMoneyFormatter();

  if (!isMasked) return <ChartTooltipContent {...props} />;

  return (
    <ChartTooltipContent
      {...props}
      formatter={(value) => format(value)}
    />
  );
}
