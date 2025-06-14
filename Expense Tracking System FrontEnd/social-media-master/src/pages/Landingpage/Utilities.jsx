import { useMediaQuery } from "@mui/material";
import React from "react";
import { useNavigate } from "react-router-dom";

const Utilities = () => {
  const isSmallScreen = useMediaQuery("(max-width: 768px)");
  const navigate = useNavigate();

  const boxData = [
    {
      title: "Box 1",
      description: "Description 1",
      redirectPath: "/component1",
    },
    {
      title: "Box 2",
      description: "Description 2",
      redirectPath: "/component2",
    },
    {
      title: "Box 3",
      description: "Description 3",
      redirectPath: "/component3",
    },
    {
      title: "Box 4",
      description: "Description 4",
      redirectPath: "/component4",
    },
    {
      title: "Box 5",
      description: "Description 5",
      redirectPath: "/component5",
    },
  ];

  return (
    <div className="bg-[#1b1b1b]">
      <div className="h-[50px] bg-[#1b1b1b]"></div>
      <div
        className="flex flex-col items-center w-full md:w-[calc(100vw-370px)]  md:h-[calc(100vh-100px)] p-2 md:p-4 rounded-lg border border-black bg-[rgb(11,11,11)] shadow-sm"
        style={{
          height: isSmallScreen ? "auto" : "calc(100vh - 100px)",
        }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4 pt-[50px]">
          {boxData.map((box, index) => (
            <div
              key={index}
              className="bg-[#29282b] h-[150px] rounded-lg shadow-md flex flex-col justify-center items-center cursor-pointer"
              style={{ width: isSmallScreen ? "300px" : "250px" }}
              onClick={() => navigate(box.redirectPath)}
            >
              <h3 className="text-white text-lg font-bold">{box.title}</h3>
              <p className="text-gray-400 text-sm">{box.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="w-full md:w-[calc(100vw-350px)] h-[25px] bg-[#1b1b1b]"></div>
    </div>
  );
};

export default Utilities;
