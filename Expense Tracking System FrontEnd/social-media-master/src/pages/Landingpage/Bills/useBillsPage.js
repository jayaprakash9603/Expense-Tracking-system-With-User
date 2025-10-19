import { useEffect, useState, useCallback } from "react";
import dayjs from "dayjs";
import { useNavigate, useParams, useLocation } from "react-router";
import { useBillData } from "./useBillData";
import { useBillFilters } from "./useBillFilters";
import { usePagination } from "./usePagination";
import useFriendAccess from "../../../hooks/useFriendAccess";

/**
 * Composed hook aggregating all Bill page state & handlers.
 * Keeps the page container lean and enables reuse/testing.
 */
export const useBillsPage = () => {
  const navigate = useNavigate();
  const { friendId } = useParams();
  const location = useLocation();
  const hideBackButton = location?.state?.fromSidebar === true;

  // Basic UI state
  const [activeTab, setActiveTab] = useState(0);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [anchorEl, setAnchorEl] = useState(null); // main menu
  const [expandedAccordion, setExpandedAccordion] = useState(null);

  // Bill action popover
  const [billActionAnchorEl, setBillActionAnchorEl] = useState(null);
  const [selectedBillForAction, setSelectedBillForAction] = useState(null);

  // Delete flow
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Notifications
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Data hooks
  const { billsData, loading, error, fetchBillsData, deleteBillData } =
    useBillData(friendId);
  const { filteredBills, billStats } = useBillFilters(billsData, activeTab);
  const { currentPage, totalPages, paginatedData, setCurrentPage } =
    usePagination(filteredBills, 4);
  const { hasWriteAccess } = useFriendAccess(friendId);

  // Fetch bills when month/year changes
  useEffect(() => {
    const month = selectedDate.month() + 1;
    const year = selectedDate.year();
    fetchBillsData(month, year, friendId || "");
  }, [selectedDate, fetchBillsData, friendId]);

  // Navigation helpers
  const handleBack = useCallback(() => {
    const destination =
      friendId && friendId !== "undefined"
        ? `/friends/expenses/${friendId}`
        : "/expenses";
    navigate(destination);
  }, [navigate, friendId]);

  // Main menu handlers
  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMenuItemClick = (action) => {
    handleMenuClose();
    const routes = {
      new: friendId ? `/bill/create/${friendId}` : "/bill/create",
      upload: friendId ? `/bill/upload/${friendId}` : "/bill/upload",
      report: friendId ? `/bill/report/${friendId}` : "/bill/report",
      calendar: friendId ? `/bill/calendar/${friendId}` : "/bill/calendar",
    };
    if (routes[action]) navigate(routes[action]);
  };

  // Tabs
  const handleTabChange = (_, newValue) => setActiveTab(newValue);

  // Date navigation
  const handleDateChange = (newValue) => {
    if (!newValue) return;
    const today = dayjs();
    if (newValue.isAfter(today, "month")) return; // guard future months
    setSelectedDate(newValue);
  };
  const handlePrevMonth = () => setSelectedDate((d) => d.subtract(1, "month"));
  const handleNextMonth = () => {
    const currentMonth = dayjs();
    const nextMonth = selectedDate.add(1, "month");
    if (nextMonth.isAfter(currentMonth, "month")) return;
    setSelectedDate(nextMonth);
  };

  // Bill action popover & edit/delete
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
      await deleteBillData(billToDelete.id, friendId || "");
      const month = selectedDate.month() + 1;
      const year = selectedDate.year();
      await fetchBillsData(month, year, friendId || "");
      setSnackbar({
        open: true,
        message: "Bill deleted successfully!",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setBillToDelete(null);
    } catch (err) {
      console.error("Error deleting bill:", err);
      setSnackbar({
        open: true,
        message: err.message || "Failed to delete bill",
        severity: "error",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Accordion expander
  const handleAccordionChange = (panel) => (_, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : null);
  };

  return {
    // routing / access
    friendId,
    hideBackButton,
    hasWriteAccess,
    // UI state
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
    // data
    billsData,
    loading,
    error,
    filteredBills,
    billStats,
    currentPage,
    totalPages,
    paginatedData,
    // setters & handlers
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
  };
};
