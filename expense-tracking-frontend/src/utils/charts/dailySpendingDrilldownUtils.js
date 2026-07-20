import dayjs from "dayjs";

export const toNumber = (value) => {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

export const getExpenseDetails = (expense) => {
  if (!expense) return {};
  return expense.expense || expense.details || expense;
};

export const normalizeExpenseForList = (expense, fallbackType, bucketLabel) => {
  const details = getExpenseDetails(expense);
  const rawAmount =
    details.amount ?? details.netAmount ?? expense.amount ?? expense.total ?? 0;

  const rawNetAmount = details.netAmount ?? details.amount ?? rawAmount;
  const rawCreditDue = details.creditDue ?? expense.creditDue ?? 0;

  const type = String(details.type || expense.type || fallbackType || "")
    .toLowerCase()
    .trim();

  const name =
    details.expenseName ||
    expense.expenseName ||
    expense.name ||
    details.name ||
    "Unknown";

  const date = expense.date || details.date || null;

  const bucket =
    expense.bucket || details.bucket || expense.category || bucketLabel || "";

  const category =
    expense.categoryName ||
    details.categoryName ||
    details.category ||
    expense.category ||
    "";

  const categoryId =
    expense.categoryId ?? details.categoryId ?? details.category_id ?? null;

  const paymentMethod =
    expense.paymentMethodName ||
    details.paymentMethodName ||
    details.paymentMethod ||
    expense.paymentMethod ||
    "";

  const comments =
    details.comments ||
    expense.comments ||
    details.description ||
    expense.description ||
    details.note ||
    expense.note ||
    "";

  return {
    id: expense.id ?? details.id ?? expense.expenseId ?? null,
    expenseId:
      expense.expenseId ??
      details.expenseId ??
      details.id ??
      expense.id ??
      null,
    name,
    amount: Math.abs(toNumber(rawAmount)),
    netAmount: Math.abs(toNumber(rawNetAmount)),
    creditDue: Math.abs(toNumber(rawCreditDue)),
    type,
    date,
    bucket,
    category,
    categoryId,
    categoryName: category,
    paymentMethod,
    comments,
    raw: expense,
  };
};

export const buildScrollbarSx = ({ colors, accent } = {}) => {
  const thumb = accent || colors?.primary_accent || "#5b7fff";
  const border = colors?.border_color || "#2a2a2a";
  const track = "transparent";

  return {
    scrollbarGutter: "stable",
    scrollbarWidth: "thin",
    scrollbarColor: `${thumb} ${track}`,
    "&::-webkit-scrollbar": {
      width: 10,
      height: 10,
    },
    "&::-webkit-scrollbar-track": {
      background: track,
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: `${thumb}AA`,
      borderRadius: 999,
      border: `2px solid ${border}33`,
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: `${thumb}E6`,
    },
  };
};

export const formatDateLabel = (point, locale) => {
  const dateObj = point?.dateObj;
  if (dateObj instanceof Date && !Number.isNaN(dateObj.getTime())) {
    return dateObj.toLocaleDateString(locale || undefined, {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });
  }
  return point?.date || point?.xLabel || "";
};

export const formatExportDate = (value) => {
  if (!value) return "";
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("YYYY-MM-DD") : String(value);
};

export const buildCsv = ({ rows }) => {
  const escape = (value) => {
    const str = String(value ?? "");
    if (/[\n\r\t,\"]/g.test(str)) {
      return `"${str.replace(/\"/g, '""')}"`;
    }
    return str;
  };

  const header = [
    "Expense ID",
    "Expense Name",
    "Payment Method",
    "Amount",
    "Net Amount",
    "Credit Due",
    "Type",
    "Date",
    "Category ID",
    "Category Name",
    "Comments",
  ].join(",");

  const lines = rows.map((row) =>
    [
      escape(row.expenseId ?? row.id ?? ""),
      escape(row.name ?? ""),
      escape(row.paymentMethod ?? ""),
      escape(toNumber(row.amount)),
      escape(toNumber(row.netAmount ?? row.amount)),
      escape(toNumber(row.creditDue)),
      escape(String(row.type ?? "")),
      escape(formatExportDate(row.date)),
      escape(row.categoryId ?? ""),
      escape(row.categoryName ?? row.category ?? ""),
      escape(row.comments ?? ""),
    ].join(",")
  );

  return [header, ...lines].join("\n");
};

export const buildTsvForClipboard = ({ rows }) => {
  const header = [
    "Expense ID",
    "Expense Name",
    "Payment Method",
    "Amount",
    "Net Amount",
    "Credit Due",
    "Type",
    "Date",
    "Category ID",
    "Category Name",
    "Comments",
  ].join("\t");

  const safe = (value) => String(value ?? "").replace(/[\n\r\t]/g, " ");

  const lines = rows.map((row) =>
    [
      safe(row.expenseId ?? row.id ?? ""),
      safe(row.name ?? ""),
      safe(row.paymentMethod ?? ""),
      safe(toNumber(row.amount)),
      safe(toNumber(row.netAmount ?? row.amount)),
      safe(toNumber(row.creditDue)),
      safe(String(row.type ?? "")),
      safe(formatExportDate(row.date)),
      safe(row.categoryId ?? ""),
      safe(row.categoryName ?? row.category ?? ""),
      safe(row.comments ?? ""),
    ].join("\t")
  );

  return [header, ...lines].join("\n");
};
