import React, { useState, useRef, useEffect } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import {
  MoreVertical,
  Pin,
  Edit3,
  Trash2,
  Reply,
  Forward,
  Copy,
  Check,
  CheckCheck,
  X,
  Send,
  Smile,
  Paperclip,
  Search,
  PinOff,
} from "lucide-react";
import EmojiPicker from "./EmojiPicker";
import { useSelector } from "react-redux";

const ChatTabContent = ({
  chatMessages,
  chatEndRef,
  chatMessage,
  setChatMessage,
  handleSendMessage,
  formatTime,
  onEditMessage,
  onDeleteMessage,
  onPinMessage,
  onUnpinMessage,
  onReplyToMessage,
  onForwardMessage,
  onReactToMessage,
  currentUser,
  groupMembers = [],
}) => {
  // Get logged-in user from Redux auth state
  const auth = useSelector((state) => state.auth);
  const userId = auth?.user?.id;
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const scrollToBottom = () => {
    if (chatEndRef && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [localMessages, setLocalMessages] = useState([]);
  const debounceTimeout = useRef(null);
  // Search functionality states
  const [searchResults, setSearchResults] = useState([]);
  const [currentSearchIndex, setCurrentSearchIndex] = useState(-1);
  const [highlightedMessageId, setHighlightedMessageId] = useState(null);

  // Track if chat is scrolled above 500px from bottom
  const [isScrolledAboveThreshold, setIsScrolledAboveThreshold] =
    useState(false);

  // Refs
  const contextMenuRef = useRef(null);
  const editInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const messageRefs = useRef({});
  const inputRef = useRef(null);

  // Handler to check scroll position
  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    setIsScrolledAboveThreshold(scrollHeight - scrollTop - clientHeight > 1000);
  };

  // When messages change, scroll to bottom if user is at bottom
  useEffect(() => {
    if (!isScrolledAboveThreshold) {
      scrollToBottom();
    }
  }, [chatMessages]);

  // Get pinned messages
  useEffect(() => {
    const pinned = chatMessages.filter((msg) => msg.isPinned);
    setPinnedMessages(pinned);
  }, [chatMessages]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim()) {
      const results = chatMessages
        .map((message, index) => ({ message, index }))
        .filter(({ message }) =>
          message.content.toLowerCase().includes(searchTerm.toLowerCase())
        );
      setSearchResults(results);
      setCurrentSearchIndex(results.length > 0 ? 0 : -1);
      setHighlightedMessageId(
        results.length > 0 ? results[0].message.id : null
      );
    } else {
      setSearchResults([]);
      setCurrentSearchIndex(-1);
      setHighlightedMessageId(null);
    }
  }, [searchTerm, chatMessages]);

  // Scroll to highlighted message
  useEffect(() => {
    if (highlightedMessageId && messageRefs.current[highlightedMessageId]) {
      const messageElement = messageRefs.current[highlightedMessageId];
      messageElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [highlightedMessageId]);

  // Close context menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(event.target)
      ) {
        setContextMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingMessage && editInputRef.current) {
      editInputRef.current.focus();
    }
  }, [editingMessage]);

  // Search navigation functions
  const navigateSearchResults = (direction) => {
    if (searchResults.length === 0) return;

    let newIndex;
    if (direction === "up") {
      newIndex =
        currentSearchIndex > 0
          ? currentSearchIndex - 1
          : searchResults.length - 1;
    } else {
      newIndex =
        currentSearchIndex < searchResults.length - 1
          ? currentSearchIndex + 1
          : 0;
    }

    setCurrentSearchIndex(newIndex);
    setHighlightedMessageId(searchResults[newIndex].message.id);
  };

  // Close search
  const closeSearch = () => {
    setShowSearch(false);
    setSearchTerm("");
    setSearchResults([]);
    setCurrentSearchIndex(-1);
    setHighlightedMessageId(null);
  };

  // Emoji picker functions
  const handleEmojiSelect = (emoji) => {
    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      const newValue =
        chatMessage.slice(0, start) + emoji + chatMessage.slice(end);
      setChatMessage(newValue);

      // Set cursor position after emoji
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(start + emoji.length, start + emoji.length);
      }, 0);
    } else {
      setChatMessage((prev) => prev + emoji);
    }
  };

  // Close emoji picker
  const handleCloseEmojiPicker = () => {
    setShowEmojiPicker(false);
  };

  // Highlight text function
  const highlightText = (text, searchTerm) => {
    if (!searchTerm.trim()) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <span
            key={index}
            className="bg-yellow-400 text-black px-1 rounded font-semibold"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      message,
    });
  };

  const handleLongPress = (message) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedMessages(new Set([message.id]));
    }
  };

  const handleMessageSelect = (messageId) => {
    if (isSelectionMode) {
      const newSelected = new Set(selectedMessages);
      if (newSelected.has(messageId)) {
        newSelected.delete(messageId);
      } else {
        newSelected.add(messageId);
      }
      setSelectedMessages(newSelected);

      if (newSelected.size === 0) {
        setIsSelectionMode(false);
      }
    }
  };

  const handleEditSubmit = (messageId, newContent) => {
    if (editingMessage && editingMessage.content !== newContent) {
      onEditMessage(messageId, newContent);
    }
    setEditingMessage(null);
    setChatMessage("");
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setContextMenu(null);
  };

  const getMessageStatus = (message) => {
    if (message.senderId !== userId) return null;

    if (message.isReadByCurrentUser) {
      return <CheckCheck className="w-4 h-4 text-blue-400" />;
    } else if (message.isDeliveredByCurrentUser) {
      return <CheckCheck className="w-4 h-4 text-gray-400" />;
    } else {
      return <Check className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMessageBgClass = (message) => {
    // Highlight searched message
    if (highlightedMessageId === message.id) {
      return message.senderId === userId
        ? "bg-[rgba(156,163,175,0.3)] text-white border-2 border-yellow-400"
        : "bg-[rgba(156,163,175,0.3)] text-white border-2 border-yellow-400";
    }

    if (selectedMessages.has(message.id)) {
      return message.senderId === userId
        ? "bg-[rgba(11,11,11,0.25)] text-white" // Even more transparent for logged-in user
        : "bg-[#0b0b0b] text-white";
    }

    if (message.senderId === userId)
      return "bg-[rgba(11,11,11,0.25)] text-white"; // Even more transparent for logged-in user
    return "bg-[#0b0b0b] text-white";
  };

  const getSenderName = (message) => {
    if (message.username && message.username.trim()) {
      return message.username;
    } else if (message.firstName && message.lastName) {
      return `${message.firstName} ${message.lastName}`;
    } else if (message.firstName) {
      return message.firstName;
    } else if (message.lastName) {
      return message.lastName;
    } else if (message.email) {
      return message.email.split("@")[0];
    }
    return "Unknown User";
  };

  const getSenderNameColor = (senderId) => {
    const colors = [
      "text-red-400",
      "text-blue-400",
      "text-green-400",
      "text-yellow-400",
      "text-purple-400",
      "text-pink-400",
      "text-indigo-400",
      "text-orange-400",
      "text-cyan-400",
      "text-lime-400",
      "text-rose-400",
      "text-emerald-400",
    ];
    const index = senderId
      ? senderId.toString().charCodeAt(0) % colors.length
      : 0;
    return colors[index];
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setChatMessage(val);
    if (editingMessage) setEditText(val);
  };
  // Auto-resize textarea
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "auto";

      const newHeight = Math.min(textarea.scrollHeight, 144);

      textarea.style.height = `${Math.max(newHeight, 48)}px`;
    }
  }, [chatMessage]);

  const getAvatarInitials = (message) => {
    if (message.username && message.username.trim()) {
      return message.username.substring(0, 2).toUpperCase();
    } else if (message.firstName && message.lastName) {
      return `${message.firstName[0]}${message.lastName[0]}`.toUpperCase();
    } else if (message.firstName) {
      return message.firstName.substring(0, 2).toUpperCase();
    } else if (message.email) {
      return message.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  const getAvatarColor = (senderId) => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-orange-500",
    ];
    const index = senderId
      ? senderId.toString().charCodeAt(0) % colors.length
      : 0;
    return colors[index];
  };

  const shouldShowSenderName = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;
    if (currentMessage.senderId !== previousMessage.senderId) return true;

    const currentTime = new Date(currentMessage.timestamp);
    const previousTime = new Date(previousMessage.timestamp);
    const timeDiff = Math.abs(currentTime - previousTime) / (1000 * 60);

    return timeDiff > 10;
  };

  const shouldShowAvatar = (currentMessage, nextMessage) => {
    if (!nextMessage) return true;
    if (currentMessage.senderId !== nextMessage.senderId) return true;

    const currentTime = new Date(currentMessage.timestamp);
    const nextTime = new Date(nextMessage.timestamp);
    const timeDiff = Math.abs(nextTime - currentTime) / (1000 * 60);

    return timeDiff > 5;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
  };

  const shouldShowDateSeparator = (currentMessage, previousMessage) => {
    if (!previousMessage) return true;

    const currentDate = new Date(currentMessage.timestamp).toDateString();
    const previousDate = new Date(previousMessage.timestamp).toDateString();

    return currentDate !== previousDate;
  };

  const ContextMenu = ({ x, y, message }) => (
    <div
      ref={contextMenuRef}
      className="fixed bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-50 py-2 min-w-48"
      style={{ left: x, top: y }}
    >
      <button
        onClick={() => handleReply(message)}
        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
      >
        <Reply className="w-4 h-4" />
        Reply
      </button>

      {message.senderId === userId && (
        <>
          <button
            onClick={() => {
              setEditingMessage(message);
              setEditText(message.content);
              setChatMessage(message.content);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={() => {
              onDeleteMessage(message.id);
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </>
      )}

      <button
        onClick={() => {
          message.isPinned
            ? onUnpinMessage(message.id)
            : onPinMessage(message.id);
          setContextMenu(null);
        }}
        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
      >
        {message.isPinned ? (
          <PinOff className="w-4 h-4" />
        ) : (
          <Pin className="w-4 h-4" />
        )}
        {message.isPinned ? "Unpin" : "Pin"}
      </button>

      <button
        onClick={() => {
          onForwardMessage(message);
          setContextMenu(null);
        }}
        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
      >
        <Forward className="w-4 h-4" />
        Forward
      </button>

      <button
        onClick={() => {
          navigator.clipboard.writeText(message.content);
          setContextMenu(null);
        }}
        className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 flex items-center gap-2"
      >
        <Copy className="w-4 h-4" />
        Copy
      </button>
    </div>
  );

  const DateSeparator = ({ date }) => (
    <div className="flex items-center justify-center my-4">
      <div className="bg-gray-600 text-gray-200 px-3 py-1 rounded-full text-xs font-medium shadow-sm">
        {formatDate(date)}
      </div>
    </div>
  );

  // Track shownChars for each message in parent state
  const [shownCharsMap, setShownCharsMap] = useState({});

  // Helper to get shownChars for a message
  const getShownChars = (id, content) => {
    return shownCharsMap[id] || Math.min(2000, (content || "").length);
  };

  // Handler to show more for a message
  const handleShowMore = (id, content) => {
    setShownCharsMap((prev) => ({
      ...prev,
      [id]: Math.min((prev[id] || 2000) + 2000, (content || "").length),
    }));
  };

  // Reset shownChars for new messages
  useEffect(() => {
    setShownCharsMap((prev) => {
      const newMap = { ...prev };
      chatMessages.forEach((msg) => {
        if (!(msg.id in newMap)) {
          newMap[msg.id] = Math.min(2000, (msg.content || "").length);
        }
      });
      return newMap;
    });
  }, [chatMessages]);

  // Jump to a message by id and briefly highlight it
  const jumpToMessageById = (targetId) => {
    const el = messageRefs.current[targetId];
    if (el && el.scrollIntoView) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(targetId);
      setTimeout(() => setHighlightedMessageId(null), 3000);
    }
  };

  const MessageComponent = ({
    message,
    showAvatar,
    showSenderName,
    previousMessage,
  }) => {
    // Use Redux auth state userId for right-side display
    const isOwn = message.senderId === userId;
    const isEditing = editingMessage?.id === message.id;
    const senderImage = message.image ? message.image : null;
    const messageContent = message.content || "";
    const isLong = messageContent.length > 2000;
    const shownChars = getShownChars(message.id, messageContent);

    // Increase bubble width for edited/forwarded messages or very short (single-letter) messages
    const bubbleMinWidth =
      message.isEdited ||
      message.isForwarded ||
      (messageContent || "").length <= 1
        ? 150
        : 120;
    const bubbleStyle = {
      maxWidth: "420px",
      minWidth: `${bubbleMinWidth}px`,
      paddingRight: "72px",
      boxSizing: "border-box",
    };

    return (
      <div
        ref={(el) => {
          if (el) messageRefs.current[message.id] = el;
        }}
        className={`flex ${
          isOwn ? "justify-end" : "justify-start"
        } group mb-[7px] transition-all duration-300 ${
          highlightedMessageId === message.id ? "transform scale-[1.02]" : ""
        }`}
        onContextMenu={(e) => handleContextMenu(e, message)}
      >
        <div
          className={`flex ${
            isOwn ? "flex-row-reverse" : "flex-row"
          } items-end max-w-[80%] gap-2`}
        >
          {/* Avatar */}
          {!isOwn && (
            <div className="flex-shrink-0 w-8 h-8">
              {showAvatar ? (
                senderImage ? (
                  <img
                    src={senderImage}
                    alt="avatar"
                    className="w-8 h-8 rounded-full object-cover border border-gray-600"
                  />
                ) : (
                  <div
                    className={`w-8 h-8 rounded-full ${getAvatarColor(
                      message.senderId
                    )} flex items-center justify-center text-white text-xs font-semibold border border-gray-600`}
                  >
                    {getAvatarInitials(message)}
                  </div>
                )
              ) : (
                <div className="w-8 h-8"></div>
              )}
            </div>
          )}

          {/* Message Container */}
          <div className="flex flex-col">
            {/* Pin indicator */}
            {message.isPinned && (
              <div
                className={`flex items-center gap-1 text-xs text-yellow-400 mb-1 ${
                  isOwn ? "justify-end" : "justify-start"
                }`}
              >
                <Pin className="w-3 h-3" />
                <span>Pinned</span>
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`relative px-3 py-2 rounded-2xl ${getMessageBgClass(
                message
              )} ${isSelectionMode ? "cursor-pointer" : ""} ${
                isOwn
                  ? "rounded-br-md"
                  : showAvatar
                  ? "rounded-bl-md"
                  : "rounded-bl-2xl"
              } shadow-sm transition-all duration-300`}
              onClick={() => isSelectionMode && handleMessageSelect(message.id)}
              onTouchStart={() => {
                const timer = setTimeout(() => handleLongPress(message), 500);
                const cleanup = () => clearTimeout(timer);
                document.addEventListener("touchend", cleanup, { once: true });
                const handleSearchIconClick = () => {
                  setShowSearch((prev) => {
                    if (prev) {
                      setSearchText(""); // Clear search text when closing search box
                      setSearchTerm(""); // Also clear search term
                    }
                    return !prev;
                  });
                };
                document.addEventListener("touchmove", cleanup, { once: true });
              }}
              style={bubbleStyle}
            >
              {/* Sender name inside message bubble */}
              {!isOwn && showSenderName && (
                <p
                  className={`text-xs font-bold mb-1 ${getSenderNameColor(
                    message.senderId
                  )}`}
                >
                  {getSenderName(message)}
                </p>
              )}

              {/* Reply indicator: show a small preview of the replied-to message and jump to it on click */}
              {message.replyToMessageId &&
                (() => {
                  const repliedMessage = chatMessages.find(
                    (m) => m.id === message.replyToMessageId
                  );
                  if (!repliedMessage) return null;

                  const previewText =
                    (repliedMessage.content || "").length > 120
                      ? (repliedMessage.content || "").slice(0, 120) + "..."
                      : repliedMessage.content || "";

                  const handleJumpToReplied = (e) => {
                    e.stopPropagation();
                    const el = messageRefs.current[repliedMessage.id];
                    if (el && el.scrollIntoView) {
                      el.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                      });
                      setHighlightedMessageId(repliedMessage.id);
                      // remove highlight after a short delay
                      setTimeout(() => setHighlightedMessageId(null), 3000);
                    }
                  };

                  return (
                    <div
                      onClick={handleJumpToReplied}
                      className="bg-gray-600 bg-opacity-50 p-2 rounded-lg border-l-4 border-teal-400 mb-2 cursor-pointer"
                      title={previewText}
                      style={{ maxHeight: "64px", overflow: "hidden" }}
                    >
                      <p className="text-xs text-gray-300 font-medium">
                        {repliedMessage.senderId === userId
                          ? "You"
                          : getSenderName(repliedMessage)}
                      </p>
                      <p className="text-sm text-gray-200 truncate">
                        {previewText}
                      </p>
                    </div>
                  );
                })()}

              {/* Message content with show more logic */}
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs">Editing...</span>
                  <button
                    onClick={() => setEditingMessage(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  {/* Jump-to-replied-message chevron */}
                  {message.replyToMessageId && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        jumpToMessageById(message.replyToMessageId);
                      }}
                      title="Jump to replied message"
                      className="absolute left-2 top-2 p-1 rounded-full hover:bg-gray-600"
                      style={{ lineHeight: 0 }}
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M7 17l7-5-7-5v10z"
                          fill="currentColor"
                          opacity="0.85"
                        />
                      </svg>
                    </button>
                  )}
                  <p className="break-words text-sm leading-relaxed">
                    {searchTerm
                      ? highlightText(
                          messageContent.substring(0, shownChars),
                          searchTerm
                        )
                      : messageContent.substring(0, shownChars)}
                  </p>
                  {isLong && shownChars < messageContent.length && (
                    <button
                      onClick={() => handleShowMore(message.id, messageContent)}
                      className="text-xs text-teal-400 mt-1 underline hover:text-teal-300"
                    >
                      Show more
                    </button>
                  )}
                </>
              )}

              {/* Timestamp & status: show inside bubble, right-aligned and slightly lower */}
              <div
                style={{
                  position: "absolute",
                  right: "10px",
                  bottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={
                  (message.isEdited ? "edited " : "") +
                  (message.isForwarded ? "forwarded " : "") +
                  formatTime(message.timestamp)
                }
              >
                {/* Place edited/forwarded labels before the time so timezone doesn't overlap */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    color: "#c0c0c0",
                    fontSize: "11px",
                    opacity: 0.8,
                  }}
                >
                  {message.isEdited && (
                    <span className="text-[11px] opacity-60">edited</span>
                  )}
                  {message.isForwarded && (
                    <span className="text-[11px] opacity-60">forwarded</span>
                  )}
                </div>

                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#c0c0c0",
                    lineHeight: 1,
                    display: "inline-block",
                    minWidth: 0,
                    textAlign: "right",
                  }}
                >
                  {formatTime(message.timestamp)}
                </span>

                {isOwn && (
                  <span
                    style={{ display: "inline-flex", alignItems: "center" }}
                  >
                    {getMessageStatus(message)}
                  </span>
                )}
              </div>

              {/* Message options */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleContextMenu(e, message);
                }}
                className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 bg-gray-600 hover:bg-gray-500 rounded-full shadow-lg"
              >
                <MoreVertical className="w-3 h-3 text-white" />
              </button>

              {/* Reactions */}
              {Object.keys(message.reactions || {}).length > 0 && (
                <div className="flex gap-1 mt-2">
                  {Object.entries(message.reactions).map(([emoji, users]) => (
                    <button
                      key={emoji}
                      onClick={() => onReactToMessage(message.id, emoji)}
                      className="bg-gray-600 px-2 py-1 rounded-full text-xs flex items-center gap-1 hover:bg-gray-500"
                    >
                      <span>{emoji}</span>
                      <span>{users.length}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      style={{ background: "#1b1b1b", height: "560px" }}
      className="rounded-xl flex flex-col relative"
    >
      {/* Chat Header */}
      <div className="p-3 border-b border-gray-700 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Group Chat</h3>
            {pinnedMessages.length > 0 && (
              <p className="text-xs text-gray-400">
                {pinnedMessages.length} pinned message
                {pinnedMessages.length > 1 ? "s" : ""}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Enhanced Search Bar */}
            {showSearch && (
              <div
                className="absolute right-12 flex items-center bg-gray-700 rounded-lg border border-gray-600 overflow-hidden"
                style={{ zIndex: 10 }}
              >
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 bg-transparent text-white px-3 py-2 border-none outline-none text-sm"
                  autoFocus
                />

                {/* Search Results Counter */}
                {searchResults.length > 0 && (
                  <div className="flex items-center px-2 border-l border-gray-600">
                    <span className="text-xs text-gray-300 mr-2">
                      {currentSearchIndex + 1}/{searchResults.length}
                    </span>

                    {/* Navigation Arrows - Side by Side */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => navigateSearchResults("up")}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                        disabled={searchResults.length === 0}
                        title="Previous result"
                      >
                        <ChevronUp className="w-3 h-3 text-gray-300" />
                      </button>
                      <button
                        onClick={() => navigateSearchResults("down")}
                        className="p-1 hover:bg-gray-600 rounded transition-colors"
                        disabled={searchResults.length === 0}
                        title="Next result"
                      >
                        <ChevronDown className="w-3 h-3 text-gray-300" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Close Search Button */}
                <button
                  onClick={closeSearch}
                  className="p-2 hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              style={{ zIndex: 11 }}
            >
              <Search className="w-5 h-5 text-gray-400" />
            </button>
            {isSelectionMode && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">
                  {selectedMessages.size} selected
                </span>
                <button
                  onClick={() => {
                    setIsSelectionMode(false);
                    setSelectedMessages(new Set());
                  }}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pinned Messages */}
      {pinnedMessages.length > 0 && (
        <div className="bg-gray-800 border-b border-gray-700 p-2 max-h-20 overflow-y-auto">
          <div className="flex items-center gap-2 text-yellow-400 text-xs mb-1">
            <Pin className="w-3 h-3" />
            <span>Pinned Messages</span>
          </div>
          {pinnedMessages.slice(0, 2).map((msg) => (
            <div key={msg.id} className="text-xs text-gray-300 truncate">
              {getSenderName(msg)}: {msg.content}
            </div>
          ))}
        </div>
      )}

      {/* Chat Messages */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-2 relative"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#14b8a6 #2a2a2a" }}
        onScroll={handleScroll}
      >
        {chatMessages
          .filter((message) => message.content && message.content.trim())
          .map((message, index, filteredMessages) => {
            const previousMessage =
              index > 0 ? filteredMessages[index - 1] : null;
            const nextMessage =
              index < filteredMessages.length - 1
                ? filteredMessages[index + 1]
                : null;
            const showDateSeparator = shouldShowDateSeparator(
              message,
              previousMessage
            );
            const showAvatar = shouldShowAvatar(message, nextMessage);
            const showSenderName = shouldShowSenderName(
              message,
              previousMessage
            );

            return (
              <React.Fragment key={message.id}>
                {showDateSeparator && (
                  <DateSeparator date={message.timestamp} />
                )}
                <MessageComponent
                  message={message}
                  showAvatar={showAvatar}
                  showSenderName={showSenderName}
                  previousMessage={previousMessage}
                  isLast={index === filteredMessages.length - 1}
                />
              </React.Fragment>
            );
          })}
        <div ref={chatEndRef} />

        {/* Scroll to bottom arrow */}
        {isScrolledAboveThreshold && !replyingTo && (
          <button
            onClick={() => {
              scrollToBottom();
              setIsScrolledAboveThreshold(false);
            }}
            className="fixed text-white p-2 rounded-full shadow-lg z-50"
            style={{
              background: "#0b0b0b",
              color: "#fff",
              bottom: "180px",
              right: "60px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "fixed",
              border: "1px solid #333",
            }}
            aria-label="Scroll to bottom"
          >
            <ArrowDown className="w-6 h-6" style={{ color: "#fff" }} />
          </button>
        )}
      </div>

      {/* Reply Preview */}
      {replyingTo && (
        <div className="flex justify-end mb-2">
          <div
            className="relative rounded-2xl shadow-md flex flex-col items-stretch"
            style={{
              marginRight: "8px",
              background: "#0b0b0b",
              minWidth: "220px",
              maxWidth: "360px",
              minHeight: "64px",
              maxHeight: "140px",
              overflow: "hidden",
              scrollbarWidth: "thin",
              scrollbarColor: "#888 #222",
            }}
          >
            {/* Header for replying person */}
            <div
              style={{
                background: "#222",
                padding: "8px 16px 6px 16px",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
                fontWeight: "bold",
                color: "#14b8a6",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                minHeight: "32px",
                maxWidth: "100%",
              }}
            >
              <span>
                Replying to{" "}
                {replyingTo.senderId === userId
                  ? "you"
                  : getSenderName(replyingTo)}
              </span>
              <button
                onClick={() => setReplyingTo(null)}
                className="ml-2 p-0.5 text-gray-400 hover:text-white focus:outline-none"
                style={{
                  lineHeight: 0,
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                aria-label="Cancel reply"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M6 6L14 14M14 6L6 14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
            {/* Content area for reply message */}
            <div
              className="px-4 py-2 text-xs text-gray-100"
              style={{
                maxHeight: "76px",
                overflowY: "auto",
                wordBreak: "break-word",
              }}
            >
              <span>{replyingTo.content}</span>
            </div>
          </div>
        </div>
      )}

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <div className="flex flex-col space-y-2">
          {editingMessage && (
            <div className="flex justify-end mb-2">
              <div
                className="relative rounded-2xl px-4 py-3 text-xs text-gray-200 shadow-md flex items-start"
                style={{
                  marginRight: "8px",
                  background: "#0b0b0b",
                  minWidth: "180px",
                  maxWidth: "320px",
                  minHeight: "40px",
                  maxHeight: "80px",
                  alignItems: "center",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#888 #222",
                }}
              >
                <button
                  onClick={() => setEditingMessage(null)}
                  className="absolute top-2 right-2 p-0.5 text-gray-400 hover:text-white focus:outline-none"
                  style={{
                    lineHeight: 0,
                    width: "18px",
                    height: "18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-label="Cancel editing"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6 6L14 14M14 6L6 14"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
                <span
                  className="break-words text-gray-100 w-full pr-5"
                  style={{ wordBreak: "break-word" }}
                >
                  {editingMessage.content}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
              <Paperclip className="w-5 h-5 text-gray-400" />
            </button>

            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={chatMessage}
                onChange={handleInputChange}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (editingMessage) {
                      handleEditSubmit(editingMessage.id, chatMessage);
                    } else {
                      handleSendMessage(replyingTo?.id);
                      setReplyingTo(null);
                    }
                  }
                }}
                placeholder={
                  editingMessage ? "Edit your message..." : "Type a message..."
                }
                className="w-full bg-gray-700 text-white px-4 py-3 rounded-lg border-none outline-none resize-none overflow-y-auto"
                style={{
                  minHeight: "48px",
                  maxHeight: "144px", // 6 lines * 24px line height
                  lineHeight: "24px",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#14b8a6 #2a2a2a",
                }}
                maxLength={30000}
                rows={1}
              />

              {/* Emoji Picker Component */}
              <EmojiPicker
                isVisible={showEmojiPicker}
                onEmojiSelect={handleEmojiSelect}
                onClose={handleCloseEmojiPicker}
                position="bottom-full"
                className="mb-2"
              />
            </div>

            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="emoji-trigger p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Smile className="w-5 h-5 text-gray-400" />
            </button>

            {editingMessage ? (
              <button
                onClick={() => {
                  handleEditSubmit(editingMessage.id, chatMessage);
                }}
                disabled={!chatMessage.trim()}
                className="bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 13l4 4L19 7"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            ) : (
              <button
                onClick={() => {
                  handleSendMessage(replyingTo?.id);
                  setReplyingTo(null);
                }}
                disabled={!chatMessage.trim()}
                className="bg-teal-500 text-white p-3 rounded-lg hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          message={contextMenu.message}
        />
      )}

      {/* Selection Mode Actions */}
      {isSelectionMode && selectedMessages.size > 0 && (
        <div className="absolute bottom-20 left-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-3 flex items-center justify-between">
          <span className="text-white text-sm">
            {selectedMessages.size} message
            {selectedMessages.size > 1 ? "s" : ""} selected
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => {
                selectedMessages.forEach((id) => onDeleteMessage(id));
                setIsSelectionMode(false);
                setSelectedMessages(new Set());
              }}
              className="p-2 bg-red-600 hover:bg-red-700 rounded-lg"
            >
              <Trash2 className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={() => {
                setIsSelectionMode(false);
                setSelectedMessages(new Set());
              }}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              <Forward className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatTabContent;
