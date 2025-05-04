import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import {
  getExpensesAction,
  getExpensesSuggestions,
  getHomeExpensesAction,
} from "../../Redux/Expenses/expense.action";

const QuickAccess = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const handleClick = (route) => {
    if (route == "/expenses") {
      dispatch(getExpensesSuggestions());
    }
    if (route == "/budget/create") {
      navigate("/budget/create");
    }
    navigate(route);
  };

  const handleUplaodFileClick = () => {
    dispatch(getHomeExpensesAction());
  };
  return (
    <div
      style={{
        marginTop: "30px",
        width: "1460px",
        height: "170px",
        borderRadius: "8px",
        border: "1px solid rgb(80, 80, 80)",
        backgroundColor: "rgb(27, 27, 27)",
        borderRadius: "8px",
        boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
        border: "1px solid rgb(56, 56, 56)",
        opacity: 1,
        padding: "16px",
      }}
    >
      <div style={{ width: "100%" }}>
        <p
          style={{
            color: "white",
            fontWeight: "bold",
            fontSize: "18px",
            marginBottom: "2px",
          }}
        >
          Quick Access
        </p>
        <hr
          style={{
            border: "none",
            borderTop: "1px solid rgb(80, 80, 80)",
            width: "100%",
          }}
        />
      </div>
      <div className="flex items-center justify-center space-x-32">
        <div
          className="bg-[#29282b] w-[220px] h-[80px] rounded-lg flex items-center justify-center space-x-4 cursor-pointer"
          style={{
            top: "447px",
            left: "393px",
          }}
          onClick={() => handleClick("/expenses")}
        >
          <div className="w-[48px] h-[48px] bg-[#f11f99] rounded-full flex items-center justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/128/5501/5501384.png"
              alt="Expense Icon"
              className="w-6 h-6"
            />
          </div>

          <div className="text-white font-bold">+ New Expense</div>
        </div>

        <div
          className="bg-[#29282b] w-[220px] h-[80px] rounded-lg flex items-center justify-center space-x-4 cursor-pointer"
          style={{
            top: "447px",
            left: "393px",
          }}
          onClick={() => handleClick("/create")}
        >
          <div className="w-[48px] h-[48px] bg-[#222255] rounded-full flex items-center justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/128/5501/5501384.png"
              alt="Expense Icon"
              className="w-6 h-6"
            />
          </div>

          <div className="text-white font-bold">+ New Expense</div>
        </div>
        <div
          className="bg-[#29282b] w-[220px] h-[80px] rounded-lg flex items-center justify-center space-x-4 cursor-pointer"
          style={{
            top: "447px",
            left: "393px",
          }}
          onClick={() => handleClick("/upload")}
        >
          <div className="w-[48px] h-[48px] bg-[#124241] rounded-full flex items-center justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/128/5501/5501384.png"
              alt="Expense Icon"
              className="w-6 h-6"
            />
          </div>

          <div className="text-white font-bold" onClick={handleUplaodFileClick}>
            + Upload File
          </div>
        </div>
        <div
          className="bg-[#29282b] w-[220px] h-[80px] rounded-lg flex items-center justify-center space-x-4 cursor-pointer"
          style={{
            top: "447px",
            left: "393px",
          }}
          onClick={() => handleClick("/budget/create")}
        >
          <div className="w-[48px] h-[48px] bg-[#682b3b] rounded-full flex items-center justify-center">
            <img
              src="https://cdn-icons-png.flaticon.com/128/2488/2488980.png"
              alt="Expense Icon"
              className="w-6 h-6"
            />
          </div>

          <div className="text-white font-bold">+ New Budget</div>
        </div>
      </div>
    </div>
  );
};

export default QuickAccess;
