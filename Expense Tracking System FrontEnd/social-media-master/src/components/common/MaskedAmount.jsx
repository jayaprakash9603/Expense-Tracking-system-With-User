import React from "react";
import { Tooltip, IconButton } from "@mui/material";
import { VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
import { useMasking } from "../../hooks/useMasking";

/**
 * MaskedAmount Component
 * Displays amounts with masking support based on user settings
 *
 * @param {Object} props
 * @param {number} props.amount - The amount to display
 * @param {string} props.currency - Currency symbol (optional)
 * @param {boolean} props.partial - Whether to show partial masking
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.showIcon - Whether to show masking icon
 * @returns {JSX.Element}
 */
const MaskedAmount = ({
  amount,
  currency = "",
  partial = false,
  className = "",
  showIcon = false,
}) => {
  const { formatMaskedAmount, isMasking } = useMasking();

  const displayValue = formatMaskedAmount(amount, currency, partial);

  return (
    <span className={`masked-amount ${className}`}>
      {displayValue}
      {isMasking() && showIcon && (
        <Tooltip title="Amount is masked for privacy">
          <IconButton size="small" sx={{ ml: 0.5, p: 0 }}>
            <VisibilityOffIcon fontSize="small" sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      )}
    </span>
  );
};

export default MaskedAmount;
