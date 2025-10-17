import React from "react";
import { Card } from "@mui/material";

// Layout wrapper for auth pages (login/register)
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#29282b] p-4">
      <Card
        className="w-full max-w-md p-6 sm:p-8 rounded-lg"
        style={{
          backgroundColor: "rgb(27, 27, 27)",
          border: "1px solid rgb(56, 56, 56)",
          borderRadius: "8px",
          boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
          opacity: 1,
        }}
      >
        <div className="flex flex-col items-center mb-6 space-y-2">
          <h1
            className="text-center text-2xl sm:text-3xl font-bold font-[Syncopate]"
            style={{ whiteSpace: "pre-line" }}
          >
            <span style={{ color: "#d8fffb" }}>Ex</span>
            <span style={{ color: "rgb(146, 233, 220)" }}>p</span>
            <span style={{ color: "rgb(0, 218, 196)" }}>en</span>
            <span style={{ color: "rgb(0, 199, 171)" }}>s</span>
            <span style={{ color: "rgb(0, 168, 133)" }}>i</span>
            <span style={{ color: "rgb(0, 137, 102)" }}>o</span>
            <span style={{ color: "#14b8a6" }}> Finance</span>
          </h1>
          <p className="text-center text-sm text-gray-400 max-w-xs">
            Track all your expenses in one place with a simpler way
          </p>
        </div>
        {children}
      </Card>
    </div>
  );
}
