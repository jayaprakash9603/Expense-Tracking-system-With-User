/**
 * =============================================================================
 * SharesPageLayout - Reusable Layout Component for Share Pages
 * =============================================================================
 *
 * A reusable layout component that provides consistent structure for:
 * - MySharesPage
 * - PublicSharesPage
 * - SharedWithMePage
 *
 * Features:
 * - Header with title, refresh, and action buttons
 * - Statistics overview cards
 * - Tab navigation for filtering
 * - Search bar
 * - Grid/List view toggle
 * - Loading and empty states
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Divider,
  Alert,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Grid,
  Skeleton,
  useMediaQuery,
} from "@mui/material";
import {
  QrCode2 as QrCodeIcon,
  Search as SearchIcon,
  ViewModule as GridViewIcon,
  ViewList as ListViewIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import SharedOverviewCards from "../charts/SharedOverviewCards";

// =============================================================================
// Component
// =============================================================================

const SharesPageLayout = ({
  // Page configuration
  title,
  subtitle,
  // Data
  shares = [],
  loading,
  error,
  // Statistics
  overviewCardsData,
  // Tabs
  tabs = [],
  activeTab,
  onTabChange,
  // Search
  searchTerm,
  onSearchChange,
  searchPlaceholder = "Search by name, type, or token...",
  // View mode
  viewMode,
  onViewModeToggle,
  // Actions
  onRefresh,
  showCreateButton = false,
  createButtonText = "New Share",
  onCreateClick,
  // Custom action buttons
  actionButtons,
  // Render content
  renderCard,
  renderEmptyState,
  // Additional content
  children,
}) => {
  const { colors } = useTheme();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  // ---------------------------------------------------------------------------
  // Loading State
  // ---------------------------------------------------------------------------

  if (loading && shares.length === 0) {
    return (
      <Box
        sx={{
          backgroundColor: colors.secondary_bg,
          width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          borderRadius: "8px",
          border: `1px solid ${colors.border}`,
          p: isSmallScreen ? 1.5 : 2,
          mr: isSmallScreen ? 0 : "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Skeleton variant="text" height={40} width={200} sx={{ mb: 1 }} />
        <Divider sx={{ mb: 1.5 }} />
        <Skeleton
          variant="rectangular"
          height={100}
          sx={{ mb: 1.5, borderRadius: 2 }}
        />
        <Skeleton
          variant="rectangular"
          height={48}
          sx={{ mb: 1.5, borderRadius: 2 }}
        />
        <Skeleton
          variant="rectangular"
          height={40}
          width={400}
          sx={{ mb: 1.5, borderRadius: 2 }}
        />
        <Grid container spacing={1.5}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <Skeleton
                variant="rectangular"
                height={150}
                sx={{ borderRadius: 2 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  // ---------------------------------------------------------------------------
  // Default Empty State
  // ---------------------------------------------------------------------------

  const defaultEmptyState = (
    <Box
      sx={{
        p: 4,
        textAlign: "center",
        backgroundColor: "transparent",
        border: `2px dashed ${colors.border}`,
        borderRadius: "12px",
      }}
    >
      <QrCodeIcon
        sx={{ fontSize: 48, color: colors.secondary_text, mb: 1.5 }}
      />
      <Typography
        variant="h6"
        sx={{ color: colors.primary_text, mb: 0.5, fontSize: "1rem" }}
      >
        No shares found
      </Typography>
      <Typography
        variant="body2"
        sx={{ color: colors.secondary_text, mb: 2, fontSize: "0.85rem" }}
      >
        {subtitle || "There are no shares to display."}
      </Typography>
      {showCreateButton && onCreateClick && (
        <Button
          variant="contained"
          startIcon={<AddIcon fontSize="small" />}
          onClick={onCreateClick}
          sx={{
            textTransform: "none",
            backgroundColor: colors.accent,
            px: 2,
            py: 0.75,
            fontSize: "0.875rem",
            "&:hover": { backgroundColor: colors.accent_hover },
          }}
        >
          {createButtonText}
        </Button>
      )}
    </Box>
  );

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------

  return (
    <Box
      sx={{
        backgroundColor: colors.secondary_bg,
        width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        borderRadius: "8px",
        border: `1px solid ${colors.border}`,
        p: isSmallScreen ? 1.5 : 2,
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
          flexDirection: isSmallScreen ? "column" : "row",
          justifyContent: "space-between",
          alignItems: isSmallScreen ? "flex-start" : "center",
          mb: 1.5,
          gap: isSmallScreen ? 1 : 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography
            variant="h3"
            sx={{
              color: colors.primary_text,
              fontWeight: "bold",
              fontSize: isSmallScreen ? "1.25rem" : "1.5rem",
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          {onRefresh && (
            <IconButton
              onClick={onRefresh}
              disabled={loading}
              sx={{
                color: colors.accent,
                bgcolor: colors.card_bg,
                border: `1px solid ${colors.border}`,
                borderRadius: "6px",
                width: 36,
                height: 36,
                "&:hover": {
                  bgcolor: colors.hover_bg,
                  borderColor: colors.accent,
                },
              }}
            >
              <RefreshIcon fontSize="small" />
            </IconButton>
          )}
          {showCreateButton && onCreateClick && (
            <Button
              variant="contained"
              startIcon={<AddIcon fontSize="small" />}
              onClick={onCreateClick}
              sx={{
                textTransform: "none",
                bgcolor: colors.accent,
                color: "#fff",
                fontWeight: 600,
                px: 2,
                py: 0.75,
                fontSize: "0.875rem",
                borderRadius: "6px",
                "&:hover": {
                  bgcolor: colors.accent_hover,
                },
              }}
            >
              {createButtonText}
            </Button>
          )}
          {actionButtons}
          {onViewModeToggle && (
            <IconButton
              onClick={onViewModeToggle}
              sx={{
                color: colors.accent,
                bgcolor: colors.card_bg,
                border: `1px solid ${colors.border}`,
                borderRadius: "6px",
                width: 36,
                height: 36,
                "&:hover": {
                  bgcolor: colors.hover_bg,
                  borderColor: colors.accent,
                },
              }}
            >
              {viewMode === "grid" ? (
                <ListViewIcon fontSize="small" />
              ) : (
                <GridViewIcon fontSize="small" />
              )}
            </IconButton>
          )}
        </Box>
      </Box>

      <Divider sx={{ borderColor: colors.border, mb: 1.5 }} />

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => {}}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      {overviewCardsData && (
        <SharedOverviewCards data={overviewCardsData} mode="shares" />
      )}

      {/* Tabs */}
      {tabs.length > 0 && (
        <Box
          sx={{
            mb: 1.5,
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            backgroundColor: colors.card_bg,
            border: "none",
          }}
        >
          <Tabs
            value={activeTab}
            onChange={onTabChange}
            variant="fullWidth"
            sx={{
              "& .MuiTab-root": {
                fontWeight: 600,
                fontSize: "0.9rem",
                textTransform: "none",
                py: 1.5,
                minHeight: 48,
                color: colors.secondary_text,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&.Mui-selected": {
                  color: colors.accent,
                  transform: "scale(1.02)",
                },
                "&:hover": {
                  color: colors.accent,
                  backgroundColor: `${colors.accent}14`,
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                backgroundColor: colors.accent,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab key={index} label={tab.label} />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Search & Filter Bar */}
      {onSearchChange && (
        <Box
          sx={{
            background: `linear-gradient(135deg, ${colors.card_bg} 0%, ${colors.secondary_bg} 100%)`,
            border: `1px solid ${colors.border}`,
            borderRadius: "12px",
            p: 1.5,
            mb: 1.5,
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          }}
        >
          <TextField
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            size="small"
            fullWidth
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{ color: colors.accent, fontSize: "1.2rem" }}
                  />
                </InputAdornment>
              ),
            }}
            sx={{
              maxWidth: isSmallScreen ? "100%" : 400,
              "& .MuiOutlinedInput-root": {
                bgcolor: colors.secondary_bg,
                color: colors.primary_text,
                borderRadius: "8px",
                height: "40px",
                "& fieldset": {
                  borderColor: colors.border,
                  borderWidth: "1.5px",
                },
                "&:hover fieldset": {
                  borderColor: colors.accent,
                },
                "&.Mui-focused fieldset": {
                  borderColor: colors.accent,
                  borderWidth: "2px",
                },
              },
              "& .MuiInputBase-input": {
                fontSize: "0.875rem",
                "&::placeholder": {
                  color: colors.secondary_text,
                  opacity: 0.8,
                },
              },
            }}
          />
        </Box>
      )}

      {/* Content Area - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          pr: 0.5,
          "&::-webkit-scrollbar": {
            width: "6px",
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            background: colors.border,
            borderRadius: "3px",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: colors.accent,
          },
        }}
      >
        {shares.length === 0 ? (
          renderEmptyState ? (
            renderEmptyState()
          ) : (
            defaultEmptyState
          )
        ) : (
          <Grid container spacing={1.5}>
            {shares.map((share) => (
              <Grid
                item
                xs={12}
                sm={viewMode === "list" ? 12 : 6}
                md={viewMode === "list" ? 12 : 4}
                lg={viewMode === "list" ? 12 : 3}
                key={share.id}
              >
                {renderCard(share)}
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Additional Children (Modals, Menus, etc.) */}
      {children}
    </Box>
  );
};

export default SharesPageLayout;
