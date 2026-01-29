/**
 * =============================================================================
 * ShareWithFriendModal - Share directly with friends via notification
 * =============================================================================
 *
 * Allows users to share their QR code link directly with friends:
 * 1. Select friends from list
 * 2. Add optional message
 * 3. Friends receive notification with share link
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Paper,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  QrCode2 as QrCodeIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTheme } from "../../hooks/useTheme";
import { shareWithFriend } from "../../Redux/Shares/shares.actions";
import { fetchFriends } from "../../Redux/Friends/friendsActions";

const ShareWithFriendModal = ({ open, onClose, share }) => {
  const dispatch = useDispatch();
  const { colors } = useTheme();

  // Redux state
  const { friends = [], loadingFriends } = useSelector(
    (state) => state.friends || {},
  );

  // Local state
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [sendingTo, setSendingTo] = useState(null);
  const [sentTo, setSentTo] = useState([]);
  const [isSending, setIsSending] = useState(false);

  // Load friends on open
  useEffect(() => {
    if (open && friends.length === 0) {
      dispatch(fetchFriends());
    }
  }, [open, friends.length, dispatch]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setSelectedFriends([]);
      setSearchTerm("");
      setMessage("");
      setSentTo([]);
      setSendingTo(null);
      setIsSending(false);
    }
  }, [open]);

  // Get current user ID
  const currentUserId = useSelector((state) => state.auth?.user?.id);

  // Extract friend user from friendship (the other person)
  const getFriendUser = useCallback(
    (friendship) => {
      if (!friendship) return null;
      // If current user is the requester, friend is the recipient and vice versa
      if (friendship.requester?.id === currentUserId) {
        return friendship.recipient;
      }
      return friendship.requester;
    },
    [currentUserId],
  );

  // Map friendships to friend users with friendship id
  const friendUsers = useMemo(() => {
    return friends
      .map((friendship) => {
        const friendUser = getFriendUser(friendship);
        if (!friendUser) return null;
        return {
          ...friendUser,
          friendshipId: friendship.id,
        };
      })
      .filter(Boolean);
  }, [friends, getFriendUser]);

  // Filter friends by search
  const filteredFriends = useMemo(() => {
    if (!searchTerm) return friendUsers;
    const search = searchTerm.toLowerCase();
    return friendUsers.filter(
      (friend) =>
        friend.firstName?.toLowerCase().includes(search) ||
        friend.lastName?.toLowerCase().includes(search) ||
        friend.email?.toLowerCase().includes(search),
    );
  }, [friendUsers, searchTerm]);

  // Toggle friend selection
  const handleToggleFriend = (friend) => {
    setSelectedFriends((prev) => {
      const exists = prev.find((f) => f.id === friend.id);
      if (exists) {
        return prev.filter((f) => f.id !== friend.id);
      }
      return [...prev, friend];
    });
  };

  // Send share to selected friends
  const handleSendToFriends = async () => {
    if (selectedFriends.length === 0 || !share?.token || isSending) return;

    setIsSending(true);

    for (const friend of selectedFriends) {
      if (sentTo.includes(friend.id)) continue;

      setSendingTo(friend.id);
      const result = await dispatch(
        shareWithFriend(share.token, friend.id, message),
      );

      if (result.success) {
        setSentTo((prev) => [...prev, friend.id]);
        toast.success(`Shared with ${friend.firstName || friend.email}!`);
      } else {
        toast.error(`Failed to share with ${friend.firstName || friend.email}`);
      }
    }
    setSendingTo(null);
    setIsSending(false);
  };

  // Check if all selected friends have been sent to
  const allSent =
    selectedFriends.length > 0 &&
    selectedFriends.every((f) => sentTo.includes(f.id));

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.modal_bg,
          color: colors.primary_text,
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${colors.border}`,
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SendIcon sx={{ color: colors.accent }} />
          <Typography variant="h6">Share with Friends</Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon sx={{ color: colors.secondary_text }} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 3 }}>
        {/* Share Info */}
        {share && (
          <Paper
            sx={{
              p: 2,
              mb: 3,
              backgroundColor: colors.card_bg,
              border: `1px solid ${colors.border}`,
              display: "flex",
              alignItems: "center",
              gap: 2,
            }}
          >
            <QrCodeIcon sx={{ fontSize: 40, color: colors.accent }} />
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
                {share.shareName || `${share.resourceType} Share`}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                {share.resourceCount || 0} items • {share.permission} access
              </Typography>
            </Box>
          </Paper>
        )}

        {/* Search Friends */}
        <TextField
          fullWidth
          size="small"
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: colors.secondary_text }} />
              </InputAdornment>
            ),
            sx: { color: colors.primary_text },
          }}
          sx={{ mb: 2 }}
        />

        {/* Selected Friends Chips */}
        {selectedFriends.length > 0 && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            {selectedFriends.map((friend) => (
              <Chip
                key={friend.id}
                avatar={
                  <Avatar sx={{ width: 24, height: 24 }}>
                    {friend.firstName?.[0] || friend.email?.[0] || "?"}
                  </Avatar>
                }
                label={friend.firstName || friend.email}
                onDelete={() => handleToggleFriend(friend)}
                icon={
                  sentTo.includes(friend.id) ? (
                    <CheckIcon sx={{ color: "green" }} />
                  ) : undefined
                }
                sx={{
                  backgroundColor: sentTo.includes(friend.id)
                    ? `${colors.success}20`
                    : colors.accent,
                  color: sentTo.includes(friend.id) ? colors.success : "#fff",
                }}
              />
            ))}
          </Box>
        )}

        {/* Friends List */}
        <Typography
          variant="subtitle2"
          sx={{ color: colors.secondary_text, mb: 1 }}
        >
          Select friends to share with:
        </Typography>

        {loadingFriends ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filteredFriends.length === 0 ? (
          <Alert severity="info" sx={{ mb: 2 }}>
            {searchTerm
              ? "No friends match your search"
              : "You don't have any friends yet"}
          </Alert>
        ) : (
          <List
            dense
            sx={{
              maxHeight: 250,
              overflow: "auto",
              border: `1px solid ${colors.border}`,
              borderRadius: 1,
              mb: 2,
            }}
          >
            {filteredFriends.map((friend) => {
              const isSelected = selectedFriends.some(
                (f) => f.id === friend.id,
              );
              const isSent = sentTo.includes(friend.id);
              const isSending = sendingTo === friend.id;

              return (
                <ListItem
                  key={friend.id}
                  onClick={() => !isSent && handleToggleFriend(friend)}
                  sx={{
                    cursor: isSent ? "default" : "pointer",
                    borderRadius: 1,
                    mb: 0.5,
                    backgroundColor: isSelected
                      ? `${colors.accent}15`
                      : "transparent",
                    "&:hover": {
                      backgroundColor: isSent
                        ? "transparent"
                        : `${colors.accent}10`,
                    },
                  }}
                >
                  <Checkbox
                    checked={isSelected || isSent}
                    disabled={isSent}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <ListItemAvatar>
                    <Avatar
                      src={friend.profileImage}
                      sx={{ width: 36, height: 36, bgcolor: colors.accent }}
                    >
                      {friend.firstName?.[0] || friend.email?.[0] || (
                        <PersonIcon />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      friend.firstName
                        ? `${friend.firstName} ${friend.lastName || ""}`
                        : friend.email
                    }
                    secondary={friend.email}
                    primaryTypographyProps={{
                      sx: { color: colors.primary_text },
                    }}
                    secondaryTypographyProps={{
                      sx: { color: colors.secondary_text },
                    }}
                  />
                  {isSending && <CircularProgress size={20} />}
                  {isSent && <CheckIcon sx={{ color: colors.success }} />}
                </ListItem>
              );
            })}
          </List>
        )}

        {/* Optional Message */}
        <TextField
          fullWidth
          multiline
          rows={2}
          label="Add a message (optional)"
          placeholder="Hey! Check out this expense data I'm sharing with you..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MessageIcon sx={{ color: colors.secondary_text }} />
              </InputAdornment>
            ),
            sx: { color: colors.primary_text },
          }}
          InputLabelProps={{ sx: { color: colors.secondary_text } }}
        />

        {/* Info Alert */}
        <Alert severity="info" sx={{ mt: 2 }}>
          Selected friends will receive a notification with the share link. They
          can view the shared data by clicking the notification or link.
        </Alert>
      </DialogContent>

      <DialogActions
        sx={{ px: 3, pb: 3, borderTop: `1px solid ${colors.border}` }}
      >
        <Button onClick={onClose} sx={{ color: colors.secondary_text }}>
          {allSent ? "Done" : "Cancel"}
        </Button>
        <Button
          variant="contained"
          onClick={handleSendToFriends}
          disabled={selectedFriends.length === 0 || isSending || allSent}
          startIcon={
            isSending ? (
              <CircularProgress size={20} />
            ) : allSent ? (
              <CheckIcon />
            ) : (
              <SendIcon />
            )
          }
          sx={{
            backgroundColor: allSent ? colors.success : colors.accent,
            "&:hover": {
              backgroundColor: allSent ? colors.success : colors.accent_hover,
            },
          }}
        >
          {allSent
            ? "All Sent!"
            : isSending
              ? "Sending..."
              : `Send to ${selectedFriends.length} Friend${selectedFriends.length !== 1 ? "s" : ""}`}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ShareWithFriendModal;
