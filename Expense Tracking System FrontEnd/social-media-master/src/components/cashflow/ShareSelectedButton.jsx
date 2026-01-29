import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Button, Tooltip, Badge } from "@mui/material";
import { Share as ShareIcon } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import ShareModal from "../sharing/ShareModal";
import QrDisplayScreen from "../sharing/QrDisplayScreen";

/**
 * Button to share selected expenses via QR code.
 * Appears when expenses are selected in multi-select mode.
 */
const ShareSelectedButton = ({
  count = 0,
  selectedItems = [],
  resourceType = "EXPENSE",
  disabled = false,
}) => {
  const { colors } = useTheme();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [qrDisplayOpen, setQrDisplayOpen] = useState(false);
  
  const { currentShare } = useSelector((state) => state.shares || {});

  const handleOpenShareModal = () => {
    if (count > 0) {
      setShareModalOpen(true);
    }
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };

  const handleShareCreated = () => {
    setShareModalOpen(false);
    setQrDisplayOpen(true);
  };

  const handleCloseQrDisplay = () => {
    setQrDisplayOpen(false);
  };

  if (count === 0) {
    return null;
  }

  return (
    <>
      <Tooltip title={`Share ${count} selected expense${count > 1 ? "s" : ""}`}>
        <Badge badgeContent={count} color="primary">
          <Button
            variant="contained"
            startIcon={<ShareIcon />}
            onClick={handleOpenShareModal}
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

      {/* Share Creation Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={handleCloseShareModal}
        onShareCreated={handleShareCreated}
        preSelectedType={resourceType}
        preSelectedItems={selectedItems}
      />

      {/* QR Code Display */}
      <QrDisplayScreen
        open={qrDisplayOpen}
        onClose={handleCloseQrDisplay}
        share={currentShare}
      />
    </>
  );
};

export default ShareSelectedButton;
