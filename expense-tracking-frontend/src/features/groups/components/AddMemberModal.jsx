import React from "react";
import { AppSelect } from "../../../components/ui";

const AddMemberModal = ({
  newMemberEmail,
  setNewMemberEmail,
  newMemberRole,
  setNewMemberRole,
  onAdd,
  onClose,
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      style={{ background: "#1b1b1b" }}
      className="p-6 rounded-xl w-full max-w-md"
    >
      <h3 className="text-xl font-semibold text-white mb-4">Add New Member</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
            placeholder="member@example.com"
            className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
          />
        </div>
        <div>
          <label className="block text-gray-300 text-sm font-medium mb-2">
            Role
          </label>
          <AppSelect
            value={newMemberRole}
            onValueChange={setNewMemberRole}
            options={[
              { value: "VIEWER", label: "Viewer" },
              { value: "MEMBER", label: "Member" },
              { value: "MODERATOR", label: "Moderator" },
              { value: "ADMIN", label: "Admin" },
            ]}
            ariaLabel="Member role"
            size="small"
            displayEmpty={false}
          />
        </div>
      </div>
      <div className="flex space-x-3 mt-6">
        <button
          onClick={onAdd}
          className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors"
        >
          Add Member
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

export default AddMemberModal;
