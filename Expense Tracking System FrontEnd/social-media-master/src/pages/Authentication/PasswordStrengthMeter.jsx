import React from "react";

const PasswordStrengthMeter = ({ password }) => {
  const getStrength = (pass) => {
    let score = 0;
    if (!pass) return { score: 0, label: "" };
    if (pass.length > 7) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 0:
      case 1:
        return { score: 25, label: "Weak", color: "bg-red-500" };
      case 2:
        return { score: 50, label: "Fair", color: "bg-yellow-500" };
      case 3:
        return { score: 75, label: "Good", color: "bg-blue-500" };
      case 4:
        return { score: 100, label: "Strong", color: "bg-green-500" };
      default:
        return { score: 0, label: "" };
    }
  };

  const strength = getStrength(password);

  return password ? (
    <div className="mt-2">
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full ${strength.color}`}
          style={{ width: `${strength.score}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-400 mt-1">
        Password Strength: {strength.label}
      </p>
    </div>
  ) : null;
};

export default PasswordStrengthMeter;
