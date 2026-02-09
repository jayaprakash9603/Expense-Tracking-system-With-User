import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  TextField,
  Box,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ForwardIcon from "@mui/icons-material/Forward";
import { getInitials, getAvatarColor } from "../../utils/chatUtils";
import { useTheme } from "../../hooks/useTheme";

function ForwardMessageDialog({
  open,
  onClose,
  onForward,
  friends = [],
  message,
}) {
  const { colors } = useTheme();
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFriends = useMemo(() => {
    if (!searchQuery.trim()) return friends;

    const query = searchQuery.toLowerCase();
    return friends.filter(
      (friend) =>
        friend.firstName?.toLowerCase().includes(query) ||
        friend.lastName?.toLowerCase().includes(query) ||
        friend.fullName?.toLowerCase().includes(query),
    );
  }, [friends, searchQuery]);

  const handleToggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  const handleForward = () => {
    if (selectedFriends.length > 0) {
      onForward(message.id, selectedFriends);
      setSelectedFriends([]);
      setSearchQuery("");
      onClose();
    }
  };

  const handleClose = () => {
    setSelectedFriends([]);
    setSearchQuery("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: colors.primary_bg,
          color: colors.primary_text,
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${colors.border_color}`,
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ForwardIcon sx={{ color: colors.primary_accent }} />
          <Typography variant="h6">Forward Message</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: colors.secondary_text }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {message && (
          <Box
            sx={{
              backgroundColor: colors.secondary_bg,
              borderLeft: `4px solid ${colors.primary_accent}`,
              p: 2,
              m: 2,
              borderRadius: "4px",
            }}
          >
            <Typography
              sx={{
                color: colors.secondary_text,
                fontSize: "12px",
                mb: 0.5,
              }}
            >
              Forwarding message:
            </Typography>
            <Typography
              sx={{
                color: colors.primary_text,
                fontSize: "14px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {message.content}
            </Typography>
          </Box>
        )}

        <Box sx={{ p: 2, pb: 1 }}>
          <TextField
            fullWidth
            placeholder="Search friends..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: colors.secondary_text }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: colors.input_bg,
                borderRadius: "8px",
                color: colors.primary_text,
                "& .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
              },
            }}
          />
        </Box>

        <List sx={{ maxHeight: 300, overflow: "auto", px: 1 }}>
          {filteredFriends.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center" }}>
              <Typography sx={{ color: colors.secondary_text }}>
                {searchQuery ? "No friends found" : "No friends available"}
              </Typography>
            </Box>
          ) : (
            filteredFriends.map((friend) => {
              const friendId = friend.id || friend.friendId;
              const friendName =
                friend.fullName ||
                `${friend.firstName || ""} ${friend.lastName || ""}`.trim() ||
                friend.friendName ||
                "Unknown";
              const isSelected = selectedFriends.includes(friendId);

              return (
                <ListItem
                  key={friendId}
                  onClick={() => handleToggleFriend(friendId)}
                  sx={{
                    cursor: "pointer",
                    borderRadius: "8px",
                    mb: 0.5,
                    "&:hover": {
                      backgroundColor: colors.hover_bg,
                    },
                    backgroundColor: isSelected
                      ? `${colors.primary_accent}1A`
                      : "transparent",
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    sx={{
                      color: colors.secondary_text,
                      "&.Mui-checked": {
                        color: colors.primary_accent,
                      },
                    }}
                  />
                  <ListItemAvatar>
                    <Avatar
                      src={friend.image || friend.friendImage}
                      sx={{
                        backgroundColor: getAvatarColor(friendId),
                        width: 40,
                        height: 40,
                      }}
                    >
                      {getInitials(friendName)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={friendName}
                    primaryTypographyProps={{
                      sx: { color: colors.primary_text, fontWeight: 500 },
                    }}
                  />
                </ListItem>
              );
            })
          )}
        </List>
      </DialogContent>

      <DialogActions
        sx={{
          borderTop: `1px solid ${colors.border_color}`,
          p: 2,
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ color: colors.secondary_text, fontSize: "14px" }}>
          {selectedFriends.length} selected
        </Typography>
        <Box>
          <Button
            onClick={handleClose}
            sx={{
              color: colors.secondary_text,
              mr: 1,
              "&:hover": {
                backgroundColor: colors.hover_bg,
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleForward}
            disabled={selectedFriends.length === 0}
            variant="contained"
            sx={{
              backgroundColor: colors.primary_accent,
              "&:hover": {
                backgroundColor: colors.primary_accent,
                filter: "brightness(0.9)",
              },
              "&.Mui-disabled": {
                backgroundColor: colors.border_color,
                color: colors.secondary_text,
              },
            }}
          >
            Forward ({selectedFriends.length})
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}

export default ForwardMessageDialog;
