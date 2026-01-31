/**
 * =============================================================================
 * CreateSharePage - Full-Page QR Share Creation
 * =============================================================================
 *
 * A full-page layout for creating QR code shares with:
 * 1. Tabs for selecting data type (Expenses, Categories, Budgets)
 * 2. Stepper-based workflow
 * 3. Full-width responsive design matching Budget.jsx
 *
 * Uses modular components:
 * - useShareData hook for state management
 * - ShareDataSelector for step 1
 * - ShareConfigStep for step 2
 * - ShareReviewStep for step 3
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
  Button,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  useMediaQuery,
} from "@mui/material";
import {
  QrCode2 as QrCodeIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Check as CheckIcon,
} from "@mui/icons-material";
import { useTheme } from "../../hooks/useTheme";
import useShareData, {
  STEPS,
  DATA_TYPE_OPTIONS,
  EXPIRY_OPTIONS,
} from "../../hooks/useShareData";
import ShareDataSelector from "../../components/sharing/ShareDataSelector";
import ShareConfigStep from "../../components/sharing/ShareConfigStep";
import ShareReviewStep from "../../components/sharing/ShareReviewStep";
import QrDisplayScreen from "../../components/sharing/QrDisplayScreen";

// =============================================================================
// Component
// =============================================================================

const CreateSharePage = () => {
  const { colors, isDark } = useTheme();
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  // Use custom hook for all share data management
  const {
    // Step state
    activeStep,
    // Tab / resource type
    activeTab,
    resourceType,
    // Data from hook
    availableItems,
    filteredItems,
    // Selection
    selectedItems,
    searchTerm,
    // Configuration
    shareName,
    permission,
    expiryOption,
    customExpiry,
    // QR
    showQrModal,
    createdShare,
    createShareLoading,
    // Errors
    error,
    createShareError,
    // Navigation
    returnRoute,
    returnRouteState,
    navigateToReturnRoute,
    // Setters
    setSearchTerm,
    setShareName,
    setPermission,
    setExpiryOption,
    setCustomExpiry,
    // Handlers
    handleTabChange,
    handleToggleItem,
    handleSelectAll,
    handleNext,
    handleBack,
    handleCreateShare,
    handleQrModalClose,
    // Pre-selected mode
    hasPreSelectedItems,
    preSelectedType,
    // Pagination
    loadMoreExpenses,
    isLoadingMore,
    hasMoreExpenses,
    totalExpenses,
  } = useShareData();

  /**
   * Check if next button should be disabled
   */
  const isNextDisabled = () => {
    if (activeStep === 0) {
      return selectedItems.length === 0;
    }
    if (activeStep === 1) {
      return !permission || !expiryOption;
    }
    return false;
  };

  /**
   * Render step content based on active step
   */
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <ShareDataSelector
            activeTab={activeTab}
            resourceType={resourceType}
            selectedItems={selectedItems}
            searchTerm={searchTerm}
            filteredItems={filteredItems}
            dataTypeOptions={DATA_TYPE_OPTIONS}
            onTabChange={handleTabChange}
            onSearchChange={setSearchTerm}
            onToggleItem={handleToggleItem}
            onSelectAll={handleSelectAll}
            isSmallScreen={isSmallScreen}
            hasPreSelectedItems={hasPreSelectedItems}
            preSelectedType={preSelectedType}
            // Pagination props
            onLoadMore={loadMoreExpenses}
            isLoadingMore={isLoadingMore}
            hasMore={hasMoreExpenses}
            totalItems={totalExpenses}
          />
        );
      case 1:
        return (
          <ShareConfigStep
            shareName={shareName}
            permission={permission}
            expiryOption={expiryOption}
            customExpiry={customExpiry}
            expiryOptions={EXPIRY_OPTIONS}
            onShareNameChange={setShareName}
            onPermissionChange={setPermission}
            onExpiryOptionChange={setExpiryOption}
            onCustomExpiryChange={setCustomExpiry}
          />
        );
      case 2:
        return (
          <ShareReviewStep
            shareName={shareName}
            resourceType={resourceType}
            selectedItems={selectedItems}
            permission={permission}
            expiryOption={expiryOption}
            customExpiry={customExpiry}
            dataTypeOptions={DATA_TYPE_OPTIONS}
            expiryOptions={EXPIRY_OPTIONS}
            error={error}
            createShareError={createShareError}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Main Container - matching Budget.jsx layout */}
      <Box
        sx={{
          backgroundColor: colors.secondary_bg,
          width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          borderRadius: "8px",
          border: `1px solid ${colors.border_color}`,
          p: isSmallScreen ? 1.5 : 3,
          mr: isSmallScreen ? 0 : "20px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header Row: Back Button | Full-Width Stepper | Badge */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mb: 2,
            flexShrink: 0,
            gap: 2,
          }}
        >
          {/* Left: Back button */}
          <IconButton
            sx={{
              color: colors.primary_accent,
              backgroundColor: colors.primary_bg,
              border: `1px solid ${colors.border_color}`,
              "&:hover": {
                backgroundColor: colors.hover_bg,
                borderColor: colors.primary_accent,
              },
              width: 32,
              height: 32,
              flexShrink: 0,
            }}
            onClick={navigateToReturnRoute}
            aria-label="Back"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke={colors.primary_accent}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </IconButton>

          {/* Center: Full-Width Stepper - Equally Distributed */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Stepper
              activeStep={activeStep}
              alternativeLabel
              sx={{
                width: "100%",
                "& .MuiStep-root": {
                  flex: 1,
                  padding: 0,
                },
                "& .MuiStepLabel-root": {
                  padding: 0,
                },
                "& .MuiStepLabel-label": {
                  color: colors.secondary_text,
                  fontSize: isSmallScreen ? "0.7rem" : "0.8rem",
                  fontWeight: 500,
                  marginTop: "8px !important",
                  "&.Mui-active": {
                    color: colors.primary_accent,
                    fontWeight: 600,
                  },
                  "&.Mui-completed": {
                    color: colors.primary_accent,
                  },
                },
                "& .MuiStepIcon-root": {
                  color: isDark ? "#333333" : colors.border_color,
                  width: isSmallScreen ? 24 : 28,
                  height: isSmallScreen ? 24 : 28,
                  "&.Mui-active": {
                    color: colors.primary_accent,
                  },
                  "&.Mui-completed": {
                    color: colors.primary_accent,
                  },
                },
                "& .MuiStepConnector-line": {
                  borderTopWidth: 2,
                  borderColor: isDark ? "#333333" : colors.border_color,
                },
                "& .MuiStepConnector-root.Mui-active .MuiStepConnector-line": {
                  borderColor: colors.primary_accent,
                },
                "& .MuiStepConnector-root.Mui-completed .MuiStepConnector-line":
                  {
                    borderColor: colors.primary_accent,
                  },
                "& .MuiStepConnector-root": {
                  top: isSmallScreen ? 12 : 14,
                  left: "calc(-50% + 14px)",
                  right: "calc(50% + 14px)",
                },
              }}
            >
              {STEPS.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Right: Selection Count Badge */}
          {selectedItems.length > 0 && (
            <Box
              sx={{
                backgroundColor: colors.primary_accent,
                color: "#fff",
                px: 1.5,
                py: 0.25,
                borderRadius: "12px",
                fontSize: "0.7rem",
                fontWeight: 600,
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {selectedItems.length} selected
            </Box>
          )}
        </Box>

        {/* Step Content - Scrollable Area */}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            backgroundColor: isDark ? "#0d0d0d" : colors.primary_bg,
            borderRadius: "8px",
            border: `1px solid ${isDark ? "#1a1a1a" : colors.border_color}`,
            p: isSmallScreen ? 2 : 3,
            mb: 2,
          }}
        >
          {renderStepContent()}
        </Box>

        {/* Footer Navigation */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            pt: 2,
            borderTop: `1px solid ${isDark ? "#1a1a1a" : colors.border_color}`,
            flexShrink: 0,
          }}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={activeStep === 0 ? navigateToReturnRoute : handleBack}
            sx={{
              textTransform: "none",
              color: colors.secondary_text,
              borderColor: isDark ? "#333333" : colors.border_color,
              "&:hover": {
                borderColor: colors.primary_accent,
                color: colors.primary_accent,
              },
            }}
          >
            {activeStep === 0 ? "Cancel" : "Back"}
          </Button>

          <Button
            variant="contained"
            endIcon={
              activeStep === STEPS.length - 1 ? (
                createShareLoading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <CheckIcon />
                )
              ) : (
                <ArrowForwardIcon />
              )
            }
            onClick={
              activeStep === STEPS.length - 1 ? handleCreateShare : handleNext
            }
            disabled={isNextDisabled() || createShareLoading}
            sx={{
              textTransform: "none",
              bgcolor: colors.primary_accent,
              color: "#fff",
              fontWeight: 600,
              px: 3,
              "&:hover": {
                bgcolor: colors.secondary_accent || colors.primary_accent,
              },
              "&:disabled": {
                bgcolor: isDark ? "#333333" : colors.disabled_bg,
                color: isDark ? "#666666" : colors.disabled_text,
              },
            }}
          >
            {activeStep === STEPS.length - 1
              ? createShareLoading
                ? "Generating..."
                : "Generate QR Code"
              : "Next"}
          </Button>
        </Box>
      </Box>

      {/* QR Code Display Modal */}
      {showQrModal && createdShare && (
        <QrDisplayScreen
          open={showQrModal}
          onClose={handleQrModalClose}
          share={createdShare}
        />
      )}
    </>
  );
};

export default CreateSharePage;
