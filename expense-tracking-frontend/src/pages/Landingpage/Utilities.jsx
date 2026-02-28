/**
 * =============================================================================
 * Utilities - Central Hub for Share Management & Other Utilities
 * =============================================================================
 *
 * A dashboard page providing quick access to:
 * - My Shares: Manage your QR code shares
 * - Public Shares: Browse publicly available shares
 * - Shared With Me: View shares others have sent you
 *
 * @author Expense Tracking System
 * @version 2.0
 * =============================================================================
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  Divider,
} from "@mui/material";
import ShareIcon from "@mui/icons-material/Share";
import PublicIcon from "@mui/icons-material/Public";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import BuildIcon from "@mui/icons-material/Build";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ChatIcon from "@mui/icons-material/Chat";
import { useTheme } from "../../hooks/useTheme";

const Utilities = () => {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();
  const { colors } = useTheme();

  const utilityItems = [
    {
      title: "My Shares",
      description:
        "Manage and create QR code shares for your expenses, budgets, and reports",
      icon: ShareIcon,
      path: "/my-shares",
      color: "#14b8a6",
      gradient: "linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)",
    },
    {
      title: "Public Shares",
      description:
        "Browse and discover publicly shared expense data from all users",
      icon: PublicIcon,
      path: "/public-shares",
      color: "#8b5cf6",
      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
    },
    {
      title: "Shared With Me",
      description: "Access QR code shares that others have shared with you",
      icon: PersonAddIcon,
      path: "/shared-with-me",
      color: "#f59e0b",
      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    },
  ];

  const communicationItems = [
    {
      title: "Friend Chat",
      description:
        "Chat with your friends in real-time with WhatsApp-like messaging experience",
      icon: ChatIcon,
      path: "/friend-chat",
      color: "#25D366",
      gradient: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: colors.secondary_bg,
        width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        borderRadius: "8px",
        border: `1px solid ${colors.border}`,
        p: isSmallScreen ? 2 : 3,
        mr: isSmallScreen ? 0 : "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "12px",
            background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent_hover} 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <BuildIcon sx={{ fontSize: 28, color: "#fff" }} />
        </Box>
        <Box>
          <Typography
            variant="h4"
            sx={{
              color: colors.primary_text,
              fontWeight: "bold",
              fontSize: isSmallScreen ? "1.5rem" : "1.75rem",
            }}
          >
            Utilities
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: colors.secondary_text, fontSize: "0.9rem" }}
          >
            Quick access to sharing tools and more
          </Typography>
        </Box>
      </Box>

      <Divider sx={{ borderColor: colors.border, mb: 3 }} />

      {/* Sharing Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: colors.primary_text,
            fontWeight: 600,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ShareIcon sx={{ fontSize: 20, color: colors.accent }} />
          Sharing & QR Codes
        </Typography>

        <Grid container spacing={isSmallScreen ? 2 : 3}>
          {utilityItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  onClick={() => navigate(item.path)}
                  sx={{
                    background: `linear-gradient(135deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px ${item.color}40`,
                      borderColor: item.color,
                      "& .icon-box": {
                        transform: "scale(1.1) rotate(5deg)",
                      },
                      "& .arrow-icon": {
                        transform: "translateX(4px)",
                        opacity: 1,
                      },
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: item.gradient,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    {/* Icon */}
                    <Box
                      className="icon-box"
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "14px",
                        background: item.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                        transition: "all 0.3s ease",
                        boxShadow: `0 8px 20px ${item.color}40`,
                      }}
                    >
                      <IconComponent sx={{ fontSize: 28, color: "#fff" }} />
                    </Box>

                    {/* Title with Arrow */}
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: colors.primary_text,
                          fontWeight: 700,
                          fontSize: "1.1rem",
                        }}
                      >
                        {item.title}
                      </Typography>
                      <ArrowForwardIcon
                        className="arrow-icon"
                        sx={{
                          fontSize: 20,
                          color: item.color,
                          opacity: 0.5,
                          transition: "all 0.3s ease",
                        }}
                      />
                    </Box>

                    {/* Description */}
                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.secondary_text,
                        fontSize: "0.85rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h6"
          sx={{
            color: colors.primary_text,
            fontWeight: 600,
            mb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <ChatIcon sx={{ fontSize: 20, color: "#25D366" }} />
          Communication
        </Typography>

        <Grid container spacing={isSmallScreen ? 2 : 3}>
          {communicationItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card
                  onClick={() => navigate(item.path)}
                  sx={{
                    background: `linear-gradient(135deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
                    border: `1px solid ${colors.border}`,
                    borderRadius: "16px",
                    cursor: "pointer",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    position: "relative",
                    overflow: "hidden",
                    height: "100%",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: `0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px ${item.color}40`,
                      borderColor: item.color,
                      "& .icon-box-comm": {
                        transform: "scale(1.1) rotate(5deg)",
                      },
                      "& .arrow-icon-comm": {
                        transform: "translateX(4px)",
                        opacity: 1,
                      },
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      background: item.gradient,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box
                      className="icon-box-comm"
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: "14px",
                        background: item.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        mb: 2,
                        transition: "all 0.3s ease",
                        boxShadow: `0 8px 20px ${item.color}40`,
                      }}
                    >
                      <IconComponent sx={{ fontSize: 28, color: "#fff" }} />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{
                          color: colors.primary_text,
                          fontWeight: 700,
                          fontSize: "1.1rem",
                        }}
                      >
                        {item.title}
                      </Typography>
                      <ArrowForwardIcon
                        className="arrow-icon-comm"
                        sx={{
                          fontSize: 20,
                          color: item.color,
                          opacity: 0.5,
                          transition: "all 0.3s ease",
                        }}
                      />
                    </Box>

                    <Typography
                      variant="body2"
                      sx={{
                        color: colors.secondary_text,
                        fontSize: "0.85rem",
                        lineHeight: 1.6,
                      }}
                    >
                      {item.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `2px dashed ${colors.border}`,
          borderRadius: "16px",
          p: 4,
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography
            variant="body1"
            sx={{ color: colors.secondary_text, mb: 1 }}
          >
            More utilities coming soon...
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: colors.secondary_text, opacity: 0.7 }}
          >
            Export tools, import data, backup & restore, and more
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Utilities;
