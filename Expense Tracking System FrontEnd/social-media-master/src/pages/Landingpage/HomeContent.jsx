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
      <div className="h-[50px] bg-[#1b1b1b]"></div>

      <div
        className="flex flex-col items-center md:w-[calc(100vw-370px)] sm:w-full sm:h-auto sm:p-2"
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
        <div
          className="flex md:flex-row flex-col justify-center items-start gap-4 md:mt-10 sm:mt-5"
          style={{ marginTop: "20px" }}
        >
          <Overview />
          <RecentExpenses />
        </div>

        <QuickAccess />
        <MonthlyReport />
      </div>

      <div className="md:w-[calc(100vw-350px)] sm:w-full h-[50px] bg-[#1b1b1b]"></div>
    </div>
  );
};

export default HomeContent;
