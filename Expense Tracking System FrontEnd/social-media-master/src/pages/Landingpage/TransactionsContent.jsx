import React from "react";
import { Box, Typography, Divider, IconButton } from "@mui/material";
import {
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import HistoryTable from "./HistoryTable";

const TransactionsContent = () => {
  return (
    <>
      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b] "></div>
      <Box
        sx={{
          bgcolor: "#0b0b0b",
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          borderRadius: "8px",
          border: "1px solid #000",
          p: 2,
          mr: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography
            variant="h3"
            sx={{ color: "#ffffff", fontWeight: "bold" }}
          >
            History
          </Typography>
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
        </Box>
        <Divider sx={{ borderColor: "#28282a", my: 1 }} />
        <Box sx={{ flex: 1, bgcolor: "#0b0b0b" }}>
          <HistoryTable />
        </Box>
      </Box>
    </>
  );
};

export default TransactionsContent;
