import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  Switch,
  Chip,
  useMediaQuery,
  Divider,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { useSharingHub } from "../../hooks/useSharingHub";
import { ACCESS_LEVEL_OPTIONS } from "../../constants/friendsConstants";
import { useCurrentUserId } from "../../hooks/useFriendDisplay";
import { resolveFriendDisplay } from "../../utils/resolveFriendDisplay";
import {
  friendRowSx,
  friendStatMiniSx,
  friendSectionHeaderSx,
  friendListContainerSx,
} from "../../utils/friendsSurfaceStyles";
import FriendAvatar from "../shared/FriendAvatar";
import AccessLevelPicker from "../shared/AccessLevelPicker";
import FriendsEmptyState from "../shared/FriendsEmptyState";
import FriendsLoadingSkeleton from "../shared/FriendsLoadingSkeleton";
import NoDataPlaceholder from "../../../../components/NoDataPlaceholder";

const SharingHub = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const currentUserId = useCurrentUserId();
  const isMobile = useMediaQuery("(max-width:768px)");
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const {
    iSharedWith,
    sharedWithMe,
    expenseSharingSummary,
    recommendedToShare,
    loadingISharedWith,
    loadingSharedWithMe,
    handleQuickShare,
  } = useSharingHub();

  const summary = expenseSharingSummary || {};
  const incoming = summary.incomingCount ?? sharedWithMe?.length ?? 0;
  const outgoing = summary.outgoingCount ?? iSharedWith?.length ?? 0;
  const total = summary.totalShared ?? incoming + outgoing;

  const hasData =
    (iSharedWith?.length > 0 || sharedWithMe?.length > 0 || total > 0) &&
    !loadingISharedWith &&
    !loadingSharedWithMe;

  const renderSharedRow = (item, direction) => {
    const display = resolveFriendDisplay(item, {
      currentUserId,
      unknownLabel: t("friends.unknownUser"),
    });
    const accessOpt = ACCESS_LEVEL_OPTIONS.find((o) => o.value === display.accessLevel);

    return (
      <Box
        key={item.userId || display.userId}
        sx={{ ...friendRowSx(colors, { interactive: false }), mb: 0 }}
      >
        <FriendAvatar display={display} user={display.user} size={40} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 500, color: colors.primary_text }}
            noWrap
          >
            {display.displayName}
          </Typography>
          {display.email && (
            <Typography variant="caption" sx={{ color: colors.secondary_text }} noWrap>
              {display.email}
            </Typography>
          )}
          <Chip
            size="small"
            label={t(accessOpt?.labelKey || "friends.accessLevels.none")}
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
            checked={display.accessLevel !== "NONE"}
            onChange={(_, checked) =>
              handleQuickShare(display.userId, checked ? "READ" : "NONE")
            }
            inputProps={{
              "aria-label": t("friends.sharing.accessLevel"),
            }}
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
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: 0, gap: 2.5 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" },
          gap: 1.5,
        }}
      >
        <Box sx={friendStatMiniSx(colors)}>
          <Typography variant="caption" sx={{ color: colors.secondary_text }}>
            {t("friends.sharing.totalSharing")}
          </Typography>
          <Typography variant="h5" sx={{ color: colors.primary_text, fontWeight: 600 }}>
            {total}
          </Typography>
        </Box>
        <Box sx={friendStatMiniSx(colors)}>
          <Typography variant="caption" sx={{ color: colors.secondary_text }}>
            {t("friends.sharing.incomingShares")}
          </Typography>
          <Typography variant="h5" sx={{ color: colors.primary_text, fontWeight: 600 }}>
            {incoming}
          </Typography>
        </Box>
        <Box sx={friendStatMiniSx(colors)}>
          <Typography variant="caption" sx={{ color: colors.secondary_text }}>
            {t("friends.sharing.outgoingShares")}
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
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
              alignItems: "start",
            }}
          >
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={friendSectionHeaderSx(colors)}>
                {t("friends.sharing.sharedWithMe")}
              </Typography>
              <Box sx={friendListContainerSx(colors)}>
                {(sharedWithMe || []).length === 0 ? (
                  <NoDataPlaceholder
                    message={t("friends.sharing.noSharedWithMe")}
                    size="sm"
                    height={140}
                    fullWidth
                    dense
                  />
                ) : (
                  (sharedWithMe || []).map((item) => renderSharedRow(item, "incoming"))
                )}
              </Box>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="subtitle2" sx={friendSectionHeaderSx(colors)}>
                {t("friends.sharing.iSharedWith")}
              </Typography>
              <Box sx={friendListContainerSx(colors)}>
                {(iSharedWith || []).length === 0 ? (
                  <NoDataPlaceholder
                    message={t("friends.sharing.noISharedWith")}
                    size="sm"
                    height={140}
                    fullWidth
                    dense
                  />
                ) : (
                  (iSharedWith || []).map((item) => renderSharedRow(item, "outgoing"))
                )}
              </Box>
            </Box>
          </Box>

          {recommendedToShare?.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={friendSectionHeaderSx(colors)}>
                {t("friends.sharing.recommended")}
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(2, minmax(0, 1fr))",
                    sm: "repeat(3, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                }}
              >
                {recommendedToShare.map((item) => {
                  const display = resolveFriendDisplay(item, {
                    currentUserId,
                    unknownLabel: t("friends.unknownUser"),
                  });
                  return (
                    <Box
                      key={display.userId}
                      sx={{
                        p: 2,
                        minWidth: 0,
                        bgcolor: colors.card_bg,
                        borderRadius: "12px",
                        border: `1px solid ${colors.border_color}`,
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
                        transition: "box-shadow 200ms ease, transform 200ms ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <FriendAvatar display={display} user={display.user} size={40} />
                      <Typography
                        variant="body2"
                        sx={{ mt: 1, color: colors.primary_text, fontWeight: 500 }}
                        noWrap
                      >
                        {display.displayName}
                      </Typography>
                      <Button
                        size="small"
                        onClick={() => handleQuickShare(display.userId, "READ")}
                        sx={{
                          mt: 1,
                          minHeight: 36,
                          color: colors.primary_accent,
                          transition: "background-color 200ms ease",
                        }}
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

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={() => setBatchDialogOpen(true)}
          sx={{
            minHeight: 44,
            px: 2.5,
            bgcolor: colors.primary_accent,
            color: colors.button_text,
            textTransform: "none",
            fontWeight: 700,
            borderRadius: "12px",
            "&:hover": { bgcolor: `${colors.primary_accent}dd` },
          }}
        >
          {t("friends.sharing.batchShare")}
        </Button>
      </Box>

      <Dialog
        open={batchDialogOpen}
        onClose={() => setBatchDialogOpen(false)}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            bgcolor: colors.card_bg,
            borderRadius: isMobile ? 0 : "16px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
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
          <Divider sx={{ mb: 2, borderColor: colors.border_color }} />
          <AccessLevelPicker value="READ" onChange={() => {}} />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default SharingHub;
