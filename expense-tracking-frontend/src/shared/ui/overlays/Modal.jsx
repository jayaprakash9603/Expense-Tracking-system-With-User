import React from "react";
import { useTheme } from "../../../hooks/useTheme";

const Modal = ({
  isOpen,
  onClose,
  title = "Confirmation",
  data = {},
  onApprove,
  onDecline,
  approveText = "Approve",
  declineText = "Decline",
  approveIcon = null,
  declineIcon = null,
  confirmationText = "Are you sure you want to delete this?",
  headerNames = {},
  children = null,
  loading = false,
  disableActions = false,
  error = null,
  contentAlign = "center",
}) => {
  const { colors } = useTheme();
  if (!isOpen) return null;

  const hasData = Object.keys(data).length > 0;
  const hasChildren = Boolean(children);
  const showActions = onApprove != null || onDecline != null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{
        backgroundColor: colors.modal_overlay,
      }}
    >
      <div
        className={`rounded-xl shadow-lg p-6 w-[90%] max-w-[700px] ${
          hasData ? "min-h-[300px]" : "min-h-[50px] max-w-[500px]"
        } relative`}
        style={{
          backgroundColor: colors.modal_bg,
          color: colors.primary_text,
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          {onClose && (
            <button
              className="text-2xl absolute top-4 right-4"
              style={{ color: colors.primary_text }}
              onClick={onClose}
              disabled={disableActions}
              type="button"
            >
              &times;
            </button>
          )}
        </div>

        <div
          className={`space-y-4 text-base mt-6 ${
            contentAlign === "left" ? "text-left" : "text-center"
          }`}
        >
          {loading ? (
            <div className="flex justify-center py-8">
              <span
                className="inline-block w-7 h-7 rounded-full animate-spin"
                style={{
                  border: "2px solid transparent",
                  borderTopColor: colors.accent_color || "#14b8a6",
                  borderRightColor: colors.accent_color || "#14b8a6",
                }}
              />
            </div>
          ) : hasData ? (
            <>
              {Object.keys(data).map((key) => {
                if (data[key]) {
                  const label = headerNames[key] || key;
                  return (
                    <div key={key} className="flex justify-between">
                      <span style={{ color: colors.secondary_text }}>
                        {label}
                      </span>
                      <span>{data[key]}</span>
                    </div>
                  );
                }
                return null;
              })}
            </>
          ) : (
            <>
              {confirmationText && (
                <div
                  className={`text-lg font-medium ${
                    hasChildren ? "mb-2" : "mt-10"
                  }`}
                >
                  {confirmationText}
                </div>
              )}
              {children}
            </>
          )}
          {error && (
            <div
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.12)",
                color: "#ef4444",
              }}
            >
              {error}
            </div>
          )}
        </div>

        {showActions && (
          <div className="flex sm:flex-row justify-between gap-4 mt-10">
            {onDecline != null && (
              <button
                onClick={onDecline}
                disabled={disableActions}
                className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center gap-2"
                data-shortcut="modal-decline"
                title={`${declineText} (N)`}
                type="button"
              >
                {declineIcon && (
                  <span className="flex items-center">{declineIcon}</span>
                )}
                {declineText}
              </button>
            )}
            {onApprove != null && (
              <button
                onClick={onApprove}
                disabled={disableActions}
                className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto flex items-center justify-center gap-2"
                data-shortcut="modal-approve"
                title={`${approveText} (Y)`}
                type="button"
              >
                {approveIcon && (
                  <span className="flex items-center">{approveIcon}</span>
                )}
                {approveText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
