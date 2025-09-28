
import React, { useEffect, useState } from "react";
import {
  Box,
  useMediaQuery,
  useTheme,
  Snackbar,
  Alert,
  Pagination,
} from "@mui/material";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router";

// Custom hooks
import { useBillData } from "./useBillData";
import { useBillFilters } from "./useBillFilters";
import { usePagination } from "./usePagination";

// Components
import BillHeader from "./BillHeader";
import BillDateSelector from "./BillDateSelector";
import BillTabs from "./BillTabs";

import BillSummary from "./BillSummary";
import EmptyBillState from "./EmptyBillState";
import Modal from "../../Landingpage/Modal";
import BillAccordion from "./BillAccordian";

const Bill = () => {
  // Router hooks
  const navigate = useNavigate();
  const { friendId } = useParams();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));

  // State management
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);
  
  // Bill action states
  const [billActionAnchorEl, setBillActionAnchorEl] = useState(null);
  const [selectedBillForAction, setSelectedBillForAction] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Notification state
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Custom hooks
  const { billsData, loading, error, fetchBillsData, deleteBillData } = useBillData(friendId);
  const { filteredBills, billStats } = useBillFilters(billsData, activeTab);
  const { currentPage, totalPages, paginatedData, setCurrentPage } = usePagination(filteredBills, 4);

  // Effects
  useEffect(() => {
    const month = selectedDate.month() + 1;
    const year = selectedDate.year();
    fetchBillsData(month, year);
  }, [selectedDate, fetchBillsData]);

  // Event handlers
  const handleBack = () => {
    const destination = friendId && friendId !== "undefined" 
      ? `/friends/expenses/${friendId}` 
      : "/expenses";
    navigate(destination);
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = (action) => {
    handleMenuClose();
    const routes = {
      new: friendId ? `/bill/create/${friendId}` : "/bill/create",
      upload: friendId ? `/bill/upload/${friendId}` : "/bill/upload",
      report: friendId ? `/bill/report/${friendId}` : "/bill/report",
      calendar: friendId ? `/bill/calendar/${friendId}` : "/bill/calendar",
    };
    
    if (routes[action]) {
      navigate(routes[action]);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleDateChange = (newValue) => {
    if (!newValue) return;
    const today = dayjs();
    
    if (newValue.isAfter(today, "month")) {
      return;
    }
    
    setSelectedDate(newValue);
  };

  const handlePrevMonth = () => {
    const newDate = selectedDate.subtract(1, "month");
    setSelectedDate(newDate);
  };

  const handleNextMonth = () => {
    const currentMonth = dayjs();
    const nextMonth = selectedDate.add(1, "month");
    
    if (nextMonth.isAfter(currentMonth, "month")) {
      return;
    }
    
    setSelectedDate(nextMonth);
  };

  const handleBillActionClick = (event, bill) => {
    event.stopPropagation();
    setBillActionAnchorEl(event.currentTarget);
    setSelectedBillForAction(bill);
  };

  const handleBillActionClose = () => {
    setBillActionAnchorEl(null);
    setSelectedBillForAction(null);
  };

  const handleEditBill = (bill) => {
    handleBillActionClose();
    const editRoute = friendId 
      ? `/bill/edit/${bill.id}/friend/${friendId}` 
      : `/bill/edit/${bill.id}`;
    navigate(editRoute);
  };

  const handleDeleteBill = (bill) => {
    setBillToDelete(bill);
    setDeleteDialogOpen(true);
    handleBillActionClose();
  };

  const confirmDeleteBill = async () => {
    if (!billToDelete) return;

    try {
      setIsDeleting(true);
      await deleteBillData(billToDelete.id);
      
      // Refresh bills data
      const month = selectedDate.month() + 1;
      const year = selectedDate.year();
      await fetchBillsData(month, year);

      setSnackbar({
        open: true,
        message: "Bill deleted successfully!",
        severity: "success",
      });

      setDeleteDialogOpen(false);
      setBillToDelete(null);
    } catch (error) {
      console.error("Error deleting bill:", error);
      setSnackbar({
        open: true,
        message: error.message || "Failed to delete bill",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : null);
  };

  return (
    <Box
      sx={{
        height: "calc(100vh - 100px)",
        top: "50px",
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
              backgroundColor: snackbar.severity === "success" ? "#14b8a6" : "#f44336",
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
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "#1b1b1b",
              borderRadius: "4px",
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: "#14b8a6",
              borderRadius: "4px",
              "&:hover": {
                backgroundColor: "#0d9488",
              },
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
              />
            ))
          ) : (
            <EmptyBillState selectedDate={selectedDate} />
          )}
        </Box>

        
{totalPages > 1 && (
  <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
    <Pagination
      count={totalPages}
      page={currentPage}
      onChange={(event, value) => setCurrentPage(value)}
      color="primary"
      sx={{
        "& .MuiPaginationItem-root": {
          color: "#b0b0b0",
          "&.Mui-selected": {
            backgroundColor: "#14b8a6",
            color: "white",
          },
          "&:hover": {
            backgroundColor: "#14b8a6",
            opacity: 0.7,
          },
        },
      }}
    />
  </Box>
)}

        {filteredBills.length > 0 && (
          <BillSummary
            billStats={billStats}
            selectedDate={selectedDate}
          />
        )}
      </Box>
    </Box>
  );
};

export default Bill;
