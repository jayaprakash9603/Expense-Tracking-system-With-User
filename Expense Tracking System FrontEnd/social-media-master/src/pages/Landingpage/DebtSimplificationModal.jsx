import React from "react";

const DebtSimplificationModal = ({
  onClose,
  settlements = [],
  summary = {},
}) => (
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
            {settlements.length > 0 ? (
              settlements.map((s, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <span className="text-gray-300">
                    {s.from} owes {s.to}
                  </span>
                  <span className="text-red-400 font-bold">${s.amount}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-400">No settlements found.</div>
            )}
          </div>
        </div>
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-white font-semibold mb-3">Summary</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">Total Transactions</span>
              <span className="text-teal-400">
                {summary.totalTransactions || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Total Amount</span>
              <span className="text-teal-400">
                ${summary.totalAmount || "0.00"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Simplified from</span>
              <span className="text-yellow-400">
                {summary.originalTransactions || 0} transactions
              </span>
            </div>
          </div>
        </div>
        <div className="bg-green-900 bg-opacity-30 border border-green-500 p-4 rounded-lg">
          <p className="text-green-400 text-sm">
            💡 Debt simplified! Reduced from {summary.originalTransactions || 0}{" "}
            to {summary.totalTransactions || 0} transactions, saving{" "}
            {(summary.originalTransactions || 0) -
              (summary.totalTransactions || 0)}{" "}
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
          onClick={onClose}
          className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default DebtSimplificationModal;
