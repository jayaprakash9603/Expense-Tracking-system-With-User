import React, { useState, useEffect } from "react";
import { useSelector as useReduxSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllGroups,
  fetchPendingInvitations,
} from "../../Redux/Groups/groupsActions";
import { fetchGroupRecommendations } from "../../Redux/Groups/groupsActions";
import { fetchUserGroups } from "../../Redux/Groups/groupsActions";
import MyGroupsTab from "./MyGroupsTab";
import AllGroupsTab from "./AllGroupsTab";
import InvitationsTab from "./InvitationsTab";
import DiscoverTab from "./DiscoverTab";
import { useTheme } from "../../hooks/useTheme";

const Groups = () => {
  const userId = useReduxSelector((state) => state.auth?.user?.id);
  const { colors } = useTheme();
  const groupRecommendations = useSelector(
    (state) => state.groups.groupRecommendations
  );
  const groupRecommendationsLoading = useSelector(
    (state) => state.groups.groupRecommendationsLoading
  );
  const groupRecommendationsError = useSelector(
    (state) => state.groups.groupRecommendationsError
  );
  const [activeTab, setActiveTab] = useState("my-groups");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const pendingInvitations = useSelector(
    (state) => state.groups.pendingInvitations
  );
  const pendingInvitationsLoading = useSelector(
    (state) => state.groups.pendingInvitationsLoading
  );
  const pendingInvitationsError = useSelector(
    (state) => state.groups.pendingInvitationsError
  );
  const userGroups = useSelector((state) => state.groups.userGroups);
  const userGroupsLoading = useSelector(
    (state) => state.groups.userGroupsLoading
  );
  const userGroupsError = useSelector((state) => state.groups.userGroupsError);

  const allGroups = useSelector((state) => state.groups.allGroups);
  const allGroupsLoading = useSelector(
    (state) => state.groups.allGroupsLoading
  );
  const allGroupsError = useSelector((state) => state.groups.allGroupsError);

  useEffect(() => {
    dispatch(fetchPendingInvitations());
    dispatch(fetchGroupRecommendations());
    dispatch(fetchUserGroups());
    dispatch(fetchAllGroups());
  }, [dispatch]);

  // Updated invitations data structure to match your API format
  // Invitations now come from Redux
  const invitations = pendingInvitations;

  // Group recommendations data matching your API format
  // Recommendations now come from Redux

  // Simulate joinedGroups and createdGroups (replace with API data in real app)
  // ...existing code...

  const filteredAllGroups = allGroups.filter(
    (group) =>
      Array.isArray(group.memberIds) &&
      group.memberIds.includes(userId) &&
      (group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.createdByUsername
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );
  // Filter functions for search
  const filteredUserGroups = userGroups.filter(
    (group) =>
      Array.isArray(group.memberIds) &&
      group.memberIds.includes(userId) &&
      (group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.createdByUsername
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  // ...existing code...

  const filteredInvitations = invitations.filter(
    (invitation) =>
      invitation.groupName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invitation.inviter.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invitation.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRecommendations = groupRecommendations.filter(
    (recommendation) =>
      recommendation.groupName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (recommendation.groupDescription &&
        recommendation.groupDescription
          .toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      recommendation.creatorEmail
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((date - now) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `Expires in ${diffInHours}h`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `Expires in ${diffInDays}d`;
    }
  };

  // Helper function to format creation date for recommendations
  const formatCreatedDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return "Created today";
    } else if (diffInDays === 1) {
      return "Created yesterday";
    } else if (diffInDays < 7) {
      return `Created ${diffInDays} days ago`;
    } else {
      return `Created on ${date.toLocaleDateString()}`;
    }
  };

  // Get placeholder text based on active tab
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case "my-groups":
        return "Search groups by name, description, or creator...";
      case "joined-created":
        return "Search all joined & created groups...";
      case "invitations":
        return "Search invitations by group name, inviter, or role...";
      case "discover":
        return "Search recommendations by group name or description...";
      default:
        return "Search...";
    }
  };

  const handleCreateGroup = () => {
    navigate("/groups/create");
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case "my-groups":
        return (
          <MyGroupsTab
            filteredMyGroups={filteredUserGroups}
            searchQuery={searchQuery}
            loading={userGroupsLoading}
            error={userGroupsError}
          />
        );
      case "joined-created":
        return (
          <AllGroupsTab
            groups={filteredAllGroups}
            searchQuery={searchQuery}
            title="Joined & Created Groups"
            loading={allGroupsLoading}
            error={allGroupsError}
          />
        );
      case "invitations":
        return (
          <InvitationsTab
            filteredInvitations={filteredInvitations}
            searchQuery={searchQuery}
            formatDate={formatDate}
          />
        );
      case "discover":
        return (
          <DiscoverTab
            filteredRecommendations={filteredRecommendations}
            searchQuery={searchQuery}
            formatCreatedDate={formatCreatedDate}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="shadow-2xl rounded-2xl flex flex-col"
      style={{
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        // marginTop: "50px",
        marginRight: "20px",
        backgroundColor: colors.secondary_bg,
      }}
    >
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: ${colors.hover_bg};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: ${colors.primary_accent};
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: ${colors.tertiary_accent};
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: ${colors.primary_accent} ${colors.hover_bg};
        }
      `}</style>

      {/* Header Section - Fixed */}
      <div
        className="p-6 shadow-sm flex-shrink-0"
        style={{
          backgroundColor: colors.tertiary_bg,
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1
              className="text-3xl font-bold mb-2"
              style={{ color: colors.primary_text }}
            >
              Groups
            </h1>
            <p style={{ color: colors.secondary_text }}>
              Manage your expense groups and collaborate with others
            </p>
          </div>
          <button
            onClick={handleCreateGroup}
            className="px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
            style={{
              backgroundColor: colors.primary_accent,
              color: colors.button_text,
            }}
            onMouseEnter={(e) =>
              (e.target.style.backgroundColor = colors.tertiary_accent)
            }
            onMouseLeave={(e) =>
              (e.target.style.backgroundColor = colors.primary_accent)
            }
          >
            <span className="text-xl">+</span>
            Create Group
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          className="flex space-x-1 p-1 rounded-xl mb-6"
          style={{
            backgroundColor: colors.hover_bg,
          }}
        >
          <button
            onClick={() => setActiveTab("my-groups")}
            className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300"
            style={
              activeTab === "my-groups"
                ? {
                    backgroundColor: colors.active_bg,
                    color: colors.active_text,
                  }
                : {
                    backgroundColor: "transparent",
                    color: colors.secondary_text,
                  }
            }
            onMouseEnter={(e) => {
              if (activeTab !== "my-groups") {
                e.target.style.backgroundColor = colors.active_bg;
                e.target.style.color = colors.primary_text;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "my-groups") {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = colors.secondary_text;
              }
            }}
          >
            My Groups ({filteredUserGroups.length})
          </button>
          <button
            onClick={() => setActiveTab("joined-created")}
            className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300"
            style={
              activeTab === "joined-created"
                ? {
                    backgroundColor: colors.active_bg,
                    color: colors.active_text,
                  }
                : {
                    backgroundColor: "transparent",
                    color: colors.secondary_text,
                  }
            }
            onMouseEnter={(e) => {
              if (activeTab !== "joined-created") {
                e.target.style.backgroundColor = colors.active_bg;
                e.target.style.color = colors.primary_text;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "joined-created") {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = colors.secondary_text;
              }
            }}
          >
            Joined & Created ({filteredAllGroups.length})
          </button>
          <button
            onClick={() => setActiveTab("invitations")}
            className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300"
            style={
              activeTab === "invitations"
                ? {
                    backgroundColor: colors.active_bg,
                    color: colors.active_text,
                  }
                : {
                    backgroundColor: "transparent",
                    color: colors.secondary_text,
                  }
            }
            onMouseEnter={(e) => {
              if (activeTab !== "invitations") {
                e.target.style.backgroundColor = colors.active_bg;
                e.target.style.color = colors.primary_text;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "invitations") {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = colors.secondary_text;
              }
            }}
          >
            Invitations ({filteredInvitations.length})
          </button>
          <button
            onClick={() => setActiveTab("discover")}
            className="flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300"
            style={
              activeTab === "discover"
                ? {
                    backgroundColor: colors.active_bg,
                    color: colors.active_text,
                  }
                : {
                    backgroundColor: "transparent",
                    color: colors.secondary_text,
                  }
            }
            onMouseEnter={(e) => {
              if (activeTab !== "discover") {
                e.target.style.backgroundColor = colors.active_bg;
                e.target.style.color = colors.primary_text;
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== "discover") {
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = colors.secondary_text;
              }
            }}
          >
            Discover ({filteredRecommendations.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5"
              style={{ color: colors.placeholder_text }}
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl transition-all duration-300"
            placeholder={getSearchPlaceholder()}
            style={{
              backgroundColor: colors.hover_bg,
              color: colors.primary_text,
              outline: "none",
            }}
            onFocus={(e) => {
              e.target.style.boxShadow = `0 0 0 2px ${colors.primary_accent}`;
              e.target.style.backgroundColor = colors.active_bg;
            }}
            onBlur={(e) => {
              e.target.style.boxShadow = "none";
              e.target.style.backgroundColor = colors.hover_bg;
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors duration-200"
              style={{ color: colors.placeholder_text }}
              onMouseEnter={(e) => (e.target.style.color = colors.primary_text)}
              onMouseLeave={(e) =>
                (e.target.style.color = colors.placeholder_text)
              }
            >
              <svg
                className="h-5 w-5"
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
          )}
        </div>
      </div>

      {/* Content Section - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        {renderActiveTab()}
      </div>
    </div>
  );
};

export default Groups;
