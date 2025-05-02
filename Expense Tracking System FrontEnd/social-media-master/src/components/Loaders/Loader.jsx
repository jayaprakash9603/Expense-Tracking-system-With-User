import React from "react";

const Loader = () => {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div className="flex justify-center items-center fixed inset-0 h-screen w-full bg-[#333333]/90 z-[9999]">
        <div className="w-[50px] h-[50px] border-8 border-[#333333] border-t-8 border-t-[#1b1b1b] rounded-full animate-[spin_0.5s_linear_infinite]"></div>
      </div>
    </>
  );
};

export default Loader;
