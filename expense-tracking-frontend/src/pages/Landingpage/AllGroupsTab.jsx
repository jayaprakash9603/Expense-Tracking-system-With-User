import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { leaveGroup, fetchAllGroups } from "../../Redux/Groups/groupsActions";
import useUserSettings from "../../hooks/useUserSettings";
import { useTheme } from "../../hooks/useTheme";

const AllGroupsTab = ({ groups = [], searchQuery = "" }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { colors, mode } = useTheme();
  const [openMenuId, setOpenMenuId] = useState(null);
  const settings = useUserSettings();
  const currencySymbol = settings.getCurrency().symbol;

  // Format amount to 1k, 1m, 1b, etc.
  const formatAmount = (amount) => {
    if (amount == null) return `${currencySymbol}0`;
    if (amount >= 1_000_000_000)
      return `${currencySymbol}${(amount / 1_000_000_000)
        .toFixed(1)
        .replace(/\.0$/, "")}b`;
    if (amount >= 1_000_000)
      return `${currencySymbol}${(amount / 1_000_000)
        .toFixed(1)
        .replace(/\.0$/, "")}m`;
    if (amount >= 1_000)
      return `${currencySymbol}${(amount / 1_000)
        .toFixed(1)
        .replace(/\.0$/, "")}k`;
    return `${currencySymbol}${amount}`;
  };

  // Hide menu when clicking outside
  useEffect(() => {
    if (!openMenuId) return;
    const handleClick = (e) => {
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

  const getRoleBadgeStyles = (role) => {
    if (role === "ADMIN") {
      return {
        backgroundColor: colors.primary_accent,
        color: mode === "light" ? colors.button_text : colors.primary_text,
      };
    }

    if (role === "MODERATOR") {
      return {
        backgroundColor: colors.secondary_accent,
        color: mode === "light" ? colors.button_text : colors.primary_text,
      };
    }

    return {
      backgroundColor: colors.hover_bg,
      color: colors.primary_text,
    };
  };

  const handleLeaveGroup = (groupId) => {
    dispatch(leaveGroup(groupId)).then(() => {
      dispatch(fetchAllGroups());
    });
    setOpenMenuId(null);
  };
  // Get logged-in user id from localStorage (or Redux if available)
  const userId = useSelector((state) => state.auth?.user?.id);
  const filteredGroups = groups.filter(
    (group) =>
      Array.isArray(group.memberIds) &&
      group.memberIds.includes(userId) &&
      (group.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        group.createdByUsername
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );
  return (
    <div className="pb-6">
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden relative"
              style={{ backgroundColor: colors.card_bg }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary_accent}`;
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
                      openMenuId === group.id
                        ? colors.primary_accent
                        : "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (openMenuId !== group.id) {
                      e.currentTarget.style.backgroundColor = colors.hover_bg;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (openMenuId !== group.id) {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <div className="flex flex-col space-y-1">
                    <div
                      className="w-1 h-1 rounded-full transition-colors duration-200"
                      style={{
                        backgroundColor:
                          openMenuId === group.id
                            ? colors.primary_text
                            : colors.placeholder_text,
                      }}
                    ></div>
                    <div
                      className="w-1 h-1 rounded-full transition-colors duration-200"
                      style={{
                        backgroundColor:
                          openMenuId === group.id
                            ? colors.primary_text
                            : colors.placeholder_text,
                      }}
                    ></div>
                    <div
                      className="w-1 h-1 rounded-full transition-colors duration-200"
                      style={{
                        backgroundColor:
                          openMenuId === group.id
                            ? colors.primary_text
                            : colors.placeholder_text,
                      }}
                    ></div>
                  </div>
                </button>

                {/* Dropdown menu */}
                {openMenuId === group.id && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-lg py-2 z-20 group-menu-dropdown"
                    style={{
                      backgroundColor: colors.hover_bg,
                      border: `1px solid ${colors.primary_accent}`,
                    }}
                  >
                    <button
                      onClick={() => handleLeaveGroup(group.id)}
                      className="w-full text-left px-4 py-2 flex items-center space-x-3"
                      style={{
                        color: colors.primary_text,
                        opacity: 0.85,
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
                  backgroundColor: group.color || colors.primary_accent,
                }}
              ></div>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-3xl">{group.avatar || "👥"}</div>
                  <div className="text-right pr-8">
                    <div
                      className="text-sm"
                      style={{ color: colors.placeholder_text }}
                    >
                      Total Expenses
                    </div>
                    <div
                      className="text-xl font-bold"
                      style={{ color: colors.primary_text }}
                    >
                      {formatAmount(group.totalExpenses)}
                    </div>
                  </div>
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: colors.primary_text }}
                >
                  {group.name}
                </h3>
                <p
                  className="text-sm mb-3 line-clamp-2"
                  style={{ color: colors.placeholder_text }}
                >
                  {group.description}
                </p>
                <div
                  className="flex justify-between items-center text-sm mb-2"
                  style={{ color: colors.placeholder_text }}
                >
                  <span>{group.totalMembers} members</span>
                  <span
                    className="text-xs px-2 py-1 rounded-full"
                    style={{
                      borderRadius: "9999px",
                      ...getRoleBadgeStyles(group.currentUserRole),
                    }}
                  >
                    {group.currentUserRole}
                  </span>
                </div>
                <div
                  className="flex justify-between items-center text-sm mb-4"
                  style={{ color: colors.placeholder_text }}
                >
                  <span>
                    Created by {group.createdByUsername || group.createdBy}
                  </span>
                  <span>Active {group.recentActivity}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    style={{
                      backgroundColor: colors.tertiary_accent,
                      color: colors.button_text,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        colors.button_hover;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        colors.tertiary_accent;
                    }}
                    onClick={() => navigate(`/groups/${group.id}`)}
                  >
                    View Details
                  </button>
                  <button
                    className="flex-1 py-2 px-4 rounded-lg font-medium transition-colors duration-200"
                    style={{
                      backgroundColor: colors.button_inactive,
                      color: colors.primary_text,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = colors.hover_bg;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor =
                        colors.button_inactive;
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
          <h3
            className="text-2xl font-bold mb-2"
            style={{ color: colors.primary_text }}
          >
            No Groups Found
          </h3>
          <p style={{ color: colors.placeholder_text }}>
            {searchQuery
              ? `No groups match "${searchQuery}"`
              : "You haven't joined or created any groups yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default AllGroupsTab;
