import React from "react";
import Left from "./Left.jsx";
import Main from "./Main.jsx";
import { Outlet } from "react-router";

const Home = () => {
  return (
    <div className="flex">
      <div className="">
        <Left />
      </div>
      <div className="">
        <Outlet /> {/* This renders the matched route's component */}
      </div>
    </div>
  );
};

export default Home;
