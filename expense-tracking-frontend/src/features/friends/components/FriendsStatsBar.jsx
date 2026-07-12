import React from "react";
import { Box, Skeleton } from "@mui/material";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ShareIcon from "@mui/icons-material/Share";
import BlockIcon from "@mui/icons-material/Block";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";
import { FRIEND_SECTIONS } from "../constants/friendsConstants";
import ModernOverviewCard from "../../../components/common/ModernOverviewCard";

const STAT_CONFIG = [
  {
    key: "totalFriends",
    section: FRIEND_SECTIONS.MY_FRIENDS,
    icon: PeopleAltIcon,
    statKey: "totalFriends",
    variant: "blue",
  },
  {
    key: "pendingRequests",
    section: FRIEND_SECTIONS.REQUESTS,
    icon: PersonAddIcon,
    statKey: "pendingRequests",
    variant: "purple",
  },
  {
    key: "activeSharing",
    section: FRIEND_SECTIONS.SHARING,
    icon: ShareIcon,
    statKey: "activeSharing",
    variant: "yellow",
  },
  {
    key: "blockedUsers",
    section: FRIEND_SECTIONS.BLOCKED,
    icon: BlockIcon,
    statKey: "blockedUsers",
    variant: "red",
  },
];

const FriendsStatsBar = ({ stats = {}, loading, onStatClick }) => {
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const isDark = mode === "dark";

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" },
        gap: 2,
      }}
    >
      {STAT_CONFIG.map(({ key, section, icon: Icon, statKey, variant }) => (
        <Box
          key={key}
          onClick={() => onStatClick(section)}
          sx={{
            cursor: "pointer",
            "& > div": {
              height: "100%",
            }
          }}
        >
          {loading ? (
            <Box
              sx={{
                height: 130,
                bgcolor: colors.card_bg,
                borderRadius: "16px",
                border: `1px solid ${colors.border_color}`,
                p: 2,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <Box>
                  <Skeleton variant="text" width={80} height={20} sx={{ bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }} />
                  <Skeleton variant="text" width={60} height={40} sx={{ bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)", mt: 1 }} />
                </Box>
                <Skeleton variant="circular" width={40} height={40} sx={{ bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }} />
              </Box>
              <Skeleton variant="rounded" width="100%" height={24} sx={{ borderRadius: 1, bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)" }} />
            </Box>
          ) : (
            <ModernOverviewCard
              title={t(`friends.stats.${statKey}`)}
              value={stats[statKey] ?? 0}
              icon={<Icon fontSize="small" />}
              variant={variant}
              sparklineData={[3, 4, 3, 5, 8, 6, 7]} // Default dummy data for now
            />
          )}
        </Box>
      ))}
    </Box>
  );
};

export default FriendsStatsBar;
