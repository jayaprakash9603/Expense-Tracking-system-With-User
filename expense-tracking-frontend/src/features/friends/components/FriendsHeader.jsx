import React, { useRef, useState, useEffect } from "react";
import {
  Box,
  Typography,
  InputBase,
  IconButton,
  Button,
  useMediaQuery,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AssessmentIcon from "@mui/icons-material/Assessment";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useTheme } from "../../../hooks/useTheme";
import { useTranslation } from "../../../hooks/useTranslation";
import FriendAvatar from "./shared/FriendAvatar";
import { useCurrentUserId } from "../hooks/useFriendDisplay";
import { resolveFriendDisplay } from "../utils/resolveFriendDisplay";

const FriendsHeader = ({
  searchQuery,
  onSearchChange,
  onSelectFriend,
}) => {
  const { colors, mode } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:768px)");
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [localSelectedIndex, setLocalSelectedIndex] = useState(0);
  
  const isDark = mode === "dark";

  const friends = useSelector((state) => state.friends?.friends || []);
  const currentUserId = useCurrentUserId();
  const unknownLabel = t("friends.unknownUser");

  const suggestions = React.useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];
    const lowerQuery = searchQuery.toLowerCase();
    return friends.filter((friend) => {
      const display = resolveFriendDisplay(friend, { currentUserId, unknownLabel });
      const name = display.displayName.toLowerCase();
      const email = (display.email || "").toLowerCase();
      return name.includes(lowerQuery) || email.includes(lowerQuery);
    }).slice(0, 5);
  }, [friends, searchQuery, currentUserId, unknownLabel]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        if (isExpanded && !searchQuery) {
          setIsExpanded(false);
        }
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isExpanded, searchQuery]);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleClose = () => {
    onSearchChange("");
    setIsExpanded(false);
    setIsFocused(false);
    setLocalSelectedIndex(0);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      handleClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setLocalSelectedIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setLocalSelectedIndex(prev => 
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions[localSelectedIndex]) {
        onSelectFriend?.(suggestions[localSelectedIndex]);
        handleClose();
      }
    }
  };

  const showDropdown = isExpanded && isFocused && searchQuery.length >= 2;

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: { xs: 1, sm: 2 },
        pb: { xs: 1, sm: 2 },
        flexDirection: isMobile ? "column" : "row",
      }}
    >
      <Typography
        variant={isMobile ? "h6" : "h5"}
        sx={{
          color: colors.primary_text,
          flexShrink: 0,
          alignSelf: isMobile ? "flex-start" : "center",
        }}
      >
        {t("friends.title")}
      </Typography>
      
      <Box sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        ml: isMobile ? 0 : "auto",
        width: isMobile ? "100%" : "auto",
        justifyContent: isMobile ? "stretch" : "flex-end",
      }}>
        <Box
          ref={containerRef}
          sx={{
            position: "relative",
            display: "flex",
            justifyContent: "flex-end",
            flex: isMobile ? 1 : "none",
            width: isMobile ? "auto" : (isExpanded ? "300px" : "auto"),
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <Box
            onClick={!isExpanded ? handleExpand : undefined}
            sx={{
              display: "flex",
              alignItems: "center",
              borderRadius: "8px",
              backgroundColor: isExpanded ? "transparent" : colors.button_inactive,
              border: `1px solid ${isExpanded ? colors.border_color : "transparent"}`,
              cursor: isExpanded ? "text" : "pointer",
              width: "100%",
              height: "36px",
              overflow: "hidden",
              "&:focus-within": {
                borderColor: colors.primary_accent,
              },
              "&:hover": {
                backgroundColor: isExpanded ? "transparent" : colors.hover_bg,
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: isExpanded ? "36px" : "auto",
                height: "36px",
                px: isExpanded ? 0 : 1,
                gap: "6px",
              }}
            >
              <SearchIcon sx={{ fontSize: "20px", color: colors.icon_default }} />
            </Box>
            
            {isExpanded && (
              <>
                <InputBase
                  inputRef={inputRef}
                  value={searchQuery}
                  onChange={(e) => {
                    onSearchChange(e.target.value);
                    setLocalSelectedIndex(0);
                  }}
                  onFocus={() => setIsFocused(true)}
                  onKeyDown={handleKeyDown}
                  placeholder={t("friends.search.placeholder")}
                  sx={{
                    flex: 1,
                    fontSize: "13px",
                    color: colors.primary_text,
                    "& input": {
                      padding: 0,
                      "&::placeholder": {
                        color: colors.placeholder_text,
                        opacity: 1,
                      },
                    },
                  }}
                />

                {searchQuery && (
                  <IconButton
                    size="small"
                    onClick={handleClose}
                    sx={{
                      mr: 0.5,
                      p: 0.5,
                      color: colors.icon_muted,
                      "&:hover": { backgroundColor: colors.hover_bg },
                    }}
                  >
                    <CloseIcon sx={{ fontSize: "16px" }} />
                  </IconButton>
                )}
              </>
            )}
          </Box>

          {showDropdown && (
            <Paper
              elevation={8}
              sx={{
                position: "absolute",
                top: "calc(100% + 8px)",
                right: isMobile ? "auto" : 0,
                left: isMobile ? 0 : "auto",
                width: isMobile ? "100%" : "300px",
                maxWidth: "100vw",
                maxHeight: "300px",
                overflowY: "auto",
                borderRadius: "12px",
                backgroundColor: isDark ? "#121212" : "#fff",
                border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(0, 0, 0, 0.08)"}`,
                zIndex: 1300,
                padding: 0,
              }}
            >
              {suggestions.length === 0 ? (
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography sx={{ color: colors.secondary_text, fontSize: "13px" }}>
                    {t("friends.search.noResults", "No friends found")}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ py: 1 }}>
                  {suggestions.map((friend, idx) => {
                    const display = resolveFriendDisplay(friend, { currentUserId, unknownLabel });
                    const isSelected = localSelectedIndex === idx;

                    return (
                      <Box
                        key={friend.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          onSelectFriend?.(friend);
                          handleClose();
                        }}
                        onMouseEnter={() => setLocalSelectedIndex(idx)}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          px: 2,
                          py: 1,
                          cursor: "pointer",
                          backgroundColor: isSelected ? colors.hover_bg : "transparent",
                          transition: "background-color 200ms ease",
                          "&:hover": {
                            backgroundColor: colors.hover_bg,
                          },
                        }}
                      >
                        <FriendAvatar display={display} user={display.user} size={28} />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography noWrap sx={{ fontSize: "13px", fontWeight: 500, color: colors.primary_text }}>
                            {display.displayName}
                          </Typography>
                          {display.email && (
                            <Typography noWrap sx={{ fontSize: "11px", color: colors.secondary_text }}>
                              {display.email}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Paper>
          )}
        </Box>
        
        <Button
          variant="outlined"
          onClick={() => navigate("/friends/activity")}
          title={t("friends.activity", "Friend Activity")}
          sx={{
            borderColor: colors.border_color,
            color: colors.primary_text,
            minWidth: "36px",
            width: "36px",
            height: "36px",
            flexShrink: 0,
            p: 0,
            "&:hover": {
              borderColor: colors.primary_accent,
              backgroundColor: colors.hover_bg,
            },
          }}
        >
          <HistoryIcon sx={{ fontSize: "20px" }} />
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate("/friends/report")}
          title={t("friends.sections.report", "Report")}
          sx={{
            borderColor: colors.border_color,
            color: colors.primary_text,
            minWidth: "36px",
            width: "36px",
            height: "36px",
            flexShrink: 0,
            p: 0,
            "&:hover": {
              borderColor: colors.primary_accent,
              backgroundColor: colors.hover_bg,
            },
          }}
        >
          <AssessmentIcon sx={{ fontSize: "20px" }} />
        </Button>
      </Box>
    </Box>
  );
};

export default FriendsHeader;
