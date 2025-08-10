import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { leaveGroup } from "../../Redux/Groups/groupsActions";
import { fetchUserGroups } from "../../Redux/Groups/groupsActions";

const MyGroupsTab = ({ filteredMyGroups, searchQuery }) => {
  const navigate = useNavigate();
  const userId = useSelector((state) => state.auth?.user?.id);
  const [openMenuId, setOpenMenuId] = useState(null);
  const dispatch = useDispatch();

  // Format amount to 1k, 1m, 1b, etc.
  const formatAmount = (amount) => {
    if (amount == null) return "₹0";

    if (amount >= 1_000_000_000)
      return `₹${(amount / 1_000_000_000).toFixed(1).replace(/\.0$/, "")}b`;
    if (amount >= 1_000_000)
      return `₹${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
    if (amount >= 1_000)
      return `₹${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}k`;
    return `₹${amount}`;
  };

  // Hide menu when clicking outside
  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = (e) => {
      // If click is outside any menu button or dropdown, close menu
      if (
        !e.target.closest(".group-menu-btn") &&
        !e.target.closest(".group-menu-dropdown")
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [openMenuId]);
  const handleMenuToggle = (groupId) => {
    setOpenMenuId(openMenuId === groupId ? null : groupId);
  };

  const handleLeaveGroup = (groupId) => {
    dispatch(leaveGroup(groupId)).then(() => {
      dispatch(fetchUserGroups());
    });
    setOpenMenuId(null);
  };

  const filteredGroups = filteredMyGroups.filter(
    (group) =>
      Array.isArray(group.memberIds) && group.memberIds.includes(userId)
  );
  return (
    <div className="pb-6">
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative"
              style={{
                backgroundColor: "#1a1a1a",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = "0 0 0 2px #14b8a6";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "";
              }}
            >
              {/* Three dots menu */}
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={() => handleMenuToggle(group.id)}
                  className="p-2 rounded-full transition-all duration-200 group-menu-btn"
                  style={{
                    backgroundColor:
                      openMenuId === group.id ? "#14b8a6" : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (openMenuId !== group.id) {
                      e.target.style.backgroundColor = "#2a2a2a";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (openMenuId !== group.id) {
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div className="flex flex-col space-y-1">
                    <div
                      className="w-1 h-1 rounded-full transition-colors duration-200"
                      style={{
                        backgroundColor:
                          openMenuId === group.id ? "#ffffff" : "#9ca3af",
                      }}
                    ></div>
                    <div
                      className="w-1 h-1 rounded-full transition-colors duration-200"
                      style={{
                        backgroundColor:
                          openMenuId === group.id ? "#ffffff" : "#9ca3af",
                      }}
                    ></div>
                    <div
                      className="w-1 h-1 rounded-full transition-colors duration-200"
                      style={{
                        backgroundColor:
                          openMenuId === group.id ? "#ffffff" : "#9ca3af",
                      }}
                    ></div>
                  </div>
                </button>

                {/* Dropdown menu */}
                {openMenuId === group.id && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg py-2 z-20 group-menu-dropdown"
                    style={{
                      backgroundColor: "#232323",
                      border: "1px solid #14b8a6",
                    }}
                  >
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="w-full text-left px-4 py-2 flex items-center space-x-3"
                      style={{
                        color: "#ef4444",
                        fontWeight: 500,
                        fontSize: "1rem",
                        borderRadius: "8px",
                        backgroundColor: "transparent",
                        minHeight: "32px",
                        height: "32px",
                      }}
                    >
                      <span className="text-lg">🚪</span>
                      <span className="font-medium">Leave Group</span>
                    </button>
                  </div>
                )}
              </div>

              <div
                className="h-2 w-full"
                style={{
                  backgroundColor: group.color ? group.color : "#14b8a6",
                }}
              ></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{group.avatar}</div>
                  <div className="text-right pr-8">
                    <div className="text-sm text-gray-400">Total Expenses</div>
                    <div className="text-xl font-bold text-white">
                      {formatAmount(group.totalExpenses)}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {group.name}
                </h3>
                <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                  {group.description}
                </p>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
                  <span>{group.totalMembers} members</span>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      backgroundColor:
                        group.currentUserRole === "ADMIN"
                          ? "#14b8a6"
                          : group.currentUserRole === "MODERATOR"
                          ? "#f59e0b"
                          : "#6b7280",
                      color: "white",
                    }}
                  >
                    {group.currentUserRole}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                  <span>Created by {group.createdByUsername}</span>
                  <span>Active {group.recentActivity}</span>
                </div>
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
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    style={{
                      backgroundColor: "#3a3a3a",
                      color: "#d1d5db",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = "#4a4a4a";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = "#3a3a3a";
                    }}
                  >
                    Add Expense
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold text-white mb-2">
            No Groups Found
          </h3>
          <p className="text-gray-400">
            {searchQuery
              ? `No groups match "${searchQuery}"`
              : "You haven't joined any groups yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyGroupsTab;
