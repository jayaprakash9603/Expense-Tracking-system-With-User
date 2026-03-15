export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

export const getPaymentMethodColor = (method) => {
  const colors = {
    cash: "#14b8a6",
    debit: "#2196F3",
    credit: "#FF9800",
    default: "#757575"
  };
  return colors[method?.toLowerCase()] || colors.default;
};

export const getBillTypeIcon = (type) => {
  return type === "gain" ? "trending_up" : "trending_down";
};

export const getBillTypeColor = (type) => {
  return type === "gain" ? "#14b8a6" : "#f44336";
};