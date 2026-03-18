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
import FriendAvatar from "../shared/FriendAvatar";
import FriendsEmptyState from "../shared/FriendsEmptyState";
import FriendsLoadingSkeleton from "../shared/FriendsLoadingSkeleton";

const MIN_SEARCH_LENGTH = 2;

const DiscoverSection = ({ onSendRequest }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
  const showSearchResults = searchingFriends || (searchQuery.length >= MIN_SEARCH_LENGTH && searchResults.length > 0);

  const renderSuggestionCard = (user) => {
    const userId = user.id || user.recipient?.id;
    const u = user.recipient || user;
    const displayName = [u.firstName, u.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() || u.name || "?";
    const mutualCount = mutualFriends[userId]?.length ?? user.mutualCount ?? 0;
    const sent = isRequestSent(userId);

    return (
      <Card
        key={userId}
        sx={{
          bgcolor: colors.card_bg,
          border: `1px solid ${colors.border_color}`,
          borderRadius: 2,
          "&:hover": { bgcolor: colors.hover_bg },
        }}
      >
        <CardContent>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
            <FriendAvatar user={u} size={56} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: colors.primary_text }}
                noWrap
              >
                {displayName}
              </Typography>
              {mutualCount > 0 && (
                <Typography variant="caption" sx={{ color: colors.secondary_text }}>
                  {t("friends.mutualCount", { count: mutualCount })}
                </Typography>
              )}
            </Box>
          </Box>
          {sent ? (
            <Chip
              label={t("friends.requestPending")}
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
              sx={{
                bgcolor: colors.primary_accent,
                "&:hover": { bgcolor: `${colors.primary_accent}dd` },
              }}
            >
              {t("friends.addFriend")}
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
        placeholder={t("friends.discover.searchUsers", "Search Users...")}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        sx={{
          mb: 2,
          "& .MuiOutlinedInput-root": {
            bgcolor: colors.card_bg,
            color: colors.primary_text,
            "& fieldset": { borderColor: colors.border_color },
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
