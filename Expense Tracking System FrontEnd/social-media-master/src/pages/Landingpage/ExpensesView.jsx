import React from "react";
import { Box, Typography, Divider, IconButton, Button } from "@mui/material";
import {
  FilterList as FilterListIcon,
  MoreVert as MoreVertIcon,
  Add as AddIcon,
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
          "@media (max-width: 640px)": {
            width: "100vw",
            height: "auto",
            mr: 0,
            p: 1,
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
            "@media (max-width: 640px)": {
              flexDirection: "column",
              alignItems: "flex-start",
              gap: 2,
            },
          }}
        >
          <Typography
            variant="h3"
            sx={{
              color: "#ffffff",
              fontWeight: "bold",
              "@media (max-width: 640px)": {
                flexDirection: "column",
                alignItems: "stretch",
                margin: "auto",
                gap: 2,
              },
            }}
          >
            Expenses
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              "@media (max-width: 640px)": {
                gap: 2,
                flexWrap: "wrap",
                width: "100%",
                justifyContent: "flex-end", // Align plus icon to the right
              },
            }}
          >
            <Button
              onClick={onNewExpenseClick}
              aria-label="Add new expense"
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
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                "@media (max-width: 640px)": {
                  width: "40px",
                  minWidth: "40px",
                  height: "40px",
                  p: 0,
                  "& .button-text": {
                    display: "none",
                  },
                  "& .button-icon": {
                    display: "block",
                    fontSize: "1.25rem",
                  },
                },
              }}
            >
              <span className="button-text">+ New Expense</span>
              <AddIcon
                className="button-icon"
                sx={{
                  display: "none",
                  "@media (max-width: 640px)": {
                    display: "block",
                  },
                }}
              />
            </Button>
            <IconButton
              sx={{
                color: "#00dac6",
                bgcolor: "#1b1b1b",
                "@media (max-width: 640px)": {
                  display: "none",
                },
              }}
            >
              <FilterListIcon />
            </IconButton>
            <IconButton
              sx={{
                color: "#00dac6",
                bgcolor: "#1b1b1b",
                "@media (max-width: 640px)": {
                  display: "none",
                },
              }}
            >
              <MoreVertIcon />
            </IconButton>
          </Box>
        </Box>
        <Divider
          sx={{
            borderColor: "#28282a",
            my: 1,
            "@media (max-width: 640px)": {
              my: 2,
            },
          }}
        />
        <Box
          sx={{
            flex: 1,
            bgcolor: "#0b0b0b",
            "@media (max-width: 640px)": {
              flex: "none",
              width: "100%",
              overflowX: "auto",
            },
          }}
        >
          <ExpensesTable />
        </Box>
      </Box>
    </>
  );
};

export default ExpensesView;
