import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Box, Button, Typography } from "@mui/material";

import { toNumber } from "../../../utils/dailySpendingDrilldownUtils";
import { getEntityIcon } from "../../../utils/iconMapping";

const BreakdownPanel = ({
  title,
  items,
  accent,
  colors,
  formatMoney,
  emptyMessage,
  maxItems = 5,
  entityType,
}) => {
  const safeItems = Array.isArray(items) ? items : [];
  const nonZeroItems = useMemo(
    () => safeItems.filter((item) => Math.abs(toNumber(item?.total)) > 0),
    [safeItems],
  );

  const pageSize = Math.max(1, Number(maxItems) || 5);
  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [title, pageSize]);

  const clampedVisibleCount = Math.min(visibleCount, nonZeroItems.length);
  const visible = nonZeroItems.slice(0, clampedVisibleCount);
  const remainingCount = Math.max(0, nonZeroItems.length - clampedVisibleCount);

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${accent}55`,
        background: colors?.primary_bg,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1.25,
          borderBottom: `1px solid ${colors?.border_color}`,
          background: `${accent}18`,
        }}
      >
        <Typography sx={{ fontWeight: 900, fontSize: 13, color: accent }}>
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 900,
            color: colors?.secondary_text || colors?.primary_text,
            opacity: 0.85,
          }}
        >
          {nonZeroItems.length}
        </Typography>
      </Box>

      <Box sx={{ px: 1.5, py: 1.25, display: "grid", gap: 1 }}>
        {visible.length === 0 ? (
          <Typography sx={{ opacity: 0.75, fontSize: 12 }}>
            {emptyMessage || "No data"}
          </Typography>
        ) : (
          visible.map((item, idx) => (
            <Box
              key={item?.name ?? idx}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 1,
                borderRadius: 1.5,
                border: `1px solid ${colors?.border_color}`,
                px: 1,
                py: 0.75,
                background: `${accent}08`,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                {(entityType === "category" ||
                  entityType === "paymentMethod") &&
                  getEntityIcon(entityType, item?.name, {
                    sx: {
                      fontSize: 16,
                      color: accent,
                      flexShrink: 0,
                    },
                  })}
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    color: colors?.secondary_text || colors?.primary_text,
                  }}
                  title={String(item?.name ?? "")}
                >
                  {item?.name}
                </Typography>
              </Box>

              <Typography sx={{ fontSize: 12, fontWeight: 900, color: accent }}>
                {formatMoney?.(toNumber(item?.total))}
              </Typography>
            </Box>
          ))
        )}

        {nonZeroItems.length > pageSize ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 1,
              alignItems: "center",
            }}
          >
            {remainingCount > 0 ? (
              <Button
                size="small"
                variant="text"
                onClick={() =>
                  setVisibleCount((count) =>
                    Math.min(nonZeroItems.length, count + pageSize),
                  )
                }
                sx={{
                  minWidth: 0,
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 900,
                  color: colors?.secondary_text || colors?.primary_text,
                  background: `${accent}10`,
                  border: `1px solid ${accent}33`,
                  "&:hover": {
                    background: `${accent}1C`,
                    border: `1px solid ${accent}55`,
                  },
                }}
              >
                Show more
                <Box component="span" sx={{ ml: 0.75, opacity: 0.9 }}>
                  (+{remainingCount})
                </Box>
              </Button>
            ) : (
              <Button
                size="small"
                variant="text"
                onClick={() => setVisibleCount(pageSize)}
                sx={{
                  minWidth: 0,
                  px: 1,
                  py: 0.25,
                  borderRadius: 999,
                  textTransform: "none",
                  fontSize: 12,
                  fontWeight: 900,
                  color: colors?.secondary_text || colors?.primary_text,
                  background: `${accent}08`,
                  border: `1px solid ${accent}22`,
                  "&:hover": {
                    background: `${accent}12`,
                    border: `1px solid ${accent}44`,
                  },
                }}
              >
                Show less
              </Button>
            )}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
};

BreakdownPanel.propTypes = {
  title: PropTypes.string.isRequired,
  items: PropTypes.array,
  accent: PropTypes.string.isRequired,
  colors: PropTypes.object,
  formatMoney: PropTypes.func,
  emptyMessage: PropTypes.string,
  maxItems: PropTypes.number,
  entityType: PropTypes.oneOf(["category", "paymentMethod"]),
};

export default BreakdownPanel;
