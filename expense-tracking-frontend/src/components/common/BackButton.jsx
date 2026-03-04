import React from "react";
import { IconButton } from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";

const BackButton = ({ onClick, sx = {}, ...rest }) => {
  const { colors } = useTheme();

  return (
    <IconButton
      onClick={onClick}
      aria-label="Back"
      sx={{
        color: colors.primary_accent,
        backgroundColor: colors.primary_bg,
        "&:hover": { backgroundColor: colors.hover_bg },
        ...sx,
      }}
      {...rest}
    >
      <ArrowBackIcon />
    </IconButton>
  );
};

export default BackButton;
