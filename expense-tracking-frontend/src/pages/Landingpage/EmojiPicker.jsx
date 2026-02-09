import React, { useState, useRef, useEffect } from "react";
import {
  Box,
  Tabs,
  Tab,
  IconButton,
  Typography,
  Button,
  Paper,
  useTheme,
} from "@mui/material";
import {
  ChevronLeft,
  ChevronRight,
  Close,
  SentimentSatisfiedAlt,
  Pets,
  Restaurant,
  SportsBaseball,
  PhoneAndroid,
  Favorite,
} from "@mui/icons-material";

// Emoji data
import { emojiCategories } from "./emojiCategories"; // Adjust the import path as necessary

const EmojiPicker = ({
  isVisible,
  onEmojiSelect,
  onClose,
  position = "bottom-full",
  className = "",
}) => {
  const theme = useTheme();
  const [selectedCategory, setSelectedCategory] = useState(0);
  const [tabScrollPosition, setTabScrollPosition] = useState(0);
  const emojiPickerRef = useRef(null);
  const tabsContainerRef = useRef(null);

  const categoryKeys = Object.keys(emojiCategories);
  const maxTabScroll = Math.max(0, categoryKeys.length - 4); // Show 4 tabs at a time

  // Close emoji picker on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest(".emoji-trigger")
      ) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isVisible, onClose]);

  // Handle emoji selection
  const handleEmojiClick = (emoji) => {
    onEmojiSelect(emoji);
  };

  // Handle category change
  const handleCategoryChange = (event, newValue) => {
    setSelectedCategory(newValue);
  };

  // Handle tab navigation
  const handleTabNavigation = (direction) => {
    if (direction === "left" && tabScrollPosition > 0) {
      setTabScrollPosition(tabScrollPosition - 1);
    } else if (direction === "right" && tabScrollPosition < maxTabScroll) {
      setTabScrollPosition(tabScrollPosition + 1);
    }
  };

  // Get category icons
  const getCategoryIcon = (index) => {
    const icons = [
      <SentimentSatisfiedAlt />,
      <Pets />,
      <Restaurant />,
      <SportsBaseball />,
      <PhoneAndroid />,
      <Favorite />,
    ];
    return icons[index] || <SentimentSatisfiedAlt />;
  };

  if (!isVisible) return null;

  return (
    <Paper
      ref={emojiPickerRef}
      elevation={8}
      sx={{
        position: "absolute",
        bottom: "100%",
        right: 0,
        mb: 1,
        width: 320,
        maxHeight: 600,
        borderRadius: 2,
        overflow: "hidden",
        overflowY: "auto",
        overflowX: "hidden",
        backgroundColor: "#2a2a2a",
        border: "1px solid #404040",
        zIndex: 50,
      }}
      className={className}
    >
      {/* Header with navigation and close button */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1,
          py: 0.5,
          backgroundColor: "#1f1f1f",
          borderBottom: "1px solid #404040",
        }}
      >
        {/* Tab Navigation */}
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <IconButton
            size="small"
            onClick={() => handleTabNavigation("left")}
            disabled={tabScrollPosition === 0}
            sx={{
              color: "#9ca3af",
              "&:hover": { backgroundColor: "#404040" },
              "&:disabled": { color: "#6b7280" },
            }}
          >
            <ChevronLeft fontSize="small" />
          </IconButton>

          {/* Tabs Container */}
          <Box
            ref={tabsContainerRef}
            sx={{
              flex: 1,
              overflow: "hidden",
              mx: 0.5,
            }}
          >
            <Tabs
              value={selectedCategory}
              onChange={handleCategoryChange}
              variant="scrollable"
              scrollButtons={false}
              sx={{
                minHeight: 40,
                "& .MuiTabs-flexContainer": {
                  transform: `translateX(-${tabScrollPosition * 60}px)`,
                  transition: "transform 0.3s ease",
                },
                "& .MuiTab-root": {
                  minWidth: 50,
                  minHeight: 40,
                  padding: "6px 8px",
                  color: "#9ca3af",
                  "&.Mui-selected": {
                    color: "#14b8a6",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#14b8a6",
                  height: 2,
                },
              }}
            >
              {categoryKeys.map((category, index) => (
                <Tab
                  key={category}
                  icon={getCategoryIcon(index)}
                  title={category}
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: "1.2rem",
                    },
                  }}
                />
              ))}
            </Tabs>
          </Box>

          <IconButton
            size="small"
            onClick={() => handleTabNavigation("right")}
            disabled={tabScrollPosition >= maxTabScroll}
            sx={{
              color: "#9ca3af",
              "&:hover": { backgroundColor: "#404040" },
              "&:disabled": { color: "#6b7280" },
            }}
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </Box>

        {/* Close Button */}
        <IconButton
          size="small"
          onClick={onClose}
          sx={{
            color: "#9ca3af",
            "&:hover": { backgroundColor: "#404040", color: "#ffffff" },
          }}
        >
          <Close fontSize="small" />
        </IconButton>
      </Box>

      {/* Category Title */}
      <Box
        sx={{
          px: 2,
          py: 1,
          backgroundColor: "#1f1f1f",
          borderBottom: "1px solid #404040",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "#e5e7eb",
            fontWeight: 500,
            fontSize: "0.875rem",
          }}
        >
          {categoryKeys[selectedCategory]}
        </Typography>
      </Box>

      {/* Emoji Grid */}
      <Box
        sx={{
          p: 2,
          maxHeight: 300,
          overflowY: "auto",
          width: 370,
          backgroundColor: "#2a2a2a",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "#1f1f1f",
            borderRadius: "4px",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "#14b8a6",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "#0d9488",
            },
          },
          "&::-webkit-scrollbar-thumb:active": {
            backgroundColor: "#0f766e",
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(8, 1fr)",
            gap: 1,
          }}
        >
          {emojiCategories[categoryKeys[selectedCategory]].map(
            (emoji, index) => (
              <IconButton
                key={`${categoryKeys[selectedCategory]}-${index}`}
                onClick={() => handleEmojiClick(emoji)}
                sx={{
                  width: 32,
                  height: 32,
                  fontSize: "1.25rem",
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "#404040",
                    transform: "scale(1.1)",
                  },
                  "&:focus": {
                    outline: "2px solid #14b8a6",
                    outlineOffset: "2px",
                  },
                  transition: "all 0.2s ease",
                }}
                title={emoji}
              >
                {emoji}
              </IconButton>
            )
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          px: 2,
          py: 1,
          backgroundColor: "#1f1f1f",
          borderTop: "1px solid #404040",
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: "#9ca3af",
            fontSize: "0.75rem",
          }}
        >
          {emojiCategories[categoryKeys[selectedCategory]].length} emojis
        </Typography>
        <Button
          size="small"
          onClick={onClose}
          sx={{
            color: "#9ca3af",
            fontSize: "0.75rem",
            textTransform: "none",
            minWidth: "auto",
            px: 1,
            py: 0.5,
            "&:hover": {
              backgroundColor: "#404040",
              color: "#ffffff",
            },
          }}
        >
          Close
        </Button>
      </Box>
    </Paper>
  );
};

export default EmojiPicker;
