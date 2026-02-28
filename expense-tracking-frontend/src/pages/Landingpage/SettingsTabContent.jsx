import React from "react";

const currencyOptions = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "INR", label: "INR (₹)" },
];

const inputFields = [
  {
    label: "Group Name",
    type: "text",
    valueKey: "name",
    inputProps: {
      className:
        "w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none",
    },
  },
  {
    label: "Description",
    type: "textarea",
    valueKey: "description",
    inputProps: {
      className:
        "w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none h-20",
    },
  },
  {
    label: "Currency",
    type: "select",
    valueKey: "currency",
    inputProps: {
      className:
        "w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-none outline-none",
    },
    options: currencyOptions,
  },
];

const checkboxFields = [
  {
    id: "allowInvites",
    label: "Allow members to invite others",
    valueKey: "allowMemberInvites",
  },
  {
    id: "requireApproval",
    label: "Require approval for expenses",
    valueKey: "requireApprovalForExpenses",
  },
];

const SettingsTabContent = ({
  groupSettings,
  setGroupSettings,
  handleSaveSettings,
}) => (
  <div className="space-y-6">
    <div style={{ background: "#1b1b1b" }} className="p-6 rounded-xl">
      <h3 className="text-xl font-semibold text-white mb-4">Group Settings</h3>
      <div className="space-y-4">
        {inputFields.map((field) => (
          <div key={field.label}>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              {field.label}
            </label>
            {field.type === "text" && (
              <input
                type="text"
                value={groupSettings[field.valueKey]}
                onChange={(e) =>
                  setGroupSettings({
                    ...groupSettings,
                    [field.valueKey]: e.target.value,
                  })
                }
                {...field.inputProps}
              />
            )}
            {field.type === "textarea" && (
              <textarea
                value={groupSettings[field.valueKey]}
                onChange={(e) =>
                  setGroupSettings({
                    ...groupSettings,
                    [field.valueKey]: e.target.value,
                  })
                }
                {...field.inputProps}
              />
            )}
            {field.type === "select" && (
              <select
                value={groupSettings[field.valueKey]}
                onChange={(e) =>
                  setGroupSettings({
                    ...groupSettings,
                    [field.valueKey]: e.target.value,
                  })
                }
                {...field.inputProps}
              >
                {field.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            )}
          </div>
        ))}
        {checkboxFields.map((field) => (
          <div key={field.id} className="flex items-center space-x-3">
            <input
              type="checkbox"
              id={field.id}
              checked={groupSettings[field.valueKey]}
              onChange={(e) =>
                setGroupSettings({
                  ...groupSettings,
                  [field.valueKey]: e.target.checked,
                })
              }
              className="w-4 h-4"
            />
            <label htmlFor={field.id} className="text-gray-300">
              {field.label}
            </label>
          </div>
        ))}
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

export default SettingsTabContent;
