import React from "react";

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
  if (!isOpen) return null;

  const hasData = Object.keys(data).length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div
        className={`bg-[#1b1b1b] text-white rounded-xl shadow-lg p-6 w-[700px] ${
          hasData ? "min-h-[300px]" : "min-h-[50px] max-w-[500px]"
        } relative`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">{title}</h2>

          <button
            className="text-white text-2xl absolute top-4 right-4"
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
                      <span className="text-gray-400">{label}</span>
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
        <div className="flex justify-between gap-4 mt-10">
          <button
            onClick={onApprove}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-500"
          >
            {approveText}
          </button>
          <button
            onClick={onDecline}
            className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-500"
          >
            {declineText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
