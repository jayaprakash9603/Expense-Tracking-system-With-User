import React from "react";
import { Box, Tabs, Tab, Badge } from "@mui/material";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { useRequests } from "../../hooks/useRequests";
import { REQUEST_TABS } from "../../constants/friendsConstants";
import RequestCard from "./RequestCard";
import FriendsEmptyState from "../shared/FriendsEmptyState";
import FriendsLoadingSkeleton from "../shared/FriendsLoadingSkeleton";

const RequestsSection = () => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    activeTab,
    setActiveTab,
    friendRequests,
    outgoingRequests,
    loadingRequests,
    loadingOutgoingRequests,
    handleAccept,
    handleReject,
    handleCancel,
    pendingCount,
  } = useRequests();

  const isLoading = loadingRequests || (activeTab === REQUEST_TABS.OUTGOING && loadingOutgoingRequests);
  const displayList =
    activeTab === REQUEST_TABS.INCOMING
      ? friendRequests.map((r) => ({ ...r, _direction: "incoming" }))
      : activeTab === REQUEST_TABS.OUTGOING
        ? outgoingRequests.map((r) => ({ ...r, _direction: "outgoing" }))
        : [
            ...friendRequests.map((r) => ({ ...r, _direction: "incoming" })),
            ...outgoingRequests.map((r) => ({ ...r, _direction: "outgoing" })),
          ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{
          mb: 2,
          bgcolor: colors.card_bg,
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
          px: 1,
          "& .MuiTabs-indicator": { bgcolor: colors.primary_accent, height: 3, borderRadius: 2 },
          "& .MuiTab-root": {
            color: colors.secondary_text,
            minHeight: 44,
            transition: "color 200ms ease",
            "&.Mui-selected": { color: colors.primary_accent },
          },
        }}
      >
        <Tab
          label={t("friends.requests.incoming")}
          value={REQUEST_TABS.INCOMING}
          icon={
            pendingCount > 0 ? (
              <Badge
                badgeContent={pendingCount}
                color="error"
                sx={{ "& .MuiBadge-badge": { fontSize: "0.7rem" } }}
              >
                <Box component="span" sx={{ width: 16, height: 16 }} />
              </Badge>
            ) : undefined
          }
          iconPosition="end"
        />
        <Tab
          label={t("friends.requests.outgoing")}
          value={REQUEST_TABS.OUTGOING}
        />
        <Tab
          label={t("friends.requests.allPending")}
          value={REQUEST_TABS.ALL}
        />
      </Tabs>
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 8 },
          "&::-webkit-scrollbar-track": {
            bgcolor: colors.secondary_bg,
            borderRadius: 1,
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: colors.primary_accent,
            borderRadius: 1,
          },
        }}
      >
        {isLoading && <FriendsLoadingSkeleton count={4} />}
        {!isLoading && displayList.length === 0 && (
          <FriendsEmptyState section="requests" />
        )}
        {!isLoading &&
          displayList.length > 0 &&
          displayList.map((request) => {
            const direction = request._direction || "incoming";
            return (
              <RequestCard
                key={request.id}
                request={request}
                direction={direction}
                onAccept={() => handleAccept(request.id)}
                onReject={() => handleReject(request.id)}
                onCancel={() => handleCancel(request.id)}
              />
            );
          })}
      </Box>
    </Box>
  );
};

export default RequestsSection;
