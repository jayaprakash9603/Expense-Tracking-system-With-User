import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const MenuItem = ({ name, path, icon, onClick, setIsSidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = location.pathname === path;

  const handleClick = () => {
    if (onClick) {
      onClick(); // Custom action (e.g., logout)
    } else if (path === "/expenses") {
      navigate(path, { state: { fromMenu: true } });
    } else {
      navigate(path);
    }
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  return (
    <div
      onClick={handleClick}
      className={`flex items-center justify-start w-full max-w-[360px] h-[52px] cursor-pointer rounded-lg overflow-hidden transition-all duration-200 ${
        isActive ? "bg-[#29282b] text-[#00DAC6] font-bold" : "text-white"
      } pl-6`} // Added pl-6 for left indent
    >
      <span className="flex items-center flex-row-reverse px-3 w-full">
        <div className="flex-grow text-left font-bold text-[16px] leading-[20px] whitespace-nowrap">
          {name}
        </div>

        {icon && (
          <img
            src={icon}
            alt={`${name} icon`}
            className="w-[22px] h-[22px] object-contain mr-3"
            style={{
              filter: isActive
                ? "invert(44%) sepia(97%) saturate(1671%) hue-rotate(160deg) brightness(92%) contrast(101%)"
                : "invert(100%)",
            }}
          />
        )}
      </span>
    </div>
  );
};

export default MenuItem;
