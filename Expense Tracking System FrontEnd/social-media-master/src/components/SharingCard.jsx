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

  // Direction-based accent colors (no gradients)
  const incomingColor = "#14b8a6"; // teal brand
  const outgoingColor = "#e6a935"; // warm amber for contrast
  const accent = direction === "incoming" ? incomingColor : outgoingColor;
  const subtleBg = direction === "incoming" ? "#1f2e2d" : "#2e2819"; // very subtle tinted bg
  const baseBg = "#2a2a2a"; // keep consistent card base
  const hoverBg = "#333333";

  // Combine subtle tint behind avatar area while keeping base background

  return (
    <div
      onClick={onSelect}
      className={`flex items-start p-4 gap-4 rounded-lg cursor-pointer transition-colors ${
        selected ? "ring-2" : "ring-0"
      }`}
      style={{
        backgroundColor: baseBg,
        borderLeft: `4px solid ${accent}`,
        boxShadow: selected
          ? `0 0 0 1px ${accent} inset, 0 0 0 2px rgba(0,0,0,0.4)`
          : "0 0 0 1px #202020 inset",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = hoverBg)}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = baseBg)}
    >
      <div className="relative">
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold"
          style={{
            backgroundColor: getAvatarColor(user.userId),
            boxShadow: `0 0 0 2px ${accent}22`,
          }}
        >
          {getInitials(user.name.split(" ")[0], user.name.split(" ")[1] || "")}
        </div>
        <span
          className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold text-black shadow"
          style={{ backgroundColor: accent }}
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
          <span
            className="text-[10px] tracking-wide px-2 py-1 rounded-full border"
            style={{
              backgroundColor: `${accent}20`,
              color: accent,
              borderColor: `${accent}55`,
            }}
          >
            {user.accessLevel || "NONE"}
          </span>
        </div>
        <p className="text-xs text-gray-400 truncate mb-1">{user.email}</p>
        <div className="flex items-center text-[11px] text-gray-300 gap-1">
          {getAccessLevelIcon(user.accessLevel)}
          <span style={{ color: accent }}>
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
                color: accent,
                borderColor: accent,
                minWidth: 0,
                width: 42,
                height: 36,
                "&:hover": {
                  borderColor: accent,
                  backgroundColor: `${accent}1f`,
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
                color: accent,
                minWidth: 0,
                width: 42,
                height: 36,
                "&:hover": { backgroundColor: `${accent}1f` },
              }}
            >
              <SettingsIcon fontSize="small" />
            </Button>
          </Tooltip>
        )}
      </div>
    </div>
  );
};

export default SharingCard;
