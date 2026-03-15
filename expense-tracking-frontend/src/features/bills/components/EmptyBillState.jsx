import React from "react";
import { Box, Typography, Button, Paper } from "@mui/material";
import { Receipt as ReceiptIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate, useParams } from "react-router";
import { useTheme } from "../../../hooks/useTheme";

const EmptyBillState = ({ selectedDate, hasWriteAccess }) => {
  const navigate = useNavigate();
  const { friendId } = useParams();
  const { colors } = useTheme();

  const handleCreateBill = () => {
    const createRoute = friendId ? `/bill/create/${friendId}` : "/bill/create";
    navigate(createRoute);
  };

  const formatMonth = (date) => {
    return date.format("MMMM YYYY");
  };

  return (
    <Paper
      elevation={0}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        backgroundColor: colors.card_bg,
        border: `2px dashed ${colors.border_color}`,
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
          backgroundColor: colors.hover_bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 3,
        }}
      >
        <ReceiptIcon sx={{ fontSize: 40, color: colors.primary_accent }} />
      </Box>

      <Typography
        variant="h5"
        sx={{
          color: colors.primary_text,
          fontWeight: 600,
          mb: 2,
        }}
      >
        No Bills Found
      </Typography>

      <Typography
        variant="body1"
        sx={{
          color: colors.secondary_text,
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
            color: colors.secondary_text,
            mb: 4,
            maxWidth: 400,
            opacity: 0.7,
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
            backgroundColor: colors.primary_accent,
            color: "#ffffff",
            fontWeight: 600,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            textTransform: "none",
            fontSize: "1rem",
            boxShadow: "none",
            "&:hover": {
              backgroundColor: colors.button_hover,
              boxShadow: "none",
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
