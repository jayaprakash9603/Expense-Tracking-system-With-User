import React from "react";
import { Button } from "@mui/material";

export default function BillLoadError({ colors, t, loadError, onClose }) {
  return (
    <div
      className="flex flex-col items-center justify-center"
      style={{
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        backgroundColor: colors.tertiary_bg,
        borderRadius: "8px",
        border: `1px solid ${colors.border_color}`,
        padding: "20px",
      }}
    >
      <div className="text-red-400 text-xl mb-4">
        {t("editBill.messages.loadErrorTitle")}
      </div>
      <p className="mb-6 text-center" style={{ color: colors.icon_muted }}>
        {loadError}
      </p>
      <div className="flex gap-4">
        <Button
          onClick={() => window.location.reload()}
          sx={{
            backgroundColor: colors.button_bg,
            color: colors.button_text,
            "&:hover": { backgroundColor: colors.button_hover },
          }}
        >
          {t("editBill.buttons.retry")}
        </Button>
        <Button
          onClick={onClose}
          sx={{
            backgroundColor: "#ff4444",
            color: "white",
            "&:hover": { backgroundColor: "#ff6666" },
          }}
        >
          {t("editBill.buttons.goBack")}
        </Button>
      </div>
    </div>
  );
}
