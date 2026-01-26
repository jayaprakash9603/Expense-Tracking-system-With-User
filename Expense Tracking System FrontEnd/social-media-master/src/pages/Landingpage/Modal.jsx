import React from "react";
import { useTheme } from "../../hooks/useTheme";

const Modal = ({
  isOpen,
  onClose,
  title = "Confirmation",
  data = {},
  onApprove = () => {},
  onDecline = () => {},
  approveText = "Approve",
  declineText = "Decline",
  confirmationText = "Are you sure you want to delete this?",
  headerNames = {},
}) => {
  const { colors } = useTheme();
  if (!isOpen) return null;

  const hasData = Object.keys(data).length > 0;

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
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            className="text-2xl absolute top-4 right-4"
            style={{ color: colors.primary_text }}
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="space-y-4 text-base mt-6">
          {hasData ? (
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
            <div className="text-center text-lg font-medium mt-10">
              {confirmationText}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex sm:flex-row justify-between gap-4 mt-10">
          <button
            onClick={onDecline}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-500 w-full sm:w-auto"
            data-shortcut="modal-decline"
            title={`${declineText} (N)`}
          >
            {declineText}
          </button>
          <button
            onClick={onApprove}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-500 w-full sm:w-auto"
            data-shortcut="modal-approve"
            title={`${approveText} (Y)`}
          >
            {approveText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
