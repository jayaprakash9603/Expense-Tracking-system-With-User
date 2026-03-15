import React from "react";

const ExportOptionsModal = ({ onExport, onClose }) => (
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
          onClick={() => onExport("pdf")}
          className="w-full bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition-colors"
        >
          📄 Export as PDF
        </button>
        <button
          onClick={() => onExport("excel")}
          className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          📊 Export as Excel
        </button>
        <button
          onClick={() => onExport("csv")}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
        >
          📋 Export as CSV
        </button>
      </div>
      <div className="flex space-x-3 mt-6">
        <button
          onClick={onClose}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default ExportOptionsModal;
