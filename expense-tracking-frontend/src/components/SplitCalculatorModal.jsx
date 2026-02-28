import React from "react";

const SplitCalculatorModal = ({
  show,
  onClose,
  splitCalculator,
  setSplitCalculator,
  groupData,
  handleCalculateSplit,
}) => {
  if (!show) return null;
  return (
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
                <h4 className="text-white font-semibold mb-2">Split Result:</h4>
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
            onClick={onClose}
            className="flex-1 bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SplitCalculatorModal;
