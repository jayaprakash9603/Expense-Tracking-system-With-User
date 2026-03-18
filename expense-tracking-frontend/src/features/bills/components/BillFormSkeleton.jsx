import React from "react";
import { Skeleton } from "@mui/material";
import FormPageShell from "../../../shared/form/components/FormPageShell";

function FieldSkeleton({ colors, width = 300 }) {
  return (
    <Skeleton
      variant="rectangular"
      height={56}
      width={width}
      sx={{ bgcolor: colors.secondary_bg, borderRadius: 1 }}
    />
  );
}

function ExpenseItemSkeleton({ colors }) {
  return (
    <div
      className="rounded-lg p-2 border animate-pulse"
      style={{
        backgroundColor: colors.primary_bg,
        borderColor: colors.border_color,
      }}
    >
      <div className="flex justify-between mb-2">
        <Skeleton variant="text" width={90} height={16} sx={{ bgcolor: colors.hover_bg }} />
        <Skeleton variant="text" width={50} height={16} sx={{ bgcolor: colors.hover_bg }} />
      </div>
      <Skeleton variant="text" width={120} height={12} sx={{ bgcolor: colors.secondary_bg }} />
      <Skeleton variant="text" width={100} height={12} sx={{ bgcolor: colors.secondary_bg }} />
      <Skeleton variant="text" width={80} height={12} sx={{ bgcolor: colors.secondary_bg }} />
    </div>
  );
}

export default function BillFormSkeleton({ colors, t, onClose }) {
  return (
    <FormPageShell
      title={t("editBill.title")}
      onClose={onClose}
      colors={colors}
      containerStyle={{ backgroundColor: colors.tertiary_bg }}
    >
      <div className="flex flex-col gap-4 mt-2">
        <div className="flex flex-1 gap-4 items-center">
          <FieldSkeleton colors={colors} />
          <FieldSkeleton colors={colors} />
          <FieldSkeleton colors={colors} />
        </div>
        <div className="flex flex-1 gap-4 items-center">
          <FieldSkeleton colors={colors} />
          <FieldSkeleton colors={colors} />
          <FieldSkeleton colors={colors} />
        </div>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <div className="h-10 w-48 bg-secondary_bg rounded animate-pulse" />
        <div className="h-10 w-48 bg-secondary_bg rounded animate-pulse" />
      </div>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <ExpenseItemSkeleton key={i} colors={colors} />
        ))}
      </div>
    </FormPageShell>
  );
}
