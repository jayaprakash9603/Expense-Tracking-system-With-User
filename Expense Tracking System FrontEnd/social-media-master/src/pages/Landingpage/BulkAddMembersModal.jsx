import React from "react";

const BulkAddMembersModal = ({
  bulkEmails,
  setBulkEmails,
  onAddAll,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      style={{ background: "#1b1b1b" }}
      className="p-6 rounded-xl w-full max-w-md"
    >
      <h3 className="text-xl font-semibold text-white mb-4">
        Bulk Add Members
      </h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Email Addresses (one per line)
          </label>
          <textarea
            value={bulkEmails}
            onChange={(e) => setBulkEmails(e.target.value)}
            placeholder={"member1@example.com\nmember2@example.com\nmember3@example.com".replace(
              /\\n/g,
              "\n"
            )}
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none h-32"
          />
        </div>
      </div>
      <div className="flex space-x-3 mt-6">
        <button
          onClick={onAddAll}
          className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors"
        >
          Add All Members
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

export default BulkAddMembersModal;
