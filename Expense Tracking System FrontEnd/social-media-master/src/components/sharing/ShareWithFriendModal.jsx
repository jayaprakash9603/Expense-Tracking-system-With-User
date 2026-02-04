/**
 * =============================================================================
 * ShareWithFriendModal - Step-wise Share with Friends Modal
 * =============================================================================
 *
 * Production-grade share with friends flow following MFA setup patterns:
 * Step 1: Select friends from list
 * Step 2: Add optional message & confirm
 *
 * @author Expense Tracking System
 * @version 2.0
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
  AlertTitle,
  CircularProgress,
  IconButton,
  Divider,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Grid,
} from "@mui/material";
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Send as SendIcon,
  Person as PersonIcon,
  Check as CheckIcon,
  CheckCircle as CheckCircleIcon,
  QrCode2 as QrCodeIcon,
  Message as MessageIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  People as PeopleIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { useTheme } from "../../hooks/useTheme";
import { shareWithFriend } from "../../Redux/Shares/shares.actions";
import { fetchFriends } from "../../Redux/Friends/friendsActions";

// =============================================================================
// Constants
// =============================================================================

const STEPS = ["Select Friends", "Add Message & Send"];

// =============================================================================
// Main Component
// =============================================================================

const ShareWithFriendModal = ({ open, onClose, share }) => {
  const dispatch = useDispatch();
  const { colors, mode } = useTheme();
  const isDark = mode === "dark";

  // Redux state
  const { friends = [], loadingFriends } = useSelector(
    (state) => state.friends || {},
  );

  // Step navigation state
  const [activeStep, setActiveStep] = useState(0);

  // Local state
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState("");
  const [sendingTo, setSendingTo] = useState(null);
  const [sentTo, setSentTo] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  // Load friends on open
  useEffect(() => {
    if (open && friends.length === 0) {
      dispatch(fetchFriends());
    }
  }, [open, friends.length, dispatch]);

  // Reset state on close
  useEffect(() => {
    if (!open) {
      setActiveStep(0);
      setSelectedFriends([]);
      setSearchTerm("");
      setMessage("");
      setSentTo([]);
      setSendingTo(null);
      setIsSending(false);
      setError("");
    }
  }, [open]);

  // Get current user ID
  const currentUserId = useSelector((state) => state.auth?.user?.id);

  // Extract friend user from friendship (the other person)
  const getFriendUser = useCallback(
    (friendship) => {
      if (!friendship) return null;
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
    setError("");
  };

  // Navigation handlers
  const handleNext = () => {
    if (activeStep === 0 && selectedFriends.length === 0) {
      setError("Please select at least one friend to share with");
      return;
    }
    setError("");
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError("");
    setActiveStep((prev) => prev - 1);
  };

  // Send share to selected friends
  const handleSendToFriends = async () => {
    if (selectedFriends.length === 0 || !share?.token || isSending) return;

    setIsSending(true);
    setError("");

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

  // =============================================================================
  // Step 1: Select Friends
  // =============================================================================
  const renderSelectFriendsStep = () => (
    <Box>
      {/* Share Info Card */}
      {share && (
        <Paper
          elevation={0}
          sx={{
            p: 2.5,
            mb: 3,
            backgroundColor: `${colors.accent}10`,
            border: `1px solid ${colors.accent}30`,
            borderRadius: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2,
                backgroundColor: colors.accent,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <QrCodeIcon sx={{ fontSize: 28, color: "#fff" }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: colors.primary_text }}
              >
                {share.shareName || `${share.resourceType} Share`}
              </Typography>
              <Typography variant="body2" sx={{ color: colors.secondary_text }}>
                {share.resourceCount || 0} items • {share.permission} access
              </Typography>
            </Box>
          </Box>
        </Paper>
      )}

      {/* Search Field */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search friends by name or email..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: colors.secondary_text }} />
            </InputAdornment>
          ),
          sx: {
            color: colors.primary_text,
            backgroundColor: colors.card_bg,
            borderRadius: 2,
            "& fieldset": { borderColor: colors.border },
          },
        }}
        sx={{ mb: 2 }}
      />

      {/* Selected Friends Preview */}
      {selectedFriends.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{ color: colors.secondary_text, mb: 1, display: "block" }}
          >
            Selected ({selectedFriends.length})
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {selectedFriends.map((friend) => (
              <Chip
                key={friend.id}
                avatar={
                  <Avatar
                    sx={{ width: 24, height: 24, bgcolor: colors.accent }}
                  >
                    {friend.firstName?.[0] || friend.email?.[0] || "?"}
                  </Avatar>
                }
                label={friend.firstName || friend.email}
                onDelete={() => handleToggleFriend(friend)}
                size="small"
                sx={{
                  backgroundColor: `${colors.accent}20`,
                  color: colors.primary_text,
                  "& .MuiChip-deleteIcon": { color: colors.secondary_text },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Friends List */}
      <Typography
        variant="subtitle2"
        sx={{ color: colors.secondary_text, mb: 1.5, fontWeight: 500 }}
      >
        Your Friends
      </Typography>

      {loadingFriends ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress size={36} sx={{ color: colors.accent }} />
        </Box>
      ) : filteredFriends.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            textAlign: "center",
            backgroundColor: colors.card_bg,
            border: `1px solid ${colors.border}`,
            borderRadius: 2,
          }}
        >
          <PeopleIcon
            sx={{ fontSize: 48, color: colors.secondary_text, mb: 1 }}
          />
          <Typography
            variant="body1"
            sx={{ color: colors.primary_text, mb: 0.5 }}
          >
            {searchTerm ? "No friends found" : "No friends yet"}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            {searchTerm
              ? "Try a different search term"
              : "Add some friends to share your data with them"}
          </Typography>
        </Paper>
      ) : (
        <List
          sx={{
            maxHeight: 280,
            overflow: "auto",
            border: `1px solid ${colors.border}`,
            borderRadius: 2,
            backgroundColor: colors.card_bg,
          }}
        >
          {filteredFriends.map((friend, index) => {
            const isSelected = selectedFriends.some((f) => f.id === friend.id);

            return (
              <ListItem
                key={friend.id}
                onClick={() => handleToggleFriend(friend)}
                sx={{
                  cursor: "pointer",
                  borderBottom:
                    index < filteredFriends.length - 1
                      ? `1px solid ${colors.border}`
                      : "none",
                  backgroundColor: isSelected
                    ? `${colors.accent}12`
                    : "transparent",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: isSelected
                      ? `${colors.accent}18`
                      : `${colors.accent}08`,
                  },
                }}
              >
                <Checkbox
                  checked={isSelected}
                  size="small"
                  sx={{
                    mr: 1,
                    color: colors.secondary_text,
                    "&.Mui-checked": { color: colors.accent },
                  }}
                />
                <ListItemAvatar>
                  <Avatar
                    src={friend.profileImage}
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: colors.accent,
                      border: isSelected
                        ? `2px solid ${colors.accent}`
                        : "none",
                    }}
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
                    sx: {
                      color: colors.primary_text,
                      fontWeight: isSelected ? 500 : 400,
                    },
                  }}
                  secondaryTypographyProps={{
                    sx: { color: colors.secondary_text, fontSize: "0.8rem" },
                  }}
                />
                {isSelected && (
                  <CheckCircleIcon
                    sx={{ color: colors.accent, fontSize: 22 }}
                  />
                )}
              </ListItem>
            );
          })}
        </List>
      )}
    </Box>
  );

  // =============================================================================
  // Step 2: Add Message & Send
  // =============================================================================
  const renderMessageStep = () => (
    <Box>
      {/* Summary Card */}
      <Paper
        elevation={0}
        sx={{
          p: 2.5,
          mb: 3,
          backgroundColor: colors.card_bg,
          border: `1px solid ${colors.border}`,
          borderRadius: 2,
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, display: "block", mb: 0.5 }}
            >
              Sharing
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <QrCodeIcon sx={{ fontSize: 18, color: colors.accent }} />
              <Typography
                variant="body2"
                sx={{ color: colors.primary_text, fontWeight: 500 }}
              >
                {share?.shareName || `${share?.resourceType} Share`}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Typography
              variant="caption"
              sx={{ color: colors.secondary_text, display: "block", mb: 0.5 }}
            >
              With
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PeopleIcon sx={{ fontSize: 18, color: colors.accent }} />
              <Typography
                variant="body2"
                sx={{ color: colors.primary_text, fontWeight: 500 }}
              >
                {selectedFriends.length} friend
                {selectedFriends.length !== 1 ? "s" : ""}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Selected Friends */}
      <Typography
        variant="subtitle2"
        sx={{ color: colors.secondary_text, mb: 1.5, fontWeight: 500 }}
      >
        Recipients
      </Typography>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
        {selectedFriends.map((friend) => {
          const isSent = sentTo.includes(friend.id);
          const isSendingThis = sendingTo === friend.id;

          return (
            <Chip
              key={friend.id}
              avatar={
                isSendingThis ? (
                  <CircularProgress size={20} sx={{ color: "#fff" }} />
                ) : isSent ? (
                  <CheckCircleIcon sx={{ color: "#fff", fontSize: 20 }} />
                ) : (
                  <Avatar
                    sx={{
                      width: 24,
                      height: 24,
                      bgcolor: "#fff",
                      color: colors.accent,
                    }}
                  >
                    {friend.firstName?.[0] || friend.email?.[0] || "?"}
                  </Avatar>
                )
              }
              label={friend.firstName || friend.email}
              sx={{
                backgroundColor: isSent ? colors.success : colors.accent,
                color: "#fff",
                fontWeight: 500,
                "& .MuiChip-avatar": { color: isSent ? "#fff" : colors.accent },
              }}
            />
          );
        })}
      </Box>

      {/* Message Input */}
      <Typography
        variant="subtitle2"
        sx={{ color: colors.secondary_text, mb: 1.5, fontWeight: 500 }}
      >
        Personal Message (Optional)
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={3}
        placeholder="Add a personal message to your friends..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={isSending || allSent}
        InputProps={{
          sx: {
            color: colors.primary_text,
            backgroundColor: colors.card_bg,
            borderRadius: 2,
            "& fieldset": { borderColor: colors.border },
          },
        }}
        sx={{ mb: 3 }}
      />

      {/* Info Alert */}
      {!allSent && (
        <Alert
          severity="info"
          icon={<SendIcon sx={{ color: colors.accent }} />}
          sx={{
            backgroundColor: `${colors.accent}10`,
            border: `1px solid ${colors.accent}30`,
            "& .MuiAlert-message": { color: colors.primary_text },
          }}
        >
          <AlertTitle sx={{ fontWeight: 600, color: colors.primary_text }}>
            How it works
          </AlertTitle>
          Your friends will receive a notification with the share link. They can
          view the shared data by clicking the notification.
        </Alert>
      )}

      {/* Success State */}
      {allSent && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon />}
          sx={{
            backgroundColor: `${colors.success}15`,
            border: `1px solid ${colors.success}40`,
            "& .MuiAlert-message": { color: colors.primary_text },
          }}
        >
          <AlertTitle sx={{ fontWeight: 600, color: colors.primary_text }}>
            All Done!
          </AlertTitle>
          Your share has been sent to all selected friends. They will receive a
          notification shortly.
        </Alert>
      )}
    </Box>
  );

  // =============================================================================
  // Main Render
  // =============================================================================
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.75)"
              : "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
          },
        },
      }}
      PaperProps={{
        sx: {
          backgroundColor: colors.modal_bg,
          color: colors.primary_text,
          borderRadius: 3,
          width: 580,
          maxWidth: "95vw",
          height: 680,
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: isDark
            ? "0 24px 48px rgba(0, 0, 0, 0.4)"
            : "0 24px 48px rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      {/* Header */}
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: `1px solid ${colors.border}`,
          pb: 2,
          backgroundColor: colors.card_bg,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              backgroundColor: colors.accent,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SendIcon sx={{ color: "#fff", fontSize: 20 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
              Share with Friends
            </Typography>
            <Typography variant="caption" sx={{ color: colors.secondary_text }}>
              Send directly to your connections
            </Typography>
          </Box>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: colors.secondary_text }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Stepper */}
      <Box sx={{ px: 3, pt: 2.5, pb: 1, backgroundColor: colors.modal_bg }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {STEPS.map((label, index) => (
            <Step key={label}>
              <StepLabel
                sx={{
                  "& .MuiStepLabel-label": {
                    color:
                      index <= activeStep
                        ? colors.primary_text
                        : colors.secondary_text,
                    fontWeight: index === activeStep ? 600 : 400,
                    fontSize: "0.85rem",
                  },
                  "& .MuiStepIcon-root": {
                    color:
                      index < activeStep
                        ? colors.success
                        : index === activeStep
                          ? colors.accent
                          : colors.border,
                    "&.Mui-completed": { color: colors.success },
                    "&.Mui-active": { color: colors.accent },
                  },
                }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      </Box>

      {/* Content */}
      <DialogContent sx={{ pt: 2.5, pb: 1, minHeight: 380 }}>
        {/* Error Alert */}
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        {/* Step Content */}
        {activeStep === 0 && renderSelectFriendsStep()}
        {activeStep === 1 && renderMessageStep()}
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2.5,
          borderTop: `1px solid ${colors.border}`,
          backgroundColor: colors.card_bg,
          gap: 1,
        }}
      >
        {activeStep === 0 ? (
          <>
            <Button
              onClick={onClose}
              sx={{ color: colors.secondary_text, textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={selectedFriends.length === 0}
              endIcon={<ArrowForwardIcon />}
              sx={{
                backgroundColor: colors.accent,
                textTransform: "none",
                fontWeight: 500,
                px: 3,
                "&:hover": { backgroundColor: colors.accent_hover },
                "&:disabled": {
                  backgroundColor: colors.border,
                  color: colors.secondary_text,
                },
              }}
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleBack}
              disabled={isSending}
              startIcon={<ArrowBackIcon />}
              sx={{ color: colors.secondary_text, textTransform: "none" }}
            >
              Back
            </Button>
            <Box sx={{ flex: 1 }} />
            {allSent ? (
              <Button
                variant="contained"
                onClick={onClose}
                startIcon={<CheckCircleIcon />}
                sx={{
                  backgroundColor: colors.success,
                  textTransform: "none",
                  fontWeight: 500,
                  px: 3,
                  "&:hover": { backgroundColor: colors.success },
                }}
              >
                Done
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSendToFriends}
                disabled={isSending}
                startIcon={
                  isSending ? (
                    <CircularProgress size={18} sx={{ color: "#fff" }} />
                  ) : (
                    <SendIcon />
                  )
                }
                sx={{
                  backgroundColor: colors.accent,
                  textTransform: "none",
                  fontWeight: 500,
                  px: 3,
                  "&:hover": { backgroundColor: colors.accent_hover },
                }}
              >
                {isSending
                  ? "Sending..."
                  : `Send to ${selectedFriends.length} Friend${selectedFriends.length !== 1 ? "s" : ""}`}
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ShareWithFriendModal;
