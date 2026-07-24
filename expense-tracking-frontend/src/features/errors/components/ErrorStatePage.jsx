import React from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useTheme } from "../../../hooks/useTheme";

const ErrorStatePage = ({
  icon,
  statusCode,
  title,
  message,
  attemptedRoute,
  primaryCta = { label: "Go to Dashboard", path: "/dashboard" },
  quickLinks = [],
  embedded = false,
}) => {
  const navigate = useNavigate();
  const { colors } = useTheme();

  return (
    <Box
      sx={{
        minHeight: embedded ? "calc(100dvh - 140px)" : "100dvh",
        width: embedded ? "100%" : "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: embedded ? "transparent" : colors.primary_bg,
        px: 4,
        py: embedded ? 6 : 4,
      }}
    >
      <Box
        sx={{
          mb: 2.5,
          animation: "errorStateFloat 3s ease-in-out infinite",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {icon}
      </Box>

      {statusCode ? (
        <Box
          component="h1"
          sx={{
            fontSize: { xs: "56px", sm: "72px" },
            fontWeight: "bold",
            m: 0,
            color: colors.primary_accent,
            textShadow: `0 0 20px ${colors.primary_accent}40`,
          }}
        >
          {statusCode}
        </Box>
      ) : null}

      <Box
        component="h2"
        sx={{
          fontSize: { xs: "24px", sm: "28px" },
          fontWeight: 600,
          mt: statusCode ? 2.5 : 0,
          mb: 1.25,
          color: colors.primary_text,
          textAlign: "center",
        }}
      >
        {title}
      </Box>

      <Box
        component="p"
        sx={{
          fontSize: "16px",
          color: colors.secondary_text,
          textAlign: "center",
          maxWidth: 520,
          mb: attemptedRoute ? 2 : 5,
          lineHeight: 1.6,
        }}
      >
        {message}
      </Box>

      {attemptedRoute ? (
        <Box
          component="p"
          sx={{
            fontSize: "14px",
            color: colors.tertiary_text || colors.secondary_text,
            textAlign: "center",
            maxWidth: 520,
            mb: 5,
          }}
        >
          Attempted route: {attemptedRoute}
        </Box>
      ) : null}

      <Box
        sx={{
          display: "flex",
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          startIcon={<HomeIcon />}
          onClick={() => navigate(primaryCta.path, { replace: true })}
          sx={{
            backgroundColor: colors.primary_accent,
            color: colors.button_text,
            px: 3,
            py: 1.5,
            fontSize: "16px",
            textTransform: "none",
            borderRadius: "8px",
            "&:hover": {
              backgroundColor: colors.tertiary_accent,
            },
          }}
        >
          {primaryCta.label}
        </Button>

        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(-1)}
          sx={{
            borderColor: colors.border_color,
            color: colors.primary_text,
            px: 3,
            py: 1.5,
            fontSize: "16px",
            textTransform: "none",
            borderRadius: "8px",
            "&:hover": {
              borderColor: colors.primary_accent,
              backgroundColor: `${colors.primary_accent}20`,
            },
          }}
        >
          Go Back
        </Button>
      </Box>

      {quickLinks.length > 0 ? (
        <Box
          sx={{
            mt: 7.5,
            textAlign: "center",
            color: colors.secondary_text,
            fontSize: "14px",
          }}
        >
          <Box component="p" sx={{ m: 0 }}>
            Need help? Try one of these popular pages:
          </Box>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              mt: 2,
              justifyContent: "center",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {quickLinks.map((link, index) => (
              <React.Fragment key={link.path}>
                {index > 0 ? (
                  <Box component="span" sx={{ color: colors.border_color }}>
                    •
                  </Box>
                ) : null}
                <Box
                  component="a"
                  href={link.path}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(link.path, { replace: true });
                  }}
                  sx={{
                    color: colors.primary_accent,
                    textDecoration: "none",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  {link.label}
                </Box>
              </React.Fragment>
            ))}
          </Box>
        </Box>
      ) : null}

      <style>{`
        @keyframes errorStateFloat {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
    </Box>
  );
};

export default ErrorStatePage;
