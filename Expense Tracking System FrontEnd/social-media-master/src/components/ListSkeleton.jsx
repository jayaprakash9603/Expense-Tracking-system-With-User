import React from "react";
import { Skeleton, Box } from "@mui/material";

/* Reusable list skeleton
 * Props:
 *  count: number of placeholder rows/cards
 *  variant: 'user' | 'sharing'
 *  dense: boolean - smaller height
 */
const ListSkeleton = ({ count = 3, variant = "user", dense = false }) => {
  const items = Array.from({ length: count });
  const isSharing = variant === "sharing";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map((_, idx) => (
        <Box
          key={idx}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            background: "#2a2a2a",
            borderRadius: 2,
            padding: isSharing ? 2.2 : 1.6,
            minHeight: dense ? 70 : isSharing ? 130 : 110,
          }}
        >
          <Skeleton
            variant="circular"
            width={isSharing ? 46 : 40}
            height={isSharing ? 46 : 40}
            sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
          />
          <Box sx={{ flexGrow: 1 }}>
            <Skeleton
              variant="text"
              width={isSharing ? "40%" : "55%"}
              height={20}
              sx={{ bgcolor: "rgba(255,255,255,0.08)" }}
            />
            <Skeleton
              variant="text"
              width={isSharing ? "55%" : "70%"}
              height={16}
              sx={{ bgcolor: "rgba(255,255,255,0.06)" }}
            />
            {isSharing && (
              <Skeleton
                variant="text"
                width="35%"
                height={14}
                sx={{ bgcolor: "rgba(255,255,255,0.05)" }}
              />
            )}
          </Box>
          {isSharing && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Skeleton
                variant="rounded"
                width={64}
                height={24}
                sx={{ borderRadius: 1, bgcolor: "rgba(255,255,255,0.10)" }}
              />
              <Skeleton
                variant="rounded"
                width={64}
                height={24}
                sx={{ borderRadius: 1, bgcolor: "rgba(255,255,255,0.08)" }}
              />
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
};

export default ListSkeleton;
