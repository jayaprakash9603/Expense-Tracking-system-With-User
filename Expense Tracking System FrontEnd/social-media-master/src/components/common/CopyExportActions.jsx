import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { Button } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DownloadIcon from "@mui/icons-material/Download";
import CheckIcon from "@mui/icons-material/Check";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { useTheme } from "../../hooks/useTheme";
import downloadTextFile from "../../utils/downloadTextFile";

const copyToClipboard = async (text) => {
  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-1000px";
  textarea.style.left = "-1000px";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  textarea.remove();
  if (!ok) {
    throw new Error("Copy failed");
  }
};

/**
 * CopyExportActions
 * Generic copy/export buttons with:
 * - clipboard fallback
 * - status feedback (Copied / Copy failed)
 * - text file download helper
 *
 * Usage:
 * <CopyExportActions
 *   getCopyText={() => buildTsvForClipboard({ rows })}
 *   getExportText={() => buildCsv({ rows })}
 *   getExportFilename={() => `report-${dateLabel}.csv`}
 * />
 */
const CopyExportActions = ({
  getCopyText,
  getExportText,
  getExportFilename,
  exportMimeType = "text/csv;charset=utf-8",
  copyLabel = "Copy",
  copiedLabel = "Copied",
  copyFailedLabel = "Copy failed",
  exportLabel = "Export",
  size = "small",
  variant = "outlined",
  sx,
}) => {
  const { colors } = useTheme();
  const [copyStatus, setCopyStatus] = useState("idle");
  const copyResetTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (copyResetTimerRef.current) {
        clearTimeout(copyResetTimerRef.current);
        copyResetTimerRef.current = null;
      }
    };
  }, []);

  const resetCopyStatusLater = useCallback((ms) => {
    if (copyResetTimerRef.current) {
      clearTimeout(copyResetTimerRef.current);
      copyResetTimerRef.current = null;
    }

    copyResetTimerRef.current = setTimeout(() => {
      setCopyStatus("idle");
      copyResetTimerRef.current = null;
    }, ms);
  }, []);

  const handleCopy = useCallback(async () => {
    try {
      const text = await Promise.resolve(
        typeof getCopyText === "function" ? getCopyText() : ""
      );
      await copyToClipboard(String(text ?? ""));
      setCopyStatus("copied");
      resetCopyStatusLater(1600);
    } catch {
      setCopyStatus("error");
      resetCopyStatusLater(2000);
    }
  }, [getCopyText, resetCopyStatusLater]);

  const handleExport = useCallback(async () => {
    const filename = await Promise.resolve(
      typeof getExportFilename === "function"
        ? getExportFilename()
        : "export.csv"
    );
    const content = await Promise.resolve(
      typeof getExportText === "function" ? getExportText() : ""
    );

    downloadTextFile(
      String(filename || "export.csv"),
      String(content ?? ""),
      exportMimeType
    );
  }, [exportMimeType, getExportFilename, getExportText]);

  const copyStartIcon = useMemo(() => {
    if (copyStatus === "copied") return <CheckIcon />;
    if (copyStatus === "error") return <ErrorOutlineIcon />;
    return <ContentCopyIcon />;
  }, [copyStatus]);

  const copyButtonSx = useMemo(() => {
    const baseBorder = colors?.border_color;
    const baseText = colors?.primary_text;

    const okColor = "#00d4c0";
    const errorColor = "#ff5252";

    const borderColor =
      copyStatus === "copied"
        ? okColor
        : copyStatus === "error"
        ? errorColor
        : baseBorder;
    const color =
      copyStatus === "copied"
        ? okColor
        : copyStatus === "error"
        ? errorColor
        : baseText;

    return {
      borderColor,
      color,
      textTransform: "none",
      "&:hover": {
        borderColor:
          copyStatus === "copied"
            ? okColor
            : copyStatus === "error"
            ? errorColor
            : `${colors?.primary_accent || "#5b7fff"}66`,
        backgroundColor:
          copyStatus === "copied"
            ? "#00d4c014"
            : copyStatus === "error"
            ? "#ff525214"
            : undefined,
      },
    };
  }, [colors, copyStatus]);

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={handleCopy}
        startIcon={copyStartIcon}
        sx={{ ...copyButtonSx, ...sx }}
      >
        {copyStatus === "copied"
          ? copiedLabel
          : copyStatus === "error"
          ? copyFailedLabel
          : copyLabel}
      </Button>

      <Button
        size={size}
        variant={variant}
        onClick={handleExport}
        startIcon={<DownloadIcon />}
        sx={{
          borderColor: colors?.border_color,
          color: colors?.primary_text,
          textTransform: "none",
          ...sx,
        }}
      >
        {exportLabel}
      </Button>
    </>
  );
};

CopyExportActions.propTypes = {
  getCopyText: PropTypes.func.isRequired,
  getExportText: PropTypes.func.isRequired,
  getExportFilename: PropTypes.func.isRequired,
  exportMimeType: PropTypes.string,
  copyLabel: PropTypes.string,
  copiedLabel: PropTypes.string,
  copyFailedLabel: PropTypes.string,
  exportLabel: PropTypes.string,
  size: PropTypes.oneOf(["small", "medium", "large"]),
  variant: PropTypes.oneOf(["text", "outlined", "contained"]),
  sx: PropTypes.object,
};

export default CopyExportActions;
