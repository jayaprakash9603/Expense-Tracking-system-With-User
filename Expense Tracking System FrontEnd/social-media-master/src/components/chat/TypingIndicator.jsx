import React from "react";
import { Box, keyframes } from "@mui/material";

const bounce = keyframes`
  0%, 60%, 100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-4px);
  }
`;

function TypingIndicator() {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        padding: "8px 12px",
        backgroundColor: "#202c33",
        borderRadius: "7.5px",
        borderTopLeftRadius: 0,
        width: "fit-content",
        marginLeft: "63px",
        marginBottom: "2px",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          padding: "4px 0",
        }}
      >
        {[0, 1, 2].map((index) => (
          <Box
            key={index}
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#8696a0",
              animation: `${bounce} 1.4s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}

export default TypingIndicator;
