import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

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
  const safe = Array.isArray(data) ? data : [];
  const amountKey = mode === "payment" ? "totalAmount" : "amount";
  const nameKey = mode === "payment" ? "method" : "name";

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>
          <PieChartIcon size={20} />{" "}
          {mode === "payment"
            ? "Payment Methods Distribution"
            : "Category Distribution"}
        </h3>
        <div className="chart-subtitle">
          Spending breakdown by{" "}
          {mode === "payment" ? "payment methods" : "categories"}
        </div>
      </div>
      <div className="distribution-content">
        <div className="distribution-left">
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
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #14b8a6",
                  borderRadius: "8px",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="distribution-right">
          {safe.map((item, idx) => (
            <div key={idx} className="category-chip">
              <div className="chip-left">
                <span
                  className="chip-icon"
                  aria-hidden="true"
                  style={{
                    background:
                      item.color ||
                      colorsFallback[idx % colorsFallback.length] ||
                      "#555",
                  }}
                >
                  <span className="chip-icon-text">{item.icon}</span>
                </span>
                <span className="chip-name" title={item[nameKey]}>
                  {item[nameKey]}
                </span>
              </div>
              <div className="chip-right">
                <span className="chip-pct">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SharedDistributionChart;
