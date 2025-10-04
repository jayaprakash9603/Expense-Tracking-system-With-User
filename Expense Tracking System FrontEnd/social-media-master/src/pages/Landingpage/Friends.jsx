import { useMediaQuery } from "@mui/material";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Add, ChevronRight, Settings } from "@mui/icons-material";
import {
  TextField,
  InputAdornment,
  CircularProgress,
  Snackbar,
  Alert,
  Tabs,
  Tab,
  Badge,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PeopleIcon from "@mui/icons-material/People";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import LockIcon from "@mui/icons-material/Lock";
import ShareIcon from "@mui/icons-material/Share";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewAgendaIcon from "@mui/icons-material/ViewAgenda";
import SortIcon from "@mui/icons-material/Sort";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  fetchFriendSuggestions,
  sendFriendRequest,
  fetchFriendRequests,
  respondToFriendRequest,
  addNewFriendRequest,
  fetchFriends,
  setAccessLevel,
  fetchISharedWith,
  fetchSharedWithMe,
  fetchFriendsExpenses,
  fetchFriendship,
} from "../../Redux/Friends/friendsActions";
import UserAvatar from "./UserAvatar";
import { useNavigate } from "react-router-dom";
import { fetchCashflowExpenses } from "../../Redux/Expenses/expense.action";
import FriendsEmptyState from "../../components/FriendsEmptyState";
// Removed direct NoDataPlaceholder import; using FriendsEmptyState everywhere for consistency
import SharingCard from "../../components/SharingCard";
import FilterPopover from "../../components/FilterPopover";
import {
  filterSuggestions,
  filterRequests,
  filterFriends as utilFilterFriends,
  buildSharedCombined,
  filterSharedBySelectedFilters,
} from "../../utils/friendFilters";

// Define theme color for icons
const themeColor = "#14b8a6";

// Update the color of edit, lock, and view icons
const iconColor = "#14b8a6";

// Add custom scrollbar styles
const scrollbarStyles = `
  /* Custom scrollbar styles */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #1b1b1b;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #14b8a6;
    border-radius: 10px;
  }
  
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #14b8a6;
  }

  /* Horizontal chip scroll (single-line) */
  .chip-scroll {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    white-space: nowrap;
    padding-bottom: 4px;
    -ms-overflow-style: none; /* IE */
    scrollbar-width: none; /* Firefox */
  }
  .chip-scroll::-webkit-scrollbar { height: 6px; }
  .chip-scroll::-webkit-scrollbar-track { background: transparent; }
  .chip-scroll::-webkit-scrollbar-thumb { background: #2f2f2f; border-radius: 8px; }
  .chip-scroll::-webkit-scrollbar-thumb:hover { background: #3d3d3d; }
`;

