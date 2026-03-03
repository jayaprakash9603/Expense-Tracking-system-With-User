import React, { useState } from "react";

const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "MEMBER", label: "Member" },
  { value: "VIEWER", label: "Viewer" },
];

const InvitesTabContent = ({
  availableFriends,
  groupId,
  inviteFriendToGroup,
  setShowInviteModal,
  refreshSentInvitations,
  fetchFriendsNotInGroup,
}) => {
  const [roleSelections, setRoleSelections] = useState({});
  const [loadingIds, setLoadingIds] = useState([]);
  const [search, setSearch] = useState("");

  const handleRoleChange = (friendId, role) => {
    setRoleSelections((prev) => ({ ...prev, [friendId]: role }));
  };

  const handleInvite = async (friend) => {
    const role = roleSelections[friend.id] || "MEMBER";
    setLoadingIds((ids) => [...ids, friend.id]);
    const result = await inviteFriendToGroup(
      groupId,
      friend.id,
      role,
      "group invite request"
    );
    setLoadingIds((ids) => ids.filter((id) => id !== friend.id));
    if (result.success) {
      // availableFriends will update via parent prop, no need to update local state
      if (typeof refreshSentInvitations === "function") {
        refreshSentInvitations();
      }
      if (typeof fetchFriendsNotInGroup === "function") {
        fetchFriendsNotInGroup(groupId);
      }
    }
  };

  // Filter friends based on search input
  const filteredFriends = Array.isArray(availableFriends)
    ? availableFriends.filter((friend) => {
        const searchLower = search.toLowerCase();
        return (
          (friend.username &&
            friend.username.toLowerCase().includes(searchLower)) ||
          (friend.firstName &&
            friend.firstName.toLowerCase().includes(searchLower)) ||
          (friend.lastName &&
            friend.lastName.toLowerCase().includes(searchLower)) ||
          (friend.email && friend.email.toLowerCase().includes(searchLower))
        );
      })
    : [];

  return (
    <div className="space-y-6">
      <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
        <div className="flex items-center mb-4 w-full">
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search friends..."
              className="pl-10 pr-4 py-2 rounded-lg text-white placeholder-gray-300 transition-all duration-200 border-none outline-none w-full"
              style={{ minWidth: "180px", background: "#0b0b0b" }}
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
          <div className="flex-1" />
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors ml-4"
          >
            Send Invites
          </button>
        </div>

        {/* Add scrollable container for invites */}
        <div
          className="max-h-[450px] overflow-y-auto space-y-3 pr-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#14b8a6 #2a2a2a",
          }}
        >
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => {
              // Get initials: username first, else firstName+lastName, else from email
              let initials = "??";
              if (friend.username && friend.username.trim()) {
                initials = friend.username
                  .split(" ")
                  .map((n) => n[0])
                  .join("");
              } else if (friend.firstName && friend.lastName) {
                initials =
                  `${friend.firstName[0]}${friend.lastName[0]}`.toUpperCase();
              } else if (friend.email) {
                const localPart = friend.email.split("@")[0];
                initials = localPart
                  .split(/[._\s]/)
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase();
              }
              // Display name: username first, else firstName+lastName, else from email
              let displayName =
                friend.username && friend.username.trim()
                  ? friend.username
                  : friend.firstName && friend.lastName
                  ? `${friend.firstName} ${friend.lastName}`
                  : friend.email
                  ? friend.email.split("@")[0]
                  : friend.name;
              return (
                <div
                  key={friend.id}
                  style={{ background: "#2a2a2a" }}
                  className="flex items-center justify-between p-4 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {initials}
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">
                        {displayName}
                      </h4>
                      <p className="text-gray-400 text-sm">{friend.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <select
                      value={roleSelections[friend.id] || "MEMBER"}
                      onChange={(e) =>
                        handleRoleChange(friend.id, e.target.value)
                      }
                      className="bg-gray-700 text-white px-2 py-1 rounded-lg mr-2"
                      style={{ marginRight: "12px", outline: "none" }}
                    >
                      {ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleInvite(friend)}
                      className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
                      disabled={loadingIds.includes(friend.id)}
                    >
                      {loadingIds.includes(friend.id)
                        ? "Inviting..."
                        : "Invite"}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div
              className="flex flex-col items-center justify-center"
              style={{
                width: "100%",
                height: "300px",
                minHeight: "200px",
                background: "#232323",
                borderRadius: "12px",
                color: "#b0b0b0",
                fontSize: "1.2rem",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              No friends found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvitesTabContent;
