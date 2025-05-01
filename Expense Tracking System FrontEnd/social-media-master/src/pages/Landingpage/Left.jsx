import React from "react";
import { Avatar } from "@mui/material";
import MenuItem from "./MenuItem";
import { useSelector } from "react-redux";

const Left = () => {
  const { user } = useSelector((state) => state.auth);
  return (
    <div className="w-full md:w-[350px] bg-[#1b1b1b] min-h-screen text-white flex flex-col justify-between items-center py-6">
      {/* Top Section */}
      <div className="flex flex-col items-center w-full">
        {/* Profile */}
        <div className="w-[90%] md:w-[320px] h-[200px] flex flex-col justify-center items-center mb-6">
          <div className="w-24 h-24 mb-3">
            <Avatar
              sx={{ width: "100%", height: "100%" }}
              src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop"
            />
          </div>
          <p className="text-lg font-semibold">
            {user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1)}{" "}
            {user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1)}
          </p>
        </div>

        {/* Menu Items */}
        <div className="flex flex-col items-center w-[90%] md:w-[320px] mb-6">
          <MenuItem
            name="Home"
            path="/home"
            icon="https://cdn-icons-png.flaticon.com/128/25/25694.png"
          />
          <MenuItem
            name="Expenses"
            path="/expenses"
            icon="https://cdn-icons-png.flaticon.com/128/5501/5501384.png"
          />
          <MenuItem
            name="Transactions"
            path="/transactions"
            icon="https://cdn-icons-png.flaticon.com/128/4475/4475436.png"
          />
          <MenuItem
            name="Insights"
            path="/credit-due"
            icon="https://cdn-icons-png.flaticon.com/128/15867/15867059.png"
          />
          <MenuItem
            name="Reports"
            path="/settings"
            icon="https://cdn-icons-png.flaticon.com/128/3094/3094851.png"
          />
          <MenuItem
            name="Budget"
            path="/budget"
            icon="https://cdn-icons-png.flaticon.com/128/2488/2488980.png"
          />
        </div>
      </div>

      {/* Footer Logo Text */}
      <div
        className="mb-4 w-full flex flex-col items-center space-y-2 cursor-pointer"
        onClick={() => console.log("logout")}
      >
        <p
          className="text-center md:text-[24px] font-bold leading-[31px] font-[Syncopate]"
          style={{ width: "90%", whiteSpace: "pre-line", fontSize: "28px" }} // or remove this if setting per-span
        >
          <span style={{ color: "#d8fffb", fontSize: "32px" }}>Ex</span>
          <span style={{ color: "rgb(146, 233, 220)", fontSize: "32px" }}>
            p
          </span>
          <span style={{ color: "rgb(0, 218, 196)", fontSize: "32px" }}>
            en
          </span>
          <span style={{ color: "rgb(0, 199, 171)", fontSize: "32px" }}>s</span>
          <span style={{ color: "rgb(0, 168, 133)", fontSize: "32px" }}>i</span>
          <span style={{ color: "rgb(0, 137, 102)", fontSize: "32px" }}>o</span>
          <span style={{ color: "#14b8a6", fontSize: "32px" }}> Finance</span>
        </p>
      </div>
    </div>
  );
};

export default Left;
