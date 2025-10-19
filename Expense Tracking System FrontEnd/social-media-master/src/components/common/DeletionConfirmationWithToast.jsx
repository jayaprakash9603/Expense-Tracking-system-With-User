import React from "react";
import ToastNotification from "../../pages/Landingpage/ToastNotification";
import Modal from "../../pages/Landingpage/Modal";

/**
 * Unified component for showing a toast and a deletion confirmation modal.
 * Props:
 *  toastOpen, toastMessage, onToastClose
 *  isDeleteModalOpen, isDeleting
 *  expenseData (object shown inside modal), headerNames mapping
 *  onApprove (delete action), onDecline (cancel action)
 *  approveText, declineText, confirmationText
 */
const DeletionConfirmationWithToast = ({
  toastOpen,
  toastMessage,
  onToastClose,
  isDeleteModalOpen,
  isDeleting,
  expenseData,
  headerNames,
  onApprove,
  onDecline,
  approveText = "Yes, Delete",
  declineText = "No, Cancel",
  confirmationText,
}) => {
  return (
    <>
      <ToastNotification
        open={toastOpen}
        message={toastMessage}
        onClose={onToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={5000}
      />
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={!isDeleting ? onDecline : undefined}
        title="Deletion Confirmation"
        data={expenseData}
        headerNames={headerNames}
        onApprove={onApprove}
        onDecline={!isDeleting ? onDecline : undefined}
        approveText={
          isDeleting ? (
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className="loader"
                style={{
                  width: 18,
                  height: 18,
                  border: "2px solid #fff",
                  borderTop: "2px solid #00DAC6",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  display: "inline-block",
                }}
              ></span>
              Deleting...
            </span>
          ) : (
            approveText
          )
        }
        declineText={declineText}
        confirmationText={confirmationText}
        disableActions={isDeleting}
      />
      <style>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </>
  );
};

export default DeletionConfirmationWithToast;
