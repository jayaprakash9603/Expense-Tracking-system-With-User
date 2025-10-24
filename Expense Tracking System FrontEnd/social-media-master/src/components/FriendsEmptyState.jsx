import React from "react";
import NoDataPlaceholder from "./NoDataPlaceholder";
import { useTheme } from "../hooks/useTheme";

/*
  FriendsEmptyState
  Props:
    type: 'suggestions' | 'requests' | 'friends' | 'shared'
    searchActive: boolean (was user searching?)
*/
const messages = {
  suggestions: {
    base: "No friend suggestions available",
    search: "No friends found matching your search",
    sub: "Add more people or try a different search term.",
  },
  requests: {
    base: "No pending friend requests",
    search: "No requests found matching your search",
    sub: "When someone sends you a request it will show up here.",
  },
  friends: {
    base: "You don't have any friends yet",
    search: "No friends found matching your search",
    sub: "Send requests from Suggestions to start building your network.",
  },
  shared: {
    base: "No shared connections yet",
    search: "No shared connections match your search",
    sub: "Once you share or others share access, they'll appear here.",
  },
};

const FriendsEmptyState = ({ type = "suggestions", searchActive = false }) => {
  const { colors } = useTheme();
  const cfg = messages[type] || messages.suggestions;
  const message = searchActive ? cfg.search : cfg.base;
  return (
    <NoDataPlaceholder
      message={message}
      subMessage={cfg.sub}
      size={type === "shared" ? "md" : "sm"}
      fullWidth
      height={type === "friends" ? 340 : type === "shared" ? 340 : 340}
      iconSize={48}
      style={{
        background: colors.primary_bg,
        border: `1px dashed ${colors.border_color}`,
      }}
    />
  );
};

export default FriendsEmptyState;
