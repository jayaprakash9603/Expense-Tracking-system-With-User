export function formatMessageTime(timestamp) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;

  if (diff < oneDay && date.getDate() === now.getDate()) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  if (diff < oneDay * 2 && date.getDate() === now.getDate() - 1) {
    return "Yesterday";
  }

  if (diff < oneWeek) {
    return date.toLocaleDateString([], { weekday: "short" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export function formatLastSeen(timestamp) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const oneMinute = 60 * 1000;
  const oneHour = 60 * oneMinute;
  const oneDay = 24 * oneHour;

  if (diff < oneMinute) {
    return "just now";
  }

  if (diff < oneHour) {
    const minutes = Math.floor(diff / oneMinute);
    return `${minutes} min ago`;
  }

  if (diff < oneDay) {
    const hours = Math.floor(diff / oneHour);
    return `${hours}h ago`;
  }

  if (diff < oneDay * 2) {
    return `yesterday at ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  }

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatChatDate(timestamp) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const oneDay = 24 * 60 * 60 * 1000;

  if (diff < oneDay && date.getDate() === now.getDate()) {
    return "Today";
  }

  if (diff < oneDay * 2 && date.getDate() === now.getDate() - 1) {
    return "Yesterday";
  }

  return date.toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

export function groupMessagesByDate(messages) {
  if (!messages || !Array.isArray(messages)) return {};

  return messages.reduce((groups, message) => {
    const date = new Date(message.timestamp || message.createdAt);
    const dateKey = date.toDateString();

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(message);
    return groups;
  }, {});
}

export function getInitials(name) {
  if (!name) return "?";

  const parts = name.trim().split(" ");
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function getAvatarColor(userId) {
  const colors = [
    "#1abc9c",
    "#2ecc71",
    "#3498db",
    "#9b59b6",
    "#34495e",
    "#16a085",
    "#27ae60",
    "#2980b9",
    "#8e44ad",
    "#2c3e50",
    "#f1c40f",
    "#e67e22",
    "#e74c3c",
    "#95a5a6",
    "#f39c12",
    "#d35400",
    "#c0392b",
    "#7f8c8d",
  ];

  const index = userId ? Math.abs(Number(userId)) % colors.length : 0;
  return colors[index];
}

export function truncateMessage(message, maxLength = 50) {
  if (!message) return "";
  // Handle case where message is an object (e.g., ChatResponse from backend)
  const text =
    typeof message === "object"
      ? message.content || message.message || ""
      : message;
  if (!text || typeof text !== "string") return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export function isToday(timestamp) {
  const date = new Date(timestamp);
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isYesterday(timestamp) {
  const date = new Date(timestamp);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

export function sortConversationsByTime(conversations) {
  if (!conversations || !Array.isArray(conversations)) return [];

  return [...conversations].sort((a, b) => {
    const timeA = new Date(a.lastMessageTime || a.updatedAt || 0);
    const timeB = new Date(b.lastMessageTime || b.updatedAt || 0);
    return timeB - timeA;
  });
}

export function getReactionEmoji(reaction) {
  const emojiMap = {
    like: "👍",
    love: "❤️",
    laugh: "😂",
    wow: "😮",
    sad: "😢",
    angry: "😠",
    fire: "🔥",
    thumbsup: "👍",
    thumbsdown: "👎",
    heart: "❤️",
    clap: "👏",
    think: "🤔",
  };

  return emojiMap[reaction?.toLowerCase()] || reaction;
}

export const REACTION_EMOJIS = [
  { emoji: "👍", name: "like" },
  { emoji: "❤️", name: "love" },
  { emoji: "😂", name: "laugh" },
  { emoji: "😮", name: "wow" },
  { emoji: "😢", name: "sad" },
  { emoji: "😠", name: "angry" },
  { emoji: "🔥", name: "fire" },
  { emoji: "👏", name: "clap" },
];

export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
