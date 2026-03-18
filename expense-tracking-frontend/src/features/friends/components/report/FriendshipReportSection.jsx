import React, { useState, useCallback } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Skeleton,
  Typography,
} from "@mui/material";
import { useTranslation } from "../../../../hooks/useTranslation";
import { useTheme } from "../../../../hooks/useTheme";
import { useDispatch, useSelector } from "react-redux";
import { fetchFriendshipReport } from "../../../../Redux/Friends/friendsActions";
import { REPORT_PAGE_SIZES } from "../../constants/friendsConstants";
import StatusChip from "../shared/StatusChip";

const FriendshipReportSection = () => {
  const { t } = useTranslation();
  const { colors, mode } = useTheme();
  const dispatch = useDispatch();
  const isDark = mode === "dark";
  const skeletonBg = isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.04)";

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [status, setStatus] = useState("all");
  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(0);

  const friendshipReport = useSelector(
    (state) => state.friends?.friendshipReport ?? null
  );
  const loadingFriendshipReport = useSelector(
    (state) => state.friends?.loadingFriendshipReport ?? false
  );

  const friendships = friendshipReport?.friendships ?? [];
  const totalElements = friendshipReport?.totalElements ?? 0;

  const handleGenerate = useCallback(() => {
    const filters = {
      fromDate: fromDate ? new Date(fromDate) : null,
      toDate: toDate ? new Date(toDate) : null,
      status: status !== "all" ? status : null,
      page,
      size: pageSize,
    };
    dispatch(fetchFriendshipReport(filters));
  }, [dispatch, fromDate, toDate, status, page, pageSize]);

  const handlePageChange = (_, newPage) => {
    setPage(newPage);
    if (friendshipReport) {
      dispatch(
        fetchFriendshipReport({
          fromDate: fromDate ? new Date(fromDate) : null,
          toDate: toDate ? new Date(toDate) : null,
          status: status !== "all" ? status : null,
          page: newPage,
          size: pageSize,
        })
      );
    }
  };

  const handlePageSizeChange = (e) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setPage(0);
  };

  const getFriendName = (row) => {
    const r = row.recipient || row.requester || row;
    return [r.firstName, r.lastName].filter(Boolean).join(" ").trim() || r.name || "?";
  };

  const getAccessLevel = (row) => {
    return (
      row.recipientAccess ||
      row.requesterAccess ||
      row.accessLevel ||
      "NONE"
    );
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: { xs: 1.5, sm: 2 },
          alignItems: "center",
        }}
      >
        <TextField
          type="date"
          size="small"
          label={t("friends.report.fromDate")}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            flex: { xs: "1 1 calc(50% - 6px)", sm: "0 0 auto" },
            minWidth: { xs: 0, sm: 160 },
            bgcolor: colors.card_bg,
            "& .MuiOutlinedInput-root": {
              color: colors.primary_text,
              "& fieldset": { borderColor: colors.border_color },
            },
          }}
        />
        <TextField
          type="date"
          size="small"
          label={t("friends.report.toDate")}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{
            flex: { xs: "1 1 calc(50% - 6px)", sm: "0 0 auto" },
            minWidth: { xs: 0, sm: 160 },
            bgcolor: colors.card_bg,
            "& .MuiOutlinedInput-root": {
              color: colors.primary_text,
              "& fieldset": { borderColor: colors.border_color },
            },
          }}
        />
        <FormControl size="small" sx={{ flex: { xs: "1 1 calc(50% - 6px)", sm: "0 0 auto" }, minWidth: { xs: 0, sm: 140 } }}>
          <InputLabel sx={{ color: colors.secondary_text }}>
            {t("friends.report.status")}
          </InputLabel>
          <Select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            label={t("friends.report.status")}
            sx={{
              bgcolor: colors.card_bg,
              color: colors.primary_text,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.border_color,
              },
            }}
          >
            <MenuItem value="all">{t("friends.report.allStatuses")}</MenuItem>
            <MenuItem value="ACCEPTED">{t("friends.status.ACCEPTED")}</MenuItem>
            <MenuItem value="PENDING">{t("friends.status.PENDING")}</MenuItem>
            <MenuItem value="REJECTED">{t("friends.status.REJECTED")}</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ flex: { xs: "1 1 calc(50% - 6px)", sm: "0 0 auto" }, minWidth: { xs: 0, sm: 100 } }}>
          <InputLabel sx={{ color: colors.secondary_text }}>
            {t("friends.report.pageSize")}
          </InputLabel>
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            label={t("friends.report.pageSize")}
            sx={{
              bgcolor: colors.card_bg,
              color: colors.primary_text,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: colors.border_color,
              },
            }}
          >
            {REPORT_PAGE_SIZES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          fullWidth={false}
          onClick={handleGenerate}
          disabled={loadingFriendshipReport}
          sx={{
            flex: { xs: "1 1 100%", sm: "0 0 auto" },
            bgcolor: colors.primary_accent,
            "&:hover": { bgcolor: `${colors.primary_accent}dd` },
          }}
        >
          {t("friends.report.generate")}
        </Button>
      </Box>

      {loadingFriendshipReport && (
        <Box sx={{ mt: 2 }}>
          <TableContainer
            sx={{
              bgcolor: colors.card_bg,
              borderRadius: 2,
              border: `1px solid ${colors.border_color}`,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><Skeleton width="60%" sx={{ bgcolor: skeletonBg }} /></TableCell>
                  <TableCell><Skeleton width="40%" sx={{ bgcolor: skeletonBg }} /></TableCell>
                  <TableCell><Skeleton width="40%" sx={{ bgcolor: skeletonBg }} /></TableCell>
                  <TableCell><Skeleton width="50%" sx={{ bgcolor: skeletonBg }} /></TableCell>
                  <TableCell><Skeleton width="50%" sx={{ bgcolor: skeletonBg }} /></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton width="80%" sx={{ bgcolor: skeletonBg }} /></TableCell>
                    <TableCell><Skeleton width="60%" height={24} sx={{ borderRadius: 4, bgcolor: skeletonBg }} /></TableCell>
                    <TableCell><Skeleton width="50%" sx={{ bgcolor: skeletonBg }} /></TableCell>
                    <TableCell><Skeleton width="70%" sx={{ bgcolor: skeletonBg }} /></TableCell>
                    <TableCell><Skeleton width="70%" sx={{ bgcolor: skeletonBg }} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {!loadingFriendshipReport && !friendshipReport && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
          }}
        >
          <Typography sx={{ color: colors.secondary_text }}>
            {t("friends.report.generatePrompt")}
          </Typography>
        </Box>
      )}

      {!loadingFriendshipReport && friendshipReport && friendships.length === 0 && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 200,
          }}
        >
          <Typography sx={{ color: colors.secondary_text }}>
            {t("friends.report.generatePrompt")}
          </Typography>
        </Box>
      )}

      {!loadingFriendshipReport && friendships.length > 0 && (
        <TableContainer
          sx={{
            bgcolor: colors.card_bg,
            borderRadius: 2,
            border: `1px solid ${colors.border_color}`,
            overflowX: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <Table size="small" sx={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{ color: colors.secondary_text, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {t("friends.report.columns.friendName")}
                </TableCell>
                <TableCell sx={{ color: colors.secondary_text, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {t("friends.report.columns.status")}
                </TableCell>
                <TableCell sx={{ color: colors.secondary_text, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {t("friends.report.columns.accessLevel")}
                </TableCell>
                <TableCell sx={{ color: colors.secondary_text, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {t("friends.report.columns.since")}
                </TableCell>
                <TableCell sx={{ color: colors.secondary_text, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {t("friends.report.columns.lastActivity")}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {friendships.map((row) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ color: colors.primary_text }}>
                    {getFriendName(row)}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={row.status || "ACCEPTED"} size="small" />
                  </TableCell>
                  <TableCell sx={{ color: colors.primary_text }}>
                    {getAccessLevel(row)}
                  </TableCell>
                  <TableCell sx={{ color: colors.secondary_text }}>
                    {row.createdAt
                      ? new Date(row.createdAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                  <TableCell sx={{ color: colors.secondary_text }}>
                    {row.updatedAt
                      ? new Date(row.updatedAt).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={totalElements}
            page={page}
            onPageChange={handlePageChange}
            rowsPerPage={pageSize}
            onRowsPerPageChange={(e) => {
              handlePageSizeChange(e);
            }}
            rowsPerPageOptions={REPORT_PAGE_SIZES}
            sx={{
              color: colors.secondary_text,
              borderTop: `1px solid ${colors.border_color}`,
              "& .MuiTablePagination-selectIcon": { color: colors.primary_text },
            }}
          />
        </TableContainer>
      )}
    </Box>
  );
};

export default FriendshipReportSection;
