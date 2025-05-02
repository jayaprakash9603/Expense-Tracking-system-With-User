import React, { useState } from "react";
import Modal from "./Modal";

const History = () => {
  const [isDataModalOpen, setIsDataModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const sampleData = {
    amount: "$500",
    category: "Development",
    project: "Website Redesign",
    description: "Redesign of the main website for better UX.",
    team: "Frontend Team",
  };

  const headerNames = {
    amount: "Total Amount",
    category: "Category",
    project: "Project Name",
    description: "Details",
    team: "Assigned Team",
  };

  const handleApproveData = () => {
    alert("Data approved!");
    setIsDataModalOpen(false);
  };

  const handleDeclineData = () => {
    setIsDataModalOpen(false);
  };

  const handleApproveConfirm = () => {
    alert("Deletion confirmed!");
    setIsConfirmModalOpen(false);
  };

  const handleDeclineConfirm = () => {
    setIsConfirmModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl text-white font-bold mb-8">Modal Demo</h1>
      <div className="flex gap-4">
        <button
          onClick={() => setIsDataModalOpen(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Open Data Modal
        </button>
        <button
          onClick={() => setIsConfirmModalOpen(true)}
          className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
        >
          Open Confirmation Modal
        </button>
      </div>

      {/* Data Modal */}
      <Modal
        isOpen={isDataModalOpen}
        onClose={() => setIsDataModalOpen(false)}
        title="Transaction Details"
        data={sampleData}
        onApprove={handleApproveData}
        onDecline={handleDeclineData}
        approveText="Confirm"
        declineText="Cancel"
        headerNames={headerNames}
      />

      {/* Confirmation Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Delete Confirmation"
        confirmationText="Are you sure you want to delete this item?"
        onApprove={handleApproveConfirm}
        onDecline={handleDeclineConfirm}
        approveText="Yes, Delete"
        declineText="No, Cancel"
      />
    </div>
  );
};

export default History;
