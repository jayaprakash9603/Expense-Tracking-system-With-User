import React from "react";
import { CiFilter } from "react-icons/ci";
import { MdFilterList } from "react-icons/md";
import { BsThreeDots } from "react-icons/bs";
import ExpensesTable from "./ExpensesTable";

const ExpensesView = ({ onNewExpenseClick }) => {
  return (
    <div
      className="flex flex-col justify-between items-center"
      style={{
        width: "calc(100vw - 370px)",
        height: "calc(100vh - 100px)",
        backgroundColor: "rgb(11, 11, 11)",
        borderRadius: "8px",
        boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
        border: "1px solid rgb(0, 0, 0)",
        opacity: 1,
        padding: "20px",
      }}
    >
      <div className="w-full flex-col">
        <div className="w-full flex justify-between items-center">
          <div>
            <p className="text-white font-bold text-5xl">Expenses</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onNewExpenseClick}
              className="bg-[#00dac6] text-black font-bold px-4 py-2 rounded cursor-pointer"
            >
              + New Expense
            </button>
            <div className="w-10 h-10 bg-[#1b1b1b] flex items-center justify-center rounded cursor-pointer">
              <CiFilter className="text-[#00dac6]" />
            </div>
            <div className="w-10 h-10 bg-[#1b1b1b] flex items-center justify-center rounded cursor-pointer">
              <MdFilterList className="text-[#00dac6]" />
            </div>
            <div className="w-10 h-10 bg-[#1b1b1b] flex items-center justify-center rounded cursor-pointer">
              <BsThreeDots className="text-[#00dac6]" />
            </div>
          </div>
        </div>
        <hr className="border-t border-gray-600 w-full mt-4 mb-4" />
      </div>

      <div className="w-full bg-green-500 h-full">
        <ExpensesTable />
      </div>
    </div>
  );
};

export default ExpensesView;
