import React from "react";
import PropTypes from "prop-types";
import { Box, Typography } from "@mui/material";

const SummarySection = ({
  isAllView,
  totals,
  breakdown,
  colors,
  formatMoney,
}) => {
  return (
    <Box sx={{ p: 2, display: "grid", gap: 1.25 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          border: `1px solid ${colors?.border_color}`,
          borderRadius: 2,
          p: 1.25,
          background: colors?.primary_bg,
        }}
      >
        <Typography sx={{ fontSize: 12, fontWeight: 900, opacity: 0.85 }}>
          {isAllView ? "Net" : breakdown.totalLabel}
        </Typography>
        {isAllView ? (
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 900,
              color: totals.net >= 0 ? "#00d4c0" : "#ff5252",
            }}
          >
            {totals.net >= 0 ? "+" : "-"}
            {formatMoney(Math.abs(totals.net))}
          </Typography>
        ) : (
          <Typography sx={{ fontSize: 14, fontWeight: 900, color: "#fadb14" }}>
            {formatMoney(breakdown.totalAmount)}
          </Typography>
        )}
      </Box>

      {isAllView ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
          }}
        >
          <Box
            sx={{
              border: `1px solid ${colors?.border_color}`,
              borderRadius: 2,
              p: 1.25,
              background: colors?.primary_bg,
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 900, opacity: 0.8 }}>
              Total Spending
            </Typography>
            <Typography
              sx={{ fontSize: 13, fontWeight: 900, color: "#ff5252" }}
            >
              {formatMoney(totals.spendingLoss)}
            </Typography>
          </Box>
          <Box
            sx={{
              border: `1px solid ${colors?.border_color}`,
              borderRadius: 2,
              p: 1.25,
              background: colors?.primary_bg,
            }}
          >
            <Typography sx={{ fontSize: 11, fontWeight: 900, opacity: 0.8 }}>
              Total Gain
            </Typography>
            <Typography
              sx={{ fontSize: 13, fontWeight: 900, color: "#00d4c0" }}
            >
              {formatMoney(totals.spendingGain)}
            </Typography>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
};

SummarySection.propTypes = {
  isAllView: PropTypes.bool.isRequired,
  totals: PropTypes.object.isRequired,
  breakdown: PropTypes.object.isRequired,
  colors: PropTypes.object,
  formatMoney: PropTypes.func.isRequired,
};

export default SummarySection;
