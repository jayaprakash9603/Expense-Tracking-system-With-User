import React, { useState, useCallback, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Button,
  Typography,
  CircularProgress,
  IconButton,
  Tooltip,
  Alert,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  Grid,
} from "@mui/material";
import {
  FaTimes,
  FaCamera,
  FaUpload,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaReceipt,
  FaTrash,
  FaPlus,
} from "react-icons/fa";
import { useTheme } from "../../hooks/useTheme";
import { useTranslation } from "../../hooks/useTranslation";
import {
  scanReceipt,
  scanMultipleReceipts,
  clearScanResult,
  updateScanField,
} from "../../Redux/Bill/bill.action";

/**
 * ReceiptScanModal - OCR Receipt Scanning Component
 *
 * Allows users to upload multiple receipt images for automatic expense data extraction.
 * Features:
 * - Multiple file upload (for multi-page receipts like Star Bazaar)
 * - Drag and drop image upload
 * - Image preview gallery
 * - OCR processing with loading state
 * - Confidence indicators for extracted fields
 * - Manual field override capability
 * - Auto-fill expense form with merged data
 */
const ReceiptScanModal = ({ isOpen, onClose, onDataExtracted }) => {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  // Local state - now supports multiple files
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [editedData, setEditedData] = useState(null);

  // Redux state
  const { scanning, scanResult, scanError } = useSelector(
    (state) => state.bill?.ocr || {},
  );

  // Allowed image formats
  const allowedFormats = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
  ];
  const maxFileSize = 10 * 1024 * 1024; // 10MB per file
  const maxFiles = 10;

  const getPluralizedLabel = useCallback(
    (count, singularKey, pluralKey, params = {}) =>
      t(count === 1 ? singularKey : pluralKey, { count, ...params }),
    [t],
  );

  // Handle file selection (supports multiple files)
  const handleFileSelect = useCallback(
    (files) => {
      if (!files || files.length === 0) return;

      const newFiles = [];
      const newPreviews = [];
      const errors = [];

      Array.from(files).forEach((file) => {
        // Check total file limit
        if (selectedFiles.length + newFiles.length >= maxFiles) {
          errors.push(
            t("billCommon.receiptScanner.errors.fileLimit", {
              max: maxFiles,
            }),
          );
          return;
        }

        // Validate file type
        if (!allowedFormats.includes(file.type)) {
          errors.push(
            t("billCommon.receiptScanner.errors.invalidFormat", {
              fileName: file.name,
            }),
          );
          return;
        }

        // Validate file size
        if (file.size > maxFileSize) {
          errors.push(
            t("billCommon.receiptScanner.errors.fileSize", {
              fileName: file.name,
            }),
          );
          return;
        }

        newFiles.push(file);
        newPreviews.push(URL.createObjectURL(file));
      });

      if (errors.length > 0) {
        window.alert(errors.join("\n"));
      }

      if (newFiles.length > 0) {
        setSelectedFiles((prev) => [...prev, ...newFiles]);
        setPreviewUrls((prev) => [...prev, ...newPreviews]);
        setEditedData(null);
        dispatch(clearScanResult());
      }
    },
    [dispatch, selectedFiles.length, t],
  );

  // Remove a single file
  const handleRemoveFile = useCallback(
    (index) => {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
      setPreviewUrls((prev) => {
        // Revoke the URL to free memory
        URL.revokeObjectURL(prev[index]);
        return prev.filter((_, i) => i !== index);
      });
      setEditedData(null);
      dispatch(clearScanResult());
    },
    [dispatch],
  );

  // Clear all files
  const handleClearAll = useCallback(() => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setEditedData(null);
    dispatch(clearScanResult());
  }, [dispatch, previewUrls]);

  // Handle drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  // Handle drop (supports multiple files)
  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [handleFileSelect],
  );

  // Handle file input change (supports multiple files)
  const handleInputChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Process receipt(s) with OCR
  const handleScanReceipt = async () => {
    if (selectedFiles.length === 0) return;

    try {
      let result;
      if (selectedFiles.length === 1) {
        // Single file - use original endpoint
        result = await dispatch(scanReceipt(selectedFiles[0]));
      } else {
        // Multiple files - use merge endpoint
        result = await dispatch(scanMultipleReceipts(selectedFiles));
      }

      if (result) {
        setEditedData({
          merchant: result.merchant || "",
          amount: result.amount || "",
          date: result.date || "",
          tax: result.tax || "",
          suggestedCategory: result.suggestedCategory || "",
          paymentMethod: result.paymentMethod || "",
          currency: result.currency || "INR",
        });
      }
    } catch (error) {
      console.error("OCR scan failed:", error);
    }
  };

  // Handle field edit
  const handleFieldChange = (field, value) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: value,
    }));
    dispatch(updateScanField(field, value));
  };

  // Get currency symbol
  const getCurrencySymbol = (currency) => {
    const symbols = { INR: "₹", USD: "$", EUR: "€", GBP: "£", JPY: "¥" };
    return symbols[currency] || currency || "₹";
  };

  // Submit extracted data
  const handleUseData = () => {
    if (editedData && onDataExtracted) {
      const currencySymbol = getCurrencySymbol(editedData.currency);
      const defaultName = t("billCommon.receiptScanner.defaults.expenseName");
      const descriptionPrefix = t(
        "billCommon.receiptScanner.defaults.descriptionPrefix",
      );
      const descriptionTaxSuffix = editedData.tax
        ? t("billCommon.receiptScanner.defaults.taxSuffix", {
            currency: currencySymbol,
            amount: editedData.tax,
          })
        : "";
      onDataExtracted({
        name: editedData.merchant || defaultName,
        amount: parseFloat(editedData.amount) || 0,
        date: editedData.date || new Date().toISOString().split("T")[0],
        category: editedData.suggestedCategory || "",
        paymentMethod: editedData.paymentMethod || "",
        description: `${descriptionPrefix}${descriptionTaxSuffix}`,
        rawOcrText: scanResult?.rawText || "",
        currency: editedData.currency || "INR",
      });
      handleClose();
    }
  };

  // Close modal and cleanup
  const handleClose = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setEditedData(null);
    setDragActive(false);
    dispatch(clearScanResult());
    onClose();
  };

  // Get confidence badge color
  const getConfidenceBadge = (fieldName) => {
    const confidenceMap = scanResult?.confidenceMap || {};
    const fieldConfidence = confidenceMap[fieldName];

    if (!fieldConfidence) return null;

    const level = fieldConfidence.level?.toLowerCase() || "low";
    const colorMap = {
      high: { bg: "#4caf50", text: "#fff" },
      medium: { bg: "#ff9800", text: "#fff" },
      low: { bg: "#f44336", text: "#fff" },
    };

    const badgeColors = colorMap[level] || colorMap.low;
    const labelKey = `billCommon.receiptScanner.badges.labels.${level}`;
    const translatedLabel = t(labelKey);
    const labelText = translatedLabel === labelKey ? level : translatedLabel;
    const tooltipText =
      fieldConfidence.reason ||
      t("billCommon.receiptScanner.badges.tooltipFallback", {
        level: labelText,
      });

    return (
      <Tooltip title={tooltipText}>
        <Chip
          size="small"
          label={labelText}
          sx={{
            backgroundColor: badgeColors.bg,
            color: badgeColors.text,
            fontSize: "0.65rem",
            height: "20px",
            ml: 1,
          }}
        />
      </Tooltip>
    );
  };

  if (!isOpen) return null;

  return (
    <Box
      className="fixed inset-0 flex justify-center items-center z-50 p-4"
      sx={{ backgroundColor: `${colors.primary_bg}99` }}
    >
      <Box
        sx={{
          backgroundColor: colors.primary_bg,
          color: colors.primary_text,
          borderRadius: 2,
          width: "100%",
          maxWidth: "700px",
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: 24,
          position: "relative",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: `1px solid ${colors.border || colors.tertiary_bg}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaReceipt size={24} style={{ color: colors.primary_accent }} />
            <Typography variant="h6" fontWeight="600">
              {t("billCommon.receiptScanner.title")}
            </Typography>
          </Box>
          <IconButton onClick={handleClose} size="small">
            <FaTimes style={{ color: colors.secondary_text }} />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ p: 3 }}>
          {/* Upload Area */}
          {!scanResult && (
            <Box
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              sx={{
                border: `2px dashed ${dragActive ? colors.primary_accent : colors.border || colors.tertiary_bg}`,
                borderRadius: 2,
                p: 4,
                textAlign: "center",
                backgroundColor: dragActive
                  ? `${colors.primary_accent}10`
                  : colors.tertiary_bg,
                transition: "all 0.2s ease",
                cursor: "pointer",
                mb: 3,
              }}
              onClick={handleUploadClick}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleInputChange}
                style={{ display: "none" }}
              />

              {previewUrls.length > 0 ? (
                <Box onClick={(e) => e.stopPropagation()}>
                  {/* File count badge */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      mb: 2,
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={getPluralizedLabel(
                        selectedFiles.length,
                        "billCommon.receiptScanner.fileCountSingular",
                        "billCommon.receiptScanner.fileCountPlural",
                      )}
                      color="primary"
                      size="small"
                    />
                    {selectedFiles.length < maxFiles && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FaPlus />}
                        onClick={handleUploadClick}
                        sx={{
                          borderColor: colors.primary_accent,
                          color: colors.primary_accent,
                        }}
                      >
                        {t("billCommon.receiptScanner.addMore")}
                      </Button>
                    )}
                    <Button
                      variant="outlined"
                      size="small"
                      color="error"
                      startIcon={<FaTrash />}
                      onClick={handleClearAll}
                    >
                      {t("billCommon.receiptScanner.clearAll")}
                    </Button>
                  </Box>

                  {/* Image Gallery */}
                  <Grid container spacing={1} justifyContent="center">
                    {previewUrls.map((url, index) => (
                      <Grid item key={index} xs={6} sm={4} md={3}>
                        <Box
                          sx={{
                            position: "relative",
                            borderRadius: 1,
                            overflow: "hidden",
                            border: `1px solid ${colors.border}`,
                            backgroundColor: colors.secondary_bg,
                          }}
                        >
                          <img
                            src={url}
                            alt={t("billCommon.receiptScanner.imageAlt", {
                              number: index + 1,
                            })}
                            style={{
                              width: "100%",
                              height: "120px",
                              objectFit: "cover",
                            }}
                          />
                          <Box
                            sx={{
                              position: "absolute",
                              top: 0,
                              left: 0,
                              backgroundColor: "rgba(0,0,0,0.7)",
                              color: "#fff",
                              px: 1,
                              py: 0.25,
                              fontSize: "0.7rem",
                              borderBottomRightRadius: 4,
                            }}
                          >
                            {t("billCommon.receiptScanner.pageLabel", {
                              number: index + 1,
                            })}
                          </Box>
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveFile(index)}
                            sx={{
                              position: "absolute",
                              top: 4,
                              right: 4,
                              backgroundColor: "rgba(244,67,54,0.9)",
                              color: "#fff",
                              padding: "4px",
                              "&:hover": { backgroundColor: "#d32f2f" },
                            }}
                          >
                            <FaTimes size={10} />
                          </IconButton>
                        </Box>
                        <Typography
                          variant="caption"
                          sx={{
                            display: "block",
                            mt: 0.5,
                            textAlign: "center",
                          }}
                          noWrap
                        >
                          {selectedFiles[index]?.name}
                        </Typography>
                      </Grid>
                    ))}
                  </Grid>

                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ display: "block", mt: 2 }}
                  >
                    {t("billCommon.receiptScanner.tip")}
                  </Typography>
                </Box>
              ) : (
                <Box>
                  <FaUpload
                    size={48}
                    style={{
                      color: colors.secondary_text,
                      marginBottom: "16px",
                    }}
                  />
                  <Typography variant="h6" gutterBottom>
                    {t("billCommon.receiptScanner.dropTitle")}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="textSecondary"
                    gutterBottom
                  >
                    {t("billCommon.receiptScanner.dropSubtitle")}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="textSecondary"
                    sx={{ display: "block" }}
                  >
                    {t("billCommon.receiptScanner.supportedFormats")}
                  </Typography>
                  <Chip
                    label={t("billCommon.receiptScanner.multiPageChip")}
                    size="small"
                    sx={{
                      mt: 1,
                      backgroundColor: colors.primary_accent + "20",
                      color: colors.primary_accent,
                    }}
                  />
                </Box>
              )}
            </Box>
          )}

          {/* Scan Button */}
          {selectedFiles.length > 0 && !scanResult && (
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={handleScanReceipt}
                disabled={scanning}
                startIcon={
                  scanning ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FaCamera />
                  )
                }
                sx={{
                  backgroundColor: colors.primary_accent,
                  "&:hover": { backgroundColor: colors.primary_accent_hover },
                  minWidth: "200px",
                }}
              >
                {scanning
                  ? getPluralizedLabel(
                      selectedFiles.length,
                      "billCommon.receiptScanner.scanButtonProcessingSingular",
                      "billCommon.receiptScanner.scanButtonProcessingPlural",
                    )
                  : getPluralizedLabel(
                      selectedFiles.length,
                      "billCommon.receiptScanner.scanButtonReadySingular",
                      "billCommon.receiptScanner.scanButtonReadyPlural",
                    )}
              </Button>
            </Box>
          )}

          {/* Error Display */}
          {scanError && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                backgroundColor: "rgba(244, 67, 54, 0.12)",
                border: "1px solid rgba(244, 67, 54, 0.3)",
                color: "#fff",
                "& .MuiAlert-icon": {
                  color: "#f44336",
                },
              }}
            >
              {scanError}
            </Alert>
          )}

          {/* Scan Results */}
          {scanResult && editedData && (
            <Box>
              {/* Confidence Overview */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  mb: 3,
                  p: 2,
                  backgroundColor: colors.tertiary_bg,
                  borderRadius: 1,
                }}
              >
                <FaInfoCircle
                  size={20}
                  style={{ color: colors.primary_accent }}
                />
                <Box>
                  <Typography variant="body2" fontWeight="500">
                    {t("billCommon.receiptScanner.confidenceTitle", {
                      confidence: Math.round(scanResult.overallConfidence || 0),
                    })}
                  </Typography>
                  <Typography variant="caption" color="textSecondary">
                    {t("billCommon.receiptScanner.confidenceHint")}
                  </Typography>
                </Box>
              </Box>

              {/* Warnings */}
              {scanResult.warnings && scanResult.warnings.length > 0 && (
                <Alert
                  severity="warning"
                  sx={{
                    mb: 2,
                    backgroundColor: "rgba(255, 152, 0, 0.12)",
                    border: "1px solid rgba(255, 152, 0, 0.3)",
                    color: "#fff",
                    "& .MuiAlert-icon": {
                      color: "#ffb74d",
                    },
                  }}
                >
                  {scanResult.warnings.map((w, i) => (
                    <Typography key={i} variant="body2">
                      • {w}
                    </Typography>
                  ))}
                </Alert>
              )}

              <Divider sx={{ my: 2, borderColor: colors.border }} />

              {/* Editable Fields */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Merchant */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="500">
                      {t("billCommon.receiptScanner.fields.merchant.label")}
                    </Typography>
                    {getConfidenceBadge("merchant")}
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    value={editedData.merchant}
                    onChange={(e) =>
                      handleFieldChange("merchant", e.target.value)
                    }
                    placeholder={t(
                      "billCommon.receiptScanner.fields.merchant.placeholder",
                    )}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: colors.secondary_bg,
                      },
                    }}
                  />
                </Box>

                {/* Amount */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="500">
                      {t("billCommon.receiptScanner.fields.amount.label")}
                    </Typography>
                    {getConfidenceBadge("amount")}
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    value={editedData.amount}
                    onChange={(e) =>
                      handleFieldChange("amount", e.target.value)
                    }
                    placeholder={t(
                      "billCommon.receiptScanner.fields.amount.placeholder",
                    )}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          {getCurrencySymbol(editedData.currency)}
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: colors.secondary_bg,
                      },
                    }}
                  />
                </Box>

                {/* Date */}
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                    <Typography variant="body2" fontWeight="500">
                      {t("billCommon.receiptScanner.fields.date.label")}
                    </Typography>
                    {getConfidenceBadge("date")}
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    value={editedData.date || ""}
                    onChange={(e) => handleFieldChange("date", e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: colors.secondary_bg,
                      },
                    }}
                  />
                </Box>

                {/* Tax (optional) */}
                {(editedData.tax || scanResult.tax) && (
                  <Box>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
                    >
                      <Typography variant="body2" fontWeight="500">
                        {t("billCommon.receiptScanner.fields.tax.label")}
                      </Typography>
                      {getConfidenceBadge("tax")}
                    </Box>
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      value={editedData.tax}
                      onChange={(e) => handleFieldChange("tax", e.target.value)}
                      placeholder={t(
                        "billCommon.receiptScanner.fields.tax.placeholder",
                      )}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {getCurrencySymbol(editedData.currency)}
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: colors.secondary_bg,
                        },
                      }}
                    />
                  </Box>
                )}

                {/* Category Suggestion */}
                {editedData.suggestedCategory && (
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight="500"
                      sx={{ mb: 0.5 }}
                    >
                      {t("billCommon.receiptScanner.fields.category.label")}
                    </Typography>
                    <Chip
                      label={editedData.suggestedCategory}
                      sx={{
                        backgroundColor: colors.primary_accent,
                        color: "#fff",
                      }}
                    />
                  </Box>
                )}

                {/* Payment Method */}
                {editedData.paymentMethod && (
                  <Box>
                    <Typography
                      variant="body2"
                      fontWeight="500"
                      sx={{ mb: 0.5 }}
                    >
                      {t(
                        "billCommon.receiptScanner.fields.paymentMethod.label",
                      )}
                    </Typography>
                    <Chip
                      label={editedData.paymentMethod}
                      variant="outlined"
                      sx={{ borderColor: colors.border }}
                    />
                  </Box>
                )}

                {/* Line Items */}
                {scanResult.expenseItems &&
                  scanResult.expenseItems.length > 0 && (
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="500"
                        sx={{ mb: 1 }}
                      >
                        {t("billCommon.receiptScanner.fields.detectedItems", {
                          count: scanResult.expenseItems.length,
                        })}
                      </Typography>
                      <Box
                        sx={{
                          maxHeight: "150px",
                          overflow: "auto",
                          backgroundColor: colors.tertiary_bg,
                          borderRadius: 1,
                          p: 1,
                        }}
                      >
                        {scanResult.expenseItems.map((item, idx) => (
                          <Box
                            key={idx}
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              py: 0.5,
                              borderBottom:
                                idx < scanResult.expenseItems.length - 1
                                  ? `1px solid ${colors.border}`
                                  : "none",
                            }}
                          >
                            <Typography variant="caption">
                              {item.description}{" "}
                              {item.quantity > 1 ? `x${item.quantity}` : ""}
                            </Typography>
                            <Typography variant="caption" fontWeight="500">
                              {getCurrencySymbol(editedData.currency)}
                              {item.totalPrice?.toFixed(2)}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  )}
              </Box>

              <Divider sx={{ my: 3, borderColor: colors.border }} />

              {/* Action Buttons */}
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    previewUrls.forEach((url) => URL.revokeObjectURL(url));
                    setSelectedFiles([]);
                    setPreviewUrls([]);
                    setEditedData(null);
                    dispatch(clearScanResult());
                  }}
                  sx={{
                    borderColor: colors.border,
                    color: colors.primary_text,
                  }}
                >
                  {t("billCommon.receiptScanner.actions.scanAnother")}
                </Button>
                <Button
                  variant="contained"
                  onClick={handleUseData}
                  startIcon={<FaCheckCircle />}
                  sx={{
                    backgroundColor: colors.primary_accent,
                    "&:hover": { backgroundColor: colors.primary_accent_hover },
                  }}
                >
                  {t("billCommon.receiptScanner.actions.useData")}
                </Button>
              </Box>
            </Box>
          )}

          {/* Processing Time */}
          {scanResult && (
            <Typography
              variant="caption"
              color="textSecondary"
              sx={{ display: "block", textAlign: "center", mt: 2 }}
            >
              {t("billCommon.receiptScanner.meta.processedIn", {
                ms: scanResult.processingTimeMs,
              })}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ReceiptScanModal;
