import React from "react";

const MembersTabContent = ({
  groupData,
  setShowAddMember,
  setShowBulkAddMembers,
  setShowBulkRemoveMembers,
  getUserInitials,
  formatDate,
  getRoleColor,
  handleRoleChange,
  handleRemoveMember,
  userId,
}) => (
  <div className="space-y-6">
    {/* Members List */}
    <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-white">
          Members ({groupData.totalMembers})
        </h3>
        <div className="flex space-x-2">
          {[
            {
              label: "Add Member",
              onClick: () => setShowAddMember(true),
              show: true,
              className:
                "bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors",
            },
            {
              label: "Bulk Add",
              onClick: () => setShowBulkAddMembers(true),
              show: groupData.currentUserPermissions.canManageMembers,
              className:
                "bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors",
            },
            {
              label: "Bulk Remove",
              onClick: () => setShowBulkRemoveMembers(true),
              show: groupData.currentUserPermissions.canManageMembers,
              className:
                "bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors",
            },
          ]
            .filter((btn) => btn.show)
            .map((btn) => (
              <button
                key={btn.label}
                onClick={btn.onClick}
                className={btn.className}
              >
                {btn.label}
              </button>
            ))}
        </div>
      </div>

      {/* Increased height for members container */}
      <div
        className="max-h-[450px] overflow-y-auto space-y-3 pr-2"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#14b8a6 #2a2a2a",
        }}
      >
        {groupData.members.map((member) => (
          <div
            key={member.userId}
            style={{ background: "#2a2a2a" }}
            className="flex items-center justify-between p-4 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                {getUserInitials(
                  member.firstName,
                  member.lastName,
                  member.username
                )}
              </div>
              <div>
                <h4 className="text-white font-semibold">
                  {member.firstName && member.lastName
                    ? `${member.firstName} ${member.lastName}`
                    : member.username || "Unknown User"}
                </h4>
                <p className="text-gray-400 text-sm">{member.email}</p>
                <p className="text-gray-500 text-xs">
                  Joined {formatDate(member.joinedAt)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <span
                className="px-3 py-1 rounded-full text-sm font-semibold"
                style={{
                  backgroundColor: `${getRoleColor(member.role)}20`,
                  color: getRoleColor(member.role),
                }}
              >
                {member.role}
              </span>

              {groupData.currentUserPermissions.canPromoteMembers &&
                member.userId !== userId && (
                  <select
                    value={member.role}
                    onChange={(e) =>
                      handleRoleChange(member.userId, e.target.value)
                    }
                    className="bg-gray-600 text-white px-3 py-1 rounded border-none outline-none"
                  >
                    {["VIEWER", "MEMBER", "MODERATOR", "ADMIN"].map((role) => (
                      <option key={role} value={role}>
                        {role.charAt(0) + role.slice(1).toLowerCase()}
                      </option>
                    ))}
                  </select>
                )}

              {groupData.currentUserPermissions.canManageMembers &&
                member.userId !== userId && (
                  <button
                    onClick={() => handleRemoveMember(member.userId)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                  >
                    Remove
                  </button>
                )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default MembersTabContent;
