import React, { useMemo } from "react";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { Box, Typography } from "@mui/material";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import { toNumber } from "../../../utils/dailySpendingDrilldownUtils";

const ArrowIcon = ({ direction = "down", color = "#fff" }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: "inline", verticalAlign: "middle", marginBottom: "-2px" }}
  >
    {direction === "up" ? (
      <path
        d="M8 14V2M8 2L3 7M8 2L13 7"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ) : (
      <path
        d="M8 2V14M8 14L3 9M8 14L13 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    )}
  </svg>
);

ArrowIcon.propTypes = {
  direction: PropTypes.oneOf(["up", "down"]),
  color: PropTypes.string,
};

const clampText = {
  display: "-webkit-box",
  WebkitLineClamp: 2,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
};

const ExpenseCard = ({
  expense,
  colors,
  dateFormat,
  currencySymbol,
  locale,
  height = 124,
}) => {
  const type = String(expense?.type || "loss").toLowerCase();
  const isGain = !(type === "outflow" || type === "loss");
  const amountColor = isGain ? "#06d6a0" : "#ff4d4f";

  const dateValue = useMemo(() => {
    const dt = expense?.date;
    if (!dt) return "";
    const parsed = dayjs(dt);
    return parsed.isValid() ? parsed.format(dateFormat) : "";
  }, [dateFormat, expense?.date]);

  const primaryLeft = String(expense?.category || "").trim();
  const primaryRight = String(expense?.paymentMethod || "").trim();
  const comments = String(expense?.comments || "").trim();

  return (
    <Box
      sx={{
        borderRadius: 2,
        border: `1px solid ${colors?.border_color}`,
        background: colors?.primary_bg,
        p: 1.25,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        height,
        flexShrink: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
          borderBottom: `1px solid ${colors?.border_color}`,
          pb: 0.75,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 900,
            color: colors?.primary_text,
            minWidth: 0,
            ...clampText,
          }}
          title={expense?.name}
        >
          {expense?.name}
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.75,
            flex: "0 0 auto",
          }}
        >
          <ArrowIcon direction={isGain ? "up" : "down"} color={amountColor} />
          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 900,
              color: amountColor,
              whiteSpace: "nowrap",
            }}
          >
            {currencySymbol}
            {toNumber(expense?.amount).toLocaleString(locale || undefined, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
            })}
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Typography sx={{ fontSize: 11, fontWeight: 800, opacity: 0.8 }}>
          {dateValue}
        </Typography>
        <Typography
          sx={{
            fontSize: 11,
            fontWeight: 800,
            color: isGain ? "#06d6a0" : "#ff4d4f",
            textTransform: "uppercase",
            letterSpacing: 0.4,
          }}
        >
          {isGain ? "GAIN" : "LOSS"}
        </Typography>
      </Box>

      {(primaryLeft || primaryRight) && (
        <Box sx={{ display: "flex", gap: 1.25, color: colors?.secondary_text }}>
          {primaryLeft ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
                flex: 1,
              }}
            >
              <LocalOfferIcon
                sx={{ fontSize: 14, color: colors?.primary_accent }}
              />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={primaryLeft}
              >
                {primaryLeft}
              </Typography>
            </Box>
          ) : null}

          {primaryRight ? (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.75,
                minWidth: 0,
                flex: 1,
              }}
            >
              <AccountBalanceWalletIcon
                sx={{
                  fontSize: 14,
                  color: colors?.secondary_accent || colors?.primary_accent,
                }}
              />
              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 0,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={primaryRight}
              >
                {primaryRight}
              </Typography>
            </Box>
          ) : null}
        </Box>
      )}

      <Box
        sx={{
          borderTop: `1px solid ${colors?.border_color}`,
          pt: 0.75,
          display: "flex",
          gap: 0.75,
          color: colors?.secondary_text,
          alignItems: "flex-start",
        }}
      >
        <ChatBubbleOutlineIcon sx={{ fontSize: 14, mt: "2px" }} />
        <Typography
          sx={{
            fontSize: 11,
            lineHeight: 1.4,
            opacity: 0.9,
            ...clampText,
          }}
          title={comments}
        >
          {comments || "No comments"}
        </Typography>
      </Box>
    </Box>
  );
};

ExpenseCard.propTypes = {
  expense: PropTypes.object.isRequired,
  colors: PropTypes.object,
  dateFormat: PropTypes.string.isRequired,
  currencySymbol: PropTypes.string.isRequired,
  locale: PropTypes.string,
  height: PropTypes.number,
};

export default ExpenseCard;
