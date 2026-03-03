import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Box, Typography } from "@mui/material";

const Error403 = ({ message, onClose }) => {
  const navigate = useNavigate();

  const { friendId } = useParams();
  return (
    <Box
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      <Box
        sx={{
          backgroundColor: "#1b1b1b",
          borderRadius: 2,
          padding: 4,
          maxWidth: 500,
          width: "90%",
          textAlign: "center",
          border: "2px solid #ff4d4f",
        }}
      >
        <Typography
          variant="h4"
          sx={{
            color: "#ff4d4f",
            fontWeight: "bold",
            mb: 2,
          }}
        >
          403 - Access Denied
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#fff",
            mb: 3,
            lineHeight: 1.6,
          }}
        >
          {message || "You do not have permission to access this resource."}
        </Typography>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Button
            variant="contained"
            onClick={() => {
              onClose();
            }}
            sx={{
              backgroundColor: "#5b7fff",
              "&:hover": {
                backgroundColor: "#4a6bff",
              },
            }}
          >
            Go to Expenses
          </Button>

          <Button
            variant="outlined"
            onClick={onClose}
            sx={{
              borderColor: "#ff4d4f",
              color: "#ff4d4f",
              "&:hover": {
                borderColor: "#ff4d4f",
                backgroundColor: "rgba(255, 77, 79, 0.1)",
              },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Error403;
