import React from "react";

const ActivityTabContent = () => (
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
        ].map((activity, index) => {
          const activityMessages = {
            member_joined: (a) => `${a.user} joined the group`,
            expense_added: (a) =>
              `${a.user} added expense: ${a.expense} (${a.amount})`,
            member_left: (a) => `${a.user} left the group`,
            group_created: (a) => `${a.user} created the group`,
          };
          return (
            <div
              key={index}
              style={{ background: "#2a2a2a" }}
              className="p-4 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">
                    {activityMessages[activity.type]
                      ? activityMessages[activity.type](activity)
                      : "Unknown activity"}
                  </p>
                  <p className="text-gray-500 text-sm">{activity.time}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

export default ActivityTabContent;
