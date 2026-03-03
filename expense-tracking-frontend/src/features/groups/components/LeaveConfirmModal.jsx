import React from "react";

const LeaveConfirmModal = ({ groupName, onLeave, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      style={{ background: "#1b1b1b" }}
      className="p-6 rounded-xl w-full max-w-md"
    >
      <h3 className="text-xl font-semibold text-white mb-4">Leave Group?</h3>
      <p className="text-gray-300 mb-6">
        Are you sure you want to leave "{groupName}"? You won't be able to see
        group expenses or chat messages after leaving.
      </p>
      <div className="flex space-x-3">
        <button
          onClick={onLeave}
          className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          Leave Group
        </button>
        <button
          onClick={onClose}
          className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default LeaveConfirmModal;
