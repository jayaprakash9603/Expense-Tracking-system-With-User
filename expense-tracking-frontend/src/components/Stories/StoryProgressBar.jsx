/**
 * StoryProgressBar Component
 * Instagram-style segmented progress bar at the top of story viewer
 */
import React from "react";
import { Box } from "@mui/material";

const StoryProgressBar = ({ stories, currentIndex, progress }) => {
  return (
    <Box
      sx={{
        display: "flex",
        gap: "4px",
        padding: "12px 12px 0 12px",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }}
    >
      {stories.map((story, index) => (
        <Box
          key={story.id}
          sx={{
            flex: 1,
            height: 3,
            borderRadius: 2,
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              height: "100%",
              backgroundColor: "#fff",
              borderRadius: 2,
              width:
                index < currentIndex
                  ? "100%"
                  : index === currentIndex
                    ? `${progress}%`
                    : "0%",
              transition:
                index === currentIndex ? "width 50ms linear" : "width 0ms",
            }}
          />
        </Box>
      ))}
    </Box>
  );
};

export default StoryProgressBar;
