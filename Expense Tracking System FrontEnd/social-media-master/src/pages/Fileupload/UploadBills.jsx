import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import { api } from "../../config/api";
import { useParams } from "react-router";
import { useTheme } from "../../hooks/useTheme";
import useUserSettings from "../../hooks/useUserSettings";
import { formatDate } from "../../utils/dateFormatter";
import usePreserveNavigationState from "../../hooks/usePreserveNavigationState";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  Avatar,
  Paper,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  List as ListIcon,
  AttachMoney as MoneyIcon,
} from "@mui/icons-material";

const UploadBills = ({ targetId = null, onImportComplete }) => {
  const { colors, isDarkMode } = useTheme();
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;
  const dateFormat = settings.dateFormat || "DD/MM/YYYY";

  // State Management
  const [selectedFile, setSelectedFile] = useState(null);
  const [importedBills, setImportedBills] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [jobId, setJobId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  // Items per page (default 5) – user can adjust via dropdown
  const [itemsPerPage, setItemsPerPage] = useState(5);
  // MUI-style accordion expansion state (single expand at a time)
  const [expandedAccordion, setExpandedAccordion] = useState(null);

  // Filter and Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const jwt = localStorage.getItem("jwt");
  const API_BASE_URL =
    process.env.REACT_APP_API_BASE_URL || "http://localhost:8080";

  // Routing hooks (used in callbacks and UI)
  const { friendId } = useParams();
  const { navigateWithState } = usePreserveNavigationState();

  // Memoized filtered and sorted bills
  const filteredAndSortedBills = useMemo(() => {
    let filtered = importedBills.filter((bill) => {
      const matchesSearch =
        bill.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bill.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        !filterCategory || bill.category === filterCategory;
      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aValue = a[sortBy] || "";
      let bValue = b[sortBy] || "";

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [importedBills, searchTerm, filterCategory, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredAndSortedBills.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBills = filteredAndSortedBills.slice(startIndex, endIndex);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = [
      ...new Set(importedBills.map((bill) => bill.category).filter(Boolean)),
    ];
    return cats.sort();
  }, [importedBills]);

  // File selection handler
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        setSelectedFile(file);
        setUploadMessage("");
        resetImportState();
      } else {
        setUploadMessage("❌ Please select a valid Excel file (.xlsx or .xls)");
        setSelectedFile(null);
      }
    }
  }, []);

  // Reset import state
  const resetImportState = useCallback(() => {
    setImportedBills([]);
    setShowPreview(false);
    setCurrentPage(1);
    setExpandedAccordion(null);
    setSearchTerm("");
    setFilterCategory("");
    setSaveMessage("");
    setProgress(null);
    setJobId(null);
  }, []);

  // Upload and import Excel file
  const handleUploadExcel = useCallback(async () => {
    if (!selectedFile) {
      setUploadMessage("❌ Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadMessage("⏳ Uploading and processing Excel file...");

    const formData = new FormData();
    formData.append("file", selectedFile);
    if (targetId) {
      formData.append("targetId", targetId);
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/bills/import/excel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${jwt}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImportedBills(data.bills || []);
        setUploadMessage(`✅ ${data.message} - Found ${data.totalBills} bills`);
        setShowPreview(true);
        setCurrentPage(1);
      } else {
        setUploadMessage(`❌ Error: ${data.message || data}`);
        resetImportState();
      }
    } catch (error) {
      setUploadMessage(`❌ Network error: ${error.message}`);
      resetImportState();
    } finally {
      setIsUploading(false);
    }
  }, [selectedFile, targetId, jwt, API_BASE_URL, resetImportState]);

  // Save bills using tracked bulk import
  const handleSaveBills = useCallback(async () => {
    if (importedBills.length === 0) {
      setSaveMessage("❌ No bills to save");
      return;
    }

    setSaving(true);
    setSaveMessage("⏳ Starting bulk import...");
    setProgress(null);

    try {
      const requestBody = importedBills;
      const url = new URL(`${API_BASE_URL}/api/bills/add-multiple/tracked`);
      if (targetId) {
        url.searchParams.append("targetId", targetId);
      }

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setJobId(data.jobId);
        setSaveMessage(`✅ Bulk import started. Job ID: ${data.jobId}`);
        pollProgress(data.jobId);
      } else {
        const errMsg = `Error starting bulk import: ${
          data.message || "Unknown error"
        }`;
        setSaveMessage(`❌ ${errMsg}`);
        setProgress({
          status: "FAILED",
          message: errMsg,
          processed: 0,
          total: importedBills.length || 0,
        });
        setSaving(false);
      }
    } catch (error) {
      const errMsg = `Network error: ${error.message}`;
      setSaveMessage(`❌ ${errMsg}`);
      setProgress({
        status: "FAILED",
        message: errMsg,
        processed: 0,
        total: importedBills.length || 0,
      });
      setSaving(false);
    }
  }, [importedBills, targetId, jwt, API_BASE_URL]);

  // Poll progress for tracked bulk import
  // Poll progress for tracked bulk import
  const pollProgress = useCallback(
    async (currentJobId) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/bills/add-multiple/progress/${currentJobId}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${jwt}`,
            },
          }
        );

        if (response.ok) {
          const progressData = await response.json();
          setProgress(progressData);

          if (progressData.status === "COMPLETED") {
            setSaveMessage(`✅ ${progressData.message}`);
            setSaving(false);
            if (onImportComplete) {
              onImportComplete(currentJobId, importedBills.length);
            }
            // Briefly show final count, then redirect to bill route
            setTimeout(() => {
              if (friendId && friendId !== "undefined") {
                navigateWithState(`/bill/${friendId}`);
              } else {
                navigateWithState("/bill");
              }
            }, 1500);
          } else if (progressData.status === "FAILED") {
            setSaveMessage(`❌ Import failed: ${progressData.message}`);
            setSaving(false);
          } else {
            setTimeout(() => pollProgress(currentJobId), 2000);
          }
        } else {
          const errMsg = "Error checking progress";
          setSaveMessage(`❌ ${errMsg}`);
          setProgress((prev) => ({
            status: "FAILED",
            message: errMsg,
            processed: prev?.processed || 0,
            total: prev?.total || importedBills.length || 0,
          }));
          setSaving(false);
        }
      } catch (error) {
        const errMsg = `Error checking progress: ${error.message}`;
        setSaveMessage(`❌ ${errMsg}`);
        setProgress((prev) => ({
          status: "FAILED",
          message: errMsg,
          processed: prev?.processed || 0,
          total: prev?.total || importedBills.length || 0,
        }));
        setSaving(false);
      }
    },
    [
      jwt,
      API_BASE_URL,
      onImportComplete,
      importedBills.length,
      friendId,
      navigateWithState,
    ]
  );

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setUploadMessage("");
    setSaveMessage("");
    setSaving(false);
    setIsUploading(false);
    resetImportState();
    // Reset file input
    const fileInput = document.getElementById("excel-upload");
    if (fileInput) fileInput.value = "";
  }, [resetImportState]);

  // Accordion expand/collapse handler
  const handleAccordionChange = useCallback(
    (panel) => (event, isExpanded) => {
      setExpandedAccordion(isExpanded ? panel : null);
    },
    []
  );

  // Pagination handlers
  const handlePageChange = useCallback(
    (newPage) => {
      setCurrentPage(Math.max(1, Math.min(newPage, totalPages)));
    },
    [totalPages]
  );

  // Change items per page (reset page & collapse accordions)
  const handleItemsPerPageChange = useCallback((e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      setItemsPerPage(value);
      setCurrentPage(1);
      setExpandedAccordion(null);
    }
  }, []);

  // Format currency using user settings
  const formatCurrency = useCallback(
    (amount) => {
      return `${currencySymbol}${(amount || 0).toFixed(2)}`;
    },
    [currencySymbol]
  );

  // Format date using user settings
  const formatDateDisplay = useCallback(
    (dateString) => {
      if (!dateString) return "N/A";
      try {
        return formatDate(dateString, dateFormat);
      } catch {
        return dateString;
      }
    },
    [dateFormat]
  );

  // UI helpers to match Bill component styling
  const getPaymentMethodColor = useCallback((method) => {
    if (!method) return "#757575";
    switch (String(method).toLowerCase()) {
      case "cash":
        return "#14b8a6";
      case "debit":
        return "#2196F3";
      case "credit":
        return "#FF9800";
      default:
        return "#757575";
    }
  }, []);

  const getTypeIcon = useCallback((type) => {
    return String(type).toLowerCase() === "gain" ? (
      <TrendingUpIcon sx={{ color: "#14b8a6" }} />
    ) : (
      <TrendingDownIcon sx={{ color: "#f44336" }} />
    );
  }, []);

  // Calculate total amount
  const totalAmount = useMemo(() => {
    return filteredAndSortedBills.reduce(
      (sum, bill) => sum + (bill.amount || 0),
      0
    );
  }, [filteredAndSortedBills]);

  return (
    <div
      className="fixed overflow-hidden flex flex-col rounded-2xl"
      style={{
        backgroundColor: isDarkMode ? colors.tertiary_bg : colors.secondary_bg,
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        right: "20px",
        top: "50px",
        border: `1px solid ${colors.border_color}`,
      }}
    >
      {/* Local scrollbar styles for the bills list */}
      <style>
        {`
          .custom-scrollbar {
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: ${colors.primary_accent} transparent; /* Firefox */
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: ${colors.primary_accent};
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: ${colors.primary_accent}dd;
          }

          /* Animated progress styles */
          .progress-container { position: relative; width: 100%; height: 8px; border-radius: 9999px; background-color: ${colors.hover_bg}; overflow: hidden; }
          .progress-bar { height: 100%; border-radius: 9999px; position: relative; background: linear-gradient(90deg, ${colors.primary_accent}, ${colors.primary_accent}dd, ${colors.primary_accent}); box-shadow: 0 0 12px ${colors.primary_accent}45; transition: width 300ms ease; }
          .progress-bar::after { content: ""; position: absolute; inset: 0; background-image: linear-gradient(45deg, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0) 25%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, rgba(255,255,255,0) 75%, rgba(255,255,255,0)); background-size: 1rem 1rem; animation: stripes 1s linear infinite; pointer-events: none; }
          @keyframes stripes { from { background-position: 0 0; } to { background-position: 1rem 0; } }
          .progress-bar--indeterminate { position: absolute; width: 30%; left: 0; animation: indeterminate 1.2s ease-in-out infinite; }
          @keyframes indeterminate { 0% { transform: translateX(-30%); } 50% { transform: translateX(50%); } 100% { transform: translateX(130%); } }
          .progress-meta { display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; font-size: 0.75rem; color: ${colors.secondary_text}; }
        `}
      </style>
      {/* Back Button (matches Bill component styling) */}
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
        <button
          aria-label="Back"
          onClick={() => {
            if (friendId && friendId !== "undefined") {
              navigateWithState(`/bill/${friendId}`);
            } else {
              navigateWithState("/bill");
            }
          }}
          className="rounded-full"
          style={{
            color: colors.primary_accent,
            backgroundColor: colors.secondary_bg,
            padding: 8,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = colors.hover_bg)
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = colors.secondary_bg)
          }
        >
          <svg
            width="24"
            height="24"
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
        </button>
      </div>
      {/* Header */}
      <div
        className="py-1 px-3 flex-shrink-0 text-center"
        style={{
          backgroundColor: isDarkMode
            ? colors.tertiary_bg
            : colors.secondary_bg,
        }}
      >
        <h2
          className="text-lg font-bold leading-tight"
          style={{ color: colors.primary_accent }}
        >
          Excel Bill Import Manager
        </h2>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* File Upload Section */}
        <div
          className="py-1.5 px-3 flex-shrink-0"
          style={{
            marginTop: "30px",
            backgroundColor: isDarkMode
              ? colors.secondary_bg
              : colors.primary_bg,
          }}
        >
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
                id="excel-upload"
                disabled={isUploading || isSaving}
              />
              <label
                htmlFor="excel-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 rounded-md disabled:opacity-50 text-sm shadow-sm"
                style={{
                  backgroundColor: colors.primary_accent,
                  color: colors.button_text,
                }}
              >
                📁 Select Excel File
              </label>
              {selectedFile && (
                <span
                  className="ml-3 text-sm"
                  style={{ color: colors.secondary_text }}
                >
                  {selectedFile.name}
                </span>
              )}
            </div>

            <button
              onClick={handleUploadExcel}
              disabled={!selectedFile || isUploading || isSaving}
              className="px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{
                backgroundColor: colors.primary_accent,
                color: colors.button_text,
              }}
            >
              {isUploading ? "⏳ Processing..." : "📤 Upload & Preview"}
            </button>

            <button
              onClick={handleReset}
              disabled={isUploading || isSaving}
              className="px-4 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              style={{
                backgroundColor: colors.tertiary_bg,
                color: colors.primary_text,
              }}
            >
              🔄 Reset
            </button>
          </div>

          {/* Messages / Progress: fixed-height container for consistent layout */}
          {(progress || isSaving || uploadMessage) && (
            <div
              className="mt-2 rounded-md h-14 flex items-center px-3"
              style={{ backgroundColor: colors.secondary_bg }}
            >
              {progress ? (
                progress.status === "COMPLETED" ? (
                  <div
                    className="text-sm"
                    style={{ color: colors.primary_text }}
                  >
                    {`${progress.processed}/${progress.total} processed`}
                  </div>
                ) : progress.status === "FAILED" ? (
                  <div className="text-sm text-[#f44336]">
                    {progress.message || "Import failed"}
                  </div>
                ) : (
                  <div className="w-full">
                    <div className="progress-container">
                      <div
                        className="progress-bar"
                        style={{
                          width: `${
                            progress.total > 0
                              ? (progress.processed / progress.total) * 100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <div className="progress-meta">
                      <span>
                        {progress.processed}/{progress.total} processed
                      </span>
                    </div>
                  </div>
                )
              ) : isSaving ? (
                // Keep height stable but do not show a progress bar until API provides counts
                <div className="w-full"></div>
              ) : (
                uploadMessage && (
                  <div
                    className={`text-sm ${
                      uploadMessage.includes("❌") ? "text-[#f44336]" : ""
                    }`}
                    style={{
                      width: "100%",
                      color: uploadMessage.includes("❌")
                        ? "#f44336"
                        : colors.primary_text,
                    }}
                  >
                    {uploadMessage}
                  </div>
                )
              )}
            </div>
          )}
        </div>

        {/* Preview Section */}
        {showPreview && importedBills.length > 0 && (
          <>
            {/* Controls Bar */}
            <div
              className="p-3 flex-shrink-0"
              style={{ backgroundColor: colors.secondary_bg }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Search and Filters */}
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Search bills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 rounded-md text-sm w-48 focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: colors.primary_bg,
                      color: colors.primary_text,
                      border: `1px solid ${colors.primary_accent}`,
                    }}
                  />

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: colors.primary_bg,
                      color: colors.primary_text,
                      border: `1px solid ${colors.primary_accent}`,
                    }}
                  >
                    <option
                      value=""
                      style={{ backgroundColor: colors.primary_bg }}
                    >
                      All Categories
                    </option>
                    {categories.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                        style={{ backgroundColor: colors.primary_bg }}
                      >
                        {cat}
                      </option>
                    ))}
                  </select>

                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [field, order] = e.target.value.split("-");
                      setSortBy(field);
                      setSortOrder(order);
                    }}
                    className="px-3 py-1 rounded-md text-sm focus:outline-none focus:ring-1"
                    style={{
                      backgroundColor: colors.primary_bg,
                      color: colors.primary_text,
                      border: `1px solid ${colors.primary_accent}`,
                    }}
                  >
                    <option
                      value="name-asc"
                      style={{ backgroundColor: colors.primary_bg }}
                    >
                      Name A-Z
                    </option>
                    <option
                      value="name-desc"
                      style={{ backgroundColor: colors.primary_bg }}
                    >
                      Name Z-A
                    </option>
                    <option
                      value="amount-desc"
                      style={{ backgroundColor: colors.primary_bg }}
                    >
                      Amount High-Low
                    </option>
                    <option
                      value="amount-asc"
                      style={{ backgroundColor: colors.primary_bg }}
                    >
                      Amount Low-High
                    </option>
                    <option
                      value="date-desc"
                      style={{ backgroundColor: colors.primary_bg }}
                    >
                      Date Newest
                    </option>
                    <option
                      value="date-asc"
                      style={{ backgroundColor: colors.primary_bg }}
                    >
                      Date Oldest
                    </option>
                  </select>
                </div>

                {/* Summary */}
                <div className="flex items-center space-x-4">
                  <span
                    className="text-sm font-medium"
                    style={{ color: colors.secondary_text }}
                  >
                    Total: {filteredAndSortedBills.length} bills
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: colors.primary_accent }}
                  >
                    Amount: {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Progress Display removed from here to avoid duplication */}
            </div>

            {/* Bills List (always scrollable) */}
            <div
              className="flex-1 custom-scrollbar"
              style={{
                overflowY: "auto",
                paddingRight: 4,
              }}
              aria-label="Imported bills list"
              tabIndex={0}
            >
              <div className="px-2 pt-1 pb-2">
                {currentBills.length === 0 ? (
                  <div
                    className="text-center py-8"
                    style={{ color: colors.secondary_text }}
                  >
                    No bills match your search criteria
                  </div>
                ) : (
                  <div>
                    {currentBills.map((bill, index) => {
                      const globalIndex = `${startIndex + index}`;

                      const BillAccordion = ({ bill, panelId }) => (
                        <Accordion
                          key={panelId}
                          expanded={expandedAccordion === panelId}
                          onChange={handleAccordionChange(panelId)}
                          sx={{
                            mb: 1.25,
                            boxShadow: isDarkMode
                              ? "0 4px 12px rgba(0,0,0,0.3)"
                              : "0 2px 8px rgba(0,0,0,0.1)",
                            borderRadius: "12px !important",
                            "&:before": { display: "none" },
                            overflow: "hidden",
                            backgroundColor: isDarkMode
                              ? colors.primary_bg
                              : colors.secondary_bg,
                            border: isDarkMode
                              ? "none"
                              : `1px solid ${colors.border_color}`,
                          }}
                        >
                          <AccordionSummary
                            expandIcon={
                              <ExpandMoreIcon
                                sx={{ color: colors.primary_accent }}
                              />
                            }
                            sx={{
                              backgroundColor: isDarkMode
                                ? colors.tertiary_bg
                                : colors.primary_bg,
                              borderRadius: "12px",
                              color: colors.primary_text,
                              minHeight: "56px",
                              height: "56px",
                              "&.Mui-expanded": {
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                minHeight: "56px",
                              },
                              "&:hover": {
                                backgroundColor: colors.hover_bg,
                              },
                              "& .MuiAccordionSummary-content": {
                                margin: "10px 0",
                                "&.Mui-expanded": {
                                  margin: "10px 0",
                                },
                              },
                            }}
                          >
                            <Box
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                width: "100%",
                              }}
                            >
                              <Avatar
                                sx={{
                                  bgcolor: getPaymentMethodColor(
                                    bill.paymentMethod
                                  ),
                                  mr: 2,
                                  width: 36,
                                  height: 36,
                                }}
                              >
                                <ReceiptIcon sx={{ fontSize: 22 }} />
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 600,
                                    color: colors.primary_text,
                                    fontSize: "1.0rem",
                                  }}
                                >
                                  {bill.name || "Unnamed Bill"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: colors.secondary_text,
                                    fontSize: "0.85rem",
                                  }}
                                >
                                  {bill.description ||
                                    bill.category ||
                                    "No description"}
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 2,
                                }}
                              >
                                {getTypeIcon(bill.type)}
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    color:
                                      String(bill.type).toLowerCase() === "gain"
                                        ? "#14b8a6"
                                        : "#f44336",
                                    fontWeight: 600,
                                    fontSize: "1.0rem",
                                  }}
                                >
                                  {formatCurrency(bill.amount)}
                                </Typography>
                                <Chip
                                  label={(bill.paymentMethod || "UNKNOWN")
                                    .toString()
                                    .toUpperCase()}
                                  size="small"
                                  sx={{
                                    backgroundColor: getPaymentMethodColor(
                                      bill.paymentMethod
                                    ),
                                    color: "white",
                                    fontWeight: 600,
                                    height: "24px",
                                    fontSize: "0.7rem",
                                  }}
                                />
                              </Box>
                            </Box>
                          </AccordionSummary>

                          <AccordionDetails
                            sx={{
                              p: 2,
                              backgroundColor: isDarkMode
                                ? colors.primary_bg
                                : colors.primary_bg,
                            }}
                          >
                            <Grid container spacing={3}>
                              {/* Bill Summary */}
                              <Grid item xs={12} md={6} sx={{ pb: 1 }}>
                                <Paper
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor: isDarkMode
                                      ? colors.tertiary_bg
                                      : colors.secondary_bg,
                                    border: isDarkMode
                                      ? "none"
                                      : `1px solid ${colors.border_color}`,
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      mb: 1.25,
                                      display: "flex",
                                      alignItems: "center",
                                      color: colors.primary_text,
                                    }}
                                  >
                                    <MoneyIcon
                                      sx={{
                                        mr: 1,
                                        color: colors.primary_accent,
                                      }}
                                    />
                                    Bill Summary
                                  </Typography>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ color: colors.secondary_text }}
                                    >
                                      Total Amount:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      sx={{ color: colors.primary_text }}
                                    >
                                      {formatCurrency(bill.amount)}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ color: colors.secondary_text }}
                                    >
                                      Net Amount:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      sx={{ color: colors.primary_text }}
                                    >
                                      {formatCurrency(bill.netAmount)}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ color: colors.secondary_text }}
                                    >
                                      Credit Due:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      color="error"
                                    >
                                      {formatCurrency(bill.creditDue)}
                                    </Typography>
                                  </Box>
                                  <Divider
                                    sx={{
                                      my: 1,
                                      backgroundColor: isDarkMode
                                        ? colors.primary_accent
                                        : colors.border_color,
                                    }}
                                  />
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                      mb: 1,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ color: colors.secondary_text }}
                                    >
                                      Date:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      sx={{ color: colors.primary_text }}
                                    >
                                      {formatDateDisplay(bill.date)}
                                    </Typography>
                                  </Box>
                                  <Box
                                    sx={{
                                      display: "flex",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      sx={{ color: colors.secondary_text }}
                                    >
                                      Type:
                                    </Typography>
                                    <Chip
                                      label={String(
                                        bill.type || "N/A"
                                      ).toUpperCase()}
                                      size="small"
                                      sx={{
                                        backgroundColor:
                                          String(bill.type).toLowerCase() ===
                                          "gain"
                                            ? "#14b8a6"
                                            : "#f44336",
                                        color: "white",
                                      }}
                                    />
                                  </Box>
                                </Paper>
                              </Grid>

                              {/* Detailed Expenses */}
                              <Grid item xs={12} md={6}>
                                <Paper
                                  sx={{
                                    p: 1.5,
                                    borderRadius: 2,
                                    backgroundColor: isDarkMode
                                      ? colors.tertiary_bg
                                      : colors.secondary_bg,
                                    border: isDarkMode
                                      ? "none"
                                      : `1px solid ${colors.border_color}`,
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      mb: 1.25,
                                      display: "flex",
                                      alignItems: "center",
                                      color: colors.primary_text,
                                    }}
                                  >
                                    <ListIcon
                                      sx={{
                                        mr: 1,
                                        color: colors.primary_accent,
                                      }}
                                    />
                                    Detailed Expenses
                                  </Typography>
                                  <List dense>
                                    {bill.expenses &&
                                    bill.expenses.length > 0 ? (
                                      bill.expenses.map((expense, expIndex) => (
                                        <ListItem
                                          key={expIndex}
                                          sx={{
                                            backgroundColor: isDarkMode
                                              ? colors.primary_bg
                                              : colors.primary_bg,
                                            borderRadius: 1,
                                            mb: 1,
                                            border: isDarkMode
                                              ? "none"
                                              : `1px solid ${colors.border_color}`,
                                          }}
                                        >
                                          <ListItemText
                                            primary={
                                              <Box
                                                sx={{
                                                  display: "flex",
                                                  justifyContent:
                                                    "space-between",
                                                  alignItems: "center",
                                                }}
                                              >
                                                <Typography
                                                  variant="body2"
                                                  fontWeight={600}
                                                  sx={{
                                                    color: colors.primary_text,
                                                  }}
                                                >
                                                  {expense.itemName || "N/A"}
                                                </Typography>
                                                <Typography
                                                  variant="body2"
                                                  fontWeight={600}
                                                  sx={{
                                                    color:
                                                      colors.primary_accent,
                                                  }}
                                                >
                                                  {formatCurrency(
                                                    expense.totalPrice
                                                  )}
                                                </Typography>
                                              </Box>
                                            }
                                            secondary={
                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color: colors.secondary_text,
                                                }}
                                              >
                                                Qty: {expense.quantity || 0} ×{" "}
                                                {formatCurrency(
                                                  expense.unitPrice
                                                )}
                                              </Typography>
                                            }
                                          />
                                        </ListItem>
                                      ))
                                    ) : (
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          color: colors.secondary_text,
                                          textAlign: "center",
                                          py: 1.25,
                                        }}
                                      >
                                        No detailed expenses available
                                      </Typography>
                                    )}
                                  </List>
                                </Paper>
                              </Grid>
                            </Grid>
                          </AccordionDetails>
                        </Accordion>
                      );

                      return (
                        <BillAccordion
                          key={globalIndex}
                          bill={bill}
                          panelId={globalIndex}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div
                className="py-2 px-2 flex-shrink-0"
                style={{
                  backgroundColor: colors.primary_bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                }}
              >
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: colors.primary_bg,
                    color: colors.primary_text,
                    border: `1px solid ${colors.border_color}`,
                    padding: "4px 8px",
                    fontSize: "14px",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    opacity: currentPage === 1 ? 0.45 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = colors.hover_bg;
                      e.currentTarget.style.borderColor = colors.primary_accent;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary_bg;
                    e.currentTarget.style.borderColor = colors.border_color;
                  }}
                >
                  Prev
                </button>

                <div style={{ display: "flex", gap: "6px" }}>
                  {(() => {
                    const maxWindow = 2; // pages each side
                    const elems = [];

                    const push = (n) =>
                      elems.push(
                        <button
                          key={n}
                          onClick={() => handlePageChange(n)}
                          className="rounded-lg transition-all duration-200"
                          style={{
                            backgroundColor:
                              currentPage === n
                                ? colors.primary_accent
                                : colors.primary_bg,
                            color:
                              currentPage === n
                                ? colors.button_text
                                : colors.primary_text,
                            border: `1px solid ${
                              currentPage === n
                                ? colors.primary_accent
                                : colors.border_color
                            }`,
                            padding: "4px 8px",
                            fontSize: "14px",
                            minWidth: "32px",
                            cursor: "pointer",
                          }}
                          onMouseEnter={(e) => {
                            if (currentPage !== n) {
                              e.currentTarget.style.backgroundColor =
                                colors.hover_bg;
                              e.currentTarget.style.borderColor =
                                colors.primary_accent;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (currentPage !== n) {
                              e.currentTarget.style.backgroundColor =
                                colors.primary_bg;
                              e.currentTarget.style.borderColor =
                                colors.border_color;
                            }
                          }}
                        >
                          {n}
                        </button>
                      );

                    push(1);

                    const left = Math.max(2, currentPage - maxWindow);
                    const right = Math.min(
                      totalPages - 1,
                      currentPage + maxWindow
                    );

                    if (left > 2)
                      elems.push(
                        <span
                          key="l-ell"
                          style={{
                            padding: "4px 6px",
                            fontSize: "14px",
                            color: colors.secondary_text,
                          }}
                        >
                          ...
                        </span>
                      );

                    for (let p = left; p <= right; p++) push(p);

                    if (right < totalPages - 1)
                      elems.push(
                        <span
                          key="r-ell"
                          style={{
                            padding: "4px 6px",
                            fontSize: "14px",
                            color: colors.secondary_text,
                          }}
                        >
                          ...
                        </span>
                      );

                    if (totalPages > 1) push(totalPages);

                    return elems;
                  })()}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="rounded-lg transition-all duration-200"
                  style={{
                    backgroundColor: colors.primary_bg,
                    color: colors.primary_text,
                    border: `1px solid ${colors.border_color}`,
                    padding: "4px 8px",
                    fontSize: "14px",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                    opacity: currentPage === totalPages ? 0.45 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = colors.hover_bg;
                      e.currentTarget.style.borderColor = colors.primary_accent;
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary_bg;
                    e.currentTarget.style.borderColor = colors.border_color;
                  }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Instructions Footer */}
      <div
        className="px-3 py-1.5 flex items-center justify-between gap-3"
        style={{
          backgroundColor: colors.secondary_bg,
          borderTop: `1px solid ${colors.border_color}`,
        }}
      >
        <div
          className="text-xs flex-1 text-left"
          style={{ color: colors.secondary_text }}
        >
          <strong>Instructions:</strong> Select Excel file → Upload & Preview →
          Review bills → Save All Bills → Monitor progress
        </div>
        <div className="flex-1 flex justify-end">
          {/* Save Button */}
          <button
            onClick={handleSaveBills}
            disabled={isSaving}
            className="px-4 py-1.5 rounded-md disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            style={{
              backgroundColor: colors.primary_accent,
              color: colors.button_text,
            }}
          >
            {isSaving ? "⏳ Saving..." : "💾 Save All Bills"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadBills;
