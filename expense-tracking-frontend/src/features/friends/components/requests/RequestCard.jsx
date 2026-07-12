import React, { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Fade,
  Tooltip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { useCurrentUserId } from "../../hooks/useFriendDisplay";
import { resolveFriendDisplay } from "../../utils/resolveFriendDisplay";
import { friendRowSx } from "../../utils/friendsSurfaceStyles";
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
  const currentUserId = useCurrentUserId();
  const [removing, setRemoving] = useState(false);

  const display = resolveFriendDisplay(
    { ...request, direction },
    { currentUserId, unknownLabel: t("friends.unknownUser") }
  );
  const timestamp = request.createdAt
    ? new Date(request.createdAt).toLocaleDateString()
    : "";
  const dateLabel =
    direction === "incoming"
      ? t("friends.requests.receivedOn", { date: timestamp })
      : t("friends.requests.sentOn", { date: timestamp });

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
          ...friendRowSx(colors, { selected: false, interactive: false }),
          mb: 1.5,
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "stretch", sm: "center" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 0 }}>
          <FriendAvatar display={display} user={display.user} size={48} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 600, color: colors.primary_text }}
              noWrap
            >
              {display.displayName}
            </Typography>
            {display.email && (
              <Typography variant="caption" sx={{ color: colors.secondary_text }} noWrap>
                {display.email}
              </Typography>
            )}
            {timestamp && (
              <Typography variant="caption" sx={{ color: colors.secondary_text, display: "block" }}>
                {dateLabel}
              </Typography>
            )}
          </Box>
        </Box>
        <Box sx={{ display: "flex", gap: 1, mt: { xs: 1.5, sm: 0 }, ml: { sm: "auto" } }}>
          {direction === "incoming" && (
            <>
              <Tooltip title={t("friends.requests.accept")}>
                <IconButton
                  size="small"
                  onClick={handleAccept}
                  aria-label={t("friends.requests.accept")}
                  sx={{
                    minWidth: 44,
                    minHeight: 44,
                    bgcolor: `${colors.success}20`,
                    color: colors.success,
                    transition: "background-color 200ms ease",
                    "&:hover": { bgcolor: `${colors.success}30` },
                  }}
                >
                  <CheckCircleIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title={t("friends.requests.reject")}>
                <IconButton
                  size="small"
                  onClick={handleReject}
                  aria-label={t("friends.requests.reject")}
                  sx={{
                    minWidth: 44,
                    minHeight: 44,
                    bgcolor: `${colors.error}20`,
                    color: colors.error,
                    transition: "background-color 200ms ease",
                    "&:hover": { bgcolor: `${colors.error}30` },
                  }}
                >
                  <CancelIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
          {direction === "outgoing" && (
            <Button
              variant="outlined"
              size="small"
              onClick={handleCancel}
              sx={{
                minHeight: 44,
                borderColor: colors.primary_accent,
                color: colors.primary_accent,
                transition: "background-color 200ms ease",
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
