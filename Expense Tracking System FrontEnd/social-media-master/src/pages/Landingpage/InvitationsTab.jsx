import React from "react";
import { useDispatch } from "react-redux";
import { respondToInvitation } from "../../Redux/Groups/groupsActions";
import { fetchPendingInvitations } from "../../Redux/Groups/groupsActions";

const InvitationsTab = ({ filteredInvitations, searchQuery, formatDate }) => {
  const dispatch = useDispatch();

  const handleRespond = (invitationId, accept) => {
    dispatch(respondToInvitation(invitationId, accept)).then(() => {
      dispatch(fetchPendingInvitations());
    });
  };
  return (
    <div className="pb-6">
      {filteredInvitations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvitations.map((invitation) => (
            <div
              key={invitation.invitationId}
              className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
              style={{ backgroundColor: "#1a1a1a" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0 2px #14b8a6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "";
              }}
            >
              <div className={`h-2 bg-purple-500`}></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{invitation.avatar || "📨"}</div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Expires</div>
                    <div className="text-sm font-bold text-orange-400">
                      {formatDate(invitation.expiresAt)}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {invitation.groupName}
                </h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {invitation.groupDescription}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                  <span>{invitation.memberCount} members</span>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{ backgroundColor: "#14b8a6", color: "white" }}
                  >
                    {invitation.role}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <span>
                    Invited by {invitation.inviter || invitation.inviterEmail}
                  </span>
                  <span>Invited at {formatDate(invitation.invitedAt)}</span>
                </div>
                {invitation.message && (
                  <div className="text-sm text-gray-300 mb-4 italic">
                    "{invitation.message}"
                  </div>
                )}
                <div className="flex space-x-2">
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    style={{ backgroundColor: "#0f9488", color: "#fff" }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#14b8a6";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#0f9488";
                    }}
                    onClick={() => handleRespond(invitation.invitationId, true)}
                  >
                    Accept
                  </button>
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    style={{ backgroundColor: "#23272f", color: "#d1d5db" }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#374151";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#23272f";
                    }}
                    onClick={() =>
                      handleRespond(invitation.invitationId, false)
                    }
                  >
                    Decline
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">📨</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            No Invitations Found
          </h3>
          <p className="text-gray-400">
            {searchQuery
              ? `No invitations match "${searchQuery}"`
              : "You don't have any pending invitations"}
          </p>
        </div>
      )}
    </div>
  );
};

export default InvitationsTab;
