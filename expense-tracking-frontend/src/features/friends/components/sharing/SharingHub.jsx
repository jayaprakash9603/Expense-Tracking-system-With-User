import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  Chip,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { useSharingHub } from "../../hooks/useSharingHub";
import { ACCESS_LEVEL_OPTIONS } from "../../constants/friendsConstants";
import FriendAvatar from "../shared/FriendAvatar";
import AccessLevelPicker from "../shared/AccessLevelPicker";
import FriendsEmptyState from "../shared/FriendsEmptyState";
import FriendsLoadingSkeleton from "../shared/FriendsLoadingSkeleton";

const SharingHub = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const isMobile = useMediaQuery("(max-width:768px)");
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const {
    iSharedWith,
    sharedWithMe,
    expenseSharingSummary,
    recommendedToShare,
    loadingISharedWith,
    loadingSharedWithMe,
    loadingExpenseSharingSummary,
    handleQuickShare,
    handleBatchShare,
  } = useSharingHub();

  const summary = expenseSharingSummary || {};
  const total = summary.totalShared ?? 0;
  const incoming = summary.incomingCount ?? sharedWithMe?.length ?? 0;
  const outgoing = summary.outgoingCount ?? iSharedWith?.length ?? 0;

  const hasData =
    (iSharedWith?.length > 0 || sharedWithMe?.length > 0 || total > 0) &&
    !loadingISharedWith &&
    !loadingSharedWithMe;

  const renderSharedRow = (item, direction) => {
    const user = item.user || item.recipient || item;
    const displayName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || user.name || "?";
    const accessLevel = item.accessLevel || item.recipientAccess || item.requesterAccess || "NONE";

    return (
      <Box
        key={item.userId || user.id}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          py: 1.5,
          px: 2,
          borderRadius: 1,
          "&:hover": { bgcolor: colors.hover_bg },
        }}
      >
        <FriendAvatar user={user} size={40} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: colors.primary_text }}
            noWrap
          >
            {displayName}
          </Typography>
          <Chip
            size="small"
            label={t(ACCESS_LEVEL_OPTIONS.find((o) => o.value === accessLevel)?.labelKey || "friends.accessLevels.none")}
            sx={{
              mt: 0.5,
              height: 20,
              fontSize: "0.65rem",
              bgcolor: `${colors.primary_accent}20`,
              color: colors.primary_accent,
            }}
          />
        </Box>
        {direction === "outgoing" && (
          <Switch
            size="small"
            checked={accessLevel !== "NONE"}
            onChange={(_, checked) =>
              handleQuickShare(user.id || item.userId, checked ? "READ" : "NONE")
            }
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: colors.primary_accent,
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                bgcolor: colors.primary_accent,
              },
            }}
          />
        )}
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 3, position: "relative" }}>
      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            flex: 1,
            minWidth: 120,
            p: 2,
            bgcolor: colors.card_bg,
            borderRadius: 2,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <Typography variant="caption" sx={{ color: colors.secondary_text }}>
            {t("friends.sharing.total")}
          </Typography>
          <Typography variant="h5" sx={{ color: colors.primary_text, fontWeight: 600 }}>
            {total}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            minWidth: 120,
            p: 2,
            bgcolor: colors.card_bg,
            borderRadius: 2,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <Typography variant="caption" sx={{ color: colors.secondary_text }}>
            {t("friends.sharing.incoming")}
          </Typography>
          <Typography variant="h5" sx={{ color: colors.primary_text, fontWeight: 600 }}>
            {incoming}
          </Typography>
        </Box>
        <Box
          sx={{
            flex: 1,
            minWidth: 120,
            p: 2,
            bgcolor: colors.card_bg,
            borderRadius: 2,
            border: `1px solid ${colors.border_color}`,
          }}
        >
          <Typography variant="caption" sx={{ color: colors.secondary_text }}>
            {t("friends.sharing.outgoing")}
          </Typography>
          <Typography variant="h5" sx={{ color: colors.primary_text, fontWeight: 600 }}>
            {outgoing}
          </Typography>
        </Box>
      </Box>

      {loadingISharedWith || loadingSharedWithMe ? (
        <FriendsLoadingSkeleton count={3} variant="list" />
      ) : !hasData ? (
        <FriendsEmptyState section="sharing" />
      ) : (
        <>
          <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 3 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: colors.primary_accent, mb: 1, fontWeight: 600 }}
              >
                {t("friends.sharing.sharedWithMe")}
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflowY: "auto",
                  bgcolor: colors.surface_bg || colors.card_bg,
                  borderRadius: 2,
                  border: `1px solid ${colors.border_color}`,
                }}
              >
                {(sharedWithMe || []).map((item) => renderSharedRow(item, "incoming"))}
                {(sharedWithMe || []).length === 0 && (
                  <Typography variant="body2" sx={{ p: 2, color: colors.secondary_text }}>
                    {t("friends.empty.sharedWithMe")}
                  </Typography>
                )}
              </Box>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle2"
                sx={{ color: colors.primary_accent, mb: 1, fontWeight: 600 }}
              >
                {t("friends.sharing.iSharedWith")}
              </Typography>
              <Box
                sx={{
                  maxHeight: 200,
                  overflowY: "auto",
                  bgcolor: colors.surface_bg || colors.card_bg,
                  borderRadius: 2,
                  border: `1px solid ${colors.border_color}`,
                }}
              >
                {(iSharedWith || []).map((item) => renderSharedRow(item, "outgoing"))}
                {(iSharedWith || []).length === 0 && (
                  <Typography variant="body2" sx={{ p: 2, color: colors.secondary_text }}>
                    {t("friends.empty.iSharedWith")}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>

          {recommendedToShare?.length > 0 && (
            <Box>
              <Typography
                variant="subtitle2"
                sx={{ color: colors.primary_accent, mb: 1, fontWeight: 600 }}
              >
                {t("friends.sharing.recommended")}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  overflowX: "auto",
                  pb: 1,
                  "&::-webkit-scrollbar": { height: 6 },
                }}
              >
                {recommendedToShare.map((item) => {
                  const user = item.user || item.recipient || item;
                  return (
                    <Box
                      key={user.id}
                      sx={{
                        flexShrink: 0,
                        p: 2,
                        minWidth: 140,
                        bgcolor: colors.card_bg,
                        borderRadius: 2,
                        border: `1px solid ${colors.border_color}`,
                      }}
                    >
                      <FriendAvatar user={user} size={40} />
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: colors.primary_text }}
                        noWrap
                      >
                        {[user.firstName, user.lastName].filter(Boolean).join(" ")}
                      </Typography>
                      <Button
                        size="small"
                        sx={{ mt: 1, color: colors.primary_accent }}
                        onClick={() => handleQuickShare(user.id, "READ")}
                      >
                        {t("friends.sharing.quickShare")}
                      </Button>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </>
      )}

      <Fab
        color="primary"
        sx={{
          position: "absolute",
          bottom: { xs: 72, md: 24 },
          right: { xs: 16, md: 24 },
          bgcolor: colors.primary_accent,
          "&:hover": { bgcolor: `${colors.primary_accent}dd` },
        }}
        onClick={() => setBatchDialogOpen(true)}
      >
        <ShareIcon />
      </Fab>

      <Dialog
        open={batchDialogOpen}
        onClose={() => setBatchDialogOpen(false)}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: colors.card_bg,
            border: isMobile ? "none" : `1px solid ${colors.border_color}`,
          },
        }}
      >
        <DialogTitle sx={{ color: colors.primary_text }}>
          {t("friends.sharing.batchShare")}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: colors.secondary_text, mb: 2 }}>
            {t("friends.sharing.selectFriends")}
          </Typography>
          <AccessLevelPicker
            value="READ"
            onChange={() => {}}
          />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SharingHub;
