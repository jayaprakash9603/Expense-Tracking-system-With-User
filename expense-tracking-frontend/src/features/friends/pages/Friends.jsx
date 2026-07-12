import React, { useMemo } from "react";
import { Box, useMediaQuery } from "@mui/material";
import { useTheme } from "../../../hooks/useTheme";
import { FRIEND_SECTIONS, BREAKPOINTS } from "../constants/friendsConstants";
import { useFriendsPage } from "../hooks/useFriendsPage";
import { useFriendActions } from "../hooks/useFriendActions";
import FriendsHeader from "../components/FriendsHeader";
import FriendsStatsBar from "../components/FriendsStatsBar";
import FriendsSidebar from "../components/FriendsSidebar";
import { FriendsList } from "../components/my-friends";
import { FriendDetailPanel } from "../components/my-friends";
import { RequestsSection } from "../components/requests";
import { DiscoverSection } from "../components/discover";
import { SharingHub } from "../components/sharing";
import { BlockedSection } from "../components/blocked";
import { FriendshipReportSection } from "../components/report";

const SECTION_COMPONENTS = {
  [FRIEND_SECTIONS.MY_FRIENDS]: FriendsList,
  [FRIEND_SECTIONS.REQUESTS]: RequestsSection,
  [FRIEND_SECTIONS.DISCOVER]: DiscoverSection,
  [FRIEND_SECTIONS.SHARING]: SharingHub,
  [FRIEND_SECTIONS.BLOCKED]: BlockedSection,
  [FRIEND_SECTIONS.REPORT]: FriendshipReportSection,
};

const Friends = () => {
  const { colors } = useTheme();
  const isTablet = useMediaQuery(`(max-width:${BREAKPOINTS.TABLET}px)`);

  const {
    activeSection,
    setActiveSection,
    selectedFriend,
    setSelectedFriend,
    isDetailOpen,
    setIsDetailOpen,
    friendshipStats,
    loadingFriendshipStats,
    refreshAll,
    isRefreshing,
    searchQuery,
    setSearchQuery,
    pendingCount,
  } = useFriendsPage();

  const {
    handleBlock,
    handleRemoveFriend,
    handleSetAccess,
  } = useFriendActions();

  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(isTablet);

  const ActiveSection = useMemo(
    () => SECTION_COMPONENTS[activeSection] || FriendsList,
    [activeSection]
  );

  const handleFriendSelect = (friend) => {
    setSelectedFriend(friend);
    setIsDetailOpen(true);
  };

  const stats = useMemo(() => ({
    totalFriends: friendshipStats?.totalFriends ?? 0,
    pendingRequests: friendshipStats?.pendingRequests ?? 0,
    activeSharing: friendshipStats?.activeSharing ?? 0,
    blockedUsers: friendshipStats?.blockedUsers ?? 0,
  }), [friendshipStats]);

    return (
    <Box sx={{
      height: { xs: "calc(100vh - 56px)", sm: "calc(100vh - 64px)", lg: "calc(100vh - 100px)" },
      width: { xs: "100%", lg: "calc(100vw - 370px)" },
            backgroundColor: colors.secondary_bg,
      border: { xs: "none", lg: `1px solid ${colors.border_color}` },
      position: "relative",
      overflow: "hidden",
      borderRadius: { xs: 0, lg: "8px" },
      mr: { xs: 0, lg: "20px" },
    }}>
      <Box sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        py: { xs: 1, sm: 1.5, md: 2 },
        px: { xs: 1.5, sm: 2, md: 3 },
      }}>
        <FriendsHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onRefresh={refreshAll}
          isRefreshing={isRefreshing}
          onSelectFriend={handleFriendSelect}
        />

        <Box sx={{ pb: 2 }}>
          <FriendsStatsBar
            stats={stats}
            loading={loadingFriendshipStats}
            onStatClick={setActiveSection}
          />
        </Box>

        <Box sx={{
          display: "flex",
          flex: 1,
          overflow: "hidden",
          position: "relative",
          borderRadius: { xs: 0, sm: "16px" },
          backgroundColor: colors.primary_bg,
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
        }}>
        {!isTablet && (
          <FriendsSidebar
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            pendingCount={pendingCount}
            isCollapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
          />
        )}

        <Box sx={{
          flex: 1,
          minWidth: 0,
          minHeight: 0,
          overflow: "auto",
          p: { xs: 1.5, sm: 2, md: 2.5 },
          pb: isTablet ? 9 : 2.5,
          overscrollBehavior: "contain",
          "&::-webkit-scrollbar": { width: 6 },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: colors.border_color,
            borderRadius: 3,
          },
        }}>
          <ActiveSection
            onSelectFriend={handleFriendSelect}
            selectedFriend={selectedFriend}
            globalSearchQuery={searchQuery}
            onRemove={handleRemoveFriend}
            onBlock={handleBlock}
            onManageAccess={(friend) => {
              handleFriendSelect(friend);
              // The detail panel has the access level picker
            }}
          />
        </Box>

        {isDetailOpen && selectedFriend && (
          <FriendDetailPanel
            friend={selectedFriend}
            onClose={() => {
              setIsDetailOpen(false);
              setSelectedFriend(null);
            }}
            onSetAccess={handleSetAccess}
            onRemove={handleRemoveFriend}
            onBlock={handleBlock}
          />
        )}
      </Box>

      {isTablet && (
        <FriendsSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          pendingCount={pendingCount}
          isCollapsed={false}
          onToggleCollapse={() => {}}
        />
      )}
      </Box>
    </Box>
  );
};

export default Friends;
