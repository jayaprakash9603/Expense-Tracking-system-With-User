import React from "react";
import Left from "./Left.jsx";
import { Outlet } from "react-router";

const Home = () => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#1b1b1b]">
      <div className="md:w-[400px] lg:w-[450px]">
        <Left />
      </div>
      <div className="flex-1">
        <Outlet /> {/* Renders HomeContent or other route components */}
      </div>
    </div>
  );
};

export default Home;
