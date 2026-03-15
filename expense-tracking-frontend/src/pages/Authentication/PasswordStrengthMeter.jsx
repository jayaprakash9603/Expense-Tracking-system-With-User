import React from "react";

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: "None", color: "bg-gray-600" };
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score: 1, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score: 2, label: "Fair", color: "bg-yellow-500" };
      case 3:
        return { score: 3, label: "Good", color: "bg-blue-500" };
      case 4:
        return { score: 4, label: "Strong", color: "bg-green-500" };
      default:
        return { score: 0, label: "None", color: "bg-gray-600" };
    }
  };

  const strength = getStrength(password);

  const renderSegments = () => {
    return [1, 2, 3, 4].map((index) => {
      const isActive = index <= strength.score;
      const segmentColor = isActive ? strength.color : "bg-gray-700";
      return (
        <div
          key={index}
          className={`h-2 w-full rounded-sm transition-all duration-300 ${segmentColor}`}
        />
      );
    });
  };

  const passStr = password || "";

  return (
    <div 
      className={`flex flex-col gap-1.5 transition-all duration-300 overflow-hidden ${
        password ? 'max-h-[200px] opacity-100 mt-3' : 'max-h-0 opacity-0 mt-0'
      }`}
    >
      <div className="flex justify-between items-center px-1">
        <span className="text-xs text-gray-400 font-medium tracking-wide">
          Password Strength
        </span>
        <span
          className={`text-xs font-semibold tracking-wide ${
            strength.score >= 3 ? "text-green-400" : "text-gray-300"
          }`}
        >
          {strength.label}
        </span>
      </div>
      <div className="flex gap-1.5 w-full">{renderSegments()}</div>
      
      {/* Dynamic Checklist / Guidelines */}
      <div className="text-[11px] text-gray-500 mt-1 flex flex-col gap-1">
        <div className={`flex items-center gap-1.5 ${passStr.length >= 8 ? 'text-green-500' : ''}`}>
          <span className="text-lg leading-none">&bull;</span> At least 8 characters
        </div>
        <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(passStr) ? 'text-green-500' : ''}`}>
          <span className="text-lg leading-none">&bull;</span> One uppercase letter
        </div>
        <div className={`flex items-center gap-1.5 ${/[0-9]/.test(passStr) ? 'text-green-500' : ''}`}>
          <span className="text-lg leading-none">&bull;</span> One number
        </div>
        <div className={`flex items-center gap-1.5 ${/[^A-Za-z0-9]/.test(passStr) ? 'text-green-500' : ''}`}>
          <span className="text-lg leading-none">&bull;</span> One special character
        </div>
      </div>
    </div>
  );
};

export default PasswordStrengthMeter;
