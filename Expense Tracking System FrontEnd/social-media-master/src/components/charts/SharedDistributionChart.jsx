import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

// Generic Distribution Chart (Pie + right side chips)
// Props:
// - data: payment shape [{method,totalAmount,percentage,color,icon}] when mode='payment'
//         category shape [{name,amount,percentage,color,icon}] when mode='category'
// - mode: 'payment' | 'category'
// - amountKey override (optional)
// - nameKey override (optional)
// - colorsFallback: array of colors used when item.color missing
// - currencySymbol: '₹' by default
const SharedDistributionChart = ({
  data = [],
  mode = "payment",
  colorsFallback = [],
  currencySymbol = "₹",
}) => {
  const { colors, mode: themeMode } = useTheme();
  const safe = Array.isArray(data) ? data : [];
  const amountKey = mode === "payment" ? "totalAmount" : "amount";
  const nameKey = mode === "payment" ? "method" : "name";

  const formatPercentage = (value) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
      return "0.00";
    }
    const rounded = Number(parsed.toFixed(2));
    if (rounded === 0 && parsed > 0) {
      return "0.01";
    }
    return rounded.toFixed(2);
  };

  return (
    <div
      className="chart-container"
      style={{
        background: colors.primary_bg,
        border: `1px solid ${colors.border_color}`,
        borderRadius: "12px",
        padding: "24px",
      }}
    >
      <div className="chart-header">
        <h3
          style={{
            color: colors.primary_text,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: "0 0 4px 0",
          }}
        >
          <PieChartIcon size={20} />{" "}
          {mode === "payment"
            ? "Payment Methods Distribution"
            : "Category Distribution"}
        </h3>
        <div
          className="chart-subtitle"
          style={{
            color: themeMode === "dark" ? "#888" : "#666",
            fontSize: "14px",
          }}
        >
          Spending breakdown by{" "}
          {mode === "payment" ? "payment methods" : "categories"}
        </div>
      </div>
      <div
        className="distribution-content"
        style={{
          display: "flex",
          gap: "32px",
          marginTop: "16px",
          alignItems: "flex-start",
        }}
      >
        <div
          className="distribution-left"
          style={{
            flex: "1",
            maxWidth: "50%",
          }}
        >
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <Pie
                data={safe}
                cx="50%"
                cy="50%"
                outerRadius={120}
                innerRadius={64}
                paddingAngle={2}
                dataKey={amountKey}
              >
                {safe.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.color ||
                      colorsFallback[index % colorsFallback.length] ||
                      "#8884d8"
                    }
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [
                  `${currencySymbol}${Number(value).toLocaleString()}`,
                  name,
                ]}
                contentStyle={{
                  backgroundColor: themeMode === "dark" ? "#1a1a1a" : "#ffffff",
                  border: `1px solid ${colors.primary_accent}`,
                  borderRadius: "8px",
                  color: colors.primary_text,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div
          className="distribution-right"
          style={{
            flex: "1",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
            maxHeight: "360px",
            overflowY: "auto",
            alignContent: "start",
          }}
        >
          {safe.map((item, idx) => (
            <div
              key={idx}
              className="category-chip"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                minHeight: "48px",
                background: themeMode === "dark" ? "#1a1a1a" : "#f5f5f5",
                border: `1px solid ${colors.border_color}`,
                borderRadius: "8px",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  themeMode === "dark" ? "#2a2a2a" : "#e8e8e8";
                e.currentTarget.style.borderColor = colors.primary_accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  themeMode === "dark" ? "#1a1a1a" : "#f5f5f5";
                e.currentTarget.style.borderColor = colors.border_color;
              }}
            >
              <div
                className="chip-left"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flex: "1",
                  minWidth: 0,
                }}
              >
                <span
                  className="chip-icon"
                  aria-hidden="true"
                  style={{
                    background:
                      item.color ||
                      colorsFallback[idx % colorsFallback.length] ||
                      "#555",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <span
                    className="chip-icon-text"
                    style={{
                      fontSize: "14px",
                    }}
                  >
                    {item.icon}
                  </span>
                </span>
                <span
                  className="chip-name"
                  title={item[nameKey]}
                  style={{
                    color: colors.primary_text,
                    fontSize: "13px",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item[nameKey]}
                </span>
              </div>
              <div
                className="chip-right"
                style={{
                  flexShrink: 0,
                }}
              >
                <span
                  className="chip-pct"
                  style={{
                    color: colors.primary_accent,
                    fontSize: "13px",
                    fontWeight: 600,
                  }}
                >
                  {formatPercentage(item.percentage)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SharedDistributionChart;
