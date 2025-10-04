import React, { useState, useEffect } from "react";
import avatarCategories from "./AvatarCategories";
import { useNavigate } from "react-router-dom";
import {
  Tabs,
  Tab,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriends } from "../../Redux/Friends/friendsActions";
import { createGroup } from "../../Redux/Groups/groupsActions";

const CreateGroup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const friends = useSelector((state) => state.friends.friends);
  const loadingFriends = useSelector((state) => state.friends.loadingFriends);
  const friendsError = useSelector((state) => state.friends.friendsError);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    createdBy: 1, // This should come from auth context
    memberIds: [1], // Always include creator
    memberRoles: { 1: "ADMIN" }, // Creator is always admin
    avatar: "👥",
  });
  const [selectedMembers, setSelectedMembers] = useState(new Set([1])); // Creator pre-selected
  const [searchQuery, setSearchQuery] = useState("");
  const [popoverSearchQuery, setPopoverSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSelectedDetails, setShowSelectedDetails] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [avatarTabValue, setAvatarTabValue] = useState(0);
  const [avatarPage, setAvatarPage] = useState(0);

  // Available roles
  const availableRoles = [
    {
      value: "ADMIN",
      label: "Admin",
      description: "Full access to manage group",
    },
    {
      value: "MODERATOR",
      label: "Moderator",
      description: "Can manage members and expenses",
    },
    {
      value: "MEMBER",
      label: "Member",
      description: "Can view and add expenses",
    },
    {
      value: "VIEWER",
      label: "Viewer",
      description: "Can only view group content",
    },
  ];

  // Fetch friends from API on mount
  useEffect(() => {
    dispatch(fetchFriends());
  }, [dispatch]);

  // Helper functions
  const getFriendDisplayName = (friendship) => {
    const friend =
      friendship.recipient.id === 1
        ? friendship.requester
        : friendship.recipient;
    if (friend.firstName && friend.lastName)
      return `${friend.firstName} ${friend.lastName}`;
    if (friend.username) return friend.username;
    return friend.email;
  };

  const getFriendEmail = (friendship) => {
    const friend =
      friendship.recipient.id === 1
        ? friendship.requester
        : friendship.recipient;
    return friend.email;
  };

  // Removed unused getFriendImage function

  const getFriendId = (friendship) => {
    const friend =
      friendship.recipient.id === 1
        ? friendship.requester
        : friendship.recipient;
    return friend.id;
  };

  // Get selected friends details (excluding creator)
  const selectedFriendsDetails = Array.from(selectedMembers)
    .filter((id) => id !== 1)
    .map((memberId) => {
      const friendship = friends.find((f) => getFriendId(f) === memberId);
      if (!friendship) return null;
      const displayName = getFriendDisplayName(friendship);
      const email = getFriendEmail(friendship);
      return {
        id: memberId,
        displayName,
        email,
        role: formData.memberRoles[memberId] || "MEMBER",
      };
    })
    .filter(Boolean);

  // Filter friends based on search query
  const filteredFriends = friends.filter((friendship) => {
    const displayName = getFriendDisplayName(friendship).toLowerCase();
    const email = getFriendEmail(friendship).toLowerCase();
    return (
      displayName.includes(searchQuery.toLowerCase()) ||
      email.includes(searchQuery.toLowerCase())
    );
  });

  // Handle member selection
  const handleMemberToggle = (friendshipData) => {
    const friendId = getFriendId(friendshipData);
    const newSelectedMembers = new Set(selectedMembers);
    const newMemberRoles = { ...formData.memberRoles };

    if (selectedMembers.has(friendId)) {
      newSelectedMembers.delete(friendId);
      delete newMemberRoles[friendId];
    } else {
      newSelectedMembers.add(friendId);
      newMemberRoles[friendId] = "MEMBER";
    }

    setSelectedMembers(newSelectedMembers);
    setFormData((prev) => ({
      ...prev,
      memberIds: Array.from(newSelectedMembers),
      memberRoles: newMemberRoles,
    }));
  };

  // Handle role change for a member
  const handleRoleChange = (memberId, newRole) => {
    setFormData((prev) => ({
      ...prev,
      memberRoles: { ...prev.memberRoles, [memberId]: newRole },
    }));
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Handle avatar selection
  const handleAvatarSelect = (avatar) => {
    setFormData((prev) => ({ ...prev, avatar }));
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setAvatarTabValue(newValue);
    setAvatarPage(0); // Reset page when changing category
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Group name must be at least 3 characters";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Group description is required";
    } else if (formData.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }
    if (formData.memberIds.length < 1) {
      newErrors.members =
        "Please select at least one friend to add to the group";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Prepare DTO for backend
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        createdBy: formData.createdBy,
        memberIds: formData.memberIds,
        memberRoles: formData.memberRoles,
        avatar: formData.avatar,
      };
      const result = await dispatch(createGroup(requestData));
      if (result.success) {
        navigate("/groups");
      } else {
        setErrors({
          submit: result.error || "Failed to create group. Please try again.",
        });
      }
    } catch (error) {
      setErrors({ submit: "Failed to create group. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Get current category avatars
  const categoryNames = Object.keys(avatarCategories);
  const currentCategoryAvatars =
    avatarCategories[categoryNames[avatarTabValue]] || [];

  // Pagination logic for avatars
  const AVATARS_PER_PAGE = 40; // Remove one row (8 emojis) for a more compact grid
  const totalAvatarPages = Math.ceil(
    currentCategoryAvatars.length / AVATARS_PER_PAGE
  );
  const pagedAvatars = currentCategoryAvatars.slice(
    avatarPage * AVATARS_PER_PAGE,
    (avatarPage + 1) * AVATARS_PER_PAGE
  );
  // Create rows for table display (5 avatars per row)
  const createAvatarRows = (avatars) => {
    const rows = [];
    for (let i = 0; i < avatars.length; i += 5) {
      rows.push(avatars.slice(i, i + 5));
    }
    return rows;
  };
  const avatarRows = createAvatarRows(pagedAvatars);

  return (
    <div
      className="shadow-2xl rounded-2xl flex flex-col relative"
      style={{
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        // marginTop: "50px",
        marginRight: "20px",
        backgroundColor: "#0b0b0b",
      }}
    >
      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #2a2a2a;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #14b8a6;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #0f9488;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #14b8a6 #2a2a2a;
        }
      `}</style>

      {/* Compact Header - Reduced Height */}
      <div className="px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Group</h1>
          </div>
          <button
            onClick={() => navigate("/groups")}
            className="text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
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
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="flex-1 overflow-hidden">
        <form onSubmit={handleSubmit} className="h-full flex">
          {/* Left Column - Group Info */}
          <div className="w-1/2 p-4 border-r border-gray-700 overflow-y-auto custom-scrollbar">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-white">
                Group Information
              </h2>

              {/* Group Name and Description */}
              <div className="space-y-3">
                {/* Group Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Group Name *
                  </label>
                  <TextField
                    fullWidth
                    variant="outlined"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter category name"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <span
                            style={{ fontSize: "1.5rem", color: "#14b8a6" }}
                          >
                            {formData.avatar}
                          </span>
                        </InputAdornment>
                      ),
                      style: {
                        backgroundColor: "#1a1a1a",
                        color: "#fff",
                        borderRadius: "8px",
                        fontSize: "1rem",
                      },
                    }}
                    inputProps={{
                      style: {
                        paddingLeft: 0,
                        color: "#fff",
                      },
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        "& fieldset": {
                          borderColor: "#14b8a6",
                        },
                        "&:hover fieldset": {
                          borderColor: "#14b8a6",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#14b8a6",
                        },
                      },
                      input: {
                        color: "#fff",
                      },
                    }}
                    error={!!errors.name}
                    helperText={errors.name}
                  />
                </div>

                {/* Group Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-3 py-2 rounded-lg text-white placeholder-gray-400 text-sm resize-none"
                    placeholder="Describe what this group is for..."
                    style={{
                      backgroundColor: "#2a2a2a",
                      outline: "none",
                      border: errors.description
                        ? "1px solid #ef4444"
                        : "1px solid transparent",
                    }}
                  />
                  {errors.description && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Avatar Selection with Tabs */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Choose Avatar
                </label>

                {/* Category Tabs - Default MUI Tabs/Tab */}
                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
                  <Tabs
                    value={avatarTabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="inherit"
                    indicatorColor="primary"
                    sx={{
                      "& .MuiTabs-scrollButtons": {
                        color: "#14b8a6",
                        opacity: 1,
                      },
                      "& .MuiTab-root": {
                        color: "#fff", // Unselected tab text color
                        fontWeight: 600,
                        fontSize: "1rem",
                        textTransform: "none",
                        backgroundColor: "#0b0b0b", // Black background
                        borderRadius: "8px 8px 0 0",
                        mx: 0.5,
                        transition:
                          "color 0.2s, background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "flex",
                        alignItems: "center",
                        minHeight: "44px",
                        height: "44px",
                        lineHeight: "1.2",
                        paddingTop: "0px",
                        paddingBottom: "0px",
                      },
                      "& .Mui-selected": {
                        color: "#14b8a6", // Selected tab text color (theme)
                        backgroundColor: "#222", // Slightly lighter than black for contrast
                        borderRadius: "8px 8px 0 0",
                        transition:
                          "background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "flex",
                        alignItems: "center",
                        minHeight: "44px",
                        height: "44px",
                        lineHeight: "1.2",
                        paddingTop: "0px",
                        paddingBottom: "0px",
                      },
                      "& .MuiTabs-indicator": {
                        backgroundColor: "#14b8a6",
                        height: "4px",
                        borderRadius: "2px",
                      },
                    }}
                  >
                    {categoryNames.map((category, index) => (
                      <Tab
                        key={category}
                        label={
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              height: "100%",
                            }}
                          >
                            {category}
                          </span>
                        }
                      />
                    ))}
                  </Tabs>
                </Box>

                {/* Avatar Table */}
                <div
                  className="bg-[#111] rounded-lg p-3 border border-gray-700 relative"
                  style={{ minHeight: "320px" }}
                >
                  <div className="grid grid-cols-8 gap-2">
                    {avatarRows.flat().map((avatar, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleAvatarSelect(avatar)}
                        className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl border transition-all duration-200
                          ${
                            formData.avatar === avatar
                              ? "border-teal-400 bg-teal-600 text-white"
                              : "border-gray-600 bg-[#181818] text-white hover:border-teal-400 hover:bg-[#222]"
                          }
                        `}
                        style={{
                          boxShadow:
                            formData.avatar === avatar
                              ? "0 0 0 2px #14b8a6"
                              : "none",
                        }}
                      >
                        {avatar}
                      </button>
                    ))}
                  </div>
                  {/* Pagination Controls - fixed at bottom */}
                  {totalAvatarPages > 1 && (
                    <div
                      className="flex justify-center items-center gap-2 w-full absolute left-0 bottom-2"
                      style={{ minHeight: "40px" }}
                    >
                      <button
                        type="button"
                        onClick={() => setAvatarPage((p) => Math.max(0, p - 1))}
                        disabled={avatarPage === 0}
                        className={`px-3 py-1 rounded bg-gray-700 text-white text-sm font-medium transition-colors duration-200 ${
                          avatarPage === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-teal-600"
                        }`}
                      >
                        Prev
                      </button>
                      <span className="text-white text-xs">
                        Page {avatarPage + 1} of {totalAvatarPages}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setAvatarPage((p) =>
                            Math.min(totalAvatarPages - 1, p + 1)
                          )
                        }
                        disabled={avatarPage === totalAvatarPages - 1}
                        className={`px-3 py-1 rounded bg-gray-700 text-white text-sm font-medium transition-colors duration-200 ${
                          avatarPage === totalAvatarPages - 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-teal-600"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Members */}
          <div className="w-1/2 p-4 flex flex-col">
            {/* Selected Members Avatar Group Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-white">
                  Selected Members ({selectedMembers.size})
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    setShowSelectedDetails(true);
                    setAnchorEl(e.currentTarget);
                  }}
                  className="text-xs text-teal-400 hover:text-white font-semibold px-2 py-1 rounded transition-colors duration-200 bg-[#222] border border-teal-400"
                  style={{ zIndex: 10 }}
                >
                  Show Details
                </button>
              </div>
              <div
                className="flex items-center px-2 py-2 bg-[#181818] rounded-lg border border-gray-700"
                style={{
                  width: "100%",
                  minHeight: "56px",
                  maxHeight: "56px",
                  overflow: "hidden",
                  position: "relative",
                }}
              >
                {/* Avatar Group Format */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "-8px",
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    width: "100%",
                  }}
                >
                  {/* Creator Avatar */}
                  <div
                    className="flex items-center bg-teal-600 rounded-full px-2 py-1 min-w-[40px] h-8"
                    style={{ zIndex: 2 }}
                  >
                    <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-teal-600 text-xs font-bold mr-1">
                      Y
                    </div>
                    <span className="text-white text-xs font-medium">You</span>
                  </div>
                  {/* Selected Friends Avatars */}
                  {Array.from(selectedMembers)
                    .filter((id) => id !== 1)
                    .map((memberId, idx) => {
                      const friendship = friends.find(
                        (f) => getFriendId(f) === memberId
                      );
                      if (!friendship) return null;
                      const displayName = getFriendDisplayName(friendship);
                      // If more than 8, show only avatar, not text
                      if (selectedMembers.size > 8) {
                        return (
                          <div
                            key={memberId}
                            className="flex items-center bg-gray-600 rounded-full px-2 py-1 min-w-[40px] h-8"
                            style={{ marginLeft: "-8px", zIndex: 1 }}
                          >
                            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-gray-800 text-xs font-bold">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleMemberToggle(friendship)}
                              className="text-gray-300 hover:text-white text-xs ml-1"
                            >
                              ×
                            </button>
                          </div>
                        );
                      } else {
                        return (
                          <div
                            key={memberId}
                            className="flex items-center bg-gray-600 rounded-full px-2 py-1 min-w-[40px] h-8"
                            style={{ marginLeft: "-8px", zIndex: 1 }}
                          >
                            <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-gray-800 text-xs font-bold mr-1">
                              {displayName.charAt(0).toUpperCase()}
                            </div>
                            <span
                              className="text-white text-xs font-medium mr-1"
                              style={{
                                maxWidth: "70px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                            >
                              {displayName.split(" ")[0]}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleMemberToggle(friendship)}
                              className="text-gray-300 hover:text-white text-xs"
                              style={{ marginLeft: "2px" }}
                            >
                              ×
                            </button>
                          </div>
                        );
                      }
                    })}
                  {/* If too many, show a count at the end */}
                  {selectedMembers.size > 8 && (
                    <div
                      className="flex items-center bg-gray-800 rounded-full px-2 py-1 min-w-[40px] h-8 ml-2"
                      style={{ zIndex: 0 }}
                    >
                      <span className="text-white text-xs font-medium">
                        +{selectedMembers.size - 8} more
                      </span>
                    </div>
                  )}
                </div>
                {/* ...existing code... */}
                {/* Popover for Selected Members Details */}
                {showSelectedDetails && (
                  <div
                    className="fixed inset-0 flex items-center justify-center z-50"
                    style={{ background: "#000" }}
                  >
                    <div
                      className="rounded-2xl p-6 border border-teal-400 relative"
                      style={{
                        width: "600px",
                        height: "480px",
                        maxWidth: "95vw",
                        maxHeight: "90vh",
                        overflowY: "auto",
                        background: "rgba(34, 34, 34, 0.85)",
                        backdropFilter: "blur(12px)",
                        border: "1.5px solid #14b8a6",
                        color: "#fff",
                        transition: "all 0.3s cubic-bezier(0.4,0,0.2,1)",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setShowSelectedDetails(false)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-white text-lg font-bold"
                        style={{ background: "none", border: "none" }}
                      >
                        ×
                      </button>
                      <h2 className="text-xl font-bold mb-2 text-teal-400">
                        Selected Friends Details
                      </h2>
                      {/* Search Bar for Popover */}
                      <div className="mb-3">
                        <input
                          type="text"
                          value={popoverSearchQuery}
                          onChange={(e) =>
                            setPopoverSearchQuery(e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg text-white placeholder-gray-400 text-sm bg-[#222] border border-teal-400 focus:outline-none focus:border-teal-500"
                          placeholder="Search selected friends..."
                          style={{ marginBottom: "2px" }}
                        />
                      </div>
                      <div
                        className="custom-scrollbar"
                        style={{
                          flex: 1,
                          overflowY: "auto",
                          paddingRight: "8px",
                          paddingLeft: "2px",
                          paddingBottom: "2px",
                          marginRight: "-8px",
                        }}
                      >
                        {/* Custom Scrollbar Styles for Popover */}
                        <style>{`
                          .custom-scrollbar::-webkit-scrollbar {
                            width: 8px;
                          }
                          .custom-scrollbar::-webkit-scrollbar-track {
                            background: #222;
                            border-radius: 4px;
                          }
                          .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #14b8a6;
                            border-radius: 4px;
                          }
                          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #0f9488;
                          }
                          .custom-scrollbar {
                            scrollbar-width: thin;
                            scrollbar-color: #14b8a6 #222;
                          }
                        `}</style>
                        {selectedFriendsDetails.length === 0 ? (
                          <div className="text-gray-400 text-sm">
                            No friends selected.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-6 px-2 pb-2">
                            {selectedFriendsDetails
                              .filter(
                                (friend) =>
                                  friend.displayName
                                    .toLowerCase()
                                    .includes(
                                      popoverSearchQuery.toLowerCase()
                                    ) ||
                                  friend.email
                                    .toLowerCase()
                                    .includes(popoverSearchQuery.toLowerCase())
                              )
                              .map((friend) => (
                                <div
                                  key={friend.id}
                                  className="rounded-xl px-6 py-4 flex items-center gap-6 shadow-lg"
                                  style={{
                                    minHeight: "88px",
                                    backdropFilter: "blur(6px)",
                                    marginBottom: "0px",
                                    boxShadow:
                                      "0 4px 24px 0 rgba(20,184,166,0.12)",
                                    background: "#0b0b0b",
                                  }}
                                >
                                  <div className="w-10 h-10 rounded-full bg-teal-600 flex items-center justify-center text-white text-xl font-bold">
                                    {friend.displayName.charAt(0).toUpperCase()}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-base font-semibold text-white truncate mb-1">
                                      {friend.displayName}
                                    </div>
                                    <div className="text-xs text-gray-300 truncate mb-2">
                                      {friend.email}
                                    </div>
                                    <div className="flex items-center gap-2 mb-1 mt-2">
                                      <span className="text-sm text-teal-400 font-medium">
                                        Role:
                                      </span>
                                      <select
                                        value={
                                          formData.memberRoles[friend.id] ||
                                          "MEMBER"
                                        }
                                        onChange={(e) =>
                                          handleRoleChange(
                                            friend.id,
                                            e.target.value
                                          )
                                        }
                                        className="px-2 py-1 rounded text-white text-xs"
                                        style={{
                                          backgroundColor: "#3a3a3a",
                                          minWidth: "180px",
                                          outline: "none",
                                          border: "none",
                                        }}
                                      >
                                        {availableRoles.map((role) => (
                                          <option
                                            key={role.value}
                                            value={role.value}
                                          >
                                            {role.label}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Remove member from selectedMembers and memberRoles
                                      const newSelectedMembers = new Set(
                                        selectedMembers
                                      );
                                      newSelectedMembers.delete(friend.id);
                                      const newMemberRoles = {
                                        ...formData.memberRoles,
                                      };
                                      delete newMemberRoles[friend.id];
                                      setSelectedMembers(newSelectedMembers);
                                      setFormData((prev) => ({
                                        ...prev,
                                        memberIds:
                                          Array.from(newSelectedMembers),
                                        memberRoles: newMemberRoles,
                                      }));
                                    }}
                                    className="ml-2 px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-white">Add Members</h2>
              <span className="text-xs text-gray-400">
                {selectedMembers.size - 1} selected
              </span>
            </div>

            {/* Search Friends */}
            <div className="relative mb-3">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-4 w-4 text-gray-400"
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
                className="w-full pl-10 pr-3 py-2 rounded-lg text-white placeholder-gray-400 text-sm"
                placeholder="Search friends..."
                style={{ backgroundColor: "#2a2a2a", outline: "none" }}
              />
            </div>

            {/* Friends List - Two Column Grid */}
            <div
              className="flex-1 overflow-y-auto custom-scrollbar"
              style={{ maxHeight: "440px" }}
            >
              {filteredFriends.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">
                  {searchQuery ? "No friends found" : "No friends available"}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {filteredFriends.map((friendship) => {
                    const friendId = getFriendId(friendship);
                    const isSelected = selectedMembers.has(friendId);
                    const displayName = getFriendDisplayName(friendship);
                    const email = getFriendEmail(friendship);

                    return (
                      <div
                        key={friendship.id}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                          isSelected ? "border border-green-400" : ""
                        }`}
                        style={{
                          backgroundColor: isSelected ? "#1a4a47" : "#2a2a2a",
                        }}
                      >
                        {/* Friend Info */}
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-xs font-medium truncate">
                              {displayName}
                            </p>
                            <p className="text-gray-400 text-xs truncate">
                              {email}
                            </p>
                          </div>
                        </div>

                        {/* Role Selection and Add/Remove Button - Same Line */}
                        <div className="flex items-center space-x-1">
                          {isSelected && (
                            <select
                              value={formData.memberRoles[friendId] || "MEMBER"}
                              onChange={(e) =>
                                handleRoleChange(friendId, e.target.value)
                              }
                              className="px-2 py-1 rounded text-white text-xs"
                              style={{
                                backgroundColor: "#3a3a3a",
                                width: "180px",
                              }}
                            >
                              {availableRoles.map((role) => (
                                <option key={role.value} value={role.value}>
                                  {role.label}
                                </option>
                              ))}
                            </select>
                          )}
                          <button
                            type="button"
                            onClick={() => handleMemberToggle(friendship)}
                            className={`py-1 px-2 rounded text-xs font-medium transition-all duration-200 ${
                              isSelected
                                ? "bg-red-600 hover:bg-red-700 text-white"
                                : "bg-teal-600 hover:bg-teal-700 text-white w-full"
                            }`}
                            style={
                              !isSelected
                                ? {
                                    width: "100%",
                                    display: "block",
                                    margin: "0 auto",
                                  }
                                : { width: "180px" }
                            }
                          >
                            {isSelected ? "Remove" : "Add"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {errors.members && (
              <div className="text-xs text-red-400 mt-2">{errors.members}</div>
            )}

            {/* ...existing code... */}
          </div>
        </form>
      </div>

      {/* Floating Action Buttons - Bottom Right Corner */}
      <div className="absolute bottom-4 right-4 flex space-x-2">
        {errors.submit && (
          <div className="absolute bottom-16 right-0 bg-red-600 text-white text-xs px-3 py-2 rounded-lg">
            {errors.submit}
          </div>
        )}
        <button
          type="button"
          onClick={() => navigate("/groups")}
          className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          onClick={handleSubmit}
          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-600 text-white text-sm rounded-lg transition-colors duration-200 flex items-center space-x-2"
        >
          {loading ? (
            <>
              <svg
                className="animate-spin h-4 w-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>Creating...</span>
            </>
          ) : (
            <>
              <span>{formData.avatar}</span>
              <span>Create Group</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default CreateGroup;
