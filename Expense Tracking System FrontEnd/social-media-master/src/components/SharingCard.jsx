import React from "react";
import { Button, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import SettingsIcon from "@mui/icons-material/Settings";

// Reusable sharing card component
// Props:
//  - user: { userId, name, email, accessLevel }
//  - direction: 'incoming' | 'outgoing'
//  - selected: boolean
//  - onSelect: () => void
//  - onView: () => void (only for incoming if access allows)
//  - onSettings: () => void (only for outgoing)
//  - getAccessLevelIcon(level)
//  - getAccessLevelDescription(level, directionKey)
//  - getInitials(first, last)
//  - getAvatarColor(id)
//  - themeColor
const SharingCard = ({
  user,
  direction,
  selected,
  onSelect,
  onView,
  onSettings,
  getAccessLevelIcon,
  getAccessLevelDescription,
  getInitials,
  getAvatarColor,
  themeColor = "#14b8a6",
}) => {
  const directionBadge = direction === "incoming" ? "S" : "Y";
  const directionTitle =
    direction === "incoming" ? "Sharing with you" : "You are sharing";
  const descriptionKey =
    direction === "incoming" ? "theySharing" : "youSharing";
  const canView =
    direction === "incoming" && user.accessLevel && user.accessLevel !== "NONE";

  return (
    <div
      onClick={onSelect}
      className={`group relative rounded-lg border transition-all duration-150 cursor-pointer bg-[#1e1e1e] hover:bg-[#242424] ${
        selected
          ? "border-[#14b8a6] shadow-[0_0_0_1px_#14b8a6,inset_0_0_0_1px_#14b8a622]"
          : "border-[#2a2a2a]"
      }`}
    >
      <div className="flex items-start p-4 gap-4">
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold"
            style={{ backgroundColor: getAvatarColor(user.userId) }}
          >
            {getInitials(
              user.name.split(" ")[0],
              user.name.split(" ")[1] || ""
            )}
          </div>
          <span
            className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#14b8a6] flex items-center justify-center text-[10px] font-bold text-black shadow"
            title={directionTitle}
          >
            {directionBadge}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="text-white text-sm font-semibold truncate">
              {user.name}
            </p>
            <span className="text-[10px] tracking-wide px-2 py-1 rounded-full bg-[#14b8a61a] text-[#14b8a6] border border-[#14b8a633]">
              {user.accessLevel || "NONE"}
            </span>
          </div>
          <p className="text-xs text-gray-400 truncate mb-1">{user.email}</p>
          <div className="flex items-center text-[11px] text-gray-300 gap-1">
            {getAccessLevelIcon(user.accessLevel)}
            <span className="text-[#14b8a6]">
              {getAccessLevelDescription(user.accessLevel, descriptionKey)}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2 items-end">
          {canView && (
            <Tooltip title="View Shared Expenses">
              <Button
                variant="outlined"
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  onView && onView();
                }}
                sx={{
                  color: themeColor,
                  borderColor: themeColor,
                  minWidth: 0,
                  width: 42,
                  height: 36,
                  "&:hover": {
                    borderColor: themeColor,
                    backgroundColor: "rgba(20,184,166,0.12)",
                  },
                }}
              >
                <VisibilityIcon fontSize="small" />
              </Button>
            </Tooltip>
          )}
          {direction === "outgoing" && (
            <Tooltip title="Change Access Level">
              <Button
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onSettings) {
                    onSettings(e);
                  }
                }}
                sx={{
                  color: themeColor,
                  minWidth: 0,
                  width: 42,
                  height: 36,
                  "&:hover": { backgroundColor: "rgba(20,184,166,0.12)" },
                }}
              >
                <SettingsIcon fontSize="small" />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default SharingCard;
