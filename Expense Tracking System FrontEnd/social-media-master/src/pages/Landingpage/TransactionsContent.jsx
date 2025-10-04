import React from "react";
import {
  Box,
  Typography,
  Divider,
  IconButton,
  useMediaQuery,
} from "@mui/material";
import {
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import HistoryTable from "./HistoryTable";
import { useNavigate, useParams } from "react-router";

const TransactionsContent = () => {
  // Check if the screen size is small
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const { friendId } = useParams();
  const navigate = useNavigate();

  return (
    <>
      {/* <div className="w-[calc(100vw-350px)] h-[50px] bg-[#0b0b0b] sm:bg-[#1b1b1b]"></div> */}

      <Box
        sx={{
          bgcolor: "#0b0b0b",
          width: isSmallScreen ? "100vw" : "calc(100vw - 370px)", // Full width on small screens
          height: "calc(100vh - 100px)",
          borderRadius: "8px",
          border: "1px solid #000",
          p: 2,
          mr: isSmallScreen ? 0 : "20px", // Remove margin on small screens
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: isSmallScreen ? "center" : "space-between", // Center text on small screens
            alignItems: "center",
            mb: 1,
            flexDirection: isSmallScreen ? "column" : "row", // Stack the items on small screens
            gap: isSmallScreen ? 2 : 0, // Add space between elements on small screens
          }}
        >
          <IconButton
            sx={{
              color: "#00DAC6",
              backgroundColor: "#1b1b1b",
              "&:hover": {
                backgroundColor: "#28282a",
              },
              zIndex: 10,
            }}
            onClick={() =>
              friendId && friendId !== "undefined"
                ? navigate(`/friends/expenses/${friendId}`)
                : navigate("/expenses")
            }
            aria-label="Back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="#00DAC6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>
          <Typography
            variant={isSmallScreen ? "h5" : "h3"} // Reduce font size on small screens
            sx={{ color: "#ffffff", fontWeight: "bold" }}
          >
            History
          </Typography>
          {!isSmallScreen && ( // Conditionally render icons on larger screens
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <IconButton sx={{ color: "#00dac6", bgcolor: "#1b1b1b" }}>
                <FilterListIcon />
              </IconButton>
              <IconButton sx={{ color: "#00dac6", bgcolor: "#1b1b1b" }}>
                <FilterListIcon />
              </IconButton>
              <IconButton sx={{ color: "#00dac6", bgcolor: "#1b1b1b" }}>
                <MoreVertIcon />
              </IconButton>
            </Box>
          )}
        </Box>
        <Divider sx={{ borderColor: "#28282a", my: 1 }} />
        <Box sx={{ flex: 1, bgcolor: "#0b0b0b" }}>
          <HistoryTable friendId={friendId} />
        </Box>
      </Box>
    </>
  );
};

export default TransactionsContent;
