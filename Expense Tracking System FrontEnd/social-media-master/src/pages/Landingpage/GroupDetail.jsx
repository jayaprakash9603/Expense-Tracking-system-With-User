import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Tabs, Tab, Box } from "@mui/material";
import SplitCalculatorModal from "../../components/SplitCalculatorModal";
import OverviewTabContent from "./OverviewTabContent";
import DebtSimplificationModal from "./DebtSimplificationModal";
import AddExpenseModal from "./AddExpenseModal";
import AddMemberModal from "./AddMemberModal";
import BulkAddMembersModal from "./BulkAddMembersModal";
import ExportOptionsModal from "./ExportOptionsModal";
import LeaveConfirmModal from "./LeaveConfirmModal";
import RecurringExpensesModal from "./RecurringExpensesModal";
import ExpenseTemplatesModal from "./ExpenseTemplatesModal";
import GroupAnalyticsModal from "./GroupAnalyticsModal";
import { useParams, useNavigate } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";
import ChatTabContent from "./ChatTabContent";
import ExpensesTabContent from "./ExpensesTabContent";
import MembersTabContent from "./MembersTabContent";
import InvitesTabContent from "./InvitesTabContent";
import {
  cancelInvitation,
  fetchSentInvitations,
  inviteFriendToGroup,
} from "../../Redux/Groups/groupsActions";
import SettingsTabContent from "./SettingsTabContent";
import ActivityTabContent from "./ActivityTabContent";
import InvitesModal from "./InvitesModal";
import BudgetTrackerModal from "./BudgetTrackerModal";
import {
  fetchFriendsNotInGroup,
  getGroupById,
} from "../../Redux/Groups/groupsActions";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchGroupChat,
  sendGroupChat,
  deleteChatMessage,
  editChatMessage,
} from "../../Redux/chats/chatActions";
import { replyToChat } from "../../Redux/chats/chatActions";

