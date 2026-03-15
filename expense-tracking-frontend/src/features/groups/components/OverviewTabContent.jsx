import React from "react";

const OverviewTabContent = ({
  groupData,
  expenses,
  chatMessages,
  setShowSplitCalculator,
  setShowBudgetTracker,
  setShowExpenseTemplates,
  setShowRecurringExpenses,
  setShowGroupAnalytics,
  setShowDebtSimplification,
  formatTime,
}) => {
  // Add null checks and default values
  const safeGroupData = groupData || {};
  const safeExpenses = expenses || [];
  const safeChatMessages = chatMessages || [];

  return (
    <div
      className="space-y-6 overflow-y-auto space-x-2 pr-4"
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: "#14b8a6 #2a2a2a",
        maxHeight: "560px",
        paddingRight: "1rem", // Ensures space for scrollbar
      }}
    >
      {/* Group Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Total Members",
            value: safeGroupData.totalMembers || 0,
            valueClass: "text-white",
          },
          {
            label: "Total Expenses",
            value: safeExpenses.length,
            valueClass: "text-white",
          },
          {
            label: "Total Amount",
            value: `$${safeExpenses.reduce(
              (sum, exp) => sum + (exp.amount || 0),
              0
            )}`,
            valueClass: "text-white",
          },
          {
            label: "Your Balance",
            value: "$60",
            valueClass: "text-teal-400",
          },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            style={{ background: "#1b1b1b" }}
            className="p-4 rounded-xl"
          >
            <h3 className="text-gray-400 text-sm">{stat.label}</h3>
            <p className={`text-2xl font-bold ${stat.valueClass}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
        <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            {
              label: "Split Calculator",
              icon: "🧮",
              onClick: () => setShowSplitCalculator(true),
              color: "bg-blue-500 hover:bg-blue-600",
            },
            {
              label: "Budget Tracker",
              icon: "💰",
              onClick: () => setShowBudgetTracker(true),
              color: "bg-green-500 hover:bg-green-600",
            },
            {
              label: "Templates",
              icon: "📋",
              onClick: () => setShowExpenseTemplates(true),
              color: "bg-purple-500 hover:bg-purple-600",
            },
            {
              label: "Recurring",
              icon: "🔄",
              onClick: () => setShowRecurringExpenses(true),
              color: "bg-orange-500 hover:bg-orange-600",
            },
            {
              label: "Analytics",
              icon: "📊",
              onClick: () => setShowGroupAnalytics(true),
              color: "bg-pink-500 hover:bg-pink-600",
            },
            {
              label: "Debt Simplify",
              icon: "⚖️",
              onClick: () => setShowDebtSimplification(true),
              color: "bg-indigo-500 hover:bg-indigo-600",
            },
          ].map((action) => (
            <button
              key={action.label}
              onClick={action.onClick}
              className={`${action.color} text-white p-4 rounded-lg transition-colors`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{action.icon}</div>
                <div className="font-semibold">{action.label}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity - Sticky when scrolled to top */}
      <div
        style={{
          background: "#1b1b1b",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
        className="p-6 rounded-xl"
      >
        <h3 className="text-xl font-semibold text-white mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {[
            ...safeChatMessages.slice(-10),
            {
              id: "custom1",
              username: "System",
              type: "expense_added",
              message: "Group created",
              timestamp: new Date(),
            },
            {
              id: "custom2",
              username: "Alice",
              type: "member_joined",
              message: "Alice joined the group",
              timestamp: new Date(),
            },
            {
              id: "custom3",
              username: "Bob",
              type: "expense_added",
              message: "Bob added expense: Dinner ($45)",
              timestamp: new Date(),
            },
            {
              id: "custom4",
              username: "Carol",
              type: "member_left",
              message: "Carol left the group",
              timestamp: new Date(),
            },
            {
              id: "custom5",
              username: "David",
              type: "member_joined",
              message: "David joined the group",
              timestamp: new Date(),
            },
            {
              id: "custom6",
              username: "Alice",
              type: "expense_added",
              message: "Alice added expense: Gas ($30)",
              timestamp: new Date(),
            },
            {
              id: "custom7",
              username: "Eve",
              type: "member_joined",
              message: "Eve joined the group",
              timestamp: new Date(),
            },
            {
              id: "custom8",
              username: "Charlie",
              type: "expense_added",
              message: "Charlie added expense: Groceries ($75)",
              timestamp: new Date(),
            },
            {
              id: "custom9",
              username: "Frank",
              type: "member_left",
              message: "Frank left the group",
              timestamp: new Date(),
            },
            {
              id: "custom10",
              username: "Bob",
              type: "expense_added",
              message: "Bob added expense: Hotel ($200)",
              timestamp: new Date(),
            },
          ].map((message, idx) => (
            <div
              key={message.id || idx}
              className="flex items-center space-x-3"
            >
              <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                {message.username &&
                typeof message.username === "string" &&
                message.username.length > 0
                  ? message.username[0]
                  : "?"}
              </div>
              <div className="flex-1">
                <p className="text-gray-300">
                  <span className="font-semibold text-white">
                    {message.username}
                  </span>
                  {message.type === "expense_added"
                    ? " added an expense: "
                    : message.type === "member_joined"
                    ? " joined the group: "
                    : message.type === "member_left"
                    ? " left the group: "
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
};

export default OverviewTabContent;
