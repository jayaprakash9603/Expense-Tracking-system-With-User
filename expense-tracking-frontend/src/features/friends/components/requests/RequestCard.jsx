import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Fade,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import FriendAvatar from "../shared/FriendAvatar";

const RequestCard = ({
  request,
  direction,
  onAccept,
  onReject,
  onCancel,
}) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [removing, setRemoving] = useState(false);

  const user =
    direction === "incoming" ? request.requester : request.recipient;
  const displayName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ")
    .trim() || user?.name || "?";
  const timestamp = request.createdAt
    ? new Date(request.createdAt).toLocaleDateString()
    : "";

  const handleAccept = () => {
    setRemoving(true);
    onAccept?.();
  };

  const handleReject = () => {
    setRemoving(true);
    onReject?.();
  };

  const handleCancel = () => {
    setRemoving(true);
    onCancel?.();
  };

  return (
    <Fade in={!removing} timeout={200}>
      <Box
        sx={{
          p: 2,
          mb: 1,
          bgcolor: colors.card_bg,
          borderRadius: 2,
          border: `1px solid ${colors.border_color}`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FriendAvatar user={user} size={48} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: colors.primary_text }}
              noWrap
            >
              {displayName}
            </Typography>
            {timestamp && (
              <Typography variant="caption" sx={{ color: colors.secondary_text }}>
                {timestamp}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
          {direction === "incoming" && (
            <>
              <IconButton
                size="small"
                onClick={handleAccept}
                sx={{
                  bgcolor: `${colors.success}20`,
                  color: colors.success,
                  "&:hover": { bgcolor: `${colors.success}30` },
                }}
              >
                <CheckCircleIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleReject}
                sx={{
                  bgcolor: `${colors.error}20`,
                  color: colors.error,
                  "&:hover": { bgcolor: `${colors.error}30` },
                }}
              >
                <CancelIcon />
              </IconButton>
            </>
          )}
          {direction === "outgoing" && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancel}
              sx={{
                borderColor: colors.primary_accent,
                color: colors.primary_accent,
                "&:hover": {
                  borderColor: colors.primary_accent,
                  bgcolor: `${colors.primary_accent}15`,
                },
              }}
            >
              {t("friends.requests.cancel")}
            </Button>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default RequestCard;
