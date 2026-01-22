import React from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";

import BreakdownPanel from "./BreakdownPanel";

const BreakdownSection = ({ breakdown, colors, formatMoney, entityType }) => {
  if (!breakdown?.lossSection && !breakdown?.gainSection) return null;

  return (
    <Box sx={{ px: 2, pb: 0, display: "grid", gap: 1.25 }}>
      {breakdown.lossSection ? (
        <BreakdownPanel
          title={breakdown.lossSection.title}
          items={breakdown.lossSection.items}
          accent="#ff5252"
          colors={colors}
          formatMoney={formatMoney}
          emptyMessage={breakdown.lossSection.emptyMessage}
          maxItems={5}
          entityType={entityType}
        />
      ) : null}

      {breakdown.gainSection ? (
        <BreakdownPanel
          title={breakdown.gainSection.title}
          items={breakdown.gainSection.items}
          accent="#00d4c0"
          colors={colors}
          formatMoney={formatMoney}
          emptyMessage={breakdown.gainSection.emptyMessage}
          maxItems={5}
          entityType={entityType}
        />
      ) : null}
    </Box>
  );
};

BreakdownSection.propTypes = {
  breakdown: PropTypes.object.isRequired,
  colors: PropTypes.object,
  formatMoney: PropTypes.func.isRequired,
  entityType: PropTypes.oneOf(["category", "paymentMethod"]),
};

export default BreakdownSection;
