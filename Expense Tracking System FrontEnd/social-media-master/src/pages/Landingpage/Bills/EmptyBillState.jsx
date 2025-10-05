import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Receipt as ReceiptIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router";

const EmptyBillState = ({ selectedDate, hasWriteAccess }) => {
  const navigate = useNavigate();
  const { friendId } = useParams();

  const handleCreateBill = () => {
    const createRoute = friendId ? `/bill/create/${friendId}` : "/bill/create";
    navigate(createRoute);
  };

  const formatMonth = (date) => {
    return date.format("MMMM YYYY");
  };

  return (
    <Paper
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        backgroundColor: "#1b1b1b",
        border: "2px dashed #333",
        borderRadius: 3,
        p: 4,
        textAlign: "center",
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          backgroundColor: "#14b8a620",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <ReceiptIcon sx={{ fontSize: 40, color: "#14b8a6" }} />
      </Box>

      <Typography
        variant="h5"
        sx={{
          color: "#fff",
          fontWeight: 600,
          mb: 2,
        }}
      >
        No Bills Found
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: "#b0b0b0",
          mb: 1,
          maxWidth: 400,
        }}
      >
        You don't have any bills for {formatMonth(selectedDate)}.
      </Typography>

      {hasWriteAccess && (
        <Typography
          variant="body2"
          sx={{
            color: "#888",
            mb: 4,
            maxWidth: 400,
          }}
        >
          Start by creating your first bill to track your expenses and income.
        </Typography>
      )}

      {hasWriteAccess && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateBill}
          sx={{
            backgroundColor: "#14b8a6",
            color: "white",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            "&:hover": {
              backgroundColor: "#0d9488",
            },
          }}
        >
          Create Your First Bill
        </Button>
      )}
    </Paper>
  );
};

export default EmptyBillState;
