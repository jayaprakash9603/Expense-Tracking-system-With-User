import React from "react";

const History = () => {
  return (
    <div className="bg-[#1b1b1b]">
      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b]"></div>

      <div
        className="flex flex-col justify-between items-center flex-shrink-1 flex-grow-1 align-self-stretch"
        style={{
          width: "calc(100vw - 370px)",
          height: "calc(100vh - 100px)",
          backgroundColor: "rgb(11, 11, 11)",
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          border: "1px solid rgb(0, 0, 0)",
          opacity: 1,
        }}
      ></div>
      <div className="w-[calc(100vw-350px)] h-[50px] bg-[#1b1b1b] "></div>
    </div>
  );
};

export default History;
