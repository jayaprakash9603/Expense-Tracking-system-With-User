import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CSSTransition, SwitchTransition } from "react-transition-group";

const GroupDetail = () => {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const chatEndRef = useRef(null);

  // State management
  const [activeTab, setActiveTab] = useState("overview");

  const [groupData, setGroupData] = useState({
    id: 1,
    name: "Weekend Trip",
    description: "Our amazing weekend getaway expenses",
    createdBy: 1,
    createdByUsername: "John Doe",
    createdAt: "2024-01-15T10:00:00Z",
    totalMembers: 5,
    memberIds: [1, 2, 3, 4, 5],
    members: [
      {
        userId: 1,
        username: "john_doe",
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
        role: "ADMIN",
        joinedAt: "2024-01-15T10:00:00Z",
        addedBy: 1,
      },
      {
        userId: 2,
        username: "jane_smith",
        firstName: "Jane",
        lastName: "Smith",
        email: "jane@example.com",
        role: "MODERATOR",
        joinedAt: "2024-01-15T11:00:00Z",
        addedBy: 1,
      },
      {
        userId: 3,
        username: "bob_wilson",
        firstName: "Bob",
        lastName: "Wilson",
        email: "bob@example.com",
        role: "MEMBER",
        joinedAt: "2024-01-15T12:00:00Z",
        addedBy: 1,
      },
      {
        userId: 4,
        username: "alice_brown",
        firstName: "Alice",
        lastName: "Brown",
        email: "alice@example.com",
        role: "MEMBER",
        joinedAt: "2024-01-15T13:00:00Z",
        addedBy: 2,
      },
      {
        userId: 5,
        username: "charlie_davis",
        firstName: "Charlie",
        lastName: "Davis",
        email: "charlie@example.com",
        role: "VIEWER",
        joinedAt: "2024-01-15T14:00:00Z",
        addedBy: 1,
      },
    ],
    currentUserPermissions: {
      canEditSettings: true,
      canManageMembers: true,
      canAddExpenses: true,
      canPromoteMembers: true,
      canDeleteGroup: true,
    },
  });

  const [expenses, setExpenses] = useState([
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
  ]);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      userId: 2,
      username: "Jane Smith",
      message: "Hey everyone! Looking forward to our trip!",
      timestamp: "2024-01-15T15:30:00Z",
      type: "message",
    },
    {
      id: 2,
      userId: 1,
      username: "John Doe",
      message: "Added expense: Hotel Booking - $200",
      timestamp: "2024-01-15T16:00:00Z",
      type: "expense_added",
    },
  ]);

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

  const [recurringExpenses, setRecurringExpenses] = useState([
    {
      id: 1,
      title: "Monthly Rent Split",
      amount: 1200,
      frequency: "monthly",
      nextDue: "2024-02-01",
      participants: [1, 2, 3],
      isActive: true,
    },
  ]);

  const [budgetTracker, setBudgetTracker] = useState({
    totalBudget: 1000,
    categories: {
      Food: { budget: 300, spent: 85 },
      Accommodation: { budget: 400, spent: 200 },
      Transportation: { budget: 200, spent: 0 },
      Entertainment: { budget: 100, spent: 0 },
    },
  });

  const [expenseTemplates, setExpenseTemplates] = useState([
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
  ]);

  const [groupSettings, setGroupSettings] = useState({
    name: groupData.name,
    description: groupData.description,
    currency: "USD",
    allowMemberInvites: true,
    requireApprovalForExpenses: false,
    allowExpenseEditing: true,
    maxMembers: 50,
    timezone: "UTC",
    notificationsEnabled: true,
  });

  const [availableFriends] = useState([
    { id: 6, name: "Mike Johnson", email: "mike@example.com" },
    { id: 7, name: "Sarah Wilson", email: "sarah@example.com" },
    { id: 8, name: "Tom Anderson", email: "tom@example.com" },
  ]);

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

  // Event handlers
  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      const newMessage = {
        id: chatMessages.length + 1,
        userId: userId,
        username: "You",
        message: chatMessage,
        timestamp: new Date().toISOString(),
        type: "message",
      };
      setChatMessages([...chatMessages, newMessage]);
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
        splitBetween: groupData.memberIds,
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

  const handleInviteFriend = (friendId) => {
    console.log(`Inviting friend: ${friendId}`);
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
    <div className="space-y-6">
      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div style={{ background: "#1b1b1b" }} className="p-4 rounded-xl">
          <h3 className="text-gray-400 text-sm">Total Members</h3>
          <p className="text-2xl font-bold text-white">
            {groupData.totalMembers}
          </p>
        </div>
        <div style={{ background: "#1b1b1b" }} className="p-4 rounded-xl">
          <h3 className="text-gray-400 text-sm">Total Expenses</h3>
          <p className="text-2xl font-bold text-white">{expenses.length}</p>
        </div>
        <div style={{ background: "#1b1b1b" }} className="p-4 rounded-xl">
          <h3 className="text-gray-400 text-sm">Total Amount</h3>
          <p className="text-2xl font-bold text-white">
            ${expenses.reduce((sum, exp) => sum + exp.amount, 0)}
          </p>
        </div>
        <div style={{ background: "#1b1b1b" }} className="p-4 rounded-xl">
          <h3 className="text-gray-400 text-sm">Your Balance</h3>
          <p className="text-2xl font-bold text-teal-400">$60</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button
            onClick={() => setShowSplitCalculator(true)}
            className="bg-blue-500 text-white p-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🧮</div>
              <div className="font-semibold">Split Calculator</div>
            </div>
          </button>
          <button
            onClick={() => setShowBudgetTracker(true)}
            className="bg-green-500 text-white p-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold">Budget Tracker</div>
            </div>
          </button>
          <button
            onClick={() => setShowExpenseTemplates(true)}
            className="bg-purple-500 text-white p-4 rounded-lg hover:bg-purple-600 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📋</div>
              <div className="font-semibold">Templates</div>
            </div>
          </button>
          <button
            onClick={() => setShowRecurringExpenses(true)}
            className="bg-orange-500 text-white p-4 rounded-lg hover:bg-orange-600 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">🔄</div>
              <div className="font-semibold">Recurring</div>
            </div>
          </button>
          <button
            onClick={() => setShowGroupAnalytics(true)}
            className="bg-pink-500 text-white p-4 rounded-lg hover:bg-pink-600 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold">Analytics</div>
            </div>
          </button>
          <button
            onClick={() => setShowDebtSimplification(true)}
            className="bg-indigo-500 text-white p-4 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-2">⚖️</div>
              <div className="font-semibold">Debt Simplify</div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {chatMessages.slice(-5).map((message) => (
            <div key={message.id} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {message.username[0]}
              </div>
              <div className="flex-1">
                <p className="text-gray-300">
                  <span className="font-semibold text-white">
                    {message.username}
                  </span>
                  {message.type === "expense_added"
                    ? " added an expense: "
                    : ": "}
                  {message.message}
                </p>
                <p className="text-gray-500 text-sm">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMembersTab = () => (
    <div className="space-y-6">
      {/* Members List */}
      <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">
            Members ({groupData.totalMembers})
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowAddMember(true)}
              className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
            >
              Add Member
            </button>
            {groupData.currentUserPermissions.canManageMembers && (
              <>
                <button
                  onClick={() => setShowBulkAddMembers(true)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Bulk Add
                </button>
                <button
                  onClick={() => setShowBulkRemoveMembers(true)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Bulk Remove
                </button>
              </>
            )}
          </div>
        </div>

        {/* Increased height for members container */}
        <div
          className="max-h-[450px] overflow-y-auto space-y-3 pr-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#14b8a6 #2a2a2a",
          }}
        >
          {groupData.members.map((member) => (
            <div
              key={member.userId}
              style={{ background: "#2a2a2a" }}
              className="flex items-center justify-between p-4 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-teal-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {getUserInitials(
                    member.firstName,
                    member.lastName,
                    member.username
                  )}
                </div>
                <div>
                  <h4 className="text-white font-semibold">
                    {member.firstName && member.lastName
                      ? `${member.firstName} ${member.lastName}`
                      : member.username || "Unknown User"}
                  </h4>
                  <p className="text-gray-400 text-sm">{member.email}</p>
                  <p className="text-gray-500 text-xs">
                    Joined {formatDate(member.joinedAt)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <span
                  className="px-3 py-1 rounded-full text-sm font-semibold"
                  style={{
                    backgroundColor: `${getRoleColor(member.role)}20`,
                    color: getRoleColor(member.role),
                  }}
                >
                  {member.role}
                </span>

                {groupData.currentUserPermissions.canPromoteMembers &&
                  member.userId !== userId && (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        handleRoleChange(member.userId, e.target.value)
                      }
                      className="bg-gray-600 text-white px-3 py-1 rounded border-none outline-none"
                    >
                      <option value="VIEWER">Viewer</option>
                      <option value="MEMBER">Member</option>
                      <option value="MODERATOR">Moderator</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  )}

                {groupData.currentUserPermissions.canManageMembers &&
                  member.userId !== userId && (
                    <button
                      onClick={() => handleRemoveMember(member.userId)}
                      className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition-colors"
                    >
                      Remove
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderExpensesTab = () => (
    <div className="space-y-6">
      {/* Add Expense Button */}
      {groupData.currentUserPermissions.canAddExpenses && (
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddExpense(true)}
            className="bg-teal-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-teal-600 transition-colors"
          >
            + Add Expense
          </button>
          <button
            onClick={() => setShowExpenseTemplates(true)}
            className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors"
          >
            📋 Use Template
          </button>
          <button
            onClick={() => setShowSplitCalculator(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors"
          >
            🧮 Split Calculator
          </button>
        </div>
      )}

      {/* Expenses List */}
      <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Expenses</h3>
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              style={{ background: "#2a2a2a" }}
              className="flex items-center justify-between p-4 rounded-lg"
            >
              <div className="flex-1">
                <h4 className="text-white font-semibold">{expense.title}</h4>
                <p className="text-gray-400 text-sm">{expense.description}</p>
                <p className="text-gray-500 text-xs">
                  Paid by {expense.paidBy} on {formatDate(expense.date)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">
                  ${expense.amount}
                </p>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    expense.status === "settled"
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-black"
                  }`}
                >
                  {expense.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderChatTab = () => (
    <div
      style={{ background: "#1b1b1b", height: "560px" }}
      className="rounded-xl flex flex-col"
    >
      {/* Chat Header - Reduced padding */}
      <div className="p-2 border-b border-gray-700 flex-shrink-0">
        <h3 className="text-lg font-semibold text-white">Group Chat</h3>
      </div>

      {/* Chat Messages - Scrollable container that takes remaining space */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "#14b8a6 #2a2a2a",
        }}
      >
        {chatMessages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.userId === userId ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.userId === userId
                  ? "bg-teal-500 text-white"
                  : message.type === "expense_added"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-white"
              }`}
            >
              {message.userId !== userId && (
                <p className="text-xs opacity-75 mb-1">{message.username}</p>
              )}
              <p>{message.message}</p>
              <p className="text-xs opacity-75 mt-1">
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Chat Input - Sticky at bottom */}
      <div className="p-4 border-t border-gray-700 flex-shrink-0">
        <div className="flex space-x-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
          />
          <button
            onClick={handleSendMessage}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  const renderInvitesTab = () => (
    <div className="space-y-6">
      <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-white">Invite Friends</h3>
          <button
            onClick={() => setShowInviteModal(true)}
            className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
          >
            Send Invites
          </button>
        </div>

        {/* Add scrollable container for invites */}
        <div
          className="max-h-[450px] overflow-y-auto space-y-3 pr-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#14b8a6 #2a2a2a",
          }}
        >
          {availableFriends.map((friend) => (
            <div
              key={friend.id}
              style={{ background: "#2a2a2a" }}
              className="flex items-center justify-between p-4 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {friend.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h4 className="text-white font-semibold">{friend.name}</h4>
                  <p className="text-gray-400 text-sm">{friend.email}</p>
                </div>
              </div>
              <button
                onClick={() => handleInviteFriend(friend.id)}
                className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Invite
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4">
          Group Settings
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Group Name
            </label>
            <input
              type="text"
              value={groupSettings.name}
              onChange={(e) =>
                setGroupSettings({ ...groupSettings, name: e.target.value })
              }
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              value={groupSettings.description}
              onChange={(e) =>
                setGroupSettings({
                  ...groupSettings,
                  description: e.target.value,
                })
              }
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none h-20"
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Currency
            </label>
            <select
              value={groupSettings.currency}
              onChange={(e) =>
                setGroupSettings({ ...groupSettings, currency: e.target.value })
              }
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="INR">INR (₹)</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="allowInvites"
              checked={groupSettings.allowMemberInvites}
              onChange={(e) =>
                setGroupSettings({
                  ...groupSettings,
                  allowMemberInvites: e.target.checked,
                })
              }
              className="w-4 h-4"
            />
            <label htmlFor="allowInvites" className="text-gray-300">
              Allow members to invite others
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="requireApproval"
              checked={groupSettings.requireApprovalForExpenses}
              onChange={(e) =>
                setGroupSettings({
                  ...groupSettings,
                  requireApprovalForExpenses: e.target.checked,
                })
              }
              className="w-4 h-4"
            />
            <label htmlFor="requireApproval" className="text-gray-300">
              Require approval for expenses
            </label>
          </div>

          <button
            onClick={handleSaveSettings}
            className="bg-teal-500 text-white px-6 py-2 rounded-lg hover:bg-teal-600 transition-colors"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  const renderActivityTab = () => (
    <div className="space-y-6">
      <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Activity Log</h3>

        {/* Add scrollable container for activity logs */}
        <div
          className="max-h-[450px] overflow-y-auto space-y-3 pr-2"
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#14b8a6 #2a2a2a",
          }}
        >
          {[
            { type: "member_joined", user: "Alice", time: "2 hours ago" },
            {
              type: "expense_added",
              user: "Bob",
              expense: "Dinner",
              amount: "$45",
              time: "4 hours ago",
            },
            { type: "member_left", user: "Carol", time: "1 day ago" },
            { type: "group_created", user: "You", time: "3 days ago" },
            { type: "member_joined", user: "David", time: "5 days ago" },
            {
              type: "expense_added",
              user: "Alice",
              expense: "Gas",
              amount: "$30",
              time: "1 week ago",
            },
            { type: "member_joined", user: "Eve", time: "1 week ago" },
            {
              type: "expense_added",
              user: "Charlie",
              expense: "Groceries",
              amount: "$75",
              time: "2 weeks ago",
            },
            { type: "member_left", user: "Frank", time: "2 weeks ago" },
            {
              type: "expense_added",
              user: "Bob",
              expense: "Hotel",
              amount: "$200",
              time: "3 weeks ago",
            },
          ].map((activity, index) => (
            <div
              key={index}
              style={{ background: "#2a2a2a" }}
              className="p-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">
                    {activity.type === "member_joined" &&
                      `${activity.user} joined the group`}
                    {activity.type === "expense_added" &&
                      `${activity.user} added expense: ${activity.expense} (${activity.amount})`}
                    {activity.type === "member_left" &&
                      `${activity.user} left the group`}
                    {activity.type === "group_created" &&
                      `${activity.user} created the group`}
                  </p>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Scroll to bottom when switching to chat tab
  useEffect(() => {
    if (activeTab === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeTab, chatMessages]);
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
            <div>
              <h1 className="text-3xl font-bold text-white">
                {groupData.name}
              </h1>
              <p className="text-gray-400 mt-1">{groupData.description}</p>
              <p className="text-gray-500 text-sm mt-1">
                Created by {groupData.createdByUsername} on{" "}
                {formatDate(groupData.createdAt)}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowExportOptions(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Export
            </button>
            <button
              onClick={() => setShowGroupSettings(true)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Settings
            </button>
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Leave Group
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div
          className="flex space-x-1 p-1 rounded-xl"
          style={{ backgroundColor: "#2a2a2a" }}
        >
          {[
            { id: "overview", label: "Overview", icon: "📊" },
            { id: "members", label: "Members", icon: "👥" },
            { id: "expenses", label: "Expenses", icon: "💰" },
            { id: "chat", label: "Chat", icon: "💬" },
            { id: "invites", label: "Invites", icon: "📧" },
            { id: "settings", label: "Settings", icon: "⚙️" },
            { id: "activity", label: "Activity", icon: "📋" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-300 ${
                activeTab === tab.id
                  ? "shadow-md"
                  : "text-gray-300 hover:text-white"
              }`}
              style={
                activeTab === tab.id
                  ? {
                      backgroundColor: "#393939",
                      color: "#14b8a6",
                    }
                  : {
                      backgroundColor: "transparent",
                      color: "#cfd8e3",
                    }
              }
              onMouseEnter={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = "#393939";
                }
              }}
              onMouseLeave={(e) => {
                if (activeTab !== tab.id) {
                  e.target.style.backgroundColor = "transparent";
                }
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6">
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
      {showSplitCalculator && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              💰 Split Calculator
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Total Amount
                </label>
                <input
                  type="number"
                  value={splitCalculator.totalAmount}
                  onChange={(e) =>
                    setSplitCalculator({
                      ...splitCalculator,
                      totalAmount: e.target.value,
                    })
                  }
                  placeholder="Enter amount"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Split Type
                </label>
                <select
                  value={splitCalculator.splitType}
                  onChange={(e) =>
                    setSplitCalculator({
                      ...splitCalculator,
                      splitType: e.target.value,
                    })
                  }
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
                >
                  <option value="equal">Equal Split</option>
                  <option value="percentage">Percentage Split</option>
                  <option value="custom">Custom Amounts</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Select Participants
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {groupData.members.map((member) => (
                    <label
                      key={member.userId}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={splitCalculator.participants.includes(
                          member.userId
                        )}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSplitCalculator({
                              ...splitCalculator,
                              participants: [
                                ...splitCalculator.participants,
                                member.userId,
                              ],
                            });
                          } else {
                            setSplitCalculator({
                              ...splitCalculator,
                              participants: splitCalculator.participants.filter(
                                (id) => id !== member.userId
                              ),
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-white">
                        {member.firstName} {member.lastName}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {splitCalculator.totalAmount &&
                splitCalculator.participants.length > 0 && (
                  <div className="bg-gray-800 p-4 rounded-lg">
                    <h4 className="text-white font-semibold mb-2">
                      Split Result:
                    </h4>
                    <p className="text-teal-400">
                      Each person pays: $
                      {(
                        parseFloat(splitCalculator.totalAmount) /
                        splitCalculator.participants.length
                      ).toFixed(2)}
                    </p>
                  </div>
                )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCalculateSplit}
                className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Calculate
              </button>
              <button
                onClick={() => setShowSplitCalculator(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Budget Tracker Modal */}
      {showBudgetTracker && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-lg"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              📊 Budget Tracker
            </h3>

            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-semibold">Total Budget</span>
                  <span className="text-teal-400 font-bold">
                    ${budgetTracker.totalBudget}
                  </span>
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        (Object.values(budgetTracker.categories).reduce(
                          (sum, cat) => sum + cat.spent,
                          0
                        ) /
                          budgetTracker.totalBudget) *
                          100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  Spent: $
                  {Object.values(budgetTracker.categories).reduce(
                    (sum, cat) => sum + cat.spent,
                    0
                  )}{" "}
                  / ${budgetTracker.totalBudget}
                </p>
              </div>

              {Object.entries(budgetTracker.categories).map(
                ([category, data]) => (
                  <div key={category} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white font-semibold">
                        {category}
                      </span>
                      <span className="text-gray-300">
                        ${data.spent} / ${data.budget}
                      </span>
                    </div>
                    <div className="w-full bg-gray-600 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          data.spent > data.budget
                            ? "bg-red-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${Math.min(
                            (data.spent / data.budget) * 100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-gray-400 text-sm mt-1">
                      {data.spent > data.budget
                        ? `Over budget by $${(data.spent - data.budget).toFixed(
                            2
                          )}`
                        : `Remaining: $${(data.budget - data.spent).toFixed(
                            2
                          )}`}
                    </p>
                  </div>
                )
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBudgetTracker(false)}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Expense Templates Modal */}
      {showExpenseTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              📋 Expense Templates
            </h3>

            <div className="space-y-3">
              {expenseTemplates.map((template) => (
                <div
                  key={template.id}
                  className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => handleUseTemplate(template)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-semibold">
                        {template.name}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {template.description}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {template.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-teal-400 font-bold">
                        ${template.defaultAmount}
                      </p>
                      <button className="text-teal-500 text-sm hover:text-teal-400">
                        Use Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowExpenseTemplates(false)}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recurring Expenses Modal */}
      {showRecurringExpenses && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-lg"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              🔄 Recurring Expenses
            </h3>

            <div className="space-y-3 mb-4">
              {recurringExpenses.map((expense) => (
                <div key={expense.id} className="bg-gray-800 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-white font-semibold">
                        {expense.title}
                      </h4>
                      <p className="text-gray-400 text-sm">
                        {expense.frequency} • Next due: {expense.nextDue}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {expense.participants.length} participants
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-teal-400 font-bold">
                        ${expense.amount}
                      </p>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          expense.isActive
                            ? "bg-green-500 text-white"
                            : "bg-gray-500 text-white"
                        }`}
                      >
                        {expense.isActive ? "Active" : "Paused"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                // Add new recurring expense logic
                console.log("Add new recurring expense");
              }}
              className="w-full bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors mb-3"
            >
              + Add Recurring Expense
            </button>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRecurringExpenses(false)}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Group Analytics Modal */}
      {showGroupAnalytics && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-2xl"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              📈 Group Analytics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">
                  Spending by Category
                </h4>
                <div className="space-y-2">
                  {Object.entries(budgetTracker.categories).map(
                    ([category, data]) => (
                      <div key={category} className="flex justify-between">
                        <span className="text-gray-300">{category}</span>
                        <span className="text-teal-400">${data.spent}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Top Spenders</h4>
                <div className="space-y-2">
                  {groupData.members.slice(0, 3).map((member, index) => (
                    <div key={member.userId} className="flex justify-between">
                      <span className="text-gray-300">
                        {member.firstName} {member.lastName}
                      </span>
                      <span className="text-teal-400">
                        ${Math.floor(Math.random() * 200) + 50}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">Monthly Trend</h4>
                <div className="text-center">
                  <p className="text-3xl font-bold text-teal-400">+15%</p>
                  <p className="text-gray-400 text-sm">vs last month</p>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-2">
                  Average per Person
                </h4>
                <div className="text-center">
                  <p className="text-3xl font-bold text-teal-400">
                    $
                    {Math.floor(
                      expenses.reduce((sum, exp) => sum + exp.amount, 0) /
                        groupData.totalMembers
                    )}
                  </p>
                  <p className="text-gray-400 text-sm">per member</p>
                </div>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowGroupAnalytics(false)}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debt Simplification Modal */}
      {showDebtSimplification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-lg"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              ⚖️ Debt Simplification
            </h3>

            <div className="space-y-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-3">
                  Optimized Settlements
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">John owes Jane</span>
                    <span className="text-red-400 font-bold">$25.00</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Bob owes Alice</span>
                    <span className="text-red-400 font-bold">$15.50</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Charlie owes John</span>
                    <span className="text-red-400 font-bold">$30.25</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-800 p-4 rounded-lg">
                <h4 className="text-white font-semibold mb-3">Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Transactions</span>
                    <span className="text-teal-400">3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Total Amount</span>
                    <span className="text-teal-400">$70.75</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Simplified from</span>
                    <span className="text-yellow-400">8 transactions</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-900 bg-opacity-30 border border-green-500 p-4 rounded-lg">
                <p className="text-green-400 text-sm">
                  💡 Debt simplified! Reduced from 8 to 3 transactions, saving 5
                  transfers.
                </p>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  console.log("Send settlement reminders");
                }}
                className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Send Reminders
              </button>
              <button
                onClick={() => setShowDebtSimplification(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Add New Expense
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, title: e.target.value })
                  }
                  placeholder="Expense title"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, amount: e.target.value })
                  }
                  placeholder="0.00"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Category
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, category: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
                >
                  <option value="Food">Food</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Accommodation">Accommodation</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Description
                </label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional description"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none h-20"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, date: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddExpense}
                className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Add Expense
              </button>
              <button
                onClick={() => setShowAddExpense(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Add New Member
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Role
                </label>
                <select
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none"
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="MEMBER">Member</option>
                  <option value="MODERATOR">Moderator</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddSingleMember}
                className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Add Member
              </button>
              <button
                onClick={() => setShowAddMember(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Members Modal */}
      {showBulkAddMembers && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Bulk Add Members
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Email Addresses (one per line)
                </label>
                <textarea
                  value={bulkEmails}
                  onChange={(e) => setBulkEmails(e.target.value)}
                  placeholder="member1@example.com&#10;member2@example.com&#10;member3@example.com"
                  className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none h-32"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleBulkAddMembers}
                className="flex-1 bg-teal-500 text-white py-2 rounded-lg hover:bg-teal-600 transition-colors"
              >
                Add All Members
              </button>
              <button
                onClick={() => setShowBulkAddMembers(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Export Options Modal */}
      {showExportOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Export Group Data
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleExportData("pdf")}
                className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
              >
                📄 Export as PDF
              </button>
              <button
                onClick={() => handleExportData("excel")}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                📊 Export as Excel
              </button>
              <button
                onClick={() => handleExportData("csv")}
                className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
              >
                📋 Export as CSV
              </button>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowExportOptions(false)}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Leave Group Confirmation Modal */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Leave Group?
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to leave "{groupData.name}"? You won't be
              able to see group expenses or chat messages after leaving.
            </p>

            <div className="flex space-x-3">
              <button
                onClick={handleLeaveGroup}
                className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                Leave Group
              </button>
              <button
                onClick={() => setShowLeaveConfirm(false)}
                className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Friends Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div
            style={{ background: "#1b1b1b" }}
            className="p-6 rounded-xl w-full max-w-md"
          >
            <h3 className="text-xl font-semibold text-white mb-4">
              Invite Friends to Group
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableFriends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {friend.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <p className="text-white font-medium">{friend.name}</p>
                      <p className="text-gray-400 text-sm">{friend.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleInviteFriend(friend.id)}
                    className="bg-teal-500 text-white px-3 py-1 rounded hover:bg-teal-600 transition-colors"
                  >
                    Invite
                  </button>
                </div>
              ))}
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetail;
