// components/Box.js
import React from "react";

const Box = ({
  width,
  height,
  backgroundColor = "rgb(27, 27, 27)",
  borderColor = "rgb(56, 56, 56)",
  style = {},
  children,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        width: width,
        height: height,
        backgroundColor: backgroundColor,
        borderRadius: "8px",
        boxShadow: "rgba(0, 0, 0, 0.08) 0px 0px 0px",
        border: `1px solid ${borderColor}`,
        opacity: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default Box;
