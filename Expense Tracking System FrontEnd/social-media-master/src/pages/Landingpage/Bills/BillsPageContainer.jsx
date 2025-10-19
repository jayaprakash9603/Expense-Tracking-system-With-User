import React from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  Pagination,
} from "@mui/material";
import BillHeader from "./BillHeader";
import BillDateSelector from "./BillDateSelector";
import BillTabs from "./BillTabs";
import BillSummary from "./BillSummary";
import EmptyBillState from "./EmptyBillState";
import Modal from "../../Landingpage/Modal";
import BillAccordion from "./BillAccordian";
import { useBillsPage } from "./useBillsPage";

/**
 * BillsPageContainer encapsulates all logic & UI for the Bills page.
 * It composes state via the useBillsPage hook and renders presentational components.
 */
const BillsPageContainer = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    friendId,
    hideBackButton,
    hasWriteAccess,
    activeTab,
    selectedDate,
    anchorEl,
    expandedAccordion,
    billActionAnchorEl,
    selectedBillForAction,
    deleteDialogOpen,
    billToDelete,
    isDeleting,
    snackbar,
    filteredBills,
    billStats,
    currentPage,
    totalPages,
    paginatedData,
    setCurrentPage,
    setSnackbar,
    setDeleteDialogOpen,
    handleBack,
    handleMenuClick,
    handleMenuClose,
    handleMenuItemClick,
    handleTabChange,
    handleDateChange,
    handlePrevMonth,
    handleNextMonth,
    handleBillActionClick,
    handleBillActionClose,
    handleEditBill,
    handleDeleteBill,
    confirmDeleteBill,
    handleAccordionChange,
  } = useBillsPage();

  return (
    <Box
      sx={{
        height: "calc(100vh - 100px)",
        width: "calc(100vw - 370px)",
        backgroundColor: "#0b0b0b",
        position: "relative",
        overflow: "hidden",
        borderRadius: "16px",
        mr: "20px",
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          py: 2,
          px: 3,
        }}
      >
        <BillHeader
          friendId={friendId}
          onBack={handleBack}
          menuAnchorEl={anchorEl}
          onMenuClick={handleMenuClick}
          onMenuClose={handleMenuClose}
          onMenuItemClick={handleMenuItemClick}
          hasWriteAccess={hasWriteAccess}
          hideBackButton={hideBackButton}
        />

        <Modal
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Confirm Delete"
          confirmationText={`Are you sure you want to delete the bill "${billToDelete?.name}"? This action cannot be undone.`}
          onApprove={confirmDeleteBill}
          onDecline={() => setDeleteDialogOpen(false)}
          approveText={isDeleting ? "Deleting..." : "Delete"}
          declineText="Cancel"
        />

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{
              backgroundColor:
                snackbar.severity === "success" ? "#14b8a6" : "#f44336",
              color: "#fff",
            }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <BillDateSelector
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          isSmallScreen={isSmallScreen}
        />

        <BillTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          billStats={billStats}
        />

        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 1,
            mb: 1,
            "&::-webkit-scrollbar": { width: "8px" },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#1b1b1b",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#14b8a6",
              borderRadius: "4px",
              "&:hover": { backgroundColor: "#0d9488" },
            },
          }}
        >
          {paginatedData.length > 0 ? (
            paginatedData.map((bill) => (
              <BillAccordion
                key={bill.id}
                bill={bill}
                expandedAccordion={expandedAccordion}
                onAccordionChange={handleAccordionChange}
                onBillActionClick={handleBillActionClick}
                billActionAnchorEl={billActionAnchorEl}
                selectedBillForAction={selectedBillForAction}
                onBillActionClose={handleBillActionClose}
                onEditBill={handleEditBill}
                onDeleteBill={handleDeleteBill}
                hasWriteAccess={hasWriteAccess}
              />
            ))
          ) : (
            <EmptyBillState
              selectedDate={selectedDate}
              hasWriteAccess={hasWriteAccess}
            />
          )}
        </Box>

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
            <Pagination
              count={totalPages}
              page={currentPage}
              onChange={(_, value) => setCurrentPage(value)}
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#b0b0b0",
                  "&.Mui-selected": {
                    backgroundColor: "#14b8a6",
                    color: "white",
                  },
                  "&:hover": { backgroundColor: "#14b8a6", opacity: 0.7 },
                },
              }}
            />
          </Box>
        )}

        {filteredBills.length > 0 && (
          <BillSummary billStats={billStats} selectedDate={selectedDate} />
        )}
      </Box>
    </Box>
  );
};

export default BillsPageContainer;
