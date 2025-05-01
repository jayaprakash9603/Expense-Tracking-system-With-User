import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import { getExpensesSummaryAction } from "../../Redux/Expenses/expense.action";
import RecentExpenses from "./RecentExpenses";
import Overview from "./Overview";
import QuickAccess from "./QuickAccess";
import MonthlyReport from "./MonthlyReport";

const HomeContent = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getExpensesSummaryAction());
  }, [dispatch]);

  return (
    <div className="bg-[#1b1b1b]">
      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>

      <div
        className="flex flex-col items-center"
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
        {/* Horizontal layout for both divs */}
        <div
          className="flex flex-row justify-center items-start gap-4"
          style={{ marginTop: "40px" }}
        >
          {/* First box - 600px */}
          <Overview />

          {/* Second box - 800px */}
          <RecentExpenses />
        </div>

        {/* Third box - 1420px */}
        <QuickAccess />

        {/* Fourth box - same width as third (1420px) */}
        <MonthlyReport />
      </div>

      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>
    </div>
  );
};

export default HomeContent;
