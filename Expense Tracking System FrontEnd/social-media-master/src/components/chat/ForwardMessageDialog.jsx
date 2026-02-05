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

function ForwardMessageDialog({
  open,
  onClose,
  onForward,
  friends = [],
  message,
}) {
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
          backgroundColor: "#202c33",
          color: "#e9edef",
          borderRadius: "12px",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #374045",
          pb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ForwardIcon sx={{ color: "#00a884" }} />
          <Typography variant="h6">Forward Message</Typography>
        </Box>
        <IconButton onClick={handleClose} sx={{ color: "#8696a0" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {message && (
          <Box
            sx={{
              backgroundColor: "#1f2c33",
              borderLeft: "4px solid #00a884",
              p: 2,
              m: 2,
              borderRadius: "4px",
            }}
          >
            <Typography
              sx={{
                color: "#8696a0",
                fontSize: "12px",
                mb: 0.5,
              }}
            >
              Forwarding message:
            </Typography>
            <Typography
              sx={{
                color: "#e9edef",
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
                  <SearchIcon sx={{ color: "#8696a0" }} />
                </InputAdornment>
              ),
              sx: {
                backgroundColor: "#2a3942",
                borderRadius: "8px",
                color: "#e9edef",
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
              <Typography sx={{ color: "#8696a0" }}>
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
                      backgroundColor: "#2a3942",
                    },
                    backgroundColor: isSelected
                      ? "rgba(0, 168, 132, 0.1)"
                      : "transparent",
                  }}
                >
                  <Checkbox
                    checked={isSelected}
                    sx={{
                      color: "#8696a0",
                      "&.Mui-checked": {
                        color: "#00a884",
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
                      sx: { color: "#e9edef", fontWeight: 500 },
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
          borderTop: "1px solid #374045",
          p: 2,
          justifyContent: "space-between",
        }}
      >
        <Typography sx={{ color: "#8696a0", fontSize: "14px" }}>
          {selectedFriends.length} selected
        </Typography>
        <Box>
          <Button
            onClick={handleClose}
            sx={{
              color: "#8696a0",
              mr: 1,
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.05)",
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
              backgroundColor: "#00a884",
              "&:hover": {
                backgroundColor: "#008c6f",
              },
              "&.Mui-disabled": {
                backgroundColor: "#374045",
                color: "#8696a0",
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
