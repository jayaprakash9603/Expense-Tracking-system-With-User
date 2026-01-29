import React, { useState } from "react";
import { Button, IconButton, Tooltip } from "@mui/material";
import { Share as ShareIcon } from "@mui/icons-material";
import ShareModal from "./ShareModal";
import QrDisplayScreen from "./QrDisplayScreen";
import { useSelector } from "react-redux";

/**
 * Reusable Share Button Component
 *
 * Usage Examples:
 *
 * 1. Icon button (for cards/lists):
 *    <ShareButton variant="icon" />
 *
 * 2. Full button:
 *    <ShareButton variant="button" label="Share Data" />
 *
 * 3. Pre-selected items:
 *    <ShareButton
 *      preSelectedType="EXPENSE"
 *      preSelectedItems={[{ id: 1, externalRef: 'EXP-001' }]}
 *    />
 */
const ShareButton = ({
  variant = "button",
  label = "Share",
  preSelectedType = null,
  preSelectedItems = [],
  size = "medium",
  color = "primary",
}) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [qrDisplayOpen, setQrDisplayOpen] = useState(false);

  const { currentShare } = useSelector((state) => state.shares);

  const handleOpenShareModal = () => {
    setShareModalOpen(true);
  };

  const handleCloseShareModal = () => {
    setShareModalOpen(false);
  };

  const handleShareCreated = (share) => {
    setShareModalOpen(false);
    setQrDisplayOpen(true);
  };

  const handleCloseQrDisplay = () => {
    setQrDisplayOpen(false);
  };

  return (
    <>
      {variant === "icon" ? (
        <Tooltip title={label}>
          <IconButton onClick={handleOpenShareModal} size={size} color={color}>
            <ShareIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Button
          variant="outlined"
          startIcon={<ShareIcon />}
          onClick={handleOpenShareModal}
          size={size}
          color={color}
        >
          {label}
        </Button>
      )}

      {/* Share Creation Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={handleCloseShareModal}
        onShareCreated={handleShareCreated}
        preSelectedType={preSelectedType}
        preSelectedItems={preSelectedItems}
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

export default ShareButton;
