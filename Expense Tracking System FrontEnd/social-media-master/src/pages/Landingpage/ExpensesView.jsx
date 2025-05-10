import React from "react";
import { Box, Typography, Divider, IconButton, Button } from "@mui/material";
import {
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";
import ExpensesTable from "./ExpensesTable";

const ExpensesView = ({ onNewExpenseClick }) => {
  return (
    <>
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
            Expenses
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Button
              onClick={onNewExpenseClick}
              sx={{
                bgcolor: "#00dac6",
                color: "#000000",
                fontWeight: "bold",
                px: 2,
                py: 1,
                borderRadius: "4px",
                "&:hover": {
                  bgcolor: "#00b8a0",
                },
              }}
            >
              + New Expense
            </Button>
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
          <ExpensesTable />
        </Box>
      </Box>
    </>
  );
};

export default ExpensesView;
