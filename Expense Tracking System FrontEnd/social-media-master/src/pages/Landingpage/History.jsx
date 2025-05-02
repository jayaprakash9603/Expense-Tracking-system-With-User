import React, { useState } from "react";
import ExpensesEmail from "../ExpensesEmail"; // Adjust path as needed
import ExpensesAudits from "../ExpensesAudits"; // Adjust path as needed
import SearchAudits from "../SearchAudits/SearchAudits";
import ExpenseEmail from "./ExpenseEmail";
import ExpenseTableParent from "../ExpenseTableParent";
import ReportsGeneration from "../ReportsGeneration";
import SearchExpenses from "../SearchExpenses/SearchExpenses";

const mockAuditData = [
  {
    userAuditIndex: 1,
    details: "Office Supplies",
    expenseAuditIndex: 101,
    actionType: "Create",
    timestamp: "2025-05-01T10:00:00Z",
  },
  {
    userAuditIndex: 2,
    details: "Travel Expense",
    expenseAuditIndex: 102,
    actionType: "Update",
    timestamp: "2025-05-01T12:00:00Z",
  },
  {
    userAuditIndex: 3,
    details: "Software License",
    expenseAuditIndex: 103,
    actionType: "Delete",
    timestamp: "2025-05-01T14:00:00Z",
  },
  {
    userAuditIndex: 4,
    details: "Client Meeting",
    expenseAuditIndex: 104,
    actionType: "Create",
    timestamp: "2025-05-01T16:00:00Z",
  },
  {
    userAuditIndex: 5,
    details: "Maintenance",
    expenseAuditIndex: 105,
    actionType: "Update",
    timestamp: "2025-05-01T18:00:00Z",
  },
];

const History = () => {
  const [view, setView] = useState("email");
  const [selectedReport, setSelectedReport] = useState(null);
  const [Url, setUrl] = useState(null);

  const handleDropdownChange = (event) => {
    setSelectedReport(event.target.value);
    setUrl(null);
  };
  return (
    <div className="bg-[#1b1b1b]">
      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>

      <div
        className="flex flex-col justify-start items-start flex-shrink-1 flex-grow-1 align-self-stretch"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: "1px solid rgb(0, 0, 0)",
          opacity: 1,
        }}
      >
        <div className=" h-full w-full bg-[#333333] flex">
          <div className="w-1/2 h-full bg-red-500 b">
            <div className="w-full max-w-xs mb-4 ">
              <select
                onChange={handleDropdownChange}
                className="w-full px-4 py-2 bg-[#333333] text-white border border-gray-700 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-600"
              >
                <option value="select" className="bg-black text-white">
                  Select Report
                </option>
                <option value="expenseReport" className="bg-black text-white">
                  Expense Report
                </option>
                <option value="searchExpenses" className="bg-black text-white">
                  Search Expenses
                </option>
                <option value="searchAudits" className="bg-black text-white">
                  Search Audits
                </option>
              </select>
            </div>

            <div className="">
              {selectedReport === "select" && <></>}

              {selectedReport === "expenseReport" && <ExpenseEmail />}

              {/* {selectedReport === "searchExpenses" && (
                <SearchExpenses Url={Url} setUrl={setUrl} />
              )}

              {selectedReport === "searchAudits" && (
                <SearchAudits Url={Url} setUrl={setUrl} />
              )} */}
            </div>
          </div>
          <div className="w-1/2 h-full bg-green-500"></div>
        </div>
      </div>
      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b] "></div>
    </div>
  );
};

export default History;
