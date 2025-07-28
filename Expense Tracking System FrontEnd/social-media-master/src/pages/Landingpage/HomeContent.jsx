import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { getExpensesSummaryAction } from "../../Redux/Expenses/expense.action";
import RecentExpenses from "./RecentExpenses";
import Overview from "./Overview";
import QuickAccess from "./QuickAccess";
import MonthlyReport from "./MonthlyReport";
import { useMediaQuery } from "@mui/material";
import ExpensesDashboard from "./ExpensesDashboard";

const HomeContent = () => {
  const dispatch = useDispatch();
  const isSmallScreen = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    dispatch(getExpensesSummaryAction());
  }, []);
  return (
    <div className="bg-[#1b1b1b]">
      <div className="h-[50px] bg-[#1b1b1b]"></div>
      <div
        className="flex flex-col items-center w-full md:w-[calc(100vw-370px)]  md:h-[calc(100vh-100px)] p-2 md:p-4 rounded-lg border border-black bg-[rgb(11,11,11)] shadow-sm"
        style={{
          height: isSmallScreen ? "auto" : "calc(100vh - 100px)",
        }}
      >
        <ExpensesDashboard />
        {/* <div className="flex flex-col md:flex-row justify-center items-start gap-4 mt-3 md:mt-10">
          <Overview />
          <RecentExpenses />
        </div>
        <QuickAccess />
        <MonthlyReport /> */}
      </div>
      <div className="w-full md:w-[calc(100vw-350px)] h-[25px] bg-[#1b1b1b]"></div>
    </div>
  );
};

export default HomeContent;
