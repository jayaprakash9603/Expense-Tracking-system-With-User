import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useSelector } from "react-redux";
import { api } from "../../config/api";
import { useNavigate, useParams } from "react-router";
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
  const navigate = useNavigate();
  const { friendId } = useParams();

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
                navigate(`/bill/${friendId}`);
              } else {
                navigate("/bill");
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
      navigate,
      friendId,
    ]
  );

  // Reset component state
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

  const handleItemsPerPageChange = useCallback((newItemsPerPage) => {
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  }, []);

  // Format currency
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  }, []);

  // Format date
  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  }, []);

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
      className="fixed bg-[#0b0b0b] shadow-2xl overflow-hidden flex flex-col rounded-2xl"
      style={{
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        right: "20px",
        top: "50px",
      }}
    >
      {/* Local scrollbar styles for the bills list */}
      <style>
        {`
          .custom-scrollbar {
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: #14b8a6 transparent; /* Firefox */
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #14b8a6;
            border-radius: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #0d9488;
          }

          /* Animated progress styles */
          .progress-container { position: relative; width: 100%; height: 8px; border-radius: 9999px; background-color: #1b1b1b; overflow: hidden; }
          .progress-bar { height: 100%; border-radius: 9999px; position: relative; background: linear-gradient(90deg, #14b8a6, #1dd4bf, #14b8a6); box-shadow: 0 0 12px rgba(20,184,166,0.45); transition: width 300ms ease; }
          .progress-bar::after { content: ""; position: absolute; inset: 0; background-image: linear-gradient(45deg, rgba(255,255,255,0.25) 25%, rgba(255,255,255,0) 25%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.25) 75%, rgba(255,255,255,0) 75%, rgba(255,255,255,0)); background-size: 1rem 1rem; animation: stripes 1s linear infinite; pointer-events: none; }
          @keyframes stripes { from { background-position: 0 0; } to { background-position: 1rem 0; } }
          .progress-bar--indeterminate { position: absolute; width: 30%; left: 0; animation: indeterminate 1.2s ease-in-out infinite; }
          @keyframes indeterminate { 0% { transform: translateX(-30%); } 50% { transform: translateX(50%); } 100% { transform: translateX(130%); } }
          .progress-meta { display: flex; justify-content: flex-end; gap: 8px; margin-top: 6px; font-size: 0.75rem; color: #9ca3af; }
        `}
      </style>
      {/* Back Button (matches Bill component styling) */}
      <div style={{ position: "absolute", top: 16, left: 16, zIndex: 10 }}>
        <button
          aria-label="Back"
          onClick={() =>
            friendId && friendId !== "undefined"
              ? navigate(`/bill/${friendId}`)
              : navigate("/bill")
          }
          className="rounded-full"
          style={{
            color: "#00DAC6",
            backgroundColor: "#1b1b1b",
            padding: 8,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#28282a")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "#1b1b1b")
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
              stroke="#00DAC6"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {/* Header */}
      <div className="bg-[#0b0b0b] py-2 px-4 flex-shrink-0 text-center">
        <h2 className="text-xl font-bold text-[#14b8a6]">
          Excel Bill Import Manager
        </h2>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* File Upload Section */}
        <div className="py-2 px-4 bg-[#1b1b1b] flex-shrink-0">
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
                className="cursor-pointer inline-flex items-center px-4 py-2 bg-[#14b8a6] text-white rounded-md hover:bg-[#0d9488] disabled:opacity-50 text-sm shadow-sm"
              >
                📁 Select Excel File
              </label>
              {selectedFile && (
                <span className="ml-3 text-sm text-gray-300">
                  {selectedFile.name}
                </span>
              )}
            </div>

            <button
              onClick={handleUploadExcel}
              disabled={!selectedFile || isUploading || isSaving}
              className="px-4 py-2 bg-[#14b8a6] text-white rounded-md hover:bg-[#0d9488] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isUploading ? "⏳ Processing..." : "📤 Upload & Preview"}
            </button>

            <button
              onClick={handleReset}
              disabled={isUploading || isSaving}
              className="px-4 py-2 bg-[#111827] text-white rounded-md hover:bg-[#1f2937] disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              🔄 Reset
            </button>
          </div>

          {/* Messages / Progress: fixed-height container for consistent layout */}
          {(progress || isSaving || uploadMessage) && (
            <div className="mt-3 bg-[#0b0b0b] rounded-md h-16 flex items-center px-3">
              {progress ? (
                progress.status === "COMPLETED" ? (
                  <div className="text-sm text-white">
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
                      uploadMessage.includes("❌")
                        ? "text-[#f44336]"
                        : "text-white"
                    }`}
                    style={{ width: "100%" }}
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
            <div className="p-4 bg-[#0b0b0b] flex-shrink-0">
              <div className="flex flex-wrap items-center justify-between gap-4">
                {/* Search and Filters */}
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Search bills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-3 py-1 bg-[#0b0b0b] text-white placeholder-gray-500 rounded-md text-sm w-48 focus:outline-none focus:ring-1 focus:ring-[#14b8a6] border border-[#14b8a6]"
                  />

                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-1 bg-[#0b0b0b] text-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#14b8a6] border border-[#14b8a6]"
                  >
                    <option value="" className="bg-[#0b0b0b]">
                      All Categories
                    </option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat} className="bg-[#0b0b0b]">
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
                    className="px-3 py-1 bg-[#0b0b0b] text-white rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[#14b8a6] border border-[#14b8a6]"
                  >
                    <option value="name-asc" className="bg-[#0b0b0b]">
                      Name A-Z
                    </option>
                    <option value="name-desc" className="bg-[#0b0b0b]">
                      Name Z-A
                    </option>
                    <option value="amount-desc" className="bg-[#0b0b0b]">
                      Amount High-Low
                    </option>
                    <option value="amount-asc" className="bg-[#0b0b0b]">
                      Amount Low-High
                    </option>
                    <option value="date-desc" className="bg-[#0b0b0b]">
                      Date Newest
                    </option>
                    <option value="date-asc" className="bg-[#0b0b0b]">
                      Date Oldest
                    </option>
                  </select>
                </div>

                {/* Summary */}
                <div className="flex items-center space-x-4">
                  <span className="text-sm font-medium text-gray-300">
                    Total: {filteredAndSortedBills.length} bills
                  </span>
                  <span className="text-sm font-medium text-[#14b8a6]">
                    Amount: {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              {/* Progress Display removed from here to avoid duplication */}
            </div>

            {/* Bills List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="px-3 pt-1 pb-3">
                {currentBills.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
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
                            mb: 2,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                            borderRadius: "12px !important",
                            "&:before": { display: "none" },
                            overflow: "hidden",
                            backgroundColor: "#1b1b1b",
                            border: "none",
                          }}
                        >
                          <AccordionSummary
                            expandIcon={
                              <ExpandMoreIcon sx={{ color: "#14b8a6" }} />
                            }
                            sx={{
                              backgroundColor: "#0b0b0b",
                              borderRadius: "12px",
                              color: "#fff",
                              minHeight: "64px",
                              height: "64px",
                              "&.Mui-expanded": {
                                borderBottomLeftRadius: 0,
                                borderBottomRightRadius: 0,
                                minHeight: "64px",
                              },
                              "&:hover": {
                                backgroundColor: "#1b1b1b",
                              },
                              "& .MuiAccordionSummary-content": {
                                margin: "16px 0",
                                "&.Mui-expanded": {
                                  margin: "16px 0",
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
                                  width: 40,
                                  height: 40,
                                }}
                              >
                                <ReceiptIcon sx={{ fontSize: 22 }} />
                              </Avatar>
                              <Box sx={{ flexGrow: 1 }}>
                                <Typography
                                  variant="subtitle1"
                                  sx={{
                                    fontWeight: 600,
                                    color: "#fff",
                                    fontSize: "1.1rem",
                                  }}
                                >
                                  {bill.name || "Unnamed Bill"}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#b0b0b0", fontSize: "0.85rem" }}
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
                                    fontSize: "1.1rem",
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
                                    height: "28px",
                                    fontSize: "0.8rem",
                                  }}
                                />
                              </Box>
                            </Box>
                          </AccordionSummary>

                          <AccordionDetails
                            sx={{ p: 3, backgroundColor: "#1b1b1b" }}
                          >
                            <Grid container spacing={3}>
                              {/* Bill Summary */}
                              <Grid item xs={12} md={6}>
                                <Paper
                                  sx={{
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: "#0b0b0b",
                                    border: "none",
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      mb: 2,
                                      display: "flex",
                                      alignItems: "center",
                                      color: "#fff",
                                    }}
                                  >
                                    <MoneyIcon
                                      sx={{ mr: 1, color: "#14b8a6" }}
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
                                      sx={{ color: "#b0b0b0" }}
                                    >
                                      Total Amount:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      sx={{ color: "#fff" }}
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
                                      sx={{ color: "#b0b0b0" }}
                                    >
                                      Net Amount:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      sx={{ color: "#fff" }}
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
                                      sx={{ color: "#b0b0b0" }}
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
                                    sx={{ my: 1, backgroundColor: "#14b8a6" }}
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
                                      sx={{ color: "#b0b0b0" }}
                                    >
                                      Date:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={600}
                                      sx={{ color: "#fff" }}
                                    >
                                      {formatDate(bill.date)}
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
                                      sx={{ color: "#b0b0b0" }}
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
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: "#0b0b0b",
                                    border: "none",
                                  }}
                                >
                                  <Typography
                                    variant="h6"
                                    sx={{
                                      mb: 2,
                                      display: "flex",
                                      alignItems: "center",
                                      color: "#fff",
                                    }}
                                  >
                                    <ListIcon
                                      sx={{ mr: 1, color: "#14b8a6" }}
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
                                            backgroundColor: "#1b1b1b",
                                            borderRadius: 1,
                                            mb: 1,
                                            border: "none",
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
                                                  sx={{ color: "#fff" }}
                                                >
                                                  {expense.itemName || "N/A"}
                                                </Typography>
                                                <Typography
                                                  variant="body2"
                                                  fontWeight={600}
                                                  sx={{ color: "#14b8a6" }}
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
                                                sx={{ color: "#b0b0b0" }}
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
                                          color: "#b0b0b0",
                                          textAlign: "center",
                                          py: 2,
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
                className="py-1 px-2 bg-[#1b1b1b] flex-shrink-0"
                style={{ paddingTop: "15px", paddingBottom: "9px" }}
              >
                <div className="grid grid-cols-3 items-center">
                  {/* Left spacer to allow centering */}
                  <div></div>

                  {/* Center pagination controls */}
                  <div className="flex items-center justify-center space-x-2">
                    <span className="text-xs text-gray-300">
                      {startIndex + 1}-
                      {Math.min(endIndex, filteredAndSortedBills.length)} of{" "}
                      {filteredAndSortedBills.length}
                    </span>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-0.5 rounded hover:bg-[#0f0f10] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                      >
                        <FaChevronLeft className="h-4 w-4" />
                      </button>
                      <span className="px-2 py-0.5 text-xs text-gray-300">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-0.5 rounded hover:bg-[#0f0f10] disabled:opacity-50 disabled:cursor-not-allowed text-white"
                      >
                        <FaChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right: page size selector */}
                  <div className="flex items-center justify-end space-x-2">
                    <span className="text-xs text-gray-300">Show:</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) =>
                        handleItemsPerPageChange(Number(e.target.value))
                      }
                      className="px-2 py-0.5 bg-[#0b0b0b] text-white rounded text-xs focus:outline-none focus:ring-1 focus:ring-[#14b8a6] border border-[#14b8a6]"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                    <span className="text-xs text-gray-300">per page</span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Instructions Footer */}
      <div className="p-3 bg-[#0b0b0b] border-t border-[#1b1b1b] flex items-center justify-between gap-3">
        <div className="text-xs text-gray-400 flex-1 text-left">
          <strong>Instructions:</strong> Select Excel file → Upload & Preview →
          Review bills → Save All Bills → Monitor progress
        </div>
        <div className="flex-1 flex justify-end">
          {/* Save Button */}
          <button
            onClick={handleSaveBills}
            disabled={isSaving}
            className="px-6 py-2 bg-[#14b8a6] text-white rounded-md hover:bg-[#0d9488] disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
          >
            {isSaving ? "⏳ Saving..." : "💾 Save All Bills"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadBills;