const Friends = () => {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Get user data from Redux store
  const user = useSelector((state) => state.auth.user);
  const token = localStorage.getItem("jwt");

  const {
    suggestions = [],
    error = null,
    loading = false,
    sendingRequest = false,
    sentRequests = [],
    sendRequestError = null,
    friendRequests = [],
    loadingRequests = false,
    requestsError = null,
    respondingToRequest = false,
    respondToRequestError = null,
    // Friends
    friends = [],
    loadingFriends = false,
    friendsError = null,
    // New state for shared expenses
    iSharedWith = [],
    loadingISharedWith = false,
    iSharedWithError = null,
    sharedWithMe = [],
    loadingSharedWithMe = false,
    sharedWithMeError = null,
  } = useSelector((state) => state.friends || {});

  const [searchTerm, setSearchTerm] = useState("");
  const [friendSearchTerm, setFriendSearchTerm] = useState("");
  const [requestSearchTerm, setRequestSearchTerm] = useState("");
  // Simple toggle states for new filter icons (visual only for now)
  const [suggestionsFilterOn, setSuggestionsFilterOn] = useState(false);
  const [requestsFilterOn, setRequestsFilterOn] = useState(false);
  const [friendsFilterOn, setFriendsFilterOn] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  // Shared tab UI state
  const [sharingViewMode, setSharingViewMode] = useState("combined"); // 'combined' | 'split'
  // Removed list/grid toggle; always grid now
  const [sharingSort, setSharingSort] = useState("name"); // 'name' | 'level'
  const [sharingFilter, setSharingFilter] = useState("all"); // 'all' | 'incoming' | 'outgoing'
  const [sharingSearchTerm, setSharingSearchTerm] = useState(""); // search within shared tab
  // Filter popover state
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [activeFilterContext, setActiveFilterContext] = useState(null); // 'suggestions' | 'requests' | 'friends' | 'shared'

  // Selected filter values per tab
  const [suggestionFilters, setSuggestionFilters] = useState([]);
  const [requestFilters, setRequestFilters] = useState([]);
  const [friendFilters, setFriendFilters] = useState([]);
  const [sharedFilters, setSharedFilters] = useState([]);

  // Persist filters across navigation (localStorage)
  useEffect(() => {
    try {
      const saved = JSON.parse(
        localStorage.getItem("friends_filter_state") || "{}"
      );
      if (saved.suggestionFilters)
        setSuggestionFilters(saved.suggestionFilters);
      if (saved.requestFilters) setRequestFilters(saved.requestFilters);
      if (saved.friendFilters) setFriendFilters(saved.friendFilters);
      if (saved.sharedFilters) setSharedFilters(saved.sharedFilters);
    } catch (e) {
      /* ignore */
    }
  }, []);

  const persistFilters = (next = {}) => {
    try {
      const current = {
        suggestionFilters,
        requestFilters,
        friendFilters,
        sharedFilters,
        ...next,
      };
      localStorage.setItem("friends_filter_state", JSON.stringify(current));
    } catch (e) {
      /* ignore */
    }
  };

  const filterOptionSets = {
    suggestions: [
      { value: "hasAccess", label: "Has Any Access" },
      { value: "noAccess", label: "No Access" },
      { value: "firstNameA", label: "First Name A-M" },
      { value: "firstNameN", label: "First Name N-Z" },
    ],
    requests: [
      { value: "incoming", label: "Incoming" },
      { value: "recent", label: "Recent (<7d)" },
    ],
    friends: [
      { value: "withAccess", label: "Access Granted" },
      { value: "mutualFull", label: "Full Both Ways" },
      { value: "noAccess", label: "No Access" },
    ],
    shared: [
      { value: "incoming", label: "Incoming Only" },
      { value: "outgoing", label: "Outgoing Only" },
      { value: "read", label: "Read" },
      { value: "write", label: "Write" },
      { value: "full", label: "Full" },
      { value: "none", label: "None" },
    ],
  };

  const openFilter = (event, ctx) => {
    setActiveFilterContext(ctx);
    setFilterAnchor(event.currentTarget);
  };
  const closeFilter = () => {
    setFilterAnchor(null);
    setActiveFilterContext(null);
  };

  const getSelectedFilters = () => {
    switch (activeFilterContext) {
      case "suggestions":
        return suggestionFilters;
      case "requests":
        return requestFilters;
      case "friends":
        return friendFilters;
      case "shared":
        return sharedFilters;
      default:
        return [];
    }
  };
  const applySelectedFilters = (vals) => {
    switch (activeFilterContext) {
      case "suggestions":
        setSuggestionFilters(vals);
        persistFilters({ suggestionFilters: vals });
        break;
      case "requests":
        setRequestFilters(vals);
        persistFilters({ requestFilters: vals });
        break;
      case "friends":
        setFriendFilters(vals);
        persistFilters({ friendFilters: vals });
        break;
      case "shared":
        setSharedFilters(vals);
        persistFilters({ sharedFilters: vals });
        break;
      default:
        break;
    }
  };

  // New state for access level menu
  const [accessMenuAnchorEl, setAccessMenuAnchorEl] = useState(null);
  const [selectedFriendship, setSelectedFriendship] = useState(null);
  const accessMenuOpen = Boolean(accessMenuAnchorEl);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [pollingInterval, setPollingInterval] = useState(null);

  // Add this useEffect for polling as a fallback mechanism
  useEffect(() => {
    if (user && token && activeTab === 2) {
      const interval = setInterval(() => {
        // Only refresh if it's been more than 2 seconds since the last update
        if (Date.now() - lastUpdate > 15000) {
          console.log("Polling for updates...");
          dispatch(fetchFriends());
          setLastUpdate(Date.now());
        }
      }, 1500);

      setPollingInterval(interval);

      return () => {
        clearInterval(interval);
      };
    } else if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  }, [user, token, activeTab, dispatch, lastUpdate]);

  // Fetch friend suggestions, requests, friends, and shared expense data when component mounts
  useEffect(() => {
    if (token) {
      dispatch(fetchFriendSuggestions());
      dispatch(fetchFriendRequests());
      dispatch(fetchFriends());
      dispatch(fetchISharedWith());
      dispatch(fetchSharedWithMe());
    }
  }, [dispatch, token]);

  // Show error snackbar if send request fails
  useEffect(() => {
    if (sendRequestError) {
      setSnackbar({
        open: true,
        message: `Failed to send friend request: ${sendRequestError}`,
        severity: "error",
      });
    }
  }, [sendRequestError]);

  // Show error snackbar if respond to request fails
  // useEffect(() => {
  //   if (respondToRequestError) {
  //     setSnackbar({
  //       open: true,
  //       message: `Failed to respond to friend request: ${respondToRequestError}`,
  //       severity: "error",
  //     });
  //   }
  // }, [respondToRequestError]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setSelectedFriend(null);
  };

  // Handle search input change - just filter locally
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle friend search input change
  const handleFriendSearchChange = (e) => {
    setFriendSearchTerm(e.target.value);
  };

  // Handle request search input change
  const handleRequestSearchChange = (e) => {
    setRequestSearchTerm(e.target.value);
  };

  // Handle add friend button click
  const handleAddFriend = async (userId) => {
    const result = await dispatch(sendFriendRequest(userId));
    if (result && result.success) {
      setSnackbar({
        open: true,
        message: "Friend request sent successfully!",
        severity: "success",
      });
    }
  };

  // Modified: Handle friend selection with toggle functionality
  const handleFriendSelect = (friend) => {
    if (selectedFriend?.id === friend.id) {
      setSelectedFriend(null); // Deselect if already selected
      setSelectedFriendship(null); // Also clear the selected friendship
    } else {
      setSelectedFriend(friend); // Select if not already selected

      // Find the friendship for this friend regardless of which tab we're in
      let friendship = null;

      // If the friend already has a friendship property (from the friends tab)
      if (friend.friendship) {
        friendship = friend.friendship;
      }
      // For shared with me tab
      else if (activeTab === 3 && sharedWithMe.length > 0) {
        // Find the corresponding friendship from the friends list
        friendship = friends.find(
          (f) =>
            f.requester.id === friend.userId || f.recipient.id === friend.userId
        );
      }
      // For I shared with tab
      else if (activeTab === 3 && iSharedWith.length > 0) {
        // Find the corresponding friendship from the friends list
        friendship = friends.find(
          (f) =>
            f.requester.id === friend.userId || f.recipient.id === friend.userId
        );
      }

      setSelectedFriendship(friendship);
    }
  };

  // Handle respond to friend request
  const handleRespondToRequest = async (requestId, accept) => {
    const result = await dispatch(respondToFriendRequest(requestId, accept));
    if (result && result.success) {
      setSnackbar({
        open: true,
        message: `Friend request ${
          accept ? "accepted" : "rejected"
        } successfully!`,
        severity: "success",
      });

      // Refresh friends list if request was accepted
      if (accept) {
        dispatch(fetchFriends());
      }
    }
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Add this useEffect to ensure the menu is closed during any loading state
  useEffect(() => {
    // If any loading state is active, close the menu
    if (
      loading ||
      loadingFriends ||
      loadingRequests ||
      loadingISharedWith ||
      loadingSharedWithMe ||
      sendingRequest ||
      respondingToRequest
    ) {
      // Only close if it's actually open to avoid unnecessary re-renders
      if (accessMenuOpen) {
        setAccessMenuAnchorEl(null);
      }
    }
  }, [
    loading,
    loadingFriends,
    loadingRequests,
    loadingISharedWith,
    loadingSharedWithMe,
    sendingRequest,
    respondingToRequest,
    accessMenuOpen,
  ]);

  // Handle opening access level menu
  const handleAccessMenuOpen = (event, friendship) => {
    event.stopPropagation();
    setAccessMenuAnchorEl(event.currentTarget);
    setSelectedFriendship(friendship);
  };

  // Handle closing access level menu
  const handleAccessMenuClose = () => {
    setAccessMenuAnchorEl(null);
  };

  // Handle setting access level
  const handleSetAccessLevel = async (accessLevel) => {
    if (selectedFriendship) {
      // Close the menu immediately before starting the API call
      handleAccessMenuClose();

      // Store the original friendship for rollback if needed
      const originalFriendship = { ...selectedFriendship };
      const originalSelectedFriend = { ...selectedFriend };

      // Optimistically update the UI immediately
      const updatedFriendship = {
        ...selectedFriendship,
        recipientAccess:
          selectedFriendship.requester.id === user.id
            ? accessLevel
            : selectedFriendship.recipientAccess,
        requesterAccess:
          selectedFriendship.recipient.id === user.id
            ? accessLevel
            : selectedFriendship.requesterAccess,
      };

      // Update the local state for the selected friendship
      setSelectedFriendship(updatedFriendship);

      // Also update the selectedFriend object to reflect the changes
      if (selectedFriend) {
        const updatedFriend = {
          ...selectedFriend,
          friendship: updatedFriendship,
        };
        setSelectedFriend(updatedFriend);
      }

      // Set a loading state to prevent multiple clicks
      const loadingId = setTimeout(() => {
        setSnackbar({
          open: true,
          message: "Updating access level...",
          severity: "info",
        });
      }, 500); // Show loading message if it takes more than 500ms

      try {
        // Dispatch the action and get the promise
        const resultAction = await dispatch(
          setAccessLevel(selectedFriendship.id, accessLevel)
        );

        // Clear the loading timeout
        clearTimeout(loadingId);

        // Check if the action was successful
        // The structure depends on how your action creator is implemented
        const result = resultAction.payload;
        const success = !resultAction.error;

        if (success) {
          setSnackbar({
            open: true,
            message: `Access level set to ${accessLevel} successfully!`,
            severity: "success",
          });

          // Refresh all relevant data to ensure Redux store is up to date
          // We do this in the background to keep the UI responsive
          Promise.all([
            dispatch(fetchFriends()),
            dispatch(fetchISharedWith()),
            dispatch(fetchSharedWithMe()),
          ]).then(() => {
            setLastUpdate(Date.now());
          });
        } else {
          // If there was an error, roll back the optimistic update
          setSelectedFriendship(originalFriendship);
          if (selectedFriend) {
            setSelectedFriend(originalSelectedFriend);
          }

          setSnackbar({
            open: true,
            message: `Failed to set access level: ${
              resultAction.error?.message || "Unknown error"
            }`,
            severity: "error",
          });
        }
      } catch (error) {
        // If there was an exception, roll back the optimistic update
        setSelectedFriendship(originalFriendship);
        if (selectedFriend) {
          setSelectedFriend(originalSelectedFriend);
        }

        clearTimeout(loadingId);
        setSnackbar({
          open: true,
          message: `Failed to set access level: ${
            error.message || "Unknown error"
          }`,
          severity: "error",
        });
      }
    } else {
      handleAccessMenuClose();
    }
  };
  // Add this function to handle manual refresh
  const handleManualRefresh = () => {
    setSnackbar({
      open: true,
      message: "Refreshing data...",
      severity: "info",
    });

    Promise.all([
      dispatch(fetchFriends()),
      dispatch(fetchFriendRequests()),
      dispatch(fetchFriendSuggestions()),
      dispatch(fetchISharedWith()),
      dispatch(fetchSharedWithMe()),
    ])
      .then(() => {
        setLastUpdate(Date.now());
        setSnackbar({
          open: true,
          message: "Data refreshed successfully!",
          severity: "success",
        });
      })
      .catch((error) => {
        setSnackbar({
          open: true,
          message: `Failed to refresh data: ${
            error.message || "Unknown error"
          }`,
          severity: "error",
        });
      });
  };
  // Add this function to handle viewing shared expenses
  // Add this function to handle viewing shared expenses
  const handleViewSharedExpenses = (friendId) => {
    setSnackbar({
      open: true,
      message: "Loading shared expenses...",
      severity: "info",
    });
    dispatch(fetchFriendship(friendId || ""));
    dispatch(fetchCashflowExpenses("month", 0, "all", "", friendId));

    setTimeout(() => {
      setSnackbar({
        open: true,
        message: "Shared expenses loaded successfully!",
        severity: "success",
      });

      // Redirect to /friends/expenses route with the friendId as a parameter
      navigate(`/friends/expenses/${friendId}`);
    }, 1500);
  };

  // Helper function to get current access level for a friendship
  const getCurrentAccessLevel = (friendship) => {
    if (!friendship) return "NONE";

    // Determine if the current user is the requester or recipient
    const isRequester = friendship.requester.id === user.id;

    // Return the appropriate access level
    return isRequester
      ? friendship.recipientAccess
      : friendship.requesterAccess;
  };

  // Filtered datasets via utility functions (DRY)
  const filteredSuggestions = filterSuggestions(suggestions, {
    term: searchTerm,
    filters: suggestionFilters,
  });
  const filteredRequests = filterRequests(friendRequests, {
    term: requestSearchTerm,
    filters: requestFilters,
  });
  const filteredFriends = utilFilterFriends(friends, {
    term: friendSearchTerm,
    filters: friendFilters,
    userId: user?.id,
  });

  // Generate initials from name
  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0)?.toUpperCase() || ""}${
      lastName?.charAt(0)?.toUpperCase() || ""
    }`;
  };

  // Generate random color based on user ID
  const getAvatarColor = (id) => {
    const colors = [
      "#8a56e2",
      "#14b8a6",
      "#e6a935",
      "#e35353",
      "#5c6bc0",
      "#26a69a",
      "#ec407a",
      "#7e57c2",
    ];
    return colors[id % colors.length];
  };

  // Check if a friend request has been sent
  const isRequestSent = (userId) => {
    return sentRequests.includes(userId);
  };

  // Get access level description
  // Get access level description
  const getAccessLevelDescription = (level, direction = "neutral") => {
    // Base descriptions
    let baseDescription;
    switch (level) {
      case "NONE":
        baseDescription = "No access to expenses";
        break;
      case "READ":
        baseDescription = "Can view expenses";
        break;
      case "WRITE":
        baseDescription = "Can view and edit expenses";
        break;
      case "FULL":
        baseDescription = "Full access to expenses";
        break;
      default:
        return "Unknown access level";
    }

    // Add direction-specific context
    if (direction === "theySharing") {
      return `They ${baseDescription.toLowerCase()}`;
    } else if (direction === "youSharing") {
      return `You're giving them ${baseDescription.toLowerCase()}`;
    } else {
      return baseDescription;
    }
  };

  // Get access level icon
  const getAccessLevelIcon = (level) => {
    const palette = {
      NONE: "#555555", // muted gray
      READ: "#14b8a6", // teal
      WRITE: "#e6a935", // amber
      FULL: "#e35353", // strong red
    };
    const color = palette[level] || palette.NONE;

    switch (level) {
      case "NONE":
        return <VisibilityOffIcon fontSize="small" style={{ color }} />;
      case "READ":
        return <VisibilityIcon fontSize="small" style={{ color }} />;
      case "WRITE":
        return <EditIcon fontSize="small" style={{ color }} />;
      case "FULL":
        return <LockIcon fontSize="small" style={{ color }} />;
      default:
        return <VisibilityOffIcon fontSize="small" style={{ color }} />;
    }
  };

  // Ensure user images are displayed correctly
  const getUserImage = (user) => {
    return user?.image || "default-avatar.png"; // Fallback to default image
  };

  // If user is not logged in, show login message
  if (!user || !token) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1b1b1b]">
        <div className="text-white text-center p-8 bg-[#2a2a2a] rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Please Log In</h2>
          <p>You need to be logged in to view and manage friends.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Add the style tag for custom scrollbar */}
      <style>{scrollbarStyles}</style>

      <div className="bg-[#1b1b1b]">
        {/* <div className="h-[50px] bg-[#1b1b1b]"></div> */}
        <div
          className="flex flex-col md:flex-row w-full md:w-[calc(100vw-350px)] p-2 md:p-4 rounded-lg border border-black bg-[rgb(11,11,11)] shadow-sm"
          style={{
            height: isSmallScreen ? "auto" : "calc(100vh - 100px)",
            width: isSmallScreen ? "100%" : "calc(100vw - 370px)",
            marginRight: "20px", // Add left margin to move it left
            maxWidth: "1600px", // Add max width for very large screens
          }}
        >
          {/* Left Section - Friends List */}
          <div className="flex flex-col w-full md:w-1/2 lg:w-2/5 px-4 py-6 border-r border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-white">Friends</h1>
              <Button
                size="small"
                onClick={handleManualRefresh}
                title="Refresh sharing data"
                sx={{
                  minWidth: "auto",
                  color: "#14b8a6",
                  padding: "4px",
                  "&:hover": {
                    backgroundColor: "rgba(20, 184, 166, 0.1)",
                  },
                }}
              >
                <RefreshIcon fontSize="small" />
              </Button>
            </div>
            {/* Tabs for Suggestions, Requests, Friends, and Shared Expenses */}
            <div className="mb-4">
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                textColor="inherit"
                indicatorColor="primary"
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  "& .MuiTabs-indicator": {
                    backgroundColor: "#14b8a6",
                  },
                  "& .MuiTab-root": {
                    color: "white",
                    "&.Mui-selected": {
                      color: "#14b8a6",
                    },
                  },
                }}
              >
                <Tab label="Suggestions" />
                <Tab
                  label="Requests"
                  icon={
                    friendRequests.length > 0 ? (
                      <Badge color="error" badgeContent={friendRequests.length}>
                        <NotificationsIcon />
                      </Badge>
                    ) : null
                  }
                  iconPosition="end"
                />
                <Tab
                  label="My Friends"
                  icon={<PeopleIcon />}
                  iconPosition="end"
                />
                <Tab label="Shared" icon={<ShareIcon />} iconPosition="end" />
              </Tabs>
            </div>

            {/* Content based on active tab */}
            {activeTab === 0 ? (
              // Suggestions Tab Content
              <>
                {/* Search Bar using MUI TextField */}
                <div className="flex items-center gap-2 mb-3">
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search suggestions"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        backgroundColor: "#2a2a2a",
                        "& fieldset": { borderColor: "#4a4a4a" },
                        "&:hover fieldset": { borderColor: "#6a6a6a" },
                        "&.Mui-focused fieldset": { borderColor: "#6a6a6a" },
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "gray",
                        opacity: 1,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "gray" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    size="small"
                    onClick={(e) => openFilter(e, "suggestions")}
                    sx={{
                      color: suggestionFilters.length ? "#14b8a6" : "#14b8a6",
                      minWidth: 0,
                      position: "relative",
                    }}
                    title={
                      suggestionFilters.length
                        ? `${suggestionFilters.length} filters selected`
                        : "Filter"
                    }
                  >
                    <FilterAltIcon sx={{ fontSize: 35 }} />
                    {suggestionFilters.length > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          transform: "translate(40%, -40%)",
                          background: "#14b8a6",
                          color: "#0b0b0b",
                          borderRadius: "999px",
                          fontSize: "10px",
                          fontWeight: 600,
                          lineHeight: 1,
                          padding: "2px 5px",
                        }}
                      >
                        {suggestionFilters.length}
                      </span>
                    )}
                  </Button>
                </div>
                {/* Chips removed per request */}

                {/* Loading State */}
                {loading && (
                  <div className="flex justify-center my-4">
                    <CircularProgress size={40} sx={{ color: "#14b8a6" }} />
                  </div>
                )}

                {/* Error State */}
                {error && (
                  <div className="text-red-500 text-center my-4">
                    Error loading friends: {error}
                  </div>
                )}

                {/* Friends List with custom scrollbar */}
                <div
                  className="space-y-3 overflow-y-auto pr-2 custom-scrollbar"
                  style={{ maxHeight: "calc(100vh - 300px)" }}
                >
                  {filteredSuggestions.length === 0 && !loading ? (
                    <FriendsEmptyState
                      type="suggestions"
                      searchActive={Boolean(searchTerm)}
                    />
                  ) : (
                    filteredSuggestions.map((friend) => (
                      <div
                        key={friend.id}
                        className={`flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg cursor-pointer hover:bg-[#333333] transition-colors ${
                          selectedFriend?.id === friend.id
                            ? "border-2 border-[#14b8a6]"
                            : ""
                        }`}
                        onClick={() => handleFriendSelect(friend)}
                      >
                        <div className="flex items-center flex-grow mr-2">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0"
                            style={{
                              backgroundColor: getAvatarColor(friend.id),
                            }}
                          >
                            {getInitials(friend.firstName, friend.lastName)}
                          </div>
                          <div className="max-w-[calc(100%-80px)]">
                            <p className="text-white font-medium truncate">
                              {friend.firstName} {friend.lastName}
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                              {friend.email}
                            </p>
                            <div className="flex items-center mt-1">
                              {getAccessLevelIcon(
                                friend.friendship?.recipientAccess || "NONE"
                              )}
                              <span className="text-xs text-gray-400 ml-2">
                                {getAccessLevelDescription(
                                  friend.friendship?.recipientAccess || "NONE"
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight className="text-gray-400 flex-shrink-0" />
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : activeTab === 1 ? (
              // Requests Tab Content
              <>
                {/* Search Bar for Requests */}
                <div className="flex items-center gap-2 mb-3">
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search friend requests"
                    value={requestSearchTerm}
                    onChange={handleRequestSearchChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        backgroundColor: "#2a2a2a",
                        "& fieldset": { borderColor: "#4a4a4a" },
                        "&:hover fieldset": { borderColor: "#6a6a6a" },
                        "&.Mui-focused fieldset": { borderColor: "#6a6a6a" },
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "gray",
                        opacity: 1,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "gray" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    size="small"
                    onClick={(e) => openFilter(e, "requests")}
                    sx={{
                      color: requestFilters.length ? "#14b8a6" : "#14b8a6",
                      minWidth: 0,
                      position: "relative",
                    }}
                    title={
                      requestFilters.length
                        ? `${requestFilters.length} filters selected`
                        : "Filter"
                    }
                  >
                    <FilterAltIcon sx={{ fontSize: 35 }} />
                    {requestFilters.length > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          transform: "translate(40%, -40%)",
                          background: "#14b8a6",
                          color: "#0b0b0b",
                          borderRadius: "999px",
                          fontSize: "10px",
                          fontWeight: 600,
                          lineHeight: 1,
                          padding: "2px 5px",
                        }}
                      >
                        {requestFilters.length}
                      </span>
                    )}
                  </Button>
                </div>
                {/* Chips removed per request */}

                {/* Loading State */}
                {loadingRequests && (
                  <div className="flex justify-center my-4">
                    <CircularProgress size={40} sx={{ color: "#14b8a6" }} />
                  </div>
                )}

                {/* Error State */}
                {requestsError && (
                  <div className="text-red-500 text-center my-4">
                    Error loading friend requests: {requestsError}
                  </div>
                )}

                {/* Friend Requests List with custom scrollbar */}
                <div
                  className="space-y-3 overflow-y-auto pr-2 custom-scrollbar"
                  style={{ maxHeight: "calc(100vh - 300px)" }}
                >
                  {filteredRequests.length === 0 && !loadingRequests ? (
                    <FriendsEmptyState
                      type="requests"
                      searchActive={Boolean(requestSearchTerm)}
                    />
                  ) : (
                    filteredRequests.map((request) => {
                      // Get the requester (the person who sent the request)
                      const requester = request.requester;

                      return (
                        <div
                          key={request.id}
                          className="bg-[#2a2a2a] p-4 rounded-lg"
                        >
                          <div className="flex items-center mb-4">
                            <div className="mr-4">
                              <UserAvatar user={requester} />
                            </div>
                            <div className="min-w-0 flex-grow">
                              <p className="text-white font-medium truncate">
                                {requester.firstName} {requester.lastName}
                              </p>
                              <p className="text-sm text-gray-400 overflow-hidden text-ellipsis">
                                {requester.email}
                              </p>
                            </div>
                          </div>

                          <div className="flex space-x-2">
                            <Button
                              variant="contained"
                              color="success"
                              startIcon={<CheckCircleIcon />}
                              onClick={() =>
                                handleRespondToRequest(request.id, true)
                              }
                              disabled={respondingToRequest}
                              size="small"
                              fullWidth
                            >
                              Accept
                            </Button>
                            <Button
                              variant="contained"
                              color="error"
                              startIcon={<CancelIcon />}
                              onClick={() =>
                                handleRespondToRequest(request.id, false)
                              }
                              disabled={respondingToRequest}
                              size="small"
                              fullWidth
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </>
            ) : activeTab === 2 ? (
              // My Friends Tab Content
              <>
                {/* Search Bar for Friends */}
                <div className="flex items-center gap-2 mb-3">
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search my friends"
                    value={friendSearchTerm}
                    onChange={handleFriendSearchChange}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        backgroundColor: "#2a2a2a",
                        "& fieldset": { borderColor: "#4a4a4a" },
                        "&:hover fieldset": { borderColor: "#6a6a6a" },
                        "&.Mui-focused fieldset": { borderColor: "#6a6a6a" },
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "gray",
                        opacity: 1,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "gray" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    size="small"
                    onClick={(e) => openFilter(e, "friends")}
                    sx={{
                      color: friendFilters.length ? "#14b8a6" : "#14b8a6",
                      minWidth: 0,
                      position: "relative",
                    }}
                    title={
                      friendFilters.length
                        ? `${friendFilters.length} filters selected`
                        : "Filter"
                    }
                  >
                    <FilterAltIcon sx={{ fontSize: 35 }} />
                    {friendFilters.length > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          transform: "translate(40%, -40%)",
                          background: "#14b8a6",
                          color: "#0b0b0b",
                          borderRadius: "999px",
                          fontSize: "10px",
                          fontWeight: 600,
                          lineHeight: 1,
                          padding: "2px 5px",
                        }}
                      >
                        {friendFilters.length}
                      </span>
                    )}
                  </Button>
                </div>
                {/* Chips removed per request */}

                {/* Loading State */}
                {/* {loadingFriends && (
                  <div className="flex justify-center my-4">
                    <CircularProgress size={40} sx={{ color: "#14b8a6" }} />
                  </div>
                )} */}

                {/* Error State */}
                {friendsError && (
                  <div className="text-red-500 text-center my-4">
                    Error loading friends: {friendsError}
                  </div>
                )}

                {/* Friends List with custom scrollbar */}
                <div
                  className="space-y-3 overflow-y-auto pr-2 custom-scrollbar"
                  style={{ maxHeight: "calc(100vh - 300px)" }}
                >
                  {filteredFriends.length === 0 && !loadingFriends ? (
                    <FriendsEmptyState
                      type="friends"
                      searchActive={Boolean(friendSearchTerm)}
                    />
                  ) : (
                    filteredFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className={`flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg cursor-pointer hover:bg-[#333333] transition-colors ${
                          selectedFriend?.id === friend.id
                            ? "border-2 border-[#14b8a6]"
                            : ""
                        }`}
                        onClick={() => handleFriendSelect(friend)}
                      >
                        <div className="flex items-center flex-grow mr-2">
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold mr-4 flex-shrink-0"
                            style={{
                              backgroundColor: getAvatarColor(friend.id),
                            }}
                          >
                            {getInitials(friend.firstName, friend.lastName)}
                          </div>
                          <div className="max-w-[calc(100%-80px)]">
                            <p className="text-white font-medium truncate">
                              {friend.firstName} {friend.lastName}
                            </p>
                            <p className="text-sm text-gray-400 truncate">
                              {friend.email}
                            </p>
                            <div className="flex items-center mt-1">
                              {getAccessLevelIcon(
                                // Check if the current user is the requester or recipient and show the appropriate access level
                                friend.friendship?.requester.id === user.id
                                  ? friend.friendship?.recipientAccess // If user is requester, show what they gave to recipient
                                  : friend.friendship?.requesterAccess // If user is recipient, show what they gave to requester
                              )}
                              <span className="text-xs text-gray-400 ml-2">
                                {getAccessLevelDescription(
                                  friend.friendship?.requester.id === user.id
                                    ? friend.friendship?.recipientAccess
                                    : friend.friendship?.requesterAccess
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button
                            onClick={(e) =>
                              handleAccessMenuOpen(e, friend.friendship)
                            }
                            sx={{ color: "#14b8a6", minWidth: "40px" }}
                          >
                            <Settings />
                          </Button>
                          <ChevronRight className="text-gray-400 flex-shrink-0" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              // Shared Expenses Tab Content - NEW DESIGN
              <>
                <div className="flex items-center gap-2 mb-3">
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search shared connections"
                    value={sharingSearchTerm}
                    onChange={(e) => setSharingSearchTerm(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        color: "white",
                        backgroundColor: "#2a2a2a",
                        // Match other tabs' border behavior
                        "& fieldset": { borderColor: "#4a4a4a" },
                        "&:hover fieldset": { borderColor: "#6a6a6a" },
                        "&.Mui-focused fieldset": { borderColor: "#6a6a6a" },
                      },
                      "& .MuiInputBase-input::placeholder": {
                        color: "gray",
                        opacity: 1,
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: "gray" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <Button
                    size="small"
                    onClick={(e) => openFilter(e, "shared")}
                    sx={{
                      color: sharedFilters.length ? "#14b8a6" : "#14b8a6",
                      minWidth: 0,
                      position: "relative",
                    }}
                    title={
                      sharedFilters.length
                        ? `${sharedFilters.length} filters selected`
                        : "Filter"
                    }
                  >
                    <FilterAltIcon sx={{ fontSize: 35 }} />
                    {sharedFilters.length > 0 && (
                      <span
                        style={{
                          position: "absolute",
                          top: 0,
                          right: 0,
                          transform: "translate(40%, -40%)",
                          background: "#14b8a6",
                          color: "#0b0b0b",
                          borderRadius: "999px",
                          fontSize: "10px",
                          fontWeight: 600,
                          lineHeight: 1,
                          padding: "2px 5px",
                        }}
                      >
                        {sharedFilters.length}
                      </span>
                    )}
                  </Button>
                </div>
                {/* Chips removed per request */}

                {(() => {
                  const { combined, incoming, outgoing } = buildSharedCombined({
                    incoming: sharedWithMe,
                    outgoing: iSharedWith,
                    viewMode: sharingViewMode,
                    filter: sharingFilter,
                    sort: sharingSort,
                    term: sharingSearchTerm,
                  });

                  const applySelectedSharedFilters = (arr) =>
                    filterSharedBySelectedFilters(arr, sharedFilters);

                  const finalCombined = combined
                    ? applySelectedSharedFilters(combined)
                    : null;
                  const finalIncoming = incoming
                    ? applySelectedSharedFilters(incoming)
                    : [];
                  const finalOutgoing = outgoing
                    ? applySelectedSharedFilters(outgoing)
                    : [];

                  const renderCard = (item) => (
                    <SharingCard
                      key={item.userId + item._direction}
                      user={item}
                      direction={item._direction}
                      selected={selectedFriend?.userId === item.userId}
                      onSelect={() => handleFriendSelect(item)}
                      onView={() => handleViewSharedExpenses(item.userId)}
                      onSettings={(e) => {
                        const friendship = friends.find(
                          (f) =>
                            f.requester.id === item.userId ||
                            f.recipient.id === item.userId
                        );
                        if (friendship) {
                          handleAccessMenuOpen(e, friendship);
                        }
                      }}
                      getAccessLevelIcon={getAccessLevelIcon}
                      getAccessLevelDescription={getAccessLevelDescription}
                      getInitials={getInitials}
                      getAvatarColor={getAvatarColor}
                      themeColor={themeColor}
                    />
                  );

                  if (sharingViewMode === "combined") {
                    if (
                      (loadingSharedWithMe || loadingISharedWith) &&
                      (finalCombined?.length || 0) === 0
                    ) {
                      return (
                        <div className="flex justify-center py-10">
                          <CircularProgress
                            size={34}
                            sx={{ color: "#14b8a6" }}
                          />
                        </div>
                      );
                    }
                    if (!finalCombined || finalCombined.length === 0) {
                      return (
                        <div
                          className="custom-scrollbar overflow-y-auto pr-1"
                          style={{ maxHeight: "calc(100vh - 340px)" }}
                        >
                          <FriendsEmptyState
                            type="shared"
                            searchActive={Boolean(sharingSearchTerm)}
                          />
                        </div>
                      );
                    }
                    return (
                      <div
                        className={`${"grid gap-4"} custom-scrollbar overflow-y-auto pr-1`}
                        style={{ maxHeight: "calc(100vh - 340px)" }}
                      >
                        {finalCombined.map(renderCard)}
                      </div>
                    );
                  }

                  // Split view
                  return (
                    <div className="flex flex-col gap-10">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Typography
                              variant="subtitle1"
                              sx={{ color: "#14b8a6", fontWeight: 600 }}
                            >
                              Friends Sharing With Me
                            </Typography>
                            {loadingSharedWithMe && (
                              <CircularProgress
                                size={16}
                                sx={{ color: "#14b8a6" }}
                              />
                            )}
                          </div>
                          {sharedWithMe.length > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-[#14b8a61a] text-[#14b8a6] border border-[#14b8a633]">
                              {sharedWithMe.length}
                            </span>
                          )}
                        </div>
                        {sharedWithMeError ? (
                          <div className="text-red-500 text-sm mb-2">
                            {sharedWithMeError}
                          </div>
                        ) : incoming.length === 0 ? (
                          <FriendsEmptyState
                            type="shared"
                            searchActive={Boolean(sharingSearchTerm)}
                          />
                        ) : (
                          <div
                            className={`${"grid gap-4"} custom-scrollbar overflow-y-auto pr-1`}
                            style={{ maxHeight: "260px" }}
                          >
                            {finalIncoming.map(renderCard)}
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Typography
                              variant="subtitle1"
                              sx={{ color: "#14b8a6", fontWeight: 600 }}
                            >
                              I'm Sharing With
                            </Typography>
                            {loadingISharedWith && (
                              <CircularProgress
                                size={16}
                                sx={{ color: "#14b8a6" }}
                              />
                            )}
                          </div>
                          {iSharedWith.length > 0 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-[#14b8a61a] text-[#14b8a6] border border-[#14b8a633]">
                              {iSharedWith.length}
                            </span>
                          )}
                        </div>
                        {iSharedWithError ? (
                          <div className="text-red-500 text-sm mb-2">
                            {iSharedWithError}
                          </div>
                        ) : outgoing.length === 0 ? (
                          <FriendsEmptyState
                            type="shared"
                            searchActive={Boolean(sharingSearchTerm)}
                          />
                        ) : (
                          <div
                            className={`${"grid gap-4"} custom-scrollbar overflow-y-auto pr-1`}
                            style={{ maxHeight: "260px" }}
                          >
                            {finalOutgoing.map(renderCard)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </>
            )}
          </div>

          {/* Right Section - Friend Details */}
          <div className="hidden md:flex flex-col w-1/2 lg:w-3/5 p-6">
            {activeTab === 0 && selectedFriend ? (
              <div className="bg-[#2a2a2a] p-6 rounded-lg">
                <div className="flex items-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-6"
                    style={{
                      backgroundColor: getAvatarColor(selectedFriend.id),
                    }}
                  >
                    {getInitials(
                      selectedFriend.firstName,
                      selectedFriend.lastName
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedFriend.firstName} {selectedFriend.lastName}
                    </h2>
                    <p className="text-gray-400">{selectedFriend.email}</p>
                    {selectedFriend.bio && (
                      <p className="text-gray-300 mt-2">{selectedFriend.bio}</p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleAddFriend(selectedFriend.id)}
                    disabled={
                      sendingRequest || isRequestSent(selectedFriend.id)
                    }
                    fullWidth
                    sx={{
                      backgroundColor: "#14b8a6",
                      "&:hover": {
                        backgroundColor: "#2d8a67",
                      },
                      "&.Mui-disabled": {
                        backgroundColor: "#1e5441",
                        color: "rgba(255, 255, 255, 0.5)",
                      },
                    }}
                  >
                    {isRequestSent(selectedFriend.id)
                      ? "Friend Request Sent"
                      : "Send Friend Request"}
                  </Button>
                </div>

                {selectedFriend.location && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Location
                    </h3>
                    <p className="text-gray-300">{selectedFriend.location}</p>
                  </div>
                )}

                {selectedFriend.interests && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Interests
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedFriend.interests
                        .split(",")
                        .map((interest, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#14b8a633] text-[#14b8a6] rounded-full text-sm"
                          >
                            {interest.trim()}
                          </span>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : activeTab === 1 && selectedFriend ? (
              <div className="bg-[#2a2a2a] p-6 rounded-lg">
                <div className="flex items-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-6"
                    style={{
                      backgroundColor: getAvatarColor(selectedFriend.id),
                    }}
                  >
                    {getInitials(
                      selectedFriend.firstName,
                      selectedFriend.lastName
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedFriend.firstName} {selectedFriend.lastName}
                    </h2>
                    <p className="text-gray-400">{selectedFriend.email}</p>
                  </div>
                </div>

                <div className="mt-6 flex space-x-4">
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() =>
                      handleRespondToRequest(selectedFriend.requestId, true)
                    }
                    disabled={respondingToRequest}
                    sx={{
                      flex: 1,
                      backgroundColor: "#14b8a6",
                      "&:hover": {
                        backgroundColor: "#2d8a67",
                      },
                    }}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() =>
                      handleRespondToRequest(selectedFriend.requestId, false)
                    }
                    disabled={respondingToRequest}
                    sx={{ flex: 1 }}
                  >
                    Reject
                  </Button>
                </div>
              </div>
            ) : activeTab === 2 && selectedFriend ? (
              <div className="bg-[#2a2a2a] p-6 rounded-lg">
                <div className="flex items-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-6"
                    style={{
                      backgroundColor: getAvatarColor(selectedFriend.id),
                    }}
                  >
                    {getInitials(
                      selectedFriend.firstName,
                      selectedFriend.lastName
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedFriend.firstName} {selectedFriend.lastName}
                    </h2>
                    <p className="text-gray-400">{selectedFriend.email}</p>
                    {selectedFriend.bio && (
                      <p className="text-gray-300 mt-2">{selectedFriend.bio}</p>
                    )}
                  </div>
                </div>

                {/* Access Level Section */}
                <div className="mt-6 bg-[#222222] p-4 rounded-lg relative">
                  {/* Friends since date in top right corner */}
                  <p className="text-gray-400 text-xs absolute top-4 right-4">
                    Friends since:{" "}
                    {new Date(
                      selectedFriend.friendship?.createdAt || Date.now()
                    ).toLocaleDateString()}
                  </p>

                  <h3 className="text-lg font-semibold text-white mb-3">
                    Expense Sharing Settings
                  </h3>

                  <div className="flex justify-between mb-4">
                    {/* You are sharing with them */}
                    <div className="flex-1 mr-2">
                      <p className="text-sm text-gray-400 mb-2">
                        You are sharing:
                      </p>
                      <div className="flex items-center bg-[#333333] p-3 rounded-lg h-[100px]">
                        <div className="mr-3" style={{ color: themeColor }}>
                          {getAccessLevelIcon(
                            selectedFriend?.friendship?.requesterAccess ||
                              "NONE"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">
                            {getCurrentAccessLevel(selectedFriend.friendship)}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {getCurrentAccessLevel(
                              selectedFriend.friendship
                            ) === "NONE"
                              ? "No access to your expenses"
                              : `${getCurrentAccessLevel(
                                  selectedFriend.friendship
                                )} access to your expenses`}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* They are sharing with you */}
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 mb-2">
                        They are sharing:
                      </p>
                      <div className="flex items-center bg-[#333333] p-3 rounded-lg h-[100px]">
                        <div className="mr-3" style={{ color: themeColor }}>
                          {getAccessLevelIcon(
                            selectedFriend.friendship?.requesterAccess || "NONE"
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-white font-medium truncate">
                            {selectedFriend.friendship?.requesterAccess ||
                              "NONE"}
                          </p>
                          <p className="text-sm text-gray-400 truncate">
                            {(selectedFriend.friendship?.requesterAccess ||
                              "NONE") === "NONE"
                              ? "No access to their expenses"
                              : `${
                                  selectedFriend.friendship?.requesterAccess ||
                                  "NONE"
                                } access to their expenses`}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="contained"
                    startIcon={<Settings />}
                    onClick={(e) =>
                      handleAccessMenuOpen(e, selectedFriend.friendship)
                    }
                    fullWidth
                    sx={{
                      backgroundColor: themeColor,
                      "&:hover": {
                        backgroundColor: "#2d8a67",
                      },
                    }}
                  >
                    Change Access Level
                  </Button>
                </div>
                {/* View Shared Expenses Button - Only show if they've shared access with you */}
                {selectedFriend.friendship?.requesterAccess !== "NONE" &&
                  selectedFriend.friendship?.requesterAccess && (
                    <div className="mt-4">
                      <Button
                        variant="outlined"
                        fullWidth
                        onClick={() =>
                          handleViewSharedExpenses(selectedFriend.id)
                        }
                        sx={{
                          borderColor: "#14b8a6",
                          color: "#14b8a6",
                          "&:hover": {
                            borderColor: "#2d8a67",
                            backgroundColor: "rgba(20, 184, 166, 0.1)",
                          },
                        }}
                      >
                        View Shared Expenses
                      </Button>
                    </div>
                  )}
              </div>
            ) : activeTab === 3 && selectedFriend ? (
              <div className="bg-[#2a2a2a] p-6 rounded-lg">
                <div className="flex items-center mb-6">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-bold mr-6"
                    style={{
                      backgroundColor: getAvatarColor(selectedFriend.id),
                    }}
                  >
                    {getInitials(
                      selectedFriend.firstName,
                      selectedFriend.lastName
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedFriend.firstName} {selectedFriend.lastName}
                    </h2>
                    <p className="text-gray-400">{selectedFriend.email}</p>
                  </div>
                </div>

                {/* Shared Expense Details */}
                <div className="mt-6 bg-[#222222] p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Shared Expense Details
                  </h3>

                  <div className="mb-4">
                    <p className="text-gray-300 mb-2">Access level:</p>
                    <div className="flex items-center bg-[#333333] p-3 rounded-lg">
                      <div className="mr-3" style={{ color: themeColor }}>
                        {getAccessLevelIcon(selectedFriend.accessLevel)}
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {selectedFriend.accessLevel}
                        </p>
                        <p className="text-sm text-gray-400">
                          {getAccessLevelDescription(
                            selectedFriend.accessLevel
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      backgroundColor: "#14b8a6",
                      "&:hover": {
                        backgroundColor: "#2d8a67",
                      },
                    }}
                  >
                    View Shared Expenses
                  </Button>
                </div>

                {/* Sharing History */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-white mb-3">
                    Sharing History
                  </h3>
                  <div className="bg-[#222222] p-4 rounded-lg">
                    <p className="text-gray-400 text-sm">
                      Sharing started: {new Date().toLocaleDateString()}
                    </p>
                    <p className="text-gray-400 text-sm mt-2">
                      Last access level change:{" "}
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center p-8">
                  <ShareIcon sx={{ fontSize: 80, color: "#14b8a633", mb: 2 }} />
                  <h2 className="text-2xl font-bold text-white mb-2">
                    {activeTab === 0
                      ? "Select a friend suggestion"
                      : activeTab === 1
                      ? "Select a friend request"
                      : activeTab === 2
                      ? "Select a friend"
                      : "Select a shared connection"}
                  </h2>
                  <p className="text-gray-400">
                    {activeTab === 0
                      ? "View details and send friend requests"
                      : activeTab === 1
                      ? "Accept or reject friend requests"
                      : activeTab === 2
                      ? "Manage your friendship and sharing settings"
                      : "View and manage your shared expense access"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Access Level Menu */}
        <Menu
          anchorEl={accessMenuAnchorEl}
          open={accessMenuOpen}
          onClose={handleAccessMenuClose}
          PaperProps={{
            sx: {
              backgroundColor: "#2a2a2a",
              color: "white",
              boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
              width: 250,
            },
          }}
        >
          <MenuItem
            onClick={() => handleSetAccessLevel("NONE")}
            sx={{
              "&:hover": { backgroundColor: "#333333" },
              color:
                getCurrentAccessLevel(selectedFriendship) === "NONE"
                  ? "#14b8a6"
                  : "white",
            }}
          >
            <ListItemIcon>
              <BlockIcon
                sx={{
                  color:
                    getCurrentAccessLevel(selectedFriendship) === "NONE"
                      ? "#14b8a6"
                      : "white",
                }}
              />
            </ListItemIcon>
            <ListItemText>No Access</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => handleSetAccessLevel("READ")}
            sx={{
              "&:hover": { backgroundColor: "#333333" },
              color:
                getCurrentAccessLevel(selectedFriendship) === "READ"
                  ? "#14b8a6"
                  : "white",
            }}
          >
            <ListItemIcon>
              <VisibilityIcon
                sx={{
                  color:
                    getCurrentAccessLevel(selectedFriendship) === "READ"
                      ? "#3eb489"
                      : "white",
                }}
              />
            </ListItemIcon>
            <ListItemText>Read Only</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => handleSetAccessLevel("WRITE")}
            sx={{
              "&:hover": { backgroundColor: "#333333" },
              color:
                getCurrentAccessLevel(selectedFriendship) === "WRITE"
                  ? "#3eb489"
                  : "white",
            }}
          >
            <ListItemIcon>
              <EditIcon
                sx={{
                  color:
                    getCurrentAccessLevel(selectedFriendship) === "WRITE"
                      ? "#3eb489"
                      : "white",
                }}
              />
            </ListItemIcon>
            <ListItemText>Write Access</ListItemText>
          </MenuItem>

          <MenuItem
            onClick={() => handleSetAccessLevel("FULL")}
            sx={{
              "&:hover": { backgroundColor: "#333333" },
              color:
                getCurrentAccessLevel(selectedFriendship) === "FULL"
                  ? "#3eb489"
                  : "white",
            }}
          >
            <ListItemIcon>
              <LockIcon
                sx={{
                  color:
                    getCurrentAccessLevel(selectedFriendship) === "FULL"
                      ? "#3eb489"
                      : "white",
                }}
              />
            </ListItemIcon>
            <ListItemText>Full Access</ListItemText>
          </MenuItem>
        </Menu>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
        <FilterPopover
          anchorEl={filterAnchor}
          open={Boolean(filterAnchor)}
          onClose={closeFilter}
          title={
            activeFilterContext === "suggestions"
              ? "Suggestion Filters"
              : activeFilterContext === "requests"
              ? "Request Filters"
              : activeFilterContext === "friends"
              ? "Friend Filters"
              : activeFilterContext === "shared"
              ? "Shared Filters"
              : "Filters"
          }
          options={
            activeFilterContext ? filterOptionSets[activeFilterContext] : []
          }
          selected={getSelectedFilters()}
          onApply={applySelectedFilters}
        />
      </div>
    </>
  );
};

export default Friends;
