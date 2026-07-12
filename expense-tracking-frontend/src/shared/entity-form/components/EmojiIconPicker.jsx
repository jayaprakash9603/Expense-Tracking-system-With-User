import React, { useState } from "react";
import { Box, FormControl, Tabs, Tab } from "@mui/material";

export default function EmojiIconPicker({
  iconCategories,
  selectedIcon,
  onIconSelect,
  accentColor,
  colors,
  height = "200px",
  iconSize = "45px",
}) {
  const [currentTab, setCurrentTab] = useState(0);
  const categoryNames = Object.keys(iconCategories);
  const currentIcons = iconCategories[categoryNames[currentTab]] || [];

  return (
    <FormControl fullWidth>
      <Box
        sx={{
          border: `1px solid ${colors.border_color}`,
          borderRadius: 1,
          height,
          display: "flex",
          flexDirection: "column",
          backgroundColor: colors.secondary_bg,
        }}
      >
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          ScrollButtonComponent={(props) => {
            const { direction, ...other } = props;
            return (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  borderRadius:
                    direction === "left" ? "0 4px 0 0" : "4px 0 0 0",
                  width: 28,
                  height: 40,
                  "&:hover": { backgroundColor: `${accentColor}33` },
                  transition: "background-color 0.3s",
                }}
                {...other}
              >
                <Box
                  component="div"
                  sx={{
                    width: 0,
                    height: 0,
                    borderTop: "6px solid transparent",
                    borderBottom: "6px solid transparent",
                    ...(direction === "left"
                      ? { borderRight: `6px solid ${accentColor}` }
                      : { borderLeft: `6px solid ${accentColor}` }),
                  }}
                />
              </Box>
            );
          }}
          sx={{
            borderBottom: 1,
            borderColor: colors.border_color,
            "& .MuiTab-root": {
              color: colors.icon_muted,
              "&.Mui-selected": { color: accentColor },
              minHeight: "40px",
              padding: "8px 12px",
              fontSize: "0.85rem",
            },
            "& .MuiTabs-indicator": { backgroundColor: accentColor },
            "& .MuiTabs-scrollButtons": {
              color: accentColor,
              "&.Mui-disabled": { opacity: 0.3 },
            },
          }}
        >
          {categoryNames.map((category, index) => (
            <Tab
              key={index}
              label={category}
              sx={{
                textTransform: "none",
                fontWeight: currentTab === index ? "bold" : "normal",
                transition: "all 0.2s",
              }}
            />
          ))}
        </Tabs>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: 1,
            p: 1.5,
            overflowY: "auto",
            flex: 1,
            "&::-webkit-scrollbar": { width: "6px" },
            "&::-webkit-scrollbar-track": {
              background: colors.hover_bg,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: `${accentColor}66`,
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: accentColor,
            },
          }}
        >
          {currentIcons.map((emoji, idx) => (
            <Box
              key={idx}
              onClick={() => onIconSelect(emoji)}
              sx={{
                width: iconSize,
                height: iconSize,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                border:
                  selectedIcon === emoji
                    ? `2px solid ${accentColor}`
                    : `1px solid ${colors.border_color}`,
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.8,
                  backgroundColor: colors.hover_bg,
                },
                backgroundColor:
                  selectedIcon === emoji
                    ? `${accentColor}33`
                    : "transparent",
                position: "relative",
                transition: "all 0.2s ease",
                "&::after":
                  selectedIcon === emoji
                    ? {
                        content: '""',
                        position: "absolute",
                        bottom: "-3px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: "5px",
                        height: "5px",
                        borderRadius: "50%",
                        backgroundColor: accentColor,
                      }
                    : {},
              }}
            >
              <span style={{ fontSize: "24px" }}>{emoji}</span>
            </Box>
          ))}
        </Box>
      </Box>
    </FormControl>
  );
}
