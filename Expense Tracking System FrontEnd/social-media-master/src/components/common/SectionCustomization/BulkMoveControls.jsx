import React from "react";
import { Box, IconButton, Divider, Tooltip } from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  KeyboardDoubleArrowRight as DoubleArrowRightIcon,
  KeyboardDoubleArrowLeft as DoubleArrowLeftIcon,
} from "@mui/icons-material";
import { getMoveButtonStyles } from "./customizationStyles";

/**
 * BulkMoveControls - Buttons for bulk section movement
 * Follows Single Responsibility: Only handles bulk move actions
 */
const BulkMoveControls = ({
  onMoveAllToActive,
  onMoveSelectedToActive,
  onMoveSelectedToAvailable,
  onMoveAllToAvailable,
  selectedAvailableCount,
  selectedActiveCount,
  availableCount,
  activeCount,
  colors,
  isDark,
  labels = {
    moveAllToActive: "Move all to Active",
    moveSelectedToActive: "Move selected to Active",
    moveSelectedToAvailable: "Move selected to Available",
    moveAllToAvailable: "Move all to Available",
  },
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        px: 1,
      }}
    >
      <Tooltip title={labels.moveAllToActive} arrow placement="right">
        <span>
          <IconButton
            onClick={onMoveAllToActive}
            disabled={availableCount === 0}
            sx={getMoveButtonStyles(isDark, colors, false, "right")}
          >
            <DoubleArrowRightIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip
        title={`${labels.moveSelectedToActive} (${selectedAvailableCount})`}
        arrow
        placement="right"
      >
        <span>
          <IconButton
            onClick={onMoveSelectedToActive}
            disabled={selectedAvailableCount === 0}
            sx={getMoveButtonStyles(
              isDark,
              colors,
              selectedAvailableCount > 0,
              "right"
            )}
          >
            <ChevronRightIcon fontSize="medium" />
          </IconButton>
        </span>
      </Tooltip>

      <Divider
        sx={{ width: "100%", borderColor: colors.border_color, my: 1 }}
      />

      <Tooltip
        title={`${labels.moveSelectedToAvailable} (${selectedActiveCount})`}
        arrow
        placement="left"
      >
        <span>
          <IconButton
            onClick={onMoveSelectedToAvailable}
            disabled={selectedActiveCount === 0}
            sx={getMoveButtonStyles(
              isDark,
              colors,
              selectedActiveCount > 0,
              "left"
            )}
          >
            <ChevronLeftIcon fontSize="medium" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip title={labels.moveAllToAvailable} arrow placement="left">
        <span>
          <IconButton
            onClick={onMoveAllToAvailable}
            disabled={activeCount === 0}
            sx={getMoveButtonStyles(isDark, colors, false, "left")}
          >
            <DoubleArrowLeftIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default React.memo(BulkMoveControls);
