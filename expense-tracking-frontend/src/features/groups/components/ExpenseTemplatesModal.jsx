import React from "react";

const ExpenseTemplatesModal = ({ templates = [], onClose, onUseTemplate }) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div
      style={{ background: "#1b1b1b" }}
      className="p-6 rounded-xl w-full max-w-md"
    >
      <h3 className="text-xl font-semibold text-white mb-4">
        📋 Expense Templates
      </h3>
      <div className="space-y-3">
        {templates.length > 0 ? (
          templates.map((template) => (
            <div
              key={template.id}
              className="bg-gray-800 p-4 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
              onClick={() => onUseTemplate && onUseTemplate(template)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-white font-semibold">{template.name}</h4>
                  <p className="text-gray-400 text-sm">
                    {template.description}
                  </p>
                  <p className="text-gray-500 text-xs">{template.category}</p>
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
          ))
        ) : (
          <div className="text-gray-400">No templates found.</div>
        )}
      </div>
      <div className="flex space-x-3 mt-6">
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

export default ExpenseTemplatesModal;
