import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { cancelInvitation } from "../../Redux/Groups/groupsActions";

// Additional imports can be added here if needed
const InvitesModal = ({
  invites = [],
  onClose,
  onResendInvite,
  onRemoveInvite,
}) => {
  const [search, setSearch] = useState("");
  const [removingId, setRemovingId] = useState(null);

  // Helper function to extract name from email
  const getNameFromEmail = (email) => {
    if (!email) return "";
    const localPart = email.split("@")[0];
    // Replace dots, underscores, numbers with spaces and capitalize
    return localPart
      .replace(/[._\d]/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
      .trim();
  };

  // Helper function to get display name
  const getDisplayName = (invite) => {
    if (invite.invitee && invite.invitee !== "null null") {
      return invite.invitee;
    }
    return getNameFromEmail(invite.inviteeEmail);
  };

  // Enhanced filter function for comprehensive search
  const filteredInvites = invites.filter((invite) => {
    const searchTerm = search.toLowerCase();
    const email = invite.inviteeEmail?.toLowerCase() || "";
    const inviteeName = invite.invitee?.toLowerCase() || "";
    const displayName = getDisplayName(invite).toLowerCase();
    const groupName = invite.groupName?.toLowerCase() || "";
    const role = invite.role?.toLowerCase() || "";
    const status = invite.status?.toLowerCase() || "";

    return (
      email.includes(searchTerm) ||
      inviteeName.includes(searchTerm) ||
      displayName.includes(searchTerm) ||
      groupName.includes(searchTerm) ||
      role.includes(searchTerm) ||
      status.includes(searchTerm)
    );
  });

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Helper function to get days until expiry
  const getDaysUntilExpiry = (expiresAt) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffTime = expiry - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Helper function to get avatar initials
  const getAvatarInitials = (invite) => {
    const displayName = getDisplayName(invite);
    if (displayName) {
      return displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return invite.inviteeEmail ? invite.inviteeEmail[0].toUpperCase() : "?";
  };

  // Helper function to get avatar color based on email
  const getAvatarColor = (email) => {
    const colors = [
      "bg-gradient-to-br from-purple-500 to-pink-500",
      "bg-gradient-to-br from-blue-500 to-cyan-500",
      "bg-gradient-to-br from-green-500 to-teal-500",
      "bg-gradient-to-br from-orange-500 to-red-500",
      "bg-gradient-to-br from-indigo-500 to-purple-500",
      "bg-gradient-to-br from-pink-500 to-rose-500",
    ];
    const index = email.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ background: "#1b1b1b" }}
    >
      <div
        className="shadow-2xl rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden"
        style={{ background: "#1b1b1b" }}
      >
        {/* Header Section with Search */}
        <div className="relative p-6" style={{ background: "#0b0b0b" }}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors duration-200 p-2 rounded-full hover:bg-gray-700"
            aria-label="Close"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          <div className="mb-0" style={{ marginBottom: "-12px" }}>
            <div className="flex items-center space-x-4">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-teal-600 bg-opacity-20 rounded-full">
                <svg
                  className="w-7 h-7 text-teal-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="flex flex-col justify-center">
                <h2 className="text-2xl font-bold text-white mb-0 leading-tight">
                  Pending Invitations
                  {/* Header Section with Search */}
                </h2>
                <p className="text-gray-400 text-sm mb-0 leading-tight">
                  Manage your group invitations
                </p>
              </div>
            </div>
          </div>

          {/* ...existing code... */}
        </div>

        {/* Content Section */}
        <div className="p-6" style={{ background: "#0b0b0b" }}>
          {/* Search Section and invitations count on same row */}
          <div className="mb-4 flex items-center justify-between">
            <div className="relative max-w-lg w-full" style={{ marginLeft: 0 }}>
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
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, group, role, or status..."
                className="w-full pl-10 pr-4 py-2 rounded-xl text-white placeholder-gray-300 transition-all duration-200"
                style={{
                  marginLeft: 0,
                  background: "#1b1b1b",
                  outline: "none",
                  border: "none",
                }}
              />
            </div>
            <span className="text-gray-300 text-sm ml-4 whitespace-nowrap">
              {filteredInvites.length} invitation
              {filteredInvites.length !== 1 ? "s" : ""} found
            </span>
          </div>

          <div className="space-y-4 max-h-[430px] overflow-y-auto custom-scrollbar pr-4">
            {filteredInvites.length > 0 ? (
              filteredInvites.map((invite) => {
                const daysLeft = getDaysUntilExpiry(invite.expiresAt);
                const isExpiringSoon = daysLeft <= 2;
                const displayName = getDisplayName(invite);

                return (
                  <div
                    key={invite.invitationId}
                    className="rounded-xl p-4 transition-all duration-200 hover:shadow-lg"
                    style={{
                      background: "#1b1b1b",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      {/* Left Section - Avatar and Info */}
                      <div className="flex items-center space-x-4 flex-1">
                        <div
                          className={`w-14 h-14 ${getAvatarColor(
                            invite.inviteeEmail
                          )} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                        >
                          {getAvatarInitials(invite)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center mb-1 relative">
                            <h4
                              className="text-white font-semibold text-lg truncate max-w-[180px]"
                              title={displayName}
                              style={{
                                display: "inline-block",
                                verticalAlign: "middle",
                              }}
                            >
                              {displayName}
                            </h4>
                            {/* ...existing code... */}
                            <span
                              className="absolute top-0 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-200 border border-yellow-700"
                              style={{
                                minWidth: "70px",
                                justifyContent: "center",
                                right: "170px",
                              }}
                            >
                              {invite.status}
                            </span>
                          </div>

                          <p className="text-gray-400 text-sm mb-1">
                            {invite.inviteeEmail}
                          </p>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                              <span>{invite.groupName}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <span>{invite.role}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>Sent {formatDate(invite.sentAt)}</span>
                            </div>
                            <div
                              className={`flex items-center space-x-1 ${
                                isExpiringSoon ? "text-red-400" : ""
                              }`}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span>
                                {daysLeft > 0
                                  ? `${daysLeft} day${
                                      daysLeft !== 1 ? "s" : ""
                                    } left`
                                  : "Expired"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex items-center space-x-3 ml-4">
                        <button
                          onClick={() =>
                            onResendInvite && onResendInvite(invite)
                          }
                          className="inline-flex items-center px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-gray-800"
                        >
                          <svg
                            className="w-4 h-4 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                            />
                          </svg>
                          Resend
                        </button>
                        <button
                          onClick={async () => {
                            setRemovingId(invite.invitationId);
                            if (onRemoveInvite) {
                              await onRemoveInvite(invite);
                            }
                            setRemovingId(null);
                          }}
                          className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200 focus:outline-none"
                          style={{ border: "none" }}
                          disabled={removingId === invite.invitationId}
                        >
                          {removingId === invite.invitationId ? (
                            <>Removing...</>
                          ) : (
                            <>
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Remove
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mb-4">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-300 mb-2">
                  No invitations found
                </h3>
                <p className="text-gray-500 text-sm">
                  {search
                    ? "Try adjusting your search terms"
                    : "All invitations have been processed"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #14b8a6;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0e9488;
        }
      `}</style>
    </div>
  );
};

export default InvitesModal;
