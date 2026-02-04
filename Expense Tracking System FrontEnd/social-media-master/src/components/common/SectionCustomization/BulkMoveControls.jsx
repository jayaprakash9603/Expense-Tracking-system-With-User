import React from "react";
import { Box, IconButton, Divider, Tooltip } from "@mui/material";
import {
  ChevronRight as ChevronRightIcon,
  ChevronLeft as ChevronLeftIcon,
  KeyboardDoubleArrowRight as DoubleArrowRightIcon,
  KeyboardDoubleArrowLeft as DoubleArrowLeftIcon,
  KeyboardArrowDown as ChevronDownIcon,
  KeyboardArrowUp as ChevronUpIcon,
  KeyboardDoubleArrowDown as DoubleArrowDownIcon,
  KeyboardDoubleArrowUp as DoubleArrowUpIcon,
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
  isMobile = false,
  labels = {
    moveAllToActive: "Move all to Active",
    moveSelectedToActive: "Move selected to Active",
    moveSelectedToAvailable: "Move selected to Available",
    moveAllToAvailable: "Move all to Available",
  },
}) => {
  // Mobile layout: horizontal with down arrows
  // Desktop layout: vertical with left/right arrows
  const LeftIcon = isMobile ? DoubleArrowUpIcon : DoubleArrowLeftIcon;
  const RightIcon = isMobile ? DoubleArrowDownIcon : DoubleArrowRightIcon;
  const SingleLeftIcon = isMobile ? ChevronUpIcon : ChevronLeftIcon;
  const SingleRightIcon = isMobile ? ChevronDownIcon : ChevronRightIcon;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "row" : "column",
        alignItems: "center",
        justifyContent: "center",
        gap: isMobile ? 1 : 2,
        px: isMobile ? 0 : 1,
        py: isMobile ? 1 : 0,
      }}
    >
      <Tooltip
        title={labels.moveAllToActive}
        arrow
        placement={isMobile ? "bottom" : "right"}
      >
        <span>
          <IconButton
            onClick={onMoveAllToActive}
            disabled={availableCount === 0}
            sx={{
              ...getMoveButtonStyles(isDark, colors, false, "right"),
              width: isMobile ? 36 : 40,
              height: isMobile ? 36 : 40,
            }}
          >
            <RightIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip
        title={`${labels.moveSelectedToActive} (${selectedAvailableCount})`}
        arrow
        placement={isMobile ? "bottom" : "right"}
      >
        <span>
          <IconButton
            onClick={onMoveSelectedToActive}
            disabled={selectedAvailableCount === 0}
            sx={{
              ...getMoveButtonStyles(
                isDark,
                colors,
                selectedAvailableCount > 0,
                "right"
              ),
              width: isMobile ? 36 : 40,
              height: isMobile ? 36 : 40,
            }}
          >
            <SingleRightIcon fontSize="medium" />
          </IconButton>
        </span>
      </Tooltip>

      <Divider
        orientation={isMobile ? "vertical" : "horizontal"}
        sx={{
          width: isMobile ? "auto" : "100%",
          height: isMobile ? 24 : "auto",
          borderColor: colors.border_color,
          mx: isMobile ? 1 : 0,
          my: isMobile ? 0 : 1,
        }}
      />

      <Tooltip
        title={`${labels.moveSelectedToAvailable} (${selectedActiveCount})`}
        arrow
        placement={isMobile ? "top" : "left"}
      >
        <span>
          <IconButton
            onClick={onMoveSelectedToAvailable}
            disabled={selectedActiveCount === 0}
            sx={{
              ...getMoveButtonStyles(
                isDark,
                colors,
                selectedActiveCount > 0,
                "left"
              ),
              width: isMobile ? 36 : 40,
              height: isMobile ? 36 : 40,
            }}
          >
            <SingleLeftIcon fontSize="medium" />
          </IconButton>
        </span>
      </Tooltip>

      <Tooltip
        title={labels.moveAllToAvailable}
        arrow
        placement={isMobile ? "top" : "left"}
      >
        <span>
          <IconButton
            onClick={onMoveAllToAvailable}
            disabled={activeCount === 0}
            sx={{
              ...getMoveButtonStyles(isDark, colors, false, "left"),
              width: isMobile ? 36 : 40,
              height: isMobile ? 36 : 40,
            }}
          >
            <LeftIcon fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>
    </Box>
  );
};

export default React.memo(BulkMoveControls);
