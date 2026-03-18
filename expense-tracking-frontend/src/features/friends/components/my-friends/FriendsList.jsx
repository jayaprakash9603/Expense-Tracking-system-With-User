import React, { useState } from "react";
import { TextField, InputAdornment, Box, Chip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { useFriendsList } from "../../hooks/useFriendsList";
import { FILTER_OPTIONS } from "../../constants/friendsConstants";
import FriendCard from "./FriendCard";
import FriendsEmptyState from "../shared/FriendsEmptyState";
import FriendsLoadingSkeleton from "../shared/FriendsLoadingSkeleton";

const FriendsList = ({ selectedFriend, onSelectFriend, onOpenDetail, onRemove, onBlock, onManageAccess }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const {
    filteredFriends,
    loadingFriends,
    searchQuery,
    setSearchQuery,
    filterOption,
    setFilterOption,
  } = useFriendsList();

  const filterChips = [
    { value: FILTER_OPTIONS.ALL, labelKey: "friends.filters.all" },
    { value: FILTER_OPTIONS.HAS_ACCESS, labelKey: "friends.filters.hasAccess" },
    { value: FILTER_OPTIONS.NO_ACCESS, labelKey: "friends.filters.noAccess" },
    { value: FILTER_OPTIONS.RECENT, labelKey: "friends.filters.recent" },
  ];

  const handleCardClick = (friendData) => {
    const original = filteredFriends.find(
      (f) =>
        (f.recipient?.id || f.id) === friendData.id ||
        (f.recipient || f)?.id === friendData.id
    ) || friendData;
    onSelectFriend?.(original);
    onOpenDetail?.(original);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <TextField
        fullWidth
        size="small"
        placeholder={t("friends.searchPlaceholder")}
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
      <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
        {filterChips.map((chip) => (
          <Chip
            key={chip.value}
            label={t(chip.labelKey)}
            onClick={() => setFilterOption(chip.value)}
            sx={{
              bgcolor:
                filterOption === chip.value
                  ? colors.primary_accent
                  : colors.card_bg,
              color:
                filterOption === chip.value
                  ? colors.primary_bg
                  : colors.secondary_text,
              border: `1px solid ${colors.border_color}`,
              "&:hover": {
                bgcolor:
                  filterOption === chip.value
                    ? colors.primary_accent
                    : colors.hover_bg,
              },
            }}
          />
        ))}
      </Box>
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
        {loadingFriends && <FriendsLoadingSkeleton count={5} />}
        {!loadingFriends && filteredFriends.length === 0 && (
          <FriendsEmptyState section="myFriends" />
        )}
        {!loadingFriends &&
          filteredFriends.length > 0 &&
          filteredFriends.map((friend) => {
            const other = friend.recipient || friend;
            const friendship = friend.friendship || friend;
            const friendId = other.id || friend.id;
            const isSelected =
              selectedFriend?.id === friendId ||
              selectedFriend?.recipient?.id === friendId;
            const cardFriend = {
              id: friendId,
              firstName: other.firstName,
              lastName: other.lastName,
              profilePicture: other.profilePicture,
              accessLevel:
                friendship.requesterAccess ||
                friendship.recipientAccess ||
                friendship.accessLevel ||
                "NONE",
              createdAt: friendship.createdAt || friendship.updatedAt,
              friendship,
              recipient: other,
            };
            return (
              <FriendCard
                key={friendId}
                friend={cardFriend}
                onSelect={() => handleCardClick(friend)}
                isSelected={isSelected}
                onRemove={() => onRemove?.(friendship.id)}
                onBlock={() => onBlock?.(friendId)}
                onManageAccess={() => onManageAccess?.(friend)}
              />
            );
          })}
      </Box>
    </Box>
  );
};

export default FriendsList;
