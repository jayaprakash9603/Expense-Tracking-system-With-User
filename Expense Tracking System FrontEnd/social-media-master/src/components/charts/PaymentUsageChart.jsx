import React from "react";
import {
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  ResponsiveContainer,
} from "recharts";
import { BarChart3 } from "lucide-react";

// Payment Methods Usage Analysis (Pareto-like: amount bars + cumulative % + transactions)
// Expects data: [{ method, totalAmount, transactions, cumulative(optional) }]
// We compute cumulative internally if not provided.
const PaymentUsageChart = ({ data = [] }) => {
  const total = data.reduce((s, d) => s + (d.totalAmount || 0), 0) || 0;
  const sorted = [...data].sort(
    (a, b) => (b.totalAmount || 0) - (a.totalAmount || 0)
  );
  let running = 0;
  const composed = sorted.map((d) => {
    running += d.totalAmount || 0;
    return {
      ...d,
      cumulative: total ? +((running / total) * 100).toFixed(1) : 0,
    };
  });

  return (
    <div className="chart-container">
      <div className="chart-header">
        <h3>
          <BarChart3 size={20} /> Payment Methods Usage Analysis
        </h3>
        <div className="chart-subtitle">
          Bars: amount • Yellow line: cumulative % • Red line: transactions
        </div>
      </div>
      <ResponsiveContainer width="100%" height={430}>
        <ComposedChart
          data={composed}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
          <XAxis
            dataKey="method"
            stroke="#888"
            fontSize={12}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis yAxisId="left" stroke="#888" fontSize={12} />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#888"
            domain={[0, 100]}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis yAxisId="rightTx" orientation="right" hide={true} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "cumulative") return [`${value}%`, "Cumulative %"];
              if (name === "transactions")
                return [
                  `${Number(value || 0).toLocaleString()}`,
                  "Transactions",
                ];
              if (name === "totalAmount")
                return [
                  `₹${Number(value || 0).toLocaleString()}`,
                  "Amount (₹)",
                ];
              return [value, name];
            }}
            contentStyle={{
              backgroundColor: "#1a1a1a",
              border: "1px solid #14b8a6",
              borderRadius: "8px",
              color: "#fff",
            }}
          />
          <Legend />
          <Bar
            yAxisId="left"
            dataKey="totalAmount"
            fill="#06d6a0"
            name="Amount (₹)"
            radius={[4, 4, 0, 0]}
          />
          <Line
            yAxisId="rightTx"
            type="monotone"
            dataKey="transactions"
            stroke="#ff6b6b"
            strokeWidth={2}
            name="Transactions"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="cumulative"
            stroke="#ffb703"
            strokeWidth={2}
            name="Cumulative %"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PaymentUsageChart;
