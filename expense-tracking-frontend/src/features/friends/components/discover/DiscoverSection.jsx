import React, { useEffect } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { useDiscover } from "../../hooks/useDiscover";
import { useCurrentUserId } from "../../hooks/useFriendDisplay";
import { resolveFriendDisplay } from "../../utils/resolveFriendDisplay";
import { friendDiscoverCardSx } from "../../utils/friendsSurfaceStyles";
import FriendAvatar from "../shared/FriendAvatar";
import FriendsEmptyState from "../shared/FriendsEmptyState";
import FriendsLoadingSkeleton from "../shared/FriendsLoadingSkeleton";

const MIN_SEARCH_LENGTH = 2;

const DiscoverSection = ({ onSendRequest }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const currentUserId = useCurrentUserId();
  const {
    suggestions,
    loading,
    searchQuery,
    setSearchQuery,
    searchResults,
    searchingFriends,
    mutualFriends,
    handleSearch,
    handleSendRequest,
    isRequestSent,
  } = useDiscover();

  useEffect(() => {
    if (searchQuery.length >= MIN_SEARCH_LENGTH) {
      handleSearch(searchQuery);
    }
  }, [searchQuery, handleSearch]);

  const displayList = searchingFriends || searchQuery.length >= MIN_SEARCH_LENGTH
    ? searchResults
    : suggestions;

  const renderSuggestionCard = (user) => {
    const display = resolveFriendDisplay(user, {
      currentUserId,
      unknownLabel: t("friends.unknownUser"),
    });
    const userId = display.userId;
    const mutualCount = mutualFriends[userId]?.length ?? user.mutualCount ?? 0;
    const sent = isRequestSent(userId);

    return (
      <Card key={userId} elevation={0} sx={friendDiscoverCardSx(colors)}>
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1.5 }}>
            <FriendAvatar display={display} user={display.user} size={56} />
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
              {mutualCount > 0 && (
                <Typography variant="caption" sx={{ color: colors.secondary_text, display: "block" }}>
                  {t("friends.discover.mutualFriends", { count: mutualCount })}
                </Typography>
              )}
            </Box>
          </Box>
          {sent ? (
            <Chip
              label={t("friends.discover.requestPending")}
              size="small"
              disabled
              sx={{
                width: "100%",
                bgcolor: `${colors.warning}20`,
                color: colors.warning,
              }}
            />
          ) : (
            <Button
              fullWidth
              variant="contained"
              size="small"
              startIcon={<PersonAddIcon />}
              onClick={() => (onSendRequest || handleSendRequest)(userId)}
              aria-label={t("friends.discover.addFriend")}
              sx={{
                minHeight: 44,
                bgcolor: colors.primary_accent,
                transition: "background-color 200ms ease, transform 200ms ease",
                "&:hover": {
                  bgcolor: `${colors.primary_accent}dd`,
                  transform: "translateY(-1px)",
                },
              }}
            >
              {t("friends.discover.addFriend")}
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TextField
        fullWidth
        size="small"
        placeholder={t("friends.search.usersPlaceholder")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            bgcolor: colors.card_bg,
            color: colors.primary_text,
            borderRadius: "12px",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.06)",
            "& fieldset": { borderColor: "transparent" },
            "&:hover fieldset": { borderColor: colors.primary_accent },
            "&.Mui-focused fieldset": { borderColor: colors.primary_accent },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: colors.secondary_text }} />
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {(loading || searchingFriends) && (
          <FriendsLoadingSkeleton count={6} variant="card" />
        )}
        {!loading && !searchingFriends && displayList.length === 0 && (
          <FriendsEmptyState section="discover" />
        )}
        {!loading && !searchingFriends && displayList.length > 0 && (
          <Grid container spacing={2}>
            {displayList.map((user) => (
              <Grid item xs={12} sm={6} md={4} key={user.id || user.recipient?.id}>
                {renderSuggestionCard(user)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );
};

export default DiscoverSection;
