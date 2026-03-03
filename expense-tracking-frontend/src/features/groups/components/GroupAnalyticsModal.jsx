import React from "react";

const GroupAnalyticsModal = ({
  budgetTracker,
  groupData,
  expenses,
  onClose,
}) => {
  return (
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
              {groupData.members.slice(0, 3).map((member) => (
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
            onClick={onClose}
            className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupAnalyticsModal;