const GroupDetail = ({
  groupData: groupDataProp,
  expenses: expensesProp,
  chatMessages: chatMessagesProp,
  budgetTracker: budgetTrackerProp,
  expenseTemplates: expenseTemplatesProp,
  recurringExpenses: recurringExpensesProp,
  groupSettings: groupSettingsProp,
  availableFriends: availableFriendsProp,
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  const dispatch = useDispatch();
  // State management
  const [activeTab, setActiveTab] = useState("overview");

  const [groupData, setGroupData] = useState(groupDataProp || null);

  const { currentGroup, groupDataLoading, groupDataError } = useSelector(
    (state) => state.groups
  );

  useEffect(() => {
    if (id) {
      const response = dispatch(getGroupById(id));

      setGroupData(response);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (currentGroup) {
      setGroupData(currentGroup);
    }
  }, [currentGroup]);
  const [expenses, setExpenses] = useState(
    expensesProp || [
      {
        id: 1,
        title: "Hotel Booking",
        amount: 200,
        category: "Accommodation",
        description: "3-night stay at downtown hotel",
        date: "2024-01-20",
        paidBy: "John Doe",
        paidById: 1,
        splitBetween: [1, 2, 3, 4, 5],
        status: "settled",
      },
      {
        id: 2,
        title: "Group Dinner",
        amount: 85,
        category: "Food",
        description: "Italian restaurant",
        date: "2024-01-21",
        paidBy: "Jane Smith",
        paidById: 2,
        splitBetween: [1, 2, 3, 4],
        status: "pending",
      },
    ]
  );

  // Redux chat messages state
  const groupChatMessages = useSelector(
    (state) => state.chats?.groupChat || []
  );
  const [chatMessages, setChatMessages] = useState([]);

  // Fetch chat messages from API when group id changes
  useEffect(() => {
    if (id) {
      dispatch(fetchGroupChat(id));
    }
  }, [dispatch, id]);

  // Update local chatMessages when redux state changes
  useEffect(() => {
    if (Array.isArray(groupChatMessages)) {
      setChatMessages(groupChatMessages);
    }
  }, [groupChatMessages]);

  // Modal states
  const [showAddMember, setShowAddMember] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showBulkAddMembers, setShowBulkAddMembers] = useState(false);
  const [showBulkRemoveMembers, setShowBulkRemoveMembers] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [morePopoverOpen, setMorePopoverOpen] = useState(false);
  const moreBtnRef = useRef(null);

  // New modal states for additional features
  const [showSplitCalculator, setShowSplitCalculator] = useState(false);
  const [showRecurringExpenses, setShowRecurringExpenses] = useState(false);
  const [showBudgetTracker, setShowBudgetTracker] = useState(false);
  const [showExpenseTemplates, setShowExpenseTemplates] = useState(false);
  const [showGroupAnalytics, setShowGroupAnalytics] = useState(false);
  const [showDebtSimplification, setShowDebtSimplification] = useState(false);

  // Form states
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("MEMBER");
  const [bulkEmails, setBulkEmails] = useState("");
  const [selectedMembersToRemove, setSelectedMembersToRemove] = useState([]);
  const [chatMessage, setChatMessage] = useState("");
  const [newExpense, setNewExpense] = useState({
    title: "",
    amount: "",
    category: "Food",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  // New states for additional features
  const [splitCalculator, setSplitCalculator] = useState({
    totalAmount: "",
    splitType: "equal", // equal, percentage, custom
    participants: [],
    customSplits: {},
  });

  const [recurringExpenses, setRecurringExpenses] = useState(
    recurringExpensesProp || [
      {
        id: 1,
        title: "Monthly Rent Split",
        amount: 1200,
        frequency: "monthly",
        nextDue: "2024-02-01",
        participants: [1, 2, 3],
        isActive: true,
      },
    ]
  );

  const [budgetTracker, setBudgetTracker] = useState(
    budgetTrackerProp || {
      totalBudget: 1000,
      categories: {
        Food: { budget: 300, spent: 85 },
        Accommodation: { budget: 400, spent: 200 },
        Transportation: { budget: 200, spent: 0 },
        Entertainment: { budget: 100, spent: 0 },
      },
    }
  );

  const [expenseTemplates, setExpenseTemplates] = useState(
    expenseTemplatesProp || [
      {
        id: 1,
        name: "Restaurant Bill",
        category: "Food",
        defaultAmount: 50,
        description: "Group dining expense",
      },
      {
        id: 2,
        name: "Gas Fill-up",
        category: "Transportation",
        defaultAmount: 40,
        description: "Fuel expense",
      },
    ]
  );

  const [groupSettings, setGroupSettings] = useState(
    groupSettingsProp || {
      name: groupData?.name || "",
      description: groupData?.description || "",
      currency: "USD",
      allowMemberInvites: true,
      requireApprovalForExpenses: false,
      allowExpenseEditing: true,
      maxMembers: 50,
      timezone: "UTC",
      notificationsEnabled: true,
    }
  );

  const { sentInvitations, inviteFriends, inviteFriendsLoading } = useSelector(
    (state) => state.groups
  );

  const pendingSentInvitations = Array.isArray(sentInvitations)
    ? sentInvitations.filter((invite) => invite.status === "Pending")
    : [];

  useEffect(() => {
    if (id) {
      dispatch(fetchFriendsNotInGroup(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (id) {
      dispatch(fetchSentInvitations(id));
    }
  }, [dispatch, id]);

  const handleInviteFriend = async (
    friendId,
    role = "MEMBER",
    message = "group invite request"
  ) => {
    await dispatch(inviteFriendToGroup(id, friendId, role, message));
    // Refresh sent invitations after inviting
    dispatch(fetchSentInvitations(id));
  };

  const availableFriends = inviteFriends || [];

  const userId = 1; // Current user ID

  // Utility functions
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getUserInitials = (firstName, lastName, username) => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    return username ? username.substring(0, 2).toUpperCase() : "??";
  };

  // Render avatar: if avatar is missing or is plain text, show default icon only
  const renderAvatar = () => {
    const av = groupData?.avatar;
    const avatarStyle = {
      fontSize: 32,
      lineHeight: 1,
      display: "inline-block",
      transform: "translateY(-50px)",
      marginRight: 8,
    };

    // If avatar is not provided or is a string (any text/URL), show default emoji/icon
    if (!av || typeof av === "string") {
      return (
        <span aria-hidden="true" className="mr-4" style={avatarStyle}>
          {"👥"}
        </span>
      );
    }

    // If avatar is a React element (image/component), render it
    return (
      <span aria-hidden="true" className="mr-4" style={avatarStyle}>
        {av}
      </span>
    );
  };

  // Reusable header component for this file: renders back button, avatar, title/description
  const GroupHeader = ({
    groupData,
    navigate,
    formatDate,
    renderAvatar,
    children,
  }) => {
    return (
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/groups")}
            style={{
              color: "#00DAC6",
              backgroundColor: "#1b1b1b",
              borderRadius: "50%",
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "none",
              cursor: "pointer",
              marginRight: "8px",
              marginTop: "-90px",
            }}
            aria-label="Back"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="12" cy="12" r="12" fill="#1b1b1b" />
              <path
                d="M15 18L9 12L15 6"
                stroke="#00DAC6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex items-center">
            {renderAvatar()}
            <div>
              <h1 className="text-3xl font-bold text-white">
                {groupData?.name || "Group"}
              </h1>
              <p className="text-gray-400 mt-1">
                {groupData?.description || ""}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {groupData?.createdByUsername && groupData?.createdAt
                  ? `Created by ${groupData.createdByUsername} on ${formatDate(
                      groupData.createdAt
                    )}`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-2">{children}</div>
      </div>
    );
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "#ef4444";
      case "MODERATOR":
        return "#f59e0b";
      case "MEMBER":
        return "#14b8a6";
      case "VIEWER":
        return "#6b7280";
      default:
        return "#6b7280";
    }
  };

  const handleRemoveInvite = async (invite) => {
    if (invite.invitationId) {
      await dispatch(cancelInvitation(invite.invitationId));
      await dispatch(fetchFriendsNotInGroup(id));
    }
  };

  // Event handlers
  const handleSendMessage = (replyId) => {
    if (chatMessage.trim()) {
      const token = localStorage.getItem("token");
      if (replyId) {
        dispatch(replyToChat(replyId, chatMessage)).then(() => {
          dispatch(fetchGroupChat(id));
        });
      } else {
        dispatch(sendGroupChat(id, chatMessage, token)).then(() => {
          // Fetch latest group chat after sending
          dispatch(fetchGroupChat(id));
        });
      }

      setChatMessage("");
    }
  };

  const handleAddExpense = () => {
    if (newExpense.title && newExpense.amount) {
      const expense = {
        id: expenses.length + 1,
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        paidBy: "You",
        paidById: userId,
        splitBetween: groupData?.memberIds || [],
        status: "pending",
      };
      setExpenses([...expenses, expense]);
      setNewExpense({
        title: "",
        amount: "",
        category: "Food",
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
      setShowAddExpense(false);

      // Add chat message for expense
      const expenseMessage = {
        id: chatMessages.length + 1,
        userId: userId,
        username: "You",
        message: `Added expense: ${expense.title} - $${expense.amount}`,
        timestamp: new Date().toISOString(),
        type: "expense_added",
      };
      setChatMessages([...chatMessages, expenseMessage]);
    }
  };

  const handleAddSingleMember = () => {
    if (newMemberEmail.trim()) {
      console.log(
        `Adding member: ${newMemberEmail} with role: ${newMemberRole}`
      );
      setNewMemberEmail("");
      setNewMemberRole("MEMBER");
      setShowAddMember(false);
    }
  };

  const handleRoleChange = (memberId, newRole) => {
    console.log(`Changing role for member ${memberId} to ${newRole}`);
  };

  const handleRemoveMember = (memberId) => {
    console.log(`Removing member: ${memberId}`);
  };

  const handleBulkAddMembers = () => {
    const emails = bulkEmails.split("\n").filter((email) => email.trim());
    console.log("Adding members:", emails);
    setBulkEmails("");
    setShowBulkAddMembers(false);
  };

  const handleBulkRemoveMembers = () => {
    console.log("Removing members:", selectedMembersToRemove);
    setSelectedMembersToRemove([]);
    setShowBulkRemoveMembers(false);
  };

  const handleExportData = (format) => {
    console.log(`Exporting group data as ${format}`);
    setShowExportOptions(false);
  };

  const handleArchiveGroup = () => {
    console.log("Archiving group");
    setShowArchiveConfirm(false);
  };

  const handleLeaveGroup = () => {
    console.log("Leaving group");
    navigate("/groups");
  };

  const handleSaveSettings = () => {
    console.log("Saving group settings:", groupSettings);
    setShowGroupSettings(false);
  };

  // New handlers for additional features
  const handleCalculateSplit = () => {
    const amount = parseFloat(splitCalculator.totalAmount);
    if (!amount || splitCalculator.participants.length === 0) return;

    let splits = {};
    if (splitCalculator.splitType === "equal") {
      const perPerson = amount / splitCalculator.participants.length;
      splitCalculator.participants.forEach((id) => {
        splits[id] = perPerson.toFixed(2);
      });
    }
    console.log("Split calculation:", splits);
  };

  const handleCreateRecurringExpense = (expense) => {
    const newRecurring = {
      id: recurringExpenses.length + 1,
      ...expense,
      isActive: true,
    };
    setRecurringExpenses([...recurringExpenses, newRecurring]);
  };

  const handleUseTemplate = (template) => {
    setNewExpense({
      title: template.name,
      amount: template.defaultAmount.toString(),
      category: template.category,
      description: template.description,
      date: new Date().toISOString().split("T")[0],
    });
    setShowExpenseTemplates(false);
    setShowAddExpense(true);
  };

  const renderOverviewTab = () => (
    <OverviewTabContent
      groupData={groupData}
      expenses={expenses}
      chatMessages={chatMessages}
      setShowSplitCalculator={setShowSplitCalculator}
      setShowBudgetTracker={setShowBudgetTracker}
      setShowExpenseTemplates={setShowExpenseTemplates}
      setShowRecurringExpenses={setShowRecurringExpenses}
      setShowGroupAnalytics={setShowGroupAnalytics}
      setShowDebtSimplification={setShowDebtSimplification}
      formatTime={formatTime}
    />
  );

  const renderMembersTab = () => (
    <MembersTabContent
      groupData={groupData}
      setShowAddMember={setShowAddMember}
      setShowBulkAddMembers={setShowBulkAddMembers}
      setShowBulkRemoveMembers={setShowBulkRemoveMembers}
      getUserInitials={getUserInitials}
      formatDate={formatDate}
      getRoleColor={getRoleColor}
      handleRoleChange={handleRoleChange}
      handleRemoveMember={handleRemoveMember}
      userId={userId}
    />
  );

  const renderExpensesTab = () => (
    <ExpensesTabContent
      groupData={groupData}
      setShowAddExpense={setShowAddExpense}
      setShowExpenseTemplates={setShowExpenseTemplates}
      setShowSplitCalculator={setShowSplitCalculator}
      expenses={expenses}
      formatDate={formatDate}
    />
  );

  // Handler for forwarding a message
  const handleForwardMessage = (message) => {
    const newMessage = {
      ...message,
      id: chatMessages.length + 1,
      content: `Forwarded: ${message.content}`,
      isForwarded: true,
      senderId: userId,
      timestamp: new Date().toISOString(),
    };
    setChatMessages([...chatMessages, newMessage]);
  };

  // Handler for pinning a message
  const handlePinMessage = (messageId) => {
    setChatMessages(
      chatMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isPinned: true } : msg
      )
    );
  };

  // Handler for unpinning a message
  const handleUnpinMessage = (messageId) => {
    setChatMessages(
      chatMessages.map((msg) =>
        msg.id === messageId ? { ...msg, isPinned: false } : msg
      )
    );
  };

  // Handler for editing a message
  const handleEditMessage = (messageId, newContent) => {
    dispatch(editChatMessage(messageId, newContent));
    setChatMessages(
      chatMessages.map((msg) =>
        msg.id === messageId
          ? { ...msg, content: newContent, isEdited: true }
          : msg
      )
    );
  };

  // Handler for deleting a message
  const handleDeleteMessage = (messageId) => {
    dispatch(deleteChatMessage(messageId));
    setChatMessages(chatMessages.filter((msg) => msg.id !== messageId));
  };

  const renderChatTab = () => (
    <ChatTabContent
      chatMessages={chatMessages}
      chatEndRef={chatEndRef}
      chatMessage={chatMessage}
      setChatMessage={setChatMessage}
      handleSendMessage={handleSendMessage}
      userId={userId}
      formatTime={formatTime}
      onForwardMessage={handleForwardMessage}
      onPinMessage={handlePinMessage}
      onUnpinMessage={handleUnpinMessage}
      onDeleteMessage={handleDeleteMessage}
      onEditMessage={handleEditMessage}
    />
  );

  const renderInvitesTab = () => (
    <InvitesTabContent
      availableFriends={availableFriends}
      groupId={id}
      inviteFriendToGroup={(groupId, userId, role, message) =>
        dispatch(inviteFriendToGroup(groupId, userId, role, message))
      }
      setShowInviteModal={setShowInviteModal}
      refreshSentInvitations={() => dispatch(fetchSentInvitations(id))}
      fetchFriendsNotInGroup={() => dispatch(fetchFriendsNotInGroup(id))}
    />
  );

  const renderSettingsTab = () => (
    <SettingsTabContent
      groupSettings={groupSettings}
      setGroupSettings={setGroupSettings}
      handleSaveSettings={handleSaveSettings}
    />
  );

  const renderActivityTab = () => <ActivityTabContent />;

  // Scroll to bottom when switching to chat tab
  useEffect(() => {
    if (activeTab === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab, chatMessages]);

  // Close the more popover on outside click
  useEffect(() => {
    if (!morePopoverOpen) return;
    function onDocClick(e) {
      const pop = document.getElementById("group-more-popover");
      if (
        moreBtnRef.current &&
        !moreBtnRef.current.contains(e.target) &&
        (!pop || !pop.contains(e.target))
      ) {
        setMorePopoverOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [morePopoverOpen]);

  // Example: Calculate settlements and summary for debt simplification modal
  const debtSettlements = [
    { from: "John", to: "Jane", amount: 25.0 },
    { from: "Bob", to: "Alice", amount: 15.5 },
    { from: "Charlie", to: "John", amount: 30.25 },
  ];
  const debtSummary = {
    totalTransactions: debtSettlements.length,
    totalAmount: debtSettlements
      .reduce((sum, s) => sum + s.amount, 0)
      .toFixed(2),
    originalTransactions: 8,
  };
  return (
    <div
      className="shadow-2xl rounded-2xl flex flex-col"
      style={{
        backgroundColor: "#0b0b0b",
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        marginTop: "50px",
        marginRight: "20px",
      }}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-700 flex-shrink-0">
        <GroupHeader
          groupData={groupData}
          navigate={navigate}
          formatDate={formatDate}
          renderAvatar={renderAvatar}
        >
          <div style={{ position: "relative" }}>
            <button
              ref={moreBtnRef}
              onClick={() => setMorePopoverOpen((v) => !v)}
              aria-label="More"
              style={{
                background: "#1b1b1b",
                border: "none",
                color: "#cfd8e3",
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* vertical three dots centered */}
                <circle cx="12" cy="5" r="1.5" fill="#cfd8e3" />
                <circle cx="12" cy="12" r="1.5" fill="#cfd8e3" />
                <circle cx="12" cy="19" r="1.5" fill="#cfd8e3" />
              </svg>
            </button>
          </div>
        </GroupHeader>

        {/* MUI Tabs Navigation */}
        <Box
          sx={{
            width: "100%",
            bgcolor: "#2a2a2a",
            borderRadius: 2,
            mt: 0.5,
            mb: 1,
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            variant="fullWidth"
            centered
            textColor="secondary"
            indicatorColor="secondary"
            sx={{
              "& .MuiTab-root": {
                color: "#cfd8e3",
                fontWeight: 500,
                fontSize: "1rem",
                borderRadius: 2,
                py: 2,
                px: 3,
                transition: "all 0.3s",
              },
              "& .Mui-selected": {
                color: "#14b8a6",
                backgroundColor: "#393939",
                boxShadow: 2,
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#14b8a6",
                height: 4,
                borderRadius: 2,
              },
            }}
          >
            <Tab
              icon={<span>📊</span>}
              iconPosition="start"
              label="Overview"
              value="overview"
            />
            <Tab
              icon={<span>👥</span>}
              iconPosition="start"
              label="Members"
              value="members"
            />
            <Tab
              icon={<span>💰</span>}
              iconPosition="start"
              label="Expenses"
              value="expenses"
            />
            <Tab
              icon={<span>💬</span>}
              iconPosition="start"
              label="Chat"
              value="chat"
            />
            <Tab
              icon={<span>📧</span>}
              iconPosition="start"
              label="Invites"
              value="invites"
            />
            <Tab
              icon={<span>⚙️</span>}
              iconPosition="start"
              label="Settings"
              value="settings"
            />
            <Tab
              icon={<span>📋</span>}
              iconPosition="start"
              label="Activity"
              value="activity"
            />
          </Tabs>
        </Box>
      </div>

      {/* More popover (Export / Leave Group) */}
      {morePopoverOpen &&
        moreBtnRef.current &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top:
                moreBtnRef.current.getBoundingClientRect().bottom +
                window.scrollY +
                6,
              left:
                moreBtnRef.current.getBoundingClientRect().left +
                window.scrollX -
                80,
              background: "#1b1b1b",
              border: "1px solid #333",
              borderRadius: 8,
              boxShadow: "0 4px 18px rgba(0,0,0,0.3)",
              zIndex: 1200,
              minWidth: 160,
              padding: 6,
            }}
            id="group-more-popover"
          >
            <button
              onClick={() => {
                setShowExportOptions(true);
                setMorePopoverOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: "transparent",
                color: "#5b7fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Export
            </button>
            <button
              onClick={() => {
                setShowLeaveConfirm(true);
                setMorePopoverOpen(false);
              }}
              style={{
                display: "block",
                width: "100%",
                textAlign: "left",
                padding: "8px 10px",
                background: "transparent",
                color: "#ff4d4f",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Leave Group
            </button>
          </div>,
          document.body
        )}

      {/* Content Area */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ padding: "18px 24px 8px 24px" }}
      >
        <SwitchTransition>
          <CSSTransition
            key={activeTab}
            timeout={200}
            classNames="fade"
            unmountOnExit
          >
            <div>
              {activeTab === "overview" && renderOverviewTab()}
              {activeTab === "members" && renderMembersTab()}
              {activeTab === "expenses" && renderExpensesTab()}
              {activeTab === "chat" && renderChatTab()}
              {activeTab === "invites" && renderInvitesTab()}
              {activeTab === "settings" && renderSettingsTab()}
              {activeTab === "activity" && renderActivityTab()}
            </div>
          </CSSTransition>
        </SwitchTransition>
      </div>

      {/* Split Calculator Modal */}
      <SplitCalculatorModal
        show={showSplitCalculator}
        onClose={() => setShowSplitCalculator(false)}
        splitCalculator={splitCalculator}
        setSplitCalculator={setSplitCalculator}
        groupData={groupData}
        handleCalculateSplit={handleCalculateSplit}
      />

      {/* Budget Tracker Modal */}
      {showBudgetTracker && (
        <BudgetTrackerModal
          show={showBudgetTracker}
          onClose={() => setShowBudgetTracker(false)}
          budgetTracker={budgetTracker}
        />
      )}

      <style>{`
        #group-more-popover button {
          transition: background 150ms ease, color 150ms ease;
        }
        #group-more-popover button:hover {
          background: #1b1b1b;
          color: #ffffff !important;
        }
      `}</style>

      {/* Expense Templates Modal */}
      {showExpenseTemplates && (
        <ExpenseTemplatesModal
          templates={expenseTemplates}
          onClose={() => setShowExpenseTemplates(false)}
          onUseTemplate={handleUseTemplate}
        />
      )}

      {/* Recurring Expenses Modal */}
      {showRecurringExpenses && (
        <RecurringExpensesModal
          expenses={recurringExpenses}
          onClose={() => setShowRecurringExpenses(false)}
        />
      )}

      {/* Group Analytics Modal */}
      {showGroupAnalytics && (
        <GroupAnalyticsModal
          budgetTracker={budgetTracker}
          groupData={groupData}
          expenses={expenses}
          onClose={() => setShowGroupAnalytics(false)}
        />
      )}

      {/* Debt Simplification Modal */}
      {showDebtSimplification && (
        <DebtSimplificationModal
          onClose={() => setShowDebtSimplification(false)}
          settlements={debtSettlements}
          summary={debtSummary}
        />
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <AddExpenseModal
          newExpense={newExpense}
          setNewExpense={setNewExpense}
          onAdd={handleAddExpense}
          onClose={() => setShowAddExpense(false)}
        />
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <AddMemberModal
          newMemberEmail={newMemberEmail}
          setNewMemberEmail={setNewMemberEmail}
          newMemberRole={newMemberRole}
          setNewMemberRole={setNewMemberRole}
          onAdd={handleAddSingleMember}
          onClose={() => setShowAddMember(false)}
        />
      )}

      {/* Bulk Add Members Modal */}
      {showBulkAddMembers && (
        <BulkAddMembersModal
          bulkEmails={bulkEmails}
          setBulkEmails={setBulkEmails}
          onAddAll={handleBulkAddMembers}
          onClose={() => setShowBulkAddMembers(false)}
        />
      )}

      {/* Export Options Modal */}
      {showExportOptions && (
        <ExportOptionsModal
          onExport={handleExportData}
          onClose={() => setShowExportOptions(false)}
        />
      )}

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <LeaveConfirmModal
          groupName={groupData?.name || ""}
          onLeave={handleLeaveGroup}
          onClose={() => setShowLeaveConfirm(false)}
        />
      )}

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <InvitesModal
          invites={pendingSentInvitations}
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteFriend}
          onRemoveInvite={handleRemoveInvite}
        />
      )}
    </div>
  );
};

export default GroupDetail;
