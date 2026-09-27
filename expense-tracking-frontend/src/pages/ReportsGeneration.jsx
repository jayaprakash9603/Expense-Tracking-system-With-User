import React, { useState } from "react";
import ExpensesEmail from "./ExpensesEmail";
import { AppSelect } from "../components/ui";

// import ExpenseSummaryEmailSender from "./ExpenseSummaryEmailSender";
import "../Styles/ReportsGeneration.css";
import ExpenseTableParent from "./ExpenseTableParent";
import SearchExpenses from "./SearchExpenses/SearchExpenses";
// import SearchSummary from "./SearchSummary/SearchSummary";
import SearchAudits from "./SearchAudits/SearchAudits";

const ReportsGeneration = () => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [Url, setUrl] = useState(null);

  const handleDropdownChange = (value) => {
    setSelectedReport(value);
    setUrl(null);
  };

  return (
    <div className="main-container">
      <div>
        <div className="select-div">
          <AppSelect
            className="select-dropdown"
            value={selectedReport || "select"}
            onValueChange={handleDropdownChange}
            options={[
              { value: "select", label: "Select Report" },
              { value: "expenseReport", label: "Expense Report" },
              { value: "searchExpenses", label: "Search Expenses" },
              { value: "searchAudits", label: "Search Audits" },
            ]}
            ariaLabel="Select report"
            size="small"
            displayEmpty={false}
          />
        </div>
        <div className="component-div">
          {selectedReport === "select" && <></>}

          {selectedReport === "expenseReport" && <ExpensesEmail />}

          {selectedReport === "searchExpenses" && (
            <SearchExpenses Url={Url} setUrl={setUrl} />
          )}

          {selectedReport === "searchAudits" && (
            <SearchAudits Url={Url} setUrl={setUrl} />
          )}
        </div>
        <div className="display-expenses">
          <ExpenseTableParent
            Url={Url}
            setUrl={setUrl}
            className="w-100"
            selectedReport={selectedReport}
          />
        </div>
      </div>
    </div>
  );
};

export default ReportsGeneration;
