/**
 * =============================================================================
 * MfaSetup - Multi-Factor Authentication Setup Page
 * =============================================================================
 *
 * Production-grade MFA setup flow following GitHub/Google patterns:
 * 1. Display QR code for Google Authenticator
 * 2. Show secret key for manual entry
 * 3. Verify first TOTP code
 * 4. Display backup codes (show once!)
 *
 * @author Expense Tracking System
 * @version 1.0
 * =============================================================================
 */

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Stepper,
  Step,
  StepLabel,
  CircularProgress,
  Alert,
  AlertTitle,
  Divider,
  IconButton,
  Tooltip,
  Chip,
  Grid,
  useMediaQuery,
} from "@mui/material";
import {
  ContentCopy as CopyIcon,
  CheckCircle as CheckIcon,
  Security as SecurityIcon,
  QrCode as QrCodeIcon,
  Key as KeyIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon,
  PhonelinkLock as MfaIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import { api } from "../../../../config/api";
import { useTheme } from "../../../../hooks/useTheme";
import { useTranslation } from "../../../../hooks/useTranslation";
import { getProfileAction } from "../../../../Redux/Auth/auth.action";
import Modal from "../../Modal";

// =============================================================================
// Constants
// =============================================================================

// =============================================================================
// Main Component
// =============================================================================

const MfaSetup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { user } = useSelector((state) => state.auth);
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  // Steps array (translated in render)
  const STEPS = [
    t("mfa.setup.steps.scanQr"),
    t("mfa.setup.steps.verifyCode"),
    t("mfa.setup.steps.saveBackup"),
  ];

  // ---------------------------------------------------------------------------
  // State Management
  // ---------------------------------------------------------------------------

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [setupData, setSetupData] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [backupCodes, setBackupCodes] = useState([]);
  const [copied, setCopied] = useState(false);
  const [secretCopied, setSecretCopied] = useState(false);
  const [error, setError] = useState("");
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [disableMethod, setDisableMethod] = useState("otp");
  const [disablePassword, setDisablePassword] = useState("");
  const [disableOtp, setDisableOtp] = useState("");
  const [mfaStatus, setMfaStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [showRegeneratedCodes, setShowRegeneratedCodes] = useState(false);

  // ---------------------------------------------------------------------------
  // API Calls
  // ---------------------------------------------------------------------------

  /**
   * Fetch current MFA status
   */
  const fetchMfaStatus = useCallback(async () => {
    try {
      setStatusLoading(true);
      const token = localStorage.getItem("jwt");
      const response = await api.get("/auth/mfa/status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMfaStatus(response.data);
    } catch (error) {
      console.error("Error fetching MFA status:", error);
      toast.error(t("mfa.setup.failedToLoadStatus"));
    } finally {
      setStatusLoading(false);
    }
  }, [t]);

  /**
   * Initiate MFA setup - generates QR code and secret
   */
  const initiateSetup = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("jwt");
      const response = await api.post(
        "/auth/mfa/setup",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setSetupData(response.data);
      setActiveStep(0);
    } catch (error) {
      console.error("Error initiating MFA setup:", error);
      setError(
        error.response?.data?.error || t("mfa.setup.failedToStartSetup"),
      );
      toast.error(t("mfa.setup.failedToStartSetup"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verify the TOTP code and enable MFA
   */
  const verifyAndEnable = async () => {
    if (verificationCode.length !== 6) {
      setError(
        t("mfa.setup.invalidCode") || "Please enter a valid 6-digit code",
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("jwt");
      const response = await api.post(
        "/auth/mfa/enable",
        {
          tempSecret: setupData.secret,
          otp: verificationCode,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setBackupCodes(response.data.backupCodes);
      setActiveStep(2);
      toast.success(t("mfa.setup.mfaEnabledSuccess"));

      // Refresh user profile to update MFA status
      dispatch(getProfileAction(token));
    } catch (error) {
      console.error("Error enabling MFA:", error);
      setError(
        error.response?.data?.error || t("mfa.setup.verificationFailed"),
      );
      toast.error(t("mfa.setup.verificationFailed"));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Disable MFA
   */
  const disableMfa = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      const response = await api.post(
        "/auth/mfa/disable",
        {
          password: disableMethod === "password" ? disablePassword : null,
          otp: disableMethod === "otp" ? disableOtp : null,
          useOtp: disableMethod === "otp",
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      toast.success(response.data.message || t("mfa.setup.mfaDisabledSuccess"));
      setShowDisableDialog(false);
      setDisablePassword("");
      setDisableOtp("");
      fetchMfaStatus();

      // Refresh user profile
      dispatch(getProfileAction(token));
    } catch (error) {
      console.error("Error disabling MFA:", error);
      toast.error(
        error.response?.data?.error || t("mfa.setup.failedToDisable"),
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Regenerate backup codes
   */
  const regenerateBackupCodes = async () => {
    const otp = prompt(t("mfa.setup.enterCodeToRegenerate"));
    if (!otp) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("jwt");
      const response = await api.post(
        "/auth/mfa/regenerate-backup-codes",
        { otp },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setBackupCodes(response.data.backupCodes);
      setShowRegeneratedCodes(true);
      toast.success(t("mfa.setup.newCodesGenerated"));
    } catch (error) {
      console.error("Error regenerating backup codes:", error);
      toast.error(
        error.response?.data?.error || t("mfa.setup.failedToRegenerate"),
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  useEffect(() => {
    fetchMfaStatus();
  }, [fetchMfaStatus]);

  // ---------------------------------------------------------------------------
  // Utility Functions
  // ---------------------------------------------------------------------------

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "secret") {
      setSecretCopied(true);
      setTimeout(() => setSecretCopied(false), 2000);
    } else {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    toast.success(t("mfa.setup.copiedToClipboard"));
  };

  const downloadBackupCodes = () => {
    const content = `Expensio Finance - MFA Backup Codes
Generated: ${new Date().toLocaleString()}
Account: ${user?.email}

IMPORTANT: Keep these codes safe and secure!
Each code can only be used once.

${backupCodes.map((code, i) => `${i + 1}. ${code}`).join("\n")}

If you lose your authenticator device, use one of these codes to sign in.
`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "expensio-mfa-backup-codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(t("mfa.setup.backupCodesDownloaded"));
  };

  const handleCodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setVerificationCode(value);
    setError("");
  };

  // ---------------------------------------------------------------------------
  // Render Functions
  // ---------------------------------------------------------------------------

  /**
   * Render MFA Already Enabled View
   */
  const renderMfaEnabled = () => (
    <Box sx={{ textAlign: "center", py: 4 }}>
      <CheckIcon sx={{ fontSize: 80, color: "success.main", mb: 2 }} />
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={{ color: colors.primary_text }}
      >
        {t("mfa.setup.mfaEnabled")}
      </Typography>
      <Typography
        sx={{ mb: 3, maxWidth: 400, mx: "auto", color: colors.secondary_text }}
      >
        {t("mfa.setup.mfaEnabledDescription")}
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Chip
          icon={<SecurityIcon />}
          label={t("mfa.setup.backupCodesRemaining", {
            count: mfaStatus?.remainingBackupCodes || 0,
          }).replace("{{count}}", mfaStatus?.remainingBackupCodes || 0)}
          color={mfaStatus?.remainingBackupCodes > 3 ? "success" : "warning"}
          sx={{ mr: 1 }}
        />
        {mfaStatus?.activePriority === "MFA" && (
          <Chip
            icon={<MfaIcon />}
            label={t("mfa.setup.primaryAuth")}
            color="primary"
          />
        )}
      </Box>

      <Divider sx={{ my: 3, borderColor: colors.border }} />

      <Grid container spacing={2} justifyContent="center">
        <Grid item>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={regenerateBackupCodes}
            disabled={loading}
            sx={{
              borderColor: colors.primary,
              color: colors.primary,
              "&:hover": {
                borderColor: colors.primary,
                backgroundColor: colors.hover,
              },
            }}
          >
            {t("mfa.setup.regenerateBackupCodes")}
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            color="error"
            onClick={() => setShowDisableDialog(true)}
            disabled={loading}
          >
            {t("mfa.setup.disableMfa")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );

  /**
   * Step 1: QR Code Display
   */
  const renderQrCodeStep = () => (
    <Box sx={{ textAlign: "center" }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: colors.primary_text, mb: 0.5, fontSize: "1.1rem" }}
      >
        {t("mfa.setup.step1Title")}
      </Typography>
      <Typography
        sx={{ mb: 1.5, color: colors.secondary_text, fontSize: "0.9rem" }}
      >
        {t("mfa.setup.step1Description")}
      </Typography>

      {/* Warning for users who might be re-enabling MFA */}
      <Alert
        severity="info"
        sx={{
          mb: 2,
          textAlign: "left",
          maxWidth: 500,
          mx: "auto",
          py: 0.5,
          "& .MuiAlert-message": { py: 0.5 },
          "& .MuiAlertTitle-root": { fontSize: "0.85rem", mb: 0 },
          fontSize: "0.8rem",
        }}
      >
        <AlertTitle>{t("mfa.setup.beforeYouScan")}</AlertTitle>
        {t("mfa.setup.deleteOldEntriesWarning")}
      </Alert>

      {setupData?.qrCodeDataUri && (
        <Box
          sx={{
            p: 2,
            backgroundColor: "#fff",
            borderRadius: 2,
            display: "inline-block",
            mb: 2,
          }}
        >
          <img
            src={setupData.qrCodeDataUri}
            alt="MFA QR Code"
            style={{ width: 160, height: 160 }}
          />
        </Box>
      )}

      <Divider sx={{ my: 1.5, borderColor: colors.border }}>
        <Typography sx={{ color: colors.secondary_text, fontSize: "0.85rem" }}>
          {t("mfa.setup.orEnterManually")}
        </Typography>
      </Divider>

      <Box sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          sx={{ color: colors.secondary_text, fontSize: "0.8rem", mb: 0.25 }}
        >
          {t("mfa.setup.account")}: {user?.email}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: colors.secondary_text, fontSize: "0.8rem", mb: 0.5 }}
        >
          {t("mfa.setup.issuer")}: {setupData?.issuer}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontFamily: "monospace",
              backgroundColor: colors.cardBackground,
              color: colors.primary_text,
              p: 0.75,
              borderRadius: 1,
              letterSpacing: 2,
            }}
          >
            {setupData?.secret}
          </Typography>
          <Tooltip
            title={
              secretCopied ? t("mfa.setup.copied") : t("mfa.setup.copySecret")
            }
          >
            <IconButton
              onClick={() => copyToClipboard(setupData?.secret, "secret")}
              sx={{ color: colors.primary_text }}
            >
              {secretCopied ? <CheckIcon color="success" /> : <CopyIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Button
        variant="contained"
        onClick={() => setActiveStep(1)}
        size="large"
        sx={{
          minWidth: 200,
          backgroundColor: colors.primary,
          "&:hover": {
            backgroundColor: colors.primary,
            opacity: 0.9,
          },
        }}
      >
        {t("mfa.setup.continue")}
      </Button>
    </Box>
  );

  /**
   * Step 2: Code Verification
   */
  const renderVerifyStep = () => (
    <Box sx={{ textAlign: "center" }}>
      <Typography variant="h6" gutterBottom sx={{ color: colors.primary_text }}>
        {t("mfa.setup.step2Title")}
      </Typography>
      <Typography sx={{ mb: 3, color: colors.secondary_text }}>
        {t("mfa.setup.step2Description")}
      </Typography>

      <TextField
        value={verificationCode}
        onChange={handleCodeChange}
        placeholder="000000"
        inputProps={{
          maxLength: 6,
          style: {
            textAlign: "center",
            fontSize: "2rem",
            letterSpacing: "0.5rem",
            fontFamily: "monospace",
          },
        }}
        sx={{
          mb: 2,
          width: 200,
          "& .MuiOutlinedInput-root": {
            "& fieldset": {
              borderColor: colors.border,
            },
            "&:hover fieldset": {
              borderColor: colors.primary,
            },
            "&.Mui-focused fieldset": {
              borderColor: colors.primary,
            },
          },
          "& .MuiInputBase-input": {
            color: colors.primary_text,
          },
        }}
        error={!!error}
        helperText={error}
        autoFocus
      />

      <Typography variant="body2" sx={{ mb: 3, color: colors.secondary_text }}>
        {t("mfa.setup.codeChangesEvery30Seconds")}
      </Typography>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
        <Button
          variant="outlined"
          onClick={() => setActiveStep(0)}
          sx={{
            borderColor: colors.primary,
            color: colors.primary,
            "&:hover": {
              borderColor: colors.primary,
              backgroundColor: colors.hover,
            },
          }}
        >
          {t("mfa.setup.back")}
        </Button>
        <Button
          variant="contained"
          onClick={verifyAndEnable}
          disabled={verificationCode.length !== 6 || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          sx={{
            backgroundColor: colors.primary,
            "&:hover": {
              backgroundColor: colors.primary,
              opacity: 0.9,
            },
          }}
        >
          {loading ? t("mfa.setup.verifying") : t("mfa.setup.verifyAndEnable")}
        </Button>
      </Box>
    </Box>
  );

  /**
   * Step 3: Backup Codes Display
   */
  const renderBackupCodesStep = () => (
    <Box sx={{ textAlign: "center" }}>
      <CheckIcon sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
      <Typography
        variant="h6"
        gutterBottom
        sx={{ color: colors.primary_text, mb: 1 }}
      >
        {t("mfa.setup.mfaEnabledSuccessfully")}
      </Typography>

      <Alert
        severity="warning"
        sx={{
          mb: 2,
          textAlign: "left",
          py: 0.25,
          "& .MuiAlert-message": { py: 0.25 },
          "& .MuiAlertTitle-root": { fontSize: "0.8rem", mb: 0 },
          fontSize: "0.75rem",
        }}
      >
        <AlertTitle>{t("mfa.setup.saveBackupCodes")}</AlertTitle>
        {t("mfa.setup.backupCodesWarning")}
      </Alert>

      <Paper
        variant="outlined"
        sx={{
          p: 2,
          mb: 2,
          backgroundColor: colors.cardBackground,
          borderColor: colors.border,
        }}
      >
        <Grid container spacing={0.75}>
          {backupCodes.map((code, index) => (
            <Grid item xs={6} key={index}>
              <Typography
                sx={{
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  p: 0.75,
                  backgroundColor: colors.inputBackground,
                  color: colors.primary_text,
                  borderRadius: 1,
                }}
              >
                {code}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Paper>

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={copied ? <CheckIcon /> : <CopyIcon />}
          onClick={() => copyToClipboard(backupCodes.join("\n"), "codes")}
          sx={{
            borderColor: colors.primary,
            color: colors.primary,
            "&:hover": {
              borderColor: colors.primary,
              backgroundColor: colors.hover,
            },
          }}
        >
          {copied ? t("mfa.setup.copied") : t("mfa.setup.copyCodes")}
        </Button>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={downloadBackupCodes}
          sx={{
            borderColor: colors.primary,
            color: colors.primary,
            "&:hover": {
              borderColor: colors.primary,
              backgroundColor: colors.hover,
            },
          }}
        >
          {t("mfa.setup.download")}
        </Button>
      </Box>

      <Button
        variant="contained"
        onClick={() => navigate("/settings")}
        size="large"
        sx={{
          backgroundColor: colors.primary,
          "&:hover": {
            backgroundColor: colors.primary,
            opacity: 0.9,
          },
        }}
      >
        {t("mfa.setup.done")}
      </Button>
    </Box>
  );

  /**
   * Render Regenerated Backup Codes Dialog
   */
  const renderRegeneratedCodesDialog = () => {
    if (!showRegeneratedCodes) return null;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: colors.modal_overlay,
        }}
      >
        <div
          className="rounded-xl shadow-lg p-6 w-[90%] max-w-[600px] relative max-h-[90vh] overflow-auto"
          style={{
            backgroundColor: colors.modal_bg || colors.cardBackground,
            color: colors.primary_text,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckIcon sx={{ color: "success.main" }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: colors.primary_text }}
              >
                {t("mfa.setup.newCodesGenerated")}
              </Typography>
            </div>
            <button
              className="text-2xl absolute top-4 right-4"
              style={{ color: colors.primary_text }}
              onClick={() => setShowRegeneratedCodes(false)}
            >
              &times;
            </button>
          </div>

          {/* Content */}
          <div className="mt-4">
            <Alert
              severity="warning"
              sx={{
                mb: 3,
                textAlign: "left",
                py: 0.5,
                "& .MuiAlert-message": { py: 0.5 },
                "& .MuiAlertTitle-root": { fontSize: "0.85rem", mb: 0 },
                fontSize: "0.8rem",
              }}
            >
              <AlertTitle>{t("mfa.setup.saveBackupCodes")}</AlertTitle>
              {t("mfa.setup.backupCodesWarning")}
            </Alert>

            <Paper
              variant="outlined"
              sx={{
                p: 3,
                mb: 3,
                backgroundColor:
                  colors.inputBackground || colors.cardBackground,
                borderColor: colors.border,
              }}
            >
              <Grid container spacing={1}>
                {backupCodes.map((code, index) => (
                  <Grid item xs={6} key={index}>
                    <Typography
                      sx={{
                        fontFamily: "monospace",
                        fontSize: "1rem",
                        p: 1,
                        backgroundColor: colors.hover || colors.secondary_bg,
                        color: colors.primary_text,
                        borderRadius: 1,
                        textAlign: "center",
                      }}
                    >
                      {code}
                    </Typography>
                  </Grid>
                ))}
              </Grid>
            </Paper>

            <Box
              sx={{ display: "flex", gap: 2, justifyContent: "center", mb: 2 }}
            >
              <Button
                variant="outlined"
                startIcon={copied ? <CheckIcon /> : <CopyIcon />}
                onClick={() => copyToClipboard(backupCodes.join("\n"), "codes")}
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  "&:hover": {
                    borderColor: colors.primary,
                    backgroundColor: colors.hover,
                  },
                }}
              >
                {copied ? t("mfa.setup.copied") : t("mfa.setup.copyCodes")}
              </Button>
              <Button
                variant="outlined"
                startIcon={<DownloadIcon />}
                onClick={downloadBackupCodes}
                sx={{
                  borderColor: colors.primary,
                  color: colors.primary,
                  "&:hover": {
                    borderColor: colors.primary,
                    backgroundColor: colors.hover,
                  },
                }}
              >
                {t("mfa.setup.download")}
              </Button>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={() => setShowRegeneratedCodes(false)}
              sx={{
                backgroundColor: colors.primary,
                "&:hover": {
                  backgroundColor: colors.primary,
                  opacity: 0.9,
                },
              }}
            >
              {t("mfa.setup.done")}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  /**
   * Render Disable MFA Dialog
   */
  const renderDisableDialog = () => {
    if (!showDisableDialog) return null;

    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backgroundColor: colors.modal_overlay,
        }}
      >
        <div
          className="rounded-xl shadow-lg p-6 w-[90%] max-w-[500px] relative"
          style={{
            backgroundColor: colors.modal_bg || colors.cardBackground,
            color: colors.primary_text,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <WarningIcon sx={{ color: "#ed6c02" }} />
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", color: colors.primary_text }}
              >
                {t("mfa.setup.disableMfa")}
              </Typography>
            </div>
            <button
              className="text-2xl absolute top-4 right-4"
              style={{ color: colors.primary_text }}
              onClick={() => setShowDisableDialog(false)}
            >
              &times;
            </button>
          </div>

          {/* Content */}
          <div className="space-y-4 mt-4">
            <Typography sx={{ mb: 2, color: colors.secondary_text }}>
              {t("mfa.setup.disableMfaWarning")}
            </Typography>

            <Alert
              severity="warning"
              sx={{
                mb: 2,
                py: 0.5,
                "& .MuiAlert-message": { py: 0.5 },
                "& .MuiAlertTitle-root": { fontSize: "0.85rem", mb: 0 },
                fontSize: "0.8rem",
              }}
            >
              <AlertTitle>{t("mfa.setup.importantReminder")}</AlertTitle>
              {t("mfa.setup.removeAuthenticatorEntry")}
            </Alert>

            <Box sx={{ mb: 2 }}>
              <Button
                variant={disableMethod === "otp" ? "contained" : "outlined"}
                size="small"
                onClick={() => setDisableMethod("otp")}
                sx={{
                  mr: 1,
                  backgroundColor:
                    disableMethod === "otp" ? colors.primary : "transparent",
                  borderColor: colors.primary,
                  color: disableMethod === "otp" ? "#fff" : colors.primary,
                  "&:hover": {
                    backgroundColor:
                      disableMethod === "otp" ? colors.primary : colors.hover,
                    borderColor: colors.primary,
                  },
                }}
              >
                {t("mfa.setup.useAuthenticatorCode")}
              </Button>
              <Button
                variant={
                  disableMethod === "password" ? "contained" : "outlined"
                }
                size="small"
                onClick={() => setDisableMethod("password")}
                sx={{
                  backgroundColor:
                    disableMethod === "password"
                      ? colors.primary
                      : "transparent",
                  borderColor: colors.primary,
                  color: disableMethod === "password" ? "#fff" : colors.primary,
                  "&:hover": {
                    backgroundColor:
                      disableMethod === "password"
                        ? colors.primary
                        : colors.hover,
                    borderColor: colors.primary,
                  },
                }}
              >
                {t("mfa.setup.usePassword")}
              </Button>
            </Box>

            {disableMethod === "otp" ? (
              <TextField
                fullWidth
                label={t("mfa.setup.authenticatorCode")}
                value={disableOtp}
                onChange={(e) =>
                  setDisableOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="000000"
                inputProps={{ maxLength: 6 }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: colors.border,
                    },
                    "&:hover fieldset": {
                      borderColor: colors.primary,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.primary,
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: colors.primary_text,
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.secondary_text,
                  },
                }}
              />
            ) : (
              <TextField
                fullWidth
                type="password"
                label={t("mfa.setup.password")}
                value={disablePassword}
                onChange={(e) => setDisablePassword(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    "& fieldset": {
                      borderColor: colors.border,
                    },
                    "&:hover fieldset": {
                      borderColor: colors.primary,
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: colors.primary,
                    },
                  },
                  "& .MuiInputBase-input": {
                    color: colors.primary_text,
                  },
                  "& .MuiInputLabel-root": {
                    color: colors.secondary_text,
                  },
                }}
              />
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 mt-6">
            <Button
              onClick={() => setShowDisableDialog(false)}
              sx={{
                color: colors.primary_text,
                "&:hover": {
                  backgroundColor: colors.hover,
                },
              }}
            >
              {t("mfa.setup.cancel")}
            </Button>
            <Button
              onClick={disableMfa}
              color="error"
              variant="contained"
              disabled={
                loading ||
                (disableMethod === "otp"
                  ? disableOtp.length !== 6
                  : !disablePassword)
              }
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                t("mfa.setup.disableMfa")
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // Main Render
  // ---------------------------------------------------------------------------

  if (statusLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
          backgroundColor: colors.primary_bg,
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: colors.primary_bg,
        width: isSmallScreen ? "100vw" : "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        borderRadius: isSmallScreen ? 0 : "8px",
        border: isSmallScreen ? "none" : `1px solid ${colors.border_color}`,
        mr: isSmallScreen ? 0 : "20px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          p: isSmallScreen ? 1.5 : 2,
          borderBottom: `1px solid ${colors.border_color}`,
          backgroundColor: colors.primary_bg,
        }}
      >
        <IconButton
          onClick={() => navigate("/settings")}
          sx={{ color: colors.primary_text }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              color: colors.primary_text,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <MfaIcon />
            {t("mfa.setup.authenticatorApp")}
          </Typography>
          <Typography variant="body2" sx={{ color: colors.secondary_text }}>
            {t("mfa.setup.authenticatorAppDescription")}
          </Typography>
        </Box>
      </Box>

      {/* Content - Scrollable */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          p: isSmallScreen ? 1.5 : 2,
          backgroundColor: colors.secondary_bg,
        }}
        className="custom-scrollbar"
      >
        <Box sx={{ maxWidth: 600, mx: "auto" }}>
          {/* Main Content Card */}
          <Paper
            elevation={0}
            sx={{
              p: isSmallScreen ? 2 : 3,
              backgroundColor: colors.primary_bg,
              borderRadius: 2,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            {mfaStatus?.mfaEnabled ? (
              renderMfaEnabled()
            ) : setupData ? (
              <>
                {/* Stepper */}
                <Stepper activeStep={activeStep} sx={{ mb: 2 }}>
                  {STEPS.map((label) => (
                    <Step key={label}>
                      <StepLabel
                        sx={{
                          "& .MuiStepLabel-label": {
                            color: colors.secondary_text,
                          },
                          "& .MuiStepLabel-label.Mui-active": {
                            color: colors.primary_text,
                          },
                          "& .MuiStepLabel-label.Mui-completed": {
                            color: colors.primary,
                          },
                        }}
                      >
                        {label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Step Content */}
                {activeStep === 0 && renderQrCodeStep()}
                {activeStep === 1 && renderVerifyStep()}
                {activeStep === 2 && renderBackupCodesStep()}
              </>
            ) : (
              /* Initial Setup View */
              <Box sx={{ textAlign: "center", py: 4 }}>
                <QrCodeIcon
                  sx={{ fontSize: 80, color: colors.primary, mb: 2 }}
                />
                <Typography
                  variant="h5"
                  fontWeight="bold"
                  gutterBottom
                  sx={{ color: colors.primary_text }}
                >
                  {t("mfa.setup.setUpAuthenticator")}
                </Typography>
                <Typography
                  sx={{
                    mb: 3,
                    maxWidth: 400,
                    mx: "auto",
                    color: colors.secondary_text,
                  }}
                >
                  {t("mfa.setup.setUpAuthenticatorDescription")}
                </Typography>

                <Alert
                  severity="info"
                  sx={{
                    mb: 3,
                    textAlign: "left",
                    py: 0.5,
                    "& .MuiAlert-message": { py: 0.5 },
                    "& .MuiAlertTitle-root": { fontSize: "0.85rem", mb: 0 },
                    fontSize: "0.8rem",
                  }}
                >
                  <AlertTitle>{t("mfa.setup.priorityNote")}</AlertTitle>
                  {t("mfa.setup.priorityNoteDescription")}
                </Alert>

                <Button
                  variant="contained"
                  size="large"
                  startIcon={
                    loading ? <CircularProgress size={20} /> : <KeyIcon />
                  }
                  onClick={initiateSetup}
                  disabled={loading}
                  sx={{
                    minWidth: 200,
                    backgroundColor: colors.primary,
                    "&:hover": {
                      backgroundColor: colors.primary,
                      opacity: 0.9,
                    },
                  }}
                >
                  {loading
                    ? t("mfa.setup.settingUp")
                    : t("mfa.setup.getStarted")}
                </Button>
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Disable Dialog */}
      {renderDisableDialog()}

      {/* Regenerated Backup Codes Dialog */}
      {renderRegeneratedCodesDialog()}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${colors.secondary_bg};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.primary_accent};
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary_accent};
          opacity: 0.8;
        }
      `}</style>
    </Box>
  );
};

export default MfaSetup;
