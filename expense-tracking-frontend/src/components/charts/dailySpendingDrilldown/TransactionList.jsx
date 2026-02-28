import React from "react";
import PropTypes from "prop-types";
import {
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

import ExpenseCard from "./ExpenseCard";
import { buildScrollbarSx } from "../../../utils/dailySpendingDrilldownUtils";

const TransactionList = ({
  title,
  isEmpty,
  emptyMessage = "No transactions found.",
  pagedExpenses,
  colors,
  dateFormat,
  currencySymbol,
  locale,
  cardHeight,
  listGapPx,
  listHeightPx,
  useScroll,
  showListControls,
  shouldPaginate,
  rangeText,
  rowsPerPage,
  rowsPerPageOptions,
  onPrevPage,
  onNextPage,
  canPrev,
  canNext,
  onRowsPerPageChange,
  showScrollHint,
}) => {
  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Typography sx={{ fontWeight: 900, fontSize: 13, mb: 1 }}>
        {title}
      </Typography>

      {isEmpty ? (
        <Typography sx={{ opacity: 0.75, fontSize: 12 }}>
          {emptyMessage}
        </Typography>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: `${listGapPx}px`,
              height: `${listHeightPx}px`,
              justifyContent: "flex-start",
              overflowY: useScroll ? "scroll" : "hidden",
              overflowX: "hidden",
              WebkitOverflowScrolling: "touch",
              overscrollBehavior: "contain",
              touchAction: "pan-y",
              pr: useScroll ? 0.5 : 0,
              ...(useScroll ? buildScrollbarSx({ colors }) : null),
            }}
          >
            {pagedExpenses.map((exp, idx) => (
              <ExpenseCard
                key={exp.id ?? `${exp.name}-${idx}`}
                expense={exp}
                colors={colors}
                dateFormat={dateFormat}
                currencySymbol={currencySymbol}
                locale={locale}
                height={cardHeight}
              />
            ))}
          </Box>

          {showListControls ? (
            <Box sx={{ mt: 1, width: "100%", overflowX: "hidden" }}>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto 1fr",
                  alignItems: "center",
                  gap: 1,
                  overflowX: "hidden",
                }}
              >
                <Box />

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    flexWrap: "nowrap",
                    justifyContent: "center",
                  }}
                >
                  {shouldPaginate ? (
                    <IconButton
                      onClick={onPrevPage}
                      disabled={!canPrev}
                      size="small"
                      sx={{
                        border: `1px solid ${colors?.border_color}`,
                        borderRadius: 2,
                        color: colors?.primary_text,
                        "&.Mui-disabled": { opacity: 0.35 },
                      }}
                    >
                      <NavigateBeforeIcon fontSize="small" />
                    </IconButton>
                  ) : null}

                  <Typography
                    sx={{
                      fontSize: 12,
                      fontWeight: 900,
                      color: colors?.secondary_text || colors?.primary_text,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {rangeText}
                  </Typography>

                  {shouldPaginate ? (
                    <IconButton
                      onClick={onNextPage}
                      disabled={!canNext}
                      size="small"
                      sx={{
                        border: `1px solid ${colors?.border_color}`,
                        borderRadius: 2,
                        color: colors?.primary_text,
                        "&.Mui-disabled": { opacity: 0.35 },
                      }}
                    >
                      <NavigateNextIcon fontSize="small" />
                    </IconButton>
                  ) : null}
                </Box>

                <Box
                  sx={{
                    justifySelf: "end",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <FormControl size="small" sx={{ minWidth: 72 }}>
                    <Select
                      value={rowsPerPage}
                      onChange={(e) => onRowsPerPageChange?.(e.target.value)}
                      renderValue={(v) => String(v)}
                      sx={{
                        color: colors?.primary_text,
                        borderRadius: 2,
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: colors?.border_color,
                        },
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: `${
                            colors?.primary_accent || "#5b7fff"
                          }66`,
                        },
                        "& .MuiSvgIcon-root": {
                          color: colors?.primary_text,
                        },
                      }}
                    >
                      {rowsPerPageOptions.map((n) => (
                        <MenuItem key={n} value={n}>
                          {n}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Box>
          ) : null}

          {showScrollHint ? (
            <Box sx={{ mt: 1, width: "100%", overflowX: "hidden" }}>
              <Typography
                sx={{
                  opacity: 0.7,
                  fontSize: 12,
                  textAlign: "center",
                }}
              >
                Scroll inside the list to view more
              </Typography>
            </Box>
          ) : null}
        </>
      )}
    </Box>
  );
};

TransactionList.propTypes = {
  title: PropTypes.string.isRequired,
  isEmpty: PropTypes.bool.isRequired,
  emptyMessage: PropTypes.string,
  pagedExpenses: PropTypes.array.isRequired,
  colors: PropTypes.object,
  dateFormat: PropTypes.string.isRequired,
  currencySymbol: PropTypes.string.isRequired,
  locale: PropTypes.string,
  cardHeight: PropTypes.number.isRequired,
  listGapPx: PropTypes.number.isRequired,
  listHeightPx: PropTypes.number.isRequired,
  useScroll: PropTypes.bool.isRequired,
  showListControls: PropTypes.bool.isRequired,
  shouldPaginate: PropTypes.bool.isRequired,
  rangeText: PropTypes.string.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  rowsPerPageOptions: PropTypes.arrayOf(PropTypes.number).isRequired,
  onPrevPage: PropTypes.func.isRequired,
  onNextPage: PropTypes.func.isRequired,
  canPrev: PropTypes.bool.isRequired,
  canNext: PropTypes.bool.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired,
  showScrollHint: PropTypes.bool.isRequired,
};

export default TransactionList;
