import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Tooltip, Badge } from "@mui/material";
import { Share as ShareIcon } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

/**
 * Button to share selected expenses via QR code.
 * Appears when expenses are selected in multi-select mode.
 * Navigates to the CreateSharePage with pre-selected items.
 * Passes return route info to navigate back to the same state.
 */
const ShareSelectedButton = ({
  count = 0,
  selectedItems = [],
  resourceType = "EXPENSE",
  disabled = false,
  // Optional: pass current flow state for return navigation
  returnRouteState = null,
}) => {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleOpenSharePage = () => {
    if (count > 0) {
      // Navigate to create share page with pre-selected items and return route info
      navigate("/my-shares/create", {
        state: {
          preSelectedType: resourceType,
          preSelectedItems: selectedItems,
          // Pass return route info for back navigation
          returnRoute: location.pathname,
          returnRouteState: returnRouteState,
        },
      });
    }
  };

  if (count === 0) {
    return null;
  }

  return (
    <Tooltip title={`Share ${count} selected expense${count > 1 ? "s" : ""}`}>
      <Badge badgeContent={count} color="primary">
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={handleOpenSharePage}
          disabled={disabled}
          sx={{
            backgroundColor: colors.accent || "#00DAC6",
            color: "#fff",
            "&:hover": {
              backgroundColor: colors.accent_hover || "#00b8a9",
            },
            "&:disabled": {
              backgroundColor: colors.disabled || "#ccc",
            },
            minWidth: 100,
            textTransform: "none",
            fontWeight: 600,
          }}
        >
          Share
        </Button>
      </Badge>
    </Tooltip>
  );
};

export default ShareSelectedButton;
