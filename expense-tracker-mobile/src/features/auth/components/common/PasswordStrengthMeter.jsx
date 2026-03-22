import React, { useMemo } from "react";
import { cn } from "@/lib/utils";

function calculateStrength(password) {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) score++;
  return score;
}

const STRENGTH_LABELS = ["", "Weak", "Fair", "Good", "Strong", "Excellent"];
const STRENGTH_COLORS = [
  "bg-muted",
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-400",
  "bg-green-600",
];

export function PasswordStrengthMeter({ password }) {
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors",
              i <= strength ? STRENGTH_COLORS[strength] : "bg-muted"
            )}
          />
        ))}
      </div>
      <p
        className={cn(
          "text-xs",
          strength <= 2 ? "text-destructive" : "text-muted-foreground"
        )}
      >
        {STRENGTH_LABELS[strength]}
      </p>
    </div>
  );
}

export default PasswordStrengthMeter;
